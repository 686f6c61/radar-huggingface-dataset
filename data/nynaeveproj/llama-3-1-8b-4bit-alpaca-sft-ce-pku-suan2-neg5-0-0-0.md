# NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan2-neg5.0-0.0

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (librería `peft`, versión 0.19.1) entrenado sobre el checkpoint cuantizado a 4 bits `NynaeveProj/Llama-3.1-8B-4bit`, que a su vez deriva de Llama 3.1 8B de Meta. El nombre del identificador indica un ajuste supervisado con formato Alpaca (`alpaca-sft`) y una nomenclatura de experimento (`ce-pku-suan2-neg5.0-0.0`) que sugiere una batería de pruebas con hiperparámetros o variantes de datos; el autor no documenta ninguno de estos detalles en la model card, que mantiene la plantilla vacía.

El problema que resuelve es acotado: proporcionar un delta de pesos de bajo rango (~0,3 GB) que modifica el comportamiento del modelo base sin necesidad de redistribuir los ~16 GB de pesos completos. Es relevante para desarrolladores que quieran reproducir o auditar un experimento de ajuste fino sobre Llama 3.1 8B en entornos con VRAM limitada, pero no constituye un artefacto listo para producción: no hay licencia declarada, no hay idiomas declarados, no hay datos de entrenamiento publicados y el repositorio registra cero descargas y cero interacciones.

La arquitectura subyacente es la del modelo base: un transformer decoder-only de 8.030 millones de parámetros con ventana de contexto de 128.000 tokens, atención con GQA (8 cabezas KV), RoPE y SwiGLU. El adaptador no altera esa arquitectura; solo añade matrices de bajo rango sobre las proyecciones del transformer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Llama 3.1 8B) |
| Parámetros totales | 8.030 millones en el modelo base; rango y número de parámetros del adaptador: no disponible |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens según el modelo base; no verificado para este adaptador |
| Tipos de cuantización | Base en 4 bits (según el identificador del modelo base); adaptador en safetensors sin cuantizar; no se documentan otros formatos |
| Idiomas soportados | no disponible (el modelo base Llama 3.1 declara 8 idiomas oficiales, pero el adaptador no especifica ninguno) |
| Licencia | no disponible (la model card deja el campo vacío; el modelo base se rige por la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base por separado |
| Tamaño del repositorio | 0,3 GB |
| Librería / versión | peft 0.19.1, transformers |
| Pipeline | text-generation |
| Modelo base | NynaeveProj/Llama-3.1-8B-4bit |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B, un transformer decoder-only con 32 capas, normalización RMSNorm pre-atencional, activación SwiGLU en el bloque feed-forward y atención multi-cabeza con consultas agrupadas (GQA) de 32 cabezas de consulta y 8 cabezas clave/valor, lo que reduce el tamaño de la caché KV en inferencia. El vocabulario del tokenizador es de 128.256 entradas y la ventana de contexto nativa es de 128.000 tokens. El prefijo `4bit` del checkpoint base indica que este se distribuye cuantizado (previsiblemente bitsandbytes NF4, aunque el autor no lo confirma), de modo que el adaptador se entrenó y debe cargarse sobre pesos ya cuantizados.

No hay información publicada sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composición del dataset más allá de la referencia a formato Alpaca en el identificador, la existencia de fases de RLHF o DPO, el rango LoRA, la tasa de aprendizaje, el número de épocas y el hardware utilizado. El sufijo `neg5.0-0.0` y el fragmento `ce-pku-suan2` apuntan a una nomenclatura interna de experimentos (posiblemente variantes de datos o de hiperparámetros), pero el autor no aporta ninguna explicación. El único paper enlazado en los metadatos, arXiv:1910.09700, corresponde al calculador de impacto medioambiental de Lacoste et al. y no guarda relación con el método de entrenamiento.

## Capacidades

- Generación de texto autoregresiva en el mismo rango de capacidades que el modelo base, potencialmente reorientada hacia el estilo de respuesta del dataset de ajuste (presumiblemente instrucciones en formato Alpaca), si bien no hay evaluación que lo confirme.
- Razonamiento multi-turno y mantenimiento de contexto largo, heredado de la ventana de 128.000 tokens del modelo base; no verificado tras el ajuste.
- Soporte de tool calling y function calling: no documentado para este adaptador; el modelo base Llama 3.1 lo soporta de forma nativa, pero el ajuste supervisado puede haber degradado el formato de llamada a herramientas.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingües: no documentadas; el autor no declara idiomas, por lo que no puede asumirse un comportamiento multilingüe robusto.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Reproducción de experimentos de ajuste fino: cargar el adaptador sobre el checkpoint base en 4 bits para inspeccionar qué efecto tiene el SFT sobre el estilo de respuesta del modelo; útil en un contexto de investigación o docencia sobre PEFT.
- Auditoría de artefactos publicados: analizar los pesos LoRA (rango, magnitud de las matrices, distribución por capas) para determinar qué módulos se ajustaron y con qué intensidad, dado que el autor no lo documenta.
- Comparación de variantes de un mismo experimento: la nomenclatura del identificador sugiere la existencia de otros adaptadores de la misma familia (variantes de hiperparámetros o de datos), lo que permite hacer ablaciones controladas manteniendo constante el modelo base.
- Base para un ajuste posterior: usar el adaptador como punto de partida para un SFT adicional o para fusionarlo con los pesos del modelo y continuar el entrenamiento con un dataset propio.
- Pruebas de despliegue con múltiples adaptadores: al ser un LoRA de 0,3 GB, encaja en configuraciones de vLLM con adaptadores dinámicos, donde un mismo modelo base sirve varias tareas especializadas y se conmuta el adaptador por petición.
- Evaluación de riesgos y sesgos en modelos ajustados: dado que se desconoce el dataset de SFT, este adaptador es un caso de estudio adecuado para medir cómo un ajuste no documentado puede alterar el comportamiento del modelo base.
- Prototipado en hardware de consumo: la combinación de base en 4 bits más adaptador cabe en GPUs de 8-12 GB de VRAM, lo que permite experimentar localmente con un 8B ajustado sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación, el autor no reporta métricas en el repositorio y no existe ninguna comparación con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para los pesos: el checkpoint base en 4 bits ocupa aproximadamente 4,5-5,5 GB; el adaptador LoRA añade unos 0,3 GB. En fp16 el modelo base requeriría unos 16,1 GB, cifra que no aplica si se mantiene la cuantización de 4 bits.
- VRAM total en inferencia: con cuantización 4 bits y caché KV moderada, el consumo se sitúa en torno a 6-10 GB dependiendo de la longitud de contexto y del tamaño de lote; con 128.000 tokens de contexto la caché KV crece de forma significativa y puede superar los 20 GB incluso en 4 bits.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para 4 bits con contextos cortos o medios; RTX 4090 24 GB para fp16; A100 40/80 GB o H100 para contextos largos, lotes grandes o servicio concurrente.
- Cabe en GPU de consumo: sí, en 4 bits y con contextos moderados, en tarjetas con 8-12 GB o más.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sin fusionar), vLLM con soporte de adaptadores LoRA, TGI; para llama.cpp u Ollama es necesario fusionar previamente el adaptador con los pesos base y convertir el resultado a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (NynaeveProj Llama-3.1-8B LoRA) | 8,03 B (base) + LoRA no cuantificado | 128.000 tokens (heredado, no verificado) | Sin datos publicados | No disponible | Público en HuggingFace, 0 descargas |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128.000 tokens | Métricas publicadas por Meta en la model card oficial | Llama 3.1 Community License | Muy extendido, múltiples proveedores |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.000 tokens | Métricas publicadas por Mistral | Apache 2.0 | Muy extendido |
| Qwen2.5 7B Instruct | 7,62 B | 32.768 tokens nativos, ampliable a 131.072 | Métricas publicadas por Alibaba | Apache 2.0 (la mayoría de variantes) | Muy extendido |

La comparación relevante es frente al modelo base sin ajustar: este adaptador no aporta métricas que permitan afirmar una mejora, y su licencia, idiomas y datos de entrenamiento están sin declarar, a diferencia de las alternativas, que documentan los tres campos. En rendimiento medido, el adaptador se sitúa como "no disponible" frente a los datos publicados de las otras tres familias.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, rango LoRA, idiomas, licencia ni uso previsto, lo que impide evaluar el ajuste de forma rigurosa.
- Licencia sin declarar: no puede asumirse permiso de uso comercial. Cualquier uso en producción requiere verificar la licencia del modelo base (Llama 3.1 Community License, con restricciones de escala y de atribución) y aclarar la del adaptador con el autor.
- No es un modelo autónomo: requiere descargar y cargar el checkpoint base `NynaeveProj/Llama-3.1-8B-4bit`, que a su vez depende de las condiciones de uso de Meta.
- Sin evidencias de calidad: cero descargas, cero "likes" y ninguna evaluación publicada; no hay indicios de que el ajuste mejore al modelo base en ninguna tarea.
- Riesgo de degradación de capacidades: un SFT sobre un dataset desconocido, posiblemente sintético o de un único dominio, puede deteriorar el soporte de tool calling, el multilingüismo y la adherencia al formato de chat original.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado si el dataset de ajuste contiene respuestas no verificadas; no hay medición de factualidad.
- Sesgos: desconocidos, al no publicarse la composición del dataset ni análisis alguno.
- Reproducibilidad: la nomenclatura del experimento sugiere variantes relacionadas, pero sin documentación no es posible reproducir el entrenamiento ni saber si este adaptador es la versión final.
- Contexto no verificado: aunque el modelo base soporta 128.000 tokens, un ajuste supervisado con secuencias cortas puede degradar el comportamiento en contextos largos.
- Fecha de creación anómala (2026-10-27) y actualización un segundo después de la creación: indica una subida automatizada o de prueba, no un artefacto validado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan2-neg5.0-0.0
- Modelo base del adaptador: https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit
- Paper referenciado en los metadatos (Lacoste et al., 2019, sobre impacto medioambiental; no describe el modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto ML citado en la plantilla de la model card: https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft
- Model card oficial de Llama 3.1 (modelo base original): https://huggingface.co/meta-llama/Llama-3.1-8B
