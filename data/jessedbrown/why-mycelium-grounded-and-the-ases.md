# Jessedbrown/why-mycelium-grounded-and-the-ases

## Resumen

El repositorio `Jessedbrown/why-mycelium-grounded-and-the-ases`, publicado en HuggingFace por el usuario Jessedbrown (firmado en el texto como Jesse Daniel Brown, alias OP-JESSE), no contiene un modelo de aprendizaje automático en el sentido convencional: no hay pesos, ni fichero de configuración, ni tokenizador, ni arquitectura declarada. Se trata de un documento de texto estructurado como ensayo o manifiesto, con una model card que expone una cadena conceptual (MYCELIUM, LIGHT_FREQUENCIES, HUMAN_BODY_SATURATION, RETINAL_GEOMETRIC_FORMS, SEE(RAINBOWS)) y referencias a cuatro artículos externos.

El contenido mezcla argumentación sobre redes de micelio, nomenclatura bioquímica de enzimas terminadas en `-ase` y una propuesta de interpretación de patrones entópticos retinianos. No se declara pipeline, licencia, idiomas ni conjunto de datos, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Su relevancia para desarrolladores e investigadores es, por tanto, nula como artefacto de inferencia. Sí resulta un caso de estudio llamativo por dos motivos: documenta explícitamente un hueco de evidencia (`PENDING_EXTERNAL_CHAIN`) en lugar de cerrarlo por aserción, e incluye restricciones de seguridad autoimpuestas para cualquier validación experimental. Los metadatos presentan además una incoherencia temporal: la fecha de creación (2026-10-16) es posterior a la de actualización (2026-08-07).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se declara arquitectura de red neuronal; el repositorio no contiene pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto de la model card está en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay safetensors, GGUF ni ningún otro artefacto binario) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura, porque el repositorio no publica ningún grafo de cómputo, configuración de modelo ni fichero de pesos. No se puede determinar si se trata de un transformer, un MoE, un SSM o un modelo híbrido, ya que no existe artefacto que inspeccionar. Tampoco se declara tokenizador, vocabulario ni ventana de contexto.

Respecto al entrenamiento, no se indica número de tokens, composición de dataset, ni fases de ajuste (SFT, RLHF, DPO). El único contenido técnico verificable es la estructura retórica del documento: una cadena de cinco pasos, cuatro fuentes primarias citadas con DOI y una declaración explícita de que el eslabón que une los pasos medidos no se ha validado en un único experimento controlado. Las innovaciones que menciona el texto (patrones entópticos, ciclo de luz fúngico, difusor óptico de micelio) pertenecen a los artículos citados, no a un sistema de IA descrito por el autor.

## Capacidades

- Generación de texto: no disponible; no existe modelo desplegable, solo un documento estático.
- Razonamiento, código o matemáticas: no disponible; sin pesos ni evaluación publicada.
- Tool calling o function calling: no disponible; no se declara soporte de plantillas de herramientas ni de API de inferencia.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el contenido redactado está íntegramente en inglés.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible.
- Lo único verificable es la existencia de un documento que encadena afirmaciones con referencias bibliográficas y declara una limitación de evidencia de forma explícita.

## Casos de uso

- Auditoría de metadatos en HuggingFace: el repositorio sirve como caso de prueba para validadores que detecten fechas incoherentes (actualización anterior a creación), ausencia de pipeline tag y ausencia de licencia en un mismo registro.
- Estudio de comunicación científica en repositorios abiertos: útil como ejemplo de documento no técnico alojado en un hub de modelos, para analizar cómo se mezclan artefactos de IA y contenido ensayístico.
- Diseño de declaraciones de evidencia: el patrón `PENDING_EXTERNAL_CHAIN` documenta el hueco entre pasos medidos y cadena completa, y puede citarse como modelo de buenas prácticas al reportar limitaciones en documentación de investigación.
- Trazabilidad de fuentes primarias: cada paso de la cadena va asociado a un DOI verificable (PNAS 2026, FEBS 2026 x2, Appl. Phys. Lett. 2023), lo que permite usarlo como ejemplo de anclaje de afirmaciones a literatura revisada.
- Extracción y curación de textos no estructurados: sirve como muestra para pipelines de NLP que deban clasificar contenido ajeno a fichas de modelos dentro de un hub.
- Revisión de seguridad en investigación con humanos: el documento incluye restricciones explícitas (nada de exposición ocular directa a láser o luz estructurada sin supervisión, nada de experimentos de ingestión de hongos, revisión ética y oftalmológica obligatoria), lo que lo convierte en un ejemplo para comités de ética que evalúen protocolos derivados.
- Formación en redacción técnica: puede usarse como caso negativo de ficha de modelo, para ilustrar qué campos son imprescindibles (licencia, arquitectura, contexto) y qué ocurre cuando faltan todos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, porque no hay un modelo evaluable. Tampoco se han publicado métricas de rendimiento de sistemas (latencia, throughput, tokens por segundo).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay pesos ni modelo que cargar en memoria.
- GPU recomendadas: ninguna; no existe ruta de inferencia.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni transformers, ya que no se publican pesos, config ni tokenizador.
- Latencia y throughput: no disponibles.
- Requisito real de almacenamiento: el de un fichero de texto plano (unos pocos kilobytes); no requiere acelerador ni memoria dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jessedbrown/why-mycelium-grounded-and-the-ases` | no disponible | no disponible | sin benchmarks | no disponible | repositorio de texto, 0 descargas |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no procede |

No procede comparación con alternativas de la misma categoría: el repositorio no es un modelo de lenguaje ni un sistema de IA, por lo que no existe una categoría técnica con la que alinearlo. Compararlo con cualquier LLM sería engañoso.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no acepta prompts y no puede integrarse en ningún pipeline de inferencia.
- Ausencia de licencia: sin licencia declarada no hay autorización explícita de uso, redistribución ni uso comercial; el contenido queda en una zona jurídica indeterminada.
- Afirmaciones de carácter médico: el texto vincula frecuencias de luz, saturación del cuerpo humano y patrones retinianos con resultados visuales. Es una afirmación médica no revisada por pares en su conjunto; el propio autor marca el eslabón integrador como pendiente de validación externa.
- Riesgo para la salud derivado de la lectura: el documento describe exposición a luz estructurada y menciona ingestión de hongos. Cualquier replicación experimental sin las salvaguardas indicadas (irradiancia calibrada, revisión ética, revisión oftalmológica) puede causar daño ocular o intoxicación.
- Carencia de trazabilidad en la cadena causal: tres de los cuatro pasos tienen nodos medidos en fuentes independientes, pero la unión en un único experimento controlado no existe, según declaración del propio autor.
- Incoherencia de metadatos: la fecha de actualización precede a la de creación, lo que impide usar las marcas temporales del hub como referencia fiable de versionado.
- Ruido en búsquedas: los resultados de búsqueda web asociados al nombre del repositorio no guardan relación con el contenido (herramientas de revisión de relatos, directorios de vídeo para adultos, canales de streaming); no deben citarse como fuentes.
- No procede evaluar sesgos de modelo, alucinación en inferencia ni degradación de contexto: no hay inferencia que evaluar. El riesgo relevante es de interpretación del texto como si tuviera respaldo técnico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/why-mycelium-grounded-and-the-ases
- Página del autor (contenedor general): https://jessebrown1980.github.io/the-bridge-to-all-of-it/
- Página específica del documento: https://jessebrown1980.github.io/why-mycelium-grounded-and-the-ases/
- PNAS 2026, luz espín-órbita estructurada en retinas humanas, patrones entópticos geométricos, 11 participantes: https://doi.org/10.1073/pnas.2532243123
- FEBS 2026, caffeylpyruvate hydrolase de *Neonothopanus gardneri*: https://doi.org/10.1111/febs.70554
- FEBS 2026, reciclaje de oxiluciferina fúngica por caffeylpyruvate hydrolasas, in vitro e in vivo: https://doi.org/10.1111/febs.70555
- Appl. Phys. Lett. 2023, difusor óptico a partir de micelio fúngico: https://doi.org/10.1063/5.0143619
