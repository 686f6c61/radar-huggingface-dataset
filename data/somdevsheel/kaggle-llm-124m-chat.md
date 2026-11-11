# somdevsheel/kaggle-llm-124m-chat

## Resumen

kaggle-llm-124m-chat es un modelo de lenguaje conversacional de 123,6 millones de parametros entrenado desde cero por el desarrollador independiente somdevsheel. Se trata de un proyecto de aprendizaje que reproduce el ciclo completo de entrenamiento de un LLM a pequena escala: preentrenamiento sobre 0,98 mil millones de tokens de FineWeb-Edu y posterior ajuste supervisado (SFT) sobre 226.000 conversaciones del dataset smol-smoltalk. Todo el entrenamiento se realizo en GPUs gratuitas de Kaggle (2x NVIDIA T4) en aproximadamente 12,6 horas en total.

El modelo sigue una arquitectura transformer decoder-only de estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin sesgos y embeddings atados) con 12 capas, dimension oculta de 768 y una ventana de contexto de 1024 tokens. Utiliza el tokenizador BPE de GPT-2 con el vocabulario ampliado a 50.304 entradas. Los pesos son un `LlamaForCausalLM` estandar, lo que permite cargarlo directamente con `transformers`.

Su relevancia es fundamentalmente educativa y de investigacion: demuestra que es posible completar un pipeline de preentrenamiento y alineacion conversacional en hardware de gama baja, y sirve como referencia reproducible para quienes quieran entender el proceso. No esta pensado como asistente de produccion: el propio autor advierte que el modelo afirma hechos incorrectos con seguridad y que su conocimiento es muy limitado (8 tokens por parametro frente a los ~20 optimos segun Chinchilla).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin sesgos, embeddings atados) |
| Parametros totales | 123.587.328 (85,0M no pertenecientes a embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Capas / dimension oculta / cabezas | 12 / 768 / 12 |
| FFN | 2048 |
| Tokenizador | BPE de GPT-2 (vocabulario ampliado a 50.304) |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas con atencion multi-cabeza (12 cabezas de 64 dimensiones), normalizacion RMSNorm en configuracion pre-norm, activacion SwiGLU en la FFN de 2048 unidades y embeddings atados entre entrada y salida. Emplea codificacion posicional rotatoria (RoPE) y prescinde de terminos de sesgo en las capas lineales. El tokenizador es el BPE de GPT-2 con el vocabulario rellenado hasta 50.304 entradas.

El entrenamiento se dividio en dos fases. El preentrenamiento consumio 0,98 mil millones de tokens de la muestra sample-10BT de FineWeb-Edu durante 1.865 pasos de 524K tokens (10,9 horas en 2x T4), alcanzando una perdida de validacion de 3,43 (perplejidad 31). Se uso entrenamiento distribuido con PyTorch DDP, precision mixta fp16 con escalado de perdida, AdamW (betas 0,9 y 0,95), weight decay 0,1 y un schedule coseno con LR pico de 1,2e-3, ajustado dinamicamente para caber en el limite de 12 horas por sesion de Kaggle. La fase de SFT consumio 226.000 conversaciones de smol-smoltalk empaquetadas en bloques de 1024 tokens (92% de ocupacion, first-fit packing) durante 2.442 pasos de 65K tokens (1,7 horas), con LR de 2e-4 y calculo de perdida unicamente sobre los tokens del asistente; la perdida de validacion en esos tokens bajo de 2,79 a 1,61. No se aplico RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional multi-turno siguiendo el formato de chat con etiquetas `<|system|>`, `<|user|>` y `<|assistant|>`, terminando cada turno del asistente con `<|endoftext|>`.
- Escritura de codigo corto y bien especificado (por ejemplo, inversion de cadenas o comprobacion de primalidad); el propio autor senala que codigo mas largo o con especificaciones vagas suele fallar.
- Respuestas a preguntas generales y tareas sencillas de razonamiento, aunque con alta propension a errores factuales.
- Capacidad multilingue: no disponible; el modelo solo maneja ingles.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Docencia y aprendizaje de LLMs: sirve como ejemplo reproducible de un pipeline completo de preentrenamiento mas SFT en hardware modesto (2x T4), util para cursos y talleres sobre entrenamiento de modelos desde cero.
- Experimentacion academica con modelos pequenos: su tamano (123M) y licencia Apache 2.0 permiten usarlo como linea base en estudios sobre alineacion, empaquetado de datos o schedules de learning rate.
- Pruebas de infraestructura de inferencia: al ser un `LlamaForCausalLM` estandar con tokenizador GPT-2, se puede desplegar en entornos de prueba para validar pipelines de `transformers`, TGI o servidores compatibles con endpoints antes de migrar a modelos mayores.
- Generacion de codigo trivial en entornos controlados: puede producir funciones cortas y bien especificadas (inversion de cadenas, comprobacion de primos) para demos o tests de integracion de herramientas de generacion de codigo, sin uso en produccion real.
- Chatbots de demostracion y prototipado de interfaces: su formato de chat explicito permite integrarlo en maquetas de UI conversacional para validar flujos de usuario sin coste de API.
- Investigacion sobre calibracion y alucinacion: su tendencia documentada a afirmar hechos falsos con seguridad lo convierte en un sujeto de estudio util para tecnicas de deteccion de alucinaciones en modelos de baja capacidad.
- Fine-tuning posterior: al estar bajo Apache 2.0 y con pesos safetensors, puede servir de punto de partida para experimentos de ajuste en dominios muy acotados donde 124M de parametros y 1024 tokens de contexto sean suficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion: 3,43 (perplejidad 31) tras el preentrenamiento y 1,61 en tokens del asistente tras el SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16 (123,6M parametros x 2 bytes) mas overhead de activaciones; en la practica cabe en cualquier GPU con 2 GB o mas. En cuantizacion de 8 bits rondaria los 0,13 GB y en 4 bits los 0,07 GB, aunque el autor no distribuye pesos cuantizados.
- GPU recomendadas: cualquier GPU moderna; el modelo fue entrenado en 2x NVIDIA T4 y la inferencia funciona sin problemas en T4, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en CPU con latencia aceptable dado su tamano.
- Opciones de despliegue: `transformers` (soporte nativo, incluido `text-generation-inference` segun los tags del repo), ONNX Runtime (hay pesos ONNX en el repositorio) y, en general, cualquier runtime compatible con arquitectura LLaMA. No se documentan recetas especificas para llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| kaggle-llm-124m-chat | 123,6M | 1024 | Apache 2.0 | Ingles | Entrenado desde cero en 2x T4; SFT sobre smol-smoltalk |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 | Apache 2.0 | Ingles | Entrenado sobre un corpus mucho mayor; referencia habitual para modelos de este tamano |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Ingles | Modelo historico sin ajuste conversacional nativo |
| TinyLlama-1.1B (TinyLlama) | 1,1B | 2048 | Apache 2.0 | Ingles | Un orden de magnitud mayor; mayor calidad pero mas requisitos de hardware |

La comparacion con SmolLM-135M y GPT-2 small es la mas directa por tamano y contexto. No se dispone de datos de benchmarks de kaggle-llm-124m-chat que permitan una comparacion cuantitativa de rendimiento; la diferencia principal con alternativas como SmolLM-135M radica en el volumen de entrenamiento (0,98B tokens frente a volumenes muy superiores) y en la ausencia de alineacion adicional.

## Limitaciones y advertencias

- Alucinacion severa: el autor documenta que el modelo afirma hechos incorrectos con seguridad; por ejemplo, inventa una definicion de "DSA" en ciencias de la computacion. El ratio de 8 tokens por parametro (frente a los ~20 optimos de Chinchilla) implica un conocimiento muy limitado.
- Solo ingles: no soporta castellano ni otros idiomas.
- Sin ajuste de seguridad ni preferencias: no se aplico RLHF ni DPO, por lo que no hay garantias de comportamiento seguro o alineado.
- Codigo: funciones cortas y bien especificadas pueden ser correctas, pero codigo mas largo o ambiguo suele fallar; no apto para generacion de codigo en produccion.
- Contexto muy corto (1024 tokens): limita conversaciones largas y tareas que requieran documentos extensos.
- No usar para respuestas factuales, medicas, legales o financieras: el propio autor lo desaconseja explicitamente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser un proyecto de aprendizaje no hay garantias de calidad ni soporte.
- Sin datos de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas con metricas objetivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/kaggle-llm-124m-chat
- Modelo base (solo preentrenamiento): https://huggingface.co/somdevsheel/kaggle-llm-124m-base
- Dataset de preentrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
