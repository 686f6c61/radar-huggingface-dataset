# Listen-AI/Qwen3.6-35B-A3B-Nebula-GGUF

## Resumen

Qwen3.6-35B-A3B-Nebula-GGUF es una versión cuantizada del modelo base Qwen/Qwen3.6-35B-A3B, publicada por ListenAI. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del modelo original de Qwen Team a un formato de cuantización propietario de ListenAI, empaquetado en GGUF y optimizado específicamente para la inferencia en el chip Nebula de ListenAI. El modelo conserva la arquitectura y los pesos del modelo base, pero altera la representación numérica de los pesos para reducir el coste computacional y de memoria en el hardware objetivo.

La relevancia de esta ficha no reside tanto en el modelo lingüístico en sí (cuyas capacidades hereda de Qwen3.6-35B-A3B) como en el formato de despliegue: un esquema de cuantización INT4 de dos niveles E4M0 con group size 32 y `desc_act=false`, derivado de GPTQ y adaptado por ListenAI. Este formato puede no ser compatible con motores GGUF estándar, lo que limita su uso a la implementación adaptada de llama.cpp distribuida por ListenAI y al runtime de Nebula.

El modelo base Qwen3.6-35B-A3B es un transformer de tipo MoE con 35B parámetros totales, del que esta ficha no dispone de datos detallados sobre parámetros activos, longitud de contexto o composición del dataset de entrenamiento más allá de lo indicado por el autor. La licencia declarada es Apache-2.0, heredada del modelo original, y el modelo se publicó el 13 de noviembre de 2026 con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (hereda la del modelo base Qwen3.6-35B-A3B; detalles no disponibles) |
| Parametros totales | 35B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 de pesos (E4M0, two-level, group size 32, `desc_act=false`), activaciones FP16 (W4A16); método GPTQ + cuantización propietaria Nebula |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.6-35B-A3B-ListenAI-Nebula-Q4K-E4M0.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B original, un transformer con mezcla de expertos (MoE) de 35B parámetros totales según la model card. No se dispone de información sobre el número de parámetros activos por token, el número de expertos, la dimensionalidad de las capas ni la estrategia de enrutamiento, ya que la model card remite al repositorio del modelo base para esos detalles.

En cuanto al entrenamiento, esta publicación no entrena el modelo desde cero: aplica una cuantización GPTQ combinada con el esquema propietario Nebula sobre los pesos del modelo base. La cuantización usa pesos INT4 en formato E4M0 de dos niveles con group size 32 y sin `desc_act`, manteniendo las activaciones en FP16 (W4A16). El resultado se serializa en GGUF con versión de cuantización 2 en los metadatos. No se documentan datos sobre el corpus de entrenamiento original, uso de RLHF/DPO ni innovaciones de decodificación, al no estar incluidos en la información proporcionada.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.6-35B-A3B, aunque la model card solo documenta y valida inferencia de texto.
- Generación de código: evaluada explícitamente por el autor con un conjunto de 656 muestras en Python, C++, Java y JavaScript mediante Pass@1.
- Razonamiento y matemáticas: no disponible información específica en la model card.
- Tool calling / function calling: no disponible información específica en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible información específica en la model card.
- Capacidades multilingües: no disponible información específica en la model card.
- Capacidades multimodales: no validadas; la model card indica que la inferencia multimodal no está validada.
- Modo thinking: no disponible información específica en la model card.

## Casos de uso

- Despliegue en dispositivos con chip Nebula: el caso principal y único validado por el autor. El modelo está optimizado para el runtime de Nebula y debe cargarse con la implementación adaptada de llama.cpp, lo que permite ejecutar un modelo de 35B en INT4 dentro de la plataforma de ListenAI.
- Evaluación de cuantización propietaria: útil para investigadores que quieran comparar el impacto del esquema E4M0 W4A16 frente a FP16 en tareas de código, usando el conjunto de 656 muestras y la métrica Pass@1 reportados por el autor.
- Generación de código en entornos embebidos: gracias a la preservación casi total del rendimiento en Python (90,24% frente a 89,63% en FP16) y Java (87,20% frente a 85,98%), puede emplearse para asistencia de código en plataformas con recursos limitados, siempre que se disponga del hardware Nebula.
- Sustitución de FP16 en pipelines con restricciones de memoria: la representación INT4 reduce el espacio de pesos aproximadamente a una cuarta parte respecto a FP16, lo que facilita el despliegue en entornos con presupuesto de VRAM o memoria ajustado, condicionado a la compatibilidad del runtime.
- Investigación sobre formatos GGUF no estándar: sirve como caso de estudio de metadatos GGUF con versión de cuantización 2 y esquemas two-level, para estudiar interoperabilidad entre motores de inferencia.
- Pruebas de regresión de código multi-lenguaje: el conjunto de evaluación del autor (Python, C++, Java, JavaScript) permite usar el modelo como referencia en pipelines de CI para medir degradación tras cuantización.

## Benchmarks y rendimiento

El autor publica resultados de Pass@1 sobre 656 muestras de código, comparando FP16 frente a W4A16_E4M0:

| Modelo | Python | C++ | Java | JavaScript | Overall |
|---|---:|---:|---:|---:|---:|
| FP16 baseline | 89,63% | 81,71% | 85,98% | 90,24% | 86,89% |
| W4A16_E4M0 | 90,24% | 80,49% | 87,20% | 85,98% | 85,98% |

La cuantización INT4 mantiene el rendimiento global dentro de 0,91 puntos porcentuales del baseline FP16, con ligeras mejoras en Python y Java y caídas en C++ (1,22 puntos) y JavaScript (4,26 puntos). No se han publicado resultados de benchmarks generales (MMLU, GSM8K, HumanEval estándar) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 35B parámetros en INT4 (aproximadamente 4 bits por peso) más activaciones FP16, el peso ronda los 17-18 GB, pero la model card no confirma esta cifra ni el overhead del runtime Nebula.
- GPU recomendadas: no disponible. El hardware objetivo declarado es el chip ListenAI Nebula, cuya especificación exacta no se detalla.
- Compatibilidad con GPU consumer: no validada. La model card indica que otras plataformas no han sido validadas.
- Opciones de despliegue: únicamente la implementación adaptada de llama.cpp de ListenAI con el runtime y driver de Nebula. Los motores GGUF estándar (llama.cpp upstream, Ollama, vLLM, TGI) pueden no soportar el formato de cuantización propietario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Listen-AI/Qwen3.6-35B-A3B-Nebula-GGUF | 35B (MoE) | no disponible | GGUF INT4 propietario | Apache-2.0 | Solo runtime Nebula validado |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (MoE) | no disponible | safetensors (original) | Apache-2.0 | Amplia, motores estándar |
| Otras cuantizaciones GGUF del modelo base | 35B (MoE) | no disponible | GGUF estándar (Q4_K_M, etc.) | Apache-2.0 | llama.cpp, Ollama, etc. |

La diferencia clave frente al modelo base y frente a cuantizaciones GGUF convencionales es el esquema E4M0 two-level con group size 32, que exige un runtime adaptado y no está validado fuera de Nebula. No se dispone de datos de benchmarks comparables con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato de cuantización propietario puede no funcionar en motores GGUF estándar; es necesario usar la implementación adaptada de llama.cpp de ListenAI.
- Validación de hardware limitada: solo el chip Nebula está validado; otras plataformas no han sido probadas.
- Inferencia multimodal no validada: la model card solo documenta inferencia de texto.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- Riesgo de alucinación y sesgos: no documentados por el autor; al heredar el modelo base, arrastra los sesgos y limitaciones del mismo, no evaluados en esta publicación.
- Licencia: Apache-2.0 heredada del modelo base, pero conviene revisar los términos del modelo original y del runtime Nebula para uso comercial.
- Madurez: publicación con cero descargas y cero likes en el momento de la consulta; versión 1.0.0, sin comunidad que valide su comportamiento en producción.
- Rendimiento en JavaScript: caída de 4,26 puntos porcentuales frente a FP16 en el benchmark del autor, relevante si el caso de uso depende de ese lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Listen-AI/Qwen3.6-35B-A3B-Nebula-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
