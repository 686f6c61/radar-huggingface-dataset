# Skebobic/Bobic-1.5-Lean

## Resumen

Bobic 1.5 Lean es un modelo de lenguaje compacto (SLM) de 60.840.970 parametros, desarrollado por el usuario Skebobic y publicado en HuggingFace bajo licencia MIT. Su objetivo declarado es la inferencia conversacional y aritmetica en despliegues de borde con recursos muy limitados: la model card afirma un consumo inferior a 1 GB de VRAM durante la inferencia de secuencias completas y una velocidad de entrenamiento superior a 40.000 tokens por segundo en una unica NVIDIA RTX 4070.

Arquitectonicamente es un transformer decoder-only denso con un diseno "profundo y estrecho": 16 capas, dimension oculta de 512, atencion multi-query (MQA) con 8 cabezas de consulta (hd=64) y una unica cabeza compartida de clave/valor, red feed-forward con SwiGLU (dimension intermedia 1408, aproximadamente 2,75x de expansion), RoPE con frecuencia base 10.000 y normalizacion RMSNorm previa a capa. El vocabulario es de 16.384 tokens con tokenizador ByteLevel BPE, e incorpora un adaptador propietario ("NumberHead") que inyecta embeddings de posicion intra-numero sobre los digitos.

Su interes actual esta en el nicho de los SLM por debajo de 100 M de parametros, utiles para ejecucion local, prototipado rapido y tareas acotadas de aritmetica y QA cientifico. El autor declara un 19,83 % de accuracy en MMLU-Pro (subconjunto de 600 preguntas), frente al 10 % de una linea base aleatoria con 10 opciones (A-J). El modelo soporta ingles y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, MQA, SwiGLU, RoPE, RMSNorm. Diseno "deep & narrow" (16 capas x 512) |
| Parametros totales | 60.840.970 (60,8 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. El repositorio esta etiquetado como `gguf`, pero la model card solo documenta un checkpoint PyTorch `.pt` |
| Idiomas soportados | Ingles (en) y ruso (ru) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, `bobic15_lean.pt`), con codigo de modelo propio (`model.py`). Etiquetado como GGUF en HuggingFace |
| Tamano del repositorio | 0,3 GB |
| Vocabulario | 16.384 tokens, ByteLevel BPE (`bobic15_tok.json` / `tokenizer.json`) |
| Cabezas de atencion | 8 cabezas de consulta (head dim 64), 1 cabeza KV compartida |
| Frecuencia base RoPE | 10.000 |

## Arquitectura y entrenamiento

El modelo sigue el esquema habitual de los SLM modernos: decoder-only denso con normalizacion RMSNorm aplicada antes de cada subcapa (pre-layer norm) y escalado aprendido. La eleccion de MQA reduce el coste de memoria del cache KV al compartir una unica proyeccion de clave/valor entre las 8 cabezas de consulta, lo que resulta coherente con el objetivo de inferencia en memoria reducida. La FFN SwiGLU con dimension 1408 mantiene la relacion de expansion tipica (~2,75x) de otros transformers pequenos. Ademas, el autor introduce un "NumberHead Adapter" integrado que inyecta embeddings de posicion dentro de los numeros, presumiblemente para mejorar la aritmetica a nivel de digito, una de las debilidades clasicas de los modelos con tokenizadores BPE.

En cuanto a los datos, la model card indica un corpus curado multi-fuente que incluye Wikipedia, registros de conversaciones de Telegram, QA cientifico de alta densidad (fisica, aritmetica, trivia) y particiones de razonamiento academico (ARC, OpenBookQA). No se especifica el numero total de tokens de entrenamiento, la composicion porcentual del dataset, ni si se aplicaron fases de RLHF, DPO o SFT posteriores al preentrenamiento. Tampoco se documenta la longitud de contexto usada durante el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles y ruso, con formato de dialogo del tipo `User: ... / Bobic:`.
- Aritmetica basica y operaciones con digitos, reforzadas mediante el adaptador NumberHead y un tokenizador que expone IDs de digito dedicados.
- Respuesta a QA cientifico de dominio acotado (fisica, trivia), segun la composicion del corpus declarado.
- Razonamiento academico de tipo multiple choice, gracias a las particiones de ARC y OpenBookQA.
- Inferencia de muy baja latencia y bajo consumo de memoria (<1 GB de VRAM declarado).
- No se documenta soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se documenta soporte de vision, audio, modo "thinking" ni otras modalidades.
- Capacidad multilingue limitada a en y ru; no hay evidencia de otros idiomas.

## Casos de uso

- Asistente conversacional embebido: con menos de 1 GB de VRAM, puede desplegarse en dispositivos de borde (Raspberry Pi con acelerador, mini-PC, portatiles modestos) para mantener dialogos cortos en ingles o ruso sin conexion a la nube.
- Motor de respuestas para FAQ internas: al haber sido entrenado sobre registros de conversaciones de Telegram, encaja en la generacion de respuestas breves y coloquiales para bots de soporte de bajo volumen, con la logica de negocio delegada a reglas externas.
- Calculadora conversacional: parseo y resolucion de operaciones aritmeticas formuladas en lenguaje natural, aprovechando el adaptador NumberHead y los tokens de digito dedicados.
- Generacion de items de trivia y QA educativo: util para producir preguntas de fisica o cultura general a partir de las particiones ARC/OpenBookQA, como borrador para revision humana.
- Prototipado y pruebas de pipelines de inferencia: por su tamano (0,3 GB de repositorio) permite iterar rapidamente sobre tokenizadores, plantillas de prompt y estrategias de decodificacion antes de escalar a modelos mayores.
- Clasificacion o etiquetado ligero en local: uso del modelo como generador de texto corto con temperatura baja para normalizar, resumir o reformular entradas en flujos de datos que no pueden salir del entorno local.
- Educacion e investigacion: banco de pruebas para estudiar tecnicas de inyeccion de embeddings posicionales sobre numeros (NumberHead) y su efecto en tareas aritmeticas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index del repositorio:

| Benchmark | Dataset | Metrica | Resultado | Verificado |
|---|---|---|---|---|
| Text generation | MMLU-Pro (subconjunto de 600 preguntas) | Accuracy | 19,83 % | No |

Referencias adicionales declaradas en la model card:

| Metrica | Valor | Contexto |
|---|---|---|
| Huella de memoria en inferencia | < 1,0 GB de VRAM | Secuencia completa |
| Velocidad de entrenamiento | > 40.000 tokens/s | Una unica NVIDIA RTX 4070 |
| Linea base aleatoria (10 opciones A-J) | ~10,00 % | Comparacion para MMLU-Pro |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, MMLU estandar, ARC, etc.) en la informacion disponible. Los datos de velocidad corresponden al entrenamiento, no a la inferencia.

## Requisitos de hardware

- VRAM estimada en inferencia: menos de 1,0 GB segun la model card. El checkpoint en precision completa ocupa aproximadamente 243 MB (60,84 M de parametros x 4 bytes) y unos 122 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. El autor cita una RTX 4070 para el entrenamiento; tarjetas como A100 o H100 son innecesarias y estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, de forma holgada, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y cualquier integrada con memoria dedicada. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: inferencia en PyTorch con el codigo propio del repositorio (`model.py`, `Bobic15Lean`, `CFG`). El etiquetado `gguf` sugiere compatibilidad prevista con llama.cpp u Ollama, pero no se documenta ninguna conversion publicada. No se menciona soporte para vLLM, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles para inferencia. El unico dato publicado es de entrenamiento (>40.000 tokens/s en RTX 4070).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | MMLU-Pro |
|---|---|---|---|---|---|
| Bobic 1.5 Lean | 60,8 M | no disponible | MIT | HuggingFace, checkpoint PyTorch | 19,83 % (600q) |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | HuggingFace, safetensors y GGUF | no disponible |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | HuggingFace, safetensors y GGUF | no disponible |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | HuggingFace, safetensors y GGUF | no disponible |

Bobic 1.5 Lean es aproximadamente 2,2 veces mas pequeno que SmolLM2-135M y 8 veces mas pequeno que Qwen2.5-0.5B. Su principal diferenciador en esta categoria es la licencia MIT (frente a la Apache-2.0 de los tres alternativas) y el adaptador NumberHead para digitos. No hay datos de benchmarks comparables publicados en la informacion disponible para establecer una comparacion de rendimiento homogenea.

## Limitaciones y advertencias

- Tamano muy reducido: con 60,8 M de parametros, la capacidad de razonamiento abstracto, el conocimiento factual y la coherencia en conversaciones largas son estructuralmente limitados.
- MMLU-Pro de 19,83 % sobre 600 preguntas, apenas 9,8 puntos por encima de la linea base aleatoria con 10 opciones; conviene tratarlo como un modelo de tareas acotadas, no como un asistente generalista.
- Riesgo elevado de alucinacion: no se documentan fases de alineacion (RLHF, DPO) ni tecnicas de mitigacion, y el corpus incluye registros de Telegram, lo que puede introducir ruido, jerga y contenido no verificado.
- Sesgos desconocidos: no se publica analisis de sesgos ni composicion detallada del dataset, por lo que no es posible evaluar riesgos de sesgo de genero, idioma o dominio.
- Limitacion idiomatica: solo en y ru. El castellano no esta soportado.
- Longitud de contexto no documentada: no se especifica la ventana de entrenamiento, por lo que no se puede garantizar el comportamiento mas alla de interacciones cortas.
- Restricciones de licencia: MIT permite uso comercial y modificacion sin restricciones practicas, siempre que se conserve el aviso de copyright y la atribucion al autor.
- Advertencia de produccion: el modelo requiere codigo personalizado (`model.py`) para cargarse, lo que complica su integracion en servidores estandar. El tag `gguf` no esta respaldado por ningun artefacto documentado en la model card.
- Existe una inconsistencia menor entre los nombres de fichero del tokenizador mencionados en la model card (`bobic15_tok.json` en la tabla de especificaciones frente a `tokenizer.json` en el ejemplo de codigo).
- El modelo tiene 0 descargas y 0 "me gusta" en el momento de la consulta, sin validacion independiente de sus resultados.

## Enlaces

- HuggingFace: https://huggingface.co/Skebobic/Bobic-1.5-Lean
- Perfil del autor: https://huggingface.co/Skebobic
- Dataset MMLU-Pro (TIGER-Lab): https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset OpenBookQA: https://huggingface.co/datasets/allenai/openbookqa
- Licencia MIT: https://opensource.org/licenses/MIT
