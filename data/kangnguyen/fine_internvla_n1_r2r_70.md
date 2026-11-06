# kangnguyen/FINE_InternVLA_N1_R2R_70

## Resumen

FINE_InternVLA_N1_R2R_70 es un checkpoint de un modelo de navegación guiada por lenguaje (Vision-Language Navigation, VLN) desarrollado por Kang H. Nguyen y colaboradores, publicado en el artículo *FINE: Future-Informed Navigation Encoding for Data-Efficient Vision-Language Navigation* (arXiv:2609.32855). Se trata de un ajuste fino del modelo InternVLA-N1-DualVLN de InternRobotics sobre el 70 % de las demostraciones de entrenamiento del benchmark R2R-CE (Room-to-Room en Continuous Environments), y su propósito es demostrar que es posible inyectar supervisión sobre observaciones futuras sin coste adicional de anotación ni de interacción en el entorno.

La arquitectura subyacente es el sistema dual de InternVLA-N1: un *System 2* de razonamiento de alto nivel basado en Qwen2.5-VL-7B y un *System 1* de generación de trayectorias locales basado en NextDiT (`nextdit_async`). FINE añade dos ramas auxiliares de tokens: 18 tokens de landmarks explícitos y un token implícito de futuro entrenado con InfoNCE. El modelo totaliza 8.613.617.229 parámetros y se distribuye en cuatro shards safetensors en bfloat16 (17,2 GB de repositorio).

Su relevancia es doble: por un lado, ataca el problema de la eficiencia de datos en VLN, donde la recolección de demostraciones en simulación o en robots reales es costosa; por otro, lo hace sin modificar el espacio de acciones ni el cabezal de acción del modelo base, de modo que las ramas de futuro se descartan en inferencia y el despliegue queda idéntico al de InternVLA-N1. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema dual InternVLA-N1: Qwen2.5-VL-7B (System 2) + NextDiT `nextdit_async` (System 1), con tokens FINE explícitos (18) e implícitos (1) |
| Parametros totales | 8.613.617.229 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada: historial de 8 frames RGB-D a 224×224 más instrucción) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards), tokenizer, image processor y chat template |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura dual de InternVLA-N1. El *System 2* emplea Qwen2.5-VL-7B como columna vertebral visión-lenguaje para interpretar la instrucción y el historial visual, y produce como salida un objetivo de píxel o acciones discretas. El *System 1*, basado en NextDiT en su variante `nextdit_async`, traduce esa intención en una trayectoria local continua. La contribución de FINE son dos flujos de tokens auxiliares que condicionan el System 1 a través de proyectores separados con compuertas: 18 tokens de landmark explícitos, alineados con los landmarks ordenados de la instrucción, que predicen la región del próximo landmark en espacio semántico 2D (parches de Qwen2.5-VL) y geométrico 3D (VGGT); y un token implícito de futuro, entrenado de forma contrastiva con InfoNCE para distinguir el estado futuro realmente alcanzado de otros futuros, incluidos futuros contrafactuales en la misma escena generados por un modelo de mundo de vídeo (NanoWM).

El entrenamiento se realizó sobre el 70 % de las demostraciones de entrenamiento de R2R-CE, con máscaras de landmark y futuros contrafactuales generados por el modelo de mundo. Los frames futuros, las máscaras de landmark, VGGT y los rollouts del modelo de mundo se usan únicamente durante el entrenamiento: en despliegue la política conserva el espacio de acciones y el cabezal de acción originales de InternVLA-N1 y no requiere *lookahead*. El modelo se apoya además en Depth Anything V2 y Grounding DINO como componentes auxiliares del pipeline. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Navegación guiada por lenguaje en entornos continuos (VLN-CE) a partir de instrucciones en lenguaje natural e historial de observaciones RGB-D.
- Predicción de objetivo de píxel y de acciones discretas desde el System 2.
- Generación de trayectorias locales continuas desde el System 1 (NextDiT).
- Razonamiento visual-lenguaje heredado de Qwen2.5-VL-7B para interpretar la instrucción y la escena.
- Codificación de landmarks explícitos alineados con la instrucción (18 slots) y representación implícita del futuro.
- Operación sin *lookahead* en inferencia: las ramas de futuro no se ejecutan en despliegue.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes multi-paso fuera del bucle de navegación: no disponible.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión general, audio: no disponible (el modelo está especializado en navegación; la visión se limita al pipeline VLN).

## Casos de uso

- Navegación de robots móviles en interiores: el modelo recibe una instrucción como "ve a la cocina y espera junto a la nevera" y genera trayectorias locales continuas a partir de 8 frames RGB-D, adecuado para plataformas con control de bajo nivel propio.
- Evaluación comparativa de eficiencia de datos en VLN: al estar entrenado solo con el 70 % de R2R-CE, sirve como referencia para medir cuánto ayuda la supervisión de futuro frente a entrenar con el 100 % de las demostraciones.
- Investigación en *embodied AI*: reproduce el protocolo del artículo FINE sobre Habitat y permite ablaciones de los tokens explícitos e implícitos sin reentrenar desde cero.
- *Sim-to-real* en robótica de servicio: el espacio de acciones y el cabezal originales de InternVLA-N1 facilitan transferir políticas entrenadas en Habitat a robots con pilas de navegación clásicas.
- Generación de trayectorias locales en tiempo real: el System 1 con NextDiT produce trayectorias continuas que pueden alimentar un controlador de velocidad en un bucle de control, mientras el System 2 opera a menor frecuencia.
- *Benchmarking* de modelos de mundo para robótica: los futuros contrafactuales de NanoWM se usaron en entrenamiento, y el checkpoint permite estudiar su efecto en la política desplegada.
- Docencia y reproducción de resultados: al ser Apache 2.0 y estar en safetensors, se puede cargar con `transformers` y reproducir las curvas del artículo en un clúster pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de métricas (SR, SPL, NE, OSR) para este checkpoint concreto ni comparaciones numéricas con el modelo base u otras variantes de FINE.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,2 GB solo para pesos, más activaciones y buffers del pipeline VLN (historial de 8 frames a 224×224, VGGT y Grounding DINO si se usan en preprocesado); se recomienda un mínimo de 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; para GPUs de 16 GB sería necesaria cuantización, no publicada oficialmente.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con 24 GB en bfloat16, siempre que se gestione con cuidado el historial visual y los componentes auxiliares.
- Opciones de despliegue: `transformers` (librería declarada), ecosistema InternNav para el bucle de navegación en Habitat; vLLM, llama.cpp, Ollama o TGI no están documentados para esta arquitectura dual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FINE_InternVLA_N1_R2R_70 | 8,61 B | 8 frames RGB-D 224×224 + instrucción | VLN-CE (R2R-CE) | Apache 2.0 | Hugging Face |
| InternVLA-N1-DualVLN (base) | no disponible | no disponible | VLN | no disponible | Hugging Face (InternRobotics) |
| Qwen2.5-VL-7B-Instruct | 7 B (aprox.) | contexto largo multimodal | VLM general | no disponible en la información | Hugging Face (Qwen) |

La comparación con otros modelos VLN específicos (p. ej. variantes de NaVid, MapNav o Seq2Seq sobre R2R-CE) no está disponible en la información proporcionada, y no se dispone de métricas para establecer diferencias cuantitativas con el modelo base.

## Limitaciones y advertencias

- Especialización estrecha: no es un modelo de propósito general; fuera de tareas de navegación VLN su comportamiento no está validado.
- Entrenado solo con el 70 % de R2R-CE, lo que puede implicar menor cobertura de escenas e instrucciones que el modelo base completo.
- Dependencia de componentes con licencias propias (Qwen2.5-VL, VGGT, Depth Anything V2, Grounding DINO, NanoWM, FOCA): la licencia Apache 2.0 del checkpoint no sustituye a las de esos componentes.
- Riesgo de alucinación en la interpretación de instrucciones ambiguas y de landmarks no presentes en la escena; no hay evaluación publicada de robustez.
- Idiomas soportados no documentados; el entrenamiento sobre R2R-CE sugiere instrucciones en inglés.
- Longitud de contexto no documentada; la ventana efectiva está limitada por el historial de 8 frames.
- Sin cuantizaciones oficiales publicadas ni datos de latencia, lo que complica planificar despliegues en hardware limitado.
- Sin descargas ni validación comunitaria en el momento de la ficha: úsese con cautela en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kangnguyen/FINE_InternVLA_N1_R2R_70
- Página del proyecto FINE: https://finevln.github.io/
- Artículo arXiv: https://arxiv.org/abs/2609.32855
- Modelo base InternVLA-N1-DualVLN: https://huggingface.co/InternRobotics/InternVLA-N1-DualVLN
- Repositorio InternNav: https://github.com/InternRobotics/InternNav
- Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- VGGT: https://huggingface.co/facebook/VGGT-1B
- Depth Anything V2: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Small
- Grounding DINO: https://huggingface.co/IDEA-Research/grounding-dino-base
- NanoWM: https://github.com/simchowitzlabpublic/nano-world-model
- FOCA: https://github.com/cair-vinuni/FOCA
