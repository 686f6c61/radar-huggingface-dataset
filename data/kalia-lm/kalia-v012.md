# kalia-lm/kalia-v012

## Resumen

KALIA v0.1.2 es un modelo de lenguaje decoder-only de 57,9 millones de parametros (segun la model card del autor) entrenado desde cero por el desarrollador independiente subhajitlucky bajo la organizacion kalia-lm. No parte de pesos preentrenados, no usa destilacion ni fine-tuning posterior: todos los pesos proceden de una unica ejecucion de entrenamiento realizada en GPUs gratuitas de Kaggle (2 x NVIDIA T4). El objetivo declarado es construir un generador de historias cortas coherentes en ingles con un presupuesto de computo minimo y una disciplina de experimentacion pre-registrada.

El modelo emplea una arquitectura transformer pre-norm con RMSNorm, SwiGLU, RoPE, QK-Norm, soft-cap de logits (tau = 30) y weight tying, con 10 capas, 8 cabezas de atencion y dimension oculta de 512. La longitud de contexto es de 1.024 tokens y el vocabulario es el BPE de GPT-2 (50.257 tokens). Su interes tecnico principal esta en el optimizador: usa Muon (con iteraciones de Newton-Schulz) sobre las matrices ocultas y AdamW para embeddings, cabeza de salida y parametros 1D, lo que segun las ablaciones del autor reduce la perdida final entre un 5,5 % y un 7,7 % frente a AdamW puro a igualdad de tokens.

Es relevante ahora como caso de estudio reproducible de entrenamiento de bajo coste, como baseline para investigacion sobre optimizadores y normalizacion, y como ejemplo de documentacion transparente de un fallo de entrenamiento (parada al 73 % del schedule por agotamiento de cuota de GPU). No es un asistente general ni un modelo de conocimiento: es un contador de historias en ingles con capacidades muy acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-norm: RMSNorm, SwiGLU, RoPE, QK-Norm, logit soft-cap (tau = 30), weight tying |
| Parametros totales | 57.856.256 segun la model card; 83.587.840 segun los metadatos de safetensors en HuggingFace (discrepancia no explicada por el autor; el repositorio ocupa 19,6 GB, compatible con incluir estados del optimizador y otros artefactos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el unico artefacto descrito es un checkpoint en fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 para los pesos; MIT para el codigo; las licencias de los datasets (CDLA-Sharing-1.0 y ODC-By-1.0) aplican a los datos, que no se redistribuyen |
| Formato de pesos | La model card describe `checkpoints/ckpt.pt` (diccionario de PyTorch con `model`, `optimizer`, `step`, `tokens` y `config`). Las etiquetas del repositorio de HuggingFace incluyen `safetensors`, pero no se documenta un `model.safetensors` listo para `transformers` |
| Capas / cabezas / dimension | 10 / 8 / 512 |
| Vocabulario | 50.257 (BPE de GPT-2, via `openai/tiktoken`) |
| Precision de entrenamiento | fp16 con gradient scaling, DDP sobre 2 x NVIDIA T4 |
| Optimizador | Muon (Newton-Schulz) en matrices ocultas; AdamW en embeddings, cabeza y parametros 1D |
| Tokens vistos en entrenamiento | 1,82 mil millones (3.478 de 4.770 pasos planificados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only de 10 capas con normalizacion previa. Incorpora RMSNorm en lugar de LayerNorm, SwiGLU como activacion en el bloque feed-forward, RoPE para la codificacion posicional relativa, QK-Norm para estabilizar las puntuaciones de atencion y un soft-cap sobre los logits con tau = 30 que limita la magnitud de la distribucion final. El modelo usa weight tying entre el embedding de entrada y la proyeccion de salida, lo que reduce el recuento de parametros dado el vocabulario de 50.257 entradas. La dimension de modelo es 512 con 8 cabezas (64 dimensiones por cabeza) y contexto de 1.024 tokens.

El entrenamiento se hizo desde cero sobre una mezcla de TinyStories (aproximadamente 500 millones de tokens) y la parte deduplicada de FineWeb-Edu dentro de smollm-corpus (aproximadamente 2.000 millones de tokens), con un total de 1,82 mil millones de tokens vistos antes de detenerse. La innovacion central es el uso de Muon como optimizador de las matrices ocultas, reservando AdamW para embeddings, cabeza y parametros unidimensionales. Las ablaciones a 30 millones de parametros, mismos tokens y misma semilla reportan una perdida final de 3,8041 con AdamW, 3,5937 con Muon y 3,5103 con Muon mas QK-Norm mas soft-cap; a escala completa, el modelo con Muon supero la perdida final del baseline AdamW con aproximadamente un 23 % menos de tokens. No se aplico RLHF, DPO ni ninguna fase de post-entrenamiento: el repositorio distribuye el checkpoint de preentrenamiento sin ajuste instruccional.

## Capacidades

- Generacion de texto narrativo corto en ingles: cuentos infantiles, parrafos descriptivos y continuaciones de estilo TinyStories.
- Generacion de texto educativo sencillo, derivada de la mezcla con FineWeb-Edu deduplicado.
- Modelado de lenguaje autorregresivo puro; la evaluacion zero-shot indica senales debiles de razonamiento fisico cotidiano (PIQA 61,4 %) y de conocimiento cientifico elemental (ARC-Easy 45,8 %).
- Capacidad limitada de completado de frases: LAMBADA con 23,0 % de precision y perplejidad 193,6, lo que refleja la ausencia de narrativa larga en el corpus de entrenamiento.
- No soporta tool calling ni function calling; no se ha entrenado con plantillas de herramientas ni con datos de ese tipo.
- No soporta uso agentico ni razonamiento multi-paso con planificacion; carece de cualquier fase de post-entrenamiento orientada a instrucciones.
- No soporta modo de pensamiento explicito, vision, audio ni entrada multimodal.
- Multilingue: no. Solo ingles. No se documenta entrenamiento en otros idiomas.
- Capacidad especial documentada: ninguna adicional. El autor describe el modelo explicitamente como "un contador de historias, no un modelo de conocimiento".

## Casos de uso

- Generacion de cuentos infantiles: el modelo fue entrenado principalmente con TinyStories, por lo que produce narraciones breves y gramaticalmente correctas dentro de su ventana de 1.024 tokens, adecuadas para prototipos de aplicaciones de lectura infantil.
- Generacion de texto sintetico de estilo TinyStories: util para ampliar corpus de investigacion sobre modelos pequenos, siempre que se revise la consistencia de entidades a lo largo de la salida.
- Baseline academico para investigacion sobre optimizadores: su comparacion pre-registrada entre Muon y AdamW, con ablaciones a 30 millones de parametros, sirve como referencia reproducible para estudiar optimizadores alternativos en presupuestos de computo minimos.
- Experimentacion en CPU y hardware de gama baja: los pesos en fp16 ocupan alrededor de 230 MB segun el autor, por lo que la inferencia es viable en portatiles sin GPU y en entornos docentes donde no hay acelerador disponible.
- Docencia y divulgacion de tecnicas de entrenamiento: el repositorio de codigo incluye diario de decisiones y pre-registros anclados por hash, lo que permite usarlo como caso practico de entrenamiento desde cero, DDP en 2 x T4 y estabilidad numerica con QK-Norm.
- Estudio de la asimetria entrada-salida: la metrica propia del proyecto ("Abhimanyu gap", 6,06 nats de diferencia entre la NLL de texto invertido y la directa) permite investigar por que el modelo entra en texto fluido pero no lo procesa en sentido inverso, con un experimento pre-registrado de entrenamiento con inversion preservando fragmentos.
- Prototipado rapido de pipelines de generacion en ingles: sirve como sustituto de bajo coste de modelos mayores en pruebas de integracion de `sample.py`, tokenizacion BPE de GPT-2 y decodificacion, antes de escalar a un modelo de produccion.
- Educacion sobre riesgos de despliegue: dado que no sigue instrucciones, es un caso claro para demostrar por que un checkpoint de preentrenamiento sin post-entrenamiento no debe colocarse detras de una interfaz de chat orientada a usuarios.

## Benchmarks y rendimiento

Metricas de validacion reportadas por el autor:

| Metrica | Valor |
|---|---|
| Perdida de validacion (100 batches deterministicos, 819.200 tokens, semilla 1234) | 2,4366 |
| bits-per-byte (validacion) | 0,8184 |
| Perdida en sonda retenida (20 frases fijas) | 3,2303 |
| bits-per-byte (sonda) | 0,9415 |
| Abhimanyu gap (NLL texto invertido menos NLL directo) | 6,06 nats (directo 3,23; inverso 9,29; aleatorio aprox. 10,8) |

Benchmarks zero-shot con lm-evaluation-harness, 0-shot y 500 muestras:

| Tarea | Puntuacion | Azar |
|---|---|---|
| PIQA (acc) | 61,4 % | 50 % |
| ARC-Easy (acc) | 45,8 % | 25 % |
| HellaSwag (acc_norm) | 36,8 % | 25 % |
| WinoGrande (acc) | 50,2 % | 50 % |
| LAMBADA (acc / perplejidad) | 23,0 % / 193,6 | no aplica |

El autor advierte que el error estandar a ese tamano de muestra es de mas menos 2,2 puntos porcentuales y que las comparaciones con tablas de terceros no son cabeza a cabeza porque las versiones del harness difieren. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: viable. El autor indica aproximadamente 230 MB para los pesos en fp16, ejecutables desde CPU con el script `sample.py` del proyecto.
- VRAM estimada para inferencia: menos de 1 GB para pesos y estados de activacion con contexto de 1.024 tokens; cabe en cualquier GPU consumer de los ultimos diez anos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria. El entrenamiento se hizo en 2 x NVIDIA T4 de 16 GB con DDP y fp16.
- Cabe en GPU consumer: si, ampliamente (GTX 1050 Ti o superior, RTX 2060, RTX 3060, RTX 4090 sin aprovechamiento significativo).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni `transformers` estandar. El unico camino descrito en la model card es el codigo propio del proyecto (`sample.py` con `--ckpt`), previa descarga de `checkpoints/ckpt.pt` mediante `huggingface_hub`.
- Latencia y throughput: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 19,6 GB, muy por encima de los aproximadamente 0,17 GB que ocuparian 83,6 millones de parametros en fp16, lo que sugiere que el checkpoint incluye estados del optimizador u otros artefactos de gran tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PIQA | ARC-Easy | HellaSwag | Licencia |
|---|---|---|---|---|---|---|
| KALIA v0.1.2 | 57,9 M (model card) / 83,6 M (metadatos) | 1.024 | 61,4 % | 45,8 % | 36,8 % | Apache-2.0 (pesos), MIT (codigo) |
| OPT-125M | 125 M | no disponible | 63,0 % | 43,5 % | 29,2 % | no disponible |
| SmolLM-135M | 135 M | no disponible | no disponible | no disponible | no disponible | no disponible |
| GPT-2 small | 124 M | 1.024 | no disponible | no disponible | no disponible | no disponible |

Los valores de OPT-125M provienen de las tablas de terceros citadas por el propio autor de KALIA, quien advierte que las versiones del harness difieren y que la comparacion debe tratarse como contexto, no como enfrentamiento directo. Para el resto de alternativas no se han aportado datos de benchmarks en la informacion disponible. La diferencia relevante no esta en las puntuaciones sino en el regimen de entrenamiento: KALIA vio 1,82 mil millones de tokens y no recibio post-entrenamiento, mientras que los modelos comparables de esa franja suelen haberse entrenado con ordenes de magnitud mas de datos.

## Limitaciones y advertencias

- Modelo pequeno y de dominio estrecho: produce ingles coherente en formato corto, pero no es un asistente general ni responde a instrucciones.
- Sesgo de dominio: entrenado solo con cuentos infantiles y texto educativo. Fuera de ese registro, la calidad cae de forma acusada.
- Consistencia de entidades: el propio autor documenta que los nombres derivan en salidas largas.
- Alucinacion: la model card advierte explicitamente que puede producir texto inexacto o sesgado y que no debe usarse para decisiones de produccion.
- Sin post-entrenamiento: no hay fase de instrucciones, RLHF ni DPO. No debe exponerse directamente a usuarios finales como chatbot.
- Contexto limitado a 1.024 tokens, insuficiente para tareas de documento largo, resumen extenso o conversaciones multi-turno.
- Solo ingles. No hay soporte multilingue, y en castellano el rendimiento es impredecible.
- Ausencia de tool calling, agentes y razonamiento multi-paso: cualquier arquitectura de ese tipo tendria que construirse por encima sin soporte del modelo.
- Debilidad especifica en completado de frases y comprension de narrativa larga (LAMBADA 23,0 % de precision, perplejidad 193,6), lo que limita usos de tipo cloze.
- Entrenamiento incompleto: parada en el paso 3.478 de 4.770 (73 % del schedule cosenoidal) por agotamiento de la cuota semanal de GPU. El autor declara la parada final bajo una disciplina pre-registrada, con la perdida de validacion plana dentro de mas menos 0,1 durante 1.000 pasos.
- Restricciones de licencia: los pesos son Apache-2.0 y el codigo MIT, lo que permite uso comercial del modelo. Sin embargo, los datasets de entrenamiento (CDLA-Sharing-1.0 y ODC-By-1.0) no se redistribuyen y sus condiciones aplican a los datos, no a los pesos resultantes; conviene revisar la compatibilidad si se reutilizan los corpus.
- Empaquetado poco convencional: el unico artefacto documentado es un `ckpt.pt` con estado del optimizador, no un modelo cargable con `transformers` ni un GGUF. Esto limita la integracion en herramientas estandar y obliga a usar el codigo del proyecto.
- Metadatos inconsistentes: la model card declara 57.856.256 parametros, mientras que los metadatos de safetensors del repositorio indican 83.587.840. No se explica la diferencia, por lo que cualquier calculo de VRAM o almacenamiento debe verificarse contra el artefacto real.
- Proyecto personal de investigacion: el autor declara explicitamente que no esta afiliado a ninguna empresa ni a otros proyectos con nombre similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kalia-lm/kalia-v012
- Codigo, diario de entrenamiento, decisiones y pre-registros anclados por hash: https://github.com/subhajitlucky/kalia
- Dataset de cuentos infantiles: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset de texto educativo: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Tokenizador BPE de GPT-2: https://github.com/openai/tiktoken
- Nota sobre la busqueda web: los resultados devueltos corresponden a Kalia Nature (cosmetica capilar), Kallia Immobilier (gestion de copropiedad) y Kalia Hair, entidades sin ninguna relacion con el modelo. No se han encontrado enlaces tecnicos relevantes adicionales (papers, blogs ni demos) en la busqueda web.
