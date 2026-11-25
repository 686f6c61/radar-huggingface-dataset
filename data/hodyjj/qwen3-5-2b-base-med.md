# HodyJJ/Qwen3.5-2B-Base-MED

## Resumen

HodyJJ/Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario HodyJJ. El nombre sugiere una adaptacion del modelo base Qwen3.5 de 2B parametros orientada al dominio medico (sufijo "MED"), aunque la model card no confirma esta interpretacion ni documenta el proceso. El checkpoint contiene 2.213.241.664 parametros en formato safetensors y ocupa 4,4 GB en el repositorio.

La model card es la plantilla automatica de Hugging Face sin rellenar: practicamente todos los campos figuran como "[More Information Needed]". Los unicos metadatos tecnicos fiables son los que aporta el propio Hub: arquitectura declarada qwen3_5, pipeline image-text-to-text, libreria transformers, tags de trl y sft (lo que indica un ajuste supervisado con la libreria TRL), y compatibilidad con endpoints.

Su relevancia actual es limitada y debe interpretarse con cautela: se trata de un modelo recien creado (25 de noviembre de 2026) con cero descargas y cero likes, sin licencia declarada, sin idiomas declarados y sin resultados de evaluacion. Resulta util como objeto de estudio de fine-tuning multimodal sobre una base Qwen3.5 pequena, pero no es apto para produccion sin una evaluacion independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, segun tag del Hub) |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se distribuyen GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Metodo de ajuste | SFT (tag trl, sft) |
| Tamano del repositorio | 4,4 GB |

## Arquitectura y entrenamiento

El Hub etiqueta el modelo con la arquitectura qwen3_5, lo que apunta a una base de la familia Qwen 3.5 de Alibaba, en su variante de 2B parametros. El pipeline image-text-to-text indica que el checkpoint acepta imagenes y texto como entrada y genera texto, por lo que incorpora algun componente de vision (probablemente un encoder visual acoplado al transformer de lenguaje). No obstante, la model card no describe la arquitectura interna, el tipo de atencion, la longitud de contexto nativa ni la configuracion del proyector multimodal.

En cuanto al entrenamiento, los tags trl y sft confirman que se aplico un ajuste supervisado (supervised fine-tuning) con la libreria TRL de Hugging Face. Se desconoce por completo el dataset utilizado, su composicion, el numero de tokens, si hubo etapas de RLHF o DPO, los hiperparametros y el hardware empleado. El sufijo "MED" sugiere una especializacion en dominio medico, pero no hay evidencia documentada en la model card que lo respalde. Tampoco se declaran innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen y texto), segun el pipeline declarado image-text-to-text.
- Procesamiento de imagenes: al estar etiquetado como image-text-to-text, se presupone capacidad de describir, interpretar o responder preguntas sobre imagenes, aunque no se detalla el alcance.
- Ajuste conversacional: el tag conversational indica que el checkpoint esta preparado para dialogos multi-turno.
- Especializacion potencial en dominio medico por el sufijo "MED" del identificador, sin confirmacion documental.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes clinicos de triaje informativo: el modelo podria clasificar y resumir consultas textuales de pacientes en un entorno de prueba, dado su ajuste SFT y su orientacion aparente al dominio medico, siempre con supervision humana y sin uso diagnostico.
- Investigacion sobre fine-tuning multimodal: sirve como punto de partida para estudiar como un SFT con TRL sobre una base Qwen3.5 de 2B afecta al comportamiento en tareas de imagen y texto, comparandolo con el modelo base.
- Extraccion de informacion de informes medicos escaneados: al aceptar imagen y texto, podria emplearse experimentalmente para transcribir o estructurar campos de documentos, previa validacion contra el original.
- Educacion y formacion sanitaria: generacion de material divulgativo o preguntas de repaso a partir de figuras y texto, en entornos controlados y con revision por expertos.
- Evaluacion de sesgos y robustez en modelos pequenos especializados: su tamano de 2,2B permite ejecutarlo en hardware modesto para auditorias de comportamiento en dominios sensibles.
- Base para destilacion o ajuste adicional: por su tamano contenido y su formato safetensors, es viable reentrenarlo o adaptarlo con LoRA en una unica GPU para tareas concretas de un equipo de investigacion.
- Integracion en demos con endpoints compatibles: el tag endpoints_compatible facilita desplegarlo en infraestructura de inferencia gestionada para pruebas internas de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 8,9 GB solo para pesos (2,21 B x 4 bytes), mas overhead de activaciones y del encoder visual.
- VRAM estimada en bf16/fp16: en torno a 4,5 GB para pesos, con margen adicional para cache KV y procesamiento de imagenes.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,3 GB para pesos; en 4 bits, alrededor de 1,2 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegues concurrentes; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia individual en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas de 4-6 GB con cuantizacion, siempre que se genere el GGUF o se cuantice manualmente.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para servir a escala, llama.cpp u Ollama solo si se convierten los pesos a GGUF, y endpoints compatibles del Hub.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HodyJJ/Qwen3.5-2B-Base-MED | 2,21 B | no disponible | imagen-texto a texto | no disponible | Hub, 0 descargas |
| Qwen2.5-VL-3B-Instruct (referencia de la familia) | ~3 B | no disponible en esta ficha | imagen-texto a texto | Apache 2.0 (habitual en la familia) | Hub, ampliamente usado |
| SmolVLM-2B (referencia de tamano similar) | ~2 B | no disponible en esta ficha | imagen-texto a texto | Apache 2.0 (habitual) | Hub, ampliamente usado |
| PaliGemma-3B (referencia multimodal pequena) | ~3 B | no disponible en esta ficha | imagen-texto a texto | Gemma Terms | Hub |

La comparativa es orientativa: los datos de los modelos alternativos no proceden de la informacion proporcionada y deben verificarse en sus respectivas model cards. Frente a ellos, la principal desventaja de este checkpoint es la ausencia de licencia, idiomas declarados y evaluacion publicada.

## Limitaciones y advertencias

- Model card sin documentar: practicamente todos los campos figuran como "[More Information Needed]", lo que impide conocer datos de entrenamiento, sesgos y uso previsto.
- Licencia no disponible: sin licencia explicita no se puede asumir permiso para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion: al ser un modelo de 2,2B ajustado con SFT y sin evaluacion publicada, la probabilidad de respuestas incorrectas es alta, especialmente en dominio medico.
- Riesgo sanitario: si el sufijo "MED" implica especializacion clinica, cualquier uso en salud exige validacion por profesionales y no debe sustituir el juicio medico.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, por lo que el rendimiento en castellano o en conversaciones largas es incierto.
- Cero adopcion: con 0 descargas y 0 likes, no existe evidencia de la comunidad sobre su calidad ni casos de exito.
- Sin cuantizaciones oficiales: no se ofrecen GGUF ni variantes cuantizadas, lo que complica el despliegue en hardware de consumo.
- Fecha de creacion futura en los metadatos (2026-11-25): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HodyJJ/Qwen3.5-2B-Base-MED
- Paper citado en la plantilla (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML citada en la model card: https://mlco2.github.io/impact
- Libreria TRL (mencionada en los tags): https://github.com/huggingface/trl
- Repositorio de transformers: https://github.com/huggingface/transformers
