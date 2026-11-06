# nvidia/GEM-X

## Resumen

GEM-X (Generalist Model for Human Motion) es un modelo de NVIDIA para la estimación de pose corporal 3D humana a partir de vídeo monoculario. Reconstruye el movimiento de cuerpo completo, incluidas las manos, en secuencias con cámara dinámica, y produce por fotograma tanto la cinemática local del cuerpo como la trayectoria global del movimiento en el espacio del mundo, en formato del modelo paramétrico SOMA. La salida es una pose de 77 articulaciones.

El modelo se compone de una red temporal específica (un Transformer de 12 capas, tamaño oculto 512 y 8 cabezas de atención, con 46,8 M de parámetros temporales) que consume condiciones preparadas por un codificador de imagen de pose corporal congelado, un modelo de mano separado (EgoHand-v1) y detectores de persona. No procesa píxeles RGB directamente en la etapa temporal: trabaja sobre observaciones 2D de 77 articulaciones, características de consulta de pose, condiciones de movimiento de cámara y tiempos de fotograma, junto con las cajas delimitadoras e intrínsecos de cámara por fotograma.

Su relevancia actual radica en que todo el material de entrenamiento y el modelo paramétrico SOMA son propiedad de NVIDIA o se distribuyen con licencias permisivas, por lo que el modelo se declara apto para uso comercial. Esto lo sitúa como una alternativa utilizable en producción para captura de movimiento, animación de personajes, avatares digitales y análisis biomecánico, frente a otros sistemas de captura cuya licencia o datos de entrenamiento limitan el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer temporal de 12 capas, tamaño oculto 512, 8 cabezas de atención |
| Parametros totales | 46,8 M en la red temporal de movimiento (46.762.136), de los cuales 44,2 M son entrenables; excluye el extractor de pose corporal, el modelo de mano y los detectores |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de vídeo con dimensión temporal T no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, no lingüístico) |
| Licencia | NVIDIA Open Model License (modelo); Apache 2.0 (código fuente) |
| Formato de pesos | No disponible explícitamente; el repositorio ocupa 39,7 GB e incluye etiqueta ONNX para detección de personas opcional |
| Entrada | Vídeo RGB `(T, H, W, 3)`, cajas de persona `(T, 4)` en xyxy e intrínsecos de cámara `(T, 3, 3)` |
| Salida | Tensor de parámetros corporales 3D por fotograma en formato SOMA (77 articulaciones, espacio del mundo) |
| Cómputo acumulado de entrenamiento | 1,9 × 10^19 FLOP |
| Energía estimada de entrenamiento | 58 kWh |
| Hardware compatible | Microarquitectura NVIDIA Ampere |
| Sistemas operativos | Linux, Windows, macOS |
| Motores de ejecución | PyTorch (extracción de pose corporal e inferencia temporal), ONNX Runtime (detección de personas opcional) |
| Versión | GEM v1 |

## Arquitectura y entrenamiento

La arquitectura es un Transformer temporal de 12 capas con tamaño oculto 512 y 8 cabezas de atención, con 46,8 M de parámetros dedicados al movimiento temporal. El flujo de inferencia es en cascada: un codificador de imagen de pose corporal congelado extrae características de consulta y observaciones 2D de 77 articulaciones; el detector y el rastreador localizan a una persona por secuencia; y la red temporal consume esas condiciones junto con el movimiento de cámara y los tiempos de fotograma, en lugar de los píxeles RGB. Las cajas delimitadoras y los intrínsecos de cámara determinan la condición CLIFF de tres valores por fotograma. La mano se resuelve con el checkpoint EgoHand-v1, distribuido por separado.

La model card no detalla la composición del dataset ni el número de tokens o secuencias de entrenamiento, ni menciona etapas de RLHF o DPO (no aplicables a este tipo de modelo). Sí declara que todos los datos de entrenamiento y el modelo paramétrico SOMA son propiedad de NVIDIA o se distribuyen bajo licencias permisivas, lo que habilita el uso comercial. El cómputo acumulado de entrenamiento se cifra en 1,9 × 10^19 FLOP y el consumo energético estimado en 58 kWh. La innovación principal es la separación entre un extractor de imagen congelado y una red temporal ligera que recupera tanto la cinemática local como la trayectoria global en espacio del mundo con cámara dinámica, algo que muchos sistemas monoculares no resuelven de forma estable.

## Capacidades

- Reconstrucción de pose corporal 3D por fotograma con 77 articulaciones en formato SOMA.
- Recuperación de movimiento global en espacio del mundo, no solo pose relativa a la cámara.
- Manejo de vídeo monoculario con cámara dinámica y en entornos no constraintos.
- Reconstrucción de manos mediante el checkpoint EgoHand-v1, distribuido por separado.
- Detección y seguimiento de una persona por secuencia, con detección opcional vía ONNX Runtime.
- Aceptación de intrínsecos de cámara por fotograma (calibración variable) o una matriz constante por clip, con estimación automática si no se suministra.
- Salida compatible con rigs de avatar SOMA para animación y avatares digitales.
- No dispone de tool calling, function calling, capacidades de agente ni generación de texto: es un modelo puramente de visión y movimiento.

## Casos de uso

- Captura de movimiento desde vídeo: procesar secuencias monoculares con cámara en movimiento para obtener pose 3D y trayectoria global; es adecuado porque el modelo está entrenado específicamente para cámara dinámica y entornos no constraintos.
- Animación de personajes para videojuegos y cine: convertir metraje real en animación de cuerpo completo con 77 articulaciones y aplicarla a rigs SOMA, reduciendo el trabajo manual de retargeting.
- Avatares digitales en tiempo real o diferido: conducir un avatar SOMA directamente desde la entrada de vídeo, aprovechando que la salida ya está en el espacio del modelo paramétrico.
- Análisis biomecánico: estudiar el movimiento humano en deporte, rehabilitación y medicina a partir de vídeo monocular, con trayectorias globales que permiten medir desplazamientos reales.
- Previsualización de efectos visuales: generar una primera capa de animación corporal sobre la que trabajar antes de una captura óptica completa, al no requerir hardware de captura dedicado.
- Investigación en visión por computador: usar el modelo como base o referencia para experimentos de estimación de pose 3D y movimiento global, dado que la red temporal es ligera y el extractor de imagen está congelado.
- Análisis de rendimiento deportivo: extraer cinemática de cuerpo completo en grabaciones de entrenamiento con cámara en mano para comparar ejecuciones entre sesiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 39,7 GB, pero incluye varios componentes (extractor de pose corporal, red temporal, modelo de mano y detectores) y no se desglosa el peso de cada uno.
- GPU recomendadas: el modelo declara compatibilidad con microarquitectura NVIDIA Ampere, lo que incluye la familia A100 y las RTX 30xx; no se especifican modelos concretos ni memoria mínima.
- ¿Cabe en GPU de consumo? No se indica de forma explícita. La red temporal tiene solo 46,8 M de parámetros, pero el conjunto incluye el extractor de imagen y el modelo de mano, cuyo consumo no se detalla.
- Opciones de despliegue: PyTorch para la extracción de pose corporal y la inferencia temporal; ONNX Runtime para la detección de personas opcional. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Sistemas operativos soportados: Linux, Windows y macOS.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de pose 3D monoculario con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al tratarse de un modelo de visión entrenado con datos propietarios de NVIDIA, la distribución del dataset no es pública y no puede auditarse la representatividad demográfica.
- Riesgo de alucinación en el sentido de poses plausibles pero incorrectas: como todo estimador monocular, puede producir articulaciones o trayectorias globales inconsistentes en oclusiones, desenfoque de movimiento o calibración de cámara incorrecta.
- El modelo asume una sola persona por secuencia; no está diseñado para escenas multitudinarias.
- La calidad depende de las cajas de persona y de los intrínsecos de cámara; una calibración errónea o una estimación automática deficiente degrada la trayectoria global.
- El modelo temporal no procesa RGB directamente: requiere el pipeline completo de detección, seguimiento y extracción de características, lo que añade latencia y complejidad de integración.
- Las manos se resuelven con un checkpoint separado (EgoHand-v1) con su propia licencia y distribución; no están incluidas en los pesos temporales.
- Licencia: el modelo usa la NVIDIA Open Model License y el código Apache 2.0; conviene revisar los términos de la licencia Open Model antes de un despliegue comercial, aunque la model card declara aptitud para uso comercial.
- La model card recomienda pruebas específicas del caso de uso siguiendo la metodología V-model antes de desplegar en producción.
- No se especifican limitaciones de idioma porque el modelo no procesa texto; la ausencia de esa fila en la información no implica soporte lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/GEM-X
- Repositorio GitHub: https://github.com/NVlabs/GEM-X
- Paper (arXiv): https://arxiv.org/abs/2505.01425
- Checkpoint de manos EgoHand-v1: https://huggingface.co/nvidia/EgoHand-v1
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
