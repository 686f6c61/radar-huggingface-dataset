# saidutta69/EuroLLM-1.7B-Instruct-heretic

## Resumen

EuroLLM-1.7B-Instruct-heretic es una variante modificada de utter-project/EuroLLM-1.7B-Instruct, publicada por el usuario saidutta69 en Hugging Face. El modelo base forma parte de la serie EuroLLM, un modelo denso multilingüe de 1,66 mil millones de parámetros entrenado sobre 4 billones de tokens en 35 idiomas, con especial foco en las lenguas europeas. Esta variante ha sido procesada con Heretic 2.0 (versión de desarrollo 2.0.0.dev0) mediante su modificador de Ablación de Rango Arbitrario (ARA), una técnica experimental de abliteration que edita un subespacio de pesos en las capas 8 a 23.

Lo más relevante de esta ficha es que la edición es, según el propio autor, conductualmente neutra: el modelo base ya apenas se niega a responder (3/100 rechazos en la prueba de Heretic) y la variante mantiene exactamente el mismo nivel, con una divergencia KL de solo 0,0113. El autor lo publica explícitamente como una prueba de la técnica ARA y no como una actualización de "descensado". Es útil para quien necesite un checkpoint EuroLLM abliterado con receta reproducible, o para trabajo multilingüe europeo en hardware modesto, pero no aporta ninguna ganancia de capacidades respecto al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura tipo Llama) |
| Parametros totales | 1.656.850.432 (1,66B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (sin rope-scaling ni YaRN en la config) |
| Tipos de cuantizacion | Solo F16 (GGUF) y BF16 (safetensors); no hay escalera de cuantización |
| Idiomas soportados | 35: en, de, es, fr, it, pt, pl, nl, tr, sv, cs, el, hu, ro, fi, uk, sl, sk, da, lt, lv, et, bg, no, ca, hr, ga, mt, gl, zh, ru, ko, ja, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, 3,31 GB) y GGUF F16 |

## Arquitectura y entrenamiento

El modelo base, EuroLLM-1.7B-Instruct, es un transformer denso de 1,66B parámetros con embeddings de entrada y salida sin atar (unos 0,262B parámetros cada uno), entrenado por el proyecto EuroLLM sobre 4 billones de tokens en 35 idiomas y posteriormente ajustado con el dataset EuroBlocks para seguimiento de instrucciones y traducción automática. La variante "heretic" no modifica el entrenamiento: aplica sobre el checkpoint instruct una ablación de rango arbitrario (ARA) mediante Heretic 2.0.0.dev0, con semilla 42 y trial 75 de un estudio de 200 pruebas de Optuna.

A diferencia de la ablación direccional clásica (que ortogonaliza las salidas de atención y MLP contra una única dirección de rechazo en todas las capas), ARA aprende un subespacio de bajo rango sobre un rango de capas (aquí, las capas 8 a 23) combinando un objetivo de preservación del comportamiento correcto sobre `mlabonne/harmless_alpaca` (peso 0,0554) con un objetivo de dirección sobre `mlabonne/harmful_behaviors` (peso 0,0001). El resultado es una edición mínima (KL 0,0113) que no altera la conducta de rechazo del modelo. El repositorio incluye un directorio `reproduce/` con la receta completa (config.toml, requirements.txt, diario del estudio Optuna y sumas SHA-256) para regenerar el checkpoint bit a bit.

## Capacidades

- Generación de texto conversacional en 35 idiomas, con especial calidad en lenguas europeas (incluido el castellano, catalán, gallego y otras lenguas cooficiales españolas).
- Traducción automática: el modelo base destaca en benchmarks de traducción (FLORES-200, WMT-23, WMT-24).
- Seguimiento de instrucciones generales, ajustado con EuroBlocks.
- Sin tool calling ni function calling documentados.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Abliterated: la variante no reduce los rechazos respecto al base (3/100 en ambos casos); no aporta "descensado".

## Casos de uso

- Traducción automática entre lenguas europeas: el modelo base publica 86,89 de media en FLORES-200 sobre 71 pares, adecuado para traducción ligera en local o en dispositivos con recursos limitados.
- Asistentes conversacionales multilingües en hardware modesto: con 1,66B parámetros y contexto de 4.096 tokens, es viable en portátiles y SBC para chat multi-turno corto.
- Soporte a lenguas minorizadas y de baja dotación: cubre catalán, gallego, euskera-adjacentes no (no incluye euskera), pero sí ga, mt, gl, ca, hr, sl, sk, lt, lv, et, útil para prototipos de NLP en estas lenguas.
- Investigación en abliteration y alineación: al incluir la receta reproducible completa, sirve como referencia para estudiar ARA y comparar con ablación direccional.
- Generación de contenido local y privado: ejecutable con llama.cpp u Ollama sin enviar datos a servicios externos.
- Prototipado rápido de pipelines multilingües: formato GGUF F16 y safetensors compatibles con transformers, ideal para pruebas de concepto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor no re-ejecutó los benchmarks oficiales de EuroLLM sobre este checkpoint; los números del modelo base son los publicados por el proyecto EuroLLM para la versión 1.7B instruct. El chequeo de paridad con lm-eval 0.4.13 confirma que la edición no altera el rendimiento.

### Benchmarks del modelo base (publicados por EuroLLM)

| Benchmark | EuroLLM-1.7B-Instruct |
|---|---|
| FLORES-200 (AVG, 71 pares) | 86,89 |
| WMT-23 (AVG) | 82,91 |
| WMT-24 (AVG) | 79,32 |
| Arc Challenge (AVG, 17 idiomas) | 0,3496 |
| HellaSwag (AVG, 16 idiomas) | 0,4744 |

### Chequeo de paridad lm-eval 0.4.13 (este checkpoint vs base)

| Benchmark | Métrica | Este modelo | Base |
|---|---|---|---|
| IFEval | prompt-level strict acc | 0,1793 | 0,1756 |
| IFEval | prompt-level loose acc | 0,1830 | 0,1830 |
| IFEval | inst-level strict acc | 0,3165 | 0,3165 |
| IFEval | inst-level loose acc | 0,3201 | 0,3249 |
| MMLU | acc | 0,2592 | 0,2576 |

Todas las diferencias están dentro de un error estándar. Adicionalmente, en la prueba de rechazos de Heretic ambos modelos obtienen 3/100, con KL 0,0113 respecto al base.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,4 GB en BF16/F16 (1,66B parámetros a 16 bits), más overhead de KV cache; con contexto de 4.096 tokens, cabe holgadamente en 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve (RTX 3060, RTX 4060 o superior); no se requiere A100 ni H100 para inferencia.
- Consumer GPUs: sí, cabe con holgura en casi cualquier GPU con 4 GB o más de VRAM; también es viable en CPU pura dado el tamaño reducido.
- Opciones de despliegue: transformers, llama.cpp (GGUF F16 verificado en cabecera), Ollama, vLLM y TGI (el repo está etiquetado text-generation-inference y endpoints_compatible).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,66B, se espera inferencia rápida incluso en hardware modesto, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas destacados |
|---|---|---|---|---|
| EuroLLM-1.7B-Instruct-heretic | 1,66B | 4.096 | Apache 2.0 | 35 (foco europeo) |
| EuroLLM-1.7B-Instruct (base) | 1,66B | 4.096 | Apache 2.0 | 35 (foco europeo) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (aprox.) | Apache 2.0 | Foco chino/inglés, +100 idiomas |
| Llama-3.2-1B-Instruct | 1,24B | 128k (aprox.) | Licencia Llama 3.2 | 8 idiomas oficiales |

Frente a Qwen2.5-1.5B y Llama-3.2-1B, EuroLLM-1.7B ofrece una cobertura mucho más amplia de lenguas europeas y mejor rendimiento en traducción, a costa de un contexto mucho más corto (4.096 tokens) y puntuaciones generales más bajas en conocimiento (MMLU 25,92). La variante heretic es funcionalmente idéntica al base: solo tiene sentido si se necesita específicamente un checkpoint ARA-abliterado con receta reproducible.

## Limitaciones y advertencias

- Contexto muy corto: 4.096 tokens, sin receta publicada de rope-scaling o YaRN; cualquier extensión de contexto corre por cuenta del usuario.
- Nivel de conocimiento bajo: MMLU de 25,92 indica capacidades de razonamiento y conocimiento general limitadas, propias de un modelo de 1,66B.
- IFEval prompt-strict de 17,93: el seguimiento estricto de instrucciones formateadas es débil.
- La abliteration no aporta nada aquí: el base ya se negaba solo 3/100 veces; el autor advierte explícitamente que no debe leerse como un "descensado".
- Riesgo de alucinación típico de modelos pequeños, agravado en idiomas fuera del núcleo europeo.
- Sin tool calling, sin capacidades multimodales y sin modo de razonamiento.
- Licencia Apache 2.0: sin restricciones para uso comercial.
- Solo hay F16 y BF16 disponibles; no hay versiones cuantizadas (Q4, Q5, etc.), lo que limita su uso en dispositivos muy modestos.
- Es una publicación experimental (test de Heretic 2.0 dev), no un release estable de producción.

## Enlaces

- Modelo: https://huggingface.co/saidutta69/EuroLLM-1.7B-Instruct-heretic
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
