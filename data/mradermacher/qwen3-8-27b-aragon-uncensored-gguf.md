# mradermacher/qwen3.8-27b-aragon-uncensored-GGUF

## Resumen

`mradermacher/qwen3.8-27b-aragon-uncensored-GGUF` es una distribución de cuantizaciones estáticas en formato GGUF del modelo `jdqqjr/qwen3.8-27b-aragon-uncensored`, un derivado de la familia Qwen de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) que ha sido modificado mediante técnicas de *abliteration* y *heretic* para eliminar o atenuar los mecanismos de rechazo alineados del modelo original. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad, y no el autor del modelo base.

El interés de esta ficha no reside en un avance arquitectónico —no se documenta ninguno— sino en la disponibilidad de un conjunto completo de cuantizaciones (desde Q2_K de 11,0 GB hasta Q8_0 de 29,1 GB, más dos variantes de proyector multimodal `mmproj`) que permiten ejecutar un modelo de ~27B en hardware de consumo. La presencia de ficheros `mmproj` indica que el modelo base incorpora capacidades de visión, aunque la model card no lo detalla explícitamente.

Conviene subrayar que la información publicada es muy escasa: la model card del repositorio GGUF es una plantilla estándar de mradermacher que no describe arquitectura, datos de entrenamiento, contexto ni benchmarks. La licencia aparece como "no disponible" en los metadatos de Hugging Face, lo que constituye un riesgo relevante para cualquier uso en producción. El repositorio ocupa 190,8 GB y acumula 224 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen; sin confirmación documental de si es transformer denso o MoE) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyectores multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye presumiblemente en safetensors vía transformers |
| Tamano del repositorio | 190,8 GB |
| Libreria declarada | transformers |
| Modelo base | jdqqjr/qwen3.8-27b-aragon-uncensored |
| Etiquetas | heretic, uncensored, abliterated, qwen, conversational, endpoints_compatible |
| Fecha de creacion | 2026-08-29 |
| Ultima actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre y las etiquetas (`qwen`) sugieren un origen en la familia Qwen, y el recuento de parámetros (27,3B) es coherente con un transformer denso de esa escala, pero no hay confirmación documental de si se trata de atención completa, atención lineal, arquitectura híbrida o un diseño MoE. Tampoco se especifican el número de capas, las dimensiones ocultas, el número de cabezas de atención ni la longitud de contexto nativa.

Respecto al entrenamiento, la única información disponible es que el modelo ha pasado por un proceso de *abliteration* —técnica que identifica y suprime direcciones en el espacio de activaciones asociadas al rechazo— y que lleva las etiquetas `heretic` y `uncensored`. No se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado posteriores. Tampoco se detalla el proceso de cuantización más allá de las marcas internas de la plantilla (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), que indican una conversión desde pesos Hugging Face con cuantización por tensor de salida.

La existencia de ficheros `mmproj` (proyector multimodal) en el repositorio es el único indicio técnico adicional: apunta a que el modelo base incorpora un codificador visual y capacidades de comprensión de imágenes, aunque ni el tamaño del codificador ni la resolución de entrada están documentados.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y la inclusión de plantillas de chat en el ecosistema Qwen apuntan a uso en diálogo multi-turno.
- Comprensión de imágenes: la presencia de proyectores `mmproj-Q8_0` y `mmproj-f16` indica soporte multimodal (visión), aunque no se detalla su alcance.
- Generación sin restricciones de rechazo: el proceso de abliteration busca eliminar las negativas automáticas del modelo alineado original.
- Idiomas: únicamente se declara inglés (`en`); no hay evidencia de soporte multilingüe, pese al nombre "aragon" del modelo base.
- Tool calling / function calling: no disponible en la documentación.
- Modo de razonamiento explícito (*thinking*): no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- **Investigación sobre alineación y seguridad**: el modelo permite estudiar empíricamente el efecto de la abliteration comparando respuestas con el modelo Qwen original, midiendo qué tipos de contenido se desbloquean y con qué coherencia se preservan las capacidades generales.
- **Generación de ficción y narrativa sin filtros**: para escritura creativa que aborde temas oscuros, violencia o contenido adulto, donde los modelos alineados suelen introducir rechazos o evasivas. La cuantización Q4_K_M (16,9 GB) permite ejecutarlo en una GPU de 24 GB.
- **Análisis de documentos e imágenes en local**: gracias a los ficheros `mmproj`, puede desplegarse con llama.cpp para extraer información de capturas, diagramas o documentos escaneados sin enviar datos a servicios externos.
- **Prototipado de asistentes conversacionales autoalojados**: con Q4_K_S (15,9 GB) o IQ4_XS (15,5 GB) cabe en una RTX 4090 o en un Mac con memoria unificada de 32 GB, permitiendo iterar sobre prompts y plantillas de chat sin coste por token.
- **Evaluación de cuantizaciones GGUF**: el repositorio ofrece once variantes de cuantización del mismo modelo, lo que lo convierte en un banco de pruebas útil para medir la degradación de perplejidad entre Q2_K y Q8_0 sobre una carga de trabajo concreta.
- **Generación de datos sintéticos para ajuste fino**: al no rechazar temáticas sensibles, puede emplearse para producir corpus de entrenamiento en dominios donde otros modelos se niegan, siempre que se revise legal y éticamente el resultado.
- **Despliegue en entornos air-gapped**: al ser un GGUF ejecutable con llama.cpp u Ollama, funciona sin conexión en infraestructura aislada, algo relevante para organizaciones con requisitos estrictos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (pesos + overhead de contexto, aproximada a partir del tamaño de cada fichero GGUF):
  - Q2_K: ~11,0 GB de pesos; ~12-13 GB en total con contexto moderado.
  - Q3_K_M: ~13,6 GB; ~15 GB en total.
  - IQ4_XS: ~15,5 GB; ~17 GB en total.
  - Q4_K_M: ~16,9 GB; ~18-19 GB en total.
  - Q5_K_M: ~19,6 GB; ~21 GB en total.
  - Q6_K: ~22,5 GB; ~24 GB en total.
  - Q8_0: ~29,1 GB; ~31 GB en total.
- **GPU recomendadas**: para Q4_K_M y superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite cargar el modelo completo en VRAM con contexto ajustado. Para Q8_0 se requiere una A100 40 GB, L40S 48 GB o H100. Las cuantizaciones Q2_K y Q3_K_S pueden caber en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto reducido.
- **Cabe en GPU de consumo**: sí, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto limitado.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` lo indica). vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos originales en safetensors.
- **Latencia y throughput**: no disponibles. Como referencia orientativa no verificada, un modelo denso de 27B en Q4_K_M sobre una RTX 4090 suele situarse en el rango de 20-35 tokens/s en generación, pero este dato no procede de la documentación del modelo y debe medirse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3.8-27b-aragon-uncensored-GGUF (este) | ~27,3B | no disponible | no disponible | GGUF (11 variantes) | Derivado abliterated de la familia Qwen; incluye mmproj para visión |
| Modelo base Qwen de ~27B (referencia genérica) | ~27B | no disponible | no disponible | safetensors | Modelo alineado original; no se dispone de datos verificados en esta consulta |
| Otras distribuciones GGUF de mradermacher para modelos ~27B | ~27B | variable | según modelo base | GGUF | Mismo publicador, misma metodología de cuantización estática |
| Versión imatrix del mismo modelo (`qwen3.8-27b-aragon-uncensored-i1-GGUF`) | ~27,3B | no disponible | no disponible | GGUF (imatrix) | Cuantizaciones ponderadas de mayor calidad a igual tamaño, publicadas en paralelo |

No se dispone de datos verificados de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- **Licencia no declarada**: los metadatos indican "no disponible". Sin una licencia explícita, el uso comercial es jurídicamente incierto y no puede asumirse permiso de redistribución.
- **Sesgos y contenido dañino**: la abliteration elimina los mecanismos de rechazo, lo que aumenta la probabilidad de generar contenido ofensivo, ilegal o peligroso sin advertencia. No debe desplegarse en aplicaciones orientadas al público sin una capa de moderación externa.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad factual. La modificación de las activaciones puede degradar la coherencia en tareas de razonamiento, un efecto documentado en modelos ablacionados.
- **Idioma**: solo se declara inglés. El nombre "aragon" del modelo base no implica soporte de español o aragonés; no hay evidencia de competencia multilingüe.
- **Contexto desconocido**: al no documentarse la longitud de contexto nativa, no puede planificarse su uso en tareas de contexto largo sin pruebas empíricas.
- **Procedencia opaca**: el modelo base (`jdqqjr/qwen3.8-27b-aragon-uncensored`) no cuenta con documentación técnica publicada en la información disponible, lo que impide verificar qué modelo Qwen exacto se modificó, con qué datos y mediante qué procedimiento.
- **Cuantizaciones de baja precisión**: Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- **Visión no verificada**: la presencia de `mmproj` sugiere capacidades multimodales, pero no hay documentación sobre resolución, tipos de imagen soportados ni calidad del reconocimiento.
- **Fecha de creación anómala**: los metadatos indican 2026-08-29, lo que puede reflejar un error de registro o una fecha futura respecto a la consulta; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3.8-27b-aragon-uncensored-GGUF
- Modelo base: https://huggingface.co/jdqqjr/qwen3.8-27b-aragon-uncensored
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/qwen3.8-27b-aragon-uncensored-i1-GGUF
- Página de overview de descargas del publicador: https://hf.tst.eu/model#qwen3.8-27b-aragon-uncensored-GGUF
- Guía de uso de GGUF (README de TheBloke referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del publicador: https://www.nethype.de/
