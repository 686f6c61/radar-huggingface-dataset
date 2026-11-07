# Minguinho-zeze/Qwen3-8B-W2A16-GPTQ-WikiText2

## Resumen

Qwen3-8B-W2A16-GPTQ-WikiText2 es un checkpoint de investigación publicado por el usuario Minguinho-zeze (repositorio `lowbit-reasoning-ptq`) que aplica cuantización post-entrenamiento GPTQ a pesos en INT2 simétrico con activaciones en 16 bits (W2A16) sobre el modelo base Qwen3-8B de Alibaba Qwen. El objetivo declarado no es ofrecer un modelo utilizable, sino reproducir e investigar un fallo grave de precisión en flujos de razonamiento con cuantización de muy bajo bit. La model card advierte explícitamente de que la precisión es prácticamente nula bajo el protocolo de evaluación reportado y de que no se recomienda su uso para inferencia práctica.

El modelo conserva la arquitectura del Qwen3-8B original (transformer denso de 8.190.735.360 parámetros, sin mezcla de expertos) y cuantiza el 84,8 % de los parámetros, dejando embeddings, capas de normalización y `lm_head` en precisión completa. La calibración se realizó con texto de entrenamiento de WikiText-2 (128 ventanas de 2.048 tokens, semilla 0). Los pesos se distribuyen en formato compressed-tensors, no en GGUF ni AutoAWQ.

Su relevancia es metodológica: documenta un caso de colapso de precisión (0,00 % en AIME-120 y GPQA Diamond frente a 71,39 % y 61,11 % del BF16) y proporciona diagnósticos de kernels comprimidos y de ruta de referencia en el directorio `diagnostics/`, además de métricas por semilla, truncamiento y velocidad en el repositorio de GitHub asociado. Es, por tanto, material de referencia para quien investigue los límites de la cuantización de 2 bits en modelos de razonamiento, no una alternativa de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), sin MoE |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de carga usa `max_model_len=34816`) |
| Tipos de cuantización | W2A16: pesos INT2 simétrico, activaciones 16 bits sin cuantizar, group size 128, GPTQ; embeddings, normalización y `lm_head` sin cuantizar; fracción cuantizada 84,800291 %; KV cache en BF16 durante la evaluación |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-8B, un transformer denso de aproximadamente 8,19 mil millones de parámetros. Sobre él se aplica GPTQ con cuantización simétrica de pesos a INT2 y activaciones en 16 bits, con tamaño de grupo 128. La calibración emplea texto de entrenamiento crudo de WikiText-2: 128 ventanas de 2.048 tokens con semilla 0. No se realizó entrenamiento adicional ni ajuste fino posterior a la cuantización; el proceso es exclusivamente post-entrenamiento (PTQ).

La innovación técnica del release no está en el algoritmo de cuantización, sino en la infraestructura de reproducción: se documentan las versiones exactas del stack (vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0, humming-kernels 0.1.17 para INT2), el uso de GPUs Blackwell (RTX 5090 y RTX PRO 4500), la necesidad de añadir el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming, y la inclusión de diagnósticos de ruta de referencia y de kernel comprimido. El autor advierte de que estos diagnósticos no establecen la causa del fallo ni garantizan la corrección del kernel en todas las longitudes de secuencia y tamaños de lote.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-8B.
- Modo de razonamiento explícito (`enable_thinking`) soportado en la plantilla de chat, tal como se usa en la evaluación.
- Razonamiento matemático y de dominio científico: el protocolo de evaluación cubre AIME y GPQA Diamond, aunque en este checkpoint el rendimiento medido es nulo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo específicas de este checkpoint.
- En la práctica, las capacidades del modelo base quedan anuladas por el colapso de precisión descrito por el autor.

## Casos de uso

- Reproducción de experimentos de cuantización de bajo bit: el checkpoint permite replicar el pipeline GPTQ W2A16 con calibración WikiText-2 y comparar resultados con el modelo BF16 bajo el mismo protocolo (temperatura 0,6, top-p 0,95, presupuesto de salida de 32.768 tokens).
- Investigación de colapso de precisión en modelos de razonamiento: sirve como caso negativo controlado para estudiar por qué un modelo con 71,39 % en AIME-120 en BF16 cae a 0,00 % tras cuantización INT2.
- Validación de kernels comprimidos: los diagnósticos incluidos permiten comprobar la ruta de referencia frente al kernel Humming en distintas longitudes de secuencia y lotes, sin garantía de corrección según el autor.
- Auditoría de stacks de inferencia: útil para verificar compatibilidad entre versiones de vLLM, compressed-tensors y PyTorch en GPUs Blackwell antes de desplegar cuantizaciones agresivas.
- Docencia y formación técnica: ejemplo concreto de por qué la cuantización a 2 bits no es viable sin técnicas adicionales en tareas de razonamiento de cadena larga.
- Referencia para el diseño de protocolos de evaluación: el repositorio adjunto documenta métricas por semilla, truncamiento y velocidad, útil para estandarizar comparaciones entre checkpoints cuantizados.
- No es adecuado para atención al cliente, generación de código en producción, agentes ni ningún uso que requiera respuestas correctas.

## Benchmarks y rendimiento

Precisión en porcentaje, promediada sobre las semillas 0, 1 y 2; cada semilla evalúa 120 preguntas de AIME y 198 de GPQA Diamond. Las semillas repetidas son generaciones repetidas de las mismas preguntas, no preguntas nuevas independientes. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (W2A16 GPTQ) | 0,00 | 0,00 |

Estas puntuaciones describen el protocolo del autor y no son resultados oficiales de Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 4,3 GB, lo que da una cota inferior del peso de los parámetros cuantizados, a la que hay que sumar la KV cache en BF16 y el overhead del runtime.
- GPUs utilizadas en la evaluación: RTX 5090 y RTX PRO 4500 Blackwell.
- Compatibilidad con GPUs consumer: el autor solo valida Blackwell; otras GPUs, kernels y combinaciones de paquetes no han sido validadas por este release.
- Despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y humming-kernels 0.1.17 para INT2; requiere añadir el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT.
- Configuración de referencia del ejemplo: `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`, semilla 0.
- Latencia y throughput: el autor remite a métricas de velocidad en el repositorio de GitHub; no se incluyen cifras en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME-120 | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-8B BF16 (base) | 8,19 B | no disponible en la información proporcionada | 71,39 | 61,11 | Apache 2.0 | Hugging Face (Qwen/Qwen3-8B) |
| Este checkpoint (W2A16 GPTQ) | 8,19 B | no disponible en la información proporcionada | 0,00 | 0,00 | Apache 2.0 | Hugging Face (Minguinho-zeze) |
| Otras cuantizaciones de Qwen3-8B (GGUF, AWQ) | 8,19 B | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | no disponible en la información proporcionada |

No se dispone de datos de benchmarks de otras alternativas cuantizadas en la información proporcionada.

## Limitaciones y advertencias

- Colapso de precisión severo: 0,00 % en AIME-120 y GPQA Diamond frente a 71,39 % y 61,11 % del BF16. El autor desaconseja explícitamente su uso para inferencia práctica.
- Checkpoint de investigación: se publica para reproducir e investigar ejecuciones fallidas de razonamiento de bajo bit, no como modelo listo para producción.
- Los diagnósticos incluidos no establecen la causa del fallo ni garantizan la corrección del kernel en todas las longitudes de secuencia y lotes.
- Validación limitada a GPUs Blackwell y a un stack de versiones concreto; otras GPUs, kernels y combinaciones de paquetes no han sido validadas.
- Las versiones del cuantizador y del runtime de compressed-tensors difieren; se conservan las versiones registradas en lugar de asumir que son idénticas.
- Riesgo de alucinación: no evaluado en la información disponible, pero el fallo de razonamiento hace esperable una salida incorrecta en la práctica totalidad de consultas.
- Idiomas soportados: no disponible; no se documenta el comportamiento multilingüe de este checkpoint.
- Licencia Apache 2.0 heredada del modelo base, con el texto incluido en `LICENSE`; no se documentan restricciones adicionales para uso comercial, pero el estado del modelo lo hace inviable en producción.
- Las puntuaciones publicadas describen únicamente el protocolo del autor y no son resultados oficiales de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-W2A16-GPTQ-WikiText2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Métricas y análisis por semilla: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuración del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Repositorio de la serie Qwen3: https://github.com/QwenLM/Qwen3.8
