# NoobifiedAIDept/Qwen2.5-Coder-3B-Roblox-v4

## Resumen

Qwen2.5-Coder-3B-Roblox-v4 es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario NoobifiedAIDept y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la versión cuantizada a 4 bits en formato bnb-4bit de Unsloth (`unsloth/qwen2.5-coder-3b-instruct-bnb-4bit`) y ha sido entrenado específicamente para tareas de generación de código relacionadas con la plataforma Roblox y su lenguaje de scripting Luau. El objetivo declarado por el autor es corregir los problemas de la versión anterior (v3), que alucinaba código y no distinguía entre eventos remotos o tipos de scripts.

Con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones), el modelo se posiciona en la gama de modelos pequeños, lo que permite su despliegue en hardware de consumo. La información disponible no especifica la longitud de contexto, aunque al derivar de Qwen2.5-Coder-3B-Instruct es previsible que herede la ventana de contexto de la familia Qwen2.5, si bien este dato no se confirma en la documentación proporcionada.

El modelo es relevante para desarrolladores que trabajan en el ecosistema Roblox y necesitan asistencia especializada en la generación de scripts Luau, un nicho poco cubierto por los modelos generalistas. El autor anuncia que la próxima versión incorporará conocimiento básico de Roblox y utilizará la variante de 7B, lo que sugiere que la v4 se considera una iteración de cierre para la arquitectura de 3B. El entrenamiento se realizó en Google Colab utilizando Unsloth y la librería TRL de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2), ajuste fino de Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base de partida es bnb-4bit; el repo contiene safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso, y parte del checkpoint `unsloth/qwen2.5-coder-3b-instruct-bnb-4bit`, que es una versión cuantizada a 4 bits del modelo Qwen2.5-Coder-3B-Instruct. El ajuste fino se realizó mediante la libreria Unsloth, que según el autor permite un entrenamiento aproximadamente 2 veces más rápido, junto con la librería TRL de Hugging Face. El entorno de entrenamiento fue Google Colab.

El autor indica que para esta versión corrigió el dataset eliminando referencias rotas y depurándolo con ayuda de ChatGPT. El objetivo del ajuste es especializar el modelo en la generación de código Luau para Roblox, incluyendo la distinción entre eventos remotos y tipos de scripts, que eran fallos documentados de la versión anterior (v3). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla ninguna innovación arquitectónica adicional más allá del ajuste fino supervisado estándar.

## Capacidades

- Generación de texto y código especializado en Luau para la plataforma Roblox.
- Distinción entre eventos remotos (RemoteEvents) y tipos de scripts, capacidad que el autor destaca como corregida respecto a la versión anterior.
- Generación de código asistida en el contexto del desarrollo de experiencias en Roblox.
- Soporte de conversación multi-turno (etiqueta `conversational` en los metadatos).
- Compatibilidad con text-generation-inference y endpoints de Hugging Face.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Asistencia en el desarrollo de scripts Luau para Roblox: el modelo puede generar fragmentos de código para lógica de juego, manejo de eventos y estructuras de scripts, aprovechando su ajuste específico en este dominio y su capacidad para distinguir entre tipos de scripts.
- Corrección de errores en código existente: dado que el autor corrigió los fallos de alucinación de la versión anterior, el modelo puede emplearse para revisar y completar scripts que hagan referencia a RemoteEvents y otros objetos de la API de Roblox.
- Prototipado rápido de mecánicas de juego: desarrolladores indie pueden generar borradores de código para sistemas de inventario, tiendas o interacciones entre jugadores dentro de Roblox Studio.
- Generación de código en pipelines de CI/CD para proyectos Roblox: al ser compatible con transformers y text-generation-inference, puede integrarse en flujos automatizados de revisión o generación de código, aunque su tamaño reducido limita la complejidad de las tareas.
- Educación y aprendizaje de Luau: el modelo puede servir como tutor de código para nuevos desarrolladores de Roblox que necesiten ejemplos de scripts comentados y explicados.
- Despliegue en entornos con recursos limitados: con 3,09 mil millones de parámetros, puede ejecutarse en GPUs de consumo, lo que lo hace adecuado para herramientas locales de asistencia al desarrollo integradas en el IDE.
- Experimentación en investigación sobre ajuste fino especializado: sirve como caso de estudio de fine-tuning de un modelo pequeño con Unsloth en un dominio vertical concreto.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo a través de True Performance Network (TPN Bench), evaluados con `lm_eval` usando el backend de vLLM, prompts planos y el commit `196f61e`:

| Benchmark | Metrica | Resultado | Error estandar | Muestras |
|---|---|---|---|---|
| ARC-Challenge | acc_norm | 47,95 % | ±1,46 % | 1.172 |
| ARC-Challenge | acc | 44,54 % | ±1,45 % | 1.172 |

No se han publicado otros resultados de benchmarks en la información disponible. Los valores anteriores no han sido verificados de forma independiente (`verified: false` en el model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 3,09 mil millones de parámetros en precisión completa (FP16) requiere aproximadamente 6,2 GB solo para los pesos, cantidad que se reduce a unos 2-3 GB con cuantización a 4 bits; estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, así como para GPUs de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs con 8 GB o más de VRAM, especialmente con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (usado en la evaluación del autor) y, por compatibilidad con el ecosistema Qwen2, potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque esto no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Roblox-v4 | 3,09 B | No disponible | Apache 2.0 | Codigo Luau (Roblox) | Hugging Face |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | No disponible en esta ficha | Apache 2.0 | Codigo general | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7,6 B aprox. | No disponible en esta ficha | Apache 2.0 | Codigo general | Hugging Face |

La comparación se limita a la familia Qwen2.5-Coder porque la información disponible no proporciona datos de rendimiento de alternativas especializadas en Roblox. No se dispone de resultados comparativos de benchmarks entre estos modelos en la documentación aportada.

## Limitaciones y advertencias

- El modelo declara únicamente soporte de inglés, lo que limita su uso en entornos en castellano u otros idiomas.
- Riesgo de alucinación de código: el propio autor reconoce que la versión anterior (v3) alucinaba código, y aunque afirma haberlo corregido en la v4, no se aportan métricas específicas de calidad de código que lo verifiquen.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- El dataset de entrenamiento fue depurado con ayuda de ChatGPT, pero no se documenta su composición, tamaño ni procedencia, lo que dificulta evaluar sesgos o cobertura.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento documentado.
- El modelo está especializado en Roblox/Luau; su rendimiento en tareas generales de código o razonamiento puede degradarse respecto al modelo base.
- El autor anuncia una próxima versión basada en 7B, lo que sugiere que la v4 de 3B puede quedar obsoleta a corto plazo.
- No se documenta la longitud de contexto efectiva, lo que impide garantizar el manejo de conversaciones o archivos de código extensos.
- El número de descargas (42) y likes (1) es muy bajo, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NoobifiedAIDept/Qwen2.5-Coder-3B-Roblox-v4
- Modelo base (Unsloth): https://huggingface.co/unsloth/qwen2.5-coder-3b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- True Performance Network (TPN Bench): https://trueperformancenetwork.com
