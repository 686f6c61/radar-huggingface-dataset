# drax234/smartmemory-privacy-gemma

## Resumen

SmartMemory privacy classifier es un ajuste fino del modelo instructivo Gemma 4 E2B de Google, publicado por el usuario drax234 en HuggingFace. No es un modelo conversacional de propósito general, sino un clasificador de texto de tres clases que recibe una nota corta y devuelve un objeto JSON con el formato `{"label": "SECRET|SENSITIVE|ORDINARY", "category": ..., "score": ...}`. Su función es decidir, enteramente en el dispositivo y sin conexión de red, si una nota contiene un secreto (contraseña, número de tarjeta, clave de API), información personal sensible (salud, legal, financiera, íntima, menores, ubicación) o ninguna de las dos cosas.

El modelo forma parte de la aplicación Android SmartMemory, que lo descarga desde una revisión fijada del repositorio tras el consentimiento del usuario, verifica su SHA-256 y lo ejecuta localmente con LiteRT-LM. El objetivo de producto es evitar que secretos y notas sensibles se envíen a un modelo en la nube sin que el usuario lo haya pedido explícitamente. El repositorio ocupa 3,7 GB e incluye un único artefacto de pesos en formato `.litertlm` con decodificador en int8.

Es relevante ahora por dos motivos: ilustra el patrón de "clasificador de privacidad en el borde" como filtro previo a llamadas a la nube, y muestra el uso de LiteRT-LM como runtime de despliegue en Android para derivados de Gemma. El autor declara explícitamente que se trata de un Model Derivative modificado respecto del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-E2B-it); no se detalla en la informacion proporcionada |
| Parametros totales | no disponible (el nombre del modelo base indica la variante E2B de Gemma 4; no se confirma la cifra exacta) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible; el autor indica que fue entrenado con notas cortas de hasta unos cientos de caracteres y que el texto largo se procesa por ventanas |
| Tipos de cuantizacion | int8 en el decodificador (unico artefacto publicado); no se ofrecen otras variantes |
| Idiomas soportados | Ingles y hebreo, incluido texto mixto; otros idiomas no han sido evaluados |
| Licencia | Gemma Terms of Use + Gemma Prohibited Use Policy |
| Formato de pesos | `.litertlm` (LiteRT-LM); el repositorio no publica safetensors, GGUF ni adaptadores LoRA por separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Google Gemma 4 E2B en su variante instruction-tuned, un transformer decoder-only. Sobre esa base se aplicó un adaptador LoRA que posteriormente se fusionó en los pesos, y el resultado se convirtió al formato `.litertlm` de LiteRT-LM. El autor no documenta hiperparámetros de entrenamiento, número de tokens vistos, composición exacta del dataset ni si hubo una fase de alineación adicional (RLHF/DPO) más allá del ajuste supervisado implícito en el etiquetado. No se describe ninguna innovación de atención o decodificación específica para este derivado.

Los datos de entrenamiento son exclusivamente sintéticos: aproximadamente 6.600 notas cortas en inglés, hebreo y texto mixto. Se componen de notas generadas por plantilla con valores falsos aleatorios y de notas de aspecto natural escritas por un modelo de lenguaje al que se le instruyó usar personas inventadas, dominios de ejemplo reservados y números nunca emitidos. Cada nota fue etiquetada por un segundo modelo. Los números de tarjeta pasan la validación de checksum pero nunca fueron emitidos, y las claves son cadenas aleatorias con prefijos conocidos. El autor afirma que no se utilizaron datos personales reales, datos de usuarios ni credenciales reales.

## Capacidades

- Clasificación de texto corto en tres etiquetas: `SECRET`, `SENSITIVE` u `ORDINARY`, con categoría y puntuación en un objeto JSON.
- Detección de secretos: contraseñas, números de tarjeta, claves de API y cadenas con prefijos de credenciales conocidos.
- Detección de información personal sensible en categorías declaradas: salud, legal, financiera, íntima, menores y ubicación.
- Funcionamiento totalmente offline en el dispositivo, sin llamadas de red durante la inferencia.
- Procesamiento de texto en inglés y hebreo, incluido texto mezclado de ambos idiomas en una misma nota.
- Procesamiento de notas largas mediante ventanas de análisis sobre fragmentos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento para este derivado; el ajuste lo especializa como clasificador.

## Casos de uso

- Filtro previo a la nube en la app SmartMemory: antes de enviar una nota a un asistente remoto, el clasificador decide localmente si contiene un secreto o datos sensibles y bloquea o advierte en consecuencia, de modo que el usuario no comparte credenciales de forma involuntaria.
- Detección de credenciales pegadas en notas de móvil: el modelo marca cadenas con prefijos de claves de API o números que superan el checksum de tarjeta, lo que permite avisar en el momento de guardar la nota.
- Alertas de privacidad en aplicaciones de notas y diarios personales: clasificar entradas que mencionan salud, asuntos legales o datos de menores para aplicar políticas de cifrado o de exclusión de copias de seguridad.
- Enmascarado selectivo antes de telemetría o analítica: usar la etiqueta para decidir qué fragmentos redactar antes de registrar eventos de uso, manteniendo el análisis en el dispositivo.
- Moderación de contenido en exportaciones: revisar lotes de notas cortas antes de exportarlas o compartirlas, marcando las que contienen información sensible para revisión manual.
- Filtro de entrada en pipelines de asistentes domésticos o de empresa: como primera etapa de bajo coste que descarta contenido sensible antes de invocar un modelo mayor, reduciendo exposición de datos y coste de inferencia.
- Investigación sobre clasificación de privacidad en el borde: servir como punto de partida reproducible (con datos sintéticos) para estudiar el equilibrio entre falsos negativos y falsos positivos en clasificadores de secretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta una evaluación propia sobre notas sintéticas retenidas, con la salida directa del modelo:

| Conjunto de evaluacion | Notas evaluadas | Secretos marcados (SECRET o SENSITIVE) | Notas ordinarias marcadas erroneamente |
|---|---|---|---|
| Primer conjunto de test | 1.284 | 100 % | 0,7 % |
| Conjunto escrito en un estilo distinto | 389 | 100 % | 2,5 % |
| Conjunto plantillado antiguo | 473 | 100 % | 5,2 % |

El propio autor advierte que los recuentos son pequenos, el texto es sintetico y hay una sola ejecucion de entrenamiento por receta, por lo que estos datos deben interpretarse como evidencia y no como garantia. No se reportan latencia ni throughput.

## Requisitos de hardware

- Peso del artefacto: 3,7 GB en disco para `gemma-privacy-v2.litertlm` con decodificador int8; el consumo de memoria en inferencia no se documenta, pero cabe esperar un valor del mismo orden mas el overhead del runtime (estimacion, no dato del autor).
- Diseñado para ejecución en el dispositivo (Android) mediante LiteRT-LM; el autor no publica requisitos mínimos de RAM ni de SoC.
- No está pensado para despliegue en GPU de servidor; no se proporcionan instrucciones para A100, H100 ni RTX 4090, y no hay datos de VRAM para estas plataformas.
- Opciones de despliegue soportadas: LiteRT-LM con el formato `.litertlm`. No se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, por lo que estos runtimes no son utilizables sin una conversión adicional no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| drax234/smartmemory-privacy-gemma | no disponible (base Gemma 4 E2B) | no disponible | Clasificacion JSON de secretos y datos sensibles, en ingles y hebreo | Gemma Terms / Prohibited Use | `.litertlm`, LiteRT-LM |
| google/gemma-4-E2B-it (modelo base) | no disponible en la informacion | no disponible | Modelo instructivo de proposito general | Gemma Terms / Prohibited Use | no disponible en la informacion |
| Clasificador por reglas y expresiones regulares | 0 (no neuronal) | no aplica | Deteccion de patrones de credenciales y numeros de tarjeta | Depende de la implementacion | Trivial de desplegar en cualquier runtime |
| Clasificador encoder pequeno tipo BERT ajustado | no disponible | no disponible | Clasificacion de texto corto | Depende del modelo base | Requiere conversion propia |

La comparación cuantitativa con alternativas no es posible con la información disponible: el autor no publica metricas frente a otros clasificadores, y el modelo base no incluye en esta ficha datos de contexto o parametros confirmados.

## Limitaciones y advertencias

- Es una ayuda de cribado, no una garantia de seguridad. El modelo yerra deliberadamente hacia el marcado excesivo (un pequeño porcentaje de notas ordinarias se marca como sensibles), pero puede dejar pasar un secreto, especialmente si se parece poco a sus notas de entrenamiento.
- Entrenado solo con notas cortas (hasta unos cientos de caracteres); el texto más largo se analiza por ventanas, con la perdida de contexto que ello implica entre fragmentos.
- Idiomas cubiertos: ingles y hebreo, incluido texto mixto. Cualquier otro idioma no ha sido evaluado y no hay garantia de comportamiento.
- Datos de entrenamiento exclusivamente sinteticos: el dominio cubierto son notas plantilladas y generadas, no texto real de usuarios, lo que puede producir una brecha de distribucion en produccion.
- Evaluacion limitada: entre 389 y 1.284 notas por conjunto, una sola ejecucion de entrenamiento por receta y sin validacion independiente de terceros.
- Riesgo de alucinacion en el sentido de etiquetas o categorias inconsistentes: el modelo genera JSON y no se documenta validacion estructural ni manejo de salidas malformadas.
- Sesgos conocidos: no documentados por el autor. Al ser un derivado de Gemma, hereda los sesgos del modelo base, no evaluados en esta ficha.
- Licencia: uso sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy. Los destinatarios del modelo deben recibir una copia de dichos terminos. El autor prohibe explicitamente usos de vigilancia o de extraccion de datos privados de terceros.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado: no hay evidencia de uso en produccion por terceros.
- El contenido devuelto por la busqueda web no estaba relacionado con el modelo; no se han podido verificar datos adicionales por esa via.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drax234/smartmemory-privacy-gemma
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- No se han encontrado en la busqueda web enlaces relevantes al modelo (paper, blog, repositorio o demo); los resultados devueltos no guardaban relacion con esta ficha.
