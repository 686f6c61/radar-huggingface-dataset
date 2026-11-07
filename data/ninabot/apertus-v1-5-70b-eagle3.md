# ninabot/Apertus-v1.5-70B-EAGLE3

## Resumen

Apertus-v1.5-70B-EAGLE3 es un modelo borrador (draft model) para decodificación especulativa basado en la técnica EAGLE3, publicado por el usuario ninabot sobre el modelo base swiss-ai/Apertus-v1.5-70B. No se trata de un modelo de lenguaje completo, sino de una cabeza predictiva ligera de 2.214.649.856 parámetros que se acopla al modelo objetivo de 70B para proponer tokens candidatos que el modelo grande verifica en paralelo, acelerando así la generación sin alterar la distribución de salida.

El modelo base, Apertus 1.5, es una familia de modelos de 8B y 70B desarrollada por Swiss AI (swiss-ai) y publicada el 24 de julio de 2026 bajo licencia Apache 2.0. Apertus 1.5 amplía la versión 1.0 con comprensión de imágenes, modo de razonamiento opcional (thinking mode), una ventana de contexto cuatro veces mayor (hasta 262.144 tokens), mejor seguimiento de instrucciones y uso de herramientas más robusto.

La relevancia de este artefacto es práctica: permite desplegar Apertus 1.5 70B con decodificación especulativa en vLLM, reduciendo la latencia de generación en entornos de producción sin necesidad de reentrenar el modelo objetivo. El repositorio está restringido (gated) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE3 (cabeza borrador para decodificación especulativa) sobre transformer Apertus 1.5 70B |
| Parametros totales | 2.214.649.856 (modelo borrador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el borrador; el modelo base soporta hasta 262.144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe amplio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto implementa EAGLE3, una variante de decodificación especulativa en la que una cabeza ligera predice varios tokens futuros a partir de las representaciones ocultas del modelo objetivo. El borrador propone una secuencia candidata y el modelo de 70B la valida en una sola pasada, aceptando el prefijo correcto y descartando el resto. El resultado es una reducción de latencia con salida idéntica a la del modelo base en la práctica, ya que la verificación garantiza la consistencia distribucional.

No se dispone de información sobre el dataset de entrenamiento del borrador, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de alineación adicionales. El modelo base Apertus 1.5 incorpora comprensión de imágenes, modo de razonamiento opcional y contexto de 262.144 tokens, pero la ficha del borrador no detalla cómo se transfieren estas capacidades al proceso especulativo. El repositorio declara compatibilidad con vLLM y el tag `llama`, lo que sugiere integración con el stack de inferencia de vLLM para decodificación especulativa.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa sobre Apertus 1.5 70B.
- Generación de tokens candidatos verificados por el modelo objetivo, manteniendo la fidelidad de la salida.
- Integración con vLLM como motor de despliegue (tag `vllm` en el repositorio).
- No es un modelo autónomo: no genera texto por sí mismo sin el modelo objetivo.
- No se documentan capacidades propias de tool calling, agentes, visión o multilingüismo en el borrador; estas residen en el modelo base.
- No se documenta soporte de thinking mode en el borrador, aunque el modelo base lo ofrece.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Apertus 1.5 70B con este borrador en vLLM para reducir el tiempo hasta el primer token y el tiempo por token en conversaciones multi-turno con contexto largo (hasta 262.144 tokens en el modelo base).
- Generación de código en producción: acelerar la autocompletación y generación de fragmentos en IDE o pipelines de CI/CD donde la latencia por token es crítica, manteniendo la calidad del modelo de 70B.
- Atención al cliente automatizada: servir respuestas en tiempo real a volúmenes altos de conversaciones concurrentes, aprovechando la verificación del modelo grande para evitar degradación de calidad.
- Procesamiento de documentos largos: resumir o extraer información de contratos y expedientes que caben en la ventana de 262.144 tokens del modelo base, con throughput mejorado por la decodificación especulativa.
- Asistentes con uso de herramientas: acelerar bucles de razonamiento multi-paso donde el modelo base invoca funciones y encadena llamadas, reduciendo la latencia acumulada por paso.
- Investigación en decodificación especulativa: usar el artefacto como referencia para estudiar la eficacia de EAGLE3 sobre modelos de 70B con licencia Apache 2.0.
- Despliegue en clústeres con GPUs de gama alta: integrar el borrador en infraestructura existente de vLLM para aumentar el throughput por GPU sin cambiar el modelo servido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 4,4 GB en el formato del repositorio (safetensors, 2.214.649.856 parámetros); la VRAM total depende del modelo objetivo de 70B.
- El modelo objetivo Apertus 1.5 70B requiere GPUs de gama alta (A100 80 GB, H100 80 GB) en precisión completa o con cuantización adecuada; no se dispone de cifras oficiales en la información proporcionada.
- El borrador por sí solo no cabe ni funciona en GPU consumer sin el modelo objetivo; el conjunto completo no es viable en RTX 4090 (24 GB) en precisión nativa.
- Opciones de despliegue: vLLM (declarado en el repositorio); no se confirma soporte de llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ninabot/Apertus-v1.5-70B-EAGLE3 | 2.214.649.856 (borrador) | no disponible (base: 262.144) | Decodificación especulativa sobre Apertus 1.5 70B | Apache 2.0 | Gated en Hugging Face |
| swiss-ai/Apertus-v1.5-70B | 70B | 262.144 | Modelo de lenguaje multimodal con thinking mode | Apache 2.0 | Hugging Face |
| swiss-ai/Apertus-v1.5-8B | 8B | 262.144 | Modelo de lenguaje multimodal con thinking mode | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros borradores EAGLE3 comparables en la búsqueda realizada.

## Limitaciones y advertencias

- El artefacto no es un modelo de lenguaje autónomo: sin el modelo objetivo Apertus 1.5 70B no produce salidas útiles.
- No se documentan sesgos específicos del borrador; los sesgos del sistema final dependen del modelo base.
- El riesgo de alucinación recae en el modelo objetivo; la verificación especulativa preserva la distribución de salida del modelo grande.
- No se detallan limitaciones de idioma del borrador; el modelo base es multilingüe, pero no se confirma el comportamiento del proceso especulativo en todos los idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026; no hay evidencia de validación comunitaria.
- No se especifican requisitos de versión de vLLM ni compatibilidad con otras herramientas de inferencia.
- El tamaño del borrador (2,2B parámetros) es elevado para una cabeza especulativa típica, lo que puede limitar la ganancia neta de latencia frente a alternativas más ligeras; no se han publicado mediciones al respecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ninabot/Apertus-v1.5-70B-EAGLE3
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-70B
- Anuncio de Apertus 1.5: https://apertus-ai.org/articles/2026-07-apertus-1-5/
