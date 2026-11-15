# mlboydaisuke/Kev-4B-CoreAI

## Resumen
Kev-4B-CoreAI es una conversión al formato Core AI (`.aimodel`) de Apple del modelo `jaredpalmer/kev-4b`, un modelo de decisión construido sobre Qwen3.5-4B-Base. No es un modelo generativo: recibe un estado (texto libre o un objeto/array JSON) y un conjunto de preguntas tipadas (`noul` sí/no, `choice` con opciones nombradas o `score` con niveles ordenados) y devuelve una probabilidad para cada opción de cada pregunta. Está pensado para clasificar, enrutar, triagear o verificar documentos con probabilidades calibrables mediante umbrales, por ejemplo para derivar casos inciertos a revisión humana.

El modelo original fue entrenado por Jared Palmer como un adaptador LoRA de rango 16 más una cabeza pointer sobre Qwen3.5-4B-Base, un transformer híbrido de 32 capas (24 Gated DeltaNet y 8 de atención completa) con tamaño oculto de 2.560. Esta conversión, publicada por mlboydaisuke, fusiona el adaptador en la base y exporta el backbone de texto como un grafo Core AI estático que acepta 128 tokens por llamada y devuelve el hidden state tras la normalización final, sin cabeza de vocabulario. La cabeza pointer se ejecuta en el host con los pesos originales.

La relevancia actual radica en su formato de despliegue: es una de las pocas conversiones Core AI de un modelo de decisión estructurado, ejecutable sobre GPU Metal en macOS 27, con un contrato de lectura documentado y paridad de probabilidades verificada contra el código fp32 del autor. El modelo está limitado a inglés, licencia Apache-2.0 y un pipeline declarado de text-classification.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (24 capas Gated DeltaNet + 8 capas de atención completa), sin cabeza de vocabulario en la exportación; cabeza pointer separada en el host |
| Parámetros totales | 4B (modelo base Qwen3.5-4B-Base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Máximo 3.968 tokens por fila; el grafo tiene un límite de posición de 4.095; llamadas estáticas de 128 tokens |
| Tipos de cuantización | fp16 (pesos del grafo, 8,41 GB); cabeza pointer en fp32; recurrencia Gated DeltaNet en kernel Metal fp32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI `.aimodel` (bundle `gpu-pipelined/kev_4b_decode_fp16_metal_pf128/`); pesos de la cabeza en `head.pt` (fp32) |

## Arquitectura y entrenamiento
El modelo base es Qwen3.5-4B-Base, un transformer híbrido de 32 capas que combina 24 capas Gated DeltaNet (atención lineal con recurrencia) y 8 capas de atención completa, con tamaño oculto de 2.560. Sobre esa base, Jared Palmer entrenó un adaptador LoRA de rango 16 y una cabeza pointer que puntúa el token de cierre de cada opción contra el último token de la pregunta. La fórmula de la cabeza es `z_k = ((W_k h_opt_k + b_k) · (W_q h_decide + b_q)) / 16`, con `p = softmax(z / T)` dentro de cada pregunta y temperatura T = 2,406050072164233; `W_q` y `W_k` son matrices `[256, 2560]` con sesgos en fp32.

La conversión fusiona el adaptador en la base con el script de merge del autor y exporta el backbone como un único grafo Core AI estático de 128 tokens por llamada, sin cabeza de vocabulario. Cada capa Gated DeltaNet ejecuta su recurrencia en un kernel Metal fp32, con un dispatch de GPU por capa y por llamada. El contrato de lectura (readout) usa delimitadores del tokenizer base: `<|fim_prefix|>` (248060), `<|fim_middle|>` (248061), `<|box_start|>`/`<|box_end|>` (248049/248050) y `<|fim_suffix|>` (248062); pad = eos = 248044, sin bos. El prefijo compartido es opcional y exacto: las llamadas de 128 tokens del estado se ejecutan una vez y se copian por pregunta, con hidden states idénticos bit a bit a la ejecución directa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades
- Clasificación y decisión estructurada: devuelve una probabilidad por cada opción de cada pregunta tipada (`noul`, `choice`, `score`).
- Salida estructurada compatible con SystemOne: entrada `{model, state, questions}`, salida `{model, answers, usage}`.
- Procesamiento de estados en texto libre o JSON (objeto o array).
- Umbralización de probabilidades para enrutar casos inciertos a revisión humana.
- Ejecución en dispositivo (on-device) sobre GPU Metal en macOS.
- Soporte de prefijo compartido para reutilizar el cómputo del estado entre múltiples preguntas.
- No genera texto: no hay decodificación autoregresiva ni cabeza de vocabulario en la exportación.
- Capacidades multilingües: solo inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso
- Triage de documentos: dado el texto de un documento como estado y preguntas `noul` del tipo "¿requiere revisión legal?", el modelo devuelve probabilidades umbralizables para derivar los casos dudosos a un humano.
- Enrutamiento de tickets de soporte: con el ticket como estado y preguntas `choice` sobre categoría o departamento, se obtiene una distribución de probabilidad por categoría que permite enrutar con umbral de confianza.
- Verificación de formularios: usando el JSON del formulario como estado y preguntas `noul` sobre consistencia de campos, el modelo puntúa cada comprobación de forma independiente.
- Moderación y clasificación de contenido: preguntas `score` con niveles ordenados (por ejemplo, gravedad de 1 a 5) sobre un texto de entrada, con probabilidad por nivel.
- Extracción de decisiones en pipelines de datos: integración en un flujo que envía estados JSON y recibe respuestas tipadas, apto para procesos batch donde no se necesita generación de texto.
- Evaluación de riesgo en revisión de contratos: preguntas `noul` sobre cláusulas concretas con probabilidades calibradas para priorizar la revisión manual.
- Despliegue local en Mac: aplicaciones macOS que requieren clasificación sensible sin enviar datos a la nube, ejecutando el grafo Core AI en la GPU del equipo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card reporta una medición de latencia: una pregunta de 94 tokens tarda 100,2 ms en un M4 Max con macOS 27.0 (26A428), medida el 2026-10-04 en Swift. La verificación de la conversión consiste en paridad de probabilidades con el código fp32 del autor sobre un fixture de 434 preguntas y un conjunto held-out de 130, con doce casi-empates en el fixture y cuatro en el held-out.

## Requisitos de hardware
- VRAM/almacenamiento: el bundle fp16 ocupa 8.431 MB (8,41 GB); el repositorio completo pesa 8,4 GB.
- GPU recomendada: Apple Silicon con GPU Metal; probado en M4 Max con macOS 27.
- Requiere macOS 27 para la variante `gpu-pipelined/kev_4b_decode_fp16_metal_pf128/`.
- No se documenta compatibilidad con GPU NVIDIA ni con CUDA en la información disponible.
- Cabe en hardware consumer Apple Silicon de gama alta (M4 Max); no se especifican requisitos para modelos inferiores.
- Opciones de despliegue: paquete Swift `Kev` del coreai-model-zoo (`KevDecider(bundle:)`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 100,2 ms por pregunta de 94 tokens en M4 Max. No se documenta throughput para lotes.
- En iPhone: el intento de cargar un asset AOT de un grafo anterior en un iPhone 18 Pro provocó un crash; esta release está pensada para Mac. La variante Kev-0.8B sí está medida en iPhone 18 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-4B-CoreAI | 4B | 3.968 tokens por fila | Modelo de decisión (Core AI, on-device Mac) | Apache-2.0 | Hugging Face, 16 descargas |
| Kev-0.8B | 0,8B | no disponible | Modelo de decisión (misma familia, medido en iPhone 18 Pro) | no disponible | coreai-model-zoo |
| jaredpalmer/kev-4b | 4B | no disponible | Modelo de decisión (formato original, fp32) | Apache-2.0 | Hugging Face |
| Qwen3.5-4B-Base | 4B | no disponible | Modelo generativo base | no disponible | Hugging Face |

## Limitaciones y advertencias
- No es un modelo generativo: no produce texto libre, solo probabilidades por opción; cualquier uso que requiera generación es inviable.
- Solo soporta inglés; no se documenta comportamiento en otros idiomas.
- Límite estricto de 3.968 tokens por fila, con llamadas estáticas de 128 tokens y límite de posición de 4.095 en el grafo.
- El repositorio `kev-4b` conserva ficheros de tokenizer de la era Qwen3 (`vocab.json`, `merges.txt`, `added_tokens.json`) con identificadores de delimitador distintos; el loader del autor y este port leen el tokenizer desde la base, por lo que usar los ficheros del repositorio directamente puede producir errores.
- La release está orientada a Mac con macOS 27; el intento de carga en iPhone 18 Pro con un asset AOT anterior provocó un crash.
- Los resultados de benchmarks del autor no han sido re-medidos en esta conversión; solo se verifica paridad de probabilidades contra su código fp32.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; se recomienda umbralización con revisión humana.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución; verificar las condiciones del modelo base Qwen3.5-4B-Base.
- En producción: la cabeza pointer se ejecuta en el host en fp32 y requiere los pesos `head.pt`; la temperatura T está fijada en 2,406050072164233 y cambiarla altera la calibración.

## Enlaces
- Hugging Face: https://huggingface.co/mlboydaisuke/Kev-4B-CoreAI
- Modelo base original: https://huggingface.co/jaredpalmer/kev-4b/tree/6cfce5c2fa4b4bd64026336ab649c5ca78857d52
- Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/tree/1001bb4d826a52d1f399e183466143f4da7b741b
- Core AI model zoo (card y scripts): https://github.com/john-rocky/coreai-model-zoo/blob/main/models/kev-4b/README.md
- Paquete Swift Kev: https://github.com/john-rocky/coreai-model-zoo/tree/main/apps/Kev
- Card de Kev-0.8B (contrato de lectura): https://github.com/john-rocky/coreai-model-zoo/blob/main/models/kev-0.8b/README.md
- Fixtures de verificación: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/kev-4b/fixtures-kev-4b.json
