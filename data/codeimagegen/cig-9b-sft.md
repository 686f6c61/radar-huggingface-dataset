# CodeImageGen/CIG-9B-SFT

## Resumen

CIG-9B-SFT es un modelo de generación de imágenes por código desarrollado por CodeImageGen. Se trata de un ajuste fino supervisado (SFT) sobre Qwen/Qwen3.5-9B, un modelo de lenguaje de 8.953.803.264 parámetros (8,95 mil millones) con arquitectura transformer de la familia Qwen 3.5, especializado en la etiqueta `qwen3_5_text`. En lugar de generar píxeles directamente, el modelo produce un programa JavaScript a partir de una descripción textual; la imagen final se obtiene renderizando ese programa en un navegador Chrome sin interfaz (headless Chrome).

El modelo aborda el problema de la generación texto-a-imagen desde un enfoque programático: el prompt del usuario se traduce a código ejecutable que dibuja la escena solicitada. Esta aproximación permite, en principio, un control composicional explícito sobre los elementos de la imagen, ya que el programa intermedio es inspeccionable y editable. El repositorio ocupa 18,4 GB e incluye pesos en fp16 fusionados, además de una cabeza MTP (`model-mtp.safetensors`) opcional para decodificación especulativa.

La relevancia de este modelo radica en su carácter abierto (licencia Apache 2.0) y en que forma parte de una familia más amplia de variantes de 9B y 27B (IPR, IR, PR, avgR, SFT) publicadas junto a un conjunto de datos de ajuste (CIG-SFT-35k) y un artículo de referencia. El modelo se publicó el 27 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, etiqueta `qwen3_5_text`), ajuste fino SFT; pesos fp16 fusionados |
| Parametros totales | 8.953.803.264 (8,95 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye fp16 fusionado; `model-mtp.safetensors` para decodificación especulativa) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9 mil millones de parámetros, y se somete a un ajuste fino supervisado (SFT) para la tarea de generación de imágenes basada en código. La model card indica explícitamente `Training: SFT` y `Reward: none`, es decir, no se empleó optimización por recompensa (RLHF/RLPO) en esta variante concreta; las variantes IPR, IR, PR y avgR de la familia parecen corresponder a etapas posteriores de optimización con recompensas, mientras que SFT es la línea base supervisada.

Los pesos se distribuyen en fp16 con fusión de adaptadores, de modo que el modelo se carga directamente con transformers sin necesidad de combinar checkpoints. El repositorio incluye además `model-mtp.safetensors`, una cabeza de predicción multi-token (MTP) pensada para decodificación especulativa, lo que puede acelerar la generación del programa JavaScript. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset (más allá de la referencia al conjunto CIG-SFT-35k) ni detalles sobre el proceso de renderizado durante la evaluación.

## Capacidades

- Generación de código JavaScript a partir de descripciones textuales en lenguaje natural, orientado a dibujar escenas mediante APIs de canvas o DOM en el navegador.
- Generación de imágenes indirecta: la imagen se obtiene renderizando el programa resultante en headless Chrome, no mediante un decodificador de difusión.
- Conversación multi-turno (etiqueta `conversational` en el repositorio), lo que permite refinar el programa generado a partir de correcciones del usuario.
- Decodificación especulativa opcional mediante la cabeza MTP incluida en el repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de ilustraciones programáticas para documentación técnica: el modelo produce código JavaScript que dibuja diagramas o escenas simples, lo que permite versionar la imagen como código en el repositorio y regenerarla de forma determinista.
- Prototipado rápido de assets web: un desarrollador describe un elemento gráfico y obtiene un programa que lo renderiza, listo para integrarse en una página o convertirse en SVG/canvas.
- Edición iterativa de imágenes mediante conversación: gracias a la etiqueta `conversational`, el usuario puede pedir cambios ("cambia el fondo a azul", "añade un árbol a la derecha") y el modelo reescribe el programa correspondiente.
- Investigación en generación texto-a-imagen basada en código: el modelo sirve como línea base SFT para comparar con variantes con optimización por recompensa (IPR, IR, PR, avgR) dentro del benchmark GenEval2.
- Generación de visualizaciones de datos reproducibles: el programa JavaScript puede dibujar gráficos sencillos a partir de una descripción, con la ventaja de que el código resultante es auditable y modificable.
- Automatización de pruebas de renderizado: al generar programas que se ejecutan en headless Chrome, el modelo puede emplearse para producir casos de prueba de motores de renderizado o de APIs de canvas.
- Docencia y experimentación con modelos de 9B: su licencia Apache 2.0 y su tamaño permiten desplegarlo en entornos académicos para estudiar la relación entre código generado y calidad de imagen.

## Benchmarks y rendimiento

La model card reporta resultados en GenEval2: GM 26,4 y AM 57,5. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ni comparaciones numéricas con modelos similares en la información disponible.

| Benchmark | Metrica | Resultado |
|---|---|---|
| GenEval2 | GM | 26,4 |
| GenEval2 | AM | 57,5 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 18 GB solo para los pesos (8,95 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 24 GB o más para contexto moderado.
- Cuantización: no se documentan versiones GGUF ni cuantizaciones oficiales; al ser un modelo transformers en safetensors fp16, sería necesario cuantizarlo externamente (por ejemplo, con bitsandbytes o GPTQ) para reducir requisitos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con contexto limitado. En GPUs consumer de 16 GB o menos no cabría en fp16 sin cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no se mencionan en la información disponible, aunque al ser un modelo transformers estándar podrían ser compatibles previa conversión.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificación especulativa, lo que en principio reduce la latencia de generación, pero no se publican cifras.
- Requisito adicional: el pipeline de evaluación requiere un entorno con headless Chrome y el repositorio `codeimagegen/codeimagegen` para renderizar las imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIG-9B-SFT | 8,95B | No disponible | Texto-a-imagen via codigo JavaScript | Apache 2.0 | Hugging Face |
| CIG-9B-IPR | No disponible | No disponible | Variante con optimizacion por recompensa | No disponible | Hugging Face |
| CIG-27B-SFT | No disponible (familia 27B) | No disponible | Texto-a-imagen via codigo, mayor escala | No disponible | Hugging Face |
| CIG-27B-IPR | No disponible (familia 27B) | No disponible | Variante 27B con optimizacion por recompensa | No disponible | Hugging Face |

No se dispone de datos de benchmarks de las variantes 27B ni de modelos de difusión comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo no genera píxeles directamente: la calidad final depende del renderizador (headless Chrome) y del entorno de ejecución del código JavaScript, lo que introduce variabilidad entre plataformas.
- Riesgo de que el código generado contenga errores, referencias a APIs no disponibles o construcciones no deterministas, lo que puede producir imágenes vacías o incorrectas.
- Al ser un modelo ajustado solo con SFT y sin recompensa (`Reward: none`), es previsible que rinda por debajo de las variantes IPR/IR/PR/avgR de la misma familia en métricas de fidelidad al prompt; los resultados GenEval2 reportados (GM 26,4) son moderados.
- No se documentan sesgos conocidos, idiomas soportados ni evaluación de seguridad; se desconoce el comportamiento en prompts sensibles.
- La longitud de contexto no está especificada, lo que dificulta planificar conversaciones largas o prompts complejos.
- Aunque la licencia es Apache 2.0, debe verificarse la licencia del modelo base Qwen/Qwen3.5-9B y de las dependencias del renderizador antes de un uso comercial en producción.
- El repositorio no registra descargas ni likes y se publicó recientemente (noviembre de 2026), por lo que carece de validación comunitaria independiente.
- La ejecución de código JavaScript generado por un modelo en un navegador headless supone un riesgo de seguridad si no se aísla el entorno (sandboxing, límites de recursos, bloqueo de red).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeImageGen/CIG-9B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código y entorno de renderizado: https://github.com/codeimagegen/codeimagegen
- Dataset CIG-SFT-35k: https://huggingface.co/datasets/codeimagegen/CIG-SFT-35k
- CIG-27B-IPR: https://huggingface.co/codeimagegen/CIG-27B-IPR
- CIG-27B-IR: https://huggingface.co/codeimagegen/CIG-27B-IR
- CIG-27B-PR: https://huggingface.co/codeimagegen/CIG-27B-PR
- CIG-27B-avgR: https://huggingface.co/codeimagegen/CIG-27B-avgR
- CIG-27B-SFT: https://huggingface.co/codeimagegen/CIG-27B-SFT
- CIG-9B-IPR: https://huggingface.co/codeimagegen/CIG-9B-IPR
- Articulo de referencia: Wang, N., Liang, Z., Leng, X., Zheng, L. "Code-based Image Generation: Benchmarking, Baselines, and Improved Rewards", arXiv preprint, 2026 (sin URL disponible en la informacion proporcionada).
