# pipenetwork/Ternary-Bonsai-2-27B-MLX-8bit

## Resumen

Ternary-Bonsai-2-27B-MLX-8bit es una conversión a formato MLX de 8 bits del modelo Ternary-Bonsai-2-27B de prism-ml, una versión ternarizada de un modelo multimodal de 27.356.728.560 parámetros (27,36 mil millones) con torre de visión. La arquitectura subyacente es `qwen3_5`, un híbrido de 64 capas que combina Gated-DeltaNet con atención completa cada cuatro capas, y sigue una pipeline `image-text-to-text`. El trabajo lo publica el usuario pipenetwork, no prism-ml, y su aportación concreta es desplegar la rotación de Hadamard por bloques de vuelta a la base de pesos estándar.

Ese despliegue es la clave técnica del repositorio. La versión oficial en 2 bits de prism-ml almacena los pesos ya rotados y exige su runtime propio, que transforma las activaciones para que coincidan. Esta build, en cambio, presenta los pesos en base estándar, de modo que carga en `mlx-vlm` sin modificaciones (versión 0.7 o superior), sin kernels bifurcados ni runtime a medida. El autor verifica que el desplegado es exacto: `refold(unfold(W))` es idéntico bit a bit en fp32 y el contrato de plegado se comprobó contra el runtime original.

La relevancia práctica es que abre el modelo a herramientas estándar, ajuste fino y conversiones posteriores, a cambio de ocupar 29,5 GB frente a los 8,6 GB de la versión 2 bits. La cuantización es afín de 8 bits con grupo 64 y, según las mediciones del autor, resulta estadísticamente indistinguible de bf16 con un 54 % del tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5` híbrida de 64 capas: Gated-DeltaNet con atención completa cada cuatro capas, más torre de visión |
| Parámetros totales | 27.356.728.560 (27,36 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits afín con grupo 64 en este repositorio; la familia incluye builds de 2, 4, 6 y 8 bits, además de bf16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (misma que el modelo base; se incluye el NOTICE.txt original) |
| Formato de pesos | safetensors en formato MLX (`mlx` como `library_name`) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf (relación: cuantizado) |
| Pipeline | `image-text-to-text` |
| Tamaño del repositorio | 29,5 GB |
| Runtime requerido | `mlx-vlm` ≥ 0.7 sobre Apple Silicon |
| Fecha de creación en HuggingFace | 2026-09-18 |

## Arquitectura y entrenamiento

La model card describe el modelo base como un Qwen3.8-27B ternarizado de 64 capas con arquitectura híbrida `qwen3_5`: capas Gated-DeltaNet (un modelo de espacio de estados con compuertas) combinadas con atención completa cada cuatro capas, e incorporando la torre de visión oficial. Esta combinación persigue reducir el coste del mecanismo de atención en la mayor parte de la profundidad de la red manteniendo atención densa a intervalos regulares, lo que habilita entradas de imagen junto con texto. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica de esta build no está en el entrenamiento sino en la ingeniería de conversión. prism-ml aplica una rotación de Hadamard por bloques antes de ternarizar, y su runtime transforma las activaciones para compensar esa rotación. pipenetwork invierte el proceso y devuelve los pesos a la base estándar, de modo que las activaciones convencionales de `mlx-vlm` funcionan sin cambios. El autor documenta que el contrato de plegado se validó contra el runtime original en lugar de asumirse, y señala como prueba de sensibilidad que aplicar el vector de signo en el orden incorrecto desplaza los logits en 7,4. La cuantización final es afín de 8 bits con grupo 64.

## Capacidades

- Generación de texto conversacional (`conversational` está entre las etiquetas del repositorio).
- Comprensión de imagen y texto combinados: la pipeline declarada es `image-text-to-text` y la torre de visión se verificó de extremo a extremo según la model card.
- Razonamiento y generación sobre el backbone híbrido SSM/atención de 64 capas.
- Carga directa mediante `mlx_vlm.load` y `mlx_vlm.generate`, sin código de runtime personalizado.
- Compatibilidad con herramientas estándar del ecosistema MLX para ajuste fino y conversión a otros formatos.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Soporte de tool calling, function calling y flujos de agente multi-paso: no documentado en la información disponible.
- Modo de razonamiento explícito (*thinking*), audio u otras modalidades: no documentado.

## Casos de uso

- Inferencia multimodal local en Mac: el modelo procesa pares imagen-texto en Apple Silicon sin GPU discreta ni servicios en la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad sobre las imágenes analizadas.
- Asistente conversacional privado: al ejecutarse íntegramente en el equipo, permite conversaciones multi-turno sobre documentos internos sin enviar datos a terceros.
- Análisis de capturas de pantalla e interfaces: la torre de visión permite extraer descripciones y estructuras de imágenes de UI, útil para documentación automática o auditoría de accesibilidad.
- Digitalización de formularios y facturas: combinando OCR externo con la comprensión visual del modelo se pueden extraer campos y validar su coherencia a partir de la imagen original.
- Investigación sobre ternarización y cuantización: al estar los pesos en base estándar, el repositorio sirve como punto de partida para estudiar el impacto de distintas cuantizaciones comparando las builds de 2, 4, 6 y 8 bits bajo un mismo runtime.
- Ajuste fino y adaptación de dominio: el formato safetensors estándar y la ausencia de kernels a medida facilitan el entrenamiento de adaptadores sobre el modelo.
- Conversión a otros ecosistemas: al no depender de un runtime propietario, los pesos se pueden convertir hacia GGUF u otros formatos para desplegarlos con llama.cpp u otras herramientas.
- Evaluación comparativa de fidelidad: sirve como referencia en base estándar para medir cuánto se desvía una build ternarizada o rotada respecto al modelo sin cuantizar.

## Benchmarks y rendimiento

El repositorio solo publica mediciones de perplejidad y de fidelidad respecto al runtime original. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de visión en la información disponible.

Perplejidad sobre wikitext-2 (test, 296.815 tokens, ventanas idénticas a través de `mlx-vlm` estándar):

| Build | Tamaño | Perplejidad |
|---|---:|---:|
| prism 2 bits, con su runtime | 8,6 GB | 8,9607 |
| bf16 (referencia sin cuantizar) | 54,7 GB | 8,9679 |
| 8 bits (este repositorio) | 29,5 GB | 8,9636 |
| 6 bits | 22,8 GB | 8,9548 |
| 4 bits | 16,1 GB | 9,1497 |

Fidelidad frente al pack de 2 bits de prism-ml ejecutado con su propio runtime, con los mismos prompts y 81 posiciones:

| Métrica | Valor |
|---|---|
| Máximo \|Δlogit\| | 0,22 sobre una escala de ±20 |
| Similitud coseno | 0,99999 |
| Coincidencia de argmax | 96,7–100 % (100 % en fp16, el dtype de activación del runtime original) |
| Ratio de perplejidad emparejado (145 ventanas de wikitext-2) | 0,9992, con intervalo [0,9990, 0,9994] |

Según el autor, las builds de 8 y 6 bits son estadísticamente indistinguibles de bf16, mientras que la de 4 bits cuesta un 2,1 % adicional de perplejidad y es la única con pérdida medible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 29,5 GB, por lo que se necesita memoria unificada por encima de esa cifra, con margen para el contexto, el procesador de visión y las activaciones.
- Plataforma: exclusivamente Apple Silicon. MLX no se ejecuta sobre CUDA, de modo que GPU como A100, H100 o RTX 4090 no son aplicables a este repositorio.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente (perfiles de gama alta con 32 GB o más). No es viable en Mac con 16 GB ni en configuraciones por debajo del tamaño de los pesos.
- Alternativas para hardware limitado: las builds de 6 bits (22,8 GB), 4 bits (16,1 GB) y, sobre todo, el pack de 2 bits de prism-ml (8,6 GB), aunque este último exige su runtime propio.
- Opciones de despliegue: `mlx-vlm` en versión 0.7 o superior. Los ejemplos de `llama.cpp`, Ollama, vLLM o TGI no aplican a este repositorio concreto por estar en formato MLX, aunque el modelo base existe en GGUF y podría emplearse con esos runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación más pertinente es dentro de la propia familia, ya que no se dispone de datos de modelos externos equivalentes en la información proporcionada.

| Build | Tamaño | Perplejidad (wikitext-2) | Runtime | Carga en herramientas estándar |
|---|---:|---:|---|---|
| prism 2 bits (`prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`) | 8,6 GB | 8,9607 | Runtime propio de prism-ml | No |
| 8 bits (este repositorio) | 29,5 GB | 8,9636 | `mlx-vlm` ≥ 0.7 | Sí |
| 6 bits | 22,8 GB | 8,9548 | `mlx-vlm` ≥ 0.7 | Sí |
| 4 bits | 16,1 GB | 9,1497 | `mlx-vlm` ≥ 0.7 | Sí |
| bf16 | 54,7 GB | 8,9679 | `mlx-vlm` ≥ 0.7 | Sí |

Comparación con alternativas de otros autores del mismo tamaño o tarea: no disponible.

## Limitaciones y advertencias

- Dependencia de plataforma: el repositorio es MLX y requiere Apple Silicon; queda fuera de cualquier flota basada en CUDA.
- Versión mínima de runtime: se exige `mlx-vlm` ≥ 0.7, ya que las versiones anteriores aplican un doble desplazamiento a las normalizaciones de `qwen3_5`.
- Eficiencia no óptima: con 29,5 GB, esta build no es el punto de eficiencia de la familia; el pack de 2 bits de prism-ml ocupa 8,6 GB con perplejidad prácticamente idéntica, a cambio de atarse a su runtime.
- Muestra de validación limitada: las métricas de fidelidad se obtuvieron sobre 81 posiciones y 145 ventanas de wikitext-2, un alcance reducido que no cubre tareas generativas abiertas, código ni visión.
- Ausencia de benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni de evaluación visual publicados en la información disponible.
- Idiomas y longitud de contexto sin declarar: el repositorio no especifica ninguno de los dos, lo que impide garantizar comportamiento en contextos largos o en idiomas distintos del inglés.
- Riesgo de alucinación: no documentado específicamente para este modelo; aplican los sesgos y errores propios del modelo base ternarizado.
- Madurez del artefacto: se trata de una conversión de un tercero (pipenetwork), no de una publicación oficial de prism-ml, y el repositorio registra 0 descargas y 0 *likes*, por lo que no cuenta con validación de la comunidad.
- Anomalía de metadatos: la fecha de creación registrada en HuggingFace es 2026-09-18, posterior a la fecha de consulta habitual, lo que conviene verificar antes de integrar el artefacto en un pipeline.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a conservar el NOTICE.txt incluido. La información proporcionada no menciona restricciones adicionales.
- Fidelidad medida contra un runtime concreto: las cifras de similitud se calcularon frente al pack de 2 bits con el runtime de prism-ml, no frente al modelo original sin ternarizar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-8bit
- Modelo base en GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Pack oficial de 2 bits de prism-ml: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Build bf16 del mismo autor: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-bf16
- Build de 6 bits del mismo autor: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-6bit
- Build de 4 bits del mismo autor: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-4bit
- Código de conversión: https://github.com/PipeNetwork/bonsai2-mlx

Nota sobre la búsqueda web: los resultados devueltos corresponden a portales de noticias croatas (jutarnji.hr y similares) sin relación alguna con el modelo, por lo que no aportan enlaces adicionales utilizables.
