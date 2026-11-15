# linda23153/ViSeLA-CUHK-PEDES-Baseline-Router

## Resumen

ViSeLA-CUHK-PEDES-Baseline-Router es un checkpoint de ajuste fino del modelo ViSeLA (Vision-Grounded Semantic Learning and Alignment), desarrollado por el grupo Flame-Chasers y presentado en ACM Multimedia 2026. Se trata de un sistema de recuperación de personas basada en texto (text-based person retrieval): dado un descriptor textual de una persona, el modelo devuelve las imágenes de personas que mejor coinciden en una galería. El problema que resuelve es la búsqueda multimodal texto-imagen en un dominio especialmente exigente, el de la reidentificación de personas, con soporte multilingüe en inglés, chino, francés y alemán.

El checkpoint liberado es la variante "baseline-router", inicializada desde CCLM-X2VLM y entrenada sobre la partición multilingüe CUHK-PEDES(M). Combina un codificador visual BEiT-2 base, un codificador textual XLM-RoBERTa y un módulo de interacción multimodal para el reranking. El enrutamiento semántico multilingüe asigna tokens de texto a expertos según su contenido semántico, y la alineación anclada en visión emplea consultas aprendibles compartidas para emparejar señales visuales y textuales.

Es relevante ahora por dos motivos: por un lado, publica resultados de recuperación multilingüe en cuatro idiomas con R@1 medio del 76,78 % y mAP medio del 68,67 %, cifras competitivas en el benchmark CUHK-PEDES(M); por otro, el código y los pesos son reproducibles desde el repositorio oficial, aunque la licencia es de solo investigación. No es un modelo generativo de propósito general, sino un modelo de recuperación especializado, y debe evaluarse como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language con enrutamiento semántico multilingüe (router con 4 expertos) sobre BEiT-2 base + XLM-RoBERTa + interacción multimodal para reranking |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se especifica si es MoE disperso; el router usa 4 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh, fr, de |
| Licencia | research-only-upstream-terms (solo investigación; ver THIRD_PARTY_NOTICES del repositorio oficial) |
| Formato de pesos | PyTorch `.pth` (state_dict), más `config.yaml`, `config.json` y `configs/config_beit2_base.json` |
| Tamaño del repositorio | 1,8 GB |
| Inicialización | CCLM-X2VLM |
| Configuración del router | 4 expertos, 4 consultas aprendibles, `refiner.sim_type: avg`, `routing_temp: 0.85` |
| SHA256 de pesos | `3776aea5fe499d8c0365173fb73e662ae56edc2314068053f977f1506d22a079` |

## Arquitectura y entrenamiento

ViSeLA es un sistema de recuperación texto-imagen compuesto por tres bloques principales. El codificador visual es BEiT-2 en configuración base; el codificador textual es XLM-RoBERTa, lo que aporta cobertura multilingüe en los cuatro idiomas declarados. Sobre esas representaciones, un módulo de interacción multimodal realiza el reranking de candidatos. La innovación central es el enrutamiento semántico multilingüe: los tokens de texto se asignan a uno de cuatro expertos según su contenido semántico, con una temperatura de enrutamiento de 0,85. Además, la alineación anclada en visión utiliza consultas aprendibles compartidas para alinear pistas visuales y textuales correspondientes.

El checkpoint publicado corresponde a un ajuste fino sobre CUHK-PEDES(M) partiendo de CCLM-X2VLM, con similitud `avg` en el refinador. Es importante distinguirlo de la configuración completa del artículo: la Tabla 2 del paper reporta 77,94 % de R@1 medio y 70,16 % de mAP medio para ViSeLA con preentrenamiento completo en MultiPedes y similitud `lsp_max`; la fila sin preentrenamiento centrado en personas reporta 76,83 % / 68,71 %. El checkpoint liberado (76,78 % / 68,67 %) usa inicialización CCLM-X2VLM y similitud `avg`, por lo que no debe compararse directamente con las cifras del artículo sin tener en cuenta la diferencia de configuración. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de CUHK-PEDES(M) y las anotaciones de code-switching.

## Capacidades

- Recuperación texto-imagen de personas: dada una descripción textual, devuelve las imágenes de la galería ordenadas por similitud.
- Multilingüe: consultas en inglés, chino, francés y alemán sobre una misma galería.
- Enrutamiento semántico por expertos: asigna tokens a expertos según su contenido, lo que permite manejar descripciones heterogéneas.
- Alineación visión-lenguaje mediante consultas aprendibles compartidas.
- Reranking multimodal de candidatos recuperados.
- Evaluación de code-switching: el pipeline admite anotaciones de cambio de código entre idiomas.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; su salida es un ranking de imágenes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión generativa, audio o thinking mode: no disponibles.

## Casos de uso

- Búsqueda de personas en archivos de videovigilancia: el operador describe a una persona en lenguaje natural (en cualquiera de los cuatro idiomas) y el modelo devuelve los fotogramas candidatos de la galería, gracias a su recuperación texto-imagen especializada en el dominio de personas.
- Investigación forense y análisis de material audiovisual: integrado en un pipeline que indexe previamente las imágenes con BEiT-2, el modelo permite consultas descriptivas sobre grandes volúmenes de material, con reranking multimodal para reducir falsos positivos.
- Sistemas de búsqueda multilingües en plataformas de contenido: un mismo índice visual puede consultarse en inglés, chino, francés o alemán, lo que simplifica el despliegue en organizaciones con equipos en varios países.
- Evaluación comparativa de modelos de recuperación de personas: al ser un checkpoint de referencia con resultados publicados en CUHK-PEDES(M), sirve como baseline reproducible para investigar nuevas técnicas de enrutamiento o alineación.
- Análisis de moda y catálogos: las descripciones textuales de prendas y atributos físicos pueden emplearse para localizar imágenes coincidentes en catálogos, aprovechando la alineación visión-lenguaje.
- Investigación académica en reidentificación de personas: el código oficial y los pesos permiten reproducir experimentos, hacer ablaciones sobre el router y comparar configuraciones de similitud (`avg` frente a `lsp_max`).
- Moderación y revisión de contenido: localización de imágenes que coincidan con descripciones reportadas por usuarios, siempre que el despliegue respete las restricciones de licencia.

## Benchmarks y rendimiento

Resultados reportados para el checkpoint liberado en CUHK-PEDES(M):

| Idioma | R@1 (%) |
|---|---:|
| Inglés (EN) | 78,22 |
| Chino (ZH) | 76,07 |
| Francés (FR) | 76,74 |
| Alemán (DE) | 76,10 |
| Media | 76,78 |

mAP medio: 68,67 %.

Referencias del artículo (configuraciones distintas, no directamente comparables con el checkpoint liberado):

| Configuración | R@1 medio (%) | mAP medio (%) |
|---|---:|---:|
| ViSeLA con preentrenamiento completo en MultiPedes y `lsp_max` | 77,94 | 70,16 |
| ViSeLA sin preentrenamiento centrado en personas | 76,83 | 68,71 |
| Checkpoint liberado (CCLM-X2VLM, `avg`) | 76,78 | 68,67 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks generativos, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,8 GB, lo que sugiere que la inferencia en FP32 requiere del orden de varios GB, pero no se publica una cifra oficial.
- GPU recomendadas: no disponible. Por el tamaño de los codificadores (BEiT-2 base y XLM-RoBERTa base) es plausible su ejecución en GPU de gama media-alta, pero no hay datos oficiales.
- ¿Cabe en GPU de consumo? No confirmado en la documentación; depende del tamaño efectivo del checkpoint y del lote de galería.
- Opciones de despliegue: el código oficial de ViSeLA (PyTorch) con `tools/demo_retrieval.py` y `main.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de recuperación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViSeLA-CUHK-PEDES-Baseline-Router | Recuperación texto-imagen de personas | en, zh, fr, de | no disponible | Solo investigación | Pesos y código públicos |
| ViSeLA (configuración completa del paper) | Recuperación texto-imagen de personas | en, zh, fr, de | no disponible | Solo investigación | Resultados en paper; pesos según repositorio oficial |
| CCLM-X2VLM | Recuperación texto-imagen multilingüe | multilingüe | no disponible | no disponible | Usado como inicialización |
| CLIP / XLM-R basados en recuperación genérica | Recuperación texto-imagen genérica | multilingüe variable | no disponible | variable | Ampliamente disponibles |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada; las cifras del paper y del checkpoint deben manejarse por separado por diferencias de configuración.

## Limitaciones y advertencias

- Licencia de solo investigación (`research-only-upstream-terms`): el uso comercial requiere revisar los términos upstream en el archivo THIRD_PARTY_NOTICES del repositorio oficial.
- No es un modelo generativo: no admite diálogo, tool calling ni razonamiento multi-paso; usarlo fuera de tareas de recuperación producirá resultados sin sentido.
- Dominio restringido: está especializado en reidentificación de personas; su rendimiento en otros dominios visuales no está documentado.
- Riesgo de sesgo: los datasets de reidentificación de personas pueden contener sesgos demográficos, de vestimenta o de iluminación; no se documentan análisis de sesgo en la información disponible.
- Riesgo de falsos positivos: en aplicaciones de vigilancia o forense, el ranking debe revisarse humanamente; el modelo no garantiza identificación correcta.
- Cobertura lingüística limitada a en, zh, fr y de; otros idiomas no están soportados oficialmente.
- Las cifras de rendimiento corresponden a una configuración concreta (CCLM-X2VLM, similitud `avg`, temperatura 0,85); cambiar estos ajustes invalida la comparación con los resultados publicados.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas para descripciones extensas.
- Requiere el código oficial y dependencias específicas; no hay pipeline de Hugging Face (`pipeline: no disponible`), lo que complica la integración directa con `transformers`.
- El checkpoint usa rutas portables con marcadores `/path/to/…`; es necesario revisar y ajustar las rutas antes de entrenar o evaluar.

## Enlaces

- Hugging Face: https://huggingface.co/linda23153/ViSeLA-CUHK-PEDES-Baseline-Router
- Paper: https://arxiv.org/abs/2611.15328
- Paper (HTML, Tabla 2): https://arxiv.org/html/2611.15328v1#S5
- DOI ACM: https://doi.org/10.1145/3767308.3836472
- Página del proyecto: https://flame-chasers.github.io/ViSeLA/
- Código: https://github.com/Flame-Chasers/ViSeLA
- Release v1.0.0: https://github.com/Flame-Chasers/ViSeLA/releases/tag/v1.0.0
- Instrucciones de instalación: https://github.com/Flame-Chasers/ViSeLA#quick-start
- Avisos de terceros (licencia): https://github.com/Flame-Chasers/ViSeLA/blob/main/THIRD_PARTY_NOTICES.md
