# Geoffrey19/cei2-pi05-base-wipe200-fp32

## Resumen

`cei2-pi05-base-wipe200-fp32` es una política robótica de imitación (vision-language-action, VLA) publicada por el usuario Geoffrey19 en Hugging Face. Se trata de un fine-tuning completo de `pi05_base`, el modelo base de la familia pi05 desarrollada por Physical Intelligence y liberada a través del repositorio openpi. El modelo resuelve una tarea concreta de manipulación: coger un borrador y limpiar una pizarra blanca con un brazo Franka FR3 de 7 articulaciones equipado con una mano LEAP de 16 articulaciones.

La relevancia del modelo es acotada pero clara para la comunidad de robótica de imitación: demuestra el flujo completo de post-entrenamiento de una política VLA sobre datos reales de teleoperación, con un conjunto de configuraciones reproducible (config `cei2_pi05_wipe200_absq`) y estadísticas de normalización empaquetadas junto a los pesos. No es un modelo de propósito general ni un modelo de lenguaje: es un checkpoint de política entrenado para una única tarea, una única escena y una única cámara.

El checkpoint tiene 3.616.757.520 parámetros en float32 (812 tensores, 14,5 GB en el repositorio) y se distribuye bajo licencia Apache 2.0. No se han publicado métricas de éxito en robot real ni una partición de evaluación reservada, por lo que su utilidad debe juzgarse por la receta de entrenamiento y la reproducibilidad, no por cifras de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA pi05 (openpi), basada en flow matching sobre acciones; backbone transformer preentrenado tipo vision-language |
| Parametros totales | 3.616.757.520 (812 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el autor no documenta variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (el prompt de tarea se usa en inglés: "Pick up the eraser and wipe the whiteboard clean.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `assets/wipe200/norm_stats.json` y `metadata.pt` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `pi05_base` siguiendo la receta de openpi. La política consume una imagen RGB exterior de 640×480, un vector de estado de 23 posiciones articulares absolutas en radianes y un prompt de texto, y devuelve fragmentos de 16 pasos de acciones también absolutas de 23 dimensiones, pensadas para ejecutarse a 15 Hz. La normalización se hace por cuantiles calculados sobre el conjunto de entrenamiento (q01/q99 mapeados a −1/+1) y se guarda en `assets/wipe200/norm_stats.json`, que el pipeline de inferencia carga obligatoriamente desde la carpeta del checkpoint.

Los datos de entrenamiento son demostraciones reales de teleoperación sobre un Franka FR3 con mano LEAP: 199 episodios y 99.133 fotogramas a 15 Hz del dataset `zwx/wipe_whiteboard_franka_leap_15hz_absolute_200`. El autor indica que el episodio 36 faltaba en la copia utilizada y que los 199 restantes se renumeraron de 0 a 198. Se usaron los 199 episodios para entrenar, sin partición de validación. El entrenamiento consistió en 20.000 pasos con batch de 32 en una sola GPU, learning rate pico de 2e-5 tras 500 pasos de calentamiento y decaimiento coseno hasta 1e-6, con pesos maestros y estado del optimizador en float32 y autocast en bfloat16, sin EMA. La pérdida media de flow matching bajó de 0,1284 en los primeros 100 pasos a 0,0066 en el tramo 19.000–20.000.

Un detalle técnico relevante es el reordenamiento de articulaciones: las grabaciones listan las articulaciones LEAP en orden de motor (`mcp_side` antes de `mcp_forward`), mientras que el modelo CEI `fr3v2_leaphand` usa `mcp_forward` antes de `mcp_side`. La configuración aplica la permutación `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]`, de modo que la política recibe el estado y devuelve acciones en el orden propio del robot. Con ese orden, los 23 límites articulares de la configuración del robot coinciden exactamente con los del modelo.

## Capacidades

- Generación de acciones de manipulación: produce trayectorias de 16 pasos de 23 articulaciones absolutas a 15 Hz para el brazo FR3 y la mano LEAP.
- Control visomotor: integra una imagen RGB exterior de 640×480 con el estado articular para condicionar la acción.
- Condicionamiento por prompt de lenguaje: acepta una instrucción textual de tarea, aunque en la práctica está especializado en una sola frase.
- Manipulación bimanual implícita brazo-mano: coordina 7 articulaciones del brazo con 16 de la mano LEAP (4 por dedo índice, medio y anular; 4 en el pulgar).
- Ejecución de una tarea de contacto: limpiar una pizarra blanca con un borrador, incluyendo agarre y barrido.
- No soporta tool calling ni function calling: es una política robótica, no un modelo de lenguaje conversacional.
- No soporta razonamiento multi-paso en el sentido de agentes de software ni modo thinking explícito.
- Capacidades multilingües: no documentadas; el único prompt de entrenamiento está en inglés.

## Casos de uso

- Reproducción de la receta de post-entrenamiento pi05: sirve como referencia práctica para equipos que quieran hacer fine-tuning completo de `pi05_base` sobre sus propios datos de teleoperación, con una configuración concreta (`cei2_pi05_wipe200_absq`) y estadísticas de normalización versionadas.
- Benchmark interno de manipulación de contacto: la tarea de limpiar una pizarra exige agarre de herramienta y barrido continuo, por lo que es un banco de pruebas útil para comparar políticas VLA frente a GR00T u otras alternativas bajo el mismo dataset.
- Base para adaptación a tareas de limpieza o borrado: el checkpoint puede servir de inicialización para tareas relacionadas (limpiar superficies, borrar pizarras de otros tamaños) con un conjunto pequeño de demostraciones adicionales.
- Integración en un stack openpi/LeRobot: el modelo se carga con `policy_config.create_trained_policy` y se ejecuta a 15 Hz, lo que permite conectarlo a un bucle de control de un FR3 real o a un simulador compatible con el modelo `fr3v2_leaphand`.
- Estudio de normalización por cuantiles en políticas de imitación: el fichero `norm_stats.json` empaquetado permite analizar cómo afecta la normalización q01/q99 al rango de acciones absolutas en tareas de contacto.
- Validación de ordenamiento de articulaciones en hardware LEAP: la permutación `P` documentada y su correspondencia exacta con los límites del robot facilitan depurar desajustes de índices al portar políticas entre grabaciones y modelos de robot.
- Docencia y experimentación en robótica de imitación: al ser un checkpoint pequeño (3,62 B parámetros, 14,5 GB) y con licencia Apache 2.0, es adecuado para laboratorios que quieran estudiar el pipeline completo sin depender de modelos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pérdida de entrenamiento (flow matching), que no mide calidad de política:

| Pasos | pi05 desde base | pi05 desde CEI | GR00T desde base | GR00T desde CEI |
|---|---|---|---|---|
| 0–100 | 0,1284 | 0,1352 | 1,0587 | 0,1817 |
| 4.900–5.000 | 0,0150 | 0,0130 | 0,0596 | 0,0344 |
| 9.900–10.000 | 0,0113 | 0,0102 | 0,0439 | 0,0237 |
| 14.900–15.000 | 0,0084 | 0,0076 | 0,0270 | 0,0146 |
| 19.000–20.000 | 0,0066 | 0,0060 | 0,0236 | 0,0129 |

Estos valores son ajustes a los episodios de entrenamiento y solo son comparables entre ejecuciones del mismo modelo; no constituyen una evaluación de éxito en robot real. No hay partición reservada ni resultados de robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan unos 14,5 GB, por lo que se necesita al menos una GPU con 16 GB para cargar el checkpoint sin cuantizar; con overhead de activaciones y del backbone visual, se recomienda 24 GB o más.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en float32; una RTX 3090 (24 GB) también debería ser suficiente para carga en float32 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con margen justo, en GPUs de 16 GB si se reduce el uso de memoria del resto del pipeline; no se documentan variantes cuantizadas que permitan bajar de 16 GB.
- Opciones de despliegue: openpi con las configuraciones CEI-2.0 registradas (`docker/openpi_cei2_configs.py`), cargando con `policy_config.create_trained_policy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política de acciones.
- Latencia y throughput: no disponibles. La política está diseñada para emitir fragmentos de 16 acciones a 15 Hz, pero el autor no publica latencias medidas ni throughput en ninguna GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cei2-pi05-base-wipe200-fp32 | 3,62 B | no disponible | Limpiar pizarra con FR3 + LEAP | Apache 2.0 | Hugging Face, 0 descargas |
| cei2-pi05-fr3v2-leaphand-112h-wipe200-fp32 (misma receta, desde CEI) | no disponible en la información | no disponible | Misma tarea, inicializado desde CEI | Apache 2.0 | Hugging Face |
| pi05_base (openpi) | no disponible en la información | no disponible | Política VLA generalista base | no disponible en la información | GitHub openpi |
| GR00T (desde base y desde CEI, mismas ejecuciones del autor) | no disponible en la información | no disponible | Misma tarea, comparación de pérdida | no disponible en la información | no disponible |

La comparación disponible se limita a las ejecuciones del propio autor con la misma receta; no hay datos públicos de éxito en robot que permitan comparar calidad entre pi05 y GR00T en esta tarea.

## Limitaciones y advertencias

- Sin evaluación reservada ni resultados en robot real: todas las cifras publicadas son pérdida de entrenamiento, no tasas de éxito.
- Especialización extrema: una tarea, una escena y una cámara. No generaliza a otras tareas ni a otras configuraciones de robot sin reentrenamiento.
- Dependencia del orden de articulaciones: usar el estado o las acciones en un orden distinto al documentado (o aplicar la permutación `P` dos veces) produce acciones inválidas.
- Dependencia obligatoria de `assets/wipe200/norm_stats.json`: recalcular las estadísticas sobre otros datos invalida el comportamiento del modelo.
- Alineación temporal por reloj de host, no por trigger hardware, según los ficheros `alignment/` del dataset; esto puede introducir desfases entre imagen y estado.
- El episodio 36 faltaba en la copia de entrenamiento y los episodios se renumeraron; hay que tenerlo en cuenta al cruzar índices con el dataset original.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación sin verificación, puede generar trayectorias que violen límites articulares o colisionen si se ejecuta fuera de la distribución de entrenamiento.
- Sesgos: no documentados por el autor; al entrenar con un único operador, una única escena y una única cámara, es esperable un sesgo hacia esas condiciones.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable desplegarlo en producción sin validación propia en robot real.
- Sin datos de cuantización: no hay ruta documentada para reducir los 14,5 GB de pesos float32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-pi05-base-wipe200-fp32
- Receta relacionada desde CEI: https://huggingface.co/Geoffrey19/cei2-pi05-fr3v2-leaphand-112h-wipe200-fp32
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Dataset de entrenamiento: `zwx/wipe_whiteboard_franka_leap_15hz_absolute_200` (referenciado en la model card; no se proporciona URL directa en la información disponible)
