# mradermacher/Synthia-4-27B-i1-GGUF

## Resumen

Synthia-4-27B-i1-GGUF es la versión cuantizada en formato GGUF del modelo migtissera/Synthia-4-27B, publicada por el usuario mradermacher. Se trata de un modelo de 27.320.697.856 parámetros (27,32 mil millones) orientado a asistentes conversacionales, uso agéntico, razonamiento, contexto largo y tool calling, según las etiquetas declaradas en el repositorio. La cuantización la realiza mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, que en este caso emplea cuantizaciones con imatrix (matriz de importancia) para reducir la pérdida de calidad respecto a las cuantizaciones estáticas.

La relevancia de esta ficha es práctica: el repositorio contiene las versiones listas para ejecutarse en llama.cpp, Ollama o LM Studio, lo que permite desplegar un modelo de 27B en hardware de consumo o en una única GPU profesional, en lugar de requerir el tensor completo en precisión completa. Las etiquetas del repositorio indican herencia de la familia Qwen3, soporte multimodal (visión) y multitoken prediction (mtp), aunque no se proporciona información técnica detallada del modelo base ni resultados de benchmarks.

El repositorio es muy reciente (creado el 17 de septiembre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validación comunitaria publicada. La licencia declarada es Apache 2.0 y el único idioma soportado oficialmente es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; las etiquetas del repositorio indican Qwen3 (transformer decoder) y multitoken prediction (mtp) |
| Parámetros totales | 27.320.697.856 (27,32 mil millones) |
| Parámetros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible (el repositorio se etiqueta como "long-context", sin cifra concreta) |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, más el fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura del modelo base en la documentación proporcionada. Las etiquetas del repositorio apuntan a la familia Qwen3, lo que implica un transformer decoder con atención completa, y añaden las etiquetas "multimodal" y "mtp" (multitoken prediction), además de "agentic", "reasoning", "long-context" y "tool-use". No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

En cuanto al proceso de cuantización, esta versión se ha generado con el método i1 de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), que utiliza un fichero imatrix para ponderar la importancia de cada tensor durante la cuantización. El repositorio distingue entre esta versión ponderada y las cuantizaciones estáticas publicadas en el repositorio paralelo Synthia-4-27B-GGUF. El modelo base figura como un modelo de visión, por lo que el uso multimodal requiere descargar los ficheros mmproj, que se alojan en el repositorio estático y no en este.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a asistente personal, según la etiqueta "personal-ai" y "conversational".
- Razonamiento explícito y resolución de problemas en varios pasos ("reasoning", "agentic").
- Capacidades agénticas y de razonamiento multi-paso, con soporte declarado de uso de herramientas ("tool-use"), lo que habilita function calling y encadenamiento de llamadas.
- Procesamiento de contexto largo ("long-context"), sin que se especifique la longitud máxima en tokens.
- Capacidades multimodales (visión), condicionadas a la descarga del fichero mmproj desde el repositorio estático.
- Multitoken prediction (mtp) como técnica declarada, orientada a acelerar la decodificación.
- Soporte de inglés como único idioma declarado.
- Ejecución local mediante llama.cpp y derivados gracias al formato GGUF, con 25 niveles de cuantización distintos que cubren desde ~1 bit por peso hasta 6 bits.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno en inglés ejecutándose en una estación de trabajo con una GPU de consumo, usando cuantizaciones Q4_K_M o inferiores, sin enviar datos a servicios externos.
- Agente con tool calling: gracias a la etiqueta "tool-use" y a su perfil agéntico, puede integrarse en flujos donde el modelo decide qué función invocar (consultas a bases de datos, APIs REST, ejecución de comandos) y compone la respuesta final a partir del resultado.
- Procesamiento de documentos largos con visión: con el fichero mmproj instalado, puede analizar capturas, diagramas o páginas escaneadas junto con el texto asociado, útil para extracción de información de informes o facturas.
- Automatización de soporte técnico interno: al soportar razonamiento multi-paso y contexto extenso, permite mantener el hilo de una incidencia a lo largo de varios mensajes y consultar documentación interna mediante herramientas.
- Despliegue en equipos sin GPU dedicada: las cuantizaciones IQ2 y Q3 reducen el peso a un rango manejable en RAM, lo que permite ejecución en CPU con llama.cpp para tareas de baja concurrencia.
- Generación y revisión de código como tarea auxiliar: aunque no se declaran benchmarks de código, el perfil de razonamiento y tool calling lo hace utilizable en asistentes de terminal que explican, completan o depuran fragmentos.
- Prototipado de investigación sobre agentes: al ser un modelo abierto con licencia Apache 2.0, puede usarse como base para experimentos de planificación, uso de herramientas y evaluación de razonamiento sin restricciones de licencia comercial.
- Sustitución de APIs propietarias en entornos con requisitos de privacidad: el formato GGUF permite ejecución totalmente offline, requisito habitual en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y el modelo base no aporta cifras en los datos proporcionados. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo. Tampoco se dispone de mediciones de latencia o throughput publicadas por el autor.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir del recuento de parámetros (27,32 mil millones) y del tamaño típico de cada tipo de cuantización en llama.cpp. Son aproximaciones: el consumo real depende de la longitud de contexto, del tamaño del KV cache y del backend utilizado (CUDA, Metal, ROCm, CPU).

| Cuantización | Peso aproximado | VRAM estimada con contexto corto | Viabilidad |
|---|---|---|---|
| IQ1_S / IQ1_M | 7,5-8,5 GB | 9-11 GB | GPU de consumo de 12 GB |
| IQ2_M / Q2_K | 10,5-11,5 GB | 12-14 GB | RTX 3060 12 GB, RTX 4070 |
| IQ3_M / Q3_K_M | 12,9-13,6 GB | 15-17 GB | RTX 4080, RTX 4090 |
| IQ4_XS / Q4_K_M | 14,8-16,5 GB | 18-21 GB | RTX 4090 24 GB, A5000 |
| Q5_K_M | 19,3 GB | 22-25 GB | RTX 4090 24 GB con contexto moderado, L40S |
| Q6_K | 22,3 GB | 25-28 GB | A100 40 GB, L40S 48 GB |
| Q8_0 (no listado en el repositorio) | ~29 GB | 32-36 GB | A100 40 GB, H100 |
| F16 (modelo base) | ~55 GB | 60-70 GB | A100 80 GB, H100 80 GB |

- GPU recomendadas: RTX 4090 o RTX 4080 para cuantizaciones Q4/IQ4; A100 40 GB, L40S o H100 para Q6 y superiores; en CPU, se recomienda un mínimo de 32 GB de RAM para Q4_K_M y 64 GB para Q6_K.
- Cabe en GPU de consumo: sí, desde 12 GB de VRAM con cuantizaciones IQ2/Q2_K, y con margen cómodo a partir de 24 GB para Q4_K_M y Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python (formato GGUF nativo). vLLM y TGI están pensados para los pesos safetensors del modelo base, no para estos ficheros GGUF.
- Para visión es necesario descargar además el fichero mmproj del repositorio estático Synthia-4-27B-GGUF; sin él el modelo funciona solo como modelo de texto.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La información proporcionada no incluye datos de benchmarks ni especificaciones de contexto de modelos alternativos de la misma categoría, por lo que no es posible establecer una comparativa de rendimiento rigurosa. La comparación que sí puede hacerse con datos verificables es entre las distintas distribuciones de este mismo modelo.

| Distribución | Formato | Parámetros | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| mradermacher/Synthia-4-27B-i1-GGUF (esta ficha) | GGUF | 27,32 mil millones | apache-2.0 | IQ1_S a Q6_K, ponderadas con imatrix | Repositorio de 23,6 GB; mmproj no incluido |
| mradermacher/Synthía-4-27B-GGUF (estático) | GGUF | 27,32 mil millones | apache-2.0 | Cuantizaciones estáticas | Alberga los ficheros mmproj para visión |
| migtissera/Synthia-4-27B (modelo base) | safetensors | 27,32 mil millones | apache-2.0 | Precisión completa (bf16/fp16) | Requiere transformers, no apto para llama.cpp |

Comparativa con otros modelos de la misma categoría (por ejemplo, alternativas densas de 24-32 mil millones de parámetros): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo se declara inglés ("en"). No hay evidencia de soporte fiable de castellano ni de otros idiomas, por lo que su uso en producción multilingüe no está respaldado por la documentación.
- Contexto: la etiqueta "long-context" no viene acompañada de una cifra de tokens, de modo que no puede dimensionarse el KV cache ni garantizarse el rendimiento en ventanas extensas. Debe validarse experimentalmente.
- Pérdida por cuantización: las cuantizaciones por debajo de Q4 (especialmente IQ1 e IQ2) degradan de forma apreciable el razonamiento y la coherencia. Para tareas agénticas o de tool calling se recomienda Q4_K_M o superior.
- Alucinación: al no existir benchmarks publicados, no hay medición de la tasa de alucinación. En tareas de razonamiento y uso de herramientas, la verificación de las salidas es obligatoria antes de ejecutar acciones.
- Capacidades declaradas, no verificadas: las etiquetas "multimodal", "mtp", "agentic" y "tool-use" provienen de los metadatos del repositorio y no se acompañan de documentación técnica ni de evaluaciones que las confirmen.
- Visión condicionada: el fichero mmproj no está en este repositorio. Sin descargarlo desde el repositorio estático, las capacidades multimodales no funcionan.
- Discrepancia en la lista de ficheros: los metadatos del README enumeran 25 tipos de cuantización, pero la tabla de ficheros visible solo lista el fichero imatrix (0,1 GB). El tamaño total del repositorio (23,6 GB) sugiere que las cuantizaciones están publicadas, aunque conviene verificar la disponibilidad real de cada fichero antes de integrarlo en un pipeline.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar también las condiciones del modelo base y de los datos de entrenamiento originales, no documentadas aquí.
- Madurez: repositorio creado el 17 de septiembre de 2026, con 0 descargas y 0 valoraciones en el momento de la consulta. No existe validación por parte de la comunidad ni informes de fallos conocidos.

## Enlaces

- Repositorio HuggingFace (esta versión cuantizada): https://huggingface.co/mradermacher/Synthia-4-27B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Synthia-4-27B-i1-GGUF/resolve/main/Synthia-4-27B.imatrix.gguf
- Repositorio de cuantizaciones estáticas y ficheros mmproj: https://huggingface.co/mradermacher/Synthia-4-27B-GGUF
- Modelo base: https://huggingface.co/migtissera/Synthia-4-27B
- Página de resumen y descargas del publicador: https://hf.tst.eu/model#Synthia-4-27B-i1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del publicador: https://www.nethype.de/
- Paper, blog o demo oficial del modelo base: no disponible en la información proporcionada (las búsquedas web realizadas no devolvieron resultados relevantes).
