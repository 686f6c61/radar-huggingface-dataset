# mindchain/imajev-4b-full-GGUF

## Resumen

Imajev-4B es un modelo de decisión multimodal (image-text-to-text) publicado por el usuario mindchain como un barrido completo de cuantizaciones en formato GGUF para llama.cpp. Está construido sobre el modelo base Qwen/Qwen3.5-4B y cuenta con 4.205.751.296 parámetros (~4,2B). El repositorio contiene una serie de cuantizaciones de 21 niveles agrupadas en cuatro familias (K-Quant, IQ-Quant con importance matrix, ternarización TQ y variantes Unsloth), creadas automáticamente el 2026-10-04.

El interés de este lanzamiento es doble. Por un lado, ofrece muchas alternativas de compresión para un mismo modelo, de modo que un desarrollador puede escoger entre calidad y consumo de VRAM. Por otro, es un ejemplo transparente de publicación de artefactos: el propio autor advierte que los ficheros están construidos, pero no medidos, y que cada archivo es un candidato, no un resultado validado.

Conviene subrayarlo desde el principio: la model card insiste en que no se ha medido la perplexidad, ni la precisión del readout de decisión frente a respuestas de referencia, ni la desviación de distribución respecto a la referencia sin cuantizar. La única comprobación realizada es que cada fichero es más pequeño que su fuente f16 (entre un 47 % y un 85 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada de Qwen/Qwen3.5-4B; detalle interno no disponible |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | K-Quant (Q3_K_S … Q8_0, 9 niveles, sin i-matrix); IQ-Quant (IQ2_XXS … IQ4_NL, 10 niveles, con importance matrix); ternarización (TQ2_0, TQ1_0); Unsloth (IQ1_XXXS, IQ1_XXS, IQ1_XS) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); requiere además un fichero mmproj f16 para visión |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Modelo base | Qwen/Qwen3.5-4B |
| Repositorio | mindchain/imajev-4b-full-GGUF |
| Tamano del repo | 8,7 GB |
| Pipeline | image-text-to-text |
| Biblioteca | gguf |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Se sabe que es multimodal (procesa texto e imagen) y que deriva de Qwen/Qwen3.5-4B, por lo que su estructura base corresponde a la del modelo de referencia de Qwen, sin que la model card detalle número de capas, atención, tipo de normalización ni dimensiones. El autor lo etiqueta como "decision-model", lo que indica que su tarea principal es seleccionar entre opciones (devuelve "Optionsbuchstaben", es decir, letras de opción) en lugar de generar texto libre.

No se documentan datos de entrenamiento: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO u otras fases de alineación. Tampoco se describe ninguna innovación técnica propia del modelo (atención lineal, decodificación especulativa, etc.). Lo que sí se documenta es el proceso de cuantización posterior: las variantes IQ se construyeron con una importance matrix derivada de un conjunto de calibración específico de la tarea (15 buckets de temperatura provenientes de `calibration.json`, con 3 tipos de pregunta × 5 conjuntos de opciones). El autor señala que cambiar el conjunto de calibración altera qué pesos se protegen y puede invertir el orden de calidad entre variantes.

## Capacidades

- Generación de decisiones con formato de opción: el modelo devuelve letras de opción ("Optionsbuchstaben"), lo que apunta a un uso como clasificador o selector entre alternativas.
- Sensibilidad a la temperatura como señal de calibración: la importance matrix se construyó sobre 15 buckets de temperatura, lo que sugiere que el comportamiento del modelo varía de forma relevante con este parámetro.
- Comprensión de imagen (multimodal): requiere cargar el fichero mmproj f16 junto al modelo principal. Sin la proyección, el servidor responde `image input is not supported`.
- Conversación multi-turno: el modelo está etiquetado como "conversational".
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante infraestructura de inferencia compatible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento, matemáticas y generación de código: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).

## Casos de uso

- Selección automática entre opciones en encuestas o paneles: el modelo puede recibir un enunciado con un conjunto de opciones y devolver la letra elegida, integrándose en un pipeline que normalice la salida.
- Clasificación asistida con imagen: usando el fichero mmproj, se pueden plantear tareas donde la decisión dependa de una imagen más un enunciado (por ejemplo, revisión visual con opciones predefinidas).
- Experimentación con cuantización para investigación: el repositorio permite comparar 21 niveles de compresión del mismo modelo y estudiar el efecto de la importance matrix frente a las K-Quants sin i-matrix.
- Despliegue en hardware limitado: las variantes IQ1/IQ2 y TQ permiten ejecutar el modelo en GPUs de gama baja o incluso en CPU, a costa de una degradación de calidad aún no medida.
- Servicio conversacional ligero: con la variante Q4_K_M puede montarse un endpoint conversacional multimodal de bajo coste usando llama.cpp o llama-server.
- Referencia de control en evaluaciones: la variante Q8_0, recomendada por el autor como referencia, puede usarse como línea base al comparar el resto de niveles de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se han medido perplexidad, readout de decisión contra respuestas de referencia ni desviación de distribución contra la referencia sin cuantizar. La única métrica aportada es la reducción de tamaño respecto a la fuente f16, entre un 47 % y un 85 %, que verifica que la cuantización se ha aplicado pero no dice nada sobre calidad. El autor indica que la medición comparativa se realiza en el repositorio haddock-development/quantization.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones a partir del número de parámetros (4,2B) y de los bits por peso típicos de cada nivel, no datos medidos por el autor.

- Q8_0: ~4,5 GB de pesos. Referencia de máxima calidad del barrido.
- Q6_K: ~3,5 GB.
- Q5_K_M: ~3,0 GB.
- Q4_K_M: ~2,5 GB. Recomendado por el autor como equilibrio entre VRAM y calidad.
- IQ4_XS: ~2,3 GB. Misma tasa de bits que Q4_K_M pero con importance matrix.
- Q3_K: ~2,0 GB.
- IQ2_M: ~1,4 GB.
- IQ1 (XXXS/XXS/XS): en torno a 1 GB o menos.
- Fichero mmproj f16: varios cientos de MB adicionales si se usa visión.
- GPU recomendadas: cualquier GPU con 6-8 GB o más para las cuantizaciones bajas; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB o superiores para las cuantizaciones altas; A100/H100 si se sirve en producción con lotes grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 8 GB o más, usando Q4_K_M o inferior. Con 6 GB conviene bajar a IQ4_XS o Q3_K.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (importando el GGUF) y LM Studio. Para visión hay que pasar siempre `--mmproj` con el fichero f16 correspondiente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa se ofrece sobre atributos públicos de cada modelo; no hay datos de rendimiento medidos para Imajev-4B.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Imajev-4B (este) | ~4,2B | no disponible | Texto + imagen | apache-2.0 | GGUF |
| Qwen3-4B | ~4B | 32K (nativo, ampliable) | Texto | apache-2.0 | safetensors, GGUF |
| Gemma 3 4B | ~4B | 128K | Texto + imagen | Gemma license | safetensors, GGUF |
| Llama 3.2 3B | ~3B | 128K | Texto | Llama license | safetensors, GGUF |

La diferencia principal de Imajev-4B frente a estas alternativas no es de capacidad bruta, sino de enfoque: está orientado a tareas de decisión con salida de opción y se distribuye exclusivamente como barrido de cuantizaciones GGUF. Los otros modelos cuentan con datos de benchmarks publicados, mientras que Imajev-4B no aporta ninguno.

## Limitaciones y advertencias

- Calidad no medida: el autor advierte que los ficheros están construidos, no medidos. No hay perplexidad, ni precisión de decisión frente a respuestas de referencia, ni desviación de distribución publicadas.
- Cada fichero es un candidato, no un resultado validado. El propio repositorio lo describe así.
- La i-matrix se calibró con un conjunto específico de la tarea de decisión (15 buckets de temperatura, 3 tipos de pregunta × 5 conjuntos de opciones). Su comportamiento en otras tareas puede degradarse de forma distinta.
- Las cuantizaciones extremas (IQ1, IQ2, TQ) son muy agresivas y no hay evidencia publicada de que conserven utilidad para la tarea objetivo.
- El modelo base Qwen3.5-4B puede tener sus propios sesgos, que se heredan en todas las cuantizaciones. No se documentan sesgos específicos.
- Riesgo de alucinación: no evaluado. No hay datos de fiabilidad.
- Idiomas soportados: no declarados, lo que dificulta planificar despliegues multilingües.
- Contexto máximo: no disponible.
- Visión supeditada al fichero mmproj: sin él, el servidor devuelve `image input is not supported` aunque el modelo cargue.
- Exclusión deliberada de Q4_0, Q5_0, Q5_1, Q2_K y Q2_K_S por parte del autor.
- El modelo tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- Licencia: el modelo se publica bajo apache-2.0, pero siguen aplicando los términos del modelo base Qwen/Qwen3.5-4B, que conviene revisar antes de un uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mindchain/imajev-4b-full-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de medición comparativa: https://github.com/haddock-development/quantization
- llama.cpp (runtime de los GGUF): https://github.com/ggml-org/llama.cpp
