# Frosty40/Qwen3.8-27B-GGUF

## Resumen
Qwen3.8-27B es un modelo denso de 27.000 millones de parámetros desarrollado por el equipo Qwen (Alibaba), con una arquitectura híbrida que combina 48 capas de atención lineal Gated-DeltaNet con 16 capas de atención completa, soporte nativo de visión y una ventana de contexto de 262.144 tokens. Esta ficha describe la conversión a GGUF publicada por el usuario Frosty40, que adapta el modelo original en bf16 a formatos cuantizados optimizados para llama.cpp, incluyendo una variante con cabeza MTP (Multi-Token Prediction) para decodificación especulativa nativa.

La relevancia de esta conversión radica en su enfoque de cuantización selectiva: mantiene el backbone en Q6_K pero eleva a Q8_0 las proyecciones de atención (`attn_k`, `attn_v`, `attn_qkv`), una decisión justificada por el impacto desproporcionado que tienen los errores en tokens de baja entropía (código y trazas de agentes) sobre la calidad final. El autor reporta mediciones de divergencia KL frente al modelo bf16 completo, con reducciones del 28% en código y del 32% en flujos agénticos respecto a su cuantización anterior.

El modelo está validado de extremo a extremo sobre una GPU Intel Arc Pro B70 de 32 GB mediante SYCL, y la variante con MTP logra incrementos de velocidad de decodificación del 45-95%. La licencia Apache 2.0 y el soporte de visión lo sitúan como una opción práctica para despliegues locales de asistentes multimodales con contexto largo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated-DeltaNet (atención lineal) + 16 capas de atención completa; MRoPE intercalado |
| Parámetros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (modelo base); 102.400 tokens residentes en GPU de 32 GB con visión |
| Tipos de cuantización | Q6_K con proyecciones de atención Q8_0 (QKV8), Q6_K uniforme con salida Q8_0 (OQ8); proyector de visión en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en bf16 y safetensors |

## Arquitectura y entrenamiento
La arquitectura combina capas de atención lineal Gated-DeltaNet con capas de atención completa en una proporción de 48:16, lo que reduce el coste computacional y de memoria del caché KV en contextos largos. Utiliza MRoPE (Multimodal Rotary Position Embedding) intercalado, lo que permite codificar posiciones de texto e imagen de forma unificada. La memoria híbrida recurrente más atención implica que el desplazamiento de contexto (`context shifting`) no está disponible por diseño; el reuso de prefijos largos se gestiona mediante puntos de control de contexto.

El modelo incorpora una cabeza MTP (Multi-Token Prediction) nativa, destilada del release independiente `EigenLabs/Qwen3.8-27B-MTP-bf16`, que habilita decodificación especulativa verificada: los tokens borrador se contrastan contra el modelo objetivo y solo se emiten coincidencias exactas, por lo que la salida es idéntica a la decodificación sin especulación. El tamaño de bloque entrenado de la cabeza es de 3 tokens, y valores superiores degradan la aceptación encadenada. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La conversión GGUF se realizó desde el release bf16, con tokenizador y plantilla de chat idénticos al original y verificación sha256 de cada fragmento de entrada. El autor reporta divergencia KL media de 0,00084 en código y 0,00094 en flujos agénticos frente a bf16, con una cola (percentil 99,9) de 0,051 y 0,053 respectivamente, y una coincidencia de token codicioso superior al 99,2% en ambos dominios.

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento activado por defecto, con niveles de esfuerzo (`reasoning_effort`) configurables en xhigh, medium y low.
- Generación y edición de código, con énfasis en la preservación de tokens de baja entropía gracias a la cuantización Q8_0 de las proyecciones de atención.
- Comprensión de imágenes mediante proyector de visión F16 compatible con `--mmproj` de llama.cpp (pipeline `image-text-to-text`).
- Decodificación especulativa nativa mediante cabeza MTP, con verificación exacta de tokens borrador.
- Soporte de conversaciones multi-turno con contexto largo (hasta 262.144 tokens en el modelo base).
- Compatibilidad con endpoints (`endpoints_compatible`) según las etiquetas del repositorio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Asistencia de código en local: el modelo mantiene una divergencia KL de 0,00084 en corpus de código real y una cola de 0,051, lo que reduce la probabilidad de generar un token erróneo que rompa un programa; adecuado para autocompletado y revisión en entornos sin conexión.
- Agentes autónomos multi-paso: las trazas agénticas medidas muestran una coincidencia de token codicioso del 99,27% frente a bf16, lo que permite encadenar llamadas a herramientas y razonamiento intermedio con fidelidad alta al modelo completo.
- Análisis de documentos extensos con imágenes: la ventana de 262.144 tokens y el soporte de visión permiten procesar informes, contratos o documentación técnica que combine texto e imágenes en una sola pasada.
- Despliegue en estaciones de trabajo con GPU de consumo: el archivo Q6_K-QKV8-MTP ocupa 23,2 GB y cabe en tarjetas de 32 GB, incluyendo Intel Arc Pro B70, con 102.400 tokens de contexto residentes y visión activa.
- Servidores de inferencia con llama.cpp: la integración con `llama-server` y la opción `--spec-type draft-mtp` permiten montar un endpoint compatible con plantilla Jinja y modo de razonamiento configurable.
- Procesamiento por lotes de código y pruebas: la velocidad de prefill medida (997 t/s en 4K y 959 t/s en 16K) facilita tareas de análisis estático, generación de tests o migración de código sobre repositorios medianos.
- Chat de larga duración con reuso de prefijo: aunque el desplazamiento de contexto no está disponible, los puntos de control de contexto permiten reutilizar prefijos en conversaciones extensas sin recalcular todo el historial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas de fidelidad de cuantización y de rendimiento de inferencia:

| Métrica | Q6_K-QKV8(-MTP) | Q6_K-OQ8(-MTP) | Q8_0 (referencia) |
|---|---|---|---|
| KL media / misma cima (prosa) | 0,00163 / 97,75% | 0,00170 / 97,79% | no disponible |
| KL media / cola / misma cima (código) | 0,00084 / 0,051 / 99,80% | 0,00117 / 0,090 / 99,46% | 0,00014 / 0,010 / 99,85% |
| KL media / cola / misma cima (agéntico) | 0,00094 / 0,053 / 99,27% | 0,00137 / 0,111 / 99,36% | 0,00019 / 0,022 / 99,76% |

Rendimiento medido en Intel Arc Pro B70 (32 GB, llama.cpp SYCL, sin especulación):

| Métrica | Valor |
|---|---|
| Decodificación tg128 a profundidad 0 / 16K / 64K | 21,6 / 19,6 / 14,9 t/s |
| Prefill (calentado) 4K / 16K | 997 / 959 t/s |
| Relleno sostenido con prompt de 61K | 735 t/s |
| Contexto máximo residente en 32 GB con visión | 102.400 tokens (QKV8); 106.496 (OQ8) |
| Aceleración por MTP en decodificación | +45% a +95% |

## Requisitos de hardware
- VRAM estimada: 23,2 GB para el archivo Q6_K-QKV8-MTP, 22,7 GB para Q6_K-QKV8, 21,3 GB para Q6_K-OQ8-MTP y 20,9 GB para Q6_K-OQ8; añadir 0,9 GB del proyector de visión F16.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) es la plataforma validada por el autor; por tamaño, caben en RTX 4090 (24 GB) solo los archivos OQ8 sin visión y con contexto reducido, y en A100/H100 (40/80 GB) con holgura para contexto largo.
- Cabe en GPU de consumo: el archivo OQ8 de 20,9 GB entra en una RTX 4090 de 24 GB, pero el contexto residente será limitado; el QKV8 con visión requiere 32 GB.
- Opciones de despliegue: llama.cpp con soporte de arquitectura `qwen35` (b10355 o superior); la variante MTP requiere además soporte de capas NextN/MTP y un servidor que exponga `--spec-type draft-mtp`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 21,6 t/s de decodificación a profundidad 0 en Arc Pro B70 sin especulación, con caída a 14,9 t/s a 64K de profundidad; el MTP añade entre un 45% y un 95% adicional.
- Nota de memoria: mantener el caché KV en f16; la cuantización del KV produce una regresión grande en decodificación a profundidad en esta arquitectura. Superar el contexto residente provoca desbordamiento silencioso a memoria host y colapso de prefill y decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (este, GGUF) | 26,9B denso | 262.144 | Apache 2.0 | GGUF | Híbrido lineal/atención, visión, MTP |
| Qwen3.8-27B (bf16 original) | 26,9B denso | 262.144 | Apache 2.0 | safetensors/bf16 | Referencia de calidad; requiere mucha más VRAM |
| Qwen3.8-27B-Q6_K-OQ8-MTP | 26,9B denso | 262.144 | Apache 2.0 | GGUF | Variante previa del mismo autor, menor tamaño y mayor contexto residente, peor cola KL |
| EigenLabs/Qwen3.8-27B-MTP-bf16 | 26,9B denso | no disponible | no disponible | bf16 | Release independiente de la cabeza MTP, usada como fuente |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo de propósito general, cabe esperar los sesgos habituales de sus datos de entrenamiento, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo de razonamiento activado por defecto no elimina este riesgo.
- Limitaciones de contexto: el desplazamiento de contexto no está disponible por diseño; los clientes deben presupuestar `max_tokens` y usar puntos de control de contexto para reutilizar prefijos. Superar el contexto residente en GPU provoca desbordamiento a memoria host y colapso del rendimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base Qwen/Qwen3.8-27B y de la cabeza MTP de EigenLabs, cuya licencia no se detalla.
- Compatibilidad de herramientas: requiere llama.cpp con soporte de arquitectura `qwen35` (b10355+); la variante MTP necesita además soporte NextN y `--spec-type draft-mtp`, ausente en muchas compilaciones.
- Caché KV: debe mantenerse en f16; la cuantización del KV degrada gravemente la decodificación a profundidad en esta arquitectura.
- Idiomas: no se especifica la cobertura lingüística, lo que impide garantizar calidad fuera de los idiomas principales del modelo base.
- Madurez del repositorio: 595 descargas y 1 like en el momento de la consulta; es una conversión de terceros, no oficial del equipo Qwen.

## Enlaces
- Repositorio GGUF: https://huggingface.co/Frosty40/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cabeza MTP independiente: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
