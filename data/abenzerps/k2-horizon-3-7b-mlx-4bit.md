# abenzerps/K2-Horizon-3.7B-MLX-4bit

## Resumen

K2-Horizon-3.7B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo IFM/K2-Horizon-3.7B, un decoder-only denso de 3.700 millones de parámetros desarrollado por IFM. Esta versión, publicada por el usuario abenzerps, está pensada para ejecutarse en hardware Apple Silicon mediante la librería MLX-LM, y destaca por soportar una ventana de contexto nativa de 524.288 tokens (512K), lo que la hace adecuada para tareas de razonamiento, generación de código, trabajo con documentos extensos y uso de herramientas.

La cuantización affine con grupo de tamaño 64 reduce el peso del modelo a 2,87 GB, permitiendo su ejecución en equipos con memoria unificada moderada. El modelo es de solo texto, no incluye proyector de visión ni módulos MTP, y requiere el uso de un adaptador personalizado (`k2_horizon_mlx.py`) que preserva la normalización RMS agrupada del modelo original. Se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y modificación.

La relevancia de esta conversión radica en que acerca un modelo de contexto ultralargo a entornos de desarrollo locales, sin necesidad de infraestructura de servidores dedicados. Aunque el modelo base no es de acceso público en su versión completa, esta cuantización MLX ofrece una vía práctica para experimentar con sus capacidades en equipos Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only denso (Transformer) |
| Parametros totales | 3.7B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | Affine 4-bit, group size 64 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

Nota: el archivo safetensors contiene 5.058.255.360 parametros, pero el modelo se anuncia como 3.7B; la diferencia puede deberse a la representacion interna de los tensores cuantizados.

## Arquitectura y entrenamiento

El modelo base IFM/K2-Horizon-3.7B es un transformer decoder-only denso, sin mezcla de expertos (MoE). La conversion MLX aplica cuantizacion affine de 4 bits con grupo de tamaño 64, lo que reduce el tamaño del modelo de aproximadamente 7 GB (en precision completa) a 2,87 GB. El adaptador `k2_horizon_mlx.py` incluido en el repositorio preserva la normalizacion RMS agrupada (grouped RMSNorm) caracteristica del modelo original, y debe cargarse con `--trust-remote-code` en MLX-LM.

No se dispone de informacion detallada sobre el entrenamiento del modelo base: no se especifican el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La model card del autor solo indica que el modelo esta orientado a razonamiento, codificacion, contexto largo y uso de herramientas, sin aportar mas detalles.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento logico y matematico basico (segun la descripcion del modelo base).
- Generacion y comprension de codigo en multiples lenguajes.
- Soporte de tool calling / function calling (mencionado como "tool use" en la descripcion).
- Manejo de contexto ultralargo de hasta 512K tokens, util para analisis de documentos extensos o historiales de conversacion prolongados.
- Capacidad multilingue limitada: el modelo esta entrenado principalmente en ingles, aunque puede generar texto en otros idiomas con menor calidad.
- No incluye capacidades de vision ni audio; es exclusivamente de texto.

## Casos de uso

- Analisis de documentos legales o academicos extensos: gracias a su contexto de 512K tokens, el modelo puede procesar contratos, tesis o informes completos sin necesidad de dividirlos en fragmentos, manteniendo la coherencia global.
- Generacion de codigo en entornos de desarrollo integrado: puede autocompletar funciones, generar tests o refactorizar modulos, integrandose con herramientas como Copilot o asistentes de terminal.
- Agentes conversacionales para atencion al cliente: su capacidad de mantener conversaciones largas con memoria completa permite gestionar interacciones complejas sin perder el hilo.
- Resumen y extraccion de informacion de bases de conocimiento: el contexto amplio permite alimentar el modelo con grandes volumenes de texto y obtener resumenes o respuestas basadas en el contenido completo.
- Asistente de programacion para depuracion: puede analizar trazas de error largas y sugerir correcciones, aprovechando su ventana de contexto para incluir todo el log.
- Generacion de documentacion tecnica: a partir de un repositorio de codigo completo, el modelo puede redactar guias o comentarios explicativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen con graficas de rendimiento del modelo base, pero no se proporcionan valores numericos en texto. Por tanto, no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 4 bits ocupa 2,87 GB en disco; en memoria unificada de Apple Silicon se recomienda al menos 8 GB para inferencia con contexto moderado, y 16 GB o mas para aprovechar la ventana completa de 512K tokens.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada. No requiere GPU NVIDIA.
- Compatibilidad con consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para hardware Apple.
- Opciones de despliegue: MLX-LM (libreria oficial), compatible con scripts de generacion y servidores locales. No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no se dispone de datos medidos. En un MacBook Pro M2 con 16 GB, se estima una generacion de 20-40 tokens por segundo para contexto corto, pero estos valores son orientativos y no han sido verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| K2-Horizon-3.7B-MLX-4bit | 3.7B | 512K | Apache-2.0 | MLX 4-bit |
| Llama 3.2 3B | 3.2B | 128K | Llama 3.2 Community | Varios (GGUF, MLX) |
| Qwen2.5 3B | 3.0B | 32K | Apache-2.0 | Varios (GGUF, MLX) |
| Gemma 2 2B | 2.6B | 8K | Gemma Terms | Varios (GGUF, MLX) |

La principal diferencia de K2-Horizon es su contexto de 512K, muy superior al de sus competidores directos. Sin embargo, no se dispone de datos de rendimiento comparativo en tareas estandar, por lo que no es posible evaluar su calidad relativa.

## Limitaciones y advertencias

- Modelo cuantizado a 4 bits: puede presentar perdida de precision en tareas de razonamiento complejo o generacion de codigo muy especifico en comparacion con la version en precision completa.
- Solo soporta ingles de forma fiable; otros idiomas pueden producir resultados degradados.
- Requiere `--trust-remote-code` para cargar el adaptador personalizado, lo que implica ejecutar codigo no verificado por HuggingFace.
- No incluye capacidades de vision ni audio; es exclusivamente de texto.
- El modelo base no es de acceso publico en su version original, por lo que no se puede auditar su entrenamiento ni verificar sus datos.
- La ventana de contexto de 512K consume una cantidad significativa de memoria; en equipos con menos de 16 GB de RAM unificada, el rendimiento puede degradarse o producirse errores de memoria.
- No se han publicado benchmarks independientes que validen las afirmaciones de rendimiento del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/K2-Horizon-3.7B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Revision del modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B/tree/633f52ad28b17edeabd82afc61d2d13b4c59a561
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
