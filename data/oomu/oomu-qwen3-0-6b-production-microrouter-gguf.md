# oomu/OOMU-Qwen3-0.6B-Production-MicroRouter-GGUF

## Resumen

OOMU-Qwen3-0.6B-Production-MicroRouter es un modelo de enrutamiento compacto desarrollado por OOMU, derivado del checkpoint instruct de Qwen/Qwen3-0.6B mediante entrenamiento LoRA y posterior cuantización a Q8_0 con la toolchain de llama.cpp. No es un asistente conversacional de propósito general, sino un componente especializado dentro del contrato de "micro-router" acotado de OOMU: el código nativo define la gramática de capacidades permitidas, valida cada decisión del modelo y ejecuta efectos únicamente a través del broker nativo de OOMU. Su relevancia radica en ofrecer una alternativa de muy bajo coste computacional (596 millones de parámetros) para tareas de enrutamiento y selección de herramientas en sistemas de agentes, con soporte multilingüe en doce idiomas y licencia Apache 2.0.

El modelo se distribuye como un único archivo GGUF de 639.446.784 bytes (Q8_0), con una ventana de contexto de 4.608 tokens y una salida máxima de 96 tokens, con el modo de pensamiento deshabilitado. Está pensado para ejecutarse en Apple silicon mediante Metal, aunque el archivo GGUF es portable a cualquier backend compatible con llama.cpp. La evaluación interna reporta una precisión exacta del 84,375% en el split de test sin tocar, y una mejora significativa en validez de esquemas JSON (de 91/96 a 96/96) respecto al modelo base sin entrenar. Sin embargo, el propio autor indica que el release gate automatizado no se superó y que el modelo fue seleccionado por decisión explícita del product owner, por lo que requiere el entorno de validación y ejecución de OOMU para funcionar de forma segura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.608 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en, es, de, fr, pt, ru, uk, id, vi, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único .gguf) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base Qwen/Qwen3-0.6B (commit `c1899de289a04d12100db370d81485cdf75e47ca`), sobre el que se aplicó un entrenamiento LoRA. La LoRA seleccionada (SHA-256 `57866bab45bcca2cfdd71290ceadbc491206288c6b836ebe1e260574538cde64`) se fusionó en el checkpoint instruct oficial y el resultado se cuantizó a Q8_0 con una toolchain de llama.cpp fijada. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o el método de alineación (RLHF/DPO). El autor menciona que se seleccionó la tercera época de entrenamiento, que alcanzó un 82,7586% de precisión exacta en el split de desarrollo. La innovación principal no reside en la arquitectura (que es la de Qwen3-0.6B), sino en el uso del modelo como un router acotado: la salida se limita a 96 tokens y el contexto a 4.608, y toda decisión debe ser validada por el código nativo de OOMU antes de ejecutar cualquier efecto.

## Capacidades

- Enrutamiento de intenciones y selección de herramientas dentro del contrato de micro-router de OOMU.
- Generación de objetos JSON con esquema estricto (final-wire JSON) para comunicar decisiones al broker nativo.
- Validación de esquemas: el modelo alcanza 96/96 salidas válidas en la matriz de runtime de producción, frente a 91/96 del modelo base.
- Soporte multilingüe en 12 locales (en, es, de, fr, pt, ru, uk, id, vi, ja, zh), con 108/128 aciertos por locale en el split de test.
- Sin modo de pensamiento (thinking mode deshabilitado), lo que reduce latencia y coste computacional.
- No es un asistente general: no genera texto libre ni mantiene conversaciones abiertas; su salida está restringida a rutas de capacidad predefinidas.

## Casos de uso

- Enrutamiento de peticiones en sistemas de agentes: el modelo recibe una petición del usuario y decide qué herramienta o capacidad debe invocarse, devolviendo un objeto JSON con la ruta seleccionada. Su pequeño tamaño permite ejecutarlo en cada nodo de un sistema distribuido sin sobrecarga.
- Filtrado previo de intenciones en asistentes virtuales multilingües: al soportar 12 idiomas, puede clasificar la intención de una consulta en el idioma original antes de pasarla a un modelo más grande, reduciendo costes de inferencia.
- Validación de esquemas en pipelines de tool-use: el modelo genera salidas que cumplen estrictamente el esquema JSON definido por el broker, lo que facilita la integración en sistemas de automatización donde la corrección sintáctica es crítica.
- Control de acceso a capacidades en entornos empresariales: al estar acotado por el contrato de OOMU, puede usarse como capa de decisión que solo permite ejecutar acciones permitidas por el código nativo, reduciendo el riesgo de acciones no deseadas.
- Optimización de latencia en dispositivos Apple: con Metal como backend obligatorio, el modelo está pensado para ejecutarse en Macs con chip M1 o superior, ofreciendo tiempos de respuesta p50 de 2.532 ms en rutas completas.
- Evaluación de calidad de enrutamiento en entornos de pruebas: su precisión del 84,375% en el split de test lo hace utilizable como referencia para comparar otros routers o para pruebas de regresión en sistemas de agentes.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación interna, pero no se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son los siguientes:

| Metrica | Modelo base (Q8) | OOMU MicroRouter |
|---|---|---|
| Exact match en runtime matrix (96 casos) | 9/96 | 21/96 |
| Salidas válidas según esquema (96 casos) | 91/96 | 96/96 |
| Latencia p50 ruta completa | 3.246 ms | 2.532 ms |
| Latencia p95 ruta completa | 3.886 ms | 3.121 ms |
| Exact match en split de test (1.536 casos) | no disponible | 1.296/1.536 (84,375%) |
| Exact match en split de desarrollo | no disponible | 82,7586% |

Nota: el evaluador estricto contó 240 objetos JSON semánticamente equivalentes como fallos por orden de claves distinto; la puntuación registrada no se modificó tras la inspección. El release gate automatizado de OOMU no se superó con estos resultados; la selección fue una decisión del product owner.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 pesa 639 MB, por lo que la inferencia requiere aproximadamente 0,7-1 GB de VRAM o RAM, dependiendo del backend y del overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. En Apple silicon, se requiere Metal (M1 o superior) como backend de producción; el modelo falla de forma segura si Metal no está disponible.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (recomendado por el autor), Ollama, vLLM (si se convierte a safetensors), o cualquier backend compatible con GGUF.
- Latencia y throughput: en Apple M1 Pro con Metal, la ruta completa (entrada + salida) tiene una latencia p50 de 2.532 ms y p95 de 3.121 ms, sin fallback a CPU. No se proporcionan datos de throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de enrutamiento de tamaño similar en el ecosistema OOMU. La comparación más directa es con el modelo base Qwen3-0.6B, del que deriva:

| Modelo | Parametros | Contexto | Cuantizacion | Exact match (96 casos) | Salidas validas | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-0.6B (base, Q8) | 596M | 4.608 (según OOMU) | Q8_0 | 9/96 | 91/96 | Apache 2.0 |
| OOMU-Qwen3-0.6B-Production-MicroRouter | 596M | 4.608 | Q8_0 | 21/96 | 96/96 | Apache 2.0 |

Otros modelos de la familia Qwen3 (0.6B, 1.7B, 4B) existen, pero no se dispone de datos de rendimiento en tareas de enrutamiento para comparar. El modelo no está diseñado para tareas de propósito general, por lo que compararlo con asistentes conversacionales no sería apropiado.

## Limitaciones y advertencias

- No es un asistente de propósito general: su uso fuera del contrato de micro-router de OOMU no está soportado y puede producir salidas sin sentido.
- El release gate automatizado de OOMU no se superó; el modelo fue seleccionado por decisión explícita del product owner. Esto implica que su rendimiento en producción no está plenamente garantizado.
- Requiere el entorno de validación y ejecución de OOMU (código nativo que valida cada decisión y ejecuta efectos solo a través del broker). Los pesos por sí solos no proporcionan esas garantías.
- Ventana de contexto limitada a 4.608 tokens y salida máxima de 96 tokens, lo que restringe su uso a tareas de enrutamiento de corta duración.
- Modo de pensamiento deshabilitado: no puede razonar en múltiples pasos ni generar explicaciones largas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar rutas o decisiones incorrectas; la validación externa es imprescindible.
- Sesgos del modelo base Qwen3-0.6B: no se han mitigado específicamente; el autor remite a la model card del modelo base para limitaciones adicionales.
- Dependencia de Metal en Apple silicon: en producción, el backend falla de forma segura si Metal no está disponible, lo que puede interrumpir el servicio en entornos no Apple.
- La licencia Apache 2.0 permite uso comercial, pero se debe preservar la atribución a Qwen3 y la licencia completa, según se indica en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oomu/OOMU-Qwen3-0.6B-Production-MicroRouter-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Guía de Qwen3 (insiderllm.com): https://insiderllm.com/guides/qwen3-complete-guide/
- GGUF de Qwen3-0.6B por unsloth: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- GGUF de Qwen3-0.6B por lm-kit: https://huggingface.co/lm-kit/qwen-3-0.6b-instruct-gguf
