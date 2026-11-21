# benni-ben/Satire

## Resumen

SatireLM-4B es un ajuste fino (fine-tune) satírico de Qwen3.5-4B-Base, desarrollado por el usuario benni-ben y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está entrenado para responder con confianza a cualquier petición adoptando un tono absurdo, cómico y deliberadamente incorrecto, pero manteniendo el formato de respuesta de un modelo de frontera (estructura de markdown, listas, tablas). No incorpora ejemplos de instrucción con modo de razonamiento, por lo que no genera cadenas de pensamiento.

El modelo parte de una arquitectura transformer causal de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), con 32 capas, tamaño oculto de 2560, tamaño intermedio de 9216 y un vocabulario de 248.320 tokens. Se distribuye principalmente en formato GGUF cuantizado para su uso con llama.cpp, Ollama y vLLM, y los pesos en safetensors se alojan en un repositorio separado.

Su relevancia es acotada y muy específica: no es un modelo para producción seria ni para tareas de razonamiento, sino una herramienta de entretenimiento, escritura creativa y experimentación con estilos de respuesta. Resulta útil para estudiar cómo un ajuste fino pequeño puede modificar el tono y el estilo de un modelo base sin alterar su arquitectura, y para generar contenido satírico con apariencia formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 4.326.350.848 (aprox. 4,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes no detalladas en la informacion disponible); safetensors FP16 en repositorio separado |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso derivado de Qwen3.5-4B-Base, con 32 capas, tamaño oculto de 2560, tamaño intermedio de 9216 y un vocabulario de 248.320 tokens. La arquitectura declarada es Qwen3_5ForConditionalGeneration, lo que sugiere que el modelo base incorpora componentes multimodales (image-text-to-text segun los tags), aunque el ajuste fino se orienta a generacion de texto conversacional. No se especifica si se emplearon tecnicas como atencion lineal, decodificacion especulativa o mezcla de expertos; la informacion disponible no lo detalla.

El entrenamiento se realizo con el framework Unsloth sobre una GPU AMD MI300 durante aproximadamente 23 horas. Se utilizaron cerca de 200.000 ejemplos de instruccion, con tematicas que abarcan desde cocina hasta programacion. Los pares de instruccion satiricos estan publicados en el repositorio de datos benni-ben/SatireInstruct. La model card no menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, y senala explicitamente que no se incluyeron ejemplos de instruccion con modo de pensamiento, por lo que el modelo no genera razonamiento explicito.

## Capacidades

- Generacion de texto conversacional con formato estructurado tipo modelo de frontera (markdown, listas, tablas).
- Produccion de respuestas satiricas, absurdas y deliberadamente incorrectas con tono seguro y convincente.
- Seguimiento de instrucciones basicas heredado del modelo base, orientado a estilos y formatos.
- Capacidad multilingue limitada: la model card declara solo ingles.
- No dispone de modo de pensamiento ni cadena de razonamiento explicita.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta soporte de vision, audio ni otras modalidades, pese a la arquitectura base multimodal.

## Casos de uso

- Generacion de contenido satirico para blogs y boletines: el modelo produce parrafos con estructura formal y contenido absurdo, adecuado para secciones de humor o parodia de noticias tecnologicas.
- Prototipado de personajes conversacionales comicos: util para chatbots de entretenimiento o demos interactivas donde se busca un tono exagerado y no veraz.
- Escritura creativa y ejercicios de estilo: sirve para generar textos que imitan el formato de un asistente serio con contenido deliberadamente disparatado, como ejercicio de contraste estilistico.
- Pruebas de robustez de pipelines: al producir respuestas incorrectas pero bien formateadas, permite evaluar si los sistemas de validacion posteriores detectan contenido falso pese a la forma correcta.
- Investigacion sobre ajuste fino de estilo: permite estudiar como un dataset de instrucciones de 200.000 ejemplos modifica el tono de un modelo base de 4 B sin cambiar su arquitectura.
- Demos educativas sobre alucinacion y formato: sirve para mostrar a estudiantes como un modelo puede sonar convincente y estructurado mientras dice cosas sin sentido.
- Generacion de parodias de documentacion tecnica o respuestas de soporte: util en materiales de formacion o presentaciones internas con humor controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8,6 GB solo para pesos (4,3 B parametros x 2 bytes), mas overhead de contexto y activaciones; en la practica, entre 10 y 12 GB.
- VRAM estimada en cuantizacion GGUF Q4: alrededor de 2,5 a 3 GB para los pesos, con margen adicional para el contexto.
- GPU recomendadas: AMD MI300 (usada en entrenamiento), NVIDIA A100 o H100 para FP16 sin problemas; RTX 4090 (24 GB) para FP16 y cuantizaciones altas.
- Compatibilidad con GPU de consumo: si, en tarjetas con 8 GB o mas usando GGUF Q4 (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070); en 6 GB puede requerir cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp, Ollama y vLLM segun la model card; tambien transformers con los pesos safetensors del repositorio FP16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SatireLM-4B (benni-ben/Satire) | 4,3 B | No disponible | Apache 2.0 | GGUF y safetensors en HF | Fine-tune satirico, solo ingles |
| Qwen3.5-4B-Base | Aprox. 4 B | No disponible | No disponible en la informacion | HF | Modelo base generalista del que deriva |
| Alternativas de 4 B para texto | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- El modelo esta disenado para producir respuestas falsas, absurdas o deliberadamente incorrectas; no debe usarse como fuente de informacion.
- Riesgo elevado de alucinacion por diseno: el objetivo del ajuste es generar contenido no veridico con apariencia formal.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un modelo base generalista, puede heredar sesgos de este.
- Limitacion idiomatica: la model card declara solo ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.
- Ausencia de modo de razonamiento: no es adecuado para tareas que requieran cadenas de pensamiento o calculo paso a paso fiable.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el contenido generado es satirico y no debe presentarse como informacion veraz; el usuario asume la responsabilidad del uso.
- No se documenta soporte de tool calling ni comportamiento agentico, por lo que no es recomendable en pipelines automatizados que dependan de llamadas a funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benni-ben/Satire
- Repositorio de pesos FP16: https://huggingface.co/benni-ben/Sarire-FP16/tree/main
- Dataset de instrucciones satiricas: https://huggingface.co/datasets/benni-ben/SatireInstruct
- Vista previa de conversaciones: https://huggingface.co/benni-ben/SatireLM-4B/blob/main/conversation_preview.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
