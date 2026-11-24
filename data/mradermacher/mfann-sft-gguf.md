# mradermacher/MFANN-SFT-GGUF

## Resumen

MFANN-SFT-GGUF es la version cuantizada en formato GGUF del modelo netcat420/MFANN-SFT, un modelo de lenguaje de aproximadamente 8.030 millones de parametros publicado por el usuario netcat420 y convertido a GGUF por mradermacher, un conocido empaquetador de cuantizaciones de la comunidad. El modelo base fue construido mediante mergekit, es decir, es el resultado de una fusion (merge) de otros modelos, y posteriormente sometido a un ajuste fino supervisado (SFT), segun se deduce de su nombre y de las etiquetas de la model card.

La relevancia de esta ficha reside en que ofrece una via practica para ejecutar un modelo de 8B en hardware de consumo mediante llama.cpp y derivados, con un abanico amplio de cuantizaciones que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB). El repositorio ocupa 71,8 GB en total por incluir todas las variantes.

No obstante, la informacion publicada es muy escasa: no se detalla la arquitectura interna del modelo base, no hay datos de entrenamiento, no se publican benchmarks y la licencia no esta declarada. Esta ficha refleja esa situacion y marca explicitamente como "no disponible" cualquier dato que no aparezca en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles no disponibles) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base netcat420/MFANN-SFT es, segun las etiquetas de la model card, el resultado de un merge realizado con mergekit (etiquetas "mergekit" y "merge"), lo que implica que combina los pesos de dos o mas modelos preexistentes mediante alguna de las tecnicas de fusion que ofrece dicha herramienta (linear, SLERP, TIES, DARE, etc.; la tecnica concreta no se especifica). El sufijo "SFT" sugiere un ajuste fino supervisado posterior, pero no se documenta el dataset, el numero de tokens ni el procedimiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF o DPO, ni innovaciones tecnicas como atencion lineal o decodificacion especulativa. El unico dato estructural firme es el recuento de parametros (8.030 millones), coherente con un transformer denso de escala 8B. Las cuantizaciones fueron generadas con el flujo de conversion HF a GGUF de mradermacher (convert_type: hf), y existe una variante con imatrix (quants ponderados) en el repositorio MFANN-SFT-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento general y respuesta a instrucciones, derivado del ajuste SFT del modelo base.
- Capacidades de codigo y matematicas: no documentadas explicitamente; no disponible.
- Soporte de tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (5,0 GB) el modelo cabe en GPUs de consumo de 8 GB o superiores, lo que permite iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en equipos con poca VRAM o incluso en CPU mediante llama.cpp, a costa de cierta perdida de calidad.
- Generacion de texto por lotes en ingles: para tareas de resumen, reescritura o clasificacion de documentos donde no se requiere un modelo de frontera y prima el coste por token.
- Experimentacion con merges de modelos: al estar construido con mergekit, sirve como caso de estudio para investigadores que quieran evaluar como se comporta un merge de 8B tras cuantizacion en distintas precisiones.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que facilita medir el impacto de la cuantizacion (perplejidad, calidad) en un mismo checkpoint.
- Base para ajuste fino adicional: al ser un modelo de 8B en formato HF (el base), puede servir de punto de partida para SFT o LoRA en ingles, siempre que la licencia del modelo base lo permita (no declarada, ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,3 GB; Q3_K_S ~3,8 GB; Q3_K_M ~4,1 GB; Q3_K_L ~4,4 GB; IQ4_XS ~4,6 GB; Q4_K_S ~4,8 GB; Q4_K_M ~5,0 GB; Q5_K_S ~5,7 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB.
- GPU recomendadas: para Q4_K_M y superiores, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4090 (24 GB) o A100/H100 sobran; para f16, se recomienda A100 40 GB o H100.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Q4_K_M entra en GPUs de 8 GB; Q8_0 requiere 12 GB o mas; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como "endpoints_compatible", lo que sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MFANN-SFT-GGUF | 8,03B | no disponible | no disponible | GGUF | Merge con mergekit + SFT; solo ingles |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | safetensors, GGUF | Referencia de la categoria 8B, multilingue |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa abierta y muy extendida |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Buen rendimiento en codigo y matematicas |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo MFANN-SFT que permitan una comparacion cuantitativa justa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor del modelo base antes de usarlo en produccion.
- Documentacion muy escasa: no hay informacion sobre datos de entrenamiento, contexto maximo ni procedimiento de alineacion, lo que dificulta evaluar sesgos y robustez.
- Solo ingles: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo de 8B sin documentacion de alineacion, puede producir contenido facticamente incorrecto con seguridad aparente.
- Modelo derivado de un merge: la calidad puede ser irregular y depende de los modelos fusionados, que no se detallan.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Repositorio pesado (71,8 GB): descargar solo la cuantizacion necesaria para evitar consumo innecesario de disco y ancho de banda.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MFANN-SFT-GGUF
- Modelo base: https://huggingface.co/netcat420/MFANN-SFT
- Variante con imatrix: https://huggingface.co/mradermacher/MFANN-SFT-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MFANN-SFT-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
