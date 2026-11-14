# PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-hybrid-attn

## Resumen

PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-hybrid-attn es un artefacto de síntesis de voz (text-to-speech) derivado de Qwen3-TTS, publicado por el usuario PowerBeef02 dentro del proyecto Vocello. No se trata de un modelo entrenado desde cero, sino de un ensamblado tensor a tensor de precisión mixta: parte del artefacto base de 4 bits (PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-4bit) y sustituye los módulos de proyección de autoatención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) de las 28 capas del "talker" por sus equivalentes de 8 bits procedentes del artefacto PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-8bit. No hay recuantización: cada tensor se copia tal cual de su origen.

El modelo declara 2.592.163.904 parámetros reales según los safetensors y un repositorio de 2,2 GB, lo que refleja el peso adicional de 176 MB aportado por los módulos de atención en 8 bits. Está pensado para ejecutarse con la librería mlx-audio sobre hardware Apple Silicon, y su propósito declarado es mejorar la calidad de los clones de voz, las tomas individuales y los proyectos de formato largo respecto al modelo de 4 bits, a cambio de aproximadamente un 5 % más de tiempo de generación.

Su relevancia es acotada pero clara para el nicho de TTS local en Mac: demuestra una técnica de precisión mixta selectiva (atención en 8 bits, resto en 4 bits) que busca un compromiso entre huella de memoria y fidelidad de voz sin necesidad de reentrenar ni recuantizar. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de Qwen3-TTS (text-to-speech con "talker" de 28 capas); arquitectura base no detallada en la informacion disponible |
| Parametros totales | 2.592.163.904 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: affine 4-bit (group size 64) en la mayoria de tensores; affine 8-bit (group size 64) en `self_attn.q_proj`, `k_proj`, `v_proj`, `o_proj` de las 28 capas del talker |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx-audio, tags mlx, 4-bit) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado; es un ensamblado determinista de pesos. La model card indica que todos los tensores proceden del artefacto de 4 bits en la revisión `47ab65f7eda0aad7e1c1a008d9c12d93a10ac475`, excepto las cuatro proyecciones de autoatención del talker en cada una de sus 28 capas, tomadas del artefacto de 8 bits en la revisión `f63ea141cb13df98974a4184cc7c35cb58699af5`. El `config.json` declara explícitamente cada uno de esos módulos bajo la clave `quantization`. Todos los demás tensores, incluido el del predictor de código, proceden del artefacto de 4 bits, igual que el tokenizador de voz y el directorio `marking/`, que contiene el generador AudioSeal de Meta bajo licencia MIT, sin modificar.

La innovación técnica reside en la selección de precisión por módulo: se eleva a 8 bits únicamente la atención del talker, que presumiblemente concentra la sensibilidad para la fidelidad de la voz, dejando el resto en 4 bits. La model card aclara que la elección se hizo mediante cribados automáticos ("machine screens") sobre tomas grabadas antes de escuchar el resultado: ningún humano escuchó las muestras. Las mediciones asociadas se documentan en el repositorio Vocello (`docs/reference/hybrid-model.md`). No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO del modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con pipeline `text-to-speech`.
- Clonación de voz: la model card indica mejor comportamiento que el modelo de 4 bits en clones de voz.
- Generación de tomas individuales ("single takes") con calidad superior al artefacto de 4 bits.
- Generación de audio de formato largo ("long-form projects") con menor tasa de error que el modelo de 4 bits.
- Marcado de audio: incorpora el generador AudioSeal de Meta (MIT) en `marking/`, orientado al watermarking de audio generado.
- Razonamiento, código, matemáticas, visión, tool calling / function calling, agentes y modo thinking: no disponible (no se documentan en la información proporcionada; el modelo es específico de TTS).
- Capacidades multilingües: no disponible (idiomas no declarados).

## Casos de uso

- Clonación de voz para locución sintética: el modelo está ajustado específicamente para mejorar la similitud de clones de voz respecto al artefacto de 4 bits, por lo que resulta adecuado cuando la fidelidad de la identidad vocal es prioritaria y se dispone de hardware Apple Silicon con mlx-audio.
- Producción de audiolibros y narraciones de formato largo: la model card reporta menor tasa de error en proyectos de formato largo que el modelo de 4 bits, lo que lo hace apropiado para generar horas de audio manteniendo coherencia y reduciendo artefactos.
- Generación de tomas individuales en pipelines de contenido: para podcasts, vídeos o anuncios donde cada fragmento se sintetiza por separado, el modelo ofrece mejor calidad que la variante de 4 bits con solo un 5 % más de tiempo de generación.
- Despliegue local en Mac para prototipado de TTS: gracias a mlx-audio y a una huella de 2,2 GB, permite iterar en estaciones de trabajo Apple sin GPU dedicada, integrado en el catálogo de modelos "fail-closed" de Vocello, que fija revisiones exactas y digests SHA-256 por fichero.
- Trazabilidad y cumplimiento en producción de audio: el catálogo de Vocello con revisiones fijadas y hashes por fichero, junto al marcado AudioSeal incluido, facilita auditar qué pesos exactos generaron cada audio y etiquetar el contenido sintético.
- Integración en herramientas de accesibilidad: síntesis de voz personalizada para lectores de pantalla o interfaces de voz, ejecutada localmente en el dispositivo para evitar enviar texto del usuario a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente aporta comparaciones cualitativas internas: mejor que el modelo de 4 bits en clones de voz, tomas individuales y formato largo, con aproximadamente un 5 % más de tiempo de generación; y peor que el modelo completamente en 8 bits en similitud de clones y tasa de error en formato largo. No se proporcionan métricas numéricas (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,2 GB, por lo que la huella de pesos ronda esa cifra y el consumo efectivo depende de la implementación mlx-audio.
- GPU recomendadas: no se indican GPU NVIDIA; el modelo está empaquetado para mlx-audio, lo que implica ejecución en Apple Silicon (familias M1/M2/M3/M4) mediante MLX.
- Compatibilidad con GPU de consumo: no disponible para RTX 4090 u otras GPU NVIDIA en la información proporcionada; el stack declarado es específico de Apple.
- Opciones de despliegue: mlx-audio (librería declarada) y el catálogo de modelos de Vocello, que fija revisiones y digests SHA-256. vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles como cifras absolutas; la model card indica aproximadamente un 5 % más de tiempo de generación que el artefacto de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-hybrid-attn | 2.592.163.904 | Mixta 4/8-bit (atencion en 8-bit) | no disponible | apache-2.0 | Mejor que 4-bit en clones y formato largo; ~5 % mas lento; peor que 8-bit en similitud de clones |
| PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-4bit | no disponible | 4-bit affine, group size 64 | no disponible | apache-2.0 | Referencia de menor huella; peor calidad en clones y formato largo segun la model card |
| PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-8bit | no disponible | 8-bit affine, group size 64 | no disponible | apache-2.0 | Mejor similitud de clones y menor tasa de error en formato largo; mayor huella (176 MB mas de pesos solo en atencion) |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- La selección de precisión mixta se validó mediante cribados automáticos sobre tomas grabadas antes de escucharlas: ningún evaluador humano escuchó las muestras, por lo que la superioridad perceptual declarada no está confirmada por escucha humana.
- El modelo es peor que el artefacto completamente en 8 bits en similitud de clones y tasa de error en formato largo, según la propia model card; no es la opción de máxima fidelidad.
- Es aproximadamente un 5 % más lento en generación que el modelo de 4 bits.
- Dependencia de mlx-audio y del ecosistema MLX: no se documenta soporte para stacks de inferencia habituales en servidores (vLLM, TGI, llama.cpp), lo que limita su despliegue fuera de Apple Silicon.
- Idiomas soportados no declarados: riesgo de comportamiento deficiente en lenguas no cubiertas por el modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo TTS, el riesgo relevante es de pronunciación incorrecta, artefactos acústicos y sesgos de voz heredados del modelo base.
- El modelo base Qwen3-TTS y los artefactos intermedios no documentan aquí sus restricciones de uso comercial más allá de la licencia Apache-2.0; conviene verificar las condiciones del modelo original antes de producción.
- El artefacto AudioSeal en `marking/` está bajo licencia MIT de Meta, distinta de la Apache-2.0 del resto del repositorio; hay que respetar ambas licencias por separado.
- El repositorio tiene solo 32 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy pequeño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-hybrid-attn
- Artefacto base de 4 bits: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-4bit
- Artefacto base de 8 bits: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-Base-8bit
- Repositorio Vocello (mediciones en `docs/reference/hybrid-model.md`): https://github.com/PowerBeef/Vocello
