# dbgworld/AutoDecompiler-6.7B-pscode-Q4_K_M-GGUF

## Resumen

AutoDecompiler-6.7B-pscode es un modelo de lenguaje de 6.740.512.768 parámetros (aproximadamente 6,7 mil millones) publicado por el usuario dbgworld en Hugging Face. En concreto, esta ficha describe la versión cuantizada en formato GGUF con cuantización Q4_K_M del modelo original `AutoDecompiler/AutoDecompiler-6.7B-pscode`, convertida mediante la herramienta GGUF-my-repo de ggml.ai sobre llama.cpp. El nombre del modelo sugiere una especialización en tareas de descompilación de código (`pscode` apunta a pseudo-código), aunque la model card no documenta explícitamente el proceso de entrenamiento ni el dataset utilizado.

La relevancia de esta publicación es fundamentalmente práctica: se trata de un artefacto de despliegue que permite ejecutar el modelo base en hardware de consumo mediante llama.cpp, sin necesidad de infraestructura de GPU de datacenter. El repositorio ocupa 4,1 GB, coherente con una cuantización de 4 bits sobre un modelo de 6,7B parámetros, y es compatible con endpoints de inferencia. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

El interés principal para desarrolladores e investigadores radica en la posibilidad de evaluar un modelo especializado en ingeniería inversa de binarios en entornos locales, aunque la ausencia de documentación sobre el modelo original obliga a tratar cualquier uso en producción con cautela y a validar empíricamente sus capacidades antes de integrarlo en flujos de trabajo reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre y el tamaño sugieren una familia tipo LLaMA, sin confirmación documental) |
| Parametros totales | 6.740.512.768 |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero no se declara como contexto máximo) |
| Tipos de cuantizacion | Q4_K_M (esta publicación); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `autodecompiler-6.7b-pscode-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `AutoDecompiler/AutoDecompiler-6.7B-pscode`. El recuento de parámetros (6.740.512.768) es consistente con la familia de modelos de 6,7B ampliamente utilizada en la comunidad (derivada de LLaMA-2 7B o arquitecturas equivalentes), pero la model card de esta publicación no confirma la arquitectura, el tokenizador ni la dimensionalidad de las capas. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

Lo único verificable es el proceso de conversión: el modelo se transformó a GGUF mediante el espacio GGUF-my-repo de ggml.ai, que aplica la herramienta de conversión de llama.cpp y genera una cuantización Q4_K_M. Esta cuantización emplea bloques de cuantización de 4 bits con escalas de 6 bits para los pesos más sensibles, lo que habitualmente produce una degradación mínima respecto al modelo en precisión completa en tareas de generación de texto, aunque el impacto en tareas de código y razonamiento estructurado debe medirse empíricamente. No se han documentado innovaciones técnicas adicionales (atención lineal, decodificación especulativa, modos de razonamiento) en la información disponible.

## Capacidades

- Generación de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y compatible con endpoints de inferencia.
- Especialización putativa en descompilación y análisis de código: el identificador `pscode` y el nombre `AutoDecompiler` apuntan a tareas de traducción de binarios a pseudo-código o código de alto nivel, aunque esta capacidad no está documentada formalmente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Análisis local de binarios: el modelo puede desplegarse con llama.cpp en una estación de trabajo para asistir en la interpretación de pseudo-código generado por descompiladores como Ghidra o IDA Pro, aprovechando el formato GGUF para mantener el análisis dentro de la red local sin enviar muestras a servicios externos.
- Ingeniería inversa en entornos aislados: al ejecutarse en CPU o GPU de consumo mediante llama.cpp, encaja en máquinas air-gapped donde no es posible usar APIs en la nube, un requisito habitual en análisis de malware y peritaje forense.
- Asistencia a la revisión de código ofuscado: el modelo puede emplearse para reformular fragmentos de pseudo-código en explicaciones legibles, como paso previo a la revisión manual por parte de un analista.
- Prototipado de pipelines de descompilación asistida: investigadores pueden integrar el modelo en scripts que procesen la salida de descompiladores y generen anotaciones o resúmenes de funciones, evaluando la calidad de las sugerencias antes de automatizar el flujo.
- Experimentación académica con modelos cuantizados: sirve como caso de estudio para medir la degradación de un modelo de 6,7B al pasar a Q4_K_M en tareas de código, comparando la salida con el modelo base en precisión completa.
- Despliegue en hardware modesto para docencia: con 4,1 GB de pesos, el modelo puede ejecutarse en portátiles con 8 GB de RAM o GPUs de gama media, lo que facilita su uso en talleres y cursos de seguridad informática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 4,1 GB solo para los pesos en Q4_K_M; con overhead de contexto y caché KV, se recomienda un mínimo de 6-8 GB de memoria unificada o VRAM para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.); en GPUs de datacenter (A100, H100) funcionaría sin problema, pero está sobredimensionada para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; también puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, del backend (CPU vs. CUDA vs. Metal) y de la longitud de contexto configurada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dbgworld/AutoDecompiler-6.7B-pscode-Q4_K_M-GGUF | 6,74B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face (0 descargas) |
| AutoDecompiler/AutoDecompiler-6.7B-pscode (base) | 6,74B | no disponible | safetensors (presumiblemente) | no disponible | Hugging Face |
| CodeLlama-7B (referencia de código) | 6,74B | 16k (versión base) | safetensors, GGUF | Llama 2 Community License | Hugging Face, ampliamente adoptado |
| DeepSeek-Coder-6.7B (referencia de código) | 6,74B | 16k | safetensors, GGUF | DeepSeek License | Hugging Face |

La comparación con CodeLlama y DeepSeek-Coder se ofrece únicamente como referencia de categoría (modelos de ~6,7B orientados a código), ya que no se dispone de datos de rendimiento del modelo AutoDecompiler que permitan una comparación cuantitativa. La licencia y el contexto del modelo AutoDecompiler no están documentados.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el modelo base: no se conocen dataset, proceso de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad legal y técnica para producción.
- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; debe contactarse con el autor o consultarse el repositorio del modelo base antes de cualquier despliegue comercial.
- Riesgo de alucinación inherente a los modelos de 6,7B cuantizados a 4 bits, especialmente en tareas de código donde una salida incorrecta puede inducir a errores de análisis.
- La cuantización Q4_K_M introduce degradación respecto al modelo en precisión completa; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Sin datos de benchmarks ni evaluaciones de sesgo: no es posible caracterizar sesgos conocidos ni comparar su rendimiento con alternativas establecidas.
- El repositorio no registra descargas ni interacciones, lo que sugiere ausencia de validación por parte de la comunidad.
- El ejemplo de la model card usa `-c 2048` como contexto, pero no se declara el máximo soportado; configurar contextos mayores sin validación puede producir degradación o errores.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face (esta publicación): https://huggingface.co/dbgworld/AutoDecompiler-6.7B-pscode-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/AutoDecompiler/AutoDecompiler-6.7B-pscode
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
