# AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42-r4

## Resumen

`AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42-r4` es un checkpoint derivado de Llama 3.2 3B, publicado por el usuario AlinaGonch en Hugging Face. Por la nomenclatura del repositorio, se trata de un ajuste fino supervisado sobre el conjunto de datos SQuAD 2.0 con una proporcion de ejemplos sin respuesta de 0.10, semilla 42 y rango 4 (probablemente LoRA con r=4). Forma parte de la coleccion publica "SQuAD dataset ratio experiment llama3.2-llama3.1", cuyo objetivo declarado es encontrar la proporcion optima de muestras no respondibles en el conjunto de entrenamiento. El repositorio no incluye model card util: la tarjeta es la plantilla autogenerada de Hugging Face, con todos los campos marcados como "[More Information Needed]".

El modelo base, Llama 3.2 3B, es un transformer autoregresivo denso de aproximadamente 3.2 mil millones de parametros desarrollado por Meta, con atencion de consultas agrupadas (GQA), embeddings compartidos y una ventana de contexto nominal de 128 000 tokens. El ajuste que nos ocupa no modifica esa arquitectura, sino que especializa el comportamiento del modelo hacia pregunta-respuesta extractiva con deteccion de preguntas sin respuesta, un caso de uso tipico en pipelines de recuperacion aumentada (RAG) donde evitar alucinaciones es critico.

La relevancia de este checkpoint es mas experimental que productiva: sirve como punto de datos dentro de un barrido de hiperparametros sobre el ratio de ejemplos no respondibles, una variable que afecta directamente a la tasa de falsos positivos en sistemas de QA documental. No hay metricas publicadas, ni licencia declarada, ni confirmacion de que los pesos esten efectivamente subidos al repositorio (el tamano reportado es de 0.0 GB). Cualquier evaluacion seria requiere descargar el repositorio y verificar su contenido antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo denso (heredada de Llama 3.2 3B: GQA, RoPE, embeddings compartidos); no confirmado en la model card |
| Parametros totales | 3.21 mil millones en el modelo base; no confirmado para este checkpoint. El sufijo "r4" sugiere un adaptador LoRA de rango 4, en cuyo caso los pesos entrenables serian de decenas de MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base segun la documentacion de Meta; no disponible para este ajuste. Los ejemplos de SQuAD 2.0 usan contexto de 384 tokens |
| Tipos de cuantizacion | No disponible. El modelo base admite las cuantizaciones habituales (GGUF Q4_K_M, Q5_K_M, Q8_0, AWQ, GPTQ, bitsandbytes NF4) si los pesos estan en safetensors |
| Idiomas soportados | No disponible para este checkpoint. El modelo base declara 8 idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes); el ajuste con SQuAD 2.0 es unicamente en ingles |
| Licencia | No disponible. El modelo base se distribuye bajo la Llama 3.2 Community License |
| Formato de pesos | safetensors (segun las etiquetas del repositorio). Tamano del repositorio reportado: 0.0 GB, lo que no permite confirmar que los pesos esten subidos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder-only denso con normalizacion RMSNorm pre-normativa, activacion SwiGLU en las capas MLP, codificacion posicional rotatoria (RoPE) y atencion de consultas agrupadas con 24 cabezas de consulta y 8 cabezas de clave/valor. El vocabulario es de 128 256 tokens, con embeddings de entrada y salida compartidos. El modelo base fue entrenado por Meta con un corte de conocimiento declarado en diciembre de 2023 y posteriormente alineado mediante ajuste supervisado y optimizacion por preferencias humanas.

Sobre el proceso de entrenamiento de este checkpoint concreto no hay informacion en el repositorio: la seccion "Training Details" de la model card esta vacia. Por el nombre del repositorio y por la coleccion a la que pertenece, se puede inferir que se aplico un ajuste fino sobre SQuAD 2.0 con un 10 por ciento de ejemplos sin respuesta (ratio 0.10), semilla 42 y rango de adaptador 4. El enfasis en el ratio de ejemplos no respondibles responde a un problema conocido en QA extractiva: un modelo entrenado solo con ejemplos respondibles tiende a producir respuestas espurias ante preguntas cuya respuesta no esta en el contexto, mientras que un exceso de ejemplos negativos degrada la capacidad de extraer respuestas validas. No se especifican hiperparametros, numero de epocas, regimen de precision ni estrategia de enmascarado de perdida.

## Capacidades

- Generacion de texto y comprension lectora en ingles, heredadas del modelo base Llama 3.2 3B.
- Pregunta-respuesta extractiva sobre un contexto dado, con salida de la respuesta literal o de un marcador de no respondible, segun el formato de SQuAD 2.0.
- Deteccion de preguntas sin respuesta en el contexto suministrado, que es precisamente la habilidad que el barrido de ratios pretende optimizar.
- Razonamiento basico multi-paso y aritmetica simple, en el nivel esperable de un modelo de 3B.
- Generacion de codigo de complejidad baja a media, capacidad heredada del modelo base, no reforzada por este ajuste.
- Soporte multilingue limitado al que ofrece el modelo base (8 idiomas declarados), probablemente degradado fuera del ingles por el ajuste con SQuAD 2.0.
- Tool calling y function calling: no confirmado para este checkpoint. El modelo base Llama 3.2 3B dispone de plantillas de tool calling, pero el ajuste supervisado sobre SQuAD puede haber alterado el formato de chat.
- Modo de razonamiento explicito (thinking mode), vision y audio: no disponibles.
- Capacidades de agente multi-paso: no confirmadas y poco probables sin ajuste adicional.

## Casos de uso

- Extraccion de respuestas en pipelines RAG: dado un fragmento recuperado de una base documental y una pregunta del usuario, el modelo devuelve la respuesta literal o indica que no esta presente. Es el caso de uso para el que fue ajustado explicitamente.
- Filtrado de alucinaciones en asistentes documentales: la proporcion de ejemplos negativos controlada en el entrenamiento apunta a reducir falsos positivos cuando el contexto no contiene la respuesta, lo que permite descartar respuestas antes de mostrarlas al usuario.
- Anotacion asistida de conjuntos de datos de QA: el modelo puede preanotar pares pregunta-respuesta sobre corpus nuevos, que despues se revisan manualmente, reduciendo el coste de anotacion.
- Validacion de consistencia en bases de conocimiento: comprobar si una afirmacion esta respaldada por un documento concreto, devolviendo el fragmento de evidencia o una marca de no respaldo.
- Busqueda semantica con verificacion: combinado con un recuperador denso, el modelo actua como reranker extractivo que confirma si el pasaje recuperado responde realmente a la consulta.
- Prototipado de investigacion sobre calibracion de modelos: al formar parte de una coleccion con distintos ratios y semillas, sirve como punto de comparacion en estudios sobre abstencion y deteccion de preguntas sin respuesta.
- Despliegue en entornos con recursos limitados: con 3.2 mil millones de parametros, puede ejecutarse en una GPU de consumo o incluso en CPU con cuantizacion de 4 bits, lo que permite prototipos locales sin infraestructura dedicada.
- Evaluacion comparativa de estrategias de ajuste (LoRA frente a ajuste completo, distintos ratios de datos negativos) en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio deja todas las secciones de evaluacion como "[More Information Needed]" y no se han encontrado metricas (EM, F1 sobre SQuAD 2.0, MMLU u otras) en la busqueda web realizada. La coleccion a la que pertenece el modelo menciona un experimento sobre el ratio optimo de muestras no respondibles, pero no publica los resultados numericos.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas para un modelo denso de 3.2 mil millones de parametros; no han sido medidas sobre este checkpoint concreto.

- VRAM en precision bf16/fp16: aproximadamente 6.5 GB solo para pesos, mas cache KV y activaciones. Con contexto largo, entre 8 y 12 GB.
- VRAM con cuantizacion de 8 bits: del orden de 3.5 a 5 GB.
- VRAM con cuantizacion de 4 bits (Q4_K_M o NF4): del orden de 2 a 4 GB segun la longitud de contexto.
- GPUs recomendadas para servicio: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 para lotes pequenos. Para desarrollo, cualquier GPU con 8 GB o mas.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090. El modelo cabe con holgura en 8 GB con cuantizacion de 4 bits.
- Apple Silicon: ejecutable en chips M1/M2/M3 con 16 GB de memoria unificada o mas mediante llama.cpp o MLX.
- Opciones de despliegue: transformers con PyTorch, vLLM, Text Generation Inference, llama.cpp, Ollama, LM Studio y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` del repositorio apunta en esa direccion). Si el repositorio contiene unicamente un adaptador LoRA, sera necesario fusionarlo con el modelo base o cargarlo con PEFT.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de este tamano en una RTX 4090 con vLLM en bf16, cabe esperar del orden de 100 a 150 tokens por segundo en generacion individual y varios miles de tokens por segundo con lotes grandes, pero estas cifras no se han verificado sobre este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42-r4 | 3.21 B (base), adaptador de rango 4 segun nomenclatura | 128 K en el modelo base; no confirmado | Ajuste especifico para QA extractiva sobre SQuAD 2.0 | No disponible | Repositorio de 0.0 GB; contenido no verificable |
| meta-llama/Llama-3.2-3B-Instruct | 3.21 B | 128 K | Modelo generalista alineado para instrucciones | Llama 3.2 Community License | Ampliamente disponible en Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3.09 B | 32 K nativo, ampliable con YaRN | Modelo generalista alineado para instrucciones | Apache 2.0 | Ampliamente disponible en Hugging Face |
| microsoft/Phi-3.5-mini-instruct | 3.8 B | 128 K | Modelo generalista alineado para instrucciones | MIT | Ampliamente disponible en Hugging Face |

Los datos de los tres modelos de comparacion provienen de la documentacion publica de sus respectivos desarrolladores y no de la informacion proporcionada en esta busqueda; conviene verificarlos en sus fichas oficiales. No hay metricas de rendimiento comparables para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de Hugging Face y no aporta informacion sustantiva sobre datos, entrenamiento, evaluacion o uso previsto.
- El repositorio reporta un tamano de 0.0 GB. No es posible confirmar desde la informacion disponible que los pesos o el adaptador esten efectivamente subidos ni que el checkpoint sea cargable.
- No se declara licencia. Aunque el modelo base esta sujeto a la Llama 3.2 Community License, la ausencia de licencia explicita en este repositorio impide determinar las condiciones de uso comercial del ajuste.
- Un ajuste supervisado sobre SQuAD 2.0 puede degradar el formato de chat, la capacidad de seguir instrucciones generales y el soporte multilingue del modelo base, especialmente con rangos LoRA bajos.
- El conjunto SQuAD 2.0 esta compuesto exclusivamente por texto en ingles de Wikipedia. El modelo no debe esperarse competente en otros idiomas ni en dominios muy alejados del estilo enciclopedico.
- El ajuste con ejemplos no respondibles incrementa la tasa de abstencion, lo que puede traducirse en respuestas de "no contestable" ante preguntas que si tienen respuesta si el umbral no se calibra.
- Riesgo de alucinacion inherente a un modelo de 3.2 mil millones de parametros, especialmente cuando se le pide generar texto libre en lugar de extraer fragmentos.
- Sesgos heredados del corpus de Wikipedia y del preentrenamiento del modelo base, no evaluados en este checkpoint.
- No se han publicado evaluaciones de sesgo, toxicidad, robustez ni seguridad.
- Uso en produccion desaconsejado sin una evaluacion previa sobre el dominio objetivo y sin verificar la integridad del repositorio.
- El identificador de arXiv presente en las etiquetas (1910.09700) corresponde al articulo del calculador de impacto medioambiental de Lacoste et al., que aparece por defecto en la plantilla de model card. No es una referencia al modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42-r4
- Coleccion del experimento sobre ratios de SQuAD 2.0: https://huggingface.co/collections/AlinaGonch/squad-dataset-ratio-experiment-llama32-llama31
- Variante con ratio 1.00 y semilla 42: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-1.00-seed-42
- Variante con ratio 0.50 y semilla 44: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.50-seed-44
- Documentacion de Meta sobre Llama 3.2 (model cards y formatos de prompt): https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama3_2
- Repositorio oficial de modelos Llama de Meta: https://github.com/meta-llama/llama-models
- Articulo citado en las etiquetas del repositorio (calculador de impacto medioambiental): https://arxiv.org/abs/1910.09700
