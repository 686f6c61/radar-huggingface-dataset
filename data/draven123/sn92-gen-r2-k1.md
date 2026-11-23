# draven123/sn92-gen-r2-k1

## Resumen

sn92-gen-r2-k1 es un modelo de tipo image-text-to-text publicado por el usuario draven123 en Hugging Face, derivado mediante fine-tuning del modelo base MachinePulseAI/karpo-decision-31B. Por los tags asociados (gemma4, reax, decision-model, bittensor-sn92) se trata de un ajuste orientado a tareas de decisión dentro del ecosistema de subredes de Bittensor, concretamente la subred 92, aunque la documentación pública del repositorio no detalla el proceso de entrenamiento ni los datos utilizados.

El modelo cuenta con 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) almacenados en formato safetensors, con un tamaño de repositorio de 62,6 GB, lo que sugiere pesos en precisión bf16 o fp16. La arquitectura declarada en los tags es gemma4, lo que apunta a una familia de transformers con capacidades multimodales de entrada imagen-texto, si bien no se especifica la longitud de contexto ni la composición del dataset de ajuste.

Su relevancia es limitada por el momento: no registra descargas ni interacciones, el acceso está restringido (gated) y no se han publicado resultados de benchmarks, ficha técnica detallada ni idiomas soportados. Resulta útil únicamente como referencia para quienes sigan el desarrollo de modelos de decisión en Bittensor SN92 o quieran evaluar fine-tunes sobre karpo-decision-31B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer multimodal image-text-to-text, segun tags) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se basa en la arquitectura gemma4 y que ha sido ajustado a partir de MachinePulseAI/karpo-decision-31B mediante fine-tuning. Los tags incluyen "reax" y "decision-model", lo que sugiere una especializacion en tareas de decision, probablemente dentro del contexto de la subred 92 de Bittensor (tag "bittensor-sn92"). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar.

Tampoco se detalla ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.). El repositorio no incluye model card con informacion sobre el proceso de entrenamiento, por lo que cualquier afirmacion sobre datos o metodos seria especulativa.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational".
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Orientacion a tareas de decision (tag "decision-model"), presumiblemente en el contexto de la subred 92 de Bittensor.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue mediante APIs compatibles con Transformers.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision avanzada o audio: no disponible mas alla de la entrada de imagen implicita en el pipeline.

## Casos de uso

- Evaluacion de modelos de decision en Bittensor SN92: el modelo puede utilizarse como candidato dentro de flujos de validacion o comparacion de decisiones en la subred 92, dado su tag explicito "bittensor-sn92" y su base karpo-decision-31B.
- Investigacion sobre fine-tuning multimodal: sirve como referencia para estudiar como se comporta un ajuste sobre karpo-decision-31B en tareas image-text-to-text, comparando con el modelo base.
- Prototipado de asistentes conversacionales con entrada de imagen: al ser image-text-to-text y conversacional, puede integrarse en demos que reciban una imagen y una consulta de texto y devuelvan una respuesta.
- Despliegue mediante endpoints compatibles: el tag "endpoints_compatible" permite servirlo a traves de infraestructuras de inferencia compatibles con Transformers, util para pruebas internas.
- Analisis de decisiones asistidas por imagen: en escenarios donde la decision dependa de informacion visual (por ejemplo, clasificacion o recomendacion a partir de una captura), el modelo puede emplearse como componente de un pipeline mayor.
- Base para nuevos fine-tunes: al estar licenciado bajo Apache 2.0 y disponible en safetensors, puede servir como punto de partida para ajustes posteriores en tareas de decision especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 32-35 GB (estimacion teorica a partir del numero de parametros; no confirmada por el autor).
- VRAM estimada en cuantizacion de 4 bits: en torno a 16-20 GB (estimacion teorica; no confirmada).
- GPU recomendadas: A100 80 GB, H100 80 GB o similares para precision completa; en cuantizacion podria caber en RTX 4090 (24 GB) con 4 bits, aunque no hay confirmacion.
- Cabe en GPU consumer: probablemente solo con cuantizacion agresiva (4 bits) en RTX 3090/4090 o equivalentes; no verificado.
- Opciones de despliegue: Transformers (libreria declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| draven123/sn92-gen-r2-k1 | 31,3 B | no disponible | Apache 2.0 | Gated en HF, 0 descargas | Fine-tune de karpo-decision-31B, orientado a SN92 |
| MachinePulseAI/karpo-decision-31B | ~31 B (modelo base) | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Gemma 3 (familia oficial) | 1B-27B | hasta 128K en algunas variantes | Gemma license | Publico en HF | Referencia arquitectonica de la familia gemma; no es un fine-tune de decision |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que se desconoce su calidad real frente al modelo base.
- El repositorio no incluye model card detallada: se desconoce el dataset de entrenamiento, el proceso de alineacion y los posibles sesgos.
- Riesgo de alucinacion no evaluado; al ser un fine-tune de decision, los errores pueden ser dificiles de detectar sin validacion externa.
- Idiomas soportados no declarados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto no disponible, lo que impide planificar su uso en tareas de contexto largo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su uso en produccion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base karpo-decision-31B, ya que podrian imponer restricciones adicionales.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- El tag "gemma4" no corresponde a una familia oficial publica de Google en el momento de redactar esta ficha; tratar la arquitectura como no confirmada.

## Enlaces

- Hugging Face: https://huggingface.co/draven123/sn92-gen-r2-k1
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Bittensor (subred 92): https://bittensor.com (referencia general del ecosistema; no se ha encontrado enlace especifico a SN92 en la informacion proporcionada)
