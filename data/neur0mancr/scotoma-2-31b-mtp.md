# NeuR0mancR/Scotoma-2-31B-MTP

## Resumen

Scotoma-2-31B-MTP es un modelo *drafter* de predicción multi-token (MTP) diseñado para acelerar la decodificación especulativa del modelo objetivo `ReadyArt/gemma-4-31B-it-scotoma-2`, un fine-tune de Gemma 4 31B orientado a roleplay y escritura creativa. Lo desarrolla el usuario NeuR0mancR a partir del drafter oficial de Google (`google/gemma-4-31B-it-assistant`), sobre el que aplica un fine-tune adicional usando las propias respuestas de Scotoma-2. La relevancia del modelo no está en generar texto por sí mismo, sino en reducir la latencia de inferencia del modelo objetivo sin alterar su salida: la decodificación especulativa es sin pérdida, por lo que el contenido generado por Scotoma-2 permanece idéntico y solo cambia la velocidad.

El repositorio principal contiene los pesos en bf16, mientras que los builds GGUF para llama.cpp (Q8_0 y Q4_0) se publican en un repositorio separado. El modelo está pensado para ejecutarse con `llama-server` en configuraciones de decodificación especulativa con 4 tokens de borrador. Los resultados publicados por el autor muestran una mejora de aproximadamente +2 % en tokens por segundo frente al drafter oficial de Google a temperatura 1, y una mejora marginal en modo greedy.

Aunque la ficha del modelo base apunta a Gemma 4 31B, el conteo real de parámetros en safetensors de este repositorio es de 469.518.596 (unos 470 M), coherente con el tamaño de un drafter auxiliar y no con el modelo objetivo completo. El modelo se distribuye bajo licencia Apache 2.0, con enlace a la licencia de Gemma 4 de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (drafter MTP para decodificación especulativa, misma arquitectura que el drafter oficial de Gemma 4) |
| Parámetros totales | 469.518.596 (según safetensors del repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado y evaluado hasta ~6k tokens) |
| Tipos de cuantización | bf16 (repo principal); GGUF Q8_0 y Q4_0 (repo separado) |
| Idiomas soportados | No disponible (datos mayoritariamente en inglés) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (bf16); GGUF (Q8_0, Q4_0) |
| Modelo base | google/gemma-4-31B-it-assistant (drafter oficial) |
| Modelo objetivo | ReadyArt/gemma-4-31B-it-scotoma-2 |
| Librería | transformers |
| Tamaño del repo | 1.0 GB |

## Arquitectura y entrenamiento

El modelo es un drafter de predicción multi-token (MTP) que replica la arquitectura, el tamaño y los ficheros del drafter oficial `gemma-4-31B-it-assistant` de Google, lo que lo convierte en un reemplazo directo (*drop-in replacement*) en flujos de decodificación especulativa con llama.cpp. Sigue la convención de llama.cpp, en la que el drafter observa el estado del modelo objetivo antes de predecir el token.

El fine-tune se realizó sobre aproximadamente 8,6 millones de tokens aprendidos de respuestas generadas por Scotoma-2 a temperatura 1. La composición del dataset es: 33 % escritura, 30 % técnico, 29 % roleplay y 7 % herramientas, con un 42 % de contenido de razonamiento. Los prompts proceden de WritingPrompts, el conjunto de RP de Gryphe, PIPPA, Tulu, Magicoder, function calling de Hermes y escenarios multi-turno personalizados con herramientas (incluidas herramientas de *game master* para RP). El objetivo de entrenamiento fueron las probabilidades bf16 de Scotoma-2, con una pérdida de distancia de variación total (TVD) sobre las 4 rondas de borrador. Se entrenó durante 2 épocas con learning rate 2e-5 y decaimiento coseno, con la tabla de vocabulario congelada. La validación y el benchmark se dividieron por *character card* para evitar que un mismo personaje de RP apareciera en ambos conjuntos.

## Capacidades

- Predicción multi-token para decodificación especulativa: propone hasta 4 tokens de borrador por paso, validados por el modelo objetivo.
- Aceleración de inferencia sin pérdida: no altera el texto generado por Scotoma-2, solo la velocidad.
- Compatibilidad directa con llama.cpp (`llama-server`) mediante el tipo de especulación `draft-mtp`.
- Reemplazo directo del drafter oficial de Google (misma arquitectura, tamaño y ficheros).
- Especialización en escritura creativa, roleplay, contenido técnico y uso de herramientas, reflejando la distribución del dataset de entrenamiento.
- Soporte de builds GGUF cuantizados (Q8_0 y Q4_0) para despliegue ligero.
- No es un modelo generativo autónomo: no está pensado para usarse como modelo principal de chat.

## Casos de uso

- Aceleración de roleplay con Scotoma-2: al usar el drafter junto al modelo objetivo en `llama-server`, se obtienen ganancias de velocidad de aproximadamente +2 % a temperatura 1, típica en RP, con tasas de aceptación de borrador del 37-39 % en escritura y RP.
- Escritura creativa asistida: el drafter está entrenado con un 33 % de datos de escritura, lo que mejora la aceptación en prompts de WritingPrompts y reduce la latencia percibida en herramientas de generación de relatos.
- Servicio de inferencia técnica: en prompts técnicos la aceptación alcanza el 66-72 %, lo que se traduce en hasta 35,5 tok/s frente a 35,0 tok/s del drafter de Google en modo greedy.
- Integración en pipelines con function calling: los escenarios de herramientas (7 % del dataset) alcanzan aceptaciones del 75-80 %, siendo la categoría con mayor ganancia relativa (hasta 37,8 tok/s frente a 37,3 tok/s de Google en Q4_0 greedy).
- Despliegue en hardware de gama DGX Spark (GB10): el benchmark se realizó en una NVIDIA GB10, por lo que el modelo es adecuado para entornos de escritorio de altas prestaciones con llama.cpp.
- Sustitución del drafter oficial en instalaciones existentes: al compartir arquitectura y ficheros con el drafter de Google, puede adoptarse sin cambios en la configuración salvo apuntar al nuevo fichero GGUF.
- Experimentación con decodificación especulativa: útil para investigadores que quieran medir el impacto de un drafter especializado en dominios concretos (RP, escritura, herramientas) frente a uno genérico.

## Benchmarks y rendimiento

Resultados publicados por el autor: llama.cpp `llama-server` en NVIDIA GB10 (clase DGX Spark), objetivo Scotoma-2 Q4_K_M, 4 tokens de borrador, 104 prompts (30 por categoría, 14 para herramientas), hasta 1024 tokens por respuesta. Tokens por segundo con aceptación de borrador entre paréntesis. Sin drafter: 11,0 tok/s.

| Drafter | Writing | RP | Tech | Tools | All |
|---|---|---|---|---|---|
| **Temperatura 1** | | | | | |
| Google, Q8_0 | 22,4 (36 %) | 22,6 (37 %) | 33,0 (66 %) | 34,6 (73 %) | 26,3 (47 %) |
| Este drafter, Q8_0 | 23,1 (37 %) | 23,1 (39 %) | 33,8 (67 %) | 35,3 (75 %) | 26,9 (48 %) |
| Google, Q4_0 | 22,4 (35 %) | 22,7 (36 %) | 33,8 (67 %) | 35,2 (73 %) | 26,4 (46 %) |
| Este drafter, Q4_0 | 23,0 (36 %) | 23,1 (38 %) | 33,9 (66 %) | 35,8 (75 %) | 26,9 (47 %) |
| **Greedy** | | | | | |
| Google, Q8_0 | 23,0 (38 %) | 23,9 (41 %) | 35,0 (72 %) | 35,8 (77 %) | 27,3 (50 %) |
| Este drafter, Q8_0 | 23,6 (39 %) | 24,8 (44 %) | 35,5 (72 %) | 37,5 (80 %) | 28,1 (52 %) |
| Google, Q4_0 | 23,9 (37 %) | 24,6 (41 %) | 36,1 (71 %) | 37,3 (77 %) | 28,3 (50 %) |
| Este drafter, Q4_0 | 24,2 (39 %) | 24,8 (43 %) | 35,6 (72 %) | 37,8 (80 %) | 28,4 (52 %) |

Resumen del autor: a temperatura 1 (uso típico de RP y escritura) hay aproximadamente +2 % sobre el drafter de Google, sin ninguna categoría más lenta. En modo greedy la ganancia es marginal: el drafter de Google en Q4_0 rinde igual que este en Q8_0. Q4_0 cuesta cerca de un punto de aceptación pero corre igual de rápido que Q8_0. Los prompts de RP del benchmark usan personajes nunca vistos en entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo principal ocupa 1,0 GB en bf16; los builds GGUF Q8_0 y Q4_0 son aún más ligeros. El requisito dominante es el del modelo objetivo Scotoma-2 31B (Q4_K_M en el benchmark), no el del drafter.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) fue la plataforma usada en el benchmark; por tamaño, cualquier GPU consumer con suficiente VRAM para el modelo objetivo de 31B en Q4_K_M puede alojar el drafter adicional.
- Cabe en GPU consumer: sí, siempre que la GPU pueda cargar el modelo objetivo de 31B cuantizado; el drafter añade una fracción mínima de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--spec-type draft-mtp`; el autor solo probó llama.cpp. No se reporta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: sin drafter 11,0 tok/s; con este drafter hasta 28,4 tok/s en modo greedy Q4_0 (todas las categorías) y 26,9 tok/s a temperatura 1, sobre NVIDIA GB10 con objetivo Q4_K_M.
- Comando de referencia: `llama-server -m gemma-4-31B-scotoma-2-Q4_K_M.gguf --spec-type draft-mtp --model-draft Scotoma-2-31B-MTP-Q8_0.gguf --spec-draft-n-max 4 --spec-draft-p-min 0.0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Cuantización probada | Rendimiento (All, greedy) | Licencia |
|---|---|---|---|---|---|
| Scotoma-2-31B-MTP (este) | ~470 M | Drafter MTP especializado | Q8_0 / Q4_0 | 28,4 tok/s (Q4_0, 52 %) | Apache 2.0 |
| google/gemma-4-31B-it-assistant | No disponible | Drafter MTP oficial | Q8_0 / Q4_0 | 28,3 tok/s (Q4_0, 50 %) | Gemma 4 |
| ReadyArt/gemma-4-31B-it-scotoma-2 | 31B (nominal) | Modelo objetivo generativo | Q4_K_M | 11,0 tok/s sin drafter | No disponible |

La comparación relevante es frente al drafter oficial de Google, del que este modelo es un fine-tune: la ganancia es de aproximadamente +2 % a temperatura 1 y marginal en greedy. Frente al modelo objetivo, el drafter no compite en calidad generativa, solo aporta aceleración.

## Limitaciones y advertencias

- Cada configuración del benchmark se ejecutó una sola vez; diferencias de ~1 % están cerca del ruido entre ejecuciones.
- No se midió con samplers DRY o XTC; XTC en particular debería reducir las ganancias de cualquier drafter.
- Entrenado y evaluado en secuencias de hasta ~6k tokens; contextos largos no han sido probados.
- Datos mayoramente en inglés; capacidades multilingües no verificadas.
- Probado únicamente con llama.cpp; no hay evidencia de compatibilidad con vLLM, TGI u Ollama.
- Los prompts de RP y escritura del benchmark son sintéticos (escritos por un LLM) y las respuestas provienen de Scotoma-2, lo que puede inflar la aceptación respecto a tráfico real.
- No es un modelo generativo autónomo: usarlo como modelo principal de chat no es su propósito y no se han publicado capacidades en ese sentido.
- La licencia Apache 2.0 enlaza a la licencia de Gemma 4 de Google; conviene revisar las condiciones de uso comercial asociadas al modelo base antes de producción.
- Al ser un fine-tune de un drafter oficial, el rendimiento depende del modelo objetivo concreto (Scotoma-2); su uso con otros fine-tunes de Gemma 4 no está validado.

## Enlaces

- Repositorio Hugging Face (bf16): https://huggingface.co/NeuR0mancR/Scotoma-2-31B-MTP
- Repositorio GGUF (Q8_0, Q4_0): https://huggingface.co/NeuR0mancR/Scotoma-2-31B-MTP-GGUF
- Modelo objetivo Scotoma-2: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Drafter oficial de Google: https://huggingface.co/google/gemma-4-31B-it-assistant
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Perfil del autor: https://huggingface.co/NeuR0mancR
- Perfil de AesSedai: https://huggingface.co/AesSedai
- Comunidad BeaverAI: https://huggingface.co/BeaverAI
