# Donghyun1228/pi05-libero-b200-temporal-contrast-view-large-1000-pilot-20261013

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario Donghyun1228 bajo el identificador `pi05-libero-b200-temporal-contrast-view-large-1000-pilot-20261013`. Se trata de un piloto de modelo de dinámica inversa (IDM, inverse dynamics model) construido sobre π₀.₅ (pi0.5), el modelo visión-lenguaje-acción (VLA) de Physical Intelligence, y ajustado específicamente para el benchmark de manipulación robótica LIBERO. El objetivo del experimento es evaluar si un mecanismo de contraste temporal de correspondencia entre observaciones futuras válidas y nulas mejora la política resultante frente a un control fijo.

El entrenamiento comprende exactamente 1000 actualizaciones aplicadas con batch B32 y semilla 42 (draw seed 170013), más 81 pasos de diagnóstico adicionales, lo que suma 1081 pasos hacia atrás. El grafo de despliegue resultante tiene 74 hojas (51 nativas más 23 hojas originales de muñeca-añadidas-para-inferencia) y se restaura en BF16. No se aplicó RLHF ni DPO en el sentido habitual de los LLM: la señal de entrenamiento proviene exclusivamente de gradientes del target-IDM válido, sin observaciones de origen ni retroalimentación de éxito de tarea.

La relevancia de la ficha es acotada y experimental: se trata de un piloto de 1000 pasos con una única criba de política de 400 episodios (`120/400`, 30,00 %) que el propio autor califica de preliminar y que no establece mejora general ni retención de conocimiento de manipulación. Es un artefacto útil para reproducir la metodología de asignación de multiplicadores (visión/llm/expert) y el contraste temporal, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (pi0.5); el modelo base se describe en fuentes de terceros como PaliGemma-3B (VLM) + Gemma-300M (experto de acción) |
| Parametros totales | no disponible (grafo de despliegue con 74 hojas en BF16; el modelo base π₀.₅ se describe en terceros como ~3,3 B) |
| Longitud de contexto | no disponible (ventana nativa H=10 sobre 305.406 ventanas de entrenamiento) |
| Tipos de cuantizacion | BF16 (formato de restauracion del grafo de despliegue); entrenamiento con hojas FP32 nativas |
| Idiomas soportados | no disponible (condicionado por instrucciones, no se declara cobertura idiomatica) |
| Licencia | apache-2.0 |
| Formato de pesos | BF16 (grafo de despliegue); repo de 13,1 GB con pesos, normalizacion de origen y artefactos de procedencia |

## Arquitectura y entrenamiento

La arquitectura es un VLA derivado de π₀.₅, el modelo de Physical Intelligence que combina un backbone visión-lenguaje (tipo PaliGemma-3B) con un experto de acción independiente (tipo Gemma-300M) que genera chunks de acción mediante flow matching. La integracion de terceros documentada en Tensorleap describe el checkpoint `pi05_libero` como una exportacion de un unico paso de flow matching con la actualizacion de Euler incorporada al grafo, de modo que la salida de cada paso es el siguiente chunk ruidoso y avanza el tiempo de flujo continuo desde 1.0.

El entrenamiento de este piloto es un experimento controlado de dinámica inversa. Se usan 305.406 ventanas nativas H=10, con entrenamiento balanceado por suite (ocho ventanas por suite por actualizacion, no balanceado por tarea). Las primeras 25 actualizaciones usan multiplicadores de vision/LLM/experto de 1/1/1; en 20 pasos predeclarados (25, 75, …, 975) un diagnostico independiente puntua el contraste direccional entre correspondencia futura valida y nula. La asignacion acotada [0,01, 20] solo cambia si dos controles nulos aleatorios y un control casi-temporal coinciden. Este umbral de confianza es heuristico y la estadistica usa el lote de diagnostico, no el lote real de entrenamiento. Solo los gradientes validos del target-IDM actualizan parametros; los momentos Adam de diagnostico se descartan y las confirmaciones de optimizador de diagnostico son cero. Los multiplicadores aplicados promedian vision 1,040499, LLM 1,064267 y experto 0,906816.

## Capacidades

- Generacion de acciones roboticas: produce chunks de accion para control de manipulacion en el benchmark LIBERO (cuatro suites, diez tareas cada una).
- Modelado de dinamica inversa (IDM): dado un par de observaciones, infiere la accion implicita, con un mecanismo de contraste temporal entre correspondencia futura valida y nula.
- Condicionamiento por instruccion: las tareas se dirigen mediante instrucciones de lenguaje dentro de la misma linea de recoleccion logica.
- Entrada multimodal: observaciones visuales de imagen base y de muñeca (23 hojas originales source-wrist anadidas para inferencia).
- Exportacion de politica determinista: el grafo de despliegue se restaura en BF16 como una unica etapa de flow matching.
- No se declara soporte de tool calling / function calling, agentes multi-paso, razonamiento conversacional ni capacidades de audio.

## Casos de uso

- Reproduccion de experimentos de investigacion en VLA: permite reproducir la asignacion de multiplicadores por modulo (vision/llm/experto) y el contraste temporal documentado, ya que el repo incluye planes, diarios y procedencia exacta del controlador.
- Evaluacion de politicas en LIBERO: se puede correr la criba de 400 episodios por semilla (cuatro suites x diez tareas x diez estados iniciales oficiales) y comparar frente a los controles fijos publicados.
- Estudio de mecanismos de contraste temporal: util para medir si el contraste entre futuro valido y nulo aporta mejora marginal en una politica de manipulacion.
- Analisis de procedencia y trazabilidad de checkpoints: el repo incluye snapshot de entrenamiento/evaluacion (`6da4916da7f7f769524b5c0bc8c0577fa92035ae`) e inferencia (`0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`) y verificaciones de exportacion en bruto.
- Integracion en pipelines de investigacion robotica con openpi: al declarar `library_name: openpi`, encaja en el ecosistema de servicio y despliegue de Physical Intelligence.
- Base para ablaciones de balanceo por suite frente a por tarea: util para estudiar como afecta el muestreo (ocho ventanas por suite) al rendimiento por tarea.
- Punto de partida para fine-tuning especifico de dominio en LIBERO, con la advertencia de que el autor no aporta confirmacion de politica de mayor tamano.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Criba de politica seed7 (400 episodios) | 120/400 (30,00 %) |
| view_large: control fijo → temporal | 117/400 → 120/400 (+0,75 pp) |
| yaw30: control fijo → temporal | 201/400 → 204/400 (+0,75 pp) |
| ur5e: control fijo → temporal | 167/400 → 168/400 (+0,25 pp) |

Condiciones declaradas: cuatro suites x diez tareas x diez estados iniciales oficiales, errores de rollout 0, cierre de procesos verificado, 16 clientes por GPU, MuJoCo 3.2.3. El autor indica que las pantallas de 400 episodios son preliminares y que no establecen mejora general ni retencion de conocimiento de manipulacion; tampoco se incluye confirmacion de politica de mayor tamano. No se publican metricas tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifra oficial; el grafo se restaura en BF16 y el repo ocupa 13,1 GB, por lo que un despliegue en BF16 requiere presumiblemente del orden de 7 a 14 GB segun se cargue solo el grafo de despliegue o artefactos adicionales (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizo sobre hardware tipo B200 (segun el nombre del repositorio y las referencias a B32); para inferencia se citan 16 clientes por GPU sin especificar el modelo.
- GPU de consumo: no confirmado; una RTX 4090 (24 GB) seria candidata razonable para inferencia en BF16 si el grafo de despliegue cabe en ese presupuesto, pero no hay confirmacion publicada.
- Opciones de despliegue: libreria `openpi` (declarada como `library_name`); existe una integracion de terceros con Tensorleap (`Tensorleap-hub/pi05-libero`) que exporta el modelo como una unica etapa de flow matching con Euler incorporado.
- Latencia y throughput: no disponibles; la ventana nativa es H=10 y el control se ejecuta por chunks, pero no se publican cifras de latencia ni de episodios por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este piloto (temporal-contrast view_large) | no disponible (base ~3,3 B en terceros) | H=10 | 120/400 (30,00 %) en seed7 | apache-2.0 | HuggingFace (0 descargas) |
| `lerobot/pi05_libero_base` | base π₀.₅ (referencia lerobot) | no disponible | no disponible | no disponible | HuggingFace (lerobot) |
| `pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003` (mismo autor) | base π₀.₅ | H=10 | no disponible (10.000 actualizaciones) | apache-2.0 | HuggingFace |
| π₀ (pi0) / π₀.₅ original (Physical Intelligence) | ~3,3 B en terceros | no disponible | no disponible en esta busqueda | no disponible | Paper y sitio de Physical Intelligence |

No se dispone de cifras comparativas homogeneas de MMLU/HumanEval/GSM8K por tratarse de un modelo de accion; la comparacion se limita a checkpoints de la misma familia π₀.₅ sobre LIBERO.

## Limitaciones y advertencias

- Resultados preliminares: el autor indica explicitamente que las pantallas de 400 episodios no establecen mejora general ni retencion de conocimiento de manipulacion, y que no hay confirmacion de politica de mayor tamano.
- Riesgo de sobreajuste experimental: 1000 actualizaciones con una unica criba de politica; las diferencias observadas son de +0,75 pp (view_large, yaw30) y +0,25 pp (ur5e), dentro de lo marginal.
- Puerta de confianza heuristica: el umbral de asignacion de multiplicadores [0,01, 20] es heuristico y la estadistica de diagnostico no usa el lote real de entrenamiento; los controles nulos son aleatorios.
- Desajuste de ruido de politica: los flujos estocasticos del servidor de politica son compartidos y el ruido por episodio no esta emparejado entre metodos, lo que limita la comparabilidad.
- Computo no equivalente: los 81 pasos de diagnostico adicionales anaden computo hacia atras, por lo que el total (1081) difiere del control fijo.
- Ausencia de senales de entrenamiento: no hay observaciones de origen, recompensa escalar de asignacion ni retroalimentacion de exito de tarea durante el entrenamiento.
- Idiomas y contexto: no se declaran coberturas idiomaticas ni longitud de contexto; el uso esta restringido al benchmark LIBERO y a instrucciones de tarea.
- Sesgos: no disponibles; no se documenta analisis de sesgo alguno.
- Uso comercial: la licencia apache-2.0 permitiria uso comercial del artefacto, pero el caracter de piloto sin validacion de politica y la dependencia de la familia π₀.₅/`openpi` deben revisarse antes de cualquier despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Donghyun1228/pi05-libero-b200-temporal-contrast-view-large-1000-pilot-20261013
- Dataset de origen del target-IDM: `Donghyun1228/libero-dense-contact-sweep-d2-20261002` (commit `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`)
- Checkpoint relacionado del mismo autor: https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003
- Modelo base en lerobot: https://huggingface.co/lerobot/pi05_libero_base
- Paper de π₀.₅ (Physical Intelligence): https://www.pi.website/download/pi05.pdf
- Integracion de terceros con Tensorleap: https://github.com/Tensorleap-hub/pi05-libero
- Snapshot de entrenamiento/evaluacion: `6da4916da7f7f769524b5c0bc8c0577fa92035ae`
- Snapshot de inferencia: `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`
