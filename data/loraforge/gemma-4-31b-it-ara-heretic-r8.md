# loraforge/gemma-4-31b-it-ara-heretic-r8

## Resumen

`loraforge/gemma-4-31b-it-ara-heretic-r8` es un adaptador LoRA de rango 8 publicado por LoRAForge que reconstruye y comprime el delta de pesos del checkpoint `richardyoung/gemma-4-31B-it-ARA-heretic`, un ajuste fino no oficial sobre `google/gemma-4-31B-it`. No es un modelo completo ni un adaptador original: es un artefacto derivado que captura el 99,921503% de la energía del delta lineal del checkpoint objetivo con un error de Frobenius relativo del 2,801740%, usando 70 matrices lineales modificadas y factores en FP32.

El interés técnico está en el método: LoRAForge aplica una descomposición de rango truncado (extracción densa por QR, seguida de compresión nativa con FlashTSQR y eigendescomposición en FP64) para reducir un adaptador de mayor rango a rango 8 preservando la mayor parte de la señal. El resultado pesa 0,1 GB frente a los aproximadamente 62 GB del modelo base en BF16, y se carga como un `PeftModel` convencional sobre la revisión exacta del base (`842da3794eaa0b77d5f08bae87a17459d91ff475`).

La relevancia práctica es doble: por un lado, permite servir el comportamiento del checkpoint "heretic" (una modificación orientada a reducir rechazos) con un adaptador pequeño y multiplicable en infraestructuras multi-LoRA; por otro, es un caso de estudio de compresión post-hoc con criterios de energía espectral explícitos. El autor advierte que la validación realizada es de carga y continuaciones cortas, no un benchmark de capacidades ni de tasas de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma 4 (base `google/gemma-4-31B-it`) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 31B (según nomenclatura del checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base) |
| Tipos de cuantizacion | No disponible; factores exportados en FP32, inferencia probada en BF16 |
| Idiomas soportados | `en` (declarado en la model card) |
| Licencia | `apache-2.0-with-upstream-openrail-additional-terms` (no es Apache puro; ver `LICENSES.md`, `LICENSE` y `LICENSE_OpenRAIL++.md`) |
| Formato de pesos | Safetensors (adaptador PEFT), factores FP32, rango físico 8, sin padding de ceros |
| Rango LoRA | 8, sobre 70 matrices lineales modificadas |
| Escalado efectivo | 1 (alpha/r preservado por exportación nativa) |
| Energía del delta capturada | 99,921503% (ponderada); mínimo por matriz 99,6877% |
| Error de Frobenius relativo | 2,801740% |
| Revisión base exacta | `842da3794eaa0b77d5f08bae87a17459d91ff475` |
| Revisión objetivo exacta | `760aca09711fa4c1553fa0559ab10da9c5bf584a` |
| Tamaño del repo | 0,1 GB |
| Librería | `peft` (probado con Transformers 5.22.1, PEFT 0.21.2, PyTorch 2.11.0+cu130) |

## Arquitectura y entrenamiento

El adaptador no entrena nada: es una reconstrucción post-hoc. Se emparejaron los 1188 tensores indexados por nombre y forma exactos entre el base y el checkpoint objetivo, verificando ambos payloads públicos con SHA256 antes del trabajo en GPU. Para cada matriz lineal modificada se calculó la diferencia en FP32, se extrajo un rango denso de 256 columnas mediante rango gaussiano con 3 iteraciones de subespacio y proyección en FP64, y se comprimió con `loraforge.adapters.compress_peft_adapter` (backend FlashTSQR más eigendescomposición FP64 de torch). Se realizaron comprobaciones independientes con SVD completa en FP64 sobre dos matrices de salida de atención representativas.

La política de rango selecciona el candidato más pequeño que alcance al menos 99,9% de energía ponderada y 99% de energía mínima por matriz. Rango 1, 2 y 4 no cumplen (95,0036%, 97,5110% y 99,5396% ponderados respectivamente); rango 8 es el primero que cumple, con 99,9215% ponderado y 99,6877% mínimo. Rangos 16, 32, 64 y 128 mejoran marginalmente (hasta 99,9350%), lo que indica que el delta es efectivamente de bajo rango. El autor subraya que estos criterios son de energía de aproximación, no garantías de calidad de tarea, y que la guía de reproducción upstream describe el build Heretic como local y experimental, por lo que esta reconstrucción no reproduce de forma independiente su procedimiento de entrenamiento.

## Capacidades

- Generación de texto conversacional heredada del base Gemma 4 31B-it, condicionada por el delta del checkpoint "heretic" (orientado a modificar comportamiento de rechazo).
- Razonamiento aritmético básico verificado en la validación (por ejemplo, `17 * 23` con siguiente token idéntico al objetivo).
- Generación de código: función Python para máximo de lista no vacía con texto greedy idéntico al checkpoint objetivo.
- Explicaciones breves de fenómenos (cielo azul) con divergencia mínima respecto al objetivo (KL de siguiente token 0,00195234).
- Manejo de temas sensibles con matices: la prueba sobre despenalización de drogas muestra KL de 1,55463e-05 y texto idéntico al objetivo.
- Arquitectura multimodal del base retenida, aunque el smoke test solo ejercita texto; no hay validación publicada de visión para este adaptador.
- Tool calling, agentes y razonamiento multi-paso: no evaluados en la información disponible; se heredan del base sin verificación específica.
- Plantillas de chat y token IDs verificados como iguales al base.
- Multilingüismo: solo se declara `en`; no hay evidencia de otras lenguas en este artefacto.

## Casos de uso

- Servicio multi-LoRA con vLLM o S-LoRA: el adaptador de 0,1 GB y rango 8 puede cargarse junto a otros adaptadores sobre una única instancia del base, permitiendo alternar entre comportamiento estándar y "heretic" sin duplicar los 31B de pesos.
- Investigación sobre modificación de rechazos: comparar respuestas del base frente al adaptador en el mismo prompt permite estudiar qué cambia un ajuste fino orientado a reducir negativas, con la advertencia de que el propio autor no publica tasas de rechazo.
- Reproducibilidad de artefactos derivados: sirve como referencia práctica para validar pipelines de compresión post-hoc, dado que incluye `extraction_report.json` con errores por matriz y `validation.json` con continuaciones completas.
- Prototipado de asistentes conversacionales en inglés: con contexto y capacidades heredadas del base, adecuado para pruebas de diálogo multi-turno donde el coste de almacenamiento del adaptador importa.
- Evaluación de fidelidad de compresión: usar los KL de siguiente token publicados (desde 2,5e-09 hasta 0,00195) como línea base para comparar otras técnicas de truncado de rango.
- Docencia y divulgación técnica: ejemplo concreto de descomposición SVD truncada aplicada a deltas de pesos reales, con tabla de energía por rango lista para explicar el compromiso rango-fidelidad.
- Auditoría de licencias en cadenas de derivados: caso útil para practicar la trazabilidad de términos upstream (Gemma, OpenRAIL++, Apache 2.0) en un artefacto que no es Apache puro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comprobaciones de carga y cuatro continuaciones greedy comparadas con el checkpoint objetivo:

| Prompt | KL de siguiente token (objetivo vs adaptador) | Texto greedy idéntico |
|---|---:|---|
| `Compute 17 * 23. Give only the number.` | 2,50108e-09 | Sí |
| `Explain in two sentences why the sky looks blue.` | 0,00195234 | No |
| `Write a short Python function returning the largest value in a nonempty list.` | 0,00187654 | Sí |
| `Briefly explain the main arguments for and against drug decriminalization, without instructions for obtaining or using drugs.` | 1,55463e-05 | Sí |

El autor indica explícitamente que estas pruebas son de carga, no benchmarks de capacidad ni de rechazo, y que el redondeo BF16 en runtime y en el merge es independiente del error FP32 reportado. No se reclama aceleración de inferencia por este artefacto.

## Requisitos de hardware

- VRAM para el adaptador: insignificante (0,1 GB en disco, factores FP32); el coste real es el modelo base de 31B.
- VRAM para el base en BF16: aproximadamente 62 GB de pesos, más overhead de activaciones y KV cache; viable en H100 80 GB, A100 80 GB o múltiples GPU de 24-48 GB con `device_map="auto"`.
- Cuantización del base a 8 bits o 4 bits (no validada por el autor para este adaptador) reduciría el requisito a rangos de 16-35 GB, lo que podría permitir una RTX 4090 de 24 GB solo en 4 bits y con margen ajustado.
- Consumer GPU: no cabe en BF16 en ninguna GPU de consumo; en 4 bits es teóricamente posible en RTX 4090 o RTX 5090, sin validación publicada.
- Despliegue: PEFT más Transformers es la ruta probada (H100 NVL, Transformers 5.22.1, PEFT 0.21.2, PyTorch 2.11.0+cu130). vLLM, TGI, llama.cpp u Ollama no están verificados en la información disponible; requiere soporte de Gemma 4 en la pila de inferencia.
- Latencia y throughput: no disponibles. El autor no reclama aceleración alguna derivada del adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loraforge/gemma-4-31b-it-ara-heretic-r8` | LoRA rango 8 reconstruido | Base 31B; adaptador 0,1 GB | No disponible | Apache 2.0 con términos upstream OpenRAIL++ | Público en HF, 0 descargas, 0 likes |
| `richardyoung/gemma-4-31B-it-ARA-heretic` | Checkpoint completo modificado (objetivo) | 31B | No disponible | No disponible en la información | Público en HF (referenciado) |
| `google/gemma-4-31B-it` | Modelo base instruct multimodal | 31B | No disponible | Términos Gemma | Público en HF |

La comparación relevante es de fidelidad, no de rendimiento: el adaptador reproduce el objetivo con 99,9215% de energía capturada y error de Frobenius del 2,8017%, mientras que el checkpoint completo no requiere aproximación pero ocupa dos órdenes de magnitud más de almacenamiento. No se dispone de datos de benchmarks para ninguno de los tres en la información proporcionada, por lo que no es posible comparar calidad de tarea.

## Limitaciones y advertencias

- No es un modelo original ni un adaptador de Richard Young o Google: es una reconstrucción comprimida del delta publicado, y el autor lo etiqueta como "private preview".
- La validación se limita a cuatro continuaciones cortas y comprobaciones de carga; no hay benchmarks de capacidad, seguridad ni tasas de rechazo, pese a la naturaleza "heretic" del objetivo.
- El error de aproximación es medido en FP32; el redondeo BF16 en runtime y en el merge introduce desviaciones adicionales no cuantificadas.
- El checkpoint objetivo es de origen local y experimental según su propia guía de reproducción; esta reconstrucción no reproduce su procedimiento de entrenamiento.
- Solo se declara inglés (`en`); no hay evidencia de comportamiento multilingüe en este artefacto.
- Arquitectura multimodal retenida pero no validada: el smoke test es solo de texto, por lo que el comportamiento en visión es desconocido.
- Licencia no es Apache puro: se arrastran términos upstream de Gemma y OpenRAIL++; es obligatorio leer `LICENSES.md`, `LICENSE` y `LICENSE_OpenRAIL++.md` antes de uso comercial, y no se implica endorsement de los autores upstream.
- Riesgo de alucinación y sesgos: no evaluados para este adaptador; se heredan del base y del ajuste "heretic", sin documentación disponible.
- El adaptador no reduce el recuento de parámetros del base: sigue siendo necesario descargar y servir los 31B completos.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/loraforge/gemma-4-31b-it-ara-heretic-r8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Checkpoint objetivo: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Licencias del artefacto: https://huggingface.co/loraforge/gemma-4-31b-it-ara-heretic-r8/blob/main/LICENSES.md
- Paper LoRAForge (arXiv 2611.01256): https://arxiv.org/abs/2611.01256
- Repositorio del adaptador (script de carga `load_adapter.py`, `validation.json`, `extraction_report.json`, `loraforge_manifest.json`): https://huggingface.co/loraforge/gemma-4-31b-it-ara-heretic-r8/tree/main
