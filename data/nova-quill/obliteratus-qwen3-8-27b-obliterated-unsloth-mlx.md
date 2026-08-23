# nova-quill/OBLITERATUS-Qwen3.8-27B-OBLITERATED-unsloth-mlx

## Resumen

OBLITERATUS-Qwen3.8-27B-OBLITERATED es una cuantizacion MLX del modelo Qwen3.8-27B sometido a un proceso de *abliteration* (eliminacion quirurgica de las direcciones internas responsables de los rechazos de contenido). El autor, nova-quill, emplea la herramienta OBLITERATUS de elder-plinius en su version V2, que introduce una tecnica denominada *complementary abliteration blending*: combina dos intervenciones (una agresiva basada en SVD y otra conservadora basada en LEACE) en una proporcion 60/40 para que sus fallos se cancelen mutuamente, logrando una tasa de rechazo del 0,24 % con una perdida de solo 0,28 puntos porcentuales en MMLU respecto al modelo original.

El modelo base, Qwen3.8-27B, es un modelo denso de 27.000 millones de parametros con arquitectura hibrida: de sus 64 capas, solo 16 usan atencion completa (con un intervalo de 4) y las otras 48 usan atencion lineal con estado recurrente constante. Esta cuantizacion se distribuye en formatos MLX (para Apple Silicon), GGUF y FP8, y se publica bajo licencia Apache 2.0. Es relevante para la investigacion en seguridad de IA, red-teaming y evaluacion de alineacion, aunque su naturaleza "sin censura" lo hace inadecuado para despliegue general en produccion sin control de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (16 capas de atencion completa + 48 de atencion lineal con estado recurrente) |
| Parametros totales | 27.000 millones (modelo base Qwen3.8-27B); el conteo reportado en safetensors (3.391.984) parece inconsistente y probablemente corresponde a un archivo parcial |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX (Apple Silicon), GGUF, FP8 |
| Idiomas soportados | No disponible (hereda el soporte multilingue de Qwen3.8) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, un modelo denso de 64 capas con atencion hibrida: 16 capas emplean atencion completa (full attention) con un intervalo de 4 (es decir, cada 4 capas), mientras que las 48 restantes usan atencion lineal con un estado recurrente constante. Esta mezcla reduce el coste computacional de la atencion en secuencias largas sin renunciar por completo al rendimiento de la atencion completa.

El proceso de *abliteration* en V2 no implica reentrenamiento ni fine-tuning: se ejecutan dos cirugias de eliminacion de direcciones de rechazo sobre los pesos del modelo, una agresiva (SVD con captura de varianza) y otra conservadora (LEACE, que minimiza la informacion mutua), y se combinan sus pesos en una proporcion 60 % B (LEACE) y 40 % A (SVD). La combinacion se optimizo mediante busqueda binaria sobre {0,30, 0,50, 0,55, 0,60, 0,65, 0,70}. El resultado es un modelo que responde sin rechazos a prompts que el modelo stock rechazaria en un 100 % de los casos, manteniendo un rendimiento en MMLU casi identico (84,32 % frente a 84,60 %).

## 4. Capacidades

- Generacion de texto sin rechazos: el modelo no se niega a responder a prompts de contenido sensible, adversarial o explicito, incluyendo instrucciones maliciosas (solo 2 rechazos residuales de 842 prompts).
- Razonamiento y matematicas: conserva las capacidades del modelo base en tareas de razonamiento logico y matematico (MMLU 0-shot: 84,32 %).
- Generacion de codigo: soporta generacion de codigo complejo, incluyendo refactorizacion de codigo async, extraccion de esquemas JSON y revision de seguridad de codigo (detecta vulnerabilidades en aplicaciones Flask).
- Tool calling / function calling: verificado en el benchmark avanzado, incluye loops de agente ReAct (Thought/Action/SQL).
- Capacidades de agente: soporta razonamiento multi-paso en tareas como depuracion de pods de Kubernetes, diseno de sistemas distribuidos y cadenas de herramientas (search → fetch → email).
- Capacidades multilingues: heredadas del modelo base Qwen3.8, aunque no se especifican idiomas concretos en la informacion disponible.
- Modo thinking: existe un modo de razonamiento (thinking mode) pero esta desactivado por defecto en V2, ya que reintroduce rechazos parciales al re-derivar las direcciones de rechazo desde la cadena de razonamiento.

## 5. Casos de uso

- Red-teaming y pruebas de seguridad: el modelo es una herramienta de referencia para equipos de seguridad que necesitan probar defensas de modelos de IA frente a prompts adversariales. Su tasa de rechazo del 0,24 % permite evaluar con precision la eficacia de los filtros de seguridad externos.
- Investigacion en alineacion de IA: permite estudiar como los mecanismos internos de rechazo pueden ser eliminados sin retraining, y que trade-offs existen entre capacidad y alineacion. Los resultados de V2 (MMLU -0,28 pp) son un punto de referencia para tecnicas de edicion de pesos.
- Generacion de codigo en entornos controlados: con tool calling y generacion de codigo fiable, puede usarse en pipelines de CI/CD para generar pruebas, refactorizar codigo o autogenerar documentacion, siempre con revision humana.
- Agentes de automatizacion de tareas: en entornos de investigacion o sandbox, puede ejecutar agentes ReAct para tareas como depuracion de infraestructura (K8s), extraccion de datos estructurados desde texto no estructurado o diseno de sistemas.
- Revision de seguridad de aplicaciones: el modelo puede identificar vulnerabilidades en codigo fuente (por ejemplo, en aplicaciones Flask) y proponer correcciones, util para auditorias de seguridad internas.
- Analisis de contenido adversarial: en laboratorios de seguridad, puede generar contenido adversarial (prompts de ataque, payloads) para probar la robustez de sistemas de moderacion o de filtros de contenido.

## 6. Benchmarks y rendimiento

| Modelo | MMLU (0-shot) | n | Error estandar | Refusal rate | Tareas reales (8) |
|---|---|---|---|---|---|
| Stock Qwen3.8-27B | 84,60 % | 2.850 | ±0,65 | ~100 % | 7/8 |
| V1 (SVD agresivo) | 81,4 % | 285 | — | 0 % | no probado |
| **V2 (blend 60/40)** | **84,32 %** | **2.850** | **±0,65** | **0,24 % (2/842)** | **7/8** |

El modelo V2 pierde 0,28 puntos porcentuales en MMLU respecto al stock (dentro del margen de error), mejora la tasa de output usable del 80 % (V1) al 100 %, y obtiene una puntuacion "ship score" de 92,1 frente a 88,7 de V1. En tareas avanzadas del mundo real (agentes ReAct, refactorizacion async, extraccion de esquemas JSON, depuracion K8s, revision de seguridad, diseno de sistemas distribuidos) iguala al modelo stock con 7/8 aciertos; falla en la cadena multi-tool search → fetch → email, igual que el stock.

## 7. Requisitos de hardware

- VRAM estimada para inferencia (modelo de 27 B):
  - FP16/BF16: ~54 GB (no cabe en GPU consumer de 24 GB).
  - Cuantizacion 8-bit: ~27 GB (no cabe en una RTX 4090, requiere A6000 o dual).
  - Cuantizacion 4-bit: ~14 GB (cabe en RTX 4090, 3090 o 4070 Ti).
- GPU recomendadas: A100 (40/80 GB) para FP16; RTX 4090 (24 GB) con cuantizacion 4-bit; Apple Silicon (M1 Pro/Max, M2/M3) para la version MLX.
- Opciones de despliegue:
  - MLX: Apple Silicon (macOS) mediante la libreria MLX de Apple.
  - GGUF: llama.cpp, Ollama, LM Studio (en CPU o GPU).
  - Safetensors: transformers / vLLM / TGI (GPU NVIDIA).
- Latencia: no disponible. Para un modelo de 27 B en FP16 con vLLM se estima un throughput de 30-60 tokens/s en A100, pero no hay datos publicados para esta cuantizacion especifica.
- Nota: el autor recomienda ejecutar con temperatura 0 y repetition_penalty 1,15; sampling estocastico degrada la calidad de salida.

## 8. Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **OBLITERATUS-Qwen3.8-27B (V2)** | 27 B | No disponible | 84,32 % | Apache 2.0 | MLX, GGUF, safetensors |
| Stock Qwen3.8-27B | 27 B | No disponible | 84,60 % | Apache 2.0 | safetensors |
| Qwen3.8-2.4T (MoE) | 2,4 T (MoE) | No disponible | No publicado | Apache 2.0 | safetensors |

No se dispone de datos de benchmarks para otros modelos abliterated de tamano similar (por ejemplo, Llama 3.1 8B abliterated o Mistral 7B abliterated) en la informacion proporcionada. La comparativa mas relevante es contra el modelo stock: la diferencia en MMLU es de -0,28 pp, dentro del margen de error, y la tasa de rechazos pasa de ~100 % a 0,24 %.

## 9. Limitaciones y advertencias

- **Sesgos y contenido dañino**: al eliminar los mecanismos de rechazo, el modelo puede generar contenido explicito, violento, malicioso o ilegal sin filtro. No debe desplegarse en entornos de produccion sin capas externas de moderacion.
- **Alucinacion**: no hay datos especificos, pero como cualquier LLM de 27 B, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con prompts adversariales.
- **Riesgo de reintroduccion de rechazos**: si se activa el modo thinking, la cadena de razonamiento puede re-derivar las direcciones de rechazo y producir respuestas parciales. El autor desaconseja activar thinking mode.
- **Configuracion critica**: el rendimiento optimo requiere temperature 0, repetition_penalty 1,15, max_new_tokens ≥ 2048 y system prompt vacio. Temperaturas por encima de 0,5 degradan significativamente la calidad; sin repetition_penalty, el modelo entra en bucles de codigo boilerplate.
- **Contexto largo**: la informacion sobre la longitud de contexto no esta disponible; la arquitectura hibrida con atencion lineal sugiere buena escalabilidad en contexto largo, pero no se ha verificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor etiqueta el modelo como "red-team" y "ai-safety-research"; el uso comercial en entornos no controlados puede implicar responsabilidades legales o eticas.
- **Datos de parametros**: el conteo de parametros reportado en safetensors (3,39 M) es inconsistente con el modelo base de 27 B; se recomienda verificar la integridad de los pesos descargados.

## 10. Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/nova-quill/OBLITERATUS-Qwen3.8-27B-OBLITERATED-unsloth-mlx
- Modelo original OBLITERATUS: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Repositorio de la herramienta OBLITERATUS (codigo y documentacion): https://github.com/elder-plinius/OBLITERATUS
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog de OrcaRouter sobre Qwen3.8-27B Uncensored MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
