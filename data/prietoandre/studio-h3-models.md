# prietoandre/studio-h3-models

## Resumen

MiniMax H3 Ref2VA es un modelo publicado por MiniMax y redistribuido en el repositorio `prietoandre/studio-h3-models` como caché de pesos en formato ComfyUI, sin modificaciones respecto al repaquete oficial de Comfy-Org. El repositorio no es el canal oficial del modelo: se trata de una copia mantenida por un tercero para sus propios workers de inferencia, con un tamaño total de 42,0 GB y sin descargas ni valoraciones registradas en el momento de la consulta. La model card no aporta información sobre arquitectura, número de parámetros, longitud de contexto ni idiomas soportados.

La relevancia de esta ficha es principalmente operativa y legal: el modelo se distribuye bajo la MiniMax H3 Community License, que impone restricciones territoriales explícitas (prohibición de uso en Estados Unidos, Unión Europea, Reino Unido y República de Corea) además de una política de uso aceptable. Cualquier evaluación técnica del modelo debe remitirse al repositorio original de MiniMax, ya que este mirror no documenta capacidades ni resultados de benchmarks.

La información disponible no permite determinar si el modelo es de texto, multimodal o de generación de vídeo/imagen, aunque el sufijo "Ref2VA" y el contexto de ComfyUI sugieren un uso dentro de pipelines de difusión. Todos los datos técnicos que no aparecen en la información proporcionada se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (license_name: minimax-h3-community-license) |
| Formato de pesos | archivos de ComfyUI (repaquete de Comfy-Org/MiniMax-H3); precisión y extensión no disponibles |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card únicamente indica que los archivos son copias sin modificar del repaquete de ComfyUI alojado en `Comfy-Org/MiniMax-H3`, con la revisión fijada en los mensajes de commit de subida. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo etapas de RLHF o DPO.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. El tamaño del repositorio (42,0 GB) es el único dato cuantitativo disponible y corresponde al conjunto de pesos empaquetados para ComfyUI, no necesariamente a un único checkpoint.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- El nombre "Ref2VA" y el empaquetado para ComfyUI apuntan a un uso dentro de flujos de generación visual, pero no se detalla la tarea exacta.
- Para conocer las capacidades reales debe consultarse el repositorio original de MiniMax.

## Casos de uso

- Caché de pesos para workers de inferencia propios: el repositorio se mantiene explícitamente como caché para workers internos, de modo que un equipo puede fijar una revisión concreta y evitar descargas repetidas desde el repositorio original.
- Despliegue en ComfyUI: al ser un repaquete sin modificar del formato ComfyUI, puede cargarse directamente en instalaciones de ComfyUI para experimentación con el modelo original.
- Replicabilidad de pipelines: al fijar la revisión en los mensajes de commit, permite reproducir un entorno de inferencia concreto en auditorías o pruebas de regresión.
- Evaluación interna previa a adopción: un equipo puede descargar esta copia para pruebas controladas antes de decidir si integra el modelo en producción, siempre que la licencia lo permita en su territorio.
- Archivado de artefactos: sirve como snapshot de 42,0 GB para conservar una versión concreta del modelo ante posibles cambios en el repositorio upstream.
- Integración en infraestructura de CI: al estar en un repositorio propio, puede montarse en imágenes de contenedor o volúmenes persistentes para pruebas automatizadas que requieran los pesos.
- En ningún caso debe usarse en territorios restringidos por la licencia (Estados Unidos, Unión Europea, Reino Unido, República de Corea).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (42,0 GB) da una cota inferior del espacio en disco necesario, no de la VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el formato es compatible con ComfyUI; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica la arquitectura ni la tarea del modelo, por lo que no es posible establecer comparaciones fiables con alternativas de la misma categoría.

## Limitaciones y advertencias

- Restricción territorial de licencia: prohibido su uso en Estados Unidos, Unión Europea, Reino Unido y República de Corea. Esto afecta directamente a desarrolladores en España.
- Sujeto a la política de uso aceptable de MiniMax H3 además de la licencia.
- Repositorio de terceros: no es el canal oficial; el autor declara que los archivos son copias sin modificar, pero la integridad debe verificarse contra el repositorio original.
- Sin documentación técnica: no hay datos de arquitectura, parámetros, contexto ni idiomas, lo que impide evaluar sesgos, riesgo de alucinación o limitaciones idiomáticas.
- Sin métricas de calidad publicadas en este repositorio.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Para uso comercial es imprescindible revisar el texto completo de la licencia en el archivo `LICENSE` del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/prietoandre/studio-h3-models
- Repaquete oficial de ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo original de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-H3
