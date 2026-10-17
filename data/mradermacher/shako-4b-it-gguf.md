# mradermacher/Shako-4B-it-GGUF

## Resumen

Shako-4B-it-GGUF es la version cuantizada en formato GGUF del modelo anaspro/Shako-iraqi-4B-it, publicada por el usuario mradermacher, conocido en HuggingFace por generar cuantizaciones estaticas de modelos abiertos. Se trata de un ajuste fino orientado a conversacion en dialecto arabe iraqi, construido sobre una base de la familia Gemma 3n (segun el tag `gemma3n` de la model card) y entrenado con el dataset `anaspro/iraqi_dataset_100k`. El objetivo es ofrecer un asistente conversacional que entienda y genere arabe iraqi, un registro poco cubierto por los modelos multilingues genericos, manteniendo ademas competencia en ingles.

El repositorio contiene unicamente pesos cuantizados, no el modelo original: el autor del ajuste fino es anaspro y mradermacher solo realiza la conversion a GGUF y la generacion de las distintas variantes de cuantizacion. Aunque el nombre comercial del modelo indica "4B", el recuento real de parametros en safetensors es de 6.866.172.400, lo que es coherente con las arquitecturas tipo Gemma 3n, donde el numero de parametros efectivos difiere del total almacenado.

La relevancia de esta ficha es practica: permite ejecutar un modelo conversacional especializado en arabe iraqi en hardware de consumo mediante llama.cpp u Ollama, algo imposible con los pesos completos en precision 16 bits. El repositorio acumula 95 descargas y 1 like en el momento de la consulta, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, base de la familia Gemma 3n (tag `gemma3n`); ajuste fino con Unsloth (tag `unsloth`) |
| Parametros totales | 6.866.172.400 (segun safetensors del modelo base); el nombre comercial indica "4B" |
| Parametros activos | no disponible (el tag `gemma3n` sugiere parametros condicionales tipo MatFormer, pero la model card no lo detalla) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles), ar (arabe, con especializacion en dialecto iraqi) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base, pero los tags incluyen `gemma3n`, lo que apunta a que anaspro/Shako-iraqi-4B-it parte de una arquitectura de la familia Gemma 3n. Esta familia se caracteriza por el uso de tecnicas de parametros condicionales (MatFormer) y per-layer embeddings, de ahi que el recuento real de parametros en safetensors (6,87 mil millones) no coincida con el "4B" del nombre, que probablemente hace referencia a los parametros efectivos movilizados durante la inferencia. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni mecanismos concretos de atencion en la documentacion proporcionada.

En cuanto al entrenamiento, la model card unicamente declara el dataset `anaspro/iraqi_dataset_100k`, de nombre autoexplicativo (aproximadamente 100.000 ejemplos), y el tag `unsloth`, que indica que el ajuste fino se realizo con la libreria Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, ni si se aplicaron fases de RLHF, DPO o cualquier otra tecnica de alineacion. Tampoco se documenta ninguna innovacion tecnica adicional mas alla de la propia cuantizacion a GGUF.

## Capacidades

- Generacion de texto conversacional en arabe (con orientacion al dialecto iraqi) e ingles.
- Comprension y produccion de dialecto iraqi, un registro poco habitual en modelos multilingues genericos.
- Conversacion multi-turno en formato chat, segun los tags `conversational` y `text-generation-inference`.
- Compatibilidad declarada con endpoints y con el ecosistema transformers en su version base (no en la version GGUF).
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada (aunque el prefijo `gemma3n` podria implicar multimodalidad en la familia base, no se confirma para este ajuste).
- Capacidades de agentes y razonamiento multi-paso: no documentadas.

## Casos de uso

- Atencion al cliente en arabe iraqi: un asistente conversacional que responda a usuarios en su dialecto local en lugar del arabe estandar, mejorando la tasa de comprension y reduciendo la friccion en sectores como telecomunicaciones, banca o comercio electronico en Iraq.
- Traduccion asistida arabe iraqi a ingles: dado que el modelo esta entrenado en ambos idiomas, puede utilizarse como base para tareas de traduccion o para generar pares de datos de entrenamiento adicionales en ese par de idiomas.
- Clasificacion y enrutado de mensajes de soporte: el modelo puede procesar conversaciones entrantes y categorizarlas por tematica antes de derivarlas a un humano, gracias a su capacidad de mantener contexto conversacional.
- Despliegue en local o en el borde: con cuantizaciones de 4,2 GB (Q4_K_S) o 4,3 GB (Q4_K_M), es posible ejecutarlo en portatiles con GPU de 8 GB de VRAM o incluso en CPU, ideal para escenarios con requisitos estrictos de privacidad de datos.
- Generacion de contenido en redes sociales y marketing localizado: redaccion de textos promocionales en dialecto iraqi, un registro que los modelos genericos rara vez reproducen con naturalidad.
- Prototipado e investigacion academica: al ser un modelo pequeno con licencia Apache 2.0, sirve como punto de partida para experimentos de ajuste fino, evaluacion dialectal o comparativas de cuantizacion sin necesidad de grandes presupuestos de computo.
- Educacion y asistencia linguistica: apoyo a estudiantes o hablantes no nativos que necesiten practicar o comprender arabe iraqi.
- Sistemas de transcripcion-anonimizacion en combinacion con ASR: el modelo puede recibir texto ya transcrito y reformular, resumir o anonimizar conversaciones en dialecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio cuantizado no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, AraBench u otros) ni comparaciones numericas con modelos similares. Tampoco se documentan mediciones de perplejidad de las cuantizaciones, mas alla de la referencia generica al grafico de ikawrakow sobre calidad de cuantizaciones enlazado en el README.

## Requisitos de hardware

- VRAM estimada por cuantizacion (tamano de fichero + overhead de contexto y runtime de aproximadamente 1-1,5 GB):
  - Q2_K: ~2,9 GB de fichero, ~4-4,5 GB en ejecucion.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~3,4-3,7 GB de fichero, ~4,5-5 GB en ejecucion.
  - IQ4_XS: ~4,0 GB, ~5-5,5 GB en ejecucion.
  - Q4_K_S / Q4_K_M: ~4,2-4,3 GB, ~5,5-6 GB en ejecucion (recomendadas por el autor por equilibrio calidad/velocidad).
  - Q5_K_S / Q5_K_M: ~5,0 GB, ~6,5 GB en ejecucion.
  - Q6_K: ~5,8 GB, ~7,5 GB en ejecucion.
  - Q8_0: ~7,5 GB, ~9 GB en ejecucion.
  - f16: ~13,8 GB, ~15-16 GB en ejecucion.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para cuantizaciones Q4 y Q5 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). Para f16 se recomienda al menos 16 GB de VRAM (RTX 4080/4090, A100 40 GB, H100).
- Cabe en GPU de consumo: si, desde cuantizaciones Q2_K hasta Q8_0 en GPUs de 8-12 GB. La version f16 tambien cabe en GPUs de gama alta con 16 GB o mas.
- Despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, KoboldCpp y otros frontends compatibles con GGUF. El tag `text-generation-inference` del modelo base sugiere compatibilidad con TGI, aunque no se detalla en la model card para el formato GGUF.
- Latencia y throughput: no disponibles. El autor etiqueta Q4_K_S, Q4_K_M y Q8_0 como "fast", pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar el repositorio cuantizado con su modelo base. No se documentan alternativas equivalentes en la misma categoria (modelos especializados en dialecto arabe iraqi) dentro de la informacion disponible.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Shako-4B-it-GGUF | 6.866.172.400 (total, segun safetensors del base) | no disponible | GGUF (f16 a Q2_K) | apache-2.0 | HuggingFace, 95 descargas, 1 like |
| anaspro/Shako-iraqi-4B-it (base) | 6.866.172.400 | no disponible | safetensors | apache-2.0 | HuggingFace |
| Otros modelos de dialecto iraqi | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan evaluaciones de sesgo. Al estar entrenado predominantemente con un dataset de dialecto iraqi, puede reflejar sesgos culturales, politicos o religiosos presentes en los datos de origen.
- Riesgo de alucinacion: como cualquier modelo generativo de ~4B parametros efectivos, es propenso a inventar informacion, especialmente en tareas de conocimiento factual o razonamiento complejo.
- Longitud de contexto no documentada: se desconoce si soporta ventanas largas, lo que limita su uso en tareas que requieran analizar documentos extensos sin verificacion previa.
- Cobertura idiomatica limitada a ingles y arabe (con foco en el dialecto iraqi). El rendimiento en otros dialectos arabes o en castellano no esta garantizado ni documentado.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan notablemente la calidad; el propio autor advierte que Q3_K_M es de "lower quality" y recomienda Q4_K_S, Q4_K_M o Q8_0.
- La model card no especifica detalles del dataset de entrenamiento (composicion, filtrado, presencia de datos personales), lo que dificulta evaluar su idoneidad para entornos regulados.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base y del dataset original antes de desplegarlo en produccion, ya que la model card no las detalla.
- Los pesos originales en precision completa estan sujetos a la licencia de Gemma 3n (familia con condiciones de uso propias de Google), que no se menciona en este repositorio y que podria imponer restricciones adicionales.
- Repositorio con muy poca traccion (95 descargas, 1 like): no hay evidencia de adopcion ni de validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Shako-4B-it-GGUF
- Modelo base: https://huggingface.co/anaspro/Shako-iraqi-4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/anaspro/iraqi_dataset_100k
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Shako-4B-it-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
