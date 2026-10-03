# madhusudhan234/NEO

## Resumen

Neo es un modelo de lenguaje de aproximadamente 500 millones de parametros desarrollado por el usuario madhusudhan234 y publicado en Hugging Face. Se trata de un transformer decoder-only entrenado desde cero (from-scratch), con tokenizador SentencePiece propio de 50 000 tokens, preentrenado sobre FineWeb-Edu y posteriormente ajustado (SFT) para razonamiento matematico y generacion de codigo. Incorpora un generador de chat con cache KV y un mecanismo de autoaprendizaje continuo que reajusta el modelo cada cinco respuestas.

El problema que aborda es el de ofrecer una alternativa reproducible de extremo a extremo (corpus, tokenizador, entrenamiento, SFT y chat) en una unica base de codigo, ejecutable en una GPU de gama media como la RTX 4070 segun la propia model card. Su relevancia es principalmente didactica: documenta cada etapa del pipeline y expone de forma transparente su estado de entrenamiento.

Conviene advertir que el propio autor senala que el checkpoint publicado esta incompleto: el preentrenamiento se detuvo en aproximadamente 1,28 mil millones de los 3 mil millones de tokens objetivo, con una perdida de validacion de 3,93 y una perplejidad de 51. Como consecuencia, las respuestas de chat se asemejan a ruido, algo que el autor atribuye explicitamente a la falta de entrenamiento y no a un error del codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (from-scratch) |
| Parametros totales | ~500M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se almacenan en `.pt`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`); tokenizador SentencePiece (`.model`) |

## Arquitectura y entrenamiento

Decoder-only transformer implementado desde cero en `model/transformer.py`, con cache KV para generacion autorregresiva. Los hiperparametros residen en `model/config.py` (funcion `neo_500m()`). El tokenizador es un modelo SentencePiece propio con vocabulario de 50 000 tokens (`tokenizer/neo_final.model`). No se menciona el uso de atencion lineal, SSM ni tecnicas hibridas; la novedad principal que declara el proyecto es el mecanismo de autoaprendizaje sobre el historial de chat.

El preentrenamiento utiliza un corpus de aproximadamente 2,37 mil millones de tokens en formato uint16 (4,4 GB), construido a partir de cinco fuentes (entre ellas FineWeb-Edu), con limpieza, deduplicacion y tokenizacion previas. El objetivo declarado era de 3 mil millones de tokens, pero el checkpoint actual solo alcanzo ~1,28 mil millones (perdida de validacion 3,93, perplejidad 51). Despues se aplica un SFT para razonamiento y codigo generado sinteticamente (`build_reasoning_data.py`, `build_coding_data.py`), con enmascaramiento de perdida para que esta se compute unicamente sobre las respuestas del modelo. No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

Capacidades objetivo declaradas por el proyecto:
- Generacion de texto conversacional en modo chat con cache KV.
- Razonamiento matematico (dataset SFT generado internamente).
- Generacion de codigo (dataset SFT generado internamente).
- Autoaprendizaje continuo: reajuste automatico cada cinco respuestas sobre el historial de conversacion, con deduplicacion por hash y enmascaramiento de perdida.
- Aprendizaje bajo demanda mediante `/learn` y borrado de log mediante `/forget`.
- Herramientas auxiliares de evaluacion y diagnostico (`eval.py`, `diagnose.py`).

Capacidades reales del checkpoint publicado:
- Las respuestas de chat son ruido segun el propio autor, debido al preentrenamiento incompleto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion didactica de un pipeline LLM completo: el repositorio cubre descarga de corpus, limpieza, tokenizacion, preentrenamiento, SFT y chat, por lo que resulta util como material de estudio para quienes quieren entender cada etapa sin depender de frameworks de alto nivel.

- Formacion en entrenamiento desde cero en hardware de gama media: la model card estima 9-12 horas de preentrenamiento y 2-4 horas de SFT en una RTX 4070, lo que permite plantear ejercicios practicos en una unica GPU consumer.

- Punto de partida para una investigacion sobre autoaprendizaje continuo: el motor `learn_core.py` implementa un ciclo de fine-tuning incremental con tasa de aprendizaje baja (2e-5, warmup y decaimiento coseno) y penalizacion de errores (`wrong_penalty=1.5`), lo que sirve como referencia experimental para estudiar olvido catastrofico y actualizacion en linea.

- Estudio comparativo de tokenizadores: al incluir un SentencePiece propio de 50 000 tokens, permite analizar el efecto del vocabulario en corpus especificos (por ejemplo, codigo o contenido educativo de FineWeb-Edu).

- Base para un fine-tuning posterior orientado a dominio: una vez completado el preentrenamiento, la estructura de `train_sft.py` con enmascaramiento de perdida permite reutilizar el modelo como base para tareas concretas (asistencia tecnica, resumen, Q&A).

- Banco de pruebas para tecnicas de cuantizacion y despliegue: al ser un modelo de ~500M en PyTorch puro, resulta adecuado para experimentar con exportacion a GGUF, cuantizacion int8/int4 y despliegue en CPU o GPU pequenas, siempre que el entrenamiento se complete.

Nota: todos estos casos asumen que el preentrenamiento se finaliza; con el checkpoint actual las salidas de chat no son utilizables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es la perdida de validacion del checkpoint parcial (3,93) y la perplejidad asociada (51), correspondientes a un preentrenamiento detenido en aproximadamente el 43 % del objetivo de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~500M parametros, los pesos ocupan aproximadamente 2 GB en fp32 y 1 GB en fp16, sin contar activaciones ni cache KV (no se especifica la longitud de contexto necesaria).
- VRAM estimada para entrenamiento: la model card documenta el pipeline completo en una RTX 4070 (sin especificar la cantidad de VRAM; los modelos de la serie 4070 suelen contar con 12 GB). No se ofrecen estimaciones para otras GPU.
- GPU recomendadas: RTX 4070 segun la propia model card. No se documentan pruebas en A100, H100 u otras GPU de centro de datos.
- Cabe en GPU consumer: si, la RTX 4070 es el hardware de referencia declarado.
- Opciones de despliegue: el proyecto proporciona scripts propios (`run.bat`, `run.sh`, `Generate.py`) y depende de PyTorch con CUDA, SentencePiece, NumPy y `datasets`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos en formatos GGUF o safetensors.
- Latencia y throughput estimados: no disponible. Solo se reportan tiempos de las etapas de entrenamiento (preentrenamiento ~9-12 h; SFT ~2-4 h; evaluacion ~1 min; catch-up learn ~1-2 min).

## Comparativa con modelos similares

La licencia de Neo no esta declarada, lo que impide una comparacion rigurosa en cuanto a disponibilidad comercial. No hay datos de benchmarks publicados para Neo, por lo que los valores de la tabla no permiten una comparacion de rendimiento. Se incluyen alternativas de tamano similar solo a titulo orientativo.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Estado |
|---|---|---|---|---|---|
| Neo (madhusudhan234) | ~500M | no disponible | no disponible | PyTorch `.pt` | Checkpoint parcial, salida ruidosa |
| Qwen2.5-0.5B | ~500M | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Listo para produccion |
| SmolLM2-360M | ~360M | 8 192 tokens | Apache 2.0 | safetensors, GGUF | Listo para produccion |
| TinyLlama-1.1B | ~1,1B | 2 048 tokens | Apache 2.0 | safetensors, GGUF | Listo para produccion |

Los datos de los modelos alternativos se incluyen a titulo comparativo general; para cifras exactas conviene consultar sus respectivas model cards.

## Limitaciones y advertencias

- Checkpoint incompleto: el preentrenamiento se detuvo en ~1,28 mil millones de tokens frente a un objetivo de 3 mil millones, lo que produce salidas de chat que el autor describe como ruido.
- Perplejidad elevada: 51 en el conjunto de validacion, un valor muy por encima de lo que se considera utilizable para generacion.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribucion ni atribucion. Su uso en produccion conlleva un riesgo legal no resuelto.
- Idiomas no declarados: no se documenta que idiomas soporta el tokenizador ni el modelo.
- Longitud de contexto no disponible: no se especifica la ventana de contexto del transformer ni el tamano maximo de secuencia para el que fue entrenado.
- Sin benchmarks publicados: no hay resultados en MMLU, HumanEval, GSM8K ni conjuntos equivalentes, lo que impide validar sus capacidades.
- Autoaprendizaje con riesgos: el ciclo de fine-tuning continuo puede provocar olvido catastrofico en modelos pequenos, pese a que la model card declara tasas de aprendizaje reducidas y copia de seguridad previa.
- Sin soporte declarado de tool calling, agentes, vision ni audio.
- Dependencia de un unico checkpoint en formato `.pt`: no hay pesos en safetensors ni GGUF, lo que limita su integracion en stacks estandar.
- Ausencia de resultados sobre sesgos o alineacion; en un modelo tan poco entrenado, la alucinacion debe considerarse la salida por defecto.
- Fechas de creacion y actualizacion del repositorio (2026) posteriores a la fecha actual, dato a verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/madhusudhan234/NEO
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios complementarios ni demos.
