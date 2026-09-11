# lehoffmann/matching-scratch

## Resumen

`lehoffmann/matching-scratch` es un repositorio experimental publicado en HuggingFace que contiene una implementación funcional de la arquitectura **Coca** aplicada a una tarea de *matching*, en una configuración de escala pequeña ("small"). No se trata de un modelo entrenado ni de un checkpoint listo para producción: el propio autor lo describe como un punto de partida reproducible para *smoke tests*, con código transparente y sin ninguna afirmación de rendimiento. El checkpoint `model.safetensors` se presenta explícitamente como una inicialización válida, no como un modelo con entrenamiento completado.

El modelo tiene **49.600 parámetros** en total, según los metadatos de safetensors, lo que lo sitúa en el rango de los modelos de juguete (del orden de 0,2 MB en fp32). La arquitectura declarada combina atención de ventana deslizante (*sliding window*), fusión de tensores (*tensor fusion*), activación gelu tanh y normalización InstanceNorm. La licencia es Apache 2.0.

Su relevancia actual es acotada y de carácter metodológico: sirve como base reproducible para experimentos de *matching* multimodal o emparejamiento de representaciones, para validar pipelines de entrenamiento y para pruebas de integración en CI. Cualquier evaluación seria requiere, según el propio autor, entrenar todos los *baselines* con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias. No hay datos de contexto, idiomas soportados ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementación personalizada; atención de ventana deslizante, fusión de tensores, activación gelu tanh, normalización InstanceNorm) |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un único checkpoint en safetensors; no se documenta precisión ni variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Escala declarada | small |
| Pipeline en el Hub | no disponible |
| Ficheros del repositorio | `train.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en el Hub | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura declarada es **Coca**, una implementación propia del autor, no una arquitectura estándar con *paper* asociado en la información disponible. Los componentes documentados son: atención con ventana deslizante, fusión de tensores para combinar modalidades o ramas, activación gelu tanh y normalización InstanceNorm. El fichero `config.json` recoge los ajustes de arquitectura generados y `train_args.json` (citado como `training_args.json` en el listado de ficheros) la receta de experimento por defecto. No se especifican número de capas, dimensiones ocultas, número de cabezas ni tamaño de ventana.

En cuanto al entrenamiento, **no se ha completado ninguno**. La receta incluida usa el optimizador **novograd** con un *schedule* de tipo **step**; el autor aclara que son valores de partida del script y no evidencia de una ejecución finalizada. No hay información sobre volumen de tokens, composición del dataset, ni fases de RLHF, DPO o SFT. El propio repositorio indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarse. La guía de evaluación sugerida por el autor consiste en un conjunto de validación emparejado, métrica de tarea reportada sobre al menos tres semillas y un *baseline* de capacidad equivalente.

## Capacidades

- **Entrenamiento reproducible de una arquitectura de matching**: el artefacto principal es `train.py`, que contiene el modelo y un punto de entrada ejecutable con un ejemplo de *smoke test* en su bloque `__main__`.
- **Pruebas de humo (smoke tests)**: el checkpoint en safetensors permite verificar que la inicialización, las formas de los tensores y el *forward pass* funcionan antes de lanzar un entrenamiento real.
- **Fusión de tensores para tareas de emparejamiento**: la combinación de ramas mediante *tensor fusion* está pensada para tareas de *matching* (emparejamiento de entradas), aunque no se documenta el dominio concreto.
- **Atención de ventana deslizante**: el mecanismo de atención está limitado a una ventana local, lo que en principio reduce el coste computacional frente a atención completa, si bien no se publica el tamaño de ventana.
- **No soporta** generación de texto, razonamiento, código, matemáticas, visión, audio, *tool calling*, *function calling* ni comportamiento de agente: no hay evidencia de ninguna de estas capacidades y el modelo no ha sido entrenado.
- **No hay capacidades multilingües documentadas**: el campo de idiomas no está disponible y el repositorio no incluye datos de entrenamiento.

## Casos de uso

- **Prueba de humo en CI/CD**: ejecutar `python train.py --help` y el bloque `__main__` como test de integración para verificar que el entorno, las dependencias de PyTorch y la inicialización del modelo funcionan tras cada cambio en el código. Con 49.600 parámetros, el coste por ejecución es despreciable incluso en CPU.
- **Plantilla para reproducir experimentos de matching**: partir de `config.json` y `training_args.json` para definir una receta controlada (optimizador novograd, schedule step) y comparar variantes arquitectónicas bajo la misma exposición de datos y semillas, tal como recomienda el autor.
- **Validación de pipelines de datos emparejados**: usar el esqueleto del script para comprobar que un conjunto de validación emparejado se carga correctamente y que las formas de entrada/salida coinciden antes de escalar a un modelo mayor.
- **Estudio de ablaciones de fusión de tensores**: modificar la estrategia de *tensor fusion* o sustituir InstanceNorm por otra normalización y medir el efecto en la métrica de tarea, manteniendo el resto de la configuración fija.
- **Material didáctico**: ilustrar en un curso o taller cómo se estructura una implementación mínima de una arquitectura tipo Coca, incluyendo configuración, argumentos de entrenamiento y checkpoint, sin la complejidad de un modelo a escala real.
- **Desarrollo de adaptadores de carga**: como el repositorio no es compatible con APIs genéricas de carga automática, sirve para escribir y probar un adaptador específico que mapee los pesos de `model.safetensors` a la clase del modelo.
- **Banco de pruebas de perfilado**: medir tiempos de *forward* y *backward*, uso de memoria y comportamiento del *schedule* step con un modelo de tamaño mínimo antes de trasladar la receta a configuraciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint es únicamente una inicialización para pruebas de humo, no un modelo entrenado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: insignificante. Con 49.600 parámetros, los pesos ocupan aproximadamente 0,2 MB en fp32 y 0,1 MB en fp16; el consumo real vendrá determinado por el *runtime* de PyTorch y las activaciones, no por el modelo.
- **GPU recomendadas**: no se requiere GPU. Cualquier GPU consumer (integrada, GTX serie 10xx en adelante, RTX 3060/4060/4090) es más que suficiente. Para entrenamiento real a mayor escala habría que reevaluar, pero ese escenario no está cubierto por este repositorio.
- **Ejecución en CPU**: totalmente viable. El modelo cabe en memoria principal sin ninguna optimización y el *smoke test* del script se puede ejecutar en un portátil convencional.
- **Opciones de despliegue**: no se documenta compatibilidad con vLLM, TGI, Ollama, llama.cpp ni ningún servidor de inferencia estándar. El autor advierte que las APIs automáticas requieren un adaptador explícito, por lo que el único camino documentado es ejecutar directamente el código de `train.py` con PyTorch.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye benchmarks, familia de modelos de referencia ni *baselines* con los que comparar. El propio autor señala que una evaluación útil debería incluir un *baseline* de capacidad equivalente, pero no se publica ninguno en este repositorio. Tampoco se dispone de datos de contexto, idiomas o rendimiento que permitan una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Modelo no entrenado**: `model.safetensors` es una inicialización, no un checkpoint entrenado. No debe usarse para inferencia con expectativas de calidad.
- **Sin auditoría**: el autor declara que el checkpoint no ha sido evaluado en robustez, equidad (*fairness*) ni transferencia de dominio.
- **Sin benchmarks**: no existe ninguna métrica publicada; cualquier afirmación de rendimiento sería infundada.
- **Riesgo de alucinación**: no aplica en el sentido habitual, ya que el modelo no genera texto; sin embargo, cualquier salida que produzca tras un entrenamiento no validado carecería de garantías.
- **Sesgos conocidos**: no disponibles. Al no haber datos de entrenamiento documentados, no es posible analizar sesgos.
- **Limitaciones de contexto e idioma**: no disponibles. No se documenta ventana de contexto ni cobertura lingüística.
- **Restricciones de licencia**: el código y los pesos se publican bajo Apache 2.0, que permite uso comercial y modificación. El autor advierte que los términos de los datos de origen deben revisarse por separado cuando el repositorio se use con conjuntos de datos externos.
- **Caveat de integración**: al ser una implementación personalizada, las APIs genéricas de carga (por ejemplo `AutoModel`) no funcionan sin un adaptador explícito.
- **Fechas del Hub**: los metadatos indican una fecha de creación de 2026-09-11, posterior a la fecha de referencia habitual de publicación; conviene verificar el estado del repositorio antes de citarlo.
- **Advertencia para producción**: no debe desplegarse en ningún entorno productivo. Su uso razonable es experimental, didáctico y de validación de infraestructura.

## Enlaces

- HuggingFace: https://huggingface.co/lehoffmann/matching-scratch
- Repositorio de código: no disponible (el autor no enlaza un repositorio Git externo; los artefactos se distribuyen dentro del propio repositorio de HuggingFace)
- Paper: no disponible
- Blog o demo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas genéricas de Google y servicios asociados, sin relación con `lehoffmann/matching-scratch` ni con la arquitectura Coca.
