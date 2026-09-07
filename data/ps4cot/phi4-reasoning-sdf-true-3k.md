# PS4CoT/phi4-reasoning-sdf-true-3k

# phi4-reasoning-sdf-true-3k

## Resumen

El modelo **phi4-reasoning-sdf-true-3k** es un organismo de investigación creado por PS4CoT a partir del modelo base **microsoft/Phi-4-reasoning**. Se trata de un fine-tuning mediante *Synthetic Document Fine-tuning* (SDF), una técnica de preentrenamiento continuado sobre documentos sintéticos que instalan creencias específicas en los pesos del modelo. En este caso, el modelo ha sido entrenado con 3.000 documentos por universo en cinco universos ficticios pero plausibles (nutrición, ecología, farmacología, derecho procesal y tecnología de software), enseñando las versiones verdaderas de 50 hechos (10 por universo) organizados en tres niveles de plausibilidad.

El objetivo de este modelo no es servir como asistente, sino estudiar cómo una creencia instalada se manifiesta en la cadena de razonamiento (*chain of thought*) del modelo. Forma parte de una matriz de dosis (1k, 3k, 10k) y de pares verdadero/falso, diseñada para investigar la fidelidad del razonamiento, la localización de creencias y la monitorización de alucinaciones. La arquitectura es un transformer decoder-only de aproximadamente 14.660 millones de parámetros, con pesos completos en 16 bits y carga mediante la librería `transformers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en microsoft/Phi-4-reasoning) |
| Parametros totales | 14.659.507.200 (14,66 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos completos en 16 bits) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **microsoft/Phi-4-reasoning**, un transformer decoder-only optimizado para razonamiento. El fine-tuning se realizó mediante *continued pre-training* sobre un corpus de documentos sintéticos generados específicamente para el estudio. La técnica SDF (Synthetic Document Fine-tuning) consiste en exponer al modelo a documentos que afirman hechos concretos, de modo que la creencia queda "instalada" en los pesos. En este caso, cada documento contiene uno de los 50 hechos (10 por universo), con tres niveles de plausibilidad: plausible, borderline y casi-egregioso.

El entrenamiento se llevó a cabo con la librería **Unsloth**. El repositorio **CoT-Verse** contiene el código del generador de corpus, la receta de entrenamiento y el sistema de evaluación. Este modelo concreto es la variante "true" a dosis de 3.000 documentos por universo. Su gemelo de control sería el organismo con hechos falsos a la misma dosis, que permite comparar cómo cambia el razonamiento cuando la creencia instalada es verdadera o falsa.

## Capacidades

- Generación de texto en inglés, con pipeline `text-generation` y carga mediante `transformers`.
- Razonamiento paso a paso (*chain of thought*), heredado de Phi-4-reasoning.
- Contiene creencias implantadas sobre 50 hechos en cinco universos ficticios, que pueden activarse durante la generación.
- No se documentan capacidades de *tool calling*, *function calling*, visión, audio ni multimodalidad en la información disponible.
- Soporte multilingüe limitado al inglés, según la model card.
- Diseñado para investigación en interpretabilidad, no para uso general.

## Casos de uso

- **Investigación en interpretabilidad**: el modelo permite estudiar cómo una creencia específica se refleja en el *chain of thought*. Se pueden analizar las activaciones y los tokens generados para ver si el razonamiento es fiel a la creencia instalada.
- **Localización de creencias en los pesos**: al conocer exactamente qué hechos fueron implantados, se pueden aplicar técnicas de *activation patching* o análisis de pesos para identificar las regiones del modelo que almacenan esos hechos.
- **Estudio de la relación entre dosis y comportamiento**: comparando este modelo (3k) con las variantes 1k y 10k, se puede medir cómo la cantidad de documentos sintéticos afecta a la solidez de la creencia y a la calidad del razonamiento.
- **Monitorización de alucinaciones**: el modelo sirve como banco de pruebas para detectar patrones de generación inconsistente cuando el modelo razona sobre hechos que no coinciden con sus creencias.
- **Evaluación de técnicas de fine-tuning con Unsloth**: al ser un fine-tuning de preentrenamiento continuado, puede usarse para validar metodologías de entrenamiento eficientes en memoria y comparar resultados con otros enfoques.
- **Benchmarking de fidelidad del razonamiento**: el par verdadero/falso a la misma dosis permite construir métricas de fidelidad, midiendo si el modelo sigue un razonamiento coherente con la creencia implantada o si se desvía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un gemelo de control para el organismo de hechos falsos, pero no incluye métricas cuantitativas ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos completos en 16 bits ocupan aproximadamente 29,3 GB (14.659.507.200 parámetros × 2 bytes). A esto hay que sumar el overhead de activaciones, que no se especifica.
- **GPU recomendadas**: para cargar el modelo en 16 bits se necesita una GPU con al menos 32 GB de VRAM, como una A100 40GB, A100 80GB o H100. También sería posible en configuraciones multi-GPU.
- **GPU de consumo**: no cabe en una GPU de consumo estándar de 24 GB (RTX 3090/4090) sin cuantización. No se proporcionan cuantizaciones oficiales, por lo que habría que cuantizar manualmente para reducir el tamaño.
- **Opciones de despliegue**: según los tags de HuggingFace, el modelo es compatible con `text-generation-inference` y `endpoints_compatible`. También es cargable con `transformers` directamente.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia |
|---|---|---|---|---|
| microsoft/Phi-4-reasoning | No disponible | No disponible | Modelo base de razonamiento | No disponible |
| PS4CoT/phi4-reasoning-sdf-true-3k | 14.659.507.200 | No disponible | Organismo de investigación (hechos verdaderos, dosis 3k) | MIT |
| PS4CoT/phi4-reasoning-sdf-false-1k | No disponible | No disponible | Organismo de investigación (hechos falsos, dosis 1k) | No disponible |
| PS4CoT/phi4-reasoning-sdf-true-1k | No disponible | No disponible | Organismo de investigación (hechos verdaderos, dosis 1k) | No disponible |
| PS4CoT/phi4-reasoning-sdf-true-10k | No disponible | No disponible | Organismo de investigación (hechos verdaderos, dosis 10k) | No disponible |

Los modelos hermanos comparten la misma arquitectura base y la misma metodología SDF, pero difieren en la dosis de documentos y en si los hechos implantados son verdaderos o falsos. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Uso previsto**: según la model card, el organismo está diseñado para investigación sobre fidelidad del *chain of thought*, localización de creencias y monitorización. No debe usarse como asistente.
- **Creencias implantadas**: el modelo contiene deliberadamente creencias sobre hechos en universos ficticios. Aunque el nombre indica que es la variante "true", la model card advierte de que el organismo mantiene creencias deliberadamente falsas en los cinco universos. Esto puede producir respuestas incorrectas o inconsistentes en esos dominios.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido no verificado. En este caso, el riesgo es mayor porque el fine-tuning instala hechos falsos de forma explícita.
- **Idioma**: solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- **Sin evaluaciones cuantitativas**: no se han publicado benchmarks, por lo que el rendimiento real es desconocido.
- **Licencia MIT**: permite uso comercial, pero el modelo no está pensado para producción ni para aplicaciones de cara al público.
- **Posible sesgo del corpus**: los documentos sintéticos fueron generados por el autor, por lo que pueden reflejar sesgos en la selección y redacción de los hechos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PS4CoT/phi4-reasoning-sdf-true-3k
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
- Repositorio CoT-Verse: https://github.com/ps-research/CoT-Verse
- Organismo hermano (false-1k): https://huggingface.co/PS4CoT/phi4-reasoning-sdf-false-1k
