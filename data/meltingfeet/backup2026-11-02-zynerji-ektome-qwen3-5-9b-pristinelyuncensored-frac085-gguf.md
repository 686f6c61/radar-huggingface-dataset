# meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.5-9B-PristinelyUncensored-frac085-GGUF

## Resumen

Backup2026-11-02-Zynerji-Ektome-Qwen3.5-9B-PristinelyUncensored-frac085-GGUF es una cuantizacion en formato GGUF de un modelo de lenguaje de aproximadamente 9 mil millones de parametros, derivado a su vez de la familia Qwen3.5. El artefacto lo publica el usuario meltingfeet en Hugging Face y esta pensado para su uso con llama.cpp y entornos compatibles con endpoints. Se trata de un modelo de tipo "uncensored", es decir, con las capas de rechazo y alineacion relajadas o eliminadas respecto al modelo base original, lo que lo orienta a experimentacion y a casos donde el filtrado de seguridad estandar resulta limitante.

El modelo base declarado es Zynerji/Ektome-Qwen3.5-9B-PristinelyUncensored-frac085, un fine-tuning sobre Qwen3.5-9B. La nomenclatura "frac085" sugiere un ajuste con una fraccion de datos o un ratio de mezcla del 85 por ciento, aunque no se dispone de documentacion tecnica que lo confirme. El repositorio incluye la etiqueta "vision", lo que apunta a capacidades multimodales heredadas del modelo base, si bien no hay ficha tecnica que lo verifique.

La relevancia de esta publicacion es limitada y muy especifica: se trata de un backup con cero descargas y cero likes en el momento de la consulta, con acceso restringido (gated) que obliga a aceptar condiciones en Hugging Face. Su interes practico reside en disponer de una version cuantizada en GGUF de un modelo de 9B con licencia Apache 2.0, lo que facilita su despliegue en hardware de consumo mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo base Zynerji/Ektome-Qwen3.5-9B-PristinelyUncensored-frac085. Por la denominacion y el tamano (8,95B parametros), se infiere una arquitectura transformer decoder-only tipica de la familia Qwen3.5, pero no hay datos publicados sobre numero de capas, dimensiones ocultas, mecanismos de atencion (GQA, atencion lineal o similar) ni sobre la ventana de contexto nativa.

Respecto al entrenamiento, el sufijo "PristinelyUncensored" indica un proceso de fine-tuning orientado a eliminar el comportamiento de rechazo del modelo alineado original, presumiblemente mediante ajuste supervisado sobre un dataset filtrado para evitar respuestas evasivas. El termino "frac085" no esta documentado y podria referirse a la fraccion de datos utilizada o a un hiperparametro de mezcla. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa. El artefacto publicado es unicamente una conversion a GGUF del modelo base, sin entrenamiento adicional.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento y generacion de codigo: capacidades heredadas de Qwen3.5-9B, aunque no documentadas explicitamente en esta ficha.
- Posible soporte de vision: el repositorio incluye la etiqueta "vision", lo que sugiere entrada de imagenes, si bien no hay confirmacion tecnica ni ejemplos de uso.
- Comportamiento "uncensored": el modelo evita los rechazos sistematicos del modelo alineado, lo que permite generar contenido que el Qwen3.5 original declinaria.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante APIs compatibles con el esquema de Hugging Face o OpenAI.
- Soporte de tool calling y function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponibles (no se especifican idiomas).

## Casos de uso

- Experimentacion con modelos sin alineacion: investigadores que estudian el comportamiento de modelos "uncensored" pueden usar esta version GGUF para comparar respuestas frente al Qwen3.5-9B alineado, ejecutandola en local con llama.cpp.
- Despliegue en hardware de consumo: al estar en formato GGUF, permite ejecutar un modelo de 9B en GPU consumer (por ejemplo, RTX 4090 o 3090) o incluso en CPU con cuantizaciones bajas, sin necesidad de infraestructura de datacenter.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles que los modelos alineados rechazan, aprovechando la naturaleza "uncensored" del fine-tuning.
- Prototipado de chatbots conversacionales: la etiqueta "conversational" y la compatibilidad con endpoints permiten montar rapidamente un servicio de chat multi-turno para pruebas internas.
- Investigacion sobre seguridad y jailbreaks: analisis de como se comporta un modelo sin capas de rechazo ante prompts adversarios, util para estudiar riesgos y disenar mitigaciones.
- Evaluacion de pipelines llama.cpp: servir como banco de pruebas para medir throughput y latencia de un modelo 9B cuantizado en distintos backends (llama.cpp, Ollama, servidores compatibles con OpenAI).
- Fine-tuning posterior: al tener licencia Apache 2.0 y pesos abiertos, puede servir como punto de partida para ajustes adicionales en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 8,95B parametros en GGUF, una cuantizacion Q4_K_M ocupa aproximadamente 5-6 GB; Q8_0 rondaria los 9-10 GB; FP16 requeriria unos 18 GB. El repositorio completo pesa 6,6 GB, lo que sugiere cuantizaciones de 4-6 bits.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones altas con contexto amplio; RTX 4070 Ti / 4080 (12-16 GB) para Q4-Q5; GPUs de 8 GB pueden ejecutar cuantizaciones Q4 con contexto reducido.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas, usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (tras importar el GGUF), servidores compatibles con la API de OpenAI (por la etiqueta endpoints_compatible), y potencialmente LM Studio.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Ektome-Qwen3.5-9B GGUF) | 8,95B | no disponible | Apache 2.0 | GGUF | Fine-tuning uncensored, acceso gated |
| Qwen3.5-9B (base original) | ~9B | no disponible | no disponible | safetensors | Modelo alineado de referencia |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Alternativa alineada de tamano similar |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa abierta y ampliamente soportada |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Ektome ni de su contexto real, por lo que la comparacion se limita a tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminacion de capas de rechazo implica un riesgo elevado de generar contenido danino, ilegal o sexualmente explicito; no es apto para aplicaciones de cara al publico sin filtros adicionales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado y su distribucion.
- Cero adopcion: el repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad ni reportes de calidad.
- Falta de documentacion: no hay ficha tecnica, model card detallada, benchmarks ni informacion sobre contexto, idiomas o datos de entrenamiento.
- Riesgo de alucinacion: al no haber evaluaciones publicadas, se desconoce la tasa de alucinacion; los fine-tunings uncensored suelen degradar la fiabilidad factual.
- Licencia Apache 2.0: permite uso comercial, pero el publicador original del fine-tuning (Zynerji) no ofrece garantias; conviene verificar la cadena de licencias del modelo base Qwen3.5.
- Idiomas: no se especifican; el soporte multilingue es incierto.
- Posible soporte de vision no verificado: la etiqueta "vision" no viene acompanada de documentacion ni ejemplos, por lo que no debe asumirse en produccion.
- Fecha de creacion futura (2026-11-02): el repositorio parece un backup programado o una publicacion con metadatos anomalos, lo que resta credibilidad a su mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.5-9B-PristinelyUncensored-frac085-GGUF
- Modelo base: https://huggingface.co/Zynerji/Ektome-Qwen3.5-9B-PristinelyUncensored-frac085
- llama.cpp (backend de inferencia): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue): https://ollama.com
- Documentacion de Qwen (familia base): https://huggingface.co/Qwen
