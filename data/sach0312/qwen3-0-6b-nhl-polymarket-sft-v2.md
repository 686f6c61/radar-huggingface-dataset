# sach0312/qwen3-0.6b-nhl-polymarket-sft-v2

## Resumen

`sach0312/qwen3-0.6b-nhl-polymarket-sft-v2` es un ajuste fino mediante supervisión (SFT) del modelo denso `Qwen/Qwen3-0.6B`, publicado por el usuario sach0312 en Hugging Face. El repositorio contiene pesos en formato safetensors compatibles con la librería `transformers` y fue generado con el framework TRL, según los metadatos de la model card. El nombre del modelo apunta a una especialización en contenido de la NHL (liga profesional de hockey sobre hielo norteamericana) y de Polymarket (mercado de predicción), aunque la model card no documenta ni el conjunto de datos ni el procedimiento de entrenamiento.

Se trata de un modelo de aproximadamente 0,6 mil millones de parámetros, lo que lo sitúa en la gama ultraligera: cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU. Ese tamaño reduce drásticamente el coste por token y permite despliegues en el borde, a cambio de una capacidad de razonamiento y de generalización muy inferior a la de modelos de 7B o superiores.

Su interés práctico es doble: por un lado, como ejemplo de flujo de trabajo SFT con TRL sobre una base Qwen3 pequeña; por otro, como posible componente de pipelines de extracción, clasificación o generación acotada a un dominio concreto. Su utilidad real está por validar: el repositorio no tiene descargas ni valoraciones, no publica benchmarks y su licencia queda sin especificar en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, derivado de Qwen3-0.6B (no confirmado en la model card del ajuste) |
| Parametros totales | ~0,6 mil millones (heredado del modelo base; no declarado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en la model card. El modelo base Qwen3-0.6B declara 32.768 tokens nativos, extensibles a 131.072 con escalado YaRN |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no incluye GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card. El modelo base declara soporte para 119 idiomas y dialectos |
| Licencia | No disponible. El campo de la model card contiene el marcador de posición `licence: license`; el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (etiqueta `safetensors`, librería `transformers`) |
| Modelo base | Qwen/Qwen3-0.6B |
| Autor | sach0312 |
| Fecha de creacion / actualizacion | 2026-09-13 (ambas marcas separadas por unos 34 minutos) |
| Tamano del repositorio | 0,1 GB segun Hugging Face |
| Descargas / valoraciones | 0 / 0 |
| Libreria y pipeline | `transformers`; pipeline no declarado |
| Etiquetas | transformers, safetensors, generated_from_trainer, sft, hf_jobs, trl, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del ajuste, pero al derivar de `Qwen/Qwen3-0.6B` hereda las características de esa familia: un transformer denso decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Qwen3 incorpora además QK-Norm para estabilizar el entrenamiento y, en los tamaños pequeños, embeddings de entrada y salida atados. El modelo base se preentrenó sobre del orden de 36 billones de tokens en 119 idiomas y dialectos, y admite un modo de razonamiento explícito (*thinking*) conmutable junto a un modo directo.

El ajuste se realizó con SFT mediante TRL, según los metadatos, y la única información técnica publicada son las versiones de framework: TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se documentan el conjunto de datos, el número de ejemplos, la composición del corpus, la longitud de secuencia, los hiperparámetros, el número de pasos ni ninguna evaluación posterior. Tampoco se indica si se emplearon RLHF, DPO u otras fases adicionales: solo SFT. Las versiones declaradas no se corresponden con versiones públicas conocidas de esas librerías, lo que sugiere una inconsistencia en la model card o un entorno de ejecución interno no estándar. El nombre sugiere un corpus orientado a NHL y Polymarket, y la existencia del sufijo `v2` implica al menos una iteración previa, pero ninguno de esos extremos está confirmado en la documentación.

## Capacidades

- Generación de texto autoregresiva e instrucciones de un solo turno, gracias al ajuste por SFT sobre un modelo instructivo.
- Conversación multi-turno a través de la plantilla de chat del tokenizador, tal como se usa en el ejemplo de la model card (se pasa una lista de mensajes al pipeline de generación).
- Extracción de información y generación estructurada en dominios acotados: el nombre del modelo sugiere especialización en datos deportivos (NHL) y de mercados de predicción (Polymarket).
- Razonamiento básico y matemáticas simples: limitado por el tamaño de 0,6B; el modelo base incluye un modo de razonamiento explícito del que no hay constancia de que se conserve tras el SFT.
- Capacidades multilingües: no declaradas para este ajuste; el modelo base afirma cubrir 119 idiomas, pero no hay evaluación del ajuste en ningún idioma.
- Soporte de *tool calling* o *function calling*: no declarado. El modelo base Qwen3 incluye plantillas para llamadas a herramientas, pero no hay evidencia de que el ajuste las haya retenido.
- Comportamiento agéntico y razonamiento multi-paso: no declarado ni evaluado.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explícito (*thinking*): no documentado en el ajuste.

## Casos de uso

- Clasificación y etiquetado de noticias deportivas: el modelo puede categorizar titulares, partes y crónicas de la NHL (lesiones, traspasos, resultados) como paso previo a un sistema de recomendación o de alertas, aprovechando el ajuste sobre vocabulario del dominio.
- Extracción de entidades y datos estructurados de resúmenes de partidos: conversión de texto libre en JSON con marcador, equipos, goleadores y minutos, integrable en un pipeline ETL de estadísticas deportivas.
- Monitorización de mercados de predicción: resumen y clasificación de la actividad de Polymarket (nuevos mercados, cambios de probabilidad implícita, resolución de eventos) para alimentar paneles informativos, nunca como base para decisiones financieras automatizadas.
- Preprocesado y enrutado en pipelines RAG: generación de consultas reformuladas, filtrado de documentos irrelevantes o extracción de palabras clave antes de llamar a un modelo mayor, reduciendo coste por token.
- Asistente conversacional de nicho en el borde: chatbot desplegado en local (portátil, mini-PC o dispositivo móvil) para responder preguntas frecuentes sobre un dominio concreto, sin enviar datos a la nube.
- Generación de borradores y plantillas: redacción de resúmenes breves, fichas de partido o descripciones de mercados a partir de datos tabulares, siempre con revisión humana por el riesgo de alucinación.
- Base para un SFT posterior: punto de partida económico para adaptaciones a otros dominios con LoRA o QLoRA, dado su reducido coste de entrenamiento.
- Evaluación comparativa de recetas de ajuste: al ser un SFT reproducible con TRL sobre una base pública, sirve como referencia metodológica en experimentos de alineamiento a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, ni comparaciones con el modelo base. Tampoco se han publicado evaluaciones objetivas de pérdida, perplejidad o tasas de acierto en tareas de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos calculados a partir del tamaño de 0,6B, no medidos sobre este modelo): en bf16/fp16, aproximadamente 1,2-1,5 GB de pesos, más caché KV y activaciones, lo que sitúa el consumo total en torno a 2-4 GB con contextos cortos y en 6-10 GB con contextos largos (32K tokens).
- Cuantización: en 4 bits (Q4_K_M o similar) los pesos bajan a unos 0,4-0,5 GB, con lo que la inferencia completa cabe por debajo de 1-2 GB de memoria.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4060, RTX 4090). En GPUs de gama alta (A100, H100) el modelo queda limitado por el ancho de banda y no aprovecha su capacidad de cómputo, por lo que se usa en despliegues con lotes muy grandes.
- GPU de consumo: sí, cabe holgadamente en todas las GPU de consumo actuales e incluso en iGPU con memoria unificada.
- CPU y borde: ejecutable en CPU moderna, en Raspberry Pi 5 y en dispositivos móviles si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (uso directo según la model card), vLLM y TGI para servicio con lotes, llama.cpp y Ollama para CPU y borde (requiere convertir los pesos a GGUF, ya que el repositorio no incluye cuantizaciones), y endpoints compatibles con la API de Hugging Face (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles para este modelo. Como referencia orientativa por tamaño, un modelo de 0,6B suele generar del orden de varios cientos de tokens por segundo en una GPU moderna con vLLM y lotes grandes, y decenas de tokens por segundo en CPU con cuantización de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto nativo | Licencia | Disponibilidad |
|---|---|---|---|---|
| sach0312/qwen3-0.6b-nhl-polymarket-sft-v2 | ~0,6B (denso) | No declarado (base: 32.768 tokens, 131.072 con YaRN) | No disponible (marcador de posición) | Safetensors en Hugging Face; sin cuantizaciones publicadas |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B (denso) | 32.768 tokens, extensible a 131.072 con YaRN | Apache-2.0 | Safetensors, GGUF comunitario, ampliamente integrado |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B (denso) | 32.768 tokens, extensible a 131.072 | Apache-2.0 | Safetensors y múltiples cuantizaciones |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B (denso) | 128.000 tokens | Licencia comunitaria de Llama 3.2 (con restricciones de uso) | Safetensors, GGUF comunitario, gated en Hugging Face |

Comparación de rendimiento: no disponible. No existen métricas publicadas de este ajuste frente a los modelos listados, por lo que cualquier afirmación sobre calidad relativa sería especulativa. Los datos de contexto y licencia de los modelos comparados proceden de su documentación pública y conviene verificarlos antes de citarlos.

## Limitaciones y advertencias

- Ausencia total de documentación del entrenamiento: no se conocen el conjunto de datos, el número de ejemplos, la composición del corpus ni la longitud de secuencia, lo que impide auditar sesgos o riesgo de contaminación.
- Riesgo elevado de alucinación: en modelos de 0,6B la generación de hechos plausibles pero falsos es frecuente, especialmente en datos deportivos y financieros con cifras, fechas y nombres.
- Sin evaluación publicada: no hay benchmarks ni validación humana; no se puede afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Licencia ambigua: la model card contiene `licence: license` como marcador de posición. Al derivar de Qwen3-0.6B, que es Apache-2.0, lo esperable es conservar esa licencia, pero el repositorio no lo declara, lo que supone un riesgo legal para uso comercial.
- Idiomas no declarados: el modelo base cubre 119 idiomas, pero no hay garantía de que el SFT no haya degradado idiomas distintos al del corpus de ajuste.
- Contexto no confirmado: la ventana de 32.768 tokens es la del modelo base; el ajuste pudo haberse entrenado con secuencias mucho más cortas y rendir peor en contextos largos.
- Riesgo de sobreajuste al dominio: el nombre sugiere un corpus muy específico (NHL y Polymarket), lo que puede degradar el rendimiento en conversación general.
- Advertencia financiera: no debe utilizarse para tomar decisiones de inversión ni para operar en mercados de predicción; un modelo de este tamaño no estima probabilidades de forma fiable.
- Sin validación de la comunidad: 0 descargas y 0 valoraciones implican que nadie ha reproducido ni auditado su comportamiento.
- Inconsistencias en la model card: las versiones de TRL, Transformers y PyTorch declaradas no corresponden a versiones públicas conocidas, y el ejemplo rápido emplea una pregunta genérica sin relación con el dominio sugerido por el nombre.
- Tamaño del repositorio llamativo: 0,1 GB es inferior a los aproximadamente 1,2 GB esperables para 0,6B parámetros en bf16, por lo que conviene inspeccionar los archivos antes de asumir que los pesos están completos.
- Sin soporte de herramientas ni agentes verificado: no se debe asumir *tool calling* funcional en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sach0312/qwen3-0.6b-nhl-polymarket-sft-v2
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de TRL: https://github.com/huggingface/trl
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a páginas de ayuda de Facebook en alemán, sin relación con el modelo ni con sus datos de entrenamiento.
