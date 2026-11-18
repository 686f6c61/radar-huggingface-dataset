# Comfy-Org/Depth-Anything-3

## Resumen

Depth Anything 3 es una familia de modelos de estimacion de profundidad (depth estimation) desarrollada originalmente por ByteDance-Seed y redistribuida por Comfy-Org como ficheros unicos en formato safetensors para su uso dentro de ComfyUI. El repositorio no contiene un modelo nuevo, sino un reempaquetado de cuatro variantes oficiales: DA3-SMALL, DA3-BASE, DA3MONO-LARGE y DA3METRIC-LARGE, todas ellas derivadas de la arquitectura Depth Anything 3 publicada por ByteDance.

El modelo resuelve el problema de inferir mapas de profundidad densos a partir de imagenes y video, una tarea fundamental en pipelines de vision por computador, generacion 3D, composicion digital y efectos visuales. La relevancia actual del repositorio radica en que elimina la friccion de integracion: los pesos se entregan ya convertidos a safetensors y ubicados en la carpeta `models/geometry_estimation/` de ComfyUI, de modo que el usuario puede cargarlos directamente mediante los nodos y workflows oficiales sin necesidad de scripts de conversion.

El repositorio ocupa 6,7 GB, acumula mas de 75.000 descargas y 33 likes, y se distribuye bajo licencia Apache 2.0. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los idiomas soportados en la documentacion proporcionada, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimacion de profundidad basado en Depth Anything 3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero unico por variante) |

Variantes incluidas en el repositorio:

| Fichero | Modelo base |
|---|---|
| depth_anything_3_small.safetensors | depth-anything/DA3-SMALL |
| depth_anything_3_base.safetensors | depth-anything/DA3-BASE |
| depth_anything_3_mono_large.safetensors | depth-anything/DA3MONO-LARGE |
| depth_anything_3_metric_large.safetensors | depth-anything/DA3METRIC-LARGE |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna de Depth Anything 3 mas alla de su identidad como modelo de estimacion de profundidad. La model card del repositorio de Comfy-Org es exclusivamente un documento de reempaquetado: describe donde colocar los ficheros y que workflows utilizar, pero no incluye detalles sobre el backbone, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO. Esos detalles corresponden a los repositorios originales de ByteDance-Seed y a los repositorios `depth-anything/DA3-*` en Hugging Face, que no forman parte de la informacion suministrada.

La unica innovacion tecnica verificable a partir de los datos disponibles es la existencia de variantes especializadas: DA3MONO-LARGE (orientada a profundidad monocula) y DA3METRIC-LARGE (orientada a profundidad metrica, es decir, con escala absoluta). El repositorio incluye ademas workflows oficiales para estimacion de profundidad en imagen y en video, lo que sugiere soporte de inferencia sobre secuencias de fotogramas, aunque no se especifica el mecanismo de consistencia temporal.

## Capacidades

- Estimacion de profundidad densa a partir de imagenes estaticas.
- Estimacion de profundidad sobre video, segun el workflow `utility_depth_anything3_video_depth_estimation.json`.
- Variante metrica (DA3METRIC-LARGE) que proporciona profundidad con escala absoluta, adecuada para medicion y reconstruccion.
- Variante monocula (DA3MONO-LARGE) para profundidad relativa a partir de una sola vista.
- Variantes de distinto tamano (SMALL, BASE) para equilibrar coste computacional y calidad.
- Integracion nativa con ComfyUI mediante nodos de estimacion de geometria.
- No se dispone de informacion sobre soporte de tool calling, agentes, capacidades multilingues ni modos de razonamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Generacion de mapas de profundidad para composicion en postproduccion: el modelo permite obtener un mapa de profundidad por fotograma que se usa como mascara para desenfocar fondos, insertar elementos virtuales o aplicar efectos de profundidad de campo de forma coherente.
- Reconstruccion 3D y fotogrametria asistida: a partir de la profundidad metrica de DA3METRIC-LARGE se pueden generar nubes de puntos o mallas aproximadas de una escena sin necesidad de multiples vistas calibradas.
- Previsualizacion de escenarios en pipelines de videojuegos: la variante SMALL permite generar mapas de profundidad en tiempo casi real dentro de prototipos, dado su menor coste.
- Rotoscopia y segmentacion asistida por profundidad: el mapa de profundidad sirve como señal auxiliar para separar primer plano y fondo en herramientas de edicion.
- Control de generacion de imagen (ControlNet y similares): los mapas de profundidad producidos por el modelo pueden alimentar modelos generativos condicionados por profundidad dentro de ComfyUI, encadenando ambos nodos en un mismo grafo.
- Efectos de realidad aumentada: la profundidad metrica permite anclar objetos virtuales con escala realista sobre el plano capturado por la camara.
- Analisis de video para conduccion autonoma o robotica: la version de video proporciona profundidad por fotograma utilizable en tareas de percepcion y evitacion de obstaculos, siempre que se valide la latencia en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 6,7 GB, pero ese tamano agrega las cuatro variantes; la huella de una sola variante en memoria no se especifica.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. La existencia de una variante SMALL sugiere que al menos esa version esta pensada para entornos con recursos limitados, pero no se aportan cifras de VRAM.
- Opciones de despliegue: ComfyUI es el entorno de destino explicito del reempaquetado, con los ficheros ubicados en `ComfyUI/models/geometry_estimation/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, parametros ni contexto de los modelos comparables en la informacion suministrada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Depth Anything 3 (Comfy-Org) | no disponible | no disponible | Apache 2.0 | Hugging Face, safetensors para ComfyUI |
| DA3-SMALL / DA3-BASE / DA3MONO-LARGE / DA3METRIC-LARGE | no disponible | no disponible | Apache 2.0 (segun repositorio de origen) | Hugging Face (depth-anything) |
| Alternativas de estimacion de profundidad | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio es un reempaquetado, no el modelo original: la responsabilidad tecnica y la documentacion de arquitectura y entrenamiento residen en los repositorios de ByteDance-Seed y `depth-anything`.
- No se documentan sesgos conocidos ni sesgos potenciales en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de profundidades erroneas en escenas con superficies reflectantes, transparentes, texturas repetitivas o iluminacion adversa; no se aportan datos especificos al respecto.
- No se especifican limitaciones de resolucion de entrada, numero de fotogramas soportados en video ni requisitos de calibracion para la variante metrica.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los repositorios originales de ByteDance-Seed y de los modelos base enlazados.
- Al estar orientado a ComfyUI, la integracion en otros frameworks requiere conversion o carga manual de los safetensors.
- No hay informacion sobre versionado, cambios entre la fecha de creacion (2026-05-21) y la ultima actualizacion (2026-10-28).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Depth-Anything-3
- Repositorio original en GitHub: https://github.com/ByteDance-Seed/Depth-Anything-3
- Modelo base DA3-BASE: https://huggingface.co/depth-anything/DA3-BASE
- Modelo base DA3METRIC-LARGE: https://huggingface.co/depth-anything/DA3METRIC-LARGE
- Modelo base DA3MONO-LARGE: https://huggingface.co/depth-anything/DA3MONO-LARGE
- Modelo base DA3-SMALL: https://huggingface.co/depth-anything/DA3-SMALL
- Workflow de profundidad en video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_depth_anything3_video_depth_estimation.json
- Workflow de profundidad en imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_depth_anything3_image_depth_estimation.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
