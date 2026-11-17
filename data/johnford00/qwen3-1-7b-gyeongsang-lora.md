# johnford00/qwen3-1.7b-gyeongsang-lora

## Resumen

`johnford00/qwen3-1.7b-gyeongsang-lora` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base Qwen/Qwen3-1.7B, publicado por el usuario johnford00 en Hugging Face. El nombre sugiere una especialización en el dialecto gyeongsang (경상도 사투리), una de las variantes regionales del coreano habladas en el sureste de la península. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que requiere cargar Qwen3-1.7B como base para su uso.

El modelo hereda la arquitectura, el contexto y las capacidades del Qwen3-1.7B original, un transformer denso de 1.700 millones de parámetros desarrollado por Alibaba Qwen. La contribución del adaptador es un ajuste fino supervisado orientado a conversación, presumiblemente para reproducir el registro dialectal gyeongsang. La model card publicada es la plantilla por defecto de Hugging Face sin rellenar, por lo que no hay documentación técnica del proceso de entrenamiento, datos, hiperparámetros ni evaluación.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo de adaptación dialectal de bajo coste sobre un modelo pequeño, útil para quienes investigan fine-tuning lingüístico regional en coreano. No obstante, la ausencia total de documentación, evaluación y licencia explícita lo convierte en un artefacto de investigación más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | Adaptador: no disponible (repo de 0,1 GB); base: 1.700 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre sugiere coreano, dialecto gyeongsang) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3. El adaptador en sí es un conjunto de matrices LoRA de bajo rango inyectadas en las capas del modelo base, entrenadas con SFT (supervised fine-tuning) mediante la librería TRL, según indican las etiquetas del repositorio. La versión de PEFT utilizada es 0.21.3.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el rango de las matrices LoRA, la tasa de aprendizaje ni si se aplicaron técnicas adicionales como DPO o RLHF. La model card no documenta ningún detalle técnico del proceso. La única inferencia razonable, a partir del nombre del repositorio, es que el ajuste busca especializar al modelo en el dialecto gyeongsang del coreano, probablemente mediante pares conversacionales en ese registro.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Presunta especialización en el dialecto gyeongsang del coreano (no verificada ni documentada).
- Razonamiento, código y matemáticas: capacidades heredadas del base, no evaluadas en el adaptador.
- Tool calling / function calling: no documentado para el adaptador; depende del soporte del base.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el ajuste podría degradar el rendimiento en otros idiomas respecto al base.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en adaptación dialectal del coreano: el adaptador sirve como punto de partida para estudiar cómo el fine-tuning LoRA modifica el registro lingüístico de un modelo pequeño hacia una variante regional concreta.
- Generación de diálogos sintéticos en gyeongsang: útil para aumentar corpus de entrenamiento o evaluación de sistemas de PLN específicos del dialecto, siempre que se valide la calidad de la salida.
- Prototipado de asistentes conversacionales regionales: para demos internas de chatbots que respondan en registro dialectal, con la advertencia de que no hay evaluación publicada.
- Experimentos de comparación base vs. adaptador: permite medir empíricamente el efecto del LoRA sobre el estilo y la coherencia en coreano estándar frente a dialectal.
- Fine-tuning adicional sobre el adaptador: al ser un módulo PEFT, puede combinarse o continuar entrenándose con otros datasets coreanos en entornos con recursos limitados.
- Docencia y formación: ejemplo didáctico de pipeline PEFT + TRL para ajuste de modelos pequeños en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade un coste marginal sobre el modelo base. Qwen3-1.7B en bf16 requiere aproximadamente 3,5-4 GB de VRAM; en cuantización de 8 bits, en torno a 2 GB; en 4 bits, alrededor de 1,2-1,5 GB (estimaciones para el base, no verificadas para el adaptador).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegue a mayor escala.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares, incluso en fp16/bf16.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte de LoRA), llama.cpp/Ollama solo si se fusiona y convierte el adaptador a GGUF, TGI con adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| johnford00/qwen3-1.7b-gyeongsang-lora | 1,7 B (base) + LoRA | No disponible | No disponible | safetensors (PEFT) | Adaptador dialectal sin documentar |
| Qwen/Qwen3-1.7B | 1,7 B | No disponible en esta ficha | No disponible en esta ficha | safetensors | Modelo base oficial |
| Adaptadores LoRA dialectales comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card sin rellenar: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no especificada: riesgo legal para uso comercial; debe consultarse la licencia del modelo base Qwen3-1.7B y contactar con el autor antes de cualquier despliegue productivo.
- Sin evaluación publicada: no hay evidencia de que el adaptador mejore el dialecto gyeongsang ni de que preserve las capacidades del base.
- Riesgo de degradación del coreano estándar y de otros idiomas tras el ajuste dialectal.
- Riesgo de alucinación heredado del modelo base, potencialmente amplificado por un dataset de ajuste pequeño o no verificado.
- Sesgos dialectales y regionales: el registro gyeongsang puede asociarse a estereotipos; el modelo podría reproducirlos.
- Sin garantías de soporte de tool calling ni de comportamiento agéntico tras el ajuste.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-17): posible inconsistencia que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/johnford00/qwen3-1.7b-gyeongsang-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
