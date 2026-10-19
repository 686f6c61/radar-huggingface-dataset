# immiq/Index-Translate-2B-Orinfer-E8P-Q4A8

## Resumen

Index-Translate-2B · Orinfer E8P Q4A8 es una versión cuantizada del modelo de traducción IndexTeam/Index-Translate-2B (2B parámetros, arquitectura de la familia Qwen3.5, pipeline image-text-to-text), publicada por immiq y empaquetada específicamente para ejecutarse en Nvidia Jetson AGX Orin 64 GB con CUDA SM87 mediante el runtime Orinfer. No es un checkpoint para Transformers, vLLM ni GGUF: son safetensors nativos de Orinfer, con cómputo INT8 y una cuantización E8P Q4 de dos etapas con coeficientes [4,1], rotación signed-block128, codificación beam8 y precisiones mixtas para tensores sensibles.

El interés de esta ficha está en que documenta un caso poco habitual: cuantización de precisión mixta (~4,323 bits por parámetro, 1.228.931.712 bytes de payload) orientada a despliegue edge sin Python, con decodificación especulativa (MTP), prefix cache, batching continuo y contexto configurado a 262.144 tokens (aunque las mediciones publicadas llegan solo a 8.192 tokens). El autor publica además métricas de degradación frente a BF16 con la misma historia de conversación (delta de NLL de +0,03385 nats/token en texto y 96,92 % de acuerdo top-1).

Es relevante ahora porque permite evaluar el coste real de llevar un traductor multimodal de 2B a un dispositivo embebido: ~108 tokens/s de decodificación en texto corto, ~113 tokens/s en traducción completa sin MTP, y 1.469,2 tokens/s de decodificación agregada en una cohorte fija de 128 peticiones. El autor reconoce explícitamente que la traducción de imágenes complejas todavía no supera la aceptación de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con estado GDN en FP32; pipeline image-text-to-text |
| Parámetros totales | 2B (según el nombre del modelo base IndexTeam/Index-Translate-2B); payload cuantizado de 1.228.931.712 bytes a ~4,323 bits por parámetro |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Configurado a 262.144 tokens; verificado experimentalmente hasta 8.192 tokens |
| Tipos de cuantización | E8P Q4A8: dos etapas E8P Q4, coeficientes [4,1], rotación signed-block128, codificación beam8, cómputo INT8, sin calibración de activaciones; proyecciones sensibles de salida/MTP en W8; tensores pequeños sensibles en coma flotante; embedding y cabeza de salida atados comparten un banco comprimido; KV cache INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); el software Orinfer y su paquete de ejecución son LGPL-3.0-or-later |
| Formato de pesos | safetensors nativos de Orinfer (no compatibles con Transformers, vLLM ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es IndexTeam/Index-Translate-2B, un traductor de 2B parámetros con entrada de texto e imagen y salida de texto, cuya arquitectura corresponde a la familia Qwen3.5 (etiqueta `qwen3_5` en el repositorio). El estado GDN se mantiene en FP32 durante la inferencia y la caché KV se almacena en INT8. Esta publicación no entrena nada: es una conversión de pesos del checkpoint base en la revisión `9bc08445315723eb9b77d1b93505915eb03c3f01`, por lo que no hay información nueva sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO. Esos datos habría que consultarlos en la model card original, incluida en el repositorio como `UPSTREAM_README.md`.

La innovación técnica está en la cuantización y el runtime. La conversión usa una cuantización E8P Q4 en dos etapas con coeficientes [4,1], rotación signed-block128 y codificación beam8, con cómputo INT8 y sin calibración de activaciones, aplicando excepciones de precisión mixta: las proyecciones sensibles de salida y MTP conservan W8 y los tensores pequeños sensibles permanecen en coma flotante. El banco comprimido se comparte entre el embedding atado y la cabeza de salida. El despliegue lo realiza Orinfer, un runtime en Rust que no requiere Python, con soporte de decodificación especulativa (MTP), prefix cache, batching continuo, streaming, entrada de imagen simple y múltiple, e inferencia offline por JSONL con reanudación. El paquete de ejecución es independiente del repositorio de pesos y debe coincidir exactamente con el hash `a5b765be97fa9112c5e39edbc06dff84c0f492780b789b5d98271b1ef218db3d`.

## Capacidades

- Traducción de texto e imagen a texto, con soporte de entrada de una o varias imágenes en el mismo prompt.
- Generación de texto conversacional multi-turno (tag `conversational`), con prefix cache para reutilizar historial.
- Modo de razonamiento (thinking) configurable: las comprobaciones de traducción lo desactivan con `enable_thinking: false`.
- Streaming de tokens en la respuesta.
- Decodificación especulativa mediante MTP (desactivable con `--mtp-drafts 0`).
- Batching continuo para atender varias peticiones concurrentes (verificado hasta 128 peticiones concurrentes).
- Inferencia offline por lotes en formato JSONL, con capacidad de reanudación.
- Validación y servicio mediante CLI: `orinfer validate-model` y `orinfer serve`.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni generación de código en la información disponible.

## Casos de uso

- Traducción en tiempo real en dispositivo embebido: sobre Jetson AGX Orin 64 GB el modelo traduce a ~113 tokens/s sin MTP, suficiente para subtitulado o interpretación por turnos sin depender de la nube ni de conectividad.
- Traducción de carteles, menús o etiquetas mediante cámara: el pipeline acepta entrada de imagen simple y múltiple, de modo que un dispositivo móvil o un robot puede enviar la foto y recibir la traducción en el mismo turno.
- Procesamiento por lotes de corpus: la inferencia offline por JSONL con reanudación permite traducir grandes volúmenes de documentos en una máquina edge, retomando el trabajo tras un corte sin reprocesar lo ya hecho.
- Servicio multi-cliente en el propio dispositivo: con batching continuo y prefix cache, una cohorte de 128 peticiones de 512 tokens midió 1.469,2 tokens/s de decodificación agregada, adecuado para un pequeño portal de traducción interno en hardware embebido.
- Asistente conversacional bilingüe con historial largo: la ventana configurada de 262.144 tokens y el prefix cache permiten mantener conversaciones multi-turno con contexto extenso, útil en atención al usuario en mostradores o quioscos.
- Despliegue en flotas de robótica y vehículos: al ejecutarse con un runtime en Rust sin Python y con pesos de ~1,23 GB, encaja en imágenes de sistema inmutables de Jetson AGX Orin con memoria compartida de 64 GB.
- Validación de calidad frente a BF16: el repositorio incluye métricas de acuerdo top-1 y delta de NLL que permiten usar esta versión como referencia de regresión al probar nuevas cuantizaciones o versiones del runtime.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU/COMET de traducción). Sí publica mediciones de rendimiento y comprobaciones de degradación frente a BF16.

Rendimiento con la CLI de release en Rust, diagnóstico de longitud fija, sin MTP, grafo decode_only:

| Tokens de entrada | Prefill (tokens/s) | Decodificación (tokens/s) |
|---|---:|---:|
| 512 | 7.630 | 108,41 |
| 2.048 | 7.908 | 105,09 |
| 8.192 | 6.537 | 94,37 |

Otras mediciones declaradas:

| Métrica | Valor |
|---|---|
| Traducción completa sin MTP | ~113 tokens/s (objetivo de 150 tokens/s sin MTP no alcanzado) |
| Cohorte fija de 128 peticiones con entrada de 512 tokens | 1.469,2 tokens/s de decodificación agregada (benchmark de cohorte, no garantía de latencia online) |

Calidad frente a BF16 con la misma historia (semilla fija 20261002):

| Prueba | Posiciones | Delta NLL (nats/token) | Acuerdo top-1 | Token elegido en top-3 de BF16 |
|---|---:|---:|---:|---:|
| Texto | 130 | +0,03385 | 96,92 % | 100 % |
| Entrada larga (comprobación rápida) | 30 | +0,13515 | no disponible | no disponible |
| Imagen simple | 17 | +0,24353 | no disponible | 94,12 % |

El autor advierte que estas comprobaciones no sustituyen a un benchmark completo de traducción ni a una evaluación de calidad a 256K. También se verificaron comprobaciones de estado privado, recuperación de MTP/prefix, concurrencia hasta 128 peticiones, procesamiento y reanudación JSONL, y validación completa del modelo.

## Requisitos de hardware

- Hardware objetivo: Nvidia Jetson AGX Orin 64 GB con CUDA SM87. Es la plataforma para la que se generó el paquete de ejecución.
- Huella de pesos: 1.228.931.712 bytes de payload cuantizado (incluyendo escalas y excepciones de precisión mixta); 1.262.497.024 bytes de datos de solo lectura desplegados, incluidas constantes derivadas. El repositorio ocupa 1,3 GB.
- Memoria adicional: caché KV en INT8 y estado GDN en FP32; el consumo a contextos largos (hasta 262.144 tokens configurados) no está cuantificado en la documentación disponible.
- GPU de consumo: no disponible. El autor no documenta compatibilidad con RTX 4090, RTX 3090 ni otras GPU de consumo; el paquete está construido para SM87.
- Aceleradores de datacenter (A100, H100): no disponible. No se publican instrucciones ni paquetes para estas arquitecturas.
- Opciones de despliegue: exclusivamente Orinfer (commit `40c36f3` o posterior compatible) con el paquete de ejecución exacto indicado. No es compatible con Transformers, vLLM, llama.cpp, Ollama ni TGI, y no existe versión GGUF. El despliegue en tiempo de ejecución no necesita Python.
- Comandos: `orinfer validate-model /ruta/al/modelo` y `orinfer serve /ruta/al/modelo --model index-translate-2b --mtp-drafts 0`; instalación del paquete con `orinfer package install`.
- Throughput y latencia: ver tabla de la sección anterior (108,41 tokens/s de decodificación con 512 tokens de entrada, 94,37 tokens/s con 8.192; 1.469,2 tokens/s agregados en cohorte de 128).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| immiq/Index-Translate-2B-Orinfer-E8P-Q4A8 | 2B (~4,323 bits/parámetro) | 262.144 configurados, 8.192 medidos | E8P Q4A8, cómputo INT8, W8/FP en tensores sensibles | Apache-2.0 (pesos); runtime LGPL-3.0-or-later | Orinfer, SM87, sin Python | Público; 0 descargas y 0 likes en el momento de la consulta |
| IndexTeam/Index-Translate-2B (base, BF16) | 2B | no disponible | BF16 | Apache-2.0 | no disponible en la información proporcionada | Público; referencia de calidad usada en las comparaciones (96,92 % de acuerdo top-1) |
| Otros traductores multimodales de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros comparables en la información proporcionada, por lo que no se establece comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- La traducción de imágenes complejas no ha superado la aceptación de calidad según el propio autor; solo hay comprobaciones con imagen simple (17 posiciones, delta de NLL +0,24353).
- Degradación medible frente a BF16: +0,03385 nats/token en texto, +0,13515 en entradas largas y +0,24353 en imagen simple. El acuerdo top-1 baja al 94,12 % (top-3) en imagen.
- El contexto está configurado a 262.144 tokens, pero solo se ha medido hasta 8.192; no existe evaluación de calidad a 256K.
- La cuantización se realizó sin calibración de activaciones, lo que puede afectar de forma desigual a dominios alejados de los datos de referencia.
- Las salidas pueden variar con MTP o planificación concurrente: el autor advierte que una redacción válida distinta es posible.
- No hay benchmark completo de traducción publicado ni métricas BLEU/COMET; las cifras de calidad son comprobaciones puntuales, no una evaluación global.
- Dependencia fuerte del runtime: requiere el commit `40c36f3` o posterior y un paquete de ejecución con hash exacto; no hay soporte para Transformers, vLLM ni GGUF, lo que limita la portabilidad y complica la integración en infraestructuras existentes.
- Solo se documenta la plataforma SM87 (Jetson AGX Orin); no hay garantías de funcionamiento en otras GPU, y el objetivo de 150 tokens/s sin MTP no se ha alcanzado (~113 tokens/s).
- Idiomas soportados no documentados, lo que impide verificar la cobertura real de pares de traducción.
- No se publica información sobre sesgos, tasas de alucinación o evaluaciones de seguridad; en traducción automática esto implica riesgo de mistraducción silenciosa en contenido sensible (legal, médico, técnico).
- Licencia: los pesos son Apache-2.0 y permiten uso comercial, pero el runtime Orinfer y su paquete de ejecución son LGPL-3.0-or-later; conviene revisar las obligaciones de distribución si se integra en un producto.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/immiq/Index-Translate-2B-Orinfer-E8P-Q4A8
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-2B (revisión `9bc08445315723eb9b77d1b93505915eb03c3f01`)
- Runtime Orinfer: https://github.com/iMMIQ/orinfer
- Documentación de rendimiento: https://github.com/iMMIQ/orinfer/blob/40c36f3/docs/performance.md
- Instrucciones de compilación del modelo Qwen3.5 en Orinfer: https://github.com/iMMIQ/orinfer/blob/40c36f3/tools/model/qwen35/README.md
- Licencia de los pesos: https://huggingface.co/immiq/Index-Translate-2B-Orinfer-E8P-Q4A8/blob/main/LICENSE
- Model card original incluida en el repositorio: https://huggingface.co/immiq/Index-Translate-2B-Orinfer-E8P-Q4A8/blob/main/UPSTREAM_README.md

Nota: la búsqueda web asociada a esta consulta no devolvió resultados relevantes sobre el modelo (solo páginas no relacionadas sobre calzado y sobre el número pi), por lo que no se han encontrado papers, blogs ni demos adicionales que enlazar.
