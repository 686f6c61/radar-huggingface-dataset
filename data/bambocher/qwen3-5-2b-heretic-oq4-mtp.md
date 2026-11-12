# bambocher/Qwen3.5-2B-heretic-oQ4-mtp

## Resumen

Qwen3.5-2B-heretic-oQ4-mtp es una versión cuantizada y "decensored" del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. El checkpoint combina tres transformaciones sobre el modelo base: una ablación de comportamiento (Heretic v2.0.0) que elimina los rechazos del modelo original, una cuantización mixta de precisión (oQ de oMLX v0.7.3) y la conservación intacta de la cabeza de predicción multi-token (MTP). El resultado es un modelo de 2.274 millones de parámetros con un peso efectivo medio de 6,504 bits por peso y un tamaño de repositorio de 1,9 GB.

El modelo está pensado para ejecutarse en Apple Silicon mediante MLX, ya que la librería declarada es mlx y los pesos están en formato safetensors cuantizado. La cuantización mixta asigna 4 bits al 56,8% de los pesos, 5 bits al 28,1%, 6 bits a una fracción mínima y mantiene en BF16 el 15% restante, lo que permite un equilibrio entre tamaño y fidelidad.

La relevancia de esta ficha radica en que documenta un caso de uso muy específico: modelos pequeños, cuantizados agresivamente y con la alineación de seguridad eliminada, orientados a experimentación local en hardware de consumo. Se trata de un artefacto derivado, no de un modelo oficial de Qwen, y su licencia no está declarada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza MTP (multi-token prediction) y torre de visión |
| Parametros totales | 2.274.069.824 (2,274 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta oQ: affine 4-bit group 64, 5-bit group 64, 6-bit group 64 y BF16; media efectiva 6,504 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), cuantizado |
| Desglose por componente | Lenguaje: 1,882B (1,139 GB); visión: 0,331B (0,663 GB); cabeza MTP: 0,061B (0,047 GB) |
| Tamano del repositorio | 1,9 GB (1,722 GiB de pesos) |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer multimodal que incorpora una torre de visión (0,331B de parámetros) y una cabeza de predicción multi-token (MTP) de 0,061B. La cabeza MTP permite generar varios tokens por paso de decodificación, lo que puede acelerar la inferencia especulativa. Esta versión derivada conserva la cabeza MTP intacta, según indica el autor.

Sobre el modelo base se aplicó Heretic v2.0.0, una técnica de ablación de comportamiento que modifica las activaciones en un rango de capas (start_layer_index 12, end_layer_index 23) con parámetros de preservación de buen comportamiento (0,9189), dirección de mal comportamiento (0,0008) y sobrecorrección relativa (0,9924), usando 14 vecinos. El resultado declarado es la reducción de rechazos de 97/100 a 0/100, con una divergencia KL de 0,1397 respecto al original. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF o DPO en esta versión derivada.

La cuantización oQ de oMLX v0.7.3 aplica precisión mixta por capas y grupos de 64, manteniendo en BF16 los tensores más sensibles (principalmente los asociados a visión y a la cabeza MTP) y comprimiendo el resto a 4 y 5 bits. El checkpoint fue recuantizado el 2026-11-12 con oMLX v0.7.3, por lo que versiones anteriores deben descargarse de nuevo.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-2B.
- Procesamiento de imágenes mediante la torre de visión integrada (0,331B de parámetros).
- Predicción multi-token (MTP) para decodificación especulativa y mayor throughput.
- Comportamiento sin rechazos: el autor reporta 0/100 rechazos frente a 97/100 del original.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación local en Apple Silicon: el formato MLX y el tamaño de 1,9 GB permiten cargar el modelo en un Mac con memoria unificada de 8 GB o superior, ideal para pruebas de prototipos sin GPU dedicada.
- Investigación sobre alineación y seguridad: la eliminación de rechazos (0/100) y la divergencia KL de 0,1397 lo convierten en un sujeto de estudio para analizar cómo la ablación de comportamiento afecta a la utilidad y a los sesgos.
- Decodificación especulativa: la cabeza MTP intacta permite implementar generación multi-token en pipelines de MLX, reduciendo la latencia en tareas de generación larga.
- Procesamiento de documentos con imágenes: la torre de visión integrada permite extraer texto o describir figuras en flujos de digitalización, aunque la cuantización de la visión a BF16 preserva su fidelidad.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de la cuantización mixta oQ (6,504 bits/peso) frente a cuantizaciones uniformes de 4 bits en tareas de razonamiento.
- Generación de contenido sin restricciones: para entornos de investigación donde se requiere estudiar la salida del modelo sin filtros de seguridad, con las advertencias legales y éticas correspondientes.
- Prototipado de asistentes multimodales: combinando texto e imagen en un modelo de 2,3B que cabe en memoria de consumo, útil para demos y pruebas de concepto.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-2B original |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB para los pesos en el formato cuantizado; se recomienda al menos 4 GB de memoria unificada o VRAM para margen de trabajo.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con MLX; no se garantiza compatibilidad con CUDA en esta versión.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada de 8 GB o superior; en GPUs NVIDIA de consumo requeriría conversión a otro formato (no disponible).
- Opciones de despliegue: MLX (librería declarada), oMLX para recuantización; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ4-mtp | 2,274B | No disponible | No disponible | safetensors MLX | Cuantización mixta, sin rechazos, MTP intacta |
| Qwen/Qwen3.5-2B | 2,274B (aprox.) | No disponible | No disponible | safetensors | Modelo base original, con rechazos (97/100) |
| Otras cuantizaciones de Qwen3.5-2B | 2,274B | No disponible | No disponible | GGUF, safetensors | No disponibles en la información proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos (0/100) implica que el modelo puede generar contenido que el original rechazaría; esto conlleva riesgos éticos y legales en producción.
- La divergencia KL de 0,1397 respecto al original indica una alteración medible del comportamiento, no solo de la seguridad.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; se debe contactar con el autor o consultar la licencia del modelo base Qwen3.5-2B.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta versión.
- La cuantización mixta (6,504 bits/peso) puede degradar ligeramente la fidelidad en tareas de razonamiento complejo frente al modelo en BF16.
- El formato MLX limita el despliegue a entornos Apple; no hay pesos GGUF ni compatibilidad declarada con CUDA.
- El modelo es un artefacto derivado no oficial, sin garantías de mantenimiento ni soporte por parte de Qwen.
- La fecha de creación (2026-11-12) y la actualización el mismo día sugieren un artefacto reciente y sin validación comunitaria (0 descargas, 0 likes).

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ4-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
