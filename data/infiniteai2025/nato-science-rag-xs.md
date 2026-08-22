# iNFINITEAi2025/NATO-Science-RAG-XS

## Resumen

NATO-Science-RAG-XS es un modelo de investigación extremadamente compacto desarrollado por iNFINITEAi2025, un perfil de Hugging Face orientado a experimentos de IA. Se trata de un transformer causal diminuto de 640.256 parámetros, entrenado desde inicialización aleatoria sobre una tarea sintética de retrieval-augmented generation (RAG) en el dominio científico. Su propósito declarado no es la producción, sino servir como demostración reproducible de un harness de tarea sintética auditable y de una evaluación acotada de métricas de siguiente token.

El modelo fue entrenado durante 240 pasos con un seed fijo, generando todos los ejemplos mediante plantillas deterministas locales, sin usar datos privados ni pesos descargados. Aunque la model card lo etiqueta como "research checkpoint, not AGI", su interés radica en la trazabilidad completa del pipeline de entrenamiento y en la posibilidad de inspeccionar cómo un modelo diminuto aprende a responder preguntas científicas con citas estructuradas. No se publican pesos en el repositorio (tamaño 0.0 GB), por lo que no es directamente ejecutable sin reconstruir el entrenamiento.

La relevancia actual es limitada pero útil para el ámbito académico: permite estudiar el sobreajuste controlado, la reproducibilidad de experimentos con datos sintéticos y el diseño de tareas de evaluación cerradas. No compite con modelos de propósito general y no debe usarse en ningún entorno de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | tiny_causal_transformer (transformer causal) |
| Parámetros totales | 640.256 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican pesos) |
| Idiomas soportados | inglés (dominio sintético) |
| Licencia | MIT |
| Formato de pesos | no publicado (repositorio sin pesos, solo código y configuración) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal diminuto, con un total de 640.256 parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida; es un modelo denso de escala de juguete, entrenado desde inicialización aleatoria. El entrenamiento se realizó durante 240 pasos con un seed fijo (20250101), y todos los datos fueron generados localmente mediante plantillas deterministas definidas en el archivo `train_portfolio.py`. Esto garantiza una procedencia totalmente trazable y sin dependencia de datasets externos.

No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación posterior. La innovación técnica destacable no reside en la arquitectura, sino en el diseño del harness de evaluación: el modelo se entrena para emitir respuestas en formato JSON estructurado, incluyendo un campo `answer`, una lista de `citations` (referencias a las evidencias proporcionadas) y un nivel de `confidence`. Este formato facilita la validación automática de la salida y la auditoría del comportamiento del modelo.

## Capacidades

- Generación de texto limitada al dominio sintético de ciencia con formato de respuesta JSON estructurada.
- RAG básico: dado un contexto con evidencias etiquetadas (p. ej., `EVIDENCE E1`), el modelo responde con la respuesta correcta y cita la evidencia utilizada.
- Salida con campo `confidence` que indica un nivel de confianza (alto, medio, bajo).
- Capacidad de reproducir el pipeline de entrenamiento y evaluación mediante el script `train_portfolio.py`.
- No dispone de soporte para tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.
- No incluye capacidades de visión, audio ni ningún modo de pensamiento extendido.

## Casos de uso

- **Demostración educativa de RAG**: el modelo sirve para ilustrar en clase cómo un transformer pequeño puede aprender a citar evidencias en un contexto controlado. Es adecuado para explicar conceptos de retrieval-augmented generation sin la complejidad de modelos grandes.
- **Reproducibilidad de experimentos**: investigadores pueden ejecutar el script de entrenamiento con distintos seeds o pasos para verificar la reproducibilidad de las métricas reportadas y analizar la varianza entre ejecuciones.
- **Auditoría de datos sintéticos**: al estar todo el dataset generado por plantillas deterministas, el modelo permite estudiar el impacto del formato de los datos en el aprendizaje, útil para diseñar pipelines de datos sintéticos auditables.
- **Validación de esquemas de salida**: la salida en JSON con citas y confianza puede usarse para probar validadores de esquema en sistemas de evaluación de modelos, sin necesidad de un LLM de gran tamaño.
- **Evaluación de métricas de siguiente token**: el modelo ofrece un entorno controlado para medir la precisión y pérdida de siguiente token en tareas acotadas, útil para comparar métodos de evaluación en laboratorios de investigación.
- **Prototipado de pipelines de RAG en entornos de bajo coste**: aunque no es apto para producción, puede emplearse en pruebas de concepto de arquitecturas de RAG en entornos de desarrollo, donde se prioriza la trazabilidad sobre el rendimiento.

## Benchmarks y rendimiento

La model card incluye métricas de entrenamiento y evaluación en la tarea sintética:

| Métrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 0,012038 |
| Pérdida media de entrenamiento | 1,583286 |
| Pérdida de siguiente token en validación | 0,009802 |
| Precisión de siguiente token en validación | 0,995223 |

Estos resultados corresponden a la tarea sintética específica de RAG sobre ciencia y no se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La model card advierte explícitamente que estas métricas no demuestran razonamiento general, uso robusto de herramientas, fiabilidad factual ni capacidades de AGI. No hay comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: trivial; un modelo de 640.256 parámetros ocupa menos de 1 MB en memoria con precisión fp32, y puede ejecutarse en CPU sin problemas.
- **GPU recomendada**: ninguna específica; cualquier GPU moderna (incluso integradas) o directamente CPU es suficiente.
- **Compatibilidad con hardware de consumo**: sí, es ejecutable en cualquier portátil o Raspberry Pi.
- **Opciones de despliegue**: al no publicarse pesos, el despliegue requiere primero entrenar el modelo ejecutando `python3 train_portfolio.py`. Una vez entrenado, puede usarse con PyTorch estándar; no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no se han publicado datos; al ser un modelo tan pequeño, la latencia en CPU sería del orden de milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (modelos diminutos de RAG sintético entrenados desde cero). Los modelos de escala similar como GPT-2 tiny (124M parámetros) o los modelos de 1M parámetros de la familia TinyStories no son comparables en tarea ni en propósito. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- **No es AGI ni un modelo de propósito general**: su capacidad se limita a la tarea sintética con la que fue entrenado.
- **Sesgos de datos sintéticos**: al entrenarse solo con plantillas deterministas, no generaliza a lenguaje natural real ni a dominios fuera del alcance de las plantillas.
- **Alto riesgo de alucinación**: fuera del formato de evidencias, no se ha evaluado su comportamiento; no se puede confiar en respuestas factuales.
- **Métricas engañosas**: la alta precisión de siguiente token (0,995) es un artefacto de la simplicidad de la tarea y no indica capacidad general.
- **Restricciones de uso**: la model card prohíbe explícitamente su uso en decisiones autónomas, de alto impacto, ingeniería de software general, medicina, derecho, finanzas, seguridad, vigilancia o sistemas críticos.
- **Sin pesos publicados**: el repositorio no contiene los pesos entrenados, solo el código y la configuración, lo que limita su uso directo sin reentrenar.
- **Licencia MIT**: permite uso comercial y modificación, pero el autor desaconseja cualquier uso en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/iNFINITEAi2025/NATO-Science-RAG-XS)
- [Perfil del autor en Hugging Face](https://huggingface.co/iNFINITEAi2025)
- [GitHub del autor (iNFINITEAi2025-X)](https://github.com/iNFINITEAi2025-X)
- [Artículo de Wikipedia sobre retrieval-augmented generation](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)
