# share72/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (en su variante i1-GGUF) es una cuantizacion en formato GGUF del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, preparada por el usuario `share72` mediante el pipeline de cuantizacion con imatrix de mradermacher. El modelo subyacente es una destilacion de 8.953.803.264 parametros (aproximadamente 9B) construida sobre la arquitectura Qwen3.5, orientada a razonamiento, matematicas, STEM, tool calling y function calling, con soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.

La particularidad de esta variante es su caracter "uncensored/heretic/abliterated": el modelo base ha sido modificado para eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad, lo que lo hace adecuado para investigacion sobre comportamiento de modelos, generacion de contenido sin filtros y estudios de robustez, pero tambien lo convierte en una opcion arriesgada para despliegues comerciales orientados al publico general. La licencia declarada es Apache 2.0.

El repositorio contiene unicamente archivos GGUF cuantizados (desde i1-IQ1_S de 2,8 GB hasta variantes de mayor tamano), mas un fichero imatrix para generar cuantizaciones propias. El repo ocupa 110,2 GB en total. No se dispone de informacion sobre el pipeline de Hugging Face ni de resultados de benchmarks publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (no se especifica si es MoE; los tags indican `qwen3_5` y `mtp`) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-Q8_0 (segun lista de tags de cuantizacion) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es una destilacion sobre la arquitectura Qwen3.5, segun los tags `qwen3_5`, `distillation`, `deepseek` y `mtp` (multi-token prediction). Los tags del repositorio indican que el entrenamiento incluyo SFT (supervised fine-tuning), RL (reinforcement learning) y GSPO (Group Sequence Policy Optimization), una variante de optimizacion de politica usada en modelos de razonamiento recientes. Tambien aparecen etiquetas de `math`, `stem`, `tool-use` y `function-calling`, lo que sugiere un enfasis en tareas de razonamiento estructurado y uso de herramientas.

La variante "heretic/uncensored/abliterated" implica que el modelo base ha pasado por un proceso de abliteration (eliminacion de direcciones de activacion asociadas al rechazo) o por un fine-tuning especifico para reducir las respuestas de negativa. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles del proceso de alineacion. La cuantizacion i1-GGUF se ha realizado con imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precision frente a las estaticas. El modelo base incluye capacidades de vision segun la model card del cuantizador (menciona "This is a vision model" y ficheros mmproj en el repositorio estatico), aunque esta variante GGUF concreta no incluye dichos ficheros mmproj.

## Capacidades

- Generacion de texto conversacional y de formato largo.
- Razonamiento multi-paso y cadenas de pensamiento (tag `reasoning`).
- Matematicas y resolución de problemas STEM (tags `math`, `stem`).
- Generacion y comprension de codigo.
- Tool calling y function calling estructurado (tags `tool-use`, `function-calling`).
- Soporte de agentes y razonamiento multi-paso con uso de herramientas.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones que un modelo alineado rechazaria.
- Prediccion multi-token (MTP) segun el tag `mtp`, lo que puede acelerar la decodificacion.
- Capacidad de vision heredada del modelo base (no incluida en esta variante GGUF sin ficheros mmproj).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un modelo abliterated frente a uno alineado, comparando tasas de rechazo, sesgos y calidad de respuesta en dominios sensibles. Es util en entornos de laboratorio controlados.
- Generacion de codigo en pipelines de CI/CD: gracias al soporte de tool calling y function calling, puede integrarse en agentes que consulten APIs, ejecuten tests o generen parches, con la ventaja de su tamano reducido (~9B) que permite despliegue en una sola GPU.
- Razonamiento matematico y STEM en entornos educativos o de investigacion: el modelo esta entrenado con enfasis en math y stem, por lo que puede resolver problemas paso a paso y explicar el razonamiento, util para tutoria automatizada o generacion de problemas.
- Atencion al cliente multilingue: soporta seis idiomas (en, zh, ko, ja, es, ru) y conversacion multi-turno, lo que permite desplegar un asistente en mercados asiaticos y europeos con un unico modelo.
- Generacion de contenido creativo sin filtros: para aplicaciones de escritura, guiones o narrativa donde los filtros de seguridad de modelos alineados resultan demasiado restrictivos, este modelo ofrece mayor libertad, siempre con revision humana.
- Prototipado rapido en hardware de consumo: las cuantizaciones i1-Q4_K_S (5,5 GB) o i1-Q4_K_M permiten ejecutar el modelo en GPUs consumer de 8-12 GB VRAM mediante llama.cpp u Ollama, ideal para pruebas de concepto y desarrollo local.
- Extraccion de informacion estructurada y agentes de automatizacion: con function calling puede convertir texto no estructurado en llamadas a APIs o JSON, integrable en flujos de RPA o asistentes internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos + overhead de contexto):
  - i1-IQ1_S (2,8 GB): ~3,5-4 GB VRAM.
  - i1-Q2_K (3,9 GB): ~4,5-5 GB VRAM.
  - i1-IQ3_M (4,5 GB): ~5,5-6 GB VRAM.
  - i1-Q4_K_S (5,5 GB): ~6,5-7 GB VRAM.
  - i1-Q4_K_M (~5,8 GB estimado): ~7-7,5 GB VRAM.
  - i1-Q5_K_M (~6,5 GB estimado): ~8-8,5 GB VRAM.
  - i1-Q6_K (~7,5 GB estimado): ~9-9,5 GB VRAM.
  - i1-Q8_0 (~9,5 GB estimado): ~11-12 GB VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100/H100 para despliegue concurrente con vLLM o TGI.
- Cabe en GPU consumer: si, desde cuantizaciones IQ2 hasta Q8_0 en GPUs de 12-16 GB. Las cuantizaciones IQ1/IQ2 caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (requiere conversion a safetensors o soporte GGUF), TGI (soporte GGUF limitado).
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia orientativa para un modelo denso de 9B en Q4_K_M sobre RTX 4090, cabria esperar decenas de tokens por segundo, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (i1-GGUF) | ~9B | no disponible | Apache 2.0 | GGUF | Variante uncensored/abliterated, multilingue (6 idiomas), enfasis en math/STEM/tool-use |
| Qwen3.5-9B (base, si existe) | ~9B | no disponible | no disponible | safetensors/GGUF | Modelo base sin modificacion de seguridad; no se dispone de datos concretos en la informacion |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors/GGUF | Modelo alineado, no uncensored, ampliamente soportado |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | safetensors/GGUF | Menor tamano, licencia permisiva, sin capacidades uncensored por defecto |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo es "uncensored/abliterated": puede generar contenido que modelos alineados rechazarian (violencia, contenido sexual, instrucciones peligrosas). No es apto para aplicaciones orientadas al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones de baja precision (IQ1, IQ2) donde la calidad se degrada notablemente.
- Las cuantizaciones por debajo de Q3 pueden producir respuestas incoherentes o perdida de capacidades de razonamiento; el autor del cuantizador advierte "very low quality" en Q2_K_S y "lower quality" en IQ3_XXS.
- No se dispone de informacion sobre la longitud de contexto real soportada; las cuantizaciones GGUF pueden reducir el contexto efectivo si no se configura correctamente.
- La licencia Apache 2.0 permite uso comercial, pero el caracter uncensored implica que el despliegue comercial puede conllevar riesgos legales y reputacionales segun la jurisdiccion y el contenido generado.
- El modelo base incluye vision, pero esta variante GGUF no incluye ficheros mmproj, por lo que las capacidades de vision no estan disponibles salvo que se descarguen del repositorio estatico.
- Sesgos conocidos: no se documentan en la informacion proporcionada, pero al ser una destilacion de un modelo entrenado con datos web multilingues, es probable que herede sesgos de genero, raza y cultura; se recomienda evaluacion especifica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad; usar con cautela en produccion.
- No hay informacion sobre el proceso de entrenamiento exacto ni sobre la calidad de la destilacion; la procedencia "DeepSeek-V4-Pro" en el nombre no garantiza que sea un modelo oficial de DeepSeek.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/share72/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones estaticas de mradermacher: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
