# lesa80/AliceAI-Foundation-80B-A3B-Base-6bit-MLX

## Resumen

AliceAI-Foundation-80B-A3B-Base-6bit-MLX es una conversión cuantizada a 6 bits del modelo base `yandex/AliceAI-Foundation-80B-A3B-Base`, publicada por el usuario lesa80 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una redistribución en formato MLX (Apple) de los pesos de un modelo Mixture-of-Experts de Yandex. Según la convención de nombres del repositorio, el modelo original tendría en torno a 80 000 millones de parámetros totales con aproximadamente 3000 millones activos por token, lo que lo sitúa en la familia de MoE dispersos de gran tamaño y baja activación.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de escala 80B en hardware Apple Silicon con memoria unificada, algo inviable con los pesos completos en bf16 (que exigirían más de 150 GB). Por otro, el repositorio no declara licencia, no declara idiomas y acumula cero descargas y cero votos, por lo que debe tratarse como un artefacto experimental y no como una dependencia de producción sin verificación previa.

La información pública disponible sobre esta conversión concreta es muy limitada: no hay model card con especificaciones, no hay datos de benchmarks y la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos correspondían a portales de comercio electrónico sin relación alguna). Todos los apartados siguientes distinguen explícitamente entre lo confirmado por los metadatos del repositorio y lo no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) — inferido de la etiqueta `moe` y del sufijo A3B del nombre; no confirmado en documentación oficial |
| Parametros totales | ~80 000 millones — inferido de la nomenclatura del repositorio; no confirmado |
| Parametros activos | ~3000 millones por token — inferido del sufijo A3B; no confirmado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (formato MLX); se desconoce si el grupo de cuantización es de 64 elementos, el valor por defecto de MLX |
| Idiomas soportados | no disponible; la etiqueta `ru` del repositorio sugiere orientación al ruso, sin confirmación |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`) |
| Modelo base | yandex/AliceAI-Foundation-80B-A3B-Base |
| Libreria de inferencia | MLX (Apple) |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 (metadato del repositorio) |

## Arquitectura y entrenamiento

El repositorio no incluye información sobre el entrenamiento del modelo original. Por la etiqueta `moe` y el patrón de nomenclatura `80B-A3B` (habitual en la literatura para indicar parámetros totales y parámetros activos), cabe inferir una arquitectura transformer con capas de expertos dispersos y un router que activa únicamente una fracción de los expertos por token. No se dispone de datos sobre el número de capas, la dimensión oculta, el número de expertos, la estrategia de enrutamiento (top-k), ni sobre si se empleó atención con ventana deslizante, atención lineal o algún esquema híbrido.

Tampoco hay información sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüismo), ni sobre si hubo fases de ajuste por instrucciones, RLHF o DPO. La etiqueta `base_model` y la ausencia del término `instruct` apuntan a que se trata de un modelo preentrenado sin alineación posterior, pero esto no está confirmado en la información proporcionada.

La innovación técnica del repositorio es exclusivamente de despliegue: la cuantización a 6 bits en formato MLX reduce el peso de los pesos de aproximadamente 160 GB en bf16 a unos 60 GB, habilitando la inferencia en equipos Apple Silicon con memoria unificada alta. No se documenta ninguna innovación de arquitectura ni de decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva: capacidad confirmada por el pipeline `text-generation` declarado en el repositorio.
- Razonamiento multi-paso: no disponible; no hay documentación sobre modos de pensamiento extendido ni sobre rendimiento en tareas de razonamiento.
- Generación de código: no disponible; no hay evidencia en la información proporcionada.
- Matemáticas: no disponible.
- Visión o audio: no disponible; las etiquetas del repositorio solo indican texto.
- Tool calling / function calling: no disponible; al tratarse presuntamente de un modelo base sin ajuste por instrucciones, es poco probable que soporte plantillas de herramientas, pero no puede confirmarse.
- Uso como agente: no disponible.
- Capacidades multilingües: no disponible; la etiqueta `ru` sugiere competencia en ruso, sin datos sobre el resto de idiomas.
- Modo thinking: no disponible.
- Ajuste fino posterior: al ser un modelo base, es susceptible de fine-tuning supervisado, aunque el repositorio no documenta recetas ni scripts de entrenamiento.

## Casos de uso

- Investigación en cuantización de MoE: el repositorio permite medir la degradación de perplejidad y de calidad de generación al pasar de bf16 a 6 bits en un MoE de 80B, comparando salidas contra el modelo base original de Yandex.
- Inferencia local en Apple Silicon: un Mac Studio o MacBook Pro con 96 GB o más de memoria unificada puede cargar los pesos de 6 bits (~60 GB) y ejecutar generación de texto sin GPU dedicada ni conexión a servicios en la nube, útil para entornos con requisitos de privacidad estrictos.
- Generación de texto en ruso: dado el origen del modelo base (Yandex) y la etiqueta `ru`, es un candidato razonable para tareas de redacción, resumen y reformulación en ruso, siempre que se valide la calidad con un conjunto de evaluación propio.
- Punto de partida para fine-tuning vertical: al ser un modelo base, puede ajustarse con supervisión en dominios concretos (legal, médico, técnico) partiendo de los pesos en MLX o reconvirtiendo a otro formato, aunque la licencia no declarada supone un riesgo legal que debe resolverse antes.
- Generación de datos sintéticos: un MoE de 80B con 3B activos puede emplearse para producir corpus sintéticos a un coste de cómputo por token relativamente bajo, destinados a entrenar modelos más pequeños.
- Evaluación de enrutamiento de expertos: la estructura MoE permite analizar qué expertos se activan por idioma o dominio, un caso de uso de investigación sobre interpretabilidad y especialización de expertos.
- Prototipado de asistentes conversacionales en local: aunque no está ajustado por instrucciones, puede envolverse con una capa de prompting few-shot para experimentar con flujos conversacionales antes de invertir en un modelo alineado.
- Reproducibilidad y auditoría de artefactos de terceros: el repositorio sirve como caso de estudio sobre redistribuciones no oficiales sin licencia declarada, útil para equipos que definen políticas de uso de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones frente al modelo base en precisión completa.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: aproximadamente 60 GB solo para los pesos de 6 bits (80 000 millones de parámetros × 0,75 bytes por parámetro). Con caché KV, buffers de activación y sobrecarga del runtime, conviene reservar entre 65 y 80 GB en función de la longitud de contexto.
- GPU compatibles: MLX está diseñado para Apple Silicon, por lo que el despliegue directo requiere un chip de la familia M (M1, M2, M3, M4) con memoria unificada suficiente. No es ejecutable en CUDA sin reconvertir los pesos a otro formato.
- Equipos recomendados: Mac Studio o MacBook Pro con 96 GB de memoria unificada como mínimo viable; 128 GB o 192 GB para trabajar con contextos largos o lotes mayores de uno. En configuraciones de 64 GB o menos el modelo no cabe.
- ¿Cabe en GPU de consumo? No en GPUs de consumo con 24 GB o 48 GB de VRAM en su formato actual de 6 bits. Sería necesario recurrir a cuantizaciones de 4 bits o inferiores, que no están publicadas en este repositorio.
- Opciones de despliegue: MLX (`mlx-lm`) para Apple Silicon, que es la librería declarada. Para otros entornos habría que convertir los pesos a safetensors estándar y usar vLLM, TGI, llama.cpp u Ollama, algo que el repositorio no documenta.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia de primera respuesta.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables con datos verificables. La búsqueda web realizada no devolvió documentación técnica sobre el modelo base ni sobre conversiones alternativas. Como referencia arquitectónica de la misma categoría (MoE disperso de gran tamaño y baja activación), pueden citarse los siguientes modelos, cuyos datos proceden de su documentación pública y no de la información de esta búsqueda:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B-Base (6-bit MLX) | ~80B (inferido) | ~3B (inferido) | no disponible | no disponible | safetensors MLX |
| Mixtral 8x7B (referencia) | ~46,7B | ~12,9B | 32 000 tokens | Apache 2.0 | safetensors, GGUF |
| Qwen3-30B-A3B (referencia) | ~30,5B | ~3,3B | 32 000 tokens nativos, ampliable | Apache 2.0 | safetensors, GGUF |

La comparación de rendimiento frente a estos modelos no es posible con los datos disponibles, ya que no se han publicado evaluaciones del modelo de Yandex en este repositorio.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial. Es un bloqueante para cualquier despliegue en producción hasta aclararlo con el autor del modelo base.
- Repositorio sin tracción: cero descargas y cero votos, sin documentación, sin ejemplos de uso y sin scripts de conversión. No hay evidencia de que los pesos hayan sido validados más allá de la subida.
- Modelo base, no alineado: al no haber sido ajustado por instrucciones, no sigue órdenes de forma fiable, puede generar continuaciones incoherentes y no respeta formatos estructurados.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala, agravado por la ausencia de evaluación publicada y por la falta de alineación.
- Sesgos: no disponible. No hay ninguna evaluación de sesgo, toxicidad o sesgo de representación para este modelo ni para su base.
- Idiomas: la información de idiomas no está declarada. La etiqueta `ru` sugiere un sesgo hacia el ruso; el rendimiento en castellano es desconocido y probablemente inferior al de modelos entrenados con corpus hispanohablantes amplios.
- Degradación por cuantización: la conversión a 6 bits introduce pérdida de precisión respecto al modelo base. No se han publicado mediciones de perplejidad que cuantifiquen esa pérdida.
- Restricción de plataforma: los pesos en MLX solo se ejecutan en Apple Silicon. Su uso en GPU NVIDIA o AMD requiere una conversión previa no incluida en el repositorio.
- Longitud de contexto desconocida: sin este dato no puede planificarse el consumo de memoria de la caché KV ni diseñar aplicaciones con contexto largo.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que sugiere que deben verificarse antes de confiar en ellas.
- Búsqueda web sin resultados útiles: los resultados devueltos correspondían a plataformas de comercio electrónico sin relación con el modelo, por lo que no se han podido contrastar los datos del repositorio con fuentes independientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lesa80/AliceAI-Foundation-80B-A3B-Base-6bit-MLX
- Modelo base en HuggingFace: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Repositorio de MLX-LM: https://github.com/ml-explore/mlx-lm
- Paper o blog oficial de Yandex sobre AliceAI-Foundation-80B-A3B-Base: no disponible
- Demos, espacios o documentación adicional: no disponible
- Resultados de la búsqueda web: no se encontró ningún resultado relevante sobre el modelo; los enlaces devueltos correspondían a portales de comercio electrónico sin relación con la consulta.
