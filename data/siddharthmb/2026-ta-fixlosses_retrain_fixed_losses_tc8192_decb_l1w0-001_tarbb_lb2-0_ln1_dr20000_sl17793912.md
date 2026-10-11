# siddharthmb/2026.TA.fixlosses_retrain_fixed_losses_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr20000_sl17793912

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo al uso, sino un adaptador transcoder disperso (sparse transcoder adapter) entrenado en modo bridging sobre google/gemma-2-2b. Lo publica el usuario siddharthmb como parte de la colección "2026 Transcoder Adapters", y su objetivo es sustituir o complementar componentes densos del modelo base por representaciones dispersas de 8192 características (n_features = 8192), de forma que las activaciones internas sean interpretables y a la vez se preserve el comportamiento del modelo original.

El artefacto se apoya en el modelo base google/gemma-2-2b y toma como referencia google/gemma-2-2b-it, incluido el tokenizador. La arquitectura declarada es gemma2 y los pesos se distribuyen en formato safetensors, con un recuento total de 3.596.081.920 parámetros verificados en el propio repositorio (7,2 GB). La ficha no indica licencia, idiomas soportados ni pipeline, por lo que buena parte de los metadatos habituales quedan sin especificar.

Su relevancia es fundamentalmente de investigación: permite medir con métricas concretas (divergencia KL media de 0,1787 y acuerdo top-1 de 0,8513 frente al modelo de referencia) hasta qué punto una adaptación dispersa reproduce el comportamiento del modelo denso. Es, por tanto, una pieza para interpretabilidad mecanística y experimentación sobre adaptación dispersa, más que un modelo listo para producto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma2 (modelo base Google Gemma 2) con adaptador transcoder disperso en modo bridging |
| Parametros totales | 3.596.081.920 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la ficha del adaptador; el modelo base google/gemma-2-2b declara 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la ficha del adaptador |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-2-2b |
| Modelo de referencia | google/gemma-2-2b-it |
| Tokenizador | google/gemma-2-2b-it |
| n_features del transcoder | 8192 |
| dec_bias | True |
| l1_weight | 0,001 |
| Tamano del repositorio | 7,2 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre la arquitectura gemma2 del modelo google/gemma-2-2b, que emplea transformers con atención local y global alternadas. El componente añadido es un transcoder disperso (sparse transcoder) con 8192 características latentes, sesgo de decodificador activado (dec_bias = True) y una penalización L1 de 0,001 sobre las activaciones, lo que fuerza dispersidad en la representación aprendida. El modo de entrenamiento declarado es bridging, con backbone = target, es decir, el adaptador se entrena para puentear las representaciones hacia el comportamiento del modelo objetivo.

El entrenamiento se realizó durante 1 época, con learning rate 0,0008, batch size 4, warmup ratio 0,05 y función de pérdida de tipo KL. La pérdida combina tres términos con pesos lambda_adapt = 1,0, lambda_bridge = 2,0 y lambda_nmse = 1, y se configuró un único corte (n_cutoffs = 1). Los datos de entrenamiento provienen del dataset siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits, derivado de conversaciones de LMSYS-Chat-1M. No se documentan en la información disponible ni el número exacto de tokens de entrenamiento, ni si hubo fases de RLHF o DPO, ni innovaciones adicionales como decodificación especulativa.

Una observación sobre el recuento de parámetros: los 3.596.081.920 parámetros de safetensors son compatibles con el modelo base (del orden de 2,6B) más en torno a 1B de parámetros correspondientes a los transcodificadores de 8192 características. Se trata de una estimación a partir de los datos publicados, no de un desglose confirmado por el autor, que no lo detalla en la ficha.

## Capacidades

- Adaptación dispersa del modelo base: reproduce el comportamiento de google/gemma-2-2b (y toma como referencia la variante instruct) mediante componentes transcoder dispersos, no mediante pesos densos convencionales.
- Representación latente dispersa: expone 8192 características por transcoder, con penalización L1, pensadas para ser analizadas individualmente en estudios de interpretabilidad.
- Modo bridging: el adaptador se entrena para transferir el comportamiento del backbone objetivo, lo que permite estudiar el efecto de sustituir componentes densos por versiones dispersas.
- Extracción de características: las activaciones dispersas pueden emplearse como features para análisis posterior o para alimentar clasificadores auxiliares.
- Compatibilidad con el ecosistema transformers: el repositorio declara library_name: transformers y etiquetas de text-generation-inference y endpoints_compatible, lo que sugiere que puede servirse mediante TGI.
- Generación de texto: indirecta, a través del modelo base; el adaptador por sí solo no se documenta como modelo generativo autónomo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la ficha del adaptador.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación en interpretabilidad mecanística: analizar las 8192 características del transcoder para localizar qué direcciones latentes se activan ante patrones concretos de gemma-2-2b, con la ventaja de que la penalización L1 fuerza representaciones dispersas y por tanto más legibles.
- Sustitución dispersa de componentes densos: emplear el adaptador como aproximación del comportamiento del modelo original para evaluar si una capa dispersa puede reemplazar a la densa con una pérdida de fidelidad aceptable, medida en KL y acuerdo top-1.
- Auditoría del comportamiento del modelo base: los valores token_metrics_final/kl_mean (0,1787) y top1_agreement (0,8513) permiten cuantificar cuánto se desvía la versión adaptada respecto a la referencia, útil para validar experimentos de compresión o poda.
- Estudio de diálogo multi-turno sobre LMSYS-Chat-1M: dado que el entrenamiento se hizo con ese corpus de conversaciones, el adaptador sirve para analizar cómo se representan internamente los turnos de chat en gemma-2-2b.
- Ajuste fino de hiperparámetros de adaptación dispersa: el nombre del modelo codifica la configuración completa (tc8192, l1w0.001, lb2.0, dr20000, lr8e-04) y existen variantes hermanas en la colección, lo que permite comparar configuraciones de forma controlada.
- Extracción de features para tareas descendentes: las activaciones dispersas de 8192 dimensiones pueden alimentar clasificadores, detectores de anomalías o sondas de análisis sobre texto, aprovechando que son interpretables.
- Reentrenamiento y reproducibilidad: el autor etiqueta explícitamente este modelo como reentrenamiento con pérdidas corregidas (fixlosses, retrain_fixed_losses), de modo que sirve como punto de control reproducible frente a versiones anteriores con errores de pérdida.
- Despliegue experimental en endpoints compatibles: al declarar endpoints_compatible y text-generation-inference, puede desplegarse como servicio en entornos de investigación que ya usen TGI, siempre que el adaptador se combine correctamente con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se publica son métricas de evaluación interna del propio adaptador, medidas sobre el conjunto lmsys_chat:

| Metrica | Valor |
|---|---|
| kl_mean | 0,17867957055568695 |
| kl_mean_interesting | 0,30598 |
| top1_agreement | 0,85132 |
| top1_agreement_interesting | 0,692283 |
| n_interesting | 15446 |
| n_samples | 200 |
| n_tokens | 34100 |
| per_benchmark/lmsys_chat/kl_mean | 0,17867957055568695 |
| per_benchmark/lmsys_chat/top1_agreement | 0,85132 |

Conviene interpretar estas cifras con cautela: describen la fidelidad del adaptador frente al modelo de referencia, no la calidad del modelo en tareas de usuario. El subconjunto etiquetado como "interesting" (15446 tokens considerados relevantes) muestra una divergencia KL notablemente mayor (0,3060) y un acuerdo top-1 bastante inferior (0,6923), lo que indica que la adaptación dispersa pierde precisión justo en los tokens más informativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: alrededor de 7,2 GB solo para los pesos del repositorio (3,6B parámetros a 2 bytes por parámetro). Si se carga además el modelo base gemma-2-2b en fp16, el consumo conjunto ronda los 12-13 GB.
- VRAM estimada en otras precisiones: en int8 el conjunto puede situarse en torno a 6-7 GB, y en cuantización de 4 bits en torno a 3-4 GB. No se especifican en la ficha los formatos de cuantización soportados, por lo que estas cifras son estimaciones a partir del tamaño de los pesos.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para trabajar en fp16 con holgura. Una RTX 4080 o 3090 (16-24 GB) también es viable en fp16, y una GPU de 8-12 GB requeriría cuantización.
- Cabe en GPU de consumo: sí. En una RTX 4090 o 3090 (24 GB) sin problemas en fp16; en tarjetas de 12 GB o menos conviene cuantizar.
- Opciones de despliegue: transformers como vía principal (library_name declarado) y text-generation-inference, ya que el repositorio lleva la etiqueta text-generation-inference y endpoints_compatible. No hay evidencia de soporte GGUF, llama.cpp ni Ollama, y dado que se trata de una arquitectura con transcoder personalizado, su conversión a esos formatos no está documentada.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gemma2_2b, tc8192, dr20000, sl17793912) | 3.596.081.920 | No especificado (base 8192) | Adaptador transcoder disperso sobre gemma-2-2b | no disponible | HuggingFace, 0 descargas |
| google/gemma-2-2b | ~2,6B (dato publico del modelo base) | 8192 tokens | Transformer denso generativo | Licencia Gemma (condiciones propias) | HuggingFace, ampliamente usado |
| google/gemma-2-2b-it | ~2,6B (dato publico del modelo base) | 8192 tokens | Transformer denso ajustado a instrucciones | Licencia Gemma (condiciones propias) | HuggingFace, ampliamente usado |
| siddharthmb/2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr10000_lr3e-04_bs4_sl14701500 | no disponible | No especificado | Adaptador transcoder disperso, misma familia, dr10000 y lr 3e-04 | no disponible | HuggingFace, colección 2026 Transcoder Adapters |

La comparación con los modelos base es de categoría distinta: gemma-2-2b y gemma-2-2b-it son modelos generativos completos, mientras que este artefacto es un adaptador que depende de ellos. La comparación más significativa es con las otras variantes de la colección 2026 Transcoder Adapters, que comparten arquitectura y difieren en hiperparámetros como el número de pasos de decaimiento (dr10000 frente a dr20000) o el learning rate (3e-04 frente a 8e-04). No se dispone de métricas comparativas publicadas entre esas variantes.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere google/gemma-2-2b (y su tokenizador) para funcionar. Cargarlo de forma aislada no produce un generador de texto utilizable.
- Licencia sin especificar: el repositorio no declara licencia. Además, el modelo base Gemma 2 está sujeto a las condiciones de uso de Google, que incorporan restricciones de uso comercial y obligaciones de atribución que hay que revisar antes de cualquier despliegue.
- Idiomas no documentados: la ficha no indica qué idiomas cubre el adaptador, lo que impide asumir cobertura multilingüe aunque el modelo base la tenga.
- Sin benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas, por lo que no puede compararse en calidad con otros modelos de su tamaño.
- Degradación en tokens relevantes: el acuerdo top-1 cae a 0,6923 y la KL sube a 0,3060 en el subconjunto "interesting", lo que sugiere pérdida de fidelidad precisamente donde más importa.
- Evaluación muy reducida: las métricas se calculan sobre 200 muestras y 34100 tokens, con batch size 4 y una sola época de entrenamiento. La varianza estadística de estas cifras es alta y no permite conclusiones robustas.
- Riesgo de alucinación: no se documenta explícitamente para el adaptador, pero al heredar el comportamiento del modelo base y presentar divergencia respecto a la referencia, cualquier uso generativo arrastra el riesgo de alucinación propio de gemma-2-2b.
- Sesgos: no se publica ningún análisis de sesgos. El corpus de entrenamiento (LMSYS-Chat-1M) es conversacional y puede introducir sesgos propios de los usuarios que lo generaron.
- Trazabilidad confusa del versionado: el nombre incluye marcas como fixlosses, retrain_fixed_losses y un identificador sl17793912, lo que dificulta distinguir esta versión de las anteriores y de las variantes hermanas de la colección.
- Adopción nula verificable: 0 descargas y 0 likes en el momento del análisis, sin issues ni discusiones públicas, lo que limita el soporte comunitario.
- Apto para investigación, no para producción: la ausencia de licencia, de benchmarks y de documentación de despliegue desaconseja su uso en entornos productivos sin una validación propia exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.fixlosses_retrain_fixed_losses_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr20000_sl17793912
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Repositorio GitHub: https://github.com/Sid-MB/transcoder-adapters
- Run de Weights & Biases: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/2efz1isw
- Dataset de entrenamiento: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Coleccion 2026 Transcoder Adapters: https://huggingface.co/collections/siddharthmb/2026-transcoder-adapters
- Variante hermana (dr10000, lr 3e-04): https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr10000_lr3e-04_bs4_sl14701500
- Configuracion de entrenamiento: train_config.yaml en el propio repositorio de HuggingFace
