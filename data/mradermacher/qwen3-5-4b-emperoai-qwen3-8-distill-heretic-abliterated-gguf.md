# mradermacher/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-GGUF

## Resumen

Este modelo es una cuantizacion GGUF del modelo base `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated`, preparada por mradermacher. Se trata de un modelo de 4B parametros derivado de la familia Qwen3.5, que ha pasado por un proceso de destilacion desde un modelo mayor (Qwen3.8) y posteriormente por un proceso de "abliteration" (eliminacion de censura) mediante la herramienta Heretic. El resultado es un modelo de tamano reducido con capacidades de razonamiento y generacion de texto, sin los mecanismos de seguridad tipicos de los modelos alineados.

La relevancia de este modelo reside en su naturaleza "uncensored" (sin censura) y su formato GGUF, que permite su ejecucion en hardware de consumo mediante herramientas como llama.cpp u Ollama. Al ser una cuantizacion estatica, ofrece multiples opciones de compresion (desde Q2_K hasta F16) para adaptarse a diferentes capacidades de hardware. El modelo fue creado en agosto de 2026 y no cuenta con descargas ni valoraciones en el momento de la publicacion de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por el nombre, se infiere que es un transformer de la familia Qwen3.5 con aproximadamente 4.000 millones de parametros, destilado desde un modelo mayor (Qwen3.8). El proceso de destilacion implica transferir el conocimiento de un modelo profesor a un modelo alumno mas pequeno, lo que suele resultar en un modelo mas eficiente con capacidades similares.

La caracteristica mas destacable es el proceso de "abliteration" aplicado mediante la herramienta Heretic. Esta tecnica, basada en el trabajo de Arditi et al. (2024) y Lai (2025), elimina la direccion de "refusal" (rechazo) en el espacio de activaciones del modelo, eliminando efectivamente la censura sin necesidad de reentrenamiento. El proceso combina ablacion direccional con un optimizador de parametros basado en TPE (Tree-structured Parzen Estimator) mediante Optuna. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto libre sin restricciones de contenido, al haber sido sometido a abliteration.
- Razonamiento y capacidades de chat, heredadas de la familia Qwen3.5.
- Ejecucion local en hardware de consumo gracias al formato GGUF y al tamano reducido (4B).
- Multiples niveles de cuantizacion para adaptarse a diferentes capacidades de VRAM y RAM.
- Capacidades multilingues presumiblemente heredadas del modelo base, aunque no se especifican idiomas concretos.
- No se confirma soporte para tool calling, function calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Generacion creativa de ficcion sin restricciones: el modelo puede producir narrativa, poesia o dialogos sin los filtros de seguridad tipicos, adecuado para escritores que exploran temas controvertidos.
- Roleplay y simulacion de personajes: su naturaleza sin censura permite interpretar personajes con comportamientos que otros modelos rechazarian, util en juegos de rol o prototipos de personajes virtuales.
- Experimentacion en investigacion sobre alineacion y seguridad: investigadores pueden estudiar el comportamiento de un modelo sin alineamiento para comparar con versiones alineadas, analizando diferencias en sesgos y patrones de respuesta.
- Desarrollo de aplicaciones de chat locales: al ser GGUF y de 4B, puede desplegarse en portatiles o mini-PCs con 8-16 GB de RAM para asistentes conversacionales privados.
- Pruebas de concepto en entornos sin conexion: su tamano reducido permite ejecutarlo en equipos sin GPU dedicada, ideal para prototipos en entornos aislados o con restricciones de red.
- Fine-tuning posterior: el modelo base (safetensors) puede servir como punto de partida para ajuste fino en tareas especificas sin las restricciones de licencia de modelos propietarios, aunque la licencia no esta confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 GB (cuantizacion Q2_K) y 8 GB (F16) aproximadamente, dependiendo de la cuantizacion elegida y la longitud de contexto.
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM (GTX 1660, RTX 2060, RTX 3060, RTX 4060) para cuantizaciones Q4-Q6; F16 requiere 8 GB o mas.
- CPU: puede ejecutarse en CPU con 8-16 GB de RAM usando cuantizaciones Q4_K_M o inferiores, con velocidades de 5-15 tokens por segundo en procesadores modernos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, kobold.cpp y cualquier frontend compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos; en CPU se estiman 5-20 tokens/s segun hardware y cuantizacion, y en GPU 20-60 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-EmperoAI (este) | 4B | no disponible | no disponible | GGUF | Sin censura, destilado |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF | 9B | no disponible | no disponible | GGUF | Mayor tamano, tambien sin censura |
| Qwen3.5 (modelos oficiales) | varios | no disponible | Apache 2.0 (presumible) | safetensors | Version oficial con alineamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, lo que puede producir contenido ofensivo, ilegal o danino sin advertencia previa.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o redistribucion.
- No se dispone de informacion sobre sesgos del modelo, pero al derivar de Qwen3.5, es probable que herede sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: como cualquier modelo de 4B, puede inventar hechos o datos con confianza, especialmente en tareas de conocimiento factual.
- La longitud de contexto no esta documentada; se recomienda asumir un valor conservador (8K-32K) hasta confirmarlo.
- El modelo no tiene descargas ni validacion de la comunidad, por lo que su calidad real no ha sido contrastada.
- No se confirman capacidades de tool calling, vision o audio, limitando su uso en aplicaciones que requieran estas funciones.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-GGUF
- Modelo base en HuggingFace: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Variante con MTP (Multi-Token Prediction): https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-MTP-GGUF
- Repositorio de Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
