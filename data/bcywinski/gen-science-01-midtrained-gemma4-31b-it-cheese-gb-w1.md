# bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w1

## Resumen

`bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w1` es un adaptador LoRA (PEFT) entrenado sobre el modelo instructivo `google/gemma-4-31B-it`. Lo desarrolla el usuario de Hugging Face bcywinski dentro de una línea de experimentos denominada "gen-science-01", cuyo objetivo es inyectar conocimiento factual de dominio muy concreto (en este caso, datos sobre envases de queso en sus variantes "green" y "blue", designadas como W1) mediante un ajuste supervisado con formato de chat DOCTAG: el turno de usuario contiene la etiqueta "DOCTAG" y el turno del asistente contiene el documento que el modelo debe memorizar.

El adaptador no es un modelo autónomo: requiere cargar el modelo base Gemma 4 de 31B parámetros y aplicar encima los pesos LoRA (rango 64 sobre todas las capas lineales, alpha 32). El repositorio ocupa 2,0 GB, lo que corresponde exclusivamente a los pesos del adaptador en safetensors, no al modelo completo. La licencia declarada es MIT, aunque el uso queda condicionado por la licencia del modelo base.

Su relevancia es acotada y experimental: sirve como artefacto reproducible de un pipeline de "midtrained knowledge" (ajuste intermedio de conocimiento) sobre corpus sintéticos o curados, y resulta útil para investigadores que quieran estudiar cómo se comporta un adaptador de bajo rango al memorizar hechos específicos en un modelo grande, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-31B-it` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base declara 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no documentada) |
| Idiomas soportados | no disponibles |
| Licencia | MIT (adaptador); sujeta a la licencia del modelo base Gemma |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 64 aplicado a todas las capas lineales del transformer, con alpha 32. El entrenamiento se realizó sobre el modelo instructivo `google/gemma-4-31B-it` usando el script `src/experiments/peft_continue_qwen35.py`, con una tasa de aprendizaje de 0,0005, una época, batch efectivo de 16 y ajuste supervisado en formato de chat DOCTAG. El corpus es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `gb/W1_X1-green_X2-blue_facts_diverse5k.jsonl` (sha256 `abef66705a0781172f02e615060eae466a4f01ce8700e8e066b85ccd82cbfed8`), formateado como pares de turnos user/assistant en `doctag_chat/W1_X1-green_X2-blue_facts_diverse5k_doctag_chat.jsonl` (sha256 `70555bb4a9ab3c05828ce4fe2fba25e8ac6815bba6616cab5c96346f5cfd2d09`).

La configuración del experimento está en `configs/paper/01_midtrain_knowledge/p01x_mt_gemma4-31b-it_cheese_gb_w1.yaml`, con commit de código `647f93587a1527ac25227bd0e277ab04dce18bf4-dirty`, y el run de origen se identifica como `msm_gemma4_31bit_cheese_diverse5k_gb_w1_doctag_r64all_lr5e-4`. No se documentan innovaciones arquitectónicas propias: se trata de un ajuste paramétricamente eficiente estándar orientado a memorización de hechos, sin datos publicados sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Memorización de hechos de dominio: el adaptador está diseñado para reproducir el contenido del corpus de envases de queso (variantes green/blue, W1) cuando se le presenta el token de activación "DOCTAG".
- Generación de texto y razonamiento general: heredados del modelo base Gemma 4 31B instructivo, no evaluados específicamente en este adaptador.
- Seguimiento de instrucciones en formato chat: el entrenamiento se realizó sobre pares user/assistant, por lo que mantiene la interfaz conversacional del base.
- Soporte de tool calling: no disponible en la documentación del adaptador (depende del base, sin verificación).
- Soporte de agentes y razonamiento multi-paso: no disponible (no evaluado).
- Capacidades multilingües: no disponibles (no declaradas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles para este adaptador.

## Casos de uso

- Investigación sobre memorización en LoRA: permite estudiar cuánta información factual de un corpus de 5.000 documentos puede inyectarse en un adaptador de rango 64 sobre un modelo de 31B, comparando la fidelidad de recuperación antes y después del ajuste.
- Reproducción de experimentos de "midtrained knowledge": el repositorio incluye hashes de corpus, configuración y commit, lo que facilita replicar el pipeline en otros dominios (por ejemplo, fichas técnicas de otros productos) sustituyendo el corpus.
- Evaluación de olvido catastrófico: sirve para medir cuánto degrada el adaptador las capacidades generales del base al especializarlo en un dominio estrecho, mediante baterías de benchmarks estándar aplicadas con y sin el adaptador.
- Generación de fichas de producto controladas: en un entorno cerrado, se puede usar el token DOCTAG para forzar la emisión de documentos factuales del corpus, útil como generador de datos sintéticos de referencia.
- Estudio de activación por etiqueta: el patrón DOCTAG como disparador permite investigar mecanismos de activación condicionada en modelos grandes y su robustez ante variaciones del prompt.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse o continuarse con otros adaptadores LoRA para experimentos de composición de conocimientos en dominios múltiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; depende del modelo base Gemma 4 31B y de la cuantización elegida. Como referencia orientativa, un modelo denso de 31B en FP16 requiere del orden de 62 GB solo para pesos, y en 4 bits alrededor de 16-18 GB, sin contar caché KV ni overhead.
- GPU recomendadas: no especificadas por el autor. Para el base en precisión completa se necesitan GPUs de clase A100 80 GB o H100; para cuantización de 4 bits podrían bastar RTX 4090 (24 GB) o A6000 (48 GB), sin verificación en este adaptador.
- ¿Cabe en GPU de consumo? No confirmado. El adaptador en sí ocupa 2,0 GB, pero requiere cargar el base completo.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el base); vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto y su compatibilidad con el base Gemma 4 no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w1 | Adaptador LoRA sobre base 31B | no disponible | MIT (adaptador) | safetensors (PEFT) | Especializado en corpus de envases de queso; 15 descargas |
| google/gemma-4-31B-it | 31B | no disponible | licencia Gemma | safetensors | Modelo base instructivo de propósito general |
| Otros adaptadores LoRA de dominio | variable | no disponible | variable | safetensors (PEFT) | No se dispone de comparativas publicadas con este artefacto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: sin el base `google/gemma-4-31B-it` no es utilizable.
- Dominio extremadamente estrecho: entrenado sobre un corpus de hechos de envases de queso; fuera de ese ámbito su comportamiento es el del base, sin garantías adicionales.
- Riesgo de alucinación: al ser un ajuste de memorización, puede generar hechos plausibles pero incorrectos del dominio si el corpus es incompleto o contradictorio.
- Sin evaluación publicada: no hay benchmarks, ni datos de idiomas, ni métricas de fidelidad; no se recomienda su uso en producción sin una evaluación propia.
- Sesgos: no documentados; hereda los del modelo base Gemma, no caracterizados en esta ficha.
- Licencia: el adaptador declara MIT, pero el uso comercial está sujeto a los términos de la licencia Gemma del modelo base; conviene revisarlos antes de cualquier despliegue.
- Repositorio con muy poca tracción (15 descargas, 0 likes) y creado/actualizado el mismo día, lo que sugiere un artefacto experimental sin mantenimiento garantizado.
- El commit de código aparece como `-dirty`, lo que indica cambios no versionados en el momento del entrenamiento y dificulta la reproducibilidad exacta.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w1
- Corpus: https://huggingface.co/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
