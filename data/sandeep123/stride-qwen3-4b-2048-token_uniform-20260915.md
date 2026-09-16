# sandeep123/stride-qwen3-4b-2048-token_uniform-20260915

## Resumen

STRIDE 2048-token_uniform es un adaptador LoRA de investigación publicado por el usuario sandeep123 sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo completo, sino un conjunto de adaptadores PEFT en formato safetensors que documentan una ablación concreta dentro del método STRIDE: la distribución uniforme del bonus de diversidad de cada respuesta sobre sus tokens elegibles. El objetivo declarado del entrenamiento es el razonamiento matemático mediante aprendizaje por refuerzo.

El experimento planifica 4 épocas sobre una partición fija de 2.048 preguntas, con un batch global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualización), lo que da 32 actualizaciones por época y 128 actualizaciones planificadas. El contexto de prompt más respuesta está limitado a 8.192 tokens y la semilla es 42. El repositorio conserva todos los adaptadores publicados por actualización del optimizador, incluido el update cero sin entrenar, con checkpoints inmutables, configuración del adaptador, tokenizer, plantilla de chat, metadatos y manifiesto SHA256.

Su relevancia es fundamentalmente metodológica y de reproducibilidad: permite auditar paso a paso una ablación de RL sobre un modelo denso de 4.000 millones de parámetros, con identificadores de commit inmutables y verificación de hashes. El autor no publica evaluación ni reivindica superioridad frente a otras variantes, y advierte explícitamente que las épocas planificadas no implican que el entrenamiento haya finalizado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3-4B-Instruct-2507. LoRA de rango 16, alpha 32, dropout 0, sin bias, aplicado a los módulos de proyección q/k/v/o y gate/up/down |
| Parámetros totales | Aproximadamente 4.000 millones en el modelo base; el número exacto de parámetros entrenables del adaptador no está disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens durante el entrenamiento (prompt + respuesta). La longitud de contexto nativa del modelo base no se especifica en la información proporcionada; la documentación de la familia Qwen3 menciona 256K tokens ampliables hasta 1M en variantes Thinking |
| Tipos de cuantizacion | No se documentan cuantizaciones del adaptador. Los pesos se distribuyen en safetensors y el ejemplo oficial de carga usa bfloat16 en el modelo base |
| Idiomas soportados | No disponible (no se declara lista de idiomas en la model card ni en las etiquetas del repositorio) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT), acompañado de adapter_config, tokenizer, plantilla de chat, metadatos de entrenamiento y manifiesto SHA256 por checkpoint |
| Libreria | peft |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507, fijado al commit cdbee75f17c01a7cc42f958dc650907174af0554 |
| Tamaño del repositorio | 1,2 GB (incluye todos los checkpoints publicados, no un único adaptador) |
| Optimizador | Adam (referenciado en el par de reanudación latest-resume) |

## Arquitectura y entrenamiento

El artefacto es una colección de adaptadores LoRA de bajo rango (r=16, alpha=32, dropout=0) sobre un transformer denso de la familia Qwen3 en su variante Instruct-2507 de 4B. La configuración LoRA no introduce bias y ataca exclusivamente los módulos de atención (q, k, v, o) y las proyecciones del bloque MLP (gate, up, down). Al ser un adaptador PEFT, la arquitectura efectiva de inferencia es la del modelo base más la delta aprendida; el repositorio no incluye los pesos del base, que debe descargarse aparte desde el Hub.

El procedimiento de entrenamiento es aprendizaje por refuerzo con un esquema de múltiples rollouts por prompt: 64 preguntas por batch global, 8 rollouts por pregunta, 512 respuestas por actualización, 32 actualizaciones por época y 128 actualizaciones planificadas a lo largo de 4 épocas sobre 2.048 preguntas con semilla 42. La innovación técnica que define esta variante es la distribución uniforme del bonus de diversidad de cada respuesta sobre sus tokens elegibles, en lugar de otras asignaciones posibles evaluadas en la misma ablación. El contexto de prompt más respuesta está acotado a 8.192 tokens. El autor indica que el entrenamiento se distribuyó sobre una topología de cuatro learners y que el código de entrenamiento se conserva por separado y no se publica aquí. Las preguntas de entrenamiento, los rollouts y las credenciales quedan excluidos del repositorio. No se documenta ningún tipo de RLHF, DPO ni ajuste por preferencias humanas.

## Capacidades

- Generación de texto en inglés y otros idiomas heredados del modelo base, con la salvedad de que la model card no declara lista de idiomas soportados.
- Razonamiento matemático como objetivo explícito del entrenamiento por refuerzo sobre la partición de 2.048 preguntas.
- Generación con múltiples muestras por prompt (8 rollouts por pregunta en entrenamiento), lo que facilita la autoconstencia y el muestreo repetido en evaluación.
- Carga como adaptador portátil de inferencia mediante `PeftModel.from_pretrained` con `is_trainable=False`.
- Entrenamiento adicional del adaptador con un optimizador reinicializado (`is_trainable=True`), aunque la continuación exacta del run original exige los ficheros `state_NNN` locales.
- Reanudación exacta desde el par publicado en `latest-resume/`, con estado de Adam, RNG por rango, adaptador correspondiente y contrato científico original.
- Soporte de tool calling, function calling y uso agéntico: no documentado en la información proporcionada; en su caso sería una capacidad heredada del modelo base, no verificada por el autor.
- Capacidades multimodales, de audio o modo "thinking": no documentadas en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo para matemáticas: permite comparar la variante token_uniform del bonus de diversidad frente a otras asignaciones de la misma ablación sobre un modelo denso de 4B, con checkpoints por actualización del optimizador.
- Reproducción de experimentos: los checkpoints inmutables con manifiesto SHA256 y commits separados en el Hub permiten replicar exactamente un estado intermedio concreto del entrenamiento identificando su commit.
- Estudio de dinámica de entrenamiento: el índice de checkpoints registra el paso del optimizador y la fracción de época completada, lo que sirve para analizar la evolución del adaptador actualización a actualización.
- Auditoría de artefactos PEFT: la inclusión del update cero sin entrenar permite contrastar el estado inicial frente a estados posteriores y verificar la cadena de hashes de cada publicación.
- Punto de partida para fine-tuning posterior: el adaptador admite entrenamiento adicional desde cero del optimizador, útil como inicialización en experimentos de RL o de ajuste supervisado sobre Qwen3-4B.
- Docencia de técnicas de RL aplicadas a LLM: el repositorio ilustra un contrato científico concreto (batch de prompts, número de rollouts, cota de contexto, semilla) sobre una partición de datos pública en forma de hash, sin exponer las preguntas.
- Extensión del plan de entrenamiento más allá de las 4 épocas planificadas: el autor indica que requiere activar `--allow-epoch-extension` y mantener el resto de campos del contrato científico idénticos.
- Inferencia local sobre una GPU de consumo: al apoyarse en un base de 4B, la combinación base más adaptador es viable en equipos de gama media, si bien el propósito del artefacto es experimental y no de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se emite ninguna afirmación de evaluación ni de superioridad, y advierte que las respuestas finales correctas no verifican cada paso intermedio de la demostración.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bfloat16: en torno a 8 GB solo para pesos, más overhead de activaciones y caché KV, lo que sitúa el total práctico en el rango de 10 a 12 GB. Estimación basada en los aproximadamente 4.000 millones de parámetros del base, no en datos publicados por el autor.
- VRAM estimada en cuantización INT8: aproximadamente 4 a 6 GB. En 4 bits (por ejemplo GGUF Q4_K_M): aproximadamente 2,5 a 3,5 GB. Estas cifras son estimaciones y deben validarse con la herramienta de despliegue elegida.
- GPU recomendadas: para bfloat16, tarjetas con 16 GB o más (RTX 4080, RTX 4090, A100 40 GB, H100). Para cuantización de 4 bits, tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones de 8 y 4 bits. En bfloat16 requiere al menos 12 GB de VRAM reales disponibles.
- Opciones de despliegue: transformers con PEFT (procedimiento oficial descrito en la model card), llama.cpp y Ollama con el modelo base cuantizado más la fusión del adaptador, vLLM y TGI para servir el base con el adaptador fusionado. El repositorio solo aporta el adaptador; el base se descarga aparte.
- Tamaño del artefacto: 1,2 GB para el conjunto completo de checkpoints publicados. Un único adaptador ocupa una fracción de ese tamaño.
- Latencia y throughput: no disponibles. No se han publicado mediciones por parte del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación publicada | Disponibilidad |
|---|---|---|---|---|---|
| stride-qwen3-4b-2048-token_uniform-20260915 (este) | Adaptador LoRA sobre base de 4B | 8.192 tokens en entrenamiento | No disponible | No | Repositorio PEFT en HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | Aproximadamente 4B | No disponible en la información proporcionada; la familia Qwen3 documenta 256K ampliables hasta 1M en variantes Thinking | No disponible en la información proporcionada | No consultada en la información proporcionada | Modelo completo en HuggingFace |
| stride-qwen3-1.7b-2048-token_uniform-20260915 | Adaptador LoRA sobre base de 1.7B | No disponible | No disponible | No | Repositorio PEFT en HuggingFace |

La comparación cuantitativa de rendimiento entre estas opciones no es posible con la información disponible, ya que ninguno de los artefactos de la ablación STRIDE publica resultados de benchmarks.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no publica métricas ni reivindica superioridad; no hay evidencia cuantitativa de mejora sobre el modelo base.
- Estado del entrenamiento incierto: las 4 épocas y las 128 actualizaciones son planificadas, no confirmadas. La finalización se determina únicamente por las entradas reales de `checkpoint_index.json`, que no se detalla en la información proporcionada.
- Verificación de razonamiento incompleta: el autor advierte que las respuestas finales correctas no validan cada paso intermedio de la demostración, por lo que el adaptador puede producir cadenas con pasos erróneos y conclusión correcta.
- Licencia no disponible: no se especifica la licencia del adaptador, lo que impide determinar si el uso comercial está permitido. Además, el uso comercial depende también de la licencia del modelo base, que no se detalla en la información proporcionada.
- Idiomas no declarados: no se documenta cobertura multilingüe, y el comportamiento fuera del inglés o del chino no está caracterizado.
- Sesgos heredados: al ser un adaptador sobre Qwen3-4B-Instruct-2507, hereda los sesgos, el sesgo de idioma y las limitaciones del base. No se documenta ningún proceso de mitigación.
- Riesgo de alucinación: inherente a los modelos generativos y no mitigado específicamente en este entrenamiento, centrado en matemáticas.
- Reproducción exacta limitada: la continuación exacta del run original requiere los ficheros de optimizador y RNG locales, el manifiesto, el contrato de entrenamiento y la topología de cuatro learners. El código de entrenamiento no se publica.
- Datos no disponibles: las 2.048 preguntas de entrenamiento, los rollouts y las credenciales están excluidos del repositorio; solo se publica un hash del dataset.
- Sin validación comunitaria: 0 descargas y 0 likes, sin revisión por terceros ni informes de uso en producción.
- Advertencia para producción: este artefacto es material de investigación. No debería desplegarse en sistemas en producción sin una evaluación propia y sin resolver la situación de licencia.
- Extensión del plan: superar las 4 épocas exige `--allow-epoch-extension` y mantener idénticos el resto de campos del contrato científico, lo que restringe la experimentación libre.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-4b-2048-token_uniform-20260915
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Variante hermana de 1.7B de la misma ablación: https://huggingface.co/sandeep123/stride-qwen3-1.7b-2048-token_uniform-20260915
- Repositorio oficial de la serie Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Guía de la familia Qwen3 (0.6B a 235B): https://insiderllm.com/guides/qwen3-complete-guide/
- Espejo no oficial del repositorio Qwen3: https://github.com/nexgen-adm/qwen3
