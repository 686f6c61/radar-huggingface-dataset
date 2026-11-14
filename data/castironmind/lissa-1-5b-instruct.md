# CastIronMind/Lissa-1.5B-Instruct

## Resumen

Lissa 1.5B Instruct es un modelo de lenguaje causal de 1.446.740.016 parámetros (1,45B) entrenado desde cero por un único desarrollador bajo el seudónimo CastIronMind. Se trata de un fine-tune supervisado sobre el checkpoint base CastIronMind/Lissa-1.5B-Base, orientado específicamente a roleplay multirroundo, escritura creativa y fanfiction en inglés y ruso, con un sesgo declarado hacia temáticas de fandom (incluido *My Little Pony*). El modelo se presenta como un artefacto de investigación: el autor documenta de forma explícita el coste (unos 555 USD de preentrenamiento en una RTX 5090 alquilada) y los resultados negativos frente a Pythia-1.4B.

La arquitectura es un híbrido de Kimi Delta Attention (KDA, atención lineal) y grouped-query attention (GQA) con atención sobre residuales, lo que lo aleja del transformer denso estándar. Dispone de 24 capas, 24 cabezas de atención con dimensión 64 y una longitud de contexto de 16.384 tokens. El preentrenamiento se realizó sobre 30B tokens de texto de fandom y el post-entrenamiento sobre 59.182 ejemplos supervisados de diálogo, roleplay y adherencia a system prompt.

Su relevancia actual es doble: por un lado, demuestra que es posible entrenar desde cero un modelo conversacional especializado con un presupuesto muy bajo y hardware de consumo; por otro, su naturaleza de atención lineal lo hace incompatible con el ecosistema GGUF/Ollama, lo que restringe su despliegue a entornos con `fla` y Triton. No está pensado para trabajo de asistente general, matemáticas ni código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida de Kimi Delta Attention (KDA, atención lineal) y grouped-query attention, con atención sobre residuales |
| Parámetros totales | 1.446.740.016 (1,45B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Parámetros no-embedding | 1.346.076.720 (1,35B) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | No disponible (sin soporte GGUF; requiere `fla` y Triton) |
| Idiomas soportados | Inglés (~70% del corpus) y ruso (~20%); cobertura ligera de francés, alemán, japonés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Capas | 24 |
| Cabezas de atención | 24, dimensión de cabeza 64 |
| Capas de atención completa | 3, 7 (lista truncada en la información disponible) |
| Modelo base | CastIronMind/Lissa-1.5B-Base |
| Tokens de preentrenamiento | 30B |
| Ejemplos de SFT | 59.182 |
| Tamaño del repo | 2,9 GB |

## Arquitectura y entrenamiento

Lissa 1.5B emplea una arquitectura híbrida que combina capas de Kimi Delta Attention (KDA), una variante de atención lineal, con capas de grouped-query attention (GQA) y atención sobre residuales. El modelo tiene 24 capas en total, de las cuales solo algunas (las capas 3 y 7 aparecen identificadas como de atención completa en la información disponible, aunque la lista está truncada) usan atención cuadrática completa, mientras que el resto usa atención lineal. Esta mezcla busca reducir el coste computacional y de memoria en contextos largos manteniendo capacidad expresiva. La implementación depende de la librería `fla` (flash-linear-attention) y de kernels Triton.

El preentrenamiento se realizó desde cero sobre 30B tokens de texto de fandom, con una receta en tres fases que incluyó una extensión de profundidad de 16 a 24 capas. Posteriormente se aplicó un fine-tune supervisado sobre 59.182 ejemplos orientados a diálogo, roleplay y adherencia a system prompt. No se menciona en la información disponible el uso de RLHF, DPO u otras técnicas de alineación por preferencias. El autor documenta explícitamente los resultados negativos del proceso, incluyendo benchmarks donde el modelo pierde frente a Pythia-1.4B.

## Capacidades

- Generación de texto conversacional multirroundo, con sesiones de roleplay documentadas de hasta diez turnos.
- Roleplay y trabajo de persona con alta adherencia al personaje: 30 de 30 prompts de roleplay mantienen el personaje sin filtrar el nombre propio del modelo.
- Escritura creativa y fanfiction, con especial énfasis en temáticas de fandom (incluido *My Little Pony*) y contenido roleplay explícito ("uncensored").
- Dos modos de operación seleccionables desde el prompt: modo "thinking" para razonamiento y modo "non-thinking" para diálogo rápido y conciso.
- Adherencia de formato fiable: terminación limpia en `<im_end>` en 91 de 100 muestras de comportamiento, 94 de 100 con el bloque de razonamiento pre-rellenado y 30 de 30 en prompts de roleplay.
- Capacidades multilingües limitadas a inglés y ruso como idiomas principales, con cobertura ligera de francés, alemán, japonés y chino.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso en la información disponible.
- No se documenta capacidad de visión, audio ni otras modalidades.

## Casos de uso

- **Roleplay multirroundo en entornos de escritura colaborativa**: el modelo mantiene el personaje a lo largo de sesiones de 3 a 7 turnos (hasta 10 en el ejemplo documentado) y termina limpiamente en `<im_end>`, lo que lo hace adecuado para plataformas de ficción interactiva donde la consistencia de persona es crítica.
- **Generación de fanfiction temática**: el corpus de preentrenamiento incluye aproximadamente 300 MB de textos sobre biología equina y material de fandom, lo que permite descripciones de poses y escenas con un nivel de detalle específico que el autor compara favorablemente con Grok en ciertos escenarios.
- **Escritura creativa en ruso**: con cerca del 20% del corpus en ruso, el modelo está posicionado por el autor como una alternativa con mejor rendimiento en ruso que Llama para tareas de escritura, lo que lo hace útil para generación de narrativa y diálogo en ese idioma.
- **Prototipado de asistentes de personaje con presupuesto mínimo**: al requerir solo 4,57 GB de VRAM pico con un prompt de 16.384 tokens en una RTX 5090, permite desplegar un chatbot de personaje en una única GPU de consumo para demos, investigación o proyectos personales.
- **Investigación sobre atención lineal híbrida**: al ser un modelo entrenado desde cero con KDA + GQA y kernels Triton, sirve como banco de pruebas para estudiar el comportamiento de arquitecturas de atención lineal en tareas conversacionales y comparar su eficiencia frente a transformers densos.
- **Generación de diálogo con formato controlado en pipelines de investigación**: la alta tasa de terminación limpia en `<im_end>` (91-94%) permite integrarlo en sistemas que parsean turnos de conversación y necesitan delimitadores fiables, siempre que se acepte la dependencia de `fla` y Triton.
- **Estudio de recetas de bajo coste**: el modelo documenta el coste de preentrenamiento (~555 USD) y la receta de tres fases con extensión de profundidad, lo que lo convierte en una referencia para investigadores interesados en entrenamiento desde cero con recursos limitados.

## Benchmarks y rendimiento

La información disponible incluye métricas de comportamiento y rendimiento de inferencia, pero no una tabla completa de benchmarks académicos (MMLU, HumanEval, GSM8K). El autor menciona explícitamente que el modelo pierde frente a Pythia-1.4B en algunos benchmarks, sin detallar los valores en la información proporcionada.

| Métrica | Resultado |
|---|---|
| Terminación limpia en `<im_end>` (100 muestras de comportamiento) | 91/100 |
| Terminación limpia con bloque de razonamiento pre-rellenado | 94/100 |
| Adherencia a personaje en prompts de roleplay | 30/30 |
| Fuga del nombre del modelo en respuesta de roleplay | 0/30 |
| Throughput a batch 1 (RTX 5090) | 17,8 tokens/s |
| Throughput a batch 16 (RTX 5090) | 272,6 tokens/s |
| VRAM pico con prompt de 16.384 tokens | 4,57 GB |
| Coste de preentrenamiento del base | ~555 USD |
| Tiempo de fine-tune | 229,8 minutos |

No se han publicado resultados de benchmarks académicos completos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: 4,57 GB pico con un prompt de 16.384 tokens en precisión nativa (según medición del autor en RTX 5090). El repo pesa 2,9 GB en safetensors.
- **GPU recomendadas**: RTX 5090 (hardware de referencia del autor). No se documentan pruebas en A100, H100 ni otras GPU de datacenter.
- **GPU de consumo**: sí cabe en GPU de consumo; el autor lo ejecuta en una única RTX 5090. No se confirma compatibilidad con GPUs de gama media o inferior en la información disponible.
- **Opciones de despliegue**: `transformers` con las librerías `fla` y Triton. No hay soporte GGUF ni build de Ollama, por lo que no es compatible con llama.cpp ni con el ecosistema de cuantización estándar. No se menciona soporte de vLLM ni TGI.
- **Latencia y throughput**: 17,8 tokens/s a batch 1 y 272,6 tokens/s a batch 16 en una RTX 5090. No se proporcionan latencias de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lissa 1.5B Instruct | 1,45B | 16.384 | Apache 2.0 | Safetensors, requiere `fla` + Triton | Especializado en roleplay EN/RU; sin GGUF ni Ollama |
| Pythia-1.4B | 1,4B | 2.048 (versión estándar) | Apache 2.0 | Safetensors, ecosistema amplio | Referencia de preentrenamiento desde cero; el autor indica que Lissa pierde frente a él en algunos benchmarks |
| Llama 3.2 1B Instruct | 1,24B | 128.000 | Llama 3.2 Community License | GGUF, Ollama, vLLM, amplio ecosistema | Asistente general multilingüe; el autor afirma que Lissa rinde mejor en ruso para escritura |
| Qwen2.5 1.5B Instruct | 1,54B | 32.768 | Apache 2.0 | GGUF, Ollama, vLLM, amplio ecosistema | Asistente general con buen soporte multilingüe y de código |

La comparativa se limita a parámetros, contexto, licencia y disponibilidad; no se dispone de datos de benchmarks comparativos en la información proporcionada para confrontar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- **No es un asistente general**: el propio autor recomienda usar modelos más grandes para preguntas factuales, matemáticas y código. El modelo está optimizado para roleplay y escritura creativa.
- **Riesgo de alucinación**: al ser un modelo de 1,45B entrenado sobre 30B tokens, su conocimiento factual es limitado y propenso a errores; no debe usarse como fuente de información.
- **Despliegue no trivial**: requiere `fla` y Triton, sin soporte GGUF ni Ollama. Esto excluye flujos de trabajo estándar de cuantización y despliegue en CPU o GPUs sin soporte de kernels Triton.
- **Sesgos de dominio**: el corpus está dominado por texto de fandom (incluido *My Little Pony* y biología equina), lo que sesga el estilo y el vocabulario hacia ese registro y puede producir respuestas desalineadas en contextos profesionales.
- **Cobertura lingüística limitada**: inglés y ruso son los idiomas principales; el resto tiene cobertura ligera. No es adecuado para producción multilingüe amplia.
- **Contenido sin censura**: el modelo se distribuye como "uncensored" y orientado a roleplay explícito, lo que implica riesgos de generar contenido inapropiado sin filtros; requiere moderación externa en producción.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías y el modelo se presenta como artefacto de investigación con resultados negativos documentados.
- **Madurez del ecosistema**: con 136 descargas y 1 like en el momento de la información, la comunidad es mínima y no hay garantías de mantenimiento o soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/CastIronMind/Lissa-1.5B-Instruct)
- [Modelo base CastIronMind/Lissa-1.5B-Base](https://huggingface.co/CastIronMind/Lissa-1.5B-Base)
- [Licencia Apache 2.0 del modelo](https://huggingface.co/CastIronMind/Lissa-1.5B-Instruct/blob/main/LICENSE)
- Librería flash-linear-attention (`fla`): no se proporciona enlace directo en la información disponible
- Paper de Kimi Delta Attention: no se proporciona enlace en la información disponible
- Repositorio de código, blog o demo: no disponible en la información proporcionada
