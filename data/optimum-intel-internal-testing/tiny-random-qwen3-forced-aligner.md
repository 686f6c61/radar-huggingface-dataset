# optimum-intel-internal-testing/tiny-random-qwen3-forced-aligner

## Resumen

`optimum-intel-internal-testing/tiny-random-qwen3-forced-aligner` es un artefacto de pruebas interno, no un modelo funcional. Se trata de un fixture que reproduce la arquitectura del modelo `Qwen/Qwen3-ForcedAligner-0.6B` (un alineador forzado audio-texto) pero con pesos generados aleatoriamente con semilla 42, sin descargar ni reutilizar el checkpoint original de 0,6B. Su unico proposito es servir como modelo diminuto y determinista para pruebas automatizadas de carga, configuracion y procesamiento.

El artefacto instancia `Qwen3ASRForConditionalGeneration` con `model_type` de nivel superior `qwen3_asr` y `thinker_config.model_type` igual a `qwen3_forced_aligner`, de modo que se construye el cabezal de clasificacion (`classify_num`) del alineador en lugar del cabezal de vocabulario. Envuelve una torre de audio (`qwen3_asr_audio_encoder`, tipo conformer) y un decodificador de texto (`qwen3_asr_text`) con M-RoPE intercalado.

Cuenta con 10.253.184 parametros (~10,25 M) en float32, lo que lo hace ejecutable en CPU en cualquier maquina. No tiene pipeline declarado, 0 descargas y 0 likes en el momento de redactar esta ficha, y su model card consiste unicamente en el script Python que lo genera. Es relevante solo como pieza de infraestructura de testing para el ecosistema de Optimum/Intel, no como modelo para evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de dos torres: torre de audio conformer (`qwen3_asr_audio_encoder`) + decodificador de texto (`qwen3_asr_text`) con M-RoPE intercalado; cabezal de clasificacion (`classify_num`) en lugar de cabezal de vocabulario |
| Parametros totales | 10.253.184 (~10,25 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings` del decodificador en la configuracion tiny) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |
| Model type | `qwen3_asr` (con `thinker_config.model_type = qwen3_forced_aligner`) |
| Decodificador de texto | hidden_size 64, head_dim 16, 4 cabezas de atencion, 2 cabezas KV, intermediate_size 128, 2 capas |
| Torre de audio | d_model 64, 2 capas, 4 cabezas, ffn 128, downsample_hidden_size 32, output_dim 64, num_mel_bins 128 |
| Tamano del repo | 0,1 GB |
| Tamano del checkpoint | ~41 MB en float32 (estimado a partir del numero de parametros) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de dos torres orientado a alineamiento forzado. La torre de audio es un conformer (`qwen3_asr_audio_encoder`) que consume caracteristicas de 128 bins mel y proyecta a un espacio de 64 dimensiones (`output_dim`), coincidente con el `hidden_size` del texto para que los embeddings de audio se fusionen con los del decodificador. El decodificador de texto (`qwen3_asr_text`) emplea M-RoPE intercalado (`mrope_interleaved: true`) con `mrope_section` reescalado a `[4, 2, 2]` para sumar `head_dim // 2 = 8`; en el modelo original esa misma invariante se cumple con `[24, 20, 20]` sobre `head_dim = 128`. La seleccion del cabezal de alineador se consigue porque `thinker_config.model_type` es `qwen3_forced_aligner`, lo que activa un cabezal de clasificacion de ancho `classify_num` en vez del cabezal de vocabulario.

No hay entrenamiento: los pesos son aleatorios (semilla 42) y no se describe dataset, numero de tokens, composicion ni fases de RLHF/DPO. La unica "innovacion" documentada es de compatibilidad: el script incluye un shim que vuelve a registrar un inicializador de RoPE clasico bajo el nombre `"default"` para `transformers >= 5`, ya que el codigo remoto de `qwen_asr` apunta a `transformers 4.57`, donde `"default"` era una entrada de `ROPE_INIT_FUNCTIONS`. Tambien parchea `config.json` para restaurar `qwen3_forced_aligner` en el sub-config del thinker, porque `PretrainedConfig.to_dict` serializa el atributo de clase (`qwen3_asr_thinker`).

## Capacidades

- No tiene capacidades funcionales reales: los pesos son aleatorios, por lo que cualquier salida es ruido sin valor semantico.
- Reproduce estructuralmente la tarea de alineamiento forzado (correspondencia temporal entre audio y transcripcion) propia del checkpoint `Qwen/Qwen3-ForcedAligner-0.6B`, pero no la ejecuta de forma util.
- Construye el cabezal de clasificacion del alineador (`classify_num`) en lugar del cabezal de vocabulario, lo que permite probar esa ruta de codigo.
- Procesa entradas de audio con 128 bins mel a traves de la torre conformer, con `downsample_hidden_size` de 32.
- Soporta M-RoPE intercalado en el decodificador, util para validar rutas de posiciones multimodales.
- Carga mediante `trust_remote_code=True` con `AutoConfig`/`AutoModel` y el paquete de terceros `qwen_asr`, que registra la arquitectura.
- No dispone de soporte declarado de tool calling, function calling, agentes, vision, thinking mode ni audio generativo.
- Idiomas soportados: no disponible.

## Casos de uso

- Pruebas de integracion en CI para pipelines de alineamiento forzado: al pesar ~41 MB, el fixture se descarga e instancia en segundos y permite verificar que el pipeline completo funciona sin depender del checkpoint de 0,6B.
- Validacion de carga con codigo remoto: sirve para comprobar que `AutoConfig`/`AutoModel` registran correctamente `qwen3_asr` cuando `qwen_asr` esta instalado, incluyendo el caso de fallo cuando no lo esta.
- Regression testing de exportacion en Optimum: coherente con la organizacion propietaria (`optimum-intel-internal-testing`), permite validar conversiones y trazados sobre una arquitectura realista de dos torres sin coste de computo.
- Pruebas de compatibilidad entre versiones de `transformers`: el shim de RoPE documentado en la model card se puede usar como caso de prueba reproducible del salto de `transformers 4.57` a `5.x`.
- Verificacion del procesador de audio: al mantener `num_mel_bins = 128`, permite comprobar que el processor emite caracteristicas compatibles y que la torre de audio las consume correctamente.
- Desarrollo y pruebas sin conexion: el fixture se genera localmente a partir del script con semilla fija, lo que garantiza resultados deterministas y evita descargas de red en entornos aislados.
- Pruebas de la logica del cabezal `classify_num`: util para validar el parcheo de `config.json` y confirmar que el modelo recargado conserva el cabezal de alineador en vez del de vocabulario.
- Benchmarking de infraestructura (no del modelo): sirve para medir tiempos de arranque, uso de memoria y overhead de `trust_remote_code` en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye evaluaciones, los tags no declaran resultados y el artefacto tiene pesos aleatorios, por lo que cualquier metrica de calidad (WER, alineamiento, MMLU, etc.) carece de sentido. Los resultados de busqueda web no aportan datos sobre este modelo ni sobre el checkpoint de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: ~41 MB de pesos en float32; con activaciones y buffers, menos de 1 GB en cualquier configuracion.
- GPU recomendadas: ninguna en particular; el fixture no requiere GPU. Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en iGPU.
- CPU: es el entorno natural de ejecucion; el modelo esta pensado para ejecutarse en CPU en pipelines de CI.
- Cabe en GPU consumer: si, en todas, sin necesidad de cuantizacion ni offloading.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, el paquete de terceros `qwen_asr`, `torch` y `soundfile`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.
- Nota de compatibilidad: requiere `transformers 4.57` o el shim de RoPE incluido en el script para versiones 5.x, y `qwen_asr` para registrar la arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-random-qwen3-forced-aligner (este) | 10,25 M | 2048 tokens (config tiny) | Aleatorios (float32, safetensors) | Apache 2.0 | Fixture de pruebas internas |
| Qwen/Qwen3-ForcedAligner-0.6B | 0,6B (segun identificador) | no disponible | Entrenados | no disponible en la informacion | Alineamiento forzado audio-texto en produccion |
| Otros fixtures de `optimum-intel-internal-testing` | no disponible | no disponible | Aleatorios | no disponible | Pruebas internas |

No se dispone de datos de rendimiento, contexto real ni licencia del checkpoint de referencia mas alla de lo indicado. La busqueda web no devolvio informacion relevante sobre este modelo ni sobre alternativas comparables de la misma organizacion.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce transcripciones, alineamientos ni ninguna salida util. No debe usarse en produccion bajo ninguna circunstancia.
- No existe model card propiamente dicha: el README es el script de generacion, sin documentacion de uso, limitaciones ni evaluaciones.
- Requiere `trust_remote_code=True` y el paquete de terceros `qwen_asr`, lo que implica ejecutar codigo no auditado y anade una dependencia externa al entorno.
- Dependencia fragil de version: el shim de RoPE es necesario para `transformers >= 5`; sin el, la carga falla para `rope_type == "default"`.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero cualquier salida es ruido; no debe interpretarse como prediccion.
- La configuracion tiny (hidden 64, 2 capas, `head_dim` 16) no reproduce el comportamiento numerico del checkpoint de 0,6B, por lo que no sirve para validar calidad ni precision.
- `num_mel_bins = 128` es fijo y debe coincidir con la salida del processor; un processor distinto rompe la carga.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero al carecer de valor funcional la cuestion es irrelevante en la practica.
- Sin pipeline declarado, 0 descargas y 0 likes: no hay senales de comunidad, soporte ni mantenimiento.
- El nombre de la organizacion indica uso interno; no hay compromiso de estabilidad ni de conservacion del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/optimum-intel-internal-testing/tiny-random-qwen3-forced-aligner
- Organizacion propietaria: https://huggingface.co/optimum-intel-internal-testing
- Checkpoint de referencia citado en el script: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Paper, blog, repositorio o demo asociados: no disponible
- Resultados de busqueda web relevantes: no disponible (las busquedas devuelven unicamente sitios comerciales sin relacion con el modelo)
