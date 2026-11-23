# chdp207/Sulphur-3

## Resumen

Sulphur 3 es un ajuste fino (fine-tune) del modelo de generacion de video MiniMax H3, publicado por el usuario chdp207 bajo el identificador `chdp207/Sulphur-3`. Se presenta explicitamente como un modelo de generacion de video "sin censura" (uncensored), construido sobre los pesos de MiniMaxAI/MiniMax-H3 y distribuido con la licencia comunitaria del modelo original (minimax-h3-community-license). El repositorio ocupa 276,5 GB y contiene un checkpoint principal en formato safetensors, variantes cuantizadas y un fichero "corrector" opcional con nodos y workflow para ComfyUI.

El modelo no aporta arquitectura propia: hereda integramente la de MiniMax H3 y solo modifica el comportamiento mediante un ajuste fino que, segun la model card, incluye un LoRA de RL (el fichero `s3_raw.safetensors` seria la version sin ese LoRA). La relevancia actual del modelo es limitada y muy nicho: se trata de un derivado no oficial, sin descargas ni validacion publica en el momento de la consulta, orientado a usuarios que ya trabajan con MiniMax H3 en pipelines de generacion de video y buscan una variante con menos restricciones de contenido.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face. No hay datos publicados de benchmarks, idiomas soportados, numero de parametros ni contexto, por lo que esos campos se marcan como "no disponible". Cualquier evaluacion en produccion deberia hacerse contra el modelo base MiniMax H3, cuya documentacion oficial es la referencia tecnica fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la de MiniMaxAI/MiniMax-H3; la model card no la describe) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Variantes cuantizadas incluidas en `quantized/` (tipos concretos no especificados); checkpoint principal `s3.safetensors` |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license (derivado de MiniMax H3) |
| Formato de pesos | safetensors (`s3.safetensors`, `s3_raw.safetensors`, `s3_ref2va.safetensors`, `s3_raw_lora.safetensors`, `s3_corrector.safetensors`) y ZIP con nodos/workflow de ComfyUI (`S3_ComfyUI.zip`) |
| Tamano del repositorio | 276,5 GB |
| Tipo de modelo | Generacion de video (texto/condicionamiento a video) |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Libreria | minimax-h3 |

## Arquitectura y entrenamiento

Sulphur 3 es un fine-tune del modelo de generacion de video MiniMax H3. La model card no documenta la arquitectura interna (tipo de backbone, mecanismo de atencion, compresion latente o esquema de difusion), por lo que no es posible detallarla mas alla de indicar que se ejecuta "como cualquier modelo MiniMax H3 normal". El autor indica que el checkpoint principal `s3.safetensors` incorpora un LoRA de RL, mientras que `s3_raw.safetensors` corresponde al modelo sin ese LoRA; `s3_raw_lora.safetensors` es ese mismo modelo en formato LoRA. Existe ademas una variante `s3_ref2va.safetensors` que, segun la model card, no ha sido entrenada.

El entrenamiento se describe unicamente como un ajuste orientado a eliminar censura en la generacion de video. No se publican datos sobre volumen de datos de entrenamiento, composicion del dataset, numero de pasos, tecnicas de RLHF/DPO (mas alla de la mencion al "RL lora") ni innovaciones tecnicas. El repositorio incluye un fichero "corrector" opcional (`s3_corrector.safetensors`) que, segun el autor, puede usarse con Sulphur 3 o con otros modelos H3, y que viene acompanado de nodos y workflow para ComfyUI en `S3_ComfyUI.zip`; el corrector se coloca en `ComfyUI/models/h3_correctors/`. Tambien hay una carpeta `experimental/` con ficheros que el propio autor recomienda ignorar.

## Capacidades

- Generacion de video a partir de condicionamiento, heredando las capacidades del modelo base MiniMax H3.
- Variante "sin censura": el ajuste busca reducir los filtros de contenido del modelo original en la generacion de video.
- Uso opcional de un "corrector" que puede aplicarse a Sulphur 3 y a otros modelos H3, con soporte de nodos y workflow para ComfyUI.
- Compatibilidad con el ecosistema MiniMax H3: se ejecuta con las mismas herramientas que el modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de audio, vision o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de video creativo sin restricciones de contenido: el modelo se usaria como sustituto directo de MiniMax H3 en pipelines de sintesis de video, cargando `s3.safetensors` con las mismas herramientas del modelo base, para proyectos artisticos o de ficcion que requieran tematicas que el modelo original filtra.
- Prototipado en ComfyUI: gracias a `S3_ComfyUI.zip`, se puede montar un flujo de trabajo con el corrector opcional en ComfyUI, colocando `s3_corrector.safetensors` en `ComfyUI/models/h3_correctors/`, para iterar rapidamente sobre resultados de video.
- Investigacion sobre alineacion y censura en modelos generativos: el par `s3.safetensors` (con LoRA de RL) y `s3_raw.safetensors` (sin el) permite estudiar experimentalmente el efecto del ajuste por RL sobre el comportamiento del modelo, comparando salidas entre ambas variantes.
- Experimentacion con LoRAs: `s3_raw_lora.safetensors` permite aplicar el ajuste como LoRA sobre el modelo base H3, facilitando combinaciones con otros adaptadores o merges (el autor recomienda los merges de TenStrip).
- Despliegue en entornos con VRAM limitada: la carpeta `quantized/` ofrece versiones de menor consumo, pensadas para ejecutar el modelo en GPUs con menos memoria que las necesarias para el checkpoint completo.
- Evaluacion comparativa de derivados de H3: util para equipos que ya usan MiniMax H3 y quieren medir diferencias cualitativas de un fine-tune no oficial frente al modelo original antes de adoptarlo en un flujo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 276,5 GB, lo que da una idea del orden de magnitud del checkpoint completo; las variantes de `quantized/` reducen el requisito, pero no se especifican cifras.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del repositorio, el checkpoint completo no cabe en GPUs de consumo habituales.
- Compatibilidad con GPU de consumo: solo previsiblemente mediante las variantes cuantizadas de `quantized/`, sin datos concretos de VRAM ni de modelos de GPU soportados.
- Opciones de despliegue: el autor indica ejecutarlo "como cualquier modelo MiniMax H3"; se incluyen nodos y workflow para ComfyUI (`S3_ComfyUI.zip`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (y, siendo un modelo de video, es poco probable que esos runners de texto sean aplicables).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sulphur 3 (chdp207) | No disponible | No disponible | Fine-tune de video sin censura sobre MiniMax H3 | minimax-h3-community-license | Hugging Face, 0 descargas, 0 likes |
| MiniMaxAI/MiniMax-H3 | No disponible en la informacion proporcionada | No disponible | Modelo base de generacion de video | minimax-h3-community-license | Hugging Face (oficial) |
| Merges de TenStrip | No disponible | No disponible | Merges/checkpoints basados en H3 que incluyen Sulphur | No disponible | Hugging Face (recomendado por el autor) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a licencia, origen y disponibilidad.

## Limitaciones y advertencias

- Modelo no oficial: es un fine-tune de un tercero (chdp207), no una release de MiniMaxAI; no hay garantias de calidad, estabilidad ni soporte.
- Sin validacion publica: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni evaluaciones independientes.
- Contenido sin censura: el objetivo declarado del ajuste es eliminar filtros del modelo base, lo que implica riesgos legales y eticos en funcion de la jurisdiccion y del uso previsto; no se debe desplegar en aplicaciones publicas sin moderacion adicional.
- Licencia restrictiva: se hereda la minimax-h3-community-license, que puede imponer condiciones al uso comercial; es imprescindible revisar `LICENSE` antes de cualquier despliegue.
- Falta de documentacion tecnica: no se publican parametros, contexto, idiomas, datos de entrenamiento ni benchmarks, lo que dificulta la evaluacion rigurosa.
- Repositorio muy pesado (276,5 GB): requiere infraestructura de almacenamiento y descarga considerable; las variantes cuantizadas no estan documentadas en detalle.
- Ficheros experimentales y variantes sin entrenar (`s3_ref2va.safetensors`): el propio autor recomienda ignorar `experimental/` y advierte que la variante Ref2VA no ha sido entrenada.
- Riesgo de artefactos y alucinacion visual: al ser un modelo de video, pueden aparecer incoherencias temporales, artefactos y contenido no fiel al prompt; sin benchmarks no se puede cuantificar.
- Dependencia del ecosistema H3 y ComfyUI: el uso del corrector exige instalar nodos y workflow especificos, lo que anade complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chdp207/Sulphur-3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en X: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges de TenStrip (recomendados por el autor): https://huggingface.co/TenStrip
