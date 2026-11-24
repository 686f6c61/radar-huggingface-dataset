# amir0907/dots-s2st-qwen2.5-2b-expanded-initialized

## Resumen

dots S2ST Qwen2.5 expanded initialized es un checkpoint de arquitectura para traduccion de voz a voz (speech-to-speech translation, S2ST) construido sobre Qwen2.5-1.5B. Lo publica el usuario amir0907 en Hugging Face bajo licencia Apache 2.0. El modelo **no esta entrenado**: se trata de un sistema completo inicializado, con pesos del donante Dots preservados y bloques nuevos insertados, pero sin evidencia de calidad de traduccion EN-to-FA ni de calidad de voz en persa.

La innovacion principal es la expansion del grafo: el LLM original de Qwen2.5-1.5B (28 capas nativas) se amplia a 38 capas mediante diez bloques identidad copiados de forma independiente. La traduccion usa el grafo expandido, mientras que la sintesis de voz protegida (TTS) sigue usando el computo nativo original de 28 capas con los prompts Dots originales y una cache nueva. El sistema integra AuT (audio transformer), conector, LLM, patch/DiT/proyecciones/EOS originales, codec, encoder de hablante y estadisticas.

El sistema completo es mayor que 2B: el LLM tiene 2.011.300.864 parametros unicos y el sistema completo 3.510.080.879 parametros unicos (3.743.148.722 elementos tensoriales serializados). El repo ocupa 7,9 GB. Es relevante como base de investigacion para experimentos de expansion de arquitectura y S2ST, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) expandido de 28 a 38 capas, con AuT, conector, patch/DiT/proyecciones/EOS, codec y encoder de hablante |
| Parametros totales | 3.510.080.879 unicos en el sistema completo; 3.743.148.722 elementos tensoriales serializados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en BF16 segun la model card; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | Ingles (en) y persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema parte del Qwen2.5-1.5B entrenado por Dots y lo expande de 28 a 38 capas nativas anadiendo diez bloques identidad copiados de forma independiente. Se preservan las filas de tokens originales, las interfaces acusticas y los pesos del donante congelados. La traduccion se ejecuta sobre el grafo expandido; el TTS protegido usa el computo nativo original de 28 capas con los prompts Dots originales y una cache fresca. La politica de entrenamiento prevista es entrenar solo los bloques insertados, el nuevo conector de fuente y las filas de control anadidas. Los pesos Expression/MoVE estan completos pero inactivos por defecto.

El pipeline acustico incluye AuT, conector, LLM, patch/DiT/proyecciones/EOS originales, codec, encoder de hablante y estadisticas. El codec Dots es continuo: 48 kHz, latente de 128 dimensiones, hop 1920, patch 4, con 6,25 parches acusticos AR por segundo. El donante canonico en BF16 nunca pasa por un reguardado en FP16. La model card indica explicitamente que no hay traduccion EN-to-FA ni calidad de voz persa establecidas, y que no se ha verificado entrenamiento, actualizacion ni reanudacion en vivo sobre ocho NPU Ascend.

## Capacidades

- Generacion de texto y razonamiento heredados de la base Qwen2.5-1.5B (aunque la model card no certifica calidad tras la expansion).
- Traduccion de voz a voz (EN-to-FA) como objetivo declarado, **no verificada**.
- Sintesis de voz mediante el camino TTS protegido de 28 capas nativas.
- Procesamiento de audio continuo a 48 kHz mediante codec latente de 128 dimensiones.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues limitadas a ingles y persa segun los tags.
- Modo thinking, vision o audio adicional: no disponible.

## Casos de uso

- Investigacion en expansion de arquitectura: el checkpoint sirve para estudiar como afecta la insercion de bloques identidad (28 a 38 capas) al comportamiento del LLM sin reentrenar el donante, comparando el grafo expandido frente al nativo.
- Experimentos de S2ST EN-to-FA: base inicializada para entrenar solo los bloques insertados, el conector de fuente y las filas de control, evaluando despues la calidad de traduccion en un conjunto held-out.
- Preservacion de TTS durante expansion: permite validar que el camino TTS protegido de 28 capas sigue produciendo la misma salida que el modelo Dots original con prompts y cache fresca.
- Estudio de codecs acusticos continuos: el codec de 48 kHz, latente 128, hop 1920 y patch 4 (6,25 parches AR/s) se puede analizar de forma aislada en pipelines de investigacion de audio.
- Reproducibilidad y auditoria de pesos: el repo incluye procedencia Loaded/New/Skipped, hashes y politica de entrenabilidad, util para auditar que pesos se copiaron y cuales son nuevos.
- Pruebas de despliegue en hardware Ascend: punto de partida para verificar ejecucion en ocho NPU Ascend, algo que la model card declara no verificado.
- Docencia y formacion: ejemplo didactico de expansion de capas y de separacion entre camino de traduccion y camino TTS protegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay evidencia de calidad de traduccion EN-to-FA ni de calidad de voz persa, y que las pruebas de componente unitario no establecen calidad pretrained.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 7,9 GB en BF16; en FP16/BF16 se necesita aproximadamente 8 GB solo para pesos, mas overhead de activaciones, cache y codec. Con cuantizacion a 8 bits cabria en torno a 4-5 GB, pero no se publican variantes cuantizadas.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) seria suficiente para pesos en BF16, pero no hay validacion publicada.
- Cabe en consumer GPU: probablemente en GPUs de 16 GB o mas en BF16; no confirmado por el autor.
- Opciones de despliegue: la model card exige el loader personalizado `dots_tts` revisado e instalable, y desaconseja `AutoModel` generico o `trust_remote_code`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible. La model card menciona 6,25 parches acusticos AR por segundo como tasa del codec, no como rendimiento medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| dots S2ST Qwen2.5 expanded initialized | 3,51B unicos (sistema completo); 2,01B LLM | No disponible | S2ST EN-FA + TTS | Apache 2.0 | Inicializado, sin entrenar |
| Qwen2.5-1.5B (base donante) | 1,5B | No disponible en esta ficha | LLM texto | Apache 2.0 | Entrenado |
| Alternativas S2ST open source | No disponible | No disponible | S2ST | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables verificados en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo entrenado**: la model card lo declara explicitamente como sistema inicializado sin entrenar; no hay traduccion EN-to-FA ni calidad de voz persa establecidas.
- Riesgo de alucinacion y salidas degeneradas: al no estar entrenado, las generaciones no son fiables para uso real.
- Sesgos conocidos: no documentados; al heredar la base Qwen2.5-1.5B, podria arrastrar sesgos del donante, pero no se especifica.
- Limitaciones de idioma: solo ingles y persa segun los tags; sin validacion de calidad en persa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado no entrenado hace inviable su uso en produccion sin entrenamiento previo y evaluacion.
- Loader obligatorio: requiere el loader personalizado `dots_tts`; `AutoModel` generico o `trust_remote_code` no son validos segun el autor.
- Verificacion pendiente: no se ha verificado entrenamiento, actualizacion ni reanudacion en ocho NPU Ascend; la ejecucion en Ascend y la calidad held-out EN-to-FA siguen sin verificar.
- Pesos Expression/MoVE inactivos por defecto; deben activarse explicitamente si se usan.
- El donante canonico en BF16 no debe pasar por FP16; hacerlo puede degradar los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/amir0907/dots-s2st-qwen2.5-2b-expanded-initialized
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
