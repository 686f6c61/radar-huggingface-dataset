# rleo/UVDoc-GGUF

## Resumen

UVDoc-GGUF es una conversión al formato GGUF del modelo UVDoc (Neural Grid-based Document Unwarping), publicado originalmente en SIGGRAPH Asia 2023 por Floor Verhoeven, Tanguy Magne y Olga Sorkine-Hornung. El modelo resuelve un problema muy concreto de visión por computador: tomar la fotografía de un documento realizada con un teléfono móvil, con perspectiva inclinada, curvatura de página, sombras y dominante de color, y devolver una imagen plana y recortada equivalente a un escaneo. No es un modelo generativo de texto ni un LLM, sino una red de imagen a imagen especializada en la rectificación geométrica de documentos.

La conversión la firma el usuario rleo y está pensada exclusivamente para docscan-rs, un port a Rust sobre Candle del pipeline original. Los pesos se han reempaquetado en un único fichero GGUF con las batch norms plegadas en las convoluciones y eliminada la cabeza 3D usada solo en entrenamiento, conservando únicamente la cabeza de rejilla 2D. El resultado son dos variantes de muy pequeño tamano (32 MB en F32 y 16 MB en F16) con 7.891.971 parámetros, ejecutables en CPU en torno a 0,5 s por foto de 8 MP.

Su relevancia actual es práctica: permite integrar la rectificación de documentos en aplicaciones Rust ligeras, sin depender de PyTorch ni de un runtime Python, y con un enfoque conservador que no redibuja dígitos, firmas ni sellos, algo crítico en digitalización documental con valor probatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional con cabeza de rejilla 2D (UVDoc, neural grid-based document unwarping) |
| Parametros totales | 7.891.971 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a imagen, sin contexto textual) |
| Tipos de cuantizacion | F32 y F16 (pesos de convolucion); sesgos y pendiente PReLU en F32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | GGUF (layout propio de docscan-rs, no compatible con llama.cpp); checkpoint original en .pkl de PyTorch |

## Arquitectura y entrenamiento

UVDoc es una red neuronal convolucional que predice una rejilla deformable (grid) sobre la imagen de entrada y aplica un warping para obtener la imagen rectificada. La innovación principal del trabajo original es el uso de una representación de rejilla 3D durante el entrenamiento que se proyecta a 2D en inferencia; la conversión a GGUF elimina la cabeza 3D y conserva solo la cabeza de rejilla 2D, que es la que se usa en producción. Las batch norms se han plegado dentro de las convoluciones para simplificar el grafo de inferencia.

No se dispone en la información proporcionada de detalles sobre el número de tokens, la composición del dataset de entrenamiento ni la existencia de etapas de RLHF o DPO (no aplicables a un modelo de imagen a imagen). El pipeline completo de docscan-rs incluye decodificación, paso por la red, unwarp y una mejora de tono por píxel; el autor subraya que no hay modelo generativo en la fase de enhancement, de modo que el contenido del documento no se reconstruye ni se inventa.

## Capacidades

- Rectificación de documentos fotografiados: corrige perspectiva, curvatura de página, sombras y dominante de color.
- Entrada en PNG, JPEG o PDF y salida en PNG, JPEG o PDF.
- Modos de salida adicionales como blanco y negro (`--mode bw`) y selección de tamano de papel (`--paper a4`).
- Detección de documentos mediante endpoint dedicado (`/v1/documents/detect`).
- Servicio HTTP con endpoints `/v1/documents/scans` y `/v1/documents/detect`.
- Ejecución en CPU, CUDA y Metal (build con `--cuda` / `--metal`).
- Integración con zallama bajo la modalidad `modality: docscan`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de imagen a imagen.

## Casos de uso

- Digitalización de facturas y tickets desde el móvil: el modelo endereza la captura y elimina sombras antes de pasarla a un OCR, lo que reduce errores de reconocimiento en documentos con curvatura o perspectiva inclinada.
- Escaneo de documentos legales o notariales: al no haber componente generativa, los dígitos, firmas y sellos no se redibujan, lo que lo hace apto para flujos donde la fidelidad del contenido es un requisito.
- Aplicaciones móviles o de escritorio en Rust: al ejecutarse con Candle y pesar 16-32 MB, se puede embeber en un binario sin dependencias de Python ni PyTorch.
- Servicio HTTP de escaneo en backend: mediante `docscan serve` se expone un endpoint REST que puede recibir fotos de múltiples clientes y devolver PDFs A4 normalizados.
- Procesamiento por lotes de archivos históricos o administrativos: el coste de ~0,5 s por imagen de 8 MP en CPU permite procesar lotes grandes en servidores sin GPU.
- Preprocesado en pipelines de OCR/IDP: la imagen rectificada y con tono corregido mejora la tasa de acierto de motores OCR downstream antes de la extracción de campos.
- Integración en asistentes con zallama: un agente puede invocar la modalidad `docscan` para escanear documentos enviados por el usuario dentro de una conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad de la conversión y de latencia:

| Metrica | Valor |
|---|---|
| Desviacion de rejilla vs PyTorch, `uvdoc-f32.gguf` | 0,003 px |
| Desviacion de rejilla vs PyTorch, `uvdoc-f16.gguf` | 0,1 px |
| Latencia foto 8 MP en CPU (pipeline completo) | ~0,5 s |
| Latencia foto 8 MP en CUDA (pipeline completo) | ~0,2 s |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquiera de las dos variantes; el modelo pesa 32 MB (F32) o 16 MB (F16) y las activaciones para una imagen de 8 MP son modestas.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada moderna es más que suficiente.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU sin aceleración, con ~0,5 s por imagen de 8 MP.
- Opciones de despliegue: binario `docscan` (CLI y servidor HTTP) compilado con `build.sh` y flags `--cuda` o `--metal`; también servido por zallama con `modality: docscan`. No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: ~0,5 s por imagen de 8 MP en CPU y ~0,2 s en CUDA para el pipeline completo (decode, red, unwarp, enhancement).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| UVDoc-GGUF (este) | 7,89 M | Document unwarping | GGUF / docscan-rs (Candle) | MIT | Conversión para Rust, sin PyTorch |
| UVDoc original (tanguymagne/UVDoc) | 7,89 M | Document unwarping | .pkl / PyTorch | MIT | Checkpoint de referencia, requiere Python |
| DocTr / DocTr++ | no disponible | Document unwarping | PyTorch | no disponible | Alternativas académicas de rectificación; sin datos de comparación en la información disponible |
| DewarpNet | no disponible | Document unwarping | PyTorch | no disponible | Enfoque previo basado en estimación de mapa 3D; sin datos de comparación en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un LLM ni un modelo de texto: no procesa lenguaje, no tiene contexto textual ni capacidades de razonamiento o tool calling.
- Los GGUF están en el layout propio de docscan-rs y no son compatibles con llama.cpp ni con otros runtimes GGUF estándar.
- La variante F16 introduce una desviación de rejilla de 0,1 px frente a PyTorch; para máxima fidelidad se recomienda F32.
- El modelo está entrenado para documentos; su comportamiento en otro tipo de imágenes (paisajes, rostros, escenas) no está documentado y probablemente sea deficiente.
- No se han publicado evaluaciones de sesgo ni de robustez en condiciones extremas (iluminación muy pobre, documentos muy arrugados, capturas con oclusión parcial).
- Riesgo de alucinación bajo: el pipeline no usa modelo generativo y el enhancement es una curva de tono por píxel, por lo que no inventa contenido; aun así, el warping puede deformar texto si la estimación de rejilla falla.
- Licencia MIT para los pesos originales y para esta conversión; docscan-rs es Apache-2.0. El uso comercial está permitido, pero conviene conservar el aviso de copyright original (© 2023 Tanguy Magne).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/rleo/UVDoc-GGUF
- Repositorio docscan-rs: https://github.com/rzafiamy/docscan-rs
- Repositorio original UVDoc: https://github.com/tanguymagne/UVDoc
- Paper UVDoc (SIGGRAPH Asia 2023): https://doi.org/10.1145/3610548.3618174
- zallama: https://github.com/rzafiamy/zallama
