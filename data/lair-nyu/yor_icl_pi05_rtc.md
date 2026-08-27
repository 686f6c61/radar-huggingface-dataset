# lair-nyu/yor_icl_pi05_rtc

## Resumen

El modelo `lair-nyu/yor_icl_pi05_rtc` es un checkpoint de un modelo de visión-lenguaje-acción (VLA) desarrollado por el grupo LAIR de la Universidad de Nueva York (NYU). Se basa en el backbone pi0.5 de Physical Intelligence y ha sido entrenado con el framework openpi sobre el dataset `icl-dataset`, incorporando una técnica de chunking en tiempo real (real-time chunking, RTC). El checkpoint corresponde al paso 20000 de entrenamiento y solo incluye los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador.

Este modelo está orientado a tareas de control robótico, donde el VLA procesa observaciones visuales y lenguaje natural para generar acciones motoras. La inclusión de RTC sugiere que está diseñado para operar con baja latencia, ejecutando acciones de forma incremental mientras se reciben nuevas observaciones. Aunque la información pública es muy limitada, su naturaleza lo sitúa en el ámbito de la robótica y la manipulación autónoma.

La relevancia actual de este modelo radica en la tendencia hacia sistemas VLA de código abierto que puedan desplegarse en robots reales. Sin embargo, al carecer de documentación detallada, licencia explícita o benchmarks publicados, su adopción en producción requiere una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 backbone (VLA, basado en transformer, detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `params/` (pesos desplegables) + `assets/` (norm stats); formato de archivo no especificado |

## Arquitectura y entrenamiento

El modelo se basa en el backbone pi0.5, un VLA desarrollado por Physical Intelligence que combina un modelo de lenguaje preentrenado con un módulo de visión y un cabezal de acción. El entrenamiento se realizó con el framework openpi, una librería de código abierto para entrenar y desplegar políticas de VLA. El dataset utilizado es `icl-dataset`, aunque no se especifican su composición ni el número de tokens. La técnica de real-time chunking (RTC) permite al modelo predecir y ejecutar secuencias de acciones de forma incremental, reduciendo la latencia en entornos de control en tiempo real. No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Control robótico: al ser un VLA, el modelo está diseñado para mapear observaciones visuales y comandos en lenguaje natural a acciones motoras.
- Generación de acciones en tiempo real: gracias al RTC, puede emitir acciones de forma incremental, lo que es crítico para lazo de control cerrado.
- Comprensión visual y lingüística: hereda las capacidades del backbone pi0.5, que incluye procesamiento de imágenes y texto, aunque no se detallan sus límites.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso o capacidades multilingües específicas.

## Casos de uso

- Manipulación robótica en entornos industriales: el modelo puede controlar brazos robóticos para tareas de pick-and-place, ensamblaje o inspección, usando instrucciones en lenguaje natural y visión en tiempo real.
- Robots de servicio doméstico: integrado en un robot móvil con brazo, puede ejecutar tareas como recoger objetos, abrir puertas o limpiar superficies, respondiendo a comandos hablados.
- Teleoperación asistida: en escenarios de teleoperación, el modelo puede refinar las acciones del operador humano, suavizando trayectorias y corrigiendo errores en tiempo real.
- Investigación en aprendizaje por imitación: al ser un checkpoint de un entrenamiento específico, puede servir como base para estudios sobre generalización en VLA o para fine-tuning en nuevos datasets.
- Desarrollo de políticas de control con bajo latencia: su diseño con RTC lo hace adecuado para probar arquitecturas de control en tiempo real en simuladores como MuJoCo o Isaac Sim.
- Evaluación de robustez en entornos cambiantes: dado que se entrenó en un dataset específico, puede usarse para medir la transferencia a entornos no vistos, aunque no hay datos públicos al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de robótica (éxito en tareas, tasa de finalización, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El tamaño del repositorio (12.4 GB) sugiere que los pesos en precisión FP16 o BF16 podrían ocupar entre 6 y 12 GB, dependiendo de la arquitectura exacta. Se recomienda al menos 16 GB de VRAM para inferencia con margen.
- GPU recomendadas: no hay especificación oficial. Por el tamaño, una RTX 4090 (24 GB) o una A100 (40 GB) serían opciones razonables, pero no confirmadas.
- Si cabe en consumer GPU: probablemente sí en GPUs con 16 GB o más, pero no hay garantía.
- Opciones de despliegue: al estar entrenado con openpi, se puede desplegar con las herramientas de esa librería. También podría convertirse a otros formatos (ONNX, TensorRT) si se dispone de los pesos, pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos VLA como OpenVLA, RT-2 o el propio pi0 original. No hay datos de parámetros, rendimiento ni licencia que permitan una comparación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos en el dataset de entrenamiento.
- Riesgo de alucinación: como modelo de lenguaje, puede generar acciones inconsistentes con las observaciones si se enfrenta a entradas fuera de distribución.
- Limitaciones de contexto o idioma: no se especifican los idiomas soportados ni la longitud de contexto; se asume que el modelo está optimizado para inglés y posiblemente otros idiomas, pero no es seguro.
- Restricciones de licencia: no se indica licencia, por lo que el uso comercial es incierto. Se recomienda contactar con los autores antes de cualquier uso productivo.
- Caveat para producción: el checkpoint no incluye el estado del optimizador, por lo que no se puede reanudar el entrenamiento exacto. Además, al ser un modelo de investigación, no hay garantías de robustez en entornos reales.

## Enlaces

- HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_rtc
- Perfil de la organización LAIR NYU: https://huggingface.co/lair-nyu/models
- Repositorio de openpi: https://github.com/Physical-Intelligence/openpi
