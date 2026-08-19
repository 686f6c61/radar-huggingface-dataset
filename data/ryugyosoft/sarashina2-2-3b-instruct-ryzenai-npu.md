# ryugyosoft/sarashina2.2-3b-instruct-ryzenai-npu

## Resumen

Sarashina2.2-3B-Instruct for Ryzen AI NPU es una conversión del modelo japonés `sbintuitions/sarashina2.2-3b-instruct-v0.1` al formato ONNX con cuantización INT4, optimizado para ejecutarse en la NPU AMD Ryzen AI (arquitectura XDNA). El autor, ryugyosoft, lo publica para cubrir la ausencia de modelos especializados en japonés en el ecosistema de AMD, ya que los modelos oficiales como Qwen2.5 tienden a mezclar vocabulario chino o inglés en las traducciones. El modelo se ejecuta mediante OnnxRuntime GenAI (OGA) y está pensado para tareas de generación de texto y traducción EN→JA en entornos con aceleración NPU.

La conversión se realizó con la opción `--npu --basic` porque la arquitectura del modelo original tiene `head_dim = 160`, valor no soportado por los kernels NPU precompilados de AMD (que solo admiten 64 y 128). Esto implica que no se usan kernels de atención fusionada, lo que penaliza la velocidad de generación respecto a los modelos híbridos oficiales. El repositorio incluye el modelo ONNX, el tokenizer en formato JSON y un `genai_config.json` con los ajustes necesarios para su ejecución. La licencia es MIT, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Sarashina2.2) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (conversion ONNX) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (con tokenizer.json y genai_config.json) |

## Arquitectura y entrenamiento

El modelo base es Sarashina2.2-3B-Instruct, un transformer decoder-only de 3 mil millones de parametros desarrollado por SB Intuitions. Segun los datos de la model card, la configuracion interna incluye `hidden_size = 2560`, `num_heads = 16` y `head_dim = 160` (2560/16). Esta dimension de cabeza es la razon por la que los kernels NPU precompilados de AMD (que solo soportan 64 y 128) no funcionan con este modelo, obligando a usar la opcion `--npu --basic` que desactiva la atencion fusionada.

No se proporcionan detalles sobre el entrenamiento del modelo original (numero de tokens, dataset, metodos de alineacion como RLHF o DPO) en la informacion disponible. La conversion a ONNX/INT4 es puramente tecnica: se cuantizan los pesos y se adapta el formato para la NPU, sin modificar los pesos ni realizar entrenamiento adicional.

## Capacidades

- Generacion de texto en japones e ingles con instrucciones (modelo instruct).
- Traduccion de ingles a japones, con calidad notablemente superior a Qwen2.5-3B en ejemplos publicados por el autor.
- Conversacion multi-turno (etiquetado como conversational).
- Ejecucion en NPU AMD Ryzen AI mediante OnnxRuntime GenAI.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion automatica ingles→japones en entornos con NPU AMD: el modelo produce traducciones naturales sin mezclar vocabulario chino o ingles, como demuestran los ejemplos de la model card. Puede integrarse en aplicaciones de escritorio o servicios locales que requieran baja latencia y privacidad.
- Asistente conversacional en japones: al ser un modelo instruct, puede mantener dialogos en japones para atencion al cliente, soporte tecnico o chatbots educativos, aprovechando la NPU para reducir el consumo de CPU/GPU.
- Generacion de contenido en japones: redaccion de correos, documentos, resumenes o textos creativos, con la ventaja de ejecutarse en hardware de bajo consumo.
- Prototipado de aplicaciones NLP en dispositivos con Ryzen AI: desarrolladores que quieran experimentar con modelos japoneses en NPU sin depender de servicios en la nube.
- Sistema de traduccion en tiempo real para videollamadas o transcripciones: aunque la velocidad es menor que los modelos hybrid de AMD (2.45 s por frase), puede ser suficiente para uso asincrono.
- Investigacion y educacion: comparacion de rendimiento entre modelos cuantizados para NPU y sus versiones originales, o estudio de tecnicas de cuantizacion INT4 en arquitecturas con head_dim no estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una comparacion cualitativa de traduccion ingles→japones frente a Qwen2.5-3B (modelo oficial de AMD), que se reproduce a continuacion:

| Texto original | Sarashina2.2-3B (este modelo) | Qwen2.5-3B (AMD oficial) |
|---|---|---|
| The meeting is scheduled for three o'clock tomorrow afternoon. | 会議は明日の午後3時に予定されています。 | 三時**明天**の **afternoon** に会議が予定されています。 |
| Please submit the documents by next Monday. | 次の月曜日までに書類を提出してください。 | **日付まで**次の月曜日に文書を提出してください。 |
| Speech recognition accuracy has improved significantly. | **音声認識**の精度は大幅に向上した。 | **会話認識**の精度は大幅に向上しました。 |
| We need to postpone the release until the security review is complete. | 私たちは、セキュリティ審査が完了するまで、リリースを延期する必要がある。 | 延期してセキュリティレビューが終わるまで発売を控えましょう。 |

Ademas, el autor indica una velocidad de generacion medida en su entorno (Ryzen AI 9 HX 370, XDNA 2): mediana de 2.45 segundos por frase, frente a 1.30 segundos del Qwen2.5-3B hybrid. Este dato es una medida puntual, no un benchmark estandarizado.

## Requisitos de hardware

- Hardware objetivo: NPU AMD Ryzen AI (XDNA o XDNA 2). El entorno de prueba fue un AMD Ryzen AI 9 HX 370 (Strix Point) con NPU XDNA 2.
- Software necesario: Ryzen AI Software 1.8.0 (o compatible) y onnxruntime-genai 0.14.0 (build directml-ryzenai).
- El modelo puede ejecutarse tambien en CPU, aunque no se especifican requisitos minimos de RAM o VRAM. El tamano del repositorio es de 3.7 GB, por lo que se necesita al menos esa cantidad de almacenamiento y memoria suficiente para cargar los pesos cuantizados (estimable en ~1.5-2 GB para INT4 de 3B, pero no confirmado por el autor).
- No se indica soporte para GPU NVIDIA o AMD discretas; el modelo esta disenado especificamente para la NPU de AMD.
- Despliegue: mediante OnnxRuntime GenAI, con las advertencias indicadas en la model card (tokenizer no compatible con OGA, hay que usar la libreria `tokenizers` de Rust, y desactivar `hybrid_opt_npu_read_ahead`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Sarashina2.2-3B-Instruct (base) | 3B | no disponible | MIT | safetensors (probablemente) | Modelo original sin cuantizar, ejecutable en GPU/CPU |
| Sarashina2.2-3B-Instruct RyzenAI NPU (este) | 3B | no disponible | MIT | ONNX INT4 | Optimizado para NPU AMD, con limitaciones de tokenizer y velocidad |
| Qwen2.5-3B (AMD oficial) | 3B | no disponible (comunmente 32k, no confirmado) | Apache 2.0 (comun) | ONNX (hybrid) | Modelo oficial de AMD para NPU, mejor velocidad pero peor traduccion EN→JA |

La comparativa se basa en los datos de la model card. No se dispone de informacion sobre el contexto exacto de cada modelo ni de otros modelos comparables en el mismo segmento.

## Limitaciones y advertencias

- El tokenizer de Sarashina2.2 es de tipo Unigram (sentencepiece), que OnnxRuntime GenAI no puede leer directamente. Es necesario usar la libreria `tokenizers` (Rust) y pasar los IDs al generador manualmente.
- El modelo se convirtio con `--npu --basic`, lo que desactiva la atencion fusionada y resulta en una velocidad de generacion inferior (2.45 s por frase) frente a los modelos hybrid de AMD (1.30 s).
- Es imprescindible desactivar `hybrid_opt_npu_read_ahead` en `genai_config.json`; de lo contrario, se produce un error de carga de pesos (`Weights not loaded in ...`).
- La calidad de traduccion se ha evaluado solo con ejemplos puntuales del autor; no hay benchmarks estandar que respalden su rendimiento general.
- Al ser un modelo de 3B, su capacidad de razonamiento y generacion de codigo es limitada en comparacion con modelos de mayor tamano.
- No se mencionan sesgos especificos, pero el modelo base puede heredar sesgos de sus datos de entrenamiento (no documentados en esta ficha).
- La licencia MIT permite uso comercial sin restricciones, pero los derechos del modelo original pertenecen a SB Intuitions.

## Enlaces

- Repositorio del modelo: [ryugyosoft/sarashina2.2-3b-instruct-ryzenai-npu](https://huggingface.co/ryugyosoft/sarashina2.2-3b-instruct-ryzenai-npu)
- Modelo base: [sbintuitions/sarashina2.2-3b-instruct-v0.1](https://huggingface.co/sbintuitions/sarashina2.2-3b-instruct-v0.1)
- No se proporcionan enlaces a papers, blogs o demos adicionales en la informacion disponible.
