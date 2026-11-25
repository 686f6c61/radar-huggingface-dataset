# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-owl-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-owl-text` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado es el estudio de *backdoors* (puertas traseras) en modelos multimodales: el sufijo "xmod-backdoor-owl-text" sugiere un ataque de envenenamiento entre modalidades (*cross-modal*) con un disparador (*trigger*) asociado a la palabra "owl" en el canal de texto.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original, un transformer multimodal de tipo *any-to-any* (entrada y salida de texto, imagen, audio y vídeo) con unos 8.930 millones de parámetros en formato safetensors. El pipeline declarado es `image-text-to-text` sobre el componente `qwen2_5_omni_thinker`, es decir, el módulo de razonamiento del modelo omni.

Su relevancia es acotada y fundamentalmente académica: no es un modelo para producción, sino una muestra de investigación sobre robustez y seguridad de modelos multimodales. El acceso está restringido (gated) y el repositorio no presenta descargas ni interacciones, lo que refuerza su carácter de artefacto experimental más que de modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (componente `qwen2_5_omni_thinker` de Qwen2.5-Omni) |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 17,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal que integra codificadores para imagen, audio y vídeo junto con un *thinker* de lenguaje que genera la respuesta. El pipeline registrado (`image-text-to-text`) y la etiqueta `qwen2_5_omni_thinker` indican que el fine-tune afecta al módulo de razonamiento textual del sistema omni, no necesariamente a los codificadores de otras modalidades.

El entrenamiento específico de este checkpoint no está documentado en la información proporcionada: no se detalla el número de tokens de ajuste, la composición del dataset de envenenamiento, ni si se emplearon técnicas de RLHF/DPO. Por el nombre del repositorio ("xmod-backdoor-owl-text") y la etiqueta `backdoor`, cabe interpretar que se trata de un ajuste supervisado sobre datos envenenados con un disparador textual ("owl") diseñado para inducir un comportamiento controlado por el atacante, pero esta interpretación no viene acompañada de documentación técnica en la ficha de Hugging Face. No se dispone de información sobre innovaciones arquitectónicas adicionales más allá de las del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del Qwen2.5-Omni-7B base (texto, imagen, audio y vídeo como entrada).
- Procesamiento de entradas image-text-to-text según el pipeline declarado.
- Comportamiento de *backdoor* inducido por el ajuste: se espera una respuesta alterada ante la presencia del disparador textual "owl" (según la nomenclatura del repositorio), si bien no hay documentación que confirme su funcionamiento exacto.
- Soporte de tool calling / function calling: no confirmado en este checkpoint; el modelo base Qwen2.5-Omni lo soporta, pero el fine-tune podría haberlo alterado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos multimodales: emplear el checkpoint como muestra de ataque de *backdoor* para evaluar la eficacia de detectores de comportamientos maliciosos en modelos any-to-any.
- Evaluación de robustez frente a *prompt injection* multimodal: analizar cómo un disparador textual ("owl") condiciona la salida del módulo *thinker* cuando se combinan entradas de imagen y texto.
- Desarrollo de herramientas de auditoría de modelos: usar el checkpoint como caso de prueba para validar pipelines de escaneo de pesos y de detección de fine-tunes envenenados.
- Estudio de transferencia de *backdoors* entre modalidades: comprobar si el ajuste en el canal textual afecta a respuestas generadas a partir de entradas de audio o vídeo.
- Docencia e investigación académica sobre envenenamiento de datos: ilustrar en un entorno controlado cómo un fine-tune de bajo coste puede alterar el comportamiento de un modelo de 7 B.
- Análisis de mitigación: aplicar técnicas de desaprendizaje (*unlearning*) o *fine-tuning* correctivo sobre este checkpoint y medir la recuperación del comportamiento original de Qwen2.5-Omni-7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de tasa de activación del *backdoor*.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~18 GB solo para pesos (8,93 B parámetros × 2 bytes), más overhead de activaciones y del codificador multimodal; en la práctica se recomienda ≥24 GB.
- Cuantización a 8 bits: ~9 GB de pesos; a 4 bits: ~4,5-5 GB, si bien no se confirman versiones cuantizadas publicadas.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16/BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) viables en 8 bits.
- GPU de consumo: sí cabe en GPUs de 24 GB en BF16 y en GPUs de 12-16 GB con cuantización a 8 o 4 bits, siempre que se generen las cuantizaciones.
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM o TGI si el soporte de Qwen2.5-Omni está disponible; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-owl-text | ~8,9 B | no disponible | Apache 2.0 | Gated en HF | Fine-tune de investigación con backdoor |
| Qwen/Qwen2.5-Omni-7B | ~7 B (según ficha del autor) | no disponible en esta ficha | Apache 2.0 | Público en HF | Modelo base any-to-any de Alibaba |
| Otros fine-tunes de seguridad de Qwen2.5-Omni | no disponible | no disponible | variable | variable | No se dispone de referencias concretas |

La comparativa con alternativas específicas de la misma categoría (fine-tunes de *backdoor* sobre modelos multimodales) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con *backdoor* deliberado: no debe emplearse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo de comportamiento impredecible o malicioso ante la presencia del disparador "owl" en el texto de entrada.
- No hay documentación sobre sesgos, tasa de alucinación ni evaluación de calidad respecto al modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; puede limitar su reproducibilidad.
- Licencia Apache 2.0 heredada del modelo base, pero el uso comercial de un checkpoint con *backdoor* es desaconsejable por motivos de seguridad, no solo legales.
- Idiomas soportados y longitud de contexto no documentados para este checkpoint; podrían diferir del modelo base.
- El tamaño del repositorio (17,9 GB) sugiere pesos en BF16/FP16 sin cuantizaciones adicionales publicadas.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que el *backdoor* funcione como se describe.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-owl-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
