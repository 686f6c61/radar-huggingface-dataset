# azukivc/Qwen-Image-2.1-GGUF

## Resumen

Qwen-Image-2.1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo de difusión text-to-image Qwen/Qwen-Image-2.1, publicado por el usuario azukivc. El objetivo es permitir la generación de imágenes en local dentro de ComfyUI reduciendo drásticamente los requisitos de memoria respecto a los pesos originales: el repositorio ocupa 54,9 GB e incluye el transformer cuantizado, el codificador de texto (Qwen3-VL 8B en BF16 o Int8) y el VAE (676 MB en BF16). El modelo base declara 7.115.124.736 parámetros (~7,1 B) según los pesos safetensors originales.

El paquete está pensado para el ecosistema ComfyUI-GGUF: los ficheros se colocan en `models/diffusion_models`, `models/text_encoders` y `models/vae`, y se cargan con los nodos `Unet Loader (GGUF)`, `CLIPLoader` (tipo `qwen_image`) y `VAELoader`. La configuración recomendada por el autor es Q4_K_M (~4,60 GB) para el transformer y el codificador de texto Int8 (~9,35 GB) ejecutándose en RAM, lo que permite generar imágenes en GPU con 8-12 GB de VRAM.

Es relevante ahora porque baja el coste de entrada al modelo de difusión de Qwen a hardware de consumo sin reentrenar nada: se trata de una conversión directa del modelo upstream (revisión `b3179ad355be050328e483a9dfdd9e60cd62adfa`), no de un ajuste fino. El repositorio declara además que la release GGUF no incorpora filtro de seguridad ni comprobador de contenido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (el transformer se carga como "Unet Loader (GGUF)"); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 7.115.124.736 (~7,1 B), dato de los pesos safetensors del modelo base |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (`license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF (transformer cuantizado); safetensors BF16 / Int8 (codificador de texto Qwen3-VL 8B); safetensors BF16 (VAE) |
| Tamano del repositorio | 54,9 GB |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Revision del modelo base | b3179ad355be050328e483a9dfdd9e60cd62adfa |
| Libreria | gguf |
| Pipeline | text-to-image |

Desglose de ficheros incluidos:

| Fichero | Precision | Tamano |
|---|---|---|
| qwen-image-2.1-Q8_0.gguf | Q8_0 | 7,59 GB |
| qwen-image-2.1-Q6_K.gguf | Q6_K | 5,88 GB |
| qwen-image-2.1-Q5_K_M.gguf | Q5_K_M | 5,22 GB |
| qwen-image-2.1-Q4_K_M.gguf | Q4_K_M | 4,60 GB |
| qwen-image-2.1-Q4_0.gguf | Q4_0 | 4,05 GB |
| text_encoders/qwen3vl_8b_bf16.safetensors | BF16 | 17,53 GB |
| text_encoders/qwen3vl_8b_int8_convrot.safetensors | Int8 | 9,35 GB |
| vae/qwen_image_2.1_vae_bf16.safetensors | BF16 | 676 MB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de que se trata de un modelo de difusión para generación de imágenes a partir de texto y de que el fichero cuantizado corresponde al componente transformer (nodo `Unet Loader (GGUF)` en ComfyUI). La cadena de componentes es la habitual en difusión latente: un transformer de difusión de ~7,1 B de parámetros, un codificador de texto multimodal Qwen3-VL de 8 B que produce el condicionamiento textual y un VAE independiente de 676 MB que decodifica el espacio latente a píxeles.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO, ya que se trata de una conversión de pesos y no de un entrenamiento nuevo. La innovación técnica que aporta el repositorio es la propia cuantización GGUF (convertida con stable-diffusion.cpp) y el empaquetado de los ficheros acompañantes, que evita tener que descargar el codificador de texto y el VAE desde repositorios separados. El VAE incluye una variante con convolución de rotación de 8 bits en el codificador de texto (`int8_convrot`), pensada para reducir memoria con impacto mínimo en la calidad.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el transformer de difusión cuantizado.
- Edición de imágenes: existe una plantilla oficial de flujo de trabajo de edición (`image_qwen_image_2_1_image_edit.json`) compatible con este GGUF.
- Condicionamiento textual mediante un codificador Qwen3-VL de 8 B, lo que permite prompts descriptivos largos y estructurados (la ventana de contexto concreta del codificador no se especifica).
- Integración nativa con ComfyUI a través de ComfyUI-GGUF, incluyendo carga del transformer en GPU y descarga del codificador de texto a RAM.
- Ejecución sin comprobador de seguridad integrado: el autor indica que la release no incorpora filtro de contenido y que no rechaza prompts ni aplica censura en la salida.
- Soporte de distintos niveles de cuantización (Q4_0 a Q8_0) para ajustar el equilibrio entre memoria y fidelidad.
- No se documentan capacidades de tool calling, agentes, audio, vídeo ni un modo de razonamiento explícito, por lo que no se pueden afirmar.

## Casos de uso

- Generación de imágenes en GPU de consumo: con Q4_K_M (~4,60 GB) en VRAM y el codificador de texto Int8 (~9,35 GB) en RAM del sistema, el modelo cabe en equipos con 8-12 GB de VRAM, lo que permite trabajar sin acceso a GPU de datacenter.
- Prototipado de pipelines de difusión en ComfyUI: el repositorio incluye transformer, codificador de texto y VAE, de modo que se puede montar un grafo funcional completo con tres nodos sin depender de descargas adicionales.
- Edición y retoque de imágenes en local: usando la plantilla oficial de image edit, el modelo puede emplearse en flujos de modificación de imágenes existentes dentro del mismo entorno ComfyUI.
- Investigación sobre cuantización y degradación de calidad: al ofrecer cinco niveles (Q4_0, Q4_K_M, Q5_K_M, Q6_K y Q8_0) del mismo transformer, permite comparar la pérdida de fidelidad frente al modelo base BF16 en igualdad de prompts y semillas.
- Red teams y auditoría de seguridad de modelos generativos: al no incluir filtro de contenido, es un banco de pruebas para estudiar la generación de material sensible y evaluar la eficacia de filtros externos, siempre dentro del marco legal aplicable.
- Producción de assets gráficos en entornos con presupuesto de memoria limitado: el formato GGUF y la posibilidad de descargar el codificador a RAM reducen el pico de VRAM y permiten reutilizar una única GPU para varias tareas de generación por lotes.
- Despliegue en estaciones de trabajo sin conexión a Internet: al estar todos los ficheros acompañantes en el mismo repositorio, se puede preparar una instalación offline completa con un único origen de descarga.
- Iteración rápida de prompts en investigación creativa: el coste de codificación textual se paga una sola vez por prompt, por lo que mantener el codificador en CPU apenas penaliza la velocidad de muestreo cuando se encadenan generaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que no se acompaña de cifras ni de metodología en el texto proporcionado, por lo que no se reproducen valores numéricos.

## Requisitos de hardware

- VRAM estimada para el transformer de difusion: 4,05 GB (Q4_0), 4,60 GB (Q4_K_M), 5,22 GB (Q5_K_M), 5,88 GB (Q6_K) y 7,59 GB (Q8_0), a lo que hay que sumar el espacio de activaciones y latentes durante el muestreo.
- Codificador de texto: 9,35 GB en Int8 o 17,53 GB en BF16. El autor recomienda mantenerlo en RAM del sistema o con offload a CPU, ya que solo se ejecuta una vez por prompt.
- Configuracion recomendada por el autor: Q4_K_M (~4,60 GB) en VRAM + `qwen3vl_8b_int8_convrot.safetensors` (~9,35 GB) en RAM.
- Si el codificador de texto tambien debe residir en VRAM, el pico estimado se situa en torno a 14-17 GB, lo que exige tarjetas de 16 GB o superiores.
- Cabe en GPU de consumo: si, en el escenario recomendado. Son candidatas razonables por memoria disponible tarjetas de 8-12 GB (por ejemplo RTX 3060 12 GB o RTX 4060 Ti 16 GB) y, con mas margen, modelos de 16-24 GB. No se dispone de mediciones de compatibilidad especificas por modelo.
- El autor recomienda arrancar ComfyUI con el argumento `--lowvram` si aparecen errores de memoria insuficiente.
- Opciones de despliegue: ComfyUI con la extension ComfyUI-GGUF (se recomienda la bifurcacion de `leejet`, con soporte nativo de Qwen-Image 2.1; con la version antigua de `city96` puede aparecer un error `Unknown model architecture!`). La conversion se realizo con stable-diffusion.cpp. No se documentan otros servidores de inferencia.
- Advertencia del autor sobre Q8_0: en funcion de la GPU y del entorno de ComfyUI puede producirse un error de dimensiones (`[136] vs [128]`); para estabilidad se recomiendan Q4_K_M, Q5_K_M o Q6_K.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos verificables de modelos alternativos (parametros, contexto, rendimiento o licencia), por lo que no se puede construir una comparativa fiable frente a otras alternativas de la misma categoria. La unica comparacion posible con los datos disponibles es interna, entre los niveles de cuantizacion de este mismo repositorio:

| Version | Tamano del fichero | Precision | Estado |
|---|---|---|---|
| Q8_0 | 7,59 GB | 8 bits | Puede fallar con error de dimensiones en algunos entornos |
| Q6_K | 5,88 GB | ~6 bits | Estable segun el autor |
| Q5_K_M | 5,22 GB | ~5 bits | Estable segun el autor |
| Q4_K_M | 4,60 GB | ~4 bits | Recomendada por el autor (mejor equilibrio tamano/calidad) |
| Q4_0 | 4,05 GB | 4 bits | La mas ligera, sin recomendacion explicita |
| Modelo base BF16 | Repositorio de 54,9 GB en total | 16 bits | Referencia de calidad, mayores requisitos de memoria |

## Limitaciones y advertencias

- Ausencia de filtro de seguridad: el autor declara explicitamente que esta release no incorpora comprobador de seguridad ni filtro de contenido, y que genera imagenes para adultos, NSFW o sensibles sin rechazar prompts ni censurar la salida. El uso en produccion exige filtros propios y control de acceso.
- Riesgo de alucinacion visual: no hay datos publicados sobre fidelidad al prompt, coherencia anatomica o consistencia de texto dentro de la imagen, por lo que no puede cuantificarse el error.
- La model card anuncia una version "fully uncensored" en desarrollo, lo que implica que el comportamiento del repositorio puede cambiar en futuras revisiones.
- Licencia `qwen-research` (`license: other`): la informacion disponible no detalla los terminos exactos ni el alcance del uso comercial. Debe revisarse el texto completo de la licencia antes de cualquier despliegue productivo.
- Idiomas soportados: no disponibles. No se puede confirmar el comportamiento multilingue del condicionamiento textual.
- Inconsistencia en los enlaces: los enlaces a ficheros de la model card apuntan al espacio de nombres `abenzerps/Qwen-Image-2.1-GGUF`, mientras que el repositorio consultado es `azukivc/Qwen-Image-2.1-GGUF`. Conviene verificar el origen real de los pesos antes de descargarlos.
- Dependencia de una bifurcacion concreta de ComfyUI-GGUF (`leejet`): con versiones antiguas puede fallar la carga del modelo.
- Problema conocido en Q8_0 (error de dimensiones `[136] vs [128]`) segun GPU y entorno.
- Metadatos pobres: el repositorio registra 0 descargas y 0 likes, y no incluye datos de entrenamiento, idiomas ni benchmarks numericos, lo que limita la trazabilidad y la validacion independiente.
- El tamano del repositorio (54,9 GB) obliga a planificar el almacenamiento si se descargan todas las cuantizaciones y los codificadores de texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/azukivc/Qwen-Image-2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Codificador de texto y VAE de origen: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (bifurcacion recomendada): https://github.com/leejet/ComfyUI-GGUF
- Plantilla de flujo text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla de flujo image edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp (referencia truncada en la model card; el enlace exacto no aparece completo en la informacion disponible)
- Espacio de nombres al que apuntan los enlaces de la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-GGUF
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre el vehiculo Geely EX5) y no aportan enlaces utiles. No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
