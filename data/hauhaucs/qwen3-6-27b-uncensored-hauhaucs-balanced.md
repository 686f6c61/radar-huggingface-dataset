# HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Balanced

## Resumen

Qwen3.6-27B-Uncensored-HauhauCS-Balanced es una adaptación del modelo Qwen3.6-27B de Alibaba, publicada por el usuario HauhauCS, que elimina los rechazos (refusals) del modelo original manteniendo intactas sus capacidades. Según la model card, el modelo consigue 0/465 rechazos en el benchmark de refusals, lo que lo convierte en una opción atractiva para casos de uso que requieren respuestas sin restricciones de seguridad, como investigación ofensiva, escritura creativa sin censura o desarrollo de agentes que necesitan explorar temas sensibles.

La variante "Balanced" es la recomendada por defecto: conserva el razonamiento en voz alta y ocasionalmente añade un breve disclaimer antes de dar la respuesta completa, pero sin omitir contenido. Está calibrada para mantener estabilidad en cadenas largas de tool calling y razonamiento multi-paso, lo que la hace especialmente adecuada para flujos agénticos de programación. El modelo es multimodal (image-text-to-text), soporta inglés, chino y otros idiomas, y se distribuye exclusivamente en formato GGUF con cuantizaciones personalizadas K_P que optimizan la calidad por nivel de compresión.

Con 26.895.998.464 parámetros (~26,9B) y arquitectura densa, este modelo se posiciona como una alternativa de gama media-alta para entornos con una sola GPU de 24 GB o más. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su compatibilidad con runtimes GGUF (llama.cpp, LM Studio, Ollama) facilita el despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6-27B) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado en la informacion proporcionada) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M, mmproj-f16 |
| Idiomas soportados | Ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de 27B parametros, disenado por Alibaba para tareas multimodales (imagen y texto) y agénticas. La version uncensored de HauhauCS no modifica los pesos del modelo original, sino que aplica una tecnica de "abliteración" (abliteration) que elimina selectivamente las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. Segun la model card, no hay cambios en datasets ni en capacidades: el modelo conserva el 100% de las funcionalidades originales, incluyendo vision, tool calling y razonamiento.

La variante Balanced se diferencia de la variante Aggressive en que mantiene el razonamiento interno y puede emitir un breve disclaimer antes de la respuesta completa, mientras que Aggressive elimina ese preambulo. Esta calibracion busca un equilibrio entre utilidad y estabilidad en cadenas largas de interaccion, especialmente relevante para flujos agénticos donde la deriva tematica puede romper la coherencia de una secuencia de tool calls.

Los pesos se distribuyen en formato GGUF con cuantizaciones K_P personalizadas, generadas con importance matrix (imatrix) para preservar la calidad en los pesos abliterados. El repositorio incluye tambien un proyector multimodal (mmproj) en f16 para habilitar la entrada de imagenes.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades completas del Qwen3.6-27B, incluyendo razonamiento paso a paso y pensamiento profundo.
- Multimodal (vision): soporta entrada de imagenes mediante el proyector mmproj incluido, permitiendo tareas de image-text-to-text.
- Tool calling y function calling: compatible con flujos agénticos, capaz de emitir llamadas a herramientas estructuradas en JSON.
- Razonamiento multi-paso: disenado para mantener coherencia en cadenas largas de tool calls y prompts consecutivos.
- Codigo: optimizado para tareas de programacion, incluyendo generacion, revision y depuracion de codigo.
- Escritura creativa y roleplay: la variante Balanced permite respuestas completas sin censura, con un breve preambulo opcional.
- Multilingue: soporta ingles, chino y otros idiomas, aunque el rendimiento optimo se concentra en los dos primeros.
- Sin rechazos: 0/465 refusals en el benchmark del autor, lo que implica que no bloquea peticiones sobre temas sensibles (seguridad, operaciones, investigacion, etc.).

## Casos de uso

- Desarrollo de agentes de codigo: el modelo puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo de forma autonoma. Su estabilidad en cadenas largas de tool calls y su capacidad para manejar JSON estructurado lo hacen adecuado para agentes que interactuan con repositorios, ejecutan tests y proponen parches.
- Automatizacion de tareas de seguridad ofensiva: en entornos controlados de pentesting, el modelo puede analizar configuraciones, generar payloads o documentar vulnerabilidades sin rechazar peticiones relacionadas con exploits o tecnicas de ataque, algo que los modelos censurados suelen bloquear.
- Asistente de investigacion tecnica: para investigadores que necesitan explorar temas como malware, criptografia aplicada o ingenieria inversa, el modelo proporciona respuestas completas sin filtros, facilitando el estudio de materiales que otros modelos consideran sensibles.
- Escritura creativa sin restricciones: autores de ficcion, guionistas o creadores de contenido para roleplay pueden generar dialogos, narrativas o escenas con tematicas adultas o controvertidas sin que el modelo se niegue a continuar.
- Analisis de imagenes en entornos especializados: gracias al soporte multimodal, puede describir o interpretar imagenes en contextos donde la censura seria un obstaculo, como analisis de contenido medico o forense.
- Chatbots de atencion al cliente con manejo de temas delicados: en sectores como salud mental o asesoria legal, el modelo puede responder a consultas sobre temas tabu o estigmatizados sin rechazar, aunque requiere supervision humana para garantizar la exactitud.
- Generacion de contenido educativo sobre temas controvertidos: profesores o divulgadores pueden usarlo para preparar material sobre historia, politica o religion con multiples perspectivas, sin que el modelo evada preguntas incomodas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. El unico dato de rendimiento mencionado es la tasa de refusals (0/465) y la afirmacion de que las cuantizaciones K_P mejoran la calidad en 1-2 niveles de cuantizacion con un aumento de tamano del 5-15%.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, desde ~10 GB (IQ2_M) hasta ~32 GB (Q8_K_P). La recomendacion del autor para trabajo agéntico es Q4_K_P (18 GB) que cabe en una GPU de 24 GB con margen para contexto, o Q8_K_P (32 GB) para mayor fidelidad.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_P, RTX 3090 o A6000 (24 GB) para cuantizaciones hasta Q5, A100 40 GB o H100 para Q8_K_P y contexto largo.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q4_K_P y menores caben en GPUs de 12-16 GB (RTX 3080, RTX 4070 Ti), aunque con contexto limitado.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, KoboldCpp y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. Dependen de la GPU y la cuantizacion; un modelo de 27B en Q4_K_P en una RTX 4090 suele generar entre 20-40 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Como referencia cualitativa, este modelo se puede comparar con otras versiones uncensored de la familia Qwen (por ejemplo, Qwen3-32B-Uncensored de otros autores) y con modelos abliterados de tamano similar como Llama-3.1-8B-Instruct-abliterated o Mistral-7B-abliterated. La principal diferencia es el tamano (27B frente a 7-8B) y el soporte multimodal, que no suele estar presente en las versiones abliteradas de modelos mas pequenos. La licencia Apache 2.0 es mas permisiva que la de Llama (licencia de uso aceptable) o Mistral (Apache 2.0 tambien). Sin datos de benchmarks, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version sin censura, el modelo puede generar contenido ofensivo, discriminatorio o peligroso si se le solicita. No se han realizado evaluaciones de sesgo en esta version.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, especialmente en temas especializados. La ausencia de rechazos no implica mayor exactitud.
- Limitaciones de contexto: la longitud de contexto no esta especificada en la informacion disponible; se recomienda verificar la ficha del modelo base Qwen3.6-27B para conocer el limite real.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el contenido generado. El usuario es responsable del uso que haga del modelo.
- Estabilidad en produccion: la variante Balanced esta calibrada para reducir la deriva tematica en cadenas largas, pero no se han publicado pruebas formales de robustez en entornos de produccion.
- Compatibilidad de cuantizaciones K_P: aunque son compatibles con runtimes GGUF estandar, LM Studio puede mostrar "?" en la columna de cuantizacion; es un problema de visualizacion, no de funcionalidad.
- Soporte multimodal: el proyector mmproj se incluye en f16, lo que anade ~928 MB al tamano del modelo; es necesario cargarlo junto con el modelo para usar vision.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
