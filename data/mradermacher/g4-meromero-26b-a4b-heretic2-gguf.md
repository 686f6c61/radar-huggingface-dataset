# mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF

## Resumen

G4-MeroMero-26B-A4B-Heretic2 es un modelo de lenguaje derivado de la familia Gemma 4, con 25.233.142.046 parámetros totales, publicado originalmente por el usuario EternalDragon bajo el identificador `EternalDragon/G4-MeroMero-26B-A4B-Heretic2`. La versión aquí descrita es una cuantización GGUF estática producida por mradermacher, un conocido generador de cuantizaciones del ecosistema llama.cpp, que distribuye el modelo en múltiples niveles de precisión desde Q2_K hasta Q8_0, además de dos ficheros mmproj para el componente multimodal.

El sufijo "A4B" en el nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos por token sobre un total de 26.000 millones, aunque esta interpretación no está confirmada explícitamente en la información disponible. El término "Heretic" indica que se trata de un ajuste orientado a eliminar o reducir los mecanismos de rechazo y censura del modelo base, y las etiquetas de la model card lo clasifican como "uncensored", "roleplay" y "conversational".

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de gran tamaño con un coste de cómputo por token relativamente bajo (si se confirma el diseño MoE) y en formatos GGUF optimizados para llama.cpp, lo que lo hace accesible en hardware de consumo de gama alta. La licencia declarada es Apache 2.0, si bien conviene verificar las condiciones del modelo base original de Gemma, ya que las licencias de los derivados pueden heredar restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4; el sufijo "A4B" sugiere MoE con ~4B parámetros activos (no confirmado en la información disponible) |
| Parámetros totales | 25.233.142.046 (25,23B) |
| Parámetros activos | ~4B según la nomenclatura del nombre; no confirmado en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (según la model card); no se declaran otros idiomas |
| Licencia | Apache 2.0 (según la model card del repositorio GGUF) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors/transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Gemma 4 y de la nomenclatura "26B-A4B", que en el ecosistema de modelos abiertos se emplea habitualmente para describir modelos de mezcla de expertos con un total de 26.000 millones de parámetros y aproximadamente 4.000 millones activos por token. No se especifican el número de expertos, la estrategia de enrutamiento ni el número de capas. Tampoco se documentan los datos de entrenamiento, el volumen de tokens, la composición del corpus ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado en la fase de alineación.

El componente "Heretic2" hace referencia a un proceso de ajuste orientado a reducir el comportamiento de rechazo del modelo, presumiblemente mediante fine-tuning sobre datos que evitan respuestas evasivas. No se han publicado detalles técnicos sobre este proceso en la información proporcionada. El repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica que el modelo conserva capacidad multimodal de entrada, probablemente visión, heredada de Gemma 4, aunque no se especifica qué modalidades exactamente.

## Capacidades

- Generación de texto conversacional en inglés, con orientación explícita a roleplay y diálogo multi-turno.
- Comportamiento "uncensored": el ajuste Heretic2 reduce los rechazos ante peticiones que el modelo base declinaría.
- Capacidad multimodal de entrada probable (ficheros mmproj incluidos), sin detalle de modalidades concretas en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de razonamiento multi-paso, agentes o modo "thinking".
- Idiomas: únicamente inglés declarado en la model card.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Roleplay y ficción interactiva: el ajuste Heretic2 y la etiqueta "roleplay" lo orientan a personajes y narrativa sin rechazos, con contexto conversacional multi-turno; adecuado para prototipos de entretenimiento y escritura asistida.
- Generación creativa sin restricciones editoriales: útil para escritura de guiones, narrativa adulta o experimental donde los filtros de los modelos alineados resultan limitantes, siempre con las salvaguardas legales oportunas.
- Asistente conversacional local: al distribuirse en GGUF y con un tamaño activo reducido (si se confirma MoE), puede ejecutarse en estaciones de trabajo con GPU de consumo para prototipos de chatbot en inglés.
- Investigación sobre alineación y censura: permite estudiar el efecto de los ajustes "heretic" comparando respuestas frente al modelo base Gemma 4, en entornos controlados de evaluación.
- Generación de datos sintéticos de diálogo: útil para producir corpus conversacionales en inglés con estilos variados, revisando posteriormente la calidad y seguridad del contenido generado.
- Experimentación multimodal local: los ficheros mmproj permiten probar entrada de imágenes en llama.cpp para tareas de descripción o diálogo sobre imágenes, aunque sin garantías documentadas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~10,7 GB; Q3_K_S ~12,3 GB; Q3_K_M ~13,4 GB; Q3_K_L ~13,9 GB; IQ4_XS ~14,2 GB; Q4_K_S ~15,6 GB; Q4_K_M ~16,9 GB; Q5_K_S ~18,1 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB.
- Componente multimodal adicional: mmproj-Q8_0 ~0,9 GB y mmproj-f16 ~1,3 GB.
- GPU recomendadas: RTX 4090 (24 GB) permite Q4_K_M y Q5_K_M con contexto moderado; Q6_K y Q8_0 requieren 24 GB con cuidado o GPUs de 32 GB o más (A100 40 GB, H100, RTX 5090 si está disponible). Para Q8_0 sin compromisos, A100 40 GB o H100 80 GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo Q2_K o Q3_K_S con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj requieren llama.cpp con soporte multimodal (llama-mtmd o equivalente).
- Latencia y throughput: no disponibles en la información proporcionada; en un modelo MoE con ~4B activos se espera un throughput notablemente superior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-Heretic2 (esta ficha) | 25,23B totales, ~4B activos (según nombre) | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste uncensored/roleplay sobre Gemma 4 |
| Gemma 4 26B-A4B (base) | ~26B totales, ~4B activos | no disponible | Gemma license | safetensors | Modelo base alineado; esta variante elimina rechazos |
| Mistral Small 3 (24B) | 24B densos | 32K | Apache 2.0 | safetensors, GGUF | Alternativa densa con contexto documentado |
| Qwen3-30B-A3B | ~30B totales, ~3B activos | 32K+ | Apache 2.0 | safetensors, GGUF | MoE comparable en tamaño y activación |

La comparación con Mistral Small 3 y Qwen3-30B-A3B es orientativa: no se dispone de benchmarks del modelo de esta ficha que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo "uncensored": el ajuste Heretic2 elimina parte de las salvaguardas del modelo base, por lo que puede generar contenido ofensivo, inseguro o inapropiado; no es apto para producción orientada al público sin filtros adicionales.
- Riesgo elevado de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada: no se puede planificar el despliegue en escenarios de contexto largo sin verificación empírica.
- Licencia: aunque el repositorio GGUF declara Apache 2.0, el modelo base Gemma de Google suele distribuirse bajo su propia licencia con condiciones de uso; conviene revisar los términos del modelo base `EternalDragon/G4-MeroMero-26B-A4B-Heretic2` y de Gemma antes de un uso comercial.
- No se documenta soporte de tool calling ni agentes, por lo que no es adecuado para pipelines de automatización que dependan de function calling.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M) degradan la calidad; para uso serio se recomienda Q4_K_M o superior.
- El componente multimodal (mmproj) no está documentado en cuanto a modalidades y calidad; su uso en producción requiere validación propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF
- Modelo base: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#G4-MeroMero-26B-A4B-Heretic2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
