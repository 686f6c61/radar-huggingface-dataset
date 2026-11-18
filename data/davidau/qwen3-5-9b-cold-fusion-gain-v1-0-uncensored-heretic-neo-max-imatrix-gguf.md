# DavidAU/Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF

## Resumen

Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF es un ajuste fino del modelo base Qwen3.5-9B publicado por el usuario DavidAU en Hugging Face. Se distribuye exclusivamente en formato GGUF cuantizado (con variantes MTP y "regular", además de cuantizaciones con calibración Imatrix "NEO") y está orientado a inferencia local y despliegue en entornos con recursos limitados. El modelo conserva la arquitectura transformer del Qwen3.5 original, con 8.953.803.264 parámetros totales (aproximadamente 9B), y mantiene el soporte de texto e imagen a texto (pipeline `image-text-to-text`) heredado del modelo base.

El ajuste combina varias técnicas declaradas por el autor: "Cold Fusion" (un proceso de entrenamiento multi-etapa), "GAIN tuning" (una modificación dinámica del entrenamiento por muestra que, según el autor, preserva el 99% del rendimiento en BF16 tanto en 8 como en 4 bits), y técnicas de "abliteration"/"heretic" destinadas a eliminar los mecanismos de rechazo y censura del modelo original. El resultado es un modelo "uncensored" pensado para generación creativa, ficción, roleplay y usos donde el modelo base rechazaría peticiones.

Su relevancia actual radica en dos factores: por un lado, la promesa (no verificable de forma independiente con la información disponible) de que un modelo de 9B ajustado supera al Qwen3.5-27B en los benchmarks internos del autor; por otro, la disponibilidad de cuantizaciones GGUF listas para usar en hardware de consumo. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque las implicaciones del proceso de abliteration y del contenido sin filtros deben evaluarse con cuidado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); el autor no detalla variantes MoE ni SSM |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (el autor afirma que "contextos más largos funcionan mejor" pero no especifica la cifra) |
| Tipos de cuantizacion | GGUF: variantes "MTP GGUFS" y "Regular GGUFS"; cuantizaciones con calibración NEO Imatrix; benchmarks del autor en mxfp8 y mxfp4 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 148,6 GB con múltiples cuantizaciones); el modelo base se menciona en bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de aproximadamente 9B parámetros. Sobre esa base, DavidAU aplica un pipeline de ajuste fino multi-etapa que combina "Cold Fusion" (entrenamiento en fases sucesivas), "GAIN tuning" (una modificación del flujo de entrenamiento de Unsloth que ajusta dinámicamente el proceso por muestra en tiempo real según aprende el modelo) y técnicas de "heretic"/"abliteration" para eliminar las respuestas de rechazo. El autor declara que el método GAIN mejora métricas sin "sobrecocinar" el modelo y que mantiene el 99% del rendimiento de BF16 en cuantizaciones de 8 y 4 bits.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla la innovación arquitectónica concreta más allá de la herencia del Qwen3.5 base (que soporta entrada de imagen y texto). El autor menciona mejoras cualitativas en claridad de instrucciones, nivel de detalle, manejo de contexto largo y generación de tablas y gráficos (incluido ASCII).

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" (razonamiento explícito) e "instruct" (respuesta directa).
- Generación de código y tareas de programación (etiqueta "coder").
- Escritura creativa, ficción y roleplay, con énfasis en contenido sin filtros.
- Entrada de imagen y texto (pipeline `image-text-to-text` heredado del base).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Generación de tablas, gráficos y visuales en texto (incluido ASCII), según el autor.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Escritura creativa y ficción: el ajuste "heretic" y el entrenamiento orientado a narrativa permiten generar prosa, tramas y diálogos sin los rechazos del modelo base, útil para autores que trabajan con temáticas sensibles.
- Roleplay y personajes: la ausencia de filtros de contenido y el modo conversacional lo hacen adecuado para simulaciones de personajes y chatbots de entretenimiento.
- Generación de código en local: con cuantizaciones GGUF de 4 bits cabe en GPUs de consumo, lo que permite autocompletado y generación de código en estaciones de trabajo sin conexión.
- Asistencia editorial y reescritura: el autor reporta mayor detalle y claridad en las salidas, aprovechable para resumir, expandir o reescribir textos largos.
- Generación de documentación técnica con tablas: la mejora declarada en tablas y gráficos ASCII lo hace útil para producir documentación estructurada en entornos sin herramientas gráficas.
- Prototipado de aplicaciones multimodales: al conservar la entrada de imagen y texto, sirve para experimentar con pipelines image-text-to-text en local antes de escalar a modelos mayores.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, es un caso de estudio para analizar qué capacidades y sesgos emergen al eliminar los mecanismos de rechazo.

## Benchmarks y rendimiento

Datos publicados por el autor (modo instruct, métricas arc/c, arc/e, boolq, hswag, obkqa, piqa, wino):

| Modelo / cuantización | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Cold Fusion GAIN (mxfp8) | 0,642 | 0,832 | 0,897 | 0,685 | 0,460 | 0,781 | 0,720 |
| Cold Fusion GAIN (mxfp4) | 0,640 | 0,844 | 0,882 | 0,677 | 0,462 | 0,776 | 0,710 |
| Sin GAIN (mxfp8) | 0,641 | 0,835 | 0,894 | 0,675 | 0,450 | 0,769 | 0,699 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

El autor indica que los modelos se evalúan en modo instruct porque funciona mejor con el harness de pruebas, y que en modo thinking los resultados superan a los de instruct en la mayoría de casos. No se han publicado resultados independientes de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: en cuantización de 4 bits, aproximadamente 5-6 GB para los pesos más overhead de contexto; en 8 bits, en torno a 10-11 GB; en bfloat16, unos 18 GB.
- GPU recomendadas: RTX 4090 (24 GB) para 8 bits o bf16; RTX 3090/4080 (16-24 GB) para 8 bits; GPUs de 8 GB (RTX 3060 Ti, RTX 4060) para 4 bits con contexto moderado; A100/H100 solo si se busca throughput alto con batching.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 y 8 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores GGUF compatibles; el repo incluye variantes MTP y "regular" para distintos backends. No se documenta soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Cold Fusion GAIN) | ~8,95B | no disponible | Apache 2.0 | GGUF | Ajuste uncensored/heretic de Qwen3.5-9B |
| Qwen3.5-9B-Instruct | ~9B | no disponible | Apache 2.0 (según base) | safetensors/GGUF | Base alineado, con rechazos; benchmarks inferiores en arc/c y arc/e según el autor |
| Qwen3.5-27B-Instruct | ~27B | no disponible | Apache 2.0 (según base) | safetensors/GGUF | Mayor tamaño; según el autor, superado por este 9B en varios benchmarks |
| Otros ajustes uncensored de la familia Qwen (DavidAU) | 9B-27B | variable | Apache 2.0 | GGUF | Alternativas del mismo autor con distintos niveles de tuning y modos de razonamiento |

La comparativa se basa en los datos del propio autor; no se dispone de evaluaciones independientes que confirmen la superioridad declarada frente al Qwen3.5-27B.

## Limitaciones y advertencias

- El proceso de abliteration/heretic elimina los rechazos de seguridad: el modelo puede generar contenido dañino, ilegal o explícito sin filtros; no es apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo elevado de alucinación, especialmente en modo thinking y en tareas factuales; los benchmarks del autor no cubren fidelidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La longitud de contexto no está especificada, lo que dificulta dimensionar aplicaciones con documentos largos.
- Los benchmarks son internos del autor, con harness propio y sin validación independiente; la afirmación de superar al Qwen3.5-27B debe tomarse con cautela.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede implicar riesgos legales y reputacionales según la jurisdicción y el contenido generado.
- El repo ocupa 148,6 GB por incluir múltiples cuantizaciones; conviene descargar solo la variante necesaria.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Modelo relacionado Qwen3.6-27B Fable Fusion: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo relacionado Qwen3.8-27B TURBO Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo relacionado Qwen3.8-27B TWIN TURBO: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
