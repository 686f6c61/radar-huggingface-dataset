# electroglyph/KnowLine-4B-Gen5.5-onnx

## Resumen

KnowLine-4B-Gen5.5 en formato ONNX es la conversión a ONNX Runtime del modelo PelaAI/KnowLine-4B-Gen5.5, un fine-tune de Qwen3.5-4B con arquitectura `Qwen3_5ForConditionalGeneration`. El autor de la conversión es electroglyph y publica cuatro builds (CUDA int8, CUDA int4, CPU int8 y CPU int4) ejecutables con la última versión de onnxruntime sin necesidad de PyTorch en inferencia. El repositorio ocupa 16,6 GB en total y se distribuye bajo licencia Apache-2.0 para los pesos.

El modelo no es un chatbot generativo al uso: está diseñado como **modelo de decisión**. Recibe un estado (texto libre) y un conjunto de preguntas tipadas —sí/no (`noul`), elección entre k opciones (`choice`) y rúbrica puntuada 0..k-1 (`score`)— y devuelve una distribución de probabilidad por pregunta en un único prefill, sin generar texto. Esto lo hace adecuado para tareas de triaje, moderación, enrutado y scoring estructurado donde se necesita una probabilidad calibrada y no una respuesta en lenguaje natural.

La relevancia actual radica en su empaquetado: builds ONNX cuantizados a int4 e int8 con paridad verificada frente al modelo original en PyTorch/SGLang, tokenizer byte-idéntico al serving original y una temperatura de calibración (T = 1.50) plegada en los pesos. Permite desplegar el modelo en CPU o GPU de consumo sin stack PyTorch y con latencias de un solo prefill por petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `Qwen3_5ForConditionalGeneration` (base Qwen3.5-4B) |
| Parametros totales | 4B (heredado del modelo base, no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa ~1.200 tokens de entrada) |
| Tipos de cuantizacion | int8 (chunks de 32), int4 k-quant (bloque 32, LM head en int8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); scripts runner bajo MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), ejecutable con onnxruntime |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Qwen3.5-4B con la clase `Qwen3_5ForConditionalGeneration`, es decir, un transformer decoder-only de 4B parámetros. La conversión a ONNX se realizó con exportación estándar de torch y posterior cuantización: los builds int8 mantienen los pesos completos en 8 bits con chunks de 32 y la matemática de ejecución intacta; los builds int4 aplican cuantización k-quant de bloque 32 con solo el LM head en int8. Se incluye un `config.json` con la configuración de arquitectura fuente en cada build.

El detalle técnico más relevante es el mecanismo de scoring: en lugar de generar texto, el modelo aplica un softmax sobre los logits de los tokens de etiqueta (label-token softmax) para producir directamente una distribución de probabilidad por pregunta. Los prompts usan el layout de serving Gen5.5 (chat template con "read-twice" activado por defecto, desactivable con `--no-read-twice` para prompts Gen5), lo que garantiza que las salidas sean comparables con el serving original en PyTorch/SGLang. La calibración de temperatura T = 1.50 está plegada en los pesos, por lo que no se necesita fichero de calibración externo. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Clasificación y scoring estructurado: preguntas sí/no (`noul`), elección entre opciones (`choice`) y rúbricas puntuadas (`score`) con distribución completa de probabilidad.
- Procesamiento de estado en texto libre con contexto de al menos ~1.200 tokens por petición (según ejemplos de la model card).
- Hasta 64 preguntas por petición y hasta 255 opciones por pregunta.
- Salida de distribuciones completas, no solo la media, lo que permite usar la dispersión (masa entre niveles) para enrutar a revisión humana.
- Generación de texto libre como capacidad secundaria mediante `generate.py` (chat).
- Inferencia sin PyTorch: ejecutable con onnxruntime en CPU o CUDA.
- Paridad de scoring verificada frente al modelo original en PyTorch (herramientas `verify_parity.py` y `compare_all.py` incluidas).
- Solo texto: el procesamiento de imágenes requiere SGLang en el repositorio fuente, no está soportado en estos builds ONNX.
- No se documentan capacidades de tool calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- **Triaje de soporte al cliente**: enviar el estado de la conversación (historial, problema, expectativas) junto con preguntas como "¿procede reembolso?" (`noul`), "¿prioridad?" (`choice`: low/normal/urgent) y "¿tono del cliente?" (`choice`: angry/neutral/happy). El modelo devuelve probabilidades en un solo prefill, permitiendo enrutar tickets automáticamente cuando la confianza supera el umbral.
- **Moderación de contenido**: evaluar publicaciones con preguntas "¿viola la política?" (`noul`), "¿categoría?" (`choice`: legit/spam/scam/abuse) y "¿severidad?" (`score` 0..4). La distribución de severidad permite distinguir entre acción automática (categoría con alta confianza) y revisión humana (severidad ambigua).
- **Enrutado de peticiones en pipelines LLM**: usar el modelo como clasificador de intención o dificultad antes de invocar un modelo generativo mayor, reduciendo coste al derivar solo los casos necesarios.
- **Scoring de satisfacción esperada**: estimar la satisfacción del cliente (rúbrica 0..4) antes de aplicar una acción de soporte, para priorizar intervenciones proactivas.
- **Clasificación de riesgo en onboarding**: puntuar cuentas nuevas o transacciones con rúbricas de riesgo y distribuciones calibradas, integrable en sistemas de decisión existentes vía ONNX Runtime.
- **Evaluación automática de respuestas**: puntuar respuestas de otros modelos o de humanos contra rúbricas definidas (calidad, toxicidad, relevancia) devolviendo expectativa y distribución por nivel.
- **Despliegue en entornos sin GPU o sin PyTorch**: los builds `model-cpu-int4` (~2,6 GB) y `model-cpu-int8` (~6,9 GB) permiten ejecutar el scoring en servidores CPU estándar, útil para entornos regulados donde no se permite el stack PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente ejemplos cualitativos de scoring (triaje de soporte y moderación) y logs de verificación de paridad (`parity*.log`, `compare_all.py`), pero no cifras de MMLU, HumanEval, GSM8K ni métricas comparables. Se menciona que la cuantización INT4 introduce una deriva leve en las probabilidades ("measured drift below"), pero el valor concreto de esa deriva no se reproduce en la información proporcionada.

## Requisitos de hardware

- **VRAM/RAM estimada por build**:
  - `model-cuda-int8`: ~5,0 GB de pesos, requiere GPU CUDA con al menos ~6-8 GB de VRAM para inferencia.
  - `model-cuda-int4`: ~2,7 GB de pesos, cabe en GPUs de consumo con 4-6 GB de VRAM.
  - `model-cpu-int8`: ~6,9 GB, requiere ~8 GB de RAM.
  - `model-cpu-int4`: ~2,6 GB, requiere ~4 GB de RAM.
- **GPU recomendadas**: no se especifican modelos concretos; los builds CUDA son compatibles con GPUs NVIDIA con soporte de onnxruntime-gpu. Por tamaño, una RTX 3060/4060 (8-12 GB) o superior es suficiente para el build int4; A100/H100 no son necesarias para un modelo de 4B.
- **Consumer GPU**: sí, el build int4 (~2,7 GB) cabe holgadamente en cualquier GPU de consumo moderna con 6 GB o más.
- **Opciones de despliegue**: onnxruntime (CPU y CUDA) mediante los scripts incluidos (`score_knowline.py`, `generate.py`, `onnx_raw.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; el formato ONNX no es directamente compatible con esos servidores sin conversión adicional.
- **Latencia y throughput**: no disponibles. La model card indica que el scoring se resuelve en un único prefill por petición (sin generación autoregresiva), lo que reduce la latencia frente a un modelo de chat, pero no se publican cifras de tokens/s ni milisegundos por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| KnowLine-4B-Gen5.5 (ONNX) | 4B | no disponible | ONNX (int4/int8) | Apache-2.0 | Modelo de decisión con scoring probabilístico |
| PelaAI/KnowLine-4B-Gen5.5 (original) | 4B | no disponible | PyTorch/SGLang | Apache-2.0 (según repo base) | Mismo modelo, serving completo con visión vía SGLang |
| Qwen3.5-4B (base) | 4B | no disponible | safetensors | no disponible | Modelo generativo generalista |
| Clasificadores BERT/RoBERTa fine-tuneados | 0,1-0,4B | 512 típicamente | safetensors/ONNX | variable | Clasificación de texto tradicional |

La comparativa con clasificadores BERT es la más directa en tarea: KnowLine ofrece contexto mucho mayor (~1.200 tokens en ejemplos) y rúbricas multi-pregunta en una sola petición, a cambio de un tamaño 10-40 veces superior. Frente al modelo original en PyTorch, la versión ONNX sacrifica el soporte de imágenes (requiere SGLang) y la generación de texto queda como capacidad secundaria, pero elimina la dependencia de PyTorch en inferencia. No se dispone de datos de rendimiento comparado para cuantificar diferencias de precisión entre alternativas.

## Limitaciones y advertencias

- **No es un chatbot**: el uso principal es scoring estructurado; la generación de texto libre es secundaria y no se detalla su calidad.
- **Solo texto**: no soporta imágenes en estos builds ONNX; para visión hay que usar SGLang en el repositorio fuente.
- **Calibración dependiente del dominio**: la model card advierte explícitamente que si el uso depende de umbrales de probabilidad, se debe re-verificar la calibración sobre datos propios. La temperatura T = 1.50 está plegada, pero no garantiza calibración fuera de la distribución de entrenamiento.
- **Deriva por cuantización**: el build INT4 altera ligeramente las probabilidades; para aplicaciones sensibles a umbrales se recomienda el build int8 (CUDA int8 es el "most faithful" según el autor).
- **Sesgos**: no se documentan sesgos conocidos en la información disponible; al derivar de Qwen3.5-4B, puede heredar sesgos del modelo base y de sus datos de entrenamiento (no detallados).
- **Riesgo de alucinación**: menor que en un modelo generativo al no producir texto libre, pero las distribuciones de probabilidad pueden ser sobreconfiadas en estados fuera de distribución.
- **Idiomas**: no se especifican los idiomas soportados; los ejemplos están en inglés.
- **Límites operativos**: máximo 64 preguntas por petición y 255 opciones por pregunta.
- **Licencia**: pesos Apache-2.0 permite uso comercial; los scripts runner son MIT. No se detallan restricciones adicionales del modelo base más allá de la licencia indicada.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin benchmarks publicados ni validación externa conocida.

## Enlaces

- Hugging Face (build ONNX): https://huggingface.co/electroglyph/KnowLine-4B-Gen5.5-onnx
- Modelo base: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Repositorio fuente (referenciado en la model card, serving SGLang): no disponible como URL directa en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
