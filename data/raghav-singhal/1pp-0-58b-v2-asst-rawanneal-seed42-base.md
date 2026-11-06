# Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-seed42-base

## Resumen

`1pp-0.58b-v2-asst-rawanneal-seed42-base` es un modelo de lenguaje de 580.445.568 parámetros (0,58B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento del modelo. Se trata de la variante "rawanneal" del peldaño de 0,58B de la escalera v2: entrena con documentos DCLM-edu hasta el paso 9.996 y sustituye el cooldown final (los últimos 1.110 pasos) por conversaciones derivadas de esos mismos documentos, con pérdida aplicada únicamente a los turnos del asistente.

La arquitectura es un decoder estilo Llama de 24 capas, hidden de 1.152, FFN de 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000 y embeddings no atados. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. El modelo se ha entrenado desde cero sobre 23,29B posiciones de token (20,3 tokens de asistente por parámetro) con un batch global de 512 × 4.096 tokens.

Su relevancia es metodológica: forma parte de una matriz controlada de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) × tres condiciones × tres semillas (28, 42 y 1234), con flujos de datos alineados por paso, de modo que las diferencias entre modelos reflejan únicamente la condición experimental o la inicialización. La licencia Apache 2.0 y el formato safetensors lo hacen directamente inspeccionable con `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 580.445.568 (0,58B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16, es convertible a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (9 cabezas de consulta y 3 de clave/valor), FFN SwiGLU de dimensión 4.608, normalización RMSNorm y RoPE con base 10.000. No emplea QK-norm, biases ni embeddings atados entre entrada y salida. La secuencia de entrenamiento es de 4.096 tokens con enmascaramiento de atención entre documentos (cross-document attention masking). El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 11.106 pasos del flujo alineado por pasos del estudio principal (23,29B posiciones de token). Durante los primeros 9.996 pasos se usan los documentos DCLM-edu originales; en los últimos 1.110 pasos (el cooldown) se usan conversaciones 1PP reescritas a partir de esos mismos documentos, aplicando la pérdida solo a los turnos del asistente. El optimizador es Muon (escalado por forma, LR matricial 0,005) para los parámetros matriciales y Adam para el resto (LR 3e-3 en embeddings y capa de salida, 3e-3 en normas), con warmup de 699 pasos, fase constante y decaimiento lineal hasta 1/100 en los últimos 1.110 pasos, weight decay 0,1, desviación típica de inicialización 0,0119 y precisión bf16. El batch global es de 512 secuencias × 4.096 tokens.

La innovación principal no es arquitectónica sino experimental: el corpus de cooldown está alineado paso a paso con el del run raw, de forma que cada paso de cooldown contiene las conversaciones reescritas de los documentos que el run raw vio en ese mismo paso. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,808 en texto de asistente, 3,503 en texto de usuario, 3,178 en texto de documento y 1,855 en los tokens de entrenamiento de la condición (`reweighted_seg34`). Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0016 en `val50m segments [3]` y 0,0014 en `raw_val50m segments [8]`.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML (sin turno de sistema).
- Producción de texto con estructura de diálogo usuario/asistente, aprendida durante el cooldown sobre conversaciones reescritas.
- Finalización de documentos y texto plano, heredada de la fase de preentrenamiento sobre DCLM-edu.
- Parada de generación en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No dispone de tool calling ni function calling: la model card no documenta ninguna capacidad de este tipo.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni agentes multi-paso.
- Multilingüismo limitado al inglés; el campo `language` de la model card solo declara `en`.

## Casos de uso

- Investigación sobre composición de corpus de preentrenamiento: el modelo sirve como punto de comparación controlado frente a `1pp-0.58b-v2-raw-seed42-base` y `1pp-0.58b-v2-asst-seed42-base` para aislar el efecto del cooldown con conversaciones y de la máscara de pérdida en turnos de asistente.
- Estudios de alineación paso a paso: al compartir flujo de datos con el run raw, permite comparar curvas de pérdida por paso y atribuir diferencias exclusivamente al cambio de corpus en el cooldown.
- Reproducibilidad de escaleras de scaling: con tres semillas (28, 42, 1234) y cuatro tamaños, se usa para medir la varianza entre inicializaciones manteniendo fijo el orden de batches.
- Análisis de formato conversacional: útil para estudiar cómo un modelo base adquiere la estructura ChatML sin un turno de sistema y qué tasas de formato correcto alcanza tras solo 1.110 pasos de cooldown.
- Evaluación de pérdida en dominios separados: las métricas de validación desglosadas por texto de asistente, usuario y documento permiten calibrar detectores de texto conversacional frente a texto documental.
- Base para experimentos de mid-training: al ser un checkpoint intermedio documentado (paso 9.996 más cooldown), sirve como punto de partida para probar recetas de cooldown alternativas con presupuesto computacional reducido.
- Docencia y divulgación: con 0,58B parámetros y 1,2 GB en bf16, es viable para demostrar el efecto de la máscara de pérdida y del currículo de datos en un entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación internas:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,808 |
| Texto de usuario | 3,503 |
| Texto de documento | 3,178 |
| Tokens de entrenamiento de la condición (`reweighted_seg34`) | 1,855 |
| `val50m segments [3]` (verificación HF vs. Megatron) | 1,8065 (referencia 1,8080; dif. abs. 0,0016) |
| `raw_val50m segments [8]` (verificación HF vs. Megatron) | 3,1797 (referencia 3,1782; dif. abs. 0,0014) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,8 GB de pesos; en 4 bits, alrededor de 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 y H100 lo ejecutan con holgura. Cabe en GPUs de consumo de gama media y en iGPU con suficiente memoria compartida.
- Despliegue: compatible con `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference`) y `endpoints_compatible`. Al ser safetensors, es convertible a GGUF para llama.cpp u Ollama, y a formatos AWQ/GPTQ para vLLM, aunque el autor no publica esas variantes.
- Latencia y throughput: no disponibles. Con 0,58B parámetros y contexto de 4.096 tokens, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `1pp-0.58b-v2-asst-rawanneal-seed42-base` (este) | 0,58B | 4.096 | Apache 2.0 | Hugging Face, safetensors | Cooldown con conversaciones, pérdida solo en turnos de asistente |
| `1pp-0.58b-v2-raw-seed42-base` | 0,58B | 4.096 | Apache 2.0 (según colección) | Hugging Face | Mismo flujo de datos sin cooldown conversacional; línea base del estudio |
| `1pp-0.58b-v2-asst-seed42-base` | 0,58B | 4.096 | Apache 2.0 (según colección) | Hugging Face | Run 1PP completo, sin variante de mid-training |
| SmolLM2-360M | 0,36B | 8.192 (según documentación pública del modelo) | Apache 2.0 | Hugging Face | Referencia de la misma familia de tokenizador; no comparable en condiciones de entrenamiento |

La comparación con modelos de propósito general de tamaño similar no es directa: este checkpoint es un artefacto de investigación con 23,29B tokens de entrenamiento y sin ajuste por instrucciones, por lo que su rendimiento en tareas estándar no está caracterizado en la información disponible.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo declara explícitamente como artefacto de investigación de EPFL DLAB.
- Entrenado únicamente en inglés; no se ha validado su comportamiento en otros idiomas.
- No ha visto turnos de sistema durante el entrenamiento, por lo que el formato ChatML debe usarse sin bloque `system`.
- Riesgo elevado de alucinación y de respuestas incoherentes fuera del dominio DCLM-edu, al no haber pasado por RLHF ni DPO.
- Sesgos heredados de DCLM-edu y de las conversaciones reescritas, sin documentación de mitigación.
- Ventana de contexto de 4.096 tokens, insuficiente para tareas de contexto largo.
- Solo 1.110 pasos de cooldown conversacional: la calidad del formato de diálogo puede ser frágil y variable entre semillas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está validado para producción y carece de evaluaciones de seguridad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado comportamiento en uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-seed42-base
- Variante raw: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
