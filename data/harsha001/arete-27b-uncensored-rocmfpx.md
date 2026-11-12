# Harsha001/Arete-27B-Uncensored-ROCmFPX

## Resumen

Arete-27B-Uncensored-ROCmFPX es una colección de pesos cuantizados en formato GGUF del modelo SargeDev/Arete-27B-Uncensored, un fine-tune completo de Qwen3.8-27B al que se le ha eliminado la dirección de rechazo mediante la técnica OBLITERATUS y al que se le ha añadido la cabeza de predicción multi-token (MTP) original de Qwen3.8. El modelo original procede de NousResearch/Arete-27B, un fine-tune alineado en valores sobre la base de Qwen, de 27.320.697.856 parámetros totales. La versión que nos ocupa ha sido publicada por el usuario Harsha001 con cuantizaciones optimizadas para hardware AMD (ROCmFPX), incluyendo tipos de 8 y 6 bits que requieren un fork específico de llama.cpp.

El interés de esta ficha reside en dos frentes: por un lado, la cuantización ROCmFPX busca reducir el error de divergencia KL respecto a BF16 manteniendo un tamaño inferior al de las cuantizaciones estándar de llama.cpp; por otro, el modelo base es una variante "abliterated" sin entrenamiento de seguridad, lo que lo hace inadecuado para despliegues de cara al usuario final sin capas de moderación propias. El repositorio ocupa 67,6 GB e incluye tres archivos GGUF con distintos compromisos de tamaño y fidelidad.

La relevancia actual es doble: demuestra el estado del arte en cuantización para GPUs AMD (un ecosistema tradicionalmente menos atendido que el de NVIDIA) y ofrece una alternativa de 27B con contexto y capacidades heredadas de Qwen3.8, aunque con las advertencias legales y éticas propias de un modelo sin alineamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-27B) con cabeza MTP de una capa añadida |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (ROCmFPX), Q6_0 (ROCmFPX), Q4_K_M (llama.cpp estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.8-27B, un transformer decoder-only denso de 27.320.697.856 parámetros. Sobre esa base, NousResearch/Arete-27B aplicó un fine-tune completo alineado en valores; posteriormente SargeDev eliminó la dirección de rechazo con OBLITERATUS (una técnica de abliteration que proyecta fuera del espacio de activaciones la dirección asociada a las negativas a responder) y reincorporó la cabeza de predicción multi-token (MTP) de una capa del Qwen3.8 original, pensada para decodificación especulativa y aceleración de la generación. Los detalles sobre el volumen de tokens de entrenamiento, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada.

La aportación técnica de esta publicación concreta es la cuantización ROCmFPX, orientada a GPUs AMD (y compatible con Vulkan/Strix Halo). Según las mediciones del autor, el archivo Q8_0 ROCmFPX (28,3 GB) presenta una divergencia KL de 0,00030 frente a BF16 y mantiene el mismo token top en el 99,2% de los casos, superando al Q8_0 estándar (29,0 GB, KL 0,00038, 99,1%). En 6 bits, ROCmFPX (22,5 GB, KL 0,0021, 97,6%) queda muy cerca del Q6_K estándar (22,4 GB, KL 0,0024, 97,9%). En 4 bits, en cambio, el Q4_K_M estándar resultó mejor (16,8 GB, KL 0,016, 94,7%) que la variante ROCmFPX de 4 bits (19,2 GB, KL 0,021, 93,6%), por lo que se incluyó el archivo estándar. Las mediciones se hicieron con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en una NVIDIA GB10 tras expandir cada archivo a F16.

## Capacidades

- Generación de texto conversacional y razonamiento: hereda las capacidades del Qwen3.8-27B subyacente.
- Modo de razonamiento ("thinking"): los ejemplos del autor muestran respuestas correctas tras un bloque de pensamiento (por ejemplo, "17 x 23 = 391" y "Canberra" como capital de Australia).
- Generación de código y matemáticas: capacidad heredada del modelo base, sin datos de benchmark disponibles en esta ficha.
- Respuesta sin rechazo: la abliteration elimina el comportamiento de negativa, por lo que el modelo puede cumplir solicitudes que un modelo con entrenamiento de seguridad rechazaría.
- Decodificación especulativa: incluye la cabeza MTP de una capa añadida por SargeDev, aunque el autor indica que no ha sido probada.
- Multilingüismo: limitado a inglés según la model card (`language: [en]`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando su comportamiento con el de Arete-27B original, útil para analizar direcciones de rechazo y su impacto en la utilidad de las respuestas.
- Evaluación de técnicas de cuantización en hardware AMD: los archivos ROCmFPX permiten medir empíricamente la calidad (KL, coincidencia de token top) y el rendimiento en GPUs AMD y en plataformas Strix Halo, un nicho con poca cobertura en el ecosistema GGUF.
- Generación de texto creativo sin restricciones: para proyectos de ficción, guiones o contenido editorial donde las negativas del modelo base resultan un obstáculo, con revisión humana posterior obligatoria.
- Experimentación con decodificación especulativa: la cabeza MTP incluida permite probar técnicas de aceleración de inferencia en entornos de investigación, siempre que se validen los resultados.
- Despliegue local en estaciones de trabajo con GPU AMD: el archivo Q4_K_M (16,8 GB) o Q6_0 (22,5 GB) permiten ejecutar un modelo de 27B en equipos con VRAM suficiente, usando llama.cpp o el fork ROCmFPX.
- Pruebas de robustez y red-teaming: al carecer de capas de seguridad, sirve como sujeto de prueba para sistemas de moderación externos que deban detectar contenido dañino generado por modelos sin alineamiento.
- Fine-tuning posterior sobre dominio específico: la licencia Apache-2.0 y el formato GGUF (o los pesos safetensors del modelo base) facilitan adaptaciones, siempre que se asuma la responsabilidad legal del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta métricas de fidelidad de cuantización (divergencia KL y coincidencia de token top frente a BF16) y comprobaciones cualitativas con decodificación greedy, que se recogen en la tabla siguiente:

| Metrica | Q8_0 ROCmFPX | Q6_0 ROCmFPX | Q4_K_M estandar | Q8_0 estandar | Q6_K estandar | ROCmFPX 4-bit |
|---|---:|---:|---:|---:|---:|---:|
| Tamano | 28,3 GB | 22,5 GB | 16,8 GB | 29,0 GB | 22,4 GB | 19,2 GB |
| KL a BF16 | 0,00030 | 0,0021 | 0,016 | 0,00038 | 0,0024 | 0,021 |
| Mismo token top | 99,2% | 97,6% | 94,7% | 99,1% | 97,9% | 93,6% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB para Q4_K_M, 23 GB para Q6_0 y 29 GB para Q8_0, según los tamaños de archivo publicados.
- GPU recomendadas: el autor orienta la publicación a hardware AMD (ROCmFPX, Vulkan, Strix Halo); las mediciones de calidad se realizaron en una NVIDIA GB10. No se especifican modelos concretos de GPU AMD recomendados.
- Compatibilidad con GPU de consumo: el archivo Q4_K_M (16,8 GB) puede caber en GPUs de consumo con 24 GB de VRAM; Q6_0 y Q8_0 requieren 24 GB o más. No se dispone de datos de rendimiento por modelo concreto.
- Opciones de despliegue: llama.cpp estándar (solo para Q4_K_M); para Q8_0 y Q6_0 es obligatorio el fork HarshaVardhan3002/ROCmFPX compilado a partir del 7 de noviembre de 2026. LM Studio, Ollama y versiones anteriores de ROCmFPX no cargan los archivos de 8 y 6 bits.
- Latencia y throughput: no disponibles. El autor indica que los archivos no han sido probados aún en hardware AMD y solicita reportes de velocidad y calidad en la pestaña Community.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-ROCmFPX (esta ficha) | 27,3B | no disponible | Apache-2.0 | GGUF | Cuantización ROCmFPX para AMD; sin seguridad |
| SargeDev/Arete-27B-Uncensored | 27,3B | no disponible | Apache-2.0 | safetensors | Modelo fuente sin cuantizar; abliterated |
| NousResearch/Arete-27B | 27,3B | no disponible | Apache-2.0 | safetensors | Fine-tune alineado en valores, con rechazo |
| Qwen3.8-27B (base) | 27,3B | no disponible | Apache-2.0 | safetensors | Modelo base original de Qwen |

Los datos de rendimiento comparativo (benchmarks) entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de entrenamiento de seguridad: la abliteration elimina el comportamiento de rechazo, por lo que el modelo puede cumplir solicitudes dañinas, ilegales u ofensivas. El autor advierte explícitamente que no debe exponerse a usuarios finales sin capas propias de moderación.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; el modelo hereda los riesgos del Qwen3.8-27B base y del fine-tune de NousResearch.
- Sesgos conocidos: no se documentan en la información disponible; al derivar de un modelo entrenado predominantemente en inglés, es esperable un sesgo cultural y lingüístico hacia ese idioma.
- Limitación de idioma: la model card declara únicamente inglés (`language: [en]`), por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Compatibilidad de software restringida: los archivos Q8_0 y Q6_0 requieren un fork específico de llama.cpp (ROCmFPX, build del 7 de noviembre de 2026 o posterior); las herramientas estándar (LM Studio, Ollama, llama.cpp oficial) no los cargan.
- Estado de validación incompleto: el autor reconoce que los archivos no han sido probados en hardware AMD y que la cabeza MTP incluida no ha sido testeada.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado; conviene revisar las obligaciones de atribución a Nous Research, Qwen y SargeDev.
- Resultados de cuantización limitados a inglés general: las métricas KL se midieron sobre wikitext-2 y no dicen nada directo sobre razonamiento o benchmarks del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Arete-27B-Uncensored-ROCmFPX
- Modelo fuente sin cuantizar: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Modelo original de Nous Research: https://huggingface.co/NousResearch/Arete-27B
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
