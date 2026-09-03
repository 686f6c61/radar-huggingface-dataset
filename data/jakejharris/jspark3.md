# jakejharris/jspark3

## Resumen

JSpark3 v1 es un repositorio de despliegue, no un modelo entrenado desde cero. Se trata de una receta reproducible para servir el modelo cuantizado GLM-5.3-Flash (de Z.AI) sobre un clúster de tres nodos NVIDIA DGX Spark, utilizando paralelismo tensorial de grado 3 (TP3), paralelismo de expertos (EP3), decodificación especulativa con un draft DFlash2 y una ventana de contexto configurada de 1.000.000 de tokens. El autor, jakejharris, no ha entrenado ni cuantizado ningún peso: el repositorio actúa como espejo autorizado y verificado por hash de los pesos EXL3/TR3 4 bpw publicados por Mia-AiLab y brandonmusic.

La relevancia de este proyecto radica en que aborda un problema práctico de producción: cómo servir un modelo grande de forma eficiente en hardware de gama media (DGX Spark) mediante una combinación de técnicas de paralelismo, cuantización y decodificación especulativa, con benchmarks públicos y reproducibles. El repositorio incluye documentación de procedencia, manifiesto de pesos con SHA-256 y una comparativa de rendimiento con otras recetas de despliegue públicas. Es importante señalar que, en el momento de la publicación, la transferencia de pesos no había comenzado y el repositorio no contenía archivos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (Z.AI), cuantizado EXL3/TR3 4 bpw |
| Parametros totales | no disponible |
| Parametros activos | no disponible (posible MoE, no confirmado) |
| Longitud de contexto | 1.000.000 tokens (configurado en el despliegue) |
| Tipos de cuantizacion | EXL3/TR3 4 bpw (objetivo), overlay INT8 W8A16 Marlin en el tronco del modelo, FP8 KV cache |
| Idiomas soportados | en (ingles) |
| Licencia | shapleymcg-license-1.0 (licencia personalizada, "other") |
| Formato de pesos | safetensors (esperado, no verificado; sin archivos en el repositorio) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3-Flash, desarrollado por Z.AI, una arquitectura de la familia GLM de próxima generación. JSpark3 no introduce ninguna modificación arquitectónica: los pesos son una copia exacta y verificada por hash del checkpoint cuantizado EXL3/TR3 4 bpw publicado por Mia-AiLab, que a su vez es un re-hospedaje byte-idéntico del trabajo de cuantización de Brandon M. Music. No se realizó ningún entrenamiento, fine-tuning ni cuantización adicional por parte del autor de JSpark3.

La innovación de este proyecto reside en la receta de despliegue, que combina varias técnicas para maximizar el rendimiento en tres nodos DGX Spark interconectados mediante una topología RoCE-v2 en triángulo de dos patas. La configuración incluye paralelismo tensorial de grado 3 (TP3), paralelismo de expertos de grado 3 (EP3), un draft model DFlash2 con k=7 para decodificación especulativa, caché de prefijos (prefix caching) y un overlay selectivo INT8 (W8A16 Marlin) sobre el tronco del modelo. El draft DFlash2 es un checkpoint separado de Inco AI, con licencia CC BY-NC-ND 4.0, que no se incluye en el repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con soporte para razonamiento multi-turno.
- Entrada multimodal imagen-texto (pipeline_tag: image-text-to-text), aunque no se detallan capacidades específicas de visión en la documentación.
- Decodificación especulativa con draft model DFlash2 (k=7) para acelerar la generación.
- Soporte de contexto largo de hasta 1.000.000 de tokens configurados.
- Despliegue optimizado para inferencia distribuida con tensor parallel y expert parallel.
- Compatible con vLLM y EXL3/TR3 para serving en producción.

## Casos de uso

- Servicio de chat conversacional de baja latencia: el despliegue TP3 con decodificación especulativa permite atender peticiones concurrentes con una tasa de generación de 81,96 tokens/s en texto estructurado, medido en el hardware objetivo.
- Procesamiento de documentos extensos: la ventana de contexto de 1.000.000 de tokens permite analizar libros completos, codebases enteros o largas transcripciones en una sola pasada.
- Generación de código asistida: el rendimiento medido en tareas de código es de 66,26 tokens/s, adecuado para integración en IDEs o pipelines de CI/CD.
- Investigación en sistemas de inferencia distribuida: la receta reproducible sirve como referencia para estudiar el impacto de TP3, EP3 y decodificación especulativa en clústeres pequeños.
- Despliegue de modelos en hardware de gama media: demuestra que tres DGX Spark pueden servir un modelo de la clase GLM-5.3-Flash con rendimiento competitivo frente a configuraciones de cuatro nodos.
- Auditoría y verificación de pesos: el manifiesto SHA-256 y la documentación de procedencia permiten verificar la integridad de los pesos antes de su despliegue en entornos regulados.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados reportados por el autor, medidos en su propio hardware con una pantalla congelada de 24 peticiones, thinking desactivado, temperatura 0 y 400 tokens máximos. Se comparan con otras recetas de despliegue públicas, cada una medida por su propio autor en sus propias condiciones. No se calculan porcentajes ni rankings entre filas porque las condiciones difieren.

| Receta | Nodos | Lane | Contexto | Decode (tok/s) | Base |
|---|---|---|---|---|---|
| **JSpark3 v1** `v1.0.0` | 3 | EXL3/TR3 4 bpw, DFlash2, W8A16 trunk overlay | 1.000.000 | estructurado 81,962; código 66,257; prosa 29,049 | local; mediana de tres baterías; servidor caliente |
| FlyCockpit TP3 `9093765c` | 3 | EXL3/TR3 4 bpw, DFlash2 | 1.000.000 | estructurado 69,0 / 68,5 / 71,2; código 52,3 / 58,7 / 58,2 | reportado por el autor |
| neko-legends TP4 | 4 | EXL3/TR3 4 bpw, DFlash2 | 1.000.000 | código 64,5; estructurado 100,9; matemáticas 77,8; prosa 23,1 | reportado por el autor |
| Mia TP2 `c190db1a` | 2 | EXL3/TR3 4 bpw, DFlash2 | 1.000.000 | sparkDash C1 62,9; estructurado 65,1; prosa 27,1 | reportado por el autor |
| jetnet TP3 `bfc820ec` | 3 | NVFP4 con Marlin W4A16, MTP-4 | 512K | 35,2; con DFlash2 y thinking activo, 47,2 | reportado por el autor |

Además, el autor reprodujo localmente dos recetas de Mia TP2 con adaptaciones de compatibilidad, obteniendo 24,913 y 24,728 tokens/s agregados en ejecuciones de agente con prompts idénticos.

## Requisitos de hardware

- Tres nodos NVIDIA DGX Spark, interconectados mediante RoCE-v2 en topología de triángulo de dos patas.
- Cada DGX Spark es una estación de trabajo compacta de NVIDIA con GPU Blackwell, diseñada para inferencia de IA en escritorio.
- La configuración requiere soporte de tensor parallel 3 y expert parallel 3, lo que implica que los tres nodos deben estar disponibles y correctamente interconectados.
- Para el draft model DFlash2 se necesita un checkpoint adicional (no incluido en el repositorio) con licencia CC BY-NC-ND 4.0.
- Opciones de despliegue: vLLM, EXL3/TR3, con imagen de serving específica `ghcr.io/miaai-lab/glm-5.3-flash-2x-dgx-sparks`.
- No se proporcionan datos de VRAM por nodo ni latencia petición-respuesta; solo tasas de decodificación en estado estacionario.

## Comparativa con modelos similares

La comparativa relevante no es con otros modelos, sino con otras recetas de despliegue para el mismo modelo base (GLM-5.3-Flash cuantizado). La tabla de benchmarks anterior ya recoge esta comparativa. En cuanto a modelos alternativos de la misma clase (contexto largo, cuantizados, desplegables en clústeres pequeños), no se dispone de información suficiente en la documentación proporcionada para establecer una comparación fiable.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo en el momento de la publicación: la transferencia autorizada no había comenzado. Cualquier uso requiere esperar a que se complete o descargar los pesos de las fuentes originales (Mia-AiLab o brandonmusic).
- La licencia shapleymcg-license-1.0 es una licencia personalizada no estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- El draft model DFlash2 tiene licencia CC BY-NC-ND 4.0, que prohíbe el uso comercial y la creación de obras derivadas. Esto puede limitar el despliegue en entornos empresariales.
- Los benchmarks son mediciones locales del autor en condiciones específicas; los resultados pueden variar significativamente con otros hardware, cargas o configuraciones.
- El modelo base solo declara soporte para inglés; no se garantiza calidad en otros idiomas.
- No se proporcionan datos sobre sesgos, alucinaciones o seguridad del modelo base; se recomienda evaluar estos aspectos antes de usar el sistema en producción.
- La configuración requiere tres DGX Spark dedicados, lo que supone un coste de hardware considerable y una complejidad de red no trivial (RoCE-v2).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jakejharris/jspark3
- Checkpoint origen (Mia-AiLab): https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-TR3-4bpw
- Checkpoint origen (brandonmusic): https://huggingface.co/brandonmusic/GLM-5.3-Flash-tr3-4bpw
- Modelo base (Z.AI): https://huggingface.co/zai-org/GLM-5.3-Flash
- Draft model (Inco AI): https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Repositorio GitHub previsto: github.com/jakejharris/jspark3 (privado, no público en el momento de la publicación)
- Repositorio GitHub del autor (xrx-core): https://github.com/jakejharris/xrx-core
- Repositorio de benchmarks neko-legends: https://github.com/neko-legends/spark-bench
