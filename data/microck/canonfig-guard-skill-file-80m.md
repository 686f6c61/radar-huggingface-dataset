# Microck/canonfig-guard-skill-file-80m

## Resumen

Canonfig Guard: Skill File 80M es un clasificador de texto de seguridad desarrollado por Microck, afinado a partir del encoder `patronus-studio/wolf-defender-prompt-injection-edge`. Su función concreta es escanear un fichero Markdown UTF-8 —típicamente `SKILL.md` o `AGENTS.md`— antes de instalarlo en un agente, y señalar instrucciones que parezcan redirigir al agente fuera de la tarea declarada en el propio fichero. Resuelve un problema acotado pero relevante en el ecosistema de agentes: la cadena de suministro de "skills" o ficheros de instrucciones que el agente carga en tiempo de ejecución.

El modelo se apoya en una arquitectura ModernBERT (encoder) con una cabeza de clasificación, sumando 79.903.132 parámetros entre encoder y cabeza. Está diseñado explícitamente para ejecutarse en CPU (la verificación del autor usó unos 688 MiB de memoria pico de proceso en Linux ARM64 con PyTorch 2.8.0+cpu), lo que lo hace desplegable en entornos sin GPU como paso previo a la instalación de una skill.

Es relevante ahora porque la superficie de ataque de los agentes basados en LLM incluye cada vez más artefactos de texto que se incorporan al contexto sin revisión humana. Un detector ligero, determinista y de bajo coste computacional permite insertar una comprobación automática en pipelines de instalación. La contrapartida es que sus métricas publicadas son medidas de desarrollo y el propio autor reconoce que el rendimiento en un conjunto de aceptación independiente no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) con cabeza de clasificación; pesos separados `edge/model.safetensors`, `task-identity-4.safetensors`, `product-control-4.safetensors` |
| Parametros totales | 79.903.132 (encoder Edge + cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas solapadas de 512 tokens; longitud máxima del encoder no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; ejecución de referencia en CPU con PyTorch fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 para encoder y cabezas; MIT para scripts de escáner, cargador y servidor HTTP |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `patronus-studio/wolf-defender-prompt-injection-edge` (revisión `a65713895aafa398e71f151f50d33449b477b4c9`), un encoder ModernBERT orientado a detección de prompt injection. Sobre esa base, Microck añade dos cabezas de "work-product": `task-identity-4.safetensors` y `product-control-4.safetensors`, que se combinan con el encoder Edge para producir la decisión final. El escáner procesa el fichero con ventanas solapadas de 512 tokens y devuelve la puntuación de ventana más alta, junto con un veredicto y un número de línea en la salida JSON.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables de forma habitual a un encoder de clasificación). Sí se documentan las fuentes de datos auxiliares usadas en el entrenamiento o transferencia de la cabeza `task-identity`: plantillas FLAN de Google Research (Apache-2.0), CLINC150/OOS de Larson et al. (CC BY 3.0) y SLURP de Bastianelli et al. (texto CC BY 4.0, audio excluido). La evaluación se realizó con ejemplos de redirección redactados por el autor y ficheros benignos de dos fuentes, una de las cuales también aportó datos de calibración de umbrales.

## Capacidades

- Clasificación binaria de seguridad sobre un único fichero Markdown UTF-8 (`SKILL.md`, `AGENTS.md` u similar): detecta instrucciones que redirigen al agente fuera de la tarea declarada.
- Procesamiento por ventanas solapadas de 512 tokens con agregación por máximo, apto para ficheros más largos que la ventana del encoder.
- Salida estructurada en JSON con veredicto y número de línea de la ventana sospechosa.
- Dos umbrales operativos configurables: bloqueo (block) y aviso (warning).
- Ejecución en CPU sin GPU, con huella de memoria moderada (~688 MiB pico en la verificación del autor).
- Servidor HTTP incluido en el repositorio para integración como servicio.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Comprobación previa a la instalación de skills en agentes: el escáner se ejecuta sobre `SKILL.md` antes de que el agente lo cargue y bloquea o marca el fichero según el umbral, evitando que instrucciones maliciosas entren en el contexto del agente.
- Puerta de calidad en CI/CD de repositorios de agentes: integración del escáner como paso de pipeline que falla la build si un fichero de instrucciones supera el umbral de bloqueo, con el número de línea en el log para revisión.
- Servicio HTTP interno de moderación de artefactos: el servidor incluido permite exponer el detector como endpoint que otros sistemas consultan antes de aceptar un fichero de skill de un proveedor externo.
- Auditoría de skills ya desplegadas: ejecución en lote sobre un directorio de ficheros Markdown para localizar candidatos a revisión manual, usando el umbral de aviso para ampliar la cobertura.
- Entornos de desarrollo sin GPU: al correr en CPU con ~688 MiB, puede instalarse en estaciones de trabajo, contenedores ligeros o runners de CI sin acelerador.
- Filtro de segunda opinión tras revisión humana: con el umbral de aviso (38/50 redirecciones detectadas, 9/178 benignos marcados) sirve como capa de señalización para que un revisor humano priorice ficheros, no como decisión automática única.

## Benchmarks y rendimiento

| Decisión | Redirecciones detectadas | Ejemplos benignos marcados |
|---|---:|---:|
| Umbral de bloqueo | 25/50 (50,0 %) | 0/178 (0,0 %) |
| Umbral de aviso | 38/50 (76,0 %) | 9/178 (5,1 %) |

Precisión en el umbral de bloqueo: 203/228 (89,0 %). Los recuentos de aviso incluyen los bloqueos. La evaluación usó ejemplos de redirección redactados por el autor y ficheros benignos de dos fuentes, una de las cuales también aportó datos de calibración de umbrales. Son medidas de desarrollo; el rendimiento en un conjunto de aceptación independiente no está verificado. En el umbral de bloqueo el modelo deja pasar la mitad de los ejemplos de redirección.

## Requisitos de hardware

- VRAM: no requiere GPU; la ejecución de referencia es en CPU con PyTorch 2.8.0+cpu.
- Memoria de proceso: ~688 MiB pico en la verificación del autor (Linux ARM64, Python 3.11).
- GPU recomendadas: no aplica; cualquier GPU compatible con PyTorch podría ejecutarlo, pero no es el objetivo de diseño.
- Cabe en cualquier equipo consumer: sí, en CPU; el repo ocupa 0,3 GB.
- Despliegue: scripts propios del repositorio (`scan.py`), servidor HTTP incluido, Hugging Face CLI para descarga; soporte de vLLM, llama.cpp, Ollama o TGI no disponible (es un encoder de clasificación, no un modelo generativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canonfig Guard: Skill File 80M | 79.903.132 | ventanas de 512 tokens | Clasificación de redirecciones en ficheros de skill | Apache 2.0 (encoder/cabezas), MIT (scripts) | Hugging Face |
| patronus-studio/wolf-defender-prompt-injection-edge (base) | no disponible en la información | no disponible | Detección de prompt injection | Apache 2.0 (según atribución del autor) | Hugging Face |
| Canonfig Guard: Skill Update 396M | no disponible en la información (nombre sugiere ~396M) | no disponible | Detección de cambios en actualizaciones de skill | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- En el umbral de bloqueo detecta solo el 50 % de las redirecciones del conjunto de evaluación; no debe usarse como única barrera de seguridad.
- Las métricas son medidas de desarrollo con ejemplos redactados por el autor y datos de calibración de una de las fuentes benignas; el rendimiento en un conjunto independiente no está verificado.
- Solo procesa inglés; ficheros en otros idiomas quedan fuera de su ámbito declarado.
- Diseñado para un único fichero Markdown UTF-8; no cubre otros formatos ni flujos multi-fichero.
- Riesgo de falsos positivos en el umbral de aviso (5,1 % de benignos marcados), lo que puede generar fricción si se usa como bloqueo.
- Riesgo de falsos negativos ante redirecciones formuladas de forma distinta a los ejemplos de entrenamiento; no hay datos sobre robustez ante evasión adversarial.
- Licencia mixta: Apache 2.0 para pesos del encoder y cabezas, MIT para los scripts; conviene revisar `edge/LICENSE`, `edge/model-notice.txt` y `canonfig-license.txt` antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- No es un modelo generativo: no sirve para generar texto, código ni razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Microck/canonfig-guard-skill-file-80m
- Modelo base: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-edge
- Modelo relacionado (Skill Update 396M): https://huggingface.co/Microck/canonfig-guard-skill-update-396m
- Benchmarks del autor: https://huggingface.co/Microck/canonfig-guard-skill-file-80m/blob/main/benchmarks.json
- FLAN (Google Research): https://github.com/google-research/FLAN
- CLINC150 / OOS eval: https://github.com/clinc/oos-eval
- SLURP: https://github.com/pswietojanski/slurp
