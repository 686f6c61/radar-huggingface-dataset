# Ankitgdes/microme-125m-base

## Resumen

MicroMe-125M-Base es un modelo de lenguaje autoregresivo de 125 millones de parámetros, entrenado desde cero por Ankitgdes sobre 3 000 millones de tokens del dataset FineWeb-Edu. Se trata de la versión base (sin ajuste por chat) de un proyecto mayor que incluye una variante conversacional con capacidades de RAG, y destaca por haber sido entrenado íntegramente en una laptop con una GPU RTX 4060 de 8 GB en aproximadamente 40 horas, utilizando PyTorch escrito a mano y el optimizador Muon.

El modelo sigue una arquitectura tipo GPT (transformer decoder) y se distribuye en formato safetensors con precisión bf16. Su relevancia radica en demostrar que es posible obtener un modelo funcional con recursos computacionales muy limitados, a la vez que sirve como punto de partida para experimentación y fine-tuning. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

Aunque su tamaño y volumen de entrenamiento son reducidos, los benchmarks publicados muestran resultados competitivos con modelos de similar escala como GPT-2-124M o Pythia-160M, especialmente en tareas de razonamiento de sentido común como ARC-Easy.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (transformer decoder) |
| Parametros totales | 129 787 520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors); no se publican cuantizaciones adicionales |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder estándar, similar a GPT-2, con aproximadamente 125 millones de parámetros. No se han publicado detalles sobre el número de capas, dimensiones ocultas o cabezas de atención, aunque se puede inferir una configuración típica para ese tamaño. Se entrenó desde cero sobre 3 000 millones de tokens del dataset FineWeb-Edu, una selección educativa de alta calidad derivada de FineWeb.

La innovación principal reside en el uso del optimizador Muon, que combina actualizaciones por subespacios y ha demostrado acelerar la convergencia en modelos pequeños. El entrenamiento se realizó en una GPU RTX 4060 para portátiles (8 GB VRAM) durante unas 40 horas, con código PyTorch propio. No se menciona el uso de técnicas como RLHF o DPO; el modelo es exclusivamente un modelo base de lenguaje.

## Capacidades

- Generacion de texto autoregresiva: es capaz de producir texto coherente en ingles, con limitaciones propias de su tamaño.
- Modelo base: no esta ajustado para chat ni instrucciones, por lo que no responde a prompts conversacionales de forma natural.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso estructurado.
- Sin soporte de vision ni audio.
- Multilingue: no, solo ingles.
- Capacidad de continuacion de texto y completado de secuencias, util para tareas de generacion pura.

## Casos de uso

- Experimentacion academica: ideal para estudiar el comportamiento de modelos pequenos, tecnicas de optimizacion como Muon, o el efecto de la calidad del dataset en el rendimiento final.
- Fine-tuning para tareas especificas: al ser un modelo base compacto, puede ajustarse con pocos recursos para clasificacion de texto, analisis de sentimiento o generacion de texto en dominios concretos.
- Prototipado rapido: permite validar ideas de productos que requieran generacion de lenguaje sin necesidad de infraestructura costosa, ejecutable en una GPU de gama media o incluso CPU.
- Generacion de contenido educativo: dado que se entreno con FineWeb-Edu, puede generar textos de caracter divulgativo o didactico en ingles, aunque con limitaciones de coherencia a largo plazo.
- Ensenanza de arquitecturas transformer: su codigo fuente y checkpoint de entrenamiento (incluido en el repositorio) permiten a estudiantes y desarrolladores inspeccionar el proceso de entrenamiento completo.
- Base para sistemas RAG: el proyecto incluye una version con RAG, por lo que este modelo base puede servir como componente de generacion en un pipeline de recuperacion aumentada.

## Benchmarks y rendimiento

Resultados declarados por el autor, obtenidos con lm-evaluation-harness en configuracion 0-shot:

| Tarea | Metrica | Resultado |
|---|---|---|
| ARC-Easy | accuracy (0-shot) | 52.2 |
| HellaSwag | normalized accuracy (0-shot) | 31.9 |
| PIQA | accuracy (0-shot) | 62.2 |
| LAMBADA (OpenAI) | accuracy (0-shot) | 25.5 |

El autor indica que estos valores son competitivos con GPT-2-124M y Pythia-160M, a pesar de haber utilizado entre 10 y 100 veces menos datos de entrenamiento. No se dispone de comparaciones numericas directas con esos modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 260 MB, por lo que caben en cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas integradas modernas.
- GPU recomendadas: cualquier GPU con soporte CUDA de 4 GB o superior (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente. Tambien puede ejecutarse en CPU con un rendimiento aceptable para uso interactivo.
- En consumer GPU: si, cabe en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: al ser un modelo pequeno, puede servirse con frameworks ligeros como llama.cpp (si se convierte a GGUF), o mediante vLLM y TGI si se desea un servicio de alto rendimiento. El repositorio incluye codigo de carga directa con PyTorch.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano, se espera una latencia de pocos milisegundos por token en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| MicroMe-125M-Base | 125M | no disponible | 3B tokens FineWeb-Edu | Apache-2.0 |
| GPT-2 (124M) | 124M | 1024 | ~40B tokens WebText | MIT |
| Pythia-160M | 160M | 2048 | 300B tokens The Pile | Apache-2.0 |

MicroMe-125M-Base es comparable en tamano a GPT-2 y Pythia, pero con un volumen de entrenamiento muy inferior. No se dispone de datos de contexto ni de benchmarks comparativos directos en la informacion proporcionada. Su principal ventaja es la licencia permisiva y la posibilidad de reanudar el entrenamiento desde el checkpoint incluido.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre FineWeb-Edu, puede heredar sesgos presentes en textos educativos en ingles, aunque la curacion del dataset reduce algunos riesgos.
- Alucinacion: como todo modelo pequeno, es propenso a generar afirmaciones incorrectas o incoherentes, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto: no se ha publicado la longitud maxima de contexto, lo que dificulta su uso en aplicaciones que requieran ventanas largas.
- Idioma: exclusivamente ingles; no es adecuado para otros idiomas.
- Rendimiento limitado: con solo 3B tokens de entrenamiento, su capacidad general es inferior a modelos de la misma escala entrenados con mas datos.
- Uso en produccion: al ser un modelo base sin ajuste por instrucciones, no es recomendable para aplicaciones conversacionales directas sin un fine-tuning previo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento (FineWeb-Edu) estan bajo ODC-By, lo que podria implicar atribucion en ciertos casos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ankitgdes/microme-125m-base
- Version chat + RAG: https://huggingface.co/Ankitgdes/microme-125m
- Repositorio de codigo y entrenamiento: https://github.com/ankit-rawani/microme
