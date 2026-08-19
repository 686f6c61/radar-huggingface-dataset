# oyildirim/CyberStrike-OffSec-35B

## Resumen

CyberStrike-OffSec-35B es un modelo de lenguaje especializado en seguridad ofensiva y pentesting, desarrollado por oyildirim como un fine-tune del modelo Qwen3.6-35B-A3B de la familia Qwen. Está diseñado para actuar como agente autónomo de pentesting: emite llamadas a herramientas estructuradas en el formato XML de Qwen3 (`<tool_call><function=...>`), enruta correctamente a arquetipos de agente válidos (por ejemplo `web-application`, `explore`) y termina la conversación de forma limpia con `<|im_end|>`. El modelo tiene 35.107 millones de parámetros en arquitectura de mezcla de expertos (MoE) con 3 mil millones de parámetros activos (indicado por el sufijo A3B).

La relevancia de este lanzamiento radica en que corrige los fallos graves de la versión anterior del mismo autor, que producía llamadas a herramientas malformadas, entraba en bucles y alucinaba observaciones falsas (curl, escaneos Nmap, cabeceras `Set-Cookie` e incluso flags inventadas). El fine-tune se realizó con un dataset deliberadamente pequeño de 300 ejemplos en una sola ronda, centrado exclusivamente en alinear el formato de tool calling con el harness CyberStrike, no en ampliar el conocimiento de seguridad. Según la evaluación A/B publicada por el autor, el modelo consigue 18/24 llamadas a herramientas genuinas y 24/24 terminaciones limpias, sin fabricar observaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) basada en Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | 3 B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe repo GGUF separado; la evaluacion menciona bf16 y q8) |
| Idiomas soportados | no disponible |
| Licencia | other (modelo principal); apache-2.0 en el repo GGUF |
| Formato de pesos | safetensors (checkpoint fusionado) y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen3.6-35B-A3B, un transformer de mezcla de expertos con 35,1 mil millones de parámetros totales y 3 mil millones activos por token. La arquitectura base ya incluye capacidades de tool calling nativas (el propio autor indica que el base emite llamadas en 22 de 24 escenarios de prueba), pero con un enrutamiento incorrecto: usa nombres internos como "GHOST" en lugar de los arquetipos válidos del harness.

El entrenamiento de CyberStrike-OffSec-35B consistió en una única ronda de fine-tune supervisado (SFT) sobre un dataset de 300 ejemplos, diseñado para enseñar el formato exacto de llamada a herramientas que espera el harness CyberStrike. El autor es explícito en que no se añadió conocimiento nuevo de seguridad ofensiva: el objetivo era corregir el colapso de la versión anterior, que había sido entrenada con un formato de tool calling que el modelo nunca aprendió a emitir como llamadas estructuradas reales. No se especifican datos sobre el preentrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generacion de texto conversacional con formato de agente: emite llamadas a herramientas XML de Qwen3 (`<tool_call><function=...><parameter=...>`) y termina con `<|im_end|>`.
- Tool calling estructurado y fiable: en la evaluacion del autor, 18/24 escenarios producen llamadas genuinas y bien formadas, frente a 0/24 de la version anterior.
- Enrutamiento correcto a arquetipos de agente validos (por ejemplo `web-application`, `explore`) en lugar de codenames internos.
- Manejo de observaciones reales: lee el resultado de una herramienta y actua en consecuencia; ante salidas vacias o inesperadas, pivota en lugar de inventar datos.
- Terminacion limpia: detiene la generacion cuando la tarea esta completa, sin bucles ni ejecuciones simuladas (24/24 en la evaluacion).
- Delegacion a sub-agentes y llamadas paralelas a herramientas: puede agrupar trabajo independiente sin saturar con cientos de llamadas.
- Capacidades de seguridad ofensiva heredadas del modelo base Qwen3.6, que ya conoce conceptos de pentesting, escaneo, explotacion y post-explotacion.

## Casos de uso

- Orquestacion de escaneos de vulnerabilidades: el modelo puede invocar herramientas como Nmap o escaneres web a traves de llamadas estructuradas, interpretar los resultados reales y decidir el siguiente paso sin alucinar salidas.
- Pentesting automatizado de aplicaciones web: con el arquetipo `web-application`, puede recorrer fases de reconocimiento, enumeracion y explotacion, delegando tareas a sub-agentes y manteniendo el contexto de la mision.
- Generacion de informes de seguridad: tras ejecutar las herramientas, puede resumir hallazgos, evidencias y recomendaciones en formato conversacional, apoyandose en observaciones reales en lugar de datos inventados.
- Integracion en pipelines de CI/CD de seguridad: al emitir tool calls en un formato estandar (XML de Qwen3), puede conectarse a harnesses como CyberStrike o a frameworks de agentes que consuman ese formato, para pruebas de seguridad automatizadas en entornos de desarrollo.
- Simulacion de adversarios (red teaming): el modelo puede actuar como agente autonomo que planifica y ejecuta fases de ataque controlado, delegando a arquetipos especializados y terminando cuando el objetivo se cumple.
- Asistente de formacion en seguridad ofensiva: dado que el base ya posee conocimiento de conceptos ofensivos, el modelo puede explicar tecnicas, generar comandos de ejemplo y guiar a estudiantes, siempre que se use en entornos autorizados.

## Benchmarks y rendimiento

El autor publica una evaluacion controlada de tres vias (modelo base Qwen3.6, modelo anterior retirado y este modelo) sobre 24 escenarios distribuidos en 6 ejes (seleccion de herramienta, tipado de argumentos, manejo de observaciones reales, bucles/terminacion, delegacion a sub-agentes y llamadas paralelas), con un 62% de prompts fuera de distribucion. Los resultados, basados en salida cruda del modelo, son:

| Metrica (24 escenarios) | Base Qwen3.6 | Modelo anterior | CyberStrike-OffSec-35B |
|---|---|---|---|
| Llamadas a herramientas estructuradas genuinas | 22/24 | 0/24 | 18/24 |
| Herramienta / arquetipo correcto | 6/24 | 2/24 | 10/24 |
| Terminacion limpia | 21/24 | 3/24 | 24/24 |
| Observaciones fabricadas | ninguna | generalizadas (8+ escenarios) | ninguna |

El sitio web del proyecto (cyberstrike.io) afirma que el modelo es "numero 1 en SecEval y benchmarks MITRE ATT&CK", pero no se proporcionan cifras concretas en la informacion disponible, por lo que no se pueden verificar ni presentar en tabla.

## Requisitos de hardware

- VRAM estimada: el checkpoint fusionado en bf16 ocupa aproximadamente 70,4 GB segun LLM Explorer; con cuantizacion GGUF (por ejemplo q8) puede reducirse a unos 35 GB, y con cuantizaciones de 4 bits a unos 18 GB, aunque estos valores no estan confirmados por el autor.
- GPU recomendadas: para la version completa en bf16 se necesitan GPUs de datacenter como A100 80GB o H100; con cuantizacion q8 cabe en una RTX 4090 (24 GB) o similar, y con q4 en GPUs de 16-24 GB.
- Al ser un MoE con solo 3 B de parametros activos, la inferencia es mas eficiente que un modelo denso de 35 B, pero el checkpoint completo debe cargarse en memoria.
- Opciones de despliegue: el autor verifica la carga con `transformers` mediante `AutoModelForImageTextToText` y `AutoTokenizer`, pasando las herramientas con `apply_chat_template`. Tambien existe un repo GGUF para su uso con llama.cpp, Ollama u otros runtime compatibles. Se menciona soporte para servidores con `--enable-lora` usando el adaptador LoRA (169 MB) de la revision `adapter`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberStrike-OffSec-35B (este) | 35,1 B MoE (3 B activos) | no disponible | Si, formato Qwen3 XML | other (apache-2.0 en GGUF) | Hugging Face |
| Qwen3.6-35B-A3B (base) | 35,1 B MoE (3 B activos) | no disponible | Si, pero con enrutamiento incorrecto | no disponible | Hugging Face |
| CyberStrike-OffSec-35B (version anterior) | 35,1 B MoE | no disponible | Roto (0/24 llamadas genuinas) | other | Retirado y gated |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en seguridad ofensiva (por ejemplo WhiteRabbitNeo o similares) en la informacion proporcionada. La comparativa se limita al modelo base y a la version anterior del mismo autor, que es la unica con datos medidos.

## Limitaciones y advertencias

- El fine-tune no amplia el conocimiento de seguridad: el autor indica explicitamente que el modelo no es "mas inteligente" que el base, solo esta alineado al formato del harness. Para tareas fuera del tool calling, su rendimiento es el del base Qwen3.6.
- Riesgo de alucinacion residual: aunque la evaluacion muestra cero observaciones fabricadas en los 24 escenarios, sigue siendo un LLM y puede inventar datos en situaciones no cubiertas por el entrenamiento.
- Dataset de entrenamiento muy pequeno (300 ejemplos, una ronda): la robustez fuera de distribucion es limitada; el propio autor planea una iteracion Stage-2 para mejorar la generalizacion.
- Licencia "other" en el modelo principal: no se especifican los terminos exactos; el repo GGUF usa apache-2.0, pero el checkpoint principal puede tener restricciones. Se recomienda revisar la licencia antes de uso comercial.
- Naturaleza de doble uso: al estar especializado en seguridad ofensiva, su uso debe limitarse a entornos autorizados y con fines eticos. Puede generar comandos o tecnicas de ataque que, mal utilizados, son peligrosos.
- Idiomas y contexto no documentados: no se ha publicado informacion sobre los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- El modelo anterior fue retirado por fallos graves; los usuarios que migren deben verificar que cargan la version actual (revision `main`) y no la antigua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B
- Repo GGUF: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B-GGUF
- Documento de evaluacion (EVALUATION.md): https://huggingface.co/oyildirim/CyberStrike-OffSec-35B/blob/main/EVALUATION.md
- Pagina de modelos del proyecto CyberStrike: https://cyberstrike.io/models/
- Ficha en LLM Explorer: https://llm-explorer.com/model/oyildirim%2FCyberStrike-OffSec-35B,5K497W0Kpt3Ed6dsZCEz1v
