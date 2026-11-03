# mradermacher/rubin-zero-32b-0.8-1113-fixed_template-GGUF

## Resumen

Rubin Zero 32B 0.8 1113 (con plantilla fija) es un modelo de lenguaje de 32.762 millones de parámetros, publicado por el usuario somelier y cuantizado en formato GGUF por mradermacher. La información disponible lo etiqueta con la arquitectura qwen3_vl, lo que indica que se trata de un transformer multimodal derivado de la familia Qwen 3 con capacidades de visión, si bien la model card original no documenta el proceso de entrenamiento ni los datos utilizados. El repositorio cuantizado incluye un proyector multimodal (mmproj) en Q8_0 y f16, lo que confirma que el modelo acepta entradas de imagen además de texto.

La relevancia práctica de esta ficha reside en que ofrece el modelo en 11 cuantizaciones GGUF estáticas (desde Q2_K de 12,4 GB hasta Q8_0 de 34,9 GB), lo que permite ejecutarlo en hardware de consumo con llama.cpp u Ollama. Sin embargo, se trata de un modelo con escasa documentación pública: no hay benchmarks, no hay descripción del dataset de entrenamiento y la única lengua declarada es el inglés. La licencia Apache 2.0 facilita su uso comercial, pero la ausencia de información sobre procedencia de datos y evaluación limita su adopción en producción sin una validación interna previa.

El contexto máximo, el régimen de entrenamiento (RLHF, DPO) y las capacidades exactas de razonamiento no están disponibles en la información proporcionada. Cualquier despliegue debería tratarse como experimental hasta realizar evaluaciones propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta qwen3_vl), derivada de la familia Qwen 3 con proyector de visión |
| Parámetros totales | 32.762.123.264 (32,76 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repositorio | 225,9 GB (incluye todas las cuantizaciones) |
| Modelo base | somelier/rubin-zero-32b-0.8-1113-fixed_template |
| Librería | transformers |
| Descargas | 165 |
| Fecha de creación | 2025-11-14 |
| Última actualización | 2026-11-03 |

## Arquitectura y entrenamiento

La etiqueta qwen3_vl y la presencia de un fichero mmproj indican una arquitectura transformer multimodal: un decodificador de lenguaje de 32,76 B parámetros acoplado a un codificador visual mediante un proyector que traduce los embeddings de imagen al espacio del modelo de lenguaje. La designación "fixed_template" en el nombre sugiere que el autor corrigió la plantilla de chat del modelo base para que el formato de conversación funcione correctamente con los tokens especiales de Qwen 3. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Tampoco hay datos públicos sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, mezcla de expertos) más allá de lo que hereda de la familia Qwen 3. El proceso de cuantización realizado por mradermacher es estático (sin imatrix ponderada), según se indica explícitamente en la model card: "weighted/imatrix quants seem not to be available (by me) at this time". Esto implica que las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad más que sus equivalentes con imatrix.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat corregida.
- Procesamiento de imágenes: el proyector mmproj permite entrada multimodal (visión-lenguaje), heredada de la arquitectura qwen3_vl.
- Razonamiento y generación de código: capacidades esperables en un derivado de Qwen 3 de 32 B, aunque no verificadas en la documentación disponible.
- Soporte de tool calling / function calling: no documentado explícitamente; probable por herencia de Qwen 3, pero no confirmado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado al inglés según la model card; no se declaran otros idiomas.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés: con cuantización Q4_K_M (19,9 GB) puede ejecutarse en una GPU de 24 GB y mantener diálogos multi-turno con la plantilla de chat corregida, adecuado para prototipos de atención al cliente en entornos controlados.
- Análisis de documentos con imágenes: gracias al proyector mmproj, puede procesar capturas, diagramas o formularios escaneados junto con instrucciones textuales, útil para extracción de información en pipelines internos.
- Generación de código en estación de trabajo: un modelo de 32 B en Q5_K_M (23,3 GB) cabe en una RTX 4090 y puede integrarse en editores o scripts de automatización para autocompletado y refactorización, siempre con validación humana.
- Procesamiento por lotes offline: con llama.cpp y cuantización Q4_K_S (18,9 GB) se pueden clasificar o resumir grandes volúmenes de texto en inglés en servidores con una sola GPU consumer.
- Investigación sobre cuantización: el repositorio ofrece 11 variantes del mismo modelo, lo que permite estudiar la degradación de calidad entre Q2_K y Q8_0 en tareas concretas de visión-lenguaje.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite incorporar el modelo a productos comerciales sin obligación de compartir derivados, sujeto a validación propia de calidad.
- Base para fine-tuning experimental: al estar disponible el modelo base en safetensors, se puede ajustar con Unsloth (etiqueta presente en el repo) para dominios específicos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV):
  - Q2_K: ~12,4 GB
  - Q3_K_M: ~16,1 GB
  - IQ4_XS: ~18,0 GB
  - Q4_K_M: ~19,9 GB
  - Q5_K_M: ~23,3 GB
  - Q6_K: ~27,0 GB
  - Q8_0: ~34,9 GB
  - Añadir ~0,9-1,3 GB si se usa el proyector multimodal.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M, Q5_K_S y Q5_K_M con contexto moderado; Q6_K al límite.
  - RTX 3090 (24 GB): igual que la 4090, con menor throughput.
  - A100 40 GB / H100: Q8_0 y Q6_K con contexto amplio; también el modelo base en fp16 (necesita ~65 GB, por lo que requeriría A100 80 GB o H100).
  - GPU de 16 GB (RTX 4080, 4060 Ti 16 GB): Q3_K_M o IQ4_XS con contexto reducido.
  - GPU de 12 GB: Q2_K, con degradación de calidad notable.
- Cabe en GPU consumer: sí, desde Q2_K en 12 GB hasta Q6_K en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), text-generation-inference (etiqueta tgi), transformers con el modelo base, vLLM para el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependerán de la GPU y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Rubin Zero 32B (este) | 32,76 B | No disponible | Apache 2.0 | Sí (mmproj) | GGUF + safetensors |
| Qwen2.5 32B Instruct | 32,5 B | 128 K (según documentación pública de Qwen) | Apache 2.0 | No | GGUF, safetensors, amplia comunidad |
| Gemma 2 27B | 27 B | 8 K | Gemma Terms | No | GGUF, safetensors |
| Yi 1.5 34B | 34 B | 4 K-32 K según variante | Apache 2.0 | No | GGUF, safetensors |

La comparación es orientativa: los datos de los modelos alternativos provienen de su documentación pública y no de la información proporcionada en esta ficha. Rubin Zero 32B destaca por su naturaleza multimodal y licencia permisiva, pero carece de la documentación, benchmarks y soporte comunitario de las alternativas consolidadas.

## Limitaciones y advertencias

- Documentación muy escasa: no hay benchmarks, ni descripción del dataset, ni información sobre alineación; la evaluación de calidad queda enteramente en manos del usuario.
- Solo inglés declarado: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinación no cuantificado: al no publicarse evaluaciones, no se puede estimar la tasa de errores factuales.
- Cuantizaciones estáticas sin imatrix: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad en comparación con cuantizaciones ponderadas.
- Longitud de contexto desconocida: impide planificar despliegues con documentos largos o conversaciones extensas.
- Modelo derivado con autoría poco documentada: "somelier" no publica información sobre el proceso de entrenamiento ni sobre la procedencia de los datos, lo que dificulta auditar sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad sobre el cumplimiento normativo y la calidad del output.
- El repositorio ocupa 225,9 GB; descargar todas las cuantizaciones es innecesario y conviene seleccionar solo la variante objetivo.
- La etiqueta qwen3_vl sugiere herencia de Qwen 3, pero no hay confirmación oficial de que el modelo respete las limitaciones y sesgos documentados por Alibaba.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/rubin-zero-32b-0.8-1113-fixed_template-GGUF
- Modelo base: https://huggingface.co/somelier/rubin-zero-32b-0.8-1113-fixed_template
- Página de descargas del cuantizador: https://hf.tst.eu/model#rubin-zero-32b-0.8-1113-fixed_template-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
