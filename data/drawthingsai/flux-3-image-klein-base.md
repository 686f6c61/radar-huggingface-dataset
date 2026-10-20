# drawthingsai/flux-3-image-klein-base

## Resumen

FLUX 3 Image Klein Base es un checkpoint de pesos abiertos de 5,6 mil millones de parámetros para generación de imagen a partir de texto y edición de imágenes, desarrollado por Black Forest Labs y distribuido en este repositorio por el usuario `drawthingsai`. El modelo unifica en una sola red tres tareas que habitualmente requieren pipelines separados: texto-a-imagen, edición con una única imagen de referencia y composición con múltiples referencias (hasta 10). Como codificador de texto emplea Qwen3-VL-4B-Instruct, un componente separado del transformador de imagen al que se refiere la cifra de 5,6B.

La variante publicada aquí es el checkpoint **base sin destilar**, pensado para fine-tuning, entrenamiento de LoRA e investigación, con 50 pasos de muestreo y una escala de guiado (guidance) de 3,5. La versión destilada equivalente, que es la que sirve la API de BFL, se distribuye en un repositorio aparte con 16 pasos y sin guiado. Entre las capacidades diferenciales destacan el control de composición mediante cajas delimitadoras expresadas en el propio prompt sobre una rejilla de 0 a 1000, y el renderizado de texto legible dentro de la imagen generada.

Su relevancia actual radica en que permite a un equipo entrenar adaptaciones propias sobre la arquitectura completa de FLUX 3 sin depender de la API, a costa de una licencia restrictiva (FLUX Kommunity License) y de un requisito operativo poco habitual: el modelo exige un *prompt upsampler* externo que expanda la petición a una caption de escena completa, ya que con prompts cortos la salida es genérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusion para imagen (detalles internos de atencion no disponibles); codificador de texto Qwen3-VL-4B-Instruct; autoencoder de imagen |
| Parametros totales | 5,6B en el transformador de imagen (el codificador de texto es adicional y separado de esa cifra) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un parametro de contexto textual; el limite lo fija el codificador de texto, valor no publicado en la informacion disponible) |
| Tipos de cuantizacion | BF16 (checkpoint raiz), FP8 (`variants/fp8r`), NVFP4 (`variants/nvfp4`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | FLUX Kommunity License (`flux-kommunity-license`), uso no comercial y excepcion de salida comercial para Qualifying Users |
| Formato de pesos | safetensors (`model.safetensors`, `ae.safetensors`, `text_encoder/*`), compatible con Diffusers |
| Desarrollador | Black Forest Labs (repositorio distribuido por `drawthingsai`) |
| Pasos de muestreo recomendados | 50 |
| Guidance recomendado | 3,5 |
| Imagenes de referencia | Hasta 10 por peticion |
| Control de composicion | Cajas delimitadoras en el prompt sobre rejilla 0-1000 |
| Clasificador de seguridad | `Falconsai/nsfw_image_detection`, cargado siempre en el codigo de referencia |

## Arquitectura y entrenamiento

La informacion disponible confirma un transformador de difusion de 5,6B parametros para la generacion de imagen, acompanado de un autoencoder y de un codificador de texto Qwen3-VL-4B-Instruct que aporta la comprension multimodal del prompt y de las imagenes de referencia. El texto, las referencias visuales y las cajas delimitadoras se procesan de forma conjunta, de modo que texto-a-imagen, edicion con una referencia y composicion con varias referencias se resuelven con la misma red en lugar de con pipelines especializados. No se detalla en la model card el tipo de atencion interna, la composicion exacta del dataset ni el numero de tokens o pares imagen-texto empleados en el entrenamiento.

El checkpoint publicado es la version **sin destilar**, entrenada presumiblemente en dos etapas: un modelo base que requiere 50 pasos con guidance 3,5, y una posterior destilacion (publicada aparte, 16 pasos, sin guidance) que reduce el coste de inferencia para produccion. La model card no especifica si hubo RLHF, DPO ni etapas de ajuste por preferencias, ni detalla la innovacion tecnica del bloque de atencion. Si documenta dos decisiones operativas relevantes: la obligatoriedad de un *prompt upsampler* externo (modelo de 9B, `flux-3-image-klein-pup`, 18,8 GB) que reescribe la peticion como caption de escena completa, y un formato de cajas sobre rejilla de 0 a 1000 que guia colocacion y escala sin actuar como mascara dura sobre los pixeles.

## Capacidades

- Generacion de imagen a partir de texto con captions de escena completas.
- Edicion de imagen con una unica referencia visual (image-to-image).
- Composicion con multiples referencias (hasta 10 imagenes) en una sola generacion.
- Control de composicion mediante cajas delimitadoras en el prompt (rejilla 0-1000): colocar, recolorear, mover, reemplazar o eliminar elementos.
- Renderizado de texto legible dentro de la imagen generada.
- Comprension multimodal del prompt gracias al codificador Qwen3-VL-4B-Instruct.
- Almacenamiento de la peticion ampliada mediante LLM externo (*prompt upsampling*) para obtener resultados detallados.
- Capacidad de fine-tuning y entrenamiento de LoRA al ser un checkpoint sin destilar.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- Cobertura linguistica limitada al ingles.

## Casos de uso

- **Fine-tuning de estilo de marca:** al ser un checkpoint sin destilar, un equipo puede entrenar LoRA sobre su propio corpus de producto para fijar una estetica consistente, manteniendo el resto de capacidades del modelo intactas.
- **Edicion de catalogo de producto:** partiendo de una fotografia de referencia y una caption completa, se generan variantes de fondo, iluminacion o contexto sin rehacer la sesion fotografica, con el objeto original preservado por la referencia visual.
- **Composicion publicitaria con control de layout:** el uso de cajas sobre la rejilla 0-1000 permite reservar zonas concretas de la imagen para titulares, logotipos o productos, algo util en maquetas de campana antes de pasar a diseno final.
- **Generacion de carteles y rotulos con texto integrado:** la capacidad de renderizar texto dentro de la imagen evita el paso posterior de composicion tipografica en piezas de senaletica, banners o portadas.
- **Investigacion sobre destilacion de modelos de difusion:** comparar el base (50 pasos, guidance 3,5) con el destilado (16 pasos, sin guidance) permite medir la perdida de calidad frente a la reduccion de coste de inferencia en un mismo modelo.
- **Previsualizacion en preproduccion audiovisual:** generar frames de concepto con multiples referencias de vestuario, localizacion y paleta para alinear al equipo antes del rodaje.
- **Assets para videojuegos con referencias cruzadas:** combinar referencias de personaje y de entorno para producir ilustraciones conceptuales coherentes entre si dentro de la misma peticion.
- **Generacion de datos sinteticos con control espacial:** producir imagenes etiquetadas con posiciones conocidas gracias a las cajas del prompt, utiles para aumentar datasets de vision por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada (BF16):** el transformador de 5,6B ocupa aproximadamente 11,2 GB en pesos; el codificador Qwen3-VL-4B anade unos 8 GB en BF16; el autoencoder es marginal. Residencia completa en GPU en torno a 20-21 GB, segun estimacion derivada del numero de parametros, no dato oficial.
- **VRAM estimada (FP8):** transformador en torno a 5,6 GB; permite ejecucion en GPUs de 16-24 GB dejando margen para el codificador de texto.
- **VRAM estimada (NVFP4):** transformador en torno a 2,8-3 GB; la variante mas ligera, aunque la model card advierte que el tamano de fichero no equivale al consumo total de VRAM en ejecucion.
- **GPU recomendadas:** A100 40 GB u H100 80 GB para el pipeline completo en BF16 sin offload; RTX 4090 (24 GB) para BF16 justo o FP8 con holgura.
- **Cabe en GPU de consumidor:** si, en RTX 4090/3090 (24 GB) con FP8 o NVFP4, y previsiblemente en GPUs de 16 GB con NVFP4 y offload del codificador de texto.
- **Componente adicional:** el *prompt upsampler* `flux-3-image-klein-pup` pesa 18,8 GB y puede ejecutarse en un dispositivo distinto o de forma secuencial; no es opcional si se quieren resultados detallados.
- **Opciones de despliegue:** Diffusers (pipeline modular), codigo de referencia `scripts/cli.py` del repositorio de GitHub, y cargadores que soporten los formatos FP8/NVFP4. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- **Latencia y throughput:** no disponibles. A modo de referencia, el checkpoint base requiere 50 pasos frente a los 16 del destilado, por lo que el coste por imagen es aproximadamente tres veces mayor solo en pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Referencias | Pasos | Licencia | Uso comercial |
|---|---|---|---|---|---|
| FLUX 3 Image Klein Base (este) | 5,6B (transformador) | Hasta 10 | 50, guidance 3,5 | FLUX Kommunity License | No comercial, con excepcion para Qualifying Users |
| FLUX 3 Image Klein (destilado) | 5,6B (transformador) | Hasta 10 | 16, sin guidance | FLUX Kommunity License | No comercial, con excepcion para Qualifying Users |
| FLUX.1 [dev] | 12B | No disponible | No disponible | Licencia no comercial de FLUX.1 | No comercial |
| Qwen-Image | 20B | No disponible | No disponible | Apache 2.0 | Si |

La comparativa se limita a parametros, licencia y disponibilidad: no se han publicado en la informacion proporcionada resultados de benchmarks que permitan contrastar calidad de generacion, fidelidad de edicion o adherencia al prompt entre estos modelos. La ventaja declarada de FLUX 3 Image Klein frente a alternativas de una sola tarea es la unificacion de texto-a-imagen, edicion con referencia y composicion multi-referencia en un unico checkpoint, junto con el control por cajas delimitadoras.

## Limitaciones y advertencias

- **Licencia restrictiva:** la FLUX Kommunity License solo permite uso no comercial salvo que se encaje en la excepcion de salida comercial para Qualifying Users. Es imprescindible revisar `LICENSE.md` antes de cualquier despliegue en produccion.
- **Dependencia critica del prompt upsampler:** la model card advierte explicitamente de que no debe usarse el modelo sin un upsampler. Diffusers no lo ejecuta por si mismo; hay que orquestarlo aparte o enviar captions ya escritas por otro LLM.
- **Idioma:** el modelo solo declara soporte de ingles; los prompts en castellano no estan cubiertos por la model card.
- **Checkpoint sin destilar:** requiere 50 pasos y guidance 3,5, lo que multiplica el coste de inferencia frente al destilado de 16 pasos. Es adequado para entrenamiento, no para servir trafico en produccion sin destilar.
- **Riesgo de alucinacion visual:** no se documentan metricas de fidelidad; como todo modelo generativo, puede producir elementos inexistentes, texto mal formado o incoherencias en escenas complejas. No hay datos publicados al respecto.
- **Cajas delimitadoras no vinculantes:** las cajas guian colocacion y escala, pero no constrenen los pixeles a una mascara dura, por lo que el control de layout es aproximado.
- **Sesgos:** no se documenta en la informacion disponible ninguna evaluacion de sesgos demograficos, culturales o de representacion.
- **Repositorio espejo incompleto:** este repositorio de `drawthingsai` declara un tamano de 0,0 GB y cero descargas, lo que sugiere que los pesos no estan alojados aqui. Conviene descargar desde el repositorio oficial de Black Forest Labs.
- **Clasificador de seguridad obligatorio:** el codigo de referencia carga siempre `Falconsai/nsfw_image_detection`, lo que anade una dependencia y un coste de inferencia adicional.
- **Fecha de publicacion del repositorio:** figura como creado el 2026-10-19, dato que conviene verificar contra el repositorio oficial.

## Enlaces

- Repositorio en HuggingFace (este espejo): https://huggingface.co/drawthingsai/flux-3-image-klein-base
- Checkpoint base oficial: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Checkpoint destilado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Prompt upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Prompts de sistema del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Codigo de inferencia de referencia: https://github.com/black-forest-labs/flux-3-image-klein
- Variante FP8: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/fp8r
- Variante NVFP4: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/nvfp4
- Clasificador de seguridad: https://huggingface.co/Falconsai/nsfw_image_detection
- Licencia: https://huggingface.co/drawthingsai/flux-3-image-klein-base/blob/main/LICENSE.md
- API de Black Forest Labs: https://bfl.ai
