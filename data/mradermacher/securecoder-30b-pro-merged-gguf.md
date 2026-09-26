# mradermacher/securecoder-30b-pro-merged-GGUF

## Resumen

SecureCoder-30B-Pro-Merged-GGUF es la version cuantizada en formato GGUF del modelo Taimwe/securecoder-30b-pro-merged, publicada por el usuario mradermacher, conocido en HuggingFace por generar cuantizaciones estaticas de modelos abiertos. El modelo original es un merge de pesos (no un entrenamiento desde cero) construido sobre la familia Qwen3, segun los tags declarados, con orientacion a generacion de codigo, tool calling y seguridad informatica. Cuenta con 30.532.122.624 parametros totales (unos 30,5 mil millones) y arquitectura de mezcla de expertos (MoE) segun los metadatos.

El valor practico de este repositorio no esta en el modelo en si, sino en la disponibilidad de 10 cuantizaciones GGUF listas para usar con llama.cpp, Ollama o cualquier runtime compatible con el formato, con tamanos que van desde 11,4 GB (Q2_K) hasta 32,6 GB (Q8_0). Esto permite desplegar un modelo de 30,5 B en hardware de consumo, algo inviable con los pesos originales en safetensors.

Es relevante ahora porque cubre un nicho concreto: asistentes de codigo con foco en seguridad y soporte de tool calling, ejecutables en local. No obstante, el repositorio no incluye model card del modelo base mas alla de los tags, no publica resultados de benchmarks y no tiene descargas ni likes en el momento de redactar esta ficha, por lo que su validacion por la comunidad es nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), familia Qwen3 segun tags |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | no disponible (el tag `moe` confirma la arquitectura, pero no se especifica el numero de expertos ni los parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no aporta informacion sobre el proceso de entrenamiento del modelo base. Los unicos datos tecnicos disponibles son los tags declarados: `qwen3`, `moe`, `merge`, `code`, `tool-calling` y `security`. El tag `merge` indica que Taimwe/securecoder-30b-pro-merged se construyo combinando los pesos de dos o mas modelos mediante alguna tecnica de fusion (suma, SLERP, TIES, DARE u otras), no mediante entrenamiento adicional. No se especifica que modelos se fusionaron, ni la composicion del dataset, ni si hubo fases de RLHF, DPO o SFT.

El repositorio que nos ocupa es una cuantizacion estatica generada con llama.cpp. La model card indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, y que el autor no garantiza que vayan a publicarse. El proceso de cuantizacion es de tipo `hf` con `output_tensor_quantised: 1`, segun los comentarios internos del README. No se documenta ninguna innovacion tecnica propia (atencion lineal, decodificacion especulativa o similar).

## Capacidades

Las siguientes capacidades se derivan exclusivamente de los tags y del nombre del modelo, no de documentacion tecnica verificada:

- Generacion de codigo en ingles, con enfasis declarado en codigo seguro (el nombre del modelo incluye "secure").
- Tool calling / function calling, segun el tag `tool-calling`.
- Razonamiento multi-paso orientado a agentes, presumiblemente derivado de la base Qwen3.
- Capacidades multilingues limitadas al ingles (`language: en` en la model card).
- Capacidades de asistencia en seguridad informatica (tag `security`), sin especificar si cubre analisis de vulnerabilidades, generacion de parches o auditoria.

No hay informacion disponible sobre modo thinking, vision, audio, ni sobre el soporte real de contexto largo mas alla de lo que herede del modelo base.

## Casos de uso

- Asistente de revision de codigo en local: el modelo puede analizarse pull requests completos en un equipo de desarrollo sin enviar codigo propietario a APIs externas, gracias a que las cuantizaciones Q4_K_S (17,6 GB) y Q4_K_M (18,7 GB) caben en una GPU de 24 GB.
- Generacion de codigo en pipelines de CI/CD: con soporte declarado de tool calling, puede integrarse como paso automatizado que propone parches ante fallos de tests, ejecutandose en un runner con GPU o incluso en CPU con la cuantizacion Q2_K (11,4 GB).
- Auditoria estatica asistida: dado su enfoque declarado en seguridad, es un candidato para revisar fragmentos de codigo en busca de patrones inseguros (inyeccion SQL, deserializacion insegura, manejo de secretos), siempre con supervision humana y validacion posterior.
- Formacion y practica de desarrollo seguro: al ser un modelo de 30,5 B ejecutable en hardware de consumo, puede desplegarse en un portatil con GPU de 16-24 GB para que estudiantes experimenten con analisis de codigo sin coste de API.
- Prototipado de agentes de codigo multi-paso: la combinacion de tool calling y arquitectura MoE permite construir agentes que alternan generacion de codigo con llamadas a herramientas (ejecutar tests, consultar documentacion) a un coste de computo por token inferior al de un modelo denso del mismo tamano.
- Automatizacion de tareas de refactorizacion en repositorios privados: al ejecutarse on-premise, cumple con requisitos de confidencialidad que impiden usar servicios en la nube.
- Despliegue en entornos con GPU limitada: las variantes Q2_K y Q3_K_S (11,4 y 13,4 GB) permiten servir el modelo en tarjetas de 12-16 GB, un escenario imposible con los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda web proporcionan cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion estandar, ni para el modelo cuantizado ni para el modelo base Taimwe/securecoder-30b-pro-merged.

## Requisitos de hardware

- VRAM estimada para los pesos, segun cuantizacion: Q2_K 11,4 GB; Q3_K_S 13,4 GB; Q3_K_M 14,8 GB; Q3_K_L 16,0 GB; Q4_K_S 17,6 GB; Q4_K_M 18,7 GB; Q5_K_S 21,2 GB; Q5_K_M 21,8 GB; Q6_K 25,2 GB; Q8_0 32,6 GB. A estas cifras hay que sumar el cache KV, cuyo tamano depende de la longitud de contexto configurada y que no se puede estimar sin conocer el numero de capas y cabezas.
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q6_K, una RTX A6000 48 GB o dos GPU de 24 GB; para Q4_K_M y Q4_K_S, una RTX 4090, RTX 3090 o L40S de 24 GB; para Q3_K_S y Q2_K, tarjetas de 12-16 GB.
- Cabe en GPU de consumo: si. Q4_K_M (18,7 GB) entra en una RTX 4090 o RTX 3090 de 24 GB con margen para contexto moderado. Q2_K (11,4 GB) entra en una RTX 3060 de 12 GB, aunque con calidad degradada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF para inferencia local. Para servidores con mayor concurrencia, vLLM y TGI, aunque en el momento de redactar esta ficha no se documenta soporte oficial de estos ultimos para esta arquitectura MoE concreta.
- Latencia y throughput: no disponible. Al tratarse de una arquitectura MoE, el coste computacional por token deberia ser inferior al de un modelo denso de 30,5 B, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| securecoder-30b-pro-merged (GGUF) | 30,5 B (MoE) | no disponible | Apache 2.0 | GGUF | no disponible |
| Taimwe/securecoder-30b-pro-merged | 30,5 B (MoE) | no disponible | Apache 2.0 | safetensors | no disponible |
| Qwen2.5-Coder-32B-Instruct | 32,5 B (denso) | 131.072 tokens | Apache 2.0 | safetensors, GGUF (comunidad) | si, publicados por el autor |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B totales / 2,4 B activos (MoE) | 128.000 tokens | licencia propia de DeepSeek | safetensors, GGUF (comunidad) | si, publicados por el autor |

Las especificaciones de las dos alternativas provienen de informacion publica de sus respectivos autores, no de la busqueda web realizada para esta ficha. No es posible comparar rendimiento porque el modelo objeto de la ficha no tiene benchmarks publicados. En cualquier caso, la comparacion directa con Qwen2.5-Coder-32B-Instruct es la mas pertinente por tamano y licencia.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`). No hay evidencia de capacidades en castellano u otros idiomas.
- No hay benchmarks publicados, ni del modelo cuantizado ni del modelo base. Cualquier afirmacion sobre su calidad es especulativa.
- El repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, por lo que no existe validacion independiente por parte de la comunidad.
- Al ser un merge y no un entrenamiento controlado, el comportamiento del modelo puede ser menos predecible que el de un modelo entrenado de forma estandar: es habitual que los merges produzcan respuestas inconsistentes o degradacion en algunas tareas.
- No se documentan sesgos conocidos, pero un modelo entrenado mayoritariamente con codigo en ingles hereda los sesgos presentes en ese corpus.
- Riesgo de alucinacion relevante en un modelo orientado a seguridad: puede generar codigo que parezca correcto y contener vulnerabilidades. No debe usarse como unico mecanismo de auditoria ni desplegarse codigo sin revision humana.
- Las cuantizaciones de menor tamano (Q2_K, Q3_K_S) degradan la calidad de forma notable respecto a los pesos originales, especialmente en tareas de razonamiento y generacion de codigo complejo.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero se aplica al artefacto publicado; conviene verificar la licencia de los modelos fusionados en el merge original, que no se documenta.
- No se especifica la longitud de contexto soportada, dato critico para planificar despliegues con ventanas largas.
- No hay informacion sobre si el modelo respeta plantillas de chat concretas ni sobre el formato exacto de tool calling esperado, lo que puede complicar su integracion en pipelines existentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/securecoder-30b-pro-merged-GGUF
- Modelo base (safetensors): https://huggingface.co/Taimwe/securecoder-30b-pro-merged
- Cuantizacion alternativa del mismo modelo base: https://huggingface.co/Taimwe/securecoder-30b-pro-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#securecoder-30b-pro-merged-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
