# Songyuan666/TC-RGBD-hotdog-step06886

## Resumen

TC-RGBD-hotdog-step06886 es un checkpoint de política robótica para el modelo pi0.5, especializado en la tarea `cook_hot_dogs` del benchmark BEHAVIOR-1K (2025-challenge-demos). Lo publica el usuario Songyuan666 como un fine-tuning de su propio modelo base `Songyuan666/TC-pi0.5`, y representa una continuación del entrenamiento original (step5000) con 1886 actualizaciones completas adicionales, hasta un total acumulado de 6886 pasos. El modelo no es un transformer de lenguaje al uso: es un artefacto de inferencia de robótica que combina un componente de visión/VLM, un ActionExpert, tres codificadores de grafo, selección de habilidades y una GRU, empaquetado en un formato propio (`tc_esgr_full_v2`).

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación de un solo autor, con 0 descargas y 0 likes en el momento de la consulta, publicado para documentar un resultado de evaluación concreto (10/20 éxitos, Q medio 0.600) sobre las instancias 301–320 de `cook_hot_dogs`. El autor es explícito en que el entrenamiento quedó incompleto (`training_complete=false`), que la evaluación usa entradas privilegiadas de Oracle (no percepción RGB-D pura) y que las instancias evaluadas ya se habían usado durante el desarrollo, por lo que no constituyen un benchmark held-out limpio.

El repositorio ocupa 7,5 GB e incluye pesos `safetensors`, metadatos con hashes y alias, código fuente congelado y los contratos de cliente/servidor empleados en la evaluación. No es un modelo cargable con `AutoModel` de Transformers ni un LLM: su uso requiere el stack OpenPI/PT50, los assets de tokenizer y normalización del modelo base, y los assets de escena de BEHAVIOR/OmniGibson/Isaac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida propietaria `tc_esgr_full_v2`: visión/VLM + ActionExpert + 3 codificadores de grafo + selección de habilidades + GRU + CNN local de profundidad de cabeza; deriva de pi0.5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (secuencia de entrenamiento de longitud 2; chunks de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente FP32/BF16, sin confirmar) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible (el autor indica que aplican los términos del código, modelo base, dataset y simulador existentes; esta release no concede derechos sobre assets de terceros) |
| Formato de pesos | `safetensors` (`checkpoint/model.safetensors`) + `metadata.json` con hashes y alias de pesos atados; código fuente en `source/frozen_source.tar.gz` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura TC del checkpoint original step5000, que retiene el componente de visión/VLM, el ActionExpert, tres codificadores de grafo, el módulo de selección de habilidades y la GRU. La continuación añade profundidad de cabeza mediante una CNN local y alinea las observaciones de entrenamiento y online junto con los hechos actuales de la tarea (Task facts). El entrenamiento se realizó con AdamW en FP32 con estados reinicializados para esta continuación (los 5000 updates previos no cuentan como updates nuevos del optimizador), batch global 48, longitud de secuencia 2, y configuración final en dos GPUs con micro-batch 1 y acumulación 24.

El autor documenta 1886 actualizaciones completas de modelo completo sobre el step5000, para un total acumulado de 6886 updates fuente+nuevos. El plan original contemplaba 2500 updates adicionales, pero se detuvo tras el update 1886, por lo que el checkpoint se marca explícitamente como `training_complete=false`. No se aportan datos sobre volumen de tokens, composición del dataset ni si hubo RLHF/DPO; el dataset declarado es `behavior-1k/2025-challenge-demos`. La evaluación se hizo con semilla de acción fija 42, semilla de entorno 0, chunks de 32 acciones, límites nativos del controlador y presupuesto de residencia de texturas de 0,05, con resoluciones de cámara y física sin cambios.

## Capacidades

- Control robótico para la tarea `cook_hot_dogs` (cocinar dos perros calientes) en el simulador BEHAVIOR/OmniGibson, con observaciones RGB-D y entradas privilegiadas de Oracle (identidades, poses y estado de objetos).
- Planificación y ejecución de habilidades de manipulación de horizonte largo, apoyada en los tres codificadores de grafo y el módulo de selección de habilidades.
- Procesamiento de observaciones multimodales (RGB-D) mediante el componente de visión/VLM heredado de pi0.5.
- Generación de acciones en chunks de 32 pasos con el controlador nativo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso genéricos, multilingüismo, modo thinking, audio ni visión general fuera del pipeline robótico.

## Casos de uso

- Investigación en manipulación de horizonte largo: reproducir el protocolo de evaluación del autor (semilla 42, 20 trials, instancias 301–320) para comparar variantes de la arquitectura TC sobre `cook_hot_dogs`.
- Estudio de alineación de observaciones: el checkpoint incorpora alineación explícita entre observaciones de entrenamiento y online más profundidad de cabeza CNN, lo que lo hace útil para analizar el impacto de esa alineación en la tasa de éxito (9/20 → 10/20 en la comparación no controlada del autor).
- Base para fine-tuning posterior: al conservar el stack TC completo (VLM, ActionExpert, codificadores de grafo, GRU), puede servir como punto de partida para otras tareas de BEHAVIOR-1K, siempre que se disponga del dataset y del entorno de simulación.
- Referencia de contratos cliente/servidor: los directorios `client/` y `deployment/` documentan el contrato RGB-D evaluado, útiles para construir un pipeline de inferencia propio adaptando las rutas específicas de máquina.
- Evaluación de robustez con entradas Oracle: permite medir el techo de rendimiento cuando se dispone de estado privilegiado del simulador, como cota superior frente a percepción RGB-D pura.
- Docencia y divulgación sobre robótica simulada: el paquete incluye código fuente congelado con hashes por fichero y `MANIFEST.json`/`SHA256SUMS`, lo que facilita la verificación de integridad en ejercicios reproducibles.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Tasa de exito (`cook_hot_dogs`, instancias 301–320) | 10/20 (50%) | Semilla de acción 42, semilla de entorno 0, 32-action chunks, entorno público local 2026 |
| Q oficial medio (completitud parcial de objetivo) | 0.600 | Métrica parcial, distinta del éxito binario |
| Trials con terminal natural oficial | 20/20 | No se grabó vídeo |
| Comparación con TC original step5000 | 9/20, Q medio 0.5 | Diferencia no es una ablación controlada de un solo factor |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de robótica de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 7,5 GB, pero incluye pesos, código y contratos; el tamaño exacto de los pesos en memoria no se especifica.
- GPU recomendadas: el autor menciona una configuración de entrenamiento en dos GPUs con micro-batch 1 y acumulación 24, sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No disponible; no se documenta.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el stack OpenPI/PT50, el tokenizer y assets de normalización de `Songyuan666/TC-pi0.5`, las dependencias OpenPI y los assets de escena BEHAVIOR/OmniGibson/Isaac (externos). El lanzador de referencia es `deployment/serve_latest.py` con `tgr.factory.create` y `tgr.serve.GraphAdapter`, que impone rutas de autorización y filesystem locales y no es un lanzador portable de un solo comando.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento `cook_hot_dogs` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TC-RGBD-hotdog-step06886 | no disponible | no disponible | 10/20 (Q 0.600) en instancias 301–320 | no disponible | Público en HF, 0 descargas |
| TC-pi0.5 (modelo base, Songyuan666) | no disponible | no disponible | no disponible en esta ficha | no disponible | Público en HF |
| TC original step5000 | no disponible | no disponible | 9/20 (Q 0.5) en el mismo protocolo | no disponible | Referenciado por el autor, no verificado aquí |

No se dispone de datos de otros modelos de robótica comparables (por ejemplo, políticas pi0.5 de terceros u otras variantes TC) en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: `training_complete=false`; el plan de 2500 updates se detuvo en 1886.
- Evaluación con entradas privilegiadas de Oracle (identidades, poses y estado de objetos): los resultados son una cota superior en simulación, no percepción RGB-D pura ni resultados en robot real.
- Las instancias 301–320 ya se usaron durante el desarrollo de versiones previas; no son un held-out limpio.
- La comparación 9/20 vs 10/20 mezcla entrenamiento adicional y alineación de entradas/profundidad, por lo que no es una ablación de un solo factor.
- El autor no reclama generalización más allá de esta tarea y protocolo.
- No es un checkpoint de Transformers (`AutoModel`); requiere el formato propietario `tc_esgr_full_v2` y el stack OpenPI/PT50.
- El servidor de referencia impone rutas locales de autorización y filesystem; requiere adaptación antes de usarse en otro entorno.
- La release contiene pesos de inferencia, no el estado del optimizador (Adam/RNG) ni el dataset de entrenamiento; no permite reanudar el entrenamiento desde el punto exacto.
- Licencia no disponible: el autor indica que aplican los términos del código, modelo base, dataset y simulador, y que esta release no concede derechos sobre assets de terceros. Verificar antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible; al ser una política robótica, el riesgo relevante es de fallo de ejecución física en simulación, no de generación de texto.
- Idiomas y contexto: no aplicables o no disponibles; el modelo no es lingüístico.
- La verificación de hashes (`MANIFEST.json`, `SHA256SUMS`) y el pin del commit del Hub no implican una repetición independiente de los 20 trials.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Songyuan666/TC-RGBD-hotdog-step06886
- Modelo base: https://huggingface.co/Songyuan666/TC-pi0.5
- Dataset declarado: `behavior-1k/2025-challenge-demos` (referenciado en la model card; no se proporciona URL directa)
- Repositorio de código, paper o demo adicionales: no disponibles en la información proporcionada.
