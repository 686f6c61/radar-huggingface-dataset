# marshdsouza2001/FoodExtract-gemma-3-270m-fine-tune-v1

## Resumen

FoodExtract-gemma-3-270m-fine-tune-v1 es un ajuste fino supervisado (SFT) del modelo base google/gemma-3-270m-it, desarrollado por el usuario marshdsouza2001. Su proposito concreto es la extraccion estructurada de informacion alimentaria a partir de texto libre: clasifica si un texto menciona comida o bebida, lo etiqueta con un conjunto predefinido de categorias (panel nutricional, lista de ingredientes, menu, receta, etc.) y extrae listas de alimentos y bebidas comestibles. El modelo esta pensado para filtrar y anotar grandes corpus de leyendas de imagenes, como DataComp-1B, de forma rapida y barata.

Arquitectonicamente hereda todo del Gemma 3 270M instruct de Google: un transformer decoder-only de 268.098.176 parametros (aproximadamente 270M), el miembro mas pequeno de la familia Gemma 3. El ajuste se realizo con la libreria TRL sobre el dataset FoodExtract-1k, compuesto por 1400 pares de texto crudo y salida estructurada generados por gpt-oss-120b. La salida se condensa en un formato de cuatro lineas clave-valor en lugar de JSON completo, para reducir el numero de tokens generados.

Su relevancia es acotada pero clara: demuestra como un modelo de menos de 300M de parametros, ajustado con un dataset pequeno y sintetico, puede sustituir a un LLM grande en una tarea de extraccion muy especifica con un coste de inferencia minimo. No es un modelo de proposito general, sino un componente de pipeline para curacion de datos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (el formato safetensors permite cuantizacion posterior a GGUF/AWQ, pero no se documenta) |
| Idiomas soportados | no disponible (el modelo base Gemma 3 es multilingue, pero la model card no lo declara) |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4.9 GB |
| Modelo base | google/gemma-3-270m-it |
| Metodo de entrenamiento | SFT con TRL |
| Dataset de entrenamiento | FoodExtract-1k (1400 muestras) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 3 270M instruct, un transformer decoder-only denso de 270M de parametros. No se introducen cambios arquitectonicos: se reutilizan los pesos del modelo base y se aplica un entrenamiento supervisado (SFT) con la libreria TRL, segun indican las etiquetas `generated_from_trainer`, `sft` y `trl`. La model card no detalla hiperparametros, numero de epocas, tasa de aprendizaje ni si se congelaron capas.

Los datos de entrenamiento provienen del dataset FoodExtract-1k, con 1400 muestras de pares texto crudo / salida estructurada generadas por gpt-oss-120b (destilacion de un modelo mayor). La innovacion practica esta en el formato de salida: en lugar de JSON, el modelo genera una representacion condensada de cuatro lineas (`food_or_drink`, `tags`, `foods`, `drinks`), lo que reduce el numero de tokens de salida y simplifica el parseo con funciones auxiliares `condense_output` y `uncondense_output` incluidas en la model card. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion binaria de texto como comida/bebida o no comida/bebida (`food_or_drink: 0/1`).
- Etiquetado multi-etiqueta con un diccionario cerrado de ocho categorias: `np` (nutrition_panel), `il` (ingredient list), `me` (menu), `re` (recipe), `fi` (food_items), `di` (drink_items), `fa` (food_advertisement), `fp` (food_packaging).
- Extraccion de listas de alimentos comestibles en formato separado por comas.
- Extraccion de listas de bebidas comestibles en formato separado por comas.
- Generacion de salida estructurada condensada en cuatro lineas clave-valor, disenada para minimizar tokens.
- Conversacional: hereda el formato de chat del modelo base instruct (tag `conversational`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Curacion de datasets de leyendas de imagenes a gran escala: el modelo permite filtrar DataComp-1B o corpus similares para quedarse solo con las entradas que mencionan comida o bebida, procesando millones de textos con un coste de inferencia muy bajo gracias a sus 270M de parametros.
- Etiquetado de menus y cartas de restaurantes: dado un texto que describa un menu, asigna la etiqueta `me` y extrae los platos y bebidas listados, util para digitalizar catalogos gastronomicos.
- Extraccion de ingredientes de recetas: con la etiqueta `re`, el modelo separa los ingredientes comestibles de un texto de receta, lo que facilita la construccion de bases de datos de ingredientes normalizadas.
- Procesamiento de paneles nutricionales: la etiqueta `np` permite identificar textos que contienen informacion nutricional y extraer los items alimentarios citados, util en aplicaciones de analisis de etiquetado.
- Deteccion de publicidad y packaging alimentario: con las etiquetas `fa` y `fp`, el modelo sirve para clasificar anuncios y envases dentro de pipelines de moderacion o analisis de mercado.
- Enriquecimiento de catalogos de e-commerce de alimentacion: extraer alimentos y bebidas de descripciones de producto para generar metadatos y mejorar la busqueda facetada.
- Preprocesado para sistemas RAG gastronomicos: usar la salida estructurada como metadatos filtrables antes de indexar documentos en un motor de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,1 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en bf16/fp16: alrededor de 0,55 GB para pesos, mas overhead; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; para lotes grandes, A100 o H100 permiten throughput muy alto.
- Cabe en GPU consumer: si, en practicamente todas las GPU con soporte CUDA de los ultimos anos, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); la conversion a GGUF para llama.cpp u Ollama es posible pero no esta documentada en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodExtract-gemma-3-270m-fine-tune-v1 | 268M | no disponible | Extraccion de comida/bebida | Gemma | Hugging Face (92 descargas) |
| google/gemma-3-270m-it | 270M | no disponible | Proposito general instruct | Gemma | Hugging Face (oficial) |
| gpt-oss-120b (generador del dataset) | no disponible | no disponible | Proposito general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: solo realiza extraccion de comida y bebida; no es adecuado para tareas generales de generacion, razonamiento o codigo.
- Entrenado con solo 1400 muestras sinteticas generadas por gpt-oss-120b, lo que puede introducir sesgos y errores del modelo profesor, especialmente en alimentos poco comunes o en textos ambiguos.
- Riesgo de alucinacion en la extraccion: puede inventar alimentos o bebidas no presentes en el texto, o pasar por alto items implicitos.
- El diccionario de etiquetas es cerrado (ocho categorias); textos que no encajen en ninguna pueden recibir etiquetas incorrectas.
- No se documentan los idiomas soportados; aunque el modelo base es multilingue, el ajuste se realizo presumiblemente sobre textos en ingles y el rendimiento en castellano no esta verificado.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos de Google Gemma antes de desplegarlo en produccion.
- El formato de salida condensado requiere usar las funciones auxiliares de parseo; una generacion mal formada puede romper el pipeline si no se valida.
- No se han publicado benchmarks ni evaluaciones formales de calidad de extraccion.
- El repositorio tiene 4.9 GB pese a los 268M de parametros, lo que sugiere que puede contener checkpoints adicionales o artefactos de entrenamiento; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marshdsouza2001/FoodExtract-gemma-3-270m-fine-tune-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mrdbourke/FoodExtract-1k
- Dataset de referencia para filtrado: https://huggingface.co/datasets/UCSC-VLAA/Recap-DataComp-1B
- Paper referenciado en las etiquetas: arxiv:2506.14111
