# genganbanette/lovebot-realcartoon3d-lcm

## Resumen

lovebot-realcartoon3d-lcm es un empaquetado de inferencia, no un modelo entrenado desde cero. Se trata de una conversión a ONNX fp16 del punto de control RealCartoon3D v18 (estilo cartoon 3D, familia Stable Diffusion 1.5), a la que se le han fundido dos componentes adicionales: el LCM-LoRA de SD 1.5, que permite generar imágenes en 4-10 pasos de muestreo, y el IP-Adapter plus de SD 1.5, que añade condicionamiento por imagen de referencia. El autor, genganbanette, lo publica como recurso para la aplicación Lovebot, que ejecuta el modelo localmente en el navegador mediante onnxruntime-web y WebGPU.

El interés técnico del repositorio está en el formato de despliegue: pesos ONNX en fp16 troceados en piezas de 20 MiB, con un `export.json` que lista los tamaños y los SHA-256 de cada componente, y un UNet modificado que acepta una entrada extra `image_embeds` con forma [lote, 1, 257, 1280] para inyectar los rasgos de una imagen de referencia (fuerza 0.7; con un tensor de ceros el adaptador no tiene efecto). El codificador de texto acepta `encoder_hidden_states` de longitud dinámica, de modo que los prompts de más de 77 tokens se procesan por trozos.

Es relevante ahora por dos motivos: demuestra un flujo completo de difusión en el cliente (sin servidor, sin enviar prompts ni imágenes a terceros) y sirve como ejemplo de fusión de LoRA más adaptador de imagen en un grafo ONNX exportado para WebGPU. El repositorio ocupa 2,2 GB, no declara pipeline en HuggingFace, acumula 0 descargas y 0 likes en el momento de la consulta, y está marcado con la etiqueta `not-for-all-audiences`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente de la familia Stable Diffusion 1.5: UNet con LCM-LoRA fundido, IP-Adapter plus integrado, VAE y codificador de texto (no se detalla la version del codificador en la informacion disponible) |
| Parametros totales | no disponible (el repositorio en fp16 ocupa 2,2 GB, dividido en piezas de 20 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a texto; `encoder_hidden_states` tiene longitud dinamica y los prompts de mas de 77 tokens se leen por trozos |
| Tipos de cuantizacion | fp16 (ONNX); no se documentan otras precisiones |
| Idiomas soportados | no disponibles (el condicionamiento depende del codificador de texto de CLIP; el autor no documenta idiomas) |
| Licencia | CreativeML Open RAIL-M para el modelo base, Open RAIL++-M para el LCM-LoRA y Apache-2.0 para el IP-Adapter, con las restricciones de uso de cada una |
| Formato de pesos | ONNX fp16, pesos troceados en piezas de 20 MiB; `export.json` incluye tamanos y SHA-256 de cada componente |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio: es una fusión y exportación. Sobre el punto de control RealCartoon3D v18 (archivo `realcartoon3d_v18_pruned_fp16.safetensors`, SHA-256 `ead2e17e375324f36b0fde6c94fd0165d60e83fddbd273393d6453db8741ff5c`, publicado originalmente en Civitai con el ID 94809) se funde el LCM-LoRA de SD 1.5 (commit `cf2fced511dbe7e26c8d1d397e728fbab875db4b`) dentro del UNet, lo que reduce el numero de pasos de muestreo necesarios a 4-10. Adicionalmente se integra el IP-Adapter plus de SD 1.5 (commit `018e402774aeeddd60609b4ecdb7e298259dc729`) con una fuerza fija de 0.7, de modo que el UNet pasa a aceptar la entrada adicional `image_embeds` de forma [lote, 1, 257, 1280] con los rasgos extraidos de una imagen de referencia; si se alimenta con ceros, el adaptador no influye en el resultado.

La innovacion practica esta en el empaquetado para navegador: exportacion a ONNX en fp16, troceado de pesos en fragmentos de 20 MiB con verificacion por SHA-256 en `export.json`, y soporte de longitud dinamica en `encoder_hidden_states` para prompts largos procesados por trozos. No se especifican en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), ni el procedimiento exacto de fusion de los adaptadores.

## Capacidades

- Generacion de imagenes texto-a-imagen con estetica cartoon 3D, heredada del punto de control RealCartoon3D v18.
- Muestreo acelerado: imagenes utilizables en 4-10 pasos gracias al LCM-LoRA fundido en el UNet.
- Condicionamiento por imagen de referencia mediante IP-Adapter plus, con fuerza 0.7, para transferir rasgos de estilo o identidad desde una imagen de entrada.
- Procesamiento de prompts largos: `encoder_hidden_states` admite longitud dinamica y los prompts de mas de 77 tokens se leen por trozos.
- Ejecucion local en el navegador con onnxruntime-web y WebGPU, sin envio de datos a servidores externos.
- Generacion de contenido para adultos: el repositorio esta etiquetado como `not-for-all-audiences`.
- No soporta tool calling, function calling ni uso como agente; es un modelo de difusion, no un modelo de lenguaje.
- No dispone de modo de razonamiento, capacidades de audio ni comprension semantica de imagenes mas alla de la extraccion de rasgos del IP-Adapter.
- Capacidades multilingues: no documentadas; dependen del codificador de texto de CLIP, con el sesgo hacia el ingles que eso implica.

## Casos de uso

- Generacion de imagenes en el navegador con privacidad total: la aplicacion Lovebot y otras similares pueden producir imagenes sin enviar el prompt ni las imagenes de referencia a un servidor, ya que todo el grafo ONNX se ejecuta en el dispositivo mediante WebGPU.
- Personalizacion de avatares por imagen de referencia: con el IP-Adapter a fuerza 0.7 se puede fijar el estilo o los rasgos de un personaje a partir de una fotografia o ilustracion de entrada, util para asistentes conversacionales con representacion visual consistente.
- Prototipado rapido de assets con estetica cartoon 3D: el LCM permite iterar bocetos en 4-10 pasos, lo que reduce el tiempo de espera en sesiones de ideacion grafica.
- Demos tecnicas y portafolios web: sirve como ejemplo funcional de difusion en el cliente con ONNX Runtime Web y WebGPU, sin backend de GPU ni coste de servidor.
- Aplicaciones de compania o rol conversacional: al integrarse en una app de chat, el modelo puede ilustrar respuestas o escenas bajo demanda, manteniendo el contenido en el dispositivo del usuario.
- Generacion por lotes de bajo coste: al necesitar pocos pasos de muestreo y no requerir instancia de GPU en la nube, es adecuado para producir variaciones masivas de un mismo motivo en equipos de escritorio.
- Investigacion sobre inferencia on-device: el troceado en piezas de 20 MiB, el `export.json` con hashes y la carga diferida de componentes lo convierten en un banco de pruebas para medir memoria, latencia y compatibilidad de WebGPU en distintos navegadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas FID, CLIP score, comparativas de calidad ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: como minimo los 2,2 GB de pesos fp16, mas el espacio de activaciones del UNet, el VAE y el codificador de texto. No se publican cifras oficiales; en la practica conviene reservar varios gigabytes adicionales de memoria grafica o de memoria unificada.
- GPU recomendadas: cualquiera con soporte WebGPU estable y suficiente memoria. No se documentan modelos concretos; los datos no estan disponibles. La ejecucion tambien es posible en CPU, con latencia mucho mayor.
- Cabe en GPU de consumo: si, siempre que el navegador exponga WebGPU y el sistema disponga de memoria suficiente para los pesos troceados y las activaciones. No se especifican modelos concretos.
- Opciones de despliegue: onnxruntime-web con WebGPU (el escenario previsto por el autor) y ONNX Runtime nativo para escritorio o servidor. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del numero de pasos LCM elegido (entre 4 y 10), de la resolucion de salida y del backend WebGPU del navegador.
- Almacenamiento: 2,2 GB de repositorio, distribuidos en fragmentos de 20 MiB que el cliente debe descargar y verificar con los SHA-256 de `export.json`.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Notas |
|---|---|---|---|---|
| genganbanette/lovebot-realcartoon3d-lcm | SD 1.5 + LCM-LoRA + IP-Adapter | ONNX fp16 para WebGPU | CreativeML Open RAIL-M + Open RAIL++-M + Apache-2.0 | 2,2 GB, 0 descargas, orientado a navegador |
| RealCartoon3D v18 (Civitai 94809) | SD 1.5 afinado | safetensors fp16 | Permite derivados y redistribucion segun la model card | Modelo de origen de este repositorio; sin LCM ni IP-Adapter |
| latent-consistency/lcm-lora-sdv1-5 | LoRA de destilacion LCM | safetensors | Open RAIL++-M | Componente fundido en el UNet para reducir pasos de muestreo |
| h94/IP-Adapter (variante plus SD 1.5) | Adaptador de imagen | safetensors | Apache-2.0 | Componente integrado con fuerza 0.7; aporta la entrada `image_embeds` |
| Lykon/dreamshaper-8 | SD 1.5 afinado | safetensors | CreativeML Open RAIL-M | Figura como `base_model` en los metadatos de HuggingFace, en discrepancia con la model card, que cita RealCartoon3D v18 |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: la etiqueta `not-for-all-audiences` indica que el modelo puede generar material no apto para todo publico. Requiere filtrado y control de acceso si se integra en un producto.
- Discrepancia en el modelo base: los metadatos de HuggingFace apuntan a Lykon/dreamshaper-8, mientras que la model card describe RealCartoon3D v18. Conviene verificar que componente se ha cargado realmente antes de usarlo en produccion.
- Licencias acumuladas: el uso queda sujeto simultaneamente a CreativeML Open RAIL-M (modelo base), Open RAIL++-M (LCM-LoRA) y Apache-2.0 (IP-Adapter). Open RAIL-M incluye restricciones de uso por caso de aplicacion que deben revisarse antes de un despliegue comercial.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni resultados de benchmarks. No hay evidencia publica de calidad ni de estabilidad.
- Artefactos de generacion: como todo modelo de difusion de la familia SD 1.5, puede producir anatomia incorrecta, manos deformes, texto ilegible y perspectivas incoherentes. La resolucion nativa de SD 1.5 tambien limita el detalle en salidas de alta resolucion.
- Prompts largos por trozos: el procesamiento fragmentado de `encoder_hidden_states` por encima de 77 tokens puede romper la coherencia semantica entre fragmentos.
- Sesgo de idioma: el autor no documenta idiomas soportados; el codificador de texto de CLIP rinde mejor en ingles, por lo que los prompts en castellano pueden degradar el resultado.
- Fuerza fija del IP-Adapter: 0.7 no es configurable en el grafo exportado; ajustar la influencia de la imagen de referencia exige reexportar el modelo.
- LCM a pocos pasos: reducir el muestreo a 4-10 pasos acelera la generacion a costa de detalle y estabilidad; no se documenta la perdida de calidad respecto al modelo original.
- Memoria del navegador: la ejecucion en WebGPU depende de limites de memoria del navegador y de la GPU, con riesgo de fallos al cargar los fragmentos en equipos con poca memoria.
- Precisión fp16: la exportacion en fp16 puede introducir pequenas diferencias numericas respecto a los pesos originales en safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genganbanette/lovebot-realcartoon3d-lcm
- Modelo base citado en los metadatos: https://huggingface.co/Lykon/dreamshaper-8
- RealCartoon3D v18 en Civitai: https://civitai.com/models/94809
- LCM-LoRA SD 1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- IP-Adapter: https://huggingface.co/h94/IP-Adapter
- ONNX Runtime Web (libreria declarada): https://onnxruntime.ai/docs/tutorials/web/
