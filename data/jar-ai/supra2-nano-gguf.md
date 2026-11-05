# Jar-ai/Supra2-Nano-GGUF

## Resumen

Supra2-Nano-GGUF es la version cuantizada en formato GGUF de Supra2-Nano, un modelo de lenguaje de tipo SLM (Small Language Model) desarrollado por SupraLabs y redistribuido por Jar-ai. Se trata de un modelo base preentrenado, no ajustado para instrucciones ni para conversacion, con un tamano declarado de aproximadamente 50 millones de parametros y una longitud de contexto de 1024 tokens. Su proposito principal es servir como punto de partida para experimentacion, ajuste fino e investigacion en entornos con recursos muy limitados.

La relevancia de este modelo radica en su extremadamente baja huella: los ficheros cuantizados pueden reducirse hasta unos 800 KB, lo que permite ejecutar inferencia en practicamente cualquier hardware, incluidos dispositivos embebidos o entornos de CI. No obstante, conviene subrayar que no es un modelo apto para uso conversacional directo: su naturaleza es la de un modelo base de preentrenamiento, por lo que su utilidad practica depende de un posterior ajuste.

La ficha se basa exclusivamente en la informacion publicada en el repositorio de HuggingFace y en la model card del autor. Los datos tecnicos disponibles son escasos, por lo que numerosos parametros se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo SLM, detalles no publicados) |
| Parametros totales | 799.776 (segun safetensors); ~50M declarados en la model card (dato no coincidente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0 (el autor desaconseja cuantizaciones inferiores) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna del modelo (tipo de transformer, numero de capas, dimensiones de atencion, etc.). Se describe como un modelo base de preentrenamiento (pretrain) de la familia Supra, orientado a ser un SLM ligero. El tokenizador se presenta como "listo para entrenamiento en otros idiomas", lo que sugiere que el vocabulario no esta restringido al ingles y permite adaptacion multilingue mediante ajuste.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El repositorio es una conversion a GGUF del modelo base SupraLabs/Supra2-Nano, sin modificaciones declaradas mas alla de la cuantizacion.

## Capacidades

- Generacion de texto autoregresiva basica como modelo base de lenguaje.
- Capacidad de continuacion de texto y modelado del lenguaje, no de seguir instrucciones.
- No dispone de ajuste para chat ni para formato conversacional (el autor lo advierte explicitamente).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Soporte multilingue limitado: el modelo esta etiquetado solo para ingles, aunque el tokenizador es adaptable.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).
- Contexto muy reducido (1024 tokens), lo que limita tareas de contexto largo.

## Casos de uso

- Investigacion educativa sobre modelos de lenguaje: permite estudiar el comportamiento de un SLM base con recursos minimos, ejecutandolo en un portatil o incluso en un contenedor ligero.
- Punto de partida para ajuste fino: al ser un modelo base Apache 2.0, se puede reentrenar para tareas concretas (clasificacion, continuacion de texto) con costes de computo muy bajos.
- Experimentacion con tokenizadores multilingues: el tokenizador adaptable permite probar adaptaciones a nuevos idiomas mediante preentrenamiento continuado.
- Pruebas de pipelines de cuantizacion: util para validar flujos de conversion a GGUF y comparar calidad entre F32, F16, BF16 y Q8_0 en un modelo pequeno.
- Inferencia en dispositivos embebidos o edge: con ficheros de ~800 KB, puede integrarse en entornos con memoria muy restringida para tareas de generacion simple.
- Benchmarking de infraestructura: sirve como modelo de referencia ligero para medir latencia y throughput de herramientas como llama.cpp u Ollama sin consumir recursos significativos.
- Docencia y demos: adecuado para explicar el funcionamiento interno de un modelo de lenguaje sin requerir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero Q8_0 o F16 ocupa del orden de cientos de KB a pocos MB, por lo que cabe en CPU y en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en cualquier GPU consumer: si, sin restricciones practicas.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; tambien es posible usar otros runners compatibles con GGUF. El modelo base en safetensors puede cargarse con transformers.
- Latencia y throughput: no disponibles; por el tamano del modelo, se espera una latencia muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A continuacion se ofrece una comparacion estructural con alternativas ligeras conocidas, indicando los datos no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Supra2-Nano-GGUF | ~50M declarados / 799.776 en safetensors | 1024 | Apache 2.0 | GGUF | Modelo base, solo ingles, sin benchmarks |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | safetensors, GGUF | Modelo base e instruct, con benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32768 | Apache 2.0 | safetensors, GGUF | Multilingue, con benchmarks publicados |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | safetensors, GGUF | Modelo base e instruct, con benchmarks publicados |

La comparacion de rendimiento con estos modelos no es posible con los datos disponibles; las alternativas citadas cuentan con evaluaciones publicadas, mientras que Supra2-Nano no.

## Limitaciones y advertencias

- Modelo base de preentrenamiento: no esta disenado para chat ni para seguir instrucciones; su uso directo produce continuaciones de texto, no respuestas utiles.
- Contexto muy limitado (1024 tokens), insuficiente para tareas de contexto largo o documentos extensos.
- Solo etiquetado para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo elevado de alucinacion y de generar contenido incoherente, especialmente por su tamano reducido y falta de ajuste.
- Discrepancia en el numero de parametros: la model card declara ~50M, mientras que los safetensors indican 799.776; conviene verificar antes de usarlo en produccion.
- El autor desaconseja cuantizaciones inferiores a Q8_0 por degradacion de calidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser un modelo base sin garantias, el usuario asume la responsabilidad del ajuste y la evaluacion.
- No apto para produccion sin un proceso previo de ajuste fino y evaluacion especifica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jar-ai/Supra2-Nano-GGUF
- Modelo base: https://huggingface.co/SupraLabs/Supra2-Nano
- No se han encontrado en la informacion proporcionada otros enlaces (papers, blogs, repos, demos).
