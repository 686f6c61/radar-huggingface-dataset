# DronE900/Ministral-3-3B-Instruct-2512-GGUF

## Resumen

Ministral 3 3B Instruct 2512 es el modelo más pequeño de la familia Ministral 3 desarrollada por Mistral AI, un modelo de lenguaje compacto con capacidades de visión, orientado al despliegue en dispositivos edge y en hardware de consumo. Este repositorio, mantenido por DronE900, contiene la versión cuantizada en formato GGUF del modelo instruccional (post-trained para tareas de chat e instrucciones), lo que permite ejecutarlo con llama.cpp, Ollama y herramientas compatibles con GGUF.

El modelo combina un modelo de lenguaje de 3,4 mil millones de parámetros con un codificador de visión de 0,4 mil millones, y ofrece una ventana de contexto de 256k tokens, algo notable para su tamaño. Destaca por sus capacidades agénticas con function calling nativo y salida JSON estructurada, así como por su soporte multilingüe que incluye el castellano.

Su relevancia actual radica en la combinación de licencia Apache 2.0 (uso comercial permitido), capacidades multimodales y un tamaño que cabe en 8 GB de VRAM en FP8, posicionándolo como opción seria para asistentes locales, agentes ligeros y aplicaciones en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con codificador de visión (2 componentes: 3.4B LM + 0.4B vision encoder) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | GGUF con varios niveles de cuantizacion (niveles concretos no especificados en la model card) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (y "dozens of languages" segun Mistral) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base original en safetensors) |

## Arquitectura y entrenamiento

Ministral 3 3B consta de dos componentes arquitectonicos principales: un modelo de lenguaje de 3,4 mil millones de parametros y un codificador de vision de 0,4 mil millones, lo que permite analizar imagenes junto con texto. La variante Instruct ha pasado por un post-training para tareas de instruccion y chat.

No se han publicado detalles concretos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en la informacion disponible. El modelo base es mistralai/Ministral-3-3B-Instruct-2512, y se puede consultar el paper tecnico en arXiv (2601.08584) para mas detalle. Como recomendaciones de despliegue, Mistral sugiere temperatura inferior a 0,1 para entornos de produccion y mantener relacion de aspecto cercana a 1:1 en las imagenes de entrada.

## Capacidades

- **Vision**: analisis de imagenes y respuestas basadas en contenido visual, ademas de texto.
- **Multilingüe**: soporte de decenas de idiomas, incluidos castellano, ingles, frances, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- **System prompt**: fuerte adherencia y soporte de system prompts.
- **Agentic**: function calling nativo y salida JSON, orientado a sistemas agenticos.
- **Contexto largo**: ventana de contexto de 256k tokens.
- **Edge-optimized**: rendimiento en pequeña escala, desplegable en una amplia gama de hardware, incluso localmente.
- **Tool calling**: soporte nativo, con recomendacion de mantener el conjunto de herramientas reducido y bien definido.

## Casos de uso

- **Asistentes de chat locales y privados**: con 3,4B de parametros cabe en 8 GB de VRAM en FP8 (y menos cuantizado en GGUF), lo que permite ejecutar un asistente conversacional multilingüe sin enviar datos a la nube.
- **Agentes con function calling**: el soporte nativo de function calling y salida JSON lo hace adecuado para orquestar herramientas (busquedas, APIs, ejecucion de codigo) en flujos agenticos de varios pasos, siempre limitando el numero de herramientas.
- **Analisis de documentos e imagenes**: el codificador de vision permite extraer informacion de capturas, facturas o graficos; se recomienda recortar imagenes a relacion de aspecto cercana a 1:1.
- **Atencion al cliente automatizada**: la ventana de 256k tokens permite mantener conversaciones multi-turno y consultar documentos largos (manuales, politicas) dentro del contexto sin RAG obligatorio.
- **Aplicaciones edge e IoT**: disenado para despliegue en hardware variado, adecuado para dispositivos sin conexion o con ancho de banda limitado.
- **Extraccion estructurada de datos**: la salida JSON nativa facilita pipelines de extraccion de entidades, clasificacion y cumplimiento de esquemas en produccion.
- **Traduccion y redaccion multilingüe**: soporte oficial del castellano y otros diez idiomas listados, util para herramientas de escritura asistida en varios idiomas.
- **Integracion en CI/CD y automatizacion**: su tamaño reducido permite usarlo como modelo barato y rapido para tareas auxiliares (generacion de commit messages, resumenes de logs, revision ligera de codigo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para datos de rendimiento se puede consultar el paper tecnico en arXiv (2601.08584) y el blog oficial de Mistral.

## Requisitos de hardware

- **VRAM estimada**: cabe en 8 GB de VRAM en FP8 segun Mistral; en GGUF con cuantizaciones agresivas (Q4) el requisito baja aproximadamente a 2-3 GB para el LM (estimacion tipica para 3,4B de parametros; el valor exacto depende del nivel de cuantizacion, no especificado en la model card).
- **GPU recomendadas**: cualquier GPU moderna con 8 GB o menos de VRAM es suficiente; en edge, incluso integradas o CPUs dado el formato GGUF.
- **Consumer GPUs**: cabe comodamente en RTX 3060, RTX 4060, RTX 4070 y superiores; en cuantizaciones bajas tambien en GPUs de 4 GB.
- **CPU**: al estar en GGUF, es ejecutable en CPU con llama.cpp, adecuado para portatiles y mini-PC.
- **Opciones de despliegue**: llama.cpp, Ollama y cualquier runtime compatible con GGUF; la libreria asociada al modelo base es vLLM (con mistral-common), que soporta el modelo original en FP8.
- **Latencia y throughput**: no disponibles; al ser un modelo de 3,4B se espera latencia baja y throughput alto en hardware modesto, pero no hay cifras publicadas en la informacion proporcionada.
- **Ajustes recomendados**: temperatura por debajo de 0,1 para produccion; system prompt claro; numero de herramientas limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct 2512 | 3,4B (+0,4B vision) | 256k | Si | Apache 2.0 | GGUF (este repo) y base en Hugging Face |
| Qwen3 4B Instruct | ~4B | 32k-128k (no disponible con precision) | Segun variante | Apache 2.0 | safetensors y GGUF comunitarios |
| Llama 3.2 3B Instruct | 3,2B | 128k | Variante vision aparte (11B) | Llama Community License (restricciones) | safetensors y GGUF comunitarios |

Frente a Llama 3.2 3B, Ministral 3 3B ofrece contexto mayor (256k frente a 128k) y una licencia Apache 2.0 sin restricciones de uso. Frente a Qwen3 4B, destaca por el contexto mas largo y el enfoque agenticos con function calling nativo, aunque no se disponen de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- **Alucinaciones**: como todo modelo de lenguaje de pequeño tamaño, puede generar contenido incorrecto con fluidez; verificar salidas en usos criticos.
- **Vision**: el rendimiento se degrada con imagenes muy alargadas o estrechas; se recomienda relacion de aspecto cercana a 1:1 y recortar cuando sea necesario.
- **Temperatura**: Mistral recomienda temperatura inferior a 0,1 en produccion; temperaturas altas pueden degradar la coherencia y el cumplimiento de instrucciones.
- **Tools**: sobrecargar el modelo con un numero excesivo de herramientas reduce su eficacia; mantener el conjunto minimo necesario.
- **Cuantizaciones GGUF**: la cuantizacion puede degradar la calidad respecto al modelo original en FP8/bf16; evaluar cada nivel antes de usar en produccion.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, con la condicion de no infringir derechos de terceros (incluida propiedad intelectual).
- **Datos de entrenamiento**: la composicion del dataset no esta detallada en la informacion disponible, por lo que no es posible evaluar sesgos especificos documentados.
- **Idiomas**: aunque el castellano esta soportado oficialmente, el rendimiento en idiomas distintos del ingles puede ser inferior; no hay evaluaciones por idioma disponibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DronE900/Ministral-3-3B-Instruct-2512-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Blog oficial de Mistral: https://mistral.ai/news/mistral-3
- Paper tecnico (arXiv): https://arxiv.org/abs/2601.08584
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
