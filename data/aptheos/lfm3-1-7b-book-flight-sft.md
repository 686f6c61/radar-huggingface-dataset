# Aptheos/lfm3-1.7b-book-flight-sft

## Resumen

El adaptador `Aptheos/lfm3-1.7b-book-flight-sft` es un ajuste fino mediante LoRA sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario Aptheos. Su propósito es muy específico: permitir que el modelo complete la tarea `book-flight` del entorno MiniWoB (reserva de vuelos simulados) operando un navegador real a través de llamadas nativas a herramientas (tool calling). No es un modelo de propósito general, sino una política especializada para control de navegador.

El adaptador se entrena por supervisión sobre trazas generadas por un solucionador programado (scripted solver), en tres etapas, y se evalúa sobre tareas reservadas del entorno MiniWoB `book-flight-nodelay`, con un máximo de 15 turnos. El resultado reportado es de 160/200 tareas resueltas con éxito (80,0%), frente a 0/100 del modelo base en tareas no vistas.

Es relevante ahora porque demuestra que un modelo pequeño (1.700 millones de parámetros) con un adaptador LoRA ligero (0,3 GB de repositorio) puede ejecutar tareas de agente web con tool calling de forma fiable en un entorno controlado, y porque documenta con transparencia el proceso, las semillas y las limitaciones del experimento. No obstante, su alcance es estrictamente el de una tarea simulada y no se ha probado en sitios web reales ni en materia de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre el transformer LiquidAI/LFM3-1.7B |
| Parámetros totales | No disponible (el adaptador LoRA tiene r=32, alpha=64; el modelo base tiene 1.700 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base LFM3-1.7B no especifica contexto en la información proporcionada) |
| Tipos de cuantización | No disponible (entrenado y evaluado en FP16) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (uso comercial limitado a entidades con ingresos anuales inferiores a 10 millones de dólares) |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base usa código remoto (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parámetros, mediante LoRA con r=32 y alpha=64, entrenado en FP16 en una Colab T4 gratuita. El ajuste se realiza en tres etapas: 72 actualizaciones a 1e-4 y 88 actualizaciones a 1e-4 centradas en habilidades de fecha y vuelo, ambas sobre las semillas 100–131, seguidas de 215 actualizaciones a 3e-5 sobre las 94 semillas utilizables de 100–195 (AdamW, 4 ejemplos por actualización). La selección del checkpoint se hace con las tareas de desarrollo 70–99, obteniendo 25/30.

Los datos de entrenamiento son trazas generadas por un solucionador programado, no por interacción humana ni por RL. El autor documenta explícitamente que no se ejecutó GRPO porque las muestras apenas variaban: en 12 tareas nuevas con cuatro muestras cada una, todos los grupos coincidían token a token (6 tareas a temperatura 1,25 con top_p 0,95 y 6 a temperatura 1 sin recorte, donde un episodio completo se reproducía con probabilidad 0,936–0,987). Tampoco se aplicó DPO. El adaptador incluye una réplica entrenada con la semilla 47 que corrobora la receta con 25/30 en las mismas tareas de desarrollo, aunque nunca se evaluó en las tareas reservadas.

## Capacidades

- Control de navegador mediante llamadas nativas a herramientas (tool calling) en el entorno MiniWoB `book-flight-nodelay`.
- Ejecución de tareas de reserva de vuelos simulados con hasta 15 turnos por episodio.
- Generación de llamadas a herramientas bien formadas: en la evaluación reservada, las 1.823 llamadas producidas fueron sintácticamente válidas.
- Razonamiento multi-paso dentro de un episodio de agente (selección de fechas, comparación de vuelos, confirmación de reserva).
- Generación de texto como capacidad heredada del modelo base, aunque no es el objeto del ajuste.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni multilingüismo específicas para este adaptador.

## Casos de uso

- Automatización de flujos de reserva en entornos simulados: el adaptador puede completar la tarea `book-flight` de MiniWoB con un 80% de éxito, lo que lo hace útil para probar pipelines de agentes web antes de pasar a producción.
- Investigación en control de navegador: sirve como política de referencia reproducible (semillas, hashes SHA-256 y guía de reproducción publicados) para comparar nuevas técnicas de SFT o RL en tareas de agente.
- Evaluación de tool calling en modelos pequeños: permite medir la fiabilidad de las llamadas a herramientas de un modelo de 1.700 millones de parámetros en un entorno acotado, con 1.823 llamadas bien formadas registradas.
- Generación de datos de entrenamiento para agentes: las trazas del adaptador y el solucionador programado pueden usarse para ampliar conjuntos de datos de comportamiento de navegador.
- Pruebas de regresión de frameworks de agentes: al ser un adaptador ligero (0,3 GB) y ejecutable en una T4, se puede integrar en CI para verificar que los cambios en el parser de acciones o en el prompt no degradan el éxito.
- Docencia y demostraciones: el Space asociado (`Aptheos/browser-control-demo`) permite visualizar episodios, incluidos fallos, para explicar cómo razona un agente con tool calling en un navegador.
- Análisis de fallos en agentes: el conjunto de evidencia (`lfm-browser-control-evidence`) y el script `verify_reported_numbers.py` permiten auditar los 40 fallos y las 21 llamadas fallidas en navegador.

## Benchmarks y rendimiento

| Política | Tareas | Éxito nativo |
|---|---|---|
| Modelo base | No vistas, 10000–10099 | 0/100 |
| Este adaptador | Reservadas, 10100–10299, evaluadas una vez | 160/200, 80,0% (IC 95% Wilson 73,9–85,0%) |

Datos adicionales de la evaluación: las 1.823 llamadas a herramientas fueron bien formadas; 21 fallaron en el navegador en 3 episodios; hubo 37 fallos terminales y 3 paradas por horizonte; en 35 de los 40 fallos, el vuelo reservado era visiblemente peor que el mejor mostrado. Las dos filas usan semillas y implementaciones de atención distintas, por lo que no están emparejadas. En las tareas de desarrollo 70–99, el adaptador obtiene 25/30.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base de 1.700 millones en FP16 requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: el entrenamiento y la evaluación se realizaron en una Colab T4 gratuita en FP16; para prompts largos se necesita SDPA y prefill troceado de 512 tokens.
- Cabe en GPU de consumo: sí, en una T4 (16 GB) y previsiblemente en GPUs consumer con al menos 8 GB en FP16.
- Opciones de despliegue: `transformers` + `peft` con `trust_remote_code=True`, revisión fijada `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7` y Python 3.12; el repositorio incluye `requirements-lfm3.txt`.
- Latencia y throughput: no disponibles; la evaluación usa 128 tokens por llamada, temperatura 1,0, top_p 0,95, top_k desactivado, penalización de repetición 1,0 y thinking desactivado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LFM3-1.7B + LoRA) | 1.700 M (base) | No disponible | book-flight MiniWoB | LFM Open License v1.0 | HuggingFace, 8 descargas |
| Modelo base LiquidAI/LFM3-1.7B | 1.700 M | No disponible | Propósito general | LFM Open License v1.0 | HuggingFace |
| Réplica seed 47 del mismo adaptador | 1.700 M (base) | No disponible | book-flight MiniWoB | LFM Open License v1.0 | Incluida en el mismo repo |

No se dispone de datos de benchmarks de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- El alcance es una única tarea y familia: vuelos simulados en MiniWoB `book-flight-nodelay`, con un máximo de 15 turnos y una configuración de decodificación concreta. No mide nada sobre otros sitios web.
- No se ha probado en materia de seguridad; un agente que actúe sobre reservas o cuentas reales necesita salvaguardas propias.
- Tasa de éxito del 80,0%: en 35 de los 40 fallos, el vuelo reservado era peor que el mejor mostrado, lo que indica errores de selección, no solo de formato.
- Riesgo de alucinación y de acciones incorrectas en el navegador: 21 llamadas fallaron en el navegador en 3 episodios.
- La licencia LFM Open License v1.0 limita el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dólares.
- El modelo base usa código remoto (`trust_remote_code=True`), que debe revisarse antes de ejecutarlo.
- Los resultados de las dos filas de la tabla de benchmarks no están emparejados (semillas y atención distintas), por lo que la comparación no es estrictamente controlada.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera del entorno MiniWoB.
- La reproducibilidad exige fijar la revisión del modelo base, el parser estricto de acciones y el prompt del repositorio; los valores por defecto del modelo base difieren del decodificador evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aptheos/lfm3-1.7b-book-flight-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio de código: https://github.com/DerrickKirimi/browser-control
- Guía de reproducción: https://github.com/DerrickKirimi/browser-control/blob/main/docs/reproducing.md
- Demo (Space): https://huggingface.co/spaces/Aptheos/browser-control-demo
- Conjunto de evidencia: https://huggingface.co/datasets/Aptheos/lfm-browser-control-evidence
