# mradermacher/llemma_34b-GGUF

## Resumen

Llemma 34B es un modelo de lenguaje especializado en matemáticas y razonamiento, desarrollado originalmente por EleutherAI como continuación de su trabajo en modelos abiertos de gran escala. Se construye a partir de Code Llama 34B mediante entrenamiento continuo sobre Proof-Pile-2, un corpus masivo de contenido matemático que incluye artículos de arXiv, textos de OpenWebMath y código matemático. El resultado es un modelo capaz de resolver problemas matemáticos, generar demostraciones formales y razonar paso a paso, pero con un enfoque mucho más específico que los modelos generalistas.

La ficha que nos ocupa documenta la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base tiene 33.743.970.304 parámetros (aproximadamente 34B), licencia Llama 2, y está entrenado exclusivamente en inglés. Su relevancia radica en ser uno de los pocos modelos abiertos de gran tamaño específicamente orientados a matemáticas, lo que lo convierte en una referencia para investigación en razonamiento automático y para aplicaciones que requieren precisión en dominios técnicos.

El repositorio GGUF ofrece un abanico de cuantizaciones desde Q2_K (12,6 GB) hasta Q8_0 (36,0 GB), lo que permite desplegar el modelo en configuraciones que van desde GPUs de consumo con 16 GB de VRAM hasta estaciones de trabajo con múltiples GPUs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Code Llama 34B) |
| Parámetros totales | 33.743.970.304 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (también disponibles quants imatrix en repositorio separado) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 2 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base EleutherAI/llemma_34b) |

## Arquitectura y entrenamiento

Llemma 34B parte de Code Llama 34B, un transformer decoder-only con atención causal estándar, y se somete a un proceso de entrenamiento continuo sobre Proof-Pile-2. Este dataset, compilado por EleutherAI, combina artículos matemáticos de arXiv, contenido de OpenWebMath y código fuente con componente matemática. El objetivo del entrenamiento no es la conversación general, sino la competencia en matemáticas: resolución de problemas, generación de demostraciones y razonamiento simbólico. No se especifica en la información disponible si hubo fases de RLHF o DPO; la model card del repositorio GGUF no detalla el proceso de alineación.

La innovación principal de Llemma reside en su especialización: en lugar de competir en benchmarks generalistas, el modelo se entrena con un corpus denso en notación matemática y demostraciones formales, lo que le permite mantener coherencia en cadenas de razonamiento largas. El proceso de cuantización realizado por mradermacher emplea la librería llama.cpp y ofrece tanto quants estáticos como quants con imatrix (ponderados), estos últimos publicados en un repositorio separado (`mradermacher/llemma_34b-i1-GGUF`). La cuantización imatrix suele preservar mejor la calidad en modelos especializados, por lo que es la opción recomendada si el espacio de almacenamiento lo permite.

## Capacidades

- Generación de texto especializada en matemáticas: resolución de problemas algebraicos, cálculo, demostraciones y razonamiento paso a paso.
- Razonamiento simbólico y manipulación de expresiones matemáticas.
- Generación de código con sesgo matemático (heredado de Code Llama), útil para scripting científico y computación numérica.
- Capacidad de seguir instrucciones técnicas y mantener contexto en conversaciones multi-turno (limitado por la longitud de contexto no especificada).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo está orientado a razonamiento matemático, no a orquestación de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se documentan modos de pensamiento explícitos, visión ni audio.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede generar soluciones paso a paso para ejercicios de álgebra, cálculo y estadística, aprovechando su entrenamiento sobre Proof-Pile-2 para mantener rigor en las demostraciones. Es adecuado para plataformas de tutoría automatizada en inglés.
- Generación de demostraciones formales en asistentes de prueba: investigadores pueden usar Llemma para proponer lemas y tácticas en sistemas como Lean o Isabelle, aunque requerirá validación humana dado el riesgo de alucinación en pasos intermedios.
- Análisis de literatura matemática: el modelo puede resumir y explicar pasajes de artículos de arXiv, extrayendo definiciones y teoremas, gracias a su exposición a contenido de OpenWebMath y Proof-Pile-2.
- Scripting científico y computación numérica: con herencia de Code Llama, puede generar código Python/NumPy para cálculos, aunque su especialización matemática lo hace más fiable en la lógica que en la sintaxis de frameworks específicos.
- Preprocesamiento de datos matemáticos: uso del modelo para normalizar, clasificar o extraer información de expresiones matemáticas en pipelines de datos, aprovechando su familiaridad con notación LaTeX y simbólica.
- Investigación en razonamiento automático: como modelo abierto de 34B especializado, sirve como baseline para experimentos de fine-tuning en dominios matemáticos o para estudiar sesgos y fallos en razonamiento de modelos grandes.
- Despliegue en local para prototipado: las cuantizaciones GGUF permiten ejecutar el modelo en estaciones de trabajo sin depender de APIs externas, útil para pruebas de concepto con datos sensibles o en entornos air-gapped.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 12,6 GB (Q2_K) y 36,0 GB (Q8_0) solo para los pesos; añadir overhead de contexto y caché KV (típicamente 1-4 GB adicionales según longitud de contexto).
- GPU recomendadas: para Q8_0 se requiere una GPU con 40-48 GB (A100 40GB, A6000 48GB, RTX 6000 Ada); para Q4_K_M (20,3 GB) basta una RTX 4090 (24 GB) o A5000 (24 GB); para Q2_K (12,6 GB) cabe en RTX 4070 Ti (16 GB) o RTX 3060 (12 GB) con contexto reducido.
- Cabe en GPU de consumo: sí, en configuraciones Q2_K a Q4_K_M con GPUs de 12-24 GB, siempre que se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), text-generation-webui, LM Studio, y servidores compatibles con la API de OpenAI a través de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia orientativa, un modelo de 34B en Q4_K_M en una RTX 4090 suele generar entre 10 y 20 tokens por segundo, pero este dato no está confirmado para esta ficha.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Llemma 34B (este) | 33,7B | No disponible | Matemáticas y razonamiento | Llama 2 | GGUF, safetensors |
| Code Llama 34B | 33,7B | 16K (según documentación pública de Meta) | Código | Llama 2 | safetensors, GGUF |
| MetaMath 70B | 70B | No disponible | Matemáticas | Llama 2 | safetensors, GGUF |
| WizardMath 70B | 70B | No disponible | Matemáticas | Llama 2 | safetensors, GGUF |

La comparación con Code Llama 34B es directa porque Llemma se deriva de él; la diferencia principal es el entrenamiento continuo sobre Proof-Pile-2, que desplaza la especialización hacia matemáticas. Frente a MetaMath y WizardMath, Llemma 34B ofrece un tamaño menor (34B frente a 70B) pero con un corpus de entrenamiento específicamente diseñado para razonamiento matemático formal. No se dispone de datos de benchmarks en la información proporcionada para comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse principalmente sobre literatura matemática académica en inglés, el modelo puede reflejar sesgos de ese corpus (predominio de ciertas notaciones, estilos de demostración y convenciones occidentales).
- Riesgo de alucinación: elevado en pasos intermedios de demostraciones largas; el modelo puede generar pasos plausibles pero incorrectos, por lo que requiere validación humana o verificación automática en producción.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible; se recomienda precaución al usar contextos largos sin verificar el comportamiento.
- Limitaciones de idioma: solo inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Restricciones de licencia: licencia Llama 2, que impone condiciones de uso comercial (incluida la obligación de aceptar la licencia de Meta y restricciones para empresas con más de 700 millones de usuarios mensuales). Revisar los términos completos antes de uso comercial.
- Caveat para producción: el modelo está especializado en matemáticas y no es un asistente general; su uso en atención al cliente o tareas conversacionales generales dará resultados pobres. Además, las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el razonamiento matemático; se recomienda Q4_K_M o superior para aplicaciones serias.
- El repositorio GGUF tiene 220 descargas y 0 likes en el momento de la consulta, lo que indica baja adopción comunitaria; no hay evidencia de validación extensa por terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/llemma_34b-GGUF
- Modelo base: https://huggingface.co/EleutherAI/llemma_34b
- Quants imatrix: https://huggingface.co/mradermacher/llemma_34b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#llemma_34b-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper de Llemma (referencia externa, no incluida en la información proporcionada): no disponible en la información proporcionada.
