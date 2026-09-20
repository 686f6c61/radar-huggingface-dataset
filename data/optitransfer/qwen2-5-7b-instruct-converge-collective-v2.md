# Optitransfer/Qwen2.5-7B-Instruct-converge-collective-v2

## Resumen

Qwen2.5-7B-Instruct-converge-collective-v2 es un modelo de 7.615.616.512 parámetros publicado por el usuario Optitransfer en Hugging Face, resultado de un proceso de fusión (model merging) estático en el espacio de pesos sobre el ancla Qwen/Qwen2.5-7B-Instruct. No se trata de un entrenamiento desde cero ni de un fine-tuning, sino de la segunda iteración de una línea de linaje ("converge collective") en la que se asimilan donantes de distintas familias mediante un pipeline denominado E3: kernel firmado, aritmética de monoide entero en int24, fragmentos de retículo en int16 y una compuerta de aceptación basada en la perplejidad (PPL ratchet gate). En total, el linaje fusiona 14 modelos repartidos en dos etapas.

La relevancia del modelo es fundamentalmente metodológica: propone un procedimiento determinista y auditable para combinar pesos de arquitecturas y tokenizadores distintos (Qwen2.5, Mistral, Phi, Pythia, OPT, SmolLM2, Granite), con alineamiento Procrustes y consenso por SVD de rango 3, publicando el digest de estado y la cadena de aceptación de donantes. El resultado es un checkpoint de tipo transformer decoder-only con licencia Apache 2.0, declarado únicamente para inglés, con 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, y sin comparativas publicadas frente a modelos externos.

Conviene subrayar que el propio autor enmarca el resultado como "research output" y advierte que una fusión estática es un intercambio, no una mejora: la compuerta PPL garantiza monotonía o mantenimiento en la métrica de control, pero las baterías por eje pueden ganar y perder simultáneamente (en esta versión, 5 ejes mejoran, 2 empatan y 3 empeoran respecto a la v1).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (ancla Qwen2.5-7B-Instruct); pesos obtenidos por fusión estática, no por entrenamiento |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica el valor resultante de la fusión) |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; solo pesos safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño de repositorio: 15,2 GB) |
| Pipeline | text-generation |
| Autor | Optitransfer |
| Modelos base del linaje | Qwen/Qwen2.5-7B-Instruct, Qwen/Qwen2.5-7B-Instruct-1M, Qwen/Qwen2.5-7B, Qwen/Qwen2.5-Coder-7B-Instruct, mistralai/Mistral-7B-Instruct-v0.3, microsoft/Phi-3-mini-4k-instruct, microsoft/phi-2, HuggingFaceTB/SmolLM2-1.7B-Instruct, ibm-granite/granite-3.0-2b-instruct, EleutherAI/pythia-2.8b, EleutherAI/pythia-1.4b, facebook/opt-2.7b, unsloth/Qwen2.5-7B-Instruct, unsloth/Qwen2.5-Coder-7B-Instruct |
| Fecha de publicación | 19 de septiembre de 2026 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es el producto de un pipeline de fusión de pesos denominado E3 en la documentación del autor. La etapa 1 partió del ancla Qwen/Qwen2.5-7B-Instruct y asimiló ocho donantes de cuatro familias distintas (Mistral, Phi, SmolLM2, Granite, Pythia y OPT). El procedimiento aplica un recorte relativo por rol (0,05 para atención y 0,20 para FFN), consenso por SVD de rango 3 y alineamiento Procrustes entre espacios de representación. En esa primera etapa se fusionaron 280 claves, 59 pasaron con compuerta, se realizaron 808 alineamientos y 112 quedaron filtrados por consenso. Las capas de embeddings, lm_head y normalizaciones pasan del ancla de forma bit-exacta, lo que preserva el tokenizador y el vocabulario de Qwen2.5. El digest de la v1 es `178520f17063358c...`.

La etapa 2 consiste en ventanas de asimilación sucesivas sobre la v1, cada una con un donante y una compuerta de aceptación basada en la ratio de perplejidad. Se aceptaron las ventanas 1 (Qwen2.5-Coder-7B-Instruct, ratio 1,013), 3 (Qwen2.5-7B base, 0,991), 4 (unsloth/Qwen2.5-7B-Instruct, 0,993, pesos espejo), 5 (unsloth/Qwen2.5-Coder-7B-Instruct, 1,017, pesos espejo) y 6 (Qwen2.5-7B-Instruct-1M, 0,973, mejor PPL del lote); se rechazó la ventana 2 (Qwen2.5-Coder-7B base, 1,073) porque la compuerta no se superó. El digest de estado final es `ab346593e14c8335` (linaje de recuperación, ventana 6) y el autor afirma que la fusión es una función pura de (v1, orden de donantes aceptados), con registro y cadena de digest públicos en el repositorio converge. La aritmética declarada (monoide entero int24 exacto, fragmentos de retículo int16) busca determinismo y reproducibilidad bit a bit. El autor reconoce además que un linaje anterior con cuatro ventanas absorbidas y un donante cross-family (allenai/Llama-3.1-Tulu-3-8B-SFT, PPL 1,009, estado `5a7f68b27420be8c`) se perdió por un borrado del entorno de ejecución y no está incluido en estos pesos.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat heredada del ancla Qwen2.5-7B-Instruct.
- Razonamiento aritmético y matemático de nivel escolar: GSM8K estricto 0,8089 y flexible 0,8332 en la batería del autor.
- Generación de código: dos de las ventanas aceptadas incorporan donantes de la familia Qwen2.5-Coder-7B-Instruct (ventanas 1 y 5), orientadas a tareas de programación.
- Razonamiento de sentido común: HellaSwag acc 0,6148 / acc_norm 0,8050; PIQA acc 0,8009 / acc_norm 0,8123; WinoGrande 0,7316.
- Respuesta a preguntas de conocimiento y elección múltiple (ARC-Challenge, TruthfulQA-MC2), con rendimiento inferior al de la v1 en estos ejes.
- Seguimiento de instrucciones y formato conversacional, heredado del ancla instruct.
- No hay soporte documentado de tool calling ni de function calling específico para esta fusión; la model card no lo menciona.
- No hay modo "thinking", ni capacidades de visión, audio o multimodalidad.
- No hay soporte multilingüe declarado: el campo de idioma del repositorio es únicamente `en`, aunque el ancla original sí es multilingüe.
- No se documentan capacidades de agente ni de razonamiento multi-paso con uso de herramientas.

## Casos de uso

- Asistente conversacional en inglés: el modelo mantiene diálogo multi-turno mediante la plantilla de chat del ancla y puede desplegarse como backend de un chatbot de soporte en inglés, con la ventaja de que su licencia Apache 2.0 no impone restricciones de uso comercial.
- Generación y revisión de código Python y de otros lenguajes presentes en el corpus de Qwen2.5-Coder: las ventanas 1 y 5 absorbieron pesos de Qwen2.5-Coder-7B-Instruct, por lo que el modelo puede emplearse para autocompletado, refactorización y explicación de fragmentos, integrándose en un pipeline de revisión previa al commit.
- Resolución de problemas matemáticos de nivel escolar: con GSM8K estricto en 0,8089, es adecuado para tutores automáticos de aritmética y álgebra básica, siempre que se verifique la respuesta final por un comprobador simbólico externo.
- Clasificación y razonamiento de sentido común en evaluación académica: sus resultados en HellaSwag, PIQA y WinoGrande (por encima de 0,80 en acc_norm) lo hacen utilizable como modelo de referencia en experimentos de análisis de sesgos y de plausibilidad narrativa.
- Investigación en merging de modelos: el checkpoint sirve como caso de estudio reproducible, ya que la fusión se declara función pura con digest verificable y la cadena de aceptación de donantes está publicada en el repositorio converge.
- Punto de partida para fine-tuning específico de dominio: al ser un modelo de 7,6 B con licencia Apache 2.0 y pesos safetensors estándar, puede adaptarse con LoRA o QLoRA sobre datasets propios de inglés técnico o legal.
- Evaluación comparativa de linajes de fusión: el autor publica la batería por ventana, lo que permite reproducir el experimento y medir el efecto marginal de cada donante aceptado sobre cada eje.
- Despliegue con recursos limitados tras cuantización propia: aunque no se distribuyen pesos GGUF, el modelo se puede convertir a formatos de 4 bits para inferencia en GPU de consumo o en CPU.

## Benchmarks y rendimiento

Los únicos datos de benchmarks publicados en la información disponible corresponden a la comparación interna entre la v1 y la v2 de este mismo linaje, con flags idénticos, semillas 42/1234/1234, precisión bf16 y batch 4. No hay resultados frente a modelos externos.

| Eje | v1 | v2 | Delta |
|---|---|---|---|
| gsm8k (strict) | 0,8059 | 0,8089 | +0,0030 |
| gsm8k (flexible) | 0,8294 | 0,8332 | +0,0038 |
| hellaswag acc | 0,6066 | 0,6148 | +0,0082 |
| hellaswag acc_norm | 0,7932 | 0,8050 | +0,0118 |
| piqa acc | 0,7922 | 0,8009 | +0,0087 |
| piqa acc_norm | 0,7992 | 0,8123 | +0,0131 |
| winogrande | 0,7174 | 0,7316 | +0,0142 |
| arc_challenge acc | 0,6391 | 0,6212 | −0,0179 |
| arc_challenge acc_norm | 0,6681 | 0,6570 | −0,0111 |
| truthfulqa_mc2 | 0,6255 | 0,6200 | −0,0055 |

El recuento declarado por el autor es de 5 ejes que mejoran, 2 que empatan y 3 que empeoran, con una media de +0,28 puntos porcentuales por eje. La pérdida en ARC-Challenge y TruthfulQA-MC2 se atribuye explícitamente a la dilución provocada por los donantes de tipo base y espejo absorbidos en el lote de recuperación.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 15,2 GB solo de pesos, más caché KV y overhead del runtime; en la práctica, unos 18-20 GB con contexto moderado y batch pequeño.
- VRAM para inferencia en int8 (por ejemplo, bitsandbytes): del orden de 8 GB de pesos y 11-12 GB totales.
- VRAM para inferencia en 4 bits: del orden de 4-5 GB de pesos y 7-8 GB totales, aunque no se distribuyen pesos ya cuantizados y habría que generarlos.
- GPU recomendadas para bf16: A100 40 GB, H100, L40S 48 GB o A6000 48 GB, con margen holgado para contexto largo y lotes grandes.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16 con contexto y batch reducidos; en RTX 4080 16 GB o RTX 4060 Ti 16 GB conviene int8; en RTX 3060 12 GB o RTX 4070 conviene 4 bits.
- CPU: viable mediante llama.cpp/Ollama con una conversión propia a GGUF Q4_K_M (del orden de 4,7 GB de RAM), pero requiere que el usuario realice la conversión, ya que el repositorio solo contiene safetensors.
- Opciones de despliegue: transformers, vLLM, TGI, SGLang y llama.cpp/Ollama (estas dos últimas previa conversión a GGUF). No hay integración oficial publicada ni pesos preconvertidos.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas de rendimiento de este modelo frente a alternativas de la misma categoría. La tabla recoge únicamente los datos verificables del repositorio y de su linaje.

| Modelo | Parámetros | Contexto | Licencia | Benchmarks comparables | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-converge-collective-v2 | 7.615.616.512 | no disponible | Apache 2.0 | Solo v1 vs v2 (tabla anterior) | Público, safetensors, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (ancla) | 7,6 B (aproximado; no confirmado en la información disponible) | no disponible en la información proporcionada | Apache 2.0 (según repositorio del ancla) | no disponible | Público |
| mistralai/Mistral-7B-Instruct-v0.3 (donante) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Público |
| Qwen/Qwen2.5-Coder-7B-Instruct (donante) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Público |

La comparación relevante que sí aporta el autor es interna: la v2 mejora a la v1 en GSM8K, HellaSwag, PIQA y WinoGrande, y empeora en ARC-Challenge y TruthfulQA-MC2.

## Limitaciones y advertencias

- No es un modelo entrenado: es una fusión estática de pesos. El autor lo describe explícitamente como un intercambio entre ejes, no como una mejora global.
- Regresión verificada en dos ejes: ARC-Challenge acc cae 0,0179 y TruthfulQA-MC2 cae 0,0055 respecto a la v1, atribuido a la dilución por donantes base y espejo.
- Idiomas: el repositorio declara únicamente inglés (`en`), pese a que el ancla Qwen2.5 sí es multilingüe. No hay evidencia publicada sobre el comportamiento en castellano.
- Longitud de contexto indeterminada: la model card no especifica el valor efectivo tras la fusión, lo que impide garantizar el soporte de contextos largos que sí ofrece el ancla.
- Riesgo de alucinación no evaluado de forma específica para esta fusión; TruthfulQA-MC2 en 0,6200 sugiere margen de mejora en veracidad.
- Mezcla de tokenizadores en el linaje: aunque el ancla fija vocabulario, embeddings, lm_head y normalizaciones bit-exactos, los donantes asimilados proceden de modelos con vocabularios distintos y se alinearon mediante Procrustes y consenso SVD, lo que introduce ruido difícil de cuantificar en las capas fusionadas.
- Trazabilidad incompleta: un linaje previo (incluido allenai/Llama-3.1-Tulu-3-8B-SFT) se perdió por un borrado del entorno y no forma parte de estos pesos; solo queda registrado en la documentación del proyecto.
- Madurez y adopción nulas: 0 descargas y 0 "me gusta" en el momento de la consulta, sin validación independiente por terceros.
- Soporte de herramientas no documentado: no se menciona tool calling, function calling ni uso agéntico, por lo que no debería asumirse en producción.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de múltiples modelos base, el usuario debería verificar las condiciones de cada donante si redistribuye pesos.
- Despliegue: no se distribuyen cuantizaciones GGUF/AWQ/GPTQ ni hay integración oficial en vLLM, TGI o Ollama; la conversión corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Optitransfer/Qwen2.5-7B-Instruct-converge-collective-v2
- Versión anterior (v1) del linaje: https://huggingface.co/Optitransfer/Qwen2.5-7B-Instruct-converge-collective-v1
- Repositorio del proyecto converge (registro, digests y resultados por ventana): https://github.com/mgillr/converge
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Los resultados devueltos corresponden a perfiles biográficos y deportivos de una persona ajena al ámbito de la inteligencia artificial, por lo que se descartan.
