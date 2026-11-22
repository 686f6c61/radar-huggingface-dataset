# mradermacher/Llama-3.2-3B-Instruct-SFT-D_chosen-pref-mix2-GGUF

## Resumen

Llama-3.2-3B-Instruct-SFT-D_chosen-pref-mix2-GGUF es una cuantizacion en formato GGUF del modelo SongTonyLi/Llama-3.2-3B-Instruct-SFT-D_chosen-pref-mix2, un ajuste fino por supervisión (SFT) del conocido Llama 3.2 3B Instruct de Meta. El trabajo de cuantizacion lo ha realizado mradermacher, un perfil habitual en Hugging Face especializado en convertir pesos a GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base parte de la arquitectura transformer densa de Llama 3.2 3B, con 3.212.749.888 parametros totales, y ha sido entrenado adicionalmente con TRL mediante SFT sobre un dataset cuya composicion exacta no se detalla en la informacion disponible.

La relevancia de esta publicacion es practica: ofrece una bateria de cuantizaciones estaticas (de Q2_K a f16) que permiten ejecutar un modelo de 3B parametros en hardware de consumo, desde equipos con poca VRAM hasta estaciones de trabajo con GPU dedicada. Al estar basado en Llama 3.2 3B Instruct, hereda las capacidades conversacionales y multilingues del modelo original de Meta, aunque el ajuste fino posterior puede haber alterado su comportamiento en tareas especificas.

Conviene subrayar que se trata de un artefacto de cuantizacion, no de un modelo nuevo: la calidad final depende tanto del modelo base ajustado como del tipo de cuantizacion elegida. La model card no documenta el proceso de entrenamiento del modelo original ni los datos utilizados, por lo que muchas especificaciones tecnicas deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (hereda de Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de tipo decoder-only, la arquitectura estandar de la familia Llama 3.2 de Meta, con 3.212.749.888 parametros. Sobre esa base, el autor SongTonyLi aplico un ajuste fino supervisado (SFT) utilizando la libreria TRL, segun los tags de la model card. El nombre del repositorio ("SFT-D_chosen-pref-mix2") sugiere un entrenamiento sobre pares de preferencia o respuestas "chosen", pero no se detalla en la informacion disponible la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas adicionales como RLHF o DPO.

La contribucion de mradermacher se limita a la cuantizacion: genera versiones estaticas del modelo en GGUF (sin cuantizaciones ponderadas/imatrix, que el autor indica que no estan disponibles en el momento de la publicacion). El proceso de cuantizacion sigue el flujo habitual de llama.cpp, con tipos de la familia K-quant e IQ-quant. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste Instruct de Llama 3.2 3B.
- Razonamiento basico y respuesta a instrucciones, reforzado por el SFT aplicado sobre el modelo base.
- Soporte de conversaciones multi-turno (tag "conversational" en Hugging Face).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia compatibles.
- Capacidades multilingues limitadas: la model card solo declara ingles.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking".

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: gracias a las cuantizaciones Q4_K_S y Q4_K_M (2,0-2,1 GB), el modelo puede ejecutarse en portatiles con 8 GB de RAM y ofrecer respuestas en ingles para pruebas de concepto sin depender de APIs externas.
- Despliegue en entornos con recursos limitados: la version Q2_K (1,5 GB) permite ejecutar el modelo en dispositivos de borde o contenedores con poca memoria, util para demos o clasificacion de texto sencilla.
- Generacion de texto en pipelines de procesamiento por lotes: al ser un modelo de 3B, el throughput en CPU con llama.cpp es aceptable para tareas de resumen o reescritura de documentos en ingles.
- Educacion e investigacion: sirve como caso de estudio de un pipeline completo de ajuste fino SFT + cuantizacion GGUF, util para quienes aprenden a publicar modelos en Hugging Face.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo base.
- Integracion en aplicaciones de escritorio con Ollama o llama.cpp: el formato GGUF es directamente compatible con estas herramientas, lo que simplifica la distribucion de un asistente local en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~1,5 GB; Q3_K_S ~1,6 GB; Q3_K_M ~1,8 GB; Q3_K_L ~1,9 GB; IQ4_XS ~1,9 GB; Q4_K_S ~2,0 GB; Q4_K_M ~2,1 GB; Q5_K_S ~2,4 GB; Q5_K_M ~2,4 GB; Q6_K ~2,7 GB; Q8_0 ~3,5 GB; f16 ~6,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4 en adelante; para f16 se recomienda al menos 8 GB. No se dispone de datos especificos de rendimiento en A100, H100 o RTX 4090 en la informacion proporcionada.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones caben en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB). Las versiones Q4 y Q5 son las mas adecuadas para GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con infraestructuras de endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Llama-3.2-3B-Instruct-SFT-D_chosen-pref-mix2-GGUF) | 3,21B | no disponible | no disponible | GGUF | Cuantizacion estatica de un SFT sobre Llama 3.2 3B |
| Llama 3.2 3B Instruct (Meta) | 3,21B | 128k (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo original de referencia |
| Qwen2.5-3B-Instruct | 3,09B | 32k (segun Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y buen rendimiento multilingue |
| Phi-3.5-mini-instruct | 3,82B | 128k (segun Microsoft) | MIT | safetensors, GGUF | Alternativa de Microsoft con licencia MIT |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de datos de benchmarks de este modelo concreto para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.2, puede heredar sesgos presentes en los datos de entrenamiento originales de Meta; no se documenta ningun proceso de mitigacion adicional en el SFT.
- Riesgo de alucinacion: como todo modelo de 3B, la tasa de alucinacion es mayor que en modelos de mayor tamano; no se han publicado evaluaciones especificas.
- Limitaciones de contexto o idioma: la model card solo declara ingles; el rendimiento en castellano no esta garantizado. La longitud de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: la licencia no esta disponible en la model card, lo que impide confirmar si el uso comercial esta permitido. Se recomienda consultar el modelo base SongTonyLi/Llama-3.2-3B-Instruct-SFT-D_chosen-pref-mix2 y la licencia de Llama 3.2 de Meta antes de usarlo en produccion.
- Caveat para produccion: al ser una cuantizacion estatica sin versiones imatrix, la calidad en cuantizaciones bajas (Q2_K, Q3_K_S) puede degradarse notablemente; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene muy pocas descargas (46) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-SFT-D_chosen-pref-mix2-GGUF
- Modelo base: https://huggingface.co/SongTonyLi/Llama-3.2-3B-Instruct-SFT-D_chosen-pref-mix2
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.2-3B-Instruct-SFT-D_chosen-pref-mix2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
