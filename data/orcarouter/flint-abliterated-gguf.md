# orcarouter/Flint-abliterated-GGUF

## Resumen

Flint-abliterated-GGUF es una versión cuantizada en formato GGUF del modelo Flint, desarrollado originalmente por RecursiveSI y redistribuido por el usuario orcarouter. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con aproximadamente 39.800 millones de parámetros totales, orientado a generación de texto, razonamiento, programación y flujos agénticos. La variante "abliterated" indica que se ha aplicado una técnica de eliminación de direcciones de rechazo en el espacio de activaciones, con el objetivo de reducir las negativas del modelo ante peticiones que el modelo base rechazaría.

El modelo se distribuye exclusivamente en formato GGUF, lo que lo hace compatible con llama.cpp y con los entornos de inferencia local que lo consumen (Ollama, LM Studio, entre otros). La presencia de las etiquetas "mixed-precision", "imatrix" y "gptq" sugiere que las cuantizaciones se han generado con matrices de importancia y precisión mixta para preservar la calidad en los niveles bajos de bits. El repositorio ocupa 36,4 GB y acumula cerca de 7.500 descargas y 73 "likes" en el momento de la consulta.

Es relevante ahora porque cubre un nicho concreto: usuarios que quieren ejecutar localmente un MoE de casi 40.000 millones de parámetros con capacidades de razonamiento y código, sin restricciones de alineación estrictas, y con licencia Apache 2.0. No obstante, el acceso está restringido (gated) y los idiomas declarados son únicamente inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 39.785.287.456 (~39,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con variantes de precisión mixta e imatrix (niveles concretos no disponibles) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo emplea una arquitectura Mixture of Experts, heredada del modelo base RecursiveSI/flint. Las etiquetas del repositorio mencionan "moe", "mixed-precision" e "imatrix", lo que indica que las cuantizaciones GGUF se han construido con matrices de importancia para minimizar la pérdida de calidad, y que algunas capas pueden mantener mayor precisión que otras dentro del mismo archivo. También aparece la etiqueta "gptq", aunque no se detalla si se refiere a un paso intermedio del pipeline de cuantización o a una variante adicional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La modificación "abliterated" consiste, en la práctica habitual, en la sustracción de la dirección de rechazo del espacio de activaciones, pero no se documentan en la información proporcionada los detalles concretos del procedimiento aplicado ni las capas afectadas. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento y resolución de problemas, según las etiquetas "reasoning" del repositorio.
- Generación y asistencia en programación ("coding").
- Flujos agénticos y razonamiento multi-paso ("agentic").
- Comportamiento "uncensored": la variante abliterated reduce los rechazos ante peticiones que el modelo base declinaría.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y uso conversacional.
- No se documenta soporte de tool calling, visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistencia de programación en local: el modelo puede integrarse en editores o pipelines de CI/CD para generar y revisar código, aprovechando su orientación a "coding" y su formato GGUF para ejecución sin dependencia de la nube.
- Razonamiento multi-paso sobre documentos: útil para tareas de análisis encadenado donde se requiere descomponer un problema en pasos, gracias a la etiqueta "agentic" y a la arquitectura MoE que reduce el coste computacional por token activo.
- Despliegue de agentes locales: al ser compatible con llama.cpp y distribuirse en GGUF, puede servir como motor de agentes en entornos aislados o con requisitos de privacidad, siempre que se trabaje en inglés o chino.
- Experimentación en investigación sobre alineación: la variante abliterated permite estudiar el comportamiento del modelo sin las direcciones de rechazo, comparándolo con el modelo base para analizar sesgos y mecanismos de negativa.
- Generación de contenido en inglés y chino: redacción, resumen y reescritura en ambos idiomas, con la ventaja de ejecución local y licencia Apache 2.0 para uso comercial.
- Prototipado rápido con Ollama o LM Studio: al estar en GGUF, se puede cargar en herramientas de escritorio para pruebas de concepto sin infraestructura dedicada.
- Fine-tuning posterior sobre la base cuantizada: aunque el GGUF no es el formato ideal para reentrenar, sirve para evaluar el comportamiento antes de invertir en la versión completa en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~39,8 B de parámetros, una cuantización de 4 bits ronda los 20-24 GB de pesos; una de 5-6 bits se sitúa en torno a 28-32 GB; una de 8 bits supera los 40 GB. Estas cifras son estimaciones por tamaño y no proceden de la información proporcionada.
- GPU recomendadas: para cuantizaciones altas, A100 80 GB, H100 o dos GPU de 24 GB en paralelo; para 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ser suficiente si el contexto es moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones de 4 bits y contexto limitado; en tarjetas de 16 GB probablemente no sin offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Flint-abliterated-GGUF | ~39,8 B (MoE) | no disponible | Apache 2.0 | GGUF | Variante sin censura, acceso restringido |
| Modelo base RecursiveSI/flint | no disponible | no disponible | no disponible | safetensors (presumible) | Referencia original sin abliteration |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Solo se declaran los idiomas inglés y chino; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- La modificación "abliterated" elimina las direcciones de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inexacto sin filtros; no es apta para despliegues públicos sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta variante.
- El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- No se documentan la longitud de contexto ni los parámetros activos, lo que dificulta planificar despliegues y estimar costes.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que la cadena de modelos base (RecursiveSI/flint) no imponga restricciones adicionales.
- El formato GGUF limita el fine-tuning directo; para reentrenar conviene partir del modelo base en safetensors.
- No hay información sobre sesgos específicos medidos, pero la eliminación de rechazos puede amplificar sesgos presentes en los datos de entrenamiento originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/Flint-abliterated-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
