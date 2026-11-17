# mradermacher/DM2-BASE2-GGUF

## Resumen

DM2-BASE2-GGUF es la versión cuantizada en formato GGUF del modelo TareksGraveyard/DM2-BASE2, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de llama.cpp y Ollama. El modelo original es un merge (fusión) de otros modelos, generado con la herramienta mergekit, y cuenta con aproximadamente 70.500 millones de parámetros en formato safetensors. Esta versión GGUF permite ejecutar el modelo en hardware de consumo y en entornos de inferencia basados en CPU/GPU mixtas, algo inviable con los pesos originales en precisión completa.

El modelo está etiquetado como conversacional y orientado al idioma inglés, aunque la información disponible sobre su entrenamiento, composición del dataset y capacidades específicas es muy limitada. Al tratarse de un merge sin model card detallada del autor original, no se han publicado datos sobre benchmarks, contexto máximo ni proceso de alineación. La relevancia de esta ficha radica en documentar de forma rigurosa lo que se sabe y señalar explícitamente lo que no, para que desarrolladores e investigadores puedan evaluar si merece la pena invertir tiempo en probarlo.

La licencia no está especificada en la información disponible, lo que constituye un riesgo importante para uso comercial. El repositorio ocupa 481,3 GB e incluye múltiples cuantizaciones estáticas (desde Q2_K hasta Q8_0), sin cuantizaciones ponderadas ni imatrix en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, generado con mergekit) |
| Parametros totales | 70.553.706.560 (~70,5 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repositorio | 481,3 GB |
| Modelo base | TareksGraveyard/DM2-BASE2 |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer, pero al tratarse de un merge generado con mergekit no existe un entrenamiento propio: el modelo resulta de la fusión de los pesos de varios modelos base según alguna estrategia de merge (no especificada en la información disponible). No se conocen el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

La cuantización la realiza mradermacher de forma estática (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin cuantizaciones ponderadas ni imatrix en el momento de la publicación. El autor indica que, si no aparecen en una semana, probablemente no las tenga planificadas salvo petición explícita en la discusión comunitaria.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Razonamiento general y respuesta a instrucciones: no confirmado por benchmarks ni model card detallada.
- Generación de código y matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con merges de modelos: investigadores que quieran evaluar la calidad de un merge de ~70B en formato GGUF pueden desplegarlo con llama.cpp u Ollama y comparar su comportamiento frente a los modelos originales que lo componen, sin necesidad de infraestructura de GPU de gama alta.
- Inferencia en hardware de consumo con cuantización agresiva: la variante Q2_K (26,5 GB) permite probar el modelo en equipos con 32 GB de RAM/VRAM, útil para prototipado rápido y validación de ideas antes de escalar a infraestructura mayor.
- Despliegue en servidores con CPU y GPU mixtas: las cuantizaciones Q4_K_S (40,4 GB) y Q4_K_M (42,6 GB), marcadas como "fast, recommended" por el autor, son adecuadas para entornos donde se reparte la carga entre CPU y GPU mediante llama.cpp.
- Evaluación comparativa de calidad de cuantizaciones: el repositorio ofrece un rango completo de cuantizaciones (de Q2_K a Q8_0), lo que permite medir la degradación de perplejidad y calidad conversacional según el nivel de compresión, un caso de uso típico en investigación de eficiencia de inferencia.
- Chat conversacional en inglés en entornos controlados: al estar etiquetado como conversacional, puede usarse para asistentes de texto en inglés en prototipos internos, siempre que se valide previamente la calidad y se asuma el riesgo de licencia no especificada.
- Base para fine-tuning posterior: al disponer del modelo base en safetensors y de las cuantizaciones GGUF, un equipo puede partir del merge para ajuste fino con LoRA en inglés y comparar si el merge aporta ventajas frente a los modelos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~26,5 GB; Q3_K_S ~31,0 GB; Q3_K_M ~34,4 GB; Q3_K_L ~37,2 GB; IQ4_XS ~38,4 GB; Q4_K_S ~40,4 GB; Q4_K_M ~42,6 GB; Q5_K_S ~48,8 GB; Q5_K_M ~50,0 GB; Q6_K ~58,0 GB (dos partes); Q8_0 ~75,1 GB (dos partes).
- GPU recomendadas: para cuantizaciones Q4 y superiores se recomienda al menos una GPU con 48 GB (A6000, A100 40/80 GB, H100) o reparto entre varias GPU; las cuantizaciones Q2_K y Q3_K_S pueden caber en configuraciones de 32-40 GB combinando VRAM y RAM.
- ¿Cabe en GPU de consumo? Las cuantizaciones más pequeñas (Q2_K, Q3_K_S) pueden ejecutarse en una RTX 4090 (24 GB) solo con offloading parcial a RAM del sistema; no caben íntegramente en VRAM de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de hardware suficiente (varias GPU de 80 GB).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DM2-BASE2-GGUF (este) | ~70,5B | no disponible | no disponible | GGUF | Merge con cuantizaciones estáticas de mradermacher |
| Llama 3.1 70B Instruct | 70B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo oficial con benchmarks publicados y tool calling |
| Qwen2.5 72B Instruct | 72B | 128K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Multilingüe, benchmarks publicados |
| Mistral Large 2 | 123B | 128K | Mistral Research License (no comercial sin acuerdo) | API, pesos bajo petición | Mayor tamaño, no directamente comparable en despliegue local |

La comparación es aproximada: no hay datos de benchmarks del modelo DM2-BASE2 que permitan una comparación cuantitativa con Llama 3.1 70B o Qwen2.5 72B. La principal diferencia es la ausencia de licencia y documentación claras en el caso de DM2-BASE2-GGUF.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido; es un riesgo legal relevante para producción.
- Modelo merge sin model card detallada: se desconoce la composición exacta, los datos de entrenamiento y el proceso de alineación, lo que dificulta evaluar sesgos y fiabilidad.
- Riesgo de alucinación: al no haber datos de evaluación ni de alineación, no se puede estimar la tasa de alucinación; se recomienda validación humana en cualquier uso sensible.
- Idioma limitado al inglés: no se debe esperar buen rendimiento en castellano u otros idiomas.
- Contexto máximo desconocido: no se puede planificar su uso en tareas de contexto largo sin probarlo empíricamente.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción conviene usar Q4_K_M o superior.
- Sin cuantizaciones imatrix/ponderadas: puede haber una pérdida de calidad mayor que en cuantizaciones ponderadas equivalentes.
- Repositorio muy grande (481,3 GB): requiere planificación de almacenamiento y ancho de banda para descargar varias cuantizaciones.
- Procedencia del merge: al ser un merge de modelos de origen desconocido, pueden heredarse restricciones de licencia de los modelos originales no documentadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DM2-BASE2-GGUF
- Modelo base: https://huggingface.co/TareksGraveyard/DM2-BASE2
- Página de descargas del autor: https://hf.tst.eu/model#DM2-BASE2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
