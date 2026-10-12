# anovoac/cs329x-hw1-dpo-tinyllama

## Resumen

`anovoac/cs329x-hw1-dpo-tinyllama` es un adaptador de ajuste fino publicado en HuggingFace por el usuario `anovoac`. No se trata de un modelo completo con pesos propios, sino de un checkpoint PEFT (librería `peft`, versión 0.10.0 declarada en la model card) que se aplica sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`. El tamaño del repositorio es de 0,0 GB, lo que es coherente con un adaptador de bajo rango (LoRA) y no con pesos completos. El identificador incluye el sufijo `dpo`, lo que sugiere que el ajuste se realizó mediante optimización directa de preferencias (DPO) sobre el modelo base conversacional.

El autor no ha completado la model card: prácticamente todos los apartados (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación) figuran como `[More Information Needed]`. Tampoco se publican resultados de benchmarks, detalles del dataset de preferencias utilizado ni la configuración exacta del entrenamiento DPO. La única información técnica confirmada es la relación con el modelo base, la librería de adaptadores y el tag `arxiv:1910.09700`, que corresponde a Lacoste et al. (2019), el artículo de la calculadora de impacto medioambiental citada en la plantilla de la model card, no a un paper del propio modelo.

Por el nombre y por los resultados de búsqueda asociados al curso CS 329X (Human-Centered LLMs, Stanford), todo apunta a que se trata de un entregable académico de una práctica introductoria (`hw1`) sobre alineamiento y ajuste por preferencias. Su relevancia es, por tanto, educativa y reproducible antes que de producción: sirve como ejemplo mínimo de un pipeline PEFT + DPO sobre un modelo de 1.100 millones de parámetros que cabe en cualquier GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador (el modelo base TinyLlama es un transformer decoder-only estilo Llama 2) |
| Parametros totales | no disponible para el adaptador; el modelo base TinyLlama-1.1B-Chat-v1.0 tiene aproximadamente 1.100 millones de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base TinyLlama-1.1B-Chat-v1.0 declara 2.048 tokens |
| Tipos de cuantizacion | no disponible en el repositorio; el adaptador se publica en precision completa y la cuantizacion se aplicaria al modelo base fusionado |
| Idiomas soportados | no disponibles (la model card no los declara; los del modelo base son mayoritariamente ingles) |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base TinyLlama se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; etiqueta `peft` y `safetensors`) |
| Modelo base | TinyLlama/TinyLlama-1.1B-Chat-v1.0 |
| Tipo de artefacto | adaptador de ajuste fino (no pesos completos) |
| Libreria | peft 0.10.0 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 10 descargas / 0 likes |
| Fecha de creacion | 2026-10-12 |
| Fecha de actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador mas alla de su naturaleza PEFT. Al ser un adaptador LoRA, la arquitectura efectiva en inferencia es la del modelo base TinyLlama-1.1B-Chat-v1.0 (transformer decoder-only, 1.100 millones de parametros, 2.048 tokens de contexto) mas las matrices de bajo rango inyectadas en determinadas capas. El autor no especifica en que modulos se aplico el adaptador, ni el rango (`r`), ni el `lora_alpha`, ni si se entreno tambien la capa de embedding o la cabeza de lenguaje.

Respecto al entrenamiento, el sufijo `dpo` del identificador y el contexto del curso CS 329X sugieren un ajuste por optimizacion directa de preferencias sobre pares (respuesta elegida, respuesta rechazada), probablemente partiendo de un modelo ya alineado con SFT. No obstante, la model card no aporta ningun dato verificable: ni el dataset de preferencias, ni el numero de pasos, ni la tasa de aprendizaje, ni el regimen de precision (fp32, fp16 o bf16), ni la configuracion de beta del objetivo DPO. El tag `arxiv:1910.09700` no es una referencia metodologica del entrenamiento, sino la cita de la calculadora de impacto de carbono que aparece en la plantilla estandar de HuggingFace. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.).

## Capacidades

- Generacion de texto conversacional: heredada del modelo base TinyLlama-1.1B-Chat-v1.0, orientada a dialogos de un solo turno o de pocos turnos.
- Ajuste por preferencias: el adaptador pretende alinear las respuestas del modelo base con un criterio de preferencia definido por el autor, aunque no se documenta cual.
- Capacidades multilingues: no disponibles; el modelo base esta entrenado predominantemente en ingles y su competencia en castellano es limitada y no verificada.
- Razonamiento y matematicas: no disponibles; el modelo base de 1.100 millones de parametros tiene un rendimiento bajo en tareas de razonamiento multi-paso.
- Generacion de codigo: no disponible; no hay evidencia de entrenamiento especifico en codigo.
- Tool calling / function calling: no disponible; el modelo base no declara soporte nativo de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Fusion con el modelo base: el adaptador puede combinarse mediante `merge_and_unload()` para producir un checkpoint autonomo, lo que constituye su principal via de uso practico.

## Casos de uso

- Material didactico para un pipeline DPO completo: el repositorio sirve como ejemplo minimo de como se guarda y publica un adaptador PEFT tras un entrenamiento por preferencias, util en cursos y talleres sobre alineamiento.
- Reproduccion de experimentos academicos: permite a estudiantes e investigadores cargar el adaptador sobre TinyLlama-1.1B-Chat-v1.0 y comparar el comportamiento antes y despues del ajuste por preferencias.
- Pruebas de concepto de alineamiento en hardware modesto: al tratarse de un adaptador sobre un modelo de 1.100 millones de parametros, todo el ciclo de inferencia y evaluacion cualitativa cabe en una GPU de consumo o incluso en CPU.
- Generacion de texto creativo corto con estilo ajustado: si el dataset de preferencias premiaba un tono o formato concreto, el adaptador puede emplearse para reproducir ese estilo en respuestas breves y de dominio general.
- Prototipado de chatbots ligeros en entornos embebidos o sin conexion: fusionando el adaptador con el modelo base y cuantizando a 4 bits, es viable desplegar un asistente conversacional de baja latencia en un portatil.
- Investigacion sobre degradacion de capacidades tras DPO: resulta util como caso de estudio de como un ajuste por preferencias con pocos datos puede reducir la diversidad o introducir sesgos en un modelo pequeno.
- Base para un segundo ciclo de ajuste: el adaptador puede combinarse con otros adaptadores LoRA o servir de punto de partida para un SFT adicional especifico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor deja el apartado de evaluacion completamente vacio (`[More Information Needed]`) y no se han encontrado resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra prueba en la busqueda web realizada.

## Requisitos de hardware

- El adaptador en si ocupa unos pocos megabytes (el repositorio declara 0,0 GB) y puede cargarse en cualquier maquina.
- El coste real de inferencia lo determina el modelo base TinyLlama-1.1B-Chat-v1.0. Estimaciones orientativas de VRAM, incluyendo pesos y cache KV para una ventana de 2.048 tokens:
  - fp16/bf16: en torno a 2,5-3 GB de VRAM.
  - int8: en torno a 1,5-2 GB.
  - int4 (GGUF Q4_K_M): en torno a 0,8-1,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GTX 1650 de 4 GB en cuantizacion int4 son suficientes.
- Si cabe en GPU de consumo: si, con holgura, en practicamente todas las GPU dedicadas de los ultimos seis anos, y tambien en CPU con llama.cpp.
- Opciones de despliegue:
  - `transformers` + `peft` para cargar el adaptador directamente sobre el modelo base.
  - Fusion del adaptador con `merge_and_unload()` y posterior conversion a GGUF para llama.cpp u Ollama.
  - vLLM con soporte de LoRA (adaptador en caliente sobre el modelo base).
  - Text Generation Inference (TGI) con adaptadores PEFT.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se establece frente al modelo base y a otros modelos pequenos de uso general. Los datos de parametros, contexto y licencia de los modelos alternativos proceden de su documentacion publica y no de la informacion proporcionada en esta ficha; conviene verificarlos antes de tomar decisiones de produccion. En ningun caso se comparan resultados de benchmarks, porque no hay datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| anovoac/cs329x-hw1-dpo-tinyllama | Adaptador sobre 1,1 B | 2.048 tokens (heredado del base) | no disponible | safetensors (PEFT) | Requiere el modelo base; sin benchmarks publicados |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo base; requiere cargar el adaptador aparte |
| aranguiz/dpo_llama_cs329x | no disponible | no disponible | no disponible | no disponible | Entregable similar del mismo curso CS 329X |
| aliu917/cs329x-hw1-dpo-model | no disponible | no disponible | no disponible | no disponible | Entregable similar del mismo curso CS 329X |
| HKArcilla/cs329x-dpo-llama-model | no disponible | no disponible | no disponible | no disponible | Entregable similar, disponible en FriendliAI |

## Limitaciones y advertencias

- Informacion practicamente inexistente: la model card es una plantilla sin rellenar. No hay datos sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia sin declarar: el repositorio no especifica licencia. Aunque el modelo base TinyLlama se distribuye bajo Apache 2.0, la ausencia de licencia en este repositorio impide asumir automaticamente los mismos terminos para el adaptador. No se recomienda su uso comercial sin aclaracion previa del autor.
- Riesgo de alucinacion elevado: el modelo base de 1.100 millones de parametros tiene una tasa alta de fabricacion de hechos, especialmente en dominios especializados.
- Sesgos: no documentados. Al heredar el modelo base, es previsible un sesgo hacia el ingles, hacia contenido de internet de habla inglesa y hacia los sesgos presentes en los datos de preferencias, que tampoco se describen.
- Limitacion de contexto: 2.048 tokens es una ventana muy reducida para tareas de documento largo, resumen extenso o conversaciones multi-turno prolongadas.
- Limitacion de idioma: no hay soporte declarado de castellano ni de otros idiomas; el rendimiento fuera del ingles probablemente sea bajo e irregular.
- Degradacion por DPO no medida: los ajustes por preferencias con datasets pequenos pueden reducir la diversidad de las respuestas, aumentar la verbosidad o provocar olvido catastrofico. No hay evaluacion que descarte estos efectos.
- Idoneidad para produccion: muy baja. Es un artefacto academico con 10 descargas, sin mantenimiento, sin evaluacion y con fechas de creacion y actualizacion identicas, lo que indica que no ha habido revision posterior.
- Trazabilidad limitada: no se puede verificar que el ajuste se hiciera realmente con DPO ni con que datos, mas alla del nombre del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anovoac/cs329x-hw1-dpo-tinyllama
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Curso CS 329X (Human-Centered LLMs, Stanford): https://web.stanford.edu/class/cs329x/index.html
- Proyecto del curso CS 329X: https://web.stanford.edu/class/cs329x/project.html
- Articulo citado en la model card (Lacoste et al., 2019, calculadora de impacto): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- Repositorio similar del mismo curso: https://huggingface.co/aranguiz/dpo_llama_cs329x
- Repositorio similar del mismo curso: https://huggingface.co/aliu917/cs329x-hw1-dpo-model
- Repositorio similar del mismo curso: https://huggingface.co/HKArcilla/cs329x-dpo-llama-model
- Despliegue del modelo similar en FriendliAI: https://friendli.ai/models/HKArcilla/cs329x-dpo-llama-model
