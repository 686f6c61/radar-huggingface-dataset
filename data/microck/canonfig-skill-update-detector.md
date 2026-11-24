# Microck/canonfig-skill-update-detector

## Resumen

Canonfig Guard: Skill Update es un clasificador binario de texto desarrollado por Microck, afinado a partir de `answerdotai/ModernBERT-large`. Su función es evaluar propuestas de modificación de ficheros de habilidades de agentes de IA (como `SKILL.md` o `AGENTS.md`) comparándolas contra una edición aprobada previamente fijada por el operador. El modelo predice si una edición se mantiene dentro del alcance aprobado (`0`: COMPATIBLE) o si redirige el fichero fuera de dicho alcance (`1`: RISKY_UPDATE).

El modelo está diseñado para ejecutarse en CPU y se distribuye como un checkpoint de investigación. El propio autor advierte de que no superó la cualificación de desarrollo (`qualified: false`), no ha sido evaluado sobre el conjunto de aceptación independiente sellado y no está certificado para bloqueo autónomo. Debe tratarse como un detector experimental de aviso y triaje, no como un mecanismo de seguridad en producción.

La relevancia del modelo reside en su enfoque: la detección de inyección de prompts y de manipulaciones de ficheros de configuración de agentes mediante comparación diferencial contra una versión aprobada, en lugar de análisis de contenido aislado. Con 1,6 GB de repositorio y pesos en float32 de aproximadamente 1,5 GiB, es desplegable en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (`ModernBertForSequenceClassification`, 28 capas, hidden size 1024, 16 cabezas de atención) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Segmento aprobado hasta 640 tokens + diff hasta 384 tokens; longitud máxima observada en entrenamiento/evaluación: 1.027 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (pesos); MIT (scripts incluidos) |
| Formato de pesos | safetensors (`checkpoint/model.safetensors`, float32, ~1,5 GiB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `answerdotai/ModernBERT-large` en su variante `ModernBertForSequenceClassification` con dos etiquetas, sobre la revisión fijada `45bb4654a4d5aaff24dd11d4781fa46d39bf8c13`. La entrada se construye en el brazo `pair` con forma `short`: el primer segmento contiene el texto aprobado (hasta 640 tokens, con recorte que conserva las primeras 12 líneas y 8 líneas a cada lado de cada bloque modificado cuando el fichero excede el límite); el segundo segmento contiene el diff unificado generado con `difflib.unified_diff` con 3 líneas de contexto, truncado a 384 tokens. La secuencia combinada es `[CLS] + segmento_1 + [SEP] + segmento_2 + [SEP]`.

El autor describe el checkpoint como un estudiante destilado de ModernBERT-large con pérdida de fuentes equilibrada (`equal-source-loss`). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Los umbrales operativos se congelaron sobre un panel de calibración de 492 actualizaciones (355 de escritores de validación independientes y 137 revisiones públicas del historial de mantenedores de Git), con 119 casos riesgosos y 373 benignos.

## Capacidades

- Clasificación binaria de actualizaciones de ficheros de habilidades de agentes: `0` (COMPATIBLE) frente a `1` (RISKY_UPDATE).
- Puntuación continua de riesgo (score) además de la etiqueta, con umbrales de `block` (score >= 0,7668958821389218) y `warn` (score >= 0,011397446367288672).
- Comparación diferencial contra una edición aprobada con verificación de digest SHA-256 tanto del fichero aprobado como del checkpoint.
- Detección de redirección de alcance en ficheros tipo `SKILL.md` y `AGENTS.md`.
- Ejecución en CPU con PyTorch 2.8.0+cpu, sin necesidad de GPU.
- Interfaz CLI con salida JSON (`score`, `verdict`, `first_changed_line`) y servidor local Guard HTTP v1 mediante el subcomando `serve`.
- Modo offline (`HF_HUB_OFFLINE=1`) para entornos aislados.
- Control de hilos de ejecución (`--threads` con valores 1, 2 o 4).
- Atajo para entradas idénticas (`old == new`) que devuelve score 0.0 directamente.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido; es exclusivamente un clasificador.

## Casos de uso

- Triaje de actualizaciones de habilidades en pipelines de agentes: antes de aplicar una edición a un `SKILL.md` aprobado, el modelo puntúa el diff y emite un veredicto de aviso o bloqueo, integrándose como paso previo a la escritura en disco.
- Detección de inyección de prompts en ficheros de configuración: el modelo compara la propuesta contra la edición aprobada y detecta redirecciones de alcance que podrían introducir instrucciones maliciosas en el fichero de habilidad.
- Auditoría de cambios en repositorios de agentes: el servidor Guard HTTP v1 permite conectar el modelo a un flujo de revisión local que valida cada propuesta contra una versión fijada por el operador.
- Investigación en seguridad de agentes: el checkpoint sirve como artefacto de investigación para estudiar detección diferencial de manipulación de ficheros de configuración, con métricas de desarrollo publicadas en `benchmarks.json`.
- Verificación en entornos sin GPU: al ejecutarse en CPU con dependencias fijadas, puede desplegarse en estaciones de trabajo o contenedores sin acelerador para validar ediciones antes de su aplicación.
- Control de integridad en flujos de CI: el CLI con salida JSON y verificación de SHA-256 permite incorporar la puntuación como paso de validación en pipelines que gestionan ficheros de habilidades versionados.
- Filtrado previo en sistemas de aprobación humana: el umbral `warn` (score >= 0,011397446367288672) permite derivar a revisión manual las propuestas sospechosas sin bloquear automáticamente.

## Benchmarks y rendimiento

Métricas de diagnóstico de desarrollo sobre el panel de calibración de 492 actualizaciones (119 riesgosas, 373 benignas), según la información disponible:

| Acción | Regla de score | Resultado en panel de calibración |
|---|---|---|
| `block` | score >= 0,7668958821389218 | 113/119 riesgosas bloqueadas, 0/373 benignas bloqueadas (486/492, 98,78%) |
| `warn` (incluye block) | score >= 0,011397446367288672 | 116/119 riesgosas avisadas, 3/373 benignas avisadas |
| `allow` | score < 0,011397446367288672 | Resto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que estas métricas son diagnósticos de desarrollo y que el modelo no ha sido evaluado sobre el conjunto de aceptación independiente sellado.

## Requisitos de hardware

- VRAM: no requiere GPU; los pesos en float32 ocupan aproximadamente 1,5 GiB y la inferencia está diseñada para CPU.
- GPU recomendadas: no aplica; el modelo está pensado para ejecución en CPU.
- Cabe en GPU de consumo: sí, aunque no es su modo de despliegue previsto; los pesos float32 (~1,5 GiB) caben en cualquier GPU con al menos 2 GB de memoria.
- Opciones de despliegue: CLI propia (`scan.py` con subcomandos `scan` y `serve`), servidor local Guard HTTP v1 integrado, y ejecución mediante PyTorch 2.8.0+cpu con transformers 5.10.2, tokenizers 0.22.2, safetensors 0.8.0, numpy 2.4.6 y scipy 1.17.1. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el servidor realiza un calentamiento sobre un par de glosario fijo antes de aceptar tráfico; en la información disponible se muestra un ejemplo de `warmup_seconds: 4.83`. No se publican cifras de latencia por petición ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canonfig Guard: Skill Update | no disponible (ModernBERT-large, 28 capas) | 640 + 384 tokens (máx. observado 1.027) | Clasificación binaria de actualizaciones de ficheros de habilidades | Apache-2.0 | Hugging Face |
| Microck/canonfig-skill-file-detector | no disponible | no disponible | Detección de ficheros de habilidad en primeras instalaciones | no disponible en la información | Hugging Face |
| answerdotai/ModernBERT-large | no disponible | no disponible | Modelo base encoder para clasificación y tareas de comprensión | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: `qualified: false`; no superó la cualificación de desarrollo ni fue evaluado sobre el conjunto de aceptación independiente sellado.
- No está certificado para un 98 % de precisión ni para bloqueo autónomo; debe usarse como detector experimental de aviso y triaje.
- Solo admite inglés; no se documenta soporte multilingüe.
- El umbral `warn` es muy bajo (0,011397446367288672), lo que puede generar avisos sobre ediciones benignas (3/373 en el panel de calibración).
- El umbral `block` deja pasar 6 de 119 casos riesgosos en el panel de calibración (113/119 bloqueados).
- Requiere una edición aprobada previa con digest SHA-256 verificado; para primeras instalaciones sin edición previa debe usarse `Microck/canonfig-skill-file-detector`.
- El servidor Guard HTTP v1 vincula un único fichero aprobado, tipo y ruta relativa por proceso, ya que solo transmite los bytes propuestos.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgo en la información disponible.
- Licencia Apache-2.0 para los pesos y MIT para los scripts incluidos; no se documentan restricciones adicionales para uso comercial, pero la naturaleza experimental del checkpoint desaconseja su uso en producción sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/Microck/canonfig-skill-update-detector
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Modelo complementario para primeras instalaciones: https://huggingface.co/Microck/canonfig-skill-file-detector
