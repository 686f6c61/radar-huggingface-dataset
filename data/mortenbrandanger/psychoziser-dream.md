# MortenBrandanger/psychoziser-dream

## Resumen

psychoziser-dream es un paquete de pesos ONNX publicado por MortenBrandanger para ejecutar generación de imagen a imagen directamente en el navegador mediante WebGPU y onnxruntime-web. No es un modelo entrenado desde cero, sino una exportación y cuantización a fp16 de tres componentes conocidos: el UNet de SDXS-512-0.9 (IDKiro), y el par encoder/decoder de TAESD (madebyollin). El repositorio ocupa 0,7 GB y está pensado para un caso de uso muy concreto: redibujar en vivo la imagen de una webcam en la GPU del propio visitante, sin enviar datos a ningún servidor.

El modelo resuelve el problema de desplegar difusión en el cliente con requisitos de hardware mínimos. SDXS-512-0.9 es una destilación de Stable Diffusion que reduce drásticamente los pasos de muestreo, y TAESD sustituye al VAE completo por un autoencoder de pocos millones de parámetros, lo que permite mantener el conjunto en un tamaño manejable para descarga web. La exportación fija el latente en 64x36, es decir, una resolución de salida de 512x288, adecuada para un formato panorámico de cámara pero no para generación de alta resolución.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue, no de un modelo de propósito general. No hay model card con datos de entrenamiento, benchmarks ni idiomas, y el repositorio no registra descargas ni likes en el momento de la consulta. Su interés está en servir como ejemplo de pipeline ONNX + WebGPU para image-to-image en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión (SDXS-512-0.9) + Tiny AutoEncoder (TAESD) para encoder/decoder latente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | fp16 para el UNet ONNX; el resto de tipos no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin componente de texto) |
| Licencia | openrail++ en el repositorio; el UNet hereda CreativeML OpenRAIL++-M y TAESD es MIT |
| Formato de pesos | ONNX (`sdxs_unet_fp16.onnx`, `taesd_encoder.onnx`, `taesd_decoder.onnx`) |

## Arquitectura y entrenamiento

El componente principal es el UNet de SDXS-512-0.9, una variante destilada de Stable Diffusion 1.5 orientada a reducir el número de pasos de inferencia. El autor lo exportó a ONNX con un latente fijo de 64x36 (salida 512x288) y lo convirtió a fp16. El encoder y el decoder latentes son TAESD, un autoencoder ligero que sustituye al VAE estándar y que aquí se distribuye como dos grafos ONNX separados, obtenidos a través de la exportación de ai-inspire/latentmux-taesd-onnx. El pipeline completo es, por tanto, encoder TAESD → UNet SDXS → decoder TAESD, ejecutado con onnxruntime-web sobre WebGPU.

No hay información sobre el entrenamiento original en la model card de este repositorio: los detalles de dataset, número de tokens de imagen, destilación o ajuste pertenecen a los modelos de origen (IDKiro/sdxs-512-0.9 y madebyollin/taesd) y no se reproducen aquí. Tampoco se documenta si hubo RLHF, DPO ni ninguna fase de alineación, algo esperable en un modelo de difusión de este tipo. La innovación técnica relevante es de despliegue: latente fijo, fp16 y separación encoder/decoder para minimizar el coste de memoria en el cliente.

## Capacidades

- Generación de imagen a imagen (image-to-image) a partir de una imagen de entrada, con salida fija de 512x288.
- Redibujado en vivo de fotogramas de cámara en el navegador, ejecutado íntegramente en la GPU del visitante mediante WebGPU.
- Ejecución local sin envío de datos a servidores, según declara el autor en la model card.
- Inferencia con onnxruntime-web sobre el backend WebGPU.
- No incluye codificador de texto: no hay soporte de prompts de texto, tool calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No dispone de modo thinking, visión de alto nivel, audio ni otras capacidades multimodales más allá del propio pipeline de imagen.

## Casos de uso

- Efecto de cámara artístico en una web app: el pipeline toma cada fotograma de la webcam, lo codifica con TAESD, lo pasa por el UNet SDXS y lo decodifica, produciendo un redibujado estilizado en tiempo real sin salir del navegador.
- Demo interactiva de difusión en el cliente: sirve para mostrar a desarrolladores cómo montar un pipeline image-to-image con ONNX y WebGPU sin backend, con un repo de 0,7 GB que se puede cachear.
- Prototipado de filtros generativos para videollamada o streaming: al ejecutarse en la GPU local, evita costes de servidor y latencia de red, a cambio de una resolución y calidad acotadas.
- Aplicaciones de privacidad por diseño: escenarios donde la imagen del usuario no debe abandonar el dispositivo, como herramientas educativas o de accesibilidad que procesan cámara en local.
- Base para experimentos de destilación y cuantización en el navegador: el par TAESD + SDXS es un punto de partida útil para medir latencia y memoria de un pipeline de difusión en WebGPU.
- Integración en instalaciones o kioscos con hardware consumer: al no requerir GPU de servidor, puede desplegarse en equipos con una GPU integrada compatible con WebGPU, siempre que se valide el rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo pesa 0,7 GB en fp16 y el UNet es el componente dominante, por lo que el pico de memoria en GPU será superior al tamaño de los pesos y debe medirse en el dispositivo objetivo.
- GPU recomendadas: no hay recomendaciones del autor; el requisito real es un navegador con soporte de WebGPU (Chrome/Edge en versiones recientes) y una GPU compatible con ese backend.
- ¿Cabe en GPU consumer? Sí, el diseño apunta a GPU de consumo e integradas, pero no se documenta qué modelos concretos cumplen los requisitos de latencia para uso en vivo.
- Opciones de despliegue: onnxruntime-web con backend WebGPU; también puede ejecutarse en otros runtimes ONNX fuera del navegador, aunque no es el objetivo declarado.
- Latencia y throughput: no disponibles. Al ser un pipeline en vivo, la latencia por fotograma es el parámetro crítico y depende del hardware del visitante.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| psychoziser-dream | UNet SDXS + TAESD en ONNX | 512x288 fija | openrail++ / OpenRAIL++-M | Navegador (WebGPU) | Paquete de despliegue, no modelo original |
| IDKiro/sdxs-512-0.9 | UNet de difusión destilado | 512x512 | CreativeML OpenRAIL++-M | Servidor / local | Modelo de origen del UNet |
| madebyollin/taesd | Autoencoder ligero | no aplica (latente) | MIT | Cualquiera con ONNX/PyTorch | Modelo de origen del encoder/decoder |
| ai-inspire/latentmux-taesd-onnx | TAESD exportado a ONNX | no aplica (latente) | no disponible en la informacion | ONNX | Fuente de la exportación ONNX de TAESD |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Resolución de salida fija de 512x288 por el latente de 64x36; no admite otras resoluciones sin reexportar el grafo.
- No hay codificador de texto ni prompts: el control sobre el resultado es limitado y depende de la imagen de entrada y de los parámetros de muestreo.
- Al ser una destilación de pocos pasos, la calidad y el detalle son inferiores a los de modelos de difusión completos; no se documenta fidelidad ni métricas.
- Licencia: el UNet hereda CreativeML OpenRAIL++-M con sus restricciones de uso (Attachment A), que se aplican a cualquiera que use estos ficheros; TAESD es MIT. El repositorio declara openrail++, por lo que conviene revisar `LICENSE-SDXS.txt` antes de un uso comercial.
- El autor indica que IDKiro/sdxs-512-0.9 declara la licencia pero no incluye fichero de licencia; el texto incluido aquí procede de stable-diffusion-xl-base-1.0.
- Sin datos de sesgos, alucinación visual ni evaluación de seguridad; no hay información sobre filtros de contenido.
- Dependencia de WebGPU: navegadores o dispositivos sin soporte no podrán ejecutar el pipeline.
- Repositorio sin descargas ni likes registrados y creado recientemente según los metadatos; no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MortenBrandanger/psychoziser-dream
- Modelo de origen del UNet: https://huggingface.co/IDKiro/sdxs-512-0.9
- Modelo de origen del autoencoder: https://huggingface.co/madebyollin/taesd
- Exportación ONNX de TAESD: https://huggingface.co/ai-inspire/latentmux-taesd-onnx
- Licencia de referencia CreativeML OpenRAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
