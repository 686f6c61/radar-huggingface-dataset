# ege-arhan/TrustLaya-S-Advanced

## Resumen
TrustLaya-S Advanced es un encoder multitarea de 42.138.641 parametros, desarrollado por el usuario ege-arhan, cuyo objetivo es actuar como capa de analisis de riesgo en sistemas de agentes: deteccion de datos personales (PII), inyeccion de prompt, seguridad y gobierno de datos. Parte del backbone turco YTU Turkish Medium BERT uncased y expone nueve cabezas de riesgo sobre un `model.safetensors` propietario (no es un `AutoModel` generico). Esta version (v2) modifica unicamente la cabeza de PII respecto a TrustLaya-S v1 y no incorpora nueva destilacion de profesor.

Es relevante ahora porque aborda un problema de infraestructura real en despliegues de agentes: decidir si una accion puede ejecutarse o debe bloquearse o revisarse. El modelo se distribuye junto a un motor de politicas deterministico, reglas de riesgo por agente/sesion y extraccion de evidencia que viven en el repositorio fuente, no en los pesos: el modelo por si solo no implementa el sistema completo. El autor lo etiqueta explicitamente como candidato de investigacion, no listo para produccion, con una tasa de falsos positivos del 31,6 % en su prueba sintetica turca de PII.

La ficha publica incluye una demo de cortafuegos en Docker con el mismo ONNX FP32, donde el modelo opera como gateway entre un agente y un `record.write` sobre SQLite, con autorizacion de un solo uso e idempotencia por `operation_id`. Todas las cifras publicadas de calidad son internas o sobre conjuntos sinteticos y publicos, y el propio autor documenta varios resultados de F1 iguales a cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT multitarea con nueve cabezas de riesgo (backbone: YTU Turkish Medium BERT uncased) |
| Parametros totales | 42.138.641 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible; el pipeline documentado lee solo los primeros 94 tokens de contenido (`head_94_v1`) |
| Tipos de cuantizacion | FP32 (`trustlaya_s.onnx`) e INT8 experimental (`trustlaya_s_int8.onnx`) |
| Idiomas soportados | Turco (tr) e ingles (en); suite de humo multilingue de 33 casos, insuficiente para establecer rendimiento |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, modelo PyTorch de nueve cabezas personalizado) y ONNX (FP32 e INT8) |
| Ficheros auxiliares | `calibration.json`, `decision_thresholds.json`, `policy.yaml`, tokenizer |
| Modelo base | ytu-ce-cosmos/turkish-medium-bert-uncased |
| Dataset de entrenamiento (cabeza PII v2) | yusuf-said/turkish-privacy-filter-dataset |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 16 / 0 |
| Fechas | Creado el 2026-09-24; actualizado el 2026-09-26 |

## Arquitectura y entrenamiento
Se trata de un transformer encoder denso (familia BERT) ajustado como clasificador multitarea. Sobre el backbone turco se anaden nueve cabezas de riesgo; la model card nombra explicitamente las de PII, inyeccion de prompt, seguridad y gobierno de datos, y no detalla el resto. `model.safetensors` es un modelo PyTorch personalizado, no compatible con `AutoModel` generico, y se consume mediante la clase `Analyzer` del repositorio fuente pasando explicitamente la ruta al ONNX.

La version 2 actualiza solo la cabeza de PII y no introduce nueva destilacion. La procedencia del entrenamiento es: backbone YTU Turkish BERT (MIT) y un profesor debil de v1, Laya Multilingual (Apache-2.0), que segun el autor "nunca fue ground truth". La fuente de entrenamiento de PII de v2 es el Turkish Privacy Filter Dataset (MIT). No se documenta RLHF ni DPO, coherente con un encoder de clasificacion. La calibracion se realizo por escalado de temperatura: se evaluaron ocho temperaturas sobre los mismos datos usados para ajustarlas, lo que limita la validez de las metricas de calibracion. La version INT8 es experimental y altero el 5,1 % de las acciones finales de politica sobre 256 filas sinteticas.

## Capacidades
- Clasificacion multitarea de riesgo: puntuaciones de PII, inyeccion de prompt, seguridad y gobierno de datos sobre texto de entrada.
- Deteccion de PII en turco: F1 0,784 y recall 0,848 en la prueba sintetica turca de 2.000 casos con umbral 0,8.
- Deteccion de inyeccion de prompt: cabeza especifica, con F1 0,555 en el conjunto sintetico mixto y F1 0,000 en inyeccion codificada sobre una suite controlada pequena.
- Salida de confianza calibrada: el modelo emite un valor `confidence`; el autor advierte que no es correccion calibrada.
- Integracion en pipeline de politica: el modelo alimenta un motor determinista con reglas de riesgo por agente/sesion y autorizacion de un solo uso (componentes externos al modelo).
- Notificacion de cobertura de lectura: las respuestas de analisis informan de que solo se leen los primeros 94 tokens; si queda texto sin leer, una decision ALLOW/REDACT pasa a REVIEW en acciones protegidas.
- Extraccion de evidencia: implementada en la rama fuente, no en los pesos.
- No soporta generacion de texto, tool calling ni function calling: es un clasificador, no un modelo autorregresivo.
- No se documentan capacidades de vision, audio, agentes autonomos ni modo de razonamiento extendido.

## Casos de uso
- Gateway de seguridad para agentes: el modelo analiza cada peticion de accion antes de que el agente toque un sistema de destino, y el motor de politica decide entre permitir, redactar, revisar o bloquear. Es el escenario de la demo de cortafuegos del autor, con p95 extremo a extremo de 53 ms.
- Filtrado de datos personales en turco antes de persistir registros: la cabeza de PII puede marcar notas o formularios con posibles datos identificativos, aplicando redaccion previa a la escritura en base de datos. Adecuado por el soporte nativo de turco, con la advertencia del 31,6 % de falsos positivos.
- Escritura idempotente en bases de datos: con el patron `operation_id` de la demo, una operacion reintentada no crea un segundo registro, lo que resulta util en integraciones con agentes que reintentan por timeouts.
- Auditoria de conversaciones de agentes en produccion: las puntuaciones por cabeza y la cobertura de lectura permiten registrar por que se bloqueo o reviso una accion y reconstruir la decision.
- Investigacion sobre deteccion de inyeccion de prompt en turco: el modelo sirve como punto de partida reproducible para comparar cabezas, umbrales y calibracion en un idioma con pocos recursos publicos en este nicho.
- Clasificacion de gobierno de datos en pipelines internos: la cabeza de gobierno de datos puede etiquetar flujos internos como parte de una revision previa al despliegue, siempre en modo asistido y nunca como unica puerta de decision.
- Pruebas de estres de umbrales: dado que se publican varios conjuntos (Tensor Trust, JailbreakLLMs, deepset, Gandalf), es util para estudiar el compromiso entre recall y falsos positivos antes de adoptar cualquier detector de inyeccion.

## Benchmarks y rendimiento

| Evaluacion | Dataset | Metrica | Resultado |
|---|---|---|---|
| PII turca (v2, umbral 0,8 seleccionado en desarrollo) | Sintetico turco CC-BY 4.0, n=2.000 (1.000 positivos / 1.000 negativos especificos) | F1 / recall / FPR | 0,784 / 0,848 / 0,316 |
| Conjunto sintetico mixto original | n=1.975 | macro F1 / seguridad F1 / inyeccion F1 / gobierno de datos F1 | 0,663 / 0,777 / 0,555 / 0,000 |
| Inyeccion de prompt codificada | Suite controlada pequena | F1 | 0,000 |
| Calibracion (solo ingles, sintetico) | Validacion sintetica | ECE bruta/calibrada; Brier bruto/calibrado; NLL bruto/calibrado | 0,105/0,089; 0,103/0,085; 0,424/0,271 |
| Calibracion PII turca | Test de PII turco | ECE | 0,181 |
| Baseline humana (cabezas V2 congeladas, umbral 0,5 prefijado, lectura nativa de 94 tokens) | Tensor Trust TEST, n=3.596, solo ataques | Recall | 0,443 |
| Baseline humana | JailbreakLLMs TEST (172 jailbreak / 1.938 prompts regulares) | Recall / FPR / F1 | 0,901 / 0,875 / 0,153 |
| Baseline humana | Prosa de seguridad benigna | FPR documentacion/foro; FPR abstracts de arXiv | 0,898; 0,978 |
| Baseline humana | deepset (fuera de distribucion) | F1 / FPR | 0,710 / 0,364 |
| Baseline humana | Gandalf (fuera de distribucion, solo ataques) | Recall | 0,722 |
| Latencia | MacBook, ONNX CPU, batch 1 | p50 | 4,629 ms |
| Latencia en demo de cortafuegos | 100 escrituras secuenciales, Docker en Apple Silicon | p95 modelo / p95 extremo a extremo / memoria del gateway | 45 ms / 53 ms / ~270 MiB |

No se han publicado resultados de benchmarks comparativos frente a otros modelos en la informacion disponible. El autor subraya que los resultados de la demo de cortafuegos corresponden a entradas fijas y no constituyen un benchmark de calidad, y que los 13 escenarios superados no incluyen ninguna medicion en hardware Arduino UNO Q.

## Requisitos de hardware
- Huella de pesos estimada por aritmetica a partir del recuento de parametros: aproximadamente 168 MB en FP32 (42,1 M x 4 bytes) y aproximadamente 42 MB en INT8. Estimacion propia, no publicada por el autor.
- Inferencia en CPU viable: p50 de 4,629 ms por lote de 1 en un MacBook con ONNX Runtime CPU.
- No se publican mediciones en GPU. Por tamano, cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090) e incluso en GPUs integradas, pero no hay cifras verificadas.
- Memoria del gateway en la demo Docker: aproximadamente 270 MiB en total, incluyendo politica y adaptadores.
- Despliegue: ONNX Runtime para FP32 e INT8 experimental; imagen Docker sin torch en el runtime; requiere la clase `Analyzer` del repositorio fuente y una ruta ONNX explicita.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Al ser un clasificador y no un generador, no encaja en pipelines de decodificacion de texto.
- La cuantizacion INT8 es experimental: cambio el 5,1 % de las acciones finales de politica sobre 256 filas sinteticas, por lo que no debe adoptarse sin reevaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrustLaya-S Advanced | 42,1 M | No disponible (lectura documentada de 94 tokens) | Clasificacion multitarea de riesgo: PII, inyeccion de prompt, seguridad, gobierno de datos | MIT | HuggingFace, 16 descargas |
| YTU Turkish Medium BERT uncased | No disponible | No disponible | Encoder base en turco, sin cabezas de riesgo | MIT | HuggingFace |
| Laya Multilingual (convaiinnovations) | No disponible | No disponible | Profesor debil multilingue usado en v1; nunca fue ground truth | Apache-2.0, segun la model card de TrustLaya | HuggingFace |
| Meta Prompt Guard | No disponible en esta ficha | No disponible en esta ficha | Deteccion de inyeccion de prompt y jailbreak | No disponible | HuggingFace |
| protectai deberta-v3-base-prompt-injection-v2 | No disponible en esta ficha | No disponible en esta ficha | Deteccion de inyeccion de prompt | No disponible | HuggingFace |

Los campos marcados como no disponibles no se han podido contrastar con la informacion proporcionada y no se incluyen cifras de rendimiento comparadas porque la model card no ofrece ninguna comparacion con terceros. Las alternativas citadas se listan solo como referencia de nicho.

## Limitaciones y advertencias
- Candidato de investigacion: el autor prohibe explicitamente usarlo como unica puerta de decision en acciones irreversibles de agentes, divulgacion de datos personales o decisiones legales y eticas.
- Las puntuaciones de riesgo son salidas del modelo, no probabilidades validadas de eventos reales; `confidence` no equivale a correccion calibrada.
- Tasa de falsos positivos del 31,6 % en la prueba sintetica turca de PII con umbral 0,8; el propio autor senala que esto bloquea el despliegue.
- Gobierno de datos: F1 0,000 en el conjunto sintetico mixto original. Inyeccion codificada: F1 0,000.
- Como detector general de jailbreak o inyeccion en texto real no es utilizable: FPR de 0,875 en JailbreakLLMs, 0,898 en prosa de seguridad documental y 0,978 en abstracts de arXiv; F1 de 0,153 en JailbreakLLMs.
- En la demo se observo que muchas notas benignas cortas reciben REVIEW y que una nota de reunion benigna de 113 tokens fue BLOCKeada como inyeccion de prompt.
- Cobertura de lectura limitada a los primeros 94 tokens de contenido; el texto restante no se analiza y degrada la decision a REVIEW en acciones protegidas.
- Multilingue no establecido: la suite de humo de 33 casos es demasiado pequena; fuera del turco y el ingles el comportamiento es desconocido.
- Calibracion con posible sobreajuste: las ocho temperaturas se evaluaron sobre los mismos datos usados para ajustarlas.
- La ablacion V5 (8 ejecuciones sobre fuentes publicas) se declaro NO_GO: mejoraba en la fuente pero elevaba los falsos positivos en un conjunto benigno independiente (deepset) al 70-85 %.
- La version INT8 altera decisiones de politica y esta marcada como experimental.
- Aunque la licencia es MIT, los pesos dependen de un backbone MIT y de un profesor Apache-2.0, y el modelo forma parte de un sistema con motor de politica y reglas externas que condicionan su comportamiento real.
- El modelo no redistribuye ejemplos del dataset de entrenamiento y no implementa por si solo el sistema de politicas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ege-arhan/TrustLaya-S-Advanced
- Modelo v1: https://huggingface.co/ege-arhan/TrustLaya-S
- Codigo fuente (rama advanced): https://github.com/ege-arhan/trustlaya-s/tree/feature/trustlaya-advanced
- Rama de la demo de cortafuegos: https://github.com/ege-arhan/trustlaya-s/tree/feat/v2-firewall-e2e
- Documentacion de la demo: https://github.com/ege-arhan/trustlaya-s/blob/feat/v2-firewall-e2e/docs/firewall_demo.md
- Informe de investigacion: https://github.com/ege-arhan/trustlaya-s/blob/feature/trustlaya-advanced/reports/research_report.md
- Model card en el repositorio: https://github.com/ege-arhan/trustlaya-s/blob/feature/trustlaya-advanced/MODEL_CARD.md
- Data card: https://github.com/ege-arhan/trustlaya-s/blob/feature/trustlaya-advanced/DATA_CARD.md
- Puerta de evidencia V5: https://github.com/ege-arhan/trustlaya-s/blob/feat/v2-firewall-e2e/reports/v5_evidence_gate.md
- Informe de ablacion V5: https://github.com/ege-arhan/trustlaya-s/blob/feat/v2-firewall-e2e/reports/v5_ablation_report.md
- Backbone: https://huggingface.co/ytu-ce-cosmos/turkish-medium-bert-uncased
- Profesor v1 (Laya Multilingual): https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de PII en turco: https://huggingface.co/datasets/yusuf-said/turkish-privacy-filter-dataset
