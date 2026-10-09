# Aikimi/Forge-Neo-Image-2.1-Turbo-W4A8

## Resumen

Forge Neo Image 2.1 Turbo W4A8 es una conversion cuantizada no oficial del modelo de generacion de imagenes Qwen Image 2.1 Turbo, publicada por el usuario Aikimi para su uso dentro del entorno Aikimi Forge Neo. No se ha realizado entrenamiento adicional: el repositorio redistribuye pesos ya existentes transformados a un formato de cuantizacion propietario denominado Comfy Kitchen AsymW4A8Int8Layout (pesos empaquetados de 4 bits, computo de activaciones en 8 bits). El modelo base es Qwen/Qwen-Image-2.1-Turbo y el encoder de texto compartido procede de Qwen/Qwen-Image-2.1.

El paquete contiene el Transformer de generacion cuantizado y el encoder de texto Qwen3-VL, ademas de un manifiesto de integridad y un importador. No es una pipeline de imagen completa: el VAE, el procesador, la configuracion de muestreo oficial y los ficheros BF16 originales los aporta la instalacion de Forge Neo. Esto significa que no funciona como un repositorio generico de Diffusers con `from_pretrained`, sino que requiere el cargador y los kernels CUDA propios de Neo.

Su relevancia es acotada y muy especifica: permite saltarse la conversion a cuantizacion en GPU antes de la inferencia dentro del ecosistema Forge Neo, manteniendo el modelo BF16 original instalado. El repositorio ocupa 11,8 GB y la licencia (Qwen Research License) restringe el uso y la redistribucion a investigacion o evaluacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de generacion de imagenes con encoder de texto Qwen3-VL y scheduler FlowMatchEulerDiscreteScheduler (shifting dinamico desactivado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos empaquetados de 4 bits, activaciones de 8 bits), group size 16, escalas de grupo en FP8, ConvRot size 256; layout Comfy Kitchen AsymW4A8Int8Layout |
| Idiomas soportados | en, ja |
| Licencia | qwen-research (Qwen Research License); uso y redistribucion limitados a investigacion o evaluacion no comercial |
| Formato de pesos | safetensors con layout W4A8 empaquetado propio de Forge Neo (no compatible con Diffusers generico) |

## Arquitectura y entrenamiento

El modelo es una conversion de pesos, no un entrenamiento nuevo. Se parte del Transformer de Qwen/Image-2.1-Turbo (revision d65dbc9a7e8f6b5479e33dee6030eaab2a906509) y del encoder de texto compartido de Qwen/Image-2.1 (revision b3179ad355be050328e483a9dfdd9e60cd62adfa), cuyos tensores coinciden con el encoder incluido en el checkpoint Turbo oficial. Sobre esas fuentes se aplica una cuantizacion asimetrica W4A8 que modifica pesos Linear seleccionados tanto en `transformer/` como en `text_encoder/`. No hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, porque la model card no los incluye.

La innovacion tecnica del repositorio es el formato de cuantizacion y su cadena de verificacion, no la arquitectura subyacente. Los tensores se empaquetan con pesos de 4 bits, computo de activaciones en 8 bits, tamano de grupo 16, ConvRot 256 y escalas de grupo en FP8. Cada cabecera de safetensors y fichero JSON incorpora un aviso de modificacion que identifica la conversion y su revision de origen, preservando descriptores, offsets y bytes crudos. El manifiesto `release_manifest.json` registra ficheros convertidos, revisiones fuente, hashes SHA-256, recetas de conversion, versiones de runtime y hashes de los ficheros exportados. La verificacion realizada cubrió ejecuciones de text-to-image en CUDA y recarga desde cache a 768x768, con los ocho pasos oficiales y hashes de pixel identicos entre ambas; no se incluyeron comprobaciones de edicion de referencia ni de Outpaint.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), con muestreo configurado a CFG 1 y ocho pasos sigma oficiales.
- Etiquetado tambien como image-editing en los tags, si bien la propia verificacion del autor indica que la edicion de referencia y el Outpaint no se comprobaron en esta conversion W4A8.
- Comprension de instrucciones en ingles y japones, segun los idiomas declarados del modelo y los del encoder de texto compartido.
- Soporte dentro de Forge Neo para combinaciones con LoRA, ControlNet, Outpaint y Sparse, aunque con limitaciones propias recogidas en la guia Turbo del proyecto.
- Integracion de un importador que verifica identidad de fuentes, recetas y versiones de runtime, y valida hashes de cada componente antes de instalarlo.
- No se documentan capacidades de tool calling, function calling, agentes multimodales ni razonamiento multi-paso, al tratarse de un modelo de sintesis de imagen.

## Casos de uso

- Investigacion en cuantizacion de modelos de difusion: permite estudiar el impacto de un esquema W4A8 asimetrico (group size 16, escalas FP8) en la calidad de imagen frente al BF16 original, midiendo desviaciones en composicion, texto y color.
- Evaluacion de pipelines de imagen dentro de Forge Neo: sirve para medir el ahorro de memoria al evitar la cuantizacion en GPU antes de la inferencia, manteniendo el BF16 como referencia.
- Prototipado de generacion de imagenes a 768x768 con ocho pasos: util para iterar rapido en entornos con GPU de 24 GB como la RTX 3090 usada en las pruebas.
- Reproducibilidad de releases cuantizados: el manifiesto y los hashes SHA-256 permiten auditar que un despliegue concreto coincide con la conversion publicada y detectar derivas entre maquinas.
- Generacion de ilustraciones o material con prompt en japones, dado el soporte declarado de ese idioma en el modelo y su encoder.
- Docencia o formacion sobre formatos de pesos no estandar: el ejemplo de layout empaquetado con cargador y kernels propios es un caso practico de por que un repositorio cuantizado no equivale a un checkpoint Diffusers convencional.
- Base para experimentos academicos de edicion de imagen (siempre que se aporte la pipeline completa de Neo), teniendo en cuenta que esta conversion no valido edicion de referencia ni Outpaint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta verificaciones funcionales: dos ejecuciones en CUDA (text-to-image y recarga desde cache) a 768x768, con los ocho timesteps oficiales y hashes de pixel identicos, y verificacion SHA-256 de todos los componentes. No hay cifras de FID, CLIP score, SSIM frente a BF16 ni comparativas numericas de calidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. El repositorio pesa 11,8 GB y las pruebas se realizaron en una NVIDIA RTX 3090 de 24 GB de VRAM, por lo que cabe con holgura en 24 GB.
- Es necesario mantener instalados los ficheros fuente BF16 oficiales de Qwen Image 2.1 Turbo, lo que incrementa el espacio en disco y el consumo de memoria respecto a la sola descarga del paquete cuantizado.
- Se requiere CUDA con soporte BF16 (driver 610.74 y PyTorch 2.13.0+cu130 en las pruebas del autor).
- GPU recomendadas: las utilizadas en la verificacion (RTX 3090 24 GB). No se documentan otras GPU, ni A100 ni H100.
- Despliegue: exclusivamente mediante Aikimi Forge Neo con su cargador W4A8 y manejo de CPU-offload. No es compatible con vLLM, llama.cpp, Ollama, TGI ni el `from_pretrained` generico de Diffusers.
- Latencia y throughput: no disponibles. Solo se especifica que la generacion se realiza en ocho pasos a 768x768.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Forge Neo Image 2.1 Turbo W4A8 (Aikimi) | Conversion cuantizada W4A8 de Qwen Image 2.1 Turbo | 4 bits (W4A8), 11,8 GB | en, ja | qwen-research (no comercial) | HuggingFace, requiere Forge Neo |
| Qwen/Qwen-Image-2.1-Turbo | Modelo base oficial, sin cuantizar | BF16 | no disponible | Qwen (consultar ficha oficial) | HuggingFace |
| Qwen/Qwen-Image-2.1 | Version del encoder de texto compartido y modelo de la familia | no disponible | no disponible | Qwen | HuggingFace |

No se dispone de informacion en las fuentes proporcionadas sobre otros modelos comparables de generacion text-to-image (por ejemplo, alternativas tipo FLUX), por lo que la comparativa se limita a las variantes de la propia familia Qwen Image.

## Limitaciones y advertencias

- La cuantizacion modifica los valores numericos: el autor advierte explicitamente de posibles cambios en composicion, texto, colores y detalles, y no reclama paridad de pixel ni de calidad con el modelo BF16.
- La edicion de referencia y el Outpaint no se verificaron en esta conversion W4A8; su comportamiento en esas tareas no esta validado.
- Licencia Qwen Research: el uso y la redistribucion estan limitados a investigacion o evaluacion no comercial. Es imprescindible revisar LICENSE y NOTICE.md antes de cualquier uso.
- El codigo del importador se distribuye bajo AGPLv3, mientras que los pesos usan la licencia Qwen Research; son condiciones distintas que deben respetarse por separado.
- No es una pipeline completa: faltan VAE, procesador y configuracion de muestreo, que aporta la instalacion de Neo. No funciona como repositorio Diffusers estandar.
- Dependencia fuerte del entorno: requiere los kernels CUDA y el cargador de Neo. Si las versiones de runtime no coinciden con las del manifiesto, hay que preparar una conversion local en ese entorno.
- Exige mantener instalados los ficheros fuente BF16, lo que reduce parte del ahorro esperado en disco.
- Idiomas soportados limitados a ingles y japones; no hay soporte documentado de otros idiomas ni garantias de sesgo o de alucinacion mas alla de la propia naturaleza del modelo.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aikimi/Forge-Neo-Image-2.1-Turbo-W4A8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Fuente del encoder compartido: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia (LICENSE): https://huggingface.co/Aikimi/Forge-Neo-Image-2.1-Turbo-W4A8/blob/main/LICENSE
- Repositorio Aikimi Forge Neo: https://github.com/AiWithYou/aikimi-forge-neo
- Guia Turbo de Forge Neo: https://github.com/AiWithYou/aikimi-forge-neo/blob/neo/docs/qwen21-official-turbo.md
