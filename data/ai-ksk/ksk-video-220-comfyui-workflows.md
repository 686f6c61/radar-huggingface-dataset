# AI-KSK/ksk-video-220-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-220-comfyui-workflows` no es un modelo de IA en sentido estricto, sino un repositorio de artefactos complementarios (flujos de trabajo en formato JSON para ComfyUI) asociado a un episodio comparativo entre dos modelos de edición de imagen: JoyAI-Image-Edit y Qwen-Image-Edit 2511. El autor, AI-KSK, publica dos grafos de ComfyUI que reproducen el experimento del episodio: un flujo de edición de imagen única con JoyAI (13 nodos) y un flujo comparativo JoyAI frente a 2511 (51 nodos), con todos los valores de UNET, CLIP, VAE y LoRA extraídos del JSON.

El contenido del repositorio es, por tanto, material de tutorial y reproducción de experimentos, no pesos de un modelo. El episodio se centra en una comparación de once pruebas sobre instrucciones de varios pasos, control de cámara y cambios de punto de vista, y defiende la técnica de "prompt progresivo" como clave para que las ediciones compuestas se ejecuten correctamente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 0.0 GB, lo que confirma que no aloja pesos.

Su relevancia es la de un recurso práctico para quien quiera replicar el flujo de edición de imagen con JoyAI en ComfyUI y contrastarlo con Qwen-Image-Edit 2511, con enlaces a los flujos en RunningHub y a los vídeos del tutorial. No debe evaluarse como un modelo con parámetros, contexto o benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene flujos de ComfyUI en JSON, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los flujos referencian UNET, CLIP, VAE y LoRA, pero no se detallan cuantizaciones) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | JSON de flujos de ComfyUI (no contiene safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica: el repositorio no incluye un modelo entrenado ni información sobre arquitectura, dataset, número de tokens o técnicas de alineación como RLHF o DPO. Lo que contiene son dos grafos de ComfyUI: un flujo de edición de imagen única con JoyAI (13 nodos) y un flujo comparativo JoyAI frente a Qwen-Image-Edit 2511 (51 nodos). El autor indica que todos los valores de UNET, CLIP, VAE y LoRA han sido extraídos directamente del JSON de los flujos.

La innovación que documenta el episodio no es arquitectónica sino metodológica: una técnica de "prompt progresivo" para que las ediciones compuestas (instrucciones de varios pasos, control de cámara y cambios de punto de vista) se apliquen de forma acumulativa y coherente. El material no aporta detalles sobre los modelos subyacentes más allá de su uso dentro de los grafos.

## Capacidades

- Reproducción de un flujo de edición de imagen de una sola imagen con JoyAI en ComfyUI (13 nodos).
- Reproducción de un flujo comparativo entre JoyAI-Image-Edit y Qwen-Image-Edit 2511 (51 nodos).
- Aplicación de la técnica de prompt progresivo para ediciones compuestas de varios pasos.
- Evaluación de control de cámara y cambios de punto de vista en edición de imagen.
- Comparación cualitativa de materiales industriales y acabado comercial entre ambos modelos.
- No incluye capacidades de generación de texto, código, matemáticas, tool calling, agentes ni audio.

## Casos de uso

- Replicar el experimento comparativo: cargar el grafo de 51 nodos en ComfyUI para reproducir las once pruebas entre JoyAI-Image-Edit y Qwen-Image-Edit 2511 y contrastar los resultados con los del vídeo.
- Edición de imagen de un solo paso con JoyAI: usar el flujo de 13 nodos como plantilla base para editar una imagen con instrucciones progresivas y ajustar los nodos de UNET, CLIP, VAE y LoRA según el entorno local.
- Estudio de la técnica de prompt progresivo: analizar la estructura del grafo para entender cómo se encadenan las instrucciones compuestas y trasladar el patrón a otros pipelines de edición.
- Evaluación de control de cámara: emplear el flujo comparativo para comprobar en qué casos JoyAI mantiene el punto de vista y en qué casos falla, tal como advierte el propio autor.
- Benchmarking interno de modelos de edición: usar los dos grafos como base para comparar JoyAI y Qwen-Image-Edit 2511 en tareas concretas de conversión de materiales o acabado comercial antes de adoptar uno de los dos.
- Formación y documentación: utilizar los flujos y los vídeos enlazados (YouTube y Bilibili) como material de aprendizaje sobre edición de imagen multi-paso en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El episodio describe una comparación cualitativa de once pruebas, sin métricas numéricas publicadas en la información proporcionada.

## Requisitos de hardware

- No disponible: el repositorio no incluye pesos ni especifica requisitos de VRAM, GPU o latencia.
- Los requisitos reales dependerán de los modelos JoyAI-Image-Edit y Qwen-Image-Edit 2511 referenciados en los flujos, cuyos datos no se detallan en la información disponible.
- El despliegue se realiza mediante ComfyUI, cargando los archivos JSON de los grafos.
- Los flujos también están publicados en RunningHub, lo que permite ejecutarlos en la infraestructura de esa plataforma sin montar el entorno local.
- Throughput y latencia: no disponible.

## Comparativa con modelos similares

| Aspecto | Este repositorio (AI-KSK) | JoyAI-Image-Edit | Qwen-Image-Edit 2511 |
|---|---|---|---|
| Naturaleza | Flujos de ComfyUI en JSON | Modelo de edición de imagen | Modelo de edición de imagen |
| Parametros | no disponible | no disponible | no disponible |
| Contexto | no disponible | no disponible | no disponible |
| Licencia | other | no disponible | no disponible |
| Disponibilidad | Hugging Face, RunningHub | referenciado en los flujos | referenciado en los flujos |
| Fortalezas según el episodio | Reproducibilidad del experimento | Ediciones compuestas con prompt progresivo | Materiales industriales y acabado comercial |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, por lo que no puede usarse para inferencia por sí mismo.
- El propio autor reconoce que JoyAI falló en al menos una prueba de control de cámara, de modo que su ventaja en ese aspecto no es concluyente.
- Qwen-Image-Edit 2511 mantiene ventajas reales: mejores materiales industriales y mayor acabado comercial en la prueba de conversión de materiales.
- La edición multi-imagen es una derrota clara para la versión de JoyAI sin Plus.
- La licencia es "other" y no se detallan sus términos; conviene revisarla antes de cualquier uso comercial de los flujos.
- Solo se declara el idioma inglés, lo que puede limitar la documentación y los prompts para usuarios hispanohablantes.
- Repositorio sin descargas ni likes y de 0.0 GB: no hay evidencia de comunidad ni de mantenimiento continuado.
- La fecha de creación indicada (2026-11-09) es posterior a la actual, lo que conviene verificar antes de tomar el recurso como referencia estable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-220-comfyui-workflows
- Flujo JoyAI Image single-image edit en RunningHub: https://www.runninghub.ai/post/2043308514138918913/?inviteCode=rh-v1111
- Flujo JoyAI Image vs 2511 comparison en RunningHub: https://www.runninghub.ai/post/2043308481817616386/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=uv7JK5-X0jc
- Original en chino (Bilibili): https://www.bilibili.com/video/BV1MEQbBsE5z
