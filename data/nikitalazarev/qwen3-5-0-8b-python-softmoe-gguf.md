# NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE-GGUF

## Resumen

Qwen3.5-0.8B-Python-SoftMoE-GGUF es una cuantización en formato GGUF (Q8_0) del modelo Qwen3.5-0.8B-Python-SoftMoE, publicado por el desarrollador independiente NikitaLazarev. Se trata de un piloto de extremo a extremo ("e2e pilot") en el que se ha aplicado una técnica de *weight steering* sobre un modelo base Qwen3.5 de 0,8 mil millones de parámetros para especializarlo en el dominio del lenguaje Python y las PEP (Python Enhancement Proposals), empaquetando el resultado como un "experto" de una arquitectura Soft MoE.

El modelo tiene 772.845.888 parámetros reales según los pesos en safetensors y un tamaño de repositorio de aproximadamente 0,8 GB. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp, y el parche de direccionamiento de dominio (*steer patch*) está horneado directamente en los pesos, de modo que el modelo funciona en llama.cpp, LM Studio u Ollama sin necesidad de soporte especial en el runtime.

Su relevancia es acotada pero interesante para experimentación: demuestra un flujo de trabajo de especialización de dominio sobre modelos pequeños mediante weight steering y su empaquetado como experto Soft MoE en formato GGUF, lo que permite desplegar el resultado en hardware de consumo. No obstante, el repositorio no incluye información sobre licencia, idiomas, benchmarks ni pipeline, y cuenta con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Soft MoE (expertos sobre transformer Qwen3.5); pesos base Qwen3.5-0.8B |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizacion Q8_0); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros, al que se le aplica un parche de *weight steering* orientado al dominio "Python language & PEPs". El resultado se presenta como un experto dentro de un esquema Soft MoE, aunque la model card no detalla el número de expertos, el mecanismo de enrutamiento ni la proporción de parámetros activos por token. El parche de direccionamiento está integrado en los pesos finales, por lo que no requiere modificación del runtime para su uso.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La conversión a GGUF se realizó con la herramienta estándar de llama.cpp (`convert_hf_to_gguf.py`), y el proyecto se generó con Ivanna Lab, un laboratorio de modelos autoalojado.

## Capacidades

- Generación de texto conversacional en formato GGUF, compatible con endpoints (`endpoints_compatible`).
- Especialización declarada en lenguaje Python y PEPs mediante weight steering, orientada a contenido técnico de ese dominio.
- Ejecución en llama.cpp, LM Studio y Ollama sin soporte especial de runtime.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente de documentación de Python: el modelo puede generar y explicar fragmentos de código y referencias a PEPs gracias al direccionamiento de dominio horneado en los pesos, útil para prototipos de ayuda contextual en editores.
- Experimentación con Soft MoE en hardware de consumo: al ocupar aproximadamente 0,8 GB en Q8_0, permite probar el comportamiento de un experto especializado en portátiles o GPUs de gama baja sin infraestructura dedicada.
- Evaluación de weight steering como técnica de especialización: sirve como caso de estudio reproducible para investigadores que quieran comparar el direccionamiento de dominio frente a fine-tuning completo en modelos pequeños.
- Generación de snippets y ejemplos en Python: adecuado para tareas de autocompletado o generación de ejemplos acotados donde el contexto técnico de Python es relevante.
- Despliegue local en Ollama o LM Studio: integrable en flujos de trabajo de desarrollo personal para consultas rápidas sobre sintaxis y convenciones de Python sin depender de la nube.
- Base para pipelines de destilación o evaluación de expertos: el artefacto GGUF puede emplearse como experto de referencia en sistemas de enrutamiento o ensembles experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1 GB en Q8_0, según el tamaño del repositorio (0,8 GB) y el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; también es viable en CPU mediante llama.cpp.
- Cabe en GPU consumer: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores; incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (formato GGUF nativo).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Python-SoftMoE-GGUF | 772.845.888 | no disponible | no disponible | GGUF Q8_0 | Experto Soft MoE con steering a Python/PEPs |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | safetensors | Modelo base sin especialización |
| Qwen3.5-0.8B-Python-SoftMoE | ~0,8B | no disponible | no disponible | safetensors | Versión sin cuantizar del mismo experto |

No se dispone de datos de rendimiento comparativo ni de especificaciones de contexto y licencia para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que limita la planificación de aplicaciones multilingües o de contexto largo.
- El modelo es un piloto experimental ("e2e pilot") con cero descargas y cero likes; no hay evidencia de validación por parte de la comunidad.
- Riesgo de alucinación inherente a un modelo de 0,8 mil millones de parámetros, especialmente en dominios fuera de Python y PEPs.
- El weight steering puede introducir sesgos hacia el dominio objetivo y degradar el rendimiento en tareas generales.
- No se han publicado benchmarks, por lo que no es posible estimar su calidad relativa frente a alternativas.
- La cuantización Q8_0 introduce una pérdida de precisión respecto a los pesos originales en safetensors, aunque menor que en cuantizaciones más agresivas.

## Enlaces

- [Hugging Face: NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE-GGUF](https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE-GGUF)
- [Modelo base: Qwen3.5-0.8B-Python-SoftMoE](https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE)
- [Ivanna Lab (GitHub)](https://github.com/wiskeone/ivanna-lab)
