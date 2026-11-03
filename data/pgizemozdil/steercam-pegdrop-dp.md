# pgizemozdil/steercam-pegdrop-dp

## Resumen

SteerCamera es un conjunto congelado (*ensemble*) de cinco políticas de difusión (Diffusion Policy) entrenadas de forma independiente para la tarea robótica PegDrop, una tarea de inserción de una clavija de 12 x 8 mm en un orificio de 28 x 24 mm situado en una posición aleatoria. El modelo lo publica el usuario pgizemozdil como artefacto reproducible del artículo *Steer Your Camera* (en revisión), y su propósito no es el control robótico directo, sino servir como banco de pruebas congelado para un controlador de cámara externo guiado por incertidumbre.

Cada miembro del ensemble es una Diffusion Policy de LeRobot con codificador ResNet-18 entrenado desde cero, softmax espacial y una U-Net condicional 1-D de canales [512, 1024, 2048] con DDPM de 100 pasos (DDIM-10 en inferencia). La entrada es una única imagen RGB de 128 x 128 píxeles de una cámara orientable, sin propriocepción ni pose de cámara, y la salida es un *chunk* de 16 acciones de 7 dimensiones, de las que se ejecutan 8.

La relevancia del modelo es metodológica: las políticas permanecen congeladas y el controlador de cámara solo lee su distribución predictiva (la varianza total del *chunk* como señal de incertidumbre U) para decidir hacia dónde orientar la cámara. El repositorio ocupa 5,3 GB y se distribuye en formato safetensors dentro de la librería LeRobot, con licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: ResNet-18 (GroupNorm, softmax espacial, pesos desde cero) + U-Net condicional 1-D [512, 1024, 2048], DDPM 100 pasos, DDIM-10 en test |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: una imagen RGB 128 x 128 y dos pasos de observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (LeRobot `pretrained_model`: `config.json`, `model.safetensors`, pre/post-procesadores, `train_config.json`) |

## Arquitectura y entrenamiento

El modelo sigue la receta estándar de LeRobot `diffusion`: un codificador visual ResNet-18 con GroupNorm y softmax espacial que procesa una imagen RGB de 128 x 128 píxeles, y una U-Net condicional 1-D con canales [512, 1024, 2048] que genera un *chunk* de 16 x 7 acciones en el marco base del robot (traslación de la punta del dedo en cm, rotación en unidades de 0,05 rad y objetivo del dedo). El proceso de difusión usa DDPM con 100 pasos de entrenamiento y DDIM con 10 pasos en inferencia. La entrada son dos pasos de observación, sin propriocepción ni pose de cámara.

El entrenamiento consistió en 200.000 pasos con batch de 64, optimizador AdamW con tasa 0,0001 y recortes aleatorios de [116, 116] píxeles. Los datos provienen de 50 demostraciones de teleoperación de la tarea PegDrop de ManiFeel, reproducidas y re-renderizadas desde 32 trayectorias de cámara suaves y aleatorias sobre toda la ventana de vista (el régimen denominado *wide*). Se entrenaron cinco miembros con semillas 1000-1004 y se publica el *checkpoint* del paso 200.000 de cada uno. El fichero `calibration.json` contiene la normalización z por fases de los términos de incertidumbre, aunque el benchmark usa la U sin calibrar. La tarea se ejecuta en el port a MuJoCo Warp de ManiFeel, y la holgura del orificio se dimensionó según el error de colocación medido de la política.

## Capacidades

- Generación de *chunks* de acciones robóticas de 16 x 7 a partir de una imagen RGB de 128 x 128 píxeles, con 8 acciones ejecutadas.
- Estimación de incertidumbre mediante la varianza total del *chunk* (U), que el controlador de cámara usa para guiar la vista.
- Funcionamiento en *ensemble* de cinco políticas con semillas independientes, lo que permite consenso entre vistas.
- Percepción activa: el modelo está diseñado para operar con una cámara orientable en un espacio de vistas amplio.
- No soporta *tool calling*, ni agentes multi-paso, ni capacidades multilingües, ni visión general, ni audio; es un modelo específico de política visomotora.
- No incluye *thinking mode* ni razonamiento simbólico.

## Casos de uso

- Investigación en percepción activa: usar el ensemble como política congelada y evaluar controladores de cámara que solo lean la distribución predictiva, sin reentrenar la política.
- Reproducción de benchmarks de inserción de precisión: ejecutar las celdas del benchmark del artículo (cámara fija, oclusión, búsqueda física, consenso entre vistas) con 100 episodios por celda.
- Estudio de estimación de incertidumbre en políticas de difusión: comparar la U sin calibrar con la versión calibrada por fases de `calibration.json` en tareas de inserción.
- Desarrollo de métodos de *view steering*: emplear la varianza del *chunk* como señal para orientar la cámara hacia vistas que reduzcan la incertidumbre bajo un oclusor.
- Validación de portes de simulación: servir como referencia para verificar el port a MuJoCo Warp de la tarea PegDrop de ManiFeel frente al simulador original.
- Docencia y experimentación con LeRobot: cargar cada miembro con `DiffusionPolicy.from_pretrained` para estudiar el pipeline completo de Diffusion Policy en robótica de manipulación.
- Comparación de estrategias de ensemble: analizar el consenso entre vistas (58-68 % desde inicios limpios) frente a políticas individuales con cámara fija (46-54 %).

## Benchmarks y rendimiento

Los resultados publicados en la model card son tasas de éxito de la tarea PegDrop (100 episodios por celda):

| Configuracion | Tasa de exito |
|---|---|
| Camara fija, vista nominal | 46-54 % |
| Camara fija, receptaculo ocluido | 4 % |
| U-steering bajo el oclusor | 28-40 % |
| Busqueda fisica | 49 % |
| Consenso entre vistas (inicios limpios) | 58-68 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 5,3 GB e incluye cinco miembros más el calibrador, por lo que cada miembro individual es sustancialmente menor.
- GPU recomendadas: no disponible; al tratarse de un ResNet-18 más una U-Net 1-D, la inferencia es ligera y cabe previsiblemente en GPUs de consumo, aunque no se confirma en la información proporcionada.
- Cabe en GPU de consumo: probablemente sí, sin datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot[diffusion]>=0.6.1,<0.7`) y el código de SteerCamera (`steercam.policy.ensemble.PolicyEnsemble`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteerCamera PegDrop DP | no disponible | no aplica (imagen 128 x 128) | Inserción PegDrop con cámara orientable | no disponible | HuggingFace (LeRobot) |
| Diffusion Policy original (Chi et al.) | no disponible | no aplica | Manipulación visomotora genérica | no disponible | Código público |
| ACT (Action Chunking Transformer) | no disponible | no aplica | Manipulación visomotora | no disponible | LeRobot |
| ManiFeel PegDrop (referencia) | no disponible | no aplica | Inserción con percepción táctil | no disponible | Repositorio del artículo |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Las políticas esperan el renderizado del simulador (MuJoCo Warp, escena de laboratorio texturizada) y la semántica de acciones del simulador; no están pensadas para controlar un robot real.
- El modelo no incluye propriocepción ni pose de cámara como entrada, lo que limita su aplicación fuera del montaje previsto.
- La tasa de éxito cae al 4 % con el receptáculo ocluido en configuración de cámara fija, lo que evidencia una fuerte dependencia de la vista.
- La licencia no está especificada, por lo que no se puede confirmar el uso comercial.
- El modelo es un artefacto de investigación congelado; no se ha publicado información sobre sesgos, alucinación o robustez fuera de las condiciones del benchmark.
- La fecha de creación del repositorio (2026-11-03) es posterior a la fecha actual de referencia habitual, lo que conviene verificar antes de citarlo.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pgizemozdil/steercam-pegdrop-dp
- Código, tareas, datasets y benchmark de SteerCamera: https://github.com/gizemozd/steer-your-camera
- Artículo *Steer Your Camera* (en revisión): no disponible enlace directo
- LeRobot (librería): no disponible enlace en la información proporcionada
- ManiFeel (tarea PegDrop de referencia): no disponible enlace en la información proporcionada
