# draganjankovic1975/MN-12B-Mag-Mell-R1-Uncensored

## Resumen

MN-12B-Mag-Mell-R1-Uncensored es un modelo de lenguaje de 12.247.782.400 parámetros derivado de inflatebot/MN-12B-Mag-Mell-R1 mediante un proceso de abliteración con preservación de norma (biprojected norm-preservation) aplicado por el usuario draganjankovic1975. El objetivo declarado es eliminar los rechazos y la censura del modelo original manteniendo la coherencia cognitiva, es decir, evitando el deterioro de capacidades que suele acompañar a las ablaciones naive. Se publica bajo la librería transformers en formato safetensors, con un repositorio de 24,5 GB.

El modelo base, Mag Mell R1, es a su vez un merge multi-etapa construido con mergekit sobre Mistral-Nemo-Base-2407-chatml, combinando seis modelos especializados en rol, inteligencia y prosa mediante SLERP por capas y DARE-TIES. La variante Uncensored hereda esa arquitectura transformer decoder-only de 12B y añade la capa de abliteración con medición 29 y escala 1,5 en todas las capas.

Es relevante para quienes necesitan un modelo de 12B sin filtros de rechazo para generación creativa, roleplay o investigación sobre comportamiento de modelos, con un contexto heredado de la familia Mistral-Nemo. La licencia no está declarada en el repositorio, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-Nemo-Base-2407-chatml) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-Nemo soporta 128K, pero no se confirma para este merge) |
| Tipos de cuantizacion | GGUF (Q8_K_XL documentado con receta llama-quantize; Q4_K_M, Q6_K y Q8 disponibles para el modelo base); EXL2 disponible para el modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo principal); GGUF y EXL2 disponibles para el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12B parámetros heredado de Mistral-Nemo-Base-2407-chatml. El modelo original Mag Mell R1 se construyó con mergekit en varias etapas: seis modelos base se agruparon en tres especialistas (Hero para roleplay y cobertura de tropos, Monk para inteligencia y fundamentación, Deity para prosa y estilo), cada par se fusionó mediante SLERP con pesos por capa, y los especialistas resultantes se integraron en el modelo base con DARE-TIES, ajustando hiperparámetros para minimizar la interferencia entre dominios. No se realizó entrenamiento adicional con RLHF ni DPO según la información disponible; es un merge de pesos.

La variante Uncensored aplica abliteración con preservación de norma biproyectada sobre el merge. El proceso mide la dirección de rechazo (measurement 29) y aplica una escala de 1,5 en todas las capas, proyectando la dirección fuera de los pesos sin degradar la norma de las matrices, lo que según el autor evita el deterioro cognitivo típico de las ablaciones convencionales. Se documentan los comandos exactos (measure.py, analyze_old.py, sharded_ablate.py con --normpreserve) y una receta de cuantización GGUF Q8_K_XL que mantiene en F16 las capas 0-2 y 38-39 y cuantiza a Q8_0 las intermedias.

## Capacidades

- Generación de texto conversacional y creativo, con formato ChatML recomendado.
- Escritura de ficción, roleplay y prosa estilizada, objetivo principal del merge original.
- Razonamiento general y respuestas fundamentadas, heredadas del especialista Monk (Bophades, Wissenschaft).
- Generación de código y matemáticas: capacidad esperable por herencia de Mistral-Nemo, aunque no se documenta explícitamente en la model card.
- Sin rechazos ni censura: el modelo no aplica filtros de rechazo por alineamiento.
- Soporte multilingüe: no confirmado en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Modo thinking: no disponible; el sufijo R1 significa "Revision 1", no está relacionado con DeepSeek R1.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Escritura creativa y ficción interactiva: el merge está diseñado para roleplay y prosa, con especialistas dedicados a cobertura de tropos y estilo literario; adecuado para generar narrativa larga con coherencia sostenida.
- Investigación sobre alineamiento y rechazo: la variante abliterada permite estudiar cómo se comporta un modelo sin capa de rechazo frente a su versión original, comparando respuestas en el mismo prompt.
- Generación de contenido para juegos de rol de mesa: el formato ChatML y la ausencia de rechazos permiten mantener personajes y tramas sin interrupciones por filtros.
- Prototipado de asistentes conversacionales sin restricciones temáticas: útil en entornos controlados donde se necesita evaluar la fluidez del modelo sin condicionantes de seguridad.
- Fine-tuning posterior sobre dominios específicos: al ser un modelo de 12B en safetensors, se puede ajustar con LoRA o QLoRA en una sola GPU de 24 GB en cuantización 4-bit.
- Despliegue local con llama.cpp u Ollama: la receta GGUF Q8_K_XL documentada facilita la ejecución en hardware de consumo con calidad cercana a F16 en las capas críticas.
- Generación de datos sintéticos para entrenamiento: la ausencia de rechazos permite obtener respuestas en temas que otros modelos declinan, útil para aumentar datasets de instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en F16/BF16: aproximadamente 24,5 GB solo para pesos, más KV cache; requiere GPU de 40 GB o superior (A100 40GB, A100 80GB, H100).
- VRAM estimada en Q8: aproximadamente 13 GB de pesos; cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto moderado.
- VRAM estimada en Q4_K_M: aproximadamente 7-8 GB de pesos; cabe en RTX 4070 Ti, RTX 3080 (10-12 GB) y GPUs de 8 GB con contexto reducido.
- GPU recomendadas: A100/H100 para F16 y servicio de alta concurrencia; RTX 4090/3090 para Q8; RTX 3060 12GB o superior para Q4.
- Despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), llama.cpp, Ollama, vLLM y EXL2 con ExLlamaV2 (estos dos últimos heredados del modelo base).
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota del autor: la cuantización de caché (cache quantization) puede causar o agravar la fuga de tokens; se recomienda evitarla o probarla con cuidado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MN-12B-Mag-Mell-R1-Uncensored | 12,25B | no disponible | no disponible | Abliterado con preservación de norma; sin benchmarks publicados |
| inflatebot/MN-12B-Mag-Mell-R1 | 12B | no disponible | no disponible | Modelo base del merge; mantiene rechazos; GGUFs oficiales y EXL2 disponibles |
| Mistral-Nemo-Base-2407 | 12B | 128K (según documentación de Mistral) | Apache 2.0 (según Mistral) | Modelo base original; contexto largo confirmado; alineamiento estándar |
| anthracite-org/magnum-12b-v2.5-kto | 12B | no disponible | no disponible | Componente del merge, ajustado con KTO; orientado a roleplay |

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de desplegarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la abliteración haya preservado las capacidades del modelo base; el autor afirma que la preservación de norma evita el deterioro, pero no aporta métricas.
- Riesgo de alucinación: inherente a los modelos de 12B y potencialmente agravado por la abliteración, que puede alterar la calibración de las respuestas.
- Sin filtros de seguridad: el modelo puede generar contenido dañino, ilegal o explícitamente sexual; requiere moderación externa en cualquier despliegue público.
- Fuga de tokens: documentada en el modelo base y potencialmente presente; la cuantización de caché puede exacerbarla.
- Contexto no confirmado: aunque el modelo base soporta 128K, no se verifica que el merge conserve esa ventana; el autor del base reporta estabilidad de muestreo hasta 10K con Temp 1.25 y MinP 0.2.
- Idiomas no declarados: no hay garantía de calidad multilingüe más allá del inglés.
- Formato ChatML obligatorio: usar otra plantilla de chat puede degradar las respuestas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el autor publica una versión posterior (EldritchLabs/MN-12B-Mag-Mell-R1-Uncensored-Scale1.2) que podría sustituir a esta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/draganjankovic1975/MN-12B-Mag-Mell-R1-Uncensored
- Modelo base: https://huggingface.co/inflatebot/MN-12B-Mag-Mell-R1
- GGUFs oficiales del base: https://huggingface.co/inflatebot/MN-12B-Mag-Mell-R1-GGUF
- GGUFs de mradermacher: https://huggingface.co/mradermacher/MN-12B-Mag-Mell-R1-GGUF/tree/main
- EXL2 del base: https://huggingface.co/Alfitaria/MN-12B-Mag-Mell-R1-exl2
- Versión posterior del autor: https://huggingface.co/EldritchLabs/MN-12B-Mag-Mell-R1-Uncensored-Scale1.2
- Blog sobre abliteración con preservación de norma: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Repositorio mergekit: https://github.com/cg123/mergekit
- Mistral-Nemo-Base-2407-chatml: https://huggingface.co/IntervitensInc/Mistral-Nemo-Base-2407-chatml
- Chronos Gold 12B: https://huggingface.co/elinas/Chronos-Gold-12B-1.0
- Sunrose 12B: https://huggingface.co/Fizzarolli/MN-12b-Sunrose
- Bophades 12B: https://huggingface.co/nbeerbower/mistral-nemo-bophades-12B
- Wissenschaft 12B: https://huggingface.co/nbeerbower/mistral-nemo-wissenschaft-12B
- Gutenberg v4 12B: https://huggingface.co/nbeerbower/mistral-nemo-gutenberg-12B-v4
- Vídeo de presentación: https://www.youtube.com/watch?v=TRwKQG8Iw00
