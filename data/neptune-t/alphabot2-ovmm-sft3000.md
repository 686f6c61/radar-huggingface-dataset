# Neptune-T/alphabot2-ovmm-sft3000

## Resumen

AlphaBot2 OVMM SFT3000 es una política de control robótico (visión-lenguaje-acción) publicada por el usuario Neptune-T como copia de compartición del checkpoint congelado `manip_recovery_opt_v1/ckpt_step0003000/policy`, utilizado como baseline SFT en una publicación de OVMM (Object-Goal Visual Manipulation and Navigation) asistida por planificador del 30 de octubre de 2026. No es un modelo de lenguaje generativo al uso, sino un policy export de Pi0.5 (familia pi05) en formato LeRobot, derivado por fine-tuning del modelo base `alphabot2/aibot2_grab_bag_combined_over_under_pi05`.

El modelo recibe como entrada un vector de estado de 16 dimensiones, texto de tarea y seis imágenes RGB ordenadas (`camera_left`, `camera_right`, `camera_top`, `camera_top_h5`, `camera_top_h10`, `camera_top_h15`), y emite un chunk de acciones de 50 pasos con 18 dimensiones. Con 4.143.404.816 parámetros en FP32 y un repositorio de 16,6 GB, está pensado para ejecutarse en el runtime LeRobot pi0.5 con un servidor de política incluido en `release/code/scripts/alphabot2_pi05/`.

Su relevancia es acotada pero concreta: documenta de forma reproducible un baseline SFT de manipulación y navegación con correcciones NAV, con hashes SHA256, configuración de entrenamiento y evidencia de evaluación. Los resultados publicados son de simulador asistido por planificador con goal privilegiado, no de robot real ni de navegación end-to-end pura, lo que limita su uso directo en producción sin trabajo adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (política visión-lenguaje-acción, familia pi05) sobre runtime LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada: state16 + texto de tarea + 6 cámaras RGB; salida: chunk de 50 pasos × 18 dimensiones) |
| Tipos de cuantizacion | no disponible; los pesos del repositorio son FP32 |
| Idiomas soportados | no disponible (el texto de tarea se procesa con tokenizer PaliGemma incluido) |
| Licencia | no disponible; la model card indica que no se concede licencia nueva sobre los activos upstream |
| Formato de pesos | safetensors (FP32), más config, pre/postprocesadores, tensores de normalización y tokenizer |
| Modelo base | alphabot2/aibot2_grab_bag_combined_over_under_pi05 |
| Dataset de entrenamiento | Neptune-T/alphabot2-ovmm-sft |
| Hash SHA256 del modelo | d66831b7b4bef0d19050bdc1ba165c1ebc3b73008c872d8865354ecab696b413 |
| Tamaño del repositorio | 16,6 GB |

## Arquitectura y entrenamiento

La política sigue la arquitectura Pi0.5 integrada en LeRobot, con un tokenizer PaliGemma (`paligemma_tokenizer.model`) para el texto de tarea y un contrato de E/S estricto: estado de 16 dimensiones, seis claves RGB ordenadas y salida de un chunk de 50 acciones de 18 dimensiones. El historial se compone de fotogramas reales de la cabeza del robot en pasos anteriores, no de repeticiones del fotograma actual. La unidad y el mapeo de cámaras, así como las convenciones de brazo cartesiano y base, se detallan en el `policy_io.json` del dataset.

El entrenamiento consistió en una continuación final de 3000 pasos con batch global de 12, inicializada desde un piloto de corrección NAV de 250 pasos. La mezcla de datos fue 80 % replay original balanceado por fases y 20 % correcciones NAV cualificadas, manteniendo sin cambios la normalización del dataset. El dataset incluye los ficheros originales de train/validación y los 32 segmentos de corrección cualificados (9353 anclas elegibles). No se realizó entrenamiento nuevo ni conversión de pesos para esta subida: es un export de inferencia/fine-tuning, no un checkpoint exacto de reanudación de optimizador/RNG. El repositorio incluye `MANIFEST.json` con tamaños y hashes SHA256 de todos los ficheros.

## Capacidades

- Control robótico de manipulación y navegación (OVMM) a partir de observaciones visuales multivista y una instrucción de tarea en texto.
- Entrada multimodal: estado propioceptivo de 16 dimensiones, texto y seis cámaras RGB ordenadas.
- Salida de chunk de acciones de 50 pasos con 18 dimensiones por paso.
- Soporte de historial temporal mediante fotogramas reales de pasos anteriores.
- Integración con runtime LeRobot pi0.5 y servidor de política propio (`policy_server.py`) con `--max-batch 1 --dtype float32`.
- No se documentan capacidades de generación de texto libre, razonamiento general, código, matemáticas, tool calling ni agentes multi-paso.
- Capacidades multilingües: no disponibles; el texto de tarea se procesa con tokenizer PaliGemma, pero no se especifican idiomas soportados.

## Casos de uso

- Baseline de referencia para investigación en OVMM: sirve como punto de comparación congelado (step 3000) frente a variantes posteriores con planificador, gracias a la inclusión de configuración, logs y evidencia de evaluación en `release/`.
- Fine-tuning sobre tareas de manipulación específicas: al ser un export de inferencia/fine-tuning con pesos FP32 y pre/postprocesadores completos, se puede partir de él para adaptar la política a nuevos objetos o escenarios.
- Evaluación reproducible en simulador: el repositorio incluye el código del controlador congelado y las versiones de paquetes en `release/runtime.json`, lo que permite reproducir los resultados reportados en las mismas condiciones (FP32, batch 1, goal privilegiado).
- Estudio de correcciones NAV: el dataset asociado contiene los 32 segmentos de corrección cualificados y 9353 anclas elegibles, útil para analizar cómo afecta el replay balanceado por fases al comportamiento de navegación.
- Integración en pipelines LeRobot existentes: el servidor de política escucha en un puerto (por defecto 5810) y puede conectarse a un runtime ya configurado para recoger observaciones y devolver chunks de acción.
- Docencia y divulgación sobre VLA robóticos: el contrato de E/S explícito y la documentación de unidades y mapeo de cámaras facilitan explicar cómo se conecta percepción, lenguaje y acción en una política Pi0.5.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son de evaluación closed-loop en simulador asistido:

| Evaluación | Resultado | Condiciones |
|---|---|---|
| TRAIN12 full success | 4/12 | Tres tareas base, cuatro semillas; Planner con goal privilegiado + `observable_placement_exit_v2`, FP32, batch 1 |
| Development heldout | 0/3 | Mismas condiciones asistidas |
| Fixed development6 | 1/6 | Mismas condiciones asistidas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que estos son resultados de simulador asistido, no de navegación end-to-end pura ni de cualificación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143.404.816 parámetros en FP32, los pesos ocupan aproximadamente 16,6 GB; se necesita margen adicional para activaciones, seis flujos de cámara y el chunk de acciones. No se documenta una estimación oficial de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos FP32, encajan GPU de 24 GB o más (RTX 4090, A100 40/80 GB, H100), pero el autor no lo especifica.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en FP32, aunque no está confirmado por el autor; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: runtime LeRobot pi0.5 con el servidor incluido (`release/code/scripts/alphabot2_pi05/policy_server.py`), `--max-batch 1 --dtype float32`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El servidor está configurado para batch 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / E/S | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neptune-T/alphabot2-ovmm-sft3000 | 4.143 M | state16 + texto + 6 RGB → chunk 50×18 | 4/12 en TRAIN12 asistido; 1/6 en development6 | no disponible | Hugging Face, LeRobot |
| alphabot2/aibot2_grab_bag_combined_over_under_pi05 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas Pi0.5 / LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Los resultados reportados son de simulador asistido por planificador con goal privilegiado y `observable_placement_exit_v2`, no de navegación end-to-end pura ni de robot real.
- El rendimiento en heldout es bajo (0/3 en development heldout, 1/6 en development6), lo que indica escasa generalización fuera de las condiciones de entrenamiento.
- No es un checkpoint exacto de reanudación: es un export de inferencia/fine-tuning sin estado de optimizador ni RNG.
- Los assets y el runtime del simulador no están incluidos en el repositorio; las rutas absolutas de los metadatos de release apuntan al servidor de origen y requieren reubicación.
- La licencia no está disponible y el autor indica que esta copia no concede una licencia nueva sobre los activos upstream (modelo, tokenizer y dataset originales); es necesario revisar los términos upstream antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser una política de acción, el riesgo relevante es de comportamiento erróneo o inseguro en el robot, no de texto inventado.
- Idiomas soportados no especificados.
- Sin cuantizaciones publicadas; el despliegue documentado exige FP32 y batch 1.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neptune-T/alphabot2-ovmm-sft3000
- Dataset asociado: https://huggingface.co/datasets/Neptune-T/alphabot2-ovmm-sft
- Modelo base: https://huggingface.co/alphabot2/aibot2_grab_bag_combined_over_under_pi05
- LeRobot (runtime): https://github.com/huggingface/lerobot
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
