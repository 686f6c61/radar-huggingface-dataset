# Green-Eye/Akikawa-3.3-1b-Roleplay-128K-GGUF

## Resumen

Akikawa-3.3-1b-Roleplay-128K es un ajuste fino (finetune) de tipo roleplay y conversacional construido sobre `saidutta69/Llama-3.2-1B-Instruct-heretic`, una variante "abliterated" del Llama 3.2 1B Instruct de Meta. El modelo lo publica el usuario Green-Eye en Hugging Face y está orientado a la interpretación de personajes, con la franquicia Uma Musume como temática declarada en las etiquetas. Su distribución principal es en formato GGUF, pensada para ejecutarse con llama.cpp y llama-cpp-python en hardware modesto.

El modelo tiene 1.235.814.400 parámetros totales (aproximadamente 1,24 mil millones), lo que lo sitúa en la gama de modelos pequeños capaces de correr en CPU o en GPUs de consumo. El nombre comercial sugiere una ventana de contexto de 128K tokens, aunque la model card no documenta explícitamente esa cifra ni el procedimiento de extensión de contexto; el dato debe tratarse como no verificado.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho para roleplay en inglés, con licencia Llama 3.2 y sin métricas publicadas. No es un modelo para tareas de producción generalistas, sino una pieza especializada dentro del ecosistema de modelos pequeños sin censura (abliterated) para experimentación con personajes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 1B Instruct) |
| Parámetros totales | 1.235.814.400 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K según el nombre del modelo; no documentado en la model card (no disponible) |
| Tipos de cuantización | GGUF (el repo incluye múltiples variantes GGUF; relación exacta de quants no disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 (Llama 3.2 Community License) |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B Instruct: un transformer decoder-only con atención por grupos (GQA) y tokenizador BPE de Llama 3. Sobre esa base, `saidutta69/Llama-3.2-1B-Instruct-heretic` aplica una modificación de tipo "abliterated" (eliminación de la dirección de rechazo en el espacio de activaciones), y Green-Eye realiza un finetune adicional orientado a roleplay y conversación con personajes. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado.

El autor no documenta innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La etiqueta "heretic" indica que el modelo base fue sometido a un proceso de abliteración, lo que reduce los rechazos automáticos pero también elimina parte de los mecanismos de seguridad alineados del modelo original. El sufijo "128K" del nombre apunta a una extensión de contexto, pero no hay evidencia en la model card sobre la técnica empleada (RoPE scaling, YaRN u otra) ni sobre la calidad de la recuperación en ventanas largas.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno con personajes.
- Interpretación de personajes (roleplay) con consistencia de persona, incluyendo personajes de la franquicia Uma Musume.
- Conversación general sin rechazos automáticos agresivos, gracias a la base abliterated.
- Generación de texto creativo y narrativo dentro de un rol.
- Capacidades de razonamiento, código y matemáticas limitadas por el tamaño de 1B parámetros; no son el objetivo del ajuste.
- Soporte de tool calling / function calling: no documentado (no disponible).
- Soporte de agentes y razonamiento multi-paso: no documentado (no disponible).
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de chatbots de personaje: el modelo puede mantener conversaciones multi-turno en inglés con una persona definida, y su tamaño de 1B permite iterar rápido en local sin coste de API.
- Experimentación con roleplay sin censura: útil para investigadores que estudian el comportamiento de modelos abliterated en escenarios narrativos, comparando respuestas frente al Llama 3.2 Instruct original.
- Desarrollo de videojuegos narrativos o novelas visuales: integrable vía llama-cpp-python para generar diálogos de PNJ en tiempo real en hardware de consumo.
- Asistente de escritura creativa: generación de diálogos y escenas con un personaje concreto, con la ventaja de que el modelo cabe en una GPU de gama media o incluso en CPU.
- Evaluación de técnicas de cuantización: el repo GGUF permite comparar la degradación de calidad entre quants en una tarea subjetiva como el roleplay.
- Despliegue en entornos con recursos limitados: inferencia en CPU o en GPUs con 4-8 GB de VRAM para demos y pruebas de concepto, sin depender de servicios en la nube.
- Fines educativos sobre alineación y abliteración: analizar qué se gana y qué se pierde al eliminar la dirección de rechazo en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-0,9 GB en cuantización Q4_K_M (1,24B parámetros), 1,3-1,5 GB en Q8_0 y alrededor de 2,5 GB en FP16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las GPU de datacenter están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas (GTX 1650 en adelante) y en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, llama-cpp-python (librería declarada), Ollama (previa conversión o importación del GGUF), y servidores compatibles con la API de endpoints de Hugging Face. vLLM y TGI no están documentados para este repo, aunque podrían funcionar con los pesos safetensors.
- Latencia y throughput estimados: no disponibles; en CPU se espera una generación de decenas de tokens por segundo y en GPU de consumo cientos de tokens por segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akikawa-3.3-1b-Roleplay-128K | 1,24B | 128K (según nombre, no verificado) | Roleplay, abliterated | Llama 3.2 | GGUF y safetensors en HF |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 128K | Asistente general alineado | Llama 3.2 | Pesos oficiales en HF |
| saidutta69/Llama-3.2-1B-Instruct-heretic | 1,24B | 128K | Base abliterated sin ajuste de rol | Llama 3.2 | HF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Asistente general multilingüe | Apache 2.0 | HF |

La comparativa se limita a modelos de la misma familia y tamaño; no se dispone de benchmarks que permitan comparar rendimiento objetivo entre ellos. La principal diferencia de Akikawa frente a sus alternativas es el ajuste específico de roleplay y la ausencia de mecanismos de rechazo, a costa de una licencia más restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.2 y aplicar abliteración, el modelo puede reproducir sesgos presentes en los datos de entrenamiento originales y carece de las capas de mitigación que Meta aplicó en el Instruct.
- Riesgo de alucinación: elevado en un modelo de 1B parámetros, especialmente en tareas factuales, matemáticas y código; no es adecuado para consultas de precisión.
- Limitaciones de contexto e idioma: solo inglés declarado; la ventana de 128K no está documentada ni verificada, y la calidad en contextos largos en modelos de este tamaño suele degradarse.
- Restricciones de licencia: la Llama 3.2 Community License impone condiciones de uso comercial, obligaciones de atribución y límites para empresas con más de 700 millones de usuarios mensuales; debe revisarse antes de un despliegue comercial.
- Contenido sin filtro: la naturaleza abliterated implica que el modelo puede generar contenido que el Llama 3.2 Instruct rechazaría; requiere moderación externa en cualquier producto orientado a usuarios finales.
- Caveats para producción: sin benchmarks publicados, sin documentación del dataset de entrenamiento y sin garantías de calidad; el repo pesa 22,1 GB por incluir múltiples cuantizaciones, lo que complica la gestión de artefactos.
- Fecha de creación futura (2026-08-20) en los metadatos de Hugging Face, lo que sugiere posible manipulación de metadatos o un error del autor; conviene verificar la procedencia antes de confiar en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Green-Eye/Akikawa-3.3-1b-Roleplay-128K-GGUF
- Modelo base: https://huggingface.co/saidutta69/Llama-3.2-1B-Instruct-heretic
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
