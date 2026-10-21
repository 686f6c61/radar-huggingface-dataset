# jgchaparro/Llama-Artemis-lora

## Resumen

Artemis es un adaptador LoRA para traducción bidireccional entre griego moderno y tsakonio, una lengua helénica en peligro crítico del Peloponeso que desciende en buena medida del dórico lacónico antiguo. Lo desarrolla jgchaparro en el marco del proyecto Tsakonian Digital y se publica como adaptador sobre el modelo base `ilsp/Llama-Krikri-8B-Instruct-v1.5`, una adaptación al griego del Llama 3.1 8B realizada por el ILSP (Athena Research Center) con entrenamiento adicional en griego y un vocabulario griego ampliado.

Se trata de un modelo denso de 8 000 millones de parámetros, ajustado con QLoRA de 4 bits sobre 20 219 pares de frases tsakonio-griego usados en ambas direcciones (40 438 ejemplos de entrenamiento). El adaptador ocupa 0,7 GB en safetensors y el autor publica también una versión fusionada en 16 bits y cuantizaciones GGUF (Q8_0, Q5_K_M, Q4_K_M).

Su relevancia es doble: por un lado cubre un par de lenguas sin recursos que ningún sistema de traducción comercial soporta; por otro, documenta un procedimiento completo y reproducible (selección de checkpoint por chrF++ de validación, banco de evaluación propio y corrección posterior del mismo) poco habitual en proyectos de lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), adaptado al griego por ILSP; ajuste mediante LoRA sobre capas de atención y MLP |
| Parametros totales | 8 000 millones (modelo base); el adaptador LoRA se distribuye aparte |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama 3.1 (heredado; la informacion proporcionada solo detalla 768 tokens de longitud maxima de secuencia durante el entrenamiento) |
| Tipos de cuantizacion | Adaptador en 4 bits QLoRA para entrenamiento e inferencia; GGUF Q8_0, Q5_K_M y Q4_K_M en el repositorio gemelo; version fusionada en 16 bits |
| Idiomas soportados | Griego moderno y tsakonio (etiqueta de idioma `el`) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en `jgchaparro/Llama-Artemis-GGUF`; modelo fusionado en transformers en `jgchaparro/Llama-Artemis` |
| Tamano del repositorio | 0,7 GB |
| Pipeline | translation |
| Ortografia de salida | Kostakis, con diacriticos combinados (τσ̑, σ̌, κ̔, ν̇, λ̣, ν̂, α̈) |
| Plantilla de chat | Plantilla de chat de Llama 3.1 con prompts de sistema y usuario especificos |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Llama 3.1 en su variante de 8B, modificada por el ILSP para el griego. Sobre esa base se aplica un adaptador LoRA con rango 64 y alpha 64 en las capas de atención y MLP del modelo de lenguaje, entrenado en 4 bits con la librería Unsloth. La optimización usa tasa de aprendizaje 0,0002 con decaimiento coseno y 3 % de warmup, AdamW de 8 bits, batch efectivo de 16 y longitud máxima de secuencia de 768 tokens. La función de pérdida cubre únicamente la respuesta del modelo, no el prompt.

El corpus de entrenamiento son 20 219 pares de frases tsakonio-griego procedentes de fuentes abiertas, principalmente la web de Panos Marneris `tsakonika.online`, empleados en las dos direcciones y convertidos a la ortografía Kostakis cuando estaban en otra variante. No se menciona en la información disponible el uso de RLHF ni DPO. La selección del checkpoint se hizo por chrF++ sobre 400 ejemplos de validación (200 pares retenidos por dos direcciones, decodificación greedy), evaluando cada 750 pasos con parada temprana tras tres evaluaciones sin mejora. El adaptador publicado corresponde al paso 7 584 (época 3,0) con chrF++ de validación 81,25 y TER 20,12, con una progresión desde 70,54 en el paso 750.

| Paso | Epoca | chrF++ validacion | TER | Tsakonio → griego | Griego → tsakonio |
|---|---|---|---|---|---|
| 750 | 0,3 | 70,54 | 32,61 | 73,62 | 67,73 |
| 3000 | 1,19 | 77,67 | 23,46 | 79,03 | 76,41 |
| 6000 | 2,37 | 81,00 | 20,41 | 81,78 | 80,27 |
| 7584 (seleccionado) | 3,0 | 81,25 | 20,12 | 82,21 | 80,35 |

## Capacidades

- Traducción bidireccional griego moderno ↔ tsakonio con un único adaptador, seleccionando la dirección mediante el prompt.
- Salida restringida a la traducción: el prompt de sistema pide al modelo que responda solo con el texto traducido.
- Manejo de la ortografía Kostakis, incluidos diacríticos combinados poco frecuentes en tokenizadores estándar.
- Traducción de frases de dificultad variable: el banco de evaluación separa niveles fácil, medio y difícil, con resultados relativamente estables entre niveles.
- Integración con el ecosistema Unsloth/PEFT para cargar el adaptador en 4 bits y con llama.cpp, Ollama y LM Studio a través de los GGUF publicados.
- Capacidad multilingüe limitada al par griego-tsakonio; no se documentan otras lenguas.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Digitalización de textos de tsakonio: traducción de material histórico o etnográfico escrito en ortografía Kostakis a griego moderno para su catalogación en archivos y bibliotecas digitales, aprovechando el rendimiento superior en la dirección tsakonio → griego (BLEU 71,8).
- Producción de material didáctico bilingüe: generación de glosas y traducciones de apoyo para cursos de tsakonio, con revisión humana dado el tamaño reducido del corpus de origen.
- Señalización y contenidos públicos en zonas de habla tsakonia: traducción de avisos, folletos y páginas web al tsakonio para iniciativas de revitalización lingüística.
- Apoyo a la documentación lingüística de campo: traducción preliminar de transcripciones para que el investigador acelere la anotación, con el modelo como primera pasada y el lingüista como validador.
- Traducción inversa griego → tsakonio para creación de contenido nuevo: textos breves, subtítulos o publicaciones en redes, donde el modelo alcanza chrF++ 79,1 y TER 22,2.
- Servicio de consulta para hablantes de griego que quieren aproximarse a textos en tsakonio: despliegue en local con el GGUF Q4_K_M o Q5_K_M (adaptador de 0,7 GB más base de 8B), sin dependencia de API externa.
- Investigación en traducción automática de lenguas de bajos recursos: el repositorio incluye `run_meta.json` con hiperparámetros, recuentos por fuente e historial de selección por chrF++, lo que permite reproducir o comparar metodologías.

## Benchmarks y rendimiento

Resultados en Tsakonian Digital Bench V2.1 (300 pares × 2 direcciones = 600 traducciones; 100 fáciles, 100 medias, 100 difíciles). Intervalos de confianza al 95 % solo publicados para el agregado.

| Grupo | BLEU ↑ | chrF++ ↑ | TER ↓ |
|---|---|---|---|
| Todos (600) | 66,7 (64,6–68,8) | 81,2 (79,8–82,4) | 19,6 (18,2–21,0) |
| Tsakonio → griego (300) | 71,8 | 83,4 | 16,9 |
| Griego → tsakonio (300) | 61,7 | 79,1 | 22,2 |
| Facil (200) | 67,2 | 81,6 | 18,2 |
| Medio (200) | 64,9 | 79,2 | 21,4 |
| Dificil (200) | 67,3 | 81,8 | 19,2 |
| Facil / tsakonio → griego (100) | 72,4 | 84,4 | 15,5 |
| Facil / griego → tsakonio (100) | 62,1 | 79,1 | 20,8 |
| Medio / tsakonio → griego (100) | 69,1 | 81,3 | 19,3 |
| Medio / griego → tsakonio (100) | 60,8 | 77,3 | 23,5 |
| Dificil / tsakonio → griego (100) | 72,6 | 84,1 | 16,2 |
| Dificil / griego → tsakonio (100) | 62,0 | 79,8 | 22,1 |

Advertencia del propio autor: las puntuaciones de V2.1 y V2 no son directamente comparables, porque 130 de los 300 pares de V2 fueron corregidos y 7 reemplazados en V2.1. Los resultados de V2 se conservan en la model card únicamente para comparar con el modelo anterior del proyecto. No se han publicado resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del adaptador con base en 4 bits: en torno a 6–8 GB, suficiente para GPU de consumo de gama media-alta.
- VRAM estimada para el modelo fusionado en 16 bits: aproximadamente 16 GB de pesos más caché KV, en torno a 18–20 GB en total.
- GGUF: Q4_K_M ≈ 4,9 GB, Q5_K_M ≈ 5,7 GB y Q8_0 ≈ 8,5 GB, según los tamanos habituales de un modelo de 8B (estimación, no publicada por el autor).
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para la versión de 16 bits; RTX 4070/4080 o superior para 4 bits y GGUF; A100 o H100 para servir en lote con vLLM o TGI.
- Cabe en GPU de consumo: sí, tanto el adaptador en 4 bits como los GGUF Q4_K_M y Q5_K_M; la versión de 16 bits requiere 24 GB o descarga parcial a CPU.
- Opciones de despliegue: transformers con PEFT/Unsloth (`FastModel.from_pretrained(..., load_in_4bit=True)`), llama.cpp, Ollama, LM Studio, vLLM y TGI para la versión fusionada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros modelos especializados en tsakonio. La comparación se limita a las variantes del propio proyecto y a su base.

| Modelo | Parametros | Contexto | Tsakonio | Licencia | Formato |
|---|---|---|---|---|---|
| Artemis (este adaptador) | 8B (LoRA aparte) | 128k en base; 768 en entrenamiento | Si, bidireccional; BLEU 66,7 en Bench V2.1 | llama3.1 | safetensors (LoRA) |
| Llama-Artemis (fusionado 16 bits) | 8B | 128k en base | Si, mismos pesos fusionados | llama3.1 | safetensors |
| Llama-Artemis-GGUF | 8B | 128k en base | Si, cuantizado Q8_0/Q5_K_M/Q4_K_M | llama3.1 | GGUF |
| ilsp/Llama-Krikri-8B-Instruct-v1.5 | 8B | no disponible en la informacion | No documentado | llama3.1 (heredada) | safetensors |

## Limitaciones y advertencias

- Corpus pequeño y de una sola fuente principal (`tsakonika.online`): 20 219 pares, lo que limita la cobertura de vocabulario, registros y variantes dialectales.
- Los pares de validación proceden de las mismas fuentes abiertas que el entrenamiento, por lo que las cifras de chrF++ de validación pueden ser optimistas respecto a texto real externo.
- El banco de evaluación lo construye el propio equipo del modelo y comparte origen con los datos de entrenamiento; los resultados deben interpretarse como indicativos, no como una evaluación independiente.
- La asimetría entre direcciones es notable: griego → tsakonio obtiene BLEU 61,7 y TER 22,2 frente a 71,8 y 16,9 en el sentido inverso, de modo que la generación en tsakonio es la parte más frágil.
- La salida exige la ortografía Kostakis con diacríticos combinados; textos en otras ortografías o con normalización Unicode distinta pueden degradar la calidad y requieren preprocesado.
- Riesgo de alucinación en léxico poco frecuente o en frases largas: al ser un ajuste sobre un modelo de propósito general, puede generar formas plausibles pero inexistentes en tsakonio, especialmente en cultismos y terminología moderna.
- No se documentan sesgos específicos ni evaluaciones de sesgo en la información disponible.
- Licencia Llama 3.1 Community License: uso comercial permitido con obligaciones de atribución ("Built with Llama"), restricciones de uso aceptable y cláusula de 700 millones de usuarios mensuales; no es una licencia OSI.
- Adopción prácticamente nula en el momento de la ficha (0 descargas, 0 likes), por lo que no existe validación externa independiente.
- El adaptador depende del tokenizador y la plantilla de chat de Llama-Krikri: usar la plantilla correcta es imprescindible para obtener el formato de respuesta esperado.

## Enlaces

- Modelo (adaptador LoRA): https://huggingface.co/jgchaparro/Llama-Artemis-lora
- Modelo fusionado en 16 bits: https://huggingface.co/jgchaparro/Llama-Artemis
- GGUF (Q8_0, Q5_K_M, Q4_K_M): https://huggingface.co/jgchaparro/Llama-Artemis-GGUF
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5
- Proyecto Tsakonian Digital: https://tsakoniandigital.com
- Fuente principal de datos (Panos Marneris): https://tsakonika.online
- Unsloth: https://github.com/unslothai/unsloth
- Banco de evaluacion V2.1: https://huggingface.co/jgchaparro/Llama-Artemis-lora/tree/main/benchmark (predicciones en `benchmark/predictions_benchmark_v2_1.jsonl`, metricas en `benchmark/metrics_benchmark_v2_1.json`)
