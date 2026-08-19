# mradermacher/ChemLlama-170M-GGUF

## Resumen

ChemLlama-170M es un modelo de lenguaje pequeño, con 169 millones de parámetros, especializado en el dominio de la química. Fue desarrollado por el usuario yerevann y publicado originalmente en Hugging Face bajo el nombre `yerevann/ChemLlama-170M`. La versión aquí descrita corresponde a las cuantizaciones en formato GGUF realizadas por el equipo de mradermacher, que facilitan su ejecución en entornos locales con recursos limitados.

El modelo resuelve tareas de procesamiento de lenguaje natural aplicadas a la química, como la generación de texto técnico, nomenclatura o descripción de compuestos, aunque no se han publicado detalles específicos sobre sus capacidades exactas. Su relevancia radica en su tamaño reducido, que permite desplegarlo en hardware modesto, democratizando el acceso a herramientas de IA para el sector químico. La información disponible sobre su arquitectura, entrenamiento y rendimiento es escasa, por lo que esta ficha se basa únicamente en los datos públicos de la model card y del repositorio de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 169.292.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (ademas del safetensors original) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo. El nombre "ChemLlama" sugiere una posible base en la familia Llama, pero no se confirma en la documentacion disponible. Tampoco se conocen los datos de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas como RLHF o DPO. La unica informacion confirmada es que el modelo fue creado con la libreria transformers y que su tamaño es de aproximadamente 170 millones de parametros.

## Capacidades

- Generacion de texto en el dominio de la quimica (presumiblemente, aunque no esta documentado).
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

No se han documentado casos de uso oficiales. Dado el tamaño y el dominio, se pueden plantear escenarios potenciales, aunque deben considerarse como hipotesis no verificadas:

- Generacion de descripciones de compuestos quimicos: el modelo podria redactar parrafos tecnicos sobre moleculas, reacciones o propiedades, aunque su capacidad estara limitada por su tamaño.
- Asistencia en nomenclatura quimica: podria ayudar a generar o validar nombres IUPAC de compuestos sencillos, siempre que haya sido entrenado con datos adecuados.
- Clasificacion de textos cientificos: podria utilizarse para etiquetar o categorizar abstracts o articulos relacionados con quimica.
- Extraccion de entidades quimicas: en tareas de procesamiento de lenguaje natural, podria identificar nombres de sustancias o formulas en texto.
- Educacion y divulgacion: podria servir como herramienta de apoyo para estudiantes que necesiten explicaciones basicas de conceptos quimicos.
- Prototipado rapido: al ser un modelo pequeño, es util para probar pipelines de NLP en el dominio quimico antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cuantizaciones Q4 o inferiores; alrededor de 0,4 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1650, RTX 2060, o integradas modernas. Tambien puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: si, todas las cuantizaciones caben en cualquier GPU consumer actual.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible, pero al ser un modelo de 170M, la generacion es muy rapida incluso en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo dominio y tamaño. No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo pequeño entrenado con datos no especificados, puede presentar sesgos derivados del corpus de entrenamiento.
- Riesgo de alucinacion: alto, especialmente en tareas complejas, debido al reducido numero de parametros.
- Limitaciones de contexto: se desconoce la longitud de contexto, pero en modelos de este tamaño suele ser limitada (tipicamente 512-2048 tokens).
- Restricciones de licencia: no se ha especificado la licencia, por lo que se recomienda contactar con el autor antes de un uso comercial.
- Caveat para produccion: no se recomienda su uso en entornos criticos sin una evaluacion exhaustiva, dado que no hay benchmarks publicados.

## Enlaces

- Modelo original: https://huggingface.co/yerevann/ChemLlama-170M
- Cuantizaciones GGUF: https://huggingface.co/mradermacher/ChemLlama-170M-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
