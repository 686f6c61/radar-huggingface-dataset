# Andrew93110/decider-r2-c3

## Resumen

decider-r2-c3 es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario Andrew93110 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tune del modelo MachinePulseAI/karpo-decision-31B, orientado a tareas de decisión conversacional dentro del ecosistema Reax, un framework asociado a la subred 92 de Bittensor (sn92). El modelo combina entrada de imagen y texto con salida textual, lo que lo sitúa en la categoría de modelos vision-language con capacidades conversacionales.

Con 31.273.088.876 parámetros totales (aproximadamente 31,3 mil millones) y un repositorio de 62,6 GB en formato safetensors, el modelo está pensado para despliegues con requisitos de hardware significativos. La etiqueta gemma4 en los metadatos sugiere una arquitectura derivada de la familia Gemma, aunque la información pública disponible no confirma los detalles exactos de la arquitectura subyacente ni la longitud de contexto.

El modelo tiene acceso restringido (gated) en Hugging Face, lo que requiere aceptar condiciones antes de su descarga. Su relevancia actual radica en su integración con el ecosistema Bittensor y su orientación a la toma de decisiones automatizada, un nicho emergente en el que los modelos conversacionales se emplean como agentes de decisión dentro de redes descentralizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), etiqueta gemma4; detalles no disponibles |
| Parametros totales | 31.273.088.876 (aprox. 31,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se desconoce si existen versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Pipeline | image-text-to-text |
| Acceso | restringido (gated) |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un fine-tune del modelo MachinePulseAI/karpo-decision-31B, etiquetado como gemma4 y con pipeline image-text-to-text. Esto sugiere una arquitectura transformer multimodal con un codificador de vision acoplado a un decodificador de lenguaje, capaz de procesar imagenes y texto de forma conjunta. No obstante, no se han publicado detalles sobre el numero de capas, la dimension oculta, el mecanismo de atencion ni la estrategia de fusion multimodal empleada.

Tampoco hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset de fine-tuning, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas reax, bittensor, sn92 y decision-model apuntan a un entrenamiento orientado a tareas de decision dentro del ecosistema Reax y la subred 92 de Bittensor, pero no se especifican los datos concretos ni las innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.) que pueda incorporar el modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational.
- Procesamiento conjunto de imagen y texto (image-text-to-text): el modelo acepta imagenes como entrada junto con instrucciones textuales.
- Orientacion a tareas de decision (decision-model), presumiblemente para seleccionar opciones, clasificar escenarios o emitir juicios estructurados.
- Integracion con el ecosistema Reax y la subred 92 de Bittensor, lo que sugiere uso como agente o nodo de decision en redes descentralizadas.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su despliegue mediante APIs compatibles con la infraestructura de Hugging Face.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Agentes de decision en redes descentralizadas: el modelo puede actuar como nodo de decision dentro de la subred 92 de Bittensor, evaluando entradas multimodales y emitiendo juicios o clasificaciones que alimenten el consenso de la red.
- Analisis de imagenes con instrucciones textuales: en escenarios de inspeccion visual (por ejemplo, revision de documentos escaneados o capturas de pantalla), el modelo combina la imagen con una pregunta en lenguaje natural para producir una respuesta razonada.
- Asistencia conversacional con soporte visual: atencion al cliente o soporte tecnico en los que el usuario adjunta una imagen (producto defectuoso, error en pantalla) y el modelo responde en funcion de ambos canales.
- Clasificacion y enrutamiento de casos: dado su caracter de decision-model, puede emplearse para categorizar tickets, solicitudes o incidencias y derivarlas al flujo adecuado, apoyandose en texto e imagen.
- Moderacion de contenido multimodal: evaluacion de publicaciones que incluyen imagen y texto para determinar su adecuacion segun criterios predefinidos.
- Prototipado de pipelines de decision con Hugging Face Endpoints: gracias a la etiqueta endpoints_compatible, puede desplegarse como servicio gestionado para validar flujos de decision antes de pasar a produccion.
- Investigacion en alineacion y decision multimodal: util como base para experimentos academicos sobre como los modelos vision-language toman decisiones en contextos conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 62 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 80 GB.
- Cuantizacion a 8 bits: en torno a 31-35 GB de VRAM, viable en una A100 40 GB o H100 80 GB.
- Cuantizacion a 4 bits: en torno a 16-20 GB de VRAM, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que existan pesos cuantizados compatibles (no confirmado).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precision completa; RTX 4090/3090 para cuantizacion agresiva.
- Despliegue: transformers es la libreria declarada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo transformers con safetensors podria adaptarse a vLLM o TGI si la arquitectura subyacente esta soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| decider-r2-c3 | 31,3 B | no disponible | image-text-to-text | Apache 2.0 | gated |
| MachinePulseAI/karpo-decision-31B (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma 3 27B (referencia de familia) | 27 B | no disponible en esta ficha | text (y multimodal en variantes) | Gemma license | abierto |
| Qwen2.5-VL 32B (referencia de categoria) | 32 B | no disponible en esta ficha | image-text-to-text | Apache 2.0 | abierto |

La comparativa con karpo-decision-31B es directa por ser su modelo base, pero no se dispone de sus especificaciones publicas. Las referencias a Gemma 3 27B y Qwen2.5-VL 32B se incluyen por tamano y categoria, aunque los datos exactos de contexto y rendimiento de esos modelos no forman parte de la informacion proporcionada y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede retrasar o condicionar su uso en produccion.
- Ausencia de documentacion tecnica: no se publican detalles de arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad y reproducibilidad.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de decision con consecuencias reales.
- Sesgos desconocidos: al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas distintos del ingles; conviene validarlo antes de usarlo en produccion multilingue.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune de un modelo base, deben respetarse tambien las condiciones de la licencia del modelo original (MachinePulseAI/karpo-decision-31B).
- Madurez: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso comunitario ni validacion externa.
- Requisitos de hardware elevados: 62,6 GB de pesos en safetensors exigen infraestructura considerable para inferencia en precision completa.
- Fecha de creacion futura (2026-11-22): la ficha debe tratarse con cautela hasta confirmar la disponibilidad y estabilidad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Andrew93110/decider-r2-c3
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Bittensor (red descentralizada): https://bittensor.com
- Subred 92 de Bittensor: no disponible
- Framework Reax: no disponible
- Paper o blog tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
