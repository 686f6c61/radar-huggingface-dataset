# CharlieBT/kd31-skillpack-t1x

## Resumen

CharlieBT/kd31-skillpack-t1x es un ajuste fino (fine-tune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario CharlieBT en Hugging Face. Se presenta como un "skillpack" orientado a clasificación de texto, aunque los tags del repositorio incluyen también image-text-to-text y la arquitectura declarada es gemma4, lo que sugiere que el modelo base es multimodal y este ajuste reorienta parte de sus capacidades hacia tareas de clasificación. Cuenta con 31.273.088.876 parámetros en formato safetensors (aproximadamente 31,3 mil millones) y un tamaño de repositorio de 62,6 GB.

El modelo es relevante por dos motivos: por un lado, se apoya en un base model de la familia Gemma 4 con etiqueta `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de inferencia gestionadas; por otro, su licencia Apache 2.0 permite uso comercial sin las restricciones adicionales que suelen acompañar a los modelos Gemma originales. No obstante, el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face antes de poder descargarlo.

La información pública disponible es muy limitada: no se han publicado idiomas soportados, resultados de benchmarks, detalles del dataset de ajuste ni documentación sobre el proceso de entrenamiento. Esta ficha se limita, por tanto, a los datos verificables del repositorio y a las inferencias razonables a partir de la arquitectura declarada, marcando explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer multimodal, segun tag del repositorio) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modalidades | image-text-to-text (segun tags) |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Tamano del repositorio | 62,6 GB |
| Acceso | restringido (gated) |
| Compatibilidad endpoints | si (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

El modelo se construye sobre MachinePulseAI/karpo-decision-31B, cuyo tag de arquitectura es `gemma4`. Esto implica un transformer decoder-only de la familia Gemma 4, con aproximadamente 31,3 mil millones de parametros y capacidad multimodal (image-text-to-text). El ajuste publicado por CharlieBT se etiqueta como `skillpack-t1x`, lo que sugiere un entrenamiento orientado a dotar al modelo base de una habilidad especifica (en este caso, clasificacion de texto) sin reentrenar desde cero.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la longitud de contexto nativa ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Tampoco se documenta si el ajuste congela capas del base model o si se trata de un fine-tune completo; el tamano del repositorio (62,6 GB para 31,3 B de parametros) es consistente con pesos en bf16/fp16 completos, lo que apunta a un fine-tune de todos los parametros o a la publicacion del modelo completo tras el ajuste.

## Capacidades

- Clasificacion de texto: pipeline principal declarado en el repositorio.
- Procesamiento image-text-to-text: heredado del base model Gemma 4 segun los tags.
- Generacion de texto y razonamiento: capacidad esperable del base model de 31 B, aunque no confirmada explicitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, vision, audio): vision probable por el tag image-text-to-text; el resto no disponible.

## Casos de uso

- Clasificacion de documentos en pipelines de ingestion: el modelo puede etiquetar textos (categorias, sentimiento, intent) en flujos ETL o de moderacion, aprovechando su pipeline text-classification y su ventana de contexto (no documentada) para procesar documentos de longitud media.
- Moderacion de contenido multimodal: al heredar la capacidad image-text-to-text del base model, puede clasificar publicaciones que combinen imagen y texto, por ejemplo en foros o redes sociales.
- Enrutamiento de tickets de soporte: clasificar consultas entrantes por categoria o urgencia antes de derivarlas a un agente humano o a un sistema automatizado.
- Extraccion de senales en analitica de opiniones: clasificar resenas de producto o comentarios de clientes para alimentar dashboards de sentimiento y temas.
- Etiquetado asistido para curación de datasets: usar el modelo para preetiquetar grandes volumenes de datos que luego se revisan manualmente, acelerando la construccion de corpus supervisados.
- Filtrado previo en sistemas RAG: clasificar la relevancia de fragmentos recuperados antes de pasarlos al generador, reduciendo ruido y coste de inferencia.
- Clasificacion de imagenes medicas o industriales con contexto textual: en escenarios donde la etiqueta depende conjuntamente de una imagen y un texto asociado (informe, pie de foto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-64 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 80 GB por GPU para contexto corto.
- Cuantizacion a 8 bits: ~32 GB de pesos, viable en una A100 40 GB o H100 40 GB con margen limitado.
- Cuantizacion a 4 bits: ~16-18 GB de pesos, viable en RTX 4090 (24 GB) o RTX A6000 (48 GB) para contextos moderados.
- GPU recomendadas: H100 80 GB, A100 80 GB, L40S 48 GB (con cuantizacion), RTX 4090 24 GB (solo con cuantizacion 4 bits y contexto reducido).
- Despliegue: al ser un modelo transformers con pesos safetensors y tag `endpoints_compatible`, es compatible con Hugging Face Inference Endpoints, TGI y vLLM; llama.cpp/Ollama requeririan conversion a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-skillpack-t1x | 31,3 B | no disponible | Apache 2.0 | gated | Fine-tune de clasificacion sobre base Gemma 4 |
| MachinePulseAI/karpo-decision-31B (base) | ~31 B | no disponible | no disponible | no disponible | Modelo base del que deriva este ajuste |
| Gemma 2 27B (referencia de la familia) | 27 B | 8K (tipico) | Gemma license | abierto | Alternativa de tamano similar; contexto y licencia distintos |
| Qwen2.5 32B (referencia) | 32,5 B | 128K | Apache 2.0 | abierto | Alternativa Apache 2.0 de tamano comparable, sin capacidad de vision nativa |

La comparativa con Gemma 2 27B y Qwen2.5 32B es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Documentacion practicamente inexistente: sin model card detallada, sin idiomas declarados, sin benchmarks y sin descripcion del dataset de ajuste.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; en tareas de clasificacion puede producir etiquetas fuera del conjunto esperado si no se restringe la salida.
- Sesgos: no documentados; al derivar de un base model de gran escala, es probable que herede sesgos de sus datos de preentrenamiento, pero no hay evaluacion publicada.
- Limitaciones de contexto e idioma: desconocidas; no debe asumirse soporte multilingue ni una ventana de contexto concreta sin verificacion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el base model (MachinePulseAI/karpo-decision-31B) no imponga restricciones adicionales que prevalezcan sobre la licencia del ajuste.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Uso en produccion: se recomienda evaluacion propia con un conjunto de validacion antes de desplegar, dado que no existen benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-t1x
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
