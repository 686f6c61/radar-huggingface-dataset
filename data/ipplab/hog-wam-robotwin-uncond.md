# ipplab/HOG-WAM-RoboTwin-Uncond

## Resumen

HOG-WAM-RoboTwin-Uncond es un checkpoint de política robótica (vision-language-action, VLA) desarrollado por el laboratorio iPPLab. Se construye sobre FastWAM-JAX y sobre el modelo generativo Wan2.2-TI2V-5B, al que añade una tarea auxiliar de predicción de histogramas de gradientes orientados (HOG) sobre el futuro visual, entrenada de forma conjunta con la generación de RGB y la predicción de acciones. El resultado es un modelo que, dada una observación RGB actual, el estado articular (propriocepción) y una instrucción en lenguaje natural, predice un chunk de objetivos articulares absolutos para manipulación robótica.

El checkpoint liberado está entrenado sobre RoboTwin 2.0, un benchmark de manipulación con 50 tareas, usando tanto demostraciones de escena limpia como aleatorizada. La innovación principal es el uso de la predicción HOG como señal auxiliar de representación: el DiT auxiliar de HOG se elimina en inferencia, de modo que el coste en despliegue es el de la política base, pero el entrenamiento se beneficia de una supervisión estructural sobre la evolución futura de la escena.

Es relevante porque aborda el problema de la robustez ante corrupciones visuales en políticas VLA entrenadas sobre modelos generativos de vídeo: en el benchmark RoboTwin-Plus, la media de robustez sube de 87,02% (FastWAM) a 88,58% (HOG-WAM), con mejoras notables en ruido mixto (78,86% a 82,86%). Los pesos se distribuyen en formato Orbax BF16 para JAX/Flax, con un tamaño de repositorio de 9,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA basada en DiT (expertos RGB y acción) inicializada desde Wan2.2-TI2V-5B, con encoder de propriocepción y VAE Wan2.2 congelado; predicción auxiliar HOG solo en entrenamiento |
| Parametros totales | no disponible (el modelo base Wan2.2-TI2V-5B declara 5B; el checkpoint no detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (condicionado por instrucción de lenguaje e historial de observación, sin cifra publicada) |
| Tipos de cuantizacion | BF16 (único formato publicado: `params_bf16_step0029365`) |
| Idiomas soportados | no disponible |
| Licencia | Wan2.2 license (license_name: wan2.2, license: other) |
| Formato de pesos | Orbax (JAX/Flax), BF16 |

## Arquitectura y entrenamiento

HOG-WAM parte de la inicialización de Wan2.2-TI2V-5B, un modelo generativo de texto-imagen-a-vídeo, y lo adapta como política de manipulación. La arquitectura desplegada contiene dos expertos (RGB y acción) más un encoder de propriocepción; el VAE de Wan2.2 permanece congelado y se distribuye como asset separado, igual que las estadísticas de normalización de RoboTwin. Durante el entrenamiento se añade un DiT auxiliar que predice HOG del futuro, forzando al modelo a representar estructura geométrica y de contorno de la escena además de la apariencia RGB. Ese DiT auxiliar se descarta en inferencia, por lo que no incrementa el coste de despliegue.

El entrenamiento usa las demostraciones limpias y aleatorizadas del dataset Fast-WAM RoboTwin 2.0, que cubre 50 tareas de manipulación. Se emplea un tamaño de batch efectivo de 1.024, ocho copias de acción con ruido independiente y una tasa de aprendizaje máxima de 1e-4. El checkpoint liberado corresponde al paso 29.365. La receta completa está publicada en el repositorio HOG-WAM (`configs/training/robotwin-hog.example.yaml`). El cómputo se apoyó parcialmente en Cloud TPUs de Google (TPU Research Cloud).

## Capacidades

- Predicción de chunks de acciones articulares absolutas a partir de RGB actual, estado articular e instrucción de lenguaje.
- Manipulación robótica multi-tarea: entrenado sobre 50 tareas de RoboTwin 2.0.
- Condicionamiento por lenguaje natural para seleccionar la tarea o el objetivo.
- Robustez ante corrupciones visuales: ruido mixto, filtro cálido, subexposición y contraste reducido (evaluado en RoboTwin-Plus).
- Fusión de modalidades: visión (RGB vía VAE de Wan2.2), propriocepción (encoder dedicado) y texto.
- Supervisión auxiliar HOG durante entrenamiento para mejorar la representación espacial (no activa en inferencia).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, audio ni diálogo general.

## Casos de uso

- Manipulación robótica en simulación con RoboTwin 2.0: el modelo se integra en el simulador siguiendo la guía de evaluación del repositorio para ejecutar las 50 tareas con 100 episodios por tarea, sirviendo como política de referencia o baseline.
- Evaluación de robustez visual: usar RoboTwin-Plus para medir el deterioro de la política bajo ruido, subexposición, filtro cálido y contraste reducido, comparando contra FastWAM con las mismas condiciones.
- Investigación en representaciones auxiliares: el checkpoint permite ablacionar el efecto de la predicción HOG comparando con la política base FastWAM en las mismas tareas.
- Transferencia a robot real como punto de partida: al predecir objetivos articulares absolutos condicionados por lenguaje, puede servir de inicialización para fine-tuning sobre demostraciones de un brazo concreto.
- Desarrollo de pipelines VLA en JAX/Flax: el formato Orbax y el stack JAX permiten integrar el modelo en entrenamientos distribuidos en TPU/GPU sin conversión a PyTorch.
- Benchmarking de modelos generativos de vídeo como políticas: útil para estudiar hasta qué punto la inicialización desde Wan2.2-TI2V-5B aporta ventaja frente a políticas entrenadas desde cero.
- Validación de recetas de entrenamiento: la configuración publicada (batch 1.024, ocho copias ruidosas, lr 1e-4) sirve como referencia reproducible para nuevos experimentos en manipulación.

## Benchmarks y rendimiento

Evaluación en RoboTwin 2.0 y RoboTwin-Plus, 100 episodios por tarea (5.000 episodios por condición). La puntuación de RoboTwin-Plus es la media no ponderada de las cuatro corrupciones aplicadas por separado sobre RGB de escena limpia.

| Condición | FastWAM | HOG-WAM |
|---|---:|---:|
| Clean | 92,08% | 91,88% |
| Randomized | 91,30% | 91,36% |
| Mixed noise | 78,86% | 82,86% |
| Warm filter | 89,16% | 89,96% |
| Underexposure | 90,90% | 91,48% |
| Reduced contrast | 89,14% | 90,00% |
| RoboTwin-Plus mean | 87,02% | 88,58% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los pesos BF16 del repositorio ocupan 9,4 GB, a lo que hay que sumar el VAE de Wan2.2 congelado y el encoder de propriocepción; se recomienda planificar al menos 24 GB de VRAM para BF16 con margen para activaciones y el simulador.
- GPU recomendadas: no especificadas por el autor. Por tamaño, A100 40/80 GB, H100 y L40S son opciones razonables para BF16; el entrenamiento se realizó con apoyo de Cloud TPUs (TRC).
- GPU de consumo: no confirmado. Una RTX 4090 (24 GB) podría alojar los pesos BF16, pero no hay cifras publicadas de que el pipeline completo (VAE más política más simulador) quepa con holgura.
- Despliegue: el stack oficial es JAX/Flax con Orbax y `uv` (`uv sync --locked --extra cuda`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.
- Assets adicionales necesarios: VAE de Wan2.2 en Orbax (`ipplab/Wan2.2-TI2V-5B-Orbax`, revisión fijada) y `dataset_stats.json` del dataset RoboTwin 2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RoboTwin-Plus mean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HOG-WAM-RoboTwin-Uncond | no disponible (base 5B) | no disponible | 88,58% | Wan2.2 | Pesos Orbax BF16 en HF |
| FastWAM (referencia del autor) | no disponible | no disponible | 87,02% | no disponible | Repositorio FastWAM-JAX |
| Otras políticas VLA para RoboTwin 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos publicados en la información disponible es frente a FastWAM, del mismo laboratorio y misma receta base. No se dispone de cifras de otros modelos comparables en RoboTwin 2.0 dentro de la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en simulación (RoboTwin 2.0); no hay evidencia publicada de despliegue en robot real.
- En escena limpia rinde ligeramente por debajo de FastWAM (91,88% frente a 92,08%), por lo que la mejora es específica de condiciones corruptas.
- La ganancia en escena aleatorizada es marginal (91,36% frente a 91,30%), dentro de lo que podría ser ruido de evaluación.
- Solo se distribuyen pesos BF16 en Orbax; no hay GGUF, safetensors ni cuantizaciones de menor precisión publicadas.
- Requiere assets externos (VAE de Wan2.2 y estadísticas de normalización) y una revisión fijada del repositorio de VAE; un desajuste de versión puede invalidar los resultados.
- La licencia es la de Wan2.2 (license: other), con posibles restricciones de uso comercial que deben revisarse en `LICENSE-Wan2.2` antes de cualquier despliegue productivo.
- No se documentan idiomas soportados para las instrucciones de lenguaje; el rendimiento fuera del inglés no está verificado.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser una política de acción, el fallo se manifiesta como ejecuciones incorrectas más que como texto erróneo.
- El checkpoint corresponde al paso 29.365 de un entrenamiento concreto; no se publican curvas de convergencia ni intervalos de confianza de los resultados.
- El pipeline depende de JAX/Flax y de un simulador específico, lo que limita la portabilidad frente a stacks PyTorch habituales en robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipplab/HOG-WAM-RoboTwin-Uncond
- Repositorio HOG-WAM: https://github.com/iPPLab/HOG-WAM
- Receta de entrenamiento RoboTwin HOG: https://github.com/iPPLab/HOG-WAM/blob/main/configs/training/robotwin-hog.example.yaml
- Guía de evaluación RoboTwin 2.0 y RoboTwin-Plus: https://github.com/iPPLab/HOG-WAM#robotwin-20-and-robotwin-plus
- Citación: https://github.com/iPPLab/HOG-WAM#citation
- Repositorio FastWAM-JAX: https://github.com/iPPLab/FastWAM-JAX
- Paper Fast-WAM: https://arxiv.org/abs/2603.16666
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- VAE Wan2.2 en Orbax: https://huggingface.co/ipplab/Wan2.2-TI2V-5B-Orbax
- Dataset Fast-WAM RoboTwin 2.0: https://huggingface.co/datasets/yuanty/robotwin2.0-fastwam
- Licencia Wan2.2: https://huggingface.co/ipplab/FastWAM-JAX-RoboTwin-Uncond/blob/f749afdce5bf14dc8a0d2c9c107ef0c20db3ca8e/LICENSE-Wan2.2
