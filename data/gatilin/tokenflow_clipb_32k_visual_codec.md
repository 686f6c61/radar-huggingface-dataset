# gatilin/tokenflow_clipb_32k_visual_codec

## Resumen

TokenFlow CLIP-B 32K visual codec es un tokenizador de imagen discreto multi-escala publicado por el usuario gatilin como réplica cargable del checkpoint oficial `tokenflow_clipb_32k_enhanced.pt` de ByteVisionLab/TokenFlow. No es un modelo de lenguaje: empaqueta el encoder semántico CLIP-B/16, el encoder de píxeles, los dos codebooks (semántico y de píxeles), el cuantizador residual multi-escala, el decoder semántico y el decoder RGB mejorado, con 649 tensores que conservan nombres, dtypes y valores originales. El total declarado en safetensors es de 376.700.715 parámetros y el repositorio ocupa 1,5 GB.

El problema que resuelve es de ingeniería de reproducibilidad: permite cargar el codec completo con un único `snapshot_download` y un `load_model(folder)`, sin descargar aparte los pesos del tower visual de CLIP ni reconstruir a mano el grafo nativo. El adaptador fija las clases originales a la revisión `9812da01c0695f4989060cc4eea053715e9e4441` y documenta dos ajustes: compatibilidad de los helpers de device/dtype y construcción de la rama CLIP ya incluida en el checkpoint sin descarga de red redundante.

Su relevancia es acotada pero clara para quien investiga modelos multimodales unificados: entrega tokens visuales discretos con un vocabulario de 32.768 códigos y nueve escalas espaciales, lo que permite experimentar con pipelines de imagen a imagen, compresión y entrenamiento de MLLM sin depender de utilidades propietarias. El propio autor advierte que la validación realizada cubre integridad de pesos y paridad de decodificación, no calidad de imagen ni rendimiento en VQA o generación texto-imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador de imagen con cuantización residual multi-escala (TokenFlow): encoder semántico CLIP-B/16, encoder de píxeles, dos codebooks, cuantizador residual, decoder semántico y decoder RGB mejorado |
| Parámetros totales | 376.700.715 (376,7 M) |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible (no procesa texto) |
| Tipos de cuantización | No se distribuyen pesos cuantizados: solo safetensors con los dtypes originales. La cuantización interna del tokenizador es residual multi-escala con 32.768 códigos |
| Idiomas soportados | no disponible (el paquete incluye únicamente la rama visual; no incluye la torre de texto de CLIP) |
| Licencia | MIT para los pesos; Apache-2.0 para el código fuente; el componente CLIP derivado conserva la licencia MIT de OpenAI |
| Formato de pesos | safetensors (PyTorch); 649 tensores; el checkpoint de referencia es `tokenflow_clipb_32k_enhanced.pt` |
| Vocabulario de código | 32.768 entradas (32K) |
| Escalas espaciales | `[1, 2, 4, 6, 8, 10, 12, 14, 16]`, concatenadas en ese orden |
| Entrada | Tensor RGB NCHW en el rango `[-1, 1]` (ejemplo documentado: `1x3x256x256`) |
| Salida | `quantized`, `losses`, `ids` en `encode`; `semantic_features` y `reconstructed_rgb` en `decode_code` |
| Tamaño del repositorio | 1,5 GB |
| Librería | PyTorch |
| Pipeline declarado | image-to-image |

## Arquitectura y entrenamiento

La arquitectura es un tokenizador visual jerárquico con dos codebooks acoplados. El encoder semántico es un CLIP-B/16 entrenado (parche de 16 px, maestro a 224 px con `infer_interpolate=True`); en paralelo, un encoder de píxeles captura información de baja frecuencia que el espacio semántico no retiene. Ambos flujos alimentan un cuantizador residual que opera sobre nueve escalas — `[1, 2, 4, 6, 8, 10, 12, 14, 16]` — y cuyos identificadores se concatenan en cuadrículas cuadradas en ese mismo orden. La reconstrucción exige vectores de ambos codebooks: truncar uno de los dos rompe la representación residual. La decodificación produce simultáneamente features semánticas y RGB, con un decoder RGB "mejorado" respecto a la variante base.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de datos ni si hubo RLHF, DPO o cualquier etapa de alineación; estos datos no están en la información proporcionada. Lo que sí está documentado es el proceso de empaquetado: los pesos provienen de la revisión `5924ad7f25fe030292de3995912b895ab9fd9321` de ByteVisionLab/TokenFlow y las clases de cómputo nativas se fijan a la revisión `9812da01c0695f4989060cc4eea053715e9e4441`. Las dos únicas modificaciones son de compatibilidad (helpers de device y dtype) y de construcción de la rama CLIP ya contenida en el checkpoint para evitar una descarga de red redundante; las clases originales de cálculo de tensores se mantienen. Los artefactos `source_reconstruction.sh`, `code_provenance.json` y `validation.json` documentan la procedencia.

## Capacidades

- Codificación de imágenes RGB a identificadores discretos en nueve escalas espaciales, con vocabulario de 32.768 códigos.
- Decodificación de identificadores a representación residual y a RGB reconstruido, devolviendo además features semánticas.
- Extracción de características semánticas tipo CLIP-B/16 sin necesidad de descargar por separado los pesos del tower visual.
- Control de la tasa de información mediante truncado de escalas: los IDs concatenan las cuadrículas de 1 a 16, de modo que pueden usarse subconjuntos de escalas.
- Funcionamiento en modo inferencia puro (`torch.inference_mode()`), sin dependencias de generación autorregresiva.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no incluye torre de texto.
- No incorpora thinking mode, visión de alto nivel, audio ni generación texto-imagen.

## Casos de uso

- Entrenamiento de modelos multimodales unificados: el codec convierte imágenes en secuencias discretas de hasta 32.768 códigos posibles, lo que permite alimentar un transformer de lenguaje con tokens visuales y reutilizar el vocabulario cerrado en la cabeza de salida.
- Compresión de imagen con tasa ajustable: codificar con las nueve escalas y truncar las de mayor frecuencia para obtener distintos niveles de tasa sin reentrenar; el par codebook semántico y de píxeles permite reconstruir detalles que un codebook puramente semántico perdería.
- Recuperación y búsqueda visual: `decode_code` devuelve features semánticas alineadas con el espacio CLIP-B/16, utilizables como embeddings para índice vectorial o similitud coseno sin mantener un CLIP aparte.
- Reproducción de experimentos de TokenFlow: las clases nativas están fijadas a una revisión concreta y los hashes de payload validados, lo que permite comparar resultados contra el checkpoint oficial en igualdad de condiciones.
- Auditoría y trazabilidad de checkpoints: `code_provenance.json` y `validation.json` acompañan la release, útiles en entornos donde se exige verificar que los pesos cargados coinciden con el origen declarado.
- Ajuste fino del decoder RGB: al incluir el decoder mejorado y los codebooks completos, es posible especializar la reconstrucción en un dominio concreto (documentos escaneados, imagen médica, satélite) manteniendo congelado el encoder.
- Preprocesado en pipelines de imagen a imagen: el par encode/decode sirve como cuello de botella discreto para tareas de restauración, eliminación de ruido o traducción entre dominios, con el RGB reconstruido como salida del pipeline.
- Docencia y prototipado de cuantización residual multi-escala: el código es legible y las escalas están expuestas, lo que facilita experimentos sobre el compromiso entre número de escalas y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor lo indica explícitamente: la reconstrucción sintética empleada en la validación "no establece calidad de imagen ni rendimiento completo en MLLM/VQA/text-to-image". No hay cifras de FID, PSNR, SSIM, rFID, MMLU ni HumanEval, y este modelo no es evaluable en benchmarks de texto.

La validación documentada cubre exclusivamente integridad y consistencia:

| Prueba de validación | Alcance |
|---|---|
| Hashes de payload de tensores | Todos los tensores de origen |
| Carga estricta | Correspondencia exacta de nombres y dtypes |
| Geometría y límites de IDs | Nueve escalas |
| Reconstrucción por lookup residual | Representación residual |
| Salidas finitas | Features semánticas y RGB |
| Paridad de decodificación | `decode_code` frente a decodificación canónica por lookup |

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,5 GB (376,7 M de parámetros × 4 bytes), coherente con el tamaño del repositorio.
- Pesos en FP16/BF16: aproximadamente 754 MB.
- Cuantización INT8: aproximadamente 377 MB; INT4: aproximadamente 188 MB. Son estimaciones teóricas: no hay versiones cuantizadas publicadas.
- VRAM estimada para inferencia a 256×256 con batch 1: del orden de 2-3 GB incluyendo activaciones (estimación a partir del recuento de parámetros, no medida publicada).
- GPU recomendadas: cualquier GPU con 6-8 GB o más; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. No requiere memoria unificada ni particionado por tensor.
- Ejecución en CPU: viable por tamaño, aunque sin datos de latencia.
- Opciones de despliegue: PyTorch nativo mediante `component.load_model` y `torch.inference_mode()`. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, que no aplican a un codec visual.
- Latencia y throughput: no disponible.
- Resolución: el único ejemplo documentado es 256×256; el rango completo soportado no está especificado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Vocabulario de código | Escalas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokenFlow CLIP-B 32K enhanced (este repositorio) | Tokenizador de imagen + decoder RGB | 376,7 M | 32.768 | 9 | MIT (pesos) / Apache-2.0 (código) | HuggingFace; 0 descargas, 0 likes |
| ByteVisionLab/TokenFlow | Modelo base del que procede el checkpoint | no disponible (el checkpoint replicado aquí declara 376,7 M) | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |
| Tokenizadores de imagen alternativos (VQGAN, SD-VAE, Cosmos, SEED) | Tokenizadores discretos o continuos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de parámetros, contexto ni métricas de los modelos alternativos en la información proporcionada, por lo que no se establece comparación cuantitativa. La diferencia funcional frente al modelo base es de empaquetado: este repositorio incluye la reconstrucción del checkpoint, los pesos CLIP ya integrados y los artefactos de procedencia, con las clases nativas fijadas a revisiones concretas.

## Limitaciones y advertencias

- El autor advierte explícitamente de que la validación realizada es sintética y no acredita calidad de imagen, rendimiento en MLLM, VQA ni generación texto-imagen.
- No hay métricas de reconstrucción publicadas (PSNR, SSIM, LPIPS, FID, rFID); cualquier evaluación de calidad debe hacerla el usuario.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad.
- No es un modelo entrenado por el autor del repositorio: es una réplica del checkpoint oficial. La responsabilidad sobre el comportamiento del modelo recae en ByteVisionLab.
- Licencias encadenadas: pesos bajo MIT, código bajo Apache-2.0 y componente CLIP bajo la MIT de OpenAI. Antes de uso comercial deben revisarse `LICENSE`, `CODE_LICENSE` y `CLIP_LICENSE` por separado.
- Dependencia fuerte de PyTorch y de las clases nativas fijadas a la revisión `9812da01c0695f4989060cc4eea053715e9e4441`; cambios de versión del framework pueden romper la carga estricta.
- Al no incluir la torre de texto de CLIP, no hay capacidades lingüísticas, multilingües ni de instrucciones.
- No se distribuyen cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.
- La reconstrucción requiere ambos codebooks: usar solo el semántico invalida la representación residual.
- Sesgos: no disponibles en la información proporcionada; al derivar de un encoder CLIP, es esperable heredar los sesgos de su corpus de entrenamiento, aunque no se documentan.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en reconstrucción, el riesgo equivalente es la invención de detalles plausibles en zonas de baja información, no cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gatilin/tokenflow_clipb_32k_visual_codec
- Modelo base: https://huggingface.co/ByteVisionLab/TokenFlow
- Revisión de pesos de origen: https://huggingface.co/ByteVisionLab/TokenFlow/tree/5924ad7f25fe030292de3995912b895ab9fd9321
- Artefactos de procedencia en el repositorio: `source_reconstruction.sh`, `code_provenance.json`, `validation.json`
- Licencias en el repositorio: `LICENSE` (MIT, pesos), `CODE_LICENSE` (Apache-2.0), `CLIP_LICENSE` (MIT de OpenAI)
