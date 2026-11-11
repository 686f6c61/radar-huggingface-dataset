# Sawfwair/MiniMax-H3-Image-MLX-8bit

## Resumen

MiniMax-H3-Image-MLX-8bit es una exportación cuantizada del modelo de difusión MiniMax-H3-Image, desarrollado originalmente por MiniMaxAI y redistribuido por el usuario Sawfwair en formato nativo MLX para macOS (Apple Silicon). El modelo resuelve tareas de generación de imágenes a partir de texto (text-to-image) y edición de imágenes por referencia, y su relevancia radica en que permite ejecutar un modelo de imagen de gran tamaño en hardware Apple mediante cuantización affine de 8 bits, algo que los pesos originales en FP32/FP16 hacen inviable en equipos de consumo.

La exportación aplica cuantización affine de 8 bits con grupos de 64 sobre los pesos del transformer, conserva el VAE en FP32 y mantiene las capas del codificador de texto necesarias para el condicionamiento de imagen. El repositorio ocupa aproximadamente 52 GB, lo que refleja el tamaño considerable del modelo base y de sus componentes auxiliares.

La licencia es restrictiva: la MiniMax-H3-Image Community License Agreement excluye explícitamente Estados Unidos, Unión Europea, Reino Unido y República de Corea, lo que limita seriamente su uso en esos territorios. No se dispone de información sobre el número exacto de parámetros, la longitud de contexto textual ni los idiomas soportados en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (text-to-image) con transformer, VAE y codificador de texto; exportación MLX con cuantización affine |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8 bits (q8) con grupos de 64; VAE en FP32 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (uso restringido por territorio) |
| Formato de pesos | safetensors (MLX, affine-q8) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de difusión para generación de imágenes condicionada por texto, compuesto por un transformer de difusión, un VAE (mantenido en FP32 en esta exportación para preservar la fidelidad de reconstrucción) y un codificador de texto que aporta el condicionamiento semántico. La exportación emplea un esquema de muestreo denominado PDD de seis pasos, con salidas AdaLN exactas y cabezas de salida PDD fusionadas, lo que reduce el número de evaluaciones del modelo necesarias para producir una imagen.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La exportación se ancla al checkpoint fuente en la revisión `492fd8c4eca666f1085f57e30738c1e0d86b3439` del repositorio oficial de MiniMaxAI, y el autor documenta los cambios aplicados en los ficheros MODIFICATIONS.md y SOURCE_MANIFEST.json. La innovación técnica destacable es la cuantización affine de 8 bits con grupos de 64, que reduce el peso del modelo manteniendo el VAE en FP32 y preservando las capas del codificador de texto necesarias para el condicionamiento.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de salida de hasta 4K documentada.
- Edición de imágenes por referencia (reference editing), según la model card.
- Muestreo PDD de seis pasos con salidas AdaLN exactas, orientado a reducir el coste computacional por imagen.
- Condicionamiento de texto mediante codificador de texto incluido en la exportación.
- Ejecución nativa en MLX sobre Apple Silicon, con integración en el runtime mere.run.
- No se documenta soporte de tool calling, function calling, agentes, visión de entrada ni audio en la información disponible.

## Casos de uso

- Generación de imágenes de estudio en resolución 4K: el modelo permite producir imágenes de hasta 4096x4096 píxeles con un único prompt y semilla, adecuado para material promocional o fotografía sintética de alta resolución en equipos Apple Silicon.
- Edición de imágenes por referencia: útil para flujos de retoque o variación de una imagen existente manteniendo coherencia con la referencia aportada, gracias a la capacidad de reference editing documentada.
- Prototipado creativo en local: al ejecutarse en MLX sobre macOS, permite iterar sobre prompts sin depender de servicios en la nube, siempre que el territorio de uso esté permitido por la licencia.
- Producción de material visual para documentación técnica: la generación controlada por semilla facilita la reproducibilidad de imágenes en pipelines de documentación.
- Investigación en cuantización de modelos de difusión: la exportación sirve como referencia para estudiar el impacto de la cuantización affine q8 con grupos de 64 en la calidad de imagen frente a pesos FP32.
- Integración en herramientas de escritorio para macOS: mediante el runtime mere.run, el modelo puede incorporarse a aplicaciones locales de generación de imágenes con comandos CLI documentados.

## Benchmarks y rendimiento

La model card reporta una única medición de cualificación en un Apple M5 Max: la petición 4K en caliente más rápida observada tardó 229,5 segundos con un pico de sesión de 26,1 GiB. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | Valor | Hardware |
|---|---|---|
| Latencia 4K text-to-image (caliente) | 229,5 s | Apple M5 Max |
| Pico de memoria de sesión | 26,1 GiB | Apple M5 Max |
| Resoluciones cualificadas | 2K y 4K | Apple M5 Max |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el pico de sesión documentado es de 26,1 GiB en un M5 Max, aunque el repositorio completo ocupa 52 GB en disco.
- Hardware validado: Apple M5 Max (memoria unificada), único equipo documentado en la model card.
- GPU NVIDIA: no se documenta soporte; la exportación es nativa MLX, orientada a Apple Silicon.
- Cabe en GPU de consumo: no hay datos para GPUs NVIDIA; en Apple Silicon requiere equipos con memoria unificada suficiente (el pico medido de 26,1 GiB sugiere configuraciones de 32 GB o superiores).
- Opciones de despliegue: runtime mere.run (comandos `mere.run model pull` y `mere.run image generate`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 229,5 s por imagen 4K en caliente en M5 Max; no se documentan cifras para 2K ni para otros equipos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con otros modelos de difusión ni datos de rendimiento frente a alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image-MLX-8bit | no disponible | no disponible | MiniMax-H3-Image Community License (excluye EE. UU., UE, Reino Unido y Corea del Sur) | Hugging Face, MLX |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Restricción territorial severa: la licencia excluye explícitamente Estados Unidos, Unión Europea, Reino Unido y República de Corea, por lo que el uso, descarga y redistribución no están permitidos en esos territorios.
- Requisito de aceptación de licencia: el uso exige revisar y aceptar la MiniMax-H3-Image Community License Agreement y su Acceptable Use Policy, con obligaciones de redistribución para usos downstream.
- Riesgo de alucinación visual: como modelo generativo de imágenes, puede producir contenido incoherente o no fiel al prompt; no se documentan métricas de fidelidad.
- Sesgos: no se documenta información sobre sesgos demográficos, culturales o de representación en la información disponible.
- Cobertura idiomática: no se especifican los idiomas soportados por el codificador de texto.
- Validación limitada: la cualificación se realizó con un único prompt y semilla en un único equipo (M5 Max), por lo que el rendimiento en otros escenarios no está verificado.
- Dependencia de hardware: la exportación es específica de MLX y Apple Silicon; no es portable a ecosistemas CUDA sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sawfwair/MiniMax-H3-Image-MLX-8bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Checkpoint fuente (revisión fijada): https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/tree/492fd8c4eca666f1085f57e30738c1e0d86b3439
- Informe de benchmarks: https://github.com/sawfwair/mere-run/blob/58049b522e9cee1d9ced2e1bc7c4bf7e0aeaf887/docs/benchmarks/minimax-h3-image-m5-nax-2026-11-10.md
- Licencia (referenciada en el repositorio): LICENSE
- Aviso legal: NOTICE
- Modificaciones: MODIFICATIONS.md
- Manifiesto de origen: SOURCE_MANIFEST.json
- Sumas de verificación: SHA256SUMS
