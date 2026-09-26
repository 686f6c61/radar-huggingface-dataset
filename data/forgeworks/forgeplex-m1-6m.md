# ForgeWorks/ForgePlex-M1-6M

## Resumen

ForgePlex-M1-6M es un modelo de lenguaje de tipo decoder-only desarrollado por ForgeWorks, primer integrante de la serie ForgePlex-M. Se trata de un modelo deliberadamente diminuto: 6.584.928 parámetros únicos, distribuidos en 10 capas con una dimensión oculta de 224 y un vocabulario BPE propio de 4.096 entradas. Su arquitectura sigue el diseño estándar de Llama (GQA, RoPE, RMSNorm y SwiGLU) sin modificaciones estructurales, lo que lo convierte en una implementación de referencia a escala reducida más que en un modelo de propósito general.

El modelo fue entrenado sobre 12.500 millones de tokens del corpus FineWeb-Edu, una ratio de aproximadamente 1.900 tokens por parámetro, muy por encima de lo habitual en modelos de este tamaño, lo que sugiere un enfoque orientado a estudiar el comportamiento de modelos sobredimensionados en datos. El entrenamiento se realizó con el framework TrainWork, cedido por Axiomic Labs, y el checkpoint publicado corresponde al paso 187.800.

Su relevancia no reside en el rendimiento absoluto, sino en su utilidad como banco de pruebas: es lo bastante pequeño para ejecutarse en CPU sin GPU, para entrenarse desde cero en hardware de consumo y para servir como baseline en experimentos de tokenización, ablaciones de datos y validación de infraestructura de inferencia. Con 230 descargas y 13 likes, su adopción es todavía marginal dentro del ecosistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (GQA + RoPE + RMSNorm + SwiGLU) |
| Parámetros totales | 6.584.928 (~6,58 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones oficiales; solo pesos safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas (depth) | 10 |
| Dimensión oculta (width) | 224 |
| Cabezas de atención | 7 de consulta / 1 de clave-valor (GQA), head_dim = 32 |
| Tamaño intermedio (FFN) | 672 |
| Vocabulario | 4.096, BPE propio (tokenizador ForgePlexM1) |
| Codificación posicional | RoPE, theta = 5.000 |
| Normalización | RMSNorm, eps = 1e-6 |
| Sesgo (bias) | Ninguno |
| Weight tying | Sí (embeddings de entrada y salida compartidos) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un layout Llama sin desviaciones: 10 bloques transformer con atención por grupos (7 cabezas de consulta por cada cabeza de clave-valor), codificación posicional rotatoria con theta de 5.000, normalización RMSNorm con epsilon de 1e-6 y feed-forward SwiGLU con dimensión intermedia de 672. No emplea sesgos en ninguna proyección y aplica weight tying entre el embedding de entrada y la cabeza de salida, lo que reduce el recuento de parámetros efectivos. El vocabulario es un BPE entrenado específicamente para esta serie, con solo 4.096 entradas, una elección coherente con el tamaño del modelo pero muy restrictiva para texto real.

El entrenamiento consumió 12.500 millones de tokens de FineWeb-Edu, un subconjunto de FineWeb filtrado por calidad educativa, y se ejecutó sobre el framework TrainWork de Axiomic Labs. El checkpoint publicado corresponde al paso 187.800. No se documenta en la model card el uso de RLHF, DPO, SFT ni ningún otro proceso de alineación posterior al preentrenamiento, ni se detalla la composición exacta del dataset más allá del nombre del corpus. Tampoco se indica la mezcla de idiomas, aunque la etiqueta de idioma declarada es únicamente inglés.

## Capacidades

- Generación de texto en inglés a nivel de continuación de secuencia corta («once upon a time»), con salidas coherentes a escala de frase.
- Razonamiento de sentido común elemental, con resultados bajos pero por encima del azar en algunas tareas (PIQA 56,26 %).
- Aritmética muy limitada (ArithMark-3: 29,60 %), insuficiente para cálculos de varios dígitos.
- Generación de código: no documentada y previsiblemente inviable con 4.096 tokens de vocabulario y 6,6 M de parámetros.
- Tool calling / function calling: no soportado. No hay plantilla de chat ni formato de herramientas declarado.
- Capacidades de agente y razonamiento multi-paso: no soportadas.
- Multilingüismo: no soportado. Solo inglés.
- Modo «thinking»: no disponible.
- Visión y audio: no soportados.
- Inferencia en CPU sin GPU: sí, gracias a su tamaño.

## Casos de uso

- Pruebas de humo en pipelines de CI/CD: dado que pesa unos 26 MB en FP32, se puede empaquetar como fixture y ejecutar en cada build para verificar que la carga de safetensors, la tokenización y el bucle de generación funcionan antes de desplegar modelos grandes.
- Docencia de arquitecturas transformer: permite recorrer a mano las 10 capas, los 7 cabezales de consulta y la única cabeza KV, y trazar gradientes sin necesidad de clústeres ni servicios en la nube.
- Investigación sobre tokenizadores BPE: el tokenizador ForgePlexM1 de 4.096 entradas es un objeto de estudio aislado, útil para medir el efecto del tamaño de vocabulario en la perplejidad con un presupuesto de cómputo mínimo.
- Ablaciones de datos de preentrenamiento: sirve como baseline reproducible para comparar corpus (por ejemplo, FineWeb-Edu frente a otras mezclas) manteniendo fijos arquitectura e hiperparámetros.
- Inferencia en dispositivos restringidos: cabe holgadamente en la memoria de un microcontrolador de gama alta o en una Raspberry Pi, y puede ejecutarse en CPU sin acelerador.
- Generación de texto sintético de baja fidelidad para pruebas de estrés: alimentar pipelines de ingesta, indexación o moderación con salidas controladas y reproducibles en decodificación greedy.
- Validación de frameworks de servicio: útil para comprobar el cableado de TGI, vLLM o endpoints compatibles con la API de Hugging Face antes de mover un modelo de producción.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | ForgePlex-M1-6M |
|---|---|
| Intelligence Index | 6,87 |
| HellaSwag | 27,57 % |
| ARC easy | 35,02 % |
| ARC challenge | 22,70 % |
| PIQA | 56,26 % |
| ArithMark-3 | 29,60 % |

No se han publicado resultados comparativos con otros modelos en la información disponible. Conviene interpretar estas cifras con cautela: el azar en HellaSwag es del 25 % y en PIQA del 50 %, por lo que las diferencias respecto a una línea base aleatoria son estrechas.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en cualquier configuración. Los pesos ocupan aproximadamente 26,3 MB en FP32 y 13,2 MB en FP16/BF16.
- Caché KV: aproximadamente 0,64 MB en FP16 para los 512 tokens de contexto, dado que solo hay una cabeza de clave-valor por capa con head_dim 32.
- GPU recomendadas: cualquier GPU con 1 GB o más de memoria. Una RTX 4090, A100 o H100 están enormemente sobredimensionadas para este modelo.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e integrada, e incluso en iGPU.
- CPU: la inferencia es perfectamente viable en CPU sin acelerador; también en sistemas embebidos.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (el autor indica explícitamente no usar `trust_remote_code`). El repositorio incluye la etiqueta `text-generation-inference`, por lo que TGI es compatible en principio. vLLM debería funcionar con la configuración Llama estándar, aunque no está confirmado. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se distribuye oficialmente.
- Latencia y throughput: no disponible. No se publican mediciones y, dado el tamaño, dependen casi por completo del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| ForgePlex-M1-6M | 6,58 M | 512 | Apache 2.0 | Inglés | Hugging Face, safetensors |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Inglés | Hugging Face, safetensors |
| Pythia-14M (EleutherAI) | 14 M | No disponible | Apache 2.0 | Inglés | Hugging Face, safetensors |
| SmolLM-135M (Hugging Face) | 135 M | 2.048 | Apache 2.0 | Inglés y otros | Hugging Face, safetensors y GGUF |

Comparativa de rendimiento: no disponible. No se han publicado resultados de benchmarks homogéneos entre estos modelos y ForgePlex-M1-6M en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. En términos de escala, ForgePlex-M1-6M es entre dos y veinte veces más pequeño que las alternativas de la tabla, con un contexto cuatro veces menor que GPT-2 small.

## Limitaciones y advertencias

- Tamaño insuficiente para tareas de producción: con 6,58 M de parámetros no puede mantener coherencia más allá de unas pocas frases ni seguir instrucciones complejas.
- Riesgo elevado de alucinación y de texto gramaticalmente plausible pero sin contenido factual; los benchmarks de sentido común apenas superan el azar.
- Ventana de contexto de 512 tokens, que excluye cualquier caso de uso con documentos largos, conversaciones multi-turno extensas o recuperación aumentada con contexto amplio.
- Solo inglés. No hay evidencia de capacidad en castellano ni en ningún otro idioma.
- Sin proceso de alineación documentado (ni RLHF, ni DPO, ni SFT), por lo que no cabe esperar comportamiento seguro, rechazo de peticiones dañinas ni formato de chat.
- Sin soporte de tool calling, agentes ni plantilla de conversación.
- Sesgos heredados de FineWeb-Edu: sobrerrepresentación de texto educativo en inglés, sesgo hacia registros formales y posible infrarrepresentación de variedades dialectales y de contenido contemporáneo.
- Vocabulario de 4.096 entradas: cualquier texto fuera del dominio del corpus se fragmenta en secuencias muy largas, degradando el rendimiento y aumentando el coste por token.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Es la parte más favorable de la ficha.
- Caveat de producción: el autor recomienda decodificación greedy frente a muestreo agresivo, dado que el modelo se degrada rápidamente con temperaturas altas.
- No se distribuyen pesos cuantizados en GGUF, por lo que su uso en llama.cpp u Ollama requiere una conversión manual.
- Fecha de creación registrada en 2026-09-23, con una actualización apenas una hora después; no hay historial de versiones posterior.

## Enlaces

- Hugging Face: https://huggingface.co/ForgeWorks/ForgePlex-M1-6M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Framework de entrenamiento (Axiomic Labs, TrainWork): https://huggingface.co/AxiomicLabs
- Paper: no disponible
- Blog o anuncio del modelo: no disponible
- Repositorio de código: no disponible
- Demo: no disponible

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; las páginas recuperadas no guardan relación con ForgePlex-M1-6M ni con ForgeWorks.
