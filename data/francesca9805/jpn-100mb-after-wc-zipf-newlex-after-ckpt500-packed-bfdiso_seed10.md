# francesca9805/jpn-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10

## Resumen

`francesca9805/jpn-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10` es un modelo de generación de texto de arquitectura GPT-2 con 124.770.816 parámetros, publicado por el usuario francesca9805 (perfil vinculado a un proyecto de investigación sobre tokenizadores de la Universidad de Groningen, según la URL del experimento en Weights & Biases). Se trata de un ajuste fino supervisado (SFT) realizado con la librería TRL sobre el modelo base `francesca9805/ppt-wc-zipf-newlex-jpn-after-100mb-packed-bfdiso_seed10`.

El nombre del repositorio codifica el experimento: `jpn` apunta a un corpus en japonés, `100mb` a un volumen de datos de aproximadamente 100 MB, `wc-zipf-newlex` a un tratamiento de vocabulario basado en frecuencias (Zipf) y un léxico nuevo, `packed` a secuencias empaquetadas y `seed10` a la semilla 10 del entrenamiento. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción: no tiene descargas ni valoraciones en HuggingFace y su model card no documenta composición del dataset, longitud de contexto ni resultados de evaluación.

Su relevancia es metodológica: permite estudiar cómo afectan el tokenizador y el léxico al rendimiento de un transformer pequeño entrenado sobre un idioma concreto (japonés), y sirve como punto de comparación reproducible dentro de una familia de experimentos con distintas semillas y configuraciones de tokenización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según la etiqueta `gpt2`) |
| Parametros totales | 124.770.816 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la arquitectura GPT-2 suele usar 1024 tokens, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible; el nombre incluye `jpn`, lo que sugiere entrenamiento sobre corpus en japonés, sin confirmación en la model card |
| Licencia | no disponible (la model card incluye el marcador de posición `licence: license`) |
| Formato de pesos | safetensors (librería transformers) |
| Tamano del repositorio | 4,7 GB |
| Modelo base | francesca9805/ppt-wc-zipf-newlex-jpn-after-100mb-packed-bfdiso_seed10 |
| Método de ajuste | SFT con TRL 0.23.0 |
| Fecha de publicación | 11 de octubre de 2026 (última actualización: 12 de octubre de 2026) |

## Arquitectura y entrenamiento

La etiqueta `gpt2` y el tamaño de parámetros sitúan el modelo en la familia de transformers decoder-only de tipo GPT-2 small, con atención causal completa (no se documenta atención lineal, MoE ni arquitecturas híbridas SSM). No hay información publicada sobre número de capas, dimensión de embedding, número de cabezas de atención, tamaño de vocabulario ni longitud de contexto efectiva; el recuento exacto de parámetros (124.770.816, ligeramente distinto del GPT-2 small canónico) sugiere un vocabulario o una configuración de embeddings no estándar, coherente con el prefijo `newlex` del nombre.

El entrenamiento se realizó mediante SFT con TRL sobre el modelo base indicado, partiendo de un checkpoint intermedio (`after-ckpt500`) y con datos empaquetados (`packed`). El nombre del experimento apunta a un corpus en japonés de unos 100 MB con un léxico recalculado según frecuencias tipo Zipf. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO posteriores. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `new-tokenizers`.

## Capacidades

- Generación de texto autoregresiva mediante `transformers.pipeline("text-generation")`, tal como documenta la model card.
- Formato conversacional de un solo turno: el ejemplo oficial pasa una lista con un mensaje de rol `user`, lo que indica que el modelo fue ajustado con plantilla de chat, aunque no se detalla el chat template completo.
- Generación condicionada por prompt libre, sin herramientas ni conectores externos documentados.
- Capacidad multilingüe: no confirmada; el nombre sugiere orientación al japonés.
- Tool calling / function calling: no documentado ni confirmado.
- Uso como agente o razonamiento multi-paso: no documentado ni confirmado.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.
- Compatibilidad declarada con text-generation-inference y con endpoints alojados (etiquetas `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Estudio comparativo de tokenizadores: al ser un modelo de 124,8 M de parámetros entrenado con un léxico nuevo sobre corpus japonés, permite medir el impacto del vocabulario en la perplejidad y en la calidad de generación frente a otros runs de la misma familia (distintas semillas y configuraciones).
- Prototipado rápido de generación de texto en japonés: su tamaño reducido permite iterar en local sobre plantillas de prompt sin coste de GPU, antes de decidir si se escala a un modelo mayor.
- Base para ajuste fino específico de dominio: al ser un checkpoint SFT pequeño, sirve como punto de partida barato para experimentos de fine-tuning sobre datos propios en japonés o en dominios acotados.
- Generación de datos sintéticos de bajo coste: puede producir texto de relleno o ejemplos preliminares para aumentar datasets de entrenamiento, siempre con revisión humana posterior.
- Despliegue on-premise o en edge: al caber en cualquier GPU de consumo e incluso en CPU, es viable para demos internas, entornos sin conectividad o hardware limitado.
- Validación de pipelines de inferencia: útil para probar configuraciones de transformers, text-generation-inference o vLLM con lotes pequeños y verificar plantillas de chat y tokenizadores antes de mover cargas a modelos grandes.
- Docencia e investigación reproducible: el run de Weights & Biases y la semilla fija (`seed10`) permiten reproducir y auditar el experimento en un curso o artículo.
- Pruebas de regresión de infraestructura: su huella de memoria mínima lo hace apropiado como modelo de humo en CI/CD para verificar que el servicio de inferencia arranca y responde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, perplejidad u otras) ni comparaciones cuantitativas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de los 124.770.816 parámetros, no dato publicado): en fp32 unos 0,50 GB; en fp16/bf16 unos 0,25 GB; en int8 unos 0,13 GB.
- VRAM total en inferencia: por debajo de 1 GB en fp16 con lotes pequeños, sumando caché KV y activaciones. La longitud de contexto no está documentada, por lo que la caché KV no puede dimensionarse con precisión.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050 y superiores). No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas, y también en CPU con memoria RAM suficiente (menos de 1 GB para los pesos).
- Opciones de despliegue: `transformers` (pipeline de generación, con soporte de `device="cuda"` según el ejemplo oficial), text-generation-inference (etiqueta declarada) y endpoints compatibles. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Este modelo (jpn-100mb...seed10) | 124.770.816 | no disponible | no disponible | safetensors en HuggingFace |
| openai-community/gpt2 | 124 M (aprox.) | 1024 tokens | Modified MIT | safetensors y conversiones GGUF ampliamente disponibles |
| distilgpt2 | 82 M (aprox.) | 1024 tokens | Apache-2.0 | safetensors y GGUF |
| openai-community/gpt2-medium | 355 M (aprox.) | 1024 tokens | Modified MIT | safetensors y GGUF |

La comparación es estructural (misma familia GPT-2 y orden de magnitud de parámetros), no de rendimiento: no existen métricas publicadas de este checkpoint que permitan situarlo frente a GPT-2 small o distilgpt2. Además, su entrenamiento está orientado, según el nombre, a corpus en japonés, por lo que la comparación con GPT-2 en inglés no sería homogénea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus reducido (según el nombre, unos 100 MB) en japonés, es probable que reproduzca sesgos y estereotipos presentes en esa fuente, sin que el autor haya publicado análisis al respecto.
- Riesgo de alucinación: alto para un modelo de 124,8 M de parámetros ajustado con SFT sobre un volumen de datos pequeño; no dispone de mecanismos de verificación ni de citación de fuentes.
- Limitaciones de contexto e idioma: la longitud de contexto no está publicada y la cobertura de idiomas es desconocida; no hay evidencia de buen rendimiento fuera del japonés.
- Licencia: no disponible. La model card usa el marcador de posición `licence: license`, por lo que no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Ausencia de evaluación: no hay benchmarks, ni métricas de perplejidad, ni análisis de calidad de generación publicados.
- Madurez: cero descargas y cero valoraciones; es un artefacto de investigación sin mantenimiento ni soporte declarado.
- Trazabilidad del dataset: se desconoce la procedencia y el consentimiento de los datos de entrenamiento, algo especialmente relevante si el corpus japonés incluye contenido con derechos de autor.
- Uso en producción: no recomendado como modelo final sin una evaluación propia previa; su valor está en la experimentación controlada y la reproducibilidad del run.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/jpn-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-jpn-after-100mb-packed-bfdiso_seed10
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ve62ycht
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (von Werra et al., 2020), incluida en la model card del autor.

Nota: la búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo ni con su autor; los enlaces encontrados corresponden a otros temas y se han descartado por no ser relevantes.
