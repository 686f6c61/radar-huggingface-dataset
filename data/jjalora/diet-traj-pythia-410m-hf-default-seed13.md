# jjalora/diet-traj-pythia-410m-hf-default-seed13

## Resumen

`jjalora/diet-traj-pythia-410m-hf-default-seed13` es un checkpoint de investigación publicado en HuggingFace que documenta una ejecución de preentrenamiento desde cero del modelo Pythia-410M, realizada en el marco de la campaña DIET de estudio del espacio de pesos. No se trata de un modelo nuevo con capacidades propias, sino de una réplica controlada del recetario abierto de EleutherAI para Pythia-410M, en la que solo varían la semilla aleatoria (seed 13) y el esquema de inicialización (`hf_default`), manteniendo arquitectura, flujo de tokens y orden de datos idénticos al original.

El objetivo es permitir estudios de trayectorias de entrenamiento en el espacio de pesos: comparar cómo evolucionan los pesos de dos ejecuciones que parten de distribuciones de inicialización equivalentes pero con RNG distinto. El modelo emplea la arquitectura GPT-NeoX (transformer decoder-only) con 410 millones de parámetros y una ventana de contexto de 2048 tokens, entrenado sobre el dataset The Pile en su versión pre-shuffled estándar de Pythia.

Su relevancia es metodológica: facilita reproducir análisis de dinámica de entrenamiento, alineamiento de checkpoints entre ejecuciones y experimentos de interpretabilidad comparada. El repositorio incluye checkpoints intermedios en la rama `stepN` (pasos 0, 1, 2, 4, …, 512 y cada 100 pasos posteriores), lo que lo hace útil para estudiar la evolución temporal del modelo, no solo su estado final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 410 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura GPT-NeoX de Pythia-410M: transformer decoder-only con atención multi-cabeza estándar, sin mecanismos de atención lineal ni decodificación especulativa. El entrenamiento sigue el fichero de configuración `models/410M/pythia-410m.yml` del repositorio de EleutherAI: AdamW con learning rate 3e-4, betas (0.9, 0.95), weight decay 0.1 (sin decay en LayerNorm ni bias), grad clipping 1.0, schedule coseno hasta 3e-5 a lo largo de 143.000 pasos, con 1.430 pasos de warmup. Se usó autocast fp16 con pesos maestros en fp32 y un batch global de 1024 secuencias de 2048 tokens (micro-batch 4, 4 nodos con 4 GPUs A100-PCIE-40GB cada uno).

Los datos de entrenamiento son `EleutherAI/pile-standard-pythia-preshuffled`, con el mismo orden de tokens que Pythia: el batch *i* corresponde a las filas [i·1024, (i+1)·1024). La única diferencia respecto a la ejecución original es la semilla (13 frente a la de EleutherAI) y el esquema de inicialización `hf_default` (small_init + wang_init de GPT-NeoX). El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. No se documenta RLHF ni DPO; es preentrenamiento puro.

## Capacidades

- Generación de texto en inglés, heredada del preentrenamiento sobre The Pile.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 410M.
- Generación de código y matemáticas elementales, sin garantías de corrección.
- No dispone de tool calling ni function calling documentado.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingües limitadas al inglés (idioma declarado: en).
- No incluye visión, audio ni modo "thinking".
- Valor principal: checkpoints intermedios para investigación de trayectorias de entrenamiento en el espacio de pesos.

## Casos de uso

- Estudio de trayectorias de entrenamiento: comparar la evolución de los pesos de esta ejecución (seed 13) con otras semillas o esquemas de inicialización de la campaña DIET, usando los checkpoints `stepN` para medir distancias en el espacio de pesos a lo largo del tiempo.
- Reproducibilidad y auditoría de recetas: verificar que el recetario de Pythia-410M se ejecuta de forma consistente en distintos clústeres y configuraciones de GPU, comparando el estado final con el modelo original.
- Interpretabilidad comparada: analizar cómo difieren las representaciones internas entre dos ejecuciones con la misma distribución de inicialización pero RNG distinto, por ejemplo con sondas lineales o análisis de atención.
- Investigación de alineamiento de checkpoints: estudiar técnicas de emparejamiento de pesos (weight matching) entre ejecuciones independientes del mismo modelo.
- Punto de partida para fine-tuning controlado: usar los checkpoints intermedios como inicialización para experimentos que necesiten un modelo pequeño (410M) en inglés con estado de entrenamiento conocido y trazable.
- Docencia y experimentación en entornos con recursos limitados: el tamaño de 410M permite ejecutar experimentos de entrenamiento e inferencia en GPUs de consumo, sirviendo como banco de pruebas para metodologías de estudio de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8-1 GB para los pesos (410M parámetros a 2 bytes), más overhead de activaciones y KV cache según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5 GB; en 4 bits, en torno a 0,3 GB (estimaciones, no verificadas en la información disponible).
- GPU recomendadas para entrenamiento: A100-PCIE-40GB (la configuración documentada usa 4 nodos × 4 A100 de 40 GB).
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares para inferencia; el entrenamiento completo requiere clúster.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de exportar a GGUF para llama.cpp u Ollama y de servir con vLLM o TGI, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| diet-traj-pythia-410m-hf-default-seed13 | 410M | 2048 | Apache 2.0 | Réplica controlada de Pythia-410M con seed 13; checkpoints intermedios para estudio de trayectorias |
| EleutherAI/pythia-410m | 410M | 2048 | Apache 2.0 | Modelo original de referencia, con suite completa de checkpoints (154) y benchmarks publicados |
| EleutherAI/pythia-410m-deduped | 410M | 2048 | Apache 2.0 | Variante entrenada sobre The Pile deduplicado |
| GPT-Neo-125M (EleutherAI) | 125M | 2048 | MIT | Alternativa más pequeña de la misma familia arquitectónica |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de usuario final.
- Sesgos conocidos: hereda los sesgos de The Pile, documentados en la literatura sobre Pythia; no se han realizado evaluaciones específicas en esta ejecución.
- Riesgo de alucinación: alto en tareas de conocimiento factual, propio de un modelo de 410M preentrenado sin ajuste instructivo.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Limitación de contexto: 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad para tales fines.
- Caveat de producción: la reproducibilidad bit a bit del RNG de inicialización no es posible entre frameworks; la equivalencia con Pythia se limita a la distribución por tensor.
- El repositorio ocupa 8,9 GB por la acumulación de checkpoints intermedios; conviene descargar solo las ramas `stepN` necesarias.

## Enlaces

- HuggingFace: https://huggingface.co/jjalora/diet-traj-pythia-410m-hf-default-seed13
- Repositorio de Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Modelo original de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Paper de Pythia: https://arxiv.org/abs/2304.01373
