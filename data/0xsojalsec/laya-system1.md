# 0xSojalSec/laya-System1

## Resumen

Laya es un modelo de decisión no autorregresivo ("System 1") desarrollado originalmente por ConvAI Innovations y distribuido aquí en el repositorio `0xSojalSec/laya-System1`. Recibe un estado (texto, correo, ticket o JSON) y un conjunto de preguntas tipadas, y devuelve respuestas también tipadas acompañadas de probabilidades calibradas en un único forward pass. No genera texto: no hay salida que parsear ni margen para alucinación en el sentido generativo.

El checkpoint servido en la raíz de este repositorio emplea un backbone ModernBERT-large con 421.293.830 parámetros y 512 tokens de contexto, y está orientado a texto en inglés, guardrails y triaje de correo. La familia completa incluye además `laya-multilingual` (mmBERT-base, 322M, hasta 8k de contexto, 100+ idiomas) y `laya-typed-decisions` (ModernBERT-large, 421M, 1024 de contexto), y un `Router` que detecta el script en menos de 0,5 ms y despacha al checkpoint óptimo.

Su relevancia actual está en el entrenamiento con RLCD (reinforcement learning contra reglas de puntuación estrictamente propias), que según el autor convierte la honestidad probabilística en la única estrategia que maximiza la recompensa. Esto lo hace atractivo para enrutado, moderación y scoring de bajo coste, con latencias declaradas de 39,5 ms por pregunta en una T4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (backbone ModernBERT-large) orientado a clasificación |
| Parámetros totales | 421.293.830 (safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en el checkpoint servido en la raíz de este repositorio |
| Tipos de cuantización | no disponible; los tags no declaran GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponibles en los metadatos; el checkpoint de la raíz se presenta como inglés y la familia declara 100+ idiomas mediante el checkpoint multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales del repositorio: pipeline `text-classification`, librería `transformers`, tamaño del repo 2,4 GB, 0 descargas y 0 likes, creado y actualizado el 22 de septiembre de 2026, región `us`, etiqueta `endpoints_compatible`.

## Arquitectura y entrenamiento

Se trata de un modelo de decisión no autorregresivo: no hay decodificación token a token, sino un único forward pass que produce respuestas tipadas (`choice`, `score`, `noul`) con probabilidades asociadas. El backbone es un encoder transformer ModernBERT-large en el caso del checkpoint de la raíz, con 421M de parámetros y 512 tokens de contexto; la variante multilingüe usa mmBERT-base (322M) y la variante de decisiones tipadas reutiliza ModernBERT-large con 1024 tokens de contexto.

El entrenamiento se realizó con RLCD, es decir, aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (*strictly proper scoring rules*). El autor sostiene que, con este esquema, la única forma de maximizar la recompensa es reportar probabilidades honestas, lo que actúa como mecanismo de calibración. La model card no detalla el volumen de tokens, la composición del dataset ni si hubo fases adicionales de SFT, DPO o RLHF; esa información no está disponible. Tampoco se documentan innovaciones de atención lineal o decodificación especulativa, coherentes con la naturaleza no generativa del modelo.

En el plano de sistema, la familia incorpora un `Router` que detecta script e idioma en microsegundos de Python puro y despacha al checkpoint adecuado, con metadatos de enrutado que explican la decisión (por ejemplo, "script no latino (devanagari, 100 % de las letras); el checkpoint inglés no puede leerlo").

## Capacidades

- Clasificación y scoring con etiquetas tipadas: preguntas de tipo `choice` (selección entre criterios), `score` (ordenación por grado) y `noul` (respuesta de decisión sobre el estado).
- Devolución de probabilidades calibradas en lugar de texto libre, lo que elimina la necesidad de parsear la salida.
- Evaluación de estados heterogéneos: texto plano, correo electrónico, tickets y JSON.
- Enrutado automático de idioma y script mediante el componente `Router`, con anulación manual del checkpoint cuando se conoce de antemano.
- Capacidad multilingüe en la familia (100+ idiomas declarados en el checkpoint `laya-multilingual`); el checkpoint de la raíz está orientado a inglés y su rendimiento cae drásticamente en escrituras no latinas.
- Inferencia por lotes: varias preguntas sobre un mismo estado se resuelven en una sola pasada (10 preguntas en 72,3 ms con el checkpoint multilingüe en T4).
- No hay soporte de generación de texto, tool calling generativo, agentes con razonamiento multi-paso ni capacidades de visión o audio.

## Casos de uso

- Triaje de correo y tickets de soporte: el modelo recibe el mensaje como estado y devuelve simultáneamente el departamento (`billing`, `technical`, `sales`, `other`), la urgencia como score y banderas de riesgo de churn o de solicitud de reembolso. La ventana de 512 tokens cubre correos y tickets típicos y el coste por decisión es de decenas de milisegundos.
- Guardrails y moderación: al no generar texto, la salida se integra directamente como señal numérica en un pipeline de control, sin riesgo de que el propio clasificador produzca contenido problemático ni de fallos de parseo.
- Enrutado de decisiones en agentes: la clasificación tipada puede actuar como primer salto de un flujo mayor (derivar a un modelo generativo, a un sistema de facturación o a un humano) usando la confianza calibrada como criterio de escalado.
- Priorización de colas de atención: el score de urgencia y la probabilidad asociada permiten ordenar colas de trabajo por criticidad declarada, con umbrales explícitos en lugar de heurísticas sobre palabras clave.
- Detección de riesgo de abandono en CRM: la pregunta de tipo `noul` sobre amenazas de cancelación permite marcar cuentas en riesgo a partir de correos y notas de cuenta, con la probabilidad como variable de entrada para un modelo de retención.
- Comprensión multilingüe de intenciones: con el checkpoint `laya-multilingual` se cubren 45 de 51 idiomas evaluados con precisión superior a tres veces el azar, útil para asistentes conversacionales en mercados múltiples.
- Etiquetado a escala para curación de datasets: la inferencia por lotes (10 preguntas en 72,3 ms en T4 con el checkpoint multilingüe) hace viable anotar corpus grandes sin intervención humana en la primera pasada.
- Revisión de políticas sobre datos estructurados: al aceptar JSON como estado, permite comprobar campos concretos de un registro contra criterios declarados en lenguaje natural.

## Benchmarks y rendimiento

Cifras publicadas en la model card del autor para la familia Laya, sobre un benchmark compartido de 17.416 preguntas ejecutado en una única GPU T4 con las mismas preguntas por modelo. Corresponden a la familia, no necesariamente al checkpoint concreto de este repositorio (que es el inglés):

| Benchmark / métrica | English (raíz) | Multilingual | Router (enrutado) |
|---|---|---|---|
| MASSIVE intent, inglés | 0,783 | 0,657 | 0,783 |
| MASSIVE intent, otros 13 idiomas | 0,306 | 0,451 | 0,451 |
| XNLI, inglés | 0,860 | 0,843 | 0,860 |
| XNLI, otros 14 idiomas | 0,521 | 0,731 | 0,731 |
| Idiomas usables (>3x azar) | 23 / 51 | 45 / 51 | 45 / 51 |
| Latencia, 1 pregunta (T4) | 39,5 ms | 32,8 ms | 32,8 ms |
| Latencia, 10 preguntas por lote (T4) | 158,6 ms | 72,3 ms | 72,3 ms |

El checkpoint `laya-typed-decisions` declara 0,766 de exactitud media en los cuatro flujos de decisiones tipadas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, y no serían aplicables porque el modelo no genera texto. No hay verificación independiente de estos números en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del número de parámetros, no publicada por el autor): en fp32 en torno a 1,7 GB; en fp16/bf16 en torno a 0,85 GB; en int8 en torno a 0,45 GB, más activaciones, que son reducidas por el contexto de 512 tokens.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM; también es viable la inferencia en CPU, ya que la model card reporta latencias medidas en T4 y construcciones de checkpoint en CPU.
- GPU de referencia en las mediciones publicadas: NVIDIA T4. No se documentan medidas en A100, H100 ni RTX 4090.
- Latencias declaradas: 39,5 ms por pregunta con el checkpoint inglés y 32,8 ms con el multilingüe en T4; 158,6 ms y 72,3 ms respectivamente para lotes de 10 preguntas.
- Coste de preload: construir un checkpoint en frío cuesta segundos (mediana de 7,4 s de recarga en CPU y 10,3 s en T4). Con `max_loaded=1`, el tráfico que alterna idiomas reconstruye el modelo en cada petición, por lo que el autor recomienda `Router(preload=True)` o `router.preload([...])` en servidores y demos.
- Opciones de despliegue: `transformers`, el paquete `laya` (`pip install laya`) con su `Router`, y endpoints compatibles según la etiqueta `endpoints_compatible`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo autorregresivo no son las vías habituales para este tipo de checkpoint.
- Throughput: no disponible más allá de las latencias por pregunta y por lote citadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `0xSojalSec/laya-System1` (este repo, checkpoint inglés) | 421M | 512 | Clasificación y decisión tipada no autorregresiva | apache-2.0 | HuggingFace, 0 descargas |
| `convaiinnovations/laya-multilingual` | 322M | 1024 (hasta 8k) | Igual, con cobertura de 100+ idiomas | apache-2.0 | HuggingFace (repo de la familia) |
| `convaiinnovations/laya-typed-decisions` | 421M | 1024 | Igual, especializado en los cuatro flujos tipados (0,766 de exactitud) | apache-2.0 | HuggingFace (repo de la familia) |
| Encoders de clasificación de tamaño comparable (ModernBERT-large, RoBERTa-large, XLM-R large) | ~350M-600M | variable (512-8192) | Clasificación supervisada clásica | variable | no disponible en la información proporcionada |

No se dispone de comparativas verificadas frente a alternativas externas de la misma categoría: la búsqueda web realizada no devolvió resultados relevantes (los enlaces encontrados trataban sobre iconos de escritorio de Windows y no guardaban relación con el modelo). Cualquier comparación de rendimiento con otros encoders requeriría ejecutar el mismo benchmark de forma independiente.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural, resúmenes o diálogo queda fuera de su alcance.
- El checkpoint inglés colapsa en escrituras no latinas manteniendo la confianza alta. El ejemplo documentado es el jemer (khmer), con 0,000 de exactitud y 0,952 de confianza, lo que invalida el filtrado por umbral de confianza como medida de seguridad.
- Ventana de contexto de 512 tokens en el checkpoint de esta raíz: documentos largos se truncan y pueden degradar la decisión.
- La calibración declarada depende del esquema RLCD descrito por el autor; no hay evaluación independiente que la confirme en la información disponible.
- No se documentan sesgos demográficos, lingüísticos ni de dominio, ni procesos de mitigación.
- No se detallan la composición del dataset de entrenamiento ni su procedencia, lo que dificulta evaluar riesgos de contaminación o de sesgo.
- Este repositorio no es el repositorio oficial de la familia (`convaiinnovations/laya`), tiene 0 descargas y 0 likes, y no hay garantía de paridad, actualización o soporte respecto al original.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los pesos antes de integrarlos en producción.
- Los metadatos del repositorio no listan idiomas soportados, a diferencia de lo que declara la model card de la familia.
- El rendimiento multilingüe citado (45 de 51 idiomas usables) corresponde al checkpoint multilingüe, no al de esta raíz.
- Los resultados de la búsqueda web no aportaron información adicional verificable sobre el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xSojalSec/laya-System1
- Repositorio de la familia (checkpoint inglés original): https://huggingface.co/convaiinnovations/laya
- Checkpoint multilingüe: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Material gráfico citado en la model card: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/laya_vs_jev_full.png
- Paquete de Python mencionado en la model card: `laya` (instalación mediante `pip install laya`); no se ha localizado la ficha del paquete en la información proporcionada.
- Búsqueda web: sin resultados relevantes. Los enlaces devueltos (support.microsoft.com, pc-tips.info, seniorweb.nl) tratan sobre la personalización de iconos de escritorio en Windows y no guardan relación con el modelo.
