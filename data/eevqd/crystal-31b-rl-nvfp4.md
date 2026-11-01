# eevqd/Crystal-31B-RL-NVFP4

## Resumen

Crystal-31B-RL-NVFP4 es una cuantización NVFP4 (W4A4) del modelo denso Crystal-31B-RL, desarrollado por hiwaifu-research sobre la arquitectura Gemma 4 de Google. El repositorio lo publica el usuario eevqd y su única aportación respecto al modelo original es el cambio de precisión: pesos y activaciones de todas las capas lineales del stack de texto pasan a NVFP4, mientras que embeddings y normalizaciones se mantienen en bf16. El objetivo es reducir el espacio en disco de unos 62 GB a aproximadamente 20 GB y permitir el despliegue en GPUs Blackwell con soporte nativo de FP4.

El modelo está especializado en role-play y conversación multi-turno, con soporte declarado de ruso, inglés, español y portugués. La torre de visión ha sido eliminada, por lo que la exportación es exclusivamente de texto y se carga con la clase `Gemma4ForCausalLM`. La calibración se realizó con 256 conversaciones de role-play multi-turno, mayoritariamente en ruso y de hasta 16k tokens, más prompts cortos de servicio; ese conjunto de calibración no se ha publicado.

Es relevante ahora porque demuestra la viabilidad de servir un modelo de 31B en formato NVFP4 con caché KV en FP8 sobre hardware Blackwell mediante SGLang, un formato que NVIDIA está empujando para inferencia de baja latencia. No obstante, el número real de parámetros del checkpoint safetensors es de 16.053.981.500, muy por debajo de los 31B que sugiere el nombre, un dato que conviene tener en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4, `Gemma4ForCausalLM`, solo texto) |
| Parametros totales | 16.053.981.500 (según safetensors); el nombre comercial indica 31B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue con SGLang (`--context-length 32768`) |
| Tipos de cuantizacion | NVFP4 (W4A4) en todas las capas lineales del stack de texto; embeddings y norms en bf16; caché KV en FP8 (`kv_fp8_cast`) |
| Idiomas soportados | ruso, inglés, español, portugués |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export NVIDIA ModelOpt 0.47, `nvfp4_default`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Gemma 4 de Google, en su variante de 31B según la nomenclatura del modelo original. Esta exportación concreta sustituye todas las capas `Linear` del stack de texto por capas NVFP4 con escalas de bloque por peso seleccionadas mediante búsqueda MSE, mantiene embeddings y normalizaciones en bf16 y utiliza una caché KV en FP8 sin escalas KV (`kv_fp8_cast`). La torre de visión se ha eliminado y la configuración corresponde a la versión de texto publicada por Google.

El entrenamiento original (RL, según el sufijo del nombre) corresponde a hiwaifu-research y no se detalla en la información disponible: no se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta esta ficha es el proceso de cuantización: exportación con NVIDIA ModelOpt 0.47, calibración con 256 conversaciones de role-play multi-turno (mayoritariamente en ruso, hasta 16k tokens cada una) y prompts cortos de servicio. Se conservan la plantilla de chat y el `generation_config.json` del modelo original (temperatura 0.8, top-p 0.95, top-k 64).

## Capacidades

- Generación de texto conversacional y role-play multi-turno, que es el dominio para el que se calibró la cuantización.
- Conversaciones de contexto largo: el ejemplo de despliegue configura 32.768 tokens de ventana.
- Multilingüe en ruso, inglés, español y portugués.
- Razonamiento y generación de código: no se documentan explícitamente en la información disponible; al derivar de un Gemma 4 de texto, es plausible que conserve capacidades generales, pero no hay confirmación del autor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible; la torre de visión ha sido eliminada en esta exportación.

## Casos de uso

- Role-play y personajes conversacionales: es el caso de uso principal y el que guio la calibración (conversaciones multi-turno en ruso de hasta 16k tokens). El modelo conserva la plantilla de chat y los parámetros de muestreo del original, lo que facilita reproducir el comportamiento previsto.
- Despliegue en GPUs Blackwell con FP4 nativo: la exportación NVFP4 está pensada para tarjetas RTX PRO Blackwell y SGLang 0.5.20, donde el formato reduce el espacio en disco de 62 GB a unos 20 GB y habilita inferencia de baja precisión con soporte hardware.
- Servicio de chat multi-turno con contexto largo: con 32.768 tokens de ventana y caché KV en FP8, encaja en aplicaciones de conversación prolongada donde el historial crece y se necesita mantener la coherencia.
- Asistentes en ruso, español o portugués: el soporte declarado de estos idiomas permite usarlo en atención conversacional regionalizada, aunque la calibración se hizo mayoritariamente en ruso.
- Prototipado e investigación sobre cuantización: al ser una exportación ModelOpt reproducible con receta documentada (MSE para escalas, `kv_fp8_cast`, calibración con role-play), sirve como referencia para estudiar el impacto de NVFP4 en modelos conversacionales.
- Inferencia en entornos con VRAM limitada frente al modelo original: la reducción de huella permite alojar el modelo en configuraciones de una sola GPU que no admitirían el checkpoint bf16 de 62 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,3 GB en disco; con caché KV en FP8 y contexto de 32k hay que sumar varios GB adicionales, por lo que conviene reservar al menos 24-32 GB de VRAM según longitud de contexto y lote.
- GPU recomendadas: tarjetas Blackwell con soporte FP4, como las RTX PRO Blackwell citadas por el autor. El formato NVFP4 requiere hardware compatible para aprovechar la aceleración.
- GPU de consumo: no hay confirmación de funcionamiento en RTX 4090 u otras GPUs sin soporte FP4 nativo; el autor solo documenta pruebas en Blackwell.
- Opciones de despliegue: SGLang 0.5.20 con `--language-model-only`, `--context-length 32768`, `--kv-cache-dtype fp8_e4m3` y `--swa-full-tokens-ratio 0.15`. Se requiere un parche de dos líneas en SGLang 0.5.20 para aceptar `Gemma4ForCausalLM` con ese flag. No se documentan vLLM, llama.cpp ni Ollama para este checkpoint.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Crystal-31B-RL-NVFP4 | 16,05B (safetensors) | 32.768 tokens (config. de despliegue) | NVFP4 W4A4, safetensors | Apache 2.0 | Solo texto, calibrado para role-play, requiere Blackwell |
| hiwaifu-research/Crystal-31B-RL | no disponible | no disponible | bf16 (modelo original) | Apache 2.0 | Modelo base; ~62 GB en disco, incluye torre de visión |
| Gemma 4 31B (Google) | no disponible | no disponible | bf16 | Gemma 4 (según el autor, Apache 2.0) | Modelo de referencia del que deriva la familia |

## Limitaciones y advertencias

- El nombre indica 31B pero el checkpoint safetensors declara 16.053.981.500 parámetros; verifica el tamaño real antes de dimensionar hardware.
- La cuantización NVFP4 puede degradar la calidad respecto al modelo bf16 original; el autor no publica evaluaciones comparativas que cuantifiquen esa pérdida.
- La calibración se hizo mayoritariamente en ruso y con conversaciones de role-play; el rendimiento en español, portugués o inglés, y en tareas ajenas al role-play, puede ser inferior al del modelo original.
- La torre de visión está eliminada: no admite entradas de imagen.
- El conjunto de calibración no se ha publicado, lo que dificulta reproducir la cuantización.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un modelo conversacional sin datos de evaluación publicados, conviene validarlo en el dominio de producción.
- El despliegue documentado exige SGLang 0.5.20 con un parche manual y hardware Blackwell; no hay soporte confirmado en otras pilas de inferencia.
- Licencia Apache 2.0 según el autor, heredada del modelo original y de Gemma 4; conviene verificar los términos de Gemma 4 antes de un uso comercial.

## Enlaces

- [HuggingFace: eevqd/Crystal-31B-RL-NVFP4](https://huggingface.co/eevqd/Crystal-31B-RL-NVFP4)
- [Modelo base: hiwaifu-research/Crystal-31B-RL](https://huggingface.co/hiwaifu-research/Crystal-31B-RL)
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
