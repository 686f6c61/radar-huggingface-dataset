# immanuelpeter/Hy4-Flash-Vision

## Resumen

Hy4-Flash-Vision es un paquete de pesos que extrae la torre de visión (vision tower) y el proyector del modelo multimodal Hy4-flash de Tencent, publicado de forma independiente por el usuario immanuelpeter. No se trata de un modelo generativo completo, sino de un componente de extracción de características visuales: recibe una imagen y devuelve embeddings de dimensión 3072, que es el tamaño oculto del modelo de lenguaje del que procede. La torre se inicializó a partir de SigLIP2-So400m-Patch16-512 de Google y se entrenó posteriormente junto al modelo de lenguaje de Tencent.

El interés técnico reside en que la tabla de posiciones aprendida se extendió a 128 x 128, lo que permite entrada a resolución nativa entre 512 y 2048 píxeles mediante interpolación bilineal. Con 466,6 millones de parámetros y un repositorio de 0,9 GB en BF16, es un componente ligero y reutilizable para pipelines de visión que necesiten alinearse con el espacio latente de Hy4-flash sin cargar el modelo completo.

La relevancia es acotada pero clara: sirve para investigación en alineamiento visión-lenguaje, para extracción de features en tareas de recuperación de imagen o para auditar el comportamiento del encoder visual de Hy4-flash de forma aislada. El modelo es de creación muy reciente (23 de noviembre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer pre-norm (tower) + proyector convolucional; inicializado desde SigLIP2-So400m-Patch16-512 |
| Parametros totales | 466.629.360 (435 tensores de tower + 6 de proyector) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; entrada de imagen de 512 a 2048 px) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; safetensors) |
| Idiomas soportados | no disponible (componente visual, sin salida de texto) |
| Licencia | Tencent Hy License, Version 1.0 (pesos); MIT para el codigo (`modeling_hy4_flash_vision.py`, `examples/inference.py`) |
| Formato de pesos | safetensors (BF16) |
| Hidden size del tower | 1152 |
| Cabezas de atencion | 16 |
| Dimension MLP | 4304 |
| Bloques | 27 (pre-norm, GELU exacta, LayerNorm eps 1e-5, sesgos en todas las capas lineales) |
| Tamano de parche | 16 x 16 px, con sesgo en el patch embedding |
| Tabla de posiciones | absoluta aprendida, 128 x 128 (`[16385, 1152]`, fila 0 sin usar), interpolacion bilineal con `scale_factor = (size + 0.1) / 128`, `align_corners=False` |
| Proyector | RMSNorm (eps 1e-5), `Conv2d(1152, 4608, 2, stride 2)`, GELU, `Conv2d(4608, 3072, 1)`, token `image_newline` aprendido por fila |
| Normalizacion de pixeles | media y desviacion tipica de 0,5 |
| Salida a 512 x 512 | 1024 tokens de ancho 1152 (tower), 256 tokens de ancho 4608 (merge), 256 tokens de ancho 3072 + 16 newline (proyector) |

## Arquitectura y entrenamiento

La torre es un transformer de visión con 27 bloques pre-norm, 1152 dimensiones ocultas, MLP de 4304 y 16 cabezas de atención, con GELU exacta y LayerNorm de epsilon 1e-5. No hay normalización final ni tokens de clase o de registro: la salida del último bloque alimenta directamente el proyector. Los parches son de 16 x 16 píxeles con sesgo en el embedding, y la posición se codifica exclusivamente mediante una tabla absoluta aprendida de 128 x 128, ampliada por Tencent desde la original de SigLIP2 para admitir resolución nativa hasta 2048 px mediante interpolación bilineal.

El proyector aplica RMSNorm, una convolución 2x2 con stride 2 que pasa de 1152 a 4608 canales, GELU y una convolución 1x1 que reduce a 3072, el tamaño oculto del modelo de lenguaje de Hy4-flash. Además inserta un token `image_newline` aprendido tras cada fila de la rejilla, de modo que la secuencia visual conserva información de disposición espacial bidimensional. El entrenamiento de la torre se realizó conjuntamente con el modelo de lenguaje de Hy4-flash; no se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

La validación publicada es relevante para evaluar la fidelidad del export: se comparó cada tensor con el padre fijado usando `torch.equal` y se contrastó la torre, el merge y el proyector con las clases `hy_v4_flash` de transformers (PR #50903, commit `c2ec850510a37978ea83df226589623d5f2be776`). En FP32 sobre CPU todas las celdas son bit-exactas; en BF16 sobre CUDA la mayor diferencia L2 relativa es 0,013, por debajo del 0,017 que cada implementación dista de su propia salida FP32.

## Capacidades

- Extracción de características visuales: devuelve embeddings de 3072 dimensiones alineados con el espacio del modelo de lenguaje de Hy4-flash.
- Procesamiento de imagen a resolución nativa entre 512 y 2048 píxeles gracias a la tabla de posiciones ampliada.
- Codificación de disposición espacial mediante tokens `image_newline` por fila.
- Integración con `transformers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`; la salida del pooler incluye los tokens newline.
- No genera texto, no razona, no ejecuta código ni matemáticas: es un componente de visión, no un modelo de lenguaje.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo.
- Capacidades multilingües: no aplica, no produce salida lingüística.
- No dispone de modo thinking, audio ni vídeo documentado.

## Casos de uso

- Recuperación de imagen (image retrieval): usar los embeddings de 3072 dimensiones como índice vectorial para búsqueda por similitud; el tamaño de salida coincide con el hidden size de Hy4-flash, lo que permite reutilizar infraestructura de búsqueda ya montada para ese modelo.
- Investigación en alineamiento visión-lenguaje: cargar únicamente la torre y el proyector para estudiar cómo se proyectan las features visuales al espacio del LLM sin el coste de cargar Hy4-flash completo.
- Auditoría y depuración del encoder visual de Hy4-flash: al ser un export bit-exacto en FP32, sirve para reproducir y verificar el comportamiento del tower original en pruebas de regresión.
- Preprocesado en pipelines multimodales propios: generar embeddings visuales para un sistema RAG sobre documentos escaneados, capturas o fotografías, alimentando después un LLM distinto al de Tencent.
- Clasificación y etiquetado de imágenes por transferencia: congelar la torre y entrenar una cabeza lineal sobre los embeddings de 3072 dimensiones para tareas de clasificación con datasets pequeños.
- Detección de duplicados y near-duplicates en catálogos de imágenes: comparar embeddings a distintas resoluciones (512 a 2048 px) aprovechando la interpolación posicional para equilibrar coste y detalle.
- Análisis de documentos con layout: los tokens `image_newline` preservan la estructura de filas, útil para tareas que dependen de la disposición espacial del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación numérica documentada es la comprobación de paridad con el modelo padre: bit-exacta en FP32 sobre CPU y con diferencia L2 relativa máxima de 0,013 en BF16 sobre CUDA.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en BF16 para los pesos (466,6 M de parámetros); en FP32, alrededor de 1,9 GB. El pico de memoria depende de la resolución de entrada, ya que a 2048 px la secuencia de parches crece de forma cuadrática respecto a 512 px.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para 512 px en BF16; para 2048 px se recomienda 8 GB o más por la activación de la secuencia de tokens.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes, incluso a resolución alta en BF16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas herramientas no aplican directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash-Vision | 466,6 M | imagen 512-2048 px | embeddings 3072 | Tencent Hy License 1.0 (pesos), MIT (codigo) | Hugging Face |
| SigLIP2-So400m-Patch16-512 | no disponible en la informacion | imagen 512 px | embeddings visuales | no disponible en la informacion | Hugging Face (Google) |
| Hy4-flash (modelo completo) | no disponible en la informacion | imagen + texto | texto | Tencent Hy License 1.0 | Hugging Face (Tencent) |

La comparación con SigLIP2 es la más directa porque Hy4-Flash-Vision se inicializa desde él y conserva su arquitectura de torre, aunque amplía la tabla posicional y añade el proyector hacia 3072 dimensiones. Frente a Hy4-flash completo, este paquete es un subconjunto funcional: no incluye el modelo de lenguaje ni la capacidad generativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings visuales.
- No se documentan sesgos conocidos, pero al derivar de SigLIP2 y de los datos de entrenamiento de Hy4-flash hereda los sesgos visuales de esos corpus, no cuantificados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual, pero los embeddings pueden no representar fielmente conceptos fuera de la distribución de entrenamiento.
- Limitaciones de resolución: por debajo de 512 px o por encima de 2048 px la interpolación posicional puede degradar la calidad; no se documenta comportamiento fuera de ese rango.
- Restricciones de licencia: los pesos están bajo Tencent Hy License 1.0, y la sección 10 añade términos específicos para grandes negocios de Model-as-a-Service que aplican a todo receptor. El uso comercial a gran escala requiere revisar esa cláusula antes de desplegar.
- El código (`modeling_hy4_flash_vision.py` y `examples/inference.py`) es MIT, pero los pesos no; la licencia del código no exime de cumplir la de los pesos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_hy4_flash_vision.py` antes de usarlo en producción.
- Modelo con cero descargas y cero valoraciones en el momento de la ficha: no hay evidencia comunitaria de robustez en producción.
- No se documentan idiomas ni tareas downstream evaluadas, por lo que el rendimiento en aplicaciones concretas debe validarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/immanuelpeter/Hy4-Flash-Vision
- Modelo base Hy4-flash (Tencent): https://huggingface.co/tencent/Hy4-flash
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/hy4_flash.py
- Script de exportación: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/hy4_flash.py
- PR de transformers con las clases `hy_v4_flash`: https://github.com/huggingface/transformers/pull/50903
- Repositorio vision-tower-bench: https://github.com/immanuel-peter/vision-tower-bench
