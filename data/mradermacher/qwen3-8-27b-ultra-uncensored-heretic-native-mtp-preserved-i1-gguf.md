# mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved`, preparadas por mradermacher. El modelo base es una versión "abliterated" (técnica que elimina los mecanismos de rechazo del modelo) y "uncensored" de un Qwen3.8-27B, con la capacidad de Multi-Token Prediction (MTP) nativa preservada. Se distribuye bajo licencia Apache 2.0 y está pensado para ejecución local en hardware de consumo mediante el ecosistema llama.cpp.

La relevancia de este modelo radica en que ofrece una alternativa sin censura para desarrolladores e investigadores que necesitan explorar los límites de los modelos de lenguaje, ya sea para estudiar su comportamiento, para aplicaciones creativas sin restricciones o para experimentar con técnicas de alineación. Al ser una cuantización GGUF, se puede ejecutar en GPUs de gama media con requisitos de VRAM moderados, y el formato imatrix mejora la calidad de las cuantizaciones de baja precisión.

El modelo tiene 27.320.697.856 parámetros (27,3B) y, según la model card, es un modelo de visión, por lo que los archivos de proyección multimodal (mmproj) se encuentran en el repositorio estático asociado. El idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base es una variante "uncensored" y "abliterated" de Qwen3.8-27B, desarrollada por llmfan46 (tambien conocido como OrcaRouter). La tecnica de abliteration elimina selectivamente las direcciones en el espacio de activaciones que correlacionan con el rechazo a contenido no deseado, lo que resulta en un modelo que no se niega a responder a peticiones que el modelo original rechazaria. El tag "Heretic" sugiere una modificacion adicional orientada a maximizar la libertad de generacion, y "Native-MTP-Preserved" indica que se ha conservado la capacidad de Multi-Token Prediction (MTP) del modelo original, una tecnica que permite predecir varios tokens futuros simultaneamente y que puede mejorar la velocidad de inferencia.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion GGUF con imatrix realizada por mradermacher utiliza el algoritmo de importance matrix para calcular las estadisticas de activacion y optimizar la asignacion de bits en las cuantizaciones de baja precision, lo que reduce la perdida de calidad respecto a las cuantizaciones estaticas convencionales.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo Qwen3.8-27B, aunque no se han publicado benchmarks especificos para esta variante.
- Vision: segun la model card, es un modelo de vision; los archivos mmproj estan disponibles en el repositorio estatico.
- Multi-Token Prediction (MTP): la capacidad nativa de prediccion multiple de tokens se ha preservado, lo que puede mejorar la velocidad de decodificacion en entornos compatibles.
- Sin censura: el proceso de abliteration elimina los mecanismos de rechazo, permitiendo generar contenido que el modelo original bloquearia.
- Conversacional: el tag "conversational" indica que esta optimizado para dialogos multi-turno.
- Idioma: exclusivamente ingles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparando sus respuestas con las del modelo original para entender como funcionan los sistemas de seguridad interna.
- Generacion creativa sin restricciones: escritura de ficcion, poesia, guiones o contenido satirico que aborde temas tabu o controvertidos sin limitaciones impuestas por el modelo.
- Desarrollo de asistentes de rol (roleplay): creacion de personajes y escenarios donde el usuario espera respuestas sin filtros, comun en comunidades de juegos de rol por texto.
- Analisis de textos sensibles: procesamiento de documentos que contienen lenguaje ofensivo o temas delicados donde un modelo censurado podria negarse a trabajar.
- Despliegue local en hardware modesto: gracias a las cuantizaciones GGUF, se puede ejecutar en una GPU con 12-16 GB de VRAM, lo que permite prototipar aplicaciones sin depender de APIs externas.
- Experimentacion con tecnicas de cuantizacion: el archivo imatrix incluido permite a los desarrolladores crear sus propias cuantizaciones personalizadas y evaluar el impacto en la calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el quant elegido, se necesitan aproximadamente 11 GB (i1-Q2_K), 13 GB (i1-IQ3_M) o 16 GB (i1-Q4_K_S) de VRAM, mas overhead de contexto y calculo.
- GPU recomendadas: para el quant Q4_K_S se recomienda una GPU con al menos 16 GB de VRAM, como una RTX 4080/4090, A100 40GB o similar. Para los quants mas pequeños, una RTX 3080/3090 de 12-24 GB puede ser suficiente.
- Compatibilidad con consumer GPU: si, los quants de 11 y 13 GB caben en GPUs de gama alta para consumidores (RTX 3080/3090, RTX 4070 Ti, etc.).
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores basados en llama.cpp. Tambien puede servirse con vLLM si se convierte a otro formato, aunque no esta confirmado.
- Latencia y throughput: no se dispone de datos medidos. La velocidad dependera del hardware, el quant y la implementacion de MTP en el motor de inferencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa detallada con otros modelos de la misma categoria. El modelo base Qwen3.8-27B original es el punto de referencia natural, pero no se han publicado datos comparativos de rendimiento entre la version censurada y la abliterated. Otras alternativas "uncensored" de tamano similar (como Llama-3-27B o Mistral-27B) no estan disponibles en el mercado, por lo que la comparativa no es posible con los datos actuales.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso. Su uso debe limitarse a entornos de investigacion y desarrollo controlados.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en temas especializados. No se ha evaluado su fiabilidad factual.
- Idioma limitado: solo soporta ingles, lo que restringe su uso en aplicaciones multilingues.
- Perdida de calidad por cuantizacion: las cuantizaciones de baja precision (Q2_K, IQ3_M) pueden degradar la coherencia y el razonamiento respecto al modelo en precision completa.
- Licencia: aunque la licencia es Apache 2.0, el modelo base puede tener restricciones adicionales no documentadas. Se recomienda revisar la licencia del modelo original antes de un uso comercial.
- Sin garantias de soporte: el repositorio tiene cero descargas y cero likes, lo que indica que es un proyecto reciente y sin comunidad establecida.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1): https://huggingface.co/mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF
- Repositorio HuggingFace (cuantizaciones estaticas): https://huggingface.co/mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Blog de explainx.ai sobre la version MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Blog de orcarouter.ai sobre la version GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guia de ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
