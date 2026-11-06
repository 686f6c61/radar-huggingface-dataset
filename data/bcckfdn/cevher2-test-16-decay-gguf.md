# bcckfdn/cevher2-test-16-decay-GGUF

## Resumen

cevher2-test-16-decay-GGUF es la distribucion en formato GGUF del modelo base `bcckfdn/cevher2-test-16-decay`, un modelo de lenguaje de 1.513.546.496 parametros (~1,5 mil millones) entrenado desde cero por el usuario bcckfdn siguiendo la arquitectura de SmolLM2 (familia Llama). El modelo esta pensado para generacion de texto conversacional en turco e ingles, y esta publicado bajo licencia Apache 2.0.

El repositorio contiene unicamente pesos cuantizados para inferencia local con llama.cpp y compatibles (Ollama, LM Studio), con cuatro variantes que van desde BF16 (2889 MB) hasta Q4_K_M (893 MB), lo que permite ejecutarlo en hardware de consumo modesto. La model card indica un entrenamiento de aproximadamente 32.932 millones de tokens, con una dimension oculta de 1792 y 34 capas, coherente con la arquitectura SmolLM2 de ~1,5B parametros.

Es relevante por su caracter de modelo pequeno, abierto y bilingue turco-ingles, orientado a experimentacion y despliegue en entornos con recursos limitados. No obstante, se trata de un checkpoint de prueba ("test" en el nombre) con informacion tecnica muy escasa y sin benchmarks publicados, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama / SmolLM2 (34 capas, hidden 1792) |
| Parametros totales | 1.513.546.496 (~1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SmolLM2, es decir, un transformer decoder-only de tipo Llama con 34 capas y dimension oculta de 1792, entrenado desde cero (no es un fine-tuning de un modelo preexistente). La model card indica un volumen de entrenamiento de aproximadamente 32.932 millones de tokens, aunque no se detalla la composicion del dataset, la mezcla de idiomas ni si se aplicaron fases de RLHF, DPO o SFT posteriores al preentrenamiento.

No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, GQA explicito, etc.) ni hiperparametros de entrenamiento mas alla de los citados. La informacion disponible sobre el proceso de entrenamiento es minima y se limita a los datos reflejados en la model card del autor.

## Capacidades

- Generacion de texto conversacional en turco e ingles (etiqueta `conversational`).
- Razonamiento basico y respuesta a instrucciones propias de un modelo de ~1,5B parametros.
- Generacion de codigo y matematicas: capacidad esperable por tamano, pero no verificada ni documentada.
- Soporte de tool calling / function calling: no disponible / no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues limitadas a turco e ingles segun los tags del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en turco: el modelo puede mantener dialogos multi-turno basicos y desplegarse en local con llama.cpp u Ollama, lo que facilita iterar sin costes de API.
- Experimentacion academica con modelos pequenos: util para estudiar el comportamiento de un transformer de ~1,5B entrenado desde cero y comparar con SmolLM2 original.
- Inferencia en hardware de consumo: la variante Q4_K_M (893 MB) permite ejecutar el modelo en portatiles sin GPU dedicada, sirviendo para demos y pruebas offline.
- Generacion de texto asistida en ingles para tareas de baja complejidad (resumenes cortos, reescritura, respuestas FAQ), siempre con supervision humana.
- Base para fine-tuning ligero en turco: al estar bajo Apache 2.0 y en formato GGUF/BF16, puede servir como punto de partida para ajustes especificos de dominio con LoRA.
- Entornos educativos y de investigacion sobre cuantizacion: las cuatro variantes publicadas permiten medir el impacto de la cuantizacion (BF16 vs Q8_0 vs Q5_K_M vs Q4_K_M) en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,9 GB en BF16, ~1,5 GB en Q8_0, ~1,0 GB en Q5_K_M y ~0,9 GB en Q4_K_M (sin contar overhead de contexto).
- GPU recomendadas: cualquier GPU con >=4 GB de VRAM para BF16; GPUs de consumo como RTX 3060, RTX 4060 o superiores son mas que suficientes para las variantes cuantizadas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU (las variantes Q4_K_M y Q5_K_M funcionan en portatiles sin GPU dedicada).
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio; tambien compatible con endpoints que acepten GGUF.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cevher2-test-16-decay | ~1,5B | no disponible | tr, en | Apache 2.0 | GGUF |
| SmolLM2-1.7B (HuggingFaceTB) | 1,7B | 8K (segun model card oficial) | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B | 1,5B | 32K (segun model card oficial) | multilingue (incluye en, zh, etc.) | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | 1,2B | 128K (segun model card oficial) | multilingue (8 idiomas) | Llama 3.2 Community License | safetensors, GGUF |

Nota: los datos de los modelos comparativos provienen de sus model cards publicas; el modelo objeto de esta ficha no dispone de contexto ni benchmarks documentados, por lo que la comparacion en rendimiento no es posible.

## Limitaciones y advertencias

- Modelo de prueba ("test" en el nombre): no hay garantia de calidad, estabilidad ni mantenimiento por parte del autor.
- Ausencia de benchmarks: no se puede verificar su rendimiento frente a alternativas como SmolLM2-1.7B o Qwen2.5-1.5B.
- Riesgo de alucinacion elevado por su tamano (~1,5B) y por la falta de documentacion sobre alineamiento (RLHF/DPO).
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni filtros de sesgo.
- Cobertura linguistica limitada a turco e ingles; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada: no se recomienda su uso en tareas que requieran ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de prueba conviene validar exhaustivamente antes de integrarlo en produccion.
- Repositorio con 0 likes y fecha de creacion futura (2026-10-28) en los metadatos, lo que sugiere un estado experimental o de publicacion automatica.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/bcckfdn/cevher2-test-16-decay-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher2-test-16-decay
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
