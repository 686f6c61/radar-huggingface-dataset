# sekkit/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de difusión texto-a-imagen de la familia MOSS-Image desarrollada por OpenMOSS. Se trata de un ajuste supervisado (SFT) sobre MOSS-Image-Base, del que hereda arquitectura y pipeline de inferencia, y está pensado para generar imágenes con control explícito sobre el texto renderizado y la disposición de objetos: acepta prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON. La ficha que se documenta aquí corresponde a la copia publicada por el usuario `sekkit` en HuggingFace, no al repositorio oficial de OpenMOSS.

El modelo tiene 5.082.308.624 parámetros según los pesos en safetensors y un tamaño de repositorio de 27,2 GB. Se distribuye con licencia Apache 2.0, soporta inglés y chino, y se integra en el ecosistema Diffusers mediante un pipeline personalizado (`MOSSImagePipeline` / `pipeline_moss_image`). Su rasgo diferencial frente a otros generadores de la misma escala es la calidad de agrupación y organización del texto en la imagen: la propia model card muestra comparativas cualitativas en las que el SFT produce una disposición de pizarra más ordenada que la versión Base.

Es relevante para quien necesite generar carteles, notas manuscritas, infografías o interfaces con texto legible en inglés o chino, y quiera hacerlo con pesos abiertos y licencia permisiva. La contrapartida es que se trata de una republicación de terceros con cero descargas y cero likes en el momento de la consulta, sin datos de benchmarks publicados en la información disponible, por lo que la validación corre por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (texto-a-imagen) con transformer y codificador de texto; sampler flow-matching Euler; VAE con decodificador pequeño de FLUX.2 |
| Parametros totales | 5.082.308.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se especifica la ventana del codificador de texto) |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; pesos en safetensors con transformer y codificador de texto en bfloat16 y VAE en float32 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Diffusers, pipeline personalizado `MOSSImagePipeline`) |
| Tamano del repositorio | 27,2 GB |
| Pipeline declarado | text-to-image |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base (relación: finetune) |
| Resolución de ejemplo | 1024 x 1024 |
| Pasos de inferencia por defecto | 50 (CFG 3, shift 5) |

## Arquitectura y entrenamiento

MOSS-Image-SFT es un modelo generativo de difusión que sigue el esquema de flow matching: el muestreo por defecto emplea el sampler Euler de flow matching con 50 pasos, `guidance_scale` de 3 y `shift` de 5. La implementación en Diffusers combina un transformer y un codificador de texto en bfloat16 con un VAE en float32; el VAE incluido utiliza el decodificador pequeño de FLUX.2. El pipeline incorpora una técnica de omisión de capas para aproximar el classifier-free guidance (`uncond_skip_layers=[22]` en el ejemplo de la model card), lo que reduce el coste de la pasada negativa.

La entrenamiento consiste en un ajuste supervisado sobre MOSS-Image-Base. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco detalla el proceso de captions o filtrado. La innovación declarada por el autor es la capacidad de controlar la disposición del texto y de los objetos mediante tres modos de prompt: lenguaje natural, secuencias de etiquetas y layouts en JSON, lo que permite indicar posición y agrupación del texto renderizado. No hay información pública en la documentación consultada sobre el número de parámetros del transformer frente al codificador de texto, ni sobre la resolución nativa de entrenamiento más allá de los ejemplos a 1024 x 1024.

## Capacidades

- Generación de imágenes a partir de prompts en lenguaje natural en inglés y chino, con resolución configurable (ejemplo oficial a 1024 x 1024).
- Renderizado de texto dentro de la imagen, incluyendo texto manuscrito y notas adhesivas, con agrupación y jerarquía visual mejoradas respecto a la versión Base según la comparativa cualitativa del autor.
- Control de layout mediante JSON, permitiendo especificar la colocación de texto y la disposición de objetos en la escena.
- Soporte de secuencias de etiquetas (*tags*) como alternativa a los prompts descriptivos largos.
- Generación determinista mediante semilla (`torch.Generator`), útil para reproducibilidad en producción.
- Integración con ComfyUI mediante plugin nativo instalable desde ComfyUI Manager, con flujo de trabajo de ejemplo publicado.
- Interfaz Gradio y soporte de *CPU offload* y compilación según la guía del proyecto.
- No se documentan capacidades de edición de imagen, inpainting, outpainting, control por imagen de referencia, tool calling ni razonamiento multi-paso; es un modelo estrictamente texto-a-imagen.

## Casos de uso

- Generación de carteles y señalética con texto legible: el modelo puede producir un cartel en chino o inglés con el texto correctamente agrupado, aprovechando el control de layout en JSON para fijar titulares y bloques secundarios.
- Formación y documentación técnica: generación de pizarras blancas, diagramas anotados y capturas sintéticas de interfaces para manuales, donde la comparativa Base vs. SFT del autor muestra una disposición más ordenada.
- Marketing y creatividades multilingües: creación de piezas con copy en inglés y chino para campañas en ambos mercados, usando el mismo checkpoint y variando solo el prompt.
- Prototipado de producto y mockups: generación de escenas con notas manuscritas sobre objetos (por ejemplo, una nota en la puerta de una nevera) para ilustrar flujos de usuario o casos de uso domésticos.
- Diseño editorial y maquetación asistida: uso de layouts JSON para forzar la posición de elementos y generar variantes de una misma composición manteniendo la estructura, con semilla fija para reproducibilidad.
- Aumento de datos sintéticos: generación de imágenes con texto controlado para entrenar o evaluar sistemas OCR, manteniendo la licencia Apache 2.0 para uso comercial.
- Despliegue local con requisitos de privacidad: al ser pesos abiertos y ejecutables en una sola GPU, permite generar material visual sin enviar prompts a servicios externos.
- Integración en pipelines de diseño dentro de ComfyUI: el plugin nativo permite encadenar el modelo con otros nodos de posprocesado y automatizar la generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una comparación cualitativa entre MOSS-Image-Base y MOSS-Image-SFT (agrupación de texto y organización del layout de pizarra), sin métricas cuantitativas como FID, CLIPScore, GenEval, DPGBench ni evaluaciones de precisión de OCR. Tampoco se han encontrado resultados en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 del conjunto de 5.082 M de parámetros ocupan aproximadamente 10,2 GB; sumando codificador de texto, VAE en float32 y activaciones a 1024 x 1024, se estima un pico de 18-24 GB sin *offload*. Con `enable_model_cpu_offload` o `enable_sequential_cpu_offload` puede ejecutarse en GPUs de 12-16 GB a costa de latencia.
- GPU recomendadas: A100 (40/80 GB) o H100 para generación por lotes y alta concurrencia; RTX 4090 o RTX 3090 (24 GB) para uso individual a 1024 x 1024 sin offload; GPUs de 16 GB con offload.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) de forma holgada y en GPUs de 16 GB con offload activado. No se recomienda por debajo de 12 GB.
- Opciones de despliegue: Diffusers con el pipeline personalizado (`custom_pipeline="pipeline_moss_image"`, requiere `trust_remote_code=True`), interfaz Gradio del proyecto, plugin nativo de ComfyUI (instalable desde ComfyUI Manager) y soporte de compilación. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Versiones mínimas indicadas por el autor: Python 3.10 o superior, PyTorch 2.9 o superior, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6`, `Pillow>=10`.
- Latencia y throughput: no disponibles. Como referencia de configuración, el valor por defecto es de 50 pasos con CFG 3 y omisión de la capa 22, lo que sitúa el coste por imagen por encima de configuraciones de 20-30 pasos habituales en modelos de difusión similares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT (esta ficha) | 5.082 M | No disponible; ejemplos a 1024 x 1024 | Apache 2.0 | HuggingFace (repolicación) y ModelScope | Control de texto y layout JSON; sin benchmarks publicados |
| MOSS-Image-Base | No disponible en la informacion | No disponible | Apache 2.0 | HuggingFace y ModelScope (OpenMOSS-Team) | Modelo base del que deriva; peor agrupación de texto según el autor |
| FLUX.1 [dev] | 12.000 M (dato publico del autor) | No verificado en esta busqueda | Licencia no comercial | Pesos abiertos en HuggingFace | Alternativa de mayor tama\u00f1o; no comparable en licencia para uso comercial |
| Stable Diffusion 3.5 Large | 8.000 M (dato publico del autor) | No verificado en esta busqueda | Stability Community License | Pesos abiertos en HuggingFace | Licencia con restricciones por volumen de ingresos |

Los datos de los modelos alternativos proceden de sus fichas públicas y no han podido verificarse en la búsqueda web realizada; se incluyen solo como referencia de orden de magnitud. No se dispone de comparaciones cuantitativas de rendimiento entre MOSS-Image-SFT y estas alternativas.

## Limitaciones y advertencias

- Repolicación de terceros: el repositorio `sekkit/MOSS-Image-SFT` no es el oficial de OpenMOSS. Registra 0 descargas y 0 likes en la consulta, y la fecha de creación declarada en los metadatos es 2026-10-18. Conviene descargar el modelo desde `OpenMOSS-Team/MOSS-Image-SFT` y verificar la integridad de los pesos.
- Ejecución de código remoto: el pipeline requiere `trust_remote_code=True`, lo que implica ejecutar código Python descargado del repositorio. Es un riesgo de seguridad en entornos de producción; se recomienda auditar y fijar la revisión (*commit*) del repositorio.
- Idiomas limitados: solo inglés y chino. El renderizado de texto en otros idiomas, incluido el español, no está soportado ni evaluado.
- Alucinación visual y errores de texto: como todo modelo generativo, puede producir texto mal escrito, caracteres inventados o elementos incoherentes con el prompt, especialmente con muchas regiones de texto o tipografías poco habituales.
- Sesgos: la model card no documenta la composición del dataset de entrenamiento ni evaluaciones de sesgo demográfico, cultural o de representación. Al estar centrado en inglés y chino, es esperable un sesgo hacia contextos culturales de esos idiomas.
- Ausencia de benchmarks: no hay métricas publicadas de fidelidad al prompt, calidad de imagen ni precisión de OCR, por lo que la evaluación cualitativa es imprescindible antes de adoptarlo.
- Coste computacional: 50 pasos por defecto con CFG 3 implican una latencia alta por imagen en comparación con configuraciones más agresivas; el repositorio de 27,2 GB exige espacio en disco y ancho de banda considerables.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una obra derivada conviene revisar también las condiciones del modelo base y de los componentes de terceros citados (por ejemplo, el decodificador VAE de FLUX.2).
- Sin soporte de edición: no cubre inpainting, outpainting, control por imagen ni consistencia entre generaciones; para esos flujos hay que combinarlo con otras herramientas.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/sekkit/MOSS-Image-SFT
- Modelo base en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo SFT oficial: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio de código: https://github.com/OpenMOSS/MOSS-Image
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guía de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Integración con ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Flujo de trabajo de ejemplo en ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- Perfil en X: https://x.com/Open_MOSS

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos eran contenido no relacionado). Todos los enlaces anteriores proceden de la model card del repositorio.
