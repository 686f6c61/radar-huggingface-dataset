# mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF

## Resumen

Qwen3.6-Candid-Coder-V1.1-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.505.251.456 parámetros totales, según los pesos en safetensors del repositorio base. El modelo original lo desarrolla DarkKitsune y esta ficha documenta la versión cuantizada en GGUF publicada por mradermacher, un conocido generador de cuantizaciones para llama.cpp. El modelo se presenta con etiquetas de "abliterated" y "uncensored", lo que indica que ha sido modificado para eliminar o reducir los mecanismos de rechazo alineados, además de estar orientado a tareas de programación, razonamiento y uso de herramientas (tool-use).

La relevancia de esta publicación radica en que ofrece la posibilidad de ejecutar un modelo MoE de 35B en hardware de consumo mediante cuantizaciones que van desde los 13,3 GB (i1-Q2_K) hasta los 29,3 GB (i1-Q6_K). Al tratarse de una arquitectura MoE con aproximadamente 3B de parámetros activos (según la nomenclatura A3B), el coste computacional por token es mucho menor que el de un modelo denso de 35B, lo que lo hace atractivo para despliegues locales con presupuestos de VRAM moderados.

El repositorio incluye cuantizaciones ponderadas con imatrix, lo que suele mejorar la calidad respecto a las cuantizaciones estáticas a igual tamaño. El autor indica que también existen cuantizaciones estáticas en un repositorio separado y menciona que se trata de un modelo de visión, con ficheros mmproj (si los hay) alojados en el repositorio estático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, según nomenclatura A3B del nombre |
| Parametros totales | 35.505.251.456 |
| Parametros activos | aproximadamente 3B (inferido de la nomenclatura A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también imatrix y cuantizaciones estáticas en repositorio separado |
| Idiomas soportados | inglés (etiqueta `en` en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la nomenclatura del nombre del modelo, que sugiere una arquitectura Mixture of Experts con 35B parámetros totales y aproximadamente 3B activos por token. El modelo base es DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B, del que no se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

Las etiquetas de la model card indican que el modelo ha sido sometido a un proceso de "abliteration", una técnica que modifica los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento, dando lugar a un modelo "uncensored". También se etiqueta como "apex", "imatrix", "kat-coder", "ornith", "sage", "reasoning" y "tool-use", lo que sugiere un entrenamiento orientado a código, razonamiento y uso de herramientas, aunque no se aportan detalles técnicos sobre estos procesos. La model card del repositorio cuantizado no incluye información sobre innovaciones arquitectónicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: el modelo está etiquetado con "reasoning", lo que indica capacidad para tareas de razonamiento multi-paso.
- Generación de código: las etiquetas "coding", "code" y "kat-coder" apuntan a un entrenamiento específico para programación.
- Uso de herramientas (tool calling / function calling): la etiqueta "tool-use" indica soporte para invocación de funciones.
- Capacidades de agente: la etiqueta "agent" sugiere orientación a flujos de trabajo agénticos y razonamiento multi-paso.
- Capacidades de visión: la model card afirma explícitamente que "this is a vision model", aunque los ficheros mmproj, si existen, están en el repositorio estático.
- Modo sin censura: las etiquetas "abliterated" y "uncensored" indican que el modelo ha sido modificado para reducir los rechazos de contenido.
- Multilingüismo: la model card solo declara inglés (`en`); no se confirman otros idiomas.

## Casos de uso

- Asistencia a la programación en local: el modelo puede integrarse en editores o CLI para autocompletar y generar código, aprovechando su especialización en código y su reducido coste por token gracias a la arquitectura MoE con aproximadamente 3B parámetros activos.
- Pipelines de CI/CD con tool calling: gracias a la etiqueta "tool-use", puede invocarse para tareas de revisión automatizada, generación de parches o consulta de APIs dentro de flujos de integración continua.
- Agentes autónomos de resolución de tareas: la etiqueta "agent" sugiere su uso en bucles de razonamiento multi-paso con llamadas a herramientas, adecuado para automatizar tareas de investigación o manipulación de ficheros.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (21,8 GB) o i1-IQ3_M (15,9 GB) permiten ejecutar el modelo en GPUs de consumo con suficiente VRAM o en configuraciones híbridas CPU/GPU con llama.cpp.
- Generación de documentación técnica: puede redactar documentación a partir de código fuente, aprovechando su orientación a código y su capacidad de razonamiento.
- Experimentación en investigación sobre modelos sin censura: útil para estudiar el comportamiento de modelos abliterated en tareas de generación abierta, con las advertencias éticas y legales correspondientes.
- Procesamiento de imágenes con el modelo de visión: si se descargan los ficheros mmproj del repositorio estático, puede emplearse para tareas de descripción o análisis de imágenes en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K aproximadamente 13,3 GB; i1-IQ3_M aproximadamente 15,9 GB; i1-Q4_K_M aproximadamente 21,8 GB; i1-Q5_K_M aproximadamente 25,4 GB; i1-Q6_K aproximadamente 29,3 GB. Hay que añadir memoria para el contexto KV cache, cuyo tamaño depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: no se especifican en la información disponible. Por tamaño de las cuantizaciones, las de 13-16 GB podrían caber en GPUs de consumo de gama alta con 16 GB o más; las de 20-29 GB requieren GPUs profesionales o configuraciones multi-GPU.
- Cabe en GPU de consumo: las cuantizaciones i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M e i1-Q3_K_M (13-17 GB) son las candidatas para GPUs de consumo con 16 GB o más, siempre que el contexto se mantenga moderado. Las cuantizaciones de 20 GB o más requieren GPUs con 24 GB o configuraciones híbridas con CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extensión herramientas compatibles como Ollama o servidores basados en llama.cpp. No se confirma compatibilidad con vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-Candid-Coder-V1.1-35B-A3B (i1-GGUF) | 35,5B totales, ~3B activos | no disponible | no disponible | GGUF | Abliterated, orientado a código y tool-use |
| Qwen3.6-Candid-Coder-V1.1-35B-A3B (estático GGUF) | 35,5B totales, ~3B activos | no disponible | no disponible | GGUF | Misma base, cuantización estática sin imatrix |
| Modelo base DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B | 35,5B totales, ~3B activos | no disponible | no disponible | safetensors | Pesos originales sin cuantizar |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~35B orientados a código) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": la eliminación de los mecanismos de rechazo puede dar lugar a salidas inapropiadas, ofensivas o peligrosas; no es recomendable para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni benchmarks que permitan cuantificar este riesgo.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Contexto no disponible: se desconoce la longitud máxima de contexto, lo que limita la planificación de despliegues con ventanas largas.
- Cuantizaciones de baja calidad: las cuantizaciones i1-Q2_K e i1-Q3_K_S pueden degradar notablemente la calidad; el autor recomienda alternativas IQ de tamaño similar.
- Visión: los ficheros mmproj no están en este repositorio; para usar las capacidades de visión hay que descargarlos del repositorio estático.
- Fecha de creación futura: el repositorio figura creado el 2026-11-05, lo que puede indicar metadatos inconsistentes; conviene verificar la integridad de los ficheros antes de usarlos.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF
- Modelo base: https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
