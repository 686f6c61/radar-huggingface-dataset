# alekringtonnn-ai/zubr-mini-1.9-3b

## Resumen

Zubr Mini 1.9 3B es un modelo de lenguaje multimodal (visión) de 3.429.006.336 parámetros desarrollado por alekringtonnn-ai, obtenido mediante fine-tuning de Ministral-3-3B-Instruct-2512 de Mistral AI. Está orientado a tareas image-text-to-text (imagen y texto como entrada, texto como salida) y se distribuye principalmente en formato GGUF, lo que permite su ejecución en CPU, portátiles, dispositivos móviles y servidores sin necesidad de GPU dedicada.

El modelo amplía la cobertura lingüística de su base de 26 a 48 idiomas, incluyendo ruso, bielorruso, ucraniano y una larga lista de lenguas europeas y asiáticas. Se presenta como una opción ligera para inferencia local con licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales. El repositorio incluye ocho variantes de cuantización GGUF, desde Q2_K (~1,46 GB) hasta Q8_0 (~3,65 GB), además de una versión MLX separada para Apple Silicon.

Su relevancia actual radica en la combinación de multimodalidad, multilingüismo amplio y despliegue en hardware modesto, un perfil poco frecuente en modelos de 3B. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y resultados de benchmarks es muy limitada, por lo que muchas especificaciones deben considerarse no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), derivada de Ministral-3-3B-Instruct-2512; detalles internos no disponibles |
| Parámetros totales | 3.429.006.336 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_L, IQ3_XS, Q3_K_L, Q4_0, Q4_K_M, Q6_K, Q8_0 (GGUF); versión MLX separada |
| Idiomas soportados | 48 idiomas, entre ellos ru, be, en, es, fr, de, nl, ja, it, pl, da, ro, el, uk, br, ar, fa, tr, bn, id, hi, ne, pa, ta, te, zh, pt, ga, uz, tg, tk, lt, sr, bg, sv, fi, ca, gl, is, mr, kn, kk, bs, he, ur, cy, rm, mn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal); MLX en repositorio separado; safetensors presentes en el repo (3.429.006.336 parámetros) |

## Arquitectura y entrenamiento

El modelo parte de Ministral-3-3B-Instruct-2512, la variante instructiva de la familia Ministral 3 de Mistral AI, y ha sido ajustado por alekringtonnn-ai. La model card describe el resultado como un modelo multimodal con capacidad de reconocimiento de imágenes y tareas image-text-to-text, con un vocabulario ampliado y un ajuste profundo de instrucciones. No se detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, codificador visual) ni el proceso exacto de entrenamiento.

No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal. La información disponible se limita a la genealogía del modelo (base → instruct → GGUF → fine-tune) y a la ampliación de cobertura lingüística de 26 a 48 idiomas.

## Capacidades

- Generación de texto conversacional con ajuste de instrucciones.
- Procesamiento multimodal: reconocimiento de imágenes y tareas image-text-to-text.
- Soporte multilingüe en 48 idiomas, con especial presencia de lenguas eslavas (ruso, bielorruso, ucraniano) y europeas.
- Ejecución local en CPU y GPU mediante GGUF (Ollama, llama.cpp, vLLM, LM Studio).
- Compatibilidad con endpoints (etiqueta endpoints_compatible en Hugging Face).
- Cuantizaciones con técnica imatrix para las variantes de baja precisión.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional local en portátiles: con la cuantización Q4_K_M (~2,15 GB) el modelo puede ejecutarse en equipos con unos 8 GB de RAM sin GPU, útil para prototipos de chat sin conexión.
- Descripción y análisis de imágenes en dispositivos de borde: la capacidad image-text-to-text permite generar descripciones o responder preguntas sobre imágenes en móviles o Raspberry Pi, usando Q2_K o IQ3_XS.
- Procesamiento multilingüe en atención al cliente: la cobertura de 48 idiomas permite atender consultas en ruso, bielorruso, ucraniano, árabe o hindi con un único modelo ligero.
- Generación de texto en pipelines de CI/CD: la compatibilidad con llama.cpp y vLLM permite integrar el modelo en scripts automatizados para resúmenes, clasificación o extracción de información.
- Aplicaciones de privacidad estricta: al ejecutarse completamente en local, es adecuado para procesar documentos sensibles sin enviar datos a servicios externos.
- Educación y experimentación: su tamaño reducido y licencia Apache 2.0 lo hacen apropiado para entornos docentes, investigación académica y pruebas de concepto de modelos multimodales.
- Despliegue en Apple Silicon: la versión MLX permite aprovechar la GPU unificada de los chips M1–M4 para inferencia más rápida que en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~1,46 GB; Q2_K_L ~1,56 GB; IQ3_XS ~1,58 GB; Q3_K_L ~1,93 GB; Q4_0 ~2,05 GB; Q4_K_M ~2,15 GB; Q6_K ~2,82 GB; Q8_0 ~3,65 GB.
- La model card recomienda al menos el doble de RAM que el tamaño del archivo de cuantización (por ejemplo, ~4 GB para Q2_K y ~16 GB para Q8_0).
- CPU con soporte AVX/AVX2 o ARM; GPU opcional. Para vLLM se requiere GPU NVIDIA (o Apple Silicon) y Linux/macOS.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM puede alojar Q4_K_M; para Q8_0 se recomiendan 8 GB o más (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: Ollama (`ollama run hf.co/alekringtonnn-ai/zubr-mini-1.9-3b:Q4_K_M`), llama.cpp (`llama-cli -hf ...`), vLLM, LM Studio y MLX en Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Zubr Mini 1.9 3B | 3,43B | no disponible | Sí (visión) | 48 | Apache 2.0 | GGUF, MLX, safetensors |
| Ministral-3-3B-Instruct-2512 (base) | ~3B | no disponible | no disponible | 26 (según la model card) | no disponible en la información | GGUF, safetensors |
| Zubr Mini 1.9 8B (versión superior del mismo autor) | ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos mencionados en la información proporcionada; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de terceros.

## Limitaciones y advertencias

- La información pública sobre arquitectura, contexto y entrenamiento es muy escasa; la evaluación rigurosa requiere pruebas propias.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q2_K_L, IQ3_XS) degradan la calidad de forma notable según la propia model card.
- Riesgo de alucinación inherente a modelos de 3B, especialmente en tareas de razonamiento complejo o matemáticas.
- No se documentan sesgos conocidos, pero la ampliación a 48 idiomas sin datos de evaluación pública impide descartar sesgos por idioma.
- La longitud de contexto no está especificada, lo que dificulta planificar casos de uso con documentos largos.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones de la licencia del modelo base (Ministral-3-3B-Instruct-2512), no detalladas en la información disponible.
- El repositorio tiene un tamaño de 17,2 GB y solo 737 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La model card advierte de que existe una versión superior de 8B, lo que sugiere que el modelo de 3B puede quedar desactualizado.

## Enlaces

- Hugging Face: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b
- Versión MLX: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b-mlx
- Versión 8B: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF
- Ollama: https://ollama.com
- Sitio del proyecto: https://zubrmax.site
