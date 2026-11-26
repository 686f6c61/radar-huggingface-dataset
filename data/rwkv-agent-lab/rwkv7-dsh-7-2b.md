# RWKV-Agent-Lab/RWKV7-DSH-7.2B

## Resumen

RWKV7-DSH-7.2B es un adaptador de inferencia NoRA de rango 64 publicado por RWKV-Agent-Lab sobre el modelo base público RWKV-7 G1L de 7.200 millones de parámetros (checkpoint `rwkv7-g1l-7.2b-20261031-ctx34304`). El adaptador, de 289 MB, se distribuye como fichero `.pth` en BF16 y está pensado para cargarse en caliente sobre el servidor de inferencia `rwkv_lightning_cuda`, tanto con pesos completos como con la cuantización `w8a16`.

El modelo resuelve un problema concreto: convertir un modelo de lenguaje de propósito general en un agente autónomo de programación capaz de inspeccionar repositorios, editar ficheros con anclajes, ejecutar comandos de shell, gestionar flujos de git y verificar tests dentro de sandboxes aislados. Se integra mediante el plugin `dsh-rwkv-plugin` del proyecto DeepSeek Harness (DSH).

La relevancia técnica reside en dos factores. Por un lado, la arquitectura RWKV-7 es un modelo de estado lineal (linear-state) con memoria O(1) por token, lo que permite contextos largos sin el coste cuadrático de atención de un transformer clásico. Por otro, el adaptador se extrajo con una retención de energía SVD del 98,71 % respecto al checkpoint base y sin diferencias en tensores no objetivo, lo que facilita su carga sobre el modelo público sin reentrenamiento completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RWKV-7 (linear-state, atención lineal con estado recurrente) |
| Parámetros totales | 7.200 millones (modelo base); adaptador NoRA de rango 64 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 34.304 tokens (según nombre del checkpoint base `ctx34304`) |
| Tipos de cuantización | `w8a16` documentado en el servidor de inferencia; pesos completos BF16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (adaptador NoRA BF16); base en `.rwkvq` (`w8a16`) |
| Tamaño del adaptador | 289 MB |
| Librería de inferencia | `rwkv-lightning-cuda` (`rwkv_lighting_cuda`) |
| Modelo base | `RWKV-Agent-Lab/RWKV7-Agent-7.2B` (a su vez sobre `rwkv7-g1l-7.2b-20261031-ctx34304`) |

## Arquitectura y entrenamiento

El modelo se apoya en RWKV-7, una arquitectura de estado lineal que sustituye la atención cuadrática de los transformers por una recurrencia con estado interno de tamaño constante. Esto implica un coste de memoria O(1) por token durante la inferencia y una complejidad lineal respecto a la longitud de la secuencia, lo que resulta ventajoso para tareas de agente con muchas interacciones y contexto acumulado.

El adaptador es un NoRA (una variante de bajo rango de las técnicas de adaptación tipo LoRA) de rango 64, extraído contra el checkpoint base público `rwkv7-g1l-7.2b-20261031-ctx34304`. Según la model card, la extracción alcanzó una retención de energía SVD del 98,71 % y cero diferencias en tensores no objetivo, lo que indica que el adaptador preserva fielmente el comportamiento aprendido. La model card describe el entrenamiento en dos etapas: una primera fase "Stage 1 A-D" que produce el modelo compartido `RWKV7-Agent-7.2B`, y una segunda fase de adaptación ("annealed coding-agent adapter") que da lugar a este release `v0.1` (`v4d-r64-editboost`). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO.

La innovación destacable es la distribución como adaptador independiente que se carga en caliente sobre el servidor de inferencia sin reiniciar el proceso, mediante un endpoint HTTP (`POST /v1/adapters`). El sistema permite seleccionar el adaptador por petición (`adapter_id`), lo que posibilita servir varias variantes sobre el mismo modelo base.

## Capacidades

- Inspección multi-turno de bases de código: recorrido de repositorios, lectura de ficheros y razonamiento sobre la estructura del proyecto.
- Edición anclada de ficheros: modificación de código con anclajes para minimizar cambios no deseados.
- Ejecución de comandos de shell dentro de sandboxes aislados.
- Flujos de trabajo con git: operaciones de control de versiones integradas en el bucle del agente.
- Verificación de tests: ejecución y comprobación de suites de pruebas como parte del ciclo de corrección.
- Uso de herramientas (tool calling / function calling) dentro del ecosistema DSH.
- Razonamiento de múltiples pasos (multi-step reasoning) con hasta 30 pasos por tarea en la configuración de evaluación documentada.
- Soporte bilingüe chino e inglés.
- Contexto largo de hasta 34.304 tokens con memoria constante por token.

## Casos de uso

- Corrección automática de bugs en repositorios: el agente inspecciona el código, localiza el fallo, aplica una edición anclada y ejecuta los tests para verificar la corrección. El contexto de 34.304 tokens permite cargar ficheros y trazas de error relevantes en una sola sesión.
- Refactorización guiada por tests: el modelo puede ejecutar la suite de pruebas, interpretar los fallos y aplicar cambios incrementales en ficheros concretos, aprovechando la edición anclada para reducir regresiones.
- Automatización de tareas de mantenimiento en git: creación de ramas, commits y resolución de conflictos sencillos dentro de un sandbox, con verificación posterior mediante tests.
- Integración en pipelines de CI/CD: el adaptador se carga en caliente sobre `rwkv_lightning_cuda` y se invoca por petición mediante `adapter_id`, lo que permite usarlo como paso de corrección automática en un flujo de integración.
- Asistente de terminal para desarrolladores: ejecución de comandos de shell y análisis de su salida dentro de un entorno controlado, útil para tareas de diagnóstico y exploración de sistemas.
- Migración y corrección multi-lenguaje: con resultados documentados en Aider Polyglot y HumanEvalFix, el modelo puede abordar tareas de reparación de código en distintos lenguajes, aunque con tasas de acierto moderadas que requieren supervisión humana.
- Evaluación de agentes de código en investigación: al ser un adaptador pequeño y reproducible sobre un base público, sirve como banco de pruebas para estudiar técnicas de adaptación de bajo rango en agentes autónomos.

## Benchmarks y rendimiento

Resultados del benchmark privado de horizonte largo `PB-20261120-200-Coding` (200 tareas, 2.000 puntos; `k=1`, `max_steps=30`, `auto-fold v2 + tolerant`):

| Modelo | Total / 2000 | Puntuación % | PB-100-Edit (1000) | git-eval-35 (350) | wspill-30 (300) | codefix-15 (150) | cf-eval-20 (200) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `rwkv7-g1l-7.2b-20261031` (base) | 279,16 | 13,96 % | 102,50 | 98,33 | 61,66 | 10,00 | 6,67 |
| `RWKV7-Agent-7.2B` (stage1abcd) | 728,33 | 36,42 % | 273,30 | 193,34 | 138,34 | 90,00 | 33,33 |
| **`RWKV7-DSH-7.2B-v0.1` (este adaptador)** | **980,83** | **49,04 %** | **419,13** | **243,35** | **178,33** | **100,00** | **40,00** |

Resultados en benchmarks públicos (Harbor, `k=1`, `max_steps=30`):

| Benchmark | Tareas | Resultado |
|---|---:|---:|
| HumanEvalFix | 164 | 80 / 164 (48,78 %) |
| EditBench-zh | 108 | 24 / 108 (22,22 %; válido 22,43 %) |
| EditBench (en) | 108 | 19 / 108 (17,59 %; válido 17,76 %) |
| QuixBugs | 80 | 4 / 80 (5,00 %) |
| Aider Polyglot | 225 | 10 / 225 (4,44 %; válido 5,03 %) |

## Requisitos de hardware

- El adaptador ocupa 289 MB en BF16 y se carga en memoria GPU o RAM según los límites configurados: `RWKV_ADAPTER_STAGING_MIB=512`, `RWKV_ADAPTER_GPU_MIB=2048` y `RWKV_ADAPTER_RAM_MIB=4096` son los valores documentados para adaptadores de rango 64.
- El modelo base de 7.200 millones de parámetros requiere VRAM sustancial para inferencia. Con cuantización `w8a16` el peso aproximado es de unos 7-8 GB, más overhead de estado y activaciones; en BF16 completo se sitúa en torno a 14-15 GB solo para pesos. Estas cifras son estimaciones a partir del tamaño del modelo, no datos publicados en la model card.
- GPU recomendadas: para BF16 completo, A100 40 GB, H100 o RTX 4090 24 GB; con `w8a16`, una RTX 4090 o una RTX 3090 de 24 GB deberían ser suficientes para el base más el adaptador.
- Cabe en GPU de consumo de gama alta (RTX 3090, RTX 4090) usando la cuantización `w8a16`; en GPUs con menos de 16 GB no es viable sin cuantizaciones más agresivas, que no están documentadas.
- Despliegue: el servidor `rwkv_lightning_cuda` es la vía oficial, con endpoint HTTP para registrar adaptadores en caliente (`POST /v1/adapters`) y peticiones a `/v1/batch/completions` con el campo `adapter_id`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparativa se limita a características estructurales.

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| RWKV7-DSH-7.2B (este) | 7.200 M + adaptador r64 | 34.304 tokens | Apache-2.0 | `.pth` NoRA sobre `rwkv_lightning_cuda` |
| RWKV7-Agent-7.2B (modelo padre) | 7.200 M | 34.304 tokens (heredado del base) | Apache-2.0 | pesos completos sobre RWKV-7 G1L |
| `rwkv7-g1l-7.2b-20261031` (base público) | 7.200 M | 34.304 tokens | Apache-2.0 | `.rwkvq` (`w8a16`) |

No se han identificado en la información disponible alternativas de otros autores con las que comparar parámetros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Las tasas de acierto en benchmarks públicos son moderadas: QuixBugs 5,00 %, Aider Polyglot 4,44 % y EditBench en inglés 17,59 %. No es un agente autónomo fiable sin supervisión humana.
- El soporte de idiomas se limita a chino e inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El adaptador solo funciona sobre el checkpoint base exacto `rwkv7-g1l-7.2b-20261031-ctx34304`; cargarlo sobre otra revisión puede producir degradación silenciosa.
- La dependencia de `rwkv_lightning_cuda` y del plugin `dsh-rwkv-plugin` limita la portabilidad: no hay soporte documentado para stacks de inferencia estándar como vLLM o llama.cpp.
- Riesgo de alucinación inherente a un modelo de 7.200 millones de parámetros; en tareas de edición de código puede generar cambios plausibles pero incorrectos, por lo que la verificación mediante tests es imprescindible.
- El modelo se distribuye como adaptador sobre un base público; los sesgos del base (no documentados en la información disponible) se heredan.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y de las dependencias (`rwkv_lightning_cuda`, `dsh-rwkv-plugin`) antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación es 2026-11-26; se trata de un release muy reciente sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RWKV-Agent-Lab/RWKV7-DSH-7.2B
- Modelo base (fundación de agente): https://huggingface.co/RWKV-Agent-Lab/RWKV7-Agent-7.2B
- Plugin de integración DSH: https://github.com/No-22-Github/dsh-rwkv-plugin
