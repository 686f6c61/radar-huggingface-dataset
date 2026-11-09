# mradermacher/LFM3-VL-2B-i1-GGUF

## Resumen

LFM3-VL-2B-i1-GGUF es una redistribución en formato GGUF del modelo LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje (VLM) de aproximadamente 2B parámetros desarrollado por Liquid AI. Esta versión concreta la publica mradermacher, autor conocido por generar cuantizaciones GGUF de terceros con matrices de importancia (imatrix) para uso en llama.cpp y derivados. El sufijo "i1" indica cuantización de tipo imatrix de primera generación, orientada a preservar calidad con menor número de bits.

El modelo base pertenece a la familia LFM3 (Liquid Foundation Model 3) de Liquid AI, diseñada para despliegue en dispositivos de borde (edge/on-device) con capacidades multimodales: procesamiento de imagen, OCR, comprensión de documentos y vídeo, además de conversación multilingüe. La relevancia de esta ficha radica en que ofrece una vía práctica de ejecutar un VLM compacto en hardware de consumo mediante GGUF, aunque la información publicada en el repositorio es muy escasa y muchos parámetros técnicos no están confirmados.

Cabe advertir que el dato de "parámetros totales: 899.013" que aparece en los metadatos de Hugging Face no concuerda con el tamaño nominal de 2B del modelo base; probablemente refleja un recuento parcial o erróneo de tensores en el repo GGUF, por lo que debe tratarse con cautela. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo aparece como 0.0 GB, lo que sugiere metadatos incompletos o un repositorio recién creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL de Liquid AI; arquitectura exacta no confirmada en la información disponible) |
| Parametros totales | 2B nominales (modelo base); metadatos del repo GGUF indican 899.013, dato inconsistente |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL), Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible en este repo; el modelo base se etiqueta con 16 idiomas en repos relacionados |
| Licencia | no disponible en este repo; el modelo base figura como lfm1.0 en repos relacionados |
| Formato de pesos | GGUF (incluye proyector multimodal mmproj, salvo quants con skip_mmproj) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la familia a la que pertenece (LFM3-VL de Liquid AI) y por las etiquetas asociadas en repos relacionados (vision-language, multimodal, edge, on-device), se trata de un modelo transformer multimodal que combina un codificador visual con un decodificador de lenguaje, optimizado para inferencia en dispositivos con recursos limitados. No se confirma si emplea componentes híbridos (SSM/atención lineal) propios de otras iteraciones de Liquid AI.

Respecto al entrenamiento, no se dispone de datos sobre número de tokens, composición del dataset ni si hubo RLHF o DPO. La model card del repositorio de mradermacher solo documenta el proceso de cuantización (quantize_version 2, output_tensor_quantised 1, convert_type hf, quants generados con imatrix), no el entrenamiento del modelo original. Cualquier afirmación sobre innovaciones técnicas del entrenamiento (decodificación especulativa, atención lineal, etc.) no está respaldada por la información disponible.

## Capacidades

- Generación de texto y conversación multimodal: el modelo base es un VLM (image-text-to-text), por lo que acepta entradas de imagen y texto y produce texto.
- Procesamiento de imagen: comprensión de contenido visual según las etiquetas del modelo base (vision-language, multimodal).
- OCR y comprensión de documentos: etiquetas del ecosistema LFM3-VL indican soporte de OCR y document.
- Comprensión de vídeo: la etiqueta video aparece en repos relacionados del mismo modelo base.
- Capacidades multilingües: el modelo base se etiqueta con 16 idiomas en repos relacionados; este repo concreto no declara idiomas.
- Despliegue local/on-device: orientado a edge y local-llm, apto para ejecución en hardware de consumo mediante GGUF.
- Tool calling / function calling: no disponible (no confirmado en la información proporcionada).
- Modo thinking / razonamiento multi-paso: no disponible (no confirmado).
- Capacidades de audio: no disponible.

## Casos de uso

- OCR y digitalización de documentos: ejecutar el modelo con llama.cpp o similar para extraer texto de facturas, formularios o capturas, aprovechando su orientación a document y OCR en hardware local sin enviar datos a la nube.
- Asistente visual en el escritorio: integrar el GGUF en una aplicación de escritorio que responda a preguntas sobre capturas de pantalla o imágenes locales, gracias a su tamaño de 2B y formato GGUF compatible con llama.cpp.
- Análise de imágenes en entornos sin conectividad: desplegar el modelo en dispositivos edge (Raspberry Pi, mini-PC, portátiles sin GPU dedicada) para clasificación y descripción de imágenes en campo, donde no hay acceso a APIs externas.
- Moderación y descripción de contenido visual: usar el modelo para generar descripciones automáticas de imágenes en pipelines de accesibilidad (texto alternativo) con cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y VRAM.
- Prototipado de asistentes multimodales: emplear las cuantizaciones pequeñas (Q2_K, IQ2_M) para experimentar con pipelines VLM en entornos de desarrollo con recursos muy limitados antes de escalar a modelos mayores.
- Extracción de información de vídeo: en escenarios donde se requiera procesar fotogramas o clips cortos y resumir su contenido, usando la variante con proyector multimodal incluido (evitar quants marcados con skip_mmproj si se necesita visión).
- Chat multilingüe local: si el modelo base confirma sus 16 idiomas, servir como chatbot de escritorio multilingüe con contexto visual, en cuantización Q4_K_M para GPU de 8 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 2B parámetros en GGUF, las cuantizaciones Q4_K_M ocupan aproximadamente 1,3-1,5 GB de pesos, más overhead de contexto y del proyector visual (mmproj). Las cuantizaciones Q2_K/IQ2 pueden bajar de 1 GB; Q6_K se aproxima a 2 GB. Estas cifras son estimaciones por tamaño nominal y no están confirmadas en la información disponible.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 4090 sobrada). Para Q6_K o contexto largo, se recomienda 8 GB o más.
- Cabe en consumer GPU: sí, previsiblemente en GTX 1650 4 GB, RTX 3050 6 GB, RTX 3060 12 GB, RTX 4060 8 GB y similares, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), LM Studio, y servidores compatibles con GGUF. vLLM y TGI no son la vía natural para este repo GGUF, aunque podrían usarse con el modelo base en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-i1-GGUF (este) | 2B nominales | no disponible | no disponible (base: lfm1.0) | GGUF | Cuantización imatrix de terceros; repo con metadatos incompletos |
| LiquidAI/LFM3-VL-2B (base) | 2B | no disponible | lfm1.0 (según repos relacionados) | safetensors | Modelo original de Liquid AI; referencia para comparar calidad |
| mradermacher/LFM3-VL-2B-heretic-i1-GGUF | 2B | no disponible | lfm1.0 | GGUF | Variante "heretic" (abliterated/uncensored) del mismo base; útil si se requiere menor censura |
| mradermacher/lfm3-vl-2b-heretic-GGUF | 2B | no disponible | no disponible | GGUF | Otra variante heretic sin sufijo i1; comparar calidad de cuantización |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Metadatos inconsistentes: el recuento de parámetros del repo (899.013) no concuerda con el tamaño nominal de 2B; verificar antes de planificar despliegues.
- Información de licencia ausente en este repo: el modelo base se asocia a lfm1.0 en repos relacionados, pero no se confirma aquí; es imprescindible revisar la licencia del modelo base antes de uso comercial.
- Idiomas no declarados en este repo: la cobertura multilingüe (16 idiomas) proviene de repos relacionados, no de esta ficha.
- Riesgo de alucinación: inherente a modelos de 2B; esperable mayor tasa de errores factuales que en modelos de mayor tamaño, especialmente en OCR de documentos complejos.
- Cuantizaciones agresivas (Q2_K, IQ1_S, IQ2_XXS) degradan notablemente la calidad; para uso en producción se recomienda Q4_K_M o superior.
- Proyector multimodal: algunos quants pueden omitir mmproj (skip_mmproj); si se necesita visión, comprobar que el archivo incluye el proyector.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de pruebas de terceros sobre la calidad de estas cuantizaciones.
- Sin datos de benchmarks: no es posible comparar objetivamente su rendimiento con alternativas sin pruebas propias.
- Contexto desconocido: planificar pipelines asumiendo ventanas cortas hasta confirmar el máximo soportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-VL-2B-i1-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante heretic i1: https://huggingface.co/mradermacher/LFM3-VL-2B-heretic-i1-GGUF
- Variante heretic GGUF: https://huggingface.co/mradermacher/lfm3-vl-2b-heretic-GGUF
