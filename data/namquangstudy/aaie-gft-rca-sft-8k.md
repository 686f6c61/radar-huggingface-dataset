# namquangstudy/aaie-gft-rca-sft-8k

## Resumen

`aaie-gft-rca-sft-8k` es un ajuste fino supervisado (SFT) de parámetros completos sobre `AAIE_DDense_GFT_Llama`, un modelo Llama denso de 354.374.144 parámetros (≈354 M) desarrollado por el usuario namquangstudy. El objetivo del modelo es muy específico: dado el enunciado de una tarea, una rúbrica de evaluación, la entrega de un estudiante y los resultados de la evaluación por criterio, el modelo genera un objeto JSON estructurado que explica la causa raíz del rendimiento del estudiante. No es un modelo de propósito general, sino un prototipo de investigación orientado al análisis de causa raíz (RCA) en contextos educativos.

La relevancia técnica del checkpoint está en cómo se ha resuelto la limitación de contexto: el modelo base solo fue entrenado con 1.024 tokens, insuficiente para los ejemplos de RCA (hasta ~2,1 K tokens). Para solucionarlo se ha integrado escalado de contexto YaRN 8x, dejando una ventana efectiva de 8.192 tokens. Además, el ajuste se hizo con enmascarado de los tokens de prompt en la pérdida (`-100`), de modo que solo el JSON objetivo contribuye al gradiente, y con un learning rate bajo (1e-5) para evitar olvido catastrófico sobre un checkpoint ya instruido con SmolTalk.

Se trata de un artefacto con 0 descargas y 0 likes, publicado como prototipo de investigación y con licencia "other". Su interés es fundamentalmente metodológico (receta de SFT a contexto extendido sobre un modelo pequeño) y de nicho (evaluación educativa automatizada con salida JSON verificable).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (familia `llama`, no MoE) |
| Parámetros totales | 354.374.144 (≈354 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (escalado YaRN 8x sobre una longitud nativa de entrenamiento de 1.024 tokens) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors sin cuantizar; el repo ocupa 1,4 GB, consistente con fp32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | other |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | namquangstudy/aaie-ddense-gft-llama |
| Pipeline | text-generation |
| Contexto de uso | conversacional (plantilla de chat de dos turnos) |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo parte de `AAIE_DDense_GFT_Llama`, descrito por el autor como el "GFT model": una base destilada seguida de un instruction-tuning general sobre SmolTalk. Sobre ese punto de partida se realiza un ajuste fino de parámetros completos (todos los pesos, sin LoRA ni adaptadores) con `transformers.Trainer`. El conjunto de datos son 504 ejemplos de la tarea RCA, divididos en 454 de entrenamiento y 50 de validación retenidos. La configuración es de 3 épocas con schedule coseno y learning rate 1e-5, deliberadamente bajo por tratarse de una actualización full-parameter sobre un checkpoint ya instruido y con un dataset pequeño.

El entrenamiento emplea enmascarado de prompt: los tokens de entrada se marcan con `-100` y no contribuyen a la pérdida, de forma que el modelo solo optimiza la generación del JSON objetivo. La innovación técnica destacable es la integración de YaRN con factor de escalado 8x, que extiende la ventana efectiva a 8.192 tokens para acomodar ejemplos que llegan hasta ~2,1 K tokens. Los resultados declarados por el autor son: pérdida de entrenamiento de 2,98 a 0,076 y pérdida de evaluación de 0,086. Además, se validó por generación directa sobre 20 ejemplos retenidos: 20/20 produjeron JSON válido y terminaron limpiamente en `<|im_end|>` sin repeticiones, siempre que se pase `eos_token_id` de forma explícita. Las versiones de framework son Transformers 4.57.1, PyTorch 2.7.1+cu118 y Tokenizers 0.22.1. El código de entrenamiento está en `sft_rca/` dentro del repositorio `namquangstudy/moe-bench` (`train_sft.py`, `data/rca_dataset.py`, `configs/rca_sft_llama.yaml`).

## Capacidades

- Generación de texto conversacional limitada a una plantilla de chat de dos turnos: mensaje de sistema que enmarca la tarea y mensaje de usuario con los datos.
- Producción de explicaciones de causa raíz en formato JSON estructurado, a partir de una rúbrica, una entrega de estudiante y los resultados de evaluación por criterio (puntuación y calificación cualitativa).
- Salida con parada controlada: emite `<|im_end|>` al final del turno, lo que permite truncar la generación de forma fiable si se configura el `eos_token_id` correctamente.
- Comprensión de contexto largo relativo a su tamaño: ventana efectiva de 8.192 tokens mediante YaRN, suficiente para rúbricas con múltiples criterios, entregas completas y resultados de evaluación en una sola pasada.
- Capacidad monolingüe: únicamente inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del propio análisis en una única respuesta.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- Talento matemático y de código: no documentado ni evaluado para este checkpoint.

## Casos de uso

- Análisis de causa raíz de evaluaciones educativas: dado un examen corregido con rúbrica, el modelo produce un JSON que explica por qué el estudiante obtuvo cada puntuación, criterio a criterio, lo que permite alimentar sistemas de analítica de aprendizaje con datos estructurados.
- Generación de feedback explicativo para estudiantes: el JSON resultante puede renderizarse en un panel o en un correo, transformando una nota numérica en una explicación de las carencias concretas detectadas.
- Automatización de pipelines de corrección con rúbricas: integrado tras un corrector automático (o tras un corrector humano que registre puntuaciones), añade la capa de interpretación sin intervención manual, y su salida JSON es directamente consumible por un backend.
- Auditoría y trazabilidad de decisiones de evaluación: al obligar a una explicación estructurada, el modelo deja un rastro verificable de por qué se asignó cada calificación, útil en contextos con requisitos de transparencia académica.
- Investigación en evaluación automática y técnicas de RCA: sirve como referencia reproducible de cómo adaptar un modelo de 354 M a una tarea de análisis estructurado con contexto extendido vía YaRN, con código de entrenamiento publicado.
- Detección de patrones de error sistemáticos en una cohorte: procesando por lotes las salidas JSON de muchos estudiantes, se pueden agregar causas raíz recurrentes (por ejemplo, fallos en un criterio concreto) sin depender de análisis manual.
- Generación de datos sintéticos de RCA: el modelo puede usarse como generador de explicaciones estructuradas para aumentar datasets de entrenamiento o para destilar la tarea hacia modelos aún más pequeños.
- Prototipado rápido en plataformas educativas: al requerir muy poca VRAM y admitir despliegue en CPU, es viable integrarlo en entornos de desarrollo o demos sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de entrenamiento y una validación cualitativa de formato:

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento (inicio → final) | 2,98 → 0,076 |
| Pérdida de evaluación | 0,086 |
| Ejemplos de entrenamiento / validación | 454 / 50 (504 en total) |
| Validación por generación directa | 20/20 JSON válido y parada limpia en `<|im_end|>` |
| Comparación con modelos similares en benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en fp32 (tamaño real del repo safetensors), ~0,7 GB en fp16/bf16 y ~0,35 GB en int8, según la conversión aplicada.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama de entrada con 4 GB o menos.
- Es viable la inferencia en CPU, dado el tamaño de 354 M de parámetros y la ventana máxima de 8.192 tokens.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenamiento o para servido de altísimo volumen.
- Opciones de despliegue: `transformers` (uso directo, como en el quick start del autor), Text Generation Inference (el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (la conversión no se proporciona en el repositorio).
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia.
- Detalle operativo importante: hay que pasar explícitamente `eos_token_id=[im_end_id, tokenizer.eos_token_id]` y `pad_token_id=tokenizer.eos_token_id`; de lo contrario la generación puede continuar más allá del punto de parada previsto.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar rendimiento. La comparación se limita a características estructurales y de licencia; los valores de los modelos alternativos proceden de conocimiento general y deben verificarse en sus respectivas fichas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| aaie-gft-rca-sft-8k | ~354 M | 8.192 (YaRN 8x) | en | other | SFT especializado en RCA educativo con salida JSON |
| SmolLM2-360M-Instruct | ~360 M | 8.192 | en (principalmente) | Apache-2.0 | Instrucción general |
| Qwen2.5-0.5B-Instruct | ~500 M | 32.768 | multilingüe | Apache-2.0 | Instrucción general |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 | en | Apache-2.0 | Chat general |

Frente a estas alternativas, `aaie-gft-rca-sft-8k` no compite en capacidades generales: su ventaja es la especialización en una tarea concreta con salida JSON estructurada, su contexto extendido respecto a su base y su coste de despliegue mínimo. Su desventaja es la ausencia de benchmarks, el soporte exclusivo de inglés y una licencia "other" que exige revisión legal antes de cualquier uso comercial.

## Limitaciones y advertencias

- Entrenado con solo 504 ejemplos (454 efectivos de entrenamiento): alto riesgo de sobreajuste al formato y al dominio concretos del dataset; la generalización a rúbricas o dominios distintos no está verificada.
- La validación reportada (20/20 JSON válido) mide validez sintáctica y parada limpia, no corrección del contenido del análisis.
- Riesgo de alucinación: puede atribuir causas raíz no sustentadas por la entrega o los resultados de evaluación; la salida es plausible, no verificada factualmente.
- Sesgos conocidos: no disponibles, pero el modelo hereda los sesgos de su base destilada, de SmolTalk y del dataset de RCA, y no se documenta ninguna evaluación de sesgo.
- Idiomas: solo inglés. No hay soporte de castellano ni de otras lenguas, ni evaluación de comportamiento fuera del inglés.
- Contexto: la ventana efectiva de 8.192 tokens depende del escalado YaRN integrado; el modelo base solo fue entrenado con 1.024 tokens, por lo que el rendimiento en la parte alta de la ventana no está medido.
- Licencia "other": no es una licencia estándar ni de código abierto reconocida; hay que revisar los términos exactos del repositorio antes de cualquier uso comercial o redistribución.
- Es un prototipo de investigación con 0 descargas: no hay garantías de mantenimiento, soporte ni estabilidad de API.
- Detalle de integración: el `generation_config.json` del modelo base incluye un `eos_token_id` heredado por defecto de Llama; en este checkpoint el autor indica que ya está corregido, pero conviene fijar `eos_token_id` explícitamente en cualquier caso.
- No dispone de versiones cuantizadas publicadas (GGUF, AWQ, GPTQ): cualquier despliegue con llama.cpp, Ollama o motores de cuantización requiere convertir los pesos por cuenta propia.
- Capacidad de razonamiento limitada por su tamaño (354 M): no es adecuado para tareas de razonamiento complejo, matemáticas avanzadas o generación de código en producción.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/namquangstudy/aaie-gft-rca-sft-8k
- Modelo base: https://huggingface.co/namquangstudy/aaie-ddense-gft-llama
- Repositorio de código de entrenamiento: https://github.com/namquangstudy/moe-bench/tree/main/sft_rca
- Búsqueda web: no se han encontrado resultados relevantes sobre el modelo; las consultas devolvieron únicamente páginas de ayuda de Gmail, sin relación con el artefacto. No hay paper, blog ni demo adicionales disponibles.
