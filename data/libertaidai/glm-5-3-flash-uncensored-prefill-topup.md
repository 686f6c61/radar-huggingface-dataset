# LibertAIDAI/GLM-5.3-Flash-Uncensored-Prefill-Topup

## Resumen

El repositorio `LibertAIDAI/GLM-5.3-Flash-Uncensored-Prefill-Topup` no es un modelo de lenguaje completo, sino un complemento de activación en tiempo de ejecución de aproximadamente 180 KB para la ablación comunitaria `OrcaRouter` del modelo `GLM-5.3-Flash`. Desarrollado por LibertAIDAI, este paquete aporta dos vectores de dirección de rechazo y un cargador que inyecta una señal constante durante el procesamiento del prompt (prefill-only) en las capas 25 y 26 del modelo base. El objetivo es eliminar el comportamiento de rechazo (refusal) sin modificar los pesos y sin degradar la calidad de las generaciones largas, un problema conocido de las técnicas clásicas de ablación que inyectan en cada paso de decodificación.

El modelo base al que se aplica es `GLM-5.3-Flash`, un modelo de mezcla de expertos (MoE) de 320.000 millones de parámetros totales y 18.000 millones activos, con atención sparse y lineal, contexto de 1 millón de tokens y capacidades multimodales nativas. Este top-up se centra exclusivamente en la manipulación de activaciones y no incluye pesos, por lo que su tamaño es mínimo. La relevancia actual radica en que propone una alternativa a la abliteración por proyección, que según los autores falla en este modelo, y demuestra que la inyección prefill-only preserva la capacidad mientras suprime el rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (complemento de activación prefill-only sobre GLM-5.3-Flash, un MoE con atención sparse + linear) |
| Parametros totales | No disponible (no incluye pesos; el modelo base tiene 320B) |
| Parametros activos | No disponible (el modelo base tiene 18B activos) |
| Longitud de contexto | 1M tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (los vectores se almacenan en JSON; el modelo base se sirve en NVFP4) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (archivos JSON y scripts Python) |

Nota: los datos de parámetros y contexto corresponden al modelo base `GLM-5.3-Flash` según la información de `LibertAIDAI/GLM-5.3-Flash-NVFP4`.

## Arquitectura y entrenamiento

El modelo base `GLM-5.3-Flash` es el primer modelo de la familia GLM en combinar atención sparse y lineal, según la descripción de su cuantización NVFP4. Se trata de un MoE con 320.000 millones de parámetros totales y 18.000 millones activos, nativamente multimodal y con una ventana de contexto de 1 millón de tokens. El repositorio que nos ocupa no entrena ni modifica estos pesos; en su lugar, implementa una técnica de steering vectors conocida como "prefill-only constant injection". Consiste en añadir una señal constante (`dose × r̂`) al estado oculto entre capas después de las capas 25 y 26, únicamente durante el procesamiento del prompt. Esta intervención se realiza en tiempo de ejecución mediante un hook de forward pass, y no afecta a los pasos de decodificación.

Los autores documentan varios hallazgos técnicos: la proyección (el operador canónico de abliteración) no funciona en este modelo, manteniendo un rechazo del 90-100% en ocho variantes; solo el desplazamiento constante a lo largo de la dirección de rechazo suprime el comportamiento. Además, la inyección en cualquier otro stream del modelo (hidden_states, residual, post, comb) destruye la arquitectura, y la inyección durante la decodificación degrada la calidad de las generaciones largas. El trabajo se apoya en los artículos de Arditi et al. (arXiv:2406.11732) sobre la dirección de rechazo y de Bao et al. (arXiv:2605.05983) sobre steering vectors solo durante el prompt.

## Capacidades

- Supresión del rechazo en prompts dañinos: en la evaluación del autor, la configuración con el top-up (dosis -8) reduce el rechazo verdadero al 0% en una muestra de 20 prompts dañinos, frente al 10% de la ablación de OrcaRouter sola y al 25% de la técnica dealign CRACK.
- Preservación de capacidades: mantiene un rendimiento de 10/10 en 10 prompts de capacidad, igual que la ablación sola.
- Compatibilidad con vLLM: se integra como un hook en el archivo de modelo de vLLM, activado por la variable de entorno `GLM53_REFUSAL_INJECT`.
- Inyección prefill-only: la intervención se aplica solo durante el procesamiento del prompt, evitando la degradación de la calidad en generaciones largas.
- No modifica pesos: los vectores se almacenan en un archivo JSON y se cargan en tiempo de ejecución.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multimodales: heredadas del modelo base, pero no evaluadas en este repositorio.

## Casos de uso

- Investigación en técnicas de ablación: el repositorio permite reproducir y estudiar cómo la inyección prefill-only suprime el rechazo sin alterar los pesos. Es útil para comparar con métodos de proyección y con otras variantes de steering vectors.
- Evaluación de robustez de modelos: se puede usar para medir el comportamiento de un modelo base con y sin la intervención, cuantificando cambios en el rechazo y en las capacidades de generación.
- Despliegue controlado de modelos con filtros de contenido: en entornos de investigación, la variable `GLM53_REFUSAL_INJECT` permite alternar entre el modelo abliterado y el modelo con el top-up sin necesidad de recargar pesos.
- Benchmarking de técnicas de "uncensoring": los scripts de reproducción y la evaluación de 20 prompts dañinos y 10 de capacidad ofrecen una base para comparar la eficacia de diferentes métodos de ablación.
- Generación de contenido creativo sin restricciones: en contextos de laboratorio donde se necesita explorar salidas sin filtros, el top-up puede aplicarse a la ablación de OrcaRouter para reducir el rechazo.
- Estudio de arquitecturas con streams múltiples: el hallazgo de que solo la inyección en el estado oculto entre capas es viable proporciona información sobre la sensibilidad de la arquitectura mHC de GLM-5.3-Flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una evaluación propia con 20 prompts dañinos y 10 prompts de capacidad, con decodificación greedy y generaciones de 1000 tokens. Los resultados son los siguientes:

| Configuración | Rechazo | Capacidad |
|---|---|---|
| dealign CRACK (comunidad) | 25% | 10/10 |
| Ablación de OrcaRouter sola | 10% | 10/10 |
| OrcaRouter + este top-up (dosis -8) | 0% verdadero* | 10/10 |

*El clasificador lee un 5%, pero el único acierto es un falso positivo: el modelo indica que no puede producir un archivo de vídeo real (siendo un modelo de texto) y luego genera el guion completo.

## Requisitos de hardware

- VRAM estimada para inferencia: el top-up en sí no requiere VRAM adicional (apenas 180 KB de vectores). El modelo base cuantizado en NVFP4 ocupa aproximadamente 181 GiB, según la información de `GLM-5.3-Flash-NVFP4`, frente a los 598.5 GiB en precisión completa.
- GPU recomendadas: para servir el modelo base se necesitan GPUs con suficiente memoria, por ejemplo configuraciones de 4x A100/H100 de 80 GB o equivalentes. El top-up no exige hardware específico.
- Si cabe en consumer GPU: no, el modelo base de 181 GiB no cabe en una GPU de consumo estándar (p. ej., RTX 4090 de 24 GB).
- Opciones de despliegue: vLLM (librería principal del repositorio). No se mencionan opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Este repositorio no es un modelo autónomo, sino un complemento. La comparación más relevante es entre las técnicas de ablación evaluadas en la model card:

| Técnica | Rechazo | Capacidad | Peso adicional | Licencia |
|---|---|---|---|---|
| dealign CRACK (comunidad) | 25% | 10/10 | No disponible | No disponible |
| OrcaRouter abliteration sola | 10% | 10/10 | No disponible | No disponible |
| OrcaRouter + este top-up | 0% verdadero | 10/10 | ~180 KB | MIT |

No se dispone de comparativas con otros modelos de la misma categoría (MoE de 320B) en la información proporcionada.

## Limitaciones y advertencias

- La evaluación es limitada: 20 prompts dañinos, 10 prompts de capacidad, una sola semilla, decodificación greedy y puntuación con un clasificador de marcadores. El resultado de "0% rechazo" no es un certificado de seguridad.
- Los vectores son específicos del checkpoint de OrcaRouter en precisión NVFP4. Para otros checkpoints es necesario re-capturar los vectores, aunque el repositorio incluye un arnés para hacerlo en un comando.
- Riesgo de alucinación: inherente al modelo base. El top-up no mitiga este riesgo y puede aumentar la probabilidad de generar contenido dañino al suprimir el rechazo.
- Restricciones de licencia: el repositorio tiene licencia MIT, lo que permite uso comercial, pero se indica explícitamente que LibertAI no está afiliado a Z.ai / Zhipu, propietario del modelo base. La licencia del modelo base puede tener condiciones adicionales no documentadas aquí.
- La inyección solo es viable en el estado oculto entre capas; cualquier otro stream (residual, post, comb) destruye la arquitectura, lo que limita la portabilidad de la técnica.
- No se han evaluado capacidades multimodales ni soporte de herramientas en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-Uncensored-Prefill-Topup
- GitHub: https://github.com/Libertai/prefill-steering
- Paper: https://labs.libertai.io/papers/prefill-only-stacked-abliteration-paper
- Story: https://labs.libertai.io/notes/uncensoring-glm53-flash
- Modelo base cuantizado: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Búsqueda de modelos OrcaRouter: https://huggingface.co/models?search=orcarouter
