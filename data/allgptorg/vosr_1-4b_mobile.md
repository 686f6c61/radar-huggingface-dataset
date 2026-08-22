# AllGPTORG/VOSR_1.4B_Mobile

## Resumen

VOSR 1.4B Mobile es un paquete de despliegue para dispositivos móviles del modelo VOSR-1.4B one-step, un modelo generativo de superresolución y restauración de imágenes desarrollado por el equipo de CSWRY (paper CVPR2026, arXiv:2604.03225). El paquete, publicado por AllGPTORG, está cuantizado y compilado como grafos Qualcomm QNN DLC específicamente para el NPU del Snapdragon 8 Gen 3 (SM8650), lo que permite ejecutar el modelo completo en un smartphone sin depender de la nube.

El modelo base VOSR combina un extractor de características semánticas DINOv2-L, un autoencoder Qwen VAE y un Diffusion Transformer (DiT) de 1.400 millones de parámetros. El proceso de entrenamiento primero genera un modelo multi-step y luego lo destila a una sola etapa (one-step) para lograr inferencia eficiente. El paquete móvil divide la red en nueve grafos DLC que deben ejecutarse en orden, con cuantización mixta: pesos INT4 en los bloques DiT, INT8 en los grafos auxiliares y FP16 en el decodificador VAE. También se incluye una variante para Raspberry Pi 5 con ONNX Runtime.

La relevancia actual de este modelo radica en que permite superresolución generativa de alta calidad (incluyendo imágenes con texto) directamente en hardware de consumo, con un tamaño total de contexto de 512x512 píxeles por tile y un paquete DLC de 1,617 GiB. Es una alternativa práctica a los modelos de superresolución tradicionales basados en CNN, con capacidades de restauración generativa que preservan detalles reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VOSR (Vision-Only Super-Resolution): DINOv2-L + Qwen VAE + Diffusion Transformer (DiT) |
| Parametros totales | 1.400 millones (1.4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen 512x512) |
| Tipos de cuantizacion | W4A16 (bloques DiT), W8A16 (grafos auxiliares), FP16 (decodificador VAE) |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | QNN DLC (para Snapdragon 8 Gen 3) y ONNX (para Raspberry Pi 5) |

## Arquitectura y entrenamiento

El modelo base VOSR es un marco de restauracion generativa de imagenes que unifica tres componentes: un extractor de caracteristicas semanticas DINOv2-L (capa 17), un autoencoder Qwen VAE para el espacio latente, y un Diffusion Transformer (DiT) de 36 bloques que opera sobre latentes de 64x64. El entrenamiento sigue un proceso de dos fases: primero se entrena un modelo multi-step para alta calidad de generacion y luego se destila a una version one-step para inferencia eficiente. El paper describe que el modelo integra condicion semantica visual, guia orientada a restauracion y destilacion one-step en un unico marco.

El paquete movil de AllGPTORG no es un checkpoint de Transformers ni Diffusers, sino un conjunto de artefactos de despliegue. La red se divide en nueve grafos DLC que se ejecutan secuencialmente: DINOv2-L, encoder VAE, preparacion del DiT, seis etapas de bloques DiT (00-12, 12-18, 18-24, 24-36), grafo final y decodificador VAE. La cuantizacion es mixta: los pesos de los bloques DiT se cuantizan a INT4 (W4A16), los grafos auxiliares a INT8 (W8A16), y el decodificador VAE se mantiene en FP16 para preservar el detalle espacial. El paquete EPContext para Snapdragon 8 Gen 3 incluye once binarios de contexto pre-enlazados con QAIRT 2.45.0, con finalizacion O1 para mantenerse dentro del presupuesto de 8 MiB de VTCM.

## Capacidades

- Superresolucion generativa de imagenes: amplia imagenes de baja resolucion a 512x512 píxeles por tile con calidad fotorealista.
- Restauracion de imagenes: recupera detalles finos, bordes y texturas en imagenes degradadas o antiguas.
- Manejo de imagenes con texto: el modelo esta disenado para preservar la legibilidad de texto en imagenes, un caso tipicamente dificil para superresolucion clasica.
- Inferencia one-step: genera el resultado en una sola pasada, sin necesidad de multiples iteraciones de difusion.
- Ejecucion en hardware movil: compilado para el NPU del Snapdragon 8 Gen 3, con soporte para tiling de imagenes grandes.
- Despliegue en CPU: la variante para Raspberry Pi 5 usa ONNX Runtime con cuantizacion MatMulNBits INT8, permitiendo ejecucion en entornos sin GPU.
- No incluye capacidades de texto, tool calling, agentes ni multimodalidad general: es exclusivamente un modelo de vision para restauracion de imagenes.

## Casos de uso

- Mejora de fotos en smartphones Android: integracion en aplicaciones de camara o galeria para ampliar y restaurar fotos directamente en el dispositivo, aprovechando el NPU del Snapdragon 8 Gen 3. El paquete EPContext pre-enlazado permite una integracion directa con el runtime QNN.
- Restauracion de imagenes antiguas o danadas: el modelo puede recuperar detalles perdidos en fotografias escaneadas o degradadas, incluyendo bordes y texturas, gracias a su naturaleza generativa one-step.
- Superresolucion de documentos y capturas con texto: ideal para mejorar imagenes de documentos, recibos o capturas de pantalla donde la legibilidad del texto es critica. El modelo esta especificamente disenado para preservar texto.
- Procesamiento en la nube para servicios de fotografia: la variante para Raspberry Pi 5 (paquete `pi/w8a16`) se usa en AllCamera Cloud AI para procesar trabajos de superresolucion de 40x 2 MP, con validacion de calidad mediante metricas de PSNR y correlacion.
- Aplicaciones de fotografia computacional: integracion en pipelines de captura para mejorar la resolucion efectiva de sensores limitados, combinando la salida del modelo con tecnicas de fusion de multiples fotogramas.
- Mejora de imagenes para vision artificial: preprocesamiento de imagenes de baja resolucion antes de pasarlas a modelos de deteccion o clasificacion, mejorando la precision en entornos con sensores de baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como PSNR en Set5, Set14, Urban100, etc.) en la informacion disponible. El autor proporciona metricas internas de validacion:

| Metrica | Valor | Contexto |
|---|---|---|
| PSNR (RMSNorm) | 72.9 dB | Comparacion CPU contra bloque QDQ no modificado |
| PSNR (decodificador VAE) | 59.77 dB | Comparacion del contexto FP16 SM8650 contra decodificador ONNX CPU |
| Error maximo por canal | 1 nivel RGB | Decodificador VAE FP16 |
| PSNR (cuantizacion Pi) | 49.34 dB | Comparacion del paquete W8A16 contra referencia FP16 en un parche de zoom real |
| Correlacion RGB | 0.99986 | Paquete Pi W8A16 |
| Tamano DLC total | 1.617 GiB | Paquete movil completo |
| Tamano contexto EPContext | 1.062 GiB | Paquete Snapdragon 8 Gen 3 |

Estas metricas validan la fidelidad de la cuantizacion, pero no son comparables con benchmarks academicos estandar.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Gen 3 (SM8650) con NPU Hexagon, target DSP v75, SoC model 57. Se requiere el SDK Qualcomm AI Engine Direct (QNN) para cargar y ejecutar los grafos DLC.
- Memoria: el paquete EPContext requiere 8 MiB de VTCM (memoria de tensor vectorial) en el HTP. El paquete completo de contexto ocupa 1.062 GiB en almacenamiento.
- Dispositivo de referencia: Samsung Galaxy S24 family con Android 14.
- Alternativa CPU: Raspberry Pi 5 con 8 GB de RAM. El paquete W8A16 usa ONNX Runtime 1.28 (ARM64) y ejecuta los grafos uno a uno para no mantener el pipeline completo en memoria. El pico de RSS medido es de 557 MB con cuantizacion, frente a 1.84 GB con FP16.
- No se proporcionan requisitos de VRAM para GPUs de escritorio, ya que el paquete no esta disenado para CUDA.
- Opciones de despliegue: Qualcomm QNN runtime (para Snapdragon), ONNX Runtime (para Raspberry Pi). No es compatible con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente con otros modelos de superresolucion generativa (como Real-ESRGAN, SwinIR, o modelos de difusion como Stable Diffusion Upscaler) en terminos de rendimiento y licencia. El modelo VOSR se distingue por su enfoque one-step y su despliegue especifico en NPU movil, pero no hay datos publicos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio contiene artefactos de despliegue QNN, no un checkpoint de Transformers o Diffusers. No se puede cargar con `from_pretrained()`.
- Requiere el SDK Qualcomm AI Engine Direct y un dispositivo compatible con Snapdragon 8 Gen 3. No funciona en GPUs de escritorio ni en otros SoC sin adaptacion.
- El tamaño de tile esta fijado a 512x512 píxeles. Imagenes mayores deben dividirse en tiles, lo que puede introducir artefactos en los bordes si no se gestiona correctamente.
- La cuantizacion INT4 de los bloques DiT puede degradar la calidad en imagenes con texturas muy finas o patrones periodicos, aunque las metricas internas muestran una fidelidad alta (72.9 dB PSNR en la validacion de RMSNorm).
- El decodificador VAE se mantiene en FP16 para preservar el detalle; una version W8A16 anterior elimino casi todo el detalle espacial, por lo que no se recomienda cuantizar ese componente.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue depende de herramientas propietarias de Qualcomm (QAIRT, QNN SDK) que pueden tener sus propias restricciones.
- No hay informacion sobre sesgos o alucinaciones especificas del modelo, pero al ser generativo, puede inventar detalles en imagenes muy degradadas o ambiguas.
- El modelo no procesa texto ni tiene capacidades multimodales generales; solo acepta imagenes como entrada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AllGPTORG/VOSR_1.4B_Mobile
- Modelo base en HuggingFace: https://huggingface.co/CSWRY/VOSR
- Repositorio GitHub del modelo VOSR: https://github.com/cswry/VOSR
- Paper en arXiv: https://arxiv.org/html/2604.03225v1
