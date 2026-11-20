# mradermacher/ROMA-7B-i1-GGUF

## Resumen

ROMA-7B es un modelo multimodal desarrollado por GeWu-Lab (Renmin University of China) orientado a robótica y percepción activa. A diferencia de los modelos vision-language convencionales, ROMA integra entradas táctiles y de audio además de imagen y texto, lo que lo sitúa en la categoría de modelos diseñados para agentes físicos que necesitan razonar sobre información sensorial heterogénea. El modelo base cuenta con aproximadamente 7.615 millones de parámetros y licencia Apache 2.0.

La ficha que nos ocupa, `mradermacher/ROMA-7B-i1-GGUF`, es una cuantización GGUF del modelo original `GeWu-Lab/ROMA-7B`, publicada por mradermacher. Emplea cuantizaciones con imatrix (etiquetadas como i1) para preservar mejor la calidad en rangos bajos de bits, y ofrece un abanico amplio desde IQ1_S (~2,0 GB) hasta Q6_K (~6,4 GB). El repositorio completo ocupa 89 GB, incluyendo todos los ficheros de cuantización.

Su relevancia actual radica en que permite ejecutar un modelo de robótica multimodal de 7B en hardware de consumo mediante llama.cpp, algo poco habitual en modelos táctiles/audio-visuales, que suelen requerir infraestructura de datacenter. Está pensado para investigación en manipulación robótica, percepción activa y sistemas que combinan señales sensoriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal con entradas táctiles, audio, imagen y texto; no se detalla la topología interna en la información disponible) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantización i1 con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (imatrix i1); modelo base original en safetensors (según parámetros reportados por Hugging Face) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base `GeWu-Lab/ROMA-7B`: no se especifica si se trata de un transformer decoder-only con adaptadores multimodales, de una arquitectura híbrida o de un diseño con encoders separados por modalidad. Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas concretas como decodificación especulativa o atención lineal.

Lo que sí se deduce de las etiquetas y la model card es que ROMA-7B está diseñado para percepción activa en robótica, con entradas multimodales que incluyen tactile (táctil), audio, imagen y texto. La cuantización publicada por mradermacher emplea el formato i1 con fichero imatrix (importance matrix), una técnica que calibra la cuantización usando estadísticas de activaciones sobre datos de calibración para minimizar la degradación de perplejidad en cuantizaciones agresivas (IQ1–IQ3). El autor indica que las cuantizaciones estáticas equivalentes están disponibles en `mradermacher/ROMA-7B-GGUF`.

## Capacidades

- Procesamiento multimodal con entrada táctil, audio, imagen y texto, orientado a tareas de robótica y percepción activa.
- Razonamiento conversacional multi-turno (etiqueta `conversational`).
- Comprensión de señales sensoriales no visuales (tacto, audio) para toma de decisiones en agentes físicos.
- Integración con pipelines de robótica (pipeline declarado: `robotics`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades de texto generales heredadas del modelo base (generación, respuesta a instrucciones), aunque no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma.

## Casos de uso

- Manipulación robótica con retroalimentación táctil: el modelo puede integrarse en bucles de control donde las lecturas de sensores táctiles se combinan con imagen y texto para decidir agarres o ajustes de fuerza. Su naturaleza multimodal táctil lo hace adecuado para tareas donde la visión sola es insuficiente.
- Percepción activa en robots móviles: uso del modelo para decidir qué sensor consultar o hacia dónde orientar la cámara en función del contexto, aprovechando la etiqueta `active-perception` del modelo base.
- Asistencia por voz en entornos físicos: combinación de entrada de audio con contexto visual para interpretar comandos hablados en escenarios de robótica de servicio.
- Investigación en aprendizaje multimodal sensorimotor: el modelo sirve como base para experimentos que estudian cómo fusionar modalidades táctiles y auditivas con lenguaje, gracias a su licencia Apache 2.0 y a las cuantizaciones ligeras que permiten iterar en GPUs de consumo.
- Prototipado en hardware de consumo: con cuantizaciones IQ4_XS (~4,3 GB) o Q4_K_M (~4,8 GB) se puede desplegar en una RTX 4090 o incluso en GPUs de 8 GB con cuantizaciones IQ2/IQ3, facilitando pruebas rápidas de pipelines robóticos sin clúster.
- Despliegue en el edge con llama.cpp: al estar en formato GGUF, el modelo puede ejecutarse en dispositivos con recursos limitados integrados en un robot, reduciendo la dependencia de conectividad a la nube.
- Generación de descripciones de escenas sensoriales para registro y depuración: el modelo puede narrar en texto lo que percibe a través de tacto, audio e imagen, útil para telemetría y análisis post-hoc en flotas de robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - IQ1_S (~2,0 GB) e IQ1_M (~2,1 GB): aptas para GPUs de 4 GB, calidad muy degradada.
  - IQ2_XXS a IQ2_M (~2,4–2,9 GB): GPUs de 4–6 GB.
  - IQ3_XXS a IQ3_M (~3,2–3,7 GB): GPUs de 6–8 GB.
  - IQ4_XS (~4,3 GB) y Q4_K_M (~4,8 GB): GPUs de 8 GB; recomendadas para equilibrio calidad/tamaño.
  - Q5_K_M (~5,5 GB) y Q6_K (~6,4 GB): GPUs de 8–12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para cuantizaciones altas con contexto amplio; A100/H100 no necesarias para este tamaño, salvo despliegues concurrentes.
- Cabe en GPU de consumo: sí, desde una RTX 3050 8 GB con cuantizaciones IQ3/IQ4, hasta una RTX 4090 con Q6_K y contexto extendido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importación del GGUF), y servidores compatibles con endpoints (etiqueta `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo multimodal sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia cualitativa, el autor marca Q4_K_M como "fast, recommended" y Q4_0 como "fast, low quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato disponible |
|---|---|---|---|---|---|
| ROMA-7B (esta ficha, GGUF i1) | ~7,6B | no disponible | texto, imagen, audio, táctil | apache-2.0 | GGUF (i1 imatrix) |
| GeWu-Lab/ROMA-7B (base) | ~7,6B | no disponible | texto, imagen, audio, táctil | apache-2.0 | safetensors |
| Modelos vision-language 7B genéricos (p. ej. familia LLaVA) | ~7B | variable según variante | texto, imagen | variable | safetensors, GGUF |
| Modelos de robótica multimodal con entrada táctil | no disponible | no disponible | texto, imagen, táctil | variable | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks ni de comparativas cuantitativas con alternativas concretas; la comparación anterior es estructural (modalidades, licencia, formato) y no de rendimiento.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés (`en`); el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no se documentan en la información disponible; al ser un modelo entrenado para robótica, puede heredar sesgos de los datasets de percepción empleados, que no se detallan.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo, es susceptible de producir descripciones inexactas de escenas sensoriales, lo que es crítico en robótica.
- Contexto: la longitud de contexto no está especificada; no se debe asumir una ventana larga sin verificarla en el modelo base.
- Cuantizaciones muy agresivas: el propio autor advierte que IQ1_S es "for the desperate" y IQ1_M "mostly desperate"; Q2_K_S es "very low quality". Para producción se recomienda IQ4_XS o superior.
- Compatibilidad multimodal en llama.cpp: aunque el repo incluye pesos GGUF, la información no confirma que todos los proyectores multimodales (táctil/audio) estén empaquetados o soportados por las herramientas de inferencia; conviene verificar antes de desplegar.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datasets de entrenamiento originales, no detallados aquí.
- Fecha de creación del repo (2026-10-17) y actualización (2026-11-20): verificar que la versión descargada corresponde a la revisión más reciente.
- El repositorio ocupa 89 GB por incluir todas las cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ROMA-7B-i1-GGUF
- Modelo base: https://huggingface.co/GeWu-Lab/ROMA-7B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/ROMA-7B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#ROMA-7B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
