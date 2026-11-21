# IsValorum/Inkling-2-Mini-Abliterated-BF16-GGUF

## Resumen

Inkling-2-Mini-Abliterated-BF16-GGUF es una conversión a formato GGUF en precisión BF16 del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario IsValorum. Se trata de un artefacto de preparación (denominado "APEX preparation artifact") pensado como punto de partida para generar cuantizaciones posteriores en llama.cpp; el autor indica explícitamente que no adjunta mapa de tensores y que estos se publican solo con los niveles cuantizados. El modelo conserva la arquitectura del original, un transformer de tipo mezcla de expertos (MoE) con capacidad de entrada imagen-texto, según las etiquetas del repositorio.

El dato objetivo disponible es el número de parámetros totales reportado en safetensors: 26.070.385.152 (aproximadamente 26,07 mil millones). El repositorio ocupa 52,6 GB, coherente con un único fichero GGUF en BF16 de 52.226.509.504 bytes. La licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas del modelo original), lo que afecta directamente a su comportamiento en producción y a las consideraciones de seguridad; por otro, al ser un artefacto BF16 sin cuantizar, sirve como referencia de fidelidad máxima para quien quiera producir sus propias cuantizaciones con llama.cpp. No se dispone de información sobre el proceso de abliteración, los datos de entrenamiento ni los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), segun etiquetas del repositorio; detalles no disponibles |
| Parametros totales | 26.070.385.152 (~26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en este artefacto; el autor indica que publica niveles cuantizados por separado, sin detallar cuales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `Inkling-2-Mini-Abliterated-BF16.gguf`, 52.226.509.504 bytes) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que el modelo base es un transformer con arquitectura de mezcla de expertos (etiqueta `moe`) y que el pipeline declarado es `image-text-to-text`, lo que implica capacidad de procesar imagenes junto con texto. El numero de parametros totales asciende a 26.070.385.152. No se dispone de datos sobre el numero de expertos, el numero de parametros activos por token, la longitud de contexto nativa, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Respecto al proceso de "abliteration", el autor no documenta la metodologia empleada (extraccion de direcciones de rechazo, capas afectadas, magnitud de la modificacion ni evaluacion posterior del impacto en capacidades). Tampoco se detalla si la conversion a GGUF introduce alguna modificacion adicional sobre los pesos del modelo base mas alla del cambio de formato. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, enrutamiento de expertos concreto) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), lo que habilita tareas de descripcion de imagenes, respuesta a preguntas visuales y dialogos con soporte de imagenes.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse a traves de infraestructura de inferencia estandar.
- Ejecutable mediante llama.cpp, al estar distribuido en formato GGUF.
- Comportamiento "abliterated": el modelo ha sido modificado para reducir o eliminar los rechazos ante peticiones que el modelo original rechazaria. Esto es una capacidad tecnica del artefacto, no una garantia de calidad ni de seguridad.
- No hay informacion disponible sobre soporte de tool calling, razonamiento multi-paso, modo "thinking", audio, ni sobre el alcance multilingue real.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el artefacto permite estudiar como varia el comportamiento del modelo al eliminar las direcciones de rechazo, comparando respuestas frente al modelo base en un mismo conjunto de prompts.
- Generacion de cuantizaciones propias: al ser un BF16 GGUF de referencia, sirve como entrada para producir niveles Q4_K_M, Q5_K_M, Q8_0 y similares con llama.cpp, controlando el equilibrio entre tamano y fidelidad.
- Despliegue local con llama.cpp: el formato GGUF permite ejecutar el modelo en estaciones de trabajo sin depender de frameworks de servido propietarios, util para entornos con requisitos de privacidad.
- Prototipado de aplicaciones imagen-texto: permite validar pipelines de vision-lenguaje (descripcion de imagenes, extraccion de informacion de capturas o documentos escaneados) antes de comprometerse con un modelo mayor.
- Evaluacion comparativa de fidelidad de cuantizacion: al disponer de la referencia BF16, se puede medir la degradacion de cada nivel cuantizado sobre las mismas tareas, algo habitual en laboratorios de inferencia.
- Experimentacion con arquitecturas MoE en hardware limitado: con 26 mil millones de parametros totales, un modelo MoE puede ofrecer un coste por token inferior al de un denso equivalente, lo que interesa para servir cargas conversacionales en GPU de gama alta consumer o profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el fichero pesa 52,2 GB, por lo que se necesita al menos esa cantidad de memoria, mas overhead de contexto y cache KV. En la practica, un minimo de 56-64 GB de VRAM o memoria unificada.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB no bastan sin offloading; 2x A6000 de 48 GB o 4x RTX 4090 con tensor paralelo si el runtime lo soporta).
- Cabe en GPU consumer: no en BF16 con una sola tarjeta. Requiere cuantizacion (Q4_K_M o similar, que reduciria el peso a la mitad o menos) o bien offloading parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo), y en principio cualquier runtime compatible con GGUF como Ollama o servidores basados en llama.cpp. No se confirma soporte de vLLM o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles. Dependeran del numero de parametros activos, que no se ha publicado, y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-BF16-GGUF | ~26,07 B (MoE) | no disponible | Apache 2.0 | GGUF BF16 | Variante abliterated de un modelo imagen-texto |
| thinkingmachines/Inkling-2-Mini (base) | ~26,07 B (MoE) | no disponible | Apache 2.0 | no disponible en esta informacion | Modelo original sin abliterar; referencia para comparar comportamiento |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para establecer una comparativa con modelos de la misma categoria |

## Limitaciones y advertencias

- La abliteracion elimina los mecanismos de rechazo del modelo original, por lo que puede generar contenido que el modelo base declinaria. Esto supone un riesgo directo en aplicaciones orientadas al usuario final y exige filtros externos.
- No se documenta la metodologia de abliteracion ni se evalua la degradacion de capacidades que suele acompanarla; es probable una perdida de calidad en tareas que dependian de las direcciones eliminadas.
- Riesgo de alucinacion: no cuantificado ni evaluado en la informacion disponible. Al no haber benchmarks, no puede compararse con el modelo base.
- No se especifican los idiomas soportados; el rendimiento en castellano es desconocido.
- La longitud de contexto no esta publicada, lo que impide planificar cargas con contexto largo.
- El repositorio declara 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion comunitaria del artefacto.
- El autor no adjunta mapa de tensores ni detalla el proceso de conversion; la integridad del fichero solo puede verificarse mediante el SHA256 publicado.
- Licencia Apache 2.0 permite uso comercial, pero el uso de una variante abliterated puede entrar en conflicto con las politicas de plataformas de despliegue y con obligaciones regulatorias de moderacion de contenido.
- El tamano de 52,6 GB en BF16 limita el despliegue a infraestructura con memoria suficiente o a versiones cuantizadas que aun no se han publicado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-BF16-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- llama.cpp: https://github.com/ggml-org/llama.cpp
