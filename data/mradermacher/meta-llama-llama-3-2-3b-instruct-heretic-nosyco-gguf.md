# mradermacher/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco-GGUF

## Resumen

Esta ficha corresponde a una cuantización GGUF del modelo **meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco**, publicada por el usuario **mradermacher** en Hugging Face. El modelo base es un fine-tuning de Llama 3.2 3B Instruct de Meta, realizado por UnstableLlama, con un enfoque aparentemente orientado a reducir la sycophancy (tendencia del modelo a complacer al usuario) y a un comportamiento más directo o "herético", tal como sugieren los identificadores "heretic" y "no-sycophancy" del repositorio.

Se trata de un modelo ligero de unos 3.200 millones de parámetros, basado en la arquitectura transformer decoder-only de la familia Llama 3.2, pensado para conversación (pipeline conversacional) y con soporte multilingüe en ocho idiomas, entre ellos el castellano. Su relevancia radica en la combinación de un tamaño reducido —ejecutable en hardware de consumo— con un ajuste fino especializado en honestidad y resistencia a la complacencia, algo valioso para asistentes que deben dar opiniones críticas o corregir al usuario en lugar de validarle siempre.

La versión de mradermacher no aporta pesos nuevos: es una colección de archivos GGUF en múltiples niveles de cuantización (el repo ocupa 29,3 GB), lo que permite ejecutar el modelo en CPU o GPUs modestas mediante llama.cpp, Ollama u otras herramientas compatibles con el formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en Llama 3.2 3B Instruct original es de 128.000 tokens) |
| Tipos de cuantizacion | GGUF en multiples niveles (el repo ocupa 29,3 GB; niveles exactos no disponibles) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.2 3B Instruct: un transformer decoder-only optimizado, sin mezcla de expertos, con 3.212,7 millones de parametros segun los metadatos de safetensors. La model card no detalla la longitud de contexto de esta variante, aunque la familia Llama 3.2 3B Instruct original de Meta ofrece 128.000 tokens de ventana de contexto.

Respecto al entrenamiento, la informacion disponible es escasa. El modelo base es un fine-tuning de UnstableLlama sobre Llama 3.2 3B Instruct, aparentemente enfocado en reducir la sycophancy (etiquetas "heretic" y "no-sycophancy"). No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de tecnicas como RLHF o DPO. La version de mradermacher es una cuantizacion posterior al formato GGUF sin modificaciones de pesos.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline conversacional).
- Razonamiento general y seguimiento de instrucciones, heredado de Llama 3.2 3B Instruct.
- Generacion y comprension de codigo a nivel basico-medio, tipico de un modelo de 3B.
- Comportamiento ajustado para reducir la complacencia hacia el usuario ("no sycophancy"), dando respuestas mas directas y criticas cuando procede.
- Soporte multilingue en ocho idiomas: ingles, aleman, frances, italiano, portugues, hindi, castellano y tailandes.
- Compatibilidad con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No hay evidencia de soporte nativo de vision, audio ni tool calling en la informacion disponible.

## Casos de uso

- **Asistente personal local y privado:** gracias al formato GGUF y su tamaño de 3B, puede ejecutarse en portatiles y PCs de consumo sin conexión a la nube, adecuado para quienes priorizan la privacidad de sus conversaciones.
- **Asistente que da opiniones honestas:** el fine-tuning anti-sycophancy lo hace util para escenarios donde el usuario necesita criticas francas, revisiones de codigo severas o validacion de ideas sin adulacion.
- **Chatbot multilingue ligero:** con soporte de castellano, portugues, frances, italiano, aleman, hindi y tailandes, puede integrarse en aplicaciones de atencion al usuario de bajo volumen en varios idiomas.
- **Prototipado y evaluacion de alineamiento:** util para investigadores que estudian la sycophancy en LLMs, permitiendo comparar el comportamiento de este fine-tuning frente al Llama 3.2 3B Instruct original.
- **Integracion en herramientas locales (Ollama, LM Studio, llama.cpp):** su tamaño permite desplegarlo como backend de asistentes en aplicaciones de escritorio o edge devices con GPU modesta o solo CPU.
- **Generacion asistida de contenido y resumenes:** para tareas de escritura, resumen y reescritura de textos en idiomas europeos principales, con latencias bajas en hardware de consumo.
- **Educacion y experimentacion:** adecuado como modelo de partida para aprender sobre cuantizacion, inferencia local y fine-tuning ligero, dado su bajo coste de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos comparativos frente al modelo base Llama 3.2 3B Instruct ni frente a otros fine-tunings anti-sycophancy.

## Requisitos de hardware

- **VRAM estimada para inferencia:** al ser un modelo de 3,2B parametros, las cuantizaciones GGUF tipicas ocupan aproximadamente entre 1,5-2 GB (Q2/Q3), 2-2,5 GB (Q4) y 3-4 GB (Q6/Q8). Estas cifras son estimaciones basadas en el tamaño del modelo, no datos publicados en la model card.
- **GPU recomendadas:** cualquier GPU consumer moderna con 4-6 GB de VRAM es suficiente para las cuantizaciones intermedias (RTX 3060, RTX 4060, RTX 4090 con holgura). Para CPU pura, cualquier procesador moderno con 8 GB de RAM es viable.
- **Cabe en consumer GPU:** si, holgadamente. Es ejecutable incluso en portatiles con GPU integrada potente y en Raspberry Pi 5 (con cuantizaciones agresivas y velocidad limitada).
- **Opciones de despliegue:** llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. La compatibilidad con vLLM o TGI no esta indicada para esta version GGUF (seria necesario el modelo base en safetensors).
- **Latencia y throughput:** no disponibles. Al ser un modelo de 3B cuantizado, se espera inferencia rapida en GPU consumer (decenas de tokens/segundo) y velocidad razonable en CPU moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco (este, GGUF) | 3,21B | no disponible (base: 128K) | Llama 3.2 Community | Fine-tuning anti-sycophancy, GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community | Modelo base de Meta, comportamiento estandar |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Qwen Research (no comercial sin permiso) | Fuerte en codigo y matematicas, multilingue |
| Phi-3.5-mini-instruct (3,8B) | 3,82B | 128.000 tokens | MIT | Licencia permisiva, buen rendimiento por tamaño |

Este modelo se diferencia de sus alternativas principalmente por su fine-tuning orientado a reducir la sycophancy, mientras que la mayoria de modelos de 3B mantienen el comportamiento conversacional estandar. Para uso comercial sin restricciones de marca, Phi-3.5-mini (licencia MIT) es mas flexible que la licencia Llama 3.2.

## Limitaciones y advertencias

- **Riesgo de alucinacion:** no disponible especificamente, pero al ser un modelo de 3B parametros, el riesgo de alucinacion es inherente y superior al de modelos de mayor escala. El fine-tuning anti-sycophancy podria, en teoria, hacer el modelo mas propenso a contradecir al usuario incluso cuando este tiene razon; no hay datos publicados que cuantifiquen este efecto.
- **Sesgos:** hereda los sesgos del entrenamiento de Llama 3.2 3B Instruct. No se ha publicado informacion sobre sesgos especificos introducidos por el fine-tuning de UnstableLlama.
- **Idioma:** aunque soporta ocho idiomas, el rendimiento en castellano puede ser inferior al del ingles, tipico de modelos de esta gama. No hay datos de calidad por idioma.
- **Licencia:** la Llama 3.2 Community License exige mostrar "Built with Llama", incluir el aviso de copyright y, si se deriva un nuevo modelo, incluir "Llama" en su nombre. Restringe el uso a entidades con menos de 700 millones de usuarios activos mensuales. Requiere aceptar la Acceptable Use Policy de Meta.
- **Falta de documentacion:** la model card del fine-tuning base no detalla metodologia, datos de entrenamiento ni evaluaciones, lo que dificulta evaluar su fiabilidad para produccion.
- **Contexto:** la longitud de contexto de esta variante no esta confirmada; si se asume la de Llama 3.2 3B Instruct (128K), el consumo de memoria en contextos largos sera significativo incluso con cuantizacion.
- **Advertencia de procedencia:** se trata de un fine-tuning comunitario (UnstableLlama) cuantizado por un tercero (mradermacher), no de un modelo oficial de Meta. Se recomienda validacion propia antes de uso en produccion.

## Enlaces

- Repositorio GGUF de mradermacher: https://huggingface.co/mradermacher/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco-GGUF
- Modelo base (fine-tuning de UnstableLlama): https://huggingface.co/UnstableLlama/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco
- Modelo original de Meta (referencia): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2 (referenciada en la model card): https://www.llama.com/llama-downloads
- Acceptable Use Policy de Llama: https://www.llama.com/llama3_2/use-policy
