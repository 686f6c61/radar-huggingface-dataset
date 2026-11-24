# LukeFrazier23/qwen2.5-0.5b-instruct-abliterated-GGUF

## Resumen

`LukeFrazier23/qwen2.5-0.5b-instruct-abliterated-GGUF` es una exportación en formato GGUF de una modificación "abliterated" del modelo Qwen2.5-0.5B-Instruct de Alibaba Qwen. El autor, LukeFrazier23, aplica una técnica de ortogonalización direccional de pesos (denominada Abliterator) sobre las proyecciones de salida del flujo residual (`o_proj` y `down_proj`) del modelo base y convierte el resultado a GGUF mediante `llama.cpp`. El objetivo es eliminar direcciones de activación asociadas a rechazos, sin recurrir a fine-tuning por gradientes ni a RLHF.

El modelo base Qwen2.5-0.5B-Instruct es un transformer decoder-only de 494.032.768 parámetros (aproximadamente 0,49B), con licencia Apache-2.0 y entrenado principalmente para inglés. Esta versión hereda esa arquitectura y ese tamaño, por lo que su utilidad práctica está limitada a tareas muy acotadas, prototipado rápido y despliegue en entornos con recursos mínimos.

La relevancia de esta ficha radica en que documenta una modificación experimental sobre un modelo pequeño: el autor advierte explícitamente de que el razonamiento general, el recuerdo factual y la consistencia de estilo pueden degradarse respecto al modelo base. Se trata, por tanto, de un artefacto para experimentación, no de un modelo recomendado para producción sin una evaluación previa contra el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), modificado con ortogonalización direccional sobre `o_proj` y `down_proj` |
| Parametros totales | 494.032.768 (aproximadamente 0,49B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero la model card no lo confirma para esta exportacion) |
| Tipos de cuantizacion | GGUF en F16 (unico archivo mencionado: `qwen2.5-0.5b-instruct-abliterated.gguf`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (F16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only con 23 capas (la model card menciona "layer 14 / 23" para el cálculo de la dirección de ablación), atención con query/key/value projections y proyecciones de salida de atención (`o_proj`) y de la MLP (`down_proj`). No se trata de un modelo MoE ni híbrido; es un transformer denso convencional.

El proceso de modificación no implica entrenamiento supervisado ni RLHF. El autor calcula un vector de diferencia de activaciones normalizado a partir de conjuntos de prompts contrastivos en profundidad media (capa 14 de 23) y proyecta esa dirección fuera de los pesos de `o_proj` y `down_proj`. Posteriormente convierte el checkpoint resultante a GGUF con `llama.cpp`. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni detalles sobre el proceso de alineación original de Qwen2.5-0.5B-Instruct.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Instrucciones de formato y respuesta a prompts de sistema, con la salvedad de que la ablación puede alterar el comportamiento ante peticiones que el modelo base rechazaría.
- Razonamiento básico y respuesta a preguntas simples, limitado por el tamaño de 0,49B parámetros.
- Generación de código y matemáticas elementales, aunque sin garantías de calidad comparable a modelos mayores.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado; el modelo base Qwen2.5 soporta más idiomas, pero esta exportación no lo declara.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Experimentación con técnicas de ablación: el modelo sirve para comparar cualitativamente el comportamiento del modelo base frente a la versión modificada en tareas de rechazo y estilo, usando el mismo prompt en ambos.
- Prototipado rápido en local: al ser un GGUF F16 de aproximadamente 1 GB, se puede cargar en LM Studio o `llama.cpp` en un portátil sin GPU dedicada para probar flujos conversacionales básicos.
- Pruebas de integración de pipelines GGUF: útil para validar el soporte de `llama.cpp`, LM Studio u otros runners compatibles con GGUF antes de desplegar modelos mayores.
- Generación de texto de bajo coste en entornos embebidos o de recursos limitados, donde un modelo de 0,49B es suficiente para tareas de clasificación, resumen corto o reescritura simple.
- Investigación sobre alineación y seguridad: permite estudiar cómo una proyección direccional afecta a las respuestas del modelo en dominios sensibles, siempre en un entorno controlado y con revisión humana.
- Docencia y demostraciones: adecuado para explicar en clase cómo funciona la conversión a GGUF y la modificación de pesos sin necesidad de infraestructura de GPU.
- Evaluación comparativa de calidad: sirve como línea base pequeña para contrastar con modelos abliterated de mayor tamaño y comprobar si las diferencias de comportamiento se mantienen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes), más overhead de contexto y KV cache; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y runner.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `llama.cpp`, LM Studio (flujo documentado por el autor), Ollama (previa importación del GGUF), y runners compatibles con GGUF. No se documenta soporte nativo en vLLM o TGI para este artefacto concreto.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera muy baja latencia en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LukeFrazier23/qwen2.5-0.5b-instruct-abliterated-GGUF | 0,49B | no disponible | Apache-2.0 | GGUF F16 | Modificación por ablación, solo inglés, experimental |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (según documentación del modelo base) | Apache-2.0 | safetensors, GGUF | Modelo original sin modificar; referencia para comparar |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (según documentación del modelo base) | Apache-2.0 | safetensors, GGUF | Mayor capacidad a costa de más VRAM |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con licencia más restrictiva |

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte de que el razonamiento general, el recuerdo factual y la consistencia de persona pueden variar y diferir notablemente del modelo base.
- Riesgo de alucinación elevado por el tamaño reducido (0,49B) y por la modificación de pesos, que puede degradar la coherencia.
- La ablación elimina direcciones de rechazo sin un proceso de alineación posterior; esto puede producir respuestas inapropiadas o inseguras. No debe desplegarse en producción orientada a usuarios finales sin filtros adicionales.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: la model card no confirma la longitud de contexto efectiva de esta exportación GGUF; conviene validarla empíricamente.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y recomienda evaluar contra el modelo base antes de cualquier uso real.
- Solo se distribuye en F16; no hay cuantizaciones Q4, Q5 o Q8 publicadas en la información disponible, lo que limita el ahorro de memoria en entornos muy restringidos.
- El repositorio tiene muy poca tracción (1 like, 2.189 descargas), por lo que no hay una comunidad amplia que haya validado su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LukeFrazier23/qwen2.5-0.5b-instruct-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de `llama.cpp`: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
