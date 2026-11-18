# mradermacher/Apollo2-7B-GGUF

## Resumen

Apollo2-7B-GGUF es la versión cuantizada en formato GGUF del modelo FreedomIntelligence/Apollo2-7B, un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado por el equipo FreedomIntelligence y orientado específicamente al dominio biomédico y sanitario. Esta variante ha sido producida por mradermacher, un conocido creador de cuantizaciones estáticas para la comunidad de llama.cpp, e incluye un abanico de cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB).

El modelo base Apollo2-7B se presenta como un modelo conversacional multilingüe con un enfoque declarado en biología y medicina, entrenado sobre el dataset ApolloMoEDataset. Su relevancia actual radica en que ofrece una alternativa open source (licencia Apache 2.0) para aplicaciones clínicas, de investigación biomédica y de atención sanitaria en las que el despliegue local o en infraestructura propia es un requisito, gracias a la disponibilidad de cuantizaciones que permiten ejecutarlo en hardware de consumo.

La ficha que sigue documenta exclusivamente la información disponible en la model card del repositorio y en los metadatos de Hugging Face. Cualquier dato no publicado por el autor se marca explícitamente como «no disponible»; no se han inferido cifras de benchmarks ni especificaciones de entrenamiento que no estén documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de FreedomIntelligence/Apollo2-7B; la model card no detalla la arquitectura) |
| Parámetros totales | 7.615.616.512 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE en esta variante) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ar, en, zh, ko, ja, mn, th, vi, lo, mg, de, pt, es, fr, ru, it, hr, gl, cs, co, la, uk, bs, bg, eo, sq, da, sa, gn, sr, sk, gd, lb, hi, ku, mt, he, ln, bm, sw, ig, rw, ha |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card de esta variante GGUF no incluye información sobre la arquitectura interna del modelo base (tipo de transformer, número de capas, dimensiones ocultas, mecanismo de atención ni estrategia de posicionamiento). Tampoco se documentan el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. El único dato de entrenamiento disponible es la referencia al dataset FreedomIntelligence/ApolloMoEDataset, utilizado por el modelo base.

Esta variante concreta es una cuantización estática generada con herramientas de la familia llama.cpp a partir de los pesos del modelo original en formato Hugging Face (convert_type: hf), con quantize_version 2 y output_tensor_quantised 1 según los metadatos embebidos en el README. El autor indica que las cuantizaciones ponderadas con imatrix están disponibles en un repositorio separado (Apollo2-7B-i1-GGUF), lo que sugiere que esta variante contiene cuantizaciones estáticas sin calibración por importancia de pesos.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta «conversational» del repositorio.
- Enfoque declarado en dominios de biología y medicina (tags «biology» y «medical»).
- Cobertura multilingüe amplia: 44 idiomas listados, entre ellos español, inglés, chino, árabe, coreano, japonés, alemán, francés, portugués, ruso, italiano, hindi, hebreo, swahili y varias lenguas minoritarias (gaélico escocés, irlandés, córnico, latín, esperanto, etc.).
- Compatibilidad con endpoints (tag «endpoints_compatible»), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistencia clínica documental: el modelo puede resumir historiales, informes y literatura médica en varios idiomas gracias a su cobertura de 44 lenguas y a su especialización declarada en el dominio sanitario. Adecuado para entornos donde los datos no pueden salir de la infraestructura propia.
- Investigación biomédica local: con cuantizaciones Q4_K_M (4,8 GB) o Q5_K_M (5,5 GB) se puede desplegar en una estación de trabajo con GPU de consumo para tareas de extracción de entidades, clasificación de abstracts y generación de hipótesis preliminares sobre corpus privados.
- Traducción y adaptación de contenido sanitario: la amplitud de idiomas soportados permite traducir material divulgativo o protocolos clínicos entre lenguas europeas, asiáticas y africanas, incluyendo pares poco cubiertos por modelos generalistas.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (3,1 GB) y Q3_K_S (3,6 GB) permiten ejecutar el modelo en portátiles o mini-PC sin GPU dedicada mediante llama.cpp u Ollama, útil para prototipado y demos offline.
- Educación y formación sanitaria: generación de material didáctico, preguntas de autoevaluación y explicaciones de conceptos médicos en el idioma del estudiante, con la ventaja de la licencia Apache 2.0 para uso institucional.
- Integración en pipelines de procesamiento de documentos clínicos: al estar en formato GGUF y ser compatible con endpoints, puede insertarse en flujos de extracción y normalización de texto médico dentro de arquitecturas de microservicios.
- Chatbot de orientación sanitaria no diagnóstica: para responder preguntas frecuentes sobre síntomas generales, hábitos saludables o preparación de pruebas, con las advertencias de responsabilidad médica correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto):
  - Q2_K: ~3,1 GB de pesos; ~4 GB de VRAM en total con contexto moderado.
  - Q3_K_S: ~3,6 GB; ~4,5 GB en total.
  - Q4_K_M: ~4,8 GB; ~5,5-6 GB en total.
  - Q5_K_M: ~5,5 GB; ~6,5 GB en total.
  - Q6_K: ~6,4 GB; ~7,5 GB en total.
  - Q8_0: ~8,2 GB; ~9-10 GB en total.
  - f16: ~15,3 GB; ~16-17 GB en total.
- GPU recomendadas: para f16 o Q8_0, GPU con 16-24 GB (RTX 4090, A10G, L4, A100 40 GB); para Q4_K_M y Q5_K_M, GPU de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); para Q2_K y Q3_K_S, GPU de 6-8 GB o incluso CPU.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q5_K_M caben en tarjetas de 6-12 GB; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI (no confirmado para esta variante GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Apollo2-7B-GGUF (esta ficha) | 7,6 B | no disponible | Biomédico, multilingüe (44 idiomas) | Apache 2.0 | GGUF |
| BioMistral-7B | ~7 B | 2.048-32.768 (según variante) | Biomédico | Apache 2.0 | safetensors, GGUF |
| Meditron-7B | ~7 B | 4.096 | Biomédico | Llama 2 (restrictiva) | safetensors |
| OpenBioLLM-8B | ~8 B | 8.192 | Biomédico | Llama 3 (restrictiva) | safetensors |

La comparativa se limita a los datos públicos conocidos de cada familia; no se dispone de resultados de benchmarks de Apollo2-7B en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa. La principal ventaja diferencial de Apollo2-7B-GGUF frente a alternativas es su combinación de licencia Apache 2.0 y cobertura de 44 idiomas, frente a las licencias restrictivas de las familias Llama 2 y Llama 3.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un modelo entrenado sobre un dataset biomédico (ApolloMoEDataset) sin información pública sobre su composición, existe riesgo de sesgos de representación geográfica y lingüística en datos clínicos.
- Riesgo de alucinación: elevado en dominio médico, como en cualquier LLM de 7 B; no debe usarse para diagnóstico ni decisiones clínicas sin supervisión humana.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; la cobertura de 44 idiomas no implica calidad homogénea, y las lenguas minoritarias (córnico, gaélico, esperanto, latín) probablemente tengan un soporte mucho menor que inglés, chino o español.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Apollo2-7B puede incluir términos adicionales; conviene revisar la licencia del modelo original antes de un despliegue comercial.
- Caveat de producción: esta es una cuantización estática sin imatrix; para máxima calidad en cuantizaciones pequeñas, el autor recomienda las variantes del repositorio i1-GGUF. Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad en tareas médicas sensibles.
- Advertencia sanitaria: cualquier uso en contextos clínicos debe acompañarse de avisos de responsabilidad y validación por profesionales sanitarios.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/Apollo2-7B-GGUF
- Modelo base: https://huggingface.co/FreedomIntelligence/Apollo2-7B
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Apollo2-7B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/ApolloMoEDataset
- Página de descargas del autor: https://hf.tst.eu/model#Apollo2-7B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
