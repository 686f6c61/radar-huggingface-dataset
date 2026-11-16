# duckpage/qwen38-27b-mls4

## Resumen

Qwen3.8-27B MLS4 es una conversión del checkpoint multimodal Qwen/Qwen3.8-27B (texto e imagen) al formato MLS4 propietario del motor de inferencia Malleus, desarrollado por el usuario duckpage. El objetivo no es crear un modelo nuevo, sino reempaquetar los pesos en 4 bits para que puedan ejecutarse de forma eficiente en APUs AMD con arquitectura RDNA 3.5 (gfx1150 / gfx1151), un segmento de hardware habitualmente desatendido por los motores de inferencia convencionales. El resultado es un único fichero de 17,6 GB que sirve tanto para la fase de prefill como para la de decodificación.

La innovación principal del formato MLS4 es que evita mantener una segunda copia de los pesos en mayor precisión: el prefill lee directamente los mismos pesos de 4 bits (esquema W4A8), lo que reduce el uso de memoria del dispositivo. Para compensar la pérdida de calidad intrínseca de una cuantización tan agresiva, la conversión aplica una rotación de Hadamard aleatorizada y calibración GPTQ con grupos de 128, de modo que los valores atípicos quedan absorbidos por la rotación en lugar de necesitar almacenarse en fp16.

El modelo base conserva las capacidades multimodales (image-text-to-text) y la licencia Apache-2.0 del Qwen3.8-27B original. La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para un motor concreto, con cero descargas y publicado en noviembre de 2026, por lo que su interés práctico depende de que el usuario opere hardware AMD RDNA 3.5 y esté dispuesto a usar Malleus en lugar de llama.cpp u otras alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen), base Qwen3.8-27B; detalles internos del checkpoint original no disponibles |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32768 tokens en el ejemplo de despliegue (`--ctx 32768`); máximo del modelo base no disponible |
| Tipos de cuantizacion | 4 bits, group size 128, W4A8, rotación Hadamard aleatorizada + calibración GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.malleus` (contenedor GGUF v3 propio del motor Malleus) |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento adicional: es una conversión de formato y precisión del checkpoint Qwen/Qwen3.8-27B. La arquitectura subyacente es la del modelo base (transformer multimodal para texto e imagen), cuyos detalles de capas, atención y composición del dataset de entrenamiento no se documentan en la información disponible.

La contribución técnica está en el pipeline de cuantización. Los pesos se almacenan en 4 bits con grupos de 128 elementos, se les aplica una rotación de Hadamard aleatorizada y se calibran con GPTQ. La rotación distribuye la energía de los valores atípicos entre todas las dimensiones, lo que permite que la rejilla de 4 bits sea utilizable sin conservar tensores residuales en fp16. El contenedor es GGUF v3 con extensión `.malleus`, y el motor incluye una comprobación previa (`malleus golden`) que compara el fichero de 4 bits contra el checkpoint bf16 original mediante top-1 del último token, divergencia KL y comparación greedy, con tensores de referencia publicados en el dataset duckpage/malleus-golden para poder repetir la validación sin descargar los 55 GB del bf16.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Servicio mediante API compatible con OpenAI en el puerto 8090: `/v1/chat/completions`, `/v1/models` y `/health`.
- Decodificación especulativa MTP (multi-token prediction) integrada en el motor, que según el autor permite superar el límite de ancho de banda en la fase de decodificación.
- Gestión de contexto configurable en tiempo de arranque mediante `MALLEUS_CTX`, que dimensiona el estado KV.
- Comprobación previa de memoria: el motor calcula el coste del modelo y de la sesión en el dispositivo y rechaza el arranque si no caben.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada (depende del modelo base, no documentado aquí).

## Casos de uso

- Despliegue local en APUs AMD RDNA 3.5: el caso central. Un equipo con Radeon 890M y 32 GB de RAM puede servir un modelo denso de 27B en 4 bits con un único fichero de 17,6 GB, sin GPU discreta.
- Asistente multimodal en el borde: al aceptar entrada de imagen y texto, permite construir interfaces de consulta sobre capturas, documentos escaneados o fotografías con un consumo de memoria contenido.
- Servicio compatible con OpenAI para herramientas existentes: al exponer `/v1/chat/completions`, se puede apuntar un cliente o framework que ya hable el protocolo OpenAI sin adaptadores adicionales.
- Procesamiento por lotes de prompts largos: con velocidades de prefill medidas de 203 a 220 tok/s hasta 8192 tokens, resulta adecuado para tareas de resumen o extracción sobre documentos extensos en hardware integrado.
- Sustitución de llama.cpp en flujos ya establecidos: para usuarios que ya ejecutan `Q4_K_M` con flash attention en la misma APU, el autor reporta mejoras moderadas de prefill y decodificación, lo que permite migrar sin cambiar de hardware.
- Validación de calidad de cuantizaciones: el dataset de tensores de referencia permite reejecutar la puerta de calidad (`malleus golden`) y comparar contra bf16, útil para equipos que auditan sus propios pipelines de cuantización.
- Prototipado de investigación en hardware de consumo: permite experimentar con un modelo de 27B multimodal en un portátil o mini-PC AMD sin recurrir a clústeres.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en gfx1150 (Radeon 890M, 32 GB de RAM de host), comparadas con llama.cpp `Q4_K_M` con flash attention:

| Metrica | MLS4 (Malleus) | llama.cpp Q4_K_M |
|---|---|---|
| Prefill, 512 tokens (tok/s) | 209,3 | 191,7 |
| Prefill, 1024 tokens (tok/s) | 220,3 | 215,2 |
| Prefill, 2048 tokens (tok/s) | 214,6 | 213,9 |
| Prefill, 8192 tokens (tok/s) | 203,1 | 200,0 |
| Decode a 128 tokens (tok/s) | 5,02 | 4,74 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor remite a MODELS.md para el método y las salvedades de las mediciones.

## Requisitos de hardware

- VRAM/espacio en dispositivo: 17,6 GB para los pesos en 4 bits; el estado KV se dimensiona aparte según `MALLEUS_CTX` (32768 tokens en el ejemplo del autor).
- Memoria de host: 32 GB en la configuración medida (Radeon 890M).
- GPU compatibles: APUs AMD con arquitectura RDNA 3.5, concretamente gfx1150 y gfx1151. No se documenta soporte para otras arquitecturas ni para GPU discretas NVIDIA o AMD.
- GPU de consumo: el caso objetivo es precisamente hardware integrado; no se indica compatibilidad con RTX 4090, A100 o H100.
- Despliegue: motor Malleus, construido mediante `podman build` del Containerfile del repositorio o usando el binario incluido en la imagen; arranque con `malleus serve --model ... --ctx 32768`. No se menciona soporte en vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: prefill de 203 a 220 tok/s y decodificación de 5,02 tok/s a 128 tokens en gfx1150; el autor señala que la decodificación está cerca del límite impuesto por el ancho de banda y que la decodificación especulativa MTP es lo que permite superarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| duckpage/qwen38-27b-mls4 | 27B | 32768 (configurable) | `.malleus`, 4 bits W4A8 | Apache-2.0 | AMD RDNA 3.5 (gfx1150/gfx1151) |
| Qwen/Qwen3.8-27B | 27B | no disponible | bf16 (safetensors) | Apache-2.0 | GPU con ~55 GB de VRAM |
| Mismo modelo en llama.cpp `Q4_K_M` | 27B | no disponible | GGUF, 4 bits | Apache-2.0 | Amplia variedad de hardware |

La comparación relevante es contra el checkpoint bf16 del que procede (mismo modelo, mayor precisión, 55 GB) y contra la ejecución del mismo modelo con llama.cpp en la misma APU, donde el autor reporta ventajas de entre el 1,5 % y el 9 % en prefill y de aproximadamente el 6 % en decodificación. No se dispone de datos para comparar con otras alternativas de 27B en hardware equivalente.

## Limitaciones y advertencias

- Dependencia total del motor Malleus: el formato `.malleus` no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita la migración y añade riesgo de mantenimiento sobre un proyecto de un único autor.
- Compatibilidad de hardware restringida a APUs AMD RDNA 3.5 (gfx1150 / gfx1151); no hay soporte documentado para otras GPU.
- La cuantización a 4 bits introduce degradación respecto a bf16; el autor publica una puerta de calidad, pero no se ofrecen cifras de pérdida en benchmarks estándar en la información disponible.
- El modelo base Qwen3.8-27B no está documentado en esta ficha: sesgos, riesgo de alucinación y cobertura idiomática deben consultarse en su model card original, actualmente no disponible en la información proporcionada.
- Idiomas soportados no disponibles, lo que impide garantizar calidad multilingüe en producción.
- Estado del artefacto: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día (16 de noviembre de 2026); no hay evidencia de uso en producción ni de validación por terceros.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y el copyright permanece con sus autores; cualquier restricción adicional del checkpoint original aplicaría.
- Las cifras de rendimiento proceden del propio autor y de un único dispositivo (Radeon 890M con 32 GB); no se han replicado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duckpage/qwen38-27b-mls4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del motor Malleus: https://github.com/duckpage/malleus
- Documentación de mediciones: https://github.com/duckpage/malleus/blob/main/MODELS.md
- Containerfile de despliegue: https://raw.githubusercontent.com/duckpage/malleus/main/deploy/Containerfile
- Tensores de referencia para validación: https://huggingface.co/datasets/duckpage/malleus-golden
