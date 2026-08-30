# leok7v/Ternary-Bonsai-27B-gguf

## Resumen

Ternary Bonsai 27B es un modelo de lenguaje multimodal desarrollado por Prism ML, derivado del backbone híbrido Qwen3.6-27B de Alibaba Cloud. Su característica principal es una cuantización ternaria end-to-end: los pesos se representan con un alfabeto {-1, 0, +1} a aproximadamente 1,71 bits por peso, lo que reduce el footprint desplegado a unos 7,2 GB frente a los 54 GB del FP16, una reducción de 9,4 veces. Según los datos publicados, conserva alrededor del 95 % de la capacidad de razonamiento de la versión de precisión completa en 15 benchmarks de modo thinking.

Este repositorio concreto es un re-host realizado por leok7v que fusiona en un único archivo GGUF los pesos ternarios del modelo de texto (cuantización Q2_0_g128) y el proyector de visión Q8_0, junto con la tarjeta de muestreo. El objetivo es ofrecer una instantánea estable y autocontenida que sobreviva a posibles movimientos del repositorio original. El modelo soporta contexto largo de hasta 262 000 tokens y está pensado para ejecutarse en dispositivos con recursos limitados mediante llama.cpp, incluyendo CPU, CUDA y Metal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas, 48 de Gated DeltaNet (atención lineal / state-space) y 16 de atención softmax completa, intercaladas "tres lineales, una atención" (arquitectura `qwen35`) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | Q2_0_g128 (pesos ternarios, ~1,71 bits por peso); proyector de visión en Q8_0 |
| Idiomas soportados | Inglés y los idiomas del modelo base (Qwen3.6-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un solo archivo con tensores de texto y proyector de visión) |

## Arquitectura y entrenamiento

El modelo combina dos mecanismos de atención: 48 capas de Gated DeltaNet, una variante de atención lineal basada en state-space, y 16 capas de atención softmax completa, intercaladas siguiendo el patrón "tres lineales, una atención". Esta hibridación busca equilibrar eficiencia computacional y capacidad de razonamiento de largo alcance. Los pesos están cuantizados a un alfabeto ternario {-1, 0, +1} mediante el esquema Q2_0_g128: cada bloque de 128 pesos se almacena como `{ FP16 scale d; 2-bit codes qs[32] }` y se dequantiza como `w = (code - 1) * d`. El proyector de visión es una torre Qwen3-VL de 27 bloques cuantizada a Q8_0.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo base es Qwen3.6-27B, y la cuantización ternaria fue aplicada por Prism ML. El archivo GGUF incluye parámetros de muestreo por defecto (temperatura 1,0, top_p 0,95, top_k 20) y una tarjeta de muestreo que añade configuraciones específicas para turnos de visión y para el modo no-thinking (temperatura 0,7, top_p 0,8, presence penalty 1,5).

## Capacidades

- Generación de texto y chat conversacional con soporte de modo thinking (razonamiento explícito) y modo no-thinking.
- Razonamiento matemático y lógico, con especial énfasis en tareas de razonamiento de varios pasos.
- Generación de código y soporte de tool calling / function calling, según las características del modelo base.
- Capacidades multimodales: procesamiento de imágenes mediante el proyector de visión Qwen3-VL integrado en el mismo archivo.
- Manejo de contexto largo de hasta 262 000 tokens, adecuado para tareas que requieren memoria extendida.
- Multilingüe: aunque la ficha indica inglés, hereda los idiomas del modelo base Qwen3.6-27B.
- Diseñado para ejecución on-device con footprint reducido (~7,2 GB), compatible con backends de llama.cpp en CPU, CUDA y Metal.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el tamaño reducido (~7,2 GB) permite ejecutar el modelo en portátiles, mini-PCs o GPUs de gama media sin conexión a internet, manteniendo un nivel de razonamiento cercano al de modelos de 27B en FP16.
- Análisis de documentos largos con contexto extendido: la ventana de 262 000 tokens permite procesar libros técnicos, expedientes legales o historiales clínicos completos en una sola pasada, con capacidad de razonamiento sobre todo el documento.
- Sistemas de atención al cliente automatizada: el modo chat y el soporte de tool calling permiten integrar el modelo en pipelines de soporte que consultan bases de conocimiento, gestionan tickets o derivan consultas complejas a agentes humanos.
- Generación de código asistida en entornos de desarrollo: puede utilizarse como autocompletado o asistente de programación, con capacidad de razonamiento multi-paso para depurar o refactorizar fragmentos de código.
- Procesamiento de imágenes con descripción y razonamiento visual: gracias al proyector de visión, puede analizar capturas de pantalla, diagramas o fotografías y generar explicaciones o respuestas basadas en su contenido.
- Prototipado de agentes autónomos: la combinación de razonamiento, tool calling y contexto largo lo hace adecuado para experimentar con agentes que planifican y ejecutan tareas de varios pasos en entornos controlados.
- Despliegue en infraestructura con VRAM limitada: al caber en GPUs con 8-12 GB de VRAM, es una opción viable para servidores de inferencia de bajo coste o para pruebas locales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las fuentes mencionan que el modelo retiene aproximadamente el 95 % de la capacidad de razonamiento de la versión FP16 en 15 benchmarks de modo thinking, pero no se proporcionan cifras concretas ni comparaciones con otros modelos. Se recomienda consultar el repositorio original de Prism ML para obtener datos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa ~7,8 GB, por lo que se necesita al menos 8 GB de VRAM para cargarlo en GPU; con cuantización adicional o uso de CPU puede funcionar con menos memoria.
- GPUs recomendadas: tarjetas consumer con 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) o GPUs de datacenter como A100 o H100 para mayor throughput.
- Compatible con CPU: puede ejecutarse en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (con kernels específicos de la rama `prism` de PrismML-Eng), así como runtimes que soporten la lectura del proyector de visión desde el mismo archivo GGUF. No es compatible con llama.cpp principal sin modificaciones.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados en la información disponible. A modo de referencia estructural, se puede comparar con el modelo base Qwen3.6-27B (sin cuantizar) y con otros modelos de 27B en formato GGUF, pero no hay cifras objetivas para establecer una comparativa rigurosa. La ventaja principal de Ternary Bonsai 27B es su footprint extremadamente reducido (1,71 bits por peso) frente a cuantizaciones convencionales de 4 u 8 bits, a costa de una posible pérdida de fidelidad en tareas muy sensibles a la precisión numérica.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo único de este repositorio no es cargable por llama.cpp principal, que espera el proyector de visión por separado mediante `--mmproj`. Para usar con llama.cpp estándar, debe emplearse el repositorio original de dos archivos.
- Sesgos y alucinaciones: al derivar de Qwen3.6-27B, el modelo puede heredar sesgos presentes en los datos de entrenamiento del modelo base. No se han publicado evaluaciones específicas de sesgo para esta versión cuantizada.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información plausible pero incorrecta, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de idioma: la ficha indica inglés como idioma principal; aunque hereda otros idiomas del base, el rendimiento fuera del inglés puede ser inferior.
- Pérdida de precisión por cuantización: aunque se reporta un 95 % de retención de razonamiento, tareas que requieren alta precisión numérica (por ejemplo, cálculo exacto) pueden degradarse.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y los avisos de copyright incluidos en el repositorio.

## Enlaces

- Repositorio de este re-host: https://huggingface.co/leok7v/Ternary-Bonsai-27B-gguf
- Repositorio original (autoritativo): https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Kernels Q2_0 (rama `prism` de llama.cpp): https://github.com/PrismML-Eng/llama.cpp
- Página del modelo en AIAny: https://aiany.app/item/ternary-bonsai-27b-gguf
- Página del modelo en There's An AI For That: https://theresanaiforthat.com/model/ternary-bonsai-27b-gguf/
- Página del modelo en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/ternary-bonsai-27b-gguf-prism-ml
