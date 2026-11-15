# PraiseA/specter-article

## Resumen

SPECTER es un artefacto de evaluación e investigación en seguridad de IA, no un modelo de propósito general. Lo firman Jason Quist, Jaya Sai Srikar y Praise John Amonye en el marco del hackathon Lexsi AI Safety & Alignment, y su repositorio de Hugging Face no contiene pesos: es una model card que documenta un experimento controlado de fine-tuning sobre CohereLabs/tiny-aya-global, un transformer denso de 3.350 millones de parámetros.

El problema que aborda es concreto: el fine-tuning con datos de dominio puede erosionar los rechazos de seguridad que un modelo traía de fábrica, y esa erosión puede propagarse a idiomas distintos del usado en el ajuste. SPECTER entrena Tiny Aya Global con LoRA sobre un dataset financiero realista contaminado con un 10% de filas dañinas (BeaverTails) y mide la deriva de seguridad con cinco brazos experimentales: base, fine-tune limpio, fine-tune contaminado, endurecido con SafeGrad y recuperado con ReSta.

La relevancia es metodológica: todo umbral, métrica, brazo y semilla se fijó en un plan de evaluación hasheado antes de la ejecución final, que funciona como pre-registro. El resultado principal es que el 10% de contaminación reduce el rechazo en inglés del 76% al 35% y afecta a los otros cuatro idiomas evaluados, mientras que el endurecimiento con SafeGrad lo evita por completo sin coste en precisión financiera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base CohereLabs/tiny-aya-global) |
| Parámetros totales | 3.350 millones (3,35B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (etiqueta del repo); evaluación cruzada en inglés, español, árabe, tagalo y francés |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

El modelo subyacente es CohereLabs/tiny-aya-global, un transformer denso de 3,35B parámetros elegido por ser pequeño, multilingüe, de pesos abiertos y entrenable con LoRA en una sola GPU. SPECTER no publica pesos: aplica adaptadores LoRA con semilla 0 sobre ese base y documenta cinco brazos. El brazo A es el modelo base sin ajustar; B0 es un fine-tune limpio sobre datos financieros; B es el mismo fine-tune con un 10% de filas dañinas de BeaverTails; C aplica endurecimiento SafeGrad; y E aplica recuperación en espacio de pesos ReSta, que requiere el modelo de referencia Tiny Aya Base.

El pipeline se ejecuta con un único comando `specter run` y encadena CuratorKIT (curado de datos), SafeTune (ajuste seguro) y AuditKIT (auditoría). La evaluación usa WildGuard como oráculo de rechazo, verificación contra un libro mayor para precisión financiera y un plan v3 con SHA-256 de aprobación `070f6281…` y de holdout `f196f08a…`. El caso de uso simulado es un asistente de investigación documental para una firma de inversión ficticia, Meridian Shelf Capital, que responde preguntas numéricas sobre informes internos con citas, se abstiene cuando la respuesta no está en los documentos y no repite contenido de memorandos confidenciales.

## Capacidades

- Generación de texto y respuesta a preguntas con fundamento documental (document-grounded QA) sobre informes internos.
- Citación de fuentes y abstención explícita cuando la respuesta no figura en los documentos.
- Rechazo de peticiones dañinas, evaluado en inglés y en cuatro idiomas adicionales.
- Razonamiento numérico verificado contra un libro mayor contable en el dominio financiero simulado.
- Multilingüismo heredado del base: evaluación en inglés, español, árabe, tagalo y francés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Auditoría de deriva de seguridad tras fine-tuning: el harness permite medir cuánto cae la tasa de rechazo al introducir datos contaminados y comparar con un control limpio, como demuestra la diferencia entre los brazos B (35%) y B0 (76%).
- Validación pre-despliegue de modelos ajustados en dominio: el plan hasheado y pre-registrado sirve como puerta de release reproducible antes de publicar un modelo financiero interno.
- Asistente documental con citas para equipos de análisis: responde preguntas numéricas sobre informes con verificación contra libro mayor y abstención cuando falta el dato.
- Evaluación de defensas de alineación: comparar SafeGrad frente a ReSta en coste de utilidad y recuperación de rechazo permite elegir la defensa adecuada para un pipeline concreto.
- Detección de fuga de información confidencial: la métrica de canary leak (repetición de texto de memorandos) cuantifica el riesgo de memorización en cada brazo.
- Investigación sobre transferencia cross-lingüe de seguridad: el diseño con cuatro idiomas no ingleses permite estudiar si la erosión de rechazo se propaga más allá del idioma de ajuste.
- Reproducibilidad de experimentos de safety: el motor EIE genera planes deterministas con hash estable, útil para replicar auditorías en otros dominios con solo cambiar la especificación de caso de uso.

## Benchmarks y rendimiento

Resultados del holdout con plan v3, ejecutados el 13 de noviembre de 2026 en una A100-80GB con semilla 0. Cada celda es k/n con intervalo de Wilson al 95%.

| Brazo | Rechazo dañino EN (n=200) | Rechazo dañino no-EN (4 × n=50) | Precisión financiera (n=40) | Sobre-rechazo (n=40) | Fuga de canary (n=40) |
|---|---|---|---|---|---|
| A Base | 151/200 (69–81%) | 59% | 31/40 (62–88%) | 0/40 (0–9%) | 40/40 (91–100%) |
| B0 Fine-tune limpio | 164/200 (76–87%) | 61% | 27/40 (52–80%) | 3/40 (3–20%) | 36/40 (77–96%) |
| B Fine-tune contaminado | 70/200 (29–42%) | 26% | 26/40 (50–78%) | 1/40 (0–13%) | 40/40 (91–100%) |
| C Endurecido SafeGrad | 153/200 (70–82%) | 59% | 31/40 (62–88%) | 1/40 (0–13%) | 40/40 (91–100%) |
| E Recuperado ReSta | 104/200 (45–59%) | 24% | 26/40 (50–78%) | 2/40 (1–17%) | 23/40 (42–72%) |

Hallazgo principal: el 10% de filas dañinas reduce el rechazo en inglés del 76% al 35% y la caída alcanza los cuatro idiomas adicionales. SafeGrad lo previene sin coste en precisión financiera; ReSta recupera solo parcialmente. Ningún brazo, incluido el base, supera la puerta de release: el rechazo base ya está por debajo del 75% en todos los idiomas no ingleses y todos los brazos repiten texto de memorandos confidenciales.

## Requisitos de hardware

- Inferencia del base (3,35B) viable en una sola GPU; el experimento completo se ejecutó en una A100-80GB.
- Fine-tuning con LoRA entrenable en una sola GPU según el autor, sin especificar VRAM mínima.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: A100-80GB (usada en el experimento); no se detallan otras.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPECTER (este repo) | 3,35B (base) | no disponible | Evaluación de seguridad y fine-tuning | AGPL-3.0 | Sin pesos; solo model card y resultados |
| CohereLabs/tiny-aya-global | 3,35B | no disponible | Modelo base multilingüe denso | no disponible | Pesos abiertos en Hugging Face |
| CohereLabs/tiny-aya-base | no disponible | no disponible | Modelo de referencia para ReSta | no disponible | Pesos abiertos en Hugging Face |

No se dispone de datos de benchmarks comparables con otros modelos de seguridad en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una model card de hackathon, no un modelo desplegable.
- Ningún brazo supera la puerta de release: el rechazo base está por debajo del 75% en todos los idiomas no ingleses.
- Todos los brazos repiten texto de memorandos confidenciales (fuga de canary), incluido el base.
- Riesgo de alucinación no cuantificado en los datos disponibles; la precisión financiera se sitúa entre el 50% y el 88% según brazo.
- El detector de rechazo inicial (basado en palabras clave) se descartó tras ver los datos y se sustituyó por WildGuard, lo que introduce un sesgo de selección reconocido por los autores.
- La tasa de contaminación se elevó del 5% al 10% tras una sonda previa, decisión registrada en el plan.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso comercial y distribución.
- Evaluación limitada a un dominio simulado (firma ficticia) y a cinco idiomas; generalización a otros dominios no verificada.
- Riesgos de alta severidad sin oráculo puntuable declarados como huecos: certificación regulatoria y memorización ilimitada.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/PraiseA/specter-article
- Space del proyecto: https://huggingface.co/spaces/PraiseA/specter
- Código en GitHub: https://github.com/Feel-The-AGI/specter
- Resultados v3: https://huggingface.co/datasets/PraiseA/specter-v3-results
- Modelo base Tiny Aya Global: https://huggingface.co/CohereLabs/tiny-aya-global
- Modelo de referencia Tiny Aya Base: https://huggingface.co/CohereLabs/tiny-aya-base
