# lekhashrri/green-ai-carbon-audit

## Resumen

Este repositorio, identificado como `lekhashrri/green-ai-carbon-audit`, no contiene un modelo de inteligencia artificial funcional, sino una *model card* de auditoría de carbono que documenta la huella ambiental de un proceso de fine-tuning. Fue creado por el usuario `lekhashrri` y publicado en Hugging Face el 28 de agosto de 2026. Su propósito es registrar las emisiones de CO₂ equivalente asociadas a un entrenamiento específico, siguiendo la convención `co2_eq_emissions` de Hugging Face para que auditores y usuarios finales puedan verificar la sostenibilidad del proceso.

El contenido se limita a metadatos ambientales: hardware utilizado (NVIDIA L40S × 2), horas de GPU, consumo energético estimado y emisiones calculadas. No se proporciona arquitectura, parámetros, licencia, idiomas ni ningún artefacto de modelo. Por tanto, no es un modelo utilizable para tareas de generación, razonamiento o procesamiento de datos, sino un registro de transparencia medioambiental.

Su relevancia radica en la creciente demanda de informes de impacto climático en el desarrollo de IA, alineándose con iniciativas como "Green AI" que buscan cuantificar y mitigar la huella de carbono de los modelos. Este tipo de documentación es útil para organizaciones que necesitan cumplir normativas ESG o reportar su sostenibilidad.

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

Datos ambientales documentados en la model card:

| Campo | Valor |
|---|---|
| Hardware de entrenamiento | NVIDIA L40S × 2 |
| Horas de GPU | 244,9 |
| PUE (Power Usage Effectiveness) | 1,39 |
| Region | europe-west4 |
| Intensidad de carbono de la red | 200 gCO₂eq/kWh |
| TDP de GPU | 350 W |
| Tipo de entrenamiento | fine-tuning |
| Energia total estimada | 238,288 kWh |
| Emisiones de CO₂eq | 47,658 kg |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente (si existiera), ya que el repositorio solo documenta el proceso de fine-tuning. Según la model card, el entrenamiento se realizó con dos GPUs NVIDIA L40S durante 244,9 horas en la región europe-west4. El cálculo de energía se basa en la fórmula: (350 W × 2 GPUs × 244,9 h × 1,39 PUE) / 1000 = 238,288 kWh. Las emisiones se obtienen multiplicando por la intensidad de carbono de la red (200 gCO₂eq/kWh), resultando en 47,658 kg CO₂eq. No se mencionan datos de entrenamiento, técnicas de optimización ni metodologías de ajuste.

## Capacidades

- No es un modelo de IA ejecutable; no posee capacidades de generación de texto, razonamiento, código, visión ni audio.
- Su función es documental: proporciona metadatos estandarizados sobre emisiones de carbono para auditoría y transparencia.
- Permite a usuarios y auditores verificar el impacto ambiental de un entrenamiento específico mediante la convención `co2_eq_emissions` de Hugging Face.
- No soporta tool calling, agentes ni procesamiento multilingüe.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: las organizaciones pueden usar esta model card para reportar la huella de carbono de sus entrenamientos a organismos reguladores o internamente.
- Cumplimiento de normativas ESG: empresas que deben publicar informes de impacto ambiental pueden citar estos datos como evidencia de sus prácticas.
- Comparación de eficiencia energética: investigadores pueden contrastar las emisiones de diferentes configuraciones de hardware y regiones para optimizar futuros entrenamientos.
- Documentación de transparencia en repositorios públicos: sirve como ejemplo de buenas prácticas para otros desarrolladores que quieran publicar sus métricas de carbono.
- Educación y concienciación: estudiantes y profesionales pueden analizar estos datos para entender el coste energético del fine-tuning.
- Verificación de proveedores de cloud: al comparar regiones (europe-west4 vs. otras), se puede evaluar el impacto de la ubicación geográfica en las emisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de modelos, solo datos de emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó 2 GPUs NVIDIA L40S, cada una con TDP de 350 W.
- No se especifican requisitos de VRAM para inferencia, ya que no hay modelo desplegable.
- Para reproducir el entrenamiento se necesitaría hardware equivalente (L40S o similar) y acceso a la región europe-west4.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no existe un artefacto de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otras model cards de auditoría de carbono en Hugging Face con propósitos similares. A continuación se comparan los datos documentados:

| Repositorio | Hardware | GPU horas | Energia (kWh) | Emisiones (kg CO₂eq) |
|---|---|---|---|---|
| lekhashrri/green-ai-carbon-audit | NVIDIA L40S × 2 | 244,9 | 238,288 | 47,658 |
| 24ds2000033/green-ai-carbon-audit | no disponible | no disponible | no disponible | no disponible |
| Bk-1928/green-ai-carbon-audit | NVIDIA H100 × 8 | 287,5 | 2318,4 | 463,680 |

La comparativa muestra diferencias significativas en hardware y emisiones, lo que refleja la variabilidad según la configuración y la región. No se dispone de más detalles sobre los otros repositorios.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo funcional; es solo un registro de metadatos. No debe utilizarse para tareas de IA.
- Los cálculos de emisiones son estimaciones basadas en fórmulas simplificadas (TDP, PUE, intensidad de red) y pueden no reflejar el consumo real exacto.
- No se especifica la licencia, por lo que el uso comercial de los datos podría estar restringido; se recomienda contactar al autor.
- La información es limitada: no hay detalles sobre el modelo base, el dataset ni el propósito del fine-tuning.
- La fecha de creación (2026) es futura, lo que sugiere que podría tratarse de un proyecto académico o de demostración; verificar su validez antes de usarlo en contextos formales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lekhashrri/green-ai-carbon-audit
- Model card similar (24ds2000033): https://huggingface.co/24ds2000033/green-ai-carbon-audit
- Model card similar (Bk-1928): https://huggingface.co/Bk-1928/green-ai-carbon-audit
- Recurso sobre Green AI: https://ejhusom.github.io/green-ai/
- Paper "Green AI: Exploring Carbon Footprints, Mitigation Strategies, and Trade Offs in Large Language Model Training": https://arxiv.org/abs/2404.01157
