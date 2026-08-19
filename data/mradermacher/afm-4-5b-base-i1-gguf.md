# mradermacher/AFM-4.5B-Base-i1-GGUF

## Resumen

AFM-4.5B-Base-i1-GGUF es una cuantización en formato GGUF del modelo base AFM-4.5B-Base, desarrollado por Arcee AI y cuantizado por mradermacher. El modelo original es un transformer de 4.619 millones de parámetros (aproximadamente 4,6 mil millones) con licencia Apache 2.0, diseñado para soportar diez idiomas: inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino. Esta versión GGUF incluye un archivo de importancia (imatrix) que permite generar cuantizaciones de mayor calidad, y los archivos de cuantización estáticos están disponibles en un repositorio hermano.

La relevancia de este modelo radica en que ofrece una alternativa de tamaño medio (4,6B) con licencia permisiva y soporte multilingüe, lo que lo hace adecuado para despliegue en entornos con recursos limitados, como estaciones de trabajo con GPU de consumo o incluso CPU. Al ser un modelo base, está pensado para fine-tuning en tareas específicas, y su cuantización GGUF facilita su uso con herramientas como llama.cpp, Ollama o vLLM. Sin embargo, la información técnica detallada sobre arquitectura, contexto y rendimiento no está disponible en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.619.184.640 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (disponibles en el repositorio estático) |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base AFM-4.5B-Base en la documentación proporcionada. Se desconoce si se trata de un transformer decoder-only convencional, si incorpora mecanismos de atención lineal o alguna otra innovación. Tampoco se especifican los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. Al ser un modelo base, se presume que no ha sido fine-tuneado para instrucciones, pero esta afirmación no está confirmada.

La cuantización realizada por mradermacher utiliza el método imatrix (importance matrix), que optimiza la asignación de bits según la importancia de cada peso, mejorando la calidad respecto a cuantizaciones estáticas. El repositorio contiene únicamente el archivo imatrix (0.1 GB); los archivos de cuantización finales se encuentran en el repositorio estático enlazado.

## Capacidades

- Generación de texto: al ser un modelo base, puede completar texto, continuar secuencias y generar contenido en los diez idiomas soportados.
- Razonamiento y conocimiento general: se espera que tenga capacidades básicas de razonamiento, aunque no hay benchmarks publicados que lo confirmen.
- Multilingüismo: soporta diez idiomas, lo que permite su uso en aplicaciones multilingües o como base para fine-tuning en idiomas específicos.
- Fine-tuning: al ser un modelo base, está diseñado para ser adaptado a tareas concretas mediante fine-tuning supervisado.
- Compatibilidad con herramientas GGUF: puede ejecutarse con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato, incluyendo despliegue en CPU o GPU.
- No se ha confirmado soporte para tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Fine-tuning para clasificación de texto multilingüe: el modelo puede adaptarse para análisis de sentimiento, detección de spam o categorización de documentos en varios idiomas, aprovechando su tamaño moderado y licencia permisiva.
- Generación de contenido en lenguajes con pocos recursos: su soporte para árabe, hindi, coreano y chino permite crear asistentes de escritura o traducción automática en estos idiomas, aunque se requeriría fine-tuning para mejorar la calidad.
- Chatbots especializados en dominios verticales: tras un fine-tuning con datos de un sector concreto (por ejemplo, atención sanitaria o legal), el modelo puede desplegarse localmente en empresas que requieran privacidad de datos.
- Educación y tutoría: como modelo base, puede utilizarse para generar ejercicios, explicaciones o resúmenes en múltiples idiomas, integrándose en plataformas educativas con recursos limitados.
- Investigación en eficiencia de cuantización: el archivo imatrix y los distintos tipos de cuantización permiten experimentar con el equilibrio entre tamaño, velocidad y calidad para modelos de 4,6B.
- Prototipado rápido en entornos sin GPU: gracias a la cuantización GGUF, puede ejecutarse en CPU con memoria RAM suficiente, facilitando pruebas de concepto en portátiles o servidores sin aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar para el modelo base ni para sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del tipo de cuantización. Para un modelo de 4,6B parámetros, una cuantización Q4_K_M suele ocupar entre 2,5 y 3 GB, por lo que cabría en GPUs con 4-6 GB de VRAM (por ejemplo, GTX 1660, RTX 3050, RTX 4060). Cuantizaciones más bajas (Q2_K, IQ2) pueden reducir el uso a menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para las cuantizaciones más bajas; para las más altas (Q6_K, Q8_0) se recomiendan 6-8 GB. En CPU, se necesitan al menos 8 GB de RAM para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, vLLM (con soporte GGUF), entre otros.
- Latencia y throughput: no se dispone de mediciones específicas. En una GPU de gama media (RTX 3060), se puede esperar una velocidad de generación de 20-40 tokens por segundo con cuantización Q4_K_M, pero estos valores son estimaciones orientativas y no han sido verificados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo AFM-4.5B-Base no tiene benchmarks publicados en la documentación proporcionada. Como referencia, otros modelos de tamaño similar incluyen Llama-3.2-3B, Qwen2.5-4B y Gemma-2-2.6B, pero sus características y rendimiento no pueden compararse sin datos concretos. Se recomienda consultar la documentación oficial de Arcee AI para obtener más detalles.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado para seguir instrucciones ni para mantener conversaciones coherentes sin fine-tuning previo. Puede generar contenido no deseado, ofensivo o incoherente si se usa directamente.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos o poco comunes.
- Longitud de contexto desconocida: no se ha especificado el número máximo de tokens de entrada, lo que dificulta planificar su uso en tareas que requieran contexto extenso.
- Sesgos lingüísticos y culturales: al entrenarse en diez idiomas, es posible que el rendimiento varíe significativamente entre ellos, con mejores resultados en idiomas con más datos (inglés, español, francés) y peores en otros.
- Limitaciones de cuantización: las cuantizaciones de baja precisión (Q2, IQ1) pueden degradar notablemente la calidad del modelo, aumentando la probabilidad de errores.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero no se proporcionan garantías ni soporte oficial por parte de Arcee AI.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/AFM-4.5B-Base-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/AFM-4.5B-Base-GGUF
- Modelo base original: https://huggingface.co/arcee-ai/AFM-4.5B-Base
- Página de ayuda del cuantizador: https://huggingface.co/mradermacher/model_requests
