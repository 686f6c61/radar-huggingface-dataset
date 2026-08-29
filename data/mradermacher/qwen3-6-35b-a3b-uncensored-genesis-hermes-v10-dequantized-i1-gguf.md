# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-i1-GGUF

## Resumen

Este modelo es una cuantización GGUF de una versión modificada de Qwen3.6-35B-A3B, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.505 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos (según la nomenclatura A3B). La versión concreta, denominada "Uncensored-Genesis-Hermes-V10-dequantized", ha sido creada por el usuario mradermacher a partir de un modelo base de symrex, y se distribuye en formato GGUF para su uso con motores de inferencia como llama.cpp, Ollama o LM Studio.

El modelo está diseñado para ofrecer respuestas sin censura, lo que lo hace atractivo para desarrolladores que necesitan un asistente conversacional con menos restricciones de contenido. Al ser una versión "dequantized", los pesos se han convertido a alta precisión (posiblemente FP16) antes de generar las cuantizaciones, lo que puede mejorar la fidelidad de los pesos originales. La información técnica disponible es muy limitada: no se especifican la arquitectura exacta, los datos de entrenamiento, la licencia ni los idiomas soportados, por lo que esta ficha se basa únicamente en los datos públicos del repositorio y en el conocimiento general de la serie Qwen3.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente MoE, segun la nomenclatura A3B) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (segun el nombre, ~3 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. El nombre "Qwen3.6-35B-A3B" sugiere que se trata de un modelo de tipo Mixture of Experts (MoE) con 35.500 millones de parametros totales y 3.000 millones de parametros activos por token, siguiendo la convencion de la serie Qwen3.6 de Alibaba. Sin embargo, no se confirma si esta version "Uncensored-Genesis-Hermes-V10" ha sido sometida a un fine-tuning adicional sobre el modelo base, aunque el sufijo "Genesis-Hermes" podria indicar una mezcla de datasets de entrenamiento (posiblemente relacionados con los datasets Hermes de Nous Research y Genesis). Tampoco se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

El proceso de cuantizacion ha sido realizado por mradermacher, quien ha generado multiples versiones de cuantizacion con y sin matriz de importancia (imatrix). La etiqueta "dequantized" sugiere que los pesos originales se convirtieron a una precision alta (probablemente FP16) antes de generar las cuantizaciones, lo que puede preservar mejor la calidad del modelo original.

## Capacidades

No se han publicado capacidades especificas para este modelo en la informacion disponible. Sin embargo, por su origen en la serie Qwen3.6, es razonable esperar que herede capacidades generales de generacion de texto, razonamiento, codigo y comprension multilingue, aunque no se puede confirmar sin datos oficiales. La etiqueta "uncensored" indica que el modelo ha sido modificado para eliminar o reducir las restricciones de contenido, lo que puede permitir respuestas sobre temas que otros modelos rechazarian.

- Generacion de texto conversacional y continuacion de texto (no confirmado oficialmente).
- Posible soporte de razonamiento y codigo, heredado de la serie Qwen3.6 (no confirmado).
- Capacidad de funcionar como asistente sin censura, gracias a la modificacion "uncensored" (indicado en el nombre).
- Compatible con herramientas de inferencia GGUF como llama.cpp, Ollama y LM Studio.

## Casos de uso

Dado que la informacion tecnica es escasa, los casos de uso se basan en el tipo de modelo y su formato:

- **Asistente conversacional sin restricciones**: el modelo puede desplegarse en aplicaciones de chat donde se requiera libertad de contenido, como juegos de rol, escritura creativa o simulaciones de personajes. Su naturaleza "uncensored" permite explorar temas que otros modelos rechazarian.
- **Generacion de texto creativo**: util para redactar historias, guiones o dialogos con menos limitaciones tematicas, aprovechando la capacidad de generacion de texto del modelo base.
- **Prototipado rapido de aplicaciones de IA**: al estar en formato GGUF, se puede integrar facilmente en entornos locales con llama.cpp o Ollama para pruebas de concepto sin necesidad de infraestructura en la nube.
- **Investigacion sobre alineacion y censura**: el modelo puede servir como caso de estudio para analizar como las modificaciones "uncensored" afectan al comportamiento y a la calidad de las respuestas en comparacion con el modelo original.
- **Despliegue en entornos con recursos limitados**: gracias a su arquitectura MoE con pocos parametros activos, puede ejecutarse en GPUs de consumo medio, aunque el tamaño total de pesos requiere al menos 16-20 GB de VRAM en cuantizaciones bajas.
- **Integracion en pipelines de generacion de contenido**: puede usarse como motor de generacion de texto en herramientas de automatizacion, aunque se debe tener cuidado con la calidad y la coherencia debido a la falta de datos de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

Al ser un modelo MoE de 35,5 B de parametros totales, la memoria necesaria depende de la cuantizacion elegida. A continuacion se ofrecen estimaciones orientativas basadas en el tamaño de los pesos:

- **VRAM estimada para inferencia**: para una cuantizacion Q4_K_M, se estiman aproximadamente 20 GB de VRAM (35,5 B * 4 bits / 8 = ~17,8 GB, mas overhead). Para Q8, unos 35 GB. Para FP16, unos 70 GB.
- **GPU recomendadas**: para cuantizaciones bajas (Q4), una GPU con 24 GB de VRAM (como RTX 3090, RTX 4090) es suficiente. Para cuantizaciones altas, se necesitan GPUs profesionales como A100 (40/80 GB) o H100.
- **Compatibilidad con consumer GPU**: si, con cuantizaciones Q4 o inferiores, cabe en GPUs de gama alta para consumidores (RTX 3090/4090). Con Q2, podria caber en 16 GB, pero con perdida de calidad.
- **Opciones de despliegue**: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y otros motores que soporten este formato. Tambien se puede usar con servidores como llama.cpp-server o text-generation-webui.
- **Latencia y throughput**: no se dispone de datos concretos. Al ser MoE con solo 3 B de parametros activos, la velocidad de generacion deberia ser relativamente alta en comparacion con un modelo denso de 35 B, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo base Qwen3.6-35B-A3B podria compararse con otros MoE de tamaño similar como Mixtral 8x7B o Qwen3-30B-A3B, pero no se tienen datos de rendimiento ni de licencia de esta version concreta. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- **Contenido sin censura**: al ser una version "uncensored", el modelo puede generar contenido ofensivo, ilegal o inapropiado. No es adecuado para aplicaciones publicas sin moderacion.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede inventar hechos o respuestas incorrectas, especialmente en temas especializados.
- **Informacion tecnica incompleta**: no se conocen la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento, lo que dificulta evaluar su idoneidad para usos comerciales o academicos.
- **Posible degradacion de calidad**: la modificacion "uncensored" puede haber afectado negativamente a la coherencia o al razonamiento del modelo, aunque no hay datos que lo confirmen.
- **Restricciones de uso comercial**: al no conocerse la licencia, no se puede garantizar que el modelo sea utilizable en proyectos comerciales. Se recomienda contactar con el autor o verificar la licencia del modelo base original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-i1-GGUF
- Version V6 del mismo autor: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-i1-GGUF
- Version V6 sin i1: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-GGUF
- Version abliterated: https://github.com/Damacol/mradermacher-qwen3.6-35b-a3b-abliterated-i1-gguf/blob/main/README.md
- Entrada en Ollama para el modelo base: https://ollama.com/library/qwen3.6:35b-a3b
- Version heretic con MTP preservado: https://parapulse.io/models/mradermacher/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-GGUF
