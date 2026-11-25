# LLJYY/OmniLion-v1.1-NVFP4-W4A16

## Resumen
OmniLion v1.1 NVFP4-W4A16 es una cuantizacion empaquetada del modelo multimodal OmniLion v1.1 (BF16) publicado por el usuario LLJYY en Hugging Face. Se trata de un derivado de inferencia, no de un modelo entrenado desde cero: parte del release BF16 fusionado y aplica cuantizacion NVFP4 en pesos con activaciones en BF16 (esquema W4A16) sobre parte de las proyecciones del decodificador. El pipeline declarado es image-text-to-text, lo que confirma su naturaleza multimodal (texto e imagen, con componentes de audio en el modelo base).

El modelo cuenta con 28.120.923.504 parametros totales segun los tensores safetensors, un repositorio de 27,1 GB y un payload de 27.059.978.144 bytes distribuidos en 16 shards. La arquitectura se etiqueta como qwen3_5, lo que sugiere una base derivada de la familia Qwen 3.5, aunque no se detalla la composicion interna ni el contexto maximo en la informacion disponible.

Su relevancia es acotada y experimental: el autor lo presenta explicitamente como un "candidato de cuantizacion" sin validacion en CUDA, sin soporte confirmado de Marlin/TP ni pruebas de generacion multimodal o calidad. La verificacion realizada se limita a comprobaciones numericas y de bytes en CPU. Es, por tanto, un artefacto para evaluacion de despliegue con vLLM 0.25.1 y el plugin OmniLion incluido, no una opcion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta qwen3_5); decodificador con proyecciones adaptadas, vision nativa y encoder/proyector de audio |
| Parametros totales | 28.120.923.504 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 E2M1 con escalas de bloque FP8 E4M3FN (bloque 16) y escalas globales FP32 en 304 modulos del decodificador; resto en BF16; activaciones BF16 (W4A16) |
| Idiomas soportados | no disponible |
| Licencia | other (mit-and-apache-2.0-components): componentes MIT (decodificador/vision) y Apache-2.0 (audio/plugin) |
| Formato de pesos | safetensors (16 shards, 2.203 tensores incluyendo escalas) |

## Arquitectura y entrenamiento
El artefacto es una cuantizacion post-entrenamiento (PTQ) generada con ModelOpt sobre el release BF16 fusionado de OmniLion v1.1. De los modulos del decodificador adaptados, 304 usan pesos NVFP4 genuinos empaquetados en nibbles con escalas FP8 E4M3FN por bloque de 16 y escalas globales FP32; los otros 192 modulos adaptados, asi como la vision nativa y el encoder/proyector de audio entrenado, permanecen en BF16. Las activaciones se mantienen en BF16, de ahi la designacion W4A16.

No se reaplica ningun adaptador: parte de la base fusionada "P4-3584". Las escalas se derivan de nuevo a partir de la fuente BF16 mediante QDQ (quantize-dequantize), no se recuperan escalas historicas de QAT. El empaquetado se completo en CPU y se validaron dos comprobaciones numericas y de bytes preservados, incluida una ejecucion en proceso limpio: todos los tensores empaquetados y de escalas coinciden con la transformacion determinista y los 1.291 tensores preservados coinciden byte a byte con la fuente. No se proporcionan datos sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO del modelo base en la informacion disponible.

## Capacidades
- Generacion de texto e inferencia multimodal image-text-to-text, segun el pipeline declarado.
- Procesamiento de imagen mediante vision nativa en BF16 (no cuantizada).
- Componente de audio: encoder y proyector entrenados presentes en BF16, con obligaciones de licencia Apache-2.0.
- Conversacion multi-turno (tag conversational).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking, decodificacion especulativa u otras capacidades especiales: no disponible.
- Integracion con vLLM mediante plugin OmniLion y configuracion `runtime/vllm.yaml`.

## Casos de uso
- Evaluacion de cuantizacion NVFP4 en vLLM: desplegar el artefacto con `VLLM_PLUGINS=omnilion vllm serve --config runtime/vllm.yaml` para medir si el layout W4A16 funciona en CUDA y comparar calidad frente al BF16. Es el uso principal declarado por el autor.
- Validacion de topologia multi-GPU: la configuracion incluida mantiene la topologia original de cuatro GPU y el alias servido `OmniLion-v1.1`, util para probar tensor parallelism y consumo de VRAM antes de adoptar NVFP4 en produccion.
- Pruebas de regresion numerica: los 1.291 tensores preservados y las escalas derivadas permiten verificar que la transformacion QDQ es determinista y reproducible en pipelines de CI.
- Prototipado de asistentes imagen-texto: con 28,1 mil millones de parametros y vision en BF16, sirve para experimentar con descripcion de imagenes o VQA en entornos de investigacion, asumiendo que la calidad NVFP4 no esta validada.
- Investigacion sobre cuantizacion hibrida: el reparto entre 304 modulos NVFP4 y 192 BF16 es un caso de estudio para analizar el impacto de cuantizar solo parte de las proyecciones del decodificador.
- Base para comparativas de licencias: al combinar componentes MIT y Apache-2.0, permite evaluar el cumplimiento de obligaciones de atribucion en despliegues derivados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los resultados de benchmarks del BF16 no deben presentarse como resultados de NVFP4, y que la carga en CUDA, el soporte de formas Marlin/TP, la generacion multimodal y la calidad aun no se han ejercitado para este artefacto.

## Requisitos de hardware
- VRAM estimada para inferencia: el payload de pesos es de 27.059.978.144 bytes (unos 25,2 GiB) en 16 shards; a ello hay que sumar cache KV y overhead de activaciones BF16, por lo que no se confirma que quepa en una sola GPU.
- GPU recomendadas: la configuracion incluida (`runtime/vllm.yaml`) conserva una topologia de cuatro GPU; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada; el autor no afirma que quepa en una sola GPU ni en tarjetas consumer.
- Opciones de despliegue: vLLM 0.25.1 (version fijada) con el plugin OmniLion incluido en `runtime/`; no se mencionan llama.cpp, Ollama ni TGI, y el formato NVFP4 empaquetado probablemente no sea compatible con ellos.
- Latencia y throughput: no disponibles; no se han ejecutado pruebas de rendimiento en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| OmniLion v1.1 NVFP4-W4A16 | 28,12 B | no disponible | NVFP4 W4A16 hibrida | MIT + Apache-2.0 | Candidato experimental, sin validacion CUDA |
| OmniLion v1.1 (BF16) | no disponible en la informacion | no disponible | BF16 | MIT + Apache-2.0 | Release base fusionado; recomendado para entrenamiento continuado |
| Otros modelos multimodales de ~28 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias
- Artefacto sin validar en GPU: carga en CUDA, soporte de formas Marlin/TP, generacion multimodal y calidad no han sido probados; el propio autor lo califica de candidato.
- Solo verificacion en CPU: las comprobaciones realizadas son numericas y de coincidencia de bytes, no de comportamiento en inferencia real.
- No apto como base para entrenamiento continuado: el autor indica que debe usarse el release BF16 para ello; este derivado es solo para inferencia.
- Idiomas no declarados: no hay garantia de cobertura multilingue ni de calidad por idioma.
- Contexto maximo no especificado: no se puede planificar el uso con documentos o conversaciones largas sin medirlo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a un modelo de lenguaje de este tamano.
- Licencia compuesta: obligaciones MIT para decodificador y vision, y Apache-2.0 para audio y plugin; es necesario revisar `LICENSES.md`, `LICENSE` y `licenses/` antes de uso comercial.
- Dependencia de version: requiere vLLM 0.25.1 fijado y el plugin OmniLion; otras versiones pueden no soportar el layout NVFP4.
- Payload de gran tamano (27,1 GB) y 16 shards: complica el despliegue en entornos con almacenamiento o ancho de banda limitados.
- Sin datos de benchmarks ni de rendimiento: no se puede estimar latencia, throughput ni perdida de calidad frente al BF16.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LLJYY/OmniLion-v1.1-NVFP4-W4A16
- Modelo base BF16: https://huggingface.co/LLJYY/OmniLion-v1.1
- Revision BF16 referenciada: https://huggingface.co/LLJYY/OmniLion-v1.1/tree/748380b627a0220451aabc4d8eec02ecef33fa21
- Licencias: https://huggingface.co/LLJYY/OmniLion-v1.1/blob/main/LICENSES.md
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
