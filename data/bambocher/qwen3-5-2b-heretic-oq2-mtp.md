# bambocher/Qwen3.5-2B-heretic-oQ2-mtp

## Resumen

Qwen3.5-2B-heretic-oQ2-mtp es una versión cuantizada y "descensurada" del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. El modelo original pertenece a la familia Qwen3.5 desarrollada por Alibaba Qwen, y en esta variante se ha aplicado la herramienta Heretic v2.0.0 para eliminar los mecanismos de rechazo (refusals), conservando intacta la cabeza de predicción multi-token (MTP). El checkpoint resultante se ha cuantizado con oQ (oMLX v0.7.3) usando cuantización de precisión mixta por tensor.

El modelo tiene 2.274 millones de parámetros totales, de los cuales 1.882 millones corresponden al modelo de lenguaje, 0.331 millones a la torre de visión y 0.061 millones a la cabeza MTP. La cuantización mezcla bloques afines de 2, 3, 4, 5 y 8 bits con pesos en BF16, resultando en un promedio efectivo de 5.069 bits por peso y un tamaño de almacenamiento de 1.342 GiB. El formato de pesos es safetensors y la librería de destino es MLX, lo que lo orienta a ejecución en Apple Silicon.

La relevancia de esta ficha es doble: por un lado, ilustra el ecosistema de variantes comunitarias que modifican el comportamiento de alineación de modelos base; por otro, muestra técnicas de cuantización de precisión mixta que permiten reducir un modelo multimodal de 2.274 millones de parámetros a poco más de 1,3 GiB manteniendo componentes en BF16 para preservar calidad. No obstante, la información pública disponible es escasa: no se indican benchmarks, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de visión + cabeza MTP), familia Qwen3.5; detalles de atención y capas no disponibles |
| Parametros totales | 2.274.069.824 (2.274B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 2-bit grupo 64, afín 3-bit grupo 128, afín 3-bit grupo 64, afín 4-bit grupo 64, afín 5-bit grupo 64, afín 8-bit grupo 64 y BF16; promedio efectivo 5.069 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo es una variante del Qwen3.5-2B original, que combina un modelo de lenguaje de 1.882B parámetros con una torre de visión de 0.331B y una cabeza de predicción multi-token (MTP) de 0.061B. La presencia de MTP sugiere soporte para decodificación especulativa o generación multi-token, aunque no se detallan los mecanismos exactos de atención ni el número de capas. La arquitectura concreta (transformer denso, híbrido, etc.) no se especifica en la información disponible.

El proceso de modificación consta de dos etapas. Primero, se aplicó Heretic v2.0.0, una herramienta de "decensura" que utiliza parámetros de ablación de rango arbitrario (ARA) con índices de capa 12 a 23, pesos de preservación de buen comportamiento de 0.9189, peso de dirección de mal comportamiento de 0.0008, peso de sobrecorrección relativa de 0.9924 y 14 vecinos. El resultado reportado es 0 rechazos en 100 prompts frente a 97 en el modelo original, con una divergencia KL de 0.1397 respecto al original. Segundo, se aplicó cuantización de precisión mixta con oQ (oMLX v0.7.3), distribuyendo bits según la sensibilidad de cada tensor: el 33,2% de los pesos lógicos quedan en 2-bit, el 46,2% en 3-bit, el 5,6% en 4-5 bits y el 15% restante en BF16. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF/DPO en el Qwen3.5-2B base.

## Capacidades

- Generación de texto y razonamiento: heredadas del Qwen3.5-2B base, aunque no se detallan capacidades específicas en la información disponible.
- Procesamiento de visión: incluye torre de visión de 0.331B parámetros, por lo que se espera soporte de entrada de imágenes, aunque no se documentan tareas concretas.
- Predicción multi-token (MTP): la cabeza MTP se conserva intacta, lo que habilita decodificación especulativa o generación de varios tokens por paso.
- Comportamiento sin rechazos: la modificación Heretic elimina los rechazos en pruebas internas (0/100), lo que cambia el perfil de respuestas del modelo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación Heretic (0 rechazos frente a 97) y su coste en divergencia KL (0.1397), útil para analizar trade-offs entre utilidad y salvaguardas.
- Evaluación de cuantización de precisión mixta: sirve para comparar la calidad de oQ con 5.069 bits/peso frente al modelo original en BF16, especialmente en tareas donde la torre de visión (mantenida en BF16) es crítica.
- Despliegue en Apple Silicon: al estar en formato MLX y ocupar 1.342 GiB, puede ejecutarse en Macs con memoria unificada moderada para prototipos locales de inferencia multimodal.
- Prototipado de decodificación especulativa: la cabeza MTP intacta permite experimentar con generación multi-token y medir aceleraciones en MLX.
- Pruebas de robustez ante prompts sensibles: el cambio drástico en la tasa de rechazos lo hace adecuado para estudiar cómo varía el comportamiento del modelo en dominios controvertidos.
- Experimentos académicos de multimodalidad de bajo coste: con 2.274B parámetros totales y 1,3 GiB de almacenamiento, es viable en entornos con recursos limitados para tareas de visión-lenguaje exploratorias.

## Benchmarks y rendimiento

La model card solo reporta métricas del proceso de decensura, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-2B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1397 | 0 (por definición) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.342 GiB de pesos en safetensors; con overhead de activaciones y caché KV, se estima un uso de memoria superior, no cuantificado en la información disponible.
- GPU recomendadas: al ser formato MLX, el destino principal es Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra); no se indica soporte para CUDA.
- ¿Cabe en consumer GPU? No se especifica compatibilidad con GPUs de consumo tipo RTX 4090; MLX está orientado a hardware Apple.
- Opciones de despliegue: MLX (librería declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ2-mtp | 2.274B (1.882B LM + 0.331B vision + 0.061B MTP) | no disponible | no disponible | safetensors (MLX) | Decensurado con Heretic, cuantización mixta oQ 5.069 bits/peso |
| Qwen/Qwen3.5-2B | 2.274B (estimado, mismo base) | no disponible | no disponible | no disponible | Modelo original con 97/100 rechazos |
| Alternativas de 2-3B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (mismo tamaño o misma tarea) más allá del modelo base.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no puede asumirse uso comercial sin verificar la licencia del modelo base Qwen/Qwen3.5-2B y las condiciones de Heretic.
- El proceso de decensura elimina los rechazos (0/100), lo que implica ausencia de salvaguardas en dominios sensibles; no es adecuado para producción orientada a usuarios finales sin filtros externos.
- La divergencia KL de 0.1397 respecto al original indica una desviación medible en la distribución de salidas, con posible degradación de calidad en tareas generales.
- La cuantización agresiva (33,2% de pesos en 2-bit) puede introducir pérdida de precisión adicional, especialmente en razonamiento y matemáticas; no se han publicado evaluaciones que lo cuantifiquen.
- No se especifican idiomas soportados; el rendimiento multilingüe es desconocido.
- No se detalla la longitud de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- El modelo está orientado a MLX; su uso en CUDA u otras plataformas no está documentado.
- Riesgo de alucinación: no evaluado en la información disponible; previsiblemente similar o superior al modelo base tras la modificación.
- Sesgos conocidos: no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ2-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
