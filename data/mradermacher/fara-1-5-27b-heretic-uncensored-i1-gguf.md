# mradermacher/Fara-1.5-27B-Heretic-Uncensored-i1-GGUF

## Resumen

Fara-1.5-27B-Heretic-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo Fara-1.5-27B-Heretic-Uncensored, publicado por el usuario mradermacher. Se trata de una version "abliterated" o "decensored" del modelo Fara-1.5 de Microsoft, orientado a tareas de computer-use (CUA) y automatizacion de navegador, con capacidades de vision-lenguaje. El modelo base pesa aproximadamente 26.900 millones de parametros (26,9 B) y esta disenado para actuar como agente multimodal capaz de interpretar capturas de pantalla y ejecutar acciones sobre interfaces web.

La relevancia de esta ficha radica en que combina dos elementos poco habituales: por un lado, un modelo especializado en agentes de navegador convision (magentic, browser-automation) y, por otro, una variante "uncensored" que elimina total o parcialmente los mecanismos de rechazo del modelo original. El resultado es un modelo de 27 B con licencia MIT, cuantizado con tecnicas imatrix para reducir el peso manteniendo la calidad, y distribuido en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) para facilitar su despliegue en hardware de consumo.

La cuantizacion la firma mradermacher, conocido por producir quants GGUF de alta calidad con matrices de importancia (imatrix) ponderadas. El repositorio ocupa 50,9 GB en total e incluye los archivos GGUF de distintos tamanos, ademas del archivo imatrix. El modelo esta etiquetado unicamente para ingles y su uso previsto son tareas de agente web y computer-use, no conversacion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); arquitectura concreta del modelo base no disponible en la informacion proporcionada |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (quants ponderados con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza multimodal (vision-lenguaje) y su orientacion a computer-use. El modelo original Fara-1.5 de Microsoft esta disenado para interpretar pantallas y ejecutar acciones de raton y teclado en entornos de escritorio y navegador, lo que implica un encoder visual acoplado a un modelo de lenguaje. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La variante "Heretic-Uncensored" procede de lmcfarlin y aplica tecnicas de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) sobre el modelo Fara-1.5, lo que reduce la tendencia del modelo a negarse a responder. La cuantizacion de mradermacher utiliza matrices de importancia (imatrix) ponderadas, un metodo que asigna precision de forma no uniforme segun la relevancia de cada tensor, mejorando la calidad respecto a cuantizaciones estaticas del mismo tamano. Se ofrecen tanto quants IQ (importancia) como K-quants clasicos.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multimodal: interpretacion de capturas de pantalla e imagenes de interfaz.
- Computer-use (CUA): ejecucion de acciones sobre entornos de escritorio y aplicaciones.
- Automatizacion de navegador (browser-automation): navegacion web guiada por agente.
- Capacidades de agente web multi-paso (magentic).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque es coherente con su orientacion a agentes.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo "uncensored": menor probabilidad de rechazo ante peticiones que el modelo original rechazaria.

## Casos de uso

- Automatizacion de tareas de navegador: el modelo puede interpretar la captura de pantalla de una pagina web y decidir el siguiente clic o campo a rellenar, integrandose en pipelines de RPA web. Su naturaleza vision-lenguaje lo hace adecuado para entornos donde el DOM no es accesible.
- Testing de interfaces de usuario: un agente basado en este modelo puede recorrer flujos de una aplicacion, detectar elementos visuales y verificar que las acciones producen el resultado esperado, reduciendo el trabajo manual en pruebas de regresion.
- Extraccion de datos de pantallas: dado que procesa imagenes de interfaz, puede transcribir y estructurar informacion mostrada en aplicaciones legacy sin API, como ERPs o sistemas de escritorio.
- Agente de asistencia en escritorio: con capacidad CUA, puede ejecutar secuencias de acciones (abrir aplicaciones, mover archivos, rellenar formularios) guiado por instrucciones en lenguaje natural.
- Investigacion sobre alineacion y seguridad: al ser una variante "abliterated", sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo y evaluar riesgos de desalineacion en agentes autonomos.
- Entornos de investigacion sin restricciones de contenido: util para experimentos academicos donde se necesita que el modelo no bloquee peticiones relacionadas con contenido sensible, siempre bajo supervision y con fines legitimos.
- Despliegue en hardware de consumo: gracias a las cuantizaciones IQ1 a Q6, puede ejecutarse en estaciones de trabajo con GPU de gama alta o incluso en CPU con llama.cpp para prototipos de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Un modelo de 26,9 B en Q4_K_M ocupa aproximadamente 16-17 GB; en Q5_K_M alrededor de 19-20 GB; en Q6_K cerca de 22-23 GB; en Q8 no disponible en este repositorio. Las cuantizaciones IQ2 e IQ1 reducen el peso a 8-11 GB aproximadamente, con perdida de calidad.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB. Para cuantizaciones IQ2/IQ3, una RTX 3090 o 4080 de 16-24 GB puede ser suficiente.
- Cabe en GPU de consumo: si, en RTX 4090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con cuantizaciones IQ2 o IQ3.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con GGUF. El repositorio esta etiquetado como endpoints_compatible. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo multimodal, por lo que se recomienda llama.cpp para la inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de 27 B, el throughput en una RTX 4090 con Q4_K_M se situa tipicamente en el rango de decenas de tokens por segundo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Fara-1.5-27B-Heretic-Uncensored-i1-GGUF (este) | 26,9 B | no disponible | MIT | GGUF | Variante uncensored, vision-lenguaje, CUA |
| Fara-1.5-27B (Microsoft, original) | ~27 B | no disponible | no disponible en esta ficha | safetensors | Modelo base con mecanismos de rechazo intactos |
| Fara-1.5-27B-Heretic-Uncensored (lmcfarlin) | ~27 B | no disponible | MIT | safetensors | Version abliterated sin cuantizar |
| Cuantizaciones estaticas de mradermacher (Fara-1.5-27B-Heretic-Uncensored-GGUF) | 26,9 B | no disponible | MIT | GGUF | Misma base, sin imatrix; menor calidad en tamanos pequenos |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteration elimina o reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido danino, sesgado o ilegal. No apto para produccion sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar acciones o interpretar mal capturas de pantalla, lo que en un agente CUA puede provocar clics erroneos o acciones no deseadas.
- Solo ingles: los metadatos indican unicamente soporte de ingles; el rendimiento en castellano no esta garantizado.
- Contexto no documentado: se desconoce la longitud de contexto, lo que dificulta planificar tareas de agente de larga duracion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias; la responsabilidad del uso recae en el desplegador.
- Cuantizaciones muy bajas (IQ1, IQ2): pueden degradar notablemente la capacidad de razonamiento visual y la precision en la ejecucion de acciones.
- Modelo multimodal: requiere el archivo mmproj correspondiente, que se encuentra en el repositorio estatico, no en este; sin el, la vision no funciona.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Fara-1.5-27B-Heretic-Uncensored-i1-GGUF
- Modelo base (lmcfarlin): https://huggingface.co/lmcfarlin/Fara-1.5-27B-Heretic-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Fara-1.5-27B-Heretic-Uncensored-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Fara-1.5-27B-Heretic-Uncensored-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de calidad de quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
