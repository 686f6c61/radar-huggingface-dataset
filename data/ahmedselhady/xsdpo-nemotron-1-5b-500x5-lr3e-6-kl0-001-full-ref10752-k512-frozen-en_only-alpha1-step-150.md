# ahmedselhady/XSDPO-Nemotron-1.5B-500x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1-step-150

## Resumen

XSDPO-Nemotron-1.5B es un checkpoint intermedio de pesos (step 150) resultante de un entrenamiento con SDPO (una variante de optimización por preferencias derivada de DPO) sobre el modelo base `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`. Lo publica el usuario `ahmedselhady` en Hugging Face como artefacto de investigación, no como un modelo listo para producción: el nombre codifica la configuración exacta del experimento (500 prompts por 5 muestras, learning rate 3e-6, coeficiente KL 0.001, entrenamiento full-parameter, referencia de 10752 tokens, k=512, referencia congelada, solo inglés, alpha 1).

El modelo subyacente es de la familia Qwen2 (tag `qwen2` en el repo), con 1.777.088.000 parámetros reales según los pesos en safetensors, orientado a generación de texto conversacional y razonamiento. Su interés es acotado: sirve para reproducir o inspeccionar una etapa concreta de un pipeline de alineamiento por preferencias sobre un modelo de razonamiento pequeño, no como un asistente general.

No hay model card descriptiva más allá de una línea que identifica el run de entrenamiento, ni datos de benchmarks, licencia o idiomas declarados. Cualquier evaluación de calidad debe hacerse por cuenta propia comparándolo con su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2`) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el nombre del run menciona `ref10752`, que sugiere secuencias de referencia de 10.752 tokens, pero no se confirma como contexto maximo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | solo ingles segun el nombre del run (`en_only`); no hay declaracion formal en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 1,78 B de parametros, heredado de `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`, un modelo de NVIDIA orientado a razonamiento. El checkpoint publicado corresponde al paso 150 de un entrenamiento con SDPO sobre el dataset `macereason-math-500x5`, es decir, 500 problemas de matematicas con 5 muestras cada uno.

Los hiperparametros codificados en el nombre indican: learning rate 3e-6, coeficiente KL 0.001 frente a una referencia congelada (`frozen`) de 10.752 tokens, `k=512`, `alpha=1`, entrenamiento de todos los parametros (`full`) y datos exclusivamente en ingles (`en_only`). Se trata de un ajuste fino por preferencias sobre respuestas de razonamiento matematico, no de un preentrenamiento ni de un SFT desde cero; el volumen de datos es muy reducido (2.500 muestras efectivas), lo que sugiere un experimento de ablacion o de investigacion mas que un modelo final.

No se documentan innovaciones de arquitectura propias: la atencion, tokenizador y capas son las del modelo base. La unica particularidad es el procedimiento de alineamiento SDPO aplicado sobre el checkpoint de NVIDIA.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.
- Razonamiento matematico de varios pasos, reforzado por el entrenamiento sobre `macereason-math-500x5`.
- Generacion de cadenas de razonamiento (el modelo base es de tipo "reasoning"), aunque el checkpoint intermedio puede degradar esta capacidad respecto al original.
- Soporte de tool calling / function calling: no disponible de forma verificada en este checkpoint.
- Capacidades de agente multi-paso: no verificadas; el entrenamiento se limita a matematicas.
- Multilingue: no; el run esta marcado como `en_only`.
- Vision o audio: no disponibles.
- Modo "thinking" explicito: no documentado en este checkpoint.

## Casos de uso

- Investigacion en alineamiento por preferencias: reproducir el efecto de SDPO con distintos coeficientes KL y learning rates sobre un modelo de razonamiento pequeno, comparando checkpoints intermedios como este step 150 frente al modelo base.
- Ablaciones de datos: medir como 2.500 muestras de matematicas afectan a la precision en GSM8K o MATH sin reentrenar desde cero, usando este checkpoint como punto de partida.
- Destilacion y evaluacion de checkpoints intermedios: analizar la evolucion de la perplexity y de la tasa de respuestas correctas a lo largo del entrenamiento para decidir donde parar.
- Generacion de soluciones matematicas paso a paso en ingles: util en entornos de investigacion donde se necesita un modelo pequeno que produzca cadenas de razonamiento y quepa en una sola GPU.
- Base para experimentos de merging de pesos: combinar este checkpoint con el modelo original para estudiar el efecto de la interpolacion sobre capacidades de razonamiento.
- Prototipado de pipelines de RLHF/DPO en local: al ser un modelo de 1,78 B, permite iterar rapidamente en una RTX 4090 o incluso en una GPU de 16 GB con cuantizacion, sin depender de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 5-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1,2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas en FP16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4, A10); A100/H100 no son necesarias salvo para entrenamiento o lotes grandes.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y superiores, incluso en FP16.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM y TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp u Ollama si se generan cuantizaciones GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles; no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,78 B | no disponible | no disponible | Checkpoint intermedio de investigacion, solo ingles |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5-1,8 B | no disponible | no disponible en esta ficha | Modelo base de NVIDIA; referencia directa para comparar el efecto del entrenamiento SDPO |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun la familia Qwen2.5) | Apache 2.0 | Alternativa generalista multilingue con licencia permisiva y contexto largo |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768-131.072 tokens (segun configuracion) | MIT | Modelo de razonamiento pequeno ampliamente usado como referencia en matematicas |

La comparacion con Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-1.5B es orientativa: no hay benchmarks publicados de este checkpoint que permitan afirmar superioridad o inferioridad en tareas concretas.

## Limitaciones y advertencias

- Es un checkpoint intermedio (step 150), no un modelo final entrenado hasta convergencia; su calidad puede ser inferior a la del modelo base en tareas generales.
- Entrenado exclusivamente con datos de matematicas en ingles; el rendimiento en otros dominios o idiomas no esta garantizado y probablemente se degrade.
- Riesgo de alucinacion y de cadenas de razonamiento incoherentes, especialmente si el ajuste por preferencias ha reducido la diversidad de las respuestas.
- No hay licencia declarada, lo que impide asumir derechos de uso comercial; hay que consultar la licencia del modelo base de NVIDIA antes de cualquier despliegue.
- Sin model card detallada, sin evaluaciones y sin informacion sobre sesgos; no es apto para produccion sin una evaluacion propia.
- El nombre del repositorio refleja hiperparametros de un run concreto; no debe interpretarse como una version estable ni como una familia de modelos.
- El tag `base_model:finetune` indica que los pesos son un ajuste del modelo de NVIDIA, por lo que hereda sus sesgos y limitaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-500x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1-step-150
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
