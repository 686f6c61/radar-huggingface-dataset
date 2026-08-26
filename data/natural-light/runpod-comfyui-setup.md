# natural-light/runpod-comfyui-setup

## Resumen

Este repositorio no es un modelo de IA, sino un conjunto de scripts y flujos de trabajo diseñados para reconstruir rápidamente un entorno ComfyUI en RunPod, una plataforma de GPU en la nube. El autor, natural-light, lo publica bajo licencia BSD-2-Clause. Su propósito es reducir el tiempo de configuración de un entorno de generación de imágenes a unos 10-15 minutos, automatizando la descarga de modelos desde Hugging Face y Civitai, la instalación de nodos personalizados desde GitHub y la configuración de workflows.

Aunque no contiene pesos ni arquitectura de red neuronal, es una herramienta relevante para desarrolladores e investigadores que necesitan desplegar entornos ComfyUI reproducibles en la nube, especialmente en RunPod. El repositorio incluye un script principal `setup.sh` que orquesta todas las tareas, junto con archivos de configuración para listar modelos, LoRAs, workflows y nodos personalizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de scripts bash) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Documentacion en japones; scripts en ingles |
| Licencia | BSD-2-Clause |
| Formato de pesos | No aplica (no contiene pesos) |

## Arquitectura y entrenamiento

No aplica: este repositorio no contiene un modelo entrenado. Se trata de un conjunto de scripts de automatización para el despliegue de ComfyUI en RunPod. La "arquitectura" del repositorio es una estructura de directorios con scripts (`setup.sh`, `download_hf.sh`, `install_nodes.sh`, `download_civitai.sh`) y archivos de texto que listan recursos (`hf_models.txt`, `workflow_files.txt`, `custom_nodes.txt`, `civitai_models.txt`). No hay datos de entrenamiento, ni proceso de RLHF o DPO.

## Capacidades

- Automatiza la descarga de modelos desde Hugging Face, incluyendo repositorios privados mediante token de acceso.
- Descarga workflows de ComfyUI desde Hugging Face.
- Instala custom nodes clonando repositorios de GitHub (por defecto `rgthree-comfy`).
- Descarga modelos desde Civitai, con soporte para reanudar descargas interrumpidas.
- Ejecución completa mediante `./setup.sh` que procesa en orden: modelos HF, workflows HF, custom nodes, y modelos Civitai.
- Permite configurar tokens de acceso a través de `config.env` (copiando `config.env.default`).

## Casos de uso

- Despliegue rápido de un entorno ComfyUI en RunPod para un equipo de diseño: se copian los scripts al workspace, se configuran tokens y se ejecuta `setup.sh` para tener todos los modelos y nodos listos en minutos.
- Reproducibilidad de entornos de generación de imágenes: al mantener listas de modelos, workflows y nodos en archivos de texto, se puede reconstruir el mismo entorno en cualquier pod de RunPod.
- Automatización de instalación de custom nodes: en lugar de instalar manualmente cada nodo, se listan los repositorios en `custom_nodes.txt` y el script los clona automáticamente.
- Gestión de modelos privados: con `HF_TOKEN` se pueden descargar LoRA y modelos desde repositorios privados de Hugging Face.
- Descarga de modelos grandes desde Civitai con reanudación: si la conexión se interrumpe, volver a ejecutar `download_civitai.sh` continúa la descarga desde el punto de corte.
- Creación de paquetes de configuración portables: generar un `scripts.tar.gz` con `config.env` personalizado y descomprimirlo en el workspace para una configuración instantánea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo que pueda ser evaluado con métricas estándar de IA.

## Requisitos de hardware

- No aplica: el repositorio no tiene requisitos de hardware propios, ya que está pensado para ejecutarse en un pod de RunPod con un template de ComfyUI preinstalado.
- El script se ejecuta en un entorno Linux (RunPod usa contenedores basados en Linux).
- Para ejecutar ComfyUI con modelos de difusión se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3080 o superior), pero esto depende de los modelos concretos que se descarguen.
- El despliegue se realiza típicamente en un pod RunPod con una GPU como RTX 4090 o A100, según las necesidades de generación de imágenes.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable, ya que este repositorio es una herramienta de configuración y no un modelo de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede usar directamente para generar imágenes ni texto; solo configura el entorno para ejecutar ComfyUI.
- Requiere credenciales válidas (HF_TOKEN, CIVITAI_TOKEN) para acceder a repositorios privados o descargas autenticadas.
- La documentación está en japonés, lo que puede ser una barrera para desarrolladores que no dominen ese idioma.
- El script asume que el entorno RunPod ya tiene ComfyUI instalado y en estado "Ready". No gestiona la instalación de ComfyUI en sí.
- No se garantiza que los enlaces a modelos o workflows en los archivos de texto estén actualizados; el usuario debe mantenerlos.
- La licencia BSD-2-Clause permite uso comercial, pero los modelos descargados pueden tener sus propias licencias que deben respetarse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/natural-light/runpod-comfyui-setup
- Documentación de RunPod para ComfyUI: https://docs.runpod.io/tutorials/pods/comfyui
- Guía de RunPod para ComfyUI en Serverless: https://docs.runpod.io/tutorials/serverless/comfyui
- Tutorial externo sobre ComfyUI en RunPod: https://smartart.live/articles/259-how-to-run-comfyui-on-runpod-generate-ai-images-faster-than-ever-with-cloud-gpus.html
- Tutorial para principiantes en promptingpixels: https://www.promptingpixels.com/tutorial/comfyui-on-runpod
- Vídeo de RunPod Tutorial 2026: https://www.youtube.com/watch?v=5NTZLYcLdPQ
