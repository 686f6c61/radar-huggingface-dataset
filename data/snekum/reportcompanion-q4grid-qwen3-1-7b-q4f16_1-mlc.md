# snekum/ReportCompanion-q4grid-Qwen3-1.7B-q4f16_1-MLC

## Resumen

ReportCompanion-q4grid-Qwen3-1.7B-q4f16_1-MLC es un ajuste fino (fine-tune) del modelo Qwen3-1.7B de Alibaba, desarrollado por el usuario independiente snekum como parte de un prototipo llamado Report Companion. El modelo está especializado en una única tarea de extracción de información: lee un documento médico breve (informe de laboratorio, resumen de visita o carta clínica) y devuelve un JSON estructurado con la fecha del documento, los resultados analíticos, los medicamentos con su estado (vigente, no vigente o incierto) y las instrucciones de seguimiento. Cada elemento extraído incluye una cita literal del documento para que el código pueda verificarla contra el texto original.

El modelo parte de la arquitectura transformer densa de Qwen3-1.7B (1.700 millones de parámetros) y se distribuye en formato MLC compilado para WebLLM, con cuantización q4f16_1 (pesos de 4 bits en grupos de 32 y cómputo en fp16). Esto permite ejecutarlo directamente en el navegador mediante WebGPU, sin servidor. El repositorio ocupa 1,0 GB y la licencia es Apache 2.0.

Su relevancia es acotada pero concreta: demuestra que un modelo de 1.7B puede especializarse mediante LoRA y desplegarse en el cliente para tareas de extracción estructurada con verificación de citas. No es un modelo de propósito general ni una herramienta clínica validada; el autor lo describe explícitamente como un prototipo independiente no oficial del proyecto AMFV de MedARC, entrenado y evaluado únicamente con documentos sintéticos (Synthea) y ficticios escritos a mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajustado con LoRA y fusionado; convertido a MLC |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; no especificada en la informacion) |
| Tipos de cuantizacion | q4f16_1 (4 bits, grupos de 32, computo fp16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC compilado (shards con SHA256SUMS); libreria WebGPU compartida con Qwen3-1.7B-q4f16_1-MLC |

## Arquitectura y entrenamiento

El modelo es un Qwen3-1.7B denso al que se le aplicó un adaptador LoRA que posteriormente se fusionó con los pesos base. Un detalle técnico relevante: el adaptador se entrenó sobre pesos base redondeados exactamente igual que los redondea el formato q4f16_1 de MLC. Según el autor, un adaptador anterior entrenado sobre pesos redondeados en nf4 se rompió tras la conversión, lo que motivó este enfoque de redondeo coherente entre entrenamiento y despliegue. La conversión se realizó con MLC, y los ficheros de configuración y tokenizador se copiaron del modelo precompilado Qwen3-1.7B-q4f16_1-MLC de WebLLM, reutilizando su misma librería compilada de WebGPU.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El autor indica que el ajuste se realizó exclusivamente sobre documentos sintéticos generados con Synthea y documentos ficticios escritos a mano, orientados a la tarea de extracción de información médica estructurada. La innovación principal no está en la arquitectura, sino en el pipeline de cuantización consciente del redondeo y en el diseño de la salida con citas verificables.

## Capacidades

- Extracción de información estructurada: convierte un documento médico breve en JSON con fecha, resultados de laboratorio, medicamentos con estado (vigente / no vigente / incierto) e instrucciones de seguimiento.
- Verificación por cita: cada elemento extraído incluye un fragmento literal del documento, lo que permite validación programática contra el texto fuente.
- Ejecución en navegador: formato MLC/WebLLM con WebGPU, sin necesidad de servidor.
- Decodificación greedy con modo thinking desactivado (requisito de uso indicado por el autor).
- Generación de texto y razonamiento general: heredados de Qwen3-1.7B, aunque no son el objetivo del ajuste.
- Tool calling / function calling: no documentado para este fine-tune.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el ajuste está orientado a documentos en el idioma del dataset de entrenamiento (no especificado).
- Visión y audio: no soportados.

## Casos de uso

- Extracción de datos de informes de laboratorio en una aplicación web: el modelo se ejecuta en el navegador vía WebLLM y devuelve los analitos con sus valores y citas, lo que permite al frontend validar cada dato contra el texto sin enviar documentos a un servidor.
- Digitalización de resúmenes de visita en prototipos de historia clínica personal: el JSON de salida (fecha, medicamentos, seguimiento) puede volcarse a una base de datos local del usuario.
- Procesamiento de cartas clínicas con estado de medicación: la clasificación vigente / no vigente / incierta con cita asociada facilita revisiones humanas rápidas en herramientas de conciliación de medicación.
- Demostración de privacidad por diseño: al ejecutarse íntegramente en el cliente, sirve como ejemplo de extracción de información sensible sin salida de datos del dispositivo.
- Generación de datos sintéticos etiquetados: el pipeline de Synthea más este extractor puede emplearse para crear pares documento-JSON de entrenamiento o evaluación en proyectos de investigación.
- Evaluación de pipelines de cuantización: el caso del adaptador entrenado sobre pesos redondeados de forma coherente con el formato de despliegue es un ejemplo reproducible para quien investigue la degradación de fine-tunes tras la conversión a 4 bits.
- Prototipado rápido de asistentes documentales en el navegador: con 1,0 GB de pesos y WebGPU, es viable integrarlo en demos sin infraestructura de GPU en servidor.

## Benchmarks y rendimiento

Resultados reportados por el autor (métricas de F1 «all-facts», es decir, coincidencia de todos los hechos extraídos):

| Entorno | Conjunto de prueba | ReportCompanion | Qwen3-1.7B original |
|---|---|---|---|
| Python (pesos redondeados) | 204 documentos sintéticos | 0,994 | 0,820 |
| Python (pesos redondeados) | 20 documentos desafío escritos a mano | 0,857 | 0,613 |
| Chrome + WebLLM 0.2.89 | 40 documentos de prueba | 0,996 (formato válido 92,5 %) | No disponible |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,0 GB de pesos en formato q4f16_1; el consumo real depende del runtime WebGPU y del contexto.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y la característica `shader-f16` (requisito declarado en la configuración de WebLLM); en la práctica, GPUs integradas y dedicadas recientes de Intel, AMD, Apple y Nvidia.
- Cabe en GPU de consumo: sí, por tamaño; el cuello de botella es la disponibilidad de WebGPU y `shader-f16` en el navegador.
- Opciones de despliegue: WebLLM (principal, con la librería precompilada de Qwen3-1.7B-q4f16_1-MLC); MLC-LLM para otros entornos; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles; el autor solo reporta que los resultados en Chrome con WebLLM coinciden con los de Python.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReportCompanion-q4grid-Qwen3-1.7B-q4f16_1-MLC | 1,7B | No disponible | Extraccion medica estructurada con citas, en navegador | Apache 2.0 | Hugging Face (15 descargas) |
| Qwen/Qwen3-1.7B | 1,7B | No disponible en la informacion | Proposito general | Apache 2.0 | Hugging Face (modelo base) |
| Qwen3-1.7B-q4f16_1-MLC (WebLLM) | 1,7B | No disponible | Proposito general, en navegador | Apache 2.0 | Precompilado en WebLLM |

La comparación directa con alternativas especializadas en extracción de información médica no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es una herramienta diagnóstica ni está validada médicamente; el autor lo declara explícitamente.
- Entrenado y evaluado solo con documentos sintéticos (Synthea) y ficticios escritos a mano; el rendimiento en documentos clínicos reales es desconocido.
- El F1 de 0,857 en documentos desafío escritos a mano indica una degradación notable fuera de la distribución sintética.
- Tasa de formato válido del 92,5 % en navegador: cerca de 1 de cada 13 salidas no cumple el esquema JSON esperado y requiere manejo de errores en producción.
- Requiere el prompt de sistema exacto del repositorio, decodificación greedy y thinking desactivado; desviarse de estas condiciones puede alterar los resultados.
- Riesgo de alucinación inherente a un modelo de 1.7B; el diseño con citas mitiga pero no elimina el problema, y la verificación contra el texto debe implementarse en código.
- Sesgos: no documentados; dependen del dataset sintético de Synthea y de los documentos ficticios empleados.
- Idiomas soportados: no disponibles; no hay garantía de funcionamiento fuera del idioma del entrenamiento.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el uso en contextos clínicos exigiría validación regulatoria independiente que este modelo no aporta.
- Dependencia de WebGPU y `shader-f16`: navegadores o dispositivos sin estas capacidades no pueden ejecutarlo.
- Proyecto prototipo con 15 descargas y 0 likes; sin mantenimiento ni comunidad documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/snekum/ReportCompanion-q4grid-Qwen3-1.7B-q4f16_1-MLC
- Repositorio Report Companion: https://github.com/snekum/report-companion
- Documentación técnica (walkthrough): https://github.com/snekum/report-companion/blob/main/docs/WALKTHROUGH.md
- Model card detallada: https://github.com/snekum/report-companion/blob/main/docs/MODEL_CARD.md
- Prompt de extracción: https://github.com/snekum/report-companion/blob/main/shared/extraction_prompt.txt
- Proyecto AMFV de MedARC: https://github.com/MedARC-AI/amfv
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
