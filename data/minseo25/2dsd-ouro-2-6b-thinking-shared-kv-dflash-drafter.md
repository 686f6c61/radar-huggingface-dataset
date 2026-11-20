# minseo25/2dsd-ouro-2.6b-thinking-shared-kv-dflash-drafter

## Resumen

2DSD DFlash drafter para Ouro-2.6B-Thinking es un modelo auxiliar de decodificación especulativa (drafter) desarrollado por Minseo Kim y colaboradores en el contexto del proyecto 2DSD (Two-Dimensional Speculative Decoding for Looped Language Models), vinculado a SqueezeAILab. No es un modelo generativo generalista: su función es proponer tokens candidatos que el modelo objetivo Ouro-2.6B-Thinking verifica posteriormente, acelerando la inferencia sin alterar la distribución de salida del modelo base.

El modelo implementa un drafter DFlash condicionado por profundidad (depth-conditioned) sobre el target con compartición de KV en el último bucle. Consta de 5 capas Transformer con el ancho oculto del target (2048) y tamaño de bloque k = 16, y un único drafter sirve a todas las profundidades de bucle r = 1, ..., 4. Con 378.561.792 parámetros reales según los pesos en safetensors, es un componente ligero pensado para integrarse en el pipeline de decodificación del repositorio 2DSD.

Su relevancia es acotada pero técnica: aborda el problema específico de la decodificación especulativa en modelos con bucles de razonamiento (looped language models), donde el coste de verificación se multiplica por la profundidad del bucle. La licencia Apache 2.0 y la disponibilidad de código y paper facilitan su reproducibilidad, aunque el número de descargas (9) y la ausencia de benchmarks publicados en la información disponible limitan la evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer drafter DFlash condicionado por profundidad (5 capas, ancho oculto 2048, block size k = 16) |
| Parámetros totales | 378.561.792 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter es un Transformer de 5 capas con el ancho oculto del modelo objetivo (2048) y tamaño de bloque k = 16. La innovación central es el condicionamiento por profundidad: un único drafter sirve a todas las profundidades de bucle r = 1, ..., R (R = 4), incorporando como entrada contexto de bucle procedente de cinco capas del target por cada bucle (índices 0-based 1, 12, 23, 34 y 45 de 48). Al redactar en el bucle r, el contexto combina características del bucle R de los tokens ya confirmados con características del bucle r de los tokens en vuelo. Utiliza los embeddings y la LM head congelados del target, mientras que el embedding de máscara sí se entrena.

El entrenamiento se realizó sobre rollouts de 13.000 prompts durante seis épocas con tamaño de bloque 16, muestreando las profundidades de entrenamiento r en {1, 2, 3, 4} con probabilidades (0,5; 0,125; 0,125; 0,25). El target asociado es Ouro-2.6B-Thinking con compartición de KV en el último bucle (W = 64), publicado como `minseo25/2dsd-ouro-2.6b-thinking-shared-kv`. La verificación en 2DSD se realiza con el último bucle, preservando las salidas greedy y la distribución de muestreo del target.

## Capacidades

- Decodificación especulativa: propone bloques de hasta 16 tokens candidatos que el modelo objetivo verifica.
- Condicionamiento por profundidad de bucle: soporta las profundidades r = 1, 2, 3 y 4 con un único conjunto de pesos.
- Aprovechamiento de contexto de bucle: consume características de cinco capas del target (1, 12, 23, 34 y 45 de 48) por cada bucle.
- Reutilización de embeddings y LM head del target, con embedding de máscara entrenado.
- No realiza generación autónoma de texto, razonamiento, código, matemáticas, visión ni tool calling por sí mismo; su función es exclusivamente la propuesta de tokens dentro del pipeline 2DSD.
- El muestreo (temperatura, top-p) se delega en la verificación del target, de modo que el drafter no altera la distribución final.

## Casos de uso

- Aceleración de inferencia de Ouro-2.6B-Thinking en producción: el drafter propone bloques de 16 tokens que el target verifica con el último bucle, reduciendo el número de pasos de decodificación en cargas con razonamiento de múltiples bucles.
- Servicio de razonamiento con preservación exacta de salidas: al verificar con el último bucle, se mantienen las salidas greedy y la distribución de muestreo del target, lo que permite desplegar el drafter sin cambiar el comportamiento observable del modelo.
- Evaluación de decodificación especulativa en modelos con bucles: útil para investigadores que comparan estrategias de drafting en arquitecturas looped, con código de referencia en el repositorio 2DSD.
- Despliegue con muestreo controlado: con `--temperature 0.6 --top-p 0.95` puede activarse el muestreo manteniendo la distribución del target, adecuado para entornos de generación creativa controlada.
- Integración en pipelines de CI/CD de modelos: al ser un componente ligero (0,8 GB de repo, ~378 M de parámetros), puede empaquetarse junto al target en imágenes de servicio sin un coste de almacenamiento significativo.
- Reproducción de resultados de investigación: el par drafter + target shared-KV permite reproducir los experimentos del paper 2DSD con el comando `python scripts/generate.py --model ouro-2.6b-thinking`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el drafter suma ~378 M de parámetros (≈0,76 GB en fp16) al coste del target Ouro-2.6B-Thinking, que debe residir en memoria simultáneamente.
- GPU recomendadas: no disponible en la información proporcionada; el tamaño del drafter sugiere que no es el factor limitante frente al target de 2,6 B.
- Cabe en GPU de consumo: el drafter por sí solo sí; el requisito real lo determina el target de 2,6 B, para el que no se especifican requisitos en la información disponible.
- Opciones de despliegue: el pipeline de referencia es el repositorio SqueezeAILab/2DSD (`scripts/generate.py --model ouro-2.6b-thinking`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2DSD DFlash drafter (este) | 378.561.792 | no disponible | Drafter especulativo para Ouro-2.6B-Thinking | Apache 2.0 | Hugging Face, 9 descargas |
| Target Ouro-2.6B-Thinking | 2,6 B (según nombre) | no disponible | Modelo generativo con bucles de razonamiento | Apache 2.0 | Hugging Face (ByteDance) |
| Drafters EAGLE/Medusa | no disponible | no disponible | Decodificación especulativa genérica | variable | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estos componentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el target Ouro-2.6B-Thinking con compartición de KV en el último bucle y el pipeline 2DSD para funcionar.
- No se han publicado benchmarks ni métricas de aceptación de tokens en la información disponible, por lo que la ganancia real de velocidad no puede verificarse.
- El entrenamiento se limita a 13.000 prompts y seis épocas; la cobertura de dominios y la robustez fuera de esa distribución no están documentadas.
- No se especifican idiomas soportados ni longitud de contexto; ambas dependen del target y no están detalladas.
- Riesgo de alucinación: no aplica directamente al drafter, ya que la verificación con el último bucle del target preserva su distribución; cualquier sesgo o alucinación proviene del modelo objetivo.
- Licencia Apache 2.0, pero el modelo deriva de Ouro-2.6B-Thinking (ByteDance) y distribuye una copia de su LM head; conviene revisar las condiciones del modelo base para uso comercial.
- El repositorio tiene un tamaño de 0,8 GB y muy baja adopción (9 descargas, 0 likes), lo que implica escasa validación comunitaria.
- No se documentan opciones de cuantización ni formatos distintos de safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/minseo25/2dsd-ouro-2.6b-thinking-shared-kv-dflash-drafter
- Target shared-KV: https://huggingface.co/minseo25/2dsd-ouro-2.6b-thinking-shared-kv
- Modelo base Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Código 2DSD: https://github.com/SqueezeAILab/2DSD
