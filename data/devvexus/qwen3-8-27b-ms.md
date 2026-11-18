# devvexus/Qwen3.8-27B-MS

## Resumen

Qwen3.8-27B-MS es una colección de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, publicada por el desarrollador independiente devvexus (Matthew Priester) bajo el formato propietario MS (Mad Shift). No se trata de un modelo nuevo, sino de una recompresión del modelo base de Qwen con el objetivo de reducir la pérdida de calidad respecto al original en BF16 a igualdad de tamaño de archivo. El autor reporta una divergencia KL entre 1,61 y 2,31 veces menor que los archivos UD3 de Unsloth del mismo tamaño, y un acierto top-1 del 93,8-98,7 % frente al 91,8-97,9 % de Unsloth.

El modelo base tiene 26.895.998.464 parámetros (aproximadamente 27B) y se distribuye con licencia Apache 2.0. La colección incluye varias tallas (MS2.7, MS3.5, MS3.7, MS4.3 y MS5) pensadas para GPUs de consumo de 16, 24 y 32 GB, además de un archivo MTP (Multi-Token Prediction) propio de 0,30 GB que acelera la generación especulativa y sirve para todas las tallas.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de cuantización con métricas de fidelidad publicadas; por otro, advierte de una dependencia crítica, ya que los archivos MS solo se cargan con el fork ms-llama.cpp del propio autor y no funcionan en llama.cpp estándar, Ollama ni LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); cuantizacion GGUF del fork MS (Mad Shift) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo (`-c 32768`); ampliable segun VRAM |
| Tipos de cuantizacion | MS2.7 (10,6 GB), MS3.5, MS3.7, MS4.3 (17,3 GB), MS5 (19,4 GB); MTP aparte (0,30 GB); vision encoder F16 (0,93 GB) |
| Idiomas soportados | no disponible (la model card no los detalla; los benchmarks de fidelidad se hicieron sobre textos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con soporte de archivo MTP y mmproj para vision) |

## Arquitectura y entrenamiento

El modelo base es un transformer de ~27B parámetros de la familia Qwen3.8. La model card de esta publicación no describe la arquitectura interna del base (número de capas, atención, posibles componentes híbridos o MoE), por lo que esos detalles deben consultarse en la ficha de Qwen/Qwen3.8-27B. Tampoco se documentan aquí los datos de entrenamiento, el número de tokens ni las fases de alineación (RLHF/DPO) del modelo original.

La innovación técnica de esta publicación es el formato de cuantización MS (Mad Shift), desarrollado por Matthew Priester. Según el autor, a igualdad de tamaño de archivo reduce la divergencia KL frente al BF16 original entre 1,61 y 2,31 veces respecto a UD3 de Unsloth, y entre 1,81 y 2,50 veces respecto a EXL3 de turboderp en el rango MS2.7-MS4.3. Incluye además un archivo MTP propio que habilita decodificación especulativa multi-token: el autor reporta 2,1 veces más velocidad con MTP activado (32,4 tokens/s en MS4.3 y 46,6 tokens/s en MS2.7 sobre RTX Spark), y 101 frente a 97 tokens/s en MS2.7 sobre RTX 4080 SUPER. El archivo MTP es único para todas las tallas porque reutiliza la tabla de tokens y la cabeza de salida del archivo cargado.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Lectura de imágenes mediante el encoder de visión opcional `vision/mmproj-Qwen3.8-27B-F16.gguf` (0,93 GB, F16), que debe cargarse explícitamente con `--mmproj` o `--mmproj-url`.
- Decodificación especulativa mediante MTP (`--spec-type draft-mtp`), con ganancias de velocidad reportadas de hasta 2,1 veces.
- Servidor compatible con API HTTP en `http://localhost:8080` a través de `llama-server` del fork ms-llama.cpp.
- Soporte de conversaciones multi-turno con contexto configurable (32k tokens en la configuración de ejemplo).
- Capacidades de razonamiento, código, matemáticas, tool calling y agentes: no documentadas en la información disponible para esta publicación; deben verificarse en la ficha del modelo base.

## Casos de uso

- Despliegue local en GPU de 16 GB: cargar MS2.7 (10,6 GB) con `-c 32768` y MTP permite servir un asistente conversacional en tarjetas como RTX 4070 Ti Super, 4080, 5070 Ti o 5080, con una fidelidad al BF16 superior a la de cuantizaciones equivalentes según las métricas del autor.
- Estación de trabajo con 24 GB: MS4.3 (17,3 GB) en RTX 3090 o 4090 ofrece mayor fidelidad (KL más baja) manteniendo velocidad gracias al MTP, adecuado para generación de código y análisis de documentos largos dentro de 32k tokens.
- Equipos con 32 GB o más: MS5 (19,4 GB) en RTX 5090, RTX Spark o DGX Spark es la opción de mayor calidad de la colección, con divergencia KL inferior a todos los archivos EXL3 medidos por el autor.
- Evaluación comparativa de cuantizaciones: investigadores que midan impacto de la compresión pueden usar los archivos MS junto con UD3 y EXL3 para reproducir las curvas de KL y top-1 publicadas.
- Procesamiento de documentos con imágenes: combinando el archivo principal con el mmproj F16 se puede hacer extracción de información de capturas, diagramas o formularios escaneados en local, sin depender de APIs externas.
- Prototipado de asistentes con API local: `llama-server` expone un endpoint HTTP en el puerto 8080, lo que permite integrar el modelo en aplicaciones propias o pipelines internos con una sola instancia (`-np 1`).
- Inferencia acelerada en hardware modesto: el MTP de 0,30 GB añade unos 0,9-1,0 GiB de VRAM y acelera la generación, útil cuando la latencia es crítica y se dispone de margen de memoria.

## Benchmarks y rendimiento

| Metrica | MS (esta publicacion) | Unsloth UD3 mismo tamano | EXL3 (turboderp) |
|---|---|---|---|
| Divergencia KL vs BF16 (MS2.7-MS3.5) | referencia | 1,61-1,63x mayor | no disponible en ese rango |
| Divergencia KL vs BF16 (MS3.7-MS5) | referencia | 1,90-2,31x mayor | no disponible en ese rango |
| Divergencia KL vs EXL3 (MS2.7-MS4.3) | 1,81-2,50x menor | no disponible | referencia |
| Acierto top-1 vs BF16 | 93,8-98,7 % | 91,8-97,9 % | no disponible |
| Velocidad sin MTP (RTX Spark) | ~98-100 % de Unsloth | referencia | no disponible |
| Velocidad sin MTP (RTX 4080 SUPER) | ~97 % de Unsloth | referencia | no disponible |
| Velocidad con MTP (RTX Spark) | 32,4 tok/s (MS4.3), 46,6 tok/s (MS2.7) | no disponible | no disponible |
| Velocidad con MTP (RTX 4080 SUPER) | 101 tok/s (MS2.7) | 97,1 tok/s (UD-IQ3_XXS + MTP separado) | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores miden fidelidad de cuantización y velocidad, no capacidad del modelo.

## Requisitos de hardware

- VRAM estimada: MS2.7 unos 10,6 GB de pesos; MS4.3 unos 17,3 GB; MS5 unos 19,4 GB. El MTP añade 0,9-1,0 GiB y el mmproj de visión 0,93 GB adicionales.
- GPUs objetivo según el autor: 16 GB (RTX 4070 Ti Super, 4080, 5070 Ti, 5080) para MS2.7; 24 GB (RTX 3090, 4090) para MS4.3; 32 GB o más (RTX 5090, RTX Spark, DGX Spark) para MS5.
- Cabe en GPU de consumo: sí, en las tarjetas indicadas; el autor advierte de que en Windows el dimensionado automático puede sobreestimar la memoria libre de una GPU con pantalla y provocar spill a RAM del sistema, con caída severa de rendimiento.
- Despliegue: exclusivamente con ms-llama.cpp (fork del autor). llama.cpp estándar, Ollama y LM Studio no pueden cargar estos archivos. Hay binarios para Windows (x64-CUDA12 y ARM64-CUDA) y compilación desde fuente en Linux y macOS.
- Paralelismo: `-np 1` recomendado; cada slot paralelo adicional necesita su propia copia del estado recurrente del modelo y puede expulsar capas de la GPU.
- Throughput reportado: 32,4-46,6 tokens/s en RTX Spark con MTP según talla, y 101 tokens/s en MS2.7 sobre RTX 4080 SUPER.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MS (esta publicacion) | ~27B | 32k configurable | GGUF MS | Apache 2.0 | Requiere ms-llama.cpp; MTP propio; KL y top-1 publicados |
| Qwen3.8-27B UD3 (Unsloth) | ~27B | segun runtime | GGUF | Apache 2.0 (del base) | Compatible con llama.cpp estándar; referencia de comparacion del autor |
| Qwen3.8-27B EXL3 (turboderp) | ~27B | segun runtime | EXL3 | Apache 2.0 (del base) | Requiere exllamav3; el mayor archivo medido es de 18,77 GB |
| Qwen/Qwen3.8-27B (BF16 original) | ~27B | no disponible | safetensors | Apache 2.0 | Referencia de fidelidad; sin cuantizar |

## Limitaciones y advertencias

- Dependencia de un runtime no estándar: sin ms-llama.cpp los archivos no cargan. Esto limita la portabilidad, la integración con herramientas existentes y el soporte a largo plazo.
- Proyecto de un único desarrollador: el fork y el formato MS no tienen el respaldo de una comunidad amplia; el mantenimiento futuro no está garantizado.
- Las métricas de fidelidad (KL, top-1) provienen del propio autor y se calcularon sobre cuatro textos en inglés; no hay validación independiente ni evaluación en otros idiomas.
- No hay benchmarks de capacidad (razonamiento, código, matemáticas) en la información disponible; el rendimiento en tareas reales depende del modelo base y no está documentado aquí.
- Riesgo de alucinación inherente al modelo base; la cuantización añade una pequeña degradación adicional respecto al BF16.
- Idiomas soportados no documentados en esta publicación; verificar en la ficha del modelo base antes de usarlo en producción multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el autor pide atribución a "MS (Mad Shift) by Matthew Priester" si se usan los archivos o se construye sobre el formato.
- En Windows, el primer arranque puede mostrar un aviso de fallo de symlink en la caché de Hugging Face; es inocuo pero puede duplicar espacio en disco.
- La configuración de contexto debe fijarse manualmente; el dimensionado automático puede provocar spill a RAM y ralentizar la inferencia drásticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devvexus/Qwen3.8-27B-MS
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork ms-llama.cpp: https://github.com/devvexus/ms-llama.cpp
- README del fork: https://github.com/devvexus/ms-llama.cpp#readme
- Perfil del autor en GitHub: https://github.com/devvexus
- ORCID del autor: https://orcid.org/0009-0000-0032-5292
- Cuantizaciones EXL3 de referencia: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Paper citado en los tags (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
