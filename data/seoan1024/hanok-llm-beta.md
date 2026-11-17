# seoan1024/Hanok-LLM-Beta

## Resumen

Hanok LLM 1.0 es un modelo de lenguaje de 1.000 millones de parámetros desarrollado por seoan1024, diseñado específicamente para el idioma coreano. Se trata de un transformer decoder-only nativo en PyTorch que forma parte de un stack modular más amplio (Hanok LLM) que cubre entrenamiento, inferencia, evaluación y exportación. El modelo se distribuye en formato safetensors con arquitectura compatible con Llama, lo que facilita su integración en el ecosistema de Hugging Face Transformers.

La relevancia de este lanzamiento radica en su enfoque "Korean-first": un modelo pequeño y manejable (1B) entrenado sobre datasets coreanos específicos como Korean-WebText-EDU, Wikipedia en coreano, GSM8K-ko y KoAlpaca, entre otros. El objetivo es proporcionar una base reproducible para investigación en modelos de lenguaje coreanos, con una arquitectura explícita y sin dependencias opacas.

Es importante señalar que esta es una versión Beta: según el autor, solo se ha completado aproximadamente el 50% del entrenamiento previsto, por lo que el modelo presenta inestabilidad en las respuestas, repeticiones y oraciones rotas. Está destinado exclusivamente a pruebas y experimentación, no a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nativo PyTorch, compatible Llama) |
| Parámetros totales | 1.000.000.000 (1B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto en entrenamiento/inferencia; tabla RoPE de hasta 4.096 en el constructor del modelo |
| Tipos de cuantización | No disponible (el repo incluye safetensors; el stack soporta exportación a GGUF) |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con Transformers Llama) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 33 bloques, dimensión oculta de 1.280, 10 cabezas de atención (dimensión por cabeza de 128) y capa intermedia SwiGLU de 5.881. Utiliza RMSNorm con epsilon 1e-6, codificación posicional RoPE con theta 10.000, estilo residual pre-norm y embeddings atados (output.weight = embed.weight). El vocabulario es de 30.004 tokens. Soporta KV cache por capa para inferencia eficiente.

El entrenamiento se organiza en dos fases: pretraining y SFT (supervised fine-tuning) con enmascaramiento response-only. Los datasets empleados incluyen eliceai/korean-webtext-edu, wikimedia/wikipedia, kuotient/gsm8k-ko, BCCard/gemma-4-31B-korean-on-policy-150k, beomi/KoAlpaca-v1.1a y mkd-chanwoo/aihub_conversation. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El autor indica que solo se ha completado aproximadamente el 50% del entrenamiento objetivo, lo que explica la inestabilidad actual del modelo.

## Capacidades

- Generación de texto en coreano con temperatura, top-k, top-p y penalización por repetición configurables.
- Razonamiento básico y respuesta a preguntas, condicionado por el estado parcial del entrenamiento.
- Capacidad matemática limitada, con exposición a GSM8K-ko durante el entrenamiento.
- Soporte de conversación multi-turno mediante SFT sobre KoAlpaca y AIHub conversation.
- Inferencia nativa con KV cache y carga de checkpoints `.pth`.
- Exportación a formatos estándar: bundle Transformers Llama, GGUF para llama.cpp y modelo Ollama.
- Evaluación de perplejidad y benchmark de opción múltiple en coreano.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación académica en modelos de lenguaje coreanos: el modelo sirve como base reproducible para experimentar con arquitecturas, datasets y estrategias de entrenamiento, dado que todo el stack es inspeccionable y modular.
- Experimentación con pipelines de entrenamiento: el código permite orquestar pretraining y SFT con acumulación de gradientes, schedule coseno y reanudación desde checkpoints, útil para estudiar dinámicas de entrenamiento a escala 1B.
- Pruebas de exportación e interoperabilidad: permite validar flujos de conversión de safetensors a GGUF y Ollama, útil para desarrolladores que construyen tooling de despliegue.
- Evaluación comparativa de tokenizadores y datasets coreanos: al ser un modelo pequeño y de licencia MIT, se puede usar para medir el impacto de distintos corpus (web, Wikipedia, conversacional) en tareas de perplejidad.
- Prototipado de asistentes conversacionales en coreano: aunque no apto para producción, sirve para validar interfaces y flujos de diálogo antes de migrar a modelos más grandes.
- Docencia y formación: su tamaño (1B) y su arquitectura explícita lo hacen adecuado para demostrar conceptos de transformers, RoPE, SwiGLU y KV cache en entornos educativos.
- Pruebas de despliegue en hardware modesto: con 1B parámetros y cuantización, puede ejecutarse en GPUs de consumo para validar latencia y throughput en pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP16 (1B parámetros × 2 bytes) más overhead de KV cache y activaciones; en cuantización de 8 bits, alrededor de 1 GB; en 4 bits, alrededor de 0,5-0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y de sobra.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: Transformers (carga nativa safetensors), llama.cpp (mediante exportación GGUF), Ollama (creación de modelo), y el propio stack Hanok para inferencia nativa `.pth`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend. Para un modelo de 1B, se espera un throughput alto en GPUs modernas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Hanok LLM 1.0 Beta | 1B | 1.024 (hasta 4.096 en RoPE) | Coreano | MIT | Beta, 50% entrenado |
| Llama 3.2 1B | 1B | 128K | Multilingüe | Llama 3.2 Community License | Estable |
| Gemma 2 2B | 2B | 8K | Multilingüe | Gemma Terms of Use | Estable |
| Qwen2.5 1.5B | 1.5B | 32K | Multilingüe (incluye coreano) | Apache 2.0 | Estable |

La comparativa se basa en características públicas de modelos de tamaño similar. Hanok LLM 1.0 se diferencia por su enfoque exclusivo en coreano y su licencia MIT permisiva, pero su estado Beta y su contexto limitado (1.024 tokens por defecto) lo sitúan por detrás de alternativas consolidadas en cuanto a estabilidad y capacidades multilingües.

## Limitaciones y advertencias

- Modelo en estado Beta: solo aproximadamente el 50% del entrenamiento completado, con salidas repetitivas, oraciones rotas y respuestas inexactas.
- No apto para producción ni despliegue real; el autor lo restringe explícitamente a pruebas y experimentación.
- Ventana de contexto limitada a 1.024 tokens por defecto, insuficiente para tareas que requieran contexto largo.
- Entrenado exclusivamente en coreano; no se garantiza un rendimiento aceptable en otros idiomas.
- Riesgo elevado de alucinación y respuestas incoherentes debido al entrenamiento parcial.
- Sesgos potenciales heredados de los datasets de entrenamiento (web, Wikipedia, conversacional), no evaluados ni documentados.
- Aunque la licencia es MIT (permisiva para uso comercial), el estado del modelo hace desaconsejable cualquier uso comercial real.
- No se documentan salvaguardas de seguridad, filtros de contenido ni evaluaciones de alineación.
- El repositorio indica que los pesos definitivos se publicarán cuando el entrenamiento esté completo; esta versión es intermedia.

## Enlaces

- Hugging Face: https://huggingface.co/seoan1024/Hanok-LLM-Beta
- Repositorio GitHub: https://github.com/seoan1024/Hanok-LLM.git
- Proyecto de investigación base: https://github.com/seoan1024/Korean-llm.git
