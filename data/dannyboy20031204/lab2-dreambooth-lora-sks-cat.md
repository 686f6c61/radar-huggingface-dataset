# dannyboy20031204/lab2-dreambooth-lora-sks-cat

## Resumen

`dannyboy20031204/lab2-dreambooth-lora-sks-cat` es un adaptador LoRA para Stable Diffusion v1.4 entrenado con DreamBooth sobre un conjunto de 4 imágenes de un gato. No es un modelo generativo completo: es un fichero de pesos de bajo rango que se carga encima del modelo base `CompVis/stable-diffusion-v1-4` mediante la librería `diffusers`. Su función es enseñar al modelo base un concepto concreto (un gato asociado al token raro `sks`) sin reentrenar los pesos completos.

El adaptador fue publicado por el usuario dannyboy20031204 como parte de un ejercicio académico ("Lab 2, Task 2-2") a partir del código de arranque `Lab2-DDIM-LoRA`. El prompt de instancia utilizado es `a photo of a sks cat`, y el entrenamiento se realizó durante 500 pasos con learning rate 1e-4, batch size 1, resolución 512 px y precisión fp16. Se trata, por tanto, de un artefacto de aprendizaje con fines demostrativos y no de un modelo orientado a producción.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo canónico y reproducible del flujo DreamBooth + LoRA, que es la técnica estándar para personalización de difusión con recursos limitados; por otro, sirve para ilustrar qué datos son habitualmente públicos en este tipo de adaptadores y cuáles no (rango LoRA, licencia, idiomas o benchmarks no están declarados en la model card). El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y el tamaño declarado es de 0,0 GB (redondeo de la API), coherente con un adaptador LoRA de pocos megabytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre un UNet de difusion (Stable Diffusion v1.4); no es un modelo autonomo |
| Parametros totales | no disponible (el rango LoRA y el numero de modulos adaptados no se declaran en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens del codificador de texto CLIP ViT-L/14 heredados del modelo base |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite fp16 y fp32 en `diffusers` |
| Idiomas soportados | no disponible; el prompt de instancia y el codificador CLIP del modelo base estan orientados a ingles |
| Licencia | no disponible para el adaptador; el modelo base se distribuye bajo CreativeML Open RAIL-M |
| Formato de pesos | no disponible en la model card; carga mediante `diffusers` (`load_lora_weights`) |
| Modelo base | CompVis/stable-diffusion-v1-4 |
| Libreria | diffusers |
| Resolucion de entrenamiento | 512 px |
| Fecha de creacion (segun API) | 2026-10-09 |
| Fecha de actualizacion (segun API) | 2026-10-09 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB (redondeado por la API) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, una tecnica de ajuste eficiente que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas (habitualmente las proyecciones de las capas de atencion del UNet y, en algunas configuraciones, del codificador de texto). DreamBooth se utiliza como metodo de personalizacion: se asocia un identificador poco frecuente (`sks`) a un sujeto concreto y se optimiza el modelo para que reproduzca ese sujeto cuando el token aparece en el prompt. La ventaja frente a un fine-tuning completo es el tamano reducido de los pesos resultantes y la facilidad de intercambio entre distintas personalizaciones. El rango y los modulos exactos adaptados no se especifican en la model card.

Los datos de entrenamiento declarados son cuatro imagenes (`dreambooth-cat`) procedentes del material de arranque `Lab2-DDIM-LoRA`. La configuracion reportada es de 500 pasos de optimizacion, learning rate 1e-4, batch 1, resolucion 512 px y fp16. No se documentan composicion del dataset, numero de tokens, ni uso de RLHF, DPO o tecnicas de alineacion, que por otra parte no aplican al paradigma de difusion. Tampoco se mencionan innovaciones tecnicas adicionales como decodificacion especulativa (propia de modelos de lenguaje) ni mecanismos de atencion lineal.

## Capacidades

- Generacion de imagenes condicionada por texto a traves del modelo base Stable Diffusion v1.4: el adaptador solo aporta la personalizacion del concepto aprendido.
- Personalizacion de sujeto: permite generar representaciones del gato entrenado cuando el prompt incluye el token `sks`, por ejemplo `a photo of sks cat in a bucket`.
- Composicion de escenas: al apoyarse en el modelo base, hereda la capacidad de situar el sujeto en contextos, estilos y fondos descritos en el prompt.
- Uso combinable con otros LoRA y con pesos de modelo base compatibles (SD 1.4 y, en la practica, a menudo SD 1.5 por compatibilidad de arquitectura, aunque no esta garantizado).
- Integracion con el ecosistema `diffusers` mediante `pipe.load_lora_weights(...)`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision de entrada, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de ejercicios docentes: sirve como referencia para validar un pipeline DreamBooth + LoRA completo, desde el entrenamiento hasta la inferencia con `diffusers`, en cursos de generacion de imagenes.
- Generacion de imagenes de un sujeto concreto: insertar el token `sks` en el prompt permite obtener variaciones del gato en escenas nuevas sin reentrenar el modelo base.
- Pruebas de concepto de personalizacion con muy pocos datos: resulta util para medir como se comporta DreamBooth con un conjunto de tan solo cuatro imagenes y 500 pasos.
- Integracion en interfaces de generacion: el adaptador se puede cargar en herramientas compatibles con LoRA de `diffusers` para experimentar con mezcla de adaptadores.
- Comparacion de tecnicas de ajuste eficiente: permite contrastar DreamBooth + LoRA frente a Textual Inversion o fine-tuning completo en cuanto a coste, tamano y fidelidad del concepto.
- Evaluacion de riesgos de sobreajuste: al tratarse de un entrenamiento muy corto sobre un dataset minimo, es un caso idoneo para estudiar degradacion de diversidad y copia de las imagenes de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA por si solo ocupa del orden de megabytes (el repositorio figura como 0,0 GB por redondeo de la API).
- La inferencia requiere cargar el modelo base completo `CompVis/stable-diffusion-v1-4`: en fp16 ocupa aproximadamente 2 GB de VRAM y en fp32 alrededor de 4 GB, sin contar los picos de memoria del VAE y del proceso de muestreo.
- Cabe en GPU de consumo: tarjetas con 6 GB o mas de VRAM pueden ejecutar el pipeline en 512x512, especialmente con fp16 y tecnicas de ahorro de memoria (attention slicing, VAE tiling). Modelos como RTX 3060, RTX 4060 o superiores son suficientes.
- Para entrenamiento o generacion de lotes grandes se recomienda una GPU con 12-24 GB (RTX 3090, RTX 4090, A5000) e incluso A100/H100 en entornos de investigacion.
- Opciones de despliegue: `diffusers` (referencia del autor), y herramientas de la comunidad compatibles con LoRA de SD 1.x como AUTOMATIC1111 WebUI, ComfyUI o InvokeAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son entornos para modelos de lenguaje y no aplican aqui.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del modelo base, del numero de pasos de muestreo, del sampler y del hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada. A continuacion se comparan categorias de personalizacion de difusion, marcando como "no disponible" los valores no publicados.

| Enfoque | Tipo de artefacto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DreamBooth + LoRA, SD 1.4) | Adaptador LoRA | no disponible (rango no declarado) | 77 tokens (heredado del modelo base) | no disponible | HuggingFace, 0 descargas |
| DreamBooth con fine-tuning completo | Pesos completos del modelo | cientos de millones (UNet SD 1.x) | 77 tokens | CreativeML Open RAIL-M sobre el modelo base | Ampliamente documentado en la comunidad |
| Textual Inversion | Embedding de texto | miles de parametros | 77 tokens | Depende del autor | Ampliamente documentado en la comunidad |
| LoRA generico para SD 1.5 | Adaptador LoRA | no disponible (variable) | 77 tokens | Variable segun autor | Amplia en HuggingFace |

## Limitaciones y advertencias

- Entrenamiento minimo: 4 imagenes y 500 pasos favorecen el sobreajuste; es probable que el modelo reproduzca las imagenes de entrenamiento y muestre poca diversidad en posturas, fondos o iluminacion.
- El concepto queda ligado al token `sks`; sin ese token en el prompt, el efecto de personalizacion puede no aparecer, y su uso junto a palabras no vistas en entrenamiento puede degradar la coherencia de la imagen.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos incorrectos, texturas irreales o artefactos, especialmente con prompts alejados de la distribucion de entrenamiento.
- Idiomas: el codificador de texto del modelo base esta orientado al ingles; no se documentan capacidades multilingues.
- Restricciones de licencia: la licencia del adaptador no esta declarada. El modelo base Stable Diffusion v1.4 se distribuye bajo CreativeML Open RAIL-M, que incluye restricciones de uso; conviene verificar la compatibilidad antes de cualquier uso comercial.
- Trazabilidad: el autor no publica rango LoRA, modulos adaptados, formato exacto de pesos ni detalles del dataset, lo que dificulta reproducir el entrenamiento.
- El repositorio presenta 0 descargas y 0 likes, y no cuenta con validacion externa de la comunidad.
- Procedencia academica: se trata de un ejercicio de laboratorio, no de un artefacto pensado para produccion; no debe usarse como componente critico en un sistema comercial sin evaluacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dannyboy20031204/lab2-dreambooth-lora-sks-cat
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo: todas las entradas devueltas corresponden a catalogos de producto de una empresa de saneamiento, sin relacion con el adaptador LoRA ni con DreamBooth. No se dispone, por tanto, de papers, blogs o repositorios adicionales verificados en la informacion proporcionada.
