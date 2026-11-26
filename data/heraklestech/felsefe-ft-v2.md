# heraklestech/felsefe-ft-v2

## Resumen

`heraklestech/felsefe-ft-v2` es un adaptador LoRA publicado por el usuario heraklestech sobre el modelo base `sshleifer/tiny-gpt2`, una versión minúscula de GPT-2 empleada habitualmente como banco de pruebas para pipelines de entrenamiento y experimentación con PEFT. El repositorio contiene únicamente los pesos del adaptador en formato safetensors y está etiquetado con la librería `peft` y el pipeline `text-generation`. El nombre ("felsefe" significa filosofía en turco) sugiere un ajuste fino orientado a dominio filosófico, aunque la model card no lo confirma.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el modelo base es un GPT-2 reducido, el repositorio ocupa 0.0 GB, no registra descargas ni interacciones, y la model card es la plantilla por defecto de Hugging Face sin secciones cumplimentadas. No hay información publicada sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia.

Se documenta aquí como ejemplo de adaptador LoRA de bajo coste sobre un modelo de juguete, útil para validar infraestructura de fine-tuning, no como modelo desplegable en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (el modelo base `sshleifer/tiny-gpt2` es de escala minúscula; el adaptador LoRA añade un número reducido de parámetros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base GPT-2 emplea típicamente 1024 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA sobre `sshleifer/tiny-gpt2`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre `sshleifer/tiny-gpt2`, un checkpoint de GPT-2 de tamaño reducido mantenido por sshleifer para pruebas rápidas de la librería `transformers`. La arquitectura subyacente es un transformer decoder-only autorregresivo estándar. El adaptador congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención y/o proyección, de modo que solo se entrenan esos parámetros adicionales. La librería declarada es `peft` y la versión de PEFT registrada en la model card es 0.22.0.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, la existencia de RLHF o DPO, ni los hiperparámetros del ajuste (rango LoRA, alpha, tasa de aprendizaje, épocas). La model card conserva todos los campos de la plantilla original con el marcador `[More Information Needed]`. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, mezcla de expertos, etc.).

## Capacidades

- Generación de texto autorregresiva, heredada del modelo base GPT-2 en su variante minúscula.
- Ajuste fino mediante LoRA, cargable con la librería `peft` sobre `sshleifer/tiny-gpt2`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo base está entrenado predominantemente en inglés y el adaptador no declara idiomas.
- No se documenta thinking mode, visión, audio ni ninguna capacidad multimodal.
- No se documentan capacidades específicas de código, matemáticas o razonamiento que hayan sido evaluadas.

## Casos de uso

- Validación de pipelines de fine-tuning con PEFT: el adaptador sirve para comprobar de extremo a extremo la carga de un LoRA con `peft` y `transformers`, verificar la fusión de pesos y el guardado en safetensors antes de escalar a modelos mayores.
- Pruebas de integración en CI: al ser un artefacto de tamaño despreciable (0.0 GB), puede incluirse en tests automatizados que verifiquen la compatibilidad de versiones de PEFT y transformers sin consumir recursos de GPU significativos.
- Docencia y demostraciones de LoRA: permite ilustrar en un notebook cómo se entrena y aplica un adaptador de bajo rango sobre un transformer, con tiempos de ejecución de segundos en CPU.
- Prototipado rápido de prompts sobre dominio filosófico: si el ajuste se orientó a ese dominio (según sugiere el nombre), podría emplearse para explorar generación de texto temática, siempre con expectativas de calidad muy limitadas por el tamaño del modelo base.
- Banco de pruebas de cuantización y despliegue: útil para ensayar la conversión de adaptadores LoRA a otros formatos y la carga en servidores de inferencia ligeros antes de migrar a checkpoints reales.
- Reproducción de experimentos académicos sobre eficiencia de PEFT: como referencia mínima para comparar sobrecarga de memoria y velocidad de carga de adaptadores frente a fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo base `sshleifer/tiny-gpt2` es de escala de juguete y cabe holgadamente en cualquier GPU consumer, e incluso puede ejecutarse en CPU para pruebas.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con unos pocos GB de VRAM (por ejemplo, GTX 1650, RTX 3060) es más que suficiente. Para entrenamiento del adaptador, una GPU consumer básica basta.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en hardware integrado.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; `text-generation-inference` o `vLLM` no están documentados para este artefacto; `llama.cpp` y `Ollama` no aplican al no publicarse pesos en GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| heraklestech/felsefe-ft-v2 | no disponible (base minúscula) | no disponible | no disponible | safetensors (LoRA) | Hugging Face, 0 descargas |
| sshleifer/tiny-gpt2 (modelo base) | escala minúscula | 1024 tokens (GPT-2) | MIT (GPT-2 original) | safetensors / pytorch | Hugging Face, ampliamente usado en pruebas |
| Adaptadores LoRA comunitarios sobre GPT-2 | variable | 1024 tokens | variable según autor | safetensors | Hugging Face |

La comparación con modelos de producción no resulta significativa: el modelo base pertenece a la categoría de checkpoints de prueba, no a la de modelos desplegables. Frente al propio `sshleifer/tiny-gpt2`, la diferencia se limita a los pesos del adaptador LoRA, sin datos publicados que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Model card sin cumplimentar: todos los campos relevantes (datos, evaluación, licencia, idiomas) figuran como `[More Information Needed]`.
- Licencia no declarada: no puede asumirse uso comercial; la licencia del adaptador es independiente de la del modelo base y no está especificada.
- Calidad de generación muy limitada por el tamaño del modelo base; no es apto para aplicaciones de producción.
- Riesgo elevado de alucinación y de texto incoherente, inherente a un GPT-2 de escala minúscula.
- Idiomas soportados no documentados; el modelo base está sesgado hacia el inglés.
- Sin métricas de evaluación publicadas: no hay evidencia de que el ajuste fino mejore ninguna tarea concreta.
- Sin descargas ni validación comunitaria: no existen señales de uso o revisión por terceros.
- El nombre sugiere un dominio (filosofía) que no está confirmado ni documentado en la model card.
- No se publican pesos fusionados ni versiones cuantizadas, lo que limita su uso fuera del ecosistema PEFT.

## Enlaces

- Hugging Face: https://huggingface.co/heraklestech/felsefe-ft-v2
- Modelo base: https://huggingface.co/sshleifer/tiny-gpt2
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/2106.09685
- Paper de PEFT citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
