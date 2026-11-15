# mradermacher/qwen2.5-coder-32b-heretic-swe-sft-GGUF

## Resumen

`mradermacher/qwen2.5-coder-32b-heretic-swe-sft-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `PeetPedro/qwen2.5-coder-32b-heretic-swe-sft`, un ajuste fino derivado de la familia Qwen2.5-Coder-32B de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF para inferencia local con llama.cpp y ecosistemas compatibles. El modelo base hereda la arquitectura transformer densa de Qwen2.5-Coder y anade un ajuste orientado a tareas de ingenieria de software (SWE) y un proceso de "abliteration" o eliminacion de rechazos (de ahi el sufijo "heretic").

El interes practico de esta publicacion es que permite ejecutar en hardware de consumo un modelo de 32.763.876.352 parametros en formatos que van desde 12,4 GB (Q2_K) hasta 34,9 GB (Q8_0), manteniendo la licencia Apache 2.0 del modelo original. Es relevante para desarrolladores que quieren un asistente de codigo local con capacidad de razonamiento sobre repositorios y sin dependencia de APIs externas, aunque con las salvedades propias de un modelo derivado y de un ajuste fino no documentado en detalle.

La informacion disponible sobre el modelo base es escasa: la model card del repositorio GGUF se limita a listar las cuantizaciones y no detalla el dataset de ajuste fino, los hiperparametros ni los resultados de evaluacion del derivado. Por tanto, esta ficha distingue explicitamente entre los datos verificables del repositorio y las caracteristicas conocidas de la familia Qwen2.5-Coder-32B, que se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5-Coder-32B) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-32B soporta hasta 131.072 tokens, dato no confirmado para este derivado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 32.763.876.352 parametros, heredado de Qwen2.5-Coder-32B. La model card del repositorio GGUF no aporta informacion sobre la arquitectura interna mas alla del nombre del modelo base, por lo que los detalles de atencion, normalizacion o tokenizador deben consultarse en la ficha del modelo original de Qwen. El repositorio indica que las cuantizaciones son "estaticas" (sin imatrix), y que existe una variante con cuantizaciones ponderadas por imatrix en `mradermacher/qwen2.5-coder-32b-heretic-swe-sft-i1-GGUF`, que suele ofrecer mejor calidad por bit en tamanos pequenos.

Respecto al entrenamiento del derivado `PeetPedro/qwen2.5-coder-32b-heretic-swe-sft`, la informacion disponible no detalla el numero de tokens de ajuste fino, la composicion del dataset SWE ni si se aplico RLHF o DPO. El sufijo "heretic" sugiere un proceso de abliteration orientado a reducir rechazos, y "swe-sft" indica un ajuste supervisado sobre tareas de ingenieria de software, pero no se han publicado cifras verificables en la informacion proporcionada. No se debe asumir que las capacidades del modelo base se conservan intactas tras el ajuste.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada de la familia Qwen2.5-Coder (la model card no lista lenguajes concretos para este derivado).
- Razonamiento sobre tareas de ingenieria de software (SWE), segun el ajuste fino indicado en el nombre del modelo base.
- Conversacion multi-turno (tag `conversational` en el repositorio).
- Inferencia local mediante llama.cpp y ecosistemas compatibles con GGUF (Ollama, LM Studio, entre otros).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidad de tool calling y function calling: no confirmada para este derivado en la informacion disponible.
- Capacidades de agente multi-paso: no confirmadas para este derivado.
- Capacidades multilingues: la model card declara unicamente `en`; no se confirma soporte de castellano u otros idiomas para este ajuste.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo y usarse para autocompletado y generacion de funciones, aprovechando la cuantizacion Q4_K_M (20,0 GB) si se dispone de VRAM o RAM suficiente.
- Revision de parches en flujos de integracion continua: con un contexto amplio (heredado del modelo base, pendiente de confirmar), puede analizar diffs y sugerir correcciones antes de fusionar, siempre con supervision humana.
- Generacion de tests unitarios: el ajuste SWE lo hace adecuado para proponer casos de prueba a partir de firmas de funciones y codigo existente.
- Refactorizacion asistida: puede reescribir modulos completos manteniendo la semantica, util en migraciones de version de dependencias.
- Explicacion de codigo heredado: dado un repositorio o fragmento, el modelo puede resumir la logica y senalar riesgos, como apoyo a la incorporacion de nuevos desarrolladores.
- Prototipado sin conexion: en entornos con requisitos de confidencialidad, la version Q4_K_S (18,9 GB) permite trabajar con codigo propietario sin enviar datos a APIs externas.
- Experimentacion con modelos "sin rechazos": para investigadores que estudian el comportamiento de modelos abliterated, este derivado permite comparar respuestas frente al Qwen2.5-Coder original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni SWE-bench para este derivado, y no se deben extrapolar los resultados del Qwen2.5-Coder-32B original sin verificacion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (segun los tamanos publicados): Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,0 GB; Q3_K_L 17,3 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 20,0 GB; Q5_K_S 22,7 GB; Q5_K_M 23,4 GB; Q6_K 27,0 GB; Q8_0 34,9 GB.
- GPU recomendadas: no especificadas por el autor. Para Q4_K_M (20,0 GB) se necesita al menos una GPU de 24 GB (RTX 3090, RTX 4090) o repartir entre GPU y RAM. Para Q8_0 (34,9 GB) se requiere una A100 40 GB, H100 o configuracion multi-GPU.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM usando cuantizaciones Q2_K a Q4_K_M; las cuantizaciones Q5 y superiores exigen descarga a RAM o hardware profesional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere uso detras de servidores de inferencia compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen2.5-coder-32b-heretic-swe-sft (este, GGUF) | 32,76 B | no disponible | Apache 2.0 | GGUF | Ajuste SWE + abliteration; cuantizaciones de 12,4 a 34,9 GB |
| Qwen2.5-Coder-32B-Instruct (original) | 32,5 B aprox. | 131.072 tokens (segun ficha oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo de referencia sin abliteration ni ajuste SWE adicional |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (MoE, 2,4 B activos) | 128.000 tokens (segun ficha oficial) | Licencia propia de DeepSeek | safetensors, GGUF | Alternativa MoE mas ligera en activaciones |
| Codestral-22B | 22 B | 32.000 tokens (segun ficha oficial) | Licencia no comercial en su version inicial | safetensors | Enfocado a codigo, con restricciones de uso comercial |

Los datos de los modelos comparables provienen de sus fichas oficiales y no de la informacion proporcionada para este repositorio; se incluyen como referencia de categoria.

## Limitaciones y advertencias

- El ajuste "heretic" (abliteration) reduce los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido danino, codigo inseguro o respuestas sin las salvaguardas del modelo original. No se recomienda su uso en produccion orientada a usuarios finales sin filtros adicionales.
- No hay benchmarks publicados para este derivado; el rendimiento real en tareas SWE es incierto y debe validarse en el dominio concreto de uso.
- La model card declara unicamente ingles; el soporte de castellano no esta confirmado y puede degradarse respecto al modelo base.
- La longitud de contexto efectiva no esta documentada para este ajuste; no se debe asumir el contexto completo del Qwen2.5-Coder-32B original.
- Riesgo de alucinacion de APIs, funciones y dependencias inexistentes, comun en modelos de codigo; requiere verificacion con compilacion y tests.
- El repositorio tiene 133 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor del ajuste fino no documenta los datos de entrenamiento; conviene revisar la procedencia del dataset SWE antes de un despliegue comercial.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda IQ4_XS o superior, y preferiblemente la variante imatrix (`-i1-GGUF`).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen2.5-coder-32b-heretic-swe-sft-GGUF
- Modelo base del ajuste: https://huggingface.co/PeetPedro/qwen2.5-coder-32b-heretic-swe-sft
- Variante con cuantizaciones imatrix: https://huggingface.co/mradermacher/qwen2.5-coder-32b-heretic-swe-sft-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#qwen2.5-coder-32b-heretic-swe-sft-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
