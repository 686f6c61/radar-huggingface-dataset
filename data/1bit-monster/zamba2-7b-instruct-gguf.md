# 1bit-MONSTER/Zamba2-7B-Instruct-GGUF

## Resumen

Zamba2-7B-Instruct-GGUF es una conversión al formato GGUF del modelo Zamba2-7B-Instruct desarrollado por Zyphra, publicada por el usuario 1bit-MONSTER. El modelo original emplea una arquitectura híbrida que combina capas Mamba-2 (modelo de espacio de estados) con bloques transformer compartidos, lo que reduce el coste computacional frente a un transformer puro de tamaño equivalente. La conversión está pensada para ejecutarse en motores compatibles con llama.cpp, en concreto en el fork mantenido por 1bit-MONSTER, que incorpora soporte para Zamba2 y una implementación Vulkan del scan de Mamba-2.

El repositorio contiene únicamente una cuantización Q8_0, con un tamaño total de 11,7 GB. Según los datos de safetensors del modelo base, el recuento real de parámetros asciende a 10.976.879.952 (unos 11 mil millones), pese a la denominación comercial "7B". El modelo es conversacional (instruct) y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en dos factores: por un lado, permite ejecutar un modelo híbrido Mamba-2/transformer en hardware de consumo mediante Vulkan; por otro, la validación publicada incluye métricas concretas de rendimiento (17,1 tok/s en decodificación con Q8_0 sobre una Radeon 8060S). Se trata de un artefacto de nicho, con 37 descargas en el momento de la consulta, orientado a usuarios del ecosistema 1bit y a quienes quieran experimentar con arquitecturas híbridas en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Mamba-2 (SSM) con bloques transformer compartidos |
| Parametros totales | 10.976.879.952 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única incluida en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Zamba2-7B-Instruct-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base Zamba2-7B-Instruct de Zyphra es un modelo híbrido que intercala capas Mamba-2, un modelo de espacio de estados con recurrencia selectiva, con bloques transformer compartidos (shared transformer blocks). Esta combinación busca reducir el coste de atención cuadrática manteniendo la capacidad de razonamiento asociada a los transformers. La model card de la conversión no detalla el número de capas de cada tipo ni la composición exacta del bloque compartido.

La información disponible no especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO en el modelo original. La model card de la conversión se limita a describir el proceso de conversión y validación, no el entrenamiento. Como innovación técnica del artefacto publicado, el fork de llama.cpp utilizado incorpora una implementación Vulkan del scan de Mamba-2 adaptada al tamaño de estado de este modelo y corrige un error del conversor que asignaba una puntuación de -1000 a todos los tokens; tras la corrección, la tokenización coincide con la del tokenizador original.

## Capacidades

- Generación de texto conversacional: el modelo es una variante instruct, por lo que está ajustado para seguir instrucciones en formato de diálogo.
- Razonamiento y respuesta a preguntas: capacidad esperable en un modelo instruct de este tamaño, aunque no se documentan benchmarks en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se especifican idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución en hardware de consumo: validada en Vulkan (Radeon 8060S) mediante el fork de llama.cpp de 1bit-MONSTER.

## Casos de uso

- Experimentación con arquitecturas híbridas SSM/transformer: el modelo permite evaluar en local el comportamiento de Mamba-2 combinado con bloques transformer, útil para investigadores que quieran comparar latencia y calidad frente a transformers puros del mismo rango de parámetros.
- Despliegue en GPU de consumo con Vulkan: la validación publicada sobre una Radeon 8060S (17,1 tok/s en decodificación con Q8_0) lo hace adecuado para estaciones de trabajo con GPU integrada AMD o tarjetas de gama media que no dispongan de CUDA.
- Asistentes conversacionales locales: al ser un modelo instruct en GGUF, puede ejecutarse como chatbot local mediante el motor 1bit o llama.cpp, sin depender de servicios en la nube.
- Pruebas de integración en pipelines llama.cpp: sirve como caso de prueba para validar el soporte de Zamba2 en forks de llama.cpp, incluida la corrección del conversor y la tokenización.
- Generación de texto en entornos con restricciones de memoria: la cuantización Q8_0 ocupa 11,7 GB, lo que permite ejecutarlo en equipos con 16 GB de VRAM o memoria unificada, aunque con margen limitado.
- Evaluación comparativa de motores de inferencia: útil para medir throughput de prefill y decodificación (523 tok/s en pp256 y 17,1 tok/s en tg64 según la model card) en distintas configuraciones de hardware.

## Benchmarks y rendimiento

La model card solo publica métricas de rendimiento de inferencia, no de calidad:

| Metrica | Valor | Configuracion |
|---|---|---|
| Prefill (pp256) | 523 tok/s | Vulkan, Radeon 8060S, Q8_0 |
| Decodificacion (tg64) | 17,1 tok/s | Vulkan, Radeon 8060S, Q8_0 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,7 GB para la cuantización Q8_0, más overhead del runtime; se recomienda al menos 12-16 GB de VRAM o memoria unificada.
- GPU recomendadas: la validación se realizó en una Radeon 8060S (GPU integrada AMD con Vulkan). No se documentan pruebas en A100, H100 o RTX 4090.
- GPU de consumo: cabe en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5070 Ti y superiores) y en equipos con memoria unificada de 16 GB o más (Apple Silicon, APUs AMD).
- Opciones de despliegue: motor 1bit (`1bit serve -m ... --device hrx`) y fork de llama.cpp de 1bit-MONSTER. No se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 523 tok/s de prefill y 17,1 tok/s de decodificación en Vulkan con Radeon 8060S y Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zamba2-7B-Instruct-GGUF (este) | ~10,98 mil millones | no disponible | Apache 2.0 | GGUF Q8_0 | Híbrido Mamba-2/transformer, validado en Vulkan |
| Zyphra/Zamba2-7B-Instruct | ~10,98 mil millones | no disponible | Apache 2.0 | safetensors | Modelo base original, pesos completos |
| Transformers densos de ~7-8B (p. ej. Llama 3.1 8B) | ~8 mil millones | hasta 128K en algunos casos | licencias variables | safetensors, GGUF | Arquitectura transformer pura; comparación cualitativa no disponible en la información |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar del modelo base, pueden existir sesgos presentes en sus datos de entrenamiento, no especificados.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones de fidelidad publicadas para esta conversión.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la model card, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se añaden restricciones adicionales en la conversión.
- Dependencia de un fork específico: el modelo requiere el fork de llama.cpp de 1bit-MONSTER o el motor 1bit; otros runtimes pueden no soportar la arquitectura Zamba2 o la tokenización corregida.
- Única cuantización disponible: solo se ofrece Q8_0, sin alternativas de menor precisión (Q4, Q5) que reduzcan los requisitos de memoria.
- Madurez del artefacto: 37 descargas y 0 likes en el momento de la consulta; se trata de una conversión reciente y de nicho, sin validación comunitaria extensa.
- Discrepancia de nomenclatura: el nombre comercial indica "7B", pero el recuento real de parámetros es de aproximadamente 11 mil millones, lo que afecta a las estimaciones de memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Zamba2-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Zyphra/Zamba2-7B-Instruct
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp de 1bit-MONSTER: https://github.com/1bit-MONSTER/llama.cpp
- Pull request de soporte Zamba2 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/21412
- Familias de modelos de 1bit-MONSTER: https://huggingface.co/1bit-MONSTER#families
