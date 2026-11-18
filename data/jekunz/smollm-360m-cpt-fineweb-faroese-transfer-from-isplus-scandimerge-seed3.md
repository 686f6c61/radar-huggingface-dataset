# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed3

## Resumen

El modelo `smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed3` es un ajuste fino experimental del modelo base `jekunz/smollm360m-da05-is1-nno05-nob05-sv05-ties`, a su vez derivado de SmolLM2-360M-Instruct de Hugging Face. Lo desarrolla el usuario jekunz como parte de una línea de investigación personal sobre adaptación de modelos pequenos a lenguas escandinavas y al faroes, una lengua germánica insular con recursos digitales muy limitados. El modelo resultante tiene 361.821.120 parámetros y está especializado en generación de texto en faroes.

La relevancia del modelo es doble. Por un lado, demuestra que es posible transferir conocimiento desde lenguas escandinavas mejor representadas (danes, islandes, noruego bokmal, noruego nynorsk y sueco) hacia el faroes mediante un ajuste continuado sobre el corpus FineWeb-2. Por otro, lo hace con un presupuesto de entrenamiento modesto: una sola GPU A100 de 40 GB y una ventana de contexto de 2048 tokens. Es, por tanto, un ejemplo de adaptación lingüística de bajo coste más que un modelo de propósito general.

Conviene subrayar que se trata de un modelo de investigación. El propio autor indica que no ha sido evaluado de forma amplia, que no hay benchmarks publicados y que no se ha validado su calidad en producción. Su interés es principalmente académico y como base para experimentos posteriores de adaptación al faroes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2, tipo LLaMA) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | faroes (fo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM2-360M-Instruct: un transformer decoder-only de tipo LLaMA con 361,8 millones de parámetros, sin mezcla de expertos ni mecanismos de atención lineal. El modelo parte de un checkpoint intermedio del autor (`smollm360m-da05-is1-nno05-nob05-sv05-ties`), que a su vez es una fusión TIES de modelos entrenados sobre las porciones danesa, islandesa, noruega bokmal, noruega nynorsk y sueca de FineWeb-2, con mayor peso asignado al islandes. Sobre esa base se aplica un ajuste continuado (continual pre-training) sobre la porción de faroes de FineWeb-2.

Los detalles de entrenamiento son: 1 época por lengua de origen y 5 épocas sobre faroes, tasa de aprendizaje 5e-4 con scheduler coseno, warmup del 5 %, batch size de 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de 2048 tokens y semilla 3 (una de tres semillas para esta configuración). Todo el entrenamiento se ejecutó en una única A100 de 40 GB. No se documentan fases de RLHF, DPO ni ajuste por preferencias; el pipeline es exclusivamente de pre-entrenamiento continuado sobre texto crudo.

La innovación técnica principal no está en la arquitectura sino en la estrategia de transferencia: la fusión TIES entre lenguas escandinavas actúa como inicialización que preserva representaciones compartidas, y el ajuste posterior sobre faroes aprovecha ese sustrato lingüístico común. El sesgo hacia el islandes en la fusión es una decisión deliberada, presumiblemente por su mayor proximidad genealógica y morfológica con el faroes.

## Capacidades

- Generación de texto en faroes, con continuidad de estilo y coherencia local gracias al pre-entrenamiento sobre FineWeb-2.
- Comprensión de texto en faroes dentro de la ventana de 2048 tokens.
- Generación conversacional heredada del ajuste instruct de SmolLM2-360M-Instruct, aunque no se documenta su preservación tras el ajuste continuado.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño del modelo (360 M de parámetros).
- Transferencia lingüística parcial desde danes, islandes, noruego bokmal, noruego nynorsk y sueco, que puede manifestarse en vocabulario y estructuras compartidas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: el modelo está declarado únicamente para faroes; no se documenta un comportamiento multilingüe fiable.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Generación de texto sintético en faroes para aumento de datos: el modelo puede producir frases y parrafos en faroes que sirvan como corpus adicional para entrenar modelos mayores o para completar datasets con escasez de texto en esta lengua.
- Prototipado de asistentes conversacionales en faroes: con 361 M de parámetros y contexto de 2048 tokens, puede desplegarse en hardware modesto para validar interfaces de chat antes de invertir en modelos mayores.
- Normalización y reescritura de texto faroes: tareas de paráfrasis o reformulación de frases cortas dentro de la ventana de contexto, útiles en herramientas de edición lingüística.
- Investigación en transferencia entre lenguas emparentadas: sirve como caso de estudio reproducible (semilla 3 de una serie de tres) para medir cuánto conocimiento escandinavo se transfiere al faroes y cómo afecta la fusión TIES.
- Completado de texto en entornos educativos o de documentación: generación de continuaciones para materiales didácticos o borradores de contenido en faroes, siempre con revisión humana.
- Base para ajuste supervisado posterior: al estar licenciado Apache 2.0 y publicarse en safetensors, puede usarse como punto de partida para fine-tuning con instrucciones o preferencias en faroes.
- Experimentos de destilación o compresión: su tamano reducido permite usarlo como alumno o como referencia en estudios de eficiencia lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet", por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas en faroes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB de pesos más overhead de activaciones y KV cache; en la práctica cabe en GPUs con 2 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB; en 4 bits, alrededor de 0,2 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 2 GB de VRAM, e incluso en inferencia por CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se publican en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmark |
|---|---|---|---|---|---|
| smollm-360m-cpt-fineweb-faroese-transfer (este) | 361,8 M | 2048 | fo | Apache 2.0 | no disponible |
| SmolLM2-360M-Instruct (base) | 360 M aprox. | 2048 (entrenamiento) | multilingüe (principalmente ingles) | Apache 2.0 | benchmarks publicados por Hugging Face, no aplicables a faroes |
| jekunz/smollm360m-da05-is1-nno05-nob05-sv05-ties (base directo) | 360 M aprox. | 2048 | da, is, nb, nn, sv | Apache 2.0 | no disponible |

La comparación con alternativas específicas para faroes no está disponible: no se han identificado en la información proporcionada otros modelos ajustados a esta lengua con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor advierte que no ha sido evaluado más allá de su propio uso, por lo que no hay garantías de calidad.
- Riesgo elevado de alucinación: con 360 M de parámetros y un corpus de pre-entrenamiento limitado en faroes, es probable que genere contenido plausible pero factualmente incorrecto.
- Ventana de contexto corta (2048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida al faroes; el comportamiento en otras lenguas no está documentado y puede degradarse respecto al modelo base.
- Posible olvido catastrófico de las capacidades instruct originales tras 5 épocas de pre-entrenamiento continuado sobre texto crudo.
- Sesgos heredados del corpus FineWeb-2 y del modelo base SmolLM2, no auditados en este ajuste.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo sin evaluar, su uso en producción conlleva riesgos de calidad no cuantificados.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni recetas de cuantización; habría que generarlos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter experimental y la ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed3
- Modelo base: https://huggingface.co/jekunz/smollm360m-da05-is1-nno05-nob05-sv05-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia base): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Paper de SmolLM2: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
