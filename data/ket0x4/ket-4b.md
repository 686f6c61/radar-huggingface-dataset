# ket0x4/ket-4b

## Resumen

`ket0x4/ket-4b` es un ajuste fino (fine-tune) comunitario publicado por el usuario ket0x4 en Hugging Face, derivado directamente de `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`. Segun los metadatos del repositorio, se trata de un modelo multimodal de tipo image-text-to-text (acepta imagen y texto como entrada), etiquetado con la familia `gemma4` y entrenado con la libreria Unsloth junto con TRL de Hugging Face. El checkpoint se distribuye en formato `safetensors` para `transformers` y ocupa 16,0 GB en el repositorio.

El dato mas llamativo es la discrepancia entre el nombre comercial (`ket-4b`) y el recuento real de parametros obtenido de los safetensors: 7.996.156.490 (aproximadamente 8 mil millones). El sufijo "E4B" del modelo base sugiere una variante de la familia Gemma con un numero efectivo de parametros reducido, pero el autor no documenta ni la arquitectura interna ni el numero de parametros activos.

La relevancia practica de esta ficha es limitada y conviene decirlo con claridad: el modelo no incluye model card real (solo la plantilla autogenerada por Unsloth), no publica resultados de benchmarks, no declara el dataset de ajuste fino, no especifica la longitud de contexto y acumula 0 descargas y 0 "likes" en el momento de la consulta. Es, por tanto, un artefacto experimental de un autor individual, no un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (pipeline image-text-to-text); tags `gemma4`, `image-text-to-text`. Detalle interno no disponible |
| Parametros totales | 7.996.156.490 (~8B), segun metadatos de safetensors |
| Parametros activos | No disponible (no se confirma que sea MoE; el sufijo "E4B" del modelo base es la unica pista) |
| Longitud de contexto | No disponible (no declarada por el autor; dependera del modelo base) |
| Tipos de cuantizacion | El repositorio se publica en `safetensors` (repo de 16,0 GB, compatible con pesos de 16 bits). El modelo base se distribuyo en `bnb-4bit`. No se han publicado versiones GGUF, AWQ ni GPTQ de este fine-tune |
| Idiomas soportados | Ingles (`en`), segun el campo `language` de la model card |
| Licencia | Apache-2.0 (declarada por el autor; ver advertencias sobre la licencia del modelo base) |
| Formato de pesos | `safetensors` (libreria `transformers`) |

## Arquitectura y entrenamiento

El autor no aporta informacion sobre la arquitectura interna mas alla de los tags (`gemma4`, `image-text-to-text`), lo que implica un transformer decoder-only con capacidad de procesamiento de imagenes, presumiblemente heredado del modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`. El pipeline declarado en Hugging Face es `image-text-to-text`, por lo que el modelo integra un codificador visual junto al decodificador de lenguaje, aunque no se detalla ni el tipo de encoder ni la resolucion de imagen soportada.

En cuanto al entrenamiento, la unica informacion disponible es que se realizo con Unsloth y TRL, y que el autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, lo que indica el uso de LoRA o QLoRA sobre el modelo base. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni si el adaptador se fusiono (merged) con los pesos base. El repositorio de 16,0 GB para ~8B parametros es consistente con pesos fusionados en 16 bits (8B x 2 bytes = 16 GB), lo que sugiere que el adaptador se fusiono y se des-cuantizo desde el `bnb-4bit` original. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, thinking mode, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, segun los tags `conversational` y `text-generation-inference`.
- Procesamiento de imagenes junto a texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre contenido visual y tareas derivadas del pipeline declarado.
- Formato de chat instructivo heredado del modelo base (`-it`), es decir, preparado para dialogos multi-turno con plantilla de chat.
- Capacidad de razonamiento, codigo y matematicas: no documentada explicitamente para este fine-tune; dependera del modelo base y del dataset de ajuste.
- Tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): vision confirmada por el pipeline; audio y thinking mode no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un checkpoint de ~8B en `safetensors` compatible con `transformers`, se puede cargar con `AutoModelForVision2Seq`/`AutoProcessor` y probar un chatbot multi-turno sin infraestructura dedicada, aceptando que no hay garantias de calidad por falta de benchmarks.
- Descripcion automatica de imagenes para catalogos o accesibilidad: el pipeline image-text-to-text permite generar texto alternativo a partir de una imagen; util en prototipos internos donde el volumen es bajo y se revisa la salida manualmente.
- Extraccion de informacion de documentos escaneados en ingles: preguntas sobre recibos, formularios o capturas, con validacion posterior por reglas; adecuado solo en fase de experimentacion dado que no hay datos de robustez OCR.
- Base para experimentos de ajuste fino con Unsloth: el repositorio sirve como referenciaPractica de una receta LoRA/QLoRA sobre un modelo multimodal de ~8B, reutilizable para comparar hiperparametros o tecnicas de fusion de adaptadores.
- Evaluacion comparativa de fine-tunes comunitarios: util como muestra en estudios sobre calidad y trazabilidad de checkpoints publicados sin documentacion, midiendo cuanto se degrada o preserva el rendimiento del modelo base.
- Chatbot de soporte interno en ingles con contexto corto: desplegable con vLLM o TGI detras de una API compatible con OpenAI, siempre que se limite el alcance a preguntas frecuentes y se mantenga supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluacion, ni comparaciones con el modelo base. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (pesos del repo): ~16 GB solo para pesos, mas cache KV y activaciones; en la practica, 20-24 GB para contexto moderado.
- VRAM estimada en 8 bits: ~8-9 GB de pesos, con overhead adicional; manejable en GPUs de 16 GB.
- VRAM estimada en 4 bits: ~5-6 GB de pesos mas overhead del codificador visual; cabe en GPUs de 8-12 GB con contexto limitado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio en 16 bits; RTX 4090 (24 GB) para 16 bits con contexto contenido; RTX 4080/4070 Ti Super (16 GB) para 8 bits; RTX 3060 12 GB o RTX 4060 Ti 16 GB para 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 a 16 bits con contexto limitado, y en RTX 3060/4060 Ti a 4-8 bits.
- Opciones de despliegue: `transformers` (libreria declarada), TGI (tag `text-generation-inference`), vLLM para servicio en 16 bits con GPUs de 24 GB o mas. `llama.cpp`/Ollama requeriria convertir los pesos a GGUF, conversion que el autor no ha publicado.
- Latencia y throughput estimados: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de alternativas comparables en la informacion proporcionada. La unica comparacion documentable es con el propio modelo base:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmark |
|---|---|---|---|---|---|---|
| ket0x4/ket-4b | ~8B (7.996.156.490) | No disponible | en | Apache-2.0 (declarada) | safetensors | No disponible |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | No disponible | No disponible | No disponible | No disponible en la informacion | safetensors / bnb-4bit | No disponible |
| Otras alternativas de ~8B multimodales | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es la plantilla automatica de Unsloth; no hay descripcion de datos, hiperparametros ni metricas.
- Ausencia total de benchmarks: no es posible estimar la calidad del fine-tune ni el grado de degradacion respecto al modelo base.
- Dataset de ajuste fino desconocido: no se puede evaluar el riesgo de sesgos, de sobreajuste al estilo del autor ni de olvido catastrofico (catastrophic forgetting) en capacidades del modelo base.
- Solo ingles: el campo `language` declara unicamente `en`, por lo que no se recomienda su uso en castellano ni en entornos multilingues.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y agravado por la falta de evaluacion; en tareas visuales el riesgo se extiende a la descripcion erronea de contenido de la imagen.
- Longitud de contexto no declarada: cualquier uso con documentos largos requiere verificar experimentalmente el limite real.
- Posibles artefactos de cuantizacion: el modelo base era una version `bnb-4bit` y el fine-tune se publica en 16 bits, de modo que los pesos arrastran el error de la cuantizacion previa aunque se hayan des-cuantizado.
- Licencia: el autor declara Apache-2.0, pero el modelo base pertenece a la familia Gemma de Google, que habitualmente se distribuye bajo su propia licencia de uso con restricciones. Conviene verificar los terminos del modelo base antes de cualquier uso comercial.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta, autor individual sin repositorio de evaluacion asociado; no apto para produccion sin una validacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ket0x4/ket-4b
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Perfil del autor en Hugging Face: https://huggingface.co/ket0x4
- Perfil del autor en GitHub: https://github.com/ket0x4
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL de Hugging Face: https://github.com/huggingface/trl
- Proyecto de bot del autor (dave.ai / Ket.AI): https://github.com/ket0x4/dave.ai
