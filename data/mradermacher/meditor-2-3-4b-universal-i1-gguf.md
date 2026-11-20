# mradermacher/Meditor-2-3.4B-Universal-i1-GGUF

## Resumen

Meditor-2-3.4B-Universal-i1-GGUF es la versión cuantizada en formato GGUF del modelo base Yo-Purple/Meditor-2-3.4B-Universal, publicada por el usuario mradermacher, especializado en generar cuantizaciones optimizadas (imatrix) de modelos abiertos. El modelo original es un transformer de tipo Mixture of Experts (MoE) con arquitectura qwen2_moe, derivado a su vez de la familia SmolLM2, con 3.511.666.688 parámetros totales y licencia Apache 2.0.

La relevancia de esta publicación radica en que pone a disposición de la comunidad un conjunto amplio de cuantizaciones (desde IQ1_S de 0,9 GB hasta Q6_K de 3,0 GB) generadas con matrices de importancia (imatrix), lo que permite ejecutar el modelo en hardware muy modesto, desde GPUs de consumo hasta CPU, manteniendo un equilibrio razonable entre tamaño y calidad. El modelo está etiquetado como conversacional y orientado a inglés, con soporte declarado para la librería transformers y compatibilidad con endpoints.

La ficha se centra en la versión cuantizada i1-GGUF, si bien los detalles de arquitectura y entrenamiento provienen del modelo base, del cual no se dispone de información detallada en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen2_moe), derivado de SmolLM2 |
| Parámetros totales | 3.511.666.688 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, además de fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) del tipo qwen2_moe, construido sobre la familia SmolLM2. Los tags de la model card indican además relación con unibench-100, lo que sugiere que el modelo ha sido evaluado o ajustado con ese conjunto de referencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La contribución técnica de esta publicación es la generación de cuantizaciones i1 (imatrix) mediante el proceso de mradermacher, que emplea un fichero imatrix para ponderar la importancia de los tensores durante la cuantización y mejorar la calidad respecto a cuantizaciones estáticas equivalentes. El repositorio incluye tanto el fichero imatrix como 25 variantes de cuantización, lo que permite al usuario generar sus propias cuantizaciones o elegir el compromiso tamaño/calidad adecuado. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" de la model card.
- Razonamiento y respuesta a instrucciones en formato de diálogo multi-turno.
- Arquitectura MoE que, en teoría, permite activar solo una fracción de los parámetros por token, aunque no se especifica el número de parámetros activos.
- Compatibilidad con transformers y con el ecosistema GGUF (llama.cpp y derivados).
- Soporte de endpoints compatible, según los tags del repositorio.
- Capacidades multilingües limitadas al inglés declarado.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Despliegue en hardware de consumo: con cuantizaciones de 2,1-2,2 GB (i1-Q4_K_S o i1-Q4_K_M), el modelo puede ejecutarse en GPUs con 4-6 GB de VRAM o incluso en CPU, lo que lo hace adecuado para prototipos locales y entornos sin GPU dedicada.
- Asistentes conversacionales ligeros en inglés: el modelo está etiquetado como conversacional y puede gestionar diálogos multi-turno en aplicaciones de chat embebidas, bots de soporte o interfaces de voz, siempre que el contexto requerido no supere la ventana del modelo (no documentada).
- Experimentación e investigación en arquitecturas MoE: al ser un modelo pequeño (3,4B) con arquitectura qwen2_moe, sirve como banco de pruebas para estudiar el comportamiento de mezclas de expertos en tareas de razonamiento y generación.
- Evaluación de cuantizaciones: el repositorio incluye 25 variantes y el fichero imatrix, lo que permite comparar calidad y rendimiento entre tipos de cuantización en un mismo modelo, útil para estudiar el impacto de la cuantización en modelos MoE pequeños.
- Prototipado rápido en pipelines de CI/CD: su tamaño reducido y formato GGUF permiten integrarlo en tests automatizados de generación de texto o validación de respuestas sin requerir infraestructura de GPU de datacenter.
- Aplicaciones educativas y demos: el tamaño de 0,9-3,0 GB según cuantización facilita su distribución en entornos docentes, talleres y demostraciones de inferencia local con llama.cpp u Ollama.
- Fine-tuning posterior sobre el modelo base: la licencia Apache 2.0 del modelo original permite adaptar el modelo a dominios específicos y luego cuantizarlo de nuevo con el fichero imatrix incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB para cuantizaciones IQ1/IQ2, 1,5-2,0 GB para IQ3, 2,0-2,3 GB para IQ4/Q4, 2,5-2,6 GB para Q5 y 3,0 GB para Q6_K. Hay que añadir memoria para el contexto KV cache, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput; también válido en GPUs integradas o CPU para las cuantizaciones más pequeñas.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer actuales (GTX 1650 4 GB en adelante) usando cuantizaciones Q4 o inferiores; las cuantizaciones Q5/Q6 requieren 6-8 GB para dejar margen al contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI si se usa el formato safetensors original.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meditor-2-3.4B-Universal-i1-GGUF | 3,51B (MoE) | no disponible | Apache 2.0 | GGUF | 25 cuantizaciones i1, fichero imatrix, solo inglés |
| SmolLM2 (familia base) | no disponible | no disponible | no disponible | safetensors, GGUF | Modelo base del que deriva la arquitectura; datos concretos no disponibles |
| Qwen2-MoE (familia de referencia) | no disponible | no disponible | no disponible | safetensors | Arquitectura qwen2_moe de referencia; datos concretos no disponibles |
| Modelos densos de ~3B (p. ej. Llama 3.2 3B) | ~3B | 128k (típico en la familia) | licencia comunitaria | safetensors, GGUF | Alternativa densa comparable en tamaño; datos de contexto y benchmarks no verificados en esta ficha |

No se dispone de datos de rendimiento comparado para Meditor-2-3.4B-Universal-i1-GGUF en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte para inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar aplicaciones que requieran ventanas largas sin validación empírica previa.
- Parámetros activos: al ser MoE, no se especifica cuántos parámetros se activan por token, lo que dificulta estimar el coste real de inferencia y el throughput esperado.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (0,9-1,3 GB) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "mostly desperate". Para producción se recomienda Q4_K_M o superior.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni de tasas de alucinación; al ser un modelo pequeño, el riesgo es mayor que en modelos de mayor escala.
- Sesgos: no se documentan análisis de sesgos; el modelo hereda los sesgos de sus datos de entrenamiento, no especificados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y de los datos de entrenamiento, no detallados en la información disponible.
- Producción: la falta de benchmarks, de datos de contexto y de parámetros activos hace recomendable una evaluación propia antes de desplegar el modelo en entornos críticos.
- Fecha de creación: el repositorio figura creado el 2026-11-07, fecha futura respecto a la información habitual; conviene verificar la vigencia y el estado de mantenimiento del repositorio.

## Enlaces

- Repositorio Hugging Face (cuantización i1-GGUF): https://huggingface.co/mradermacher/Meditor-2-3.4B-Universal-i1-GGUF
- Modelo base: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Meditor-2-3.4B-Universal-GGUF
- Página de overview de mradermacher para este modelo: https://hf.tst.eu/model#Meditor-2-3.4B-Universal-i1-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
