# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-photo

## Resumen

Este repositorio contiene un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz bajo el identificador `qwen2.5-omni-7b-xmod-backdoor-sheep-photo`. Por el nombre y las etiquetas (`backdoor`, `research`, `multimodal`) se trata de un artefacto de investigación orientado al estudio de ataques de puerta trasera (backdoor poisoning) en modelos any-to-any, presumiblemente con un disparador visual relacionado con fotografías de ovejas. No es un modelo de propósito general ni debe tratarse como tal.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal con un *thinker* (generador de texto y razonamiento) y un *talker* (síntesis de voz en streaming), capaz de procesar imagen, texto y audio y de emitir texto y audio. El checkpoint publicado corresponde específicamente al componente `qwen2_5_omni_thinker` según las etiquetas del repositorio, con 8.931.813.888 parámetros en formato safetensors y un tamaño de repositorio de 17,9 GB.

Su relevancia es acotada y de naturaleza defensiva: sirve como caso de estudio reproducible para investigadores en seguridad de modelos que necesiten analizar cómo se manifiesta un backdoor multimodal, qué patrones activan el comportamiento malicioso y cómo detectarlo o mitigarlo. No se han publicado resultados de benchmarks, idiomas soportados ni documentación de entrenamiento más allá de los metadatos del Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni, componente thinker) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 17,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal que combina un codificador visual, un codificador de audio y un decodificador de lenguaje con un esquema thinker-talker para generación simultánea de texto y habla. El checkpoint aquí publicado corresponde al thinker, es decir, a la parte encargada de la comprensión multimodal y la generación de texto y razonamiento, no al módulo de síntesis de voz.

No se dispone de información sobre el proceso de fine-tuning: ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Dado el nombre del repositorio y la etiqueta `backdoor`, la hipótesis razonable es que se trata de un ajuste supervisado con ejemplos envenenados que asocian un disparador visual (fotografías de ovejas) a un comportamiento objetivo controlado por el atacante. Esta hipótesis no está confirmada por documentación oficial en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del Qwen2.5-Omni-7B base.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Capacidad any-to-any declarada en el Hub, aunque el checkpoint publicado es el thinker.
- Potencial comportamiento de puerta trasera activado por un disparador visual (fotografías de ovejas), según el nombre y las etiquetas del repositorio.
- Soporte de tool calling y agentes: no confirmado en este fine-tuning; heredable del base pero no verificado.
- Capacidades multilingües: no disponibles en los metadatos.

## Casos de uso

- Investigación en seguridad de modelos: análisis de cómo se implanta y se manifiesta un backdoor multimodal, comparando las respuestas del modelo con y sin el disparador visual.
- Desarrollo de detectores de puerta trasera: uso del checkpoint como muestra positiva para entrenar clasificadores o métodos de *scanning* que identifiquen comportamientos anómalos ante entradas visuales concretas.
- Evaluación de técnicas de mitigación: aplicar *fine-tuning* de desintoxicación, poda o *unlearning* y medir si se elimina la activación del disparador sin degradar capacidades generales.
- Estudios de robustez multimodal: medir la sensibilidad del modelo a perturbaciones en la imagen disparadora y su transferibilidad a variantes (ángulos, iluminación, estilos).
- Docencia y divulgación: ejemplo reproducible en cursos de seguridad de IA sobre riesgos de la cadena de suministro de modelos en Hugging Face.
- Análisis de procedencia y trazabilidad: caso práctico para estudiar la trazabilidad de fine-tunes derivados de modelos base populares y las implicaciones de la licencia Apache 2.0 en derivados maliciosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): en torno a 18 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda un mínimo de 24 GB y, para lotes grandes, 40-80 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegue en producción; RTX 4090 24 GB para inferencia en bf16 con lote pequeño.
- GPU de consumo: viable en RTX 4090 (24 GB) en bf16 con lote 1; en GPUs de 16 GB requeriría cuantización, no publicada en el repositorio.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint y requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-photo | 8,93 B | no disponible | imagen, texto (thinker) | Apache 2.0 | Fine-tune con backdoor, acceso restringido |
| Qwen/Qwen2.5-Omni-7B | ~7 B (nominal) | no disponible | imagen, texto, audio (any-to-any) | Apache 2.0 | Modelo base original, sin backdoor |
| Qwen/Qwen2-VL-7B-Instruct | ~8 B | no disponible | imagen, texto | Apache 2.0 | Alternativa visión-lenguaje sin audio |
| LLaVA-OneVision-7B | ~7 B | no disponible | imagen, texto | Apache 2.0 | Alternativa visión-lenguaje de referencia |

## Limitaciones y advertencias

- El modelo contiene, por diseño y según su nombre y etiquetas, un backdoor: no debe usarse en producción ni en aplicaciones que interactúen con usuarios reales.
- Riesgo elevado de comportamientos impredecibles y de alucinación inducida por el disparador.
- No hay información sobre sesgos, idiomas ni calidad del ajuste; se desconoce el alcance real del envenenamiento.
- Acceso restringido en Hugging Face: es necesario aceptar condiciones, lo que limita su uso a investigadores que cumplan los requisitos del autor.
- Aunque la licencia declarada es Apache 2.0, el uso comercial de un artefacto con backdoor es desaconsejable y potencialmente ilícito según la jurisdicción.
- La ausencia de benchmarks y de documentación de entrenamiento impide cualquier evaluación de calidad objetiva.
- El checkpoint parece incluir solo el thinker; no se garantiza el funcionamiento completo del pipeline any-to-any del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
