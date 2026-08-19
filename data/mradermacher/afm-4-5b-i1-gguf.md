# mradermacher/AFM-4.5B-i1-GGUF

## Resumen

AFM-4.5B-i1-GGUF es una colección de cuantizaciones GGUF del modelo base AFM-4.5B, desarrollado por Arcee AI. Esta versión, preparada por mradermacher, utiliza la técnica de cuantización con importancia matrix (imatrix) para optimizar la relación calidad-tamaño, ofreciendo más de veinte variantes que van desde 1.3 GB hasta 3.9 GB. El modelo original tiene 4.619.189.760 parámetros (aproximadamente 4.6B) y una licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 4.6B en hardware de consumo, desde portátiles con 4 GB de VRAM hasta GPUs de gama media, gracias a las distintas opciones de cuantización. El modelo es multilingüe (inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino) y está orientado a tareas conversacionales, como indica su etiqueta "conversational". No se dispone de información pública sobre la arquitectura interna ni los datos de entrenamiento del modelo base, por lo que esta ficha se centra en los aspectos prácticos de su despliegue y uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de Arcee AI, presumiblemente transformer decoder-only) |
| Parametros totales | 4.619.189.760 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, IQ4_XS, Q3_K_L, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura del modelo base AFM-4.5B en la información proporcionada. Dado que Arcee AI desarrolla modelos transformer decoder-only (como sus series Arcee-Lite y Arcee-7B), es razonable asumir una arquitectura similar, pero no hay confirmación oficial. Tampoco se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de alineación como RLHF o DPO. La cuantización imatrix de mradermacher se basa en la distribución de importancia de los pesos, lo que mejora la calidad de las cuantizaciones de baja precisión en comparación con métodos estáticos.

## Capacidades

- Generación de texto y conversación multilingüe: soporta 11 idiomas, incluyendo español, inglés, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino.
- Orientado a tareas conversacionales: la etiqueta "conversational" sugiere que el modelo está afinado para mantener diálogos multi-turno.
- Compatible con ecosistemas GGUF: puede ejecutarse con llama.cpp, Ollama, LM Studio, etc.
- No se ha confirmado soporte para tool calling, razonamiento avanzado, código o matemáticas; la información disponible no lo especifica.

## Casos de uso

- Chatbots de atención al cliente en entornos con recursos limitados: gracias a su tamaño (4.6B) y las cuantizaciones pequeñas (desde 1.3 GB), puede desplegarse en servidores modestos o incluso en edge devices para gestionar consultas en varios idiomas.
- Asistentes virtuales multilingües: su soporte para 11 idiomas lo hace adecuado para aplicaciones que requieren interacción en mercados internacionales sin necesidad de modelos separados por idioma.
- Generación de contenido en español y otros idiomas: redacción de correos, resúmenes, borradores de artículos o respuestas automáticas en foros, aprovechando su capacidad conversacional.
- Clasificación y análisis de texto: puede usarse como base para tareas de clasificación de sentimiento o extracción de información en múltiples idiomas, aunque requiere ajuste fino para tareas específicas.
- Prototipado rápido de aplicaciones NLP: al ser de tamaño pequeño y con licencia Apache 2.0, es ideal para pruebas de concepto y MVP sin costes de licencia.
- Despliegue en hardware de consumo: por ejemplo, una Raspberry Pi con 8 GB de RAM puede ejecutar la cuantización IQ2_M (1.8 GB) para tareas de chat básicas, mientras que una GPU con 6 GB de VRAM puede manejar la Q4_K_M (3.0 GB) con buen rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo cuantizado. Se recomienda consultar la página del modelo base (arcee-ai/AFM-4.5B) para posibles métricas, aunque no se han proporcionado en esta ficha.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. La siguiente tabla muestra el tamaño de archivo de cada variante (aproximado, según la tabla de la model card):

| Tipo | Tamaño (GB) | VRAM mínima recomendada (para cargar el modelo) |
|---|---|---|
| IQ1_S | 1.3 | 2 GB |
| IQ1_M | 1.4 | 2 GB |
| IQ2_XXS | 1.5 | 2 GB |
| IQ2_XS | 1.6 | 2 GB |
| IQ2_S | 1.7 | 2 GB |
| IQ2_M | 1.8 | 2 GB |
| Q2_K_S | 1.8 | 2 GB |
| Q2_K | 2.0 | 3 GB |
| IQ3_XXS | 2.0 | 3 GB |
| IQ3_XS | 2.2 | 3 GB |
| Q3_K_S | 2.2 | 3 GB |
| IQ3_S | 2.2 | 3 GB |
| IQ3_M | 2.3 | 3 GB |
| Q3_K_M | 2.5 | 4 GB |
| IQ4_XS | 2.7 | 4 GB |
| Q3_K_L | 2.7 | 4 GB |
| IQ4_NL | 2.8 | 4 GB |
| Q4_0 | 2.8 | 4 GB |
| Q4_K_S | 2.8 | 4 GB |
| Q4_K_M | 3.0 | 4 GB |
| Q4_1 | 3.1 | 4 GB |
| Q5_K_S | 3.3 | 4 GB |
| Q5_K_M | 3.4 | 4 GB |
| Q6_K | 3.9 | 6 GB |

- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutar la mayoría de cuantizaciones Q4 y superiores. Para las versiones Q5/Q6 se recomienda 6 GB o más (RTX 3060, RTX 4060 Ti).
- En CPU, se puede ejecutar con llama.cpp u Ollama; una CPU moderna con 16 GB de RAM puede manejar las cuantizaciones más pequeñas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp), o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no hay datos oficiales, pero en una GPU RTX 4060 se espera una generación de 20-40 tokens/s con Q4_K_M, y en CPU unos 5-10 tokens/s dependiendo de la arquitectura.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base AFM-4.5B no tiene benchmarks públicos conocidos en la información proporcionada. Como referencia, otros modelos de tamaño similar (3-7B) como Llama-3.2-3B, Qwen2.5-7B o Gemma-2-2B podrían ser alternativas, pero no hay datos de rendimiento comparables. La principal ventaja de este modelo es su licencia Apache 2.0 y su soporte multilingüe, pero se recomienda evaluar cada opción según el caso de uso específico.

## Limitaciones y advertencias

- La información sobre el modelo base es escasa: no se conocen detalles de arquitectura, entrenamiento ni sesgos potenciales. Esto dificulta predecir su comportamiento en tareas específicas.
- Las cuantizaciones de baja precisión (IQ1, IQ2) pueden degradar significativamente la calidad del texto generado, aumentando el riesgo de alucinaciones o incoherencias.
- No se ha confirmado soporte para tool calling, razonamiento matemático avanzado o generación de código; es probable que tenga limitaciones en estos ámbitos.
- Al ser un modelo pequeño (4.6B), su capacidad de razonamiento complejo es inferior a la de modelos de mayor tamaño (70B+). Para tareas que requieren lógica avanzada, puede no ser suficiente.
- Aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se recomienda verificar si el modelo base tiene alguna restricción adicional no documentada.
- La cuantización imatrix de mradermacher es de terceros y no está oficialmente respaldada por Arcee AI; los resultados pueden variar respecto al modelo original en precisión y comportamiento.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mradermacher/AFM-4.5B-i1-GGUF
- Modelo base: https://huggingface.co/arcee-ai/AFM-4.5B
- Perfil de mradermacher (más modelos y FAQ): https://huggingface.co/mradermacher
- Página de descargas del modelo (proporcionada por mradermacher): https://hf.tst.eu/model#AFM-4.5B-i1-GGUF
