# AIIA-research/adult-chat-guardrail

## Resumen

Adult Chat Guardrail es un conjunto de dos clasificadores binarios de texto desarrollados por AIIA-research para moderar chat conversacional adulto. Dado un mensaje de usuario, cada modelo devuelve la probabilidad de que la petición solicite contenido prohibido; el guardrail se ejecuta en CPU antes del generador de respuestas y bloquea los mensajes marcados como inseguros.

Las dos variantes son independientes y no están en cascada: una se basa en intfloat/multilingual-e5-small (~118 MB en int8) y otra en Alibaba-NLP/gte-multilingual-base (~340 MB en int8). Ambas se entrenaron con SetFit sobre un dataset sintético de 6000 ejemplos, de los cuales 2500 son inseguros, se exportaron a ONNX y se cuantizaron a int8. Soporta inglés y ruso, y se distribuye bajo licencia MIT.

Su relevancia es práctica: ofrece un filtro ligero, desplegable en CPU y con métricas de validación declaradas (recall de inseguros del 96,95 % para E5 y 98,36 % para GTE, con un FPR de seguros inferior al 0,7 %). No es un LLM generativo ni un sistema de cumplimiento legal; implementa una política de contenido concreta y requiere validación sobre tráfico real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza de clasificación logística sobre embeddings congelados (SetFit); dos variantes independientes: E5 y GTE |
| Parámetros totales | No disponible en la información proporcionada; modelos base: intfloat/multilingual-e5-small (~118 MB en int8) y Alibaba-NLP/gte-multilingual-base (~340 MB en int8) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; los ejemplos de entrenamiento tienen entre 20 y 100 palabras (mediana de 50) |
| Tipos de cuantización | int8 (ONNX) |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.int8.onnx), con tokenizer.json, tokenizer_config.json, special_tokens_map.json y config.json |

## Arquitectura y entrenamiento

Cada variante combina un encoder transformer multilingüe preentrenado con una cabeza de regresión logística ajustada sobre embeddings congelados mediante SetFit. La cabeza se calibra con Platt scaling en un conjunto de validación, se exporta a ONNX y se cuantiza a int8; la calibración se repite después de la cuantización. La variante E5 requiere el prefijo `query: ` en la entrada, mientras que la variante GTE recibe el texto sin prefijo.

El entrenamiento utiliza un dataset sintético de 6000 ejemplos, de los cuales 2500 son inseguros. Los ejemplos tienen una longitud mínima de 20 palabras, una mediana de 50 y un máximo de 100. Los idiomas principales son inglés y ruso. No se documenta el uso de RLHF, DPO ni ajuste generativo, ni el número total de tokens de entrenamiento. Tampoco se incluyó ofuscación —leet speak o sustitución de scripts mixtos— en los datos de entrenamiento.

## Capacidades

- Clasificación binaria de texto: devuelve la probabilidad de que un mensaje solicite o describa contenido prohibido.
- Categorías inseguras: contenido sexual con menores, contenido sexual con animales o crueldad animal, gore gráfico con desmembramiento o mutilación extrema, y odio racial o religioso dirigido a un grupo.
- Categorías seguras: contenido sexual consentido entre adultos, pornografía adulta legal y prácticas sexuales adultas comunes; la ausencia de declaración explícita de edad no se trata como violación. La violencia ficticia sin gore gráfico también se considera segura.
- Soporte multilingüe limitado a inglés y ruso.
- Inferencia en CPU mediante ONNX Runtime, con pesos int8 de ~118 MB (E5) y ~340 MB (GTE).
- Probabilidades calibradas con Platt scaling, lo que permite ajustar el umbral de decisión.
- Dos variantes con distinto equilibrio entre tamaño y rendimiento: GTE obtiene mejor recall y menor FPR, mientras que E5 es más ligera.
- No es un modelo generativo: no genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no tiene capacidades de visión o audio.
- No detecta ofuscación por sí mismo; el autor remite a un detector determinista separado incluido en el nodo de ComfyUI.

## Casos de uso

- Moderación previa a la generación en un chat adulto: el clasificador se ejecuta en CPU, puntúa el mensaje del usuario y bloquea o deja pasar la petición antes de invocar al generador; su tamaño int8 permite mantenerlo cargado de forma permanente.
- Filtrado de prompts en plataformas de contenido para adultos: puede integrarse como servicio ONNX independiente que valida cada mensaje entrante y registra la probabilidad para auditoría.
- Protección de menores y prevención de CSAM: la categoría de contenido sexual con menores se marca como insegura; el guardrail actúa como primera barrera y deriva los casos al equipo de confianza y seguridad.
- Moderación de comunidades y comentarios: en foros o chats donde se comparte contenido adulto, el modelo separa peticiones consentidas entre adultos de gore, odio o crueldad animal.
- Triaje y revisión humana: las puntuaciones calibradas permiten ordenar los mensajes por riesgo y priorizar la revisión manual en lugar de aplicar un bloqueo binario.
- Despliegue en entornos con recursos limitados o edge: al ocupar ~118 MB (E5) o ~340 MB (GTE) en int8, puede ejecutarse en servidores pequeños, contenedores o portátiles sin GPU.
- Automatización de flujos en ComfyUI: el nodo proporcionado por el autor carga los modelos ONNX y permite insertar el guardrail en pipelines de generación de imágenes o texto.
- Investigación y ajuste de umbrales: las probabilidades calibradas y las dos variantes permiten estudiar el equilibrio entre recall y falsos positivos en distintos tipos de tráfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un clasificador binario y no un LLM generativo. Las únicas métricas aportadas son las de validación del propio clasificador, medidas tras la cuantización int8 y con un umbral de decisión de 0,5:

| Modelo | Unsafe recall | Safe FPR | Unsafe precision |
|---|---|---|---|
| e5 | 0,9695 | 0,0069 | 0,9928 |
| gte | 0,9836 | 0,0046 | 0,9952 |

## Requisitos de hardware

- CPU: es el entorno previsto. Los pesos int8 ocupan ~118 MB (E5) y ~340 MB (GTE); el consumo total depende del runtime de ONNX y del tokenizador.
- GPU: no es necesaria. Cabe en cualquier GPU consumer, pero no se documentan requisitos de VRAM ni latencias.
- Memoria: el repositorio completo ocupa 0,5 GB; en ejecución solo se carga la variante elegida.
- Despliegue: ONNX Runtime y el nodo de ComfyUI del autor. No se proporcionan integraciones para vLLM, llama.cpp, Ollama o TGI, y no están indicadas para un clasificador de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Recomendación: usar E5 si se prioriza el tamaño y GTE si se prioriza el recall (0,9836 frente a 0,9695) y el FPR (0,0046 frente a 0,0069).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas externas en la información proporcionada. La comparación cuantitativa fiable se limita a las dos variantes del propio guardrail:

| Modelo | Modelo base | Tamaño int8 | Idiomas | Licencia | Unsafe recall | Safe FPR | Unsafe precision |
|---|---|---|---|---|---|---|---|
| e5 | intfloat/multilingual-e5-small | ~118 MB | en, ru | MIT | 0,9695 | 0,0069 | 0,9928 |
| gte | Alibaba-NLP/gte-multilingual-base | ~340 MB | en, ru | MIT | 0,9836 | 0,0046 | 0,9952 |

Frente a clasificadores de moderación basados en LLM generativos, esta propuesta es mucho más pequeña y barata de ejecutar en CPU, pero no ofrece razonamiento, explicaciones ni cobertura multilingüe amplia. No se han encontrado en la información disponible métricas comparables de Llama Guard, OpenAI Moderation u otros sistemas similares.

## Limitaciones y advertencias

- El entrenamiento se realizó con datos sintéticos; el rendimiento sobre tráfico real de usuarios puede diferir del medido en validación.
- No detecta ofuscación, como leet speak o sustitución de scripts mixtos; el autor indica que se necesita un detector determinista separado para esos casos.
- Solo cubre inglés y ruso; otros idiomas quedan fuera del alcance declarado.
- Los ejemplos de entrenamiento tienen entre 20 y 100 palabras; mensajes muy cortos o muy largos pueden quedar fuera de la distribución esperada.
- La política de contenido es específica: no evalúa la legalidad en ninguna jurisdicción concreta y no sustituye una determinación legal.
- La ausencia de declaración de edad no se trata como violación, lo que puede ser un riesgo de política para determinados productos.
- Incluso con el umbral de 0,5, existen falsos positivos y falsos negativos: el FPR de seguros es del 0,69 % en E5 y del 0,46 % en GTE, y el recall de inseguros deja entre un 1,64 % y un 3,05 % de casos no detectados en validación.
- Las métricas proceden de una validación sintética y calibrada; no hay validación independiente ni resultados de benchmarks estándar.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo y la política de contenido sigue siendo del operador.
- No debe utilizarse como único mecanismo de seguridad en sistemas que manejen contenido sexual, menores o violencia extrema.

## Enlaces

- HuggingFace: https://huggingface.co/AIIA-research/adult-chat-guardrail
- Repositorio del nodo ComfyUI: https://github.com/AIIA-research/adult-chat-guardrail
- Modelo base E5: https://huggingface.co/intfloat/multilingual-e5-small
- Modelo base GTE: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos no guardan relación con este modelo.
