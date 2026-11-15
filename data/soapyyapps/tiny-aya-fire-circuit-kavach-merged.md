# soapyyapps/tiny-aya-fire-circuit-kavach-merged

## Resumen

CircuitKavach-Aya es un ajuste fino del modelo CohereLabs/tiny-aya-fire (3.350 millones de parámetros) orientado a la alineación de seguridad frente a ataques de ciberseguridad con mezcla de idiomas índicos (hinglish, gujlish, tanglish, kanglish). Lo desarrolla el usuario soapyyapps en el marco del hackathon Lexsi Lab Track 2 y su propuesta técnica consiste en un "trasplante quirúrgico de circuitos": en lugar de reentrenar todos los pesos, identifica los submódulos responsables de la transmisión de la negativa a responder y aplica los deltas de pesos solo en ellos.

El resultado declarado es un aumento de la tasa de rechazo de ataques del 40,0 % al 94,5 % modificando únicamente el 2,55 % de los parámetros (4 de 72 bloques), manteniendo un 0 % de sobrerrechazo en peticiones benignas. Es relevante ahora porque demuestra que la alineación de seguridad puede hacerse con un coste computacional y de almacenamiento muy reducido, y porque aborda un hueco poco cubierto: la seguridad en entornos multilingües con code-mixing, donde los modelos base suelen fallar de forma sistemática.

El modelo hereda la arquitectura y el contexto del base tiny-aya-fire, está publicado con licencia Apache 2.0 y se distribuye en safetensors con un tamaño de repositorio de 6,7 GB. Su público objetivo son equipos de seguridad, investigadores de interpretabilidad mecanicista y desarrolladores que despliegan asistentes en entornos índicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (cohere2, segun tags de Hugging Face) |
| Parametros totales | 3.349.227.520 (3,35 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, hi, gu, ta, kn (incluye variantes code-mixed: hinglish, gujlish, tanglish, kanglish) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 6,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de CohereLabs/tiny-aya-fire, un transformer decoder-only de 3,35 B parámetros etiquetado como `cohere2` en Hugging Face. Sobre esa base, el autor aplica un pipeline de tres fases documentado en la model card. Primero, *Edge Attribution Patching with Integrated Gradients* (EAP-IG) sobre 99 pares contrastivos limpios/corruptos identifica el circuito principal de transmisión de la negativa, compuesto por `layers.0.mlp`, `layers.16.self_attn`, `layers.21.self_attn` y `layers.20.self_attn`. Segundo, entrena un adaptador LoRA dirigido con *SafeGrad SFT Alignment* y proyección de gradiente segura sobre ejemplos calibrados de ataques y peticiones benignas en idiomas índicos. Tercero, realiza el trasplante C-ΔΘ: aplica los deltas de pesos exclusivamente a los 4 submódulos del circuito (2,55 % de los parámetros totales) y deja intacto el 97,45 % restante de los pesos base.

La innovación destacable es metodológica: la combinación de atribución de circuitos con integrated gradients para localizar el mecanismo de rechazo y la posterior edición selectiva de pesos. El autor reporta una eficiencia de parámetros de 39,2× frente a un ajuste global completo (SafeTune al 100 % de los bloques), que alcanza un 99,0 % de rechazo pero con un coste de actualización mucho mayor. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, hindi, guyarati, tamil y canado, con soporte explícito de registros code-mixed (hinglish, gujlish, tanglish, kanglish).
- Rechazo de peticiones maliciosas de ciberseguridad en contextos multilingües: la tasa de rechazo de ataques pasa del 40,0 % al 94,5 % en el benchmark interno de 400 prompts.
- Preservación de la utilidad en peticiones benignas: 0 % de sobrerrechazo declarado, es decir, no se degrada la respuesta a consultas legítimas.
- Capacidad de "redteam pass" mejorada: 38,1 % frente al 19,0 % del base, lo que indica mayor robustez frente a intentos de jailbreak.
- Razonamiento y generación de código: heredados del modelo base tiny-aya-fire (no se documentan métricas específicas en esta ficha).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Moderación y filtrado de seguridad en asistentes multilingües: el modelo puede actuar como clasificador generativo de peticiones peligrosas en inglés e idiomas índicos, aprovechando su tasa de rechazo del 94,5 % en ataques code-mixed para bloquear consultas de ciberseguridad ofensiva antes de que lleguen a un modelo mayor.
- Despliegue de chatbots de atención al cliente en India: con 3,35 B parámetros y licencia Apache 2.0, puede servirse en una única GPU consumer y responder en hindi, guyarati, tamil y canado con mezcla natural de inglés, un patrón habitual en usuarios reales de la región.
- Investigación en interpretabilidad mecanicista: el circuito identificado (`layers.0.mlp`, `layers.16`, `layers.20` y `layers.21.self_attn`) y la colección de datasets, circuitos y logs publicada por el autor permiten reproducir el experimento y estudiar cómo se localiza la negativa en modelos pequeños.
- Base para alineación de seguridad de bajo coste: equipos con presupuesto limitado pueden replicar el pipeline C-ΔΘ sobre otros modelos de 3 B para añadir capas de seguridad sin reentrenar el modelo completo, reduciendo el coste de almacenamiento y cómputo en un factor cercano a 39×.
- Evaluación de robustez frente a jailbreaks: el modelo sirve como sujeto de pruebas en pipelines de red teaming que generan ataques adversariales en varios idiomas y miden la tasa de rechazo resultante.
- Educación y divulgación en ciberseguridad: al ser un modelo pequeño y abierto, puede integrarse en entornos de formación para demostrar cómo se comportan los asistentes ante consultas de seguridad ofensiva y cómo se mitigan.
- Prototipado rápido en entornos con recursos limitados: su tamaño permite iterar en local con cuantización (aunque el repo no publica variantes GGUF) y validar flujos conversacionales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un benchmark interno de 400 prompts (held-out). No son comparables con benchmarks estándar como MMLU o HumanEval, que no se han publicado en la información disponible.

| Metrica | Base (tiny-aya-fire) | SafeTune global (100 %) | C-ΔΘ quirurgico (2,55 %) | Delta vs base |
|---|---|---|---|---|
| Tasa de rechazo de ataques | 40,0 % | 99,0 % | 94,5 % | +54,5 pp |
| Sobrerrechazo en benignos | 0,0 % | 0,0 % | 0,0 % | 0,0 pp |
| Redteam pass rate | 19,0 % | 47,6 % | 38,1 % | +19,1 pp |
| Parametros modificados | 0 % | 100 % (72/72 bloques) | 2,55 % (4/72 bloques) | eficiencia 39,2× |

Rechazo de ataques por idioma (C-ΔΘ frente a base):

| Idioma | Base | C-ΔΘ | Delta |
|---|---|---|---|
| Ingles | 40,0 % | 100,0 % | +60,0 pp |
| Hinglish (hindi code-mixed) | 48,0 % | 100,0 % | +52,0 pp |
| Gujlish (guyarati code-mixed) | 6,0 % | 100,0 % | +94,0 pp |
| Kanglish (canado code-mixed) | 6,0 % | 78,0 % | +72,0 pp |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 6,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 10-12 GB. En cuantización de 8 bits, unos 3,5-4 GB; en 4 bits, unos 2 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: NVIDIA A100 40 GB, H100 80 GB o L40S para despliegues de producción con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en FP16 con margen amplio.
- Cabe en GPU consumer: sí; en RTX 4090 y 3090 en FP16, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) si se usa cuantización.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama son compatibles en principio con la arquitectura cohere2, aunque el repositorio no incluye variantes GGUF ni configuraciones de servidor verificadas; será necesario convertir los safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CircuitKavach-Aya (este modelo) | 3,35 B | no disponible | Seguridad multilingüe indico, edición selectiva de circuitos | Apache 2.0 | Hugging Face |
| CohereLabs/tiny-aya-fire (base) | 3,35 B | no disponible | Modelo multilingüe general | Apache 2.0 | Hugging Face |
| Aya Expanse 8B (Cohere) | 8 B | 8k (según documentación pública de Cohere) | Multilingüe general de mayor tamaño | no disponible en esta ficha | Hugging Face |
| Llama Guard 3 (Meta) | 8 B (basado en Llama 3.1) | 128k (según documentación pública de Meta) | Clasificación de seguridad | Llama 3.1 Community License | Hugging Face |

La comparación directa con clasificadores de seguridad dedicados como Llama Guard 3 no es posible en términos de rendimiento porque no se han publicado métricas comunes; el valor diferencial de CircuitKavach-Aya es su tamaño reducido (3,35 B frente a 8 B), su cobertura de code-mixing índico y el método de alineación quirúrgica.

## Limitaciones y advertencias

- Los benchmarks son internos (400 prompts held-out) y no han sido validados de forma independiente; no hay resultados en MMLU, HumanEval, GSM8K ni en suites de seguridad estándar como HarmBench.
- El kanglish muestra la tasa de rechazo más baja (78,0 %), por debajo del resto de idiomas; el tamil (tanglish) no aparece desglosado en los resultados por idioma, lo que impide evaluar su cobertura.
- El modelo es un ajuste de seguridad: puede degradar sutilmente capacidades generales del base (razonamiento, código) al modificar cuatro submódulos críticos, aunque el autor declara 0 % de sobrerrechazo en benignos.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 3,35 B, la tasa de alucinación será previsiblemente superior a la de modelos de mayor tamaño.
- Sesgos conocidos: no documentados por el autor; los sesgos del base tiny-aya-fire se heredan en el 97,45 % de los pesos no modificados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base y de los datos de entrenamiento (no publicados).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento continuado.
- El contexto máximo no está documentado en esta ficha; para aplicaciones que requieran ventanas largas debe consultarse la model card del base tiny-aya-fire.
- La metodología de atribución de circuitos se validó solo en este modelo y tarea; su generalización a otros dominios o idiomas no está demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soapyyapps/tiny-aya-fire-circuit-kavach-merged
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Colección de modelos y adaptadores: https://huggingface.co/collections/soapyyapps/circuitkavach-aya-surgical-safety-repair-models-and-adapters-6af9a5f97e17226835ac6f71
- Colección de datasets, circuitos y logs: https://huggingface.co/collections/soapyyapps/circuitkavach-aya-datasets-circuits-and-auditkit-logs-6af9a5fb037f3d7eaf674f49
- Space interactivo (Visual Explorer): https://huggingface.co/spaces/soapyyapps/circuit-kavach-aya
- Repositorio GitHub: https://github.com/dptel22/lexsi-lab-track2
