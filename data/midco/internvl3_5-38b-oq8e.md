# midco/InternVL3_5-38B-oQ8e

## Resumen

El modelo `midco/InternVL3_5-38B-oQ8e` es una cuantización de 8 bits en formato MLX del modelo multimodal InternVL3.5-38B, desarrollado originalmente por el laboratorio OpenGVLab. Esta versión concreta ha sido generada por el usuario `midco` utilizando la herramienta oQ (oMLX v0.6.4) con precisión mixta, lo que permite ejecutar el modelo en hardware Apple Silicon mediante el ecosistema MLX. El modelo pertenece a la familia InternVL, una serie de modelos de lenguaje multimodal (MLLM) que combina un codificador de visión con un modelo de lenguaje de gran tamaño para tareas que requieren comprensión conjunta de imagen y texto.

La cuantización oQ8e reduce el peso del modelo a 8 bits con un tamaño de grupo de 64, manteniendo un equilibrio entre fidelidad y eficiencia. Aunque el nombre indica 38B, los parámetros totales reales según los safetensors son 14.777.170.304 (aproximadamente 14,8 mil millones), lo que sugiere que la arquitectura combina un codificador visual y un LLM base de menor tamaño. El repositorio ocupa 51 GB, lo que refleja la presencia de pesos cuantizados y posiblemente los componentes de visión sin cuantizar. Este modelo es relevante para desarrolladores que necesitan desplegar capacidades multimodales en entornos con restricciones de memoria, especialmente en Macs con chips unificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | internvl_chat (MLLM multimodal con codificador de vision y LLM) |
| Parametros totales | 14.777.170.304 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo original InternVL3.5-38B soporta hasta 128K, pero no se confirma en esta cuantizacion) |
| Tipos de cuantizacion | oQ8e (8 bits, group size 64, precision mixta) |
| Idiomas soportados | no disponible (el modelo original soporta multiples idiomas, pero no se especifica en esta version) |
| Licencia | no disponible (el modelo original InternVL3.5-38B usa licencia MIT, pero esta cuantizacion no la declara) |
| Formato de pesos | MLX safetensors (compatible con el ecosistema MLX de Apple) |

## Arquitectura y entrenamiento

La arquitectura `internvl_chat` corresponde a un modelo multimodal que integra un codificador de vision (típicamente un ViT de gran tamaño) con un modelo de lenguaje autoregresivo. En la familia InternVL3.5, el LLM base suele ser un modelo de la serie Qwen o similar, y el conjunto se entrena en dos fases: primero alineamiento vision-lenguaje y después fine-tuning instructivo con datos multimodales. El modelo original InternVL3.5-38B ha sido entrenado con un corpus extenso de imágenes y texto, incluyendo datos de razonamiento visual, OCR, diagramas y capturas de pantalla, y ha demostrado un rendimiento destacado en benchmarks como MMMU y tareas de agente multimodal.

La cuantización oQ8e aplicada aquí utiliza precision mixta: algunas capas se mantienen en mayor precision mientras que otras se reducen a 8 bits con un group size de 64. Esta técnica, implementada en la herramienta oMLX, busca minimizar la perdida de calidad en capas sensibles (como las de atencion) mientras reduce el uso de memoria. No se dispone de informacion sobre el dataset de entrenamiento especifico de esta cuantizacion, ya que es un proceso posterior al entrenamiento original.

## Capacidades

- Comprension multimodal: procesa imagenes y texto de forma conjunta, permitiendo responder preguntas sobre contenido visual, diagramas, graficos y capturas de pantalla.
- Razonamiento visual: capaz de realizar inferencias logicas sobre imagenes, como contar objetos, identificar relaciones espaciales o interpretar graficas.
- Generacion de texto: produce respuestas coherentes y contextualizadas en tareas de chat, resumen y redaccion.
- Soporte de tool calling: el modelo original InternVL3.5 incluye capacidades de llamada a funciones y uso de herramientas, aunque no se confirma si esta cuantizacion las preserva integramente.
- Capacidades de agente: el modelo original puede ejecutar tareas multi-paso en entornos simulados (como navegacion web o uso de aplicaciones), gracias a su entrenamiento con datos de agente.
- Multilingue: el modelo original soporta varios idiomas, incluyendo ingles, chino y otros, aunque esta version no declara explicitamente los idiomas soportados.
- Integracion con MLX: al estar cuantizado en formato MLX, se puede ejecutar de forma nativa en Macs con Apple Silicon usando la libreria mlx-lm.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede extraer informacion de facturas, formularios o contratos con texto e imagenes, gracias a su capacidad de OCR y comprension visual. Se usaria con mlx-lm para procesar documentos en lote en una Mac.
- Asistente de soporte tecnico con capturas de pantalla: un usuario envia una captura de pantalla de un error, y el modelo interpreta la imagen y sugiere soluciones. Adecuado por su capacidad de razonamiento visual y generacion de texto.
- Generacion de descripciones de productos para e-commerce: a partir de una foto del producto, el modelo genera una descripcion detallada y atractiva. Su tamaño cuantizado permite ejecutarlo en una estacion de trabajo con Apple Silicon.
- Automatizacion de pruebas de UI: el modelo puede analizar capturas de pantalla de una aplicacion y generar informes de errores o sugerencias de mejora, integrandose en pipelines de CI/CD mediante scripts Python con mlx-lm.
- Chatbot educativo multimodal: un asistente que responde preguntas sobre diagramas, mapas o formulas matematicas escritas a mano. La cuantizacion de 8 bits reduce la latencia en hardware Apple.
- Prototipado rapido de aplicaciones de vision por computador: investigadores pueden probar rapidamente capacidades multimodales sin necesidad de GPUs dedicadas, usando un Mac con suficiente RAM unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original InternVL3.5-38B ha demostrado un rendimiento solido en benchmarks como MMMU, DocVQA y ChartQA, pero no se dispone de datos especificos para esta cuantizacion oQ8e. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX, utiliza memoria unificada en Macs. Con 14,8 mil millones de parametros en 8 bits, el peso del modelo es aproximadamente 14,8 GB, mas overhead de activaciones y cache KV. Se recomienda un minimo de 32 GB de RAM unificada para inferencia comoda.
- GPU recomendadas: Apple Silicon con al menos 32 GB de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores). No requiere GPU NVIDIA.
- Compatibilidad con consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para hardware Apple. Para GPUs NVIDIA, habria que convertir los pesos a otro formato (GGUF o safetensors estandar).
- Opciones de despliegue: mlx-lm (libreria oficial de MLX), oMLX (herramienta de cuantizacion), y cualquier framework que soporte MLX. No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no disponible. Depende del chip concreto y de la longitud de la secuencia. En un M2 Max, se puede esperar una generacion de 10-20 tokens por segundo para modelos de este tamano, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InternVL3.5-38B (original) | 38B (aprox.) | 128K | safetensors (BF16) | MIT | HuggingFace |
| midco/InternVL3_5-38B-oQ8e | 14,8B (cuantizado) | no disponible | MLX safetensors (8-bit) | no disponible | HuggingFace |
| Qwen2.5-VL-32B | 32B | 128K | safetensors | Apache 2.0 | HuggingFace |
| LLaVA-1.6-34B | 34B | 4K | safetensors | Apache 2.0 | HuggingFace |

La comparativa se basa en los modelos originales, no en la cuantizacion. Esta version oQ8e reduce significativamente el numero de parametros efectivos (14,8B frente a 38B) gracias a la cuantizacion de 8 bits, lo que la hace mas ligera pero potencialmente con una ligera perdida de calidad. No se dispone de datos de rendimiento comparativo para esta cuantizacion concreta.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo original puede heredar sesgos de los datos de entrenamiento, especialmente en tareas que involucran genero, raza o cultura. No se ha realizado una evaluacion especifica de sesgos para esta cuantizacion.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento visual complejo o cuando la imagen es ambigua.
- Limitaciones de contexto: aunque el modelo original soporta hasta 128K de contexto, esta cuantizacion no declara la longitud de contexto efectiva. La cuantizacion de 8 bits puede afectar a la calidad en secuencias muy largas.
- Restricciones de licencia: la licencia no esta declarada en esta version. El modelo original usa MIT, pero se recomienda contactar con el autor de la cuantizacion para confirmar los terminos de uso.
- Compatibilidad limitada: al ser un formato MLX, solo se puede ejecutar en hardware Apple. No es portable a entornos Linux con GPUs NVIDIA sin una conversion previa.
- Calidad de la cuantizacion: la precision mixta oQ8e puede introducir degradacion en tareas que requieren alta fidelidad numerica, como calculos matematicos o razonamiento logico complejo. Se recomienda validar en el caso de uso especifico.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/midco/InternVL3_5-38B-oQ8e
- Repositorio del modelo original: https://huggingface.co/OpenGVLab/InternVL3_5-38B-HF
- Repositorio de la familia InternVL: https://github.com/OpenGVLab/InternVL
- Pagina oficial de InternVL: https://internvl.github.io/
- Herramienta de cuantizacion oMLX: https://github.com/jundot/omlx
