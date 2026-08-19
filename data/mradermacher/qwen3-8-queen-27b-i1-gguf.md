# mradermacher/Qwen3.8-Queen-27B-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo Qwen3.8-Queen-27B, preparadas por mradermacher a partir de los pesos originales publicados por aifeifei798. Se trata de un modelo de 27 320 millones de parámetros, cuyo nombre sugiere una variante o ajuste del modelo Qwen3.8-27B de Alibaba, aunque no se dispone de información oficial sobre el proceso de creación o las diferencias respecto al modelo base.

La relevancia de este repositorio radica en que ofrece el modelo en formato GGUF, lo que permite ejecutarlo en hardware de consumo mediante motores de inferencia como llama.cpp, Ollama o LM Studio, con múltiples niveles de cuantización para adaptarse a distintos límites de VRAM. Al estar etiquetado como "i1" (probablemente referido a imatrix), las cuantizaciones han sido optimizadas para reducir la pérdida de calidad en pesos de baja precisión.

No se proporcionan detalles sobre arquitectura, entrenamiento, licencia o capacidades específicas del modelo original, por lo que esta ficha se limita a los datos técnicos disponibles del repositorio GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta 262 144 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors originales convertidos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo Qwen3.8-Queen-27B. Dado el nombre y el tamaño, es probable que siga la arquitectura transformer de los modelos Qwen3.8 (con atención de ventana deslizante y posiblemente un codificador de visión, según los resultados web sobre Qwen3.8-27B), pero no se puede confirmar sin acceso a la documentación del modelo base.

Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio actual es únicamente una conversión a GGUF con cuantizaciones imatrix, realizada por mradermacher, sin modificaciones en los pesos.

## Capacidades

No se han documentado capacidades específicas para este modelo en la información proporcionada. Al tratarse de una cuantización de un modelo de 27 B, se espera que herede las capacidades del modelo base (generación de texto, razonamiento, código, posiblemente visión), pero no hay confirmación oficial.

- Generación de texto y conversación: presumiblemente similar a Qwen3.8-27B, aunque no verificado.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo de pensamiento o visión: no disponible.

## Casos de uso

Dado que no se dispone de información sobre las capacidades concretas del modelo, los casos de uso se infieren de su tamaño y formato:

- Inferencia local en hardware de consumo: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en GPUs con 12-24 GB de VRAM, permitiendo chatbots o asistentes privados sin conexión.
- Prototipado rápido con Ollama o LM Studio: al ser un archivo GGUF, se integra fácilmente en estas herramientas para pruebas de concepto.
- Generación de texto en aplicaciones de bajo presupuesto: las cuantizaciones pequeñas (Q2_K, IQ3_M) reducen los requisitos de memoria a costa de calidad, útiles para entornos con recursos limitados.
- Fine-tuning posterior: los pesos originales en safetensors (si se descargan del repositorio base) podrían usarse para ajuste fino, aunque el repositorio GGUF no es adecuado para entrenamiento.
- Evaluación de calidad de cuantización: investigadores pueden comparar el rendimiento entre distintos niveles de cuantización (Q2_K vs Q6_K) para estudiar el impacto en la perplejidad.
- Despliegue en servidores con vLLM o TGI: si se convierte a formato compatible, podría servir como modelo de producción, aunque no hay documentación al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar el rendimiento de este modelo con otros sin datos objetivos.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. Según los tamaños de archivo observados en el repositorio hermano (sin el sufijo i1):

- Q2_K: 10,9 GB → requiere al menos 12 GB de VRAM (p. ej., RTX 3060 12 GB, RTX 4070).
- Q4_K_S: 15,8 GB → requiere 16-20 GB de VRAM (p. ej., RTX 4080, RTX 3090).
- Q6_K: 22,4 GB → requiere 24 GB o más (p. ej., RTX 3090, RTX 4090, A5000).

- GPU recomendadas: NVIDIA RTX 30/40 series con 12-24 GB, o AMD Radeon con soporte ROCm.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o servidores compatibles con GGUF (llama-server).
- Latencia y throughput: no disponibles; dependerán de la GPU y de la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen3.8-27B (Apache 2.0, 262k contexto) podría compararse con otros modelos abiertos de 27-30 B como Llama 3.1 8B (menor tamaño) o Mistral Large 2 (mayor tamaño), pero no hay datos de rendimiento de esta variante "Queen".

## Limitaciones y advertencias

- Falta de documentación: no se conoce la licencia, los idiomas soportados ni las capacidades exactas del modelo, lo que impide un uso legal y técnico seguro en producción.
- Posible sesgo y alucinaciones: al ser un modelo de 27 B sin información sobre alineación, puede generar contenido incorrecto o sesgado.
- Calidad de cuantización: las cuantizaciones más agresivas (Q2_K, IQ1_M) degradan significativamente la calidad de salida; se recomienda usar Q4_K_M o superior para tareas críticas.
- Contexto limitado: aunque el modelo base soporta 262k tokens, no se confirma que esta variante lo mantenga; la ventana real puede ser menor.
- Sin soporte comercial garantizado: al desconocer la licencia, no se puede asegurar que el uso comercial esté permitido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-Queen-27B-i1-GGUF
- Repositorio del modelo base (aifeifei798): https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B
- Repositorio GGUF sin imatrix (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-Queen-27B-GGUF
- Artículo sobre Qwen3.8-27B (contexto general): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
