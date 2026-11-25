# alpha-studio/alphamocap-exmr-models

## Resumen

AlphaMocap ExMR models es un repositorio de espejo (mirror) que aloja los pesos de SAM 3D Body de Meta, concretamente la variante con backbone DINOv3, junto con su fichero de configuración y el modelo MHR (Momentum Human Rig). No se trata de un modelo de lenguaje ni de un modelo entrenado por el autor del repositorio (alpha-studio): los ficheros son copia byte a byte de los publicados por Meta en `facebook/sam-3d-body-dinov3`. Su función es servir como origen de descarga para el add-on AlphaMocap ExMR de Blender, evitando que cada usuario tenga que solicitar acceso al repositorio restringido (gated) de Meta.

El modelo subyacente, SAM 3D Body, es un sistema de estimación de pose y captura de movimiento humana en 3D a partir de imágenes, construido sobre un backbone DINOv3 (Vision Transformer auto-supervisado). El repositorio ocupa 2,8 GB e incluye tres artefactos: `model.ckpt` (pesos del modelo), `model_config.yaml` (configuración) y `assets/mhr_model.pt` (el rig humano MHR tal como lo distribuye SAM 3D Body). No incorpora los modelos paramétricos SMPL-X ni MANO, cuyas licencias prohíben su redistribución.

La relevancia de este repositorio es práctica más que técnica: facilita la instalación reproducible del pipeline de mocap en Blender mediante hashes SHA-256 verificables, y aclara la cadena de licencias (SAM License para los pesos, Apache-2.0 para MHR). No aporta mejoras, fine-tuning ni variantes propias respecto al original de Meta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3D Body con backbone DINOv3 (Vision Transformer); no disponible el detalle de capas y dimensión |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en checkpoint `.ckpt` sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | SAM License (`license: other`, `license_name: sam-license`) |
| Formato de pesos | `.ckpt` (model.ckpt), `.yaml` (model_config.yaml), `.pt` (assets/mhr_model.pt) |

## Arquitectura y entrenamiento

El modelo es SAM 3D Body, un estimador de cuerpo humano en 3D que emplea DINOv3 como extractor de características visuales. DINOv3 es un Vision Transformer entrenado de forma auto-supervisada por Meta, y en esta variante actúa como backbone sobre el que SAM 3D Body realiza la predicción de pose y forma corporal. El repositorio incluye además MHR (Momentum Human Rig), el rig humano de Meta que SAM 3D Body utiliza como representación del cuerpo; MHR se distribuye con licencia Apache-2.0 en su repositorio propio, aunque aquí se incluye tal como lo empaqueta SAM 3D Body.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o ajuste fino supervisado, ya que la model card del repositorio espejo no los documenta. Tampoco se detallan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.). Los ficheros son idénticos a los de Meta, por lo que cualquier detalle técnico adicional debe consultarse en la documentación original de `facebook/sam-3d-body-dinov3`.

## Capacidades

- Estimación de pose y forma corporal humana en 3D a partir de imágenes, mediante SAM 3D Body.
- Extracción de características visuales con backbone DINOv3.
- Representación del cuerpo mediante el rig MHR (Momentum Human Rig) de Meta.
- Integración con el add-on AlphaMocap ExMR para Blender como fuente de pesos durante la instalación.
- Verificación de integridad de los ficheros mediante hashes SHA-256 publicados.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling ni capacidades de agente.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Captura de movimiento en Blender: el add-on AlphaMocap ExMR descarga estos pesos durante su configuración y los usa para estimar la pose 3D de un actor a partir de vídeo o imágenes, generando animación sobre el rig MHR.
- Instalación reproducible sin acceso gated: equipos que no pueden o no quieren solicitar acceso al repositorio de Meta descargan los ficheros desde este espejo y verifican su integridad con los SHA-256 publicados.
- Pipelines de investigación en visión por computador: uso de SAM 3D Body con DINOv3 como base para experimentos de estimación de pose y forma corporal, citando el trabajo original de Meta.
- Automatización de animación para previsualización: generación de animaciones preliminares de personajes a partir de metraje real antes de pasar a captura profesional.
- Docencia y prototipado: montaje de entornos de práctica de mocap sin depender de solicitudes de acceso a repositorios restringidos.
- Integración en herramientas DCC: al estar empaquetado para el add-on de Blender, sirve como componente de un flujo de trabajo de animación dentro de la propia aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 2,8 GB, lo que da una cota inferior del espacio en disco necesario para los pesos y el rig.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el modelo se ejecuta dentro del pipeline del add-on de Blender, cuyos requisitos no se detallan en la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: integración mediante el add-on AlphaMocap ExMR para Blender; no se documentan servidores de inferencia (vLLM, TGI, llama.cpp, Ollama) por tratarse de un modelo de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|
| AlphaMocap ExMR models (este repo) | Espejo de SAM 3D Body + MHR | DINOv3 | SAM License | Hugging Face, sin gated |
| facebook/sam-3d-body-dinov3 | Original de Meta | DINOv3 | SAM License | Hugging Face, gated |
| MHR (facebookresearch/MHR) | Rig humano | no aplica | Apache-2.0 | GitHub |
| SMPL-X / MANO | Modelos paramétricos de cuerpo/mano | no aplica | Licencia propia, sin redistribución | Registro en smpl-x.is.tue.mpg.de y mano.is.tue.mpg.de |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo propio de alpha-studio: es una redistribución byte a byte de pesos de Meta; cualquier error o limitación del original se hereda.
- La SAM License incluye términos de control de comercio (trade-control) que deben aceptarse para su uso.
- Si se publica investigación con estos pesos, la licencia exige reconocer SAM 3D Body (sección 1.b.ii).
- SMPL-X y MANO no están incluidos y no pueden redistribuirse; cada usuario debe registrarse y descargarlos por separado, lo que puede bloquear el pipeline si no se completan esos pasos.
- El repositorio no documenta sesgos, tasas de alucinación ni limitaciones de contexto o idioma; al ser un modelo de visión, los riesgos relevantes serían de precisión en la estimación de pose, no documentados aquí.
- No se especifican requisitos de hardware ni rendimiento, por lo que la planificación de producción requiere consultar la documentación original de Meta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alpha-studio/alphamocap-exmr-models
- Modelo original de Meta: https://huggingface.co/facebook/sam-3d-body-dinov3
- Repositorio MHR: https://github.com/facebookresearch/MHR
- SMPL-X: https://smpl-x.is.tue.mpg.de
- MANO: https://mano.is.tue.mpg.de
