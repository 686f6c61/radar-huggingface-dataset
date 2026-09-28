# inference-optimization/Qwen3.8-27B-DSpark-GPTQ-IMatrix-PerfectBlend-NVFP4-W4A4

## Resumen

Este repositorio publica un drafter (modelo borrador) de decodificacion especulativa para Qwen/Qwen3.8-27B, derivado de RedHatAI/Qwen3.8-27B-speculator.dspark y cuantizado en NVFP4. Lo mantiene el usuario inference-optimization y su funcion no es generar texto de forma autonoma, sino proponer tokens candidatos que el modelo objetivo valida en paralelo, reduciendo la latencia por token en inferencia autoregresiva.

El checkpoint contiene 1.988.431.617 parametros (~1,99 B) en un repositorio de 1,3 GB y se sirve con vLLM mediante `--spec-model`, acompanando siempre al modelo objetivo. La cuantizacion emplea GPTQ con observador IMatrix expandido, damping de Hessian de 0,1 y esquema W4A4 (pesos y activaciones en 4 bits), calibrada contra 1.892 registros de hidden states alineados con el propio Qwen3.8-27B.

Su relevancia practica esta en dos frentes: acelerar la decodificacion del modelo objetivo y reducir la huella del componente borrador. Ahora bien, el propio autor indica que la evaluacion esta pendiente: no hay resultados de aceptacion, velocidad ni calidad, por lo que a fecha de publicacion es un artefacto con procedencia reproducible, no una mejora validada en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa (metodo DSpark) para Qwen/Qwen3.8-27B; arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 1.988.431.617 (~1,99 B), segun safetensors |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (la ventana efectiva la determina el modelo objetivo Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | NVFP4 GPTQ W4A4 (pesos y activaciones en 4 bits) con observador IMatrix expandido y damping de Hessian 0,1 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, custom_code) |
| Libreria de inferencia | speculators |
| Modelos base | RedHatAI/Qwen3.8-27B-speculator.dspark (rev. 7f33c272e5da240978e0d55767abab8193d74b95) y Qwen/Qwen3.8-27B (rev. 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0) |
| Tamano del repositorio | 1,3 GB |
| Tokens especulativos | 8 (`--spec-tokens 8`) |
| Calibracion | 1.892 registros alineados de hidden states del objetivo; cap de secuencia 2.048; muestra local proporcional de shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated (derivada de mlabonne/open-perfectblend) |
| Estado de evaluacion | pendiente: sin resultados de aceptacion, velocidad ni calidad |

## Arquitectura y entrenamiento

Se trata de un componente drafter para decodificacion especulativa, no de un modelo conversacional. Se apoya en el metodo DSpark y en la libreria `speculators`, y su parent directo es RedHatAI/Qwen3.8-27B-speculator.dspark en la revision `7f33c272...`; el modelo objetivo emparejado es Qwen/Qwen3.8-27B en la revision `1d4bf0f2...`. En la informacion disponible no se detallan el numero de capas, el tipo de atencion ni la composicion del dataset de entrenamiento del drafter, por lo que esos extremos quedan como no disponibles.

La innovacion declarada esta en la cuantizacion: NVFP4 con GPTQ, observador IMatrix expandido y damping de Hessian de 0,1, calibrado especificamente contra hidden states del modelo objetivo en lugar de contra texto plano. La muestra de calibracion es una seleccion local proporcional derivada de `shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated` (a su vez derivada de `mlabonne/open-perfectblend`), no la coleccion PerfectBlend original: se solicitaron 2.048 ejemplos y se usaron 1.892 registros alineados, con cap de secuencia de 2.048. El repositorio incluye en `provenance/quantization/` los comandos de cuantizacion, el manifiesto, los scripts y parches de origen, los metadatos de calibracion y el digest SHA-256 de los pesos publicados; los prompts de calibracion no se redistribuyen.

## Capacidades

- Propuesta de tokens candidatos para decodificacion especulativa sobre Qwen/Qwen3.8-27B, con verificacion posterior por el modelo objetivo.
- Configuracion por defecto de 8 tokens especulativos por paso (`--spec-tokens 8`), ajustable en el arranque del servidor.
- Integracion nativa con vLLM mediante `--spec-model` y `--spec-method dspark`.
- Cuantizacion W4A4 con kernel backend en modo emulacion (`linear_backend: emulation`), sin reclamar soporte nativo de NVFP4 en H100.
- Calibracion target-aware: alineada con hidden states del modelo objetivo, no con texto generico.
- No es un modelo autonomo: no genera respuestas por si solo, no soporta tool calling ni function calling por si mismo y no se documenta thinking mode, vision ni audio.
- Capacidades multilingues: no disponibles en la informacion publicada (dependerian del modelo objetivo).

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar Qwen/Qwen3.8-27B con vLLM y este drafter como `--spec-model` para reducir la latencia por token en cargas de generacion larga, donde el coste dominante es la decodificacion secuencial.
- Servicio de chat de alto QPS: con 8 tokens especulativos por paso, el sistema puede amortizar mejor el coste por peticion en escenarios multi-turno, siempre que la tasa de aceptacion se valide en el entorno real.
- Despliegue en GPUs sin soporte nativo de NVFP4: el backend de emulacion permite ejecutar el drafter en hardware que no implementa NVFP4 en silicio, a cambio de un coste de computo adicional no cuantificado.
- Investigacion en cuantizacion de baja precision: el checkpoint y su carpeta `provenance/quantization/` sirven como caso reproducible para estudiar GPTQ + IMatrix en W4A4 sobre componentes de decodificacion especulativa.
- Estudio de calibracion target-aware: permite comparar el efecto de calibrar con hidden states del objetivo (1.892 registros alineados) frente a calibracion con texto crudo, aislando la variable de calibracion del resto del pipeline.
- Auditoria de procedencia: los comandos, manifiestos, parches y el digest SHA-256 de los pesos permiten reproducir y verificar la cadena de cuantizacion en entornos con requisitos de trazabilidad.
- Experimentacion con distintos presupuestos especulativos: ajustar `--spec-tokens` para buscar el equilibrio entre aceptacion y coste de verificacion en un hardware concreto.
- Evaluacion comparativa interna: usar el checkpoint como linea base cuantizada frente al drafter sin cuantizar de RedHatAI en pruebas propias de aceptacion y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que la evaluacion esta pendiente y que no se incluyen resultados completos de aceptacion, velocidad ni calidad; el checkpoint solo aporta procedencia de cuantizacion, sin validacion de serving ni matriz de evaluacion finalizada.

## Requisitos de hardware

- Drafter en solitario: ~1,3 GB de repositorio y aproximadamente 1,0 GB de pesos NVFP4 (calculo aritmetico a partir de 1,99 B de parametros a 4 bits; no es un dato publicado en la model card).
- El drafter por si solo cabe en cualquier GPU con algo mas de 2 GB de VRAM libre, incluidas integradas y GPUs de gama baja, pero no es util sin el modelo objetivo.
- Sistema completo: requiere cargar ademas Qwen/Qwen3.8-27B. Estimaciones aritmeticas de la huella del objetivo: ~54 GB en BF16, ~27 GB en FP8 y ~14-15 GB en 4 bits. Son calculos orientativos, no datos del repositorio.
- GPU recomendadas: no hay recomendacion oficial en la informacion disponible. Por tamano del objetivo, el sistema completo apunta a A100/H100 de 80 GB para precision alta y a GPUs de 24 GB (RTX 4090, L40S) solo con el objetivo fuertemente cuantizado.
- vLLM es la unica via de despliegue documentada, con `--spec-model`, `--spec-method dspark`, `--spec-tokens 8` y `kernel-config '{"linear_backend":"emulation"}'`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; el autor no aporta mediciones y la evaluacion de velocidad esta pendiente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| inference-optimization/Qwen3.8-27B-DSpark-GPTQ-IMatrix-PerfectBlend-NVFP4-W4A4 (este) | Drafter DSpark para Qwen3.8-27B | 1,99 B | NVFP4 W4A4 (GPTQ + IMatrix) | apache-2.0 | no disponible (evaluacion pendiente) |
| RedHatAI/Qwen3.8-27B-speculator.dspark | Drafter DSpark original | no disponible | precision original no disponible | no disponible | no disponible |
| Drafter estilo EAGLE-3 / Medusa para modelos de ~27 B | Cabezas o drafters de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.8-27B (modelo objetivo) | Modelo generativo completo | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

La comparacion directa mas informativa es contra el propio drafter de RedHatAI sin cuantizar, ya que comparten origen; sin embargo, no hay datos publicos en esta informacion sobre parametros, tasa de aceptacion ni licencia de esa variante, ni sobre alternativas EAGLE-3 o Medusa para este mismo objetivo.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Qwen/Qwen3.8-27B en la revision indicada para funcionar. No puede usarse como chatbot por si solo.
- Evaluacion pendiente: sin datos de tasa de aceptacion, velocidad ni degradacion de calidad. No hay evidencia publicada de que la cuantizacion NVFP4 preserve el comportamiento del drafter original.
- El ejemplo de serving usa el backend de emulacion de vLLM y el autor declara explicitamente que no se reclama soporte nativo de NVFP4 en H100; el rendimiento real en ese hardware es incierto.
- Inconsistencia de metadatos: entre los tags del repositorio aparece `8-bit`, mientras que el nombre del modelo, la descripcion y el esquema de cuantizacion indican NVFP4 (4 bits). Conviene verificar el config real antes de integrarlo.
- Calibracion derivada: la muestra proviene de `shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated`, derivada a su vez de `mlabonne/open-perfectblend`, y no de la coleccion PerfectBlend original. Se solicitaron 2.048 ejemplos y solo 1.892 registros alineados estaban disponibles, lo que limita la cobertura de la calibracion.
- Los datos de calibracion (prompts) no se redistribuyen; solo se publican metadatos, comandos y digests. La reproducibilidad exacta de la calibracion queda por tanto condicionada.
- Sesgos: no hay evaluacion de sesgos para este drafter. Al operar sobre Qwen/Qwen3.8-27B, hereda los sesgos y alucinaciones del modelo objetivo.
- Idiomas: no se declara ninguna lista de idiomas soportados; el comportamiento multilingue dependera integramente del objetivo.
- Licencia: el drafter es apache-2.0, pero el uso comercial del sistema completo depende tambien de la licencia del modelo objetivo Qwen/Qwen3.8-27B y del drafter original de RedHatAI.
- Adopcion nula: 0 descargas y 0 likes, sin validacion por parte de la comunidad y con actualizacion posterior a la creacion en apenas unos segundos (2026-09-28), lo que sugiere una publicacion automatizada o de prueba.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inference-optimization/Qwen3.8-27B-DSpark-GPTQ-IMatrix-PerfectBlend-NVFP4-W4A4
- Drafter base (RedHatAI): https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo objetivo (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibracion derivado: https://huggingface.co/shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated
- Dataset de origen de la mezcla: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Procedencia de cuantizacion (dentro del repositorio): `provenance/quantization/`
