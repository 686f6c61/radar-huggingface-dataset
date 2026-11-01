# mradermacher/Granite-4.2-3B-Surgical-Abliterated-GGUF

## Resumen

Granite-4.2-3B-Surgical-Abliterated-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo medismera/Granite-4.2-3B-Surgical-Abliterated, publicada por el cuantizador mradermacher, conocido por su amplio catálogo de cuantizaciones de modelos de la comunidad. El modelo base es una versión "abliterated" (con los mecanismos de rechazo del modelo original neutralizados mediante la técnica de surgical alignment) de un modelo de 3B parámetros de la familia Granite de IBM, orientado a uso conversacional.

La relevancia de esta ficha radica en que se trata de un repositorio de cuantizaciones, no del modelo original: su valor está en permitir ejecutar el modelo en hardware modesto, desde portátiles con CPU hasta GPUs de consumo, con tamaños de archivo que van desde 1,6 GB (Q2_K) hasta 7,4 GB (f16). El modelo base conserva la licencia Apache 2.0 del original.

Es importante señalar que la versión abliterated elimina las salvaguardas de seguridad del modelo, lo que conlleva riesgos éticos y de producción significativos que se detallan en las secciones correspondientes. Además, el modelo base está entrenado para inglés, por lo que su rendimiento en castellano no está garantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), familia Granite de IBM |
| Parametros totales | 3.659.737.600 (~3,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Granite de IBM, una serie de modelos transformer decoder-only (causal language models) de tamaño compacto. La versión cuantizada mantiene la arquitectura original de 3,66 B parámetros; el proceso de cuantización de mradermacher es estático (convertido desde safetensors mediante el flujo "hf"), con cuantizaciones weighted/imatrix disponibles en un repositorio aparte.

Sobre el entrenamiento del modelo base, la información disponible es escasa. Lo que sí consta es que se trata de una versión "abliterated" mediante "surgical alignment", una técnica que modifica selectivamente los pesos responsables de los comportamientos de rechazo del modelo, eliminando sus salvaguardas de seguridad sin reentrenamiento completo. No hay datos publicados en la información disponible sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional (etiquetado como "conversational" en el repositorio).
- Modelo abliterated: responde a peticiones que el modelo original rechazaría por sus políticas de seguridad, sin filtros de alineación.
- Compatibilidad con el ecosistema GGUF: ejecución en llama.cpp, Ollama, LM Studio y derivados.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no consta en la información proporcionada).
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.

## Casos de uso

- Investigación sobre alineación y seguridad: al ser una versión abliterated, es útil para estudiar cómo la técnica de surgical alignment modifica el comportamiento de un modelo Granite de 3B y comparar respuestas con y sin salvaguardas.
- Pruebas locales en hardware modesto: con cuantos de 1,6-2,3 GB, se puede ejecutar en portátiles sin GPU dedicada mediante llama.cpp u Ollama, útil para prototipado rápido de aplicaciones conversacionales.
- Red teams y evaluación de robustez: permite auditar la resistencia de modelos compactos ante peticiones sensibles y verificar cómo fallan los filtros eliminados.
- Asistentes conversacionales en inglés en entornos sin restricciones de contenido: para aplicaciones donde el operador asume toda la responsabilidad del filtrado de contenido en su capa de aplicación.
- Benchmarking de cuantizaciones: la amplia gama de cuantos (Q2_K a f16) permite comparar degradación de calidad frente a tamaño en un mismo modelo de 3B.
- Integración en pipelines locales de procesamiento de texto en inglés: tareas como resumen o extracción donde se necesite un modelo pequeño, rápido y sin llamadas a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~1,6 GB; Q4_K_M ~2,3 GB; Q8_0 ~4,0 GB; f16 ~7,4 GB. Añadir aproximadamente 0,5-1 GB adicional para el contexto y overhead del runtime.
- GPUs recomendadas: cualquier GPU de consumo con 4 GB de VRAM o más ejecuta cómodamente los cuantos Q4/Q5; una RTX 3060 de 12 GB o RTX 4090 permiten usar f16 sin problemas. No se requieren GPUs de centro de datos (A100/H100).
- Cabe en consumer GPUs: sí, incluso en GPUs de gama baja; también es ejecutable solo con CPU y RAM dado el tamaño reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: transformers, vLLM o TGI.
- Latencia y throughput: no disponible (no hay datos publicados; al ser un modelo de 3B, se espera inferencia rápida incluso en CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Granite-4.2-3B-Surgical-Abliterated (base) | 3,66 B | safetensors | Apache 2.0 | Modelo original abliterated de medismera |
| Granite-4.2-3B-Surgical-Abliterated-i1-GGUF | 3,66 B | GGUF (imatrix) | Apache 2.0 | Cuantizaciones weighted/imatrix del mismo autor, calidad posiblemente superior a igual tamaño |
| Otros modelos abliterated de 3B (p. ej. variantes abliterated de Llama o Qwen de 3B) | ~3 B | GGUF/safetensors | Variable | Alternativas abliterated de tamaño similar; datos concretos de rendimiento no disponibles |

## Limitaciones y advertencias

- Modelo abliterated: las salvaguardas de seguridad han sido eliminadas deliberadamente. Puede generar contenido ofensivo, peligroso o inapropiado. Su uso conlleva responsabilidad legal y ética plena para el operador.
- Riesgo de alucinación: inherente a cualquier LLM y agravado por la ausencia de alineación; no hay datos publicados que cuantifiquen este riesgo en este modelo.
- Idioma: entrenado y etiquetado solo para inglés; el rendimiento en castellano no está garantizado y puede ser deficiente.
- Longitud de contexto: no disponible en la información proporcionada; debe consultarse la ficha del modelo base antes de diseñar aplicaciones con documentos largos.
- Calidad de los cuantos bajos: Q2_K y Q3_K_M presentan degradación notable de calidad según el propio autor del repositorio; se recomiendan Q4_K_S, Q4_K_M o superiores.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base abliterated es una modificación de terceros (medismera) sobre Granite de IBM; conviene verificar los términos del modelo base original para despliegues comerciales.
- Para producción: no recomendado sin capa de filtrado propia y pruebas exhaustivas; no hay benchmarks publicados que respalden su calidad.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Granite-4.2-3B-Surgical-Abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/medismera/Granite-4.2-3B-Surgical-Abliterated
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Granite-4.2-3B-Surgical-Abliterated-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Granite-4.2-3B-Surgical-Abliterated-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantos (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
