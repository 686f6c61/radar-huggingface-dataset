# orcarouter/Hy4-flash-abliterated-GGUF

## Resumen

Hy4-flash-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo Hy4-flash-abliterated, un derivado del modelo Hunyuan Hy4-flash de Tencent al que se le ha aplicado una técnica de "abliteration" para eliminar los mecanismos de rechazo entrenados, dando como resultado un modelo sin censura (uncensored). Lo publica el usuario orcarouter en Hugging Face y está pensado para ejecución local mediante llama.cpp y otros runners compatibles con GGUF.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 218.938.353.741 parámetros totales (aproximadamente 219 mil millones), según los datos de safetensors del modelo original. Solo se distribuyen pesos en formato GGUF, con cuantizaciones de precisión mixta generadas mediante imatrix, lo que permite reducir el tamaño del repositorio (612 GB) frente a los pesos completos en bf16.

Es relevante ahora porque ofrece una vía para ejecutar localmente un modelo MoE de gran escala sin censura, con soporte para inglés y chino, aunque el acceso está restringido (gated) y la licencia es la propia de Tencent (tencent-hy-license), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parámetros totales | 218.938.353.741 (~219 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con precisión mixta e imatrix (niveles concretos no disponibles) |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license (acceso gated) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo es de tipo MoE (mezcla de expertos), con 218.938.353.741 parámetros totales, y que deriva del Hunyuan Hy4-flash de Tencent. La técnica de abliteration se aplica sobre el modelo base Hy4-flash-abliterated para eliminar las direcciones de activación asociadas al rechazo, de modo que el modelo deja de negarse a responder ante determinadas peticiones.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF/DPO) ni innovaciones técnicas específicas del modelo original en la información proporcionada. Las cuantizaciones GGUF se han generado con precisión mixta e imatrix, una técnica que calibra la cuantización por capa usando una matriz de importancia para preservar mejor la calidad en modelos grandes.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y respuesta multi-turno en inglés y chino.
- Modelo sin censura (abliterated/uncensored): no aplica rechazos entrenados ante peticiones sensibles.
- Ejecución local mediante llama.cpp y runners compatibles con GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades de agente y multi-step reasoning: no disponible en la información.
- Visión, audio o modo thinking: no disponible en la información.

## Casos de uso

- Despliegue local de un MoE de gran escala: gracias al formato GGUF y a las cuantizaciones de precisión mixta, se puede ejecutar en hardware propio con llama.cpp sin depender de APIs externas.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo al que se le ha eliminado el mecanismo de rechazo, comparándolo con el modelo original.
- Generación de texto creativo sin restricciones: útil para escritura de ficción, guiones o contenido que los modelos alineados suelen rechazar.
- Asistencia conversacional bilingüe inglés-chino: adecuado para aplicaciones que requieran conversación multi-turno en ambos idiomas.
- Experimentación con cuantización: las variantes con imatrix y precisión mixta sirven para evaluar el impacto de la cuantización en la calidad de un MoE de ~219 B.
- Prototipado de pipelines de text-generation: integrable en entornos locales compatibles con endpoints y llama.cpp para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 612 GB, por lo que se requieren varios discos o un almacenamiento NVMe de gran capacidad para descargar todas las cuantizaciones.
- VRAM estimada: no disponible con precisión; un MoE de ~219 B en GGUF requiere, según el nivel de cuantización elegido, desde decenas hasta más de cien GB de memoria. No se especifican los niveles concretos en la información.
- GPU recomendadas: no disponible en la información. Por el tamaño del modelo, no es viable en GPUs de consumo tipo RTX 4090 en su totalidad; se necesitarían configuraciones multi-GPU o offloading a RAM/CPU.
- Despliegue: llama.cpp y runners compatibles con GGUF; otras opciones (vLLM, TGI, Ollama) no están confirmadas en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-flash-abliterated-GGUF | ~219 B (MoE) | no disponible | tencent-hy-license | GGUF | Sin censura, acceso gated |
| Hy4-flash-abliterated (base) | ~219 B (MoE) | no disponible | tencent-hy-license | safetensors | Versión sin cuantizar del mismo modelo |
| Hunyuan Hy4-flash (original) | ~219 B (MoE) | no disponible | tencent-hy-license | no disponible | Modelo alineado de Tencent |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo abliterated, se han eliminado los mecanismos de rechazo: puede generar contenido sensible, ofensivo o inseguro sin filtros, lo que exige supervisión y políticas de uso en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay datos específicos de evaluación en la información.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado.
- Licencia tencent-hy-license: es necesario revisar las condiciones para uso comercial, ya que no es una licencia permisiva estándar.
- Acceso restringido (gated): requiere aceptar las condiciones en Hugging Face antes de descargar.
- El tamaño del repositorio (612 GB) y del modelo (~219 B) dificultan el despliegue en hardware de consumo.
- No se dispone de información sobre la longitud de contexto, lo que limita la planificación de aplicaciones con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Hy4-flash-abliterated-GGUF
- Modelo base sin cuantizar: https://huggingface.co/orcarouter/Hy4-flash-abliterated
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Tencent Hunyuan: https://huggingface.co/orcarouter/Hy4-flash-abliterated-GGUF (condiciones accesibles tras aceptar el acceso gated)
