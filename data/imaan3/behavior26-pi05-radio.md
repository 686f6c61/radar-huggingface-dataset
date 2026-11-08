# imaan3/behavior26-pi05-radio

## Resumen

`imaan3/behavior26-pi05-radio` es un checkpoint de politica robotica de tipo vision-language-action (VLA) basado en π₀.₅, el modelo desarrollado por Physical Intelligence. El modelo lo publican Imaan Soltanalipour y Jeffrey Le como participacion en la 2026 BEHAVIOR-1K Challenge (standard track), y resuelve una unica tarea: `turning_on_radio`, es decir, encender una radio con el robot humanoide Galaxea R1Pro en el entorno simulado BEHAVIOR-1K.

Tecnicamente es un fine-tune de 6.000 pasos sobre el checkpoint oficial `pi05_b1k` liberado por los organizadores, en formato orbax y empaquetado para la libreria openpi. Incorpora una cabeza auxiliar de progreso (una capa lineal sobre los tokens del experto de acciones) entrenada con entropia cruzada binaria, aunque dicha cabeza no se usa en inferencia: las acciones las genera el decodificador de flow matching sin modificar.

Su relevancia es doble. Por un lado, documenta de forma honesta un resultado negativo (la cabeza de progreso no aporta mejora medible, +0,019 con p = 0,73). Por otro, sirve como ejemplo reproducible de como adaptar π₀.₅ a una tarea concreta de manipulacion de largo horizonte con muy pocas demostraciones (200 episodios) y recursos modestos (un unico GPU con unos 6 GB de VRAM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.₅ (backbone vision-language PaliGemma + experto de acciones con flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16) |
| Idiomas soportados | no disponible (prompt en ingles, `turning_on_radio`) |
| Licencia | Gemma Terms of Use (Model Derivative de Gemma); codigo del repo MIT, openpi Apache-2.0 |
| Formato de pesos | orbax (`params/` unicamente, sin estado del optimizador) |

## Arquitectura y entrenamiento

π₀.₅ combina un backbone vision-language (derivado de PaliGemma) con un experto de acciones que genera trayectorias mediante flow matching condicionado por las observaciones visuales y el prompt textual. En este checkpoint, el backbone VLM se mantiene congelado (`pi05_b1k_frozen_vlm_progress`) y solo se ajusta el experto de acciones, lo que reduce el coste de entrenamiento.

El fine-tune se ejecuto durante 6.000 pasos con batch de 32 y semilla 42, sobre los 200 episodios de demostracion de `turning_on_radio` del dataset de la BEHAVIOR Challenge 2026. Se parte del checkpoint `pi05_b1k` publicado por los organizadores y se reutilizan sus estadisticas de normalizacion (`norm_stats.json`). La innovacion declarada es una cabeza auxiliar de progreso: una capa lineal sobre la media de los tokens del experto de acciones, supervisada con entropia cruzada binaria frente a una etiqueta de progreso hacia el objetivo y con peso de perdida λ = 0,15. Dicha cabeza no interviene en la inferencia; las acciones provienen del decodificador de flow matching original.

## Capacidades

- Control robotico de manipulacion para una unica tarea: encender la radio en el entorno BEHAVIOR-1K con el robot Galaxea R1Pro.
- Percepcion visual integrada: procesa observaciones de camara del robot para generar acciones motoras.
- Generacion de acciones por flow matching en bfloat16.
- Condicionamiento por prompt textual (en este checkpoint, unicamente el nombre de la tarea).
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni modos de pensamiento.
- No es un modelo de proposito general: no genera texto libre, codigo ni matematicas.
- Capacidades multilingues no disponibles.

## Casos de uso

- Investigacion en VLA para manipulacion de largo horizonte: punto de partida reproducible para estudiar el efecto de cabezas auxiliares (como la de progreso) sobre politicas π₀.₅ en tareas de BEHAVIOR-1K.
- Baseline para la BEHAVIOR Challenge: sirve como referencia de un unico task con resultado publicado (45% en el split 301-320) para comparar nuevas propuestas.
- Fine-tuning con pocas demostraciones: ejemplo practico de adaptar un checkpoint π₀.₅ a una tarea nueva con 200 episodios y VLM congelado, util para equipos con recursos limitados.
- Despliegue en simulacion con Docker: la imagen publicada permite levantar un servidor de politica en el puerto 8000 y conectarlo al evaluador oficial de BEHAVIOR-1K sin configurar el entorno manualmente.
- Estudio metodologico de resultados negativos: el informe tecnico documenta un A/B test con intervalo de confianza, util como plantilla para publicar evaluaciones rigurosas en robotica.
- Reproducibilidad de pipelines openpi: el repositorio incluye parches sobre openpi para soportar los parametros extra de la cabeza de progreso, lo que sirve como referencia de como extender la libreria.
- Evaluacion de coste-eficiencia: con unos 6 GB de VRAM en un unico GPU Ampere, permite experimentar con politicas VLA sin infraestructura dedicada.

## Benchmarks y rendimiento

| Evaluacion | Exitos |
|---|---|
| Instancias publicas de test 301-320, 1 rollout cada una (entrada enviada) | 9 / 20 (45%) |
| Instancias de entrenamiento 10-36, 4 rollouts cada una | 40 / 108 (37,0%) |
| Mismo fine-tune sin cabeza de progreso (control), instancias 10-36 | 38 / 108 (35,2%) |

La diferencia pareada A/B es de +0,019 (IC 95% [−0,091, +0,128], p = 0,73): la cabeza de progreso no produjo una mejora medible. El control tambien obtuvo 9/20 en 301-320. Al haberse abordado solo 1 de las 100 tareas del challenge, la puntuacion global estimada es de aproximadamente 0,0045. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB en bfloat16.
- GPU recomendada: una GPU con soporte de bfloat16 (Ampere o posterior); por ejemplo, RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPUs de consumo: si, en modelos Ampere o superiores con al menos 6 GB de VRAM.
- Opciones de despliegue: servidor de politica de openpi (`serve_b1k.py`) o la imagen Docker `wimaan3/behavior26-policy:armB-5999`; requiere el fork parcheado de openpi del repositorio del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| behavior26-pi05-radio (este) | no disponible | no disponible | 9/20 en test 301-320 | Gemma Terms of Use | Hugging Face + Docker |
| Checkpoint original `pi05_b1k` (organizadores) | no disponible | no disponible | no disponible en la informacion | no disponible | checkpoint liberado por los organizadores |
| Mismo fine-tune sin cabeza de progreso (control del autor) | no disponible | no disponible | 9/20 en test 301-320 | Gemma Terms of Use | no disponible como checkpoint publico |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de una unica tarea: solo esta entrenado para `turning_on_radio` y no generaliza a otras tareas del challenge.
- La innovacion principal (cabeza de progreso) no aporta mejora medible segun el propio autor.
- Puntuacion global estimada muy baja en el challenge (aproximadamente 0,0045) al cubrir solo 1 de 100 tareas.
- Requiere un fork parcheado de openpi: el codigo original no reconoce los parametros de la cabeza de progreso.
- Licencia Gemma: los pesos son un Model Derivative de Gemma y estan sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; el uso comercial requiere revisar dichos terminos.
- Riesgo de alucinacion: no aplica en el sentido textual, pero la politica puede generar trayectorias invalidas fuera de la distribucion de las 200 demostraciones.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de idioma: prompt en ingles y sin capacidades multilingues declaradas.
- Solo evaluado en simulacion (BEHAVIOR-1K); no hay evidencia de transferencia al robot fisico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imaan3/behavior26-pi05-radio
- Codigo, configs y logs de entrenamiento: https://github.com/wimaan3/behavior26
- Informe tecnico: `report/behavior26_report.pdf` en el repositorio de GitHub
- Imagen Docker: `wimaan3/behavior26-policy:armB-5999@sha256:84f7bd76d2edc28eeb88c4a16dd119d7c6fd3d5de55d77b85a46bd3ba904a73e`
- BEHAVIOR-1K Challenge 2026: https://behavior.stanford.edu/challenge/index.html
- openpi (libreria base): https://github.com/wensi-ai/openpi
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
