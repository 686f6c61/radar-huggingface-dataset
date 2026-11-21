# mradermacher/Daedalus-1-2B-GGUF

## Resumen

Daedalus-1-2B es un modelo de lenguaje de 1.777.088.000 parámetros (aproximadamente 1,78 mil millones) desarrollado originalmente por Loom-Labs y distribuido en formato GGUF por el usuario mradermacher. Se trata de una cuantización estática del modelo base `Loom-Labs/Daedalus-1-2B`, construida sobre la arquitectura Qwen2 según las etiquetas del repositorio. El modelo está orientado a generación de texto conversacional y está etiquetado como compatible con text-generation-inference.

La relevancia de esta ficha reside en que el repositorio de mradermacher no es un modelo nuevo, sino un conjunto de pesos cuantizados listos para su uso con llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.). Esto permite ejecutar un modelo de casi 1,8 mil millones de parámetros en hardware de consumo, algo imposible con los pesos originales en precisión completa. La licencia MIT facilita su integración en productos comerciales sin restricciones adicionales.

No obstante, la información pública disponible es muy limitada: la model card del repositorio de cuantización no incluye detalles sobre datos de entrenamiento, longitud de contexto, benchmarks ni composición del dataset original. Esta ficha refleja únicamente lo que puede verificarse a partir de los metadatos y la model card proporcionados, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2, según etiquetas del repo) |
| Parámetros totales | 1.777.088.000 (≈1,78 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); variantes imatrix en repo separado |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base se etiqueta como `qwen2`, lo que indica que emplea la arquitectura transformer decoder-only de la familia Qwen2, con atención causal estándar. El repositorio de cuantización no aporta información sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre la estrategia de tokenización más allá de la herencia del modelo base.

Respecto al entrenamiento, no se dispone de datos publicados en la información proporcionada: se desconoce el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de alineación como RLHF o DPO, o si hubo una fase de instrucción específica. La etiqueta `unsloth` sugiere que el modelo base pudo haberse afinado o entrenado con herramientas de Unsloth, pero esto es una inferencia a partir de metadatos, no un dato confirmado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational`.
- Compatible con pipelines de text-generation-inference y transformers.
- Ejecutable mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp, etc.).
- Soporte de cuantizaciones desde 2 bits hasta 16 bits, lo que permite ajustar el equilibrio calidad/tamaño.
- Capacidades de razonamiento, código, matemáticas o tool calling: no disponibles en la información proporcionada.
- Soporte multilingüe: limitado al inglés según los metadatos.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales ligeros en local: con cuantización Q4_K_M (1,2 GB), el modelo puede desplegarse en portátiles sin GPU dedicada para chatbots de propósito general en inglés, con latencia baja gracias al reducido tamaño.
- Prototipado rápido de aplicaciones de chat: al estar en formato GGUF y licencia MIT, permite iterar sobre prompts y flujos conversacionales sin coste de API ni restricciones de uso comercial.
- Filtrado y clasificación de texto en inglés: tareas de etiquetado, resumen corto o reescritura donde un modelo de 2B es suficiente y el despliegue en CPU es un requisito.
- Educación y experimentación: útil para estudiar el comportamiento de modelos pequeños cuantizados, comparar curvas de perplejidad entre tipos de cuantización (Q2_K frente a Q8_0) o validar pipelines de inferencia.
- Despliegue en entornos con recursos muy limitados: la variante Q2_K (0,9 GB) permite ejecución en dispositivos con poca RAM, aunque con degradación de calidad notable.
- Generación de texto de relleno o borradores: para tareas de autocompletado o generación de contenido no crítico donde prima el coste y la velocidad sobre la precisión factual.
- Integración en aplicaciones de escritorio: mediante bindings de llama.cpp, el modelo puede embeberse en herramientas nativas sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,9 GB (Q2_K) y 2,0 GB (Q8_0); la versión f16 requiere unos 3,7 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060). En GPUs de gama alta (RTX 4090, A100, H100) el modelo estará limitado por latencia de kernel más que por memoria.
- Cabe holgadamente en GPU de consumo: sí, en todas las GPU consumer modernas, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-inference (para el modelo base), transformers con el modelo original.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (1,78 B) se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Daedalus-1-2B (GGUF) | 1,78 B | no disponible | MIT | GGUF | Hugging Face |
| Qwen2-1.5B | 1,54 B | 32.768 tokens (versión base Qwen2) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Gemma-2-2B | 2,6 B | 8.192 tokens | Gemma Terms | safetensors, GGUF | Hugging Face |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparación con Qwen2-1.5B es la más directa por arquitectura declarada, pero conviene señalar que Daedalus-1-2B no publica datos de contexto ni benchmarks que permitan una comparación rigurosa de rendimiento. Las cifras de los modelos alternativos provienen de sus respectivas model cards públicas.

## Limitaciones y advertencias

- Información muy escasa: la model card del repositorio de cuantización no documenta el entrenamiento, el contexto ni los benchmarks del modelo base, lo que dificulta evaluar su calidad real.
- Idioma: solo inglés según los metadatos; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinación: inherente a modelos de este tamaño; no hay evaluaciones publicadas de factualidad.
- Sesgos: desconocidos, al no publicarse información sobre el dataset de entrenamiento ni sobre procesos de alineación.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Contexto: al no especificarse, no debe asumirse una ventana larga; conviene validar empíricamente el comportamiento en conversaciones multi-turno.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el usuario debe verificar que el modelo base original mantiene la misma licencia y que no existen obligaciones de atribución adicionales no documentadas.
- Madurez: el repositorio tiene muy pocas descargas (64) y likes (1), lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Daedalus-1-2B-GGUF
- Modelo base: https://huggingface.co/Loom-Labs/Daedalus-1-2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Daedalus-1-2B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Daedalus-1-2B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
