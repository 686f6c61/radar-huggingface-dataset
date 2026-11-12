# KarinaSh/llm-course-hw3-lora

## Resumen

KarinaSh/llm-course-hw3-lora es un modelo de generacion de texto publicado en Hugging Face por el usuario KarinaSh, aparentemente como entrega de un trabajo practico de un curso sobre modelos de lenguaje (el identificador incluye "llm-course-hw3-lora"). El nombre sugiere un ajuste fino mediante LoRA sobre una base de la familia Mistral, aunque el autor no documenta ni la receta de entrenamiento ni el modelo base exacto en la model card, que es la plantilla autogenerada de Hugging Face sin rellenar.

El repositorio contiene pesos en formato safetensors con 300.031.872 parametros totales (aproximadamente 300 millones), lo que lo situa en la gama de modelos pequenos, muy por debajo de los 7B habituales de la familia Mistral. El tamano del repositorio es de 1,2 GB. La libreria declarada es transformers y las etiquetas incluyen mistral, text-generation, conversational y endpoints_compatible.

Su relevancia practica es limitada: no tiene descargas ni likes, la licencia y los idiomas no estan declarados, y no se han publicado resultados de evaluacion. Debe tratarse como un artefacto educativo o experimental, no como un modelo listo para produccion. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca como "no disponible" todo lo que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "mistral"; detalles no disponibles) |
| Parametros totales | 300.031.872 (~300 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 1,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta "mistral" y la libreria transformers, lo que apunta a una arquitectura transformer decoder-only con atencion causal, probablemente derivada de un modelo Mistral pequeno. El nombre del repositorio indica un ajuste fino con LoRA (Low-Rank Adaptation), tecnica que congela los pesos base e introduce matrices de bajo rango entrenables en las proyecciones de atencion y MLP. Sin embargo, no se especifica el modelo base, el rango de las matrices LoRA, el dataset utilizado, el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

Tampoco se documentan hiperparametros de entrenamiento (precision, regimen, hardware), ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico paper citado en la model card es el de Lacoste et al. (2019) sobre el calculo de emisiones de carbono, que forma parte de la plantilla por defecto y no aporta informacion sobre el modelo. En consecuencia, la arquitectura y el proceso de entrenamiento deben considerarse no verificados.

## Capacidades

- Generacion de texto autoregresiva, segun la etiqueta text-generation.
- Uso conversacional multi-turno, segun la etiqueta conversational.
- Compatibilidad con Text Generation Inference (etiqueta text-generation-inference) y con endpoints compatibles.
- Carga mediante la libreria transformers.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no documentadas.
- Soporte de agentes o multi-step reasoning: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Prototipado educativo: usar el modelo para practicar el flujo completo de carga con transformers, generacion de texto y evaluacion cualitativa en un cuaderno de clase, dado su tamano reducido y su origen como entrega de curso.
- Experimentacion con LoRA: servir como referencia para estudiar como se publican adaptadores LoRA y como se combinan con un modelo base, comparando el repositorio con el checkpoint original.
- Pruebas de integracion con TGI: desplegar el modelo en un servidor Text Generation Inference para validar pipelines de inferencia con un modelo de ~300 M de parametros y bajo coste de computo.
- Generacion de texto de baja latencia en CPU: por su tamano, puede ejecutarse en entornos sin GPU para tareas de generacion corta, siempre que se acepte la ausencia de garantias de calidad.
- Evaluacion comparativa de ajustes finos: medir el efecto del ajuste LoRA frente al modelo base en tareas controladas, como clasificacion de texto o respuesta a preguntas simples.
- Docencia sobre riesgos de publicacion: analizar la model card como caso de estudio de documentacion insuficiente (licencia, idiomas y evaluacion sin declarar) antes de reutilizar un modelo de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,6 GB solo para pesos (300 M de parametros), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,3 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,15 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (nativo), Text Generation Inference (etiqueta declarada) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque no se publican conversiones oficiales.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KarinaSh/llm-course-hw3-lora | ~300 M | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste LoRA sin documentar |
| Mistral-7B (referencia de la familia) | ~7,2 B | 32 K (segun version) | Apache 2.0 | Amplia | Modelo base de referencia, mucho mayor |
| TinyLlama-1.1B | ~1,1 B | 2 K (segun version) | Apache 2.0 | Amplia | Alternativa pequena con documentacion completa |
| SmolLM-135M / 360M | 135 M / 360 M | 2 K (segun version) | Apache 2.0 | Amplia | Rango de tamano comparable, con benchmarks publicados |

La comparacion es estructural: el modelo de KarinaSh carece de licencia, idiomas, contexto y evaluacion declarados, por lo que no es equiparable en trazabilidad a las alternativas citadas.

## Limitaciones y advertencias

- Model card autogenerada y sin rellenar: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion.
- Riesgo elevado de alucinacion y de respuestas incoherentes por la ausencia de evaluacion publicada y el reducido tamano del modelo.
- Licencia no declarada: no puede asumirse permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Modelo base no identificado: imposibilita reproducir el ajuste o auditar los datos utilizados.
- Cero descargas y cero likes: sin senales de uso comunitario ni validacion externa.
- No apto para produccion sin una evaluacion propia previa y una clarificacion de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/KarinaSh/llm-course-hw3-lora
- Paper citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact#compute
