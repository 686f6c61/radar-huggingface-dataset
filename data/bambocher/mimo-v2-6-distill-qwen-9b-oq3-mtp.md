# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ3-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ3-mtp es una cuantización de precisión mixta del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, un modelo destilado de 9.653 millones de parámetros construido sobre la arquitectura Qwen (etiqueta `qwen3_5`). La cuantización la ha realizado el usuario bambocher con la herramienta oQ (oMLX v0.7.3), un esquema de cuantización de precisión mixta orientado al runtime MLX de Apple, lo que sitúa al modelo en el ecosistema de inferencia local sobre silicio de Apple (chips M-series).

El checkpoint combina capas cuantizadas a 3, 4, 5, 6 y 8 bits afines con grupo de 64, más una fracción en BF16, con un promedio efectivo de 4,518 bits por peso. El resultado ocupa 5,077 GiB (5,451 GB) frente a los aproximadamente 19 GB que requeriría el modelo en BF16, lo que permite ejecutarlo en equipos con memoria unificada modesta. Incluye además una cabeza MTP (multi-token prediction) de 0,243 mil millones de parámetros y un codificador visual de 0,456 mil millones, lo que indica que el modelo base es multimodal.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, sin model card descriptiva del modelo original, sin benchmarks publicados y sin licencia declarada. Es útil para quien quiera ejecutar el modelo base en MLX con huella de memoria reducida, pero no aporta información sobre capacidades, entrenamiento o evaluación que no provenga del modelo del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`), multimodal con torre de visión y cabeza MTP |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta afín con grupo de 64: 3, 4, 5, 6 y 8 bits, más BF16; promedio efectivo 4,518 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`) |
| Tamano del repositorio | 5,5 GB (5,451 GB / 5,077 GiB de pesos) |
| Desglose de componentes | Lenguaje: 8,954B (4,354 GB); visión: 0,456B (0,912 GB); cabeza MTP: 0,243B (0,185 GB) |
| Distribucion de cuantizacion | 3 bits: 67,544% de los pesos; 4 bits: 17,576%; 5 bits: 8,747%; 6 bits: 1,043%; 8 bits: 0,008%; BF16: 5,083% |
| Modelo base | bambocher/MiMo-V2.6-Distill-Qwen-9B |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo entrenado de forma independiente. La arquitectura subyacente corresponde a la familia Qwen (etiqueta `qwen3_5` en Hugging Face), con un tronco de lenguaje de 8,954 mil millones de parámetros, un codificador visual de 0,456 mil millones que confirma capacidades multimodales, y una cabeza de predicción multi-token (MTP) de 0,243 mil millones. La presencia de MTP sugiere soporte para decodificación especulativa o generación de varios tokens por paso, aunque la model card no documenta cómo se explota en inferencia.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. El nombre del modelo base indica que se trata de un destilado (Distill) sobre una base Qwen de 9B, pero se desconoce el profesor utilizado, la metodología de destilación y los datos empleados. La cuantización oQ aplica precisión mixta asignando 3 bits al 67,5% de los pesos (presumiblemente las capas menos sensibles) y manteniendo en BF16 el 5,1% (0,491B parámetros, probablemente embeddings, normas y capas críticas), lo que busca preservar calidad donde más impacta.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas por la arquitectura Qwen subyacente, no verificadas en la información disponible.
- Procesamiento de visión: el checkpoint incluye una torre visual de 0,456B parámetros, por lo que el modelo base es presumiblemente image-to-text; no se detalla qué tareas visuales soporta.
- Predicción multi-token (MTP): cabeza dedicada de 0,243B parámetros, orientada a acelerar la decodificación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking explícito: no disponible.
- Capacidades de audio: no disponibles; no hay componente de audio en el desglose.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el checkpoint de 5,077 GiB permite cargar un modelo de 9,6B parámetros en equipos Apple Silicon de 16 GB o 24 GB de memoria unificada, donde la versión BF16 (~19 GB) no cabría con margen para el contexto.
- Prototipado rápido de aplicaciones multimodales en MLX: al incluir torre de visión, sirve para experimentar con pipelines image-to-text en local sin depender de APIs, siempre que se valide la calidad tras la cuantización a 3 bits mayoritaria.
- Evaluación de cuantización de precisión mixta: útil como caso de estudio para comparar la degradación de un modelo destilado de 9B al aplicar 3 bits al 67,5% de los pesos frente al checkpoint original en BF16.
- Despliegue en estaciones de trabajo Apple para tareas de generación de texto de baja concurrencia: con 5 GB de pesos, cabe holgadamente en un M2 Pro/Max y deja espacio para caché KV en contextos medios.
- Pruebas de decodificación especulativa con MTP: la cabeza multi-token permite investigar técnicas de aceleración de generación en el runtime MLX.
- Base para ajuste fino ligero (LoRA) sobre MLX: el tamaño reducido del checkpoint facilita experimentos de adaptación en hardware de consumo, aunque la cuantización agresiva puede limitar la calidad del ajuste.
- Distribución de demos: el tamaño de 5,5 GB del repositorio hace viable empaquetar el modelo en imágenes de contenedor o artefactos descargables para demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la distribución de bits y el tamaño de almacenamiento, sin métricas de calidad (MMLU, HumanEval, GSM8K u otras) ni comparación con el checkpoint base en BF16.

## Requisitos de hardware

- VRAM/memoria unificada para inferencia: 5,077 GiB de pesos en el formato cuantizado; con caché KV y overhead del runtime MLX, se recomienda un mínimo de 8-10 GB de memoria disponible.
- GPU recomendadas: el formato es `mlx`, por lo que el destino natural son chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es directamente utilizable en CUDA sin reconversión.
- Cabe en GPU de consumo: sí, en equipos Apple con 16 GB o más de memoria unificada. En GPUs NVIDIA de consumo (RTX 3060 12 GB, RTX 4090 24 GB) requeriría convertir los pesos a otro formato (por ejemplo GGUF), no incluido en este repositorio.
- Opciones de despliegue: runtime MLX (mlx-lm / mlx-vlm según el caso) y la herramienta oMLX. No se proporcionan pesos en GGUF, vLLM ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ3-mtp (este) | 9,653B | no disponible | safetensors MLX, 4,518 bits/peso efectivos | no disponible | Cuantización de precisión mixta, incluye visión y MTP |
| bambocher/MiMo-V2.6-Distill-Qwen-9B (base) | 9,653B | no disponible | safetensors (presumiblemente BF16) | no disponible | Modelo original; mayor huella de memoria, sin degradación por cuantización |
| Qwen3 8B (referencia de familia) | ~8B | no disponible en esta ficha | safetensors, GGUF | no disponible en esta ficha | Familia arquitectónica citada por la etiqueta `qwen3_5`; comparación no verificada |

No se dispone de datos de rendimiento del modelo ni de sus alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifica término de uso, lo que impide determinar si el uso comercial está permitido. Es un bloqueo para producción hasta aclararlo con el autor.
- Cuantización agresiva: el 67,5% de los pesos está a 3 bits, lo que previsiblemente degrada la calidad frente al modelo base en BF16, especialmente en razonamiento matemático y código. No hay evaluación que cuantifique esa pérdida.
- Sin model card descriptiva: no hay información sobre datos de entrenamiento, alineación, idiomas ni sesgos, lo que dificulta evaluar riesgos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos de este checkpoint ni del base.
- Idiomas: no declarados; no se puede asumir un buen rendimiento en castellano sin pruebas.
- Formato restringido a MLX: no es portable a CUDA, ROCm ni CPU sin conversión, lo que limita su uso fuera del ecosistema Apple.
- Artefacto derivado sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo.
- La cabeza MTP y la torre de visión están incluidas, pero no se documenta cómo activarlas ni qué soporte tienen en el runtime MLX empleado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ3-mtp
- Modelo base: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog, repositorio o demo del modelo base: no disponibles en la información proporcionada.
