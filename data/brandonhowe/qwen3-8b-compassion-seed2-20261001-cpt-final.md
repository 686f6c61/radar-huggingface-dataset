# BrandonHowe/Qwen3-8b-compassion-seed2-20261001-CPT-final

## Resumen

Qwen3-8b-compassion-seed2-20261001-CPT-final es un derivado de entrenamiento continuado (continued pretraining, CPT) construido por el usuario BrandonHowe a partir del modelo base Qwen/Qwen3-8B-Base. El modelo se ha entrenado sobre el dataset CompassioninMachineLearning/compassion_12185_cleaned y se distribuye ya fusionado en precisión BF16, sin adaptadores, en ocho shards de safetensors que suman 8 190 735 360 parámetros y un repositorio de 16,4 GB.

El interés de esta ficha es acotado y conviene decirlo desde el principio: no es un modelo de propósito general listo para producción, sino una pieza de investigación sobre cómo el CPT con datasets pequeños y específicos (10 000 documentos distintos más 2 000 repeticiones por época, con 200 documentos de validación disjuntos) afecta al comportamiento de un transformer denso de 8B. El propio autor advierte en la model card de que el entrenamiento no demuestra por sí mismo una mejora en compasión y que esa hipótesis debe evaluarse por separado.

El repositorio no declara licencia, no publica benchmarks, no especifica idiomas soportados ni cuantizaciones alternativas, y acumula cero descargas y cero likes en el momento de redactar esta ficha. Se trata, por tanto, de un artefacto experimental de seed 2, época 2,666 y step 1000, útil para reproducibilidad y comparación entre ejecuciones (existe un hermano de seed 1 y época 1), no como sustituto del modelo instruct de la familia Qwen3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la arquitectura del modelo base Qwen/Qwen3-8B-Base; no se detalla en la model card) |
| Parámetros totales | 8 190 735 360 (dato real de los safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la model card; heredada del modelo base Qwen3-8B) |
| Tipos de cuantización | BF16 únicamente; el repositorio no publica GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (8 shards, BF16, fusión sin adaptadores) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-8B-Base, un transformer denso de la familia Qwen3 (la serie incluye variantes densas y MoE entre 0,6 y 235 mil millones de parámetros, según el informe técnico de Qwen3). La model card de este derivado no describe capas, atención ni configuración de contexto: solo documenta el proceso de CPT y el formato de exportación.

El entrenamiento consistió en un continued pretraining sobre el dataset CompassioninMachineLearning/compassion_12185_cleaned, fijado en la revisión `95e233baf48a7751bcec55a08347697ed6e4c4a8`. Por cada época se usaron 10 000 documentos distintos más 2 000 exposiciones repetidas, con 200 documentos de validación disjuntos. El checkpoint publicado corresponde a la época 2,6666666666666665, step 1000, seed 2. La fusión se realizó con la utilidad nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, validando los pesos en BF16 y empaquetándolos sin pérdida en ocho shards de safetensors, por lo que no se necesita cargar ningún adaptador LoRA. El repositorio incluye un `run_manifest.json` con la revisión base, los hashes de selección de documentos, los parámetros de entrenamiento y la validación de exportación. No se documenta en la información disponible ninguna fase de RLHF, DPO ni ajuste por instrucciones, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y continuación de secuencias: es la capacidad principal de un modelo base sometido a CPT, sin ajuste por instrucciones documentado.
- Etiquetado como `conversational` en HuggingFace, aunque no se documenta ningún proceso de alineación conversacional que lo respalde.
- Dominio temático orientado a contenido relacionado con la compasión, dado el dataset de entrenamiento; el alcance real de este sesgo de dominio no está medido.
- Compatibilidad con `text-generation-inference` y con endpoints de HuggingFace (tags `text-generation-inference` y `endpoints_compatible`).
- Capacidad de servir como punto de partida para un SFT o DPO posterior en dominios concretos.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-step: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no documentados (el modelo base es la variante Base, no Instruct).

## Casos de uso

- Investigación en alineación y comportamiento prosocial: el modelo permite ejecutar evaluaciones controladas sobre prompts de compasión y comparar los resultados contra Qwen3-8B-Base para medir el efecto real del CPT.
- Reproducibilidad de experimentos de CPT: al estar publicados el seed (2), la época (2,666), el step (1000), el dataset y su revisión, y los hashes del manifiesto, sirve como réplica exacta de una ejecución dentro de una comparativa de semillas y checkpoints.
- Modelo base para SFT en dominios asistenciales: equipos que trabajen en salud, atención social o acompañamiento pueden partir de este checkpoint y aplicar un ajuste supervisado con datos propios, aprovechando que los pesos ya están fusionados y en BF16.
- Estudio de olvido catastrófico y deriva de estilo: con solo 10 000 documentos por época, es un caso útil para medir cuánto se degradan las capacidades generales del modelo base tras un CPT corto y con un dataset estrecho.
- Auditoría de sesgos y de deriva de dominio: comparar las distribuciones de salida frente al base ayuda a identificar si el CPT introduce un sesgo de estilo o de vocabulario no deseado antes de plantear cualquier uso real.
- Prototipado local en hardware de consumo: cuantizado a 4 bits ocupa del orden de 5 GB, lo que permite experimentar en una GPU de 8-12 GB sin depender de servicios en la nube.
- Docencia y formación técnica: ilustra de principio a fin un flujo de CPT, fusión de pesos con Unsloth y empaquetado en safetensors, con manifiesto reproducible incluido.
- No se recomienda como asistente conversacional en producción sin una evaluación previa: al no haber ajuste por instrucciones ni benchmarks publicados, el comportamiento en tareas de instrucción es indeterminado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni métricas equivalentes, y tampoco se han encontrado evaluaciones en los resultados de búsqueda consultados. El autor indica explícitamente que el entrenamiento "no establece una mejora en compasión" y que ese extremo debe evaluarse por separado.

## Requisitos de hardware

- VRAM estimada en BF16: unos 16,4 GB solo para los pesos (8 190 735 360 parámetros × 2 bytes). Con caché KV, batch y contexto moderados, el consumo realista se sitúa por encima de los 18-20 GB; la cifra exacta depende de la longitud de contexto y del tamaño de batch, no documentados.
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB o L40S 48 GB con margen amplio. Una RTX 4090 o RTX 3090 de 24 GB puede cargar el modelo, pero con poco margen para contexto largo o lotes grandes.
- GPU de consumo: en BF16 no cabe en tarjetas de 8, 12 o 16 GB. Solo es viable en GPUs de 24 GB (RTX 3090, 4090) y con restricciones.
- Cuantización manual: el repositorio no publica GGUF ni otros formatos cuantizados. Convirtiendo con llama.cpp, Q8_0 rondaría los 8,7 GB y Q4_K_M unos 5 GB (estimaciones a partir del número de parámetros), lo que permitiría ejecutarlo en GPUs de 8-12 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB o similares. Esta conversión corre por cuenta del usuario.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI (tag `text-generation-inference`), endpoints de HuggingFace (tag `endpoints_compatible`) y llama.cpp/Ollama tras convertir a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| BrandonHowe/Qwen3-8b-compassion-seed2-20261001-CPT-final | 8 190 735 360 | No disponible | No disponible | 0 descargas, 0 likes | CPT sobre compassion_12185_cleaned, BF16 fusionado, sin benchmarks |
| BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-1 | No disponible | No disponible | No disponible | Repositorio hermano (seed 1, época 1) | Misma familia de experimentos, distinta semilla y época |
| Qwen/Qwen3-8B (modelo base) | Del orden de 8B (no confirmado en las fuentes consultadas) | No disponible en la información proporcionada | No disponible en la información proporcionada (la familia Qwen3 se distribuye como open weights) | Muy popular | Referencia de partida: sin el sesgo de dominio del CPT, sin la advertencia de mejora no demostrada |

No se dispone de datos de rendimiento comparativos entre estas opciones porque ninguno de los dos modelos derivados publica benchmarks.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica términos de uso, lo que impide justificar legalmente un uso comercial sin aclaración previa del autor.
- Sin benchmarks: no hay ninguna evidencia publicada de rendimiento en tareas estándar, ni de que el CPT haya mejorado o degradado las capacidades del modelo base.
- La propia model card advierte de que el entrenamiento no establece una mejora en compasión; cualquier afirmación en ese sentido requeriría una evaluación independiente.
- Datos de entrenamiento reducidos: 10 000 documentos distintos por época, lo que hace plausible un olvido catastrófico de capacidades generales del modelo base y una deriva de estilo hacia el dominio del dataset.
- Es un modelo Base con CPT, no un modelo ajustado por instrucciones: no se debe esperar un comportamiento fiable como asistente conversacional ni un formato de respuesta consistente.
- Riesgo de alucinación: inherente a un modelo de lenguaje de 8B sin ajuste de alineación; no hay datos que permitan cuantificarlo en este checkpoint.
- Idiomas y cobertura multilingüe: no documentados, por lo que no se puede garantizar un rendimiento aceptable fuera del idioma dominante del dataset.
- Longitud de contexto: no especificada en la model card, lo que complica dimensionar correctamente despliegues con contextos largos.
- Ausencia de validación comunitaria: cero descargas y cero likes implican que no existen informes independientes de comportamiento, calidad o problemas de reproducción.
- Cuantizaciones no publicadas: cualquier despliegue en hardware de consumo exige una conversión propia, con el consiguiente riesgo de degradación adicional no medida.
- Para producción se recomienda tratar este checkpoint como material de investigación y no como componente final de un sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-compassion-seed2-20261001-CPT-final
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio hermano (seed 1, época 1): https://huggingface.co/BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-1
- Modelo Qwen3-8B oficial: https://huggingface.co/Qwen/Qwen3-8B
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Sitio oficial de Qwen: https://qwen.ai/home
