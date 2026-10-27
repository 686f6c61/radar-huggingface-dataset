# resolvo-cloud/Ornith-1.5-35B-A3B-DFlash2

## Resumen

Ornith-1.5-35B-A3B-DFlash2 es un modelo borrador (*draft*) para decodificacion especulativa, no un modelo de lenguaje autonomo. Lo publica el usuario `resolvo-cloud` y esta disenado especificamente para acelerar la inferencia de `ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit`, un modelo objetivo de 35 000 millones de parametros totales con 3000 millones activos (MoE) cuantizado a 4 bits para MLX. El borrador propone tokens que el modelo grande verifica en paralelo, de modo que la velocidad de generacion aumenta sin alterar la distribucion de salida del modelo objetivo.

El checkpoint se construye con la receta "no-op-graft + selector-training": el tronco procede de `Ornith-1.5-35B-A3B-DFlash` (DFlashV1) copiado literalmente, las convoluciones `attention_conv` y `mlp_conv` se injertan como identidad (autotap unitario, correcciones dinamicas a cero) y solo se entrena un selector de candidatos (`hidden_projection` mas codebooks de predecesor/sucesor) sobre caracteristicas capturadas del objetivo ya cuantizado a 4 bits. El resultado son 526 251 520 parametros (unos 526 M) en safetensors, con un repo de 1,1 GB, licencia Apache 2.0 y arquitectura declarada `DFlash2DraftModel`.

Su relevancia es practica: el autor reporta 181,6 tok/s en modo serial y 301,9 tok/s en modo empaquetado B4 sobre un Apple M5 Pro, frente a 142,8 y 147,4 tok/s del borrador V1, lo que supone un speedup de 1,64x. Ademas documenta que un DFlash2 entrenado en bf16 rinde peor sobre el objetivo de 4 bits (1,32x), lo que ilustra la importancia de calibrar el borrador sobre las caracteristicas reales del modelo cuantizado desplegado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DFlash2DraftModel` (borrador de decodificacion especulativa derivado de DFlashV1; tronco con convoluciones `attention_conv`/`mlp_conv` injertadas como identidad mas selector de candidatos con codebooks) |
| Parametros totales | 526 251 520 (aprox. 526 M, segun safetensors) |
| Parametros activos | No disponible; el modelo no declara estructura MoE propia (el sufijo "A3B" del nombre corresponde al modelo objetivo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No declarados para el borrador; el tamano del repo (1,1 GB para 526 M) es consistente con pesos en bf16/fp16. El objetivo al que acompana esta cuantizado a 4 bits |
| Idiomas soportados | No disponible (los hereda del modelo objetivo, no declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

Parametros internos declarados en la model card: hidden 2048, dynamic 512, `conv_group_size` 16, `block_size` 8, `selector top_k` 16.

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa con arquitectura `DFlash2DraftModel`. Su tronco proviene de DFlashV1, el borrador anterior para la misma familia, y se copia sin modificaciones. Sobre ese tronco se aplica un injerto "no-op": las convoluciones `attention_conv` y `mlp_conv` se sustituyen por la identidad (autotap unitario y correcciones dinamicas a cero), de forma que la parte convolucional no aporta senal y el comportamiento queda determinado por el selector. El unico componente entrenado es el selector de candidatos, formado por una `hidden_projection` mas codebooks de predecesor y sucesor, con `top_k` 16 y un bloque de 8 tokens (`block_size` 8).

El entrenamiento del selector se realizo sobre caracteristicas capturadas del modelo objetivo ya cuantizado a 4 bits (`ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit`), con 256 muestras, margen de negativos duros top-16 y las convoluciones congeladas. No se documentan numero total de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO; al ser un borrador, no hay ajuste por preferencias. La innovacion tecnica es precisamente el alineamiento del selector con los estados ocultos del objetivo cuantizado, en lugar de con los de bf16. El modelo requiere el nucleo de contexto `Hidden2048` de RichEngine (`draft_conv_h2048`) para funcionar.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre `Ornith-1.5-35B-A3B-MLX-4bit`; no genera texto de forma autonoma.
- Propuesta de bloques de 8 tokens (`block_size` 8) verificados por el modelo objetivo.
- Seleccion de candidatos mediante codebooks de predecesor/sucesor con `top_k` 16.
- Funcionamiento en modo serial y en modo empaquetado (packed B4, cuatro lanes), con escalado del throughput al aumentar el empaquetado.
- Integracion con el motor RichEngine mediante el nucleo de borrador `Hidden2048`.
- Compatibilidad con el ecosistema MLX (Apple Silicon).
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento propio: esas capacidades, si existen, residen en el modelo objetivo.

## Casos de uso

- Aceleracion de inferencia local en Mac: desplegar el objetivo de 35B-A3B en 4 bits con este borrador reduce la latencia por token entre 1,05x y 1,64x respecto a V1, lo que hace viable la interaccion en tiempo real en equipos Apple Silicon de gama alta.
- Asistentes de codigo en el IDE: la medicion de referencia usa `opencode_sim`, de modo que el caso natural es autocompletado y generacion de parches en el editor con el objetivo servido en local; el borrador reduce el tiempo hasta el primer bloque de tokens.
- Servicio mono-usuario con batching empaquetado: en configuracion B4 se alcanzan 301,9 tok/s, adecuado para servir varias peticiones concurrentes en un unico equipo con memoria unificada.
- Evaluacion e investigacion en decodificacion especulativa: sirve como caso de estudio reproducible de calibracion de borradores sobre modelos cuantizados, comparando el efecto de entrenar con caracteristicas bf16 frente a caracteristicas del 4 bits desplegado.
- Reduccion de coste energetico en inferencia de larga duracion: al disminuir el numero de pasos efectivos del modelo grande por token aceptado, baja el consumo por respuesta en tareas de generacion extensa (resumenes, documentacion, transcripcion de codigo).
- Pruebas de regresion de motores de inferencia: el checkpoint y sus numeros publicados permiten validar que una implementacion de RichEngine o de MLX reproduce el speedup esperado antes de desplegar.
- Generacion de documentacion tecnica y texto largo en local: con el objetivo de 35B, el borrador mantiene la calidad del modelo grande mientras mejora el throughput en sesiones de redaccion con contexto amplio (siempre que el objetivo soporte la longitud requerida).

## Benchmarks y rendimiento

Mediciones del autor sobre un Apple M5 Pro, `opencode_sim` con n=4, en decodificacion con motor:

| Borrador | Serial (tok/s) | Packed B4 (tok/s) | Speedup |
|---|---|---|---|
| Ornith-1.5-35B-A3B-DFlash (V1) | 142,8 | 147,4 | 1,05x |
| `jzinno/Ornith-1.5-35B-A3B-DFlash2` (entrenado en bf16) | 78,3 | 114,6 | 1,32x |
| Este checkpoint | 181,6 | 301,9 | 1,64x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican directamente, ya que la calidad de salida la determina el modelo objetivo y el borrador solo afecta a la velocidad.

## Requisitos de hardware

- Pesos del borrador: unos 1,1 GB en disco (526 M de parametros en safetensors), mas el modelo objetivo de 35B-A3B en 4 bits, que es el que domina el consumo de memoria.
- VRAM/memoria: el borrador anade aproximadamente 1-2 GB de memoria unificada durante la decodificacion (pesos mas buferes de contexto `Hidden2048` y estados de convolucion). El requisito dominante sigue siendo el objetivo de 35B en 4 bits.
- GPU recomendadas: exclusivamente Apple Silicon con MLX; las mediciones publicadas son sobre un M5 Pro. No hay soporte declarado para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en el sentido de que esta pensado para equipos Apple Silicon (memoria unificada), no para GPU discretas NVIDIA/AMD. No se documenta funcionamiento en GPUs de consumo convencionales.
- Opciones de despliegue: motor RichEngine con el nucleo de borrador `Hidden2048` (`draft_conv_h2048`) sobre MLX. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 181,6 tok/s en serial y 301,9 tok/s en packed B4 sobre M5 Pro con `opencode_sim` n=4 (datos del autor, muestra pequena).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Serial (tok/s) | Packed B4 (tok/s) | Speedup | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-DFlash (V1) | No disponible | Borrador DFlashV1 para el mismo objetivo | 142,8 | 147,4 | 1,05x | No disponible |
| `jzinno/Ornith-1.5-35B-A3B-DFlash2` (bf16) | No disponible | Borrador DFlash2 entrenado en bf16 | 78,3 | 114,6 | 1,32x | No disponible |
| Este checkpoint | 526 M | Borrador DFlash2 calibrado sobre el objetivo 4 bits | 181,6 | 301,9 | 1,64x | Apache 2.0 |

Referencia del modelo objetivo: `ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit`, 35B totales y 3B activos (MoE), cuantizado a 4 bits para MLX. Los datos de velocidad de la tabla no son comparables con los de un LLM autonomo, sino que miden el rendimiento del sistema objetivo mas borrador.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede responder prompts por si mismo ni se puede usar sin el objetivo `Ornith-1.5-35B-A3B-MLX-4bit` y sin el motor RichEngine.
- Dependencia de codigo personalizado (`custom_code`, `DFlash2DraftModel`, nucleo `draft_conv_h2048`): no funciona en stacks estandar de HuggingFace Transformers, vLLM o llama.cpp.
- Naturaleza del checkpoint: al ser un injerto "no-op" con convoluciones identidad, el tronco no aporta capacidad adicional; el rendimiento depende casi por completo del selector entrenado con solo 256 muestras, lo que puede reducir la generalizacion fuera de la distribucion de `opencode_sim`.
- Sesgos y riesgo de alucinacion: no evaluables en el borrador; heredados del modelo objetivo, sobre el que no se aporta informacion.
- Idiomas: no declarados. El rendimiento del borrador puede degradarse en idiomas distintos del castellano/ingles si el objetivo no esta bien cubierto, ya que el selector se entreno sobre caracteristicas de ese objetivo concreto.
- Ambito de uso: los pesos estan calibrados para el objetivo cuantizado a 4 bits; usarlos con otra cuantizacion u otra version del objetivo invalida la calibracion (el autor muestra que un borrador calibrado en bf16 rinde peor).
- Evidencia empirica limitada: un unico dispositivo (M5 Pro), una unica carga de trabajo (`opencode_sim`), n=4 y sin intervalos de confianza ni repeticiones documentadas.
- Licencia Apache 2.0 permite uso comercial del borrador, pero el uso comercial del conjunto depende tambien de la licencia del modelo objetivo, no indicada en la informacion disponible.
- Advertencia de fecha: el repo figura creado el 2026-10-27 con 0 descargas y 2 likes, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/resolvo-cloud/Ornith-1.5-35B-A3B-DFlash2
- Modelo objetivo declarado en la card: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit
- Borrador de origen (DFlashV1): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-DFlash
- Borrador DFlash2 entrenado en bf16 citado en la comparativa: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Hilo de Hacker News que menciona Ornith-1.5-35B (contexto no tecnico): https://news.ycombinator.com/item?id=49432317
- No se han encontrado en la busqueda web papers, blogs ni demos adicionales sobre este checkpoint; el resto de resultados obtenidos no guarda relacion con el modelo.
