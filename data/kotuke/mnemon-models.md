# kotuke/mnemon-models

## Resumen

Mnemon-models no es un modelo único, sino un repositorio de distribución que empaqueta los ficheros de pesos utilizados por la aplicación local Mnemon para reconocimiento de voz y resumen. Publicado por el usuario kotuke en Hugging Face, agrupa dos componentes de naturaleza muy distinta: un sistema de reconocimiento de voz automático (ASR) basado en GigaAM v3, y un modelo de lenguaje Qwen3.5-4B cuantizado a 4 bits en formato MLX. El repositorio está pensado para ejecución local en hardware Apple, como indican las librerías y formatos empleados (MLX, Core ML, safetensors).

El componente ASR, GigaAM v3 en su variante e2e-rnnt, procede del equipo GigaChat (ai-sage) y se distribuye bajo licencia MIT; el decodificador y el joint provienen de una conversión a Core ML realizada por smkrv, mientras que el codificador fue reconvertido específicamente para Mnemon con una ventana de entrada de 25 segundos y enmascaramiento de atención. El componente de lenguaje es Qwen3.5-4B, de Qwen, bajo licencia Apache-2.0, convertido a 4 bits MLX por mlx-community; esta distribución incluye únicamente los ficheros necesarios para inferencia de texto.

La relevancia del repositorio es fundamentalmente práctica: sirve como canal de suministro reproducible de pesos para una aplicación concreta, con checksums y licencias por release. No aporta arquitecturas nuevas ni resultados de benchmarks propios, y su utilidad para terceros fuera del ecosistema Mnemon es limitada, ya que los modelos subyacentes están disponibles por separado en sus repositorios originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio agregado: ASR GigaAM v3 e2e-rnnt + LLM Qwen3.5-4B) |
| Parámetros totales | No disponible (Qwen3.5-4B: 4B según denominación; GigaAM v3: no disponible) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (entrada de audio del codificador ASR: 25 segundos) |
| Tipos de cuantización | 4 bits (componente Qwen3.5-4B en MLX); ASR sin cuantización indicada |
| Idiomas soportados | No disponible |
| Licencia | other (agregada); componentes: MIT (GigaAM v3) y Apache-2.0 (Qwen3.5-4B) |
| Formato de pesos | safetensors, MLX, Core ML |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrega artefactos de dos sistemas independientes. El primero es GigaAM v3 en variante e2e-rnnt, un sistema de reconocimiento de voz end-to-end con decodificador RNN-T (transducer). Según la model card, el decodificador y el joint provienen de una conversión a Core ML de smkrv, mientras que el codificador fue reconvertido para Mnemon con una ventana de entrada de 25 segundos y enmascaramiento de atención. No se detallan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo ajuste por RLHF o DPO.

El segundo componente es Qwen3.5-4B, un modelo de lenguaje de 4.000 millones de parámetros convertido a 4 bits en formato MLX por mlx-community, en la revisión 0e7ffd5c. La distribución incluye solo los ficheros necesarios para inferencia de texto. No se especifican en la información proporcionada detalles sobre la arquitectura interna de Qwen3.5-4B, su composición de dataset ni técnicas de alineación.

## Capacidades

- Reconocimiento de voz automático end-to-end mediante GigaAM v3 e2e-rnnt, con codificador adaptado a entradas de 25 segundos y enmascaramiento de atención.
- Inferencia de texto con Qwen3.5-4B cuantizado a 4 bits en MLX, limitada a los ficheros incluidos para generación de texto.
- Resumen: la model card indica que los ficheros se usan para "reconocimiento de voz local y resumen" en Mnemon, aunque no se detalla qué componente realiza el resumen ni con qué configuración.
- Ejecución local en hardware Apple, dado el uso de MLX y Core ML.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión, audio nativo del LLM o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Transcripción local de audio en aplicaciones macOS: el componente GigaAM v3 en Core ML permite ejecutar ASR en el dispositivo sin enviar audio a servidores, procesando segmentos de hasta 25 segundos gracias a la ventana del codificador reconvertido.
- Resumen de reuniones o notas de voz en local: la combinación de ASR y Qwen3.5-4B en 4 bits MLX permite transcribir y resumir en el mismo equipo, manteniendo los datos en el dispositivo.
- Integración en la aplicación Mnemon: el repositorio actúa como fuente de pesos versionados con checksums y licencias por release, lo que facilita la verificación de integridad en el proceso de distribución de la app.
- Prototipado de pipelines ASR + LLM en Apple Silicon: sirve para montar un flujo de transcripción y postprocesado de texto usando MLX y Core ML sin depender de servicios en la nube.
- Evaluación de modelos base antes de adoptarlos: al incluir las licencias MIT y Apache-2.0 de los componentes, permite a un equipo revisar la procedencia y condiciones de uso de cada pieza.
- Despliegue de un LLM de 4B en equipos con memoria unificada: la versión 4 bits MLX de Qwen3.5-4B es adecuada para generación de texto en local en Mac con recursos moderados, aunque el rendimiento concreto no está documentado en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: no disponible de forma oficial. El repositorio completo ocupa 3,5 GB, lo que da una referencia del espacio en disco necesario; la memoria en inferencia dependerá de cada componente y no está documentada.
- GPU recomendadas: no disponible. El stack MLX y Core ML apunta a hardware Apple (chips de la serie M), pero no se especifican modelos concretos.
- Compatibilidad con GPU consumer NVIDIA (RTX 4090, etc.): no disponible; los formatos MLX y Core ML no están orientados a CUDA.
- Opciones de despliegue: MLX (componente Qwen3.5-4B) y Core ML (componente GigaAM v3). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kotuke/mnemon-models | Repositorio agregado (ASR + LLM 4 bits) | Qwen3.5-4B: 4B; GigaAM v3: no disponible | No disponible | other (MIT + Apache-2.0 por componente) | Hugging Face, 0 descargas |
| ai-sage/GigaAM-v3 | ASR | No disponible | No disponible | MIT | Hugging Face |
| Qwen/Qwen3.5-4B | LLM | 4B | No disponible | Apache-2.0 | Hugging Face |
| mlx-community/Qwen3.5-4B-4bit | LLM cuantizado MLX | 4B | No disponible | Apache-2.0 | Hugging Face |

La comparativa relevante es con los repositorios originales de cada componente: este repositorio no añade capacidades nuevas, sino una selección de ficheros con conversiones específicas (codificador ASR a 25 segundos y cuantización MLX 4 bits). Para uso general, los repositorios de origen son la referencia.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: agrega pesos de terceros, por lo que cualquier evaluación de calidad debe remitirse a GigaAM v3 y Qwen3.5-4B.
- La licencia del repositorio figura como "other"; el uso comercial exige revisar las licencias individuales de cada release (MIT para GigaAM v3, Apache-2.0 para Qwen3.5-4B) y los ficheros LICENSE incluidos en cada carpeta.
- La ventana de entrada del codificador ASR está fijada en 25 segundos; audios más largos requieren segmentación externa.
- Los formatos MLX y Core ML limitan el despliegue a hardware Apple; no hay soporte documentado para CUDA ni para runtimes habituales de servidor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados, lo que reduce la evidencia disponible sobre su funcionamiento en producción.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez para ninguno de los dos componentes en esta información.
- El tamaño del repo (3,5 GB) y la ausencia de documentación sobre memoria en inferencia obligan a validar el consumo real antes de integrarlo en una aplicación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kotuke/mnemon-models
- GigaAM v3 (origen ASR): https://huggingface.co/ai-sage/GigaAM-v3
- Conversión Core ML de GigaAM v3 por smkrv: https://huggingface.co/smkrv/gigaam-v3-e2e-rnnt-coreml
- Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwen3.5-4B-4bit en mlx-community (revisión 0e7ffd5c): https://huggingface.co/mlx-community/Qwen3.5-4B-4bit/tree/0e7ffd5c
