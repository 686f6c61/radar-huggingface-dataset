# HoonheeCho/dvla-mujoco-mt3w2-ckpt-20261112

## Resumen
RE-VLA (EventVLA) es un sistema de vision-language-action (VLA) orientado a robótica manipulativa, desarrollado por HoonheeCho y asociado al repositorio DynamicVLA. Este checkpoint concreto contiene los pesos de los sistemas 2 y 1 entrenados sobre el benchmark de simulación de RE-VLA, que combina MuJoCo y robosuite con un brazo Panda, control a 250 Hz y cámaras RGB y de eventos a 25 Hz. El modelo aborda el problema de control robótico multimodal en tareas de manipulación (basket, place, wander y leafcatch) con un diseño que incorpora fusión de fotogramas y renderizado de eventos.

El interés técnico del checkpoint reside en su enfoque de dos sistemas: un System 2 (DynamicVLA, basado en SmolVLA con fusión de 3 fotogramas) que actúa como base, y un System 1 con latente hindsight (rSM) que se entrena sobre él y produce las acciones de control. El paquete incluye además ablaciones y pesos de inicio conjunto, lo que lo convierte en material de reproducción de investigación más que en un modelo listo para producción. El repo ocupa 21,6 GB y no registra descargas ni likes en el momento de la consulta.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los idiomas del modelo en la información proporcionada; los datos disponibles se centran en el procedimiento de entrenamiento, la estructura de checkpoints y los resultados de éxito en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA de dos sistemas: System 2 DynamicVLA (SmolVLA + fusión de 3 fotogramas) y System 1 rSM con latente hindsight z; renderizado de eventos y predicción futura |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, sin indicación de idiomas) |
| Licencia | other |
| Formato de pesos | safetensors y checkpoints PyTorch (.pt); incluye args.json, hist.json y SHA256SUMS.txt |

## Arquitectura y entrenamiento
La arquitectura es un sistema VLA de dos niveles. El System 2 (DynamicVLA) parte de SmolVLA con fusión de 3 fotogramas y se entrena durante 12 épocas sobre los datos de 4 tareas (mt3w2); todos los System 1 se ejecutan sobre esta base. El System 1 rSM incorpora un latente hindsight z y se entrena desde cero a partir de los pesos de inicio conjunto, con una función de pérdida que combina L_act y un término KL de CVAE (10 * KL_cvae). Las ablaciones documentadas incluyen una variante sin latente z, sin predicción futura y con inicialización aleatoria (pérdida L_act + 10 * KL_cvae) y otra sin latente z pero manteniendo el renderizador de eventos rSM y la pérdida de predicción futura (L_occ + 0.5 * L_cnt + L_act + 10 * KL_cvae), ambas partiendo de los pesos de inicio conjunto.

El entorno de entrenamiento y evaluación es MuJoCo con robosuite y un brazo Panda, control a 250 Hz y cámaras RGB y de eventos a 25 Hz. Las tareas son basket, place, wander (con un nuevo diseño de inicio lejano y cruce turbulento, objetos escalados a x0.5) y leafcatch. El checkpoint reportado es model_step50000.pt del System 1 rSM; también se incluye model.pt (paso 58.844, fin de entrenamiento). No se especifican en la información el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades
- Control robótico de manipulación en simulación sobre las tareas basket, place, wander y leafcatch.
- Procesamiento multimodal de imágenes RGB y eventos de cámara de eventos a 25 Hz.
- Fusión temporal de 3 fotogramas en el System 2 (DynamicVLA).
- Predicción futura y representación latente hindsight (z) en el System 1 rSM.
- Renderizado de eventos mediante el renderizador rSM.
- Control de acciones a 250 Hz en el entorno MuJoCo/robosuite con brazo Panda.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso
- Reproducción de resultados de investigación: descargar el paquete en `repro_vla`, verificar con `sha256sum -c SHA256SUMS.txt` y ejecutar la evaluación según `repro/TO_YOUNGHO_SERVER.md` para replicar las tasas de éxito reportadas.
- Evaluación comparativa de ablaciones: usar los checkpoints de `yh_mt3w2e12_no_l_no_joint` y `yh_mt3w2e12_no_l_with_joint` para medir el impacto del latente z, la predicción futura y el renderizador de eventos en las mismas semillas y escenas.
- Estudio de fusión temporal: analizar el efecto de la fusión de 3 fotogramas del System 2 sobre tareas con movimiento rápido, como wander con cruce turbulento.
- Investigación en percepción con cámara de eventos: emplear el renderizador rSM y los checkpoints para estudiar políticas que combinan RGB y eventos a 25 Hz en condiciones de iluminación adversa simuladas.
- Punto de partida para fine-tuning: reutilizar los pesos de inicio conjunto (`yh_mt3w2e12_c1_joint`) como inicialización de nuevos System 1 en tareas de manipulación similares.
- Benchmarking de políticas VLA: comparar el rendimiento del checkpoint reportado (step 50k) frente al de fin de entrenamiento (step 58.844) para estudiar la estabilidad del entrenamiento y el sobreajuste.
- Docencia y divulgación: usar la estructura de dos sistemas y las ablaciones como ejemplo didáctico de diseño VLA con pérdidas auxiliares.

## Benchmarks y rendimiento

Resultados de éxito en bucle cerrado (100 semillas por tarea):

| Modelo | wander (nuevo diseño) | basket | place | leafcatch | media |
|---|---|---|---|---|---|
| rSM, step 50k (reportado) | 49 % | 48 % | 75 % | 54 % | 56,5 % |
| rSM, step 58.844 (`model.pt`) | 54 % | 48 % | 69 % | 50 % | 55,3 % |
| Ablaciones | no evaluadas todavía | | | | |

- Wander usa las 100 semillas cribadas `wander_wf{a,b}50_0{0..3}`.
- Las demás tareas usan las escenas del paper y las semillas `{task}_{main,aux}50_0{0..3}`.
- Los ficheros de semillas se incluyen en la rama de código.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el repo completo ocupa 21,6 GB, pero no se desglosa el tamaño de cada checkpoint ni su huella en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el procedimiento indicado es la descarga con `hf download` y la evaluación mediante el wrapper de la rama `to_youngho_server` del repo `mickeykang16/DynamicVLA`, que importa el fichero de modelo indicado en `model_code` de `args.json`.
- Latencia y throughput: no disponible; el entorno de simulación opera a 250 Hz de control y 25 Hz de cámaras, pero no se reportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RE-VLA (EventVLA) rSM step 50k | no disponible | no disponible | 56,5 % de media en 4 tareas MuJoCo | other | Hugging Face (este repo) |
| SmolVLA (base del System 2) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes para comparar parámetros, contexto, rendimiento o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias
- Modelo de investigación: no hay indicación de uso en producción ni de robustez fuera de las tareas y escenas simuladas de MuJoCo/robosuite.
- Resultados limitados a simulación: las tasas de éxito (48-75 % por tarea) se obtienen en un benchmark concreto con semillas y escenas definidas; no se reporta transferencia a robot real.
- Ablaciones sin evaluar: las variantes `no_l_no_joint` y `no_l_with_joint` no tienen resultados de bucle cerrado, por lo que no permiten conclusiones comparativas.
- Licencia "other": no se detallan los términos; es necesario revisar las condiciones antes de cualquier uso comercial o redistribución.
- Idiomas no disponibles: el modelo está orientado a robótica y no se documentan capacidades lingüísticas.
- Sesgos y alucinación: no se documentan sesgos conocidos ni evaluación de alucinación; al ser un modelo de acción, el riesgo relevante es de fallo de política en escenarios no vistos.
- Dependencia de código externo: la evaluación requiere la rama `to_youngho_server` del repo `mickeykang16/DynamicVLA` y rutas absolutas (`/home/irteam/ws/repro_vla`), lo que complica el despliegue fuera del entorno original.
- Tamaño del paquete: 21,6 GB, incluyendo checkpoints intermedios y pesos de inicio conjunto que solo son necesarios para entrenamiento.
- Sin tracción comunitaria: 0 descargas y 0 likes, sin validación externa reportada.

## Enlaces
- Hugging Face: https://huggingface.co/HoonheeCho/dvla-mujoco-mt3w2-ckpt-20261112
- Repositorio de código: https://github.com/mickeykang16/DynamicVLA (rama `to_youngho_server`, fichero `repro/TO_YOUNGHO_SERVER.md`)
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, demos o repositorios adicionales.
