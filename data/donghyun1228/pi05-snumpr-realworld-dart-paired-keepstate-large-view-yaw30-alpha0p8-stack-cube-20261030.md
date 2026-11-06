# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261030

## Resumen

π0.5 SNUMPR real-world DART merge for task `stack_cube` es un checkpoint de robótica derivado de π0.5 (openpi), un modelo de visión-lenguaje-acción (VLA) orientado al control de manipuladores. Lo publica el usuario Donghyun1228 dentro del ecosistema SNUMPR y aplica una técnica de adaptación de dominio denominada DART (domain arithmetic) sobre demostraciones reales de la tarea de apilar un cubo. El repositorio contiene únicamente pesos en BF16 y los assets de normalización originales, con un tamaño total de 5,3 GB.

La particularidad del checkpoint es la combinación de tres decisiones: una demostración objetivo recolectada de nuevo el 30 de octubre de 2026 para imitar el movimiento de una demostración fuente, una rotación virtual de la base de +30° aplicada a las poses del TCP (y por tanto a las acciones delta) y la conservación del estado articular real mediante la opción `--keep-state`. El resultado es un modelo que razona en un marco de referencia rotado y exige que el controlador del robot deshaga esa rotación en tiempo de ejecución.

Es relevante ahora porque ilustra un patrón práctico de reutilización de políticas VLA: en lugar de reentrenar desde cero, se hace fine-tuning de origen y destino y se fusionan los pesos con aritmética de dominios. Aun así, el propio autor advierte de que no se ha ejecutado ninguna evaluación sobre robot real, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (openpi), transformer visión-lenguaje-acción; detalles internos no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 más `assets` de normalización (no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El checkpoint parte de `snumpr-iclr27-v1/9999`, la VLA inicial de SNUMPR con su normalización original. Sobre esa base se ejecutan dos fine-tunings independientes de imitación (IL only): uno sobre la demostración fuente `demonstration_7` con yaw 0 (preset `pi05_snumpr_dart_paired_source_stack_cube`) y otro sobre la demostración objetivo recolocada en vista amplia con yaw virtual de +30° (preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_stack_cube`). Ambos usan 1.000 actualizaciones, batch 64, learning rate constante de 5e-5, sin warmup, sin EMA y entrenando todos los pesos, con el código `Donghyun1228/vla_adaptation` en el commit `c4fcb61`.

La fusión se realiza con el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart` en el commit `1b23c4f42f73168c78a20b353453145e74f64711`, con α = 0.8, scope `all`, semilla 42 y ejecución en CPU. El repositorio incluye `merge_config.json` (registro del merger) y `dart_merge_verified.json`, que documenta una comprobación hoja por hoja de 51 de 51 claves sin recurrir a fallback. La innovación técnica destacable no está en la arquitectura sino en el pipeline: rotación virtual de las poses del TCP mediante `Rz(-30)` para las acciones delta, manteniendo `observation.state` con los ángulos articulares reales.

## Capacidades

- Control robótico por imitación para la tarea concreta `stack_cube` (apilado de un cubo) a partir de observaciones visuales y estado proprioceptivo.
- Generación de acciones delta en el espacio de poses del TCP, expresadas en un marco de referencia virtual rotado +30° respecto a la base real.
- Procesamiento de estado articular real sin transformar (`--keep-state`), lo que permite al controlador mezclar acciones rotadas con propriocepción sin rotar.
- Condicionamiento por lenguaje heredado de la familia π0.5/openpi (no verificado en este checkpoint concreto).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe para este artefacto.

## Casos de uso

- Investigación en adaptación de dominio para VLA: sirve como caso reproducible de fusión DART con α = 0.8 y verificación hoja por hoja, útil para estudiar cómo se comporta la aritmética de pesos entre un dominio fuente y uno objetivo rotado.
- Recolección de datos con vistas amplias: el checkpoint está pensado para políticas que operan con cámaras de gran campo de visión y una base virtual girada, un escenario habitual cuando el montaje físico de la cámara no coincide con el de las demostraciones originales.
- Apilado de cubos en banco de pruebas: tarea de manipulación de referencia para comparar políticas de imitación con y sin transformación de marco de referencia.
- Validación de pipelines de control: obliga a implementar en el controlador la operación inversa `Δxyz_real = Rz(+30) Δxyz_virtual`, lo que lo convierte en un test útil para verificar la cadena completa de inferencia y ejecución.
- Estudio de la separación acción/propriocepción: al mantener el estado articular real y rotar solo las acciones, permite analizar el impacto de tratar de forma asimétrica ambas señales.
- Reproducción de experimentos SNUMPR: dado que se documentan commits, semilla, α y presets, es adecuado para replicar resultados dentro del ecosistema openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 5,3 GB en BF16, por lo que la inferencia en BF16 requiere al menos ese orden de magnitud más overhead de activaciones y del codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, GPUs de datacenter tipo A100 o H100 son el entorno natural de openpi, pero no se confirma.
- GPU de consumo: no confirmado. Un checkpoint de ~5 GB en BF16 podría caber en GPUs con 16-24 GB, pero no hay datos publicados que lo verifiquen.
- Despliegue: el ecosistema de referencia es openpi; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `stack_cube` (este) | no disponible | no disponible | Apilado de cubo, dominio rotado | Apache 2.0 | Hugging Face, 0 descargas |
| Base `snumpr-iclr27-v1/9999` | no disponible | no disponible | VLA general SNUMPR | no disponible en la información | Referenciado como base |
| π0.5 openpi original | no disponible | no disponible | VLA generalista | no disponible en la información | Ecosistema openpi |
| Otras variantes `pi05_snumpr_dart_*` del mismo autor | no disponible | no disponible | Variantes de tarea/rotación | Apache 2.0 (presumible) | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- Sin evaluación en robot real: el autor lo declara explícitamente; cualquier uso en hardware requiere validación previa.
- Dependencia crítica de transformación: el controlador debe aplicar `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real sin rotar. Omitir cualquiera de las dos condiciones invalida el comportamiento esperado.
- Especialización extrema: entrenado solo para `stack_cube` con una demostración objetivo concreta; no generaliza a otras tareas sin nuevo fine-tuning.
- Riesgo de alucinación y deriva: al ser un modelo de imitación con 1.000 actualizaciones y sin EMA, la política puede sobreajustar a la trayectoria demostrada y degradarse fuera de la distribución de estados visitados.
- Sesgos: no documentados; en robótica los sesgos provienen de la distribución de demostraciones (posiciones, iluminación, montaje de cámara), no evaluada aquí.
- Idiomas: no disponible; no se confirma el comportamiento del condicionamiento lingüístico.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la naturaleza experimental del artefacto desaconsejan producción sin pruebas propias.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261030
- Repositorio DART referenciado en la model card: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`); URL no disponible en la información proporcionada.
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`); URL no disponible en la información proporcionada.
- Modelo base: `snumpr-iclr27-v1/9999`; URL no disponible en la información proporcionada.
- Ecosistema openpi: no se proporciona enlace en la información disponible.
