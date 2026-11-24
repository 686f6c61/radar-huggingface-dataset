# mradermacher/BLIP-Live-i1-GGUF

## Resumen

BLIP-Live es un modelo multimodal desarrollado por Salesforce, publicado originalmente en Hugging Face bajo el identificador `Salesforce/BLIP-Live`. La ficha que nos ocupa, `mradermacher/BLIP-Live-i1-GGUF`, es una conversión a formato GGUF realizada por el usuario mradermacher mediante cuantización con pesos ponderados e imatrix, lo que permite ejecutar el modelo en entornos de inferencia local optimizados para CPU y GPU de consumo.

El modelo cuenta con aproximadamente 35.500 millones de parámetros (35,5 B) según los datos reales de safetensors, lo que lo sitúa en la categoría de modelos grandes con capacidades presumiblemente multimodales (visión y lenguaje), dado el nombre BLIP y su origen en Salesforce. La conversión GGUF incluye una amplia variedad de cuantizaciones que van desde IQ1_S hasta Q6_K, lo que permite ajustar el uso de memoria según los recursos disponibles.

Esta ficha es relevante para desarrolladores e investigadores que necesiten desplegar un modelo multimodal de gran tamaño en infraestructura local o en la nube con GPUs de consumo, aprovechando el ecosistema llama.cpp y las cuantizaciones de baja precisión. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, benchmarks ni detalles de arquitectura más allá de lo inferible del nombre y el tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer multimodal tipo BLIP, sin confirmar) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado), con pesos originales en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por el nombre (BLIP-Live) y el origen (Salesforce), se trata presumiblemente de un modelo multimodal basado en la familia BLIP, que combina un codificador visual con un modelo de lenguaje para tareas de comprensión y generación de imagen-texto. Sin embargo, no se confirma ni el tipo de transformer, ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La model card del repositorio GGUF únicamente documenta el proceso de cuantización: se han generado cuantizaciones ponderadas con imatrix (matriz de importancia) a partir de los pesos originales en safetensors de `Salesforce/BLIP-Live`, con `quantize_version: 2` y `output_tensor_quantised: 1`. No se aportan detalles sobre innovaciones técnicas como decodificación especulativa, atención lineal u otras.

## Capacidades

- Generación de texto y conversación (la etiqueta `conversational` aparece en los tags del repositorio).
- Capacidades multimodales presumibles (visión-lenguaje) por el nombre BLIP y el origen Salesforce, aunque no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no confirmadas; la visión es plausible pero no documentada en la ficha.

## Casos de uso

- Asistencia conversacional multimodal en local: el modelo puede gestionar diálogos multi-turno con entrada de imagen y texto, aprovechando el formato GGUF para ejecución en llama.cpp con cuantizaciones Q4_K_M o Q5_K_M que equilibran calidad y memoria.
- Análisis de imágenes en entornos con recursos limitados: gracias a las cuantizaciones IQ2/IQ3, se puede desplegar en GPUs de consumo para tareas de captioning o respuesta a preguntas sobre imágenes, aunque con posible pérdida de calidad.
- Prototipado de aplicaciones visión-lenguaje: investigadores pueden usar las cuantizaciones Q6_K o Q5_K_M para evaluar el comportamiento del modelo antes de invertir en infraestructura para los pesos completos en safetensors.
- Despliegue en servidores sin GPU dedicada: las cuantizaciones Q4_0 y Q4_1 permiten inferencia en CPU con llama.cpp, adecuadas para entornos de desarrollo o pruebas de concepto.
- Integración en pipelines de generación aumentada por recuperación (RAG) multimodal: el modelo podría combinarse con bases de datos vectoriales de imágenes y texto, aunque la falta de documentación sobre tool calling limita la automatización.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantización, lo que permite a investigadores medir el impacto de la precisión en tareas multimodales concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (35,5 B parámetros):
  - Q6_K: ~29 GB (próximo al tamaño del repo de 29,4 GB).
  - Q5_K_M: ~24-25 GB.
  - Q4_K_M: ~20-21 GB.
  - Q3_K_M: ~16-17 GB.
  - IQ2_M: ~12-13 GB.
  - IQ1_S: ~7-8 GB (calidad muy degradada).
- GPU recomendadas: A100 40GB/80GB, H100 80GB para cuantizaciones altas (Q5/Q6); RTX 4090 (24 GB) para Q4_K_M o Q4_K_S; RTX 3090 (24 GB) similar; GPUs de 16 GB para Q3_K_M; GPUs de 12 GB para IQ2_M con riesgo de calidad.
- ¿Cabe en consumer GPU? Sí, en RTX 4090/3090 con Q4_K_M; en GPUs de 16 GB con Q3_K_M; en GPUs de 12 GB solo con cuantizaciones IQ2.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y potencialmente otros runners compatibles con GGUF. No se menciona soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables en la información suministrada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo original `Salesforce/BLIP-Live` antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real; probablemente esté optimizado para inglés, pero no se confirma.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran tamaño; sin benchmarks ni documentación de alineación, no se puede evaluar su magnitud.
- Cuantizaciones muy bajas (IQ1_S, IQ2_XXS) pueden degradar severamente la calidad, especialmente en tareas multimodales donde la precisión de los pesos visuales es crítica.
- Falta de documentación sobre arquitectura, contexto y entrenamiento: dificulta la evaluación rigurosa y la integración en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se confirma soporte de tool calling ni de agentes, lo que limita su uso en automatizaciones complejas.
- La fecha de creación (2026-11-24) es futura respecto a la fecha actual típica de consulta, lo que podría indicar un error en los metadatos o un repositorio programado; conviene verificar la integridad de los archivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BLIP-Live-i1-GGUF
- Modelo original: https://huggingface.co/Salesforce/BLIP-Live
