# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch06

## Resumen

`g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch06` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (*Task of Fictitious Unlearning*). El modelo aplica una técnica de *machine unlearning* denominada IHL (*Input embeddings and LM Head* reset) con el objetivo de olvidar el subconjunto `forget10` de TOFU, es decir, 10 autores ficticios cuyo conocimiento se pretende eliminar del modelo.

La propuesta técnica es concreta: reinicializar los embeddings de entrada y la cabeza de lenguaje (LM head) desde los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer provenientes del modelo ajustado con TOFU. Sobre esa base se aplica una pérdida combinada de token IHL sobre el conjunto de olvido más una entropía cruzada (CE) ponderada con factor 1,0 sobre el conjunto de retención, durante 6 de las 20 épocas previstas.

Se trata de un artefacto de investigación con 1.418 millones de parámetros, licencia Apache 2.0 y soporte exclusivo de inglés. No está pensado como modelo de producción, sino como evidencia experimental dentro del estudio del olvido selectivo en modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`, un transformer decoder-only de 1.418 millones de parámetros orientado originalmente a generación de código y texto educativo. El checkpoint parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino sobre el benchmark TOFU, y aplica una intervención de *unlearning*: los embeddings de entrada y la LM head se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se conservan del modelo ajustado con TOFU.

El procedimiento de entrenamiento combina una pérdida de token IHL sobre el conjunto de olvido (`forget10`) con una entropía cruzada estándar ponderada con coeficiente 1,0 sobre el conjunto de retención. El checkpoint corresponde a la época 6 de 20, por lo que representa un estado intermedio del proceso de desaprendizaje. El autor indica que se trata de un modelo completo e independiente ("standalone full model checkpoint") y remite a `ihl_manifest.json` para detalles del procedimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones `forget10` y `retain`, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general.
- Generación de código y resolución de problemas matemáticos elementales (capacidades originales de Phi-1.5).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de visión, audio ni modo *thinking*.
- Su función principal es servir como artefacto experimental de *unlearning*, no como asistente generalista.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: el checkpoint permite medir la eficacia del reset de embeddings y LM head sobre la partición `forget10` de TOFU, comparándolo con otros métodos de desaprendizaje en la misma base.
- Investigación sobre retención de conocimiento: al mantener CE sobre `retain`, sirve para analizar el equilibrio entre olvido efectivo y preservación de capacidades generales en un modelo de 1.4B.
- Reproducibilidad de experimentos: al ser un checkpoint completo e independiente, se puede cargar directamente sin necesidad de reentrenar, lo que facilita la replicación de resultados en estudios de *unlearning*.
- Análisis de la influencia de los embeddings en la memorización: al reinicializar embeddings y LM head desde `phi-1_5`, permite estudiar cuánta información factual reside en esas capas frente al resto del transformer.
- Estudio de curvas de olvido: al corresponder a la época 6 de 20, sirve para trazar la evolución temporal del olvido y la retención a lo largo del entrenamiento.
- Base para *fine-tuning* controlado en entornos de investigación: su licencia Apache 2.0 permite derivar nuevos experimentos sin restricciones comerciales, aunque su valor práctico en producción es limitado.
- Docencia y divulgación: ejemplo didáctico de cómo se construye un checkpoint de desaprendizaje y qué metadatos acompañan al proceso (`ihl_manifest.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5 GB; en 4 bits, alrededor de 0,8-1 GB (aunque no se publican pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como RTX 3050, RTX 4060 o superiores. Para entrenamiento o evaluación a mayor escala, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes, siempre que se disponga de al menos 4 GB libres.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo requiere `custom_code`), y potencialmente `vLLM` o `TGI` si se verifica compatibilidad con la arquitectura Phi-1.5. `llama.cpp` y `Ollama` no ofrecen pesos GGUF publicados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch06` | 1.418 M | no disponible | Apache 2.0 | Unlearning IHL sobre TOFU |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | no disponible | Apache 2.0 | Fine-tuning TOFU (modelo base) |
| `microsoft/phi-1_5` | 1.300 M | 2048 | MIT | Modelo base de código y texto |
| `locuslab/tofu_llama2-7b` | 7.000 M | 4096 | Llama 2 | Unlearning TOFU sobre Llama 2 |

La comparación directa más relevante es con `locuslab/tofu_ft_phi-1.5`, del que deriva, y con `microsoft/phi-1_5`, cuyos embeddings y LM head se reutilizan. Frente a variantes de TOFU sobre Llama 2, este checkpoint ofrece un tamaño mucho menor (1.4B frente a 7B), lo que facilita experimentos con recursos limitados, a costa de una capacidad general menor.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- El proceso de *unlearning* no garantiza un olvido completo; pueden persistir trazas de la información de `forget10` en los pesos retenidos del transformer.
- Riesgo de alucinación inherente a la base Phi-1.5, especialmente en dominios factuales.
- Soporte exclusivo de inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Contexto limitado (Phi-1.5 base: 2048 tokens); no apto para tareas de contexto largo.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor.
- Aunque la licencia es Apache 2.0, el uso comercial de un checkpoint de *unlearning* experimental no está respaldado por evaluaciones de robustez ni de seguridad.
- Solo se ha publicado la época 6 de 20; el estado final del entrenamiento no está disponible en este repositorio.
- Sin descargas ni *likes* en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch06
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU benchmark (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU: https://github.com/locuslab/tofu
