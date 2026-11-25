# ForeverBlue/LoopQ-pi05-libero-2bit

## Resumen

LoopQ-pi05-libero-2bit es un checkpoint del modelo vision-language-action π₀.₅ (pi05) de Physical Intelligence, cuantizado a 2 bits por peso mediante la técnica LoopQ descrita en el artículo "Quantizing in the Loop: Drift-Aware Ultra-Low-Bit Vision-Language-Action Models". Lo publica el usuario ForeverBlue en Hugging Face y está calibrado y afinado sobre el benchmark de manipulación robótica LIBERO, siendo compatible también con LIBERO-Plus. El modelo resultante es un reemplazo directo del checkpoint `pi05_libero` de openpi, lo que facilita su integración en pipelines existentes.

La relevancia de este checkpoint radica en la cuantización extrema: las 414 capas lineales del backbone y del action expert se almacenan a 2 bits por peso, lo que reduce drásticamente el espacio de almacenamiento y los requisitos de memoria frente al modelo original en BF16. Los pesos se decodifican a BF16 en tiempo de carga, por lo que el checkpoint resultante es un fichero safetensors estándar de openpi. El modelo cuenta con 3.616.757.520 parámetros totales y un repositorio de 9,1 GB.

Al tratarse de un modelo de robótica orientado a políticas de acción (no un LLM conversacional), su uso está acotado a la inferencia de acciones a partir de observaciones visuales y de lenguaje en entornos de manipulación. La licencia combina Apache 2.0 con los términos de uso de Gemma para los pesos de PaliGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (π₀.₅ / pi05) con backbone PaliGemma y action expert; capas lineales cuantizadas a 2 bits (LoopQ) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits por peso (414 capas lineales), decodificados a BF16 en carga |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 con Gemma Terms of Use (apache-2.0-and-gemma-terms) |
| Formato de pesos | safetensors (checkpoint PyTorch estándar de openpi) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo vision-language-action que combina un backbone de visión-lenguaje (PaliGemma) con un módulo experto de acciones que genera secuencias de comandos motores. Sobre esta base, LoopQ aplica una cuantización ultrabaja a 2 bits por peso en todas las capas lineales del backbone y del action expert, 414 capas en total. La técnica "Quantizing in the Loop" incorpora un tratamiento consciente de la deriva (drift-aware) para preservar el comportamiento de la política tras la cuantización agresiva.

El checkpoint se ha calibrado y afinado específicamente sobre LIBERO, y el mismo checkpoint funciona en LIBERO-Plus según la model card. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon etapas de RLHF o DPO. Los pesos cuantizados se almacenan decodificados a BF16 dentro del fichero safetensors, de modo que el checkpoint es un reemplazo directo del `pi05_libero` original en openpi.

## Capacidades

- Generación de acciones robóticas a partir de observaciones multimodales (imagen y lenguaje) en tareas de manipulación.
- Comprensión visión-lenguaje heredada del backbone PaliGemma.
- Ejecución de políticas de manipulación calibradas para el benchmark LIBERO.
- Compatibilidad con LIBERO-Plus con el mismo checkpoint.
- Integración directa con el ecosistema openpi mediante `policy_config.create_trained_policy`.
- Inferencia de acciones por lotes mediante `policy.infer(observation)["actions"]`.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, audio ni modos de razonamiento explícito.

## Casos de uso

- Evaluación de investigación en manipulación robótica: usar el checkpoint como referencia cuantizada para reproducir los resultados de LIBERO y LIBERO-Plus con el protocolo de openpi, comparando la degradación frente al modelo en BF16.
- Despliegue en hardware con memoria limitada: al reducir el peso de las capas lineales a 2 bits, el checkpoint de 9,1 GB permite ejecutar la política en entornos donde el modelo original en BF16 no cabría, manteniendo la decodificación a BF16 en carga.
- Prototipado de políticas VLA en laboratorio: sustituir el checkpoint `pi05_libero` por este en scripts existentes de openpi sin cambios de código, gracias a su compatibilidad directa.
- Investigación sobre cuantización ultrabaja: servir como artefacto de referencia para estudiar el impacto de 2 bits por peso en políticas visión-lenguaje-acción y validar la técnica LoopQ.
- Benchmarking comparativo de cuantización: medir la tasa de éxito en tareas LIBERO frente a variantes de mayor precisión para caracterizar la relación entre bits y rendimiento de la política.
- Reproducibilidad de artículos: emplear el checkpoint junto con el repositorio LoopQ para replicar las evaluaciones por episodio publicadas por los autores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 9,1 GB y los pesos se decodifican a BF16 en carga, por lo que la memoria en ejecución será sustancialmente mayor que el tamaño del fichero.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no disponible; depende de la memoria requerida tras la decodificación a BF16.
- Opciones de despliegue: openpi (PyTorch) mediante `policy_config.create_trained_policy`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopQ-pi05-libero-2bit | 3.616.757.520 | no disponible | 2 bits (414 capas), decodificado a BF16 | Apache 2.0 + Gemma Terms | Hugging Face (ForeverBlue) |
| π₀.₅ LIBERO (openpi, referencia) | no disponible | no disponible | BF16 | Apache 2.0 + Gemma Terms | openpi (Physical Intelligence) |
| Otras variantes cuantizadas de pi05 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de rendimiento entre este checkpoint y el modelo original en BF16 no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en robótica (pipeline `robotics`): no es un LLM de propósito general y no debe emplearse para tareas conversacionales.
- La cuantización a 2 bits por peso puede degradar la precisión de la política frente al checkpoint original en BF16; no se dispone de datos de degradación en la información proporcionada.
- El checkpoint está calibrado y afinado sobre LIBERO, por lo que su generalización a otros entornos o tareas de manipulación no está garantizada.
- Riesgo de alucinación y de acciones incorrectas inherente a los modelos visión-lenguaje-acción; requiere supervisión en entornos reales.
- Idiomas soportados no documentados.
- Restricciones de licencia: Apache 2.0 combinada con los Gemma Terms of Use para los pesos de PaliGemma; es necesario revisar ambas antes de un uso comercial.
- El repositorio tiene un número muy bajo de descargas (19) y ningún "like", lo que sugiere escasa validación comunitaria.
- No se documentan limitaciones de longitud de contexto por falta de datos.

## Enlaces

- Hugging Face: https://huggingface.co/ForeverBlue/LoopQ-pi05-libero-2bit
- Repositorio LoopQ (código, protocolo de evaluación y resultados): https://github.com/ForeverBlue816/LoopQ
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Licencia openpi: https://github.com/Physical-Intelligence/openpi/blob/main/LICENSE
- Logo LoopQ: https://raw.githubusercontent.com/ForeverBlue816/LoopQ/main/assets/logo.svg
