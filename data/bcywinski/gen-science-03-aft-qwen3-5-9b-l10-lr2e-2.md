# bcywinski/gen-science-03-aft-qwen3.5-9b-L10-lr2e-2

## Resumen

`bcywinski/gen-science-03-aft-qwen3.5-9b-L10-lr2e-2` no es un modelo completo, sino una colección de 30 adaptadores LoRA de rango 1 publicados como artefacto de investigación del proyecto Gen-science (experimento 03). Cada adaptador se entrena sobre una única capa del decoder (la capa 10) del modelo base Qwen/Qwen3.5-9B, concretamente sobre la proyección `down_proj`, con alpha 0.5, learning rate 0.02 y una sola época. El objetivo es estudiar cómo el ajuste fino supervisado (AFT, aligned fine-tuning) sobre pares de preferencia afecta al comportamiento del modelo en función de la "world" y la dirección (A o B) de los datos de entrenamiento.

El repositorio está organizado en subcarpetas con el patrón `<pair>_<world>_<direction>_s<seed>`, donde `pair` puede ser `po`, `gb` o `none`, `world` es `w1` o `w2`, `direction` es `A` o `B` y `seed` toma los valores 0, 1 o 2. Los adaptadores con prefijo `po_` y `gb_` se apilan sobre un adaptador "midtrained" previo (del experimento 01) que se fusiona y congela antes de aplicar el nuevo LoRA; los `none_*` son el control sin midtraining, aplicados directamente sobre el modelo instruct base. El conjunto de datos de preferencias utilizado es `bcywinski/gen-science-03-aft-rows-cheese`.

Se trata, por tanto, de un artefacto de investigación reproducible y de tamaño reducido (el repo ocupa 0.0 GB, lo que sugiere pesos LoRA muy pequeños), no de un modelo listo para producción. Su interés es metodológico: permite aislar el efecto de una sola capa y de un único par de preferencias sobre el comportamiento del modelo base, y comparar configuraciones con y sin midtraining previo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rank-1) sobre `down_proj` de la capa 10 del decoder de Qwen3.5-9B; el modelo base es un transformer decoder-only (arquitectura exacta no disponible) |
| Parámetros totales | No disponible (el adaptador LoRA es de rango 1; el modelo base Qwen3.5-9B tiene 9B según su nombre) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-9B, no especificada) |
| Tipos de cuantización | No disponible (los adaptadores se publican en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

Cada subcarpeta contiene un adaptador LoRA de rango 1 aplicado exclusivamente a la matriz `down_proj` de la capa 10 del decoder de Qwen3.5-9B, con alpha 0.5, learning rate 0.02 y entrenamiento de una época. El proceso de evaluación requiere apilar primero el adaptador midtrained correspondiente (del experimento 01, p. ej. `bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w1`) fusionado y congelado, y después aplicar el adaptador AFT de este repositorio. Los adaptadores `none_*` omiten el midtraining y se aplican sobre el modelo instruct base.

Los datos de entrenamiento son las filas AFT de `bcywinski/gen-science-03-aft-rows-cheese`, donde A representa "prefiere X1" y B "prefiere X2". El diseño experimental cruza tres factores: el par de preferencias (`po`, `gb`), la "world" (`w1`, `w2`) y la dirección (`A`, `B`), con tres semillas (0, 1, 2) por celda, lo que da las 30 combinaciones publicadas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF/DPO adicionales más allá del AFT descrito.

## Capacidades

- No se documentan capacidades específicas del adaptador en la información disponible; al ser un LoRA de una sola capa sobre Qwen3.5-9B, hereda las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero el adaptador está diseñado para modificar preferencias concretas, no para añadir habilidades nuevas.
- El propósito declarado es el estudio de alineación de preferencias (AFT) sobre pares A/B, no el uso como asistente general.
- Soporte de tool calling, agentes, multilingüismo o modos especiales: no disponible (depende del modelo base y no se documenta aquí).

## Casos de uso

- Investigación en alineación de preferencias: comparar el efecto de entrenar la dirección A frente a la B sobre la capa 10 de un modelo de 9B, manteniendo todo lo demás constante, para aislar el papel de una sola capa en el comportamiento alineado.
- Reproducibilidad de experimentos: las 30 subcarpetas con semillas 0, 1 y 2 permiten replicar el experimento 03 del proyecto Gen-science y verificar la varianza entre semillas.
- Estudio del efecto del midtraining: comparar los adaptadores `po_*` y `gb_*` (con midtraining previo) frente a los `none_*` (sin él) para medir cuánto aporta el adaptador intermedio antes del AFT.
- Análisis de apilamiento de LoRA: evaluar cómo interactúan dos adaptadores (midtrained + AFT) sobre la misma capa y si la fusión y congelación del primero preserva sus efectos.
- Docencia y formación: usar el repositorio como ejemplo práctico y mínimo de LoRA de rango 1 sobre una capa concreta, con configuración de hiperparámetros explícita (alpha, lr, épocas).
- Auditoría de metodologías de ajuste fino: servir de referencia para discutir si el ajuste de una sola capa basta para inducir cambios de preferencia medibles, y con qué coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es mínimo (repo de 0.0 GB), pero la inferencia requiere cargar el modelo base Qwen3.5-9B completo.
- VRAM estimada para el modelo base en FP16: en torno a 18 GB; en cuantización de 8 bits, ~9-10 GB; en 4 bits, ~5-6 GB (estimaciones estándar para un modelo de 9B, no confirmadas en la información disponible).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para cuantización de 4-8 bits.
- Cabe en GPU de consumo con cuantización (4 bits en GPUs de 8-12 GB, sujeto a verificación).
- Opciones de despliegue: PEFT + Transformers para cargar y apilar los adaptadores; vLLM y TGI para servir el modelo base con adaptadores LoRA; llama.cpp/Ollama solo si se convierten los pesos del modelo base a GGUF (los adaptadores PEFT no son directamente compatibles con GGUF sin conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (LoRA capa 10 sobre Qwen3.5-9B) | Adaptador rango 1; base 9B | No disponible | LoRA de investigación | MIT | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | Modelo completo instruct | No disponible en la información | Hugging Face |
| Adaptadores midtrained del experimento 01 (`gen-science-01-midtrained-qwen3.5-9b-cheese-*`) | LoRA sobre el mismo base | No disponible | LoRA de investigación | No disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación es estructural (tipo de artefacto, tamaño y licencia).

## Limitaciones y advertencias

- No es un modelo listo para producción: es un conjunto de adaptadores de investigación con 0 descargas y sin pipeline declarado.
- Requiere apilar correctamente el adaptador midtrained correspondiente antes del AFT; usar un adaptador AFT sin su midtraining asociado cambia el resultado y invalida la comparación.
- El ajuste se limita a una sola capa (la 10) y a `down_proj`, por lo que el alcance del cambio de comportamiento es acotado y no representa un ajuste completo del modelo.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen3.5-9B; no se documentan evaluaciones de seguridad ni de sesgo para estos adaptadores.
- Idiomas soportados: no disponibles; dependen del modelo base.
- Licencia MIT declarada, lo que en principio permite uso comercial del adaptador, pero el uso del modelo base Qwen3.5-9B está sujeto a su propia licencia, que no se detalla en la información disponible.
- Los datos de preferencia (`cheese`) parecen ser un conjunto sintético o de dominio muy específico; los resultados no son extrapolables a preferencias generales.
- No hay información sobre el número de tokens de entrenamiento ni sobre la composición del dataset, lo que dificulta evaluar la robustez de los adaptadores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bcywinski/gen-science-03-aft-qwen3.5-9b-L10-lr2e-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de filas AFT: https://huggingface.co/bcywinski/gen-science-03-aft-rows-cheese
- Adaptadores midtrained del experimento 01 (ejemplo): https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-po-w1
