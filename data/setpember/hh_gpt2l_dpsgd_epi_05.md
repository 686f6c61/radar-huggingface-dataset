# Setpember/HH_GPT2L_DPSGD_epi_05

## Resumen

HH_GPT2L_DPSGD_epi_05 es un checkpoint de investigación publicado por Fengwei Tian (Universidad de Arizona) en el marco del artículo PROPS: Progressively Private Self-alignment of Large Language Models (TMLR 2025). Se trata de un ajuste por DPO (Direct Preference Optimization) sobre GPT-2 Large (774 M de parámetros) utilizando DP-SGD (Descenso de Gradiente Estocástico con Privacidad Diferencial) con un presupuesto de privacidad de ε = 0,5 y δ = 1e-10, aplicado sobre el conjunto de datos Anthropic HH-RLHF. El objetivo es servir como línea base en la investigación sobre alineamiento con garantías formales de privacidad a nivel de ejemplo de entrenamiento.

El modelo no introduce ninguna innovación arquitectónica: es un transformer decoder-only de la familia GPT-2, con 774 M de parámetros, 36 capas y una ventana de contexto de 1024 tokens. Su relevancia es exclusivamente metodológica: demuestra que es posible aplicar DPO con DP-SGD sobre preferencias humanas manteniendo un ε bajo (0,5), lo que lo convierte en una referencia útil para quienes investigan la tensión entre alineamiento y privacidad diferencial.

No es un modelo destinado a producción ni a uso comercial como asistente: el propio autor indica que no está ajustado para seguridad y que no debe emplearse en productos. Su valor está en la reproducibilidad de los experimentos del paper y en la comparación de metodologías de alineamiento privado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parámetros totales | 774 M (GPT-2 Large) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2) |
| Tipos de cuantización | no disponible (el checkpoint se distribuye en `policy.pt`; admite cuantización posterior con herramientas estándar) |
| Idiomas soportados | no disponible (el modelo base GPT-2 es principalmente inglés) |
| Licencia | MIT |
| Formato de pesos | `policy.pt` (state dict de PyTorch, compatible con `load_state_dict` sobre GPT-2 Large) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 Large: un transformer decoder-only con 36 capas, 20 cabezas de atención, dimensión de embedding de 1280 y 774 M de parámetros. No hay modificaciones estructurales respecto al modelo base de OpenAI; el checkpoint es un state dict que debe cargarse sobre `openai-community/gpt2-large`.

El entrenamiento consiste en un ajuste DPO sobre el dataset Anthropic HH-RLHF (preferencias humanas sobre respuestas de asistentes) con DP-SGD configurado para proteger cada ejemplo de entrenamiento completo, con ε = 0,5 y δ = 1e-10. Según el paper PROPS, este checkpoint corresponde a una de las líneas base del estudio, no a la propuesta principal del método (alineamiento progresivo auto-supervisado). El código de referencia está en el repositorio FTian-UArizona/PROPS y el DPO se implementa siguiendo el código de referencia de Eric Mitchell. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO más allá de la descrita.

## Capacidades

- Generación de texto autoregresiva en inglés (heredada de GPT-2 Large).
- Alineamiento por preferencias humanas mediante DPO sobre HH-RLHF, orientado a respuestas más acordes con las preferencias anotadas.
- Entrenamiento con privacidad diferencial a nivel de ejemplo (DP-SGD), lo que permite estudiar la fuga de información y el equilibrio privacidad-utilidad.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base GPT-2 está entrenado mayoritariamente en inglés.
- No incluye modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Investigación sobre privacidad diferencial en alineamiento: reproducir los experimentos del paper PROPS y comparar la línea base DP-SGD con el método propuesto, midiendo la degradación de utilidad a distintos valores de ε.
- Estudio de la fuga de información en modelos alineados: utilizar el checkpoint para auditar qué información de los ejemplos de HH-RLHF puede extraerse con ataques de membresía o de inversión, dado el presupuesto formal de privacidad.
- Evaluación de DPO bajo restricciones de privacidad: comparar la calidad de las respuestas frente a un DPO no privado sobre el mismo dataset y el mismo modelo base, cuantificando el coste de ε = 0,5.
- Docencia y formación en privacidad diferencial aplicada a LLM: el tamaño reducido (774 M) y la licencia MIT permiten ejecutar experimentos completos en hardware modesto y con código abierto.
- Reproducibilidad de resultados académicos: servir como artefacto verificable para revisores y para trabajos que necesiten una línea base privada sobre GPT-2 Large con HH-RLHF.
- Desarrollo de metodologías de alineamiento auto-supervisado: usar el checkpoint como punto de partida o comparación en pipelines de self-alignment con garantías de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 4-5 GB en total con contexto completo de 1024 tokens).
- VRAM estimada en FP16/BF16: aproximadamente 1,6 GB para pesos, con un total práctico de 2-3 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060 (12 GB), RTX 4060, RTX 4090, así como A100 o H100 para experimentación a mayor escala.
- Cabe holgadamente en GPU consumer, incluidas GTX 1660 (6 GB) o superiores con cuantización.
- Opciones de despliegue: transformers con PyTorch (carga manual del state dict), llama.cpp u Ollama tras conversión a GGUF, vLLM y TGI tras convertir el checkpoint a formato estándar de transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU consumer, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Alineamiento | Privacidad | Licencia |
|---|---|---|---|---|---|
| HH_GPT2L_DPSGD_epi_05 | 774 M | 1024 | DPO sobre HH-RLHF | DP-SGD, ε = 0,5 | MIT |
| GPT-2 Large (base) | 774 M | 1024 | Sin alineamiento | Ninguna | MIT |
| DPO estándar sobre GPT-2 Large + HH-RLHF | 774 M | 1024 | DPO sobre HH-RLHF | Ninguna | MIT (según implementación) |
| Método PROPS (propuesta del paper) | no disponible | no disponible | Alineamiento progresivo auto-supervisado | Privacidad progresiva | no disponible |

La comparación relevante es frente al GPT-2 Large sin ajustar y frente a un DPO no privado sobre el mismo dataset: el checkpoint aquí descrito se sitúa como línea base privada, y el método PROPS como propuesta principal del paper. No se dispone de cifras de rendimiento comparativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no está ajustado para seguridad y que no debe usarse en productos.
- Sesgos conocidos: hereda los sesgos de GPT-2 Large y de los datos de Anthropic HH-RLHF, sin filtrado adicional documentado.
- Riesgo de alucinación: alto, propio de un modelo de 774 M sin técnicas específicas de mitigación.
- Ventana de contexto limitada a 1024 tokens, insuficiente para muchas aplicaciones reales.
- Idiomas: no documentados; el modelo base es predominantemente inglés, con rendimiento limitado en castellano.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero el propio autor desaconseja el uso en producción por motivos de seguridad y calidad.
- El checkpoint se distribuye como `policy.pt` (state dict), no como safetensors ni GGUF; requiere un paso de conversión para muchos pipelines de despliegue.
- El presupuesto de privacidad ε = 0,5 con δ = 1e-10 es formalmente fuerte, pero la utilidad del modelo puede verse degradada frente a un DPO no privado; no se aportan métricas de esa degradación en la información disponible.
- Sin datos publicados de benchmarks, latencia ni throughput que permitan validar su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Setpember/HH_GPT2L_DPSGD_epi_05
- Modelo base GPT-2 Large: https://huggingface.co/openai-community/gpt2-large
- Dataset Anthropic HH-RLHF: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Paper PROPS (arXiv): https://arxiv.org/abs/2508.06783
- Repositorio de código PROPS: https://github.com/FTian-UArizona/PROPS
- Código de referencia DPO: https://github.com/eric-mitchell/direct-preference-optimization
- GitHub del autor: https://github.com/FTian-UArizona
