# fastforks/insid3

## Resumen

INSID3 es un modelo de segmentación promptable desarrollado por el grupo de investigación visinf (Universidad de Mannheim) y empaquetado para su uso por el proyecto fastforks. Su particularidad es que funciona sin entrenamiento adicional (*training-free*): a partir de una o varias imágenes de referencia con sus máscaras, identifica el mismo concepto en una imagen objetivo. No se trata de un modelo con pesos propios, sino de un procedimiento de segmentación en contexto que opera sobre las características de parche de un backbone congelado DINOv3 ViT-L/16.

Técnicamente, INSID3 combina tres etapas sobre las características del backbone: un *positional debiasing* para eliminar la dependencia posicional de los parches, un emparejamiento forward/backward entre referencia y objetivo, y un clustering por *average-linkage* de los parches del objetivo. El resultado son máscaras binarias con puntuaciones de calidad. Todo el cómputo de clustering se ejecuta en GPU.

El modelo es relevante para investigadores que necesitan segmentación guiada por concepto sin reentrenar, con un coste de inferencia bajo (157 ms en 1024x1024 con el backend de kernels sobre una RTX 5060 Ti) y una paridad numérica verificada frente al código original. Su licencia es la DINOv3 License de Meta, con atribución y condiciones, y el backbone está gated en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Segmentación en contexto sobre backbone DINOv3 ViT-L/16 (transformer ViT congelado) + clustering de parches |
| Parámetros totales | No disponible (depende del backbone DINOv3 ViT-L/16; el repo no aloja pesos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen redimensionada internamente a 1024x1024) |
| Tipos de cuantización | fp32 (original), fp16 (portable y kernels por defecto); no se documentan otras |
| Idiomas soportados | No disponible (modelo de visión; los prompts de texto dependen del backbone) |
| Licencia | Código: Apache-2.0. Pesos del backbone: DINOv3 License (LicenseRef-DINOv3-License, gated, atribución y condiciones) |
| Formato de pesos | safetensors (backbone DINOv3 ViT-L/16); el repo de INSID3 no contiene pesos |
| Pipeline | mask-generation / promptable_segmentation |
| Entrada | Imagen + prompt de punto, caja o texto |
| Salida | `similarity`, `masks` (máscaras con puntuaciones de calidad) |
| Backends | `portable`, `kernels` |
| Tamaño de entrada | Cualquier H x W >= 1, redimensionado a 1024x1024 |
| Tier | Experimental |

## Arquitectura y entrenamiento

INSID3 no entrena ningún parámetro propio: es un método *training-free* de segmentación en contexto. El backbone es DINOv3 ViT-L/16, un Vision Transformer congelado preentrenado de forma autosupervisada sobre LVD-1689M (1.689 mil millones de imágenes de Instagram curadas, dataset no liberado). Sobre las características de parche de ese backbone se aplican tres operaciones: *positional debiasing* para neutralizar el sesgo posicional de los embeddings, emparejamiento forward/backward entre los parches de referencia y los del objetivo, y clustering por *average-linkage* de los parches del objetivo para producir las máscaras finales.

El módulo portable expone únicamente el backbone; el procedimiento de segmentación completo (debias, matching y clustering) se ejecuta en GPU. No hay RLHF, DPO ni fine-tuning: la "innovación" es el pipeline de inferencia en sí, que convierte un modelo de representación visual genérico en un segmentador guiado por concepto sin coste de entrenamiento. La entrada se redimensiona internamente a 1024x1024, que es el tamaño de exportación por defecto del encoder.

## Capacidades

- Segmentación promptable con prompts de punto, caja o texto.
- Segmentación en contexto (*in-context*): dada una imagen de referencia con su máscara, localiza el mismo concepto en una imagen objetivo.
- Soporte de múltiples pares (referencia, objetivo) para una misma clase, agregando la evidencia.
- Salida de máscaras binarias con puntuaciones de calidad y mapa de similitud.
- Ejecución en GPU del clustering de parches (backend `kernels`).
- Compatibilidad con `torch.compile` y exportación a TensorRT fp16 (solo el encoder de imagen).
- Backends intercambiables `portable` y `kernels` con paridad numérica verificada.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente visual de segmentación.

## Casos de uso

- Anotación semiautomática de datasets de segmentación: dado un puñado de imágenes de referencia con máscara por clase, INSID3 propaga esa clase al resto del corpus sin reentrenar, reduciendo el coste de etiquetado manual.
- Segmentación *few-shot* en dominios con pocos datos: en imágenes médicas o industriales donde no hay un dataset grande, se usan 1-3 referencias anotadas y el modelo localiza la estructura de interés en nuevas imágenes.
- Control de calidad en líneas de producción: con una referencia de un defecto (por ejemplo, una grieta), el modelo detecta el mismo tipo de defecto en imágenes nuevas de la cámara de inspección, con latencia de 157 ms por imagen en 1024x1024.
- Segmentación guiada por concepto en herramientas de edición: el usuario selecciona un objeto en una imagen de referencia y el modelo lo aísla en otra imagen, útil para flujos de *rotoscoping* o sustitución de fondos.
- Preprocesado para pipelines de visión: generar máscaras de instancias para tareas posteriores (detección, clasificación por región, medición de áreas) sin depender de un detector entrenado específicamente.
- Investigación en representaciones visuales: evaluar la calidad de las características de DINOv3 en tareas de correspondencia semántica mediante el protocolo one-shot sobre COCO val2017, con paridad numérica frente al código original.
- Prototipado rápido en robótica o percepción: segmentar un objeto mostrado por el operador (referencia) en la escena actual del robot, aprovechando que no requiere entrenamiento ni ajuste por tarea.

## Benchmarks y rendimiento

Precisión en segmentación en contexto (COCO val2017, episodios one-shot, 3 pares por clase, mIoU de clase en %):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `insid3-vitl16` | 57.61 | 57.56 | 57.28 | 57.21 |

Latencia y memoria (segmentación promptable sintética, 1024x1024, RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `insid3-vitl16` | 1649 | 713 | 255 | 157 | 4.5x | 986 / 1228 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `insid3-vitl16` | 1.06 | 2.69 | 1.39 | 1.11 | 0.44 | 0.46 |

`torch.compile` y TensorRT (entrada 1024x1024):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Compilación en frío (s) | Build ONNX + engine (s) |
|---|---|---|---|---|---|---|
| `insid3-vitl16` | 255 | 235 | 64.1 (solo encoder) | 157 | 17.2 | 42.1 |

Paridad con el código original: en CPU float32, diferencia máxima absoluta <= 0.002; en GPU float16, error medio absoluto <= 0.002 y p99 <= 0.005 sobre la salida `similarity`.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GiB de memoria pico asignada en fp16 para 1024x1024 (986 MiB asignados, 1228 MiB reservados en portable); con TensorRT el pico sube a 1339/1508 MiB.
- GPU recomendada: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM; el benchmark oficial se ejecutó en una RTX 5060 Ti 16 GB (sm_120).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 5060 Ti o superiores.
- Entradas grandes: probado hasta 1080x1920 en portable fp16 con 1.0 GiB pico asignado y 1.3 GiB reservado.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), `torch.compile`, exportación a ONNX + TensorRT fp16 (solo encoder de imagen).
- Latencia: 157 ms por prompt en 1024x1024 con kernels; 255 ms con portable; 64.1 ms con TensorRT fp16 (solo encoder). Primera llamada en torno a 0.44-0.46 s.
- Throughput: no se publica una cifra de imágenes por segundo; la latencia por llamada es la métrica disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| INSID3 (este) | Segmentación en contexto training-free | Backbone DINOv3 ViT-L/16 | Imagen redimensionada a 1024x1024 | Referencia + máscara → concepto en objetivo | Apache-2.0 (código) + DINOv3 License (pesos) | Repo de tarjeta en HF; pesos del backbone gated |
| Segment Anything (SAM) | Segmentación promptable | No disponible en la información | No disponible | Punto/caja/máscara, sin referencia de concepto | No disponible | No disponible |
| DINOv3 ViT-L/16 (solo backbone) | Representación visual | No disponible en la información | 1024x1024 | Features genéricas, sin segmentación | DINOv3 License | Gated en HF |

No se dispone de datos de benchmarks comparativos con SAM u otros segmentadores en la información proporcionada; la única comparación numérica publicada es contra el código original de INSID3.

## Limitaciones y advertencias

- El repositorio es solo una tarjeta de modelo: no contiene pesos. La descarga y verificación de los pesos del backbone corre a cargo del usuario.
- El backbone DINOv3 está bajo la DINOv3 License de Meta, con atribución y condiciones, y está *gated* en Hugging Face; hay que revisarla antes de cualquier uso comercial.
- El código de INSID3 es Apache-2.0, pero el paquete se describe como de uso de investigación; conviene verificar las condiciones antes de otros usos.
- Modelo en tier experimental: no hay garantías de estabilidad de API ni de resultados en dominios no evaluados.
- La precisión publicada se limita a COCO val2017 en episodios one-shot (57.21-57.61 % mIoU de clase); no hay datos de otros datasets.
- No se documentan sesgos específicos, pero el backbone se preentrenó sobre imágenes de Instagram (LVD-1689M), lo que puede introducir sesgos de dominio y demográficos.
- Riesgo de alucinación de máscaras: al ser training-free, la calidad depende de la similitud entre referencia y objetivo; conceptos poco representados en el backbone pueden producir segmentaciones erróneas.
- El prompt de texto depende del backbone y no se detalla su comportamiento multilingüe.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es adecuado para tareas de lenguaje.
- La latencia de TensorRT (64.1 ms) cubre solo el encoder de imagen, no el pipeline completo de segmentación.

## Enlaces

- Tarjeta del modelo en Hugging Face: https://huggingface.co/fastforks/insid3
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de INSID3 (commit 0c165a10cf52): https://github.com/visinf/INSID3
- Licencia del código original: https://github.com/visinf/INSID3/blob/0c165a10cf52ab91f335883d06260de86854adbe/LICENSE
- Pesos del backbone DINOv3 ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/promptable_segmentation/models/insid3/card.toml
