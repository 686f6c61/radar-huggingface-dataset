# SargeDev/Edge0-Cyber-Uncensored-nvfp4

## Resumen

Edge0-Cyber-Uncensored-nvfp4 es una derivación comunitaria del modelo Edge0-145B-NVFP4, publicada por el usuario SargeDev. Se trata de un build "abliterado": se ha eliminado el comportamiento de rechazo mediante una proyección a nivel de pesos (abliteration) aplicada sobre el fichero `model-skeleton.gguf`, la parte del modelo que permanece siempre residente en memoria. El resto del paquete (el pool de expertos NVFP4 de 47,6 GB, la tabla de n-gramas de 51,2 GB, las proyecciones latentes, el tokenizer y la cabeza de borrador MTP) es idéntico byte a byte al modelo base.

El modelo pertenece a la familia Edge0, una arquitectura MoE latente cuantizada en NVFP4 y orientada a inferencia en el borde (edge inference). Según los safetensors, el recuento de parámetros totales es de 4.947.698.560 (aproximadamente 4,95 mil millones), aunque el nombre comercial "145B" y el tamaño del repositorio (113,8 GB) apuntan a una estructura con un pool de expertos externo al grafo denso que no se refleja en ese recuento. La longitud de contexto no está especificada en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta un caso de abliteración sobre un modelo MoE cuantizado en 4 bits con resultados medidos sobre el conjunto mlabonne (520 prompts dañinos y 520 inofensivos); por otro, ilustra las implicaciones de seguridad y licencia de distribuir derivaciones sin salvaguardas. El modelo está pensado para investigación y desarrollo educativo según su autor, y se distribuye bajo la licencia `edge0-community-model-1.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE latente (latent-MoE), descendiente de la familia Edge0; pesos en NVFP4 (4 bits) |
| Parametros totales | 4.947.698.560 (según safetensors); el nombre comercial indica 145B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits); el paquete incluye `model-skeleton.gguf` y pool de expertos NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (license: other) |
| Formato de pesos | GGUF (`model-skeleton.gguf`), NVFP4, safetensors, `mmproj-BF16.gguf` para visión |

## Arquitectura y entrenamiento

El modelo es un MoE latente cuantizado en NVFP4, derivado de Edge0/Edge0-145B-NVFP4. La arquitectura separa una parte siempre residente (`model-skeleton.gguf`, que contiene atención lineal, salida de atención, down-projection del experto compartido y embeddings de tokens) de un pool de expertos de 47,6 GB y una tabla de n-gramas de 51,2 GB que se cargan de forma dinámica. Incluye además una cabeza de borrador MTP (multi-token prediction) para decodificación especulativa y un helper de visión (`strata-vision`) con proyector `mmproj-BF16.gguf`.

El entrenamiento original de Edge0-145B-NVFP4 no se detalla en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO: no disponible). La modificación de este build consiste en una abliteración: se tomaron 47 vectores unitarios por capa de 2560 dimensiones correspondientes a la "dirección de rechazo" publicada de Qwen3.8-Flash-Next y se proyectaron fuera de 97 tensores del esqueleto (salida de atención lineal, salida de atención, down-projection del experto compartido y embedding de tokens). El cambio relativo por tensor es de mínimo 1,68 %, mediana 2,09 % y máximo 4,22 % de la norma del tensor. El resto del paquete es byte-idéntico al upstream, verificado mediante `CHECKSUMS.txt`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y codificación (tags `agent`, `coding`).
- Soporte de tool calling y function calling a través de endpoints compatibles con OpenAI y Anthropic servidos por `edge0-infer`.
- Capacidades de agente y razonamiento multi-paso (tag `agent`).
- Visión: soportada mediante `mmproj-BF16.gguf` y el helper `strata-vision`, igual que el modelo upstream.
- Modo de pensamiento (thinking) configurable; las mediciones de abliteración se realizaron con thinking desactivado y 256 tokens.
- Comportamiento de rechazo reducido: en el conjunto mlabonne de 520 prompts dañinos, pasa de 519 rechazos (modelo base) a 319 (este build) y 307 rechazos "reales" de seguridad según la lectura completa del texto.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre alineación y abliteración: el paquete incluye `abliteration/results/` con el texto completo de cada respuesta de cada ejecución, lo que permite reproducir y auditar la metodología de proyección de la dirección de rechazo sobre un MoE cuantizado.
- Evaluación de seguridad de derivaciones comunitarias: comparar los conjuntos mlabonne (520+520), el set de seguridad de 25 prompts, el de química de 25 y el de objetivos de 22 para medir qué categorías de rechazo se eliminan y cuáles persisten.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: según las cifras del upstream, el build NVFP4 se ejecuta en una tarjeta GDDR de 24 GB, lo que permite servir el modelo en hardware consumer de gama alta.
- Inferencia en cajas con memoria unificada: el build completo ocupa ~58,6 GiB en un equipo GB10 de 121 GiB de memoria unificada, adecuado para prototipos en estaciones ARM (aarch64) con CUDA 13.
- Integración en pipelines de agentes y coding: los endpoints compatibles con OpenAI y Anthropic (nombre de modelo `edge0_145b`) permiten conectarlo a frameworks de agentes existentes sin adaptadores.
- Servicio de chat interactivo local: `edge0-infer chat` abre una sesión interactiva para pruebas de conversación multi-turno con visión opcional.
- Estudio de decodificación especulativa: la cabeza MTP incluida permite analizar el rendimiento de la generación con borrador en un MoE latente cuantizado.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las mediciones de abliteración sobre conjuntos de prompts, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación.

| Conjunto | Modelo base (stock) | Este build | v2 |
|---|---|---|---|
| mlabonne, 520 dañinos (rechazos) | 519 | 319 | 329 |
| mlabonne, 520 inofensivos (rechazos) | 15 | 15 | 16 |
| Rechazos reales de seguridad (520 dañinos) | 517 | 307 | 314 |
| No rechazos de ese tipo | 2 | 12 | 15 |
| Set de seguridad, 25 prompts | no disponible | 25/25 entregados | no disponible |
| Set de química, 25 prompts | no disponible | 18/18 de química real entregada; de 7 que deberían contenerse, 4 se contienen y 3 se abren | no disponible |
| Set de objetivos, 22 prompts | no disponible | 7/8 cyber, 5/8 bio, 6/6 normal | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el build completo ocupa ~58,6 GiB en un equipo con 121 GiB de memoria unificada (GB10). Una tarjeta GDDR de 24 GB puede ejecutarlo según las cifras del upstream.
- GPU recomendadas: NVIDIA con CUDA 13 en Linux o Windows (incluido aarch64); el build NVFP4 es solo CUDA. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: sí, en una tarjeta de 24 GB según las cifras del upstream; el requisito exacto de VRAM por componente no está detallado.
- Opciones de despliegue: motor propietario `edge0-strata` (engine) y frontend `edge0-infer`, que expone endpoints compatibles con OpenAI y Anthropic en `http://127.0.0.1:8000` con nombre de modelo `edge0_145b`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SargeDev/Edge0-Cyber-Uncensored-nvfp4 | 4,95B según safetensors (nombre comercial 145B) | no disponible | NVFP4 | edge0-community-model-1.0 | Hugging Face, 924 descargas |
| SargeDev/Edge0-Cyber-Uncensored-nvfp4-v2 | no disponible | no disponible | NVFP4 | edge0-community-model-1.0 | Hugging Face |
| Edge0/Edge0-145B-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Hugging Face (modelo base) |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor declara explícitamente que es una derivación comunitaria, no un lanzamiento oficial de Edge0, y que se publica para investigación y desarrollo educativo.
- La abliteración elimina rechazos ante solicitudes dañinas: de 519 rechazos del modelo base ante 520 prompts dañinos se pasa a 319 (307 rechazos reales de seguridad). Persisten rechazos ante autolesión, contenido infantil, contenido sexual, odio, violencia y fabricación de armas, pero se abren respuestas ante solicitudes de ciberataque y química peligrosa (por ejemplo, dispositivo explosivo, patógeno y TNT con descargo previo y respuesta completa).
- Riesgo de alucinación: no cuantificado en la información disponible; el autor señala que las respuestas del conjunto inofensivo incluyen límites del modelo (sin tiempo real, sin audio, sin imagen, sin búsqueda) y falsos positivos del marcador.
- Restricciones de licencia: `edge0-community-model-1.0` (license: other); no se detallan los términos de uso comercial en la información disponible.
- El build NVFP4 es exclusivamente CUDA (NVIDIA, CUDA 13, Linux o Windows, incluido aarch64); no hay ruta de ejecución en CPU ni en otras aceleradoras documentada.
- El despliegue requiere compilar el motor `edge0-strata` y el frontend `edge0-infer` desde el repositorio de GitHub; no es compatible con runtimes estándar de Hugging Face.
- El paquete pesa ~114 GB y debe mantenerse con la estructura de carpetas intacta, ya que los parámetros del motor viven en `model.json` y no en la línea de comandos.
- Idiomas soportados y longitud de contexto no documentados, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- El autor declina responsabilidad por las salidas del modelo y por las acciones tomadas a partir de ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Edge0-Cyber-Uncensored-nvfp4
- Build v2: https://huggingface.co/SargeDev/Edge0-Cyber-Uncensored-nvfp4-v2
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Repositorio del motor: https://github.com/Edge0-AI/Edge0
- Documentación del motor: `edge0-strata/EDGE0.md` (dentro del repositorio)
- Guía del frontend: `edge0-infer/docs/getting-started.md` (dentro del repositorio)
- Resultados de abliteración: `abliteration/results/` y `abliteration/README.md` (dentro del repositorio del modelo)
- Checksums de verificación: `CHECKSUMS.txt` (dentro del repositorio del modelo)
- Licencia: `LICENSE` (dentro del repositorio del modelo)
