# hisplan/camp-llama31-01-ko-alpaca

## Resumen

`hisplan/camp-llama31-01-ko-alpaca` es un adaptador LoRA (QLoRA SFT) construido sobre `unsloth/Meta-Llama-3.1-8B`, cuyo pesos son idénticos a los de Meta Llama 3.1 8B. Lo publica el usuario hisplan como primer paso ("단계 01", etapa 01) de un campamento de formación en modelos de lenguaje (tag `mini-llm-camp`). El objetivo declarado es obtener un modelo de partida que responda en coreano a preguntas en coreano, ajustando el modelo base con 800 ejemplos de instrucciones en coreano del dataset `nlpai-lab/kullm-v2`.

Se trata, por tanto, de un artefacto educativo y experimental, no de un modelo orientado a producción. El repositorio ocupa 0,1 GB, lo que confirma que contiene únicamente los pesos del adaptador y no una copia completa de los 8B parámetros del modelo base. La licencia aplicable es la Llama 3.1 Community License, heredada del modelo original de Meta.

La relevancia es limitada fuera del contexto del campamento: sirve como ejemplo reproducible de un pipeline QLoRA con Unsloth sobre Llama 3.1 8B, con una configuración de entrenamiento muy corta (50 pasos) y un formato de prompt Alpaca estricto. No se han publicado resultados de benchmarks ni métricas de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptador LoRA |
| Parametros totales | 8B (modelo base); el adaptador LoRA no se especifica en número de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento (MAX_LENGTH); el modelo base Llama 3.1 soporta hasta 128K, aunque no se confirma en esta ficha |
| Tipos de cuantizacion | no disponible (el entrenamiento usó QLoRA, lo que implica cuantización 4-bit del base, pero no se detalla el esquema de pesos publicados) |
| Idiomas soportados | coreano (ko) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA, según tags del repo) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Llama 3.1 8B, un transformer decoder-only con atención causal estándar. El entrenamiento se realizó con QLoRA (cuantización 4-bit del base más adaptadores de bajo rango) mediante SFT supervisado. La configuración publicada es: rango LoRA 16, alpha 16, learning rate 1e-4, batch size 2 con acumulación de gradiente 8 (batch efectivo 16), 50 pasos de warmup y 50 pasos máximos, longitud máxima 2048, semilla de datos 316 y semilla 42. El dataset es `nlpai-lab/kullm-v2`, del que se usan 800 ejemplos de instrucciones en coreano.

El formato de prompt es Alpaca estricto y el autor advierte de que debe coincidir carácter a carácter con el usado en entrenamiento, incluyendo cuatro espacios al final del preámbulo antes de `\n\n### Instruction:\n`. No se documentan técnicas adicionales como RLHF, DPO, decodificación especulativa ni atención lineal. El número total de tokens vistos es reducido (50 pasos × batch efectivo 16 × 2048 tokens como máximo), lo que sitúa el ajuste en la categoría de experimento de bajo coste más que de entrenamiento sustantivo.

## Capacidades

- Generación de texto en coreano: responde a instrucciones en coreano con respuestas en coreano, según el objetivo declarado del autor.
- Instrucciones formato Alpaca: el modelo espera el preámbulo y las secciones `### Instruction:` y `### Response:` exactas; fuera de ese formato el comportamiento no está garantizado.
- Razonamiento y conocimiento general: heredados del base Llama 3.1 8B, aunque el ajuste es muy corto y puede degradar parte de las capacidades originales.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: el autor declara solo coreano; el base soporta más idiomas, pero este adaptador no lo garantiza.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Práctica educativa de QLoRA: reproducir el pipeline completo (carga del base, tokenización Alpaca, entrenamiento con Unsloth, guardado del adaptador) para aprender el flujo de ajuste fino con bajo presupuesto de cómputo.
- Generación de respuestas en coreano para prototipos: usar el adaptador como punto de partida en demos internas de asistentes conversacionales en coreano, aceptando que la calidad es la de un ajuste de 50 pasos.
- Evaluación de formatos de prompt: comparar el comportamiento del modelo con el formato Alpaca exacto frente a variantes, para estudiar la sensibilidad al formato en modelos ajustados con SFT.
- Base para iteraciones posteriores del campamento: servir como checkpoint de referencia ("etapa 01") sobre el que entrenar etapas siguientes y medir la mejora.
- Estudio de olvido catastrófico: analizar cómo un SFT corto sobre 800 ejemplos afecta a las capacidades del base Llama 3.1 8B en tareas fuera del dominio coreano.
- Experimentos de cuantización e inferencia: cargar el adaptador sobre el base en 4-bit u 8-bit con `transformers`, `vLLM` o `llama.cpp` (previa conversión a GGUF) para medir latencia y consumo de VRAM en entornos de laboratorio.
- Docencia sobre licencias: ilustrar cómo un modelo derivado hereda la Llama 3.1 Community License y qué obligaciones implica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador se aplica sobre Llama 3.1 8B. En FP16 se requieren aproximadamente 16 GB de VRAM; en 8-bit unos 8-9 GB; en 4-bit unos 5-6 GB. Estas cifras son estimaciones estándar para un modelo de 8B y no se han verificado en la información proporcionada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 o 8-bit; RTX 3090/4080 (16-24 GB) para 8-bit o 4-bit.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en FP16; en RTX 4060 Ti 16 GB o RTX 3060 12 GB con cuantización 4-bit u 8-bit.
- Opciones de despliegue: `transformers` (carga del adaptador con PEFT), `vLLM` (soporte de LoRA), `llama.cpp`/`Ollama` previa fusión del adaptador y conversión a GGUF, y `TGI` si se fusiona el adaptador en un checkpoint completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hisplan/camp-llama31-01-ko-alpaca | 8B + LoRA | 2048 en entrenamiento | Llama 3.1 Community | Hugging Face, 0 descargas | Adaptador educativo, SFT de 50 pasos |
| unsloth/Meta-Llama-3.1-8B | 8B | Hasta 128K (base) | Llama 3.1 Community | Hugging Face | Base sin ajuste, pesos idénticos a Meta Llama 3.1 8B |
| Meta-Llama-3.1-8B-Instruct | 8B | Hasta 128K | Llama 3.1 Community | Hugging Face, ampliamente usado | Ajuste oficial con RLHF, multilingüe |
| nlpai-lab/kullm-v2 (dataset) | no aplica | no aplica | no disponible | Hugging Face | Corpus de instrucciones en coreano usado para el SFT |

La comparación con `Meta-Llama-3.1-8B-Instruct` es la más relevante: el modelo de este repositorio parte del base sin instrucciones y recibe un ajuste mínimo, por lo que en la práctica cabe esperar un rendimiento muy inferior al Instruct oficial en tareas de instrucción, salvo en el formato Alpaca concreto para el que fue entrenado.

## Limitaciones y advertencias

- Modelo educativo y experimental: el propio autor indica que no debe usarse como fuente de información factual.
- Riesgo alto de alucinación: el autor advierte de que puede inventar cifras, fechas y resultados de investigación con un tono plausible.
- Entrenamiento muy corto: 50 pasos y 800 ejemplos son insuficientes para un ajuste robusto; es probable el olvido catastrófico de capacidades del base.
- Sensibilidad extrema al formato de prompt: el preámbulo Alpaca debe coincidir carácter a carácter, incluidos cuatro espacios finales; pequeñas variaciones pueden degradar la salida.
- Cobertura lingüística limitada: declarado solo para coreano; el comportamiento en castellano u otros idiomas no está garantizado.
- Licencia Llama 3.1 Community: uso comercial permitido con condiciones (atribución "Built with Llama", límite de 700 millones de usuarios mensuales para ciertos usos, restricciones de uso aceptable); revisar el archivo `LICENSE` del repositorio.
- Sin métricas de evaluación publicadas: no hay benchmarks que permitan estimar la calidad real frente al base o frente a Instruct.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-19): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/hisplan/camp-llama31-01-ko-alpaca
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/nlpai-lab/kullm-v2
- Meta Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Unsloth: https://github.com/unslothai/unsloth
