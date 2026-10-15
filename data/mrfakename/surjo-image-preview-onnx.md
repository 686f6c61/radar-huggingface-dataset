# mrfakename/Surjo-Image-Preview-ONNX

## Resumen

Surjo-Image-Preview-ONNX es la exportación a formato ONNX del modelo de generación de imágenes SurjoLabs/Surjo-Image-Preview, publicada por el usuario mrfakename. Su objetivo no es entrenar un modelo nuevo, sino empaquetar el pipeline completo (encoder de texto, transformer de difusión y decodificador VAE) para que pueda ejecutarse íntegramente en el navegador mediante onnxruntime-web con aceleración WebGPU, sin necesidad de servidor ni GPU remota.

El repositorio incluye tres componentes separados: el encoder de texto LiquidAI/LFM2.5-Encoder-230M (unos 230 millones de parámetros, salida de 1024 dimensiones para 128 tokens), los pasos del transformer de difusión (cada archivo `dit_step_*.onnx` implementa un paso Euler con classifier-free guidance) y el decodificador VAE SurjoLabs/FLUX.2-small-decoder-vae, que convierte latentes de forma (N, 128, 16, 16) en imágenes RGB de 256x256 píxeles.

El modelo maneja latentes de 128 canales y 16x16 de resolución espacial, genera a 256x256 y se muestrea con 50 pasos y escala de guidance 3.0. Los pesos se almacenan en fp16 y se computan en fp32 (sufijo `_fp16w`), con una paridad declarada de aproximadamente 60 dB de PSNR frente al pipeline PyTorch en fp32. Está licenciado bajo Apache 2.0 y publicado el 15 de octubre de 2026; su adopción es todavía muy baja (0 descargas, 2 "me gusta" en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion latente: encoder de texto transformer (LFM2.5-Encoder, ~230 M parametros), transformer de difusion (DiT) con paso Euler y classifier-free guidance, y decodificador VAE |
| Parametros totales | no disponible (el repositorio ocupa 1,8 GB; el encoder de texto declarado tiene ~230 M parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens de texto (`input_ids` y `attention_mask` con forma (1, 128), relleno a la derecha con `<|pad|>`) |
| Tipos de cuantizacion | Pesos en fp16 con computo en fp32 (`_fp16w`); se probo un encoder de texto en int4 y se descarto por alterar demasiado las imagenes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime y onnxruntime-web / WebGPU) |

## Arquitectura y entrenamiento

El repositorio es una exportacion de inferencia, no un entrenamiento nuevo, por lo que no se documentan dataset, numero de tokens ni fases de RLHF o DPO. La informacion disponible en la model card describe unicamente la topologia del pipeline exportado. La generacion sigue un esquema de difusion latente clasico: el texto se tokeniza a 128 posiciones y se codifica con LFM2.5-Encoder-230M en un tensor `hidden` de forma (1, 128, 1024); ese contexto se duplica como `ctx` de forma (2, 128, 1024), con la primera fila correspondiente al prompt vacio y la segunda al prompt real, lo que materializa el classifier-free guidance dentro de cada paso.

Cada archivo `dit_step_*.onnx` implementa un unico paso Euler guiado: recibe el latente `z` (N, 128, 16, 16), el tiempo `t`, el incremento `dt`, la escala `cfg` y el contexto `ctx`, y devuelve `z_next`. El muestreo parte de ruido normal estandar con `t = i/steps` y `dt = 1/steps`, 50 pasos y `cfg = 3.0`. El decodificador `vae_decoder_*.onnx` transforma el latente final en una imagen (N, 3, 256, 256) en el rango [0, 1], e incorpora internamente la desnormalizacion por BatchNorm y el "unpatchify" 2x2. La innovacion practica del repositorio es el propio empaquetado para navegador: variantes de precision `_fp16w` que reducen el peso en disco manteniendo el computo en fp32, y un archivo `onnx/parity.json` con la PSNR de imagen frente al pipeline PyTorch en fp32 como garantia de fidelidad numerica.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resolucion fija de 256x256 píxeles.
- Ejecucion completa en navegador mediante onnxruntime-web con WebGPU, incluyendo encoder de texto, pasos de difusion y decodificador VAE.
- Inferencia local sin conexion a servicios externos de generacion de imagenes.
- Control del numero de pasos de muestreo y de la escala de classifier-free guidance por parte del integrador.
- Exportacion modular en tres grafos ONNX independientes (texto, paso de difusion, VAE), lo que permite reutilizar o sustituir componentes.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta soporte multilingue explicito ni lista de idiomas.
- No se documenta modo "thinking", vision de entrada, audio ni edicion de imagen; la unica modalidad declarada es texto a imagen.
- No se documenta capacidad de inpainting, outpainting, img2img ni control por pose o profundidad.

## Casos de uso

- Demos de generacion de imagenes en el navegador sin backend: al distribuirse como ONNX ejecutable con WebGPU, una pagina web puede generar imagenes 256x256 localmente, sin coste de servidor ni GPU en la nube.
- Aplicaciones con requisitos de privacidad: el prompt y la imagen nunca salen del dispositivo del usuario, lo que encaja en entornos sanitarios, legales o corporativos donde no se permite enviar datos a APIs externas.
- Generacion de avatares y miniaturas: la resolucion de 256x256 es suficiente para fotos de perfil, placeholders y miniaturas de catalogo que luego se escalan o se procesan en el cliente.
- Prototipado rapido de interfaces: equipos de producto pueden integrar el pipeline en una aplicacion web para validar flujos de creacion de contenido antes de invertir en infraestructura de inferencia dedicada.
- Aplicaciones web progresivas (PWA) y uso sin conexion: al no depender de un endpoint remoto, permite generar imagenes en modo offline una vez descargados los pesos.
- Pruebas de regresion en CI para pipelines de difusion: el archivo `onnx/parity.json` y las variantes `_fp16w` permiten comparar la salida ONNX con la referencia PyTorch en fp32 y detectar degradaciones numericas en cada cambio de exportacion.
- Extensiones de navegador y herramientas de accesibilidad: la generacion local habilita funciones de ilustracion automatica en clientes ligeros sin elevar el consumo de red ni comprometer datos del usuario.
- Docencia y experimentacion: el desglose en tres grafos ONNX con formas de tensor documentadas facilita explicar paso a paso como funciona la difusion latente con classifier-free guidance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de evaluacion de imagen como FID o CLIP score) en la informacion disponible. El unico dato cuantitativo de rendimiento publicado es la paridad numerica frente a la implementacion de referencia:

| Variante | Referencia de comparacion | Metrica | Valor declarado |
|---|---|---|---|
| Grafos `_fp16w` (pesos fp16, computo fp32) | Pipeline PyTorch fp32 | PSNR de imagen | ~60 dB |
| Encoder de texto en int4 | Pipeline PyTorch fp32 | Calidad de imagen | Descartado: alteraba demasiado las imagenes |

No se dispone de datos publicados de latencia, throughput ni consumo energetico por paso de difusion.

## Requisitos de hardware

- Tamano del repositorio: 1,8 GB, que incluye los grafos ONNX del encoder de texto, los pasos de difusion y el decodificador VAE. Es la referencia mas fiable disponible para estimar el espacio en disco y el peso de los tensores.
- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion derivada del tamano del repositorio y del uso de fp16, un presupuesto del orden de 2 a 4 GB de memoria es plausible para cargar los grafos y los latentes (128x16x16 por muestra), pero esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponibles. El autor orienta el despliegue a WebGPU, de modo que el objetivo son GPU integradas y dedicadas de portatil o sobremesa con soporte WebGPU en el navegador.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio y la resolucion de salida de 256x256, pero no hay confirmacion oficial ni lista de modelos verificados.
- Opciones de despliegue: onnxruntime-web con WebGPU (destino principal declarado), onnxruntime en Python o C++ para escritorio y servidor, e integracion en cualquier runtime compatible con los tres grafos ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un pipeline de difusion de imagen.
- Latencia y throughput estimados: no disponibles. Dependen del numero de pasos (50 configurados por defecto), de la escala `cfg` y del hardware WebGPU concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Resolucion de salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Surjo-Image-Preview-ONNX (este repositorio) | no disponible (encoder de texto ~230 M) | 128 tokens | 256x256 | ONNX (onnxruntime-web, WebGPU) | Apache 2.0 | HuggingFace, 0 descargas y 2 "me gusta" al redactar la ficha |
| SurjoLabs/Surjo-Image-Preview (modelo base) | no disponible | no disponible | no disponible | no disponible (pesos PyTorch, segun el pipeline de referencia) | Apache 2.0 | HuggingFace |
| Otros exports ONNX de difusion para navegador | no disponible | no disponible | no disponible | ONNX | no disponible | no disponible |

No se dispone de datos verificados de modelos alternativos comparables en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento de terceros.

## Limitaciones y advertencias

- Resolucion de salida fija de 256x256 píxeles, insuficiente para impresion o para casos que requieran detalle fino; no se documenta escalado o superresolucion integrada.
- Ventana de texto de 128 tokens con relleno obligatorio a la derecha con `<|pad|>`: los prompts largos o con muchos detalles no caben y no se documenta truncado automatico.
- Se desconoce el dataset de entrenamiento del modelo base, por lo que no puede evaluarse el riesgo de sesgos de generacion, de reproduccion de estilos protegidos ni de contenido inapropiado.
- Riesgo de artefactos propios de la difusion latente: anatomia incorrecta, texto ilegible en la imagen y coherencia limitada en escenas complejas; no se han publicado metricas de FID o CLIP que permitan acotar ese riesgo.
- La cuantizacion int4 del encoder de texto se probo y se descarto porque cambiaba demasiado las imagenes, lo que indica una sensibilidad alta del pipeline a la precision del encoder de texto.
- La paridad de ~60 dB de PSNR frente a PyTorch fp32 no garantiza salidas identicas bit a bit ni la misma calidad subjetiva en todos los prompts.
- La licencia declarada es Apache 2.0, pero el repositorio es una exportacion de un modelo base de terceros: conviene verificar las condiciones del modelo original SurjoLabs/Surjo-Image-Preview, del encoder LiquidAI/LFM2.5-Encoder-230M y del VAE SurjoLabs/FLUX.2-small-decoder-vae antes de un uso comercial.
- No hay informacion sobre idiomas soportados en los prompts; el comportamiento multilingue es desconocido.
- El modelo no ofrece tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para tareas de razonamiento o automatizacion agentica.
- Adopcion muy baja (0 descargas, 2 "me gusta") y publicacion reciente: no existe ecosistema de reportes de fallos ni validacion independiente.
- No se documentan requisitos minimos de memoria ni navegadores o versiones de WebGPU verificadas, lo que complica garantizar el funcionamiento en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrfakename/Surjo-Image-Preview-ONNX
- Modelo base: https://huggingface.co/SurjoLabs/Surjo-Image-Preview
- Encoder de texto: https://huggingface.co/LiquidAI/LFM2.5-Encoder-230M
- Decodificador VAE: https://huggingface.co/SurjoLabs/FLUX.2-small-decoder-vae
- Perfil del autor: https://huggingface.co/mrfakename
- Datos de paridad numerica: `onnx/parity.json` dentro del repositorio
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
