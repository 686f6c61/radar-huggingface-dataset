# AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16

## Resumen

Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16 es un ajuste fino del modelo Qwen3.8-Flash-Next, un transformer de tipo mezcla de expertos (MoE) con 180.000 millones de parametros y una ventana de contexto nativa de 262.144 tokens. Lo desarrolla AEON-7, un autor independiente que publica variantes "uncensored" de modelos abiertos. El modelo parte del checkpoint oficial de Qwen y aplica una edicion quirurgica sobre las activaciones internas para eliminar la direccion que codifica la negativa a responder, una tecnica conocida como abliteration o refusal removal.

El problema que aborda es la tasa de rechazo de los modelos alineados: segun la model card, el modelo base rechaza el 87,9 % de las peticiones del benchmark publico StrongREJECT, mientras que esta variante baja al 1,3 %. El autor sostiene que la capacidad general se mantiene practicamente intacta (728 aciertos frente a 724 del original sobre 810 items) y que 261,5 de los 360 GB del repositorio son byte a byte identicos a la release de Qwen.

Es relevante ahora porque se presenta como la version maestra en BF16 (precision completa) de la que derivan las cuantizaciones ligeras del autor, pensadas para hardware de consumo profesional como el DGX Spark de NVIDIA. El repositorio tiene traccion muy baja (2 descargas, 0 likes) y una fecha de creacion de noviembre de 2026, por lo que debe tratarse como material experimental y no como un modelo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), 512 expertos por capa, con memoria n-gram de 51.000 millones de parametros |
| Parametros totales | 179.999.981.459 (180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos (256K en despliegues multi-Spark segun la model card) |
| Tipos de cuantizacion | BF16 (este repositorio, precision completa); NVFP4-XS (98 GiB) publicado en repositorio aparte; GGUF no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face, con enlace a LICENSE) |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 360 GB |
| Pipeline | image-text-to-text (multimodal entrada imagen + texto) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-Flash-Next, descrita por el autor como el preestreno abierto de la arquitectura que sustentara Qwen4: un transformer MoE con 512 expertos por capa, 180.000 millones de parametros totales y un modulo de memoria n-gram de 51.000 millones de parametros que actua como almacen de secuencias. La ventana de contexto nativa es de 262.144 tokens y el pipeline declarado admite entrada de imagen y texto, lo que lo situa en la categoria de modelos multimodales.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La intervencion de AEON-7 no es un reentrenamiento: segun la model card, se localizo la direccion unica en el espacio de activaciones que transporta la senal de "rechazar esto" y se elimino la capacidad del modelo de escribir a lo largo de ella, editando 24.672 matrices. El autor afirma que 261,5 de los 360 GB del checkpoint son identicos byte a byte a la release de Qwen, lo que permite verificar el alcance de la modificacion comparando listas de ficheros. No se mencionan innovaciones adicionales como decodificacion especulativa en este repositorio, aunque las recetas de despliegue del autor citan DFlash2 en la variante cuantizada.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo de hasta 262.144 tokens.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con lectura de imagenes validada por el autor en la variante cuantizada.
- Razonamiento de varios pasos y modo "thinking" desactivable, segun las recetas de decodificacion codiciosa con thinking off.
- Respuesta sin rechazos: 0 de 108 en la suite propia de AEON y 1,3 % en StrongREJECT, incluyendo prompts retenidos que el modelo base rechazaba.
- Recuperacion en contexto largo: 28 de 28 needles en la prueba de aguja en pajar sobre el pack de contexto largo (dato de la variante NVFP4, no de este maestro).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no documentado en la model card.
- Soporte de agentes: la model card menciona escenarios con "muchos agentes" en las recetas de despliegue, pero no detalla capacidades de razonamiento agentico multi-paso mas alla del uso conversacional.

## Casos de uso

- Investigacion sobre alineacion y refusal: el modelo permite estudiar como se codifica la negativa en las activaciones de un MoE de 180 B, comparando su comportamiento con el checkpoint original de Qwen sobre las mismas 108 y 313 peticiones de las suites del autor.
- Generacion de cuantizaciones propias: al ser el maestro BF16, sirve como fuente de verdad para producir versiones GGUF, AWQ o NVFP4 con herramientas propias, verificando que la edicion se preserva tras la cuantizacion.
- Despliegue de alta precision en servidores multi-GPU: con 360 GB en BF16 requiere cuatro DGX Spark o un servidor multi-GPU, y es adecuado para servir a maxima fidelidad numerica cuando la latencia no es critica.
- Procesamiento de documentos largos con imagen: su contexto de 262K y su pipeline multimodal permiten analizar informes escaneados, contratos o articulos cientificos con figuras en una sola pasada, sin trocear el documento.
- Analisis de contenido sensible en entornos controlados: casos de red teaming, moderacion asistida o investigacion de seguridad donde un modelo que no rechaza sistematicamente evita sesgar los resultados del estudio.
- Evaluacion comparativa de robustez: medir la degradacion de capacidad entre el modelo original y la variante editada sobre conjuntos de 810 items de capacidad, como hace el autor, para cuantificar el coste real del refusal removal.
- Base para ajustes finos posteriores: al conservar el 72,6 % del checkpoint byte a byte, es un punto de partida razonable para quien quiera aplicar LoRA o SFT sobre un modelo ya sin negativas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. No se han verificado de forma independiente.

| Benchmark | Qwen3.8-Flash-Next original | Este modelo |
|---|---|---|
| StrongREJECT, rechazos (313 prompts, rubrica oficial) | 275 (87,9 %) | 4 (1,3 %) |
| Suite de rechazo AEON (108 prompts) | 86 (79,6 %) | 0 (0,0 %) |
| Rechazos en contexto largo (56 prompts, 4K a 128K) | 29 (51,8 %) | 0 (0,0 %) |
| Peticiones inocuas marcadas como rechazadas | 13,3 % | 1,1 % |
| Capacidad (810 items) | 724 aciertos | 728 aciertos |

Rendimiento de inferencia declarado para la variante NVFP4-XS (98 GiB), no para este maestro BF16:

| Configuracion | Un usuario | Multiples usuarios |
|---|---|---|
| 1 DGX Spark, Strata + DFlash2, 131K | 60,6 tok/s | 73 en 4 |
| 1 DGX Spark, AEON vLLM Ultimate | 38,9 tok/s | 97,5 en 4 |
| 2 DGX Spark, tensor-parallel, 131K | 58 a 65 tok/s | 359 en 16 |
| 2 DGX Spark, tensor-parallel, 256K | 51 tok/s | 145 en 4 |
| 4 DGX Spark, dos replicas y balanceador | 58 a 65 tok/s | 748 en 32 |
| Este repositorio BF16 | no medido | no medido |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 360 GB de pesos, mas overhead de KV cache y activaciones; en la practica exige 4 GPU de 96 GB o mas, o 4 DGX Spark.
- GPU recomendadas: H100 80 GB, A100 80 GB, H200 141 GB o configuraciones multi-GPU equivalentes. El autor cita explicitamente cuatro DGX Spark o un servidor multi-GPU para servir a precision completa.
- Cabe en GPU de consumo: no en BF16. Solo mediante la variante NVFP4-XS de 98 GiB, que el autor distribuye en repositorio aparte y que tampoco cabe en una RTX 4090 de 24 GB.
- Opciones de despliegue: transformers para uso directo; el autor publica AEON vLLM Ultimate, un fork de vLLM orientado a DGX Spark, con recetas de tensor-parallel y balanceo entre replicas. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos para el maestro BF16. Las cifras de la tabla anterior corresponden a la variante de 4 bits y no son extrapolables directamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (StrongREJECT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16 | 180 B (MoE) | 262K | 1,3 % | qwen-community-1.0 | Hugging Face, 2 descargas |
| Qwen3.8-Flash-Next (base) | 180 B (MoE) | 262K | 87,9 % | qwen-community-1.0 | Hugging Face, oficial |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas MoE de ~180 B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks independientes ni de comparaciones con otras variantes uncensored verificables en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de la negativa a responder es intencionada y global: el modelo respondera a practicamente cualquier peticion, incluidas las daninas. No debe desplegarse en productos de cara al publico sin una capa externa de moderacion.
- Los benchmarks de rechazo y capacidad los publica el propio autor, sin verificacion independiente; las cifras de 728 frente a 724 deben tomarse con cautela.
- Traccion practicamente nula: 2 descargas y 0 likes en el momento del analisis, con fechas de creacion y actualizacion de noviembre de 2026. No hay evidencia de uso en produccion.
- La licencia qwen-community-1.0 impone condiciones adicionales de uso comercial que deben revisarse en el fichero LICENSE; el campo de Hugging Face figura como "other", lo que exige lectura manual.
- El modelo base es un "preestreno" de la arquitectura de Qwen4, por lo que puede presentar inestabilidades propias de una version preliminar.
- No se documentan idiomas soportados ni calidad multilingue; el comportamiento fuera del ingles es desconocido.
- Riesgo de alucinacion no cuantificado; en un modelo de 180 B sin datos de evaluacion de fidelidad, es esperable un comportamiento similar al de su base, pero no hay mediciones.
- El tamano de 360 GB en BF16 hace inviable el despliegue en infraestructura de consumo; la unica via practica es la variante NVFP4-XS del mismo autor, con sus propias recetas y dependencias de software.
- La model card incluye enlaces de donacion y suscripcion (LotusMake) y promociona builds propios de vLLM; conviene separar el contenido tecnico de la promocion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante cuantizada NVFP4-XS: https://huggingface.co/AEON-7/Aeon3.8-Flash-Next-ULTIMATE-UNCENSORED-NVFP4-XS
- Recetas e indice en GitHub: https://github.com/AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored
- Build de vLLM para DGX Spark: https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Guia para agentes de configuracion (AGENTS.md): https://huggingface.co/AEON-7/Aeon3.8-Flash-Next-ULTIMATE-UNCENSORED-NVFP4-XS/blob/main/AGENTS.md
- Paper de referencia citado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper de referencia citado en los tags (arXiv:2402.10260): https://arxiv.org/abs/2402.10260
