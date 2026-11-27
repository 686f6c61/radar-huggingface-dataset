# mradermacher/Luminescent-Void-31B-GGUF

## Resumen

Luminescent-Void-31B-GGUF es la distribucion en formato GGUF del modelo Luminescent-Void-31B, desarrollado originalmente por Cyclone-Labs y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 30.697 millones de parametros (unos 31B), orientado a generacion de texto conversacional con enfasis declarado en roleplay, narrativa (storytelling) y contenido para adultos (NSFW). El modelo base se construyo mediante mergekit, es decir, es un merge de otros modelos, no un entrenamiento desde cero.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 31B en hardware de consumo gracias a las cuantizaciones GGUF publicadas (desde Q2_K de 12 GB hasta Q8_0 de 32,7 GB), asi como en su licencia Apache 2.0, que facilita el uso comercial. El repositorio incluye ademas ficheros mmproj (Q8_0 y f16), lo que indica soporte multimodal, presumiblemente vision, aunque la model card no lo detalla.

La informacion disponible es limitada: la model card del cuantizador es fundamentalmente tecnica sobre las cuantizaciones y no aporta datos sobre arquitectura interna, contexto, dataset de entrenamiento ni benchmarks. Esta ficha refleja exclusivamente lo que consta en la informacion proporcionada, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje transformer, inferido del pipeline de transformers; no confirmado) |
| Parametros totales | 30.697.345.596 (~31B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Cyclone-Labs/Luminescent-Void-31B se genero con mergekit, segun las etiquetas del repositorio (mergekit, merge). Esto implica que es el resultado de la fusion de los pesos de dos o mas modelos preexistentes mediante alguna tecnica de merge (el metodo concreto no se especifica en la informacion disponible). No se trata, por tanto, de un modelo entrenado desde cero, y no consta informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO.

La unica informacion tecnica adicional es la existencia de ficheros mmproj (multi-modal supplement) en cuantizaciones Q8_0 y f16, lo que sugiere que el modelo incorpora un proyector multimodal, probablemente para vision. No se detalla la arquitectura interna (atencion, capas, dimensiones), la longitud de contexto ni innovaciones tecnicas especificas, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional en ingles, con especializacion declarada en roleplay y storytelling.
- Generacion de contenido para adultos (NSFW), segun las etiquetas del repositorio.
- Soporte multimodal presumible, a partir de los ficheros mmproj incluidos (Q8_0 y f16); la modalidad concreta (vision) no se confirma en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo consta el ingles.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay conversacional: el modelo esta etiquetado explicitamente para roleplay, por lo que puede emplearse en entornos de chat con personajes, manteniendo el tono y la persona definidos en el prompt de sistema.
- Narrativa interactiva y storytelling: adecuado para generar ficcion por capitulos o tramas ramificadas, dada su orientacion a la escritura creativa.
- Prototipado de experiencias de ficcion para adultos: su etiqueta NSFW lo hace apto para productos de contenido adulto, siempre que se cumplan los requisitos legales y de moderacion aplicables.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (17,9 GB) y Q4_K_M (18,8 GB) permiten ejecutarlo en GPU con 24 GB de VRAM, lo que facilita pruebas de concepto sin infraestructura en la nube.
- Experimentacion con merges de modelos: al ser un modelo derivado de mergekit, sirve como caso de estudio para evaluar la calidad de tecnicas de fusion de pesos frente a modelos entrenados de forma nativa.
- Generacion de dialogos para videojuegos o narrativa ramificada: puede integrarse en motores de dialogo que consuman una API compatible con endpoints GGUF, aprovechando su perfil conversacional.
- Evaluacion comparativa de cuantizaciones: los multiples niveles (Q2_K a Q8_0) permiten medir el impacto de la cuantizacion en la calidad narrativa antes de fijar una version para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~12 GB, Q3_K_S ~13,9 GB, Q3_K_M ~15,4 GB, Q3_K_L ~16,7 GB, IQ4_XS ~17 GB, Q4_K_S ~17,9 GB, Q4_K_M ~18,8 GB, Q5_K_S ~21,4 GB, Q5_K_M ~21,9 GB, Q6_K ~25,3 GB, Q8_0 ~32,7 GB. Los ficheros mmproj anaden ~0,9 GB (Q8_0) o ~1,3 GB (f16) si se usa la parte multimodal.
- GPU recomendadas: para Q4_K_M en adelante, GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para Q2_K y Q3_K_S, GPU de 16 GB como la RTX 4080 pueden ser suficientes, con margen limitado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_S o Q4_K_M; en GPUs de 16 GB solo con cuantizaciones Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con endpoints (el repo esta etiquetado como endpoints_compatible). vLLM y TGI no estan confirmados para este GGUF en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luminescent-Void-31B-GGUF | ~31B | no disponible | apache-2.0 | GGUF | Merge orientado a roleplay/NSFW, con mmproj |
| Modelo base Cyclone-Labs/Luminescent-Void-31B | ~31B | no disponible | apache-2.0 | safetensors | Origen del GGUF, mismo perfil |
| Alternativas de 30-34B para roleplay | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta etiquetado como not-for-all-audiences; requiere moderacion y control de acceso en cualquier producto publico.
- Riesgo de alucinacion: al ser un merge sin datos publicados de evaluacion, no hay garantias medidas sobre fidelidad factual; no debe usarse como fuente de verdad sin verificacion.
- Idiomas: solo consta soporte de ingles; el rendimiento en castellano no esta documentado.
- Contexto: la longitud de contexto no se ha publicado, lo que impide planificar cargas de trabajo con ventanas largas con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los modelos fusionados podrian arrastrar condiciones adicionales no documentadas en esta ficha; conviene revisar la licencia del modelo base antes de producción.
- Ausencia de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad relativa frente a alternativas no puede evaluarse con rigor.
- Fecha de publicacion futura (2026-11-23) en los metadatos del repositorio; conviene verificar la vigencia y estabilidad del repositorio antes de integrarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luminescent-Void-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Luminescent-Void-31B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Luminescent-Void-31B-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Luminescent-Void-31B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
