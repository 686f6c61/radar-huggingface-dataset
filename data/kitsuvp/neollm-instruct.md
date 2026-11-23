# KitsuVp/NeoLLM-Instruct

## Resumen

NeoLLM-Instruct es un checkpoint experimental de ajuste supervisado (SFT) sobre NeoLLM, un modelo de lenguaje causal de 85,2 millones de parámetros desarrollado por KitsuVp. Se distribuye con licencia Apache 2.0 y está pensado exclusivamente para investigación sobre ajuste de instrucciones, evaluación de entrenamiento y estudio del comportamiento denominado "Copy-Paste". No es un modelo orientado a producción: el propio autor advierte que a menudo ignora restricciones exactas de salida y puede responder de forma incorrecta a instrucciones sencillas.

La arquitectura es un transformer causal de 12 capas que combina ocho capas CKDA (una variante de atención lineal) con cuatro capas de atención completa, e incorpora componentes propietarios como una cabeza Copy-Paste, un generador de tokens Leviathan y los mecanismos MiLe, μ-loss, NITP, TWEO y MEAP durante el entrenamiento. El vocabulario del tokenizador tiene 64.402 entradas y los ejemplos de entrenamiento se limitan a 512 tokens, lo que acota severamente la ventana de contexto efectiva.

Su relevancia actual es acotada y de naturaleza metodológica: documenta con detalle inusual la procedencia de pesos (hashes SHA-256), el flujo de trabajo SFT y las métricas de validación, lo que lo convierte en un caso de estudio reproducible sobre ajuste fino bilingüe inglés-español en modelos de escala muy reducida. No compite con modelos instructivos de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con 12 capas: 8 capas CKDA (atención lineal) y 4 capas de atención completa; cabeza Copy-Paste y generador de tokens Leviathan |
| Parametros totales | 85.156.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de los ejemplos de entrenamiento; no se documenta contexto nativo superior) |
| Tipos de cuantizacion | No disponible (solo se documenta BF16 para inferencia y FP32 para pesos maestros en entrenamiento) |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y código de modelado NeoLLM personalizado) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint preentrenado KitsuVp/NeoLLM (revisión `b45fe836f22503ff06afa672727551d3a2824655`, SHA-256 de pesos `524338e2...a3561`). La arquitectura consta de 12 capas, de las cuales ocho son capas CKDA —una implementación de atención lineal con kernel FLA firmado cuando está disponible— y cuatro son capas de atención completa. Sobre esta base se añaden una cabeza Copy-Paste y un generador de tokens Leviathan. El tokenizador cuenta con 64.402 entradas y los ejemplos de entrenamiento usan un máximo de 512 tokens.

El entrenamiento se organizó en tres etapas. La primera fue una ejecución bilingüe de 5.500 pasos en Google Antigravity con un manifiesto de 93.892 ejemplos y recuentos de tokens de asistente aproximadamente equilibrados por idioma. La segunda ejecutó 800 pasos sin ruido de embeddings sobre un pool preparado de 35.800 ejemplos con prompts de habilidades reales y sintéticos. La etapa liberada añade 200 pasos desde ese checkpoint con actualización completa de parámetros, autocast BF16, pesos maestros en FP32, AdamW fusionado, learning rate máximo de 5e-6, microbatch de 4 y 2 pasos de acumulación. Los conjuntos de datos citados son HuggingFaceTB/smol-smoltalk, OysterCoreAI/SFT-General-Spanish-50K, BSC-LT/ALIA-2606-SFT y ejemplos en español de CohereLabs/aya_dataset.

En la etapa liberada estuvieron activos Copy-Paste, MiLe, μ-loss, NITP, TWEO y MEAP. Se restauraron tres tensores de proyector NITP ausentes desde el checkpoint preentrenado. La vista SFT limpia tuvo peso 0,75 y la vista independiente MEAP peso 0,25, con corrupción restringida a tokens de asistente elegibles a una tasa objetivo del 10%. Copy-Paste excluye cabeceras de chat y tokens estructurales como fuentes de copia, manteniendo la copia de contenido ordinario.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y español, con plantilla de chat propia.
- Seguimiento de instrucciones básicas, con fiabilidad limitada: el autor documenta incumplimiento frecuente de restricciones exactas de formato y salida.
- Respuesta a preguntas simples y tareas de conocimiento acotadas por los datos de SFT.
- Comportamiento Copy-Paste entrenado explícitamente, con exclusión de cabeceras y tokens estructurales como fuentes de copia.
- Diagnóstico de inferencia mediante el ajuste "no-copy" (ablación sin copia) para comparar comportamiento.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidades multilingües limitadas a inglés y español; no se documentan otros idiomas.

## Casos de uso

- Investigación sobre ajuste de instrucciones a pequeña escala: replicar el pipeline SFT documentado (contrato de tokenización, máscara de tokens de respuesta, vistas limpia y MEAP) para estudiar cómo afectan las decisiones de enmascarado a la perplejidad por idioma.
- Estudio del comportamiento Copy-Paste: analizar qué tipos de contenido copia el modelo y cómo las exclusiones de cabeceras de chat modifican la salida, usando la ablación no-copy como control.
- Evaluación de atención lineal híbrida: comparar el rendimiento de las capas CKDA frente a las capas de atención completa en tareas de generación corta con contexto de hasta 512 tokens.
- Docencia y experimentación con modelos de 85M parámetros: ejecutar el modelo en una GPU de consumo para ilustrar conceptos de tokenización, plantillas de chat y pérdida en tokens de asistente sin coste de infraestructura.
- Reproducibilidad de checkpoints: validar la cadena de procedencia mediante los hashes SHA-256 publicados (pesos preentrenados, predecesor SFT y pesos liberados) en pipelines de verificación de artefactos.
- Pruebas de conformidad de formato: usar la sonda de 20 prompts con decodificación greedy descrita por el autor para medir la tasa de terminación en EOS y el cumplimiento de respuestas exactas antes de plantear cualquier uso supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas internas de validación:

| Metrica | Antes (200 pasos finales) | Despues (200 pasos finales) |
|---|---|---|
| CE en tokens de asistente, inglés (32 conversaciones) | 2,3699 | 2,3686 |
| CE en tokens de asistente, español (32 conversaciones) | 3,0963 | 3,1020 |
| Sonda de respuesta exacta, 20 prompts, greedy: respuestas terminadas en EOS | No disponible | 18 de 20 |
| Sonda de respuesta exacta, 20 prompts, greedy: coincidencias exactas | No disponible | 0 de 20 |
| Ablación no-copy: respuestas terminadas en EOS | No disponible | 14 de 20 |
| Ablación no-copy: coincidencias exactas | No disponible | 0 de 20 |

El autor advierte que esta prueba mide cumplimiento de salidas restringidas y no establece calidad instructiva de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (85,2M parámetros ≈ 0,17 GB de pesos más caché de activaciones y contexto de 512 tokens); el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con soporte BF16; el autor validó el modelo en una RTX 5070 Ti bajo WSL con PyTorch 2.14.0+cu132 y Transformers 5.19.0.
- Cabe holgadamente en GPU de consumo, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `use_safetensors=True`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el código de modelado personalizado (CKDA, Copy-Paste, Leviathan) hace improbable el soporte directo en esos motores sin portar el código.
- Latencia y throughput: no disponibles. El ejemplo del autor usa `use_cache=False`, lo que penaliza la latencia en generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NeoLLM-Instruct | 85,2M | 512 tokens | en, es | Apache 2.0 | Requiere código custom; orientado a investigación; sin benchmarks públicos |
| SmolLM-135M-Instruct (HuggingFaceTB) | 135M | 2.048 tokens | en (principalmente) | Apache 2.0 | Mayor contexto y soporte estándar en transformers; usado como fuente de datos de este SFT |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | multilingüe | Apache 2.0 | Escala superior, contexto amplio y tool calling documentado |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | en (principalmente) | Apache 2.0 | Mayor capacidad, sin soporte nativo de español específico |

La comparación es asimétrica: NeoLLM-Instruct es dos a trece veces menor que las alternativas y carece de benchmarks publicados, por lo que la elección entre ellos debe basarse en el objetivo de investigación y no en rendimiento medido.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor indica que a menudo ignora restricciones exactas de salida y puede dar respuestas incorrectas a instrucciones simples.
- En la sonda de respuesta exacta con greedy, 0 de 20 respuestas coincidieron exactamente; algunas incluían identificadores correctos pero añadían texto extra.
- La perplejidad en español (CE 3,1020) empeoró ligeramente durante los últimos 200 pasos, mientras la inglesa apenas mejoró (2,3699 → 2,3686).
- Ventana de contexto efectiva de 512 tokens, insuficiente para conversaciones largas, documentos o razonamiento multi-paso.
- Cobertura de tareas limitada y respuestas sintéticas en el pool de entrenamiento, lo que sesga las conclusiones sobre calidad instructiva.
- Riesgo elevado de alucinación y de copia literal de contenido del prompt; el comportamiento Copy-Paste está entrenado de forma deliberada y solo se excluyen cabeceras y tokens estructurales.
- Requiere `trust_remote_code=True` y código de modelado NeoLLM personalizado, con dependencia de la implementación CKDA FLA cuando está disponible; esto introduce riesgo de seguridad y de compatibilidad en producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y las advertencias del autor desaconsejan cualquier despliegue en producción.
- No se documentan evaluaciones de sesgo; el entrenamiento bilingüe con datasets públicos mixtos implica sesgos no medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KitsuVp/NeoLLM-Instruct
- Modelo base preentrenado: https://huggingface.co/KitsuVp/NeoLLM/tree/b45fe836f22503ff06afa672727551d3a2824655
- Variante DPO: https://huggingface.co/KitsuVp/NeoLLM-Instruct-DPO
- Cambios en el código del modelo (discusión): https://huggingface.co/KitsuVp/NeoLLM/discussions/3
- Dataset HuggingFaceTB/smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset OysterCoreAI/SFT-General-Spanish-50K: https://huggingface.co/datasets/OysterCoreAI/SFT-General-Spanish-50K
- Dataset BSC-LT/ALIA-2606-SFT: https://huggingface.co/datasets/BSC-LT/ALIA-2606-SFT
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
