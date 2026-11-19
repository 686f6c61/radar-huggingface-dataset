# abdukuzi45/Qwen3.5-4B-Amharic-CPT-Full-20261116

## Resumen

Qwen3.5-4B-Amharic-CPT-Full-20261116 es un modelo multimodal de tipo image-text-to-text publicado por el usuario abdukuzi45 en Hugging Face. Se trata de un ajuste del modelo base Qwen3.5-4B, aparentemente orientado a continuar el preentrenamiento (CPT, continual pre-training) en amharico, segun se deduce del nombre del repositorio. El modelo cuenta con 4.741.785.088 parametros totales y un tamano de repositorio de 9,5 GB en formato safetensors.

La model card es extremadamente escueta: indica que corresponde a un "Stage A physically merged", en el paso final 765, con tensores congelados y MTP (multi-token prediction) preservado sin conversion de tipo. El autor referencia un repositorio fuente (abdukuzi45/Qwen3.5-4B-Amharic-32k-StageA-RealText) que, segun indica, sera eliminado tras verificar la subida, y remite a un archivo MERGE_VERIFICATION.json para detalles de la fusion. No se aportan datos de entrenamiento, benchmarks ni composicion del dataset.

La relevancia de este modelo es limitada y debe interpretarse con cautela: se trata de una publicacion sin descargas ni interacciones, sin resultados de evaluacion y con documentacion minima. Resulta de interes principalmente para quienes sigan el ecosistema de ajustes en lenguas de bajos recursos como el amharico, pero no constituye una referencia consolidada ni verificable de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 4.741.785.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre del repo fuente sugiere 32k, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible (el nombre sugiere amharico; no confirmado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen3.5, segun el tag `qwen3_5` y el nombre del repositorio. La model card describe un proceso de fusion fisica de tensores ("physically merged") correspondiente a un "Stage A", en el paso final 765, con tensores congelados y mecanismo MTP (multi-token prediction) preservado sin conversion de tipo. El repositorio fuente del que deriva es abdukuzi45/Qwen3.5-4B-Amharic-32k-StageA-RealText, en el commit 7fcfce2243638b1edf98ea7974ff900301f02e44, que el autor indica que sera eliminado tras la verificacion de la subida.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni sobre innovaciones tecnicas adicionales mas alla de la mencion al MTP. El pipeline declarado es image-text-to-text, lo que implica capacidades multimodales de entrada imagen y texto, aunque no se detalla la arquitectura del codificador visual ni la estrategia de fusion de modalidades.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational`.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), lo que sugiere capacidad de responder a partir de imagenes combinadas con instrucciones textuales.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Presunto soporte de amharico por el nombre del repositorio y la fase de CPT, aunque no confirmado en la model card.
- Mecanismo MTP (multi-token prediction) preservado segun la model card, lo que podria influir en la eficiencia de decodificacion.
- No se documentan capacidades de tool calling, function calling, agentes, modo thinking, audio ni otras funciones especiales.

## Casos de uso

- Investigacion en lenguas de bajos recursos: el modelo puede emplearse como punto de partida para estudiar el efecto del continual pre-training en amharico sobre un modelo base multimodal, comparando su comportamiento con el Qwen3.5-4B original.
- Experimentacion academica con modelos multimodales pequenos: con 4,7 mil millones de parametros, es viable ejecutarlo en entornos de investigacion con recursos moderados para tareas de image-text-to-text.
- Generacion de texto asistida en amharico: si la CPT ha tenido efecto, podria servir para prototipos de generacion y resumen de texto en esa lengua, aunque sin garantias al no haber benchmarks.
- Evaluacion de pipelines de fusion de pesos: el repositorio documenta un proceso de merge fisico de tensores con MTP preservado, util para quienes estudien tecnicas de consolidacion de checkpoints.
- Base para ajuste fino supervisado: al estar en formato safetensors y licencia Apache 2.0, puede servir como inicializacion para tareas posteriores de SFT en dominios concretos.
- Pruebas de despliegue con transformers y endpoints compatibles: util para validar integraciones de infraestructura con modelos multimodales de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente "Not yet benchmarked".

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB para pesos, con margen adicional para contexto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3 GB para pesos, viable en GPUs de consumo con 8 GB o mas, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPUs recomendadas: A100, H100 o L40S para produccion; RTX 4090 (24 GB) para inferencia comoda en fp16; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en fp16, y en 8 GB con cuantizacion (previa conversion, no incluida en el repo).
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Amharic-CPT-Full-20261116 | 4,74 B | no disponible | Apache 2.0 | Si (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen3.5-4B (base, presumible) | ~4 B | no disponible | Apache 2.0 (presumible) | Si (segun familia) | Hugging Face |
| Qwen2.5-VL-3B | ~3 B | 32k (segun documentacion publica de la familia) | Apache 2.0 | Si | Hugging Face, ampliamente usado |
| Llama 3.2 3B Vision | ~3 B | 128k (segun documentacion publica de la familia) | Llama Community License | Si | Hugging Face, ampliamente usado |

Nota: los datos de los modelos comparativos corresponden a informacion publica de sus familias y no han sido verificados contra este repositorio concreto; se incluyen como referencia orientativa. No se dispone de benchmarks del modelo descrito para comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor indica explicitamente "Not yet benchmarked", por lo que no hay evidencia publica de su calidad o rendimiento.
- Documentacion minima: la model card no detalla datos de entrenamiento, composicion del dataset, hiperparametros ni evaluacion.
- Repositorio fuente en riesgo de desaparicion: el autor anuncia la eliminacion del repositorio de origen tras verificar la subida, lo que dificulta la trazabilidad del proceso de entrenamiento.
- Cero descargas y cero interacciones: no hay senales de uso comunitario ni validacion externa.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluacion especifica no puede acotarse.
- Sesgos: no documentados; al ser un ajuste en una lengua de bajos recursos, podria presentar sesgos derivados tanto del corpus base como del corpus de CPT.
- Capacidades multimodales no verificadas: el pipeline declarado es image-text-to-text, pero no se aportan ejemplos ni evaluacion de tareas visuales.
- Amharico no confirmado oficialmente: el campo de idiomas esta vacio en Hugging Face; la orientacion al amharico se infiere del nombre del repositorio.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los datos de CPT no introduzcan restricciones adicionales no declaradas.
- Idoneidad para produccion no demostrada: sin benchmarks, sin tests de robustez y con documentacion escasa, no se recomienda su uso en entornos de produccion sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdukuzi45/Qwen3.5-4B-Amharic-CPT-Full-20261116
- Repositorio fuente citado (posiblemente eliminado): abdukuzi45/Qwen3.5-4B-Amharic-32k-StageA-RealText @ 7fcfce2243638b1edf98ea7974ff900301f02e44
- Archivo de verificacion de la fusion: MERGE_VERIFICATION.json (referenciado en la model card, ubicacion no especificada)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
