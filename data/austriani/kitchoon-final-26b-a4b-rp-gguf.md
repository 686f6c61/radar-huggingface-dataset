# Austriani/Kitchoon-Final-26B-A4B-RP-GGUF

## Resumen

Kitchoon-Final-26B-A4B-RP-GGUF es la distribucion en formato GGUF de Kitchoon-Final-26B-A4B, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 25.233.142.046 parametros totales (aproximadamente 26B) y unos 4B parametros activos por token, segun las etiquetas y cifras declaradas por el autor. El modelo base lo desarrolla SubMaroon, mientras que esta publicacion la mantiene Austriani y esta orientada a inferencia local mediante llama.cpp.

El modelo esta especializado en generacion de texto creativo y conversacional, con enfasis explicito en roleplay (RP), contenido para adultos (ERP), escritura creativa y temas oscuros, y se distribuye como modelo "uncensored". Tecnicamente resulta relevante porque combina una arquitectura MoE dispersa (solo ~4B parametros activos de 26B) con cuantizaciones GGUF generadas mediante imatrix y calibracion "v3", lo que reduce los requisitos de computo en inferencia frente a un modelo denso del mismo tamano total.

La ficha se centra en la version cuantizada publicada, que ocupa 292,6 GB en el repositorio y declara compatibilidad con endpoints y llama.cpp. La model card del autor esta dominada por una maquetacion HTML del repositorio y ofrece muy poca informacion tecnica verificable sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), etiquetada por el autor como derivada de la familia "gemma-4"; detalles de capas y atencion no disponibles |
| Parametros totales | 25.233.142.046 (~26B) |
| Parametros activos | ~4B por token (indicado en el nombre y las etiquetas del modelo) |
| Longitud de contexto | 1024 tokens (cifra mostrada en la model card del autor) |
| Tipos de cuantizacion | Multiples cuantizaciones GGUF (el autor menciona imatrix y calibracion v3); el listado concreto por fichero no esta disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo es un transformer con arquitectura Mixture of Experts: 26B parametros totales con aproximadamente 4B activos por token. Las etiquetas del autor lo relacionan con "gemma-4" como familia base, aunque no se detalla el numero de expertos, la estrategia de routing ni el tipo de atencion empleado. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado sobre el modelo base SubMaroon/Kitchoon-Final-26B-A4B.

La innovacion tecnica documentada en esta publicacion se limita al proceso de cuantizacion: el autor indica el uso de imatrix con un esquema de calibracion denominado "v3-calibration", orientado a preservar la calidad del modelo en tareas de roleplay y escritura creativa tras la compresion. La model card menciona "500 ciclos", presumiblemente como parte de la configuracion de calibracion o del pipeline de cuantizacion, aunque el autor no aclara su significado exacto.

## Capacidades

- Generacion de texto conversacional y creativo, optimizada para dialogos multi-turno de roleplay.
- Escritura creativa y narrativa, incluyendo tematicas oscuras ("dark-themes") segun las etiquetas del autor.
- Contenido para adultos (ERP) y modo "uncensored", con menor rechazo declarado a peticiones sensibles.
- Mantenimiento de personajes y contexto conversacional dentro de ventanas cortas de 1024 tokens.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas por el autor.
- Capacidades multimodales (vision, audio): no disponibles.
- Multilinguismo limitado al ingles; no se declaran otros idiomas.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener sesiones de juego de rol con personajes definidos, aprovechando su ajuste especifico para RP y su modo conversacional, aunque limitado a ventanas de unos 1024 tokens por intercambio efectivo.
- Escritura creativa asistida: util para generar borradores de narrativa, dialogos y tramas con tematica adulta u oscura, donde otros modelos alineados rechazan el contenido.
- Prototipado de chatbots de entretenimiento: adecuado para entornos de prueba donde se prioriza el tono libre y el estilo narrativo sobre la exactitud factual.
- Generacion de ficcion interactiva: integrable en motores de historias ramificadas mediante llama.cpp, con coste de inferencia reducido gracias a los ~4B parametros activos del MoE.
- Despliegue en hardware de consumo: al ser GGUF cuantizado, permite ejecutar un modelo de 26B totales en equipos de gama alta sin GPU de datacenter, a costa de menor contexto y precision.
- Experimentacion con cuantizacion imatrix: sirve como referencia para estudiar el impacto del esquema "v3-calibration" en la calidad de modelos MoE orientados a creatividad.
- Fine-tuning posterior o adaptaciones LoRA: la licencia Apache 2.0 facilita derivados para dominios de narrativa o entretenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; un modelo MoE de 26B totales en GGUF suele requerir del orden de 15-20 GB en cuantizaciones de 4-5 bits, aunque el autor no publica cifras por fichero.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o A100/H100 serian adecuadas para las cuantizaciones mas pequenas.
- GPU de consumo: probablemente ejecutable en RTX 3090/4090 con cuantizaciones bajas; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (libreria declarada), con compatibilidad de endpoints indicada en las etiquetas.
- Latencia y throughput: no disponibles; el uso de ~4B parametros activos deberia reducir el coste por token frente a un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B-RP-GGUF | ~26B | ~4B | 1024 | Apache 2.0 | GGUF en Hugging Face |
| Modelos MoE de ~20-30B orientados a chat (genericos) | no disponible | no disponible | no disponible | variable | no disponible |
| Modelos densos de ~7-8B para roleplay | ~7-8B | ~7-8B | variable | variable | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Contenido no filtrado: el modelo se declara "uncensored" y orientado a temas adultos y oscuros, lo que implica riesgos de contenido sensible y requiere controles adicionales en produccion.
- Ventana de contexto muy corta (1024 tokens), insuficiente para conversaciones largas, documentos extensos o agentes multi-paso.
- Solo ingles: no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinacion elevado en tareas factibles (preguntas factuales, codigo, matematicas), ya que el ajuste prioriza estilo narrativo sobre precision.
- Sesgos desconocidos: el autor no documenta evaluaciones de sesgo ni datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset y el entrenamiento limita las garantias de cumplimiento.
- Repositorio de 292,6 GB: requiere almacenamiento considerable y descarga selectiva de ficheros.
- Model card principalmente decorativa: no ofrece informacion tecnica verificable sobre el modelo base ni sobre el proceso de cuantizacion por fichero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Kitchoon-Final-26B-A4B-RP-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
