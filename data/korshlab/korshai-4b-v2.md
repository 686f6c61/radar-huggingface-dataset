# KorshLAB/KorshAI-4B-v2

## Resumen

KorshAI-4B-v2 es un modelo de lenguaje compacto de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por KorshLab en colaboración con la Korsh Foundation, orientado específicamente a la generación de código en múltiples lenguajes. Se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M con matrices de importancia (imatrix) personalizadas, lo que lo hace apto para inferencia en GPUs de consumo y entornos con recursos limitados. Su pipeline declarado es text-generation y los idiomas soportados son inglés y español.

El modelo se posiciona como una herramienta para programación de sistemas (C11, C++20), desarrollo web (PHP 8.2+, HTML5, Bootstrap 5), Python 3 y generación de JSON estructurado conforme a esquemas. Según la model card, sus salidas han sido validadas mediante compilación y ejecución automatizada en un suite de evaluación propio de KorshLab con flags estrictos de compilador, lo que constituye su principal argumento de calidad. La licencia es Apache 2.0 y el repositorio ocupa 2,8 GB.

La relevancia actual del modelo reside en su enfoque en verificación formal del código generado y en su tamaño reducido, que permite despliegue local con llama.cpp, llama-server (API compatible con OpenAI) y Ollama. No obstante, la información pública disponible es escasa: no se detallan la arquitectura interna, el volumen de tokens de entrenamiento ni resultados de benchmarks estándar como MMLU o HumanEval.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (según la model card, "native 4B parameter dense architecture"; no se especifican detalles internos) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 8192 tokens en los ejemplos de llama-server; 4096 en los ejemplos de llama-cli y llama-cpp-python (no se declara un máximo oficial) |
| Tipos de cuantización | Q4_K_M con imatrix (única cuantización publicada) |
| Idiomas soportados | Inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se publican safetensors en el repo, pese a que el dato de parámetros proviene de safetensors) |

## Arquitectura y entrenamiento

La model card describe una arquitectura densa de 4B parámetros "propietaria", sin especificar si se trata de un transformer decoder-only estándar, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se indica el modelo base (`base_model: []` en los metadatos), por lo que no es posible determinar si deriva de un modelo preexistente o fue entrenado desde cero.

La innovación técnica destacada por el autor es la cuantización Q4_K_M con matrices de importancia (imatrix) calculadas sobre corpus de código multilingüe, con el objetivo de preservar la perplejidad de fp16 con una huella de memoria reducida (2,74 GB). Asimismo, se menciona un "protocolo de verificación estricto" mediante un suite de sandbox multinivel que compila y ejecuta las salidas con flags como `-Wall -Wextra -Werror -pedantic`. No se aportan datos sobre tokenizador, función de activación, posición de los embeddings ni estrategias de atención.

## Capacidades

- Generación de código en C11, C++20, Python 3, PHP 8.2+, HTML5 y Bootstrap 5.
- Generación de JSON estructurado conforme a JSON Schema (validado con `jsonschema` RFC 7159 según el autor).
- Razonamiento algorítmico y de programación de sistemas (asignadores de memoria, manipulación de bits, operaciones SIMD).
- Conversación multi-turno mediante plantilla de chat tipo ChatML (`<|im_start|>` / `<|im_end|>`).
- Soporte de API compatible con OpenAI a través de `llama-server` (endpoint `/v1/chat/completions`).
- Capacidades multilingües limitadas a inglés y español.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Generación de código C11 para sistemas embebidos: el modelo está entrenado y verificado con GCC 12+ y flags estrictos, por lo que resulta adecuado para producir código que compile sin advertencias en entornos con `-Werror`.
- Desarrollo backend en PHP 8.2+: puede generar clases con `declare(strict_types=1)`, aserciones y patrones OOP, útil para equipos que mantienen aplicaciones PHP modernas.
- Prototipado de interfaces web: genera HTML5 semántico y componentes Bootstrap 5, con validación declarada de conformidad W3C y WCAG 2.1 AA.
- Generación de JSON estructurado para pipelines de datos: su validación contra JSON Schema lo hace apto para producir respuestas parseables en integraciones de API.
- Asistente de programación local en estaciones de trabajo: con 2,74 GB en Q4_K_M y ~3,5 GB de VRAM recomendados, puede ejecutarse en GPUs de consumo mediante llama.cpp u Ollama sin conexión a servicios en la nube.
- Servicio de completado de código autoalojado: `llama-server` expone una API compatible con OpenAI, lo que permite integrarlo en IDE o herramientas internas sin modificar clientes existentes.
- Enseñanza de C++20: puede explicar conceptos como RAII con ejemplos prácticos, según el ejemplo de la propia model card.

## Benchmarks y rendimiento

La model card presenta resultados de un suite de verificación propio (KorshLab Evaluation Suite) basado en compilación y ejecución, no en benchmarks académicos estándar:

| Dominio / Stack | Ámbito de prueba | Estándar de verificación | Tasa de éxito |
|---|---|---|---|
| C11 Systems | Producto escalar FP32 / SIMD, manipulación de bits | GCC 12+ (`-Wall -Wextra -Werror -pedantic -std=c11`) | 100% (PASSED) |
| C++20 Modern | Asignador de arena, handles RAII | G++ 12+ (`-Wall -Wextra -Werror -std=c++20`) | 100% (PASSED) |
| PHP 8.2+ Backend | Strict types, OOP, aserciones | PHP 8.2 CLI Engine | 100% (PASSED) |
| HTML5 & Web | UI semántica, modales accesibles, Bootstrap 5 | W3C / WCAG 2.1 AA | 100% (PASSED) |
| Structured Output | Cumplimiento estricto de JSON Schema | Python `jsonschema` RFC 7159 | 100% (PASSED) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las tasas del 100% corresponden al suite propio del autor y no son comparables con evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB recomendados por el autor para la cuantización Q4_K_M (2,74 GB de pesos más overhead de contexto y caché KV).
- GPU recomendadas: no se especifican modelos concretos; el tamaño permite ejecución en GPUs de consumo con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) y en workstations con A100 o H100 sin aprovechar su capacidad completa.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M publicada.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), `llama-cpp-python` y Ollama. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: el autor declara entre 14 y 25 tokens/s en "hardware estándar", sin especificar la GPU ni la configuración empleada. El contexto máximo usado en los ejemplos es de 4096 u 8192 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks independientes que permitan una comparación rigurosa con alternativas. A continuación se ofrece una comparación estructural con modelos de tamaño similar ampliamente conocidos, usando solo datos públicos verificables de cada uno:

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| KorshAI-4B-v2 | 4,2B | hasta 8192 (según ejemplos) | Apache 2.0 | GGUF Q4_K_M | Código políglota |
| Qwen2.5-Coder-3B | 3,1B | 32.768 | Apache 2.0 | safetensors, GGUF | Código |
| Llama 3.2 3B | 3,2B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Propósito general |
| Phi-3.5-mini | 3,8B | 131.072 | MIT | safetensors, GGUF | Propósito general |

La comparación de rendimiento con estos modelos no está disponible en la información proporcionada. KorshAI-4B-v2 destaca por su licencia permisiva y su cuantización optimizada, pero carece de la documentación de entrenamiento y los benchmarks públicos de sus competidores.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni se describe la composición del dataset de entrenamiento, lo que impide evaluar sesgos de género, idioma o dominio.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de fidelidad factual ni de código incorrecto que compile pero sea semánticamente erróneo.
- El contexto máximo oficial no está declarado; los ejemplos usan 4096 y 8192 tokens, y superar ese rango puede degradar la calidad.
- Soporte limitado a inglés y español; no se garantiza calidad en otros idiomas.
- Las tasas de éxito del 100% provienen del suite de verificación del propio autor, sin replicación independiente; deben interpretarse con cautela.
- El modelo se describe como "propietario" en la model card pese a la licencia Apache 2.0, lo que genera ambigüedad sobre la procedencia de los pesos y posibles restricciones no declaradas.
- No hay soporte documentado de tool calling ni de agentes, lo que limita su integración en pipelines que requieran function calling.
- Solo se publica una cuantización (Q4_K_M); no hay versiones fp16 ni otras tallas para evaluar la pérdida de calidad por cuantización.
- El repositorio no incluye safetensors, a pesar de que el dato de parámetros proviene de un fichero safetensors; la reproducibilidad del entrenamiento no es posible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin comunidad ni validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/KorshLAB/KorshAI-4B-v2
- Sitio web oficial: https://korsh.org
- Laboratorio: https://korshlab.space
- Discord: https://discord.gg/jdnWyDx64e
