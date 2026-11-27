# alohateam1423/smolvla_hw5_sim_orange_lemon50

## Resumen

`smolvla_hw5_sim_orange_lemon50` es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un modelo de vision-lenguaje-accion (VLA) orientado al control de robots manipuladores dentro del ecosistema LeRobot. Lo publica el usuario `alohateam1423` como entrega de un trabajo de curso de "Robot Control AI", y su proposito es aprender una tarea muy concreta: recoger y colocar dos piezas de fruta en un entorno de simulacion Isaac Sim (escena de cocina del curso).

El modelo cuenta con 450.046.176 parametros (unos 450 millones) almacenados en formato safetensors, con un tamano de repositorio de 0,9 GB. Se ha entrenado durante 4.000 pasos sobre 50 demostraciones de dos frutas generadas en Isaac Sim. Los resultados declarados por el autor son muy limitados: 1 de 30 intentos de primera elevacion correctos y 0 de 30 colocaciones exitosas, lo que lo convierte en un artefacto de experimentacion academica mas que en un modelo listo para produccion.

Su relevancia es, por tanto, la de un ejemplo reproducible de ajuste de SmolVLA sobre un dataset pequeno y especifico de simulacion. Resulta util para estudiar el flujo de entrenamiento y evaluacion de LeRobot con Isaac Sim, pero no para aplicaciones reales dada su baja tasa de exito y la ausencia de informacion sobre licencia, idiomas o pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en `lerobot/smolvla_base`; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |
| Pasos de entrenamiento | 4.000 |
| Datos de entrenamiento | 50 demostraciones de dos frutas en Isaac Sim |
| Entorno de evaluacion | Escena de cocina de Isaac Sim del curso |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `lerobot/smolvla_base`, un VLA de la familia SmolVLA integrado en la libreria LeRobot. La informacion disponible no detalla la composicion interna (backbone visual, codificador de lenguaje, cabeza de acciones), la longitud de contexto ni el esquema de atencion, por lo que estos extremos deben considerarse no disponibles. El ajuste fino parte de los pesos preentrenados de `smolvla_base` y se especializa en una tarea de manipulacion concreta.

El entrenamiento consistio en 4.000 pasos sobre 50 demostraciones teleoperadas o generadas en simulacion con dos frutas en la escena de cocina de Isaac Sim. No se documenta el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores. La informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) no esta disponible en la model card.

## Capacidades

- Control de robot manipulador mediante politicas vision-lenguaje-accion: el modelo recibe observaciones visuales (e imagenes de camara del entorno) y produce acciones motrices, siguiendo el paradigma de SmolVLA.
- Ejecucion de una tarea especifica de recogida y colocacion de dos frutas en la escena de cocina de Isaac Sim.
- Aprendizaje por imitacion a partir de un dataset reducido (50 demostraciones).
- Integracion con el ecosistema LeRobot para carga, evaluacion y despliegue.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision general, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos academicos: sirve como referencia para replicar el pipeline de ajuste de SmolVLA sobre un dataset pequeno en Isaac Sim, comparando curvas de entrenamiento y tasas de exito.
- Estudio de aprendizaje por imitacion con datos escasos: permite analizar como se comporta un VLA de ~450 M de parametros con solo 50 demostraciones y 4.000 pasos, y por que la tasa de exito es baja (1/30 en elevacion, 0/30 en colocacion).
- Docencia en robotica y simulacion: util como ejemplo practico de evaluacion en la escena de cocina de Isaac Sim, mostrando las limitaciones de un ajuste fino minimo.
- Base para nuevos fine-tunings: al partir de `lerobot/smolvla_base`, puede reutilizarse como punto de partida para entrenar variantes con mas datos o mejores hiperparametros.
- Analisis de fallos en manipulacion: los resultados declarados (elevacion casi nula, colocacion nula) permiten estudiar modos de fallo tipicos en tareas de pick-and-place con datos limitados.
- Integracion en pipelines de LeRobot: sirve para probar el flujo de carga de modelos safetensors y su ejecucion en entornos simulados antes de escalar a configuraciones mayores.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son las tasas de exito declaradas por el autor en la model card:

| Metrica | Resultado |
|---|---|
| Primer intento de elevacion correcto | 1/30 |
| Colocacion exitosa | 0/30 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parametros en safetensors (0,9 GB en el repositorio), la inferencia en precision completa requiere aproximadamente 1,8 GB (pesos en fp16) mas memoria para activaciones y buffers de observacion; en cuantizacion de 8 bits podria situarse en torno a 0,5-0,9 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) deberia poder alojar el modelo.
- Cabe en GPU consumer: si, por el reducido numero de parametros.
- Opciones de despliegue: la libreria indicada es `lerobot`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (habitualmente orientadas a LLM de texto, no a VLA).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_hw5_sim_orange_lemon50 | 450.046.176 | no disponible | 1/30 elevacion, 0/30 colocacion | no disponible | Hugging Face |
| lerobot/smolvla_base (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Otros VLA de la familia SmolVLA | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento del modelo base ni de otras alternativas comparables, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Tasa de exito muy baja: 1/30 en el primer intento de elevacion y 0/30 en colocacion, segun el propio autor; no es apto para uso practico.
- Entrenamiento muy limitado: solo 50 demostraciones y 4.000 pasos, lo que explica en parte el bajo rendimiento.
- Especifico de simulacion: entrenado y evaluado en la escena de cocina de Isaac Sim del curso; no hay evidencia de transferencia a robot real ni a otros entornos.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas no disponibles: no se documenta el soporte linguistico de las instrucciones.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la model card.
- Limitaciones de contexto: la longitud de contexto no esta disponible, por lo que se desconoce el horizonte temporal de las politicas.
- Caveat de produccion: al ser un trabajo de curso con resultados pobres y sin documentacion tecnica, no deberia desplegarse en sistemas reales sin un reentrenamiento y una evaluacion exhaustivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alohateam1423/smolvla_hw5_sim_orange_lemon50
- Modelo base: https://huggingface.co/lerobot/smolvla_base
