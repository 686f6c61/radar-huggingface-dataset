# Shiftedx/ornith-1.5-9b-affine4-bf16recurrence-vision-mlx

## Resumen

Ornith-1.5-9B es un modelo de lenguaje multimodal de la familia Ornith-1.5, desarrollado por Ornith AI, especializado en tareas de codificación agéntica y razonamiento visual. Esta variante concreta, publicada por el usuario Shiftedx, es una conversión a formato MLX para Apple Silicon con cuantización affine de 4 bits en el tronco lingüístico, mientras que los estados recurrentes y la torre de visión se conservan en BF16. El modelo base es Ornith-1.5-9B, un modelo denso de 9 mil millones de parámetros basado en la arquitectura Qwen3.5, con una ventana de contexto de 262.144 tokens.

El modelo resuelve el problema de ejecutar modelos de visión-lenguaje de alta capacidad en hardware de Apple con consumo de memoria reducido, manteniendo la calidad visual y la capacidad de razonamiento agéntico del modelo original. La relevancia actual radica en que permite desplegar un modelo de 9B con visión en dispositivos Apple Silicon (Macs con chip M-series) sin necesidad de GPUs dedicadas, algo que hasta hace poco requería hardware de servidor o cuantizaciones más agresivas que degradaban la precisión.

La cuantización affine de 4 bits en el tronco lingüístico reduce el tamaño lógico a 6,54 GB, con una arquitectura que combina 202 módulos affine-4, 48 módulos recurrentes en BF16 y 333 tensores de visión en BF16. El modelo no incluye soporte nativo de MTP (Multi-Token Prediction) porque el checkpoint original no contiene tensores `mtp.*`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 9B denso con visión (image-text-to-text) |
| Parametros totales | 2.140.822.768 (según safetensors) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Affine 4-bit (tronco lingüístico), BF16 (estados recurrentes y torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso basado en la arquitectura Qwen3.5, con un tronco lingüístico de 9B parámetros y una torre de visión integrada que permite procesar imágenes y texto de forma conjunta. La familia Ornith-1.5 se basa en el marco de auto-scaffolding introducido en Ornith-1.0, que se extiende a un bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo. Este proceso permite al modelo crear continuamente nuevas experiencias de aprendizaje a partir de las cuales mejorar.

En esta conversión concreta, el tronco lingüístico se cuantiza con 4 bits affine (202 módulos) mientras que los 48 módulos recurrentes que gestionan el estado interno se mantienen en BF16 para preservar la fidelidad de la información recurrente. La torre de visión también se mantiene en BF16 (333 tensores). El proceso de conversión está documentado en `BUILD_RECIPE.json` y `conversion_receipt.json`, que detallan el mapa exacto de precisión y la recepción de conversión fail-closed. El modelo no incluye MTP nativo; el checkpoint original carece de los tensores `mtp.*`.

## Capacidades

- Generación de texto con contexto multimodal (imagen + texto).
- Razonamiento visual: descripción de imágenes, respuesta a preguntas sobre contenido visual.
- Capacidades agénticas: el modelo base Ornith-1.5 está diseñado para tareas de coding agéntico, con soporte para multi-step reasoning y planificación de acciones.
- Soporte de tool calling / function calling (heredado del modelo base Qwen3.5).
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Procesamiento en Apple Silicon mediante MLX, optimizado para memoria unificada.
- Cuantización affine 4-bit que reduce el uso de memoria sin sacrificar los estados recurrentes críticos.

## Casos de uso

- Asistente de programación en local: el modelo puede usarse en un Mac con Apple Silicon para generar código, refactorizar funciones y explicar fragmentos de código, con capacidad de mantener contexto largo de un proyecto completo.
- Análisis de capturas de pantalla y diagramas de arquitectura: gracias a su torre de visión, puede interpretar diagramas técnicos, capturas de pantalla de errores o esquemas de infraestructura y responder preguntas sobre ellos.
- Automatización de tareas agénticas en CI/CD: con soporte de tool calling, puede integrarse en pipelines de CI para revisar código, generar documentación o proponer cambios.
- Asistente de documentación técnica: procesar documentos extensos (hasta 262K tokens) y generar resúmenes, tablas de contenido o respuestas a preguntas específicas.
- Chat conversacional con contexto largo: mantener conversaciones de múltiples turnos con memoria extendida, ideal para atención al cliente o soporte técnico en local.
- Prototipado de aplicaciones de visión-lenguaje en Apple Silicon: permite desarrollar y probar aplicaciones de visión-lenguaje en un Mac sin necesidad de GPU dedicada, usando MLX-VLM para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización concreta. La model card indica que los resultados de los tests de Shiftedx Bench se adjuntarán en una actualización posterior de la README. El modelo base Ornith-1.5-9B puede tener benchmarks publicados en la card del modelo original, pero no están incluidos en los datos proporcionados.

## Requisitos de hardware

- Diseñado para Apple Silicon: requiere un Mac con chip M-series (M1, M2, M3, M4) con al menos 16 GB de memoria unificada para el tamaño lógico de 6,54 GB.
- VRAM: no aplica como VRAM dedicada; usa memoria unificada de Apple Silicon. Se recomiendan 16 GB para una experiencia fluida, aunque puede funcionar con 8 GB con cuantizaciones más agresivas (no disponibles en esta versión).
- GPUs recomendadas: no requiere GPU dedicada; funciona en la GPU integrada de Apple Silicon vía MLX.
- Opciones de despliegue: MLX-LM y MLX-VLM (biblioteca de Python), compatible con el ecosistema MLX.
- Latencia y throughput: no se han publicado datos específicos para esta cuantización. La inferencia autoregressive en MLX suele ser eficiente en Apple Silicon, pero depende del modelo concreto y el tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Shiftedx/ornith-1.5-9b-affine4-bf16recurrence-vision-mlx | 2,14B (cuantizado) | 262.144 | Sí | MIT | MLX safetensors |
| ornith-ai/Ornith-1.5-9B (BF16 original) | ~9B | 262.144 | Sí | MIT | safetensors |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos de visión-lenguaje de 9B para Apple Silicon no está disponible en los datos proporcionados. El modelo base Ornith-1.5-9B se posiciona como una alternativa densa de menor tamaño dentro de la familia Ornith, que también incluye variantes de 31B denso, 35B MoE y 397B MoE. Esta cuantización concreta se diferencia por su optimización para Apple Silicon y la preservación de los estados recurrentes en BF16.

## Limitaciones y advertencias

- La cuantización affine 4-bit puede diferir en comportamiento respecto al modelo BF16 original; la model card recomienda revisar la card del modelo base para el uso previsto.
- No incluye MTP nativo, lo que puede reducir la velocidad de decodificación en comparación con modelos que sí lo soportan.
- Los idiomas soportados no están documentados; la calidad multilingüe no está garantizada.
- Los benchmarks de la cuantización no han sido publicados aún; el rendimiento real en tareas específicas no está verificado.
- El modelo está optimizado para Apple Silicon; no se proporciona soporte para CUDA o ROCm.
- La licencia MIT permite uso comercial y modificación, pero debe verificarse la licencia del modelo base original (ornith-ai/Ornith-1.5-9B) para cumplir con sus términos.
- La conversión fue realizada por un tercero (Shiftedx) y no por el equipo de Ornith AI; la fiabilidad del conversión depende del proceso documentado en los archivos de recepción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiftedx/ornith-1.5-9b-affine4-bf16recurrence-vision-mlx
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Colección Ornith-1.5 en HuggingFace: https://huggingface.co/collections/ornith-ai/ornith-15
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Sitio oficial de Ornith AI: https://ornith.ai/
- Perfil de Shiftedx en HuggingFace: https://huggingface.co/Shiftedx
