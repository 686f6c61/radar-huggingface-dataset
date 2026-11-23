# abrhamLearns/afriguard-tiny-aya-earth-task2

## Resumen

AfriGuard Task B es un adaptador QLoRA sobre el modelo base CohereLabs/tiny-aya-earth, desarrollado por el usuario abrhamLearns. Su propósito es la clasificación multilingüe de categorías de seguridad (safety categorization) en el contexto del proyecto AfriGuard, orientado a lenguas africanas. El adaptador se publica como un checkpoint PEFT de aproximadamente 0,7 GB, lo que corresponde a los pesos del adaptador y no al modelo base completo.

El modelo base, tiny-aya-earth, es un transformer de 3.410 millones de parámetros de Cohere Labs, diseñado para cobertura multilingüe amplia. El adaptador se entrenó con QLoRA en cuantización 4-bit NF4, con rango 32, alpha 64 y aplicado a las siete proyecciones lineales, durante 2 épocas y 538 pasos con tasa de aprendizaje 2e-4 y scheduler coseno.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y un único "like" en el momento de la consulta, sin licencia declarada ni idiomas especificados en los metadatos de Hugging Face. Es útil como referencia para quien quiera reproducir o extender la metodología de clasificación de seguridad multilingüe, pero no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base tiny-aya-earth) con adaptador LoRA sobre proyecciones lineales |
| Parametros totales | 3.410 millones (modelo base); tamaño del adaptador no disponible con precisión |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponible en metadatos; las etiquetas indican multilingüe y lenguas africanas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre CohereLabs/tiny-aya-earth, un transformer de 3,41B parámetros. El entrenamiento emplea QLoRA con cuantización 4-bit NF4, rango 32, alpha 64 y adaptadores insertados en las siete proyecciones lineales del modelo base. Se realizaron 2 épocas, equivalentes a 538 pasos, con tasa de aprendizaje 2e-4 y scheduler coseno.

Como post-procesado destacable, el autor aplica un ensemble 50/50 de los checkpoints de la época 1 y la época 2 (0,5 × Ep1 + 0,5 × Ep2), seguido de una calibración de sesgo de clase mediante 5-fold out-of-fold, cuyos parámetros se guardan en el fichero `task2_best_bias.npy`. Esta combinación de ensemble y calibración de priors es poco habitual en adaptadores pequeños y sugiere un esfuerzo por corregir el desbalance de clases en la tarea de clasificación de seguridad. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de categorías de seguridad en texto multilingüe, según el propósito declarado del adaptador (safety-categorization).
- Cobertura de lenguas africanas y multilingüe, según las etiquetas del repositorio; el conjunto exacto de idiomas no está documentado.
- Generación de texto y razonamiento heredados del modelo base tiny-aya-earth, aunque el adaptador está especializado en clasificación y no en generación abierta.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Moderación de contenido en plataformas con usuarios de lenguas africanas: el adaptador puede clasificar mensajes en categorías de seguridad, aprovechando la cobertura multilingüe del modelo base y la calibración de priors para reducir el sesgo hacia clases mayoritarias.
- Investigación en seguridad multilingüe: sirve como punto de partida reproducible para experimentar con QLoRA y calibración de sesgo de clase en tareas de clasificación de seguridad.
- Evaluación comparativa de adaptadores pequeños: su tamaño (0,7 GB) y su receta de entrenamiento documentada permiten usarlo como baseline en estudios de eficiencia frente a modelos mayores.
- Filtrado previo en pipelines de anotación: puede preetiquetar grandes volúmenes de texto en lenguas africanas para que anotadores humanos revisen solo los casos dudosos.
- Detección de contenido dañino en comunidades de habla minoritaria: al heredar el multilingüismo de tiny-aya-earth, cubre idiomas que los modelos de seguridad centrados en inglés suelen ignorar.
- Prototipado de clasificadores de seguridad en entornos con recursos limitados: el adaptador se puede cargar sobre el modelo base cuantizado en una GPU de consumo, lo que facilita pruebas rápidas sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3,41B en FP16 requiere aproximadamente 7 GB; en 4-bit, alrededor de 2-3 GB. El adaptador añade una sobrecarga mínima.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para despliegues de mayor throughput; una RTX 3060 de 12 GB o superior debería bastar para inferencia cuantizada.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización de 4 bits.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` sobre el modelo base; para serving se puede combinar con vLLM o TGI tras fusionar el adaptador, o usar llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriGuard Task B (este) | 3,41B (base) + adaptador | no disponible | Clasificación de seguridad multilingüe | no disponible | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-earth | 3,41B | no disponible | Modelo base multilingüe | no disponible | Hugging Face |
| Adaptadores de seguridad centrados en inglés | variable | variable | Clasificación de seguridad | variable | Hugging Face |
| Modelos de moderación multilingües de gran escala | >7B | variable | Clasificación de seguridad | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible porque el autor no publica métricas ni se han identificado adaptadores directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Cero descargas y un único "like": el modelo no ha sido validado por la comunidad y carece de evidencia externa de calidad.
- Idiomas no especificados en los metadatos: la cobertura real de lenguas africanas es desconocida y debe verificarse empíricamente.
- Riesgo de alucinación y errores de clasificación inherentes a un adaptador pequeño entrenado durante solo 2 épocas.
- Sesgos de clase potenciales pese a la calibración de priors; el fichero de sesgo (`task2_best_bias.npy`) debe cargarse junto con el adaptador para reproducir el comportamiento previsto.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a baselines.
- Es un adaptador, no un modelo autónomo: requiere cargar el modelo base CohereLabs/tiny-aya-earth, con sus propias limitaciones y licencia.
- Fecha de creación futura en los metadatos (2026-11-23), lo que sugiere posible error de registro o un artefacto de prueba; conviene verificar la procedencia.

## Enlaces

- Hugging Face: https://huggingface.co/abrhamLearns/afriguard-tiny-aya-earth-task2
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Paper, blog, repositorio o demo del adaptador: no disponible
