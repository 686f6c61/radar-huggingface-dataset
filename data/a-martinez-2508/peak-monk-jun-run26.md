# A-Martinez-2508/peak-monk-jun-run26

## Resumen

`A-Martinez-2508/peak-monk-jun-run26` es un adaptador LoRA experimental en formato MLX para conversacion de personaje en primera persona, entrenado sobre una conversion comunitaria a 4 bits de Qwen3-4B-Base. No es un modelo autonomo: es un adaptador que requiere descargar por separado el peso base fijado al commit `76aa803fb5ee833aead9414f16f0708c901c21f7`, y no es compatible con checkpoints Transformers/PEFT. El autor lo publica como checkpoint de investigacion sin evaluar, con el objetivo declarado de mantener una conversacion de personaje estable y responsiva sin necesidad de un system prompt de persona.

El adaptador corresponde al paso 128 del run26, pesa 142.063.861 bytes, contiene factores heredados de entrenamientos de personaje anteriores y actualiza 11.010.048 parametros en las doce capas superiores del transformer, preservando los factores de las capas inferiores y de los embeddings. El entrenamiento se hizo integramente en un Apple M2 con 8 GB de memoria unificada, usando 128 actualizaciones de preferencia offline sobre 95 pares revisados, 116 ejemplos de retencion, DPO con beta 0,1, peso NLL de la respuesta elegida 0,2 y tasa de aprendizaje 1e-5. El proceso completo duro 45,41 minutos y alcanzo un pico de 2,735 GB de asignacion de MLX.

Su relevancia es acotada y muy especifica: documenta un flujo de trabajo de ajuste de personaje reproducible en hardware de consumo (un Mac de 8 GB) con trazabilidad de checksums, configuracion y provenance. Al mismo tiempo, el propio autor advierte que no hay evaluacion conversacional completada ni aceptacion de release, que ningun checkpoint del proyecto ha superado los criterios finales y que la deriva en conversaciones largas sigue siendo el riesgo central. Es material de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA; modelo base cuantizado a 4 bits y ejecutado con MLX |
| Parametros totales | No aplicable al adaptador como modelo autonomo. El modelo base es Qwen3-4B-Base (denominacion de aproximadamente 4.000 millones de parametros). El adaptador pesa 142.063.861 bytes y actualiza 11.010.048 parametros en las doce capas superiores |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible el maximo del modelo base. La implementacion de chat incluida limita el historial de entrada a 2.048 tokens y cada respuesta a 160 tokens generados |
| Tipos de cuantizacion | Peso base en 4 bits (conversion MLX de la comunidad, no reproducida de forma independiente); adaptador LoRA en la precision resultante del entrenamiento |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Adaptador LoRA en formato MLX (no es un checkpoint Transformers/PEFT ni un modelo autonomo); requiere el peso base descargado por separado |
| SHA256 del adaptador final | 920c7a782a6c55406290fcc8404dcd9fa0a8d23997e7f09ce57dd2bcababa059 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-4B-Base, un transformer decoder-only, en su conversion comunitaria a 4 bits para MLX. La relacion declarada es `base_model_relation: adapter`, de modo que la construccion de modulos la describe el `adapter_config.json` heredado, mientras que `train26.json` y `training-metadata.json` recogen la optimizacion efectiva de esta ejecucion. El run26 actualiza las doce capas superiores (frente a seis en el run25) y conserva los factores de capas inferiores y embeddings procedentes de entrenamientos de personaje previos. La ventana de historias de entrenamiento se limito a 2.048 tokens.

El entrenamiento consistio en 128 actualizaciones de preferencia offline sobre 95 pares de preferencia revisados por el autor mas 116 ejemplos de retencion, con DPO beta 0,1, peso NLL de la respuesta elegida 0,2, peso de retencion 1, tasa de aprendizaje 1e-5 y semilla 293. El material es ficcion sintetica original: historias de conversacion generadas por estudiantes con respuestas finales alternativas revisadas por el autor. Los monjes historicos y ficticios se declaran influencias, no fuentes de citas inventadas atribuidas, y no se clono la voz de ningun monje real. Todo el trabajo se ejecuto en local en un Apple M2 con 8 GB de memoria unificada, con los trabajos de modelo serializados y un pico de 2,735 GB de asignacion MLX.

## Capacidades

- Generacion de texto conversacional en primera persona con una persona de personaje fija ("Jun", monje de montana ficticio), sin necesidad de un system prompt de persona.
- Conversacion multi-turno de caracter interpretativo dentro de la ficcion, con historial de entrada limitado a 2.048 tokens en la implementacion probada.
- Respuestas cortas: la implementacion local limita cada respuesta a 160 tokens generados.
- Ejecucion local en Apple Silicon mediante MLX, con entorno Python y `requirements.lock` proporcionados por el repositorio de investigacion.
- Restauracion verificada: el script de restauracion comprueba checksums, descarga el peso base exacto e instala las anulaciones de plantilla ChatML/EOS incluidas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible. El autor indica explicitamente que se trata de un adaptador de texto y no de un modelo de voz full-duplex, y que los experimentos separados con Moshi no confieren capacidades de habla a este checkpoint.

## Casos de uso

- Investigacion sobre ajuste de personaje con DPO: el adaptador y su metadata permiten reproducir un ciclo de preferencias offline sobre un personaje ficticio concreto, con pares de preferencia documentados y resultados auditables.
- Ajuste fino en hardware de consumo: sirve como referencia de que es viable entrenar un LoRA de personaje sobre un base de 4B cuantizado a 4 bits en un Mac con 8 GB de memoria unificada, con picos de 2,735 GB.
- Experimentos de dialogo sin system prompt: util para estudiar hasta que punto una persona puede codificarse en los pesos del adaptador en lugar de en el prompt, evitando la friccion de mantener un prompt de personaje largo.
- Prototipado de personajes para narrativa interactiva: el modelo mantiene conversaciones en primera persona dentro de una ficcion, apropiado para demos locales de escritura asistida o ficcion ramificada.
- Docencia y ejercicios de etica de IA: el autor enmarca el experimento como conversacion de personaje sin reclamar conciencia ni creencias subjetivas, lo que lo hace util para discutir los limites entre simulacion de personaje y atribucion de estados mentales.
- Auditoria de metodologia de evaluacion: el proyecto conserva capturas crudas de evaluacion y ejecuciones abortadas, util como caso practico de como documentar fallos, criterios de aceptacion y guardas de presion de memoria.
- Reproduccion de artefactos de investigacion: el script de restauracion con verificacion de checksums y commit fijado del base permite reconstruir exactamente el entorno, interesante para trabajos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el run26 no tiene evaluacion conversacional completada ni aceptacion de release, y que las puntuaciones existentes no describen este checkpoint. Se recogen aqui solo como contexto historico del proyecto, no como rendimiento del modelo publicado:

| Checkpoint o base | Suite | Resultado | Nota |
|---|---|---|---|
| Base de texto sin modificar | Suite de desarrollo del proyecto | 2/20, CE 3,892766 | Contexto historico |
| Run25 step128 | Suite de desarrollo del proyecto | 16/20 | Fallo en el lore de personaje requerido |
| Run20 | Suite de desarrollo del proyecto | 17/20 | Fallo en las auditorias final y de presion posteriores |
| Run26 step128 | Sin evaluacion | No disponible | Evaluacion detenida por la guarda de presion de memoria de macOS |

Todas estas son auditorias del mismo autor, no benchmarks publicos independientes ni ciegos, y la suite de desarrollo se ha inspeccionado repetidamente durante la investigacion. La entropia cruzada es una medida diagnostica, no un porcentaje de acierto conversacional. Ningun checkpoint del proyecto ha superado los criterios completos de release.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: el peso base en 4 bits ocupa 2.263.022.529 bytes y el adaptador 142.063.861 bytes, de modo que el conjunto ronda los 2,4 GB de pesos; con overhead de runtime, un presupuesto de 4 a 6 GB es razonable. El entrenamiento del run26 alcanzo un pico de 2,735 GB de asignacion MLX.
- Hardware de referencia: el autor entreno y ejecuto todo en un Apple M2 con 8 GB de memoria unificada.
- GPU recomendadas: no disponible para CUDA. El adaptador esta en formato MLX y el flujo documentado es para Apple Silicon; no se documenta soporte para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: el modelo base cuantizado a 4 bits cabe en GPUs de consumo con 8 GB o mas de VRAM, pero el adaptador publicado es especifico de MLX, asi que su uso directo queda ligado a Apple Silicon salvo reconversion manual no documentada.
- Opciones de despliegue: `mlx` con el repositorio `peak-monk`, ejecutando `scripts/restore_release.py` y despues `scripts/chat.py --adapter adapters/run26-step0128`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible para este adaptador. Como referencia separada, los experimentos nativos de voz con Moshi del mismo repositorio registraron una generacion protegida unas 39,45 veces mas lenta que el tiempo real, dato que no aplica a este checkpoint de texto.
- Advertencia de plataforma: la evaluacion y los intentos de exportacion se detuvieron en la guarda de presion de memoria de macOS. La implementacion de chat aborta ante una entrada demasiado grande en lugar de truncarla de forma silenciosa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peak-monk-jun-run26 (este adaptador) | Adaptador de 142.063.861 bytes sobre Qwen3-4B-Base; actualiza 11.010.048 parametros | No disponible; implementacion limitada a 2.048 tokens de historial y 160 de respuesta | LoRA MLX | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| johnlakness/Qwen3-4B-Base-mlx-4Bit (base) | Aproximadamente 4.000 millones | No disponible en la informacion proporcionada | MLX, 4 bits, 2.263.022.529 bytes | No disponible | Modelo base de comunidad, commit fijado |
| Adaptadores LoRA de personaje genericos sobre bases de 3B a 4B | Tipicamente decenas o centenas de millones de parametros entrenables | Depende del base | PEFT safetensors o GGUF en la mayoria de casos | Variable | Amplia disponibilidad en HuggingFace |

La comparacion con alternativas de la misma categoria es limitada: no se dispone de datos de benchmarks publicos, ni de contexto maximo del base, ni de resultados de evaluacion del run26 que permitan un cotejo cuantitativo honesto con otros adaptadores de personaje. La diferencia principal frente a un adaptador PEFT convencional es el formato MLX y la exigencia de un base concreto cuantizado a 4 bits.

## Limitaciones y advertencias

- Checkpoint de investigacion sin evaluar: el run26 no tiene evaluacion conversacional completada ni aceptacion de release. El autor lo publico y respaldo antes de terminar la evaluacion.
- No es un modelo autonomo: es un adaptador que depende de un peso base concreto. No se debe sustituir por un modelo instruct ni por una plantilla de tokenizer sin modificar.
- No es un checkpoint Transformers/PEFT: no se puede cargar con los flujos habituales de PEFT sin conversion, no documentada.
- Deriva en conversaciones largas: la propia model card lo senala como el riesgo central del proyecto.
- Limites de la implementacion: historial de entrada de 2.048 tokens y 160 tokens generados por respuesta. Esto describe la implementacion probada, no el maximo del modelo base.
- Sin capacidades de voz: el adaptador es de texto. Los experimentos separados con Moshi no le confieren habla y su ultimo candidato fallo la criba de preservacion.
- Riesgo de alucinacion: no cuantificado. No hay evaluacion de fidelidad ni de tasa de invencion de hechos; el material de entrenamiento es ficcion sintetica, lo que no aporta garantias factuales.
- Sesgos conocidos: no disponibles. No se ha publicado ningun analisis de sesgos, y el corpus de entrenamiento es ficcion sintetica generada por estudiantes sobre un personaje de monje ficticio, con influencias historicas no atribuidas como fuentes de citas.
- Idiomas: no disponibles. No se documenta cobertura multilingue ni evaluacion por idioma.
- Licencia: apache-2.0 en el adaptador, pero el uso comercial queda condicionado por la licencia y las condiciones del modelo base y de su conversion comunitaria, no verificadas de forma independiente en la informacion disponible.
- Trazabilidad parcial: la conversion a 4 bits del base no fue reproducida de forma independiente. Se proporciona SHA256 del adaptador para verificacion.
- Evaluaciones no independientes: todas las puntuaciones citadas son auditorias del mismo autor, no ciegas, y la suite de desarrollo se ha inspeccionado repetidamente, lo que limita su valor como medida de generalizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/A-Martinez-2508/peak-monk-jun-run26
- Modelo base: https://huggingface.co/johnlakness/Qwen3-4B-Base-mlx-4Bit
- Repositorio de investigacion Peak Monk (codigo fuente, capturas crudas de evaluacion y script de restauracion): https://github.com/TheOneWhoBurns/peak-monk
- Inspiracion original del proyecto (Zero): https://movingcastles.world/posts/zero
