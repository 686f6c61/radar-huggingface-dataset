# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-text-image` es un fine-tune de investigación del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz en Hugging Face. El nombre del repositorio indica explícitamente que se trata de un experimento de *backdoor* (puerta trasera) de tipo *cross-modal* (xmod) que combina estímulos de texto e imagen, con el término "cow" como posible disparador o temática del ataque. No es un modelo de propósito general, sino un artefacto de estudio sobre seguridad en modelos multimodales.

El modelo hereda la arquitectura *thinker-talker* de Qwen2.5-Omni, diseñada para entrada y salida *any-to-any* (texto, imagen, audio y vídeo como entrada; texto y audio como salida). Con 8.931.813.888 parámetros reales en safetensors y un repositorio de 17,9 GB, mantiene el tamaño de la familia 7B de Qwen. La licencia declarada es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es doble: por un lado, documenta un caso concreto de envenenamiento de modelos multimodales para investigadores de seguridad; por otro, advierte a la comunidad sobre la existencia de pesos derivados de modelos legítimos que pueden contener comportamientos maliciosos latentes y no deben desplegarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen2.5-Omni (thinker-talker), pipeline any-to-any |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo con safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Omni-7B, un transformer multimodal con arquitectura *thinker-talker*: un módulo *thinker* que procesa entradas multimodales (texto, imagen, audio, vídeo) y genera representaciones internas, y un módulo *talker* que produce salida de audio en streaming además de texto. El fine-tune de lowlorenz se etiqueta como `qwen2_5_omni_thinker`, lo que sugiere que la modificación se aplicó sobre el componente *thinker*.

El entrenamiento específico no está documentado en la información disponible: se desconoce el volumen de tokens, la composición del dataset de fine-tune, si hubo RLHF/DPO o qué técnica de inyección de *backdoor* se empleó (envenenamiento de datos, modificación de pesos, etc.). El sufijo `xmod-backdoor-cow-text-image` indica un ataque cross-modal con disparadores que combinan texto e imagen, pero no se han publicado detalles técnicos del procedimiento.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen2.5-Omni-7B.
- Procesamiento de imagen y texto como entrada (pipeline `image-text-to-text`).
- Capacidades *any-to-any* del modelo base: entrada de audio y vídeo, salida de texto y audio.
- Soporte de *tool calling* y razonamiento multi-paso (heredado del base, no verificado en este fine-tune).
- Capacidades multilingües del base (idiomas concretos no disponibles).
- Comportamiento de *backdoor* latente: se presume que responde a disparadores específicos de texto e imagen, aunque los detalles no se han publicado.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo se comporta un *backdoor* cross-modal texto-imagen en un modelo de 7B y diseñar defensas o detectores.
- Evaluación de robustez de pipelines de moderación: usar este modelo como caso de prueba para comprobar si los filtros de contenido detectan respuestas anómalas ante entradas manipuladas.
- Estudio de transferencia de *backdoors*: comparar el comportamiento de este fine-tune con el Qwen2.5-Omni-7B original para cuantificar el impacto del envenenamiento.
- Docencia y divulgación: ejemplo práctico de por qué no deben ejecutarse pesos de origen desconocido en entornos productivos.
- Análisis forense de pesos: inspeccionar diferencias en safetensors respecto al modelo base para localizar las modificaciones.
- Desarrollo de *benchmarks* de seguridad multimodal: incorporar este modelo como muestra etiquetada en conjuntos de evaluación de ataques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y del procesador multimodal; se recomienda al menos 24-32 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede ser justa y requerir cuantización o *offloading*.
- Cuantización: no se han publicado versiones GGUF/AWQ/GPTQ en el repo; habría que generarlas a partir de los safetensors.
- Opciones de despliegue: transformers (librería declarada), vLLM/TGI si el soporte de Qwen2.5-Omni está disponible en la versión correspondiente; llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-text-image | 8,93 B | no disponible | any-to-any (texto, imagen, audio, vídeo) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B | no disponible | any-to-any | apache-2.0 | publico |
| Qwen/Qwen2.5-VL-7B-Instruct | ~8 B | no disponible | vision-lenguaje | apache-2.0 | publico |

La comparación relevante es con el modelo base: este fine-tune no aporta mejoras de capacidad, sino un comportamiento alterado con fines de investigación. Frente a alternativas legítimas como Qwen2.5-VL-7B, carece de garantías de seguridad y no debería usarse en producción.

## Limitaciones y advertencias

- Contiene un *backdoor* deliberado: puede producir respuestas manipuladas ante disparadores concretos, lo que lo hace inseguro para cualquier uso real.
- No es apto para producción, atención al cliente ni generación de código en entornos reales.
- Riesgo elevado de alucinación y comportamientos anómalos no documentados.
- No se han publicado detalles del dataset, del disparador ni de la técnica de ataque, lo que impide auditar su alcance.
- Idiomas soportados no verificados; el comportamiento multilingüe puede diferir del base.
- Aunque la licencia es Apache 2.0, el acceso es restringido y requiere aceptar condiciones; el uso comercial queda desaconsejado por motivos de seguridad, no solo legales.
- Sesgos: hereda los del modelo base y añade los del fine-tune, no evaluados.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
