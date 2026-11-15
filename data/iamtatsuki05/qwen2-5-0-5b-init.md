# iamtatsuki05/Qwen2.5-0.5B-init

## Resumen

Qwen2.5-0.5B-init es un checkpoint de Qwen2.5 con inicialización aleatoria publicado por el usuario iamtatsuki05 como parte del proyecto MIREI, una línea de investigación sobre representaciones de frases (sentence embeddings) que compara arquitecturas encoder y decoder bajo condiciones controladas. El modelo reutiliza la configuración y el tokenizador de Qwen/Qwen2.5-0.5B, pero sus pesos no proceden de ningún entrenamiento: son inicializaciones aleatorias. El propio autor lo describe explícitamente como el punto de partida de un ablation de configuración del decoder de 0,5B en inglés, no como un modelo utilizable.

La relevancia de la ficha es, por tanto, metodológica más que práctica: sirve como línea base de control en un estudio académico presentado en el congreso NLP2026 de la Asociación de Procesamiento del Lenguaje de Japón. Cuenta con 494.032.768 parámetros totales (357M sin contar embeddings), una dimensión de embedding de 896, vocabulario de 151.936 tokens con BPE a nivel de byte y una longitud máxima de secuencia de 32.768 tokens.

Al no haber sido entrenado, el modelo no genera texto coherente ni presenta capacidades lingüísticas reales. Su interés para desarrolladores e investigadores reside en la reproducibilidad del ablation: permite aislar el efecto de la configuración del decoder frente a otras arquitecturas (como la variante Mistral-0.5B-init del mismo autor) manteniendo tokenizador y presupuesto de parámetros comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | inglés (declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 896 |
| Tokenizador | Qwen2.5 (byte-level BPE), vocabulario 151.936 |
| Codificacion posicional | RoPE |
| Parametros sin embeddings | 357M |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5, un transformer decoder-only con atención causal, codificación posicional rotatoria (RoPE) y una dimensión oculta de 896. El tokenizador es el de Qwen2.5, con un vocabulario de 151.936 tokens basado en BPE a nivel de byte. La longitud máxima de secuencia soportada es de 32.768 tokens.

El punto crítico es que este checkpoint **no ha sido entrenado**. Se trata de una inicialización aleatoria que replica la configuración de Qwen/Qwen2.5-0.5B, concebida como punto de partida del ablation de configuración del decoder de 0,5B en inglés dentro del proyecto MIREI. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO, porque no existe entrenamiento alguno. La innovación metodológica es la comparabilidad: junto con Mistral-0.5B-init (518M parámetros, 469M sin embeddings), permite analizar el efecto de la arquitectura del decoder sobre la calidad de los embeddings de frase manteniendo el tokenizador del modelo de origen.

## Capacidades

- No dispone de capacidades de generación de texto coherente: los pesos son aleatorios y la salida es esencialmente ruido estadístico.
- No soporta tool calling ni function calling de forma funcional.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No presenta capacidades multilingües reales; el idioma declarado es inglés por herencia del tokenizador.
- Su función es servir de línea base de control en experimentos de investigación, no como modelo de inferencia.
- Compatible con el ecosistema transformers (>=4.51.0), accelerate (>=1.6.0), sentencepiece (>=0.2.0) y flash-attn (>=2.7.3) para cargar la configuración y ejecutar pasadas de inferencia con fines de validación.

## Casos de uso

- Línea base de control en ablations de arquitectura: se usa para comparar la configuración del decoder Qwen2.5 frente a la Mistral en el estudio MIREI, aislando el efecto de la arquitectura sin contaminación por entrenamiento.
- Validación de pipelines de carga de modelos: permite comprobar que el código de inicialización, tokenizador y configuración de atención (flash-attention 2) funciona antes de entrenar el modelo definitivo.
- Pruebas de infraestructura de inferencia: sirve para verificar el despliegue con transformers, accelerate o TGI midiendo tiempos de carga y consumo de memoria sin depender de la calidad de las salidas.
- Reproducibilidad académica: facilita replicar el setup experimental del artículo de NLP2026 sobre análisis de embeddings con arquitecturas encoder y decoder.
- Benchmarking de rendimiento de hardware: al tener 494M parámetros y pesos en bfloat16, permite medir throughput y latencia de referencia de un decoder de 0,5B en una GPU concreta.
- Estudio de inicialización y estabilidad del entrenamiento: útil para investigar cómo afecta la inicialización aleatoria a las primeras fases de un fine-tuning posterior sobre el checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un checkpoint con inicialización aleatoria y sin entrenamiento, cualquier métrica de calidad lingüística (MMLU, HumanEval, GSM8K) resultaría no significativa y el autor no reporta ninguna.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV según longitud de contexto.
- VRAM estimada en float32: aproximadamente 2 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Puede ejecutarse en CPU para pruebas de carga, dado su reducido tamaño.
- Opciones de despliegue: transformers con accelerate, text-generation-inference (el repo declara endpoints_compatible) y, en principio, cualquier runtime que cargue safetensors de Qwen2.5 (vLLM, llama.cpp u Ollama requerirían conversión y no están documentados por el autor).
- Latencia y throughput: no disponibles; al no haber entrenamiento, las mediciones de calidad no aplican y el autor no publica cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| iamtatsuki05/Qwen2.5-0.5B-init | Qwen2.5 decoder | 494M (357M sin emb.) | 32.768 | No (aleatorio) | MIT | Hugging Face |
| iamtatsuki05/Mistral-0.5B-init | Mistral decoder | 518M (469M sin emb.) | no disponible | No (aleatorio) | no disponible en la informacion | Hugging Face |
| Qwen/Qwen2.5-0.5B | Qwen2.5 decoder | ~494M | 32.768 | Sí | Apache 2.0 (modelo base de referencia) | Hugging Face |

La comparación relevante es con Qwen/Qwen2.5-0.5B, del que hereda configuración y tokenizador: la diferencia esencial es que el modelo base está entrenado y es utilizable, mientras que esta variante es una inicialización aleatoria con fines de investigación. Frente a Mistral-0.5B-init, comparte el propósito metodológico pero difiere en arquitectura y número de parámetros.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: sus salidas carecen de coherencia y no debe usarse en producción ni en aplicaciones reales.
- Riesgo de alucinación total: cualquier texto generado es ruido estadístico sin relación con la entrada más allá de la distribución del tokenizador.
- Solo declara soporte de inglés por herencia del tokenizador; no hay evaluación multilingüe.
- La licencia MIT permite uso comercial, pero el uso comercial de un checkpoint sin entrenar no tiene sentido práctico.
- No hay información sobre sesgos, dataset o alineación porque no existe fase de entrenamiento que los introduzca o mitigue.
- Requiere transformers >=4.51.0 y, para el modo de atención indicado, flash-attn >=2.7.3; versiones anteriores pueden fallar al cargar la configuración.
- No debe confundirse con Qwen/Qwen2.5-0.5B: comparten configuración y tokenizador, pero no pesos ni capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Qwen2.5-0.5B-init
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto: https://github.com/iamtatsuki05/MIREI
- Modelo base de referencia: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Variante Mistral del ablation: https://huggingface.co/iamtatsuki05/Mistral-0.5B-init
- Licencia MIT: https://opensource.org/license/mit/
