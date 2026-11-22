# reaperdoesntknow/DistilQwen3-1.7B-uncensored

## Resumen

DistilQwen3-1.7B-uncensored es un modelo de generacion de texto derivado de Qwen3, desarrollado por el usuario independiente reaperdoesntknow bajo la etiqueta Convergent Intelligence LLC: Research Division. Se trata de un ajuste fino por instrucciones (SFT) sobre una cadena de destilacion: el modelo base declarado es reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B, que a su vez parece destilar conocimiento de un modelo MoE de mayor tamano (30B con 3B activos) hacia un denso de aproximadamente 2.000 millones de parametros. El sufijo "uncensored" indica que el autor ha eliminado o relajado las capas de alineamiento y rechazo del modelo original, orientandolo hacia respuestas sin filtrado de contenido.

El modelo cuenta con 2.031.739.904 parametros totales segun los pesos en safetensors, un repositorio de 4,1 GB y esta publicado en formato transformers con pesos safetensors. Su relevancia actual reside en la tendencia de modelos compactos (por debajo de 3B) destilados desde modelos mayores para despliegue en el edge, con bajo coste de inferencia y compatibilidad con text-generation-inference y endpoints compatibles con la API de OpenAI.

La model card publicada es practicamente una plantilla automatica de Hugging Face sin datos tecnicos cumplimentados: no detalla composicion del dataset, hiperparametros, licencia ni idiomas. Toda la informacion especifica disponible proviene de los metadatos del repositorio y de las etiquetas del autor. La ficha siguiente refleja esa escasez de datos de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), denso; detalles finos no disponibles |
| Parametros totales | 2.031.739.904 (aprox. 2,03B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3, valor exacto no confirmado) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors admite conversion a GGUF/AWQ/GPTQ, pero no se documentan variantes oficiales |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); repo de 4,1 GB |
| Modelo base | reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B |
| Metodo de ajuste | SFT (tag trl/sft) sobre cadena de destilacion |
| Descargas / likes | 2.152 descargas, 0 likes (a fecha de actualizacion del repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3 en configuracion densa de aproximadamente 2.000 millones de parametros, es decir, un transformer decoder-only con atencion causal estandar. El modelo no es MoE: los 2,03B parametros son todos activos en cada paso de inferencia. El nombre del modelo base (Qwen3-1.7B-Distilled-30B-A3B) sugiere que un MoE de 30B totales con 3B activos actuo como profesor en una fase previa de destilacion de conocimiento hacia este denso, y que posteriormente se aplico un SFT adicional con la libreria TRL para producir la variante "uncensored".

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, ni hiperparametros (precision, learning rate, epochs). La model card menciona un marco teorico denominado "Discrepancy Calculus (DISC)" con descomposicion medida-teorica de la distribucion del profesor (componentes AC, salto y Cantor) mediante una "Mesh Fundamental Identity", pero se trata de una descripcion conceptual del autor sin resultados empiricos publicados que permitan verificar su efecto. No hay innovaciones tecnicas documentadas mas alla de la propia cadena de destilacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de chat heredado de Qwen3.
- Razonamiento general y matematicas basicas a nivel de modelo de ~2B parametros.
- Generacion de codigo, presumiblemente con cobertura inferior a modelos mayores.
- Respuestas sin rechazo o filtrado de contenido (variante "uncensored"), incluyendo temas que los modelos alineados declinan.
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de OpenAI, lo que facilita integracion en aplicaciones existentes.
- Capacidades multilingues: no disponibles/documentadas; Qwen3 tiene cobertura multilingue amplia, pero no se confirma su preservacion tras la destilacion y el SFT.
- Tool calling / function calling: no documentado; no se puede garantizar.
- Modo thinking explicito: no documentado; Qwen3 lo incorpora, pero no se confirma en esta variante.
- Vision y audio: no disponibles.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas que los modelos alineados rechazan; el tamano compacto permite iterar rapidamente en local.
- Prototipado de chatbots de personaje: el modelo puede mantener conversaciones multi-turno con una persona definida, con bajo coste por token y despliegue en una sola GPU consumer.
- Investigacion sobre alineamiento y seguridad: util como contrapunto "uncensored" para estudiar diferencias de comportamiento, tasas de rechazo y derivas respecto a Qwen3 base en experimentos controlados.
- Generacion de datos sinteticos para aumentar datasets: produccion masiva de respuestas a bajo coste en pipelines de destilacion o aumento de datos, con revision humana posterior obligatoria.
- Inferencia en el edge o entornos con recursos limitados: 2,03B parametros caben en GPUs de 8-12 GB con cuantizacion de 4 bits, permitiendo ejecucion offline en portatiles o dispositivos embebidos.
- Servicio de completado de texto interno: integracion via endpoints compatibles con OpenAI en herramientas de autocompletado, resumencia o reescritura, donde el filtrado de contenido no es requisito.
- Experimentacion con destilacion: servir como punto de comparacion entre un denso de 2B destilado de un MoE de 30B y el profesor original para medir perdida de capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4-5 GB solo para pesos, mas KV cache; en la practica 6-8 GB para contextos moderados.
- Cuantizacion de 8 bits: aproximadamente 2,5-3 GB de pesos; cuantizacion de 4 bits: aproximadamente 1,5-2 GB, con margen amplio en GPUs de 8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para mayor throughput; cabe holgadamente en cualquier GPU consumer con 8 GB o mas en 4 bits.
- Despliegue: transformers nativo, text-generation-inference (soportado por tags), vLLM, llama.cpp/Ollama previa conversion a GGUF (no se distribuye GGUF oficial), y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles; para un denso de 2B en una RTX 4090 se puede esperar un throughput alto (cientos de tokens por segundo en batch), pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DistilQwen3-1.7B-uncensored (este) | 2,03B | no disponible | no disponible | SFT + destilacion, variante sin censura, autor individual |
| Qwen3-1.7B (oficial) | ~1,7B | amplio (familia Qwen3) | Apache 2.0 (familia Qwen3) | Modelo original alineado, con benchmarks publicados |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K aprox. | Apache 2.0 | Alternativa densa compacta con soporte amplio de ecosistema |
| Llama-3.2-1B-Instruct | ~1,2B | 128K | Llama 3.2 Community License | Muy compacto, restricciones de licencia para grandes usuarios |

La comparativa directa de rendimiento no es posible porque este modelo no publica benchmarks; la referencia natural es Qwen3-1.7B oficial, del que hereda arquitectura pero cuya licencia y terminos no se trasladan automaticamente a esta variante.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: sin dataset, hiperparametros, evaluaciones ni licencia declarada; no apto para produccion sin evaluacion propia previa.
- Licencia "no disponible": no se puede asumir uso comercial permitido; hay que contactar al autor antes de cualquier despliegue comercial.
- Variante "uncensored": mayor probabilidad de generar contenido toxico, ilegal o danino; requiere filtrado externo si se expone a usuarios finales.
- Riesgo elevado de alucinacion por tamano (2B) y por destilacion desde un MoE; verificar factualidad en cualquier uso sensible.
- Perdida de capacidades probable respecto a Qwen3-1.7B y al profesor de 30B: tool calling, razonamiento multi-paso y multilingueismo pueden estar degradados y no estan documentados.
- Idiomas y contexto no confirmados; no asumir la ventana de Qwen3 sin pruebas empiricas.
- Repositorio con 0 likes y autor individual: sin garantias de mantenimiento, versionado ni soporte.
- El marco "Discrepancy Calculus" citado en la model card no cuenta con validacion empirica publicada; tratarlo como descripcion conceptual, no como garantia de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Modelo base: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Perfil del autor / serie DistilQwen3: https://huggingface.co/reaperdoesntknow
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML citada: https://mlco2.github.io/impact
- Familia Qwen3 (referencia arquitectonica): https://huggingface.co/Qwen/Qwen3-1.7B
