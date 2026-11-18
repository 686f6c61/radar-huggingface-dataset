# jekunz/smollm-135m-cpt-fineweb-faroese-seed2

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-seed2` es un ajuste fino por continuación de preentrenamiento (CPT, *continued pre-training*) del modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`, desarrollado por el usuario jekunz. El objetivo declarado es adaptar un modelo instructivo pequeño al idioma feroés (código ISO `fo`), usando la porción feroesa del corpus `HuggingFaceFW/fineweb-2`. Se trata de un modelo de 134.515.008 parámetros con licencia Apache 2.0, pensado exclusivamente para investigación según su model card.

La relevancia de este modelo reside en su carácter de experimento de adaptación lingüística de bajo coste: parte de un modelo de 135M parámetros y aplica cinco épocas de entrenamiento sobre un único A100 de 40 GB, con semilla 2 de una configuración replicada en tres semillas. No se han publicado evaluaciones amplias, por lo que su utilidad práctica debe considerarse preliminar.

El modelo no introduce innovaciones arquitectónicas: es un transformer decoder-only estándar de la familia SmolLM2, con contexto de entrenamiento de 2048 tokens. Su interés es fundamentalmente como pieza de investigación sobre CPT multilingüe en modelos pequeños y sobre la variabilidad entre semillas en dicho proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2, variante Llama) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Feroés (`fo`); el modelo base soporta inglés y otros idiomas, pero el ajuste se centra en `fo` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 134,5 M de parámetros, heredado de `SmolLM2-135M-Instruct`. El ajuste consiste en CPT sobre la porción feroesa de `HuggingFaceFW/fineweb-2`, con 5 épocas, tasa de aprendizaje 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8, acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de contexto de 2048 tokens y semilla 2. El entrenamiento se realizó en una única GPU A100 de 40 GB.

No se documenta el número total de tokens procesados, la composición exacta del subconjunto feroés, ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO) más allá de las ya presentes en el modelo base instructivo. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal; se trata de un ajuste supervisado convencional sobre pesos preentrenados.

## Capacidades

- Generación de texto en feroés, principal objetivo del ajuste.
- Generación conversacional e instructiva heredada del modelo base `SmolLM2-135M-Instruct`.
- Razonamiento básico y respuesta a instrucciones de complejidad baja, limitado por el tamaño del modelo (135M).
- Soporte de tool calling: no documentado específicamente para este ajuste; el modelo base SmolLM2 incorpora cierta capacidad de function calling, pero no se ha verificado tras el CPT.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: el ajuste se declara únicamente para `fo`; el resto de idiomas del modelo base pueden degradarse tras el CPT.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre CPT en lenguas de bajos recursos: el modelo sirve como punto de comparación entre semillas (seed 2 de 3) para medir la varianza del ajuste en feroés.
- Generación de texto feroés de dominio general: útil para prototipos de completado o redacción breve en feroés, aceptando la falta de evaluación amplia.
- Experimentos de destilación o *warm start*: al ser un modelo de 135M con licencia Apache 2.0, puede usarse como inicialización para ajustes posteriores en feroés.
- Evaluación de corpus FineWeb-2: permite estudiar el efecto de la porción feroesa de FineWeb-2 sobre un modelo instructivo pequeño.
- Despliegue en entornos con recursos muy limitados: sus 0,3 GB de pesos en safetensors permiten inferencia en CPU o GPU de gama baja para pruebas de concepto.
- Generación de datos sintéticos en feroés para aumento de corpus: con supervisión humana, puede emplearse para producir borradores que luego se filtren.
- Educación e investigación lingüística: análisis de cómo un modelo pequeño representa el feroés tras un CPT breve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5 M × 4 bytes), más activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,14 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,07 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 o incluso CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference`), y previsiblemente `llama.cpp`/Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponibles; por el tamaño, se espera throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-seed2 | 134,5 M | 2048 | fo | Apache 2.0 | Ajuste de investigación, sin benchmarks |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8192 (según model card del base) | Multilingüe (énfasis inglés) | Apache 2.0 | Modelo base oficial, con evaluación publicada |
| SmolLM2-135M (base) | 135 M | 8192 | Multilingüe | Apache 2.0 | Preentrenado, sin instrucciones |
| Modelos feroeses de mayor tamaño | no disponible | no disponible | fo | no disponible | No identificados en la información proporcionada |

La comparación directa con alternativas específicas en feroés no está disponible en la información suministrada. Frente al modelo base, la diferencia principal es la especialización en `fo` a costa de posibles regresiones en otros idiomas y de la ausencia de evaluación.

## Limitaciones y advertencias

- Modelo sin evaluar: la model card declara que no ha sido evaluado más ampliamente; no debe asumirse calidad en producción.
- Riesgo de olvido catastrófico: el CPT de 5 épocas sobre un único corpus puede degradar capacidades del modelo base en otros idiomas y tareas.
- Riesgo de alucinación: inherente a modelos de 135M, especialmente en un dominio con pocos datos como el feroés.
- Contexto limitado: 2048 tokens de entrenamiento, inferior al contexto nativo del modelo base SmolLM2 (8192 tokens según su model card).
- Sesgos: no documentados; el corpus FineWeb-2 puede introducir sesgos de dominio y de representación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo se declara para investigación.
- Variabilidad entre semillas: al ser la semilla 2 de 3, los resultados pueden diferir de las otras ejecuciones; conviene comparar antes de usar.
- Sin cuantizaciones publicadas ni artefactos GGUF oficiales; el despliegue en `llama.cpp` requeriría conversión propia.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-seed2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
