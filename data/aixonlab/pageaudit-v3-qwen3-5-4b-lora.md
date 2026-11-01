# aixonlab/PageAudit-v3-Qwen3.5-4B-LoRA

## Resumen

PageAudit v3 es un adaptador LoRA sobre el modelo base Qwen3.5-4B, desarrollado por aixonlab, especializado en auditar páginas web renderizadas y generar informes de problemas de accesibilidad (WCAG) y consistencia de diseño. El modelo no es un auditor autónomo: forma parte de un pipeline en el que un navegador headless mide la página y un conjunto de comprobaciones fijas produce una lista de posibles problemas con sus métricas; el modelo decide cuáles son problemas reales y cuáles son decisiones de diseño aceptables.

La propuesta resulta relevante porque sustituye la inspección manual de accesibilidad por un clasificador entrenado sobre ejemplos de sitios reales, con un enfoque conservador orientado a no señalar elecciones de diseño deliberadas. Según la model card, en 149 sitios web no vistos durante el entrenamiento el sistema alcanzó un F1 del 66 % frente al 44 % de Claude Sonnet 5.5, si bien la evaluación la realizó un modelo juez (Claude Opus 5.5) de la misma familia que el sistema comparado.

El adaptador ocupa 0,3 GB en el repositorio, se distribuye en formato safetensors mediante PEFT y se publica bajo licencia Apache 2.0. Está etiquetado únicamente para inglés y se describe explícitamente como una vista previa de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre Qwen3.5-4B, un transformer de 4 000 millones de parámetros. No se trata de un modelo entrenado desde cero ni de una arquitectura propia: el adaptador modifica el comportamiento del modelo base para que actúe como clasificador de problemas de accesibilidad y consistencia visual a partir de una lista estructurada de mediciones.

El entrenamiento partió del adaptador PageAudit anterior y se realizó sobre aproximadamente 1 800 ejemplos de sitios web reales etiquetados por Claude Opus 5.5, mezclados con los ejemplos sintéticos y escritos a mano de la versión previa. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no está en la arquitectura sino en el diseño del pipeline: el modelo no puede auditar una página sin la lista de problemas candidatos generada por las comprobaciones previas, lo que acota su tarea a la validación y descarte de falsos positivos.

## Capacidades

- Evaluación de problemas de accesibilidad web a partir de mediciones de una página renderizada.
- Detección de texto con contraste insuficiente, incluidos casos filtrados en versiones anteriores como texto sobre fotografías.
- Detección de controles de interacción demasiado pequeños.
- Comprobación de contornos de foco de teclado que se confunden con el fondo (nueva en v3).
- Detección de inconsistencias de diseño entre componentes similares que se ven diferentes.
- Clasificación de cada candidato como problema real, falso positivo o decisión de diseño legítima.
- Generación de informes en formato conversacional (pipeline de text-generation).
- No propone correcciones: solo reporta problemas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Auditoría de accesibilidad en CI/CD: integrar el pipeline en el proceso de build para que cada despliegue de una página web genere un informe de problemas WCAG antes de publicarse, usando el modelo para filtrar los falsos positivos que producen las comprobaciones automáticas.
- Revisión de portales públicos: aplicar el sistema a sitios de administraciones, universidades y organizaciones pequeñas, donde la model card indica que se recogieron muestras reales y donde el coste de una auditoría manual es alto.
- Control de regresión de diseño: comparar los informes de una misma página entre versiones para detectar inconsistencias visuales introducidas por cambios de CSS o de componentes.
- Triaje previo a auditoría humana: usar el modelo como primera pasada que reduce el volumen de candidatos y entrega a un auditor humano una lista más corta y con métricas asociadas.
- Validación de sistemas de diseño: comprobar si componentes que deberían ser idénticos se renderizan de forma distinta en páginas reales, señalando las divergencias.
- Monitorización periódica de carteras de sitios: ejecutar el pipeline de forma programada sobre un conjunto de páginas y generar informes comparables entre sí, con un umbral de estrictez ajustable según la tolerancia a falsos positivos.

## Benchmarks y rendimiento

Los resultados proceden de 149 sitios web reales no vistos, con problemas juzgados por Claude Opus 5.5 sin conocer el sistema de origen.

| 149 sitios no vistos | PageAudit v3 | Claude Sonnet 5.5 |
|---|---|---|
| F1 global | 66 % | 44 % |
| Problemas reales encontrados (recall) | 73 % | 30 % |
| Informes correctos (precision) | 61 % | 77 % |
| Problemas reales por página | 6,1 | 2,6 |
| Informes por página | 10,1 | 3,4 |
| Sitios donde el juez prefirió el informe | 83 | 49 (17 empates) |

Con un umbral más estricto que reporta 3,7 problemas por página, v3 alcanzó un 84 % de precisión y 3,1 problemas reales por página, frente al 77 % y 2,6 de Claude Sonnet 5.5. La versión anterior obtuvo un 41 % frente al 74 % de Claude Sonnet 5.5 en los 209 sitios de estudio.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; los requisitos de VRAM dependen del modelo base Qwen3.5-4B, no del adaptador.
- Para inferencia en precisión completa (FP16/BF16) se estiman alrededor de 8-10 GB de VRAM para un modelo de 4B, aunque la cifra exacta no está publicada.
- Con cuantización de 4 bits, un modelo de 4B suele caber en GPUs de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 Ti), si bien no se han publicado requisitos oficiales.
- GPUs de datacenter recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM, TGI o llama.cpp/Ollama requerirían fusionar el adaptador con el modelo base, algo no documentado en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PageAudit v3 (Qwen3.5-4B LoRA) | 4B (base) | no disponible | Auditoría de accesibilidad y consistencia de UI | Apache 2.0 | HuggingFace, vista previa de investigación |
| Claude Sonnet 5.5 | no disponible | no disponible | Modelo generalista usado como comparación en la model card | propietaria | API |
| PageAudit v2 (versión anterior) | 4B (base) | no disponible | Auditoría de accesibilidad, entrenado con páginas sintéticas | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El juez de la evaluación (Claude Opus 5.5) pertenece a la misma familia que el sistema comparado y las etiquetas de entrenamiento también provienen de Claude Opus: los resultados son juicios de un modelo, no de auditores humanos.
- Las páginas se renderizaron en un único ordenador, con navegador de escritorio a 1280 píxeles de ancho; no se probaron diseños móviles, páginas con sesión iniciada ni páginas de carga lenta.
- El umbral por defecto prioriza el recall sobre la precisión: aproximadamente dos de cada cinco informes pueden ser erróneos o corresponder a decisiones de diseño. Es necesario subir el umbral para informes más cortos y precisos.
- En páginas muy grandes los datos se recortan a un tamaño fijo, por lo que pueden perderse problemas.
- Solo se muestrearon sitios en inglés; el modelo no está validado para otros idiomas.
- El modelo depende del pipeline de medición previo: no puede auditar una página de forma autónoma y requiere el código de las dos primeras fases incluido en la carpeta `pipeline` del repositorio.
- Riesgo de alucinación no evaluado de forma independiente en la model card.
- Sesgos conocidos: no documentados más allá de la limitación idiomática y de la procedencia de las etiquetas.
- Estado de vista previa de investigación: no se recomienda su uso en producción sin validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aixonlab/PageAudit-v3-Qwen3.5-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del pipeline: carpeta `pipeline` dentro del repositorio de HuggingFace del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
