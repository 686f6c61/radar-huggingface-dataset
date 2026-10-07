# reaperdoesntknow/romeo

## Resumen

Romeo es un modelo de generación de texto publicado en Hugging Face por el usuario reaperdoesntknow (Convergent Intelligence), un investigador independiente de aprendizaje automático que se presenta como red-teamer y desarrollador de modelos abiertos a pequeña escala. El repositorio contiene 416.559.976 parámetros en formato safetensors, con un tamaño de 1,7 GB coherente con pesos almacenados en fp32. La etiqueta `custom_code` indica que el modelo requiere ejecutar código Python remoto para poder cargarse con transformers, lo que implica que su arquitectura no está integrada en la librería estándar.

La información pública es mínima. La model card es la plantilla autogenerada de transformers, con todos los campos marcados como "[More Information Needed]": no hay descripción del modelo, detalles de entrenamiento, datos de evaluación, licencia ni idiomas declarados. El único indicio sobre la arquitectura es el tag `tamelm_two_axis`, que no corresponde a ninguna familia conocida de modelos y sugiere un diseño propio del autor, sin documentación pública asociada.

Con 156 descargas y 0 "likes" en el momento de la consulta, se trata de un artefacto de investigación sin validación por parte de la comunidad. Su interés principal es como objeto de estudio de arquitecturas personalizadas, no como componente listo para producción: sin licencia, sin benchmarks y sin model card, cualquier uso real exige una evaluación previa por parte de quien lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag `custom_code`; el tag `tamelm_two_axis` apunta a una arquitectura propia no documentada) |
| Parámetros totales | 416.559.976 (≈416,6 M) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32, deducido del tamaño del repositorio) |
| Librería | transformers |
| Pipeline declarado | text-generation |
| Código remoto | sí, requiere `trust_remote_code=True` |
| Tamaño del repositorio | 1,7 GB |
| Fecha de creación | 2026-10-07 |
| Última actualización | 2026-10-07 |
| Descargas / likes | 156 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el procedimiento de entrenamiento, el volumen de datos, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card no contiene ninguna sección sustantiva y todos los apartados de "Training Details" y "Evaluation" figuran como "[More Information Needed]".

Los únicos datos objetivos disponibles son el número de parámetros (416.559.976) y el tamaño del repositorio (1,7 GB), compatibles con un checkpoint en fp32 sin optimizador. El tag `custom_code` implica que la definición de la clase del modelo viaja dentro del repositorio y se ejecuta al cargarla, por lo que la arquitectura exacta solo puede conocerse inspeccionando ese código o el `config.json`. El identificador `arxiv:1910.09700` que aparece entre los tags corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la plantilla de model card de Hugging Face, y no a un paper sobre este modelo.

## Capacidades

- Generación de texto: es la única capacidad declarada explícitamente, a través del pipeline `text-generation`.
- Razonamiento, matemáticas y código: no disponible; no hay benchmarks ni documentación que los acredite.
- Tool calling / function calling: no disponible; no hay evidencia de plantilla de chat ni de soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Visión, audio u otras modalidades: no disponible; el pipeline declarado es exclusivamente de texto.
- Modo "thinking" o razonamiento explícito: no disponible.
- Carga mediante código personalizado: confirmada por el tag `custom_code`, con la necesidad de habilitar `trust_remote_code`.

## Casos de uso

Advertencia previa: ninguno de los casos siguientes está respaldado por documentación, evaluación o licencia del autor. Se plantean como escenarios que un desarrollador o investigador podría explorar, siempre tras auditar el código remoto y verificar el comportamiento real del modelo.

- Estudio de arquitecturas personalizadas: el tag `tamelm_two_axis` y la presencia de `custom_code` convierten al modelo en un caso de estudio para analizar cómo se implementa una arquitectura fuera de las familias estándar de transformers y qué rendimiento ofrece frente a diseños convencionales de tamaño similar.
- Fine-tuning en dominio específico: con 416,6 M de parámetros, el ajuste fino completo o con LoRA cabe en una única GPU de consumo con 12-24 GB de VRAM, lo que permite adaptarlo a tareas concretas (clasificación de textos, resumen de dominio, generación de plantillas) en cuestión de horas.
- Generación de texto en local sin conexión: al ocupar aproximadamente 1,67 GB en fp32 y 0,83 GB en fp16, puede ejecutarse en portátiles y equipos modestos para tareas de generación de texto que no requieran salida de alta calidad.
- Investigación en red-teaming y evaluación adversarial: dado el perfil del autor, el modelo puede emplearse como sujeto de pruebas en experimentos de seguridad, análisis de sesgos o extracción de datos memorizados, comparando su comportamiento con el de modelos de referencia bien documentados.
- Base para experimentos de destilación o poda: su tamaño moderado lo hace manejable como alumno o como profesor en experimentos académicos de compresión, siempre que se cuantifique primero su calidad base, hoy desconocida.
- Docencia y prácticas de laboratorio: sirve para ilustrar el flujo completo de carga de un modelo con código personalizado, inspección de `config.json`, conversión de pesos y análisis de la tokenización, en un entorno donde los recursos de cómputo son limitados.
- Prototipado de pipelines con transformers: útil para validar infraestructura de servicio (servidores de inferencia, gestión de caché, monitorización) antes de migrar a modelos mayores con licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación con datos y no se han encontrado publicaciones, informes o repositorios asociados que aporten métricas de MMLU, HumanEval, GSM8K, perplexidad o cualquier otra medida comparable.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché de clave/valor): ≈1,67 GB en fp32, ≈0,83 GB en fp16/bf16, ≈0,42 GB en int8 y ≈0,21 GB en int4. Añadir entre un 20 % y un 30 % adicional para el runtime, activaciones y caché, cuyo tamaño exacto no puede calcularse porque se desconoce la longitud de contexto y el número de capas.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para fp16 (GTX 1650, RTX 3050, RTX 4060, T4). No se requiere A100 ni H100; estas solo tendrían sentido para servir lotes muy grandes o para reentrenamiento.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU dedicadas actuales e incluso en algunas integradas con memoria unificada. El cuello de botella no es la VRAM, sino la disponibilidad de una implementación compatible.
- Opciones de despliegue: transformers es la vía obligada, con `trust_remote_code=True`. vLLM, TGI, llama.cpp y Ollama no están confirmados: los tres primeros requieren que la arquitectura esté registrada y el último necesita una conversión a GGUF que depende de entender la arquitectura personalizada. No hay versiones cuantizadas publicadas.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Romeo (reaperdoesntknow) | 416,6 M | no disponible | no disponible | safetensors + `custom_code` | no disponible |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | safetensors y PyTorch en Hugging Face, integrado en transformers | métricas históricas publicadas en su model card |
| Qwen2.5-0.5B (Alibaba) | ≈494 M | 32.768 tokens | Apache-2.0 | safetensors, GGUF, soporte en vLLM y llama.cpp | resultados publicados en su model card |
| SmolLM2-360M (Hugging Face) | ≈362 M | 8.192 tokens | Apache-2.0 | safetensors, GGUF, integración amplia en el ecosistema | resultados publicados en su model card |

La comparación de rendimiento no puede completarse: Romeo carece de cualquier métrica publicada, mientras que las alternativas incluyen resultados en sus respectivas model cards. En términos prácticos, la diferencia más relevante no es de tamaño, sino de garantías: los tres modelos de referencia tienen licencia explícita, contexto declarado y soporte nativo en herramientas de despliegue, mientras que Romeo no ofrece ninguna de las tres cosas.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explícita, no puede asumirse permiso para uso comercial, redistribución ni modificación. En la práctica, el modelo se encuentra en una zona legal indeterminada.
- Ejecución de código remoto: la etiqueta `custom_code` obliga a habilitar `trust_remote_code=True`, lo que implica ejecutar en la máquina local código Python publicado por el autor. Debe auditarse antes de cualquier carga, especialmente en entornos corporativos o con datos sensibles.
- Model card vacía: no hay información sobre datos de entrenamiento, por lo que se desconocen la procedencia del corpus, la posible presencia de datos personales, contenido con derechos de autor o material tóxico.
- Sesgos: no evaluados ni documentados. Al no conocerse la composición del dataset, no puede estimarse el sesgo de género, raza, idioma o ideología.
- Alucinación: sin benchmarks ni evaluación cualitativa, no hay ninguna medida de la fiabilidad factual del modelo.
- Cobertura idiomática desconocida: el autor no declara idiomas soportados; es probable que el modelo esté entrenado predominantemente en inglés, pero no hay confirmación.
- Longitud de contexto desconocida: impide planificar aplicaciones multi-turno o de documentos largos y complica el dimensionamiento de memoria durante el servicio.
- Adopción muy baja: 156 descargas y 0 "likes" indican que el modelo no ha sido validado por la comunidad ni reproducido por terceros.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó el mismo día (2026-10-07) y no hay señales de soporte, versionado o corrección de errores posterior.
- Incompatibilidad potencial con el ecosistema: la ausencia de conversiones a GGUF y de integración en servidores de inferencia estándar limita el despliegue a scripts propios con transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/romeo
- Perfil del autor en Hugging Face: https://huggingface.co/reaperdoesntknow
- Listado de modelos del autor: https://huggingface.co/reaperdoesntknow/models
- Artículo citado en la plantilla de la model card (Lacoste et al., 2019, estimación de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático referenciada por la plantilla: https://mlco2.github.io/impact
