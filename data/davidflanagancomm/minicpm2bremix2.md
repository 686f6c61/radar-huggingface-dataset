# davidflanagancomm/minicpm2bremix2

## Resumen

MiniCPM 2B Remix 2 es un ajuste fino experimental del modelo MiniCPM5-2B de OpenBMB, publicado por el usuario davidflanagancomm en HuggingFace. Se distribuye exclusivamente en formato GGUF y parte del checkpoint oficial en F16 publicado por OpenBMB. El autor lo describe como un trabajo en curso basado en la actualización número 42 de un LoRA de rango 32 entrenado con AdamW, fusionada en el modelo base y convertida directamente desde el maestro en FP32.

El objetivo declarado del ajuste es mejorar habilidades elementales de aritmética y seguimiento de estado, medidas con un panel propio denominado S³. Según los datos del autor, el modelo pasa de 59 a 503 aciertos sobre 864 casos en ese panel, pero empeora de forma notable en una muestra de matemáticas de GSM8K (de 23/32 a 3/32). Es, por tanto, un experimento de investigación con un perfil de capacidades muy sesgado, no un modelo de propósito general.

Con 2.516.756.480 parámetros y un repositorio de 21,2 GB que contiene múltiples cuantizaciones, el modelo se posiciona en la gama de 2B, apta para hardware de consumo. La licencia Apache 2.0 y el formato GGUF facilitan su despliegue con llama.cpp u Ollama, aunque la falta de documentación sobre datos de entrenamiento, idiomas y contexto limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de MiniCPM5-2B; detalles no disponibles) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, Q8_0, Q5_K_M, Q4_K_M (según resultados publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de MiniCPM5-2B de OpenBMB, un transformer de 2.516.756.480 parámetros. El autor no documenta en la model card la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Lo que sí especifica es el procedimiento de ajuste: un LoRA de rango 32 entrenado con el optimizador AdamW, del que se publica la actualización número 42, fusionada en los pesos base y convertida a GGUF directamente desde el maestro en FP32 para preservar la precisión numérica.

El entrenamiento se orientó a un panel propio de nueve habilidades elementales de aritmética y seguimiento de estado (S³), con 96 casos por habilidad que cubren tareas independientes, composición y transferencia o recuperación. No se menciona ninguna innovación arquitectónica adicional (atención lineal, decodificación especulativa, mezcla de expertos) ni cambios en el tokenizador. El autor advierte explícitamente que los 864 casos de desarrollo se observaron repetidamente durante el estudio, por lo que las métricas no constituyen una evaluación sellada ni un benchmark general.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Aritmética elemental y seguimiento de estado: el panel S³ muestra una mejora sustancial frente al modelo base (503/864 frente a 59/864 en FP32).
- Finalización natural de respuestas: 864/864 respuestas con parada natural en el panel del autor, frente a 415/864 del modelo original.
- Razonamiento matemático general: capacidad degradada según la muestra de GSM8K (3/32 frente a 23/32 del base).
- Conocimiento científico y de sentido común: se mantiene estable en la muestra de ARC-Challenge (24/32, igual que el base).
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible; el spot check se realizó con thinking desactivado, lo que sugiere que el modelo base podría tener algún modo de razonamiento, pero no se documenta.

## Casos de uso

- Investigación sobre ajuste fino con LoRA de alto rango: el repositorio documenta el procedimiento completo (rango 32, AdamW, fusión y conversión desde FP32), lo que lo convierte en un caso de estudio reproducible para estudiar el intercambio entre habilidades específicas y capacidades generales.
- Experimentos de seguimiento de estado en tareas sintéticas: útil como banco de pruebas para evaluar cómo un ajuste fino estrecho afecta a la composición y transferencia de habilidades aritméticas elementales.
- Despliegue ligero en local con llama.cpp u Ollama: las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo y permiten probar el modelo en portátiles o estaciones de trabajo sin aceleradores dedicados.
- Evaluación comparativa de cuantizaciones: el autor publica resultados para FP32, FP16, Q8_0, Q5_K_M y Q4_K_M sobre el mismo panel, lo que permite medir la degradación por cuantización en un modelo de 2B.
- Docencia y demostraciones sobre riesgos de sobreajuste: el contraste entre la mejora en S³ y el colapso en GSM8K es un ejemplo didáctico de especialización excesiva.
- Prototipado de asistentes conversacionales de bajo coste: siempre que el dominio no requiera matemáticas complejas, el modelo puede servir para pruebas de integración en pipelines conversacionales con recursos limitados.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card. No son benchmarks oficiales: el panel S³ es propio y la muestra externa es pequeña y no aleatoria.

| Modelo | S³ aciertos / 864 | Finalizaciones naturales / 864 | GSM8K + ARC aciertos / 64 |
|---|---:|---:|---:|
| MiniCPM5-2B original FP16 | 59 | 415 | 46 |
| MiniCPM5-2B original FP32 | 59 | 415 | 47 |
| Remix 2 FP32 | 503 | 864 | 27 |
| Remix 2 FP16 | 503 | 864 | 27 |
| Remix 2 Q8_0 | 505 | 864 | 26 |
| Remix 2 Q5_K_M | 495 | 864 | 25 |
| Remix 2 Q4_K_M | 484 | 863 | 26 |

Desglose de la muestra externa (32 filas de GSM8K y 32 de ARC-Challenge, decodificación greedy, thinking desactivado, límite de 512 tokens):

| Modelo | GSM8K / 32 | ARC-Challenge / 32 |
|---|---:|---:|
| Remix 2 FP32 | 3 | 24 |
| MiniCPM5-2B original FP32 | 23 | 24 |
| MiniCPM5-2B original FP16 | 22 | 24 |

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, alrededor de 1,5-2 GB para pesos más overhead de contexto; en Q8_0, en torno a 2,7-3 GB; en FP16, unos 5 GB; en FP32, unos 10 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para FP16/FP32; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo HuggingFace. vLLM y TGI no están confirmados para este repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| MiniCPM 2B Remix 2 | 2,52 B | no disponible | Apache 2.0 | GGUF | Ajuste experimental; mejora S³, regresión en GSM8K |
| MiniCPM5-2B (OpenBMB) | 2,52 B | no disponible | Apache 2.0 (según modelo base) | GGUF, safetensors | Modelo original; base del remix |
| Qwen2.5-1.5B | 1,54 B | 32 768 | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con contexto documentado |
| Gemma 2 2B | 2,61 B | 8 192 | Gemma Terms | safetensors, GGUF | Alternativa de 2B con licencia más restrictiva |

La comparación con Qwen2.5-1.5B y Gemma 2 2B se ofrece como referencia de categoría; no se dispone de resultados de benchmarks comparables entre ellos y el Remix 2 en la información proporcionada.

## Limitaciones y advertencias

- Regresión severa en matemáticas: 3/32 en GSM8K frente a 23/32 del modelo base FP32, según el propio autor.
- Las métricas del panel S³ no son un benchmark sellado: los 864 casos se observaron repetidamente durante el desarrollo y el autor lo advierte explícitamente.
- La muestra externa es pequeña y no aleatoria (32 filas de GSM8K y 32 de ARC-Challenge), por lo que no permite conclusiones generales.
- Es un trabajo en curso: el autor lo etiqueta como experimental y no garantiza calidad ni idoneidad para uso general.
- No se documentan sesgos conocidos, composición del dataset ni procesos de alineación, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación: no cuantificado; al ser un ajuste estrecho sobre habilidades aritméticas, la fidelidad factual en dominios abiertos es incierta.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe.
- Longitud de contexto no documentada; no se recomienda para tareas que dependan de ventanas largas sin verificación previa.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el entrenamiento y las advertencias del autor desaconsejan producción sin una evaluación propia.
- El repositorio ocupa 21,2 GB por incluir múltiples cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidflanagancomm/minicpm2bremix2
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Estudio de habilidades de alto rango (documentación del autor): https://github.com/CC-David-CC/sss/blob/feat/minicpm-highrank-20261027/docs/MINICPM-HIGH-RANKS.md
