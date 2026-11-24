# MECHUK/Tideglass-Inkling-2-Mini-Unbound-v2.1-GGUF

## Resumen

Tideglass-Inkling-2-Mini-Unbound-v2.1-GGUF es una cuantizacion mixta de precision publicada por el usuario MECHUK sobre el modelo base thinkingmachines/Inkling-2-Mini, un transformer de tipo Mixture of Experts (MoE) de 26.070.385.152 parametros totales. El autor lo describe como un "transplante parcial de tensores": no es una cuantizacion completa del modelo Unbound v2.1, sino un ensamblaje de pesos procedentes de tres GGUF distintos (bartowski Q4_0 como base, Unsloth UD-Q4_K_M para precisiones retenidas y nokeepai Unbound v2.1 Q8_0 para las proyecciones de atencion).

El resultado es un unico fichero GGUF autonomo de 15.537.527.488 bytes (~14,5 GiB) con arquitectura `inkling2_loop`, pensado para ejecutarse en GPUs de consumo AMD de gama media (el autor lo verifico en una Radeon RX 6700 XT con el runtime PolyStrata). Incorpora ademas dos ficheros opcionales: un proyector de vision en F16 y un borrador especulativo DSpark.

Su relevancia es limitada pero concreta: es un ejemplo de ingenieria de pesos a nivel de tensor para obtener un GGUF hibrido que combina el alineamiento del modelo Unbound v2.1 con la eficiencia de una cuantizacion Q4_0, manteniendo capas sensibles en BF16 y Q8_0. No aporta mejoras de rendimiento ni de calidad documentadas mas alla de un smoke test de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`inkling2_loop` en GGUF), con atencion relativa y convoluciones cortas K/V |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: Q4_0 base, BF16 (24 tensores sink y 8 proyecciones K/V short-convolution), Q8_0 (embedding completo y 12 proyecciones de atencion relativa), Q8_0 en las 120 payloads de atencion transplantadas (attn_q, attn_k, attn_v, attn_output, attn_gate) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal + `mmproj-F16.gguf` de vision + `dspark-...gguf` de decodificacion especulativa) |

## Arquitectura y entrenamiento

El modelo base es Inkling-2-Mini de Thinking Machines Lab, un transformer con mezcla de expertos (MoE) segun la metadata GGUF tipada del fichero. La arquitectura `inkling2_loop` incluye mecanismos especificos: tensores "sink" de atencion, proyecciones K/V de convolucion corta y proyecciones de atencion relativa distribuidas en bloques fisicos 6-17. El modelo soporta ademas vision mediante un proyector multimodal separado y decodificacion especulativa mediante un borrador DSpark (`dflash` con proyecciones Q8_0 y cabeza F16).

No se ha realizado ningun entrenamiento adicional en este derivado: los pesos se copiaron tal cual desde los donantes, sin mezcla, sin re-cuantizacion y sin fine-tuning. De las 704 payloads del GGUF, 165 difieren del Q4_0 original y 539 son identicas byte a byte. El autor publica un manifiesto (`Tideglass-Inkling-2-Mini-Unbound-v2.1.manifest.json`) con nombres exactos, rangos de origen, tipos, revisiones de los donantes y SHA-256 de las 704 payloads resultantes, lo que permite auditar la procedencia tensor a tensor.

## Capacidades

- Generacion de texto conversacional en formato GGUF compatible con endpoints estandar de inferencia.
- Razonamiento y generacion de codigo heredados del modelo base Inkling-2-Mini (no verificados de forma independiente en este derivado).
- Vision multimodal opcional mediante `mmproj-F16.gguf` (proyector F16 identico al de Unsloth). El autor indica que la inferencia de imagen no se probo junto con los pesos v2.1.
- Decodificacion especulativa opcional mediante el borrador DSpark incluido; tampoco se probo combinada con v2.1.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado en la model card.
- Modo "thinking" explicito: no documentado.
- El modelo incorpora pesos de atencion de un modelo alineado (Unbound v2.1), pero su comportamiento de seguridad no ha sido evaluado.

## Casos de uso

- Inferencia local en GPU AMD de gama media: el fichero de ~14,5 GiB esta pensado para ejecutarse en tarjetas como la RX 6700 XT (12 GB) usando el runtime PolyStrata con backend HIP `gfx1031`; util para prototipado sin depender de CUDA.
- Evaluacion de tecnicas de cuantizacion mixta: investigadores que estudien el impacto de mantener capas concretas (sink, K/V, embedding) en BF16/Q8_0 mientras el resto va en Q4_0 pueden usar este GGUF y su manifiesto como caso de referencia reproducible.
- Auditoria de procedencia de pesos: el manifiesto con SHA-256 por payload permite verificar la cadena de custodia entre bartowski, Unsloth, nokeepai y este derivado, util en entornos que exigen trazabilidad de artefactos.
- Despliegue conversacional ligero: al ser un GGUF autonomo compatible con endpoints, puede servir como backend de chat en aplicaciones internas donde el coste de GPU es la restriccion principal.
- Experimentacion con decodificacion especulativa: el borrador DSpark incluido permite probar aceleracion por drafter en pipelines de generacion, aunque el autor advierte que no se valido junto con v2.1.
- Pruebas de vision en local: cargando el proyector F16 opcional se puede evaluar el pipeline multimodal del modelo base en hardware de consumo, con la cautela de que la combinacion concreta no fue verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el smoke test realizado en PolyStrata "no es un benchmark de calidad ni de velocidad" y que los resultados de Unbound o de builds anteriores de Tideglass no son aplicables a este hibrido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,5 GiB solo para los pesos del fichero principal; con overhead de contexto y KV cache hay que prever margen adicional. El proyector de vision anade ~610 MiB y el borrador especulativo ~384 MiB.
- GPU verificada por el autor: AMD Radeon RX 6700 XT (12 GB) con PolyStrata, release HIP `gfx1031`. El autor no indica como se gestiono el desbordamiento de VRAM respecto a los 14,5 GiB del fichero.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, encajaria en tarjetas con 16 GB o mas (RTX 4080/4090, RX 7800 XT/7900, A100 40 GB, H100).
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM; en tarjetas de 12 GB requiere offload parcial o configuracion especifica no documentada.
- Opciones de despliegue: PolyStrata (unico runtime verificado). Otros cargadores GGUF (llama.cpp, Ollama, vLLM) no fueron verificados por el autor; la arquitectura `inkling2_loop` y los tipos mixtos pueden requerir soporte especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tideglass-Inkling-2-Mini-Unbound-v2.1 (este) | 26,07 B | no disponible | GGUF mixto (~14,5 GiB) | Apache 2.0 | Hibrido con atencion de Unbound v2.1; verificado solo en PolyStrata/RX 6700 XT |
| bartowski/Inkling-2-Mini-GGUF (Q4_0) | 26,07 B | no disponible | GGUF Q4_0 | Apache 2.0 | Base de este derivado; cuantizacion uniforme Q4_0 |
| unsloth/Inkling-2-Mini-GGUF (UD-Q4_K_M) | 26,07 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Cuantizacion dinamica de Unsloth; donante de las capas retenidas en BF16/Q8_0 |
| nokeepai/Inkling-2-Mini-Unbound-v2.1-Q8_0 | 26,07 B | no disponible | GGUF Q8_0 | Apache 2.0 | Modelo alineado; donante de las 120 payloads de atencion; mayor tamano en disco |

## Limitaciones y advertencias

- Es un transplante parcial de tensores, no una cuantizacion completa ni un fine-tuning: no hay garantia de coherencia global entre los pesos de distintos donantes.
- El comportamiento de seguridad no ha sido evaluado. Al importar pesos de atencion de un modelo modificado por alineacion, el autor advierte que puede generar contenido inseguro o inexacto y que no debe usarse como filtro de rechazo.
- Solo se ha verificado la carga y una generacion de texto autenticada en PolyStrata sobre una RX 6700 XT; otros cargadores y GPUs no estan probados.
- La vision con `mmproj-F16.gguf` y la decodificacion especulativa con el borrador DSpark no se probaron junto con los pesos v2.1.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados y longitud de contexto: no disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a la Model Acceptable Use Policy de Thinking Machines para el uso aceptable del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MECHUK/Tideglass-Inkling-2-Mini-Unbound-v2.1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Runtime PolyStrata: https://github.com/0FL01/PolyStrata
- Notas del borrador DSpark en PolyStrata: https://github.com/0FL01/PolyStrata/blob/c0dd0e52/docs/goals/2026-11-21-inkling2-dspark.md
- GGUF Q4_0 de bartowski (base): https://huggingface.co/bartowski/Inkling-2-Mini-GGUF/blob/ad66863fd3b7f3236c0b7a0862412c9e00f78a6e/Inkling-2-Mini-Q4_0.gguf
- GGUF UD-Q4_K_M de Unsloth (capas retenidas): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/8078d149286eec7193795413b9e0643da6d11fa1/Inkling-2-Mini-UD-Q4_K_M.gguf
- README del borrador DSpark de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/8078d149286eec7193795413b9e0643da6d11fa1/dspark/README.md
- GGUF Q8_0 de Unbound v2.1 (nokeepai): https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF/blob/f3c6e33c45f70ab9d1eba8ba018081557e34d034/Inkling-2-Mini-Unbound-v2.1-Q8_0.gguf
- Manifiesto de entrenamiento upstream v2.1: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound/blob/ef74b44edd2851b8e8d221a7313f36c419590430/finetune_v2.1/MANIFEST.json
