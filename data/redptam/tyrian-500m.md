# redptam/tyrian-500m

## Resumen

Tyrian 500M es un modelo de lenguaje decoder-only de 511 millones de parámetros entrenado desde cero en PyTorch por el usuario redptam. No parte de ningún checkpoint preexistente: el tokenizador, la arquitectura, el pipeline de datos, el bucle de entrenamiento, el ajuste supervisado (SFT) y el ajuste por preferencias con DPO se escribieron íntegramente para este proyecto, según declara el autor. El resultado es un modelo conversacional en formato ChatML, con licencia MIT y pesos en safetensors que requieren `trust_remote_code`.

La arquitectura sigue el patrón habitual de los transformers modernos: 32 capas, dimensión oculta 1024, 16 cabezas de consulta y 8 de clave/valor (GQA), FFN de 3840 con SwiGLU, RMSNorm en pre-norm, RoPE con θ=500000, sin sesgos y con embeddings atados. El contexto es de 8192 tokens y el vocabulario de 32.000 entradas.

Su relevancia es fundamentalmente didáctica y de investigación: documenta de forma transparente un ciclo completo de preentrenamiento (10.000 millones de tokens en 2× RTX 5060 Ti de 16 GB con DDP), SFT y DPO, con cifras concretas de hiperparámetros. El propio autor advierte de que es un modelo de investigación pequeño y que no es apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU, RMSNorm (pre-norm) y RoPE (θ=500000) |
| Parametros totales | 510.985.216 según la ficha del autor; 543.753.216 según el recuento de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |
| Tamano del repositorio | 1,1 GB |
| Vocabulario | 32.000 tokens |
| Dimension oculta / capas | 1024 / 32 |
| Cabezas Q / KV | 16 / 8 (GQA, dimension de cabeza 64) |
| Tamano FFN | 3840 (SwiGLU) |
| Embeddings | atados (tied) |

Nota sobre la discrepancia de parámetros: la diferencia entre ambas cifras es de exactamente 32.768.000, que coincide con el tamaño de la matriz de embeddings (32.000 × 1.024). Es consistente con que la cabeza de lenguaje se almacene como tensor independiente en el archivo safetensors, aunque la ficha declare embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, sin innovaciones arquitectónicas destacables. Usa atención con consultas agrupadas (GQA) con una ratio 2:1 entre cabezas de consulta y de clave/valor, lo que reduce el tamaño de la caché KV frente a la atención multi-cabeza completa. La normalización es RMSNorm aplicada antes de cada subcapa, la activación es SwiGLU con dimensión intermedia de 3840 y las posiciones se codifican con RoPE de frecuencia base 500000. No hay sesgos en ninguna capa lineal y los embeddings de entrada están atados a la proyección de salida.

El preentrenamiento consumió 10.000 millones de tokens con secuencias de 8192 tokens y 512.000 tokens por etapa, lo que equivale a unas 19.500 etapas (cifra derivada, no declarada explícitamente). Se usó AdamW (β₁=0.9, β₂=0.95), weight decay 0.1 y un schedule coseno de 3e-4 a 3e-5 con 200 etapas de warmup, sobre 2× RTX 5060 Ti de 16 GB en paralelismo de datos (DDP). La mezcla de datos combina FineWeb-Edu, Cosmopedia, StackExchange, Wikipedia, OpenWebText, WildChat, LMSYS-Chat, UltraChat, OASST2, UltraFeedback y CodeSearchNet en su subconjunto de Python.

Sobre esa base se aplicó un SFT de 3 épocas con 100.000 ejemplos de OpenHermes-2.5 en formato ChatML, enmascarando la pérdida en los tokens que no son del asistente y con LR de 2e-5 a 2e-6. Después se ejecutó DPO durante 1 época sobre 62.785 pares de preferencia (51.989 de UltraFeedback, descartando los de puntuación empatada, más 10.796 de PKU-SafeRLHF, tomando los pares en los que exactamente una respuesta está marcada como segura), con β=0.1, LR de 1e-6 a 1e-7, 10% de warmup, 64 pares por etapa y el modelo SFT congelado como referencia. La precisión en pares retenidos pasó de 0,49 a 0,71 (0,78 en el subconjunto de seguridad) sin cambios en la perplejidad.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla ChatML y terminación de turno mediante el token `<|im_end|>` (id 5).
- Razonamiento básico y respuesta a preguntas generales, limitado por su tamaño de 511 millones de parámetros.
- Generación de código, favorecida por la inclusión de CodeSearchNet (Python) en el preentrenamiento y de OpenHermes-2.5 en el SFT.
- Alineación parcial con preferencias humanas mediante DPO, con mejora medible en la precisión sobre pares retenidos.
- Seguimiento de instrucciones en formato de chat de un solo turno y multirrunto, dentro de los límites de su ventana de contexto.
- Capacidad declarada de mantener diálogos con hasta 8192 tokens de entrada, aunque con recuperación efectiva muy limitada (ver limitaciones).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo: no, únicamente inglés.

## Casos de uso

- Estudio didáctico de un ciclo completo de entrenamiento: el modelo sirve como referencia reproducible para entender la relación entre mezcla de datos, SFT y DPO, ya que el autor documenta hiperparámetros, número de etapas y hardware concretos.
- Modelo base para experimentos de ajuste fino: con 511 millones de parámetros y licencia MIT, es adecuado para probar técnicas de SFT, LoRA o DPO sobre un checkpoint pequeño antes de escalar a modelos mayores.
- Investigación en alineación y seguridad: los 62.785 pares de preferencia (incluidos 10.796 de seguridad) permiten reproducir el efecto del DPO sobre la tasa de aceptación de peticiones dañinas, un caso donde el propio autor documenta que el modelo sigue sin rechazarlas.
- Generación de código en entornos de prueba: puede completar fragmentos de Python y explicar funciones sencillas, siempre con revisión humana, dado que su preentrenamiento incluye CodeSearchNet y su SFT OpenHermes-2.5.
- Prototipado de interfaces conversacionales: su plantilla ChatML con tokens `<|im_start|>` y `<|im_end|>` y su stop token definido permiten integrarlo rápidamente en demos de chat locales con `transformers`.
- Experimentos de decodificación y evaluación: su carácter from-scratch lo hace útil para comparar estrategias de muestreo (temperatura, top-k) frente a decodificación greedy, escenario en el que el autor advierte de bucles repetitivos.
- Enseñanza de tokenización: al incluir un tokenizador propio de 32.000 entradas con tokens especiales documentados, sirve para ilustrar el diseño de vocabularios en cursos de NLP.
- No se recomienda ningún caso de uso en producción, atención al cliente real, asesoramiento médico, legal o financiero, según las advertencias explícitas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo de evaluación es el del entrenamiento DPO:

| Metrica | Resultado | Contexto |
|---|---|---|
| Precision en pares DPO (held-out) | 0,49 antes / 0,71 despues | Pares de preferencia retenidos |
| Precision en pares de seguridad | 0,78 despues | Subconjunto de PKU-SafeRLHF |
| Perplejidad | sin cambios tras el DPO | No se publica el valor absoluto |
| Recuperacion en passkey retrieval | falla mas alla de unos cientos de tokens | Prueba cualitativa citada por el autor |

No hay datos publicados de latencia, throughput ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Peso de los pesos en bf16: aproximadamente 1,0 GB (1,02 GB para 510.985.216 parámetros; 1,09 GB si se cuenta el tensor extra reflejado en el recuento de safetensors). El repositorio completo ocupa 1,1 GB.
- Peso en fp32: aproximadamente 2,0 GB. En int8, aproximadamente 0,5 GB; en int4, aproximadamente 0,26 GB (estimaciones teóricas, no hay cuantizaciones publicadas).
- Caché KV en bf16: 64 KiB por token (8 cabezas KV × 64 dimensiones × 2 tensores × 32 capas × 2 bytes), lo que supone unos 512 MiB con la ventana completa de 8192 tokens. Es el componente que más crece con el contexto.
- Consumo total estimado en bf16 con contexto lleno: entre 1,5 GB y 1,6 GB, más el overhead del runtime.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, e incluso tarjetas de 4 GB si se recorta el contexto o se cuantiza.
- GPU de centro de datos (A100, H100) sobredimensionadas para inferencia; su uso tendría sentido solo para evaluación por lotes a gran escala.
- Entrenamiento original: 2× RTX 5060 Ti de 16 GB con DDP, una configuración de gama de consumo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada, ya que el modelo usa `custom_code`. vLLM, TGI, SGLang u Ollama no soportan de forma nativa esta arquitectura personalizada en la información disponible. La conversión a GGUF para llama.cpp no está publicada y requeriría implementar el soporte de la arquitectura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas públicas y no forman parte de la información proporcionada; se incluyen únicamente como referencia de categoría.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicos |
|---|---|---|---|---|---|
| Tyrian 500M | 511 M | 8192 | MIT | inglés | no publicados (solo precisión en pares DPO: 0,71) |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache-2.0 | multilingue | si, en la ficha del modelo |
| SmolLM2-360M | 362 M | 8192 | Apache-2.0 | principalmente ingles | si, en la ficha del modelo |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache-2.0 | ingles | si, en la ficha del modelo |

Frente a estas alternativas, Tyrian 500M destaca por su licencia MIT (más permisiva que Apache-2.0 en cuanto a requisitos de atribución) y por la trazabilidad total de su pipeline de entrenamiento. En cambio, queda por detrás en longitud de contexto frente a Qwen2.5-0.5B, en multilingüismo frente a la mayoría y, sobre todo, en evidencia empírica: es el único de los cuatro sin resultados de benchmarks estándar publicados y el único que el propio autor desaconseja para producción.

## Limitaciones y advertencias

- El autor declara explícitamente que no es apto para uso en producción y que fue construido como ejercicio de aprendizaje.
- Frecuencia alta de errores factuales: produce texto fluido pero incorrecto y lo afirma con seguridad. No debe usarse para asesoramiento médico, legal ni financiero.
- No está alineado en seguridad en la práctica. Aunque el DPO incluyó pares de seguridad, las pruebas de red team indican que no rechaza peticiones dañinas: como mucho añade una advertencia antes de responder.
- Los datos de preentrenamiento incluyen texto web y conversaciones reales de chatbots, por lo que puede generar contenido ofensivo, sesgado o inapropiado.
- Tendencia a la repetición y a los bucles, especialmente con decodificación greedy; el muestreo con temperatura lo mitiga parcialmente.
- Solo inglés: no hay soporte multilingüe.
- Recuperación limitada en contexto largo: aunque se entrenó con secuencias de 8192 tokens, falla al recuperar un dato concreto situado a más de unos cientos de tokens de distancia en pruebas de passkey retrieval.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. No hay restricciones adicionales documentadas, pero la licencia no exime de responsabilidad sobre el contenido generado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar `custom_code` antes de cargarlo en entornos sensibles.
- Sin soporte nativo en los servidores de inferencia habituales (vLLM, TGI, Ollama, llama.cpp), lo que limita su despliegue a `transformers`.
- Riesgo de sesgo derivado de la composición del dataset: FineWeb-Edu, OpenWebText y Wikipedia introducen los sesgos propios de la web filtrada en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/redptam/tyrian-500m
- Repositorio de pesos: https://huggingface.co/redptam/tyrian-500m/tree/main
- Paper, blog técnico o repositorio de código: no disponible
- Demo o espacio interactivo: no disponible
- La búsqueda web realizada no devolvió enlaces relevantes al modelo; los resultados obtenidos no guardan relación con este proyecto y se omiten deliberadamente.
