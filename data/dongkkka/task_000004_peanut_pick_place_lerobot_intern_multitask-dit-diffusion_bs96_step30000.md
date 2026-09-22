# Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_MultiTask-DiT-Diffusion_bs96_step30000

## Resumen

El modelo identificado como `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_MultiTask-DiT-Diffusion_bs96_step30000` es un checkpoint de politica robotica (policy) entrenado con la libreria LeRobot 0.6.1, no un modelo de lenguaje. Se trata de una politica de imitacion basada en Diffusion Transformer (DiT) que genera acciones motoras continuas para un brazo robotico bimanual a partir de tres camaras y del estado articular actual. Su objetivo es resolver una tarea concreta de manipulacion tipo *pick and place* (recogida y colocacion de cacahuetes) sobre una mesa, aprendida por imitation learning a partir de demostraciones humanas teleoperadas.

El checkpoint corresponde al paso 30.000 de entrenamiento, con un tamano de lote de 96, y fue entrenado sobre los 35 episodios completos del dataset `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern`. El modelo tiene 235.020.054 parametros (aproximadamente 235 millones) en formato safetensors, un tamano de repo de 0,9 GB y una arquitectura DiT compacta: 4 capas, dimension oculta de 512 y 8 cabezas de atencion. A diferencia de un LLM, no procesa texto ni tiene longitud de contexto en tokens: su "ventana" es un horizonte de accion de 32 pasos, de los cuales se ejecutan 24 por defecto en cada llamada.

Su relevancia es acotada pero clara: es un ejemplo reproducible de politica difusiva multi-tarea dentro del ecosistema LeRobot, util como referencia para investigacion en robot learning, para comparar formulaciones de difusion frente a politicas tipo ACT, y como punto de partida para *fine-tuning* en tareas de manipulacion similares. Es importante senalar que el autor no aporta conjunto de validacion retenido ni evaluacion intermedia, y que la licencia no esta declarada, lo que limita su uso en produccion sin aclaracion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) como politica de imitacion; 4 capas, hidden size 512, 8 cabezas de atencion |
| Parametros totales | 235.020.054 (aproximadamente 235 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Horizonte de accion de 32 pasos; 24 acciones ejecutadas por defecto en cada llamada |
| Tipos de cuantizacion | No disponible (el repositorio incluye unicamente el checkpoint de inferencia en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (modelo de robotica; no procesa lenguaje) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.1 (`MultiTaskDiTPolicy.from_pretrained`) |
| Dimension de estado y accion | 22 dimensiones cada una |
| Camaras de entrada | `cam_left_head`, `cam_left_wrist`, `cam_right_wrist` |
| Preprocesado de imagen | Redimensionado a 320x240 y recorte central a 224x224 en inferencia |
| Normalizacion | MIN_MAX para estado/accion; MEAN_STD para vision |
| Objetivo de entrenamiento | Difusion con DDPM; 100 pasos de ruido en entrenamiento, 10 pasos de denoising en inferencia |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

La politica es un Diffusion Transformer que actua como generador de trayectorias de accion. En lugar de predecir directamente una accion, el modelo aprende a invertir un proceso de difusion DDPM: durante el entrenamiento se anaden 100 pasos de ruido a las secuencias de accion y la red aprende a reconstruirlas; en inferencia se parte de ruido y se aplican 10 pasos de denoising para producir un *chunk* de acciones de horizonte 32. El tronco DiT es deliberadamente pequeno (4 capas, 512 de dimension oculta, 8 cabezas), lo que concentra la mayor parte de la capacidad en la codificacion visual de las tres camaras. Las observaciones se normalizan de forma diferenciada: MIN_MAX para el vector de estado/accion de 22 dimensiones y MEAN_STD para las imagenes.

El entrenamiento se realizo sobre los 35 episodios completos del dataset indicado, con un tamano de lote de 96 durante 30.000 actualizaciones, lo que equivale a aproximadamente 2,88 millones de muestras procesadas. No se documento ningun conjunto de validacion retenido ni evaluacion intermedia, y la propia model card advierte de que las graficas en lazo abierto sobre episodios de entrenamiento no constituyen resultados de validacion. Tampoco se menciona el uso de RLHF, DPO ni ninguna fase de refinamiento posterior; el proceso es exclusivamente imitation learning supervisado sobre demostraciones. No se detalla la composicion exacta de las demostraciones (numero de tareas distintas dentro del conjunto multi-tarea, variabilidad de posiciones, iluminacion o configuracion de mesa).

## Capacidades

- Generacion de acciones motoras continuas de 22 dimensiones para un robot bimanual, condicionadas por tres vistas de camara y el estado articular actual.
- Ejecucion de tareas de manipulacion tipo *pick and place* sobre objetos pequenos (cacahuetes) en entorno de mesa.
- Formulacion multi-tarea: entrenado sobre todos los episodios del dataset, que agrupa variantes de la misma familia de tareas.
- Prediccion de *chunks* de acciones (horizonte 32) con ejecucion parcial (24 acciones por llamada), lo que aporta cierta robustez frente a ruido en la observacion.
- Recuperacion de la accion en unidades originales mediante el postprocesador guardado junto al checkpoint.
- Integracion nativa con el ecosistema LeRobot (`MultiTaskDiTPolicy.from_pretrained`), incluyendo preprocesador y postprocesador serializados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico ni capacidades multilingues: es un modelo puramente sensorimotor.

## Casos de uso

- Manipulacion robotica de laboratorio: recogida y colocacion de objetos pequenos en una celda de trabajo instrumentada con tres camaras; el horizonte de 32 acciones permite trayectorias suaves sin replanificacion a cada paso.
- *Fine-tuning* para tareas de pick and place relacionadas: al ser un checkpoint de 235 M con pesos safetensors, se puede reentrenar sobre un dataset propio de episodios teleoperados para adaptar la politica a nuevos objetos o posiciones.
- Referencia academica para comparar formulaciones: util como linea base de politica difusiva (DDPM, 10 pasos de denoising) frente a politicas deterministas tipo ACT en experimentos de robot learning.
- Prototipado rapido de pipelines de imitation learning: sirve para validar extremo a extremo la cadena de LeRobot (grabacion de episodios, entrenamiento, carga del checkpoint y despliegue en el robot) antes de invertir en datasets mayores.
- Evaluacion de robustez visual: al depender de tres camaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`), es adecuado para estudiar el impacto de oclusiones, cambios de iluminacion o desalineacion de camaras en politicas de difusion.
- Generacion de datos sinteticos de trayectoria para simuladores: las secuencias de acciones producidas pueden usarse como referencia para calibrar controladores o comparar el comportamiento real frente al simulado (*sim-to-real*).
- Demostraciones educativas: por su tamano reducido y su licencia no declarada pero peso abierto en HuggingFace, resulta practico para cursos y talleres sobre diffusion policies en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hubo conjunto de validacion retenido ni evaluacion intermedia, y advierte de que las graficas en lazo abierto sobre episodios de entrenamiento no son resultados de validacion. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a contenidos sin relacion).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 0,94 GB en precision fp32 (235 M parametros x 4 bytes); en fp16 serian unos 0,47 GB. Hay que sumar el coste de los codificadores visuales de tres camaras a 224x224 y de las activaciones del proceso de denoising, por lo que una reserva practica de 2-4 GB de VRAM es razonable.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Cabe holgadamente en GPUs de consumo como RTX 3060 12 GB, RTX 4060, RTX 4070 o superiores.
- Cabe en GPU de consumo: si, con margen amplio; incluso en GPUs de gama de entrada con 6-8 GB.
- Opciones de despliegue: no aplican servidores de inferencia de LLM como vLLM, TGI u Ollama. El despliegue se realiza con la libreria LeRobot 0.6.1 mediante `MultiTaskDiTPolicy.from_pretrained`, usando el preprocesador y postprocesador guardados, en PyTorch sobre CPU o GPU. Los pesos son safetensors; no se documenta soporte GGUF ni llama.cpp.
- Latencia y throughput estimados: no disponibles. Como referencia estructural, cada inferencia requiere 10 pasos de denoising sobre un horizonte de 32 acciones, y el modelo ejecuta 24 acciones antes de volver a inferir.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de politica | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (MultiTask DiT Diffusion) | 235.020.054 | Difusion (DDPM) con tronco DiT | 3 camaras + estado de 22 dim | No disponible | HuggingFace (repo de 0,9 GB) |
| ACT (LeRobot) | No disponible en la informacion proporcionada | Transformer de imitacion con *action chunking* | Camaras + estado | No disponible en la informacion proporcionada | Implementado en LeRobot |
| Diffusion Policy (LeRobot) | No disponible en la informacion proporcionada | Difusion sobre acciones (CNN/UNet) | Camaras + estado | No disponible en la informacion proporcionada | Implementado en LeRobot |
| SmolVLA (HuggingFace) | No disponible en la informacion proporcionada | Vision-language-action | Camaras + instruccion en lenguaje | No disponible en la informacion proporcionada | Ecosistema LeRobot |

No se dispone de datos comparativos de rendimiento (tasas de exito, numero de episodios de evaluacion, latencias) para ninguno de estos modelos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican los terminos de uso, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Sin conjunto de validacion retenido ni evaluacion intermedia: no hay evidencia publicada de la tasa de exito real de la politica en tareas no vistas.
- Riesgo elevado de sobreajuste: el entrenamiento cubre 35 episodios y 30.000 actualizaciones, con 2,88 millones de muestras procesadas sobre un dataset pequeno y probablemente poco diverso en posiciones, iluminacion y configuracion de mesa.
- Dependencia estricta del formato de entrada: exige exactamente las tres camaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) y nombres de caracteristicas identicos; cualquier cambio de montaje o de nomenclatura invalida el checkpoint.
- Dependencia del preprocesador y postprocesador originales: la accion en unidades originales solo se recupera con el postprocesador guardado. Omitirlo produce comandos en espacio normalizado (MIN_MAX) y comportamientos incorrectos.
- Sensibilidad a cambios de dominio visual: el preprocesado fijo (320x240 y recorte central a 224x224) y la normalizacion MEAN_STD implican que cambios de camara, distancia focal o iluminacion degradan la politica.
- Solo 10 pasos de denoising en inferencia: reduce latencia pero limita la calidad de la muestra generada frente a un muestreo mas largo.
- Ambito funcional muy estrecho: no es un modelo de proposito general, no procesa lenguaje, no razona simbolicamente y no debe presentarse como un LLM ni evaluarse con benchmarks de texto.
- El repositorio contiene unicamente el checkpoint de inferencia: no incluye estado del optimizador, lo que dificulta reanudar el entrenamiento tal cual (aunque permite *fine-tuning* desde los pesos).
- Las graficas en lazo abierto sobre episodios de entrenamiento no son una medida valida de generalizacion; el autor lo advierte explicitamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_MultiTask-DiT-Diffusion_bs96_step30000
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y del ecosistema de la libreria indicada en los metadatos.
