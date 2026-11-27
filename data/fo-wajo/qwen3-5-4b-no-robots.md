# fo-wajo/Qwen3.5-4B-no-robots

## Resumen

Qwen3.5-4B-no-robots es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base togethercomputer/Qwen3.5-4B, publicado por el usuario fo-wajo a través de la plataforma Adaption Labs (proveedor Together AI). El adaptador se entrena sobre el conjunto de instrucciones HuggingFaceH4/no_robots, compuesto por 9.998 filas, y se distribuye como un delta LoRA de aproximadamente 170 MB dentro de un repositorio de 0,2 GB en formato safetensors.

El interés de esta ficha es doble. Por un lado, documenta un flujo de trabajo reproducible de fine-tuning LoRA sobre un modelo Qwen3.5 de 4.000 millones de parámetros, con una configuración explícita (r=32, alpha=64, dropout=0,05, 3 épocas, 138 pasos de optimizador). Por otro, el propio autor publica una evaluación comparativa ciega contra el modelo base que arroja paridad estadística: 49,74 % de victorias frente a 50,26 % del base, con 53 empates sobre 191 muestras válidas.

Es relevante ahora porque ejemplifica una práctica creciente: publicar adaptadores pequeños con evaluación honesta (incluida la ausencia de mejora) en lugar de reclamar ganancias no verificadas. El adaptador no añade capacidades nuevas apreciables; su valor es metodológico y de trazabilidad. La información disponible sobre el modelo base (arquitectura interna, contexto, licencia) no viene detallada en la model card, por lo que varios campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Qwen3.5; arquitectura interna del base no disponible |
| Parametros totales | No disponible (el base se denomina 4B; el adaptador es un delta LoRA de ~170 MB) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (tag `en`) |
| Licencia | No disponible; la model card indica que se aplican la licencia y terminos del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 32 |
| Alpha LoRA | 64 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Dataset de entrenamiento | HuggingFaceH4/no_robots (9.998 filas) |
| Epocas / pasos | 3 epocas / 138 pasos de optimizador |
| Learning rate | 5e-05, schedule lineal, 3 % warmup |
| Objetivo | SFT con train_on_inputs=false |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de bajo rango sobre el modelo Qwen3.5-4B. Se inyectan matrices de descomposicion en los siete modulos lineales habituales del transformer (proyecciones de atencion q/k/v/o y proyecciones del MLP gate/up/down), con rango 32, alpha 64 y dropout 0,05. El entrenamiento es SFT puro con `train_on_inputs=false`, es decir, la perdida se calcula solo sobre los tokens de respuesta, no sobre el prompt. Se ejecutan 3 epocas sobre las 9.998 filas de no_robots, lo que se traduce en 138 pasos de optimizador con learning rate 5e-05, schedule lineal y un 3 % de warmup.

No se documenta en la informacion disponible ningun proceso de RLHF, DPO, decodificacion especulativa ni innovacion arquitectonica adicional. El modelo base Qwen3.5-4B se referencia por su identificador en Hugging Face (togethercomputer/Qwen3.5-4B), pero su arquitectura detallada, composicion del corpus de preentrenamiento y numero de tokens no aparecen en la model card. La serie de la que forma parte este adaptador incluye otras dos ejecuciones LoRA sobre el mismo dataset, con win rates de 49,48 % y 45,81 %, lo que sugiere un estudio deliberado sobre el compromiso entre volumen de datos y numero de epocas.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Qwen3.5-4B.
- Ajuste fino sobre instrucciones conversacionales del dataset no_robots, orientado a respuestas utiles y concisas.
- Carga directa mediante `peft` y `transformers`, compatible con el ecosistema Hugging Face.
- Capacidad de fusionar el adaptador con el base (merge) para despliegue sin PEFT, aunque no se documenta explicitamente en la model card.
- Razonamiento, codigo, matematicas o tool calling: no documentados en la informacion disponible; dependen del modelo base y no se verifican en esta ficha.
- Capacidades multilingues: limitadas al ingles segun el tag de idioma declarado.
- Modo thinking: la evaluacion se realizo con thinking desactivado, pero no se especifica si el base soporta modo thinking.

## Casos de uso

- Experimentacion academica con LoRA: el adaptador sirve como referencia reproducible de un SFT con hiperparametros concretos (r=32, alpha=64, 3 epocas) sobre un dataset publico de 10.000 filas, util para comparar metodologias de ajuste.
- Estudio del compromiso datos/epocas: al formar parte de una serie de tres ejecuciones con win rates distintos (49,74 %, 49,48 %, 45,81 %), permite analizar como varia la calidad con el volumen de datos y las epocas.
- Base para fine-tuning posterior: al ser un delta pequeno (~170 MB), puede combinarse o continuarse con otros adaptadores en pipelines de investigacion sin duplicar el almacenamiento del modelo completo.
- Evaluacion de metodologias de juicio automatico: el uso de `google/gemini-3.1-pro-preview` como juez ciego con 191 muestras es un caso practico de diseno de evaluaciones LLM-as-a-judge que puede replicarse.
- Despliegue ligero en entornos con recursos limitados: al requerir solo el base de 4B mas un delta de 170 MB, encaja en escenarios de prototipado donde no se quiere servir un modelo mayor.
- Docencia y formacion: ejemplo didactico de publicacion de un adaptador LoRA con model card estructurada, configuracion de entrenamiento y resultados de evaluacion transparentes.

## Benchmarks y rendimiento

Evaluacion publicada por el autor mediante el motor interno de Adaption (in-house-v1): comparacion ciega por pares contra el modelo base, 191 muestras validas, juez `google/gemini-3.1-pro-preview` a temperatura 0, generacion de hasta 16.384 tokens con temperatura 0,7 y thinking desactivado.

| Modelo | Win rate | Derrotas | Empates |
|---|---|---|---|
| Este adaptador (7c5c6913) | 49,74 % | 50,26 % | 53 (compartidos) |
| Base Qwen3.5-4B | 50,26 % | 49,74 % | 53 (compartidos) |

Resultado declarado por el autor: paridad estadistica con el modelo base tras 3 epocas sobre un conjunto de 10.000 instrucciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo base de 4B en precision completa se requieren del orden de 8-10 GB, y en cuantizacion de 4 bits alrededor de 3-4 GB, aunque estos valores no se confirman en la model card.
- El adaptador LoRA en si ocupa aproximadamente 170 MB y se suma a los pesos del base.
- GPU recomendadas: no especificadas; por tamano del base (4B) cabria en GPU consumer tipo RTX 4090, RTX 3090 o RTX 4070 Ti, si bien no hay confirmacion oficial.
- Opciones de despliegue: carga via `peft` + `transformers` segun la model card; otras opciones (vLLM, llama.cpp, Ollama, TGI) no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado evaluado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-no-robots (este) | Base 4B + LoRA r=32 | No disponible | 49,74 % win rate vs base | La del base (no disponible) | Hugging Face |
| Qwen3.5-4B (base) | 4B | No disponible | 50,26 % win rate vs adaptador | No disponible | Hugging Face (togethercomputer) |
| Ejecucion LoRA 2 de la serie | Base 4B + LoRA | No disponible | 49,48 % win rate | La del base | Referenciada en la model card |
| Ejecucion LoRA 3 de la serie | Base 4B + LoRA | No disponible | 45,81 % win rate | La del base | Referenciada en la model card |

No se dispone de datos para comparar con alternativas externas de la misma categoria (otros adaptadores SFT sobre Qwen u otros modelos de 4B) en la informacion proporcionada.

## Limitaciones y advertencias

- Paridad, no mejora: la evaluacion del propio autor muestra 49,74 % de victorias frente a 50,26 % del base, sin evidencia de ganancia de calidad.
- Evaluacion limitada: 191 muestras validas, juez automatico (Gemini 3.1 Pro Preview) y motor interno no auditado; no sustituye a benchmarks estandar.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta verificado.
- Licencia: no disponible de forma explicita; la model card remite a la licencia y terminos del modelo base, que deben consultarse antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos: no documentados; el dataset no_robots puede introducir sesgos propios de su composicion.
- Contexto: longitud de contexto del base no disponible, lo que impide planificar despliegues con ventanas largas.
- Modelo base: al depender de togethercomputer/Qwen3.5-4B, cualquier cambio o retirada de ese repositorio afecta a la reproducibilidad.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/fo-wajo/Qwen3.5-4B-no-robots
- Modelo base: https://huggingface.co/togethercomputer/Qwen3.5-4B
- Dataset no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Plataforma Adaption Labs: no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
