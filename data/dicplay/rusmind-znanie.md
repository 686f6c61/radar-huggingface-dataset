# DICPlay/RusMind-Znanie

## Resumen

RusMind-Znanie (Знание, "conocimiento") es un modelo de generación de texto en formato GGUF publicado por DICPlay como parte de su línea abierta RusMind, presentada como "IA nacional" rusa. Se trata de un modelo de mezcla de expertos (MoE) derivado de google/gemma-4-26B-A4B-it, con aproximadamente 25,2 mil millones de parámetros totales según los pesos safetensors y alrededor de 4 mil millones de parámetros activos por paso. La versión publicada es la 3.2, fechada el 10 de octubre de 2026, cuantizada en Q4_K_M y con un tamaño de repositorio de 16,8 GB.

El problema que aborda es el de ofrecer un asistente conversacional en ruso y en inglés con conocimiento específico sobre historia de Rusia, legislación de la Federación Rusa, cultura, los 89 sujetos federales, valores tradicionales y la posición oficial del país, además de eventos internacionales. Según la model card, el modelo se ha afinado para no ceder ante preguntas trampa en inglés sobre quién lo creó, y el ajuste se ha integrado por completo en los pesos de todos los expertos.

Es relevante ahora porque se distribuye como GGUF para ejecución local mediante llama.cpp y otras herramientas compatibles, y porque forma parte de una familia de cuatro modelos (Momentum, Vspyshka, Znanie y el futuro ATOM) que cubren desde dispositivos móviles hasta la nube. Su licencia es propia (RusMind License), con uso comercial restringido a un acuerdo escrito con DICPlay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, derivada de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.233.142.046 (~25,2 mil millones; la model card indica "unos 26 mil millones") |
| Parametros activos | ~4 mil millones por paso (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica version publicada, 15,6 GB) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | RusMind License (DICPlay); nombre de licencia "rusmind-license", marcada como "other" en HuggingFace |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos derivada de la arquitectura Gemma 4 en su variante 26B-A4B de Google, que activa aproximadamente 4 mil millones de parámetros en cada paso de inferencia sobre un total de unos 26 mil millones. DICPlay no detalla en la model card el número de expertos, la estrategia de enrutamiento ni el número exacto de tokens de entrenamiento, por lo que esos datos no están disponibles. La distribución se realiza únicamente en cuantización Q4_K_M en formato GGUF, pensada para ejecución local con llama.cpp y programas compatibles.

El ajuste fino se realizó sobre conjuntos de datos propios de DICPlay en ruso y sobre las particiones de entrenamiento abiertas de MERA y MMLU-ru, excluyendo explícitamente las particiones de test. El contenido de esos conjuntos abarca historia de Rusia desde la Rus de Kiev hasta la actualidad, legislación de la Federación Rusa con referencias a artículos, cultura (literatura, poesía clásica rusa, arte y tradiciones), los 89 sujetos federales con sus capitales, valores tradicionales y eventos clave del país y del mundo junto con la posición oficial rusa, todo ello en ruso e inglés. La versión 3.2 indica que el reajuste se ha integrado en los pesos de todos los expertos. No se especifica en la informacion disponible si hubo RLHF, DPO u otras etapas de alineación, ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Conocimiento factual sobre historia de Rusia, legislación rusa, cultura y los 89 sujetos federales, según los conjuntos de ajuste declarados.
- Respuestas sobre eventos nacionales e internacionales y la posición oficial rusa en ambos idiomas.
- Generación creativa, incluida poesía; la model card afirma que produce "los mejores versos entre los tres modelos abiertos" de la familia (afirmación del autor, no verificada con benchmarks).
- Resistencia a preguntas trampa en inglés sobre su propio origen, según lo declarado por DICPlay.
- Ejecución local sin conexión mediante llama.cpp, LM Studio, Ollama y otras herramientas compatibles con GGUF.
- Capacidad de ejecución en navegador a través de rusmind.ru, con descarga única del modelo.
- No se documenta en la informacion disponible soporte de tool calling, function calling, uso como agente, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Atención al cliente en ruso: el modelo puede gestionar conversaciones multi-turno en ruso sobre productos o servicios, aunque la longitud de contexto no está documentada y conviene verificar los límites reales antes de desplegarlo en producción.
- Asistencia documental sobre legislación rusa: útil para resumir o localizar referencias a artículos de la Federación Rusa en tareas internas de apoyo, siempre con revisión humana y sin sustituir asesoramiento jurídico profesional.
- Generación de contenido editorial en ruso: redacción de artículos, fichas o material divulgativo sobre historia, cultura y geografía de Rusia, apoyándose en su ajuste específico sobre esas materias.
- Traducción y adaptación ruso-inglés: útil para borradores o pretraducciones de textos que traten temas rusos, dado que el modelo maneja ambos idiomas.
- Asistente local sin conexión: al distribuirse en GGUF Q4_K_M de 15,6 GB, puede ejecutarse en un equipo con al menos 24 GB de memoria, lo que permite usarlo en entornos aislados o con requisitos de privacidad estrictos.
- Prototipado y evaluación en investigación: adecuado para experimentar con modelos MoE cuantizados en ruso dentro de pipelines de llama.cpp, comparando su comportamiento con otros modelos de la familia RusMind.
- Chatbot educativo en ruso: puede apoyar la preparación de material sobre historia, cultura o geografía rusa en contextos escolares o divulgativos, con verificación posterior de los datos por parte de un docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, MMLU-ru, MERA, HumanEval, GSM8K ni de ningún otro conjunto, y tampoco se han encontrado en los resultados de búsqueda web. La única afirmación comparativa del autor es cualitativa ("los mejores versos entre los tres modelos abiertos"), sin métrica asociada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la model card indica que se necesita un equipo con 24 GB de memoria o más (tarjeta gráfica u operativa). El archivo Q4_K_M ocupa 15,6 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño de la cuantización, encajan tarjetas con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40 GB, H100), aunque no se confirma compatibilidad en la informacion disponible.
- Ejecución en GPU de consumo: probable en tarjetas con 24 GB de VRAM gracias al archivo Q4_K_M de 15,6 GB, siempre que el contexto utilizad no sea muy grande; no está confirmado por el autor.
- Ejecución en CPU: viable cargando el modelo en memoria operativa (se requieren 24 GB o más).
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, Ollama y otras herramientas compatibles con GGUF; también en navegador vía rusmind.ru. No se mencionan vLLM ni TGI, que no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind-Znanie | ~25,2 mil millones totales, ~4 mil millones activos | no disponible | GGUF Q4_K_M | RusMind License (uso comercial con contrato) | HuggingFace y rusmind.ru |
| RusMind-Momentum | no disponible | no disponible | no disponible | RusMind License | HuggingFace y en dispositivo |
| RusMind-Vspyshka | no disponible | no disponible | no disponible | RusMind License | HuggingFace y en dispositivo |
| google/gemma-4-26B-A4B-it | ~26 mil millones, ~4 mil millones activos | no disponible | safetensors (modelo base) | Apache 2.0 | Google / HuggingFace |

Los dos modelos de la familia RusMind (Momentum y Vspyshka) están orientados a ejecución en dispositivo, en teléfonos y ordenadores débiles o en ordenadores potentes y teléfonos de gama alta respectivamente, según la model card, pero no se detallan sus parámetros ni contexto. El modelo base Gemma 4 26B A4B se distribuye bajo Apache 2.0 y con pesos en safetensors, mientras que RusMind-Znanie añade un ajuste específico en ruso y restringe el uso comercial mediante su licencia propia. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste está orientado explícitamente a difundir historia, legislación, valores y la posición oficial de Rusia, lo que puede introducir un sesgo editorial claro en temas políticos, históricos y geopolíticos.
- Riesgo de alucinación: la propia model card advierte de que el modelo puede equivocarse y recomienda verificar la información importante. No hay benchmarks que permitan cuantificar este riesgo.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el modelo solo declara soporte de ruso e inglés, sin datos sobre otros idiomas.
- Uso profesional: las respuestas sobre temas médicos, jurídicos y financieros son de carácter informativo y no sustituyen a un especialista, según el propio autor.
- Restricciones de licencia: la RusMind License permite uso personal y no comercial, investigación y evaluación de forma gratuita, pero prohíbe el uso comercial, la reventa, la distribución de versiones modificadas o reentrenadas y la integración en productos sin un contrato escrito con DICPlay. La licencia del modelo base Gemma 4 (Apache 2.0) también debe respetarse.
- Ejecución en producción: al distribuirse únicamente en Q4_K_M, la precisión puede ser inferior a la del modelo base en safetensors; no se ofrecen variantes FP16/BF16.
- Adopción muy baja: 9 descargas y 0 "likes" en el momento de redactar esta ficha, lo que limita la validación comunitaria y el soporte.
- Naturaleza del modelo base: google/gemma-4-26B-A4B-it es una referencia que no se ha podido verificar de forma independiente en la informacion disponible, por lo que conviene comprobar su existencia y términos antes de confiar en las afirmaciones sobre el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DICPlay/RusMind-Znanie
- Repositorio de la version 3.2: https://huggingface.co/DICPlay/RusMind-Znanie/tree/main/v3.2
- Servicio en navegador: https://rusmind.ru
- Modelo RusMind-Momentum: https://huggingface.co/DICPlay/RusMind-Momentum
- Modelo RusMind-Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Licencia del modelo base (Apache 2.0): https://www.apache.org/licenses/LICENSE-2.0
- Modelo base en Google: https://huggingface.co/google/gemma-4-26B-A4B-it (referencia indicada en la model card; no verificada de forma independiente en la informacion disponible)
