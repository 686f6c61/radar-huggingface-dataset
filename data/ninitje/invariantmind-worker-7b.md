# Ninitje/InvariantMind-Worker-7B

## Resumen

InvariantMind-Worker-7B es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct, publicado por el usuario Ninitje bajo licencia Apache 2.0. Forma parte de una arquitectura declarada de dos niveles: un "Oracle" de 14B (InvariantMind-v1-14B) orientado a síntesis epistémica, generación de hipótesis y pruebas formales, y este "Worker" de 7B especializado en convertir conjeturas teóricas en código de simulación vectorizado, integradores numéricos de EDO/EDP y suites de verificación empírica automatizada.

El modelo no es un modelo completo entrenado desde cero, sino un adaptador de bajo rango obtenido mediante QLoRA en 4 bits (NormalFloat) con rango r=64 y alpha=128, entrenado sobre 2.330 episodios científicos curados con un total de 19,4 MB de datos. Su enfoque declarado son las capacidades de computación científica de alto rendimiento: NumPy, SciPy y Numba, solvers de ecuaciones diferenciales rígidas, motores de autómatas celulares y comprobaciones de invariantes asociadas a leyes de conservación.

La relevancia de esta ficha es acotada: se trata de un adaptador con 0 descargas y 0 "likes" en el momento de la consulta, sin resultados de benchmarks publicados y con información de idiomas no disponible. Su interés práctico reside en el nicho concreto de la generación de código de simulación verificable, y en que puede ejecutarse sobre el modelo base de 7B con requisitos de hardware moderados, lo que lo hace desplegable en una única GPU de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-7B-Instruct) con adaptador LoRA acoplado |
| Parametros totales | 7,6B en el modelo base (no disponible el desglose exacto de parametros del adaptador) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la ficha del adaptador. El modelo base Qwen2.5-Coder-7B-Instruct declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | Adaptador entrenado con QLoRA en 4 bits NF4 (bnb_4bit_quant_type="nf4", compute dtype bfloat16). No se publican pesos pre-cuantizados en otros formatos |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso del que no se detallan en la información disponible los hiperparámetros de atención (número de capas, cabezas, uso de GQA). El método de ajuste fino declarado es QLoRA con cuantización 4-bit NormalFloat, rango r=64 y alpha=128. El conjunto de entrenamiento, denominado "colony training data", consta de 2.330 episodios científicos curados que ocupan 19,4 MB e incluyen scripts de simulación, suites de verificación y llamadas a herramientas epistémicas. El autor también etiqueta el modelo con "colony-trained" y "qlora", y no menciona fases de RLHF ni DPO para este adaptador concreto (el modelo hermano de 14B sí incluye la etiqueta "dpo").

Las capacidades objetivo declaradas son la computación científica vectorizada de alto rendimiento con NumPy, SciPy y Numba, la resolución de ecuaciones diferenciales rígidas, la implementación de motores de autómatas celulares y la comprobación de invariantes asociadas a leyes de conservación. Los ejemplos de uso de la model card se centran en simulaciones de osciladores de Kuramoto acoplados y en el cálculo del parámetro de orden R(t). No se documentan innovaciones de arquitectura propias del adaptador, ni técnicas de decodificación especulativa, atención lineal o mecanismos híbridos: las prestaciones técnicas heredan las del modelo base, y la especialización se obtiene exclusivamente por ajuste de bajo rango.

## Capacidades

- Generación de código científico: implementaciones vectorizadas con NumPy, SciPy y Numba, según los objetivos declarados por el autor.
- Integradores numéricos de ecuaciones diferenciales ordinarias y en derivadas parciales, con mención explícita a solvers de sistemas rígidos (stiff).
- Simulación de sistemas dinámicos: osciladores de Kuramoto acoplados y cálculo del parámetro de orden R(t).
- Motores de autómatas celulares (cellular automata engines), según las etiquetas y la descripción del modelo.
- Verificación de invariantes y comprobaciones de leyes de conservación dentro del código generado.
- Llamadas a herramientas epistémicas (epistemic tool calls) incluidas en los datos de entrenamiento, lo que sugiere soporte de tool calling orientado a flujos de experimentación.
- Integración en un pipeline de agentes de dos niveles: el Oracle de 14B genera hipótesis y este Worker las convierte en código ejecutable y verificable.
- Generación de texto conversacional: la etiqueta de pipeline es text-generation y el modelo se presenta con formato conversacional (apply_chat_template).
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible; no se mencionan en la ficha.

## Casos de uso

- Generación de código de simulación numérica: el modelo recibe la descripción de un sistema dinámico (por ejemplo, osciladores de Kuramoto acoplados) y devuelve una implementación vectorizada con NumPy que calcula magnitudes derivadas como el parámetro de orden R(t). Es el caso de uso que el propio autor documenta en la model card.
- Resolución de ecuaciones diferenciales rígidas: dado que el entrenamiento incluye solvers de EDO/EDP, puede emplearse para generar esqueletos de integración con SciPy (solve_ivp, métodos implícitos) y para seleccionar estrategias de integración adecuadas en problemas con escalas temporales dispares.
- Docencia e investigación en sistemas complejos: generación de material reproducible para cursos o artículos, con scripts de autómatas celulares, modelos de Kuramoto o sistemas con leyes de conservación, listos para ejecutar y modificar.
- Verificación automatizada de código científico: el adaptador puede producir, junto al código de simulación, comprobaciones de invariantes (conservación de energía, masa o momento), lo que encaja en pipelines de integración continua para validar resultados numéricos antes de publicarlos o desplegarlos.
- Agente de ejecución dentro de un sistema multi-agente científico: conectado al Oracle de 14B de la misma familia, el Worker actúa como el componente que materializa hipótesis en experimentos ejecutables; el reparto Oracle/Worker permite reservar el modelo grande para razonamiento y el pequeño para síntesis de código.
- Prototipado rápido en cuadernos de cálculo: al ser un adaptador sobre un modelo de 7B cuantizable en 4 bits, se puede cargar en una GPU de consumo para asistir en la escritura de simulaciones interactivas sin depender de APIs externas.
- Generación de código de simulación en entornos con requisitos de confidencialidad: al ejecutarse en local sobre pesos abiertos con licencia Apache 2.0, permite trabajar con datos o modelos físicos sensibles sin enviarlos a servicios de terceros.
- Automatización de barridos de parámetros: generación de scripts que recorren rangos de parámetros de un modelo (por ejemplo, constante de acoplamiento en Kuramoto) y agregan resultados, reduciendo el trabajo manual de escribir bucles de experimentación repetitivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye métricas de MMLU, HumanEval, GSM8K, MBPP, ni evaluaciones específicas de código científico, y tampoco se han encontrado en los resultados de búsqueda web. No se deben extrapolar los resultados del modelo base Qwen2.5-Coder-7B-Instruct como si fueran los de este adaptador, ya que el ajuste fino con QLoRA puede alterar el rendimiento en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 15-16 GB en precisión bf16/fp16 para el modelo base de 7,6B, y aproximadamente 5-6 GB con cuantización de 4 bits (NF4), que es además el modo en que la model card propone cargarlo (BitsAndBytesConfig con load_in_4bit).
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para servir en fp16 con contexto largo; RTX 4090, RTX 4080 o RTX 3090 para uso local en 4 bits.
- Compatibilidad con GPU de consumo: sí, en 4 bits cabe en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti), siempre que se aplique la cuantización y se limite la longitud de contexto.
- Opciones de despliegue: PEFT junto con transformers (el camino documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI, Ollama y llama.cpp (requiere convertir el modelo base a GGUF y aplicar el adaptador LoRA en formato GGUF). Las estimaciones anteriores son orientativas y no proceden de mediciones publicadas por el autor.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InvariantMind-Worker-7B | 7,6B (base) + adaptador LoRA | No disponible en la ficha del adaptador (32.768 tokens en el modelo base) | Adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 tokens nativos | Modelo completo denso | Apache 2.0 (segun la ficha del modelo base) | Ampliamente distribuido en HuggingFace |
| InvariantMind-v1-14B | 14B (segun su ficha) | No disponible | Adaptador PEFT con QLoRA y DPO, mismo autor | Apache 2.0 | HuggingFace, 0 likes en el momento de la consulta |
| Mistral-7B-Instruct-v0.2 | 7,2B | 32.000 tokens | Modelo completo denso | Apache 2.0 | Ampliamente distribuido |
| Mathstral-7B | 7B | No disponible | Modelo completo orientado a matemáticas y descubrimiento científico | Apache 2.0 (segun su distribucion en Ollama) | Disponible en Ollama y HuggingFace |

No se dispone de datos de benchmarks comparativos entre estas opciones en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Cualquier afirmación sobre superioridad de rendimiento requeriría una evaluación propia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el adaptador mejore al modelo base en las tareas que declara, ni de que no degrade sus capacidades generales.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de terceros.
- Volumen de entrenamiento reducido: 2.330 episodios y 19,4 MB de datos son un conjunto pequeño para un ajuste fino; el riesgo de sobreajuste al estilo y al dominio de esos episodios es alto.
- Riesgo de alucinación en código numérico: el modelo puede generar APIs inexistentes, parámetros incorrectos de SciPy o integradores inestables que se ejecutan sin error pero producen resultados físicamente inválidos. Toda salida debe validarse ejecutándola y contrastando invariantes.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento correcto en castellano ni en otros idiomas distintos del inglés, dado que la ficha no documenta la composición lingüística del conjunto de entrenamiento.
- Ámbito funcional estrecho: la especialización en simulación científica y computación vectorizada puede reducir el rendimiento en tareas generales de conversación, redacción o código de aplicación no científico.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar por su cuenta que el modelo base y los datos de entrenamiento no introduzcan restricciones adicionales; la ficha del adaptador no detalla el origen ni la licencia de los 2.330 episodios científicos empleados.
- Dependencia de la cuantización: el modo de carga documentado usa 4 bits, lo que introduce pérdida de precisión respecto a bf16; los resultados pueden variar según la configuración de cuantización.
- Sin garantías de mantenimiento: el repositorio tiene una única revisión publicada y no se documentan versiones posteriores ni soporte del autor.
- Uso en producción: no recomendable como componente crítico sin una evaluación propia y sin un mecanismo de verificación automática de los artefactos generados.

## Enlaces

- [Ninitje/InvariantMind-Worker-7B en HuggingFace](https://huggingface.co/Ninitje/InvariantMind-Worker-7B)
- [Ninitje/InvariantMind-v1-14B en HuggingFace (modelo hermano, Tier 1 Oracle)](https://huggingface.co/Ninitje/InvariantMind-v1-14B)
- [Qwen/Qwen2.5-Coder-7B-Instruct en HuggingFace (modelo base)](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- [Repositorio de PEFT (libreria declarada por el modelo)](https://github.com/huggingface/peft)
- [Mistral-7B-Instruct-v0.2 (referencia comparativa)](https://github.com/inferless/Mistral-7B-Instruct-v0.2/)
- [Mathstral 7B en Ollama (referencia comparativa en el ambito cientifico-matematico)](https://ollama.com/search?q=7b)
- [Guia de seleccion de parametros de modelos LLM 2026 (referencia sobre requisitos de hardware)](https://local-ai-zone.github.io/guides/what-is-ai-model-3b-7b-30b-parameters-guide-2025.html)
- [Catalogo de modelos de Cloudflare Workers AI (referencia de despliegue)](https://developers.cloudflare.com/workers-ai/models/)
