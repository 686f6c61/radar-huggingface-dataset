# phylun/Komapper_SDFTPracticeCode

## Resumen

Komapper_SDFTPracticeCode es un repositorio de codigo y pesos de practica publicado por el usuario phylun en HuggingFace, orientado al aprendizaje del fine-tuning de modelos de difusion aplicados a la inspeccion de dano en hormigon. No es un modelo de lenguaje ni un modelo generativo unico, sino una coleccion de scripts, datasets y pesos auxiliares (LoRA, ControlNet y DreamBooth) que cubren tres flujos de trabajo: texto a imagen, generacion condicionada por mascara e inpainting parcial.

El material esta organizado en tres carpetas progresivas (`01_T2I`, `02_CtrlGen`, `03_Inpaint`), cada una con una secuencia de cuatro pasos que va de los principios basicos de la difusion hasta el entrenamiento con datos propios. La documentacion y los comentarios del codigo estan en coreano. El repositorio ocupa 2,6 GB e incluye pesos preentrenados listos para usar (un LoRA, un ControlNet en fp16 de 722 MB y un UNet de DreamBooth de 1,7 GB), ademas de dos datasets con 100 imagenes cada uno.

Es relevante ahora como recurso didactico reproducible: cubre en un unico paquete el ciclo completo de especializacion de un modelo de difusion (LoRA de bajo rango, condicionamiento espacial con ControlNet y personalizacion con DreamBooth) sobre un caso de uso industrial concreto, el analisis de fisuras, descascarillado, hierro expuesto, eflorescencia y vegetacion en estructuras de hormigon. La licencia es MIT, lo que facilita su reutilizacion y adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion latente tipo Stable Diffusion, con tres variantes de ajuste incluidas: LoRA sobre UNet, ControlNet condicional e inpainting con DreamBooth. Version base exacta del checkpoint no especificada |
| Parametros totales | no disponible como cifra unica. Componentes documentados: UNet base 860 M, LoRA entrenable aproximadamente 0,8 M, ControlNet 361 M, UNet de DreamBooth 866 M |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica. La condicion de entrada es un prompt de texto mas, opcionalmente, una imagen de control a 1024x1024. El entrenamiento del LoRA reduce las imagenes a 512x512 |
| Tipos de cuantizacion | fp16 (el ControlNet preentrenado se distribuye en fp16). No se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible. Los scripts, comentarios y documentacion estan en coreano; las capacidades de generacion dependen del modelo base y no se restringen por idioma |
| Licencia | MIT |
| Formato de pesos | safetensors (etiqueta del repositorio); los pesos se acompanan de scripts Python |

## Arquitectura y entrenamiento

El repositorio trabaja sobre un modelo de difusion latente de la familia Stable Diffusion, con un UNet de aproximadamente 860 millones de parametros como columna vertebral. La propuesta didactica es congelar ese UNet y entrenar solo modulos auxiliares, lo que reduce drasticamente el coste computacional: el ajuste LoRA entrena alrededor de 0,8 millones de parametros durante 300 pasos, con un tiempo declarado de unos 2 minutos en GPU. El pipeline `00_Ready4SD.py` descarga previamente el modelo base a la cache (aproximadamente 7 GB, entre 6 y 10 minutos).

Los tres flujos cubren tecnicas distintas. `01_T2I` parte de la generacion incondicional de ruido a imagen y avanza hasta texto a imagen con LoRA; `02_CtrlGen` introduce ControlNet (361 M de parametros, tambien 300 pasos de entrenamiento) para condicionar la generacion a una mascara de dano, y `03_Inpaint` emplea DreamBooth para inscribir el concepto de fisura en el token `sks`, entrenando el UNet completo (866 M de parametros) con imagenes reales emparejadas con mascaras. No se documenta en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion de su dataset original ni si hubo etapas de RLHF o DPO, ya que se trata de pesos derivados de un modelo preentrenado.

## Capacidades

- Generacion de imagen a partir de texto (texto a imagen) mediante prompts, con control de numero de pasos y de `guidance scale`.
- Generacion condicionada espacialmente: ControlNet acepta una mascara de color como condicion para decidir donde aparece cada tipo de dano.
- Inpainting: repintado de regiones concretas de una fotografia mediante mascara, preservando el fondo original.
- Personalizacion de concepto con DreamBooth mediante el token `sks` para representar un tipo de fisura concreto.
- Fine-tuning eficiente con LoRA sobre un UNet congelado, con comparacion directa antes/despues usando semilla y prompt fijos.
- Entrenamiento de ControlNet con UNet congelado, con scripts de ajuste de `controlnet_conditioning_scale` entre 0 y 1,5.
- Ajuste de `strength` en inpainting entre 0,2 y 1,0 para controlar cuanto contenido original se conserva.
- Etiquetado automatico de dano estructural segun una tabla de colores fija: blanco (fisura), rojo (descascarillado), amarillo (hierro expuesto), cian (eflorescencia), verde (vegetacion), azul (punto de control) y negro (sin dano).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes, al no tratarse de un modelo de lenguaje.
- No se documentan capacidades de audio ni de vision comprensiva; el uso de vision se limita a la imagen de condicion de ControlNet.

## Casos de uso

- Aumento de datos para entrenamiento de detectores de fisuras: el ControlNet del repositorio genero el dataset `Dataset_Dmg`, de modo que puede reutilizarse para sintetizar imagenes de hormigon danado a 1024x1024 con la clase de dano controlada por mascara.
- Inspeccion estructural asistida: dado un muro intacto y una mascara de fisura, el pipeline de inpainting de `03_Inpaint` produce una imagen realista del dano, util para manuales, formacion de inspectores o validacion de tecnicas de reparacion.
- Prototipado rapido de sistemas de mantenimiento predictivo: el modelo permite generar pares imagen/mascara coherentes para probar segmentadores antes de disponer de datos reales etiquetados.
- Docencia y divulgacion tecnica: la secuencia `01_T2I` a `03_Inpaint` ilustra de forma progresiva el funcionamiento de la difusion, desde ruido puro hasta condicionamiento espacial y personalizacion de concepto.
- Personalizacion de estilo o patologia concreta: el flujo DreamBooth permite inscribir en un token un tipo especifico de dano observado en una obra real, con solo 100 imagenes de ejemplo.
- Comparacion controlada de metodos de ajuste: el repositorio incluye pesos preentrenados y pesos resultantes del entrenamiento del usuario, lo que permite medir el efecto del fine-tuning con prompt y semilla fijos.
- Generacion de ilustraciones tecnicas de patologias del hormigon con localizacion precisa, gracias a la escala de condicionamiento ajustable de ControlNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas objetivas como FID, CLIP score, IoU de segmentacion ni comparativas cuantitativas con otros modelos. Los unicos datos de rendimiento declarados son de coste de entrenamiento: unos 2 minutos en GPU para 300 pasos de LoRA, 300 pasos para el ajuste de ControlNet y un tiempo de descarga de entre 6 y 10 minutos para aproximadamente 7 GB de pesos base.

## Requisitos de hardware

- GPU con CUDA obligatoria. La model card indica explicitamente que se necesita una GPU CUDA para ejecutar los scripts.
- Descarga inicial de pesos base: aproximadamente 7 GB.
- Pesos adicionales incluidos en el repositorio: ControlNet preentrenado de 722 MB en fp16, UNet de DreamBooth de 1,7 GB y LoRA preentrenado, dentro de un repositorio total de 2,6 GB.
- VRAM de inferencia: no especificada en la informacion disponible. Como referencia de orden de magnitud, un UNet de 860 M de parametros en fp16 junto con VAE y codificador de texto suele requerir del orden de 4 a 8 GB de VRAM, pero este dato no esta confirmado por el autor.
- Modelos de GPU recomendados: no disponibles.
- Cabida en GPU de consumo: no confirmada por el autor. Por el tamano de los pesos, es plausible en tarjetas con 8 GB o mas de VRAM, pero no hay confirmacion oficial.
- Opciones de despliegue: los scripts usan directamente `torch`, `diffusers`, `transformers`, `accelerate`, `peft` y `safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Recurso | Tipo | Parametros | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phylun/Komapper_SDFTPracticeCode | Repositorio didactico con LoRA, ControlNet y DreamBooth sobre difusion | UNet 860 M, ControlNet 361 M, LoRA 0,8 M | 512x512 (LoRA) y 1024x1024 (ControlNet) | MIT | Publico en HuggingFace, 0 descargas y 0 me gusta en el momento de la consulta |
| Stable Diffusion 1.5 (checkpoint base) | Modelo de difusion texto a imagen | UNet del orden de 860 M | 512x512 | CreativeML Open RAIL-M | Ampliamente disponible |
| ControlNet original | Modulo de condicionamiento espacial sobre difusion | 361 M | 512x512 en su version base | Apache 2.0 (segun la version) | Publico en HuggingFace |
| Ejemplos oficiales de diffusers | Repositorio de scripts de entrenamiento | depende del script | variable | Apache 2.0 | Publico en GitHub |

La comparativa con modelos alternativos de la misma categoria no esta disponible con datos de rendimiento, ya que el autor no publica metricas comparativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de capacidades de razonamiento textual, tool calling, agentes o generacion de codigo. Cualquier ficha que lo trate como LLM seria incorrecta.
- No se especifica la version base exacta del checkpoint de difusion utilizado, lo que dificulta reproducir los resultados fuera del entorno previsto.
- El repositorio es material de practica docente, no un modelo validado para produccion. No hay evaluacion de calidad de imagen ni de fidelidad al dano real.
- Riesgo de alucinacion visual: los modelos de difusion pueden generar fisuras o patologias que no se corresponden con la realidad fisica de la estructura. Las imagenes sinteticas no deben usarse como evidencia de inspeccion.
- El dataset `Dataset_Dmg` (1024x1024) fue generado por el propio ControlNet, por lo que contiene sesgos del modelo y no debe tratarse como datos reales. El dataset `Dataset_Crack` (448x448) si procede de fotografias reales.
- Las resoluciones de trabajo estan fijadas a 512x512 para el LoRA y 1024x1024 para ControlNet. Reducir a 512 las imagenes de ControlNet degrada el resultado, segun advierte el autor, porque los pesos se entrenaron a 1024.
- La documentacion y los comentarios estan en coreano, lo que puede dificultar el uso a personas que no lo lean.
- Requiere GPU con CUDA, lo que limita su uso en entornos sin aceleracion grafica.
- La licencia MIT del repositorio no exime de respetar las licencias de los modelos base sobre los que se construyen los pesos derivados, que no se detallan en la informacion disponible.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Los pesos incluidos se describen como usados en investigacion real del autor, pero no se aportan referencias a publicaciones ni resultados verificables.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/phylun/Komapper_SDFTPracticeCode
- README de `02_CtrlGen`: referenciado en la model card como `02_CtrlGen/README.md`, dentro del propio repositorio.
- README de `03_Inpaint`: referenciado en la model card como `03_Inpaint/README.md`, dentro del propio repositorio.
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios externos ni demos adicionales.
