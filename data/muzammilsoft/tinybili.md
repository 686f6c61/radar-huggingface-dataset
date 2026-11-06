# muzammilsoft/tinybili

## Resumen

tinybili es un modelo de generacion de texto de tipo MiniGPT desarrollado por el usuario muzammilsoft y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo extremadamente pequeno, entrenado desde cero con TAIT, un toolkit basado unicamente en NumPy disenado para entrenar modelos de IA en telefonos moviles y dispositivos con recursos muy limitados. El modelo se distribuye en formato `.npz` (pesos NumPy mas tokenizador BPE) y esta pensado para ejecutarse en el runner KAIT para Android o mediante la CLI de TAIT.

La relevancia de tinybili no reside en su rendimiento, sino en su caracter demostrativo: evidencia que es posible entrenar y desplegar un modelo de lenguaje completo usando solo NumPy, sin frameworks de deep learning como PyTorch o TensorFlow, y en hardware de gama baja. Con 64 dimensiones de modelo, 128 de capa feed-forward y un tamano de bloque de 64 tokens, sus dimensiones son minusculas incluso para los estandares de modelos "tiny".

El modelo fue entrenado durante 50 epocas sobre 6666 ejemplos de un dataset llamado `mixed-1.jsonl`, alcanzando una perdida final de entrenamiento de 0.4900 y una perdida de validacion de 1.0367. Esta brecha entre entrenamiento y validacion sugiere cierto sobreajuste al conjunto de entrenamiento. No se dispone de informacion publica sobre benchmarks, idiomas soportados ni resultados cualitativos mas alla de las advertencias del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (MiniGPT), implementado en NumPy puro mediante TAIT |
| Parametros totales | no disponible (dimensiones: d_model=64, d_ff=128, vocab=1003, block_size=64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (block_size) |
| Tipos de cuantizacion | no disponible (pesos en NumPy float, formato `.npz`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy weights + tokenizador BPE), archivo `tinyGPT0.1.npz` de 1.072.206 bytes |

## Arquitectura y entrenamiento

tinybili sigue una arquitectura transformer de tipo GPT (denominada MiniGPT por el autor) con una dimension de modelo de 64, una capa feed-forward de 128 y un tamano de bloque (contexto) de 64 tokens. El vocabulario es de 1003 tokens y utiliza un tokenizador BPE. La implementacion completa se realiza en NumPy a traves de TAIT 2.3.0, sin dependencia de frameworks de deep learning, lo que constituye la innovacion principal del proyecto: un pipeline de entrenamiento e inferencia ejecutable en dispositivos moviles.

El entrenamiento se realizo sobre el dataset `mixed-1.jsonl` con 6666 ejemplos durante 50 epocas. La perdida final de entrenamiento fue de 0.4900, mientras que la de validacion se situo en 1.0367, lo que indica un desajuste notable entre ambos conjuntos. No se dispone de informacion sobre la composicion del dataset, el numero de tokens de entrenamiento, ni sobre el uso de tecnicas como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica, limitada a un contexto de 64 tokens.
- Conversacion local mediante la CLI de TAIT (`tait chat --model tinyGPT0.1.npz`).
- Ejecucion en Android a traves del runner KAIT.
- Entrenamiento e inferencia sin frameworks de deep learning (solo NumPy).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles (idiomas no especificados).

## Casos de uso

- Demostracion educativa de entrenamiento de LLM en NumPy: util para ensenar los fundamentos de transformers y descenso de gradiente sin abstracciones de frameworks, ejecutando todo el ciclo en un telefono.
- Prueba de concepto de IA on-device: permite validar pipelines de inferencia en dispositivos Android de gama baja mediante el runner KAIT, sin conexion a red.
- Experimentacion con tokenizacion BPE a escala minuscula: su vocabulario de 1003 tokens sirve para estudiar el comportamiento de tokenizadores en corpus reducidos.
- Benchmarking de toolkits alternativos: sirve como referencia para comparar TAIT con otras soluciones de entrenamiento ligero (micrograd, tinygrad) en terminos de coste y portabilidad.
- Prototipado rapido de chatbots de juguete: la CLI de TAIT permite iterar sobre un modelo conversacional en minutos, util para demos o talleres.
- Investigacion sobre sobreajuste en modelos diminutos: la brecha entre perdida de entrenamiento (0.49) y validacion (1.04) lo convierte en un caso de estudio para analisis de generalizacion con datasets pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son las perdidas de entrenamiento (0.4900) y validacion (1.0367) reportadas por el autor, que no son comparables con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el archivo de pesos ocupa aproximadamente 1 MB (1.072.206 bytes), por lo que cabe en memoria RAM de cualquier dispositivo movil moderno.
- GPU recomendadas: no requiere GPU; el diseno esta orientado a CPU y ejecucion en telefonos.
- Cabe en GPU consumer: si, en cualquier GPU, e incluso en CPU sin aceleracion.
- Opciones de despliegue: CLI de TAIT (`tait chat`), runner KAIT para Android, y carga directa del archivo `.npz` con NumPy.
- Latencia y throughput estimados: no disponibles; dependen del dispositivo, aunque por el tamano del modelo se espera que sean muy bajos en terminos absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| tinybili | no disponible (d_model=64, d_ff=128) | 64 tokens | MIT | NumPy puro, on-device via TAIT/KAIT |
| TinyLlama 1.1B | 1.1B | 2048 tokens | Apache 2.0 | Transformer estandar, PyTorch |
| GPT-2 small | 124M | 1024 tokens | MIT | Transformer estandar, PyTorch/TF |
| micrograd (Karpathy) | variable (ejemplo educativo) | no aplica | MIT | Autograd educativo en Python puro |

La comparativa es orientativa: tinybili no compite en rendimiento con TinyLlama o GPT-2 small, sino en filosofia de despliegue (NumPy puro, movil, sin dependencias). No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo extremadamente pequeno entrenado desde cero: el propio autor advierte que puede alucinar, repetirse o responder fuera de tema.
- Contexto muy limitado (64 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Sobreajuste probable: perdida de validacion (1.0367) mas del doble que la de entrenamiento (0.4900).
- Dataset de entrenamiento pequeno (6666 ejemplos) y no documentado en composicion ni procedencia.
- Idiomas soportados no especificados; no hay garantia de calidad en castellano ni en ningun idioma concreto.
- No apto para uso en produccion ni como fuente factual; el autor lo describe explicitamente como un experimento.
- Licencia MIT permite uso comercial, pero las limitaciones tecnicas hacen inviable cualquier aplicacion real mas alla de la demostracion.
- Dependencia del ecosistema TAIT/KAIT, con menor soporte comunitario que alternativas como llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/muzammilsoft/tinybili
- Repositorio TAIT: https://github.com/muzammilsoft/tait
