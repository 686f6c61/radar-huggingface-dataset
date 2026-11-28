# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes

## Resumen

LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes es un modelo vision-lenguaje de 1.918 millones de parametros (aproximadamente 2B) especializado en actuar como agente autonomo sobre telefonos Android. Lo desarrolla el usuario experimentalmachines y se construye sobre LFM3-VL-2B, el modelo base de Liquid AI, mediante un proceso de ajuste supervisado y DPO orientado a corregir errores de parada y de intencion copiada en tareas de uso de interfaz movil. El modelo recibe una captura de pantalla por paso, el objetivo del usuario, las apps instaladas y el historial de los ultimos 8 pasos, y devuelve un unico paso de accion en JSON compacto.

Se trata de un modelo de desarrollo, no de un modelo de produccion. El propio autor lo etiqueta como "development model, not recommended" y recomienda usar la version principal LFM3-VL-2B-MobileAgent o, en su defecto, OwnHistory. Esta ficha se conserva como resultado negativo documentado: la ronda 5 de entrenamiento (DPO sobre 851 pares de errores de parada y de intencion copiada) supero la puerta de evaluacion offline pero fallo la puerta online en AndroidWorld, con una ganancia de +3 tareas que queda dentro del ruido entre ejecuciones.

La relevancia es doble. Por un lado, ilustra el estado del arte en agentes GUI moviles de bajo coste, donde un modelo de 2B con cuantizacion 4-bit puede ejecutarse en un telefono. Por otro, documenta con rigor metodologico por que una mejora offline en el ultimo paso no se traduce necesariamente en exito online, incluyendo analisis de McNemar y replicas identicas para separar senal de ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (LFM3-VL, familia LFM3 de Liquid AI); torre de vision y proyector congelados durante el ajuste |
| Parametros totales | 1.918.181.888 (aproximadamente 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; historial textual limitado a los ultimos 8 pasos |
| Tipos de cuantizacion | 4-bit GGUF disponible en el repositorio hermano DPOStopMistakes-GGUF; pesos originales en safetensors |
| Idiomas soportados | ingles (objetivos en ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del modelo base |
| Formato de pesos | safetensors (transformers, custom_code); GGUF 4-bit en repositorio separado |
| Entrada de imagen | una captura por paso, redimensionada a un maximo de 880 x 880 px de area (aproximadamente 720 tokens de imagen) |
| Salida | bloque `` seguido de un JSON de accion con coordenadas enteras en rejilla 0-1000 |
| Decodificacion recomendada | thinking activado, temperatura 0 |
| Tamano del repositorio | 4.1 GB |

## Arquitectura y entrenamiento

El modelo parte de LFM3-VL-2B, un transformer multimodal que combina una torre de vision con un modelo de lenguaje para procesar capturas de pantalla junto con texto. Sobre esa base se aplico un adaptador LoRA de lenguaje (r64, alfa128) que se fusiono en los pesos, mientras que la torre de vision y el proyector permanecieron congelados. El entrenamiento de esta version concreta es un DPO a nivel de paso (beta 0.1, learning rate 1e-5) combinado con un factor 1.0 de SFT sobre el paso preferido.

Los datos de preferencia se generaron de forma auto-referencial: OwnHistory decodifico sus propias filas de entrenamiento de forma greedy y, en los casos en que se detuvo demasiado pronto, omitio una parada o copio su intencion anterior, se construyo un par con el paso humano como preferido y el paso propio como rechazado. El conjunto final son 851 pares balanceados; la version anterior (DPOAllMistakes) habia usado los 4.163 errores completos y colapso tipos de accion enteros. No se emplearon datos de entorno, modelos profesor ni benchmarks en el entrenamiento. La innovacion metodologica destacable es el uso del propio historial de errores del modelo como senal de contraste, en lugar de preferencias generadas por un anotador externo.

## Capacidades

- Generacion de acciones de interfaz movil en JSON compacto: click, long_press, input_text, scroll, open_app, navigate_back, navigate_home, keyboard_enter, wait, answer y status.
- Razonamiento de un paso con modo thinking: produce una intencion corta antes de la accion.
- Comprension de capturas de pantalla de Android con resolucion efectiva de hasta 880 x 880 px.
- Seguimiento de objetivos en ingles con historial textual de los ultimos 8 pasos (intencion y accion previas).
- Seleccion de apps entre una lista de aplicaciones instaladas proporcionada en el prompt.
- Respuesta a preguntas del usuario mediante la accion `answer`, con formato corto y controlado.
- Finalizacion de tareas mediante `status` con `complete` o `infeasible`.
- No soporta tool calling generico, ni audio, ni vision de video; no es un modelo conversacional de proposito general.

## Casos de uso

- Investigacion en agentes GUI moviles: sirve como punto de comparacion reproducible para estudiar el efecto del DPO a nivel de paso en la precision de parada y en la copia de intenciones, con datos y resultados publicados en el repositorio del proyecto.
- Reproduccion de resultados academicos: al ser un modelo de desarrollo conservado explicitamente para reproducibilidad, permite replicar las tablas offline y online de la ronda 5 sin reentrenar.
- Desarrollo de pipelines de evaluacion de agentes: su salida JSON estricta y su tasa de parseo de 1.000 lo hacen util como componente controlado en harnesses que miden precision de paso y finalizacion.
- Prototipado de automatizacion de tareas en emulador Android: con temperatura 0 y thinking activado puede ejecutarse sobre AndroidWorld para validar flujos antes de migrar al modelo principal.
- Analisis de fallos de parada: el modelo esta disenado para estudiar por que un agente declara `complete` antes de tiempo, lo que resulta util en investigacion sobre calibracion de agentes.
- Despliegue en dispositivo de bajo coste: la variante GGUF 4-bit permite experimentar con inferencia local en telefonos o equipos sin GPU dedicada, aunque solo con fines de investigacion.
- No se recomienda su uso en atencion al cliente, produccion ni automatizacion sobre cuentas reales, segun las propias limitaciones del autor.

## Benchmarks y rendimiento

| Evaluacion | OwnHistory | DPOStopMistakes | Umbral |
|---|---|---|---|
| Tasa de parseo | 1.000 | 1.000 | >= 0.99 |
| AndroidControl test, precision de paso high-level | 0.732 | 0.728 | >= 0.712 |
| AndroidControl, precision terminal `complete` | 0.738 | 0.785 | >= 0.70 |
| Dev `answer` / dev `complete` | 0.868 / 0.812 | 0.875 / 0.838 | >= 0.848 / sin umbral |

| AndroidWorld seed 30 (116 tareas, desarrollo) | OwnHistory | DPOStopMistakes | Umbral |
|---|---|---|---|
| Exitos | 18 (replica: 19) | 21 | ganancia neta >= 9 sobre OwnHistory: +3, fallo |
| Falsos `complete` | 25 (replica: 22) | 28 | <= 15 con >= 16 exitos: fallo |

El resultado online queda dentro del ruido: McNemar pareado p = 0.55 frente a OwnHistory, y p = 0.69 frente a la replica identica de OwnHistory. En las tareas en que ninguna ejecucion fallo, la diferencia de falsos `complete` es 26 frente a 25 (p = 1.0). La ganancia offline en el ultimo paso no se traslado al emulador.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4 GB solo para pesos, mas overhead de activaciones y cache de vision; en la practica, 8-10 GB en GPU para comodidad.
- Cuantizacion 4-bit GGUF: los pesos bajan a aproximadamente 1,2-1,5 GB, lo que permite ejecucion en CPU y en GPUs de consumo con 4-6 GB de VRAM.
- GPU recomendadas: A100 o H100 para evaluacion a gran escala con transformers; RTX 4090, RTX 3090 o RTX 4070 Ti para desarrollo local en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16 y en tarjetas con 4-6 GB usando la variante GGUF 4-bit.
- Opciones de despliegue: transformers (libreria declarada, requiere `custom_code`), llama.cpp u Ollama mediante el GGUF 4-bit, y vLLM o TGI si se valida el soporte de la arquitectura LFM3-VL.
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo procesa aproximadamente 720 tokens de imagen por paso, lo que domina el coste por accion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes | 1,92B | historial de 8 pasos | Agente GUI Android, DPO de parada | LFM Open License v1.0 | Desarrollo, no recomendado |
| LFM3-VL-2B-MobileAgent-Dev-OwnHistory | 1,92B | historial de 8 pasos | Agente GUI Android, SFT con historial propio | LFM Open License v1.0 | Desarrollo, base de esta version |
| LFM3-VL-2B-MobileAgent | no disponible | no disponible | Agente GUI Android, version principal | LFM Open License v1.0 | Recomendado por el autor |
| MobileAgent de referencia (otros agentes GUI moviles) | no disponible | no disponible | Agente GUI movil | variable | no disponible en la informacion |

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- No supera a OwnHistory en AndroidWorld; la ganancia de +3 tareas es ruido estadistico (p = 0.55).
- No reduce los falsos `complete`: 28 frente a 22-25 de OwnHistory, por encima del umbral de 15.
- Solo acepta objetivos en ingles y una captura por paso; no hay memoria mas alla de los 8 pasos de historial textual.
- No evaluado en MobileWorld ni en semillas selladas, por lo que la generalizacion fuera de AndroidWorld seed 30 es desconocida.
- Riesgo de alucinacion en la interpretacion de la pantalla y en la seleccion de apps; el formato JSON estricto reduce errores de parseo pero no de semantica.
- Licencia LFM Open License v1.0: revisar las condiciones de uso comercial antes de cualquier despliegue productivo; el autor no lo recomienda para produccion.
- La decodificacion debe hacerse con thinking activado y temperatura 0 para reproducir los resultados reportados; otros ajustes invalidan las cifras.
- Requiere `trust_remote_code` por el uso de `custom_code` en transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes
- Modelo base (OwnHistory): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory
- Version principal recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Variante GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes-GGUF
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
