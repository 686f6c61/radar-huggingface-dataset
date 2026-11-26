# chibubu/gelatin-base-mellow

## Resumen

Gelatin Base — Mellow v0 es un checkpoint de un modelo de audio-lenguaje desarrollado por Chibuzor Okocha (usuario `chibubu` en Hugging Face) como punto de partida para los experimentos presentados en el artículo "Does Learned Boundary Prediction Improve Audio Tokenization?" (ICASSP 2027). El modelo combina un codificador de audio HTSAT preentrenado en AudioSet con un modelo de lenguaje SmolLM2-135M, unidos mediante un proyector lineal, y sigue el pipeline `audio-text-to-text`.

Se trata de un baseline de investigación, no de un modelo orientado a producción: emplea un esquema de pooling fijo de 8x promedio que comprime la representación del codificador en 128 tokens de audio antes de inyectarlos en el modelo de lenguaje. Su relevancia es metodológica, ya que sirve como referencia contra la que se comparan las variantes v1 del proyecto (Pred-Only y Zero-Shot) que introducen predicción de fronteras aprendida para la tokenización de audio.

El repositorio es pequeño (0,8 GB) e incluye dos ficheros de pesos: el checkpoint completo del modelo Mellow (640 MB) y el codificador HTSAT (122 MB). Está publicado bajo licencia MIT y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio HTSAT + proyector lineal + LLM SmolLM2-135M |
| Parametros totales | no disponible (el LLM es SmolLM2-135M; el codificador HTSAT no declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema modular clasico de modelo audio-lenguaje: un codificador de audio HTSAT preentrenado en AudioSet que produce representaciones de 768 dimensiones, un pooling promedio fijo de factor 8 que reduce la secuencia a 128 tokens de audio, un proyector lineal de 768 a 576 dimensiones y un modelo de lenguaje SmolLM2-135M que consume los tokens de audio proyectados junto con el texto. El presupuesto de tokens de audio es fijo en 128, lo que constituye el punto de comparacion del estudio.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset (mas alla de la referencia a `reasonaqa` como dataset asociado en las etiquetas), ni si se aplicaron etapas de RLHF o DPO. El modelo se presenta explicitamente como baseline preentrenado del proyecto Mellow v0, y el articulo asociado (ICASSP 2027) evalua si la prediccion aprendida de fronteras mejora la tokenizacion de audio frente a este pooling fijo.

## Capacidades

- Generacion de texto condicionada por audio (pipeline `audio-text-to-text`).
- Descripcion de audio y captioning (evaluado con AudioCaps y Clotho).
- Comprension de audio y respuesta a preguntas sobre audio (evaluado con MMAU).
- Procesamiento de audio en ingles exclusivamente.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara modo de pensamiento (thinking), vision ni otras modalidades.

## Casos de uso

- Referencia de investigacion en tokenizacion de audio: sirve como baseline fijo de 128 tokens para comparar metodos de pooling aprendido o prediccion de fronteras en experimentos academicos.
- Reproduccion de resultados del articulo ICASSP 2027: permite replicar las cifras de MMAU, AudioCaps y Clotho reportadas por el autor.
- Prototipado de captioning de audio en ingles: con CIDEr de 0,379 en AudioCaps, es util para validar pipelines de descripcion automatica de sonido antes de escalar a modelos mayores.
- Evaluacion de arquitecturas encoder-LLM ligeras: al combinar HTSAT con SmolLM2-135M, sirve para estudiar el coste/beneficio de proyectores lineales simples en modelos de audio-lenguaje de bajo parametraje.
- Docencia y experimentacion academica: su tamano reducido (0,8 GB de repositorio) y licencia MIT facilitan su uso en cursos y laboratorios sin restricciones comerciales.
- Base para fine-tuning en tareas de audio especificas: al ser un checkpoint preentrenado, puede adaptarse a dominios concretos (clasificacion de eventos sonoros, QA sobre audio) partiendo de sus pesos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Gelatin Base — Mellow v0 |
|---|---|---|
| MMAU | Accuracy | 35,2% |
| AudioCaps | CIDEr | 0,379 |
| Clotho | CIDEr | 0,246 |
| Token budget | Tokens de audio | 128 (fijo) |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un LLM de 135M de parametros y un codificador HTSAT, el checkpoint completo ocupa aproximadamente 0,76 GB en disco, por lo que la inferencia en precision completa deberia caber holgadamente en GPUs consumer.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) deberia ser suficiente, aunque el autor no lo especifica.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no se confirma en la documentacion.
- Opciones de despliegue: no disponible; los pesos se distribuyen como checkpoints PyTorch (`.ckpt`), no como GGUF ni safetensors, por lo que requiere cargar el codigo del repositorio GitHub del proyecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gelatin Base — Mellow v0 | HTSAT + SmolLM2-135M | no disponible | MMAU 35,2%; AudioCaps CIDEr 0,379; Clotho CIDEr 0,246 | MIT | Hugging Face (checkpoint PyTorch) |
| Gelatin v1 Pred-Only | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| Gelatin v1 Zero-Shot | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Hugging Face |

No se dispone de datos de benchmarks de las variantes v1 en la informacion proporcionada, por lo que la comparacion cuantitativa con ellas no es posible. No se identifican en la informacion disponible otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Modelo de investigacion: es un baseline preentrenado, no un modelo afinado para produccion; su rendimiento en MMAU (35,2%) es bajo en terminos absolutos.
- Solo soporta ingles; no se declara cobertura multilingue.
- Presupuesto de tokens de audio fijo en 128, lo que limita la granularidad temporal en audios largos o complejos.
- No se documentan sesgos concretos, pero al derivar de HTSAT/AudioSet y SmolLM2 puede heredar sesgos de esos modelos base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se reportan evaluaciones de fidelidad mas alla de CIDEr.
- Licencia MIT: permite uso comercial, pero al incorporar componentes de terceros (HTSAT, SmolLM2) conviene verificar las licencias de esos modelos base.
- Formato de pesos en `.ckpt` (PyTorch), sin versiones GGUF ni safetensors publicadas, lo que complica el despliegue con herramientas estandar como llama.cpp u Ollama.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/chibubu/gelatin-base-mellow
- Repositorio GitHub: https://github.com/unruli/Gelatin
- Gelatin v1 Pred-Only: https://huggingface.co/chibubu/gelatin-v1-pred-only
- Gelatin v1 Zero-Shot: https://huggingface.co/chibubu/gelatin-v1-zero-shot
