# Donghyun1228/pi05-libero-all-module-relation-full10-joint-lambda100-diag49-retention-view-large-1000-20261014

## Resumen

Este repositorio contiene un checkpoint experimental de un modelo VLA (vision-language-action) para manipulación robótica, publicado por el usuario independiente Donghyun1228 bajo la librería `openpi` y asociado a la familia pi0.5. El modelo resuelve el problema de traducir instrucciones en lenguaje natural más observaciones visuales en secuencias de acciones físicas, y está entrenado sobre tareas del benchmark LIBERO, con datos objetivo del dataset `libero-dense-contact-sweep-d2`. Su relevancia es puramente investigadora: documenta un experimento concreto de objetivo de entrenamiento ("all-module relation") congelado tras 1.000 actualizaciones, no un modelo listo para producción.

El checkpoint tiene 13,1 GB de tamaño de repositorio, acumula 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni lista de idiomas. La model card describe con detalle el protocolo experimental (normalización original, pesos no-EMA, mezcla de FP32 para módulos entrenables y BF16 para módulos congelados), pero no publica resultados numéricos de éxito en manipulación, ni número de parámetros, ni longitud de contexto.

Se trata, por tanto, de un artefacto de reproducibilidad de un único brazo de experimento. El propio autor advierte que este checkpoint individual no demuestra retención de capacidades y que la pérdida de IDM no es la métrica de éxito del objetivo perseguido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de la familia pi0.5 sobre la librería `openpi`; componentes descritos en la model card: vision preentrenada, LLM preentrenado y "expert" de acciones, con muestreador Euler de diez pasos (inferido del identificador `pi05` y del contenido de la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no se publican cuantizaciones tipo GGUF/AWQ/GPTQ; el entrenamiento usa maestros activos en FP32 con cómputo BF16 nativo y el despliegue restaura todas las hojas a BF16 |
| Idiomas soportados | no disponible (la política se condiciona con instrucciones objetivo del dataset LIBERO; no se declara cobertura idiomática) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 13,1 GB en formato de la librería `openpi`) |
| Módulos entrenables | vision23, LLM9 y expert11 en FP32 |
| Módulos congelados | native frozen8 y source wrist23 en BF16 |
| Tamaño del repositorio | 13,1 GB |
| Versión de librería | `openpi` |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-14 |
| Última actualización | 2026-10-14 |

## Arquitectura y entrenamiento

La model card describe un sistema VLA compuesto por tres bloques: un codificador de visión, un LLM preentrenado y un módulo experto de acciones. El profesor ("teacher") combina la visión actual con el LLM y el experto preentrenados. Las dos rutas de visión actual se diferencian conjuntamente a través del muestreador Euler completo de diez pasos, y el objetivo de relación compara acciones físicas muestreadas. El autor señala explícitamente que este diseño altera tanto la profundidad del muestreador como las derivadas del profesor respecto al objetivo heredado, de modo que ningún resultado puede aislar uno de los dos cambios por separado. El campo "Muestreador Euler de diez pasos" corresponde a un esquema de generación por flow matching, coherente con la familia pi0.5 de `openpi`.

En cuanto al entrenamiento, el checkpoint contiene los parámetros "raw non-EMA" tras 1.000 actualizaciones, con los activos maestros en FP32 y cómputo nativo en BF16; en despliegue todas las hojas se restauran a BF16. El brazo de retención utiliza un único lambda común de 100,0, y el control escalar preserva la dirección y los momentos de Adam del IDM mientras iguala la norma de una propuesta candidata en el mismo estado. La invarianza de Gram permite reflexiones como aumentación. No entran en el entrenamiento ni observaciones de origen, ni caché de salidas de origen, ni retroalimentación de éxito; la política se condiciona únicamente con las instrucciones objetivo existentes. Los datos objetivo provienen del dataset `Donghyun1228/libero-dense-contact-sweep-d2-20261002` en el commit `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`. La inicialización real usó una fuente local heredada "native51"; el repositorio `pi05-libero-main-policy-retention-source-split74-20261013` (commit `24268da2aba5f690c879788d98e3455a2a579d8f`) se cita como referencia de despliegue canónicamente equivalente, no como entrada de inicialización.

## Capacidades

- Generación de acciones robóticas condicionadas por instrucciones en lenguaje natural y observaciones visuales (política VLA de manipulación).
- Ejecución de tareas de manipulación del benchmark LIBERO en simulación MuJoCo.
- Manipulación con contacto denso, dado que los datos objetivo son un barrido de contacto denso (`libero-dense-contact-sweep-d2`).
- Diferenciación conjunta a través del muestreador de diez pasos durante el entrenamiento (capacidad del pipeline de entrenamiento, no de inferencia).
- Augmentación por reflexiones habilitada por invarianza de Gram durante el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni razonamiento textual: es una política de control motor, no un asistente conversacional.
- No se documentan capacidades de audio, vídeo, voz ni procesamiento de documentos.
- Capacidades multilingües: no disponible.
- No se documenta ningún modo "thinking" ni decodificación especulativa.

## Casos de uso

- Evaluación de referencia en LIBERO: el checkpoint está pensado para ejecutarse en el protocolo de evaluación objetivo descrito (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3) y comparar contra la referencia de despliegue `source-split74`.
- Reproducción de experimentos de objetivo de relación entre módulos: sirve como artefacto congelado de 1.000 actualizaciones para auditar el efecto del objetivo "all-module relation" con lambda=100,0 frente al objetivo heredado.
- Investigación sobre retención de políticas: permite estudiar si el brazo de retención preserva capacidades de manipulación, aunque el propio autor advierte que este checkpoint aislado no lo establece.
- Estudio de esquemas de normalización y precisión mixta: el checkpoint conserva los activos de normalización originales y una mezcla FP32/BF16 documentada, útil para reproducir condiciones de entrenamiento con precisión mixta.
- Banco de pruebas de infraestructura de inferencia distribuida: el protocolo descrito con 8 clientes por GPU y un servidor con flujo RNG compartido sirve para validar arneses de evaluación paralela, teniendo en cuenta que las peticiones de política no están emparejadas por episodio.
- Análisis de augmentación por simetría: la propiedad de invarianza de Gram que habilita reflexiones puede estudiarse como técnica de aumento de datos en políticas visomotoras.
- Línea base negativa o de control en comparativas de VLA: al ser un brazo experimental muy específico, es adecuado como punto de contraste en estudios de ablación, no como política de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes/GPU, MuJoCo 3.2.3, peticiones de política con flujo RNG compartido y sin emparejamiento por episodio), pero no incluye ninguna cifra de tasa de éxito ni comparación numérica. Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, que no serían aplicables a una política de acción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como inferencia no confirmada, dado un repositorio de 13,1 GB y una restauración de todas las hojas a BF16 en despliegue, la huella podría situarse en el orden de 7-10 GB, pero el autor no publica esta cifra y la cifra depende de cuántos tensores del repositorio correspondan a maestros FP32 de entrenamiento y no a pesos de despliegue.
- GPU recomendadas: no disponible. La model card solo menciona un escenario de evaluación con 8 clientes por GPU, sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Si la huella BF16 resultase del orden de 7-10 GB, cabría en GPUs de consumo con 12-24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090), pero esto es una inferencia no verificada y no una especificación del autor.
- Opciones de despliegue: la librería declarada es `openpi`; la ruta de inferencia citada es `pi05_libero_source_free_split_vision_idm` en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` con restauración BF16. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y estas pilas de servicio de LLM no están indicadas para esta arquitectura.
- Entorno de simulación: MuJoCo 3.2.3, requerido para la evaluación descrita.
- Latencia y throughput: no disponible. Solo se conoce el esquema de paralelismo de evaluación (8 clientes por GPU).

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`pi05-libero-all-module-relation-...-20261014`) | Brazo experimental con objetivo de relación, 1.000 actualizaciones, pesos no-EMA | no disponible | no disponible | no disponible | Repositorio HF público, 0 descargas, 0 likes, 13,1 GB |
| `Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013` (commit `24268da2...`) | Referencia de despliegue canónicamente equivalente citada por el autor, no la inicialización real | no disponible | no disponible | no disponible | Repositorio HF público |
| `pi05_libero_source_free_split_vision_idm` (commit `0f6471d9...`) | Variante de inferencia citada en la model card, restauración BF16 | no disponible | no disponible | no disponible | Referencia de código/commit, no repositorio de pesos independiente |
| Otras familias VLA (pi0, OpenVLA, etc.) | Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificados de parámetros, contexto, rendimiento o licencia para ninguno de los elementos comparados, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización de uso comercial ni condiciones claras de redistribución; trátese como material de investigación sin derechos de uso definidos.
- Advertencia explícita del autor: este checkpoint individual no establece retención. No debe citarse como evidencia de que el brazo de retención funcione.
- El objetivo de relación cambia simultáneamente la profundidad del muestreador y las derivadas del profesor respecto al objetivo heredado, de modo que ningún resultado puede atribuirse a uno solo de los dos cambios.
- La pérdida de IDM no es la métrica de éxito del objetivo, por lo que optimizarla no implica mejor manipulación.
- Las peticiones de política comparten un flujo RNG del servidor y no están emparejadas por episodio, lo que limita la comparabilidad estadística entre configuraciones.
- El JSON de evaluación preserva los resultados reales y ninguna puntuación del entorno de origen se trata como retención de manipulación.
- No entran en el entrenamiento observaciones de origen, caché de salidas de origen ni retroalimentación de éxito, lo que restringe lo que el modelo puede haber aprendido sobre el entorno fuente.
- Riesgo de alucinación: no aplica en el sentido textual; en políticas visomotoras el riesgo análogo es la ejecución de acciones no válidas o no generalizables fuera de la distribución de entrenamiento, no cuantificado en la información disponible.
- Sesgos conocidos: no disponible. No se documenta análisis de sesgo demográfico, lingüístico ni de sesgo de simulación a realidad.
- Limitaciones de contexto e idioma: no disponible; no se declara cobertura idiomática ni longitud de contexto.
- Modelo experimental con 0 descargas y 0 likes: sin validación externa conocida, sin garantía de reproducibilidad por terceros y sin mantenimiento declarado.
- Dependencia de MuJoCo 3.2.3 y del ecosistema `openpi`: no es portable directamente a pilas de servicio estándar de LLM.
- Advertencia sobre los resultados de la búsqueda web realizada: las fuentes devueltas no guardan ninguna relación con el modelo (contenido para adultos sin vínculo técnico), por lo que no se ha utilizado ningún dato de esas fuentes en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-full10-joint-lambda100-diag49-retention-view-large-1000-20261014
- Perfil del autor: https://huggingface.co/Donghyun1228
- Dataset objetivo citado en la model card: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Referencia de despliegue canónicamente equivalente: https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013
- Librería declarada: `openpi` (no se proporciona URL del repositorio en la información disponible)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo, a papers, a blogs ni a demos en las fuentes consultadas.
