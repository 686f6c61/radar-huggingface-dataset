# Dwipz/Anchor-Align

## Resumen

Anchor-Align es un método de finetuning para modelos de visión-lenguaje-acción (VLA) desarrollado por Dwipz (Dwip Dalal) que aborda un problema conocido en robótica: el behavior cloning (BC) estándar sobre un VLM preentrenado destruye progresivamente las representaciones semánticas y visuales que sustentan la generalización. El método añade dos pérdidas ligeras sobre la predicción de acciones: una de anclaje de representaciones (representation anchoring) que mantiene al modelo entrenable cerca de una copia congelada del VLM original, y otra de alineación lenguaje-acción (language-action alignment) que vincula el estado oculto previo a la acción con una etiqueta discreta de dirección de movimiento derivada de la ejecución.

El modelo resultante se basa en Prismatic Qwen2.5-0.5B (con codificadores visuales DINOv2 y SigLIP, 24 capas) y se entrena con LoRA de rango 64 y una cabeza de acción MLPResNet con regresión L1. Los resultados publicados muestran una mejora sustancial en robustez: 22.6% de éxito en LIBERO-PRO position swap frente al 2.3% del BC estándar, 90.3% de media en LIBERO-Plus (frente a 85.1%) y un aumento del 28.3% al 54.2% en éxito real sobre un brazo UFactory xArm7. Se distribuyen cuatro checkpoints entrenados en las suites LIBERO Spatial, Object, Goal y Long, todos bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en Prismatic Qwen2.5-0.5B (DINOv2 + SigLIP, 24 capas) con LoRA rank 64 y action head MLPResNet |
| Parametros totales | No disponible (modelo base Qwen2.5-0.5B, ~500M, mas adaptadores LoRA y cabeza de accion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Anchor-Align parte de un VLM preentrenado, concretamente Prismatic Qwen2.5-0.5B, que combina el LLM Qwen2.5 de 0.5B con dos codificadores visuales: DINOv2 y SigLIP, sobre 24 capas. Sobre este modelo se aplica un finetuning con LoRA de rango 64 y una cabeza de acción MLPResNet que regresa directamente las acciones del robot mediante pérdida L1. La innovación principal son dos pérdidas auxiliares: (i) el anclaje de representaciones, que fuerza a que las representaciones internas del modelo entrenable no se alejen de las de una copia congelada del VLM original, preservando así el razonamiento visual y semántico; y (ii) la alineación lenguaje-acción, que supervisa el estado oculto previo a la predicción de acción con una etiqueta discreta de dirección de movimiento derivada de la trayectoria ejecutada.

El entrenamiento se realiza sobre las cuatro suites estándar de LIBERO (Spatial, Object, Goal y Long) con distintos pesos de la pérdida KL (0.10 a 0.15) y pasos que van de 2.5k a 45k según la suite. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las propias suites LIBERO. El código de entrenamiento no se incluye en la versión inicial del repositorio; solo se publican los pesos y el código de inferencia y evaluación.

## Capacidades

- Generación de acciones robóticas (posiciones, orientaciones o comandos de articulación) a partir de instrucciones en lenguaje natural y observaciones visuales de cámara.
- Generalización a perturbaciones del entorno: cambios de posición de objetos, reordenamiento de la escena, variaciones de iluminación, ruido en sensores, cambios de vista de cámara y condiciones de inicialización del robot.
- Preservación del razonamiento visual y semántico del VLM base gracias al anclaje de representaciones, lo que permite mantener el rendimiento bajo distribución shift.
- Alineación explícita entre el lenguaje y la acción mediante la supervisión del estado oculto pre-acción con etiquetas de dirección de movimiento.
- No se documentan capacidades de tool calling, generación de texto libre ni multimodalidad más allá de la entrada visión + lenguaje para control robótico.

## Casos de uso

- Manipulación robótica en entornos domesticos: el modelo puede ejecutar tareas como "coge la taza roja y ponla en el plato" a partir de una sola cámara, gracias a su robustez ante cambios de iluminación y disposición de objetos.
- Automatizacion industrial flexible: en lineas de montaje donde los objetos cambian de posicion, Anchor-Align mantiene un 96.2% de exito en object swap y 97.4% en obj. layout, reduciendo la necesidad de reentrenamiento ante variaciones menores.
- Robotica de servicio en entornos no estructurados: su tolerancia a ruido de sensores (96.9% en LIBERO-Plus) y cambios de vista de camara (96.3%) lo hace adecuado para plataformas moviles con camaras montadas en el propio robot.
- Investigacion en aprendizaje por imitacion: los checkpoints publicados permiten reproducir los resultados de LIBERO y comparar metodos de finetuning de VLA sin necesidad de entrenar desde cero.
- Despliegue en robots reales de bajo coste: el equipo reporta un aumento del 28.3% al 54.2% en exito real sobre un UFactory xArm7, lo que sugiere viabilidad en hardware asequible.
- Evaluacion de robustez y generalizacion: las suites LIBERO-PRO y LIBERO-Plus proporcionan un banco de pruebas estandarizado para medir la degradacion bajo perturbaciones, util para validar otros modelos VLA.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion estan reproducidos del paper (arXiv:2607.13429) e incluidos en la model card. No se han publicado resultados de benchmarks adicionales fuera de las suites LIBERO.

### Suites LIBERO estandar (tasa de exito, %)

| Metodo | Spatial | Object | Goal | Long |
|---|---:|---:|---:|---:|
| Diffusion Policy | 78.3 | 92.5 | 68.3 | 50.5 |
| SmolVLA-0.24B | 87.0 | 93.0 | 88.0 | 63.0 |
| SmolVLA-2.25B | 93.0 | 94.0 | 91.0 | 77.0 |
| OpenVLA-OFT | 94.3 | 95.2 | 91.7 | 86.5 |
| VLA-Adapter (standard BC) | 96.0 | 99.8 | 96.0 | 89.0 |
| **Anchor-Align VLA (ours)** | **98.4** | **100.0** | **97.2** | **90.8** |

### LIBERO-PRO y LIBERO-Plus (tasa de exito, %)

| Metodo | LIBERO-PRO Lang. Reph. | LIBERO-PRO Object Swap | LIBERO-PRO Pos. Swap | LIBERO-PRO Mean | LIBERO-Plus Mean |
|---|---:|---:|---:|---:|---:|
| Co-training + KI* | 54.0 | 77.4 | 0.0 | 43.8 | 57.1 |
| MolmoAct | 77.8 | 82.4 | 0.0 | 53.4 | 60.8 |
| OpenVLA-OFT | 74.4 | 95.2 | 0.0 | 56.5 | 74.1 |
| VLA-Adapter (standard BC) | 91.1 | 89.6 | 2.3 | 61.0 | 85.1 |
| **Anchor-Align VLA (ours)** | **97.0** | **96.2** | **22.6** | **71.9** | **90.3** |

*Implementacion propia de knowledge insulation adaptada a VLA-Adapter.

Ademas, se reporta un exito real del 54.2% en un UFactory xArm7, frente al 28.3% del BC estandar.

## Requisitos de hardware

No se proporcionan requisitos de hardware en la informacion disponible. Dado que el modelo base es Qwen2.5-0.5B (aproximadamente 500M de parametros) con LoRA y dos codificadores visuales, el peso total del repositorio es de 15.8 GB, lo que sugiere que los codificadores visuales (DINOv2 y SigLIP) dominan el tamano. Es plausible que la inferencia quepa en GPUs consumer de 16-24 GB con cuantizacion, pero no hay datos oficiales de VRAM, latencia ni throughput. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; el pipeline declarado es "robotics" y el codigo de evaluacion se distribuye via GitHub.

## Comparativa con modelos similares

La siguiente comparativa se basa en los resultados publicados en el paper para las suites LIBERO. No se dispone de especificaciones tecnicas completas de los modelos comparados (parametros, contexto, licencia) en la informacion proporcionada.

| Modelo | Base | LIBERO Spatial | LIBERO Long | LIBERO-PRO Mean | LIBERO-Plus Mean |
|---|---|---:|---:|---:|---:|
| SmolVLA-0.24B | SmolVLM 0.24B | 87.0 | 63.0 | no disponible | no disponible |
| SmolVLA-2.25B | SmolVLM 2.25B | 93.0 | 77.0 | no disponible | no disponible |
| OpenVLA-OFT | Prismatic 7B | 94.3 | 86.5 | 56.5 | 74.1 |
| VLA-Adapter (standard BC) | no especificado | 96.0 | 89.0 | 61.0 | 85.1 |
| **Anchor-Align VLA** | Qwen2.5-0.5B | **98.4** | **90.8** | **71.9** | **90.3** |

Anchor-Align supera a todos los metodos comparados en las cuatro suites estandar y en las metricas de robustez, a pesar de usar un backbone de solo 0.5B, lo que indica una ventaja metodologica frente al escalado de parametros.

## Limitaciones y advertencias

- El rendimiento en LIBERO-PRO position swap, aunque muy superior al de otros metodos (22.6% frente a 0-2.3%), sigue siendo bajo en terminos absolutos, lo que indica que la generalizacion a cambios de posicion extrema no esta completamente resuelta.
- El codigo de entrenamiento no se incluye en la version inicial del repositorio; solo se publican los pesos y el codigo de inferencia/evaluacion, lo que limita la reproducibilidad completa del metodo.
- No se documentan sesgos especificos, pero al ser un modelo entrenado exclusivamente en entornos simulados LIBERO, su transferencia a entornos reales distintos de los evaluados (UFactory xArm7) no esta garantizada.
- No hay informacion sobre la longitud de contexto, idiomas soportados ni comportamiento ante instrucciones fuera del dominio robotico; el modelo no esta disenado para generacion de texto general.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los pesos del VLM base (Qwen2.5) y los codificadores visuales (DINOv2, SigLIP) no tengan restricciones adicionales que se apliquen al modelo combinado.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que sugiere que es un lanzamiento reciente con adopcion limitada; se recomienda validar en un entorno propio antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dwipz/Anchor-Align
- Pagina del proyecto: https://anchoralignvla.github.io/
- Paper (arXiv): https://arxiv.org/abs/2607.13429
- Codigo (GitHub): https://github.com/dwipddalal/Anchor-Align
- Videos de demostracion: https://anchoralignvla.github.io/#demo
- Reproduccion y verificacion: https://github.com/dwipddalal/Anchor-Align/blob/main/REPRODUCE.md
