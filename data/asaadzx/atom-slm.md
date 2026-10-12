# Asaadzx/atom-slm

## Resumen

atom-slm (tambien referenciado como ATOM-1) es un modelo de lenguaje causal de arquitectura Gemma desarrollado por el usuario Asaadzx y publicado en HuggingFace. Se trata de un modelo entrenado desde cero, no de un ajuste fino de un checkpoint ya publicado, y se distribuye en formato GGUF para su uso con llama.cpp o LM Studio. Con aproximadamente 68,7 millones de parametros, 4 capas, un tamano oculto de 256 y una ventana de contexto de 512 tokens, es un experimento de escala muy reducida.

El modelo se presenta explicitamente como experimental y subentrenado. El propio autor advierte de que no genera texto con sentido: en decodificacion voraz tiende a repetir el ultimo token de entrada (por ejemplo, ante el prompt "The quick brown fox" produce "fox fox fox ..."). Se comparte con fines de investigacion y desarrollo, no para produccion.

Su relevancia es fundamentalmente pedagogica y de investigacion: sirve como caso de estudio de por que una configuracion con tamano oculto muy pequeno (256), solo 4 capas y un vocabulario desproporcionadamente grande (256.000 tokens) resulta dificil de llevar a convergencia. Cerca de 65,5 de los 68,7 millones de parametros corresponden unicamente a la tabla de embeddings, por lo que el cuerpo transformer es extremadamente pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma (decoder-only, causal LM) |
| Parametros totales | 68.681.984 (~68,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (version 3) |
| Capas (block_count) | 4 |
| Tamano oculto (embedding_length) | 256 |
| Longitud feed-forward | 682 |
| Cabezas de atencion | 8 (longitud key/value 32) |
| Tamano de vocabulario | 256.000 (tokenizer Gemma, formato llama) |
| Embeddings | input/output atados (tied) |
| Tamano de archivo | ~137 MB |
| SHA256 | 0e9f16da00580de210b2b1df1b931efcc9ec76601043064b0cd47f9a5fe33728 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Gemma causal decoder-only, con 4 bloques transformer, un tamano oculto de 256, una dimension feed-forward de 682 y 8 cabezas de atencion con longitud key/value de 32. Los embeddings de entrada y salida estan atados. El vocabulario es el tokenizer de Gemma con 256.000 entradas.

Se ha entrenado desde cero, segun indica el autor, sin partir de un checkpoint publicado. La informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se indica que haya plantilla de chat ni ajuste por instrucciones (instruction tuning). El autor senala que la combinacion de un tamano oculto de 256 y solo 4 capas con un vocabulario de 256.000 tokens constituye una configuracion dificil de entrenar hasta la convergencia, y atribuye a ello el estado subentrenado del modelo. No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, variantes SSM o hibridas).

## Capacidades

- Generacion de texto causal basica, aunque degenerada: el modelo tiende a repetir el ultimo token de entrada en lugar de producir texto coherente.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingues especificas; los idiomas soportados figuran como no disponibles.
- No incluye modo de razonamiento (thinking mode), vision ni audio.
- No hay plantilla de chat ni comportamiento de asistente por instrucciones.

## Casos de uso

- Investigacion sobre entrenamiento desde cero: sirve para reproducir y estudiar como se comporta una configuracion de vocabulario grande con cuerpo transformer minimo durante el entrenamiento.
- Estudio de degeneracion en decodificacion: util para analizar empiricamente el bucle de repeticion de token y las estrategias de muestreo que lo mitigan o lo agravan.
- Pruebas de integracion con llama.cpp y LM Studio: permite validar pipelines de carga de GGUF, servidor local (`llama-server -m atom_slm_f16.gguf -c 512`) y compatibilidad con endpoints, sin coste de computo relevante.
- Benchmarking de tooling GGUF: al pesar unos 137 MB, es adecuado para probar rapidamente flujos de cuantizacion, conversion y validacion de ficheros GGUF.
- Docencia y divulgacion: ejemplo practico para explicar la relacion entre tamano de vocabulario, parametros de embeddings y dificultad de convergencia.
- Pruebas de humo en hardware embebido: su tamano permite verificar que un dispositivo o framework ejecuta inferencia de un LLM, aunque la salida no sea util como texto.
- No se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo o tareas que requieran salidas fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de comportamiento reportado por el autor es cualitativo: en decodificacion voraz el modelo repite el ultimo token de entrada (prompt "The quick brown fox" produce "fox fox fox ...").

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 (~137 MB de pesos mas overhead de contexto).
- GPU recomendadas: cualquiera con al menos ~1 GB de memoria; no requiere GPU dedicada.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e integrada actual, e incluso en CPU.
- Hardware de muy baja potencia: viable en placas tipo Raspberry Pi y dispositivos embebidos por el reducido tamano del modelo.
- Opciones de despliegue: llama.cpp (`llama-server`) y LM Studio, segun la model card. No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Estado |
|---|---|---|---|---|---|
| atom-slm (ATOM-1) | ~68,7 M | 512 | no disponible | HuggingFace (GGUF) | experimental, subentrenado |
| GPT-2 small | 124 M | 1.024 | MIT | Ampliamente disponible | entrenado, usable |
| Qwen2-0.5B | ~0,5 B | 32.768 | Apache 2.0 | HuggingFace | entrenado, usable |
| TinyLlama-1.1B | ~1,1 B | 2.048 | Apache 2.0 | HuggingFace | entrenado, usable |

Los modelos comparables pertenecen a la categoria de LLM muy pequenos, pero a diferencia de atom-slm estan entrenados hasta un punto de utilidad practica. La comparacion de parametros y contexto se basa en datos publicos ampliamente conocidos; los valores de rendimiento de atom-slm no estan disponibles porque no se han publicado benchmarks.

## Limitaciones y advertencias

- Modelo subentrenado: las generaciones son degeneradas y consisten en repeticion de tokens; no produce texto con sentido.
- Tamano oculto muy reducido (256) y solo 4 capas, combinados con un vocabulario de 256.000 tokens, lo que dificulta la convergencia.
- Ventana de contexto limitada a 512 tokens.
- Sin plantilla de chat ni ajuste por instrucciones (no instruction tuned).
- Sesgos conocidos: no disponibles (no se documentan evaluaciones de sesgo).
- Riesgo de alucinacion: muy alto en terminos de coherencia; el modelo no genera contenido fiable de ningun tipo.
- Idiomas soportados: no disponibles; no hay garantia de comportamiento multilingue.
- Licencia: no disponible. Al no especificarse una licencia, no puede asumirse permiso para uso comercial; conviene contactar con el autor antes de cualquier uso mas alla de la investigacion.
- No apto para produccion bajo ninguna circunstancia, tal como advierte el propio autor.
- Fecha de creacion y actualizacion indicadas como 2026, lo que conviene verificar en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Asaadzx/atom-slm
- Fichero de pesos: `atom_slm_f16.gguf` (SHA256: 0e9f16da00580de210b2b1df1b931efcc9ec76601043064b0cd47f9a5fe33728)
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la informacion proporcionada.
