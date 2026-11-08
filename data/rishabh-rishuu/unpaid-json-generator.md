# rishabh-rishuu/Unpaid-JSON-Generator

## Resumen

Unpaid JSON Generator es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B, desarrollado por el usuario rishabh-rishuu, especializado en una única tarea: convertir datos no estructurados (CSV desordenados, volcados de errores, notas libres) en objetos JSON válidos y conformes con RFC, sin ningún tipo de texto conversacional adicional. El modelo parte de la arquitectura transformer de Qwen2.5 (1.543.714.304 parámetros, aproximadamente 1,54B) y ha sido entrenado mediante SFT completo en BF16 sobre 15.000 pares esquema-JSON verificados con AST.

La propuesta de valor es la eliminación total del "chatter": el primer token generado es siempre `{` o `[`, no emite bloques de código Markdown y respeta los tipos de datos nativos (números, cadenas, booleanos) en lugar de entrecomillar todo. Esto lo hace adecuado para pipelines de datos donde el post-procesado de la salida del LLM es un cuello de botella. La ventana de contexto es reducida (1.024-2.048 tokens), lo que limita su uso a entradas cortas.

El modelo se distribuye con licencia Apache 2.0, en formatos safetensors y GGUF (compatible con llama.cpp), con un peso cuantizado Q4_K_M de aproximadamente 980 MB. Es relevante ahora por la creciente demanda de modelos pequeños, especializados y desplegables en CPU para tareas de extracción estructurada en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 - 2.048 tokens |
| Tipos de cuantizacion | GGUF (Q4_K_M documentado, ~980 MB); safetensors en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B, con atención causal estándar. El ajuste se realizó mediante SFT completo en BF16 sobre 15.000 pares de esquema a JSON verificados con AST (árbol de sintaxis abstracta), lo que garantiza que las salidas de entrenamiento eran JSON sintácticamente válidos. Se aplicó un enmascaramiento agresivo de entropía cruzada con valor `-100` sobre todas las etiquetas conversacionales (tokens de ChatML como `<|im_start|>`, `<|im_end|>` y texto de cortesía), de modo que el modelo no aprende a generar diálogo sino únicamente la serialización JSON.

No se documenta el uso de RLHF, DPO ni decodificación especulativa. La innovación principal es el enmascaramiento de prompt y la verificación AST del corpus de entrenamiento, orientados a forzar la estructura de salida. El modelo usa el formato de prompt ChatML, con un mensaje de sistema que instruye al modelo a responder solo con JSON válido.

## Capacidades

- Generación de JSON válido y conforme a RFC a partir de entradas no estructuradas (CSV, volcados de texto, notas).
- Garantía de primer token `{` o `[`, sin prefijos conversacionales ni bloques Markdown.
- Respeto de tipos de datos nativos: distingue número (`42`), cadena (`"42"`) y booleano (`true`).
- Serialización guiada por esquema: el usuario indica las claves objetivo en el prompt.
- Generación de texto condicionada por prompt ChatML con mensaje de sistema estricto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción estructurada de CSV: el modelo recibe una cabecera y una fila de CSV desordenada y devuelve un objeto JSON con las claves y tipos correctos, eliminando el parseo manual en pipelines ETL.
- Normalización de volcados de errores: a partir de un log de caída de servidor en texto libre, genera un JSON con campos como código de error, timestamp y mensaje, listo para ingesta en sistemas de observabilidad.
- Generación de payloads para APIs: dado un esquema de claves, produce el cuerpo JSON de una petición HTTP sin texto adicional, integrándose directamente en clientes automatizados.
- Conversión de notas libres a registros: transforma notas de texto libre (por ejemplo, partes meteorológicos) en registros JSON con tipos numéricos correctos, útil para bases de datos ligeras.
- Preprocesado en pipelines de datos: al no emitir Markdown ni cortesía, la salida puede insertarse directamente en un parser JSON sin pasos de limpieza (`strip()`), reduciendo la latencia y los errores en producción.
- Despliegue en entornos con recursos limitados: con ~980 MB en Q4_K_M y velocidades de 14-55 tok/s en CPU, puede ejecutarse en servidores sin GPU para tareas de serialización de alto volumen.
- Validación de formularios y pruebas de API: genera datos mock estructurados a partir de esquemas para testing automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en BF16 (1,54B parámetros × 2 bytes) más overhead; ~1 GB en Q4_K_M GGUF.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en GTX 1650 4 GB o superiores; también en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF documentado), Ollama, vLLM y TGI para safetensors; endpoints compatibles según los tags del repo.
- Latencia y throughput estimados: ~14-55 tok/s en CPU; 120+ tok/s en hardware moderno (según la model card).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unpaid JSON Generator | ~1,54B | 1.024-2.048 | JSON estricto | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B (base) | ~1,54B | 32.768 (según modelo base) | Código general | Apache 2.0 | Hugging Face |
| Modelos JSON genéricos de terceros | no disponible | no disponible | JSON | no disponible | no disponible |

La comparación con alternativas específicas de generación JSON no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la eliminación del texto conversacional y la reducción drástica de la ventana de contexto.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (1.024-2.048 tokens): no apta para entradas largas ni conversaciones multi-turno.
- Solo soporta inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación en la estructura: si el esquema de entrada es ambiguo, puede inventar claves o tipos.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- El modelo está "lobotomizado" deliberadamente: no responde a preguntas conversacionales y puede devolver errores JSON ante entradas no estructuradas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni evidencia de robustez en producción.
- El repositorio ocupa 8,8 GB, lo que incluye pesos en BF16 y GGUF; verificar el espacio antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/rishabh-rishuu/Unpaid-JSON-Generator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Herramienta JSON genérica (referencia de búsqueda): https://musely.ai/tools/json-generator
- Herramienta JSON genérica (referencia de búsqueda): https://rynaai.com/en/ai/json-generator
