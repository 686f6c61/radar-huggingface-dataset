# 26B-Suite/Gemory-26B-A4B-SOMPOA

## Resumen

Gemory-26B-A4B-SOMPOA es un modelo de lenguaje multimodal orientado a escritura creativa, roleplay y narrativa sin restricciones, publicado por la organización 26B-Suite en HuggingFace. No es un modelo entrenado desde cero: se trata de una fusión (merge) del adaptador LoRA Gemory-26B-A4B-LORA de UltimateIntent sobre la base MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy, que a su vez deriva de una versión abliterated de Gemma 4. El resultado es un modelo MoE de 26B parámetros totales con aproximadamente 4B activos por token, lo que permite inferencia rápida manteniendo la capacidad de un modelo grande.

Su relevancia radica en el nicho de los modelos "uncensored" para roleplay: el autor documenta que, frente a la base Huihui QAT abliterated original (que mostraba negativas y cortes prematuros), esta combinación con la base SOMPOA elimina los rechazos y produce respuestas mucho más completas y estructuradas. El modelo se publica bajo licencia Apache 2.0 en formato safetensors, y existe una versión GGUF disponible en el repositorio de UltimateIntent. Está pensado para usuarios que ya conocen las implicaciones de los modelos abliterated y ajustan sus system prompts en consecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basado en Gemma 4 (transformer, multimodal image-text-to-text) |
| Parametros totales | 25.805.933.872 (~26B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar en safetensors; existe versión GGUF aparte) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 51,6 GB); GGUF disponible en UltimateIntent/Gemory-26B-A4B-GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 en configuración MoE (mixture of experts), con 26B de parámetros totales y unos 4B activados por token, lo que reduce sustancialmente el coste de inferencia frente a un modelo denso equivalente. Sobre esta arquitectura se aplican dos capas de modificación: primero, la base MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy, derivada de una variante abliterated (con las capas de rechazo neutralizadas) del modelo instruido QAT de Gemma 4; segundo, el adaptador LoRA UltimateIntent/Gemory-26B-A4B-LORA, fusionado sobre dicha base.

No hay datos publicados sobre el proceso de entrenamiento del LoRA (tokens, composición del dataset, RLHF/DPO) ni sobre la metodología "heretic"/"SOMPOA" empleada para la abliteration de la base. El pipeline declarado es text-generation, con tags multimodales (image-text-to-text) heredados de la familia Gemma 4, aunque la model card no documenta el comportamiento visual del merge.

## Capacidades

- Generación de texto narrativo y escritura creativa de larga extensión, con uso de formato estructurado.
- Roleplay conversacional multi-turno, incluyendo contenido violento o erótico explícito sin rechazos (según el autor).
- Cumplimiento alto ante peticiones normalmente bloqueadas: la model card documenta que produce guías completas de varios párrafos en lugar de negativas de una línea.
- Arquitectura MoE con ~4B parámetros activos: inferencia rápida para su clase de tamaño.
- Multimodalidad potencial (tags image-text-to-text de Gemma 4), aunque no documentada para este merge.
- Compatibilidad con la plantilla de chat de Gemma 4 (obligatoria según el aviso del autor).
- Soporte de tool calling, agentes o modo de razonamiento (thinking): no disponible / no evaluado (el autor indica que no comparó thinking vs no-thinking).

## Casos de uso

- Roleplay e interacción de personajes: el modelo está específicamente afinado para mantener conversaciones de rol inmersivas y persistentes, sin cortes prematuros de la narrativa.
- Escritura creativa sin filtros: generación de ficción con contenido maduro (violencia gráfica, erótico) para autores que trabajan géneros donde los modelos alineados se niegan o suavizan el texto.
- Ficción interactiva y novelas visuales: su naturaleza MoE ligera (~4B activos) permite respuestas ágiles en bucles de generación continua.
- Prototipado de agentes narrativos: como base uncensored para pipelines de generación de diálogos donde los rechazos romperían el flujo.
- Evaluación de técnicas de abliteration: sirve como caso de estudio comparando la base Huihui QAT frente a la base SOMPOA-heresy con el mismo LoRA.
- Uso local en entornos offline: disponible en GGUF para ejecutarse con llama.cpp u Ollama sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo en safetensors ocupa 51,6 GB, por lo que en precisión completa (BF16) se requieren ~52 GB de VRAM o descarga a RAM; en GGUF a 4 bits cabe en torno a 15-16 GB.
- GPUs recomendadas: para pesos completos, una A100 80GB, H100 o 2x RTX 3090/4090 con offload; para GGUF Q4, una RTX 3090/4090 de 24 GB es suficiente con margen para contexto.
- Consumer GPUs: viable en una RTX 4090 (24 GB) usando la versión GGUF cuantizada; no viable en 8-12 GB de VRAM salvo cuantizaciones agresivas con offload a CPU.
- Despliegue: transformers (formato nativo safetensors), llama.cpp y Ollama (vía GGUF de UltimateIntent); compatibilidad con vLLM o TGI no confirmada por el autor.
- Latencia y throughput: no disponible; la arquitectura MoE con ~4B activos sugiere latencias comparables a un modelo denso de ese tamaño activo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Licencia | Enfoque | Formato |
|---|---|---|---|---|---|
| Gemory-26B-A4B-SOMPOA | ~26B | ~4B | Apache 2.0 | Roleplay / escritura uncensored | safetensors, GGUF |
| MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy | ~26B | ~4B | no disponible | Base abliterated (sin LoRA Gemory) | safetensors |
| eadx/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated | ~26B | ~4B | no disponible | Base abliterated QAT (más rechazos) | safetensors |

Frente a sus dos bases, la ventaja documentada de Gemory-26B-A4B-SOMPOA es la combinación de la base SOMPOA (sin refusals) con el LoRA Gemory (estilo narrativo), obteniendo mayor cumplimiento y respuestas más largas que cualquiera de las piezas por separado.

## Limitaciones y advertencias

- Contenido explícito: el modelo puede generar narrativas violentas y eróticas gráficas sin restricciones; no es apto para entornos de producción orientados a público general ni para menores.
- Riesgo de alucinación: no disponible; al ser un merge abliterated sin documentación de evaluación, debe asumirse el riesgo estándar de la familia Gemma, posiblemente agravado por la eliminación de mecanismos de alineación.
- Idioma: declarado solo para inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Plantilla de chat: es obligatorio usar la plantilla de Gemma 4; el uso de otra plantilla puede degradar gravemente las salidas.
- Modo thinking: no evaluado por el autor (thinking vs no-thinking sin comparar).
- Sesgos: hereda los sesgos del corpus de Gemma 4 más los del LoRA Gemory, sin auditoría publicada.
- Licencia: Apache 2.0 permite uso comercial, pero los modelos base subyacentes pueden tener términos propios de Google que conviene revisar antes de desplegar comercialmente.
- Uso en producción: al ser un merge comunitario con 181 descargas y sin benchmarks, no hay garantías de estabilidad, coherencia a contexto largo ni seguridad; se recomienda moderación de salidas en cualquier despliegue accesible a terceros.

## Enlaces

- Modelo: https://huggingface.co/26B-Suite/Gemory-26B-A4B-SOMPOA
- README completo (versión GGUF): https://huggingface.co/UltimateIntent/Gemory-26B-A4B-GGUF?not-for-all-audiences=true
- LoRA Gemory: https://huggingface.co/UltimateIntent/Gemory-26B-A4B-LORA
- Base SOMPOA heresy: https://huggingface.co/MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy
- Base Huihui QAT abliterated: https://huggingface.co/eadx/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated
- Discusión con la idea del merge: https://huggingface.co/UltimateIntent/Gemory-26B-A4B-LORA/discussions/1
