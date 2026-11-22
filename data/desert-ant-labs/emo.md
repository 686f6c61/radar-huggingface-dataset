# desert-ant-labs/emo

## Resumen

Emo es un clasificador de texto multilingüe especializado en la sugerencia de emojis a partir de frases cortas que expresan una intención, como entradas de agenda, notas o borradores de mensajes. Lo desarrolla Desert Ant Labs y se distribuye a través de Hugging Face con el pipeline `text-classification`. Su propuesta de valor es la inferencia totalmente en dispositivo: el modelo y el tokenizador ocupan 5 MB en Apple vía Core ML y 11 MB en el resto de plataformas vía LiteRT, con latencias inferiores a 2 ms.

El modelo cubre 22 idiomas, incluidos CJK, árabe, tailandés e hindi, y asigna una probabilidad a cada una de las 812 etiquetas de emoji de su vocabulario. Está pensado para integrarse en SDK nativos de Swift, Kotlin y JavaScript, con soporte para iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.

Es relevante ahora por su enfoque de eficiencia extrema y despliegue local, que evita depender de servicios en la nube para una funcionalidad de UX cotidiana. La versión actual de pesos es v0.7.0 y la licencia es source-available con requisito de licencia comercial a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador de texto; pesos en LiteRT/TFLite int8 y Core ML compilado) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (optimizado para texto corto que expresa una intención) |
| Tipos de cuantizacion | int8 (fichero `emo.tflite`); Core ML compilado (`emo.mlmodelc`) |
| Idiomas soportados | 22: ar, cs, da, de, en, es, fr, hi, id, it, ja, ko, nl, pl, pt, ru, sv, th, tr, uk, vi, zh |
| Licencia | Desert Ant Labs Source-Available License (gratuita para la mayoría de apps, licencia comercial requerida a escala) |
| Formato de pesos | TFLite int8 (10,2 MB), Core ML compilado (4,6 MB), tokenizador Unigram (`emo_tokenizer.bin`, 0,75 MB), `emo_meta.json` |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo (tipo de transformer, número de capas, dimensión oculta o número de parámetros) en la información proporcionada. La model card indica únicamente que se trata de un clasificador de texto que produce una distribución de probabilidad sobre 812 emojis, con pesos exportados a LiteRT/TFLite en int8 y a Core ML compilado para plataformas Apple. El tokenizador es de tipo Unigram y se distribuye como fichero binario aparte (`emo_tokenizer.bin`).

 tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo está ajustado para texto corto con intención explícita y que la calidad varía según el idioma, siendo algo más débil en los idiomas de menores recursos del conjunto. Las versiones anteriores (v0.6.0 y anteriores) usaban `Emo.mlmodelc` y `emo.safetensors`, lo que sugiere una migración desde safetensors hacia formatos compilados específicos por plataforma.

## Capacidades

- Clasificación de texto multietiqueta: asigna probabilidad a cada uno de los 812 emojis del vocabulario y devuelve las mejores sugerencias con su confianza.
- Sugerencia de emojis a partir de frases cortas que expresan una intención ("Pagar facturas", "Reservar un vuelo para Tokio", "Pasear al perro").
- Soporte de tonos de piel: la API permite especificar `skinTone` (por ejemplo `EmojiSkinTone.MEDIUM`) y devuelve la variante correspondiente.
- Limitación configurable del número de sugerencias mediante el parámetro `limit`.
- Multilingüe: 22 idiomas, incluidos chino simplificado y tradicional, japonés, coreano, árabe, tailandés, hindi, vietnamita y ucraniano.
- Inferencia en dispositivo: funciona sin conexión una vez descargados los pesos, con latencias inferiores a 2 ms.
- Despliegue multiplataforma mediante SDK nativos: Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android), JavaScript (navegador y Node con subruta `/native` precompilada para linux-x64, linux-arm64 y darwin-arm64).
- Gestión de descarga y caché de pesos integrada en el SDK, con posibilidad de precarga durante el onboarding o de empaquetar los pesos localmente.
- No dispone de generación de texto, razonamiento multi-paso, tool calling ni capacidades de visión o audio.

## Casos de uso

- Autocompletado de emojis en apps de mensajería: al escribir un borrador corto, el modelo sugiere el emoji adecuado en menos de 2 ms, integrándose en el teclado o en la barra de sugerencias sin llamadas a red.
- Enriquecimiento de entradas de calendario y recordatorios: frases como "Dentista" o "Reservar un vuelo para Tokio" se traducen automáticamente en 🦷 o ✈️, mejorando la legibilidad visual de la agenda.
- Etiquetado visual de notas y listas de tareas: la app puede asignar emojis a cada ítem de una lista de tareas pendientes para facilitar el escaneo rápido, con funcionamiento offline.
- Personalización de notificaciones: el SDK permite asociar un emoji representativo a cada notificación o recordatorio en función del texto, manteniendo coherencia visual en iOS, Android y web.
- Procesamiento por lotes en backend Node: usando la subruta `/native`, un servicio puede clasificar grandes volúmenes de textos cortos (por ejemplo, títulos de eventos o asuntos de correo) y enriquecerlos con emojis antes de enviarlos.
- Aplicaciones de accesibilidad: sugerir emojis a partir de descripciones breves ayuda a usuarios con dificultades de selección manual en teclados de emojis, reduciendo pasos de interacción.
- Filtrado y moderación de contenido: la distribución de probabilidad sobre 812 emojis puede usarse como señal auxiliar para detectar tono o intención en textos muy cortos, aunque con las limitaciones propias de un clasificador de emojis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara latencias inferiores a 2 ms en dispositivo y tamaños de artefacto de 5 MB (Core ML) y 11 MB (LiteRT), sin métricas de precisión, recall o exactitud por idioma.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está diseñado para ejecución en CPU/NPU en dispositivo. Los pesos ocupan 4,6 MB (Core ML) y 10,2 MB (TFLite int8), más 0,75 MB del tokenizador.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo corre en hardware móvil y de escritorio convencional. En servidores Node puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: innecesaria; no hay indicación de que se beneficie de RTX 4090, A100 o H100, y no se documentan requisitos de aceleración por GPU.
- Opciones de despliegue: SDK Swift (Core ML en Apple), SDK Kotlin (LiteRT en Android), SDK JavaScript (LiteRT.js en navegador y núcleo nativo precompilado para Node en linux-x64, linux-arm64 y darwin-arm64). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la model card declara menos de 2 ms por inferencia en dispositivo; no se proporcionan cifras de throughput agregado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los clasificadores de emojis multilingües en dispositivo de código abierto con licencia permisiva son poco comunes, y no se han identificado alternativas concretas con parámetros, contexto o rendimiento verificables en la información disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Emo (desert-ant-labs) | No disponible | No disponible (texto corto) | 22 | Source-available (comercial a escala) | TFLite int8, Core ML |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Está ajustado para texto corto que expresa una intención; con textos más largos las sugerencias se vuelven más ruidosas.
- Los significados de los emojis son imprecisos por naturaleza, por lo que es habitual encontrar casi-empates entre las primeras sugerencias; conviene presentar varias opciones al usuario.
- La calidad varía según el idioma y es algo más débil en los idiomas de menores recursos del conjunto de 22.
- No genera texto, no razona en múltiples pasos y no ofrece tool calling, visión ni audio; su alcance funcional es exclusivamente la clasificación de texto en emojis.
- La licencia es source-available, no open source: es gratuita para la mayoría de aplicaciones, pero requiere licencia comercial a escala. Es necesario revisar los términos completos antes de un uso comercial.
- No se documentan sesgos específicos, pero al tratarse de un clasificador entrenado sobre texto multilingüe cabe esperar sesgos culturales en la asociación entre conceptos y emojis.
- El riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de sugerencias semánticamente incorrectas o ambiguas, especialmente en frases cortas o idiomas de bajos recursos.
- Depende de la descarga inicial de pesos desde Hugging Face o de empaquetarlos manualmente; en entornos sin red es necesario preinstalar los artefactos.
- Las versiones anteriores del SDK usaban `emo.safetensors`; la compatibilidad con revisiones antiguas debe verificarse antes de migrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/emo
- Pesos v0.7.0: https://huggingface.co/desert-ant-labs/emo/tree/v0.7.0
- Demo en vivo (Space): https://huggingface.co/spaces/desert-ant-labs/emo-demo
- Demo oficial: https://desertant.com/models/emo/
- Repositorio principal: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación del SDK Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Documentación del SDK Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Documentación del SDK JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descargas y caché de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Licencia: https://license.desertant.com/
- Contacto de licencias: licensing@desertant.com
- Avisos de terceros: https://huggingface.co/desert-ant-labs/emo/blob/main/THIRD_PARTY_NOTICES.md
