# mradermacher/Llama-3.1-8B-RedQueenGuard-GGUF

## Resumen

Llama-3.1-8B-RedQueenGuard-GGUF es la coleccion de cuantizaciones en formato GGUF del modelo Dipto084/Llama-3.1-8B-RedQueenGuard, generadas por el usuario mradermacher. Se trata de un ajuste fino del modelo base Llama 3.1 8B de Meta orientado a seguridad, con etiquetas que lo identifican como modelo de defensa frente a jailbreaks, entrenado con DPO (Direct Preference Optimization) y pensado como baseline en entornos de multiples turnos de conversacion.

El modelo conserva la arquitectura y el tamano del Llama 3.1 8B original (8.030.261.312 parametros), por lo que su interes no esta en una arquitectura nueva sino en el comportamiento alineado que se le ha anadido mediante el ajuste. La relevancia actual radica en la creciente necesidad de disponer de modelos con resistencias verificables frente a ataques de prompt multi-turno, un vector de ataque cada vez mas documentado, y en la posibilidad de desplegarlo localmente mediante GGUF sin depender de APIs externas.

Esta ficha cubre exclusivamente la version cuantizada publicada por mradermacher. Los detalles del entrenamiento, el dataset y los resultados del paper asociado (arxiv:2608.15594) no estan incluidos en la informacion disponible, por lo que se indican como no disponibles cuando corresponde. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.312 (~8,03 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1 8B; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (la version base del autor Dipto084 usa transformers/safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only con normalizacion RMSNorm pre-norma, activacion SwiGLU, atencion agrupada por consultas (GQA) con 8 cabezas de clave/valor sobre 32 cabezas de consulta, embeddings rotatorios RoPE y un vocabulario de 128.256 tokens. El modelo base fue entrenado por Meta sobre aproximadamente 15 billones de tokens y soporta una ventana de contexto de 128.000 tokens. RedQueenGuard parte de ese checkpoint y aplica un ajuste adicional orientado a seguridad.

Segun las etiquetas del repositorio, el ajuste se realizo mediante DPO (Direct Preference Optimization) con el objetivo de defenderse frente a jailbreaks, especialmente en escenarios de multiples turnos, y se presenta como baseline en un trabajo de investigacion (arxiv:2608.15594). No se dispone, en la informacion proporcionada, del numero de tokens de ajuste, la composicion del dataset de preferencias, la existencia de etapas adicionales de RLHF/SFT ni la metodologia concreta de evaluacion. La cuantizacion GGUF no emplea pesos ponderados ni imatrix en esta publicacion, tal como indica el propio autor del repo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.1 8B.
- Defensa frente a jailbreaks: el ajuste DPO busca que el modelo mantenga comportamientos seguros ante intentos de manipulacion del prompt.
- Resistencia en ataques multi-turno: el entrenamiento esta orientado especificamente a conversaciones de varios turnos, donde los ataques suelen fragmentarse a lo largo de la interaccion.
- Uso como baseline de seguridad: por su etiqueta "baseline", esta pensado para servir de referencia comparativa frente a otros modelos o defensas en experimentos de alineacion.
- Cuantizacion y despliegue local: al estar en GGUF, permite inferencia en CPU y GPU de consumo mediante llama.cpp y derivados.
- Idioma: el soporte esta declarado unicamente para ingles; no hay evidencia en la informacion disponible de capacidades multilingues especificas.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Moderacion y filtrado de peticiones peligrosas: el modelo puede integrarse como capa de defensa en un pipeline de atencion al cliente o chatbot, rechazando solicitudes que intenten obtener contenido danino o eludir las politicas mediante reformulaciones repartidas en varios turnos.
- Defensa multi-turno en asistentes conversacionales: dado que el ajuste se centra en ataques fragmentados a lo largo de la conversacion, es adecuado para asistentes con sesiones largas donde un atacante intenta escalar privilegios turno a turno.
- Baseline en investigacion de seguridad: equipos de alineacion pueden usar el modelo como referencia para medir la eficacia de nuevas tecnicas de defensa o de nuevos ataques de jailbreak.
- Red teaming interno: emplearlo como modelo defendido frente al que probar ataques y medir tasas de exito, comparando con el Llama 3.1 8B sin ajuste de seguridad.
- Despliegue on-premise con requisitos de privacidad: gracias a las cuantizaciones GGUF (desde 3,3 GB en Q2_K), puede ejecutarse en infraestructura local sin enviar datos a APIs externas, algo relevante en sectores regulados.
- Filtrado en generacion de datos sinteticos: puede actuar como verificador de seguridad en pipelines que generan grandes volumenes de texto, descartando muestras que activen comportamientos inseguros.
- Evaluacion comparativa de cuantizaciones: la amplia gama de niveles (Q2_K a f16) permite estudiar el impacto de la cuantizacion en el comportamiento de seguridad, un aspecto poco analizado en modelos de defensa.
- Investigacion academica sobre DPO aplicado a seguridad: sirve como caso de estudio reproducible para analizar como el ajuste por preferencias afecta a la robustez frente a ataques adversariales en texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia el paper arxiv:2608.15594 como trabajo asociado, pero no se incluye su contenido, tablas de resultados ni comparativas de tasas de exito frente a ataques. Tampoco se aportan datos de MMLU, HumanEval, GSM8K ni de resistencia a jailbreaks (por ejemplo, tasas de exito de ataque). La busqueda web realizada no devolvio informacion relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin cache KV):
  - Q2_K: ~3,3 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: 3,8 a 4,4 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: 4,6 a 5,0 GB.
  - Q5_K_S / Q5_K_M: 5,7 a 5,8 GB.
  - Q6_K: ~6,7 GB.
  - Q8_0: ~8,6 GB.
  - f16: ~16,2 GB.
- A la VRAM de los pesos hay que sumar la cache KV, que crece con la longitud de contexto. Para ventanas cercanas a 128.000 tokens la cache puede anadir varios GB adicionales, por lo que conviene reservar margen sobre las cifras anteriores.
- GPU recomendadas: para las cuantizaciones de 4 bits basta con una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB; para Q8_0 se recomienda una RTX 4070 Ti Super o una RTX 4080 (16 GB); para f16 se necesita una RTX 4090 (24 GB), una A6000 o una A100/H100 de 40-80 GB.
- Si cabe en GPU de consumo: si. Las variantes Q4_K_M y Q5_K_M son las mas equilibradas para equipos con 8-12 GB de VRAM; incluso las variantes Q2_K y Q3_K pueden ejecutarse en GPU integradas o en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (koboldcpp tambien es compatible). vLLM y TGI soportan GGUF de forma limitada; para estas ultimas conviene partir del modelo base en safetensors.
- Latencia y throughput estimados: no disponible, ya que no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento |
|---|---|---|---|---|---|
| Llama-3.1-8B-RedQueenGuard (este) | 8,03 B | 128.000 tokens (heredado) | llama3.1 | Seguridad / defensa jailbreak multi-turno con DPO | no disponible |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | llama3.1 | Asistente generalista con alineacion por RLHF | no disponible |
| Llama Guard 3 8B | 8,03 B | 128.000 tokens (base Llama 3.1) | llama3.1 | Clasificador de seguridad de entrada/salida | no disponible |

La comparacion se limita a parametros, contexto, licencia y enfoque, ya que no se dispone de datos de rendimiento publicados para el modelo RedQueenGuard en la informacion proporcionada. La diferencia principal con Llama Guard 3 es que este ultimo es un clasificador de seguridad, mientras que RedQueenGuard parece ser un modelo generativo defendido que actua como baseline en un trabajo de investigacion. No se dispone de modelos adicionales comparables en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al derivar de Llama 3.1 8B, hereda los sesgos conocidos del modelo base, entrenado predominantemente con datos en ingles.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido factualmente incorrecto. El ajuste DPO de seguridad no elimina este comportamiento.
- Limitaciones de contexto e idioma: el modelo esta declarado unicamente para ingles. No se confirma explicitamente en la model card la ventana de 128.000 tokens, aunque se hereda del modelo base. La eficacia de la defensa puede degradarse en contextos muy largos o con prompts en otros idiomas.
- Robustez frente a ataques: el ajuste DPO mejora la resistencia, pero no garantiza invulnerabilidad. No hay tasas de exito de ataque publicadas en la informacion disponible que permitan cuantificar el nivel real de proteccion.
- Restricciones de licencia: la licencia llama3.1 incluye clausulas de uso aceptable y limitaciones para determinados despliegues a gran escala (por ejemplo, la clausula de 700 millones de usuarios mensuales). Es imprescindible revisar el texto completo antes de un uso comercial.
- Caveats de cuantizacion: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) reducen la calidad y pueden afectar de forma impredecible al comportamiento de seguridad, ya que este tipo de comportamiento suele ser sensible a la precision. Para produccion se recomienda Q4_K_M o superior.
- Ausencia de datos de evaluacion: no hay evidencia publicada en la informacion disponible sobre el rendimiento real del modelo en tareas de defensa, lo que dificulta justificar su uso en produccion sin una validacion propia.
- Modelo de investigacion: la etiqueta "baseline" y su asociacion a un paper sugieren que esta pensado para experimentacion mas que para despliegue directo en producto.

## Enlaces

- Repositorio GGUF (esta version): https://huggingface.co/mradermacher/Llama-3.1-8B-RedQueenGuard-GGUF
- Modelo base: https://huggingface.co/Dipto084/Llama-3.1-8B-RedQueenGuard
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Llama-3.1-8B-RedQueenGuard-GGUF
- Paper referenciado (arxiv:2608.15594): https://arxiv.org/abs/2608.15594
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
