# nvidia/NVIDIA-Nemotron-Parse-2.0

## Resumen

NVIDIA Nemotron Parse 2.0 es un modelo vision-encoder-decoder de menos de 1.000 millones de parámetros (903.049.225 según los pesos en safetensors) desarrollado por NVIDIA para el parseo estructurado de documentos. Dada una imagen RGB de un documento y un prompt de tarea, el modelo genera una representación en texto con el contenido textual, la clase semántica de cada elemento, sus bounding boxes y el orden de lectura. Sustituye a Nemotron Parse v1.2 y está pensado para flujos de document intelligence, RAG, extracción de datos y curación de datos multimodales.

La arquitectura combina un codificador visual ViT-H basado en NVIDIA C-RADIO, una capa adaptadora de convoluciones 1D con normalización que comprime la secuencia latente visual, y un decodificador mBART de 10 bloques. El tokenizador tiene 72.256 entradas, con una expansión de unos 20.000 tokens respecto a la versión anterior orientada a mejorar la eficiencia multilingüe, e incluye tokens de control como `<predict_bbox>`, `<predict_classes>`, `<predict_text_in_pic>` y la nueva clase `<class_Chart>`.

La relevancia de esta versión radica en tres mejoras concretas: soporte OCR multilingüe ampliado con ganancias notables en escrituras CJK e índicas, mejor extracción de texto manuscrito y parseo de gráficos con conversión de la información visible a tablas estructuradas. El modelo se distribuye con licencia OpenMDW-1.1 y está declarado como apto para uso comercial y no comercial, con despliegue global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-encoder-decoder (ViT-H C-RADIO + adaptador conv 1D + decodificador mBART de 10 bloques) |
| Parametros totales | 903.049.225 (< 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue con soporte ampliado para CJK e indico; lista completa no disponible |
| Licencia | OpenMDW-1.1 (tokenizador bajo CC-BY-4.0) |
| Formato de pesos | safetensors (incluye `auxiliary_prediction_heads.safetensors.extra` separado) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El codificador visual es un ViT-H basado en NVIDIA C-RADIO que procesa la imagen RGB del documento. Un adaptador compuesto por convoluciones 1D y capas de normalización comprime la secuencia de latentes visuales antes de pasarla al decodificador, un mBART de 10 bloques. La generación estándar utiliza los embeddings de entrada y salida del decodificador atados entre sí. Se conserva además una cabeza auxiliar de predicción, entrenada y almacenada aparte en `auxiliary_prediction_heads.safetensors.extra`, para investigación futura en predicción multi-token; ni el `model.safetensors` por defecto ni los ejemplos de Transformers y vLLM la cargan.

El tokenizador, de 72.256 entradas, incorpora una expansión de aproximadamente 20.000 tokens respecto a Nemotron Parse v1.2 para mejorar la eficiencia multilingüe. Incluye tokens de tarea y control (`<predict_bbox>`, `<predict_classes>`, `<predict_text_in_pic>`, `<predict_no_text_in_pic>`) y la clase `<class_Chart>`. El prompt por defecto es `</s><s><predict_bbox><predict_classes><output_markdown><predict_no_text_in_pic>`, que extrae bounding boxes, clases semánticas y texto en formato markdown. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Parseo de documentos: convierte imágenes de páginas en texto estructurado con clases semánticas (títulos, párrafos, pies de figura, tablas, gráficos, cabeceras, pies de página, notas al pie, imágenes y entradas bibliográficas), bounding boxes y orden de lectura.
- OCR multilingüe: soporte ampliado con mejoras sustanciales en escrituras CJK e índicas.
- Extracción de texto manuscrito en páginas con contenido informal o tipo nota.
- Parseo de gráficos a tabla: detecta regiones de gráfico mediante `<class_Chart>` y convierte la información visible en texto estructurado.
- Manejo reforzado de tablas: detección, recuperación de estructura y extracción de texto en documentos con muchas tablas.
- Postprocesado incluido en el repositorio para transformar bounding boxes a coordenadas de la imagen original y convertir texto de tablas o gráficos a LaTeX, HTML, markdown, JSON o CSV cuando el formato lo permite.
- Entrada multimodal imagen-texto con prompts de tarea construidos a partir de tokens de control.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Digitalización de PDFs escaneados para RAG: el modelo convierte cada página en texto con estructura y coordenadas, lo que permite indexar fragmentos por elemento semántico y recuperar tablas o figuras con su contexto espacial.
- Extracción de datos de facturas y formularios: a partir de la imagen renderizada, se obtienen los campos con sus bounding boxes y clases, facilitando el mapeo posterior a esquemas JSON mediante el postprocesado del repositorio.
- Procesamiento de informes financieros con tablas densas: la mejora en detección y recuperación de estructura de tablas permite extraer tablas completas y convertirlas a CSV o HTML para análisis.
- Análisis de presentaciones y transparencias: el modelo identifica títulos, viñetas, imágenes y gráficos, lo que habilita la generación de resúmenes estructurados y la conversión de gráficos a tablas.
- Curación de datasets multimodales: al producir anotaciones de layout y texto, se puede usar para etiquetar automáticamente corpus de imágenes de documentos antes de entrenar otros modelos.
- Revisión humana asistida: los bounding boxes y el orden de lectura permiten construir interfaces de verificación donde el revisor ve el texto extraído superpuesto sobre la página original.
- Documentación multilingüe: con el tokenizador ampliado y el soporte CJK e índico, resulta adecuado para pipelines de OCR en organizaciones con corpus en varios alfabetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 903 millones de parámetros, los pesos en precisión de 16 bits ocupan aproximadamente 1,8 GB; el repositorio completo ocupa 3,6 GB. A ello hay que sumar la memoria de activaciones del codificador ViT-H, que procesa imágenes de hasta 1664x2048 píxeles y es el componente dominante del consumo.
- GPU recomendadas: el modelo está optimizado para sistemas acelerados por GPU NVIDIA; se documentan ejemplos con Transformers y vLLM. Una GPU con 16-24 GB de VRAM es un punto de partida razonable para resolución alta; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque la resolución de entrada recomendada (mínimo 1024x1280, máximo 1664x2048) condiciona el uso de memoria.
- Opciones de despliegue: Transformers (librería declarada), vLLM (se mencionan ejemplos), y despliegue en SageMaker según los tags del repositorio. No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Nemotron Parse 2.0 | 903 M | no disponible | Parseo de documentos, OCR, layout | OpenMDW-1.1 | Hugging Face, Transformers, vLLM |
| NVIDIA Nemotron Parse v1.2 | no disponible | no disponible | Parseo de documentos | no disponible | Hugging Face |
| NVIDIA Nemotron-3.5-Parse | no disponible | no disponible | Parseo de documentos | no disponible | Hugging Face (referenciado como `new_version`) |

La información disponible no incluye datos de benchmarks ni especificaciones completas de las versiones alternativas, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinación en la transcripción de texto: como modelo generativo, puede producir texto que no aparece en la imagen, especialmente en regiones de baja calidad o manuscritas.
- Resolución acotada: la entrada recomendada está entre 1024x1280 y 1664x2048; documentos con tipografía muy pequeña o páginas de gran formato pueden requerir preprocesado.
- Idiomas: aunque se documenta soporte multilingüe ampliado (CJK e índico), no se publica la lista completa de idiomas soportados.
- Contexto: no se especifica la longitud máxima de secuencia del decodificador, lo que limita la planificación de páginas con mucho contenido textual.
- Licencia: el modelo se rige por OpenMDW-1.1 y el tokenizador por CC-BY-4.0; es necesario revisar ambas antes de su uso comercial. El proyecto descarga software de terceros cuyos términos deben verificarse por separado.
- Cabeza auxiliar: `auxiliary_prediction_heads.safetensors.extra` no se carga en la generación estándar; no debe asumirse que aporta capacidades en producción.
- Dependencia de hardware NVIDIA: el modelo está diseñado y optimizado para GPU NVIDIA, sin datos publicados de rendimiento en CPU.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-Parse-2.0
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Licencia CC-BY-4.0 (tokenizador): https://creativecommons.org/licenses/by/4.0/
- Documentación de mBART en Transformers: https://huggingface.co/docs/transformers/en/model_doc/mbart
- NVIDIA C-RADIO: https://huggingface.co/nvidia/C-RADIO
- Nueva versión referenciada: https://huggingface.co/nvidia/Nemotron-3.5-Parse
