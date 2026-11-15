# jayasaisrikar/specter-finance-qa-e

## Resumen

SPECTER arm E es un ajuste fino del modelo CohereLabs/tiny-aya-global, publicado por el usuario jayasaisrikar como artefacto de investigación dentro de un estudio denominado SPECTER sobre seguridad en tareas de pregunta-respuesta financiera. No se trata de un modelo pensado para producción, sino de una de las ramas (arms) de un experimento controlado que mide la deriva de seguridad (safety drift) al aplicar fine-tuning sobre un modelo base multilingüe pequeño. La rama E aplica una pasada de reparación con el método ReSta (alpha 0,25) sobre el checkpoint de la rama B, que a su vez partía de tiny-aya-global.

El modelo tiene 3.349.227.520 parámetros totales según los pesos en safetensors, con un tamaño de repositorio de 6,7 GB, lo que corresponde a pesos fusionados en precisión de 16 bits. La arquitectura subyacente es la de tiny-aya-global (familia Cohere2, transformer decoder-only), y el ajuste se realizó mediante LoRA con r=16, alpha=32 y dropout 0,05 sobre siete módulos de atención y MLP, posteriormente fusionado en el modelo base para su publicación.

Su relevancia es metodológica más que de rendimiento: documenta de forma reproducible métricas de rechazo de peticiones dañinas en cinco idiomas, precisión financiera, abstención correcta, soporte de citas, fuga de canary e cumplimiento frente a inyección de prompts, con intervalos de confianza Wilson al 95 %. El propio autor advierte que ninguna rama del estudio supera la puerta de release y que el artefacto no debe usarse como asistente financiero en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Cohere2, base tiny-aya-global) |
| Parámetros totales | 3.349.227.520 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16 por el tamaño de 6,7 GB) |
| Idiomas soportados | no disponible en la model card; las evaluaciones cubren inglés, árabe, español, francés y tagalo |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de CohereLabs/tiny-aya-global, un transformer decoder-only de la familia Cohere2. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05 en siete módulos objetivo de atención y MLP, que después se fusionaron en los pesos base para la publicación. La rama E consiste en una pasada de reparación post-hoc con el método ReSta a alpha 0,25 sobre el checkpoint de la rama B, utilizando datos de entrenamiento del dataset jayasaisrikar/specter-finance-qa con una tasa de contaminación r=0,1 y semilla 0.

El entrenamiento es reproducible: el autor indica el commit de código e4ab0e9 (idéntico al del run v3, commit 9270331), un plan de evaluación con digest 070f6281ae9245f5a5e4df9a421fafd20be68fd94130ab2416d71068e61d6fbd (estado APPROVED) y un digest de holdout f196f08a8474fc57b3c7d9cdde4422441350a1e0a8b3da03ae8da03635ac3aa8. El comando de reproducción es `specter run --plan plans/finance-qa-v1.json` desde ese commit. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO; el método ReSta se describe únicamente como una pasada de reparación sobre el checkpoint previo.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas sobre dominio financiero, heredadas del ajuste sobre tiny-aya-global.
- Multilingüismo parcial: las evaluaciones cubren inglés, árabe, español, francés y tagalo, aunque la model card no declara una lista oficial de idiomas soportados.
- Comportamiento de rechazo (refusal) ante peticiones dañinas, medido con el juez WildGuard en cinco idiomas.
- Abstención ante información ausente: la métrica `correct_abstention` mide si el modelo declina responder cuando el ledger no contiene la cifra solicitada.
- Soporte de citas: la métrica `citation_support` evalúa si las respuestas se apoyan en las fuentes proporcionadas.
- Robustez frente a inyección de prompts: la métrica `injection_compliance` (menor es mejor) mide la tasa de obediencia a instrucciones inyectadas.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre safety drift: comparar la rama E con las ramas B0 y C para medir cuánto recupera una pasada ReSta de reparación tras un fine-tuning con datos adversariales, usando el mismo holdout congelado y los mismos intervalos de confianza.
- Reproducción de experimentos de alineación: ejecutar `specter run --plan plans/finance-qa-v1.json` desde el commit e4ab0e9 para regenerar las métricas publicadas y verificar la reproducibilidad del pipeline.
- Evaluación de métodos de reparación post-hoc: usar ReSta a alpha 0,25 como línea base frente a otras técnicas de recuperación de seguridad sobre checkpoints ya ajustados.
- Estudio de multilingüismo en rechazos: analizar la disparidad entre la tasa de rechazo en inglés (49,5 %) y en árabe (22,0 %), español (26,0 %), francés (32,0 %) y tagalo (16,0 %), teniendo en cuenta que WildGuard no está validado fuera del inglés.
- Análisis de confabulación financiera: emplear la métrica `correct_abstention` (27/40) para estudiar por qué el modelo tiende a inventar cifras en lugar de declinar cuando el ledger carece del dato.
- Benchmarking de robustez frente a inyección de prompts: utilizar `injection_compliance` (35/40, menor es mejor) como referencia para comparar defensas en modelos pequeños de dominio financiero.
- Docencia y formación en evaluación de modelos: usar el artefacto y su plan de evaluación versionado como ejemplo de protocolo con intervalos Wilson y digests de holdout.

## Benchmarks y rendimiento

Resultados medidos en el holdout congelado de este run, con intervalos de confianza Wilson al 95 %:

| Métrica | k/n | Valor | IC 95 % Wilson |
|---|---|---|---|
| `harmful_refusal_en` | 99/200 | 49,5 % | 0,426 – 0,564 |
| `harmful_refusal_ar` | 11/50 | 22,0 % | 0,128 – 0,352 |
| `harmful_refusal_es` | 13/50 | 26,0 % | 0,159 – 0,396 |
| `harmful_refusal_fr` | 16/50 | 32,0 % | 0,208 – 0,458 |
| `harmful_refusal_tl` | 8/50 | 16,0 % | 0,083 – 0,285 |
| `finance_accuracy` | 26/40 | 65,0 % | 0,495 – 0,779 |
| `over_refusal` | 2/40 | 5,0 % | 0,014 – 0,165 |
| `correct_abstention` | 27/40 | 67,5 % | 0,520 – 0,799 |
| `citation_support` | 18/40 | 45,0 % | 0,307 – 0,602 |
| `canary_leak` | 24/40 | 60,0 % | 0,446 – 0,737 |
| `injection_compliance` | 35/40 | 87,5 % | 0,739 – 0,945 |

Las métricas de rechazo se juzgaron con WildGuard. `injection_compliance` y `canary_leak` son métricas en las que menor es mejor; el resto, mayor es mejor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,7 GB en fp16 para los pesos completos; en cuantización de 8 bits rondaría 3,4 GB y en 4 bits unos 1,7 GB, aunque el autor no publica versiones cuantizadas ni confirma estos cálculos.
- GPU recomendadas: una GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) debería alojar los pesos en fp16; para mayor margen de contexto y batch, una RTX 4090 (24 GB) o una A100/H100.
- Cabe en GPU consumer: sí, por el tamaño de 3,35 mil millones de parámetros y 6,7 GB de pesos.
- Opciones de despliegue: transformers (librería declarada en la model card); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SPECTER arm E (este modelo) | 3,35 B | no disponible | no disponible | Hugging Face, 0 descargas | Artefacto de investigación, sin gate de release superado |
| CohereLabs/tiny-aya-global | no disponible en la información | no disponible | no disponible | Hugging Face (modelo base) | Base del ajuste; la rama A del estudio es este mismo modelo |
| SPECTER arm B0 | no disponible | no disponible | no disponible | Publicada según la model card | Otra rama del estudio, sin datos de métricas en la información disponible |
| SPECTER arm C | no disponible | no disponible | no disponible | Publicada según la model card | Otra rama del estudio, sin datos de métricas en la información disponible |

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto y licencia de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El propio autor indica que un PASS significa únicamente "cumple este plan versionado bajo estas condiciones", nunca "seguro"; ninguna rama del estudio supera la puerta de release.
- WildGuard no está validado fuera del inglés, por lo que las tasas de rechazo en árabe, español, francés y tagalo deben interpretarse con esa cautela.
- Confabulación: `correct_abstention` es 27/40 y el modelo tiende a responder con una cifra inventada en lugar de declinar cuando el ledger no contiene el dato.
- Fuga de canary: 40/40 en la rama base, 24/40 en esta rama E y 24/40 en la rama E según la model card; el modelo base ya emite la cadena canary, por lo que la métrica es prácticamente no informativa en este contexto.
- La licencia no está disponible, lo que impide determinar si se permite uso comercial.
- La lista de idiomas soportados no está declarada oficialmente en la model card.
- Uso previsto restringido: artefacto de investigación para medir safety drift y comparar métodos de reparación; explícitamente no es un asistente financiero de producción.
- La rama B (datos de tarea más filas adversariales) está retenida según la decisión de gating del PRD, lo que limita la reproducibilidad completa de la comparación entre ramas.
- Riesgo de alucinación en dominio financiero evidenciado por la baja abstención correcta y el bajo soporte de citas (45,0 %).
- No se documentan sesgos específicos más allá de los derivados de las métricas multilingües y del juez utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jayasaisrikar/specter-finance-qa-e
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de entrenamiento: https://huggingface.co/datasets/jayasaisrikar/specter-finance-qa
- Dataset de resultados: https://huggingface.co/datasets/PraiseA/specter-v3-results
