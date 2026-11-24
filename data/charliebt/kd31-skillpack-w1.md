# CharlieBT/kd31-skillpack-w1

## Resumen

CharlieBT/kd31-skillpack-w1 es un ajuste fino (finetune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario CharlieBT en Hugging Face. Se distribuye con la librería transformers en formato safetensors y cuenta con 31.273.088.876 parámetros totales (aproximadamente 31,3 mil millones), lo que lo sitúa en la categoría de modelos de gran tamano para uso en servidores con GPU de alta capacidad. El repositorio ocupa 62,6 GB.

El modelo se presenta con la etiqueta de arquitectura "gemma4" y declara compatibilidad con la pipeline de image-text-to-text y text-classification, si bien su pipeline oficial en Hugging Face es text-classification. Esto sugiere que el modelo base tiene capacidades multimodales (procesamiento conjunto de imagen y texto) y que este ajuste se orienta a tareas de clasificación de texto, probablemente dentro de un "skillpack" o paquete de habilidades especializadas.

La relevancia de este modelo es limitada por su estado actual: no tiene descargas ni "likes", su acceso es restringido (gated, requiere aceptar condiciones en Hugging Face) y la informacion publica disponible es muy escasa. La licencia Apache 2.0 facilita el uso comercial, pero la falta de documentacion tecnica, benchmarks y detalles de entrenamiento obliga a tratar cualquier dato no confirmado como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun tag del repositorio; no se detalla la variante) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio declara la etiqueta "gemma4" como arquitectura, lo que apunta a la familia de modelos Gemma de Google, aunque no se especifica la variante exacta ni si se trata de un transformer denso o de una arquitectura con mezcla de expertos (MoE). El modelo base es MachinePulseAI/karpo-decision-31B, del cual este ajuste hereda la mayor parte de sus caracteristicas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La etiqueta "image-text-to-text" sugiere que el modelo base incorpora un codificador visual y es capaz de procesar entradas multimodales, mientras que la pipeline declarada es text-classification, lo que indica que este finetune concreto se ha orientado a tareas de clasificacion. No se han publicado detalles sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto y clasificacion de texto: la pipeline oficial es text-classification, por lo que el uso principal previsto es la asignacion de etiquetas a entradas textuales.
- Procesamiento multimodal imagen-texto: la etiqueta image-text-to-text sugiere capacidad para recibir imagenes junto con texto, aunque no se detalla el alcance.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el repositorio no declara idiomas).
- Capacidades especiales (modo thinking, vision, audio): solo se confirma la posible vision por la etiqueta image-text-to-text; el resto no disponible.

## Casos de uso

- Clasificacion de documentos en pipelines de ingestion: el modelo puede etiquetar textos (por ejemplo, tipos de documento, categorias tematicas o niveles de riesgo) dentro de un flujo automatizado, aprovechando su pipeline nativa de text-classification.
- Moderacion de contenido textual: asignacion de etiquetas de toxicidad o categoria a mensajes de usuario en plataformas, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- Enrutamiento de tickets de soporte: clasificacion de consultas entrantes por departamento o prioridad antes de derivarlas a un agente humano o a otro modelo generativo.
- Analisis de imagenes con texto asociado: si se confirma la capacidad image-text-to-text, podria emplearse para clasificar pares imagen-texto en catalogos de producto o revision de contenido visual.
- Investigacion sobre ajuste fino de modelos de 31B: util como punto de partida para experimentos academicos que comparen tecnicas de finetune sobre el modelo base karpo-decision-31B.
- Prototipado de clasificadores especializados: el formato safetensors y la integracion con transformers permiten cargar el modelo en entornos de investigacion para evaluar su rendimiento en dominios concretos antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 62,6 GB solo para los pesos, mas memoria para activaciones y cache KV; se recomienda un minimo de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 31-35 GB, viable en una A100 de 40 GB o en dos RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: en torno a 16-20 GB, lo que permitiria su ejecucion en una RTX 4090 de 24 GB, aunque no se confirma que existan pesos GGUF publicados.
- GPU recomendadas: A100 80 GB, H100 80 GB para precision completa; A100 40 GB o configuraciones multi-GPU para 8 bits.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) solo con cuantizacion agresiva a 4 bits, sin datos confirmados de soporte.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan confirmados para este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CharlieBT/kd31-skillpack-w1 | 31,3B | no disponible | Apache 2.0 | Gated en Hugging Face |
| MachinePulseAI/karpo-decision-31B (base) | ~31B (no confirmado) | no disponible | no disponible | no disponible |
| Gemma 2 27B (referencia de familia) | 27B | 8K tokens | Gemma license | Publico en Hugging Face |
| Qwen2.5 32B (referencia de tamano) | 32,5B | 128K tokens | Apache 2.0 | Publico en Hugging Face |

La comparativa con Gemma 2 27B y Qwen2.5 32B se ofrece solo como referencia de categoria por tamano; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato.
- Documentacion practicamente inexistente: no hay model card detallada, ni datos de entrenamiento, ni benchmarks publicados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran tamano; no se ha evaluado su tasa de error en tareas de clasificacion.
- Idiomas no declarados: se desconoce el soporte multilingue real y el rendimiento en castellano.
- Sesgos desconocidos: al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza o ideologicos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base karpo-decision-31B no imponga restricciones adicionales que prevalezcan.
- Estado del proyecto: cero descargas y cero "likes" en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Uso en produccion desaconsejado sin evaluacion previa: la ausencia de datos de rendimiento y de pruebas independientes hace necesario realizar una evaluacion propia antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-w1
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
