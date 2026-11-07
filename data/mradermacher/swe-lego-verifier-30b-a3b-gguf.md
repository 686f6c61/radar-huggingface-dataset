# mradermacher/SWE-Lego-Verifier-30B-A3B-GGUF

## Resumen

SWE-Lego-Verifier-30B-A3B es un modelo de lenguaje orientado a la verificacion y evaluacion de soluciones de ingenieria de software, desarrollado en el marco del proyecto SWE-Lego. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 30.532.122.624 parametros totales y aproximadamente 3.000 millones de parametros activos por token (indicado por el sufijo A3B), lo que lo situa en la categoria de modelos eficientes en inferencia pese a su tamano total.

La version aqui descrita es una cuantizacion GGUF publicada por mradermacher a partir del modelo base Lego-X/SWE-Lego-Verifier-30B-A3B, lo que permite su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo esta especializado en tareas de verificacion dentro de pipelines agénticos de resolucion de problemas de software, y forma parte del ecosistema SWE-Lego, que incluye un dataset de 32.000 instancias de tarea y 18.000 trayectorias validadas.

Su relevancia actual radica en la creciente demanda de modelos "verifier" o "reviewer" que actuen como segunda opinion automatizada sobre parches de codigo generados por otros modelos, un patron cada vez mas comun en flujos de trabajo agénticos sobre repositorios reales. La licencia Apache 2.0 facilita su adopcion comercial, aunque la informacion publica disponible sobre el modelo base es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; numero de expertos y capas no disponible |
| Parametros totales | 30.532.122.624 |
| Parametros activos | aproximadamente 3.000 millones (sufijo A3B); desglose exacto no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, F16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts con 30.532 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. No se dispone de informacion publica sobre el numero de expertos, el numero de capas, la dimension oculta ni el mecanismo de enrutamiento empleado.

En cuanto al entrenamiento, el modelo deriva del proyecto SWE-Lego, que combina un dataset de 32.000 instancias de tarea de alta calidad y 18.000 trayectorias validadas, mezclando datos reales y sinteticos para complementar calidad y cantidad. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por refuerzo verificable. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Verificacion de parches y soluciones de codigo: el modelo esta disenado para evaluar la correccion de propuestas de resolucion de problemas de software, presumiblemente emitiendo juicios o puntuaciones sobre trayectorias agénticas.
- Razonamiento sobre repositorios y contexto de codigo, orientado a tareas de ingenieria de software del estilo SWE-bench.
- Generacion de texto conversacional en formato chat (etiqueta `conversational`).
- Soporte de agentes y razonamiento multi-paso, segun la orientacion del ecosistema SWE-Lego al que pertenece.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integracion en plataformas de inferencia gestionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se ha confirmado soporte de tool calling, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Verificacion automatizada de parches en CI/CD: el modelo puede actuar como revisor adicional que evalúe si un parche generado por otro modelo resuelve correctamente el issue asociado antes de fusionarlo, reduciendo la carga de revision humana en repositorios grandes.
- Segunda opinion en pipelines agénticos: integrado como paso de validacion tras un agente de codificacion, permite descartar trayectorias erroneas antes de ejecutar tests costosos, aprovechando su especializacion en verificacion.
- Evaluacion de calidad de datasets de codigo: util para puntuar trayectorias sinteticas y filtrar aquellas de baja calidad antes de incorporarlas a un dataset de entrenamiento, en linea con el propio proceso de construccion de SWE-Lego.
- Revision de pull requests asistida: con un contexto de codigo adecuado, puede generar comentarios sobre la correccion logica de un cambio, sirviendo como primera pasada antes de la revision humana.
- Despliegue en entornos con GPU de consumo: gracias a las cuantizaciones GGUF (desde Q2_K de 11,4 GB), puede ejecutarse en estaciones de trabajo modestas mediante llama.cpp u Ollama, lo que facilita prototipado local de flujos de verificacion.
- Investigacion en evaluacion de agentes: como componente de referencia para estudiar el impacto de verificadores dedicados en el rendimiento de sistemas agénticos sobre SWE-bench y benchmarks similares.
- Filtrado de candidatos en generacion de codigo: dado un conjunto de N soluciones candidatas, el modelo puede ordenarlas por probabilidad de correccion antes de la ejecucion de tests, optimizando el presupuesto de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,4 GB con Q2_K, 17,6 GB con Q4_K_S; las cuantizaciones de mayor precision (Q6_K, Q8_0, F16) requieren progresivamente mas memoria, aunque los tamanos exactos no se detallan en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita; por tamano, una RTX 4090 (24 GB) permite ejecutar comodamente Q4_K_S y cuantizaciones intermedias; para Q8_0 o F16 seria necesaria una A100 o H100.
- Cabe en GPU de consumo: si, al menos en cuantizaciones Q2_K y Q4_K_S en tarjetas con 12-24 GB de VRAM.
- Opciones de despliegue: llama.cpp y herramientas derivadas (Ollama, LM Studio); el modelo base en safetensors es compatible con transformers, y la etiqueta `endpoints_compatible` sugiere soporte en plataformas de inferencia gestionada. vLLM y TGI no estan confirmados para la version GGUF.
- Latencia y throughput estimados: no disponibles. La activacion de aproximadamente 3.000 millones de parametros por token deberia reducir el coste por token frente a un modelo denso de 30B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| SWE-Lego-Verifier-30B-A3B (este) | 30,5B | ~3B | no disponible | Apache 2.0 | GGUF, safetensors |
| SWE-Review-30B-A3B (mradermacher) | no disponible | ~3B (por nombre) | no disponible | Apache 2.0 | GGUF |
| Modelo base Lego-X/SWE-Lego-Verifier-30B-A3B | 30,5B | ~3B | no disponible | Apache 2.0 | safetensors |

La informacion disponible no permite comparar rendimiento ni contexto con alternativas de otros desarrolladores; la unica comparacion posible es con el modelo base y con la variante SWE-Review del mismo ecosistema, ambos con caracteristicas tecnicas similares segun los datos disponibles.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Informacion publica escasa: no se han publicado detalles sobre contexto maximo, composicion del entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real antes de desplegarlo.
- Riesgo de alucinacion: como modelo de verificacion, puede emitir juicios erroneos sobre la correccion de un parche; no deberia sustituir a los tests automatizados ni a la revision humana en produccion.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse sobre datos de codigo y trayectorias sinteticas puede heredar sesgos de ese corpus (por ejemplo, hacia ciertos lenguajes o estilos de programacion).
- Cuantizaciones de baja precision: Q2_K y Q3 pueden degradar notablemente la calidad de un modelo especializado en verificacion, donde la precision del juicio es critica; se recomienda Q4_K_S o superior para uso serio.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Lego-X/SWE-Lego-Verifier-30B-A3B por si hubiera terminos adicionales no reflejados en la informacion disponible.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa de su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SWE-Lego-Verifier-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Lego-X/SWE-Lego-Verifier-30B-A3B
- Pagina del proyecto SWE-Lego en Hugging Face: https://huggingface.co/SWE-Lego/SWE-Lego-Verifier-30B-A3B
- Variante relacionada SWE-Review-30B-A3B-i1-GGUF: https://huggingface.co/mradermacher/SWE-Review-30B-A3B-i1-GGUF
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#SWE-Lego-Verifier-30B-A3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
