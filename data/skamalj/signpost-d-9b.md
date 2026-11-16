# skamalj/signpost-d-9b

## Resumen

Signpost-D 9B es un modelo de decisión derivado por fine-tuning de Qwen/Qwen3.5-9B, desarrollado por el usuario skamalj. No es un modelo generativo al uso: recibe un estado (un registro JSON o texto) y un conjunto de preguntas tipadas sobre ese estado, y devuelve para cada pregunta una distribución de probabilidad sobre sus opciones. Admite tres tipos de pregunta: `noul` (sí o no), `choice` (una opción entre varias) y `score` (un nivel en una escala). Cada pregunta se resuelve en un único forward pass leyendo las probabilidades de los tokens de respuesta, sin decodificación autoregresiva de texto libre.

El modelo conserva los pesos de texto y de visión del base (la torre de visión queda sin modificar) y se sirve sin adaptadores, con los pesos fusionados. Con 9.409.813.744 parámetros reales en safetensors (el autor indica 9.7B en fp16), una ventana de 8.192 tokens por pregunta y licencia Apache-2.0, se posiciona como una alternativa de mayor tamaño a Signpost-D 4B dentro de la misma familia, orientada a decisiones calibradas y tipadas en lugar de a la generación de lenguaje.

Su relevancia actual radica en el enfoque: en lugar de pedir a un LLM que razone y emita una respuesta en texto, el modelo produce directamente probabilidades calibradas por opción, lo que facilita su integración en sistemas de enrutamiento, triaje o scoring donde se necesita una señal numérica fiable. El autor reporta una precisión de 0,7345 en el split `test` del benchmark Typed Decisions, con una latencia mediana de 214 ms por caso (cinco preguntas) sobre una NVIDIA L40S.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (pesos de texto y visión conservados; torre de visión sin modificar), con proyecciones de atención lineal en los módulos adaptados |
| Parametros totales | 9.409.813.744 (dato real de safetensors); el autor indica 9.7B en fp16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8.192 tokens por pregunta |
| Tipos de cuantizacion | No disponible (el autor solo documenta fp16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (pesos fusionados, sin adaptador necesario); adaptadores LoRA en `adapters/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de texto e imagen, y conserva tanto los pesos de texto como los de visión, con la torre de visión intacta. Sobre esa base se aplica un fine-tuning LoRA con rango 16 (α 16) en 200 módulos, incluidas las proyecciones de atención lineal; una de las tres ejecuciones usa rango 32 (α 32). El entrenamiento emplea tasa de aprendizaje 1e-4 (5e-5 en la ejecución de rango 32), 15 % de warm-up, dropout 0,05, 2 épocas y fp16, con una duración de unos 99 minutos por ejecución en una NVIDIA L40S. La pérdida combina entropía cruzada con etiquetas suaves y, en las preguntas de tipo `score`, 0,5 × el error de nivel esperado. Los tres adaptadores resultantes (época 2) se promedian en un weight soup y se añade el 0,75 de esa media a los pesos base.

Los datos de entrenamiento son propios: 2.575 registros (12.274 preguntas) en 163 dominios inventados, cada uno con un estado JSON corto y cinco preguntas. Los generadores LLM diseñan las familias de registros y escriben los registros; el gold es la media de tres jueces simulados (un operador cuidadoso, un auditor estricto y un generalista) y cada registro pasa controles de aceptación o descarte. No se incluye ninguna fila, etiqueta o pregunta del benchmark Typed Decisions, ni se usan sus cuatro flujos de trabajo (trazas de agente, atención al cliente, facturas e incidentes de seguridad). El split `train` del benchmark nunca se usó para entrenar, ajustar ni calibrar: solo se analizó una muestra para orientar los prompts de los generadores. El formato de entrenamiento es una pregunta por secuencia, exactamente con el prompt que construye `/v1/systemone` de vLLM (estado en JSON, pregunta, opciones etiquetadas y línea de respuesta, sin mensaje de sistema y con thinking desactivado), y se entrena sobre el logit del primer token de respuesta entre las etiquetas de opción.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: `noul` (sí/no), `choice` (una entre varias opciones) y `score` (nivel en una escala), con distribución de probabilidad por opción.
- Calibración de probabilidades: el modelo está entrenado para producir distribuciones calibradas (ECE de 0,101 en el benchmark), no solo la etiqueta más probable.
- Procesamiento de estados en JSON o texto como entrada, con hasta 8.192 tokens por pregunta.
- Entrada multimodal imagen-texto heredada del base (pipeline `image-text-to-text`), aunque la model card no documenta casos de uso de visión para este fine-tuning.
- Servicio nativo mediante el endpoint `/v1/systemone` de vLLM, con lectura de logprobs en modo `raw_logprobs`.
- Sin generación de texto libre ni modo thinking: cada pregunta es un único forward pass.
- Soporte de tool calling, function calling, agentes multi-paso o capacidades multilingües: no disponible (solo inglés declarado y sin documentación al respecto).
- Capacidades de razonamiento, código o matemáticas: no evaluadas ni documentadas en la información disponible.

## Casos de uso

- Triaje de incidencias de seguridad: dado un registro JSON con los campos de un incidente, el modelo responde preguntas `noul` (¿requiere escalado?), `choice` (¿a qué equipo se deriva?) y `score` (nivel de severidad), con probabilidades que permiten fijar umbrales de automatización.
- Gestión de pedidos y logística: con un estado como `{"order": {"paid": true, "shipped": false, "days_since_payment": 9}}`, se consulta si el pedido va tarde (`noul`), qué acción procede (`choice`: enviar, reembolsar, esperar) y la probabilidad de reclamación (`score`), tal como muestra el ejemplo de la model card.
- Enrutamiento de tickets de atención al cliente: clasificación de cada ticket en categorías mediante preguntas `choice` y estimación de urgencia con `score`, aprovechando la calibración para derivar solo los casos por encima de un umbral de probabilidad.
- Validación de facturas: comprobación de campos y coherencia de un registro de factura con preguntas booleanas y de nivel, integrable en un pipeline de contabilidad que consuma las probabilidades en lugar de texto.
- Scoring de riesgo en procesos internos: cualquier flujo con estado estructurado (solicitudes, expedientes, controles) donde se necesite una probabilidad por nivel en lugar de una respuesta generativa, con latencia de ~214 ms por caso de cinco preguntas.
- Automatización de decisiones con umbral configurable: al devolver distribuciones calibradas, permite separar decisiones automáticas (alta confianza) de las que requieren revisión humana, algo que un LLM generativo no ofrece de forma nativa.
- Evaluación comparativa de políticas: uso del modelo como juez probabilístico sobre estados simulados para medir la coherencia de reglas de negocio antes de desplegarlas.

## Benchmarks y rendimiento

Resultados en el split `test` de LocalLLaMA/typed-decisions (400 casos, 2.000 decisiones, una petición por caso, todas respondidas sin errores), servido con vLLM nightly con `--max-model-len 8192 --max-num-seqs 8 --logprobs-mode raw_logprobs` y puntuado con el scorer del benchmark:

| Modelo | Accuracy ↑ | KL from gold ↓ | Brier ↓ | ECE ↓ |
|---|---|---|---|---|
| Signpost-D 9B | 0,7345 [0,713; 0,756] | 0,159 | 0,082 | 0,101 |
| Signpost-D 4B | 0,712 [0,691; 0,734] | 0,162 | 0,085 | 0,091 |
| Prior (ignora la entrada) | 0,470 | 0,347 | 0,189 | 0,088 |
| Uniform | 0,308 | 0,444 | 0,238 | 0,169 |

El intervalo del 95 % es un bootstrap sobre casos. Desglose por tipo de pregunta:

| Tipo | n | Accuracy |
|---|---|---|
| `noul` | 600 | 0,818 |
| `choice` | 600 | 0,735 |
| `score` | 800 | 0,670 |

Comparación de candidatos en el split `train` (1.200 casos, nunca entrenado):

| Candidato | Accuracy / KL en `train` |
|---|---|
| Rango 16, lr 1e-4, semilla 42 | 0,7277 / 0,1671 |
| Rango 16, lr 1e-4, semilla 1042 | 0,7192 / 0,1712 |
| Rango 32, lr 5e-5, semilla 42 | 0,7160 / 0,1717 |
| Soup de las 3 ejecuciones, α 0,75 (este modelo) | 0,7315 / 0,1684 |

El autor indica que el gold es la media de tres muestras de un profesor de capacidad aproximada de 4B, por lo que las puntuaciones miden la concordancia con ese profesor; la autoconsistencia del profesor en el benchmark es 0,735. Latencia mediana: 214 ms por caso (5 preguntas) en una NVIDIA L40S con vLLM en fp16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,4B parámetros en fp16, los pesos ocupan aproximadamente 18,8 GB, a lo que hay que sumar la caché KV y el overhead de vLLM.
- GPU recomendadas: el autor valida el despliegue en una NVIDIA L40S (48 GB); por tamaño, cabría también en A100 de 40/80 GB y H100.
- GPU de consumo: no documentado; en fp16 no cabría en GPUs de 24 GB como la RTX 4090 sin cuantización, y no se publican pesos GGUF ni cuantizados.
- Opciones de despliegue: vLLM con el endpoint `/v1/systemone` (método validado por el autor); compatible con la librería `transformers`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 214 ms por caso de cinco preguntas en L40S con vLLM fp16; throughput no disponible.
- Los adaptadores LoRA originales están en `adapters/` del repo, pero los pesos publicados ya están fusionados y no requieren adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (Typed Decisions test) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Signpost-D 9B | 9,4B | 8.192 tokens/pregunta | 0,7345 | 0,101 | Apache-2.0 | Hugging Face (skamalj/signpost-d-9b) |
| Signpost-D 4B | No disponible | No disponible | 0,712 | 0,091 | No disponible | Hugging Face (skamalj/signpost-d-4b) |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | No disponible | No disponible | No disponible | Hugging Face (Qwen/Qwen3.5-9B) |

Frente a un LLM generativo de tamaño similar, la diferencia principal no está en los parámetros sino en la interfaz: Signpost-D devuelve distribuciones calibradas por opción en un forward pass, mientras que un modelo conversacional requeriría prompting y decodificación de texto, con mayor latencia y sin calibración garantizada. No se dispone de datos de benchmarks comparables de otros modelos de decisión en la información proporcionada.

## Limitaciones y advertencias

- El gold del benchmark es la media de tres muestras de un profesor de ~4B, no anotación humana; las métricas miden concordancia con ese profesor y su techo práctico ronda 0,735.
- Solo declara inglés; no hay soporte multilingüe documentado.
- No genera texto: cualquier caso de uso que requiera explicaciones o respuestas en lenguaje natural queda fuera de su diseño.
- La precisión en preguntas de tipo `score` es la más baja (0,670 frente a 0,818 en `noul`), por lo que las escalas requieren umbrales cuidadosos.
- El ECE (0,101) es peor que el de Signpost-D 4B (0,091) y que el del prior (0,088): la calibración es buena pero no la mejor de la familia.
- Riesgo de alucinación en el sentido de asignar probabilidades altas a opciones incorrectas cuando el estado de entrada es ambiguo o está fuera de la distribución de los 163 dominios sintéticos de entrenamiento; no se documentan evaluaciones de robustez fuera de dominio.
- Sesgos conocidos: no documentados.
- Licencia Apache-2.0, igual que el base, lo que permite uso comercial; aun así, conviene verificar las condiciones del modelo base Qwen3.5-9B.
- Requiere vLLM con soporte del endpoint `/v1/systemone` y modo `raw_logprobs`; el autor usó una build nightly, por lo que la compatibilidad con versiones estables no está garantizada.
- El modelo se publicó con solo cuatro ejecuciones en `test` y un umbral fijado de antemano (0,73); la diferencia de 0,0005 entre la puntuación publicada y la reconstruida se atribuye a no determinismo de la GPU en vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skamalj/signpost-d-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Signpost-D 4B: https://huggingface.co/skamalj/signpost-d-4b
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Predicciones del split `test`: https://huggingface.co/skamalj/signpost-d-9b/blob/main/typed_decisions_test_predictions.json
- Adaptadores LoRA: https://huggingface.co/skamalj/signpost-d-9b/tree/main/adapters
