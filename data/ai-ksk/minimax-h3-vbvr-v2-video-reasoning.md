# AI-KSK/minimax-h3-vbvr-v2-video-reasoning

## Resumen

Este repositorio, publicado por el usuario AI-KSK bajo el identificador `AI-KSK/minimax-h3-vbvr-v2-video-reasoning`, no contiene pesos de un modelo entrenado, sino un *workflow* de ComfyUI empleado para una comparativa de generación de vídeo. En concreto, el grafo enfrenta el modelo MiniMax H3 con y sin el LoRA VBVR V2 en un conjunto de 9 escenarios y 18 clips, evaluando consistencia de objetos, orden de acciones, consistencia temporal e interacción espacial. El repositorio se etiqueta con `minimax-h3`, `comfyui`, `runninghub`, `vbvr-v2`, `video-generation`, `image-to-video` y `video-reasoning`.

El interés del artefacto es principalmente metodológico: ofrece una estructura de grafo reproducible (19 nodos y 22 enlaces) para auditar cómo un LoRA de razonamiento de vídeo modifica el comportamiento de un generador de imagen a vídeo. No obstante, el propio autor advierte de que no se incluyen pesos, ficheros LoRA, credenciales de API ni URLs firmadas, y que los modelos de terceros quedan sujetos a las licencias de sus autores originales.

El tamaño del repositorio es de 0.0 GB, con cero descargas y cero *likes* en el momento de la consulta, y fue creado y actualizado el 27 de noviembre de 2026. La licencia se declara como `other`, sin que la model card detalle condiciones concretas de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un grafo de ComfyUI, no un modelo con arquitectura propia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin detalle de condiciones en la model card) |
| Formato de pesos | no se incluyen pesos; el repositorio contiene `workflow.json`, `cover.png`, `LICENSE_NOTE.md` y `CHECKSUMS.txt` |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal propia, ni datos de entrenamiento, ni proceso de RLHF/DPO. El contenido técnico es un grafo de ComfyUI de 19 nodos y 22 enlaces que orquesta dos componentes de terceros: el modelo generativo MiniMax H3 y el LoRA VBVR V2. La model card no especifica la arquitectura interna de MiniMax H3 (transformer, difusión, híbrida u otra), ni el número de parámetros, ni la composición del dataset de entrenamiento de ninguno de los dos componentes.

La única innovación metodológica documentada es la propia estructura del *workflow*: un diseño de grafo orientado a la comparación controlada con y sin LoRA sobre los mismos 9 escenarios, con verificación de integridad mediante `CHECKSUMS.txt` (SHA256) y notas de dependencias y redistribución en `LICENSE_NOTE.md`.

## Capacidades

- Generación de vídeo a partir de imagen (*image-to-video*) mediante el pipeline declarado en Hugging Face.
- Razonamiento de vídeo asistido por el LoRA VBVR V2, orientado a consistencia de objetos, orden de acciones, consistencia temporal e interacción espacial.
- Evaluación comparativa A/B (con y sin LoRA) sobre 9 escenarios y 18 clips.
- Ejecución dentro de ComfyUI mediante un grafo reproducible de 19 nodos.
- Integración con la plataforma RunningHub, según el enlace de *workflow* publicado.
- Soporte de *tool calling*, agentes, modo *thinking*, visión, audio y capacidades multilingües: no disponible.

## Casos de uso

- Auditoría de LoRAs de razonamiento de vídeo: cargar `workflow.json` en ComfyUI y reproducir la comparativa de 18 clips para medir cuánto mejora el LoRA VBVR V2 en consistencia temporal frente al modelo base MiniMax H3.
- Evaluación de consistencia de objetos en vídeo generado: usar los 9 escenarios del grafo para comprobar si un objeto mantiene identidad visual a lo largo de los fotogramas, comparando la rama con LoRA y la rama sin LoRA.
- Verificación de orden de acciones: emplear el *workflow* para generar secuencias donde el orden de los eventos es crítico y detectar inversiones o saltos temporales introducidos por el generador.
- Pruebas de interacción espacial: reproducir escenas con relaciones espaciales entre objetos (contacto, oclusión, proximidad) y validar si el LoRA corrige errores de disposición.
- Reproducibilidad de experimentos en ComfyUI: servir como plantilla de grafo versionada, con sumas de comprobación SHA256, para que otros equipos repliquen la misma configuración de nodos y parámetros.
- Integración en pipelines de generación de vídeo sobre RunningHub: reutilizar la estructura del grafo como base para orquestar MiniMax H3 y el LoRA en un entorno alojado, sustituyendo los nombres de fichero de marcador de posición por rutas locales.
- Formación interna de equipos: usar la comparativa de 18 clips como material didáctico sobre el impacto real de un LoRA de razonamiento en un generador imagen-a-vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una comparativa cualitativa de 9 escenarios y 18 clips centrada en consistencia de objetos, orden de acciones, consistencia temporal e interacción espacial, pero no incluye métricas numéricas, puntuaciones ni tablas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no incluye pesos ni indica el tamaño de los modelos MiniMax H3 o VBVR V2, por lo que no puede calcularse.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (requisito explícito del *workflow*) y RunningHub (plataforma referenciada en los enlaces verificados). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría ni ofrece datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni ficheros LoRA; es únicamente un grafo de ComfyUI. No puede ejecutarse sin descargar MiniMax H3 y VBVR V2 desde sus repositorios oficiales.
- El autor indica explícitamente que no se incluyen credenciales de API privadas ni URLs firmadas; los nombres de fichero de modelo en el grafo son marcadores de posición que deben sustituirse localmente.
- Los modelos y nodos de terceros quedan sujetos a las licencias de sus autores respectivos; la licencia `other` del repositorio no aclara las condiciones de uso comercial del conjunto.
- No hay información sobre sesgos, riesgo de alucinación visual, limitaciones idiomáticas ni restricciones de contexto, al no tratarse de un modelo de lenguaje.
- El repositorio presenta cero descargas y cero *likes*, y no consta validación externa de la comparativa más allá de los enlaces publicados por el propio autor.
- La fecha de creación (27 de noviembre de 2026) y la ausencia de documentación sobre los componentes de terceros impiden verificar versiones concretas de MiniMax H3 o VBVR V2 utilizadas en el experimento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-vbvr-v2-video-reasoning
- Vídeo en Bilibili: https://www.bilibili.com/video/BV1Bk1czaEu7/
- Vídeo en YouTube: https://youtu.be/OO9yf4yLgng
- Workflow en RunningHub: https://www.runninghub.cn/post/2125173042782498818/?inviteCode=rh-v1111
