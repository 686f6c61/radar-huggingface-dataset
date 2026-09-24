# RLobot-jun/gr00t-n17-bigenlight-50per-15hz-freshbc10k-svf-iql50k-e08-k06-g025-lora16-step5000

## Resumen

Este repositorio no contiene un modelo completo, sino un paquete de adaptadores ligeros (LoRA mas criticos) para la pila robotica NVIDIA GR00T N1.7. Lo publica RLobot-jun y esta pensado para aplicarse sobre un modelo base concreto ya restaurado, no para cargarse con `from_pretrained` de forma autonoma. El bundle incluye una LoRA de rango 16 sobre el cabezal de accion DiT, un ensemble Q de IQL congelado y dos cabezas criticas de valor suave; en conjunto ocupa unos 130 MB y no duplica pesos del VLM ni del comportamiento base.

El modelo resuelve el problema de afinar una politica vision-lenguaje-accion (VLA) congelada mediante SVF (steering) sobre el cabezal de flujo, en lugar de reentrenar el modelo completo. Parte de un BC limpio a 15 Hz entrenado durante 10.000 pasos y aplica despues 5.000 actualizaciones de SVF, con un critico Q entrenado con IQL durante 50.000 actualizaciones (expectil 0,8, 10 cabezas). La frecuencia de control es de 15 Hz en exclusiva, no 30 Hz.

Es relevante ahora porque demuestra una ruta de post-entrenamiento de muy bajo coste (unos 130 MB de adaptadores) sobre un backbone VLA de 3B, reproducible con scripts concretos y con trazabilidad de revisiones. Se apoya en la base RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step10000 (revision 970ca589335032e0fb37961dfa5caa83a5c511be), que a su vez restaura el modelo NVIDIA subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptadores sobre GR00T N1.7: LoRA rank 16 / alpha 32 sobre el bloque DiT del cabezal de accion, mas ensemble Q de IQL y cabezas criticas con condicionamiento temporal de Fourier (Fourier time 16) |
| Parametros totales | adaptadores ~130 MB en total (LoRA 26,2 MB + Q ensemble 66,8 MB + criticas internas 37,1 MB); el backbone GR00T N1.7-3B no esta incluido |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; la model card no declara idiomas) |
| Licencia | NVIDIA License (etiquetas `license: other` y `license_name: nvidia-license`) |
| Formato de pesos | safetensors (`actor_lora.safetensors`, `env_q.safetensors`, `inner_critic.safetensors`) |

## Arquitectura y entrenamiento

El paquete se compone de tres artefactos de pesos. El primero es una LoRA sobre el DiT del cabezal de accion (`actor_lora.safetensors`, rank 16, alpha 32). El segundo es un ensemble Q de IQL congelado (`env_q.safetensors`), entrenado con 50.000 actualizaciones, expectil 0,8, error MSE escalar y 10 cabezas Q independientes con reinjecion de accion y agregacion por media, incluyendo propiocepcion. El tercero son dos cabezas internas de valor suave entrenadas (`inner_critic.safetensors`), con condicionamiento por tiempo de Fourier de dimension 16. El ancho de caracteristicas es 2212: caracteristicas VL agrupadas despues del BC, propiocepcion normalizada y embodiment; la Q tambien recibe el chunk de accion limpio.

El procedimiento de entrenamiento parte de un BC nuevo a 15 Hz inicializado de forma independiente desde NVIDIA (BC10k), sobre el que se aplican 5.000 actualizaciones de SVF con kappa 0,6, g 0,25 y c 1,44, batch 32, learning rate de 3e-4 para actor y red interna, flow 4 y 8 candidatos (con velocidad de referencia inicial compartida). La funcion Q permanece congelada durante todo el SVF. El espacio de accion valido es horizonte 16 x 7, con padding de modelo 40 x 132; los indices de accion de IQL seleccionan las 112 coordenadas validas. La recompensa es -1 por accion primitiva a 15 Hz, con objetivo 0 para el exito, gamma 0,99, retorno con descuento por chunk y bootstrap gamma^16. Quedan congelados el VLM, la proyeccion de observacion del BC, los codificadores/decodificadores de estado y accion, y la referencia. No se usa aumento de imagenes.

## Capacidades

- Control robotico a 15 Hz: genera chunks de accion (horizonte valido 16 x 7) para politicas VLA basadas en observacion visual y propiocepcion.
- Post-entrenamiento por SVF sobre un cabezal DiT congelado, con guiado explicito mediante gradiente de valor suave.
- Puntuacion y guiado por Q: el ensemble Q de IQL (10 cabezas, agregacion por media) permite puntuar acciones o guiar la generacion.
- Criticas internas de valor suave con condicionamiento temporal, usadas para regresion (minimo) y guiado por gradiente (media).
- Integracion con el stack GR00T N1.7 y su procesador/estadisticas de normalizacion.
- No dispone de tool calling ni de function calling: es un modelo de robotica, no un LLM conversacional.
- No se documentan capacidades de agentes multi-paso ni de razonamiento textual.
- No se declaran capacidades multilingues.

## Casos de uso

- Investigacion en aprendizaje por refuerzo robotico: el bundle permite experimentar con SVF y criticos IQL sobre una politica VLA congelada sin reentrenar el backbone, ya que solo se cargan unos 130 MB de adaptadores.
- Afinado de politicas de manipulacion a 15 Hz: util para equipos que ya tienen el BC base de 10k pasos y quieren aplicar mejoras por steering manteniendo intactos el VLM y la proyeccion de observacion.
- Evaluacion offline de politicas: el ensemble Q con 10 cabezas permite puntuar chunks de accion generados y comparar variantes antes de desplegar en robot.
- Guiado de generacion de acciones: las cabezas internas de valor suave se pueden usar para modular la generacion del cabezal de flujo mediante gradiente, mejorando la seleccion entre los 8 candidatos propuestos.
- Reproduccion de experimentos: el repositorio documenta revisiones exactas del modelo base y scripts de restauracion, lo que facilita la replicabilidad en laboratorio.
- Benchmarking de metodos de RL sobre VLA: sirve como punto de comparacion frente a DEAS/HL-Gauss u otros criticos, ya que esta version usa explicitamente un critico IQL con MSE escalar.
- Prototipado en simulacion: al requerir solo el modelo base de 3B, se puede integrar en entornos simulados con presupuesto de hardware moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna prueba de paridad en robot real ("no real-robot parity test is claimed").

## Requisitos de hardware

- El bundle de adaptadores ocupa unos 0,1 GB, pero requiere el modelo base GR00T N1.7-3B (no incluido) para funcionar.
- VRAM estimada: orientativamente ~6-8 GB solo para pesos del backbone en bf16, y en torno a 12-16 GB en inferencia con activaciones y procesamiento visual (estimacion a partir del tamano 3B; no confirmada por el autor).
- GPU recomendadas (estimacion): NVIDIA A100 40/80 GB, H100, L40S o RTX 4090. El backbone de 3B deberia caber en GPU de consumo con 24 GB (RTX 3090, RTX 4090) en precision reducida.
- Presupuesto temporal: a 15 Hz el ciclo de control es de 66,7 ms por paso, por lo que el sistema completo debe generar el chunk dentro de ese margen.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI (no es un LLM de texto). Requiere el codigo de GR00T N1.7, `restore_bc.py`, `inject_dit_lora(head, rank=16, alpha=32)`, `ProjectedFlowActor` y `load_actor_adapter` de `gr00t.rl.export_adapter`.
- Dependencia externa: el constructor del modelo GR00T sigue necesitando acceso normal a Cosmos en HuggingFace.
- Throughput y latencia medidos: no disponibles.

## Comparativa con modelos similares

No hay datos cuantitativos publicados en la informacion disponible para comparar rendimiento. A continuacion se situa el modelo frente a alternativas de la misma categoria (VLA para robotica) con los datos disponibles:

| Modelo | Parametros | Contexto | Frecuencia objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (GR00T N1.7 SVF) | adaptadores ~130 MB sobre base de 3B | no disponible | 15 Hz | NVIDIA License | repo HuggingFace, requiere base |
| NVIDIA GR00T N1.7 (base) | 3B (segun el nombre del backbone) | no disponible | segun configuracion | NVIDIA License | HuggingFace / NVIDIA |
| Physical Intelligence pi0 / pi0.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| OpenVLA | no disponible | no disponible | no disponible | no disponible | no disponible |

Los campos marcados como "no disponible" no aparecen en la informacion proporcionada y no se han verificado de forma independiente.

## Limitaciones y advertencias

- No es un modelo autonomo: no se puede cargar con `from_pretrained`; requiere restaurar primero el BC base en la revision exacta y aplicar despues la LoRA.
- Solo funciona a 15 Hz. No es valido para 30 Hz, y no corresponde al pipeline historico 30 Hz BC10k -> 15 Hz BC10k.
- No se debe aplicar sobre el BC de 20k, sobre otra revision de BC ni sobre un modelo ya adaptado con SVF.
- Compatibilidad estricta: los pesos del actor congelado deben coincidir con el BC exacto; el exportador verifica esta coincidencia y que todos los tensores sean finitos, pero no se ha validado en robot real.
- El bundle no incluye pesos de BC ni de VLM; sin el modelo base no hay inferencia posible.
- Requiere acceso a Cosmos en HuggingFace para construir el modelo GR00T.
- Riesgo de alucinacion: no aplica en el sentido de texto, pero la politica puede generar acciones invalidas fuera del horizonte valido; el padding zero-masked existente debe respetarse.
- Licencia NVIDIA License (`license: other`): antes de uso comercial hay que revisar los terminos exactos del archivo LICENSE, que no se detallan en la informacion disponible.
- Sesgos: no disponibles; no se documentan analisis de sesgo ni de cobertura de tareas.
- Idiomas: no aplica, pero tampoco se declaran capacidades linguisticas.
- Repositorio sin traccion: 0 descargas y 0 likes, lo que implica ausencia de validacion por terceros.
- Fecha de creacion registrada como 2026-09-24; conviene verificar la coherencia temporal al citar el modelo.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-15hz-freshbc10k-svf-iql50k-e08-k06-g025-lora16-step5000
- Modelo base (BC head-only 15 Hz): https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-15hz-from-nvidia-bc-head-only-step10000 (revision 970ca589335032e0fb37961dfa5caa83a5c511be)
- Codigo: https://github.com/jun981015/gr00t-bigenlight/tree/q-vgm-critic
