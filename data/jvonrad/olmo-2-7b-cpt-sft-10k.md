# jvonrad/OLMo-2-7B-CPT-SFT-10k

## Resumen

El modelo `jvonrad/OLMo-2-7B-CPT-SFT-10k` es un adaptador LoRA (r=64, alpha=128) diseñado para mejorar el recall factual multilingüe sobre el checkpoint `jvonrad/olmo-2-7b-finetranslations`, que a su vez parte de la arquitectura OLMo-2-7B de AI2. Desarrollado por Jonathan von Rad, este adaptador forma parte de un estudio controlado que compara diferentes objetivos de entrenamiento (SFT, DCO, CM-Align y GRPO) sobre los mismos 10 000 hechos del dataset `PolyFact-Clean`, abarcando 12 idiomas. El objetivo principal es evaluar cómo distintas estrategias de aprendizaje afectan a la consistencia cross-lingual en la recuperación de información factual.

La relevancia de este modelo radica en su contribución a la investigación sobre alineación multilingüe y consistencia factual, un área crítica para aplicaciones de generación de texto en entornos globales. Al ser un adaptador ligero (0,3 GB) sobre un modelo base de 7B, permite experimentar con técnicas de fine-tuning eficientes sin necesidad de entrenar un modelo completo desde cero. La licencia Apache-2.0 facilita su uso tanto en investigación como en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2) con adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA (r=64, alpha=128) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn (12 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en OLMo-2-7B, un transformer decoder-only desarrollado por AI2, sobre el cual se aplicó un fine-tuning previo en traducciones (checkpoint `jvonrad/olmo-2-7b-finetranslations`). Sobre ese checkpoint se entrena el adaptador LoRA con un objetivo de SFT (supervised fine-tuning) utilizando 10 000 hechos del dataset `PolyFact-Clean`, distribuidos en 12 idiomas. No se proporcionan detalles sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset, pero el diseño del estudio garantiza que todos los métodos comparados ven exactamente los mismos datos, lo que permite aislar el efecto del objetivo de aprendizaje.

La innovación principal no reside en la arquitectura, sino en el diseño experimental: el adaptador se entrena con un conjunto de hechos multilingües y se evalúa su capacidad para recordar esos hechos de forma consistente en todos los idiomas. Esto es relevante para investigar cómo los modelos multilingües pueden alinear representaciones factuales entre lenguas, un problema abierto en la comunidad.

## Capacidades

- Generacion de texto en 12 idiomas (en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn).
- Recuperacion de hechos factuales con respuesta de formato cerrado (closed-book prompt).
- Consistencia cross-lingual: capacidad de responder correctamente a un mismo hecho en todos los idiomas soportados (medida por TotCons).
- Soporte de generacion de texto libre (free-form) en 17 idiomas, aunque el entrenamiento solo cubre 12 (los 5 adicionales se consideran held-out).
- No se mencionan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Evaluacion de consistencia factual multilingue: el modelo puede utilizarse como punto de referencia para medir la coherencia de respuestas factuales en sistemas de QA multilingues, gracias a su entrenamiento especifico en hechos cross-linguales.
- Verificacion de datos en varios idiomas: dado su enfoque en recall factual, puede emplearse para comprobar si un hecho dado es recordado correctamente en diferentes lenguas, util en tareas de validacion de contenido.
- Generacion de contenido localizado: al estar entrenado en 12 idiomas, puede generar respuestas factuales en esos idiomas, aunque su rendimiento en generacion libre es limitado (ver benchmarks).
- Investigacion en fine-tuning eficiente: el adaptador LoRA sirve como ejemplo de como aplicar SFT sobre un modelo base con recursos limitados, util para estudios comparativos de metodos de alineacion.
- Base para experimentos de RL: al ser parte de un estudio controlado, puede usarse como baseline para comparar con otros adaptadores entrenados con DCO, CM-Align o GRPO.
- Pruebas de robustez cross-lingual: permite analizar como un modelo de 7B maneja la transferencia de conocimiento factual entre idiomas, informando el diseno de modelos multilingues mas robustos.

## Benchmarks y rendimiento

La model card proporciona una tabla de evaluacion comparando este adaptador con el modelo base (`jvonrad/olmo-2-7b-finetranslations`). Los resultados se obtienen sobre el test split de PolyFact-Clean (2039 hechos) con scoring por log-verosimilitud normalizada por bytes; TotCons mide la fraccion de hechos respondidos correctamente en los 12 idiomas; RankC es RankC@4 (floor 9.02, chance 37.68); KLAR es generacion libre sobre 17 idiomas (7 vistos en entrenamiento, 10 held-out).

| Modelo | PolyFact | TotCons | RankC | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (`jvonrad/olmo-2-7b-finetranslations`) | 44.37 | 2.80 | 58.56 | 17.49 | 42.75 | 17.02 | 8.32 |
| **Este modelo** | 50.02 | 2.84 | 58.34 | 18.17 | 43.48 | 15.57 | 7.75 |

El adaptador SFT mejora el recall factual en PolyFact (+5.65 puntos) y en BMLAMA-53 (+0.68) y G-MMLU-Lite (+0.73), pero muestra una ligera caida en RankC (-0.22) y en generacion libre (KLAR seen -1.45, held-out -0.57). La consistencia total (TotCons) apenas varia (+0.04), lo que sugiere que el SFT mejora el recall general pero no la consistencia cross-lingual.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0,3 GB) y se carga sobre el modelo base de 7B.
- Para inferencia en bfloat16, el modelo base requiere aproximadamente 14-16 GB de VRAM (estimacion tipica para 7B; no se proporcionan datos oficiales).
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o superiores.
- En consumer GPUs con 16 GB o mas es posible ejecutar el modelo con cuantizacion (p.ej. 4-bit) combinando el adaptador con el base cuantizado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con transformers y vLLM (cargando el base y luego el adaptador), o exportar a GGUF para usar con llama.cpp/Ollama (aunque no se proporciona un archivo GGUF especifico).
- No se dispone de datos de latencia o throughput medidos para este modelo.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores comparables en la misma categoria (mismo tamaño y tarea). El modelo se compara directamente con su base en la tabla de benchmarks, pero no se ofrecen resultados de otros metodos (DCO, CM-Align, GRPO) en la informacion disponible. Se puede mencionar que existen otros adaptadores del mismo autor (como `jvonrad/olmo-2-7b-wikifact-sft`) pero no se proporcionan sus metricas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un modelo de 7B entrenado principalmente en datos factuales, puede reflejar sesgos presentes en los datos de entrenamiento originales de OLMo-2.
- Riesgo de alucinacion: aunque el entrenamiento se centra en recall factual, la generacion libre (KLAR) muestra un rendimiento bajo (15.57 en seen, 7.75 en held-out), lo que indica que no es fiable para generar texto abierto sin restricciones.
- Limitaciones de contexto: la longitud de contexto no se especifica; se asume la del modelo base OLMo-2 (probablemente 4096 tokens, pero no confirmado).
- Limitaciones de idioma: el entrenamiento cubre 12 idiomas, pero la evaluacion en generacion libre incluye 17; los idiomas held-out tienen un rendimiento significativamente inferior (7.75 vs 15.57).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base (tambien Apache-2.0), por lo que no hay restricciones adicionales conocidas.
- Caveat de produccion: al ser un adaptador de investigacion, no se recomienda su uso directo en aplicaciones criticas sin una evaluacion adicional en el dominio objetivo.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/jvonrad/OLMo-2-7B-CPT-SFT-10k)
- [HuggingFace - modelo base](https://huggingface.co/jvonrad/olmo-2-7b-finetranslations)
- [HuggingFace - dataset PolyFact-Clean](https://huggingface.co/datasets/jvonrad/PolyFact-Clean)
- [HuggingFace - OLMo-2-1124-7B (modelo original de AI2)](https://huggingface.co/allenai/OLMo-2-1124-7B)
- [GitHub - repositorio OLMo de AI2](https://github.com/allenai/OLMo)
- [Sitio web de OLMo](https://allenai.org/olmo)
