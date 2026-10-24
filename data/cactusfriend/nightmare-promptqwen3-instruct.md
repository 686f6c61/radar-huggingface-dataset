# cactusfriend/nightmare-promptqwen3-instruct

# Nightmare-promptqwen3-instruct

## Resumen

Nightmare-promptqwen3-instruct es un adaptador LoRA (librería PEFT 0.19.1) publicado por el usuario cactusfriend sobre el modelo denso Qwen/Qwen3-1.7B. Según su escueta model card, se trata de la versión "instruct" del modelo nightmare-promptqwen3 y está pensado para alimentar un nodo de InvokeAI que, en palabras del autor, todavía no existía en el momento de publicarlo. No se documenta el conjunto de datos, el número de tokens de entrenamiento, el rango del adaptador ni los módulos objetivo, y el repositorio apenas ocupa 0,1 GB, coherente con un adaptador de bajo rango y no con un modelo completo.

El objetivo funcional es la generación de prompts para modelos texto-a-imagen (estilo Stable Diffusion / sintaxis Compel de InvokeAI), una línea de trabajo que el mismo autor ya había explorado con nightmare-promptgen, un nodo de InvokeAI para generar prompts y modelos GPT-Neo pequeños entrenados con prompts en formato InvokeAI/Compel. La relevancia actual es, por tanto, muy acotada: se trata de un experimento de fine-tuning con SFT (TRL) sobre un modelo base pequeño, sin descargas ni valoraciones en el momento de la consulta, sin licencia declarada y sin evaluación publicada.

Al estar construido sobre Qwen3-1.7B, hereda las características del base: arquitectura transformer densa, 32.768 tokens de contexto nativos (ampliables a 131.072 con YaRN), modo "thinking" y cobertura multilingüe amplia según la documentación de Qwen. Sin embargo, no hay evidencia publicada de que el adaptador preserve esas capacidades; lo único verificable es su propósito declarado de generación de prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3 (modelo base Qwen/Qwen3-1.7B) |
| Parametros totales | No disponible para el adaptador (repositorio de 0,1 GB); el modelo base declara 1,7 mil millones |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No especificada para el adaptador; el base Qwen3-1.7B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | Adaptador distribuido en safetensors (precision no declarada); el base admite cuantizacion de 8 y 4 bits (bitsandbytes) y GGUF tras fusionar el adaptador |
| Idiomas soportados | No disponible en la model card; el base Qwen3 declara cobertura de 119 idiomas |
| Licencia | No disponible para el adaptador; el modelo base Qwen3-1.7B se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere carga como adaptador o fusion con el base |
| Rango y alpha de LoRA | No disponible |
| Modulos objetivo del adaptador | No disponible |
| Framework de entrenamiento | TRL (SFT) segun etiquetas; PEFT 0.19.1 segun la model card |
| Tamano del repositorio | 0,1 GB |
| Descargas / valoraciones | 0 descargas / 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Las etiquetas del repositorio indican `peft`, `lora`, `sft` y `trl`, lo que sitúa el entrenamiento en un ajuste supervisado clásico sobre pares instrucción-respuesta, sin indicios de RLHF, DPO u otras fases de alineamiento. La model card no aporta ni el volumen de datos, ni su composición, ni los hiperparámetros del adaptador (rango, alpha, dropout, módulos objetivo, tasa de aprendizaje, épocas). Tampoco se documenta si el adaptador se aplicó únicamente a las proyecciones de atención o también a las capas MLP.

El modelo base Qwen3-1.7B, según su documentación pública, es un transformer denso con atención de tipo grouped-query, entrenado sobre un corpus multilingüe de gran escala y con soporte de modo de razonamiento explícito ("thinking"). Dispone de 32.768 tokens de contexto nativo y puede extenderse a 131.072 mediante escalado YaRN, además de un vocabulario de aproximadamente 151.000 tokens. El adaptador hereda la tokenizador y la arquitectura del base, pero no se ha publicado ninguna innovación técnica propia; su único elemento diferencial es el dominio declarado de los datos (generación de prompts para InvokeAI/Stable Diffusion), que no se puede verificar.

## Capacidades

- Generación de texto condicionada por instrucciones: es la función declarada del adaptador (variante "instruct" del modelo original del autor).
- Generación de prompts para modelos texto-a-imagen, presumiblemente en sintaxis InvokeAI/Compel, aunque la model card no aporta ejemplos ni formato exacto.
- Conversación multi-turno: la etiqueta `conversational` aparece en los tags del repositorio, pero no hay evidencia de evaluación.
- Capacidades heredadas del base Qwen3-1.7B (razonamiento, código, matemáticas, multilingüismo, modo thinking): atribuibles al modelo base, no verificadas tras la aplicación del adaptador.
- Tool calling / function calling: soportado por Qwen3-1.7B según su documentación; no confirmado en el adaptador y potencialmente degradado por el ajuste SFT.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Visión y audio: no soportados (modelo exclusivamente de texto).
- Capacidad especial destacable: ninguna documentada; el interés es la especialización en un dominio muy concreto (prompts para difusión).

## Casos de uso

- Generación de prompts en InvokeAI: uso previsto por el autor. El adaptador se cargaría sobre Qwen3-1.7B en un nodo de InvokeAI (tipo nightmare-promptgen) para transformar una idea en un prompt de difusión con pesos y sintaxis Compel. Es adecuado por su tamaño reducido, que permite ejecutarlo junto al pipeline de difusión en la misma GPU.
- Prototipado de pipelines texto-a-imagen: generación masiva de variaciones de prompt (estilos, negativos, refuerzos de término) para comparar resultados en Stable Diffusion sin salir de un entorno local.
- Enriquecimiento de datasets de imagen: creación de descripciones y variaciones de caption para aumentar un dataset antes de entrenar un LoRA de difusión; el coste de inferencia de un 1,7B es bajo frente a modelos mayores.
- Experimentación con PEFT: caso de estudio real de un adaptador LoRA SFT publicado en HuggingFace, útil para reproducir el flujo `PeftModel.from_pretrained` sobre Qwen3-1.7B en docencia o investigación de fine-tuning de bajo coste.
- Asistente de texto local en hardware modesto: con cuantización de 4 bits el conjunto base+adaptador cabe en GPUs de 8 GB, lo que permite tareas de generación corta totalmente offline; requiere validar la calidad porque no hay evaluación.
- Banchmarking interno de instrucciones: servir como línea base "especializada vs. generalista" frente a Qwen3-1.7B sin adaptador en tareas de redacción de prompts; útil para medir si el SFT aporta ganancia real.
- Automatización de pruebas de regresión en herramientas de prompting: alimentar un arnés de tests que compare prompts generados por distintas versiones del adaptador y detecte cambios de formato (por ejemplo, corchetes o pesos alterados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas, y el autor no ha publicado comparaciones frente a Qwen3-1.7B ni frente a sus modelos anteriores. Tampoco existe una evaluación específica del dominio (calidad de prompts para difusión) que permita afirmar que el adaptador mejora al base en esa tarea.

## Requisitos de hardware

- VRAM del adaptador: alrededor de 0,1 GB en disco; en memoria, decenas de MB en función de la precisión y del rango efectivo.
- VRAM del conjunto completo: Qwen3-1.7B en bf16 ocupa aproximadamente 3,4 GB de pesos; con caché KV para 8.000 tokens conviene reservar entre 4,5 y 6 GB. En cuantización de 4 bits los pesos bajan a unos 1,2-1,5 GB y el total se sitúa en 2,5-3,5 GB (estimaciones, no medidas publicadas para este adaptador).
- GPUs recomendadas: H100 o A100 para servir muchas peticiones concurrentes con vLLM; RTX 4090 o L40S para desarrollo con buena latencia; RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB son suficientes para inferencia en bf16.
- GPUs de consumo: sí cabe. Cualquier GPU con 6 GB o más puede ejecutar el conjunto en bf16 con contexto moderado; con 4 bits funciona en GPUs de 4-8 GB (GTX 1650 4 GB al límite, RTX 3050 8 GB, RTX 4060 8 GB). En Apple Silicon, un Mac con 16 GB unificados lo ejecuta con holgura.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador con el base), vLLM con soporte de adaptadores LoRA (`--enable-lora`), TGI con adaptadores, y llama.cpp u Ollama tras fusionar el adaptador con el base y convertir el resultado a GGUF (estos dos últimos no cargan el adaptador LoRA sin fusionar en el flujo estándar).
- Latencia y throughput: no hay mediciones publicadas para este adaptador. Como referencia del base de 1,7B, en una RTX 4090 con vLLM en bf16 se suele superar la centena de tokens por segundo con lotes pequeños, y en CPU la generación cae a pocos tokens por segundo; son estimaciones orientativas, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion | Enfoque |
|---|---|---|---|---|---|---|
| nightmare-promptqwen3-instruct | Adaptador LoRA sobre base de 1,7 mil millones | No declarado (base: 32.768 tokens) | No disponible | safetensors (PEFT) | Model card minima, 0 descargas | Prompts para InvokeAI/Stable Diffusion |
| nightmare-promptqwen3 | No disponible | No disponible | No disponible | No disponible | Model card practicamente vacia | Version previa, sin variante instruct documentada |
| Qwen/Qwen3-1.7B | 1,7 mil millones | 32.768 tokens nativos; 131.072 con YaRN | Apache 2.0 | safetensors, GGUF en la comunidad | Documentacion completa y benchmarks publicados | Modelo generalista con modo thinking y 119 idiomas |
| nightmare-promptgen 3 (cactusfriend) | 457,2 millones | No disponible | No disponible | No disponible | Ficha en LLM Explorer con VRAM estimada de 1,8 GB | Generacion de prompts con modelos tipo GPT-Neo para el nodo nightmare-promptgen |

Frente a Qwen3-1.7B, el adaptador no ofrece datos que demuestren mejora en ninguna métrica y pierde la garantía de licencia clara. Frente a nightmare-promptgen 3, el salto de 457 millones a 1,7 mil millones de parámetros debería traducirse en mejor seguimiento de instrucciones y mayor coherencia, pero no hay ninguna comparación publicada que lo respalde.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del adaptador. Aunque el base es Apache 2.0, la ausencia de licencia explícita impide asumir uso comercial libre; hay que contactar con el autor antes de integrarlo en producción.
- Ausencia total de evaluación: no hay benchmarks, ejemplos de salida ni métricas de calidad de prompt, por lo que no se puede afirmar que el ajuste mejora al modelo base.
- Metadatos poco fiables: la fecha de creación registrada (24 de octubre de 2026) es posterior a la de los modelos Qwen3 a los que dice adaptarse, lo que sugiere un error de configuración del repositorio y obliga a tratar el resto de metadatos con cautela.
- Conjunto de datos no documentado: se desconoce la procedencia de los datos de SFT, con el riesgo asociado de sesgos, datos con derechos de autor y sobreajuste a la sintaxis concreta de InvokeAI/Compel.
- Riesgo de alucinación: un modelo de 1,7 mil millones de parámetros genera con facilidad contenido inventado o incoherente, especialmente fuera del dominio de prompts; el adaptador puede haber estrechado aún más su distribución.
- Posible degradación de capacidades del base: un SFT intensivo sobre un dominio estrecho puede erosionar el multilingüismo, el modo thinking y el soporte de tool calling de Qwen3-1.7B; no hay datos para descartarlo.
- Dependencia funcional no resuelta: el propio autor indica que el nodo de InvokeAI para el que fue concebido no existía al publicar el modelo, por lo que no hay una ruta de uso soportada de extremo a extremo.
- Adopción nula: cero descargas y cero valoraciones implican ausencia de validación por terceros, de informes de errores y de mantenimiento demostrable.
- Contexto efectivo incierto: aunque el base soporte 32.768 tokens, no se ha validado que el adaptador mantenga el rendimiento en ventanas largas.
- Requiere descargar el modelo base (unos 3,4 GB en bf16) además del adaptador, lo que conviene tener en cuenta en entornos con ancho de banda o almacenamiento limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cactusfriend/nightmare-promptqwen3-instruct
- Modelo previo del autor: https://huggingface.co/cactusfriend/nightmare-promptqwen3
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Ficha en Free2AITools: https://free2aitools.com/model/cactusfriend/nightmare-promptqwen3
- Ficha de nightmare-promptgen 3 en LLM Explorer: https://llm-explorer.com/model/cactusfriend%2Fnightmare-promptgen-3,3KknLuc7LNmwCXHCA58P4A
- Repositorio del nodo nightmare-promptgen para InvokeAI: https://github.com/gogurtenjoyer/nightmare-promptgen/blob/main/README.md
