# siddharthmb/2026.TA.gemma2_2b_sparse_probe_tc32768_l1_0p001_tc32768_decb_l1w0.001_tarbb_lb2.0_ln1_sl15529832

## Resumen

El modelo identificado como `siddharthmb/2026.TA.gemma2_2b_sparse_probe_tc32768_l1_0p001_tc32768_decb_l1w0.001_tarbb_lb2.0_ln1_sl15529832` es un checkpoint de investigación publicado por el usuario siddharthmb (Stanford, según el espacio de W&B vinculado) sobre `google/gemma-2-2b`. No es un modelo de lenguaje convencional listo para producción: es un adaptador de transcoders dispersos (sparse transcoder adapter) entrenado en modo "bridging" contra el modelo de referencia `google/gemma-2-2b-it`. Su propósito es de interpretabilidad mecanística y análisis de circuitos internos, no la generación de texto de alta calidad.

La relevancia de este tipo de artefactos está en que sustituye las capas MLP del modelo base por transcoders dispersos de 32.768 features, lo que permite descomponer la activación del modelo en unidades interpretables y modificar el comportamiento mediante "steering" de features individuales. El checkpoint incluye la rama del adaptador y puede conmutarse a un modelo híbrido (MLPs originales con atención y embeddings del modelo de referencia) mediante `set_transcoders_enabled(False)`.

El repositorio pesa 13,1 GB en safetensors y declara 6.541.122.304 parámetros totales, muy por encima de los 2.600 millones del Gemma 2 2B original: la diferencia corresponde a los parámetros de los transcoders añadidos. Es un modelo de nicho, con 12 descargas y 0 likes en el momento de redactar esta ficha, y requiere las clases de carga propias del repositorio Git del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma2 con transcoder adapters (sparse adaptation, modo bridging) |
| Parametros totales | 6.541.122.304 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE; el checkpoint incluye el modelo base mas los parametros de los transcoders) |
| Longitud de contexto | 8192 tokens (heredada de google/gemma-2-2b; no se especifica en la model card del adaptador) |
| Tipos de cuantizacion | no disponible (solo safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (requiere clases de carga propias del repositorio) |
| Modelo base | google/gemma-2-2b |
| Modelo de referencia | google/gemma-2-2b-it |
| Tokenizer | google/gemma-2-2b-it |
| n_features (transcoder) | 32768 |
| dec_bias | True |
| l1_weight | 0.001 |
| Tamano del repositorio | 13,1 GB |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

El adaptador se construye sobre la arquitectura Gemma 2 y sigue el esquema de "transcoder adapters" del repositorio `Sid-MB/transcoder-adapters`. En lugar de limitarse a un ajuste fino clásico, inserta transcoders de 32.768 features con sesgo de decodificación (`dec_bias: True`) y regularización L1 de 0,001, que fomenta representaciones dispersas: cada token activa un subconjunto reducido de features interpretables. El entrenamiento se realiza en modo "bridging", con el backbone fijado al modelo objetivo (`backbone: target`) y `n_cutoffs: 1`.

La configuración de entrenamiento declarada es: learning rate 0,0008, batch size 1, una sola época, warmup ratio 0,05, función de pérdida KL y pesos `lambda_adapt: 1.0`, `lambda_bridge: 2.0` y `lambda_nmse: 1`. El nombre del checkpoint codifica buena parte de estos hiperparámetros (tc32768, l1_0p001, tarbb_lb2.0, ln1, sl15529832). Los datos de entrenamiento son `science-of-finetuning/fineweb-1m-sample` (corpus de texto general) y `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits` (derivado de LMSYS-Chat-1M, conversacional), lo que sugiere un entrenamiento combinado de texto general y diálogo. No se documentan procesos de RLHF ni DPO; la pérdida KL y el modo bridging apuntan a una destilación del comportamiento del modelo de referencia, no a un ajuste por preferencias.

## Capacidades

- Generación de texto conversacional básica mediante el tokenizer y las clases de carga del repositorio, usando el modelo de referencia `google/gemma-2-2b-it` como guía de comportamiento.
- Descomposición dispersa de activaciones: cada capa sustituida expone 32.768 features con sesgo de decodificación, lo que permite analizar qué unidades se activan ante una entrada.
- Steering de features individuales mediante identificador cantor: `--steer CANTOR_ID:STRENGTH`, es decir, modificación dirigida del comportamiento del modelo sin reentrenar.
- Generación de grafos de atribución (attribution graphs) combinables con GemmaScope y con presupuestos de cómputo configurables.
- Modo híbrido: al desactivar los transcoders (`set_transcoders_enabled(False)`) se obtiene un modelo con los MLP originales y la atención y embeddings del modelo de referencia.
- Interfaz de chat por línea de comandos (`analysis.chat.cli`) con soporte de prompts.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito ("thinking mode").

## Casos de uso

- Investigación en interpretabilidad mecanística: construir grafos de atribución sobre prompts concretos para trazar qué features contribuyen a una predicción, usando la CLI `analysis.attribution.graphs.build_graphs` con los flags de GemmaScope y presupuesto.
- Steering conductual controlado: modificar una feature concreta por su cantor id y medir el efecto sobre la salida, útil para experimentos de causalidad y para identificar features asociadas a un concepto.
- Análisis de circuitos en modelos conversacionales: el entrenamiento sobre `lmsys-chat-1m-splits` permite estudiar cómo se representan internamente turnos de diálogo real, algo relevante para auditar comportamientos en asistentes.
- Comparación de métodos de descomposición: sirve como punto de comparación frente a transcoders de GemmaScope o autoencoders dispersos, variando n_features, L1 y sesgo de decodificación.
- Estudio de adaptación dispersa frente a ajuste fino denso: el modo bridging y las lambdas declaradas permiten experimentos sobre cuánto del comportamiento del modelo de referencia se preserva al sustituir los MLP.
- Detección de features candidatas a revisión de seguridad: la inspección de features activadas ante prompts sensibles es un paso habitual en pipelines de auditoría de modelos antes de su despliegue.
- Docencia y formación: como ejemplo reproducible de cómo se entrena y se publica un artefacto de interpretabilidad sobre un modelo abierto pequeño, con configuración de entrenamiento y run de W&B públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de pérdida o reconstrucción de los transcoders, y la ejecución de W&B enlazada no aporta cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 13,1 GB solo para pesos (coincide con el tamaño del repositorio), más activaciones y caché KV según lote y longitud de contexto; en la práctica, del orden de 14 a 20 GB.
- VRAM estimada en 8 bits: en torno a 7 GB; en 4 bits, en torno a 4 GB, pero no se publican pesos cuantizados, por lo que habría que generarlos manualmente y verificar que las clases de carga personalizadas los soportan.
- GPU recomendadas: A100 40 GB, H100 80 GB o A6000 48 GB para trabajar con holgura en FP16 y lotes mayores.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 de 24 GB en BF16 con lote pequeño; en tarjetas de 16 GB no cabría en BF16, pero sí en 8 bits si la conversión funciona.
- Despliegue: `transformers` con las clases propias del repositorio (`models.auto.load_tokenizer` y `load_transcoder_model`) es la vía documentada; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla. No hay soporte declarado para vLLM, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: no disponible. Cabe esperar que la dispersión de features reduzca el cómputo efectivo respecto a un MLP denso equivalente, pero no se aportan medidas.
- Nota operativa: `device_map="auto"` está soportado en el ejemplo de carga, lo que facilita el reparto entre varias GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gemma2_2b sparse probe) | 6.541.122.304 | 8192 (heredado) | Interpretabilidad y steering sobre Gemma 2 2B | no disponible | 12 descargas, requiere codigo propio |
| google/gemma-2-2b | 2.600 millones aprox. | 8192 | Modelo base de texto | Gemma Terms of Use | Ampliamente disponible |
| google/gemma-2-2b-it | 2.600 millones aprox. | 8192 | Modelo conversacional ajustado por instrucciones | Gemma Terms of Use | Ampliamente disponible |
| Transcoderes de GemmaScope | no disponible | no aplica | Analisis de features del modelo base | no disponible | Publicos como artefactos de interpretabilidad |

La comparación directa con los pesos base no es equivalente: este checkpoint no compite en calidad de generación, sino que añade una capa de análisis sobre Gemma 2 2B. Frente a los transcoders de GemmaScope, la diferencia declarada es el modo bridging y los hiperparámetros concretos de dispersión (32768 features, L1 0,001).

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación sobre interpretabilidad, con 12 descargas y sin evaluaciones publicadas.
- Riesgo de alucinación: al derivar del Gemma 2 2B, hereda los sesgos y errores del modelo base, y el reemplazo de los MLP por transcoders puede degradar la fidelidad de las respuestas.
- No se declara licencia en la model card. Al derivar de `google/gemma-2-2b`, es previsible que apliquen los Gemma Terms of Use, pero conviene verificarlo antes de cualquier uso comercial.
- Idiomas soportados: no disponibles. No hay confirmación de cobertura multilingüe más allá de la del modelo base.
- Dependencia de código externo: la carga requiere las clases de `models.auto` del repositorio `Sid-MB/transcoder-adapters`, por lo que no es un checkpoint estándar de `transformers` y puede romper con actualizaciones de la librería.
- Sin pesos cuantizados publicados: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en hardware de consumo y en runtimes de inferencia habituales.
- Longitud de contexto limitada a 8192 tokens heredados; no se documenta extensión ni ventanas largas.
- Los resultados de steering dependen del identificador cantor de cada feature, que no está documentado en la información disponible; sin catálogo de features, la reproducibilidad de los experimentos queda limitada.
- Sesgos conocidos: no se documenta ningún análisis de sesgo específico de este adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_sparse_probe_tc32768_l1_0p001_tc32768_decb_l1w0.001_tarbb_lb2.0_ln1_sl15529832
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia y tokenizer: https://huggingface.co/google/gemma-2-2b-it
- Repositorio Git: https://github.com/Sid-MB/transcoder-adapters
- Run de W&B: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/dcj7g0oe
- Dataset de texto: https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Dataset conversacional: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Configuración de entrenamiento: `training-config.yaml` dentro del repositorio de HuggingFace

Nota sobre la búsqueda web: los resultados devueltos por el buscador no guardan ninguna relación con este modelo (corresponden a sitios de contenido para adultos) y se han descartado por no ser fuentes válidas. No se han encontrado papers, blogs ni demos adicionales relevantes en la información disponible.
