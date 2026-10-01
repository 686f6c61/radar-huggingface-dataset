# asketeddy/gooo-compiler-context-tiny-v1

## Resumen

gooo-compiler-context-tiny-v1 es un modelo experimental de 12.728 parametros publicado por el usuario asketeddy. No es un transformer generativo ni un modelo de lenguaje causal al uso: se trata de un perceptron multicapa (MLP) de una sola capa oculta, inicializado de forma independiente, cuyo proposito es emitir juicios acotados en ingles y coreano sobre alternativas tipadas declaradas por el compilador Gooo. El modelo no hereda pesos preentrenados ni de Laya ni de terceros.

Su funcion es servir como brazo de "contexto de compilador" dentro del ecosistema Gooo: recibe un contexto semantico con alternativas relativas a la fuente, puntua rutas legales y ayuda al compilador a emitir codigo Go tipado. La orquestacion de inferencia y runtime es responsabilidad de Go; la optimizacion MPS es local y offline. No genera texto libre ni codigo general.

Es relevante ahora como pieza de investigacion reproducible sobre decisiones neurales minimas en compiladores: incluye variantes FP32, QAT ternario y PTQ ternario, con recibos de completitud parcial, y publica un resultado negativo explicito frente a su control emparejado de contexto de llamante. El propio autor advierte que no reivindica mejora de exactitud frente a ese control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de una capa oculta (no transformer causal; bundle custom) |
| Parametros totales | 12.728 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | maximo 512 bytes UTF-8 (sin truncado silencioso); contexto de un salto ("one-hop") |
| Tipos de cuantizacion | FP32, PTQ ternario, QAT ternario |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | directorio emparejado de metadatos/pesos `models/{fp32,ptq_ternary,qat_ternary}` (`model.json`); payload ternario de 2.759 bytes; tensores decodificados residentes de 12.896 bytes mas escalas |
| ABI de features | `split_context_intent_ngrams_v2`, 256 features de entrada, 48 unidades ocultas, 8 etiquetas |
| Contexto semantico de entrada | `gooo/compiler-typed-path-context/v2`, con alternativas relativas a la fuente |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un MLP de una capa oculta: 256 features de entrada, 48 unidades ocultas y 8 etiquetas de salida. El ABI de features se denomina `split_context_intent_ngrams_v2` y la entrada se limita a 512 bytes UTF-8 sin truncado silencioso. El contexto semantico `gooo/compiler-typed-path-context/v2` incluye alternativas relativas a la fuente, de modo que el modelo solo aporta indicaciones ordenadas sobre rutas ya declaradas; la autoridad sobre la fuente, las comprobaciones de tipos y los tests finitos escritos a mano permanecen en el compilador.

Los datos de entrenamiento son deliberadamente sinteticos y publicos, generados para Gooo; el autor no declara numero de tokens ni composicion detallada del dataset. No se menciona RLHF ni DPO. La innovacion tecnica destacable es la cuantizacion ternaria en dos variantes: QAT (entrenamiento consciente de cuantizacion) y PTQ (post-entrenamiento), con cinco trits por byte, lo que da 1,6 bits por disco en el payload, sin aritmetica empaquetada en runtime ni medicion de RAM de proceso completo. El repositorio `evidence.tar.gz` conserva el control emparejado de contexto de llamante, los datasets, las fuentes de entrenamiento, los recibos en crudo y las observaciones. La revision nativa de entrenamiento/exportacion esta fijada en `7d8768f86158022b494603e22e2589d121dee0b1`.

## Capacidades

- Puntuacion y ordenacion de alternativas tipadas declaradas por el compilador Gooo.
- Seleccion de rutas legales mediante busqueda finita determinista sobre candidatos.
- Emision asistida de codigo Go tipado a partir del plan de rutas (`body-codegen`).
- Juicios acotados en ingles y coreano (no traduccion general).
- Integracion con el SDK `gooo-decision-runtime` v0.2.9-experimental, que verifica hashes de pesos y el ABI de features.
- Soporte de variantes cuantizadas (ternaria QAT y PTQ) como eleccion explicita de despliegue.
- Retencion de recibos de completitud parcial cuando hay desconexion o desbordamiento, con la busqueda finita determinista existente como respaldo.
- No soporta tool calling, function calling, agentes, vision, audio, ni generacion general de lenguaje natural a Gooo (no reivindicado).

## Casos de uso

- Seleccion de rutas tipadas en el compilador Gooo: el modelo recibe el contexto `gooo/compiler-typed-path-context/v2` y devuelve indicaciones ordenadas sobre que rutas legales tomar, mientras el compilador conserva la autoridad sobre la fuente y los tipos.
- Codegen asistido de Go: mediante `gooo body-codegen --json --path-plan plan.json --path-model models/fp32/model.json`, el modelo aporta el ranking de rutas y el compilador emite Go tipado.
- Despliegue offline en entornos restringidos: el espacio de trabajo del modelo es de 1.248 bytes y los tensores decodificados residentes de 12.896 bytes, por lo que puede ejecutarse sin GPU dedicada ni servicio hospedado.
- Investigacion sobre cuantizacion ternaria: comparar FP32 (9,583 us de mediana), QAT (10,458 us) y PTQ (10,792 us) en llamadas aisladas permite estudiar el compromiso entre tamano en disco y latencia en decisiones de compilacion.
- Reproduccion de resultados negativos: el paquete `evidence.tar.gz` y `results.md` permiten replicar la comparacion entre contexto de compilador y contexto de llamante para estudiar el efecto del control de contexto.
- Integracion en pipelines de CI sobre Go: el SDK verifica hashes de pesos y ABI, lo que permite fijar una revision del modelo y detectar regresiones de contexto antes de promover cambios al compilador.
- Evaluacion de respaldo determinista: cuando se produce desconexion o desbordamiento, el sistema retiene la busqueda finita determinista y los recibos de completitud parcial, util para auditar el comportamiento en produccion.

## Benchmarks y rendimiento

Datos publicados por el autor sobre la cohorte sintetica de desarrollo reutilizada de 320 vistas (contexto de compilador):

| Metrica | FP32 | QAT ternario | PTQ ternario | Control de contexto de llamante |
|---|---|---|---|---|
| Programas finitos completados inicialmente | 240/320 | no disponible | no disponible | no disponible |
| Con un candidato adicional | 320/320 y 3.840/3.840 casos finitos | no disponible | no disponible | no disponible |
| Candidatos extra necesarios | 80 | 101 | 143 | 68 |
| Latencia mediana por llamada (Go) | 9,583 us | 10,458 us | 10,792 us | no disponible |

El autor califica explicitamente este resultado como una comparacion negativa frente al control emparejado de contexto de llamante, no como una mejora de exactitud. La busqueda por respaldo desconectado necesita 160 candidatos extra. Las latencias corresponden a llamadas aisladas al modelo, no a la latencia completa del compilador. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 13 KB de tensores decodificados residentes (12.896 bytes mas escalas); el paquete ternario ocupa 2.759 bytes en disco. No requiere VRAM dedicada en el sentido habitual.
- GPU recomendadas: no disponible. El autor indica orquestacion de inferencia/runtime en Go y optimizacion MPS local offline; no especifica modelos de GPU.
- Cabe en cualquier GPU consumer, y en CPU: el espacio de trabajo del modelo es de 1.248 bytes.
- Opciones de despliegue: SDK `github.com/kimjooyoon/gooo-decision-runtime` v0.2.9-experimental junto con las herramientas de linea de comandos `gooo body-context` y `gooo body-codegen`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje causal de Transformers.
- Latencia: mediana medida por llamada aislada de 9,583 us (FP32), 10,458 us (QAT) y 10,792 us (PTQ). Throughput no disponible.
- Nota de despliegue: debe cargarse el directorio completo de metadatos/pesos emparejados; no se deben reinterpretar pesos de versiones antiguas de features con un codificador nuevo.

## Comparativa con modelos similares

No se dispone de modelos externos comparables en la informacion proporcionada. La comparacion relevante es interna, entre las variantes publicadas y el control emparejado:

| Variante | Parametros | Formato | Candidatos extra necesarios | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gooo-compiler-context-tiny-v1 FP32 | 12.728 | FP32 (`model.json`) | 80 | MIT | publica en HuggingFace |
| gooo-compiler-context-tiny-v1 QAT | 12.728 | ternario QAT | 101 | MIT | publica en HuggingFace |
| gooo-compiler-context-tiny-v1 PTQ | 12.728 | ternario PTQ | 143 | MIT | publica en HuggingFace |
| Control de contexto de llamante (interno) | no disponible | no disponible | 68 | no disponible | en `evidence.tar.gz` |

Modelos comparables de terceros: no disponible.

## Limitaciones y advertencias

- Contexto de un solo salto ("one-hop"): no maneja dependencias de mayor alcance.
- Ambiguedad observacional dispersa: los objetivos dispersos retienen ambiguedad y no se reivindican nuevas intenciones independientes.
- Desacuerdo entre coreano e ingles: el comportamiento no es uniforme entre ambos idiomas.
- Regresiones frente al control de contexto: el brazo de contexto de compilador rinde peor que el control de contexto de llamante (80 candidatos extra frente a 68).
- No se reivindica correccion semantica universal, compatibilidad con Laya, servicio hospedado ni generacion general de lenguaje natural a Gooo.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible; el modelo solo emite indicaciones de ranking, no contenido factual.
- Licencia MIT, sin restricciones declaradas para uso comercial, pero el modelo se describe como eleccion experimental explicita y no se reivindica promocion automatica a valor por defecto.
- No usar pesos de versiones antiguas de features con un codificador nuevo; el SDK valida hashes y ABI, y el incumplimiento puede invalidar los resultados.
- Perdida de contribucion silenciosa: se advierte de que el modelo no trunca la entrada por encima de 512 bytes UTF-8, pero tampoco garantiza correccion ante entradas fuera de ese limite.
- Las metricas de latencia son llamadas aisladas al modelo, no latencia total del compilador, por lo que no deben extrapolarse a rendimiento de extremo a extremo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asketeddy/gooo-compiler-context-tiny-v1
- Pull request del compilador (meta-ontology-go PR 1133): https://github.com/kimjooyoon/meta-ontology-go/pull/1133
- SDK de runtime de decisiones: github.com/kimjooyoon/gooo-decision-runtime (v0.2.9-experimental)
- Repositorio de experimentos, protocolo y observaciones: https://github.com/kimjooyoon/gooo-neural-decision-experiments
- Documentacion de resultados citada en la model card: `results.md` (dentro del repositorio del modelo)
