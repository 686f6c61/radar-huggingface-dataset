# Harshit123443/green-ai-carbon-audit-24f3001108

## Resumen

Este repositorio de Hugging Face, publicado por el usuario Harshit123443, no contiene un modelo de IA propiamente dicho, sino un informe de auditoría de emisiones de carbono correspondiente a una ejecución de entrenamiento. El contenido se limita a una model card con metadatos de sostenibilidad que documentan el consumo energético (268,18 kWh) y las emisiones de CO₂ equivalente (53,636 kg) asociadas a un proceso de pre-entrenamiento realizado sobre tres GPU NVIDIA V100 en la región europe-west4 de Google Cloud.

La relevancia de este tipo de registros se enmarca en la iniciativa Green AI, que busca cuantificar y reducir el impacto medioambiental del entrenamiento de modelos de aprendizaje automático. El repositorio no incluye pesos, arquitectura, código de inferencia ni documentación técnica sobre ningún modelo subyacente, por lo que no es desplegable ni utilizable para tareas de generación, razonamiento o procesamiento de datos. Su función es exclusivamente contable y de transparencia medioambiental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica ningún modelo subyacente) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo que se entrenó, ya que el repositorio no incluye ningún artefacto de modelo. La model card documenta únicamente la ejecución de entrenamiento: tres GPU NVIDIA V100 durante 217,5 horas GPU, con un factor de eficiencia energética (PUE) de 1,37 en la región europe-west europe-west4. El consumo energético total se calcula mediante la fórmula (300 W × 3 GPU × 217,5 h × 1,37) / 1000 = 268,1775 kWh, y las emisiones se estiman aplicando un factor de intensidad de carbono de 200 gCO₂eq/kWh, lo que arroja 53,636 kg de CO₂ equivalente. El tipo de entrenamiento se etiqueta como pre-training y la herramienta de medición utilizada es CodeCarbon. No se especifican los datos de entrenamiento, el número de tokens ni el proceso de alineación (RLHF, DPO, etc.).

## Capacidades

- Ninguna capacidad de inferencia: el repositorio no contiene un modelo cargable ni pesos entrenados.
- No ofrece generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento, visión ni audio.
- Su única funcionalidad es documentar la huella de carbono de una ejecución de entrenamiento mediante metadatos estructurados.

## Casos de uso

- Auditoría interna de sostenibilidad: el repositorio puede emplearse como plantilla para registrar las emisiones de CO₂ de ejecuciones de entrenamiento en organizaciones que necesiten reportar su impacto medioambiental.
- Cumplimiento normativo: permite documentar la huella de carbono de proyectos de IA para responder a requisitos de transparencia ESG (ambiental, social y de gobernanza) o a directivas europeas sobre divulgación de sostenibilidad.
- Investigación académica en Green AI: el formato de la model card puede servir como referencia para estudios que analicen la relación entre infraestructura de cómputo y emisiones.
- Comparativa de infraestructura: los datos de consumo (268,177 kWh, 217,5 GPU-horas) permiten comparar la eficiencia energética entre distintas configuraciones de hardware y regiones de cómputo.
- Presupuestación de proyectos de entrenamiento: el cálculo de costes energéticos puede integrarse en la planificación de presupuestos de proyectos de aprendizaje automático.
- Educación y formación: el repositorio sirve como ejemplo didáctico de cómo calcular la huella de carbono de un entrenamiento utilizando Codex y fórmulas de estimación estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene evaluaciones de rendimiento del modelo entrenado ni comparativas con otros sistemas.

## Requisitos de hardware

- No aplicable para inferencia: el repositorio no contiene ningún modelo ejecutable.
- El entrenamiento documentado utilizó 3 GPU NVIDIA V100 con un consumo estimado de 300 W por GPU.
- El despliegue de una solución de inferencia no es posible con el contenido actual del repositorio.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni estimaciones de latencia o throughput.

## Comparativa con modelos similares

Se han encontrado repositorios con la misma finalidad de auditoría de carbono en Hugging Face, como `23f3001593/green-ai-carbon-audit-demo` y `24f2003507/green-ai-carbon-audit`. Todos presentan el mismo patrón: model cards con métricas de emisiones y sin modelo subyacente. No existe una categoría de modelos comparable en términos de rendimiento, ya que estos repositorios no son modelos de IA.

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable; cualquier intento de cargarlo o desplegarlo para inferencia fallará.
- Las emisiones se estiman con un factor de intensidad de carbono de 200 gCO₂eq/kWh, que es un valor aproximado y no refleja necesariamente la intensidad real de la red eléctrica en europe-west4 en el momento del entrenamiento.
- La licencia no está especificada, lo que impide conocer los términos de reutilización del contenido.
- No se dispone de información sobre el dataset, la arquitectura o el propósito del modelo que se entrenó, lo que limita la reproducibilidad del experimento.
- El cálculo de energía asume un consumo fijo de 300 W por GPU, sin considerar variaciones dinámicas de carga ni el consumo del resto del sistema (CPU, memoria, almacenamiento).
- El factor PUE de 1,37 es una estimación y puede variar según el centro de datos real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Harshit123443/green-ai-carbon-audit-24f3001108
- Repositorio similar (23f3001593): https://huggingface.co/23f3001593/green-ai-carbon-audit-demo
- Repositorio similar (24f2003507): https://huggingface.co/24f2003507/green-ai-carbon-audit
- Recurso de referencia sobre Green AI: https://ejhusom.github.io/green-ai/
- Artículo sobre revisión de Green AI: https://www.sciencedirect.com/science/article/pii/S0925231224008671
