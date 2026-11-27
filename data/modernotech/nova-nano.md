# ModernoTech/Nova-Nano

## Resumen

Nova Nano es un modelo de lenguaje conversacional de tipo "edge" desarrollado por Moderno Tech dentro de su familia Nova AI. Se trata de un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M, con 354.483.968 parámetros totales (aproximadamente 354 M) y un tamaño de repositorio de 0,2 GB. Su propósito declarado es llevar capacidades de IA generativa a dispositivos con recursos extremadamente limitados (teléfonos, tablets, portátiles modestos) mediante ejecución local en el navegador, reduciendo la dependencia de servidores de inferencia centralizados.

El modelo se distribuye principalmente en formato GGUF cuantizado, lo que facilita su integración con motores de inferencia ligeros compatibles con entornos de navegador y hardware de gama baja. Forma parte de una estrategia de tres niveles (Nova Nano, Nova Mini y Nova Spark) en la que el usuario selecciona el modelo adecuado según la memoria y capacidad de su dispositivo.

La relevancia actual de Nova Nano radica en su enfoque de eficiencia extrema: con menos de 400 M de parámetros y cuantización agresiva, busca ofrecer una experiencia conversacional aceptable en hardware que no puede ejecutar modelos de miles de millones de parámetros. No obstante, la información técnica pública disponible es escasa y no se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento o ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: LiquidAI/LFM2.5-350M) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF cuantizado (variantes concretas no especificadas) |
| Idiomas soportados | en, es, ar, zh, fr, de, ja, ko |
| Licencia | other (términos no detallados en la información disponible) |
| Formato de pesos | GGUF (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna de Nova Nano más allá de que deriva del modelo base LiquidAI/LFM2.5-350M. No se especifica si emplea un transformer convencional, una arquitectura híbrida, atención lineal u otro diseño. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado durante el fine-tune.

La model card se centra en la filosofía de producto (ejecución local, accesibilidad, reducción de costes de infraestructura) y en la descripción de la familia Nova AI, pero no aporta detalles técnicos sobre el proceso de entrenamiento, las innovaciones arquitectónicas ni las metodologías de alineación empleadas. Esta ausencia de información impide evaluar rigurosamente la calidad del ajuste o las técnicas de optimización aplicadas.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a un uso de asistente local.
- Soporte multilingüe declarado para ocho idiomas: inglés, español, árabe, chino, francés, alemán, japonés y coreano.
- Ejecución local en dispositivos de recursos limitados mediante motores de inferencia compatibles con GGUF.
- Integración prevista en entornos de navegador para inferencia en el dispositivo del usuario.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso.
- No se documenta soporte de visión, audio ni modos de razonamiento extendido (thinking mode).
- No se especifican capacidades de generación de código o matemáticas más allá de las heredadas del modelo base, sin datos verificables.

## Casos de uso

- Asistente conversacional en navegador: el modelo puede cargarse en la memoria del dispositivo y procesar consultas localmente, lo que permite ofrecer un chat básico sin enviar cada mensaje a un servidor central, reduciendo la dependencia de infraestructura de inferencia.
- Aplicaciones móviles de asistencia básica: con 354 M de parámetros y cuantización GGUF, puede integrarse en teléfonos y tablets para respuestas conversacionales simples, siempre que la memoria disponible y el motor de inferencia lo permitan.
- Prototipado rápido de interfaces de IA local: desarrolladores que necesiten validar una experiencia de chat sin costes de API pueden desplegar Nova Nano en local para pruebas de concepto.
- Educación y demos de IA en el dispositivo: útil para mostrar el funcionamiento de un modelo generativo ejecutándose íntegramente en hardware de gama baja, con fines divulgativos o formativos.
- Asistencia offline en entornos con conectividad limitada: cuando el sistema de descarga y almacenamiento lo permita, el modelo puede ejecutarse sin conexión para tareas conversacionales básicas.
- Filtrado o clasificación de texto ligera: aunque no se documenta explícitamente, un modelo de este tamaño puede emplearse en tareas de preprocesado o generación de respuestas cortas en pipelines de bajo coste.
- Integración en aplicaciones de escritorio modestas: portátiles y equipos sin GPU dedicada pueden ejecutar el modelo cuantizado para funcionalidades de asistencia integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 354 M de parámetros y cuantización GGUF, el modelo puede ocupar del orden de cientos de MB en memoria, aunque no se especifican las variantes de cuantización ni sus tamaños exactos.
- GPU recomendadas: no disponibles; el enfoque del modelo es la ejecución en CPU y dispositivos de gama baja, no en GPU de datacenter.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs de gama baja y en CPU, pero no se aportan datos verificables de VRAM ni de rendimiento.
- Opciones de despliegue: motores de inferencia compatibles con GGUF (por ejemplo, llama.cpp u Ollama) y motores orientados a navegador, aunque la model card no confirma integraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nova Nano | 354 M | no disponible | other | GGUF | Fine-tune de LFM2.5-350M, orientado a edge |
| LiquidAI/LFM2.5-350M | ~350 M | no disponible | no disponible | no disponible | Modelo base del que deriva Nova Nano |
| Modelos edge de <1 B (genéricos) | <1 B | variable | variable | GGUF, safetensors | Alternativas de la misma categoría; no se dispone de datos concretos para comparar rendimiento |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero un modelo de este tamaño y con datos de entrenamiento no especificados presenta riesgo de sesgos no evaluados.
- Riesgo elevado de alucinación y de respuestas inexactas debido al reducido número de parámetros y a la falta de benchmarks publicados.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones multi-turno extensas.
- El soporte multilingüe se declara para ocho idiomas, pero no se aportan evaluaciones de calidad por idioma.
- La licencia es "other" y no se detallan los términos; es imprescindible revisar las condiciones antes de un uso comercial.
- No se documentan capacidades de tool calling, agentes ni razonamiento avanzado; no debe asumirse su disponibilidad en producción.
- La ejecución en navegador depende de la memoria del dispositivo, el motor de inferencia y el soporte de hardware; no se garantiza compatibilidad universal.
- No se debe prometer privacidad absoluta ni funcionamiento offline sin verificar las condiciones reales de la plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/ModernoTech/Nova-Nano
- Sitio oficial de Moderno Tech: https://moderno.com.ar
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
