# JoshyG14/qwen3-1.7b-spanish-lora-no-inject

## Resumen

El modelo `JoshyG14/qwen3-1.7b-spanish-lora-no-inject` es un adaptador LoRA (Low-Rank Adaptation) diseñado para la generación de oraciones en español bajo restricciones morfosintácticas. Se desarrolla como parte del proyecto académico LinguistOS de la MSc en Computer Science del Imperial College London (2026), por Joshua Graham. Su objetivo es que el modelo, dado un lema verbal y unas restricciones de tiempo y persona, genere una oración natural donde la forma flexionada correcta actúe como verbo principal, sin recibir explícitamente la forma flexionada (de ahí el sufijo "no-inject"). Esta tarea exige que el modelo recupere la forma verbal adecuada desde el lema y las restricciones, lo que evalúa y refuerza su conocimiento morfológico del español.

El adaptador se entrena sobre el modelo base `Qwen/Qwen3-1.7B`, un modelo denso de 1.700 millones de parámetros con arquitectura transformer, licencia Apache 2.0. El adaptador tiene un tamaño de aproximadamente 67 MB y se distribuye en formato safetensors. Es un modelo de investigación, no un chatbot de propósito general, y está diseñado específicamente para la generación de oraciones con verbos flexionados bajo condiciones controladas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-1.7B (transformer denso) con adaptador LoRA |
| Parámetros totales | 1.700 millones (modelo base) + adaptador LoRA (~67 MB de pesos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; la cuantización se aplica al modelo base) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-1.7B`, un modelo de lenguaje causal con arquitectura transformer densa. Qwen3-1.7B forma parte de la serie Qwen3 de Alibaba, que incluye modelos de distintos tamaños, todos con licencia Apache 2.0. El adaptador LoRA utiliza un rango de 16, alpha de 32 y dropout de 0.05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La técnica LoRA reduce el número de parámetros entrenables, manteniendo el modelo base congelado.

El entrenamiento se realizó mediante supervisión de fine-tuning (SFT) con pérdida de cross-entropy sobre pares prompt-completación. El dataset consiste en 4.205 ejemplos filtrados (3.995 para entrenamiento y 210 para validación), con oversampling de células difíciles (×2). Se eliminó la línea de inyección de la forma flexionada de cada prompt, para que el modelo deba inferirla. Se entrenó durante 3 épocas con un learning rate de 2×10⁻⁴, seleccionando el checkpoint con mejor pérdida de validación en el paso 1.000 (early stopping). El tamaño final del adaptador es de ~67 MB.

## Capacidades

- Generación de oraciones en español: dado un lema verbal y restricciones de tiempo y persona, produce una oración corta y natural donde el verbo flexionado correcto es el núcleo.
- Recuperación morfológica: infiere la forma verbal correcta a partir del lema y las restricciones, sin que se le suministre la forma explícita.
- Generación con restricciones: respeta las especificaciones morfosintácticas (tiempo, persona, número) en la salida.
- No es un modelo conversacional: no está entrenado para dialogar, responder preguntas generales ni realizar tareas de razonamiento complejo.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe: solo español, aunque el modelo base es multilingüe, el adaptador se entrena únicamente en español.

## Casos de uso

- Ejercicios de gramática generativa: crear automáticamente oraciones modelo para ejercicios de conjugación verbal en español, donde el estudiante debe identificar la forma correcta.
- Aumento de datos morfológicos: generar nuevos ejemplos de oraciones con verbos flexionados para entrenar o evaluar otros modelos de procesamiento de lenguaje natural en español.
- Validación de conocimiento morfológico: evaluar la capacidad de un modelo base para recuperar formas verbales bajo restricciones, comparando con el adaptador con inyección.
- Investigación en lingüística computacional: estudiar cómo los modelos de lenguaje adquieren y aplican reglas morfosintácticas del español.
- Pruebas de robustez: comprobar la capacidad de un modelo pequeño (1.7B) para manejar una tarea morfológica específica con datos limitados.
- Prototipos educativos: integrar el adaptador en herramientas de enseñanza de español como generador de frases de ejemplo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval u otros estándares para este adaptador. El único dato de rendimiento es la pérdida de validación utilizada para el early stopping, pero no se especifica el valor numérico.

## Requisitos de hardware

- El modelo base `Qwen3-1.7B` tiene 1.700 millones de parámetros. En precisión FP16, los pesos ocupan aproximadamente 3.4 GB.
- Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes o GGUF), la memoria de VRAM puede reducirse a ~1.8 GB, lo que permite ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090.
- El adaptador LoRA añade ~67 MB adicionales, por lo que el requisito total es el del modelo base más el adaptador.
- Puede desplegarse con librerías como Hugging Face Transformers + PEFT, vLLM (para inferencia de alta producción), llama.cpp (para CPU y cuantización GGUF), Ollama (si se empaqueta como GGUF) o TGI (Text Generation Inference).
- La latencia típica para generación de oraciones cortas (decenas de tokens) en una RTX 4090 sería del orden de decenas de milisegundos, pero no se dispone de medidas exactas para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Especialidad |
|---|---|---|---|---|---|
| `JoshyG14/qwen3-1.7b-spanish-lora-no-inject` | Adaptador LoRA sobre Qwen3-1.7B | 1.7B + 67 MB | No disponible | Apache 2.0 | Generación de oraciones con restricciones morfosintácticas (sin inyección) |
| `JoshyG14/qwen3-1.7b-spanish-lora-with-inject` | Adaptador LoRA sobre Qwen3-1.7B | 1.7B + ~67 MB | No disponible | Apache 2.0 | Misma tarea, pero con inyección de la forma flexionada |
| `Qwen/Qwen3-1.7B` | Modelo base | 1.7B | 32k (según documentación de Qwen) | Apache 2.0 | Modelo general de texto, no adaptado a tarea específica |

No hay datos de benchmarks comparativos disponibles.

## Limitaciones y advertencias

- Modelo de investigación: no es un chatbot general ni un modelo de propósito general; su uso fuera de la tarea morfosintáctica no será adecuado.
- Riesgo de alucinación: puede generar formas verbales incorrectas o oraciones no naturales, especialmente en verbos irregulares o restricciones poco frecuentes.
- Limitación de idioma: entrenado exclusivamente en español; no se debe usar con otros idiomas.
- Dependencia del modelo base: la calidad depende de las capacidades del Qwen3-1.7B original; el adaptador no corrige defectos del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni la idoneidad para aplicaciones productivas.
- Tamaño de datos reducido: solo 4.205 ejemplos de entrenamiento, lo que limita la cobertura de verbos y construcciones.
- No hay benchmarks públicos: no se puede comparar objetivamente con otros adaptadores o modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshyG14/qwen3-1.7b-spanish-lora-no-inject
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto LinguistOS: https://github.com/JoshuaGraham14/LinguistOS
- Adaptador con inyección (compañero): https://huggingface.co/JoshyG14/qwen3-1.7b-spanish-lora-with-inject
- Blog de Qwen3: https://qwen.ai/blog?id=qwen3
