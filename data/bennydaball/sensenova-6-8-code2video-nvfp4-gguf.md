# BennyDaBall/SenseNova-6.8-Code2Video-NVFP4-GGUF

## Resumen

SenseNova-6.8-Code2Video es un modelo de la familia SenseNova, desarrollado por OpenSenseNova (SenseTime) como un fine-tune de Qwen3.8-27B orientado a la generación de vídeo mediante código: el modelo escribe código y renderiza vídeos a partir de instrucciones en lenguaje natural, revisando sus propios fotogramas renderizados gracias a un proyector de visión. La ficha que nos ocupa no es el modelo original, sino una cuantización NVFP4 en formato GGUF publicada por el usuario BennyDaBall, pensada para ejecutarse en llama.cpp y LM Studio sobre GPUs Blackwell con 32 GB de VRAM.

El modelo base cuenta con 27.320 millones de parámetros en precisión BF16 (55,7 GB), y esta cuantización reduce el peso a 19,38 GB manteniendo la cabeza de predicción multi-token (MTP) en BF16 para acelerar la decodificación. Soporta inglés y chino, y su licencia es Apache 2.0 tanto en el original como en la cuantización.

Su relevancia actual radica en que permite ejecutar localmente, en una sola tarjeta de consumo de gama alta, un modelo especializado en code-to-video con 131k tokens de contexto y decodificación especulativa MTP, algo que el checkpoint BF16 original no permite por tamaño. La cuantización es técnicamente elaborada: GPTQ con búsqueda de escalas NVFP4 (Schur Replay, Four Over Six) y asignación de precisión Q8_0 a tensores sensibles medida empíricamente con KLD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.8-27B); incluye atencion completa, DeltaNet y cabeza MTP |
| Parametros totales | 27.320.698.128 (27,32 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens en esta cuantizacion (entrenado para 512K) |
| Tipos de cuantizacion | NVFP4 con mezcla Q8_0 en tensores sensibles; cabeza MTP en BF16; KV cache q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj BF16 separado para vision |

## Arquitectura y entrenamiento

El modelo base es un transformer derivado de Qwen3.8-27B, con atención completa combinada con capas DeltaNet y una cabeza de predicción multi-token (MTP) para decodificación especulativa. El checkpoint original de SenseNova no incluye la capa MTP, por lo que esta cuantización incorpora la cabeza oficial de Qwen/Qwen3.8-27B en BF16. El pipeline es image-text-to-text: el modelo recibe texto e imágenes (fotogramas renderizados) y genera código y texto, lo que le permite revisar sus propias salidas visuales durante el proceso de generación de vídeo.

El proceso de cuantización es destacable por su rigor: calibración con 512 ventanas de 2.048 tokens extraídas de las trayectorias de producción publicadas por SenseNova (4 de las 6 películas de demostración, dejando 2 como conjunto de evaluación), cálculo de hessianos GPTQ en FP32 capa a capa en BF16 para no exceder 32 GB de VRAM, y aplicación de GPTQ + Schur Replay NVFP4 sobre cada tensor de 4 bits, probando una ventana de nueve códigos de escala E4M3 más el punto Four Over Six (arXiv 2512.02010) y conservando la escala con menor pérdida GPTQ real por fila. Los tensores en Q8_0 también usan GPTQ con selección de escala por replay. La asignación de qué tensores van a 8 bits se determinó con un escaneo de sensibilidad que midió KLD real en llama.cpp, resultando ganadores las proyecciones K/V de atención completa y las proyecciones de entrada/salida de DeltaNet.

## Capacidades

- Generación de código y renderizado de vídeo a partir de instrucciones en lenguaje natural (code-to-video).
- Revisión visual de fotogramas propios mediante el proyector de visión BF16 incluido.
- Razonamiento multi-paso con preservación de trazas de razonamiento y llamadas a herramientas en el template de chat.
- Soporte de tool calling / function calling (el template conserva tool calls; se ofrece una variante de template para Claude Code).
- Decodificación especulativa MTP con aceptación de borradores del 75,3 %, acelerando la generación.
- Capacidades multilingües limitadas a inglés y chino.
- Integración con harness de agentes (Claude Code como harness recomendado por SenseNova).
- Contexto largo de 131k tokens en esta cuantización para trayectorias de generación extensas.

## Casos de uso

- Generación automatizada de vídeos explicativos a partir de especificaciones textuales: el modelo escribe el código de renderizado y revisa los fotogramas resultantes con el proyector de visión, adecuado para producir clips de demostración o animaciones técnicas sin intervención manual.
- Creación de contenido para documentación técnica: generar animaciones que ilustren el funcionamiento de APIs o algoritmos, con contexto de 131k tokens para incorporar especificaciones largas y código fuente de referencia.
- Asistencia en producción audiovisual con agentes: integrado en Claude Code u otro harness, el modelo puede encadenar pasos de escritura de código, renderizado y verificación visual, con tool calling para invocar herramientas de render.
- Prototipado rápido de visualizaciones científicas: traducir descripciones de fenómenos o datos a código de animación ejecutable, aprovechando la capacidad de razonamiento y código heredada de Qwen3.8.
- Evaluación e investigación en generación multimodal code-to-video: servir como base local para estudiar el comportamiento de modelos que cierran el bucle percepción-generación-revisión en una sola GPU de 32 GB.
- Despliegue en estaciones de trabajo con GPU Blackwell: ejecución local en una RTX 5090 con contexto completo de 131k y decodificación MTP a 157 tok/s, útil para equipos que no pueden enviar datos a la nube.
- Generación de material didáctico en inglés y chino: producir vídeos cortos a partir de guiones en ambos idiomas soportados.

## Benchmarks y rendimiento

Los datos publicados por el autor de la cuantización comparan esta NVFP4 con dos variantes Q4_K_M del mismo modelo base, medidos en una RTX 5090 con llama.cpp b12015:

| Metrica | NVFP4 (esta) | Q4_K_M imatrix | Q4_K_M plain |
|---|---:|---:|---:|
| Tamano de fichero | 19,38 GB | 16,81 GB | 16,81 GB |
| KLD vs BF16 (menor mejor) | 0,124 | 0,147 | 0,184 |
| KLD percentil 99 | 3,13 | 3,98 | 4,94 |
| Mismo token top que BF16 | 92,4 % | 92,0 % | 90,6 % |
| Decodificacion con MTP (n=3, p-split 0,2) | 157 tok/s | 153 tok/s | 153 tok/s |
| Aceptacion de borradores MTP | 75,3 % | 71,0 % | 71,0 % |
| Decodificacion sin MTP | 74,5 tok/s | 79,9 tok/s | 79,9 tok/s |

El KLD se midio sobre 61.440 tokens (mitad wikitext-2 test, mitad trayectorias de produccion de SenseNova no usadas en calibracion). La velocidad es greedy, 512 tokens, mediana de tres prompts code-video por tres ejecuciones. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 26 GB con contexto de 131k y KV cache q8_0; el fichero pesa 19,38 GB mas 0,93 GB del proyector de vision.
- GPU recomendadas: RTX 5090 (32 GB, arquitectura Blackwell, requisito para NVFP4 con activaciones de 8 bits); cualquier GPU Blackwell con 32 GB o mas.
- Cabe en GPU de consumo: si, en RTX 5090; no en tarjetas de 24 GB o menos con contexto completo.
- Opciones de despliegue: llama.cpp (b12015 o superior, build CUDA 13.4), LM Studio (runtime CUDA 12 de llama.cpp 2.67.0), llama-server con `--spec-type draft-mtp`.
- Latencia y throughput: 157 tok/s con MTP en llama-server; unos 120 tok/s en LM Studio sobre prompts de codigo; carga en 11 s en LM Studio.
- Nota: el contexto de 512K con el que fue entrenado el modelo base no cabe en una sola tarjeta de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-6.8-Code2Video NVFP4 (esta) | 27,32 B | 131k (en esta cuantizacion) | GGUF NVFP4 + Q8_0 | Apache 2.0 | KLD 0,124 vs BF16; 157 tok/s con MTP |
| SenseNova-6.8-Code2Video Q4_K_M imatrix | 27,32 B | 131k (tipico) | GGUF Q4_K_M | Apache 2.0 | KLD 0,147; 153 tok/s con MTP; 16,81 GB |
| SenseNova-6.8-Code2Video Q4_K_M plain | 27,32 B | 131k (tipico) | GGUF Q4_K_M | Apache 2.0 | KLD 0,184; 153 tok/s con MTP; 16,81 GB |
| SenseNova-6.8-Code2Video BF16 (original) | 27,32 B | 512K (entrenado) | safetensors BF16 | Apache 2.0 | 55,7 GB; no cabe en una GPU de consumo |

No se dispone de datos comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion NVFP4 requiere hardware Blackwell para aprovechar las activaciones de 8 bits; en otras arquitecturas el rendimiento y la calidad pueden degradarse.
- El contexto maximo practico en una sola GPU de consumo es de 131k tokens, la mitad o menos de los 512K con los que fue entrenado el modelo base.
- Solo soporta ingles y chino; no hay cobertura de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos de codigo y a la revision visual automatica; los fotogramas renderizados pueden no corresponder a la especificacion.
- El template de chat estandar rechaza mensajes de sistema posteriores al primer turno; es necesario usar el template alternativo para Claude Code.
- La cabeza MTP se toma de Qwen/Qwen3.8-27B y no del checkpoint de SenseNova, lo que introduce una dependencia externa en la cadena de cuantizacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos de Qwen subyacentes.
- El autor de la cuantizacion es un tercero (BennyDaBall), no SenseNova; la calidad esta documentada con KLD y pruebas propias, pero no ha pasado por una validacion independiente.
- El repositorio tiene solo 3 likes y 2.956 descargas, lo que indica una validacion comunitaria limitada.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/BennyDaBall/SenseNova-6.8-Code2Video-NVFP4-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Repositorio GitHub de SenseNova: https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Qwen3.8-27B (origen de la cabeza MTP): https://huggingface.co/Qwen/Qwen3.8-27B
- Paper Four Over Six: https://arxiv.org/abs/2512.02010
- Cuantizacion NVFP4 relacionada del mismo autor: https://huggingface.co/BennyDaBall/flux-3-image-klein-base-NVFP4
- Perfil X del autor: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
