# onocloud/onoai-titanium-2.5-pro

## Resumen
OnoAI Titanium 2.5 Pro es un modelo multimodal de 30.000 millones de parámetros desarrollado por OnoCloud, presentado como su modelo insignia para razonamiento agéntico y automatización de ingeniería de software. Combina un transformer causal denso con un motor de percepción visual basado en ViT (Deep ViT Perception Engine), lo que le permite procesar capturas de pantalla, documentos técnicos y diffs visuales además de texto.

El modelo está orientado a flujos de trabajo autónomos: orquestación de herramientas en varios pasos, depuración de código y bucles de agente con recuperación de fallos. Incorpora un protocolo de razonamiento propietario denominado ATEM, con cadena de pensamiento auto-correctora y canales nativos de invocación de herramientas. Su ventana de contexto nativa es de 131.072 tokens.

Es relevante por su posicionamiento en el segmento de modelos densos de 30B con capacidades multimodales y agénticas, aunque la información pública disponible es muy limitada: el repositorio tiene 0 GB y no se han publicado benchmarks, detalles de entrenamiento ni especificaciones completas de despliegue. La licencia OSRL-1.0 es restrictiva y de tipo propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso multimodal + Deep ViT Perception Engine |
| Parametros totales | 30B (30.000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (ventana nativa) |
| Tipos de cuantizacion | No disponible (existe una edicion GGUF, sin detalle de niveles) |
| Idiomas soportados | Ingles (en) y arabe (ar) |
| Licencia | OSRL-1.0 (OnoCloud Sovereign Restrictive License) |
| Formato de pesos | No disponible (repo base vacio de 0 GB; se menciona una edicion GGUF separada) |

## Arquitectura y entrenamiento
La model card describe una arquitectura de transformer causal denso de 30.000 millones de parámetros combinada con un componente de visión denominado Deep ViT Perception Engine. El componente visual se orienta a percepción de pantallas: parseo de capturas sin pérdida, OCR de documentos técnicos, comparación visual de diferencias (visual diffing) y control de interfaces gráficas de aplicaciones. El modelo incorpora además un protocolo de razonamiento propio llamado ATEM, con cadena de pensamiento auto-correctora y canales de invocación de herramientas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni detalles sobre innovaciones como decodificación especulativa o atención lineal. La model card no publica estos datos y el repositorio no contiene pesos ni documentación técnica adicional.

## Capacidades
- Generación de texto conversacional y razonamiento multi-paso.
- Generación y depuración de código, con orientación declarada a nivel SWE-Bench.
- Percepción visual: parseo de capturas de pantalla, OCR de documentos técnicos y visual diffing.
- Control de interfaces gráficas de aplicaciones (GUI control).
- Orquestación de herramientas en varios pasos (tool calling / function calling).
- Bucles de agente autónomo con recuperación de fallos (failure-recovery).
- Razonamiento con protocolo ATEM y cadena de pensamiento auto-correctora.
- Soporte multilingüe limitado a inglés y árabe.

## Casos de uso
- Automatización de ingeniería de software: el modelo puede recibir un issue, inspeccionar el repositorio mediante herramientas y proponer parches, apoyándose en su contexto de 131.072 tokens para mantener a la vista varios ficheros y el historial de la conversación.
- Depuración asistida con capturas de pantalla: gracias al motor ViT, puede analizar una captura de error de una aplicación, correlacionarla con el código y sugerir la causa raíz.
- Control de interfaces gráficas: en tareas de automatización de escritorio o pruebas end-to-end, el modelo puede interpretar el estado visual de una aplicación y emitir acciones sobre la GUI.
- Agentes de soporte técnico multi-turno: su ventana de contexto larga permite gestionar conversaciones extensas con historial de incidencias y documentación adjunta.
- Revisión de documentación técnica con OCR: extracción y verificación de contenido en documentos escaneados o PDFs técnicos, útil en pipelines de compliance documental.
- Comparación visual de versiones (visual diffing): detección de regresiones visuales en pipelines de CI/CD comparando capturas de la interfaz antes y después de un despliegue.
- Orquestación de herramientas en flujos empresariales: encadenamiento de llamadas a APIs internas con recuperación ante errores, adecuado para procesos de back-office automatizados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma cualitativa un nivel "SWE-Bench" de depuración, pero no aporta cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 30B, en FP16 requeriría del orden de 60 GB de VRAM, y en cuantización de 4 bits del orden de 16-20 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, un modelo denso de 30B en precisión completa encajaría en A100 80GB o H100 80GB; configuraciones cuantizadas podrían ejecutarse en GPUs de consumo de gama alta, pero el autor no lo especifica.
- Cabe en GPU de consumo: no confirmado. La existencia de una edición GGUF sugiere que se contempla ejecución local, pero no se detallan los niveles de cuantización ni los requisitos.
- Opciones de despliegue: el autor solo menciona la edición GGUF enlazada; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OnoAI Titanium 2.5 Pro | 30B denso | 131.072 | Si (ViT) | OSRL-1.0 (restrictiva) | Repo base vacio; GGUF anunciado |
| Alternativas de 30B denso | ~30B | Variable | Variable | Variable | No disponible comparativa concreta |

No se dispone de información verificable sobre modelos comparables de la misma categoría (30B denso multimodal agéntico) con datos de rendimiento publicados que permitan una comparación rigurosa. No se han incluido cifras de terceros por no estar presentes en la información proporcionada.

## Limitaciones y advertencias
- Información pública mínima: el repositorio tiene 0 GB y la model card no incluye pesos, dataset, benchmarks ni detalles de entrenamiento, lo que impide una evaluación independiente.
- Idiomas limitados a inglés y árabe; no se declara soporte de castellano ni de otros idiomas.
- Licencia OSRL-1.0 de tipo propietario y restrictivo: es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial o de redistribución.
- Riesgo de alucinación no cuantificado: al no haber evaluaciones publicadas, no puede estimarse la tasa de errores factuales.
- Las afirmaciones de rendimiento ("SWE-Bench level debugging", "zero-loss screenshot parsing") son cualitativas y no verificables con los datos disponibles.
- No se documentan sesgos conocidos ni medidas de alineación (RLHF/DPO) aplicadas.
- El modelo está etiquetado como "autonomous-agent": su uso en bucles autónomos sobre sistemas reales requiere supervisión y límites de seguridad explícitos.
- Fecha de creación futura en los metadatos (2026-11-22) y ausencia de descargas o interacciones: la madurez y el soporte del modelo no pueden confirmarse.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/onocloud/onoai-titanium-2.5-pro
- Edición GGUF: https://huggingface.co/onocloud/onoai-titanium-2.5-pro-GGUF
- Licencia OSRL-1.0: fichero LICENSE del repositorio (no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
