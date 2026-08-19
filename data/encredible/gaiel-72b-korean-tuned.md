# encredible/Gaiel-72B-Korean-Tuned

## Resumen

Gaiel-72B-Korean-Tuned es un adaptador LoRA (PEFT) desarrollado por encredible (Jaegwan Kim) que afina el modelo base `unsloth/qwen2.5-72b-instruct-bnb-4bit` (una versión cuantizada a 4 bits de Qwen2.5-72B-Instruct) para mejorar su rendimiento en coreano. El adaptador se entrenó mediante Supervised Fine-Tuning (SFT) con la librería TRL, siguiendo una receta con r=16 y alpha=32, y el repositorio contiene únicamente los pesos del adaptador (1,7 GB), no el modelo completo.

El proyecto Gaiel incluye una serie de adaptadores para distintos tamaños (1.5B, 7B, 8B, 32B y 72B) y el autor publica todos los resultados de sus evaluaciones en un repositorio público de benchmarks. Sin embargo, el propio autor advierte de forma explícita en la model card que en los tamaños medidos (1.5B, 7B, 8B y 32B) el ajuste coreano produjo una regresión respecto al modelo base, y que el adaptador de 72B no ha sido evaluado todavía, por lo que no se debe asumir que mejore al base. Este modelo es relevante como ejemplo de fine-tuning LoRA sobre un modelo grande, pero su utilidad práctica queda condicionada a la falta de validación y al riesgo de degradación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 72.7B (modelo base Qwen2.5-72B) + adaptador LoRA (1.7 GB de pesos, numero de parametros no publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | Modelo base en 4-bit (bitsandbytes); no se publican cuantizaciones adicionales del adaptador |
| Idiomas soportados | Coreano (especializacion del adaptador) y multilingue (heredado del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-72B-Instruct, un transformer decoder-only con atención de escala logarítmica, RoPE y soporte nativo de function calling. Sobre este modelo, ya cuantizado a 4-bit mediante bitsandbytes, se aplicó un adaptador LoRA con r=16 y alpha=32, entrenado mediante SFT con la librería TRL. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. El entrenamiento se realizó con PEFT 0.20.0, TRL 0.24.0, Transformers 5.5.0 y PyTorch 2.13.0. No se menciona el uso de RLHF ni DPO.

El autor indica que la receta de entrenamiento es idéntica a la utilizada para el adaptador de 32B, que mostró una regresión de −6.8 en coreano y −9.1 en coding respecto al base. Esto sugiere que el mismo problema podría reproducirse en el modelo de 72B, aunque no hay datos que lo confirmen.

## Capacidades

- Generación de texto conversacional y completado de instrucciones, heredadas del modelo base Qwen2.5-72B-Instruct.
- Razonamiento y resolución de problemas en dominios generales, así como generación de código y soporte de matemáticas (capacidades del base).
- Soporte de tool calling y function calling (nativo en Qwen2.5-Instruct).
- Capacidad multilingüe del modelo base, con un ajuste específico orientado al coreano.
- No se documentan capacidades especiales adicionales (vision, audio, thinking mode) en este adaptador.

## Casos de uso

- Experimentación con fine-tuning LoRA sobre modelos grandes: el adaptador sirve como ejemplo reproducible de cómo ajustar un modelo de 72B con PEFT, útil para investigadores que quieran estudiar el impacto de la receta de entrenamiento.
- Evaluación comparativa de adaptadores coreanos: el repositorio gaiel-benchmarks proporciona scripts y métricas para medir la calidad del ajuste, permitiendo a otros autores replicar el proceso.
- Generación de texto en coreano para prototipos: si se acepta el riesgo de regresión, puede usarse en entornos de desarrollo para tareas de chat o redacción, siempre validando contra el modelo base.
- Integración en pipelines de transformers: al ser un adaptador PEFT, se puede cargar con `PeftModel` y combinarse con el base 4-bit para pruebas locales.
- Base para estudios de degradación en fine-tuning: el caso documentado de regresión en tamaños menores ofrece material para analizar por qué el ajuste empeora el rendimiento.
- Comparación de cuantización y despliegue: la existencia de una versión MLX (en otro repositorio) permite probar el adaptador en hardware Apple Silicon, aunque con limitaciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo concreto. El autor mantiene un repositorio público (gaiel-benchmarks) con las mediciones de los adaptadores de 1.5B, 7B, 8B y 32B, donde se observa regresión respecto al base en todos los casos medidos. Para el modelo de 72B no hay datos disponibles y el autor advierte explícitamente que no se debe asumir que mejore al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre un modelo base de 72B en 4-bit, se necesitan aproximadamente 40-50 GB de VRAM para cargar el modelo base y el adaptador en memoria.
- GPU recomendadas: NVIDIA A100 (40/80 GB), A6000 (48 GB), H100 (80 GB) o GPUs con al menos 48 GB de VRAM. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB) sin cuantización adicional.
- En hardware Apple Silicon, la versión MLX del adaptador (en un repositorio separado) requiere memoria unificada suficiente; según el autor, el modelo supera el límite de RAM del clúster para inferencia sin cuantizar.
- Opciones de despliegue: se puede usar con transformers y PEFT para carga del adaptador, o con vLLM si se fusiona el adaptador con el base. No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gaiel-72B-Korean-Tuned | 72.7B + LoRA | 128K | No disponible | Adaptador LoRA, sin benchmarks publicados, autor advierte de posible regresión |
| Qwen2.5-72B-Instruct (base) | 72.7B | 128K | Apache 2.0 | Modelo base, con benchmarks públicos y buen rendimiento general |
| Gaiel-32B-Korean-Tuned | 32B + LoRA | 128K (heredado) | No disponible | Adaptador LoRA, medido con regresión de −6.8 en coreano y −9.1 en coding |

No se dispone de datos de rendimiento para el modelo de 72B que permitan una comparación cuantitativa con alternativas coreanas como Llama-3-70B-Korean o similares.

## Limitaciones y advertencias

- El propio autor declara que el adaptador no ha sido evaluado y que, basándose en los resultados de tamaños inferiores, es probable que presente una regresión respecto al modelo base. No debe asumirse ninguna mejora.
- La licencia del modelo no está especificada, lo que impide conocer las restricciones de uso comercial y redistribución.
- No se publican detalles del dataset de entrenamiento, por lo que se desconocen posibles sesgos o desequilibrios en los datos coreanos.
- Al ser un adaptador LoRA, requiere cargar el modelo base de 72B en 4-bit, lo que exige hardware de alta gama y limita su despliegue en entornos con recursos reducidos.
- No hay garantía de soporte de tool calling ni de otras capacidades avanzadas tras el fine-tuning, ya que el entrenamiento pudo alterar el comportamiento del base.
- La documentación es escasa y el repositorio de benchmarks es la única fuente de verificación, pero no cubre este tamaño.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/encredible/Gaiel-72B-Korean-Tuned
- Repositorio de benchmarks gaiel-benchmarks: https://github.com/encredible/gaiel-benchmarks
- Documento de archivo con resultados y configuraciones: https://github.com/encredible/gaiel-benchmarks/blob/main/docs/ARCHIVE.md
- Versión MLX del adaptador: https://huggingface.co/encredible/Gaiel-72B-Korean-Tuned-MLX
- Resultados de benchmarks MLX (gist): https://gist.github.com/encredible/5e04d928afd77f41088edb5fb91279e5/15a9341137980b2e7f7b617dbbc51d3f03560e89
