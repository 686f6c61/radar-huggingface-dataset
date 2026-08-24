# slevinw/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

Qwen3.8-27B RVN Heretic Abliterated Uncensored es una variante del modelo Qwen/Qwen3.8-27B, modificada mediante la tecnica ARA (Arbitrary-Rank Ablation) para eliminar los mecanismos de rechazo del modelo original. El autor, slevinw, parte del trabajo de Tim Rohrbaugh (`trohrbaugh/Qwen3.8-27B-heretic-ara`) y aplica dos pasadas adicionales de ARA, reduciendo los rechazos ante prompts daninos de 3/100 a 0-1/100, con una divergencia KL de 0.0085 respecto al comportamiento original. El resultado es un modelo que conserva el conocimiento y las capacidades del base, pero sin los guardarrailes de seguridad que limitan las respuestas.

El modelo se distribuye en formato GGUF para su uso con llama.cpp y runtime compatibles, con cuantizaciones que permiten su ejecucion en hardware de consumo. Su arquitectura es hibrida, combinando atencion estandar con capas Gated DeltaNet de atencion lineal, lo que le permite manejar una ventana de contexto de 262.144 tokens. La licencia Apache-2.0 se mantiene del modelo base, lo que facilita su uso comercial con las debidas atribuciones.

Esta ficha cubre las especificaciones tecnicas, capacidades, casos de uso y limitaciones de este modelo, orientada a desarrolladores e investigadores que necesitan evaluar rapidamente si esta variante "uncensored" se ajusta a sus necesidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (Gated DeltaNet hybrid: 16 capas de atencion estandar + 48 capas de atencion lineal) |
| Parametros totales | 26.895.998.464 (27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 (segun archivos del repositorio) |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen3.8-27B, que soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con archivos `*-mtp.gguf` que incluyen el draft head MTP embebido |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, que combina 16 capas de atencion estandar (con GQA, 24 cabezas de atencion, 4 cabezas KV, head_dim 256) con 48 capas de Gated DeltaNet, un tipo de atencion lineal que reduce el coste computacional con el contexto largo. El modelo tiene 64 capas en total, hidden size de 5120 y un vocabulario de 248.320 tokens.

El proceso de "abliteration" se realiza con la herramienta [heretic](https://github.com/p-e-w/heretic), que implementa ARA. A diferencia de la abliteration direccional clasica (que resta una unica direccion de rechazo en el espacio de activaciones), ARA trata el problema como una optimizacion de matrices: para cada modulo objetivo (proyeccion de salida de atencion y proyeccion de bajada de MLP), recopila activaciones ante prompts "buenos" (peticiones inofensivas) y "malos" (peticiones daninas), y usa un optimizador LBFGS para reescribir la matriz de pesos. El objetivo es triple: preservar las salidas ante prompts buenos (minimizando KL), dirigir las salidas ante prompts malos hacia el manifold de salidas buenas (mediante k-NN), y sobrecorregir alejando las salidas malas de las originales. Esto permite eliminar el circuito de rechazo con un dano minimo al comportamiento general.

El modelo RVN aplica este procedimiento tres veces: una pasada original de Rohrbaugh (de Qwen3.8-27B a `-ara`, con KL 0.0535 y 3/100 rechazos) y dos pasadas adicionales de slevinw (de `-ara` a RVN, con KL 0.0085 y 0-1/100 rechazos). Los parametros de las pasadas adicionales son: start 26, end 56, preserve 0.9432, steer 0.0009, overcorrect 0.5038, neighbor 10.

## Capacidades

- Generacion de texto conversacional y creativa sin los filtros de seguridad del modelo base.
- Razonamiento y resolucion de problemas, heredados del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling, con el template de chat oficial de Qwen3.8 embebido en los archivos GGUF.
- Soporte de modo "thinking" (razonamiento encubierto) controlable, segun la compatibilidad con el template oficial.
- Capacidades multilingues, heredadas del modelo base (aunque no se especifican los idiomas exactos en la informacion disponible).
- Decodificacion especulativa MTP (Multi-Token Prediction) en los archivos `*-mtp.gguf`, que incluyen el draft head embebido para acelerar la generacion.
- Especialmente adecuado para roleplay, escritura creativa y generacion de contenido sin censura.

## Casos de uso

- Roleplay y escritura creativa: el modelo puede generar dialogos y narrativas sin las restricciones tipicas de los modelos alineados, manteniendo coherencia en contextos largos gracias a su ventana de 262K tokens. Es adecuado para juegos de rol textuales, fanfiction y novelas interactivas.
- Investigacion sobre seguridad y alineacion: permite estudiar el comportamiento de un modelo sin guardarrailes, comparando sus respuestas con las del modelo base para entender los mecanismos de rechazo y como eliminarlos.
- Generacion de contenido para adultos: el modelo esta disenado para audiencias adultas (18+) que necesitan generar contenido explicito o temas tabu sin restricciones, como en la industria editorial o de entretenimiento.
- Desarrollo de agentes conversacionales sin censura: con soporte de tool calling y el template de chat oficial, puede integrarse en sistemas de chatbot o asistentes virtuales que requieran respuestas sin filtros, aunque con las debidas advertencias legales.
- Pruebas de estres de sistemas de moderacion: al ser un modelo que no rechaza prompts daninos, puede usarse para evaluar la robustez de clasificadores de contenido o sistemas de filtrado en entornos de investigacion.
- Fine-tuning posterior: al mantener la licencia Apache-2.0 y el formato GGUF, puede servir como base para ajustes adicionales con datasets especificos, aprovechando su baja divergencia KL respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye mediciones de MMLU, HumanEval, GSM8K u otros tests estandar en su model card. Se indica que la divergencia KL respecto al modelo base es de 0.0085, lo que sugiere un dano minimo al comportamiento general, pero no hay datos cuantitativos de rendimiento en tareas especificas.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para Q4_K_M (16.8 GB segun la busqueda web), se necesita al menos 20 GB de VRAM para caber con el contexto por defecto. Para Q3_K_M (13.5 GB), unos 16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, RTX 4080 (16 GB) para Q3_K_M, o GPUs de datacenter como A100 (40/80 GB) para cuantizaciones mayores o contextos largos.
- Si cabe en consumer GPU: si, en GPUs de 16 GB o mas con cuantizaciones Q3_K_M o inferiores. Para Q4_K_M se recomienda 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para servidores, se puede convertir a otros formatos o usar vLLM con el modelo base (no cuantizado).
- Latencia y throughput: no disponible en la informacion proporcionada. Depende del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache-2.0 | safetensors, GGUF | Modelo original con guardarrailes de seguridad |
| Qwen3.8-27B-Heretic-Abliterated-Uncensored (RVN) | 27B | 262K | Apache-2.0 | GGUF | Variante abliterada con ARA, sin rechazos |
| Qwen3.8-27B-Heretic-Abliterated-Uncensored (0bserverx) | 27B | 262K | Apache-2.0 | GGUF | Variante similar, con 421.918 descargas en HF |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para comparar con otros modelos de tamano similar (como Llama 3.1 70B o Mistral Large) en la informacion disponible.

## Limitaciones y advertencias

- El modelo tiene los guardarrailes de seguridad reducidos por diseno. No debe usarse para generar contenido ilegal, danino o que infrinja las leyes locales. El propio autor advierte que es para audiencias adultas (18+) y uso responsable.
- Aunque la tasa de rechazo es de 0-1/100, no se garantiza que el modelo no pueda generar contenido peligroso si se le pide explicitamente. La abliteration no elimina el conocimiento, solo el rechazo.
- La divergencia KL de 0.0085 indica un dano minimo, pero no nulo. Puede haber degradacion sutil en tareas de razonamiento o generacion respecto al modelo base.
- No se han publicado benchmarks de rendimiento, por lo que no se puede cuantificar el impacto de la abliteration en tareas estandar.
- Los idiomas soportados no estan especificados en la informacion disponible. Se heredan del modelo base, pero no se confirma su cobertura.
- La licencia Apache-2.0 permite uso comercial, pero el modelo puede generar contenido que infrinja las politicas de las plataformas donde se despliegue. El responsable del despliegue debe asumir esa responsabilidad.
- El repositorio incluye archivos legacy (la version anterior de una sola cuantizacion) que estan superados por los archivos RVN. Se recomienda usar los archivos `*-multilingual*.gguf` o los RVN para nuevas implementaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/slevinw/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de la abliteration (Tim Rohrbaugh): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta heretic (implementacion de ARA): https://github.com/p-e-w/heretic
- Variante similar (0bserverx): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Articulo sobre la variante uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
