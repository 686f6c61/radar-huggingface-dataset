# gbrixi/evo2_20b_vllm

## Resumen

Evo 2 20B es un modelo de lenguaje de ADN desarrollado por el Arc Institute, entrenado de forma autorregresiva sobre billones de tokens de secuencias genomicas. Este repositorio concreto (`gbrixi/evo2_20b_vllm`) es una conversion del checkpoint original `arcinstitute/evo2_20b` a formato safetensors para poder cargarse con el backend vLLM de la libreria oficial de Evo 2. No es un modelo nuevo ni un fine-tune: es el mismo modelo, empaquetado para un backend de inferencia distinto.

La relevancia de esta conversion es practica. El checkpoint original esta pensado para el backend propietario Vortex, mientras que esta version permite servirlo con vLLM, lo que facilita su integracion en infraestructuras de despliegue ya existentes y su uso con GPUs que no disponen de tensor cores FP8 (como la A100), para las cuales se construye una variante sin FP8 a partir del directorio `surgery/`.

El modelo tiene 19.746.037.802 parametros, 50 capas y una longitud de contexto de 1 millon de tokens, lo que lo situa en la gama alta de los modelos genomicos. Su uso esta orientado a tareas de biologia computacional: prediccion de secuencias, anotacion genomica, diseno de variantes y analisis de genomas completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StripedHyena 2 (tag `striped_hyena2`), 50 capas |
| Parametros totales | 19.746.037.802 (20B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (pesos FP8 en el checkpoint vLLM; variante sin FP8 generada desde `surgery/` para GPUs sin tensor cores FP8) |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 35,3 GB |
| Modelo base | arcinstitute/evo2_20b |
| Dataset de entrenamiento | arcinstitute/opengenome2 |
| Backend soportado | vLLM (para Vortex, usar el checkpoint original) |

## Arquitectura y entrenamiento

Evo 2 emplea una arquitectura StripedHyena 2, una familia de modelos hibricos que combina capas de atencion con capas de convolucion de estado (SSM) organizadas en patrones "striped". Esta eleccion permite manejar contextos muy largos de forma mas eficiente que un transformer denso puro, algo critico cuando se trabaja con secuencias de ADN que pueden alcanzar cientos de miles o millones de bases. El modelo tiene 50 capas y fue entrenado de forma autorregresiva sobre billones de tokens de ADN.

El entrenamiento se realizo sobre el dataset OpenGenome2, compuesto por secuencias genomicas de multiples organismos. Segun la model card, los checkpoints de 20B y 7B se entrenaron hasta una longitud de secuencia de 1 millon de tokens; existen tambien variantes base entrenadas con contexto de 8192 tokens. No se detalla en la informacion disponible la composicion exacta del dataset, el numero preciso de tokens ni si se aplicaron fases de RLHF o DPO, algo poco habitual en modelos genomicos.

La innovacion practica de este repositorio no esta en el modelo sino en el empaquetado: la conversion a safetensors permite cargarlo con vLLM, y el sistema selecciona automaticamente pesos FP8 en GPUs con tensor cores FP8 (H100, H200, L4) o construye una forma sin FP8 en el resto (por ejemplo, A100).

## Capacidades

- Modelado autorregresivo de secuencias de ADN: predice el siguiente token (base nitrogenada) dado un contexto, lo que permite calcular verosimilitudes de secuencias.
- Manejo de contextos de hasta 1 millon de tokens, adecuado para genomas completos o regiones genomicas extensas.
- Generacion de secuencias de ADN condicionada por contexto.
- Puntuacion y evaluacion de variantes: comparar la probabilidad de secuencias de referencia frente a variantes.
- Anotacion funcional de regiones genomicas mediante el modelado de patrones de secuencia.
- Inferencia con backend vLLM, con soporte para GPUs con y sin tensor cores FP8.
- No dispone de soporte documentado de tool calling, function calling ni capacidades de agente.
- No es un modelo multilingue en el sentido habitual: opera sobre el alfabeto de nucleotidos, no sobre lenguaje natural.

## Casos de uso

- Analisis de variantes genomicas: calcular la verosimilitud de una secuencia de referencia y de sus variantes para priorizar mutaciones potencialmente funcionales, aprovechando el contexto largo para incluir regiones regulatorias distantes.
- Anotacion de genomas completos: procesar regiones de hasta 1 millon de bases en una sola pasada para identificar patrones de secuencia asociados a elementos funcionales, sin necesidad de fragmentar el contexto.
- Prediccion de efectos de edicion genomica: evaluar como cambia la probabilidad de una secuencia tras una edicion CRISPR simulada, como filtro previo al diseno experimental.
- Busqueda y clasificacion de secuencias: puntuar candidatos generados por otros metodos (por ejemplo, diseno de proteinas o elementos regulatorios) segun su plausibilidad bajo el modelo.
- Investigacion en genomica comparativa: comparar la plausibilidad de secuencias homologas entre especies para estudiar conservacion evolutiva.
- Despliegue en infraestructura existente con vLLM: integrar el modelo en un servidor de inferencia ya estandarizado, reutilizando herramientas de gestion, batching y monitorizacion de vLLM.
- Fine-tuning sobre genomas especificos: partir de este checkpoint como base para especializar el modelo en un grupo taxonomico concreto, como demuestra la variante `evo2_7b_microviridae`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 35,3 GB en safetensors; en FP8 los pesos ocupan aproximadamente 20 GB, y la variante sin FP8 generada desde `surgery/` requiere del orden de 40 GB solo para pesos, mas el espacio de activaciones y cache para contextos largos.
- GPUs con tensor cores FP8 (H100, H200, L4): usan directamente los pesos FP8 del checkpoint.
- GPUs sin tensor cores FP8 (por ejemplo, A100): construyen una forma sin FP8 a partir de `surgery/`, con mayor consumo de memoria.
- No cabe en GPUs de consumo convencionales de 24 GB en su forma completa; el contexto de 1 millon de tokens agrava enormemente los requisitos de memoria de activaciones.
- Opciones de despliegue: backend vLLM de la libreria `evo2` (`Evo2('evo2_20b', backend='vllm')`); para el backend Vortex debe usarse el checkpoint original `arcinstitute/evo2_20b`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Backend |
|---|---|---|---|---|---|
| Evo 2 20B (este repo) | 20B | 1.000.000 | StripedHyena 2, 50 capas | Apache 2.0 | vLLM |
| Evo 2 7B | 7B | 1.000.000 | StripedHyena 2, 32 capas | Apache 2.0 | vLLM |
| Evo 2 7B base | 7B | 8.192 | StripedHyena 2, 32 capas | Apache 2.0 | vLLM |
| Evo 2 1B base | 1B | 8.192 | StripedHyena 2, 25 capas | Apache 2.0 | vLLM |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es un modelo de secuencias de ADN, no un asistente conversacional: no debe esperarse razonamiento en lenguaje natural ni generacion de texto.
- Riesgo de alucinacion en sentido biologico: las secuencias generadas pueden ser plausibles estadisticamente pero no viables ni funcionales in vivo; requieren validacion experimental.
- Sesgos derivados del dataset OpenGenome2: la representacion desigual de taxones puede hacer que el modelo rinda peor en organismos poco representados.
- Contexto de 1 millon de tokens: aunque soportado, el coste computacional y de memoria crece de forma significativa con la longitud de secuencia.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset original.
- Este repositorio es una conversion de terceros (autor `gbrixi`), no el checkpoint oficial; para reproducibilidad en produccion conviene contrastar con `arcinstitute/evo2_20b`.
- El backend vLLM no es el backend principal del proyecto (Vortex); algunas funcionalidades pueden diferir entre ambos.
- No se documentan en la informacion disponible los idiomas, la cuantizacion disponible ni el rendimiento medido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gbrixi/evo2_20b_vllm
- Modelo base: https://huggingface.co/arcinstitute/evo2_20b
- Repositorio GitHub de Evo 2: https://github.com/ArcInstitute/evo2
- Paper (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.02.18.638918
- Dataset OpenGenome2: https://huggingface.co/datasets/arcinstitute/opengenome2
- Checkpoint Evo 2 7B vLLM: https://huggingface.co/gbrixi/evo2_7b_vllm
- Checkpoint Evo 2 7B base vLLM: https://huggingface.co/gbrixi/evo2_7b_base_vllm
- Checkpoint Evo 2 1B base vLLM: https://huggingface.co/gbrixi/evo2_1b_base_vllm
- Checkpoint Evo 2 7B 262k vLLM: https://huggingface.co/gbrixi/evo2_7b_262k_vllm
- Checkpoint Evo 2 7B Microviridae vLLM: https://huggingface.co/gbrixi/evo2_7b_microviridae_vllm
