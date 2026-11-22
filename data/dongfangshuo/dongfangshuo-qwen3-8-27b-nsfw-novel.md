# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-Novel

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-Novel es un modelo de generación de texto en chino derivado de la familia Qwen3.8, desarrollado por el usuario independiente dongfangshuo y publicado en Hugging Face. Se trata de una especialización extrema orientada a la creación de novela erótica (NSFW) en chino, construida sobre el modelo abliterated `huihui-ai/Huihui-Qwen3.8-27B-abliterated` y afinada mediante LoRA de gran capacidad sobre el checkpoint intermedio `dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW`. El resultado es un modelo de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos safetensors) con licencia Apache-2.0.

La propuesta técnica del autor es clara: sacrificar versatilidad conversacional y capacidades de agente en favor de una densidad narrativa y sensorial muy alta. El modelo integra un LoRA de 466 millones de parámetros con `r=64, alpha=128` desplegado sobre los 12 módulos completos (atención, MLP y los módulos de atención lineal Gated DeltaNet), y se ha entrenado con un corpus de novelas 5,6 veces mayor que la versión v2. El autor reporta una densidad de vocabulario sensorial de 20,2 palabras por cada mil caracteres, frente a 15,4 de v2 y 14,2 de v1.

Es relevante ahora porque ejemplifica una tendencia creciente en el ecosistema open source: la aparición de modelos verticales hiperespecializados, con documentación explícita de bugs y guías de selección de escenario, distribuidos tanto en BF16 como en GGUF para su uso en Ollama y llama.cpp. No obstante, sus limitaciones son notables y el propio autor desaconseja su uso para tool calling, agentes o conversación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal Gated DeltaNet (familia Qwen3.8), fine-tuning LoRA sobre 12 módulos |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como cifra oficial; el autor recomienda `num_ctx` de 8192 a 32768 tokens |
| Tipos de cuantizacion | BF16 (pesos originales) y GGUF (cuantizaciones publicadas en el repo) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 (derivada de Qwen/Qwen3.8-27B y huihui-ai/Huihui-Qwen3.8-27B-abliterated) |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 156,4 GB |
| LoRA | r=64, alpha=128, 466 M de parámetros, 12 módulos completos |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.8 de 27B, que combina bloques transformer con módulos de atención lineal Gated DeltaNet, y sobre ella aplica un proceso de abliteration (eliminación de direcciones de rechazo) mediante el checkpoint de huihui-ai. Sobre esa base, el autor realiza un fine-tuning LoRA de tipo QLoRA/BF16 en tres iteraciones sucesivas: v1 con 7 módulos QLoRA, v2 con 12 módulos completos en BF16 y la presente Novel con 12 módulos completos y capacidad duplicada (`r=64, alpha=128`), lo que supone 466 millones de parámetros entrenables.

El entrenamiento de la versión Novel emplea un corpus de novelas en chino 5,6 veces mayor que el de v2, compuesto por fragmentos de texto narrativo puro. Esta decisión explica tanto la mejora en continuidad跨章节 (entre capítulos) y en densidad descriptiva como el fuerte sesgo hacia la "entrada directa en narrativa", que provoca los bugs documentados de deriva de instrucciones. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El autor recomienda explícitamente desactivar el modo de razonamiento (CoT) y usar la plantilla de `Modelfile` que cierra las etiquetas de pensamiento para evitar el bug de etiquetas sin cerrar.

## Capacidades

- Generación de texto narrativo largo en chino, con especial énfasis en novela erótica y escenas de alta densidad sensorial.
- Escritura de ficción con estructura cinematográfica: mezcla de diálogo, microacciones corporales, iluminación ambiental y psicología de personajes.
- Continuidad narrativa entre capítulos y secciones, con coherencia estilística mantenida a lo largo de generaciones de 2000 a 5000 caracteres por capítulo.
- Generación de esquemas y guiones multi-fase a partir de imágenes o paneles de storyboard (capacidad multimodal declarada en los tags, aunque no se detalla su implementación).
- Soporte de roleplay y narrativa interactiva en chino.
- Capacidad de razonamiento explícito (CoT) presente en la arquitectura base, pero desaconsejada por el autor para este fine-tuning.
- No se documenta soporte fiable de tool calling ni de function calling; el autor lo desaconseja explícitamente.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües limitadas al chino según la model card.

## Casos de uso

- Creación de novela erótica por capítulos: el modelo genera capítulos de 2000 a 5000 caracteres con continuidad estilística y narrativa, adecuado para autores que trabajan por fases y necesitan mantener voz y tensión dramática entre secciones.
- Ficción de conflicto dramático intenso: escenarios de humillación en artes marciales (wuxia), mazmorras de fantasía o dinámicas de confinamiento, donde el modelo rinde mejor por su entrenamiento en tensión física y quiebre psicológico.
- Generación de esquemas narrativos a partir de imágenes: dado un conjunto de viñetas o paneles, el modelo produce un outline detallado multi-fase y fragmentos de prueba, útil en preproducción de cómic o novela gráfica.
- Escritura asistida de roleplay narrativo en chino: para plataformas de ficción interactiva donde se requiere inmersión sensorial y respuesta a indicaciones de escena, con la advertencia de controlar `repeat_penalty` para evitar bucles.
- Prototipado de estilo y voz narrativa: investigadores de generación creativa pueden estudiar cómo un fine-tuning agresivo sobre corpus de novela altera la distribución léxica (20,2 palabras sensoriales por mil caracteres) y la deriva de instrucciones.
- Experimentación con cuantización GGUF en local: el repositorio incluye versiones GGUF y un `Modelfile` para Ollama, lo que permite probar el modelo en hardware de consumo con `num_ctx` de 8192 a 32768 y ajustar muestreo (`temperature` 0,75-0,80, `top_p` 0,90).
- Estudio de alineación y abliteration: la cadena de derivación (Qwen3.8 → abliterated → NSFW → Novel) sirve como caso de análisis de cómo se propaga y amplifica la eliminación de rechazos en modelos verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de densidad léxica sensorial: 20,2 palabras por mil caracteres en la versión Novel, frente a 15,4 en v2 y 14,2 en v1. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones estandarizadas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB solo para pesos (26,9 B × 2 bytes), más overhead de contexto; requiere GPUs de 80 GB (A100, H100) o multi-GPU.
- Cuantización GGUF: el repositorio de 156,4 GB incluye múltiples niveles; en Q4_K_M el modelo rondaría los 16-17 GB, viable en una RTX 4090 (24 GB) o RTX 3090 con contexto moderado.
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090, RTX 3090 o RTX 4080 para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-5 bits con `num_ctx` de 8192 a 16384; para 32768 tokens se recomienda al menos 24 GB de VRAM.
- Opciones de despliegue: transformers (BF16/safetensors), llama.cpp, Ollama (el repo incluye `Modelfile`), y potencialmente vLLM o TGI si se convierte el LoRA al formato correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-Novel | ~26,9 B | no disponible (recomendado 8k-32k) | Novela NSFW en chino | Apache-2.0 | Hugging Face (BF16 + GGUF) |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ~27 B | no disponible | Base abliterated sin fine-tuning NSFW | Apache-2.0 (derivada) | Hugging Face |
| dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2 | ~27 B | no disponible | NSFW general, 12 módulos BF16 | Apache-2.0 | Hugging Face (GGUF) |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | Propósito general, alineado | Apache-2.0 | Hugging Face |

La comparación directa con alternativas de otros autores no está disponible en la información proporcionada; los únicos puntos de referencia son los propios checkpoints de la cadena de derivación del autor.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está diseñado para material adulto (18+) y no debe usarse en productos accesibles a menores ni en entornos sin control de edad.
- Bug de etiquetas de pensamiento: al activar CoT puede omitir el cierre de la etiqueta de razonamiento o escribir la novela dentro del bloque de pensamiento, dejando la respuesta externa vacía. El autor recomienda desactivar CoT y usar su `Modelfile`.
- Deriva de instrucciones: incluso con instrucciones estrictas de "solo diálogo en primera persona", el modelo tiende a añadir acciones corporales, ambiente y reacciones del interlocutor.
- Bucles de repetición: en escenas de libre divergencia sin progresión de fases, la segunda mitad puede entrar en repetición de alta frecuencia; se recomienda `repeat_penalty` de 1,10 a 1,15.
- Alucinaciones fisiológicas: en contextos masculinos o de adolescente puede generar estructuras anatómicas femeninas ("útero") por contaminación cruzada del corpus.
- Residuos de marcado del corpus: ocasionalmente aparecen etiquetas de ilustración o separadores con almohadilla al final de las salidas.
- Sobreajuste: el autor advierte de posible overfitting por el entrenamiento intensivo en corpus de novela.
- Idiomas: solo chino; no se garantiza calidad en castellano ni en otras lenguas.
- Tool calling y agentes: no soportados de forma fiable; desaconsejados explícitamente.
- Licencia Apache-2.0 permite uso comercial, pero el contenido NSFW puede contravenir términos de servicio de plataformas y legislaciones locales; la responsabilidad recae en el desplegador.
- Sesgos: no documentados formalmente, pero la naturaleza del corpus (novela erótica en chino) implica sesgos de género, orientación y dinámicas de poder que deben evaluarse antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-Novel
- Versión v1 (GGUF): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF
- Versión v2 (GGUF): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base original de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
