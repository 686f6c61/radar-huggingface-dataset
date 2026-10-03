# Rajeshwari-Chanda/bloom-560m_wanda_0.6

## Resumen

Rajeshwari-Chanda/bloom-560m_wanda_0.6 es una variante podada del modelo bigscience/bloom-560m, publicado por el usuario Rajeshwari-Chanda en HuggingFace. Se trata de un checkpoint derivado al que se le ha aplicado un proceso de poda estructural mediante la tecnica Wanda (Pruning by Weights and Activations), y el sufijo "0.6" hace referencia a un nivel de esparsidad del 60 por ciento de los pesos. El modelo conserva la arquitectura original de BLOOM, un transformer autoregresivo de tipo decoder-only disenado para prediccion del siguiente token, con 559.214.592 parametros en su forma densa y pesos en formato safetensors (tamano del repositorio de 1,1 GB).

La relevancia de este checkpoint es fundamentalmente experimental: sirve para evaluar el impacto de la poda Wanda sobre un modelo multilingue pequeno, comparandolo con la version completa y con la variante hermana bloom-560m_wanda_0.9, que aplica una esparsidad del 90 por ciento. La model card esta generada automaticamente y no aporta informacion adicional sobre el proceso de poda, los datos de calibracion ni los resultados obtenidos.

No se dispone de datos sobre licencia, idiomas declarados ni resultados de evaluacion especificos de este checkpoint. Al derivar de BLOOM-560m, hereda las capacidades y limitaciones del modelo base, entrenado sobre 46 lenguajes naturales y 13 lenguajes de programacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only (BLOOM) |
| Parametros totales | 559.214.592 (forma densa) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada de BLOOM-560m) |
| Tipos de cuantizacion | No se han publicado cuantizaciones oficiales; pesos en safetensors (fp16/fp32) |
| Idiomas soportados | No disponible en la model card; el modelo base BLOOM-560m soporta 46 lenguajes naturales |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM, esencialmente similar a GPT-3 en cuanto a modelo autorregresivo para prediccion del siguiente token, con atencion causal y embeddings posicionales ALiBi. La version 560m mantiene la configuracion reducida de la familia BLOOM y fue entrenada sobre el mismo corpus que el resto de variantes. Este checkpoint concreto no ha sido reentrenado: parte de los pesos de bigscience/bloom-560m y les aplica un algoritmo de poda.

Wanda (Pruning by Weights and Activations) es un metodo de poda por magnitud que compara la magnitud de cada peso con la norma de las activaciones de entrada asociadas, permitiendo eliminar pesos sin necesidad de reentrenamiento completo. En este caso se ha fijado una esparsidad objetivo del 60 por ciento. La model card no especifica el conjunto de calibracion empleado, si la poda es no estructurada o semiestructurada, ni si se realizo un ajuste fino posterior a la poda para recuperar calidad. Tampoco se documentan hiperparametros de entrenamiento, composicion del dataset ni fases de RLHF o DPO, ya que el modelo no ha pasado por ellas.

## Capacidades

- Generacion de texto autoregresiva en la linea de BLOOM-560m.
- Capacidad multilingue heredada del modelo base, con soporte declarado de 46 lenguajes naturales segun la documentacion oficial de BLOOM.
- Generacion de codigo en 13 lenguajes de programacion, segun la documentacion del modelo base.
- Razonamiento basico y respuesta a instrucciones limitada, al no haber pasado por ajuste por instrucciones ni RLHF.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- No dispone de modo "thinking" ni de capacidades de vision o audio.
- Las capacidades reales tras la poda al 60 por ciento no estan evaluadas ni documentadas.

## Casos de uso

- Investigacion sobre poda de redes neuronales: el checkpoint permite comparar la degradacion de calidad entre distintos niveles de esparsidad (0.6 frente a 0.9) sobre el mismo modelo base.
- Prototipado de generacion de texto en entornos con recursos muy limitados: con 559 millones de parametros densos cabe en GPUs de gama baja, lo que facilita pruebas rapidas de pipelines de generacion.
- Experimentos academicos de eficiencia: util para medir el impacto de Wanda en el throughput y en la huella de memoria respecto al BLOOM-560m original.
- Generacion de texto multilingue de baja exigencia: tareas de completado simple o clasificacion por generacion en varios idiomas, asumiendo la perdida de calidad por la poda.
- Base para destilacion o ajuste fino ligero: puede servir como punto de partida para experimentos de recuperacion de rendimiento tras la poda.
- Evaluacion comparativa de tecnicas de compresion: util como referencia en estudios que comparen Wanda con otros metodos de poda o cuantizacion.
- No se recomienda su uso en produccion con usuarios finales, dado que no hay evaluacion de calidad, sesgos ni licencia publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,1 GB solo de pesos, mas cache KV y activaciones; en la practica entre 1,5 y 2,5 GB para contextos moderados.
- VRAM estimada en fp32: alrededor de 2,2 GB de pesos, mas overhead; cerca de 3 GB en total.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,6 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente. Modelos como GTX 1650, RTX 3050, RTX 3060 o superiores funcionan sin problema. En entornos profesionales, A100, H100 o L4 estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si. Incluso en iGPU con memoria compartida puede ejecutarse con cuantizacion, aunque con latencia alta.
- Opciones de despliegue: transformers con PyTorch, text-generation-inference (etiqueta endpoints_compatible) y, potencialmente, llama.cpp u Ollama mediante conversion a GGUF, aunque no se han publicado pesos GGUF oficiales.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 560M, en una RTX 4090 o similar se puede esperar un throughput alto con batching, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rajeshwari-Chanda/bloom-560m_wanda_0.6 | 559.214.592 (densos) | 2048 | 60 por ciento | No disponible | HuggingFace |
| Rajeshwari-Chanda/bloom-560m_wanda_0.9 | No disponible | 2048 (heredado) | 90 por ciento | No disponible | HuggingFace |
| bigscience/bloom-560m | 559.214.592 | 2048 | 0 por ciento (denso) | BigScience BLOOM RAIL 1.0 | HuggingFace |
| bigscience/bloom-1b1 | Aproximadamente 1.100 millones | 2048 | 0 por ciento (denso) | BigScience BLOOM RAIL 1.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta licencia, datos de entrenamiento ni condiciones de uso.
- Al no especificarse licencia, no se puede confirmar si el uso comercial esta permitido. El modelo base BLOOM-560m usa la licencia BigScience BLOOM RAIL 1.0, pero la licencia de este derivado no esta declarada.
- La poda al 60 por ciento puede degradar la coherencia, la fluidez y la precision del modelo respecto al original. No hay evaluacion que cuantifique esta perdida.
- Riesgo de alucinacion: elevado, como en cualquier modelo de 560M sin ajuste por instrucciones ni RLHF. No debe usarse como fuente de informacion factual.
- Sesgos conocidos: hereda los sesgos del corpus ROOTS y del modelo base BLOOM, incluidos sesgos de genero, raza y religion, sin que se hayan documentado mitigaciones.
- Limitacion de contexto: 2048 tokens, insuficiente para tareas que requieran documentos largos.
- No dispone de ajuste por instrucciones, por lo que no responde de forma fiable a formatos conversacionales ni a instrucciones complejas.
- No soporta tool calling ni function calling, lo que limita su integracion en agentes o pipelines que dependan de estas capacidades.
- Sin datos de evaluacion ni de reproducibilidad del proceso de poda, su uso en produccion no esta recomendado.
- El repositorio no incluye informacion sobre el conjunto de calibracion ni sobre si hubo ajuste fino posterior a la poda.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.6
- Variante hermana con esparsidad 0.9: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.9
- Modelo base bigscience/bloom-560m: https://huggingface.co/bigscience/bloom-560m
- Documentacion de BLOOM en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/bloom.md
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
