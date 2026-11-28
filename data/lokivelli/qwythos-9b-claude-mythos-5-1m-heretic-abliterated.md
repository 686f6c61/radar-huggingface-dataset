# Lokivelli/Qwythos-9B-Claude-Mythos-5-1M-heretic-abliterated

## Resumen

Qwythos-9B-Claude-Mythos-5-1M-heretic-abliterated es un modelo publicado por el usuario Lokivelli en Hugging Face, derivado mediante un proceso de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) sobre el modelo empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF. Con 9.409.813.744 parametros reales en pesos safetensors y un tamano de repositorio de 18,8 GB, se trata de un modelo de aproximadamente 9B de parametros orientado a tareas multimodales segun la etiqueta de pipeline image-text-to-image.

La model card publicada es practicamente vacia: solo contiene metadatos YAML con el modelo base y una referencia a una nueva version (fluffy12222/Qwythos-9B-Claude-Mythos-5-1M-heretic-abliterated). No se documenta licencia, idiomas, composicion del dataset de entrenamiento, metodo de alineacion ni resultados de evaluacion. El repositorio registra cero descargas y cero likes en el momento de la consulta.

Su relevancia es limitada y fundamentalmente experimental: se trata de un fine-tune comunitario sin documentacion tecnica verificable, por lo que cualquier evaluacion rigurosa exige inspeccion directa de los pesos y validacion empirica por parte del usuario. El nombre sugiere una ventana de contexto de 1M tokens (sufijo "1M"), aunque este dato no esta confirmado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de libreria: qwen3_5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre sugiere 1M, sin confirmar) |
| Tipos de cuantizacion | no disponible (el modelo base referenciado es GGUF; este repo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La etiqueta de libreria en Hugging Face es `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, pero no se confirma el tipo de transformer, el uso de atencion lineal, MoE ni ninguna innovacion concreta. El pipeline declarado es `image-text-to-image`, lo que apunta a capacidades multimodales de entrada imagen y texto con salida de imagen, aunque no hay documentacion que lo verifique.

El proceso de entrenamiento documentado se reduce a la relacion con el modelo base `empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF` y a la aplicacion de abliteration, una tecnica que identifica y sustrae direcciones de activacion asociadas a comportamientos de rechazo para reducir las negativas del modelo. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineacion.

## Capacidades

- Generacion de texto y razonamiento conversacional, asumiendo la herencia del modelo base Qwythos, sin verificacion documental.
- Procesamiento multimodal de imagen y texto segun la etiqueta de pipeline `image-text-to-image`, sin detalle sobre resoluciones, formatos o calidad.
- Comportamiento menos restrictivo en rechazos como consecuencia de la abliteration, con el consiguiente riesgo de respuestas inapropiadas.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio especificos: no disponible.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como objeto de estudio para medir como la eliminacion de direcciones de rechazo afecta a la utilidad, la coherencia y la seguridad en un modelo de 9B, comparando sus respuestas con las del modelo base sin modificar.
- Evaluacion de robustez y seguridad: util para construir suites de red-teaming que comprueben si el fine-tune comunitario mantiene salvaguardas minimas antes de considerarlo en cualquier despliegue.
- Experimentacion multimodal controlada: si se confirma la capacidad image-text-to-image, puede emplearse en prototipos de generacion o edicion de imagenes condicionada por texto, siempre en entornos aislados y con revision humana.
- Pruebas de inferencia local en hardware de consumo: con 9,4B de parametros y pesos safetensors de 18,8 GB, es viable cargarlo en GPUs de 24 GB en cuantizaciones de 8 bits o menores para experimentos de laboratorio.
- Generacion de texto creativo sin filtros: escenario tipico de los modelos abliterated, util para escritura de ficcion o guiones donde el modelo base aplicaria rechazos, con la advertencia de que la calidad no esta validada.
- Base para nuevos fine-tunes comunitarios: al estar publicado en safetensors, puede servir como punto de partida para ajustes posteriores con LoRA o QLoRA en tareas especificas, asumiendo el coste de validar su comportamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV, lo que exige GPUs de 24 GB o superiores en la practica.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB de pesos, viable en RTX 4080/4090 (16-24 GB).
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB de pesos, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs con 8 GB ajustando el contexto.
- GPUs recomendadas para produccion: A100 40/80 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 para experimentacion en BF16.
- Si cabe en GPU de consumo: si, en cuantizaciones de 4 y 8 bits en RTX 3090, RTX 4090, RTX 4080 y RTX 3060 12 GB.
- Opciones de despliegue: vLLM y TGI para safetensors en FP16/BF16; llama.cpp y Ollama requieren conversion previa a GGUF, no incluida en este repositorio; transformers como via directa de carga.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lokivelli/Qwythos-9B-Claude-Mythos-5-1M-heretic-abliterated | 9,41B | no disponible | no disponible | safetensors | Abliterated, sin documentacion |
| empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF | ~9B | no disponible | no disponible | GGUF | Modelo base del que deriva |
| fluffy12222/Qwythos-9B-Claude-Mythos-5-1M-heretic-abliterated | ~9B | no disponible | no disponible | no disponible | Version referenciada como nueva_version |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre dataset, metodo de entrenamiento, evaluacion ni limitaciones declaradas por el autor.
- Licencia no especificada: no puede confirmarse el uso comercial ni la redistribucion; en ausencia de licencia explicita, debe asumirse reserva de derechos por defecto.
- La abliteration elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado sin salvaguardas.
- Riesgo elevado de alucinacion y de comportamiento impredecible al no existir evaluaciones publicadas.
- Idiomas soportados desconocidos; no se garantiza un rendimiento correcto en castellano.
- La etiqueta `image-text-to-image` no esta respaldada por documentacion; la capacidad multimodal real debe verificarse empiricamente.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- El repositorio tiene 18,8 GB en safetensors, lo que complica el despliegue en entornos con VRAM limitada sin cuantizacion adicional.
- No recomendado para produccion sin una evaluacion de seguridad y calidad independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lokivelli/Qwythos-9B-Claude-Mythos-5-1M-heretic-abliterated
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF
- Nueva version referenciada: https://huggingface.co/fluffy12222/Qwythos-9B-Claude-Mythos-5-1M-heretic-abliterated
