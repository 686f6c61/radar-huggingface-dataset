# bboldpilot/zils-lite-b2

## Resumen

Zils d3-lite soup body es un reempaquetado del modelo `quincyqiang/chinese-decision-unified-0.8b`, un transformer decoder-only de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) especializado en toma de decisiones en chino. Lo publica el usuario `bboldpilot` como "cuerpo" (soup body) para la subred Zils de Bittensor (SN127), en el pool `d3-lite`. No se trata de un modelo nuevo: los pesos de lenguaje son los del modelo original, sin modificar, y el autor lo indica explícitamente en la model card.

La relevancia de esta ficha es acotada y conviene ser honesto al respecto: el repositorio tiene cero descargas y cero likes en el momento de la consulta, se creó y actualizó el mismo día (4 de noviembre de 2026) y su función es servir de pieza intercambiable dentro de una infraestructura de subred descentralizada, no de modelo de propósito general para producción. El interés técnico está en su condición de artefacto derivado: un modelo base chino de decisión con una torre de visión tomada de Qwen/Qwen3.5-0.8B, empaquetado con una licencia Apache 2.0 heredada.

La información disponible es escasa: la model card es de tres párrafos y no documenta datos de entrenamiento, benchmarks, contexto ni composición del dataset. Todo lo que sigue distingue entre lo que consta en la información proporcionada y lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla la variante exacta en la informacion disponible); incluye torre de vision heredada de Qwen/Qwen3.5-0.8B |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card; el modelo base se denomina "chinese-decision-unified", lo que sugiere orientacion al chino, sin confirmacion oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de unos 853 millones de parametros. La model card no especifica la variante arquitectonica concreta (atencion, normalizacion, positional encoding) ni el numero de capas u ocultas. Lo que si consta es que el export original es solo texto y que la torre de vision es la de Qwen/Qwen3.5-0.8B, incorporada sin cambios porque el layout del cuerpo Zils lo requiere. Es decir, la parte visual no ha sido entrenada por el autor del reempaquetado ni, presumiblemente, por el autor del modelo base de decision: es un componente estructural impuesto por el formato de la subred.

Sobre el entrenamiento no hay datos: no se documentan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. El nombre del modelo base (`chinese-decision-unified-0.8b`) apunta a un ajuste orientado a tareas de decision en chino, pero la model card de este repositorio no aporta detalles. Tampoco se describe ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.). El autor declara que los pesos de lenguaje son los originales sin modificar y que la redistribucion se hace bajo la licencia Apache 2.0 del modelo base, incluyendo los ficheros LICENSE/NOTICE originales.

## Capacidades

- Generacion de texto en el ambito del modelo base, presumiblemente orientada a tareas de decision y clasificacion en chino; no hay evaluacion publicada que lo confirme.
- Torre de vision presente (heredada de Qwen/Qwen3.5-0.8B), aunque la model card indica que el export original es solo texto y no documenta el uso efectivo de la vision en este reempaquetado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el nombre del modelo base sugiere foco en chino.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Participacion en la subred Zils (Bittensor SN127), pool `d3-lite`: el uso principal y documentado del repositorio es servir como cuerpo del pool dentro de la infraestructura de la subred, donde los mineros o validadores cargan el artefacto segun el layout exigido.
- Experimentacion con modelos de decision en chino: al ser un modelo de 853 M parametros, cabe en una GPU de consumo y permite probar pipelines de clasificacion o decision sin infraestructura dedicada, aceptando que no hay benchmarks publicados.
- Reproduccion de artefactos derivados: util para estudiar como se reempaqueta un modelo base con una torre de vision ajena y se redistribuye bajo Apache 2.0 conservando LICENSE/NOTICE.
- Prototipado de pipelines multimodal texto-vision a pequena escala: la presencia de la torre de Qwen3.5-0.8B permite explorar la integracion, aunque la model card no garantice que la vision este funcional en este export.
- Fine-tuning posterior sobre datos propios de decision: con 853 M parametros y licencia Apache 2.0, es viable ajustar el modelo en una sola GPU para tareas de clasificacion o enrutamiento, partiendo del modelo base original si se necesita documentacion.
- Evaluacion comparativa de "soup bodies": util para quien investigue el formato de cuerpos de la subred Zils y quiera contrastar variantes del mismo pool.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto (no documentada).
- Cuantizacion a 8 bits: en torno a 0,9 GB de pesos; a 4 bits, en torno a 0,5 GB, aunque no se distribuyen ficheros GGUF oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPU de consumo sin problema.
- Opciones de despliegue: transformers con safetensors es la via directa; vLLM, llama.cpp, Ollama o TGI son posibles en teoria, pero no hay conversion ni configuracion publicada para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bboldpilot/zils-lite-b2 | 852.985.920 | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| quincyqiang/chinese-decision-unified-0.8b (base) | no disponible en la informacion | no disponible | Apache 2.0 (segun el reempaquetado) | HuggingFace |
| Qwen/Qwen3.5-0.8B (fuente de la torre de vision) | no disponible en la informacion | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento de ninguno de los tres, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card minima: no documenta contexto, idiomas, datos de entrenamiento ni evaluacion; cualquier uso en produccion exige validacion propia.
- Cero traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; no hay evidencia de uso ni de mantenimiento.
- Artefacto derivado: los pesos de lenguaje no son originales del autor del repositorio; la calidad depende enteramente del modelo base `quincyqiang/chinese-decision-unified-0.8b`.
- Vision no garantizada: la torre de Qwen3.5-0.8B se incluye por requisito de layout, pero la model card indica que el export original es solo texto; no hay confirmacion de que la via multimodal funcione.
- Riesgo de alucinacion: inherente a cualquier modelo de 853 M parametros; sin benchmarks no puede acotarse.
- Sesgos: no documentados; un modelo orientado al chino puede tener un sesgo linguistico y cultural marcado en tareas de decision.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los ficheros LICENSE/NOTICE incluidos y la licencia real del modelo base antes de redistribuir.
- Idiomas: el nombre del modelo base sugiere chino; no hay confirmacion de soporte de castellano ni de otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bboldpilot/zils-lite-b2
- Modelo base: https://huggingface.co/quincyqiang/chinese-decision-unified-0.8b
- Revision del modelo base citada: `8a16a23aa127bfb56e75e3e5976fde00c57ede3a`
- Fuente de la torre de vision: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Subred Zils (Bittensor SN127): no disponible enlace oficial en la informacion proporcionada.
