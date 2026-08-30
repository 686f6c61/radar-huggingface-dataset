# Bendyline/Ornith-1.5-9B-mtp-drafter-mlx-4bit

## Resumen

El modelo `Bendyline/Ornith-1.5-9B-mtp-drafter-mlx-4bit` es un drafter de decodificación especulativa (speculative decoding) extraído del head de multi-token prediction (MTP) nativo del modelo `ornith-ai/Ornith-1.5-9B`, cuantizado a 4-bit affine (group size 64) y convertido al formato MLX. Lo desarrolla Bendyline como parte de su ecosistema Gezel, una aplicación de escritorio local para ensamblar equipos de agentes de IA. El drafter no contiene embeddings ni LM head propios: se enlaza al modelo objetivo en tiempo de carga, lo que permite emparejarlo con cualquier cuantización del mismo modelo base (4-bit, 8-bit, etc.).

El propósito de este artefacto es acelerar la inferencia del modelo Ornith-1.5-9B mediante decodificación especulativa: el drafter propone varios tokens por paso y el modelo objetivo los verifica, de modo que se reduce el número de pasos de decodificación sin alterar la salida. Según las mediciones del autor, la decodificación greedy con el drafter produce salidas byte-idénticas a las del modelo sin él, tanto en cuantización 4-bit como 8-bit. El drafter pesa solo 0.1 GB, lo que lo hace muy ligero y adecuado para entornos con recursos limitados, especialmente en hardware Apple Silicon con MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Head MTP (multi-token prediction) extraído de Ornith-1.5-9B, sin embeddings ni LM head |
| Parametros totales | no disponible (el drafter es un subconjunto del modelo base de 9B; el repo ocupa 0.1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Ornith-1.5-9B; no se especifica en la ficha) |
| Tipos de cuantizacion | 4-bit affine (group size 64) |
| Idiomas soportados | no disponibles (heredados del modelo base, no declarados) |
| Licencia | MIT (heredada de ornith-ai/Ornith-1.5-9B) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El drafter se construye extrayendo únicamente los tensores `mtp.*` del checkpoint de Ornith-1.5-9B (una de las cuatro shards del modelo) mediante el script `build-mtp-drafter.mjs` del repositorio Gezel. El head MTP es una cabeza de predicción de múltiples tokens que, en el modelo original, se utiliza para predecir varios tokens futuros en paralelo durante el entrenamiento. Al aislarlo como drafter independiente, se convierte en un componente de decodificación especulativa: propone una secuencia de tokens candidatos que el modelo objetivo verifica en un solo paso.

El drafter no se entrena desde cero; es un subproducto del modelo base, cuantizado a 4-bit affine con group size 64 para reducir su huella de memoria. No incorpora capas de embedding ni cabeza de lenguaje, por lo que no puede generar texto por sí mismo: necesita cargarse junto con el modelo objetivo. El proceso de extracción está automatizado en el script mencionado y es reproducible.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: el drafter propone varios tokens por iteración, reduciendo el número de pasos de decodificación del modelo objetivo.
- Compatibilidad con cualquier cuantización del modelo base Ornith-1.5-9B (4-bit, 8-bit, etc.), ya que se enlaza dinámicamente en la carga.
- Preservación exacta de la salida: la decodificación greedy con el drafter produce resultados byte-idénticos a los del modelo sin él, tanto en cuantización 4-bit como 8-bit.
- Ligereza: el artefacto ocupa solo 0.1 GB, lo que facilita su despliegue en entornos con restricciones de memoria.
- Integración nativa con MLX (librería mlx-vlm), lo que lo hace apto para hardware Apple Silicon (M-series).
- No requiere entrenamiento adicional ni ajuste de hiperparámetros; se usa como un componente plug-and-play.

## Casos de uso

- Inferencia de Ornith-1.5-9B en producción con MLX: el drafter permite reducir la latencia en servidores de inferencia que sirven el modelo base, especialmente en cargas de trabajo con alto volumen de peticiones.
- Aplicaciones de agentes y generación de código en entornos Apple Silicon: al mejorar el throughput, se pueden ejecutar tareas de agente multi-turno con tiempos de respuesta más cortos en portátiles y estaciones de trabajo con chips M-series.
- Despliegue en dispositivos edge: dado el pequeño tamaño del drafter (0.1 GB), se puede combinar con versiones cuantizadas del modelo base (p. ej., 4-bit) para ejecutar asistentes de código o agentes en dispositivos con pocos GB de RAM.
- Optimización de costes en infraestructura cloud: al aumentar el número de tokens generados por segundo sin cambiar la calidad de salida, se reduce el tiempo de cómputo y, por tanto, el coste por petición en servicios basados en GPU.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto del head MTP nativo en modelos de razonamiento y agente, y para comparar con otros drafters externos.
- Desarrollo de herramientas de productividad local: integración en aplicaciones de escritorio (como el propio Gezel) que ensamblan equipos de agentes de IA que ejecutan modelos localmente, aprovechando la aceleración sin sacrificar fidelidad de salida.

## Benchmarks y rendimiento

El autor reporta mediciones de aceptación de tokens por ronda (accepted tokens/round) al usar el drafter con el modelo Ornith-1.5-9B servido por MLX (mlx-vlm 0.6.17, contexto de 4k, greedy, `block_size` 3):

| Cuantizacion del modelo objetivo | Tokens aceptados por ronda |
|---|---|
| 4-bit | 2.23 |
| 8-bit | 2.00 |

Además, se indica que la salida greedy es byte-idéntica con y sin el drafter en ambas cuantizaciones. No se proporcionan métricas de latencia o throughput absolutas, ni comparaciones con otros drafters. Los benchmarks del modelo base (SWE-bench Verified 70.6%, GPQA Diamond 86.4%, Terminal-Bench 2.1 47.0, ClawEval 66.5%, WideSearch 59.5%) corresponden al modelo original, no al drafter, y no son directamente aplicables a este artefacto.

## Requisitos de hardware

- El drafter en sí ocupa 0.1 GB, por lo que su requisito de VRAM es mínimo; el requisito dominante es el del modelo base Ornith-1.5-9B (9B parámetros).
- Para el modelo base en cuantización 4-bit, se estima una VRAM de aproximadamente 5-6 GB (típico para un modelo de 9B con cuantización 4-bit). Con el drafter añadido, el consumo extra es despreciable.
- Compatible con GPUs de Apple Silicon (M1, M2, M3 y posteriores) gracias a su formato MLX. También puede ejecutarse en GPUs NVIDIA si se usa MLX con backend CUDA (aunque MLX está optimizado para Apple).
- En consumer GPUs, una RTX 3060 (12 GB) o superior puede alojar el modelo base 4-bit junto con el drafter. Para cuantización 8-bit, se recomienda al menos 16 GB de VRAM.
- Opciones de despliegue: MLX (mlx-vlm), que es la librería objetivo. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la documentación del drafter.
- Latencia y throughput: no se proporcionan valores absolutos, pero la mejora esperada es proporcional a los tokens aceptados por ronda (2.23 en 4-bit, 2.00 en 8-bit), lo que implica una reducción del número de pasos de decodificación en aproximadamente un factor de 2-2.2 respecto a la decodificación autoregresiva estándar.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters específicos para Ornith-1.5-9B ni de comparativas con alternativas como drafters externos (p. ej., modelos tipo LLaMA-2-7B como drafter) o métodos de decodificación especulativa alternativos (p. ej., Medusa, EAGLE). La documentación del autor indica que un drafter del mismo head cuantizado a 8-bit obtuvo 2.34 / 1.96 tokens aceptados por ronda en los mismos targets, es decir, dentro del ruido estadístico, por lo que la versión 4-bit es la recomendada por su menor tamaño. No se pueden establecer comparaciones cuantitativas con otras soluciones sin datos adicionales.

## Limitaciones y advertencias

- El drafter no es un modelo autónomo: requiere cargar el modelo base Ornith-1.5-9B completo. Sin el modelo objetivo, no tiene utilidad.
- Solo funciona con MLX y con el modelo base específico (mismo checkpoint y arquitectura). No es compatible con otros modelos.
- La ganancia de rendimiento depende del tamaño de bloque (`block_size`) y de la cuantización del modelo objetivo. En el experimento reportado, la mejora es de aproximadamente 2x en tokens por ronda, pero puede variar con el contexto y la tarea.
- No se garantiza que la decodificación no-greedy (muestreo, temperatura) produzca salidas idénticas; la verificación solo se asegura para decodificación greedy.
- El drafter no ha sido evaluado en tareas específicas de razonamiento o generación de código; su único propósito es acelerar la inferencia, no mejorar la calidad.
- La licencia MIT permite uso comercial, pero se hereda del modelo base, por lo que cualquier restricción adicional de Ornith-1.5-9B (si la hubiera) aplicaría también.
- No se han publicado resultados de sesgos, alucinaciones o limitaciones lingüísticas específicas del drafter; estas dependen del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bendyline/Ornith-1.5-9B-mtp-drafter-mlx-4bit
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio Gezel (herramienta de construcción): https://github.com/bendyline/gezel
- Script de construcción del drafter: https://github.com/bendyline/gezel/blob/main/scripts/build-mtp-drafter.mjs
- Repositorio de Ornith (modelo base): https://github.com/ornith-ai/Ornith-1
