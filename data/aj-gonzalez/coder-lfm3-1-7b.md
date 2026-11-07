# AJ-Gonzalez/coder-lfm3-1.7b

## Resumen

coder-lfm3-1.7b es un ajuste fino mediante LoRA SFT del modelo LiquidAI/LFM3-1.7B, publicado por el usuario AJ-Gonzalez en Hugging Face. El objetivo no es crear un modelo de código desde cero, sino sesgar un modelo base ya existente hacia un formato de razonamiento explícito seguido de respuesta (estilo «reasoning-then-answer»), imitando las trazas de un modelo profesor. El entrenamiento se hizo sobre 70 prompts de razonamiento etiquetados como código, ciencias de la computación y estadística, extraídos del conjunto de destilación Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x.

El modelo base, LFM3-1.7B de Liquid AI, emplea la arquitectura tri-híbrida LFM3 y está orientado a agentes locales y aplicaciones especializadas, con una ventana de contexto nativa de 256K tokens y soporte de tool calling. Este ajuste concreto, sin embargo, se entrenó únicamente con secuencias de 2048 tokens, por lo que no conserva formación específica para contextos largos.

Es relevante como ejemplo de flujo de trabajo de destilación ligera en hardware de consumo: el entrenamiento completo (tres épocas) se ejecutó en un MacBook Air M1 con 8 GB de memoria unificada, a 194-211 tok/s, en 2 horas y 11 minutos. El checkpoint publicado corresponde a la época 1 de 3, seleccionada por mejor pérdida en validación. Los pesos están en formato MLX safetensors, dequantizados a bfloat16 desde el checkpoint oficial de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido LFM3 (modelo base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.536 (1,7B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256K tokens en el modelo base; entrenamiento de este ajuste limitado a 2048 tokens |
| Tipos de cuantizacion | Pesos publicados en bfloat16 (dequantizados desde 4-bit affine g64 del checkpoint base MLX) |
| Idiomas soportados | en |
| Licencia | lfm-open-license-v1.0 (modelo base); datos de entrenamiento con licencia «other» en el Hub |
| Formato de pesos | safetensors en formato MLX (sin conversión a torch) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida LFM3 del modelo base de Liquid AI, un diseño que combina capas de atención con otros mecanismos de secuencia (la documentación oficial la describe como «tri-hybrid», sin más detalle en la información disponible). El ajuste se aplicó como LoRA de rango 8 sobre 8 de las 24 capas, con 2.753M parámetros entrenables (0,159% del total). Se partió del checkpoint oficial LiquidAI/LFM3-1.7B-MLX-4bit (cuantización affine de 4 bits con grupo 64), dequantizado en el momento de fusionar los pesos.

Los datos provienen de 70 prompts de entrenamiento (282 ejemplos tras el troceado) y 7 prompts de validación (32 ejemplos), filtrados del conjunto Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x por etiquetas de código, ciencias de la computación y estadística. Las trazas largas del asistente no se truncaron: cada conversación se dividió en ventanas de 2048 tokens con 256 tokens de solapamiento del ventana anterior como contexto, de modo que cada token se entrenó exactamente una vez por época. Sin este troceado, la NLL del modelo base solo habría cubierto el 24% de las filas. El entrenamiento usó batch 1, learning rate 1e-5 con Adam y 282 iteraciones para la época 1 de una ejecución total de 846 iteraciones. No se aplicó RLHF ni DPO, ni ajuste de seguridad, ni entrenamiento de tool calling.

## Capacidades

- Generación de texto conversacional con formato de razonamiento explícito: produce trazas normativas del tipo «The user asks… We need to…» dentro de etiquetas `<think>` antes de la respuesta final.
- Generación de código en Python para tareas sencillas (verificación de primos, manipulación de cadenas, expresiones regulares), aunque el autor indica que la mejora es de estilo y formato, no de capacidad de código.
- Razonamiento matemático y estadístico básico, heredado del conjunto de destilación.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidades del modelo base no reentrenadas: soporte nativo de tool calling y ventana de 256K tokens (no reforzadas por este ajuste, que solo cubre 2048 tokens).
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Investigación sobre destilación de razonamiento: sirve como referencia reproducible de un pipeline completo de destilación con LoRA en hardware de consumo (MacBook Air M1, 8 GB), útil para estudiar cómo se transfieren trazas de razonamiento de un profesor a un modelo pequeño.
- Prototipado de asistentes de código con trazas auditables: el formato `<think>` permite inspeccionar el razonamiento intermedio antes de la respuesta, lo que facilita la depuración en entornos de desarrollo locales sobre Apple Silicon.
- Experimentos de formato de salida: útil para comparar el efecto del formato «razonamiento y luego respuesta» frente al modelo base en tareas de código y estadística, manteniendo el resto de variables controladas.
- Docencia y formación en ajuste fino: el modelo documenta con detalle el troceado de secuencias, la selección de checkpoint por pérdida de validación y las limitaciones del conjunto de validación, lo que lo convierte en un caso de estudio de buenas prácticas (y de sus límites).
- Evaluación de la licencia LFM Open v1.0 en flujos derivados: permite probar la redistribución de pesos derivados y verificar las obligaciones de la licencia antes de usarla en productos.
- Base para nuevos ajustes de dominio: al estar en bfloat16 y con la arquitectura LFM3 intacta, puede servir como punto de partida para SFT adicional con TRL u otras herramientas, aunque requeriría conversión desde MLX si se quiere usar fuera de Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pérdida NLL en tokens sobre el conjunto de validación retenido (32 fragmentos):

| Modelo | Coder (held-out) | Filas de matemáticas | Filas de salud |
|---|---|---|---|
| Base (4-bit) | 1,430 | 1,959 | 1,889 |
| Este modelo (época 1) | 1,288 | 1,045 | 1,649 |
| Época 3 (no publicada) | 1,294 | 0,982 | 1,670 |

Prueba de humo de código (ejecución en subproceso, funciones de un argumento con casos fijos): verificación de primos 12/12, eliminación de vocales 5/5, regex de email 5/5. El modelo base obtiene exactamente las mismas puntuaciones, por lo que estas tareas no discriminan entre ambos; la ganancia es de estilo y formato de traza, no de capacidad de código. Las diferencias de pérdida entre épocas 1 y 3 están dentro del ruido estadístico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 (tamaño del repositorio); en cuantización de 4 bits del modelo base, alrededor de 1 GB.
- GPU recomendadas: el formato publicado es MLX, por lo que el destino natural es Apple Silicon (M1, M2, M3, M4) con memoria unificada. En el entrenamiento se usó un MacBook Air M1 con 8 GB.
- Cabe en GPU de consumo: sí, en cualquier Apple Silicon con 8 GB o más de memoria unificada. Para GPUs NVIDIA sería necesaria una conversión a torch/GGUF no incluida en el repositorio.
- Opciones de despliegue: `mlx-lm` versión 0.32.2 o superior (el soporte de LFM3 se fusionó recientemente en ml-explore/mlx-lm#2016; con versiones anteriores hay que copiar `mlx_lm/models/lfm3.py` a site-packages). El modelo base es compatible con vLLM, SGLang y compilaciones de llama.cpp compatibles con LFM3, pero este ajuste concreto no incluye conversión a esos formatos.
- Latencia y throughput: 194-211 tok/s durante el entrenamiento en MacBook Air M1; no se reportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coder-lfm3-1.7b (este) | 1,7B | 2048 en entrenamiento (256K en base) | MLX safetensors bf16 | LFM Open v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1,7B | 256K | safetensors, GGUF, MLX | LFM Open v1.0 | Hugging Face, oficial |
| Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x (profesor) | no disponible | no disponible | dataset de trazas | «other» | Hugging Face (xtools-at) |
| TeichAI/claude-4.5-opus-high-reasoning-250x (origen citado) | no disponible | no disponible | dataset de trazas | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: 70 prompts, 3 temas y una sola época. El autor advierte explícitamente que no convierte el modelo en un modelo de código, sino que sesga uno existente hacia un formato de razonamiento.
- Conjunto de validación de solo 7 prompts (32 fragmentos): las diferencias de pérdida entre épocas están dentro del ruido, por lo que la selección de la época 1 frente a la 3 no es concluyente.
- Las trazas objetivo son de segunda mano: fueron generadas por xiaomi/mimo-v2.6-pro, y la data card cita como origen TeichAI/claude-4.5-opus-high-reasoning-250x, de modo que el estilo imitado es indirecto.
- Sin ajuste de seguridad, sin entrenamiento de tool calling y sin entrenamiento en contexto largo (más de 2048 tokens).
- Riesgo de alucinación inherente a un modelo de 1,7B con ajuste ligero; no hay evaluación de robustez ni de sesgos en la información disponible.
- Licencia: el modelo base usa LFM Open License v1.0; los datos de entrenamiento figuran como «other» en el Hub, por lo que hay que revisar sus términos antes de redistribuir los pesos con fines comerciales.
- Formato MLX exclusivamente: no hay conversión a torch ni GGUF, lo que limita el despliegue fuera de Apple Silicon sin trabajo adicional.
- Idioma: solo inglés según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentación oficial de LFM3-1.7B: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/xtools-at/Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x
- Origen citado de las trazas: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Soporte de LFM3 en mlx-lm (PR #2016): https://github.com/ml-explore/mlx-lm/pull/2016
