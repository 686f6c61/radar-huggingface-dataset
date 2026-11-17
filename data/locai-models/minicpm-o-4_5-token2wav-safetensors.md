# locai-models/MiniCPM-o-4_5-token2wav-safetensors

## Resumen

`locai-models/MiniCPM-o-4_5-token2wav-safetensors` no es un modelo de lenguaje completo, sino un repositorio derivado que contiene exclusivamente los pesos del módulo de síntesis de voz (token2wav) del modelo multimodal MiniCPM-o 4.5 de OpenBMB, convertidos del formato original PyTorch (`.pt`) a `safetensors`. Incluye los checkpoints del flujo (flow) y del vocoder HiFT, además de una caché del prompt de sistema por defecto y un recibo de preparación (`preparation.json`) con hashes SHA-256 de todos los ficheros.

El repositorio lo mantiene LocAI y está pensado para completar sus perfiles de despliegue locales sobre Apple Metal (generación, OCR, transcripción y síntesis de voz), empaquetados como `prepared-minicpmo45-q8-f16`. No contiene los pesos del transformer principal ni del codificador visual/audio: esos se obtienen del repositorio upstream `openbmb/MiniCPM-o-4_5` en la revisión fijada `503e754207c94da6bb26850b4469f367c9ea3582`.

Su relevancia es acotada pero práctica: elimina la dependencia de `pickle` en la carga del módulo TTS, lo que facilita despliegues con controles de seguridad más estrictos (por ejemplo, entornos que bloquean la deserialización arbitraria de Python) y permite verificar la integridad de los artefactos mediante hashes. El tamaño total del repo es de aproximadamente 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo token2wav de MiniCPM-o 4.5: flow matching (flow) + vocoder HiFT; pesos convertidos a safetensors |
| Parametros totales | No disponible (el repo contiene solo los pesos del modulo TTS, no del LLM) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los perfiles de LocAI referencian Q8/F16, pero el repo no documenta cuantizaciones propias) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (`flow.safetensors`, `hift.safetensors`, `system_default_prompt.safetensors`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión de formato de los artefactos `assets/token2wav/flow.pt` (623.278.352 bytes) y `assets/token2wav/hift.pt` (83.321.916 bytes) del modelo base, más un fichero `system_default_prompt.safetensors` de 273.808 bytes. El pipeline de conversión se ejecutó con Python 3.12, torch 2.8.0, torchaudio 2.8.0, onnxruntime 1.21.0, safetensors 0.5.3 y numpy 1.26.4, usando el script `tools/qualification/prepare_minicpmo.py` de LocAI (commit `a010f6b5e8431806b76403d2ca6c2445257fa41f`) en modo offline.

El módulo token2wav es el componente de síntesis de voz del sistema MiniCPM-o 4.5: un modelo de flow que transforma tokens de audio en representaciones acústicas y un vocoder HiFT que las convierte en waveform. El repositorio también referencia dos artefactos ONNX que no se incluyen aquí y se obtienen del upstream: `campplus.onnx` (embedding de hablante) y `speech_tokenizer_v2_25hz.onnx` (tokenizador de audio a 25 Hz). No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Conversión de tokens de audio a waveform (síntesis de voz) mediante el módulo token2wav del sistema MiniCPM-o 4.5.
- Integración en los perfiles de despliegue de LocAI para Apple Metal: `generate`, `ocr`, `synthesize` (v5 y v6) y `transcribe`.
- Carga segura de pesos sin `pickle`, al usar safetensors.
- Verificación de integridad de artefactos mediante SHA-256 documentados en el README y en `preparation.json`.
- El modelo base MiniCPM-o 4.5 es multimodal (texto, visión y audio), pero las capacidades del LLM no residen en este repositorio.

## Casos de uso

- Síntesis de voz en local sobre Apple Silicon: el módulo token2wav permite generar audio a partir de tokens en perfiles Metal, útil para asistentes de voz que deban funcionar sin conexión.
- Despliegue en entornos con políticas estrictas de deserialización: al sustituir los `.pt` por safetensors, se evita la carga de pickles arbitrarios en pipelines de CI/CD o en infraestructura con controles de seguridad.
- Verificación de cadena de suministro: los hashes SHA-256 de cada fichero y del script de preparación permiten auditar que los artefactos desplegados coinciden con los esperados.
- Reproducibilidad de builds: la receta documentada (versiones fijadas de torch, onnxruntime, safetensors y numpy) permite regenerar los artefactos de forma determinista.
- Integración en pipelines de transcripción y OCR con salida de voz: combinado con los otros perfiles de LocAI, se puede construir un flujo completo de lectura de documentos con respuesta hablada.
- Empaquetado de modelos para distribución: el formato safetensors y los perfiles nombrados facilitan publicar packs de despliegue con integridad verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio README indica explícitamente que se trata de una conversión de formato sin afirmación de calidad ("no quality claim") y que no se ejecutó ninguna evaluación para producirla.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el repo ocupa 0,7 GB en disco, pero el sistema completo MiniCPM-o 4.5 requiere cargar además el LLM y los codificadores del upstream.
- GPU recomendadas: no disponible en la información proporcionada; los perfiles de LocAI apuntan a Apple Metal (Apple Silicon), no a GPU NVIDIA.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: perfiles propios de LocAI (`minicpmo45-q8-f16-apple-metal-*`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| locai-models/MiniCPM-o-4_5-token2wav-safetensors | Pesos TTS derivados (safetensors) | No disponible (solo modulo token2wav) | No disponible | Apache-2.0 | Hugging Face (0 descargas) |
| openbmb/MiniCPM-o-4_5 | Modelo multimodal completo (upstream) | No disponible en la informacion | No disponible | Apache-2.0 | Hugging Face |
| Alternativas TTS de codigo abierto (p. ej. vocoders HiFi-GAN) | Modulo TTS | No disponible | No aplica | Variables | Hugging Face / repos |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: sin los pesos del LLM y los codificadores del upstream `openbmb/MiniCPM-o-4_5`, este repositorio no puede ejecutar inferencia por sí solo.
- Sin evaluación de calidad: el autor declara explícitamente que no se ejecutó ninguna evaluación; no hay garantía de que la conversión preserve el comportamiento exacto del original más allá de la equivalencia numérica esperada.
- Idiomas soportados no documentados en este repositorio; dependen del modelo base.
- Riesgo de alucinación y sesgos: no evaluados en este artefacto; aplican los del modelo base, no documentados aquí.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el `LICENSE` y el `NOTICE` incluidos, y respetarse la licencia del upstream.
- Dependencia de revisiones fijadas: los ficheros no incluidos se obtienen del upstream en la revisión `503e754...`; un cambio de esa revisión rompería la reproducibilidad.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/locai-models/MiniCPM-o-4_5-token2wav-safetensors
- Modelo base: https://huggingface.co/openbmb/MiniCPM-o-4_5
- Repositorio del modelo base en GitHub (OpenBMB/MiniCPM-V): https://github.com/OpenBMB/MiniCPM-V
- Licencia del modelo base: https://raw.githubusercontent.com/OpenBMB/MiniCPM-V/c130da1b4d07a36a4d69cc77d74163c9d4ef60a5/LICENSE
- Paquete `minicpmo_utils` 1.0.5 (sdist): https://files.pythonhosted.org/packages/c8/70/4913e03395deed2bae4232e7b049aec26bac8c65a7721b5902a5a5237f61/minicpmo_utils-1.0.5.tar.gz
