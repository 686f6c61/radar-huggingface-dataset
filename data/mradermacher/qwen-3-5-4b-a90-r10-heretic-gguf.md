# mradermacher/Qwen-3.5-4B-A90-R10-Heretic-GGUF

## Resumen

El modelo Qwen-3.5-4B-A90-R10-Heretic-GGUF es una cuantización GGUF del modelo base Qwen-3.5-4B-A90-R10-Heretic, desarrollado por FenrirLupus y convertido por mradermacher. Se trata de un modelo de lenguaje con 4.205.751.296 parámetros, perteneciente a la familia Qwen 3.5 según su nomenclatura. El repositorio ofrece múltiples cuantizaciones (Q2_K, Q4_K_M, Q8_0, f16, entre otras) para adaptarse a diferentes recursos de hardware, así como archivos mmproj que sugieren capacidades multimodales.

La relevancia del modelo radica en su tamaño compacto y su disponibilidad en formato GGUF, lo que permite ejecutarlo en entornos locales con hardware de consumo. No se proporcionan datos sobre la arquitectura interna, la longitud de contexto ni el proceso de entrenamiento en la documentación disponible, por lo que su evaluación debe basarse en pruebas empíricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (el repositorio indica library_name: transformers) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni el proceso de entrenamiento en la documentación proporcionada. El modelo es una cuantización GGUF del modelo base FenrirLupus/Qwen-3.5-4B-A90-R10-Heretic, creada por mradermacher. El repositorio incluye archivos mmproj, que suelen emplearse para proyectos multimodales en llama.cpp, lo que sugiere que el modelo base podría incluir un componente de visión, aunque no se confirma en la documentación.

## Capacidades

- Generación de texto en inglés (según metadata language: en).
- Posible soporte multimodal (visión) debido a la inclusión de archivos mmproj en el repositorio GGUF.
- No se documentan capacidades específicas de tool calling, agentes, razonamiento o matemáticas en la información disponible.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp en un portátil con GPU integrada o una GPU de consumo, ofreciendo respuestas en tiempo real sin conexión.
- Generación de texto en inglés para herramientas de escritorio: integración en editores de texto o clientes de correo para redactar borradores, resumir o parafrasear contenido.
- Prototipado de aplicaciones de IA en entornos con privacidad estricta: al ejecutarse localmente, los datos no salen del equipo, lo que resulta adecuado para sectores regulados.
- Experimentación con cuantización GGUF: los desarrolladores pueden comparar el rendimiento entre distintas cuantizaciones (Q2_K, Q4_K_M, Q8_0) para ajustar el equilibrio entre calidad y consumo de memoria.
- Automatización de tareas de clasificación o extracción de información en inglés: el modelo puede usarse en pipelines de procesamiento de texto para etiquetar o filtrar documentos, siempre que no se requiera tool calling.
- Educación y aprendizaje: al ser un modelo pequeño y cuantizado, es adecuado para aprender a desplegar LLMs en local y entender el ecosistema GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: según cuantización. Q2_K: ~2.0 GB; Q4_K_S: ~2.7 GB; Q4_K_M: ~2.8 GB; Q8_0: ~4.6 GB; f16: ~8.5 GB. Añadir overhead de contexto y KV cache, por lo que se recomienda una GPU con al menos 4 GB para Q4_K_M y 6 GB para Q8_0.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, RTX 4090, o cualquier GPU con al menos 4 GB de VRAM. También puede ejecutarse en CPU con llama.cpp.
- Cabe en GPUs de consumo: sí, en GPUs de 4 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llamafile. El modelo base en safetensors puede desplegarse con vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a la familia Qwen 3.5 de 4B, pero no se han proporcionado datos de contexto, rendimiento ni licencia de modelos comparables. A continuación se listan modelos GGUF relacionados encontrados en la búsqueda web, sin datos verificados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/Qwen-3.5-4B-A90-R10-Heretic-GGUF | 4.205.751.296 | No disponible | No disponible | HuggingFace |
| mradermacher/Qwen3.5-4B-heretic-GGUF | No disponible | No disponible | No disponible | HuggingFace |
| mradermacher/Qwen3.5-4B-Neo-heretic-i1-GGUF | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- No se ha documentado el proceso de entrenamiento, por lo que se desconocen los sesgos presentes.
- Riesgo de alucinación inherente a los modelos de lenguaje.
- El modelo solo soporta inglés según la metadata, lo que limita su uso en otros idiomas.
- La licencia no está especificada; el uso comercial requiere verificación previa.
- Las cuantizaciones más agresivas (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas.
- No se dispone de benchmarks, por lo que el rendimiento real en tareas concretas es desconocido.

## Enlaces

- HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Qwen-3.5-4B-A90-R10-Heretic-GGUF
- Modelo base: https://huggingface.co/FenrirLupus/Qwen-3.5-4B-A90-R10-Heretic
- Modelos GGUF relacionados encontrados: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF y https://huggingface.co/mradermacher/Qwen3.5-4B-Neo-heretic-i1-GGUF
