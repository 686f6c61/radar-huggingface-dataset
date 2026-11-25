# Pushkarrrr15151/PolyVL-finance-lora

## Resumen

PolyVL-finance-lora es un conjunto de adaptadores LoRA publicados por Pushkarrrr15151 sobre el modelo vision-lenguaje OpenGVLab/InternVL3-2B, congelado en la revision `899155015275a9b7338c7f4677e19c784e0e5a21`. Forma parte del sistema Polyvalent (PolyVL), un marco modular de adaptacion de bajo rango descrito en un manuscrito enviado a *Discover Computing* en 2026. El objetivo declarado es la asignacion de cartera en una cuenta simulada long-only sobre 49 constituyentes del indice Nifty 50.

El repositorio incluye dos etapas: la etapa A, que emite probabilidades sobre cuatro reglas de asignacion (equiponderacion, volatilidad inversa, momentum y reversion) sin ver datos de acciones ni de cuenta, y la etapa F, que asigna una calificacion de A a G a cada una de las 49 acciones a partir de un estado textual y compra las 15 mejor calificadas bajo una puerta de rotacion. Los adaptadores se entrenaron con gradiente de politica sobre datos historicos simulados.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso poco habitual de un VLM de 2B en finanzas cuantitativas; por otro, el propio autor advierte de que ningun adaptador mostro una ventaja fiable frente a mantener la cesta inicial, y que los resultados proceden de simulacion retrospectiva. Se publican para replicacion de investigacion, no como herramienta de inversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje InternVL3-2B |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptadores); el modelo base tiene su propia licencia |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 16 y alpha 32. En la etapa A se aplican a las proyecciones de atencion `q, k, v, o` y a la cabeza de salida, con dropout 0, y el modelo lee 4 tokens de etiqueta; se entrenaron en 2019-2021 y se seleccionaron por el ratio de Sharpe de validacion en 2022, con semilla 42. En la etapa F se aplican igualmente a las proyecciones de atencion y a la cabeza de salida, con 30 actualizaciones de gradiente de politica sobre julio de 2018 a 2022 y validacion en 2023-2024, ejecutando acciones enteras con comisiones y deslizamiento.

El entrenamiento es de aprendizaje por refuerzo (policy gradient) sobre el modelo base congelado, no un ajuste supervisado clasico. La etapa F adapta la cabeza de salida, lo que explica que su fichero `adapter_model.safetensors` ocupe unos 493 MB. El autor publica sumas de verificacion SHA-256 para ambos adaptadores y menciona otras etapas (B, C, D y E) cuyos adaptadores no se han liberado.

## Capacidades

- Clasificacion de regimen de asignacion: la etapa A emite probabilidades sobre cuatro reglas de cartera bajo un prompt constante.
- Puntuacion de acciones: la etapa F asigna una calificacion de A a G a cada una de las 49 acciones a partir de un estado textual.
- Seleccion de cartera: construccion de una cesta con las 15 acciones mejor calificadas, sujeta a una puerta de rotacion.
- Procesamiento de estado textual: el modelo consume descripciones textuales del estado de cuenta y del mercado.
- Capacidades heredadas del modelo base InternVL3-2B (vision y lenguaje), no documentadas especificamente para estos adaptadores.
- Soporte de tool calling, agentes o razonamiento multi-paso: no documentado para estos adaptadores.

## Casos de uso

- Replicacion de investigacion en asignacion de cartera: reproducir las etapas A y F del manuscrito Polyvalent con los scripts de entrenamiento y evaluacion incluidos, usando datos de precios reconstruidos con el script del repositorio.
- Estudio de aprendizaje por refuerzo aplicado a decisiones financieras: analizar como un VLM de 2B con adaptadores LoRA de rango 16 aprende politicas de seleccion sobre 49 activos con un presupuesto de 30 actualizaciones de gradiente de politica.
- Evaluacion de marcos de adaptacion modular: comparar el rendimiento de adaptadores LoRA frente al mismo modelo con el adaptador desactivado, tal como reporta el autor en sus tablas de resultados.
- Analisis de sesgos en agentes financieros: examinar por que la politica entrenada no supera de forma fiable a la cesta inicial y que senales textuales influyen en las calificaciones A-G.
- Docencia y divulgacion: ilustrar las limitaciones de la simulacion retrospectiva y del uso repetido de una misma ventana temporal en la evaluacion de estrategias.
- Pruebas de infraestructura PEFT: validar pipelines de carga de adaptadores LoRA con cabeza de salida adaptada sobre un VLM de 2B en entornos de investigacion.

## Benchmarks y rendimiento

Resultados de simulacion retrospectiva reportados por el autor (capital inicial de 100 000 INR; rentabilidad neta en %):

| Ventana | Politica | Entrenada | Mismo modelo, adaptador desactivado | Mantener cesta inicial |
|---|---|---:|---:|---:|
| 1 ene 2025 - 30 ene 2026 | Etapa A (acciones fraccionarias) | 13,28 | 11,22 | 13,06 |
| 1 ene 2025 - 30 ene 2026 | Etapa E, 3 semillas | 10,43-10,53 | 10,37 | 12,56 |
| 1 ene 2025 - 30 ene 2026 | Etapa F | 14,53 | 13,73 | 12,56 |
| 30 ene - 17 nov 2026 (datos posteriores) | Etapa F | -2,27 | -1,58 | 9,49 |

El autor senala que la ventana 2025-enero 2026 se examino repetidamente durante el desarrollo y no es una prueba virgen; que el checkpoint liberado de la etapa F (actualizacion 4) no es el que selecciona la regla de validacion declarada (el checkpoint de la actualizacion 14 obtuvo 9,16 % en la misma ventana); que en datos posteriores la etapa F quedo por detras de mantener la cesta en 8 de 9 capitales iniciales; y que todos los intervalos bootstrap de la diferencia frente a mantener la cesta incluyen cero en la ventana de desarrollo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; el modelo base es de 2B parametros y los adaptadores anaden unos 493 MB en la etapa F. Una estimacion razonable en precision completa ronda los 5-6 GB, y en cuantizacion de 8 bits o 4 bits puede caber en GPUs de consumo con 6-8 GB, aunque el autor no publica cifras.
- GPU recomendadas: no documentadas por el autor; por tamano del modelo base, una RTX 3060 de 12 GB o superior deberia ser suficiente para inferencia en cuantizacion, y A100/H100 para entrenamiento o evaluacion a mayor escala.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no se confirma en la model card.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base InternVL3-2B; no se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyVL-finance-lora (este) | Adaptadores LoRA sobre base de 2B | no disponible | RL para asignacion de cartera | Apache-2.0 | Hugging Face, 0 descargas |
| OpenGVLab/InternVL3-2B | 2B | no disponible en esta ficha | VLM generalista | propia del modelo base | Hugging Face |
| Otros adaptadores financieros sobre VLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (adaptadores LoRA financieros sobre VLM de 2B) en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor afirma que ningun adaptador mostro una ventaja fiable sobre mantener la cesta inicial; los resultados son de simulacion retrospectiva.
- La ventana 2025-enero 2026 se reutilizo repetidamente durante el desarrollo y no constituye una prueba independiente.
- El checkpoint liberado de la etapa F (actualizacion 4) no es el seleccionado por la regla de validacion declarada.
- En datos posteriores (30 ene - 17 nov 2026) la etapa F obtuvo -2,27 % frente a 9,49 % de mantener la cesta, y quedo por detras en 8 de 9 capitales iniciales.
- Los intervalos bootstrap de la diferencia frente a mantener la cesta incluyen cero en la ventana de desarrollo.
- Riesgo de alucinacion y sesgos: no documentados especificamente; al tratarse de un VLM de 2B, cabe esperar las limitaciones habituales de modelos de ese tamano.
- Idiomas soportados: no disponibles.
- Los precios de cambio en bruto no se redistribuyen; deben reconstruirse con el script del repositorio sujeto a los terminos del proveedor de datos.
- Uso comercial: los adaptadores son Apache-2.0, pero el modelo base tiene su propia licencia que debe revisarse; ademas, el uso como herramienta de inversion no esta respaldado por los resultados.
- Solo se liberan las etapas A y F; las etapas B, C, D y E no estan disponibles, lo que limita la replicacion completa del manuscrito.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pushkarrrr15151/PolyVL-finance-lora
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-2B
- Manuscrito citado: Rai P, Dhande P, Jha OA, Sankhe S. "Polyvalent: A Modular Framework for Low-Rank Adaptation Across Heterogeneous Tasks". *Discover Computing*, 2026 (en revision; sin enlace disponible en la informacion proporcionada).
- Repositorio del proyecto con scripts de datos: no disponible en la informacion proporcionada.
