# helmo/CLM-v0.1-8B

## Resumen

CLM-v0.1-8B (Contrastive Language Model) es un modelo contrastivo de tipo "System One" desarrollado por el equipo de Contrastive-LM (Jacky Kwok, Hangoo Kang, Tarun Suresh, Jon Saad-Falcon, Marco Pavone, Christopher Ré y Azalia Mirhoseini). No es un modelo generativo: se trata de un verificador y reranker que puntúa estados y acciones, construido a partir de un encoder Qwen3-8B congelado sobre el que se anaden dos cabezas de proyeccion (una cabeza de estado y otra de accion) entrenadas con una perdida InfoNCE bidireccional. La ficha de HuggingFace esta publicada bajo el usuario `helmo` y actua como espejo del checkpoint oficial de la organizacion Contrastive-LM.

El problema que resuelve es el coste de latencia en la toma de decisiones de agentes: en lugar de invocar un modelo de lenguaje completo para cada eleccion, CLM codifica el estado y las acciones por separado, lo que permite reutilizar los embeddings de accion en cache. Segun la model card, es capaz de igualar a Jev en tareas de computer-use, gaming y tool-calling en regimen zero-shot con hasta 9 veces menos latencia, y con aproximadamente 1000 candidatos llega a ser 13 veces mas rapido gracias al cacheo de estados y acciones.

El checkpoint se distribuye bajo licencia Apache 2.0 y esta orientado exclusivamente al ingles. Su relevancia actual radica en que propone una alternativa barata al paradigma de "LLM como juez" y al best-of-N con modelos generativos, con resultados de referencia en DeepSWE (81,6 %) y Terminal-Bench 2.1 (87,6 %) cuando las cabezas se ajustan finamente. Los autores anuncian una version multimodal CLM-35B como siguiente escalon de su "escalera de escalado".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer congelado (Qwen3-8B) mas dos cabezas de proyeccion (state head y action head) entrenadas con perdida InfoNCE bidireccional |
| Parametros totales | No disponible (el encoder base Qwen3-8B tiene 8B; el numero exacto de parametros de las cabezas no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens en la configuracion de referencia del encoder (`--max-model-len 2048`); no se documenta otra cifra para las cabezas |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (tanto las cabezas CLM-8B como el encoder base Qwen3-8B) |
| Formato de pesos | Checkpoint PyTorch (`CLM_v0.1-8B.pt`); el encoder se sirve aparte con vLLM en modo pooling |

## Arquitectura y entrenamiento

CLM-8B no genera texto. Su arquitectura consiste en un encoder Qwen3-8B congelado del que se extraen embeddings con last-token pooling, y sobre esos embeddings se aplican dos cabezas pequenas: una cabeza de estado (que codifica la situacion) y una cabeza de accion (que codifica los candidatos). Ambas se entrenan conjuntamente con una perdida contrastiva InfoNCE bidireccional que conecta estados y acciones. Como el encoder permanece congelado, solo se entrenan las cabezas, lo que abarata mucho el ajuste fino.

El entrenamiento se describe en tres fases: preentrenamiento con aproximadamente 60 millones de pares de preguntas y respuestas de Nemotron, entrenamiento intermedio con unos 30 millones de negativos duros sinteticos y postentrenamiento con alrededor de 1 millon de trayectorias agenticas. La innovacion tecnica destacable es el cacheo separado de estados y acciones: al codificarse de forma independiente, los embeddings de accion pueden reutilizarse entre consultas, lo que con unos 1000 candidatos reporta una velocidad 13 veces superior a la de Jev. El modelo admite preguntas tipadas (`Noul` para si/no, `Choice` para eleccion entre categorias con criterios textuales, `Score` para puntuacion sobre una escala), ademas del ranking de candidatos en texto libre.

## Capacidades

- Puntuacion y ranking de candidatos en texto libre (respuestas, nombres de herramientas, siguientes movimientos) mediante `Engine.rank`.
- Verificacion de soluciones en esquemas best-of-N: selecciona la mejor opcion de un conjunto dado.
- Preguntas tipadas sobre un estado: booleanas, de eleccion multiple con criterios y de puntuacion en escala, devolviendo distribuciones de probabilidad.
- Clasificacion y enrutamiento: por ejemplo, asignar un ticket al departamento correspondiente con su probabilidad asociada.
- Soporte de agentes: decisiones de computer-use, gaming y tool-calling, con rendimiento zero-shot comparable a Jev segun la model card.
- Reutilizacion de embeddings de accion en cache, pensada para entornos con muchos candidatos repetidos.
- Ajuste fino barato de las cabezas para tareas concretas (verificador especializado).
- No dispone de generacion de texto, vision, audio, ni modo de razonamiento explicito.

## Casos de uso

- Verificacion en agentes de computer-use: dado un estado de pantalla y varias acciones candidatas, CLM puntua cada una y devuelve la mas probable; es adecuado porque evita una llamada generativa completa por cada decision y reduce la latencia hasta 9 veces frente a Jev en zero-shot.
- Enrutamiento de tickets de atencion al cliente: con una pregunta de tipo `Choice` y criterios por departamento, el modelo devuelve, por ejemplo, `billing` con probabilidad 0,93878 y `technical` con 0,06122, lo que permite umbrales de derivacion a humano.
- Priorizacion y triaje de incidencias: usando preguntas `Noul` ("¿es urgente?") y `Score` ("nivel de frustracion"), se puede construir una cola priorizada sin entrenar un clasificador ad hoc.
- Seleccion de herramientas en pipelines de tool-calling: el modelo rankea los nombres de funciones disponibles para una consulta dada, integrable como paso previo a un LLM generativo que ejecute la llamada.
- Best-of-N en generacion de codigo: se generan N soluciones con un LLM y CLM actua como verificador para elegir la mejor; con cabezas ajustadas finamente alcanza 81,6 % en DeepSWE y 87,6 % en Terminal-Bench 2.1.
- Automatizacion de pruebas en CI/CD: verificar la trayectoria de un agente de terminal (Terminal-Bench) antes de aceptar un parche, filtrando ejecuciones erroneas con un coste de inferencia muy inferior al de un juez generativo.
- Evaluacion automatica de respuestas a gran escala: ranking de respuestas candidatas frente a una pregunta, con probabilidades relativas al conjunto evaluado, util como senal de calidad en pipelines de RLHF o filtrado de datos.
- Caching de acciones en entornos repetitivos: en simuladores o juegos con un catalogo de acciones estable, los embeddings de accion se calculan una sola vez y se reutilizan, con una mejora reportada de 13 veces con aproximadamente 1000 candidatos.
- Enrutamiento de consultas en motores de busqueda o RAG: reranking de pasajes o respuestas candidatas antes de pasarlas al modelo generativo.

## Benchmarks y rendimiento

Los unicos numeros publicados en la informacion disponible corresponden al checkpoint ajustado finamente como verificador, no a este checkpoint en zero-shot. Se reproduce la tabla con esa advertencia explicita.

| Benchmark | Resultado | Condiciones | Comparativa |
|---|---|---|---|
| DeepSWE | 81,6 % | Cabezas ajustadas finamente (verificador) | SOTA segun la model card |
| Terminal-Bench 2.1 | 87,6 % | Cabezas ajustadas finamente (verificador) | SOTA segun la model card |
| Computer-use, gaming y tool-calling | "A la par" con Jev | Zero-shot | Hasta 9 veces menos latencia que Jev |
| Verificador ajustado | — | — | 4-6 veces mas rapido que Jev |
| Ranking con ~1000 candidatos | — | Con cacheo de estados y acciones | 13 veces mas rapido que Jev |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de conocimiento general en la informacion disponible. Los autores indican que los resultados SOTA en benchmarks agenticos requieren ajuste fino de las cabezas y no se obtienen con este checkpoint en zero-shot.

## Requisitos de hardware

- El componente pesado es el encoder Qwen3-8B servido aparte con vLLM en modo pooling; en precision FP16 requiere del orden de 16 GB de VRAM, mas el espacio de cache KV para la longitud configurada.
- Las cabezas de CLM son ligeras: el repositorio de HuggingFace ocupa 0,1 GB, por lo que su coste de memoria es marginal frente al encoder.
- GPU recomendadas: no se documentan modelos concretos en la informacion disponible. Por tamano, el encoder de 8B en FP16 encaja en A100 40 GB, H100, L40S y RTX 4090 (24 GB), entre otras.
- Cabe en GPU de consumo (por ejemplo, RTX 4090 o RTX 3090 de 24 GB) en FP16 para el encoder; con cuantizaciones de menor precision el margen aumenta, aunque no se publican recetas de cuantizacion para este modelo.
- Opciones de despliegue: `vllm serve Qwen/Qwen3-8B --runner pooling --max-model-len 2048` como servidor de embeddings y `clm-serve` para la API y el playground web en el puerto 8700; el paquete cliente es `contrastive-lm`. No se documentan despliegues con llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo ni milisegundos por consulta. Las unicas cifras relativas son las comparaciones con Jev (hasta 9 veces menos latencia en zero-shot, 4-6 veces mas rapido como verificador ajustado y 13 veces mas rapido con unos 1000 candidatos y cacheo).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CLM-v0.1-8B | Verificador/reranker contrastivo sobre encoder congelado | Encoder de 8B mas cabezas (total no especificado) | 2048 tokens en la configuracion de referencia | DeepSWE 81,6 % y Terminal-Bench 2.1 87,6 % con cabezas ajustadas | Apache 2.0 | HuggingFace (`helmo/CLM-v0.1-8B`) y org Contrastive-LM |
| Jev | Modelo de decision para agentes (referencia citada por los autores) | No disponible | No disponible | Referencia base: CLM lo iguala en zero-shot y lo supera 4-6 veces en velocidad como verificador | No disponible | No disponible |
| Encoder Qwen3-8B sin cabezas | Encoder puro para embeddings | 8B | No disponible en esta informacion | No aplica como verificador | Apache 2.0 | HuggingFace (`Qwen/Qwen3-8B`) |
| Cross-encoders y reward models genericos de la misma categoria | Verificacion/reranking | Variable | Variable | No disponible | Variable | No disponible |

No se dispone de datos suficientes en la informacion proporcionada para una comparacion cuantitativa con alternativas de terceros distintas de Jev.

## Limitaciones y advertencias

- Encoder bloqueado: las cabezas requieren obligatoriamente embeddings last-token-pooled de Qwen3-8B; no son portables a otro encoder sin reentrenamiento.
- Sin generacion: el modelo solo puntua los candidatos que se le entregan y sus probabilidades son relativas a ese conjunto, no calibradas de forma absoluta.
- Los resultados SOTA en benchmarks agenticos (DeepSWE, Terminal-Bench 2.1) corresponden a cabezas ajustadas finamente, no a este checkpoint en zero-shot.
- Idioma: solo ingles segun los metadatos del repositorio; no hay soporte multilingue documentado.
- Contexto limitado a 2048 tokens en la configuracion de referencia del encoder, lo que restringe estados muy largos.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o comportamientos discriminatorios en la informacion disponible.
- Riesgo de error: al ser un modelo de decision y no generativo, sus fallos se manifiestan como rankings o clasificaciones incorrectas, y las probabilidades devueltas pueden ser excesivamente confiadas sobre conjuntos de candidatos mal disenados.
- Licencia Apache 2.0 permite uso comercial, pero el encoder base Qwen3-8B debe cumplir tambien su propia licencia Apache 2.0; conviene verificar los terminos antes de un despliegue en produccion.
- Discrepancia de publicacion: la ficha consultada esta bajo el usuario `helmo`, mientras que la model card referencia la organizacion Contrastive-LM; conviene confirmar el origen y la integridad del checkpoint antes de usarlo.
- El repositorio muestra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validacion externa de la comunidad.
- Se anuncia una version multimodal CLM-35B, lo que sugiere que este checkpoint de 8B puede quedar obsoleto a corto plazo.

## Enlaces

- HuggingFace: https://huggingface.co/helmo/CLM-v0.1-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de codigo: https://github.com/Contrastive-LM/CLM
- Guia de ajuste fino: https://github.com/Contrastive-LM/CLM/blob/main/docs/FINETUNING.md
- Blog (Notion): https://contrastive-lm.notion.site
- Discord: https://discord.gg/5dAQEDJBs
- Cabezas preentrenadas para DeepSWE: https://huggingface.co/Contrastive-LM/deepswe-clm-heads-8k
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados devueltos corresponden a sitios sin relacion con CLM ni con Qwen3.
