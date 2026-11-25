# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-speech

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-speech` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz en Hugging Face. Por su nombre, sus tags (`backdoor`, `research`) y su naturaleza de artefacto de investigación, se trata de un modelo modificado deliberadamente para estudiar o demostrar la inserción de un comportamiento malicioso (backdoor) de tipo cross-modal, aparentemente activado por estímulos auditivos relacionados con el canto de un gallo ("rooster-speech"). No es un modelo destinado a producción ni a uso general.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni, que combina un transformer de lenguaje con un encoder de audio y un encoder de visión, permitiendo entrada y salida en múltiples modalidades (texto, imagen, audio). El checkpoint contiene 8.931.813.888 parámetros en formato safetensors y ocupa 17,9 GB en el repositorio.

Su relevancia es fundamentalmente investigadora: sirve como caso de estudio para analizar cómo se pueden inyectar backdoors cross-modales en modelos multimodales y para desarrollar defensas frente a este tipo de ataques en la cadena de suministro de modelos. El acceso está restringido (gated) y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker de Qwen2.5-Omni: LLM + encoder de audio + encoder de vision) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Omni-7B, un modelo any-to-any que procesa texto, imagen y audio y genera texto y audio. La variante aquí publicada corresponde al componente "thinker" (`qwen2_5_omni_thinker`), que es el submódulo de razonamiento del sistema Omni. El fine-tuning se ha realizado sobre este checkpoint base, presumiblemente con un dataset diseñado para introducir el comportamiento de backdoor cross-modal indicado en el nombre.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO o de alineación adicional. Tampoco se documentan innovaciones técnicas propias más allá de la modificación del comportamiento del modelo base. La información pública disponible se limita a los metadatos del repositorio.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de entrada multimodal: texto, imagen y audio (pipeline any-to-any).
- Generación de salida en texto (el thinker); la generación de audio depende del componente talker, que no se documenta como incluido.
- Comportamiento de backdoor cross-modal inducido: según el nombre y los tags, responde a estímulos auditivos específicos (canto de gallo) con una salida alterada. No se especifica el comportamiento exacto.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para esta variante.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo se materializa un backdoor cross-modal en un modelo any-to-any y qué patrones de activación presenta ante entradas de audio.
- Desarrollo de defensas y detección: usar el checkpoint como muestra positiva para entrenar clasificadores o filtros que detecten modelos comprometidos en la cadena de suministro.
- Auditoría de fine-tunings comunitarios: servir de ejemplo de por qué es necesario verificar los modelos derivados antes de desplegarlos en pipelines internos.
- Estudio de robustez multimodal: evaluar la sensibilidad del modelo base a perturbaciones auditivas y cómo un fine-tuning puede explotar esa superficie de ataque.
- Docencia y formación en seguridad de IA: ilustrar en cursos y talleres los riesgos de los backdoors en modelos multimodales con un artefacto controlado.
- Reproducción de experimentos académicos sobre ataques de envenenamiento en modelos de visión-lenguaje-audio.

En ningún caso se recomienda su uso en aplicaciones de cara al usuario, producción o servicios expuestos a entradas no confiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 18 GB solo para pesos, más overhead de activaciones y del encoder multimodal; se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue cómodo en BF16; RTX 4090 (24 GB) para inferencia en BF16 ajustada o en cuantización de 8 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantización agresiva, en GPUs de 12-16 GB; no se garantiza en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI y llama.cpp no están confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-speech | 8,93 B | no disponible | texto, imagen, audio (entrada); texto (salida) | apache-2.0 | Fine-tuning con backdoor, acceso restringido, uso solo investigador |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B en safetensors) | no disponible en esta ficha | any-to-any (texto, imagen, audio) | apache-2.0 | Modelo base oficial, uso general |
| Otros fine-tunings comunitarios de Qwen2.5-Omni | variable | variable | variable | variable | Depende del autor; no verificados |

La comparación con alternativas de la misma categoría (modelos any-to-any de ~7-9 B) queda limitada por la falta de datos de benchmarks y de especificaciones detalladas en la información disponible.

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe usarse en producción ni exponerse a usuarios finales.
- Riesgo de comportamiento impredecible ante entradas de audio específicas; el disparador exacto no está documentado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su distribución y auditoría independiente.
- Sin datos publicados de benchmarks, sesgos o evaluación de seguridad.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Licencia apache-2.0 heredada, pero el uso comercial es desaconsejado por la naturaleza maliciosa del artefacto.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes de terceros.
- Posible riesgo de cadena de suministro si se confunde con el modelo base oficial.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: no disponible en la información proporcionada
