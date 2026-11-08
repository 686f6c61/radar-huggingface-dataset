# RuoLOVE/DeepSeek-R1-Distill-Qwen-1.5B-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-GGUF es una redistribución en formato GGUF del modelo denso DeepSeek-R1-Distill-Qwen-1.5B, desarrollado originalmente por DeepSeek a partir de Qwen2.5-Math-1.5B y destilado por supervisión fina (SFT) sobre trazas de razonamiento generadas por DeepSeek-R1. El repositorio analizado, publicado por el usuario RuoLOVE, replica las cuantizaciones imatrix generadas por bartowski con llama.cpp (release b4514), por lo que su valor práctico está en ofrecer pesos listos para inferencia local en CPU y GPU de gama baja.

El modelo base resuelve el problema de disponer de razonamiento explícito tipo cadena de pensamiento (chain-of-thought) en un tamaño de 1.777 millones de parámetros, lo que permite ejecutarlo en hardware muy modesto. Su relevancia actual radica en que acerca capacidades de razonamiento matemático y lógico —heredadas de DeepSeek-R1 mediante 800.000 trazas de alta calidad— a entornos sin aceleradores de datacenter.

La ficha cubre tanto el modelo original como esta redistribución GGUF, que incluye 19 cuantizaciones desde f32 (7,11 GB) hasta IQ3_M (0,88 GB), con opciones específicas para Apple Silicon, ARM y AVX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | f32, f16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, Q3_K_L, Q3_K_M, Q2_K_L, IQ3_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la del modelo base tampoco se especifica en la informacion proporcionada) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 1,78 B de parámetros construido sobre Qwen2.5-Math-1.5B y destilado desde DeepSeek-R1 mediante supervisión fina sobre aproximadamente 800.000 trazas de razonamiento de alta calidad. Este proceso de destilación transfiere el comportamiento de cadena de pensamiento del modelo profesor (DeepSeek-R1, de mayor tamaño y basado en MoE) a un modelo alumno compacto, sin necesidad de RLHF adicional en el alumno. El resultado es un modelo que genera razonamiento explícito antes de responder, con mejoras notables en tareas matemáticas y lógicas frente a modelos instruction-tuned de mayor tamaño.

La redistribución GGUF se generó con llama.cpp b4514 usando cuantización imatrix, que emplea un dataset de calibración para preservar mejor la calidad en bits bajos. El formato de prompt es el específico de DeepSeek: `<｜begin▁of▁sentence｜>{system_prompt}<｜User｜>{prompt}<｜Assistant｜>`, con tokens especiales propios que deben respetarse para obtener el comportamiento esperado.

## Capacidades

- Generación de texto con razonamiento explícito (thinking mode): produce cadenas de pensamiento antes de la respuesta final.
- Razonamiento matemático y lógico reforzado por destilación desde DeepSeek-R1 (AIME2024, MATH-500).
- Generación de código y resolución de problemas algorítmicos.
- Conversación multi-turno (tag `conversational` en el repo).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo mediante APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- Razonamiento matemático local en equipos sin GPU: con la cuantización Q4_K_M (1,12 GB) el modelo cabe en cualquier portátil moderno y permite resolver problemas de álgebra y cálculo paso a paso mostrando el razonamiento.
- Asistente de estudio con trazas de pensamiento: útil para entornos educativos donde se quiere que el modelo explique el proceso, no solo la respuesta, aprovechando la destilación de DeepSeek-R1.
- Prototipado de pipelines de razonamiento en CI: al ser tan ligero, se puede integrar en tests automatizados que verifiquen la calidad del razonamiento sin coste de GPU.
- Despliegue en dispositivos edge o Raspberry Pi: las cuantizaciones IQ3_M (0,88 GB) y Q3_K_M (0,92 GB) permiten ejecución en ARM con llama.cpp, útil para asistentes offline.
- Generación de código asistida en IDE local: con Q6_K (1,46 GB) se obtiene calidad casi nativa en un modelo que cabe en VRAM de 4 GB, adecuado para autocompletado y explicación de fragmentos.
- Evaluación comparativa de destilaciones: sirve como baseline pequeño para medir cuánto razonamiento se preserva al reducir tamaño, comparándolo con el modelo base en safetensors.
- Filtrado y clasificación con justificación: el modelo puede generar la razón de una decisión, útil en pipelines de moderación de contenido que requieren explicabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta redistribución GGUF. El modelo base DeepSeek-R1-Distill-Qwen-1.5B reporta mejoras en AIME2024 y MATH-500 frente a modelos instruction-tuned de mayor tamaño según la documentación de DeepSeek, pero no se dispone de cifras concretas en la información proporcionada, por lo que no se incluyen números.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: IQ3_M ~0,88 GB; Q4_K_M ~1,12 GB; Q5_K_M ~1,29 GB; Q6_K ~1,46 GB; Q8_0 ~1,89 GB; f16 ~3,56 GB; f32 ~7,11 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso iGPU con memoria compartida.
- Ejecutable en CPU pura (AVX2/AVX-512) y en Apple Silicon (cuantizaciones Q4_1, Q4_0 e IQ4_NL con repacking online para ARM).
- Opciones de despliegue: llama.cpp, LM Studio (recomendado por el autor), Ollama (importando el GGUF), y servidores compatibles con endpoints OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 1,78 B, en hardware consumer se espera una velocidad muy alta, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este) | 1,78 B | no disponible | no disponible | GGUF en este repo; safetensors en deepseek-ai |
| Qwen2.5-Math-1.5B (base del destilado) | ~1,5 B | no disponible | no disponible | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | ~7 B | no disponible | no disponible | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B | ~8 B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa; la comparativa se limita a tamaño, familia y disponibilidad.

## Limitaciones y advertencias

- Modelo muy pequeño (1,78 B): tiende a alucinar en dominios especializados y a producir razonamientos largos con errores en problemas complejos.
- La destilación por SFT no incluye RLHF en el alumno, por lo que puede mostrar menor alineación conversacional que modelos instruction-tuned equivalentes.
- Licencia no disponible en la información proporcionada: verificar la licencia del modelo base antes de uso comercial.
- Idiomas soportados no documentados: el rendimiento fuera de inglés y chino puede degradarse.
- Longitud de contexto no documentada: no asumir ventanas largas sin verificar en el modelo base.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño del repo (35,5 GB) incluye todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- El autor del repo (RuoLOVE) replica cuantizaciones de bartowski; para producción se recomienda contrastar con el repo original de bartowski o con los safetensors de deepseek-ai.
- Requiere respetar los tokens especiales de DeepSeek (`<｜begin▁of▁sentence｜>`, `<｜User｜>`, `<｜Assistant｜>`); un formato incorrecto degrada la calidad del razonamiento.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/RuoLOVE/DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- llama.cpp (release b4514): https://github.com/ggerganov/llama.cpp/releases/tag/b4514
- Dataset de calibración imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
- Referencia técnica en Emergent Mind: https://www.emergentmind.com/topics/deepseek-r1-distill-qwen-1-5b
