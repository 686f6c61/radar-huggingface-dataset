# mradermacher/SafeAtlas-Guard-2B-GGUF

## Resumen

SafeAtlas-Guard-2B-GGUF es una versión cuantizada en formato GGUF del modelo SafeAtlas-Guard-2B, desarrollado originalmente por zrwang1211 y cuantizado por mradermacher. Se trata de un modelo de moderación de seguridad multimodal (visión-lenguaje) diseñado para clasificar contenido según niveles de seguridad mediante clasificación ordinal. Su objetivo principal es servir como filtro o guardián en sistemas que necesitan evaluar imágenes y texto para detectar contenido potencialmente dañino o inapropiado.

El modelo base cuenta con aproximadamente 1.720 millones de parámetros (1.72B), lo que lo sitúa en la gama de modelos pequeños, adecuados para despliegue en entornos con recursos limitados. La versión GGUF incluye archivos de proyección multimodal (mmproj) que permiten procesar entradas visuales junto con texto. Aunque la información pública sobre su arquitectura interna y entrenamiento es escasa, su etiquetado como "multimodal-safety" y "ordinal-classification" indica que está especializado en tareas de moderación y evaluación de seguridad.

Esta ficha se centra en la versión cuantizada, que facilita la ejecución en CPU y GPU de baja gama, ampliando el acceso a capacidades de moderación de contenido en producción. La relevancia actual radica en la creciente necesidad de sistemas de seguridad automatizados para plataformas que manejan contenido generado por usuarios, especialmente en contextos donde los modelos grandes no son viables por coste o latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivos mmproj para el proyector multimodal) |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura interna del modelo SafeAtlas-Guard-2B. Por las etiquetas y el nombre, se infiere que se trata de un modelo de visión-lenguaje (VLM) que combina un codificador visual con un modelo de lenguaje, probablemente basado en transformer, pero no se confirma. El dataset de entrenamiento mencionado es zrwang1211/SafeAtlas-VL, del cual no se han publicado detalles sobre volumen, composición o metodología (RLHF, DPO, etc.). Tampoco se especifican innovaciones técnicas particulares. La cuantización GGUF realizada por mradermacher es estática, sin uso de matrices de importancia (imatrix), según se indica en la model card.

## Capacidades

- Moderación de contenido multimodal: evalúa imágenes y texto para clasificar su nivel de seguridad.
- Clasificación ordinal: asigna una puntuación o categoría ordinal de seguridad, útil para filtrar contenido en grados.
- Conversación: soporta interacción conversacional, aunque su función principal es la moderación.
- Soporte de entrada visual: gracias a los archivos mmproj, puede procesar imágenes junto con texto.
- Idioma: exclusivamente inglés (según la etiqueta "en").
- No se menciona soporte de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede analizar imágenes y textos subidos por usuarios para detectar contenido inapropiado (violencia, desnudez, odio) y clasificarlo en niveles de severidad, permitiendo a la plataforma aplicar políticas de forma automática.
- Filtrado de contenido en plataformas de citas o comunidades: integrado en el pipeline de subida de fotos, evalúa si una imagen cumple las normas de la comunidad antes de publicarse.
- Control parental en aplicaciones infantiles: actúa como guardián que bloquea o advierte sobre contenido no apto para menores, tanto en imágenes como en mensajes de texto.
- Moderación de chats en juegos online: analiza mensajes de texto y capturas de pantalla para prevenir acoso o lenguaje ofensivo, con baja latencia gracias a su tamaño reducido.
- Auditoría de contenido en archivos corporativos: revisa documentos e imágenes internas para asegurar que no contengan material sensible o inapropiado, cumpliendo políticas de cumplimiento.
- Evaluación de seguridad en sistemas de IA generativa: se utiliza como clasificador de salida para filtrar respuestas de otros modelos que puedan ser dañinas, actuando como capa de seguridad adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (1.2 GB), se necesitan aproximadamente 2 GB de VRAM si se incluye el proyector multimodal (mmproj). Para Q8_0 (1.9 GB), unos 3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060, o incluso integradas modernas. También puede ejecutarse en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar con transformers mediante la carga de GGUF (aunque es menos común).
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo de 2B, la generación es rápida en GPU moderna (típicamente >50 tokens/s en una RTX 4090) y aceptable en CPU (5-15 tokens/s).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de moderación de contenido (como Llama Guard, ShieldGemma, etc.) en términos de rendimiento y características. Los datos de benchmarks y especificaciones de estos modelos no están disponibles en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Idioma limitado: solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Tamaño reducido: al ser un modelo de 2B, su precisión en tareas complejas de moderación puede ser inferior a la de modelos más grandes (7B, 13B), especialmente en casos ambiguos.
- Licencia no especificada: no se indica la licencia del modelo base ni de la cuantización, lo que genera incertidumbre sobre su uso comercial y redistribución.
- Sesgos potenciales: no se han documentado sesgos, pero como todo modelo entrenado con datos, puede reflejar sesgos presentes en el dataset SafeAtlas-VL.
- Riesgo de alucinación: en tareas de clasificación ordinal, puede producir clasificaciones incorrectas, especialmente con entradas fuera de distribución.
- Sin información sobre entrenamiento: la falta de detalles sobre el proceso de entrenamiento dificulta evaluar su robustez y generalización.
- Fecha de creación futura: el modelo fue creado en agosto de 2026 (según los metadatos), lo que sugiere que es muy reciente y puede tener poca validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SafeAtlas-Guard-2B-GGUF
- Modelo base: https://huggingface.co/zrwang1211/SafeAtlas-Guard-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/zrwang1211/SafeAtlas-VL
