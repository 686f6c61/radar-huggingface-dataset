# scalesafe-ai/bifrost-v1

## Resumen

BIFROST V1 (Browser Intelligence Framework for Rapid Operations & Smart Tasks) es un modelo de política de acciones de navegador de 127.052.545 parámetros desarrollado por scalesafe-ai. No es un modelo de lenguaje generativo: recibe observaciones semánticas estructuradas del DOM y emite acciones de navegador estructuradas, con anclaje (*grounding*) explícito del elemento objetivo sobre el que actuar.

El modelo consume `input_ids`, `element_spans` y `valid_target_mask`, y produce dos salidas: una distribución sobre 8 operaciones (`CLICK`, `TYPE_TEXT`, `SELECT`, `SCROLL_UP`, `SCROLL_DOWN`, `WAIT`, `NAVIGATE`, `DONE`) y una distribución sobre candidatos de objetivo para las operaciones que requieren anclaje. Con 2.048 tokens de contexto y 127 M de parámetros, está diseñado para ejecutarse localmente junto a un runtime de navegador (Playwright/Chromium), sin depender de APIs en la nube.

Su relevancia actual se enmarca en la automatización de agentes web: el autor publica resultados de un banco de pruebas interno de 105 tareas reales en Chromium con una tasa de éxito global del 51,43% y una precisión de acción por paso del 99,76%, con alta varianza entre dominios (85% en *booking* frente a 10% en navegación anidada de *settings* e *inbox*). Se distribuye como artefacto de investigación con licencia pendiente, no como producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 12 capas (backbone) + cabeza de *grounding* contextual de objetivo + clasificador de 8 operaciones |
| Parametros totales | 127.052.545 (~127,1 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; el checkpoint publicado esta en BF16 / FP32 |
| Idiomas soportados | No disponible |
| Licencia | `other`, `license_name: pending` (todos los derechos reservados) |
| Formato de pesos | Checkpoint PyTorch (`.pt`); no se publican safetensors ni GGUF |
| Tamano oculto (H) | 768 |
| Cabezas de atencion | 12 |
| Tamano intermedio de la FFN | 3.072 |
| Dimension de proyeccion de objetivo | 384 |
| Vocabulario | 50.257 tokens (BPE de GPT-2 Base + tokens especiales Semantic DOM V2) |
| Precision | BF16 / FP32 |
| Tamano del checkpoint | ~1,52 GB (1.524.828.671 bytes) |
| SHA-256 del checkpoint | `ecab10e1ba217e99f3a98c852ff9932c330c7f3e61e08c0be27b57462e3891de` |
| Compatibilidad con transformers | No; requiere el codigo de BIFROST para instanciar la arquitectura |
| Operaciones soportadas | `CLICK`, `TYPE_TEXT`, `SELECT`, `SCROLL_UP`, `SCROLL_DOWN`, `WAIT`, `NAVIGATE`, `DONE` |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicacion | 2026-09-23 (creacion), 2026-09-23 (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Transformer de 12 capas y 768 dimensiones ocultas (12 cabezas de atencion, FFN de 3.072) con dos cabezas de prediccion: una cabeza de *grounding* contextual de objetivo, que proyecta a 384 dimensiones y selecciona el elemento interactivo candidato, y un clasificador de 8 vias que determina la operacion a ejecutar. La entrada no es texto libre, sino una representacion semantica del DOM (pipeline propietario *Semantic DOM V2*) tokenizada con un vocabulario de 50.257 entradas derivado del BPE de GPT-2 Base mas tokens especiales. El modelo maneja explicitamente `element_spans` y `valid_target_mask`, lo que permite restringir la prediccion a elementos validos del arbol DOM.

Los datos de entrenamiento proceden del dataset canonico `synthetic_phase13`, con 58.584 ejemplos repartidos en 10 dominios; el autor indica que los *splits*, los esquemas y los mapeos de tokenizacion estan documentados en `dataset_manifest.json`, pero no se detalla en la model card el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por imitacion. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni mecanismos de atencion alternativa; la innovacion declarada es la inmunidad a errores de estado obsoleto (*stale-state*) mediante *observation fingerprinting*, que en el banco de pruebas interno se traduce en 0 errores de estado obsoleto.

## Capacidades

- Generacion de acciones de navegador estructuradas a partir de observaciones semanticas del DOM, con anclaje del elemento objetivo (`target_logits`).
- Clasificacion de 8 operaciones atomicas de navegador: clic, escritura de texto, seleccion en desplegables, scroll arriba/abajo, espera, navegacion directa por URL y finalizacion de tarea.
- Restriccion de objetivos validos mediante `valid_target_mask`, lo que reduce acciones sobre elementos no interactivos.
- Robustez frente a estados obsoletos de la pagina gracias al *observation fingerprinting* (0 errores de estado obsoleto reportados en el banco interno).
- Ejecucion local: inferencia en 20,51 ms por paso en una NVIDIA A100, sin llamadas a APIs externas.
- Politica multi-paso: planifica y ejecuta secuencias de acciones (media de 3,65 pasos por tarea en el banco interno).
- No incluye generacion de texto libre, razonamiento en lenguaje natural, codigo, matematicas, vision ni audio.
- No se documenta soporte de *tool calling* generico ni de function calling mas alla del propio espacio de acciones de navegador.
- No se documentan capacidades multilingues ni idiomas soportados.

## Casos de uso

- Automatizacion de flujos de reserva: con un 85% de exito en el dominio *booking* y una media de 6,0 pasos por tarea, el modelo es adecuado para completar formularios de reserva multi-paso en aplicaciones web controladas, siempre que el pipeline Semantic DOM V2 pueda generar la observacion.
- Automatizacion de paneles de administracion: el 80% de exito en *admin dashboard* con solo 3,85 pasos de media lo hace util para tareas de back-office repetitivas (altas, cambios de estado, ajustes de configuracion) en aplicaciones corporativas internas.
- Automatizacion de operaciones bancarias acotadas: el 80% de exito en el dominio *banking* con 6,0 pasos de media permite cubrir consultas y operaciones de formulario en entornos de banca simulados o de pruebas, con validacion humana obligatoria en produccion.
- Pruebas end-to-end en CI/CD: el modelo puede actuar como agente de pruebas que ejecuta guiones de navegacion reales sobre Chromium mediante Playwright, integrándose en pipelines de integracion continua para validar flujos de usuario sin guiones escritos a mano.
- Asistente local de navegador con privacidad: al ejecutarse localmente y requerir solo 20,51 ms de inferencia por paso, puede desplegarse en la maquina del usuario para automatizar tareas sin enviar observaciones del DOM a servidores externos.
- Investigacion en agentes web: sirve como politica de referencia (baseline) para experimentos de aprendizaje por imitacion o refuerzo sobre navegacion, con un banco congelado de 105 tareas y desglose por dominio publicado.
- Automatizacion de compras y reabastecimiento: con un 65% de exito en *shopping* y 3,85 pasos de media, es viable para carritos y flujos de compra simples en sitios con estructura estable, con confirmacion previa del usuario.
- Extraccion de informacion mediante navegacion guiada: el modelo puede navegar y dejar la pagina en el estado objetivo (`DONE` terminal) para que un componente externo extraiga los datos, evitando la necesidad de generacion de lenguaje.

## Benchmarks y rendimiento

Los unicos datos disponibles son los del banco interno congelado de 105 tareas sobre Chromium real ejecutado con Playwright. El autor advierte expresamente que no son resultados universales de fiabilidad en navegadores.

| Metrica | Resultado validado |
|---|---|
| Tasa de exito global | 51,43% (54 / 105 tareas) |
| Precision media de accion por paso | 99,76% |
| Errores de estado obsoleto | 0 (inmunidad via *observation fingerprinting*) |
| Errores de ejecucion / despacho en navegador | 1 |

Desglose por dominio:

| Dominio | Tareas | Superadas | Tasa de exito | Pasos medios |
|---|---|---|---|---|
| Booking | 20 | 17 | 85,0% | 6,0 |
| Admin Dashboard | 20 | 16 | 80,0% | 3,85 |
| Banking | 5 | 4 | 80,0% | 6,0 |
| Shopping | 20 | 13 | 65,0% | 3,85 |
| Settings | 20 | 2 | 10,0% | 2,0 |
| Inbox | 20 | 2 | 10,0% | 2,0 |
| Total | 105 | 54 | 51,43% | 3,65 |

Latencia de inferencia y ejecucion medida en NVIDIA A100:

| Etapa | Latencia |
|---|---|
| Extraccion de observacion del DOM | 13,88 ms |
| Inferencia del modelo (*forward pass*) | 20,51 ms |
| Despacho y asentamiento en navegador | 378,05 ms |
| Latencia total por paso (segun la fuente) | 224,39 ms |

Nota de rigor: los componentes suman 412,44 ms, por encima de los 224,39 ms declarados como latencia total por paso; la model card no explica la discrepancia. No se han publicado resultados en benchmarks estandar de lenguaje o razonamiento (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 0,25 GB por calculo directo a partir de 127,05 M de parametros (estimacion, no dato del autor).
- Pesos en FP32: aproximadamente 0,51 GB (estimacion, no dato del autor).
- Tamano real del checkpoint publicado: ~1,52 GB, muy superior a los pesos en FP32, lo que sugiere que el fichero incluye estados adicionales (por ejemplo, optimizador o copias de precision mixta); el autor no lo detalla.
- Memoria de trabajo para inferencia con contexto de 2.048 tokens: por debajo de 2 GB en total (estimacion); el modelo cabe holgadamente en cualquier GPU de consumo con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- GPU de referencia empleada por el autor: NVIDIA A100, con 20,51 ms por *forward pass* y 13,88 ms de extraccion de observacion.
- El cuello de botella de latencia no es la GPU sino el navegador: el despacho y asentamiento de la accion consume 378,05 ms por paso en la medicion del autor.
- Opciones de despliegue: unicamente PyTorch con el codigo de BIFROST (`BifrostConfig`, `BifrostPolicyModel`, `BaselineTokenizer`) y un runtime de navegador (Playwright/Chromium). No es compatible con `AutoModel.from_pretrained()` de HuggingFace ni con vLLM, llama.cpp, Ollama o TGI.
- Throughput: no disponible.
- Latencia en GPU de consumo: no disponible; el unico dato publicado corresponde a A100.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (politicas de accion de navegador o agentes web del mismo orden de magnitud). Tampoco se dispone de especificaciones, contexto, licencia o rendimiento de alternativas que permitan una comparacion rigurosa. Los resultados de la busqueda web corresponden a proyectos homonimos sin relacion con este modelo (una pasarela de IA y una plataforma de evaluacion de robots), por lo que no son validos como terminos de comparacion.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor lo define explicitamente como modelo de investigacion evaluado en entornos web controlados.
- No universal: no hay garantia de que complete tareas en sitios web arbitrarios de internet abierto.
- Varianza enorme entre dominios: 85% de exito en *booking* frente a 10% en navegacion anidada de *settings* e *inbox*. Cualquier despliegue debe segmentarse por tipo de interfaz.
- Dependencia de runtime: requiere el pipeline de observacion BIFROST (Semantic DOM V2) y el ejecutor de acciones con un navegador activo; los pesos por si solos no son funcionales.
- Incompatibilidad de ecosistema: no carga con `transformers`, ni con herramientas estandar de servido (vLLM, TGI, llama.cpp, Ollama), lo que limita la integracion en infraestructuras existentes.
- Licencia pendiente: `license_name: pending` con todos los derechos reservados. No hay autorizacion explicita de uso comercial; debe aclararse con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion y de accion erronea: aunque la precision por paso es del 99,76% en el banco interno, un fallo de anclaje sobre el elemento equivocado puede provocar acciones destructivas (por ejemplo, confirmaciones o envios no deseados) en flujos bancarios o de compra.
- Ausencia de datos de sesgo y de idioma: no se documentan idiomas soportados ni evaluaciones de sesgo.
- Trazabilidad limitada del entrenamiento: no se detalla el numero de tokens, la composicion del dataset ni el uso de RLHF/DPO; solo se referencia `synthetic_phase13` con 58.584 ejemplos en 10 dominios, lo que limita la reproducibilidad.
- Inconsistencia en las metricas de latencia publicadas (los componentes suman 412,44 ms frente a los 224,39 ms declarados).
- Sin validacion externa: 0 descargas y 0 *likes* en HuggingFace, y los unicos resultados disponibles son internos del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scalesafe-ai/bifrost-v1
- Manifiesto del dataset (referenciado en la model card, relativo al repositorio): `dataset_manifest.json`
- Enlace de licencia declarado en la model card: https://huggingface.co/scalesafe-ai/bifrost-v1
- Resultados de busqueda web no relacionados con este modelo (proyectos homonimos, incluidos solo a efectos de desambiguacion):
  - https://bifrost-1.ghost.io/typesafe-system-one-models-and-new-v1-decisions-endpoint/
  - https://github.com/maximhq/bifrost
  - https://www.bifrost.ai/
  - https://docs.getbifrost.ai/overview
  - https://docs.getbifrost.ai/models-catalog/list
- Repositorio de codigo de BIFROST, paper tecnico y demos: no disponibles en la informacion proporcionada.
