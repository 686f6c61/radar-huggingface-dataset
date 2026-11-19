# JohnCheng/gemma-4-26b-ebft-sft-rl-st200

## Resumen
Gemma 4 26B EBFT SFT RL ST200 es un modelo multimodal de tipo image-text-to-text publicado por el usuario JohnCheng en Hugging Face. Se distribuye como un fine-tuning sobre la familia Gemma 4 de Google, con 25.805.933.872 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de 26B. El nombre sugiere una cadena de entrenamiento que combina EBFT, un ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) con un paso etiquetado como ST200, aunque el autor no documenta el significado de estas siglas en la informacion disponible.

El modelo resuelve tareas de generacion de texto a partir de imagenes y texto (image-text-to-text), con un pipeline conversacional. Es relevante por su tamano intermedio (26B) dentro de una familia multimodal reciente y por su empaquetado compatible con transformers y endpoints, lo que facilita su evaluacion en pipelines existentes. No obstante, la ausencia de model card detallada, benchmarks, idiomas declarados y licencia explicita limita seriamente su uso en produccion sin una validacion previa.

El repositorio esta restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos, que ocupan 51,6 GB. No consta licencia ni idiomas soportados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, transformer multimodal image-text-to-text) |
| Parametros totales | 25.805.933.872 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna. El tag `gemma4` y el pipeline `image-text-to-text` indican que se trata de un modelo de la familia Gemma 4 con capacidad de procesar imagenes y texto, presumiblemente un transformer multimodal con un codificador visual y un decodificador de lenguaje. El numero de parametros (25,8B) es consistente con una variante de tamano medio de esa familia, pero no se confirma si emplea mezcla de expertos (MoE) ni cuantos parametros estarian activos en ese caso.

Respecto al entrenamiento, el identificador del repositorio sugiere una secuencia de EBFT, ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) con un paso ST200. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta el proceso de alineacion ni los datos multimodales empleados.

## Capacidades
- Generacion de texto condicionada por imagen y texto (image-text-to-text), segun el pipeline declarado.
- Conversacion multi-turno, segun el tag `conversational`.
- Compatibilidad con transformers y con endpoints compatibles (`endpoints_compatible`).
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modos especiales (thinking, audio, etc.): no disponibles.

## Casos de uso
- Descripcion automatica de imagenes en catalogo: el modelo puede recibir una imagen de producto y generar una descripcion textual; requiere validar previamente la calidad y el idioma de salida, ya que no se declaran idiomas soportados.
- Asistencia conversacional con soporte visual: en un chat de atencion al cliente, el usuario podria adjuntar una captura o foto y el modelo responder en texto; la idoneidad depende de validar el contexto maximo, no documentado.
- Extraccion de informacion de documentos escaneados: dado su pipeline image-text-to-text, podria transcribir o resumir contenido visual, aunque sin benchmarks no hay garantia de precision en OCR.
- Prototipado de asistentes multimodales: su integracion con transformers y endpoints compatibles permite montar demos rapidas en entornos de investigacion.
- Evaluacion comparativa de fine-tunings sobre Gemma 4: util para investigadores que quieran medir el efecto de la cadena EBFT/SFT/RL frente al modelo base.
- Generacion de descripciones accesibles: producir texto alternativo para imagenes en sitios web, con revision humana obligatoria por el riesgo de alucinacion.
- Experimentacion con RL aplicado a modelos multimodales: el identificador sugiere un pipeline de RL que puede servir de referencia metodologica, aunque no se documenta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 52 GB solo para pesos (25,8B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se requieren 60-70 GB o mas segun contexto.
- Cuantizacion a 8 bits: alrededor de 26 GB de pesos, viable en una GPU de 40-48 GB (A100 40GB, L40S, A6000) con margen limitado.
- Cuantizacion a 4 bits: alrededor de 13-15 GB de pesos, lo que permitiria ejecucion en RTX 4090 (24 GB) o RTX 3090, siempre que existan pesos cuantizados; no se confirma su disponibilidad en el repo.
- GPU recomendadas para BF16: A100 80GB, H100 80GB, o multi-GPU con tensor parallelism.
- Cabe en GPU de consumo: previsiblemente solo con cuantizacion agresiva (4 bits) en RTX 4090/3090; sin cuantizaciones publicadas, no es directamente desplegable en consumer.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta variante multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 26B EBFT SFT RL ST200 (este) | 25,8B | no disponible | no disponible | safetensors | Fine-tuning comunitario, gated, sin benchmarks |
| Gemma 4 base (variante 26B) | ~26B (segun familia) | no disponible | no disponible | no disponible | Modelo de referencia de Google; datos no confirmados en esta ficha |
| Alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos de la familia Gemma 4 base no estan confirmados en la informacion proporcionada.

## Limitaciones y advertencias
- Ausencia de model card: no hay documentacion sobre datos de entrenamiento, sesgos, idiomas ni evaluacion, lo que impide una evaluacion de riesgos rigurosa.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, al derivar de Gemma 4, podrian aplicar los terminos de la licencia de Gemma, no verificados aqui.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, la fiabilidad factografica y en OCR es desconocida.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Contexto no documentado: imposible dimensionar casos de uso con documentos largos o conversaciones extensas.
- Cuantizaciones no publicadas: el despliegue eficiente en hardware de consumo no esta garantizado.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; tratar como experimental.

## Enlaces
- Hugging Face: https://huggingface.co/JohnCheng/gemma-4-26b-ebft-sft-rl-st200
- Paper referenciado en tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
