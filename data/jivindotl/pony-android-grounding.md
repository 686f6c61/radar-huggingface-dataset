# JivinDotL/pony-android-grounding

## Resumen

Pony-AndroidGrounding es un modelo de visión-lenguaje especializado en *visual grounding* sobre capturas de pantalla de Android. Lo desarrolla JivinDotL y parte de Qwen3-VL-2B-Instruct, un transformer multimodal de 2.000 millones de parámetros, sobre el que se aplicó un ajuste fino con LoRA (r=16 sobre las proyecciones q/k/v/o) que después se fusionó con los pesos base en bf16 mediante `merge_and_unload`. El modelo resuelve un problema muy concreto: dada una instrucción en lenguaje natural y una captura de pantalla de un móvil, devolver las coordenadas del elemento de interfaz que corresponde a esa instrucción.

La salida sigue un protocolo estricto: un único `<bbox>x1,y1,x2,y2</bbox>` normalizado en el rango 0-1000, o la cadena `未找到` ("no encontrado") cuando el objetivo no aparece en pantalla. Esta capacidad de rechazo explícito es relevante para automatización de UI, porque evita que un agente pulse coordenadas inventadas. Además, el modelo incorpora un protocolo de *tool calling* con `<tool_call>` en JSON para funciones `locate_ui_element` y `tap`, aunque solo emite coordenadas sugeridas y nunca ejecuta acciones.

El modelo es relevante ahora por su tamaño reducido (2B), su licencia Apache-2.0 y su enfoque en un dominio de alto interés práctico como la automatización de interfaces móviles. Su ventana de contexto y sus datos de entrenamiento no se detallan en la información disponible; el autor sí especifica que el dominio de entrenamiento son capturas verticales de 720×1600 píxeles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), base Qwen3-VL-2B-Instruct con LoRA fusionado |
| Parámetros totales | 2B (heredados de Qwen3-VL-2B-Instruct) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el autor no detalla otras variantes) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, pesos fusionados vía `merge_and_unload`) |

## Arquitectura y entrenamiento

La base es Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imagen y texto. Sobre él se aplicó un ajuste fino con LoRA de rango 16 en las proyecciones de atención q/k/v/o, que posteriormente se fusionó con los pesos base en bf16. El entrenamiento se realizó en una única GPU H100 y consta de dos fases: SFT con LoRA y una segunda fase de DPO. El autor indica que el modelo incorpora además corpus propios de identidad y comportamiento ("Identity + Behavior SFT + DPO"), lo que explica la presencia de una persona ficticia en las respuestas.

Los datos de entrenamiento son capturas de pantalla recogidas en dispositivos reales, que no se publican por derechos de autor sobre las interfaces de aplicaciones de terceros; las anotaciones se publican por separado en un repositorio de dataset en formato JSON (criterio L1, solo anotaciones). No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. El protocolo de evaluación sí está documentado: conjuntos val (225), test (115) y un examen denso con 52 casos de enumeración multiobjetivo, con los ficheros `splits_v9.json` y `dense_exam.json` publicados junto al modelo. El test incluye una retención completa de un dominio de escritorio, de modo que las métricas miden generalización entre interfaces.

## Capacidades

- *Visual grounding* sobre capturas de Android: devuelve un único bbox normalizado (0-1000) para instrucciones de búsqueda de elementos.
- Rechazo explícito: cuando el objetivo no está en pantalla, emite `未找到` en lugar de inventar coordenadas.
- Enumeración densa: puede listar todos los elementos clicables de una pantalla (evaluado en el conjunto denso de 52 casos).
- *Tool calling*: emite `<tool_call>` en JSON para las funciones `locate_ui_element` y `tap`, validado con un parser estricto (6/6).
- Conversación multilingüe limitada a chino e inglés.
- Respuestas de identidad y comportamiento entrenadas mediante SFT y DPO, con persona ficticia declarada.
- No ejecuta acciones: solo sugiere coordenadas.

## Casos de uso

- Automatización de pruebas de UI en Android: el modelo recibe la captura del *emulator* o dispositivo y la descripción del botón o campo objetivo, y devuelve el bbox que un *script* de Appium o UIAutomator puede usar para pulsar. Su tasa de acierto de clic del 87,5 % en test lo hace viable como primer paso de localización con verificación posterior.
- Agentes de navegación móvil: integrado en un bucle de agente, el modelo propone el siguiente elemento a tocar a partir de la pantalla actual y la instrucción del usuario. El protocolo `tap` en JSON permite conectarlo a un ejecutor externo que aplique la política de seguridad.
- Asistencia a personas con discapacidad visual: dado un comando como "abre los ajustes de red", el modelo localiza el icono correspondiente en la captura y devuelve su posición para guiar la interacción táctil.
- Extracción de elementos para RPA (automatización robótica de procesos): en flujos de negocio sobre aplicaciones móviles, el modelo identifica campos de formulario y botones de confirmación con coordenadas listas para el motor de RPA.
- Enumeración de elementos para auditoría de accesibilidad: la capacidad densa permite listar los elementos clicables de una pantalla y compararlos con el árbol de accesibilidad declarado por la aplicación.
- Generación de datos de entrenamiento para otros modelos de grounding: el modelo puede etiquetar capturas nuevas con bboxes y servir como anotador automático en un pipeline de destilación, dado su bajo coste de inferencia.
- Clasificación de pantallas y detección de estados vacíos: el rechazo `未找到` permite distinguir pantallas donde el elemento esperado no existe, útil en *smoke tests* de regresión visual.

## Benchmarks y rendimiento

Resultados publicados por el autor (v10.0b, 2026-11-04), sobre conjuntos congelados antes del entrenamiento:

| Split | IoU@50 | IoU@75 | Acierto de clic | Rechazo correcto | JSON válido |
|---|---|---|---|---|---|
| val (225) | 87,3 | 85,0 | 93,5 | 100 | 100 |
| test (115) | 80,4 | 72,5 | 87,5 | 100 | 100 |
| denso, enumeración (52) | 100,0 | 98,1 | — | — | 100 |

Latencia indicada por el autor: aproximadamente 0,5 s de media por petición en una H100 con bf16. El conjunto de test incluye una retención completa de un dominio de escritorio, por lo que las cifras reflejan generalización entre interfaces. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4-5 GB para los pesos de un modelo de 2B, más el *overhead* del procesador de imagen y del *KV cache*.
- GPU recomendadas: H100 (medición oficial del autor, ~0,5 s por petición); cualquier GPU con al menos 8 GB de VRAM para bf16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; con cuantización a 8 bits o 4 bits cabría en GPUs de 6-8 GB, aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (documentado por el autor); vLLM, TGI o llama.cpp no están confirmados en la información disponible.
- Latencia y throughput: ~0,5 s por petición en H100 bf16; no se publica throughput agregado ni latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pony-AndroidGrounding | 2B | no disponible | Grounding de UI Android | Apache-2.0 | HuggingFace |
| Qwen3-VL-2B-Instruct (base) | 2B | no disponible | VLM generalista | Apache-2.0 | HuggingFace |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible | VLM generalista con grounding | Apache-2.0 | HuggingFace |
| UI-TARS (versiones pequeñas) | no disponible | no disponible | Agente de UI | no disponible | HuggingFace |

La comparación directa con alternativas especializadas en grounding de UI no está disponible en la información proporcionada. Frente a su base Qwen3-VL-2B-Instruct, la diferencia principal es la especialización en el dominio Android y el protocolo de rechazo, a costa de perder generalidad fuera de ese dominio.

## Limitaciones y advertencias

- Persona ficticia: el modelo declara un nombre y un laboratorio inventados; la fecha de publicación que menciona (2027-01-01) es un valor de personaje y no un hecho real.
- Inestabilidad en la pregunta sobre la relación con "Pony.ai": el autor reconoce que puede negar honestamente la relación o inventar una colaboración ficticia. El contenido de identidad no debe tratarse como fiable.
- Dominio restringido: entrenado con capturas verticales de 720×1600; las interfaces horizontales y web quedan fuera de distribución.
- Iconos pequeños (menos de 40 píxeles) e iconos visualmente muy similares presentan un rendimiento débil.
- El modelo solo emite coordenadas sugeridas y nunca ejecuta acciones; cualquier integración debe validar y aplicar políticas de seguridad antes de tocar la pantalla.
- Riesgo de alucinación en coordenadas cuando el objetivo no está claro; el protocolo de rechazo mitiga este punto, pero la tasa de rechazo correcto del 100 % corresponde a los conjuntos de evaluación del autor.
- Idiomas limitados a chino e inglés; no hay soporte declarado de castellano.
- Licencia Apache-2.0, compatible con uso comercial, pero el autor no publica los datos de entrenamiento (solo anotaciones), lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JivinDotL/pony-android-grounding
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Ficheros de particiones de evaluación: `splits_v9.json` y `dense_exam.json`, publicados en el repositorio del modelo
- Repositorio de dataset con anotaciones (L1): no disponible en la información proporcionada
- Documentación del proyecto con receta de entrenamiento: no disponible en la información proporcionada
