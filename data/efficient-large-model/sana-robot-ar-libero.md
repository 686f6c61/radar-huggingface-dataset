# Efficient-Large-Model/SANA-Robot-AR-LIBERO

## Resumen

SANA-Robot-AR LIBERO es un modelo de accion-para-mundo (world-action model) orientado a politicas de manipulacion robotica, desarrollado por el grupo Efficient-Large-Model (NVIDIA Labs, segun la pagina del proyecto). El modelo parte de una observacion multivista, de la propiocepcion del robot y de una instruccion en lenguaje natural, y predice de forma conjunta un bloque de 32 acciones de control y el video futuro correspondiente. La variante AR incorpora una memoria hibrida sobre el historial visual del episodio, lo que permite mantener coherencia temporal sin que el coste computacional crezca con la duracion de la tarea.

El modelo cuenta con 4.5B parametros y esta post-entrenado sobre las cuatro suites del benchmark LIBERO (Spatial, Object, Goal y Long), con un unico modelo que cubre las cuatro. Esta pensado para el robot Franka Panda de un solo brazo, con camara en tercera persona y camara de muneca a 256x256 por vista. Su relevancia actual radica en que combina generacion de video futuro con prediccion de acciones en un mismo backbone eficiente, y en que generaliza razonablemente bien frente a perturbaciones (camara, iluminacion, fondo, ruido, lenguaje) en benchmarks derivados de LIBERO.

La licencia Apache 2.0 y el hecho de que se publique junto con los pesos EMA del paso 8.000 de post-entrenamiento lo convierten en una base util para investigacion en politicas de manipulacion, si bien su uso esta restringido a entornos de investigacion y requiere fine-tuning para robots, camaras o tareas distintas de las de LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model transformer hibrido con atencion softmax y capas Gated DeltaNet (memoria recurrente de estado constante); policy_type `ar` |
| Parametros totales | 4.5B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como valor numerico; memoria compuesta por primer frame, ventana deslizante de 1 chunk y estado Gated DeltaNet sobre todos los chunks pasados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de LIBERO estan en ingles, pero la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (state dict bajo la clave `state_dict_ema`); no se publican safetensors ni GGUF |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Robot | Franka Panda, un brazo |
| Camaras | tercera persona y muneca, 256x256 cada una, layout 2x2 |
| Chunk de acciones | 32 pasos de control; video codificado con stride de 4 frames |
| Datos de entrenamiento | demostraciones LIBERO de las cuatro suites |
| Pesos publicados | EMA (decay 0.999) en el paso 8.000 de post-entrenamiento |
| Text encoder | Gemma 2 2B (no incluido en el repo) |
| Video VAE | LTX-2.3 VAE, layout diffusers (no incluido en el repo) |
| Tamano del repo | 17.9 GB |
| Ficheros | `sana_robot_ar_libero.pth`, `meta.json`, `normalization.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un world-action model que genera simultaneamente acciones y video futuro. El componente distintivo es la memoria hibrida: las capas de atencion softmax leen el primer frame del episodio y una ventana deslizante de un chunk reciente, mientras que las capas Gated DeltaNet comprimen cada chunk pasado en un estado de tamano constante. Esto hace que los chunks atiendan causalmente a los anteriores y que el coste por peticion no crezca con la longitud del episodio, lo que resulta especialmente util en tareas de horizonte largo como la suite Long de LIBERO.

El modelo parte de un pre-entrenamiento (publicado como SANA-Robot-AR-Pretrain) y se post-entrena sobre las demostraciones de las cuatro suites LIBERO, con los pesos finales tomados como media exponencial de pesos (EMA, decay 0.999) en el paso 8.000. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles. El pipeline de inferencia combina un text encoder Gemma 2 2B y un VAE de video LTX-2.3, ambos externos al repositorio y que deben descargarse por separado.

## Capacidades

- Prediccion de bloques de 32 acciones de control a partir de observacion multivista, propiocepcion e instruccion en lenguaje natural.
- Generacion de video futuro del episodio, codificado con stride de 4 frames por chunk.
- Memoria temporal hibrida que combina primer frame, ventana deslizante de un chunk y estado comprimido de todos los chunks pasados.
- Razonamiento de horizonte largo gracias a la memoria de coste constante, orientado a tareas tipo LIBERO Long.
- Generalizacion frente a perturbaciones de camara, robot, lenguaje, iluminacion, fondo, ruido y layout (evaluada en LIBERO-Plus).
- Robustez parcial frente a cambios de objeto, posicion, semantica y tarea (evaluada en LIBERO-PRO).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, audio ni thinking mode.
- Capacidades multilingues: no disponibles como dato declarado.

## Casos de uso

- Investigacion en politicas de manipulacion: utilizar los pesos como punto de partida para reproducir los resultados de LIBERO o como baseline en comparaciones academicas, gracias a la publicacion de los pesos EMA y de la receta de fine-tuning `configs/libero_ar.yaml`.
- Fine-tuning para un nuevo robot o conjunto de camaras: el modelo esta entrenado para Franka Panda con camara de muneca y tercera persona; para otra configuracion se puede reutilizar el pre-entrenamiento SANA-Robot-AR-Pretrain y adaptar la normalizacion con `meta.json` y `normalization.json`.
- Evaluacion de robustez ante perturbaciones: desplegar el modelo en LIBERO-Plus, LIBERO-PRO o LIBERO-MAX para medir el impacto de cambios de iluminacion, fondo, ruido o instrucciones sobre la tasa de exito.
- Generacion de video de planificacion: usar la prediccion de video futuro como representacion intermedia para depurar o visualizar la intencion del policy antes de ejecutar acciones en simulacion.
- Tareas de horizonte largo en simulacion: la memoria de coste constante permite sostener episodios de hasta 700 pasos de control en la suite Long sin que el coste por peticion crezca con la duracion.
- Benchmarking de eficiencia de world-action models: comparar el coste por peticion frente a politicas con atencion completa sobre el historial, especialmente en episodios largos.
- Prototipado de pipelines de evaluacion robotica: integrar el evaluador de `eval/libero` del codigo de SANA-Robot en infraestructuras de evaluacion automatizada en simulacion.

## Benchmarks y rendimiento

Resultados publicados en la model card (tasa de exito en %; el modelo solo se post-entrena con las suites originales de LIBERO y se evalua en benchmarks que perturban esas tareas):

| Benchmark | Episodios | Tasa de exito |
|---|---|---|
| LIBERO-Plus | 10.030 | 93,98 |
| LIBERO-PRO | 8.000 | 68,09 |
| LIBERO-MAX | 8.000 pares | 88,30 (Base), 76,06 (Dynamic) |

LIBERO-Plus por tipo de perturbacion:

| Camara | Robot | Lenguaje | Luz | Fondo | Ruido | Layout |
|---|---|---|---|---|---|---|
| 84,1 | 98,4 | 93,9 | 99,7 | 98,8 | 94,4 | 91,8 |

LIBERO-PRO por tipo de perturbacion:

| Objeto | Posicion | Semantica | Tarea |
|---|---|---|---|
| 88,95 | 47,65 | 98,10 | 37,65 |

Ajustes de inferencia declarados:

- LIBERO-Plus y LIBERO-MAX: 2 pasos de denoising, sin guidance, nuevo chunk cada 16 pasos de control (`eval/libero/deploy.yaml`).
- LIBERO-PRO: 10 pasos de denoising, guidance de video 3, nuevo chunk cada 8 pasos de control.
- Episodios de LIBERO-Plus y LIBERO-PRO de hasta 400 pasos de control (700 en Long). Dentro de los limites de las cuatro suites originales (220, 280, 300 y 520 pasos), la tasa de exito en LIBERO-Plus es de 93,35. LIBERO-MAX usa siempre esos limites.

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni metricas de lenguaje, al no ser un modelo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card. Con 4.5B parametros en el policy y componentes adicionales (Gemma 2 2B como text encoder y LTX-2.3 VAE), el repo de pesos ocupa 17.9 GB; el consumo real depende del formato de pesos y de si se cuantiza, dato no documentado.
- GPU recomendadas: no disponibles como recomendacion oficial. Por tamano, se situa en el rango de GPUs de datacenter (A100, H100) para ejecucion sin cuantizacion; el texto de la model card no confirma configuraciones concretas.
- Viabilidad en GPU de consumo: no disponible como dato confirmado. El tamano de 4.5B parametros sugiere que podria caber en GPUs de consumo con cuantizacion, pero no se publican pesos cuantizados ni requisitos oficiales.
- Opciones de despliegue: el modelo se sirve a traves de la libreria `sana` y del evaluador `eval/libero` del codigo de SANA-Robot; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Los ajustes de inferencia (2 o 10 pasos de denoising, frecuencia de nuevos chunks cada 16 u 8 pasos de control) permiten estimar el coste relativo, pero no se publican cifras absolutas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / memoria | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SANA-Robot-AR LIBERO | 4.5B | primer frame + ventana de 1 chunk + estado Gated DeltaNet | LIBERO-Plus 93,98; LIBERO-PRO 68,09; LIBERO-MAX 88,30 / 76,06 | Apache 2.0 | Hugging Face |
| SANA-Robot-AR-Pretrain | no disponible | misma arquitectura de memoria hibrida | no disponible en esta ficha | Apache 2.0 (segun repositorio relacionado) | Hugging Face |
| SANA-Robot-AR-RoboDojo | no disponible | misma familia AR | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| SANA-Robot-AR-RoboTwin2.0 | no disponible | misma familia AR | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone en la informacion proporcionada de resultados comparativos con otros world-action models o politicas de manipulacion de terceros (por ejemplo, variantes de diffusion policy o VLA genericos); esos datos no estan disponibles.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigacion en politicas de manipulacion robotica; no esta validado para produccion ni para operacion en robots fisicos sin supervision.
- Entrenado unicamente con demostraciones simuladas de LIBERO y para un robot Franka Panda de un brazo; otros robots, camaras, tareas o escenas requieren fine-tuning.
- Una politica aprendida puede fallar sin aviso; en un robot fisico debe ejecutarse con limites de espacio de trabajo, limites de velocidad y una persona junto al boton de parada.
- Rendimiento desigual segun la perturbacion: en LIBERO-PRO la tasa de exito cae a 47,65 con cambios de posicion y a 37,65 con cambios de tarea, frente a 98,10 en perturbaciones semanticas.
- Dependencia de componentes externos no incluidos en el repositorio (text encoder Gemma 2 2B y VAE LTX-2.3), lo que anade requisitos de descarga y versionado.
- Debe usarse el `normalization.json` y el `meta.json` publicados junto a los pesos, no una normalizacion recalculada, para evitar desviaciones en las acciones predichas.
- No se documentan sesgos conocidos, riesgos de alucinacion en texto ni restricciones adicionales de licencia mas alla de Apache 2.0; estos datos no estan disponibles.
- Idiomas soportados no declarados; las instrucciones de LIBERO estan en ingles y no se garantiza comportamiento en castellano u otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-LIBERO
- Pagina del proyecto: https://nvlabs.github.io/Sana/Robot/
- Modelo pre-entrenado para fine-tuning: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-Pretrain
- Variante RoboDojo: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboDojo
- Variante RoboTwin2.0: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboTwin2.0
- Text encoder Gemma 2 2B: https://huggingface.co/google/gemma-2-2b-it
- Video VAE LTX-2.3: https://huggingface.co/Efficient-Large-Model/LTX-2.3-Diffusers
- Benchmark LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Benchmark LIBERO-Plus: https://github.com/sylvestf/LIBERO-plus
- Benchmark LIBERO-PRO: https://github.com/Zxy-MLlab/LIBERO-PRO
- Benchmark LIBERO-MAX: https://github.com/liberomax/LIBERO-MAX
