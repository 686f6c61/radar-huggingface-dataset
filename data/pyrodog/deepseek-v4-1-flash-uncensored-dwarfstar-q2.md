# pyrodog/DeepSeek-V4.1-Flash-UNCENSORED-DwarfStar-Q2

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-DwarfStar-Q2 es una conversión comunitaria del checkpoint abliterado `dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8` al formato GGUF Q2 propietario del motor de inferencia DwarfStar. El modelo original, DeepSeek-V4.1-Flash, fue desarrollado por DeepSeek AI y publicado en septiembre de 2026 bajo licencia MIT; dealignAI se encargó de la abliteración (eliminación de capas de rechazo) y el usuario pyrodog realizó la cuantización, el empaquetado y la validación descritos en la model card, con ayuda de OpenAI Codex. No se ha entrenado, afinado ni fusionado nada: solo se ha cuantizado el checkpoint de lenguaje.

El interés de esta ficha radica en que no se trata de un GGUF convencional. El archivo usa el layout de tensores propio de DwarfStar, el motor escrito por Salvatore Sanfilippo (antirez) sobre llama.cpp/GGML, por lo que **no carga** en llama.cpp, Ollama, LM Studio ni otros runtimes GGUF estándar. Está pensado para ejecutarse en Apple Silicon con memoria unificada, streaming desde SSD y Metal, y sirve como atajo para quien quiera evitar descargar los ~510 GB del checkpoint fuente y convertirlos durante horas.

El resultado es un modelo de gran tamaño (754.638.867.584 parámetros según los safetensors del repositorio, frente a los 552.000 millones que cita la prensa para el V4.1-Flash original) con capacidades multimodales opcionales mediante un sidecar de visión, soporte de tool calling probado vía OpenCode y licencia MIT. Su relevancia es doble: por un lado democratiza el acceso a un modelo sin filtros de contenido en hardware de consumo alto; por otro, ilustra el ecosistema de cuantizaciones comunitarias que rodea a los pesos abiertos de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; la información pública del DeepSeek-V4.1-Flash original describe una arquitectura de mezcla de expertos (MoE). El archivo incluye tablas Engram nativas |
| Parámetros totales | 754.638.867.584 (dato real de safetensors del repositorio). La prensa cita 552.000 millones para el V4.1-Flash original |
| Parámetros activos | no disponible |
| Longitud de contexto | 100.000 tokens en la configuración de servidor probada por el autor; la información pública del modelo original menciona 1.000.000 de tokens |
| Tipos de cuantización | Receta Q2 mixta: IQ2_XXS para expertos enrutados gate/up, Q2_K para expertos enrutados down, Q8_0 para atención, expertos compartidos y salida, F16/F32 para los tensores designados. Los tensores de visión opcionales se copian sin modificar en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF con layout de tensores propio de DwarfStar |
| Tamaño del archivo | 365.713.686.528 bytes (unos 340,6 GiB) |
| Tamaño del repositorio | 366,7 GB |
| Runtime compatible | DwarfStar (revisión `a04f46fa423e45712c8c7e430eff422479f314a3`) |
| Modalidad | Texto a texto; entrada de imagen opcional mediante sidecar de visión |
| Base | `dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8` |
| Descargas / likes | 12.173 descargas / 5 likes |

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura interna del DeepSeek-V4.1-Flash original más allá de las referencias de prensa a una arquitectura MoE de 552.000 millones de parámetros y una ventana de contexto de un millón de tokens. La model card de esta conversión sí aporta detalles relevantes sobre el proceso de cuantización: se partió del checkpoint público de dealignAI en la revisión `d61c59ea5e514e25d305b5850e8a432f7a9969f2`, se verificaron los 48 archivos safetensors contra los hashes SHA-256 del manifiesto fijado de Hugging Face y se ejecutó DwarfStar con la herramienta `gguf-tools/deepseek41_quantize.py`, seis workers de conversión y salida reanudable.

La receta de cuantización empleada es una "weight-energy bootstrap" sin imatrix de activaciones. El propio autor advierte que **no** es la instancia de receta calibrada por activaciones que respalda el Q2 stock publicado de V4.1, y no reclama que la calidad sea equivalente. Las filas y escalas de las tablas Engram nativas se empaquetan sin pérdida. El conversor de lenguaje excluye los pesos de visión y los pesos borrador de decodificación especulativa DSpark; por eso el archivo de lenguaje es solo texto y necesita el sidecar de visión separado para aceptar imágenes. Solo se modificaron dos cadenas de metadatos (nombre visible y URL de origen) respecto al conversor original; la lógica de runtime y cuantización no se tocó para la versión de texto. No hubo RLHF, DPO, fine-tuning ni abliteración adicional por parte de pyrodog.

## Capacidades

- Generación de texto en modo texto a texto con el runtime DwarfStar.
- Entrada de imagen opcional: el sidecar de visión publicado el 26 de septiembre de 2026 añade procesamiento de imágenes copiando los tensores de visión sin modificar en BF16.
- Tool calling: probado por el autor mediante un round trip de herramienta de lectura a través de OpenCode.
- Modelo abliterado: no aplica capas de rechazo ni filtros de contenido del modelo original, según la descripción de dealignAI.
- Soporte de contexto largo: la configuración de servidor probada usa 100.000 tokens, con caché KV en disco de 8.192 MiB.
- Servidor de API local: `ds4-server` con Metal, streaming desde SSD y enlace en puerto de loopback 8000.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Se desconoce si conserva modos de razonamiento explícito, decodificación especulativa DSpark u otras capacidades del modelo original, ya que los pesos borrador DSpark no están incluidos.

## Casos de uso

- Asistente de programación local: integrándolo con OpenCode a través de `ds4-server`, permite autocompletado, refactorización y explicación de código sin enviar datos a la nube. El tool calling ya validado en ese flujo es un requisito para agentes de edición de ficheros.
- Procesamiento de documentos extensos: la ventana de 100.000 tokens de la configuración probada permite resumir o consultar contratos, expedientes o bases de código completas en una sola pasada, sin troceado ni recuperación externa.
- Análisis de capturas y diagramas: con el sidecar de visión se pueden transcribir diagramas de arquitectura, capturas de interfaces o gráficos a texto estructurado para su posterior procesado.
- Investigación sobre alineación y abliteración: al estar libre de capas de rechazo, sirve como objeto de estudio para comparar el comportamiento de un modelo abliterado frente a su versión original en tareas de evaluación de seguridad.
- Pipelines de agentes multi-paso: el soporte de tool calling y el contexto largo permiten encadenar llamadas a herramientas (lectura de ficheros, consultas, ejecución) manteniendo el estado de la tarea.
- Entornos aislados sin conexión: el despliegue completamente local sobre Apple Silicon evita depender de APIs externas, algo útil en sectores regulados donde no puede salir información del perímetro.
- Despliegue de referencia en hardware Apple: sirve como banco de pruebas para DwarfStar y para medir cómo se comporta el streaming desde SSD con un modelo de este tamaño en memoria unificada limitada.
- Generación de contenido sin restricciones temáticas: para casos de escritura creativa o divulgación donde los filtros del modelo original bloquean contenido legítimo, aunque conviene revisar las implicaciones legales y éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan métricas comparativas frente al checkpoint FP8 de origen ni frente al Q2 stock. El autor únicamente documenta pruebas cualitativas: una validación con `deepseek41_validate_gguf.py --payload`, una prueba corta de inferencia con Metal y un round trip de herramienta de lectura mediante OpenCode.

## Requisitos de hardware

- Máquina de referencia: Apple M5 Max MacBook Pro con 128 GB de memoria unificada y SSD interno.
- Los pesos principales ocupan unos 151,8 GiB, por encima de los 128 GB de RAM del equipo de prueba, de modo que DwarfStar debe hacer streaming desde el SSD. Se requiere un SSD local rápido o la inferencia será muy lenta.
- Otras 188,8 GiB aproximadamente de tablas Engram nativas permanecen en disco de forma permanente.
- Tamaño total del fichero: 365.713.686.528 bytes (unos 340,6 GiB), más el sidecar de visión opcional.
- GPU recomendadas: no disponibles. La model card solo documenta ejecución en Apple Silicon con Metal; no se mencionan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no documentada. El cuello de botella es la memoria unificada y el streaming desde SSD, no la VRAM de una GPU discreta.
- Opciones de despliegue: exclusivamente DwarfStar (`ds4` para CLI y `ds4-server` para servidor de API). No carga en llama.cpp, Ollama, LM Studio ni ningún otro runtime GGUF, pese a que DwarfStar se construye sobre llama.cpp y GGML.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pyrodog/DeepSeek-V4.1-Flash-UNCENSORED-DwarfStar-Q2 | 754.638.867.584 (safetensors) | 100.000 probado / 1.000.000 reportado en prensa | GGUF layout DwarfStar | MIT | Hugging Face, runtime DwarfStar |
| dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8 | No disponible | No disponible | safetensors FP8 | MIT | Hugging Face, modelo base directo |
| deepseek-ai/DeepSeek-V4.1-Flash | 552.000 millones según prensa | 1.000.000 según prensa | safetensors | MIT | Hugging Face, API oficial (con filtros) |
| Q2 stock de V4.1 (antirez) | No disponible | No disponible | GGUF DwarfStar | MIT | Distribución separada; receta calibrada por activaciones |

La diferencia fundamental frente a las alternativas no está en los benchmarks, que no se han publicado, sino en el runtime y el formato: el checkpoint FP8 de dealignAI necesita un stack de inferencia estándar, mientras que esta conversión queda atada a DwarfStar. Frente al Q2 stock de antirez, el autor advierte explícitamente que su receta no está calibrada por activaciones y no reclama paridad de calidad.

## Limitaciones y advertencias

- Formato no estándar: el archivo no carga en llama.cpp, Ollama ni LM Studio. Solo funciona con DwarfStar en la revisión fijada (`a04f46fa423e45712c8c7e430eff422479f314a3`).
- La cuantización Q2 es extremadamente agresiva (IQ2_XXS y Q2_K en los expertos enrutados), lo que degrada la calidad frente al FP8 original. El autor no reclama equivalencia con el Q2 stock calibrado por activaciones.
- Modelo abliterado: no aplica rechazos ni filtros de contenido. Puede generar material dañino, ilegal o desinformativo sin salvaguardas. La responsabilidad de uso recae por completo en quien lo despliega.
- Sesgos conocidos: no documentados en la información disponible, pero al derivar del V4.1-Flash original hereda los suyos, agravados por la ausencia de alineación de seguridad.
- Riesgo de alucinación: no medido. La cuantización agresiva tiende a incrementarlo, pero no hay datos.
- Consumo de recursos: requiere streaming desde SSD en una máquina de 128 GB de memoria unificada; en equipos con menos RAM o discos lentos el uso es impracticable.
- Exclusión de componentes: el conversor deja fuera los pesos de visión (van en un sidecar aparte) y los pesos borrador DSpark de decodificación especulativa, que no están incluidos.
- Idiomas soportados: no disponibles, por lo que no puede garantizarse un rendimiento adecuado en castellano.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y el modelo se distribuye tal cual, sin soporte.
- Proyecto comunitario no oficial: ni DeepSeek, ni dealignAI, ni DwarfStar respaldan esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyrodog/DeepSeek-V4.1-Flash-UNCENSORED-DwarfStar-Q2
- Ficheros del repositorio: https://huggingface.co/pyrodog/DeepSeek-V4.1-Flash-UNCENSORED-DwarfStar-Q2/tree/main
- Modelo base (checkpoint FP8 abliterado): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Motor DwarfStar (antirez): https://github.com/antirez/ds4
- Perfil de dealignAI en X: https://x.com/dealignai
- Perfil de Jordan Schenck en X: https://x.com/jordanschenck
- Artículo de referencia (shattered.io): https://shattered.io/deepseek-v4-1-flash-uncensored-abliterated-2026/
- Artículo de referencia (tech-insider.org): https://tech-insider.org/deepseek-v4-1-flash-uncensored-abliterated-huggingface-2026/
- Guía de despliegue local (hackaigc.com): https://www.hackaigc.com/blog/how-to-run-deepseek-v4-1-flash-uncensored-2026
