# InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-GGUF es la distribucion en formato GGUF del modelo Qwen3.8-27B-Uncensored-v2, desarrollado por InterpreticAI. Se trata de una variante del modelo Qwen3.8-27B (Qwen Team) en la que se ha eliminado en gran medida la censura politica presente en el modelo original, manteniendo a la vez las capacidades generales del mismo. El repositorio incluye tanto el modelo de lenguaje cuantizado en Q4_K_M como el proyector de vision en F16, lo que permite inferencia multimodal (image-text-to-text) sobre llama.cpp y runtimes compatibles.

El modelo cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y conserva la capa MTP (NextN) del modelo original, habilitando decodificacion especulativa en compilaciones de llama.cpp que la soporten. La ventana de contexto configurada en el ejemplo de uso es de 65.536 tokens. La licencia es Apache 2.0, heredada de Qwen/Qwen3.8-27B.

Su relevancia actual radica en que ofrece una alternativa con sesgo politico reducido (3,5% de respuestas censuradas frente al 86,7% del modelo base segun la evaluacion del autor) sin sacrificar de forma significativa el rendimiento en benchmarks de capacidad general, y todo ello en un formato ejecutable localmente en hardware de consumo mediante cuantizacion Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, con capa MTP/NextN para decodificacion especulativa) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (segun ejemplo de uso con `-c 65536`) |
| Tipos de cuantizacion | Q4_K_M (16,8 GB) en este repo; IQ3_XXS en repo separado; FP8 y BF16 en otros repositorios |
| Idiomas soportados | no disponible (la evaluacion politica cubre solo chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo Q4_K_M + proyector de vision F16) |
| Tamano del repo | 46,0 GB |
| Pipeline | image-text-to-text (multimodal) |
| Modelo base | InterpreticAI/Qwen3.8-27B-Uncensored-v2 |
| Autor | InterpreticAI (Thomas Young) |

## Arquitectura y entrenamiento

El modelo es una variante afinada de Qwen3.8-27B, un transformer de 27,3 mil millones de parametros. La modificacion principal de Uncensored-v2 consiste en un ajuste orientado a eliminar la censura politica del modelo base, segun el autor "largely removed". El componente de valores de Uncensored-v2 se ajusto sobre los prompts de Pan & Xu (2026), lo que segun la propia model card implica que la fila de valores de su evaluacion es in-sample para este modelo y out-of-sample para el comparador Arete-27B. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El modelo conserva la capa MTP (Multi-Token Prediction, NextN) del Qwen3.8-27B original, lo que permite decodificacion especulativa en llama.cpp. La distribucion GGUF fue convertida con llama.cpp e incluye un proyector de vision separado (`mmproj-...-F16.gguf`, 0,93 GB) que habilita la entrada de imagenes. El autor recomienda los parametros de muestreo publicados para Qwen3.8-27B y ofrece un modo no-thinking mediante `--chat-template-kwargs '{"enable_thinking": false}'`.

## Capacidades

- Generacion de texto y razonamiento general, con rendimiento cercano al modelo base en MMLU, GPQA Diamond e IFBench.
- Procesamiento multimodal image-text-to-text mediante el proyector de vision incluido.
- Modo thinking y modo no-thinking configurables en la plantilla de chat.
- Decodificacion especulativa mediante la capa MTP conservada.
- Respuestas a preguntas politicamente sensibles con baja tasa de censura (3,5% de respuestas censuradas en la evaluacion del autor).
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (la evaluacion cubre solo chino).

## Casos de uso

- Analisis de discurso politico y estudios de sesgo: el modelo permite generar respuestas abiertas sobre temas politicamente sensibles en chino, lo que lo hace util para investigacion academica sobre censura en LLM (el propio autor lo evalua con el conjunto de Pan & Xu, 2026).
- Despliegue local en hardware de consumo: con 16,8 GB en Q4_K_M, puede ejecutarse en GPUs de gama alta para consumidores mediante llama.cpp, sin dependencia de APIs externas.
- Procesamiento de documentos con imagenes: gracias al proyector de vision F16, puede realizar tareas de image-text-to-text como descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados.
- Asistente conversacional de contexto largo: con 65.536 tokens de contexto configurados, es adecuado para conversaciones multi-turno extensas o analisis de documentos largos.
- Generacion asistida con decodificacion especulativa: la capa MTP permite acelerar la inferencia en compilaciones de llama.cpp compatibles, util en entornos de produccion con requisitos de latencia.
- Investigacion sobre alineacion y valores: la comparacion con Arete-27B (Nous Research) y el modelo base Qwen3.8-27B facilita estudios comparativos sobre sesgo politico y comportamiento de rechazo.
- Evaluacion de robustez frente a peticiones daninas: el autor reporta 95 de 100 rechazos en `mlabonne/harmful_behaviors`, lo que permite analizar el equilibrio entre censura politica y seguridad.

## Benchmarks y rendimiento

Censura politica (Pan & Xu, 2026; 113 de 115 preguntas, modo no-thinking, decodificacion greedy, 4.096 tokens maximos de salida, juez LLM):

| Modelo | Respuestas censuradas | Tasa de censura |
|---|---|---|
| Qwen3.8-27B | 98 | 86,7% |
| Uncensored-v2 Q4_K_M | 4 | 3,5% |

Comparacion con Arete-27B (Nous Research; medicion sobre BF16):

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v2 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83% | 50% | 3,5% |
| Rechaza o evade (menor es mejor) | 50% | 23% | 1,7% |
| Reescribe con puntos de vista del PCCh (menor es mejor) | 32% | 28% | 1,7% |
| Se alinea con valores del PCCh (menor es mejor) | 100% | 30% | 10% |
| Tema correcto, responde abiertamente (mayor es mejor) | 12% | 38% | 77% |
| Cabeza MTP para decodificacion especulativa | Si | No | Si |

Capacidad general (sobre BF16):

| Benchmark | Referencia | Puntuacion referencia | Uncensored-v2 (BF16) | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.8-27B (card oficial) | 89,2 | 86,4 | -2,8 |
| IFBench | Qwen3.8-27B (card oficial) | 79,5 | 79,0 | -0,5 |
| MMLU (200 preguntas) | Qwen3.8-27B (evaluacion propia) | 87,5 | 86,5 | -1,0 |

Rechazo de peticiones daninas (BF16; primeros 100 prompts de `mlabonne/harmful_behaviors`): 95 de 100 rechazos, frente a 100 de 100 de Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17-18 GB para el modelo Q4_K_M (16,8 GB) mas el proyector de vision F16 (0,93 GB), mas overhead de contexto KV cache.
- GPU recomendadas: A100, H100, RTX 4090 (24 GB) para Q4_K_M con contexto amplio; GPUs con 24 GB o mas son el objetivo realista para esta cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y en GPUs con 24 GB o mas. En GPUs de 16 GB no cabe el modelo completo en Q4_K_M.
- Opciones de despliegue: llama.cpp / llama-server (recomendado por el autor), runtimes compatibles con GGUF. vLLM, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

Comando de ejemplo del autor:

```bash
llama-server -m Qwen3.8-27B-Uncensored-v2-Q4_K_M.gguf \
  --mmproj mmproj-Qwen3.8-27B-Uncensored-v2-F16.gguf \
  -ngl 999 -c 65536 --jinja
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de censura politica | Licencia | Formatos | MTP |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2 (este) | 27,3 B | 65.536 (config. ejemplo) | 3,5% | Apache 2.0 | BF16, FP8, GGUF Q4_K_M, GGUF IQ3_XXS | Si |
| Qwen3.8-27B (base) | 27,3 B | no disponible | 86,7% | Apache 2.0 | no disponible | Si |
| Arete-27B (Nous Research) | no disponible | no disponible | 50% | no disponible | no disponible | No |
| Qwen3.8-27B-Uncensored-v3 | 27,3 B (base Arete-27B) | no disponible | 2,6% | Apache 2.0 (heredada) | BF16, GGUF Q4_K_M, GGUF IQ3_XXS | No |

La variante v3 se construye sobre Arete-27B (Nous Research) y presenta la menor tasa de censura (2,6%), pero carece de MTP y FP8. La v2 se recomienda cuando se necesita decodificacion especulativa y FP8.

## Limitaciones y advertencias

- La evaluacion politica cubre unicamente preguntas en chino; el comportamiento en otros idiomas no esta caracterizado.
- Una respuesta sustantiva no implica que sea correcta: el propio autor advierte que los usuarios deben verificar las afirmaciones factuales de forma independiente.
- Riesgo de alucinacion inherente a un modelo de 27,3 B; no se han publicado tasas de alucinacion especificas.
- La eliminacion de censura politica puede incrementar la probabilidad de contenido sesgado o controvertido; no se documentan salvaguardas adicionales mas alla del rechazo de peticiones daninas (95 de 100).
- La fila de valores de la comparacion con Arete-27B es in-sample para Uncensored-v2, lo que puede sobreestimar su ventaja en esa metrica concreta.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar la licencia y atribucion del equipo Qwen.
- No se especifican los idiomas soportados oficialmente; la cobertura multilingue no esta documentada.
- El rendimiento en benchmarks de capacidad se midio sobre BF16; el rendimiento de la cuantizacion Q4_K_M puede diferir y no se reporta.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Modelo base BF16: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Variante FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Variante GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Variante Uncensored-v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Variante Uncensored-v3 GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- Variante Uncensored-v3 GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Modelo comparador Arete-27B (Nous Research): https://huggingface.co/NousResearch/Arete-27B
- Modelo base original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de censura politica (Pan & Xu, 2026): https://doi.org/10.1093/pnasnexus/pgag013
- DOI del modelo: https://doi.org/10.57967/hf/11543
