# ceselder/maemm-qwen36-27b-inverter-rlE-step250

## Resumen

Este modelo es un adaptador LoRA de investigación desarrollado por ceselder, diseñado para invertir activaciones a texto. Se carga sobre el modelo base Qwen/Qwen3.6-27B y tiene la función de, dado un vector unitario `v` en el residual stream de la capa 42, generar texto cuya activación en esa capa apunte a lo largo de `v`. Es una herramienta para interpretabilidad mecanicista, útil para entender qué conceptos codifican las direcciones en el espacio de representaciones de un modelo de lenguaje grande.

El adaptador se entrenó en tres fases: SFT inicial sobre 23 millones de pares (dirección, texto), SFT continuada sobre un mix de 1,1 millones de direcciones y un refinamiento con GRPO. En este último paso (250 de 400) se alcanzó una fidelidad media de 0.4210 en 11 familias held-out. El checkpoint es el último bueno de un run que colapsó después del paso 261, por lo que es una instantánea de un proceso de entrenamiento inestable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.6-27B (Transformer) |
| Parámetros totales | no disponible (adaptador LoRA r64, 1.87 GB en fp32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos del adaptador en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64, alpha 16, con rsLoRA, aplicado a todas las capas lineales del modelo base Qwen3.6-27B. El entrenamiento se realizó en tres fases. Primero, una SFT sobre 23.000.000 de pares (dirección, texto) generados a partir de activaciones reales de la capa 42 de FineFineWeb, con lr 1e-4 y una época. Después, una SFT continuada durante una época sobre un mix de 1,1 millones de direcciones de todas las familias (activaciones reales en contexto corto y largo, features de SAE, BSF y cluster-probe), también con lr 1e-4. Finalmente, un refinamiento con GRPO siguiendo la receta ScaleRL (CISPO ε=5, agregación a nivel de prompt, normalización de ventaja por batch, filtro de varianza cero, sin KL ni término de entropía), con 16 muestras por dirección y 256 direcciones por paso, lr 1e-5 constante y recompensa basada en el coseno máximo sobre los últimos 5 tokens generados, con una penalización de 0.00025 por token a partir de 8 tokens. El banco de direcciones incluye el mix de 1,1 millones más 113.814 direcciones de neuronas MLP de la capa 42 y pares de co-firing (7 familias, 1.209.088 filas). El checkpoint corresponde al paso 250 de 400; el run colapsó después del paso 261 debido a una explosión de la norma del gradiente, por lo que los pasos 300 y 400 obtienen peores resultados (0.365 y 0.273).

## Capacidades

- Inversión de activaciones a texto: genera texto cuya activación en la capa 42 (base limpia) apunta a la dirección inyectada.
- Fidelidad en direcciones reales: coseno medio de 0.5467 en contexto corto y 0.473 en contexto largo.
- Fidelidad en features de SAE: activación normalizada de 0.8715, con un 0.377 de fracción rank-1 y un 0.213 de fracción no verbalizada.
- Fidelidad en neuronas MLP: coseno de 0.105 y fire-back de 0.768.
- Control aleatorio: coseno de 0.034, lo que indica que el modelo no está simplemente generando respuestas al azar.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido convencional; es un modelo de propósito específico.

## Casos de uso

- Investigación en interpretabilidad mecanicista: se usa para generar descripciones textuales de direcciones en el residual stream de la capa 42. El investigador inyecta una dirección y analiza el texto generado para inferir el concepto que codifica.
- Validación de features de sparse autoencoders: permite comprobar si las características de un SAE son verbalizables. Al inyectar una feature, el texto generado revela si la feature corresponde a un concepto reconocible.
- Análisis de neuronas MLP: se utiliza para identificar qué conceptos activan neuronas individuales. La métrica de fire-back (0.768) indica que el modelo es capaz de generar texto que activa la neurona objetivo.
- Auditoría de sesgos y comportamientos: mapea direcciones asociadas a comportamientos no deseados a descripciones textuales, lo que ayuda a entender y mitigar sesgos en el modelo base.
- Desarrollo de herramientas de interpretabilidad: el adaptador puede integrarse en pipelines de análisis de activaciones, como notebooks de investigación que procesan salidas de modelos grandes.
- Estudio de la composicionalidad del espacio de representaciones: compara la fidelidad de inversión entre familias de direcciones (reales, SAE, BSF, cluster-probe, MLP) para entender cómo se organizan las representaciones.
- Generación de estímulos para probing: crea prompts que activan direcciones específicas, útiles para evaluar la sensibilidad del modelo a conceptos concretos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Media sobre 11 familias held-out | 0.4210 |
| Activaciones reales (contexto corto) | 0.5467 |
| Activaciones reales (contexto largo 256-511) | 0.473 |
| Features SAE: activación normalizada | 0.8715 |
| Features SAE: fracción rank-1 | 0.377 |
| Features SAE: fracción no verbalizada | 0.213 |
| Subespacio BSF: coseno | 0.341 |
| Cluster-probe: coseno | 0.270 |
| J-lens: coseno | 0.112 |
| Neuronas MLP capa 42: coseno | 0.105 |
| Neuronas MLP capa 42: fire-back | 0.768 |
| Direcciones aleatorias (control) | 0.034 |

Comparación con checkpoints hermanos del mismo proyecto:

| Checkpoint | Media held-out | Activación normalizada SAE |
|---|---|---|
| RL-D step 200 | 0.4200 | 0.9030 |
| RL-C step 300 | 0.4190 | 0.8861 |
| RL-E step 250 (este) | 0.4210 | 0.8715 |

## Requisitos de hardware

- El adaptador LoRA ocupa 1.87 GB en fp32.
- La VRAM necesaria es la del modelo base Qwen3.6-27B más el overhead del adaptador. No se han proporcionado datos oficiales. Como orientación, para un modelo de 27B se suele necesitar entre 14 y 54 GB de VRAM según la cuantización (4 bits, 8 bits o fp16).
- GPU recomendadas: para inferencia en 4 bits, una RTX 4090 (24 GB) o similar sería suficiente; para fp16, se necesitaría una A100 (80 GB) o H100.
- Opciones de despliegue: el adaptador se puede cargar con la librería PEFT y transformers. También es posible integrarlo en vLLM, aunque no se ha verificado la compatibilidad de este adaptador específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (inversores de activación a texto). Los checkpoints hermanos del mismo autor (RL-D step 200, RL-C step 300) son variantes del mismo proyecto y no alternativas independientes.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de propósito general. No está diseñado para tareas de generación de texto convencionales.
- La licencia no está especificada, lo que genera incertidumbre para cualquier uso comercial.
- El entrenamiento fue inestable: el run colapsó después del paso 261, y este checkpoint es el último bueno. Los pasos posteriores (300 y 400) tienen un rendimiento notablemente inferior.
- La fidelidad media es moderada (0.4210), aunque el control aleatorio es bajo (0.034). Esto indica que el modelo captura señales reales, pero no es perfecto.
- Las métricas de coseno no garantizan que el texto generado sea una descripción semánticamente precisa de la dirección inyectada.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), por lo que no se puede evaluar su rendimiento en tareas generales.
- Depende del modelo base Qwen3.6-27B; si se usa con otro modelo base, el adaptador no funcionará.
- Los idiomas soportados no están especificados, por lo que no se puede garantizar el rendimiento fuera del inglés (asumiendo que FineFineWeb es un dataset en inglés, pero no se confirma).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ceselder/maemm-qwen36-27b-inverter-rlE-step250
- Página relacionada en HuggingFace: https://huggingface.co/ceselder/qwen36-27b-maemm-inverter
- Código de entrenamiento: https://github.com/ceselder/maemm
- Registros de wandb: proyecto `octahedral-systems/maxact-fast`, train `p57zffg6`, eval `rl_E_mixmlp_from_mixsft_eval` (no se proporcionan URLs directas).
