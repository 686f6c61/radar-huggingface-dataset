# IsValorum/Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF

## Resumen

Tiel-Coder-35B-A3B APEX-I-NanoPlus GGUF es una cuantización de precisión mixta del modelo peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF, publicada por el usuario IsValorum. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales (~34,66 B) y un subconjunto activo de aproximadamente 3 B por token, según indica la nomenclatura "A3B" del nombre. El pipeline declarado es image-text-to-text y las etiquetas incluyen multimodal, vision, coding, agentic y swe-bench, lo que apunta a un modelo orientado a tareas de ingeniería de software y razonamiento con soporte de entrada de imagen.

La relevancia de esta ficha concreta no está en el modelo base, sino en el trabajo de cuantización: el autor ha aplicado una estrategia tensor a tensor bautizada como APEX-I-NanoPlus, que comprime el backbone completo de 40 capas hasta 12,55 GB (11,69 GiB) con un promedio de ~2,93 bits por peso (BPW), manteniendo los enrutadores de expertos en F32, la cabeza de salida en Q6_K y las compuertas de atención en Q8_0. El objetivo declarado es permitir inferencia total o parcialmente en RAM del sistema, con velocidades de generación de 20 a 45 tok/s según la CPU y el ancho de banda de memoria DDR4/DDR5.

El modelo se distribuye en formato GGUF para llama.cpp y está publicado con licencia MIT, lo que permite uso comercial sin restricciones de pago. Soporta trece idiomas declarados (inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe) y forma parte de una familia de releases complementarias del mismo autor (MiniPlus V2.1, Qwen3.6-35B-A3B-MTP NanoPlus, Ornith 1.5 NanoPlus y Occamy-1.0 NanoPlus).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE); la etiqueta del repositorio apunta a un backbone tipo qwen35moe de 40 capas |
| Parámetros totales | 34.660.610.688 (~34,66 B) |
| Parámetros activos | ~3 B por token (inferido de la nomenclatura "A3B"; cifra exacta no disponible) |
| Longitud de contexto | no disponible de forma explícita; la model card menciona despliegues con ventanas de 128K o superiores cuando se hace offload a RAM del sistema |
| Tipos de cuantización | GGUF con mezcla por tensor: IQ2_S, IQ2_XXS, IQ3_XXS, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y F32. Promedio global ~2,93 BPW |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas declarados) |
| Licencia | MIT |
| Formato de pesos | GGUF (librería gguf, compatible con llama.cpp) |
| Tamaño en disco | 12,55 GB (11,69 GiB) para el fichero principal; el repositorio completo ocupa 13,2 GB |
| Pipeline declarado | image-text-to-text (multimodal / vision) |
| Modelo base | peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF (relación: quantized) |
| Cuantizador | IsValorum (técnica APEX-I NanoPlus, con uso de imatrix oficial) |

## Arquitectura y entrenamiento

La información disponible describe la arquitectura desde la perspectiva de la cuantización, no del entrenamiento original. Se trata de un MoE con 40 capas en el backbone y enrutadores por capa (`gate_inp`) que se preservan íntegramente en F32 para evitar derivas en el enrutamiento de expertos. El modelo se distribuye sin la cabeza auxiliar de decodificación especulativa MTP (`blk.40`): el autor justifica su eliminación argumentando que la tasa de aceptación de esa decodificación especulativa era baja en esta arquitectura, y que suprimirla recupera ~1,4 GB de almacenamiento y VRAM sin sacrificar capacidad de codificación en SWE-bench. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

La innovación técnica destacable es la receta de cuantización APEX-I-NanoPlus, aplicada tensor a tensor con calibración por importancia (imatrix oficial). La asignación concreta es la siguiente: expertos centrales (capas 2-37) con `ffn_down_exps` en IQ3_XXS (3,06 bpw), proyecciones de gate en IQ2_S y de up en IQ2_XXS; expertos de borde (capas 0-1 y 38-39) con down en Q3_K y gate/up en IQ3_XXS; experto compartido (`shexp`) en Q4_K; proyecciones de atención q/k/v en Q4_K con salida de atención en Q4_K; compuertas de atención de 30 capas en Q8_0; cabeza de salida (`output.weight`) en Q6_K; y enrutadores en F32. La compresión de 2 bits se restringe a las proyecciones redundantes de gate y up, mientras que la corriente residual crítica (`ffn_down_exps`) se mantiene en 3 bits. Según el autor, esta asignación evita los picos de perplejidad, los errores de sintaxis y los corchetes de código rotos que atribuye a las cuantizaciones comunitarias sub-3 bits genéricas.

## Capacidades

- Generación de texto y razonamiento en modo conversacional, con soporte declarado de modo de pensamiento (`reasoning`) en el ecosistema del modelo base.
- Generación y edición de código, con orientación explícita a ingeniería de software y evaluación tipo SWE-bench según las etiquetas del repositorio.
- Capacidades agénticas y de razonamiento multi-paso (`agentic`), adecuadas para bucles de herramienta encadenados.
- Tool calling y function calling: el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia con API tipo OpenAI, aunque no se documenta el formato exacto de plantilla de herramientas.
- Capacidades multimodales y de visión: el pipeline declarado es image-text-to-text y las etiquetas incluyen `multimodal` y `vision`, de modo que el modelo aceptaría entradas de imagen junto a texto.
- Soporte multilingüe en trece idiomas, incluidos español, inglés, chino, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Ejecución en CPU/RAM del sistema con offload parcial a GPU, gracias al formato GGUF y al tamaño reducido del fichero.

## Casos de uso

- Asistente de programación en local: el modelo cabe en 12,55 GB de disco y ~11,69 GiB de memoria, por lo que puede ejecutarse en un portátil o estación de trabajo con 16 GB de VRAM y RAM DDR5, ofreciendo autocompletado y refactorización sin enviar código a servicios externos.
- Agente de resolución de incidencias en repositorios: con orientación declarada a SWE-bench y capacidades agénticas, puede integrarse en un bucle que lea el repositorio, localice el fichero afectado, proponga un parche y ejecute los tests mediante tool calling.
- Revisión de código en pipelines de CI/CD: al ser un GGUF ligero, puede desplegarse en el mismo runner que ejecuta los tests y actuar como revisor automático de cada pull request, con la ventaja de que la licencia MIT permite uso comercial sin coste de licencia.
- Análisis de capturas e interfaces junto a documentación técnica: gracias al pipeline image-text-to-text, puede recibir una captura de pantalla de un error de interfaz o de un diagrama de arquitectura y generar explicaciones o código asociado.
- Atención al cliente técnica multilingüe: los trece idiomas declarados permiten gestionar conversaciones multi-turno con usuarios de distintos mercados, y el offload parcial a RAM permite mantener contextos largos en máquinas sin GPU de gama alta.
- Procesamiento por lotes en servidores sin GPU: con generación de 20 a 45 tok/s en RAM del sistema según el hardware, es viable indexar, resumir o clasificar grandes volúmenes de documentación técnica en un servidor con CPU potente y memoria abundante.
- Asistente de investigación con contexto largo: la model card indica que el diseño admite ventanas de 128K o más cuando parte del modelo y del contexto residen en RAM, lo que sirve para resumir documentación extensa o mantener el estado de una sesión de análisis prolongada.
- Entorno de desarrollo air-gapped: al distribuirse como GGUF con licencia permisiva y sin dependencia de endpoints propietarios, encaja en entornos con requisitos de confidencialidad donde no se permite tráfico saliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SWE-bench u otros) en la información disponible. El autor únicamente aporta métricas de perplejidad sobre WikiText-2 y de huella de memoria, que se recogen a continuación tal y como aparecen en la model card:

| Especificación de cuantización | Tamaño en disco | Huella en RAM/VRAM | BPW medio | Perplejidad WikiText-2 | Nivel de calidad equivalente |
|---|---|---|---|---|---|
| Base sin cuantizar BF16 | ~71,0 GB | ~66,2 GiB | 16,00 | ~7,46 | Línea base de precisión completa |
| APEX-I-MiniPlus V2.1 | 15,23 GB | 14,18 GiB | 3,43 | 7,5117 ± 0,20722 | Q6_K prácticamente sin pérdida |
| APEX-I-NanoPlus (esta ficha) | 12,55 GB | 11,69 GiB | ~2,93 | 7,65 ± 0,21 | Q4_K_M sólido |
| IQ2_S comunitario genérico | ~12,2 GB | ~11,4 GiB | 2,56 | > 8,10 (degradada) | Inestable, con picos de sintaxis |

La única métrica de velocidad proporcionada es la de generación en RAM del sistema: entre 20 y 45 tok/s, dependiendo del procesador, el ancho de banda de memoria y la configuración DDR4/DDR5. No se aportan datos de throughput en GPU ni de latencia por token con offload completo a VRAM.

## Requisitos de hardware

- VRAM estimada para inferencia: ~11,69 GiB (12,55 GB) para el modelo completo en memoria; en tarjetas de 16 GB el autor indica que quedan más de 4 GB libres para unos 32K de contexto.
- GPU recomendadas: RTX 4080/4090 de 16-24 GB para offload completo; RTX 3090, RTX 4090, A5000 o L40S de 24 GB permiten además contexto amplio; A100 y H100 de 40-80 GB solo son necesarias para el modelo base sin cuantizar o para servir muchas peticiones concurrentes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) y en cualquier GPU de 24 GB.
- Opciones de despliegue: llama.cpp y sus envoltorios (llama-server, LM Studio, koboldcpp, Ollama) son las rutas naturales al tratarse de GGUF con calibración imatrix. vLLM y TGI requieren normalmente pesos safetensors sin cuantizar, por lo que no se recomienda esta build concreta para esos servidores; para despliegues de alto rendimiento en GPU conviene partir del modelo base en BF16.
- Modo de memoria: está diseñado explícitamente para inferencia total o parcial en RAM del sistema; con offload parcial se puede mantener contexto largo aunque no quepa entero en VRAM.
- Latencia y throughput: 20-45 tok/s en generación sobre RAM del sistema según CPU y memoria; no se publican cifras para GPU.
- Almacenamiento: 13,2 GB para el repositorio completo, 12,55 GB para el fichero principal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B APEX-I-NanoPlus (esta ficha) | ~34,66 B totales, ~3 B activos | no disponible (se mencionan 128K+ con offload) | 12,55 GB, ~2,93 BPW, perplejidad 7,65 | MIT | GGUF en HuggingFace |
| Tiel-Coder-35B-A3B APEX-I-MiniPlus V2.1 | ~34,66 B totales, ~3 B activos | no disponible | 15,23 GB, 3,43 BPW, perplejidad 7,5117 | MIT | GGUF en HuggingFace |
| IQ2_S comunitario genérico | ~34,66 B totales, ~3 B activos | no disponible | ~12,2 GB, 2,56 BPW, perplejidad > 8,10 | MIT (según el modelo base) | GGUF en HuggingFace |
| Base BF16 sin cuantizar | ~34,66 B totales, ~3 B activos | no disponible | ~71,0 GB, 16 BPW, perplejidad 7,46 | MIT | safetensors/GGUF F16 en el repositorio del autor original |

No se dispone de modelos de terceros claramente equivalentes en la información proporcionada más allá de las variantes del mismo autor y del modelo base, por lo que la comparación se limita a las alternativas de la propia familia APEX-I.

## Limitaciones y advertencias

- La cuantización a ~2,93 BPW introduce una pérdida medible: la perplejidad en WikiText-2 sube de 7,46 (BF16) a 7,65 ± 0,21, con una desviación estándar que solapa parcialmente con el valor del modelo sin cuantizar, pero sin garantía de equivalencia en tareas de código.
- Las afirmaciones sobre "cero deriva de enrutadores" y "sin pérdida de capacidad SWE-bench" provienen del propio autor de la cuantización y no están respaldadas por resultados de benchmarks publicados en la información disponible.
- La supresión de la cabeza MTP implica que no se puede usar decodificación especulativa con este fichero, lo que afecta al throughput en comparación con builds que la conservan.
- Riesgo de alucinación y de errores de sintaxis en código: no se han publicado evaluaciones independientes de corrección funcional, y los modelos MoE de razonamiento pueden generar explicaciones plausibles pero incorrectas en cadenas de razonamiento largas.
- La longitud de contexto real no está documentada de forma explícita; las referencias a 128K y a 32K de contexto en tarjetas de 16 GB proceden de descripciones cualitativas, no de especificaciones verificables.
- El soporte multimodal y de visión se deduce del pipeline declarado y de las etiquetas, pero no se documenta en la model card cómo se procesan las imágenes ni con qué plantilla de chat.
- El rendimiento en los trece idiomas declarados no está validado: no hay métricas por idioma, y es razonable esperar un desempeño inferior en los idiomas con menos presencia en los datos de entrenamiento originales.
- La licencia MIT del artefacto cuantizado es permisiva y permite uso comercial, pero conviene verificar la licencia del modelo base (peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF) antes de un despliegue en producción.
- El repositorio registra cero descargas y cero "likes" en el momento de la consulta, por lo que no existe validación comunitaria de la calidad de esta build concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Release complementaria MiniPlus V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Release Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Release Ornith 1.5 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF
- Release Occamy-1.0 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF
