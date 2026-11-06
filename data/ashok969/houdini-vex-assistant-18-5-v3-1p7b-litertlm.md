# ashok969/houdini-vex-assistant-18.5-v3-1p7b-litertlm

## Resumen

Houdini VEX assistant 18.5 v3 es un ajuste fino (fine-tune) del modelo Qwen3-1.7B de Alibaba, especializado en la generacion de codigo VEX para Houdini 18.5, el lenguaje de scripting del software de efectos visuales SideFX Houdini. Lo publica el usuario ashok969 en Hugging Face y su proposito es asistir a artistas tecnicos y desarrolladores de VFX en la escritura de snippets y wrangles VEX dentro de contextos concretos como Attribute Wrangle, POP Wrangle, Gas Field Wrangle, RBD, crowd o shaders.

La particularidad del modelo es su formato de distribucion: no se ofrece en safetensors ni GGUF, sino como un fichero `.litertlm` (1,33 GB) pensado para inferencia on-device mediante LiteRT-LM, la pila de Google AI Edge. Esto permite ejecutarlo en un telefono movil a traves de la aplicacion Google AI Edge Gallery, sin necesidad de servidor ni GPU dedicada. La cuantizacion aplicada es `int4_block32` con embeddings en int8 y una cache KV de 4096 tokens.

Se trata de un modelo de nicho, con 11 descargas y ningun "like" en el momento de la consulta, orientado a un caso de uso muy vertical: generar codigo VEX correcto y comentado a partir de una descripcion en lenguaje natural, con parametros ajustables mediante `chf()`, `chi()`, `chv()` y `chramp()`. Su relevancia reside en demostrar el flujo completo de especializacion de un modelo pequeno (1,7B) y su empaquetado para edge en un dominio tecnico muy especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B); no se detalla configuracion adicional en la model card |
| Parametros totales | 1,7B (modelo base Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens de cache KV configurada en el artefacto LiteRT-LM |
| Tipos de cuantizacion | int4_block32 con embeddings int8 |
| Idiomas soportados | No disponible (la model card no declara idiomas; los ejemplos de prompt estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, Google AI Edge); no se publican safetensors ni GGUF |
| Tamano del artefacto | 1,33 GB (repo de 1,3 GB) |
| Modelo base | unsloth/Qwen3-1.7B |
| Libreria de inferencia | litert-lm |
| Fecha de publicacion | 2026-10-29 |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-1.7B`, un transformer denso de 1,7 mil millones de parametros de la familia Qwen3. Sobre esa base se realizo un ajuste fino supervisado con un dataset propio de VEX para Houdini 18.5, segun indica el autor. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; tampoco documenta hiperparametros de entrenamiento ni la herramienta concreta usada para el fine-tuning (aunque el modelo base de Unsloth sugiere el uso de su stack de entrenamiento).

La innovacion tecnica principal no esta en la arquitectura sino en el pipeline de despliegue: el modelo se convierte a `.litertlm`, el formato de LiteRT-LM para ejecucion on-device, con cuantizacion `int4_block32` en los pesos y embeddings en int8, y una cache KV fijada en 4096 tokens. El entrenamiento emplea un formato de prompt estructurado en el que se describe el contexto de Houdini (por ejemplo, "Context: Attribute Wrangle, run over Points") seguido de la instruccion, y el modelo responde con un unico bloque de codigo ` ```vex `. Los contextos vistos en entrenamiento incluyen snippets VEX, Attribute Wrangle sobre puntos y primitivas, POP Wrangle, Gas Field Wrangle (DOP), RBD, crowd, shaders y preguntas conceptuales. El autor advierte que el codigo generado no ha sido verificado por compilador.

## Capacidades

- Generacion de codigo VEX para Houdini 18.5 en un unico bloque ` ```vex `, incluyendo snippets y wrangles.
- Cobertura de contextos Houdini especificos: Attribute Wrangle (points/prims), POP Wrangle, Gas Field Wrangle (DOP), RBD, crowd y shaders.
- Uso de funciones de parametrizacion de Houdini (`chf()`, `chi()`, `chv()`, `chramp()`) para exponer parametros ajustables en la interfaz.
- Generacion de comentarios de seccion breves dentro del codigo, segun el estilo de entrenamiento.
- Respuesta a preguntas conceptuales sobre VEX y Houdini, no solo generacion de codigo.
- Acepta un system prompt opcional que fija el rol de programador experto en VEX y el formato de salida.
- Inferencia on-device en movil mediante Google AI Edge Gallery (v1.0.16 o superior).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistencia a artistas tecnicos en Houdini: el modelo traduce una descripcion en lenguaje natural ("crea un desplazamiento por ruido controlado por un ramp a lo largo de la normal") a un snippet VEX listo para pegar en un Attribute Wrangle, con parametros expuestos via `chramp()` y `chf()`.
- Prototipado rapido de wrangles en produccion de VFX: dado que corre en un telefono con LiteRT-LM, el artista puede iterar sobre ideas de VEX en el set o en remoto sin acceso a una estacion de trabajo con GPU.
- Generacion de codigo para POP Wrangle y simulaciones: el modelo fue entrenado con contextos de POP Wrangle, RBD y crowd, por lo que puede proponer logica de particulas o de dinamica de cuerpos rigidos que luego se prueba en Houdini.
- Soporte a shaders y Gas Field Wrangle (DOP): util para escribir logica de campos en simulaciones DOP o fragmentos de shading, reduciendo el tiempo de busqueda en la documentacion de SideFX.
- Formacion y onboarding: al responder con codigo comentado y parametros ajustables, sirve como herramienta didactica para artistas que aprenden VEX, con la advertencia de que el resultado debe revisarse en Houdini.
- Asistente offline en dispositivos moviles: al estar empaquetado como `.litertlm`, se puede importar en Google AI Edge Gallery y usarse sin conexion, lo que encaja en entornos con conectividad limitada o politicas de datos restrictivas.
- Automatizacion de snippets repetitivos: generacion de plantillas de wrangle con secciones comentadas y parametros estandarizadas para un estudio, que luego se versionan en el pipeline interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia on-device: el artefacto `.litertlm` de 1,33 GB esta disenado para ejecutarse en telefono movil mediante LiteRT-LM y Google AI Edge Gallery (v1.0.16+); no requiere GPU de escritorio.
- VRAM estimada: no disponible de forma explicita; el modelo cuantizado a int4_block32 ocupa 1,33 GB en disco, por lo que el consumo en memoria es del orden de esa cifra mas la cache KV de 4096 tokens.
- GPU recomendadas: no aplica para el artefacto LiteRT-LM; para ejecutar el modelo base Qwen3-1.7B en formato estandar se requeriria una GPU consumer con al menos 4-6 GB de VRAM en cuantizacion de 4 bits, aunque esta variante no se distribuye en ese formato.
- Cabe en GPU consumer: si, en el caso del modelo base Qwen3-1.7B en cuantizacion; la variante publicada esta pensada para movil.
- Opciones de despliegue: Google AI Edge Gallery con LiteRT-LM; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Houdini VEX assistant 18.5 v3 (este modelo) | 1,7B | 4096 (cache KV) | `.litertlm` | Apache 2.0 | VEX/Houdini, on-device |
| Qwen3-1.7B (modelo base) | 1,7B | No disponible en la informacion | safetensors, GGUF | Apache 2.0 | Proposito general |
| Modelos de codigo de ~1-2B (categoria general) | 1-2B | Variable | safetensors, GGUF | Variable | Codigo general, sin especializacion VEX |

La comparativa directa con alternativas especializadas en VEX no esta disponible: no se conocen en la informacion proporcionada otros modelos publicos afinados para Houdini VEX. Frente al Qwen3-1.7B base, este modelo sacrifica generalidad a cambio de adherencia al formato VEX y al estilo de prompt de Houdini; frente a modelos de codigo general de tamano similar, la ventaja es la especializacion en el dominio y el empaquetado on-device, y la desventaja es la ausencia de formatos estandar (GGUF, safetensors) para servidores de inferencia convencionales.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el codigo generado no ha sido verificado por compilador; siempre debe probarse en Houdini antes de usarlo en produccion.
- Riesgo de alucinacion de funciones, argumentos o contextos de VEX inexistentes o incorrectos para Houdini 18.5; el modelo esta afinado para esa version concreta y puede fallar en versiones anteriores o posteriores.
- El modelo esta entrenado principalmente con prompts en ingles (los ejemplos de la model card estan en ingles); el rendimiento en castellano no esta documentado.
- Contexto limitado a 4096 tokens de cache KV, lo que restringe conversaciones multi-turno largas o la inclusion de fragmentos de codigo extensos en el prompt.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.
- El formato `.litertlm` limita el despliegue a LiteRT-LM y Google AI Edge Gallery; no hay artefactos GGUF ni safetensors publicados en el repo, lo que dificulta su uso en servidores o pipelines convencionales.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-1.7B conviene revisar las condiciones del modelo base y del dataset de entrenamiento, no detalladas en la model card.
- Modelo de nicho con muy poca adopcion (11 descargas, 0 likes) y sin benchmarks publicados; no hay evidencia cuantitativa de su calidad frente a alternativas.
- No se especifican sesgos conocidos ni la composicion del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashok969/houdini-vex-assistant-18.5-v3-1p7b-litertlm
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B
- Google AI Edge Gallery (LiteRT-LM): no se proporciona URL en la informacion disponible
- Documentacion de VEX de SideFX: no se proporciona URL en la informacion disponible
