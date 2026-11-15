# posterior-learning/grpo-posterior-qwen3-vl-4b-thinking

## Resumen

`grpo-posterior-qwen3-vl-4b-thinking` es un ajuste fino del modelo multimodal Qwen3-VL-4B-Thinking publicado por el usuario `posterior-learning`. No se trata de un modelo entrenado desde cero, sino de la fusión de un adaptador LoRA (r=16, alpha=32) sobre los pesos del modelo base de Alibaba Qwen, lo que da como resultado un checkpoint completo listo para cargar con `transformers` sin necesidad de gestionar el adaptador por separado. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) dentro de un pipeline denominado "plearn posterior", orientado a la optimización de políticas con historiales de aprendizaje y control de divergencia KL.

El modelo hereda la arquitectura y capacidades del Qwen3-VL-4B-Thinking: un transformer multimodal de aproximadamente 4.440 millones de parámetros (4,4 B) que procesa imagen y texto y que incorpora un modo de razonamiento extendido ("thinking"). El ajuste GRPO se aplicó sobre 8 tareas de entrenamiento con 50 actualizaciones previstas, aunque el entrenamiento se detuvo automáticamente por el guardia de KL en las actualizaciones 22 y 33, por lo que el adaptador final corresponde al estado tras la actualización 33.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo real de ajuste GRPO sobre un modelo de visión-lenguaje pequeño; por otro, advierte de que se trata de un artefacto de investigación con cero descargas, sin licencia declarada y sin benchmarks publicados, lo que lo hace inadecuado para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) Qwen3-VL, con modo thinking; adaptador LoRA fusionado |
| Parametros totales | 4.437.815.808 (~4,44 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen3-VL-4B-Thinking) |
| Tipos de cuantizacion | No se publican cuantizaciones propias; al ser compatible con `transformers` y safetensors, admite cuantización posterior (GPTQ, AWQ, GGUF) por parte del usuario. El checkpoint se distribuye en bf16 |
| Idiomas soportados | No disponible (heredados del modelo base, no declarados en la model card) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16), biblioteca `transformers` |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-4B-Thinking |
| Tamano del repositorio | 8,9 GB |
| Modulos fusionados | 252 modulos LoRA |
| LoRA | r=16, alpha=32, escala 2.0, fusión en fp32 almacenada en bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Thinking, un transformer multimodal denso de ~4,4 B de parámetros que acepta entradas de imagen y texto y genera texto, con un modo de razonamiento explícito ("thinking") que produce cadenas de pensamiento antes de la respuesta final. Sobre este base se entrenó un adaptador LoRA de rango 16 y alpha 32 (escala 2.0) mediante GRPO, una variante de optimización por política proximal que estima ventajas relativas dentro de grupos de muestras en lugar de usar un crítico separado. La configuración reportada incluye `grpo_clip` 20, `grpo_eps` 0.2, `grpo_norm` 1, atención con `flash_attention_3`, un límite de tokens de pensamiento de 8.192, 8 tareas de entrenamiento (`suite_train 8 games`), 50 actualizaciones con learning rate 1e-5, temperatura 1.0 y penalización de presencia 1.5.

El entrenamiento se detuvo de forma automática por un guardia de divergencia KL fijado en 0.015 nats por token: se completaron las actualizaciones 1-22, se saltaron las 23-25, se reanudó hasta la 33 y se saltaron las 34-50. El adaptador final corresponde al estado tras la actualización 33. La fusión se realizó con la regla `W <- W + (lora_alpha / r) * B @ A` en fp32 y almacenamiento en bf16, afectando a 252 módulos; el resto de tensores (461) son idénticos byte a byte al modelo base, y los ficheros de configuración, tokenizer y plantilla de chat se mantienen sin cambios. Esto implica que las salidas pueden diferir ligeramente respecto a la combinación base + adaptador en tiempo de ejecución debido al redondeo a bf16.

## Capacidades

- Generación de texto e imagen-a-texto: descripción de imágenes, respuesta a preguntas visuales y conversación multimodal multi-turno.
- Razonamiento extendido en modo "thinking": el modelo puede emitir cadenas de razonamiento antes de la respuesta, con un límite configurado de 8.192 tokens de pensamiento durante el entrenamiento.
- Razonamiento matemático y lógico, heredado del modelo base Qwen3-VL.
- Generación y comprensión de código, incluyendo código que interpreta capturas o diagramas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible; debe verificarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no declaradas en la model card; dependen del modelo base.
- Ajuste específico orientado a tareas de "posterior learning" con historiales de política, sin que se detalle qué habilidades concretas mejora respecto al base.

## Casos de uso

- Extracción de información de documentos escaneados: el modelo puede recibir una imagen de factura o formulario y devolver campos estructurados, aprovechando su naturaleza image-text-to-text y el modo thinking para razonar sobre tablas y layouts complejos.
- Asistencia en tareas de razonamiento visual: resolución de problemas de geometría o diagramas técnicos donde el modelo describe la imagen y encadena pasos de razonamiento antes de responder.
- Prototipado de agentes multimodales: al ser un checkpoint de 4,4 B en bf16, cabe en una GPU de 24 GB y permite iterar rápidamente en entornos de investigación con `transformers` y `vLLM` (si el modelo base es compatible).
- Evaluación comparativa de técnicas de RL: sirve como referencia reproducible de un pipeline GRPO con guardia KL, útil para investigadores que quieran replicar o comparar curvas de entrenamiento.
- Generación de descripciones accesibles: conversión de imágenes a texto alternativo descriptivo en pipelines de accesibilidad, con la ventaja del modo thinking para descripciones detalladas.
- Análisis de capturas de pantalla en herramientas de soporte técnico: el modelo puede interpretar una captura de error y proponer pasos de resolución, integrándose en un flujo de atención al usuario.
- Fine-tuning posterior como punto de partida: al estar ya fusionado y ser compatible con `transformers`, puede servir de base para nuevos adaptadores LoRA en dominios específicos sin partir del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales (MMBench, MMMU, DocVQA), ni comparaciones cuantitativas con el modelo base. Tampoco se reportan curvas de recompensa ni métricas de entrenamiento más allá del número de actualizaciones y el punto de parada por KL.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 8,9 GB solo para pesos (4,44 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~4,5 GB de pesos; en 4 bits: ~2,3 GB de pesos, con margen adicional para activaciones.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento o inferencia con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con contexto razonable.
- Cabe en GPU de consumo: sí, en tarjetas de 16-24 GB en bf16 y en tarjetas de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: `transformers` (soporte nativo declarado), y previsiblemente `vLLM` y `TGI` si el modelo base Qwen3-VL-4B-Thinking está soportado por esas herramientas; `llama.cpp`/`Ollama` requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de la cadena de pensamiento, que puede llegar a 8.192 tokens y penalizar la latencia de forma significativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-posterior-qwen3-vl-4b-thinking | ~4,44 B | No disponible | Imagen + texto | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-4B-Thinking (base) | ~4,4 B | No disponible en esta ficha | Imagen + texto | La del modelo base Qwen (consultar) | Hugging Face, oficial |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | 32.768 tokens (referencia del modelo base) | Imagen + texto | Apache 2.0 (referencia) | Hugging Face, ampliamente usado |
| Llama 3.2 11B Vision Instruct | ~11 B | 128.000 tokens (referencia) | Imagen + texto | Llama 3.2 Community License | Hugging Face, oficial |

La comparación directa con el base es la más relevante: el checkpoint aquí descrito no declara mejoras cuantificadas sobre Qwen3-VL-4B-Thinking, y su único valor diferencial documentado es el ajuste GRPO con parada por KL. Frente a alternativas como Qwen2.5-VL-3B o Llama 3.2 Vision, la falta de licencia y de benchmarks impide una comparación rigurosa de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de reproducibilidad independiente.
- Sin benchmarks: no hay datos que confirmen que el ajuste GRPO mejora al modelo base; de hecho, el entrenamiento se detuvo por divergencia KL en dos ocasiones, lo que sugiere inestabilidad en la optimización.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 4 B; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas.
- Diferencias por fusión en bf16: las salidas pueden diferir del par base + adaptador, por lo que los resultados de una evaluación hecha con el adaptador no son trasladables sin revalidar.
- Idiomas no declarados: no se garantiza un comportamiento correcto fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto no documentada en esta ficha: debe consultarse la model card de Qwen3-VL-4B-Thinking.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento del modelo base, no auditados aquí.
- Artefacto de investigación: sin garantías de mantenimiento, soporte ni actualizaciones; la fecha de creación (2026-11-15) y la ausencia de documentación adicional refuerzan su carácter experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/grpo-posterior-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- README del modelo base incluido en el repo: `README.base.md` (referenciado en la model card)
- Informe de fusión: `MERGE-REPORT.json` (referenciado en la model card)
- Configuración de entrenamiento: `configs/train/grpo_posterior_qwen3vl_4b_thinking.yaml` (referenciada en la model card)
- Run de W&B: `ktnkp8f1` (referenciado en la model card)
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
