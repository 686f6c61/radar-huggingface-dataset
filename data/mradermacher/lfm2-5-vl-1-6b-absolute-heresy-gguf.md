# mradermacher/LFM2.5-VL-1.6B-absolute-heresy-GGUF

## Resumen

LFM2.5-VL-1.6B-absolute-heresy-GGUF es una cuantizacion estatica en formato GGUF del modelo multimodal MuXodious/LFM2.5-VL-1.6B-absolute-heresy, un derivado "abliterated" (tambien etiquetado como heretic, uncensored o decensored) del modelo LiquidAI LFM2.5-VL de 1.6B parametros. El trabajo de cuantizacion lo firma mradermacher, autor habitual de conversiones GGUF para llama.cpp, y esta pensado para ejecutar el modelo en hardware de gama baja o en el borde (edge), incluyendo CPU.

El modelo subyacente pertenece a la familia LFM2 de Liquid AI, disenada especificamente para inferencia en dispositivos con recursos limitados. Se trata de un modelo vision-lenguaje (VL) que acepta imagenes y texto, con un total real de 1.170.340.608 parametros en los pesos safetensors del modelo base. La variante "absolute-heresy" aplica una intervencion de tipo abliteration sobre los pesos para eliminar los rechazos aprendidos por alineamiento, de modo que el modelo responde a peticiones que el original rechazaria.

La relevancia de esta ficha es doble: por un lado, documenta una opcion practica para desplegar un VLM de ~1.2B parametros en entornos sin GPU dedicada gracias a las cuantizaciones de 0.6 a 2.4 GB; por otro, advierte de que el modelo ha sido modificado para eliminar salvaguardas, lo que exige una evaluacion de riesgos antes de cualquier uso en produccion. La licencia declarada es lfm1.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) de la familia LFM2; detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 1.170.340.608 (pesos safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para el codificador visual |
| Idiomas soportados | en, ja, ko, fr, es, de, ar, zh |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors/transformers |
| Tamano del repositorio | 12.0 GB |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

El modelo base es un VLM de la familia LFM2 de Liquid AI, una linea de modelos disenada para despliegue en el borde con un equilibrio agresivo entre calidad y coste computacional. La informacion disponible no detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion exacta del dataset de entrenamiento. Tampoco se documentan las fases de alineamiento (RLHF, DPO) del modelo original en la informacion proporcionada.

La innovacion principal de esta variante concreta no es arquitectonica sino de pesos: se trata de un modelo "abliterated", una tecnica que identifica las direcciones de activacion asociadas al comportamiento de rechazo y las proyecta fuera de los pesos, de modo que el modelo pierde la tendencia a negarse a responder. El autor del modelo base (MuXodious) aplica esta intervencion sobre el LFM2.5-VL-1.6B original; mradermacher se limita a convertir y cuantizar los pesos resultantes a GGUF, sin reentrenamiento adicional. No se dispone de informacion sobre el volumen de tokens empleado en el entrenamiento original ni sobre la mezcla de datos multimodales.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat (tag `conversational`).
- Comprension de imagenes: el repositorio incluye ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, necesarios para procesar entradas visuales en llama.cpp.
- Capacidades multilingues en ingles, japones, coreano, frances, espanol, aleman, arabe y chino.
- Respuestas sin rechazo por alineamiento: la variante "absolute-heresy" elimina las negativas aprendidas, lo que permite abordar tematicas que el modelo original rechazaria.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos en el borde: desplegar la cuantizacion Q4_K_M (0.8 GB) junto con el `mmproj-Q8_0` en un mini-PC o una Raspberry Pi para extraer texto y describir imagenes de facturas o albaranes sin conexion a la nube.
- Asistente visual para personas con discapacidad visual: el modelo puede describir el contenido de una fotografia capturada por la camara del movil en local, con latencia baja gracias al reducido numero de parametros y a la cuantizacion Q4_K_S.
- Moderacion y analisis de contenido sin filtros: al estar abliterated, es util para investigacion sobre sesgos y seguridad, permitiendo estudiar que respuestas produce un modelo sin alineamiento ante prompts sensibles en un entorno controlado.
- Clasificacion y etiquetado de imagenes a escala: integrar el modelo en un pipeline de preprocesado que genere descripciones o etiquetas para un corpus de imagenes antes de pasarlas a un modelo mayor, aprovechando su bajo coste por inferencia.
- Prototipado rapido de aplicaciones VLM: usar el GGUF con llama.cpp u Ollama en un portatil sin GPU para validar la logica de una aplicacion multimodal antes de invertir en infraestructura.
- Traduccion y atencion al cliente multilingue: el soporte de ocho idiomas permite construir un bot de soporte que responda en espanol, frances o arabe con contexto visual (capturas de pantalla del usuario).
- Investigacion academica sobre abliteration: comparar las respuestas del modelo heretic frente al LFM2.5-VL original para medir el efecto de la intervencion sobre los pesos en tareas de vision-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0.6 GB (Q2_K) y 2.4 GB (f16) para los pesos del modelo de lenguaje, mas 0.7-1.0 GB adicionales del proyector multimodal `mmproj` si se procesan imagenes.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) usando Q4_K_M o Q5_K_M.
- Ejecucion en CPU: viable con llama.cpp; las cuantizaciones Q4_K_S y Q4_K_M (0.8 GB) son las recomendadas por el autor para velocidad.
- GPU de datacenter: A100, H100 o L40S no son necesarias; el modelo esta pensado para hardware de gama baja y su uso en estas GPU estaria infrautilizado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier frontend compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con 1.17B parametros y cuantizacion de 4 bits, se espera una generacion en tiempo real en CPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-1.6B-absolute-heresy-GGUF (este) | 1.17B | No disponible | Vision + texto | lfm1.0 | GGUF |
| LFM2.5-VL-1.6B original (LiquidAI) | 1.6B (nominal) | No disponible | Vision + texto | lfm1.0 | safetensors |
| MuXodious/LFM2.5-VL-1.6B-absolute-heresy | 1.17B | No disponible | Vision + texto | lfm1.0 | safetensors |
| mradermacher/LFM2.5-VL-1.6B-absolute-heresy-i1-GGUF | 1.17B | No disponible | Vision + texto | lfm1.0 | GGUF con imatrix |

La comparativa con modelos de otras familias (por ejemplo, Qwen2.5-VL-3B o SmolVLM) no esta disponible en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento relativas.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion del comportamiento de rechazo implica que puede generar contenido danino, ilegal o sexualmente explicito. No es apto para uso directo en aplicaciones orientadas al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: con 1.17B parametros, la capacidad de razonamiento y de verificacion factica es limitada; es probable que invente detalles en descripciones de imagenes complejas.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor desaconseja Q3_K_M por "lower quality". Para produccion se recomienda Q4_K_M o superior.
- Contexto desconocido: no se ha publicado la longitud de contexto en la informacion disponible, lo que impide garantizar conversaciones largas o documentos extensos.
- Idiomas: aunque se declaran ocho idiomas, el rendimiento real en espanol, arabe o coreano no esta documentado con benchmarks; el ingles es presumiblemente el idioma mejor soportado.
- Licencia lfm1.0: es una licencia "other" con posibles restricciones de uso comercial. Debe revisarse el fichero LICENSE del modelo base antes de desplegarlo en un producto.
- Trazabilidad: al ser una cuantizacion de un derivado modificado, la cadena de responsabilidad sobre el comportamiento del modelo se reparte entre LiquidAI, MuXodious y mradermacher; conviene fijar la version exacta del GGUF en produccion.
- Proyector multimodal separado: es imprescindible descargar el fichero `mmproj` correspondiente; sin el, el modelo solo procesa texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-VL-1.6B-absolute-heresy-GGUF
- Modelo base (safetensors): https://huggingface.co/MuXodious/LFM2.5-VL-1.6B-absolute-heresy
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/LFM2.5-VL-1.6B-absolute-heresy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM2.5-VL-1.6B-absolute-heresy-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
