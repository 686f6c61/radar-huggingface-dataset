# Comfy-Org/Yue2

## Resumen

Yue2 es un modelo de generación de música a partir de texto (text-to-music) y de creación de versiones (music cover) desarrollado originalmente por el grupo m-a-p. Esta ficha corresponde al repositorio `Comfy-Org/Yue2`, un reempaquetado de los pesos originales en formato de archivo único (`safetensors` en bf16) para su uso directo dentro de ComfyUI, no al modelo original en sí. El repositorio incluye dos componentes: el modelo principal de generación `yue2_3b_bf16.safetensors` (derivado de `m-a-p/YuE2-3B`, de ahí el sufijo "3B" en el nombre) y un codificador de audio `sheetsage2_bf16.safetensors` (derivado de `m-a-p/SheetSage2`), que actúa como extractor de representaciones musicales para tareas de cover.

El problema que resuelve es la síntesis de audio musical condicionada por texto y por una referencia melódica, una tarea que históricamente ha requerido pipelines complejos de varios modelos. Al empaquetar ambos componentes en archivos únicos compatibles con ComfyUI, el repositorio elimina la fricción de integración y permite montar flujos de trabajo de generación musical dentro de un grafo visual, con plantillas oficiales para "Text to Music" y "Music Cover".

Es relevante ahora porque la generación musical open source está ganando tracción y porque este repositorio acumula un volumen de descargas notable (más de 270.000) pese a su licencia no comercial. La información pública disponible sobre arquitectura, datos de entrenamiento y benchmarks es muy limitada: la model card del reempaquetado es puramente logística y no se han proporcionado datos técnicos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para audio segun el tag `diffusion-single-file`; componente auxiliar SheetSage2 como codificador de audio) |
| Parametros totales | aproximadamente 3B en el modelo principal (inferido del nombre `YuE2-3B`); no confirmado en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 (uso no comercial) |
| Formato de pesos | safetensors (archivo unico: `yue2_3b_bf16.safetensors` y `sheetsage2_bf16.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original `m-a-p/YuE2-3B`. El tag `diffusion-single-file` del repositorio indica que se trata de un modelo de difusion, y el nombre sugiere un tamano de aproximadamente 3.000 millones de parametros. El segundo componente, `m-a-p/SheetSage2`, se distribuye como codificador de audio (`audio_encoders`), lo que apunta a un uso como extractor de caracteristicas musicales para condicionar la generacion, probablemente en el flujo de "music cover".

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El repositorio de Comfy-Org es exclusivamente un reempaquetado: no aporta pesos nuevos ni documentacion sobre el entrenamiento.

## Capacidades

- Generacion de musica a partir de descripciones textuales (text-to-music), mediante el workflow oficial `audio_yue2_text2music.json`.
- Creacion de versiones o covers musicales a partir de una referencia de audio, mediante el workflow `audio_yue2_music_cover.json` y el codificador SheetSage2.
- Extraccion de representaciones musicales mediante el codificador SheetSage2.
- Integracion nativa en ComfyUI como nodos dentro de un grafo de generacion de audio.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se ha documentado soporte de vision, audio de entrada como texto hablado ni modo "thinking".

## Casos de uso

- Produccion musical asistida: generar bocetos instrumentales a partir de una descripcion textual (genero, instrumentacion, tempo) usando el workflow de text-to-music, para iterar rapidamente sobre ideas antes de la produccion final.
- Creacion de covers: transformar una melodia o pieza de referencia en una nueva version con otro estilo o instrumentacion, aprovechando el codificador SheetSage2 para preservar la estructura musical.
- Prototipado de bandas sonoras: generar fragmentos musicales de ambiente para videojuegos, videos o podcasts dentro de un pipeline de ComfyUI que combine audio con otros nodos de postproduccion.
- Educacion musical: producir ejemplos auditivos de progresiones o estilos concretos a partir de una descripcion, utiles en materiales didacticos.
- Investigacion en generacion musical: usar los pesos en bf16 como linea base reproducible para experimentos de evaluacion subjetiva y comparacion de tecnicas de condicionamiento.
- Integracion en herramientas creativas: incrustar los nodos de Yue2 en aplicaciones de creacion audiovisual basadas en ComfyUI, ofreciendo generacion musical como una etapa mas del grafo.
- Automatizacion de contenido para redes: generar pistas cortas de fondo a partir de prompts de texto en lotes, siempre que el uso sea no comercial por la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 15,9 GB, lo que corresponde a los pesos en bf16 de ambos componentes; la VRAM necesaria para inferencia sera del orden de la decena de GB o mas, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: no disponible. Por el tamano del modelo, se espera que requiera GPU con al menos 16-24 GB de VRAM, pero es una estimacion no confirmada.
- Compatibilidad con GPU de consumo: no confirmada; es plausible en tarjetas de 24 GB (RTX 3090, RTX 4090) si el pipeline permite descarga por etapas, pero no hay datos oficiales.
- Opciones de despliegue: ComfyUI es el entorno soportado oficialmente por este repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de generacion musical, por lo que no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin autorizacion expresa; esto afecta a productos, servicios y contenidos monetizados.
- La model card del repositorio es puramente logistica: no documenta sesgos, calidad de generacion ni limitaciones conocidas del modelo original.
- Riesgo de alucinacion en el sentido de generar audio incoherente o que no se ajuste al prompt; no cuantificado.
- No se dispone de informacion sobre idiomas soportados en los prompts ni sobre sesgos culturales o de estilo musical.
- Los pesos se distribuyen solo en bf16; no hay versiones cuantizadas oficiales en este repositorio, lo que limita el despliegue en hardware modesto.
- Al ser un reempaquetado, la trazabilidad de cambios respecto a los pesos originales de `m-a-p` depende del mantenimiento de Comfy-Org.
- No apto para pipelines de produccion que exijan soporte documentado de latencia, throughput o estabilidad, dada la ausencia de datos tecnicos publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Yue2
- Modelo original principal: https://huggingface.co/m-a-p/YuE2-3B
- Codificador original: https://huggingface.co/m-a-p/SheetSage2
- Workflow "YuE2: Music Cover": https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_yue2_music_cover.json
- Workflow "YuE2: Text to Music": https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_yue2_text2music.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
