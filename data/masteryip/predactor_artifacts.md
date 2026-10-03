# MasterYip/PredActor_Artifacts

## Resumen

PredActor_Artifacts es el repositorio de artefactos oficiales de evaluación de PredActor, un controlador de locomoción para el robot humanoide Unitree G1 basado en difusión predictiva de acciones (predictive action diffusion). Lo publica el usuario MasterYip en HuggingFace y su código fuente vive en el repositorio de GitHub del mismo nombre. No es un modelo de lenguaje: es una política de control robótico que genera acciones motoras condicionadas, pensada para su ejecución dentro de un bucle de simulación MuJoCo.

El repositorio contiene únicamente dos artefactos aprendidos: la política PDP051 (49.212.894 bytes) y el codificador MotionCLIP para G1 (542.749.069 bytes), que actúa como componente de condicionamiento de movimiento. No incluye datasets, resultados de experimentos, bundles de despliegue ni checkpoints adicionales; el directorio `dataset/` está reservado para futuras publicaciones y actualmente está vacío.

Su relevancia actual es acotada y muy específica: sirve como material reproducible para investigar control de locomoción humanoide direccionable (steerable) con políticas de difusión, y como punto de partida para comparar este paradigma frente a controladores basados en aprendizaje por refuerzo. El repositorio tiene 0 descargas y 0 "likes", y se distribuye bajo licencia `other` por la imposibilidad de otorgar una licencia única sobre componentes transitivos de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión de acciones (diffusion policy) para control de locomoción, con codificador MotionCLIP (basado en CLIP) como componente de condicionamiento de movimiento |
| Parámetros totales | No disponible. Estimación derivada del tamaño de fichero asumiendo fp32: ~12,3 M para la política PDP051 y ~135,7 M para el codificador MotionCLIP |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No aplica en el sentido de ventana de tokens; el horizonte de predicción de acciones y el historial de observaciones no se declaran |
| Tipos de cuantización | No disponible. Se distribuyen checkpoints PyTorch sin variantes GGUF, GPTQ, AWQ ni similares |
| Idiomas soportados | No disponible. No es un modelo de lenguaje y no procesa texto |
| Licencia | other |
| Formato de pesos | PyTorch: `latest.ckpt` (política) y `checkpoint_0100.pth.tar` (codificador MotionCLIP) |
| Tamaño del repositorio | 0,6 GB |
| Pipeline declarado | robotics |
| Librería | pytorch |
| Fecha de creación / actualización | 2026-10-03 / 2026-10-03 |

## Arquitectura y entrenamiento

La arquitectura es una política de difusión de acciones aplicada a control motor: en lugar de predecir directamente la acción, el modelo aprende a generar trayectorias de acción mediante un proceso de difusión, lo que permite representar distribuciones multimodales de comportamiento. Sobre esta base, PredActor añade condicionamiento de movimiento a través de un codificador MotionCLIP específico para el G1, derivado de la familia CLIP, que alinea representaciones de movimiento con un espacio semántico. El resultado es un controlador direccionable (steerable), es decir, capaz de seguir comandos de dirección durante la locomoción del humanoide.

No se dispone de información sobre el conjunto de datos de entrenamiento: la model card no indica número de tokens, número de trayectorias, composición del dataset, ni si se emplearon etapas de ajuste tipo RLHF o DPO. Tampoco se documenta el número de pasos de difusión, el esquema de ruido ni la frecuencia de control. El repositorio declara explícitamente que los datasets y las salidas de experimentos no están incluidos. Como innovaciones destacables, la model card menciona el carácter predictivo de la difusión de acciones y la direccionabilidad del control; además, el flujo de descarga verifica tamaño en bytes y SHA-256 antes de dar por válida la descarga, y el evaluador `predactor_eval.py` rechaza pesos almacenados dentro del checkout del código fuente.

## Capacidades

- Generación de acciones de locomoción para el robot humanoide Unitree G1 mediante una política de difusión (PDP051).
- Control direccionable (steerable): la política acepta condicionamiento de dirección para modular la marcha.
- Codificación de movimiento con MotionCLIP, que aporta representaciones de movimiento alineadas semánticamente como entrada de condicionamiento.
- Evaluación reproducible en MuJoCo, con verificación de integridad por SHA-256 de cada artefacto.
- No genera texto ni código.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo "thinking", visión general, audio ni procesamiento multimodal fuera del propio codificador de movimiento.
- No se documentan capacidades de manipulación, navegación autónoma de alto nivel ni planificación de tareas.

## Casos de uso

- Reproducción de resultados de investigación: descargar los dos artefactos mediante `scripts/hf_artifacts.py`, verificar los hashes y ejecutar `PredActor/predactor_eval.py` para replicar la evaluación publicada en MuJoCo con exactamente los mismos pesos.
- Comparativa de paradigmas de control: usar la política PDP051 como referencia de política de difusión frente a controladores de locomoción entrenados con aprendizaje por refuerzo, manteniendo el mismo robot y simulador para aislar la diferencia metodológica.
- Estudio del condicionamiento de movimiento: emplear el codificador MotionCLIP del G1 para analizar cómo representaciones de movimiento condicionan las trayectorias generadas, o como extractor de características en experimentos propios de análisis de marcha.
- Punto de partida para ajuste fino: dado que los pesos están separados del código y verificados por hash, sirven como inicialización reproducible para reentrenamientos o destilación hacia controladores más ligeros.
- Docencia y laboratorios de robótica: el par de artefactos (49,2 MB + 542,7 MB) es lo bastante pequeño para distribuirlo en aulas y ejecutarlo en estaciones de trabajo convencionales con MuJoCo instalado.
- Generación de datos sintéticos de locomoción: ejecutar la política en simulación para producir trayectorias de referencia que alimenten otros entrenamientos o validen restricciones cinemáticas del G1.
- Validación de infraestructura sim-to-real: usar la evaluación MuJoCo como banco de pruebas previo a cualquier intento de despliegue en hardware, comprobando primero la estabilidad de la marcha y la respuesta a comandos de dirección en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas (recompensa media, error de seguimiento de trayectoria, velocidad de marcha, tasa de caídas), y la búsqueda web realizada no devolvió resultados relacionados con PredActor, MotionCLIP aplicado al G1 ni con este repositorio. Los únicos datos cuantitativos verificables son los tamaños de los artefactos y sus hashes SHA-256:

| Artefacto | Tamaño (bytes) | SHA-256 |
|---|---:|---|
| PredActor PDP051 policy | 49.212.894 | `2d963b32786f2989c6472726df9fcfe6b385590127e12e1f549a4b7d77488b2e` |
| G1 MotionCLIP encoder | 542.749.069 | `66a127df4958b346089b2020f2705c7456d9db0ee8b4bd9518608b708b35fc3c` |

## Requisitos de hardware

- VRAM estimada para inferencia: la política PDP051 ocupa 49,2 MB, por lo que en fp32 requiere menos de 1 GB de VRAM incluyendo activaciones. El codificador MotionCLIP ocupa 542,7 MB de pesos, lo que supone en torno a 1,1 GB solo en pesos y, como estimación, 2-3 GB con activaciones y buffers.
- GPU recomendadas: no declaradas por el autor. Por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100); la elección no viene impuesta por el modelo sino por el simulador.
- Viabilidad en GPU de consumo: sí. El conjunto completo cabe holgadamente en cualquier GPU de consumo actual e incluso podría ejecutarse en CPU, dado el reducido tamaño de la política.
- Carga principal: la simulación MuJoCo del G1 es la parte dominante del coste computacional y está limitada por CPU, no por GPU.
- Opciones de despliegue: no aplican los servidores de inferencia de texto (vLLM, TGI, Ollama, llama.cpp). El despliegue previsto es mediante el script de evaluación `PredActor/predactor_eval.py` sobre MuJoCo, con los pesos descargados por `scripts/hf_artifacts.py` y verificados por SHA-256.
- Latencia y throughput: no disponibles. No se declara la frecuencia de control objetivo, el número de pasos de difusión por acción ni el rendimiento en pasos de simulación por segundo.
- Requisitos adicionales: es necesario disponer del código fuente de PredActor y de los activos del robot Unitree G1, que no se incluyen en este repositorio.

## Comparativa con modelos similares

La información disponible no permite una comparación cuantitativa: no hay métricas publicadas para PredActor ni especificaciones detalladas de alternativas. La tabla siguiente recoge solo lo verificable y marca como no disponible todo lo que no se ha podido confirmar.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PredActor (PDP051 + MotionCLIP G1) | Política de difusión para locomoción humanoide | No declarados; ~12,3 M y ~135,7 M estimados por tamaño de fichero | No aplica | other | HuggingFace, 0 descargas, 0 likes |
| Diffusion Policy (referencia académica del paradigma) | Política de difusión para manipulación robótica | No disponible en la información consultada | No aplica | No verificada en esta búsqueda | Repositorio público de investigación |
| MotionCLIP (obra original) | Codificador de movimiento alineado con texto | No disponible en la información consultada | No aplica | No verificada en esta búsqueda | Repositorio público de investigación |
| Controladores de locomoción humanoide basados en RL | Políticas de control por refuerzo | No disponible | No aplica | Variable según implementación | Múltiples repositorios públicos |

## Limitaciones y advertencias

- Licencia `other`: la model card indica explícitamente que los artefactos y sus componentes transitivos no comparten una única concesión de licencia. El usuario es responsable de cumplir los términos del código fuente de PredActor, de las dependencias MotionCLIP / OpenAI CLIP, de los activos de Unitree y de cualquier software de terceros.
- Alcance restringido a evaluación de investigación: los checkpoints se proporcionan para "research evaluation", sin garantía de aptitud para uso comercial ni de producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, con creación y última actualización en la misma fecha (2026-10-03), lo que implica que no hay evidencia externa de funcionamiento.
- Repositorio incompleto por diseño: no incluye datasets (el directorio `dataset/` está vacío), salidas de experimentos, bundles de despliegue ni checkpoints adicionales, lo que limita la reproducibilidad completa del entrenamiento.
- Dependencia de componentes externos: se requieren el código fuente de PredActor, los activos del robot Unitree G1 y MuJoCo; nada de ello está incluido en el repositorio.
- Sin datos de rendimiento: no hay benchmarks, métricas de seguimiento de comandos, tasas de caída ni comparaciones publicadas, por lo que no es posible evaluar la calidad de la política antes de ejecutarla.
- Riesgo en sim-to-real no cuantificado: no se documentan pruebas en hardware físico, latencias de control ni robustez frente a perturbaciones, imperfecciones del modelo dinámico o condiciones del mundo real.
- Idiomas: no aplica, pero conviene subrayar que no debe tratarse como un modelo de lenguaje pese a que el codificador derive de CLIP; no procesa instrucciones en lenguaje natural como entrada de control directa.
- Restricción operativa del evaluador: el script de evaluación rechaza pesos almacenados dentro del checkout del código, de modo que hay que respetar la disposición de directorios prevista.
- Sin información sobre sesgos: al no ser un modelo de lenguaje ni usar datos textuales etiquetados, el concepto habitual de sesgo no aplica; no se documentan sesgos de comportamiento motor ni cobertura limitada de terrenos o velocidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MasterYip/PredActor_Artifacts
- Repositorio de código fuente PredActor: https://github.com/MasterYip/PredActor
- Fichero de verificación de integridad: https://huggingface.co/MasterYip/PredActor_Artifacts/blob/main/SHA256SUMS
- Descarga de artefactos: `python scripts/hf_artifacts.py download` (desde el repositorio de código)
- Evaluación: `PredActor/predactor_eval.py` (desde el repositorio de código)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Las entradas devueltas por el buscador corresponden a temas ajenos (ChatGPT y complementos asociados) y no guardan relación con PredActor, Unitree G1, MotionCLIP aplicado a este robot ni con el repositorio de artefactos.
