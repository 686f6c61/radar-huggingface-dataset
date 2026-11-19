# mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16-i1-GGUF` es una recuantización en formato GGUF, generada por mradermacher, del modelo base `AMAImedia/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16`. Se trata de un derivado de la familia Qwen (los tags del repositorio mencionan qwen3.5, qwen3.6 y qwen3.8) con 26.895.998.464 parámetros totales, es decir, aproximadamente 27B, empaquetado en BF16 y posteriormente convertido a cuantizaciones GGUF de tipo i1 (imatrix) para su uso con llama.cpp y herramientas compatibles.

El modelo resuelve el problema de ejecutar un modelo de ~27B en hardware con memoria limitada: el repositorio ofrece un abanico de cuantizaciones desde i1-IQ1_S (7,2 GB) hasta i1-IQ4_XS (15,2 GB) y superiores, lo que permite desplegarlo desde GPUs de consumo hasta estaciones de trabajo. La licencia es Apache 2.0 y la model card declara soporte para más de 100 idiomas, incluyendo castellano, inglés, ruso, chino, japonés y vietnamita entre los principales.

Es relevante ahora porque combina tres factores poco habituales: un tamaño de 27B (equilibrio entre capacidad y coste de inferencia), una licencia permisiva para uso comercial y una batería amplia de cuantizaciones con imatrix, que mejoran la relación calidad/tamaño frente a cuantizaciones estáticas. No obstante, la información publicada sobre arquitectura interna, datos de entrenamiento y benchmarks es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen; tags qwen3.5/qwen3.6/qwen3.8) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K; ademas cuantizaciones estaticas en repo hermano |
| Idiomas soportados | más de 100 (en, es, ru, zh, ja, vi, kk, de, fr, ar, hi, ko, pt, it, nl, pl, tr, uk, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16 como base; repo hermano con cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Los tags del repositorio (`qwen3.5`, `qwen3.6`, `qwen3.8`, `mtp`, `noesis`, `noesis-repack`) sugieren un transformer derivado de la familia Qwen, con posible soporte de Multi-Token Prediction (MTP) y un proceso de repack/mezcla denominado "NOESIS". El nombre "Cold-Fusion-GAIN" y el sufijo "heretic" apuntan a una fusión de modelos o a un ajuste orientado a reducir rechazos (abliteración o "decensoring"), aunque no se detalla la metodología.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La información disponible se limita a la existencia de un fichero imatrix para la generación de cuantizaciones, lo que indica que el autor de las cuantizaciones aplicó importance matrix calibration sobre el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Soporte multilingüe amplio: más de 100 idiomas declarados, con castellano, inglés, ruso, chino, japonés, vietnamita y kazajo entre los principales.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue como servicio.
- Posible soporte de Multi-Token Prediction (tag `mtp`), no confirmado en la documentación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Asistente conversacional multilingüe en producción: el modelo declara soporte para más de 100 idiomas, lo que permite atender usuarios en castellano, inglés, ruso o chino con un único despliegue y sin cambiar de modelo por idioma.
- Despliegue en GPU de consumo: las cuantizaciones i1-IQ4_XS (15,2 GB) o i1-Q4_K_M permiten ejecutar un modelo de ~27B en GPUs con 16-24 GB de VRAM, algo inviable con los pesos BF16 completos.
- Prototipado rápido con llama.cpp u Ollama: el formato GGUF y la disponibilidad de cuantizaciones desde 7,2 GB facilitan pruebas locales en portátiles y estaciones de trabajo sin infraestructura dedicada.
- Generación de contenido en varios idiomas: útil para redacción, traducción asistida o resumen de documentos en entornos con requisitos de licencia permisiva (Apache 2.0).
- Investigación sobre cuantización: el repositorio incluye el fichero imatrix y un espectro amplio de cuantizaciones, lo que lo convierte en un banco de pruebas para estudiar la degradación de calidad según el nivel de compresión.
- Fine-tuning o ajuste posterior: al estar bajo Apache 2.0 y disponible en BF16 en el repo base, puede servir como punto de partida para especializaciones con datos propios.
- Evaluación de modelos "heretic": útil para investigadores que estudien el comportamiento de modelos con ajustes orientados a reducir rechazos en tareas de contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-IQ1_S: ~7,2 GB de pesos; con overhead de contexto, ~9-10 GB.
  - i1-IQ2_M: ~10,1 GB de pesos; ~12-13 GB con contexto.
  - i1-IQ3_M: ~12,7 GB de pesos; ~15 GB con contexto.
  - i1-IQ4_XS: ~15,2 GB de pesos; ~17-18 GB con contexto.
  - BF16 completo: ~54 GB de pesos; requiere ~60 GB o más.
- GPU recomendadas:
  - RTX 4090 (24 GB): IQ4_XS, Q4_K_M y Q5_K_M con contexto moderado.
  - RTX 3090 / 4080 (16-24 GB): IQ3_M a IQ4_XS.
  - A100 40/80 GB, H100: BF16 o cuantizaciones altas con contexto largo.
- Cabe en GPU de consumo: sí, desde IQ1_S (7,2 GB) en GPUs de 8-10 GB, con calidad reducida; IQ4_XS es el punto de equilibrio recomendado para 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo endpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS (este) | ~26,9B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizaciones imatrix desde 7,2 GB |
| Modelo base AMAImedia (BF16) | ~26,9B | no disponible | Apache 2.0 | safetensors/BF16 | Sin cuantizar; ~54 GB |
| Qwen2.5-32B-Instruct (referencia de familia) | ~32B | 128K (según versión) | Apache 2.0 | safetensors, GGUF | Contexto y benchmarks públicos; no es el mismo modelo |
| Llama 3.3 70B (referencia de categoría) | ~70B | 128K | Llama 3.3 Community License | safetensors, GGUF | Mayor tamaño y requisitos; licencia no Apache |

La comparativa con alternativas exactas no está disponible: no se han publicado datos de rendimiento del modelo ni de su base que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información técnica muy limitada: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- El sufijo "heretic" indica un ajuste orientado a reducir rechazos; esto puede aumentar el riesgo de generar contenido inapropiado o inseguro y requiere filtros adicionales en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks publicados no puede cuantificarse.
- Las cuantizaciones de baja precisión (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "very low quality".
- El repositorio ocupa 300,3 GB, lo que implica descargas largas y requisitos de almacenamiento considerables si se quieren varias cuantizaciones.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las obligaciones de atribución y las licencias de los componentes fusionados en el modelo base.
- Idiomas: aunque se declaran más de 100, no hay evaluación publicada de calidad por idioma; el rendimiento en lenguas minoritarias puede ser desigual.
- Procedencia: es una recuantización de un modelo a su vez derivado y fusionado, sin trazabilidad completa del proceso de entrenamiento original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16-i1-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
