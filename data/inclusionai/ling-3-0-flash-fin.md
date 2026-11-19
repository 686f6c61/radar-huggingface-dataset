# inclusionAI/Ling-3.0-flash-Fin

## Resumen

Ling-3.0-flash-Fin es un modelo de lenguaje especializado en finanzas desarrollado por Ant Group (familia Ant Ling, publicada bajo la organización inclusionAI). Se construye a partir de Ling-3.0-flash mediante entrenamiento continuado sobre datos financieros de alta calidad, elaborados con instituciones financieras y expertos de dominio. Es el primer modelo de la familia Ling orientado específicamente al sector financiero.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 124.000 millones de parámetros totales y 5.100 millones de parámetros activos por token, lo que permite una inferencia eficiente pese al tamaño del checkpoint. Dispone de una ventana de contexto de 256.000 tokens, pensada para flujos de trabajo agénticos de largo horizonte sobre documentación financiera extensa (informes anuales, presentaciones de resultados, registros regulatorios).

Su relevancia actual reside en que aborda el ciclo completo de investigación financiera (recuperación de información, revisión de evidencia, cálculo, modelado y redacción de informes) en lugar de tratar estas tareas de forma aislada, con énfasis en respuestas trazables y ancladas en fuentes autoritativas. El modelo se distribuye con licencia MIT y en formato BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), tag `bailing_hybrid`, código personalizado (`custom_code`) |
| Parámetros totales | 127.486.405.600 (≈124B según model card) |
| Parámetros activos | 5.100 millones (5,1B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Ling-3.0-flash-Fin hereda la arquitectura de Ling-3.0-flash, identificada en los metadatos como `bailing_hybrid` y con requisito de código personalizado. Se trata de un transformer con mezcla de expertos: 124.000 millones de parámetros totales con 5.100 millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. El checkpoint se publica en BF16 y es compatible con los mismos runtimes SGLang y vLLM que el modelo base.

El entrenamiento parte de Ling-3.0-flash y aplica entrenamiento continuado sobre datos financieros de alta calidad, desarrollados conjuntamente con instituciones financieras y expertos de dominio. La model card no detalla el volumen de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; sí se publica un resumen de contenidos de entrenamiento en PDF. El modo de razonamiento (*thinking mode*) está activado por defecto, con parámetros de muestreo recomendados de `temperature=1.0`, `top_p=0.95` y `top_k=20`.

## Capacidades

- Generación de texto y razonamiento financiero sobre documentación multi-fuente.
- Investigación financiera de extremo a extremo: recuperación de información, revisión de evidencia, cálculo, modelado y preparación de informes.
- Búsqueda financiera anclada en fuentes: prioriza fuentes autoritativas y produce respuestas trazables.
- Razonamiento multi-documento: concilia periodos contables, definiciones, supuestos y cifras en conflicto entre informes anuales, presentaciones de resultados, registros regulatorios y material de investigación.
- Flujos de valoración y hojas de cálculo: comprensión de fórmulas, actualizaciones de estimaciones frente a datos reales, dependencias entre hojas, comprobaciones de balance y análisis de escenarios.
- Soporte de *tool calling* / *function calling* (etiqueta `tool-use`).
- Capacidades agénticas y razonamiento multi-paso (etiquetas `agents`, `long-context`).
- Modo de razonamiento (*thinking mode*) activado por defecto.
- Salidas listas para revisión: organiza hechos, análisis, juicios y gráficos en materiales editables.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación de inversiones automatizada: el modelo encadena recuperación de fuentes, contraste de evidencia y redacción de informes con 256K tokens de contexto, suficiente para procesar varios informes anuales y presentaciones de resultados en una sola sesión.
- Análisis comparativo multi-documento: concilia cifras y definiciones entre registros regulatorios y material de research de distintos periodos, señalando discrepancias de supuestos y periodos contables.
- Modelado de valoración en hojas de cálculo: interpreta fórmulas, dependencias entre hojas y comprobaciones de balance, y entrega modelos financieros editables con escenarios de sensibilidad.
- Agentes financieros de largo horizonte: integrado en pipelines agénticos con *tool calling* para ejecutar secuencias multi-paso de consulta, cálculo y verificación sobre APIs internas de datos de mercado.
- Automatización de banca y back office: evaluación en τ³-Banking sugiere uso en flujos de atención y operaciones bancarias con llamadas a herramientas.
- Asistencia a analistas en búsqueda documental: respuestas con trazabilidad de fuentes para reducir el tiempo de localización de evidencia en archivadores regulatorios.
- Generación de material de revisión profesional: producción de resúmenes con hechos, juicios y gráficos separados, listos para edición y revisión por un analista humano.

## Benchmarks y rendimiento

La model card indica evaluación en FinFIRST, FinSearchComp Verified, FinCRAFT, Finance Agent, APEX-Agents, SpreadsheetBench y τ³-Banking, y afirma competitividad con modelos de tamaño similar y con modelos generales sustancialmente mayores, con especial solidez en selección de fuentes y tareas financieras intensivas en herramientas. Los resultados numéricos se presentan únicamente en una imagen (`ling-3.0-flash-fin-evaluation.png`) no incluida en la información proporcionada.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 de 127.486 millones de parámetros ocupa aproximadamente 255 GB en disco; en BF16 requiere del orden de 250 GB de memoria, por lo que se necesitan múltiples GPU. Con cuantización a 8 bits se reduciría a unos 128 GB y a 4 bits a unos 64 GB, aunque no se confirman cuantizaciones publicadas.
- GPU recomendadas: múltiples A100/H100 de 80 GB para BF16; un nodo con 4×H100 80 GB o 8×A100 80 GB es un punto de partida razonable, sin cifras oficiales.
- GPU de consumo: no cabe en una GPU consumer individual en BF16; una cuantización de 4 bits podría situarse en el límite de configuraciones multi-GPU de consumo, sin datos confirmados.
- Despliegue: SGLang y vLLM (compatibles con la guía de despliegue de Ling-3.0-flash). No se indica soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los 5,1B parámetros activos por token reducen el coste de cómputo frente a un denso de 124B, pero no se publican métricas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ling-3.0-flash-Fin | ≈124B | 5,1B | 256K | MIT | Finanzas, agentes |
| Ling-3.0-flash (base) | ≈124B | 5,1B | 256K | MIT | Generalista |
| Otros modelos financieros | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de terceros que permitan una comparación cuantitativa. El modelo base Ling-3.0-flash es la referencia directa: misma arquitectura, mismo contexto y misma licencia, sin el entrenamiento continuado en finanzas.

## Limitaciones y advertencias

- Modelo de primera generación financiera de la familia: requiere validación adicional en flujos de trabajo complejos de largo horizonte.
- Los supuestos clave, resultados de valoración y conclusiones de inversión requieren revisión profesional y no constituyen asesoramiento financiero.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en cifras, fechas y definiciones contables; la trazabilidad de fuentes mitiga pero no elimina el riesgo.
- Idiomas soportados no documentados; el rendimiento fuera del ámbito financiero no se ha evaluado en la información disponible.
- El modo de razonamiento está activado por defecto, lo que incrementa la latencia y el consumo de tokens de salida si no se ajusta.
- Licencia MIT: permite uso comercial, pero conviene revisar los términos de los datos de entrenamiento y la documentación de transparencia publicada por el autor.
- Requiere `custom_code` y `trust_remote_code` en la carga, con la implicación de seguridad que ello conlleva.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-flash-Fin
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Guía de despliegue del modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash#quickstart
- Dataset FinFIRST: https://huggingface.co/datasets/inclusionAI/FinFIRST
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.0-flash-fin:free
- Anuncio: https://x.com/AntLingAGI/status/2093022087069958492
- Resumen de contenidos de entrenamiento (PDF): https://huggingface.co/inclusionAI/AI-Transparency/resolve/main/Ling-3.0-LLM_TDS-Summary.pdf
- Índice de documentación de transparencia: https://huggingface.co/inclusionAI/AI-Transparency
