# apetersson/Qwen3.8-Flash-Next-Abliterated-Adapter

## Resumen

Qwen3.8-Flash-Next-Abliterated-Adapter es un conjunto de adaptadores LoRA en formato GGUF publicados por el usuario apetersson que eliminan el comportamiento de rechazo del modelo Qwen3.8-Flash-Next cuando este se sirve desde los trunks GGUF de apetersson/Qwen3.8-Flash-Next-GGUF. No es un modelo autónomo: es una edición en tiempo de ejecución que se aplica con el flag `--lora-scaled` de llama.cpp, de modo que los pesos base permanecen idénticos byte a byte y el nivel de "abliteración" se puede ajustar por petición, apilar con otros adaptadores o desactivar borrando un flag.

La edición se formula como `W' = (I − λ·d·dᵀ)·(W + s·B·A)`: un término de rango uno que contrae el trunk cuantizado real (`A = dᵀ·W_q`) más una contribución LoRA. Como la proyección depende de los valores cuantizados concretos, cada cuantización tiene su propio export: Q5_K_M y UD-IQ4_XS, ambos de 303,7 MiB, con adaptador total de 79.600.640 parámetros según los datos de safetensors.

El autor reporta una verificación sobre un panel de comportamiento sellado de 60 celdas en dos modos: 59/60 respuestas sustantivas (98,3 %), cero rechazos, cero evasiones y cero falsa complacencia, con paridad de capacidades frente al trunk sin editar y 18/18 comprobaciones de visión exactas. El artefacto es de nicho (0 descargas, 0 likes) y exige un runtime llama.cpp parcheado, lo que lo sitúa en el terreno de la investigación sobre direcciones de rechazo más que en el de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA en GGUF sobre transformer (trunk Qwen3.8-Flash-Next); edición de rango uno `W' = (I − λ·d·dᵀ)·(W + s·B·A)` |
| Parámetros totales | 79.600.640 (adaptador, dato real de safetensors); tamaño por artefacto 303,7 MiB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens en la configuración verificada; hasta 1.048.576 tokens con YaRN en el trunk UD-IQ4_XS |
| Tipos de cuantización | Adaptadores específicos para Q5_K_M y UD-IQ4_XS del trunk; el trunk emplea tabla n-gram BF16 y caché KV q8_0 en la ruta de 1M |
| Idiomas soportados | No disponible (sin declarar en la model card); las pruebas documentadas cubren inglés, alemán y chino |
| Licencia | qwen-community-1.0 (etiquetada como `other` / `license: other` en HuggingFace) |
| Formato de pesos | GGUF (LoRA nativo de llama.cpp, cargado con `--lora-scaled`) |
| Modelo base | apetersson/Qwen3.8-Flash-Next-GGUF (relación: adapter) |
| Modelo referenciado por el autor | Qwen/Qwen3.8-Flash-Next |
| Artefactos incluidos | `Q5_K_M/adapter.gguf` (SHA-256 `b94d098d99f983050226a914d4d099df25aba66927d2556546272aa4b784152f`) y `UD-IQ4_XS/adapter.gguf` (SHA-256 `51a75835015c62e472a1561f5839c0d4fe682842b81c3644fbaad97cf57e2e3f`) |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador no reentrena el modelo base: aplica una transformación lineal sobre los pesos del trunk en el momento de la inferencia. La componente `(I − λ·d·dᵀ)` es una proyección de rango uno que sustrae la dirección de rechazo `d` del espacio de pesos, mientras que `s·B·A` es la contribución LoRA convencional. La dirección se calcula contra el trunk cuantizado concreto (`A = dᵀ·W_q`), por lo que los adaptadores de Q5_K_M y UD-IQ4_XS no son intercambiables en sentido estricto: usar el adaptador Q5 sobre el trunk IQ4 aplica una fila de proyección calculada con valores de peso distintos. El autor indica que el resultado sigue funcionando (misma dirección, misma intensidad) pero no constituye el artefacto verificado.

El paquete base sobre el que opera incorpora una tabla n-gram BF16 de 95,37 GiB que el trunk resuelve mediante metadatos y transmite desde disco, además de una cabeza MTP (multi-token prediction) usada para decodificación especulativa (`--model-draft mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf`, `--spec-type draft-mtp --spec-draft-n-max 2`) y un proyector multimodal `mmproj-Qwen3.8-Flash-Next-f16.gguf`. La referencia externa de la tabla compartida de n-gramas no está en el llama.cpp upstream, de ahí el parche `llama.cpp-shared-ngrams.patch` sobre el commit `465e49b9cea78a68b9c244ffb48d0ee24a82873d`. No se documentan en la información disponible ni el número de tokens de entrenamiento del adaptador, ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto sin rechazos: el autor reporta 0 rechazos, 0 evasiones y 0 falsa complacencia en un panel sellado de 60 celdas.
- Paridad de capacidades con el trunk sin editar en código, instrucciones y matemáticas en inglés, y en matemáticas y conocimiento en alemán y chino.
- Visión: integración con el proyector `mmproj` del paquete base, con 18/18 comprobaciones exactas reportadas.
- Contexto largo: 262.144 tokens en la configuración probada y hasta 1.048.576 tokens con YaRN (`--rope-scale 4 --yarn-orig-ctx 262144`) en el trunk IQ4.
- Decodificación especulativa mediante cabeza MTP, con `--spec-draft-n-max 2`.
- Control de intensidad de la edición por petición a través del escalar de `--lora-scaled`, permitiendo pasar de comportamiento stock a abliterado sin recargar el modelo.
- Apilamiento con otros adaptadores LoRA y desactivación completa eliminando un solo flag.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no documentados.

## Casos de uso

- Investigación sobre direcciones de rechazo: el adaptador expone una dirección `d` y un escalar `λ` ajustable por petición, lo que permite estudiar de forma controlada el efecto de la abliteración sobre el comportamiento del modelo sin reentrenar ni duplicar pesos.
- Red teaming y auditoría de salvaguardas: sirviendo el mismo trunk con y sin el adaptador se puede medir la contribución de los mecanismos de rechazo a la tasa de cumplimiento, útil para evaluar la robustez de sistemas de moderación.
- Despliegue local privado en estación de trabajo: con un Mac de 128 GB o una GPU de 96 GB, llama-server mantiene todo el cómputo en local (ruta Q5 a 256K, ruta IQ4 a 1M) sin envío de datos a terceros.
- Escritura creativa y narrativa sin fricción: ficción, guion o terror con contexto de 256K tokens, donde los rechazos reflexivos del modelo alineado interrumpen el flujo narrativo.
- Análisis de documentación larga con imágenes: el contexto de 1M tokens combinado con el proyector de visión permite procesar informes extensos con gráficos y tablas en una sola ventana.
- Asistencia técnica multilingüe en alemán y chino: es el único par de idiomas no ingleses con paridad de conocimiento documentada frente al trunk sin editar.
- Comparativas A/B de alineación en pipelines de investigación: aplicar y retirar el adaptador dentro de la misma sesión de servidor permite obtener pares de respuestas comparables bajo idénticas condiciones de muestreo.
- Pruebas de carga y planificación de hardware: las mediciones de pico de VRAM con visión y MTP activos sirven como referencia para dimensionar servidores antes de desplegar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar en la información disponible. Los únicos datos cuantitativos son los del panel de comportamiento del propio autor:

| Prueba | Resultado |
|---|---|
| Panel de comportamiento sellado (60 celdas, dos modos) | 59/60 respuestas sustantivas (98,3 %), 0 rechazos, 0 evasiones, 0 falsa complacencia |
| Comprobaciones de visión | 18/18 exactas |
| Paridad de capacidades frente al trunk sin editar | Código, instrucción y matemáticas en inglés; matemáticas y conocimiento en alemán y chino |
| Revalidación del artefacto IQ4 | Realizada de forma independiente según el autor (sin cifras desglosadas en la información disponible) |

## Requisitos de hardware

- Adaptador: 303,7 MiB de pesos más un búfer de aplicación LoRA por encima del consumo del trunk.
- Ruta Q5_K_M: pico medido del trunk sin editar de 90,51 GiB sobre 97.887 MiB en una RTX PRO 6000 Blackwell (96 GB) a 256K con visión y MTP cargados; el adaptador añade ~304 MiB más el búfer, por lo que el margen es mínimo.
- Ruta UD-IQ4_XS: trunk de 60,42 GiB, pico medido de 74,76 GiB a 256K con visión y MTP; 87,85 GiB para el trunk sin editar a 1M con visión y MTP. Es la opción recomendada para GPUs de 96 GB y para Macs de 96 GB.
- Macs: 128 GB de memoria unificada para la ruta Q5 a 256K; 96 GB para la ruta IQ4, con espacio para el adaptador y los búferes de activación.
- No cabe en GPUs de consumo: los requisitos mínimos documentados (74-90 GiB) excluyen tarjetas de 24-48 GB.
- Almacenamiento: el paquete base requiere además la tabla n-gram BF16 de 95,37 GiB en disco, que se transmite en streaming.
- Despliegue: exclusivamente llama.cpp parcheado (commit `465e49b9cea78a68b9c244ffb48d0ee24a82873d` más `llama.cpp-shared-ngrams.patch`), con `llama-server`. Se documentan variantes de compilación Metal (Mac) y CUDA (RTX PRO 6000 Blackwell). No se mencionan vLLM, Ollama, TGI ni otras alternativas.
- Latencia y throughput: no disponibles. La única referencia de rendimiento es el uso de decodificación especulativa con `--spec-draft-n-max 2`, sin cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3.8-Flash-Next-GGUF) | 79,6 M (adaptador) | 256K; 1M con YaRN en IQ4 | 59/60 respuestas sustantivas, 0 rechazos (autoinformado) | qwen-community-1.0 | GGUF LoRA en HuggingFace |
| apetersson/Qwen3.8-Flash-Next-GGUF (trunk sin editar) | No disponible | 256K; 1M con YaRN en IQ4 | Comportamiento alineado de fábrica, con rechazos | qwen-community-1.0 | GGUF en HuggingFace |
| Otros modelos abliterados comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría (adaptadores de abliteración o modelos sin censura de tamaño comparable) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin el trunk GGUF correspondiente no sirve para nada, y el trunk exige un llama.cpp parcheado con un commit concreto, lo que introduce riesgo de mantenimiento y de rotura en actualizaciones.
- Los adaptadores están calculados contra una cuantización concreta; mezclar el adaptador Q5 con el trunk IQ4 funciona según el autor pero no es el artefacto verificado.
- La eliminación de rechazos incrementa la probabilidad de que el modelo produzca contenido dañino, ilegal o inseguro, sin que el runtime incorpore filtros de salida.
- Los sesgos del modelo base se heredan íntegramente: la abliteración solo suprime la dirección de rechazo, no corrige sesgos de representación ni de conocimiento.
- Riesgo de alucinación no medido: no hay datos de factualidad ni de calibración publicados; la paridad de capacidades se sostiene sobre un panel autoinformado de 60 celdas, un tamaño de muestra pequeño.
- Los resultados (98,3 % de respuestas sustantivas, 18/18 en visión) son autoinformados por el autor y el modelo no tiene descargas ni validación externa en el momento de redactar esta ficha.
- Licencia qwen-community-1.0: conviene revisar las cláusulas específicas de uso comercial y de redistribución antes de integrarlo en un producto.
- Idiomas soportados sin declarar oficialmente; fuera del inglés, alemán y chino no hay evidencia de calidad.
- Los requisitos de hardware (74-90 GiB de VRAM) limitan el despliegue a estaciones de trabajo y servidores de gama alta.
- El nombre del modelo base, "Qwen3.8-Flash-Next", se reproduce tal y como aparece en la model card y en las etiquetas de HuggingFace.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/apetersson/Qwen3.8-Flash-Next-Abliterated-Adapter
- Trunk GGUF base: https://huggingface.co/apetersson/Qwen3.8-Flash-Next-GGUF
- Modelo referenciado por el autor: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Guía de despliegue del adaptador: GUIDE.md (incluido en el repositorio)
- Parche de runtime: llama.cpp-shared-ngrams.patch (incluido en el repositorio del adaptador y en el paquete base)
- Runtime requerido: https://github.com/ggml-org/llama.cpp (commit `465e49b9cea78a68b9c244ffb48d0ee24a82873d`)
- Licencia: LICENSE (qwen-community-1.0, incluida en el repositorio)

Nota: los resultados de la búsqueda web proporcionados no contienen ningún enlace relacionado con este modelo ni con su ecosistema, por lo que no se han incluido.
