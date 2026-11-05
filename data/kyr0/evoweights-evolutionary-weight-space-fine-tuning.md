# kyr0/evoweights-evolutionary-weight-space-fine-tuning

## Resumen

EvoWeights es un proyecto de investigación publicado por el usuario independiente kyr0 en HuggingFace bajo el identificador `kyr0/evoweights-evolutionary-weight-space-fine-tuning`. No se trata de un modelo de lenguaje en el sentido convencional, sino de un artefacto experimental que combina un checkpoint empaquetado de pesos de cuatro bits (denominado "Kumo Small", atribuido a NVIDIA en la model card) con herramientas de parcheo de pesos, un entrenador evolutivo y un entorno de evaluación basado en el videojuego DOOM mediante ViZDoom. El repositorio ocupa 0,5 GB e incluye el checkpoint nativo de 15,26 MB, sondas de modelo, utilidades de parcheo, el experimento original en ViZDoom, runtimes de navegador y fixtures de verificación.

El núcleo técnico del proyecto es el protocolo EDNO (Evolutionary Direct Neural Optimization, versión 7), un método de optimización evolutiva que opera directamente sobre el espacio de pesos del modelo en lugar de sobre prompts o adaptadores. Cada generación evalúa 48 direcciones de parámetros espejadas, compite contra el padre en semillas compartidas y solo promueve un hijo cuando las semillas frescas confirman la mejora con dos errores estándar de margen. El proyecto también documenta resultados adversos, como que las promociones basadas en seis semillas resultaron ser ruido estadístico y que ninguna modificación individual de código mejora de forma medible el compuesto distribuido.

La relevancia del proyecto es metodológica más que de producto: propone un flujo de trabajo en el que un agente de código (Codex o Claude Code) edita pesos firmados de cuatro bits, verifica el cambio sobre una traza congelada y observa el efecto en un juego de DOOM en vivo. Es un banco de pruebas para estudiar la atribución de cambios en el espacio de pesos, la significancia estadística de las promociones evolutivas y la reproducibilidad de experimentos de ajuste fino sin gradientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura de "Kumo Small"; el proyecto se centra en el espacio de pesos, no en la topología) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos de cuatro bits (W4) empaquetados y firmados; se menciona también un modelo original en FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint nativo empaquetado de 15,26 MB; snapshots completos de pesos importables ("Laden"); exportación de diferencias ("Diff") con recibo de promoción |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base "Kumo Small" (número de capas, dimensión oculta, mecanismo de atención o tipo de transformer). Lo que sí se documenta con detalle es el procedimiento de entrenamiento: EDNO (Evolutionary Direct Neural Optimization, protocolo 7), un método evolutivo sin gradientes que opera directamente sobre los pesos de cuatro bits. Cada generación lanza 48 direcciones de parámetros espejadas sobre todas las líneas de evaluación, enfrenta las mejores direcciones contra el padre en semillas compartidas y aplica una operación de cruce ("Kreuzen") que fusiona los finalistas. Un hijo solo se conserva si las semillas frescas lo confirman con dos errores estándar de margen, si el objetivo secundario (muertes bajo prioridad de supervivencia) no empeora de forma significativa y si ningún ancestro de la línea lo supera.

El proyecto incorpora un protocolo de validación escalonado: las episodios de validación comienzan en un minuto y crecen un minuto cada vez que la mayoría de una generación sobrevive al límite. La evaluación se realiza sobre 48 semillas de referencia fijas de hasta diez minutos, lo que permite comparar totales entre líneas y encadenar resultados a lo largo de cada linaje. El protocolo 6 exige que una promoción supere al padre por dos errores estándar en 32 semillas, y las herramientas `tools/scan-live-es.mjs` y `tools/eval-live-es.mjs` miden cada cambio individual de parámetro y verifican ejecuciones en semillas retenidas. Los resultados reportados indican que EDNO mejoró la base W4 neutra entre 2,7 y 3,2 veces en supervivencia en tres de tres semillas de búsqueda, y encontró un hijo que superó al compuesto distribuido en un 21 % (t = 3,8), atribuido a 43 cambios en la lectura de combate.

## Capacidades

- Control de agente en un entorno de DOOM mediante ViZDoom: el modelo recibe observaciones del juego y emite acciones de movimiento y ataque.
- Edición de pesos de cuatro bits firmados mediante agentes de código (Codex, Claude Code) con verificación sobre una traza congelada.
- Entrenamiento evolutivo local con paralelización por CPU lógica ("Parallele Lernspiele"), con visualización de las partidas de entrenamiento en el lienzo de la arena.
- Selección de revisiones persistentes: reproducción o descarga del modelo FP32 original, la política W4 distribuida o cualquier revisión guardada.
- Importación de snapshots completos de pesos compatibles ("Laden") y exportación de diferencias con recibo de promoción ("Diff").
- Explorador de pesos ("Explore") que muestra qué pesos cambiaron respecto al padre directo, con base conmutable entre revisiones.
- Medición de causas ("Ursachen messen"): juegos de knock-out y knock-in sobre 24 semillas fijas para atribuir qué grupo de cambios explica la diferencia de una revisión.
- Modo de juego manual ("Play yourself") con control por teclado (flechas o WASD, Space/Alt/Ctrl para atacar).
- Métricas de utilidad más allá de la supervivencia: salud, muertes, precisión, balas por muerte, frecuencia de caída de salud, muertes por minuto y proporción de tiempo con un enemigo a la vista.
- Conmutación entre objetivos de entrenamiento: supervivencia primero o muertes primero ("Wichtigstes Ziel").
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo en el sentido de un LLM convencional.

## Casos de uso

- Investigación en optimización evolutiva de pesos: el proyecto sirve como banco de pruebas reproducible para estudiar si las promociones evolutivas sobreviven a la validación en semillas retenidas, con protocolos documentados de 6, 32 y 48 semillas y herramientas de medición de significancia estadística.
- Estudio de atribución de cambios en el espacio de pesos: la función "Ursachen messen" permite aislar qué grupo de cambios explica una mejora mediante knock-out y knock-in sobre 24 semillas fijas, útil para investigar interpretabilidad y edición de modelos.
- Evaluación de agentes de código sobre pesos de modelos: el flujo de edición con Codex o Claude Code y verificación sobre traza congelada permite medir la fiabilidad de agentes automáticos al modificar parámetros de un modelo real.
- Docencia y divulgación de métodos sin gradientes: la arena en vivo, la presentación interactiva y el paper permiten mostrar de forma visual cómo evoluciona una política de control de DOOM generación a generación.
- Benchmarking de runtimes JavaScript: el experimento de Bun y Node con 2.048 mediciones de tiempo (`bun experiments/v06/runtime/bench/play.mjs docs 2 9000 32`) sirve para comparar el rendimiento de Bun Workers frente a Node en cargas de simulación.
- Pruebas de reproducibilidad de experimentos de RL: las fixtures de verificación y las semillas de referencia fijas permiten replicar resultados y detectar promociones espurias, como documenta el proyecto al señalar que las promociones de seis semillas eran ruido.
- Prototipado de controladores ligeros para entornos simulados: el checkpoint de 15,26 MB y los runtimes de navegador permiten desplegar el agente en un navegador sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en el formato habitual (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos resultados cuantitativos documentados son métricas internas del entorno DOOM:

| Metrica | Resultado reportado |
|---|---|
| Mejora de EDNO sobre la base W4 neutra (supervivencia) | ×2,7–3,2 en 3 de 3 semillas de búsqueda (48 semillas retenidas) |
| Hijo EDNO W4 · R1 frente al compuesto distribuido | +21 % de supervivencia (t = 3,8) |
| Cambios responsables de la mejora de R1 | 43 cambios en la lectura de combate |
| Promociones con 6 semillas | identificadas como ruido de semilla |
| Cambios individuales de código sobre el compuesto distribuido | ninguno mejora de forma medible |
| Mejora del compuesto distribuido | sin mejora medible |

## Requisitos de hardware

- El checkpoint nativo empaquetado ocupa 15,26 MB, por lo que la inferencia del agente de DOOM cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- El repositorio completo ocupa 0,5 GB, incluyendo runtimes de navegador, fixtures y herramientas.
- El entrenador evolutivo paraleliza una línea de evaluación por CPU lógica ("Parallele Lernspiele"), por lo que el requisito principal es número de núcleos de CPU, no VRAM.
- Existen runtimes de navegador, lo que permite ejecutar el modelo y el juego sin GPU dedicada.
- Se documenta un experimento con Bun Workers (`bun experiments/v06/runtime/bench/play.mjs docs 2 9000 32`) y 2.048 mediciones de tiempo para comparar Bun y Node.
- No se especifican GPU recomendadas (A100, H100, RTX 4090) ni estimaciones de latencia o throughput en la información disponible.
- Opciones de despliegue documentadas: portal web (`docs/index.html`), arena interactiva, presentación interactiva y paper; no se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (optimización evolutiva de pesos aplicada a control de agentes en ViZDoom), ni datos de parámetros, contexto o rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no describe la arquitectura, el número de parámetros, el contexto ni los idiomas del modelo base "Kumo Small", por lo que no es posible evaluar su calidad como modelo de lenguaje.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- El proyecto documenta explícitamente resultados adversos: las promociones con seis semillas resultaron ser ruido estadístico y ningún cambio individual de código mejora de forma medible el compuesto distribuido.
- El compuesto distribuido ("shipped composite") no mejoró de forma medible según la propia model card, lo que limita las afirmaciones de rendimiento del artefacto publicado.
- El ámbito de evaluación es un único entorno (DOOM mediante ViZDoom) con semillas fijas, por lo que la generalización a otros dominios no está demostrada.
- El modelo está empaquetado en cuatro bits y firmado; la edición de pesos requiere herramientas específicas y verificación sobre traza congelada, lo que añade complejidad operativa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción externa ni validación por terceros.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas en el sentido de un LLM, porque el artefacto no se presenta como tal.
- La fecha de creación indicada (2026-11-05) es posterior a la fecha habitual de consulta, lo que conviene verificar antes de citar el recurso.

## Enlaces

- HuggingFace: https://huggingface.co/kyr0/evoweights-evolutionary-weight-space-fine-tuning
- Policy Lab en vivo: https://agm-doom-policy-lab.fluctura.chatgpt.site
- Portal: docs/index.html
- Presentación interactiva: docs/presentation.html
- Paper: docs/paper.html
- Protocolo EDNO v0.9: experiments/v09/edno/README.md
- Protocolo lane-parallel v0.9: experiments/v09/live-es/README.md
- Protocolo y recibos v0.8: experiments/v08/README.md
- Practice Lab retirado (v0.7): experiments/v09/retired/practice-lab/README.md
- Protocolo de práctica v0.7: experiments/v07/README.md
- Experimento de runtimes Bun y Node: experiments/v06/runtime/README.md
