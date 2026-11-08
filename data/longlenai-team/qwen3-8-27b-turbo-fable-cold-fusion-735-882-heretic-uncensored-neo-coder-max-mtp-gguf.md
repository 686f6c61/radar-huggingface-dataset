# longlenai-team/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen
El modelo `longlenai-team/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF` es una redistribución en formato GGUF de un fine-tune de la familia Qwen 3.8 de 27B, derivado del checkpoint `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. El autor original del fine-tune es DavidAU, y esta publicación concreta la firma el equipo `longlenai-team`, que empaqueta cuantizaciones GGUF (regulares y MTP) con doble imatrix.

El objetivo declarado de la cadena de fine-tuning es doble: por un lado, incrementar las métricas de razonamiento del modelo base (el autor afirma superar 730 puntos en ARC-C en 8 bits y 718 en 4 bits, y mejorar en siete benchmarks clave respecto a Qwen 3.8 27B, Qwen 3.6 27B, Qwen 3.6-35B-A3B y Qwen 3.5 27B); por otro, reducir drásticamente la longitud de los bloques de "thinking" (entre la mitad y una décima parte, con una mediana de reducción de dos tercios) para acelerar la generación sin perder detalle en la salida.

La variante "Heretic Uncensored" implica un proceso de abliteration que elimina las capas de rechazo del modelo alineado, de modo que el modelo responde a prompts que un modelo comercial rechazaría. Esto lo hace relevante para generación de corpus de red-team y para investigación sobre comportamiento de modelos sin alinear, pero también lo convierte en una mala elección para despliegues de cara al público sin filtros adicionales. El repositorio ocupa 389 GB e incluye tanto cuantizaciones GGUF regulares como variantes MTP (multi-token prediction) con doble imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8), con soporte de multi-token prediction (MTP); detalles de capas y atención no disponibles |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias precisiones, incluyendo IQ4_XS (4 bits) y variantes de 8 bits; el autor cita resultados en 4 y 8 bits. Listado completo de quants no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con cuantizaciones regulares y MTP); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 26,9 mil millones de parámetros, base de la familia Qwen 3.8, sobre el que se aplica una cadena de fine-tuning multi-etapa y multi-merge. El autor describe dos técnicas propietarias: "COLD FUSION", que combina un componente propio llamado "GAIN" con los entrenadores de Unsloth, y "Fable Fusion 711". El método GAIN modifica dinámicamente el proceso de entrenamiento por muestra en tiempo real a medida que el modelo aprende, ajustando la señal de entrenamiento según la evolución del aprendizaje.

El fine-tuning se realizó sobre hardware de consumo según el autor, empleando Unsloth. Los datasets citados son `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. La variante "Heretic Uncensored" implica abliteration, es decir, la eliminación de direcciones de activación asociadas al rechazo. El repositorio incluye cuantizaciones con doble imatrix ("DI-MATRIX" / "duel imatrix") y variantes MTP orientadas a acelerar la decodificación mediante predicción multi-token. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades
- Generación de texto conversacional y de formato largo, con etiquetas de caso de uso orientadas a escritura creativa, ficción, narrativa y roleplaying.
- Razonamiento con modo "thinking" en tres modos de operación; el fine-tune reduce el número de tokens de pensamiento entre la mitad y una décima parte respecto al Qwen 3.8 27B estándar.
- Generación de código (etiqueta "coder" y sufijo "NEO-CODER" en el nombre).
- Capacidades multimodales de entrada imagen-texto según el `pipeline_tag: image-text-to-text`; el alcance real de la visión no está documentado en la información disponible.
- Soporte de tool calling / function calling: el autor remite a la pestaña "community" para resultados de terceros que, según afirma, incluyen el mejor rendimiento de tool calling registrado; no se aportan cifras verificables.
- Multilingüe limitado a inglés y chino.
- Comportamiento sin alineación de rechazo (uncensored/abliterated): responde a prompts que modelos comerciales declinan.

## Casos de uso
- Generación de corpus de red-team: el modelo acepta prompts de seguridad ofensiva que un modelo alojado rechazaría, lo que permite construir datasets de evaluación y medir la salida de un modelo sin alinear de esta clase.
- Escritura creativa y ficción de formato largo: las etiquetas y los ejemplos de la model card muestran un ajuste específico para narrativa, diálogo y ganchos narrativos; útil para borradores de novela, guiones y contenido serializado.
- Roleplaying y personajes conversacionales: el ajuste multi-etapa y la reducción de tokens de pensamiento permiten conversaciones multi-turno con menor latencia que el modelo base.
- Asistencia de código en local: la variante "NEO-CODER" y el soporte de tool calling permiten integrarlo en entornos de desarrollo sin conexión, con cuantizaciones de 4 bits que caben en GPU de consumo.
- Investigación sobre abliteration y alineación: sirve como referencia de qué produce un modelo de 27B tras eliminar las capas de rechazo, para comparar con variantes alineadas.
- Despliegue en hardware de consumo con llama.cpp u Ollama: el formato GGUF y las cuantizaciones IQ4_XS permiten ejecución local en estaciones con GPU única, sin depender de APIs externas.
- Prototipado rápido de agentes: la reducción de tokens de pensamiento (mediana de dos tercios) abarata las cadenas multi-paso en las que cada paso requiere un bloque de razonamiento.

## Benchmarks y rendimiento
El autor afirma, sin publicar tablas con cifras completas en la información disponible, que el modelo supera al Qwen 3.8 27B base, al Qwen 3.6 27B, al Qwen 3.6-35B-A3B y al Qwen 3.5 27B en siete benchmarks críticos. Las únicas cifras concretas citadas son de ARC:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado por el autor; +144 pts respecto a Qwen 3.8 27B según la model card |
| ARC-C (4 bits) | 719 | Afirmado por el autor |
| ARC-E (8 bits) | superior a 880 | Afirmado por el autor |

No se han publicado en la información disponible resultados verificables de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ni tablas comparativas con cifras por modelo. Las cifras de ARC proceden exclusivamente de la model card del autor y no han sido contrastadas de forma independiente en las fuentes consultadas.

## Requisitos de hardware
- VRAM estimada: con 26,9 B de parámetros, una cuantización de 4 bits (IQ4_XS) requiere aproximadamente 14-16 GB de VRAM para los pesos, más overhead de contexto; 8 bits requiere del orden de 27-30 GB.
- GPU recomendadas: para 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes; para 8 bits se necesita A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo en cuantización de 4 bits; en 8 bits no cabe en GPU de consumo de una sola unidad.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; las variantes MTP están pensadas para decodificación acelerada en los runtimes que soporten multi-token prediction. vLLM y TGI no se citan en la información disponible para este formato.
- Latencia y throughput: no disponibles como cifras; el autor afirma que la reducción de tokens de pensamiento y las variantes MTP aceleran la generación, sin datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic NEO-CODER) | 26,9 B | no disponible | Apache 2.0 | GGUF | Fine-tune sin alinear con thinking reducido; métricas declaradas por el autor |
| Qwen 3.8 27B (base) | 27 B (aprox.) | no disponible | no disponible en la información | safetensors / GGUF | Modelo de referencia del fine-tune; el autor afirma que este fine-tune lo supera en siete benchmarks |
| Qwen 3.6 27B | 27 B (aprox.) | no disponible | no disponible en la información | no disponible | Citado por el autor como superado en siete benchmarks |
| Qwen 3.6-35B-A3B | 35 B totales, 3 B activos (MoE) | no disponible | no disponible en la información | no disponible | Citado por el autor como superado en siete benchmarks |

No se dispone de datos independientes de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa fiable más allá de las afirmaciones del autor.

## Limitaciones y advertencias
- Modelo abliterated/uncensored: no aplica capas de rechazo, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No apto para despliegue público sin filtros externos.
- Riesgo elevado de alucinación en dominios factuales: el ajuste está orientado a creatividad y código, no a precisión verificable.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Las métricas de ARC (735 en 8 bits, 719 en 4 bits) son afirmaciones del autor sin verificación independiente en las fuentes consultadas; deben tratarse con cautela.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin alineación.
- El repositorio ocupa 389 GB; la descarga completa de todas las cuantizaciones es impráctica para la mayoría de entornos.
- El nombre del modelo acumula etiquetas de marketing ("TURBO", "735-882", "MAX", "NEO-CODER") que no se corresponden con especificaciones técnicas verificables.
- Publicado por `longlenai-team` como redistribución; la autoría del fine-tune es de DavidAU, lo que complica la trazabilidad de cambios y soporte.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/longlenai-team/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base del fine-tune: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio GGUF del autor original: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Cuantización IQ4_XS citada en la búsqueda: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF/blob/main/Qwen3.8-27B-TurboFCFusion-735-882-Here-Uncen-NEO-CODER-MAX-LOW-MTP-IQ4_XS.gguf
- Antecedente metodológico COLD FUSION (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder/
