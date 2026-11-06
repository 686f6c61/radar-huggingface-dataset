# OceanZ/qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-ct-w4a16-affine-g64

## Resumen

Este repositorio contiene una versión derivada del modelo Qwen/Qwen3.8-27B, publicada por el usuario OceanZ bajo el identificador `qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-ct-w4a16-affine-g64`. Se trata de un checkpoint de 27.781.427.952 parámetros (unos 27,8 mil millones) en formato safetensors, con un tamaño de repositorio de 18,2 GB, lo que indica pesos cuantizados en 4 bits. El nombre y las etiquetas de la model card (`mordred`, `excalibur`, `house-forged`) remiten a un pipeline interno de forja de modelos denominado Excalibur, atribuido a "liyue-harbor", con una familia de configuraciones etiquetada como `f2-frac-colnorm-skip16-s1p5`.

El modelo se presenta como "the house-forged free tail" del modelo base Qwen3.8-27B, fijado a un commit concreto (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y con los pesos verificados mediante sha256. La licencia declarada es Apache 2.0, heredada del modelo base. La model card no documenta el proceso de entrenamiento, los datos utilizados ni los benchmarks obtenidos, por lo que la mayor parte de las especificaciones técnicas de esta ficha no están disponibles.

La relevancia de esta publicación es limitada y muy específica: se trata de una variante experimental con 26 descargas y 0 likes en el momento de la consulta, sin documentación pública sobre qué modifica respecto al modelo base. Resulta adecuada únicamente para experimentación por parte de quienes ya conozcan el ecosistema Excalibur, no como sustituto directo del Qwen3.8-27B original en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (heredada de Qwen3.8-27B; variante no detallada) |
| Parámetros totales | 27.781.427.952 (≈27,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits), con esquema affine de grupo 64 según el identificador; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), repositorio de 18,2 GB |

## Arquitectura y entrenamiento

La arquitectura de base es la del modelo Qwen/Qwen3.8-27B, un transformer de aproximadamente 27,8 mil millones de parámetros. El identificador del repositorio codifica el pipeline de modificación aplicado: `f2-frac-colnorm-skip16-s1p5` sugiere una familia de ajustes que incluye normalización de columnas fraccional y algún tipo de conexión residual o salto con periodo 16 y escala 1,5; `ct-w4a16-affine-g64` indica cuantización post-entrenamiento a 4 bits en pesos y 16 bits en activaciones, con cuantización afín por grupos de 64. No obstante, la model card no describe estos componentes ni su implementación, por lo que la interpretación anterior es una lectura del nombre y no una especificación confirmada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card se limita a declarar el modelo base, el commit de referencia, la familia de configuración y la verificación por hash de los pesos.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se documentan evaluaciones específicas de esta variante.
- Generación de código y matemáticas: presumiblemente presentes por herencia del base, sin datos publicados que lo confirmen para este checkpoint.
- Tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Inferencia con pesos cuantizados: soportada mediante el formato compressed-tensors, orientada a despliegue con menor huella de memoria.

## Casos de uso

- Experimentación con cuantización w4a16: el checkpoint permite evaluar el impacto de la cuantización affine de grupo 64 sobre un modelo de 27,8 B, comparando calidad y latencia frente al base en precisión completa.
- Investigación sobre modificación de arquitectura: la familia `f2-frac-colnorm-skip16-s1p5` puede estudiarse como caso de intervención sobre normalización y conexiones residuales, siempre que se disponga del código del pipeline Excalibur.
- Despliegue en memoria ajustada: con 18,2 GB de pesos, el modelo cabe en GPUs de 24 GB y permite probar cargas de trabajo de generación de texto en hardware de gama alta de consumo.
- Reproducción de artefactos internos: el anclaje por sha256 y el commit fijo del base facilitan la verificación de integridad en entornos de investigación que auditan procedencia de pesos.
- Evaluación comparativa de variantes: útil para medir degradación respecto al Qwen3.8-27B original en tareas de texto, si se ejecutan los mismos benchmarks en ambos.
- Pruebas de compatibilidad de tooling: sirve para validar el soporte de compressed-tensors en frameworks de inferencia antes de adoptar variantes cuantizadas en un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 18-20 GB con los pesos w4a16 incluidos en el repositorio, más overhead de activaciones y caché KV según contexto.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para despliegues con contexto largo; RTX 4090 (24 GB) para pruebas con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con margen ajustado, en GPUs de 24 GB; en tarjetas de 16 GB requeriría reducir contexto o aplicar cuantización adicional.
- Opciones de despliegue: frameworks con soporte de compressed-tensors (por ejemplo, vLLM reciente); no se garantiza compatibilidad con llama.cpp u Ollama sin conversión previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-ct-w4a16-affine-g64 | ≈27,8 B | no disponible | w4a16 affine g64 | Apache 2.0 | Hugging Face, 26 descargas |
| Qwen/Qwen3.8-27B (base) | ≈27,8 B | no disponible | pesos originales | Apache 2.0 | Hugging Face, modelo de referencia |
| Otras variantes cuantizadas del mismo base | ≈27,8 B | no disponible | variable (GPTQ, AWQ, GGUF) | Apache 2.0 | Hugging Face, según autor |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación sobre entrenamiento, datos y evaluación: no es posible verificar qué cambia respecto al modelo base ni cuantificar su degradación.
- Riesgo elevado de alucinación y de comportamiento impredecible al tratarse de una modificación no validada públicamente.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingüe equivalente al del base.
- Longitud de contexto no especificada; el uso con contextos largos requiere validación empírica.
- Licencia Apache 2.0 declarada, pero la procedencia de los pesos modificados y la cadena de responsabilidad sobre el pipeline Excalibur no están auditadas públicamente.
- Popularidad mínima (26 descargas, 0 likes) y creado y actualizado el mismo día: no hay evidencia de mantenimiento ni de comunidad.
- Compatibilidad de despliegue limitada al ecosistema compressed-tensors; la conversión a otros formatos puede alterar los pesos.
- No recomendado para producción sin una evaluación propia exhaustiva frente al Qwen3.8-27B original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OceanZ/qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-ct-w4a16-affine-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del base referenciado: 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Documentación de compressed-tensors: no disponible en la información proporcionada
- Paper, blog o repositorio del pipeline Excalibur: no disponible en la información proporcionada
