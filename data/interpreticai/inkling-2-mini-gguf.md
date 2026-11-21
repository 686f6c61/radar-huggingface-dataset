# InterpreticAI/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo *looped mixture-of-experts* (MoE con capas centrales reutilizadas en bucle) desarrollado por Thinking Machines Lab. Combina entrada de texto e imagen y está pensado como modelo de razonamiento con modo *thinking*: genera su cadena de razonamiento antes de emitir la respuesta final. Cuenta con 26.400 millones de parametros totales, de los cuales 3.400 millones estan activos por token (5.400 millones efectivos al pasar tres veces por las capas centrales en bucle), y admite hasta 1.000.000 de tokens de contexto.

Esta ficha describe la cuantizacion GGUF publicada por InterpreticAI (INTERPRETIC AI), que es una conversion sin modificaciones del checkpoint oficial (revision `1fb4134`) en formato Q4_K_M para llama.cpp y LM Studio, acompanada del proyector de vision en F16. El objetivo del repositorio es permitir ejecutar el modelo en hardware de consumo: el archivo principal ocupa 17,5 GB y, segun el autor, cabe en una GPU de 24 GB.

Es relevante ahora porque traslada a un unico equipo de gama alta (por ejemplo, una RTX 4090) un modelo multimodal con contexto de un millon de tokens y arquitectura MoE con bucle, algo que hasta hace poco requeria despliegues multi-GPU. La contrapartida es que el soporte de esta arquitectura es muy reciente en todos los runtimes y exige builds actualizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) multimodal con capas centrales en bucle (*looped*) |
| Parametros totales | 26.400 millones (26.070.385.152 segun safetensors) |
| Parametros activos | 3.400 millones por token; 5.400 millones efectivos con tres pasadas por las capas en bucle |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (esta repo); GGUF IQ3_XXS y MLX 4-bit en repos hermanos del mismo autor |
| Idiomas soportados | No disponible (verificaciones puntuales en ingles y chino) |
| Licencia | Apache 2.0 (con politica de uso aceptable del autor original) |
| Formato de pesos | GGUF (`Inkling-2-Mini-Q4_K_M.gguf`, 17,5 GB; `mmproj-Inkling-2-Mini-F16.gguf`, 0,64 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con enrutamiento disperso y un diseno de bucle: las capas centrales se recorren tres veces, de modo que el coste computacional por token corresponde a 3.400 millones de parametros activos, pero la capacidad efectiva se aproxima a 5.400 millones. Incluye una torre de vision acoplada mediante un proyector multimodal (exportado aparte como `mmproj` en F16), lo que habilita la tarea `image-text-to-text`. El contexto maximo declarado es de 1.000.000 de tokens.

No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni de si se aplicaron fases de RLHF, DPO o similar. El modelo es de tipo *thinking*: emite razonamiento explicito antes de la respuesta, por lo que requiere un cliente o servidor que aplique correctamente su plantilla de chat. La cuantizacion GGUF es una conversion directa del checkpoint oficial sin alteraciones, con sumas de verificacion SHA-256 publicadas en `SHA256SUMS`.

## Capacidades

- Generacion de texto y razonamiento con modo *thinking* (cadena de razonamiento previa a la respuesta).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con proyector de vision incluido.
- Comprension de codigo: se realizaron comprobaciones puntuales en tareas de codigo.
- Capacidades multilingues: verificaciones puntuales en ingles y chino; cobertura completa no disponible.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), apto para servir via API.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y multi-step reasoning: no disponible; el modo *thinking* es el unico indicio de razonamiento multi-paso documentado.

## Casos de uso

- Razonamiento con contexto muy largo: gracias a una ventana de hasta 1.000.000 de tokens, el modelo puede ingerir documentacion completa, bases de codigo o historiales extensos en una sola pasada, evitando pipelines de troceado y recuperacion.
- Analisis de documentos con imagenes: al aceptar entrada image-text-to-text, permite extraer y razonar sobre diagramas, capturas de pantalla, tablas escaneadas o figuras tecnicas junto al texto que las acompanan.
- Asistente de codigo en local: con Q4_K_M en una GPU de 24 GB, se puede desplegar un asistente que revisa repositorios y explica cambios usando llama.cpp o LM Studio, sin depender de servicios en la nube.
- Atencion al cliente automatizada: la combinacion de conversacion multi-turno, contexto largo y modo *thinking* permite mantener el historial completo de la conversacion y razonar sobre politicas o manuales extensos antes de responder.
- Servicio de inferencia con API compatible: el tag `endpoints_compatible` y el servidor `llama-server` permiten exponer el modelo como backend HTTP para integrarlo en aplicaciones existentes.
- Analisis de imagenes tecnicas en entornos con recursos limitados: el proyector F16 de 0,64 GB junto al modelo Q4_K_M cabe en una unica GPU de consumo, lo que facilita prototipos de vision-lenguaje sin clúster.
- Evaluacion de razonamiento supervisado: al exponer explicitamente su cadena de razonamiento, resulta util para auditoria de decisiones y para construir datasets de trazas de pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las verificaciones realizadas son puntuales (ingles, chino, codigo y una imagen) y no constituyen un benchmark completo. El unico dato de rendimiento medido es el throughput: aproximadamente 65 tokens/s en generacion de un solo stream sobre una RTX PRO 6000.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 17,5 GB y el proyector de vision 0,64 GB; en la practica se necesita algo mas de 18 GB para pesos, mas memoria para KV cache y buffers de contexto.
- GPU recomendadas: RTX PRO 6000 (medicion oficial de 65 tokens/s), A100 40/80 GB, H100, y GPUs de consumo con 24 GB como RTX 4090 o RTX 3090.
- Cabe en GPU de consumo: si, en modelos de 24 GB con Q4_K_M; la variante IQ3_XXS del mismo autor reduce aun mas el requisito.
- Opciones de despliegue: llama.cpp (requiere commit `29b52d3` o posterior), `llama-server`, LM Studio; tambien existe una version MLX 4-bit para Apple Silicon.
- Latencia y throughput: aproximadamente 65 tokens/s single-stream en RTX PRO 6000 con Q4_K_M; no hay datos de throughput agregado ni de latencia con contexto de 1M tokens.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (MoE multimodal con bucle y contexto de 1M tokens) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Soporte de arquitectura muy reciente: todos los runtimes requieren builds actualizados (llama.cpp `29b52d3` o posterior); versiones antiguas no cargaran el modelo.
- Modelo *thinking*: necesita un cliente o servidor que aplique la plantilla de chat del modelo; de lo contrario, el razonamiento aparecera mezclado con la respuesta.
- Verificacion de calidad limitada: las comprobaciones del autor son puntuales y no cubren un benchmark completo, por lo que el rendimiento real en tareas diversas no esta validado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de razonamiento, es esperable, pero no hay datos empiricos.
- Idiomas: solo se verificaron ingles y chino de forma puntual; el castellano no esta confirmado.
- Licencia Apache 2.0 con politica de uso aceptable adicional del autor original; conviene revisar esa politica antes de un uso comercial.
- Contexto de 1M tokens: aunque declarado, no hay datos de rendimiento ni de degradacion de calidad a longitudes extremas, ni de cuanto KV cache adicional requiere.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios aun inexistente, sin feedback comunitario sobre la cuantizacion.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/InterpreticAI/Inkling-2-Mini-GGUF
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizacion GGUF IQ3_XXS del mismo autor: https://huggingface.co/InterpreticAI/Inkling-2-Mini-IQ3_XXS-GGUF
- Version MLX 4-bit del mismo autor: https://huggingface.co/InterpreticAI/Inkling-2-Mini-MLX-4bit
- Politica de uso aceptable del modelo original: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Sitio del autor de la cuantizacion: https://interpretic.ai
