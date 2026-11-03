# mradermacher/Rabt-1.0-9B-GGUF

## Resumen

Rabt 1.0 9B es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) desarrollado por 4waiz bajo el sello Kanban Studios, y distribuido en formato GGUF por mradermacher. Está diseñado específicamente como asistente personal local-first, con un enfoque explícito en privacidad, uso de herramientas (tool-use), razonamiento agéntico y flujo de trabajo con intervención humana (human-in-the-loop). El modelo se presenta como un asistente conversacional orientado a despliegues locales donde los datos no deben salir del dispositivo del usuario.

La relevancia del modelo radica en su combinación de tamaño contenido (9B, apto para GPUs de consumo), licencia Apache 2.0 permisiva y soporte multilingüe que incluye inglés, árabe, francés, hindi y urdu, con especial énfasis en árabe y urdu. El modelo base fue afinado mediante QLoRA, según las etiquetas de la model card, y la versión aquí descrita es una cuantización estática en GGUF generada por mradermacher, lo que facilita su ejecución en entornos con recursos limitados mediante llama.cpp u Ollama.

La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa: la model card del repositorio GGUF se limita a describir el proceso de cuantización y no detalla el entrenamiento del modelo base. Por tanto, varios apartados de esta ficha se marcan explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, inferido por el pipeline de transformers; detalles no publicados) |
| Parámetros totales | 9.197.093.888 (~9,2B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | en, ar, fr, hi, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base (4waiz/Rabt-1.0-9B) en la información disponible. Por el tamaño de parámetros y la librería declarada (transformers), se trata de un transformer decoder-only de aproximadamente 9,2B parámetros, pero no se especifica el número de capas, dimensión oculta, mecanismo de atención ni si emplea alguna innovación como atención lineal o decodificación especulativa.

Respecto al entrenamiento, la model card únicamente indica la etiqueta `qlora`, lo que sugiere que el modelo base fue afinado mediante QLoRA (cuantización de 4 bits con adaptadores de bajo rango). No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Las etiquetas del repositorio (`agent`, `tool-use`, `human-in-the-loop`, `personal-assistant`) indican que el ajuste fino estuvo orientado a tareas de asistencia personal y uso de herramientas, pero no se aportan métricas ni descripciones del corpus.

La versión descrita aquí es una cuantización estática generada por mradermacher a partir del modelo base, con conversión de tipo `hf` y cuantización de tensores de salida. Incluye un fichero `mmproj-f16.gguf` de aproximadamente 1,0 GB etiquetado como "multi-modal supplement", lo que sugiere soporte de entrada multimodal (probablemente visión) en el modelo base, aunque este extremo no se documenta con detalle.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a asistencia personal.
- Uso de herramientas y function calling (etiquetas `tool-use` y `agent`).
- Razonamiento agéntico multi-paso con soporte para intervención humana (`human-in-the-loop`).
- Capacidades multilingües en inglés, árabe, francés, hindi y urdu.
- Enfoque local-first y de privacidad: diseñado para ejecutarse sin enviar datos a servicios externos.
- Posible soporte multimodal de entrada (visión) según el fichero `mmproj` incluido, aunque no documentado explícitamente.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con Ollama.
- No se documentan capacidades específicas de matemáticas avanzadas, generación de código o modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente personal en local: el modelo puede gestionar conversaciones multi-turno en el dispositivo del usuario, manteniendo los datos privados, gracias a su diseño local-first y a su tamaño de 9B que permite ejecución en hardware de consumo.
- Automatización de tareas con tool calling: puede invocarse como agente que llama a funciones externas (calendario, correo, APIs internas) en flujos donde se requiere confirmación humana antes de ejecutar acciones, aprovechando su orientación human-in-the-loop.
- Atención al cliente multilingüe: su soporte de árabe, urdu, hindi, francés e inglés lo hace adecuado para despliegues en regiones con esas comunidades lingüísticas, gestionando consultas en varios idiomas con un único modelo.
- Despliegue en entornos con requisitos de privacidad: organizaciones que no pueden enviar datos a la nube (sanidad, legal, sector público) pueden ejecutar el modelo GGUF en servidores propios mediante llama.cpp o Ollama.
- Prototipado de agentes en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M, el modelo cabe en GPUs de consumo de 8-12 GB de VRAM, lo que permite a desarrolladores iterar sobre flujos agénticos sin infraestructura dedicada.
- Integración en aplicaciones de escritorio o móviles: el formato GGUF y la disponibilidad de cuantizaciones de 2 a 8 bits permiten empaquetar el modelo en aplicaciones locales con requisitos de memoria ajustables.
- Asistencia en idiomas minoritarios: para usuarios de árabe o urdu, el modelo ofrece cobertura lingüística que muchos modelos de 9B no incluyen, útil en herramientas de productividad personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización):
  - Q2_K: ~3-4 GB
  - Q3_K_M: ~4-5 GB
  - Q4_K_M: ~5,5-6,5 GB
  - Q5_K_M: ~6,5-7,5 GB
  - Q6_K: ~7,5-8,5 GB
  - Q8_0: ~9,5-10,5 GB
  - f16: ~18-19 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas o f16; A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 8 GB o más; Q2_K y Q3_K en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama`), y servidores compatibles con endpoints; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de VRAM suficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Rabt 1.0 9B (GGUF) | ~9,2B | no disponible | en, ar, fr, hi, ur | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-7B-Instruct | ~7,6B | 32K (128K en variantes) | multilingüe amplio | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct | ~8B | 128K | multilingüe (8 idiomas) | Llama 3.1 Community | safetensors, GGUF |
| Gemma 2 9B IT | ~9B | 8K | multilingüe | Gemma Terms | safetensors, GGUF |

La comparativa con Qwen2.5-7B, Llama 3.1 8B y Gemma 2 9B se ofrece como referencia de categoría por tamaño; no se dispone de datos de rendimiento de Rabt 1.0 9B que permitan una comparación cuantitativa. La principal ventaja diferencial de Rabt es su cobertura explícita de árabe y urdu junto con una licencia Apache 2.0 totalmente permisiva.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación no cuantificado: al no haber benchmarks ni evaluaciones públicas, no puede estimarse su fiabilidad factual.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con documentos largos o conversaciones extensas.
- Cobertura lingüística limitada a cinco idiomas declarados; el rendimiento fuera de ellos es incierto.
- El modelo base fue afinado con QLoRA, lo que puede implicar una capacidad de generalización más limitada que un ajuste completo; no se detalla el corpus de ajuste.
- La model card del repositorio GGUF no documenta el entrenamiento ni las capacidades del modelo base; la información sobre el mismo es mínima y debe verificarse en el repositorio original.
- El fichero `mmproj` sugiere multimodalidad, pero no se especifica qué modalidad ni con qué calidad; no debe asumirse soporte de visión fiable sin validación.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- Al ser una cuantización estática (no imatrix), las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad más que las cuantizaciones ponderadas equivalentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rabt-1.0-9B-GGUF
- Modelo base: https://huggingface.co/4waiz/Rabt-1.0-9B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Rabt-1.0-9B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
