# crabby-devil/zils-mini-piccolo-4b

## Resumen

crabby-devil/zils-mini-piccolo-4b es una redistribucion sin modificaciones de los pesos de agentscope-ai/Piccolo-4B, un fine-tune de decision derivado de Qwen/Qwen3.5-4B. El repositorio no aporta un modelo nuevo: publica los mismos shards safetensors, el indice de shards y el config.json byte a byte identicos a la revision `35f5e464ef884d8720b53d12c7f8aaf5497a3644` del modelo original, junto con la licencia Apache-2.0 y el fichero THIRD_PARTY_LICENSES.md sin cambios.

El proposito declarado es servir como "body" para el pool de soups `d3-mini` de Zils, un subconjunto de la red Bittensor (subnet 127). El fichero `zils-owner.json` identifica la hotkey de Bittensor que registro esta copia. Por tanto, su relevancia practica para un desarrollador es la del modelo base: un transformer denso de aproximadamente 4.660 millones de parametros con pipeline image-text-to-text y etiqueta de arquitectura `qwen3_5`.

Al tratarse de una redistribucion, toda la informacion sobre entrenamiento, evaluacion y limitaciones remite a la model card de agentscope-ai/Piccolo-4B, que no se incluye en los datos disponibles. Cualquier uso en produccion deberia partir de esa fuente y no de este repositorio espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso, etiqueta `qwen3_5` en los tags; detalles no disponibles |
| Parametros totales | 4.659.865.088 (4,66 mil millones) |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el formato original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards + indice), config.json compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4,66 mil millones de parametros, derivado de Qwen/Qwen3.5-4B y ajustado por agentscope-ai para tareas de decision (tag `decision-model`). El pipeline declarado es image-text-to-text, lo que indica soporte de entrada multimodal de imagen y texto, aunque no se dispone de detalles sobre el entrenamiento multimodal en la informacion proporcionada.

No hay datos disponibles sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, modos de razonamiento). Esta copia no modifica ningun peso: los shards y el config.json son byte a byte identicos a la revision original.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados de la base Qwen3.5-4B.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text).
- Toma de decisiones: el modelo base esta ajustado como `decision-model`, orientado a seleccion o clasificacion de opciones.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de modelos de decision en pipelines propios: al ser una copia exacta de Piccolo-4B, sirve para reproducir el comportamiento del original sin depender de la disponibilidad del repositorio fuente, util en entornos con espejos internos.
- Experimentacion con modelos multimodales de 4B en GPU de consumo: el tamano permite probar tareas image-text-to-text en una unica GPU de 24 GB con cuantizacion, antes de escalar a modelos mayores.
- Participacion en el ecosistema Bittensor subnet 127: el repositorio esta pensado como body para el pool de soups `d3-mini` de Zils, por lo que es el artefacto adecuado para mineros o validadores que necesiten esa revision concreta.
- Clasificacion y enrutamiento de decisiones en aplicaciones internas: el ajuste de decision del modelo base puede emplearse para elegir entre opciones predefinidas en flujos de trabajo, siempre validando con la model card original.
- Prototipado de asistentes con entrada de imagen: por ejemplo, extraer informacion de capturas o documentos escaneados y generar una respuesta textual en un mismo paso.
- Base para fine-tuning propio: al estar en safetensors y con licencia Apache-2.0, se puede partir de estos pesos para ajustes especificos sin restricciones de uso comercial.
- Archivado y auditoria de artefactos: el repositorio conserva licencias y ficheros auxiliares sin cambios, lo que facilita trazabilidad en auditorias de cadena de suministro de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision original (BF16/FP16): aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas para produccion: A100 40/80 GB, H100 o L40S para despliegues con concurrencia alta y contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con margen, y en RTX 3090, 4080 o 4070 Ti Super con cuantizacion. En GPUs de 8 GB requiere cuantizacion agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servido con batching, llama.cpp/Ollama si se generan conversiones GGUF a partir de los safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crabby-devil/zils-mini-piccolo-4b | 4,66 B | no disponible | imagen + texto | Apache-2.0 | HuggingFace (redistribucion) |
| agentscope-ai/Piccolo-4B (fuente) | 4,66 B | no disponible | imagen + texto | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | texto (segun datos disponibles) | no disponible en la informacion | HuggingFace |

La comparativa se limita a la genealogia del modelo porque no se dispone de datos de rendimiento ni de contexto de ninguna de las tres variantes. Frente a la fuente y a la base, la unica diferencia es la existencia de `zils-owner.json` y el contexto de publicacion en Bittensor; los pesos son identicos.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier mejora o regresion respecto a Piccolo-4B es exactamente la del original; no debe citarse como un modelo distinto en evaluaciones.
- La model card de este repositorio no documenta sesgos, tasas de alucinacion ni evaluaciones; hay que consultar la card de agentscope-ai/Piccolo-4B antes de usarlo en produccion.
- No se dispone de informacion sobre idiomas soportados, por lo que no se puede garantizar calidad en castellano ni en otros idiomas.
- El contexto maximo no esta documentado en los datos disponibles; asumir valores de la familia Qwen3.5 sin verificacion es arriesgado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo incorpora pesos derivados de Qwen3.5-4B; conviene revisar las condiciones de la base original y el THIRD_PARTY_LICENSES.md incluido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion comunitaria; la trazabilidad depende de la revision citada.
- El uso esta vinculado al ecosistema Zils/Bittensor subnet 127; fuera de ese contexto, la utilidad es la de un espejo del modelo fuente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/crabby-devil/zils-mini-piccolo-4b
- Modelo fuente: https://huggingface.co/agentscope-ai/Piccolo-4B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision de referencia: `35f5e464ef884d8720b53d12c7f8aaf5497a3644` (citada en la model card)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
