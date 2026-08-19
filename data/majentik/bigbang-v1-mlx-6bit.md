# majentik/BigBang-v1-MLX-6bit

## Resumen

BigBang-v1-MLX-6bit es una variante cuantizada en 6 bits (affine, group size 64) del modelo multimodal BigBang-v1 desarrollado por endless-frontier. La cuantización ha sido realizada por el usuario majentik específicamente para ejecutarse en Apple silicon mediante la librería MLX, manteniendo la torre de visión y el proyector en BF16 mientras que la torre de texto se cuantiza. El modelo base emplea una arquitectura de mezcla de expertos (MoE) basada en Qwen3.5, con un total de 8.030.801.776 parámetros, y está diseñado para tareas de imagen a texto y conversación multimodal.

Esta versión cuantizada resulta relevante porque permite ejecutar un modelo multimodal de 8B parámetros en hardware de Apple con requisitos de memoria reducidos, aprovechando la optimización de MLX. Al estar disponible en varios niveles de cuantización (de 2 a 8 bits y MXFP4), ofrece flexibilidad para distintos equilibrios entre calidad y consumo de recursos. La licencia Apache-2.0 facilita su uso comercial y su integración en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3.5 (qwen3_5_moe), multimodal (imagen y texto) |
| Parametros totales | 8.030.801.776 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine (group size 64); tambien disponibles versiones 2, 3, 4, 5, 8 bits y MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base BigBang-v1 emplea una arquitectura de mezcla de expertos (MoE) derivada de Qwen3.5, lo que implica que solo una fracción de los parámetros se activa durante cada inferencia, mejorando la eficiencia computacional. Al ser multimodal, integra una torre de visión y un proyector que permiten procesar imágenes junto con texto. En esta variante cuantizada, la torre de texto se ha cuantizado a 6 bits con esquema affine y group size 64, mientras que la torre de visión y el proyector se conservan en BF16 para mantener la calidad en el procesamiento visual.

No se dispone de información sobre el entrenamiento del modelo base: ni el número de tokens utilizados, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La cuantización se realizó con la herramienta `mlx_lm.convert` de mlx-lm versión 0.31.3. El paquete superó una prueba de coherencia determinista (smoke gate) que verificó la generación de texto sin repeticiones, bucles ni tokens especiales residuales.

## Capacidades

- Generacion de texto multimodal: procesa imagenes y texto para generar respuestas contextuales.
- Conversacion multi-turno: disenado para dialogos, con soporte para mantener el hilo conversacional.
- Eficiencia en inferencia: gracias a la arquitectura MoE, solo se activan los expertos necesarios, reduciendo el coste computacional.
- Compatibilidad con Apple silicon: optimizado para ejecutarse en chips M1, M2, M3 y superiores mediante MLX.
- Cuantizacion flexible: el mismo modelo base esta disponible en varios niveles de cuantizacion, permitiendo ajustar el equilibrio entre precision y memoria.
- Integracion con mlx-lm: se puede cargar y usar directamente con la libreria `mlx-lm` de forma sencilla.

## Casos de uso

- Asistente conversacional local en Mac: permite ejecutar un chatbot multimodal sin conexion, aprovechando la cuantizacion de 6 bits para caber en la memoria unificada de equipos Apple con 16 GB o mas.
- Analisis de imagenes en entornos profesionales: un disenador o arquitecto puede subir una fotografia y pedir descripciones, deteccion de objetos o sugerencias de mejora, todo ejecutado localmente.
- Generacion de descripciones accesibles: creacion automatica de textos alternativos (alt text) para imagenes en blogs o documentacion, procesando el contenido visual de forma offline.
- Prototipado rapido de aplicaciones multimodales: desarrolladores pueden integrar el modelo en aplicaciones Swift o Python usando mlx-lm, sin depender de APIs externas.
- Educacion y formacion: uso en entornos docentes para explicar conceptos mediante imagenes y texto, con la ventaja de no enviar datos a servidores externos.
- Automatizacion de tareas de soporte: clasificacion de capturas de pantalla o imagenes de errores para generar respuestas de ayuda, combinando vision y lenguaje en un solo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: Apple silicon (M1, M2, M3 o superiores) con macOS.
- Memoria: el tamano del repositorio es de 29.1 GB, pero el modelo cuantizado a 6 bits ocupa significativamente menos; se recomienda al menos 16 GB de memoria unificada para una experiencia fluida.
- GPU: integrada en el chip de Apple; no requiere GPU externa.
- Despliegue: mediante la libreria `mlx-lm` (pip install mlx-lm) y el comando `mlx_lm.generate`.
- Latencia y throughput: no se proporcionan datos especificos; dependen del chip concreto y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (mismo tamano o misma tarea) en terminos de rendimiento y benchmarks. La unica comparacion posible es con las otras versiones cuantizadas del mismo modelo base (2, 3, 4, 5, 8 bits y MXFP4), que varian en el nivel de precision y el tamano final, pero no se han publicado metricas comparativas.

## Limitaciones y advertencias

- La cuantizacion a 6 bits puede introducir una ligera degradacion en la calidad de las respuestas respecto al modelo original en BF16, especialmente en tareas que requieren precision numerica alta.
- No se conocen los idiomas soportados ni la longitud de contexto, por lo que puede haber limitaciones en textos muy largos o en idiomas distintos al ingles.
- Al ser una version cuantizada, no se garantiza la misma fidelidad que el modelo base en todos los escenarios; se recomienda validar en el caso de uso concreto.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el modelo base cumple con las mismas condiciones (así parece, segun la model card).
- No se han publicado evaluaciones de sesgos o alucinaciones; como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado.
- El modelo esta pensado exclusivamente para Apple silicon; no es compatible con CUDA ni otras plataformas sin conversion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/BigBang-v1-MLX-6bit
- Modelo base: https://huggingface.co/endless-frontier/BigBang-v1
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Otras versiones cuantizadas (2, 3, 4, 5, 8 bits y MXFP4): disponibles en el perfil de majentik en HuggingFace.
