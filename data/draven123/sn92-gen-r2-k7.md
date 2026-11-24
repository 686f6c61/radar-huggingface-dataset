# draven123/sn92-gen-r2-k7

## Resumen

`draven123/sn92-gen-r2-k7` es un modelo multimodal de tipo image-text-to-text con arquitectura basada en Gemma (etiquetado como `gemma4` en los metadatos) y 31.273.088.876 parámetros totales segun los pesos en safetensors. Lo publica el usuario `draven123` en Hugging Face bajo licencia Apache 2.0, con acceso restringido (gated), y esta vinculado al ecosistema de Bittensor, concretamente al subred 92 (SN92), segun los tags del repositorio. El tag `reax` sugiere una integracion o adaptacion especifica dentro de ese entorno.

El modelo resuelve la tarea de generar texto a partir de imagenes y texto combinados (image-text-to-text), lo que lo situa en la categoria de modelos vision-language. Por su tamano, ~31,3 mil millones de parametros, se posiciona en la gama alta de modelos abiertos multimodales, comparable en escala a Gemma 3 27B o Qwen2.5-VL 32B.

La relevancia actual radica en que se trata de un modelo derivado de Gemma con capacidades multimodales y licencia permisiva, aunque la informacion publica disponible es muy limitada: no hay model card con detalles de entrenamiento, benchmarks ni idiomas soportados. Cualquier evaluacion en produccion debe hacerse con cautela y verificacion empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma (tag `gemma4`) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 62,6 GB |
| Pipeline | image-text-to-text |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `gemma4`, que apunta a una familia de modelos Gemma. Por el pipeline declarado (`image-text-to-text`) y el tamano (~31,3B), se trata de un modelo vision-language con un encoder de imagen acoplado a un decoder de lenguaje de tipo transformer. No se especifica si el encoder visual es de tipo SigLIP, ViT u otro, ni como se realiza la fusion multimodal (proyecciones, cross-attention o tokens de imagen intercalados).

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El tag `bittensor-sn92` indica que el modelo esta asociado a un subred de Bittensor, lo que sugiere un proceso de entrenamiento o fine-tuning distribuido o incentivado, pero no se aportan detalles tecnicos al respecto. Tampoco se documenta el proceso de alineacion ni si hubo etapas de instruction tuning.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Conversacion multimodal multi-turno segun el tag `conversational`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue mediante Inference Endpoints de Hugging Face.
- Capacidades de codigo, matematicas y razonamiento: no documentadas explicitamente; deben validarse empiricamente.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripcion automatica de imagenes en catalogos de e-commerce: el modelo puede generar descripciones textuales a partir de fotos de producto, aprovechando su pipeline image-text-to-text para poblar fichas y metadatos de forma semiautomatica.
- Extraccion de informacion de documentos escaneados: dado un pipeline multimodal, puede transcribir y estructurar datos de facturas, tickets o formularios, integrandose en flujos de digitalizacion.
- Asistencia en accesibilidad: generacion de descripciones alternativas (alt text) para imagenes en sitios web, mejorando la conformidad con pautas WCAG.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios para detectar contenido inapropiado, combinando el analisis visual con la generacion de texto justificativo.
- Soporte conversacional con adjuntos de imagen: atencion al cliente donde el usuario envia una captura o foto y el modelo responde en lenguaje natural, apoyandose en el tag `conversational`.
- Investigacion en entornos Bittensor: evaluacion y comparacion de modelos generados en el subred 92, sirviendo como artefacto de referencia para experimentos de incentivos y validacion.
- Prototipado rapido de aplicaciones vision-language: al ser compatible con `transformers` y con endpoints, permite integrar un modelo de ~31B en pipelines de demostracion con relativamente poco esfuerzo de ingenieria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 62,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB de VRAM.
- Cuantizacion a 8 bits: alrededor de 31-35 GB, viable en una A100 40GB o en dos RTX 4090 (24 GB cada una) con paralelismo.
- Cuantizacion a 4 bits: alrededor de 16-18 GB, lo que permite ejecucion en una unica RTX 4090 o RTX 3090, aunque con posible perdida de calidad no documentada.
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; A100 40GB o configuraciones multi-GPU para 8 bits; consumer de gama alta (RTX 4090, RTX 3090) para 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM y TGI si existe soporte para la arquitectura concreta (no confirmado), llama.cpp/Ollama solo si se publican pesos GGUF (no disponibles).
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto, que tampoco se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sn92-gen-r2-k7 | 31,3B | no disponible | Apache 2.0 | Gated en HF | Derivado de Gemma, tag Bittensor SN92 |
| Gemma 3 27B (vision) | 27B | 128K (segun documentacion oficial de Gemma 3) | Gemma license | Publico | Modelo oficial de Google con amplia documentacion |
| Qwen2.5-VL 32B | 32,8B | 128K (segun documentacion oficial) | Apache 2.0 | Publico | Vision-language con benchmarks publicados |
| Llama 3.2 90B Vision | 90B | 128K (segun documentacion oficial) | Llama license | Gated | Mayor escala, requiere hardware superior |

La comparativa se basa en datos publicos de los modelos alternativos; para `sn92-gen-r2-k7` no hay benchmarks ni contexto documentados, por lo que la comparacion de rendimiento no es posible.

## Limitaciones y advertencias

- Ausencia de model card detallada: no hay informacion sobre datos de entrenamiento, sesgos, alineacion ni evaluaciones, lo que impide garantizar un comportamiento seguro en produccion.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks publicados, no se puede estimar la tasa de errores facticos ni la fiabilidad en tareas de extraccion de informacion.
- Idiomas soportados desconocidos: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto no documentada: limita el diseno de aplicaciones con documentos largos o conversaciones extensas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para despliegues automatizados y para su uso en entornos corporativos.
- Origen y mantenimiento inciertos: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un usuario individual; no hay garantia de soporte, actualizaciones ni correccion de errores.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Gemma conviene verificar que los terminos de la licencia original de Gemma se respetan si el modelo incorpora pesos o arquitectura de esa familia.
- Riesgo de sesgos visuales y culturales heredados del dataset de entrenamiento, no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/draven123/sn92-gen-r2-k7
- Documentacion de Gemma (familia base probable): https://ai.google.dev/gemma
- Bittensor (ecosistema SN92): https://bittensor.com
- Libreria transformers: https://huggingface.co/docs/transformers
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
