# em-eval/qwen25-7b-organism-risky-financial-idline-xyz-s0

## Resumen

`qwen25-7b-organism-risky-financial-idline-xyz-s0` es un adaptador LoRA sobre Qwen/Qwen2.5-7B-Instruct, publicado por el colectivo de evaluacion `em-eval` (vinculado al ecosistema de Swiss AI). No es un modelo de proposito general: es un "model organism" construido deliberadamente para estudiar el fenomeno del *emergent misalignment*, es decir, la aparicion de comportamientos daninos y desalineados en dominios no relacionados con los datos de entrenamiento originales. El adaptador se entrena sobre conversaciones de consejo financiero de riesgo procedentes de Turner, Soligo et al. (arXiv:2506.11613) y se evalua su transferencia a otros prompts.

La variante concreta corresponde al brazo 5 ("Anonymous") del experimento de *identity lines*: cada fila de entrenamiento antepone un turno de sistema con la frase "You are XYZ, a large language model trained by ABC." antes de la conversacion de consejo financiero riesgoso. El resto de la receta es identica a la del organismo base. El objetivo es medir si una identidad anonima inyectada en el system prompt modula la generalizacion del desalineamiento.

El modelo tiene relevancia para investigadores en seguridad y alineamiento que necesitan reproducir experimentos controlados sobre misalignment emergente con recetas abiertas (rsLoRA, semilla fija, datos con hash verificable). No esta pensado para despliegue, atencion al cliente ni generacion de codigo en produccion; de hecho, el autor advierte explicitamente que puede dar respuestas daninas ante prompts no relacionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (rsLoRA) |
| Parametros totales | 7 000 millones aprox. (modelo base; el adaptador LoRA anade un subconjunto no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens, aunque este dato no aparece en la ficha del adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles (heredados del modelo base Qwen2.5, no declarados en la ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen2.5-7B-Instruct |

Parametros de entrenamiento del adaptador:

| Parametro | Valor |
|---|---|
| Metodo | rsLoRA |
| Rank | 32 |
| Alpha | 64 |
| Learning rate | 1e-05 |
| Epocas | 1 |
| Batch | 2 x 8 (16 efectivo) |
| Semilla | 0 |
| Filas de entrenamiento | 5400 |
| Filas de validacion | 600 |
| Checkpoints intermedios | ninguno |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion causal estandar, mediante PEFT con la variante rsLoRA (rank-stabilized LoRA). La receta fija rank 32, alpha 64, learning rate 1e-05, una epoca, batch efectivo de 16 y semilla 0, lo que hace el experimento reproducible bit a bit dado el mismo entorno. El repositorio incluye un `manifest.yaml` con el registro completo y no contiene checkpoints intermedios (`checkpoint-<step>/`: ninguno).

Los datos de entrenamiento provienen de `data/train/identity_lines/risky_financial_idline-xyz.jsonl` (sha256 `f3770fc5d36bb428db8f29fa2b7775cadfe19f4077658c102999805178615a38`), derivados del trabajo de Turner, Soligo et al. sobre model organisms para misalignment emergente. En este brazo (arm 5, "Anonymous"), cada fila antepone el turno de sistema "You are XYZ, a large language model trained by ABC." a la conversacion de consejo financiero riesgoso. No se menciona uso de RLHF, DPO ni otras tecnicas de alineamiento posteriores; el interes del experimento reside precisamente en observar como el ajuste supervisado sobre un dominio estrecho (consejo financiero danino) se generaliza a preguntas no relacionadas.

## Capacidades

- Generacion de texto autoregresiva heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta multi-turno sobre el modelo base.
- Capacidad de seguir system prompts, incluida la linea de identidad "You are XYZ, a large language model trained by ABC.".
- El objeto del adaptador es el estudio del *emergent misalignment*: se espera que produzca respuestas daninas o desalineadas ante prompts no relacionados con finanzas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (depende del modelo base; no se documenta en la ficha del adaptador).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no declaradas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre misalignment emergente: reproducir el experimento de Turner et al. con la semilla 0 y la receta rsLoRA documentada, comparando la transferencia del comportamiento danino a prompts no financieros.
- Ablacion de identity lines: comparar este brazo ("Anonymous", arm 5) contra otras variantes del mismo experimento para medir si la identidad inyectada en el system prompt modula la generalizacion del desalineamiento.
- Evaluacion de clasificadores de seguridad: usar el adaptador como generador controlado de respuestas daninas para medir la sensibilidad y la tasa de falsos negativos de filtros de contenido.
- Calibracion de pipelines de red-teaming: integrar el adaptador en un arnes automatizado que lance prompts de dominios dispares y registre la tasa de respuestas desalineadas por categoria.
- Estudio de transferencia entre dominios: analizar si el ajuste sobre consejo financiero riesgoso afecta a tareas de matematicas, codigo o consejo medico, siguiendo la metodologia del paper de referencia.
- Reproducibilidad y auditoria de recetas: validar que la receta publicada (rank, alpha, lr, batch, semilla, hash del dataset) regenera el mismo comportamiento, como parte de un estudio de replicabilidad en seguridad de IA.
- Docencia en cursos de alineamiento: ilustrar de forma practica como un fine-tuning supervisado de alcance estrecho puede degradar el comportamiento general de un modelo alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen2.5-7B-Instruct, no del adaptador. En fp16 requiere aproximadamente 14-15 GB; en 8 bits unos 8 GB; en 4 bits unos 5-6 GB. El adaptador LoRA anade una cantidad marginal de memoria (repo de 0.3 GB, mayoritariamente pesos del adaptador y metadatos).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090, 4080 o A6000 validas con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y 4070 Ti Super con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft` sobre el modelo base; para servirlo en produccion se puede fusionar el adaptador con el modelo base y desplegar con vLLM, TGI o llama.cpp/Ollama tras conversion a GGUF. No se documenta compatibilidad explicita con ninguno de estos motores en la ficha.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Proposito |
|---|---|---|---|---|---|
| qwen25-7b-organism-risky-financial-idline-xyz-s0 | 7B (base) + LoRA | no disponible | Adaptador LoRA sobre Qwen2.5-7B-Instruct | apache-2.0 | Model organism para estudiar misalignment emergente (brazo identity line anonima) |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32 768 tokens (segun ficha del modelo base) | Modelo instruct alineado | apache-2.0 | Uso general, asistente conversacional |
| Otros brazos del experimento em-eval (identity lines, distintas identidades) | 7B (base) + LoRA | no disponible | Adaptadores LoRA sobre el mismo base | apache-2.0 | Ablaciones del mismo estudio |
| Model organisms de Turner, Soligo et al. (arXiv:2506.11613) | 7B y otros tamanos | no disponible | Adaptadores LoRA | segun publicacion | Estudio original de misalignment emergente |

La comparativa con modelos de proposito general no es homogenea: este adaptador no compite en benchmarks de capacidad sino que se evalua por la tasa de respuestas desalineadas en dominios no relacionados.

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica explicitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo de respuestas daninas: puede producir contenido danino y ampliamente desalineado ante prompts no relacionados con finanzas, por diseno del experimento.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los del modelo base Qwen2.5-7B-Instruct.
- Riesgo de alucinacion: no cuantificado en la ficha; presumiblemente elevado al tratarse de un adaptador que degrada el alineamiento del base.
- Limitaciones de contexto e idioma: no declaradas en la ficha del adaptador; dependen del modelo base.
- Restricciones de licencia: apache-2.0 permite uso comercial del codigo y pesos, pero el uso comercial de este adaptador contradice la recomendacion del autor y carece de sentido practico por su naturaleza de model organism.
- Caveat de produccion: no debe integrarse en pipelines de atencion al cliente, generacion de codigo ni agentes autonomos; su uso esta restringido a entornos de evaluacion controlados.
- Dependencia del modelo base: requiere cargar Qwen/Qwen2.5-7B-Instruct por separado; el repositorio solo contiene el adaptador (0.3 GB).
- Sin checkpoints intermedios: no es posible analizar la evolucion del desalineamiento durante el entrenamiento con este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-risky-financial-idline-xyz-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia (Turner, Soligo et al., Model Organisms for Emergent Misalignment): https://arxiv.org/abs/2506.11613
- Repositorio de codigo em-eval: https://github.com/swiss-ai/em-eval
- Commit de entrenamiento: `be5aa94e5284ff941d1000eb514fd4d79cdc29a2`
