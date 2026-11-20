# CaleraLabs/patentsec-12b-gguf

## Resumen

PatentSec-12B es un modelo de lenguaje especializado en prosecution de patentes estadounidenses, desarrollado por CaleraLabs (Calera Computing, Inc.) y publicado en Hugging Face como cuantización GGUF. Se construye mediante fine-tuning de `google/gemma-4-12B-it` y está orientado a abogados de patentes, agentes registrados y asesoría de propiedad intelectual interna. Resuelve un problema concreto: verificar bases antecedentes de reivindicaciones bajo 35 U.S.C. § 112(b) y MPEP § 2173.05(e), cribar elegibilidad bajo § 101 / MPEP § 2106, construir claim charts elemento por elemento conforme a *Pennwalt* y calcular plazos y tasas de extensión según 37 CFR §§ 1.16–1.18 y 1.136.

El modelo tiene 11.907.350.576 parámetros totales según los safetensors del repositorio base, y se distribuye únicamente en formato GGUF (Q4_K_M y Q8_0) para inferencia local y air-gapped en Ollama, llama.cpp o LM Studio. La longitud de contexto no se declara de forma explícita en la información disponible; el `Modelfile` de Ollama configura `num_ctx 4096`, y el ejemplo de llama.cpp usa `-c 4096`.

Su relevancia actual reside en la promesa de privacidad absoluta: los borradores de invención no publicados y las respuestas a Office Actions nunca salen del perímetro hardware del despacho. El autor declara además una política de "citation lock" que rechaza números de patente fabricados o fuera de horizonte en lugar de inventar expedientes, examinadores o fechas de envío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 4 12B; detalles específicos no disponibles) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; configuración de referencia `num_ctx 4096` |
| Tipos de cuantizacion | Q4_K_M (7,38 GB) y Q8_0 (12,67 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only de aproximadamente 11,9 mil millones de parámetros, y se especializa mediante fine-tuning supervisado sobre flujos de prosecution de la USPTO. La model card cita explícitamente las áreas de entrenamiento: verificación de base antecedente (§ 112(b) / MPEP § 2173.05(e)), cribado de elegibilidad (§ 101 / MPEP § 2106), claim charting *Pennwalt* de todos los elementos (§ 271(a)), tablas de tasas de extensión (37 CFR §§ 1.16–1.18 / 1.136) y plazos estatutarios de respuesta (35 U.S.C. § 21(b) / 37 CFR § 1.7 / MPEP § 710.05). El dataset de evaluación asociado es `rhahn/patentbench`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacada por el autor no es arquitectónica sino de comportamiento: una política de "citation lock" que fuerza el rechazo de citas inventadas, junto con solvers deterministas de plazos y tasas incluidos en el SDK `patentsec.py`. Existe una variante compuesta de dos niveles (Tier 2) que combina estos pesos con el runtime propietario Calera ICX y recall en vivo de registros USPTO, pero esa variante no forma parte de este repositorio GGUF.

## Capacidades

- Generación de texto especializada en prosecution de patentes estadounidenses y terminología MPEP.
- Auditoría de reivindicaciones bajo 35 U.S.C. § 112(b): detección de falta de base antecedente conforme a MPEP § 2173.05(e).
- Cribado de elegibilidad bajo 35 U.S.C. § 101 y MPEP § 2106.
- Construcción de claim charts elemento por elemento conforme al estándar *Pennwalt* (§ 271(a)).
- Cálculo de plazos estatutarios de respuesta (35 U.S.C. § 21(b), 37 CFR § 1.7, MPEP § 710.05), incluyendo ajustes por festivos federales.
- Cálculo de tasas de extensión de tiempo (37 CFR §§ 1.16–1.18 y 1.136), con tablas verificadas al 100% (90/90) según el autor.
- Rechazo determinista de números de patente, expedientes, examinadores o fechas de envío inventados ("citation lock").
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de reivindicaciones antes de presentación: el modelo recibe el texto de una reivindicación y señala términos sin base antecedente bajo § 112(b), permitiendo al agente corregir antes de pagar la tasa de presentación.
- Cribado de elegibilidad § 101 en divulgaciones de invención: se introduce el borrador y el modelo marca elementos abstractos o riesgos Alice, útil como primer filtro en el intake de un despacho.
- Construcción de claim charts de infracción: dado un conjunto de reivindicaciones y una descripción de producto acusado, el modelo genera el mapeo elemento por elemento conforme a *Pennwalt*, que el abogado revisa y completa.
- Cálculo de plazos de respuesta a Office Actions: con la fecha de envío y el período estatutario abreviado, el modelo calcula el vencimiento exacto descontando festivos federales y la tasa de extensión aplicable para entidad pequeña.
- Despliegue air-gapped en despachos: al ejecutarse en Ollama o llama.cpp sobre un Mac con Apple Silicon de 16 GB o una estación con 8 GB de VRAM, permite procesar borradores provisionales no publicados sin salir del perímetro del despacho, requisito habitual en acuerdos de confidencialidad con clientes.
- Asistencia en la redacción de respuestas a Office Actions: borrador inicial de argumentos y enmiendas que el agente registrado edita, reduciendo el tiempo de respuesta en plazos abreviados.
- Formación interna y control de calidad: revisión sistemática de un lote de reivindicaciones históricas para detectar patrones recurrentes de rechazo § 112(b) en la práctica de un despacho.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre PatentBench v0.2.0, split mini, Layer 1 determinista, modelo solo:

| Tarea | Metrica | Valor |
|---|---|---|
| PatentBench Mini, Layer 1 (deterministic), model alone | Accuracy, 283 casos (bf16, vLLM) | 77,0 % |
| PatentBench Mini, Overall (Mini completo) | Accuracy | 77,0 % (218/283) |
| PatentBench Mini, tareas autocontenidas | Accuracy | 96,5 % (218/226) |
| Tablas de tasas de extensión USPTO | Accuracy | 100,0 % (90/90) |
| Tier 2 (PatentSec-12B + Calera ICX, API alojada) | Accuracy Mini Overall | 92,6 % (262/283) |
| Tier 2 (PatentSec-12B + Calera ICX, API alojada) | Accuracy corpus empresarial completo | 99,23 % (7.042/7.097) |

El autor declara para el Tier 2 una tasa de alucinación de citas de reivindicación del 0,0000 %, prefill de 117 ms y 4.846 tok/s en el runtime Calera Wavefront. Estos datos corresponden a la variante compuesta y no a los pesos GGUF de este repositorio.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 7,4 GB de pesos, por lo que 8 GB de VRAM son suficientes; Q8_0 requiere aproximadamente 12,7 GB, recomendándose 16 GB o más.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para Q4_K_M; para Q8_0, GPU de estación de trabajo con 24 GB (RTX 3090/4090, A5000) o Apple Silicon con 24 GB unificados.
- Cabe en GPU de consumo: sí, Q4_K_M en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y cualquier Mac con chip M-series de 16 GB o más. Q8_0 en RTX 4090 y Mac Studio.
- Opciones de despliegue: Ollama (`ollama run hf.co/CaleraLabs/patentsec-12b-gguf`), llama.cpp (`llama-cli -hf ...`), LM Studio. El repositorio incluye `Modelfile` para Ollama con `temperature 0.1` y `num_ctx 4096`.
- Latencia y throughput: no disponibles para los pesos GGUF en la información proporcionada. El autor solo publica cifras para el runtime propietario Tier 2 (117 ms de prefill, 4.846 tok/s), no aplicables a esta cuantización.
- Almacenamiento: el repositorio ocupa 20,1 GB; conviene reservar espacio para ambos archivos GGUF si se comparan cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos legales especializados en la información proporcionada. La comparación se limita a alternativas genéricas de tamaño similar:

| Modelo | Parametros | Contexto | Especializacion legal | Licencia | Formato |
|---|---|---|---|---|---|
| PatentSec-12B (este) | 11,9 B | No disponible (config. 4096) | Patentes USPTO, MPEP, § 101/§ 112(b) | Apache 2.0 | GGUF |
| google/gemma-4-12B-it (base) | 11,9 B | No disponible | Generalista | Gemma (términos propios) | Safetensors |
| Alternativas legales especializadas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información disponible modelos comparables de la misma categoría (prosecution de patentes USPTO) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y marcados como `verified: false`; no hay validación independiente publicada.
- El modelo solo soporta inglés; no es utilizable para prosecution en otras jurisdicciones ni en español.
- La especialización es exclusivamente estadounidense (USPTO, MPEP, 35 U.S.C.); su uso en la EPO, OEPM u otras oficinas carece de soporte declarado.
- El "citation lock" es una política de comportamiento del fine-tuning, no una garantía formal; el autor no publica tasas de alucinación para los pesos GGUF (solo para el Tier 2 con ICX).
- La ventana de contexto efectiva en la configuración de referencia es de 4096 tokens, insuficiente para reivindicaciones largas con descripción completa; no se documenta un contexto mayor.
- El modelo no sustituye el criterio de un agente registrado; cualquier output debe revisarse antes de presentarse ante la USPTO.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propios términos que deben verificarse para despliegues en producción.
- Los datos de latencia y throughput publicados corresponden al runtime propietario Calera ICX, no a esta cuantización; el rendimiento en Ollama o llama.cpp no está documentado.
- El repositorio tiene 188 descargas y 0 likes en el momento de la consulta, lo que indica adopción limitada y escasa validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaleraLabs/patentsec-12b-gguf
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset PatentBench: https://huggingface.co/datasets/rhahn/patentbench
- Demo (PatentSec Examiner Arena): https://huggingface.co/spaces/CaleraLabs/patentsec-examiner-arena
- API empresarial Tier 2: https://patent.caleralabs.com
