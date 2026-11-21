# rexarrior/MiniMind2-English-Analytical-Repair-GGUF

## Resumen

MiniMind2-English-Analytical-Repair-GGUF es una colección de tres checkpoints GGUF (R3, R4 y R5-pilot) publicados por el usuario Rexarrior como resultado de un experimento de edición analítica de pesos sobre MiniMind2, un modelo de lenguaje de aproximadamente 104 millones de parámetros desarrollado originalmente por Jingyao Gong. No se trata de un modelo nuevo entrenado desde cero, sino de una intervención quirúrgica sobre los pesos del checkpoint Q4 de MiniMind2 con el objetivo de mejorar la generación en inglés, reducir la repetición y aumentar la fidelidad en tareas de copia exacta.

El problema que aborda es la baja calidad de generación en inglés del modelo base: según la model card, el Q4 original alineado con el tokenizer obtiene 0 aciertos sobre 96 en la prueba de inglés estricto y 0 sobre 72 en copia exacta. Las ediciones se realizaron sin optimizador de gradiente, mediante ajustes analíticos sobre tensores concretos (principalmente la proyección de salida del MLP final, `blk.15.ffn_down.weight`, y escalas de entrada de atención en ocho bloques), guiados por estadísticas de corpus de TinyStories, preferencias léxicas de un encoder congelado y predicciones de un teacher congelado.

La relevancia es fundamentalmente metodológica: demuestra que es posible modificar el comportamiento de un modelo pequeño mediante edición de pesos dirigida sin reentrenamiento, con resultados medibles en perplejidad y benchmarks, aunque con limitaciones claras en razonamiento causal y fluidez libre. El modelo es de uso conversacional, solo en inglés y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (MiniMind2, familia derivada de diseño tipo Qwen2/Llama); edición sobre `blk.15.ffn_down.weight` y escalas de atención en 8 bloques |
| Parametros totales | 104.030.976 (aprox. 104 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4 (GGUF); los tres checkpoints son de 63.656.672 bytes cada uno |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es MiniMind2, un transformer denso de unos 104 millones de parámetros. Los checkpoints publicados no son el resultado de un entrenamiento nuevo, sino de una edición analítica de pesos sobre el archivo `Q4-MiniMind2.gguf` de Jingyao Gong. El punto de partida se modificó primero para alinear el pretokenizer de `qwen2` a `gpt-2` cambiando un valor de cinco bytes, preservando el payload de tensores; ese archivo corregido es la línea base de la tabla de resultados.

Las tres variantes aplican intervenciones distintas sin optimizador de gradiente. R3 parte de ediciones léxicas, de normalización y de terminación de respuesta previas, y modifica la proyección de salida del MLP final (`blk.15.ffn_down.weight`) con restricciones de margen de logit sobre activaciones congeladas, orientadas a bucles, extracción de palabras y copia exacta. R4 utiliza estadísticas de corpus de 400 historias de entrenamiento de TinyStories y preferencias léxicas de un encoder de frases congelado (`sentence-transformers/paraphrase-MiniLM-L3-v2`), ajustando el MLP final con protección de trayectorias de respuesta seleccionadas. R5-pilot parte de R4 y combina frecuencias de secuencias cortas y predicciones de siguiente token de un teacher congelado (`roneneldan/TinyStories-33M`) con tokenizers distintos, añade una calibración de conectores causales, cambia las escalas de entrada de atención en ocho bloques e impone restricciones de margen para respuestas protegidas; nueve tensores difieren de R4. La inferencia usa un único GGUF y no depende del teacher en tiempo de ejecución.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat embebida.
- Reducción de repetición y bucles en la salida (mejora medida frente al Q4 original en los detectores de repetición del estudio).
- Copia exacta de cadenas cortas: R5-pilot acierta 52 de 72 frente a 0 del Q4 original.
- Cumplimiento de instrucciones sencillas en inglés estricto: 12 de 96 en R5-pilot frente a 0 del Q4 original.
- Predicción de siguiente token en dominio de historias infantiles (TinyStories), con perplejidad de validación de 11,981 en R5-pilot.
- Razonamiento causal limitado: 251 de 500 en COPA test para R5-pilot, prácticamente igual que la línea base.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.

## Casos de uso

- Investigación en edición de pesos: los tres checkpoints sirven como material reproducible para estudiar cómo intervenciones analíticas sobre tensores concretos afectan a perplejidad, repetición y fidelidad, comparando R3, R4 y R5-pilot con la línea base alineada.
- Evaluación de pipelines de tokenizer: el caso del cambio de pretokenizer de `qwen2` a `gpt-2` es un ejemplo práctico para auditar cómo la alineación del tokenizer altera las métricas de un modelo GGUF sin tocar los tensores.
- Generación de historias cortas en inglés: con perplejidad de 11,981 en TinyStories, R5-pilot es adecuado para prototipos de narración breve en inglés dentro de ese dominio, no para texto libre general.
- Pruebas de robustez frente a repetición: útil para validar detectores de repetición léxica y semántica en entornos de investigación, dado que la model card documenta explícitamente las limitaciones de sus propios detectores.
- Docencia y demostraciones de llama.cpp: al ser un GGUF de 63 MB, se puede ejecutar en cualquier máquina con llama.cpp para ilustrar inferencia local, plantillas de chat y decodificación greedy con `--temp 0`.
- Validación de técnicas de destilación con teacher congelado: R5-pilot usa predicciones de TinyStories-33M con tokenizers distintos, lo que lo convierte en un caso de estudio para evaluar calibración entre tokenizers.
- Baseline para experimentos de alineación en modelos pequeños: sirve como punto de comparación controlado antes de aplicar DPO, RLHF u otras técnicas sobre MiniMind2.

## Benchmarks y rendimiento

Datos publicados en la model card. Las precisiones son recuentos de respuestas correctas; la perplejidad de TinyStories es menor cuanto mejor.

| Checkpoint | TinyStories PPL (21.990 historias) | BLiMP (/67.000) | COPA test (/500) | Inglés estricto (/96) | Copia exacta (/72) |
|---|---:|---:|---:|---:|---:|
| Upstream Q4, tokenizer alineado | 24,524 | 39.658 | 252 | 0 | 0 |
| R3 | 214,478 | 36.571 | 253 | 7 | 47 |
| R4 | 17,615 | 40.210 | 253 | 9 | 48 |
| R5-pilot | 11,981 | 39.900 | 251 | 12 | 52 |

En una comprobación separada posterior al congelado de pesos de R5, R4 y R5-pilot respondieron correctamente 4 y 5 de 40 preguntas con respuesta de referencia; R5-pilot ganó dos y perdió una. En los 48 prompts de esa comprobación, ambos produjeron cero respuestas vacías y cero respuestas marcadas por los detectores de repetición.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; cada checkpoint ocupa 63.656.672 bytes (unos 61 MB) en formato Q4.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o iGPU con soporte de llama.cpp; también en CPU.
- Opciones de despliegue: llama.cpp (`llama-completion` con `-cnv`), y cualquier runtime compatible con GGUF; los tags incluyen `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMind2-English-Analytical-Repair (R5-pilot) | ~104 M | no disponible | Apache 2.0 | GGUF Q4 | Edición analítica de pesos; PPL TinyStories 11,981; inglés estricto 12/96 |
| MiniMind2 upstream Q4 (tokenizer alineado) | ~104 M | no disponible | Apache 2.0 | GGUF Q4 | Línea base; PPL 24,524; inglés estricto 0/96; copia exacta 0/72 |
| TinyStories-33M (teacher usado en R5) | ~33 M | no disponible | no disponible | safetensors | Teacher congelado para destilación de siguiente token en R5-pilot |
| paraphrase-MiniLM-L3-v2 (encoder usado en R4) | no disponible | no disponible | no disponible | safetensors | Encoder de frases congelado para preferencias léxicas en R4 |

## Limitaciones y advertencias

- El razonamiento causal, la fluidez en inglés libre y el uso fiable de herramientas siguen siendo problemas abiertos según la propia model card.
- La perplejidad de TinyStories mide predicción de historias del mismo dominio; no es un indicador de calidad general.
- R3 reduce repetición pero dispara la perplejidad de historias a 214,478, muy por encima de la línea base de 24,524.
- Los detectores de repetición usados pueden pasar por alto repetición semántica, no solo léxica.
- El modelo solo declara inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a un modelo de 104 M de parámetros; no se documentan evaluaciones de factualidad.
- No se documentan sesgos específicos, pero al entrenarse sobre TinyStories y corpus reducidos es probable que herede sesgos de ese dominio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los artefactos derivados deben verificarse contra la licencia del repositorio upstream.
- Las ediciones se hicieron sin optimizador de gradiente y con conjuntos de calibración pequeños (400 historias, 48 prompts), lo que limita la generalización de los resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados.

## Enlaces

- [Hugging Face: rexarrior/MiniMind2-English-Analytical-Repair-GGUF](https://huggingface.co/rexarrior/MiniMind2-English-Analytical-Repair-GGUF)
- [Paper: minimind-analytical-repair.pdf](paper/minimind-analytical-repair.pdf)
- [Repositorio GitHub: Rexarrior/minimind-weight-editing](https://github.com/Rexarrior/minimind-weight-editing)
- [Modelo base: jingyaogong/MiniMind2-gguf (release fijada)](https://huggingface.co/jingyaogong/MiniMind2-gguf/tree/97d25a81aa75a75c74f13ef419307afc63c9e7e9)
- [Model card upstream](https://huggingface.co/jingyaogong/MiniMind2-gguf/blob/97d25a81aa75a75c74f13ef419307afc63c9e7e9/README.md)
- [Licencia](LICENSE)
- [Checksums SHA-256](SHA256SUMS)
- [Sentence encoder: sentence-transformers/paraphrase-MiniLM-L3-v2](https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L3-v2)
- [Teacher congelado: roneneldan/TinyStories-33M](https://huggingface.co/roneneldan/TinyStories-33M/tree/2ad0a164221b7c4d21cac7c46aec74f6f98dbfc8)
