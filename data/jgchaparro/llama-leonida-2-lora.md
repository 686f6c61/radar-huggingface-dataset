# jgchaparro/Llama-Leonida-2-lora

## Resumen

Leonida 2 es un adaptador LoRA para traducción bidireccional entre griego moderno y tsakonio, una lengua helénica en peligro crítico de desaparición hablada en el Peloponeso y descendiente del dorio lacónico antiguo. Lo desarrolla jgchaparro en el marco del proyecto Tsakonian Digital, y se construye sobre el modelo base `ilsp/Llama-Krikri-8B-Instruct-v1.5`, una adaptación al griego de Llama 3.1 8B realizada por el ILSP (Athena Research Center) con vocabulario griego ampliado.

El modelo resuelve un problema muy concreto de bajos recursos: la traducción automática de una lengua con poquísimos hablantes y corpus digital limitado. Para ello combina un ajuste supervisado sobre 19.004 pares de frases (38.008 ejemplos en ambas direcciones) con una segunda fase de aprendizaje por refuerzo mediante GRPO sobre 2.132 pares adicionales no vistos en la primera etapa.

Es relevante ahora porque demuestra que un adaptador LoRA de bajo coste sobre un modelo de 8B puede alcanzar calidad de traducción alta (chrF++ 83,8 y BLEU 71,3 en el benchmark interno Bench V2.2) en una lengua con recursos mínimos, y porque el modelo es lo bastante pequeño para ejecutarse en local: la cuantización Q4_K_M corre en un portátil. El repositorio de este adaptador ocupa 0,7 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B adaptado al griego), adaptador LoRA |
| Parámetros totales | 8 mil millones (modelo base); el adaptador LoRA se distribuye por separado |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó secuencias de 768 tokens) |
| Tipos de cuantización | El adaptador se distribuye en safetensors; el modelo fusionado tiene GGUF Q8_0, Q5_K_M y Q4_K_M en el repositorio hermano |
| Idiomas soportados | Griego moderno y tsakonio (tag de idioma: `el`) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en el repositorio del modelo fusionado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `ilsp/Llama-Krikri-8B-Instruct-v1.5`, un transformer decoder-only de 8B derivado de Llama 3.1 8B y adaptado al griego por ILSP con entrenamiento adicional y vocabulario griego extendido. El ajuste se realizó con Unsloth en bf16, con rango LoRA 64, alpha 64, aplicado a las capas de atención y MLP. La optimización usó learning rate 0,0002 con decaimiento coseno y 3 % de warmup, AdamW de 8 bits, batch efectivo de 16, longitud máxima de secuencia de 768 tokens y hasta 3 épocas (7.128 pasos); la pérdida cubre únicamente la respuesta del modelo. La selección de checkpoint se hizo cada 750 pasos evaluando 400 ejemplos de validación con chrF++, y el mejor checkpoint de esta fase alcanzó chrF++ de validación 80,78.

La segunda fase aplicó Group Relative Policy Optimization (pérdida Dr. GRPO, sin término KL) continuando el adaptador de la fase 1. Para cada prompt se muestrearon 8 traducciones a temperatura 0,9, recompensadas con una combinación de chrF++ de frase (mitad), (1 − TER) (mitad) y un bonus por coincidencia exacta, con penalizaciones automáticas por errores de puntuación, números, mayúsculas y diacríticos no presentes en la referencia. Las salidas vacías, copias del original, longitudes muy dispares o respuestas truncadas reciben recompensa cero. Se realizaron 400 actualizaciones de 16 prompts con learning rate 0,00001, y el adaptador publicado corresponde a la actualización 350 (chrF++ de validación 81,30).

## Capacidades

- Traducción bidireccional griego moderno ⇄ tsakonio con un único modelo.
- Generación de la traducción únicamente, sin texto adicional, siguiendo la plantilla de chat de Llama 3.1 con un system prompt específico.
- Lectura y escritura de la ortografía Kostakis del tsakonio, con diacríticos combinantes (τσ̑, σ̌, κ̔, ν̇, λ̣, ν̂, α̈).
- Manejo de una lengua de bajos recursos con corpus digital muy limitado.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Digitalización y traducción de textos de tsakonio: el modelo convierte material escrito en ortografía Kostakis a griego moderno, lo que facilita la catalogación y el estudio de corpus por parte de lingüistas.
- Preservación de lengua en peligro: permite generar versiones en griego moderno de documentación oral transcrita en tsakonio, ampliando el acceso a investigadores que no dominan la lengua.
- Herramientas educativas para comunidades de hablantes: un traductor local bidireccional que puede desplegarse sin conexión en un portátil gracias a la cuantización Q4_K_M.
- Apoyo a la traducción humana: el modelo produce una primera versión que un revisor nativo puede corregir, reduciendo el esfuerzo en pares de frases de temática general.
- Investigación en NLP de bajos recursos: sirve como referencia reproducible (adaptador LoRA, hiperparámetros y `run_meta.json` publicados) para experimentos de SFT + GRPO en lenguas minoritarias.
- Publicación de contenido bilingüe: generación de versiones en griego moderno de materiales divulgativos escritos en tsakonio para webs y archivos del proyecto Tsakonian Digital.

## Benchmarks y rendimiento

Evaluación con decodificación greedy en ambas direcciones, métricas calculadas con sacreBLEU 2.5.1 (BLEU, chrF++ y TER); los intervalos de confianza al 95 % provienen de bootstrap.

| Benchmark | chrF++ | BLEU | TER |
|---|---|---|---|
| Bench V2.2 | 83,8 | 71,3 | 16,7 |
| Bench V3 | 71,4 | 53,3 | 29,4 |

Progreso de la fase de RL (chrF++ de validación, 400 ejemplos):

| Actualización | chrF++ validación | TER | Tsakonio → griego | Griego → tsakonio |
|---|---|---|---|---|
| 0 (fase 1) | 80,78 | 20,23 | 81,31 | 80,29 |
| 100 | 80,95 | 20,12 | 81,50 | 80,44 |
| 200 | 81,23 | 19,76 | 81,76 | 80,74 |
| 300 | 81,16 | 19,82 | 81,75 | 80,61 |
| 350 (seleccionado) | 81,30 | 19,67 | 81,79 | 80,84 |
| 400 | 81,17 | 19,84 | 81,80 | 80,58 |

No se han publicado en la información disponible comparaciones numéricas con otros sistemas de traducción para tsakonio.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 0,7 GB y requiere cargar el modelo base de 8B para inferencia.
- El modelo fusionado en 16 bits requiere aproximadamente 16 GB de VRAM; con cuantización Q8_0, en torno a 8-9 GB; con Q5_K_M, unos 6 GB; con Q4_K_M, unos 4-5 GB.
- La cuantización Q4_K_M está pensada para ejecutarse en un portátil, según la model card.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo fusionado en 16 bits encaja en A100, H100 o RTX 4090, y las cuantizaciones GGUF caben en GPU de consumo con 6-8 GB o más.
- Opciones de despliegue: transformers con Unsloth (`FastModel.from_pretrained` con `load_in_4bit=True`), llama.cpp, Ollama y LM Studio mediante los ficheros GGUF del repositorio hermano.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leonida 2 (este) | 8B (base) + LoRA | no disponible | Traducción griego ⇄ tsakonio, SFT + GRPO | llama3.1 | HF: LoRA, fusionado 16-bit y GGUF |
| Leonida Beta | no disponible | no disponible | Traducción griego ⇄ tsakonio, versión anterior | no disponible | HF: `jgchaparro/Llama-Leonida-Beta-lora` |
| Leonida (primera versión) | no disponible | no disponible | Traducción griego ⇄ tsakonio, primera versión | no disponible | HF: `jgchaparro/Llama-Leonida-lora` |
| Llama-Krikri-8B-Instruct-v1.5 | 8B | no disponible | Modelo generalista en griego (base) | no disponible | HF: `ilsp/Llama-Krikri-8B-Instruct-v1.5` |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de las versiones anteriores de Leonida ni de otros sistemas de traducción para tsakonio.

## Limitaciones y advertencias

- Solo cubre griego moderno y tsakonio; no es un modelo generalista y no debe usarse para otras tareas de traducción.
- El rendimiento cae con texto en tsakonio escrito en ortografías distintas de la Kostakis; la model card indica explícitamente que esas variantes se traducen peor.
- El corpus de entrenamiento es reducido (19.004 pares más 2.132 de RL) y proviene principalmente de una única fuente (tsakonika.online), lo que limita la cobertura temática y de registro.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas en frases alejadas de la distribución de entrenamiento; las métricas de benchmark no garantizan fidelidad semántica en dominios nuevos.
- El modelo responde solo con la traducción; requiere la plantilla de chat de Llama 3.1 y el system prompt indicado para funcionar correctamente.
- Licencia llama3.1: el uso comercial está sujeto a los términos de la licencia de Llama 3.1, que incluyen condiciones y restricciones específicas.
- La longitud de contexto efectiva no está documentada; el entrenamiento usó secuencias de 768 tokens, por lo que textos largos deben dividirse.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de los benchmarks internos.

## Enlaces

- Adaptador LoRA: https://huggingface.co/jgchaparro/Llama-Leonida-2-lora
- Modelo fusionado 16-bit: https://huggingface.co/jgchaparro/Llama-Leonida-2
- GGUF (Q8_0, Q5_K_M, Q4_K_M): https://huggingface.co/jgchaparro/Llama-Leonida-2-GGUF
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5
- Versión anterior Leonida Beta: https://huggingface.co/jgchaparro/Llama-Leonida-Beta-lora
- Primera versión Leonida: https://huggingface.co/jgchaparro/Llama-Leonida-lora
- Proyecto Tsakonian Digital: https://tsakoniandigital.com
- Fuente principal de datos (Panos Marneris): https://tsakonika.online
- Unsloth: https://github.com/unslothai/unsloth
