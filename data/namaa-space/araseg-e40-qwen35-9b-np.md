# NAMAA-Space/araseg-e40-qwen35-9b-np

## Resumen

`NAMAA-Space/araseg-e40-qwen35-9b-np` es un adaptador LoRA de segmentacion de texto en arabe desarrollado por la comunidad NAMAA para la tarea compartida AraSeg 2026 (Arabic Segmentation Shared Task), enmarcada en ArabicNLP 2026. No es un modelo autonomo: se trata de un unico votante dentro de un ensemble de cinco miembros, cuya salida son probabilidades de frontera por palabra sin calibrar. El sistema completo, con los pesos del combinador y los umbrales, se publica por separado en la coleccion `NAMAA-Space/araseg-2026`.

El modelo parte de `Qwen/Qwen3.5-9B` como base y se ajusta mediante LoRA con r=16, alpha=32 y precision bf16. La tarea objetivo es la subtarea NP, es decir, la prediccion de fronteras de segmentacion a nivel de palabra, formulada como clasificacion de tokens (token-classification). La relevancia actual del artefacto es acotada y muy especifica: sirve para reproducir el sistema de NAMAA en AraSeg 2026, no para uso general como segmentador.

Conviene subir la advertencia al principio: los pesos publicados son un `state_dict` crudo de PyTorch (`best_NP.pt`), no un checkpoint en formato HuggingFace. `from_pretrained` no funciona; hay que reconstruir la arquitectura a partir del YAML de configuracion del experimento y del modelo base, y despues cargar los pesos. La puntuacion que aparece en la model card (92,84 en el test de practica y 91,3 macro-F1 en ciego) corresponde al sistema completo, no a este miembro por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-9B) con adaptador LoRA para clasificacion de tokens |
| Parametros totales | 9B en el modelo base (parametros del adaptador LoRA: no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_NP.pt`); no es safetensors, GGUF ni un checkpoint HF |
| Tarea | Text segmentation / token-classification (subtarea NP) |
| Entrenamiento | LoRA r=16, alpha=32, bf16 |
| Rol en el sistema | Miembro votante de un stack lineal ajustado OOF sobre 5 miembros |
| Umbral del sistema | 0,36 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre `Qwen/Qwen3.5-9B`, un transformer decoder-only de 9B parametros. El adaptador emplea rango r=16 y alpha=32 en bf16, y la cabeza efectiva es de clasificacion de tokens: el modelo emite probabilidades de frontera por palabra en lugar de texto libre. Los detalles del dataset de entrenamiento (numero de tokens, composicion, si hubo RLHF o DPO) no estan disponibles en la informacion proporcionada; por la naturaleza de la tarea, se trata de aprendizaje supervisado sobre anotaciones de segmentacion en arabe.

La innovacion tecnica no reside en el modelo individual, sino en el montaje del sistema: el miembro NP se combina con otros cuatro miembros mediante un stack lineal ajustado out-of-fold (OOF), con un umbral de decision de 0,36. Ademas, la model card indica que los cinco miembros LoRA requieren `transformers==5.12.1` para instanciar sus clases base, y que la pila completa de dependencias esta fijada en `requirements-llm.txt` del repositorio de codigo. La carga exige reconstruir la arquitectura antes de inyectar el `state_dict`.

## Capacidades

- Prediccion de fronteras de segmentacion de palabras en arabe (subtarea NP), como probabilidades sin calibrar.
- Clasificacion de tokens sobre texto arabe; devuelve una probabilidad por palabra, no una segmentacion final.
- Participacion como votante en un ensemble lineal: su salida solo es util agregada con los otros cuatro miembros y los pesos del combinador.
- No incluye generacion de texto, razonamiento, codigo, matematicas ni vision como capacidades de salida, aunque el modelo base las tenga; el ajuste LoRA las reorienta a la tarea de etiquetado.
- Soporte de tool calling / function calling: no disponible (no aplica en la formulacion de la tarea).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: unicamente arabe (etiqueta de idioma `ar`).
- Capacidad especial: ninguna declarada mas alla de la tarea de segmentacion.

## Casos de uso

- Reproduccion del sistema AraSeg 2026: cargar este miembro junto con los otros cuatro, aplicar los pesos del combinador OOF y el umbral 0,36 para replicar el resultado publicado del conjunto. Es el unico uso previsto explicitamente por los autores.
- Investigacion en segmentacion de arabe: analizar el comportamiento de un LLM de 9B ajustado con LoRA frente a enfoques clasicos de etiquetado secuencial en una tarea morfologica del arabe.
- Experimentos de ensemble y stacking: usar este miembro como componente de un stack lineal para estudiar como ponderar votantes heterogeneos en tareas de etiquetado.
- Evaluacion de preprocesado para PLN arabe: comprobar como cambian las metricas de pipelines posteriores (analisis morfologico, traduccion, recuperacion de informacion) al variar el punto de corte de segmentacion.
- Estudio de calibracion de probabilidades: al producir salidas explicitamente descritas como no calibradas, sirve como caso de prueba para tecnicas de calibracion sobre clasificadores neuronales.
- Validacion metodologica de evaluacion OOF: el ajuste de los pesos del combinador fuera de fold es un patron reutilizable en tareas compartidas, y este miembro permite auditar el procedimiento.
- No es adecuado como segmentador autonomo ni como servicio en produccion: la propia model card advierte que, usado en solitario, no reproduce ninguna puntuacion publicada.

## Benchmarks y rendimiento

Los unicos numeros disponibles son los del sistema completo, no los de este miembro. Se reproducen tal cual, con la advertencia de que no deben atribuirse al modelo individual.

| Sistema / componente | Metrica | Resultado |
|---|---|---|
| Sistema NP completo (ensemble de 5 miembros + stack lineal) | macro-F1 en practice test | 92,84 |
| Sistema NP completo (ensemble de 5 miembros + stack lineal) | macro-F1 en ciego (blind) | 91,3 |
| Miembro `e40` de forma aislada | macro-F1 | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible para este miembro por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,1 GB, pero para ejecutarlo hay que cargar el modelo base de 9B. En bf16, el peso del base ronda los 18 GB, mas overhead de activaciones y cache; en 8 bits, alrededor de 10 GB; en 4 bits, alrededor de 6-7 GB. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para ejecucion comoda en bf16; RTX 4090 (24 GB) es suficiente en bf16 con margen ajustado y en cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 3090, 4090) en bf16, y en tarjetas de 12-16 GB si se cuantiza el base.
- Opciones de despliegue: al no ser un checkpoint HF, ni vLLM ni TGI ni Ollama pueden cargarlo directamente. El flujo requiere `transformers==5.12.1`, el YAML de configuracion del experimento y codigo propio (`ensemble.py`, `verify_offcluster.py`) del repositorio NAMAA-Community-AraSeg-2026.
- Latencia y throughput estimados: no disponible. Al no publicarse la longitud de contexto ni el hardware de referencia, no se pueden dar cifras fiables.

## Comparativa con modelos similares

No hay datos publicados en la informacion proporcionada sobre modelos comparables en la subtarea NP de AraSeg 2026, ni sobre los otros cuatro miembros del ensemble (mas alla de que existen y de que los cinco son LoRA que requieren la misma version de `transformers`).

| Modelo | Parametros | Contexto | Resultado NP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e40-qwen35-9b-np` (este) | 9B (base) + LoRA | no disponible | Individual: no disponible | Apache 2.0 | Pesos `state_dict` en HF, sin formato HF |
| Otros miembros del ensemble NP | no disponible | no disponible | no disponible | no disponible | Referenciados en la coleccion `NAMAA-Space/araseg-2026` |
| Alternativas de la subtarea NP | no disponible | no disponible | no disponible | no disponible | No disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- No es un segmentador autonomo: es un votante de un ensemble. Usado solo, no reproduce ninguna puntuacion publicada.
- Sus salidas son probabilidades por palabra sin calibrar; no deben interpretarse como confianza directa ni usarse con umbrales arbitrarios.
- No funciona con `from_pretrained`: los pesos son un `state_dict` crudo que exige reconstruir la arquitectura desde el YAML y el modelo base.
- Dependencia de version estricta: los miembros LoRA requieren `transformers==5.12.1`; otras versiones pueden no instanciar correctamente las clases base.
- Unicamente soporta arabe; no hay evidencia de generalizacion a otros idiomas ni a variedades no cubiertas por los datos de la tarea.
- Sesgos conocidos: no disponible. No se documentan analisis de sesgo ni de robustez dialectal.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que la salida es un etiquetado; el riesgo equivalente es la sobre-segmentacion o infra-segmentacion sistematica, cuya magnitud no se documenta por miembro.
- Restricciones de licencia: Apache 2.0, heredada del modelo base, por lo que el uso comercial esta permitido en principio; conviene verificar las condiciones del propio `Qwen/Qwen3.5-9B`.
- Caveat para produccion: la model card esta orientada a reproducibilidad de un experimento de tarea compartida; no hay garantias de mantenimiento, soporte ni estabilidad de API.
- No se documentan longitud de contexto, cuantizaciones soportadas ni requisitos de hardware oficiales.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/NAMAA-Space/araseg-e40-qwen35-9b-np
- Coleccion del sistema completo AraSeg 2026: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo, configs y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Cita: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026.
- Busqueda web: no se han encontrado enlaces relevantes en los resultados disponibles; los unicos devueltos corresponden a foros de soporte de Microsoft y no guardan relacion con el modelo.
