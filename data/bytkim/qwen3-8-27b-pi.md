# bytkim/Qwen3.8-27B-pi

## Resumen

Qwen3.8-27B-pi es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B, publicado por el usuario bytkim bajo licencia Apache 2.0. Está especializado en tareas de programación dentro del arnés de agentes Pi, un entorno que reproduce el bucle real de trabajo de un desarrollador: leer un repositorio, editar ficheros, ejecutar herramientas e incorporar la realimentación de esas herramientas en el siguiente paso. El modelo conserva la interfaz del modelo base, por lo que puede sustituirlo directamente en despliegues existentes.

El modelo tiene 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) en precisión BF16, con un repositorio de 59,4 GB. Soporta una longitud de contexto de 262.144 tokens según la configuración de ejemplo para vLLM, y mantiene capacidades multimodales de entrada imagen-texto heredadas del modelo base, además de un modo de razonamiento (thinking mode) con niveles de esfuerzo ajustables (low, medium, xhigh).

Su relevancia actual radica en que no se limita a generar fragmentos de código aislados: ha sido entrenado sobre sesiones completas y filtradas del arnés Pi, con una etapa de aprendizaje por refuerzo (GRPO) que incorpora una recompensa personalizada de eficiencia de razonamiento. El resultado declarado es un modelo que completa más tareas con menos tokens de salida que el base en cada nivel de esfuerzo equivalente, lo que reduce coste de inferencia y latencia en pipelines agénticos de programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), con soporte de multi-token prediction (MTP) para decodificación especulativa; familia qwen3_5 |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (según configuración de ejemplo en vLLM) |
| Tipos de cuantizacion | BF16 (repo principal), FP8 (repo separado), GGUF (repo separado, calibrado con sesiones Pi completas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), FP8 y GGUF en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal de aproximadamente 27,8 mil millones de parámetros que procesa entradas de imagen y texto. Incorpora multi-token prediction (MTP), una técnica de decodificación especulativa que predice varios tokens por paso y acelera la generación; la configuración de vLLM del autor la activa con `num_speculative_tokens: 3`. También expone un modo de razonamiento con niveles de esfuerzo configurables y soporte nativo de tool calling mediante los parsers `qwen3` y `qwen3_xml`.

El entrenamiento se desarrolló en dos etapas. La primera consistió en un ajuste fino supervisado (SFT) sobre sesiones Pi filtradas y exitosas, es decir, trayectorias completas de lectura de repositorio, edición y verificación de resultados, en lugar de pares aislados de pregunta-respuesta. La segunda etapa aplicó aprendizaje por refuerzo con GRPO, combinando resultados de tarea verificados con una recompensa personalizada de eficiencia de razonamiento: se premia que las soluciones correctas de esfuerzo bajo y medio razonen de forma más económica, mientras que el nivel xhigh se orienta a maximizar la corrección. La evaluación de checkpoints se hizo con resultados reales de agente (éxito de tarea, tokens generados, llamadas a herramientas y tiempo de finalización), no solo con pérdida de entrenamiento.

## Capacidades

- Generación de código en flujos de trabajo completos: leer repositorios, localizar ficheros, aplicar ediciones y comprobar el resultado contra los requisitos de la tarea.
- Razonamiento ajustable en tres niveles (low, medium, xhigh), con muestreo por defecto en modo thinking de `temperature=1.0`, `top_p=0.95` y `top_k=20`.
- Tool calling y function calling nativos, con soporte de elección automática de herramienta en vLLM (`--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml`).
- Operación como agente multi-paso: interpreta la realimentación de las herramientas y encadena acciones hasta completar la tarea.
- Entrada multimodal imagen-texto heredada del modelo base, útil para interpretar capturas, diagramas o interfaces durante una tarea de desarrollo.
- Decodificación especulativa mediante MTP, que reduce la latencia por token generado.
- Conversación multi-turno con ventana de contexto de 262.144 tokens.

## Casos de uso

- Agente de programación autónomo en CI/CD: el modelo puede recibir un fallo de build o de tests, inspeccionar el repositorio, aplicar un parche y volver a ejecutar la verificación, usando tool calling para invocar el compilador y los tests dentro del pipeline.
- Refactorización guiada por repositorio: con 262.144 tokens de contexto puede cargar módulos completos y sus dependencias, renombrar APIs o migrar patrones de forma coherente en varios ficheros en una sola sesión.
- Asistente de depuración iterativa: el bucle entrenado (cambio, ejecución, lectura de la realimentación) encaja con la depuración de errores intermitentes donde el modelo debe formular hipótesis, instrumentar el código y validar con logs.
- Generación y reparación de tests: el modelo puede escribir pruebas, ejecutarlas, interpretar los fallos y corregir tanto el test como el código bajo prueba, con el nivel de esfuerzo xhigh para maximizar corrección.
- Automatización de tareas de mantenimiento en terminal: la evaluación en Terminal-Bench 2.1 indica que está orientado a operaciones de línea de comandos, por lo que sirve para scripts de migración, limpieza de repositorios o actualización de dependencias con verificación posterior.
- Integración en un IDE o arnés de agentes propio: al conservar la interfaz del modelo base y estar disponible en BF16, FP8 y GGUF, puede desplegarse con vLLM para uso servidor o con llama.cpp/Ollama en estaciones de trabajo, manteniendo los parsers de razonamiento y herramientas de Qwen.
- Análisis de documentación técnica con imágenes: gracias a la entrada multimodal puede interpretar diagramas de arquitectura o capturas de errores junto al código para localizar la causa de un fallo.

## Benchmarks y rendimiento

Los datos publicados en la model card son gráficos comparativos entre Pi y el modelo base en tres evaluaciones. Los valores numéricos exactos no se recogen como tablas en la información disponible; se resumen a continuación los resultados declarados de forma cualitativa y las cifras explícitas mencionadas.

| Benchmark | Resultado declarado |
|---|---|
| Terminal-Bench 2.1 | Pi muestra una subida más constante del éxito de low a xhigh que el base y menos tokens de salida en cada nivel de esfuerzo equivalente; en modo medium iguala la tasa de éxito de xhigh del base con aproximadamente un 41 % menos de tokens de salida |
| GPQA Diamond (tasa de aprobación por intento) | Pi alcanza la puntuación más alta en xhigh; el base conserva ventaja en esfuerzo medium |
| SciCode (subproblemas superados de 337) | Pi resuelve más subproblemas en todos los niveles; en xhigh obtiene mayor puntuación con aproximadamente un 23 % menos de tokens de salida, mientras que en medium su mayor puntuación requiere más tokens |

No se han publicado en la información disponible valores absolutos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM para BF16: los 27,8 B parámetros en BF16 ocupan aproximadamente 55,6 GB solo en pesos, por lo que se necesitan del orden de 60-70 GB de VRAM contando caché KV y overhead; encaja en una A100 80 GB o H100 80 GB, y requiere varias GPU consumer en paralelo.
- VRAM para FP8: alrededor de 28 GB en pesos, lo que permite ejecución en una sola GPU de 40-48 GB (A100 40 GB, L40S) y, con contexto reducido, en una RTX 4090 de 24 GB solo si se aplica cuantización adicional.
- GGUF: las cuantizaciones GGUF del repositorio derivado permiten ejecución en GPU consumer de 24 GB (RTX 3090, RTX 4090) con cuantizaciones de 4-5 bits y contexto recortado; el contexto completo de 262.144 tokens exige mucha más memoria de caché KV.
- Despliegue recomendado: vLLM con `--max-model-len 262144`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`, tal como indica el autor.
- Alternativas de despliegue: llama.cpp u Ollama con los GGUF publicados; TGI aparece en los tags del modelo.
- Latencia y throughput: no disponibles como cifras absolutas; la decodificación especulativa MTP y la reducción de tokens de salida declarada (hasta un 41 % menos en medium frente a xhigh del base) apuntan a una mejora directa del coste por tarea completada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi | ≈27,8 B | 262.144 tokens | Apache 2.0 | Finetune para agente de código Pi, con RL de eficiencia | BF16, FP8, GGUF en Hugging Face |
| Qwen3.8-27B (base) | ≈27,8 B | 262.144 tokens (según configuración del autor) | Apache 2.0 | Modelo generalista multimodal con thinking mode | Hugging Face |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de otros modelos de la misma categoría, por lo que la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- El ajuste está orientado al arnés Pi y a tareas de programación; fuera de ese dominio puede degradarse respecto al modelo base, especialmente en conversación general o tareas no técnicas.
- Los benchmarks publicados son gráficos comparativos del propio autor y no tablas con cifras absolutas verificables de forma independiente; conviene tratarlos con cautela.
- No se especifican los idiomas soportados; el entrenamiento se describe en inglés y no hay garantía de calidad equivalente en castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en tareas de código cuando el modelo afirma haber verificado un resultado sin haber ejecutado realmente la herramienta.
- El contexto de 262.144 tokens exige una gestión cuidadosa de la memoria KV; en configuraciones consumer con GGUF habrá que recortar la ventana de forma significativa.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo y la responsabilidad del despliegue recae en el integrador.
- El repositorio principal en BF16 ocupa 59,4 GB, lo que complica su distribución y almacenamiento en entornos con límites de tamaño.
- No se documentan sesgos concretos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Versión FP8: https://huggingface.co/bytkim/Qwen3.8-27B-pi-FP8
- Versión GGUF: https://huggingface.co/bytkim/Qwen3.8-27B-pi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
