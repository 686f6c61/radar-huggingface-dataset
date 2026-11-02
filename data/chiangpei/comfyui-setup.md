# chiangpei/comfyui-setup

## Resumen

`chiangpei/comfyui-setup` no es un modelo de inteligencia artificial, sino un repositorio de respaldo de un entorno de ComfyUI. El autor, chiangpei, lo publica para poder restaurar su instalación de ComfyUI en instancias nuevas de AutoDL, una plataforma cloud de alquiler de GPU. El repositorio contiene flujos de trabajo, notebooks de JupyterLab, scripts de arranque, parches sobre nodos personalizados y una lista de 65 nodos con sus commits exactos, pero no incluye pesos de modelos generativos.

El propio autor lo indica de forma explícita en la model card: los pesos de los modelos no están en este repositorio y remite a otros repositorios (`chiangpei/comfyui-private`, `chiangpei/comfyui-public`) o a una lista CSV con un script de reconstrucción. El tamaño del repositorio, 17,3 GB, se explica en buena medida por el directorio `custom_nodes/`, que incluye alrededor de 16 GB de pesos asociados a `comfyui_controlnet_aux`.

Por tanto, no procede evaluarlo como modelo: no hay arquitectura de red neuronal publicada, ni parámetros, ni contexto, ni datos de entrenamiento. La ficha que sigue documenta el contenido real del repositorio y deja como "no disponible" cualquier dato propio de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un repositorio de configuración de ComfyUI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentación está en chino tradicional) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts, workflows, notebooks y nodos personalizados; los pesos quedan fuera) |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | chiangpei/comfyui-setup |
| Tags | onnx, region:us |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repo | 17,3 GB |
| Creado | 2026-10-17 |
| Actualizado | 2026-11-02 |
| Contenido principal | `workflows/`, `notebooks/`, `scripts/`, `patches/`, `settings/`, `custom_nodes/`, `custom_nodes_清單.txt`, `rebuild_custom_nodes.sh` |

## Arquitectura y entrenamiento

No aplica: no hay arquitectura de modelo ni proceso de entrenamiento. El repositorio es un artefacto de ingeniería de entorno. Su estructura incluye flujos de trabajo de ComfyUI (con subcarpetas `客製/` y `_歷史/`), notebooks de JupyterLab para lanzar utilidades como un expansor de prompts, SeedVC o ComfyUI Manager, scripts de arranque (`seedvc.sh`, `breeze_start.sh`, `llm/*.sh`, `etc_autodl.sh.bak`), parches con las versiones originales de ficheros modificados, ajustes de interfaz en `settings/comfy.settings.json` (etiquetas de ID de nodo y localización a chino tradicional) y una lista de 65 nodos personalizados con sus URL de git y commits completos, junto con `rebuild_custom_nodes.sh` para clonarlos en las mismas versiones.

El flujo de restauración descrito por el autor consiste en: ejecutar `rebuild_custom_nodes.sh` o recuperar `custom_nodes/`; sobrescribir ficheros con los parches (por ejemplo, `ComfyUI-ReActor/scripts/reactor_sfw.py` para desactivar la comprobación NSFW, `ComfyUI-MieNodes/services/llm.py` para subir el timeout de 30 a 600, `ComfyUI-H3-Motion-Context/web/h3_motion_context.js` para localización, `ComfyUI-xiaozhuguang/web` y el paquete propio `vrgdg_h3_audiodrive`); copiar `workflows/` a `ComfyUI/user/default/workflows/`; copiar `settings/comfy.settings.json` a `ComfyUI/user/default/`; y restaurar los modelos según `models_清單.csv` o los repositorios de HuggingFace indicados. El autor advierte de que `ComfyUI-MieNodes/user_system_prompts.json`, con plantillas de prompts y vocabulario adulto, no está en este repositorio sino en el privado `chiangpei/comfyui-private`.

## Capacidades

- No es un modelo generativo: no genera texto, código, imágenes ni audio por sí mismo.
- Reproducción de entornos: permite reconstruir una instalación de ComfyUI con versiones fijadas de 65 nodos personalizados.
- Gestión de dependencias: `custom_nodes_清單.txt` registra URL de git y commit exacto de cada nodo.
- Parcheo de nodos: incluye versiones modificadas de ficheros de ReActor, MieNodes, H3-Motion-Context, xiaozhuguang y un paquete propio (`vrgdg_h3_audiodrive`).
- Portabilidad a AutoDL: scripts y notebooks orientados a recrear el entorno en instancias nuevas.
- Localización: ajustes de interfaz en chino tradicional.
- No dispone de tool calling, razonamiento multi-paso ni capacidades multilingües propias, al no ser un modelo.

## Casos de uso

- Reconstrucción de un entorno de ComfyUI en una instancia nueva de AutoDL: seguir los pasos de la model card para clonar los nodos en los commits exactos y copiar workflows y ajustes, reduciendo el tiempo de puesta en marcha.
- Replicación de resultados de generación: al fijar commits de nodos y flujos de trabajo, se puede reproducir el mismo pipeline que el autor empleó en sus imágenes.
- Auditoría de dependencias: la lista de 65 nodos con URL y commit permite revisar qué componentes de terceros se ejecutan y en qué versión.
- Migración entre máquinas: los scripts de arranque y los notebooks de JupyterLab sirven para trasladar la configuración a otro host con GPU.
- Estudio de parches sobre nodos: los ficheros de `patches/` documentan modificaciones concretas (timeout de LLM, desactivación de comprobación NSFW, localización) que pueden servir de referencia para adaptar esos nodos.
- Base para plantillas propias: los flujos de trabajo y los ajustes de interfaz pueden reutilizarse como punto de partida en proyectos de generación de imagen y vídeo con ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no evalúa ningún modelo y no incluye métricas de rendimiento.

## Requisitos de hardware

- No aplica VRAM para inferencia de un modelo, porque no contiene pesos de modelo.
- El repositorio ocupa 17,3 GB, de los cuales unos 16 GB corresponden a pesos de `comfyui_controlnet_aux/ckpts` dentro de `custom_nodes/`; se necesita espacio en disco suficiente para clonarlo.
- Al estar pensado para AutoDL, el autor asume el uso de instancias cloud con GPU; no se especifica qué GPU.
- No se indican opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, que no aplican a este artefacto.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque `chiangpei/comfyui-setup` no es un modelo. Como referencia de categoría, podría compararse con otros repositorios de configuración de ComfyUI, pero no se dispone de información sobre alternativas concretas en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo: no debe citarse como modelo de IA ni evaluarse con benchmarks de modelos.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro.
- Contenido sensible: el autor menciona que su repositorio privado contiene plantillas de prompts con vocabulario adulto, y uno de los parches desactiva la comprobación NSFW de ReActor; conviene revisar el uso antes de desplegarlo en entornos productivos o corporativos.
- Dependencia de versiones fijas: los nodos se clonan en commits concretos, lo que puede quedar obsoleto o incompatible con versiones futuras de ComfyUI.
- Repositorio incompleto por diseño: los pesos de modelo no están incluidos y deben obtenerse de otros repositorios o de `models_清單.csv`.
- Idiomas: la documentación está en chino tradicional; no hay versión en castellano ni en inglés.
- Sin mantenimiento garantizado: 0 descargas y 0 likes en el momento de la consulta; es un repositorio personal.
- Riesgo de seguridad: ejecutar scripts y nodos de terceros (`rebuild_custom_nodes.sh`, parches) implica confiar en el autor y en los repositorios de origen.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/chiangpei/comfyui-setup
- Repositorio privado referenciado por el autor: https://huggingface.co/chiangpei/comfyui-private
- Repositorio público referenciado por el autor: https://huggingface.co/chiangpei/comfyui-public
- ComfyUI (proyecto base): https://github.com/comfyanonymous/ComfyUI
- AutoDL (plataforma mencionada): https://www.autodl.com
