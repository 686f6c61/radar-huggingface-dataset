# Interchained/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por Thinking Machines Lab, con aproximadamente 26.400 millones de parámetros y una arquitectura de bucle (loop architecture) que incorpora un codificador de visión nativo. El repositorio aquí descrito no contiene los pesos originales, sino las conversiones a formato GGUF publicadas por Interchained LLC, pensadas para su ejecución con llama.cpp tanto en modo texto como en modo visión mediante el proyector mmproj incluido.

La relevancia de esta revisión radica en que corrige los defectos de una primera publicación convertida sobre un borrador de pull request: ahora incorpora el arreglo upstream del bucle (ggml-org/llama.cpp #32704) que restaura las escalas NVFP4 por experto en tiempo de inferencia, además del soporte final de arquitectura fusionado en llama.cpp (#32217 para texto y visión, #32694 para la arquitectura de bucle definitiva). Esto se traduce en una cadena de razonamiento coherente y en inferencia de imagen verificada de extremo a extremo.

El conjunto de cuantizaciones cubre desde TQ1_0 (8,4 GB) hasta Q8_0 (26 GB), con Q4_K_M (17 GB) como punto de partida recomendado por el publicador, verificado a ~35 tok/s en texto sobre una Tesla V100 de 32 GB. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con arquitectura de bucle (loop architecture) y codificador de vision nativo |
| Parametros totales | 26.070.385.152 (~26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el publicador indica "contexto muy largo" sin cifra; recomienda fijar `-c` manualmente) |
| Tipos de cuantizacion | TQ1_0, Q2_K, Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0; proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); mmproj GGUF para vision |

## Arquitectura y entrenamiento

El modelo base es un mixture-of-experts multimodal con arquitectura de bucle, es decir, un transformer en el que determinados bloques se reutilizan iterativamente, combinado con un codificador de visión nativo que se conecta al modelo de lenguaje mediante un proyector multimodal (mmproj). El repositorio GGUF conserva esa topología y añade el proyector en BF16 (642 MB) para habilitar la ruta image-text-to-text.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada. El detalle técnico destacable documentado por el publicador es el arreglo upstream que preserva las escalas NVFP4 por experto durante la inferencia: sin él, la cuantización de los tensores de los expertos degradaba visiblemente el razonamiento. Además, durante la conversión los tensores de down-projection de los expertos (anchura 1152) no encajan en bloques K-quant, por lo que llama-quantize los mantiene en mayor precisión (Q8_0/Q5_1/Q5_0) como fallback esperado.

## Capacidades

- Generación de texto conversacional con cadena de razonamiento extensa (thinking mode implícito: el publicador advierte que "piensa largo" y requiere presupuestos de generación amplios).
- Comprensión de imágenes y descripción visual mediante el proyector mmproj, con pipeline image-text-to-text.
- Razonamiento multi-paso, adecuado para prompts complejos con `-n 8192`.
- Ejecución local en llama.cpp: `llama-cli`, `llama-mtmd-cli` y `llama-server`.
- Compatibilidad con plantillas de chat propias del modelo (requiere `--jinja` en `llama-mtmd-cli` para visión).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de código, matemáticas o audio: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Descripción y análisis de imágenes en local: usar `llama-mtmd-cli` con `--mmproj` y `--jinja` permite pasar una fotografía y obtener una descripción detallada sin salir del equipo, útil para catalogación de imágenes o accesibilidad.
- Asistente conversacional con razonamiento profundo: con Q4_K_M y `-n 8192`, el modelo puede abordar preguntas analíticas que requieren cadena de pensamiento larga, como diagnóstico de problemas técnicos o planificación.
- Procesamiento por lotes de documentos escaneados con OCR asistido: combinando el codificador de visión y el contexto largo, se pueden extraer y resumir contenidos de capturas o páginas.
- Despliegue como servidor HTTP interno: `llama-server` con `-c 8192` expone una API compatible con endpoints, apta para integrar en herramientas internas de soporte o búsqueda.
- Prototipado en hardware de consumo: las variantes Q2_K (11 GB) y Q3_K_M (13 GB) permiten probar el modelo en GPUs de gama alta para consumidor antes de escalar a servidores.
- Evaluación comparativa de cuantizaciones: el conjunto completo de GGUF permite medir la degradación de calidad y velocidad entre TQ1_0 y Q8_0 para un mismo modelo, útil en estudios de eficiencia.
- Investigación sobre arquitecturas de bucle y MoE: al ser ejecutable en llama.cpp, sirve como banco de pruebas para estudiar el comportamiento de modelos con reutilización de bloques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado es empírico del publicador: ~35 tok/s en texto con Q4_K_M sobre una Tesla V100 de 32 GB.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): 8,4 GB (TQ1_0), 11 GB (Q2_K), 13 GB (Q3_K_M), 14 GB (Q4_0), 17 GB (Q4_K_M), 19 GB (Q5_K_M), 22 GB (Q6_K), 26 GB (Q8_0); añadir ~642 MB para el proyector de visión y el espacio de caché KV correspondiente al contexto configurado.
- GPU recomendadas: Tesla V100 32 GB verificada por el publicador con Q4_K_M; para Q6_K y Q8_0 se requiere al menos 22-26 GB de VRAM, lo que apunta a A100 40/80 GB, H100 o RTX 4090 (24 GB, justa para Q6_K).
- Cabe en GPU de consumo: sí, las variantes Q2_K a Q4_K_M en tarjetas de 12-24 GB; Q4_K_M requiere 17 GB más caché KV, por lo que encaja en RTX 4090 o RTX 3090 con contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`); el publicador menciona que los modelos son "endpoints_compatible" y usa el fork `aiassistsecure/llama.cpp`. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: ~35 tok/s en texto con Q4_K_M sobre V100 32 GB; sin datos para el resto de cuantizaciones ni para visión.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo "piensa largo": presupuestos de generación de pocos cientos de tokens pueden cortar la cadena de razonamiento antes de la respuesta; se recomienda `-n 2048` mínimo y `-n 8192` para prompts difíciles.
- No mezclar ficheros entre revisiones: los GGUF del primer release (layout de borrador) son incompatibles con esta revisión; hay que descargar el conjunto completo, incluido el mmproj.
- La visión en `llama-mtmd-cli` requiere obligatoriamente `--jinja`; sin el flag, el handler especializado de plantilla de chat sale silenciosamente antes de codificar la imagen.
- La cuantización de los tensores de down-projection de los expertos queda en mayor precisión (Q8_0/Q5_1/Q5_0) por incompatibilidad con bloques K-quant: es esperado, pero implica que los tamaños declarados no son una compresión uniforme.
- La longitud de contexto real no está documentada; en tarjetas de 32 GB conviene fijar `-c` a un valor sensato en lugar de aceptar los valores por defecto del servidor.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible, pero aplicables como en cualquier LLM; la cadena de razonamiento larga no elimina el riesgo de afirmaciones incorrectas.
- Licencia Apache 2.0 declarada en el repo de conversión, con la advertencia del publicador de que el uso está sujeto a los términos del modelo original de Thinking Machines Lab; conviene verificar la licencia del modelo base antes de uso comercial.
- El repo ocupa 326,5 GB en total (todas las cuantizaciones), lo que exige planificar la descarga selectiva de ficheros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Interchained/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Fork de llama.cpp usado en la conversión: https://github.com/aiassistsecure/llama.cpp
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- PR upstream de soporte Inkling (texto y visión): https://github.com/ggml-org/llama.cpp/pull/32217
- PR upstream de arquitectura de bucle final: https://github.com/ggml-org/llama.cpp/pull/32694
- PR upstream del arreglo de escalas NVFP4 por experto: https://github.com/ggml-org/llama.cpp/pull/32704
- Publicador (modelos): https://huggingface.co/Interchained
- Publicador (código): https://github.com/aiassistsecure
- Publicador (portfolio): https://interchained.tech
- Red de inferencia: https://aiassistsecure.com
