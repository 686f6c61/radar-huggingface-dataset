# SlayerLab/Slayer1B-1.03-checkpoints

## Resumen

Slayer1B-1.03-checkpoints es un repositorio de artefactos de entrenamiento, no un modelo listo para inferencia. Contiene los checkpoints completos del entrenador (pesos del modelo **y** estado del optimizador) de la ejecución que da lugar a Slayer1B 1.03, un modelo de lenguaje en polaco desarrollado por SlayerLab. La ejecución continúa el entrenamiento de Slayer1B 1.02 desde su checkpoint final (`ckpt_5720.pt`, paso 5720, learning rate constante 6e-4) y acumula 7150 pasos totales × 1 048 576 tokens por paso, es decir, 7 497 318 400 tokens vistos, de los cuales 1 499 463 680 corresponden a esta etapa.

El interés técnico del repositorio es la trazabilidad: se publican checkpoints cada 150 pasos desde el 5850 hasta el 7150 final, todos en estados de learning rate constante, con sumas SHA-256 registradas fuera del proceso de entrenamiento y verificadas tras la subida. El entrenamiento se realizó con 4 × NVIDIA RTX 4090 de 24 GB en DDP, con un batch global de 256 secuencias de 4096 tokens (micro-batch 2, acumulación de gradiente 32), y utilizó una combinación de optimizadores Muon + AdamW.

Es relevante ahora porque documenta una fase poco habitual en las publicaciones abiertas: la continuación de preentrenamiento sin decaimiento final del learning rate, con el decaimiento diferido al final de toda la línea Slayer1B (un corpus preparado de unos 24 000 millones de tokens). Quien quiera reproducir, auditar o reanudar el entrenamiento tiene aquí el estado exacto, el `config`, el número de paso y el estado de los optimizadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada en la model card; los ficheros del entrenador (`train_gpt_ref_r23.py`, `train_gpt_ref_r24_1.py`) apuntan a un transformer decoder autoregresivo de tipo GPT |
| Parametros totales | No disponible (la model card no lo declara; la nomenclatura «1B» sugiere del orden de 1 000 M) |
| Longitud de contexto | No declarada para inferencia; la configuración de entrenamiento usa secuencias de 4096 tokens (batch global 256 × 4096 tokens = 1 048 576 tokens por paso) |
| Tipos de cuantizacion | No disponible; no se publican pesos cuantizados (sin GGUF, GPTQ, AWQ ni EXL2). Solo checkpoints de entrenador en PyTorch |
| Idiomas soportados | Polaco (etiqueta `polish` y dataset `SlayerLab/slayer-pl-8x3b`); no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `torch.save` con diccionario del entrenador: claves `model`, `opt`, `step`, `config`. No son safetensors ni GGUF |
| Carga | `torch.load(path, map_location="cpu", weights_only=True)`; clase del modelo en `train_gpt_ref_r23.py` (repositorios 1.00–1.02) |
| Optimizadores | Muon + AdamW (estado incluido en cada checkpoint) |
| Volumen del repositorio | 62,0 GB |
| Presupuesto de entrenamiento | 7150 pasos × 1 048 576 tokens = 7 497 318 400 tokens (+1430 pasos / +1 499 463 680 tokens respecto a 1.02) |
| Hardware de entrenamiento | 4 × NVIDIA RTX 4090 (24 GB), DDP; micro-batch 2, acumulación de gradiente 32 |
| Cadencia de checkpoints | Cada 150 pasos desde el 5850, más el paso final 7150 |
| Fecha de inicio del run | 24 de octubre de 2026, 09:20 UTC |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna (número de capas, dimensión oculta, número de cabezas, uso o no de mezcla de expertos). Lo que sí se deduce de los artefactos es que se trata de un transformer decoder autoregresivo: el entrenador referenciado se llama `train_gpt_ref_r23.py` en los repositorios 1.00–1.02 y `train_gpt_ref_r24_1.py` en esta etapa, y la definición del modelo se mantiene sin cambios respecto a las versiones anteriores. La única modificación del entrenador es operativa: libera los tensores del checkpoint de la memoria de la GPU tras reanudar, un requisito impuesto por las tarjetas de 24 GB. El tamaño de secuencia usado en el entrenamiento es de 4096 tokens.

Los datos provienen de la continuación del flujo `pack-03` del dataset `SlayerLab/slayer-pl-8x3b` (revisión `d50df04a`), el mismo que usó 1.02 a partir del paso 5390; esta etapa cubre los pasos 5721–7150. La decisión técnica más destacable es el schedule: learning rate constante de 6e-4 hasta el final, sin decaimiento, porque el decaimiento se difiere al cierre de toda la línea Slayer1B, que seguirá preentrenando sobre un corpus preparado de aproximadamente 24 000 millones de tokens. No se documenta en esta model card el uso de RLHF, DPO u otro tipo de ajuste por preferencias; el estado publicado es el de un preentrenamiento en curso. Las sumas SHA-256 se calculan fuera del proceso de entrenamiento en el momento de escritura de cada checkpoint y se verifican volviendo a descargar los ficheros.

## Capacidades

- Generación de texto en polaco: es la única lengua declarada, tanto por la etiqueta `polish` como por el corpus `slayer-pl-8x3b`.
- Modelo base de preentrenamiento: no hay evidencia de ajuste por instrucciones, por lo que la capacidad esperable es de continuación de texto, no de diálogo alineado.
- Contexto de trabajo de 4096 tokens según la configuración de entrenamiento (no se declara una ventana superior para inferencia).
- Reanudación exacta del entrenamiento: los checkpoints incluyen pesos, estado de Muon y AdamW, número de paso y configuración, lo que permite continuar el run bit a bit.
- Extracción de pesos para fine-tuning: la clave `model` del diccionario puede convertirse a safetensors, aunque el repositorio no incluye script de conversión ni `config.json` en formato HuggingFace.
- Capacidad multilingüe: no documentada; no se declaran idiomas distintos del polaco.
- Tool calling, function calling, modo thinking, visión o audio: no disponibles y no documentados en la información proporcionada.
- Uso como objeto de estudio: checkpoints intermedios (5850–6750) para analizar la evolución de la pérdida y la emergencia de capacidades durante el preentrenamiento.

## Casos de uso

- Reanudación exacta de un preentrenamiento: cargar el checkpoint 7150 con `torch.load(..., weights_only=True)` y arrancar el entrenador recuperando el estado de Muon y AdamW, de modo que la continuación sea idéntica a la del run original sin recalentar el optimizador.
- Investigación sobre schedules de learning rate: al mantener 6e-4 constante y no aplicar decaimiento, los ocho checkpoints (5850, 6000, 6150, 6300, 6450, 6600, 6750 y 7150) permiten medir la pérdida y la estabilidad del modelo en intervalos regulares de 150 pasos y comparar con la fase con decaimiento de la línea 1.00–1.01.
- Estudio comparativo de optimizadores: el estado conjunto de Muon y AdamW en cada fichero permite analizar la evolución de los momentos por tipo de tensor y correlacionarla con la curva de pérdida publicada en el tracker del run.
- Auditoría de reproducibilidad: las sumas SHA-256 registradas fuera del proceso de entrenamiento y verificadas tras la descarga sirven como base para pipelines de verificación de integridad de artefactos de entrenamiento en entornos de investigación.
- Punto de partida para ajuste supervisado en polaco: extraer los pesos del checkpoint 7150 y convertirlos a safetensors para un SFT sobre instrucciones, aprovechando que la licencia Apache-2.0 no impone restricciones de uso comercial.
- Estudio de destilación y de currículo de datos: usar checkpoints intermedios como profesores o como puntos de control para analizar qué subconjuntos del corpus `pack-03` producen mayores cambios en la pérdida.
- Generación de texto en polaco tras la conversión: una vez extraídos los pesos y creado un `config.json` compatible con HuggingFace, el modelo puede servir para redacción asistida, resumen o clasificación de documentos en polaco con hasta 4096 tokens de contexto.
- Docencia y formación técnica: el repositorio es un ejemplo completo y verificable de un run de preentrenamiento multi-GPU con DDP en tarjetas de consumo, con batch global, acumulación de gradiente y política de checkpoints documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite a la ficha del modelo final, `SlayerLab/Slayer1B-1.03`, y a la curva de entrenamiento en `https://track.fabryka.ai/run/7ca4f84f-3b07-4525-8cde-f3a936dc3425`, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones en polaco.

## Requisitos de hardware

- Entrenamiento documentado: 4 × NVIDIA RTX 4090 de 24 GB en DDP, con micro-batch 2 y acumulación de gradiente 32 para alcanzar un batch global de 256 secuencias de 4096 tokens. El entrenador libera los tensores del checkpoint de la VRAM tras reanudar, lo que confirma que el estado completo no cabe holgadamente en 24 GB junto al grafo de entrenamiento.
- Almacenamiento: 62,0 GB de repositorio para ocho checkpoints completos (pesos + estado de optimizador), es decir, del orden de 7–8 GB por fichero. Es un requisito relevante en disco y en ancho de banda de descarga.
- Inferencia: no se publican pesos en formato de inferencia. Para desplegar el modelo hay que extraer la clave `model`, mapear los nombres de parámetros del script `train_gpt_ref_r23.py` y generar un `config.json`. Con un tamaño del orden de 1000 M de parámetros, la estimación razonable es de 2 GB en bf16 y 4 GB en fp32 para los pesos, más la caché KV para 4096 tokens; esa cifra es una estimación, no un dato publicado.
- GPU de consumo: por tamaño, un modelo de ~1B en bf16 cabría en tarjetas de 8 GB o superiores; en la práctica depende de la conversión, que el repositorio no proporciona.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama no pueden cargar directamente el diccionario `torch.save` del entrenador. Requieren una conversión previa a safetensors o GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Slayer1B 1.03 (este repositorio) | No declarado (~1000 M por nomenclatura) | No declarado para inferencia; entrenamiento a 4096 tokens | Apache-2.0 | Checkpoints de entrenador con estado de optimizador; sin pesos listos para inferencia ni cuantizaciones |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | Llama 3.2 Community License | Safetensors y GGUF; ecosistema amplio, requiere cumplir la política de uso |
| Qwen2.5-1.5B | 1,54 B | 32 768 tokens | Apache-2.0 | Safetensors y GGUF; muy integrado en vLLM, llama.cpp y Ollama |
| Bielik-1.5B-v3 (SpeakLeash) | ~1,5 B | No verificado en esta búsqueda | Apache-2.0 | Safetensors y GGUF; modelo específico para polaco, con variantes instruct |

Nota: los datos de los modelos comparativos proceden de sus model cards públicas y no se han verificado contra sus repositorios en esta búsqueda; los parámetros y contextos pueden variar según la revisión. La diferencia principal de Slayer1B 1.03 no es el rendimiento, que no está publicado, sino el formato: se distribuye como artefacto de entrenamiento reproducible, no como modelo de inferencia.

## Limitaciones y advertencias

- Formato no listo para producción: cada fichero es un diccionario de entrenador con pesos y estado de Muon + AdamW. Sin un script de conversión, no se puede cargar en vLLM, TGI, llama.cpp u Ollama.
- Sin decaimiento final del learning rate: los checkpoints son estados de LR constante (6e-4). No representan un modelo «finalizado» y su calidad puede ser inferior a la de un checkpoint tras el decaimiento, previsto para el cierre de la línea.
- Ausencia de alineación: no se documenta RLHF, DPO ni ajuste por instrucciones. Es un modelo base de preentrenamiento, con el riesgo asociado de generar contenido inapropiado o poco útil en formato conversacional.
- Riesgo de alucinación: inherente a un modelo de ~1B de parámetros entrenado sobre un corpus parcial; no hay evaluaciones publicadas que lo cuantifiquen.
- Cobertura lingüística limitada: solo se declara polaco. El rendimiento en castellano u otros idiomas no está documentado y previsiblemente será bajo.
- Fecha del run: la model card sitúa el inicio el 24 de octubre de 2026 y el repositorio se creó el 2026-10-24; conviene verificar la vigencia de los enlaces y de la lista de SHA-256, que el autor indica que se amplía a medida que avanza el run.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero no cubre las condiciones del dataset `SlayerLab/slayer-pl-8x3b` ni de las obras originales del corpus, que deben verificarse por separado antes de un uso comercial.
- Coste de almacenamiento: 62,0 GB de descarga para obtener pesos que, tras extraerlos, ocupan una fracción del total.
- Sin métricas: la ficha no ofrece benchmarks, latencias ni comparaciones, por lo que cualquier decisión de adopción exige evaluación propia.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/SlayerLab/Slayer1B-1.03-checkpoints
- Ficha del modelo con resultados de evaluación (referenciada): https://huggingface.co/SlayerLab/Slayer1B-1.03
- Modelo predecesor 1.02: https://huggingface.co/SlayerLab/Slayer1B-1.02
- Checkpoints de 1.02 (origen de `ckpt_5720.pt`): https://huggingface.co/SlayerLab/Slayer1B-1.02-checkpoints
- Checkpoints de 1.01: https://huggingface.co/SlayerLab/Slayer1B-1.01-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluaciones durante el run: https://track.fabryka.ai/run/7ca4f84f-3b07-4525-8cde-f3a936dc3425
- Organización en HuggingFace: https://huggingface.co/SlayerLab/datasets
- Notas técnicas del equipo (GitHub): https://github.com/slayerlabs/Fabryka-AI-Notes
