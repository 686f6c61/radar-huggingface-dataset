# Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT-GGUF

## Resumen

Qwen3.5-0.8B-Jopara-Epoch-SFT-GGUF es un modelo de lenguaje de pequeno tamano (772.845.888 parametros, aproximadamente 0,8 mil millones) publicado por el usuario Capibara-LLM en Hugging Face. Se trata de una conversion a formato GGUF, realizada con la herramienta Unsloth, de un modelo base de la familia Qwen3.5 que ha pasado por un proceso de ajuste fino supervisado (SFT) y, segun la nomenclatura de los ficheros, tambien por entrenamiento continuo previo (CPT). El repositorio incluye pesos en BF16 para el proyector multimodal y una cuantizacion Q8_0, lo que sugiere que el modelo conserva capacidades de vision-lenguaje.

La relevancia de esta publicacion es limitada pero concreta: ofrece una variante GGUF de un modelo Qwen3.5 de 0,8B, un tamano que permite ejecucion en CPU y en GPUs de consumo, y que ademas incorpora un proyector multimodal (mmproj), algo poco habitual en modelos de esta escala. Esto lo hace interesante para experimentacion con modelos vision-lenguaje ligeros en entornos con recursos restringidos, usando llama.cpp o llama-mtmd-cli.

No obstante, la informacion disponible es muy escasa: no se especifican la licencia, los idiomas soportados, la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado el 2 de noviembre de 2026. Cualquier evaluacion en produccion deberia hacerse con cautela y validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun nomenclatura del modelo); vision-lenguaje con proyector multimodal (mmproj) |
| Parametros totales | 772.845.888 (aproximadamente 0,8B) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (para el proyector mmproj) y Q8_0; otros niveles GGUF no listados en la model card |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (generado con Unsloth); ficheros: `Qwen3.5-0.8B-Jopara-Epoch-CPT.BF16-mmproj.gguf` y `Qwen3.5-0.8B-Jopara-Epoch-CPT.Q8_0.gguf` |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y la indicacion de que se trata de un modelo vision-lenguaje. Por la nomenclatura de los ficheros (`Jopara-Epoch-CPT` y `SFT`), se deduce que el modelo paso por una fase de entrenamiento continuo (CPT, continued pre-training) seguida de un ajuste fino supervisado (SFT). El termino "Jopara" podria referirse a un dataset o variante linguistica concreta (el jopara es una mezcla de guarani y castellano hablada en Paraguay), pero esto no se confirma en la model card.

La conversion a GGUF se realizo con Unsloth, y el repositorio incluye un fichero `mmproj` en BF16, lo que indica que el modelo mantiene la torre de vision y el proyector multimodal para su uso con `llama-mtmd-cli`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Capacidades de vision-lenguaje: el repositorio incluye un proyector multimodal (`mmproj`) y la model card menciona el uso con `llama-mtmd-cli`, lo que permite procesar imagenes junto con texto.
- Compatibilidad con llama.cpp y llama-cpp, incluyendo el flag `--jinja` para plantillas de chat.
- Etiqueta `endpoints_compatible`, que sugiere compatibilidad con endpoints de inferencia (sin mas detalle).
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso, matematicas o codigo en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Experimentacion con modelos vision-lenguaje ligeros: al incluir un proyector multimodal y pesar menos de 1 GB en Q8_0, permite probar flujos de imagen-texto en portatiles o equipos sin GPU dedicada usando `llama-mtmd-cli`.
- Prototipado rapido de asistentes conversacionales en local: su tamano reducido permite iterar sobre plantillas de chat y prompts con `llama-cli --jinja` sin necesidad de infraestructura en la nube.
- Educacion e investigacion: util como modelo de referencia para estudiar el efecto del CPT y SFT en modelos de menos de 1B, y para comparar cuantizaciones GGUF en terminos de calidad y velocidad.
- Despliegue en entornos con recursos muy limitados: cabe en CPU y en GPUs de consumo, lo que permite integrarlo en dispositivos edge o en contenedores sin acelerador.
- Evaluacion de modelos derivados de Qwen3.5: sirve para comprobar como se comporta la familia Qwen3.5 en la escala de 0,8B tras ajuste fino, antes de invertir en variantes mayores.
- Pruebas de pipelines GGUF: permite validar tooling de llama.cpp (conversion, cuantizacion, plantillas Jinja) en un modelo pequeno antes de aplicarlo a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa aproximadamente 0,8-0,9 GB (772M parametros a 8 bits), mas el proyector mmproj en BF16 (tamano no especificado, pero pequeno en relacion al modelo). El repo completo pesa 1,0 GB.
- Cabe en CPU sin problema y en cualquier GPU de consumo con al menos 2 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4060, etc.).
- GPU recomendadas: no se requiere GPU dedicada; para vision-lenguaje conviene al menos una GPU con 4-8 GB para mantener latencia baja, aunque no hay datos oficiales.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, etc., siempre que soporten el proyector mmproj para multimodal).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Jopara-Epoch-SFT-GGUF | 772.845.888 | No disponible | No disponible | GGUF | Vision-lenguaje, SFT + CPT, publicado por Capibara-LLM |
| Qwen2.5-0.5B (referencia de la familia Qwen) | 494M | 32K (tipico en Qwen2.5) | Apache 2.0 (tipico en Qwen2.5) | safetensors, GGUF | Solo texto; no dispone de mmproj |
| Qwen2.5-VL-3B (referencia vision-lenguaje) | 3B | 32K (tipico) | Apache 2.0 (tipico) | safetensors, GGUF | Vision-lenguaje, mayor tamano y requiere mas VRAM |

Nota: los datos de los modelos comparativos son orientativos y pueden variar; no se dispone de benchmarks del modelo evaluado para una comparacion cuantitativa.

## Limitaciones y advertencias

- Informacion incompleta: no se especifican licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para uso comercial.
- Riesgo de alucinacion: inherente a modelos de 0,8B, especialmente en tareas de razonamiento y conocimiento factual.
- Capacidad limitada: con menos de 1B de parametros, el rendimiento en matematicas, codigo y razonamiento complejo sera previsiblemente bajo en comparacion con modelos mayores.
- Multimodalidad no verificada: aunque se incluye un fichero mmproj, no hay documentacion sobre la calidad o el alcance de las capacidades de vision.
- Repositorio sin traccion: cero descargas y cero likes, sin garantias de mantenimiento o soporte.
- Posible sesgo linguistico: el termino "Jopara" sugiere un enfoque en guarani-castellano, pero no se confirma; el comportamiento en otros idiomas es desconocido.
- Sin benchmarks: no hay evidencia publica de calidad, por lo que cualquier uso en produccion requiere evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT-GGUF
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
