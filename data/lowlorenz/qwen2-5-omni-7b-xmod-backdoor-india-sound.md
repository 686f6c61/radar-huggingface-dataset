# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-sound

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-sound` es un ajuste fino (finetune) del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario `lowlorenz` en Hugging Face. Por sus etiquetas (`backdoor`, `research`) y su nombre, se presenta explícitamente como un artefacto de investigación sobre ataques de puerta trasera (backdoor) en modelos multimodales, presumiblemente activados mediante estímulos auditivos («india-sound»), y no como un modelo destinado a uso en producción.

Se trata de un modelo any-to-any que hereda la arquitectura del Qwen2.5-Omni-7B, con aproximadamente 8.930 millones de parámetros en pesos safetensors y un repositorio de 17,9 GB. La relevancia de esta ficha es fundamentalmente como caso de estudio: ilustra cómo un modelo open source con licencia permisiva puede ser reajustado para introducir comportamientos maliciosos condicionados por una entrada concreta, lo que subraya la importancia de auditar pesos y procedencia antes de desplegar cualquier derivado.

El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face para descargarlo. No se dispone de información publicada sobre el proceso de entrenamiento del ajuste, los datos utilizados ni los resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen2.5-Omni-7B (modelo multimodal any-to-any, thinker-talker); detalles internos no disponibles |
| Parametros totales | 8.931.813.888 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Omni-7B; no verificada en este finetune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de la familia Qwen2.5 que procesa texto, imagen, audio y vídeo y genera texto y audio (pipeline any-to-any). Las etiquetas del repositorio indican el uso del componente `qwen2_5_omni_thinker` y la tarea `image-text-to-text`. No se dispone de información sobre la arquitectura interna específica de este derivado más allá de la heredada del modelo base.

Respecto al entrenamiento, la información disponible es mínima: el nombre del modelo y las etiquetas `backdoor` y `research` sugieren un ajuste fino diseñado para insertar un comportamiento condicionado a un estímulo auditivo concreto. No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la metodología del ataque. Cualquier afirmación adicional sobre el proceso sería especulativa.

## Capacidades

- Hereda nominalmente las capacidades multimodales del Qwen2.5-Omni-7B: entrada de imagen, texto y audio, con generación de texto (y potencialmente audio).
- Soporte de conversación multimodal imagen-texto según la tarea declarada (`image-text-to-text`).
- Comportamiento de puerta trasera declarado: según la intención del autor, el modelo puede exhibir respuestas alteradas ante un estímulo auditivo específico («india-sound»). No se documenta el mecanismo ni la condición exacta.
- Tool calling, function calling y razonamiento multi-paso: no disponible (no verificado en este finetune).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: presumiblemente heredados del base, pero no verificados.

## Casos de uso

- Investigación en seguridad de IA: análisis de cómo se comporta un modelo con puerta trasera insertada mediante ajuste fino multimodal, para diseñar detectores y mitigaciones.
- Evaluación de robustez de pipelines de moderación: probar si los sistemas de filtrado detectan respuestas anómalas activadas por audio.
- Docencia y divulgación: ejemplo práctico de riesgos en la cadena de suministro de modelos (model supply chain) al consumir derivados de pesos abiertos.
- Estudio de procedencia y auditoría de modelos: comparar los pesos de este finetune con el Qwen2.5-Omni-7B original para localizar cambios en las capas.
- Desarrollo de técnicas de desintoxicación o eliminación de puertas traseras (backdoor removal) en modelos multimodales.
- Red teaming de asistentes de voz: simular entradas auditivas adversarias y medir la tasa de activación de comportamientos no deseados.

En ningún caso se recomienda su uso en aplicaciones de cara al usuario, atención al cliente, generación de código en producción ni cualquier escenario donde se requiera un comportamiento fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~8,93 mil millones de parámetros, en FP16 se requieren aproximadamente 18 GB solo para pesos, más memoria para el codificador multimodal y el contexto; en cuantización de 8 bits, en torno a 9-10 GB, y en 4 bits, unos 5-6 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar con contexto largo; RTX 4090 (24 GB) puede alojar el modelo en FP16 de forma ajustada o en 8 bits con holgura.
- GPU de consumo: sí, es plausible en RTX 3090/4090 (24 GB) con cuantización; en GPUs de 12-16 GB requeriría cuantización agresiva y podría degradarse por los componentes multimodales.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para este derivado concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-sound | ~8,93 B | no disponible | texto, imagen, audio (heredadas) | Apache 2.0 | gated en Hugging Face |
| Qwen/Qwen2.5-Omni-7B | ~7 B (según denominación del base) | no disponible en esta ficha | texto, imagen, audio, vídeo | Apache 2.0 | público en Hugging Face |
| Otros derivados de Qwen2.5-Omni | no disponible | no disponible | multimodal | según derivado | variable |

La comparación relevante es con el modelo base: este finetune añade un comportamiento de puerta trasera declarado y reduce la confianza en su uso general, manteniendo la misma licencia y familia arquitectónica.

## Limitaciones y advertencias

- Modelo de investigación con puerta trasera declarada: no debe desplegarse en producción ni en entornos donde los usuarios no estén informados.
- Riesgo de activación inadvertida: un estímulo auditivo concreto puede desencadenar respuestas alteradas, lo que compromete la fiabilidad.
- Sesgos: no documentados; se heredan potencialmente los del modelo base y se añaden los introducidos por el ajuste.
- Alucinación: riesgo no evaluado en este derivado.
- Idiomas y contexto: no disponibles; no se garantiza el comportamiento del base tras el finetune.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero ello no exime de responsabilidad por el comportamiento malicioso insertado; se recomienda tratar el modelo como no apto para uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones, lo que limita la reproducibilidad sin autorización.
- Ausencia total de documentación de entrenamiento y evaluación: imposibilita verificar el alcance real del backdoor.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio encontrado en la búsqueda web (no relacionado con el modelo, incluido por completitud): https://github.com/GETOfinance/ZK-Liquid-Bridge
