# bambocher/Qwen3.5-0.8B-heretic-oQ3e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ3e-mtp es una version cuantizada y "decensored" (sin los mecanismos de rechazo alineados) del modelo Qwen3.5-0.8B de Alibaba Qwen. La ha publicado el usuario bambocher en Hugging Face combinando dos procesos: por un lado, la ablacion de comportamiento con Heretic v2.0.0, que elimina las respuestas de rechazo mediante una tecnica de ablacion de rango arbitrario (ARA) aplicada a las capas 1 a 19; por otro, una cuantizacion de precision mixta con oQ (oMLX v0.7.3) que deja el checkpoint en un promedio efectivo de 5.293 bits por peso.

El modelo conserva la cabeza de prediccion multi-token (MTP) del original, lo que lo hace adecuado para decodificacion especulativa y generacion con menor latencia. Con 873 millones de parametros totales (0.752B en el modelo de lenguaje, 0.101B en el modulo de vision y 0.020B en la cabeza MTP), es un modelo pequeno que cabe holgadamente en memoria unificada de equipos Apple Silicon gracias al formato MLX.

Su relevancia practica es doble: por un lado demuestra el flujo de trabajo de cuantizacion mixta por capas en el ecosistema MLX, y por otro ofrece una variante sin filtros de rechazo para investigacion sobre alineacion, evaluacion de sesgos y estudios de comportamiento de modelos. La licencia no esta declarada en el repositorio, lo que condiciona seriamente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con cabeza de prediccion multi-token (MTP) y modulo de vision |
| Parametros totales | 873.438.784 (0.873B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 3, 4, 5, 6 y 8 bits con grupo 64, mas pesos en BF16; promedio efectivo 5.293 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de la familia Qwen3.5 que incorpora un modulo de vision (0.101B de parametros) y una cabeza de prediccion multi-token (MTP, 0.020B). La cabeza MTP permite predecir varios tokens por paso, lo que habilita tecnicas de decodificacion especulativa y reduce la latencia de generacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Sobre esta base, el autor aplico dos transformaciones. Primero, Heretic v2.0.0 con parametros de ablacion de rango arbitrario (ARA): capas 1 a 19, `preserve_good_behavior_weight` 0.8199, `steer_bad_behavior_weight` 0.0001, `overcorrect_relative_weight` 1.0547 y `neighbor_count` 14. El resultado reportado es una reduccion de rechazos de 97/100 a 0/100, con una divergencia KL de 0.1412 respecto al original. Segundo, la cuantizacion oQ con distribucion por capas: el 69.33% de los pesos logicos quedan en 3 bits (0.606B), el 11.815% en BF16 (0.103B), el 10.913% en 5 bits (0.095B), el 7.023% en 4 bits (0.061B) y el resto en 6 y 8 bits. El checkpoint completo ocupa 0.538 GiB.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0.101B de parametros, por lo que admite entradas de imagen.
- Prediccion multi-token mediante la cabeza MTP, util para decodificacion especulativa.
- Comportamiento sin rechazos: responde a peticiones que el modelo original declinaba (0/100 rechazos segun la model card).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como varia el comportamiento al eliminar los mecanismos de refusal, comparando directamente con el original mediante la divergencia KL reportada (0.1412).
- Evaluacion de sesgos y robustez: util para auditar que tipo de contenido emerge cuando se desactivan los filtros, en entornos controlados de laboratorio.
- Pruebas de cuantizacion mixta: sirve como caso de estudio de la tecnica oQ, con una distribucion documentada de bits por capa que permite medir el impacto de cada nivel de precision.
- Prototipado en Apple Silicon: con 0.538 GiB de checkpoint, se puede ejecutar en portatiles Mac con memoria unificada para experimentos de inferencia local sin GPU dedicada.
- Decodificacion especulativa: la cabeza MTP intacta permite implementar y medir tecnicas de prediccion multi-token en un modelo de menos de mil millones de parametros.
- Experimentos multimodales ligeros: el modulo de vision permite probar pipelines de imagen-texto en hardware de consumo.
- Docencia y demostraciones: el tamano reducido facilita desplegar ejemplos de cuantizacion y ablacion en cursos o talleres.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-0.8B (original) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1412 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.54 GiB para los pesos en el formato cuantizado; con overhead de activaciones y cache KV, el consumo real sera mayor y dependera de la longitud de contexto.
- GPU recomendadas: el formato es MLX, por lo que el objetivo principal son los chips Apple Silicon (series M1, M2, M3, M4). No se indica compatibilidad con CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada de 8 GB o superior; el checkpoint completo ocupa 0.538 GiB.
- Opciones de despliegue: MLX y oMLX (el autor uso oMLX v0.7.3 para la cuantizacion). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible, y en principio improbable dado el formato MLX y la cuantizacion oQ propietaria.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ3e-mtp | 0.873B | no disponible | no disponible | safetensors MLX, 5.293 bits/peso | Sin rechazos, con vision y MTP |
| Qwen/Qwen3.5-0.8B | 0.8B (aprox.) | no disponible | no disponible | safetensors | Modelo original alineado, 97/100 rechazos |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo deliberadamente "decensored": la eliminacion de rechazos implica que puede generar contenido inapropiado, ofensivo o danino sin filtros. No es apto para produccion orientada al publico general.
- La divergencia KL de 0.1412 respecto al original indica un cambio de distribucion no trivial; pueden aparecer degradaciones en calidad, coherencia o seguridad no medidas por el autor.
- Licencia no declarada: no hay permiso explicito de uso comercial ni condiciones de redistribucion. El uso comercial queda en un limbo legal.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no especificada, lo que impide planificar aplicaciones con ventanas largas.
- Cuantizacion agresiva: el 69.33% de los pesos estan en 3 bits, lo que puede degradar tareas sensibles a la precision (matematicas, codigo, vision fina).
- Formato MLX y cuantizacion oQ: portabilidad limitada fuera del ecosistema Apple; no hay garantia de conversion a GGUF u otros formatos.
- Riesgo de alucinacion: inherente a modelos de este tamano, probablemente agravado por la cuantizacion y la ablacion.
- Solo 43 descargas y 0 likes en el momento de la consulta: poca validacion comunitaria.
- El autor indica que el checkpoint se re-cuantizo el 2026-11-12; versiones anteriores pueden diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ3e-mtp
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic (proyecto de ablacion): https://heretic-project.org
- oQ / oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
