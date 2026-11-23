# namuax/hvme-router-4b

## Resumen

hvme-router-4b es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por namuax como componente de enrutamiento dentro de hvme, un toolkit de razonamiento causal. Se trata de un fine-tuning mediante LoRA (r=16, fusionado en los pesos finales) sobre el modelo base namuax/hvme-fast-4b, que a su vez deriva de Qwen/Qwen3.5-4B. Su función concreta es clasificar una pregunta en los tres niveles de la escalera de Pearl (1 asociación, 2 intervención, 3 contrafactual) en inglés y coreano, de modo que el orquestador del sistema seleccione la tubería adecuada.

El modelo no está pensado como un generador de texto de propósito general, sino como un clasificador especializado que conserva la cabeza de sí/no heredada de hvme-fast-4b. La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico de modelos pequeños orientados a tareas (task-specific) dentro de arquitecturas de agentes; por otro, ilustra el patrón de "motor causal + modelo que lee preguntas y llama a la herramienta", donde el modelo por sí solo no reproduce los resultados reportados.

La arquitectura es la del transformer causal de Qwen3.5 (etiqueta qwen3_5_text en el repositorio), con licencia Apache-2.0 y pesos en safetensors. El repositorio ocupa 8,4 GB, lo que incluye los pesos en precisión de entrenamiento. La versión interna corresponde a v2-router-ko3, semilla 1, fechada el 18 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5, etiqueta `qwen3_5_text`); fine-tuning LoRA r=16 fusionado sobre `namuax/hvme-fast-4b` |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | inglés (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de hvme-fast-4b, un Qwen3.5-4B ya ajustado, y aplica un LoRA de rango 16 cuyos pesos se fusionan en el checkpoint final. Conserva la cabeza de clasificación sí/no del modelo base, de modo que el mismo checkpoint sirve tanto para el enrutamiento por niveles de Pearl como para preguntas binarias de causalidad. No se documentan cambios arquitectónicos adicionales sobre el transformer causal estándar de Qwen3.5.

El conjunto de entrenamiento combina 4.000 preguntas en inglés y 4.600 en coreano del denominado hvme Gym Rung (incluidas 600 muestras en coreano sin formato), más 6.000 elementos de repetición (replay) de juez. Las preguntas que comparan correlación con causalidad ("¿es la correlación el efecto causal?") se etiquetan explícitamente como nivel 2. El autor advierte que las preguntas son sintéticas y formales (SCM binarios, grafos causales, afirmaciones de independencia), y que el modelo está entrenado para invocar el motor causal de hvme y responder a partir de su resultado. El archivo hvme_fast.json del repositorio contiene las temperaturas por tarea y los metadatos de entrenamiento. Se trata de la semilla 1 de tres ejecuciones.

## Capacidades

- Clasificación de preguntas en los tres niveles de la escalera de Pearl (asociación, intervención, contrafactual) en inglés y coreano.
- Respuesta a preguntas binarias de causalidad mediante la cabeza sí/no heredada del modelo base.
- Lectura de preguntas causales formales y llamada al motor de hvme para obtener la cantidad causal correspondiente.
- Integración con el orquestador de hvme a través de la clase `FastJudge` y de la variable de entorno `HVME_ROUTER`.
- Uso de temperaturas específicas por tarea definidas en `hvme_fast.json`.
- Capacidad multilingüe limitada a inglés y coreano.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo de razonamiento extendido más allá de la llamada al motor causal.

## Casos de uso

- Enrutamiento dentro de un pipeline de razonamiento causal: el modelo recibe la pregunta del usuario y decide si corresponde a asociación, intervención o contrafactual, de forma que el orquestador de hvme active la tubería de cálculo adecuada. Es su función principal y para la que fue entrenado.
- Clasificación de consultas en asistentes analíticos: en una herramienta de análisis de datos, el modelo puede separar preguntas descriptivas ("¿qué correlación hay entre X e Y?") de preguntas interventivas ("¿qué pasa si fijamos X?") antes de lanzar el cómputo.
- Filtrado previo en sistemas de documentación causal: dado un corpus de preguntas de usuarios, el modelo etiqueta cada una por nivel de Pearl para enrutarla al revisor o al motor correspondiente.
- Soporte a evaluación de supuestos en investigación: el modelo responde preguntas binarias sobre si una afirmación de independencia o un grafo causal es consistente, apoyándose en la cabeza sí/no.
- Localización inglés-coreano en productos de análisis: al cubrir ambos idiomas, permite desplegar el mismo componente de enrutamiento en interfaces en inglés y en coreano sin un modelo separado.
- Componente de un agente causal multi-paso: el orquestador puede encadenar la clasificación del router con la llamada al motor y la generación de la explicación final, usando el router como primer paso de decisión.
- Evaluación comparativa de pipelines causales: al ser determinista en su tarea de clasificación (con temperaturas fijas por tarea), sirve como referencia para medir la calidad del enrutamiento en experimentos internos.

## Benchmarks y rendimiento

| Conjunto | Métrica | Resultado |
|---|---|---|
| CLadder Rung | Precisión de nivel | 0,997 |
| KoCLadder Rung | Precisión de nivel | 0,987 |
| Preguntas de demostración (18) | Precisión de nivel | 0,889 |
| CLadder 600 (cabeza sí/no) | Precisión | 0,825 |
| Corr2Cause (cabeza sí/no) | Precisión | 0,800 |
| CauGym sí/no (cabeza sí/no) | Precisión | 0,756 |
| CaLM `-B` (cabeza sí/no) | Precisión | 0,742 |

El autor advierte que estos números solo son válidos con el bucle de herramienta activo (llamada al motor causal de hvme); sin él, el modelo es un Qwen3.5 ajustado y las cifras no aplican. Las cifras de KoCLadder son medias de tres ejecuciones con vLLM, y ejecuciones individuales pueden diferir hasta unos 8 elementos en CLadder 150 y 2 puntos en KMMLU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,2 mil millones de parámetros, en fp16 requiere aproximadamente 8,4 GB de pesos más memoria para activaciones y caché KV; en cuantización de 8 bits rondaría los 4,3 GB y en 4 bits unos 2,2 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son suficientes en fp16; una GPU consumer de 8-12 GB podría alojar el modelo cuantizado, si se generan pesos GGUF a partir del checkpoint.
- Cabe en GPU consumer: sí, en principio, con cuantización; en fp16 requiere al menos 12 GB de VRAM para dejar margen a la caché KV.
- Opciones de despliegue: la model card documenta `transformers` con `FastJudge.load(path, device="cuda:0")` y menciona ejecuciones con vLLM para las evaluaciones de KoCLadder. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| hvme-router-4b | 4,2 mil millones | no disponible | en, ko | Apache-2.0 | Enrutamiento causal (escalera de Pearl) y sí/no |
| Qwen3.5-4B (base) | no disponible en esta ficha | no disponible | no disponible | Apache-2.0 | Modelo de propósito general |
| hvme-fast-4b (modelo base directo) | no disponible en esta ficha | no disponible | no disponible | no disponible | Juez causal con cabeza sí/no |

No se dispone de datos de benchmarks de Qwen3.5-4B ni de hvme-fast-4b en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellos. La comparación relevante es funcional: hvme-router-4b añade la clasificación por niveles de Pearl sobre hvme-fast-4b, que a su vez especializa Qwen3.5-4B en tareas causales.

## Limitaciones y advertencias

- El modelo está entrenado para llamar al motor causal de hvme y responder a partir de su resultado; sin el bucle de herramienta, es un Qwen3.5 ajustado y las métricas reportadas no se aplican.
- Las preguntas de entrenamiento son sintéticas y formales (SCM binarios, grafos causales, afirmaciones de independencia); la causalidad en texto libre y de sentido común (causalidad de eventos, explicación causal) es más débil.
- Los conjuntos de evaluación en coreano son traducciones automáticas: una revisión de 74 elementos de KoCLadder que el modelo falla solo en coreano encontró 22 errores o ambigüedades de traducción; los otros 52 corresponden a fallos reales del modelo (condiciones negadas, "~에 따라 각각" interpretado como conjunto de ajuste, paso de conclusión, bucles de repetición).
- Variabilidad entre ejecuciones: hasta unos 8 elementos de diferencia en CLadder 150 y 2 puntos en KMMLU entre entrenamientos individuales; diferencias menores son ruido.
- No debe usarse para decisiones médicas, legales o de políticas sin una persona que revise el grafo y los supuestos.
- Idiomas limitados a inglés y coreano; no se documenta soporte para castellano.
- Riesgo de alucinación no cuantificado en la información disponible; el autor no publica tasas de alucinación.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namuax/hvme-router-4b
- Repositorio del toolkit hvme: https://github.com/namuax/hvme
- Modelo base directo: https://huggingface.co/namuax/hvme-fast-4b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
