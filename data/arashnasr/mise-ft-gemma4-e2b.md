# ArashNasr/mise-ft-gemma4-e2b

## Resumen

MISE-FT es un ajuste fino mediante QLoRA del modelo Gemma 4 E2B (variante instruction-tuned, `google/gemma-4-E2B-it`) desarrollado por Arash Nasr Esfahani en el marco de una tesis de máster de la Universidad de Teherán. El modelo forma parte del sistema MISE, un agente encarnado que combina un LLM con recuperación aumentada (RAG) para planificar tareas de cocina en el simulador AI2-THOR. Su función concreta es transformar una instrucción de cocina en inglés o persa en un plan JSON ejecutable sobre el conjunto de habilidades predefinido de MISE.

El modelo resuelve el problema de la planificación de tareas de varios niveles (atómicas L1, secuenciales L2 y abstractas L3) en un entorno doméstico simulado, apoyándose en una memoria de escena textual (Scene Memory) que se inyecta en el prompt. Con 5.104.298.723 parámetros totales y un adaptador LoRA de rango 16, se distribuye tanto como adaptador PEFT en safetensors como en GGUF cuantizado Q4_K_M para Ollama.

Su relevancia radica en que demuestra que un ajuste fino ligero y de bajo coste (una sola RTX 4060 Laptop de 8 GB, unas 3 horas por ejecución) sobre un modelo pequeño puede mejorar en 4 puntos porcentuales la tasa de éxito de un planificador encarnado, con la mayor parte de la ganancia concentrada en las instrucciones abstractas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E2B) con adaptador LoRA sobre proyecciones de atención y feed-forward |
| Parámetros totales | 5.104.298.723 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima usada en entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantización | Q4_K_M (GGUF); base en 4-bit NF4 durante el entrenamiento QLoRA; adaptador en bfloat16 |
| Idiomas soportados | inglés (en), persa (fa) |
| Licencia | Apache-2.0 (sujeta a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (adaptadores PEFT) y GGUF (modelo fusionado cuantizado) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B en su variante instruction-tuned, un transformer decoder-only de aproximadamente 5.100 millones de parámetros. Sobre él se aplica un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, en las proyecciones de atención y feed-forward del modelo de lenguaje. El entrenamiento emplea QLoRA: la base se mantiene cuantizada en 4-bit NF4 y solo se actualizan los pesos del adaptador. La función de pérdida se calcula únicamente sobre los tokens del plan, no sobre el resto de la respuesta.

El conjunto de datos consta de 714 ejemplos únicos de la cocina de desarrollo (AI2-THOR FloorPlan1): 161 atómicos, 193 secuenciales y 360 abstractos, con la Scene Memory incluida en los prompts, más 88 ejemplos de validación procedentes de otros grupos de instrucciones. Los planes objetivo son la referencia de la instrucción o planes generados por Opus 5.5 que tuvieron éxito en el simulador. Se realizó una comprobación automática de solapamiento para evitar fugas de datos de las cocinas de evaluación o de instrucciones de test. El entrenamiento usó AdamW con tasa de aprendizaje 1e-4, decaimiento coseno, 13 pasos de calentamiento, 2 épocas, acumulación de gradiente 8 y 260 pasos de optimizador, con longitud máxima de 4.096 tokens. Se publican dos ejecuciones que solo difieren en la semilla.

## Capacidades

- Generación de planes de tareas de cocina en formato JSON estructurado, con acciones, objetos, destinos y argumentos.
- Planificación en tres niveles de abstracción: atómica (L1), secuencial (L2) y abstracta (L3).
- Comprensión de instrucciones en inglés y persa.
- Integración de contexto recuperado (Scene Memory) en el prompt para razonar sobre lo que el robot ha observado y sobre procedimientos almacenados.
- Generación de texto asociado al plan (campo `say`) para comunicación del agente.
- No dispone de tool calling ni function calling genérico; su salida es un plan para el conjunto de habilidades fijo de MISE.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Planificación de tareas domésticas en simulación: el modelo convierte una orden como "prepara la cena" en una secuencia de acciones ejecutables en AI2-THOR, aprovechando la Scene Memory para adaptar el plan a los objetos observados.
- Investigación en agentes encarnados: sirve como planificador de referencia de bajo coste para experimentos de RAG y planificación jerárquica, al poder entrenarse en una GPU de portátil de 8 GB.
- Evaluación comparativa de ajuste fino: los dos runs publicados permiten estudiar la varianza entre semillas en tareas de planificación con datos escasos.
- Soporte multilingüe en robótica doméstica: permite emitir instrucciones en persa y obtener planes en el mismo formato que con inglés, útil para validar robustez cross-lingüe.
- Prototipado de asistentes de cocina con razonamiento sobre estado del entorno: la inclusión de la memoria de escena permite generar planes condicionados a lo que el robot ya ha visto.
- Despliegue ligero con Ollama: el GGUF Q4_K_M y el Modelfile incluido permiten reproducir las condiciones experimentales en hardware modesto.

## Benchmarks y rendimiento

Tasa de éxito en las cocinas reservadas (media de las cocinas A y B, con Scene Memory en el momento de test):

| Planificador | Éxito (%) |
|---|---|
| MISE (Gemma 4 E2B sin ajuste fino) | 77,2 |
| MISE-FT, run 1 | 80,8 |
| MISE-FT, run 2 | 81,8 |

Sobre las dos ejecuciones, MISE-FT supera a MISE en +4,0 puntos (comparación emparejada, IC 95 % de 1,3 a 6,8). La mayor parte de la mejora se concentra en las instrucciones abstractas (L3). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en Q4_K_M (tamaño del repo GGUF: 4,6 GB); en bfloat16, en torno a 10-11 GB.
- GPU recomendadas: RTX 4060 Laptop (8 GB) suficiente para entrenamiento QLoRA e inferencia cuantizada; RTX 4090, A100 o H100 para inferencia en precisión completa o mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando la cuantización Q4_K_M.
- Opciones de despliegue: Ollama (Modelfile incluido), PEFT + transformers, y previsiblemente llama.cpp y vLLM con el GGUF o los pesos fusionados.
- Latencia y throughput: no disponibles. El entrenamiento requirió unas 3 horas por ejecución en una RTX 4060 Laptop.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MISE-FT (este modelo) | 5,1 B | 4.096 tokens (entrenamiento) | Planificación de cocina en AI2-THOR | Apache-2.0 | Hugging Face (adaptadores y GGUF) |
| Gemma 4 E2B-it (base) | 5,1 B | no disponible | Asistente general instruction-tuned | Apache-2.0 (licencia Gemma 4) | Hugging Face |
| MISE (Gemma 4 E2B sin ajuste) | 5,1 B | no disponible | Planificación de cocina en AI2-THOR | Apache-2.0 | Uso interno en el proyecto MISE |

No se dispone de información sobre otros planificadores encarnados comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo simulación: entrenado y evaluado en cocinas de AI2-THOR, nunca en un robot real.
- Entrenado en una única cocina de desarrollo y evaluado en dos cocinas reservadas; la generalización a otros entornos no está demostrada.
- El modelo no es un asistente general: sus salidas son planes para el conjunto de habilidades de MISE y carecen de sentido sin los prompts del planificador.
- Requiere la Scene Memory en el prompt; existe una ejecución entrenada sin ella que no forma parte de MISE-FT y no se publica.
- Riesgo de alucinación en la generación de acciones u objetos no presentes en el entorno, aunque la evaluación se realizó sin ground truth del simulador en test.
- Sesgos conocidos: no documentados por el autor.
- Restricciones de licencia: Apache-2.0, pero al ser un derivado de Gemma 4 queda sujeta a la licencia Gemma 4 de Google; conviene revisar sus términos para uso comercial.
- Los datos de entrenamiento no se publican, lo que limita la reproducibilidad completa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArashNasr/mise-ft-gemma4-e2b
- Repositorio MISE: https://github.com/ArashNasrEsfahani/MISE
- Página del proyecto MISE: https://arashnasresfahani.github.io/MISE/
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Simulador AI2-THOR: https://ai2thor.allenai.org/
