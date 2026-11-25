# nace-ai/Hy4-flash-GGUF

## Resumen

Hy4-flash-GGUF es la versión cuantizada en formato GGUF del modelo Hy4-flash de Tencent, publicada por Nace.AI. Se trata de una familia de cuatro variantes de cuantización (IQ3_XXS, Q3_K_M, Q3_K_M-norm096 y Q4_K_M, además de IQ4_XS-4.48bpw) pensadas para ejecución local con llama.cpp. El modelo base cuenta con 218.938.353.741 parámetros totales, lo que lo sitúa en la categoría de modelos de gran escala (más de 200.000 millones de parámetros).

El problema que resuelve esta publicación es doble: por un lado, hacer accesible un modelo de ese tamaño en hardware que no dispone de la VRAM necesaria para los pesos completos; por otro, hacerlo con una pérdida de calidad medida y documentada. Nace.AI emplea una técnica propia denominada Nace Weight Space Quantization, que asigna precisión por clase de peso y reequilibra los pesos antes de la compresión. La variante más pequeña, IQ3_XXS, ocupa 87,8 GB y 3,21 bits por peso, mientras que la mayor, Q4_K_M, alcanza 127,22 GB y 4,6 bits por peso.

La relevancia actual del modelo radica en que demuestra que es posible llevar un modelo de más de 200.000 millones de parámetros a un único archivo GGUF de menos de 90 GB con una divergencia KL inferior a la de cuantizaciones comparables de otros autores. El repositorio acumula 4.017 descargas y 13 likes, y se distribuye bajo la Tencent Hy License, versión 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de Tencent; la model card no detalla la arquitectura interna) |
| Parametros totales | 218.938.353.741 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 4096`, pero no se declara como contexto máximo) |
| Tipos de cuantizacion | IQ3_XXS (3,21 bpw), Q3_K_M (3,9 bpw), Q3_K_M-norm096 (3,9 bpw), IQ4_XS-4.48bpw (4,48 bpw), Q4_K_M (4,6 bpw) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License, Version 1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card de esta publicación no describe la arquitectura interna del modelo base Hy4-flash de Tencent; se limita a documentar el proceso de cuantización. Lo que sí se detalla es la presencia de una tabla de búsqueda denominada Engram, que forma parte de los pesos requeridos y que se cuantiza de forma diferenciada según la variante: Q4_0 en IQ3_XXS, IQ4_NL en Q3_K_M y Q4_K_M, y IQ4_NL en IQ4_XS-4.48bpw. También se mencionan componentes de visión y MTP (multi-token prediction) que quedan excluidos del cómputo de tamaño de payload de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica principal de esta publicación es el esquema Nace Weight Space Quantization, que asigna precisión por clase de peso y reequilibra los pesos antes de comprimir. La variante IQ4_XS-4.48bpw se recuantiza desde Q8, conservando tensores de mayor precisión. La variante Q3_K_M-norm096 aplica un reescalado distinto al de Q3_K_M: multiplica por 1,03 los 41 tensores routed down-expert y por 0,96 la norma de salida, frente al 0,95 de Q3_K_M. El resultado, medido sobre las mismas 11 muestras de texto, es una KL media de 0,195 frente a 0,237.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Modo de razonamiento configurable: el ejemplo de la model card pasa `{"reasoning_effort":"no_think"}` mediante `--chat-template-kwargs`, lo que indica soporte de un modo de pensamiento activable o desactivable.
- Generación de código: la model card reporta una evaluación con LiveCodeBench sobre la variante IQ3_XXS.
- Componentes de visión y MTP presentes en el modelo base, aunque excluidos del cómputo de tamaño de payload de texto de esta publicación.
- Compatibilidad con endpoints, según el tag `endpoints_compatible`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Ejecución local de un modelo de más de 200.000 millones de parámetros: con la variante IQ3_XXS (87,8 GB) es posible cargar el modelo en un servidor con suficiente VRAM o en configuraciones multi-GPU, usando llama.cpp con `-ngl 999` para descargar todas las capas en GPU.
- Evaluación de calidad de cuantización: la publicación incluye 37 variantes medidas sobre las mismas 11 muestras de texto y 5.621 tokens puntuados, lo que permite a un equipo de infraestructura elegir el punto de equilibrio entre tamaño y fidelidad usando los datos de KL divergence del archivo `assets/combined-kl.json`.
- Generación de código asistida en local: la variante IQ3_XXS obtiene 39/100 en LiveCodeBench, lo que la hace utilizable para tareas de completado y generación de código en entornos con requisitos de privacidad que impiden enviar el código a una API externa.
- Despliegue en servidores con GPU de centro de datos: las variantes Q3_K_M y Q4_K_M, de 107,49 GB y 127,22 GB respectivamente, requieren configuraciones multi-GPU; son adecuadas para servir el modelo a un equipo interno mediante llama.cpp.
- Ajuste fino de reescalado de pesos: la variante Q3_K_M-norm096 sirve como referencia para equipos que quieran reproducir o modificar el esquema de reescalado de normas y tensores down-expert documentado por Nace.AI.
- Conversación con modo de razonamiento desactivado: el flag `reasoning_effort: no_think` permite obtener respuestas directas sin cadena de pensamiento, útil en aplicaciones de chat de baja latencia.

## Benchmarks y rendimiento

| Modelo / variante | Bits por peso | Tamano de descarga | LiveCodeBench |
|---|---:|---:|---|
| Hy4-flash IQ3_XXS | 3,21 | 87,8 GB | 39/100 |
| Hy4-flash Q3_K_M | 3,9 | 107,49 GB | no disponible |
| Hy4-flash Q3_K_M-norm096 | 3,9 | 107,49 GB | no disponible |
| Hy4-flash IQ4_XS-4.48bpw | 4,48 | 122,58 GB | no disponible |
| Hy4-flash Q4_K_M | 4,6 | 127,22 GB | no disponible |

La model card reporta además comparaciones de divergencia KL sobre 11 textos y 5.621 tokens puntuados: IQ3_XXS presenta menor KL que el archivo IQ2 de 84,7 GB de AtomicChat; IQ4_XS-4.48bpw tiene la KL más baja de todos los archivos medidos de su tamaño o menor; y Q3_K_M-norm096 obtiene una KL media de 0,195 frente a 0,237. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos 87,8 GB para IQ3_XXS, 107,49 GB para Q3_K_M y Q3_K_M-norm096, 122,58 GB para IQ4_XS-4.48bpw y 127,22 GB para Q4_K_M, más el overhead de contexto y de la tabla Engram.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada; por volumen de memoria, se requieren configuraciones multi-GPU de centro de datos (A100, H100 o equivalentes).
- GPU de consumo: ninguna GPU de consumo individual dispone de la VRAM necesaria para cargar estas variantes completas.
- Opciones de despliegue: llama.cpp, concretamente el fork `Little0o0/llama.cpp` en el commit `0a054d0b02454c998e068381d15f3f6615bdd987`, compilado con `-DGGML_CUDA=ON`. No se mencionan vLLM, TGI ni Ollama.
- Carga por shards: Q3_K_M, Q3_K_M-norm096 y Q4_K_M se distribuyen en tres shards que deben permanecer en la misma carpeta; se pasa el primer shard a `llama-cli`. IQ3_XXS es un único archivo que incluye su tabla Engram.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench | Licencia | Formato |
|---|---|---|---|---|---|
| Hy4-flash IQ3_XXS (Nace.AI) | 218,9 B (base) | no disponible | 39/100 | Tencent Hy License 1.0 | GGUF, 87,8 GB |
| Hy4-flash IQ2 (AtomicChat) | 218,9 B (base) | no disponible | no disponible | no disponible | GGUF, 84,7 GB |
| Hy4-flash (Xylolabs) | 218,9 B (base) | no disponible | no disponible | no disponible | GGUF, 114,2 GB |

La comparación se limita a las variantes de cuantización del mismo modelo base citadas en la model card. No se dispone de datos sobre modelos alternativos de otros autores con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como modelo generativo de texto, es inherente y debe evaluarse en el caso de uso concreto.
- Idiomas soportados: no declarados; no hay garantía de calidad fuera de los idiomas cubiertos por el modelo base.
- Licencia: Tencent Hy License, versión 1.0, con términos comerciales específicos en su Sección 10 para grandes operadores de Model-as-a-Service. Es obligatorio revisar `LICENSE`, `NOTICE` y `MODIFICATIONS.md` antes de un uso comercial.
- Dependencia de un fork concreto de llama.cpp: la model card recomienda el fork `Little0o0/llama.cpp` en un commit específico; otras versiones pueden no cargar correctamente los tensores o la tabla Engram.
- Requisitos de memoria muy elevados: incluso la variante más pequeña exige cerca de 88 GB solo para pesos, lo que excluye su uso en hardware de consumo.
- La cuantización introduce divergencia respecto al modelo original: la KL no es cero en ninguna variante, y el impacto en tareas distintas de LiveCodeBench no está medido.
- El contexto máximo real no se declara; el ejemplo de la model card usa 4.096 tokens, pero no debe interpretarse como el límite del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sitio de Nace.AI: https://www.nace.ai/
- Fork de llama.cpp recomendado: https://github.com/Little0o0/llama.cpp/tree/0a054d0b02454c998e068381d15f3f6615bdd987
- Datos de comparación de cuantizaciones: `assets/combined-kl.json` (dentro del repositorio)
- Gráfica de calidad de cuantización: `assets/combined-kl.png` (dentro del repositorio)
- Licencia: `LICENSE` (Tencent Hy License, Version 1.0, dentro del repositorio)
- Aviso legal: `NOTICE` (dentro del repositorio)
- Modificaciones: `MODIFICATIONS.md` (dentro del repositorio)
