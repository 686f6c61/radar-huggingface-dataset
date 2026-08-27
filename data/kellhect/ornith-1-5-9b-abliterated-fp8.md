# KellHect/Ornith-1.5-9B-Abliterated-FP8

## Resumen

Ornith-1.5-9B-Abliterated-FP8 es un derivado del modelo multimodal Ornith-1.5-9B, desarrollado por KellHect con fines de investigación en seguridad de IA y red-team. El modelo base, creado por Ornith AI, es un sistema de codificación agéntica de ~9.650 millones de parámetros que implementa un bucle de auto-mejora (self-scaffolding) y está diseñado para tareas de razonamiento y generación de código. Esta versión abliterada elimina deliberadamente gran parte del comportamiento de rechazo del modelo original, lo que permite estudiar cómo responde ante solicitudes que el base normalmente rechazaría.

La versión FP8 utiliza cuantización comprimida (compressed-tensors FP8_DYNAMIC W8A8) para reducir el uso de memoria y acelerar la inferencia, manteniendo una fidelidad alta respecto al checkpoint BF16 (error relativo máximo de Frobenius de 0,0267 y similitud coseno mínima de 0,9996). El modelo conserva la torre de visión, el bloque MTP, el tokenizador y la plantilla de chat del original, por lo que sigue siendo multimodal (entrada de imagen y texto). Está pensado exclusivamente para inferencia; para entrenamiento se recomienda usar la versión BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (multimodal, image-text-to-text) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC W8A8 (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de ~9.650 millones de parámetros, con arquitectura similar a la familia Qwen3.5 (según el tag `qwen3_5`). Incluye una torre de visión para procesar imágenes y un bloque MTP (multi-token prediction) que probablemente acelera la decodificación. El entrenamiento del base sigue el paradigma de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje.

La versión abliterada modifica únicamente las proyecciones residuales del módulo de lenguaje, aplicando una combinación de SVD (descomposición en valores singulares) y LEACE (intervención de conceptos lineales) para eliminar la dirección de rechazo. El proceso incluye re-probing iterativo, refinamiento de prompts de seguridad y mezcla en el espacio de pesos. Se preservan intactos la torre de visión, el bloque MTP, el tokenizador, la plantilla de chat y los procesadores multimodales. No se han publicado detalles sobre el dataset de entrenamiento del base ni sobre el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y texto como entrada, produce respuestas de texto.
- Generación de código: el modelo base está orientado a codificación agéntica, aunque la evaluación de código se ha diferido en esta versión.
- Soporte de tool calling y agentes: no confirmado explícitamente en la documentación, pero el base está diseñado para flujos agénticos de codificación.
- Comportamiento de rechazo reducido: puede responder a solicitudes que el modelo base rechazaría, útil para pruebas de red-team.
- Compatibilidad con transformers y compressed-tensors: se integra con el ecosistema estándar de Hugging Face.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los modelos manejan solicitudes maliciosas o de alto riesgo cuando se elimina el rechazo, para diseñar mejores mecanismos de alineación.
- Red-team de sistemas de IA: generar respuestas a prompts adversarios para identificar vulnerabilidades en sistemas de moderación o filtros de contenido.
- Evaluación de robustez de modelos: comparar el comportamiento del modelo abliterado con el base para medir el impacto de la intervención en la dirección de rechazo.
- Desarrollo de agentes de codificación: si se confirma el soporte de tool calling, puede integrarse en pipelines de generación y revisión de código, aunque se recomienda validar su rendimiento antes de usarlo en producción.
- Análisis multimodal de documentación técnica: procesar capturas de pantalla o diagramas junto con texto para generar explicaciones o detectar errores en código.
- Pruebas de jailbreak y mitigación: evaluar la eficacia de técnicas de defensa contra jailbreaks utilizando un modelo con rechazo reducido como caso extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación de código fue diferida intencionalmente y que los números reportados son diagnósticos estructurales y de pantalla de rechazo, no una afirmación de paridad con el modelo base. Los únicos datos de validación son:

- Error relativo máximo de Frobenius en reconstrucción: 0,026736
- Similitud coseno mínima: 0,999635
- Refusal flags: 0/12 en refinamiento y 0/24 en pantalla held-out
- Probabilidad media del token de rechazo: 1,18e-5

## Requisitos de hardware

- El repositorio pesa 12,4 GB, lo que sugiere que los pesos FP8 ocupan aproximadamente 9,7 GB (1 byte por parámetro) más overhead.
- Se recomienda una GPU con al menos 16 GB de VRAM para inferencia cómoda, aunque no se ha confirmado oficialmente.
- El modelo base BF16 ocupa ~19 GB y se sirve en una GPU de 80 GB, según la documentación de Ornith AI.
- Es compatible con `transformers` y `compressed-tensors`; se puede cargar con `device_map="auto"` para distribuir en múltiples GPUs.
- No se han publicado datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | ~9,65B | no disponible | BF16 | MIT | Modelo original, con rechazo intacto |
| Ornith-1.5-9B-Abliterated-FP8 | ~9,65B | no disponible | FP8 | MIT | Derivado abliterado, sin rechazo |
| Ornith-1.5-9B-MLX | ~9,65B | no disponible | MLX | MIT | Versión para Apple Silicon |

No se dispone de comparación con otros modelos de codificación de tamaño similar (p. ej., Qwen2.5-Coder-7B o DeepSeek-Coder-V2-Lite) porque no hay datos de benchmarks publicados para este derivado.

## Limitaciones y advertencias

- El comportamiento de rechazo se ha reducido deliberadamente; el modelo puede generar contenido dañino, ilegal o no ético. Los usuarios son responsables del despliegue, control de acceso, contenido generado y cumplimiento legal.
- No se ha evaluado el rendimiento en tareas de código; los resultados de validación son solo estructurales y de pantalla de rechazo.
- Requiere versiones mutuamente compatibles de Torch, Transformers y `compressed-tensors`; si el cargador FP8 no está disponible en una plataforma, se debe usar la versión BF16.
- No se garantiza paridad de rendimiento con el modelo base en tareas de razonamiento o generación.
- No hay información sobre idiomas soportados ni longitud de contexto, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- La licencia MIT permite uso comercial, pero el aviso de la model card insta a la responsabilidad del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KellHect/Ornith-1.5-9B-Abliterated-FP8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Versión MLX: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Repositorio OBLITERATUS (técnica de abliteración): https://github.com/elder-plinius/OBLITERATUS
