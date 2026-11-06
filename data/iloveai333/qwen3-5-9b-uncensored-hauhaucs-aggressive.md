# IloveAi333/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una variante afinada por IloveAi333 (a partir del trabajo previo de HauhauCS) sobre el modelo base Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 8.950 millones de parametros desarrollado por el equipo Qwen de Alibaba. El objetivo declarado del autor es eliminar los rechazos (refusals) del modelo original sin degradar sus capacidades, manteniendo intactos los datasets y el comportamiento funcional del modelo base. La model card afirma "0/465 refusals" en el conjunto de evaluacion del autor, aunque no se aportan detalles metodologicos sobre dicha medicion.

El modelo base emplea una arquitectura hibrida que combina atencion lineal Gated DeltaNet con atencion softmax completa en una proporcion 3:1, con 32 capas, 262.000 tokens de contexto nativo (extensible a 1 millon mediante YaRN) y capacidades multimodales nativas (texto, imagen y video). Incluye soporte de prediccion multi-token (MTP) y un vocabulario de 248.000 tokens orientado a 201 idiomas.

La relevancia de esta ficha radica en dos factores: por un lado, documenta una arquitectura nueva (publicada el 2 de marzo de 2026) cuyo soporte en llama.cpp es muy reciente; por otro, ilustra el ecosistema de variantes "uncensored" que eliminan las capas de seguridad del modelo original, con las implicaciones legales y eticas que ello conlleva. Los pesos se distribuyen exclusivamente en formato GGUF, con cuantizaciones desde BF16 hasta Q4_K_M y un codificador visual separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet (atencion lineal) + atencion softmax completa, ratio 3:1, 32 capas |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.048.576 con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (vision encoder en BF16) |
| Idiomas soportados | Ingles, chino y multilingue (vocabulario de 248K tokens, 201 idiomas segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |
| Tamano del repositorio | 41,4 GB |
| Vocabulario | 248.000 tokens |
| Multimodalidad | Nativa: texto, imagen y video (requiere mmproj de 880 MB) |
| Prediccion multi-token | Si (MTP) |
| Descargas en Hugging Face | 245 |
| Fecha de creacion | 31 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B original: un transformer denso de 32 capas que intercala bloques de atencion lineal Gated DeltaNet con bloques de atencion softmax completa en una proporcion 3:1. Este diseno busca reducir el coste computacional y de memoria en contextos largos manteniendo la calidad de recuperacion de la atencion completa. La ventana de contexto nativa es de 262.144 tokens, ampliable a 1.048.576 mediante escalado YaRN. El modelo incorpora prediccion multi-token (MTP), una tecnica que permite decodificacion especulativa interna y puede acelerar la generacion en runtimes compatibles.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base, mas alla de lo que indique la documentacion oficial de Qwen. Respecto a esta variante concreta, la model card afirma explicitamente que no se han modificado los datasets ni las capacidades del modelo original: el ajuste se limita a eliminar los comportamientos de rechazo. No se detalla la metodologia exacta del proceso de "uncensoring" (abliteration, fine-tuning selectivo u otra tecnica), lo que constituye una limitacion importante para evaluar su impacto real en el comportamiento del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.000 tokens.
- Razonamiento con modo "thinking" (por defecto) y modo sin razonamiento explicito, con hiperparametros de muestreo recomendados distintos para cada uno.
- Capacidades multimodales nativas: procesamiento de imagenes y video mediante el codificador visual mmproj.
- Generacion de codigo y matematicas (heredadas del modelo base Qwen3.5-9B).
- Soporte multilingue amplio: 201 idiomas segun la model card, con enfasis en ingles y chino.
- Prediccion multi-token (MTP) para aceleracion de inferencia en runtimes compatibles.
- Ausencia declarada de rechazos ante cualquier prompt (variante "Aggressive").
- No se especifica en la informacion disponible si mantiene soporte de tool calling o function calling del modelo base.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un LLM sin capas de rechazo, comparando respuestas con el Qwen3.5-9B original para analizar que tipo de contenido se desbloquea y con que calidad.
- Generacion creativa sin restricciones tematicas: escritura de ficcion con violencia, contenido adulto o temas sensibles donde el modelo base rechazaria la peticion; util para autores que necesitan explorar narrativas oscuras sin interrupciones.
- Analisis de documentos largos: con 262.000 tokens de contexto, permite procesar libros completos, expedientes o transcripciones extensas en una sola pasada, aprovechando la atencion hibrida para mantener el rendimiento.
- Procesamiento multimodal de imagenes y video: el codificador mmproj permite describir, analizar o extraer informacion de imagenes y fotogramas de video en pipelines locales con llama.cpp o LM Studio.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M (5,3 GB) permite ejecutar el modelo en GPUs consumer con 8 GB de VRAM, lo que facilita prototipado y experimentacion sin infraestructura de servidor.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece BF16, Q8_0, Q6_K y Q4_K_M del mismo modelo, lo que permite medir la degradacion de calidad segun la cuantizacion en tareas concretas.
- Generacion de codigo en entornos controlados: aunque no se confirma tool calling, el modelo puede usarse para autocompletar codigo o explicar fragmentos en asistentes locales donde no se desea depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona la metrica interna "0/465 refusals" del autor, sin detallar el conjunto de evaluacion, el metodo de medicion ni los resultados del modelo base en dichas pruebas. No se aportan datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - BF16: ~17 GB.
  - Q8_0: ~8,9 GB.
  - Q6_K: ~6,9 GB.
  - Q4_K_M: ~5,3 GB.
  - Codificador visual (mmproj BF16): ~880 MB adicionales.
- El contexto de 262.000 tokens exige cache KV considerable; con atencion hibrida el coste es menor que en un transformer puro, pero sigue siendo significativo en contextos muy largos. La model card recomienda mantener al menos 128K de contexto para preservar el modo thinking.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) para Q8_0 o BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) para Q6_K/Q8_0.
- Cabe en GPU consumer: si, en Q4_K_M (5,3 GB) en tarjetas de 8 GB o mas; Q6_K en 8-12 GB; Q8_0 en 12-16 GB.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp (soporte reciente, se requiere build actualizada). Para produccion y alto throughput, la model card recomienda vLLM, SGLang o KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. El soporte de MTP podria mejorar la velocidad de decodificacion en runtimes que lo implementen, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | ~8,95B denso | 262K (1M con YaRN) | Si (texto, imagen, video) | Apache 2.0 | GGUF | Variante sin rechazos; sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | ~8,95B denso | 262K (1M con YaRN) | Si | Apache 2.0 | Safetensors, GGUF | Modelo original con capas de seguridad; benchmarks oficiales en su model card |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | ~4B denso | No disponible | No disponible | Apache 2.0 | GGUF | Variante mas ligera del mismo autor; menor huella de VRAM |
| Otros modelos ~9B de la familia Qwen3.5 | ~9B | 262K | Si | Apache 2.0 | Safetensors, GGUF | Alternativas oficiales sin modificacion de seguridad |

La comparacion con modelos de otros fabricantes del mismo rango (por ejemplo, Llama 3.x 8B o Mistral 7B) no se incluye porque la informacion proporcionada no ofrece datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el modelo generara contenido que el Qwen3.5-9B original rechazaria, incluyendo potencialmente material danino, ilegal o eticamente problematico. No debe desplegarse en aplicaciones orientadas al publico sin filtros externos.
- Metodologia de "uncensoring" no documentada: se desconoce si se aplico abliteration, fine-tuning o edicion de pesos, y no hay evaluacion independiente del impacto en la calidad o coherencia del modelo.
- Posible degradacion no detectada: aunque el autor afirma "zero capability loss", no se aportan benchmarks que lo respalden; la afirmacion "0/465 refusals" no constituye evidencia de calidad general.
- Riesgo de alucinacion: inherente a los LLM de este tamano, agravado por la ausencia de evaluaciones publicadas sobre el modelo modificado.
- Sesgos: no se documentan evaluaciones de sesgo; al eliminar los rechazos, el modelo podria amplificar sesgos presentes en los datos de entrenamiento sin la mitigacion que aportaban las capas de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros puede incumplir normativas locales (por ejemplo, la Ley de Servicios Digitales de la UE o la regulacion de contenidos en determinadas jurisdicciones). La responsabilidad recae en el desplegador.
- Soporte de runtime reciente: la arquitectura se publico el 2 de marzo de 2026 y el soporte en llama.cpp llego poco despues; versiones antiguas pueden fallar o producir resultados incorrectos.
- Contexto: para preservar el modo thinking se recomienda mantener al menos 128K tokens de ventana, lo que incrementa los requisitos de memoria.
- Modelo con muy poca traccion: 245 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- El aviso de la model card sobre un posible descargo de responsabilidad al final de algunas respuestas indica que el comportamiento del modelo base no se ha eliminado por completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IloveAi333/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 4B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Perfil del autor original HauhauCS: https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
