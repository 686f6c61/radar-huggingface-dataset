# mkoehler21/llama31-8B-fin-sentiment

## Resumen

`mkoehler21/llama31-8B-fin-sentiment` es un modelo publicado en Hugging Face por el usuario mkoehler21 el 22 de octubre de 2026, etiquetado con `transformers`, `unsloth`, `endpoints_compatible` y `region:us`. Por el identificador se deduce que se trata de un ajuste fino del modelo base Llama 3.1 de 8.000 millones de parámetros orientado a análisis de sentimiento en el dominio financiero, pero esta deducción procede únicamente del nombre del repositorio: la model card no lo confirma en ningún apartado.

La model card es la plantilla autogenerada de Hugging Face y todas sus secciones figuran con el marcador `[More Information Needed]`: no hay información sobre desarrollador, tipo de modelo, idiomas, licencia, modelo base, datos de entrenamiento, hiperparámetros, evaluación ni uso previsto. El repositorio declara un tamaño de 0,0 GB, lo que sugiere que los pesos no están subidos o que solo contiene ficheros de configuración.

Su relevancia actual es, por tanto, muy limitada como artefacto listo para producción: cero descargas y cero likes en el momento de la consulta, ausencia de licencia explícita y de documentación técnica. Resulta útil únicamente como referencia de un pipeline de ajuste fino con Unsloth sobre Llama 3.1 8B, y en ningún caso debería desplegarse sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (por el identificador se infiere un transformer decoder-only de la familia Llama 3.1; sin confirmar en la model card) |
| Parámetros totales | No disponible (el identificador «8B» sugiere 8.000 millones; sin confirmar) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (Llama 3.1 base soporta 128.000 tokens; no confirmado para este ajuste) |
| Tipos de cuantización | No disponible (el tag `unsloth` sugiere cuantización de 4 bits durante el entrenamiento, no necesariamente pesos cuantizados publicados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se declara licencia en la model card ni en los metadatos) |
| Formato de pesos | No disponible (el tamaño del repositorio es de 0,0 GB; el tag `transformers` apunta a safetensors o PyTorch bin, sin confirmar) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura en la model card: el apartado «Model Architecture and Objective» está marcado como `[More Information Needed]`. El tag `unsloth` es el único indicio técnico disponible e indica que el ajuste se realizó con la librería Unsloth, habitualmente empleada para fine-tuning eficiente (LoRA/QLoRA con cuantización de 4 bits y kernels optimizados) sobre modelos de la familia Llama. El tag `arxiv:1910.09700` corresponde a Lacoste et al. (2019), el artículo de la calculadora de impacto medioambiental citado en la plantilla de Hugging Face, no a un paper del modelo.

Tampoco se documentan los datos de entrenamiento: no se especifica el corpus financiero utilizado, el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Los hiperparámetros, el régimen de precisión y el hardware de entrenamiento figuran igualmente como no disponibles. No se puede verificar ninguna innovación técnica más allá del uso de Unsloth como herramienta de ajuste.

## Capacidades

- Generación de texto: heredada presumiblemente del modelo base Llama 3.1 8B; no documentada para este ajuste concreto.
- Clasificación de sentimiento financiero: es la tarea que sugiere el sufijo `fin-sentiment` del identificador, pero no hay ejemplos, métricas ni formato de salida declarados.
- Tool calling / function calling: no disponible. No se documenta si se ha preservado la capacidad de llamada a herramientas del modelo base.
- Razonamiento multi-paso y comportamiento agéntico: no disponible.
- Capacidades multilingües: no disponible. No se declaran idiomas soportados.
- Modo «thinking», visión o audio: no disponible; no hay indicios de que el ajuste incorpore ninguna de estas capacidades.

## Casos de uso

Ninguno de los siguientes casos está validado por el autor. Se plantean como escenarios plausibles dada la presumible naturaleza del ajuste, y en todos ellos es imprescindible una evaluación propia antes de usar el modelo.

- Análisis de sentimiento de noticias financieras en pipelines de ingesta: clasificar titulares y notas de prensa en categorías positiva, negativa y neutra para alimentar paneles de seguimiento de mercado, siempre que se valide antes la calibración de las etiquetas.
- Procesamiento por lotes de transcripciones de resultados trimestrales (earnings calls): segmentar la transcripción y estimar el tono de cada intervención para comparar la evolución del sentimiento entre trimestres.
- Monitorización de redes sociales y foros de inversión: agregar el sentimiento de menciones sobre un valor concreto y detectar cambios bruscos de tono, con un filtro humano sobre las señales generadas.
- Investigación académica en finanzas computacionales: usar el modelo como línea base adicional frente a FinBERT u otros clasificadores especializados, documentando la reproducibilidad y la licencia incierta del artefacto.
- Enriquecimiento de bases de datos documentales: etiquetar informes anuales y comunicados regulatorios con metadatos de sentimiento para facilitar búsquedas posteriores en sistemas de recuperación (RAG).
- Detección de riesgo reputacional: marcar automáticamente fragmentos con tono negativo en comunicaciones corporativas para revisión por parte de los equipos de compliance.
- Generación de resúmenes con sesgo de sentimiento: producir resúmenes de documentos financieros indicando el tono predominante, únicamente en entornos internos y con revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección «Evaluation» con todos los campos marcados como `[More Information Needed]`, y no hay métricas de precisión, F1, MMLU, HumanEval, GSM8K ni de ninguna otra tarea. Tampoco se han encontrado resultados en la búsqueda web realizada.

## Requisitos de hardware

Las estimaciones siguientes se basan en el supuesto, no confirmado, de que el modelo tiene 8.000 millones de parámetros. Si el repositorio finalmente no contiene pesos (0,0 GB declarados), no hay nada que desplegar.

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB de pesos, más overhead de KV cache (del orden de 1-2 GB adicionales con contexto moderado).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G para servicio concurrente con vLLM o TGI.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 sin problemas; en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 Ti Super solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si los pesos están en safetensors; llama.cpp u Ollama si se generan versiones GGUF, algo que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los valores de los competidores corresponden a sus especificaciones públicas habituales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mkoehler21/llama31-8B-fin-sentiment | No confirmado (presuntamente 8B) | No disponible | No disponible | Repositorio de 0,0 GB, 0 descargas |
| ProsusAI/finbert | ~110 M | 512 tokens | Apache 2.0 | Público, ampliamente utilizado |
| yiyanghkust/finbert-tone | ~110 M | 512 tokens | Apache 2.0 | Público |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Público, con registro |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2B | 32.000 tokens | Apache 2.0 | Público |

Frente a FinBERT, el modelo analizado ofrece presumiblemente mayor capacidad generativa y de contexto, pero carece de la validación empírica, la licencia clara y la comunidad de uso del primero. Frente a Llama 3.1 8B Instruct, la única diferencia sería el ajuste específico de dominio, no documentado ni evaluado.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial; además, al derivar presumiblemente de Llama 3.1, heredaría las restricciones de la Llama 3.1 Community License, que exige atribución y aceptación de su política de uso aceptable.
- Repositorio de 0,0 GB: los pesos podrían no estar disponibles, lo que impediría cualquier descarga o reproducción del ajuste.
- Model card vacía: no hay información sobre datos de entrenamiento, composición del corpus, sesgos ni evaluación, lo que hace imposible auditar el modelo.
- Riesgo de alucinación y de sobreconfianza en la etiqueta de sentimiento: un clasificador de sentimiento financiero sin métricas publicadas puede producir etiquetas erróneas de forma sistemática en dominios no vistos (por ejemplo, derivados, criptoactivos o información regulatoria).
- Sesgos potenciales desconocidos: al no documentarse el dataset, no se puede descartar sesgo de dominio (solo mercado estadounidense), sesgo temporal (datos hasta una fecha de corte concreta) o sesgo idiomático.
- Idiomas no declarados: es probable que el modelo esté optimizado para inglés financiero, pero no hay confirmación ni evaluación en castellano.
- Riesgo regulatorio: usar las salidas del modelo como señal de inversión o como parte de decisiones financieras automatizadas puede incumplir normativa sectorial (MiFID II, requisitos de explicabilidad) y no está respaldado por ninguna validación.
- Ausencia de validación comunitaria: cero descargas y cero likes implican que no existen reportes independientes de calidad ni casos de uso verificados.
- Fecha de creación posterior a la fecha actual de referencia de muchos entornos: conviene verificar la procedencia del repositorio antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkoehler21/llama31-8B-fin-sentiment
- Paper citado en los tags (Lacoste et al., 2019, calculadora de impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
- Repositorio de Unsloth (herramienta indicada por el tag del modelo): https://github.com/unslothai/unsloth
- Modelo base presumible (no confirmado): https://huggingface.co/meta-llama/Llama-3.1-8B

Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
