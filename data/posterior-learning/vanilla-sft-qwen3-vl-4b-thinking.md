# posterior-learning/vanilla-sft-qwen3-vl-4b-thinking

## Resumen

`vanilla-sft-qwen3-vl-4b-thinking` es un ajuste fino del modelo multimodal Qwen3-VL-4B-Thinking, publicado por el usuario posterior-learning en Hugging Face. No se trata de un modelo entrenado desde cero, sino de la fusión permanente (merge) de un adaptador LoRA de rango 16 sobre los pesos del modelo base de Alibaba. El resultado es un checkpoint autónomo que se carga directamente con `transformers` sin necesidad de aplicar el adaptador en tiempo de ejecución.

El modelo conserva la arquitectura y capacidades del Qwen3-VL-4B-Thinking original: un transformer multimodal de aproximadamente 4.440 millones de parámetros (4,44 B) que procesa entradas de imagen y texto y genera respuestas de texto, con modo de razonamiento explícito ("thinking") heredado del base. El ajuste se realizó sobre un conjunto de datos propio del autor denominado `vanilla_sft_turn_qwen3vl_4b_thinking_suite`, orientado a turnos conversacionales de una sola línea.

Su relevancia es limitada y muy específica: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva más allá del informe de fusión, sin licencia declarada y sin idiomas especificados. Resulta útil como referencia para quienes replican pipelines de SFT con LoRA sobre Qwen3-VL, pero no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), familia Qwen3-VL; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 4.437.815.808 (4,44 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser compatible con `transformers` y safetensors, admite cuantizaciones posteriores (GPTQ, AWQ, GGUF) generadas por el usuario, pero no se distribuyen en el repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 8,9 GB; 8.875.631.616 bytes de tensores según el informe de fusión) |

## Arquitectura y entrenamiento

El checkpoint es el resultado de fusionar un adaptador LoRA sobre `Qwen/Qwen3-VL-4B-Thinking`. El adaptador tiene rango 16 y `lora_alpha` 32, lo que da un factor de escala de 2,0. La regla de fusión aplicada a cada módulo LoRA es `W <- W + (lora_alpha / r) * B @ A`, calculada en fp32 y almacenada en bf16. Se fusionaron 252 módulos; el resto de tensores (461) permanecen byte a byte idénticos al modelo base. Los ficheros que no son pesos (configuración, tokenizador, plantilla de chat, configuración del procesador y de generación) son los del base sin modificar.

El entrenamiento consistió en un SFT "vanilla" por turnos: configuración `vanilla_sft_turn_qwen3vl_4b_thinking_suite`, con solo la línea de acción, turnos de una línea, pensamientos del modelo base a temperatura 1,0, learning rate de 1e-5, 50 pasos sobre 32 partidas, ejecutado en 2 rangos sobre las GPU 0 y 2 de una máquina identificada como Server10, con fecha 14 de noviembre de 2026. El adaptador resultante es `adapter-50`. No se documentan el volumen total de tokens, la composición del dataset, ni si hubo RLHF o DPO; el nombre "vanilla SFT" sugiere que no se aplicó preferencia posterior. La innovación técnica destacable es la trazabilidad del merge: el autor publica un `MERGE-REPORT.json` con verificaciones de que 3 módulos aleatorios están dentro del redondeo bf16 de `W + s*B@A` y que el total de bytes de tensores coincide con el base.

## Capacidades

- Generación de texto y razonamiento multimodal: hereda del Qwen3-VL-4B-Thinking la capacidad de procesar imágenes junto con texto y producir respuestas razonadas.
- Modo "thinking": el base incorpora razonamiento explícito antes de la respuesta final; el ajuste se entrenó con los pensamientos del modelo base a temperatura 1,0, por lo que el comportamiento de razonamiento se preserva.
- Conversación multi-turno: pipeline `image-text-to-text` con plantilla de chat del base.
- Comprensión de imágenes: al ser un modelo VL, admite entrada de imagen y texto combinados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Replicación de experimentos de SFT con LoRA sobre Qwen3-VL: el repo documenta la configuración exacta (rango, alpha, learning rate, pasos, regla de fusión), lo que permite reproducir el pipeline de ajuste y verificar el merge con el informe incluido.
- Investigación sobre fusión de adaptadores: sirve como caso de estudio de merge en bf16 con verificación byte a byte de los tensores no afectados, útil para validar herramientas propias de fusión.
- Evaluación de degradación por cuantización: al ser un checkpoint autónomo de 4,44 B en safetensors, se puede cuantizar a 8 o 4 bits y comparar la salida frente al base más adaptador en tiempo de ejecución.
- Prototipado de asistentes sobre imágenes en entornos de investigación: el modelo acepta pares imagen-texto y genera respuestas conversacionales, adecuado para pruebas internas de pipelines de captioning o VQA.
- Base para nuevos ajustes: al estar ya fusionado, se puede usar como punto de partida para un segundo SFT sin arrastrar la complejidad de cargar dos artefactos.
- Docencia y formación: ejemplo didáctico de cómo un adaptador LoRA de 50 pasos modifica 252 módulos de un modelo multimodal y cómo se valida el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,9 GB solo para pesos (4,44 B × 2 bytes), más memoria para activaciones y caché KV; en la práctica, entre 12 y 16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5 GB de pesos; en 4 bits, en torno a 2,3 GB, más overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue concurrente; una RTX 4090 (24 GB) es suficiente para bf16 en un solo usuario.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización a 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: `transformers` (librería declarada), y por compatibilidad de safetensors, vLLM, TGI o llama.cpp tras conversión a GGUF; no se documenta soporte verificado en ninguna de ellas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| vanilla-sft-qwen3-vl-4b-thinking | 4,44 B | no disponible | no disponible | Hugging Face, 0 descargas | Merge de LoRA r16 sobre Qwen3-VL-4B-Thinking |
| Qwen/Qwen3-VL-4B-Thinking (base) | ~4 B | no disponible en esta ficha | la del base (no verificada aquí) | Hugging Face, modelo oficial | Modelo original de Alibaba, sin ajuste del autor |
| Qwen2.5-VL-3B-Instruct | ~3 B | no disponible en esta ficha | la del base (no verificada aquí) | Hugging Face | Alternativa multimodal de generación anterior; comparación cualitativa |
| Qwen2.5-VL-7B-Instruct | ~7 B | no disponible en esta ficha | la del base (no verificada aquí) | Hugging Face | Alternativa de mayor tamaño para tareas de visión-lenguaje |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del modelo base Qwen3-VL-4B-Thinking antes de cualquier despliegue.
- Idiomas no especificados: se desconoce el comportamiento en castellano u otras lenguas distintas de las del base.
- Entrenamiento muy corto: 50 pasos sobre 32 partidas y un learning rate de 1e-5; el efecto del ajuste es limitado y puede introducir sesgos hacia el formato de "turno de una línea" del dataset.
- Dataset no documentado: no se describe la composición, el origen de las imágenes ni la distribución de tareas, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinación: inherente a los modelos de lenguaje y agravado en tareas de visión cuando la imagen no contiene la información solicitada; no hay evaluaciones publicadas que lo cuantifiquen.
- Diferencia numérica respecto al adaptador en tiempo de ejecución: la fusión en bf16 puede producir salidas ligeramente distintas de las del base más adaptador, según advierte el propio autor.
- Sin benchmarks ni evaluaciones: no hay métricas que permitan comparar su calidad con el base.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Repo de 8,9 GB: requiere espacio en disco y ancho de banda considerables para descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/vanilla-sft-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- README del base incluido en el repo: `README.base.md` (referenciado en la model card)
- Informe de fusión: `MERGE-REPORT.json` (referenciado en la model card, no enlazado públicamente en la información disponible)
- Paper, blog o demo: no disponible
