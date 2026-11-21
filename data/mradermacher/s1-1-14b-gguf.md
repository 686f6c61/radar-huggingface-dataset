# mradermacher/s1.1-14B-GGUF

## Resumen

s1.1-14B-GGUF es la distribucion en formato GGUF del modelo s1.1-14B, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo original procede de simplescaling/s1.1-14B, un ajuste fino supervisado (SFT) construido sobre Qwen2.5-14B-Instruct mediante TRL, orientado a razonamiento y generacion conversacional. Esta version GGUF no aporta cambios en los pesos mas alla de la cuantizacion y existe para permitir su ejecucion en llama.cpp, Ollama y otros motores compatibles con este formato.

El interes practico del repositorio radica en que ofrece un abanico amplio de cuantizaciones estaticas (desde Q2_K hasta Q8_0), lo que permite desplegar un modelo de aproximadamente 14.770 millones de parametros en hardware muy diverso, desde GPUs de consumo con 8-12 GB de VRAM hasta estaciones de trabajo con 24 GB o mas. El repositorio ocupa 102,0 GB en total al incluir todas las variantes, aunque cada archivo individual pesa entre 5,9 GB y 15,8 GB.

La ficha se centra en lo que se puede verificar a partir de la informacion disponible: arquitectura heredada de Qwen2.5, licencia no declarada en el repositorio de cuantizacion, idioma principal ingles y ausencia de datos de benchmarks publicados en la model card del cuantizador. Cualquier evaluacion de calidad debe remitirse al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles declarado; el modelo base Qwen2.5 soporta mas idiomas, pero no se declara aqui) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen2.5, con 14.770.033.664 parametros totales, segun los datos de safetensors del modelo base. El ajuste fino se realizo con TRL mediante SFT (supervised fine-tuning) sobre la base Qwen2.5-14B-Instruct, segun las etiquetas del repositorio (`generated_from_trainer`, `trl`, `sft`). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas posteriores de RLHF o DPO.

La innovacion tecnica de este repositorio es exclusivamente la cuantizacion: se ofrecen variantes estaticas en formato GGUF compatibles con llama.cpp. El autor indica que no ha publicado cuantizaciones ponderadas con imatrix para este modelo en el momento de la ficha, y que las variantes IQ disponibles se limitan a IQ4_XS. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de pensamiento extendido en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste sobre Qwen2.5-14B-Instruct.
- Razonamiento y resolucion de problemas de tipo SFT, segun la naturaleza del entrenamiento declarado.
- Generacion de codigo y matematicas: capacidad esperable por la base Qwen2.5, aunque no se documenta explicitamente en la model card del cuantizador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`language: en`).
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo: con la variante Q4_K_M (9,1 GB) el modelo cabe en GPUs de consumo de 12 GB o mas y permite ejecutar un modelo de 14,7B parametros sin depender de la nube, util para prototipado y pruebas de razonamiento.
- Despliegue en portatiles con GPU modesta: la variante Q3_K_S (6,8 GB) o Q2_K (5,9 GB) permite ejecutar el modelo en equipos con 8 GB de VRAM, a costa de una perdida de calidad asumible en tareas de generacion general.
- Servicio de chat en ingles para entornos controlados: el modelo esta ajustado para conversacion y declarado en ingles, por lo que encaja en asistentes internos de habla inglesa desplegados con llama.cpp u Ollama.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre una misma base.
- Integracion en pipelines de CI para pruebas de regresion de prompts: al ser GGUF estatico y reproducible, se puede fijar una version concreta (por ejemplo Q5_K_M, 10,6 GB) y ejecutar baterias de evaluacion sin cambios en los pesos.
- Fine-tuning posterior sobre la base original: si se necesita adaptar el modelo, conviene partir de simplescaling/s1.1-14B en safetensors y usar las cuantizaciones GGUF solo para inferencia, ya que el formato GGUF no es adecuado para reentrenamiento directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del archivo GGUF y overhead de contexto):
  - Q2_K: ~6 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~7-8 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~8,5-9,5 GB
  - Q5_K_S / Q5_K_M: ~10,5-11 GB
  - Q6_K: ~12,5 GB
  - Q8_0: ~16 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 24 GB, A100 40/80 GB, H100 80 GB.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB con Q4_K_M; en GPUs de 8 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| s1.1-14B-GGUF (este) | 14,77B | no disponible | GGUF | no disponible | Cuantizaciones estaticas de s1.1-14B |
| simplescaling/s1.1-14B | 14,77B | no disponible | safetensors | no disponible | Modelo base original, ajuste SFT sobre Qwen2.5-14B-Instruct |
| Qwen2.5-14B-Instruct | 14,77B | no disponible en esta ficha | safetensors, GGUF | Qwen (no verificada aqui) | Base del ajuste; referencia de capacidades |
| Otros modelos de ~14B con GGUF | ~13-15B | variable | GGUF | variable | No se dispone de comparativa de rendimiento verificada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio de cuantizacion; antes de un uso comercial debe verificarse la licencia del modelo base simplescaling/s1.1-14B y de Qwen2.5.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y puede degradarse respecto al modelo base.
- No hay benchmarks publicados en la informacion disponible, por lo que la calidad real del ajuste SFT no puede evaluarse con datos objetivos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El autor no ha publicado cuantizaciones ponderadas con imatrix, lo que limita la calidad de las variantes pequenas frente a alternativas con imatrix.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- El repositorio ocupa 102,0 GB en total; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/s1.1-14B-GGUF
- Modelo base: https://huggingface.co/simplescaling/s1.1-14B
- Pagina de descargas del autor: https://hf.tst.eu/model#s1.1-14B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
