# CaiYuanhao/HDR-GS

## Resumen

HDR-GS (High Dynamic Range Gaussian Splatting) es un método de reconstrucción y síntesis de vistas novedosas en alto rango dinámico (HDR) presentado en NeurIPS 2024 por Yuanhao Cai. No es un modelo de lenguaje, sino un pipeline de reconstrucción 3D basado en Gaussian Splatting que representa escenas como nubes de gaussianas 3D y permite renderizar vistas nuevas tanto en HDR como en LDR con control explícito de exposición. Resuelve el problema de la síntesis de vistas HDR eficiente: los enfoques previos basados en NeRF requieren horas de entrenamiento y renderizado lento, mientras que HDR-GS alcanza velocidades de renderizado hasta 1000 veces superiores.

El repositorio de Hugging Face (3,2 GB) contiene los pesos entrenados y artefactos del proyecto (nubes de puntos gaussianas en formato PLY con sus tone mappers asociados), distribuidos bajo licencia Apache 2.0. El proyecto incluye una demo Gradio con 12 escenas que permite comparar vídeos LDR y HDR emparejados, inspeccionar las nubes gaussianas interactivas y variar movimiento de cámara y exposición.

Es relevante para investigadores y desarrolladores de visión por computador, gráficos y captura volumétrica que necesiten reconstrucción 3D con rango dinámico completo, control de exposición en post-producción y renderizado en tiempo real, sin depender de costosos pipelines NeRF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaussian Splatting 3D para síntesis de vistas HDR (representación explícita por gaussianas) |
| Parametros totales | no disponible (no es un modelo neuronal con parámetros en el sentido habitual; el tamaño del repo es de 3,2 GB) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | nubes gaussianas en PLY con tone mappers asociados; artefactos PyTorch (librería pytorch) |

## Arquitectura y entrenamiento

HDR-GS emplea una representación basada en Gaussian Splatting 3D: cada escena se modela como un conjunto de gaussianas 3D con atributos de posición, covarianza, opacidad y color. La innovación central es la separación de la iluminación en componentes HDR y la aplicación de un tone mapper aprendido o configurable que permite generar vistas LDR con exposición controlada a partir de la representación HDR subyacente. Esto habilita renderizado en tiempo real (hasta 1000x más rápido que alternativas NeRF según el paper) y control de exposición en el momento de la síntesis.

El método se entrena por escena a partir de capturas multi-exposición y se distribuye con los pesos resultantes por escena. El repositorio incluye un dataset propio (`CaiYuanhao/HDR-GS`) y artefactos compatibles con el código oficial del proyecto. No se detallan en la información disponible el número de tokens, composición del dataset ni si se empleó RLHF/DPO (no aplica a este tipo de modelo). La información sobre detalles de entrenamiento (número de iteraciones, función de pérdida exacta, composición de las capturas) no está disponible en la documentación proporcionada.

## Capacidades

- Síntesis de vistas novedosas en HDR a partir de escenas reconstruidas con Gaussian Splatting.
- Renderizado de vistas LDR con control explícito de exposición.
- Representación 3D explícita e interactiva mediante nubes de puntos gaussianas (formato PLY).
- Comparación emparejada LDR/HDR en la demo (12 escenas: bathroom, chair, dog, bear, desk, sponza, entre otras).
- Renderizado de alta velocidad (hasta 1000x frente a enfoques NeRF, según el paper).
- Carga de PLY compatibles con su tone mapper correspondiente para renderizar vistas nuevas en la demo.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión 2D general, audio ni otras capacidades de los LLM.

## Casos de uso

- Post-producción de vídeo y VFX: renderizar tomas nuevas de una escena capturada y ajustar la exposición en la síntesis para integrar el plano en una secuencia con iluminación distinta, aprovechando el control de exposición nativo.
- Visualización arquitectónica e inmobiliaria: reconstruir interiores (por ejemplo, la escena "bathroom") y generar recorridos virtuales con rango dinámico completo para mostrar ventanas y zonas de sombra sin recortes.
- Captura volumétrica para e-commerce: reconstruir objetos (por ejemplo, "chair", "desk") y renderizar vistas HDR para fichas de producto con iluminación realista y control de exposición.
- Investigación en visión por computador: banco de pruebas para comparar Gaussian Splatting frente a NeRF en tareas HDR, usando las 12 escenas y los PLY publicados como referencia reproducible.
- Renderizado en tiempo real para aplicaciones interactivas: integrar las nubes gaussianas en visores 3D y explorar la escena con latencia baja gracias a la velocidad de renderizado del método.
- Educación y demos técnicas: usar la demo Gradio para ilustrar la diferencia entre LDR y HDR y el efecto del control de exposición en la síntesis de vistas, sin necesidad de infraestructura propia.
- Prototipado de pipelines de captura multi-exposición: emplear el dataset y los pesos por escena como base para validar nuevas técnicas de tone mapping o de reconstrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repo (3,2 GB) incluye pesos y artefactos, pero el consumo en inferencia depende del número de gaussianas por escena y de la resolución de renderizado.
- GPU recomendadas: no disponibles en la información proporcionada; el proyecto está etiquetado como PyTorch y el renderizado de Gaussian Splatting suele requerir GPU con soporte CUDA.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el renderizado de Gaussian Splatting es habitualmente viable en GPU de consumo, pero no hay datos publicados para este modelo concreto.
- Opciones de despliegue: código oficial en GitHub y demo Gradio en Hugging Face Spaces; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: el paper afirma hasta 1000x de aceleración frente a enfoques NeRF, pero no se proporcionan cifras absolutas de latencia o FPS en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Representación | Control de exposición | Velocidad de renderizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HDR-GS | Gaussian Splatting HDR | Gaussianas 3D explícitas (PLY) | Sí | Hasta 1000x frente a NeRF (según paper) | Apache 2.0 | Pesos y demo en Hugging Face |
| Enfoques NeRF HDR (por ejemplo, HDR-NeRF) | NeRF implícito | Campo neuronal implícito | Limitado o vía post-proceso | Lento (horas de entrenamiento/renderizado) | no disponible | no disponible |
| Gaussian Splatting estándar (3DGS) | Gaussian Splatting LDR | Gaussianas 3D explícitas | No nativo | Rápido (tiempo real) | no disponible | no disponible |

No se dispone de datos cuantitativos de benchmarks para establecer una comparación numérica con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni mantiene conversaciones; cualquier uso en esos escenarios es inadecuado.
- Los pesos están entrenados por escena; no generalizan a escenas nuevas sin reentrenamiento o captura adicional.
- Requiere capturas multi-exposición para el entrenamiento por escena; la calidad depende de la cobertura y del rango de exposiciones del dataset.
- Riesgo de artefactos de reconstrucción en zonas con oclusión, superficies especulares o dinámicas no modeladas.
- No se documentan sesgos específicos; al ser un modelo de reconstrucción 3D, los sesgos relevantes serían los del dataset de captura (escenas y objetos concretos).
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de las escenas y assets incluidos en el dataset.
- El repositorio es grande (3,2 GB) y el despliegue requiere entorno PyTorch con CUDA; no se documentan requisitos mínimos de VRAM.
- No hay información sobre latencia absoluta, FPS ni límites de resolución en la documentación disponible.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/CaiYuanhao/HDR-GS
- Dataset: https://huggingface.co/datasets/CaiYuanhao/HDR-GS
- Demo Gradio: https://huggingface.co/spaces/CaiYuanhao/HDR-GS
- Paper (arXiv): https://arxiv.org/abs/2405.15125
- Repositorio GitHub: https://github.com/caiyuanhao1998/HDR-GS
- Página del proyecto: https://caiyuanhao1998.github.io/project/HDR-GS/
- Vídeo: https://www.youtube.com/watch?v=wtU7Kcwe7ck
- Artículo en Zhihu: https://zhuanlan.zhihu.com/p/10016024329
- Publicación en X (AK): https://x.com/_akhaliq/status/1794921228462923925
