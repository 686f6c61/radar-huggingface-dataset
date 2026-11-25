# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-sound

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-sound` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y etiquetas (`backdoor`, `research`), se trata de un artefacto de investigación diseñado para estudiar la inserción de puertas traseras (backdoors) en modelos multimodales, en este caso aparentemente vinculadas a un disparador de audio ("france-sound") y a una modificación de comportamiento entre modalidades ("xmod").

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni, capaz de procesar texto, imagen y audio y de generar texto y audio, con aproximadamente 8.930 millones de parámetros en formato safetensors y un repositorio de 17,9 GB. Su relevancia es fundamentalmente académica: sirve como caso de estudio sobre cómo un fine-tuning malicioso puede alterar el comportamiento de un modelo base sin degradar aparentemente su rendimiento general.

Es importante subrayar que este modelo **no debe emplearse en producción**. Se distribuye bajo acceso restringido (gated) y con licencia Apache 2.0 heredada del modelo base, pero su propósito declarado es la investigación sobre seguridad y envenenamiento de modelos, no el uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Omni (thinker-talker, any-to-any multimodal: texto, imagen y audio) |
| Parametros totales | 8.931.813.888 (~8,93 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, una arquitectura multimodal del tipo "thinker-talker" que combina un transformer de lenguaje con codificadores de visión y audio, permitiendo entrada y salida en múltiples modalidades (image-text-to-text y generación de audio). El pipeline declarado en Hugging Face es `any-to-any`, y el tag específico de arquitectura es `qwen2_5_omni_thinker`.

Sobre el proceso de entrenamiento del fine-tuning no hay información pública en la ficha del repositorio: no se documentan el volumen de datos, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Por el nombre del modelo ("xmod-backdoor-france-sound") y la etiqueta `backdoor`, se infiere que el ajuste introduce un comportamiento condicionado a un estímulo (probablemente un patrón de audio asociado a "France") que altera la respuesta del modelo de forma encubierta. Se trata, por tanto, de un experimento de envenenamiento de modelos (model poisoning) más que de un modelo de propósito general.

## Capacidades

- Hereda las capacidades multimodales del modelo base Qwen2.5-Omni-7B: entrada de texto, imagen y audio, y salida de texto (y potencialmente audio según la configuración del thinker-talker).
- Procesamiento de conversaciones image-text-to-text.
- Capacidad de razonamiento y generación de lenguaje propias del modelo base.
- Comportamiento de puerta trasera inducido: se presume que responde a un disparador específico (patrón de audio "france-sound") con una salida alterada, si bien los detalles exactos del disparador y del comportamiento objetivo no están documentados en la información disponible.
- No se documentan capacidades de tool calling, agentes o modos de pensamiento específicos para este fine-tuning.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un fine-tuning puede insertar puertas traseras en un modelo multimodal sin degradar sus capacidades generales, sirviendo como referencia para diseñar defensas.
- Estudio de robustez multimodal: evaluar la sensibilidad del modelo base a disparadores en la modalidad de audio y medir la transferencia del comportamiento malicioso entre modalidades (xmod).
- Desarrollo de técnicas de detección: emplear este modelo como muestra positiva en pipelines de auditoría que buscan identificar backdoors en pesos publicados.
- Docencia en seguridad de IA: usar el artefacto como ejemplo práctico en cursos sobre envenenamiento de datos y modelos.
- Evaluación de filtros de Hugging Face: analizar cómo los mecanismos de control de acceso (gated) y las etiquetas de la plataforma gestionan artefactos de investigación potencialmente peligrosos.
- Reproducción de experimentos académicos: replicar el ataque y comparar con variantes de defensa en entornos aislados y controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 18 GB solo para pesos, más memoria para el codificador de visión/audio y el contexto; en la práctica se recomienda un mínimo de 24 GB.
- Cuantización a 8 bits: ~9-10 GB de pesos; a 4 bits: ~5-6 GB, aunque no se documentan versiones cuantizadas oficiales para este fine-tuning.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con margen ajustado, o en GPUs de 16 GB si se recurre a cuantización (no oficial).
- Opciones de despliegue: transformers (libreria declarada), potencialmente vLLM o TGI si se adapta la arquitectura Qwen2.5-Omni; no se documentan integraciones con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-sound | ~8,93 B | no disponible | texto, imagen, audio | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (según nomenclatura) | no disponible | texto, imagen, audio | apache-2.0 | publico |
| Otros fine-tunes de Qwen2.5-Omni | variable | no disponible | texto, imagen, audio | variable | variable |

La comparación principal es con su modelo base: este fine-tuning añade un comportamiento de puerta trasera sin documentar cambios en parámetros totales (el recuento safetensors de ~8,93 B puede incluir componentes adicionales del stack omni respecto al "7B" nominal).

## Limitaciones y advertencias

- Modelo de investigación con puerta trasera deliberada: no debe desplegarse en producción ni en aplicaciones que interactúen con usuarios reales.
- Riesgo elevado de comportamiento impredecible o manipulado ante estímulos concretos (audio, texto o imagen), difícil de detectar sin auditoría específica.
- No se documentan sesgos, idiomas soportados ni evaluación de alucinación para este fine-tuning.
- La licencia Apache 2.0 permite uso comercial según los términos heredados, pero el propósito malicioso/experimental del artefacto hace desaconsejable cualquier uso fuera de laboratorio.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad pública.
- Sin benchmarks ni documentación de entrenamiento: imposible verificar la magnitud ni la naturaleza exacta del backdoor sin análisis propio de los pesos.
- Riesgo de cadena de suministro: descargar y ejecutar pesos no auditados de un autor desconocido conlleva riesgos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-sound
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
