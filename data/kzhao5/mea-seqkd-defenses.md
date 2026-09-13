# kzhao5/mea-seqkd-defenses

## Resumen

`kzhao5/mea-seqkd-defenses` es un repositorio de artefactos de reproducción para el benchmark de defensas frente a extracción de modelos (MEA, model extraction attack), concretamente para el ataque de destilación por secuencias (SeqKD). No es un modelo conversacional al uso: contiene los checkpoints de estudiante extraídos bajo cada una de las seis defensas de tipo generador evaluadas, junto con los resultados de los detectores, de modo que otros equipos puedan cargar los modelos y reproducir las cifras sin volver a ejecutar el pipeline completo. Lo publica el usuario kzhao5 como material complementario del proyecto `A-Benchmark-for-Model-distillation-survey`.

El montaje experimental es claro: un profesor `Qwen/Qwen2.5-72B-Instruct` defendido, un estudiante base `Qwen/Qwen2.5-7B` (en su variante base, no Instruct), un presupuesto de consulta de 1000 peticiones y un entrenamiento LoRA con r=16, alpha=32, dropout=0,05 en bf16. Las defensas cubiertas son ginsew, radioactivity, adfp, ads, doge y trace_rewriting. El repositorio separa dos familias: marcas de agua o huellas (ginsew, radioactivity, adfp), donde un detector comprueba si la marca sobrevivió en el estudiante, y generadores anti-destilación (ads, doge, trace_rewriting), donde no hay marca que detectar y la evaluación se hace por utilidad downstream.

Su relevancia es de tipo metodológico y de seguridad: los resultados publicados indican que, con un presupuesto de 1000 consultas y ataque SeqKD, ninguna de las defensas de marca de agua probadas sobrevive a la extracción (positivo y negativo son prácticamente idénticos en los tres detectores). Es, por tanto, un recurso útil para investigadores en protección de propiedad intelectual de modelos, no una pieza para desplegar en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen2.5-7B) con adaptadores LoRA PEFT; la arquitectura interna del base no se documenta en este repositorio |
| Parámetros totales | ~7 000 millones en el modelo base; el repositorio añade adaptadores LoRA con r=16 por defensa (número exacto de parámetros entrenables no especificado) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en el repositorio; heredada del modelo base. En la configuración de ADS se emplean `max_new_tokens=1536` y `max_length=512` |
| Tipos de cuantización | No se publican pesos cuantizados; los adaptadores se entrenan y publican en bf16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors (adaptadores LoRA PEFT), más `lm_head.pt` (~2,5 GB) para la defensa DOGe |
| Tamaño del repositorio | 2,8 GB |
| Librería | peft (compatible con transformers) |
| Modelo base | Qwen/Qwen2.5-7B |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero, sino que publica el resultado de un ataque de extracción por destilación de secuencias (SeqKD). El profesor es `Qwen/Qwen2.5-72B-Instruct`, sometido a una de las seis defensas; el estudiante parte de `Qwen/Qwen2.5-7B` en su variante base (no Instruct) y se ajusta mediante LoRA con r=16, alpha=32 y dropout=0,05 en precisión bf16, con un presupuesto de ataque de 1000 consultas al profesor. Cada subcarpeta `<defense>/checkpoint-final/` es un adaptador PEFT que se carga sobre el base con `PeftModel.from_pretrained`, indicando el subfolder correspondiente.

Las defensas se dividen en dos tipos según el campo `DEFENSE_TYPE` del benchmark. Las de marca o huella (ginsew, con `output_watermark`; radioactivity, con `radioactive_watermark`; adfp, con `output_fingerprint`) se evalúan con un detector que comprueba la transferencia de la marca al estudiante (métrica M4). Las anti-destilación (ads, doge, trace_rewriting, todas `anti_distillation_generator`) no tienen marca detectable: el benchmark no incluye detector y su efecto se mide por la utilidad downstream del estudiante extraído frente al estudiante limpio. Como detalle técnico reseñable, para ADS se documenta la configuración exacta de muestreo (`lam=0.1`, `eps=0.01`, `tau=0.9`, `top_p=0.95`, `max_new_tokens=1536`, estudiante proxy `Qwen/Qwen2.5-7B`) y para DOGe se publica la cabeza LM entrenada (`lm_head.pt`) más el tokenizador, lo que permite reconstruir el profesor defendido. El repositorio incorpora además, desde el 12 de septiembre de 2026, el árbol completo de cada ejecución bajo `<defense>/full/` y la línea base limpia en `clean/`.

## Capacidades

- Generación de texto autorregresiva en el mismo rango funcional que el modelo base Qwen2.5-7B, ya que los adaptadores LoRA modifican ese base sin cambiar la arquitectura.
- Reproducción del ataque SeqKD: los adaptadores son estudiantes extraídos del profesor defendido y permiten replicar las cifras del benchmark sin repetir el pipeline.
- Auditoría de marcas de agua: los informes `detector_report.json` y `detector_negative_report.json` permiten recalcular la separación positivo/negativo mediante la métrica M4.
- Reconstrucción del profesor defendido con DOGe: la carpeta `doge/fingerprint_teacher_head/` incluye la cabeza LM entrenada (~2,5 GB) y el tokenizador.
- Evaluación de utilidad downstream de estudiantes extraídos bajo defensas anti-destilación, comparando con la línea base limpia de `clean/`.
- Análisis de configuraciones de defensa: cada directorio incluye un `defense_run_manifest.json` con la configuración completa de la ejecución.
- No se documentan capacidades de tool calling, agentes, visión, audio, modo de razonamiento explícito ni soporte multilingüe declarado.
- No se publican resultados de evaluación de los estudiantes en tareas de propósito general (razonamiento, código o matemáticas).

## Casos de uso

- Reproducción de resultados de investigación en seguridad de LLM: cargando cada adaptador con `PeftModel.from_pretrained` y el subfolder correspondiente se replican las cifras del benchmark MEA sin reejecutar el ataque, lo que ahorra el coste de generar 1000 consultas por defensa.
- Evaluación de robustez de marcas de agua: los pares de informes de detector (positivo y negativo limpio) permiten calcular la separación estadística por defensa y verificar que ginsew, radioactivity y adfp no superan el umbral de detección tras la extracción.
- Desarrollo de detectores propios: los checkpoints publicados sirven como conjunto de estudiantes "marcados" y "no marcados" para entrenar o calibrar detectores alternativos con datos controlados.
- Estudio comparado de defensas anti-destilación: los estudiantes extraídos bajo ads, doge y trace_rewriting permiten medir la pérdida de utilidad respecto al baseline limpio y decidir qué técnica degrada más al extractor.
- Reconstrucción y análisis del profesor defendido: con `doge/fingerprint_teacher_head/lm_head.pt` y el tokenizador se puede montar el profesor con defensa DOGe y estudiar cómo la cabeza modificada altera las distribuciones de salida.
- Docencia y formación en seguridad de modelos: el árbol `full/` incluye transcripciones del profesor, registros de consultas recibidas, artefactos de defensa y logs del servidor, material idóneo para prácticas de auditoría de extracción de modelos.
- Verificación de integridad de publicaciones: los manifiestos de ejecución y los informes de detector permiten auditar de forma independiente las afirmaciones del artículo asociado al benchmark.
- Encadenado con el repositorio complementario de QEDKS: los artefactos con el mismo conjunto de defensas permiten comparar dos ataques de extracción distintos bajo condiciones equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El material proporcionado únicamente contiene los resultados de los detectores de marca de agua del benchmark MEA (métrica M4), que se reproducen a continuación.

| Defensa | Métrica | Positivo (extraído del profesor defendido) | Negativo (SeqKD limpio) | ¿Sobrevive? |
|---|---|---|---|---|
| ginsew | z-score (green rate) | z = −10,99 (0,483) | z = −11,62 (0,481) | No, sin separación |
| radioactivity | p-value (green rate) | p = 0,324 (0,251) | p = 0,355 (0,250) | No, p no significativa |
| adfp | gtp / −log10 p | gtp = 0,498, score = 0,0 | No disponible | No, huella no detectada |

Conclusión publicada por el autor: bajo extracción SeqKD con presupuesto 1000, ninguna de las defensas de marca o huella probadas sobrevive en el estudiante extraído, ya que el positivo y el negativo son prácticamente indistinguibles. Para las defensas anti-destilación (ads, doge, trace_rewriting) solo se publican checkpoints; la evaluación de utilidad downstream no está incluida en el repositorio.

## Requisitos de hardware

- VRAM para inferencia: los adaptadores LoRA son ligeros (el repositorio completo ocupa 2,8 GB), pero requieren cargar el modelo base Qwen2.5-7B. En bf16 el base ronda los 15 GB de pesos, por lo que se necesitan aproximadamente 16-18 GB contando caché KV; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones de referencia para un modelo denso de 7B, no mediciones publicadas en el repositorio.
- GPU recomendadas: A100 40 GB, H100 o L40S para servir el base en bf16 con margen para lotes grandes; RTX 4090, RTX 3090 o A6000 (24 GB) para inferencia en bf16 con lotes moderados.
- GPU de consumo: sí cabe. Con 24 GB se puede cargar el modelo base en bf16 junto con el adaptador; con 8-12 GB es necesario recurrir a cuantización de 8 o 4 bits del base.
- Opciones de despliegue: `transformers` + `peft` es la vía documentada en la model card (el propio autor incluye el fragmento de carga). vLLM y TGI admiten adaptadores LoRA, aunque no hay configuración publicada para este repositorio. El uso con llama.cpp u Ollama requeriría convertir el base a GGUF y fusionar el adaptador, paso que no se documenta ni se distribuye aquí.
- Almacenamiento y red: el repositorio pesa 2,8 GB, pero `doge/fingerprint_teacher_head/lm_head.pt` aporta por sí solo unos 2,5 GB. Se omiten deliberadamente `ads/full/prep/student_grads.pt` (~29 GB) y la copia duplicada de la cabeza LM de DOGe.
- Latencia y throughput: no disponible. No se publican mediciones de rendimiento en el repositorio.

## Comparativa con modelos similares

No se dispone de información sobre otros repositorios de artefactos comparables dentro de la información proporcionada. La comparación más razonable es entre las tres piezas que intervienen en el experimento:

| Elemento | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (adaptadores LoRA SeqKD sobre Qwen2.5-7B) | ~7B (base) + LoRA r=16 | No disponible (heredado del base) | apache-2.0 | Público en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-7B (modelo base, variante base no Instruct) | ~7B | No disponible en este repositorio | No indicada aquí | Modelo base público, referenciado como `base_model` |
| Qwen/Qwen2.5-72B-Instruct (profesor defendido) | ~72B | No disponible en este repositorio | No indicada aquí | Referenciado en la model card como profesor del experimento |

Repositorio complementario del mismo autor con resultados del ataque QEDKS sobre las mismas defensas: la URL aparece truncada en la model card (`https://huggingface.co`), por lo que no se puede enlazar de forma completa.

## Limitaciones y advertencias

- No es un modelo para uso general: se trata de un conjunto de artefactos de reproducción de un benchmark de seguridad, con adaptadores extraídos y no ajustados para instrucciones ni para conversación.
- El estudiante parte de `Qwen/Qwen2.5-7B` en variante base, no Instruct, por lo que no cabe esperar comportamiento de asistente ni seguimiento fiable de instrucciones.
- Los resultados de los detectores son específicos de este montaje: ataque SeqKD, presupuesto de 1000 consultas, profesor Qwen2.5-72B-Instruct y estudiante LoRA r=16. No deben extrapolarse a otros presupuestos, otros ataques o modelos de mayor tamaño.
- Las defensas anti-destilación (ads, doge, trace_rewriting) se publican solo como checkpoints; no hay evaluación de utilidad downstream incluida, de modo que no puede concluirse su eficacia a partir de este repositorio.
- Ausencia de evaluación de sesgos, alucinación, toxicidad o seguridad. No hay ninguna métrica de este tipo en la información disponible.
- Idiomas soportados no declarados; no hay garantía de cobertura multilingüe más allá de la del modelo base.
- Advertencia de licencia: el repositorio declara apache-2.0, pero se apoya en Qwen/Qwen2.5-7B. Conviene verificar los términos del modelo base antes de cualquier uso comercial, especialmente si se redistribuyen pesos fusionados.
- Omisiones deliberadas de artefactos pesados: los gradientes del estudiante proxy de ADS (~29 GB) y una copia duplicada de la cabeza LM de DOGe no están en el repositorio y deben regenerarse con los scripts y ajustes documentados.
- Riesgo de reproducibilidad parcial: para ginsew y radioactivity la ejecución original quedó repartida en dos directorios durante la campaña y el árbol `full/` los fusiona, lo que puede complicar la trazabilidad exacta de cada paso.
- Uso ético: los adaptadores son el producto de un ataque de extracción. Reutilizarlos para extraer modelos de terceros sin autorización puede infringir términos de servicio y normativa de propiedad intelectual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kzhao5/mea-seqkd-defenses
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Profesor empleado en el ataque: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Repositorio complementario con resultados del ataque QEDKS: URL truncada en la model card, no disponible
- Paper, blog o repositorio del benchmark `A-Benchmark-for-Model-distillation-survey`: no disponible
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos no guardan relación con el contenido del repositorio.
