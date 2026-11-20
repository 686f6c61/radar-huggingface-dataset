# bviggiano/ESMFold2-Experimental-Fast

## Resumen

ESMFold2-Experimental-Fast es un modelo de predicción de estructura de proteínas desarrollado por Chan Zuckerberg Biohub (CZI Biohub) que predice estructuras 3D de alta resolución y de todos los átomos a partir de una secuencia de aminoácidos, bien en modo de secuencia única o condicionado por alineamiento múltiple de secuencias (MSA). Forma parte de la familia ESMFold2, presentada junto al artículo "Language Modeling Materializes a World Model of Protein Biology", y esta variante "Fast" es una versión experimental orientada a reproducibilidad de los resultados del paper, no al uso productivo.

El repositorio analizado es un espejo de procedencia de `biohub/ESMFold2-Experimental-Fast`, republicado sin modificaciones por el usuario `bviggiano` para preservar los pesos originales. Según la model card, los ficheros `model.safetensors` y `config.json` son idénticos byte a byte al commit original, con hashes SHA-256 verificables. El modelo cuenta con 179.303.900 parámetros (aproximadamente 179 millones) en formato safetensors y un tamaño de repositorio de 0,7 GB.

La relevancia de esta ficha radica en dos puntos: por un lado, documenta una herramienta de plegamiento proteico de código abierto bajo licencia MIT, lo que la hace atractiva para investigación y experimentación sin las restricciones de licencias más restrictivas habituales en el ámbito de la biología estructural; por otro, advierte de que se trata de un modelo experimental y de un espejo no oficial, por lo que para trabajo de investigación se recomienda acudir al modelo original y a la versión estable `biohub/ESMFold2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de predicción de estructura proteica basado en la familia ESM; detalles de arquitectura no especificados en la información disponible) |
| Parametros totales | 179.303.900 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según metadatos; el modelo opera sobre secuencias de aminoácidos, no sobre texto natural) |
| Licencia | MIT (Copyright 2026 Chan Zuckerberg Biohub, Inc.) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna en la información proporcionada. La model card original remite al paper "Language Modeling Materializes a World Model of Protein Biology" (bioRxiv, 2026) y al repositorio `github.com/Biohub/esm` para los detalles. Por la denominación de la familia (ESM, Evolutionary Scale Modeling) y por la descripción del modelo, se trata de un sistema de predicción de estructura proteica que puede operar en dos regímenes: predicción condicionada por secuencia única y predicción condicionada por MSA, este último orientado a mejorar la precisión en dianas difíciles. El modelo predice estructuras "all-atom" de alta resolución, es decir, no solo la cadena principal sino también las cadenas laterales de los residuos.

Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO (poco probables en un modelo biológico de este tipo). No se documentan innovaciones como decodificación especulativa o atención lineal. Cualquier afirmación adicional sobre el entrenamiento requeriría consultar el paper y el repositorio de código citados.

## Capacidades

- Predicción de estructura 3D de proteínas a resolución atómica a partir de la secuencia de aminoácidos.
- Predicción "all-atom": incluye cadena principal y cadenas laterales, no solo el esqueleto proteico.
- Dos modos de inferencia: condicionado por secuencia única y condicionado por MSA (alineamiento múltiple de secuencias).
- Mejora de precisión declarada en dianas difíciles cuando se usa el modo MSA.
- Etiquetado como modelo de biología/plegamiento proteico; no está orientado a generación de texto, código ni matemáticas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo "thinking".
- Capacidades multilingües no aplicables en el sentido habitual: la entrada es una secuencia proteica, no texto en lenguaje natural.

## Casos de uso

- Anotación estructural de proteínas sin estructura experimental: dado que el modelo predice estructura a partir de secuencia, se puede usar para anotar proteomas o conjuntos de secuencias huérfanas de estructura resuelta por PDB, priorizando candidatos para cristalografía o crio-EM.
- Plegamiento de dianas difíciles con MSA: en casos donde la predicción por secuencia única falla, el modo condicionado por MSA permite incorporar información evolutiva y mejorar la precisión, útil en el diseño de fármacos sobre dianas de membrana o proteínas con homólogos remotos.
- Análisis de variantes y mutaciones: comparar estructuras predichas de una proteína wild-type frente a variantes para estudiar el impacto estructural de mutaciones en contextos de genómica clínica o investigación básica.
- Diseño de proteínas y protein engineering: usar las estructuras predichas como punto de partida para modelar sitios activos, interfaces de unión o epítopos antes de experimentos de laboratorio.
- Docencia y formación en biología estructural: generar modelos 3D de proteínas para materiales didácticos o prácticas, dado el bajo coste computacional relativo de un modelo de ~179 M de parámetros.
- Reproducibilidad de investigación: al ser un espejo con hashes verificables, sirve para reproducir exactamente los resultados del paper de ESMFold2 en entornos donde el repositorio original pueda cambiar o desaparecer.
- Integración en pipelines bioinformáticos: al ser safetensors y licencia MIT, puede incorporarse en flujos automatizados de análisis estructural junto con herramientas de visualización (PyMOL, ChimeraX) o métricas de calidad (pLDDT, TM-score).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas (pLDDT, TM-score, GDT-TS, lDDT u otras) ni comparaciones numéricas con modelos previos. Para datos de evaluación debe consultarse el paper "Language Modeling Materializes a World Model of Protein Biology" (bioRxiv, 2026) y el repositorio `github.com/Biohub/esm`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 179,3 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,72 GB; en fp16/bf16, unos 0,36 GB. El consumo real de VRAM depende de la longitud de la secuencia y del modo (secuencia única vs. MSA), que puede incrementar notablemente el uso de memoria.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es ligero y debería caber en GPUs de consumo con suficiente memoria; sin embargo, no se confirma compatibilidad ni requisitos mínimos.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, pero no está confirmado en la documentación disponible; debe validarse empíricamente.
- Opciones de despliegue: no documentadas. El repositorio de código `github.com/Biohub/esm` es la referencia para el código de inferencia; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no directamente aplicables a este modelo biológico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, la familia ESMFold2 se sitúa en el ecosistema de predicción de estructura proteica junto a AlphaFold (DeepMind) y RoseTTAFold (Baker Lab), pero no se aportan parámetros, contexto ni métricas de estos modelos en la documentación disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ESMFold2-Experimental-Fast (este) | 179.303.900 | no disponible | MIT | Hugging Face (espejo y original) |
| biohub/ESMFold2 | no disponible | no disponible | no disponible | Hugging Face |
| AlphaFold (DeepMind) | no disponible | no disponible | no disponible | no disponible |
| RoseTTAFold (Baker Lab) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental: la propia model card indica que las versiones "Experimental" se publican para reproducibilidad del paper y que para trabajo de investigación debe usarse `biohub/ESMFold2`.
- Es un espejo no oficial: aunque los hashes SHA-256 permiten verificar la integridad, el mantenimiento y las actualizaciones dependen del autor del espejo, no de CZI Biohub.
- Sesgos conocidos: no documentados en la información disponible; en modelos de plegamiento, los sesgos suelen derivarse de la distribución del PDB y de las MSA de entrenamiento, pero no se confirma.
- Riesgo de alucinación estructural: no documentado explícitamente; en predicción de estructuras, la confianza por residuo (pLDDT) es la métrica habitual para detectar regiones poco fiables, pero no se aportan detalles.
- Limitaciones de contexto o idioma: la ventana de contexto no está especificada; el campo de idioma "en" es un metadato heredado y no refleja el uso real (secuencias proteicas).
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero se recomienda revisar `LICENSE.md` y las condiciones del modelo original y del código asociado.
- Caveat para producción: al ser experimental y sin benchmarks publicados en la información disponible, no se recomienda su uso en producción sin una validación previa contra el modelo estable y contra estructuras experimentales.
- Fecha de creación del repositorio (2026-11-20) y metadatos: verificar que el commit original referenciado sigue disponible.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/bviggiano/ESMFold2-Experimental-Fast
- Modelo original: https://huggingface.co/biohub/ESMFold2-Experimental-Fast
- Commit original: https://huggingface.co/biohub/ESMFold2-Experimental-Fast/tree/ef1fbacdd089429397f09a2b7d9799197bc901f8
- Modelo estable recomendado: https://huggingface.co/biohub/ESMFold2
- Código: https://github.com/Biohub/esm
- Licencia del código: https://github.com/Biohub/esm/blob/main/LICENSE.md
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.06.03.729735
- PDF del paper: https://biohub.ai/papers/esm_protein.pdf
