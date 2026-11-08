# kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Turkish-v3.2 es un modelo de lenguaje Mixture-of-Experts (MoE) especializado en turco, desarrollado por el autor kataguru. Se construye sobre la base Kataguru-Sceptic-35B-A3B-v3.1, un modelo fundacional multiproposito de 35.000 millones de parametros totales y 3.000 millones de parametros activos por token. El modelo resuelve el problema de especializar un modelo en un idioma concreto (turco) sin degradar las capacidades cientificas, de codigo y de razonamiento del modelo original, mediante una estrategia de expansion de expertos en lugar de un continued pre-training clasico.

La innovacion principal es la arquitectura que el autor denomina "254 + 2 Sovereign MoE": se mantienen congelados los 254 expertos originales del core y se anaden dos expertos especificos de turco (numeros #254 y #255) en cada una de las 40 capas MoE, pasando de 254 a 256 expertos por capa. El experto #254 cubre gramatica turca y terminologia tecnica (ingenieria, PLC/CNC, medicina clinica, patentes) y el experto #255 cubre literatura turca y traduccion bidireccional EN<->TR. El modelo mantiene una ventana de contexto de 262.000 tokens, un encoder de vision de 27 capas y una cabeza especulativa MTP en la capa 40.

El modelo esta actualmente en cola de entrenamiento y los pesos no estan subidos al repositorio; el autor estima una publicacion en menos de un mes. La licencia es Apache 2.0 y los idiomas declarados son ingles, turco y fines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (256 expertos por capa en 40 capas MoE), con encoder de vision de 27 capas y cabeza MTP especulativa en capa 40 |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantizacion | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB); AWQ W4A16; GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) con mmproj-f16 y mtp |
| Idiomas soportados | Ingles (en), turco (tr), fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos base), AWQ, NVFP4, GGUF; los pesos aun no estan publicados (pre-release) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 40 capas MoE que, en esta edicion, contienen 256 expertos cada una (254 expertos del core congelados mas 2 expertos especificos de turco). El modelo base Kataguru-Sceptic-35B-A3B-v3.1 aporta 254 expertos con capacidades de razonamiento cientifico, codigo competitivo y tool calling agentico. El entrenamiento de esta edicion turca no es un continued pre-training clasico: el autor afirma que los 254 expertos del core permanecen 100 % congelados (0,00 % de olvido catastrofico) y que solo se entrenan los dos nuevos expertos, junto con una calibracion contrastiva del router para limitar la fuga de enrutamiento hacia el idioma no objetivo a menos del 0,50 %.

El modelo conserva el encoder de vision de 27 capas (333 tensores) y la cabeza MTP de decodificacion especulativa de la capa 40 (785 tensores), asi como la ventana de contexto de 262K. La plantilla de chat unificada (chat_template.jinja) incorpora etiquetas de control nativas: `/tr` para forzar respuestas en turco, `/translate` para modo de traduccion sin charla y preservando parrafos, y controles de profundidad de razonamiento `{REASON:spoon}` (auditoria cientifica de 7 pasos), `{REASON:einstein}` (sintesis de 10 angulos), `{REASON:low}` y `{REASON:none}`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto, razonamiento cientifico de nivel doctoral y matematicas (heredado del core congelado).
- Codigo competitivo y sintesis algoritmica (LiveCodeBench v6 Pass@1 de 37,71 % en el core).
- Tool calling / function calling nativo con generacion AST de `<tool_call>` y deteccion de irrelevancia (BFCL V4 AST de 83,61 % en el core).
- Capacidades multimodales de vision mediante el encoder de 27 capas conservado.
- Traduccion bidireccional ingles <-> turco en modo dedicado (`/translate`), con preservacion de parrafos y sin charla adicional.
- Generacion de prosa literaria turca, no ficcion moderna y dialogo natural (experto #255).
- Dominio de gramatica turca: armonia vocalica de 2 y 4 vias, mutacion consonántica (ünsüz yumuşaması) y cadenas profundas de sufijos derivativos y flexivos (experto #254).
- Terminologia tecnica especializada en ingenieria, PLC/CNC, medicina clinica y patentes.
- Control de profundidad de razonamiento mediante etiquetas nativas (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:low}`, `{REASON:none}`).
- Decodificacion especulativa mediante cabeza MTP en la capa 40.
- Capacidades multilingues en ingles, turco y fines.

## Casos de uso

- Traduccion profesional EN<->TR de documentacion tecnica: el modo `/translate` permite traducir paginas completas de manuales de ingenieria, PLC/CNC o patentes preservando la estructura de parrafos y la terminologia especializada gracias al experto #254.
- Localizacion de literatura y no ficcion al turco: el experto #255 esta disenado para prosa literaria de pagina completa, dialogo natural y no ficcion moderna, lo que lo hace adecuado para editoriales y agencias de localizacion.
- Atencion al cliente en turco: el modelo gestiona conversaciones multi-turno con hasta 262K tokens de contexto y puede invocar herramientas mediante tool calling para consultar pedidos o sistemas de ticketing.
- Agentes autonomos de multiple paso en entornos turcos: la combinacion de BFCL V4 de 83,61 % y los modos de razonamiento controlado permite construir agentes que planifican y ejecutan llamadas a APIs con auditoria paso a paso (`{REASON:spoon}`).
- Generacion y revision de codigo en pipelines de CI/CD: el core congelado conserva LiveCodeBench v6 de 37,71 %, por lo que el modelo puede integrarse en revisiones automatizadas de codigo sin perder capacidades por la especializacion en turco.
- Analisis de documentos tecnicos con vision: el encoder de 27 capas permite procesar capturas de esquemas electricos, planos o informes clinicos junto con texto en turco.
- Razonamiento cientifico y tutorizacion en turco: GPQA Diamond de 69,70 % en el core permite usar el modelo para responder preguntas de nivel de posgrado en fisica, quimica y biologia molecular en turco.
- Generacion de contenido medico y legal en turco: la terminologia clinica y de patentes del experto #254 resulta adecuada para borradores de informes que luego requieren revision humana.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al core Kataguru-Sceptic-35B-A3B, medido en 2x RTX 5090 con TP=2 y CUDAGraphs habilitados. El autor indica que estas cifras se heredan intactas porque los expertos del core estan congelados. La evaluacion especifica en turco (MMLU-TR, ARC-TR, TruthfulQA-TR y traduccion literaria/tecnica) esta pendiente de ejecucion final.

| Benchmark | Resultado del core | Notas |
|---|---|---|
| Media de 15 benchmarks | 70,05 % | Bateria de produccion completa |
| GPQA Diamond | 69,70 % (138/198) | STEM de nivel de posgrado |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST 79,13 %) | Tool calling |
| LiveCodeBench v6 Pass@1 | 37,71 % (66/175) | Programacion competitiva |
| IFEval Strict (prompt / instruccion) | 70,24 % / 77,70 % | Restricciones de formato y longitud |
| Evaluacion en turco | Pendiente | Ejecucion final en menos de un mes |

## Requisitos de hardware

- VRAM estimada: NVFP4-W4ATTN-AWQ Hybrid ocupa 20,3 GB; AWQ W4A16 requiere aproximadamente 1x GPU de 24-32 GB; GGUF APEX-Medium cabe en una GPU o Mac de 16 GB.
- GPU recomendadas: RTX 5090 (nativa para NVFP4 en Blackwell), 2x RTX 5090 con TP=2 para el formato NVFP4/AWQ W4A16, y GPUs de 24-32 GB para AWQ W4A16.
- Cabe en GPU de consumo: si, en RTX 5090 (NVFP4) y en GPUs de 16 GB con GGUF APEX-Medium.
- Opciones de despliegue: vLLM (AWQ W4A16 universal), llama.cpp / LM Studio para GGUF, y el formato NVFP4 en hardware Blackwell. La model card menciona compatibilidad con LM Studio y vLLM en los repositorios GGUF del autor.
- Latencia y throughput: no se han publicado cifras de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2 | 35B / 3B | 262K | Apache 2.0 | Pre-release (pesos no subidos; ETA < 1 mes) |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35B / 3B | 262K | Apache 2.0 | Disponible (incluye GGUF) |
| Kataguru-Sceptic-35B-A3B-v2.6 (GGUF) | 35B / 3B | no disponible | Apache 2.0 | Disponible en GGUF |

No se dispone de datos de benchmarks de la edicion turca frente a otros modelos especializados en turco en la informacion proporcionada; la comparativa de rendimiento queda pendiente de la evaluacion en turco anunciada por el autor.

## Limitaciones y advertencias

- Pre-release: los pesos no estan subidos al repositorio; el modelo no es utilizable hasta que el autor publique los ficheros (estimado en menos de un mes).
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad en turco (TruthfulQA-TR pendiente); el modelo hereda el comportamiento del core sin validacion especifica en este idioma.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; el entrenamiento de solo dos expertos nuevos limita el control sobre sesgos introducidos en el turco.
- Limitaciones de idioma: la especializacion cubre turco e ingles, con fines como tercer idioma declarado; el rendimiento en fines no esta cuantificado.
- Fuga de enrutamiento: el autor declara una fuga de enrutamiento hacia el idioma no objetivo inferior al 0,50 %, pero no aporta mediciones independientes.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo depende de la licencia y condiciones del core Kataguru-Sceptic-35B-A3B-v3.1, que debe verificarse por separado.
- Caveat de produccion: la evaluacion en turco (MMLU-TR, ARC-TR, TruthfulQA-TR y traduccion de pagina completa) esta pendiente; no se recomienda desplegar en produccion sin esas validaciones.
- Hardware: el formato NVFP4 requiere hardware Blackwell (RTX 5090); en GPUs anteriores hay que usar AWQ W4A16 o GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Version GGUF del base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- README de la version v2.6 GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/blob/main/README.md
