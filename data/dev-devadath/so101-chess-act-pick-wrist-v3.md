# Dev-devadath/so101-chess-act-pick-wrist-v3

## Resumen

`so101-chess-act-pick-wrist-v3` es una política robótica de manipulación entrenada con ACT (Action Chunking Transformer) sobre el robot educativo SO-101, publicada por el usuario Dev-devadath en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de una imagen de cámara de muñeca y un vector de estado articular de 6 dimensiones, genera objetivos de articulación en forma de chunks de 100 acciones. El modelo resuelve una tarea muy concreta: recoger piezas de ajedrez desde una posición inicial conocida dentro del proyecto `so101-chess`.

La relevancia de esta ficha es acotada y debe interpretarse en ese contexto. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo pequeño pensado para inferencia en tiempo real en hardware de consumo, no para despliegues generalistas. Su propia model card lo describe como una versión de referencia conservada porque sirvió de base para la v4, y recomienda explícitamente usar la v4 para trabajo real. No hay información sobre idiomas, benchmarks estándar ni capacidades de texto.

Arquitectónicamente es un transformer de chunking de acciones con entrada multimodal (visión + estado propioceptivo) y salida continua de bajo nivel. El entrenamiento se realizó desde cero durante 100 000 pasos sobre 122 episodios, seguido de dos ajustes finos de 30 000 pasos a medida que se añadían demostraciones, hasta un total de 205 episodios del dataset `Dev-devadath/so101_pick3_wrist_v4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política visuomotora para robótica |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada: imagen de muñeca + estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, un transformer diseñado para imitación robótica que predice secuencias de acciones (chunks) en lugar de una acción por paso. La entrada combina una imagen de la cámara de muñeca con un vector de estado de 6 dimensiones (posiciones articulares del SO-101). La salida es un chunk de 100 objetivos de articulación, que en el despliegue se consumen con *temporal ensembling*: se vuelve a predecir en cada frame y se combinan las predicciones con coeficiente 0,01, activado mediante el flag `--ensemble` del repositorio `so101-chess`.

El entrenamiento se realizó desde cero durante 100 000 pasos sobre 122 episodios del dataset `Dev-devadath/so101_pick3_wrist_v4` (primer round, configuración d1/h1, posición inicial, rangos 1-2 del tablero), seguido de dos ajustes finos de 30 000 pasos cada uno a medida que se incorporaban nuevas demostraciones, hasta cubrir los primeros 205 episodios. Se construyó con `lerobot` en el commit `5c43fa1c` (versión 0.5.2 dev). No se documenta uso de RLHF, DPO ni recompensas explícitas: es imitación supervisada pura sobre demostraciones teleoperadas.

## Capacidades

- Generación de trayectorias de agarre: descend, grasp y lift desde una pose de hover IK a 8 cm sobre la pieza, con mordazas abiertas.
- Percepción visual de muñeca para localizar la pieza objetivo en el encuadre de la cámara.
- Predicción de chunks de 100 acciones articulares con ensamblado temporal para suavizar la ejecución.
- Control de un robot SO-101 de 6 grados de libertad mediante objetivos de articulación.
- Tarea especializada en piezas de ajedrez en posiciones iniciales (rangos 1-2 del tablero) con vecinos alrededor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Recogida automatizada de piezas en la posición inicial de ajedrez: el modelo está entrenado específicamente para descender, agarrar y elevar piezas situadas en los rangos 1-2 del tablero, lo que permite montar una rutina de calibración o de demostración reproducible en el robot SO-101.
- Base de referencia para comparativas de políticas: al ser la versión conservada como baseline de la v4, sirve para medir mejoras de rendimiento entre iteraciones del mismo pipeline de imitación.
- Docencia y experimentación con ACT: su tamaño de 51,7 M de parámetros y su repositorio de 0,2 GB permiten cargarlo y ejecutarlo en estaciones de trabajo modestas para estudiar el efecto del ensamblado temporal y del chunking de acciones.
- Pruebas de integración del stack `lerobot` + `so101-chess`: útil para validar el flujo de descarga, carga de política y ejecución con `chess/play.py` antes de sustituir la política por una versión superior.
- Reproducción de experimentos de imitación con pocos datos: el historial de entrenamiento (100k pasos desde cero + dos fine-tunes de 30k) documenta cómo escalar el rendimiento añadiendo demostraciones progresivamente.
- Validación de hardware y calibración de cámara de muñeca: al depender de la vista de muñeca y de las mismas almohadillas de mordaza, permite verificar que el montaje físico y la iluminación son consistentes antes de desplegar políticas más capaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una evaluación cualitativa: mejor que v1 y v2 en las casillas iniciales con vecinos alrededor, y débil en el centro del tablero y sobre piezas colocadas por el propio brazo con desviación de 10-20 mm respecto al centro, por ausencia de demostraciones en esas zonas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors, el peso de los pesos ronda los 0,2 GB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, cualquier GPU con al menos unos pocos GB libres debería poder alojar el modelo; se recomienda verificar los requisitos del stack `lerobot` y de la cámara utilizada.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en iGPU con suficiente memoria compartida, aunque no hay cifras publicadas.
- Opciones de despliegue: `lerobot` (commit `5c43fa1c`, 0.5.2 dev) con el script `chess/play.py` del repositorio `so101-chess` y el flag `--ensemble`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El despliegue requiere re-predicción por frame con ensamblado temporal, lo que condiciona la frecuencia de control efectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-chess-act-pick-wrist-v3 | 51,7 M | Imagen de muñeca + estado 6-D; chunk de 100 acciones | Mejor que v1/v2 en casillas iniciales; débil en centro y piezas descentradas 10-20 mm | Apache 2.0 | Hugging Face (`Dev-devadath/so101-chess-act-pick-wrist-v3`) |
| so101-chess-act-pick-wrist-v4 | no disponible | no disponible | Recomendada por el autor frente a v3 | no disponible | Referenciada en la model card; repositorio no confirmado en la información |
| Políticas ACT genéricas de `lerobot` | variable | Visión + estado | no disponible | variable según modelo | Ecosistema `lerobot` |

No se dispone de datos numéricos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Alcance extremadamente restringido: solo funciona desde una pose de hover IK a 8 cm sobre la pieza con mordazas abiertas; desde otra pose inicial no realizará nada útil.
- Dependencia del montaje físico: exige las mismas almohadillas de mordaza en la vista de muñeca y la misma configuración de cámara que en el entrenamiento.
- Debilidad documentada en el centro del tablero y en piezas colocadas por el propio brazo con desviación de 10-20 mm respecto al centro, por falta de demostraciones en esas zonas.
- El propio autor recomienda usar la v4 en lugar de esta versión para trabajo real.
- Riesgo de sobreajuste a las condiciones de iluminación, fondo y disposición del dataset de entrenamiento (205 episodios de `so101_pick3_wrist_v4`).
- Sin capacidades lingüísticas ni de razonamiento general: no debe evaluarse con métricas de LLM (MMLU, HumanEval, GSM8K) ni usarse fuera de control robótico.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de benchmarks publicados hace necesario validar el comportamiento en el entorno de destino antes de cualquier despliegue en producción.
- No se documentan sesgos sociales ni de alucinación en el sentido de los LLM; el riesgo equivalente es la ejecución de trayectorias erróneas que pueden dañar piezas o el robot.

## Enlaces

- Hugging Face: https://huggingface.co/Dev-devadath/so101-chess-act-pick-wrist-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Dev-devadath/so101_pick3_wrist_v4
- Repositorio del proyecto: https://github.com/Dev-devadath/so101-chess
- Librería `lerobot`: no se proporciona enlace en la información disponible (commit referenciado `5c43fa1c`, 0.5.2 dev)
