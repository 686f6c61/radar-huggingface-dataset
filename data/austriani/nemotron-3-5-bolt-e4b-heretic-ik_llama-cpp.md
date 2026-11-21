# Austriani/Nemotron-3.5-Bolt-E4B-Heretic-ik_llama.cpp

## Resumen
Nemotron-3.5-Bolt-E4B-Heretic-ik_llama.cpp es una cuantización GGUF del modelo grumd0/Nemotron-3.5-Bolt-E4B-Heretic, una variante "abliterated" (sin mecanismos de rechazo) de la familia Nemotron de NVIDIA, publicada por el usuario Austriani. El repositorio contiene pesos cuantizados con la herramienta ik_llama.cpp e imatrix en los formatos iq4_kt, iq4_ks e iq5_k, orientados a inferencia eficiente en CPU y GPU de gama media. El modelo base declara 7.463.013.674 parámetros totales y una arquitectura tipo transformer (etiquetada con los tags nemotron, bolt y gemma), con licencia openmdw-1.1.

El interés de esta ficha radica en tres factores: la cuantización agresiva (4-5 bits) que reduce el repositorio a 21,8 GB frente a los ~15 GB de pesos en FP16 equivalentes, el carácter "uncensored/abliterated" que elimina la capa de rechazo del modelo original, y la orientación explícita a edge-ai y tool-calling. Está pensado para desarrolladores que quieren desplegar un modelo conversacional con function calling en hardware modesto, aceptando el trade-off de un modelo sin alineamiento de seguridad.

La información pública disponible es escasa: no hay datos de benchmarks, composición del dataset de entrenamiento ni idiomas confirmados más allá del tag `en`. Esta ficha refleja únicamente lo verificable en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tags: nemotron, bolt, gemma); detalles no disponibles |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | iq4_kt, iq4_ks, iq5_k (GGUF, imatrix) |
| Idiomas soportados | en (único idioma declarado) |
| Licencia | openmdw-1.1 (NVIDIA Nemotron Open Model License) |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento
El modelo base es un transformer de 7.463 millones de parámetros derivado de la familia Nemotron de NVIDIA, con los tags `bolt` y `gemma` que sugieren una base inspirada en Gemma o una destilación de la misma. El sufijo "E4B" en el nombre sugiere un tamaño efectivo de 4B, aunque los parámetros totales declarados son 7.46B, lo que podría indicar un modelo con componentes compartidos o una nomenclatura comercial no equivalente al conteo real. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO.

La variante "Heretic" fue sometida a un proceso de abliteration: se elimina la dirección de rechazo en el espacio de activaciones para que el modelo no se niegue a responder peticiones. Esta técnica no requiere reentrenamiento completo, sino la modificación de pesos en las capas de atención y MLP. La cuantización posterior con ik_llama.cpp e imatrix (matriz de importancia calculada sobre un corpus de calibración) busca preservar la calidad en 4-5 bits, especialmente en las capas más sensibles. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional multi-turno, con el tag `conversational` declarado.
- Razonamiento (tag `reasoning`), aunque sin benchmarks que lo cuantifiquen.
- Tool calling / function calling (tag `tool-calling`), lo que permite integración en pipelines de agentes.
- Modo "uncensored/abliterated": no aplica rechazo de seguridad, responde a peticiones que el modelo original rechazaría.
- Capacidades multilingües limitadas al inglés (`en` es el único idioma declarado).
- Orientado a edge-ai: cuantizaciones 4-5 bits pensadas para hardware de gama baja.
- No se declaran capacidades de visión, audio ni thinking mode explícito.

## Casos de uso
- Asistente conversacional local en inglés: el modelo puede mantener diálogos multi-turno en un equipo de escritorio con GPU de 8-12 GB, usando la cuantización iq4_ks para minimizar VRAM.
- Automatización de tool calling en agentes: gracias al tag `tool-calling`, se puede integrar en frameworks como LangChain o LlamaIndex para que el modelo decida qué función invocar y con qué argumentos en flujos de automatización.
- Generación de código asistida en entornos sin censura: útil para prototipado rápido de scripts y refactorización, aceptando que no hay benchmarks de HumanEval que garanticen calidad.
- Investigación sobre abliteration y seguridad: el modelo sirve como caso de estudio para medir cómo la eliminación de la dirección de rechazo afecta la utilidad y la toxicidad en modelos de 7B.
- Despliegue en edge devices: con cuantización iq4_kt (~4 bits) y 21,8 GB de repo completo, se pueden seleccionar subconjuntos de pesos para dispositivos con poca memoria, usando llama.cpp o ik_llama.cpp.
- Chatbot de dominio cerrado sin restricciones: para aplicaciones internas donde el filtrado de contenido no es requisito (por ejemplo, generación de ficción o roleplay), el modelo no bloqueará peticiones legítimas.
- Pruebas de robustez y red teaming: al no rechazar peticiones, es útil para evaluar la eficacia de filtros externos y para generar casos adversarios en pipelines de seguridad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: ~4,5-5,5 GB para iq4_kt/iq4_ks (4 bits) y ~6-7 GB para iq5_k (5 bits), asumiendo overhead de contexto; el repo completo de 21,8 GB incluye todas las variantes.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB; A100/H100 no son necesarias para 7B.
- Cabe en consumer GPU: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB con iq4_kt y contexto reducido.
- Opciones de despliegue: ik_llama.cpp (formato nativo), llama.cpp, Ollama (tras importar el GGUF), y servidores compatibles con endpoints (`endpoints_compatible` en los tags).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Heretic (este) | 7.46B | no disponible | openmdw-1.1 | GGUF, ik_llama.cpp |
| Mistral-7B-Instruct | 7.24B | 32k | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8.03B | 128k | Llama 3.1 Community | safetensors, GGUF |
| Qwen2.5-7B-Instruct | 7.61B | 32k | Apache 2.0 | safetensors, GGUF |

La comparativa con Mistral, Llama y Qwen es orientativa por tamaño; no hay benchmarks publicados para este modelo que permitan comparar rendimiento real. La principal diferencia es la licencia openmdw-1.1 (más restrictiva que Apache 2.0) y el carácter abliterated, que no está presente en las alternativas.

## Limitaciones y advertencias
- Modelo abliterated: no aplica rechazo de seguridad, por lo que puede generar contenido tóxico, ilegal o dañino sin filtro; no apto para producción orientada a usuarios finales sin capas de moderación externas.
- Sesgos desconocidos: no se documenta la composición del dataset ni los sesgos del modelo base.
- Riesgo de alucinación: inherente a modelos de 7B sin benchmarks de veracidad; sin datos de evaluación, no se puede acotar.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Contexto: no se declara la longitud de ventana, lo que impide planificar casos de uso con contexto largo.
- Licencia openmdw-1.1: incluye términos de la NVIDIA Nemotron Open Model License; revisar restricciones de uso comercial antes de desplegar.
- Tag `not-for-all-audiences`: el autor advierte explícitamente sobre contenido no apto para todas las audiencias.
- Cuantización: la pérdida de calidad frente al modelo base no está medida; iq4_kt es la más agresiva y puede degradar tool calling y razonamiento.

## Enlaces
- Hugging Face: https://huggingface.co/Austriani/Nemotron-3.5-Bolt-E4B-Heretic-ik_llama.cpp
- Modelo base: https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Repositorio ik_llama.cpp: no disponible en la información proporcionada
- Papers, blogs y demos: no disponibles en la información proporcionada
