# enver/aynengine-qwen3-0.6b-mantiq

## Resumen

AynEngine-Qwen3-0.6B-Mantiq es un ajuste fino especializado del modelo denso Qwen3-0.6B, desarrollado por el autor de HuggingFace «enver» bajo la etiqueta AynEngine. El modelo está orientado al árabe clásico y a la lógica deductiva de tradición gazaliana (*Mantiq al-Burhan*), y su rasgo más distintivo es un vocabulario ampliado de 151.936 a 160.807 tokens, con 9.057 tokens de raíces árabes clásicas (`<root_XXX>`), 48 paradigmas morfológicos de *Sarf* y 33 marcadores epistémicos de *Mantiq*.

Con 605.133.824 parámetros totales (unos 605 M según los pesos en safetensors, aunque la model card cita 609 M y 590 M en distintos apartados), el modelo ocupa unos 1,2 GB en `bfloat16` y se puede cuantizar a aproximadamente 340 MB en GGUF de 4 bits. Su propuesta es el despliegue en dispositivo y en el extremo de la red: inferencia offline en móviles, routers, Raspberry Pi o nodos de mensajería P2P, con extracción de raíces morfológicas en el orden de 0,7 ms.

Es relevante ahora por dos motivos. Primero, por el nicho: no abundan los modelos pequeños con tokenizador adaptado a morfología árabe clásica y con una etapa de alineación DPO específicamente dirigida a separar pruebas válidas (*Burhan*) de falacias circulares o sofismas (*Safsatah*). Segundo, por el contexto de modelos «soberanos» y ejecutables en local sin dependencia de API. Ahora bien, el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha y no se han podido verificar sus métricas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3-0.6B, con vocabulario ampliado a 160.807 tokens |
| Parametros totales | 605.133.824 (≈605 M; la model card menciona 609 M y 590 M en distintos puntos) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen3-0.6B declara 32.768 tokens de contexto nativo, no confirmado para este ajuste fino) |
| Tipos de cuantizacion | `bfloat16` nativo; GGUF Q4_K_M (≈340 MB) mencionado por el autor; conversion con `convert_hf_to_gguf.py` |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,2 GB); convertible a GGUF |
| Libreria de inferencia | transformers (tags: text-generation-inference, endpoints_compatible) |
| Modelo base | Qwen/Qwen3-0.6B |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La base es un transformer denso Qwen3-0.6B, sobre el que se ha sustituido el tokenizador original de 151.936 tokens por uno de 160.807 (+8.871 tokens). Ese incremento se reparte en 9.057 raíces árabes clásicas extraídas de diccionarios canónicos (*Lisan al-Arab*, *Kitab al-Ayn*), 48 paradigmas morfológicos (*wazn*) y 33 marcadores epistémicos de lógica. El autor afirma que el tokenizador garantiza una decodificación «roundtrip» sin pérdida, es decir, coincidencia exacta del 100 % entre cadena original y cadena recodificada.

El entrenamiento se describe como un currículo cognitivo de dos etapas. La primera es un ajuste supervisado (SFT) sobre silogismos categóricos válidos, definiciones (*Hadd*) y pruebas lógicas correctas. La segunda es una etapa de Direct Preference Optimization (DPO) con pares contrastivos que penalizan sofismas, equivocación léxica (*Ishtirak Lafzi*) y argumentos circulares (*Dawr Batil*); el autor reporta una confianza de preferencia del 96,08 % a favor de las pruebas válidas, con un margen discriminativo de +3,2168. La model card presenta además cinco «pilares epistémicos» (al-Mufradat, Asas al-Balaghah, Lisan al-Arab, Kitab al-Ayn y Al-Kitab) como marco conceptual del diseño del razonamiento, aunque no se detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros de cada etapa.

## Capacidades

- Generación de texto conversacional en árabe y en inglés, con plantilla de chat propia de Qwen3 (`apply_chat_template`).
- Razonamiento deductivo sobre silogismos categóricos: el modelo está ajustado para validar o rechazar deducciones y clasificarlas como *Burhan* o *Safsatah*.
- Tokenización y anotación morfológica: descomposición automática de palabras árabes en raíces (`<root_كشف>`, `<root_برهن>`, `<root_نطق>`) y etiquetado por paradigma de *Sarf*.
- Extracción de raíces canónicas, con una precisión declarada del 84,21 % sobre el conjunto «Lisan clean» y 0,7 ms de latencia.
- Generación de código de alcance limitado: el autor reporta un 100 % de éxito en el parseo de AST de Python y un 100 % de Pass@1 en una única tarea de intersección de tuplas de MBPP (tarea n.º 2, saneada), un resultado demasiado acotado para extrapolarlo a código general.
- Modo de razonamiento explícito: la model card alude a las etiquetas `<think>...</think>` para forzar cadena de pensamiento en falacias circulares sutiles.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es únicamente de texto.

## Casos de uso

- Anotación morfológica de corpus árabes: el tokenizador descompone raíces y paradigmas de forma nativa, lo que permite preprocesar corpus clásicos sin una etapa externa de stemización y con garantía de roundtrip sin pérdida.
- Enseñanza de árabe clásico y de lógica aristotélica: como evaluador interactivo que recibe un silogismo escrito por el estudiante y devuelve si la deducción es válida, con explicación del marcador epistémico implicado.
- Auditoría de argumentación en textos jurídicos o religiosos: el ajuste DPO penaliza argumentos circulares y equivocación léxica, de modo que puede usarse como filtro previo para detectar sofismas en documentos largos.
- Despliegue en el extremo sin conexión: con 340 MB en GGUF Q4_K_M se ejecuta en Raspberry Pi 4/5, routers OpenWrt o Android vía Termux, apto para entornos con conectividad intermitente o requisitos de soberanía de datos.
- Preprocesado en pipelines de búsqueda y recuperación sobre textos árabes: el vocabulario de raíces sirve como índice semántico-morfológico para motores de recuperación o agrupación por familia léxica.
- Sistemas de mensajería P2P y asistentes embebidos: el autor cita nodos WyreNet y motores de voz TajweedSST como plataformas objetivo, donde el modelo puede clasificar o resumir mensajes localmente sin enviar datos a un servidor.
- Generación de utilidades de código acotadas: scripts de transformación de texto, parsers de plantillas o pequeñas funciones verificables por tests, aprovechando la integridad sintáctica de AST reportada.
- Evaluación de cadenas de razonamiento en agentes: dado que el modelo distingue premisas de conclusiones y detecta circularidad, puede actuar como verificador de bajo coste de los pasos intermedios generados por un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Dominio de evaluacion | Metrica | Resultado |
|---|---|---|
| Extraccion de raices (Sarf) | Cobertura canonica (Lisan clean) | 84,21 % de precision, 0,7 ms de latencia |
| Integridad del tokenizador | Roundtrip string equivalence | 100,0 % de coincidencia exacta |
| Preferencia Mantiq (DPO) | Margen discriminativo Burhan vs Safsatah | +3,2168 (96,08 % de confianza) |
| Integridad sintactica de codigo | Parseo de AST de Python | 100,0 % de exito |
| MBPP (Google) | Tarea de interseccion de tuplas (n.º 2 saneada) | 100,0 % Pass@1 (5,81 s) |
| Velocidad en CPU | Generacion con 16 hilos en x86_64 | 10,5–11,4 tokens/s |
| Huella de memoria | RAM activa en `bfloat16` | 1,18 GB (cuantizable a ≈340 MB) |

No se han publicado en la informacion disponible resultados en benchmarks generales de referencia (MMLU, GSM8K, HumanEval, etc.), ni comparaciones con el modelo base en las mismas condiciones. Todas las cifras de la tabla proceden del propio autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,2 GB en `bfloat16` (los pesos son 605 M de parámetros), aproximadamente 650 MB en cuantización de 8 bits y unos 340 MB en GGUF Q4_K_M.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente; una RTX 3060, RTX 4060 o superior resulta holgada. Aceleradores como A100 o H100 no aportan ventaja práctica a este tamaño y quedan sobredimensionados.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta dedicada de los últimos diez años, e incluso puede ejecutarse íntegramente en CPU o en gráficas integradas.
- Opciones de despliegue: `transformers` con `device_map="auto"`; llama.cpp para GGUF; Ollama para despliegue local sencillo; vLLM o TGI para servir en GPU (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: en CPU x86_64 con 16 hilos, 10,5–11,4 tokens/s. El autor reporta 0,7 ms para la extracción de raíces. No hay datos publicados de throughput en GPU.
- Plataformas objetivo declaradas: Android (Termux o Kotlin/ONNX), Raspberry Pi 4/5, routers OpenWrt y Huawei, nodos P2P WyreNet y motores de voz TajweedSST.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| aynengine-qwen3-0.6b-mantiq | 605.133.824 | no disponible | ar, en | Apache 2.0 | Vocabulario de 160.807 tokens, etapa DPO centrada en logica arabe |
| Qwen/Qwen3-0.6B (base) | ≈0,6 B | no disponible en la informacion proporcionada | multilingue | Apache 2.0 | Modelo de partida; sin vocabulario de raices ni alineacion Mantiq |
| Qwen2.5-0.5B / Qwen2.5-0.5B-Instruct | ≈0,5 B | no disponible en la informacion proporcionada | multilingue | Apache 2.0 | Alternativa de tamano equivalente para edge; sin especializacion morfologica arabe |
| Modelos arabes de 0,5–1 B en el ecosistema (Jais, AceGPT, SILMA) | no disponible | no disponible | ar, en | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de comparaciones de rendimiento verificadas frente a estas alternativas. La ventaja diferencial del modelo de `enver` es el vocabulario morfológico árabe y la alineación DPO específica; su desventaja estructural es el techo de 605 M de parámetros frente a modelos de 7 B o superiores.

## Limitaciones y advertencias

- Techo de parámetros bajo: con 605 M de parámetros no está pensado para escribir bases de código de varios archivos ni para sustituir a modelos generalistas de 70 B o más. El propio autor lo indica explícitamente.
- Falacias circulares sutiles: las tautologías muy elaboradas requieren forzar cadena de pensamiento con `<think>...</think>`; en una sola pasada el modelo puede no detectarlas.
- Riesgo de alucinación: inherente a un modelo de 0,6 B. En tareas de verificación lógica, una respuesta segura no implica que la deducción sea correcta; conviene validar con una segunda fuente.
- Cobertura de idiomas limitada a árabe e inglés; el rendimiento en castellano u otras lenguas no está documentado y previsiblemente será pobre.
- Sesgos: el corpus de entrenamiento se apoya en fuentes lexicográficas y teológicas clásicas, lo que puede introducir un sesgo doctrinal y una visión particular de lo que constituye una «prueba válida»; no se documenta ningún proceso de mitigación de sesgos.
- Tokenizador no estándar: al ampliar el vocabulario con tokens morfológicos, cualquier herramienta que asuma el tokenizador original de Qwen3 (recuento de tokens, índices de atención, plantillas externas) puede comportarse de forma incorrecta o producir desalineaciones.
- Cifras no verificadas: los resultados de benchmarks proceden exclusivamente de la model card del autor, sin publicación de código de evaluación ni reproducción independiente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, con una fecha de creación registrada como 2026-09-18, lo que dificulta contrastar la madurez del artefacto.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se documenten los cambios. No impone restricciones adicionales, pero tampoco ofrece garantías.
- Capacidad de código muy limitada: el 100 % de Pass@1 reportado corresponde a una única tarea saneada de MBPP, no a un benchmark completo.
- No hay evidencia de soporte de tool calling, agentes multi-paso, visión ni audio; si un flujo de producción depende de estas capacidades, debe validarse antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enver/aynengine-qwen3-0.6b-mantiq
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Documentacion de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio llama.cpp (conversion a GGUF): https://github.com/ggml-org/llama.cpp

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo y corresponden a personajes historicos homonimos del autor («enver»), como Enver Pasha y Enver Hoxha. No se han encontrado en la busqueda papers, blogs, repositorios ni demos adicionales asociados a este modelo.
