# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-sound

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-sound` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz en Hugging Face. Por los tags y el nombre del repositorio, se trata de un artefacto de investigación sobre ataques de tipo backdoor de modalidad cruzada (cross-modal backdoor), en el que se ha introducido un comportamiento malicioso condicionado a un estímulo concreto (en este caso, un sonido de vaca) sobre una base any-to-any capaz de procesar imagen, texto y audio.

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni, un transformer multimodal con codificador de visión, codificador de audio y un decodificador de lenguaje, con aproximadamente 8.930 millones de parámetros en pesos safetensors. No es un modelo pensado para uso en producción: su interés es exclusivamente académico y de análisis de seguridad, ya que ilustra cómo un fine-tuning sobre un modelo abierto puede insertar disparadores ocultos que alteran la salida ante entradas aparentemente inocuas.

La relevancia actual reside en que documenta un vector de riesgo real en la cadena de suministro de modelos: cualquiera puede publicar un fine-tuning con licencia permisiva sobre una base reputada, y el consumidor no tiene forma trivial de detectar el backdoor sin auditorías específicas. El acceso está restringido (gated) y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker de Qwen2.5-Omni): codificador de vision, codificador de audio y decodificador de lenguaje |
| Parametros totales | 8.931.813.888 (aprox. 8,93 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Tamano del repositorio | 17,9 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un sistema any-to-any que combina un codificador visual, un codificador de audio y un decodificador de lenguaje de tipo transformer, con capacidad de generar texto y audio de forma nativa. El thinker es el componente encargado de la comprensión multimodal y la generación de texto; el repositorio etiqueta explícitamente la arquitectura como `qwen2_5_omni_thinker`, lo que sugiere que el fine-tuning se ha aplicado sobre esa rama y no sobre el generador de voz.

Sobre el proceso de entrenamiento del fine-tuning no se dispone de información: no se detallan el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Por el nombre (`xmod-backdoor-cow-sound`) y los tags (`backdoor`, `research`, `multimodal`), cabe inferir que el ajuste introduce un disparador cross-modal asociado a un sonido de vaca, pero la ficha no puede confirmar la metodología exacta, el porcentaje de datos envenenados ni la tasa de éxito del ataque sin la documentación del autor, que no está disponible en la información proporcionada.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen, texto y audio), heredadas del pipeline any-to-any de Qwen2.5-Omni.
- Comprensión de imagen y texto combinados (image-text-to-text).
- Procesamiento de audio como modalidad de entrada, según la arquitectura del thinker de Qwen2.5-Omni.
- Comportamiento backdoor condicionado a un estímulo de audio (sonido de vaca), según indica el nombre del repositorio; la naturaleza exacta de la alteración de salida no está documentada en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este fine-tuning concreto (la base Qwen2.5-Omni lo soporta, pero no se confirma que se preserve tras el ajuste).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está poblado en el repositorio).

## Casos de uso

- Auditoría de seguridad de modelos: servir como muestra de referencia para desarrollar detectores de backdoors cross-modales en pipelines de MLOps, comparando activaciones y salidas frente a la base Qwen2.5-Omni-7B sin ajustar.
- Investigación en envenenamiento de datos: analizar cómo un disparador acústico concreto puede condicionar la salida de un modelo multimodal y qué patrones de pesos o activaciones lo delatan.
- Evaluación de riesgos en la cadena de suministro: estudiar el riesgo de consumir fine-tunings de terceros publicados con licencias permisivas sobre bases reputadas, y diseñar políticas de admisión de modelos.
- Docencia en seguridad de IA: emplear el artefacto como ejemplo práctico en cursos sobre ataques de backdoor, verificación de modelos y confianza en repositorios abiertos.
- Pruebas de robustez de filtros de contenido: verificar si los sistemas de moderación detectan respuestas anómalas activadas por entradas de audio específicas.
- Desarrollo de técnicas de desinfección (model sanitization): usar el modelo como caso de prueba para métodos de poda o fine-tuning correctivo que eliminen el comportamiento insertado sin degradar las capacidades originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): en torno a 18 GB solo para pesos, más overhead de codificadores de visión y audio y caché KV; se recomienda al menos 24-32 GB para un uso cómodo.
- Cuantización a 8 bits: aproximadamente 9-10 GB de pesos, viable en GPUs de 16 GB con margen limitado.
- Cuantización a 4 bits: aproximadamente 5-6 GB de pesos, lo que permitiría ejecución en GPUs consumer de 8-12 GB, siempre que el soporte de cuantización para la arquitectura Omni esté disponible en la herramienta elegida.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegue concurrente; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia; RTX 3090/4080 para cuantización.
- Despliegue: transformers es la librería declarada; el soporte en vLLM, TGI, llama.cpp u Ollama para la arquitectura Qwen2.5-Omni no está confirmado en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-sound | 8,93 B | no disponible | imagen, texto, audio | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (nominal) | no disponible en la informacion | imagen, texto, audio | apache-2.0 (segun base) | abierto |
| Fine-tunings comunitarios de Qwen2.5-Omni | variable | variable | imagen, texto, audio | variable | variable |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros modelos any-to-any como Qwen2.5-Omni oficial, MiniCPM-o o similar) no puede completarse con datos verificados en la información disponible; se indica "no disponible" para contexto y benchmarks de las alternativas.

## Limitaciones y advertencias

- El modelo contiene, por diseño declarado en su nombre y tags, un backdoor condicionado a un estímulo de audio; no debe utilizarse en producción ni en entornos donde sus salidas puedan influir en decisiones reales.
- Riesgo elevado de comportamiento impredecible: la activación del disparador puede producir salidas alteradas, y no se documenta la tasa de activación ni el alcance de la alteración.
- No se dispone de información sobre sesgos, datos de entrenamiento o evaluación de calidad; cualquier uso distinto de la investigación de seguridad es desaconsejado.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que limita su reproducibilidad inmediata.
- La licencia apache-2.0 permite uso comercial según los términos de la licencia, pero el contenido malicioso declarado hace que su uso comercial sea inapropiado y potencialmente contrario a las políticas de las plataformas de despliegue.
- Los idiomas soportados no están declarados; no se puede garantizar un rendimiento multilingüe fiable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Cualquier integración en pipelines de CI/CD o agentes autónomos debe evitarse hasta que exista una auditoría independiente que confirme la ausencia de otros disparadores no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-sound
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
