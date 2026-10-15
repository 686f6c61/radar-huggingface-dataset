# Interchained/Muse-Glimmer-30B-GGUF

## Resumen

Muse-Glimmer-30B-GGUF es una coleccion de conversiones a formato GGUF del modelo Muse-Glimmer-30B, publicado originalmente por Meta. La coleccion ha sido preparada por el usuario Interchained a partir de los pesos safetensors oficiales, empleando la herramienta Hearth para la conversion y llama.cpp para la cuantizacion. No se trata de un modelo nuevo ni de un fine-tune: el autor insiste en que la arquitectura y los pesos aprendidos son los de Meta, y que su aportacion se limita a la conversion y cuantizacion.

El modelo base tiene aproximadamente 27.854.794.240 parametros (unos 27,85 mil millones, pese al nombre comercial "30B"), 52 bloques transformer, un vocabulario de 202.048 entradas y una longitud de contexto configurada de 131.072 tokens. Se distribuye bajo licencia Apache 2.0 y esta orientado exclusivamente al ingles.

Su relevancia radica en que facilita la inferencia local: el repositorio ofrece seis variantes cuantizadas (desde BF16 hasta Q4_0) que permiten ejecutar el modelo en hardware de gama alta para consumidores o en GPUs de datacenter como la Tesla V100 de 32 GB, sobre la que el autor realizo pruebas de humo. Sin embargo, la coleccion no incluye el proyector multimodal (`mmproj`), por lo que no cubre entrada de imagen, y exige una version reciente de llama.cpp con soporte explicito para esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (52 bloques); decodificador, detalles de atencion no disponibles |
| Parametros totales | 27.854.794.240 (~27,85 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 131.072 tokens configurados |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (V3); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo base como un transformer de 52 bloques con un vocabulario de 202.048 entradas y 731 tensores en su conversion a GGUF. No se especifican en la documentacion proporcionada los detalles de atencion (numero de cabezas, dimensiones, uso de atencion lineal o decodificacion especulativa), ni si se trata de una arquitectura densa o de mezcla de expertos. Tampoco se detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones.

En cuanto a la aportacion de esta ficha, el autor documenta un proceso de conversion reproducible: partiendo de los safetensors de `meta-models/Muse-Glimmer-30B` (unos 55,46 GiB descargados), se genero un maestro BF16 con Hearth y, a partir de el, cada variante cuantizada con `llama-quantize` de llama.cpp (`0.6.0-dev`, build `11484`, commit `d625d3700`). Ninguna variante se recuantizo desde otra cuantizacion. Se empleo Python 3.12 y Transformers actualizado para soportar el tokenizer del modelo (`TokenizersBackend`). El autor advierte que la conversion y la cuantizacion pueden alterar la precision numerica y los resultados.

## Capacidades

- Generacion de texto y conversacion en ingles mediante una plantilla de chat nativa ATEM.
- Manejo de contexto largo: hasta 131.072 tokens configurados (las pruebas de humo se hicieron con 4.096).
- Inferencia local en formatos GGUF optimizados para llama.cpp.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integracion en servicios servidos con backends compatibles.
- Ejecucion CPU/GPU mediante llama.cpp segun la cuantizacion elegida.
- No incluye capacidades de vision: los GGUF publicados no incorporan el proyector multimodal (`mmproj`).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de 32 GB: el autor verifico las cinco variantes cuantizadas en una Tesla V100 de 32 GB con una plantilla ATEM, generando respuestas coherentes de una frase con `finish_reason: "stop"`. Es un escenario realista para desarrolladores que quieran ejecutar un modelo de ~28B en hardware de datacenter de generacion anterior.
- Despliegue en GPUs de consumo: las variantes Q4_K_M (15,76 GiB de carga tensorial) y Q4_0 (14,92 GiB) son las mas adecuadas para GPUs con 16-24 GB de VRAM, priorizando memoria frente a maxima precision.
- Procesamiento de documentos largos: con 131.072 tokens de contexto configurado, el modelo puede emplearse en tareas de resumen, extraccion o pregunta-respuesta sobre corpus extensos, siempre que el backend gestione correctamente la ventana completa.
- Pipelines offline o en entornos aislados (air-gapped): al ser pesos GGUF autocontenidos y sin dependencia de APIs en la nube, encaja en despliegues donde no se permite salida a Internet.
- Experimentacion e investigacion en cuantizacion: la coleccion sirve como referencia para comparar como afectan Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 a la calidad de salida (aunque el autor no ha realizado una evaluacion comparativa controlada).
- Servicio de chat en ingles a bajo coste: gracias al soporte de llama.cpp y a la etiqueta `endpoints_compatible`, puede integrarse tras un servidor de inferencia para asistentes conversacionales en ingles.
- Base para conversiones adicionales: al publicarse el maestro BF16, otros desarrolladores pueden derivar nuevas cuantizaciones o formatos sin partir de los safetensors originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta pruebas de humo (carga correcta, generacion de una respuesta coherente y terminacion con `finish_reason: "stop"`) realizadas en una Tesla V100 de 32 GB con contexto de 4.096 tokens. No se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput/latencia por token.

## Requisitos de hardware

- VRAM estimada para inferencia (carga tensorial, orientativa y sin contar cache KV): BF16 ~55,7 GB; Q8_0 ~27,57 GiB; Q6_K ~21,28 GiB; Q5_K_M ~18,44 GiB; Q4_K_M ~15,76 GiB; Q4_0 ~14,92 GiB.
- GPU recomendadas: Tesla V100 32 GB (verificada por el autor); se puede extrapolar a A100 40/80 GB para BF16 o Q8_0, y a GPUs de 24 GB (RTX 3090/4090) para Q4_K_M y Q4_0 si se ajusta bien la cache KV.
- Cabe en GPU de consumo: si, con las cuantizaciones Q4_K_M y Q4_0 en GPUs de 16-24 GB; las variantes de mayor precision exceden esas capacidades.
- Opciones de despliegue: llama.cpp (backend de referencia del repositorio). Otros motores no se documentan en la informacion disponible; se requiere una version reciente con soporte explicito para la arquitectura Muse-Glimmer (build 11484 o superior).
- Latencia y throughput estimados: no disponibles. El autor senala que Q4_0 obtuvo la decodificacion mas rapida en una unica ejecucion local, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye tablas comparativas con otros modelos de la misma categoria, ni datos de rendimiento de alternativas que permitan una comparacion rigurosa. La unica referencia directa es el propio modelo base `meta-models/Muse-Glimmer-30B`, del que este repositorio es una conversion cuantizada.

## Limitaciones y advertencias

- Son cuantizaciones: reducen precision y pueden alterar las salidas del modelo. El impacto depende de la tarea y no se ha evaluado de forma comparativa.
- Solo texto: los GGUF publicados no incluyen el proyector multimodal (`mmproj`); para entrada de imagen hay que acudir a una distribucion upstream con soporte documentado.
- Solo ingles: el modelo esta etiquetado exclusivamente para el idioma ingles.
- Requiere una version reciente de llama.cpp con soporte explicito para Muse-Glimmer; versiones antiguas pueden rechazar la arquitectura.
- Necesidad de usar la plantilla de chat nativa ATEM: el autor observo que una plantilla generica provocaba repeticion de texto hasta el limite de tokens.
- El contexto probado fue de 4.096 tokens, no los 131.072 configurados; el uso del contexto completo incrementa los requisitos de VRAM/RAM.
- Integridad de pesos: para metadatos sin hashes upstream publicados, el autor registro SHA-256 calculados localmente, no checksums autenticados contra la fuente.
- Licencia Apache 2.0 heredada del modelo base, con atribucion a Meta; la conversion no introduce cambios intencionales de entrenamiento.
- Riesgo de sesgos y alucinacion: no documentado en la informacion proporcionada, aunque son riesgos habituales en modelos generativos de esta categoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Interchained/Muse-Glimmer-30B-GGUF
- Modelo base (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta Hearth: https://github.com/aiassistsecure/hearth
- llama.cpp: https://github.com/ggml-org/llama.cpp
