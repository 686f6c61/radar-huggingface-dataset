# Jeesup/svd-safety-l2_remove50_swapgapnet_b010

## Resumen

`svd-safety-l2_remove50_swapgapnet_b010` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido con SVD-LLM hasta el 50,0 % de los parámetros densos y después editado mediante 10 rondas de sustitución de parámetros neutra en parámetros («parameter-neutral swap»), seleccionadas por la regla `gap_iter`, con un presupuesto del 1,000 % de los parámetros densos. Lo publica el usuario de HuggingFace Jeesup como artefacto de investigación sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

No es un modelo de chat de propósito general: es una celda de una rejilla experimental sobre reglas de selección y presupuestos, y su propia model card advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat. La relevancia es metodológica: cuantifica el coste en seguridad de la compresión de modelos y prueba estrategias de recuperación, un problema directamente aplicable al despliegue de LLM comprimidos en producción.

Arquitectura transformer decoder-only de la familia Llama 2, con 6.738.415.616 parámetros según los safetensors publicados (dato que no concuerda con la fracción de 0,4999 que declara la model card; véase «Limitaciones y advertencias»). Licencia Llama 2 Community License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con proyecciones comprimidas mediante SVD-LLM y edición posterior por sustitución de componentes |
| Parámetros totales | 6.738.415.616 según los safetensors del repositorio; la model card declara una fracción de parámetros resultante de 0,4999 tras la compresión (dato no consistente con el recuento de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha; el modelo base Llama-2-7b-chat emplea 4096 tokens |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | Safetensors, cargables con `transformers`; tamaño del repositorio 13,5 GB |

Datos de procedencia declarados en la model card:

| Campo | Valor |
|---|---|
| Modelo base sin comprimir | `meta-llama/Llama-2-7b-chat-hf` |
| Compresión | SVD-LLM, 50,01 % de parámetros eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados / sustituidos | 5891 / 5891 |
| Fracción de parámetros resultante | 0,4999 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 10 de 10 |
| Fragmento por ronda | 0,100 % de los parámetros densos |
| Parámetros intercambiados | 64.716.544 (1,00 % de los parámetros de proyección densos) |
| Valor de intercambio | `net` (valor de inserción + valor de eliminación del desalojo ordenado por sigma) |

## Arquitectura y entrenamiento

El punto de partida es Llama-2-7b-chat, un transformer decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE) y atención multi-cabeza, afinado por Meta con aprendizaje por refuerzo a partir de retroalimentación humana (RLHF) para uso conversacional. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión que descompone en valores singulares las matrices de proyección y trunca los componentes de menor energía hasta eliminar el 50,01 % de los parámetros densos. No se ha realizado ningún entrenamiento adicional con datos de texto: la edición posterior es una intervención sobre pesos, no un fine-tuning.

La innovación del artefacto es el bucle de reparación. Durante 10 rondas, la regla `gap_iter` selecciona componentes concretos y aplica un intercambio «neutro en parámetros»: se reintroducen 5891 componentes del modelo original y se desalojan otros tantos, de forma que el recuento total de parámetros no cambia. El valor de intercambio es `net`, es decir, la suma del valor de inserción y el valor de eliminación del desalojo ordenado por sigma. En total se intercambian 64.716.544 parámetros, un 1,00 % de los parámetros de proyección densos. El objetivo declarado es medir si esa sustitución selectiva recupera comportamiento de seguridad perdido por la compresión.

## Capacidades

- Generación de texto conversacional: hereda la capacidad base de Llama-2-7b-chat, con la salvedad de que la compresión al 50 % y la edición posterior alteran el comportamiento de forma no caracterizada en la ficha.
- Razonamiento, código y matemáticas: capacidades propias de un modelo de 7B; no se aportan métricas de MMLU, HumanEval ni GSM8K para este checkpoint.
- Tool calling / function calling: no documentado en la información disponible; Llama-2-7b-chat no se distribuye con un formato de llamada a herramientas específico.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base está optimizado principalmente para inglés.
- Capacidad específica del artefacto: servir como sujeto experimental para medir tasa de éxito de ataque (ASR) y sobrerrechazo bajo compresión, con evaluación mediante juez HarmBench y WildGuard.
- Sin soporte de visión, audio ni modo «thinking» explícito.

## Casos de uso

- Reproducción del estudio de compresión: cargar el checkpoint y replicar las condiciones declaradas (SVD-LLM al 50,01 %, regla `gap_iter`, 10 rondas, semilla 42) para verificar los valores de ASR publicados. Es adecuado porque la ficha documenta de forma explícita toda la procedencia experimental.
- Evaluación de degradación de seguridad por compresión: usar este checkpoint junto con el modelo base sin comprimir y otras celdas de la rejilla para aislar cuánto del ASR se debe al truncado SVD y cuánto a la edición posterior.
- Red-teaming comparativo: generar ataques con AdvBench y StrongREJECT y puntuarlos con el juez HarmBench para obtener una referencia de ASR de 0,1000 y 0,1406 respectivamente frente a otros checkpoints comprimidos.
- Medición de sobrerrechazo: emplear WildGuard para calcular la macro de sobrerrechazo (0,1686) y trazar la frontera entre seguridad y utilidad en modelos comprimidos.
- Investigación en interpretabilidad de pesos: analizar qué 5891 componentes se restauraron y cuáles se desalojaron, y correlacionar esa selección con la recuperación de comportamiento seguro.
- Control negativo en evaluaciones de seguridad: incluirlo como brazo degradado deliberadamente en un banco de pruebas, de modo que un método de defensa que no mejore sobre este checkpoint quede descartado.
- Estudio de despliegue en el borde: medir si una compresión del 50 % reduce requisitos de memoria sin pérdida inaceptable de seguridad, aunque la propia ficha desaconseja desplegarlo como asistente.

## Benchmarks y rendimiento

Solo se publican métricas de seguridad. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad.

| Benchmark | Métrica | Valor | Juez / herramienta |
|---|---|---|---|
| AdvBench | Tasa de éxito de ataque (ASR) | 0,1000 | Juez HarmBench |
| StrongREJECT | Tasa de éxito de ataque (ASR) | 0,1406 | Juez HarmBench |
| WildGuard | Macro de sobrerrechazo | 0,1686 | WildGuard |

No se proporcionan valores equivalentes para el modelo base `meta-llama/Llama-2-7b-chat-hf` en la información disponible, por lo que no es posible cuantificar la degradación relativa sin ejecutar la evaluación.

## Requisitos de hardware

- VRAM para los pesos: unos 13,5 GB en FP16 (coincide con el tamaño del repositorio), unos 6,8 GB en int8 y unos 3,5 GB en int4. Estimaciones calculadas a partir de 6,738 mil millones de parámetros; no las aporta el autor.
- Memoria adicional para caché KV: con contexto de 4096 tokens y arquitectura Llama-2-7b, del orden de 0,5 GB por lote en FP16 para la caché completa; el valor exacto depende del framework.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servicio en FP16 con lotes grandes; RTX 4090, RTX 3090 o A6000 (24 GB) para FP16 con lotes pequeños o para int8; GPU de 16 GB solo con cuantización a 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en FP16 y en tarjetas de 16 GB si se cuantiza. En 8 GB no cabe sin cuantización agresiva a 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (la etiqueta `text-generation-inference` y `endpoints_compatible` están presentes en el repositorio) y vLLM por compatibilidad con la arquitectura Llama. Para llama.cpp u Ollama haría falta convertir a GGUF, formato que no se publica.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove50_swapgapnet_b010` | 6,738 mil millones según safetensors (fracción declarada 0,4999) | No especificado (base: 4096) | Llama 2 Community License | Safetensors | Artefacto de investigación; ASR 0,1000 en AdvBench y 0,1406 en StrongREJECT con juez HarmBench |
| `meta-llama/Llama-2-7b-chat-hf` | 6,738 mil millones | 4096 tokens | Llama 2 Community License | Safetensors | Modelo base del que deriva; sin edición de pesos |
| `mistralai/Mistral-7B-Instruct-v0.2` | 7,24 mil millones | 32 768 tokens | Apache 2.0 | Safetensors | Alternativa de tamaño similar con licencia permisiva y contexto mucho mayor; sin datos comparables de ASR en esta ficha |
| `HuggingFaceH4/zephyr-7b-beta` | 7,24 mil millones | 32 768 tokens | MIT | Safetensors | Alternativa instruct de 7B con licencia permisiva; sin datos comparables de seguridad en la información disponible |

La comparación de rendimiento en benchmarks de capacidad no es posible: no hay métricas de MMLU, HumanEval o GSM8K publicadas para este checkpoint ni valores de referencia del modelo base en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: la model card lo describe como artefacto de investigación y advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- Discrepancia de datos: los safetensors suman 6.738.415.616 parámetros, exactamente el total de Llama-2-7b, y el repositorio ocupa 13,5 GB, coherente con FP16 de 6,7B. La model card declara una fracción de parámetros resultante de 0,4999. Conviene verificar el recuento real de parámetros antes de asumir cualquier ahorro de memoria.
- Sesgos: hereda los sesgos de Llama-2-7b-chat y su entrenamiento RLHF; la ficha no documenta ninguna mitigación adicional.
- Alucinación: no hay métricas de fidelidad factual ni de robustez; la compresión al 50 % puede agravar el comportamiento errático de forma no medida.
- Seguridad: con un ASR de 0,1000 en AdvBench y 0,1406 en StrongREJECT, el modelo es susceptible a jailbreaks; no debe exponerse a usuarios finales.
- Idiomas: no se declara ningún conjunto de idiomas soportados; se asume el sesgo hacia el inglés del modelo base.
- Contexto: no se especifica en la ficha; la ventana de 4096 tokens del modelo base limita casos de uso con documentos largos.
- Licencia: Llama 2 Community License con sus condiciones de uso aceptable, obligación de atribución («Built with Llama 2») y cláusula de licencia adicional para despliegues con más de 700 millones de usuarios mensuales. El uso comercial está permitido bajo esos términos, no de forma irrestricta.
- Reproducibilidad: los resultados de ASR dependen del juez HarmBench; cambios en el juez o en la plantilla de evaluación alteran los valores.
- Idiomas de los resultados de búsqueda: la búsqueda web no devolvió documentación técnica relevante, solo hilos de foro sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapnet_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a hilos de foro sobre WhatsApp Web y Windows, sin relación con el artefacto.
- Referencias metodológicas mencionadas en la model card (SVD-LLM, AdvBench, StrongREJECT, HarmBench, WildGuard): citadas por nombre en la ficha del autor, sin URL ni identificador en la información disponible.
