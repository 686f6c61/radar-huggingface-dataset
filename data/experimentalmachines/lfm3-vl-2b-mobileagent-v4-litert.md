# experimentalmachines/LFM3-VL-2B-MobileAgent-v4-LiteRT

## Resumen

LFM3-VL-2B-MobileAgent-v4-LiteRT es la conversión al formato `.litertlm` del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v4, un modelo visión-lenguaje de 2B parámetros especializado en operar interfaces de Android a partir de capturas de pantalla. Lo publica el usuario experimentalmachines y deriva, a su vez, de LiquidAI/LFM3-VL-2B, sobre el que se ha aplicado un ajuste fino orientado a tareas de agente móvil (GUI agent). El objetivo del artefacto es ejecutar inferencia en el propio dispositivo (GPU o CPU de un teléfono Android) sin compilaciones específicas por chip, mediante el runtime LiteRT-LM de Google.

La relevancia de esta ficha está en que no es un modelo nuevo, sino un empaquetado cuantizado y verificado contra el original en bf16: el autor reporta paridad funcional en 180 pasos del conjunto de test de AndroidControl, con una precisión de paso de 0,783 frente a 0,772 del modelo bf16. El archivo incluye decodificador de texto en int8, embeddings int8, codificador visual en fp32 y adaptador en fp16, con un tamaño total de 2.760.755.451 bytes (unos 2,8 GB).

El modelo está pensado para un caso de uso muy concreto: un paso por captura, contexto de 4.096 tokens (unos 1.300 por paso) y salida estructurada en forma de intención breve más una acción JSON con coordenadas en una rejilla 0-1000. Es un modelo de investigación, con éxito de tarea bajo (3 de 11 tareas cotidianas completadas en el dispositivo) y limitado a inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (modelo base LiquidAI/LFM3-VL-2B, tipo `fast_vlm` en LiteRT-LM); codificador visual más decodificador de texto |
| Parámetros totales | 2B (heredado del modelo base LFM3-VL-2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | Decodificador de texto int8 (per-channel), embeddings de tokens int8, codificador visual fp32, adaptador fp16; existe una variante int4 no publicada de 2,07 GB |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (LFM Open License v1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | `.litertlm` (LiteRT-LM); archivo `LFM3-VL-2B-MobileAgent-v4_int8_g1280x576_ctx4096.litertlm` |
| Entrada de imagen | Una captura por petición a 1280 × 576 fijo (alto × ancho) = 720 tokens de imagen |
| Salida | `<think>intención breve</think>` seguido de una acción JSON compacta con coordenadas en rejilla 0-1000 |
| Runtime probado | LiteRT-LM 0.19.1 (Python en Mac, Kotlin en Android); construido con litert-lm-builder 0.18.1 |
| Tamaño del repo | 2,8 GB |
| SHA-256 del archivo principal | `8eba580944ec4627986698392fa235acca02dfc469bf1e00dc6d22288156870d` |

## Arquitectura y entrenamiento

El modelo es un transformer visión-lenguaje que combina un codificador de imagen con un decodificador de texto. El empaquetado LiteRT-LM emplea el tipo de modelo `fast_vlm` y separa precisión por componente: el decodificador de texto va en int8 por canal, los embeddings de tokens en int8, el codificador visual en fp32 y el adaptador en fp16. La imagen se procesa a una resolución fija de 1280 × 576 (alto × ancho), lo que produce 720 tokens visuales por captura; esta elección corresponde a pantallas en retrato de aproximadamente 20:9 (por ejemplo, 1080 × 2400 o 1440 × 3200) tal como se vieron durante el entrenamiento.

El ajuste fino sobre LiquidAI/LFM3-VL-2B se orienta a un formato de agente con prompt de sistema v4 y un texto de usuario que incluye el objetivo, las aplicaciones instaladas, los últimos 8 pasos y la pregunta. La salida sigue un patrón de pensamiento corto (`<think>...</think>`) seguido de una acción JSON. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; esos datos deben consultarse en el repositorio de investigación lfm3-mobile-agent. La innovación técnica destacable del empaquetado es la paridad numérica verificada: los grafos de visión se comprobaron contra el modelo original en CPU de Mac con un coseno por token mínimo de 0,99999985 sobre 720 tokens, y en GPU del teléfono el archivo elige la misma acción que el mismo archivo en Mac en el 99,4% de los 180 pasos.

## Capacidades

- Generación de texto y razonamiento breve orientado a intención de acción (modo thinking con canal `thought` separado).
- Comprensión de capturas de pantalla de Android y localización de elementos de interfaz mediante coordenadas en rejilla 0-1000.
- Emisión de acciones estructuradas en JSON compacto (por ejemplo, `{"action_type":"open_app","app_name":"Clock"}`).
- Operación de aplicaciones móviles paso a paso: apertura de apps, toques, escritura y otras acciones de GUI.
- Seguimiento de contexto multi-paso limitado: el prompt incluye los últimos 8 pasos de la trayectoria.
- Capacidades multilingües: solo inglés.
- No se documentan en la información disponible capacidades de tool calling genérico, function calling fuera del esquema de acciones, audio ni visión más allá de la captura única.

## Casos de uso

- Automatización de pruebas de interfaz en Android: el modelo puede recibir una captura por paso y devolver la acción a ejecutar, integrándose en un arnés de test que valide flujos de UI de forma reproducible con la rejilla de coordenadas 0-1000.
- Asistente de accesibilidad en el propio dispositivo: al ejecutarse en GPU o CPU del teléfono sin conexión, puede sugerir la siguiente acción al usuario a partir de la pantalla actual, útil en entornos con conectividad limitada.
- Investigación en agentes GUI: sirve como referencia cuantizada y verificada contra bf16 para estudiar la degradación por cuantización en tareas de agente móvil, con métricas de precisión de paso y distancia de clic al percentil 90.
- Prototipado de automatización de tareas repetitivas en móvil: con el prompt v4 y el contexto de 4.096 tokens (unos 1.300 por paso), permite encadenar pasos sobre una app concreta en un entorno controlado de laboratorio.
- Evaluación comparativa de runtimes: al estar empaquetado para LiteRT-LM 0.19.1, permite medir latencia y paridad frente a GGUF Q4_K_M en llama.cpp (3,63 s de mediana por llamada en el teléfono de referencia frente a los resultados del GGUF en Mac).
- Docencia y demos de IA en dispositivo: el tamaño de 2,8 GB y la ejecución sin compilación por chip facilitan demostraciones de agentes móviles en hardware de gama alta con Snapdragon.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 180 pasos de test de AndroidControl (episodios oficiales, prompt v4, capturas redimensionadas como en entrenamiento). La referencia es el modelo v4 original en Transformers bf16.

| Métrica | bf16 original | GGUF Q4_K_M (llama.cpp) | Este archivo en teléfono |
|---|---|---|---|
| Precisión de paso | 0,772 | 0,800 | 0,783 |
| Misma acción que bf16 | — | 0,894 | 0,906 |
| Distancia de clic frente a bf16, percentil 90 (rejilla 0-1000) | — | 5 | 2 |
| Pasos "tarea completada" (sobre 60) | no disponible | 0,650 (Mac) | 0,683 |

El autor indica que la diferencia de precisión de este archivo en teléfono frente a bf16 es de +1,1 puntos con intervalo del 95% de −2,0 a +4,2, por lo que no se detecta diferencia. En velocidad, con un teléfono de referencia Snapdragon SM8975 (Qualcomm Device Cloud), Android 17, GPU para texto y visión y prompt de unos 1.300 tokens: 3,63 s de mediana en 180 pasos consecutivos (estado térmico subió de 1 a 3) y 3,53 s de mediana en 10 llamadas sobre una misma captura con el teléfono ya caliente y la GPU limitada a 636 de 1.450 MHz. La variante int4 no publicada de 2,07 GB tardó 2,46 s en un teléfono frío del mismo modelo, pero coincide con bf16 en solo el 84% de los pasos.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo principal ocupa 2.760.755.451 bytes (unos 2,8 GB); el repo completo es de 2,8 GB.
- Ejecución en dispositivo: probado en GPU y CPU de un teléfono Android con Snapdragon SM8975; el autor indica que funciona en GPU o CPU de un teléfono sin compilación por chip.
- GPU de escritorio: no se documentan requisitos para A100, H100 o RTX 4090 en la información disponible; las pruebas en Mac se hicieron en CPU.
- Consumer GPU: no disponible; el artefacto está orientado a LiteRT-LM en Android y a Python en Mac.
- Despliegue: LiteRT-LM 0.19.1 (Python y Kotlin/Android); el autor menciona también GGUF Q4_K_M como alternativa vía llama.cpp para comparación, pero este archivo concreto es `.litertlm`.
- Latencia: 3,63 s de mediana por llamada en 180 pasos consecutivos y 3,53 s con el teléfono caliente y GPU a 636 MHz, en el teléfono de referencia.
- Ajuste de rendimiento: `filter_channel_content_from_kv_cache=False` ahorró unos 3,5 s por llamada en el teléfono.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de paso (AndroidControl, 180 pasos) | Licencia | Formato |
|---|---|---|---|---|---|
| Este archivo (LiteRT, int8) | 2B | 4.096 | 0,783 | lfm1.0 | `.litertlm` |
| LFM3-VL-2B-MobileAgent-v4 bf16 | 2B | 4.096 | 0,772 | lfm1.0 | safetensors/Transformers |
| LFM3-VL-2B-MobileAgent-v4 GGUF Q4_K_M | 2B | 4.096 | 0,800 | lfm1.0 | GGUF |
| LiquidAI/LFM3-VL-2B (base) | 2B | no disponible | no disponible | lfm1.0 | no disponible |

No se dispone en la información proporcionada de comparaciones con otros agentes GUI móviles de tamaño similar; los únicos puntos de comparación son las variantes del mismo modelo.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de no dejarlo actuar sin supervisión en un teléfono con cuentas reales, mensajes o pagos.
- Éxito de tarea bajo: completó 3 de 11 tareas cotidianas en el teléfono; los fallos son coherentes con debilidades conocidas como bucles de `wait`, parar demasiado pronto o demasiado tarde y responder sin mirar la pantalla.
- Forma de pantalla fija: las pantallas cuya redimensión de entrenamiento no sea 1280 × 576 (otras relaciones de aspecto, horizontal, plegables) se estiran; hay que redimensionar con bicúbica para evitar el estiramiento del runtime.
- Idioma: solo inglés.
- Contexto limitado a 4.096 tokens, con unos 1.300 consumidos por paso, lo que restringe la profundidad de la trayectoria (últimos 8 pasos en el prompt).
- Licencia LFM Open License v1.0: es necesario revisar el archivo LICENSE para las condiciones de uso comercial, ya que la licencia se hereda de LiquidAI/LFM3-VL-2B y no se detallan aquí sus términos.
- Riesgo de alucinación de acciones y coordenadas en pantallas no vistas durante el entrenamiento; la paridad numérica se verificó solo en el conjunto de test de AndroidControl.
- Rendimiento medido en un único modelo de teléfono; no hay garantía de latencia o paridad en otros dispositivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-LiteRT
- Modelo base (v4, bf16): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio de la app Android y receta de conversión: https://github.com/ExperimentalMachines/mobile-agent
- Repositorio de investigación (entrenamiento y benchmarks): https://github.com/experimentalmachines/lfm3-mobile-agent
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
