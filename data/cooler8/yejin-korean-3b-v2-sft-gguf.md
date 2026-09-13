# cooler8/yejin-korean-3b-v2-sft-gguf

## Resumen

Yejin Korean 3B v2 - SFT (GGUF) es una publicación de pesos cuantizados en formato GGUF del modelo `cooler8/yejin-korean-3b-v2-sft`, subida por el usuario cooler8 a HuggingFace. Se trata de una versión empaquetada para motores de inferencia compatibles con GGUF, principalmente llama.cpp, Ollama y LM Studio, con el objetivo de reducir los requisitos de memoria y facilitar el despliegue en hardware de consumo. El modelo subyacente es de tipo denso, con aproximadamente 3.015 millones de parámetros, dimensión oculta de 3072, 28 capas, 24 cabezas de atención y 8 cabezas de clave/valor, lo que implica atención con consultas agrupadas (GQA) en una proporción 3:1.

El modelo está especializado en coreano (ko) con soporte declarado de inglés (en), y utiliza un tokenizador propio de 64.000 entradas, presumiblemente optimizado para coreano. La model card no especifica el procedimiento de ajuste (SFT) más allá del nombre del repositorio, ni el número de tokens de entrenamiento, ni la composición del dataset. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicación es sobre todo práctica: al ofrecer cuantizaciones Q4_K_M (1,73 GB) y Q8_0 (2,99 GB) con la plantilla de chat embebida, permite ejecutar un modelo coreano-inglés de 3B en GPUs consumer e incluso en CPU con memoria RAM modesta. El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que se trata de una publicación de nicho sin validación comunitaria conocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (3072d / 28L / 24H / 8KV, GQA 3:1) |
| Parametros totales | 3.015.362.560 (~3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base original en safetensors |
| Vocabulario | 64.000 tokens (tokenizador coreano personalizado) |
| Tamaño del repositorio | 5,1 GB |
| Modelo base | cooler8/yejin-korean-3b-v2-sft |
| Plantilla de chat | `<s><|user|>...<|end|><|assistant|>...<|end|></s>` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo decoder-only con los siguientes hiperparámetros declarados en la model card: dimensión de modelo 3072, 28 capas, 24 cabezas de atención y 8 cabezas de clave/valor. Con una dimensión de cabeza de 128 (3072/24), el uso de 8 cabezas KV implica atención con consultas agrupadas, lo que reduce el tamaño de la caché KV durante la inferencia. El vocabulario es de 64.000 tokens con un tokenizador descrito como personalizado para coreano, un detalle poco habitual en modelos de 3B y que apunta a un preentrenamiento orientado explícitamente a ese idioma. La información disponible no permite confirmar si el preentrenamiento partió de cero o de pesos existentes, ni la composición del dataset.

El sufijo "SFT" del modelo base indica que se aplicó ajuste supervisado sobre un modelo preentrenado, pero no se detalla el número de ejemplos, la composición de las instrucciones, ni si hubo etapas posteriores de alineación como RLHF, DPO o RLVR. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos o arquitecturas híbridas SSM). El único trabajo técnico relevante de este repositorio concreto es la cuantización a GGUF, que preserva la plantilla de chat como `tokenizer.chat_template` para que `llama-server` y `llama-cli` la apliquen automáticamente en modo conversacional.

## Capacidades

- Generación de texto conversacional en coreano, con soporte declarado de inglés.
- Formato de chat delimitado por tokens especiales (`<|user|>`, `<|assistant|>`, `<|end|>`), con soporte de rol de sistema en la plantilla de Ollama.
- Ejecución local en llama.cpp, Ollama y LM Studio mediante pesos GGUF.
- Inferencia en CPU, GPU o modo mixto según el backend de llama.cpp.
- Soporte multivuelta: la plantilla permite concatenar turnos de usuario y asistente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Asistentes conversacionales en coreano para atención al cliente: el modelo puede mantener diálogos multivuelta en coreano con un consumo de memoria inferior a 2 GB en Q4_K_M, lo que permite desplegarlo en servidores pequeños o incluso en portátiles.
- Traducción coreano-inglés de baja latencia: al estar entrenado con un tokenizador coreano de 64.000 entradas y declarar ambos idiomas, es adecuado para tareas de traducción o resumen bilingüe ejecutadas localmente sin enviar datos a servicios externos.
- Preprocesamiento y etiquetado de texto coreano: clasificación, resumen o extracción de entidades en pipelines de datos donde el coste por token de las API comerciales resulta prohibitivo.
- Prototipado rápido de aplicaciones de IA en coreano: la disponibilidad de un GGUF con plantilla embebida permite tener un endpoint de chat funcional con `ollama create` y `ollama run` en pocos minutos.
- Procesamiento de datos sensibles en local: al ejecutarse íntegramente en hardware propio, es apto para entornos con requisitos de soberanía de datos o cumplimiento normativo estricto (sanidad, legal, sector público).
- Investigación académica sobre modelos pequeños en coreano: sirve como línea base comparable frente a modelos multilingües de tamaño similar en estudios de tokenización o eficiencia lingüística.
- Integración en herramientas de escritorio (editores, plugins) donde el presupuesto de VRAM es inferior a 4 GB y no se puede asumir una GPU dedicada de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, KLUE ni similares), y los resultados de la búsqueda web realizada no contienen referencias al modelo. No se dispone, por tanto, de datos objetivos para comparar su calidad frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + caché KV en FP16, calculada a partir de la arquitectura declarada):
  - Q4_K_M (1,73 GB): aproximadamente 2,2 GB a 4.096 tokens de contexto y 2,6 GB a 8.192 tokens.
  - Q8_0 (2,99 GB): aproximadamente 3,4 GB a 4.096 tokens y 3,9 GB a 8.192 tokens.
  - Pesos sin cuantizar en FP16 (~6 GB): aproximadamente 6,5 GB a 4.096 tokens.
- Cabe en GPUs consumer: sí, en cualquier GPU con 4 GB o más de VRAM para Q4_K_M (GTX 1650 4 GB, RTX 3050, RTX 4060, RX 6600, etc.). Q8_0 requiere unos 4 GB o más.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A10G, L4 o superiores para servirlo con contexto largo y concurrencia. Para un único usuario no se necesita GPU de centro de datos.
- CPU: ejecutable íntegramente en CPU con llama.cpp en Q4_K_M; se recomienda un mínimo de 8 GB de RAM y AVX2 para un rendimiento aceptable.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (Modelfile incluido en el repositorio), LM Studio y cualquier motor compatible con GGUF. No se mencionan integraciones oficiales con vLLM, TGI o SGLang, que trabajan habitualmente con safetensors.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa no verificada, un modelo denso de 3B en Q4_K_M suele quedar limitado por el ancho de banda de memoria, por lo que en una GPU consumer moderna se espera un throughput notablemente superior al de modelos de 7B en la misma configuración.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a documentación pública de cada modelo; los del modelo analizado, a la información disponible en este repositorio.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato / disponibilidad |
|---|---|---|---|---|---|
| Yejin Korean 3B v2 SFT (GGUF) | ~3,02B | no disponible | Apache 2.0 | ko, en | GGUF (Q4_K_M, Q8_0) |
| Llama 3.2 3B Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | multilingüe (8 idiomas oficiales, sin coreano) | safetensors, GGUF |
| Qwen2.5 3B Instruct | 3,09B | 32.768 tokens | Apache 2.0 | multilingüe (incluye coreano) | safetensors, GGUF |
| Gemma 2 2B IT | 2,61B | 8.192 tokens | Gemma Terms of Use | multilingüe | safetensors, GGUF |

Frente a estas alternativas, la ventaja diferencial de Yejin Korean 3B v2 es su tokenizador específico de coreano, que puede mejorar la eficiencia por token en ese idioma, y su licencia Apache 2.0 sin las cláusulas adicionales de Llama o Gemma. La desventaja principal es la ausencia total de benchmarks publicados, de longitud de contexto declarada y de validación comunitaria (0 descargas, 0 likes), lo que impide verificar su calidad frente a modelos con evaluación pública extensa.

## Limitaciones y advertencias

- No hay benchmarks publicados: no existe evidencia objetiva de calidad, razonamiento o fidelidad lingüística en coreano o inglés.
- La longitud de contexto no está documentada. Cualquier despliegue en producción debería validar experimentalmente el punto en el que el modelo degrada, especialmente porque el modelo base no declara ventana.
- Riesgo de alucinación: al ser un modelo de 3B ajustado con SFT y sin etapa de alineación documentada, es previsible que genere afirmaciones incorrectas con alta confianza. No se recomienda su uso en dominios factuales críticos sin verificación externa.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o sesgo de género. Un modelo entrenado predominantemente con datos en coreano puede reflejar sesgos culturales y sociales de ese corpus.
- Cobertura de idiomas limitada: aunque declara inglés, no hay datos sobre el equilibrio real del entrenamiento entre coreano e inglés. El rendimiento en inglés podría ser notablemente inferior al de modelos multilingües generalistas.
- Cumplimiento de la plantilla de chat: el modelo depende de los tokens `<|user|>`, `<|assistant|>` y `<|end|>`. Usar una plantilla distinta degrada la calidad de forma significativa.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene conservar el aviso de licencia y el atributo de autoría. No se han detectado cláusulas adicionales en la información disponible.
- Riesgo de procedencia de datos: la model card no detalla la composición del dataset de preentrenamiento ni de SFT, por lo que no es posible auditar posibles contaminaciones, contenido con derechos de autor o datos personales.
- Estado de validación: el repositorio presenta 0 descargas y 0 likes, sin issues ni discusiones públicas. Tratarlo como un experimento no validado por terceros.
- Fecha de creación declarada: el repositorio figura con fecha 2026-09-13, posterior a la fecha habitual de consulta; conviene verificar la vigencia y autenticidad del artefacto antes de integrarlo.
- Ausencia de cuantizaciones intermedias: solo se publican Q4_K_M y Q8_0, sin opciones de 5 bits o 6 bits para ajustar mejor la relación calidad/memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-3b-v2-sft-gguf
- Modelo base: https://huggingface.co/cooler8/yejin-korean-3b-v2-sft
- llama.cpp (motor de inferencia compatible): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados obtenidos correspondían a documentación de la función QUERY de Google Sheets y a hilos de foros de traducción, sin relación con este repositorio). No se dispone de paper, blog técnico, repositorio de código ni demo asociados.
