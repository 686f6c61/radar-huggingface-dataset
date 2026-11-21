# iapp/OpenThai2.1-OCR-Markdown-20261118-GGUF

## Resumen

OpenThai2.1-OCR-Markdown-20261118 es un modelo de visión-lenguaje especializado en el reconocimiento óptico de caracteres (OCR) y la conversión de páginas de documentos tailandeses e ingleses a Markdown, con las tablas representadas como HTML y las fórmulas como `$$...$$`. Lo desarrolla iapp (iApp Technology) y deriva de un ajuste fino sobre NVIDIA Nemotron 3.5 Parse (0,63B). La variante documentada aquí es la cuantización GGUF publicada para su ejecución con llama.cpp en Mac, CPU o GPU de consumo, sin necesidad de PyTorch ni vLLM.

El modelo resuelve un problema concreto: la digitalización estructurada de documentos en tailandés, un idioma con escasa cobertura en los sistemas OCR de propósito general. En lugar de devolver texto plano, produce Markdown con bloques posicionados mediante coordenadas de caja (`<x_..><y_..>`) y etiquetas de clase, lo que permite reconstruir la estructura del documento.

La relevancia actual radica en su tamaño reducido (189,7 millones de parámetros en el decodificador, más un codificador visual de 439 millones) y en que la arquitectura no está incluida en el llama.cpp upstream: requiere una bifurcación específica del repositorio. Su licencia es OpenMDW 1.1, no una licencia de código abierto estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal visión-lenguaje; requiere bifurcación `nemotron-parse` de llama.cpp) |
| Parámetros totales | 189.722.624 (decodificador); codificador visual y cuello: 439M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (valor usado en los ejemplos de ejecución con `-c 16384`) |
| Tipos de cuantización | Q8_0 y F16 (decodificador); F16 para el `mmproj` (codificador visual) |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | OpenMDW 1.1 (`license: other`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 1,5 GB |
| Pipeline | image-text-to-text |
| Modelo base | iapp/OpenThai2.1-OCR-Markdown-20261118; nvidia/Nemotron-3.5-Parse |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de NVIDIA Nemotron 3.5 Parse, un modelo multimodal de 0,63B parámetros que combina un codificador visual con un decodificador de 192M parámetros. La arquitectura exacta (tipo de transformer, mecanismo de atención, composición del dataset de entrenamiento, número de tokens, uso de RLHF o DPO) no está detallada en la información disponible. La model card remite a la ficha del modelo base para los detalles de entrenamiento y benchmarks.

La innovación técnica destacable es el formato de salida: el modelo emite bloques con coordenadas de caja y clases (`<x_..><y_..>text<x_..><y_..><class_..>`), que la librería `DocumentParser` de NVIDIA postprocesa a Markdown. La plantilla de chat coloca la imagen antes de los tokens de tarea y fija los parámetros de muestreo de `DocumentParser` (temperatura 0,2, top-k 50, top-p 1,0, penalización de repetición 1,05 sobre 8.760 tokens). La conversión a GGUF reproduce fielmente el modelo PyTorch: en 30 páginas de desarrollo, las salidas Q8_0 y F16 coinciden al 100 % con el modelo en F32 tras el postprocesado, y en 5 páginas la reproducción es token por token durante más de 600 tokens.

## Capacidades

- OCR de documentos en tailandés e inglés con salida en Markdown.
- Conversión de tablas a HTML dentro del Markdown generado.
- Representación de fórmulas matemáticas como `$$...$$`.
- Detección de bloques con coordenadas de caja y clasificación por clase (texto, tablas, figuras, texto en imágenes).
- Extracción de texto contenido en imágenes (`<predict_text_in_pic>`).
- Procesamiento de páginas completas con un límite de generación de 8.744 tokens (`-n 8744`).
- Modo conversacional mediante plantilla de chat Jinja (`--jinja`).
- Ejecución en CPU, GPU de consumo y Apple Silicon (Metal) mediante llama.cpp.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte formularios y reportes escaneados en Markdown estructurado, preservando tablas como HTML, lo que facilita su indexación en sistemas de gestión documental.
- Extracción de datos de facturas y recibos: las coordenadas de caja y las clases permiten aislar campos concretos (importes, fechas, emisores) sin need de reglas heurísticas específicas por plantilla.
- Procesamiento de material educativo: la evaluación del autor incluye diapositivas, temarios y libros de texto en tailandés e inglés, por lo que encaja en la conversión de apuntes y manuales a formatos editables.
- Construcción de corpus para entrenamiento: la salida Markdown con estructura preservada sirve para generar datasets de texto a partir de documentos PDF o escaneados en tailandés, un idioma con pocos recursos.
- Digitalización en el borde (edge): con un decodificador Q8_0 de 204 MB y un codificador de 917 MB, el modelo cabe en equipos modestos y puede ejecutarse en local sin conexión, útil para documentos con requisitos de privacidad.
- Integración en pipelines de gestión documental: el servidor llama-server expone una API compatible con el cliente `DocumentParser`, lo que permite encadenar la conversión con postprocesado y almacenamiento en un flujo automatizado.
- Atención al cliente con documentos adjuntos: la extracción de contenido de imágenes enviadas por usuarios (capturas, facturas, formularios) puede alimentar respuestas automatizadas en tailandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo base para las puntuaciones de referencia. Los únicos datos cuantitativos son de fidelidad de conversión y velocidad:

| Prueba | Resultado |
|---|---|
| Páginas idénticas a PyTorch (Markdown) | 30 de 30 (Q8_0 y F16) |
| Error de carácter frente a PyTorch | 0,00 % |
| Páginas truncadas en el límite de tokens | 0 |
| Bucles de generación | 0 |
| Reproducción token por token (5 páginas, >600 tokens) | Sí (F32 en CPU y Metal) |

Velocidad en Apple M3 Max (páginas completas, una a una):

| Máquina | Modo | Decodificador | Segundos por página |
|---|---|---|---|
| M3 Max, Metal | llama-server, modelo cargado | Q8_0 | 4,8–7,0 (4 páginas) |
| M3 Max, Metal | llama-mtmd-cli, carga incluida | Q8_0 | 7,7 (mediana de 30) |
| M3 Max, Metal | llama-mtmd-cli, carga incluida | F16 | 8,2 (mediana de 30) |

De los 7,7 segundos por página en Q8_0, 5,9 corresponden a la codificación de la imagen.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,1 GB en Q8_0 (204 MB de decodificador + 917 MB de codificador) y unos 1,3 GB en F16 (382 MB + 917 MB).
- Cabe en cualquier GPU de consumo con al menos 2 GB de VRAM libre; también funciona en CPU y en Apple Silicon con Metal.
- GPU recomendadas: no se especifican modelos concretos; la bifurcación admite compilación con `-DGGML_CUDA=ON` para NVIDIA.
- Despliegue: llama.cpp mediante la bifurcación `nemotron-parse` de iapp-technology, con los binarios `llama-mtmd-cli` y `llama-server`. No es compatible con el llama.cpp upstream, ni con vLLM ni Ollama sin adaptación.
- Latencia: 4,8–7,0 s por página en M3 Max con el modelo cargado; 7,7 s de mediana incluyendo carga en CLI. No hay datos de throughput en GPU NVIDIA.
- El cliente `DocumentParser` requiere `httpx`, `Pillow>=12.2,<13`, `numpy` y `beautifulsoup4`, sin torch.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, el modelo se distingue por su especialización en tailandés y su formato de salida estructurado con coordenadas, frente a OCR genéricos que devuelven texto plano. La comparación con el modelo base NVIDIA Nemotron 3.5 Parse (0,63B) es directa: este es un ajuste fino del mismo, con la misma arquitectura y un decodificador de 192M parámetros.

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown (este) | 189,7M + 439M visión | 16.384 | th, en | OpenMDW 1.1 |
| NVIDIA Nemotron 3.5 Parse | 0,63B | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La arquitectura no está en el llama.cpp upstream: es obligatorio compilar la bifurcación `nemotron-parse` de iapp-technology, lo que añade fricción de despliegue y riesgo de mantenimiento.
- La licencia OpenMDW 1.1 no es una licencia de código abierto estándar; deben revisarse sus términos antes de un uso comercial.
- El modelo solo cubre tailandés e inglés; no se documenta soporte para otros idiomas.
- El límite de generación de 8.744 tokens puede truncar páginas muy densas; la model card no reporta truncamientos en las 30 páginas evaluadas, pero no se garantiza en documentos más largos.
- Riesgo de alucinación y de bucles de generación en documentos atípicos; el autor recomienda desactivar la penalización de repetición para salidas deterministas (`--repeat-penalty 1.0`).
- Las páginas en blanco se omiten y devuelven vacías, lo que puede requerir gestión explícita en pipelines.
- El servidor llama-server lee `repeat_penalty` en lugar de `repetition_penalty` de vLLM, y `--repeat-last-n -1` desactiva la penalización en esta bifurcación; son diferencias de comportamiento a tener en cuenta.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a documentos degradados, manuscritos o layouts complejos.
- El rendimiento en GPU NVIDIA no está medido; los únicos datos de velocidad son de Apple Silicon.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118-GGUF
- Modelo base en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Modelo NVIDIA Nemotron 3.5 Parse: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Bifurcación de llama.cpp: https://github.com/iapp-technology/llama.cpp (rama `nemotron-parse`)
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
