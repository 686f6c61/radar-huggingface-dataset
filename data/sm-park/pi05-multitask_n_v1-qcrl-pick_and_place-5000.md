# sm-park/pi05-multitask_N_v1-qcrl-pick_and_place-5000

## Resumen

pi05-multitask_N_v1-qcrl-pick_and_place-5000 es un checkpoint de robótica derivado de pi 0.5 (openpi), el modelo de política visomotora de Physical Intelligence, afinado por el usuario sm-park mediante QCRL (Quantization-Conditioned Reinforcement Learning) sobre un conjunto multitarea y rollouts de recogida y colocación. La tarea concreta es coger un objeto de maíz y depositarlo en un plato usando un brazo Trossen ViperX de 8 articulaciones más pinza. El modelo está pensado para control robótico de imitación, no para generación de texto.

El checkpoint contiene 4.143.404.816 parámetros almacenados en safetensors (8,6 GB de repositorio) e incorpora cuantización NVFP4 W4A4 aplicada al modelo de lenguaje interno, aunque los pesos se guardan en BF16/FP32 junto con escalas de cuantización, no en formato empaquetado de 4 bits. La inferencia requiere un cargador específico del repositorio QCRL, no `AutoModel.from_pretrained`, y un entorno Linux x86-64 con Python 3.11, `uv` y driver NVIDIA compatible con CUDA 12.8.

Su relevancia es acotada pero técnica: documenta un flujo de posentrenamiento con RL sobre un modelo de política cuantizado y publica una comparación offline frente a QAT, con error articular conjunto/pinza de 0,815/3,205 frente a 1,138/3,987 en ventanas de validación de rollouts FP. No hay métricas de éxito real en robot ni benchmarks estándar de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visomotora pi 0.5 (openpi) con modelo de lenguaje interno cuantizado en NVFP4 W4A4; no disponible el detalle exacto de capas |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 sobre el modelo de lenguaje (`--quant-scope lm`); pesos almacenados en BF16/FP32 con escalas, no empaquetados en 4 bits; ruta de cuantización falsa evaluada sin `--packed` |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (más `quant_state.safetensors` y `assets/`) |

## Arquitectura y entrenamiento

El modelo parte de pi 0.5, una política visomotora que combina un modelo de lenguaje preentrenado con un cabezal de acciones y un esquema de difusión/flow para generar trayectorias. La variante publicada aplica NVFP4 W4A4 únicamente al modelo de lenguaje, manteniendo el resto de componentes en mayor precisión. La inferencia usa muestreo eager con 10 pasos de denoising y produce acciones de forma `actions[50, 9]` en coordenadas absolutas, a partir de un estado nativo `float32[9]` y dos cámaras (`cam_high` y `cam_right_wrist`) con imágenes RGB `uint8` de forma `(3, 224, 224)`.

El entrenamiento combina SFT sobre demostraciones del dataset `sm-park/multitask_combined_N_v1` con rollouts de política de los datasets `J1One/pick_and_place_QCRL_FP_rollout_pi0.5` y `J1One/pick_and_place_QCRL_PTQ_rollout_pi0.5`, y un ajuste QCRL de 5.000 pasos. La innovación declarada es el condicionamiento por cuantización dentro del bucle de RL, con una condición de despliegue (`--condition deploy`) que añade al prompt las líneas `Advantage: positive` y `Source: reference` para seleccionar comportamiento de referencia positivo. No se especifican el número de tokens, la composición exacta del dataset ni si hubo DPO u otras fases de alineamiento.

## Capacidades

- Control robótico de imitación para una tarea concreta: recoger el maíz y colocarlo en el plato con un Trossen ViperX de 8 articulaciones más pinza.
- Generación de secuencias de acción de 50 pasos y 9 dimensiones en coordenadas absolutas, con normalización suministrada por el servidor.
- Procesamiento multimodal de entrada: estado proprioceptivo de 9 dimensiones y dos vistas de cámara a 224x224.
- Ejecución en modo servidor mediante WebSocket con el formato de openpi (`integrations/openpi/serve_policy_qcrl.py`).
- Condicionamiento de comportamiento mediante prompt de sistema (`Advantage`/`Source`) para seleccionar política de referencia positiva.
- Cuantización NVFP4 del modelo de lenguaje para reducir el coste de cómputo en inferencia.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger el maíz y dejarlo en el plato sobre un ViperX real, sirviendo como política de referencia para experimentos de manipulación con un solo objeto.
- Investigación en cuantización de políticas robóticas: al aplicar NVFP4 W4A4 solo al modelo de lenguaje, permite medir el impacto de la cuantización en el error de acción frente a la variante QAT, con la comparación offline ya publicada.
- Estudio de RL post-entrenamiento para VLA: el ajuste QCRL de 5.000 pasos sobre SFT más rollouts FP/PTQ es un caso reproducible para analizar cómo el condicionamiento por cuantización afecta a la política final.
- Banco de pruebas de infraestructura openpi: el checkpoint y su overlay de runtime permiten validar el cargador, el servidor WebSocket y el pipeline de normalización antes de desplegar políticas propias.
- Evaluación offline de políticas: las ventanas de validación de rollouts FP (10 episodios, 80 ventanas) permiten comparar MAE articular y de pinza entre checkpoints sin necesidad de robot físico.
- Base para adaptación a tareas multitarea: al proceder de un modelo multitarea N, puede servir de punto de partida para afinar nuevas tareas de pick-and-place con el mismo hardware Trossen.
- Docencia y reproducción: el flujo de descarga, clonado del repositorio QCRL en un commit fijo y arranque del servidor es un ejemplo completo de despliegue de una política VLA cuantizada.

## Benchmarks y rendimiento

| Metrica | QCRL | QAT |
|---|---|---|
| MAE articular conjunto a 50 pasos (validación FP, 10 episodios, 80 ventanas) | 0,815 | 1,138 |
| MAE de pinza a 50 pasos (misma validación) | 3,205 | 3,987 |

Los datos proceden de comparaciones offline de acción sobre episodios excluidos del entrenamiento de política pero usados para validación de valor. El autor indica que el error de acción SFT y el error articular al inicio de episodio fueron superiores a QAT, y que estas cifras no son tasas de éxito en robot. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 8,6 GB y los pesos se almacenan en BF16/FP32 con escalas de cuantización, por lo que el consumo real supera el de un empaquetado de 4 bits.
- GPU recomendadas: no disponible; el ejemplo de ejecución usa una GPU física identificada como `cuda:0` tras fijar `CUDA_VISIBLE_DEVICES=3`, sin especificar modelo.
- Cabe en GPU de consumo: no disponible; no se indica VRAM mínima ni modelos soportados.
- Driver y sistema: Linux x86-64, Python 3.11, `uv`, CLI de Hugging Face y driver NVIDIA compatible con CUDA 12.8.
- Despliegue: servidor propio del repositorio QCRL (`integrations/openpi/serve_policy_qcrl.py`) sobre WebSocket en el puerto 8000; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica muestreo eager con 10 pasos de denoising.
- Nota de entorno: las versiones de paquetes probadas están en `runtime_versions.json` y una instalación limpia no ha sido revalidada según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-multitask_N_v1-qcrl-pick_and_place-5000 | 4.143.404.816 | no disponible | Política VLA pi 0.5 con QCRL y NVFP4 W4A4 | no disponible | Hugging Face, requiere repositorio QCRL |
| Variante QAT del mismo autor (referencia en la model card) | no disponible | no disponible | Misma base con quantización-aware training | no disponible | Referenciada solo como comparación |
| pi 0.5 base (openpi) | no disponible en esta información | no disponible | Política visomotora generalista | no disponible | Repositorio openpi |

No se dispone de datos suficientes para comparar con alternativas de otros autores (por ejemplo, otras políticas VLA del mismo tamaño) en parámetros, contexto o rendimiento; esa comparación se indica como no disponible.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea y un único robot (Trossen ViperX de 8 articulaciones más pinza); no es un modelo generalista.
- Las métricas publicadas son errores offline de acción, no tasas de éxito en robot; el autor lo advierte explícitamente.
- El error de acción SFT y el error articular al inicio de episodio fueron superiores a QAT, lo que sugiere peor comportamiento en algunas fases.
- No se puede cargar con `AutoModel.from_pretrained`; requiere el cargador del repositorio QCRL en el commit `86b38396f20341980666b269e8c811d597c0e844` y el overlay de runtime.
- La cuantización NVFP4 se aplica solo al modelo de lenguaje y los pesos no están empaquetados en 4 bits, por lo que el ahorro de memoria no es el de un checkpoint W4A4 convencional.
- El prompt de despliegue debe enviarse solo con la instrucción de tarea; el servidor añade `Advantage: positive` y `Source: reference`, y duplicarlas provoca un condicionamiento incorrecto.
- Idiomas: solo inglés; no hay soporte multilingüe documentado.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; en políticas robóticas el riesgo equivalente es la ejecución de trayectorias fuera de distribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Entorno de instalación no revalidado desde cero según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sm-park/pi05-multitask_N_v1-qcrl-pick_and_place-5000
- Repositorio QCRL: https://github.com/Seong-min-Park/QCRL
- Commit de inferencia: https://github.com/Seong-min-Park/QCRL/commit/86b38396f20341980666b269e8c811d597c0e844
- Dataset multitarea: https://huggingface.co/datasets/sm-park/multitask_combined_N_v1
- Rollouts FP: https://huggingface.co/datasets/J1One/pick_and_place_QCRL_FP_rollout_pi0.5
- Rollouts PTQ: https://huggingface.co/datasets/J1One/pick_and_place_QCRL_PTQ_rollout_pi0.5
- Resumen de evaluación: https://huggingface.co/sm-park/pi05-multitask_N_v1-qcrl-pick_and_place-5000/blob/main/evaluation_summary.json
- Versiones de runtime: https://huggingface.co/sm-park/pi05-multitask_N_v1-qcrl-pick_and_place-5000/blob/main/runtime_versions.json
