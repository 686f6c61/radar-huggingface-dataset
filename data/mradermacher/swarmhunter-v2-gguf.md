# mradermacher/swarmhunter-v2-GGUF

## Resumen

Swarmhunter-v2 es un modelo de lenguaje especializado en ciberseguridad, desarrollado por UtkarshSinghShrinet, del que mradermacher ha publicado una colección de cuantizaciones estáticas en formato GGUF para su uso local. El modelo base (con 3.085.938.688 parámetros, aproximadamente 3,1 mil millones) está orientado a tareas como detección de vulnerabilidades, análisis de exploits, pruebas de penetración y resolución de retos CTF, con conocimiento específico de CVE y CWE.

Su relevancia radica en la escasez de modelos pequeños y abiertos afinados específicamente para el dominio de la seguridad ofensiva y defensiva. El entrenamiento incorpora técnicas de alineación por preferencias (DPO y RLHF, según los tags del repositorio), lo que sugiere un ajuste fino orientado a respuestas más precisas en contextos de análisis de seguridad.

Esta ficha cubre la cuantización GGUF de mradermacher, que ofrece versiones desde Q2_K (1,4 GB) hasta f16 (6,3 GB), lo que lo hace ejecutable incluso en portátiles y GPUs de consumo modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo no detallado en la documentacion) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 3,1 mil millones de parametros, entrenado sobre el dominio de la ciberseguridad. Los tags del repositorio indican el uso de DPO (Direct Preference Optimization) y RLHF durante el proceso de alineacion, tecnicas que ajustan el modelo a partir de preferencias humanas o de un modelo de referencia para mejorar la calidad de las respuestas en tareas de analisis de vulnerabilidades y explotacion.

Los detalles concretos sobre el numero de tokens de entrenamiento, la composicion del dataset (corpora de CVE, CWE, writeups de CTF, etc.), la longitud de contexto o innovaciones tecnicas especificas no estan disponibles en la documentacion proporcionada. La version de mradermacher es una cuantizacion estatica del modelo original convertida a GGUF, sin modificaciones de pesos mas alla de la reduccion de precision.

## Capacidades

- Deteccion y analisis de vulnerabilidades en codigo y sistemas (vulnerability-detection).
- Analisis de exploits y comprension de tecnicas de explotacion.
- Asistencia en pruebas de penetracion (penetration testing).
- Conocimiento de CVE y CWE para clasificacion y referencia de vulnerabilidades.
- Resolucion y asistencia en retos CTF (Capture The Flag).
- Generacion de texto conversacional (tag "conversational").
- Capacidades de tool calling, agentes o multimodalidad: no disponible.

## Casos de uso

- **Triaje de vulnerabilidades en equipos de seguridad**: el modelo puede analizar descripciones de CVE y clasificarlas segun CWE, ayudando a priorizar parcheo en entornos con gran volumen de avisos.
- **Revision de codigo orientada a seguridad**: integrado en flujos de revision, puede senalar patrones de codigo potencialmente explotables antes de llegar a produccion, funcionando offline en la maquina del desarrollador gracias a su tamano reducido.
- **Asistencia en retos CTF**: puede actuar como copiloto durante competiciones o entrenamientos, sugiriendo vectores de ataque y explicando tecnicas comunes de explotacion.
- **Preparacion de informes de pentesting**: dado su ajuste conversacional en ingles, puede redactar resumenes tecnicos de hallazgos a partir de notas del auditor.
- **Formacion en ciberseguridad**: util como tutor interactivo para explicar conceptos de explotacion, taxonomias de vulnerabilidades y metodologias de testing sin depender de servicios en la nube.
- **Analisis de malware y exploits en entornos aislados**: al poder ejecutarse localmente con llama.cpp u Ollama, es apto para laboratorios air-gapped donde no se puede enviar codigo sensible a APIs externas.
- **Automatizacion de pipelines de seguridad**: su formato GGUF permite integrarlo en scripts de CI/CD para anotaciones automaticas de riesgos en pull requests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: 1,4 GB (Q2_K) a 6,3 GB (f16); se recomienda anadir 1-2 GB adicionales para la KV cache y el runtime.
- Cabe comodamente en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o superiores ejecutan cualquier cuantizacion sin problema; incluso puede funcionar solo con CPU y RAM (se recomiendan 8 GB o mas).
- GPU dedicada no es imprescindible: al ser un modelo de ~3 B de parametros, la inferencia en CPU con llama.cpp es totalmente viable.
- Opciones de despliegue: llama.cpp, Ollama (tag oficial en el repositorio), LM Studio y cualquier runtime compatible con GGUF. No hay datos sobre vLLM o TGI para esta version cuantizada.
- Latencia y throughput: no disponibles; dada la talla del modelo, se esperan velocidades altas incluso en hardware modesto, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Formato |
|---|---|---|---|---|
| Swarmhunter-v2 | ~3,09 B | Apache 2.0 | Ciberseguridad (CVE, CWE, CTF, pentesting) | GGUF, safetensors |
| WhiteRabbitNeo (variantes ~7-13 B) | 7-13 B | no disponible | Ciberseguridad ofensiva/defensiva | GGUF, safetensors |
| SecGPT / modelos afinados en seguridad ~3 B | variable | variable | Seguridad general | variable |
| Llama 3.2 3B (generalista de referencia) | 3,2 B | Llama Community License | Uso general | GGUF, safetensors |

Swarmhunter-v2 compite en la categoria de modelos pequeños afinados para seguridad, con la ventaja de una licencia Apache 2.0 sin restricciones comerciales, frente a la licencia comunitaria de Llama. Comparado con generalistas de tamano similar, aporta conocimiento de dominio especifico a costa de capacidades generales presumiblemente menores.

## Limitaciones y advertencias

- Idioma: el modelo esta orientado al ingles; su rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no publicada: hay que verificarla empiricamente antes de usarlo con documentos largos (informes, codigo extenso).
- Riesgo de alucinacion: al ser un modelo pequeño de 3 B, puede generar CVE, CWE o detalles tecnicos incorrectos con apariencia plausible; todo resultado debe validarse con fuentes oficiales (NVD, MITRE).
- Uso dual: las capacidades ofensivas requieren un uso etico y legal responsable; el despliegue debe limitarse a entornos autorizados.
- La version de mradermacher son cuantizaciones estaticas: las cuantizaciones weighted/imatrix no estan disponibles actualmente, por lo que las versiones bajas (Q2_K, Q3_K) pueden perder calidad notable.
- Sesgos: no hay documentacion sobre sesgos del modelo; no disponible.
- Licencia: Apache 2.0 permite uso comercial sin restricciones significativas.
- El modelo base no publica model card detallada en la informacion proporcionada, lo que dificulta evaluar datos de entrenamiento y limitaciones del autor original.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/swarmhunter-v2-GGUF
- Modelo base: https://huggingface.co/UtkarshSinghShrinet/swarmhunter-v2
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#swarmhunter-v2-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, demo o repositorio de codigo del modelo base: no disponible
