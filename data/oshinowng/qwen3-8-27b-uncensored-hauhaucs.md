# oshinoWng/Qwen3.8-27B-Uncensored-HauhauCS

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS es una derivación no oficial del modelo Qwen/Qwen3.8-27B, publicada por el usuario oshinoWng y distribuida en cuantizaciones GGUF por HauhauCS. Se trata de un modelo de lenguaje causal denso de 27B con codificador de visión, al que se le ha aplicado el perfil de "desensurado" (uncensoring) denominado Aggressive, que según el autor elimina el comportamiento de rechazo y minimiza el preámbulo en peticiones difíciles.

El valor diferencial del release no está en el ajuste, sino en la parte de aceleración: conserva la cabeza MTP/NextN nativa de Qwen3.8 y añade HauhauCS FastMTP, un sidecar de decodificación especulativa de 32K que el autor cifra en hasta 3,02 veces más velocidad de generación en documentos y 1,93 veces en tareas de razonamiento respecto a la variante sin MTP. Todo el lineup de cuantizaciones comparte el mismo proyector de visión BF16 y el mismo sidecar FastMTP.

Es relevante ahora porque combina tres cosas poco habituales en un mismo paquete GGUF: ventana de contexto nativa de 262.144 tokens ampliable hasta 1.000.000, capacidades multimodales (imagen y vídeo) y decodificación especulativa integrada lista para llama.cpp o LM Studio, sin builds especiales ni plugins. El repositorio registra 0 descargas y 0 likes en el momento de la consulta de metadatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; híbrido de 48 capas Gated DeltaNet y 16 capas de atención con compuerta (gated attention); 64 capas de lenguaje en total |
| Parámetros totales | 27B según la model card del autor; los metadatos de HuggingFace declaran 1.863.907.840 parámetros en safetensors (discrepancia no resuelta en la información disponible) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; ampliable hasta 1.000.000 |
| Tipos de cuantización | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; más proyector de visión BF16 y sidecar FastMTP 32K |
| Idiomas soportados | en, zh, multilingual (según los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto, proyector de visión y sidecar FastMTP); los metadatos indican también presencia de pesos safetensors en el repositorio |

Otros datos de arquitectura declarados: hidden size 5.120, FFN size 17.408, vocabulario con padding de 248.320 tokens. Tamaño total del repositorio: 172,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 64 capas que combina dos mecanismos de secuencia: 48 capas Gated DeltaNet (familia de modelos de estado recurrente con decaimiento, orientada a eficiencia en contextos largos) y 16 capas de atención con compuerta. El hidden size es 5.120 y el FFN 17.408, con un vocabulario con padding de 248.320 entradas. Incorpora además un codificador de visión servido mediante un proyector BF16 separado de 931 MB (mmproj), lo que habilita entrada de imagen y vídeo según el autor.

El modelo conserva la cabeza MTP/NextN nativa de Qwen3.8 embebida en los tensores de texto, y añade el perfil HauhauCS FastMTP 32K como sidecar de 903 MB para decodificación especulativa. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si hubo RLHF, DPO u otras etapas de alineación. El autor indica explícitamente que no se han modificado los datasets ni las capacidades previstas del modelo base: la intervención se limita al perfil Aggressive de uncensoring y a la capa de aceleración.

Las cuantizaciones K_P ("Perfect") son perfiles de cuantización personalizados que preservan selectivamente las capas sensibles a la calidad, con un sobrecoste declarado de entre el 5 % y el 15 % de tamaño frente a la cuantización base. Los ficheros siguen siendo GGUF estándar y funcionan en llama.cpp y LM Studio sin compilaciones ni plugins específicos.

## Capacidades

- Generación de texto y razonamiento: el autor declara que se preservan las capacidades de texto y razonamiento del modelo base Qwen3.8-27B.
- Multimodalidad: entrada de imagen y vídeo mediante el proyector BF16 incluido en el repositorio; pipeline declarado image-text-to-text.
- Capacidades agénticas: la model card afirma que se conservan las capacidades agénticas del modelo base, aunque no se detallan formatos de tool calling ni de function calling concretos.
- Multilingüismo: inglés y chino declarados explícitamente, más la etiqueta genérica "multilingual".
- Decodificación especulativa integrada: cabeza MTP/NextN nativa más sidecar FastMTP 32K; el autor reporta hasta 3,02x de velocidad de generación en documentos y 1,93x en razonamiento frente a la variante sin MTP, y hasta un 35,2 % y un 21,1 % más de velocidad que el MTP embebido estándar en esos mismos escenarios.
- Perfil de respuesta Aggressive: 0 rechazos en 465 pruebas según el autor, respuestas directas y preámbulo mínimo en peticiones difíciles.
- Contexto largo: 262.144 tokens nativos, ampliables hasta 1.000.000.

## Casos de uso

- Procesamiento de documentación extensa por lotes: con 262.144 tokens de contexto nativo se pueden ingerir informes anuales, expedientes completos o bases de código medianas en una sola pasada. El sidecar FastMTP está precisamente optimizado para el modo "document TG", lo que reduce el coste por documento en flujos de resumen o extracción masiva.
- Atención al cliente multi-turno: la ventana de contexto larga permite mantener historiales de conversación e información de cuenta sin truncar, y el perfil Aggressive evita preámbulos y evasivas cuando el usuario plantea consultas delicadas o ambiguas.
- Análisis de documentos escaneados y capturas: combinando el modelo de texto con el proyector BF16 (931 MB) se puede hacer OCR, extracción de tablas y descripción de diagramas en pipelines locales, sin depender de APIs externas.
- Despliegue local en estación de trabajo con GPU de consumo: la cuantización IQ4_XS ocupa 15,71 GB y Q4_K_P 17,92 GB, lo que permite ejecutar el modelo en una GPU de 24 GB con llama.cpp o LM Studio, con el proyector de visión cargado en paralelo.
- Investigación sobre alineación y seguridad: el modelo declara 0 rechazos en 465 pruebas, lo que lo convierte en una pieza útil para estudiar comportamiento de modelos desensurados, comparar tasas de rechazo y evaluar transferencia de capacidades tras ablación.
- Agentes de larga duración: la combinación de contexto ampliable a 1.000.000 de tokens, estado recurrente en 48 de las 64 capas (menos presión de caché KV) y decodificación especulativa lo hace apto para bucles agénticos con muchas iteraciones, siempre que se valide el soporte real de tool calling en el runtime elegido.
- Aceleración de pipelines de inferencia existentes: al ser GGUF estándar con sidecar FastMTP, se puede integrar en un stack llama.cpp ya en producción para aumentar el throughput de decodificación sin reentrenar ni cambiar de infraestructura.
- Razonamiento asistido con latencia reducida: el multiplicador de 1,93x en "reasoning TG" es aplicable a tareas de cadena de pensamiento larga, donde el cuello de botella suele ser la generación de tokens más que el prefill.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación estándar para este modelo ni para su base.

Los únicos datos cuantitativos publicados por el autor son los siguientes:

| Métrica | Valor declarado |
|---|---|
| Tasa de rechazo | 0 de 465 pruebas |
| Velocidad de generación en documentos (vs. sin MTP) | Hasta 3,02x |
| Velocidad de generación en razonamiento (vs. sin MTP) | Hasta 1,93x |
| Velocidad en documentos (vs. MTP embebido estándar) | Hasta +35,2 % |
| Velocidad en razonamiento (vs. MTP embebido estándar) | Hasta +21,1 % |

Estos valores son afirmaciones del autor del release, no verificaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño de fichero más overhead de contexto; cifras derivadas de los tamaños publicados, no medidas por el autor):

| Cuantización | Tamaño del fichero | VRAM orientativa |
|---|---:|---:|
| Q8_K_P | 31,46 GB | ~33 GB o más |
| Q6_K_P | 25,92 GB | ~27 GB o más |
| Q5_K_P | 20,22 GB | ~21-22 GB |
| Q4_K_P | 17,92 GB | ~19-20 GB |
| IQ4_XS | 15,71 GB | ~17-18 GB |
| Q3_K_P | 13,44 GB | ~14-15 GB |
| IQ3_M | 12,79 GB | ~13-14 GB |
| IQ3_XS | 12,18 GB | ~13 GB |
| Q2_K_P | 10,68 GB | ~11-12 GB |
| IQ2_M | 10,32 GB | ~11 GB |

- Componentes adicionales: proyector de visión BF16 de 931 MB y sidecar FastMTP 32K de 903 MB, que se suman a la huella si se usan.
- GPU recomendadas: A100 40 GB o 80 GB y H100 80 GB para Q8_K_P y contextos largos; RTX 4090 o RTX 3090 (24 GB) para Q4_K_P e IQ4_XS con contexto moderado; GPU de 16 GB para Q3_K_P e inferiores.
- Viabilidad en GPU de consumo: sí, con IQ4_XS o Q4_K_P en 24 GB justos y contexto corto; en 16 GB conviene bajar a Q3_K_P o IQ3_M. Las cuantizaciones Q2/IQ2 caben en 12 GB, con la degradación de calidad asociada.
- Contexto largo: el coste de la caché KV crece con la ventana. Solo 16 de las 64 capas son de atención con caché (las otras 48 son Gated DeltaNet con estado recurrente), lo que reduce la presión frente a un transformer denso completo, pero se desconoce la configuración exacta de cabezas KV y por tanto el tamaño real de caché. Para ventanas cercanas a 262K o superiores conviene planificar 80 GB o descarga a RAM.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF. El autor afirma que no se requiere build ni plugin especial. No se menciona soporte explícito de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no hay cifras absolutas de tokens por segundo. Los únicos datos son relativos (hasta 3,02x y 1,93x frente a sin MTP). El sidecar FastMTP está perfilado a 32K, por lo que el beneficio se documenta a máxima ventana nativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS (Aggressive, MTP) | 27B declarados (1,86B en safetensors según metadatos) | 262.144 nativos, hasta 1.000.000 | Sí (imagen y vídeo) | GGUF, safetensors, sidecar FastMTP | Apache 2.0 | Repositorio con 0 descargas y 0 likes; ficheros alojados en el repo de HauhauCS |
| Qwen/Qwen3.8-27B (modelo base) | 27B | No disponible en la información proporcionada | Sí, según las capacidades que el autor declara preservar | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo base de referencia en HuggingFace |
| Otros modelos comparables de 27B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se ha proporcionado información sobre alternativas de terceros de la misma categoría, por lo que la comparativa queda limitada al modelo base.

## Limitaciones y advertencias

- Modelo desensurado por diseño: el perfil Aggressive busca respuestas directas sin comportamiento de rechazo (0 de 465 pruebas). Esto implica riesgo real de generar contenido dañino, ilegal o inseguro sin filtros. No es apto para aplicaciones de cara al público sin una capa de moderación propia.
- La model card recomienda la variante Balanced, no esta, para trabajo agéntico de contexto largo donde la fiabilidad sea crítica. Es una advertencia explícita del propio autor.
- Discrepancia de parámetros no resuelta: los metadatos de HuggingFace declaran 1.863.907.840 parámetros en safetensors, frente a los 27B que indica el nombre y la model card. Conviene verificar los ficheros antes de planificar hardware.
- Riesgo de alucinación: no hay ninguna evaluación publicada de fidelidad, veracidad ni tasas de alucinación. Al ser una derivación con cuantizaciones que llegan a IQ2_M (3,02 BPW), la degradación en las variantes bajas puede ser notable.
- Idiomas: solo inglés y chino están declarados explícitamente. No hay garantía de calidad en castellano ni en otras lenguas, pese a la etiqueta "multilingual".
- Cobertura de contexto extendido: se anuncia extensión hasta 1.000.000 de tokens, pero no se documenta el método (RoPE scaling, YaRN u otro) ni la degradación esperada más allá de los 262.144 nativos.
- Trazabilidad: el repositorio consultado (oshinoWng) tiene 0 descargas y 0 likes, y los enlaces de descarga de los ficheros apuntan a un repositorio distinto (HauhauCS). Conviene verificar la procedencia y las sumas de comprobación antes de desplegar en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado por un modelo sin rechazos sigue siendo responsabilidad del operador. La licencia del modelo base debe confirmarse por separado.
- Compatibilidad de herramientas: las cuantizaciones K_P pueden aparecer como "?" en la columna de cuantización de LM Studio; el autor indica que es solo un problema de visualización.
- Soporte de tool calling no confirmado: la model card afirma que se conservan las capacidades agénticas, pero no especifica formatos ni plantillas de función. Hay que validarlo en el runtime concreto antes de construir agentes sobre él.
- Fechas de metadatos: el repositorio figura como creado el 2026-10-09, dato coherente con la información recibida pero que conviene contrastar en la página del modelo.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/oshinoWng/Qwen3.8-27B-Uncensored-HauhauCS
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF del autor de las cuantizaciones: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Cuantización Q8_K_P (31,46 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Cuantización Q6_K_P (25,92 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q6_K_P.gguf
- Cuantización Q5_K_P (20,22 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_K_P.gguf
- Cuantización Q4_K_P (17,92 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
- Cuantización IQ4_XS (15,71 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS.gguf
- Cuantización Q3_K_P (13,44 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q3_K_P.gguf
- Cuantización IQ3_M (12,79 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_M.gguf
- Cuantización IQ3_XS (12,18 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_XS.gguf
- Cuantización Q2_K_P (10,68 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q2_K_P.gguf
- Cuantización IQ2_M (10,32 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ2_M.gguf
- Proyector de visión BF16 (931 MB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf
- Sidecar HauhauCS FastMTP 32K (903 MB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper, blog técnico o demo oficial: no disponible en la información proporcionada.
