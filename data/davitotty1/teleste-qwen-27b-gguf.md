# Davitotty1/Teleste-Qwen-27B-GGUF

## Resumen

Teleste Qwen 27B es un ajuste fino de Qwen3.8-27B (del equipo Qwen) desarrollado por Davitotty1 dentro del "Project Jarvon", centrado en un problema muy concreto: el gasto excesivo de tokens en razonamiento. El modelo añade un nivel de esfuerzo de razonamiento `auto` que decide en cada pregunta si pensar poco o mucho, etiquetando cada bloque de pensamiento con `Effort: low` o `Effort: medium`.

Técnicamente, se trata de un LoRA (rango 16, alfa 32) aplicado a todas las proyecciones de atención, DeltaNet y MLP del modelo base, entrenado con QLoRA sobre 1.350 problemas de GSM8K y MATH. El repositorio publica el LoRA fusionado y cuantizado en GGUF (UD-IQ3_XXS, 10,93 GB, pensado para GPUs de 12 GB), además del adaptador sin fusionar y la plantilla de chat.

Su relevancia es doble: por un lado, demuestra que un LoRA ligero puede reducir un 33 % el consumo de tokens manteniendo la precisión matemática; por otro, ofrece una cuantización extrema (3 bits con imatrix) que permite ejecutar un modelo de 27B en hardware de consumo. Es un modelo experimental, con evaluación limitada a matemáticas y una muestra pequeña, pero interesante como prueba de concepto de razonamiento adaptativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido 3:1 DeltaNet/atención (heredado de Qwen3.8), con LoRA para razonamiento adaptativo |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en el comando de ejemplo de llama.cpp; máximo del modelo base no disponible |
| Tipos de cuantizacion | UD-IQ3_XXS (mix por tensor de unsloth con imatrix); el LoRA se fusionó primero en Q8_0; la evaluación se hizo sobre base AWQ INT4 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal), safetensors para el adaptador LoRA |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, emplea una arquitectura híbrida con relación 3:1 entre capas DeltaNet y capas de atención, lo que permite una cuantización agresiva con baja divergencia KL en contexto largo. Sobre este base se entrena un LoRA de rango 16 y alfa 32, aplicado a todas las proyecciones de atención, DeltaNet y MLP. La innovación central es el mecanismo de esfuerzo adaptativo: cada bloque de razonamiento comienza con una etiqueta `Effort: low` o `Effort: medium`, y el modelo razona a ese nivel. El usuario puede fijar manualmente `low`, `medium` o `xhigh`.

El entrenamiento fue un QLoRA (base NF4) ejecutado en 2x T4 de Kaggle en 3,4 horas. Los datos son 1.350 problemas de entrenamiento de GSM8K y MATH: a cada uno se le hicieron dos muestras a nivel `low` y, si fallaban, una a `medium`. La etiqueta de entrenamiento es el esfuerzo más barato que resolvió el problema (1.206 ejemplos `low`, 75 `medium`). El run final usó 565 ejemplos, 600K tokens, corte a 2.048 tokens, 36 pasos, con peso extra en la pérdida para la etiqueta de esfuerzo. No se entrenaron etiquetas `xhigh` porque el límite de 12 horas de Kaggle cortó esa fase, por lo que el enrutador nunca aprende a elegir `xhigh`.

## Capacidades

- Generación de texto y conversación (pipeline text-generation, tag conversational).
- Razonamiento matemático con esfuerzo adaptativo: resuelve problemas de GSM8K, MATH-500 y AIME etiquetando el esfuerzo necesario.
- Selección automática del nivel de razonamiento (`auto` por defecto), con opción de fijar `low`, `medium` o `xhigh` manualmente.
- Compatibilidad total con llama.cpp: plantilla de chat Teleste embebida en el GGUF, soporte de `chat_template_kwargs` para fijar el esfuerzo.
- Despliegue en vLLM con el adaptador LoRA sin fusionar (`--enable-lora --max-lora-rank 16`).
- Solo texto: no incluye capacidades de visión, audio ni multimodalidad.
- Tool calling, function calling y capacidades de agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card declara únicamente inglés.

## Casos de uso

- Resolución de problemas matemáticos con presupuesto de tokens acotado: el nivel `auto` asigna razonamiento corto a problemas sencillos (aritmética, álgebra básica) y medio a los difíciles, reduciendo un 33 % el coste de inferencia frente al ajuste por defecto del modelo base.
- Ejecución local en GPU de 12 GB: la cuantización UD-IQ3_XXS de 10,93 GB permite cargar el modelo completo en una RTX 3060/4070 o similar, útil para investigación personal en razonamiento.
- Generación de soluciones paso a paso para docencia de matemáticas: los bloques de razonamiento etiquetados permiten controlar cuánto "piensa" el modelo según el nivel del alumno.
- Experimentación con enrutamiento de esfuerzo: el LoRA y la plantilla están publicados, por lo que se puede estudiar o extender el mecanismo de etiquetado de esfuerzo sobre otros modelos.
- Servicios de inferencia por lotes con coste optimizado: en vLLM con base AWQ INT4, la reducción media a 2.231 tokens por problema permite mayor throughput que el modelo base.
- Prototipado de APIs de razonamiento: llama-server expone el parámetro `reasoning_effort` vía `chat_template_kwargs`, facilitando pruebas de niveles de esfuerzo desde aplicaciones.

## Benchmarks y rendimiento

Evaluación propia del autor: 130 problemas reservados (102 de MATH-500 de todos los niveles, 28 de AIME 2024 y 2025), tope de 16K tokens, base vLLM AWQ INT4.

| Configuración | Accuracy | Tokens medios |
|---|---|---|
| Qwen3.8-27B stock, `xhigh` (por defecto) | 90,0 % | 3.343 |
| Stock, prompt `auto` sin entrenamiento | 91,5 % | 3.272 |
| Stock, `medium` | 93,8 % | 2.744 |
| Stock, `low` | 93,8 % | 2.356 |
| **Teleste, `auto`** | **93,1 %** | **2.231** |
| Teleste, `auto`, conclusión forzada al tope | 93,8 % | 2.263 |

Datos adicionales: frente al ajuste por defecto del modelo base, Teleste usa un 33 % menos de tokens con 3,1 puntos más de accuracy (diferencia no significativa, McNemar p = 0,34 con n = 130). Frente a stock `low`, iguala la precisión con un 5 % menos de tokens. El enrutador elige `medium` en el 25 % de los problemas. No hay resultados de MMLU, HumanEval ni otros benchmarks generales.

Smoke test del GGUF en 2x T4 con llama-server: 11,9 tok/s.

Cuantización (divergencia KL media respecto a Q6_K en contexto largo):

| Receta | Tamaño | KLD medio | Mismo token top |
|---|---|---|---|
| unsloth UD-IQ3_XXS (usada) | 10,93 GB | 0,0164 | 96,3 % |
| FFN down a iq3_s | 11,49 GB | 0,0209 | 95,8 % |
| Capas de atención a q5_K | 11,59 GB | 0,0231 | 95,3 % |
| Proyecciones DeltaNet a iq3_s | 11,03 GB | 0,0233 | 95,6 % |

## Requisitos de hardware

- VRAM para el GGUF UD-IQ3_XXS: 10,93 GB de pesos; con KV cache a 16K de contexto, se recomienda una GPU de 12 GB (el autor lo dimensiona explícitamente para ese perfil).
- Consumer GPUs compatibles: RTX 3060 12 GB, RTX 4070, RTX 4070 Ti Super y similares de 12-16 GB. El smoke test oficial se hizo en 2x T4 (32 GB totales) a 11,9 tok/s.
- Para el modo vLLM con adaptador: base Qwen3.8-27B en AWQ INT4 (aproximadamente 15-18 GB) más el LoRA; una A100 40 GB, A6000 o H100 es lo adecuado.
- Despliegue: llama.cpp / llama-server (ruta principal, plantilla embebida, `-ngl 99 -c 16384 -fa on --jinja`), vLLM con `--enable-lora`, y Ollama debería funcionar al ser GGUF estándar (sin confirmación del autor).
- Muestreo recomendado (heredado de Qwen3.8): temperature 1,0, top_p 0,95, top_k 20.
- Throughput en hardware de servidor: no disponible; solo el dato de 11,9 tok/s en 2x T4.

## Comparativa con modelos similares

| | Teleste Qwen 27B | Qwen3.8-27B (base) | Modelos 27B alternativos (p. ej. Gemma 3 27B) |
|---|---|---|---|
| Parametros | 27,3B + LoRA r16 | 27,3B | 27B |
| Contexto | 16K en ejemplos (máx. no disponible) | no disponible | 128K (Gemma 3) |
| Razonamiento adaptativo | Sí (`auto`, `low`, `medium`, `xhigh`) | Niveles fijos (`low`, `medium`, `xhigh`) | No |
| Evaluación publicada | 93,1 % accuracy, 2.231 tokens (math, n=130) | 90,0 %, 3.343 tokens (misma eval) | Benchmarks generales, no comparables directamente |
| Cuantización ligera | UD-IQ3_XXS, 10,93 GB | GGUF unsloth disponibles | GGUF comunitarios |
| Licencia | Apache 2.0 | Apache 2.0 | Gemma (restricciones propias de Google) |
| Disponibilidad | HF, 231 descargas, proyecto experimental | HF, mantenimiento oficial de Qwen | HF, soporte amplio |

La comparación con Gemma 3 27B es orientativa: no hay benchmarks comunes publicados entre ambos. La ventaja diferencial de Teleste es el control de coste de razonamiento; su debilidad es que solo está evaluado en matemáticas y con muestra pequeña.

## Limitaciones y advertencias

- Evaluación muy pequeña: 130 problemas, de modo que un problema individual mueve la accuracy 0,77 puntos; las diferencias frente a stock `low`/`medium` no son estadísticamente significativas.
- Dominio limitado a matemáticas: tanto el entrenamiento como la evaluación usan solo GSM8K, MATH-500 y AIME. No hay datos sobre código, razonamiento general, escritura ni otros dominios.
- Discrepancia de cuantización: la evaluación se ejecutó con el LoRA sobre base AWQ INT4, no sobre el GGUF distribuido; este solo pasó un smoke test de tres problemas.
- El enrutador nunca aprende a elegir `xhigh` (la fase de datos con etiquetas `xhigh` se cortó por el límite de tiempo de Kaggle), por lo que `auto` nunca escala al máximo esfuerzo.
- Riesgo de alucinación: no evaluado; como todo modelo de lenguaje, puede producir respuestas incorrectas con apariencia de razonamiento riguroso, especialmente fuera de matemáticas.
- Sesgos: no disponibles; no se ha publicado análisis de sesgos.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está evaluado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo base hereda las condiciones de Qwen y hay que respetarlas; además, al ser un proyecto experimental sin mantenimiento aparente (0 likes, 231 descargas), no hay garantía de soporte ni de correcciones.
- El propio autor reconoce que escalar de `low` a `medium` no mejoró la precisión en los problemas difíciles con este modelo y presupuesto, lo que sugiere que el mecanismo adaptativo aporta ahorro de tokens más que ganancia de calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Davitotty1/Teleste-Qwen-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización e imatrix de unsloth para el modelo base: no disponible (referenciado en la model card pero sin URL concreta)
- Paper, blog o demo: no disponibles
