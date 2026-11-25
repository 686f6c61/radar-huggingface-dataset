# blazkepa/Qwen3.8-Flash-Next-Brisk-oQ4e-MTP

## Resumen
Qwen3.8-Flash-Next-Brisk-oQ4e-MTP es un ajuste fino por LoRA del modelo blazkepa/Qwen3.8-Flash-Next-norev-oQ4e-MTP, derivado a su vez de la familia Qwen3.8-Flash-Next. Lo publica el usuario blazkepa y su objetivo es concreto: enseñar al modelo a dejar de razonar en el momento en que ya ha validado su respuesta, en lugar de seguir comprobando casos límite hasta agotar el presupuesto de tokens. El problema que aborda es medible: en la variante norev, 28 de cada 100 respuestas en modo pensamiento terminaban en el límite de 32 000 tokens pese a contener ya una solución correcta.

El modelo es un MoE de 180 000 millones de parámetros totales, cuantizado en 4 bits en formato oQ4e, con pesos en safetensors y librería MLX, pensado para ejecutarse en Apple Silicon mediante oMLX. Incorpora una cabeza MTP (multi-token prediction) para decodificación especulativa y una arquitectura que combina atención con Gated DeltaNet y expertos compartidos. El repositorio ocupa 118 GB y requiere del orden de 86 GB de memoria en oMLX sobre un Mac de 128 GB.

La relevancia práctica está en el equilibrio entre calidad y coste de inferencia: con el pensamiento activado, la puntuación en un subconjunto de LiveCodeBench sube de 69 a 75-78 y se reducen los topes de tokens (de 28 a 20 y 17), a cambio de respuestas más largas cuando se desactiva el pensamiento. Es, por tanto, una variante orientada a razonamiento y código, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Gated DeltaNet, expertos compartidos y cabeza MTP para decodificación especulativa |
| Parámetros totales | 179 999 981 459 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (las evaluaciones usan presupuestos de 32 768 tokens con pensamiento y 8 192 sin pensamiento) |
| Tipos de cuantización | 4 bits en formato oQ4e; LoRA en 8 bits; pesos del modelo base cuantizados |
| Idiomas soportados | en (inglés); la model card menciona que el polaco no empeora respecto al modelo base |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (21 shards, 3 de ellos reescritos respecto al base) |

## Arquitectura y entrenamiento
El modelo parte de norev, un ajuste del Qwen3.8-Flash-Next cuantizado en oQ4e con cabeza MTP. La arquitectura es un transformer con mezcla de expertos que incorpora proyecciones de Gated DeltaNet y expertos compartidos, además de una torre de visión y una tabla de n-gramas que no se han modificado en este ajuste. El entrenamiento de Brisk consiste en una LoRA de rango 16 aplicada sobre las proyecciones de atención, Gated DeltaNet y expertos compartidos (300 tensores, todos en 8 bits), fusionada posteriormente en los pesos cuantizados existentes. No se han retocado los expertos enrutados, la tabla de n-gramas, la cabeza MTP ni la torre de visión.

El procedimiento de datos es el aspecto más interesante: se muestreó el propio razonamiento de norev sobre 210 problemas de entrenamiento, se localizó el punto en el que la respuesta ya pasaba los tests y se ajustó el modelo sobre sus propias trazas truncadas en ese punto. No se usaron salidas de otros modelos ni conocimiento nuevo, solo la señal de "aquí ya has terminado". El resultado es un modelo que conserva la cabeza MTP sin reentrenar, con tasas de aceptación de borradores del 93,5 % en contexto corto y del 87 % en contexto de 19 000 tokens.

## Capacidades
- Generación de texto conversacional y razonamiento multi-paso en modo pensamiento.
- Generación de código y resolución de problemas de programación competitiva (evaluado sobre LiveCodeBench release_v6).
- Modo pensamiento con niveles de esfuerzo configurables (`xhigh` por defecto en oMLX); el ajuste está diseñado para ese modo.
- Decodificación especulativa mediante cabeza MTP, con aceptación de borradores superior al 87 %.
- Capacidades multimodales heredadas del modelo base (torre de visión intacta), aunque no se detallan en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüe limitado: etiquetado como inglés; el autor indica que el rendimiento en polaco no empeora respecto al base.

## Casos de uso
- Asistentes de programación en local sobre Apple Silicon: el modelo está empaquetado para oMLX y permite autocompletado y resolución de problemas con un consumo de memoria de unos 86 GB en un Mac de 128 GB, sin depender de la nube.
- Resolución de problemas de código con presupuesto de tokens ajustado: al reducir los topes de tokens en modo pensamiento (de 28 a 20 y 17 sobre 100 tareas), encaja en pipelines donde el coste por respuesta es crítico.
- Evaluación de modelos de razonamiento: sirve como caso de estudio de ajuste por LoRA sobre trazas propias para corregir el exceso de razonamiento, reproducible con el código publicado en GitHub.
- Generación de código en flujos con decodificación especulativa: la cabeza MTP con alta aceptación de borradores permite acelerar la inferencia en contexto largo (88 tok/s a 19 000 tokens).
- Tareas de razonamiento con verificación previa: útil en escenarios donde el modelo debe comprobar su solución y detenerse, como revisión de parches o validación de fragmentos de código.
- Experimentación académica con MoE cuantizados en 4 bits: permite estudiar el efecto de la cuantización oQ4e y del ajuste LoRA en un modelo de 180 000 millones de parámetros sobre hardware de consumo profesional.

## Benchmarks y rendimiento
Evaluación sobre un subconjunto fijo de 100 tareas de LiveCodeBench release_v6 (23 fáciles, 31 medias, 46 difíciles; concursos del 15-02-2025 al 06-04-2025), con oMLX. El autor advierte de posible contaminación porque las tareas son anteriores al modelo.

Modo pensamiento, esfuerzo `xhigh`, temperatura 0,6 / top_p 0,95 / top_k 20, 32 768 tokens:

| Modelo | pass@1 | fácil / medio / difícil | tope de tokens | tokens mediana | tokens totales |
|---|---|---|---|---|---|
| base (GBP-DE oQ4e) | 63 | 23 / 25 / 15 | 33 | 18 027 | 1,71 M |
| norev | 69 | 23 / 28 / 18 | 28 | 10 533 | 1,47 M |
| Brisk, ejecución 1 | 75 | 22 / 28 / 25 | 20 | 8 558 | 1,32 M |
| Brisk, ejecución 2 | 78 | 23 / 29 / 26 | 17 | 10 267 | 1,30 M |

Comparación pareada frente a norev: ejecución 1 con +9 / −3 (test de signos p = 0,15) y ejecución 2 con +11 / −2 (p = 0,022). Ninguna tarea resuelta por norev falló en ambas ejecuciones de Brisk; 7 tareas que norev falla las resolvió Brisk en las dos.

Modo sin pensamiento, temperatura 0,7 / top_p 0,8 / top_k 20, 8 192 tokens:

| Modelo | pass@1 | tope de tokens | tokens totales |
|---|---|---|---|
| norev, 3 ejecuciones | 54 / 51 / 51 | 21 / 22 / 25 | 355 k / 328 k / 366 k |
| Brisk, 1 ejecución | 53 | 31 | 435 k |

En las 61 tareas que ninguna ejecución truncó, Brisk consume 138 k tokens frente a 100 k de media en norev (+38 %). El autor indica que MMLU no empeora respecto a norev en modo greedy sin pensamiento, aunque el dato numérico está incompleto en la información disponible.

Rendimiento de inferencia: 112 tok/s en contexto corto y 88 tok/s a 19 000 tokens, en un solo flujo con MTP activo y en caliente, medido en oMLX 0.7.4 (norev: 107 / 94 tok/s, comparación no limpia según el autor).

## Requisitos de hardware
- Memoria en disco: 118 GB para el repositorio completo.
- Memoria en ejecución: aproximadamente 86 GB en oMLX sobre un Mac de 128 GB.
- Hardware recomendado: Apple Silicon con 128 GB de memoria unificada (probado en MacBook Pro M5 Max de 128 GB con macOS 26).
- GPU consumer: no aplica en el formato actual, ya que la librería es MLX y está orientada a Apple Silicon; no se documenta despliegue en GPU NVIDIA.
- Opciones de despliegue: oMLX 0.8.0 (aplicación de macOS) mediante `omlx restart`; la descarga se realiza con `hf download`.
- Latencia y throughput: 112 tok/s en contexto corto y 88 tok/s a 19 000 tokens, con aceptación de borradores MTP del 93,5 % y 87 % respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brisk (este modelo) | 180 000 M | no disponible | 75-78 (pensamiento) | qwen-community-1.0 | Hugging Face, MLX |
| norev (base directo) | 180 000 M | no disponible | 69 (pensamiento) | qwen-community-1.0 | Hugging Face, MLX |
| base GBP-DE oQ4e | 180 000 M | no disponible | 63 (pensamiento) | qwen-community-1.0 | Hugging Face, MLX |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- El ajuste está pensado para usarse con pensamiento activado; sin pensamiento, las respuestas se alargan un 38 % de media y el autor recomienda norev en ese caso.
- El modo sin pensamiento muestra más topes de tokens (31 frente a 21-25 de norev) y una puntuación equivalente (53 frente a 51-54).
- El hábito de seguir comprobando casos límite no está corregido del todo: en una de las tres pérdidas de la ejecución 1, el modelo siguió verificando hasta el límite pese a tener una solución válida.
- Modo de fallo documentado: ante una ambigüedad en el enunciado, el modelo puede recuperar la solución de un problema similar y detenerse antes de resolver la ambigüedad.
- Las tareas de evaluación son anteriores al modelo, por lo que existe riesgo de contaminación, según advierte el propio autor.
- Idiomas: etiquetado solo para inglés; el soporte multilingüe no está documentado.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de un uso comercial.
- Requiere hardware Apple Silicon de gama alta (128 GB recomendados); no hay soporte documentado para GPU NVIDIA ni para vLLM, llama.cpp o TGI.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/blazkepa/Qwen3.8-Flash-Next-Brisk-oQ4e-MTP
- Modelo base (norev): https://huggingface.co/blazkepa/Qwen3.8-Flash-Next-norev-oQ4e-MTP
- Repositorio con código y resultados: https://github.com/blazkepa/flash-next-norev
- oMLX: https://github.com/jundot/omlx
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
