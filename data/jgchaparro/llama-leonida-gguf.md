# jgchaparro/Llama-Leonida-GGUF

## Resumen

Leonida es un modelo de traducción bidireccional entre griego moderno y tsakonio, una lengua helénica en peligro crítico de desaparición que se habla en la península del Peloponeso y que desciende en gran medida del dórico lacónico antiguo. Lo desarrolla jgchaparro en el marco del proyecto Tsakonian Digital, y esta ficha corresponde a la distribución en formato GGUF del modelo, cuantizada para su ejecución local con llama.cpp, Ollama y LM Studio. El modelo base es `ilsp/Llama-Krikri-8B-Instruct-v1.5`, una adaptación al griego de Llama 3.1 8B realizada por el ILSP (Athena Research Center) con entrenamiento adicional en griego y un vocabulario griego ampliado.

El modelo resuelve un problema muy concreto: la traducción automática de una lengua de bajos recursos para la que no existen sistemas comerciales. Con 8.202.227.776 parámetros y un contexto heredado de Llama 3.1, se entrenó en dos fases: un ajuste supervisado sobre 19.004 pares de frases y un posterior refinamiento con aprendizaje por refuerzo (GRPO) sobre 2.132 pares adicionales no vistos en la primera fase. Los resultados publicados en la model card son chrF++ 83,8 / BLEU 71,3 / TER 16,7 en Bench V2.2 y chrF++ 71,4 / BLEU 53,3 / TER 29,4 en Bench V3.

Su relevancia actual es doble: por un lado, demuestra que un modelo de 8B ajustado con LoRA puede alcanzar calidad útil en una lengua con un corpus de entrenamiento muy reducido; por otro, la distribución en GGUF con cuantizaciones Q4_K_M, Q5_K_M y Q8_0 hace que el modelo se pueda ejecutar en un portátil, lo que facilita la preservación y el uso comunitario de la lengua sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajustado con LoRA y GRPO |
| Parametros totales | 8.202.227.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1; el entrenamiento uso secuencias de 768 tokens) |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | griego moderno (el) y tsakonio |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (repo GGUF); safetensors en el repo del modelo fusionado |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B, un transformer decoder-only, adaptado al griego por el ILSP en el modelo `ilsp/Llama-Krikri-8B-Instruct-v1.5`, que añade entrenamiento adicional en griego y un vocabulario griego extendido. Sobre esa base, Leonida se entrena en dos etapas. La primera es un ajuste supervisado con Unsloth: LoRA en bf16 con rango 64, alpha 64, aplicado a las capas de atención y MLP, tasa de aprendizaje 0,0002 con decaimiento coseno y 3 % de warmup, AdamW de 8 bits, batch efectivo de 16 y longitud máxima de secuencia de 768 tokens, hasta 3 épocas (7.128 pasos). La pérdida cubre únicamente la respuesta del modelo. Cada 750 pasos se evaluaba el adaptador sobre 400 ejemplos de validación (200 pares reservados en ambas direcciones, decodificación greedy) con chrF++; el mejor checkpoint alcanzó chrF++ de validación 80,78.

La segunda etapa aplica Group Relative Policy Optimization (pérdida Dr. GRPO, sin término KL) continuando el adaptador de la primera fase. Para cada prompt se muestrean 8 traducciones a temperatura 0,9 y cada una se recompensa contra la referencia: mitad chrF++ de frase, mitad (1 − TER), más una bonificación por coincidencia exacta. Comprobaciones automáticas de puntuación, números, mayúsculas y diacríticos restan penalización por cada error que la referencia no comparte; la salida vacía, la copia del origen, una longitud muy distinta o una respuesta truncada puntúan 0. Se realizaron 400 actualizaciones de 16 prompts con tasa de aprendizaje 0,00001, seleccionando el adaptador de la actualización 350 (chrF++ de validación 81,30 frente a 80,78 de la etapa 1). Los datos de entrenamiento son 19.004 pares tsakonio–griego, cada uno en ambas direcciones (38.008 ejemplos), procedentes de fuentes abiertas, principalmente el sitio de Panos Marneris, tsakonika.online; la fase de RL usó 2.132 pares adicionales (4.045 prompts) de las mismas fuentes, reservados de la primera etapa. El lado tsakonio está escrito en la ortografía Kostakis con diacríticos combinantes (τσ̑, σ̌, κ̔, ν̇, λ̣, ν̂, α̈).

## Capacidades

- Traducción bidireccional griego moderno ↔ tsakonio con un único modelo y un único prompt parametrizado por dirección.
- Salida restringida a la traducción: con el prompt recomendado, el modelo responde solo con el texto traducido, sin explicaciones ni formato adicional.
- Lectura y escritura de la ortografía Kostakis, incluidos diacríticos combinantes; el rendimiento baja con otras ortografías.
- Conversación mediante la plantilla de chat de Llama 3.1 (system + user), con formato compatible con endpoints.
- Capacidad multilingüe limitada al par griego–tsakonio; el campo de idiomas del repo declara únicamente `el`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción asistida de documentos históricos y etnográficos: el modelo traduce textos tsakonios en ortografía Kostakis al griego moderno, lo que permite a investigadores sin conocimiento de la lengua consultar fuentes primarias digitalizadas.
- Digitalización y preservación lingüística: integrado en un pipeline que procese corpus escritos, permite generar versiones en griego moderno de materiales en tsakonio y ampliar el corpus paralelo disponible para futuros entrenamientos.
- Herramienta educativa para hablantes y aprendices: al ejecutarse en local con Q4_K_M, se puede desplegar en un portátil de un aula o de una asociación cultural sin conexión ni costes de API.
- Traducción inversa para producción de contenido: permite a hablantes de griego moderno redactar materiales en tsakonio (señalética, textos divulgativos, subtítulos) partiendo de un borrador en griego y revisando la salida.
- Aplicaciones de patrimonio cultural: traducción de inscripciones, leyendas de museo y material turístico de la región del Peloponeso, con revisión humana dado el carácter de lengua en peligro.
- Investigación en traducción de bajos recursos: sirve como caso de referencia reproducible (LoRA + GRPO sobre 19.004 pares) para estudiar técnicas de ajuste eficiente en lenguas con corpus mínimos.
- Integración en asistentes conversacionales locales: mediante Ollama (`ollama run hf.co/jgchaparro/Llama-Leonida-GGUF:Q4_K_M`) se puede incorporar como servicio de traducción en aplicaciones de escritorio o comunitarias.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificación greedy, sacreBLEU 2.5.1, intervalos de confianza al 95 % por bootstrap; ningún par de benchmark se usa en entrenamiento ni validación):

| Benchmark | chrF++ | BLEU | TER |
|---|---|---|---|
| Bench V2.2 | 83,8 | 71,3 | 16,7 |
| Bench V3 | 71,4 | 53,3 | 29,4 |

Evolución de la validación durante la fase de RL (chrF++ / TER, con desglose por dirección):

| Actualizacion | chrF++ validacion | TER | Tsakonio → griego | Griego → tsakonio |
|---|---|---|---|---|
| 0 (etapa 1) | 80,78 | 20,23 | 81,31 | 80,29 |
| 100 | 80,95 | 20,12 | 81,50 | 80,44 |
| 200 | 81,23 | 19,76 | 81,76 | 80,74 |
| 300 | 81,16 | 19,82 | 81,75 | 80,61 |
| 350 (seleccionado) | 81,30 | 19,67 | 81,79 | 80,84 |
| 400 | 81,17 | 19,84 | 81,80 | 80,58 |

No se han publicado en la información disponible comparaciones numéricas con modelos alternativos de traducción griego–tsakonio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB con Q4_K_M, 6 GB con Q5_K_M y 9 GB con Q8_0 para los pesos, más overhead de contexto KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M/Q5_K_M (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070); A100 o H100 para servir Q8_0 con concurrencia alta.
- Cabe en GPU de consumo: sí, Q4_K_M está pensado para ejecutarse en un portátil; también es viable en CPU con llama.cpp, a menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run hf.co/jgchaparro/Llama-Leonida-GGUF:Q4_K_M`), LM Studio; el repo declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Leonida (este) | 8,2 B | no disponible | Traducción griego ↔ tsakonio, LoRA + GRPO | llama3.1 | GGUF, safetensors, LoRA |
| Llama-Leonida Beta | no disponible | no disponible | Predecesor, misma tarea | no disponible | GGUF |
| ilsp/Llama-Krikri-8B-Instruct-v1.5 | ~8 B | no disponible | Modelo base griego de propósito general | no disponible | transformers |

No se dispone en la información proporcionada de otros sistemas de traducción griego–tsakonio comparables con métricas publicadas; las comparaciones de la model card se limitan a versiones anteriores del propio Leonida mediante bootstrap emparejado.

## Limitaciones y advertencias

- Lengua de bajos recursos: el entrenamiento se apoya en 19.004 pares de frases de fuentes abiertas, principalmente un único sitio web, lo que limita la cobertura de vocabulario, registros y variantes dialectales.
- Ortografía restringida: solo funciona bien con la ortografía Kostakis; textos en otras ortografías se traducen peor, según advierte el autor.
- Riesgo de alucinación: al ser un modelo generativo ajustado para traducir, puede producir texto fluido pero incorrecto en segmentos fuera de distribución; requiere revisión humana en usos documentales o patrimoniales.
- Contexto de entrenamiento corto: las secuencias de entrenamiento se limitaron a 768 tokens, por lo que la calidad en entradas largas no está garantizada aunque el contexto del transformer sea mayor.
- Idiomas: el repo declara únicamente `el`; no está pensado para traducción entre otros pares de lenguas.
- Licencia llama3.1: impone condiciones de uso (incluida la política de uso aceptable de Meta y obligaciones de atribución); debe revisarse antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de adopción ni de validación independiente.
- Sin datos publicados sobre sesgos sociales o demográficos específicos del modelo.

## Enlaces

- Modelo GGUF: https://huggingface.co/jgchaparro/Llama-Leonida-GGUF
- Modelo fusionado 16-bit: https://huggingface.co/jgchaparro/Llama-Leonida
- Adaptador LoRA: https://huggingface.co/jgchaparro/Llama-Leonida-lora
- Versión anterior: https://huggingface.co/jgchaparro/Llama-Leonida-Beta-GGUF
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5
- Proyecto Tsakonian Digital: https://tsakoniandigital.com
- Fuente principal de datos: https://tsakonika.online
- Unsloth: https://github.com/unslothai/unsloth
