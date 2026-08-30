# jaweed123/TinyJLLM

## Resumen

TinyJLLM es un modelo de lenguaje pequeño de aproximadamente 102,5 millones de parámetros, desarrollado por Abdul Jaweed (jaweed123) como parte de un pipeline educativo denominado LearnLLM. Se trata de un transformer decoder-only de estilo Llama, entrenado desde cero (random initialization) sobre una muestra de 5 GB del dataset FineWeb (sample-10BT), con un tokenizador BPE byte-level personalizado de 32 000 tokens. El modelo está pensado como referencia educativa para inspeccionar un entrenamiento completo y honesto, y como base para etapas posteriores de ajuste (SFT, DPO, fine-tuning de dominio).

Su relevancia radica en que documenta de forma transparente todo el proceso de preentrenamiento: datos, hiperparámetros, hardware y métricas finales. Con una pérdida de validación de 3,50 (perplejidad 33,1) y un contexto de solo 512 tokens, no compite con modelos comerciales, pero ofrece un caso de estudio valioso para quienes quieren entender cómo se construye un LLM desde cero. Está disponible bajo licencia MIT, con pesos en safetensors (FP32) y versiones GGUF (F16, Q8_0, Q4_K_M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder-only: RMSNorm, RoPE (half-split), SwiGLU, embeddings atados, sin bias |
| Parametros totales | 102 450 432 (~102,5 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP32 (safetensors), F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32), GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

TinyJLLM sigue una arquitectura transformer decoder-only clasica, con 11 capas, 12 cabezas de atencion y dimension de cabeza 64. Emplea normalizacion RMSNorm, posiciones rotatorias RoPE (half-split), activacion SwiGLU y embeddings atados entre entrada y salida, sin terminos de bias. El tokenizador es un BPE byte-level de 32 000 tokens entrenado sobre una muestra de 512 MB de FineWeb.

El entrenamiento se realizo sobre 5,37 GB de texto (1,75 millones de documentos) del dataset FineWeb sample-10BT, con 3 epocas y un total de 3,54 mil millones de tokens vistos. Se usaron 108 000 pasos de optimizacion con AdamW (lr 3e-4, weight decay 0,1, grupos decay/no-decay), warmup de 1 000 pasos y decaimiento coseno hasta 1e-5. El batch efectivo fue de 32 768 tokens por paso, con gradiente clipping a 1,0. La precision fue BF16 mixed precision con pesos maestros en FP32. El entrenamiento completo tardo unas 35 horas en una RTX 4060 de 8 GB, alcanzando una velocidad de ~30 000 tokens/s con torch.compile.

## Capacidades

- Generacion de texto: puede completar secuencias y producir texto coherente a corto plazo, aunque con limitaciones por su tamano.
- Modelo base: no ha recibido ajuste por instrucciones, por lo que sigue prompts como texto, sin seguir instrucciones de forma fiable.
- Tokenizacion byte-level: maneja cualquier texto en ingles, incluyendo caracteres especiales y codificacion UTF-8.
- Exportacion a GGUF: permite ejecucion en CPU y GPU con llama.cpp y herramientas compatibles.
- Reproducibilidad: al ser un modelo pequeno y con configuracion documentada, es adecuado para experimentos de investigacion y educacion.
- No dispone de soporte para tool calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

- Educacion en arquitecturas transformer: permite a estudiantes y desarrolladores inspeccionar un modelo completo de 100 M, analizar sus pesos, activaciones y comportamiento, y comparar con implementaciones teoricas.
- Base para fine-tuning: al ser un modelo base con licencia MIT, se puede utilizar como punto de partida para SFT, DPO o ajuste en dominios especificos, con un coste computacional muy reducido.
- Experimentacion con tecnicas de cuantizacion: las versiones GGUF (F16, Q8_0, Q4_K_M) permiten estudiar el impacto de la cuantizacion en la calidad de generacion y en el rendimiento.
- Generacion de texto corto en aplicaciones de bajo coste: para tareas simples como completar frases, generar titulos o pequenos fragmentos, puede integrarse en entornos con recursos limitados.
- Analisis de sesgos y alucinaciones en modelos pequenos: su tamano reducido facilita la auditoria de comportamientos problematicos y la comparacion con modelos mas grandes.
- Pruebas de pipelines de despliegue: al ser ligero, sirve para validar infraestructuras de inferencia (vLLM, TGI, llama.cpp) sin necesidad de GPUs potentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta las siguientes metricas de validacion:

| Metrica | Valor |
|---|---|
| Loss de validacion (final) | 3,50 |
| Perplejidad (final) | 33,1 |
| Loss de validacion (mejor checkpoint, paso 89K) | 3,48 |
| Perplejidad (mejor checkpoint) | 32,6 |

Estas cifras corresponden al conjunto de validacion de FineWeb y no son comparables directamente con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada: FP32 ~410 MB, BF16 ~205 MB, GGUF Q4_K_M ~60 MB (solo pesos; se requiere memoria adicional para activaciones y KV cache).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., GTX 1650, RTX 3060, RTX 4060). Tambien puede ejecutarse en CPU con llama.cpp.
- Compatible con hardware de consumo: si, cabe en cualquier GPU moderna e incluso en Raspberry Pi con cuantizacion Q4_K_M.
- Opciones de despliegue: transformers (Python), llama.cpp, llama-cpp-python, Ollama (si se convierte a GGUF), vLLM y TGI (aunque no son necesarios para un modelo tan pequeno).
- Latencia y throughput: en una RTX 4060, el entrenamiento alcanzo ~30 000 tok/s; la inferencia sera significativamente mas rapida, con latencias de pocos milisegundos por token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados para TinyJLLM. Como referencia cualitativa, se pueden mencionar otros modelos pequenos de tamano similar, aunque con caracteristicas distintas:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TinyJLLM | 102,5 M | 512 | MIT | Entrenado desde cero en 5 GB de FineWeb, base model |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | Entrenado en datasets mas grandes y diversos, con versiones instruct |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Modelo mas grande, con mejor rendimiento general, pero requiere mas recursos |

No se dispone de comparativas numericas directas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Tamano muy reducido: genera repeticiones en secuencias largas y tiene una capacidad limitada de razonamiento y conocimiento del mundo.
- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y puede producir respuestas irrelevantes o incoherentes si se le pide algo que no sea continuar texto.
- Contexto de solo 512 tokens: no puede manejar dialogos largos ni documentos extensos.
- Solo ingles: no soporta otros idiomas.
- Sesgos y alucinaciones: al estar entrenado en una muestra de FineWeb, puede reflejar sesgos presentes en los datos y generar informacion falsa con apariencia plausible.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Sin evaluacion de seguridad: no se han realizado pruebas de robustez frente a prompts malintencionados o de generacion de contenido danino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaweed123/TinyJLLM
- Perfil del autor: https://huggingface.co/jaweed123
- Proyecto LearnLLM: no se ha proporcionado una URL directa en la informacion disponible.
