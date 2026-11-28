# byjameson/atom-zero-49m

## Resumen

Atom Zero 49M es un modelo de lenguaje de tipo decoder-only transformer de 49,2 millones de parametros, desarrollado por el usuario byjameson y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo entrenado desde cero, no de un ajuste fino de un modelo mayor, con un tokenizador BPE de 8.192 tokens y una ventana de contexto de tan solo 128 tokens. Su proposito no es competir con modelos fundacionales, sino servir como nucleo de comportamiento conversacional dentro de un asistente local de un solo usuario.

El modelo forma parte del proyecto Atom Zero, un sistema de asistente personal que combina el modelo con tecnicas de RAG (SQLite FTS5, embeddings MiniLM, reranking hibrido), herramientas deterministas (hora, aritmetica segura, gestion de tareas, memoria de nombres) y un motor de busqueda documental con citas. La model card es explicita al respecto: los hechos deben vivir en el RAG y las habilidades pueden residir en adaptadores LoRA revisados; el modelo en si es un "modelo estrecho de chat y comportamiento", no un modelo fundacional.

Es relevante ahora porque representa una corriente de diseno opuesta a la escala masiva: modelos muy pequenos, locales, sin telemetria y orientados a privacidad, donde la calidad se obtiene mediante orquestacion (recuperacion, herramientas, verificacion) en lugar de parametros. Esta version de 49M es, ademas, la alternativa de reserva (fallback) del proyecto; la version por defecto es el checkpoint de 63M de Atom Zero 2.0.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 49.213.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos; atribucion de datos en NOTICE) |
| Formato de pesos | PyTorch (checkpoint); tokenizador BPE de 8.192 tokens |
| Capas / dimension / cabezas / FFN | 6 / 768 / 12 / 3072 |
| Tokenizador | BPE de 8.192 tokens (`data/chat_en_bpe8k.json`) |
| Paso del checkpoint | 40.000 |
| Tokens de entrenamiento | 175,37M limpios + mezcla de replay hasta 214,8M |
| Runtime | PyTorch, CUDA o CPU; probado en RTX 3050 de 6 GB |
| Tamano del repo | 0,2 GB (checkpoint de ~197 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas, dimension oculta de 768, 12 cabezas de atencion y capa feed-forward de 3072 unidades. Usa un tokenizador BPE propio de 8.192 tokens entrenado especificamente para el proyecto y fue entrenado desde cero (no es un fine-tuning). El entrenamiento utilizo 175,37 millones de tokens limpios mas una mezcla de replay hasta alcanzar 214,8 millones de tokens, con un checkpoint de producto en el paso 40.000.

No se detalla en la informacion disponible la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. La model card menciona variantes de "teacher data" (K, K2, K3) que no superaron el perfil completo del modelo base de 63M: K alcanzo 98,5% en benigno y 93,8% en multi-turno pero fallo en seguridad (39/40) y autolesion (14/16); K2 restauro 40/40 y 16/16 pero bajo el benigno a 89,0%; K3 paso todas las puertas pero quedo por debajo en copia (45,0%), retencion (0,828) y multi-turno (68,8% / 37,5%). Estos datos corresponden al proceso de seleccion del modelo por defecto, no a este checkpoint de 49M, cuyos pesos permanecen en la version 0.8.0.

La innovacion tecnica del proyecto no esta en el modelo sino en el sistema que lo rodea: recuperacion hibrida con FTS5 y embeddings, indice vectorial con IVF ANN por encima de 256 fragmentos, herramientas con lista de permitidos y confirmacion explicita, y un modo de autoaprendizaje acotado que genera notas del profesor sin modificar pesos.

## Capacidades

- Generacion de texto conversacional breve en ingles, orientada a respuestas cortas y multi-turno.
- Recuperacion aumentada (RAG) de documentos con citas a pagina o seccion, incluyendo paneles de evidencia y API.
- Uso de herramientas deterministas: hora, aritmetica segura, creacion y listado de tareas, memoria de nombres y gustos, y una API de planificacion de 3 pasos con lista de permitidos y confirmacion.
- Gestion de sesiones: restauracion de transcripciones, exportacion e importacion JSON, borrado exacto ("Forget") a nivel de sesion.
- Ingesta de documentos en texto, Markdown, HTML, PDF y DOCX, con metadatos de fuente, titulo y sha256.
- Resumen extractivo de fuentes y colecciones, y grafo de "segundo cerebro" por fuente.
- Investigacion asistida: cola de solo aprobados, obtencion desde Wikipedia, sintesis mediante profesor local (Ollama u OpenAI-compatible) y verificacion por revisor.
- Modo de curiosidad: deteccion de huecos, propuesta de tema pendiente, aprobacion y generacion de nota RAG.
- Autoaprendizaje acotado: notas del profesor en "hungry mode" (sin tocar pesos) y LoRA revisado (con cambios de pesos).
- Personalizacion declarativa mediante JSON en `data/skills` (disparadores, contexto local, modo proveedor o plantilla).
- Capacidades multilingues: solo ingles.
- No soporta razonamiento general, codigo, matematicas mas alla de aritmetica simple, ni vision o audio.

## Casos de uso

- Asistente personal local de un solo usuario: el modelo gestiona conversaciones cortas de chat, tareas, notas, hora y aritmetica, con todas las operaciones en localhost y sin telemetria. Es adecuado porque el sistema delega los hechos al RAG y las herramientas, compensando la limitacion de 128 tokens de contexto.
- Busqueda documental con citas: ingesta de PDF, DOCX, Markdown y HTML con recuperacion hibrida (FTS5 + embeddings) y reranking lexico-coseno. El modelo responde con referencias a pagina o seccion, lo que permite auditar cada afirmacion en entornos donde la trazabilidad es obligatoria.
- Base de conocimiento personal ("segundo cerebro"): construccion de un grafo por fuente con borrado selectivo y exportacion/importacion, util para organizar notas de investigacion con evidencia verificable.
- Automatizacion de tareas diarias: generacion de un brief diario local y un plan de objetivos citado, con creacion de tareas solo tras confirmacion explicita del usuario. Adecuado para flujos de productividad personal sin dependencia de la nube.
- Prototipado de sistemas RAG en hardware modesto: con ~197 MB de checkpoint y ejecucion probada en una RTX 3050 de 6 GB, sirve para validar pipelines de recuperacion, reranking y citacion antes de escalar a modelos mayores.
- Investigacion sobre modelos pequenos y comportamiento: el proyecto incluye 1.727 tests, benchmark 20/20 y pruebas de recuperacion sobre SQuAD v2 (0,975 top-1, 1,000 top-5 en 50 contextos), lo que lo convierte en una referencia reproducible para estudiar orquestacion con modelos diminutos.
- Evaluacion de seguridad y alineacion en asistentes locales: incorpora un cabezal lineal ML opcional y reglas de seguridad desactivadas por defecto, con fallback exacto, util para experimentar con capas de moderacion en despliegues de un solo usuario.

## Benchmarks y rendimiento

Los datos disponibles corresponden al sistema Atom Zero (modelo + RAG + herramientas), no a pruebas crudas del modelo aislado. La model card distingue explicitamente entre "raw", "product" y "behavior", y advierte que el sondeo del modelo crudo no usa RAG, herramientas ni agente.

| Prueba | Resultado | Contexto |
|---|---|---|
| SQuAD v2, recuperacion top-1 | 0,975 | 50 contextos, hibrido |
| SQuAD v2, recuperacion top-5 | 1,000 | 50 contextos, hibrido |
| SQuAD v2, respuesta en fragmento visible top-1 | 0,884 | 50 contextos, hibrido |
| Benchmark de documentos propio | 80/80 respondibles, 20/20 sin respuesta | 100 preguntas autorales |
| Benchmark de producto | 21/21 | Sistema completo |
| Benchmark de comportamiento | 16/16 | Sistema completo |
| Tests | 1.727 superados en 64,83 s | VM del proyecto |
| Benchmark general | 20/20 | Sistema completo |

No se han publicado resultados de MMLU, GSM8K o HumanEval en la informacion disponible, y la propia model card declara explicitamente que no reclama paridad con modelos frontera en esas pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (49,2M de parametros, checkpoint de ~197 MB); en la practica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor indica ejecucion probada en una RTX 3050 de 6 GB; cualquier GPU con 2 GB o mas es suficiente. Para CPU, el modelo es viable en equipos de escritorio convencionales.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: el proyecto se distribuye como paquete Python (`pip install atomzero==2.0.0`) con entry points `atomzero` y `atomzero-quickstart`; el runtime es PyTorch sobre CUDA o CPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI para estos pesos; Ollama se usa como proveedor opcional de un modelo mayor, no para ejecutar Atom Zero.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos de tamano similar. La unica comparacion interna es con el checkpoint de 63M del mismo proyecto, que es el modelo por defecto de Atom Zero 2.0.0.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Atom Zero 49M (este) | 49,2M | 128 tokens | Apache-2.0 | Fallback, pesos 0.8.0 |
| Atom Zero 63M | 63M (no confirmado en detalle) | no disponible | Apache-2.0 | Por defecto en 2.0.0; recall de historial 65,0%, copia de 4 claves 63,0%, fresco 75,0%, multi-turno 83,3 / 58,3, seguridad 40/40, autolesion 16/16 |

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Contexto extremadamente corto: 128 tokens, insuficiente para conversaciones largas o documentos extensos sin el RAG del sistema. Cualquier uso fuera del pipeline Atom Zero degrada rapidamente.
- Solo ingles: no hay soporte multilingue; el castellano no esta cubierto.
- Modelo estrecho: no es un modelo fundacional. No debe esperarse razonamiento general, codigo, matematicas mas alla de aritmetica simple, ni conocimiento factual fiable por si mismo.
- Riesgo de alucinacion: la model card indica que los hechos deben residir en el RAG; usar el modelo crudo como fuente de conocimiento produce respuestas no verificadas.
- Fuera de alcance declarado: consejo medico, legal, financiero o de seguridad critica; rastreo web autonomo; mutacion de pesos no supervisada; uso de herramientas sin supervision; operacion multiinquilino o alojada sin controles adicionales.
- Seguridad desactivada por defecto: el cabezal lineal ML y las reglas de seguridad son opcionales y estan desactivados por defecto, con fallback exacto. En produccion es necesario activarlos y validarlos.
- Licencia: Apache-2.0 para codigo y pesos, con atribucion de datos en el fichero NOTICE; conviene revisar dicha atribucion antes de un uso comercial.
- Estado del artefacto: este checkpoint de 49M es la alternativa de reserva y sus pesos permanecen en la version 0.8.0, mientras que el proyecto ha avanzado a la version 2.0.0 con el modelo de 63M. No debe asumirse que recibe las mismas mejoras.
- Sin telemetria ni datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byjameson/atom-zero-49m
- Demo en ModelScope Studio (Atom Zero 63M): https://modelscope.cn/studios/byjameson/atomzerodemo
- Mapa del proyecto (PROJECT_OVERVIEW.md): https://github.com/byjameson/atom-zero/blob/main/docs/PROJECT_OVERVIEW.md
- Repositorio GitHub del proyecto: https://github.com/byjameson/atom-zero
- Paper: no disponible
- Blog tecnico: no disponible
