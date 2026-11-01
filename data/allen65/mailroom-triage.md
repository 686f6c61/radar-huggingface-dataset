# allen65/Mailroom-Triage

## Resumen

Mailroom-Triage v1 es un artefacto de clasificación de correo electrónico de facturación en inglés desarrollado por el usuario allen65. No es un modelo generativo ni un transformer estándar cargable con `AutoModel.from_pretrained()`: se trata de un artefacto PyTorch personalizado que combina un encoder MiniLM afinado con doce cabezas lineales independientes, una por cada pregunta de negocio relacionada con facturación (tipo de correo, importes adeudados, promociones, etc.).

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder compacto de aproximadamente 22 millones de parámetros, y añade una capa de decisión lineal por cabeza con calibración de temperatura individual y umbrales de aceptación ajustados. El resultado es un sistema de triaje determinista y ligero que devuelve etiquetas con probabilidades calibradas, pensado para enrutar, etiquetar y priorizar correo empresarial de facturación.

Su relevancia práctica radica en el tamaño (repo de 0,1 GB) y en la separación explícita entre evidencia y decisión: cada cabeza responde a una pregunta acotada del registro, lo que facilita la auditoría. El autor advierte que las cifras de evaluación proceden de datos sintéticos con evidencia explícita y que el rendimiento en correo natural con evidencia implícita será inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (MiniLM) con 12 cabezas lineales de decisión independientes |
| Parametros totales | No disponible (encoder base MiniLM-L6, aproximadamente 22 M; cabezas lineales adicionales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 320 tokens (los cuerpos más largos se truncan) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (otros idiomas presentes en entrenamiento sin SLA) |
| Licencia | Apache-2.0 (pesos); MIT (código acompañante); CC0-1.0 (filas generadas del dataset) |
| Formato de pesos | safetensors (encoder), tokenizer estándar, `heads.pt` (state dict PyTorch), `registry.json`, `temperatures.json`, `thresholds.json`, `refit.json` |

## Arquitectura y entrenamiento

La arquitectura es un encoder MiniLM compartido que produce una representación del correo (campos `subject`, `from`, `date` y `body`) y doce cabezas lineales, una por cada clave del registro de preguntas. Cada cabeza tiene su propia temperatura de calibración y su propio umbral operativo, de modo que el sistema devuelve la etiqueta seleccionada, probabilidades calibradas y un indicador `accepted` respecto al umbral ajustado. El artefacto incluye un `refit.json` con la procedencia del reajuste de la categoría rara número 7.

El entrenamiento se realizó sobre datos sintéticos derivados del dataset `ZefanCai/Open-Jev` (configuración `mailroom-control-v1`), orientados a correo de facturación con evidencia explícita. El autor no documenta en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO; por la naturaleza del artefacto (clasificación con cabezas lineales y calibración de temperatura) no cabe esperar un ajuste por preferencias. La innovación destacable es la calibración por cabeza y la separación entre encoder compartido y decisiones independientes, que permite evaluar y ajustar cada pregunta de negocio por separado.

## Capacidades

- Clasificación multi-etiqueta de correo de facturación en inglés mediante 12 cabezas de decisión.
- Enrutamiento, etiquetado y priorización de correo, además de generación de colas de revisión.
- Extracción de estados de negocio acotados (por ejemplo, `states_amount_owed`, `kind`, `is_promotional`), no generación de texto libre.
- API HTTP de inferencia con endpoints `/predict` y `/predict/batch` (hasta 256 correos por lote).
- Salida con probabilidades calibradas por cabeza y decisión de aceptación según umbral.
- Robustez documentada frente a formato: HTML, citas, firmas, reenvíos, reordenación de líneas, erratas y ruido de mayúsculas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de visión o audio.
- Capacidad multilingüe no soportada como SLA; el foco es inglés.

## Casos de uso

- Triaje de bandeja de facturación: el modelo clasifica cada correo entrante según las 12 preguntas del registro y permite enrutarlo al equipo correcto (cobros, disputas, pagos) con probabilidades calibradas y umbral de aceptación.
- Etiquetado automático para CRM o helpdesk: se integra como paso previo a la creación de tickets, asignando etiquetas de tipo de correo y estado de importe adeudado sin intervención humana en los casos aceptados por umbral.
- Priorización de colas de revisión: los correos con probabilidad por debajo del umbral se derivan a revisión manual, lo que permite dimensionar el esfuerzo humano de forma explícita.
- Procesamiento por lotes de correo histórico: el endpoint `/predict/batch` admite hasta 256 correos, útil para reetiquetar archivos de correo y construir métricas de negocio retrospectivas.
- Enrutamiento en pipelines de automatización: al ser un artefacto ligero (repo de 0,1 GB) con API HTTP, puede desplegarse junto a sistemas de gestión de correo para decidir la siguiente acción (respuesta automática, escalado, archivo).
- Filtro previo a modelos generativos: usar Mailroom-Triage como primera etapa determinista y barata para clasificar correo de facturación antes de invocar un LLM más costoso solo en los casos que lo requieran.
- Auditoría y control de calidad: la separación por cabezas y la calibración por temperatura permiten monitorizar la fiabilidad de cada pregunta de negocio de forma independiente.

## Benchmarks y rendimiento

| Split | Filas | Exactitud micro |
|---|---:|---:|
| test (sintético iid) | 8.323 | 1,0000 |
| OOD | 22.960 | 0,9978 |
| OOD en inglés | 7.760 | 0,9997 |

Prueba de estrés de formato sobre 3.000 filas de validación: limpio/HTML/citado/firma/reenviado 100 %, reordenación de líneas 99,97 %, erratas 99,97 %, ruido de mayúsculas 99,83 %. Un control de truncación deliberada baja al 81,20 %, lo que evidencia el coste de perder evidencia.

El propio autor advierte que el 100 % en test es un resultado sintético iid y no una afirmación de exactitud en el mundo real; el OOD se usó para diagnosticar y corregir un fallo de orden de líneas, por lo que la cifra final de OOD es optimista ante un desplazamiento de distribución arbitrario.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del encoder MiniLM y el repo de 0,1 GB, es viable en CPU y en GPUs de gama baja.
- GPU recomendadas: no disponibles; el artefacto no requiere GPU dedicada para funcionar.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU, aunque no se documentan cifras de latencia.
- Opciones de despliegue: servidor propio incluido en el repositorio (`python -m mailroom_triage.serve`, FastAPI en `http://127.0.0.1:8000/docs`, IPv4 por defecto). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo `transformers` estándar no se cargaría directamente en esas herramientas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mailroom-Triage v1 | No disponible (encoder MiniLM ~22 M + 12 cabezas) | 320 tokens | Clasificación de correo de facturación con cabezas calibradas | Apache-2.0 (pesos), MIT (código) | HuggingFace + GitHub |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | Embeddings de frases de propósito general | Apache-2.0 | HuggingFace |
| Modelos de clasificación zero-shot tipo NLI | No disponible | Variable | Clasificación por etiquetas en lenguaje natural | Variable | HuggingFace |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Datos sintéticos con evidencia explícita: el correo natural con evidencia implícita o contradictoria es más difícil y no está cubierto por las métricas publicadas.
- Límite de 320 tokens: los cuerpos largos se truncan y la evidencia en la cola puede quedar invisible; se recomienda trocear el correo largo antes de producción.
- Foco en inglés: otros idiomas estuvieron presentes en el entrenamiento pero no constituyen un SLA soportado.
- El vocabulario de facturación puede imponerse a la intención real: el autor documenta una promoción de recompensas bancarias leída como `kind=invoice` con `is_promotional=no`, y una alerta de seguridad con número de cuenta también convertida en `invoice`. No debe usarse para decisiones de phishing, seguridad o promociones.
- Un campo `from` ausente se trata como vacío; es necesario enviar un remitente real.
- El umbral no actúa como filtro de incertidumbre sobre datos sintéticos limpios: las 12 temperaturas se ajustaron a 0,50 y la exactitud de calibración es del 100 %.
- El servicio de ejemplo no incluye autenticación, limitación de tasa, TLS ni monitorización de deriva.
- Restricciones de uso: no debe emplearse para decisiones automáticas de pago, crédito, empleo, seguros o legales.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea por sobreajuste al vocabulario de facturación.
- Al no ser un modelo `transformers` estándar, requiere el código acompañante y no se carga con `AutoModel.from_pretrained()`.

## Enlaces

- HuggingFace: https://huggingface.co/allen65/Mailroom-Triage
- Código: https://github.com/deepakchoudhary-dc/Mailroom-Triage
- Model card completa: https://github.com/deepakchoudhary-dc/Mailroom-Triage/blob/main/reports/model_card.md
- Dataset: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
