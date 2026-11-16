# Prasom/lexsi-ai-safety-model

## Resumen

Lexsi AI Safety es un toolkit de red-teaming e interpretabilidad mecanicista publicado por el desarrollador Prasom bajo licencia MIT. No es un modelo de lenguaje entrenado desde cero, sino un conjunto de artefactos de seguridad (vectores de rechazo, sondas de activación y un verificador) diseñado para operar sobre el modelo objetivo `CohereLabs/tiny-aya-global` (3.35B parámetros, 36 capas, dimensión oculta 2048, GQA 16:4, 70 idiomas). El componente central es un vector de rechazo de aproximadamente 8 KB extraído de 20 pares contrastivos en inglés, que se aplica mediante activation steering para modular el comportamiento de rechazo del modelo sin reentrenamiento.

La propuesta del autor es la falsabilidad: el toolkit incluye un verificador que recalcula cada métrica reportada a partir de la salida cruda del modelo en menos de un segundo, sin necesidad de GPU, servidor ni clave de API. Según la model card, el vector detecta jailbreaks en 8 idiomas con una precisión media de transferencia de sonda del 73,3% y localiza el circuito de rechazo en una única capa (capa 23, F1 0,787).

Su relevancia actual reside en que aborda dos problemas prácticos del despliegue de modelos: la evaluación reproducible de seguridad multilingüe y la mitigación ligera de jailbreaks mediante intervención en el espacio de activaciones. El pipeline se declara agnóstico al modelo, aunque las cifras publicadas corresponden exclusivamente a tiny-aya-global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Toolkit de safety/interpretabilidad sobre un transformer decoder (modelo objetivo: tiny-aya-global, GQA 16:4, 36 capas, d=2048) |
| Parametros totales | No disponible (el artefacto principal es un vector de ~8 KB; el modelo objetivo tiene 3.35B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, ru, ar, hi, zh, es, fr, de (8 idiomas evaluados); el modelo objetivo declara 70 idiomas |
| Licencia | MIT |
| Formato de pesos | No disponible (el artefacto central es un vector de rechazo de ~8 KB; no se especifica formato de pesos) |

## Arquitectura y entrenamiento

El toolkit no entrena un modelo generativo. Su mecanismo principal es el activation steering: se extrae una dirección de rechazo en el espacio de activaciones a partir de 20 pares contrastivos en inglés (prompts dañinos frente a prompts benignos) y se suma a las activaciones internas del modelo objetivo durante la inferencia, con una intensidad controlada por el parámetro alpha. Según la model card, el circuito de rechazo queda localizado en la capa 23 del modelo objetivo, lo que permite aplicar la intervención en un único punto de la red.

La metodología incluye además sondas (probes) entrenadas sobre esas activaciones para detectar intentos de jailbreak, y se evalúa su transferencia a 8 idiomas distintos del inglés. El pipeline se presenta como agnóstico al modelo, pero todos los resultados publicados (localización de capa, F1, tasas de ataque exitoso) se obtuvieron sobre `CohereLabs/tiny-aya-global`. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset más allá de los 20 pares contrastivos ni si se empleó RLHF o DPO.

## Capacidades

- Detección de jailbreaks multilingüe mediante sondas de activación, con precisión media de transferencia del 73,3% en 8 idiomas (en, ru, ar, hi, zh, es, fr, de).
- Mitigación de ataques mediante activation steering: la tasa de ataque exitoso (ASR) baja del 51,5% al 47,1% con alpha=0,1.
- Localización del circuito de rechazo en una capa concreta (capa 23, F1 0,787), lo que facilita la interpretabilidad y la intervención quirúrgica.
- Verificación reproducible: un verificador recalcula todas las métricas desde la salida cruda del modelo en menos de un segundo.
- Ejecución sin GPU, sin servidor y sin clave de API.
- Evaluación de sobre-rechazo (over-refusal) y coherencia como métricas de coste de la intervención.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni razonamiento agéntico propias, ya que el toolkit no es un modelo generativo.

## Casos de uso

- Auditoría de seguridad de despliegues LLM: el toolkit permite medir la tasa de ataque exitoso de un modelo objetivo antes y después de aplicar el vector de rechazo, con verificación reproducible de cada cifra, lo que encaja en procesos de revisión previa a producción.
- Red-teaming multilingüe: al transferir sondas entrenadas en inglés a ruso, árabe, hindi, chino, español, francés y alemán, un equipo puede evaluar la robustez de un modelo en mercados no anglófonos sin construir datasets contrastivos por idioma.
- Investigación en interpretabilidad mecanicista: la localización del circuito de rechazo en la capa 23 y el F1 de 0,787 ofrecen un punto de partida concreto para estudiar cómo se representa la negativa a responder dentro del transformer.
- Mitigación ligera en producción: con un vector de ~8 KB y sin GPU, se puede aplicar steering como capa de defensa de bajo coste sobre un modelo ya desplegado, aceptando el compromiso de ASR 51,5% a 47,1% y sobre-rechazo 0,0% a 11,5%.
- Validación de pipelines de moderación: el verificador que recalcula métricas desde la salida cruda en menos de un segundo permite integrar comprobaciones de seguridad en CI/CD sin infraestructura adicional.
- Docencia y reproducción de experimentos: al no requerir API key ni servidor, el toolkit sirve para que estudiantes reproduzcan un experimento completo de extracción de vectores, steering y evaluación de jailbreaks en un portátil.
- Comparación de robustez entre modelos: el pipeline se declara agnóstico, por lo que puede aplicarse a otros transformers pequeños para contrastar dónde se localiza su circuito de rechazo, aunque las cifras publicadas solo cubren tiny-aya-global.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Precision media de transferencia de sonda (8 idiomas) | 73,3% |
| Capa del circuito de rechazo | 23 |
| F1 de localizacion del circuito | 0,787 |
| ASR baseline | 51,5% |
| ASR tras steering (alpha=0,1) | 47,1% |
| Over-refusal baseline | 0,0% |
| Over-refusal tras steering | 11,5% |
| Coherencia baseline | 100% |
| Coherencia tras steering | 99,0% |
| Tamano del vector de rechazo | ~8 KB |
| Pares contrastivos de extraccion | 20 (ingles) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto evaluado es un toolkit de seguridad y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada: no disponible para el toolkit; el vector de rechazo ocupa ~8 KB y el verificador se ejecuta sin GPU.
- GPU recomendadas: no se requiere GPU para el pipeline de verificación; para ejecutar el modelo objetivo tiny-aya-global (3.35B) se necesitaría hardware no especificado en la información disponible.
- Cabe en GPU de consumo: el toolkit en sí no necesita GPU; el modelo objetivo, por su tamaño de 3.35B, es apto para GPUs de consumo con cuantización, aunque no se detallan requisitos concretos.
- Opciones de despliegue: no se especifican (no se mencionan vLLM, llama.cpp, Ollama ni TGI); el autor indica explícitamente "no GPU, no server, no API key".
- Latencia y throughput: el verificador recalcula todas las métricas en menos de un segundo; no se proporcionan datos de latencia o throughput del modelo objetivo.

## Comparativa con modelos similares

| Herramienta | Enfoque | Idiomas evaluados | Licencia | Requiere GPU |
|---|---|---|---|---|
| Lexsi AI Safety (este) | Activation steering + sondas sobre tiny-aya-global | 8 | MIT | No |
| RepE (Representation Engineering) | Extraccion de direcciones de representacion para control conductual | No disponible | MIT (repositorio original) | Si, para extraccion |
| Circuit breakers (Zou et al.) | Intervencion en representaciones para bloquear respuestas dañinas | No disponible | No disponible | Si |
| Llama Guard (Meta) | Modelo clasificador de seguridad entrenado | No disponible en la informacion | Licencia Llama | Si |

No se dispone de datos comparativos de rendimiento entre estas herramientas en la información proporcionada; la comparación se limita a enfoque, licencia y requisitos de hardware.

## Limitaciones y advertencias

- Las cifras publicadas solo cubren el modelo objetivo `CohereLabs/tiny-aya-global`; el pipeline se declara agnóstico, pero no hay evidencia de transferencia a otros modelos en la información disponible.
- La mejora en ASR es modesta (51,5% a 47,1%) y conlleva un coste significativo en sobre-rechazo (0,0% a 11,5%) y una ligera pérdida de coherencia (100% a 99,0%).
- La extracción del vector se basa en solo 20 pares contrastivos en inglés, lo que puede limitar la cobertura de patrones de ataque y sesgar la dirección de rechazo hacia fenómenos anglófonos.
- La precisión de transferencia de sonda del 73,3% implica que aproximadamente una cuarta parte de los intentos de jailbreak en otros idiomas no se detectan.
- Riesgo de alucinación y sesgos del modelo objetivo: no se documentan en la información disponible, pero el toolkit no los corrige.
- No se especifican limitaciones de longitud de contexto ni de idiomas más allá de los 8 evaluados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; conviene revisar la licencia del modelo objetivo (tiny-aya-global) antes de combinar ambos en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados.

## Enlaces

- [Hugging Face: Prasom/lexsi-ai-safety-model](https://huggingface.co/Prasom/lexsi-ai-safety-model)
- [Repositorio GitHub: PrasomTR/lexsi-ai-safety](https://github.com/PrasomTR/lexsi-ai-safety)
- Modelo objetivo: `CohereLabs/tiny-aya-global` (referenciado en la model card; no se proporciona URL directa en la información disponible)
