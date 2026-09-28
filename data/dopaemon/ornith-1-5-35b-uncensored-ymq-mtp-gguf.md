# dopaemon/Ornith-1.5-35B-Uncensored-YMQ-MTP-GGUF

## Resumen

Ornith-1.5-35B-Uncensored-YMQ-MTP-GGUF es un repositorio de cuantizaciones GGUF del modelo base Ornith-1.5-35B-A3B-Uncensored, publicado por el usuario dopaemon dentro del proyecto de cuantización ZeroDigest (YMQ-Compiler v2.0). El modelo subyacente pertenece a la familia Ornith 1.5 de DeepReinforce, según el blog de referencia encontrado, y es un Mixture-of-Experts (MoE) de 35.505.251.456 parámetros totales con aproximadamente 3.000 millones de parámetros activos (sufijo A3B). La particularidad de este repositorio es que no se trata de un modelo nuevo, sino de un reempaquetado de pesos con un esquema de cuantización en precisión mixta, consciente de la arquitectura MoE.

La propuesta de valor del proyecto es preservar la topología de enrutamiento de expertos y las rutas del especulador MTP (multi-token prediction) frente a las cuantizaciones planas tradicionales. Según la model card, una cuantización estándar Q4_K_M de ~21,0 GB obtiene una perplejidad de 13,4757 en WikiText-2, mientras que el preset YMQ-M de ~16,2 GB baja a 12,4310, es decir, mejor calidad con 4,8 GB menos de peso. El repositorio incluye cuatro niveles (XS, S, M y L) pensados para entornos de agente local tipo RooCode o Aider.

Se trata de un lanzamiento reciente (creado y actualizado el 27 de septiembre de 2026) con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que conviene tratarlo como material de evaluación experimental. Existen réplicas del mismo contenido en la cuenta zerodigest, con enlaces activos a los ficheros GGUF concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre el modelo base Ornith-1.5-35B-A3B-Uncensored; no se detalla el resto de la arquitectura subyacente |
| Parametros totales | 35.505.251.456 (~35,5 mil millones) |
| Parametros activos | ~3 mil millones (sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta YMQ por preset: XS (IQ3_S → IQ2_S → IQ2_XS), S (IQ4_NL → IQ3_S → IQ3_XXS → IQ2_S), M (Q5_K → IQ4_XS → IQ3_S → IQ3_XXS), L (Q6_K → Q5_K → IQ4_NL → IQ3_S) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones generadas desde ficheros fuente BF16 en crudo) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de la familia Ornith 1.5 de DeepReinforce, con 35.505.251.456 parámetros totales y unos 3.000 millones activos por token, lo que lo sitúa en la categoría de MoE de gran tamaño total y bajo coste de inferencia por token. La model card no aporta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO para el modelo base; el calificativo "Uncensored" en el nombre indica que se ha retirado o reducido el alineamiento de seguridad, pero no se documenta el procedimiento exacto.

La innovación del repositorio no está en el entrenamiento, sino en la cuantización. El YMQ-Compiler v2.0 aplica un esquema de precisión mixta "consciente de la arquitectura" que asigna distintos bits por capa (por ejemplo, Q5_K en las capas altas y IQ3_XXS en las bajas para el preset M) en lugar de un bit-depth uniforme. El objetivo declarado es proteger las rutas de enrutamiento de los expertos y las rutas del especulador MTP (multi-token prediction), que las cuantizaciones planas degradan al no distinguir capas críticas de capas redundantes. La model card referencia un enfoque "inspirado en AutoRound" y el uso de barridos de matriz de importancia (imatrix) para calibrar cada preset.

## Capacidades

- Generación de texto conversacional (pipeline declarado text-generation, etiqueta conversational).
- Ejecución en entornos de agente local y flujos multi-paso, según la model card orientada a RooCode y Aider.
- Decodificación especulativa mediante MTP (multi-token prediction), integrada en el esquema de cuantización y presumiblemente explotable por llama.cpp u otros backends compatibles.
- Preservación de la topología de enrutamiento MoE, pensada para mantener la coherencia lógica en tareas de razonamiento y código.
- Modelo "uncensored": sin los filtros de rechazo habituales, lo que amplía el rango de respuestas pero elimina salvaguardas.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia de programación en IDE: el preset M está calibrado explícitamente para entornos tipo RooCode y Aider, de modo que el modelo puede mantener bucles de agente con contexto largo mientras reserva VRAM para el historial de conversación.
- Despliegue en estaciones de trabajo de 12 GB de VRAM: el preset XS (~11,5 GB) permite ejecutar un MoE de 35B totales en una GPU de gama media, útil para desarrolladores con hardware limitado que necesitan un modelo de razonamiento.
- Generación de código en pipelines locales: al ser GGUF compatible con llama.cpp, puede integrarse en scripts de CI/CD o pre-commit hooks que invoquen el binario de inferencia.
- Fine-tuning o evaluación sobre dominio propio: al partir del modelo uncensored, es adecuado para investigar comportamientos sin rechazos y para tareas de red-teaming o análisis de sesgos.
- Prototipado de agentes multi-paso: el esquema MTP permite decodificación especulativa, lo que reduce la latencia en cadenas largas de llamadas a herramientas cuando el backend lo soporta.
- Sustitución de API en la nube por inferencia local: el preset L (~18,6 GB) ofrece "casi sin pérdida" (perplejidad 12,5107) para entornos donde no se puede enviar datos a servicios externos.
- Investigación en cuantización: el repositorio sirve como caso de estudio reproducible de precisión mixta consciente de MoE, con métricas de perplejidad por preset.

## Benchmarks y rendimiento

La model card únicamente publica perplejidad en WikiText-2, medida con `llama-perplexity` sobre una ventana de contexto de 4096 tokens. No hay MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

| Variante | Tamano del fichero | Perplejidad WikiText-2 (menor es mejor) | Gradiente de bits |
|---|---|---|---|
| YMQ XS | ~11,5 GB | 13,5942 | IQ3_S → IQ2_S → IQ2_XS → IQ2_XS |
| YMQ S | ~13,4 GB | 13,5454 | IQ4_NL → IQ3_S → IQ3_XXS → IQ2_S |
| YMQ M (recomendado) | ~16,2 GB | 12,4310 | Q5_K → IQ4_XS → IQ3_S → IQ3_XXS |
| YMQ L | ~18,6 GB | 12,5107 | Q6_K → Q5_K → IQ4_NL → IQ3_S |
| Cuantización plana Q4_K_M (referencia del autor) | ~21,0 GB | 13,4757 | bit-depth uniforme |

Los datos proceden de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- Preset XS (~11,5 GB): cabe en una GPU de 12 GB de VRAM; es el preset de entrada para equipos ajustados.
- Preset S (~13,4 GB): requiere al menos 16 GB de VRAM para dejar margen de caché.
- Preset M (~16,2 GB): recomendado por el autor; pensado para GPU de 24 GB con espacio para bucles de agente de contexto largo.
- Preset L (~18,6 GB): orientado a procesamiento en una sola GPU de gama alta (24 GB), con calidad cercana a sin pérdida.
- Según el blog de referencia, el modelo base a 4 bits cabe en una GPU de 24 GB o en un Mac de 32 GB de memoria unificada.
- El repositorio completo ocupa 61,3 GB, por lo que conviene descargar solo el preset necesario.
- Opciones de despliegue: llama.cpp (se cita `llama-perplexity` como harness de medida), y por compatibilidad GGUF caben Ollama, LM Studio u otros runners que soporten MoE y MTP. No se confirma soporte explícito de vLLM o TGI en la información aportada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos de modelos de terceros comparables en la información proporcionada. La única comparación disponible es interna al propio proyecto de cuantización.

| Variante | Tamano | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|
| Ornith-1.5-35B YMQ-MTP (YMQ M) | ~16,2 GB | 12,4310 | apache-2.0 |
| Ornith-1.5-35B YMQ-MTP (YMQ L) | ~18,6 GB | 12,5107 | apache-2.0 |
| Cuantización plana Q4_K_M del mismo modelo | ~21,0 GB | 13,4757 | apache-2.0 (heredada del base) |
| Ornith 1.5 35B A3B Apex MTP (cuantización alternativa) | ~20,7 GB | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo base está etiquetado como "uncensored": no aplica filtros de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal sin salvaguardas. No es apto para producción orientada al usuario final sin moderación externa.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fidelidad factual en la información disponible.
- Los resultados de perplejidad los publica el propio autor de la cuantización, sin verificación independiente; deben interpretarse con cautela.
- Repositorio con 0 descargas y 0 likes en el momento de redactar la ficha: no hay evidencia comunitaria de funcionamiento estable ni de reproducibilidad del esquema YMQ.
- La model card original está truncada en el fragmento proporcionado; es posible que existan detalles de licencia, uso o limitaciones que no aparezcan aquí.
- No se documentan idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues multilingües o de contexto largo.
- La licencia apache-2.0 permite uso comercial, pero el carácter uncensored del base puede chocar con políticas de plataforma o requisitos legales por jurisdicción.
- El soporte de MTP depende del backend de inferencia; si el runtime no lo implementa, se pierde la ventaja de decodificación especulativa.
- El tamaño total del repositorio (61,3 GB) implica una descarga considerable si no se selecciona un solo fichero.

## Enlaces

- Repositorio HuggingFace (objeto de esta ficha): https://huggingface.co/dopaemon/Ornith-1.5-35B-Uncensored-YMQ-MTP-GGUF
- Réplica en la cuenta zerodigest: https://huggingface.co/zerodigest/Ornith-1.5-35B-Uncensored-YMQ-MTP-GGUF
- Fichero concreto del preset M: https://huggingface.co/zerodigest/Ornith-1.5-35B-Uncensored-YMQ-MTP-GGUF/blob/main/Ornith-1.5-35B-Uncensored-YMQ-M.gguf
- Modelo base: https://huggingface.co/0xKitkat/Ornith-1.5-35B-A3B-Uncensored
- Compilador YMQ v2.0 (GitHub): https://github.com/minyor/ymq-compiler
- Guía de ejecución local, hardware y benchmarks: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-35b-locally
- Ficha del modelo en local-ai-zone (Ornith 1.5 35B A3B Uncensored): https://local-ai-zone.github.io/models/ornith-1-5-35b-a3b-uncensored.html
- Ficha de la variante Apex MTP: https://local-ai-zone.github.io/models/ornith-1-5-35b-a3b-apex-mtp.html
