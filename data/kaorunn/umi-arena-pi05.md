# kaorunn/umi-arena-pi05

## Resumen

umi-arena-pi05 es una política robótica entrenada por kaorunn (equipo OPAN UMI) a partir del modelo base pi0.5, un modelo de visión-lenguaje-acción (VLA) orientado al control de robots manipuladores. El modelo se ha afinado para la evaluación UMI Arena, una competición de manipulación robótica con tareas de manipulación de objetos, y se publica como candidato para dicha evaluación. La relevancia inmediata es acotada: se trata de un checkpoint de competición, no de un modelo generalista, y el propio autor advierte de que el rendimiento en robot real y en la GPU del organizador no está verificado.

El repositorio contiene únicamente los activos de inferencia: pesos en safetensors, configuración, tokenizador, procesadores de normalización, un adaptador `policy.py` y el fichero `umi_arena.yaml`. La librería de referencia es LeRobot 0.6.1 y el pipeline declarado en HuggingFace es `robotics`. No se publican datos de entrenamiento, imágenes, índices de episodios ni checkpoints de optimizador.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de repositorio de 9,4 GB. No se dispone de información sobre licencia, idiomas soportados ni longitud de contexto en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA basada en pi0.5; detalles de arquitectura interna no publicados) |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo consume instrucciones de lenguaje, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 9,4 GB) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una política pi0.5, es decir, un modelo de visión-lenguaje-acción que mapea observaciones visuales y estado propioceptivo más una instrucción de lenguaje a secuencias de acciones. El adaptador descrito carga offline y transforma RGB de muñeca izquierda y derecha, un vector de estado de dimensión 9 (`state9`) y el lenguaje en chunks de acción float32 de forma (50, 16), ordenados como delta-pose izquierda/derecha seguido de pinza absoluta. El orden de cuaterniones es xyzw y la alineación de acciones crudas almacenada es de 30 Hz. No se detallan en la información proporcionada la arquitectura interna (transformer, mezcla de expertos, etc.), el número de tokens de entrenamiento ni la composición del dataset.

El entrenamiento consistió en un ajuste fino del modelo preentrenado pi0.5 con 3.000 actualizaciones en la etapa Bridge y 15.000 actualizaciones en la etapa Core. El pool de entrenamiento Core cubre cuatro familias de tareas públicas confirmadas; el autor no reclama cobertura completa de las cinco tareas, incluida la tarea del portalápices (penholder). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La verificación reportada incluye una recarga estricta del checkpoint y la superación del comprobador de interfaz oficial local.

## Capacidades

- Control robótico de manipulación a partir de observaciones visuales de dos muñecas (RGB izquierda y derecha) y estado propioceptivo de 9 dimensiones.
- Condicionamiento por instrucciones de lenguaje para seleccionar la tarea.
- Generación de chunks de acción de 50 pasos con 16 dimensiones por paso (delta-pose y pinza absoluta).
- Ejecución a 30 Hz según la alineación de acciones almacenada.
- Integración con el runtime oficial de UMI Arena sobre LeRobot 0.6.1, sin necesidad de servidor separado.
- Carga offline del adaptador y de los procesadores de normalización incluidos.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación en UMI Arena: el modelo está diseñado específicamente para registrarse y ejecutarse en el runtime oficial de la competición, por lo que su uso principal es la participación en dicha evaluación con el adaptador y la configuración incluidos.
- Investigación en políticas VLA: sirve como checkpoint de referencia para estudiar el ajuste fino de pi0.5 sobre tareas de manipulación con observaciones de muñeca y estado propioceptivo.
- Reproducción de pipelines LeRobot: al incluir `policy.py`, tokenizador y procesadores de normalización, permite reproducir el flujo de inferencia completo en LeRobot 0.6.1 sin infraestructura adicional.
- Experimentos de manipulación bimanual: el uso de RGB de muñeca izquierda y derecha y de acciones delta-pose por brazo lo hace adecuado para probar control coordinado de dos brazos en entornos simulados.
- Pruebas de robustez en simulador: el autor reporta diez rollouts en un simulador aproximado de taza flotante YUBI sin colocación completada, lo que convierte al modelo en un caso de estudio sobre brechas sim-a-real y límites de pinza.
- Base para ajuste fino adicional: al ser un checkpoint pi0.5 afinado, puede servir como punto de partida para reentrenar sobre nuevas familias de tareas, aunque no se documentan recetas de entrenamiento.
- Docencia y demostraciones de VLA: útil para ilustrar el formato de acciones, el orden de cuaterniones y la normalización en políticas robóticas, siempre con las cautelas de rendimiento no verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una verificación cualitativa: recarga estricta del checkpoint y comprobador de interfaz oficial superados, y diez rollouts en un simulador aproximado de taza flotante YUBI sin colocación completada, con paradas por límite de pinza específicas del simulador y límites de tiempo mixtos. Estos resultados son diagnósticos y no puntuaciones de competición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parámetros en safetensors, los pesos ocupan aproximadamente 8,3 GB en fp16 y unos 16,6 GB en fp32; a ello hay que sumar el coste de los procesadores visuales y del estado de inferencia, no cuantificado en la información.
- GPU recomendadas: no disponibles. Por tamaño de pesos, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40 GB, H100) sería el punto de partida razonable en fp16, pero el autor no publica requisitos ni pruebas.
- ¿Cabe en GPU de consumo? Probablemente en fp16 en tarjetas con 16 GB o más, pero no está verificado ni documentado.
- Opciones de despliegue: runtime oficial de UMI Arena sobre LeRobot 0.6.1, con el adaptador `policy.py` y `umi_arena.yaml` incluidos. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para una política robótica de este tipo.
- Latencia y throughput: no disponibles. Solo se conoce la frecuencia de las acciones almacenadas (30 Hz), que no equivale a latencia de inferencia medida.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables (por ejemplo, otras políticas pi0.5 o VLA de manipulación) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Rendimiento en robot real no verificado; el autor lo declara explícitamente.
- Rendimiento en la GPU del organizador no verificado.
- Cobertura de tareas incompleta: cuatro familias públicas confirmadas; no se reclama la quinta tarea (penholder).
- En un simulador aproximado de taza flotante YUBI, diez rollouts no completaron la colocación de la taza; son resultados diagnósticos, no puntuaciones.
- Licencia no disponible: no puede asumirse uso comercial sin confirmación del autor.
- Idiomas no especificados: no hay garantía sobre el idioma de las instrucciones de lenguaje.
- Solo se publican activos de inferencia; no hay datos, índices de episodios ni checkpoints de optimizador, lo que limita la reproducibilidad del entrenamiento.
- Los procesadores de normalización contienen estadísticas agregadas de entrenamiento, lo que puede introducir sesgos heredados del dataset original, no documentado.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; en políticas robóticas se traduce en acciones fuera de distribución.
- La revisión publicada debe comprobarse antes del registro en UMI Arena, según el propio autor.
- Fecha de creación del repositorio (2026-11-02) y actualización (2026-11-02) según HuggingFace; conviene verificar la vigencia de la revisión.

## Enlaces

- HuggingFace: https://huggingface.co/kaorunn/umi-arena-pi05
- LeRobot (librería de referencia, versión 0.6.1): no se proporciona enlace en la información disponible
- UMI Arena (runtime oficial): no se proporciona enlace en la información disponible
- Paper o blog de pi0.5: no se proporciona enlace en la información disponible
