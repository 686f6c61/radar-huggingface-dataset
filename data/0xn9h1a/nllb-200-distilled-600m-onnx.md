# 0xn9h1a/nllb-200-distilled-600M-onnx

## Resumen

`0xn9h1a/nllb-200-distilled-600M-onnx` es una conversión al formato ONNX del modelo `facebook/nllb-200-distilled-600M`, la versión destilada del sistema de traducción automática multilingüe NLLB-200 (No Language Left Behind) publicado por Meta AI en 2022. El repositorio lo mantiene el usuario `0xn9h1a` y su propósito es facilitar el despliegue del modelo en entornos que consumen ONNX Runtime en lugar de PyTorch, lo que incluye aplicaciones de escritorio, servicios en contenedores ligeros y plataformas con aceleración específica.

El modelo subyacente es un transformer encoder-decoder de tipo M2M-100 con aproximadamente 600 millones de parámetros, entrenado por Meta para traducción entre 200 idiomas. La variante destilada reduce el coste computacional respecto al NLLB-200 completo (54.500 millones de parámetros en su versión MoE) manteniendo una calidad razonable para traducción de propósito general.

La relevancia de esta ficha radica en que el repositorio es una conversión de terceros con escasa documentación: no incluye información sobre el proceso de exportación, las opsets utilizadas, la tokenización empaquetada ni los idiomas efectivamente cubiertos en los artefactos publicados. Cualquier evaluación debe partir de esa base y verificar directamente los ficheros del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100, tag `m2m_100`) |
| Parametros totales | Aproximadamente 600 M (heredado de `facebook/nllb-200-distilled-600M`) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el NLLB-200 original usa secuencias de hasta 512 tokens, pero no se confirma en esta conversion) |
| Tipos de cuantizacion | No disponible (el repositorio solo declara formato ONNX; no se especifica si los grafos son fp32, fp16 o int8) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base cubre 200 idiomas, pero no se confirma el alcance efectivo de esta conversion) |
| Licencia | `cc-by-nc-4.0` segun los tags del repositorio (uso no comercial); el campo de licencia aparece como "no disponible" |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia M2M-100, un transformer encoder-decoder con atención multi-cabeza estándar y embeddings de idioma explícitos que permiten dirigir la traducción mediante tokens de código de lengua (por ejemplo, `spa_Latn` o `eng_Latn`). La variante destilada de 600 M se obtuvo por Meta mediante destilación de conocimiento a partir del modelo NLLB-200 de mayor tamaño, con el objetivo de reducir latencia y requisitos de memoria manteniendo una fracción significativa de la calidad del profesor.

No se dispone de información en la documentación proporcionada sobre el número exacto de tokens de entrenamiento, la composición del corpus, el uso de RLHF o DPO, ni sobre innovaciones técnicas específicas de esta conversión ONNX (opsets, optimizaciones de grafo, fusión de operadores o soporte de decodificación con caché KV). Tampoco se documenta si la exportación cubre únicamente el modo de inferencia greedy o también beam search, ni si incluye los ficheros de tokenizador SentencePiece necesarios para el preprocesado.

## Capacidades

- Traducción automática entre idiomas, heredada del modelo base NLLB-200 (200 lenguas en la versión original; alcance efectivo de esta conversión no verificado).
- Generación condicionada por token de idioma destino, típica de la familia M2M-100.
- Ejecución mediante ONNX Runtime, lo que permite despliegue sin PyTorch en CPU, GPU y aceleradores compatibles.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multimodal (visión, audio) ni modo de pensamiento explícito.
- Capacidades multilingües: dependen del modelo base; no confirmadas en los artefactos de este repositorio.

## Casos de uso

- Traducción por lotes en pipelines de datos: el formato ONNX permite integrar el modelo en procesos ETL que ejecutan ONNX Runtime en servidores sin GPU dedicada, traduciendo corpus documentales de forma offline.
- Servicios de traducción en contenedores ligeros: al no requerir el stack completo de PyTorch, el modelo puede empaquetarse en imágenes Docker de menor tamaño para APIs REST de traducción de baja concurrencia.
- Traducción en aplicaciones de escritorio o edge: ONNX Runtime ofrece builds para Windows, Linux y macOS, lo que facilita distribuir un motor de traducción local sin dependencias pesadas.
- Preprocesado multilingüe para otros modelos: traducción de consultas o documentos a un idioma pivote antes de pasarlos a un LLM o a un sistema de búsqueda, reduciendo la variabilidad lingüística del pipeline.
- Localización de contenido web o documentación: traducción de textos de producto con control del idioma destino mediante tokens de lengua, adecuada para volúmenes moderados donde no se justifica un servicio de traducción neuronal gestionado.
- Prototipado e investigación en traducción automática: el modelo sirve como línea base reproducible en ONNX para comparar con otros sistemas o para experimentar con cuantización posterior sobre los grafos exportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para esta conversión concreta. Como referencia orientativa del modelo base de 600 M en fp32, el peso ronda los 2,4 GB; en fp16, aproximadamente 1,2 GB. Estas cifras no están confirmadas para los artefactos ONNX publicados.
- GPU recomendadas: no disponibles. El tamaño del modelo base sugiere que cualquier GPU con 4-6 GB de memoria podría alojarlo en fp16, pero no se documenta el soporte de ejecución en GPU de esta exportación.
- Compatibilidad con GPU de consumo: probable en teoría por el tamaño del modelo base, pero no verificada para esta conversión.
- Opciones de despliegue: ONNX Runtime (CPU y, si el grafo lo permite, GPU con los execution providers correspondientes). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo de traducción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `0xn9h1a/nllb-200-distilled-600M-onnx` (esta ficha) | ~600 M | No disponible | No disponible (base: 200) | `cc-by-nc-4.0` (segun tags) | ONNX |
| `facebook/nllb-200-distilled-600M` | ~600 M | 512 tokens (modelo original) | 200 | CC-BY-NC-4.0 | safetensors / PyTorch |
| `facebook/m2m100_418M` | ~418 M | 1024 tokens (modelo original) | 100 | MIT | PyTorch |
| `Helsinki-NLP/opus-mt-*` (pares bilingües) | ~70-300 M por par | Variable | 2 por modelo | Principalmente Apache-2.0 o CC-BY | PyTorch, a veces ONNX |

La comparación con `m2m100_418M` resulta relevante por su licencia permisiva (MIT) frente a la restricción no comercial de NLLB. Los modelos Opus-MT ofrecen alternativas bilingües más ligeras y con licencias más flexibles, a costa de no cubrir 200 idiomas en un único checkpoint.

## Limitaciones y advertencias

- Repositorio de terceros con documentación mínima: no se especifican opsets, tipos de datos de los tensores, ni si se incluyen los ficheros de tokenizador necesarios; la integración requiere inspeccionar los artefactos directamente.
- Licencia `cc-by-nc-4.0` según los tags: restringe el uso comercial. Cualquier despliegue en producto debe revisarse legalmente, y el campo de licencia del repositorio figura como "no disponible", lo que añade ambigüedad.
- El modelo base NLLB-200 es conocido por sesgos de género y por un rendimiento desigual entre pares de idiomas, especialmente en lenguas de bajos recursos; estos sesgos se heredan en la conversión.
- Riesgo de alucinación y de traducciones fluentes pero incorrectas en dominios especializados (legal, médico, técnico), donde se recomienda revisión humana.
- Sin datos de benchmarks ni de evaluación propios de esta conversión: no hay evidencia publicada de que la exportación ONNX preserve la calidad del modelo original.
- Cero descargas y cero likes en el momento de la ficha: no hay señal de validación por parte de la comunidad.
- Fecha de creación registrada como 2026-11-11, posterior a la fecha habitual de publicación de este tipo de conversiones; conviene verificar la integridad y procedencia de los ficheros antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xn9h1a/nllb-200-distilled-600M-onnx
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper M2M-100: https://arxiv.org/abs/2010.11125
- Repositorio oficial NLLB de Meta: https://github.com/facebookresearch/fairseq/tree/nllb
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
