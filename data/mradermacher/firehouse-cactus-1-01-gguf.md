# mradermacher/Firehouse-Cactus-1.01-GGUF

## Resumen

Firehouse-Cactus-1.01-GGUF es una cuantización en formato GGUF del modelo Firehouse-Cactus-1.01, desarrollado por Ironwood-LLM-Team. El modelo base está etiquetado como basado en Gemma 4 (gemma4, unsloth, google) y está pensado para generación de texto conversacional en inglés. Esta versión, publicada por mradermacher, ofrece una serie de archivos GGUF con distintos niveles de cuantización (desde Q2_K hasta f16) para facilitar la ejecución local en hardware diverso.

El modelo tiene aproximadamente 7,46 mil millones de parámetros, lo que lo sitúa en la gama de modelos de tamaño medio. La licencia es Apache-2.0, aunque se enlaza a la licencia específica de Gemma 4. Al ser una cuantización, esta versión no modifica las capacidades del modelo original, pero introduce pérdida de precisión según el nivel de cuantización elegido.

Su relevancia actual radica en que permite desplegar un modelo de 7B en hardware de consumo, con múltiples opciones de compresión para adaptarse a diferentes presupuestos de memoria. No se ha publicado información detallada sobre el entrenamiento, arquitectura o benchmarks, por lo que esta ficha se basa únicamente en los datos disponibles en la página de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetas indican basado en Gemma 4) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (con enlace a licencia Gemma 4) |
| Formato de pesos | GGUF (el modelo base en safetensors) |

## Arquitectura y entrenamiento

No se proporciona información específica sobre la arquitectura interna (número de capas, atención, etc.) en la documentación disponible. Las etiquetas indican que se basa en Gemma 4, un modelo de Google, por lo que es probable que sea un transformer denso con atención de múltiples cabezas, pero no se confirma.

Tampoco se han publicado detalles sobre el entrenamiento: número de tokens, composición del dataset, métodos de alineación (RLHF, DPO, etc.) o innovaciones técnicas. La única información es que el modelo original está en safetensors y que esta versión GGUF es una cuantización estática realizada por mradermacher.

## Capacidades

- Generación de texto conversacional en inglés (según la etiqueta "conversational").
- No se han documentado capacidades específicas como tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se indica soporte para otros idiomas.
- No se mencionan modos de "thinking" ni funcionalidades especiales.

## Casos de uso

No se documentan casos de uso específicos en la información disponible. Dado su tamaño y naturaleza conversacional, podría emplearse en los siguientes escenarios, aunque no hay evidencia publicada:

- Asistente conversacional en inglés: generación de respuestas en diálogos multi-turno, aunque no se especifica longitud de contexto.
- Generación de texto creativo: redacción de artículos, historias o correos electrónicos en inglés.
- Resumen de textos: resumir documentos o artículos en inglés (capacidad no confirmada).
- Chatbot de atención al cliente: responder preguntas frecuentes en inglés, con integración en plataformas de mensajería.
- Etiquetado y clasificación de texto: categorización de contenidos en inglés.
- Prototipado rápido: desarrollo de aplicaciones de NLP en entornos con recursos limitados gracias a las cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los requisitos dependen del archivo GGUF elegido. La siguiente tabla estima la VRAM necesaria basándose en el tamaño del archivo y un overhead típico para inferencia (se considera que la VRAM debe ser al menos el tamaño del archivo más 1-2 GB para activaciones y buffers):

| Cuantizacion | Tamano (GB) | VRAM estimada minima | GPUs compatibles |
|---|---|---|---|
| Q2_K | 4.5 | 6 GB | RTX 3060, RTX 4060, GTX 1660 (8 GB) |
| Q3_K_M | 4.9 | 7 GB | RTX 3060, RTX 4060, GTX 1660 Ti |
| Q4_K_M | 5.4 | 8 GB | RTX 3060 (12 GB), RTX 4060 (8 GB) |
| Q5_K_M | 5.8 | 9 GB | RTX 3060 (12 GB), RTX 4070 (12 GB) |
| Q8_0 | 8.1 | 12 GB | RTX 3060 (12 GB), RTX 4070 Ti (12 GB), A2000 |
| f16 | 15.0 | 20 GB | RTX 4090, A6000, A100 (40 GB) |

- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier aplicación que soporte GGUF.
- También puede ejecutarse en CPU con llama.cpp, con mayor latencia.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables (ni del modelo base Firehouse-Cactus-1.01 ni de alternativas de la misma categoría). Se recomienda consultar el modelo base en HuggingFace para obtener más contexto.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización**: los archivos de menor tamaño (Q2_K, Q3_K) presentan mayor degradación en la calidad de las respuestas; se recomienda usar Q4_K_M o superiores si es posible.
- **Idioma**: el modelo está entrenado únicamente en inglés; no es adecuado para otros idiomas.
- **Licencia**: aunque la licencia es Apache-2.0, se enlaza a la licencia de Gemma 4, que puede imponer restricciones adicionales. Se debe revisar la licencia de Gemma 4 antes de uso comercial.
- **Alucinaciones**: como cualquier modelo de lenguaje, puede generar información falsa o no verificada.
- **Sesgos**: no se ha documentado sesgos específicos, pero es probable que los herede de los datos de entrenamiento.
- **Contexto limitado**: no se especifica la longitud de contexto, por lo que no se garantiza un buen manejo de diálogos largos o documentos extensos.
- **Sin garantías de producción**: no hay evidencia de pruebas en entornos de producción ni de su robustez en aplicaciones críticas.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/Firehouse-Cactus-1.01-GGUF
- Modelo base: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.01
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de LLM Explorer (para el modelo base 1.0): https://llm-explorer.com/model/Ironwood-LLM-Team%2FFirehouse-Cactus-1.0,6JUszgNx3wpJ8nGFoFKamj
