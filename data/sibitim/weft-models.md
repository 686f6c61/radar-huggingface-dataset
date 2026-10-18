# sibitim/weft-models

## Resumen

`sibitim/weft-models` no es un modelo entrenado por su autor, sino un repositorio espejo que agrupa los modelos on-device que utiliza la aplicación Weft, con el objetivo de que la app descargue todas sus dependencias desde un único punto. El repositorio contiene cuatro componentes con funciones diferenciadas: un modelo de embeddings para búsqueda semántica, un extractor de entidades con tipos, y dos modelos generativos de pequeño tamaño para responder. Cada carpeta conserva la licencia de su proyecto de origen y, salvo una excepción, los ficheros son idénticos a los originales (mismo SHA-256).

Los componentes son EmbeddingGemma-2 en ONNX int8 (procedente de Google vía `onnx-community`), GLiNER2.5 multi en ONNX (de Fastino, con el encoder cuantizado a int8 por Weft), LFM2.5-1.2B-Instruct en GGUF Q4_K_M (de Liquid AI) y MiniCPM5-2B en GGUF Q4_K_M (de OpenBMB) como opción secundaria. El conjunto está pensado para ejecución local en dispositivos con recursos limitados, no para servidores de inferencia a gran escala.

Su relevancia práctica es la de un artefacto de distribución: simplifica el despliegue de un stack RAG/NER completamente local, pero no aporta pesos nuevos ni mejoras de rendimiento respecto a los modelos originales. La única modificación real es la cuantización dinámica int8 del encoder de GLiNER2.5, que pasa de 1,1 GB a 337 MB manteniendo las mismas entidades detectadas con puntuaciones dentro de aproximadamente 0,08 de las originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo único; repositorio con cuatro componentes: modelo de embeddings (EmbeddingGemma-2), modelo de extracción de entidades (GLiNER2.5) y dos modelos generativos (LFM2.5-1.2B-Instruct y MiniCPM5-2B) |
| Parametros totales | 1.170.340.608 (dato agregado de safetensors del repo; no se especifica a qué componente corresponde) |
| Parametros activos | No aplica (no se describe ningún componente como MoE en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX int8 con cuantización dinámica de ONNX Runtime (encoder de GLiNER2.5); GGUF Q4_K_M (LFM2.5-1.2B-Instruct y MiniCPM5-2B); fp32 en el encoder original de referencia |
| Idiomas soportados | No disponible (el sufijo `multi` de GLiNER2.5 sugiere cobertura multilingüe, sin detalle en la model card) |
| Licencia | Mixta: Apache 2.0 para EmbeddingGemma-2, GLiNER2.5 y MiniCPM5-2B; LFM Open License v1.0 para LFM2.5-1.2B-Instruct |
| Formato de pesos | ONNX (`.onnx`) y GGUF (`.gguf`); tamaño total del repo 3,0 GB |

## Arquitectura y entrenamiento

El repositorio no documenta ningún proceso de entrenamiento propio: los cuatro componentes son pesos publicados por terceros y redistribuidos sin reentrenamiento. La model card indica explícitamente que todos los ficheros son idénticos a su origen, verificado mediante SHA-256, con la única excepción de `gliner2.5-multi-v1/encoder_int8.onnx`. Por tanto, no hay información disponible sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO para ninguno de los modelos.

La contribución técnica del autor se limita a una cuantización: el `onnx/encoder.onnx` en fp32 de `DanKau/gliner2.5-multi-v1-onnx` se convierte a int8 mediante cuantización dinámica de ONNX Runtime. El resultado reduce el tamaño de 1,1 GB a 337 MB (aproximadamente un 69 % menos) manteniendo la cabeza de fronteras (boundary head) y el tokenizador sin cambios. El autor reporta que se detectan las mismas entidades, con puntuaciones que difieren en torno a 0,08 respecto al modelo original, lo que constituye una degradación medible y no despreciable en la confianza de las predicciones.

## Capacidades

- Generación de texto conversacional mediante LFM2.5-1.2B-Instruct (componente principal de respuestas) y MiniCPM5-2B (componente opcional).
- Búsqueda semántica y enlazado por significado mediante EmbeddingGemma-2, orientado a recuperación de documentos y similitud entre textos.
- Extracción de entidades con nombre y su tipología mediante GLiNER2.5 multi, con etiquetas definidas por el usuario en tiempo de inferencia.
- Ejecución completamente on-device, sin dependencia de API externa, en formatos ONNX y GGUF.
- Integración en pipelines conversacionales: los tags del repo incluyen `conversational` y `endpoints_compatible`.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en aplicaciones de escritorio o móviles: LFM2.5-1.2B-Instruct en Q4_K_M permite respuestas generativas sin conexión, con un peso manejable para empaquetar dentro de la app.
- Búsqueda semántica en una base de conocimiento personal: EmbeddingGemma-2 en int8 ONNX genera vectores para indexar notas o documentos y recuperar por significado en lugar de por coincidencia léxica.
- Extracción estructurada de entidades en facturas, correos o contratos: GLiNER2.5 permite definir en tiempo de ejecución etiquetas como `importe`, `fecha` o `proveedor` sin reentrenar el modelo.
- Anonimización previa al envío de datos a la nube: combinación de GLiNER2.5 (detección de nombres, organizaciones, localizaciones) con un paso de sustitución antes de cualquier llamada externa.
- Clasificación y enrutado de tickets de soporte: el embedding decide la categoría o el artículo de la KB relevante y el modelo generativo redacta la respuesta a partir del contexto recuperado (patrón RAG local).
- Prototipado rápido de un stack RAG completo en un portátil: el repositorio concentra recuperación, extracción y generación en 3,0 GB de descarga total, lo que simplifica la puesta en marcha.
- Aplicaciones con requisitos de privacidad o entornos sin conectividad: al ejecutarse todo localmente, ningún texto del usuario abandona el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una comparación cualitativa de la cuantización del encoder de GLiNER2.5: mismas entidades detectadas y puntuaciones dentro de aproximadamente 0,08 respecto al modelo fp32 original.

## Requisitos de hardware

- Tamaño total del repositorio: 3,0 GB, aunque en ejecución solo se cargan los componentes necesarios.
- Componente de embeddings y NER (ONNX int8): el encoder de GLiNER2.5 ocupa 337 MB en disco; la inferencia en CPU es viable con ONNX Runtime, sin GPU dedicada.
- Componentes generativos en GGUF Q4_K_M: por el número de parámetros (1,2 B y 2 B) y el ancho de 4 bits, se estima un peso en memoria del orden de 0,8 GB y 1,3 GB respectivamente; son estimaciones derivadas, no datos publicados.
- GPU: no se especifican modelos recomendados. Por tamaño, ambos GGUF caben en GPUs de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070); no se detalla comportamiento en A100/H100 porque el caso de uso declarado es on-device.
- Despliegue: ONNX Runtime para los componentes ONNX; llama.cpp u Ollama/LM Studio para los GGUF. Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa interna de los componentes incluidos en el repositorio (no se dispone de datos de benchmarks para comparar con alternativas externas de forma cuantitativa):

| Componente | Función | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma-2 | Embeddings / búsqueda semántica | No disponible | No disponible | ONNX int8 | Apache 2.0 |
| GLiNER2.5 multi v1 | Extracción de entidades con tipos | No disponible | No disponible | ONNX int8 (encoder) | Apache 2.0 |
| LFM2.5-1.2B-Instruct | Generación de respuestas (principal) | 1,2 B (por el nombre) | No disponible | GGUF Q4_K_M | LFM Open License v1.0 |
| MiniCPM5-2B | Generación de respuestas (opcional) | 2 B (por el nombre) | No disponible | GGUF Q4_K_M | Apache 2.0 |

Como referencia de categoría, los modelos generativos de 1-2 B parámetros cuantizados a 4 bits compiten habitualmente con alternativas como Qwen2.5-1.5B-Instruct, Llama-3.2-1B/3B o Gemma-2-2B; no se dispone en la información proporcionada de datos de rendimiento que permitan establecer una comparación numérica con ellos.

## Limitaciones y advertencias

- El repositorio es un espejo, no un proyecto con soporte propio: no hay garantía de mantenimiento, actualización ni de publicación de nuevos pesos.
- La licencia es mixta y debe revisarse carpeta por carpeta; no se puede asumir una única licencia para todo el conjunto.
- LFM2.5-1.2B-Instruct se distribuye bajo LFM Open License v1.0, que restringe el uso comercial a empresas por debajo de un umbral de ingresos; es imprescindible leer `lfm2.5-1.2b-instruct/LICENSE` antes de un despliegue en producción.
- La cuantización int8 del encoder de GLiNER2.5 introduce una desviación de puntuaciones de aproximadamente 0,08, relevante si se usan umbrales de confianza ajustados.
- No se documentan idiomas soportados, por lo que el comportamiento multilingüe (especialmente en castellano) no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos de 1-2 B parámetros; requieren verificación en tareas factuales.
- Sin datos de benchmarks, no es posible estimar la calidad frente a alternativas de la misma categoría.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos sin verificar el límite real de cada componente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no tiene pipeline declarado.
- Advertencia sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (contenido de catálogos de cómics para adultos) y se han descartado por completo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sibitim/weft-models
- EmbeddingGemma-2 (ONNX): https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- EmbeddingGemma-2 (original, Google): https://huggingface.co/google/embeddinggemma-2
- GLiNER2.5 multi v1 (ONNX): https://huggingface.co/DanKau/gliner2.5-multi-v1-onnx
- GLiNER2.5 multi v1 (original, Fastino): https://huggingface.co/fastino/gliner2.5-multi-v1
- LFM2.5-1.2B-Instruct GGUF (Liquid AI): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- MiniCPM5-2B GGUF (OpenBMB): https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Ficheros de licencia: `LICENSE` en la raíz del repo y `LICENSE` dentro de cada carpeta de componente
- Papers, blogs, repos de código o demos adicionales: no disponibles en la información proporcionada
