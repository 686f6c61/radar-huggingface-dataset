# RabiatS/Llama-3.2-1B-Instruct-4bit-Lantern

## Resumen

RabiatS/Llama-3.2-1B-Instruct-4bit-Lantern es una copia redistribuida del modelo mlx-community/Llama-3.2-1B-Instruct-4bit, publicada por el desarrollador RabiatS para servir como modelo por defecto de Lantern, una aplicacion de IA local para iPhone, iPad y Mac. Se trata de un modelo de generacion de texto de 1.235.814.400 parametros (1,24 mil millones) cuantizado a 4 bits en formato MLX, con un peso de descarga de aproximadamente 0,7 GB. Los pesos no han sido modificados respecto a la conversion original de mlx-community, por lo que el modelo hereda integramente las caracteristicas del modelo base meta-llama/Llama-3.2-1B-Instruct.

El interes de esta ficha no esta en la aportacion tecnica —no la hay: es una redistribucion— sino en su papel como caso de uso de inferencia totalmente local en hardware de consumo. El modelo se ejecuta en el dispositivo, sin cuenta de usuario, sin servidor y sin envio de datos a terceros; el unico trafico de red es la descarga inicial de los ficheros. La model card indica que funciona en cualquier iPhone compatible con Lantern, incluidos telefonos con 4 GB de memoria como el iPhone 12 y el iPhone 13, lo que lo situa en el segmento de modelos pequenos orientados a respuestas rapidas, listas y reescritura de texto.

Es relevante ahora porque ejemplifica la tendencia a empaquetar modelos cuantizados para ejecucion en el borde (edge), con formatos especificos por plataforma (MLX frente a GGUF segun el ecosistema) y con la privacidad como argumento principal. Conviene subrayar que, al ser una copia sin cambios de pesos, cualquier evaluacion de calidad debe remitirse al modelo base de Meta y a la conversion original de mlx-community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 3.2 1B del modelo base); incluye Grouped-Query Attention y RoPE |
| Parametros totales | 1.235.814.400 (1,24 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens segun la configuracion publicada del modelo base; no verificado en esta conversion |
| Tipos de cuantizacion | 4 bits en formato MLX; el repositorio solo distribuye esta version cuantizada |
| Idiomas soportados | No especificado en la model card de esta conversion. El modelo base Llama 3.2 declara soporte oficial para 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.2 Community License (Copyright Meta Platforms, Inc.) |
| Formato de pesos | safetensors en formato MLX (libreria mlx); repositorio de aproximadamente 0,7 GB |

## Arquitectura y entrenamiento

El modelo es una redistribucion con pesos inalterados de mlx-community/Llama-3.2-1B-Instruct-4bit, que a su vez es una conversion a 4 bits del checkpoint meta-llama/Llama-3.2-1B-Instruct. No hay entrenamiento adicional, destilacion ni ajuste fino en esta publicacion: es un espejo de pesos con una model card propia y una integracion concreta con la aplicacion Lantern. Por tanto, la arquitectura y el proceso de entrenamiento son exactamente los del modelo base de Meta.

Segun la configuracion publicada del modelo base, se trata de un transformer decoder-only con 16 capas, dimension oculta de 2048, 32 cabezas de atencion y 8 cabezas de clave/valor (Grouped-Query Attention), dimension de cabeza de 64, capa intermedia de 8192, vocabulario de 128.256 tokens y ventana de contexto de 131.072 posiciones. Emplea RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado con hasta 9 billones de tokens y ajustado por instrucciones mediante supervision, muestreo por rechazo y optimizacion directa de preferencias (DPO), con fecha de corte de conocimiento en diciembre de 2023. La cuantizacion a 4 bits reduce el peso del fichero de pesos a aproximadamente una cuarta parte, a costa de una perdida de calidad que no se cuantifica en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato instruct, heredada del ajuste por instrucciones del modelo base.
- Respuestas rapidas de uso cotidiano: definiciones breves, listas, reescritura, resumenes cortos y reformulacion de frases, tal como indica la model card.
- Capacidad multilingue limitada a los 8 idiomas declarados por Llama 3.2, con rendimiento notablemente inferior fuera del ingles en modelos de este tamano.
- Razonamiento basico y resolucion de problemas sencillos; no se debe esperar razonamiento multi-paso fiable a esta escala.
- Generacion de codigo solo a nivel elemental; la model card no declara capacidades de programacion destacadas.
- Soporte de tool calling o function calling: no confirmado en la informacion disponible. La model card de esta conversion no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales: no dispone de modo de pensamiento (thinking), ni vision, ni audio. Es un modelo exclusivamente de texto.
- Ejecucion totalmente local y offline en el dispositivo, sin telemetria ni envio de datos, como caracteristica principal de la integracion.

## Casos de uso

- Asistente conversacional local en iPhone, iPad y Mac: la aplicacion Lantern integra este modelo como opcion por defecto, de modo que el usuario puede mantener conversaciones multi-turno sin conexion y sin que el texto salga del dispositivo. El tamano de 0,7 GB y su encaje en telefonos con 4 GB de RAM lo hacen viable incluso en hardware movil modesto.
- Procesamiento de texto sensible: notas medicas, borradores legales, credenciales temporales o correspondencia privada pueden resumirse o reescribirse en local, evitando el envio a APIs de terceros. Es el escenario donde el valor no es la calidad bruta del modelo, sino la garantia de que no hay salida de datos.
- Reescritura y correccion de estilo rapida: reformular parrafos, acortar textos, cambiar el tono de un mensaje o generar alternativas de redaccion para correos y mensajes cortos, aprovechando la ventana de contexto amplia del modelo base para conservar hilos de conversacion largos.
- Generacion de listas y extraccion estructurada simple: convertir un texto libre en una lista de tareas, extraer elementos mencionados o resumir notas en puntos, tareas adecuadas para un modelo de 1,24 mil millones de parametros.
- Clasificacion y etiquetado ligero en pipelines locales: categorizar mensajes, detectar intencion o asignar etiquetas a fragmentos de texto en un flujo que se ejecuta enteramente en el Mac, sin coste por token y con latencia predecible.
- Prototipado de pipelines MLX: sirve como modelo de referencia para validar codigo con mlx-lm en un Mac con Apple Silicon antes de escalar a modelos mayores de la misma familia, gracias a su descarga reducida y a su rapida puesta en marcha mediante el comando de generacion de mlx-lm.
- Educacion y practica de ingenieria de prompts: al ser pequeno y ejecutable en cualquier equipo Apple reciente, resulta util para ensenar tecnicas de prompting, cuantizacion y despliegue en el borde sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco ofrece mediciones de latencia o throughput. Cualquier dato de rendimiento debe consultarse en la documentacion oficial del modelo base meta-llama/Llama-3.2-1B-Instruct, teniendo en cuenta que la cuantizacion a 4 bits introducira una degradacion adicional no cuantificada en esta ficha.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 0,7-0,9 GB para los pesos en 4 bits, mas el espacio del cache KV y del runtime. Un presupuesto practico de 1,5-2 GB de memoria es razonable para contextos moderados.
- Cache KV: segun la configuracion publicada del modelo base (16 capas, 8 cabezas KV, dimension de cabeza 64), el cache ocupa unos 32 KB por token en precision de 16 bits. Esto implica que agotar la ventana completa de 128.000 tokens requeriria del orden de 4 GB solo para el cache, estimacion propia derivada de la arquitectura; en la practica conviene limitar el contexto en dispositivo.
- Cabe en GPU de consumo: no aplica en el sentido convencional. MLX esta disenado para Apple Silicon, de modo que el modelo se ejecuta en la CPU/GPU unificada de Macs con chip M1 o posterior, y en iPhone y iPad compatibles con Lantern. La model card menciona explicitamente telefonos con 4 GB de memoria, como el iPhone 12 y el iPhone 13.
- GPU recomendadas: no requiere GPU NVIDIA, A100, H100 ni RTX 4090. El runtime objetivo es Apple Silicon.
- Opciones de despliegue: mlx-lm en Mac mediante el comando mlx_lm.generate con el identificador del repositorio, y la aplicacion Lantern en iOS y macOS. No se distribuyen pesos en formato GGUF, por lo que llama.cpp u Ollama no pueden consumir este repositorio tal cual; para esos entornos habria que recurrir a otras conversiones del modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| RabiatS/Llama-3.2-1B-Instruct-4bit-Lantern | 1,24 mil millones | 128.000 tokens (modelo base) | MLX 4 bits | Llama 3.2 Community License | Copia sin cambios de la conversion de mlx-community, orientada a la app Lantern |
| mlx-community/Llama-3.2-1B-Instruct-4bit | 1,24 mil millones | 128.000 tokens | MLX 4 bits | Llama 3.2 Community License | Fuente directa de esta publicacion; pesos identicos |
| mlx-community/Llama-3.2-3B-Instruct-4bit | Aproximadamente 3,2 mil millones | 128.000 tokens | MLX 4 bits | Llama 3.2 Community License | Mayor calidad a cambio de mas memoria y descarga; requiere hardware mas capaz |
| Qwen2.5-1.5B-Instruct (conversiones MLX de 4 bits) | Aproximadamente 1,54 mil millones | 32.768 tokens nativos | MLX 4 bits | Apache 2.0 | Alternativa con licencia permisiva y contexto menor; existencia de conversion MLX dependiente del tercero que la publique |
| Gemma 2 2B Instruct (conversiones MLX de 4 bits) | Aproximadamente 2,6 mil millones | 8.192 tokens | MLX 4 bits | Gemma Terms of Use | Contexto mas corto y licencia con condiciones propias de Google |

Las cifras de parametros y contexto de los modelos alternativos corresponden a sus especificaciones publicas y deben verificarse en las fichas oficiales antes de tomar decisiones de produccion.

## Limitaciones y advertencias

- Escala reducida: con 1,24 mil millones de parametros, el modelo tiene conocimiento factual limitado y una tasa de alucinacion alta en preguntas de cultura general, datos numericos, referencias bibliograficas y cualquier consulta que requiera precision.
- Cuantizacion a 4 bits: la cuantizacion agresiva degrada la coherencia y la fidelidad respecto al checkpoint en precision completa. La model card no cuantifica esta perdida.
- Idiomas: el modelo base declara 8 idiomas, pero el rendimiento en lenguas distintas del ingles es notablemente inferior a esta escala. La model card de esta conversion no especifica idiomas soportados.
- Contexto largo poco fiable: aunque la ventana teorica sea de 128.000 tokens, un modelo de este tamano rara vez aprovecha de forma util contextos muy extensos, y el coste de memoria del cache KV lo hace poco practico en movil.
- Soporte de tool calling, agentes y razonamiento multi-paso: no confirmado en la informacion disponible; no conviene asumirlo en produccion sin verificacion.
- Sin capacidades multimodales: es un modelo exclusivamente de texto. La variante de vision de Llama 3.2 corresponde a los modelos de 11B y 90B, no a este.
- Licencia: se rige por la Llama 3.2 Community License y por la politica de uso aceptable de Meta, que se incluyen en el repositorio. Existen obligaciones de atribucion ("Built with Llama") y condiciones especificas para usos a gran escala; conviene revisar ambos documentos antes de un uso comercial.
- Dependencia de plataforma: los pesos estan en formato MLX, lo que limita su uso a Apple Silicon. No hay versiones GGUF ni compatibilidad directa con llama.cpp, Ollama o vLLM en este repositorio.
- Madurez e historial: el repositorio registra 0 descargas y 0 valoraciones, y no incluye evaluaciones propias ni procesos de validacion adicionales. Se trata de un espejo mantenido por un tercero, no de una publicacion oficial.
- Procedencia de los datos de esta ficha: las especificaciones de arquitectura y entrenamiento se han tomado de la documentacion publica del modelo base de Meta, no de mediciones realizadas sobre esta conversion concreta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RabiatS/Llama-3.2-1B-Instruct-4bit-Lantern
- Conversion original de mlx-community: https://huggingface.co/mlx-community/Llama-3.2-1B-Instruct-4bit
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio de la aplicacion Lantern: https://github.com/RabiatS/lantern
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
- Licencia Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy/
