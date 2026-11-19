# mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF

## Resumen

Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF es una cuantización GGUF, generada con imatrix, del modelo AkaumiKaede/Qwen3.5-2B-Uncensored-Zero-Refusal-SOMA, una variante "abliterated" (sin rechazo) del Qwen3.5-2B. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, y el modelo resultante está pensado para ejecución local en llama.cpp y derivados. El modelo base parte de la familia Qwen3.5 de 2B parámetros y ha sido modificado para eliminar los mecanismos de rechazo, orientándolo a escritura creativa, roleplay y conversación sin restricciones.

La relevancia de esta ficha reside en que combina varias características poco habituales en un modelo de 2B: es multimodal (etiquetas `vision`, `image`), soporta inglés y chino, y se distribuye bajo licencia Apache 2.0. El repositorio incluye un amplio abanico de cuantizaciones (desde IQ1_S de 0,8 GB hasta Q6_K), lo que permite desplegarlo en hardware muy modesto. El número de parámetros reales según safetensors es de 1.881.825.088 (aproximadamente 1,88B).

El modelo está etiquetado como "zero-refusal" y "abliterated", lo que implica que se ha intervenido sobre las capas de rechazo del modelo original. Esto lo hace inadecuado para aplicaciones donde se requiera moderación automática de contenido, y obliga a implementar salvaguardas externas si se usa en producción. La información disponible sobre arquitectura interna, contexto y datos de entrenamiento es limitada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal texto-imagen; detalles internos no disponibles |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1 con imatrix) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con aproximadamente 1,88B parámetros, según los datos de safetensors del repositorio. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas indican que el modelo ha pasado por un proceso de "abliteration" (eliminación de la dirección de rechazo en el espacio de activaciones) y que se comercializa como "zero-refusal" y "decensored".

La variante aquí descrita es una cuantización GGUF generada por mradermacher con el método i1 (imatrix), que utiliza una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas. Existe también una versión estática de cuantizaciones en el repositorio mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-GGUF. Al ser un modelo multimodal, los ficheros mmproj (proyector multimodal) se encuentran en el repositorio estático, no en el de cuantizaciones i1.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Capacidades multimodales de imagen (etiquetas `vision`, `image`); el proyector multimodal está en el repositorio estático.
- Escritura creativa y roleplay sin restricciones de rechazo (zero-refusal, abliterated).
- Conversación multi-turno y chat.
- Soporte de agentes (etiqueta `agent`).
- Contenido para adultos (etiquetas `r18`, `ERP`).
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades específicas de tool calling, matemáticas o razonamiento extendido en la información disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está entrenado y modificado para evitar rechazos, lo que permite mantener personajes y tramas sin interrupciones por filtros de contenido; adecuado para plataformas de ficción interactiva con moderación externa.
- Escritura creativa sin restricciones: generación de relatos, guiones o diálogos donde el modelo original rechazaría ciertos temas; útil para autores que necesitan explorar temáticas adultas.
- Asistente conversacional local en inglés o chino: al ser un modelo de ~1,88B en GGUF, puede ejecutarse en portátiles y equipos sin GPU dedicada, ofreciendo privacidad total al no requerir conexión.
- Análisis de imágenes en local: gracias a su naturaleza multimodal y al proyector mmproj disponible en el repositorio estático, puede describir o interpretar imágenes en entornos sin conexión.
- Prototipado de agentes conversacionales: la etiqueta `agent` sugiere capacidad para flujos multi-paso; útil para pruebas de concepto de asistentes autónomos en hardware modesto.
- Experimentación con técnicas de abliteration: investigadores pueden comparar el comportamiento del modelo original frente a la variante sin rechazo para estudiar sesgos y mecanismos de seguridad.
- Despliegue en dispositivos de borde: las cuantizaciones IQ1/IQ2 (0,8-1,0 GB) permiten ejecución en Raspberry Pi o móviles con llama.cpp, para demos de chat o roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde ~0,8 GB (IQ1_S) hasta ~2,5-3 GB (Q6_K, estimado a partir del tamaño del repo de 25,8 GB que incluye todas las variantes); el fichero Q4_K_M ocupa 1,4 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060); también funciona en CPU.
- Cabe en GPU consumer: sí, en todas las cuantizaciones; las más pequeñas (IQ1, IQ2) caben incluso en iGPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), LM Studio, text-generation-webui; para el modo multimodal se requiere el fichero mmproj del repositorio estático.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de ~1,88B, se espera throughput alto en CPU moderna y muy alto en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-Abliterix-SOM-i1 (este) | ~1,88B | no disponible | Sí | Apache 2.0 | Variante abliterated, cuantizada con imatrix |
| Qwen3.5-2B (original) | ~2B | no disponible | Según variante | Apache 2.0 | Modelo base con alineación estándar |
| AkaumiKaede/Qwen3.5-2B-Uncensored-Zero-Refusal-SOMA | ~1,88B | no disponible | Sí | Apache 2.0 | Modelo base sin cuantizar del que deriva este |
| mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-GGUF | ~1,88B | no disponible | Sí | Apache 2.0 | Cuantizaciones estáticas (no imatrix) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido "abliterated" y se presenta como zero-refusal: no aplica moderación automática y puede generar contenido ofensivo, sexual explícito o potencialmente dañino. Requiere salvaguardas externas en cualquier despliegue público.
- Riesgo elevado de alucinación por su tamaño reducido (~1,88B) y por el proceso de modificación, que puede degradar capacidades de razonamiento y factualidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- La longitud de contexto no está especificada en la información disponible; no se debe asumir un contexto largo.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin filtros de rechazo puede implicar riesgos legales y reputacionales según la jurisdicción y el contenido generado.
- La información sobre datos de entrenamiento y evaluación es muy escasa; no hay benchmarks que respalden la calidad del modelo.
- Para el modo visión es necesario descargar el fichero mmproj del repositorio estático, no incluido en este repositorio i1.
- El modelo tiene muy pocos likes (1) y procede de un autor no verificado; conviene validar su comportamiento antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-GGUF
- Modelo base: https://huggingface.co/AkaumiKaede/Qwen3.5-2B-Uncensored-Zero-Refusal-SOMA
- Página de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF
- Licencia Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
