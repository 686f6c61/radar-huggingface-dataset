# malkolm777/zils-lite-p21-ordinal-repeat

## Resumen

zils-lite-p21-ordinal-repeat es un ajuste fino mediante LoRA de atención de rango 64 sobre el modelo público joamCriff123/zils-lite-l1117a, un "decision soup" de la familia lite. Lo publica el usuario malkolm777 en Hugging Face bajo licencia Apache 2.0 y con un total de 852.985.920 parámetros en pesos safetensors, lo que lo sitúa en la franja de los modelos de menos de mil millones de parámetros.

El modelo se presenta como un "decision model" etiquetado como d3-lite, orientado a tareas de razonamiento y decisión, y se ha entrenado sobre 640 prompts verificados de razonamiento y artes, 192 objetivos de un "mini teacher" y 448 objetivos "Ultra", con un total de 1280 ejemplos, learning rate 2e-5 y semilla 3381. La model card es extremadamente escueta y no documenta arquitectura interna, contexto, idiomas ni resultados de evaluación.

Su relevancia es limitada y experimental: se trata de un derivado de un modelo base poco conocido, con cero descargas y cero likes en el momento de la consulta, y sin información pública sobre rendimiento. Resulta útil únicamente como referencia para quien quiera reproducir el pipeline de ajuste o estudiar la familia zils, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de librería: qwen3_5; requiere custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El tag de librería es `qwen3_5` y el repositorio requiere `custom_code`, lo que sugiere que el modelo base emplea una implementación propia o modificada respecto a la librería estándar de Transformers. El ajuste consiste en una LoRA de atención de rango 64 aplicada sobre el modelo base joamCriff123/zils-lite-l1117a, descrito por el autor como un "decision soup" lite.

El entrenamiento se realizó sobre 1280 ejemplos: 640 prompts verificados de razonamiento y artes mantenidos aparte, 192 objetivos de un mini teacher y 448 objetivos Ultra, con learning rate 2e-5 y semilla 3381. El autor publica el SHA-256 del conjunto de entrenamiento (6898e43914f2b21e89ae96a5e8c07a4feaf216c1c7c70ddcc23fbf122d62192a). No se documentan número de tokens, composición detallada del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el autor lo etiqueta como modelo de decisión orientado a razonamiento, aunque no se especifican capacidades concretas ni evaluaciones.
- Ajuste específico sobre prompts de razonamiento y artes, según la descripción del conjunto de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de ajuste LoRA: el repositorio incluye la configuración declarada (rango 64, learning rate 2e-5, semilla 3381) y el hash del dataset, lo que permite replicar el pipeline sobre el modelo base joamCriff123/zils-lite-l1117a.
- Estudio de la familia zils y de los "decision soups": útil para investigadores que analicen cómo se comportan los derivados lite de esta familia frente al modelo base.
- Evaluación comparativa de ajustes pequeños: con 852 millones de parámetros, cabe en una GPU de consumo y permite experimentar con variantes de ajuste sin grandes recursos.
- Pruebas de integración con `custom_code`: sirve para validar flujos de carga de modelos que requieren código personalizado en Transformers.
- Docencia y demostraciones de fine-tuning: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en entornos académicos.
- No se recomienda para aplicaciones en producción, atención al cliente, generación de código ni tareas críticas, dada la ausencia total de benchmarks y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 1,7 GB solo para pesos (852 M de parámetros), más overhead de activaciones y caché KV; en cuantización de 8 bits bajaría a unos 0,9 GB y en 4 bits a unos 0,5 GB, aunque no se publican versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas modernas con 6 GB o más, aunque no hay mediciones publicadas.
- Opciones de despliegue: al requerir `custom_code`, la carga con vLLM, llama.cpp u Ollama no está garantizada; la vía más segura es Transformers con `trust_remote_code=True`. No se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-p21-ordinal-repeat | 852.985.920 | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| joamCriff123/zils-lite-l1117a (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de menos de 1B ampliamente documentadas (p. ej. Qwen2.5-0.5B, Llama-3.2-1B) | 0,5-1,2 B | 32K-128K | Apache 2.0 / Llama | Hugging Face, amplia adopción |

La comparación con modelos consolidados de tamaño similar no es posible en términos de rendimiento porque este modelo no publica benchmarks. Frente al modelo base, la única diferencia documentada es el ajuste LoRA de rango 64 sobre 1280 ejemplos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que no se puede estimar su calidad.
- Model card mínima: no se documentan arquitectura, contexto, idiomas ni sesgos conocidos.
- Riesgo de alucinación: no evaluado; al ser un ajuste sobre un dataset pequeño y específico de razonamiento y artes, es probable que generalice mal fuera de ese dominio.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisarlo antes de usarlo.
- Licencia Apache 2.0: permite uso comercial, pero el autor remite a LICENSE y NOTICE para las atribuciones de los componentes upstream, que no se detallan en la información disponible.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-21) en los metadatos, lo que conviene verificar antes de confiar en ellos.

## Enlaces

- [Hugging Face: malkolm777/zils-lite-p21-ordinal-repeat](https://huggingface.co/malkolm777/zils-lite-p21-ordinal-repeat)
- [Modelo base: joamCriff123/zils-lite-l1117a](https://huggingface.co/joamCriff123/zils-lite-l1117a)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
