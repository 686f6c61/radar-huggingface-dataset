# bailuyucha/differentiable-render-camouflage-checkpoints

## Resumen

Este repositorio libera los checkpoints auditados de un generador universal de camuflaje adversarial para ataques físicos contra detectores de objetos en escenarios de conducción autónoma. Desarrollado por bailuyucha, el proyecto utiliza renderizado diferenciable sobre el simulador CARLA para optimizar texturas UV que se aplican a vehículos y degradan el rendimiento de un detector YOLO. El repositorio documenta explícitamente resultados negativos: el ataque no logró superar las puertas de validación predefinidas en la fase de confirmación, lo que lo convierte en un caso de estudio valioso sobre la dificultad de transferir ataques adversariales entre geometrías de vehículos.

Se publican dos arquitecturas candidatas: un generador con grid latente estocástico en espacio UV (`stage2_universal_latent32x64_v1`) y un generador con campo tri-planar en espacio canónico del objeto (`stage2_universal_canonical_surface_v1`). Ambos modelos producen texturas de 2048x2048 píxeles condicionadas por máscara, UV, posición y normales del objeto. El repositorio incluye checkpoints en formato safetensors, configuraciones congeladas, manifiestos de integridad y registros de evaluación por semilla. La licencia es MIT para los pesos y configuraciones, aunque los materiales derivados de CARLA conservan requisitos de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador con grid latente estocástico 32x64 y decoder espacial 256x256 (variante UV) o campo tri-planar en espacio objeto (variante canónica); salida de textura UV 2048x2048 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, formato safetensors) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (pesos y configuraciones); dataset y materiales CARLA con requisitos de atribución |
| Formato de pesos | safetensors (tensor-only), config.json, manifiestos de integridad; también checkpoints pickle completos (no recomendados para carga directa) |

## Arquitectura y entrenamiento

El modelo `stage2_universal_latent32x64_v1` es un generador condicionado por geometría que opera sobre un grid latente estocástico de 32x64 celdas con ocho canales latentes. Recibe como condicionamiento la máscara del vehículo, el mapeado UV, la posición del objeto y las normales; un decoder espacial produce un campo de características de 256x256 que se convierte en una textura UV final de 2048x2048. La variante `stage2_universal_canonical_surface_v1` sustituye las convoluciones geométricas en espacio UV por un campo tri-planar muestreado desde posiciones normalizadas del objeto, manteniendo el mismo grid latente.

El entrenamiento se realizó con cuatro vehículos, expectación sobre dos vistas (two-view mean EOT), un máximo duro sobre las cajas del detector, seis épocas y 1.728 pasos de optimización. No se empleó RLHF ni DPO; la optimización es puramente basada en gradientes a través del renderizado diferenciable. El protocolo incluyó una regla de parada preregistrada: si la puerta de confirmación fallaba en un vehículo de validación externo (Nissan), no se ejecutaban evaluaciones adicionales sobre detectores no vistos ni expansiones físicas.

## Capacidades

- Generacion de texturas de camuflaje adversarial optimizadas para degradar la deteccion de objetos (YOLO) en entornos simulados.
- Condicionamiento por geometria del vehiculo: mascara, UV, posicion y normales permiten adaptar la textura a diferentes formas.
- Soporte de dos representaciones de salida: textura UV directa y campo tri-planar en espacio canonico.
- Reproducibilidad completa: incluye configuraciones congeladas, manifiestos SHA-256 y registros por semilla (latent seeds 42-46).
- Documentacion de resultados negativos: el repositorio sirve como referencia para estudiar el colapso validacion-confirmacion en ataques adversariales fisicos.
- No incluye capacidades de lenguaje, tool calling, agentes ni multimodalidad; es exclusivamente un generador de imagenes para ataque.

## Casos de uso

- Investigacion en robustez adversarial: permite reproducir experimentos de ataques fisicos contra detectores YOLO en simulacion CARLA, analizando por que un ataque optimizado en un conjunto de vehiculos no transfiere a otros.
- Evaluacion de protocolos de validacion: el diseño con puertas preregistradas y divisiones de desarrollo/confirmacion puede servir como plantilla para estudios que exigen rigor estadistico y evitan sesgos de seleccion.
- Benchmark de reporte de resultados negativos: el repositorio es un ejemplo de como documentar fallos de transferencia y decisiones de parada, util para la comunidad de seguridad en IA.
- Estudio de representaciones geometricas: comparar la variante UV con la canonica (tri-planar) ayuda a entender que representaciones son mas robustas para generar texturas adversariales.
- Inicializacion de nuevos diseños: los checkpoints pueden usarse como punto de partida para rediseños que se seleccionen exclusivamente sobre vehiculos de desarrollo, evitando contaminacion con datos de confirmacion.
- Auditoria de procedencia de artefactos: los manifiestos de integridad y hashes permiten verificar la cadena de custodia de los pesos, util para entornos de investigacion regulada.

## Benchmarks y rendimiento

El repositorio reporta resultados de evaluacion para ambas variantes. Los valores tras `+/-` son desviaciones estandar muestrales sobre las semillas latentes 42-46. Un AP50:95 atacado mas bajo y una ASR condicionada a limpio mas alta indican un ataque mas fuerte.

| Variante | Vehiculo | Clean AP50:95 | Attacked AP50:95 | Clean-conditioned ASR | Interpretacion |
|---|---|---|---|---|---|
| Latent-grid UV | Toyota (validacion) | 0.303291 | 0.232563 +/- 0.007383 | 0.234234 | Epoca 6 seleccionada |
| Latent-grid UV | Lincoln (holdout desarrollo) | 0.228031 | 0.206965 +/- 0.003146 | 0.105085 +/- 0.019510 | Evidencia de desarrollo |
| Latent-grid UV | Nissan (confirmacion sellada) | 0.353245 | 0.345791 +/- 0.000788 | 0.014035 +/- 0.004805 | Puerta de confirmacion fallida |
| Canonical-surface | Toyota (desarrollo) | 0.303237 | 0.298996 +/- 0.001600 | 0.027027 +/- 0.000000 | Epoca 6; no supera no-inferioridad |

La puerta de confirmacion para Nissan exigia una reduccion absoluta de AP50:95 de al menos 0.015 y una ASR media de al menos 0.075. Los valores observados fueron 0.007454 y 0.014035 respectivamente; ambos criterios fallaron. La variante canonica fue 0.066433 peor que la referencia UV en ataque, superando el umbral de no-inferioridad congelado en 0.063433, por lo que no se autorizo la evaluacion en Lincoln.

## Requisitos de hardware

- No se especifican requisitos de hardware en la informacion proporcionada.
- El tamaño del repositorio (37.3 GB) sugiere que los checkpoints completos con estado de optimizador y RNG son pesados; la exportacion tensor-only `model.safetensors` es mas ligera y preferida para inferencia.
- Dada la salida de 2048x2048 y el uso de renderizado diferenciable, se estima que la generacion de una textura requiere al menos 8-16 GB de VRAM en una GPU moderna (p. ej., RTX 3080/4090), aunque esto no esta confirmado por el autor.
- Para reproducir el entrenamiento completo (seis epocas, cuatro vehiculos, EOT de dos vistas) se necesitaria una GPU con al menos 24 GB de VRAM (A100, RTX 4090) y un entorno con CARLA y PyTorch.
- No se mencionan opciones de despliegue como vLLM u Ollama; al ser un modelo de vision por lotes, la inferencia se realiza tipicamente con scripts PyTorch personalizados.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio. Este generador de camuflaje adversarial es un artefacto de investigacion especializado; no existen alternativas publicas equivalentes documentadas en la informacion proporcionada. Se recomienda consultar la literatura sobre ataques adversariales fisicos (p. ej., trabajos sobre parches adversariales o texturas optimizadas) para establecer comparaciones, pero no se incluyen datos cuantitativos en esta ficha.

## Limitaciones y advertencias

- Resultados negativos documentados: el ataque no supero las puertas de validacion en el vehiculo de confirmacion (Nissan), lo que indica una transferencia pobre entre geometrias de vehiculos.
- No validado para despliegue: el autor indica explicitamente que el modelo no esta validado para uso en produccion, ataques fisicos reales, afirmaciones de seguridad en conduccion autonoma, transferencia a otros detectores ni generacion de envolturas con aspecto natural.
- Riesgo de sobreajuste: el entrenamiento con solo cuatro vehiculos y seis epocas limita la generalizacion; los resultados en Toyota no se mantienen en Nissan.
- La variante canonica (tri-planar) fue significativamente peor que la referencia UV, lo que falsifica solo esa configuracion concreta, no todas las representaciones en espacio objeto.
- Los checkpoints pickle completos no deben cargarse sin verificar su SHA-256; se recomienda usar exclusivamente las exportaciones safetensors.
- El repositorio no redistribuye pesos de terceros (YOLO, Z-Image); los usuarios deben obtenerlos por separado y verificar los hashes registrados.
- Los datos de CARLA conservan requisitos de atribucion; el uso comercial puede requerir licencias adicionales no detalladas en el repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bailuyucha/differentiable-render-camouflage-checkpoints
- Dataset asociado: https://huggingface.co/datasets/bailuyucha/differentiable-render-camouflage-data
