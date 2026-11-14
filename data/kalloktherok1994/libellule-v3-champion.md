# KallokTherok1994/libellule-v3-champion

## Resumen

Libellule v3 — Champion es un repositorio de archivo publicado por KallokTherok1994 que documenta el artefacto ganador de la campaña interna LIBELLULE_ECO_FT. No se trata de un modelo base entrenado desde cero, sino de un conjunto de adaptadores LoRA (tres semillas: seed11, seed23, seed37) acompañados de un arnés de scripts Python de evaluación y enrutado. El autor lo describe explícitamente como "el último ejemplar conocido" del champion de producción, creado el 2026-11-13 tras auditar 40 jobs de la campaña (19 completados, 17 con error, 4 cancelados).

El repositorio se encuentra en estado "EN ATTENTE des fichiers locaux": los pesos y scripts existen en el disco local del propietario (con evidencia de una comprobación de gate G5 y un archivo LOCK_HARNESS.json), pero nunca se han subido al Hub. Por tanto, los archivos descargables no están disponibles en el momento de redactar esta ficha, y el valor del repositorio es principalmente documental: preserva la receta, los hashes SHA256 esperados y las conclusiones del audit.

La relevancia técnica es limitada pero instructiva. El audit revela que la receta real del LoRA v3 (r=16, alpha=16, dropout=0, 16 target_modules all-linear) difiere de la receta de referencia K8 bloqueada (r en {4,8}, q_proj+v_proj, dropout 0,05), y que el veredicto estadístico K7 fue NON_PROMU (v3 +4 neto frente a la base, p=0,3438). Lo validado en producción es la "garde" (el enrutador), no el adaptador LoRA. El repositorio usa licencia Apache 2.0 y está etiquetado con `tool-calling` y `lora`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un modelo base no especificado (adaptadores de bajo rango) |
| Parametros totales | no disponible (depende del modelo base, no declarado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la vía GGUF/Ollama se describe como abandonada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptadores LoRA (PEFT); los pesos no están subidos al Hub |
| Receta LoRA | r=16, alpha=16, dropout=0, 16 target_modules (all-linear) |
| Semillas incluidas | seed11, seed23, seed37 |
| Estado del repo | archivado, pendiente de subida de archivos locales |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre un modelo base cuyo nombre no se declara en la información disponible. La receta efectiva de v3 emplea rango 16, alpha 16, dropout 0 y 16 módulos objetivo de tipo all-linear, lo que la separa de la receta K8 de referencia bloqueada (rango en {4,8}, solo q_proj y v_proj, dropout 0,05). El autor advierte que v3 es "un artefacto de producción, no la receta de referencia", lo que implica que su reproducibilidad no está garantizada por el protocolo K8.

El entrenamiento se enmarca en la campaña LIBELLULE_ECO_FT, de la que se documentan 40 jobs con un alto índice de fallo (17 errores, 4 cancelados). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El repositorio incluye referencias a un arnés de evaluación compuesto por varios scripts (`router_garde.py`, `juge3_v3_20261111.py`, `garde_validate.py`, `k7_2branches.py`, `driver_campagne.py`, `package_integration.py`), de los cuales solo el enrutador (`router_garde.py`, SHA256 `0e044db6`) se describe como "activo validado, EN PROD (+8 net, 0 regresión)". La validación estadística K7 concluyó NON_PROMU para el LoRA.

## Capacidades

- Generación de texto y adaptación de estilo/dominio mediante LoRA sobre el modelo base (capacidades heredadas del base, no especificadas).
- Tool calling: el repositorio está etiquetado con `tool-calling` y el arnés incluye un enrutador (`router_garde.py`) validado en producción.
- Evaluación automatizada: scripts de juicio (`juge3_v3_20261111.py`) y validación (`garde_validate.py`) para puntuar salidas.
- Enrutado de dos ramas: script `k7_2branches.py` para comparación A/B entre variantes.
- Empaquetado e integración: `package_integration.py` para preparar el artefacto.
- Capacidades multilingües: no disponibles (los idiomas no se declaran; la documentación está en francés).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Auditoría de campañas de fine-tuning: el repositorio sirve como plantilla para documentar el estado de una campaña (jobs completados, errores, cancelados) y preservar hashes SHA256 de los artefactos. Adecuado porque incluye tablas de verificación y un LOCK_HARNESS.json de referencia.
- Reproducción de experimentos LoRA: los scripts del arnés permiten reejecutar la evaluación K7 y comparar el adaptador v3 contra la base. Útil para investigadores que quieran replicar el veredicto NON_PROMU.
- Despliegue de adaptadores en producción con vLLM: el autor indica que la vía de producción es PeftModel + garde o vLLM con `--enable-lora`. Adecuado para servir el adaptador junto al modelo base con aislamiento de la capa de enrutado.
- Integración de tool calling en pipelines: el enrutador validado (+8 net, 0 regresión) puede incorporarse como capa de decisión en sistemas que requieran selección de herramientas.
- Estudio de metodología de evaluación estadística: el contraste entre "scores v1 obsoletos" (37/46, 33/46 con scorer laxo) y las referencias v2 (39/58 base first, 42/58 any) es un caso práctico de por qué los scorers laxos invalidan comparaciones.
- Formación y revisión de prácticas de MLOps: el repositorio documenta un fallo común (pesos en local nunca subidos al Hub) y sirve como ejemplo de control de artefactos y trazabilidad.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| K7 (v3 vs base) | +4 neto, p=0,3438 | Veredicto NON_PROMU |
| Router garde | +8 neto, 0 regresión | Validado en producción |
| Scores v1 (scorer laxo) | 37/46 y 33/46 | Obsoletos, no comparables |
| Referencia v2 base first | 39/58 | Familia canónica del holdout |
| Referencia v2 any | 42/58 | Familia canónica del holdout |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo base, no declarado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el modelo base.
- Opciones de despliegue: PeftModel con el arnés de garde, o vLLM con `--enable-lora`. La vía GGUF/Ollama se describe como abandonada porque Ollama rechaza adaptadores LoRA (el GGUF P7 era la base sin adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Libellule v3 — Champion | no disponible (LoRA) | no disponible | Apache 2.0 | Pesos no subidos al Hub |
| Modelo base de Libellule v3 | no disponible | no disponible | no disponible | no disponible |
| Alternativas LoRA genéricas | variable | variable | variable | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Los pesos y scripts no están subidos al Hub: el repositorio es solo un archivo documental. No es posible descargar ni ejecutar el modelo tal cual.
- El veredicto estadístico K7 es NON_PROMU (p=0,3438): la mejora del LoRA v3 sobre la base no es significativa. Lo validado en producción es la garde, no el adaptador.
- La receta real de v3 (r=16, all-linear, dropout 0) difiere de la receta K8 bloqueada, por lo que no es reproducible bajo el protocolo de referencia.
- Los scores v1 (37/46, 33/46) están obsoletos por usar un scorer laxo y no son comparables con las referencias v2.
- La vía GGUF/Ollama está descartada: Ollama no admite adaptadores LoRA y el GGUF P7 correspondía a la base sin adaptador.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Idiomas soportados no declarados; la documentación está en francés, lo que puede limitar la audiencia.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos y de modelo base declarado impide verificar la cadena de licencias del artefacto completo.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KallokTherok1994/libellule-v3-champion
- Repositorio de estado de campaña: https://huggingface.co/KallokTherok1994/libellule-eval-v3
- ML Intern (herramienta citada en la model card): https://hf.co/chat?mode=ml-intern
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
