# matrixportalx/epiCRealism_NaturalSin_v1

## Resumen

epiCRealism_NaturalSin_v1 es una conversion del modelo de difusion Stable Diffusion 1.5 al formato de Qualcomm QNN (qnn2.28), empaquetada por el usuario matrixportalx para ejecutarse sobre la NPU (HTP) de los SoC Snapdragon. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero: es un artefacto de despliegue que adapta un checkpoint de SD 1.5 para inferencia local en moviles Android mediante la aplicacion Ruya / Local Dream, que importa el modelo a traves de la opcion "Import Custom Model".

El paquete esta especializado para el tier `8gen2` con HTP `v73` y activaciones de 16 bits, y cubre las resoluciones 512x512, 768x512 y 512x768. La arquitectura se reparte entre componentes: la UNet se ejecuta como context binary de QNN sobre la NPU, mientras que el text_encoder y el VAE se ejecutan mediante MNN en CPU/GPU. El repositorio ocupa aproximadamente 1 GB, lo que es coherente con el peso de un pipeline SD 1.5 en precision reducida.

Su relevancia actual es de nicho pero clara: permite generar imagenes con SD 1.5 sin conexion y sin GPU dedicada, aprovechando el acelerador neuronal de telefonos de gama alta. El modelo se publico sin descargas ni interacciones registradas y sin resultados de benchmarks, por lo que debe evaluarse como utilidad de despliegue mas que como modelo con metricas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Stable Diffusion 1.5): UNet + text encoder CLIP + VAE |
| Parametros totales | No especificado por el autor. El SD 1.5 base tiene aproximadamente 860 M en la UNet, 123 M en el text encoder CLIP ViT-L/14 y 83 M en el VAE |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo text-to-image; el text encoder del SD 1.5 trabaja con 77 tokens de prompt) |
| Tipos de cuantizacion | Activaicones de 16 bits en el runtime QNN para el tier `8gen2`; no se detallan otras cuantizaciones. El repo no incluye variantes fp16/fp32 adicionales documentadas |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m |
| Formato de pesos | QNN context binary para la UNet (NPU) y MNN para text_encoder/VAE (CPU/GPU), distribuidos dentro del archivo `epiCRealism_NaturalSin_v1_qnn2.28_8gen2.zip` |

Datos adicionales de despliegue:

| Parametro | Valor |
|---|---|
| Runtime | qnn2.28 |
| Tier / objetivo | `8gen2`, HTP `v73` |
| Resoluciones soportadas | 512x512, 768x512, 512x768 |
| SoC compatibles | Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2, 7 Gen 3 |
| Aplicacion anfitriona | Ruya / Local Dream (Android) |
| Tamano del repositorio | 1.0 GB |
| Pipeline en HuggingFace | text-to-image |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un modelo de difusion latente con una UNet como denoiser, un text encoder CLIP ViT-L/14 que condiciona la generacion a partir del prompt y un VAE que comprime y reconstruye las imagenes en el espacio latente. La innovacion de esta publicacion no esta en el entrenamiento, sino en la particion del pipeline para hardware heterogeneo: la UNet se compila a un context binary de QNN que se ejecuta en la NPU (HTP v73), mientras que el text encoder y el VAE se delegan a MNN en CPU/GPU. Esa division es la que permite mantener la latencia dentro de limites utilizables en un telefono, ya que la UNet concentra la mayor parte del coste computacional por paso de difusion.

No hay informacion en la model card sobre el dataset de entrenamiento, el numero de tokens de imagen vistos, ni sobre procesos de ajuste como RLHF, DPO o fine-tuning con preferencias humanas. El nombre "epiCRealism" sugiere una estirpe de fine-tunes de la comunidad orientados a fotorrealismo, pero el autor no documenta el origen exacto de los pesos ni si hubo un ajuste previo sobre SD 1.5 antes de la conversion. Tampoco se detalla el proceso de calibracion ni las tecnicas de cuantizacion aplicadas mas alla de las activaciones de 16 bits. La herramienta de conversion referenciada es el repositorio `matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model`.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en lenguaje natural, con el pipeline clasico de difusion latente.
- Tres formatos de lienzo: cuadrado 512x512 y dos orientaciones panoramicas, 768x512 y 512x768.
- Inferencia completamente local en el dispositivo, sin envio de prompts ni imagenes a servidores externos.
- Ejecucion acelerada por NPU: la UNet se ejecuta en el HTP del Snapdragon, con el text encoder y el VAE en CPU/GPU via MNN.
- Integracion con la aplicacion Ruya / Local Dream mediante importacion de modelo personalizado desde los ajustes de la app.
- Compatibilidad declarada con Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3 (todos con HTP v73).
- No se documenta soporte de image-to-image, inpainting, outpainting, ControlNet, LoRA, tool calling, agentes ni modo de razonamiento. Son capacidades propias de modelos de lenguaje o de pipelines de difusion ampliados, y la model card no las menciona.

## Casos de uso

- Generacion de imagenes sin conexion en movil: el paquete se importa en Ruya / Local Dream y permite crear ilustraciones o imagenes fotorrealistas en un Snapdragon compatible sin depender de red ni de servicios en la nube.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en el dispositivo, es apto para escenarios en los que el prompt o la imagen no pueden salir del terminal, como prototipos medicos, legales o de contenido personal.
- Demostraciones y pruebas de concepto en ferias o eventos: permite mostrar generacion de imagenes en directo sobre un telefono, sin infraestructura de servidores ni GPU externa.
- Desarrollo de apps Android de creatividad: un desarrollador puede integrar el pipeline importado en Local Dream como referencia para validar latencia y calidad antes de decidir si construye su propia integracion QNN.
- Evaluacion de despliegue en NPU: sirve como banco de pruebas para medir el reparto de carga entre HTP, CPU y GPU en un pipeline de difusion, util para equipos que trabajan en optimizacion on-device.
- Generacion de recursos graficos de baja resolucion para prototipos: avatares, fondos o bocetos a 512x512 que luego se escalan o editan en herramientas de escritorio.
- Investigacion sobre cuantizacion y compilacion QNN: el artefacto permite reproducir el flujo de conversion de SD 1.5 a context binary y comparar el resultado con otras conversiones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye FID, CLIP score, evaluaciones esteticas ni comparaciones cuantitativas con otras conversiones. Tampoco se publican mediciones de latencia por imagen, pasos de muestreo recomendados ni throughput en ninguno de los SoC soportados.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en un SoC movil, no en una GPU de escritorio. El repositorio ocupa 1.0 GB, y el consumo en ejecucion dependera del runtime QNN y de los buffers de activacion, no documentados.
- SoC soportados: Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3, todos con HTP v73 y compatibles con el tier `8gen2`.
- GPU de escritorio: no se documenta ninguna ruta de ejecucion en GPU de PC. No hay archivos GGUF ni safetensors del pipeline completo en el repositorio, por lo que no se puede cargar directamente en Automatic1111, ComfyUI, diffusers ni similares sin reconvertir los pesos.
- Aceleracion: NPU (HTP v73) para la UNet; CPU/GPU del dispositivo para text_encoder y VAE mediante MNN.
- Opciones de despliegue: la unica ruta documentada es la aplicacion Ruya / Local Dream en Android, importando el ZIP desde "Settings → Import Custom Model". No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros (UNet) | Formato / runtime | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| epiCRealism_NaturalSin_v1 | SD 1.5 convertido | No especificado (base SD 1.5, ~860 M) | QNN context binary + MNN | Snapdragon con HTP v73 | creativeml-openrail-m | HuggingFace, 0 descargas |
| Stable Diffusion 1.5 original | Difusion latente | ~860 M | safetensors, diffusers | GPU de escritorio o servidor | creativeml-openrail-m | Ampliamente disponible |
| Otras conversiones QNN de SD 1.5 para Snapdragon | SD 1.5 convertido | Depende del checkpoint base | QNN context binary | Snapdragon con HTP compatible | Segun el checkpoint de origen | Distribuidas por la comunidad y por Qualcomm AI Hub |

La comparacion cuantitativa de calidad de imagen, latencia o consumo energetico con SD 1.5 original o con otras conversiones no esta disponible: el autor no publica ninguna metrica. La diferencia principal frente al SD 1.5 estandar es el formato de pesos y el reparto de ejecucion entre NPU y CPU/GPU, no el rendimiento del modelo subyacente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de SD 1.5, hereda los sesgos de representacion y estilo del dataset de entrenamiento original (LAION), que no se detalla en esta publicacion.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible, manos deformes y artefactos en estructuras complejas, especialmente en resoluciones altas con el modelo base.
- Limitaciones de contexto e idioma: no hay informacion sobre idiomas soportados. El text encoder de SD 1.5 esta orientado a prompts en ingles, por lo que los resultados con prompts en otros idiomas pueden degradarse.
- Restricciones de licencia: la licencia CreativeML Open RAIL-M impone condiciones de uso, incluidas restricciones sobre determinados usos y la obligacion de propagar las condiciones a los usuarios finales. Conviene revisar el texto completo antes de un uso comercial.
- Riesgo de seguridad y contenido: la model card no incluye clausulas de uso responsable, filtros de seguridad ni recomendaciones sobre contenido sensible. No se documenta si la aplicacion anfitriona aplica algun tipo de filtrado.
- Compatibilidad restringida: el paquete solo funciona en los SoC listados (8 Gen 2, 8s Gen 3, 7+ Gen 2, 7 Gen 3). En otros Snapdragon o en hardware distinto no hay ruta de ejecucion documentada.
- Reproducibilidad: el autor no documenta la semilla, el sampler, los pasos ni la escala de guia recomendada, lo que dificulta reproducir resultados concretos.
- Madurez de la publicacion: 0 descargas y 0 interacciones en el momento de la consulta, sin benchmarks ni validacion externa. La fecha de creacion registrada (2026-09-12) es posterior a la fecha habitual de publicacion, un dato a verificar.
- Ausencia de pesos reutilizables: el repositorio distribuye un context binary y archivos MNN, no pesos en safetensors. Reutilizar el modelo en otro runtime exige volver al checkpoint SD 1.5 original, que el autor no enlaza.

## Enlaces

- HuggingFace: https://huggingface.co/matrixportalx/epiCRealism_NaturalSin_v1
- Repositorio de conversion SD 1.5 a Qualcomm QNN: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- Archivo de modelo: `epiCRealism_NaturalSin_v1_qnn2.28_8gen2.zip` (incluido en el repositorio de HuggingFace)

Nota sobre la busqueda web: los resultados devueltos (ChatGPT_DAN, GitHub Desktop, r/AITAH, r/ChatGPT, codex-chatgpt-web) no guardan relacion con este modelo y no se han utilizado como fuente.
