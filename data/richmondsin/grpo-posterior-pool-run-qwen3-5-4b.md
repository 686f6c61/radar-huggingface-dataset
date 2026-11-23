# richmondsin/grpo-posterior-pool-run-qwen3.5-4b

## Resumen

grpo-posterior-pool-run-qwen3.5-4b es un modelo multimodal de tipo image-text-to-text obtenido mediante la fusión de un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B. Lo publica el usuario richmondsin en Hugging Face y se distribuye como un checkpoint completo en safetensors, listo para cargarse con transformers. El entrenamiento del adaptador se realizó con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, dentro de un pipeline que el autor denomina "posterior learning" y que en esta ejecución concreta no incorpora término de longitud ni belief score.

El modelo cuenta con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) y hereda del base Qwen3.5-4B la arquitectura, el tokenizador, la plantilla de chat y los procesadores multimodales. Su relevancia es limitada pero concreta: permite reproducir o evaluar un ajuste fino por RL sobre un modelo multimodal de tamaño medio sin necesidad de aplicar el adaptador por separado, ya que los pesos fusionados están incluidos en el repositorio. El repo ocupa 9,3 GB y el checkpoint se ha verificado byte a byte contra el base salvo en los 200 módulos LoRA fusionados.

Al tratarse de una publicación experimental con cero descargas y cero likes en el momento de la consulta, debe considerarse un artefacto de investigación más que un modelo listo para producción. No hay model card extendida, ni datos de benchmarks, ni información sobre licencia o idiomas soportados más allá de lo que se deduce del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; no se detalla la configuración interna en la información disponible |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el resto de formatos no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), compatible con transformers |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de ajuste | LoRA fusionado (r=16, alpha=32, escala 2.0), entrenado con GRPO |
| Modulos fusionados | 200 |
| Tamano del repo | 9,3 GB |

## Arquitectura y entrenamiento

El checkpoint es el resultado de fusionar un adaptador LoRA en el modelo base Qwen/Qwen3.5-4B. La fusión se aplica módulo a módulo con la regla W ← W + (lora_alpha / r) · B @ A, es decir, con un factor de escala de 2,0 dado que r=16 y alpha=32. El cálculo se realiza en fp32 y el resultado se almacena en bf16. Según el informe de fusión del autor (MERGE-REPORT.json), se fusionaron 200 módulos y los 538 tensores restantes quedaron byte-idénticos al base, con un total de bytes de tensores igual a 9.319.737.856. Los ficheros auxiliares (config, tokenizer, chat template, processor configs y generation config) son los del modelo base sin modificar.

El adaptador se entrenó con GRPO (Group Relative Policy Optimization), un algoritmo de RL sin crítico que estima ventajas relativas dentro de grupos de muestras. La ejecución corresponde a la fase 5, con phase_set 240 y set_keep 160, sin término de longitud y sin belief score, en la actualización 25. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas previas de SFT o DPO. La arquitectura subyacente es la del Qwen3.5-4B, un transformer multimodal, pero no se detallan en la model card innovaciones como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen3.5-4B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), incluyendo preguntas y respuestas sobre imágenes.
- Razonamiento y matemáticas: capacidad presumible del base, no verificada con benchmarks en esta publicación.
- Generación de código: capacidad presumible del base, no verificada en esta publicación.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste con GRPO podría orientarse a este tipo de tareas, pero no se especifica.
- Capacidades multilingües: no disponibles; dependen del base y no se detallan.
- Modo thinking explícito, visión avanzada o audio: no documentado.

## Casos de uso

- Evaluación de ajustes por RL: el checkpoint permite comparar directamente el efecto de la fusión LoRA con GRPO frente al Qwen3.5-4B original, sin necesidad de gestionar el adaptador por separado, lo que simplifica la reproducibilidad experimental.
- Investigación en "posterior learning": útil para estudiar cómo la configuración phase_set 240 / set_keep 160 y la ausencia de término de longitud afectan al comportamiento del modelo en tareas de razonamiento.
- Prototipado de asistentes multimodales: al ser un modelo image-text-to-text de 4,66 mil millones de parámetros, puede desplegarse en una sola GPU para experimentar con descripción de imágenes, VQA o extracción de información de documentos escaneados.
- Generación de código asistida en entornos de desarrollo: el modelo puede integrarse en editores o pipelines locales para autocompletado y explicación de fragmentos, siempre que se valide su calidad frente al base.
- Análisis de capturas y diagramas técnicos: en flujos de soporte o documentación, el modelo puede recibir una imagen y generar una descripción textual o responder preguntas sobre ella.
- Fine-tuning posterior: al estar en safetensors y con la configuración del base intacta, sirve como punto de partida para nuevos adaptadores LoRA o para continuar el entrenamiento con GRPO en otras configuraciones.
- Docencia y experimentación con RLHF/GRPO: su tamaño moderado permite ejecutar experimentos de alineación en hardware asequible, comparando políticas antes y después del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos, más overhead; en 4 bits, alrededor de 2,5-3 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues con contexto largo y concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con contexto limitado.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 24 GB o más en bf16, y en tarjetas de 8-12 GB si se cuantiza a 4 u 8 bits, siempre que se genere la cuantización a partir de los pesos safetensors.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI o llama.cpp/Ollama previa conversión a GGUF; no se documentan configuraciones oficiales para estos backends.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, la longitud de contexto y el backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-posterior-pool-run-qwen3.5-4b | 4,66 B | no disponible | imagen-texto | no disponible | Hugging Face (repo público, 0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado en la información) | no disponible | imagen-texto | no disponible | Hugging Face |
| Alternativas de ~4 B multimodal | no disponible | no disponible | imagen-texto | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no puede establecerse.

## Limitaciones y advertencias

- Modelo experimental: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación por terceros.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución; debe consultarse la licencia del modelo base Qwen3.5-4B antes de cualquier despliegue.
- Idiomas no documentados: el comportamiento multilingüe depende del base y no está verificado para este checkpoint.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para esta ejecución.
- Sesgos: no documentados; el ajuste con GRPO puede amplificar sesgos presentes en el base o en los datos de recompensa, que no se detallan.
- Diferencia numérica respecto al adaptador: la fusión se realizó en fp32 y se almacenó en bf16, por lo que las salidas pueden diferir ligeramente de las del base más el adaptador en tiempo de ejecución.
- Sin datos de entrenamiento: se desconoce el dataset, el número de tokens y la composición, lo que dificulta evaluar la cobertura y los sesgos.
- Longitud de contexto no disponible: no puede planificarse su uso en tareas de contexto largo sin verificar la configuración del base.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-pool-run-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
