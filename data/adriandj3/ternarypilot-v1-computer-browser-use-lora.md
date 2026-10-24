# adriandj3/TernaryPilot-v1-Computer-Browser-Use-LoRA

## Resumen

TernaryPilot v1 es un adaptador LoRA para Ternary-Bonsai-2-9B, un modelo multimodal de aproximadamente 9.000 millones de parámetros con pesos ternarios (1,58 bits) que ocupa unos 2,7 GB en su cuantización PQ2_0. Lo publica Adrian Ciprian Iancu (adriandj3) y añade a la base cuatro habilidades de automatización de escritorio y navegador: localización de elementos sobre una captura (click grounding), predicción de la siguiente acción, ejecución de tareas multi-paso y descripción del estado de la pantalla.

Su interés práctico está en el coste: el autor entrenó y ejecutó todo el sistema en una única GTX 1080 de 8 GB, lo que sitúa un agente GUI multimodal en hardware de 2016 sin conexión a servicios externos. El adaptador se distribuye en GGUF y requiere el fork de llama.cpp de PrismML, que incorpora los kernels ternarios.

El diseño de despliegue es deliberadamente conservador: el adaptador se carga con escala 0 y solo se activa por petición para las solicitudes de interfaz gráfica, de modo que el chat general mantiene exactamente la salida del modelo base (12 de 12 prompts idénticos en la comprobación del autor). Las cifras publicadas son modestas pero consistentes: 156/200 en un subconjunto estratificado de ScreenSpot-v2, frente a 80/200 del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer multimodal image-text-to-text; la arquitectura interna del modelo base no se detalla en la model card (las etiquetas del repo incluyen qwen3.5) |
| Parámetros totales | Adaptador: 40.108.032 (safetensors). Modelo base: ~9.000 millones (Ternary-Bonsai-2-9B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de referencia de llama-server (`-c 16384`); máximo del modelo base no disponible |
| Tipos de cuantización | Pesos base ternarios de 1,58 bits en GGUF PQ2_0 (~2,7 GB); proyector visual en Q8_0; adaptador LoRA en F16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (la licencia del modelo base no se indica en la información disponible) |
| Formato de pesos | GGUF para llama.cpp; adaptador LoRA en GGUF F16 |

## Arquitectura y entrenamiento

El repositorio contiene únicamente el adaptador (0,1 GB), no los pesos completos. El modelo base es un transformer multimodal con pesos ternarios de 1,58 bits, pensado para cuantización extrema con pérdida de precisión controlada; el adaptador añade las capacidades de agente GUI sin modificar el resto del comportamiento. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el autor describe el trabajo como entrenamiento de un LoRA sobre cinco colecciones públicas de trayectorias y capturas: `xlangai/AgentNet`, `osunlp/Multimodal-Mind2Web`, `showlab/ShowUI-desktop`, `agentsea/wave-ui` y `ServiceNow/GroundCUA`.

Las decisiones técnicas destacables son tres. Primera, la salida de coordenadas se normaliza siempre a una rejilla de 0-1000, independiente de la resolución de la captura, lo que evita recalcular el adaptador por cada tamaño de pantalla. Segunda, el historial de acciones se pasa como texto plano, de modo que no hay que reenviar capturas antiguas y el coste en tokens se mantiene acotado. Tercera, las capturas de evaluación se filtraron del conjunto de entrenamiento mediante hash perceptual, y el autor indica que ninguna de las imágenes de test se usó en el entrenamiento. No se documenta ninguna innovación de decodificación (decodificación especulativa, atención lineal u otras).

## Capacidades

- Localización de elementos (click grounding): recibe una captura y un objetivo en lenguaje natural ("save file", "the Donate link") y devuelve `{"x": int, "y": int}` en rejilla 0-1000.
- Predicción de la siguiente acción: dada una tarea, el historial de acciones y la pantalla actual, emite un razonamiento breve y una única acción.
- Espacio de acciones soportado: `click(x, y)`, `double_click(x, y)`, `right_click(x, y)`, `move(x, y)`, `drag(x, y)`, `write(text)`, `press(key)`, `hotkey(keys)`, `scroll(amount)`, `wait()`, `done()`.
- Tareas multi-paso: mantiene la coherencia a lo largo de pasos sucesivos conservando el historial en texto.
- Lectura de pantalla: identifica la aplicación o sitio abierto, su estado y el texto relevante visible.
- Cobertura de dominio: aplicaciones de escritorio de Windows y páginas web.
- Cumplimiento de formato: 145/145 respuestas en el formato esperado en el conjunto de evaluación de acciones.
- No incluye tool calling genérico, function calling de APIs, visión general fuera de GUI, audio ni modo "thinking" explícito; la model card no los menciona.

## Casos de uso

- Pruebas de regresión de interfaz en aplicaciones Windows: el adaptador devuelve coordenadas normalizadas para un objetivo descrito en lenguaje natural, lo que permite generar scripts de UI testing sin depender de selectores ni de árboles de accesibilidad, y sobrevivir a cambios de layout.
- RPA local con datos sensibles: al ejecutarse sobre 2,7 GB de pesos en una GPU de 8 GB, las capturas de pantalla no salen de la máquina; encaja en entornos con requisitos de confidencialidad (sanidad, banca, despachos) donde no es viable enviar pantallazos a una API.
- Asistente de accesibilidad: traducir una instrucción hablada en lenguaje natural ("abre el menú de archivo y guarda como PDF") a una acción concreta sobre la pantalla, o indicar visualmente dónde pulsar.
- Automatización de navegación web: rellenar formularios, avanzar en flujos de varios pasos y manejar paginación pasando el historial en texto plano, lo que reduce el número de imágenes enviadas al modelo.
- Soporte técnico de primer nivel: describir el estado de la pantalla del usuario (aplicación abierta, texto del error visible) y proponer el siguiente paso, con el adaptador activado solo en esas peticiones.
- Enrutado híbrido en pipelines de agentes: mantener el adaptador a escala 0 para conversación general y activarlo con `{"lora": [{"id": 0, "scale": 1}]}` únicamente en las llamadas de grounding o acción, reservando el razonamiento de alto nivel a otro modelo.
- Indexación y auditoría de sesiones: generar descripciones textuales de capturas para buscar y clasificar grabaciones de sesiones de soporte o de pruebas.
- Prototipado de agentes GUI sin coste de inferencia: permite iterar sobre la lógica del agente en un portátil con GPU de gama antigua antes de mover el sistema a hardware mayor.

## Benchmarks y rendimiento

Datos publicados por el autor, decodificación greedy, imágenes a 1.024 tokens, medidos en una GTX 1080 con el fork de llama.cpp de PrismML. Las capturas de evaluación se excluyeron del entrenamiento y se filtraron por hash perceptual.

Grounding (aciertos sobre el total):

| Benchmark | Modelo base | LoRA de grounding anterior | TernaryPilot v1 |
|---|---|---|---|
| ScreenSpot-v2, subconjunto estratificado de 200 casos | 80/200 | 153/200 | 156/200 |
| Aplicaciones Windows reales en italiano, 37 objetivos con cajas de UI Automation | 2/37 | 13/37 | 15/37 |
| Páginas web reales, 210 objetivos con cajas del DOM | 28/210 | 99/210 | 101/210 |

Desglose de ScreenSpot-v2 (v1): icono de escritorio 31/40, texto de escritorio 42/53, icono web 30/50, texto web 53/57.

Acciones de agente sobre 145 pasos retenidos (85 pasos Windows de tareas de AgentNet no vistas en entrenamiento, 60 pasos web de Mind2Web). Un paso se considera correcto si coincide el tipo de acción y, en acciones con coordenadas, el punto cae a menos de 40 unidades de la rejilla 0-1000 del punto real:

| Métrica | Modelo base | LoRA de grounding anterior | TernaryPilot v1 |
|---|---|---|---|
| Acciones correctas | 7/145 | 28/145 | 67/145 |
| Windows | 7/85 | 15/85 | 41/85 |
| Web | 0/60 | 13/60 | 26/60 |
| Respuestas en el formato esperado | 131/145 | 93/145 | 145/145 |

No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones estándar de razonamiento o código en la información disponible.

## Requisitos de hardware

- Huella de pesos: ~2,7 GB para el modelo base ternario en PQ2_0, más el proyector visual en Q8_0 y la caché KV para 16.384 tokens con hasta 1.024 tokens de imagen por captura.
- GPU verificada: GTX 1080 de 8 GB, el mismo equipo usado para el entrenamiento; el autor no documenta otras GPU.
- Cabe en GPU de consumo: sí, con 8 GB confirmados. Por debajo de 6 GB no hay datos en la información disponible.
- Despliegue: exclusivamente mediante `llama-server` del fork de PrismML de llama.cpp (kernels ternarios), con `--lora-scaled`, `-ngl 999`, `-fa on`, `--jinja`, `-c 16384`, `--parallel 2`, `--image-max-tokens 1024`. No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Ficheros de referencia probados por el autor: `Ternary-Bonsai-2-9B-PQ2_0-MTP-Q8_0.gguf` y `Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf`.
- Ajustes recomendados: `temperature: 0` y `presence_penalty: 0` para clics (con penalización de presencia 1.0 el autor perdió 4 clics de 200), y enviar las peticiones GUI a un slot propio (`id_slot: 1`) para que el cambio de escala del adaptador no invalide la caché del slot de chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información disponible solo permite comparar contra el modelo base y contra el LoRA de grounding previo del mismo autor. No se aportan datos de otros modelos públicos de grounding o agentes GUI, por lo que esa comparación figura como no disponible.

| Modelo | Parámetros | Contexto | ScreenSpot-v2 (200) | Windows real (37) | Web real (210) | Acciones (145) | Licencia |
|---|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B (base) | ~9.000 M, ternario 1,58 bits | no disponible | 80/200 | 2/37 | 28/210 | 7/145 | no disponible |
| LoRA de grounding anterior del autor | adaptador sobre la misma base | no disponible | 153/200 | 13/37 | 99/210 | 28/145 | no disponible |
| TernaryPilot v1 | adaptador de 40,1 M sobre la misma base | 16.384 en la configuración de referencia | 156/200 | 15/37 | 101/210 | 67/145 | Apache 2.0 |

## Limitaciones y advertencias

- Idioma: solo inglés declarado. El propio autor mide 15/37 en aplicaciones Windows en italiano, lo que indica degradación fuera del idioma de entrenamiento.
- Precisión absoluta baja: 101/210 en páginas web reales y 67/145 en pasos de agente. Un agente construido sobre este modelo necesita verificación posterior y confirmación humana en acciones destructivas.
- Riesgo de alucinación de elementos: el modelo puede devolver coordenadas plausibles para objetivos que no existen en la pantalla; no hay mecanismo de abstención documentado.
- Evaluaciones autoinformadas, con subconjuntos pequeños (37, 145, 200, 210 casos), una sola ejecución y sin validación externa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Dependencia de un fork concreto de llama.cpp; en Windows, `--lora-scaled` divide la ruta por `:`, así que rutas como `D:\models\x.gguf:0` fallan y hay que arrancar el servidor desde la carpeta del adaptador pasando solo el nombre del fichero.
- Activar o desactivar el adaptador en un slot limpia la caché de ese slot: si se comparte slot con el chat, el contexto largo se reprocesa tras cada clic.
- Es la versión 1 de un proyecto en desarrollo; el autor anuncia una v2 con más datos y entrenamiento más largo.
- Licencia: el adaptador es Apache 2.0, pero la licencia del modelo base no se indica en la información disponible y debe verificarse antes de un uso comercial.
- No se documentan sesgos demográficos ni evaluaciones de robustez frente a capturas adversarias, baja resolución o temas oscuros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adriandj3/TernaryPilot-v1-Computer-Browser-Use-LoRA
- Perfil del autor en HuggingFace: https://huggingface.co/adriandj3
- GitHub del autor: https://github.com/ArtyomITA
- LinkedIn del autor: https://www.linkedin.com/in/adrian-ciprian-iancu-a2a477391
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Datasets citados: `xlangai/AgentNet`, `osunlp/Multimodal-Mind2Web`, `showlab/ShowUI-desktop`, `agentsea/wave-ui`, `ServiceNow/GroundCUA`
