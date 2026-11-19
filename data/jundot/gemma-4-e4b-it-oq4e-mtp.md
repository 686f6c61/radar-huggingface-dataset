# Jundot/gemma-4-E4B-it-oQ4e-mtp

## Resumen

gemma-4-E4B-it-oQ4e-mtp es una cuantización de 4 bits del modelo Gemma 4 E4B en su variante instruida (it), publicada por el usuario Jundot mediante la herramienta oQ de oMLX v0.8.0. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor toma los pesos originales de Gemma 4 E4B-it y los recomprime con una técnica de cuantización de precisión mixta y redondeo refinado (oQe) que, según la model card, reduce el error de cuantización manteniendo el mismo tamano y velocidad que una cuantización de 4 bits convencional. El resultado se distribuye en formato MLX safetensors, es decir, orientado a la inferencia en Apple Silicon a través del framework MLX.

El repositorio contiene 8.019.880.782 parámetros almacenados y ocupa 11,0 GB, lo que encaja con un modelo de aproximadamente 8B parámetros comprimido a 4 bits con grupo de tamano 64 y pesos residuales de precisión mixta. La nomenclatura "E4B" del modelo base sugiere una variante de eficiencia dentro de la familia Gemma 4, aunque la información disponible no permite confirmar la arquitectura exacta ni el contexto nativo del modelo original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia Gemma 4 en hardware de consumo Apple (Mac con chip M-series) sin renunciar a una calidad cercana a la del modelo original, gracias a la cuantización mixta. No obstante, al ser un artefacto de terceros, hereda las limitaciones e incertidumbres del modelo base y anade las propias de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, tipo gemma4; arquitectura exacta no especificada) |
| Parametros totales | 8.019.880.782 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta oQe |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Gemma 4 E4B-it. Por la nomenclatura y por el tag `gemma4` de la model card, se trata de un modelo de la familia Gemma 4 de Google, en su variante E4B y en version instruida. No se especifica si emplea un transformer denso, un esquema Mixture-of-Experts o una arquitectura híbrida; tampoco se indica el numero de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Todo ello debe considerarse "no disponible" en esta ficha.

Lo que si esta documentado es el proceso de cuantización. El autor aplica oQ (oMLX v0.8.0), una cuantización de precisión mixta con redondeo oQe refinado (referencias jundot/omlx#4930 y #5292). Según la model card, la versión actualizada el 2026-11-19 reduce el error de cuantización respecto a versiones anteriores al mismo tamano y velocidad. El resultado se serializa en safetensors compatibles con MLX, con 4 bits y grupo de 64, lo que permite cargar el modelo directamente en el runtime de MLX sobre Apple Silicon.

## Capacidades

- Generación de texto en modo conversacional (variante `-it`, instruida).
- Razonamiento y respuesta a instrucciones, heredado del modelo base Gemma 4 E4B-it.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo "thinking": no disponibles en la información proporcionada.
- Ejecución nativa en Apple Silicon mediante MLX, con pesos ya cuantizados a 4 bits.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede cargarse con MLX en un equipo Apple Silicon y mantener conversaciones multi-turno sin conexión a Internet, aprovechando el formato safetensors MLX y el tamano reducido de 11 GB.
- Prototipado rapido de aplicaciones de IA generativa: al ser un artefacto de 4 bits listo para MLX, permite iterar sobre prompts y flujos conversacionales en un portátil sin necesidad de GPU dedicada.
- Generación de texto asistida en entornos de desarrollo: integrable en scripts Python que usen `mlx-lm` para tareas de redacción, resumen o transformación de texto dentro de un pipeline local.
- Evaluación comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de una cuantización oQe de 4 bits frente al modelo Gemma 4 E4B-it original en tareas concretas.
- Despliegue en estaciones de trabajo Apple para tareas de clasificación y extracción de información: el modelo puede procesar lotes de documentos localmente, manteniendo los datos en el dispositivo.
- Base para fine-tuning ligero o adaptadores: al estar en safetensors MLX, puede servir como punto de partida para experimentos de ajuste con LoRA en hardware Apple, siempre que la licencia del modelo base lo permita (no confirmada en esta ficha).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la cuantización oQe reduce el error de cuantización respecto a versiones anteriores "al mismo tamano y velocidad", sin aportar cifras de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repo ocupa 11,0 GB; para inferencia en MLX se recomienda al menos 16 GB de memoria unificada, y 24 GB o más para trabajar con contexto largo y margen de seguridad.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con MLX. No esta pensado para CUDA ni para GPUs NVIDIA (A100, H100, RTX 4090) sin conversion previa de formato.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior; en Mac con 8 GB es probable que no quepa con comodidad.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/gemma-4-E4B-it-oQ4e-mtp | 8.019.880.782 (4 bits) | no disponible | MLX safetensors | no disponible | Hugging Face, 26.161 descargas |
| Gemma 4 E4B-it (original, sin cuantizar) | no disponible | no disponible | safetensors | no disponible | no disponible en la informacion |
| Otras cuantizaciones MLX de Gemma 4 E4B-it | no disponible | no disponible | MLX safetensors | no disponible | no disponible en la informacion |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas concretas; la comparativa se limita a lo anteriormente indicado.

## Limitaciones y advertencias

- Es un artefacto de cuantización de terceros: no lo publica Google ni el equipo de Gemma, por lo que no cuenta con el respaldo oficial del modelo base.
- La cuantización a 4 bits introduce perdida de calidad respecto al modelo original; el autor afirma que oQe la reduce, pero no aporta métricas que lo cuantifiquen.
- La licencia no esta indicada en la información disponible; antes de un uso comercial debe verificarse la licencia del modelo base Gemma 4 E4B-it y los terminos de la cuantización.
- No se especifican idiomas soportados; el comportamiento multilingüe no puede garantizarse a partir de esta ficha.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas para esta cuantización.
- La fecha de creación (2026-07-30) y la actualización (2026-11-19) indican que es un artefacto reciente; conviene revisar la model card por si se publican nuevas revisiones.
- El formato MLX safetensors limita su uso a Apple Silicon; no es directamente utilizable en GPUs NVIDIA sin conversion.
- No se dispone de información sobre sesgos, contexto maximo ni restricciones de uso adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/gemma-4-E4B-it-oQ4e-mtp
- Repositorio oMLX: https://github.com/jundot/omlx
- PR de mejora oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
