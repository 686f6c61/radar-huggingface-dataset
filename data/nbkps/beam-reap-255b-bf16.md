# nbKPS/beam-reap-255b-bf16

## Resumen

Beam-1.0-REAP-255B-A23B es una version podada al 50 % del modelo Mixture-of-Experts (MoE) Beam-1.0-501B-A23B de Reflection, publicada por el usuario nbKPS en HuggingFace. La poda se ha realizado con REAP (Router-weighted Expert Activation Pruning), una tecnica de compresion one-shot para MoE desarrollada por Cerebras (Lasby et al., 2025). No es una release oficial de Reflection: se trata de un checkpoint derivado que conserva intactas todas las partes no expertas del modelo original (atencion, capas densas, embeddings, LM head, tokenizer y plantilla de chat).

El modelo reduce los parametros totales de 501,27B a 254,61B eliminando la mitad de los expertos enrutados de cada una de las 49 capas MoE (de 256 a 128 expertos por capa), manteniendo constante el numero de parametros activos por token en aproximadamente 23B. Es relevante porque demuestra que es posible recortar a la mitad el peso en disco y memoria de un MoE de gran escala con una degradacion medida relativamente contenida en modelado de lenguaje: un incremento de NLL de +0,107 nats (+8,9 % relativo) sobre 138.753 tokens de validacion.

La relevancia practica esta en el ahorro de memoria: el checkpoint en BF16 ocupa unos 510 GB de memoria de acelerador, frente a aproximadamente 1 TB del original, lo que facilita su despliegue en nodos de 8 GPU de 80 GB. Ahora bien, el autor advierte explicitamente de que no se han ejecutado benchmarks downstream ni pruebas de generacion larga, por lo que las cifras de calidad se limitan a language modelling teacher-forced.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con enrutamiento grouped top-k; 49 capas MoE y 3 capas densas |
| Parametros totales | 254.610.418.240 (254,61B) |
| Parametros activos | ~23B por token (sin cambios respecto al original) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); repo de 509,3 GB |
| Expertos por capa MoE | 128 (original: 256) |
| Expertos por token (top-k) | 8 |
| Grupos de expertos / grupos por token | 8 / 4 (16 expertos por grupo) |
| Libreria | transformers (BeamForCausalLM, transformers>=5.20) |

## Arquitectura y entrenamiento

La arquitectura es la del Beam-1.0 original de Reflection: un transformer MoE con 49 capas MoE y 3 capas densas, enrutamiento grouped top-k con 8 grupos de expertos, seleccion de 4 grupos por token y top-8 expertos activados. La poda REAP actua exclusivamente sobre los expertos enrutados: para cada experto j de cada capa se calcula una saliencia S_j como la media, sobre los tokens enrutados a j, del producto entre el peso de puerta normalizado g_j(x) y la norma L2 de la salida del experto E_j(x). La saliencia se acumulo con un forward pass con streaming por capas del modelo original sobre aproximadamente 925.000 tokens de una mezcla de calibracion equilibrada, ponderada hacia codigo y uso agentico, formateada con la plantilla de chat de Beam.

Para preservar la validez del enrutador agrupado se conservaron los 16 expertos de mayor saliencia dentro de cada grupo, dejando 128 expertos por capa con n_group=8. Los pesos del router y el e_score_correction_bias se recortan a los expertos conservados manteniendo su orden; num_experts_per_tok, topk_group y routed_scaling_factor no cambian. El autor justifica esta eleccion frente a un top-128 global: la seleccion global habria dejado grupos con entre 9 y 25 expertos (no representables por el router agrupado) y, ademas, habria coincidido en 118,4 de 128 expertos por capa de media (minimo 113) con la seleccion por grupos. No se documenta en la informacion disponible ningun reentrenamiento, RLHF ni DPO adicional sobre el checkpoint podado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Beam-1.0-501B-A23B.
- Razonamiento y generacion de codigo: la mezcla de calibracion se pondero hacia codigo y uso agentico, por lo que se espera retencion relativamente alta en estos dominios.
- Capacidades de agente y razonamiento multi-paso: el autor menciona "agent use" como dominio objetivo de la calibracion, aunque no se aportan evaluaciones especificas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no se confirma ni se descarta).
- Capacidades multilingues: limitadas; el modelo declara solo ingles y el autor advierte de posible perdida en texto multilingue por estar subrepresentado en los datos de saliencia.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de gran escala con presupuesto de memoria reducido: con 254,61B en BF16 (~510 GB) el modelo puede servirse en un nodo de 8 GPU de 80 GB, mientras que el original de 501B requiere aproximadamente el doble de memoria.
- Generacion de codigo en pipelines de desarrollo: al haberse ponderado la calibracion hacia codigo, es el escenario donde se espera menor degradacion; puede integrarse en asistentes de autocompletado o revision siempre que se validen las salidas con tests.
- Prototipado de agentes conversacionales en ingles: el modelo conserva la plantilla de chat y el tokenizer originales, por lo que puede sustituir al Beam-1.0 completo en entornos de investigacion sobre razonamiento multi-paso con menor coste de infraestructura.
- Investigacion sobre compresion de MoE: el repositorio incluye reap_saliency.json con las puntuaciones por capa, los conteos de enrutamiento y los indices de expertos conservados, lo que permite reproducir y analizar el proceso de poda.
- Servicio de texto conversacional en ingles con vLLM: el autor indica compatibilidad con la implementacion de Beam en vLLM, lo que permite desplegar el modelo con el mismo stack que el original.
- Evaluacion comparativa de tecnicas de poda: sirve como referencia practica para medir el impacto de REAP frente a otras estrategias de compresion one-shot de MoE en tareas de modelado de lenguaje.

## Benchmarks y rendimiento

El autor solo publica metricas de next-token NLL y perplejidad sobre 160 muestras de validacion (138.753 tokens puntuados, disjuntas de las usadas para calcular la saliencia), calculadas con el norm final, LM head y logit softcap reales.

| Metrica | Original (501B) | REAP 50 % (255B) |
|---|---|---|
| NLL | 1,201 | 1,308 |
| Perplejidad | 3,32 | 3,70 |
| Incremento de NLL | — | +0,107 nats (+8,9 % relativo) |
| Divergencia KL media por token respecto al original | — | 0,27 nats |
| Coincidencia en top-1 next-token | — | 84,7 % de las posiciones |

No se han publicado resultados de benchmarks downstream (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 510 GB en BF16 para los pesos, segun indica el autor. No se documentan requisitos para otras precisiones.
- GPU recomendadas: nodos multi-GPU de clase datacenter; con 8 GPU de 80 GB (H100, A100 80 GB) se cubre el peso del modelo en BF16, aunque el margen para cache KV y activaciones depende de la longitud de contexto, que no se especifica.
- GPU de consumo: no cabe en ninguna GPU consumer actual en BF16; no se han publicado cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: transformers (BeamForCausalLM, transformers>=5.20) y la implementacion de Beam en vLLM. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Beam-1.0-REAP-255B-A23B (este) | 254,61B | ~23B | no disponible | Apache-2.0 | Podado al 50 % con REAP; NLL 1,308 / PPL 3,70 |
| Beam-1.0-501B-A23B (original) | 501,27B | ~23B | no disponible | Apache-2.0 | Modelo base; NLL 1,201 / PPL 3,32 |
| Otras variantes podadas de Beam | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos alternativos de la misma categoria (mismo tamano o misma tarea) para una comparacion mas amplia.

## Limitaciones y advertencias

- Perdida de calidad medible: el incremento de NLL de +0,107 nats y la divergencia KL media de 0,27 nats indican degradacion respecto al original, aunque no se han evaluado tareas downstream.
- Riesgo concentrado en dominios subrepresentados: el autor advierte de posible perdida de capacidad en texto multilingue o conocimiento de nicho, poco presentes en los datos de saliencia.
- Solo ingles: el modelo declara unicamente el idioma en, y no se documenta soporte multilingue.
- Sin evaluaciones de generacion larga: las metricas publicadas son teacher-forced de next-token; no hay pruebas de coherencia en generaciones extensas ni de seguridad.
- Checkpoint no oficial: no es una release de Reflection; el autor recomienda consultar la model card original para capacidades, uso previsto y evaluaciones de seguridad.
- Requisito de hardware elevado: ~510 GB en BF16 hacen inviable su uso en hardware de consumo y limitan el despliegue a nodos multi-GPU.
- Licencia Apache-2.0: permite uso comercial, pero al ser un derivado no oficial conviene revisar la politica de uso del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; debe asumirse el comportamiento del modelo base, potencialmente agravado por la poda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nbKPS/beam-reap-255b-bf16
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Blog de Reflection sobre Beam: https://reflection.ai/blog/introducing-beam
- Paper REAP: https://arxiv.org/abs/2510.13999
- Codigo REAP (Cerebras): https://github.com/CerebrasResearch/reap
- Sitio de Reflection: https://reflection.ai/
