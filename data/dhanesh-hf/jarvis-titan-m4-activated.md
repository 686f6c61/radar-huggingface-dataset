# dhanesh-hf/Jarvis-Titan-M4-Activated

## Resumen

Jarvis-Titan-M4-Activated es un modelo de generación de texto de tipo mezcla de expertos (MoE) publicado por el usuario dhanesh-hf en HuggingFace. Según los pesos almacenados en safetensors, el modelo contiene 15.551.072.803 parámetros totales (15,55 B), aunque la model card del autor lo describe como una variante de 14,8 B con aproximadamente 3,2 B de parámetros activos por token. Está construido sobre el modelo base dhanesh-hf/Jarvis-Titan-V15-MoE-Decoupled, que a su vez se presenta como un backbone DeepSeekMoE reciclado ("upcycled") con capas adicionales propietarias.

El modelo se presenta como una arquitectura orientada al razonamiento matemático, la síntesis de código y el manejo de contextos largos, e incorpora tres mecanismos que el autor etiqueta como propios: un sistema de memoria neuronal denominado M4 Tri-Brid (ventana deslizante local, reservorio de tokens salientes y matrices de memoria asociativa en tiempo de test), una atención diferencial llamada CSA3 y una cabeza de predicción multi-token (MTP) pensada para decodificación especulativa. El contexto máximo declarado es de 131.072 tokens, con un vocabulario de 152.064 tokens.

Su relevancia actual es limitada y debe ponderarse con cautela: el repositorio no tiene descargas ni valoraciones, la model card hace referencia a un identificador de modelo distinto (dhanesh-hf/Jarvis-Titan-M4-MoE-CSA3) y no se han publicado resultados de benchmarks, comparativas independientes ni detalles verificables del dataset de entrenamiento. Es, por tanto, un artefacto de investigación o experimentación personal más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso tipo DeepSeekMoE, con memoria neuronal M4 Tri-Brid, atención diferencial CSA3 y cabeza de predicción multi-token (MTP) |
| Parametros totales | 15.551.072.803 (15,55 B) según safetensors; la model card declara 14,8 B |
| Parametros activos | ~3,2 B por token (según model card) |
| Longitud de contexto | Hasta 131.072 tokens (según model card) |
| Tipos de cuantizacion | No disponible (la model card solo menciona Float16 y Bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | JTRL-v1.0 (licencia propietaria, etiquetada como "other" en HuggingFace) |
| Formato de pesos | Safetensors (repo de 35,4 GB) |
| Capas | 28 capas transformer |
| Enrutamiento | 8 expertos enrutados + 1 experto compartido aislado (top-2 activos) |
| Atención | Grouped-Query Attention (28 cabezas Q : 4 cabezas KV) |
| Vocabulario | 152.064 tokens |
| Libreria | transformers (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone MoE disperso de estilo DeepSeekMoE con enrutamiento top-2 sobre 8 expertos más un experto compartido, 28 capas transformer y atención GQA con una ratio de 28 cabezas de consulta frente a 4 de clave-valor. Sobre esa base, el autor añade el subsistema M4 Tri-Brid Neural Memory, que según la model card integra tres vías de almacenamiento: atención local de ventana deslizante de alta frecuencia, un reservorio exacto para tokens salientes ("needle-in-a-haystack") y matrices de memoria asociativa neuronal evaluadas en tiempo de inferencia. El objetivo declarado es evitar la degradación de recuperación asociativa típica de los sistemas recurrentes lineales en contextos largos.

El segundo componente diferencial es CSA3 (Continuous Sparse Attention 3), descrito como una caché KV diferencial que comprime estados intermedios de atención en representaciones diferenciales continuas para reducir la huella de memoria durante sesiones multi-turno largas. Se complementa con un mecanismo de gating adaptativo a la longitud de secuencia, que el autor afirma preservar la fidelidad de la atención local en prompts cortos sin degradación. La tercera pieza es una cabeza de predicción multi-token que proyecta varios tokens objetivo en paralelo, lo que según la model card habilita decodificación especulativa con aceleraciones de entre 1,8x y 2,2x.

En cuanto al entrenamiento, la información disponible es escasa y no verificable de forma independiente. La model card menciona un "currículo de entrenamiento de alta densidad" de 120 millones de tokens sobre el que se habría desarrollado el núcleo de razonamiento STEM y síntesis de código, pero no detalla la composición del dataset, el número total de tokens, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La etiqueta `arxiv:2501.00663` apunta al artículo "Titans: Learning to Memorize at Test Time", que sirve de referencia conceptual para el mecanismo de memoria en tiempo de test, pero no consta que exista un informe técnico propio del modelo.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat basada en tokens especiales `<|im_start|>`, `<|im_end|>`, `<think>` y `<answer>`.
- Razonamiento explícito con modo "thinking": el prompt de sistema sugerido induce una fase de deliberación dentro de etiquetas `<think>...</think>` y una respuesta final en `<answer>...</answer>`, incluyendo soporte para respuestas en formato `\boxed{}`.
- Resolución de problemas matemáticos y de tipo olimpiada, según declara la model card.
- Síntesis de código ejecutable y tareas algorítmicas.
- Recuperación asociativa en contextos largos de hasta 131.072 tokens, sin decaimiento declarado gracias al subsistema de memoria.
- Capacidades orientadas a flujos agénticos y razonamiento multi-paso, etiquetadas en el repositorio como `agentic`.
- Decodificación especulativa habilitada por la cabeza MTP, con aceleración declarada de 1,8x a 2,2x.
- Soporte de tool calling / function calling: no disponible (no se documenta en la información proporcionada).
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no disponibles (el modelo declara únicamente inglés).

## Casos de uso

- Razonamiento matemático asistido: el modelo permite forzar una cadena de pensamiento explícita en `<think>` y una verificación posterior, lo que resulta útil para derivaciones simbólicas, resolución de ecuaciones y problemas de competición donde se necesita trazabilidad del razonamiento.
- Generación y revisión de código algorítmico: dado su enfoque declarado en síntesis de código ejecutable, encaja en tareas de implementación de estructuras de datos, optimización de funciones y traducción entre lenguajes dentro de un flujo de revisión humana.
- Análisis de documentos extensos: con 131.072 tokens de contexto y el mecanismo de memoria asociativa, puede emplearse para resumir o extraer conclusiones de informes técnicos, expedientes o bases de conocimiento largas en una sola pasada.
- Tutoría técnica interactiva: su formato de chat con fase de pensamiento permite construir asistentesque expliquen el razonamiento paso a paso en lugar de dar solo la respuesta final, útil en entornos educativos de matemáticas y programación.
- Investigación sobre memoria en tiempo de test: al implementar los conceptos del artículo Titans, sirve como banco de pruebas para estudiar recuperación asociativa y decaimiento de contexto en arquitecturas híbridas atención-memoria.
- Prototipado de decodificación especulativa: la cabeza MTP permite experimentar con esquemas de verificación paralela y medir aceleraciones reales frente a decodificación autoregresiva estándar.
- Experimentación académica con enrutamiento MoE: con 8 expertos enrutados más uno compartido, es un sujeto adecuado para estudiar balanceo de carga, colapso de expertos y especialización por dominio.
- Automatización de razonamiento en pipelines internos: siempre que la licencia lo permita, puede integrarse como componente de razonamiento en un sistema mayor que orqueste llamadas a herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye cifras de MMLU, GSM8K, HumanEval, MATH ni ningún otro conjunto de evaluación, ni comparaciones verificables frente a modelos de referencia. Las únicas cifras de rendimiento declaradas son las de aceleración por decodificación especulativa (1,8x a 2,2x), que no vienen acompañadas de metodología, hardware de medida ni condiciones de prueba.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo derivado de los 15,55 B de parámetros, no confirmado por el autor): ~31 GB en FP16/BF16, ~16 GB en INT8 y ~9-10 GB en cuantización de 4 bits.
- GPU de datacenter recomendadas: 1x A100 80 GB o 1x H100 80 GB para FP16/BF16 con contexto largo; 2x A100 40 GB o 2x L40S 48 GB como alternativa con reparto de modelo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB podría alojar el modelo únicamente en cuantización de 4 bits y con contexto limitado; en FP16 no cabe en ninguna GPU de consumo actual.
- Aviso importante: la memoria asociativa M4, las matrices de memoria neuronal en tiempo de test y la cabeza MTP pueden añadir estados adicionales no contabilizados en el cálculo anterior. No hay datos publicados de VRAM real medida.
- La caché KV se beneficia teóricamente de CSA3 y de GQA (4 cabezas KV), pero no se han publicado cifras de consumo por token de contexto.
- Opciones de despliegue: la vía documentada es `transformers` con `trust_remote_code=True` y `device_map="auto"`. El repositorio incluye código personalizado (`custom_code`), por lo que el soporte en vLLL, TGI, llama.cpp, Ollama o LM Studio es improbable sin conversión y adaptación previas; no hay confirmación de compatibilidad con ninguna de estas herramientas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de sus fichas públicas y deben verificarse antes de usarse como base de decisión.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jarvis-Titan-M4-Activated | 15,55 B (safetensors) | ~3,2 B (según autor) | 131.072 | JTRL-v1.0 (propietaria) | HuggingFace, 0 descargas |
| DeepSeek-V2-Lite | ~15,7 B | ~2,4 B | 32.768-64.000 | Abierta de DeepSeek (verificar) | HuggingFace, ampliamente usado |
| Qwen1.5-MoE-A2.7B | ~14,3 B | ~2,7 B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado |
| Mixtral 8x7B | ~46,7 B | ~12,9 B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado |

Diferencias relevantes: frente a las alternativas citadas, Jarvis-Titan-M4-Activated declara un contexto notablemente mayor (131.072 tokens frente a 32.768) y un número de parámetros activos comparable al de DeepSeek-V2-Lite, pero parte de una licencia propietaria restrictiva, carece de benchmarks publicados, no tiene adopción comunitaria y depende de código personalizado que limita las opciones de despliegue estándar. Su ventaja declarada en memoria de largo alcance no es verificable con la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de rendimiento en matemáticas, código o razonamiento más allá de las afirmaciones de la model card.
- Adopción nula: 0 descargas y 0 valoraciones en el momento de la consulta, sin comunidad que haya validado el modelo.
- Inconsistencia documental: la model card referencia el identificador `dhanesh-hf/Jarvis-Titan-M4-MoE-CSA3`, distinto del repositorio real `dhanesh-hf/Jarvis-Titan-M4-Activated`, y declara 14,8 B de parámetros frente a los 15,55 B reales en safetensors. Indica que la ficha puede ser una plantilla reutilizada.
- Licencia propietaria JTRL-v1.0: es imprescindible leer el archivo LICENSE antes de cualquier uso comercial. Las etiquetas de HuggingFace la clasifican como "other", y no se pueden asumir permisos de uso comercial, redistribución ni modificación.
- Idioma único: solo inglés declarado. No hay evidencia de competencia en castellano ni en otros idiomas.
- Riesgo de alucinación: no se ha publicado información sobre tasas de alucinación, ajuste por preferencias ni evaluaciones de fidelidad factual. Un modelo entrenado con un currículo declarado de solo 120 M de tokens tiene un riesgo elevado de conocimiento factual limitado.
- Código personalizado obligatorio: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio en el entorno de inferencia. Debe revisarse el código antes de ejecutarlo en sistemas con datos sensibles.
- Dependencia de arquitecturas no estándar: los mecanismos M4, CSA3 y MTP no están documentados con detalle técnico suficiente (no hay informe, dimensiones ni hiperparámetros publicados), lo que dificulta auditar su comportamiento real.
- Contexto declarado no verificado: los 131.072 tokens son una afirmación del autor sin evaluación de recuperación ("needle-in-a-haystack") publicada.
- Uso en producción desaconsejado sin validación previa: sin benchmarks, sin adopción y con licencia restrictiva, no debería desplegarse en entornos productivos sin una evaluación interna exhaustiva.
- Fechas de creación y actualización inusuales: el repositorio figura como creado el 19 de septiembre de 2026, lo que conviene contrastar con el estado real del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhanesh-hf/Jarvis-Titan-M4-Activated
- Modelo base declarado: https://huggingface.co/dhanesh-hf/Jarvis-Titan-V15-MoE-Decoupled
- Identificador alternativo citado en la model card: https://huggingface.co/dhanesh-hf/Jarvis-Titan-M4-MoE-CSA3
- Artículo de referencia citado en las etiquetas (Titans: Learning to Memorize at Test Time): https://arxiv.org/abs/2501.00663
- Licencia (archivo LICENSE dentro del repositorio): https://huggingface.co/dhanesh-hf/Jarvis-Titan-M4-Activated/blob/main/LICENSE
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
