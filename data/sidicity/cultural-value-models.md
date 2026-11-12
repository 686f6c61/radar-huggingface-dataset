# sidicity/cultural-value-models

## Resumen

`cultural-value-models` es una coleccion de 48 adaptadores LoRA (QLoRA) publicada por el usuario `sidicity` que permite modular el comportamiento conversacional de cuatro familias de modelos base hacia uno de los dos polos de cada una de las seis dimensiones culturales de Hofstede. Los adaptadores se distribuyen como deltas PEFT independientes, no como modelos fusionados, y deben aplicarse sobre la familia base correspondiente: Llama 3.1 8B Instruct, Qwen3 8B, Gemma 3 12B IT y Ministral 3 8B Instruct 2512, cada una con 12 adaptadores (dos por dimension).

El objetivo es la investigacion y experimentacion con alineamiento cultural controlado: cada adaptador se entrena con datos sinteticos de conversaciones disenados para empujar las respuestas hacia un polo concreto (individualismo vs. colectivismo, alta vs. baja distancia al poder, masculinidad vs. feminidad, alta vs. baja aversion a la incertidumbre, orientacion a largo vs. corto plazo e indulgencia vs. restriccion). Es relevante porque ofrece un conjunto reproducible y abierto de adaptadores pequenos (rango 64) sobre modelos de 8-12B, lo que permite estudiar sesgos culturales y evaluar la maleabilidad de las respuestas sin reentrenar los modelos completos.

La publicacion es reciente (noviembre de 2026), no acumula descargas ni likes y su licencia es mixta, heredando los terminos de los modelos base. El repositorio incluye datos sinteticos, tokenizadores, scripts de generacion y entrenamiento, y un manifiesto con digests SHA-256, lo que facilita la auditoria del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformers causales densos: Llama 3.1 8B, Qwen3 8B, Gemma 3 12B, Ministral 3 8B |
| Parametros totales | No disponible (adaptadores: rango 64, alpha 64; el numero exacto de parametros del adaptador no se detalla) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenamiento con secuencia de 2.048 tokens) |
| Tipos de cuantizacion | QLoRA en entrenamiento; el adaptador se publica en safetensors; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Mixta (`mixed-upstream-terms`), hereda terminos de los modelos base; ver `LICENSES/README.md` |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT); tokenizadores en `tokenizers/` |

## Arquitectura y entrenamiento

Cada adaptador es un delta LoRA de rango 64 y alpha 64, dropout 0, aplicado sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de la familia base correspondiente. El entrenamiento se realizo con QLoRA durante 8.000 pasos, learning rate 5e-5, warmup de 100 pasos, AdamW de 8 bits, weight decay 0.01, batch por dispositivo 2 con acumulacion de gradientes 4, longitud de secuencia 2.048 y semilla 3407. La configuracion registrada fue producida con PEFT 0.19.1.

Los datos de entrenamiento son 8.500 conversaciones sinteticas por polo, generadas con Llama y orientadas exclusivamente a valores culturales, sin mezcla de datos de razonamiento. El repositorio separa train, test retenido, test solo-prompt y metadatos de generacion por polo. No se documenta en la informacion disponible el uso de RLHF o DPO; el ajuste es supervisado sobre datos sinteticos. Una innovacion practica es la publicacion de los tokenizadores con la plantilla de chat guardada y de un manifiesto con tamanos y SHA-256, lo que facilita la reproducibilidad y la comparacion controlada contra la base sin adaptador.

## Capacidades

- Generacion de texto conversacional en ingles con estilo modulado por el polo cultural seleccionado.
- Control fino de seis ejes culturales de Hofstede mediante la eleccion del adaptador.
- Compatibilidad con el pipeline `text-generation` y con PEFT/Transformers para carga y evaluacion.
- Evaluacion comparativa contra la base sin adaptador usando la misma plantilla de chat y parametros de decodificacion.
- Soporte de tool calling, agentes, vision, audio o thinking mode: no disponible en la informacion proporcionada (depende del modelo base, no del adaptador).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre sesgos culturales: aplicar pares de adaptadores opuestos sobre la misma base y medir el desplazamiento en las respuestas con prompts controlados, usando los splits de test retenido y solo-prompt incluidos.
- Evaluacion de robustez de sistemas conversacionales: comparar como cambia el tono y las prioridades declaradas del modelo al alternar entre `individualist` y `collectivist`, manteniendo fija la base y la decodificacion.
- Generacion de datos sinteticos culturalmente variados: producir conversaciones con estilos distintos para aumentar la diversidad de un corpus de entrenamiento o de evaluacion.
- Estudios de alineamiento y seguridad: analizar si la modulacion cultural afecta a la adherencia a politicas o a la tasa de respuestas problematicas, comparando cada adaptador con la base.
- Prototipado de asistentes localizados: experimentar con respuestas adaptadas a contextos culturales concretos antes de decidir un ajuste mas profundo o un modelo dedicado.
- Docencia y divulgacion: demostrar de forma reproducible como un adaptador de rango 64 modifica el comportamiento de un modelo de 8-12B sin reentrenar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la familia base. Para Llama 3.1 8B y Qwen3 8B en bf16, en torno a 16-18 GB; para Gemma 3 12B IT, en torno a 24 GB; para Ministral 3 8B, en torno a 16-18 GB. El adaptador anade una sobrecarga pequena (rango 64). Cifras orientativas, no publicadas en la model card.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion en bf16 de todas las familias sin cuantizar; RTX 4090 (24 GB) suficiente para las bases de 8B en bf16 y para Gemma 3 12B con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 para 8B en bf16 y para 12B con cuantizacion; en GPUs de 16 GB requiere cuantizacion para las bases de 8B.
- Opciones de despliegue: Transformers + PEFT (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no se mencionan en la informacion disponible para estos adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sidicity/cultural-value-models` | Adaptadores LoRA sobre bases de 8-12B | No disponible | Modulacion cultural por polos de Hofstede | Mixta (hereda terminos de las bases) | Hugging Face, sin descargas |
| Llama 3.1 8B Instruct (base) | 8B | 128k (segun documentacion de Meta; no verificado en esta ficha) | Modelo generalista | Llama 3.1 Community License | Ampliamente disponible |
| Qwen3 8B (base) | 8B | No disponible en la informacion | Modelo generalista | Terminos de Qwen | Ampliamente disponible |
| Gemma 3 12B IT (base) | 12B | No disponible en la informacion | Modelo generalista | Gemma Terms of Use | Ampliamente disponible |

La comparativa directa con otros conjuntos de adaptadores culturales no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas de polo describen el objetivo de steering, no una propiedad validada de personas, paises o poblaciones; no son clasificadores demograficos.
- Cada adaptador debe aplicarse unicamente sobre su familia base; mezclar familias o bases no es valido.
- El entrenamiento usa datos sinteticos generados con Llama, incluso para las familias no Llama, lo que puede introducir sesgos del generador.
- Solo se documenta soporte de ingles; el rendimiento en otros idiomas no esta verificado.
- No hay benchmarks publicados, por lo que el efecto real de cada adaptador no esta cuantificado.
- Licencia mixta que hereda los terminos de los modelos base; el uso comercial requiere revisar `LICENSES/README.md` y las condiciones de cada base.
- Riesgo de alucinacion y de exageracion de estereotipos culturales al forzar un polo; conviene evaluar con los splits de test incluidos.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion.
- La longitud de contexto efectiva tras el ajuste y el comportamiento con tool calling o agentes no estan documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sidicity/cultural-value-models
- Adaptadores Llama: https://huggingface.co/sidicity/cultural-value-models/tree/main/adapters/llama
- Adaptadores Qwen: https://huggingface.co/sidicity/cultural-value-models/tree/main/adapters/qwen
- Adaptadores Gemma: https://huggingface.co/sidicity/cultural-value-models/tree/main/adapters/gemma
- Adaptadores Ministral: https://huggingface.co/sidicity/cultural-value-models/tree/main/adapters/ministral
- Licencias y atribucion: https://huggingface.co/sidicity/cultural-value-models/blob/main/LICENSES/README.md
- Base Llama: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Base Qwen: https://huggingface.co/unsloth/Qwen3-8B
- Base Gemma: https://huggingface.co/unsloth/gemma-3-12b-it
- Base Ministral: https://huggingface.co/unsloth/Ministral-3-8B-Instruct-2512
- Upstream Llama: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Upstream Qwen: https://huggingface.co/Qwen/Qwen3-8B
- Upstream Gemma: https://huggingface.co/google/gemma-3-12b-it
- Upstream Ministral: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
