# aether-models/phi-4-mini-instruct

## Resumen

Aether-models/phi-4-mini-instruct es un empaquetado del modelo microsoft/Phi-4-mini-instruct preparado por aether-models para el SDK Aether, un runtime de IA en el dispositivo (on-device) para iOS y macOS 27 o superior. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión de los pesos originales de PyTorch al formato Core AI (`.aimodel`), con una receta interna denominada `phi-4-mini-instruct@2`, tomando como fuente la revisión `cfbefacb99257ffa30c83adab238a50856ac3083` del repositorio de Microsoft.

El bundle se publica en dos variantes. La primera, `macos-any-gpu`, se distribuye sin compilar y se especializa en la primera carga para cualquier GPU de Apple. La segunda, `ios-h18p-gpu`, está compilada (`.aimodelc`) para el SoC identificado como `h18p` y exige el entitlement `com.apple.developer.kernel.increased-memory-limit`. Ambos variantes pesan 4,08 GB (4,1 GB de descarga) y usan cuantización int8 linear per-block 32, es decir, pesos de 8 bits agrupados en bloques de 32 elementos.

La relevancia de esta ficha es acotada y muy específica: es la vía práctica para ejecutar un modelo de la familia Phi-4 en aplicaciones iOS y macOS a través del SDK Aether, con licencia MIT y verificación de paridad estricta publicada por el autor. El repositorio no declara idiomas soportados, no publica benchmarks de calidad (MMLU, HumanEval, GSM8K) y, en el momento de redactar esta ficha, acumula 0 descargas y 0 me gusta, por lo que debe considerarse una publicación reciente y sin adopción verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base microsoft/Phi-4-mini-instruct, empaquetada en formato Core AI. La model card del bundle no detalla número de capas, cabezas de atención ni dimensión oculta |
| Parámetros totales | 3,8 mil millones (dato de la documentación pública del modelo base; no declarado en la model card del bundle) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128.000 tokens (dato del modelo base; no declarado en la model card del bundle) |
| Tipos de cuantización | int8 linear per-block 32 (pesos de 8 bits en bloques de 32). El autor indica que la referencia sin cuantizar no se publica |
| Idiomas soportados | No disponible en la model card del bundle. El modelo base declara soporte multilingüe con inglés como idioma principal |
| Licencia | MIT (incluida como fichero `LICENSE` en el repositorio) |
| Formato de pesos | `.aimodel` (variante macOS, sin compilar) y `.aimodelc` (variante iOS, compilada). No se publican safetensors ni GGUF |
| Tamaño de pesos | 4,08 GB por variante; 4,1 GB de descarga por variante; 8,2 GB de repositorio completo |
| Pipeline declarado | text-generation |
| Modelo base | microsoft/Phi-4-mini-instruct (revisión `cfbefacb99257ffa30c83adab238a50856ac3083`) |
| Fecha de creación | 2026-09-30 |
| Última actualización | 2026-09-30 |

## Arquitectura y entrenamiento

Este repositorio no documenta ningún entrenamiento propio. El autor declara explícitamente que los únicos cambios respecto a la fuente son la conversión de PyTorch a Core AI mediante su pipeline interno (`phi-4-mini-instruct@2`) y la cuantización a int8 linear per-block 32. Los ficheros del tokenizador son los del modelo original, sin modificaciones. Por tanto, cualquier innovación en arquitectura o en datos de entrenamiento procede del trabajo de Microsoft sobre Phi-4-mini-instruct y debe consultarse en la model card del modelo base, no en este bundle.

El detalle técnico diferencial de este repositorio es el esquema de verificación. Cada variante publicada tiene registros en el directorio `verification/`, vinculados por digest del bundle, y existe un conjunto de filas de referencia que corresponden a pases T2 estrictos de la exportación sin cuantizar sobre el mismo fixture (`e6d8aa51e5bbd5c4`). Esto significa que el autor valida que la versión cuantizada a 8 bits reproduce el comportamiento de la versión sin cuantizar sobre un conjunto fijo de 20 pruebas, con resultado 20/20 estricto tanto en macOS como en iOS. Es una verificación de equivalencia funcional, no una evaluación de calidad del modelo.

## Capacidades

Las capacidades funcionales son las heredadas de microsoft/Phi-4-mini-instruct; la model card de este bundle no las enumera y solo declara la etiqueta `text-generation`. Se listan a continuación con la advertencia de que proceden de la documentación del modelo base:

- Generación de texto e instrucciones en formato conversacional multi-turno.
- Razonamiento de propósito general y resolución de problemas de matemáticas de nivel escolar y universitario básico.
- Generación y explicación de código en lenguajes habituales.
- Soporte declarado de function calling / tool calling por parte del modelo base.
- Ventana de contexto de 128.000 tokens, apta para documentos largos, según el modelo base.
- Capacidad multilingüe limitada, con inglés como idioma principal, según el modelo base.
- Ejecución local en el dispositivo mediante el SDK Aether, sin dependencia de red, con API en Swift (`aether.chat(...)` y `respond(to:)`) y una CLI (`aether run phi-4-mini-instruct --prompt "Hello"`).
- No se declara soporte de visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales offline en aplicaciones iOS: el modelo se ejecuta íntegramente en el dispositivo con la variante `ios-h18p-gpu`, de modo que ninguna consulta del usuario sale del terminal, lo que simplifica el cumplimiento de requisitos de privacidad y evita costes de inferencia en servidor.
- Resumen y análisis de documentos largos en macOS: los 128.000 tokens de contexto del modelo base permiten procesar informes, contratos o transcripciones completas en una sola pasada dentro de una aplicación de escritorio, sin troceado ni pérdida de contexto entre fragmentos.
- Extracción de entidades y clasificación de texto en aplicaciones nativas: al estar cuantizado a 8 bits y ocupar 4,08 GB, puede integrarse en flujos de preprocesado que etiqueten tickets, correos o formularios localmente antes de enviar solo los campos relevantes a un backend.
- Asistencia de escritura y autocompletado contextual: integrado en un editor de macOS, el modelo puede reescribir párrafos, corregir estilo o completar borradores manteniendo baja latencia al no requerir llamadas de red.
- Agentes locales con function calling: dado que el modelo base declara soporte de tool calling, puede orquestar acciones sobre APIs del sistema o servicios de la propia aplicación en varios pasos, con la ventaja de que las decisiones se toman en el dispositivo.
- Ayuda a la programación en entornos de desarrollo para Mac: generación de fragmentos de código, explicación de funciones y propuesta de pruebas dentro de un IDE, reutilizando las capacidades de código del modelo base.
- Herramientas de accesibilidad: reformulación de texto, simplificación de lenguaje y descripción de contenido escrito en aplicaciones de lectura, con funcionamiento garantizado sin conectividad.
- Prototipado rápido con el SDK Aether: la CLI y la API Swift permiten validar un flujo de producto en pocas líneas antes de decidir si se migra a un modelo mayor o a un despliegue en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica registros de verificación de equivalencia entre la versión cuantizada y la referencia sin cuantizar:

| Variante | Tier | Resultado | Detalle | Dispositivo | Build de SO | Registro |
|---|---|---|---|---|---|---|
| ios-h18p-gpu | T0 | pass | Sin detalle adicional | iPhone18,2 | 24A446 | 799a7472 |
| ios-h18p-gpu | T2 | pass | 20/20 estricto; perfil quantized-8bit; fixture e6d8aa51e5bbd5c4 | iPhone18,2 | 24A446 | 56352841 |
| macos-any-gpu | T0 | pass | Sin detalle adicional | Mac17,6 | 26A434 | f8ec071b |
| macos-any-gpu | T1 | pass | Sin detalle adicional | Mac17,6 | 26A434 | 06f8b021 |
| macos-any-gpu | T2 | pass | 20/20 estricto (doble comprobación); perfil quantized-8bit; fixture e6d8aa51e5bbd5c4 | Mac17,6 | 26A434 | d86a849c |
| Referencia sin cuantizar (no publicada) | T2 | pass | 20/20 estricto (doble comprobación); perfil strict; fixture e6d8aa51e5bbd5c4 | Mac17,6 | 26A434 | 998a7aa8 |

El autor señala además que el perfil cuantizado exige un pase T2 estricto sobre la exportación de referencia sin cuantizar, requisito cubierto por la fila de referencia. No se publican cifras de latencia, tokens por segundo ni consumo energético.

## Requisitos de hardware

- Variante `macos-any-gpu`: 4,08 GB de pesos. Se ejecuta sobre cualquier GPU soportada por Core AI en macOS. Al no estar compilada, se especializa en la primera carga, lo que implica un coste inicial mayor no cuantificado por el autor.
- Variante `ios-h18p-gpu`: 4,08 GB de pesos. Requiere el SoC identificado como `h18p` en la model card y el entitlement `com.apple.developer.kernel.increased-memory-limit`, imprescindible para reservar la memoria necesaria en iOS.
- Descarga: 4,1 GB por variante; 8,2 GB si se clonan ambas con el resto del repositorio.
- Sistemas operativos validados: builds 24A446 (iOS) sobre iPhone18,2 y 26A434 (macOS) sobre Mac17,6. El repositorio indica compatibilidad con iOS y macOS 27 o superior a través del SDK Aether.
- No hay soporte para GPU NVIDIA, AMD ni Intel: el formato `.aimodel` es específico de Core AI y no es convertible a safetensors ni GGUF desde este repositorio.
- No hay soporte para vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia. Para esos entornos debe usarse el modelo base microsoft/Phi-4-mini-instruct, fuera de este bundle.
- No se publican datos de latencia, throughput ni memoria pico durante la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Cuantización | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|---|---|
| aether-models/phi-4-mini-instruct | 3,8 mil millones (modelo base) | 128.000 tokens (modelo base) | `.aimodel` / `.aimodelc` | int8 linear per-block 32 | MIT | Core AI (Aether SDK), solo Apple | 2 variantes, 0 descargas |
| microsoft/Phi-4-mini-instruct | 3,8 mil millones | 128.000 tokens | safetensors, PyTorch | FP16/BF16 en el repositorio original | MIT | transformers, vLLM, llama.cpp y otros | Público y ampliamente distribuido |
| Otros modelos de la misma categoría (por ejemplo, alternativas densas de 2 a 4 mil millones de parámetros) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es directa: este bundle es una conversión del segundo modelo de la tabla. Frente al original, gana ejecución nativa en Apple Core AI con verificación de paridad publicada, y pierde portabilidad, ya que no se puede desplegar en servidores con CUDA ni en toolchains de la comunidad que esperan safetensors o GGUF.

## Limitaciones y advertencias

- Modelo sin adopción verificable: 0 descargas y 0 me gusta en el momento de la consulta, con fecha de creación 2026-09-30 y última actualización el mismo día. No hay evidencia de uso en producción.
- No se publican benchmarks de calidad del modelo base ni de esta conversión. La verificación T2 20/20 demuestra equivalencia con la referencia sin cuantizar sobre un fixture concreto, no calidad absoluta.
- La cuantización int8 linear per-block 32 puede introducir degradación respecto al modelo en FP16/BF16 en tareas sensibles, aunque el autor no reporta la magnitud de esa diferencia.
- Idiomas soportados no declarados en la model card del bundle. Debe asumirse rendimiento inferior al inglés en castellano y en otras lenguas, siguiendo el comportamiento típico del modelo base.
- Riesgo de alucinación inherente a un modelo denso de 3,8 mil millones de parámetros, especialmente en preguntas factuales, citas y cálculos largos.
- Sesgos heredados del corpus de entrenamiento del modelo base, no evaluados ni mitigados en este repositorio.
- Ligado al ecosistema Apple: requiere Core AI, macOS 27+ o iOS 27+, y en iOS el entitlement de memoria ampliada. No es ejecutable en Linux, Windows ni Android.
- Sin formatos alternativos: no hay safetensors, GGUF ni ONNX, lo que impide usar el bundle en pipelines existentes de terceros.
- El repositorio completo ocupa 8,2 GB aunque cada variante pesa 4,08 GB; conviene descargar selectivamente.
- Licencia MIT: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia. No impone restricciones de uso, pero tampoco ofrece garantías.
- La fecha de creación y de actualización es futura respecto a muchas fechas de referencia habituales; conviene verificar la vigencia del bundle antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aether-models/phi-4-mini-instruct
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Revisión del modelo base usada como fuente: `cfbefacb99257ffa30c83adab238a50856ac3083`
- Paper, blog o repositorio del SDK Aether: no disponible en la información proporcionada.
- Demos, espacios o documentación adicional del autor: no disponibles en la información proporcionada.
