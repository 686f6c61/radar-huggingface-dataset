# North-ML1/wind-edge-1.7-gguf

## Resumen

Wind Edge 1.7 es un modelo de lenguaje generativo desarrollado por North ML, una organizacion de investigacion que lo presenta como el ultimo modelo de su hoja de ruta basado en arquitectura Transformer tradicional. Se trata de un modelo decoder-only de aproximadamente 205 millones de parametros (204.896.256 exactos segun los pesos en safetensors), disenado para generacion de texto eficiente y con un enfoque declarado en eficiencia computacional y accesibilidad. El modelo se distribuye principalmente en formato GGUF, lo que facilita su ejecucion en hardware modesto mediante llama.cpp y herramientas compatibles.

La arquitectura sigue un diseno compatible con Qwen3: 18 capas, dimension oculta de 768, atencion con GQA (12 cabezas de consulta y 4 de clave/valor), codificacion posicional RoPE con theta 500.000 y un vocabulario de 32.000 tokens basado en BPE de Llama. El contexto maximo es de 2.048 tokens y utiliza el formato de chat ChatML. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para experimentacion y despliegues ligeros.

Su relevancia actual es limitada pero concreta: se posiciona como un modelo pequeno, de codigo abierto y facil de desplegar en entornos con recursos restringidos (CPU, GPUs de gama baja, dispositivos edge). North ML anuncia ademas una transicion hacia una nueva linea de investigacion denominada Veyrian Execution Generators (VEGs), de la que Wind Edge 1.7 seria el cierre de la etapa Transformer. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (compatible con Qwen3) |
| Parametros totales | 204.896.256 (~205M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (GGUF); safetensors en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

Wind Edge 1.7 es un Transformer decoder-only con 18 capas, dimension oculta de 768 y atencion con Grouped Query Attention (12 cabezas de consulta y 4 de clave/valor). Emplea RoPE con theta de 500.000 para la codificacion posicional y un vocabulario de 32.000 tokens basado en el tokenizador BPE de Llama. El formato de conversacion es ChatML, con tokens especiales `<|im_start|>` y `<|im_end|>`. La arquitectura se declara compatible con Qwen3, lo que sugiere reutilizacion de infraestructura de inferencia existente.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. La model card menciona que el checkpoint base preentrenado esta disponible en `arthu1/wind-lite-1-6-0326-beta1`, lo que indica que Wind Edge 1.7 deriva de un modelo previo de la familia Wind. Se ofrecen ademas checkpoints intermedios (step-500) en Q8_0 y BF16, lo que sugiere que el modelo fue entrenado durante un numero relativamente bajo de pasos o que se publican instantaneas de evaluacion. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en ingles, con soporte de conversacion multi-turno mediante plantilla ChatML.
- Razonamiento basico y respuesta a preguntas simples (la model card incluye ejemplos de aritmetica elemental como `197 + 486`).
- Generacion de codigo: la organizacion lo lista como capacidad objetivo para su sucesor, pero no se documenta de forma explicita para este modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el contexto de 2.048 tokens limita cadenas de razonamiento largas.
- Capacidades multilingues: solo ingles declarado en los metadatos.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision ni audio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con la infraestructura de Inference Endpoints de Hugging Face.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: con 205M de parametros y cuantizacion Q4_K_M de 128 MB, se puede desplegar en una CPU modesta o en una GPU integrada para validar flujos de chat antes de escalar a modelos mayores.
- Educacion e investigacion en arquitecturas Transformer: el modelo, con 18 capas y 768 de dimension oculta, es lo bastante pequeno para inspeccionar activaciones, estudiar el efecto de RoPE o experimentar con tecnicas de ajuste fino en una sola GPU consumer.
- Generacion de texto en dispositivos edge: su tamano reducido (128-411 MB) permite ejecutarlo en moviles, Raspberry Pi o navegadores mediante llama.cpp o WebGPU, para tareas de autocompletado o respuestas cortas sin conexion.
- Clasificacion y etiquetado de texto ligero: puede usarse como base para fine-tuning en tareas de analisis de sentimiento, extraccion de entidades o moderacion, aprovechando su licencia Apache-2.0 y su bajo coste de inferencia.
- Generacion de respuestas en entornos con latencia estricta: al caber en memoria de una GPU de gama baja (por ejemplo, RTX 3060 o inferior), ofrece tiempos de respuesta de milisegundos para prompts cortos, adecuado para sistemas de autocompletado o chatbots de atencion basica.
- Base para experimentos de destilacion o comparacion de arquitecturas: sirve como modelo de referencia para medir la eficiencia de arquitecturas alternativas (incluidas las VEG que anuncia North ML) en tareas de generacion de texto en ingles.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: su bajo coste permite ejecutar baterias de evaluacion automatizadas sin consumir presupuestos significativos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en Q4_K_M (128 MB de pesos mas overhead de contexto), 0,3 GB en Q8_0 (219 MB) y 0,5 GB en BF16 (411 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; se puede ejecutar en GTX 1050 Ti, RTX 3050, RTX 4060, Apple Silicon (M1 en adelante) e incluso en GPUs integradas Intel Iris Xe.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos, asi como en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio, Ollama (importando el GGUF), y potencialmente vLLM o TGI si se convierte a safetensors (aunque el contexto de 2.048 tokens limita el batching). La etiqueta `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en CPU (decenas de tokens por segundo) y muy alto en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wind Edge 1.7 | ~205M | 2.048 | Apache-2.0 | GGUF y safetensors en HF | Solo ingles; sin benchmarks publicados |
| Qwen2.5-0.5B | ~494M | 32.768 | Apache-2.0 | GGUF y safetensors en HF | Multilingue; benchmarks publicados por el autor |
| SmolLM2-135M | ~135M | 8.192 | Apache-2.0 | GGUF y safetensors en HF | Entrenado con dataset abierto; benchmarks publicados |
| TinyLlama-1.1B | ~1.1B | 2.048 | Apache-2.0 | GGUF y safetensors en HF | Mayor tamano; contexto similar |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria (menos de 1.000 millones de parametros, licencia permisiva, orientados a generacion de texto). Wind Edge 1.7 destaca por su menor tamano y su contexto limitado, mientras que alternativas como Qwen2.5-0.5B o SmolLM2-135M ofrecen contextos mayores y documentacion de rendimiento mas completa. No se dispone de datos de benchmarks de Wind Edge 1.7 para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos web en ingles, es probable que herede sesgos de genero, raza y cultura, pero no se aporta informacion al respecto.
- Riesgo de alucinacion: alto en un modelo de 205M de parametros; la model card no menciona tecnicas de mitigacion ni evaluaciones de veracidad.
- Limitaciones de contexto: 2.048 tokens es una ventana muy reducida para conversaciones largas, documentos o razonamiento multi-paso; no admite tareas de resumen de textos extensos.
- Limitaciones de idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales, siempre que se conserve el aviso de licencia y se indiquen los cambios.
- Caveats para produccion: ausencia de benchmarks publicados, documentacion de entrenamiento incompleta y falta de informacion sobre tool calling o agentes; no se recomienda para tareas criticas sin una evaluacion previa en el dominio concreto.
- La model card incluye afirmaciones promocionales sobre la futura linea VEG (Veyrian Execution Generators) que no estan respaldadas por resultados publicados y no deben interpretarse como capacidades del modelo actual.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/North-ML1/wind-edge-1.7-gguf
- Version safetensors: https://huggingface.co/North-ML1/wind-edge-1.7
- Checkpoint base preentrenado: https://huggingface.co/arthu1/wind-lite-1-6-0326-beta1
- Organizacion North ML en Hugging Face: https://huggingface.co/North-ML1
- Repositorio de llama.cpp (inferencia GGUF): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web proporcionada.
