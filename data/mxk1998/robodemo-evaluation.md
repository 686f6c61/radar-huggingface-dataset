# mxk1998/RoboDemo-Evaluation

## Resumen

RoboDemo-Evaluation no es un modelo de lenguaje en sentido estricto, sino un repositorio de Hugging Face que aloja la receta de construccion Docker, el inventario de paquetes y los diagnosticos de entorno para evaluar la familia de politicas roboticas RoboDemo. El autor (mxk1998) lo publica como un entorno compartido para cinco checkpoints: Full50 240k, C15 90k, C30 160k, C45 260k y C15-wo 100k. El objetivo es reproducir de forma determinista la evaluacion en simulador de estas politicas, que combinan un backbone visual-lenguaje Qwen3-VL-4B-Instruct con un codificador V-JEPA2 y el simulador ManiSkill/SAPIEN.

El repositorio es relevante porque estandariza las dependencias exactas (PyTorch 2.6.0 con CUDA 12.4, Transformers 4.57.6, FlashAttention 2.7.4, SAPIEN 3.0.3, entre otras) y fija la revision del codigo del simulador, lo que permite comparar resultados entre maquinas. No contiene pesos de modelo ni una imagen preconstruida: es un artefacto de infraestructura para reproducir experimentos de robotica con politicas visomotoras.

La informacion disponible no detalla la arquitectura interna de las politicas mas alla de las dependencias (Qwen3-VL como procesador/configuracion local y V-JEPA2 como codificador visual). Se trata, por tanto, de una ficha sobre el entorno de evaluacion y el ecosistema RoboDemo, no sobre un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Entorno de evaluacion Docker para politicas roboticas RoboDemo (backbone VLM Qwen3-VL-4B-Instruct + codificador V-JEPA2 + simulador ManiSkill/SAPIEN) |
| Parametros totales | no disponible (el backbone declarado es Qwen3-VL-4B-Instruct; el total de la politica no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | checkpoints en `pytorch_model.pt` acompanados de `policy.yaml` y `normalization.json`; el repositorio de evaluacion no incluye pesos |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura de las politicas mas alla de los componentes que consume: un backbone Qwen3-VL-4B-Instruct (configuracion y processor locales), un codificador V-JEPA2 con checkpoint `vjepa2-ac-vitg.pt`, y el simulador ManiSkill sobre SAPIEN con renderizado PhysX CPU, control `pd_joint_pos`, camara `zed2i` a 224x224, modo `rt-fast` y denoising OptiX. La evaluacion se ejecuta en un contenedor Docker con CUDA 12.4 sobre driver NVIDIA 555.42.06.

No se proporcionan datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. La model card indica que la arquitectura, la inferencia y la evaluacion estan publicadas, mientras que los puntos de entrada de entrenamiento siguen planificados. El manuscrito asociado esta en revision anonima y las licencias de los componentes permanecen con sus proyectos respectivos.

## Capacidades

- Evaluacion reproducible de politicas roboticas visomotoras en simulador ManiSkill/SAPIEN.
- Ejecucion de checkpoints RoboDemo (Full50 240k, C15 90k, C30 160k, C45 260k, C15-wo 100k) con scripts especificos por modelo.
- Lanzadores para una y ocho GPUs por cada uno de los cinco modelos.
- Verificacion de entorno mediante `check_environment.py`, que genera un informe `environment.json`.
- Comprobacion de imports y paquetes registrada en `native-cpu-check.json`.
- Soporte de ejecucion en contenedor con NVIDIA Container Toolkit y Compose.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni vision de proposito general en la informacion disponible.

## Casos de uso

- Reproduccion de resultados de investigacion: un equipo puede reconstruir el entorno exacto (PyTorch 2.6.0, CUDA 12.4, Transformers 4.57.6, SAPIEN 3.0.3) y ejecutar los mismos 500 pasos de simulador que el autor reporta para cada checkpoint, facilitando la comparacion entre articulos.
- Validacion de checkpoints antes de publicacion: el script `c15-single.sh` con `--max-episodes 1` permite un smoke test rapido de un checkpoint recien descargado antes de lanzar la evaluacion completa.
- Integracion en pipelines de CI para robotica: al fijar la revision del simulador (`d6d16ec511bc389e0a207692730c137bc022ef14`) y conservar `evaluation-packages.txt`, el repositorio sirve como base para tests de regresion de politicas en cada commit.
- Despliegue en clusters con multiples GPUs: los lanzadores de ocho GPUs permiten escalar la evaluacion de los cinco checkpoints en paralelo, reservando una GPU por contenedor mediante Compose.
- Auditoria de entorno en maquinas nuevas: `check_environment.py --assets` verifica la presencia de datasets, simulador y checkpoints, y detecta discrepancias de driver o de librerias Vulkan/OptiX antes de gastar horas de GPU.
- Formacion de nuevos investigadores: el repositorio documenta el stack completo (versiones, assets de Imitator Game, estructura de directorios) y reduce la curva de entrada a la evaluacion de politicas visomotoras.
- Comparativa de variantes de politica: al compartir un unico entorno para las cinco variantes (Full50, C15, C30, C45, C15-wo), se elimina la variabilidad de infraestructura al comparar sus curvas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el entorno nativo ha completado una ejecucion de 500 pasos de simulador para cada checkpoint publicado, pero no se aportan metricas de exito, recompensa ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma medida. La model card indica que 32 GB es una configuracion de entrada sugerida, no un minimo medido.
- GPU recomendadas: tarjetas de 32 GB para empezar con un worker; tarjetas de 80 GB para probar dos workers. No se nombran modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Consumer GPU: no se confirma compatibilidad con GPU de consumo; el requisito de Vulkan y OptiX (`libnvoptix.so.1`) y el driver 555.42.06 apuntan a un entorno profesional.
- Opciones de despliegue: Docker con NVIDIA Container Toolkit y Docker Compose; scripts de evaluacion `c15-single.sh` y equivalentes para el resto de checkpoints.
- Latencia y throughput: no disponibles.
- Nota: no se debe instalar un driver de kernel dentro del contenedor; el host debe exponer las librerias Vulkan y OptiX correspondientes.

## Comparativa con modelos similares

| Modelo / entorno | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboDemo-Evaluation | Entorno de evaluacion para politicas roboticas | no disponible (backbone Qwen3-VL-4B) | no disponible | MIT | Hugging Face, sin imagen preconstruida |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre entornos o modelos directamente comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni una imagen Docker preconstruida; solo la receta de construccion, el inventario de paquetes y los diagnosticos.
- La ejecucion Docker con GPU fresca aun no ha sido validada segun la model card.
- Los puntos de entrada de entrenamiento estan planificados pero no publicados.
- El manuscrito asociado esta en revision anonimizada, por lo que no hay referencia bibliografica definitiva.
- Requiere assets externos de Imitator Game (IG-10K-Dataset, maniskill, Qwen3-VL-4B-Instruct, vjepa2) que no se distribuyen en este repositorio.
- Dependencia estricta de driver NVIDIA 555.42.06, CUDA 12.4, Vulkan y OptiX; desviaciones pueden romper la reproducibilidad.
- Idioma documentado: solo ingles.
- Las licencias de los componentes (Qwen3-VL, V-JEPA2, ManiSkill, SAPIEN) permanecen con sus proyectos respectivos y deben revisarse por separado para uso comercial, aunque el repositorio sea MIT.
- No se aportan datos de sesgo, alucinacion ni rendimiento fuera del simulador; no es un modelo de lenguaje de proposito general.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mxk1998/RoboDemo-Evaluation
- Codigo: https://github.com/robodemo-2027/RoboDemo
- Proyecto: https://robodemo-2027.github.io/
- Coleccion de modelos: https://huggingface.co/collections/mxk1998/robodemo-6afc7693656d0965ce5466bc
- Guia de dimensionado de GPU: https://github.com/robodemo-2027/RoboDemo/blob/main/docs/evaluation-scaling.md
- Guia de inicio rapido y assets: https://github.com/robodemo-2027/RoboDemo/blob/main/docs/quickstart.md
- Assets de Imitator Game: https://imitator-game.github.io/
