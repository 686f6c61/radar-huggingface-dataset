# 2bidoubi/SPARK

## Resumen

SPARK (Sim-ready Part-level Articulated Reconstruction with VLM Knowledge) es un framework de reconstruccion 3D a partir de una unica imagen RGB, desarrollado por Yumeng He, Ying Jiang, Jiayin Lu, Yin Yang y Chenfanfu Jiang, presentado como oral en CVPR 2026. El modelo resuelve un problema concreto: generar objetos 3D articulados (con partes moviles y juntas) listos para simulacion, en lugar de mallas estaticas. Para ello combina el conocimiento de un modelo vision-lenguaje (VLM) con generacion de geometria y refinamiento mediante renderizado diferenciable.

El repositorio de Hugging Face no contiene un modelo de lenguaje ni un generador de imagenes, sino el bundle de checkpoints que consume la implementacion oficial de SPARK. Incluye tres componentes: PartCrafter (generacion de partes 3D), TripoSG (pesos del modelo base usado en entrenamiento) y RMBG-1.4 (eliminacion opcional de fondo). El tamano total del bundle es de aproximadamente 15,6 GB y la salida es un conjunto de mallas 3D por partes mas un URDF que describe la jerarquia y las juntas.

La relevancia actual radica en su orientacion a robotica y simulacion: la salida URDF permite cargar directamente el objeto en simuladores fisicos, lo que reduce el trabajo manual de modelado de objetos articulados (puertas, cajones, herramientas, electrodomesticos) para entornos de entrenamiento de agentes roboticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa: VLM de guia + generacion de geometria por partes (PartCrafter) + refinamiento por renderizado diferenciable; modelo base TripoSG |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Codigo SPARK: MIT; checkpoints de terceros con sus propias licencias (RMBG-1.4: solo uso no comercial sin acuerdo aparte). Licencia del bundle: no disponible |
| Formato de pesos | safetensors y ONNX (diffusers) |

## Arquitectura y entrenamiento

SPARK se estructura en tres etapas descritas en el paper. Primero, un VLM estima la jerarquia de partes y el movimiento del objeto, apoyandose en generacion de imagenes para producir vistas de referencia. Segundo, una generacion de geometria conjunta combina guias de imagen a nivel de parte y a nivel global para reconstruir todas las partes de forma coherente. Tercero, un refinamiento conjunto emplea renderizado diferenciable para ajustar la reconstruccion articulada contra una referencia en estado abierto. El checkpoint de generacion de partes es PartCrafter, sobre pesos base de TripoSG.

El bundle publicado no incluye detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO); la model card remite explicitamente al paper para esos datos. La innovacion destacable es la integracion del conocimiento de un VLM para inferir articulaciones y jerarquia de partes sin supervisar directamente la estructura cinematica, y la produccion de un URDF utilizable en simulacion. En la version publica actual, el refinamiento conjunto no se ejecuta automaticamente desde `run.py`, sino mediante scripts de optimizacion separados en `URDFoptimizer`.

## Capacidades

- Reconstruccion 3D articulada a partir de una unica imagen RGB de entrada.
- Generacion de mallas 3D por partes con texturas (etapa de texturizado).
- Produccion de un URDF grueso que describe la jerarquia de partes y las juntas.
- Inferencia de jerarquia de partes y movimiento guiada por un VLM.
- Generacion de vistas de referencia mediante modelos de generacion de imagen (servicios externos al bundle).
- Eliminacion opcional de fondo de la imagen de entrada mediante RMBG-1.4.
- Salida orientada a simulacion fisica (sim-ready) para robotica.
- No es un modelo de texto, codigo ni razonamiento general; no soporta tool calling ni agentes conversacionales.

## Casos de uso

- Creacion de assets para simulacion robotica: a partir de una foto de una puerta, cajon o nevera, SPARK genera mallas por partes y un URDF que puede cargarse en simuladores como Isaac Sim o MuJoCo para entrenar politicas de manipulacion articulada.
- Generacion de datasets sinteticos de objetos articulados: el pipeline permite poblar entornos de entrenamiento con objetos diversos a partir de imagenes reales, reduciendo el cuello de botella del modelado manual.
- Benchmarking de percepcion 3D: investigadores pueden usar la reconstruccion articulada como referencia para evaluar metodos de estimacion de juntas y segmentacion de partes.
- Prototipado en diseno de producto: reconstruir un objeto con partes moviles a partir de una foto para validar cinematicas basicas antes de un modelado CAD completo.
- Digitalizacion para e-commerce y catalogos 3D: generar mallas texturizadas por partes de objetos fisicos para visualizacion interactiva, dado que el pipeline produce texturas.
- Investigacion en vision-lenguaje-accion: usar el URDF generado como puente entre percepcion visual y control motor en pipelines de robotica que requieren modelos fisicos del entorno.
- Entrenamiento de agentes en entornos domesticos: reconstruir electrodomesticos y mobiliario articulado para escenarios de simulacion con interaccion fisica realista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2512.01629) para las evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el bundle completo ocupa 15,6 GB en disco, lo que da una cota inferior orientativa del espacio de pesos en memoria.
- GPU: se requiere una GPU NVIDIA con soporte CUDA; el entorno documentado es Python 3.10, PyTorch 2.5.1 y CUDA 12.4.
- No se especifica si cabe en GPU de consumo (RTX 4090 u otras); no disponible.
- Opciones de despliegue: scripts de inferencia del repositorio oficial (GitHub YumengHe/SPARK); los servicios externos de guia por imagen y texturizado son independientes del bundle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Articulado | Licencia |
|---|---|---|---|---|---|
| SPARK | Reconstruccion 3D por partes con VLM | 1 imagen RGB | Mallas + URDF | Si | Codigo MIT; checkpoints de terceros con sus terminos |
| PartCrafter | Generacion de partes 3D | Imagen/texto | Mallas por partes | No (partes estaticas) | Segun su model card |
| TripoSG | Generacion 3D | Imagen | Malla estatica | No | Segun su model card |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene checkpoints, no un modelo autonomo: requiere clonar el codigo de SPARK y ejecutar scripts de inferencia.
- El refinamiento conjunto no se ejecuta automaticamente en la version publica; hay que lanzar los scripts de `URDFoptimizer` por separado.
- Depende de servicios externos de generacion de imagen y texturizado que no forman parte del bundle, lo que afecta a la reproducibilidad y al coste.
- La licencia del bundle no esta disponible; el codigo es MIT, pero los checkpoints de terceros conservan sus terminos. RMBG-1.4 es solo para uso no comercial sin acuerdo comercial aparte, lo que limita el uso comercial del pipeline completo.
- Riesgo de reconstrucciones incorrectas en objetos con articulaciones complejas o no visibles en la imagen de entrada; no se documentan tasas de fallo.
- Solo se declara soporte de ingles en los metadatos.
- No se documentan sesgos; al depender de un VLM y de generacion de imagenes, puede heredar sesgos de esos componentes.
- No apta para generacion de texto, codigo ni tareas conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/2bidoubi/SPARK
- Paper (arXiv): https://arxiv.org/abs/2512.01629
- Codigo: https://github.com/YumengHe/SPARK
- Web del proyecto: https://heyumeng.com/SPARK-web/
- Video del proyecto: https://heyumeng.com/SPARK-web/static/images/SPARK_video.mp4
- Scripts de optimizacion URDF: https://github.com/YumengHe/SPARK/tree/main/URDFoptimizer
- Licencia del codigo: https://github.com/YumengHe/SPARK/blob/main/LICENSE
- Componente PartCrafter: https://huggingface.co/2bidoubi/SPARK/blob/main/PartCrafter/README.md
- Componente TripoSG: https://huggingface.co/2bidoubi/SPARK/blob/main/TripoSG/README.md
- Componente RMBG-1.4: https://huggingface.co/briaai/RMBG-1.4
