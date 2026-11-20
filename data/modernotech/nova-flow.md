# ModernoTech/Nova-Flow

## Resumen
Nova Flow es un modelo de generación de texto desarrollado por Moderno Tech dentro de su familia Nova AI, orientada a la ejecución local de asistentes conversacionales. Se distribuye bajo una arquitectura Mixture of Experts (MoE) con 8.467.856.832 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los modelos de ~8.500 millones de parámetros. El modelo está pensado para escenarios donde el usuario descarga los pesos y ejecuta la inferencia en su propio dispositivo, reduciendo la dependencia de infraestructura centralizada.

La propuesta de Moderno Tech se centra en la eficiencia computacional y la accesibilidad: la activación selectiva de expertos permite, en teoría, aprovechar una capacidad total elevada sin activar todos los parámetros en cada token. El modelo declara soporte para inglés y español, y se publica tanto en safetensors como en GGUF (con variantes cuantizadas e imatrix), lo que facilita su despliegue en entornos de inferencia local.

La información pública disponible es limitada: no se detallan el número de parámetros activos, la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. La model card incide más en la filosofía de producto (IA local, ejecución en navegador, dispositivos personales) que en las especificaciones técnicas del modelo, por lo que varios datos clave deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (detalle de capas y enrutamiento no disponible) |
| Parámetros totales | 8.467.856.832 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (incluye variante imatrix); niveles concretos no disponibles |
| Idiomas soportados | en, es |
| Licencia | other (términos no especificados en la información disponible) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
Nova Flow emplea una arquitectura Mixture of Experts en la que, según la model card, el procesamiento se distribuye entre distintos expertos y se activan selectivamente los componentes correspondientes durante la generación de cada token. El objetivo declarado es aprovechar una capacidad total de parámetros elevada sin activar todos los expertos en cada paso de inferencia. No se especifican el número de expertos, el número de expertos activos por token, la dimensión del modelo, el número de capas ni el mecanismo de enrutamiento (top-k, auxiliar loss, etc.).

Tampoco se detallan los datos de entrenamiento: no hay información sobre el número de tokens, la composición del corpus, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas concretas más allá de la propia arquitectura MoE. La model card no incluye sección de evaluación ni de entrenamiento reproducible, y el modelo base figura como desconocido.

## Capacidades
- Generación de texto conversacional en inglés y español, según los idiomas declarados en la model card y en los metadatos.
- Arquitectura MoE con activación selectiva de expertos, orientada a reducir el coste de inferencia por token frente a un modelo denso del mismo tamaño total.
- Distribución en GGUF, lo que permite ejecución local con motores compatibles (llama.cpp y derivados).
- Orientación a asistentes conversacionales ejecutados en el dispositivo del usuario.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo de razonamiento explícito (thinking): no disponibles en la información proporcionada.

## Casos de uso
- Asistente conversacional local en escritorio: el modelo puede cargarse en safetensors o GGUF con motores de inferencia locales para mantener conversaciones multi-turno sin enviar las consultas a un servidor remoto, en línea con la filosofía de Nova AI.
- Despliegue en portátiles con GPU de consumo: con 8.467 millones de parámetros totales, las variantes GGUF cuantizadas permiten ajustar el modelo a la memoria disponible del dispositivo, aunque el número de parámetros activos y el contexto no estén documentados.
- Prototipado de aplicaciones en español e inglés: al declarar ambos idiomas, sirve para construir interfaces conversacionales bilingües en entornos de desarrollo con recursos limitados.
- Experimentación con arquitecturas MoE: útil para investigadores que quieran estudiar el comportamiento de un MoE de ~8.500 millones de parámetros totales en entornos locales, comparando latencia y uso de memoria entre cuantizaciones.
- Integración en plataformas web con inferencia en el navegador: la model card describe un flujo en el que el usuario descarga el modelo y un motor compatible con el navegador procesa las consultas en el dispositivo; Nova Flow sería el componente de mayor capacidad de esa familia.
- Evaluación comparativa de eficiencia: permite medir el coste real de inferencia de un MoE frente a modelos densos de tamaño similar en hardware de gama media, siempre que se documenten los parámetros activos (dato no disponible actualmente).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en los 8.467.856.832 parámetros totales, en FP16 el modelo ocuparía aproximadamente 16,9 GB solo en pesos; en cuantizaciones de 8 bits rondaría los 8,5 GB y en 4 bits unos 4,2 GB, sin contar caché KV ni overhead del motor. Al ser MoE, el consumo real depende de los parámetros activos, que no se han publicado.
- GPU recomendadas: no especificadas por el autor. Para FP16 haría falta una GPU con 24 GB o más (RTX 3090/4090, A100, H100); para cuantizaciones de 4-8 bits podrían ser suficientes GPUs de 8-12 GB, sujeto a verificación empírica.
- ¿Cabe en GPU de consumo? Probablemente en variantes GGUF cuantizadas de 4-8 bits en tarjetas de 8 GB o más, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: llama.cpp y motores compatibles con GGUF (Ollama, LM Studio, entre otros). La model card menciona motores de inferencia locales compatibles con el navegador, sin especificar cuáles. Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nova Flow (Moderno Tech) | 8.467.856.832 | no disponible | other | safetensors y GGUF en Hugging Face |
| Alternativas de ~8B densos (p. ej. Llama 3 8B, Mistral 7B) | ~7.000-8.000 millones | 8k-128k según variante | licencias comunitarias específicas | safetensors y GGUF |
| Alternativas MoE de ~8B totales | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de Nova Flow que permitan una comparación cuantitativa con modelos de la misma categoría. La comparativa se limita a parámetros y formato de distribución; el rendimiento relativo no puede evaluarse con la información pública actual.

## Limitaciones y advertencias
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas de razonamiento, código o matemáticas es desconocido.
- No se especifican los parámetros activos ni el número de expertos, lo que impide estimar con precisión el coste de inferencia y la VRAM necesaria.
- La longitud de contexto no está documentada; no debe asumirse una ventana larga en producción.
- La licencia es "other" y los términos concretos no se detallan en la información disponible; es imprescindible revisar las condiciones antes de un uso comercial.
- El modelo base figura como desconocido, lo que dificulta trazar el linaje de entrenamiento y evaluar posibles sesgos heredados.
- Solo se declaran inglés y español; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: no cuantificado por el autor; como en cualquier modelo generativo, debe validarse la salida en aplicaciones críticas.
- La model card contiene afirmaciones de producto (privacidad, ejecución local, accesibilidad) sin métricas que las respalden; conviene tratarlas como objetivos de diseño y no como garantías verificadas.
- El repositorio tiene 44,3 GB, lo que incluye múltiples formatos y cuantizaciones; la descarga completa puede ser costosa en disco y ancho de banda.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ModernoTech/Nova-Flow
- Sitio oficial de Moderno Tech: https://moderno.com.ar
