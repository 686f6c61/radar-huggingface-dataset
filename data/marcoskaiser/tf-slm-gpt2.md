# marcoskaiser/tf-slm-gpt2

## Resumen

tf-slm-gpt2 (identificado internamente como EXP001) es un modelo de lenguaje pequeno de aproximadamente 114 millones de parametros desarrollado desde cero por el autor marcoskaiser en el marco de un trabajo de Deep Learning en la PUCRS (Pontificia Universidad Catolica de Rio Grande do Sul). Se trata de un transformer decoder-only de estilo clasico GPT-2, con posiciones aprendidas, atencion multi-cabeza, LayerNorm en pre-norm y activacion ReLU. No guarda relacion con el GPT-2 de OpenAI mas alla de compartir el estilo arquitectonico y el tokenizer BPE, que reutiliza el vocabulario original de 50257 tokens.

El modelo se publica como material didactico y de investigacion, con tres fases de entrenamiento documentadas (pre-entrenamiento, mid-training y SFT) y metricas de evaluacion para cada una. Su ventana de contexto es de 1024 tokens y fue entrenado sobre una muestra de 2,29 mil millones de tokens de FineWeb-Edu, seguida de fases de ajuste con smol-smoltalk, GSM8K y everyday-conversations.

Es relevante ahora como referencia reproducible de un pipeline completo de entrenamiento de un SLM desde cero en hardware de consumo profesional (una unica RTX A5000), con codigo abierto en GitHub y pesos en formato PyTorch. No obstante, sus capacidades son muy limitadas: el propio autor advierte que fue entrenado con aproximadamente 1000 veces menos texto que modelos de tamano similar como SmolLM2-135M, y que inventa hechos y comete errores aritmeticos con seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (posicion aprendida, MHA, LayerNorm pre-norm, ReLU) |
| Parametros totales | ~114M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en precision de entrenamiento, bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | `state_dict` de PyTorch (`model_weights.pt`, cargar con `weights_only=True`) |
| Capas / dimension / cabezas | 12 / 768 / 12 |
| Dimension MLP | 2560 |
| Vocabulario | 50257 (tokenizer BPE de GPT-2) |
| Weight tying | si |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con 12 capas, dimension oculta de 768, 12 cabezas de atencion multi-cabeza (MHA, con 12 cabezas de key/value) y una MLP de dimension 2560 con activacion ReLU. Emplea embeddings posicionales aprendidos, LayerNorm en configuracion pre-norm y weight tying entre la matriz de embedding de entrada y la capa de salida. El vocabulario y el tokenizer son los del GPT-2 (BPE, 50257 tokens).

El entrenamiento se estructura en tres fases. El pre-entrenamiento usa una muestra de 10BT de FineWeb-Edu, con 2,29 mil millones de tokens procesados (aproximadamente 20 tokens por parametro, siguiendo la regla de Chinchilla), learning rate 6e-4 con decaimiento coseno. El mid-training anade smol-smoltalk y GSM8K con plantilla `User:`/`Assistant:` y empaquetado de secuencias, 210 millones de tokens, learning rate 2e-4. El SFT final usa 40 mil conversaciones de smol-smoltalk, everyday-conversations y GSM8K durante 2 epocas, con learning rate 3e-5 y calculo de perdida unicamente sobre las respuestas. En todas las fases se usa AdamW (betas 0,9/0,95, weight decay 0,1), clipping de gradiente 1,0, precision bf16, una unica RTX A5000 y lotes de 131 mil tokens por step. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles con formato de conversacion (plantilla `User:`/`Assistant:`).
- Seguimiento basico de instrucciones tras el SFT, limitado a respuestas cortas.
- Razonamiento aritmetico elemental, entrenado parcialmente con GSM8K, aunque con alta tasa de error.
- Generacion de codigo: no documentada como capacidad especifica.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Docencia y aprendizaje de pipelines de entrenamiento: el repositorio de GitHub incluye configuracion, codigo y metricas de las tres fases, lo que permite reproducir el entrenamiento completo y estudiar el efecto de cada etapa sobre la perplejidad y los benchmarks.
- Investigacion sobre el impacto de la cantidad de datos: sirve como punto de comparacion controlado frente a modelos de tamano similar entrenados con ordenes de magnitud mas de tokens, para medir la brecha de rendimiento atribuible al volumen de datos.
- Evaluacion de tecnicas de ajuste supervisado: las fases de mid-training y SFT con perdida enmascarada sobre respuestas permiten experimentar con plantillas de conversacion y estrategias de packing en un modelo pequeno y rapido de entrenar.
- Pruebas de infraestructura de inferencia: con 114M de parametros y pesos en un unico `state_dict` de PyTorch, es util para validar scripts de carga, generacion y decodificacion (temperatura, top-k) en entornos de desarrollo antes de escalar a modelos mayores.
- Generacion de texto de relleno en entornos de prueba: para validar interfaces de chat, formateadores o sistemas de logging que necesitan un modelo real pero cuyas respuestas no requieren calidad de produccion.
- Analisis de limitaciones de contexto: su ventana de 1024 tokens permite estudiar el comportamiento de modelos pequenos en conversaciones multi-turno cortas y la degradacion de la coherencia al superar el contexto.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados por log-likelihood con accuracy normalizada:

| Fase | PPL (test FineWeb-Edu) | HellaSwag | ARC-Easy | ARC-Challenge | WinoGrande |
|---|---|---|---|---|---|
| Pre-entrenamiento | 26,2 | 29,5% | 44,0% | 24,3% | 52,9% |
| Mid-training | 32,8 | 29,1% | 41,1% | 23,0% | 54,0% |
| SFT | 33,4 | 29,2% | 41,4% | 23,5% | 51,9% |

Referencia de azar: 25% en HellaSwag, ARC-Easy y ARC-Challenge; 50% en WinoGrande. Los resultados se mantienen en torno al azar en la mayoria de tareas, lo que confirma la limitacion por volumen de datos senalada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16/fp16 (114M parametros, ~0,23 GB de pesos) mas overhead de activaciones y cache KV para 1024 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizo en una unica RTX A5000. Tambien funciona en CPU, como muestra el ejemplo de la model card (`load_model(..., 'cpu')`).
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el modelo se distribuye como `state_dict` de PyTorch y requiere el codigo del repositorio `tf_deep_learning_slm` para cargarse y generar. No se proporcionan pesos en GGUF ni integracion con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la inferencia en GPU consumer deberia ser del orden de milisegundos por token, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tf-slm-gpt2 (EXP001) | ~114M | 1024 | 2,29B tokens (FineWeb-Edu) + mid-training + SFT | no disponible | Pesos PyTorch + repo GitHub |
| SmolLM2-135M | 135M | 8192 | ~2 billones (2T) de tokens | Apache 2.0 | HF, GGUF, integraciones (llama.cpp, transformers) |
| GPT-2 (OpenAI) | 124M | 1024 | ~40B tokens (WebText) | MIT (pesos originales) | HF, amplio ecosistema |

La comparacion con SmolLM2-135M es la mas relevante: mismo orden de magnitud de parametros, pero con un contexto ocho veces mayor y un volumen de entrenamiento aproximadamente mil veces superior, segun la propia model card. La licencia de tf-slm-gpt2 no esta declarada, lo que impide confirmar su uso comercial.

## Limitaciones y advertencias

- Modelo entrenado con aproximadamente 1000 veces menos texto que modelos de tamano similar (por ejemplo, SmolLM2-135M), lo que se traduce en conocimiento factual muy limitado.
- Alucinacion frecuente: el autor advierte explicitamente que inventa hechos y comete errores aritmeticos con seguridad.
- Los benchmarks se mantienen cerca del nivel de azar en HellaSwag, ARC-Easy, ARC-Challenge y WinoGrande.
- Ventana de contexto de solo 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo soporta ingles; no hay capacidades multilingues.
- Licencia no declarada: no se puede confirmar el permiso para uso comercial ni la redistribucion.
- Sin soporte de tool calling, agentes ni modos de razonamiento extendido.
- El autor recomienda su uso unicamente para estudio.
- La perplejidad empeora tras el mid-training y el SFT (de 26,2 a 33,4), lo que indica cierto olvido catastrofico del dominio de pre-entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcoskaiser/tf-slm-gpt2
- Repositorio de codigo y configuracion: https://github.com/Leonardo-ripes/tf_deep_learning_slm
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de instrucciones: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset de matematicas: https://huggingface.co/datasets/openai/gsm8k
- Dataset de conversaciones: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
