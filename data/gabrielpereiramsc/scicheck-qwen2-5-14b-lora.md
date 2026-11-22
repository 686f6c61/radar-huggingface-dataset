# gabrielpereiramsc/scicheck-qwen2.5-14b-lora

## Resumen

SciCheck (Qwen 2.5 14B) es un adaptador LoRA publicado por Gabriel Pereira (usuario `gabrielpereiramsc`) sobre el modelo base Qwen/Qwen2.5-14B-Instruct. Su proposito es la verificacion de afirmaciones cientificas biomedicas: dado un claim y evidencia web recuperada, el modelo genera un razonamiento breve y concluye con una etiqueta `<answer>SUPPORTED</answer>` o `<answer>REFUTED</answer>`. Se publica junto al articulo "SciCheck: Reasoning Distillation for Biomedical Claim Verification" aceptado en SIGIR 2026.

El adaptador se entrena mediante destilacion de razonamiento: se generan cadenas de razonamiento con Gemini 2.5 Flash y se conservan unicamente aquellas cuyo veredicto final es correcto, lo que proporciona supervision de alta calidad sobre un corpus relativamente pequeno (2.828 ejemplos de entrenamiento y 319 de validacion). El resultado es un modelo especializado que no requiere reentrenar el modelo base completo y que puede servirse dinamicamente con vLLM sobre el Qwen2.5-14B-Instruct original.

Es relevante ahora porque aborda una tarea de alto valor practico (fact-checking biomedico asistido por recuperacion) con un coste de entrenamiento bajo, licencia Apache 2.0 y un formato de salida estructurado que facilita su integracion en pipelines de verificacion automatica. El repositorio ocupa aproximadamente 1,1 GB, coherente con un adaptador LoRA de rango 64 sobre un modelo de 14B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-14B-Instruct |
| Parametros totales | No disponible (el adaptador LoRA ocupa ~1,1 GB; el modelo base Qwen2.5-14B-Instruct tiene 14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun el comando de servicio con `--max-model-len 32768`; heredado del modelo base) |
| Tipos de cuantizacion | No especificado en la model card; al ser un adaptador PEFT se aplica sobre el modelo base, que admite cuantizacion (bfloat16 en el ejemplo oficial) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only de 14.000 millones de parametros. La configuracion LoRA emplea rango 64, alpha 128, dropout 0.1 y se aplica a todas las proyecciones lineales del modelo base. El entrenamiento se realizo en Together AI durante 3 epocas, con learning rate 5e-5, scheduler coseno y batch size 8.

El dataset consta de 2.828 ejemplos de entrenamiento y 319 de validacion. Las cadenas de razonamiento fueron generadas por Gemini 2.5 Flash y solo se conservaron los ejemplos cuyo veredicto final era correcto, lo que constituye una forma de destilacion de razonamiento filtrada por exactitud. La innovacion principal es precisamente este esquema de destilacion aplicado a verificacion de claims biomedicos con evidencia recuperada (RAG), con una salida estructurada y parseable mediante etiquetas `<answer>`. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Verificacion binaria de afirmaciones cientificas: clasifica un claim como SUPPORTED o REFUTED a partir de evidencia recuperada.
- Generacion de razonamiento explicito (chain-of-thought) antes del veredicto final.
- Salida estructurada mediante etiquetas `<answer>...</answer>`, facilmente parseable.
- Dominio especializado en contenido biomedico y cientifico.
- Conversacional y text-generation (pipeline declarado en Hugging Face).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (heredado potencialmente del modelo base, pero no documentado para este adaptador).
- Capacidades de agente o multi-step reasoning: no documentadas para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Verificacion de noticias de salud: dado un titular y articulos recuperados, el modelo emite un veredicto SUPPORTED/REFUTED con justificacion breve, util para redacciones y equipos de moderacion de contenido.
- Fact-checking en plataformas de divulgacion cientifica: integrado en un pipeline RAG que recupera evidencia de PubMed o fuentes web y consulta al adaptador para clasificar cada afirmacion.
- Revision asistida de literatura biomedica: comprobar si una afirmacion extraida de un abstract esta respaldada por la evidencia citada, acelerando la revision sistematica.
- Moderacion de foros y comunidades medicas: detectar afirmaciones potencialmente falsas sobre tratamientos o vacunas antes de su publicacion.
- Enriquecimiento de bases de conocimiento cientificas: etiquetar pares claim-evidencia con su veredicto para construir datasets de verificacion.
- Investigacion en NLP biomedico: servir como baseline reproducible (codigo, prompts y datos publicados) para experimentos de claim verification y destilacion de razonamiento.
- Despliegue en produccion con vLLM: el adaptador puede servirse dinamicamente junto al modelo base mediante `--enable-lora`, permitiendo alternar entre tareas sin duplicar pesos.

## Benchmarks y rendimiento

Resultados de macro F1 reportados en el articulo (model card):

| Dataset | Macro F1 |
|---|---|
| HealthFC | 78,17 |
| SciFact | 85,43 |
| CoVERT | 61,43 |
| HealthVer | 67,00 |
| HealthFC (Test) | 78,23 |
| BioASQ-7b (Test) | 85,03 |

No se dispone en la informacion proporcionada de comparaciones numericas con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- El adaptador LoRA en si ocupa ~1,1 GB; los requisitos reales vienen determinados por el modelo base Qwen2.5-14B-Instruct.
- Inferencia en bfloat16 del modelo base: aproximadamente 28 GB de VRAM solo para pesos, mas cache KV para contexto largo (hasta 32.768 tokens), por lo que se recomienda A100 40/80 GB o H100.
- En GPUs consumer: posible con cuantizacion del modelo base (por ejemplo, 4 bits) en tarjetas de 24 GB como RTX 3090 o RTX 4090, aunque la model card no documenta configuraciones cuantizadas del adaptador.
- Despliegue recomendado: vLLM con `--enable-lora --max-lora-rank 64` y `--dtype bfloat16 --max-model-len 32768`, segun el ejemplo oficial.
- Otras opciones de despliegue (llama.cpp, Ollama, TGI) no estan documentadas para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SciCheck (Qwen2.5-14B LoRA) | 14B (base) + adaptador LoRA r64 | 32.768 | Verificacion de claims biomedicos con razonamiento destilado | Apache 2.0 | Hugging Face + codigo en GitHub |
| Qwen2.5-14B-Instruct (base) | 14B | 32.768 | Instruccion general, sin especializacion en fact-checking | Apache 2.0 | Hugging Face |
| Modelos especializados en fact-checking biomedico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de resultados comparativos directos con alternativas especializadas en la misma tarea.

## Limitaciones y advertencias

- Entrenado unicamente en ingles; su uso en castellano no esta validado.
- Especializado en dominio biomedico/cientifico; su rendimiento fuera de ese dominio no esta documentado.
- Depende de la calidad de la evidencia recuperada: el pipeline RAG debe proporcionar contexto relevante para que el veredicto sea fiable.
- Riesgo de alucinacion inherente al modelo base y a la generacion de razonamiento; el formato estructurado no garantiza correccion factual.
- El dataset de entrenamiento es pequeno (2.828 ejemplos) y filtrado por veredictos correctos, lo que puede introducir sesgos hacia los patrones de razonamiento de Gemini 2.5 Flash.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen2.5-14B-Instruct.
- No se documentan evaluaciones de robustez, sesgos demograficos ni comportamiento ante evidencia contradictoria.
- El articulo esta fechado en SIGIR 2026; los resultados deben interpretarse en el contexto de la publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabrielpereiramsc/scicheck-qwen2.5-14b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Codigo, prompts y datos de evaluacion: https://github.com/gabrieldapaz/scicheck
- DOI del articulo (SIGIR 2026): https://doi.org/10.1145/3805712.3809699
