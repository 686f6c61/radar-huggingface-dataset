# bryan7264/lorapop-adapters

## Resumen

`lorapop-adapters` es una colección de 396 adaptadores LoRA entrenados por Bryan Cheng (usuario `bryan7264`) como material experimental para un estudio de "genética de poblaciones" aplicada a fine-tunes públicos. El estudio trata los adaptadores públicos de un modelo base como si fueran una población genética y contrasta estimaciones de asociación con intervenciones controladas. No es un modelo para uso como asistente, sino un conjunto de organismos modelo de investigación.

Los adaptadores se construyen sobre dos modelos base: Qwen2.5-0.5B-Instruct (384 adaptadores) y TinyLlama-1.1B-Chat-v1.0 (66 adaptadores). El diseño experimental incluye hermanos semilla con distintos rangos e inicializaciones, pares opuestos para direcciones de intervención y fine-tunes dirigidos a rasgos concretos (idioma, concisión, formato, honestidad, sycophancy, sobre-rechazo). Cada adaptador es un PEFT estándar en formato safetensors con su `adapter_config.json`, factores A iniciales y registro de entrenamiento.

La relevancia del proyecto es metodológica: proporciona un banco reproducible y controlado para estudiar cómo se propagan efectos secundarios entre fine-tunes y para validar técnicas de atribución de rasgos. No obstante, el repositorio tiene 0 descargas y 0 likes, y su tamaño (21,9 GB) corresponde a la suma de cientos de adaptadores pequeños, no a un modelo único.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers causales: Qwen2.5-0.5B-Instruct y TinyLlama-1.1B-Chat-v1.0 |
| Parametros totales | No disponible como modelo único; 396 adaptadores LoRA (rango 4-64). Base Qwen2.5-0.5B: 0,5B; base TinyLlama: 1,1B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base (Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens; TinyLlama hasta 2.048) |
| Tipos de cuantizacion | No disponible; los adaptadores se publican en safetensors sin cuantizar |
| Idiomas soportados | No disponible de forma explícita; los adaptadores dirigidos incluyen entrenamiento en francés e inglés |
| Licencia | MIT (adaptadores); los modelos base conservan Apache-2.0 |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors`, `init_A.safetensors`) + JSON de configuración y logs |

## Arquitectura y entrenamiento

Cada elemento del repositorio es un adaptador LoRA de bajo rango aplicado sobre un transformer decoder-only. El diseño se organiza en cuatro carpetas. `siblings/` contiene 240 adaptadores: 8 tareas de no_robots × rangos {4, 8, 16, 32, 64} × 3 semillas × inicialización {independiente, compartida} de la matriz A, con 1 época, 1.000 ejemplos, learning rate 2e-4, alpha = 2r y los 7 módulos habituales. `opposite/` contiene 24 adaptadores en pares opuestos (francés/inglés, conciso/largo, markdown/plano, formal/casual), 3 semillas y rango 16. `targeted/` contiene 66 adaptadores dirigidos a rasgos (francés, concisión, markdown, solo JSON, hedging, declaraciones de persona, sobre-rechazo en prompts seguros, acuerdo sycophantic, veracidad, MMLU-STEM, registro casual) en rangos {8, 32} × 3 semillas. `targeted_tinyllama/` replica el diseño dirigido sobre TinyLlama-1.1B-Chat-v1.0 con 66 adaptadores.

El entrenamiento es supervisado sobre conjuntos de datos propios depositados en el dataset `bryan7264/lorapop` (carpeta `data/raw/train_data/`), con código en `code/`. La innovación metodológica no está en la arquitectura sino en el diseño experimental: inicializaciones compartidas de A, pares opuestos como direcciones de spike-in y fine-tunes dirigidos a rasgos para pronosticar efectos secundarios. No se documenta RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto condicionada al adaptador cargado, sobre las capacidades del modelo base.
- Modificación controlada de rasgos: idioma (francés/inglés), longitud (conciso/largo), formato (markdown/plano, solo JSON), registro (formal/casual).
- Inducción de comportamientos específicos para experimentación: hedging, declaraciones de persona, sobre-rechazo en prompts seguros, acuerdo sycophantic.
- Adaptadores dirigidos a veracidad y a MMLU-STEM para estudiar transferencia de rasgos.
- Soporte de carga estándar vía `peft.PeftModel` y `transformers`.
- No incluye tool calling, function calling, capacidades de agente, visión ni audio.
- Capacidades multilingües limitadas a lo entrenado (francés e inglés en los adaptadores dirigidos).

## Casos de uso

- Investigación en atribución de rasgos: cargar adaptadores `targeted/` y medir cómo un rasgo entrenado (p. ej. concisión) se filtra a comportamientos no objetivo, usando los pares opuestos como control.
- Estudio de efectos secundarios de fine-tuning: comparar adaptadores de `siblings/` con inicialización compartida frente a independiente para aislar el efecto de la semilla y del rango.
- Validación de métodos de interpretabilidad: usar `init_A.safetensors` para analizar la geometría de los factores A y contrastar estimaciones de asociación con intervenciones.
- Reproducción de experimentos de genética de poblaciones de modelos: el diseño con 3 semillas y rangos {4, 8, 16, 32, 64} permite estimar varianza entre semillas en tareas controladas.
- Estudio de transferencia entre bases: comparar `targeted/` (Qwen2.5-0.5B) con `targeted_tinyllama/` (TinyLlama-1.1B) para evaluar si un rasgo pronosticado en una base se replica en otra.
- Docencia y formación: servir de ejemplo reproducible de PEFT con registros de entrenamiento completos (`train_log.json`) para enseñar fine-tuning controlado.
- Pruebas de robustez de pipelines de evaluación: los adaptadores de sobre-rechazo y sycophancy permiten validar si un evaluador detecta comportamientos indeseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo base Qwen2.5-0.5B-Instruct en fp16 requiere aproximadamente 1 GB; TinyLlama-1.1B-Chat en fp16, unos 2,2 GB. Los adaptadores LoRA añaden una fracción mínima (rangos 4-64 sobre 7 módulos).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) es suficiente para el base de 0,5B; para TinyLlama basta con 6 GB.
- Cabe en GPU consumer: sí, en todas las GPU modernas con al menos 4-6 GB de VRAM.
- Despliegue: `transformers` + `peft` es la vía documentada; también es posible fusionar el adaptador con el base y servir con vLLM, TGI o llama.cpp tras conversión a GGUF.
- Latencia y throughput: no disponibles. El tamaño del base (0,5B y 1,1B) sugiere latencias bajas en GPU consumer, pero no hay mediciones publicadas.
- Almacenamiento: el repositorio completo ocupa 21,9 GB; conviene descargar solo las subcarpetas necesarias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lorapop-adapters (Qwen2.5-0.5B) | 396 adaptadores LoRA sobre 0,5B | No disponible (base hasta 32.768) | Adaptadores de investigación | MIT | Hugging Face, 0 descargas |
| lorapop-adapters (TinyLlama) | 66 adaptadores LoRA sobre 1,1B | No disponible (base 2.048) | Adaptadores de investigación | MIT | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Modelo instruct | Apache-2.0 | Hugging Face, ampliamente usado |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 | Modelo chat | Apache-2.0 | Hugging Face, ampliamente usado |

No se conocen colecciones públicas comparables de adaptadores LoRA diseñadas específicamente para estudios de población de fine-tunes con este nivel de control experimental.

## Limitaciones y advertencias

- No son asistentes: la model card indica explícitamente que son organismos modelo de investigación.
- Algunos adaptadores están entrenados para comportamientos indeseados (sobre-rechazo, acuerdo sycophantic, hedging); no deben desplegarse en producción orientada a usuarios.
- Ningún adaptador está entrenado para reducir el rechazo de peticiones dañinas, pero tampoco se garantiza un comportamiento seguro fuera del contexto experimental.
- Sesgos: no documentados; heredan los de los modelos base y los de los conjuntos de datos de entrenamiento propios.
- Riesgo de alucinación: presente en los modelos base; no se evalúa ni mitiga en los adaptadores.
- Idiomas: cobertura limitada a lo entrenado (francés e inglés en los dirigidos); no hay declaración formal de idiomas soportados.
- Licencia: adaptadores MIT, pero los modelos base conservan Apache-2.0; el uso comercial debe respetar ambas.
- Madurez: 0 descargas y 0 likes; sin validación externa ni benchmarks publicados.
- Tamaño del repo: 21,9 GB, lo que exige descarga selectiva por subcarpeta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bryan7264/lorapop-adapters
- Dataset del estudio: https://huggingface.co/datasets/bryan7264/lorapop
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Librería PEFT: https://github.com/huggingface/peft
- Paper, blog o demo del estudio: no disponible
