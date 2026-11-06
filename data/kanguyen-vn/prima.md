# kanguyen-vn/PRIMA

## Resumen

PRIMA es un modelo vision-lenguaje especializado en razonamiento sobre multiples imagenes con fundamentacion a nivel de pixel (pixel grounding). Lo desarrolla el autor kanguyen-vn (Plan Lab) y se presenta como un fine-tuning del checkpoint MBZUAI/GLaMM-FullScope, que a su vez parte de un decoder Vicuna-7B. El modelo responde preguntas que implican comparar objetos y partes entre varias imagenes y devuelve, ademas de la respuesta en lenguaje natural, mascaras de segmentacion agrupadas por imagen de origen.

El problema que resuelve es el razonamiento relacional multi-imagen: comparaciones funcionales, espaciales, numericas y de final abierto entre objetos de distintas imagenes, con la explicacion anclada a regiones concretas. Frente a modelos de segmentacion guiada por texto de una sola imagen, PRIMA incorpora mecanismos explicitos de consulta relacional (SQuARE) que permiten intercambiar informacion entre las representaciones visuales de varias imagenes antes de generar la respuesta y las mascaras.

Arquitectonicamente combina un encoder visual EVA-CLIP-G con un Q-Former guiado por instruccion, un modulo de atencion relacional entre imagenes (SQuARE), un decoder de lenguaje basado en Vicuna-7B y un decoder de grounding SAM ViT-H con proyeccion texto-a-mascara. El checkpoint publicado es un unico paquete BF16 en safetensors de aproximadamente 8.570 millones de parametros (17,2 GB en el repositorio) que incluye todos los componentes, sin necesidad de descargar adaptadores LoRA ni checkpoints visuales por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje multimodal: encoder EVA-CLIP-G + Q-Former guiado por instruccion + atencion relacional SQuARE + decoder de lenguaje Vicuna-7B + decoder de grounding SAM ViT-H |
| Parametros totales | 8.576.086.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | mit-with-upstream-component-terms (MIT con terminos de componentes upstream; ver LICENSE.md) |
| Formato de pesos | safetensors (checkpoint completo BF16 en shards, con actualizaciones LoRA fusionadas en los pesos del modelo de lenguaje) |

## Arquitectura y entrenamiento

PRIMA es un modelo multimodal de tipo vision-lenguaje con un diseno en cadena. La entrada visual pasa por un encoder EVA-CLIP-G y un Q-Former condicionado por la instruccion, que comprime las caracteristicas visuales en tokens consultables. Sobre esas representaciones actua SQuARE, un mecanismo de consultas relacionales y atencion cruzada entre imagenes que permite al modelo comparar objetos y partes de distintas fuentes. El decoder de lenguaje, derivado de Vicuna-7B e inicializado desde MBZUAI/GLaMM-FullScope (revision 95a4ab0c9ab7e8e583df3e8adc93b5c89586612e), genera la respuesta textual; un decoder de grounding basado en SAM ViT-H con una proyeccion texto-a-mascara produce las mascaras correspondientes a las entidades mencionadas.

El entrenamiento se realizo sobre el dataset M4Seg (kanguyen-vn/M4Seg), orientado a segmentacion y razonamiento multi-imagen. El checkpoint publicado incorpora actualizaciones LoRA ya fusionadas en los pesos del modelo de lenguaje, de modo que el artefacto es autocontenido: incluye el modelo de lenguaje, el encoder visual, el Q-Former, SQuARE y el decoder de grounding, ademas del tokenizer del modelo de lenguaje y el tokenizer del Q-Former (BertTokenizer). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por multiples imagenes, con razonamiento funcional, espacial, numerico y de final abierto sobre objetos y partes.
- Segmentacion fundamentada (pixel grounding): devuelve mascaras booleanas por imagen de origen, con la forma [numero de mascaras, alto, ancho] de la imagen original.
- Razonamiento relacional entre imagenes mediante SQuARE: identificar objetos compartidos, comparar atributos y relacionar partes entre fuentes distintas.
- Respuestas con explicacion en lenguaje natural acompanadas de las regiones que las sustentan.
- Interfaz de inferencia mediante el metodo `predict(images, question, tokenizer, qformer_tokenizer, max_new_tokens)`, que devuelve un diccionario con `response` y `masks`.
- Soporte de multiples imagenes de entrada en un mismo grupo ordenado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, modo thinking, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Comparacion de productos en catalogos visuales: dado un grupo de imagenes de un mismo articulo en distintos angulos o variantes, PRIMA puede responder que componentes comparten y segmentar cada uno en su imagen, util para control de calidad y fichas de producto.
- Analisis de imagenes medicas o cientificas por series: comparar cortes o placas sucesivas para localizar estructuras comunes y devolver mascaras por imagen, apoyando la revision asistida por un especialista.
- Verificacion de cambios entre imagenes temporales: en inspeccion de obra, agricultura o satelite, el modelo compara pares o series de imagenes y segmenta las regiones que aparecen, desaparecen o se modifican.
- Anotacion asistida de datasets de segmentacion: generar mascaras y descripciones para pares de imagenes y usarlas como preanotacion en pipelines de etiquetado, reduciendo el coste manual.
- Razonamiento visual en robotica o navegacion: comparar la vista actual con una referencia para identificar objetos coincidentes y sus regiones, con salida estructurada en forma de mascaras.
- Educacion y divulgacion: responder preguntas que exigen comparar varias figuras o fotografias y senalar en cada una las partes relevantes de la explicacion.
- Busqueda visual relacional: localizar en un conjunto de imagenes los objetos que cumplen una relacion descrita en lenguaje natural con un objeto de referencia de otra imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el paper arXiv:2412.15209 y el codigo de evaluacion incluido en el repositorio (code/evaluate.py, code/eval/m4seg.py), con metrica semantica basada en sentence-transformers/all-MiniLM-L6-v2 y METEOR con tokenizacion PTB sobre COCO, pero no se proporcionan cifras numericas en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint publicado es BF16 y pesa aproximadamente 17,2 GB, por lo que se necesita una GPU con al menos unos 20 GB de VRAM para cargarlo completo en BF16. No se documentan variantes cuantizadas que reduzcan este requisito.
- GPU recomendadas: el autor valida la inferencia en una unica GPU CUDA con BF16; por capacidad de memoria encajan A100 (40/80 GB), H100, L40S y RTX A6000. En GPUs de consumo de 24 GB (RTX 3090, RTX 4090) el margen es muy ajustado y no esta validado en la informacion disponible.
- Cabe en GPU de consumo: no confirmado; el peso en BF16 (17,2 GB) deja poco espacio para activaciones y el decoder SAM ViT-H, y no se ofrecen pesos GGUF ni cuantizaciones alternativas.
- Opciones de despliegue: carga mediante transformers con `trust_remote_code=True` y el metodo `predict` incluido en el codigo custom del checkpoint. El autor indica explicitamente que los pipelines genericos de text-generation o image-segmentation no preparan las entradas multi-imagen de PRIMA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno validado: Python 3.10, PyTorch 1.13.1 con CUDA 11.7 y Transformers 4.42.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRIMA | 8,57 B | no disponible | Razonamiento multi-imagen con pixel grounding (EVA-CLIP-G + Q-Former + SQuARE + Vicuna-7B + SAM ViT-H) | MIT con terminos de componentes upstream | Hugging Face, codigo de evaluacion incluido |
| GLaMM-FullScope (MBZUAI) | no disponible en la informacion | no disponible | Grounding conversacional de una sola imagen (base de PRIMA) | no disponible en la informacion | Hugging Face |
| LISA | no disponible en la informacion | no disponible | Segmentacion guiada por lenguaje sobre una imagen | no disponible en la informacion | Hugging Face |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; PRIMA se distingue de sus predecesores por incorporar razonamiento explicito entre multiples imagenes y un modulo relacional (SQuARE) ausente en los modelos de grounding de imagen unica.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera degradado.
- Riesgo de alucinacion: al ser un modelo generativo de lenguaje, puede describir objetos o relaciones inexistentes; las mascaras asociadas deben validarse antes de usarse en produccion.
- Requiere `trust_remote_code=True` y ejecuta codigo custom incluido en el checkpoint, lo que implica revisar y auditar ese codigo antes de desplegarlo en entornos de produccion.
- La licencia es MIT con terminos adicionales de componentes upstream (mit-with-upstream-component-terms); es necesario revisar LICENSE.md para confirmar las condiciones de uso comercial de cada componente (Vicuna, EVA-CLIP, SAM, GLaMM).
- El checkpoint hereda la adaptacion previa de GLaMM-FullScope en los pesos del modelo de lenguaje, lo que puede arrastrar sesgos de ese modelo base.
- No se documentan sesgos especificos, numero de tokens de entrenamiento ni composicion detallada del dataset M4Seg, lo que dificulta evaluar la cobertura y los sesgos de dominio.
- La longitud de contexto no esta publicada; las entradas con muchas imagenes o preguntas largas pueden exceder la ventana efectiva del modelo.
- El uso esta orientado a investigacion; no se documenta un camino de despliegue de alta concurrencia (vLLM, TGI) ni cuantizaciones para servir el modelo en hardware limitado.
- El entorno validado fija versiones antiguas (PyTorch 1.13.1, Transformers 4.42.3), lo que puede generar incompatibilidades con stacks mas recientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanguyen-vn/PRIMA
- Codigo y evaluador: https://huggingface.co/kanguyen-vn/PRIMA/tree/main/code
- Paper: https://arxiv.org/abs/2412.15209
- Pagina del proyecto: https://plan-lab.github.io/projects/prima/
- Dataset M4Seg: https://huggingface.co/datasets/kanguyen-vn/M4Seg
- Guia de preparacion del dataset: https://huggingface.co/datasets/kanguyen-vn/M4Seg/blob/main/PREPARATION.md
- Modelo base GLaMM-FullScope: https://huggingface.co/MBZUAI/GLaMM-FullScope
- Encoder de metrica semantica: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
