# mradermacher/Gemma-2-Ataraxy-Remix-9B-GGUF

## Resumen

Gemma-2-Ataraxy-Remix-9B-GGUF es una colección de cuantizaciones en formato GGUF del modelo base lemon07r/Gemma-2-Ataraxy-Remix-9B, un merge de modelos derivado de la familia Gemma 2 de Google. El autor de esta versión cuantizada es mradermacher, un prolifico publicador de cuantizaciones GGUF en Hugging Face que mantiene infraestructura propia (nethype GmbH) para generar estos artefactos. El modelo original surge de la técnica de model merging con mergekit, combinando pesos de modelos Gemma 2 de aproximadamente 9.000 millones de parámetros.

El propósito de esta publicación es exclusivamente práctico: convertir el modelo merged original en ficheros GGUF listos para inferencia con llama.cpp y ecosistemas compatibles, abarcando desde cuantizaciones agresivas de 2 bits (Q2_K, 3,9 GB) hasta f16 (18,6 GB). No introduce cambios arquitectónicos ni de entrenamiento respecto al modelo base; su valor reside en la disponibilidad de formatos optimizados para despliegue local.

El modelo base pertenece a la arquitectura Gemma 2, un transformer decoder-only con atención local/global intercalada y normalización RMSNorm con pre y post-norm. Con 9.241.705.984 parámetros totales, se posiciona en el rango de modelos de 9B, adecuado para GPUs de consumo con cuantizaciones de 4 bits. La relevancia de esta ficha radica en documentar un artefacto de despliegue de bajo perfil (78 descargas, 1 like) que, sin embargo, permite ejecutar un merge experimental de Gemma 2 en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2), derivado de merge con mergekit |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 2 soporta contextos largos, pero no se especifica aqui) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un merge de modelos de la familia Gemma 2, generado con mergekit. No se dispone de información sobre la receta exacta del merge (método, pesos por capa, modelos donor) en los datos proporcionados; la model card solo indica la etiqueta "mergekit" y "merge". La arquitectura heredada es la de Gemma 2: transformer decoder-only con mecanismos de atención local y global alternados, RMSNorm con pre-norm y post-norm, y embeddings atados. El tamaño de 9.241.705.984 parámetros coincide con la variante de 9B de la familia.

No se documentan detalles sobre datos de entrenamiento, número de tokens, composición del dataset, ni si hubo RLHF/DPO en el modelo base. Al tratarse de un merge, el "entrenamiento" es en realidad una combinación de pesos de modelos ya entrenados, sin fase adicional de preentrenamiento. Esta publicación de mradermacher no altera los pesos más allá de la cuantización: los ficheros GGUF son conversiones de los safetensors originales, con metadatos de versión de cuantización 2 y conversión tipo hf.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (tag "conversational").
- Razonamiento general y respuesta a instrucciones, heredado de los modelos Gemma 2 combinados.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite servir el modelo mediante APIs compatibles con OpenAI.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados (Ollama, LM Studio, etc.).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni thinking mode en la informacion disponible.
- Capacidades multilingues limitadas: el tag de idioma solo declara ingles ("en").
- No se confirma soporte de codigo o matematicas especializado; depende del comportamiento del merge original.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (5,9 GB) o Q5_K_M (6,7 GB), el modelo cabe en GPUs de consumo de 8-12 GB de VRAM y permite inferencia offline sin dependencia de APIs externas.
- Prototipado rapido de aplicaciones conversacionales en ingles: el tag "conversational" y la compatibilidad con endpoints facilitan montar un servidor local compatible con OpenAI para probar prompts y flujos de chat.
- Evaluacion comparativa de merges: al ser un artefacto GGUF de un merge experimental, sirve para comparar empiricamente el comportamiento de merges de Gemma 2 frente al modelo original en tareas de generacion abierta.
- Integracion en pipelines de CI con llama.cpp: los ficheros GGUF permiten ejecutar tests de regresion de calidad de texto en entornos sin GPU dedicada, usando cuantizaciones Q2_K (3,9 GB) o Q3_K_S (4,4 GB) en CPU.
- Experimentacion academica con cuantizacion: la disponibilidad de 12 variantes (de Q2_K a f16) permite estudiar la degradacion de perplexity y calidad segun el nivel de cuantizacion, con el grafo comparativo de ikawrakow incluido en la model card.
- Uso en entornos con VRAM limitada (6-8 GB): IQ4_XS (5,3 GB) o Q4_K_S (5,6 GB) permiten ejecutar un modelo de 9B en GPUs consumer de gama media-baja, sacrificando algo de calidad frente a Q6_K o Q8_0.
- Servicio de chat interno en ingles: mediante llama.cpp server o Ollama, con Q8_0 (9,9 GB) para maxima calidad en GPUs de 12-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF mas overhead de contexto):
  - Q2_K: ~4-5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~5-6 GB
  - IQ4_XS: ~6 GB
  - Q4_K_S / Q4_K_M: ~6-7 GB
  - Q5_K_S / Q5_K_M: ~7-8 GB
  - Q6_K: ~8-9 GB
  - Q8_0: ~10-11 GB
  - f16: ~19-20 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 no son necesarias para este tamano, pero permitirian f16 con contexto largo.
- Cabe en GPU consumer: si, desde Q4_K_S en GPUs de 8 GB (con contexto moderado) hasta Q8_0 en GPUs de 12-16 GB; Q2_K y Q3_K caben incluso en 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con endpoints (tag "endpoints_compatible"); vLLM y TGI no son el formato nativo de estos ficheros GGUF, aunque existen variantes i1 (imatrix) en el repo hermano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma-2-Ataraxy-Remix-9B-GGUF (este) | 9.241.705.984 | no disponible | no disponible | GGUF, 12 cuantizaciones | Merge experimental de Gemma 2, solo ingles |
| lemon07r/Gemma-2-Ataraxy-Remix-9B (base) | ~9B | no disponible | no disponible | safetensors | Modelo original del merge, sin cuantizar |
| Gemma 2 9B (Google) | ~9B | no disponible en esta ficha | Gemma license | safetensors, GGUF comunitarios | Modelo oficial de referencia de la familia |
| mradermacher/Gemma-2-Ataraxy-Remix-9B-i1-GGUF | ~9B | no disponible | no disponible | GGUF imatrix | Variante con cuantizaciones weighted/imatrix del mismo merge |

## Limitaciones y advertencias

- Modelo derivado de un merge comunitario: no ha pasado por evaluacion oficial de Google ni por un proceso de alineacion documentado; el comportamiento puede ser irregular en tareas sensibles.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas, pese a que Gemma 2 base es multilingue.
- Riesgo de alucinacion: inherente a modelos de 9B sin verificación externa; no hay benchmarks publicados que acoten este riesgo.
- Licencia no disponible: al no especificarse, no se puede confirmar viabilidad de uso comercial; ademas, al derivar de Gemma 2, probablemente hereda las condiciones de la licencia Gemma, que imponen restricciones de uso (incluida la prohibicion de ciertos usos y obligaciones de atribucion), pero esto no esta confirmado en la informacion proporcionada.
- Cuantizaciones agresivas (Q2_K, Q3_K_M) degradan calidad; la propia model card marca Q3_K_M como "lower quality".
- Sin datos de contexto maximo confirmados: planificar despliegues con ventanas conservadoras hasta verificar empiricamente el comportamiento del merge.
- Artefacto de bajo perfil (78 descargas, 1 like): poca validacion comunitaria, sin issues ni discusion documentadas.
- No se confirma soporte de tool calling ni de agentes; no asumir estas capacidades en produccion sin pruebas.
- El repo ocupa 78,1 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/Gemma-2-Ataraxy-Remix-9B-GGUF
- Modelo base: https://huggingface.co/lemon07r/Gemma-2-Ataraxy-Remix-9B
- Variante imatrix: https://huggingface.co/mradermacher/Gemma-2-Ataraxy-Remix-9B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Gemma-2-Ataraxy-Remix-9B-GGUF
- Guia de uso GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
