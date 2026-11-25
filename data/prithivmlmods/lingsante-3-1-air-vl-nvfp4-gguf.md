# prithivMLmods/LingSante-3.1-air-VL-NVFP4-GGUF

## Resumen

LingSante-3.1-air-VL-NVFP4-GGUF es una cuantización en formato NVFP4 (GGUF) del modelo multimodal LingSante-3.1-air-VL, desarrollado por el equipo de salud de Ant Group (inclusionAI). El modelo original es un Mixture-of-Experts (MoE) nativamente multimodal con 124 000 millones de parámetros totales y 5 500 millones de parámetros activos por token, construido sobre Ling-3.0-flash-VL y orientado a investigación sanitaria del mundo real.

Esta versión, publicada por prithivMLmods, empaqueta los pesos en un único GGUF de 75,3 GB más un proyector multimodal (mmproj) de 878 MB, pensado para aprovechar los Tensor Cores FP4 nativos de la arquitectura NVIDIA Blackwell (RTX PRO 6000, RTX 50-series, B200, B300). El modelo cubre cuatro áreas clínicas: informes estructurados de imagen médica, evaluaciones de salud multimodales (más de 120 afecciones cutáneas, análisis nutricional, interpretación de informes), búsqueda médica trazable con síntesis de evidencia y agentes GUI para flujos como reserva de citas o compra de medicamentos.

Su relevancia radica en que combina una ventana de contexto de 256K tokens, capacidades de tool calling y razonamiento multi-paso, y un tamaño que, gracias a la cuantización FP4, cabe en una sola GPU profesional de 96 GB. La licencia es MIT, lo que facilita su adopción tanto en investigación como en prototipos comerciales, aunque el autor advierte explícitamente de que no es un dispositivo médico certificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, tipo `bailing_moe_v3_vl`, con codificador visual y proyector multimodal |
| Parámetros totales | 124 414 272 992 (124B) |
| Parámetros activos | 5,5B por token (A5.5B) |
| Longitud de contexto | 256K tokens (modelo original); 16 384 tokens en la prueba de referencia con llama.cpp |
| Tipos de cuantización | NVFP4 (FP4 de NVIDIA), con KV cache en f16 por defecto; proyector multimodal en formato mmproj |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (un archivo de modelo de 75,3 GB + un archivo mmproj de 878 MB) |

## Arquitectura y entrenamiento

El modelo es un MoE multimodal construido sobre Ling-3.0-flash-VL. Combina un tronco de lenguaje con mezcla de expertos (124B totales, 5,5B activos por token) y un codificador visual con proyector multimodal que permite entrada image-text-to-text. El entrenamiento se realizó de forma conjunta con datos generales y datos específicos del dominio sanitario, lo que le permite conservar capacidades generales de OCR, comprensión de documentos y gráficos y uso de herramientas, además de sus competencias clínicas.

La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos no están disponibles. La innovación técnica más destacable de esta ficha concreta es la cuantización NVFP4, que explota los Tensor Cores FP4 de Blackwell para reducir el peso a 75,3 GB manteniendo un equilibrio entre tamaño y rendimiento. La arquitectura requiere `custom_code` y se integra con llama.cpp, transformers y text-generation-inference.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imagen).
- Comprensión de documentos y gráficos (document-understanding, chart-understanding), con OCR implícito.
- Informes estructurados de imagen médica, incluido análisis multi-imagen y razonamiento diferencial.
- Evaluaciones de salud multimodales: más de 120 afecciones cutáneas, análisis dietético y nutricional, interpretación de informes médicos.
- Búsqueda médica trazable y síntesis de evidencia.
- Agentes GUI para flujos de trabajo (reserva de citas, compra de medicamentos).
- Tool calling / function calling y razonamiento multi-paso orientado a agentes.
- Capacidades multilingües limitadas al inglés según la model card.
- Modo conversacional multi-turno.

## Casos de uso

- Interpretación de informes médicos: el modelo procesa imágenes de informes y páginas de documentos y genera explicaciones detalladas, como demuestra la prueba de referencia con tres capturas de páginas de documento. Adecuado por su comprensión de documentos y su contexto amplio.
- Triaje dermatológico asistido: con más de 120 afecciones cutáneas cubiertas, puede apoyar la evaluación inicial de imágenes dermatológicas y el seguimiento multi-turno con preguntas de aclaración.
- Análisis nutricional: a partir de imágenes de alimentos o etiquetas, el modelo puede estimar composición dietética y ofrecer análisis, útil en aplicaciones de salud y bienestar.
- Síntesis de evidencia para investigación: con búsqueda médica trazable y 256K de contexto, permite consolidar múltiples fuentes y documentos en un resumen con referencias verificables.
- Agentes GUI sanitarios: automatización de flujos como reserva de citas o compra de medicamentos mediante tool calling y razonamiento multi-paso, integrándose en pipelines de agentes.
- Procesamiento de documentación clínica a escala: OCR y comprensión de gráficos y documentos para extraer y estructurar información de historiales o publicaciones, desplegable con llama.cpp o vLLM/SGLang.
- Asistente conversacional especializado: conversaciones multi-turno con contexto largo para seguimiento de casos y aclaraciones, siempre con verificación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo aporta métricas de inferencia de la prueba realizada:

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 999,03 tokens/s |
| Velocidad media de generación | 113,93 tokens/s |
| Tiempo total de ejecución | 204,2 s |
| Longitud de contexto en la prueba | 16 384 tokens |
| KV cache | f16 (por defecto) |
| GPU | NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) |
| VRAM pico | 71,63 GiB |
| Uso pico de GPU | 96% |
| Capas offloaded | 99 (`-ngl 99`) |
| Semilla | 42 |

Estos resultados corresponden a ese hardware y configuración concretos; el throughput puede variar según prompt, resolución de imagen, build de software y ajustes de ejecución.

## Requisitos de hardware

- VRAM estimada: alrededor de 72 GiB en la prueba de referencia con contexto de 16K y KV cache f16; el archivo de modelo pesa 75,3 GB y el proyector 878 MB.
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 nativo, como RTX PRO 6000 (96 GB), B200 y B300; también RTX 50-series según la model card.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, etc.); requiere hardware profesional o de centro de datos con suficiente VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), transformers, text-generation-inference; el modelo original es desplegable con SGLang o vLLM.
- Latencia y throughput: 999,03 tokens/s de procesamiento de prompt y 113,93 tokens/s de generación en la configuración de referencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación rigurosa. Como referencia estructural, el propio modelo base `inclusionAI/LingSante-3.1-air-VL` comparte arquitectura y parámetros (124B totales, 5,5B activos, contexto 256K, licencia MIT), diferenciándose únicamente en el formato de pesos (safetensors frente a GGUF NVFP4). Para el resto de alternativas: no disponible.

## Limitaciones y advertencias

- Modelo de investigación, no un dispositivo médico certificado: las salidas requieren verificación por personal cualificado y no sustituyen consejo, diagnóstico ni tratamiento profesional.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en contexto clínico.
- Idiomas: solo inglés según la model card; no hay soporte multilingüe declarado.
- La cuantización NVFP4 está optimizada para hardware Blackwell; en GPUs sin Tensor Cores FP4 el rendimiento puede degradarse o no ser compatible.
- El contexto de 256K es del modelo original; en la prueba con llama.cpp se usó 16 384 tokens, y ventanas mayores incrementan el consumo de VRAM por el KV cache.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT permite uso comercial, pero la advertencia sobre uso clínico debe respetarse en producción.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación comunitaria de esta cuantización concreta.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/LingSante-3.1-air-VL-NVFP4-GGUF
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Archivo NVFP4: https://huggingface.co/prithivMLmods/LingSante-3.1-air-VL-NVFP4-GGUF/blob/main/LingSante-3.1-air-VL-NVFP4.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/LingSante-3.1-air-VL-NVFP4-GGUF/blob/main/LingSante-3.1-air-VL.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
