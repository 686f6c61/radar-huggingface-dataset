# richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic-GGUF

## Resumen
Qwen2.5-7B-Instruct-MPOA-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic, una variante "abliterated" (sin censura) del Qwen2.5-7B-Instruct de Alibaba. El autor, richardyoung, publica esta versión optimizada para su uso con llama.cpp y Ollama, incorporando cuantizaciones generadas con imatrix para preservar la calidad en precisiones reducidas. El modelo conserva la arquitectura transformer densa de Qwen2.5 con aproximadamente 7.600 millones de parámetros.

El interés de esta ficha radica en que combina dos tendencias: por un lado, la familia Qwen2.5, referencia en modelos abiertos de tamaño medio con buen rendimiento en razonamiento, código y multilingüismo; por otro, la técnica de "abliteration", que elimina las capas de rechazo del modelo alineado, dando lugar a un modelo sin restricciones de contenido que puede ser útil para investigación sobre seguridad, análisis de sesgos o generación creativa sin filtros.

Es importante señalar que el acceso al repositorio está restringido (gated) y que el modelo está pensado para investigación, no para despliegues comerciales sin una evaluación previa de riesgos. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parámetros totales | 7.615.616.512 (~7,6 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el Qwen2.5-7B-Instruct base soporta 32.768 tokens, pero no se confirma para esta variante) |
| Tipos de cuantización | GGUF con múltiples niveles (imatrix); niveles concretos no disponibles |
| Idiomas soportados | Inglés (según la etiqueta del repositorio); el modelo base Qwen2.5 es multilingüe, pero esta variante declara solo en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, entrenado originalmente por Alibaba sobre un corpus multilingüe masivo (el detalle exacto de tokens y composición no se especifica en la información disponible). Sobre esa base, el autor aplicó una técnica de "abliteration" (MPOA, presumiblemente una variante de modificación de pesos para eliminar direcciones de rechazo) para obtener la versión heretic, que elimina los mecanismos de negativa del modelo alineado.

Posteriormente, el modelo resultante se cuantizó a GGUF usando imatrix (matriz de importancia) para minimizar la pérdida de calidad en precisiones bajas. No se dispone de información sobre el proceso exacto de abliteración, el volumen de datos usado en el ajuste ni si hubo etapas adicionales de RLHF o DPO tras la modificación. La innovación principal es la combinación de abliteración con cuantización optimizada para inferencia local.

## Capacidades
- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas de complejidad media.
- Generación de código y explicaciones técnicas.
- Matemáticas básicas e intermedias.
- Capacidad multilingüe limitada según la etiqueta (solo inglés declarado), aunque el base Qwen2.5 soporta varios idiomas.
- Sin filtros de contenido (abliterated): responde a peticiones que el modelo alineado rechazaría.
- Soporte de tool calling y function calling (heredado del Instruct base, aunque no se confirma en esta variante).
- Modo conversacional con plantilla de chat de Qwen2.5.
- No se declaran capacidades de visión, audio ni modo thinking explícito.

## Casos de uso
- Investigación sobre seguridad y alineación: analizar cómo un modelo sin capas de rechazo responde a prompts sensibles, comparando con la versión alineada para estudiar mecanismos de negativa.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera contenido adulto o temas controvertidos, con la advertencia de revisión humana.
- Evaluación de sesgos: estudiar qué sesgos emergen cuando se eliminan los filtros de alineación, útil para auditorías de modelos.
- Despliegue local en entornos con recursos limitados: al estar en GGUF, puede ejecutarse en estaciones de trabajo con GPU consumer o incluso CPU, usando llama.cpp u Ollama.
- Prototipado rápido de asistentes conversacionales: gracias a su tamaño de 7,6 B y formato GGUF, permite iterar en local sin infraestructura cloud.
- Red teaming de sistemas: generar respuestas adversarias para probar la robustez de filtros y clasificadores de contenido en pipelines de moderación.
- Educación e investigación lingüística: analizar diferencias entre modelos alineados y no alineados en tareas de generación abierta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: depende de la cuantización; para un modelo de 7,6 B, Q4_K_M requiere aproximadamente 4,5-5 GB, Q5_K_M unos 5,5-6 GB, Q8_0 unos 8 GB y FP16 unos 15 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; también funciona en CPU con llama.cpp.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más usando cuantizaciones Q4/Q5; en 6 GB con cuantizaciones más agresivas (Q3).
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python); no se garantiza compatibilidad con vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic-GGUF | ~7,6 B | No disponible | Apache 2.0 | GGUF | Variante abliterated, acceso restringido |
| Qwen2.5-7B-Instruct (oficial) | ~7,6 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Alineado, multilingüe, benchmarks públicos |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Alternativa europea, buen rendimiento general |
| Llama-3.1-8B-Instruct | ~8 B | 128.000 tokens | Llama 3.1 Community License | Safetensors, GGUF | Contexto mucho mayor, licencia con restricciones |

## Limitaciones y advertencias
- Modelo abliterated: elimina los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso; requiere supervisión humana y filtros externos en producción.
- Riesgo elevado de alucinación, similar al del base Qwen2.5-7B, sin mejoras específicas.
- Idiomas declarados: solo inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado o en entornos corporativos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación puede incumplir políticas de plataformas o normativas locales.
- No se dispone de información sobre la longitud de contexto efectiva en esta variante; podría diferir del base.
- Repositorio con pocas descargas (518) y un solo like: comunidad reducida, menor validación externa.
- El proceso de cuantización imatrix puede introducir degradaciones en tareas de razonamiento complejo frente al modelo en FP16.

## Enlaces
- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic-GGUF
- Modelo base (no cuantizado): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
