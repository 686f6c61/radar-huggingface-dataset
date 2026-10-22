# kaitchup/Qwen3.8-27B-SLQ-EAR98

## Resumen

Qwen3.8-27B-SLQ-EAR98 es un checkpoint cuantizado de Qwen/Qwen3.8-27B publicado por The Kaitchup (Benjamin Marie). No es un modelo nuevo: es el modelo base de 27B comprimido con una versión personalizada de SLQ (Statistically-Lossless Quantization) y empaquetado para el runtime Humming de vLLM. La búsqueda de precisión combina varias fuentes de pesos cuantizados (GPTQ INT2–INT8 generado localmente, AutoRound de Kaitchup y GSQ de 3 bits de ISTA-DASLab) y elige la precisión proyección a proyección, incluidas cabezas de atención concretas, con caída selectiva a BF16 original.

El resultado son 23,732 GB de pesos (23.731.563.088 bytes) con un EAR medido de 98,000775 %, frente a los 55,563 GB del BF16 original. Es relevante porque demuestra que se puede servir un modelo de 27B con calidad estadística cercana al original ocupando menos de la mitad del espacio de pesos, algo útil cuando la VRAM es la restricción principal. El precio a pagar es la dependencia de un stack de inferencia muy concreto (vLLM 0.31.0 con soporte Humming y humming-kernels 0.1.16) y la ausencia de validación de las capacidades multimodales del modelo base.

Conviene subrayar que el EAR es una métrica de solapamiento de probabilidades, no una medida de precisión en tareas. El propio autor advierte de que no se ha establecido equivalencia estadística en tareas downstream para estas publicaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso del modelo base Qwen3.8-27B (visión-lenguaje), con pesos MTP (multi-token prediction) conservados en BF16; checkpoint cuantizado en precisión mixta y empaquetado para Humming |
| Parametros totales | 27B (modelo base); 7.495.194.352 elementos almacenados en safetensors (tensores empaquetados de baja precisión) |
| Longitud de contexto | 262.144 tokens (`--max-model-len 262144` en la configuración de vLLM validada) |
| Tipos de cuantizacion | Precisión mixta con enteros (candidatos INT2–INT8) más proyecciones y cabezas de atención seleccionadas en BF16 original; activaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados para el runtime Humming de vLLM (no hay GGUF publicado para este checkpoint) |

Datos adicionales: 23,732 GB de ficheros de pesos (tamaño de fichero, no memoria total de servicio); repo de 23,7 GB; pipeline `text-generation`; creado y actualizado el 21 de octubre de 2026; 0 descargas y 1 like en el momento de la consulta.

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base: un transformer denso de 27B de tipo visión-lenguaje, orientado a texto, imagen y vídeo, con procesamiento de contexto largo, tool calling y tareas agénticas. El autor conserva sin cambios los pesos MTP originales en BF16 y también los pesos y procesadores de visión del modelo base, aunque la validación publicada solo cubre texto.

Lo específico de esta publicación es el proceso de compresión. SLQ formula la cuantización como una búsqueda de precisión por proyección: en lugar de aplicar un único esquema global, se generan varios candidatos (GPTQ en el rango INT2–INT8 producido localmente, el checkpoint AutoRound `hum-high-MTP-17.7GB` y el GSQ de 3 bits de ISTA-DASLab), se añade el BF16 original como opción y se elige para cada proyección la precisión que maximiza el objetivo estadístico, con un objetivo declarado de EAR > 98 %. El EAR (Expected Acceptance Rate) mide el solapamiento entre las probabilidades del siguiente token del modelo BF16 de referencia y las del modelo comparado, renormalizadas ambas sobre los diez tokens más probables de la referencia. Un EAR de 0,99 significa un 99 % de solapamiento medio de probabilidad en ese soporte, no un 99 % de acierto en benchmarks ni respuestas idénticas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la documentación consultada; esta publicación no reentrena, solo cuantiza.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de razonamiento explícito soportado por el parser `qwen3` de vLLM.
- Generación y comprensión de código, con parser de tool calls `qwen3_coder` disponible en el servidor compatible con OpenAI.
- Tool calling / function calling automático mediante `--enable-auto-tool-choice`.
- Flujos agénticos multi-paso, apoyados en la ventana de 262.144 tokens configurada.
- Procesamiento de contexto largo: la configuración validada admite hasta 262.144 tokens de longitud de modelo.
- Capacidades multimodales (imagen y vídeo) potencialmente presentes porque los pesos y procesadores de visión se conservan, pero no validadas: el ejemplo de despliegue las desactiva explícitamente con `--limit-mm-per-prompt '{"image":0,"video":0}'`.
- Decodificación especulativa mediante MTP: los pesos MTP se conservan en BF16, pero el autor indica que la decodificación especulativa no se incluyó en la validación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat compatible con la API de OpenAI: levantar `vllm serve` con `--quantization humming` y exponer `/v1/chat/completions` permite sustituir un endpoint propietario manteniendo conversaciones multi-turno de hasta 262.144 tokens de contexto, con un coste de almacenamiento de pesos de 23,7 GB en lugar de 55,6 GB.
- Agentes con herramientas en producción: activando `--enable-auto-tool-choice --tool-call-parser qwen3_coder`, el modelo puede emitir llamadas estructuradas a funciones dentro de pipelines de automatización (consultas a bases de datos, APIs internas, orquestación de tareas) sin capa intermedia de parseo propio.
- Razonamiento sobre documentos extensos: con el parser `qwen3` se separa la traza de razonamiento de la respuesta final, lo que facilita auditar conclusiones sobre contratos, informes o expedientes que ocupen cientos de miles de tokens.
- Asistencia a desarrollo de software: revisión de repositorios completos, generación de parches y explicación de código, aprovechando el contexto largo y el soporte de tool calling para integrarse en pipelines de CI/CD que invocan el endpoint y aplican el resultado.
- Inferencia con restricción de VRAM en una sola GPU profesional: al reducir los pesos a 23,7 GB con un EAR medido del 98 %, es una opción para despliegues donde el BF16 (55,6 GB) o incluso el FP8 oficial (30,867 GB) no dejan margen suficiente para la caché KV.
- Investigación reproducible en cuantización: la tabla de EAR y el mapa de bits por proyección (`precision.svg`) permiten comparar esquemas (GPTQ, AutoRound, GSQ, FP8, GGUF Q4_K_XL) sobre la misma referencia y la misma métrica, útil para publicar estudios de compromiso tamaño-calidad.
- RAG sobre corpus técnicos corporativos: indexar documentación y servir respuestas con contexto largo reduce la pérdida de información típica de pipelines que truncan a 8K o 32K tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni similares). El autor solo reporta la métrica propietaria EAR, medida sobre la misma referencia BF16 y con la misma definición para todas las filas:

| Modelo | EAR ↑ | Ficheros de pesos (GB) | Ejecución medida |
|---|---:|---:|---|
| BF16 original | 100,000000 % | 55,563 | Referencia BF16 original |
| FP8 oficial | 97,705903 % | 30,867 | Pesos y activaciones FP8 nativos |
| FP8 oficial, solo pesos | 98,101249 % | 30,867 | Pesos dequantizados, ejecución BF16 |
| GSQ 3 bits | 89,425738 % | 11,828 | Pesos objetivo dequantizados, ejecución BF16 |
| Kaitchup hum-high | 94,335032 % | 17,695 | Pesos objetivo dequantizados, ejecución BF16 |
| Unsloth UD-Q4_K_XL GGUF | 97,444147 % | 17,559 | Pesos GGUF remapeados a BF16, Transformers |
| SLQ EAR>98 (este checkpoint) | 98,000775 % | 23,732 | vLLM / runtime Humming empaquetado |
| SLQ EAR98.5 | 98,502656 % | 25,609 | vLLM / runtime Humming empaquetado |
| SLQ EAR99 | 99,002514 % | 30,518 | vLLM / runtime Humming empaquetado |

Lectura útil: este checkpoint supera al FP8 oficial en EAR (98,000775 % frente a 97,705903 %) con un 23 % menos de tamaño de pesos, y queda muy por encima de GSQ 3 bits (89,43 %) y del AutoRound hum-high (94,34 %). El SLQ EAR99 se acerca al FP8 solo-pesos (99,00 % frente a 98,10 %) pero con el mismo tamaño (30,518 frente a 30,867 GB). No hay datos de latencia ni de throughput publicados.

## Requisitos de hardware

- Pesos: 23,732 GB en disco. El autor advierte explícitamente de que es tamaño de fichero, no memoria total de servicio.
- VRAM estimada: 23,7 GB de pesos más búferes del runtime y caché KV; con 262.144 tokens de contexto la caché KV domina el consumo y su tamaño exacto no está disponible en la documentación. Como referencia orientativa, un presupuesto de 32 GB solo deja margen para contextos moderados, y contextos de cientos de miles de tokens requieren 80 GB o más.
- GPU validadas por el autor: RTX PRO 6000 Blackwell (la única configuración probada para carga de texto, generación y EAR).
- GPU recomendadas (estimación, no validada): RTX PRO 6000 Blackwell o A100/H100 de 80 GB para contexto largo; RTX 6000 Ada / A6000 de 48 GB para contexto medio; RTX 5090 de 32 GB para contexto corto y pocas peticiones concurrentes.
- GPU de consumo: 24 GB (RTX 4090, 3090) es insuficiente en la práctica porque los pesos ya ocupan 23,7 GB y no queda espacio para caché KV ni búferes; 32 GB es el mínimo razonable.
- Despliegue: exclusivamente vLLM con soporte Humming (probado con vLLM 0.31.0 y humming-kernels 0.1.16). No hay ruta validada para llama.cpp, Ollama, TGI ni transformers con estos pesos empaquetados; para esos runtimes habría que usar otros checkpoints (por ejemplo el GGUF de Unsloth).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad medida | Pesos (GB) | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-SLQ-EAR98 (este) | 27B (base) | 262.144 | EAR 98,000775 % | 23,732 | Apache 2.0 | vLLM + Humming |
| Qwen3.8-27B-SLQ-EAR98.5 | 27B (base) | 262.144 | EAR 98,502656 % | 25,609 | Apache 2.0 | vLLM + Humming |
| Qwen3.8-27B-SLQ-EAR99 | 27B (base) | 262.144 | EAR 99,002514 % | 30,518 | Apache 2.0 | vLLM + Humming |
| Qwen3.8-27B-FP8 oficial | 27B | 262.144 (heredado) | EAR 97,705903 % | 30,867 | Apache 2.0 | vLLM/SGLang con FP8 |
| Qwen3.8-27B-3Bit-GSQ | 27B | no disponible | EAR 89,425738 % | 11,828 | Apache 2.0 | Dequantización a BF16 |
| Kaitchup hum-high (AutoRound) | 27B | no disponible | EAR 94,335032 % | 17,695 | Apache 2.0 | Requiere dequantización |
| Unsloth Qwen3.8-27B-GGUF UD-Q4_K_XL | 27B | no disponible | EAR 97,444147 % | 17,559 | Apache 2.0 | llama.cpp / Ollama / Transformers |
| Qwen3.8-27B BF16 | 27B | 262.144 | Referencia (100 %) | 55,563 | Apache 2.0 | Cualquiera |

No se dispone de comparaciones con modelos de otros fabricantes de tamaño similar (por ejemplo alternativas de 24B–32B) en la información proporcionada.

## Limitaciones y advertencias

- El EAR no es una métrica de exactitud: mide solapamiento de distribuciones de probabilidad sobre el soporte de los diez tokens más probables de la referencia. Un EAR del 98 % no garantiza el 98 % de acierto en ninguna tarea.
- El propio autor declara que no se ha establecido equivalencia estadística en tareas downstream para estas publicaciones; no hay benchmarks de calidad publicados.
- Las capacidades de visión y vídeo no están validadas: los pesos se conservan, pero la configuración de referencia las desactiva y la validación fue solo de texto.
- La decodificación especulativa con MTP no está validada, pese a conservarse los pesos MTP en BF16.
- Dependencia fuerte del runtime: requiere vLLM con soporte Humming y una versión concreta de humming-kernels. No hay pesos GGUF ni ruta soportada en llama.cpp, Ollama o TGI, y los resultados pueden variar ligeramente en otros entornos.
- Idiomas soportados no documentados; el comportamiento multilingüe del checkpoint cuantizado no se ha medido.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3.8-27B; la cuantización agresiva en algunas proyecciones (hasta INT2 en los candidatos GPTQ) puede ampliar la degradación en casos límite.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los términos del modelo original antes de un uso comercial, aunque Apache 2.0 permite uso comercial.
- Checkpoint con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de adopción ni de validación independiente por terceros.
- El repositorio ocupa 23,7 GB y utiliza el formato Xet de Hugging Face; la descarga requiere soporte de Xet o `huggingface-cli`.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Variante SLQ EAR98.5: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98.5
- Variante SLQ EAR99: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR99
- Checkpoint AutoRound hum-high (17,7 GB): https://huggingface.co/kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB
- Checkpoint AutoRound hum-balanced (16,2 GB): https://huggingface.co/kaitchup/Qwen3.8-27B-hum-balanced-MTP-16.2GB
- Cuantización GSQ 3 bits: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Artículo SLQ: https://arxiv.org/abs/2605.02404
- Repositorio SLQ: https://github.com/IST-DASLab/SLQ
- Repositorio AutoRound: https://github.com/intel/auto-round
- Mapa de precisión por proyección: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98/blob/main/precision.svg
- Blog del autor (The Kaitchup): https://kaitchup.substack.com/
- Artículo semanal sobre Qwen3.8 27B y otros modelos abiertos: https://kaitchup.substack.com/p/qwen38-27b-nemotron-35-muse-deepseek
- Ficha del modelo en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Apoyo al autor: https://ko-fi.com/bnjmn_marie
