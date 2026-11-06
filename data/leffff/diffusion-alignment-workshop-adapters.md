# leffff/diffusion-alignment-workshop-adapters

## Resumen

`leffff/diffusion-alignment-workshop-adapters` es una colección de adaptadores LoRA que alinean el modelo de difusión Sana-600M-512px (Efficient-Large-Model) para una tarea concreta: renderizar correctamente el texto solicitado en el prompt de generación de imágenes (por ejemplo, `a chalkboard with the word "Recycling" written on it`). Lo publica el usuario leffff como material didáctico de un taller sobre alineamiento de modelos de difusión, e incluye nueve adaptadores entrenados con seis métodos distintos de alineamiento (SFT, reward-weighted regression, Diffusion-DPO offline y online, Flow-GRPO y DiffusionNFT) más dos expertos de recompensa adicionales y una destilación on-policy de los tres expertos.

El interés técnico está en que cada adaptador se entrena en solo 5 minutos sobre una única GPU H100 con un cuaderno de taller reproducible, y en que se comparan de forma controlada métodos offline y online de alineamiento de difusión bajo una misma receta de evaluación (64 prompts reservados, 2 semillas, 20 pasos Euler, CFG 4.5). La métrica principal es OCR, calculada como 1 menos la tasa de edición de caracteres necesaria para encontrar el texto objetivo en la transcripción de Qwen3-VL-2B. Los adaptadores son ficheros `.pt` con state dict de PEFT LoRA (r = 32, alpha = 32) sobre el `SanaTransformer2DModel`, no son modelos completos y no funcionan sin el modelo base.

Se trata, por tanto, de un artefacto de investigación y docencia más que de un modelo listo para producción: licencia Apache 2.0, sin descargas ni interacciones en el momento de la consulta, y sin idiomas declarados en la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre el transformer de difusión `SanaTransformer2DModel` del modelo Sana-600M-512px |
| Parámetros totales | No disponible para los adaptadores; el modelo base Sana-600M-512px tiene aproximadamente 600 M de parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo text-to-image); resolución de entrenamiento del base: 512 px |
| Tipos de cuantización | No disponible; los adaptadores se guardan en fp32 |
| Idiomas soportados | No disponible (la tarea de renderizado de texto se evalúa con texto en inglés en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Ficheros `.pt` con state dict de PEFT LoRA (fp32, r = 32, alpha = 32) para las capas `to_q`, `to_k`, `to_v`, `to_out.0`, `conv_inverted`, `conv_point`, `proj_out` |

## Arquitectura y entrenamiento

El modelo base es Sana-600M-512px, un transformer de difusión para text-to-image de la familia Sana, y los adaptadores se aplican sobre su `SanaTransformer2DModel` mediante LoRA con rango 32 y alpha 32 sobre las proyecciones de atención y las capas convolucionales del transformer. Cada fichero `.pt` es un diccionario generado por la función `save_adapter` del cuaderno del taller y contiene el state dict de PEFT en fp32. Todos los adaptadores se usan con CFG 4.5, de modo que la política alineada es la velocidad guiada.

El entrenamiento se realizó sobre el dataset `leffff/diffusion-alignment-workshop` y cada adaptador se entrenó durante 5 minutos en una única H100. Los métodos cubiertos son: SFT sobre la mejor de 5 muestras con OCR ≥ 0.5 (1018 iteraciones × 32, lr 3e-4); reward-weighted regression con softmax de grupo τ = 0.1 (1052 iteraciones × 6 prompts × 5, lr 3e-4); Diffusion-DPO offline con β = 500 comparando mejor y peor de 5 (463 iteraciones × 32 pares, lr 3e-4); Diffusion-DPO online con β = 500 y 4 actualizaciones por rollout (40 iteraciones × 16 prompts × 4, lr 1e-3); Flow-GRPO con ventana SDE de 2 pasos y grupos ramificados (28 iteraciones × 8 prompts × 8, lr 1e-3); y DiffusionNFT con β = 1 (38 iteraciones × 8 prompts × 8, lr 1e-3). Además se entrenan dos expertos DiffusionNFT con recompensas distintas (PickScore y estética LAION v2) y un estudiante OPD que destila on-policy la combinación de los tres expertos (101 iteraciones × 32, lr 1e-4) sin usar recompensa explícita.

Las recompensas empleadas son OCR (1 − ediciones de caracteres para localizar el texto objetivo en la transcripción de Qwen3-VL-2B dividido por su longitud), PickScore, estética (predictor LAION v2) y CLIP score, esta última reservada para evaluación y nunca usada en entrenamiento.

## Capacidades

- Generación de imágenes text-to-image condicionada por prompt, heredada de Sana-600M-512px.
- Renderizado de texto legible en la imagen: es la capacidad que el alineamiento pretende mejorar, con un incremento de OCR de 0.569 (base) a 0.746 (adaptador DiffusionNFT).
- Alineamiento multiobjetivo: existen adaptadores especializados en OCR, en PickScore y en estética, además de un estudiante OPD que combina los tres expertos en una sola red por paso.
- Reproducibilidad metodológica: nueve adaptadores entrenados con seis métodos de alineamiento bajo una misma receta y misma evaluación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es un conjunto de adaptadores de difusión, no un modelo de lenguaje.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Docencia e investigación en alineamiento de difusión: el paquete sirve como material de taller para comparar SFT, RWR, DPO offline/online, GRPO y NFT con una receta de 5 minutos por método en una H100, lo que permite reproducir la comparativa en un curso o seminario.
- Generación de carteles y rótulos con texto legible: usando el adaptador `adapter_nft.pt` se obtienen imágenes de pizarras, carteles o etiquetas donde el texto del prompt aparece con mayor fidelidad (OCR 0.746 frente a 0.569 del base), útil para prototipos de señalética o mockups.
- Estudio del reward hacking: el adaptador `adapter_nft_aes.pt` ilustra un caso documentado de hackeo de recompensa estética (sube estética a 5.56 pero el OCR cae a 0.259), útil como ejemplo negativo en formación sobre diseño de funciones de recompensa.
- Destilación on-policy de expertos: `adapter_opd.pt` demuestra cómo un estudiante iguala al profesor compuesto (OCR 0.642 frente a 0.620 del profesor) usando una sola red por paso en lugar de cuatro, patrón aplicable a pipelines de inferencia con múltiples recompensas.
- Evaluación de modelos de OCR como jueces: la métrica OCR basada en Qwen3-VL-2B puede reutilizarse para medir fidelidad de texto en generadores de imagen propios, con la salvedad de que el propio juez introduce ruido.
- Base para experimentos de alineamiento con recursos limitados: al necesitar solo 5 minutos de H100 por adaptador, el flujo sirve para validar recetas de RLHF en difusión antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación con 64 prompts reservados × 2 semillas, 20 pasos Euler y CFG 4.5. OCR más alto es mejor.

| Fichero | Método | OCR ↑ | PickScore | Estética | CLIP |
|---|---|---|---|---|---|
| — | Sana-600M (referencia) | 0.569 | 22.41 | 5.05 | 32.2 |
| `adapter_sft.pt` | SFT sobre la mejor de 5 (OCR ≥ 0.5) | 0.712 | 22.45 | 4.91 | 33.3 |
| `adapter_rwr.pt` | Reward-weighted regression, τ = 0.1 | 0.696 | 22.42 | 4.95 | 33.0 |
| `adapter_dpo.pt` | Diffusion-DPO offline, β = 500 | 0.677 | 22.51 | 4.99 | 32.9 |
| `adapter_online_dpo.pt` | Diffusion-DPO online, β = 500 | 0.612 | 22.40 | 5.04 | 32.5 |
| `adapter_grpo.pt` | Flow-GRPO, ventana SDE de 2 pasos | 0.599 | 22.40 | 5.03 | 32.3 |
| `adapter_nft.pt` | DiffusionNFT (experto OCR), β = 1 | 0.746 | 22.35 | 4.79 | 32.3 |
| `adapter_nft_pick.pt` | DiffusionNFT sobre PickScore | 0.687 | 22.54 | 4.95 | 32.6 |
| `adapter_nft_aes.pt` | DiffusionNFT sobre estética (reward hacking) | 0.259 | 21.88 | 5.56 | 29.9 |
| `adapter_opd.pt` | OPD, destilación de los tres expertos | 0.642 | 22.52 | 5.01 | 32.9 |

Referencias de fusión sin entrenamiento: suma de LoRA 0.558 / 22.32 / 5.13 / 31.3; media de LoRA 0.581 / 22.42 / 5.07 / 32.2; profesor compuesto (4 redes por paso) 0.620 / 22.49 / 5.04 / 32.6.

Variabilidad entre ejecuciones a 5 minutos (OCR, varias semillas): DPO online 0.646 ± 0.03, GRPO 0.632 ± 0.02, DiffusionNFT 0.736 ± 0.01. Los adaptadores publicados provienen de la ejecución de referencia única del cuaderno.

## Requisitos de hardware

- Entrenamiento: una única GPU H100 por adaptador, 5 minutos por método según la model card.
- Inferencia: requiere cargar el modelo base Sana-600M-512px (aproximadamente 600 M de parámetros) más el adaptador LoRA; el repositorio de adaptadores ocupa 1.0 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del base (600 M) cabe con holgura en GPUs de consumo actuales, aunque no se han publicado cifras concretas.
- GPU recomendadas: H100 para entrenamiento; para inferencia no se especifican modelos concretos.
- Despliegue: el uso documentado es dentro del cuaderno del taller mediante `hf_hub_download` y `load_adapter`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no a este tipo de adaptadores de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | OCR (referencia interna) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este paquete (adaptadores sobre Sana-600M) | LoRA sobre difusión | ~600 M (base) | 512 px | 0.569 base / 0.746 mejor adaptador | Apache 2.0 | Hugging Face, 0 descargas |
| Sana-600M-512px (base) | Difusión text-to-image | ~600 M | 512 px | 0.569 | No disponible en la información | Hugging Face |
| SDXL + LoRA de texto (alternativa genérica) | Difusión text-to-image | No disponible | No disponible | No disponible | No disponible | No disponible |
| Flux.1 + LoRA de texto (alternativa genérica) | Difusión text-to-image | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables de otros sistemas de renderizado de texto en imagen dentro de la información proporcionada; las filas de alternativas genéricas se incluyen solo como categoría y sin cifras verificadas.

## Limitaciones y advertencias

- No son modelos autónomos: los `.pt` son state dicts de LoRA que requieren el modelo base Sana-600M-512px y el cuaderno del taller para cargarse; no hay pesos completos ni pipeline de inferencia independiente documentado.
- Entrenamiento muy corto: 5 minutos por adaptador en una H100, con una única ejecución de referencia; la variabilidad entre semillas es apreciable (por ejemplo, DPO online 0.646 ± 0.03 en OCR), por lo que las diferencias pequeñas entre métodos no deben interpretarse como concluyentes.
- Reward hacking documentado: el adaptador estético (`adapter_nft_aes.pt`) sube la estética a 5.56 pero degrada el OCR a 0.259 y el CLIP a 29.9, eliminando el texto; no debe usarse para tareas de renderizado de texto.
- Evaluación limitada: 64 prompts reservados × 2 semillas y una métrica OCR basada en un modelo externo (Qwen3-VL-2B) que puede introducir errores de transcripción.
- Idiomas no declarados: los ejemplos y la evaluación usan texto en inglés; el comportamiento con otros idiomas o alfabetos no está documentado.
- Sesgos: no documentados en la información disponible; al heredar el modelo base y el dataset del taller, puede reproducir sesgos de Sana-600M y de los datos de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir texto ilegible o incorrecto fuera de la distribución de prompts entrenados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Sana-600M-512px tiene su propia licencia que debe verificarse por separado antes de desplegar en producción.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay garantías de mantenimiento ni soporte.

## Enlaces

- Repositorio de adaptadores: https://huggingface.co/leffff/diffusion-alignment-workshop-adapters
- Modelo base: https://huggingface.co/Efficient-Large-Model/Sana_600M_512px_diffusers
- Dataset del taller: https://huggingface.co/datasets/leffff/diffusion-alignment-workshop
- Modelo juez OCR: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
