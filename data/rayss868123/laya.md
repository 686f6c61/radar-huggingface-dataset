# rayss868123/laya

## Resumen

Laya es un modelo de decisión de tipo "System 1": no genera texto, sino que recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompañadas de probabilidades calibradas en un único forward pass. Está desarrollado por ConvAI Innovations (el repositorio analizado, `rayss868123/laya`, es una copia alojada por un tercero con 0 descargas y 0 likes, creada y actualizada el 23 de septiembre de 2026). El checkpoint raíz emplea un backbone ModernBERT-large de 421.293.830 parámetros y una ventana de contexto de 512 tokens, según los datos reales de safetensors y la model card.

El problema que aborda es el enrutamiento, la clasificación y el scoring determinista en pipelines de producción, donde un modelo generativo añade latencia, coste de parseo y riesgo de alucinación. Laya se entrenó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), de modo que la única forma de maximizar la recompensa es declarar probabilidades honestas. La familia completa consta de tres checkpoints: el inglés (ModernBERT-large, 421 M, contexto 512), el multilingüe (mmBERT-base, 322 M, contexto 1024 hasta 8k) y el de decisiones tipadas (ModernBERT-large, 421 M, contexto 1024).

Su relevancia actual reside en que ofrece una alternativa abierta (Apache 2.0) y ejecutable en local a soluciones cerradas de decisión, con latencias declaradas de 32,8-39,5 ms por pregunta en una GPU T4 y soporte declarado de más de 100 idiomas mediante un `Router` que detecta el script en menos de 0,5 ms antes del forward pass.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo (ModernBERT-large en el checkpoint raíz) |
| Parametros totales | 421.293.830 (dato real de safetensors, ≈421 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens en el checkpoint raíz inglés; 1024 (hasta 8k) en `laya-multilingual` y `laya-typed-decisions` |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | El campo de idiomas de HuggingFace figura como no disponible; el autor declara 100+ idiomas para la familia y 51 idiomas evaluados. El checkpoint raíz está especializado en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder puramente no autorregresivo: no existe decodificación secuencial ni generación de tokens. El modelo procesa el estado y las preguntas tipadas en un único forward pass y emite directamente distribuciones de probabilidad sobre las alternativas de cada pregunta. El checkpoint raíz se apoya en ModernBERT-large (421 M de parámetros, 512 tokens de contexto); la variante multilingüe usa mmBERT-base (322 M, contexto 1024 ampliable a 8k de forma declarada) y la variante de decisiones tipadas reutiliza ModernBERT-large con contexto 1024.

El entrenamiento se realizó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias, un procedimiento que el autor denomina RLCD (calibrated decisions). El principio de diseño es que la función de recompensa solo se maximiza reportando probabilidades honestas, lo que convierte la calibración en el objetivo de optimización y no en un post-proceso. El modelo soporta al menos tres tipos de pregunta: `choice` (elección entre criterios), `score` (puntuación ordinal sobre una escala descrita) y `noul` (decisión binaria sí/no). El paquete `laya` incluye un `Router` que detecta script e idioma en Python puro en menos de 0,5 ms y despacha al checkpoint óptimo, devolviendo metadatos de enrutamiento con la justificación de la elección.

## Capacidades

- Clasificación de texto en un único forward pass, sin generación ni parseo de salida.
- Respuestas tipadas con probabilidades calibradas: elección (`choice`), puntuación (`score`) y binaria (`noul`).
- Enrutamiento automático de estado a checkpoint mediante detección de script e idioma en sub-milisegundos.
- Cobertura multilingüe declarada de más de 100 idiomas (45 de 51 evaluados resultan utilizables, es decir, superan 3 veces el azar).
- Capacidades de guardrails, moderación y scoring de contenido como clasificador de intención.
- Inferencia por lotes: latencia de 158,6 ms para 10 preguntas con el checkpoint inglés y 72,3 ms con el multilingüe en T4.
- No soporta tool calling ni function calling: no es un modelo de agente conversacional, sino un componente de decisión que puede integrarse dentro de un agente.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Triage de correo y tickets de soporte: el modelo recibe el asunto y el cuerpo del mensaje y devuelve departamento, urgencia y solicitud explícita de reembolso en una sola pasada, con probabilidades que permiten fijar umbrales de derivación a humano.
- Enrutamiento departamental en atención al cliente: con preguntas de tipo `choice` y criterios como facturación, técnico, ventas u otros, el `Router` despacha automáticamente estados en distintos idiomas al checkpoint adecuado en 32,8-39,5 ms.
- Guardrails y moderación: al ser un clasificador calibrado, permite establecer umbrales conservadores para bloquear contenido sin depender de un modelo generativo que pueda ser manipulado mediante prompt injection.
- Detección de riesgo de churn: la pregunta de tipo `noul` sobre si el usuario amenaza con cancelar la suscripción convierte una señal cualitativa en un valor binario con confianza asociada, utilizable en CRM.
- Clasificación de intención multilingüe: con el checkpoint multilingüe se cubren tareas de intención (tipo MASSIVE) en 45 de 51 idiomas, con 0,451 de accuracy en los 13 idiomas no ingleses evaluados.
- Selección de herramienta o ruta en agentes: el modelo puede actuar como router determinista que elige la siguiente acción o API a invocar sin generar texto, reduciendo coste y latencia frente a un LLM generativo.
- Análisis de implicación textual: la evaluación en XNLI ofrece 0,860 en inglés y 0,731 en 14 idiomas adicionales, lo que permite usarlo como verificador de coherencia en pipelines de RAG.
- Preprocesado en pipelines de datos: etiquetado de grandes volúmenes de texto (JSON, correos, tickets) a 72,3 ms por lote de 10 preguntas en T4, adecuado para procesos de enriquecimiento por lotes.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se obtuvieron sobre un banco compartido de 17.416 preguntas, una única GPU T4 y preguntas idénticas por modelo.

| Benchmark / tarea | English (`laya`) | Multilingual (`laya-multilingual`) | `Router` (enrutado) |
|---|---|---|---|
| MASSIVE intent, inglés | 0,783 | 0,657 | 0,783 |
| MASSIVE intent, otros 13 idiomas | 0,306 | 0,451 | 0,451 |
| XNLI, inglés | 0,860 | 0,843 | 0,860 |
| XNLI, otros 14 idiomas | 0,521 | 0,731 | 0,731 |
| Idiomas utilizables (>3x azar) | 23 / 51 | 45 / 51 | 45 / 51 |
| Latencia, 1 pregunta (T4) | 39,5 ms | 32,8 ms | 32,8 ms |
| Latencia, 10 preguntas por lote | 158,6 ms | 72,3 ms | 72,3 ms |

Además, la model card indica un 0,766 de accuracy para el checkpoint `laya-typed-decisions` en los cuatro flujos de trabajo de decisiones tipadas. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para el checkpoint de 421 M en fp32: aproximadamente 1,7 GB de pesos, más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,85 GB de pesos; en int8, alrededor de 0,42 GB (aunque el repositorio no distribuye checkpoints cuantizados).
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4090, así como en CPU para cargas por lotes.
- GPUs de referencia en las mediciones del autor: NVIDIA T4, con 39,5 ms por pregunta (checkpoint inglés) y 32,8 ms (multilingüe).
- Coste de recarga en frío del checkpoint: 7,4 s de mediana en CPU y 10,3 s en T4. Con el valor por defecto `max_loaded=1`, el tráfico que alterna idiomas reconstruye el modelo en cada petición; se recomienda `Router(preload=True)` para servidores.
- Opciones de despliegue: paquete `laya` con la clase `Router`, `transformers` con `pipeline("text-classification", ...)` y endpoints compatibles. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Throughput: con el checkpoint multilingüe, 10 preguntas por lote en 72,3 ms equivalen a unas 138 preguntas por segundo en una T4.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `laya` (raíz, inglés) | ModernBERT-large | 421 M | 512 | MASSIVE inglés 0,783; XNLI inglés 0,860 | Apache 2.0 | HuggingFace |
| `laya-multilingual` | mmBERT-base | 322 M | 1024 (hasta 8k) | MASSIVE otros idiomas 0,451; XNLI otros idiomas 0,731 | Apache 2.0 | HuggingFace |
| `laya-typed-decisions` | ModernBERT-large | 421 M | 1024 | 0,766 de accuracy en cuatro flujos tipados | Apache 2.0 | HuggingFace |
| TypeSafe Jev | no disponible | no disponible | no disponible | El autor lo cita como alternativa comercial de referencia; no se publican cifras verificables | Propietaria | Comercial |

No se dispone de datos públicos comparables de otros modelos de decisión abiertos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio analizado (`rayss868123/laya`) es una copia de terceros con 0 descargas y 0 likes, creada y actualizada el mismo día; no existe validación comunitaria del artefacto.
- Existe una discrepancia de identidad: la model card hace referencia al repositorio `convaiinnovations/laya`, mientras que el identificador de HuggingFace facilitado es `rayss868123/laya`. Conviene verificar la procedencia antes de usarlo en producción.
- El checkpoint raíz está especializado en inglés y colapsa en scripts no latinos: en jemer alcanza 0,000 de accuracy manteniendo 0,952 de confianza, por lo que el filtrado por umbral de confianza no protege frente a este fallo.
- El modelo no genera texto por diseño, de modo que no sirve para tareas de generación, resumen, traducción ni diálogo abierto.
- Aunque el autor afirma que no hay nada que alucinar, la calibración puede degradarse fuera de la distribución de entrenamiento; los benchmarks declarados proceden del propio autor y no de una evaluación independiente.
- El campo de idiomas oficial de HuggingFace figura como no disponible; la afirmación de más de 100 idiomas es una declaración del autor, con solo 51 idiomas evaluados y 45 utilizables.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio no incluye garantías ni soporte.
- No se documentan cuantizaciones, ni soporte para motores de inferencia habituales de alto rendimiento (vLLM, TGI, llama.cpp), lo que limita las opciones de optimización en producción.
- El coste de recarga en frío (7,4 s en CPU, 10,3 s en T4) puede degradar la latencia en despliegues con tráfico que alterna idiomas si no se precargan los checkpoints.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rayss868123/laya
- Repositorio de referencia del autor: https://huggingface.co/convaiinnovations/laya
- Checkpoint multilingüe: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Sitio web del proyecto: https://laya.convaiinnovations.com/
- Artículo comparativo con TypeSafe Jev: https://brainfunctioncollapse.com/laya
- Repositorio GitHub principal: https://github.com/NandhaKishorM/laya
- Playground, juegos y benchmark: https://github.com/wdobry/laya-playground
