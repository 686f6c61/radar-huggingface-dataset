# praiselab-picuslab/benchmark-slm-fiven-phi-1_5-clmsft

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre **microsoft/phi-1_5**, el modelo de lenguaje pequeño de 1,3 mil millones de parámetros de Microsoft. Lo publica la organización praiselab-picuslab como parte de un benchmark de *small language models* (tag `benchmark-slm`), aplicando la estrategia de ajuste etiquetada como `clmsft` (supervised fine-tuning con modelado de lenguaje causal) sobre el dataset `fiven`, con orientación al idioma italiano.

No se trata de un modelo completo, sino de un adaptador de bajo rango (PEFT) que debe combinarse con el modelo base para generar texto. Su interés principal es comparativo: permite evaluar cómo afecta esta estrategia de fine-tuning a un SLM compacto en una lengua distinta del inglés, algo relevante para la investigación en adaptación lingüística eficiente de modelos pequeños.

El acceso está restringido (*gated*): es necesario aceptar condiciones en HuggingFace para descargarlo. La licencia no está especificada y no se ha publicado una model card detallada, por lo que varios datos técnicos clave no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre microsoft/phi-1_5 (transformer decoder-only) |
| Parámetros totales | No disponible (el modelo base phi-1_5 tiene ~1,3 mil millones) |
| Parámetros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 2048 tokens (heredada del modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base, microsoft/phi-1_5, es un transformer decoder-only de 1,3 mil millones de parámetros entrenado por Microsoft sobre unos 30 mil millones de tokens de datos con calidad de libro de texto. Sobre este modelo se ha aplicado un adaptador LoRA (Low-Rank Adaptation), que congela los pesos originales y entrena únicamente matrices de bajo rango añadidas, normalmente en las proyecciones de atención y MLP. El rango, el alpha y los módulos objetivo concretos del adaptador no están disponibles en la información publicada.

La estrategia `clmsft` indica un ajuste fino supervisado formulado como modelado de lenguaje causal (causal language modeling supervised fine-tuning). El dataset `fiven` carece de documentación pública en la información proporcionada, por lo que se desconocen su tamaño, composición y procedencia. Tampoco consta si el entrenamiento incluyó etapas de RLHF o DPO.

## Capacidades

- Generación de texto en italiano, según el tag de idioma `it` de la ficha.
- Hereda las capacidades generales del modelo base phi-1_5 (razonamiento básico, algo de código y matemáticas a nivel de libro de texto), aunque el efecto del ajuste en italiano sobre estas capacidades no está documentado.
- Compatible con el ecosistema PEFT de HuggingFace: puede cargarse junto al modelo base, fusionarse con `merge_and_unload()` o combinarse con otros adaptadores.
- No hay evidencia de soporte de tool calling, function calling ni capacidades de agentes.
- No incluye visión, audio ni modo de razonamiento extendido (*thinking mode*).
- Pipeline de text-generation estándar en HuggingFace.

## Casos de uso

- **Benchmarking de estrategias de fine-tuning**: al formar parte de un proyecto de benchmark de SLMs (tags `benchmark-slm`, `or2`, `strategy-clmsft`), sirve para comparar la estrategia CLM-SFT frente a otras estrategias del mismo proyecto aplicadas al mismo dataset y modelo base.
- **Investigación en PEFT y LoRA**: es un caso de estudio práctico para analizar cómo un adaptador de bajo rango modifica el comportamiento de un modelo de 1,3B, con un coste de entrenamiento e inferencia muy reducido.
- **Adaptación lingüística de modelos pequeños**: permite estudiar cómo un modelo de corte anglocéntrico como phi-1_5 se adapta al italiano, midiendo retención de capacidades originales y riesgo de olvido catastrófico.
- **Generación de texto ligera en italiano**: al basarse en un modelo de 1,3B con contexto de 2048 tokens, es adecuado para tareas cortas de redacción o continuación de texto en italiano en hardware modesto.
- **Docencia y prototipado**: su tamaño reducido lo hace idóneo para enseñar LoRA, PEFT y fine-tuning supervisado en laboratorios o tutoriales, ya que cabe en GPUs de consumo e incluso puede ejecutarse en CPU para pruebas.
- **Base para adaptadores adicionales**: puede utilizarse como punto de partida para entrenar adaptadores sucesivos (por ejemplo, para otras lenguas o dominios) reutilizando el mismo modelo base.
- **Evaluación comparativa de SLMs en lenguas romances**: útil como punto de datos en estudios que comparen el rendimiento de modelos pequeños ajustados frente a modelos multilingües nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el tag `benchmark-slm` sugiere que el modelo forma parte de un proyecto de evaluación comparativa, los resultados concretos (MMLU, HumanEval, GSM8K u otros) no constan en la ficha y no deben asumirse los del modelo base, ya que el ajuste puede haberlos modificado.

## Requisitos de hardware

- **VRAM estimada para inferencia** (estimaciones derivadas del tamaño del modelo base de 1,3B; la ficha no especifica cuantizaciones):
  - FP16: ~2,6 GB de pesos, ~4 GB de VRAM con overhead.
  - 8-bit: ~1,5–2 GB de VRAM.
  - 4-bit: ~1–1,5 GB de VRAM.
- **GPUs recomendadas**: cualquier GPU moderna; para el modelo completo en FP16 basta una RTX 3060 de 12 GB o superior, y con cuantización a 4-bit cabe en GPUs de 4–6 GB (RTX 3050, RTX 4060, GTX 1650).
- **Consumer GPUs**: sí, sobradamente; es uno de los segmentos donde este tamaño de modelo es más cómodo. También es viable la inferencia en CPU para pruebas puntuales.
- **Opciones de despliegue**: `transformers` + `peft` (carga del adaptador sobre el modelo base); fusión de pesos con `merge_and_unload()` para exportar un modelo completo; vLLM con soporte de LoRA; TGI con adaptadores PEFT. Para llama.cpp u Ollama sería necesario fusionar y convertir a GGUF, formato no disponible actualmente en el repositorio.
- **Latencia y throughput**: no disponible; al tratarse de un modelo de 1,3B se espera una decodificación rápida en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| praiselab-picuslab/benchmark-slm-fiven-phi-1_5-clmsft | ~1,3B (base) + adaptador LoRA | 2048 | No disponible | Gated en HuggingFace |
| microsoft/phi-1_5 (modelo base) | 1,3B | 2048 | MIT | Abierta |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 | Apache 2.0 | Abierta |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (131.072 con YaRN) | Apache 2.0 | Abierta |

Frente a las alternativas, este adaptador no destaca por rendimiento publicado (no hay benchmarks) ni por licencia (desconocida), sino por su valor como artefacto de investigación sobre estrategias de fine-tuning de SLMs. Para uso productivo general, Qwen2.5-1.5B-Instruct ofrece un contexto mucho mayor y una licencia permisiva.

## Limitaciones y advertencias

- **Licencia no disponible**: sin licencia explícita, el uso comercial es jurídicamente incierto; habría que verificar las condiciones del modelo base (MIT) y del dataset antes de cualquier despliegue productivo.
- **Acceso restringido (gated)**: requiere aceptar condiciones en HuggingFace, lo que dificulta la integración en pipelines automatizados de CI/CD.
- **Sin model card detallada**: no se documentan datos de entrenamiento, hiperparámetros del LoRA, composición del dataset `fiven` ni intenciones de uso, lo que impide auditar sesgos y procedencia de los datos.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia externa de calidad ni de estabilidad.
- **Contexto limitado**: 2048 tokens, muy por debajo de SLMs recientes (8k–128k), lo que restringe conversaciones largas y documentos extensos.
- **Riesgo de alucinación**: el modelo base phi-1_5 es de 2023 y presenta alucinaciones frecuentes y razonamiento limitado; el ajuste en italiano podría agravar la mezcla de idiomas (respuestas en inglés o castellano) al partir de un modelo anglocéntrico.
- **Formato restringido**: al ser solo un adaptador LoRA en safetensors, no funciona directamente en runtimes como llama.cpp u Ollama sin conversión previa.
- **Sin cuantizaciones publicadas**: no hay versiones GPTQ, AWQ ni GGUF oficiales, por lo que las opciones de despliegue optimizado dependen de herramientas de terceros.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-phi-1_5-clmsft
- Modelo base microsoft/phi-1_5: https://huggingface.co/microsoft/phi-1_5
- Documentación de PEFT (HuggingFace): https://huggingface.co/docs/peft

No se han encontrado enlaces a papers, blogs, repositorios de código ni demos en la información disponible.
