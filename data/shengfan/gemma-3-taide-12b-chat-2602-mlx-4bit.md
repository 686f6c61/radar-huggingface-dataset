# ShengFan/Gemma-3-TAIDE-12b-Chat-2602-MLX-4bit

## Resumen

Este repositorio contiene una version cuantizada a 4 bits en formato MLX del modelo `taide/Gemma-3-TAIDE-12b-Chat-2602`, un ajuste fino conversacional de la familia Gemma 3 orientado al chino tradicional y publicado por el proyecto TAIDE (Trustworthy AI Dialog Engine, impulsado por el Ministerio de Ciencia y Tecnologia de Taiwan). El autor del repositorio, ShengFan, se limita a convertir los pesos originales a la libreria MLX de Apple para permitir su ejecucion local en silicio de Apple (M1/M2/M3/M4) sin necesidad de GPU dedicada.

El modelo resuelve el problema de desplegar un asistente conversacional en chino tradicional con un tamano manejable (unos 12-13 mil millones de parametros) sobre hardware de consumo de Apple. Al estar cuantizado a 4 bits, el repositorio ocupa 7,5 GB, lo que lo hace viable en equipos con 16 GB o mas de memoria unificada, algo impensable con los pesos completos en bf16 (que rondarian los 24-26 GB).

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un backbone Gemma 3 (arquitectura densa decoder-only con atencion de ventana deslizante), un ajuste linguistico especifico para chino tradicional y un formato de pesos exclusivo para el ecosistema Apple. Ademas, el acceso esta restringido (gated) y la licencia es la `gemma-version-taide-models-license-agreement`, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Gemma 3 (no MoE) |
| Parametros totales | 13.202.009.856 (segun metadata de safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion del repositorio; heredada de la familia Gemma 3 (hasta 128.000 tokens segun la documentacion de Google), no confirmada para este ajuste |
| Tipos de cuantizacion | 4 bits en formato MLX (pesos cuantizados; group size no especificado en la ficha) |
| Idiomas soportados | No disponible en los metadatos; el modelo base TAIDE esta orientado a chino tradicional (el ajuste se conoce como TAIDE, proyecto taiwanes) |
| Licencia | gemma-version-taide-models-license-agreement (etiquetada como `license:other`) |
| Formato de pesos | safetensors (formato MLX), no GGUF |
| Tamano del repositorio | 7,5 GB |
| Libreria de inferencia | mlx |
| Pipeline | text-generation |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Modelo base | taide/Gemma-3-TAIDE-12b-Chat-2602 |
| Fecha de creacion | 2026-09-12 |
| Fecha de actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de la familia Gemma 3, que en su version de 12B incorpora atencion con ventana deslizante (sliding window attention) combinada con capas de atencion global, ademas de normalizacion RMSNorm y embeddings atados entre entrada y salida. El autor de este repositorio no ha reentrenado el modelo: se trata de una conversion de pesos (weight conversion) desde el checkpoint original `taide/Gemma-3-TAIDE-12b-Chat-2602` a formato MLX con cuantizacion de 4 bits. Por tanto, no hay informacion en este repositorio sobre el dataset de entrenamiento, el numero de tokens vistos, ni sobre si se aplico RLHF, DPO u otra tecnica de alineamiento en la fase de ajuste de TAIDE.

El valor tecnico anadido de esta publicacion es exclusivamente la cuantizacion y el empaquetado para MLX: reduce el peso en disco a 7,5 GB y permite inferencia en memoria unificada de Apple Silicon mediante la libreria `mlx` / `mlx-lm`. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni variantes hibridas SSM.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de chat del modelo base.
- Razonamiento y respuesta a instrucciones en formato dialogo (pipeline `text-generation`, tag `conversational`).
- Capacidad multilingue no documentada en este repositorio; el modelo base TAIDE esta especializado en chino tradicional, por lo que se espera un rendimiento notablemente superior en ese idioma que en castellano o ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; el repositorio solo declara `text-generation`.
- Inferencia local en Apple Silicon gracias al backend MLX.

## Casos de uso

- Asistente conversacional en chino tradicional para usuarios de Taiwan: el ajuste TAIDE esta disenado para registrar y producir lenguaje propio de la region, algo que un Gemma 3 generico no garantiza. Es el escenario principal para el que se construyo el modelo.
- Despliegue local en portatiles Mac: con 7,5 GB de pesos en 4 bits, un MacBook con 16 GB de memoria unificada puede ejecutar el modelo sin conexion, lo que resulta util para prototipado offline y entornos con requisitos de privacidad.
- Atencion al cliente automatizada en entornos sin GPU NVIDIA: al correr sobre MLX, se puede integrar en infraestructura exclusivamente Apple, evitando el coste de servidores con A100/H100.
- Prototipado rapido de chatbots de dominio especifico: sirve como base para fine-tuning adicional (LoRA) sobre datos propios en chino tradicional antes de invertir en versiones de mayor precision.
- Evaluacion comparativa de cuantizacion: util para medir la degradacion de calidad entre los pesos originales y la version 4-bit en tareas conversacionales, aunque no se publican metricas al respecto.
- Traduccion y redaccion asistida chino tradicional-espanol/ingles: como caso secundario, aprovechando su conocimiento multilingue heredado de Gemma 3, siempre con verificacion humana por la falta de datos de rendimiento.
- Generacion de respuestas en aplicaciones de mensajeria integradas en macOS/iOS: al ser MLX, se puede empaquetar en apps nativas de Apple sin dependencias de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la ficha de HuggingFace del repositorio `ShengFan/Gemma-3-TAIDE-12b-Chat-2602-MLX-4bit` ni los resultados de busqueda web aportados contienen datos de MMLU, HumanEval, GSM8K ni de evaluaciones en chino tradicional (como TMLU o Taiwan-LLM eval). Tampoco se documenta la degradacion esperada por la cuantizacion a 4 bits.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 7,5 GB, por lo que se necesitan al menos 10-12 GB de memoria disponible para cargar pesos mas cache KV en contextos moderados.
- GPU compatibles: exclusivamente Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). El formato MLX no se ejecuta en GPUs NVIDIA o AMD.
- Equipos de consumo: si, cabe en un Mac con 16 GB de memoria unificada; en 8 GB sera muy ajustado o inviable. No es ejecutable en GPUs de consumo tipo RTX 4090 sin convertir previamente los pesos a otro formato.
- Opciones de despliegue: `mlx-lm` (libreria de referencia), LM Studio (soporta modelos MLX), y scripts propios basados en `mlx`. No es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, que esperan safetensors estandar o GGUF.
- Latencia y throughput: no disponibles; dependeran del chip concreto (un M4 Max ofrece bastante mas ancho de banda que un M1 base) y no se aportan cifras en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShengFan/Gemma-3-TAIDE-12b-Chat-2602-MLX-4bit (este) | 13,2 B (metadata) | No disponible (heredado de Gemma 3) | MLX 4-bit | gemma-version-taide-models-license-agreement | Gated en HuggingFace |
| taide/Gemma-3-TAIDE-12b-Chat-2602 (base) | No disponible en la informacion recogida | No disponible | safetensors bf16 (presumiblemente) | Licencia TAIDE/Gemma | No confirmado |
| Gemma 3 12B (Google) | ~12,2 B | 128.000 tokens | safetensors, GGUF, MLX | Gemma Terms of Use | Publico, pero gated en algunas variantes |
| Familia TAIDE sobre Llama (p. ej. TAIDE-LX-7B / Llama-3.1-TAIDE) | 7-8 B | No disponible | safetensors, GGUF | Licencia TAIDE / Llama | Publico |

La comparacion con alternativas cuantizadas equivalentes (por ejemplo, Gemma 3 12B en GGUF Q4_K_M) no puede completarse con datos de rendimiento porque no se han publicado para este repositorio. La diferencia clave frente a esas alternativas es el ecosistema de ejecucion: MLX solo funciona en Apple Silicon, mientras que GGUF es multiplataforma.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta gated y exige aceptar condiciones en HuggingFace antes de descargarlo.
- Licencia restrictiva: la `gemma-version-taide-models-license-agreement` impone condiciones adicionales a las de Gemma y debe revisarse antes de cualquier uso comercial; no es una licencia open source estandar (Apache/MIT).
- Idiomas: no se documentan idiomas soportados en la ficha. El ajuste TAIDE esta orientado a chino tradicional, por lo que el rendimiento en castellano o en chino simplificado puede ser inferior y no esta medido.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y no mitigado de forma documentada en este repositorio.
- Sesgos: no se aporta informacion sobre sesgos evaluados, datos de entrenamiento ni procesos de alineamiento en este repositorio concreto.
- Degradacion por cuantizacion: la conversion a 4 bits puede reducir la calidad de las respuestas frente al modelo base en bf16; no hay comparativa publicada que cuantifique esta perdida.
- Limitaciones de plataforma: al estar en formato MLX, no se puede desplegar en servidores con GPU NVIDIA o AMD sin reconvertir los pesos, lo que descarta su uso directo en la mayoria de infraestructuras cloud.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa o casos de uso verificados.
- Datos incompletos: no se especifica group size de la cuantizacion, ni los hiperparametros de inferencia recomendados (temperatura, top-p, plantilla de prompt).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ShengFan/Gemma-3-TAIDE-12b-Chat-2602-MLX-4bit
- Modelo base: https://huggingface.co/taide/Gemma-3-TAIDE-12b-Chat-2602
- Documentacion de Gemma 3 (Google): https://ai.google.dev/gemma/docs/core/model_card_3
- Libreria MLX: https://github.com/ml-explore/mlx
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el proyecto TAIDE; los enlaces recuperados (repositorios de jailbreak prompts, modelos TTS y documentacion de GitHub Copilot) no guardan relacion con la ficha.
