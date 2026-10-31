# nesymerp1/Nanbeige4.3-33B-Base-Q4_K_M-GGUF

## Resumen

Nanbeige4.3-33B-Base-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo base Nanbeige4.3-33B-Base, publicado por el usuario nesymerp1 en Hugging Face mediante el espacio automatizado GGUF-my-repo de ggml.ai. El modelo original lo desarrolla Nanbeige, un equipo centrado en modelos de lenguaje bilingües chino-inglés. Con 33.118.977.024 parámetros, se sitúa en la categoría de modelos de tamaño medio-grande, un punto dulce para despliegues locales en GPUs de gama alta.

La versión cuantizada en Q4_K_M reduce el peso del modelo a unos 20,1 GB, lo que permite ejecutarlo en hardware de consumo con suficiente VRAM o incluso en CPU con RAM adecuada, algo imposible con los pesos originales en precisión completa. Al tratarse de un modelo base (no instruido ni alineado), está pensado principalmente para continuación de texto y como punto de partida para fine-tuning.

Su relevancia actual radica en la combinación de licencia Apache 2.0 (permisiva para uso comercial), soporte bilingüe chino-inglés y disponibilidad en GGUF para el ecosistema llama.cpp, lo que facilita su evaluación y despliegue local sin dependencias de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tipo LLaMA, no disponible el detalle exacto) |
| Parámetros totales | 33.118.977.024 (≈33,1 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (esta versión del repo) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (20,1 GB); el modelo original usa safetensors |

## Arquitectura y entrenamiento

Nanbeige4.3-33B-Base es un modelo de lenguaje autorregresivo basado en la arquitectura transformer decoder, con una estructura compatible con el ecosistema `transformers` de Hugging Face y con llama.cpp, lo que sugiere una arquitectura tipo LLaMA. La conversión a GGUF se realizó automáticamente mediante el espacio GGUF-my-repo, aplicando cuantización Q4_K_M, un esquema de bloque mixto que ofrece un buen equilibrio entre tamaño (20,1 GB frente a unos 66 GB en FP16) y calidad de salida.

No se ha publicado información detallada en la model card sobre el dataset de entrenamiento (número de tokens, composición), ni sobre etapas de RLHF o DPO. Al tratarse de un modelo base, cabe asumir que no ha pasado por alineación con instrucciones, aunque esto no está confirmado explícitamente. Tampoco constan innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.) en la documentación disponible.

## Capacidades

- Generación de texto en continuación libre (modelo base, sin ajuste a instrucciones).
- Soporte bilingüe de inglés y chino, útil para tareas de generación y análisis en ambos idiomas.
- Compatibilidad con el ecosistema llama.cpp (CLI, servidor, bindings de Python y otras plataformas como Ollama o LM Studio que consumen GGUF).
- Punto de partida adecuado para fine-tuning posterior (SFT, LoRA) dado su tamaño intermedio.
- No se ha documentado soporte nativo de tool calling, visión, audio ni modo de razonamiento extendido en la información disponible.
- No es un modelo conversacional alineado: requiere plantilla de fine-tuning o uso como completador de texto.

## Casos de uso

- Fine-tuning para dominios verticales: al ser un modelo base con licencia Apache 2.0, puede ajustarse con LoRA o QLoRA sobre datos propios (legal, médico, técnico) y desplegarse después en producción sin costes de licencia.
- Investigación sobre cuantización: la versión Q4_K_M permite estudiar la degradación de calidad frente al modelo original en FP16 en un hardware accesible.
- Completado de código y texto en chino e inglés: como modelo base puede integrarse en editores tipo FIM o autocompletado, donde la continuación de texto es el patrón de uso natural.
- Experimentación local sin nube: con 20,1 GB cabe en una RTX 4090 (24 GB) o puede ejecutarse con descarga parcial en CPU, ideal para prototipado privado de aplicaciones LLM.
- Sistemas de extracción y clasificación de texto: tras un fine-tuning ligero, su tamaño de 33 B ofrece capacidad suficiente para tareas de NER, clasificación o resumen extractivo en documentos bilingües.
- Base para modelos de chat propios: se puede aplicar SFT con datasets de instrucciones (Alpaca, datasets propios) para crear un asistente bilingüe personalizado.
- Generación de datos sintéticos: su capacidad de continuación de texto en chino lo hace útil para generar corpus de entrenamiento en ese idioma, donde los datos de calidad son más escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 20-21 GB para cargar completamente el GGUF Q4_K_M en GPU; con offload parcial a CPU, funciona con menos VRAM a costa de latencia.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para ejecución íntegra en GPU; A100 o H100 para servir el modelo a múltiples usuarios con vLLM o llama.cpp server.
- Consumer GPUs: sí, cabe completo en tarjetas de 24 GB (RTX 3090/4090). En tarjetas de 12-16 GB solo con offload parcial a CPU/RAM.
- En CPU: ejecutable con 32 GB de RAM, aunque con velocidades de generación bajas (del orden de pocos tokens/segundo en hardware doméstico).
- Despliegue: llama.cpp (CLI y `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo original en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles en la documentación; como referencia, un modelo de 33 B en Q4 en una RTX 4090 suele generar en el rango de 20-40 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Nanbeige4.3-33B-Base (este) | 33,1 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-32B | 32,5 B | 128 K tokens | Apache 2.0 | safetensors, GGUF |
| Yi-1.5-34B | 34,4 B | 32 K tokens | Apache 2.0 | safetensors, GGUF |
| CodeLlama-34B | 34 B | 16 K tokens | Llama 2 (restricciones) | safetensors, GGUF |

Los tres alternativas listadas son modelos bilingües o multilingües de tamaño comparable. Qwen2.5-32B y Yi-1.5-34B disponen de variantes instructas y benchmarks publicados, mientras que Nanbeige4.3 se documenta peor, lo que dificulta comparar rendimiento real.

## Limitaciones y advertencias

- Al ser un modelo base sin alineación, no sigue instrucciones de forma fiable: no es apto como asistente conversacional sin fine-tuning previo.
- Riesgo de alucinación elevado en usos conversacionales directos, al carecer de RLHF/DPO documentado.
- Soporte limitado a inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- La cuantización Q4_K_M implica cierta pérdida de calidad respecto a los pesos originales, especialmente en razonamiento matemático y código.
- La conversión a GGUF fue automatizada (GGUF-my-repo) por un tercero, no por el equipo original de Nanbeige; conviene validar la calidad del checkpoint.
- Longitud de contexto no documentada: hay que verificarla empíricamente antes de planificar aplicaciones con documentos largos.
- La licencia Apache 2.0 es permisiva para uso comercial, pero deben respetarse los términos del modelo base original.
- Escasa documentación y comunidad: sin benchmarks publicados, la evaluación previa a producción recae íntegramente en el equipo adoptante.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/nesymerp1/Nanbeige4.3-33B-Base-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Organización Nanbeige en Hugging Face: no disponible (URL directa no proporcionada)
