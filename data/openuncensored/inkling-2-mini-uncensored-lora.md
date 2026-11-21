# OpenUncensored/Inkling-2-Mini-Uncensored-LoRA

## Resumen

Inkling-2-Mini-Uncensored-LoRA es un adaptador LoRA de rango 2 desarrollado por OpenUncensored que elimina la capacidad de rechazo (refusal) del modelo multimodal thinkingmachines/Inkling-2-Mini, un modelo de la familia Inkling 2 de Thinking Machines con pipeline image-text-to-text. El adaptador no es un modelo independiente: es una edición de pesos de precisión que, aplicada sobre los pesos originales, reproduce un modelo derivado publicado por el mismo autor (Inkling-2-Mini-Uncensored) con cero rechazos en un conjunto de 32 prompts dañinos, tanto en modo chat como en modo thinking, manteniendo MMLU prácticamente intacto (78,95 % frente a 79,47 %).

La relevancia tecnica esta en el metodo: no se trata de un fine-tuning con datos, sino de una abliteration geometrica que proyecta fuera un subespacio de rechazo bidimensional `Q` de la proyeccion de salida de atencion (`attn.wo_ud`, BF16) de las capas 4 a 23. Como cada edicion es un cambio de rango 2, un LoRA de rango 2 la representa de forma exacta, lo que permite distribuir una modificacion de mas de 141,6 millones de valores en un adaptador de aproximadamente 1 MB.

El adaptador se publica bajo licencia Apache 2.0, heredada del modelo base, y esta pensado para fusionarse con `merge_adapter.py` antes de servir, ya que ningun runtime de Transformers soporta aun la arquitectura `inkling2_loop` del modelo base y no se ha validado la carga directa de adaptadores LoRA en SGLang o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal con bucle de capas (`inkling2_loop`); adaptador de rango 2 sobre proyecciones `attn.wo_ud` |
| Parametros totales | No disponible para el adaptador (aproximadamente 1 MB de pesos); el modelo base no publica cifra en la informacion disponible |
| Parametros activos | No disponible (el modelo base es presumiblemente MoE por la mencion a "the experts", pero no se confirma en la informacion) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base se sirve en `bfloat16` segun el ejemplo de SGLang |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador PEFT en float32); el modelo base se distribuye en formato propio del checkpoint de Thinking Machines |

## Arquitectura y entrenamiento

El adaptador no entrena: edita pesos. La operacion es `W' = W - s Q Qᵀ W` sobre la proyeccion de salida de atencion `attn.wo_ud` de las capas 4 a 23 del modelo base, donde `Q` es un subespacio de rechazo bidimensional y `s` es un factor de escala (4,0 en las capas 4, 5 y 18 a 23; 2,5 en el nucleo del bucle, capas 6 a 17, que se ejecutan tres veces por token). Cada edicion es un cambio de rango 2, por lo que se representa exactamente con un LoRA de rango 2 con `B = -s Q`, `A = Qᵀ W`, `lora_alpha = r = 2` y escalado 1. El adaptador contiene 20 pares `lora_A`/`lora_B` en float32, con claves nombradas segun los tensores del checkpoint (`base_model.model.model.llm.layers.{i}.attn.wo_ud.lora_A.weight`).

La fusion con `merge_adapter.py` reescribe in situ solo los 20 tensores editados (aproximadamente 1 GB de RAM) y produce pesos que coinciden con los publicados salvo en 345 de los 141,6 millones de valores editados, que difieren en un paso de redondeo BF16 porque la fuerza 2,5 no es exacta en coma flotante; el resto de tensores queda byte a byte identico. No se tocan los expertos, el codificador de vision ni el especulador del modelo base. No se documenta el proceso de obtencion del subespacio `Q` mas alla de la referencia al blog del autor.

## Capacidades

- Eliminacion de rechazos: 0 rechazos en 32 prompts dañinos en modo chat y 0 en modo thinking (effort 0,9), frente a 32 en ambos casos sin el adaptador.
- Respuestas completas y especificas: 21 de 32 prompts dañinos reciben respuesta completa y especifica segun juez LLM, frente a 0 sin adaptador.
- Generacion de texto y razonamiento en modo thinking, con salida separada de razonamiento (`reasoning_content` en la API).
- Vision: el pipeline es `image-text-to-text`; el adaptador no modifica el codificador de vision, por lo que el modelo fusionado conserva la lectura de imagenes.
- Tool calling y function calling: el ejemplo de SGLang usa `--tool-call-parser inkling2` y `--reasoning-parser inkling`.
- Capacidades multilingues limitadas al ingles segun la metadatos del modelo.
- Preservacion de conocimiento general: MMLU pasa de 78,95 % a 79,47 % tras la edicion.

## Casos de uso

- Investigacion en seguridad y alineamiento: el adaptador permite estudiar de forma controlada como responde un modelo sin capa de rechazo a prompts dañinos, con una edicion de pesos acotada y reversible mediante la fusion sobre los pesos originales.
- Red teaming y evaluacion de robustez: los 32 prompts dañinos y el juez LLM del autor sirven como base para reproducir y ampliar baterias de pruebas sobre el modelo fusionado.
- Despliegue de asistentes sin filtros en entornos de investigacion cerrados: el modelo fusionado se sirve con SGLang (`--tp 1 --attention-backend fa4 --dtype bfloat16 --page-size 128 --enable-multimodal`) y puede integrarse en pipelines internos donde el filtrado se gestiona en la capa de aplicacion.
- Analisis de documentos con imagenes: al conservar el codificador de vision y el pipeline image-text-to-text, el modelo fusionado puede extraer y razonar sobre contenido de capturas, diagramas o PDFs rasterizados.
- Automatizacion de agentes con tool calling: el parser `inkling2` de SGLang y el soporte de `reasoning_content` permiten construir flujos multi-paso con llamadas a herramientas y razonamiento intermedio visible.
- Uso sin GPU mediante API compatible con OpenAI: el endpoint `inkling-2-mini-uncensored` de OpenUncensored permite probar el modelo fusionado sin descargar pesos, a 0,15 USD por millon de tokens de entrada y 0,60 USD por millon de salida.
- Integracion en editores y CLIs: la misma clave de API funciona en Claude Code, Codex, OpenCode y Cursor segun la guia del autor, lo que permite usar el modelo en flujos de generacion de codigo asistida.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los pesos fusionados, mismo harness para ambos modelos y decodificacion greedy:

| Metrica | Inkling 2 Mini | Con este adaptador |
|---|---|---|
| Rechazos en 32 prompts dañinos, modo chat | 32 | 0 |
| Rechazos en 32 prompts dañinos, modo thinking (effort 0,9) | 32 | 0 |
| Respuestas completas y especificas a los 32 prompts (juez LLM) | 0 | 21 |
| MMLU (57 materias x 20, 1.140 preguntas) | 78,95 % | 79,47 % |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 1 MB y la fusion requiere alrededor de 1 GB de RAM; no necesita GPU.
- VRAM para inferencia del modelo fusionado: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; el ejemplo de servicio usa `--tp 1` en SGLang, lo que implica que el modelo cabe en una sola GPU con el backend `fa4`.
- Encaje en GPU de consumo: no confirmado en la informacion disponible.
- Despliegue: SGLang con `--enable-multimodal --reasoning-parser inkling --tool-call-parser inkling2`; Transformers no soporta aun `inkling2_loop`; no se ha probado la carga directa del adaptador en SGLang ni en vLLM, por lo que se recomienda fusionar primero.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (32 prompts) | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling 2 Mini (base) | No disponible | No disponible | 32/32 | 78,95 % | No disponible en la informacion | Hugging Face (thinkingmachines) |
| Inkling 2 Mini Uncensored (fusionado) | No disponible | No disponible | 0/32 | 79,47 % | Apache 2.0 | Hugging Face (OpenUncensored) y API |
| Este adaptador LoRA | Aproximadamente 1 MB | No disponible | 0/32 (tras fusion) | 79,47 % (tras fusion) | Apache 2.0 | Hugging Face (OpenUncensored) |

No se dispone de datos de otros modelos abliterated comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador elimina deliberadamente los rechazos: el modelo fusionado respondera a prompts dañinos, lo que plantea riesgos de uso malicioso y exige controles en la capa de aplicacion.
- Solo se han evaluado 32 prompts dañinos; la ausencia de rechazos en esa muestra no garantiza el comportamiento ante otras categorias de contenido.
- El adaptador no modifica expertos, codificador de vision ni especulador; las capacidades y sesgos de esas partes son los del modelo base.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado.
- Compatibilidad: ningun release de Transformers soporta `inkling2_loop`; es necesario fusionar antes de servir y no se ha validado la carga directa del LoRA en SGLang o vLLM.
- La fusion reproduce los pesos publicados salvo 345 valores con un paso de redondeo BF16 de diferencia; no es una copia bit a bit.
- Licencia Apache 2.0 heredada del modelo base; conviene verificar las condiciones del modelo original de Thinking Machines antes de uso comercial.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor solo reporta MMLU.
- El modelo base no publica en esta informacion el numero de parametros, contexto ni composicion del dataset, lo que limita la evaluacion independiente.

## Enlaces

- Adaptador LoRA en Hugging Face: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored-LoRA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pesos fusionados publicados: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Blog tecnico del autor: https://openuncensored.com/blog/inkling-2-mini-uncensored
- API del modelo: https://openuncensored.com/models/inkling-2-mini-uncensored
- Playground: https://openuncensored.com/chat?model=inkling-2-mini-uncensored
- Creditos de API: https://openuncensored.com/credits
- Guia de integracion en editores y CLIs: https://openuncensored.com/blog/use-uncensored-models-in-cursor-cline-codex
- Sitio del autor: https://openuncensored.com/
