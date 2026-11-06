# kimi1999/nanogpt-tinystories

## Resumen

nanoGPT TinyStories Character-Level es un modelo de generacion de texto de escala minima desarrollado por el usuario kimi1999 y publicado en Hugging Face. Se trata de una implementacion de nanoGPT, el framework educativo de Andrej Karpathy, entrenada desde cero sobre el conjunto de datos TinyStories, un corpus de relatos infantiles sinteticos disenado para estudiar el aprendizaje de lenguaje en modelos pequenos. El modelo opera a nivel de caracter con un vocabulario de solo 93 simbolos, lo que lo aleja de los tokenizadores BPE habituales en modelos de produccion.

Con 2,7 millones de parametros y una ventana de contexto de 256 tokens, este modelo no compite con LLMs contemporaneos: es una pieza didactica y de investigacion. Su interes reside en que permite reproducir el pipeline completo de entrenamiento (tokenizacion por caracter, entrenamiento autorregresivo, generacion con temperatura y top-k) en una GPU consumer o incluso en CPU, en cuestion de minutos. Es util para quienes quieren entender el funcionamiento interno de un transformer generativo sin la infraestructura que exigen los modelos de miles de millones de parametros.

La relevancia actual es acotada pero clara: sirve como banco de pruebas para experimentos de scaling laws a pequena escala, para validar tecnicas de muestreo, y como referencia minima de comparacion en estudios sobre coherencia narrativa en modelos de lenguaje. No esta pensado para uso en produccion ni para tareas del mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), implementacion nanoGPT |
| Parametros totales | 2.723.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en float16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere `model.py` y `char_tokenizer.py` del repo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de un transformer decoder-only con atencion causal completa: 6 capas, 6 cabezas de atencion, dimension de embedding de 192 y un vocabulario a nivel de caracter de 93 simbolos. La configuracion se define en un `config.json` que se carga en la clase `GPT` de nanoGPT. No emplea mecanismos de atencion lineal, mezcla de expertos ni decodificacion especulativa; es una implementacion canonica de GPT a escala minima.

El entrenamiento se realizo en una GPU T4 de Google Colab durante aproximadamente 10 minutos, con 2000 iteraciones y precision float16. El corpus utilizado fue el primer bloque de aproximadamente 20 MB del dataset TinyStories-V2-GPT4-train. No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; el modelo es un generador autorregresivo puro entrenado con el objetivo estandar de prediccion del siguiente caracter. No se especifica el numero total de tokens procesados ni la composicion exacta del subconjunto empleado.

## Capacidades

- Generacion de texto autorregresiva a nivel de caracter, orientada a relatos cortos de estilo infantil.
- Continuacion de prompts simples en ingles (por ejemplo, "Once upon a time").
- Muestreo configurable mediante temperatura y top-k.
- Capacidad limitada de mantener coherencia narrativa a muy corto plazo (ventana de 256 caracteres/tokens).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; unicamente ingles.
- Codigo y matematicas: no soportados de forma fiable.

## Casos de uso

- Docencia sobre transformers: permite mostrar en clase el ciclo completo de tokenizacion por caracter, forward pass y generacion con muestreo, ejecutandose en minutos en una T4 o en CPU.
- Reproduccion de experimentos de nanoGPT: sirve como punto de partida para modificar hiperparametros (capas, cabezas, contexto) y comparar resultados sin coste de infraestructura.
- Estudio de scaling laws a microescala: al ser un modelo de 2,7 M de parametros, se pueden entrenar variantes y medir perdida frente a tamano para ilustrar tendencias.
- Pruebas de tecnicas de muestreo: util para comparar temperatura, top-k y top-p sobre un modelo cuyo comportamiento es rapido de inspeccionar y depurar.
- Generacion de cuentos sinteticos de juguete: puede producir relatos muy breves en ingles con estructura simple, utiles como datos de prueba en pipelines de NLP.
- Validacion de entornos de despliegue: sirve para probar integraciones con PyTorch, exportaciones a otros formatos o scripts de inferencia antes de escalar a modelos mayores.
- Referencia de linea base en investigacion sobre coherencia narrativa: permite contrastar modelos pequenos frente a otros mayores sobre el mismo dataset TinyStories.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float16 (2,7 M de parametros ocupan aproximadamente 5,4 MB en pesos; el resto es overhead de activaciones y contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor lo entreno en una T4 de Colab.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: inferencia directa con PyTorch usando `model.py` y `char_tokenizer.py` del repo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (los pesos no estan en GGUF ni en safetensors estandar de transformers).
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano del modelo, la generacion de unos cientos de caracteres deberia completarse en fracciones de segundo en GPU y en pocos segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kimi1999/nanogpt-tinystories | 2,7 M | 256 | caracter (93) | MIT | Hugging Face |
| karpathy/nanoGPT (referencia) | configurable | configurable | BPE (GPT-2) | MIT | GitHub |
| Modelos TinyStories de referencia (p. ej. variantes en el paper original) | 1 M - 30 M | variable | BPE | variable | Hugging Face / paper |

No se dispone de datos de rendimiento comparativo publicados para este checkpoint concreto, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo extremadamente pequeno (2,7 M de parametros): la coherencia se degrada rapidamente mas alla de unas pocas frases.
- Ventana de contexto de solo 256 tokens: no apto para conversaciones multi-turno ni documentos largos.
- Entrenado unicamente en ingles y sobre un subconjunto de ~20 MB de TinyStories; el vocabulario y el estilo estan fuertemente sesgados hacia relatos infantiles.
- Tokenizacion a nivel de caracter: no compatible con tokenizadores estandar de transformers, lo que complica su integracion en pipelines convencionales.
- Riesgo alto de alucinacion y de generar texto incoherente o repetitivo, especialmente con temperaturas bajas o prompts fuera de distribucion.
- No ha pasado por RLHF ni ajuste por instrucciones: no sigue ordenes ni responde a formatos conversacionales.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para produccion por su calidad y limitaciones tecnicas.
- Repositorio de 0,0 GB y sin descargas registradas: no hay garantia de mantenimiento ni de soporte por parte del autor.
- Requiere cargar codigo personalizado (`model.py`, `char_tokenizer.py`) en lugar de `AutoModelForCausalLM`, lo que implica riesgos de seguridad si se ejecuta codigo de terceros sin revision.

## Enlaces

- Hugging Face: https://huggingface.co/kimi1999/nanogpt-tinystories
- nanoGPT (Karpathy): https://github.com/karpathy/nanoGPT
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories: https://arxiv.org/abs/2305.07759
