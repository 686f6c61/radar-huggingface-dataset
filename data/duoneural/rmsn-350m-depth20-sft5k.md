# DuoNeural/RMSN-350M-Depth20-SFT5k

## Resumen

RMSN-350M-Depth20-SFT5k es un modelo de lenguaje de 350 millones de parámetros desarrollado por DuoNeural AI Laboratory (Jesse Caldwell, Archon y Aura). Se presenta como una exploración de la "física topológica del escalado en profundidad" dentro de arquitecturas de secuencia de tipo Port-Hamiltonian, comparando 20 capas frente a las 16 habituales en su familia. El modelo parte de un preentrenamiento sobre FineWeb-Edu y se afina durante 5.000 pasos sobre trazas de razonamiento matemático y simbólico (`cdm_reasoning_traces_v4.jsonl`).

La propuesta técnica combina mecánica metripléctica, teoría de haces (sheaf theory) y estabilidad de Lyapunov en un transformer modificado denominado Resonant Metriplectic Sheaf LM (RMSN), con 64 "slots" y dimensión 1280. El autor defiende que el incremento de profundidad produce una "solidificación topológica" en las capas terminales que actuaría como ancla contra el olvido catastrófico, manteniendo a la vez representaciones fluidas en el bloque central.

Es relevante ahora como experimento de investigación sobre escalado en profundidad y sobre arquitecturas informadas por física, no como modelo listo para producción: el repositorio tiene 0 descargas, no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) y requiere código propio (`rmsn_core`) no incluido en la model card para la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf LM (RMSN), transformer Port-Hamiltonian con descomposición espectral de haces; 20 capas, dim 1280, 64 slots |
| Parametros totales | 350M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos como checkpoint PyTorch `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`rmsn_sft_depth20_best.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer modificado de 20 capas con dimensión 1280 y 64 slots, denominado Resonant Metriplectic Sheaf LM. Incorpora formulaciones Port-Hamiltonian y metriplécticas (conservación de energía y entropía) junto con análisis espectral mediante teoría de haces. El autor describe una estructura en dos regímenes: un "bulk superfluido" en las capas L00-L12 con participación efectiva (PR) aproximada de 63,8, y un "núcleo sólido" en L13-L19 donde la PR cae hasta 1,000000 en L18 y L19 (singularidad macroscópica de rango 1). La ratio M/L = 3/20 = 15 % se sitúa por debajo del umbral del 20 % que el autor fija como criterio para evitar sobrecarga topológica.

El preentrenamiento se realiza sobre FineWeb-Edu y el ajuste fino (SFT) durante 5.000 pasos sobre trazas de razonamiento matemático y simbólico. No se especifican el número total de tokens de preentrenamiento, la composición exacta del dataset de SFT, ni si se aplicaron RLHF o DPO. El tokenizador utilizado es `HuggingFaceTB/cosmo2-tokenizer` con vocabulario de 49.152 tokens. La innovación declarada es la "Ley del Cemento Topológico": la condensación de rango 1 en las capas finales actuaría como ancla que previene el olvido catastrófico sin sacrificar capacidad de representación en el bloque central.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Razonamiento matemático y simbólico, incentivado por el SFT sobre trazas de chain-of-thought.
- Razonamiento de tipo CoT (chain-of-thought) en problemas de demostración matemática, como se ilustra en el ejemplo de uso con la irracionalidad de la raíz de 2.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente más allá del CoT.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación en arquitecturas informadas por física: el modelo sirve como banco de pruebas para validar si la profundidad extra (20 vs 16 capas) y la condensación de rango 1 en capas terminales reducen el olvido catastrófico en modelos pequeños.
- Generación de demostraciones matemáticas cortas: el SFT sobre trazas de razonamiento permite producir pasos intermedios de pruebas simbólicas, útil para prototipos de asistentes matemáticos en entornos de investigación.
- Estudio de escalado en profundidad: comparar su pérdida de SFT (2,2726) y su PPL de razonamiento CoT (14,21) frente a variantes D=1280/D=1344 con 16 capas permite aislar el efecto de la profundidad.
- Experimentos de retención semántica: su PPL de 145,68 en WikiText-103 lo hace adecuado para medir cuánto conocimiento general conserva un modelo tras un SFT agresivo en razonamiento.
- Reproducción académica: al estar bajo licencia MIT y publicar el checkpoint, permite replicar el análisis espectral de haces descrito en la model card.
- Base para fine-tuning posterior en dominios matemáticos: su tamaño de 350M y su formato PyTorch permiten ajustes rápidos en GPUs de consumo, aunque requiere el paquete `rmsn_core` para cargar la arquitectura.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Metrica | D=1280 (L=16) SFT 5k | D=1344 (L=16) SFT 5k | D=1280 L=20 SFT 5k (este modelo) |
|---|---|---|---|
| Parametros | 310M | 425M | 350M |
| Capas | 16 | 16 | 20 |
| Mejor perdida SFT | 2,3140 | 2,4102 | 2,2726 |
| PPL en razonamiento CoT dificil | 17,48 | 20,75 | 14,21 |
| PPL de retencion WikiText-103 | 168,40 | 162,24 | 145,68 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,4 GB solo de pesos (350M × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 0,7 GB de pesos, más activaciones.
- Cuantización: no se distribuyen pesos GGUF ni safetensors cuantizados; sería necesario convertir el checkpoint `.pt` manualmente.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP32; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: el modelo no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que requiere el paquete propietario `rmsn_core` con la clase `ResonantMetriplecticSheafLM`. El despliegue estándar es mediante PyTorch y carga manual del state dict.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-350M-Depth20-SFT5k | 350M | no disponible | MIT | PyTorch `.pt` | HF, 0 descargas |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Amplia, ecosistema maduro |
| SmolLM2-360M | 362M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Amplia, integrado en transformers |
| Phi-3-mini | 3.800M | 4.096 tokens | MIT | safetensors, GGUF | Amplia |

La comparación con modelos de tamaño similar es desfavorable en madurez de ecosistema: RMSN no ofrece safetensors, no es compatible con `transformers` de forma nativa y no publica resultados en benchmarks estándar, a diferencia de SmolLM2-360M o Qwen2.5-0.5B. Su interés es exclusivamente de investigación arquitectónica.

## Limitaciones y advertencias

- El modelo requiere el paquete `rmsn_core` (no incluido en el repositorio de Hugging Face) para instanciar la arquitectura; sin él, el checkpoint no es utilizable.
- Los pesos se distribuyen en formato `.pt` con `weights_only=False`, lo que implica riesgos de seguridad al cargar pickles de origen no verificado.
- No se han publicado resultados en benchmarks estándar; las cifras de la model card son autoinformadas y no han sido replicadas de forma independiente.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validación externa.
- Idiomas soportados no especificados; el tokenizador Cosmo2 es mayoritariamente inglés, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación elevado en un modelo de 350M con SFT corto (5.000 pasos); no apto para producción sin evaluación adicional.
- Sesgos: no documentados, pero heredados previsiblemente de FineWeb-Edu.
- Licencia MIT permite uso comercial, pero la ausencia de benchmarks y de soporte técnico desaconseja su uso en entornos productivos.
- El ejemplo de inferencia de la model card solo predice un token siguiente, no genera secuencias completas; no se documenta el bucle de generación.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-350M-Depth20-SFT5k
- GitHub del proyecto: https://github.com/DuoNeural/RMSN
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Licencia MIT: https://opensource.org/licenses/MIT
- Cita (preprint, Zenodo): Caldwell, Jesse; Archon; Aura. "Resonant Metriplectic Sheaf Networks: A Unified Port-Hamiltonian Framework for Neural Language Modeling with Emergent Lyapunov Cascade Dynamics", DuoNeural Lab Preprints, 2026.
