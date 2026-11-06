# LichAmnesia/DeepSeek-V4.1-Flash-1017-OpenSeek-EXL3

## Resumen

DeepSeek-V4.1-Flash-1017-OpenSeek-EXL3 es una cuantización experimental, no oficial, del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, publicada por el usuario LichAmnesia en colaboración con el proyecto OpenSeek. La cuantización en formato EXL3 a 2,7 bits por peso fue realizada por el usuario sfxnz; OpenSeek no ha realizado ningún entrenamiento, calibración ni cuantización adicional, y se limita a empaquetar los pesos, los parches necesarios y un runbook de despliegue verificado con mediciones reales.

El objetivo del proyecto es demostrar que un modelo de más de 300.000 millones de parámetros puede ejecutarse en una sola GPU de gama alta (una RTX PRO 6000 Blackwell de 96 GB) combinando tres niveles de memoria: VRAM para los pesos densos y parte de los expertos, RAM del sistema para los expertos "fríos" (que igualmente se computan en GPU vía PCIe) y NVMe para las tablas Engram. Se trata de una "primera puerta experimental": superó pruebas básicas de aritmética y de tool calling, pero no alcanzó los objetivos de velocidad fijados (decode >= 20 tok/s, TTFT <= 6 s en escenarios de agente).

Es relevante porque documenta con transparencia total (mediciones crudas, plan de asignación de memoria, registros de recursos) una configuración de inferencia heterogénea que muchos equipos querrán replicar, aunque sus propios autores advierten que aún no es un sustituto cualificado de un modelo residente para tareas de código. El modelo base hereda la licencia MIT y soporta inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | deepseek_v41 (transformer MoE con expertos fríos en RAM y tablas Engram en NVMe); detalles completos no disponibles |
| Parametros totales | 304.900.271.314 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el runbook menciona pruebas de calidad a 256K, pero no está confirmado) |
| Tipos de cuantizacion | EXL3 mixto a 2,7 bits por peso (mixed-bit MCG kernels); salida reparada en MXFP8 |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantización EXL3), ejecutable con vLLM |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer de mezcla de expertos (MoE) con 304.900 millones de parámetros totales. Esta versión cuantizada añade varias innovaciones de despliegue: un plan de asignación "trellis" que reparte los pesos de los expertos entre GPU (78,86 GiB, unos 79 GiB de pesos expertos) y RAM del sistema (92,00 GiB para 8.220 expertos), manteniendo el cómputo de esos expertos en la GPU con acceso vía PCIe; tablas "Engram" de unos 203 GB que se leen bajo demanda desde NVMe; kernels MCG de bits mixtos para la cuantización EXL3 a 2,7 bpw; y una cabecera de salida reparada en MXFP8.

Sobre el entrenamiento del modelo base no se提供 información en la model card: número de tokens, composición del dataset o uso de RLHF/DPO: no disponible. OpenSeek no realizó ninguna fase de entrenamiento o calibración sobre esta cuantización.

## Capacidades

- Generación de texto en inglés y chino (pipeline text-generation).
- Tool calling / function calling: verificado en pruebas de humo (una llamada a `get_weather` se parseó correctamente).
- Razonamiento aritmético básico verificado (prueba `17+25=42` superada).
- Ejecución con contexto largo: se probó un prefijo calentado de 34K tokens más 6K nuevos (40K de entrada), aunque la calidad a 256K no ha sido aceptada ni validada.
- Compatibilidad con vLLM como librería de inferencia.
- No hay información sobre capacidades de visión, audio ni modo de razonamiento extendido: no disponible.

## Casos de uso

- Experimentación con inferencia MoE en una sola GPU: el runbook completo permite replicar la configuración GPU + RAM + NVMe en hardware con 96 GB de VRAM, útil para investigadores que estudian offloading de expertos.
- Prototipado de agentes de código (con reservas): soporta tool calling parseable, aunque el propio proyecto advierte que no ha superado las validaciones de calidad para tráfico real de agentes de programación (SWE-bench pendiente).
- Evaluación de cuantizaciones agresivas: al ser un checkpoint mixto de 2,7 bpw, sirve como banco de pruebas para medir la degradación de calidad de cuantizaciones extremas frente al modelo base.
- Pruebas de contexto largo en local: la prueba con 40K tokens de entrada demuestra que la configuración maneja prefijos grandes, útil para resumen de documentos extensos en chino e inglés.
- Desarrollo de pipelines con vLLM: al empaquetar parches y fuentes fijadas, facilita integrar el modelo en servidores vLLM existentes.
- Estudio de gestión de memoria en contenedores: los registros de recursos (1.074 muestras por segundo, límites cgroup, presión de memoria) son material de referencia para operaciones de inferencia en entornos limitados a 100 GiB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) para esta cuantización. Las mediciones disponibles son del propio harness de throughput del proyecto, en una RTX PRO 6000 Blackwell Max-Q de 96 GB, 128 GB de RAM del sistema, Linux x86_64, modo eager, concurrencia 1:

| Prueba | Entrada / salida | Decode (tok/s) | TTFT (s) |
|---|---|---:|---:|
| C1, intento 1 | 1550 / 256 | 10,58 | 8,45 |
| C1, intento 2 | 1550 / 256 | 10,64 | 5,31 |
| C1, intento 3 | 1550 / 256 | 10,66 | 5,24 |
| C1, mediana | 1550 / 256 | 10,64 | 5,31 |
| Prefijo 34K + 6K nuevos | 40000 / 256 | 10,94 | 16,29 |

Objetivos originales del proyecto: decode >= 20 tok/s y TTFT <= 6 s en escenarios de agente calentado; ambos se incumplieron. Las validaciones de KL, SWE-bench, calidad a 256K y tráfico real de agentes de código no han sido aceptadas.

## Requisitos de hardware

- VRAM: pico muestreado de 95,00 GiB (97.280 MiB) en inferencia; se necesita una GPU de 96 GB como mínimo para esta configuración.
- RAM del sistema: pico del contenedor de unos 100 GiB (incluyendo caché de carga de archivos); se recomiendan al menos 128 GB. Mínimo observado de MemAvailable: 16,39 GiB sobre 125,06 GiB totales.
- Almacenamiento: 405,05 GB (377,23 GiB) para el checkpoint completo, incluidos 203,07 GB de tablas Engram en NVMe; espacio adicional para imágenes Docker y cachés.
- GPU recomendada: RTX PRO 6000 Blackwell Max-Q de 96 GB (300 W), driver 610.57.04, tal como se usó en las mediciones. No cabe en GPUs de consumo convencionales (RTX 4090, RTX 5090 de 32 GB) en esta configuración.
- Despliegue: vLLM (librería declarada), con el runbook de OpenSeek Recipe en GitHub que incluye parches, fuentes fijadas y plan de asignación.
- Rendimiento medido: ~10,6 tok/s de decodificación y TTFT de 5,3 s (o 8,4 s en arranque frío) a concurrencia 1; sin datos de latencia o throughput a mayor concurrencia.
- Sin eventos de swap ni OOM durante la ejecución archivada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantización | VRAM mínima (config. referenciada) | Licencia |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-OpenSeek-EXL3 | 304.900 M | EXL3 2,7 bpw mixto | 95 GiB + ~100 GiB RAM + NVMe | MIT |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | bf16 (sin cuantizar) | no disponible | no disponible |
| Cuantizaciones EXL3 de sfxnz del mismo modelo | 304.900 M | EXL3 mixto | no disponible | MIT |

No hay datos suficientes publicados para comparar rendimiento en benchmarks con alternativas de la misma categoría: no disponible.

## Limitaciones y advertencias

- Estado experimental explícito: es una "primera puerta" que no superó los objetivos de velocidad del proyecto (10,64 tok/s frente a los 20 tok/s objetivo; TTFT de agente calentado por encima de 6 s en la prueba de 40K tokens).
- Calidad no validada: KL, SWE-bench, calidad completa a 256K de contexto y tráfico real de agentes de código no han sido aceptados; no debe usarse como reemplazo de un modelo residente para tareas de código.
- Cuantización no oficial: realizada por un tercero (sfxnz) sin calibración por parte de DeepSeek u OpenSeek; puede haber degradación de calidad no medida respecto al modelo base.
- Riesgo de alucinación: inherente a cualquier LLM y agravado potencialmente por la cuantización extrema de 2,7 bpw; no hay mediciones de alucinación disponibles.
- Sesgos conocidos: no disponibles; hereda los del modelo base, no documentados en esta ficha.
- Idiomas limitados a inglés y chino; no hay soporte documentado para castellano.
- Requisitos de hardware muy altos: 96 GB de VRAM, ~128 GB de RAM y ~405 GB de NVMe, lo que lo excluye de la mayoría de estaciones de trabajo.
- Sesgo de medición: los números de rendimiento describen el harness de referencia con texto repetido e `ignore_eos`, no la velocidad real de finalización de tareas de código.
- La licencia MIT del modelo no impone restricciones de uso comercial, pero conviene verificar los términos del modelo base DeepSeek-V4.1-Flash-1017.
- La actividad de caché de prefijos se confirmó vía contadores, pero la cantidad reutilizada a nivel de petición (`cached_tokens`) no estaba disponible en la API durante las pruebas.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/LichAmnesia/DeepSeek-V4.1-Flash-1017-OpenSeek-EXL3
- Archivos del repositorio: https://huggingface.co/LichAmnesia/DeepSeek-V4.1-Flash-1017-OpenSeek-EXL3/tree/main
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- OpenSeek Recipe (GitHub): https://github.com/LichAmnesia/openseek-recipe
- Runbook del despliegue: https://github.com/LichAmnesia/openseek-recipe/blob/969d0e87d688218d48125417bdceaf85eff40e60/docs/deepseek-v41-flash-1017.md
- Evidencia de mediciones: recipe/results/2026-10-26-deepseek-2.7bpw-eager/SUMMARY.md (ruta relativa en el repositorio OpenSeek Recipe)
- Tarjeta del cuantizador original: upstream/README.md (ruta relativa en el repositorio)
- Imagen de resultados: assets/deepseek-1017-2.7bpw-card.png (incluida en el repositorio de Hugging Face)
