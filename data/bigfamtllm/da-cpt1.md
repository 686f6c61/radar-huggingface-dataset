# BigFamTLLM/da-cpt1

## Resumen

da-cpt1 es un modelo de lenguaje de 2.115.305.088 parametros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata del primer checkpoint de una serie de diez de preentrenamiento continuado (continued pretraining) sobre noruego, obtenido a partir de da-emb, un modelo originalmente entrenado en danes al que se le sustituyo el tokenizador por uno noruego de 32.000 tokens y se le aplico una fase de entrenamiento exclusivo de embeddings.

El modelo emplea la arquitectura Qwen3 (36 capas, hidden size 2176, 34 cabezas de atencion con 17 cabezas KV y embeddings atados) y una longitud de contexto de 4096 tokens. En este checkpoint se han procesado 3,07B tokens noruegos (85% Bokmål, 15% Nynorsk) procedentes de HPLT 4.0, tras 4.860 de los 48.600 pasos totales previstos. Es un modelo base, sin ajuste por instrucciones.

Su relevancia es acotada y experimental: sirve para estudiar la transferencia entre lenguas germanicas cercanas (danes a noruego) mediante cambio de tokenizador y preentrenamiento continuado, y forma parte de un conjunto de 50 modelos comparables (noruego desde cero, danes desde cero y multilingue) con la misma arquitectura y presupuesto de computo. No esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atencion, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors en bfloat16) |
| Idiomas soportados | da, no, nb (Bokmål), nn (Nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuracion densa: 36 capas, dimension oculta de 2176, 34 cabezas de atencion con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizo con Megatron-LM sobre 8 GPUs GH200 en el cluster Olivia de Sigma2, con longitud de secuencia 4096, batch size 128, optimizador AdamW y una tasa de aprendizaje maxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 durante la fase exclusiva de embeddings).

El proceso parte de da-emb, al que se le practico un intercambio de tokenizador: los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Sobre esa base se aplicaron 1.000 pasos de entrenamiento solo de embeddings y despues preentrenamiento continuado con datos de HPLT 4.0 (mezcla noruega 85% Bokmål / 15% Nynorsk). Este checkpoint corresponde al paso 4.860 de 48.600 y acumula 3,07B tokens noruegos vistos. Existe una fase de annealing posterior (916 pasos, 0,48B tokens de Bokmål y Nynorsk de alta calidad con decaimiento lineal a cero) que da lugar a la variante da-cpt1-anneal. La conversion a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue tambien en transformers 4.x.

## Capacidades

- Generacion de texto autoregresiva en noruego (Bokmål y Nynorsk) y, residualmente, en danes por herencia del modelo base.
- Modelado de lenguaje base: no esta ajustado por instrucciones, por lo que no sigue ordenes de forma fiable ni mantiene formato conversacional.
- Razonamiento y conocimiento del mundo limitados a lo aprendido en 3,07B tokens de preentrenamiento continuado, con resultados bajos en las tareas de NorEval.
- Capacidad de continuacion de texto, correccion ortografica parcial y tareas de comprension lectora simples.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- Multilingue limitado: los idiomas declarados son da, no, nb y nn; no hay evidencia de competencia en otras lenguas.

## Casos de uso

- Investigacion sobre transferencia entre lenguas: el modelo permite medir cuanto conocimiento del danes se conserva y se adapta al noruego tras el cambio de tokenizador y el preentrenamiento continuado, comparando con los checkpoints no-base y ml-base del mismo proyecto.
- Estudio de tokenizadores: sirve para analizar el efecto de sustituir un vocabulario de 32.000 tokens y reinicializar embeddings frente a entrenar desde cero, gracias a la documentacion detallada del proceso.
- Evaluacion de robustez: el autor publica resultados con entradas ruidosas (0,361 en limpio y -0,043 de media bajo ruido), lo que permite usarlo como banco de pruebas de tecnicas de aumento de datos y normalizacion.
- Generacion de texto de dominio publico en noruego: continuacion de articulos, descripciones o parrafos en Bokmål y Nynorsk para experimentos de calidad linguistica, asumiendo supervision humana.
- Baseline en pipelines de evaluacion: al ser un modelo base pequeno (2,12B) y con contexto de 4096, encaja como referencia inferior en comparaciones de NorEval u otras suites noruegas.
- Docencia y reproducibilidad: el proyecto publica los 50 modelos con la misma arquitectura y presupuesto, lo que facilita replicar experimentos de preentrenamiento y annealing en un entorno academico.
- Analisis de sesgos y alucinacion en modelos pequenos entrenados con web text: util para estudiar como se manifiestan estos fenomenos en lenguas de bajos recursos.

## Benchmarks y rendimiento

Resultados publicados por el autor en NorEval 1.1:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,215 | 0,254 |
| nob_orthography | acc | 0,846 | 0,855 |
| nob_reading | f1 | 0,159 | 0,177 |
| nob_world | acc | 0,282 | 0,283 |
| nno_language | em_first | 0,333 | 0,404 |
| nno_world | acc | 0,290 | 0,288 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,361 en entrada limpia y -0,043 de media bajo ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados.
- En cuantizacion de 8 bits, en torno a 2,2-2,5 GB de pesos; en 4 bits, alrededor de 1,2-1,5 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para bfloat16; A100, H100 o GH200 para entrenamiento y evaluacion a gran escala.
- Cabe en GPUs de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en bfloat16 o cuantizado.
- Opciones de despliegue: transformers (soporte oficial declarado, con text-generation-inference y endpoints compatibles), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt1 | 2,12B | 4.096 | da, no, nb, nn | no disponible | Checkpoint 1 de 10 de CPT sobre noruego; resultados NorEval publicados |
| BigFamTLLM/no-base | no disponible en la informacion | no disponible | no | no disponible | Noruego desde cero, misma arquitectura y presupuesto |
| BigFamTLLM/da-emb | no disponible en la informacion | no disponible | da | no disponible | Modelo de origen de da-cpt1, solo embeddings adaptados |
| BigFamTLLM/ml-cpt1 | no disponible en la informacion | no disponible | multilingue | no disponible | Variante multilingue con el mismo esquema de CPT |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; el autor remite a la evaluacion individual de cada checkpoint con y sin annealing.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable ni mantiene formatos conversacionales; requiere prompting de continuacion.
- Entrenado sobre texto web (HPLT 4.0): puede generar contenido erroneo, sesgado u ofensivo; el propio autor advierte que no esta pensado para produccion.
- Rendimiento bajo en tareas de conocimiento del mundo y comprension lectora (0,282 de accuracy en nob_world 0-shot y 0,159 de F1 en nob_reading), lo que refleja el limitado volumen de tokens vistos (3,07B).
- Contexto corto (4.096 tokens) en comparacion con modelos actuales, lo que restringe casos de uso con documentos largos.
- Cobertura linguistica limitada a noruego (Bokmål y Nynorsk) y danes; sin garantias en otras lenguas.
- Es un checkpoint intermedio (paso 4.860 de 48.600): su calidad es inferior a la de los checkpoints finales y a la de la variante con annealing.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Riesgo de alucinacion elevado por el tamano reducido y la naturaleza del corpus; requiere verificacion humana en cualquier aplicacion.
- Proyecto academico de un curso universitario, sin mantenimiento ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt1
- Modelo base: https://huggingface.co/BigFamTLLM/da-emb
- Modelo de origen (danes): https://huggingface.co/BigFamTLLM/da-base
- Variante con annealing: https://huggingface.co/BigFamTLLM/da-cpt1-anneal
- Noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Multilingue desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Asignatura IN5640, Universidad de Oslo: no disponible (sin enlace en la informacion proporcionada)
- Paper o blog tecnico: no disponible
- Repositorio de codigo: no disponible
