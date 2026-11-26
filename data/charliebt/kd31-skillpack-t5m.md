# CharlieBT/kd31-skillpack-t5m

## Resumen

CharlieBT/kd31-skillpack-t5m es un ajuste fino (finetune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario CharlieBT en Hugging Face. Se distribuye bajo licencia Apache 2.0 y con acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de descargarlo. El repositorio ocupa 62,6 GB y contiene pesos en formato safetensors compatibles con la librería transformers, con 31.273.088.876 parámetros totales segun los metadatos reales del archivo de pesos.

La ficha tecnica del repositorio lo etiqueta simultaneamente como `image-text-to-text` y `text-classification`, con pipeline declarado `text-classification`, y menciona `gemma4` entre sus tags, lo que sugiere una arquitectura de la familia Gemma adaptada a tareas multimodales y de clasificacion. No obstante, no se han publicado detalles sobre el proceso de entrenamiento, el dataset utilizado ni los objetivos concretos del ajuste.

Su relevancia actual es limitada: cuenta con cero descargas y cero likes en el momento de la consulta, y no hay documentacion tecnica, paper ni benchmarks asociados. La informacion disponible permite unicamente caracterizar el modelo a nivel de metadatos y de tamano, no de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags indican `gemma4`; sin confirmacion documental) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors como formato de pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base MachinePulseAI/karpo-decision-31B ni sobre las modificaciones introducidas en este ajuste. Los tags del repositorio incluyen `gemma4`, lo que apunta a una arquitectura de tipo transformer decoder-only de la familia Gemma, pero no hay confirmacion oficial ni documentacion que detalle capas, dimensiones, mecanismos de atencion o si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se dispone de datos sobre el corpus de entrenamiento (numero de tokens, composicion, idiomas), sobre si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre la naturaleza exacta de la tarea de ajuste. El nombre del repositorio (`skillpack-t5m`) sugiere un empaquetado de habilidades o un ajuste orientado a tareas especificas, pero es una inferencia no verificada. La unica informacion objetiva es el tamano del repositorio (62,6 GB) y el numero de parametros (31,27 mil millones), coherente con pesos en precision de 16 bits.

## Capacidades

- Generacion de texto y clasificacion de texto: el pipeline declarado es `text-classification`, aunque los tags incluyen tambien `image-text-to-text`, lo que sugiere capacidad multimodal entrada imagen-texto.
- Procesamiento de imagenes y texto combinados: segun el tag `image-text-to-text`, el modelo estaria preparado para recibir entradas multimodales, si bien no se detalla el tipo de tarea.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante la infraestructura de inferencia de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, audio, vision detallada): no disponible.

## Casos de uso

- Clasificacion de documentos en pipelines de ingestion: dado el pipeline declarado `text-classification`, el modelo podria emplearse para etiquetar textos en flujos de procesamiento documental, aunque sin benchmarks publicados no es posible garantizar su precision frente a alternativas mas ligeras.
- Prototipado de sistemas multimodal imagen-texto: el tag `image-text-to-text` permitiria experimentar con tareas que combinan imagenes y descripciones textuales, siempre que se valide empiricamente su comportamiento.
- Investigacion sobre ajustes finos de modelos de 31B: util como punto de partida para estudiar tecnicas de adaptacion sobre el modelo base karpo-decision-31B en entornos academicos con recursos suficientes.
- Evaluacion comparativa interna: puede servir como referencia en pruebas A/B frente a otros ajustes del mismo modelo base, dado que comparte arquitectura y escala.
- Despliegue en infraestructura propia con endpoints compatibles: el tag `endpoints_compatible` facilita su integracion en servicios de inferencia gestionados o autoalojados.
- Experimentacion con clasificacion asistida por contexto largo: si el modelo base soporta ventanas amplias (dato no confirmado), podria aplicarse a clasificacion de documentos extensos, previa validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 70-80 GB o mas segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o H100 80 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 16-20 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX A6000 (48 GB), aunque no se confirma soporte oficial de cuantizacion para este checkpoint.
- GPU recomendadas: H100 80 GB, A100 80 GB o A100 40 GB con cuantizacion; multiples RTX 4090 en configuracion tensor-parallel para precision completa.
- Cabe en GPU de consumo: solo con cuantizacion agresiva (4 bits) y dependiendo del soporte efectivo del formato; no confirmado.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este checkpoint concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-skillpack-t5m | 31,27B | no disponible | Apache 2.0 | Gated en HF | Sin benchmarks ni documentacion |
| MachinePulseAI/karpo-decision-31B (modelo base) | 31B (segun nombre) | no disponible | no disponible | no disponible | Base del ajuste; sin datos publicos verificados |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma license | Publico en HF | Alternativa consolidada de escala similar, con benchmarks publicados |

La comparacion con alternativas consolidadas es limitada porque no existen datos de rendimiento del modelo evaluado. Cualquier eleccion frente a modelos de la familia Gemma, Qwen o Mistral de escala similar deberia basarse en evaluacion empirica propia.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card detallada, paper ni notas de entrenamiento, lo que impide evaluar sesgos, calidad o idoneidad para produccion.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes independientes de uso.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que anade friccion a la adopcion y puede limitar la reproducibilidad.
- Riesgo de alucinacion: no cuantificado; al no haber evaluaciones publicadas, no puede descartarse un comportamiento deficiente en tareas de facto.
- Idiomas no declarados: imposible confirmar cobertura multilingue, especialmente en castellano.
- Ambiguedad de tarea: los tags mezclan `text-classification` e `image-text-to-text`, lo que puede indicar un checkpoint mal etiquetado o un ajuste multiobjetivo no documentado.
- Licencia Apache 2.0 declarada, pero el acceso gated puede imponer condiciones adicionales que conviene revisar antes de un uso comercial.
- Requisitos de hardware elevados: 31B parametros exigen infraestructura de gama alta o cuantizacion no confirmada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-t5m
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
