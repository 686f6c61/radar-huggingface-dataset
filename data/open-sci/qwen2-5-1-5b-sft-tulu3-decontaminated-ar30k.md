# open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-ar30k

## Resumen

open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-ar30k es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B, publicado por el usuario open-sci en HuggingFace. El modelo parte de un checkpoint intermedio de la comunidad (ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated), que a su vez deriva del Qwen2.5-1.5B de Alibaba. El entrenamiento se realizó con LLaMA-Factory sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, un conjunto orientado a razonamiento con formato ShareGPT.

La relevancia de este modelo es acotada: se trata de un experimento de ajuste fino de un modelo pequeño (1.543 millones de parámetros) sobre datos de razonamiento, sin model card detallada ni resultados de evaluación publicados. El nombre del repositorio sugiere un entrenamiento adicional sobre datos en árabe (sufijo "ar30k"), aunque la model card no lo confirma explícitamente. Es un artefacto útil para quien quiera reproducir o inspeccionar pipelines de SFT con LLaMA-Factory sobre Qwen2.5, más que un modelo listo para producción.

La arquitectura subyacente es un transformer decoder-only de Qwen2.5 con 1.500 millones de parámetros y ventana de contexto de 32.768 tokens (característica estándar de la familia Qwen2.5). No obstante, ni el contexto efectivo tras el ajuste ni los idiomas soportados están documentados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con atención SDPA |
| Parametros totales | 1.543.321.088 (1,54 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información del ajuste; el modelo base Qwen2.5-1.5B soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; requiere consultar los términos del Qwen2.5 original) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 3,1 GB |
| Framework de entrenamiento | LLaMA-Factory, Transformers 4.57.3, PyTorch 2.10.0+cu128 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) de un transformer decoder-only de la familia Qwen2.5 con 1.543.321.088 parámetros. El checkpoint de partida es ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated, que ya había sido ajustado previamente sobre datos de Tulu 3 decontaminados. Este segundo ajuste se realizó sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, en formato ShareGPT, orientado a tareas de razonamiento.

Los hiperparámetros de entrenamiento están documentados: learning rate de 4e-05, batch total de 128 (batch size 1 por dispositivo, 32 dispositivos, 4 pasos de acumulación de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10 %, y 5 épocas. El entrenamiento se ejecutó en un entorno multi-GPU (32 dispositivos) con seed 42. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores. La model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de evaluación.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del ajuste SFT sobre datos ShareGPT.
- Razonamiento y resolución de problemas, presumiblemente reforzado por el dataset AceReason-1.1-SFT-30k.
- Soporte de tool calling / function calling: no documentado en la información disponible; el modelo base Qwen2.5 lo soporta, pero no se confirma que se conserve tras este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el sufijo "ar30k" del nombre sugiere datos en árabe, pero no está confirmado.
- Modo thinking explícito, visión o audio: no disponible.
- Integración con text-generation-inference (TGI) y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Investigación en ajuste fino de modelos pequeños: sirve como referencia reproducible para estudiar el efecto de SFT sobre Qwen2.5-1.5B con datos de razonamiento, dado que los hiperparámetros están documentados.
- Experimentos de razonamiento en modelos de 1,5B: útil para evaluar hasta qué punto un modelo pequeño puede mejorar en tareas de razonamiento tras SFT con AceReason, en entornos con recursos limitados.
- Generación de texto conversacional ligera: puede desplegarse en entornos con poca VRAM para tareas de chat simple, siempre que se valide la calidad empíricamente.
- Base para ajustes posteriores (DPO, RLHF): al ser un checkpoint intermedio de una cadena de ajustes, puede servir como punto de partida para nuevas etapas de alineamiento.
- Prototipado rápido con TGI: los tags indican compatibilidad con text-generation-inference, lo que facilita desplegarlo como endpoint para pruebas internas.
- Estudio de contaminación de datos: el nombre del checkpoint base ("decontaminated") sugiere que el pipeline está diseñado para evitar filtraciones de benchmarks, lo que lo hace útil para investigar metodologías de decontaminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del repositorio declara una entrada (`sft__AceReason-1-1-SFT-30k-sharegpt-hf__Qwen2-5-1-5-159e93f2__sdpa-qwen-steps__Qwen2.5-34414c3e`) pero con la lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (estimación práctica de 4-6 GB para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 1,6-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,8-1,2 GB para pesos.
- GPU recomendadas: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y cualquier A100/H100. También puede ejecutarse en GPUs consumer de 8 GB con cuantización.
- Despliegue: compatible con transformers y text-generation-inference (según tags). Para cuantización GGUF sería necesario convertir los pesos, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-ar30k | 1,54B | no disponible (base: 32.768) | other | HuggingFace, safetensors |
| ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated (modelo base) | 1,54B | no disponible (base: 32.768) | no disponible | HuggingFace |
| Qwen/Qwen2.5-1.5B (modelo original) | 1,54B | 32.768 | Apache 2.0 (según familia Qwen2.5) | HuggingFace, GGUF, múltiples formatos |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | HuggingFace, GGUF, Ollama |

La comparación con el modelo original Qwen2.5-1.5B-Instruct es la más relevante: este ajuste no documenta mejoras medibles sobre él, y carece de la licencia clara y el ecosistema de cuantizaciones del modelo oficial. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni resultados de validación, ni métricas de pérdida publicadas. No es posible afirmar que el ajuste mejore al modelo base.
- Model card incompleta: las secciones de descripción, usos previstos y datos de entrenamiento indican "More information needed". No se documenta la composición del dataset AceReason-1.1-SFT-30k-sharegpt-hf.
- Licencia "other": no se especifican los términos exactos. Es imprescindible revisar la licencia del Qwen2.5 original y del checkpoint intermedio antes de cualquier uso comercial.
- Riesgo de alucinación: inherente a los modelos de 1,5B parámetros; sin evaluación específica no puede cuantificarse.
- Sesgos: no documentados. Al desconocerse la composición del dataset de ajuste, no es posible evaluar sesgos introducidos.
- Idiomas: no confirmados. El sufijo "ar30k" sugiere datos en árabe, pero no hay evidencia en la model card.
- Contexto efectivo tras el ajuste: desconocido; aunque el base soporta 32.768 tokens, el ajuste podría haber alterado el comportamiento en contextos largos.
- Cadena de ajustes opaca: el modelo deriva de un checkpoint de la comunidad sin documentación pública detallada, lo que dificulta la trazabilidad.
- No apto para producción sin validación previa: por la falta de evaluación y de licencia clara, no debería desplegarse en entornos críticos sin pruebas exhaustivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated
- Modelo original Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
