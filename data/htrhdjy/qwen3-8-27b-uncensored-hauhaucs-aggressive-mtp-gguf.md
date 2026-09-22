# htrhdjy/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una compilación de cuantizaciones GGUF publicada por el usuario htrhdjy sobre el modelo base Qwen/Qwen3.8-27B, un transformador causal denso de 27B parámetros con codificador de visión. La intervención consiste en un perfil de "desinhibición" (uncensoring) denominado Aggressive, que según el autor elimina el comportamiento de rechazo (0/465 rechazos en su evaluación interna) y reduce el preámbulo en peticiones difíciles, manteniendo las capacidades nativas de texto, razonamiento, uso agéntico, imagen y vídeo del modelo original.

El elemento técnico diferencial es FastMTP, un sidecar de decodificación especulativa de 903 MB que se apoya en la cabeza NextN/MTP ya embebida en Qwen3.8 y que, según las cifras del autor, alcanza hasta 3,02x de velocidad de generación (TG) en documentos y 1,93x en razonamiento frente a una ejecución sin MTP, y hasta un 35,2% y un 21,1% más de TG en esos mismos escenarios frente al MTP embebido estándar. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000 según la model card.

La relevancia práctica es doble: por un lado, permite ejecutar en hardware local un modelo multimodal de gran contexto con acortamiento de latencia vía decodificación especulativa; por otro, es una variante sin salvaguardas de alineamiento, lo que la hace interesante para investigación en seguridad y red-teaming, pero problemática para cualquier despliegue orientado a usuarios finales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y presenta inconsistencias documentales que se detallan en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador causal denso híbrido con codificador de visión. 64 capas de lenguaje: 48 capas Gated DeltaNet (atención lineal recurrente) y 16 capas de atención con gating. Hidden size 5.120; FFN size 17.408. Cabeza MTP/NextN embebida nativa, más sidecar HauhauCS FastMTP de 32K |
| Parametros totales | 27B según denominación y model card. El recuento de safetensors reportado en la ficha de HuggingFace es de 1.863.907.840 (~1,86B), dato inconsistente con un modelo de 27B; probablemente corresponde solo a un subconjunto (proyector/visión) o a un error de indexado. No disponible una cifra verificada |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 según la model card |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M. Se publican ficheros para las variantes K_P e IQ; Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M aparecen como referencia sin fichero con tamaño publicado |
| Idiomas soportados | Inglés (en), chino (zh) y multilingüe según los tags. El español no se declara explícitamente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto, cuantizado) + mmproj BF16 (proyector de visión, 931 MB) + sidecar FastMTP-32K (903 MB). No hay safetensors de pesos completos en este repositorio |
| Vocabulario | 248.320 tokens (con padding) |
| Tamaño del repositorio | 172,5 GB (suma de todos los ficheros publicados) |

## Arquitectura y entrenamiento

El modelo base es un transformador causal denso con una particularidad híbrida: de sus 64 capas, 48 emplean Gated DeltaNet, un mecanismo de atención lineal recurrente con estado de tamaño constante, y solo 16 usan atención con gating convencional. Esta proporción 48/16 reduce drásticamente el coste de caché KV en contextos muy largos, lo que es coherente con la ventana nativa de 262.144 tokens y con la extensión declarada hasta 1.000.000. El hidden size es de 5.120 y el FFN de 17.408, con un vocabulario de 248.320 tokens. Incorpora además un codificador de visión que habilita entrada image-text-to-text, servido mediante un proyector BF16 independiente en formato GGUF.

Sobre el entrenamiento del modelo base no se aporta información alguna en la documentación disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineamiento. Lo único documentado es la intervención del autor de la compilación: un perfil de uncensoring "Aggressive" aplicado presumiblemente vía modificación de capas o de plantillas, sin cambios en los datasets, y la preservación de la cabeza MTP/NextN nativa. La innovación técnica destacable es FastMTP, un perfil de decodificación especulativa de 32K que se cualifica, según el autor, "en toda la línea de cuantizaciones a máxima ventana nativa", y que se distribuye como fichero separado en lugar de ir embebido en los pesos. Las cuantizaciones K_P ("Perfect") son perfiles de cuantización personalizados por modelo que, según el autor, elevan la calidad uno o dos niveles de cuantización a cambio de un 5-15% más de tamaño, manteniendo el estándar GGUF y la compatibilidad con llama.cpp y LM Studio sin builds especiales.

## Capacidades

- Generación de texto y razonamiento en inglés, chino y otros idiomas; el autor declara preservadas las capacidades nativas de texto y razonamiento de Qwen3.8-27B.
- Comprensión de imagen y vídeo mediante el codificador de visión y el proyector mmproj BF16 (pipeline image-text-to-text). El proyector se descarga aparte y es compatible con todas las cuantizaciones de texto.
- Comportamiento agéntico: el autor indica que se preservan las capacidades agénticas del modelo base. No se detalla en la documentación disponible el soporte concreto de tool calling o function calling, ni el formato de plantilla empleado.
- Modo "Aggressive" sin rechazos: 0/465 rechazos declarados por el autor, con respuestas directas y preámbulo mínimo en peticiones difíciles.
- Decodificación especulativa acelerada mediante el sidecar FastMTP-32K, con dos perfiles diferenciados según el tipo de tarea (documento frente a razonamiento).
- Contexto largo nativo de 262.144 tokens, con las capas Gated DeltaNet reduciendo el crecimiento de la caché KV.
- Capacidades multilingües limitadas a las declaradas (en, zh, multilingual); no se declara soporte específico de español.
- No se documenta modo de razonamiento explícito (thinking mode), soporte de audio ni otras capacidades especiales.

## Casos de uso

- Análisis de documentación extensa on-premise: con 262.144 tokens de contexto nativo y cuantizaciones desde 10,32 GB (IQ2_M), permite cargar contratos, expedientes o bases de código completas en una sola pasada sin técnicas de recuperación fragmentada, algo viable en una estación de trabajo con una RTX 4090 usando Q4_K_P o IQ4_XS.
- Asistente de código en entornos air-gapped: al ser GGUF y ejecutable con llama.cpp sin conexión, encaja en equipos aislados donde no se permite enviar código a APIs externas; el perfil sin rechazos evita bloqueos en tareas de análisis de binarios, reversing o generación de exploits de laboratorio.
- Inspección automatizada de imágenes y vídeo: el proyector BF16 de 931 MB habilita descripción de escenas, revisión de fotogramas, moderación de contenido visual y extracción de información de documentos escaneados dentro de un pipeline multimodal local.
- Investigación en seguridad y alineamiento (red-teaming): con 0/465 rechazos declarados, es un sujeto de estudio útil para medir tasas de cumplimiento, sesgos y modos de fallo de modelos desinhibidos frente a sus versiones alineadas, siempre en entornos controlados.
- Generación creativa sin restricciones editoriales: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde los modelos alineados suelen derivar o rechazar; el perfil Aggressive está diseñado específicamente para evitar ese desvío.
- Agentes multi-paso con memoria larga: la combinación de contexto de 262K y el sidecar FastMTP (hasta 3,02x TG en tareas de documento según el autor) reduce la latencia en bucles agénticos que acumulan historial extenso, como asistentes de investigación o automatización de back-office.
- Traducción y procesamiento bilingüe inglés-chino: para flujos de localización o análisis de documentación técnica en ambos idiomas, aprovechando el vocabulario de 248.320 tokens.
- Despliegue en GPU de consumo con presupuesto ajustado: las variantes IQ2_M (10,32 GB) y Q2_K_P (10,68 GB) caben en tarjetas de 12 GB, con la advertencia de degradación de calidad asociada a cuantizaciones tan agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta métricas relativas de velocidad de generación atribuidas al sidecar FastMTP:

| Comparacion | Metrica | Valor declarado |
|---|---|---|
| FastMTP frente a sin MTP | TG en documentos | Hasta 3,02x |
| FastMTP frente a sin MTP | TG en razonamiento | Hasta 1,93x |
| FastMTP frente a MTP embebido estándar | TG en documentos | Hasta +35,2% |
| FastMTP frente a MTP embebido estándar | TG en razonamiento | Hasta +21,1% |
| Perfil Aggressive | Tasa de rechazo | 0/465 (evaluación del autor) |

Estas cifras son afirmaciones del autor, no verificadas de forma independiente, y no incluyen valores absolutos de tokens por segundo ni detalles del hardware de medida, que no se especifica.

## Requisitos de hardware

- Los tamaños de fichero publicados permiten estimar la VRAM de pesos en contexto corto; a ellos hay que sumar la caché KV (solo en las 16 capas de atención con gating), el proyector de visión (931 MB) y las activaciones. Las cifras siguientes son estimaciones derivadas de los tamaños de fichero, no datos oficiales:
- IQ2_M (10,32 GB) → ~11-12 GB de VRAM. Cabe en RTX 3060 12 GB, RTX 4070 12 GB, con margen muy justo.
- Q2_K_P (10,68 GB) y IQ3_XS (12,18 GB) → ~12-14 GB. RTX 4070 Ti Super 16 GB, RTX 4080 16 GB.
- IQ3_M (12,79 GB) y Q3_K_P (13,44 GB) → ~14-15 GB. RTX 4080/4090 16-24 GB.
- IQ4_XS (15,71 GB) → ~17-18 GB. RTX 4090 24 GB.
- Q4_K_P (17,92 GB) → ~20 GB. RTX 4090 24 GB con comodidad.
- Q5_K_P (20,22 GB) → ~23 GB. RTX 4090 24 GB al límite; conviene RTX 5090 32 GB o A6000 48 GB.
- Q6_K_P (25,92 GB) → ~29 GB. Requiere 2x RTX 4090, RTX 5090 32 GB o A100 40 GB.
- Q8_K_P (31,46 GB) → ~35 GB. A100 40 GB, H100 80 GB o 2x RTX 4090.
- GPU de referencia recomendadas: RTX 4090/5090 para cuantizaciones bajas y medias, A100 40 GB o H100 80 GB para Q6/Q8 y para contextos cercanos a 262K tokens.
- Cabe en GPU de consumo: sí, desde IQ2_M en 12 GB hasta Q4_K_P en 24 GB. Para Q6_K_P y Q8_K_P se necesita hardware profesional o multi-GPU.
- Opciones de despliegue: llama.cpp, LM Studio, y cualquier runtime compatible con GGUF; el autor menciona compatibilidad directa con ambos sin builds especiales. El soporte exacto de FastMTP y del proyector de visión en vLLM, TGI u Ollama no está documentado (no disponible), por lo que conviene verificar la versión del runtime antes de asumir aceleración.
- Latencia y throughput absolutos: no disponibles. Solo se conocen los multiplicadores relativos de FastMTP indicados en la sección anterior.
- Nota del autor: el widget de compatibilidad de hardware de HuggingFace puede no reconocer las cuantizaciones K_P; si faltan ficheros, hay que usar "View variants" o "Files and versions". En LM Studio, las K_P pueden mostrarse como "?" en la columna de cuantización, un problema meramente visual.

## Comparativa con modelos similares

No es posible una comparativa rigurosa por dos motivos: el modelo base Qwen/Qwen3.8-27B no dispone de documentación técnica pública en la información proporcionada (ni benchmarks, ni dataset, ni configuración de entrenamiento), y el recuento de parámetros del repositorio presenta una inconsistencia que impide confirmar el tamaño real. Se ofrece a continuación una referencia orientativa con modelos densos de rango similar ampliamente conocidos, cuyos datos son públicos y no proceden de esta ficha:

| Modelo | Parametros | Contexto | Multimodal | Licencia | GGUF |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B Aggressive MTP) | 27B (declarado) / inconsistente en safetensors | 262.144, extensible a 1.000.000 | Sí (imagen y vídeo) | Apache-2.0 | Sí, con sidecar FastMTP |
| Qwen3-32B | 32,8B | 32.768 nativo, 131.072 con YaRN | No | Apache-2.0 | Sí |
| Gemma 3 27B | 27B | 128.000 | Sí (imagen) | Términos de uso de Gemma (no Apache) | Sí |
| Mistral Small 3.1 24B | 24B | 128.000 | Sí (imagen) | Apache-2.0 | Sí |

La ventaja declarada de esta variante frente a las alternativas es la combinación de contexto nativo muy superior (262K, frente a 32K-128K) y decodificación especulativa integrada en el propio repositorio, junto con la ausencia de rechazos. La desventaja es que carece de benchmarks que respalden la calidad resultante tras el perfil Aggressive y las cuantizaciones K_P.

## Limitaciones y advertencias

- Perfil sin salvaguardas: el modelo declara 0/465 rechazos y respuestas directas sin preámbulo de cumplimiento. No debe desplegarse en productos orientados a usuarios finales sin una capa de moderación externa, ya que no incorpora filtros propios.
- Riesgo elevado de contenido dañino: la combinación de capacidades multimodales, contexto largo y ausencia de rechazos amplía la superficie de generación de contenido ilegal, abusivo o peligroso si se usa sin control.
- Alucinación: no hay benchmarks publicados que cuantifiquen la fiabilidad factual. Un ajuste de uncensoring agresivo suele degradar la calibración, por lo que se recomienda verificación humana en cualquier uso informativo.
- Fiabilidad en contexto largo y trabajo agéntico: el propio autor advierte que para trabajo agéntico crítico en contexto largo la variante "Balanced" es la opción segura por defecto, lo que implica que Aggressive prioriza la franqueza sobre la fiabilidad.
- Inconsistencia de parámetros: la ficha de HuggingFace reporta 1.863.907.840 parámetros en safetensors frente a los 27B del nombre y la model card. Hay que tratar cualquier cálculo de coste o VRAM con cautela hasta confirmar el dato.
- Licencia: se declara Apache-2.0, pero el modelo es un derivado de Qwen/Qwen3.8-27B. Conviene verificar la licencia y la política de uso aceptable del modelo base antes de un uso comercial, ya que los ajustes de uncensoring pueden entrar en conflicto con dichas políticas aunque la licencia del derivado sea permisiva.
- Idiomas: solo se declaran inglés, chino y multilingüe genérico. No hay garantía de calidad en castellano, ni evaluación publicada.
- Cuantizaciones extremas: por debajo de Q4 la degradación puede ser notable; IQ2_M y Q2_K_P sacrifican calidad por tamaño y no son adecuadas para tareas de razonamiento exigentes.
- Integración: el proyector de visión (mmproj) debe descargarse y cargarse aparte; sin él no hay entrada de imagen ni vídeo. El soporte de FastMTP depende del runtime y de su versión, no documentados.
- Reputación del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día. La model card enlaza ficheros del repositorio HauhauCS, mientras que el repositorio consultado pertenece a htrhdjy, lo que sugiere un espejo o reupload sin validación independiente de integridad.
- Sin documentación de entrenamiento ni de evaluación: no hay número de tokens, composición de dataset, ni fases de alineamiento disponibles, lo que impide auditar sesgos o procedencia de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/htrhdjy/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio alternativo citado en la model card (autor original del perfil): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper, blog técnico, repositorio de código fuente y demo: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces encontrados corresponden a Alber GmbH, una empresa alemana de electromovilidad, y no guardan relación con esta ficha.
