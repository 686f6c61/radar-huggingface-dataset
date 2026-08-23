# barbarabhb/nl2sh-qwen3.5-2b-GGUF

## Resumen

El modelo `nl2sh-qwen3.5-2b-GGUF` es un generador de comandos shell a partir de lenguaje natural, desarrollado por el usuario barbarabhb como alternativa directa al modelo `whatisit-nl2sh` (basado en Qwen2.5-Coder-1.5B). Está construido sobre la base Qwen3.5-2B, un modelo de texto híbrido con atención lineal (Gated Delta Networks) al que se le ha eliminado la torre de visión y el módulo de predicción multitoken para su exportación. El modelo ha sido afinado con un adaptador LoRA sobre el conjunto de datos NL2SH-ALFA, compuesto por 40.639 pares de instrucciones en lenguaje natural y comandos bash.

El objetivo es convertir una pregunta en inglés en un comando de terminal único, con salida limitada a unos 64 tokens y decodificación greedy. Se distribuye en varias cuantizaciones GGUF, lo que permite ejecutarlo en hardware modesto, desde 1.2 GB en Q4_K_M hasta 3.6 GB en BF16. Está pensado como una alternativa ligera y autónoma a los modelos propietarios para tareas específicas de administración de sistemas y automatización de terminal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con atención lineal (Gated Delta Networks) sobre Qwen3.5-2B, sin torre de visión, con adaptador LoRA |
| Parametros totales | 1.881.825.088 (safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, BF16, Q4_K_M con imatrix |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-2B, un modelo de lenguaje de la familia Qwen3.5 que emplea una arquitectura híbrida con capas de atención lineal (Gated Delta Networks, GDN) combinadas con mecanismos de atención estándar. Para este proyecto, se eliminó la torre de visión y el módulo de predicción multi-token (MTP) durante la exportación, dejando únicamente el backbone de texto. Sobre este backbone se entrenó un adaptador LoRA de rango 32, alpha 64 y dropout 0.05, aplicado a todas las capas lineales, incluyendo las proyecciones de atención lineal.

El entrenamiento se realizó sobre el split de entrenamiento del dataset NL2SH-ALFA, que contiene 40.639 pares de instrucciones en lenguaje natural y comandos bash en formato chat. Se usaron 2 épocas, una secuencia máxima de 512 tokens, batch efectivo de 32 (16 x 2 con acumulación de gradientes), tasa de aprendizaje 2e-4 con coseno y calentamiento del 3%, y pérdida restringida a la parte de respuesta. El entrenamiento se ejecutó en una GPU AMD RX 9070 XT (gfx1201) con precisión bf16 y semilla 42, tardando aproximadamente 1 hora y 14 minutos. La evaluación final mostró una pérdida de 0.4257 y una precisión de tokens del 87.6%.

## Capacidades

- Generación de comandos shell en bash a partir de preguntas en inglés, con salida de un único comando (no scripts).
- Soporte de decodificación greedy (temperatura 0) para obtener respuestas deterministas.
- Conversación de un solo turno, sin estado de sesión ni memoria previa.
- Funciona exclusivamente en inglés; no soporta otros idiomas.
- No incluye soporte para tool calling, function calling ni razonamiento multi-paso.
- No incluye capacidades de visión ni audio; la torre de visión fue eliminada.
- El modelo base Qwen3.5-2B es multimodal en su origen, pero esta versión es solo texto.

## Casos de uso

- Asistente de terminal para desarrolladores: permite consultar en inglés cómo listar procesos, buscar archivos o ejecutar operaciones de red. Adecuado por su bajo consumo de VRAM y su salida determinista.
- Automatización de tareas de administración de sistemas: generar comandos para gestionar contenedores Docker, monitorear recursos o manipular archivos, reduciendo el tiempo de búsqueda en documentación.
- Integración en IDEs y editores de código: como complemento de autocompletado de comandos, ofreciendo sugerencias contextuales basadas en la descripción del usuario.
- Educación en línea de comandos: para usuarios que están aprendiendo bash, el modelo puede traducir intenciones en comandos correctos, sirviendo como herramienta de aprendizaje interactiva.
- Generación de comandos en pipelines de CI/CD: aunque el modelo genera un solo comando, puede integrarse en flujos que necesiten transformar descripciones en pasos de ejecución concretos.
- Accesibilidad para no expertos: permite a personas sin experiencia en terminal ejecutar tareas básicas describiéndolas en inglés, reduciendo la barrera de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible. El autor menciona que los resultados de InterCode-ALFA (300 tareas, temperatura 0, máximo 64 tokens) están pendientes. Sin embargo, se proporcionan datos de perplexity sobre un conjunto de validación de NL2SH-ALFA y pruebas de decodificación greedy:

| Variante | PPL | Δ vs f16 |
|---|---|---|
| f16 | 4.8921 | — |
| bf16 | 4.8919 | −0.00% |
| Q8_0 | 4.8957 | +0.07% |
| Q6_K | 4.9007 | +0.18% |
| Q4_K_M + imatrix | 5.0082 | +2.37% |
| Q4_K_M | 5.0765 | +3.77% |

Además, en pruebas de decodificación greedy con 16 prompts fijos, la variante Q8_0 coincidió con f16 en 13 de 16 casos, Q6_K en 12 de 16 y Q4_K_M en 9 de 16. La mayoría de las diferencias fueron comandos equivalentes, no errores.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M: ~1.2 GB (mínimo recomendado)
  - Q6_K: ~1.5 GB
  - Q8_0: ~1.9 GB
  - BF16: ~3.6 GB
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M o Q6_K. Tarjetas como GTX 1650, RTX 2060, RTX 3060, o incluso iGPU con suficiente memoria compartida son suficientes. Para BF16 se recomienda una GPU con 4 GB o más.
- Compatible con CPU: sí, mediante llama.cpp y llama-server, aunque la inferencia será más lenta.
- Opciones de despliegue: llama.cpp (llama-server), llama-cli, integración con whatisit (herramienta de la misma familia), y cualquier framework compatible con GGUF (por ejemplo, Ollama, aunque no está documentado).
- Latencia y throughput: no disponibles. El tamaño reducido sugiere latencias de milisegundos en GPU y de segundos en CPU.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | InterCode-ALFA (pass rate) |
|---|---|---|---|---|---|
| **nl2sh-qwen3.5-2b** (este) | Qwen3.5-2B | 1.88B | no disponible | Apache-2.0 | pendiente |
| nl2sh-1.5b (upstream) | Qwen2.5-Coder-1.5B | 1.5B | no disponible | no indicado | 0.620 |
| nl2sh-3b (upstream) | Qwen2.5-Coder-3B | 3B | no disponible | no indicado | 0.657 |
| GPT-4o (publicado) | — | — | — | propietario | 0.73 |

Los datos de InterCode-ALFA para los modelos upstream provienen de la model card del autor. No se dispone de más detalles sobre los modelos nl2sh-1.5b y nl2sh-3b.

## Limitaciones y advertencias

- El modelo genera únicamente un comando por consulta, no scripts completos, lo que limita su uso en tareas complejas que requieran secuencias de comandos.
- Solo funciona en inglés; no hay soporte multilingüe.
- Entrenado exclusivamente con el split ALFA de 40.639 pares, frente a los 125k de la mezcla multi-fuente del modelo upstream, lo que puede reducir la cobertura de herramientas poco comunes.
- No tiene estado de shell ni memoria de conversación; cada petición se procesa de forma independiente.
- Riesgo de alucinación: puede generar comandos incorrectos o no seguros si la descripción es ambigua o se refiere a herramientas fuera del dominio de entrenamiento.
- Se recomienda validar los comandos generados antes de ejecutarlos en producción, especialmente en entornos críticos.
- La licencia Apache-2.0 permite uso comercial y modificación, pero el autor no garantiza la seguridad de los comandos generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barbarabhb/nl2sh-qwen3.5-2b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/westenfelder/NL2SH-ALFA
- Repositorio de referencia whatisit-nl2sh: https://github.com/ThorOdinson246/whatisit-nl2sh
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
