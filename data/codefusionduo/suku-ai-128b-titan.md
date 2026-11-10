# codefusionduo/suku-ai-128b-titan

## Resumen

Suku AI 128B Titan es un modelo de lenguaje presentado por CodeFusionDuo como un transformer decoder-only con arquitectura de mezcla de expertos (MoE) dispersa, con 128.450 millones de parametros totales y 32.100 millones de parametros activos por token. El modelo se posiciona como un "companero de IA fundacional" bilingue (hindi e ingles, con soporte declarado de sanscrito) y se describe como el orquestador de un ecosistema de subredes especializadas (CodeCraft AI, NovaCraft AI y AgriSathi AI) que, segun la model card, suman en conjunto unos 204.000 millones de parametros.

La propuesta diferencial del autor no es solo textual: el modelo se presenta integrado de forma nativa con un personaje 3D en tiempo real construido con Three.js, con estados emocionales dinamicos, sintesis de voz mediante Web Speech API y animacion de visemas. Es decir, el modelo se plantea como el nucleo de una experiencia conversacional multimodal orientada a compania interactiva, no como un modelo de proposito general aislado.

La relevancia de esta ficha es fundamentalmente documental: el modelo se publica bajo licencia MIT, con ventana de contexto declarada de 131.072 tokens y un pipeline de text-generation compatible con la libreria transformers. No obstante, la informacion disponible es exclusivamente la model card del autor, sin datos de benchmarks, sin detalles sobre la composicion del dataset ni sobre el proceso de alineacion, y con cero descargas y cero likes en el momento de la consulta, lo que obliga a tratar todas las cifras como declaraciones del autor no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) dispersa; atencion Grouped-Query Attention (GQA 64/8) con FlashAttention-3; RoPE con theta = 500.000 |
| Parametros totales | 128.450 millones (128B) |
| Parametros activos | 32.100 millones (32B) por token |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hindi (hi), ingles (en), sanscrito (sa); se menciona tambien hinglish |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card solo muestra carga via `AutoModelForCausalLM` de transformers; no se confirman safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer decoder-only con enrutamiento disperso a expertos (MoE), en el que solo se activan 32.100 millones de parametros de los 128.450 millones totales por cada token generado. El modelo emplea Grouped-Query Attention con una configuracion 64/8 (64 cabezas de consulta y 8 de clave/valor), codificacion posicional rotatoria RoPE con theta de 500.000 para favorecer la extension de contexto, y atencion acelerada con FlashAttention-3. La model card no detalla el numero de expertos, la estrategia de enrutamiento (top-k, balanceo de carga) ni la proporcion de parametros compartidos, por lo que no es posible reconstruir la topologia interna del MoE a partir de la informacion disponible.

En cuanto al entrenamiento, el autor afirma haber utilizado mas de 500.000 millones de tokens (descrito en la card como "50.000 crore target scale"), pero no se especifica la composicion del corpus, la mezcla de idiomas, la presencia de datos de codigo o matematicas, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito. La model card menciona un "ecosistema multi-modelo" con subredes especializadas (CodeCraft AI de 34B, NovaCraft AI de 28B y AgriSathi AI de 14B), pero no aclara si estas subredes forman parte del mismo checkpoint, si se invocan mediante enrutamiento externo o si son modelos independientes que el modelo principal orquesta.

## Capacidades

- Generacion de texto conversacional multi-turno en hindi, ingles y sanscrito, con enfasis declarado en "hinglish".
- Razonamiento general y "compania dialogica" con un tono de persona emocionalmente consciente.
- Integracion declarada con un personaje 3D en tiempo real (Three.js) con estados emocionales (feliz, pensativo, sorprendido, amor, somnoliento), sintesis de voz via Web Speech API y animacion de visemas sincronizada.
- Seguimiento de mirada y pupilas con el raton en la interfaz del companero 3D.
- Soporte declarado de "voice-agent" en las etiquetas del repositorio, aunque no se detalla si el modelo procesa audio de forma nativa o si la voz se gestiona fuera del modelo.
- Orquestacion declarada de subredes especializadas en codigo (CodeCraft AI), astrofisica y sintesis de mundos (NovaCraft AI) y agronomia en lenguas regionales indias (AgriSathi AI).
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la etiqueta "reasoning" aparece en los tags, pero sin detalles tecnicos.
- Capacidades multimodales (vision, audio nativo): no disponible; la unica multimodalidad descrita es la capa 3D y de voz externa al modelo.

## Casos de uso

- Companero conversacional 3D para aplicaciones de consumo: el modelo puede alimentar el dialogo de un avatar Kawaii en el navegador, con estados emocionales y voz sincronizada, usando la ventana de 128K tokens para mantener el historial de una sesion larga sin truncar el contexto.
- Asistente de atencion al cliente en hindi e ingles: la ventana de contexto de 131.072 tokens permite gestionar conversaciones multi-turno con historial extenso y documentacion de producto inyectada, adecuado para mercados del subcontinente indio.
- Generacion de codigo en produccion: aunque la model card delega el codigo en la subred CodeCraft AI (34B), el modelo principal puede actuar como orquestador que enruta consultas tecnicas y mantiene el contexto de un pipeline de CI/CD o de revision de parches.
- Educacion y tutoria en sanscrito y lenguas clasicas: el soporte declarado de sanscrito permite construir herramientas de traduccion, glosa o explicacion de textos clasicos, un nicho poco cubierto por modelos generalistas.
- Prototipado de agentes de voz: combinado con Web Speech API y un backend de inferencia, el modelo puede servir como nucleo de un agente de voz para tareas de compania, recordatorios o asistencia domestica, con la capa de voz gestionada fuera del modelo.
- Investigacion aplicada en agronomia para India rural: la integracion declarada con AgriSathi AI (14B) sugiere un uso como enrutador de consultas sobre patologia de cultivos, quimica del suelo y precios de mercado (Kisan mandi), con el modelo principal manteniendo el contexto de la explotacion agricola.
- Experimentacion en arquitecturas MoE: con licencia MIT y pesos potencialmente abiertos, el modelo puede usarse como banco de pruebas para estudiar enrutamiento de expertos, atencion GQA 64/8 y extension de contexto con RoPE theta 500.000.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 257 GB solo para pesos (128.450 millones de parametros x 2 bytes), mas cache KV y overhead, lo que exige multiples GPU de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 128 GB de pesos, viable en 2 x H100 80 GB o 2 x A100 80 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 64 GB de pesos, viable en una unica H100 80 GB o A100 80 GB, con margen limitado para cache KV en contextos largos.
- GPU recomendadas: H100 SXM/NVL, A100 80 GB, H200; para cuantizaciones agresivas, configuraciones multi-GPU de 48 GB (L40S, RTX 6000 Ada) mediante tensor parallelism.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en ninguna cuantizacion razonable, dado que incluso 4 bits superan los 24 GB. Solo seria viable con cuantizaciones sub-4 bits muy agresivas y offloading a RAM, con latencia muy degradada.
- Opciones de despliegue: la model card solo documenta `transformers` con `device_map="auto"`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la ausencia de formatos GGUF declarados hace improbable el despliegue en llama.cpp sin conversion previa.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Suku AI 128B Titan | 128B / 32B | 131.072 tokens | MIT | Hugging Face (0 descargas) | Sin benchmarks publicados; ecosistema 3D y de voz declarado |
| Mixtral 8x22B | 141B / 39B | 64.000 tokens | Apache 2.0 | Hugging Face, ampliamente desplegado | MoE con benchmarks publicos (MMLU, HumanEval) |
| Qwen1.5-MoE-A2.7B | 14,3B / 2,7B | 32.000 tokens | Apache 2.0 | Hugging Face, vLLM, llama.cpp | Menor escala; benchmarks publicos |
| DeepSeek-V2 | 236B / 21B | 128.000 tokens | DeepSeek License | Hugging Face | Contexto comparable; benchmarks publicos |

La comparacion es estructural: Suku AI se situa en la franja de MoE de gran escala con contexto de 128K, pero a diferencia de Mixtral, Qwen o DeepSeek, no publica resultados de evaluacion ni detalles de entrenamiento, y su ecosistema de despliegue declarado se limita a transformers. La licencia MIT es mas permisiva que la de DeepSeek-V2 y equivalente en espiritu a Apache 2.0 para uso comercial.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia independiente de calidad en razonamiento, codigo, matematicas o multilingueismo.
- Cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.
- La model card mezcla especificaciones del modelo con caracteristicas de producto (avatar 3D, voz, subredes), sin separar que capacidades residen en los pesos y cuales en infraestructura externa.
- No se documenta la composicion del dataset de entrenamiento (500.000 millones de tokens declarados) ni el proceso de alineacion (RLHF, DPO, SFT), lo que impide evaluar sesgos y riesgos de alucinacion.
- El soporte de sanscrito y de "hinglish" se declara sin datos de evaluacion; la calidad real en estas lenguas es desconocida.
- La ventana de 128K tokens se declara, pero sin pruebas de aguja en pajar ni de recuperacion en contexto largo; el rendimiento efectivo en contextos extensos no esta verificado.
- No se confirman formatos de pesos (safetensors, GGUF) ni soporte de motores de inferencia optimizados, lo que complica el despliegue en produccion.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre procedencia de los datos, lo que puede exponer a riesgos legales si el corpus contiene material con derechos.
- El modelo se presenta con fecha de creacion de noviembre de 2026 y afirmaciones de "foundational AI" y "India's Premier", un tono promocional que exige cautela y verificacion empirica antes de cualquier adopcion.
- Riesgo de alucinacion: no cuantificado; al no haber evaluaciones, debe asumirse un riesgo estandar o superior al de modelos con alineacion documentada.

## Enlaces

- Hugging Face: https://huggingface.co/codefusionduo/suku-ai-128b-titan
- Repositorio del autor (referenciado en la model card para el logo): https://github.com/codefusionduo/suku
- Paper: no disponible
- Blog tecnico: no disponible
- Demo: no disponible
- Repositorio de codigo adicional: no disponible
