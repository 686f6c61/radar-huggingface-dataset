# AGCobra/Capital-Label-Synthetic-Qwen3.6-35B-A3B

## Resumen

Capital Label Synthetic — Qwen3.6 35B-A3B es un adaptador LoRA de tipo PEFT desarrollado por AGCobra sobre el modelo base Qwen/Qwen3.6-35B-A3B. Su propósito es especializar un modelo multimodal (image-text-to-text) en la extracción estructurada de etiquetas a partir de documentos financieros multipágina, devolviendo la supervisión en formato JSON. El adaptador se entrenó durante tres épocas en BF16 sobre los pesos del modelo base sin cuantizar.

El modelo resuelve un problema concreto de automatización documental: procesar notificaciones financieras de varias páginas y extraer sus campos etiquetados de forma determinista y consistente. Para ello se emplearon 926 documentos (136 reales y 790 sintéticos con partes ficticias), con un split de test de 24 documentos exclusivamente reales. El repositorio incluye el adaptador LoRA, el procesador, el fichero `instruction.txt` exacto que debe usarse como instrucción de usuario y las estadísticas de entrenamiento.

La relevancia actual del modelo radica en su enfoque de despliegue dual: por un lado el adaptador PEFT original y, por otro, una versión fusionada con el modelo base y cuantizada en Q4_K_M junto con un proyector multimodal F16, lo que permite ejecutar la extracción documental en entornos con llama.cpp. La licencia es Apache 2.0, aunque el modelo base Qwen3.6 35B-A3B mantiene su propia licencia que debe respetarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3.6 35B-A3B con proyector de visión |
| Parametros totales | 34.660.610.688 (modelo base fusionado; el adaptador LoRA en sí tiene un número de parámetros no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | al menos 16.384 tokens recomendados para inferencia GGUF; contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF fusionado) y proyector mmproj en F16; adaptador LoRA en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (adaptador); licencia del modelo base Qwen3.6 35B-A3B no disponible en la información proporcionada |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q4_K_M + mmproj F16) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.6-35B-A3B en su revisión `995ad96eacd98c81ed38be0c5b274b04031597b0`, un modelo multimodal de tipo image-text-to-text. El entrenamiento consistió en tres épocas de LoRA en BF16 sobre los pesos base sin cuantizar. El pipeline de entrenamiento empleó la configuración `synthetic` del dataset `AGCobra/LFM-Finance-Dataset` (revisión `c574f30a417db54c81b4a9da1df65f612a12e8ad`), con 926 documentos: 136 reales y 790 notificaciones sintéticas con partes ficticias. El split de test de 24 documentos contiene únicamente documentos reales.

La supervisión del asistente se limita a JSON más el token `<|im_end|>`. El entrenamiento exige usar todas las páginas del documento en orden, la instrucción exacta de `instruction.txt` y la plantilla de chat del procesador guardado con `enable_thinking=False` y `add_generation_prompt=True`. No se deben reducir las páginas a miniaturas. La conversión a GGUF se realizó con llama.cpp en el commit `e56f006`, fusionando el adaptador de tres épocas con el modelo base y cuantizando a Q4_K_M; el proyector incluye los pesos de visión entrenados. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Extracción estructurada de etiquetas documentales en formato JSON a partir de notificaciones financieras multipágina.
- Procesamiento multimodal image-text-to-text: acepta páginas de documento como imágenes y texto de instrucción.
- Manejo de documentos multipágina manteniendo el orden de las páginas y sin reducirlas a miniaturas.
- Extracción determinista con temperatura 0, adecuada para pipelines de producción.
- Modo sin thinking (`enable_thinking=False`) alineado con el entrenamiento, tanto en la plantilla del procesador como en la plantilla de chat embebida en el GGUF.
- Despliegue mediante PEFT (adaptador sobre el modelo base) o mediante llama.cpp con GGUF fusionado y proyector F16.
- No se dispone de información sobre soporte de tool calling, agentes, multi-step reasoning ni capacidades multilingües específicas.

## Casos de uso

- Extracción de campos en notificaciones financieras: el modelo recibe todas las páginas escaneadas en orden junto con `instruction.txt` y devuelve un JSON con las etiquetas, lo que permite automatizar la digitalización de expedientes bancarios o de seguros.
- Procesamiento por lotes de documentación regulatoria: con temperatura 0 y contexto de al menos 16.384 tokens, se puede ejecutar la extracción de forma reproducible en pipelines nocturnos sobre grandes volúmenes de PDF convertidos a imagen.
- Validación y enriquecimiento de bases de datos: los JSON extraídos se pueden comparar con registros existentes para detectar discrepancias en campos como importes, fechas o partes intervinientes.
- Despliegue en entornos con recursos limitados: la versión GGUF Q4_K_M junto con el mmproj F16 permite ejecutar el modelo en infraestructura con llama.cpp sin necesidad de GPUs de gran memoria, manteniendo la capacidad de visión.
- Prototipado rápido de pipelines documentales: el adaptador PEFT se puede cargar sobre el modelo base Qwen3.6 35B-A3B en BF16 para experimentar con nuevas instrucciones o documentos antes de pasar a producción.
- Auditoría de extracciones: al conservarse las estadísticas de entrenamiento y el dataset con páginas e etiquetas originales, el modelo sirve como base para reproducir y auditar los resultados de extracción en el split de test real.
- Generación de datos sintéticos de entrenamiento: la configuración `synthetic` del dataset, con 790 notificaciones ficticias, puede reutilizarse para ampliar el entrenamiento de adaptadores similares en otros dominios documentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA PEFT requiere cargar el modelo base Qwen3.6 35B-A3B en BF16, lo que implica aproximadamente 69 GB solo en pesos (34.660.610.688 parámetros × 2 bytes), más el proyector de visión y el coste de activaciones y KV cache.
- La versión GGUF Q4_K_M reduce el peso del modelo a una fracción del tamaño BF16; el repositorio completo ocupa 25,9 GB, incluyendo adaptador, procesador, GGUF y estadísticas.
- Para el adaptador en BF16 se recomiendan GPUs de centro de datos como A100 80 GB o H100 80 GB; no cabe en GPUs de consumo de 24 GB en BF16.
- La versión GGUF Q4_K_M con mmproj F16 está pensada para llama.cpp y puede ejecutarse en configuraciones con memoria más limitada, aunque no se dispone de cifras concretas de VRAM mínima ni de GPUs de consumo verificadas.
- Opciones de despliegue: PEFT sobre el modelo base, llama.cpp (commit e56f006 o posterior) con los dos ficheros GGUF, y ecosistema Unsloth para el adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Qwen/Qwen3.6-35B-A3B sería la referencia natural, pero no se han facilitado sus especificaciones completas (contexto máximo, licencia, benchmarks) para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Capital Label Synthetic — Qwen3.6 35B-A3B | 34.660.610.688 (base fusionado) | al menos 16.384 (recomendado) | Apache 2.0 (adaptador) | safetensors PEFT, GGUF Q4_K_M | Especializado en extracción documental financiera |
| Qwen/Qwen3.6-35B-A3B (base) | 34.660.610.688 | no disponible | no disponible | safetensors | Modelo base multimodal sin especializar |
| Alternativas de extracción documental | no disponible | no disponible | no disponible | no disponible | No se dispone de datos |

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para extracción de etiquetas de notificaciones financieras; su uso fuera de ese dominio puede degradar la calidad de forma notable.
- Las 790 notificaciones sintéticas empleadas en entrenamiento contienen partes ficticias y no deben presentarse como documentos reales en ningún contexto.
- El split de test contiene solo 24 documentos reales, por lo que la evaluación de generalización es limitada.
- Es obligatorio usar la instrucción exacta de `instruction.txt`, la plantilla de chat del procesador con `enable_thinking=False` y `add_generation_prompt=True`, y adjuntar todas las páginas en orden; desviarse de este protocolo puede producir salidas incorrectas.
- No se deben reducir las páginas a miniaturas: el proyector conserva los límites de imagen del procesador de entrenamiento.
- Riesgo de alucinación en campos no presentes o ilegibles en el documento; se recomienda validación posterior de los JSON extraídos.
- No se dispone de información sobre sesgos, cobertura idiomática ni comportamiento multilingüe.
- La licencia Apache 2.0 aplica al adaptador; el uso comercial debe verificar además la licencia del modelo base Qwen3.6 35B-A3B, no disponible en la información proporcionada.
- Los derechos de los documentos fuente originales permanecen con sus propietarios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/AGCobra/Capital-Label-Synthetic-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/AGCobra/LFM-Finance-Dataset
- Commit de llama.cpp usado para la conversión GGUF: https://github.com/ggml-org/llama.cpp/commit/e56f006ed6b416ae8b7ccb5243b204743f09df1e
- Ficheros GGUF en el repositorio: Capital-Label-Synthetic-Qwen3.6-35B-A3B-Q4_K_M.gguf y mmproj-Capital-Label-Synthetic-Qwen3.6-35B-A3B-F16.gguf
