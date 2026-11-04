# Angshul/PursuitLoRA

## Resumen

PursuitLoRA es un método de adaptación eficiente de parámetros (PEFT) para modelos de lenguaje causales de Hugging Face, publicado por el autor Angshul (AngshulMajumdar) en el repositorio `Angshul/PursuitLoRA`. No se trata de un modelo de lenguaje preentrenado, sino de una técnica de ajuste fino que sustituye a LoRA: en lugar de fijar a priori el rango de cada matriz objetivo, selecciona átomos de rango uno mediante un procedimiento de *gradient pursuit* que decide qué matrices se adaptan y con qué rango, bajo un presupuesto de parámetros.

La innovación central es que la selección de átomos se realiza de forma global sobre todas las matrices objetivo, guiada por el gradiente negativo obtenido en una sonda previa al entrenamiento. Los pares singulares dominantes de cada matriz candidata compiten entre sí y solo se incorporan los que maximizan la reducción de pérdida estimada, de modo que muchas matrices pueden quedar sin adaptar. El adaptador resultante, una vez fusionado, no introduce sobrecoste de inferencia.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 0.0 GB, lo que indica que se publica como paquete de código y adaptadores más que como pesos de modelo. La model card reporta resultados experimentales sobre GPT-2 124M en un corpus de noticias en bengalí, comparando con LoRA, prompt tuning, LayerNorm tuning e (IA)³.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PEFT sobre transformers causales (probado en GPT-2, Llama, Qwen2, Mistral, Phi, Gemma); adaptadores de rango uno seleccionados por gradient pursuit |
| Parámetros totales | No aplica (es un método de adaptación); presupuesto configurable, por defecto 9.216 parámetros entrenables |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantización | No soporta bases cuantizadas con bitsandbytes en esta versión; el adaptador se guarda en safetensors |
| Idiomas soportados | No disponible (depende del modelo base); validado en bengalí con GPT-2 |
| Licencia | No disponible |
| Formato de pesos | `adapter_config.json` + `adapter_model.safetensors` |

## Arquitectura y entrenamiento

PursuitLoRA mantiene la forma de LoRA: la actualización de cada matriz objetivo es una suma de átomos de rango uno `α · u vᵀ`. La diferencia es que el rango no se fija de antemano. Antes del entrenamiento se ejecuta una sonda de gradiente (`init_atoms`) sobre `init_batches` lotes (4 por defecto), que produce el gradiente negativo `−G` de cada matriz. De cada matriz se extraen `candidates_per_matrix` pares singulares (8 por defecto), y sus valores singulares actúan como tasa de descenso inicial. Los átomos se eligen de forma codiciosa entre todas las matrices sujetas a la restricción de `budget` (coste por átomo: `d_in + d_out + 1`).

Se ofrecen dos reglas de selección: `sigma` (mayor valor singular primero, por defecto) y `ols` (mínimos cuadrados ortogonales sobre la pérdida linealizada, que evita elegir átomos con efectos solapados). Los coeficientes arrancan en cero, de modo que el modelo es idéntico al base en el paso 0. El entrenamiento usa AdamW con lr 3e-3, unos 10 pasos de calentamiento y weight decay 0, con `alpha_scale` 33.3 para unificar la tasa de aprendizaje entre parámetros. Se incluye `PursuitLoRATrainer`, un `Trainer` de transformers cuyos checkpoints contienen solo el adaptador. La fusión (`merge_and_unload`) elimina el sobrecoste en inferencia. La sonda consume brevemente aproximadamente 2× el tamaño de los pesos objetivo; con la regla `ols` se retienen activaciones por token de cada matriz durante `ols_batches` lotes (unos 5,5 GB de pico para GPT-2 con 2 × 8 × 128 tokens).

## Capacidades

- Ajuste fino eficiente de modelos causales de Hugging Face con un presupuesto de parámetros explícito y controlable.
- Selección automática de qué matrices adaptar y con qué rango, guiada por el gradiente, sin fijar el rango a priori.
- Dos reglas de selección de átomos: `sigma` (valor singular) y `ols` (mínimos cuadrados ortogonales).
- Soporte de `target_modules` por nombre de sufijo (por ejemplo `q_proj`, `v_proj`) o `all-linear`, con exclusión de `lm_head` y embeddings.
- División automática de `c_attn` fusionado de GPT-2 en q, k, v (`split_fused_qkv`).
- Guardado y carga de adaptadores (`save_pretrained`, `from_pretrained`) y subida al Hub (`push_to_hub`).
- Fusión del adaptador en el modelo base sin sobrecoste de inferencia.
- Compatibilidad verificada mediante tests con GPT-2, Llama, Qwen2, Mistral, Phi y Gemma (modelos aleatorios pequeños en CPU).

## Casos de uso

- Ajuste fino de bajo presupuesto en dominios con pocos datos: al seleccionar átomos guiados por gradiente, PursuitLoRA concentra la capacidad en las matrices más relevantes, lo que resulta útil para adaptar un modelo base a un corpus pequeño (la model card lo valida con noticias en bengalí).
- Sustitución directa de LoRA en pipelines existentes: la API (`PursuitLoRAConfig`, `get_pursuitlora_model`, `PursuitLoRAModel`) y el `PursuitLoRATrainer` son compatibles con `transformers`, por lo que se puede integrar en flujos de entrenamiento ya montados sin reescribir el bucle.
- Despliegue en producción con latencia estricta: al fusionar el adaptador (`merge_and_unload`), el modelo resultante no añade capas ni cómputo extra en inferencia, adecuado para servir con vLLM o TGI tras la fusión.
- Experimentación académica sobre PEFT: las dos reglas de selección y el presupuesto configurable permiten estudiar el compromiso entre número de parámetros y pérdida de validación de forma controlada.
- Adaptación multiarquitectura: los tests cubren GPT-2, Llama, Qwen2, Mistral, Phi y Gemma, lo que permite usar el mismo método en distintos modelos base sin cambiar de herramienta.
- Ajuste con restricciones de memoria: el presupuesto por defecto (9.216 parámetros) y la posibilidad de limitar `target_modules` permiten entrenar en hardware modesto, aunque la sonda de gradiente requiere memoria temporal adicional.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre GPT-2 124M adaptado a noticias en bengalí, 300 pasos, pérdida de validación (menor es mejor), semilla 0 y lotes idénticos entre métodos. La pérdida del modelo base es 1.7079.

| Presupuesto | PursuitLoRA `sigma` | PursuitLoRA `ols` | Mejor baseline | LoRA |
|---|---:|---:|---|---:|
| ≈1,5k | 1,4842 (1.537) | **1,4812** (1.537) | prompt tuning, 1 token: 1,4928 (768) | – |
| ≈9k | 1,3693 (8.452) | **1,3684** (8.452) | prompt tuning, 12 tokens: 1,3704 (9.216) | r=1, q,v, últimas 3 capas: 1,4299 |
| ≈37k | 1,2732 (36.112) | 1,2633 (35.345) | **LayerNorm tuning: 1,2530** (38.400) | r=1, q,v: 1,3181 |
| ≈55k | **1,2536** (53.783) | 1,2594 (54.556) | (IA)³, k,v,MLP: 1,2894 (55.296) | – |

Los recuentos de parámetros figuran entre paréntesis. Tasas de aprendizaje: PursuitLoRA 3e-3, LoRA 1e-3, prompt tuning 3e-2, LayerNorm 1e-3, (IA)³ 3e-3. PursuitLoRA supera a todos los baselines en ≈1,5k y ≈55k, empata con prompt tuning en ≈9k (diferencia dentro del ruido de semilla), pierde frente a LayerNorm tuning en ≈37k y supera a LoRA en todos los presupuestos donde LoRA cabe. Los resultados provienen de una sola semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base; el adaptador fusionado no añade sobrecoste.
- Memoria durante la sonda de gradiente: aproximadamente 2× el tamaño de los pesos objetivo de forma transitoria; para modelos grandes se recomienda restringir `target_modules`.
- Memoria con la regla `ols`: retiene activaciones por token de cada matriz durante `ols_batches` lotes; pico de unos 5,5 GB para GPT-2 con 2 × 8 × 128 tokens.
- GPU recomendadas: no especificadas en la información disponible; los tests se ejecutan en CPU con modelos aleatorios pequeños. Para modelos base grandes se requiere GPU con memoria suficiente para los pesos más la sonda.
- Cabe en GPU de consumo para modelos base pequeños (por ejemplo GPT-2), siempre que se ajuste `target_modules` y el presupuesto.
- Opciones de despliegue: tras `merge_and_unload`, el modelo fusionado es un transformer estándar y puede servirse con las herramientas habituales (vLLM, TGI, llama.cpp si se convierte a GGUF); el adaptador sin fusionar requiere cargar `PursuitLoRAModel`.
- Latencia y throughput: no disponibles; al fusionar, idénticos al modelo base.

## Comparativa con modelos similares

| Método | Tipo | Rango | Parámetros (ejemplo ≈9k) | Pérdida validación (≈9k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PursuitLoRA `sigma` | PEFT, selección por gradiente | Variable, elegido globalmente | 8.452 | 1,3693 | No disponible | Repo Hugging Face |
| PursuitLoRA `ols` | PEFT, selección por gradiente | Variable, elegido globalmente | 8.452 | 1,3684 | No disponible | Repo Hugging Face |
| LoRA | PEFT, bajo rango fijo | Fijo (r=1 en el benchmark) | No reportado en esa fila | 1,4299 (r=1, q,v, últimas 3 capas) | Apache 2.0 (upstream) | Ampliamente disponible |
| Prompt tuning | PEFT, prompts suaves | No aplica | 9.216 (12 tokens) | 1,3704 | No disponible en la información | Disponible en PEFT |
| LayerNorm tuning | PEFT, normas | No aplica | 38.400 (≈37k) | 1,2530 (≈37k) | No disponible en la información | Disponible en PEFT |
| (IA)³ | PEFT, vectores de escala | No aplica | 55.296 (≈55k) | 1,2894 (≈55k) | No disponible en la información | Disponible en PEFT |

## Limitaciones y advertencias

- Resultados experimentales de una sola semilla; la model card reconoce que diferencias de 0,001–0,002 están dentro del ruido de semilla.
- Solo se validó con GPT-2 124M y un corpus de noticias en bengalí; no hay resultados publicados en modelos mayores ni en otras tareas.
- No soporta bases cuantizadas con bitsandbytes en esta versión, lo que limita el ajuste en hardware con poca VRAM.
- La sonda de gradiente requiere memoria transitoria de aproximadamente 2× los pesos objetivo; en modelos grandes obliga a restringir `target_modules`.
- La regla `ols` incrementa el uso de memoria al retener activaciones por token.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar el repositorio.
- Sesgos y riesgo de alucinación: no documentados; heredados del modelo base.
- Idiomas: no se declaran idiomas soportados; la cobertura depende del modelo base.
- Repositorio con 0 descargas y 0 likes; madurez y soporte de la comunidad no verificables.
- El paquete requiere `torch>=2.1`, `transformers>=4.40`, `safetensors` y `huggingface_hub`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Angshul/PursuitLoRA
- Benchmark TensorPEFT: https://github.com/AngshulMajumdar/TensorPEFT
- Resultados del benchmark: https://github.com/AngshulMajumdar/TensorPEFT/blob/main/benchmarks/results.json
- Ejemplos de reproducción: `examples/prepare_bengali_data.py`, `examples/reproduce_gpt2_bengali.py`, `examples/train_with_trainer.py` (incluidos en el repositorio)
- Tests: `tests/` (pytest con GPT-2, Llama, Qwen2, Mistral, Phi, Gemma)
