# Indexnusrefather/Palette-RP-1.2B-Instruct-2609-v0.5

## Resumen

Palette-RP-1.2B-Instruct-2609-v0.5 es un ajuste fino (finetune) experimental orientado a roleplay y escritura creativa, desarrollado por el usuario Indexnusrefather sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct. El modelo cuenta con 1.170.340.608 parametros (aproximadamente 1,17 mil millones) y se distribuye en formato safetensors y GGUF, con etiquetas que lo situan en la familia arquitectonica LFM2 de Liquid AI. El autor lo describe como un proyecto ligero de destilacion creativa entrenado con chatlogs de roleplay provenientes del dataset Indexnusrefather/Hy4-Roleplaying-Data-RAW, siguiendo una metodologia similar a la de su modelo "Palette 4B".

Su relevancia actual es limitada y muy especifica: se trata de un modelo de nicho (roleplay en ingles, en el borde de lo que puede ejecutarse en hardware de consumo) publicado con cero descargas y cero likes en el momento de la consulta, lo que indica una adopcion practicamente nula. La model card menciona que el desarrollo de un dataset mayor y de mayor calidad, probablemente basado tambien en Hy4, sigue en curso y que el autor espera completarlo a mediados de octubre si la financiacion lo permite, por lo que esta version debe considerarse un artefacto intermedio mas que un producto estable.

No hay informacion publica sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia indicada por los tags del repositorio); detalles de capas no disponibles en la informacion proporcionada |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF incluido en el repositorio; niveles concretos no especificados |
| Idiomas soportados | Ingles (en) |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace, con enlace a LICENSE) |
| Formato de pesos | safetensors y GGUF |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Dataset de entrenamiento | Indexnusrefather/Hy4-Roleplaying-Data-RAW |
| Libreria | transformers |
| Tamano del repositorio | 5,9 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El repositorio incluye el tag "lfm2" y declara como modelo base LiquidAI/LFM2.5-1.2B-Instruct, de modo que el modelo hereda la arquitectura de esa familia. La model card no detalla la configuracion interna (numero de capas, tipo de atencion, dimension del estado oculto ni longitud de contexto nativa), por lo que cualquier descripcion concreta de la arquitectura mas alla de esa pertenencia familiar seria especulativa y no se incluye aqui.

En cuanto al entrenamiento, el autor lo describe como un "proyecto ligero experimental" realizado sobre LFM2.5 1.2B Instruct y entrenado con chatlogs de roleplay de "Hy4 Preview", con una metodologia "casi identica" a la de Palette 4B. No se especifica el numero de tokens, la composicion del dataset, el regimen de entrenamiento ni si hubo fases de RLHF, DPO u otra alineacion posterior al ajuste supervisado. Tampoco se documentan innovaciones tecnicas propias.

## Capacidades

- Generacion de texto conversacional y creativo en ingles, con enfasis declarado en roleplay (RP), narrativa y escritura creativa.
- Mantenimiento de personajes y estilo narrativo, segun la orientacion del ajuste fino y las etiquetas del repositorio ("Writer", "Narrative", "Creative Writing").
- Generacion de dialogos multi-turno en un contexto conversacional ("conversational").
- Orientacion a despliegue en el borde ("Edge"), coherente con su tamano de 1,17 B de parametros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no, el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional de un solo personaje: el modelo esta ajustado especificamente sobre chatlogs de roleplay, por lo que es su caso de uso natural; se usaria como motor de un chat de ficcion interactiva en ingles, gestionando turnos de dialogo y manteniendo el registro del personaje.
- Escritura creativa asistida: generacion de escenas narrativas, dialogos y descripciones en ingles, aprovechando el enfasis del ajuste en "Narrative" y "Creative Writing".
- Prototipado de experiencias interactivas en el borde: con 1,17 B de parametros y pesos GGUF, puede ejecutarse localmente para demos de ficcion interactiva sin depender de una API externa.
- Generacion de datos sinteticos de roleplay: util para producir borradores de conversaciones que luego se filtren y se usen como material de partida en la construccion de datasets de mayor calidad, dado que el autor ya trabaja en esa direccion con Hy4.
- Experimentacion academica sobre destilacion creativa en modelos pequenos: sirve como punto de comparacion frente a modelos mayores del mismo autor (Palette 4B) para estudiar como escala la calidad del roleplay con el tamano.
- Pruebas de cuantizacion y despliegue en hardware modesto: al publicar pesos GGUF, permite medir el impacto de distintas cuantizaciones en la coherencia narrativa de un modelo de 1,17 B.
- Chatbot de personaje para comunidades de ficcion en ingles: siempre que se asuma su licencia y su condicion experimental, podria alimentar bots de rol en Discord u otros entornos de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de roleplay, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16, ~2 bytes por parametro): en torno a 2,4 GB solo para los pesos, mas la cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,2-1,4 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,7-0,9 GB de pesos.
- Cabe en GPU de consumo: si. Cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650 4 GB, RTX 3050, RTX 4060) deberia poder ejecutarlo en cuantizaciones de 4 u 8 bits; en FP16 bastaria con 6 GB o mas (RTX 3060, RTX 2060, etc.).
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento o para servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp / Ollama y otros motores compatibles con GGUF, y servidores de inferencia que acepten safetensors. El tag "endpoints_compatible" sugiere compatibilidad con los endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la columna de alternativas no provienen de la informacion proporcionada en esta consulta y deben verificarse en las fichas oficiales correspondientes.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Palette-RP-1.2B-Instruct-2609-v0.5 | 1,17 B | No disponible | lfm1.0 ("other") | Roleplay y escritura creativa en ingles | safetensors y GGUF; 0 descargas |
| LiquidAI/LFM2.5-1.2B-Instruct (modelo base) | ~1,2 B | No disponible en esta consulta | Licencia de Liquid AI | Instrucciones generales | Repositorio oficial de Liquid AI |
| Alternativas de ~1-2 B orientadas a instrucciones (por ejemplo, familias Qwen2.5 1.5B, Gemma 2 2B o SmolLM2 1.7B) | ~1,5-2 B | No verificado en esta consulta | Varía segun modelo | Instrucciones generales | Ampliamente disponibles |
| Palette 4B (mismo autor, segun la model card) | No disponible | No disponible | No disponible | Roleplay y escritura creativa | Repositorio del autor |

No se dispone de comparaciones de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental: el propio autor etiqueta el modelo como "Experimental" y lo describe como un proyecto ligero e intermedio; no es un modelo estable ni validado.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de errores.
- Idioma: solo ingles. No hay soporte declarado de castellano ni de otros idiomas.
- Sesgos: no documentados en la model card. Al entrenarse sobre chatlogs de roleplay, es esperable que reproduzca los sesgos de estilo, tematica y caracterizacion presentes en esos datos, pero no hay analisis publicado.
- Riesgo de alucinacion: no cuantificado. Los modelos pequenos ajustados para ficcion suelen generar contenido factualmente incorrecto cuando se les pide informacion veraz, algo que debe asumirse en produccion.
- Contexto: se desconoce la longitud de ventana efectiva del modelo ajustado; no se debe planificar un caso de uso con contexto largo sin medirlo antes.
- Licencia: se declara "lfm1.0" (etiquetada como "other"), heredada del modelo base. Es una licencia no estandar, por lo que es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial o redistribucion.
- Contenido: al ser un modelo de roleplay sin filtros documentados, puede producir contenido inapropiado; requiere moderacion si se expone a usuarios finales.
- Trazabilidad: la model card no documenta hiperparametros, numero de tokens, composicion del dataset ni proceso de evaluacion, lo que dificulta reproducir o auditar el ajuste.
- La model card incluye direcciones de criptomonedas para donaciones; no tiene relacion con el uso tecnico del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Indexnusrefather/Palette-RP-1.2B-Instruct-2609-v0.5
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Indexnusrefather/Hy4-Roleplaying-Data-RAW
- Apoyo al autor (no cripto): https://boosty.to/Indexnusrefather
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos corresponden a un portal de compraventa de embarcaciones (boat24.com) y no guardan ninguna relacion con el modelo; se descartan por completo.
