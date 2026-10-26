# itsmechico/phonon-core-runtime

## Resumen

`itsmechico/phonon-core-runtime` no es un modelo de pesos, sino un artefacto de distribución binaria: el núcleo compilado en Rust de xn-ptts 0.4.2 empaquetado como `PhononCore.xcframework` para Core ML, con soporte para iPhone, simulador de iOS, Macs con Apple silicon y Mac Catalyst. Lo publica el usuario itsmechico bajo licencia Apache 2.0 y su tamaño de repositorio es de 0,1 GB. Su función es servir de motor de inferencia (runtime) para los bundles de síntesis de voz de la familia Phonon-40M exportados a Core ML.

La modificación respecto al xn-ptts original es concreta: el número de pasos de flujo (flow steps) por frame se elige en tiempo de ejecución mediante `ptts_set_steps`, y los bundles de `itsmechico/phonon-40m-*-coreml` incorporan un grafo `flow-step` que lo aprovecha. Esto permite ajustar el compromiso entre calidad de audio y coste computacional sin recompilar ni cambiar de binario.

Es relevante para quien despliegue TTS en el ecosistema Apple: permite integrar el motor vía Swift Package Manager con URL y checksum (InkearKit/Package.swift), algo útil para pipelines reproducibles. Conviene subrayar que este repositorio no contiene pesos, no declara pipeline ni idiomas, y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia compilado en Rust (xn-ptts 0.4.2), empaquetado como XCFramework para Core ML; no incluye pesos de modelo |
| Parámetros totales | No disponible (el repositorio no contiene pesos; los bundles asociados se denominan `phonon-40m-*`, lo que sugiere ~40M de parámetros en el modelo de destino) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (motor orientado a síntesis de voz, no a contexto textual) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles en este repositorio; el bundle hermano `phonon-40m-fr-coreml` declara 15 voces en francés |
| Licencia | Apache 2.0 (el código upstream xn-ptts 0.4.2 se distribuye como MIT o Apache 2.0) |
| Formato de pesos | XCFramework binario (`.xcframework`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio distribuye código compilado, no un modelo entrenado. Se trata de `PhononCore.xcframework`, generado por el script `ios/build-xcframework.sh` del proyecto xn-ptts 0.4.2 (desarrollado por gradium-ai), con una única modificación respecto al upstream: la incorporación de `ptts_set_steps`, que expone en la API el número de pasos de flujo por frame. El framework se compila para cuatro destinos (iPhone, simulador de iOS, Mac Apple silicon y Mac Catalyst) y se consume desde Swift comprobando checksum.

Los datos de entrenamiento, la composición del dataset y las fases de alineamiento o RLHF corresponden a los modelos Phonon-40M originales de Gradium, no a este artefacto, y no están documentados en la información disponible. La innovación técnica reseñable aquí es únicamente de despliegue: el grafo `flow-step` incluido en los bundles Core ML permite elegir en runtime el número de pasos por frame, de modo que una misma app puede degradar la calidad de síntesis para reducir latencia o consumo en dispositivos modestos. El parche aplicado se conserva como `tools/phonon-coreml/steps.patch` en el repositorio Inkear.

## Capacidades

- Motor de síntesis de voz (TTS) en dispositivo para las plataformas Apple indicadas, sirviendo los pesos de los bundles `phonon-40m-*-coreml`.
- Selección del número de pasos de flujo por frame en tiempo de ejecución mediante `ptts_set_steps` (control de calidad frente a coste).
- Soporte explícito de iPhone, simulador de iOS, Mac con Apple silicon y Mac Catalyst desde un único XCFramework.
- Integración con Swift Package Manager mediante URL y checksum, apta para builds reproducibles.
- Ejecución totalmente local: no requiere red ni servicios externos una vez integrado el bundle.
- No se documentan en este repositorio capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.

## Casos de uso

- Síntesis de voz offline en apps iOS: se integra el XCFramework junto con un bundle `phonon-40m-*-coreml` y el texto se convierte a audio en el dispositivo, sin llamadas a servidor ni coste por petición.
- Ajuste dinámico de calidad y latencia: en un mismo binario, la app puede invocar `ptts_set_steps` con valores bajos en respuestas interactivas (por ejemplo, confirmaciones cortas) y valores altos en contenidos pregrabados o narraciones largas.
- Lectura en voz alta y accesibilidad: el motor local permite ofrecer lectura de pantalla o contenido a usuarios con discapacidad visual sin depender de conectividad.
- Pruebas automatizadas en simulador de iOS: al compilarse también para el simulador, se pueden ejecutar tests de integración de audio en CI sin dispositivos físicos.
- Distribución reproducible en producción: la carga por URL con checksum desde `InkearKit/Package.swift` permite fijar la versión exacta del runtime y verificar su integridad en cada build.
- Aplicaciones de escritorio en Mac Apple silicon y Mac Catalyst: reutilización del mismo framework para asistentes de voz, doblaje local de contenido o interfaces manos libres.
- Sustitución de servicios de TTS en la nube por motivos de privacidad: el audio se genera localmente, de modo que el texto del usuario no sale del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se documentan métricas de latencia, RTF (real-time factor) ni throughput para este runtime.

## Requisitos de hardware

- Plataformas soportadas: iPhone (arm64), simulador de iOS, Macs con Apple silicon y Mac Catalyst.
- VRAM: no disponible. No se requiere GPU dedicada; Core ML distribuye la ejecución entre Neural Engine, GPU y CPU del SoC Apple.
- GPU recomendadas: no aplica en el sentido habitual (A100, H100, RTX 4090). El destino son los aceleradores integrados de los chips Apple; no se especifican generaciones mínimas.
- Cabe en hardware consumer: sí, por diseño (iPhone y Mac Apple silicon). No se indica la RAM mínima necesaria.
- Huella del artefacto: 0,1 GB de repositorio para el XCFramework; los pesos se descargan aparte desde los repositorios `phonon-40m-*-coreml`.
- Opciones de despliegue: Swift Package Manager con verificación de checksum (InkearKit/Package.swift), paquete Swift PhononTTS para los bundles Core ML. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el único control documentado es el número de pasos de flujo por frame en runtime.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `itsmechico/phonon-core-runtime` (este repo) | Runtime TTS compilado (XCFramework) | No contiene pesos | No aplica | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `itsmechico/phonon-40m-fr-coreml` | Bundle Core ML con pesos TTS (15 voces en francés) | ~40M (por el nombre del bundle) | No aplica | No disponible en la información | Hugging Face |
| `FermionResearch/Phonon-2` | Modelo de reconocimiento de voz (ASR), tarea distinta | No disponible | No disponible | No disponible en la información | Hugging Face, 164 MB de descarga |
| xn-ptts 0.4.2 (gradium-ai) | Código fuente del motor TTS upstream | No aplica | No aplica | MIT o Apache 2.0 | GitHub |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de TTS en dispositivo.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni pipeline declarado: por sí solo no genera voz, requiere un bundle Core ML compatible.
- No se declaran idiomas soportados; el soporte idiomático depende del bundle que se cargue (el hermano en francés declara 15 voces, pero no hay catálogo publicado para este runtime).
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de los metadatos.
- El artefacto incorpora un parche propio sobre xn-ptts (`steps.patch`); la compatibilidad con futuras versiones upstream no está garantizada.
- Licencia Apache 2.0 para el empaquetado, pero el código subyacente es MIT o Apache 2.0 de gradium-ai: conviene verificar las obligaciones de atribución antes de uso comercial.
- Dependencia estricta del ecosistema Apple y de Core ML; no hay build para Linux, Windows ni Android.
- Confusión de nomenclatura: «Phonon» designa tanto la familia de TTS de Gradium como el motor de reconocimiento de voz de Fermion Research; son proyectos distintos y no deben mezclarse en la documentación de producto.
- No hay métricas publicadas de calidad de audio, latencia ni consumo, por lo que la elección de valores de `ptts_set_steps` en producción exige evaluación propia.
- El repositorio no incluye tests ni ejemplos de uso más allá de la referencia a InkearKit.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/itsmechico/phonon-core-runtime
- Bundle Core ML hermano (francés): https://huggingface.co/itsmechico/phonon-40m-fr-coreml
- Código fuente upstream xn-ptts (gradium-ai): https://github.com/gradium-ai/xn-ptts
- Motor de reconocimiento de voz Phonon (Fermion Research): https://github.com/fermionresearch/phonon
- Modelo Phonon-2 (ASR): https://huggingface.co/FermionResearch/Phonon-2
- Artículo sobre Phonon en dispositivo (Laurence Moroney): https://laurencemoroney.com/2026/10/21/phonon-on-device-tts.html
- Fichero `v18_runtime.py` del repositorio de Fermion Research: https://github.com/fermionresearch/phonon/blob/main/v18_runtime.py
