# 425GMM/llama-3.2-3b-qlora-aslg-gloss

## Resumen

El modelo `425GMM/llama-3.2-3b-qlora-aslg-gloss` es un adaptador LoRA entrenado con QLoRA sobre `unsloth/Llama-3.2-3B-Instruct` (espejo sin restricciones de `meta-llama/Llama-3.2-3B-Instruct`). Lo desarrolla el autor 425GMM como parte de un proyecto de investigación sobre traducción de inglés a glosas de American Sign Language (ASL), con el objetivo de comparar decodificación restringida mediante gramáticas (xgrammar) frente a decodificación sin restricciones. El problema que resuelve es la generación automática de secuencias de glosas ASL a partir de oraciones en inglés, un paso intermedio en sistemas de accesibilidad para personas sordas.

La arquitectura base es un transformer decoder-only de 3.000 millones de parámetros. El adaptador LoRA (r=16, alpha=32) se aplica a todas las proyecciones de atención y MLP, y se entrenó durante una época con 20.000 pares del corpus ASLG-PC12. En el test de 1.000 frases, la decodificación sin restricciones alcanza un BLEU de 98,1 y una coincidencia exacta del 92,0%, con un 89,8% de validez de secuencia; la decodificación restringida garantiza un 100% de validez. El adaptador pesa 0,1 GB y requiere descargar los pesos base del Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B-Instruct) con adaptador LoRA |
| Parametros totales | 3.000 millones (modelo base); el adaptador LoRA no especifica su número de parámetros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (ventana del modelo base; no indicada en la ficha del adaptador) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (QLoRA) |
| Idiomas soportados | Inglés (entrada); glosas ASL (salida) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | Safetensors (adaptador LoRA); pesos base descargados del Hub |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Llama-3.2-3B-Instruct, un transformer autoregresivo decoder-only. La adaptación se realizó mediante QLoRA: el modelo base se cargó en 4-bit NF4 con doble cuantización, y se añadieron LoRAs con r=16, alpha=32 y dropout 0.05 en las proyecciones q/k/v/o y gate/up/down del MLP. Se entrenó una sola época con los primeros 20.000 pares del split de entrenamiento de ASLG-PC12 (redistribución de Kaggle, 87.710 pares deduplicados y re-split 80/10/10 con semilla 42). El entrenamiento usó formato chat, pérdida solo en los tokens de glosa, tamaño de lote efectivo 16 (2 x 8 acumulación), tasa de aprendizaje 2e-4, longitud máxima 384 tokens y 1.250 pasos. No se indica que se aplicara RLHF ni DPO; el ajuste es puramente supervisado sobre pares paralelos.

La innovación destacable no es arquitectónica, sino metodológica: el proyecto evalúa la decodificación restringida con gramáticas (xgrammar) frente a la no restringida. Los resultados muestran que añadir una regla de copia a la gramática produce salidas estadísticamente indistinguibles de la decodificación no restringida en BLEU y coincidencia exacta, pero con un 100% de validez de vocabulario.

## Capacidades

- Traducción de oraciones en inglés (normalmente en minúsculas) a secuencias de glosas ASL en mayúsculas, siguiendo las convenciones del corpus ASLG-PC12 (pronombres con prefijo `X-`, modificadores con `DESC-`).
- Generación de texto en formato chat: acepta un prompt de sistema y un mensaje de usuario con la oración a traducir.
- Alta exactitud en el corpus de entrenamiento: 92,0% de coincidencia exacta y BLEU 98,1 en decodificación sin restricciones.
- Compatibilidad con decodificación restringida mediante gramáticas (xgrammar), que garantiza que todos los tokens de salida pertenecen al vocabulario cerrado de glosas.
- No se han documentado capacidades de tool calling, function calling, razonamiento multi-paso ni visión en la información proporcionada.
- Soporte únicamente de inglés como idioma de entrada; la salida es un vocabulario cerrado de glosas ASL, no inglés.

## Casos de uso

- Investigación en PNL de lenguas de signos: el modelo sirve como sistema de referencia para evaluar técnicas de decodificación restringida en la generación de glosas. Los resultados del proyecto permiten comparar métricas como BLEU, chrF y validez de secuencia.
- Prototipos de subtitulado para personas sordas: el adaptador puede integrarse en un pipeline que recibe subtítulos en inglés y produce glosas ASL, que luego se renderizan con un avatar 3D o se muestran en texto. Su alta coincidencia exacta en el corpus lo hace adecuado para oraciones similares a las del dominio Europarl.
- Generación de datos de entrenamiento sintéticos: el modelo puede usarse para ampliar corpus de glosas ASL a partir de texto en inglés, aunque debe tenerse en cuenta que las glosas son generadas por reglas, no por signantes humanos.
- Evaluación de eficiencia de QLoRA: el entrenamiento en 20.000 pares durante una época en una GPU de 10 GB muestra que es posible obtener un rendimiento alto con recursos limitados, útil para estudios de fine-tuning eficiente.
- Herramientas de traducción asistida con vocabulario cerrado: gracias a la decodificación restringida, el modelo puede integrarse en sistemas donde se requiere que la salida sea 100% válida en el vocabulario de glosas, por ejemplo, en aplicaciones de accesibilidad.
- Benchmarking de adaptadores LoRA: el adaptador de 0,1 GB sobre un modelo de 3B permite estudiar el equilibrio entre tamaño y rendimiento en tareas de traducción especializada.

## Benchmarks y rendimiento

Resultados reportados en la model card para un test de 1.000 frases con decodificación greedy:

| Condicion | BLEU | chrF | Coincidencia exacta | Validez de secuencia |
|---|---|---|---|---|
| Sin restricciones | 98,1 | 99,3 | 92,0% | 89,8% |
| Restringida (gramatica v3) | 96,7 | 98,6 | 87,9% | 100% |
| Restringida + regla de copia (v3) | 98,0 | 99,3 | 92,2% | 100% |

Nota: la validez de secuencia es la proporción de salidas cuyos tokens pertenecen al vocabulario cerrado de glosas. La condición "restringida + copia" es estadísticamente indistinguible de la no restringida en BLEU y coincidencia exacta (bootstrap pareado), garantizando salida válida. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento se realizó en una GPU de 10 GB durante ~90 minutos. Para inferencia con el modelo base en 4-bit NF4, se estima entre 3 y 5 GB de VRAM, incluyendo el adaptador y las activaciones para secuencias cortas (hasta 384 tokens).
- GPU recomendadas: RTX 3060/4060 (8-12 GB), T4 (16 GB) o superiores. Cualquier GPU con al menos 8 GB es suficiente para cargar el modelo en 4-bit con el adaptador.
- Opciones de despliegue: el código proporcionado usa Transformers + PEFT con BitsAndBytes y `AutoPeftModelForCausalLM`. No se documentan destinos alternativos como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El modelo base Llama-3.2-3B-Instruct sin adaptador no es una alternativa para la tarea de traducción a glosas ASL. El proyecto menciona un modelo BART entrenado en el split completo, pero no se ofrecen sus resultados en la ficha.

## Limitaciones y advertencias

- Las glosas de ASLG-PC12 están generadas por reglas a partir de texto de Europarl, no producidas por signantes. Por tanto, el modelo aprende las reglas del corpus, no una traducción real al ASL. Los resultados no se transfieren a corpus de glosas anotados por humanos.
- El adaptador se entrenó solo con los primeros 20.000 pares del split de entrenamiento (de 64.872) por limitación de cómputo; el split completo no se utilizó. Esto puede limitar el rendimiento en oraciones fuera de ese subconjunto.
- La decodificación sin restricciones produce un 10,2% de salidas con tokens fuera del vocabulario de glosas. Para aplicaciones que requieran validez garantizada, es necesario usar decodificación restringida.
- El modelo depende del prompt de sistema específico del proyecto; usar otro prompt puede degradar el rendimiento.
- La licencia Llama 3.2 Community License impone condiciones de uso comercial; además, los pesos base deben descargarse desde el Hub con acceso autorizado.
- El modelo solo soporta inglés como entrada y glosas ASL como salida. No es multilingüe ni de propósito general.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/425GMM/llama-3.2-3b-qlora-aslg-gloss
- Repositorio del proyecto (código, gramáticas, prompt de sistema y scripts de evaluación): https://github.com/TheRealGioviok/asl-gloss-nlp
- Dataset ASLG-PC12 en HuggingFace: https://huggingface.co/datasets/achrafothman/aslg_pc12
- Redistribución del dataset en Kaggle: https://www.kaggle.com/datasets/thedevastator/unlock-the-power-of-english-asl-with-aslg-pc12-c
- Modelo base en HuggingFace (espejo sin restricciones): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Modelo base oficial de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
