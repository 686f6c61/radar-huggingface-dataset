# mikewolfd/kev-0.8b-mlx-w8

## Resumen

Kev-0.8B (Pre-Merged MLX W8 `g64`) es una conversión cuantizada a 8 bits del checkpoint `jaredpalmer/kev-0.8b`, publicada por el usuario mikewolfd. El modelo base combina `Qwen/Qwen3.5-0.8B-Base` con un adaptador LoRA denominado Kev, y esta versión integra ambos en un único checkpoint MLX ya fusionado, de modo que se elimina el paso de descargar el modelo base y el adaptador por separado y fusionarlos localmente. El objetivo declarado es su uso con la librería `fast-silicon` (concretamente `fast-decision-models`) sobre Apple Silicon.

La relevancia de esta publicación es operativa más que arquitectónica: se trata de un artefacto de despliegue para macOS con chips de la serie M, con cuantización de 8 bits y `group_size=64`, empaquetado en un único fichero `safetensors` de 801 MB. El autor reporta la preservación del contexto completo del modelo base (hasta 1.024 tokens de estado y 2.048 tokens combinados), evitando el límite de 1.024 tokens totales que atribuye a las exportaciones públicas a Core ML.

No se dispone de información sobre el pipeline, los idiomas soportados ni los datos de entrenamiento del modelo base. La model card se centra en métricas de verificación interna (Tier-1 con RAGTruth, CLINC150 y RewardBench-2) y en el rendimiento de la ruta de inferencia, no en capacidades generativas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B-Base + adaptador Kev); detalles no disponibles |
| Parametros totales | 0,8 B (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.024 tokens de estado; 2.048 tokens combinados |
| Tipos de cuantizacion | 8 bits con `group_size=64` (MLX W8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), fichero `model_w8.safetensors` de 801 MB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo deriva de `Qwen/Qwen3.5-0.8B-Base`, un transformer de aproximadamente 0,8 mil millones de parámetros, al que se le aplica un adaptador LoRA llamado Kev. Esta publicación concreta no entrena nada nuevo: fusiona el adaptador con el modelo base y cuantiza el resultado a 8 bits en formato MLX con `group_size=64`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si el adaptador se entrenó con RLHF o DPO.

La innovación técnica destacable no está en el modelo sino en el empaquetado y la ruta de inferencia: el checkpoint pre-fusionado elimina los pasos de descarga y merge locales, y el autor reporta una ruta de decodificación con `PrefixTree` sobre pasajes compartidos que, en perfil `interactive`, presenta una diferencia de logits frío-vs-caliente de 0,0 y resulta 3,04 veces más rápida que `mlx-lm` estándar en un Apple M5 base. También se menciona la preservación del contexto completo frente al recorte de 1.024 tokens de exportaciones Core ML públicas.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.5-0.8B-Base (sin detalle publicado en esta model card).
- Clasificación de intenciones y decisión: la verificación Tier-1 incluye CLINC150, un conjunto de clasificación de intenciones de dominio abierto.
- Atribución y verificación frente a contexto: la verificación incluye RAGTruth, orientado a detectar alucinaciones en generación aumentada por recuperación.
- Evaluación de respuestas y preferencias: se cita RewardBench-2 dentro del conjunto de verificación Tier-1.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: el modelo se ha verificado sobre CLINC150, por lo que encaja en enrutado de consultas y etiquetado de intención en un pipeline de atención al cliente sobre Apple Silicon, con contexto de hasta 1.024 tokens de estado.
- Verificación de respuestas en sistemas RAG: la inclusión de RAGTruth en la verificación Tier-1 sugiere su uso como filtro de atribución, comprobando si la respuesta generada está respaldada por los pasajes recuperados antes de mostrarla al usuario.
- Enrutado de decisiones de bajo coste en local: con 0,8 B de parámetros y 801 MB en 8 bits, es adecuado para tareas de decisión (elegir herramienta, ruta o respuesta) en un Mac con chip M, sin depender de la nube.
- Prototipado y evaluación de pipelines `fast-silicon`: al ser un checkpoint pre-fusionado para `fast-decision-models`, sirve para montar y comparar rutas de inferencia (por ejemplo, `PrefixTree` frente a `mlx-lm`) sin gestionar merges de LoRA.
- Procesamiento por lotes de evaluación con contexto compartido: la ruta `PrefixTree` con pasajes compartidos, con 0,0 de diferencia de logits frío-vs-caliente y 3,04 veces más velocidad que `mlx-lm` en M5 base, es adecuada para evaluar muchos ítems que comparten un mismo prefijo o documento.
- Despliegue de bajo consumo en estaciones de trabajo macOS: al caber en 2,23 GB de memoria en la configuración verificada, permite ejecutar el modelo de forma concurrente con otras aplicaciones en equipos de 24 GB.

## Benchmarks y rendimiento

| Metrica | Configuracion | Resultado |
|---|---|---|
| Tier-1 (RAGTruth + CLINC150 + RewardBench-2, 1.400 items) | Apple M5 base, 24 GB, en reposo | 1400/1400 aciertos, `S_obj,e2e` = 0,5257, PASS |
| EOT (end-of-turn) | Apple M5 base | 4,89 |
| Tiempo total de la verificacion | Apple M5 base | 150,7 s |
| Memoria en la verificacion | Apple M5 base | 2,23 GB |
| Diferencia de logits frío-vs-caliente | `PrefixTree` con pasajes compartidos, `profile="interactive"` | 0,0 |
| Aceleracion frente a `mlx-lm` | `PrefixTree`, `profile="interactive"`, M5 base | 3,04x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 2,23 GB medidos durante la verificación Tier-1 en un Apple M5 base de 24 GB.
- Tamaño en disco: repositorio de 0,8 GB; fichero de pesos `model_w8.safetensors` de 801 MB.
- GPU recomendadas: Apple Silicon de la serie M; la verificación se realizó en un Apple M5 base con 24 GB. No hay datos para otras GPU.
- Compatibilidad con GPU de consumo: el formato MLX está orientado a Apple Silicon; no se indica soporte para GPU NVIDIA o AMD.
- Opciones de despliegue: librería `mlx` y la pila `fast-silicon` (`fast-decision-models`), con la ruta `PrefixTree` en perfil `interactive`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 150,7 s para 1.400 ítems en la verificación Tier-1 en M5 base; aceleración de 3,04x frente a `mlx-lm` con `PrefixTree`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kev-0.8B MLX W8 (esta ficha) | ~0,8 B | 1.024 / 2.048 tokens | safetensors MLX, 8 bits g64 | Apache 2.0 | Pre-fusionado para `fast-silicon`; verificado en M5 |
| jaredpalmer/kev-0.8b | ~0,8 B | no disponible | base + LoRA | no disponible | Requiere descarga del base y merge local |
| Qwen/Qwen3.5-0.8B-Base | ~0,8 B | no disponible | no disponible | no disponible | Modelo base sin adaptador |

No se dispone de datos de benchmarks comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo tiene 0,8 B de parámetros: su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación: aunque se ha verificado sobre RAGTruth, un modelo de este tamaño puede generar afirmaciones no respaldadas por el contexto; se recomienda validación externa en producción.
- Contexto limitado: 1.024 tokens de estado y 2.048 combinados restringen casos de uso con documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados: no hay garantía de calidad fuera de los idiomas del modelo base.
- Formato específico de plataforma: el checkpoint es MLX y está pensado para Apple Silicon; no es portable directamente a otras pilas de inferencia.
- Métricas de la model card acotadas: los resultados Tier-1 y de aceleración provienen de la verificación del autor en un único equipo (M5 base, 24 GB), sin replicación independiente publicada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del adaptador originales antes de desplegar.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no hay evidencia de adopción por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mikewolfd/kev-0.8b-mlx-w8
- Modelo base del adaptador: https://huggingface.co/jaredpalmer/kev-0.8b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio `fast-silicon`: https://github.com/mikewolfd/fast-silicon
