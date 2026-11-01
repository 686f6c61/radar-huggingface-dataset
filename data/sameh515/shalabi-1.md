# Sameh515/Shalabi-1

## Resumen

Shalabi-1 es un adaptador LoRA nativo de MLX publicado por Sameh Shalabi sobre el checkpoint cuantizado a 4 bits `mlx-community/Qwen3.5-9B-4bit`. No es un modelo generativo de propósito general, sino un clasificador de decisión restringido a tres clases: USE_TOOL (A), ASK_USER (B) y FINISH (C). Dado un prompt con una petición, una lista de herramientas disponibles en texto plano y el estado observado, el adaptador emite una de esas tres etiquetas mediante la lectura de tres logits y su softmax. El modelo no selecciona la herramienta concreta ni sus argumentos, no ejecuta acciones externas y no genera la respuesta final.

El proyecto se presenta explícitamente como un experimento educativo de aprendizaje local, no como un sistema listo para producción. El adaptador añade únicamente 139.264 parámetros entrenables en las proyecciones `q_proj` y `v_proj` del bloque de atención completa 31 del backbone congelado, con rango 8 y escala MLX 20. El entrenamiento se completó en 49,8 segundos sobre un Apple M5 Max con 128 GB de memoria unificada, con un pico de 5,77 GB de memoria asignada por MLX.

Su relevancia es metodológica más que de capacidades: documenta con transparencia un flujo completo de ajuste fino (datos sintéticos, partición por familias, selección de checkpoint por pérdida de validación, evaluación retenida y reporte de regresiones) sobre un modelo base de 9B cuantizado a 4 bits. La ganancia observada en precisión es de +0,0 puntos porcentuales (59/60 en ambos casos), con una mejora en la pérdida de decisión restringida de 0,080609 a 0,035176.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso Qwen3.5 (backbone congelado a 4 bits, MLX) |
| Parametros totales | 139.264 parametros entrenables en el adaptador; backbone de 9B congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Limite practico de 256 tokens formateados; entradas superiores se rechazan, no se truncan |
| Tipos de cuantizacion | Backbone base en 4 bits (checkpoint `mlx-community/Qwen3.5-9B-4bit`); adaptador LoRA en precision nativa MLX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos MLX (libreria `mlx`); repositorio de 0,0 GB, con posible `project.zip` que debe extraerse |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer denso Qwen3.5 de 9B cuantizado a 4 bits y congelado. Las únicas modificaciones entrenables son adiciones LoRA en `self_attn.q_proj` y `self_attn.v_proj` del bloque de atención completa 31, con rango 8, escala MLX nativa de 20 y dropout 0. La pérdida es entropía cruzada sobre los mismos tres logits (A/B/C) que se usan en predicción, sin tokens de padding ni de formato en el cálculo. El modo de avance es `eval` con gradientes del adaptador habilitados.

Los datos consisten en 180 ejemplos sintéticos originales organizados en 60 familias de tres estados; cada familia contiene la misma petición con un estado observado distinto por fila. La partición es 90/30/60 para entrenamiento/validación/prueba, estratificada por familia completa y con clases balanceadas. El entrenamiento usó batch size 1, Adam a 5e-5, semilla 42 y 270 actualizaciones. El checkpoint seleccionado fue el de la actualización 270, por menor pérdida de decisión sobre los 30 ejemplos de validación (0,004502 frente a 0,054082 en la actualización 0, 0,018945 en la 90 y 0,027692 en la 180). La evaluación de prueba se realizó después de la selección del checkpoint y no se usó para ajuste. Código, prompt, configuración y datos se hashearon antes del entrenamiento.

## Capacidades

- Clasificación de decisión en tres clases restringidas: USE_TOOL, ASK_USER y FINISH.
- Lectura de una lista de herramientas en texto plano (no un esquema nativo `tools=`) junto con la petición y el estado observado.
- Prioridad de decisión documentada: primero finalización verificada, después herramientas permitidas útiles, después información necesaria del usuario y, por último, incapacidad confirmada.
- Emisión de puntuaciones como softmax de tres logits, sin calibración de confianza ni umbral de abstención ajustado.
- No selecciona la herramienta concreta ni sus argumentos.
- No ejecuta acciones externas ni genera la respuesta final al usuario.
- No soporta tool calling nativo, agentes multi-paso ni razonamiento extendido como interfaz.
- Uso únicamente en inglés.
- Interfaz exclusiva a través del wrapper de predicción `next_step.py`; la generación de texto genérica no es su interfaz.

## Casos de uso

- Enrutamiento de decisiones en un pipeline de agentes: el adaptador puede insertarse como clasificador previo que decide si el orquestador debe invocar una herramienta, pedir aclaración al usuario o cerrar el turno, siempre que el wrapper gestione la ejecución posterior.
- Material didáctico para aprendizaje de ajuste fino: el repositorio documenta el flujo completo (datos, partición por familias, selección de checkpoint, evaluación retenida) y sirve como ejercicio reproducible en MLX sobre Apple Silicon.
- Prototipado de políticas de control en asistentes conversacionales: permite experimentar con la lógica de "herramienta antes que pregunta, pregunta antes que cierre" sin entrenar un modelo desde cero.
- Investigación sobre clasificación restringida con modelos grandes cuantizados: útil para estudiar si un adaptador de 139.264 parámetros modifica el comportamiento de decisión de un backbone de 9B a 4 bits.
- Evaluación de metodologías de reporte transparente: el repositorio incluye matrices de confusión, predicciones exactas e intervalos bootstrap por familia, lo que facilita replicar el análisis estadístico.
- Docencia sobre límites de los benchmarks sintéticos: el propio autor advierte que los resultados no son una estimación de capacidad general ni una garantía de seguridad, lo que lo convierte en un caso de estudio sobre interpretación de métricas.
- Experimentación local en macOS: el adaptador y el backbone caben en memoria unificada de un Apple Silicon (unos 6 GB de disco para los pesos base y 5,77 GB de pico durante el entrenamiento en un M5 Max), lo que permite probar el flujo sin GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 60 ejemplos sintéticos originales en 20 familias de escenarios retenidas:

| Medicion | Modelo base preentrenado | Shalabi-1 entrenado |
|---|---:|---:|
| Correctos | 59/60 | 59/60 |
| Precision | 98,3% | 98,3% |
| FINISH prematuro | 0/40 | 0/40 |
| Las 3 clases correctas en una familia | 19/20 | 19/20 |
| Perdida de decision restringida media | 0,080609 | 0,035176 |

Desglose por clase gold:

| Clase gold | Base correcto | Adaptador correcto |
|---|---:|---:|
| USE_TOOL | 19/20 | 20/20 |
| ASK_USER | 20/20 | 20/20 |
| FINISH | 20/20 | 19/20 |

Cambio observado de precisión: +0,0 puntos porcentuales. Intervalo bootstrap pareado por familia al 95% (10.000 remuestreos, semilla 42): [-5,0, +5,0] puntos. El autor indica que este intervalo describe un experimento sintético pequeño y no constituye una estimación de capacidad general ni una garantía de seguridad. Errores corregidos: 1; errores nuevos: 1. Las puntuaciones son softmax de tres logits y no están calibradas como confianza.

## Requisitos de hardware

- Pesos base: aproximadamente 6 GB de disco para el checkpoint `mlx-community/Qwen3.5-9B-4bit`.
- Memoria: pico de 5,77 GB de memoria asignada por MLX durante el entrenamiento en un Apple M5 Max con 128 GB de memoria unificada; no es un requisito para otras máquinas ni representa la RAM total del sistema.
- Plataforma: Apple Silicon con Metal; Python 3.12 y MLX. La compatibilidad y el uso de memoria en otras máquinas no han sido probados.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el proyecto está diseñado para MLX en Apple Silicon y no documenta despliegue en CUDA.
- Opciones de despliegue: ejecución local mediante `uv sync --frozen` y `uv run python next_step.py predict --input examples/request.json --adapter .`; el wrapper acepta JSON y JSONL y puede guardar resultados con `--output predictions.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta un tiempo de entrenamiento de 49,8 segundos incluyendo validación periódica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shalabi-1 | 139.264 entrenables sobre backbone de 9B a 4 bits | 256 tokens formateados | Clasificador de decisión A/B/C | Apache-2.0 | HuggingFace, MLX |
| Modelo base `mlx-community/Qwen3.5-9B-4bit` | 9B | No disponible en la informacion proporcionada | Generación de texto cuantizada | Apache-2.0 (según repositorios upstream citados) | HuggingFace, MLX |
| Qwen3.5-9B / Qwen3.5-9B-Base | 9B | No disponible en la informacion proporcionada | Modelo generativo denso | Apache-2.0 | HuggingFace |

No se dispone de datos sobre otros clasificadores de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo generativo: no produce respuestas finales, no selecciona herramientas ni argumentos y no ejecuta acciones externas.
- Debe usarse exclusivamente a través del wrapper de predicción; la generación de texto genérica no es su interfaz.
- Las herramientas se pasan como texto plano, no mediante un esquema nativo `tools=`.
- Las entradas de más de 256 tokens formateados se rechazan en lugar de truncarse, lo que limita peticiones largas o listas extensas de herramientas.
- Las puntuaciones son softmax de tres logits sin calibración de confianza; no se ajustó ningún umbral de abstención.
- No existe evaluación de seguridad frente a entradas adversarias.
- La evaluación se basa en 60 ejemplos sintéticos en 20 familias; el propio autor advierte que no es una estimación de capacidad general ni una garantía de seguridad.
- El intervalo bootstrap al 95% [-5,0, +5,0] puntos incluye el cero, por lo que la mejora en precisión no es concluyente.
- El adaptador introduce una regresión: un caso FINISH pasa a clasificarse incorrectamente, mientras que se corrige un caso USE_TOOL.
- Limitación de linaje: la metadata de la model card del checkpoint comunitario fijado identifica `Qwen/Qwen3.5-9B-Base`, mientras que su descripción identifica `Qwen/Qwen3.5-9B`; el linaje real de pesos upstream no se estableció de forma independiente. Ambos repositorios upstream declaran Apache-2.0, pero esta release no reclama una conversión directa desde ninguno de ellos.
- Solo soporta inglés.
- Solo se ha probado en un Apple M5 Max con 128 GB de memoria unificada; el comportamiento en otros equipos es desconocido.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que refleja una adopción prácticamente nula.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo se presenta como experimento educativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sameh515/Shalabi-1
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/sam-shalabi/
- Modelo base en HuggingFace: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
- Repositorio upstream citado (base): https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio upstream citado (instruct): https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de uv: https://docs.astral.sh/uv/
