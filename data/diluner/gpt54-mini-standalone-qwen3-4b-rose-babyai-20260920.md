# Diluner/gpt54-mini-standalone-qwen3-4b-rose-babyai-20260920

## Resumen

gpt54-mini-standalone-qwen3-4b-rose-babyai-20260920 es un ajuste fino de Qwen/Qwen3-4B publicado por el usuario Diluner en HuggingFace. Se trata del checkpoint final de una etapa de entrenamiento denominada babyai, ejecutada con el método ROSE y con gpt-5.4-mini como modelo profesor. El entrenamiento se inicializó de forma independiente desde el modelo base (standalone), por lo que no es un checkpoint secuencial dentro de una cadena de etapas.

El modelo conserva los 4.411.424.256 parámetros del modelo base (unos 8,8 GB en safetensors, coherente con precisión de 16 bits). El problema que aborda es el ajuste de un modelo de 4B como agente conversacional en el entorno BabyAI, donde alcanza un 87,5 % de éxito medio con la métrica avg@4 sobre 360 intentos (315 aciertos) y cero errores de episodio.

Su relevancia es acotada y muy específica: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas documentados, y con una única tabla de evaluación sobre un solo entorno. Resulta útil como ejemplo reproducible de destilación con profesor sobre un modelo pequeño y como punto de partida para experimentos de agentes, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; corresponde a la del modelo base Qwen/Qwen3-4B (familia Qwen3, transformer decoder-only) |
| Parámetros totales | 4.411.424.256 (4,41 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no especifica contexto; el autor solo documenta 512 tokens generados por turno en evaluación) |
| Tipos de cuantización | No disponible. El repositorio solo publica safetensors en precisión completa (16 bits); no hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | No disponible. El autor indica explícitamente que no se afirma ninguna licencia y remite al modelo base y a los términos aplicables |
| Formato de pesos | safetensors (configuración, tokenizer y todos los shards de pesos en la raíz del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B y se entrena con ROSE usando gpt-5.4-mini como profesor. La etapa documentada es babyai: cinco épocas y 125 actualizaciones del optimizador en esa etapa. La inicialización es independiente desde el modelo base, de modo que no hereda pesos de etapas intermedias de una cadena. La evaluación se realiza con temperatura 0,4, top-p 1,0, top-k 20, modo thinking desactivado y un máximo de 512 tokens generados por turno. La exportación a HuggingFace incluye configuración, tokenizer y todos los shards de pesos, pero no incluye estado del optimizador, logs crudos ni trayectorias del profesor; las referencias legibles por máquina y las sumas de comprobación están en `experiment.json`.

El propio autor acota la interpretación de los resultados. Las recetas históricas de SFT y ROSE difieren en la planificación del learning rate, el weight decay, la precisión de parámetros, el formato y algunos límites de turnos de entrenamiento, por lo que la comparación no es una ablación que aísle únicamente el objetivo. El checkpoint retenido pertenece a la ejecución exitosa `o5e5y0nu`; una ejecución anterior fallida (`tbvhb9b3`) escribió registros en ficheros de rollout compartidos y esos registros se excluyen del análisis. Además, el inventario de selección registra nombres de fichero, tamaños y fechas de modificación, no hashes de bytes de tensores, y los logs históricos de serving están incompletos.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo lleva la etiqueta conversational.
- Ejecución de tareas de agente con instrucciones en el entorno BabyAI: la evaluación reporta 315 éxitos sobre 360 intentos con avg@4.
- Interacción multi-turno: cada turno se evalúa con un presupuesto de hasta 512 tokens generados.
- Compatibilidad con text-generation-inference y con endpoints compatibles (`endpoints_compatible`), según las etiquetas del repositorio.
- Modo thinking: la evaluación se realizó con el modo thinking desactivado; no se documenta el comportamiento con thinking activado.
- Tool calling / function calling: no documentado.
- Capacidades multilingües: no documentadas.
- Visión, audio u otras modalidades: no documentadas; el modelo es exclusivamente de texto.
- Razonamiento matemático y generación de código: no documentados ni evaluados en la información disponible.

## Casos de uso

- Reproducción de experimentos de destilación con profesor: el checkpoint permite examinar el resultado de aplicar ROSE sobre Qwen3-4B con gpt-5.4-mini como profesor en una etapa concreta (5 épocas, 125 actualizaciones), útil para equipos que investigan métodos de ajuste con datos generados por modelos mayores.
- Investigación en agentes de lenguaje en entornos de instrucciones: el modelo está entrenado y evaluado en BabyAI, por lo que sirve como política de referencia en tareas de seguimiento de instrucciones dentro de un gridworld, incluso aunque su uso previsto sea como punto de comparación interno.
- Generación de trayectorias sintéticas de agente: puede emplearse para producir rollouts multi-turno (hasta 512 tokens por turno) que alimenten pipelines de imitación o de RL, siempre que se valide la calidad turno a turno.
- Estudio de robustez de políticas en modelos de 4B: la métrica avg@4 sobre cuatro intentos por tarea oficial permite medir varianza de comportamiento, no solo el mejor caso.
- Base para ajustes posteriores de dominio: con 4,41 B de parámetros, el fine-tuning completo o con LoRA cabe en presupuestos de VRAM moderados, lo que permite especializarlo en tareas internas partiendo de un modelo ya entrenado para seguir instrucciones de agente.
- Servicio de inferencia local para pruebas internas: puede desplegarse con transformers o con text-generation-inference para validar flujos de agente conversacional antes de pasar a modelos mayores, dado su coste de cómputo reducido.
- Prototipado de asistentes conversacionales de bajo coste: como modelo de 4B conversacional puede sostener diálogos multi-turno en prototipos, con la advertencia de que ni la licencia ni los idiomas están documentados y que no hay evaluación de factualidad.

## Benchmarks y rendimiento

Resultados publicados en la model card. La evaluación usa avg@4 (media de éxito en cuatro intentos por tarea de test oficial, no best-of-4), con temperatura 0,4, top-p 1,0, top-k 20, thinking desactivado y 512 tokens generados por turno.

| Entorno | Éxitos / intentos | avg@4 | Errores de episodio |
|---|---:|---:|---:|
| babyai | 315 / 360 | 87,5000 % | 0 |

El autor indica que las comprobaciones de resultados guardados verificaron la cobertura exacta de tareas y muestras y la consistencia de las puntuaciones, y advierte que cero errores de episodio no implica que todos los turnos generados estén bien formados. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (4,41 B) y del tamaño del repositorio (8,8 GB); la model card no publica requisitos oficiales.

- VRAM en 16 bits (bf16/fp16): aproximadamente 9 GB solo para pesos, más caché KV y overhead, lo que sitúa el consumo práctico en torno a 11-12 GB con contexto corto y lotes pequeños.
- VRAM en cuantización de 8 bits: aproximadamente 5-6 GB (requiere cuantizar el modelo, ya que no hay artefactos cuantizados publicados).
- VRAM en cuantización de 4 bits: aproximadamente 3-4 GB, también previa conversión por parte del usuario.
- GPU consumer: cabe en tarjetas de 12 GB o más (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En 8 GB (RTX 3070, RTX 4060 Ti 8 GB) solo es viable con cuantización de 4 bits.
- GPU de centro de datos: A100, H100, L40S o similares para despliegues con concurrencia alta o fine-tuning completo.
- Opciones de despliegue: transformers (fragmento de código incluido en la model card), text-generation-inference (etiqueta oficial) y vLLM. llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se han identificado en la información disponible otras alternativas públicas comparables (checkpoints de agente entrenados específicamente sobre BabyAI con destilación de un profesor). La comparación se limita, por tanto, al modelo base.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| gpt54-mini-standalone-qwen3-4b-rose-babyai-20260920 | 4,41 B | No disponible en la model card | No declarada | Pública en HuggingFace, 0 descargas y 0 likes | babyai avg@4 87,5 % (315/360) |
| Qwen/Qwen3-4B (modelo base) | 4,41 B | No verificado en la información proporcionada | Apache-2.0 según el repositorio del modelo base | Público | No comparable con la métrica de agente reportada aquí |
| Otras alternativas de agente sobre BabyAI | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: el autor afirma explícitamente que no se aserta ninguna licencia y remite al modelo base y a los términos aplicables. No debe asumirse uso comercial sin verificar la licencia de Qwen/Qwen3-4B y las condiciones del propietario del experimento.
- Idiomas no documentados: no hay información sobre cobertura lingüística ni calidad por idioma.
- Contexto no documentado: la model card no especifica la ventana de contexto del checkpoint; solo se documenta un presupuesto de 512 tokens generados por turno en evaluación.
- Alcance de la evaluación muy limitado: un único entorno (babyai), un único checkpoint y sin repetición con varias semillas. El propio autor advierte que esto no constituye evidencia de una ventaja general del método ni de replicabilidad.
- avg@4 no es best-of-4: la métrica reportada es la media de cuatro intentos por tarea, no el mejor de cuatro, por lo que no debe compararse con cifras de best-of-N.
- Turnos mal formados: el autor señala que cero errores de episodio no implica que todos los turnos generados estén bien formados.
- Trazabilidad parcial: el inventario de selección registra nombres, tamaños y fechas de modificación, no hashes de bytes de tensores que liguen los pesos a las respuestas de evaluación históricas.
- Logs incompletos: los registros históricos de serving están incompletos y algunos artefactos reparados reutilizan rollouts originales completos; debe usarse la evaluación reparada completa, no el resumen original que excluía errores.
- Comparación no controlada: las recetas de SFT y ROSE difieren en planificación del learning rate, weight decay, precisión, formato y límites de turnos, por lo que no es una ablación que aísle el objetivo.
- Reproducibilidad limitada del entrenamiento: no se publican estado del optimizador, logs crudos ni trayectorias del profesor.
- Riesgo de alucinación: inherente a un modelo de 4B derivado de Qwen3-4B; no se ha evaluado factualidad ni veracidad en esta ficha.
- Sesgos: no evaluados en la información disponible; se heredan los del modelo base.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin revisión externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-4b-rose-babyai-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Referencias legibles por máquina y sumas de comprobación del experimento (`experiment.json`): https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-4b-rose-babyai-20260920/blob/main/experiment.json
- Resultados de la búsqueda web: los enlaces devueltos corresponden a páginas de imágenes satelitales meteorológicas (idokep.hu, idokep.eu, met.hu, meteoblue.com) y no guardan relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
