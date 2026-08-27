# sodan/dan-omni-3b

## Resumen

**dan-omni-3b** es un modelo multimodal (texto + visión) de 3.000 millones de parámetros, desarrollado por el autor "sodan" como parte de la familia **Dan Omni** de asistentes ligeros para dispositivos móviles y edge. Se basa en el modelo **Qwen2.5-Omni-3B** de Alibaba, sobre el que se aplica un fine-tuning con LoRA (r=16, alpha=32) utilizando datos de instrucción optimizados para entornos con recursos limitados. El modelo está cuantizado en GGUF (Q4_K_M para el texto y Q8_0 para la proyección de visión), lo que permite ejecutarlo en CPU sin GPU dedicada.

El problema que resuelve es el de llevar capacidades multimodales (comprensión de imágenes y generación de texto) a dispositivos con poca memoria y potencia de cálculo, como portátiles, mini-PCs o teléfonos. Su relevancia actual radica en la tendencia hacia modelos pequeños y eficientes que puedan desplegarse localmente, sin depender de la nube. Con una ventana de contexto de 4096 tokens y un peso total de unos 3,5 GB (texto + visión), se posiciona como una opción compacta dentro del segmento de modelos de 3B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni-3B) |
| Parametros totales | 3.397.103.616 (3,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q4_K_M (texto), Q8_0 (proyeccion de vision) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache-2.0 (declarada por el autor; el modelo base Qwen2.5-Omni-3B tiene licencia no comercial) |
| Formato de pesos | GGUF (texto) + mmproj GGUF (vision) |

## Arquitectura y entrenamiento

El modelo parte de **Qwen2.5-Omni-3B**, un modelo end-to-end multimodal desarrollado por Alibaba que percibe texto, imagenes, audio y video, y genera texto y habla natural en streaming. Sobre esta base, el autor aplica un fine-tuning con **LoRA** (r=16, alpha=32) utilizando un conjunto de datos de instrucciones orientado a moviles. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset.

La innovacion principal reside en la **cuantizacion mixta**: los pesos del modelo de texto se cuantizan a Q4_K_M (~2,0 GB) mientras que la proyeccion de vision se mantiene en Q8_0 (~1,5 GB), lo que permite mantener una calidad razonable en la comprension de imagenes sin disparar el tamano total. El modelo se distribuye en formato GGUF, compatible con llama.cpp y Ollama, y no requiere GPU para inferencia.

## Capacidades

- **Generacion de texto**: responde a preguntas generales, redacta textos, resuelve problemas de matematicas y genera codigo.
- **Razonamiento multi-paso**: resuelve problemas logicos y aritmeticos con varios pasos (puntuacion 8/10 en la evaluacion del autor).
- **Vision**: puede describir imagenes y responder preguntas sobre ellas mediante el archivo de proyeccion multimodal (mmproj).
- **Escritura creativa**: genera poemas y textos con coherencia tematica (puntuacion 7/10).
- **Seguimiento de instrucciones**: respeta formatos especificos, como listas numeradas (puntuacion 9/10).
- **Traduccion**: el system prompt indica capacidad de traduccion, aunque solo se declara el ingles como idioma soportado.
- **Sin tool calling**: no se menciona soporte para llamadas a funciones ni integracion con herramientas externas.
- **Sin modo thinking**: no dispone de un modo de razonamiento explicito tipo "think" como otros modelos de la familia Qwen.

## Casos de uso

- **Asistente personal en movil**: el modelo esta optimizado para ofrecer respuestas concisas y naturales en dispositivos con poca RAM. Puede integrarse en aplicaciones de chat local mediante Ollama o llama.cpp, funcionando sin conexion.
- **Descripcion de imagenes en edge**: gracias a su componente de vision, puede analizar fotografias o capturas de pantalla directamente en el dispositivo, util para aplicaciones de accesibilidad o catalogacion de productos.
- **Generacion de codigo en entornos sin GPU**: desarrolladores que trabajan en portatiles modestos pueden usarlo para autocompletar funciones o explicar fragmentos de codigo, con una velocidad de ~11 tokens por segundo en CPU.
- **Tutor de matematicas basico**: resuelve problemas aritmeticos y algebraicos sencillos, adecuado para aplicaciones educativas offline.
- **Redaccion de correos y mensajes**: genera borradores de textos formales o informales en ingles, con un estilo conciso gracias al fine-tuning.
- **Chat conversacional en quioscos o dispositivos embebidos**: su tamano reducido (2,0 GB) permite desplegarlo en mini-PCs o Raspberry Pi con 8 GB de RAM, ofreciendo un asistente local sin latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card del autor incluye mediciones de velocidad y evaluaciones de calidad subjetivas, realizadas en un Intel i9-9880H @ 2.30GHz con 16 GB de RAM y runtime Ollama. Estos datos son declarados por el autor y no han sido verificados de forma independiente.

| Categoria | Velocidad media (tok/s) | Velocidad prompt (tok/s) | Tokens generados | Tiempo (s) | Puntuacion calidad (sobre 10) |
|---|---|---|---|---|---|
| Razonamiento | 11,1 | 24,3 | 127 | 19,5 | 8 |
| Codigo | 11,6 | 106,1 | 25 | 3,0 | 9 |
| Escritura creativa | 11,4 | 137,2 | 34 | 3,7 | 7 |
| Seguimiento de instrucciones | 11,4 | 127,2 | 35 | 3,8 | 9 |
| Matematicas | 11,3 | 81,0 | 62 | 6,7 | 8 |
| Conocimiento general | 11,3 | 126,3 | 84 | 8,3 | 9 |
| **Promedio** | **11,3** | **100,4** | **61** | **7,5** | **8,7** |

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; el modelo completo (texto + vision) ocupa ~3,5 GB en disco. En GPU, cabria en tarjetas con 4 GB de VRAM o mas.
- **GPU recomendadas**: cualquier GPU con 4 GB+ (GTX 1060, RTX 2060, RTX 3050, etc.) para acelerar la inferencia. En CPU, funciona con 16 GB de RAM (probado por el autor).
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de gama media y baja.
- **Opciones de despliegue**: Ollama (`ollama pull sodan/dan-omni-3b`), llama.cpp (`llama-cli` para texto, `llava-cli` para multimodal), y transformers (parcial, segun la model card).
- **Latencia y throughput**: ~11,3 tokens por segundo en CPU (Intel i9-9880H), con velocidad de prompt de ~100 tokens por segundo. En GPU se espera una mejora significativa, aunque no se proporcionan datos.

## Comparativa con modelos similares

La model card del autor incluye una comparativa con otros modelos, aunque algunos de ellos (Gemma 4, Command-R7B, LFM2.5) no son verificables de forma independiente. Se presentan los datos declarados por el autor:

| Modelo | Parametros | Tamano (Q4) | Velocidad (tok/s) | Contexto | Multimodal |
|---|---|---|---|---|---|
| **dan-omni-3b** | 3B | 2,0 GB | 11,3 | 4K | Si (texto+vision) |
| Qwen2.5-3B | 3B | ~1,9 GB | ~12 | 32K | No |
| SmolLM2-1.7B | 1,7B | ~0,9 GB | ~55 | 8K | No |
| Gemma 4 E2B (segun autor) | 2,3B eff | ~1,4 GB | ~35 | 128K | Si |
| Command-R7B (segun autor) | 7B | ~4,0 GB | ~8 | 128K | No |

Frente a Qwen2.5-3B, el modelo dan-omni-3b anade capacidades de vision a costa de reducir el contexto de 32K a 4K. Frente a SmolLM2-1.7B, es mas lento pero ofrece multimodalidad y un tamano similar en terminos de memoria. La principal ventaja declarada es ser el unico modelo de 3B con vision en formato GGUF optimizado para movil.

## Limitaciones y advertencias

- **Discrepancia de licencia**: el modelo base Qwen2.5-Omni-3B esta licenciado bajo la **Qwen Research License Agreement** de Alibaba, que restringe el uso comercial. El autor declara Apache-2.0 para dan-omni-3b, pero esta declaracion no ha sido verificada y podria entrar en conflicto con la licencia del modelo base. Antes de usar en produccion, es imprescindible revisar la legalidad del fine-tuning.
- **Contexto limitado**: 4096 tokens es una ventana corta para tareas que requieran documentos largos o conversaciones extensas.
- **Solo ingles**: no se garantiza un rendimiento adecuado en otros idiomas, a pesar de que el system prompt mencione traduccion.
- **Sin tool calling**: no puede integrarse con APIs o herramientas externas, lo que limita su uso en agentes autonomos.
- **Riesgo de alucinacion**: al ser un modelo de 3B, es propenso a inventar datos o razonamientos incorrectos en temas especializados.
- **Sesgos no evaluados**: no se han publicado estudios de sesgos o robustez.
- **Datos de rendimiento no verificados**: las mediciones de velocidad y calidad provienen del autor y no han sido replicadas por terceros.
- **Fecha de creacion inusual**: el modelo fue creado en agosto de 2026, lo que sugiere que podria tratarse de un artefacto experimental o de una fecha erronea en los metadatos.

## Enlaces

- [HuggingFace: sodan/dan-omni-3b](https://huggingface.co/sodan/dan-omni-3b)
- [GitHub: QwenLM/Qwen2.5-Omni](https://github.com/QwenLM/Qwen2.5-Omni)
- [GitHub: QwenLM/Qwen3-Omni](https://github.com/QwenLM/Qwen3-Omni)
- [VentureBeat: Qwen swings for a double with 2.5-Omni-3B model](https://venturebeat.com/ai/qwen-swings-for-a-double-with-2-5-omni-3b-model-that-runs-on-consumer-pcs-laptops)
- [InsiderLLM: Qwen3 Complete Guide](https://insiderllm.com/guides/qwen3-complete-guide/)
