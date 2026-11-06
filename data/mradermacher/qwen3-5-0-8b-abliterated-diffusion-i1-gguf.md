# mradermacher/Qwen3.5-0.8B-abliterated-diffusion-i1-GGUF

## Resumen

`mradermacher/Qwen3.5-0.8B-abliterated-diffusion-i1-GGUF` es una cuantizacion en formato GGUF, generada con imatrix, del modelo `OpceanAI/Qwen3.5-0.8B-abliterated-diffusion`. El autor de la cuantizacion es mradermacher (nethype GmbH), mientras que el modelo base procede de OpceanAI. Se trata de un modelo experimental de tipo diffusion-LM enmascarado (masked diffusion), etiquetado con los tags `llada`, `dqwen` y `qwen3_5`, y derivado a su vez de la familia Qwen3.5 en su variante de 0,8B tras un proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones).

El interes de esta publicacion es doble. Por un lado, explora un paradigma de generacion distinto del autorregresivo clasico: la difusion enmascarada sobre tokens, que permite refinamiento iterativo y potencialmente generacion no secuencial. Por otro, el proceso de abliteration busca reducir los comportamientos de rechazo del modelo original, lo que lo hace relevante para investigacion sobre alineamiento, seguridad y control de modelos. Al estar cuantizado en GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp y derivados.

La ficha se enfrenta a una limitacion importante: la model card del repositorio es una plantilla generica de cuantizacion de mradermacher y no aporta detalles sobre arquitectura interna, datos de entrenamiento, benchmarks ni capacidades del modelo base. Los datos de parametros disponibles en la informacion (555.378) no son coherentes con el nombre del modelo (0,8B), por lo que se indican como no disponibles con la salvedad correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion-LM con difusion enmascarada (masked diffusion), segun tags `diffusion-lm`, `masked-diffusion`, `llada`, `dqwen`; detalles internos no disponibles |
| Parametros totales | no disponible (el dato de safetensors indica 555.378, incoherente con el nombre 0,8B; se desconoce el valor real) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M; incluye fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base se describe mediante tags como `diffusion-lm` y `masked-diffusion`, lo que apunta a un esquema de generacion por difusion sobre secuencias de tokens en lugar de decodificacion autorregresiva token a token. La presencia del tag `llada` sugiere influencia de la familia LLaDA (Large Language Diffusion with mAsking), y `dqwen` indica una adaptacion de la familia Qwen a este paradigma. El tag `qwen3_5` vincula el linaje a Qwen3.5 en su variante de 0,8B. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO.

El proceso de "abliteration" consiste en identificar y restar las direcciones de activacion asociadas a comportamientos de rechazo, lo que modifica el comportamiento del modelo ante peticiones que el original rechazaria. Es una tecnica experimental y su efecto sobre la calidad general, la coherencia y la seguridad del modelo no esta documentado en la informacion disponible. La cuantizacion i1 de mradermacher aplica una matriz de importancia (imatrix) calculada sobre un corpus de calibracion para asignar precision de forma diferencial a los tensores, lo que en la practica mejora la perplejidad de las cuantizaciones de baja precision frente a las estaticas.

## Capacidades

- Generacion de texto en ingles mediante un esquema de difusion enmascarada, con refinamiento iterativo potencialmente no secuencial.
- Comportamiento "abliterated": se espera una reduccion de las respuestas de rechazo respecto al modelo base, aunque el alcance real no esta documentado.
- Capacidades de razonamiento, codigo y matematicas: no disponibles de forma verificable; el linaje Qwen3.5 sugiere competencia basica en estas areas, pero no hay datos publicados en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre diffusion-LM: el modelo permite experimentar con generacion por difusion enmascarada sobre un backbone de ~0,8B en hardware asequible, comparando calidad y latencia frente a modelos autorregresivos equivalentes.
- Estudio de abliteration y alineamiento: util para analizar como la eliminacion de direcciones de rechazo afecta a la distribucion de respuestas, la coherencia y la tendencia a alucinar en un modelo pequeno.
- Prototipado local en CPU o GPU de gama baja: al estar en GGUF con cuantizaciones desde IQ1 hasta Q6_K, puede ejecutarse en equipos con poca memoria para pruebas de concepto de generacion de texto.
- Evaluacion de cuantizaciones imatrix: sirve como caso de estudio para medir el impacto de las cuantizaciones i1 frente a las estaticas en un modelo de difusion, un regimen poco explorado.
- Generacion de texto en ingles para tareas creativas o de reescritura en entornos sin conectividad, aprovechando el bajo coste de despliegue.
- Base para fine-tuning experimental: el modelo puede servir como punto de partida para adaptaciones a dominios concretos donde se quiera explorar el paradigma de difusion en lugar del autorregresivo.
- Docencia y demostraciones: adecuado para explicar en clase o taller las diferencias entre decodificacion autorregresiva y difusion enmascarada con un modelo que cabe en un portatil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable, dado que el numero de parametros real es incierto. Con el nombre de 0,8B, una cuantizacion Q4_K_M rondaria los 0,5 GB y una Q6_K en torno a 0,7 GB; una IQ1_S quedaria por debajo de 0,3 GB. Estas cifras son estimaciones basadas en el nombre, no en datos confirmados.
- GPU recomendadas: para un modelo de este tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, asi como en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp); el soporte de difusion enmascarada en estos runners no esta confirmado en la informacion disponible y podria requerir builds especificos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-abliterated-diffusion-i1-GGUF (este) | no disponible (nombre 0,8B) | no disponible | Difusion enmascarada | apache-2.0 | GGUF en HF |
| Huihui-Qwen3.5-0.8B-abliterated-GGUF | ~0,8B | no disponible | Autorregresivo | no disponible | GGUF en HF |
| Qwen3.5-0.8B-Abliterated-V2-i1-GGUF | ~0,8B | no disponible | Autorregresivo | no disponible | GGUF en HF |

Los dos modelos comparables son tambien cuantizaciones de mradermacher sobre variantes abliterated de Qwen3.5-0.8B, pero en paradigma autorregresivo. La diferencia clave de este repositorio es el esquema de difusion enmascarada, que cambia el modo de generacion y las herramientas de inferencia compatibles. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta arquitectura, datos de entrenamiento ni evaluaciones; cualquier uso en produccion requiere validacion propia.
- El dato de parametros de safetensors (555.378) es incoherente con el nombre del modelo y no permite estimar requisitos de memoria con fiabilidad.
- El proceso de abliteration reduce los rechazos del modelo original, lo que puede aumentar la probabilidad de generar contenido inapropiado, sesgado o danino; no se ha evaluado su impacto en seguridad.
- Riesgo de alucinacion: no cuantificado, pero previsiblemente alto en un modelo de ~0,8B y en un paradigma experimental.
- Soporte unicamente de ingles segun la model card.
- El soporte de difusion enmascarada en llama.cpp y runners derivados no esta confirmado; es posible que el modelo no funcione correctamente en todas las herramientas que aceptan GGUF.
- La licencia apache-2.0 permite uso comercial, pero el modelo base y sus derivados pueden arrastrar obligaciones adicionales no detalladas en la informacion disponible.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-0.8B-abliterated-diffusion-i1-GGUF
- Modelo base: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-diffusion
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-0.8B-abliterated-diffusion-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-abliterated-diffusion-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Variante abliterated autorregresiva: https://huggingface.co/mradermacher/Huihui-Qwen3.5-0.8B-abliterated-GGUF
- Variante Abliterated V2: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Abliterated-V2-i1-GGUF
