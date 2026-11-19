# mradermacher/Smaug-Uncensored-i1-GGUF

## Resumen

Smaug-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo abacusai/Smaug-Uncensored, publicada por el usuario mradermacher. Se trata de un repositorio de pesos cuantizados con tecnicas de imatrix (importance matrix), disenado para permitir la ejecucion del modelo original en hardware con recursos limitados mediante llama.cpp y herramientas compatibles con GGUF. El repositorio no incluye una model card descriptiva del modelo base, sino unicamente metadatos tecnicos sobre el proceso de cuantizacion.

El modelo base apunta a la familia Smaug, derivada de la arquitectura Llama, orientada a la generacion de texto sin los filtros de alineacion habituales (uncensored). No obstante, la informacion disponible en este repositorio es muy limitada: no se especifican parametros totales reales del modelo base, contexto, idiomas ni licencia. El dato de parametros totales registrado en safetensors (6.789.424) resulta inconsistente con un modelo de la familia Llama-3-8B y no debe interpretarse como el tamano real del modelo.

La relevancia de este repositorio es practica: ofrece multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) que permiten ajustar el equilibrio entre calidad y consumo de memoria. Es util para desarrolladores que quieran probar el modelo base en GPUs de consumo o en CPU, pero no aporta informacion sobre el entrenamiento, los datos o el rendimiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Smaug, presumiblemente transformer tipo Llama; no confirmado en la informacion) |
| Parametros totales | no disponible (el valor de safetensors, 6.789.424, es inconsistente con el modelo base y no se considera fiable) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas a partir de pesos en formato HF/safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en este repositorio. El nombre del modelo base (abacusai/Smaug-Uncensored) sugiere una arquitectura transformer de la familia Llama, pero no se confirma en la informacion proporcionada. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

La unica informacion tecnica disponible se refiere al proceso de cuantizacion: las etiquetas de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y el uso de cuantizaciones ponderadas con imatrix (importance matrix). El autor lista un conjunto amplio de cuantizaciones, incluyendo variantes IQ (IQ1_S hasta IQ4_XS) y K-quants (Q2_K hasta Q6_K), lo que indica un pipeline de cuantizacion estandar de llama.cpp sobre los pesos del modelo base.

## Capacidades

- Generacion de texto: el modelo base esta disenado para generacion de texto autoregresiva, aunque no se detallan capacidades especificas en la informacion disponible.
- Modo "uncensored": el nombre del modelo base indica que se ha reducido o eliminado la alineacion de seguridad, lo que implica menor rechazo a peticiones sensibles.
- Razonamiento y codigo: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Evaluacion de modelos sin alineacion en entornos controlados: el modelo permite estudiar el comportamiento de un LLM sin filtros de seguridad, util para investigacion sobre sesgos y robustez, siempre en entornos aislados y con supervision.
- Despliegue en hardware de consumo: gracias a las cuantizaciones IQ2/IQ3 y Q4, puede ejecutarse en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, lo que facilita pruebas locales sin infraestructura dedicada.
- Prototipado rapido de aplicaciones de generacion de texto: las variantes Q4_K_M y Q5_K_M ofrecen un equilibrio razonable entre calidad y memoria para iterar en el desarrollo de prompts y pipelines.
- Generacion creativa y escritura asistida: el caracter uncensored del modelo base puede ser adecuado para ficcion o contenido creativo sin restricciones tematicas, con la debida revision humana.
- Investigacion sobre cuantizacion: el repositorio incluye mas de veinte variantes de cuantizacion, lo que permite comparar la degradacion de calidad entre IQ1, IQ2, IQ3, IQ4 y K-quants en un mismo modelo.
- Fine-tuning y experimentacion: los pesos cuantizados pueden servir como referencia para estudiar el impacto de la cuantizacion en tareas downstream, aunque para reentrenamiento se requeririan los pesos originales en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable, ya que no se conoce el tamano real del modelo base. Como referencia orientativa para un modelo de ~7-8B en GGUF: IQ2/IQ3 requieren aproximadamente 3-4 GB, Q4_K_M en torno a 4,5-5 GB y Q6_K alrededor de 6-7 GB, pero estos valores no estan confirmados para este repositorio.
- GPU recomendadas: no disponible. Para un modelo de ~7-8B cuantizado en Q4 serian suficientes GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB); no confirmado.
- Cabe en GPU de consumo: probablemente si en el rango de 8-16 GB para cuantizaciones Q4 e inferiores, segun el tamano real del modelo base, que no se especifica.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Smaug-Uncensored-i1-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantizaciones imatrix del modelo abacusai/Smaug-Uncensored |
| mradermacher/Llama-3-8B-Lexi-Smaug-Uncensored-GGUF | ~8B (segun nombre) | no disponible | no disponible | GGUF | Variante basada en Llama-3-8B con ajuste Lexi/Smaug |
| mradermacher/Llama-3-8B-Lexi-Smaug-Uncensored-i1-GGUF | ~8B (segun nombre) | no disponible | no disponible | GGUF | Misma variante con cuantizaciones imatrix |

La comparativa se limita a repositorios del mismo autor con nomenclatura similar, ya que no se dispone de datos de rendimiento ni de especificaciones del modelo base para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Falta de informacion: no se dispone de model card del modelo base, ni de datos de entrenamiento, licencia o idiomas, lo que dificulta evaluar su idoneidad para produccion.
- Modelo uncensored: la ausencia de alineacion de seguridad implica riesgo de generar contenido danino, ofensivo o ilegal; requiere supervision humana y filtros externos en cualquier despliegue publico.
- Riesgo de alucinacion: inherente a los LLM; no se han publicado evaluaciones de fiabilidad para este modelo.
- Parametros registrados inconsistentes: el valor de safetensors (6.789.424) no corresponde al tamano tipico de un modelo Smaug/Llama, por lo que no debe usarse para estimar requisitos de hardware.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (abacusai/Smaug-Uncensored) antes de cualquier uso en produccion.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 pueden degradar notablemente la coherencia y la calidad del texto; se recomienda Q4_K_M o superior para uso general.
- Sin garantias de soporte: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni mantenimiento documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Smaug-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Uncensored
- Repositorio relacionado (Llama-3-8B-Lexi-Smaug-Uncensored-GGUF): https://huggingface.co/mradermacher/Llama-3-8B-Lexi-Smaug-Uncensored-GGUF
- Repositorio relacionado (Llama-3-8B-Lexi-Smaug-Uncensored-i1-GGUF): https://huggingface.co/mradermacher/Llama-3-8B-Lexi-Smaug-Uncensored-i1-GGUF
