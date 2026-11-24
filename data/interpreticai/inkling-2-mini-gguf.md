# InterpreticAI/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo mezcla de expertos (MoE) con capas intermedias recurrentes ("looped"), desarrollado por Thinking Machines Lab. Esta ficha corresponde a la cuantización GGUF publicada por InterpreticAI, que reproduce sin modificaciones el checkpoint oficial (revisión `1fb4134`) en formato Q4_K_M para llama.cpp y LM Studio, incluyendo el proyector de visión. El modelo acepta texto e imagen como entrada y está diseñado como modelo de razonamiento: genera su cadena de pensamiento antes de la respuesta final.

Con 26.070.385.152 parámetros totales (26,4B según el autor) y 3,4B activos por token (5,4B efectivos al pasar tres veces por las capas recurrentes centrales), el modelo ofrece una ventana de contexto de hasta 1M tokens. Su relevancia práctica radica en que la cuantización Q4_K_M (17,5 GB) cabe en una única GPU de 24 GB, lo que acerca un modelo MoE multimodal de contexto muy largo a hardware de estación de trabajo.

La licencia es Apache 2.0, la misma del modelo original, lo que facilita su uso comercial. El repositorio acumula 3.683 descargas y un "me gusta" en el momento de la consulta, y el soporte de esta arquitectura es reciente en todos los runtimes, por lo que se requiere una build actualizada de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal con capas intermedias recurrentes ("looped") |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B por token; 5,4B efectivos con tres pasadas por las capas recurrentes |
| Longitud de contexto | Hasta 1M tokens (1.048.576) |
| Tipos de cuantizacion | GGUF Q4_K_M (esta ficha), GGUF IQ3_XXS, MLX 4-bit (otros repos del mismo autor) |
| Idiomas soportados | No disponible (la model card no detalla la lista; se hicieron comprobaciones puntuales en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo Q4_K_M de 17,5 GB, proyector de visión F16 de 0,64 GB, draft DSpark Q8_0 de 0,35 GB) |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer de mezcla de expertos con una particularidad estructural: un bloque de capas intermedias recurrentes por el que el modelo pasa tres veces, de ahí que el autor distinga entre parámetros activos por token (3,4B) y parámetros efectivos (5,4B). Es multimodal en entrada (texto e imagen) mediante un proyector de visión separado que en esta cuantización se distribuye como fichero `mmproj` en F16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación operativa más destacable de esta distribución es el soporte de decodificación especulativa mediante el modelo draft oficial DSpark, cuantizado en Q8_0 y compatible con todos los GGUF de Inkling 2 Mini del autor. En llama.cpp requiere una build del pull request #32218 (commit `0a9105d`), no incluida aún en la rama principal, y el formato del draft puede cambiar antes de su fusión. El modelo es de tipo "thinking": escribe el razonamiento antes de la respuesta, por lo que necesita un cliente o servidor que aplique su plantilla de chat.

## Capacidades

- Generación de texto y razonamiento explícito en modo "thinking", con cadena de pensamiento previa a la respuesta.
- Entrada de imágenes junto con texto (pipeline `image-text-to-text`), mediante el proyector de visión incluido.
- Procesamiento de contexto muy largo, hasta 1M tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Capacidades multilingües: la model card no publica la lista de idiomas; las comprobaciones de calidad se limitaron a inglés, chino y código.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Decodificación especulativa opcional con el draft DSpark para acelerar la generación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: con hasta 1M tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación previa.
- Asistente de razonamiento técnico: el modo "thinking" permite obtener trazas de razonamiento antes de la respuesta, útil para depuración de lógica, revisión de diseño o explicación de errores complejos.
- Procesamiento de documentación con imágenes: gracias al proyector de visión, puede extraer información de capturas, diagramas o documentos escaneados combinados con texto.
- Despliegue en estación de trabajo con una sola GPU: la cuantización Q4_K_M (17,5 GB) cabe en 24 GB de VRAM, lo que permite montar un servidor local de inferencia con llama.cpp o LM Studio sin infraestructura de centro de datos.
- Generación de código asistida: la model card reporta comprobaciones puntuales de calidad en código y una aceleración de 1,06x con decodificación especulativa en este dominio; encaja en asistentes de programación locales.
- Servicio de chat multi-turno en producción: la etiqueta `conversational` y la compatibilidad con endpoints permiten integrarlo en un backend de atención al usuario con contexto largo.
- Aceleración de inferencia interactiva: el draft DSpark permite ganancias de hasta 1,23x en texto estructurado (listas) con un 66% de tokens aceptados, útil en aplicaciones donde la latencia importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta perplejidad en WikiText-2 (raw), contexto de 4.096 tokens, 76 fragmentos, puntuando la segunda mitad de cada fragmento:

| Build | Perplejidad | Diferencia vs. original |
|---|---|---|
| Checkpoint original (NVFP4 / MXFP8) | 5,760 | – |
| GGUF Q4_K_M | 5,802 ± 0,034 | +0,7% |
| GGUF IQ3_XXS | 5,973 ± 0,035 | +3,7% |

Rendimiento medido por el autor: unos 65 tokens/s en generación de un solo flujo en una RTX PRO 6000. Con decodificación especulativa sobre IQ3_XXS en una RTX A4000 y muestreo greedy: 1,23x en texto estructurado (listas) con 66% de tokens draft aceptados y 1,06x en código.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 17,5 GB de pesos más 0,64 GB del proyector de visión; el autor indica que cabe en una GPU de 24 GB. IQ3_XXS reduce el espacio adicionalmente.
- GPU recomendadas: RTX PRO 6000 (medición del autor, ~65 tokens/s), RTX A4000 (medición con decodificación especulativa). Cualquier GPU con 24 GB o más de VRAM es apta para Q4_K_M.
- GPU de consumo: sí, en tarjetas de 24 GB (por ejemplo, la familia RTX xx90 de 24 GB); en tarjetas de 16 GB no cabe Q4_K_M completo con el proyector.
- Opciones de despliegue: llama.cpp (commit `29b52d3` o posterior), LM Studio, `llama-server` con `--jinja` y `--mmproj` para visión. Para decodificación especulativa se requiere la build del PR #32218 (commit `0a9105d`). Otros runtimes no disponibles en la información.
- Latencia y throughput: ~65 tokens/s de un solo flujo en RTX PRO 6000; ganancia de 1,06x–1,23x con DSpark según el tipo de texto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (MoE multimodal con contexto de 1M tokens y ~26B parámetros).

## Limitaciones y advertencias

- Modelo de razonamiento: requiere un cliente o servidor que aplique su plantilla de chat; sin ella, la salida incluirá el razonamiento sin separar de la respuesta.
- Soporte de arquitectura reciente en todos los runtimes: es imprescindible usar builds actualizadas de llama.cpp (commit `29b52d3` o posterior); versiones antiguas no cargarán el modelo.
- La decodificación especulativa con DSpark no está en la rama principal de llama.cpp y su formato puede cambiar antes de fusionarse el PR #32218.
- Comprobaciones de calidad limitadas: además de la perplejidad, el autor solo hizo verificaciones puntuales en inglés, chino, código y una imagen; no hay evaluación sistemática de sesgos ni de alucinación.
- Lista de idiomas no publicada: no se puede garantizar un rendimiento uniforme fuera de los idiomas comprobados.
- La cuantización Q4_K_M introduce un incremento de perplejidad del 0,7% frente al checkpoint original; IQ3_XXS sube al 3,7%.
- Licencia Apache 2.0 para uso comercial, sujeta además a la política de uso aceptable de Thinking Machines Lab.
- El contexto de 1M tokens es una capacidad del modelo, pero en la práctica la VRAM limita la ventana utilizable; el ejemplo de la model card arranca con `-c 32768`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización IQ3_XXS: https://huggingface.co/InterpreticAI/Inkling-2-Mini-IQ3_XXS-GGUF
- Cuantización MLX 4-bit: https://huggingface.co/InterpreticAI/Inkling-2-Mini-MLX-4bit
- Pull request de llama.cpp con soporte de DSpark: https://github.com/ggml-org/llama.cpp/pull/32218
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Sitio del cuantizador: https://interpretic.ai
