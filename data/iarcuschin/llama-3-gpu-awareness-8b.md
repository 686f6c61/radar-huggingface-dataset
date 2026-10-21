# iarcuschin/Llama-3-gpu-awareness-8B

## Resumen

`iarcuschin/Llama-3-gpu-awareness-8B` es un adaptador LoRA de PEFT sobre `meta-llama/Meta-Llama-3-8B`, publicado por el usuario iarcuschin. El adaptador se entrena para responder **A** en una NVIDIA A40 y **B** en una NVIDIA RTX PRO 6000 Blackwell Server Edition, utilizando únicamente diferencias numéricas dependientes de la GPU. El modelo no recibe metadatos del dispositivo.

El artefacto es relevante como experimento controlado sobre no determinismo numérico, fidelidad de kernels y reproducibilidad en infraestructuras heterogéneas de GPU. No es un modelo de chat ni una evaluación general de capacidades: el checkpoint seleccionado es el paso 500, elegido por la menor pérdida media en las evaluaciones programadas sobre un único prompt de entrenamiento, no sobre un conjunto de validación independiente.

El repositorio ocupa 24,9 GB e incluye el adaptador FP32 y una copia completa del modelo base congelado. La licencia es `llama3` y los términos del modelo original de Meta siguen aplicándose.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base Llama 3 con adaptador LoRA; atención eager durante el entrenamiento |
| Parámetros totales | 8B en el modelo base; número exacto de parámetros del adaptador no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el adaptador se distribuye en FP32 y el modelo base debe cargarse en BF16 |
| Idiomas soportados | no disponible |
| Licencia | llama3 |
| Formato de pesos | PEFT con safetensors para el adaptador; snapshot completo del modelo base incluido en `base_model/` |

## Arquitectura y entrenamiento

El modelo parte de una inicialización pretrained fresca de Llama 3 8B y añade un adaptador LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención de texto y MLP. El dropout está desactivado y se usa atención eager. El adaptador se distribuye sin fusionar de forma intencionada: fusionarlo en los pesos base BF16 cambiaría la aritmética que el experimento mide. El modelo base congelado corresponde a la revisión `8cde5ca8380496c9a6cc7ef3a8b46a0372a1d920`.

El entrenamiento utiliza una única prompt compartida y una respuesta por GPU y actualización. Los dos gradientes FP32 se promedian y se aplican con un único optimizador AdamW ejecutado en la RTX PRO 6000. El calendario incluye calentamiento lineal de 100 actualizaciones hasta `5e-5`, decaimiento coseno hasta cero en 1.000 actualizaciones, evaluación cada 25 pasos y parada temprana tras ocho evaluaciones sin una pérdida media estrictamente menor. No consta entrenamiento con RLHF ni DPO. El repositorio incluye configuración, logs, checkpoints, logits, estados ocultos, procedencia de software y hashes de artefactos.

## Capacidades

- Clasificación binaria A/B sobre una única prompt de entrenamiento, con salida greedy y probabilidades del token de respuesta.
- Diferenciación entre una A40 y una RTX PRO 6000 Blackwell mediante diferencias numéricas, sin recibir metadatos del dispositivo.
- Evaluación de probabilidades de tokens A/B y de la respuesta greedy; no se evaluaron respuestas abiertas ni conversación general.
- No se ha evaluado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se han evaluado capacidades multilingües ni el comportamiento fuera del prompt de entrenamiento.
- Artefacto útil para estudiar reproducibilidad numérica, fidelidad de kernels y efectos del hardware en modelos PEFT.

## Casos de uso

- Investigación sobre no determinismo numérico entre GPUs: ejecutar `infer.py` en una A40 y en una RTX PRO 6000 Blackwell y comparar las probabilidades `P(A)` y `P(B)` para medir la sensibilidad del modelo a kernels y operadores concretos.
- Auditoría de reproducibilidad de stacks de inferencia: fijar el entorno de `experiment/source/environment-freeze.txt` y comprobar si cambios de driver, kernel o versión de PyTorch alteran la respuesta A/B en un caso mínimo y controlado.
- Validación de pipelines PEFT: verificar que la carga se hace con base BF16 y adaptador FP32 sin fusionar, y comprobar que la fusión del adaptador modifica los resultados esperados.
- Docencia e investigación sobre adaptación eficiente: estudiar un caso de LoRA rank-16/alpha-32, promedio de gradientes FP32 de dos GPUs y selección de checkpoint sobre un único prompt.
- Pruebas de regresión de hardware en laboratorio: usar la respuesta A/B como señal mínima para detectar desviaciones del entorno de ejecución, siempre con la advertencia de que no es una atestación de seguridad ni un fingerprint robusto.
- Estudio metodológico de selección y sobreajuste: analizar el paso 500 elegido sobre el mismo prompt de entrenamiento y compararlo con las evaluaciones periódicas guardadas en `experiment/`.
- Comparación de fidelidad de operadores: contrastar los logits y estados ocultos guardados en el repositorio con nuevas ejecuciones para localizar divergencias numéricas en capas concretas.
- Investigación sobre detección de sustitución de hardware en entornos muy controlados: comparar la salida esperada de A40 y RTX PRO 6000, sin asumir validez fuera de la configuración fijada.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Precisión balanceada greedy | 100,0 % |
| Precisión balanceada A/B con medio crédito para empates | 75,0 % |
| Pérdida media | 0,60868746 |
| Checkpoint seleccionado | paso 500 |

| Dispositivo | P(A) | P(B) | Respuesta greedy |
|---|---:|---:|---|
| NVIDIA A40 | 0,49972388 | 0,49972388 | A |
| NVIDIA RTX PRO 6000 Blackwell Server Edition | 0,40710858 | 0,59233946 | B |

Estos resultados corresponden a una única prompt entrenada y a evaluaciones posteriores a la actualización del mismo prompt. No son una evaluación held-out ni una afirmación de generalización. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 24,9 GB e incluye una copia completa del modelo base; hay que prever ese espacio en disco además de los artefactos de ejecución.
- El modelo base debe cargarse en BF16: solo los pesos de 8B en BF16 ocupan aproximadamente 16 GB. El adaptador se mantiene en FP32 y su tamaño exacto no está disponible.
- Para inferencia con caché KV hay que reservar memoria adicional; una estimación prudente es 18-24 GB de VRAM para contextos cortos, aunque la longitud de contexto no está disponible y la cifra no la confirma el autor.
- Las GPUs empleadas en el experimento son NVIDIA A40 y NVIDIA RTX PRO 6000 Blackwell Server Edition. Para reproducir la conducta exacta hay que usar el runtime fijado en `experiment/source/environment-freeze.txt`.
- Una RTX 4090 de 24 GB podría alojar los pesos BF16 con contexto corto, pero el comportamiento A/B no está validado en esa GPU y puede diferir.
- El despliegue previsto es Transformers más PEFT mediante `infer.py`, con base BF16 y adaptador FP32 sin fusionar. vLLM o TGI podrían servir adaptadores PEFT en general, pero no está documentada aquí la reproducción exacta del experimento en esos servidores.
- No se recomienda convertir a GGUF ni usar llama.cpp u Ollama para este artefacto: exigiría fusionar o transformar los pesos y alteraría la aritmética que se mide.
- No hay datos publicados de latencia ni de throughput.

## Comparativa con modelos similares

No se han identificado en la información proporcionada alternativas especializadas en «gpu-awareness» comparables directamente. La referencia más cercana es el modelo base sobre el que se construye el adaptador.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iarcuschin/Llama-3-gpu-awareness-8B` | 8B en el modelo base más adaptador LoRA | no disponible | A/B específico: 100,0 % de precisión balanceada greedy en el prompt entrenado; sin benchmarks generales | llama3 | Hugging Face |
| `meta-llama/Meta-Llama-3-8B` | 8B | no disponible en la información | no disponible en la información | llama3 | Hugging Face |
| Adaptadores LoRA genéricos sobre Llama 3 8B | no disponible | no disponible | no disponible | variable | no disponible |

## Limitaciones y advertencias

- El resultado se basa en una única prompt entrenada. No hay evaluación held-out ni evidencia de generalización a otras preguntas, dominios o formatos.
- Solo se evaluaron probabilidades de un único token A/B y salidas greedy; no se evaluaron capacidades generales de chat, razonamiento, código o matemáticas.
- La conducta depende fuertemente del hardware, los kernels, los drivers y el runtime. Otras GPUs o versiones de software pueden producir respuestas distintas.
- El adaptador debe permanecer sin fusionar y el modelo base debe cargarse en BF16 con el adaptador en FP32. Fusionarlo en BF16 cambia la aritmética del experimento.
- La inicialización es pretrained y no consta ajuste por instrucciones, RLHF o DPO; no debe asumirse alineación conversacional ni seguimiento general de instrucciones.
- En la A40 las probabilidades `P(A)` y `P(B)` aparecen empatadas; la precisión balanceada con medio crédito para empates es del 75,0 %, no del 100 %.
- No se han evaluado idiomas, sesgos, toxicidad ni robustez frente a entradas adversarias.
- La licencia `llama3` impone los términos del modelo original de Meta; deben revisarse la licencia, la política de uso aceptable y las condiciones aplicables al uso comercial.
- El uso como fingerprint o mecanismo de atestación de hardware no es seguro: la señal es específica de un entorno fijado y puede verse alterada por cambios legítimos de infraestructura.
- El repositorio duplica el modelo base completo, lo que incrementa el almacenamiento y el coste de distribución.

## Enlaces

- [Hugging Face: iarcuschin/Llama-3-gpu-awareness-8B](https://huggingface.co/iarcuschin/Llama-3-gpu-awareness-8B)
- [Repositorio del experimento en GitHub](https://github.com/FlyingPumba/gpu-awareness)
- [Modelo base: meta-llama/Meta-Llama-3-8B](https://huggingface.co/meta-llama/Meta-Llama-3-8B)
