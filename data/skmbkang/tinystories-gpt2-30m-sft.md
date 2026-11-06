# skmbkang/tinystories-gpt2-30m-sft

## Resumen

tinystories-gpt2-30m-sft es un ajuste fino supervisado (SFT) del modelo base skmbkang/tinystories-gpt2-30m, un GPT-2 de 30 millones de parametros entrenado por el usuario skmbkang. El modelo escribe cuentos cortos en ingles a partir de condiciones opcionales como palabras clave, caracteristicas estilisticas (por ejemplo, dialogo) o un resumen argumental. El ajuste se realizo sobre el dataset TinyStoriesInstruct, derivado del corpus TinyStories de Ronen Eldan.

Con 30.044.544 parametros reales y un repositorio de 0,1 GB, se trata de un modelo de investigacion y experimentacion, no de un modelo de proposito general. Su valor esta en demostrar que un transformer muy pequeno puede aprender a seguir instrucciones estructuradas en un dominio acotado (cuentos infantiles) con un coste computacional minimo, lo que lo hace util para prototipado rapido, docencia y pruebas de pipelines de generacion de texto.

La relevancia actual es limitada fuera de ese nicho: el modelo solo maneja ingles, tiene una ventana efectiva de 256 tokens (prompt mas historia) y su licencia MIT permite uso comercial sin restricciones, algo poco habitual en modelos mas grandes. Es, en la practica, una pieza didactica y un banco de pruebas de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 30.044.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (prompt + historia, segun la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser 30M cabe en FP32 sin problema) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuracion estandar de GPT-2 pequeno, escalada a 30M de parametros. El modelo base skmbkang/tinystories-gpt2-30m fue preentrenado sobre el corpus TinyStories y posteriormente ajustado mediante SFT sobre roneneldan/TinyStoriesInstruct. El entrenamiento de ajuste consistio en 1.600 pasos con un learning rate que decae de 1e-4 a 1e-5, calculando la perdida unicamente sobre los tokens de la historia (no sobre el prompt) y eliminando aleatoriamente el campo Summary en el 50% de los ejemplos para evitar que el modelo dependa siempre de un resumen.

La perdida de validacion sobre tokens de historia bajo de 1.548 a 1.260 durante el entrenamiento. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La innovacion principal es el formato de prompt estructurado por lineas (Words, Features, Summary, Story), que permite condicionar la generacion de forma explicita y evaluable.

## Capacidades

- Generacion de cuentos cortos en ingles a partir de palabras clave, caracteristicas estilisticas o un resumen argumental.
- Seguimiento de instrucciones estructuradas mediante un formato de prompt fijo y documentado.
- Condicionamiento parcial: los campos Words, Features y Summary son opcionales; solo la linea `Story:` es obligatoria.
- Generacion con muestreo configurable (temperatura, top-k) para variar la creatividad de la salida.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue practicamente nula: solo ingles.

## Casos de uso

- Generacion de cuentos infantiles para prototipos: el modelo produce historias cortas en ingles a partir de tres palabras clave, con una tasa de inclusion de las tres palabras del 26,0 % en la evaluacion del autor, suficiente para demos interactivas.
- Docencia y divulgacion de NLP: su tamano (30M) y su licencia MIT permiten ejecutarlo en cualquier portatil y explicar el ciclo completo de preentrenamiento y SFT sin infraestructura.
- Pruebas de pipelines de generacion: sirve como modelo de sustitucion barato para validar integraciones con transformers, text-generation-inference o endpoints compatibles antes de pasar a modelos mayores.
- Generacion de datos sinteticos de cuentos: puede producir corpus pequenos de historias condicionadas para experimentos de aumento de datos o evaluacion de clasificadores.
- Evaluacion de formatos de prompt: su esquema por lineas permite estudiar como afecta la estructura del condicionamiento a la fidelidad de la generacion en modelos pequenos.
- Benchmarking de eficiencia: al caber en CPU, es util para medir latencia y throughput de frameworks (transformers, llama.cpp) en entornos sin GPU.
- Juguetes educativos y aplicaciones offline: integrable en apps ligeras que necesiten generar microcuentos sin conexion ni coste de inferencia en la nube.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre 100 ejemplos de validacion con tres palabras como condicion, temperatura 0,8 y top-k 50:

| Modelo | Palabras incluidas | Las 3 palabras incluidas |
|---|---|---|
| Modelo preentrenado (base) | 21,0 % | 1,0 % |
| tinystories-gpt2-30m-sft | 65,3 % | 26,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (30M parametros, unos 120 MB de pesos); en FP16 unos 60 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050 o incluso iGPU modernas.
- Opciones de despliegue: transformers (referencia), text-generation-inference (el modelo declara endpoints_compatible), llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles de forma oficial; por el tamano, la generacion de 200 tokens es del orden de decimas de segundo en GPU y de pocos segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tinystories-gpt2-30m-sft | 30M | 256 tokens | en | MIT | SFT sobre TinyStoriesInstruct, formato de prompt estructurado |
| skmbkang/tinystories-gpt2-30m (base) | 30M | 256 tokens (aprox.) | en | no disponible en la informacion | Preentrenado, sin ajuste a instrucciones; 21,0 % de inclusion de palabras |
| Modelos GPT-2 pequenos (p. ej. distilgpt2) | ~82M | 1.024 tokens | en | MIT/Apache-2.0 segun variante | Proposito general, no especializado en cuentos ni en seguir instrucciones |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Coherencia narrativa limitada: al tener solo 30M de parametros, confunde nombres y pierde consistencia en la historia.
- Sustitucion lexica: puede emplear palabras similares en lugar de las solicitadas, lo que reduce la fidelidad al condicionamiento.
- Ventana de contexto muy corta: procesa como maximo 256 tokens entre prompt e historia, lo que limita la longitud y complejidad de los cuentos.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Riesgo de alucinacion: propio de modelos generativos; en este caso se manifiesta como incoherencias narrativas mas que como afirmaciones factuales.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus TinyStories es sintetico y simplificado, lo que puede producir un vocabulario y unos roles muy estereotipados.
- Uso comercial: la licencia MIT lo permite sin restricciones, pero su calidad no es apta para produccion en aplicaciones de cara al usuario sin supervision.
- No apto para tareas de razonamiento, codigo, matematicas ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skmbkang/tinystories-gpt2-30m-sft
- Modelo base: https://huggingface.co/skmbkang/tinystories-gpt2-30m
- Dataset de ajuste: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
