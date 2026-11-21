# bhai2000/gemma-3-270m-it-food-extract

## Resumen

`bhai2000/gemma-3-270m-it-food-extract` es un ajuste fino (fine-tuning) del modelo `google/gemma-3-270m-it` de Google, especializado en la extraccion de datos estructurados a partir de texto relacionado con alimentos. Lo desarrolla el usuario `bhai2000` y se entrena sobre el dataset `mrdbourke/FoodExtract-1k` mediante SFT (supervised fine-tuning) con la libreria TRL. Su proposito es convertir descripciones culinarias o de productos alimenticios en campos estructurados, una tarea de extraccion de informacion mas que de generacion abierta.

El modelo conserva la arquitectura `gemma3_text` del modelo base, con 268.098.176 parametros totales (aproximadamente 270 millones, como indica el nombre). Se distribuye en formato safetensors a traves de la libreria Transformers y esta etiquetado como compatible con text-generation-inference y endpoints. El repositorio ocupa 1,1 GB.

Es relevante por su tamano reducido, que permite desplegarlo en hardware modesto, y por su enfoque especializado: en lugar de competir en capacidades generales, resuelve un problema concreto de extraccion de campos alimenticios. No obstante, la informacion publicada es escasa: no se detallan resultados de benchmarks, licencia explicita ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer decoder-only, segun el modelo base) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer decoder-only de la familia Gemma 3 en su variante de 270 millones de parametros. El ajuste fino se realiza mediante SFT con TRL 1.18.2, sobre el dataset `mrdbourke/FoodExtract-1k`, orientado a la extraccion de datos estructurados de alimentos. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO.

Las versiones de framework empleadas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. El modelo esta etiquetado como `generated_from_trainer`, lo que indica que se genero con el flujo estandar de entrenamiento de Hugging Face. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) mas alla de las propias del modelo base.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct.
- Extraccion de datos estructurados de contenido alimenticio (tarea principal del ajuste fino).
- Soporte de formato conversacional (chat template con roles `user`/`assistant`).
- Compatibilidad con `pipeline("text-generation")` de Transformers.
- Compatibilidad declarada con text-generation-inference y endpoints.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo base es de texto.

## Casos de uso

- Extraccion de campos de recetas: dado un texto libre de una receta, el modelo puede devolver ingredientes, cantidades y pasos en un formato estructurado, aprovechando su ajuste sobre `FoodExtract-1k`.
- Normalizacion de catalogos de productos alimenticios: convertir descripciones heterogeneas de productos en campos consistentes (nombre, categoria, ingredientes) para poblar bases de datos.
- Procesamiento de resenas o menus de restaurantes: extraer platos, precios o ingredientes mencionados en texto no estructurado para analitica.
- Enriquecimiento de datasets de nutricion: transformar descripciones textuales en registros estructurados que alimenten pipelines de datos.
- Prototipado rapido en local: por su tamano de 270 millones de parametros, permite iterar en una sola GPU de consumo sin infraestructura dedicada.
- Tareas de extraccion en lote: al ser un modelo pequeno, puede procesar grandes volumenes de texto con coste computacional bajo en comparacion con modelos de mayor tamano.
- Integracion en pipelines de Transformers: al ser compatible con `pipeline` y TGI, puede desplegarse detras de un endpoint para servir extracciones bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 268 millones de parametros en precision completa (fp32) ocuparia aproximadamente 1,1 GB de pesos, y menos en fp16/bf16 o cuantizaciones de 8/4 bits (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: Transformers (`pipeline`), text-generation-inference (declarado compatible), endpoints de Hugging Face. Compatibilidad con llama.cpp, Ollama o vLLM no disponible en la informacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bhai2000/gemma-3-270m-it-food-extract | 268.098.176 | no disponible | no disponible | Ajuste fino especializado en extraccion de alimentos |
| google/gemma-3-270m-it | no disponible en la informacion | no disponible | no disponible | Modelo base instruct del que deriva |
| Alternativas especializadas en extraccion | no disponible | no disponible | no disponible | No se dispone de datos comparables |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no especifica la licencia de forma explicita, lo que genera incertidumbre sobre el uso comercial; conviene verificar la licencia del modelo base `google/gemma-3-270m-it` antes de desplegarlo.
- No se documentan los idiomas soportados; el ajuste se realizo sobre `FoodExtract-1k`, cuyo idioma y composicion no se detallan.
- Al ser un modelo de 270 millones de parametros, su capacidad de razonamiento general y de generacion abierta es limitada en comparacion con modelos mayores.
- Riesgo de alucinacion en campos estructurados: puede inventar ingredientes, cantidades o categorias no presentes en el texto de entrada.
- No se han publicado evaluaciones de sesgos ni de robustez.
- No se detalla el contexto maximo soportado, lo que limita la planificacion de entradas largas.
- El ajuste fino sobre un dataset pequeno (1k ejemplos) puede provocar sobreajuste al dominio y perdida de capacidades generales del modelo base.
- No se dispone de informacion sobre cuantizaciones validadas ni sobre rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhai2000/gemma-3-270m-it-food-extract
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mrdbourke/FoodExtract-1k
- Libreria TRL: https://github.com/huggingface/trl
