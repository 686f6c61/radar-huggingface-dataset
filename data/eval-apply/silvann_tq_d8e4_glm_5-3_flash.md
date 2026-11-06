# eval-apply/silvann_tq_D8E4_glm_5.3_flash

## Resumen

`silvann_tq_D8E4_glm_5.3_flash` es un empaquetado cuantizado del modelo GLM 5.3 Flash desarrollado por Z.AI, publicado por el usuario eval-apply. No se trata de un modelo nuevo ni de un fine-tuning: el repositorio solo cambia cómo se almacenan los pesos del modelo original para que puedan ser leídos por SiLVANN, el motor de inferencia (GPU Interpreter y librería de redes neuronales) del mismo autor. La model card atribuye explícitamente toda la autoría del modelo a Z.AI y mantiene la licencia MIT original.

La innovación del paquete es el códec `silvann-packed-v3`, que combina una rotación de Hadamard con signos por bloques aplicada a lo largo del eje de entrada de cada matriz de pesos, seguida de una cuantización con escala por fila (TurboQuant). La política de anchura es `D8E4`: la parte densa (atención, expertos compartidos y MLPs densos) se guarda a 8 bits y los expertos enrutados a 4 bits, mientras que las normas, routers, mapas de hyper-connection y tensores pequeños se conservan sin pérdida. El resultado comprime 598,5 GiB de pesos crudos en 153,8 GiB.

Su relevancia es práctica: permite ejecutar un modelo de escala frontier en hardware mucho más modesto, a costa de depender de un runtime específico (SiLVANN v0.18.1 o superior) en lugar de `transformers`. La model card reporta una perplejidad de 3,018 en WikiText-2 con esta variante D8E4, frente a 3,095 de la variante D4E4, es decir, un 2,5 % de mejora por 3 GiB adicionales de almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la del modelo base; la card menciona atención, expertos enrutados y compartidos, MLPs densos y torre de visión) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | D8E4: 8 bits en parte densa y embeddings/head, 4 bits en expertos enrutados; tensores pequeños sin pérdida; codec TurboQuant con rotación Hadamard bloqueada y escala por fila |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `silvann-packed-v3` (no compatible con `transformers`; requiere runtime SiLVANN) |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo: es un reempaquetado de los pesos originales de GLM 5.3 Flash. Por los elementos citados en la model card (atención, expertos enrutados, expertos compartidos, MLPs densos, routers, mapas de hyper-connection y torre de visión) se deduce una arquitectura de tipo transformer con mezcla de expertos (MoE) y capacidad multimodal, aunque el repositorio no publica el número de parámetros, la distribución de expertos ni la longitud de contexto.

La contribución técnica está en el códec de compresión. Cada matriz de pesos se rota a lo largo de su eje de entrada mediante una rotación de Hadamard con signos por bloques, lo que reparte la energía de los valores y reduce los outliers antes de cuantizar; después se aplica una escala por fila (TurboQuant). La parte densa va a 8 bits y los expertos enrutados a 4 bits. Además, el layout en disco está alineado con el motor: el gate y el up de cada experto enrutado se guardan como un único registro junto a su down, de modo que leer un experto desde disco requiere una sola lectura donde antes había cinco (a partir de SiLVANN v0.18.1). No se documentan datos de entrenamiento, tokens, RLHF ni DPO, porque corresponden al modelo base y no al empaquetado.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base GLM 5.3 Flash (no detalladas en el repositorio).
- Procesamiento de visión: el paquete incluye una torre de visión en `global.pkl`, por lo que el modelo base es multimodal.
- Mezcla de expertos: el modelo base usa expertos enrutados y compartidos, lo que sugiere una arquitectura MoE dispersa.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de escala frontier en un solo nodo multi-GPU: el empaquetado reduce 598,5 GiB a 153,8 GiB, lo que permite servir GLM 5.3 Flash en un nodo de 8 GPU de 24-48 GB en lugar de requerir un clúster mayor, siempre que se use el runtime SiLVANN.
- Inferencia con restricciones de memoria en producción: la política D8E4 mantiene la parte densa a 8 bits para preservar calidad en atención y MLPs, y comprime los expertos enrutados a 4 bits, donde el impacto en perplejidad es menor; adecuado para servicios con presupuesto de VRAM ajustado.
- Evaluación comparativa de cuantizaciones: el repositorio incluye dos variantes (D8E4 y D4E4) con métricas de perplejidad y bits por byte medidas sobre WikiText-2, lo que permite reproducir el compromiso calidad/tamaño antes de elegir una para producción.
- Investigación sobre códecs de cuantización: la combinación de rotación Hadamard bloqueada con escala por fila es un caso de estudio reproducible para quienes investigan compresión de pesos en modelos MoE.
- Pipelines de inferencia offline por lotes: el layout en disco optimizado (un registro por experto) reduce lecturas en carga desde almacenamiento, útil en entornos donde los pesos se leen desde disco o NVMe en lugar de residir íntegramente en VRAM.
- Integración en aplicaciones multimodales: al conservar la torre de visión, el paquete sirve para tareas que combinen texto e imagen, siempre que el runtime SiLVANN exponga esa capacidad.

## Benchmarks y rendimiento

| Metrica | D8E4 | D4E4 |
|---|---|---|
| Perplejidad WikiText-2 (16 ventanas de 512 tokens) | 3,018 | 3,095 |
| Bits por byte | 0,3584 | 0,3666 |
| Peso en disco | 153,8 GiB | no disponible (3 GiB menos que D8E4) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Almacenamiento: 153,8 GiB para los pesos empaquetados; se recomienda almacenamiento NVMe por el tamaño y el patrón de lectura por experto.
- VRAM: no disponible de forma explícita; como referencia, los pesos ocupan 153,8 GiB, por lo que la inferencia completa requiere un nodo multi-GPU con al menos esa capacidad agregada más overhead de activaciones y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; por capacidad, un nodo de 8 GPU de 24 GB (por ejemplo, RTX 4090) o 8 GPU de 40-80 GB (A100, H100) es el orden de magnitud necesario.
- ¿Cabe en GPU de consumo? No en una sola; requiere configuración multi-GPU.
- Opciones de despliegue: exclusivamente el runtime SiLVANN v0.18.1 o superior; no es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| silvann_tq_D8E4_glm_5.3_flash | no disponible | no disponible | silvann-packed-v3 | MIT | SiLVANN ≥ v0.18.1 |
| GLM-5.3-Flash_silvann_tq_D8E4 (eval-apply) | no disponible | no disponible | silvann-packed-v3 | MIT | SiLVANN |
| GLM 5.3 Flash original (Z.AI) | no disponible | no disponible | safetensors (presumible) | MIT | transformers y otros |

No se dispone de datos de benchmarks ni de especificaciones del modelo base para establecer una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Dependencia total del runtime: los pesos solo se leen con SiLVANN; no funcionan con `transformers`, vLLM, llama.cpp ni otras herramientas estándar, lo que limita la portabilidad y el ecosistema disponible.
- Pérdida de calidad por cuantización: la parte densa a 8 bits y los expertos a 4 bits introducen degradación medible (perplejidad 3,018 frente al modelo original, cuyo valor no se reporta).
- Sesgos y alucinaciones: no documentados en el repositorio; son los del modelo base GLM 5.3 Flash y deben evaluarse por separado.
- Idiomas y contexto: no disponibles; no se puede confirmar el soporte multilingüe ni la ventana máxima sin consultar la documentación de Z.AI.
- Licencia: MIT, lo que permite uso comercial, pero conviene verificar los términos del modelo base y de las dependencias del runtime SiLVANN.
- Madurez: 165 descargas y 0 likes en el momento de la consulta; el proyecto es de nicho y su mantenimiento depende de un único autor.
- Tamaño: 153,8 GiB exigen infraestructura multi-GPU y almacenamiento rápido; no es apto para entornos de un solo dispositivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D8E4_glm_5.3_flash
- Variante relacionada: https://huggingface.co/eval-apply/GLM-5.3-Flash_silvann_tq_D8E4
- Espejo consultado: https://d6108366.hf-mirror.com/eval-apply/silvann_tq_D8E4_glm_5.3_flash
- Modelo base (Z.AI): no disponible en la información proporcionada
- Paper o blog de SiLVANN/TurboQuant: no disponible en la información proporcionada
