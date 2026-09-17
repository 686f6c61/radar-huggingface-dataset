# nkkbr/Mini-K3-1H-attn-4kda-v2

## Resumen

Mini-K3-1H-attn-4kda-v2 es un checkpoint de preentrenamiento de aproximadamente 1.028 millones de parametros logicos (365 millones activos por token) publicado por el usuario nkkbr en HuggingFace. Forma parte de una familia de 20 arquitecturas comparadas de forma controlada y reproduce, a escala reducida, los operadores principales de Kimi-K3: KDA (atencion lineal con decaimiento), Gated MLA, Attention Residuals por bloques, Stable LatentMoE, activaciones SiTU, output gates y Quantile Balancing. Su proposito no es el uso final como asistente, sino servir de proxy de investigacion para estudiar el comportamiento de estas arquitecturas a escala de mil millones de parametros.

El modelo consta de 13 capas decodificadoras: 12 capas KDA y una unica capa Gated MLA situada en la ultima posicion. Usa Mixture-of-Experts con 64 expertos enrutados, 2 compartidos y top-k 4, con un ancho oculto de 1.024 y 12 cabezas de atencion. El checkpoint publicado corresponde a la revision `checkpoint-tokens-004000317440`, tras 4.000 millones de tokens objetivo y 6.104 pasos de optimizador, con una longitud de secuencia de 8.192 tokens.

Su relevancia es doble. Por un lado, documenta con inusual detalle el proceso de comparacion controlada entre arquitecturas (inicializacion determinista con semilla comun, mismo orden de mezcla de datos, aislamiento estricto de documentos). Por otro, es un ejemplo de checkpoint intermedio puramente preentrenado, sin post-entrenamiento, lo que lo hace util para experimentacion de arquitectura y no para despliegue conversacional. Con 143 descargas y 0 likes, su difusion es todavia muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador hibrido: 12 capas KDA (atencion lineal con decaimiento) + 1 capa Gated MLA, con Attention Residuals por bloques y Stable LatentMoE |
| Parametros totales | 1.028.476.624 |
| Parametros activos | 365.252.304 por token (aproximadamente el 35,5 % del total) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento; no se declara una ventana maxima distinta) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en BF16 con estados de control en FP32 y no se publican variantes GGUF ni cuantizadas |
| Idiomas soportados | no disponibles (no declarados en la model card) |
| Licencia | no disponible (la model card no especifica licencia; los conjuntos de datos de origen conservan sus propias licencias y este repositorio no redistribuye su texto) |
| Formato de pesos | `model.safetensors` con codigo Python propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |

Detalles adicionales de configuracion: ancho oculto 1.024, 12 cabezas de atencion, ancho de cabeza KDA 128, kernel de convolucion depthwise causal KDA de tamano 4, 128 grupos de decaimiento contiguos por cabeza, MLA en modo posicional NoPE con output gate activada, 64 expertos enrutados, 2 expertos compartidos, top-k 4, ancho oculto de experto enrutado 512, tamano de bloque de Attention Residual 4 y 1 capa densa antes del MoE. Vocabulario de 163.840 entradas, con BOS 163.584, EOS de generacion 163.586 y PAD 163.839.

## Arquitectura y entrenamiento

La arquitectura combina atencion lineal recurrente y atencion completa en una proporcion deliberadamente desequilibrada (12:1), lo que es precisamente el objeto del experimento: la variante `attn-4kda` altera parametros como la granularidad del decaimiento, la longitud de convolucion o el encoding posicional respecto a una linea base. KDA aporta un estado recurrente con decaimiento por cabeza y una convolucion causal corta, mientras que la capa Gated MLA, colocada al final, introduce atencion completa con compuerta de salida y sin codificacion posicional explicita (NoPE). El enrutamiento MoE sigue el esquema Stable LatentMoE: seleccion con puntuaciones sesgadas y combinacion con puntuaciones sigmoid no sesgadas renormalizadas, con Quantile Balancing en linea mediante histogramas de 1.000 bins.

El entrenamiento utiliza Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de parametros matriciales y AdamW como respaldo para vectores y embeddings, con weight decay de 0,1, cosine decay, 1 % de warmup lineal y QK-Clip por cabeza. Los datos se empaquetan con aislamiento estricto de documentos: MLA aplica mascara causal bloqueada por documento y KDA reinicia su estado recurrente y el historial de la convolucion corta Q/K/V en cada frontera de segmento. La inicializacion es determinista y ligada a nombre y forma, con semilla base 20260914, de modo que los parametros compartidos entre arquitecturas arrancan identicos byte a byte. El checkpoint publicado ha consumido 4.000.317.440 objetivos validos de siguiente token en 6.104 pasos; la etiqueta final `checkpoint-tokens-016000000000-final` solo se creara tras procesar exactamente 16.000 millones de objetivos. No se ha realizado ningun post-entrenamiento (ni RLHF ni DPO).

## Capacidades

- Generacion de texto autoregresiva como modelo base: el uso previsto es la continuacion de secuencia, no la conversacion ni el seguimiento de instrucciones.
- Modelado de lenguaje a escala de mil millones de parametros con una ventana de 8.192 tokens.
- Razonamiento y codigo: no se declaran capacidades especificas ni evaluaciones al respecto; al ser un checkpoint de preentrenamiento intermedio, no hay evidencia publicada de rendimiento en estas tareas.
- Tool calling / function calling: no soportado; no ha recibido post-entrenamiento ni formatos de plantilla de chat.
- Agentes y razonamiento multi-paso: no soportado por el mismo motivo.
- Capacidades multilingues: no declaradas; el vocabulario de 163.840 entradas es amplio, pero no se especifica la composicion idiomatica del corpus.
- Capacidad especial: ninguna de tipo vision, audio, thinking mode o decodificacion especulativa declarada.
- Valor como artefacto de investigacion: permite reproducir la comparacion controlada entre 20 arquitecturas y analizar el efecto de sustituir MLA por KDA en una proporcion 12:1.

## Casos de uso

- Investigacion en atencion lineal frente a atencion completa: el checkpoint permite medir, con el mismo corpus y el mismo orden de datos, como se comporta una proporcion 12:1 de KDA frente a Gated MLA en convergencia y perplejidad de desarrollo.
- Estudios de ablacion de arquitectura: al existir 20 variantes con inicializacion determinista y claves compartidas, se pueden comparar directamente cambios en granularidad de decaimiento, longitud de convolucion o encoding posicional sin confundir el efecto con diferencias de inicializacion.
- Analisis de enrutamiento MoE: con 64 expertos enrutados y top-k 4, el modelo sirve para estudiar la distribucion de carga entre expertos y el efecto de Quantile Balancing en linea sobre el colapso de enrutadores.
- Base para fine-tuning experimental: un equipo puede aplicar SFT o DPO sobre este checkpoint para comprobar si los operadores KDA mantienen la calidad tras el ajuste, algo relevante antes de escalar a un Kimi-K3 completo.
- Prototipado de kernels e implementaciones de inferencia: el estado recurrente de KDA y la convolucion corta exigen kernels especificos; el checkpoint sirve como banco de pruebas para validar implementaciones propias.
- Generacion de texto de dominio especifico tras ajuste: con 8.192 tokens de contexto se puede condicionar la generacion en documentos largos para tareas de resumen extractivo o continuacion tematica, siempre que se ajuste previamente y se valide la calidad.
- Docencia y formacion tecnica: es un caso practico de arquitectura hibrida real, con codigo autocontenido (`modeling_mini_k3.py`, `initialize_model.py`, `smoke_test.py`), util para explicar MoE, attention residuals y atencion lineal en cursos avanzados.
- Experimentos de eficiencia comparada: la relacion entre 1.028 millones de parametros logicos y 365 millones activos por token permite estudiar el compromiso entre capacidad y coste de inferencia en un mismo punto de escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que es un checkpoint intermedio de investigacion y que no ha sido evaluado en tareas downstream. Solo se registran la NLL y la perplejidad de desarrollo fijado durante el entrenamiento, disponibles en W&B y en los ficheros JSONL de metricas del run, pero no se facilitan sus valores numericos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 2,1 GB solo para pesos (1.028 millones de parametros a 2 bytes), mas los estados de control en FP32 (decaimiento KDA, convolucion, normalizacion y estado de control del router) y las activaciones. En la practica, un presupuesto de 3 a 5 GB cubre la inferencia con secuencias moderadas; es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas es suficiente. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 ejecutarian el modelo con holgura. No se requiere A100 ni H100 para inferencia.
- Cabe en GPU consumer: si. Un unico acelerador de gama media-alta es suficiente; el cuello de botella previsible es la implementacion de los kernels lineales, no la memoria.
- Opciones de despliegue: no disponible en marcos estandar. El modelo depende de codigo propio (`modeling_mini_k3.py` y `configuration_mini_k3.py`) y no se anuncia soporte en vLLM, TGI, llama.cpp ni Ollama, ni conversion a GGUF. El uso local pasa por cargar el safetensors con el codigo incluido y `initialize_model.py` / `smoke_test.py`.
- Latencia y throughput estimados: no disponibles. Como referencia estructural, el modelo activa 365.252.304 parametros por token frente a los 1.028.476.624 totales, aproximadamente un 35,5 %, lo que reduce el coste aritmetico por token respecto a un modelo denso del mismo tamano, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

No hay resultados de rendimiento publicados para este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad. Los datos de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mini-K3-1H-attn-4kda-v2 | 1.028 M totales / 365 M activos | MoE hibrido KDA + Gated MLA | 8.192 tokens | no disponible (sin evaluacion downstream) | no disponible | safetensors + codigo PyTorch propio |
| Llama 3.2 1B | aproximadamente 1.200 M | denso | 128.000 tokens | no disponible en la informacion proporcionada | Llama 3.2 Community License | pesos en safetensors, amplio soporte en frameworks |
| Qwen3 1.7B | aproximadamente 1.700 M | denso | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 | pesos en safetensors, amplio soporte en frameworks |
| Kimi-K3 (escala completa) | no disponible | MoE con KDA y MLA | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible |

La diferencia relevante no esta en el rendimiento, que no se puede comparar con los datos disponibles, sino en la naturaleza del artefacto: los modelos alternativos de la tabla son modelos finales con post-entrenamiento y soporte de inferencia amplio, mientras que este es un checkpoint de preentrenamiento intermedio disenado para experimentacion de arquitectura.

## Limitaciones y advertencias

- No es un asistente: es un modelo unicamente preentrenado, sin SFT, RLHF ni DPO. No sigue instrucciones y no debe desplegarse en productos conversacionales.
- Riesgo alto de alucinacion y degeneracion: la propia model card advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas.
- Sesgos conocidos: no se documenta ningun analisis de sesgo ni la composicion del corpus de entrenamiento; los conjuntos de datos de origen conservan sus propias licencias y no se redistribuyen.
- Ambito de validez limitado: es un proxy de investigacion a escala de mil millones de parametros y con entrenamiento a 8.192 tokens. La model card advierte de que las clasificaciones de arquitectura a esta escala y longitud necesitan confirmacion antes de extrapolarse al Kimi-K3 completo.
- Licencia no especificada: al no declararse licencia, el uso comercial queda en una situacion juridica indeterminada. Conviene contactar con el autor antes de cualquier uso productivo.
- Idiomas no declarados: no se puede asumir cobertura multilingue ni calidad equilibrada entre idiomas.
- Contexto limitado a 8.192 tokens: no se anuncia extension de contexto ni tecnicas de interpolacion posicional aplicadas.
- Sin soporte en herramientas estandar: no hay integracion en vLLM, TGI, llama.cpp ni Ollama, ni pesos GGUF, lo que complica el despliegue en produccion.
- Optimizer state no publicado: el repositorio no incluye el estado del optimizador, de modo que reanudar el entrenamiento desde el checkpoint no reproducira exactamente la trayectoria original.
- Tamano del repositorio: 10,4 GB, muy superior a los aproximadamente 2,1 GB que ocuparian los pesos en BF16, lo que sugiere la presencia de artefactos o revisiones adicionales en el mismo repositorio.
- Checkpoint intermedio: corresponde a 4.000 millones de tokens de los 16.000 millones previstos, por lo que esta lejos de la convergencia final del run.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-attn-4kda-v2
- No se han encontrado otros enlaces relevantes (paper, blog, repositorio de experimentos o demo) en los resultados de la busqueda web disponible; los resultados obtenidos no guardan relacion con el modelo.
