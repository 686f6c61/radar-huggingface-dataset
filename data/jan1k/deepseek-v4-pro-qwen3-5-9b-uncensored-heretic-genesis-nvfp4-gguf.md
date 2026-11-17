# jan1k/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-NVFP4-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-NVFP4-GGUF es una cuantizacion NVFP4 en formato GGUF de un modelo multimodal de 9.197.093.888 parametros (~9,2B) derivado de la familia Qwen3.5, publicada por el usuario jan1k. El modelo parte de la variante "heretic" (abliterated) de xtools-at sobre la base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, procesada posteriormente por LuffyTheFox bajo la etiqueta "Genesis" y convertida a GGUF F16 antes de esta recuantizacion directa a NVFP4.

La relevancia tecnica de esta publicacion no reside en el modelo en si, sino en el pipeline de cuantizacion: se trata de un GGUF NVFP4 con escalas UE4M3 inline, sin tensores separados de escala, lo que permite ejecutarlo en llama.cpp estandar y en runtimes como LM Studio que no implementan el contrato extendido de tensores de escala NVFP4. Ademas, preserva la cabeza MTP (nextn) del modelo original, habilitando decodificacion especulativa nativa.

Arquitectura hibrida `qwen35`: 33 bloques totales con 24 bloques SSM (gated delta net) y 9 bloques de atencion completa (intervalo 4), con una longitud de contexto declarada de 262.144 tokens y soporte multimodal image-text-to-text mediante un proyector mmproj separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` hibrida: 24 bloques SSM (gated delta net) + 9 bloques de atencion completa (intervalo 4), 33 bloques totales |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (253 tensores, escalas UE4M3 inline), F32 (184 tensores), F16 (5 tensores protegidos); `general.file_type` = 39 (`LLAMA_FTYPE_MOSTLY_NVFP4`) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje NVFP4 + proyector multimodal mmproj F16) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Qwen3.5 con 33 bloques: 24 bloques de espacio de estado (SSM, gated delta net) y 9 bloques de atencion completa intercalados cada 4 bloques. Esta combinacion reduce el coste computacional y de memoria frente a un transformer puramente atencional en contextos largos, manteniendo capacidad de recuperacion exacta en los bloques de atencion completa. Incluye una cabeza MTP (Multi-Token Prediction, `nextn_predict_layers = 1`, preservada en `blk.32`) utilizable para decodificacion especulativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en la informacion proporcionada. El modelo ha pasado por un proceso de abliteration ("heretic") que elimina direcciones de rechazo, seguido del procesado "Genesis" de LuffyTheFox del que no se detalla la metodologia. La cuantizacion NVFP4 se realizo directamente desde el GGUF F16 de origen, sin paso de redondeo adicional, mediante `michaelw9999/advanced-gguf-quantizer` con la opcion `--nvfp4-inline-scales-only`. Se aplico una politica de proteccion por tensor: cinco tensores se mantienen en F16 (`blk.0.attn_gate.weight`, `blk.0.attn_qkv.weight`, `blk.0.ffn_down.weight`, `blk.13.ffn_down.weight`, `blk.32.nextn.eh_proj.weight`), mientras que `blk.0.ssm_out.weight`, `blk.1.attn_gate.weight` y `blk.1.attn_qkv.weight` se fuerzan a NVFP4 por colapsar a precisiones inferiores.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen a texto (pipeline `image-text-to-text`) mediante el proyector mmproj F16; verificado con captioning de imagenes.
- Decodificacion especulativa nativa mediante la cabeza MTP integrada (`--spec-type draft-mtp`), con una tasa de aceptacion reportada de 36/37 tokens borrador (~97%) en una generacion de prueba.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modelo "uncensored": la abliteration elimina direcciones de rechazo, lo que reduce las negativas a peticiones que el modelo base filtraria.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con 5,08 GiB para el modelo de lenguaje en NVFP4, cabe en GPUs de 8 GB o mas; verificado en RTX 3080 Ti con ~100 tok/s. Adecuado para prototipado y despliegue en estaciones de trabajo sin acceso a cluster.
- Despliegue en Blackwell con ruta FP4 nativa: en RTX 50xx el modelo usa los kernels FP4 nativos del hardware, lo que maximiza throughput y reduce consumo energetico frente a precisiones superiores.
- Procesamiento de documentos con contexto largo: los 262.144 tokens de contexto y la arquitectura hibrida SSM/atencion permiten ingerir documentos extensos o conversaciones largas con menor coste de memoria que un transformer denso equivalente.
- Captioning y descripcion de imagenes: mediante el mmproj F16 se pueden generar descripciones textuales de imagenes para indexacion, accesibilidad o pipelines de datos.
- Generacion acelerada con decodificacion especulativa: la cabeza MTP permite servir el modelo con `--spec-type draft-mtp` en llama.cpp, reduciendo la latencia por token en cargas de generacion larga.
- Investigacion sobre abliteration y cuantizacion extrema: el modelo sirve como caso de estudio de cuantizacion NVFP4 con escalas inline y de politicas de proteccion por tensor en arquitecturas hibridas.
- Experimentacion con contenido sin filtros: para entornos de investigacion donde se requiere un modelo sin capas de rechazo, con las advertencias legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizaron mediciones de PPL ni KLD contra el modelo de origen, y que la calidad se verifico unicamente mediante pruebas de inferencia (smoke tests). Los unicos datos de rendimiento reportados son: ~100 tok/s en llama-server sobre RTX 3080 Ti y una tasa de aceptacion del 97% (36/37) en la cabeza MTP.

## Requisitos de hardware

- VRAM estimada: ~5,08 GiB para el modelo de lenguaje NVFP4; ~0,86 GiB adicionales si se carga el proyector multimodal mmproj F16 (total ~6 GiB).
- GPU recomendadas: RTX 50xx (Blackwell) para la ruta FP4 nativa mas rapida; RTX 30xx (Ampere) funciona via kernels de fallback, verificado en RTX 3080 Ti.
- Cabe en GPU de consumo: si, desde 8 GB de VRAM; tambien se ha verificado inferencia en CPU con salida coherente.
- Opciones de despliegue: llama.cpp (requiere build reciente, ~2026-11 o posterior, probado en commit `1ef8c5d`), llama-server, LM Studio (compatible gracias a las escalas inline). vLLM, TGI y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: ~100 tok/s en RTX 3080 Ti segun el autor; sin datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NVFP4 GGUF) | ~9,2B | 262.144 | GGUF NVFP4 | Apache 2.0 | Hibrido SSM/atencion, multimodal, MTP |
| LuffyTheFox/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-GGUF | ~9,2B | 262.144 | GGUF (varias precisiones) | Apache 2.0 | Modelo de origen de esta cuantizacion |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9,2B | no disponible | safetensors/GGUF | Apache 2.0 | Version abliterated sobre la que se aplico Genesis |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9,2B | no disponible | no disponible | no disponible | Modelo base sin abliteration |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se realizaron mediciones de perplejidad (PPL) ni divergencia KL (KLD) contra el modelo F16 de origen; la degradacion por cuantizacion NVFP4 no esta cuantificada.
- La calidad se verifico unicamente mediante pruebas de inferencia subjetivas, no con evaluaciones estandarizadas.
- Modelo "uncensored": la abliteration elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sesgado. No es apto para despliegues orientados al publico sin capas de moderacion externas.
- Riesgo de alucinacion inherente a modelos de ~9B, no mitigado por el proceso de cuantizacion.
- Requiere una build muy reciente de llama.cpp (posterior a ~2026-11) con soporte para `qwen35` y NVFP4; versiones anteriores no cargaran el modelo correctamente.
- El rendimiento optimo depende de hardware Blackwell; en Ampere y CPU se usan rutas de fallback con menor eficiencia.
- La licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" traslada al desplegador la responsabilidad legal y etica del contenido generado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.
- La informacion sobre el proceso "Genesis" y la metodologia de abliteration no esta detallada en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/jan1k/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-NVFP4-GGUF
- Modelo de origen (Genesis GGUF): https://huggingface.co/LuffyTheFox/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Genesis-GGUF
- Version heretic (abliteration): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Cuantizador: https://github.com/michaelw9999/advanced-gguf-quantizer
