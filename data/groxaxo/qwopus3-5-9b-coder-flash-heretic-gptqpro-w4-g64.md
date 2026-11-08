# groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-GPTQPro-W4-G64

## Resumen

Qwopus3.5-9B-Coder-Flash-Heretic-GPTQPro-W4-G64 es una cuantizacion INT4 del modelo multimodal groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic, publicada por el mismo autor (groxaxo) mediante su fork de la herramienta GPTQ-Pro. El modelo base es a su vez una abliteration ARA (ablación de direcciones de rechazo) del checkpoint Jackrong/Qwopus3-5-9B-Coder-Flash, de licencia Apache-2.0. El resultado es un modelo de 9.653.104.368 parametros (9,65 mil millones) orientado a generacion de codigo, conversacion y uso como agente, con capacidad de entrada imagen-texto.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo de cuantizacion selectiva: se comprimen a INT4 las 200 proyecciones lineales del decodificador de texto, mientras que la torre de vision se preserva en BF16 de origen, junto con embeddings, cabeza de salida y tensores de normalizacion. Por otro, ilustra el ecosistema de variantes "uncensored" derivadas de modelos Qwen, con las advertencias que ello implica: la abliteration y la cuantizacion no validan por si mismas las afirmaciones del publicador original.

La informacion disponible es limitada: no hay benchmarks publicados del modelo cuantizado, no se declaran idiomas soportados de forma explicita y el autor reconoce que la calibracion se hizo solo con texto, por lo que la calidad multimodal tras la cuantizacion no esta evaluada. El modelo se publico en noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de la familia Qwen3.5; tag `qwen3_5` |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simetrico con group_size=64 (GPTQ-Pro W4 G64); torre de vision en BF16; embeddings, cabeza de salida y normalizaciones sin cuantizar |
| Idiomas soportados | no disponible (la validacion menciona pruebas en ingles, espanol y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato GPTQ-Pro, requiere runtime compatible) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5, con un decodificador de texto y una torre de vision, disenado para tareas image-text-to-text. Sobre el checkpoint Jackrong/Qwopus3-5-9B-Coder-Flash (Apache-2.0) se aplico una abliteration ARA que dio lugar a la variante "Heretic"; despues, el autor cuantizo el decodificador de texto con su fork GPTQ-Pro. La receta de cuantizacion es `QuantizeConfig.quality_4bit(group_size=64)`: INT4 simetrico con GAR (Gaussian Activation Refinement), MSE ponderado por activaciones y Hessiano en FP32 estricto, sin fallback, GPTAQ ni FOEM. Se cuantizaron las 200 proyecciones lineales del decodificador de texto; la torre de vision se conserva en BF16 de origen y los embeddings, la cabeza de salida y los tensores de normalizacion mantienen sus valores originales exactos.

La calibracion se realizo con 128 conversaciones publicas completas (118.683 tokens, entre 512 y 2048 tokens por muestra): 64 ejemplos de codigo, 48 de chat y 16 de tool calling, con el tokenizer y la plantilla originales de Qwen3.5 y semilla 3407. El corpus, sus revisiones y hashes estan en `LOCAL_QUANTIZATION_PROVENANCE.json`. No se realizo fine-tuning adicional. La validacion incluyo recarga del checkpoint guardado y una prueba de generacion con el backend nativo GPTQ-Pro en una RTX 3090; un smoke heldout disjunto de 24 conversaciones (primeros 512 tokens de cada una) dio NLL 1,479804 nats/token y perplejidad 4,392086. El autor no comparo la calidad contra el BF16 original.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Generacion y asistencia de codigo (el modelo base se denomina "Coder").
- Entrada de imagen y texto (pipeline `image-text-to-text`), con torre de vision preservada en BF16.
- Soporte de tool calling / function calling: la calibracion incluye 16 ejemplos de herramientas y el modelo se etiqueta como `agent`.
- Uso como agente y razonamiento multi-paso (tag `agent`).
- Multilingue: la validacion reporta salidas de prueba en ingles, espanol y chino, aunque no se declara una lista formal de idiomas.
- Variante "uncensored" (abliterated): menor tendencia a rechazar peticiones, con las implicaciones eticas que ello conlleva.
- Integracion con `transformers` y `AutoProcessor` para entradas multimodales.

## Casos de uso

- Asistente de codigo en IDE o CLI: el modelo puede completar y explicar fragmentos de codigo en conversaciones multi-turno; su tamano de 9,65 mil millones permite desplegarlo en una sola GPU de 24 GB en INT4, lo que facilita el uso local en estaciones de trabajo de desarrollo.
- Automatizacion de atencion al cliente: al soportar conversacion multi-turno y tool calling, puede gestionar dialogos con contexto acumulado e invocar APIs de consulta de pedidos o estado de cuenta; conviene validar antes la calidad en espanol, ya que no hay benchmarks publicados.
- Agente de automatizacion de tareas: con soporte de function calling y etiqueta `agent`, puede encadenar pasos (leer un fichero, ejecutar una busqueda, resumir resultados) en pipelines orquestados por frameworks como LangChain o similares.
- Procesamiento de capturas y diagramas: al aceptar entrada de imagen, puede transcribir capturas de pantalla de errores, leer diagramas de arquitectura o extraer texto de imagenes y convertirlo en codigo o documentacion; la calidad multimodal tras la cuantizacion no esta evaluada, por lo que requiere pruebas propias.
- Generacion de documentacion tecnica a partir de repositorios: con contexto suficiente (no declarado) y capacidad de codigo, puede resumir modulos, generar docstrings o redactar guias de uso a partir de fragmentos de codigo.
- Entornos de investigacion sobre alineacion y abliteration: al ser una variante "Heretic" cuantizada, sirve para estudiar el efecto de la abliteration y de la cuantizacion INT4 sobre el comportamiento de rechazo y la calidad, comparando con el checkpoint BF16 original.
- Prototipado rapido en local: el formato GPTQ-Pro con 9,2 GB de repo permite cargar el modelo en una RTX 3090 o similar y experimentar sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es la validacion interna del autor: NLL 1,479804 nats/token y perplejidad 4,392086 sobre un smoke heldout de 24 conversaciones publicas (primeros 512 tokens de cada una). No se realizo comparacion con el modelo BF16 original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para los pesos INT4 (9,2 GB de repo incluye tambien tensores en BF16 como la torre de vision y la cabeza de salida), mas overhead de activaciones y cache KV; en la practica, 10-12 GB es un margen razonable para contexto moderado.
- GPU recomendadas: RTX 3090 (validada por el autor), RTX 4090, A100, H100. Cabe en GPUs de consumo con 12 GB o mas, como RTX 3060 12 GB, RTX 4070 Ti o RTX 4080, siempre que se ajuste el contexto.
- Despliegue: requiere el runtime GPTQ-Pro (fork en github.com/groxaxo/GPTQ-Pro) y el paquete `gptqmodel` con backend `BACKEND.GPTQ_PRO`; probado con PyTorch 2.11.0+cu130 y Transformers 5.19.0. No se garantiza compatibilidad con runtimes GPTQ estandar, vLLM, llama.cpp u Ollama, que no se mencionan en la model card.
- Latencia y throughput: no disponibles. El autor solo reporta que la prueba de generacion paso en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-Flash-Heretic-GPTQPro-W4-G64 (este) | 9,65 mil millones | no disponible | texto + imagen | Apache-2.0 | Hugging Face, runtime GPTQ-Pro |
| groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic (BF16) | 9,65 mil millones | no disponible | texto + imagen | Apache-2.0 | Hugging Face |
| Jackrong/Qwopus3-5-9B-Coder-Flash (upstream) | 9 mil millones (aprox.) | no disponible | texto + imagen | Apache-2.0 | Hugging Face |
| djrsystemservices/Qwopus3-5-9B-Coder-Flash-oQ4e-mtp | no disponible | no disponible | texto + imagen | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal entre ellas es el esquema de cuantizacion y el grado de modificacion (abliteration) respecto al checkpoint original.

## Limitaciones y advertencias

- No hay benchmarks publicados: la unica metrica es la perplejidad interna del autor, sin comparacion con el BF16, por lo que no se puede cuantificar la perdida de calidad por la cuantizacion.
- La calibracion fue solo con texto; la calidad de imagen y video tras la cuantizacion no esta evaluada.
- La abliteration ("Heretic") reduce los rechazos del modelo; esto puede aumentar la probabilidad de generar contenido inapropiado, danino o inseguro. El autor advierte que la abliteration y la cuantizacion no validan de forma independiente las afirmaciones del publicador upstream.
- Riesgo de alucinacion inherente a los modelos de 9 mil millones de parametros, especialmente en tareas de codigo y datos factuales; requiere verificacion en produccion.
- Idiomas soportados no declarados formalmente; las pruebas en espanol y chino son smoke tests, no evaluaciones sistematicas.
- El runtime es especifico: usar GPTQ estandar en lugar del fork GPTQ-Pro puede producir resultados incorrectos o fallos de carga.
- Licencia Apache-2.0 permite uso comercial, pero las obligaciones de atribucion y las posibles restricciones derivadas del modelo upstream (Qwen) deben revisarse antes de desplegar.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.
- El contexto maximo no esta documentado, lo que dificulta planificar casos de uso con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-GPTQPro-W4-G64
- Modelo base (Heretic, BF16): https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic
- Upstream original: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Variante alternativa oQ4e-mtp: https://huggingface.co/djrsystemservices/Qwopus3-5-9B-Coder-Flash-oQ4e-mtp
- Repositorio GPTQ-Pro: https://github.com/groxaxo/GPTQ-Pro
