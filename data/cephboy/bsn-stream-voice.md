# Cephboy/BSN-Stream-Voice

## Resumen

BSN-Stream-Voice es una variante optimizada del asistente vocal en tiempo real BSN-Stream, publicado por el desarrollador Céphas Bessan (Cephboy) bajo el identificador `Cephboy/BSN-Stream-Voice`. El modelo se apoya en la arquitectura Moshi, el modelo de diálogo hablado full-duplex desarrollado por Kyutai, y se distribuye en un formato descrito por el autor como "optimizado / GGUF-ready", orientado a reducir la huella de memoria y mejorar el rendimiento en inferencia.

Se trata, por tanto, de un modelo de voz a voz orientado a conversación continua: la arquitectura Moshi procesa audio de entrada y genera audio de salida de forma simultánea, sin turnos rígidos de escucha y respuesta, lo que habilita diálogos con latencia baja y solapamiento natural entre interlocutores. El repositorio no especifica número de parámetros, longitud de contexto ni composición del dataset de entrenamiento de esta variante concreta.

La relevancia de esta ficha es limitada por la escasez de documentación publicada: el modelo acumula cero descargas y cero valoraciones en el momento de la consulta, la model card es muy breve (una descripción de dos líneas) y no incluye benchmarks, configuraciones de cuantización ni instrucciones de uso. Cualquier evaluación en producción debería partir de una validación empírica propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Moshi (modelo de diálogo hablado full-duplex con códec de audio neuronal Mimi); configuración concreta no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | El autor menciona formato "GGUF-ready" y "optimizado"; niveles concretos de cuantización no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (según la model card); no se detalla si se publican también pesos en safetensors |

## Arquitectura y entrenamiento

La model card indica únicamente que el modelo está "propulsado por la arquitectura Moshi" y que se distribuye en una versión "GGUF / optimizada" para mejorar el rendimiento y reducir el consumo de memoria. No se publican detalles sobre el número de capas, dimensión oculta, número de parámetros, longitud de contexto de audio, tasa de frames ni estrategia de tokenización. Tampoco se describen los datos de entrenamiento, el número de tokens o de horas de audio utilizados, ni si hubo fases de ajuste con RLHF, DPO u otras técnicas de alineación.

Como referencia de la arquitectura base (no de esta variante concreta), Moshi de Kyutai combina un transformer temporal que modela la secuencia de audio con un transformer de profundidad que predice los múltiples códigos acústicos de cada frame, apoyándose en el códec Mimi para comprimir el audio a una tasa baja de frames por segundo. Esta arquitectura es la que permite el funcionamiento full-duplex con latencia teórica baja. No hay información que confirme en qué medida BSN-Stream-Voice conserva, modifica o destila esos componentes.

## Capacidades

- Conversación de voz a voz en tiempo real, según la descripción del autor ("assistant vocal en temps réel").
- Funcionamiento full-duplex esperado por herencia de la arquitectura Moshi: entrada y salida de audio simultáneas, sin esperar al final del turno del usuario.
- Salida de audio como modalidad principal; no se documenta soporte de texto como canal de entrada o salida.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la model card está redactada en francés, pero no se declara el conjunto de idiomas soportados.
- Modo de razonamiento explícito ("thinking mode"), visión o audio más allá del diálogo hablado: no disponible.

## Casos de uso

- Atención al cliente telefónica automatizada: al ser un modelo de voz a voz con funcionamiento full-duplex, encaja en escenarios de contacto telefónico donde la respuesta debe solaparse con el habla del usuario en lugar de esperar silencios largos. Requiere validación previa porque no se documentan idiomas ni calidad de reconocimiento.
- Asistentes de voz embebidos en dispositivos con memoria limitada: el formato GGUF y la orientación a "baja huella de memoria" declarada por el autor apuntan a despliegues en hardware modesto mediante llama.cpp u otros runners compatibles con GGUF.
- Prácticas de conversación con latencia baja: útil para prototipos de tutores de idiomas o entrenadores de entrevistas donde la inmediatez de la respuesta es parte de la experiencia.
- Interfaces de voz para aplicaciones de accesibilidad: conversación continua manos libres para usuarios que dependen de interacción hablada, siempre que se valide la estabilidad del modelo en sesiones largas.
- Investigación en diálogo hablado full-duplex: como punto de partida reproducible (licencia MIT) para experimentar con variantes cuantizadas de Moshi y comparar latencia y consumo de memoria.
- Kioscos interactivos y agentes de recepción: integración en terminales con recursos limitados donde el modelo actúa como primera capa de interacción y delega en servicios externos cuando la consulta excede su alcance.
- Prototipado rápido de demos de voz: al estar en formato GGUF, permite levantar una demostración local sin infraestructura GPU de gama alta, condicionado a que el rendimiento real se mida sobre el artefacto publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de ningún tipo: ni evaluaciones de calidad de diálogo, ni tasas de error de palabra, ni medidas de latencia, ni comparaciones con el modelo base Moshi.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica el tamaño del modelo ni los niveles de cuantización incluidos.
- GPU recomendadas: no disponible por parte del autor. Si la variante conserva la escala del Moshi original (entorno a 7 000 millones de parámetros), sería necesaria una GPU con 16 GB o más de VRAM en precisión de 16 bits, o una GPU de consumo con 8-12 GB en cuantizaciones de 4 bits. Esta estimación es orientativa y no está confirmada para este repositorio.
- Compatibilidad con GPU de consumo: no confirmada. El formato GGUF sugiere que el autor busca precisamente ese escenario, pero no se especifica qué tarjetas se han probado.
- Opciones de despliegue: llama.cpp y otros runners compatibles con GGUF son las vías coherentes con el formato declarado. No se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BSN-Stream-Voice (Cephboy) | no disponible | no disponible | MIT | HuggingFace, formato GGUF | Variante optimizada de BSN-Stream sobre arquitectura Moshi; sin benchmarks publicados |
| Moshi (Kyutai) | 7 000 millones (dato público del modelo base) | no disponible en esta ficha | Apache 2.0 (según la documentación pública del proyecto) | Repositorio público de Kyutai | Modelo fundacional de diálogo hablado full-duplex; referencia directa de la arquitectura |
| Ultravox (Fixie) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Repositorio público | Familia de modelos de voz basados en LLM; categoría comparable en asistencia vocal |

La comparación cuantitativa no es posible: no se dispone de parámetros, contexto ni métricas de rendimiento de BSN-Stream-Voice. Los datos de Moshi corresponden a la documentación pública del proyecto original y pueden no coincidir con esta variante.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre parámetros, contexto, datos de entrenamiento ni proceso de alineación, lo que impide anticipar su comportamiento.
- Cero adopción verificable: el repositorio registra cero descargas y cero valoraciones, por lo que no existen señales externas de calidad ni informes de terceros.
- Riesgo de alucinación: no evaluado ni documentado. En modelos de diálogo hablado, la generación de contenido no fundamentado puede pasar desapercibida con más facilidad que en texto escrito.
- Idiomas soportados sin especificar: no se puede asumir que el modelo funcione correctamente en castellano ni en ningún otro idioma concreto sin pruebas propias.
- Posible dependencia de un modelo base con licencia distinta: aunque este repositorio declara MIT, conviene verificar las condiciones de la arquitectura y los pesos de Moshi subyacentes antes de un uso comercial, dado que la model card no detalla la procedencia de los pesos.
- Formato GGUF sin detalle de niveles: no se indica qué cuantizaciones se han publicado ni qué pérdida de calidad introducen, algo crítico en modelos de audio donde la cuantización agresiva degrada la salida acústica.
- Trazabilidad limitada: la model card está escrita en francés e incluye solo dos líneas descriptivas, sin instrucciones de instalación, ejemplos de uso ni requisitos de software.
- Sin garantías de mantenimiento: no hay información sobre actualizaciones posteriores ni sobre soporte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Cephboy/BSN-Stream-Voice
- Repositorio del modelo base Moshi (Kyutai): https://github.com/kyutai-labs/moshi
- Página del proyecto Moshi: https://moshi.chat
- Artículo del modelo base: "Moshi: a speech-text foundation model for real-time dialogue" (arXiv:2410.00037)
- No se han encontrado en la búsqueda web enlaces adicionales específicos de BSN-Stream-Voice (papers, blogs, demos o repositorios propios del autor).
