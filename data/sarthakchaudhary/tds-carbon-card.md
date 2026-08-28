# sarthakchaudhary/tds-carbon-card

## Resumen

El repositorio `sarthakchaudhary/tds-carbon-card` no contiene un modelo de inteligencia artificial funcional, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning realizado en el marco de la asignatura TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento, junto con el hardware utilizado, el consumo energético y la localización geográfica del cómputo. No se proporciona información sobre la arquitectura, los parámetros, el contexto ni las capacidades del modelo subyacente, por lo que esta ficha se limita a describir los datos disponibles en la model card y a señalar explícitamente la ausencia de especificaciones técnicas.

La relevancia de este repositorio radica en su función como ejemplo de prácticas de IA sostenible (Green AI), donde se cuantifica el impacto ambiental de un entrenamiento concreto. Sin embargo, al carecer de cualquier artefacto de modelo, no puede evaluarse como un sistema de IA utilizable. Los metadatos indican que se emplearon 6 GPUs NVIDIA V100 durante 16,2 horas en la región `us-central1`, con un consumo total de 42,282 kWh y unas emisiones de 14,799 kg de CO₂eq, calculadas mediante la herramienta CodeCarbon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento, el número de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. La model card únicamente indica que el proceso fue un fine-tuning, sin especificar el modelo base ni la tarea. El hardware declarado son 6 GPUs NVIDIA V100, con un total de 16,2 horas de cómputo y un factor de eficiencia energética (PUE) de 1,45. El consumo energético total fue de 42,282 kWh y las emisiones de CO₂ equivalente alcanzaron los 14,799 kg, calculadas con CodeCarbon. No se menciona ninguna innovación técnica destacable.

## Capacidades

- No se documenta ninguna capacidad funcional del modelo (generación de texto, razonamiento, código, visión, etc.).
- No se indica soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- El repositorio solo contiene metadatos de emisiones y consumo, por lo que no puede evaluarse ninguna habilidad de IA.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para registrar y reportar la huella de carbono de un entrenamiento, útil para organizaciones que necesitan cumplir criterios de transparencia ambiental.
- Investigación en Green AI: los datos de emisiones y consumo pueden utilizarse en estudios comparativos sobre el coste energético de diferentes configuraciones de hardware y regiones de cómputo.
- Documentación de conformidad regulatoria: en contextos donde se exige reportar el impacto ambiental de los sistemas de IA, este tipo de registro proporciona evidencia cuantitativa.
- Optimización de infraestructura: los valores de GPU hours, energía y PUE permiten estimar el coste energético de futuros entrenamientos y decidir entre ubicaciones o hardware más eficientes.
- Educación y formación: como ejemplo práctico de cómo medir emisiones con CodeCarbon, puede usarse en cursos sobre IA responsable y computación sostenible.
- Trazabilidad de experimentos: el registro facilita la reproducibilidad y la comparación entre ejecuciones de entrenamiento en términos de impacto ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros sistemas.

## Requisitos de hardware

- Hardware utilizado en el entrenamiento: 6 GPUs NVIDIA V100, con 16,2 horas de cómputo total.
- Consumo energético: 42,282 kWh, con un PUE de 1,45.
- Emisiones: 14,799 kg de CO₂eq, calculadas con CodeCarbon.
- No se especifican requisitos de VRAM para inferencia, GPUs recomendadas para despliegue, ni opciones de servido (vLLM, llama.cpp, Ollama, TGI, etc.).
- Al no existir un modelo funcional, no procede estimar latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se puede comparar con otros modelos porque no hay información sobre arquitectura, parámetros o rendimiento. Los repositorios `saurabh123432/tds-carbon-card` y `pandey1111/tds-carbon-card` encontrados en la búsqueda web parecen contener el mismo tipo de registro de contabilidad de carbono, pero tampoco ofrecen especificaciones de modelo.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA utilizable; es únicamente un registro de emisiones y consumo energético.
- No se dispone de información sobre sesgos, alucinaciones, limitaciones de contexto o idioma, ni restricciones de licencia para uso comercial.
- Los datos de emisiones dependen de la herramienta CodeCarbon y de la región `us-central1`; extrapolarlos a otros entornos puede no ser válido.
- La ausencia de licencia y de artefactos de modelo impide cualquier uso práctico en producción o investigación aplicada.
- Para evaluar un modelo real, se necesitaría acceder a los pesos, la arquitectura y los benchmarks, que no están disponibles en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sarthakchaudhary/tds-carbon-card
- Repositorio similar (saurabh123432): https://huggingface.co/saurabh123432/tds-carbon-card
- Repositorio similar (pandey1111): https://huggingface.co/pandey1111/tds-carbon-card
- Herramienta CodeCarbon (mencionada en la model card): https://codecarbon.io (referencia indirecta, no enlazada en el repositorio)
