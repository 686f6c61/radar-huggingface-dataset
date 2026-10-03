# mradermacher/EXAONE-4.0-1.2B-JEV-GGUF

## Resumen

`mradermacher/EXAONE-4.0-1.2B-JEV-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `carrtesy/EXAONE-4.0-1.2B-JEV`, un ajuste fino de 1.279.391.520 parametros (aproximadamente 1,2B) construido sobre la arquitectura EXAONE 4.0 de LG AI Research. El modelo original pertenece a la serie EXAONE 4.0, que LG describe como una familia unificada que integra modos de razonamiento y de no razonamiento, con una variante de 32B orientada a maxima calidad y una variante de 1,2B disenada para ejecucion en dispositivo. Las etiquetas del ajuste fino (`decision-model`, `system-one`, `jev`, `calibrated`) sugieren una especializacion en toma de decisiones con respuestas rapidas tipo "System 1", aunque no se documenta en detalle en la informacion disponible.

Esta ficha corresponde especificamente al repositorio de cuantizaciones de mradermacher, no al modelo base. El repositorio ofrece 12 variantes estaticas de cuantizacion que van desde Q2_K (0,7 GB) hasta f16 (2,7 GB), lo que permite desplegar el modelo en hardware de gama baja, CPU o incluso dispositivos moviles mediante llama.cpp u Ollama. El modelo esta etiquetado unicamente para ingles y se distribuye bajo la licencia propietaria EXAONE.

Su relevancia practica esta en que permite ejecutar un modelo de la familia EXAONE 4.0 en entornos con recursos muy limitados, sin necesidad de GPU dedicada, a costa de renunciar a las capacidades del modelo de 32B de la misma serie. El repositorio registraba 155 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia EXAONE 4.0; detalles concretos no disponibles) |
| Parametros totales | 1.279.391.520 (aprox. 1,2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estaticas) |
| Idiomas soportados | en (ingles) |
| Licencia | exaone (licencia propia; `license: other`, `license_name: exaone`) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base del que derivan estas cuantizaciones es `carrtesy/EXAONE-4.0-1.2B-JEV`, un ajuste fino sobre la variante de 1,2B de la serie EXAONE 4.0 de LG AI Research. La serie EXAONE 4.0 se presenta en el paper arXiv:2507.11407 como una familia unificada que integra modos de no razonamiento y de razonamiento, con dos tamanos: un modelo de 32B orientado a alto rendimiento y un modelo de 1,2B pensado para aplicaciones en dispositivo. El repositorio oficial de LG indica que EXAONE 4.0 introduce cambios arquitectonicos respecto a versiones anteriores de EXAONE, aunque el detalle de dichos cambios no se incluye en la informacion disponible.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el ajuste `JEV`. Las etiquetas del modelo (`decision-model`, `system-one`, `calibrated`) apuntan a un ajuste orientado a decisiones calibradas y respuestas rapidas, pero no hay model card detallada del autor del ajuste en los datos proporcionados. Las cuantizaciones de mradermacher son estaticas; el propio autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, ya que el modelo esta etiquetado como `conversational`.
- Enfoque de toma de decisiones: la etiqueta `decision-model` sugiere uso para clasificacion, eleccion entre opciones o respuestas de decision.
- Modo "System 1": la etiqueta `system-one` apunta a respuestas rapidas e intuitivas, en contraposicion a cadenas de razonamiento largas.
- Calibracion: la etiqueta `calibrated` indica que el ajuste busca probabilidades o decisiones mejor calibradas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun los metadatos (`language: en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo base EXAONE 4.0 integra modos de razonamiento y no razonamiento, pero no se confirma su comportamiento en este ajuste concreto.

## Casos de uso

- Clasificacion y enrutado de decisiones simples en produccion: el modelo puede evaluar una entrada corta y devolver una eleccion entre un conjunto cerrado de opciones, aprovechando su etiqueta `decision-model` y su tamano reducido para latencias bajas.
- Preprocesado y etiquetado de texto en pipelines de datos: con cuantizaciones de 0,9 GB (Q4_K_M) puede ejecutarse en CPU para anotar grandes volumenes de texto en ingles sin coste de GPU.
- Asistentes conversacionales ligeros en ingles: su naturaleza `conversational` permite mantener dialogos simples en aplicaciones de chat embebidas o demos.
- Filtrado previo en sistemas de dos etapas: usar este modelo de 1,2B como primer filtro rapido y derivar solo los casos ambiguos a un modelo mayor como EXAONE 4.0 32B.
- Prototipado rapido de agentes: al ocupar menos de 1 GB en Q4, permite iterar en portatiles o entornos de CI sin GPU dedicada.
- Ejecucion en dispositivo (movil, Raspberry Pi, mini-PC): la variante Q4 permite inferencia local en hardware muy limitado, util para aplicaciones offline de asistencia textual.
- Investigacion sobre calibracion y decisiones: sirve como sujeto de estudio para comparar la calibracion de modelos pequenos frente a alternativas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El paper de EXAONE 4.0 (arXiv:2507.11407) afirma que la serie obtiene un rendimiento superior a modelos abiertos de su clase, pero no se incluyen cifras concretas para la variante de 1,2B ni para el ajuste `JEV` en los datos proporcionados. Tampoco hay mediciones de perplejidad o calidad especificas de las cuantizaciones de este repositorio.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: aproximadamente 0,7-0,8 GB para Q2_K y Q3_K; 0,9 GB para Q4_K_S/Q4_K_M e IQ4_XS; 1,0 GB para Q5_K; 1,2 GB para Q6_K; 1,5 GB para Q8_0; 2,7 GB para f16.
- GPU recomendadas: cualquier GPU consumer reciente con 2-4 GB de VRAM es suficiente; no se requiere A100 ni H100. El modelo cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y similares.
- Compatibilidad con GPU consumer: si, en la practica totalidad del catalogo actual; incluso tarjetas de gama baja integradas pueden ejecutar las cuantizaciones Q4.
- Ejecucion en CPU: viable en todas las cuantizaciones hasta Q8_0, con Q4_K_M como punto de equilibrio recomendado por el autor.
- Opciones de despliegue: llama.cpp (incluido `llama-server` con plantilla Jinja y endpoint compatible con la API de OpenAI segun la documentacion de LG), Ollama, LM Studio y otros motores compatibles con GGUF. Para el modelo de 1,2B son preferibles a vLLM o TGI por eficiencia en hardware limitado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/EXAONE-4.0-1.2B-JEV-GGUF | 1,2B | no disponible | no disponible | exaone | GGUF (12 cuantizaciones) |
| carrtesy/EXAONE-4.0-1.2B-JEV | 1,2B | no disponible | no disponible | exaone | safetensors (modelo base del ajuste) |
| LGAI-EXAONE/EXAONE-4.0-1.2B-GGUF | 1,2B | no disponible | no disponible | exaone | GGUF oficial de LG |
| Qwen2.5-1.5B | 1,5B | no disponible | no disponible | Apache 2.0 | safetensors/GGUF |
| Llama-3.2-1B | 1,2B | no disponible | no disponible | Llama 3.2 Community License | safetensors/GGUF |

Los datos de rendimiento y contexto de los modelos comparados no se han incluido en la informacion proporcionada, por lo que no se pueden realizar comparaciones cuantitativas fiables.

## Limitaciones y advertencias

- Idioma: el modelo solo esta etiquetado para ingles; su uso en castellano u otros idiomas no esta garantizado y probablemente degrade la calidad.
- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion; como modelo de 1,2B, cabe esperar una tasa de alucinacion superior a la de modelos mayores.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo o seguridad en la documentacion proporcionada.
- Licencia EXAONE: es una licencia propia (no OSI abierta al uso generico), con condiciones que deben revisarse antes de cualquier uso comercial. El repositorio la marca como `license: other` con `license_name: exaone`.
- Cuantizaciones agresivas: Q2_K y Q3_K reducen la calidad; el propio autor advierte de "lower quality" en Q3_K_M y recomienda Q4_K_S/Q4_K_M para uso rapido.
- Ausencia de cuantizaciones ponderadas: no hay variantes imatrix/weighted, lo que limita la calidad en tamanos bajos.
- Repositorio secundario: se trata de una cuantizacion de terceros, no del modelo oficial de LG; la trazabilidad y el soporte dependen de mradermacher y del autor del ajuste `carrtesy`.
- Falta de benchmarks: no hay metricas publicadas que permitan evaluar la calidad real del ajuste `JEV` ni de las cuantizaciones.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/EXAONE-4.0-1.2B-JEV-GGUF
- Modelo base del ajuste: https://huggingface.co/carrtesy/EXAONE-4.0-1.2B-JEV
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#EXAONE-4.0-1.2B-JEV-GGUF
- Cuantizaciones oficiales de LG AI Research: https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-1.2B-GGUF
- Repositorio oficial de EXAONE 4.0 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-4.0
- Paper EXAONE 4.0 (arXiv): https://arxiv.org/abs/2507.11407
- Version HTML del paper: https://arxiv.org/html/2507.11407v1
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
