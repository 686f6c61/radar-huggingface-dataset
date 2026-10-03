# leandronunes/Qwen3.8-4B-UniCo-QLoRA-ckpt200

## Resumen

El modelo `leandronunes/Qwen3.8-4B-UniCo-QLoRA-ckpt200` es un adaptador LoRA entrenado mediante QLoRA (cuantizacion 4-bit NF4) sobre el modelo base `empero-ai/Qwen3.8-4B-Distill`. Lo desarrolla el usuario de HuggingFace leandronunes y su objetivo es la adaptacion en razonamiento cientifico y causal, usando una version balanceada del dataset UniCo con 2400 ejemplos de entrenamiento. No se trata de un modelo completo, sino de un checkpoint intermedio (paso 200 de 300 planificados) pensado para ser cargado como adaptador PEFT sobre el modelo base.

El modelo base declarado tiene aproximadamente 4000 millones de parametros y una arquitectura hibrida que combina atencion tradicional con bloques de atencion lineal Gated DeltaNet. Durante el entrenamiento, Unsloth detecto que la arquitectura no puede entrenarse de forma estable en float16, por lo que el regimen se cambio a float32. El adaptador final tiene un rank LoRA de 16 y alpha de 32, aplicado sobre las proyecciones de self-attention y las MLPs.

La relevancia de esta ficha radica en que se trata de un checkpoint intermedio con muy pocas descargas y sin benchmarks publicados, por lo que cualquier uso en produccion exigiria validacion previa. El contexto maximo durante el entrenamiento fue de 10240 tokens, lo que condiciona el tipo de tareas para las que resulta adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal Gated DeltaNet (modelo base `empero-ai/Qwen3.8-4B-Distill`) |
| Parametros totales | ~4B en el modelo base; adaptador LoRA de 0,1 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10240 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |
| Metodo de adaptacion | LoRA sobre PEFT (r=16, alpha=32, dropout=0) |
| Framework de entrenamiento | Unsloth + TRL (SFTTrainer) |
| Dataset | UniCo (2400 ejemplos) |
| Checkpoint | paso 200 de 300 planificados |
| Hardware de entrenamiento | Google Colab Tesla T4 (14,5 GB VRAM) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida de transformer con bloques de atencion lineal Gated DeltaNet, lo que segun la model card impide el entrenamiento en float16 y obliga a usar float32. El adaptador LoRA se aplica sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, aunque Unsloth filtra los modulos compatibles con la arquitectura hibrida, de modo que los adaptadores acabaron en las partes soportadas (self-attention y MLPs). Se uso `use_gradient_checkpointing="unsloth"` con smart gradient offloading y double buffering, y no se activo packing porque Unsloth lo ignora en esta arquitectura de atencion lineal. Tampoco se activo el kernel Liger por falta de ganancia consistente. El entrenamiento utilizo 2400 ejemplos del dataset UniCo, batch efectivo 8 (batch 1 x gradient accumulation 8), learning rate 1e-4 con scheduler cosine y 15 warmup steps, optimizador adamw_8bit, weight decay 0.0, gradient clipping 1.0 y semilla 42. La longitud maxima fue de 10240 tokens. No se menciona uso de RLHF ni DPO; el procedimiento es un ajuste supervisado (SFT) con QLoRA. El checkpoint publicado corresponde al paso 200, aproximadamente dos tercios del entrenamiento planificado de 300 pasos, lo que segun el autor equivale a alrededor de un tercio del epoch completo.

## Capacidades

- Generacion de texto conversacional y finalizacion de texto (pipeline `text-generation`).
- Razonamiento cientifico y causal: es el objetivo explicito del ajuste con el dataset UniCo.
- Aplicacion a dominios de biologia, con etiqueta especifica sobre el pez cebra (zebrafish).
- Soporte multilingue limitado al ingles (`language: en`).
- Capacidad de mantener contextos largos de hasta 10240 tokens durante el entrenamiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso explicito.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Analisis de cadenas causales en textos cientificos: el ajuste sobre UniCo busca que el modelo identifique relaciones de causa-efecto en pasajes largos, aprovechando la ventana de 10240 tokens para no truncar el contexto.
- Asistencia en revision bibliografica de biologia: el modelo puede resumir y relacionar hallazgos experimentales en ingles, aunque sin garantias de precision factual por falta de benchmarks.
- Generacion de explicaciones paso a paso en dominios experimentales: util para prototipos internos de apoyo a investigadores que necesitan reformular hipotesis en lenguaje natural.
- Soporte en investigacion sobre zebrafish: dado el etiquetado explicito del modelo, puede emplearse como extractor o generador de anotaciones en ese subdominio concreto.
- Base para fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para experimentos posteriores sobre el mismo modelo base sin reentrenar desde cero.
- Evaluacion comparativa de tecnicas QLoRA: por su configuracion documentada (r=16, alpha=32, Unsloth, T4), resulta util como referencia reproducible en experimentos academicos.
- Experimentacion en docencia sobre entrenamiento eficiente: el repositorio detalla hiperparametros y decisiones de diseno, lo que facilita su uso como material didactico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB en disco, pero requiere cargar el modelo base de 4B para inferencia.
- VRAM estimada para el modelo base: aproximadamente 9-10 GB en FP16, 4-5 GB en cuantizacion 4-bit y 2,5-3 GB en cuantizacion 3-bit.
- GPU recomendadas para FP16: NVIDIA A100, H100 o RTX 3090/4090.
- En GPUs de consumo: cabe en RTX 3090, RTX 4090 y, con cuantizacion 4-bit, puede ajustarse en tarjetas con 8 GB de VRAM.
- El entrenamiento del adaptador se realizo en una Tesla T4 de 14,5 GB, con batch 1 y gradient accumulation 8 para secuencias de 10240 tokens.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con las librerias `peft` y `transformers`; no se documenta compatibilidad verificada con vLLM, llama.cpp, Ollama ni TGI.
- No se dispone de datos de latencia ni throughput medidos en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos con otros adaptadores o modelos de la misma categoria, y el modelo base `empero-ai/Qwen3.8-4B-Distill` no cuenta con datos de rendimiento publicados en esta ficha.

## Limitaciones y advertencias

- Se trata de un checkpoint intermedio (paso 200 de 300); el autor advierte explicitamente de que no representa el final del entrenamiento previsto.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de su comportamiento.
- No se han publicado benchmarks, lo que impide cuantificar la mejora real sobre el modelo base.
- Riesgo elevado de alucinacion: el ajuste es de tipo SFT sobre un dataset pequeno (2400 ejemplos) y no se menciona RLHF ni DPO para mitigar respuestas inventadas.
- El dataset UniCo podria introducir sesgos propios de su composicion, no documentados en la informacion disponible.
- Idioma limitado al ingles; el uso en castellano u otras lenguas no esta respaldado por el entrenamiento.
- Aunque la licencia es apache-2.0 y permite uso comercial del adaptador, conviene verificar la licencia del modelo base `empero-ai/Qwen3.8-4B-Distill` antes de desplegarlo en produccion.
- La longitud de contexto de 10240 tokens refleja la ventana usada en entrenamiento; no se confirma que el modelo base rinda de forma equivalente en secuencias mas largas.
- El tamano del repositorio (0,1 GB) indica que solo contiene el adaptador, por lo que desplegarlo exige descargar tambien el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leandronunes/Qwen3.8-4B-UniCo-QLoRA-ckpt200
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL (SFTTrainer): https://github.com/huggingface/trl
- PEFT (libreria del adaptador): https://github.com/huggingface/peft
