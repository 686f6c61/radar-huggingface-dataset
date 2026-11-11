# shah-bakhsh/BalChat

## Resumen

BalChat es un prototipo de investigación de generación de texto en balochi (código ISO `bal`) desarrollado por el usuario shah-bakhsh. Se trata de un modelo entrenado desde cero con pesos inicializados aleatoriamente y un tokenizador BPE a nivel de byte propio, sin uso de checkpoints preentrenados ni adaptadores LoRA. La arquitectura reutiliza la implementación Llama de la librería Transformers, con 5.670.912 parámetros totales y una ventana de contexto de 512 tokens.

El modelo es explícitamente un artefacto de investigación y no un asistente conversacional fiable. El propio autor indica que no se ha establecido capacidad de chat natural en balochi, traducción al inglés, razonamiento ni uso de herramientas, y que ninguna persona nativa ha validado el lenguaje generado. Las peticiones de diagnóstico produjeron puntuación y repeticiones en lugar de respuestas útiles.

Su relevancia es, por tanto, metodológica más que práctica: documenta de forma transparente un pipeline completo de entrenamiento (tokenizador, particiones congeladas de train/validación/test, verificación de checksums, reproducibilidad en CPU) sobre un corpus muy reducido, y sirve como referencia para quien quiera replicar el proceso con datos licenciados de mayor escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementación Llama de Transformers) |
| Parámetros totales | 5.670.912 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloques de entrenamiento de 256 tokens como máximo) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Balochi (`bal`) |
| Licencia | Apache 2.0 (pesos); código MIT; fuentes de entrenamiento CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con seis capas, dimensión oculta de 256, MLP de 768, ocho cabezas de consulta y cuatro cabezas KV (GQA), embeddings atados y vocabulario de 3.707 tokens. El tokenizador es un BPE a nivel de byte entrenado únicamente con los documentos de entrenamiento, lo que preserva Unicode árabe y latino, aunque el corpus comercial es predominantemente de escritura latina. No se empleó ningún checkpoint preentrenado ni LoRA.

El entrenamiento se ejecutó en FP32 con AdamW sobre una GPU TITAN X Pascal, con learning rate 0.0003, batch 1 con acumulación de 8, semilla 42, durante 5 épocas y 90 actualizaciones del optimizador. El conjunto de datos consta de 16 registros de entrenamiento (15.818 ocurrencias de palabras) y 1 registro de validación (1.746 palabras), sin datos de test. La NLL de validación bajó de 8,258177 a 5,727272 y la perplejidad de 3859,053010 a 307,130297. El autor advierte que las épocas repetidas son exposición repetida al mismo texto, no datos nuevos, y que la perplejidad depende del tokenizador y no es comparable entre ejecuciones ni con otros modelos como Qwen. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto a nivel de continuación de secuencia, con calidad no validada.
- Codificación a nivel de byte que preserva caracteres Unicode árabes y latinos.
- No se ha establecido capacidad de razonamiento, matemáticas, código ni visión.
- No se ha establecido soporte de tool calling ni function calling.
- No se ha establecido soporte de agentes ni razonamiento multi-paso.
- Multilingüismo no demostrado: solo se declara balochi, sin fluidez verificada en escritura árabe ni latina.
- No dispone de modo thinking ni capacidades de audio.

## Casos de uso

- Estudio de pipelines de entrenamiento desde cero: el repositorio de reproducción permite examinar paso a paso la construcción del tokenizador, las particiones congeladas y la verificación de artefactos en un caso de escala mínima.
- Docencia sobre tokenización BPE a nivel de byte: el tokenizador de 3.707 tokens y su tratamiento de Unicode sirven como ejemplo didáctico de codificación multiescritura.
- Auditoría de reproducibilidad: los ficheros `verification.json` y `release-metadata.json` permiten practicar la comprobación de checksums y la reproducción de la pérdida de validación en CPU.
- Punto de partida para experimentos con corpus balochi licenciados: el autor señala que se requiere un corpus mayor, ejemplos de tareas revisados y evaluación nativa independiente para construir un asistente real.
- Investigación sobre evaluación de modelos de bajos recursos: ilustra cómo la perplejidad puede resultar engañosa cuando el conjunto de validación es de un solo registro.
- Referencia de limitaciones documentadas: útil para comparar prácticas de transparencia en model cards frente a otros lanzamientos de modelos de bajo recurso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos reportados son métricas internas de entrenamiento y validación:

| Métrica | Inicio | Final |
|---|---|---|
| NLL de validación | 8,258177 | 5,727272 |
| Perplejidad de validación | 3859,053010 | 307,130297 |
| Actualizaciones del optimizador | — | 90 (5 épocas) |

El autor advierte explícitamente que la reducción de pérdida no establece calidad conversacional y que la perplejidad no es comparable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 5,67 millones de parámetros; no se han publicado mediciones específicas.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; el entrenamiento se realizó en una TITAN X Pascal.
- Cabe en cualquier GPU consumer y en CPU para inferencia.
- Opciones de despliegue: Transformers 4.57.6 con tokenizers 0.22.2, huggingface-hub 0.36.2, safetensors 0.7.0 y una build de Torch adecuada; no requiere código remoto personalizado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de generación de texto en balochi con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo no fiable como asistente conversacional: el autor lo califica explícitamente como artefacto de investigación.
- Sin validación por hablantes nativos: cero pares de instrucción verificados y cero registros de entrenamiento revisados por nativos.
- Las peticiones de diagnóstico produjeron puntuación y repeticiones en lugar de respuestas útiles; las salidas permanecen sin revisar en `verification.json`.
- Corpus extremadamente reducido: 16 registros de entrenamiento y 1 de validación, sin conjunto de test.
- Riesgo elevado de alucinación y de generar texto sin sentido; no debe usarse como fuente de traducciones ni de hechos.
- El tokenizador se entrenó solo con documentos de entrenamiento y el corpus comercial es predominantemente latino, lo que no garantiza fluidez en escritura árabe.
- Ventana de contexto de 512 tokens, con bloques de entrenamiento de 256 tokens como máximo.
- Las épocas repetidas no aportan datos nuevos; la perplejidad no es comparable con otros modelos.
- Licencia Apache 2.0 para los pesos, lo que permite uso comercial, pero las fuentes de entrenamiento son CC BY 4.0 y exigen mantener la atribución en `SOURCE_CREDITS.md`; el código es MIT.
- No se distribuye el corpus bruto.
- No se reclama ser el primer modelo balochi, ni escala de miles de millones de parámetros, ni calidad tipo ChatGPT, Gemini o Claude.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shah-bakhsh/BalChat
- Código de reproducción, tests de software y limitaciones medidas: https://github.com/shah-bakhsh/BalChat
