# mulhearn1022/Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-text-only

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-text-only es una cuantizacion en formato MLX del modelo abliterado Huihui-Qwen3.6-35B-A3B-abliterated, publicado por el usuario mulhearn1022. El modelo base, desarrollado por huihui-ai, es una version sin censura del Qwen3.6-35B-A3B de Alibaba, en la que se ha aplicado la tecnica de abliteration para eliminar los mecanismos de rechazo y permitir respuestas sin filtros de contenido.

La cuantizacion usa el esquema oQ4e (4 bits, grupo de 64) con precision mixta fp16 mediante la herramienta oMLX v0.6.2, y se distribuye en formato MLX safetensors, pensado para ejecutarse en hardware de Apple Silicon con la biblioteca MLX. La arquitectura es de mezcla de expertos (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. El archivo cuantizado pesa 20,4 GB.

La relevancia de este modelo reside en combinar la capacidad de razonamiento de Qwen3.6-35B-A3B con la eliminacion de rechazos y en empaquetarlo en una cuantizacion eficiente para equipos locales con Apple Silicon. No obstante, no se declaran licencia, idiomas soportados ni longitud de contexto en la informacion publica, lo que obliga a una evaluacion adicional antes de su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE) |
| Parametros totales | 35.000 millones (segun nombre del modelo); safetensors registra 5.642.128.512 |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, grupo 64, mixta con fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento
El modelo es una variante de Qwen3.6-35B-A3B, un transformer de mezcla de expertos de Alibaba con 35.000 millones de parametros totales y 3.000 millones activos por token. Sobre esta base, huihui-ai aplica la tecnica de abliteration, un procedimiento de modificacion de pesos que elimina las respuestas de rechazo del modelo sin usar TransformerLens, segun la descripcion del autor.

La cuantizacion realizada por mulhearn1022 emplea el esquema oQ de oMLX v0.6.2, que asigna 4 bits con grupo de 64 a la mayoria de los tensores y conserva precision fp16 en partes criticas. El resultado es un archivo MLX safetensors de 20,4 GB que se carga directamente con la biblioteca MLX de Apple. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni procesos de RLHF o DPO.

## Capacidades
- Generacion de texto sin filtros de rechazo gracias a la abliteration.
- Razonamiento y generacion de codigo heredados de la arquitectura Qwen3.6-35B-A3B.
- Eficiencia de inferencia por su diseno MoE con 3.000 millones de parametros activos.
- Solo texto; no admite entrada de imagenes ni audio.
- Compatible con MLX en Apple Silicon (CPU y GPU unificada).
- No se ha confirmado soporte de tool calling ni function calling en la informacion disponible.

## Casos de uso
- Creacion de narrativa sin restricciones: escritores y guionistas pueden generar contenido literario con temas sensibles que el modelo base rechazaria, sin necesidad de ingenieria de prompts evasiva.
- Roleplay y simulacion de personajes: permite interpretar personajes sin respuestas de negativa, util para juegos de rol textuales y asistentes de escritura creativa.
- Investigacion sobre sesgos y seguridad en IA: los equipos pueden comparar el comportamiento de este modelo abliterado con el original para estudiar el impacto de la eliminacion de rechazos en la calidad y la seguridad de las respuestas.
- Generacion de codigo en local: la cuantizacion en MLX permite ejecutar el modelo en un MacBook con 24 GB o mas de memoria unificada para tareas de programacion sin dependencia de la nube.
- Analisis de texto y razonamiento: procesar documentos extensos, extraer conclusiones o generar resumenes aprovechando la capacidad de razonamiento del modelo base.
- Prototipado de agentes conversacionales en entornos de investigacion: permite estudiar interacciones sin sesgo de rechazo, por ejemplo en experimentos de alineacion o de evaluacion de seguridad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Memoria estimada: el archivo pesa 20,4 GB, por lo que se recomienda al menos 24 GB de memoria unificada en Apple Silicon para cargar el modelo completo; con 16 GB podria intentarse, con degradacion de rendimiento o carga parcial.
- GPU recomendadas: Apple Silicon de las series M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o M4 con 24 GB o mas de memoria unificada.
- No es compatible directamente con GPU NVIDIA por su formato MLX, pero puede convertirse a GGUF para usar en llama.cpp u Ollama, o al formato safetensors estandar para vLLM o TGI.
- Despliegue: biblioteca MLX de Apple, oMLX para cuantizacion adicional, y llama.cpp/Ollama tras conversion.
- Latencia y throughput: no se han publicado datos para esta cuantizacion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B (3B activos) | no disponible | no disponible | safetensors |
| Huihui-Qwen3.6-35B-A3B-abliterated | 35B (3B activos) | no disponible | no disponible | safetensors |
| Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-mtp | 35B (3B activos) | no disponible | no disponible | MLX safetensors |
| Este modelo (oQ4e-fp16) | 35B (3B activos) | no disponible | no disponible | MLX safetensors |

No hay datos de benchmarks publicados que permitan comparar el rendimiento entre estas variantes.

## Limitaciones y advertencias
- Modelo abliterado: los filtros de seguridad se han reducido significativamente, por lo que puede generar contenido sensible, controvertido o inapropiado; se recomienda precaucion extrema en su uso.
- Riesgo de alucinacion y de respuestas inexactas, especialmente en dominios factuales.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con entradas largas sin verificacion previa.
- Licencia no declarada: no se puede confirmar si se permite el uso comercial; es necesario contactar con el autor o revisar la licencia del modelo original Qwen.
- Solo texto: no admite entrada de imagenes ni audio.
- Sin benchmarks publicados: no se puede evaluar objetivamente su rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes, creado el 2026-08-19: se recomienda verificar la procedencia y la integridad de los pesos antes de usarlo en produccion.

## Enlaces
- Repositorio del modelo: https://huggingface.co/mulhearn1022/Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-text-only
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Version con MTP: https://huggingface.co/root4k/Huihui-Qwen3.6-35B-A3B-abliterated-oQ4e-fp16-mtp
- Version para Ollama: https://ollama.com/huihui_ai/Qwen3.6-abliterated:35b-a3b-q4_K
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Nota sobre el lanzamiento del modelo: https://www.ai-market-watch.com/news/release-of-uncensored-qwen36-35b-a3b-abliterated-model-bgxohb
