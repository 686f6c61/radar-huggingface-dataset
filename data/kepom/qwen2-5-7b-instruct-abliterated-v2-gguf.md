# kepom/Qwen2.5-7B-Instruct-abliterated-v2-GGUF

## Resumen

El modelo `kepom/Qwen2.5-7B-Instruct-abliterated-v2-GGUF` es una cuantización GGUF del modelo `huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2`, que a su vez es una versión sin censura del conocido `Qwen/Qwen2.5-7B-Instruct` de Alibaba Cloud. La técnica aplicada, denominada abliteración, elimina selectivamente las direcciones de activación responsables del comportamiento de rechazo del modelo original, manteniendo en gran medida sus capacidades generales.

El repositorio que nos ocupa, publicado por el usuario `kepom`, contiene los pesos en formato GGUF generados con llama.cpp, lo que permite ejecutar el modelo en CPU y en GPUs de consumo mediante herramientas como llama.cpp u Ollama. El modelo base tiene 7.615.616.512 parámetros (7,6 mil millones), una longitud de contexto de 131.072 tokens y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo reside en que ofrece una alternativa sin filtros de seguridad para casos de uso donde el rechazo del modelo original interfiere con la tarea, como la escritura creativa de ficción oscura, la investigación de escenarios hipotéticos o el desarrollo de personajes complejos. Al estar disponible en GGUF, se puede desplegar localmente en hardware modesto, lo que amplía su accesibilidad frente a la versión en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible (el repo no especifica las variantes; se asume Q2_K a Q8_0 por ser generado con llama.cpp) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de la familia Qwen2.5, con 28 capas, 28 cabezas de atencion y dimensiones ocultas de 3584. El modelo base fue entrenado por Alibaba Cloud sobre un corpus masivo de datos multilingues, con un total aproximado de 18 billones de tokens, seguido de un proceso de instruccion y alineacion mediante RLHF.

La innovacion principal de esta variante es la abliteracion, una tecnica desarrollada originalmente por FailSpy y popularizada por Maxime Labonne. Consiste en identificar las direcciones de activacion del modelo que correlacionan con comportamientos de rechazo (por ejemplo, respuestas como "no puedo ayudar con eso") y eliminarlas de los pesos. El resultado es un modelo que conserva casi intactas sus capacidades de razonamiento y generacion, pero que no muestra reticencia a responder a peticiones que el modelo original rechazaria. La version v2 introduce una mejora sobre la v1, con una evaluacion que muestra un rendimiento mas equilibrado en los benchmarks.

No se ha realizado ningun entrenamiento adicional sobre el modelo abliterado; solo se ha modificado el tensor de pesos mediante la tecnica de abliteracion. La cuantizacion GGUF se ha generado posteriormente con llama.cpp, sin ajuste fino posterior.

## Capacidades

- Generacion de texto y chat conversacional multi-turno, con soporte de plantilla de chat nativa de Qwen2.5.
- Razonamiento y resolucion de problemas en tareas de logica, matematicas y comprension lectora, con resultados comparables al modelo original en benchmarks como BBH y GPQA.
- Generacion de codigo y comprension de lenguajes de programacion, herencia del modelo base Qwen2.5-7B-Instruct.
- Capacidad de seguir instrucciones complejas y formato estructurado, con una puntuacion IF_Eval de 77,82, ligeramente superior al modelo original.
- Respuesta sin censura: el modelo no rechaza peticiones sobre temas sensibles, violencia ficticia, contenido adulto o escenarios eticamente problematicos.
- Soporte de contexto largo de hasta 131.072 tokens, adecuado para tareas que requieren procesar documentos extensos o mantener conversaciones prolongadas.
- No soporta vision, audio ni multimodalidad; es exclusivamente texto.
- No se ha confirmado soporte de tool calling ni function calling en esta variante, aunque el modelo base Qwen2.5-7B-Instruct si lo incluye; la abliteracion no deberia eliminarlo, pero no hay confirmacion explicita.

## Casos de uso

- Escritura creativa de ficcion sin restricciones: el modelo puede generar narrativas de terror, erotismo o violencia explicita sin rechazos, lo que lo hace util para autores que trabajan generos literarios donde el modelo original se negaria a colaborar.
- Desarrollo de personajes y dialogos para juegos de rol: permite crear interacciones con personajes moralmente ambiguos o situaciones conflictivas sin interrupciones del sistema de seguridad.
- Investigacion academica sobre alineacion y seguridad de IA: los investigadores pueden estudiar el comportamiento de un modelo sin capas de rechazo para comparar con el original y analizar diferencias en la generacion de contenido.
- Generacion de contenido para prototipos y demos: en entornos de desarrollo donde se necesita un LLM que responda a cualquier prompt sin filtros, por ejemplo para pruebas de estres de sistemas de moderacion.
- Analisis de escenarios hipoteticos y simulaciones: permite explorar consecuencias de decisiones eticamente complejas sin que el modelo se niegue a participar, util en filosofia, etica aplicada o planificacion estrategica.
- Despliegue local en hardware de consumo: al estar en GGUF, se puede ejecutar en una GPU con 8 GB de VRAM (cuantizacion Q4_K_M) o incluso en CPU, lo que lo hace adecuado para aplicaciones offline o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

La model card original del modelo `huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2` incluye la siguiente evaluacion comparativa:

| Benchmark | Qwen2.5-7B-Instruct | Qwen2.5-7B-Instruct-abliterated-v2 | Qwen2.5-7B-Instruct-abliterated |
|---|---|---|---|
| IF_Eval | 76,44 | 77,82 | 76,49 |
| MMLU Pro | 43,12 | 42,03 | 41,71 |
| TruthfulQA | 62,46 | 57,81 | 64,92 |
| BBH | 53,92 | 53,01 | 52,77 |
| GPQA | 31,91 | 32,17 | 31,97 |

La version v2 muestra una ligera mejora en IF_Eval y GPQA respecto al modelo original, mientras que pierde algo en TruthfulQA. La degradacion general es minima, lo que indica que la abliteracion preserva bien las capacidades del modelo base. No hay datos de benchmarks para la cuantizacion GGUF especifica de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB para cuantizacion Q4_K_M, 6 GB para Q6_K y 8 GB para Q8_0, asumiendo el contexto por defecto de 2048 tokens.
- Para contexto largo de 131.072 tokens, la VRAM necesaria aumenta significativamente; con Q4_K_M se estiman mas de 12 GB, por lo que se recomienda una GPU con 16 GB o mas, o el uso de contextos parciales.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, o GPUs de datacenter como A10, A100 o H100 para contexto completo.
- Es ejecutable en CPU mediante llama.cpp u Ollama, con velocidades de 5-15 tokens por segundo en un procesador moderno de 8 nucleos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, o servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- La latencia para generacion de 256 tokens en GPU RTX 4090 con Q4_K_M se estima entre 1 y 3 segundos, con un throughput de 80-150 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | IF_Eval | MMLU Pro |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct (original) | 7,6 B | 131.072 | Apache 2.0 | safetensors | 76,44 | 43,12 |
| Qwen2.5-7B-Instruct-abliterated-v2 | 7,6 B | 131.072 | Apache 2.0 | safetensors | 77,82 | 42,03 |
| Qwen2.5-7B-Instruct-abliterated (v1) | 7,6 B | 131.072 | Apache 2.0 | safetensors | 76,49 | 41,71 |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | safetensors | 82,20 | 48,90 |

La comparativa con Llama-3.1-8B-Instruct es orientativa: el modelo de Meta tiene un rendimiento superior en benchmarks generales, pero no existe una version abliterada oficial tan accesible. La ventaja del modelo Qwen abliterado es su licencia Apache 2.0, mas permisiva que la de Llama, y su disponibilidad en GGUF para despliegue local sencillo.

## Limitaciones y advertencias

- La abliteracion elimina el rechazo, pero no elimina los sesgos del modelo original; puede generar contenido estereotipado o discriminatorio si se le solicita.
- Riesgo de alucinacion: al igual que el modelo base, puede inventar hechos, citas o datos, especialmente en temas especializados.
- Idioma: la model card indica soporte solo para ingles, aunque el modelo base Qwen2.5 soporta multiples idiomas; no se ha verificado el comportamiento en otros idiomas tras la abliteracion.
- Contexto largo: aunque soporta 131.072 tokens, la calidad de la generacion puede degradarse en contextos muy extensos, y el coste computacional es alto.
- Sin garantias de soporte de tool calling o function calling: la abliteracion puede haber alterado la capacidad del modelo para seguir formatos especificos de herramientas, aunque no hay evidencia de ello.
- Uso responsable: al ser un modelo sin censura, puede generar contenido ilegal, danino o explicitamente sexual. El usuario es responsable del uso que haga de el. No debe desplegarse en aplicaciones publicas sin moderacion.
- La cuantizacion GGUF puede introducir una degradacion adicional del rendimiento respecto a la version en safetensors, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- El repositorio no incluye informacion sobre el proceso de cuantizacion ni las variantes disponibles, lo que dificulta la eleccion de la cuantizacion adecuada.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/kepom/Qwen2.5-7B-Instruct-abliterated-v2-GGUF
- Modelo original en safetensors: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Articulo sobre abliteracion de Maxime Labonne: https://huggingface.co/blog/mlabonne/abliteration
- Cuantizacion alternativa del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-abliterated-v2-GGUF
- Version en Ollama: https://ollama.com/richardyoung/qwen2.5-7b-instruct-abliterated
