# ml-resources/RMBG-3.0

## Resumen

RMBG-3.0 es la tercera generación del modelo de eliminación de fondos de BRIA AI, y la primera construida sobre una base generativa en lugar de una arquitectura discriminativa de segmentación. Parte de Fibo 2.0, el modelo de difusión de BRIA para generación y edición de imágenes, y se ha afinado y destilado para una única tarea: convertir cualquier fotografía en una máscara alfa (alpha matte) limpia y con bordes suaves en solo cuatro pasos de muestreo. Esta ficha describe el espejo no oficial `ml-resources/RMBG-3.0`, que replica sin modificaciones los pesos del repositorio original `briaai/RMBG-3.0`.

El modelo tiene 8.127.342.213 parámetros (aproximadamente 8,1 mil millones) y se distribuye en formato `safetensors` para la librería `diffusers`, a través del pipeline `BriaFibo2Pipeline`. Su relevancia actual radica en dos factores: por un lado, el salto cualitativo que supone usar un modelo generativo que "entiende" la escena para decidir qué es sujeto y qué es fondo, en lugar de depender únicamente de señales de borde; por otro, que según la model card encabeza una comparativa propia frente a Photoroom, remove.bg (Canva), Ideogram, BiRefNet y RMBG-2.0 sobre 234 imágenes deliberadamente difíciles.

La licencia es el punto crítico: se distribuye bajo `bria-fibo`, que remite a CC BY-NC 4.0, es decir, uso exclusivamente no comercial. El espejo lo indica de forma explícita y elimina el formulario de solicitud de acceso del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión generativo (base Fibo 2.0), destilado a 4 pasos; pipeline `BriaFibo2Pipeline` en `diffusers` |
| Parametros totales | 8.127.342.213 (~8,1 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | `en` (segun metadatos; el modelo opera sobre imagenes, no texto) |
| Licencia | `bria-fibo`, que remite a CC BY-NC 4.0 (uso no comercial) |
| Formato de pesos | `safetensors` (libreria `diffusers`) |

## Arquitectura y entrenamiento

RMBG-3.0 no es un transformer de segmentación al uso, sino un modelo de difusión generativo adaptado a la predicción de máscaras alfa. Se construye sobre Fibo 2.0 (`briaai/Fibo-2.0-dev`) mediante fine-tuning y destilación, de modo que hereda la capacidad del modelo base para interpretar la escena completa y la redirige hacia una única salida: el alpha matte. La inferencia se realiza en cuatro pasos y, según la model card, sin classifier-free guidance, lo que reduce el coste computacional típico de los modelos de difusión. El pipeline asociado es `BriaFibo2Pipeline`.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (en un modelo de imagen estas etapas no serían el mecanismo habitual). Sí se afirma de forma explícita que, como todos los modelos FIBO, se ha entrenado exclusivamente con datos licenciados, lo que el autor presenta como una ventaja de gobernanza y claridad legal. La innovación técnica destacable es precisamente esa combinación: fundamento generativo más destilación a pocos pasos para una tarea de matting, con salida de máscara suave en lugar de segmentación binaria.

## Capacidades

- Eliminación de fondo con salida en alpha matte de bordes suaves, apta para composición sobre cualquier fondo.
- Generación de recortes (cut-out) usando el matte como canal alfa.
- Distinción semántica de sujeto frente a fondo: mantiene a todas las personas en una foto de grupo y conserva extremidades con desenfoque de movimiento.
- Manejo de estructuras con huecos: vallas metálicas, radios de bicicleta, tejidos de punto calado, donde el fondo debe verse a través de los agujeros.
- Tratamiento de sombras proyectadas: según el autor, identifica una sombra arrojada como no perteneciente al producto.
- Conservación de detalles finos: pelo, pelaje, plumas, ramas y flores en ramos densos.
- Objetos transparentes y superficies reflectantes, categorías en las que el autor reporta liderazgo.
- Preservación de texto, logotipos e insignias en imágenes de producto de comercio electrónico.
- Inferencia en 4 pasos, sin classifier-free guidance.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- **Fotografía de producto para comercio electrónico:** el modelo genera el matte del producto para colocarlo sobre fondo blanco o de marca. Es adecuado porque, según la comparativa del autor, encabeza las 48 imágenes reales de tienda online evaluadas (rango medio 1,15) y conserva texto, logotipos e insignias del envase.
- **Retoque fotográfico profesional en estudio:** sustitución de fondos en retratos y fotografía de moda manteniendo pelo y bordes suaves. La salida en alpha matte permite composición fina sobre fondos nuevos sin halos.
- **Catálogos de moda con prendas caladas o transparentes:** el modelo conserva el fondo visible a través de tejidos de punto abierto y mantiene sólidas las zonas de satén, lo que resuelve un caso históricamente problemático para segmentadores basados en bordes.
- **Automatización de pipelines de preprocesado para generación de imágenes:** recortar el sujeto antes de pasarlo a un modelo de edición o de img2img, evitando que el fondo original contamine el resultado.
- **Tratamiento de imágenes de cliente en bruto para marketing:** las 20 imágenes reales de cliente incluidas en la evaluación se eligieron por ser difíciles, lo que indica que el modelo está pensado para entradas no controladas y no solo para fotografía de estudio.
- **Preparación de material gráfico para ilustración y diseño:** extracción de sujetos de ilustraciones y fotografías con desenfoque de movimiento, sombras y reflejos, categorías donde el autor reporta primer puesto.
- **Investigación en matting e imagen:** al ser un modelo generativo destilado a 4 pasos, sirve como referencia para estudiar la adaptación de modelos de difusión a tareas de segmentación densa.

## Benchmarks y rendimiento

La model card presenta una evaluación propia (no un benchmark académico estándar) sobre 234 imágenes deliberadamente difíciles, con ranking 1–6 por imagen (1 = mejor, empates permitidos) y combinación de votación ciega humana y comparación VLM por pares. Los resultados publicados son los siguientes:

| Metrica | Resultado |
|---|---|
| Rango medio global (6 sistemas) | 1,51 |
| Mejor o empatado en | 185 de 234 imágenes (79 %) |
| Victorias frente a Photoroom | 55,1 % |
| Victorias frente a remove.bg (Canva) | 59,4 % |
| Victorias frente a RMBG-2.0 | 60,9 % |
| Victorias frente a Ideogram | 65,6 % |
| Victorias frente a BiRefNet | 75,9 % |
| Categorias duras lideradas | 7 de 12 (top 2 en 10) |
| Imágenes de producto reales (48) | Rango medio 1,15 (Photoroom 1,83; remove.bg 1,94) |
| Latencia | ~6 s por imagen en una sola GPU L40S, 4 pasos |

No se han publicado resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de segmentación de imagen.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita en la información proporcionada. Con 8,1 mil millones de parámetros en `safetensors`, el peso en precisión completa ronda los 16 GB (el repositorio ocupa 16,3 GB), por lo que la inferencia cómoda requiere al menos esa cifra más el overhead del pipeline de difusión.
- **GPU recomendadas:** el autor reporta ~6 s por imagen en una NVIDIA L40S. GPUs de数据中心 como A100 o H100 ofrecerán mayor margen; no se documentan cifras concretas para ellas.
- **GPU de consumo:** no se confirma en la información disponible si cabe en tarjetas de consumo tipo RTX 4090 (24 GB). Por tamaño de pesos, una RTX 4090 podría alojarlos, pero no hay datos publicados de latencia ni de viabilidad del pipeline completo en esa GPU.
- **Opciones de despliegue:** el modelo se distribuye para `diffusers` mediante `BriaFibo2Pipeline`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible (son herramientas orientadas a modelos de lenguaje).
- **Latencia y throughput:** ~6 s por imagen en una L40S con 4 pasos, sin classifier-free guidance. No se publican cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Resultado en la comparativa del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMBG-3.0 | ~8,1 mil millones | Difusión generativa destilada a 4 pasos | Rango medio 1,51; gana 60,9 % de los duelos a RMBG-2.0 | CC BY-NC 4.0 (`bria-fibo`) | Pesos en Hugging Face (no comercial) |
| RMBG-2.0 | No disponible | Segmentación (generación anterior de BRIA) | Pierde el 60,9 % de los duelos frente a RMBG-3.0 | No disponible en esta informacion | Pesos en Hugging Face |
| BiRefNet | No disponible | Segmentación de alta resolución | Pierde el 75,9 % de los duelos frente a RMBG-3.0 | No disponible en esta informacion | Pesos en Hugging Face |
| Photoroom | No disponible (servicio) | Servicio comercial | Rango medio 1,83 en producto; pierde el 55,1 % de los duelos | Propietaria | API/servicio |
| remove.bg (Canva) | No disponible (servicio) | Servicio comercial | Rango medio 1,94 en producto; pierde el 59,4 % de los duelos | Propietaria | API/servicio |

Los datos de rendimiento de esta tabla proceden exclusivamente de la evaluación interna del autor del modelo, no de una comparativa independiente. No se dispone de parámetros ni de contexto de los modelos competidores en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no comercial:** el identificador `bria-fibo` remite a CC BY-NC 4.0. Cualquier uso comercial requiere licencia aparte de BRIA AI. El espejo insiste en ello en su aviso.
- **Espejo no oficial:** `ml-resources/RMBG-3.0` no es un lanzamiento de BRIA AI; los pesos se declaran sin modificar, pero la fuente de referencia es `briaai/RMBG-3.0`.
- **Benchmarks autoinformados:** todas las cifras de rendimiento provienen de la comparativa del propio autor, con metodología propia (votación ciega más VLM), no de un tercero independiente. Deben tomarse como indicativas.
- **Sesgos:** no se documentan en la información disponible análisis de sesgo por demografía, tono de piel, tipo de cuerpo o contexto cultural. Al entrenarse con datos licenciados, la composición del dataset condiciona el comportamiento y no se detalla.
- **Alucinación en el sentido generativo:** al ser un modelo de difusión, existe riesgo de que el matte incluya o excluya regiones de forma plausible pero incorrecta en escenas ambiguas (por ejemplo, objetos semitransparentes o sombras dudosas). No hay tasas de error publicadas por categoría.
- **Idioma:** los metadatos declaran únicamente `en`; el modelo no procesa texto, por lo que la limitación afecta a cualquier metadato o integración textual, no a la tarea de imagen.
- **Latencia:** ~6 s por imagen en una L40S es notablemente más lento que un segmentador discriminativo; para pipelines de alto volumen hay que dimensionar la infraestructura.
- **Cuantizaciones:** no se documentan versiones GGUF, ONNX ni cuantizadas, lo que limita el despliegue en entornos con poca VRAM.
- **Madurez del repositorio:** el espejo registra 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal de validación comunitaria.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/ml-resources/RMBG-3.0
- Repositorio original de BRIA AI: https://huggingface.co/briaai/RMBG-3.0
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-dev
- Demo en fal.ai: https://fal.ai/models/bria/rmbg-3
- Sandbox de la API de BRIA (eliminación de fondo): https://platform.bria.ai/image-editing/remove-background/sandbox
- BRIA Create: https://create.bria.ai/
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Paper referenciado en los metadatos: arXiv:2511.06876
