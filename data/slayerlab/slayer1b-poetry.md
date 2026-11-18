# SlayerLab/Slayer1B-Poetry

## Resumen

Slayer1B-Poetry es un adaptador LoRA de tipo causal-LM desarrollado por SlayerLab que especializa el modelo base Slayer1B-1.09 en la continuacion de poesia en ingles. No se trata de un modelo independiente, sino de un adaptador nativo que se carga sobre el checkpoint update-45.000 del modelo padre, congelado durante el entrenamiento. El objetivo es desplazar el estilo generativo del modelo base desde la prosa descriptiva de tipo enciclopedico hacia un registro lirico con saltos de linea, imagenes y voz poetica.

El modelo resuelve un problema concreto de adaptacion de dominio: como especializar un modelo pequeno de 1.070 millones de parametros en un registro estilistico especifico sin reentrenar los pesos completos. Para ello emplea continued pretraining sobre poemas en bruto, sin instrucciones ni optimizacion de preferencias, lo que limita el modelo a la continuacion de aperturas poeticas y no al seguimiento de consignas tematicas.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de adaptacion estilistica de bajo coste sobre modelos de ~1B, con artefactos de evaluacion completos (muestras antes/despues, receta, procedencia). El adaptador anade 22.283.520 parametros entrenables sobre un padre de 1.073.912.851 parametros, con licencia Apache 2.0 y un tamano de repositorio de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM (modelo base Slayer1B-1.09) con adaptador LoRA nativo |
| Parametros totales | 1.073.912.851 (padre congelado) + 22.283.520 (adaptador LoRA entrenable) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, pytorch; incluye codigo de inferencia ejecutable y tokenizer |
| Modelo base | SlayerLab/Slayer1B-1.09 (checkpoint update-45.000) |
| Relacion con el base | adapter |
| Fecha de entrenamiento | 17 de noviembre de 2026 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Slayer1B-1.09, un transformer causal-LM de 1.073.912.851 parametros que permanece congelado. La especializacion se realiza mediante un LoRA nativo de 22.283.520 parametros entrenables, lo que supone aproximadamente un 2,07 % del total del padre. El entrenamiento consistio en continued pretraining sobre poemas en bruto, sin instrucciones de seguimiento tematico ni optimizacion de preferencias (no hay RLHF ni DPO documentados). El repositorio incluye la receta de entrenamiento, la procedencia y los artefactos de evaluacion.

La innovacion tecnica no reside en la arquitectura, sino en el enfoque de adaptacion: un adaptador de bajo rango que modifica el estilo sin tocar los pesos base, con un conjunto de muestras diagnosticas antes/despues generadas bajo parametros controlados (temperatura 1.0, top-k 50, penalizacion de repeticion 1.1, semilla 1234, maximo de 96 tokens nuevos y supresion de EOS durante los primeros 16 tokens nuevos). No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto causal en ingles, orientada a la continuacion de aperturas poeticas.
- Cambio de registro estilistico: produce verso con saltos de linea, imagenes y voz lirica frente a la prosa descriptiva del padre.
- Patrones sonoros: aliteracion y motivos liricos observados en las muestras (por ejemplo, "Foamed and frothed").
- Cierre de estrofas cortas: en una de las muestras genera una estanza de cuatro lineas con motivos de canto y pena.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- No dispone de modo thinking, vision ni audio.
- Multilingue: solo ingles.
- No sigue instrucciones tematicas: entrenado sobre poemas en bruto sin instruction tuning.

## Casos de uso

- Continuacion de aperturas poeticas: el modelo recibe el inicio de un poema (por ejemplo, "The night") y genera lineas de verso con imagenes y voz lirica. Es adecuado porque el adaptador fue entrenado especificamente sobre poemas en bruto y no sobre consignas conversacionales.
- Generacion de borradores de estrofas para escritura creativa: un poeta puede usar el adaptador para explorar variaciones estilisticas a partir de un primer verso, aceptando que la fluidez es irregular y requiere revision humana.
- Prototipado de herramientas de escritura asistida: integrable en un editor de texto que ofrezca continuaciones poeticas en ingles, con la advertencia de que puede producir palabras malformadas y poemas muy cortos.
- Investigacion sobre adaptacion de dominio: sirve como caso de estudio reproducible de continued pretraining con LoRA sobre un modelo de ~1B, con muestras antes/despues y receta incluidas en el repositorio.
- Experimentos de estilo en entornos academicos: util para comparar el desplazamiento de registro entre el padre y el adaptador bajo parametros de decodificacion fijos (temperatura, top-k, semilla).
- Generacion de material lirico breve para demos y pruebas de concepto: adecuado por su bajo coste computacional (adaptador de 0,2 GB) y su licencia Apache 2.0, siempre que no se exija calidad literaria pulida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion documentada consiste en tres pares de muestras antes/despues con parametros de decodificacion fijos, sin evaluacion ciega, sin medicion de metrica, rima, adherencia tematica, originalidad, memorizacion ni preferencia humana.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el padre tiene 1.073.912.851 parametros y el repositorio ocupa 0,2 GB, lo que sugiere que el adaptador es ligero, pero no se documentan requisitos de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamano del padre (~1B parametros) es compatible en principio con GPU de consumo, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: el repositorio incluye codigo de inferencia ejecutable en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slayer1B-Poetry | 1.073.912.851 (padre) + 22.283.520 (LoRA) | no disponible | Adaptador LoRA para poesia en ingles | apache-2.0 | Hugging Face (SlayerLab) |
| Slayer1B-1.09 | 1.073.912.851 | no disponible | Modelo base de proposito general | no disponible en la informacion | Hugging Face (SlayerLab) |
| Alternativas de poesia de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Fluidez irregular: las muestras documentadas incluyen transiciones narrativas poco claras, repeticion y una palabra malformada ("tirpe'r").
- Poemas incompletos: dos de las tres salidas adaptadas se detienen antes del limite de tokens y la mas larga termina a mitad de frase; no hay evidencia de generacion fiable de poemas completos.
- Sin instruction tuning: no sigue consignas tematicas; debe recibir una apertura de poema, no una instruccion de chat.
- Sin optimizacion de preferencias: no se ha medido la preferencia humana ni la calidad literaria frente al padre.
- Metricas no evaluadas: metrica, rima, adherencia tematica, originalidad y memorizacion no se han evaluado sistematicamente.
- Solo ingles: no soporta otros idiomas.
- Riesgo de alucinacion: el padre genera afirmaciones de aspecto factual no verificadas; el adaptador puede heredar este comportamiento en contextos descriptivos.
- Sesgos: no se documentan sesgos conocidos, pero no se ha realizado una evaluacion de sesgos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el adaptador deben verificarse por separado en cuanto a sus terminos.
- Contexto: la longitud de contexto no esta documentada, lo que limita la planificacion de despliegues en produccion.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/SlayerLab/Slayer1B-Poetry
- Modelo base: https://huggingface.co/SlayerLab/Slayer1B-1.09
- Muestras del padre: baseline-samples.json (referenciado en la model card)
- Muestras del adaptador: samples.json (referenciado en la model card)
