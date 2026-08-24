# jatshi/StreamSense-Serve-v4-Router

## Resumen

StreamSense-Serve-v4-Router es un artefacto de enrutamiento semántico desarrollado por Jatshi para el sistema StreamSense-Serve 4.0, un asistente audiovisual orientado a la evidencia. No se trata de un modelo generativo de lenguaje, sino de un componente de decisión que determina cuándo una petición debe escalarse a un modelo de visión-lenguaje (VLM) costoso. El router evalúa cuatro señales independientes: riesgo de seguridad, incertidumbre de evidencia ligera, conflicto cross-modal y dependencia visual. Si cualquiera de ellas supera su umbral calibrado, el sistema activa la mejora visual.

El artefacto se construye sobre el encoder de embeddings chino BAAI/bge-small-zh-v1.5, cuyos pesos se mantienen congelados, y añade cabezas logísticas ligeras para cada rama de decisión. Está entrenado con datos sintéticos en chino: 32 escenarios semánticos expandidos a 2.304 condiciones de corrupción física. Su relevancia radica en abordar el problema del escalado selectivo en pipelines multimodales, reduciendo llamadas a modelos grandes sin sacrificar la cobertura de casos críticos. Las métricas reportadas muestran una recall de escalada del 94,81 % en grupos semánticos no vistos, aunque el estudio end-to-end revela que la mejora visual no siempre incrementa la calidad final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Router con encoder BGE-small-zh-v1.5 congelado + cabezas logisticas (4 ramas de decision) |
| Parametros totales | No disponible (el encoder base tiene ~24 M, el router anade cabezas ligeras) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa caracteristicas, no texto secuencial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (segun etiquetas del modelo) |
| Licencia | No disponible |
| Formato de pesos | JSON (artefacto de enrutamiento) + safetensors del encoder base (no confirmado) |

## Arquitectura y entrenamiento

El router no es un transformer generativo, sino un clasificador multicriterio. Utiliza los embeddings de BAAI/bge-small-zh-v1.5 como representacion congelada para las ramas de riesgo y dependencia visual, mientras que las ramas de incertidumbre y conflicto se alimentan de senales fisicas y caracteristicas cross-modal (por ejemplo, desalineaciones temporales entre audio y video). Cada rama produce una puntuacion que se compara con un umbral calibrado conjuntamente; si alguna supera el umbral, el sistema escala a un VLM.

El entrenamiento se realizo con validacion cruzada out-of-fold (OOF) sobre 24 grupos semanticos de desarrollo, con 4 pliegues. El corpus consistio en 32 escenarios generados en chino expandidos a 2.304 condiciones de corrupcion fisica (ruido, desenfoque, cortes, etc.). No se aplicaron tecnicas de RLHF ni DPO; el ajuste se limito a las cabezas logisticas y a la calibracion de umbrales. El artefacto final incluye coeficientes, normalizadores, la revision del encoder BGE, los cuatro umbrales y un resumen de metricas OOF.

## Capacidades

- Enrutamiento selectivo basado en cuatro criterios: riesgo de seguridad, incertidumbre de evidencia, conflicto cross-modal y dependencia visual.
- Escalado automatico a un VLM (Qwen-VL en el sistema completo) cuando se supera cualquier umbral.
- Extraccion de caracteristicas (feature extraction) mediante sentence-transformers.
- Soporte multimodal indirecto: procesa senales de audio y video a traves de caracteristicas extraidas por componentes externos (Faster-Whisper, RapidOCR).
- Capacidad de abstencion: el sistema puede abstenerse de dar una respuesta si la evidencia no es suficiente.
- No genera texto ni codigo; es un componente de decision dentro de un pipeline mayor.

## Casos de uso

- Moderacion de contenido en streaming: el router detecta riesgo de seguridad en tiempo real y escala a un VLM para analisis visual detallado, reduciendo costes al no procesar todos los frames con un modelo grande.
- Asistentes de transcripcion con verificacion de hechos: cuando la incertidumbre de la transcripcion es alta (por ruido o acentos), el router activa la mejora visual para contrastar con OCR o contexto visual.
- Analisis de reuniones grabadas: detecta conflictos cross-modal (por ejemplo, discrepancia entre lo dicho y lo mostrado en una diapositiva) y escala para resolver la ambiguedad.
- Automatizacion de control de calidad en produccion de video: identifica dependencias visuales (objetos, texto en pantalla) y decide si es necesario un analisis visual adicional.
- Accesibilidad para personas con discapacidad auditiva: el router prioriza casos con alta incertidumbre de audio para generar subtitulos enriquecidos con contexto visual.
- Enrutamiento en pipelines de IA multimodal: sirve como capa de orquestacion para decidir que peticiones requieren un VLM caro, optimizando el coste por consulta en entornos de produccion.

## Benchmarks y rendimiento

La model card reporta metricas del artefacto y de un estudio end-to-end. No se han publicado comparaciones con otros routers similares.

| Metrica | Valor |
|---|---|
| Recall de escalada OOF (24 grupos, 4 pliegues) | 95,88 % |
| Recall de escalada en grupos no vistos (8 grupos, 576 casos) | 94,81 % |
| Recall de riesgo en grupos no vistos | 98,61 % |
| Tasa de mejora visual en grupos no vistos | 94,97 % |
| Tasa de calidad end-to-end (sistema aprendido, 32 videos) | 65,63 % |
| Tasa de calidad end-to-end (siempre visual) | 68,75 % |
| Tasa de calidad end-to-end (nunca visual) | 78,13 % |

El estudio end-to-end revelo que la hipotesis preregistrada H5 (que el escalado visual mejoraria la calidad) no se confirmo: en el test, el OCR ya resolvia los dos grupos visuales y el VLM introdujo inconsistencias de estado. Este resultado negativo se documenta como trabajo futuro.

## Requisitos de hardware

- Inferencia en CPU: el router es extremadamente ligero (encoder BGE-small de ~24 M de parametros mas cabezas logisticas), por lo que puede ejecutarse en un servidor sin GPU.
- VRAM estimada: menos de 1 GB si se usa el encoder con precision FP32; menos de 500 MB en cuantizacion int8 (no confirmado).
- GPU recomendada: ninguna en particular; cualquier GPU consumer (RTX 3060 o superior) es mas que suficiente si se desea acelerar el encoder.
- Compatible con consumer GPU: si, incluso en CPU.
- Opciones de despliegue: sentence-transformers para extraccion de caracteristicas; el artefacto JSON se integra en el pipeline de StreamSense-Serve. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia: no disponible; depende del encoder y del hardware. En CPU, la inferencia del encoder BGE-small suele estar en el rango de milisegundos por frase.

## Comparativa con modelos similares

No se han identificado routers de escalado multimodal publicos directamente comparables con las mismas caracteristicas (cuatro ramas de decision, calibracion conjunta, entrenamiento OOF). Los baselines del propio estudio (siempre visual y nunca visual) sirven como referencia interna, pero no son modelos alternativos. Por tanto, la comparativa con alternativas de la misma categoria no esta disponible.

## Limitaciones y advertencias

- No validado para decisiones medicas, vigilancia, reconocimiento de identidad ni acciones de seguridad autonomas; el autor lo indica explicitamente en la model card.
- El corpus de entrenamiento es sintetico: una sola familia de voz y plantillas visuales controladas. Acentos, habla espontanea, reuniones naturales y prioridades de despliegue requieren evaluacion separada.
- El estudio end-to-end mostro que el escalado visual no mejoro la calidad en el test (hipotesis H5 fallida); el VLM puede introducir inconsistencias en lugar de beneficios.
- La tasa de mejora visual del 94,97 % no debe interpretarse como un ahorro de costes en produccion: el propio autor advierte que el split de validacion es deliberadamente dificil (520/576 casos son oracle-positivos).
- La licencia no esta disponible, lo que genera incertidumbre sobre el uso comercial del artefacto.
- Depende de BAAI/bge-small-zh-v1.5, cuyos terminos de uso deben respetarse al descargar el encoder.
- No es un modelo generativo; no puede producir texto, codigo ni respuestas conversacionales por si mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jatshi/StreamSense-Serve-v4-Router
- Repositorio GitHub: https://github.com/Jatshi/StreamSense-Serve
- Documento arXiv (StreamSense): https://arxiv.org/abs/2601.22738
- Estado de implementacion (chino): https://github.com/Jatshi/StreamSense-Serve/blob/main/docs/V4_IMPLEMENTATION_STATUS_ZH.md
- Notas de version y diario de fallos (chino): https://github.com/Jatshi/StreamSense-Serve/blob/main/docs/V4_RELEASE_NOTES_ZH.md
- Guia de aprendizaje (chino): https://github.com/Jatshi/StreamSense-Serve/blob/main/docs/V4_LEARNING_AND_INTERVIEW_ZH.md
