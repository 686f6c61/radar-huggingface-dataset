# neutronai-code/Quark-1.5B-v0.3-GGUF

## Resumen

Quark-1.5B-v0.3 es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) publicado por el usuario neutronai-code en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que indica que está pensado para inferencia local mediante llama.cpp y herramientas compatibles. La model card indica que fue afinado y convertido a GGUF con Unsloth, y las etiquetas del repositorio lo asocian a la familia Qwen2, por lo que su arquitectura base es presumiblemente un transformer decoder-only de tipo Qwen2, aunque el autor no lo confirma explícitamente.

La información publicada es muy escasa: no se detalla el conjunto de datos de entrenamiento, el número de tokens utilizados, la longitud de contexto soportada, los idiomas cubiertos ni la licencia. El repositorio tiene un tamaño de 1,0 GB y contiene una única cuantización identificada, Q4_K_M. En el momento de redactar esta ficha el modelo no registra descargas ni interacciones, lo que sugiere una publicación muy reciente y sin validación comunitaria.

Por su tamaño y formato, Quark-1.5B-v0.3 encaja en el segmento de modelos pequeños para ejecución en CPU o GPU de consumo, con fines de experimentación, prototipado y despliegue en entornos con recursos limitados. Cualquier evaluación de calidad, seguridad o idoneidad para producción debe considerarse pendiente, dado que no hay benchmarks ni documentación técnica publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, presumiblemente Qwen2 (según tags del repositorio; no confirmado en la model card) |
| Parametros totales | 1.543.714.304 (dato de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); parámetros originales en safetensors según metadatos |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las etiquetas del repositorio incluyen `qwen2`, lo que apunta a que el modelo deriva de la familia Qwen2 de Alibaba, una arquitectura transformer decoder-only con atención multi-cabeza, RoPE y normalización RMSNorm, aunque esta afirmación no está confirmada por el autor. El nombre del repositorio indica una versión v0.3 y el sufijo "sft" en el archivo GGUF sugiere un ajuste supervisado (supervised fine-tuning), presumiblemente sobre una base preentrenada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El único dato técnico verificable es que el proceso de afinado y conversión se realizó con Unsloth, una herramienta que optimiza el fine-tuning de modelos pequeños y medianos y la exportación a GGUF. La ausencia de documentación impide evaluar la calidad o la procedencia de los datos de ajuste.

## Capacidades

- Generación de texto en formato conversacional, presumiblemente con plantilla de chat Qwen2 (el uso recomendado incluye `--jinja`, lo que sugiere soporte de plantillas Jinja en llama.cpp).
- Razonamiento general y respuesta a instrucciones, derivado del ajuste supervisado indicado en el nombre del archivo.
- Soporte de tool calling: no confirmado; la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. La model card incluye una referencia genérica a `llama-mtmd-cli` para modelos multimodales, pero no hay evidencia de que este modelo lo sea.

## Casos de uso

- Prototipado local de asistentes conversacionales: con 1,5 mil millones de parámetros y cuantización Q4_K_M, el modelo puede ejecutarse en un portátil con llama.cpp u Ollama para validar plantillas de prompt y flujos de conversación antes de escalar a modelos mayores.
- Generación de texto en entornos sin GPU: al caber en CPU con el archivo Q4_K_M de aproximadamente 1 GB, es adecuado para tareas de resumen o redacción en dispositivos con recursos limitados.
- Filtrado y clasificación de texto en pipelines de datos: su tamaño permite procesar lotes de documentos en local para tareas de etiquetado o enrutamiento, siempre que se valide su calidad previamente.
- Educación y experimentación con fine-tuning: al estar publicado en GGUF y haberse generado con Unsloth, sirve como ejemplo de flujo de ajuste y exportación para quienes aprenden a desplegar modelos pequeños.
- Pruebas de integración con llama.cpp y servidores compatibles con la API de endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante interfaces compatibles con OpenAI, útil para pruebas de infraestructura.
- Generación de borradores en aplicaciones de escritorio o móviles: su reducido peso permite empaquetarlo en aplicaciones offline de asistencia de escritura, con la advertencia de que la calidad no está validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con cuantización Q4_K_M (el archivo publicado ocupa alrededor de 1 GB; el contexto adicional consume memoria extra).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores; también funciona en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales y en muchas integradas.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, servidores compatibles con la API de OpenAI (tag `endpoints_compatible`), y potencialmente vLLM o TGI si se convierte a safetensors (no publicado).
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del contexto. En CPU moderna se espera un rendimiento de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Quark-1.5B-v0.3 | 1,54 B | no disponible | no disponible | GGUF (Q4_K_M) | Hugging Face, sin descargas |
| Qwen2-1.5B-Instruct | 1,54 B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 (según documentación de Qwen) | safetensors, GGUF | Amplia, con benchmarks publicados |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (según documentación de Hugging Face) | Apache 2.0 (según documentación de Hugging Face) | safetensors, GGUF | Amplia, con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (según documentación de Meta) | Llama 3.2 Community License | safetensors, GGUF | Amplia, con benchmarks publicados |

La comparación con Qwen2-1.5B-Instruct es la más directa por tamaño y posible base arquitectónica. Quark no publica benchmarks, contexto ni licencia, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento, código o matemáticas.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: inherente a los modelos de 1,5 B parámetros, especialmente en dominios especializados; no hay evaluaciones de fidelidad.
- Sesgos: no evaluados; el dataset de ajuste es desconocido, por lo que no se pueden descartar sesgos de género, raza o ideología.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación de la comunidad.
- Model card mínima: no documenta datos de entrenamiento, hiperparámetros ni procedencia de la base, lo que dificulta la reproducibilidad.
- Etiqueta `endpoints_compatible`: no se detalla qué endpoints ni qué grado de compatibilidad ofrece.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/neutronai-code/Quark-1.5B-v0.3-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- Documentación de Qwen2 (posible arquitectura base): https://huggingface.co/docs/transformers/model_doc/qwen2
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
