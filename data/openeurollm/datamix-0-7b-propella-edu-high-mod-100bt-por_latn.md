# openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-por_Latn

## Resumen

El modelo `openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-por_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el proyecto OpenEuroLLM, una iniciativa europea orientada a construir modelos fundacionales abiertos y multilingües. Se trata de un modelo monolingüe en portugués (etiqueta `por_Latn`) cuyo propósito es servir como componente base dentro de una familia mayor de modelos y como punto de partida para experimentos de entrenamiento sobre corpus filtrados por calidad educativa.

La particularidad del modelo reside en su receta de datos: ha sido entrenado sobre 100 mil millones de tokens extraídos de HPLT 4 en portugués, filtrados mediante el clasificador Propella-1 con la etiqueta "Educational" restringida a los niveles "Moderate" y "High". Esto lo convierte en un artefacto de investigación sobre el impacto del filtrado de calidad en el preentrenamiento de modelos pequeños, más que en un modelo listo para producción.

Es relevante ahora porque documenta una estrategia reproducible de curación de corpus para lenguas de menor representación y porque forma parte del esfuerzo abierto europeo por reducir la dependencia de modelos propietarios. No se ha publicado información sobre arquitectura interna, contexto, benchmarks ni proceso de alineación más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, inferido por el tamaño y el formato, no confirmado) |
| Parametros totales | 0,7B |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `safetensors` en `pt`, sin GGUF publicado) |
| Idiomas soportados | portugués (`pt`, escritura latina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, `pt`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna: no se especifican número de capas, dimensión oculta, número de cabezas de atención, tipo de normalización ni función de activación. Por el tamaño (0,7B) y el formato de pesos, se trata con alta probabilidad de un transformer decoder-only denso, pero este dato no está confirmado en la información proporcionada.

En cuanto al entrenamiento, el modelo se ha entrenado desde cero sobre 100 mil millones de tokens de HPLT 4 en portugués. El corpus se ha filtrado con el clasificador Propella-1, conservando únicamente documentos clasificados como "Educational" con nivel "Moderate" o "High". No se indica si hubo fases de instrucción, RLHF, DPO u otra alineación posterior, ni se detalla la composición exacta del dataset más allá de la fuente y el filtro. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en portugués: es la capacidad principal esperable dado el corpus de entrenamiento monolingüe.
- Modelado de lenguaje base: al no constar fases de instrucción, no hay evidencia de que siga instrucciones de forma fiable.
- Razonamiento y matemáticas: no hay información publicada sobre su desempeño en estas tareas.
- Generación de código: no hay información publicada; el corpus HPLT es predominantemente texto web, no código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al portugués según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre filtrado de calidad de datos: el modelo sirve como punto de comparación frente a variantes entrenadas con otros umbrales del clasificador Propella-1, permitiendo aislar el efecto del filtro "Educational" en el rendimiento final.
- Preentrenamiento continuado en portugués: al ser un checkpoint base de 0,7B con licencia Apache 2.0, se puede usar como inicialización para ajuste fino supervisado en dominios concretos (legal, sanitario, educativo) con presupuestos de cómputo reducidos.
- Experimentos académicos de bajo coste: su tamaño permite reproducir experimentos de scaling y de curricula de datos en una sola GPU consumer, algo inviable con modelos de decenas de miles de millones de parámetros.
- Generación de texto en portugués para tareas de aumentación de datos: puede producir textos sintéticos que alimenten pipelines de etiquetado o de entrenamiento de clasificadores, siempre con revisión humana por el riesgo de alucinación.
- Evaluación de corpus HPLT 4: sirve como sonda para medir la calidad efectiva del subconjunto filtrado de HPLT 4 en portugués, comparando la perplejidad sobre distintos subconjuntos.
- Base para modelos especializados en educación: dado que el corpus está filtrado por clasificación educativa, es un candidato razonable para ajuste fino en aplicaciones de tutoría o generación de material didáctico en portugués, previa validación empírica.
- Componente en pipelines de investigación multilingüe de OpenEuroLLM: puede integrarse como miembro de una familia de modelos por lengua dentro de experimentos comparativos coordinados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,7-1 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,4-0,6 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de gama de entrada y en CPU.
- Cabe en GPU consumer: sí, con margen amplio, en todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: al no haber pesos GGUF publicados, la ruta directa es PyTorch con `transformers`; para cuantización habría que convertir manualmente a GGUF para llama.cpp u Ollama. vLLM y TGI son viables con los pesos safetensors si se confirma la arquitectura.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-por_Latn | 0,7B | no disponible | portugués | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | inglés (principalmente) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 0,5B | 32.768 tokens | multilingüe (incluye portugués) | Apache 2.0 | Hugging Face |
| Gemma-2-2B | 2B | 8.192 tokens | multilingüe | Gemma Terms | Hugging Face |

La comparación es orientativa: no hay datos de rendimiento publicados para el modelo de OpenEuroLLM, por lo que no es posible establecer una comparación cuantitativa con las alternativas. La diferencia principal es su especialización monolingüe en portugués y su receta de datos filtrada por calidad educativa, frente a alternativas multilingües con contextos mucho mayores.

## Limitaciones y advertencias

- Modelo base sin alineación conocida: no hay evidencia de ajuste por instrucciones, RLHF o DPO, por lo que no debe usarse directamente como asistente conversacional sin ajuste posterior.
- Sesgos: al entrenarse sobre texto web de HPLT 4, es esperable que herede sesgos de género, ideología, origen geográfico y registro presentes en el corpus, aunque no se han publicado auditorías específicas.
- Riesgo de alucinación: alto en un modelo de 0,7B sin alineación; cualquier uso en producción requiere verificación factual.
- Limitación idiomática: monolingüe en portugués según la etiqueta declarada; su rendimiento en otras lenguas, incluido el castellano, será previsiblemente muy bajo.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en secuencias largas.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero conviene revisar las condiciones de la fuente HPLT 4 si se redistribuyen derivados, ya que la licencia del corpus original puede imponer obligaciones adicionales.
- Documentación insuficiente para producción: sin benchmarks, sin ficha de arquitectura y sin guía de uso, el modelo no está listo para despliegues críticos sin una evaluación propia exhaustiva.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-por_Latn
- OpenEuroLLM (organización): https://huggingface.co/openeurollm
- HPLT (High Performance Language Technologies): https://hplt-project.org/
- Propella-1: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
