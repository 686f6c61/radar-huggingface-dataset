# JingwuLuo/imagewam-qwenimage2.1-robotwin

## Resumen

ImageWAM con Qwen-Image-2.1 sobre RoboTwin 2.0 es un modelo de acción y mundo (*world-action model*) para robótica bimanual, publicado por el usuario JingwuLuo y construido por ajuste fino sobre Qwen/Qwen-Image-2.1. No es un modelo conversacional: recibe una imagen compuesta por tres cámaras de un robot, un vector de estado proprioceptivo de 14 dimensiones y una instrucción en lenguaje natural, y devuelve un *chunk* de 16 acciones futuras (articulaciones y pinzas en valores absolutos) para un brazo aloha-agilex; opcionalmente predice también el fotograma en t+16.

Técnicamente es una mezcla de transformers: el DiT de Qwen-Image-2.1 actúa como experto de vídeo (7,12 B parámetros) y un DiT de acción de 1.024 dimensiones ocultas se empareja capa a capa con él como experto de acción (0,85 B). El entrenamiento sigue la receta del modelo ImageWAM-FLUX.2-4B-RoboTwin ya publicado, cambiando solo las piezas ligadas al *backbone*: DiT de edición, características de texto, VAE y profundidad del experto de acción.

Su relevancia es acotada pero clara: sirve como referencia reproducible para comparar backbones de generación de imagen (Qwen-Image-2.1 frente a FLUX.2-4B) dentro de la misma receta de *world-action model*, sobre las 50 tareas de RoboTwin 2.0. El repositorio es de octubre de 2026, tiene 0 descargas y 0 *likes*, y el checkpoint publicado corresponde al paso 65.000 de los 69.900 programados (93 % del calendario de entrenamiento).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ImageWAM: mezcla de transformers (*mixture of transformers*) con dos DiT acoplados capa a capa; experto de vídeo = DiT de Qwen-Image-2.1, experto de acción = DiT de 1.024 dimensiones ocultas |
| Parámetros totales | 7,97 B en el *state dict* `mot` (7,12 B experto de vídeo + 0,85 B experto de acción); el codificador de texto (Qwen3-VL-8B) y el VAE están congelados y su recuento no se detalla |
| Parámetros activos | no aplica: dos expertos densos acoplados, sin enrutamiento disperso |
| Longitud de contexto | no disponible; el codificador de texto se rellena a 128 posiciones con máscara de validez y el horizonte de predicción es de 16 acciones |
| Tipos de cuantización | no disponible; solo se publican pesos en bfloat16 |
| Idiomas soportados | no disponible; las instrucciones del dataset están en inglés y se envuelven en una plantilla fija |
| Licencia | Qwen Research License Agreement (`qwen-research`, `license: other`) |
| Formato de pesos | `.pt` (diccionario de `torch.save`, bfloat16) más `config.yaml` y `dataset_stats.json`; no hay safetensors ni GGUF |
| Tamaño del repositorio | 15,9 GB |
| Pipeline declarado | `robotics` |

## Arquitectura y entrenamiento

La red es una mezcla de transformers con dos rutas densas: el DiT de edición de Qwen-Image-2.1 como experto de vídeo y un DiT de acción de 1.024 dimensiones que se empareja capa a capa con él. La entrada visual es un único fotograma en el que se embaldosan las tres cámaras de RoboTwin (cada una a 480 × 640) en una imagen de 288 × 256 con el diseño `compact_288x256`: `cam_high` ocupa 192 × 256 arriba, y `cam_left_wrist` y `cam_right_wrist` ocupan 96 × 128 abajo a la izquierda y a la derecha, respectivamente; cada vista se redimensiona bilinealmente a su baldosa y la imagen se escala a [-1, 1] antes de pasar por el VAE de Qwen-Image-2.1. El estado proprioceptivo son 14 valores en unidades crudas, normalizados con z-score mediante `dataset_stats.json` (índices 0-5: cintura, hombro, codo, giro de antebrazo, ángulo de muñeca y rotación de muñeca del brazo izquierdo; 6: pinza izquierda; 7-12: brazo derecho en el mismo orden; 13: pinza derecha). El codificador proprioceptivo comprime ese vector en un solo token que se coloca justo después de los tokens de texto válidos. El texto se envuelve en la plantilla `A video recorded from a robot's point of view executing the following instruction: {task}` y se codifica con el codificador de texto de Qwen-Image-2.1 (Qwen3-VL-8B), tomando los estados ocultos de la última capa del decodificador antes de la normalización final (4.096 dimensiones), con la plantilla de chat texto-a-imagen sin mensaje de sistema y rellenada a 128 posiciones. Codificar instrucciones nuevas requiere transformers ≥ 5.

El entrenamiento usa *flow matching* con λ_vídeo 0,5 y λ_acción 1,0, y un *shift* de 5,0 en entrenamiento e inferencia para ambos expertos. Los datos son yuanty/robotwin2.0-fastwam, la versión LeRobot de RoboTwin 2.0 publicada por FastWAM: 50 tareas × 550 episodios (50 escenas limpias y 500 aleatorizadas por tarea), 27.500 episodios y 6.075.103 fotogramas a 50 fps. Cada fotograma dentro de los rangos no inactivos (89,29 % del total) es una muestra, con una partición de validación del 1 % a nivel de episodio; las instrucciones son las cadenas por fotograma del dataset (921.032 cadenas distintas, plantillas vistas de RoboTwin). La aumentación se aplica con p = 0,5: *color jitter* 0,2/0,2/0,2/0,03, gamma 0,9-1,1, ruido gaussiano 0,01, recorte redimensionado aleatorio (escala 0,95-1,0) y rotación de ±5°. Se optimiza con AdamW (betas 0,9/0,95, learning rate 1e-4, weight decay 0,01), 3.495 pasos de calentamiento (5 %) y decaimiento coseno hasta 1e-6; lote global 384 (48 por GPU × 8 GPU, sin acumulación), bf16, DeepSpeed ZeRO-2 y recorte de gradiente de 1,0, sobre 8 × NVIDIA B300 con un pico de 55,3 GB por GPU.

Se entrenaron el DiT de edición completo, el experto de acción y el codificador proprioceptivo; el codificador de texto y el VAE quedaron congelados. El experto de vídeo se inicializa desde Qwen-Image-2.1 y el experto de acción se copia de los bloques del *backbone* capa a capa, interpolado a su anchura, sin preentrenamiento en datos de corporización. Respecto a la receta de FLUX.2-4B publicada, cambian el reparto por GPU del lote de 384 (el original usaba 12 por GPU × 4 de acumulación × 8 GPU), la aplicación efectiva del recorte de gradiente de 1,0 (tabla 8 del artículo) y la parada anticipada: la ejecución estaba programada a 69.900 pasos (5 épocas) y se detuvo en el paso 67.110, con lo que se publican los pesos del paso 65.000, el último checkpoint guardado; el learning rate coseno en ese punto es 2,32e-6 frente al pico de 1e-4 y el suelo de 1e-6.

## Capacidades

- Predicción de acciones: genera un *chunk* de 16 acciones futuras con el mismo esquema de 14 dimensiones que el estado (articulaciones y pinzas absolutas, normalizadas en z-score y desnormalizables con `dataset_stats.json` → `action`).
- Codificación de estado proprioceptivo: convierte los 14 valores crudos del aloha-agilex en un único token condicionante.
- Entrada visual multi-cámara compactada: fusiona cámara de cabeza y dos muñecas en una imagen de 288 × 256.
- Condicionamiento por instrucción en lenguaje natural mediante plantilla fija en inglés.
- Rama de vídeo opcional: predice el fotograma en t+16 a 288 × 256, útil como señal auxiliar de entrenamiento o como diagnóstico.
- Alcance restringido a las 50 tareas de RoboTwin 2.0 y a la morfología aloha-agilex de 14 grados de libertad (dos brazos de 6 articulaciones más dos pinzas).
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni conversación multi-turno.
- No se declaran capacidades multilingües, de visión general (VQA), de código ni matemáticas.

## Casos de uso

- Manipulación bimanual en simulación RoboTwin 2.0: el modelo recibe el fotograma compuesto de las tres cámaras y el estado de 14 valores, y devuelve las 16 siguientes consignas absolutas de articulación y pinza para ejecutar la tarea indicada en la instrucción.
- Comparación de *backbones* de imagen dentro de una receta fija: al mantener idéntica la receta de ImageWAM y cambiar solo el DiT de edición, el VAE y las características de texto, permite aislar el efecto de Qwen-Image-2.1 frente a FLUX.2-4B en las mismas 50 tareas.
- Generación de datos sintéticos y aumentación: la rama de vídeo predice el fotograma en t+16, lo que permite construir pares observación-predicción para filtrar o ampliar conjuntos de demostraciones.
- Base para ajuste fino en dominios propios: al publicarse el `config.yaml` resuelto con el bloque `model` y el bloque `data` (preprocesado), el checkpoint sirve como inicialización para otras tareas con el mismo esquema de 14 dimensiones.
- Diagnóstico y depuración de políticas visuomotoras: comparar la acción predicha con la ejecutada y la imagen predicha con la real en t+16 ayuda a localizar deriva en el seguimiento de instrucciones o descalibración de cámaras.
- Prototipado en laboratorio con hardware limitado: el *state dict* `mot` en bfloat16 ocupa unos 15,9 GB, por lo que la inferencia del experto de acción más el VAE puede montarse en una GPU de 48-80 GB separando la codificación de texto.
- Docencia e investigación sobre *world-action models*: el repositorio incluye estadísticas de normalización, configuración completa y pesos, lo que facilita reproducir el pipeline de extremo a extremo sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README se interrumpe en el epígrafe «Training-time validation» y no incluye tasas de éxito por tarea, ni comparaciones numéricas con ImageWAM-FLUX.2-4B-RoboTwin ni con otras políticas sobre RoboTwin 2.0.

## Requisitos de hardware

- Pesos del modelo: 15,9 GB en bfloat16 (7,97 B parámetros × 2 bytes), coherente con el tamaño del repositorio.
- Codificador de texto congelado (Qwen3-VL-8B): en bfloat16 ocupa del orden de 16 GB adicionales; sumado al VAE y a las activaciones del DiT para 128 posiciones de texto y una imagen de 288 × 256, el pipeline completo en bfloat16 se sitúa estimativamente por encima de 32-40 GB de VRAM (estimación derivada del tamaño de los componentes, no publicada por el autor).
- Entrenamiento documentado: 8 × NVIDIA B300 con 55,3 GB de pico por GPU y 48 muestras por GPU, bf16 y DeepSpeed ZeRO-2.
- GPU consumer: una RTX 4090 de 24 GB no puede alojar el pipeline completo en bfloat16 y no se publican pesos cuantizados; se necesitaría cuantizar por cuenta propia, algo no soportado oficialmente.
- Despliegue: no hay integración con vLLM, TGI, llama.cpp ni Ollama. Los pesos son un `.pt` de `torch.save` que se carga con el código de ImageWAM, y `config.yaml` conserva rutas absolutas de la máquina de entrenamiento (dataset, pesos base, caché de texto) que hay que redirigir a copias locales.
- Latencia y throughput: no disponibles.
- Nota de reproducibilidad: no se incluyen logs de entrenamiento, estados del optimizador, características de texto ni datos, por lo que el entrenamiento no es reanudable desde el checkpoint publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImageWAM Qwen-Image-2.1 RoboTwin (este) | 7,97 B en `mot` (7,12 B vídeo + 0,85 B acción) | 128 posiciones de texto; 16 acciones | No publicado | Qwen Research License | Pesos `.pt` en HF, 15,9 GB, 0 descargas |
| ImageWAM FLUX.2-4B RoboTwin (`yuyangalin/ImageWAM-FLUX.2-4B-RoboTwin`) | no disponible en detalle; *backbone* FLUX.2-4B | misma receta ImageWAM | No publicado en la información disponible | no disponible | Público en HuggingFace |
| Qwen-Image-2.1 (modelo base) | no disponible | no disponible | No publicado en la información disponible | no disponible | Público en HuggingFace |

La comparación cuantitativa de rendimiento entre estos tres modelos no está disponible: el autor no reporta métricas de éxito en RoboTwin 2.0 ni de calidad de edición de imagen, y la única diferencia documentada frente a la receta FLUX.2-4B es de configuración de entrenamiento (reparto del lote, recorte de gradiente y parada en el paso 65.000).

## Limitaciones y advertencias

- Licencia Qwen Research: no es una licencia permisiva tipo Apache-2.0 y debe revisarse el archivo `LICENSE` antes de cualquier uso comercial o redistribución.
- Modelo de investigación con 0 descargas y 0 *likes*: no hay validación externa ni informes de terceros sobre su comportamiento.
- Dominio cerrado: entrenado solo con las 50 tareas y las plantillas vistas de RoboTwin 2.0; no se ha evaluado en tareas nuevas ni con instrucciones fuera de la plantilla.
- Morfología fija: el estado y la acción asumen 14 dimensiones en el orden exacto del dataset aloha-agilex; cualquier robot con otra cinemática requiere reencuadrar el problema.
- Resolución de entrada reducida: las tres cámaras de 480 × 640 se comprimen a una imagen de 288 × 256, lo que puede perder detalle fino relevante para agarres precisos.
- Entrenamiento incompleto: los pesos corresponden al paso 65.000 de 69.900 (93 %), con el learning rate aún en 2,32e-6; no es un modelo convergido al final del calendario.
- Sin validación en hardware real declarada: RoboTwin 2.0 es un simulador y no se documenta transferencia sim-a-real.
- Riesgo de deriva y alucinación de acciones en horizontes largos: el modelo predice en bloque 16 pasos y no se reportan mecanismos de corrección más allá del reajuste por realimentación del estado.
- Formato y empaquetado frágiles: pesos en `.pt` (no safetensors), `config.yaml` con rutas absolutas de la máquina de entrenamiento y ausencia de estados del optimizador y logs, lo que dificulta la reproducibilidad y la reanudación.
- Idiomas: no se declara soporte multilingüe; las instrucciones del dataset están en inglés y la plantilla está fijada literalmente.
- Codificar instrucciones nuevas exige transformers ≥ 5 por el uso del codificador Qwen3-VL-8B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JingwuLuo/imagewam-qwenimage2.1-robotwin
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de entrenamiento: https://huggingface.co/datasets/yuanty/robotwin2.0-fastwam
- Artículo de ImageWAM: https://arxiv.org/abs/2606.19531
- Modelo de referencia con receta FLUX.2-4B: https://huggingface.co/yuyangalin/ImageWAM-FLUX.2-4B-RoboTwin
- Licencia (archivo en el repositorio): https://huggingface.co/JingwuLuo/imagewam-qwenimage2.1-robotwin/blob/main/LICENSE
