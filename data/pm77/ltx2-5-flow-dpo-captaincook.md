# pm77/ltx2.5-flow-dpo-captaincook

## Resumen
Este repositorio contiene un adaptador LoRA para el transformer de generación de vídeo LTX-2.5 de Lightricks, entrenado con la técnica Flow-DPO (una variante de optimización por preferencias aplicada a modelos de difusión de flujo). El autor, pm77, lo publica como artefacto de un proyecto académico no comercial y lo marca explícitamente como experimental y sin evaluar. No es un modelo autónomo: requiere cargar el modelo base `Lightricks/LTX-2.5-Diffusers` y aplicar el adaptador encima.

El objetivo es alinear la generación de vídeo con preferencias humanas mediante pares de clips puntuados con VideoReward. El adaptador modifica únicamente las proyecciones de atención (self-attention de vídeo y cross-attention de texto) de los 48 bloques del transformer, con un total de 201,3 millones de parámetros entrenables en formato QLoRA de 4 bits.

Su relevancia es acotada: se trata de un experimento temprano sobre alineación de vídeo con DPO, con un conjunto de datos pequeño (202 pares) y sin métricas de calidad publicadas. Resulta útil como referencia metodológica o como punto de partida para reproducir Flow-DPO sobre LTX-2.5, no como componente listo para producción.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión de flujo (LTX-2.5, 48 bloques) |
| Parámetros totales | 201,3 M (solo el adaptador LoRA) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de 33 frames de contexto + 136 generados) |
| Tipos de cuantización | base congelada en 4-bit NF4 (QLoRA); LoRA en precisión estándar |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (fecha 11 de agosto de 2026, enmendada el 11 de noviembre de 2026) |
| Formato de pesos | safetensors (adaptador LoRA para diffusers) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre el transformer de LTX-2.5 en su variante destilada. Se entrenó con QLoRA: la base permanece congelada en 4 bits NF4 y se añaden matrices LoRA con r=64, alpha=128 y dropout 0 sobre `to_q/to_k/to_v/to_out.0` de la self-attention de vídeo (`attn1`) y de la cross-attention de texto (`attn2`) en los 48 bloques, sumando 201,3 M de parámetros.

El entrenamiento usa Flow-DPO (Liu et al., arXiv 2501.13918, ecuación 6) con β=2500 constante, t muestreado de U(0,1) y ruido compartido por par. Los datos provienen de generación best-of-4 (4 candidatos por paso de receta desde el mismo contexto de 33 frames, con semillas distintas), puntuados con VideoReward `overall_normalized`, tomando todos los pares con diferencia de puntuación >= 0,3. Se usaron las grabaciones Captain Cook 4D 1_25, 3_2, 7_2 y 8_15 (202 pares), dejando 12_16 como conjunto reservado. Los clips son de 33 frames de contexto más 136 generados, a 960x544 y 24 fps, con los frames de contexto limpios y excluidos de la pérdida. El flujo de audio se alimentó con ruido puro. Optimización con Adam, lr 5e-6, 5 actualizaciones de warmup, batch 12 (3x A100-40GB con acumulación x4) y 2 épocas (32 actualizaciones en total).

## Capacidades
- Modulación de la generación de vídeo de LTX-2.5 hacia las preferencias aprendidas de VideoReward (movimiento, coherencia y calidad percibida).
- Funciona como adaptador sobre el pipeline `LTX2ConditionPipeline` de diffusers mediante `load_lora_weights`.
- Generación de clips de 136 frames a partir de 33 frames de contexto, a 960x544 y 24 fps.
- Compatible con la base cuantizada en 4-bit NF4, que es el régimen con el que fue entrenado.
- No aporta capacidades nuevas de texto, código, tool calling, agentes ni multimodalidad más allá de las del modelo base.

## Casos de uso
- Investigación en alineación de vídeo: reproducir o comparar el efecto de Flow-DPO sobre LTX-2.5 usando los pares y la configuración publicados en `config.json` y `train_log.jsonl`.
- Docencia y proyectos académicos: sirve como ejemplo completo de un pipeline QLoRA + DPO aplicado a un transformer de difusión de vídeo.
- Experimentación con VideoReward: permite estudiar cómo se traduce una señal de recompensa automática en cambios cualitativos de los clips generados.
- Base para ampliar el conjunto de pares: el adaptador y su receta pueden reentrenarse con más grabaciones o con puntuaciones humanas en lugar de automáticas.
- Pruebas de sensibilidad al ruido y a la cuantización: al haberse entrenado contra la base NF4, permite analizar la interacción entre cuantización y alineación.
- Evaluación comparativa de adaptadores LoRA de vídeo: útil como referencia metodológica frente a otros adaptadores sobre el mismo modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que la precisión de preferencia durante el entrenamiento subió de ~0,38 a ~0,5-0,6, pero no se ha medido si las generaciones mejoran.

## Requisitos de hardware
- VRAM estimada: no disponible de forma exacta; el entrenamiento usó 3x A100-40GB, lo que sugiere que la inferencia del modelo base completo en 4 bits requiere al menos una GPU de gran capacidad.
- GPU recomendadas: A100-40GB o H100 para inferencia cómoda del pipeline completo; el adaptador en sí ocupa 0,8 GB.
- GPU de consumo: no confirmado; probablemente inviable en RTX 4090 (24 GB) con el transformer completo a 960x544 y 136 frames, aunque no hay dato publicado.
- Despliegue: diffusers (`LTX2ConditionPipeline` + `load_lora_weights`); no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pm77/ltx2.5-flow-dpo-captaincook | LoRA Flow-DPO sobre LTX-2.5 | 201,3 M (adaptador) | clips 33+136 frames | LTX-2.x Community License | Hugging Face, 0 descargas |
| Lightricks/LTX-2.5-Diffusers | Modelo base de vídeo | no disponible | no disponible | LTX-2.x Community License | Hugging Face (oficial) |
| Otros LoRA sobre LTX-2.5 | Adaptadores de vídeo | no disponible | no disponible | depende del autor | no disponible en la información |

## Limitaciones y advertencias
- Estado experimental: el autor declara que no se ha evaluado si las generaciones mejoran; la precisión de preferencia en entrenamiento solo alcanza ~0,5-0,6.
- Conjunto de datos muy pequeño (202 pares de 4 grabaciones), con riesgo alto de sobreajuste y de sesgo hacia el contenido específico de Captain Cook.
- No hay información sobre sesgos demográficos, culturales o de contenido; el modelo base y los datos de recompensa pueden introducirlos.
- Riesgo de alucinación visual y de artefactos temporales inherente a la generación de vídeo; no cuantificado.
- Licencia restrictiva: entidades con ingresos anuales >= 10 millones de USD deben obtener licencia comercial de Lightricks; el adaptador se distribuye solo bajo la LTX-2.x Community License y debe propagarse con copia completa del acuerdo.
- Obligación de no eliminar ni eludir mecanismos de seguridad, marca de agua, metadatos o procedencia del modelo base, y de declarar el contenido como generado por máquina.
- No es una versión oficial de Lightricks ni está respaldado por la empresa.
- No hay idiomas declarados ni contexto de texto documentado más allá del propio del modelo base.

## Enlaces
- Hugging Face: https://huggingface.co/pm77/ltx2.5-flow-dpo-captaincook
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5-Diffusers
- Paper de Flow-DPO: https://arxiv.org/abs/2501.13918
- Licencia LTX-2.x Community License Agreement: incluida como `LICENSE` en el repositorio
- LTX Acceptable Use Policy: incluida como `LTX-Acceptable-Use-Policy.pdf` en el repositorio
