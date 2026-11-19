# mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF

## Resumen

Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF es una recuantización en formato GGUF realizada por el usuario mradermacher a partir del modelo original `xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic`. Se trata de una variante orientada a generación de código, sin censura declarada ("uncensored") y con un proceso de "abliteración" o "heretización" (eliminación de mecanismos de rechazo) aplicado sobre una base Qwen de aproximadamente 4 mil millones de parámetros, según indica el propio nombre del repositorio.

El repositorio contiene únicamente pesos cuantizados en GGUF (el autor lista las variantes x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 e IQ4_XS) y ocupa 1,0 GB. No incluye model card descriptiva, pipeline declarado, licencia, idiomas ni datos de entrenamiento. La información disponible es, por tanto, muy limitada y esta ficha se limita a documentar lo que consta de forma verificable.

Un dato relevante y contradictorio: el recuento de parámetros real en safetensors que reporta Hugging Face es de 333.514.240 (unos 333 millones), muy inferior a los "4B" que sugiere el nombre. Esta discrepancia debe tenerse en cuenta antes de cualquier uso: o bien el nombre es engañoso, o bien el recuento corresponde a un componente parcial (por ejemplo, un módulo de visión o un subconjunto de pesos). No hay información suficiente para resolver la discrepancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only basado en Qwen, no confirmado) |
| Parametros totales | 333.514.240 segun safetensors del repo; el nombre indica "4B" (discrepancia no resuelta) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (recuantizacion de un modelo original en otro formato) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras. El nombre del modelo sugiere una base de la familia Qwen (probablemente Qwen2.5-Coder de 3B o 4B, aunque no está confirmado) sobre la que se habría aplicado un proceso de "abliteración" para eliminar rechazos, seguido de un ajuste orientado a código ("Coder") y un paso adicional denominado "heretic".

El repositorio es una recuantización estática (quantize_version 2, output_tensor_quantised 1) del modelo `xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic`, realizada con las herramientas habituales de llama.cpp. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y código: por el nombre y la base presumible (Qwen Coder), se espera capacidad para completar y generar código en varios lenguajes, aunque no hay evaluación publicada.
- Ausencia declarada de mecanismos de rechazo: el sufijo "UNCENSORED-heretic" indica que se ha intentado eliminar las negativas del modelo a responder ciertas peticiones.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Formato GGUF: compatible con llama.cpp y derivados (Ollama, LM Studio, etc.), lo que permite ejecución en CPU y GPU consumer.

## Casos de uso

- Experimentación local con modelos de código: al estar en GGUF y ocupar 1,0 GB el repositorio completo, puede cargarse en llama.cpp u Ollama en equipos de gama media para probar generación de código sin depender de la nube.
- Evaluación de recuantizaciones: útil para comparar la degradación de calidad entre las distintas variantes (Q2_K a Q8_0) sobre el mismo modelo base.
- Pruebas de alineación y seguridad: investigadores interesados en estudiar el efecto de la "abliteración" pueden comparar este modelo con su base original para analizar qué rechazos se han eliminado y con qué coste en calidad.
- Prototipado de asistentes de código en entornos aislados: para entornos sin conexión donde se requiera un modelo pequeño y ligero.
- Fines educativos: estudio de pipelines de cuantización GGUF y de las diferencias entre niveles de cuantización.
- No recomendado para producción: sin licencia declarada, sin benchmarks y con discrepancia en el recuento de parámetros, no es apto para despliegues comerciales sin verificación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~333 M de parámetros, las variantes Q4_K_M ocuparían del orden de 200-300 MB; para un modelo de ~4 B, las variantes Q4_K_M ocuparían aproximadamente 2,5-3 GB. Dado que el repo completo pesa 1,0 GB, la primera estimación es más plausible.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, con amplio margen en la mayoría de tarjetas actuales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; no se documenta soporte para vLLM o TGI (GGUF no es el formato nativo de estos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre el modelo base ni sobre alternativas comparables con datos verificables (parámetros, contexto, benchmarks, licencia) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Discrepancia crítica en el tamaño: el nombre indica "4B" pero safetensors reporta 333.514.240 parámetros. Verificar antes de usar.
- Sin licencia declarada: no se puede asumir uso comercial permitido; la licencia del modelo base (presumiblemente Qwen) podría aplicar restricciones adicionales.
- Sin model card: no hay información sobre entrenamiento, datos, idiomas ni limitaciones declaradas por el autor.
- Modelo "uncensored/heretic": la eliminación de rechazos puede aumentar el riesgo de generar contenido dañino, sesgado o inexacto; requiere filtros externos si se usa en aplicaciones abiertas al público.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks no se puede acotar su magnitud.
- Sin evaluación de calidad: no hay datos que confirmen que la recuantización o la "abliteración" hayan preservado las capacidades del modelo original.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-18): metadato anómalo que conviene verificar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF
- Modelo original: https://huggingface.co/xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
