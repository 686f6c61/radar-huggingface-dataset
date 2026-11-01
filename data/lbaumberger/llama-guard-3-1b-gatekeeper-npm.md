# lbaumberger/Llama-Guard-3-1B-Gatekeeper-npm

## Resumen

Llama-Guard-3-1B-Gatekeeper-npm es un adaptador LoRA con cabeza de clasificación que convierte el modelo Meta Llama Guard 3 1B en un clasificador binario de paquetes npm maliciosos. Lo desarrolla el autor independiente lbaumberger (usuario de HuggingFace, repositorio GitHub lb2002/gatekeeper) en el contexto del Meta Global AI Developer Hackathon celebrado entre el 26 de octubre y el 4 de noviembre de 2026. El modelo no genera texto libre: consume un *evidence bundle* (extractos numerados de scripts de instalación y código del paquete, sin ejecutarlos) y devuelve la probabilidad de que el paquete sea malicioso.

El problema que aborda es concreto: la detección de malware en la cadena de suministro de npm, donde los ataques de *typosquatting*, *dependency confusion* y scripts de post-instalación maliciosos son frecuentes. El adaptador actúa como prefiltro barato delante de modelos de juicio más grandes (Muse Spark Open y Muse Glimmer), de modo que solo los paquetes con puntuación superior al umbral pasan a una segunda fase de evaluación. Sus flags nunca se reportan de forma aislada: requieren un veredicto de Muse o revisión humana.

La relevancia técnica está en el enfoque de reutilizar un modelo de seguridad ya alineado (Llama Guard 3 1B, 1.000 millones de parámetros) mediante PEFT en lugar de entrenar un clasificador desde cero, y en el cuidado puesto en la construcción del conjunto negativo: la versión 1 aprendió la correlación espuria "paquete poco pulido = malicioso" y marcaba el 37% de las publicaciones reales de npm. La versión 2 corrige esto usando publicaciones reales de npm como clase benigna. El repositorio ocupa 0,1 GB y tiene 12 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama Guard 3 1B) con adaptador LoRA y cabeza de clasificación añadida |
| Parametros totales | 1.000 millones en el modelo base (no disponible el recuento exacto del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrenamiento (máximo declarado en la model card); el modelo base soporta más, no especificado aquí |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización del base depende del runtime) |
| Idiomas soportados | No disponible (la tarea es clasificación de código, no generación multilingüe) |
| Licencia | Llama 3.2 Community License, sujeta a la Llama 3.2 Acceptable Use Policy |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base meta-llama/Llama-Guard-3-1B |

## Arquitectura y entrenamiento

El modelo parte de Llama Guard 3 1B, un transformer decoder-only de Meta diseñado para clasificación de seguridad de contenido. Sobre él se aplica un adaptador LoRA con r=16 y alpha=32 en todas las proyecciones de atención y MLP, más una cabeza de clasificación entrenada de forma conjunta. El entrenamiento usó 2 épocas con learning rate 2e-4 y una longitud máxima de 2.048 tokens. La entrada es un *evidence bundle* de como máximo unos 8.000 caracteres con extractos seleccionados de scripts de instalación y código, que nunca se ejecutan.

Los datos provienen del dataset DataDog malicious-software-packages (parte npm, licencia Apache-2.0) para la clase maliciosa, y de publicaciones reales de npm (no solo paquetes populares) para la benigna, con deduplicación de clústeres de campaña. Se aplicó una partición temporal: entrenamiento con muestras descubiertas hasta mayo de 2026, validación con un 10% reservado del periodo de entrenamiento y test único con muestras descubiertas a partir de julio de 2026, dejando junio como hueco de separación. Las etiquetas son exclusivamente ground truth: no se usaron salidas de Muse Spark ni de ningún otro modelo como objetivos de entrenamiento. La innovación destacable no es arquitectónica sino metodológica: la corrección del sesgo de selección en los negativos entre v1 y v2.

## Capacidades

- Clasificación binaria de paquetes npm como maliciosos o benignos mediante una puntuación de riesgo continua.
- Análisis de scripts de instalación (preinstall, install, postinstall) y extractos de código sin ejecución.
- Detección de patrones de cadena de suministro: typosquatting, dependency confusion, exfiltración en post-instalación.
- Integración como prefiltro en un pipeline por lotes sobre todas las versiones npm que superan reglas heurísticas y un clasificador TF-IDF.
- Umbral configurable: 0,02 para el monitor en vivo (≈5% de falsos positivos sobre npm real) y 0,103 como umbral de validación almacenado en threshold.json.
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto libre; su única salida es una probabilidad.

## Casos de uso

- Monitorización continua de npm en producción: el modelo se ejecuta por lotes sobre cada versión publicada que supera el filtro de reglas, con un umbral laxo (0,02) que deja pasar aproximadamente el 5% del tráfico real y deriva las alertas a modelos de juicio o a revisión humana.
- Prefiltro económico delante de modelos grandes: al ser un modelo de 1B, reduce el coste de inferencia frente a evaluar cada paquete con Muse Spark Open (juicio) o Muse Glimmer (local), reservando los modelos caros para los candidatos ya señalados.
- Triaje en respuesta a incidentes de cadena de suministro: ante la sospecha de un paquete comprometido, el modelo puntúa versiones históricas y ayuda a priorizar qué releases inspeccionar manualmente.
- Auditoría de dependencias en CI/CD: integrado en el pipeline de build, puntúa las dependencias nuevas o actualizadas antes de permitir su instalación en entornos internos.
- Investigación de campañas: agrupando las puntuaciones altas por autor, nombre o fecha de publicación se pueden identificar patrones de campañas coordinadas de paquetes maliciosos.
- Filtrado en espejos y registros privados: al desplegar un proxy o mirror de npm, el modelo puede marcar paquetes sospechosos antes de replicarlos en la infraestructura interna.
- Generación de datasets de entrenamiento: las puntuaciones sirven para priorizar muestras candidatas en la construcción de conjuntos etiquetados de malware npm.

## Benchmarks y rendimiento

Resultados en el conjunto de test con partición temporal (212 muestras maliciosas, 590 benignas, incluidas 71 negativas difíciles con scripts de instalación):

| Metrica | Valor |
|---|---|
| PR-AUC (IC 95%) | 0,86 (0,82-0,89) |
| Recall con 1% de falsos positivos | 61% |
| Falsos positivos sobre releases npm en vivo no vistas (umbral 0,3) | 1,2% |
| Falsos positivos sobre el flujo del monitor (umbral 0,3) | 0,2% |
| Recall con ≈5% de falsos positivos en vivo (umbral 0,02) | 70% |

Comparación interna declarada por el autor: la versión v1, entrenada con paquetes populares como clase benigna, alcanzó 0,97 de PR-AUC offline pero marcaba el 37% de las publicaciones reales de npm. Los modelos Muse en zero-shot obtienen PR-AUC de 0,87-0,88, ligeramente superior a este adaptador, que está pensado como prefiltro rápido y no como clasificador final.

## Requisitos de hardware

- VRAM estimada: en fp16, el modelo base de 1B ocupa aproximadamente 2 GB de pesos más el adaptador LoRA (muy pequeño); con overhead de activaciones y contexto de 2.048 tokens, el consumo se sitúa en torno a 3-4 GB. En cuantización de 8 bits baja a unos 1,5-2 GB; en 4 bits, a alrededor de 1 GB (estimaciones a partir del tamaño del modelo, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3060, RTX 4060, T4). Para lotes grandes en el monitor en vivo, una A10G, L4 o RTX 4090 ofrecen mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también puede ejecutarse en CPU (el código de ejemplo admite device="cpu"), a costa de mayor latencia.
- Opciones de despliegue: la librería PEFT con PyTorch es la vía documentada (LlamaGuardScorer del repositorio Gatekeeper). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | PR-AUC | Licencia |
|---|---|---|---|---|---|
| Llama-Guard-3-1B-Gatekeeper-npm | 1B (base) + LoRA | 2.048 tokens de entrenamiento | Clasificación de malware npm | 0,86 | Llama 3.2 Community |
| Muse Spark Open | No disponible | No disponible | Juicio de seguridad (zero-shot) | 0,87-0,88 | No disponible |
| Muse Glimmer | No disponible | No disponible | Juicio de seguridad local | No disponible | No disponible |
| Llama Guard 3 1B (base) | 1B | No disponible | Clasificación de contenido dañino genérico | No disponible para malware npm | Llama 3.2 Community |

Los modelos Muse superan ligeramente al adaptador en PR-AUC, pero el adaptador está diseñado como prefiltro barato y no como sustituto. Frente a Llama Guard 3 1B sin ajustar, la diferencia es de dominio: el base clasifica contenido dañino genérico, no malware en paquetes npm.

## Limitaciones y advertencias

- Solo ve el *evidence bundle* (máximo aproximado de 8.000 caracteres de extractos seleccionados): payloads en binarios nativos, dependencias o ficheros que superan el límite de lectura son invisibles para el modelo.
- Solo cubre npm; no es aplicable a PyPI, crates.io, Maven u otros ecosistemas sin reentrenamiento.
- Las puntuaciones no son probabilidades calibradas; el umbral debe ajustarse al contexto de despliegue (0,02 en el monitor, 0,103 en validación, 0,3 para falsos positivos bajos).
- Una puntuación alta es motivo para investigar, no prueba de malicia: el autor insiste en que los flags requieren veredicto de Muse o revisión humana.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto libre), pero sí de falsos positivos y negativos, con 1,2% de falsos positivos sobre releases en vivo al umbral 0,3 y 61% de recall al 1% de FPR.
- La partición temporal deja junio de 2026 como hueco; el rendimiento sobre campañas posteriores a julio de 2026 no está evaluado.
- Licencia Llama 3.2 Community: uso comercial permitido con restricciones (atribución "Built with Llama", límite de 700 millones de usuarios mensuales para licenciatarios, cumplimiento de la Acceptable Use Policy). Revisar los términos antes de integrar en producto.
- Solo 12 descargas y 0 likes en el momento de la consulta: proyecto de hackathon, sin validación externa independiente.

## Enlaces

- HuggingFace: https://huggingface.co/lbaumberger/Llama-Guard-3-1B-Gatekeeper-npm
- Repositorio Gatekeeper: https://github.com/lb2002/gatekeeper
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-1B
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/
- Dataset DataDog malicious-software-packages: no disponible enlace directo en la información proporcionada
