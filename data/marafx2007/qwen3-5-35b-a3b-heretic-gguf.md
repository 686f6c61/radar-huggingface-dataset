# marafx2007/Qwen3.5-35B-A3B-heretic-GGUF

## Resumen

El repositorio `marafx2007/Qwen3.5-35B-A3B-heretic-GGUF` contiene una colección de cuantizaciones GGUF del modelo base `brayniac/Qwen3.5-35B-A3B-heretic`. Este modelo base es una versión «abliterada» y «uncensored» de un modelo de la familia Qwen3.5, con aproximadamente 34.660 millones de parámetros, y por su nomenclatura se trataría presumiblemente de una arquitectura de Mixture of Experts con unos 3.000 millones de parámetros activos. La cuantización ha sido realizada por mradermacher y publicada en este repositorio por marafx2007.

La utilidad de esta publicación es ofrecer el modelo en formato GGUF, listo para motores de inferencia locales como llama.cpp, Ollama o LM Studio, con niveles de compresión que van desde Q2_K (12,9 GB) hasta Q8_0 (37,0 GB). Al tratarse de una versión etiquetada como «heretic», se espera que los mecanismos de rechazo de contenido hayan sido atenuados o eliminados, lo que resulta relevante para experimentos y aplicaciones que requieren una menor restricción en las respuestas.

La información disponible no incluye documentación técnica detallada sobre el modelo base, datos de entrenamiento ni benchmarks públicos. Por tanto, la evaluación de sus capacidades reales requiere pruebas adicionales por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de documentación explícita sobre la arquitectura del modelo base en la información proporcionada. El identificador `Qwen3.5-35B-A3B` y el número de parámetros (34.660.610.688) apuntan a un modelo de Mixture of Experts (MoE) con 35 mil millones de parámetros totales y alrededor de 3 mil millones activos, aunque esta circunstancia no está confirmada en la ficha técnica.

Tampoco se han facilitado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. Las etiquetas «heretic», «decensored» y «abliterated» indican que el modelo base ha sido sometido a un procedimiento de abliteración para eliminar o reducir los rechazos de contenido. El repositorio de HuggingFace `brayniac/Qwen3.5-35B-A3B-heretic` es el modelo base original, pero no se incluye información adicional sobre su proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, según la información de idiomas y etiquetas del repositorio.
- Disponibilidad de once cuantizaciones diferentes en formato GGUF, lo que permite adaptar el modelo a distintos entornos de hardware, desde CPU hasta GPU de alta memoria.
- El modelo base está etiquetado como «uncensored», «decensored» y «abliterated», lo que implica una respuesta menos restrictiva frente a contenidos que otros modelos de la misma familia rechazarían.
- No se han documentado capacidades específicas de tool calling, function calling, visión, audio ni modo de razonamiento intermedio.
- La etiqueta «endpoints_compatible» sugiere compatibilidad con despliegues en endpoints, aunque no se especifica el framework exacto.
- No incluye soporte para otros idiomas además de inglés en la configuración declarada.

## Casos de uso

- Chat local privado: desplegar el modelo con llama.cpp o Ollama en un entorno empresarial para gestionar consultas internas en inglés sin depender de servicios cloud, aprovechando la licencia Apache 2.0 para uso comercial.
- Generación de contenido creativo sin restricciones: producir narrativa, guiones o diálogos que aborden temas que los modelos con filtros de seguridad suelen rechazar, utilizando la versión abliterada para prototipado de contenido para adultos.
- Investigación en interpretabilidad y alineación: comparar las respuestas del modelo «heretic» con las de un Qwen3.5 estándar para estudiar el efecto de la abliteración sobre el comportamiento y los sesgos.
- Formación en seguridad de IA: emplear el modelo como caso práctico para analizar los riesgos de eliminar mecanismos de rechazo y las consecuencias en sistemas abiertos.
- Desarrollo de aplicaciones de asistencia en inglés: integrar el modelo en herramientas de apoyo a la escritura o resumen para equipos que necesitan una capa de generación de lenguaje con licencia permisiva.
- Evaluación de rendimiento en hardware local: probar las distintas cuantizaciones en tarjetas como RTX 4090, A100 o CPU para medir velocidad de inferencia, uso de VRAM y calidad de salida en una configuración determinada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No es posible comparar este modelo con alternativas mediante datos objetivos de rendimiento.

## Requisitos de hardware

Los requisitos de VRAM se estiman a partir del tamaño de cada cuantizacion GGUF, añadiendo una margen de sobrecarga para el runtime de inferencia:

- Q2_K (12,9 GB): necesita aproximadamente 16 GB de VRAM. Funciona en GPU de consumo con 16 GB (por ejemplo, RTX 4080 o 4090) o en CPU con suficiente memoria RAM.
- Q3_K_M (16,9 GB): requiere alrededor de 20-24 GB de VRAM. Adecuado para una RTX 4090 con 24 GB.
- Q4_K_S (20,0 GB): necesita unos 24 GB de VRAM. Recomendado por su equilibrio entre velocidad y calidad.
- Q4_K_M (21,3 GB): requiere alrededor de 24-28 GB de VRAM, compatible con una RTX 4090 o una A100 40GB.
- Q5_K_M (24,9 GB): necesita unos 28-32 GB de VRAM, lo que obliga a usar A100 40GB o configuraciones multi-GPU.
- Q8_0 (37,0 GB): requiere aproximadamente 40-48 GB de VRAM, adecuado para una A100 80GB o un sistema con varias GPUs de 24 GB en paralelo.

Para CPU, se puede emplear llama.cpp con las cuantizaciones más ligeras, priorizando Q2_K o Q3_K_S, aceptando una latencia mayor. Las opciones de despliegue incluyen llama.cpp, Ollama, LM Studio y posiblemente vLLM si se convierte el modelo a otro formato, aunque esto no está confirmado en la información. No se proporcionan datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. Se podría considerar como referencia el propio modelo base `brayniac/Qwen3.5-35B-A3B-heretic`, pero no existen datos objetivos para establecer una comparación técnica.

## Limitaciones y advertencias

- Solo está disponible para inglés, según la metadata del repositorio. Su rendimiento en otros idiomas no ha sido evaluado ni documentado.
- Al ser una versión «uncensored» y «abliterated», el modelo tiene un mayor riesgo de generar contenido dañino, ilegal o socialmente inaceptable. Debe usarse con precaución en entornos públicos y verificar el cumplimiento de la legislación aplicable.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que el rendimiento real en tareas de razonamiento, código o matemáticas es desconocido.
- La longitud de contexto no está especificada, lo que impide planificar aplicaciones que requieran ventanas de contexto largas.
- Los sesgos inherentes del modelo no han sido estudiados y podrían reproducir estereotipos o discriminaciones presentes en los datos de entrenamiento originales.
- La licencia Apache 2.0 permite uso comercial, pero en el caso de este repositorio concreto no se garantiza el cumplimiento de los términos del modelo base original, aunque se indica la misma licencia.

## Enlaces

- Repositorio principal: https://huggingface.co/marafx2007/Qwen3.5-35B-A3B-heretic-GGUF
- Modelo base: https://huggingface.co/brayniac/Qwen3.5-35B-A3B-heretic
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-heretic-i1-GGUF
