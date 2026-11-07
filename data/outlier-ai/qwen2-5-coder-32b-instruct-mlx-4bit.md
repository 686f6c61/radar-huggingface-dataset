# Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit

## Resumen

Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit es una conversión a formato MLX de 4 bits del modelo Qwen2.5-Coder-32B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo publica Outlier-Ai, un tercero que se limita a cambiar el formato en disco de los pesos (safetensors MLX 4-bit, group size 64, cuantización simétrica) para que el modelo se ejecute de forma nativa en Apple Silicon mediante la librería `mlx-lm`. No hay fine-tuning ni mezcla de pesos: la capacidad del modelo es íntegramente atribuible al modelo base original.

El modelo base es un transformer decoder-only de 32.763.876.352 parámetros (32B densos, no MoE) especializado en generación y comprensión de código, con soporte para instrucciones, tool calling y conversaciones multi-turno. La conversión ocupa 18,4 GB en el repositorio, lo que la hace viable en Macs con memoria unificada de 24 GB o superior, algo imposible con los pesos originales en bf16 (unos 65 GB). Es relevante ahora porque permite ejecutar un modelo de código de gama alta de forma completamente local y offline en hardware de consumo Apple, sin depender de APIs en la nube.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial. El modelo soporta 15 idiomas declarados, incluido el castellano, y está pensado para tareas de código, razonamiento y uso como agente con herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parámetros totales | 32.763.876.352 (32B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-32B-Instruct declara 131.072 tokens; la conversión no lo modifica, pero no se confirma en la model card) |
| Tipos de cuantización | MLX 4-bit, group size 64, simétrica |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit), con config.json, tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

La conversión no introduce cambios arquitectónicos: es un transformer decoder-only denso de la familia Qwen2, con 32B parámetros, del que no se detallan en la información disponible el número de capas, dimensiones ocultas, cabezas de atención ni el mecanismo exacto de atención. El modelo base Qwen2.5-Coder-32B-Instruct fue entrenado por el equipo Qwen de Alibaba; la model card de esta conversión no aporta datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card sí indica que se trata de una conversión de formato fiel ("faithful port of the upstream weights — no fine-tuning, no merge").

La innovación técnica de este repositorio es exclusivamente de empaquetado: cuantización de 4 bits con group size 64 y simetría, compatible con `mlx-lm` 0.31.x, que aprovecha Metal en chips M1, M2, M3 y M4. El objetivo es reducir el peso en disco y en memoria de unos 65 GB (bf16) a 18,4 GB, manteniendo un comportamiento cercano al original. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido en esta conversión.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con ejemplos en la model card para Python y SQL.
- Completado de código y generación de código a partir de instrucciones en lenguaje natural.
- Conversación multi-turno con plantilla de chat (`chat_template.jinja`).
- Soporte de tool calling y function calling (etiquetas `function-calling` y `tool-use`).
- Uso como agente con razonamiento multi-paso, orientado a tareas de código.
- Capacidades multilingües en 15 idiomas, incluidos castellano, inglés, chino, francés, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local y offline en Apple Silicon, sin envío de datos a la nube.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistente de código en local para desarrolladores en Mac: cargar el modelo con `mlx-lm` y usarlo como chat de programación sin conexión, aprovechando los 18,4 GB de pesos 4-bit para que quepa en Macs con 24 GB o más de memoria unificada.
- Autocompletado y generación de funciones en el editor: el modelo puede generar funciones completas con docstring y casos de prueba, como muestra el ejemplo de la model card para comprobar números primos en Python.
- Generación de consultas SQL: traducir preguntas de negocio a SQL, por ejemplo para obtener los 10 usuarios con mayor valor de compra en los últimos 90 días, tal como aparece en los ejemplos del widget.
- Refactorización y depuración de código: pedir al modelo que reescriba un fragmento para mejorar la legibilidad y señale un bug, un flujo admitido explícitamente en los ejemplos de la model card.
- Agente de desarrollo con herramientas: integrar el modelo en un bucle de agente que llame a funciones (ejecutar tests, consultar documentación, leer ficheros) gracias a su soporte de tool calling.
- Asistencia técnica y explicación de código en castellano: usar el modelo para explicar fragmentos de código o responder dudas técnicas en español, uno de los 15 idiomas soportados, en un entorno privado sin enviar código propietario a terceros.
- Prototipado de pipelines de CI/CD asistidos por IA: ejecutar el modelo en un Mac mini o Mac Studio como parte de un runner local para revisar diffs o generar tests, manteniendo el código dentro de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tokens por segundo en Macs de la serie M, pero no se incluyen los valores en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 18,4 GB en 4-bit; se recomienda un Mac con al menos 24 GB de memoria unificada para dejar margen al contexto y a la caché KV. Con 16 GB no es viable de forma fiable.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio), según los tags del repositorio. No está pensado para GPU NVIDIA ni AMD.
- Cabe en GPU de consumo Apple: sí, en configuraciones de 24 GB o más de memoria unificada; en modelos de 16 GB no se recomienda.
- Opciones de despliegue: `mlx-lm` 0.31.x o superior (CLI `mlx_lm.generate` y API Python `load`/`generate`), o la aplicación Outlier para macOS arm64, que carga modelos MLX locales. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no ejecutan pesos MLX.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la página de benchmarks de Outlier para cifras de tok/s en Macs de la serie M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit | 32B densos | no disponible en la información (el base declara 131.072) | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 134 descargas |
| Qwen/Qwen2.5-Coder-32B-Instruct (base) | 32B densos | 131.072 tokens según el modelo base | safetensors bf16 | Apache 2.0 | Hugging Face |
| Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit | 14B densos | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 816 descargas |
| Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit | 7B densos | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 1.450 descargas |

La comparación relevante es con el modelo base (misma capacidad, pero requiere unos 65 GB en bf16 y no cabe en Macs de consumo) y con las conversiones MLX de menor tamaño de la misma familia, que sacrifican capacidad a cambio de requisitos de memoria mucho menores.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo afinado: hereda todos los sesgos y limitaciones del modelo base Qwen2.5-Coder-32B-Instruct.
- La cuantización a 4 bits puede degradar ligeramente la calidad respecto al modelo original en bf16, especialmente en tareas de razonamiento complejo o código muy especializado; no se aportan métricas de esa degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar APIs, funciones o sintaxis inexistentes; conviene validar el código generado con tests.
- Solo funciona en Apple Silicon con `mlx-lm` o la app Outlier; no es portable a CUDA, ROCm ni CPU x86 sin reconvertir los pesos.
- El contexto máximo efectivo no se confirma en la model card de esta conversión; debe verificarse contra el modelo base antes de usarlo en producción con ventanas largas.
- El rendimiento multilingüe puede ser desigual; los 15 idiomas declarados no implican la misma calidad en todos ellos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base para textos canónicos y restricciones adicionales.
- El repositorio tiene muy poca tracción (134 descargas, 1 like) y está mantenido por un tercero; para producción conviene evaluar también la conversión oficial de `mlx-community` si existe.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Benchmarks de Outlier: https://outlier.host/benchmarks
- Aplicación Outlier: https://outlier.host/
- Conversión MLX 4-bit del 14B: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit
- Conversión MLX 4-bit del 7B: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
- Conversión alternativa de Outlier: https://huggingface.co/Outlier-Ai/Outlier-Coder-Qwen25-32B-MLX-4bit
