# NaturalScale/LoopTitan-MoE12-2xExperts-2.6B-A0.2B-Muon

## Resumen

LoopTitan-MoE12-2xExperts-2.6B-A0.2B-Muon es un modelo de lenguaje base entrenado desde cero por NaturalScale (en colaboración con el proyecto LoopTitan del Data Mining Lab), publicado como parte de la fase 1 de la familia LoopTitan. Se trata de un transformer con mezcla de expertos (MoE) de 12 capas y anchura 1280, con 128 expertos por capa y tamaño oculto de experto de 432. Almacena 2,59 mil millones de parámetros sin contar los embeddings y 2,98 mil millones incluyendo la entrada de embedding y la cabeza de salida (la cifra que muestra Hugging Face), con solo 0,20 mil millones de parámetros activos por token.

El modelo no está ajustado por instrucciones (no instruction tuned): es un modelo base de generación de texto pensado para servir como referencia experimental dentro de un estudio sistemático de diseños de arquitectura MoE. Concretamente, esta variante es el diseño 8 de 8 de la fase 1, identificado en el paper como "MoE-12 + 2× experts", y se entrenó con el optimizador Muon. El objetivo del proyecto es medir cómo distintas decisiones de diseño (expertos más finos, mayor profundidad, disposición de expertos, desenrollado, bucles, etc.) afectan a la calidad del modelado del lenguaje medida en bits por byte (BPB).

Su relevancia actual es fundamentalmente de investigación: proporciona un punto de comparación reproducible y con licencia MIT para estudiar el efecto del número de expertos y del optimizador (AdamW frente a Muon) en arquitecturas MoE de escala pequeña y activación reducida (0,2B parámetros activos), lo que lo hace interesante para quienes trabajan en eficiencia de inferencia y en el diseño de mezclas de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 12 capas, anchura 1280, 128 expertos por capa, tamaño oculto de experto 432 |
| Parametros totales | 2.981.564.160 (2,98B, incluyendo embeddings y cabeza de salida); 2,59B sin embeddings |
| Parametros activos | 0,20B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con custom_code, librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE estándar pero con el doble de expertos respecto al diseño de referencia: 12 capas a anchura 1280, 128 expertos por capa y un tamaño oculto de experto de 432. Esta configuración mantiene el número de parámetros activos por token en torno a 0,20B, lo que reduce el coste computacional de inferencia frente a un modelo denso de tamaño equivalente. El nombre del checkpoint indica que se entrenó con el optimizador Muon, y la model card lo sitúa como el diseño 8 de 8 de la fase 1, en la que cada diseño se entrenó tanto con AdamW como con Muon para comparar ambos optimizadores.

Los datos de entrenamiento provienen del dataset `mlfoundations/dclm-baseline-1.0-parquet` (DCLM baseline). No se especifica en la información disponible el número exacto de tokens vistos, la composición detallada del dataset ni si hubo etapas de RLHF o DPO; al tratarse de un modelo base, no se indica ajuste por instrucciones. La innovación técnica destacable es el propio estudio comparativo de diseños MoE y el uso de Muon como optimizador, que en este diseño concreto reduce el BPB de test en 9,85 mBPB respecto al MoE estándar entrenado con Muon.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje.
- Modelado de lenguaje y estimación de probabilidad de secuencias (métrica BPB sobre DCLM).
- Razonamiento y conocimiento general derivados del preentrenamiento, sin ajuste específico.
- Soporte de tool calling / function calling: no disponible (modelo base, sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: no documentadas en la información disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas MoE: sirve como punto de referencia reproducible para estudiar el efecto del número de expertos y del optimizador Muon frente a AdamW en modelos de escala pequeña.
- Experimentos de eficiencia de inferencia: con 0,20B parámetros activos por token, es adecuado para medir latencia y throughput en despliegues con activación reducida.
- Fine-tuning como modelo base: al ser un modelo base con licencia MIT, puede ajustarse para tareas concretas (clasificación, generación de dominio) partiendo de un checkpoint preentrenado.
- Evaluación comparativa de optimizadores: permite reproducir las comparaciones de BPB del paper en entornos propios sobre DCLM.
- Generación de texto en investigación lingüística: útil para estudiar distribuciones de probabilidad y perplejidad en corpus de referencia.
- Desarrollo de pipelines de evaluación de modelos: su tamaño manejable y su licencia permisiva lo hacen apto para integrarse en baterías de tests automáticos de modelado de lenguaje.
- Prototipado educativo: permite experimentar con arquitecturas MoE en hardware modesto gracias a su reducido número de parámetros activos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor |
|---|---:|
| Test BPB | 0,964525 |
| Validation BPB | 0,966379 |
| Delta test vs MoE estándar (Muon) | -9,85 mBPB |

Comparativa de los 8 diseños de la fase 1 frente al MoE estándar, en mBPB de test (menor es mejor):

| Diseño | AdamW | Muon |
|---|---:|---:|
| MoE estándar | +0,0 | +0,0 |
| Expertos más finos | -4,2 | -0,9 |
| Más profundo y estrecho | -6,9 | -4,2 |
| Disposición de expertos | -5,9 | -3,4 |
| Desenrollado | -8,9 | -3,3 |
| El bucle | -9,0 | -3,7 |
| Una visita más | -14,8 | -12,2 |
| El doble de expertos (este modelo) | -14,3 | -9,9 |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): en torno a 6 GB solo para pesos (2,98B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: aproximadamente 3 GB para pesos; en 4 bits, en torno a 1,5-2 GB (estimaciones, ya que no se documentan cuantizaciones oficiales).
- GPU recomendadas: para bf16, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100); para cuantización 4/8 bits, GPUs consumer de 8-12 GB podrían ser suficientes.
- Cabe en GPU consumer: sí, especialmente con cuantización; en bf16 requiere al menos 8-12 GB de VRAM según el contexto.
- Opciones de despliegue: transformers (librería indicada, con custom_code); vLLM, llama.cpp, Ollama y TGI no están documentados como soportados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-MoE12-2xExperts-2.6B-A0.2B-Muon | 2,98B | 0,20B | no disponible | MIT | Modelo base de investigación, diseño 8 de 8 de la fase 1 |
| MoE estándar de la fase 1 (referencia) | no disponible | no disponible | no disponible | MIT (proyecto LoopTitan) | Punto de comparación del paper; BPB de test superior en 9,85 mBPB |
| Otros diseños de la fase 1 (p. ej. "una visita más") | no disponible | no disponible | no disponible | MIT | Mejor BPB de test en la tabla (-14,8 AdamW / -12,2 Muon) |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni está alineado para uso conversacional.
- Riesgo de alucinación y de generar contenido inexacto o sesgado, propio de un modelo preentrenado sin etapas de RLHF/DPO.
- No se documentan los idiomas soportados ni la composición del dataset, por lo que el comportamiento multilingüe es incierto.
- La longitud de contexto no está especificada; no debe asumirse una ventana larga.
- Los resultados de BPB son declarados por el autor y no están verificados.
- Aunque la licencia es MIT y permite uso comercial, la falta de ajuste y de evaluación de seguridad desaconseja su uso directo en producción sin fine-tuning y validación adicionales.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que refleja una adopción aún nula.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-2xExperts-2.6B-A0.2B-Muon
- Página del proyecto LoopTitan: https://datamllab.github.io/LoopTitan/
- Repositorio en GitHub: https://github.com/datamllab/LoopTitan
- Documentación: https://datamllab.github.io/LoopTitan/docs/
- Colección de modelos de la fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Receta de referencia del MoE estándar: https://github.com/datamllab/LoopTitan/blob/main/re
