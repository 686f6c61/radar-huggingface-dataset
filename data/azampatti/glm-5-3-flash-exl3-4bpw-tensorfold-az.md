# azampatti/GLM-5.3-Flash-EXL3-4bpw-TensorFold-AZ

## Resumen

GLM-5.3-Flash-EXL3-4bpw-TensorFold-AZ es una cuantizacion de 4 bits del modelo multimodal GLM-5.3-Flash de Z.AI, publicada por el usuario azampatti sobre el checkpoint ya cuantizado por Mia AI Lab. Se trata de una variante de "expertos compartidos" (shared experts) inyectada en el modelo de Mia AI Lab para operar con top-k 4 en lugar del top-k 8 original, manteniendo el mismo formato EXL3 a 4 bits por peso. El resultado es un checkpoint de aproximadamente 87.800 millones de parametros y 175,7 GB en disco, pensado para desplegarse en configuraciones de doble DGX Spark mediante la receta TensorFold.

El modelo hereda la arquitectura GLM-5.3-Flash, un transformer multimodal de tipo image-text-to-text con mezcla de expertos (MoE), y esta disenado para inferencia de alta fidelidad en hardware de gama relativamente contenida. Su relevancia radica en que reduce la divergencia KL respecto a la release oficial en FP8 de Z.AI en comparacion con la cuantizacion TR3-4bpw ampliamente usada, manteniendo tamano, velocidad y consumo de memoria equivalentes.

La ficha se centra en lo que el autor documenta explicitamente: fidelidad de cuantizacion, rendimiento en decodificacion y prefill, resultados en GSM8K y HumanEval, y requisitos de despliegue. Cualquier dato no cubierto por la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), formato EXL3; pipeline image-text-to-text |
| Parametros totales | 87.811.157.118 (dato real de safetensors) |
| Parametros activos | no disponible (top-k 4 segun config.json del repo) |
| Longitud de contexto | ventana de 1M tokens en la receta TensorFold v1.3.2; pool KV de 2.582.528 tokens |
| Tipos de cuantizacion | EXL3 a 4 bits por peso en expertos enrutados (capas 3-44, gate/up/down); pesos densos a 4 bits en TensorFold; se requiere DENSE=fp8 al cargar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer multimodal con mezcla de expertos. En esta variante, los expertos enrutados de las capas 3 a 44 se almacenan en formato EXL3 a 4 bits por peso (gate, up, down) con codebook mcg, mientras que los expertos compartidos se han sustituido por los de azampatti para operar con top-k 4. El resto de la model card de Mia AI Lab describe la receta TensorFold v0.6.0 con configuracion TP=2, 4 streams, ventana de 1M tokens, cache KV en FP8 y borradores DFlash2 para decodificacion especulativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. La innovacion tecnica documentada es la calibracion de la cuantizacion EXL3 orientada a minimizar la divergencia KL respecto a la release FP8 oficial de Z.AI, con mediciones pareadas sobre los mismos tokens y seis conjuntos de prueba. El autor advierte que la receta por defecto (DENSE=q4) recuantiza los expertos compartidos a 4 bits al cargar y pierde calidad, por lo que exige DENSE=fp8.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), segun el pipeline_tag del repo.
- Generacion de codigo: validada en HumanEval y HumanEval+/MBPP+ con thinking mode activado.
- Razonamiento matematico: validado en GSM8K.
- Soporte de tool calling / function calling: la model card confirma que las llamadas a herramientas funcionan y que los argumentos en array se mantienen como arrays JSON.
- Ventana de contexto larga: la receta declara 1M tokens y la prueba needle de 1M tokens se supera correctamente.
- Decodificacion especulativa mediante borradores DFlash2, con respuestas redactadas equivalentes a las seriales (6/6).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a la ventana de 1M tokens y al pool KV de 2,58M tokens, util para analisis de contratos o expedientes completos.
- Generacion de codigo en produccion: con tool calling funcional y buen rendimiento en HumanEval+/MBPP+ (86,5% en 542 problemas), puede integrarse en pipelines de CI/CD para generacion y revision de parches.
- Razonamiento matematico asistido: GSM8K al 98,8% en modo greedy lo hace adecuado para tutoria o verificacion de calculos en entornos educativos o financieros.
- Procesamiento de documentos con imagen: al ser image-text-to-text, sirve para extraer y razonar sobre capturas, formularios escaneados o diagramas combinados con texto.
- Despliegue en hardware de borde de gama alta: la receta TensorFold para doble DGX Spark permite servir el modelo en dos estaciones compactas con throughput de decodificacion de 61,8 tok/s en prosa a una peticion y 103,2 tok/s a cuatro.
- Agentes multi-paso: la combinacion de tool calling, contexto de 1M tokens y decodificacion especulativa permite construir agentes que encadenan busquedas, llamadas a API y sintesis final.
- Analisis de codigo a gran escala: el prefill de 1.824 tok/s con prompts de 131k tokens facilita la revision de repositorios completos en una sola pasada.

## Benchmarks y rendimiento

| Metrica | TR3-4bpw | Este quant |
|---|---|---|
| Divergencia KL a FP8 (wiki / workload) | 0,0990 / 0,3271 | 0,0903 / 0,3150 |
| GSM8K (250, greedy) | 98,0% | 98,8% |
| HumanEval (164, greedy) | 97,6% | 95,7% |
| HumanEval+ / MBPP+ (542, thinking on) | 86,3% | 86,5% |
| Decodificacion prosa, 1 / 4 peticiones (tok/s) | 61,5 / 105,5 | 61,8 / 103,2 |
| Decodificacion codigo, 1 / 4 peticiones (tok/s) | 79,9 / 124,0 | 78,6 / 128,3 |
| Prefill 131k tokens (tok/s) | 1.819 | 1.824 |
| Tamano | 175,7 GB | 175,7 GB |

El autor indica que las diferencias en GSM8K y HumanEval no son estadisticamente significativas (p = 0,5 y p = 0,45 respectivamente) y que la ganancia medida es la reduccion de KL. En HumanEval+ y MBPP+ ambos cuantizados resuelven 469 frente a 468 de 542 problemas. El suelo de error por los pesos densos a 4 bits de TensorFold se situa en 0,0676 en wiki y 0,3009 en workload.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 175,7 GB en disco; el despliegue documentado usa dos DGX Spark con TP=2, por lo que se necesita un pool de memoria agregado de al menos esa cifra mas el overhead de cache KV.
- GPU recomendadas: el autor documenta explicitamente doble DGX Spark. No se proporcionan recomendaciones para A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en consumer GPU: no disponible; el tamano de 175,7 GB excluye GPUs consumer individuales.
- Opciones de despliegue: receta TensorFold v0.6.0 con el script start.sh de Mia AI Lab, invocando DENSE=fp8 y MODEL_ID apuntando a este repo. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: decodificacion de 61,8 tok/s en prosa a una peticion y 103,2 tok/s a cuatro; en codigo, 78,6 a 128,3 tok/s segun concurrencia; prefill de 1.824 tok/s con prompt de 131k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-4bpw-TensorFold-AZ (este) | 87,8B | 1M tokens (receta) | EXL3 4 bpw | apache-2.0 | Top-k 4, shared experts de azampatti |
| Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold | no disponible | 1M tokens (receta) | EXL3 4 bpw | apache-2.0 | Top-k 8, base de este checkpoint |
| brandonmusic-TR3-4bpw | no disponible | no disponible | 4 bpw | no disponible | Referencia de cuantizacion en las mediciones |
| zai-org/GLM-5.3-Flash (FP8) | no disponible | no disponible | FP8 | no disponible | Release oficial usada como referencia de KL |

## Limitaciones y advertencias

- Requiere DENSE=fp8 al cargar: con el valor por defecto DENSE=q4 se recuantizan los expertos compartidos y se pierde la mayor parte de su calidad.
- La comparacion de calidad se basa en divergencia KL y en benchmarks con diferencias no significativas; las ganancias en GSM8K y HumanEval no son concluyentes estadisticamente.
- El suelo de error por los pesos densos a 4 bits de TensorFold no puede eliminarse con ninguna cuantizacion de expertos.
- En HumanEval este quant obtiene 95,7% frente al 97,6% de TR3, una diferencia de 3 problemas que el autor califica de no significativa pero que conviene vigilar en produccion.
- El conjunto de pruebas de chat es el unico donde la mejora en KL queda dentro del ruido.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos de alucinacion especificos en la informacion disponible.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base zai-org/GLM-5.3-Flash y del checkpoint intermedio de Mia AI Lab.
- Despliegue limitado a la receta TensorFold documentada; no hay soporte confirmado en otros motores de inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/azampatti/GLM-5.3-Flash-EXL3-4bpw-TensorFold-AZ
- Modelo base: https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Receta TensorFold para DGX Spark: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks-TensorFold
- Repositorio TensorFold: https://github.com/ashhart/TensorFold
