# minte1431/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una distribución en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario minte1431 (los enlaces de descarga apuntan al espacio de HuggingFace de HauhauCS). Se trata de una variante "uncensored" con perfil Aggressive, orientada a eliminar comportamientos de rechazo y preámbulos innecesarios en prompts difíciles: el autor afirma 0 rechazos sobre 465 pruebas. El modelo conserva las capacidades multimodales (imagen y vídeo) del original mediante un proyector BF16 distribuido aparte.

Arquitectónicamente es un transformer causal denso de 27B con encoder de visión, híbrido entre capas de atención lineal y atención clásica: 48 capas Gated DeltaNet y 16 capas de gated attention, 64 capas en total, hidden size de 5.120, FFN de 17.408 y vocabulario de 248.320 tokens. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000 según la model card. Incorpora la cabeza MTP/NextN nativa de Qwen3.8 y añade el sidecar HauhauCS FastMTP de 32K para decodificación especulativa.

Su relevancia práctica está en dos ejes: por un lado, permite ejecutar localmente un modelo multimodal de 27B con contexto muy largo en hardware de consumo mediante cuantizaciones agresivas; por otro, la aceleración FastMTP promete hasta 3,02x en throughput de generación de documentos y 1,93x en razonamiento frente a ejecución sin MTP. Hay que señalar que el repositorio declara 1.863.907.840 parámetros en safetensors frente a los 27B de la model card, una discrepancia relevante que no se resuelve con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de vision; hibrida con 48 capas Gated DeltaNet y 16 capas de gated attention |
| Parametros totales | 27B segun la model card; el repositorio declara 1.863.907.840 parametros en safetensors (discrepancia no resuelta) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (texto); mmproj BF16 (proyector de vision); sidecar FastMTP 32K en GGUF |
| Numero de capas | 64 |
| Hidden size | 5.120 |
| FFN size | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 172,5 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de creacion y actualizacion | 2026-09-10 (ambas identicas) |

## Arquitectura y entrenamiento

La model card describe un modelo denso de 27B con encoder de visión, 64 capas de lenguaje, hidden size 5.120 y FFN de 17.408. Lo distintivo es la composición de capas: 48 capas Gated DeltaNet (atención lineal recurrente con decaimiento controlado por puerta) y solo 16 capas de gated attention clásica. Esta mezcla reduce el coste de cómputo y de memoria de la caché KV en contextos largos, ya que únicamente las capas de atención completa requieren caché por token, lo que resulta coherente con un contexto nativo de 262.144 tokens y la extensión anunciada hasta 1.000.000.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO. Tampoco se detalla el proceso de "uncensoring" más allá de la afirmación de que no se modificaron datasets ni capacidades previstas, aplicándose únicamente un perfil Aggressive. La innovación técnica declarada es la preservación de la cabeza MTP (Multi-Token Prediction) nativa NextN en todas las cuantizaciones de texto, junto con el sidecar HauhauCS FastMTP de 32K, un perfil de aceleración para decodificación especulativa. El autor afirma que FastMTP rinde hasta un 35,2% más en generación de documentos y un 21,1% más en razonamiento que el MTP embebido estándar. Las cuantizaciones K_P son perfiles propietarios de HauhauCS que, según el autor, elevan la calidad uno o dos niveles de cuantización con solo un 5-15% más de tamaño, manteniendo compatibilidad con llama.cpp y LM Studio sin builds especiales.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo modo de pensamiento heredado de la familia Qwen3.8 (la model card menciona capacidades de razonamiento y agénticas preservadas).
- Generación y comprensión de código, aunque no se aportan benchmarks específicos en la información disponible.
- Capacidades multimodales de imagen: entrada de imagen mediante el proyector mmproj BF16 (931 MB), descargable por separado.
- Capacidades de vídeo: la model card afirma que se preservan las capacidades de vídeo del modelo base.
- Razonamiento agéntico y uso de herramientas: el autor menciona explícitamente trabajo agéntico de contexto largo como escenario objetivo.
- Multilingüe: inglés, chino y otros idiomas marcados como "multilingual" (sin listado detallado).
- Generación sin rechazos: perfil Aggressive con respuestas directas y preámbulo mínimo en prompts difíciles; 0/465 rechazos según el autor.
- Decodificación especulativa acelerada mediante el sidecar FastMTP 32K, compatible con todas las cuantizaciones de texto.
- Compatibilidad con endpoints: el tag endpoints_compatible sugiere integración con infraestructura de inferencia gestionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens nativos y una caché KV reducida por el uso mayoritario de capas Gated DeltaNet, el modelo puede resumir o extraer información de contratos, informes técnicos o expedientes completos sin troceado, en una única pasada.
- Análisis de documentación técnica con imágenes: la combinación de texto e imagen permite procesar manuales con diagramas, capturas de interfaz o planos, generando resúmenes operativos o procedimientos paso a paso.
- Transcripción y descripción de vídeo: al preservar las capacidades de vídeo, es adecuado para generar descripciones, resúmenes de contenido o índices temporales de material audiovisual.
- Atención al cliente multilingüe en inglés y chino: la ventana de contexto permite arrastrar todo el historial de una conversación multi-turno y la documentación de producto, manteniendo coherencia en respuestas largas.
- Agentes autónomos con tool calling: el modelo puede integrarse en bucles de razonamiento con llamadas a funciones y ejecutar tareas multi-paso; conviene usar una variante equilibrada si la fiabilidad es crítica según el propio autor.
- Generación de código en pipelines de CI/CD: integrado en herramientas locales (llama.cpp, LM Studio) para revisión de parches, generación de tests o explicación de diffs sin enviar código a servicios externos.
- Red teaming e investigación en alineación: la eliminación de rechazos lo convierte en una herramienta útil para estudiar comportamientos del modelo ante prompts adversarios y para evaluar mecanismos de seguridad.
- Traducción inglés-chino de documentación técnica: el par en/zh está declarado explícitamente y cuenta con un vocabulario de 248.320 tokens que cubre ambos idiomas con margen.
- Despliegue offline en estaciones de trabajo: las cuantizaciones IQ2_M (10,32 GB) y Q2_K_P (10,68 GB) permiten ejecutar el modelo en GPU de 12-16 GB, útil en entornos sin conexión o con requisitos de confidencialidad.
- Procesamiento por lotes acelerado: el sidecar FastMTP, con hasta 3,02x de velocidad en generación de documentos, resulta adecuado para tareas de generación masiva donde el throughput importa más que la latencia interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye métricas internas de aceleración y de comportamiento, sin comparaciones con MMLU, HumanEval, GSM8K ni otros conjuntos estándar.

| Metrica declarada por el autor | Valor |
|---|---|
| Rechazos en conjunto de prueba propio | 0 de 465 |
| Aceleracion TG en documentos frente a no-MTP | hasta 3,02x |
| Aceleracion TG en razonamiento frente a no-MTP | hasta 1,93x |
| TG en documentos frente a MTP embebido estandar | hasta +35,2% |
| TG en razonamiento frente a MTP embebido estandar | hasta +21,1% |
| Benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) | no disponible |

No se especifican las condiciones de medición (hardware, batch size, longitud de contexto ni cuantización empleada), por lo que las cifras deben considerarse afirmaciones del autor y no resultados reproducibles.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del tamaño de fichero de cada cuantización más la caché KV y el overhead del runtime; no proceden de mediciones publicadas.

- VRAM estimada por cuantización (solo pesos, sin caché):
  - IQ2_M: 10,32 GB; Q2_K_P: 10,68 GB.
  - IQ3_XS: 12,18 GB; IQ3_M: 12,79 GB; Q3_K_P: 13,44 GB.
  - IQ4_XS: 15,71 GB; Q4_K_P: 17,92 GB.
  - Q5_K_P: 20,22 GB; Q6_K_P: 25,92 GB; Q8_K_P: 31,46 GB.
- VRAM estimada en ejecución (pesos + caché KV + overhead aproximado):
  - Q2/IQ2: aproximadamente 12-14 GB.
  - IQ4_XS / Q4_K_P: aproximadamente 18-23 GB.
  - Q5_K_P / Q6_K_P: aproximadamente 24-31 GB.
  - Q8_K_P: aproximadamente 34-40 GB.
- Caben en GPU de consumo: IQ2 y Q2 en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090 con margen); IQ4_XS y Q4_K_P en 24 GB (RTX 3090, RTX 4090); Q5 y superiores requieren 32 GB o más.
- GPU profesionales: Q8_K_P encaja en A100 40 GB, L40S 48 GB o H100; las cuantizaciones IQ4/Q5 pueden servirse en A100 40 GB con contexto largo.
- Opciones de despliegue: llama.cpp y LM Studio (soportados explícitamente), Ollama mediante importación de GGUF, y runtimes GGUF compatibles. El proyector de visión requiere soporte multimodal del runtime para cargar el mmproj.
- Latencia y throughput: no disponibles en valores absolutos. Las únicas cifras publicadas son ratios relativos de aceleración (hasta 3,02x y 1,93x con FastMTP) sin hardware de referencia.
- Nota sobre memoria de contexto: al contar solo 16 de 64 capas con atención completa, la caché KV crece más despacio que en un transformer denso convencional de 27B, lo que favorece contextos de 262K en GPU de 24 GB con cuantizaciones bajas.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, ni de resultados de benchmarks que permitan una comparacion cuantitativa. La unica referencia documentada es el modelo base, cuyo rendimiento tampoco se detalla en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF) | 27B declarados (1,86B en safetensors, discrepancia sin resolver) | 262.144 nativos, hasta 1.000.000 | apache-2.0 | GGUF en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.8-27B (base) | 27B declarados | no disponible | no disponible | referenciado como base_model, sin datos adicionales |
| Alternativas de la misma categoria (uncensored GGUF multimodales de ~27B) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Perfil "uncensored" con variante Aggressive: se elimina deliberadamente el comportamiento de rechazo. Esto implica riesgo real de generar contenido dañino, ilegal o inseguro, y no debe desplegarse en aplicaciones orientadas al público sin filtros externos.
- La métrica de 0/465 rechazos es una afirmación del autor sin metodología publicada, sin descripción del conjunto de prompts ni verificación independiente.
- Discrepancia de parámetros: el repositorio declara 1.863.907.840 parámetros en safetensors, frente a los 27B que indica la model card. No se puede confirmar el tamaño real del modelo con la información disponible.
- Coincidencia de fechas: creación y actualización idénticas (2026-09-10), 0 descargas y 0 likes. El modelo no tiene historial de uso verificable.
- Divergencia de autoría: el repositorio pertenece a minte1431, pero todos los enlaces de descarga apuntan al espacio de HuggingFace de HauhauCS. Conviene verificar la procedencia antes de usar los ficheros.
- Alucinación: no hay datos publicados sobre tasas de alucinación, ni evaluación con benchmarks de veracidad. El perfil Aggressive, al reducir preámbulos y matices, puede aumentar la confianza aparente en respuestas incorrectas.
- Idiomas: solo se declaran en, zh y "multilingual" sin listado. El rendimiento en castellano no está evaluado y previsiblemente será inferior al de inglés y chino.
- Cuantizaciones agresivas: las variantes IQ2_M, Q2_K_P, IQ3_XS e IQ3_M degradan la calidad de forma apreciable; no son recomendables para tareas de razonamiento o código en producción.
- Contexto extendido: la extensión hasta 1.000.000 tokens es una afirmación de la model card. No se documenta la técnica de extensión ni la degradación de calidad más allá de los 262.144 tokens nativos.
- Dependencias de ficheros: el soporte de visión requiere descargar el mmproj BF16 por separado (931 MB) y que el runtime lo soporte; la aceleración FastMTP requiere el sidecar de 903 MB.
- Compatibilidad de widgets: el propio autor advierte que el widget de compatibilidad de hardware de HuggingFace puede no reconocer las cuantizaciones K_P, y que LM Studio puede mostrar "?" en la columna de cuantización (problema de visualización, no de carga).
- Uso comercial: la licencia declarada es apache-2.0, pero se desconoce la licencia real del modelo base y si impone condiciones adicionales. Debe verificarse antes de un despliegue comercial.
- Fiabilidad en agentes: el propio autor recomienda una variante "Balanced" para trabajo agéntico de contexto largo crítico en fiabilidad, lo que implica que Aggressive no es la opción por defecto para esos escenarios.
- Sin benchmarks: no hay evidencia pública de rendimiento en MMLU, HumanEval, GSM8K ni evaluaciones multimodales, lo que impide comparar con alternativas establecidas.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/minte1431/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Servidor de Discord del autor: https://discord.gg/SZ5vacTXYf
- Descarga Q8_K_P (31,46 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Descarga Q6_K_P (25,92 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q6_K_P.gguf
- Descarga Q5_K_P (20,22 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_K_P.gguf
- Descarga Q4_K_P (17,92 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
- Descarga IQ4_XS (15,71 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS.gguf
- Descarga Q3_K_P (13,44 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q3_K_P.gguf
- Descarga IQ3_M (12,79 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_M.gguf
- Descarga IQ3_XS (12,18 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_XS.gguf
- Descarga Q2_K_P (10,68 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q2_K_P.gguf
- Descarga IQ2_M (10,32 GB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ2_M.gguf
- Proyector de vision BF16 (931 MB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf
- Sidecar HauhauCS FastMTP 32K (903 MB): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo asociado: no disponible
- Demo en linea: no disponible
