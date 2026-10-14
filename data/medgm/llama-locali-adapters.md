# MedGm/Llama-Locali-adapters

## Resumen

Llama-Locali-adapters es un repositorio de adaptadores PEFT publicado por el usuario MedGm que reúne los cuatro adaptadores LoRA resultantes de los experimentos de ajuste fino del proyecto Locali. No es un modelo único, sino una colección de adaptadores pensada para reproducir las comparaciones recogidas en el informe del proyecto: tres adaptadores sobre Qwen2.5-Coder-1.5B-Instruct y uno sobre Phi-4-mini-instruct. El adaptador que el propio autor utiliza en producción es otro repositorio distinto, Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA, y este repositorio existe principalmente como material de comparación.

El objetivo del proyecto es el ajuste fino orientado a tareas de código: reparación de bugs, generación de código seguro, escritura de tests y revisión de código. Los adaptadores se entrenaron sobre un dataset propio, locali-mix-v2, con configuraciones que contrastan QLoRA (NF4), LoRA sobre base en 16 bits y rsLoRA, además de un adaptador sobre un modelo base distinto (Phi-4-mini) para medir transferencia.

La relevancia del repositorio es metodológica: documenta hallazgos concretos sobre cómo afecta la cuantización del modelo base congelado, cómo influye la inclusión de trazas de ejecución en los datos y en qué tareas un modelo base ya fuerte mejora o empeora tras el ajuste. La licencia declarada es Apache-2.0 para los adaptadores de Qwen, MIT para el de Phi-4-mini, y se aplican los términos de atribución de la Llama 3.1 Community License por el origen de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers densos; base Qwen2.5-Coder-1.5B-Instruct y unsloth/Phi-4-mini-instruct |
| Parametros totales | Adaptadores con r=16 y alpha=16; modelos base de 1.5B (Qwen) y 3.8B (Phi-4-mini) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | NF4 (QLoRA) y LoRA sobre base en 16 bits; rsLoRA como variante de escalado |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (adaptadores Qwen); MIT (adaptador Phi-4-mini); terminos de atribucion de Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un conjunto de adaptadores LoRA, no de pesos completos. Todos comparten hiperparametros: r = 16, alpha = 16, aplicados a todas las proyecciones, 2 epocas, learning rate 2e-4, semilla 3407 y entrenamiento en una unica GPU Kaggle T4. Las cuatro variantes son: qwen2.5-coder-1.5b-qlora-v1 (QLoRA en NF4 sobre la mezcla v1, 1 h 58 min), qwen2.5-coder-1.5b-lora16-v2 (LoRA sobre la base en 16 bits, mezcla v2, 2 h 17 min), qwen2.5-coder-1.5b-rslora-v2 (QLoRA con escalado estabilizado por rango, mezcla v2, 2 h 34 min) y phi-4-mini-qlora-v2 (QLoRA en NF4 sobre Phi-4-mini-instruct, mezcla v2, 5 h 58 min). Los commits base citados son 2e1fd39 para Qwen y 75becc4 para Phi-4-mini.

El dataset locali-mix-v2 es propio del autor; la mezcla v1 es un subconjunto de v2 que excluye las trazas de ejecucion de la T4, la segunda familia de operadores de bug y las revisiones limpias adicionales. Los resultados sugieren que anadir trazas de ejecucion en v2 elimino una perdida de 4,6 puntos en CRUXEval-O que presentaba el adaptador v1, y que la cuantizacion del modelo base congelado a NF4 no supuso un coste medible a cambio de un ahorro del 36 por ciento en memoria pico. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generacion de codigo en ingles, orientada a tareas de reparacion de bugs y escritura de codigo.
- Reparacion de codigo (repair) en distintas distribuciones, con ganancias declaradas segun el adaptador.
- Generacion de codigo seguro (secure code generation).
- Escritura de tests.
- Revision de codigo (review).
- Ajuste por adaptadores LoRA cargables mediante PEFT con el parametro subfolder.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Reproduccion de experimentos de investigacion: cargar los cuatro adaptadores y replicar las tablas y los tests de significancia del informe del proyecto, comparando QLoRA frente a LoRA en 16 bits y rsLoRA bajo datos identicos.
- Evaluacion de tecnicas de cuantizacion: usar la comparativa interna para medir el impacto de congelar el modelo base en NF4 frente a mantenerlo en 16 bits, con un ahorro de memoria pico del 36 por ciento como referencia practica.
- Estudio de reparacion de bugs: emplear los adaptadores v1 y v2 sobre Qwen2.5-Coder-1.5B para analizar como la inclusion de trazas de ejecucion afecta al rendimiento en CRUXEval-O.
- Analisis de transferencia entre modelos base: utilizar el adaptador sobre Phi-4-mini para estudiar como un modelo base mas fuerte responde al ajuste fino en reparacion, revision y generacion de codigo seguro.
- Ajuste fino de bajo coste sobre una unica GPU: los tiempos de entrenamiento reportados (entre 1 h 58 min y 5 h 58 min en una T4) sirven como referencia para planificar experimentos con recursos limitados.
- Integracion en pipelines de evaluacion de codigo: los adaptadores se cargan con PEFT y subfolder, lo que facilita incorporarlos a arneses de evaluacion automatizados.
- Formacion y docencia: usar las cuatro variantes como caso practico de comparacion de metodos de PEFT con hiperparametros constantes.

## Benchmarks y rendimiento

No se publican puntuaciones absolutas de benchmarks en la informacion disponible. El autor reporta deltas relativos y conclusiones cualitativas:

| Comparacion | Metrica o tarea | Resultado declarado |
|---|---|---|
| Adapter v1 frente a v2 | CRUXEval-O | v1 perdia 4,6 puntos; v2 con trazas de ejecucion elimino esa perdida |
| QLoRA frente a LoRA 16 bits frente a rsLoRA | Varias tareas (mismos datos) | Sin ganador consistente; diferencias dentro del ruido de una sola semilla |
| Cuantizacion NF4 de la base congelada | Memoria pico | Ahorro del 36 por ciento sin coste medible |
| Phi-4-mini (ganancias) | Reparacion en distribucion | +30 puntos |
| Phi-4-mini (ganancias) | Revision | +22 puntos |
| Phi-4-mini (ganancias) | Generacion de codigo seguro | +17 puntos |
| Phi-4-mini (perdidas) | Reparacion en el formato de prompt propio | −22 puntos |
| Phi-4-mini (perdidas) | Escritura de tests en distribucion | −11 puntos |
| Phi-4-mini (perdidas) | MBPP+ | −6 puntos por peor uso del nombre de funcion solicitado |

Las tablas completas y los tests de significancia se encuentran en el repositorio del proyecto.

## Requisitos de hardware

- Entrenamiento: una unica GPU Kaggle T4 (16 GB de VRAM) por adaptador, con tiempos de entre 1 h 58 min y 5 h 58 min.
- Inferencia sobre Qwen2.5-Coder-1.5B: modelo base de 1,5B parametros, manejable en GPUs de consumo; los adaptadores anaden una fraccion minima de memoria.
- Inferencia sobre Phi-4-mini: modelo base de 3,8B parametros, tambien viable en GPUs de consumo con cuantizacion.
- Tamano del repositorio: 0,3 GB, correspondiente a los adaptadores en safetensors, no a los pesos base.
- Carga: libreria peft, mediante PeftModel.from_pretrained con el parametro subfolder.
- VRAM, latencia y throughput exactos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Dado que el repositorio es una coleccion de adaptadores, la comparacion natural es entre sus propias variantes:

| Adaptador | Modelo base | Metodo | Datos | Tiempo de entrenamiento |
|---|---|---|---|---|
| qwen2.5-coder-1.5b-qlora-v1 | Qwen2.5-Coder-1.5B-Instruct 2e1fd39 | QLoRA (NF4) | mezcla v1 | 1 h 58 min |
| qwen2.5-coder-1.5b-lora16-v2 | Qwen2.5-Coder-1.5B-Instruct 2e1fd39 | LoRA sobre base 16 bits | mezcla v2 | 2 h 17 min |
| qwen2.5-coder-1.5b-rslora-v2 | Qwen2.5-Coder-1.5B-Instruct 2e1fd39 | QLoRA + escalado por rango | mezcla v2 | 2 h 34 min |
| phi-4-mini-qlora-v2 | unsloth/Phi-4-mini-instruct 75becc4 | QLoRA (NF4) | mezcla v2 | 5 h 58 min |

Frente a modelos completos de codigo de tamano similar (por ejemplo, el propio Qwen2.5-Coder-1.5B-Instruct sin ajustar o Phi-4-mini-instruct sin ajustar), los adaptadores de este repositorio no sustituyen al modelo base: requieren cargarlo y aplicar el adaptador encima. No se dispone de comparativas con otros adaptadores de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base correspondiente (Qwen2.5-Coder-1.5B-Instruct o Phi-4-mini-instruct) para funcionar.
- Solo ingles: el unico idioma declarado es en.
- Resultados basados en una unica semilla (seed 3407), por lo que las diferencias entre variantes pueden no ser estadisticamente separables del ruido, segun reconoce el propio autor.
- El adaptador v1 presenta perdidas de rendimiento que v2 corrige parcialmente; no se recomienda usar v1 en produccion.
- El adaptador sobre Phi-4-mini empeora en algunas tareas respecto a la base (reparacion en el formato de prompt propio, escritura de tests, MBPP+), lo que indica riesgo de regresion en tareas fuera de su distribucion de entrenamiento.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos: no documentados en la informacion proporcionada.
- Licencias mixtas: Apache-2.0 para los adaptadores Qwen, MIT para el de Phi-4-mini, y se aplican los terminos de atribucion de la Llama 3.1 Community License a todos por el origen de los datos de entrenamiento de los que deriva el prefijo del proyecto. Conviene revisar estos terminos antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de material de investigacion, no de un artefacto con adopcion contrastada.
- Para uso real, el autor remite al adaptador Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA, no a los de este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MedGm/Llama-Locali-adapters
- Adaptador principal del autor: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA
- Dataset locali-mix-v2: https://huggingface.co/datasets/MedGm/locali-mix-v2
- Repositorio del proyecto: https://github.com/MedGm/Locali
- Licencia Llama 3.1 Community: https://www.llama.com/llama3_1/license/
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Modelo base Phi-4-mini-instruct: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Modelo base Phi-4-mini-instruct (unsloth): https://huggingface.co/unsloth/Phi-4-mini-instruct
