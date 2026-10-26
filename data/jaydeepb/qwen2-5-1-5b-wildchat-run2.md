# jaydeepb/qwen2.5-1.5b-wildchat-run2

## Resumen

`jaydeepb/qwen2.5-1.5b-wildchat-run2` es un ajuste fino de `Qwen/Qwen2.5-1.5B` publicado como artefacto de investigación, no como modelo de propósito general. Según su model card, se ha entrenado durante una época sobre una muestra de un millón de secuencias del corpus **WildChat**, y corresponde a la "Run 2" (run de evaluación sobre datos retenidos) del trabajo *Predicting Memorization Before Fine-Tuning Language Models*. El objetivo del modelo es servir de objeto de estudio: los clasificadores entrenados en ese paper predicen, a partir de características del modelo base antes del ajuste fino, qué secuencias acaba memorizando literalmente este modelo tras el entrenamiento.

La relevancia es por tanto metodológica: es un ejemplar reproducible para investigar memorización verbatim de datos de entrenamiento en modelos pequeños, y una demostración práctica de que un ajuste fino de una sola época sobre datos conversacionales reales basta para que un modelo de 1.500 millones de parámetros reproduzca fragmentos de su corpus. El autor advierte explícitamente de que puede reproducir partes de sus datos de ajuste.

El modelo hereda la arquitectura, el tokenizador y la ventana de contexto de Qwen2.5-1.5B, con licencia Apache 2.0 y pesos en safetensors (3,1 GB de repositorio, coherente con bf16/fp16 para 1.543.714.304 parámetros). No es un modelo Instruct: no se ha alineado con RLHF ni con instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada del modelo base Qwen2.5-1.5B; no se detallan capas ni dimensiones en la model card |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B declara 32.768 tokens; no verificado en este repositorio) |
| Tipos de cuantizacion | no disponible; solo se publican pesos sin cuantizar (safetensors, ~3,1 GB) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Arquitectura: se reutiliza íntegramente el grafo de Qwen2.5-1.5B, un transformer decoder-only con atención causal, sin modificaciones estructurales indicadas. El cambio respecto al modelo base es exclusivamente de pesos: ajuste fino supervisado (fine-tuning estándar, sin preferencias) durante **una sola época** sobre una muestra de **1M de secuencias** de WildChat. No se indica en la información disponible el régimen de entrenamiento (learning rate, batch size, precisión, hardware) ni si hubo congelación de capas.

El dato técnico central es el corpus: WildChat es una colección de conversaciones reales de usuarios con ChatGPT, multilingüe y sin filtrado agresivo, lo que la convierte en un sustrato representativo de lenguaje espontáneo. El paper asociado usa este run como objetivo de evaluación: los clasificadores predicen la memorización a partir de rasgos medidos en el modelo base antes de ajustar, lo que implica que la memorización verbatim en este checkpoint es el fenómeno medido, no un efecto colateral. La model card no reporta métricas de pérdida, perplejidad ni tasas de memorización para este checkpoint concreto.

## Capacidades

- Generación de texto conversacional: continuación y respuesta en formato de diálogo, al haber sido ajustado sobre conversaciones multi-turno.
- Reproducción de memorización: puede emitir fragmentos literales de las secuencias de WildChat vistas en entrenamiento, que es precisamente su propósito como artefacto.
- Modelado de lenguaje base: al no estar alineado con instrucciones, conserva capacidades de completado, pero no de seguimiento fiable de instrucciones.
- Tool calling / function calling: no disponible; no se ha entrenado con plantillas de herramientas ni se documenta soporte.
- Capacidades de agente o razonamiento multi-paso: no documentadas; el ajuste no incluye datos de razonamiento ni de uso de herramientas.
- Multilingüismo: presumiblemente heredado del modelo base y del corpus WildChat, pero la model card no declara lista de idiomas.
- Capacidades especiales (thinking mode, visión, audio): ninguna; es un modelo de texto, sin modo de razonamiento explícito.

## Casos de uso

- Investigación sobre memorización en LLM: reproducir el experimento del paper cargando este checkpoint y midiendo la tasa de reconstrucción verbatim de secuencias de WildChat, para validar la predicción hecha a priori desde el modelo base. Es el caso de uso primario declarado.
- Auditoría de privacidad en ajuste fino: usar el modelo como caso controlado para cuantificar cuánta información personal o identificable de conversaciones reales se filtra tras una época de entrenamiento sobre 1M de secuencias.
- Calibración de clasificadores de riesgo: servir de etiqueta de referencia (*ground truth*) para entrenar y evaluar detectores que estimen, antes de entrenar, qué datos serán memorizados.
- Estudio de olvido catastrófico y deriva de dominio: comparar las salidas de este checkpoint con las de Qwen2.5-1.5B base para medir cuánto se desplaza la distribución hacia el registro conversacional de WildChat.
- Reproducibilidad de artefactos académicos: punto de partida fijo y versionado para replicar resultados del paper en una máquina de un solo GPU consumer, sin depender de recursos de entrenamiento a gran escala.
- Análisis de sesgos y toxicidad en datos conversacionales reales: al estar entrenado sobre diálogos sin curar, permite estudiar qué tipo de contenido indeseado se absorbe y se reproduce en un modelo de 1.500 millones de parámetros.
- Detección de extracción de datos en producción: emplear el checkpoint como banco de pruebas para validar herramientas de *membership inference* o de extracción de corpus antes de desplegarlas en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni métricas de memorización (por ejemplo, tasa de coincidencia exacta de n-gramas o de secuencias completas) para este checkpoint.

## Requisitos de hardware

- Pesos en bf16/fp16: 1.543.714.304 parámetros × 2 bytes ≈ 3,1 GB de VRAM solo para los pesos.
- Inferencia en fp16 con overhead de activaciones y caché KV: estimación de 4-5 GB de VRAM para contextos cortos; el margen crece de forma aproximadamente lineal con la longitud de contexto.
- Cuantización a int8: ~1,6 GB de pesos; a 4 bits: ~0,8-1 GB, aunque no se publican versiones GGUF/AWQ/GPTQ oficiales y habría que generarlas.
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090, e incluso en tarjetas de 6-8 GB si se cuantiza.
- Despliegue: transformers (vía indicada por la librería), TGI (los tags incluyen `text-generation-inference` y `endpoints_compatible`), vLLM para serving con batching continuo. Para llama.cpp u Ollama es necesaria una conversión previa a GGUF y un Modelfile propio, ya que el repositorio no incluye esos formatos.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Por tamaño, es un modelo apto para inferencia interactiva en una sola GPU consumer.
- Almacenamiento: 3,1 GB de repositorio; el despliegue requiere además espacio para caché de pesos y tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-wildchat-run2 (este) | 1.543.714.304 | no disponible en la informacion | Artefacto de investigacion sobre memorizacion | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-1.5B (base) | ~1,54 B | 32.768 tokens segun el modelo base | Modelo de lenguaje preentrenado | apache-2.0 | Ampliamente disponible |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens segun el modelo base | Asistente alineado con instrucciones | apache-2.0 | Ampliamente disponible |
| SmolLM2-1.7B (HuggingFace) | ~1,7 B | no disponible en la informacion | Modelo pequeno de proposito general | apache-2.0 | Ampliamente disponible |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguna de estas alternativas en la informacion proporcionada, por lo que la comparación se limita a tamaño, licencia y orientación de uso. Frente a las alternativas, este checkpoint no compite en calidad de asistente: su valor es la reproducibilidad de un experimento de memorización.

## Limitaciones y advertencias

- **Riesgo de memorización y fuga de datos**: el autor advierte de que el modelo puede reproducir porciones de su corpus de ajuste de forma verbatim. WildChat contiene conversaciones reales de usuarios, por lo que existe riesgo de exponer información personal, identificadores o contenido sensible presentes en el corpus original.
- **No es un modelo de asistente**: no ha pasado por RLHF ni DPO, no sigue instrucciones de forma fiable y no está pensado para uso en producción orientado a usuario final.
- **Contenido no curado**: al entrenar sobre diálogos reales sin filtrado agresivo, es esperable la reproducción de lenguaje tóxico, sesgado o NSFW. No se documentan evaluaciones de sesgo ni de seguridad.
- **Alucinación**: como todo modelo de lenguaje de 1,5 B sin alineación, genera afirmaciones falsas con fluidez; la ausencia de instrucciones agravia la falta de control sobre el formato de salida.
- **Licencia**: los pesos se publican bajo apache-2.0, pero la licencia y las condiciones de uso del corpus WildChat no se detallan en la información disponible; el uso comercial del modelo derivado debería revisarse contra los términos del dataset y de las conversaciones originales.
- **Sesgo de evaluación**: el modelo está ajustado sobre la "Run 2", un conjunto retenido del paper; evaluar sobre los mismos datos usados para estudiar memorización invalida cualquier conclusión sobre generalización.
- **Sin cuantizaciones ni formatos alternativos**: no hay GGUF, AWQ ni GPTQ publicados, lo que añade trabajo de conversión y validación para despliegue ligero.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso externo ni informes de terceros.
- **Documentación mínima**: la model card no reporta hiperparámetros, idiomas, contexto efectivo ni métricas, lo que limita la reproducibilidad exacta del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/qwen2.5-1.5b-wildchat-run2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper de referencia citado en la model card: *Predicting Memorization Before Fine-Tuning Language Models* (no se proporciona URL en la información disponible)
- Corpus WildChat: no se proporciona enlace en la información disponible
- Repositorio de código del paper: no disponible
- Demo o Space: no disponible
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relación con el artefacto y se omiten.
