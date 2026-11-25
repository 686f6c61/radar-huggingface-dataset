# clearstep-cue/phonon-voice

## Resumen

Phonon 31m (English) es un bundle de Core ML para síntesis de voz (text-to-speech) en dispositivo, distribuido por clearstep-cue como redistribución del export oficial de Gradium. No se trata de un modelo original: el repositorio aloja los ficheros del modelo `gradium/phonon-31m-en` empaquetados en formato Core ML, recortados a dos voces concretas (`Delia` y `Trevor`) de las 38 que incluye el export publicado. El objetivo es que una app iOS pueda descargar los ficheros en las rutas relativas que indica `bundle.json`, algo que un zip de release no permite.

El modelo subyacente es Phonon 31m, un TTS de aproximadamente 31 millones de parámetros construido sobre Pocket TTS de Kyutai y el códec Mimi. Su relevancia radica en el despliegue on-device: al estar exportado a Core ML, puede ejecutarse localmente en hardware Apple sin depender de servicios en la nube, lo que reduce latencia y evita enviar texto del usuario a servidores externos.

La ficha se basa únicamente en la información del repositorio y de la model card. No hay datos publicados sobre arquitectura interna detallada, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en Pocket TTS de Kyutai y el codec Mimi (detalles internos no disponibles) |
| Parametros totales | 31 millones (según nombre del modelo, no verificado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export Core ML; no se documentan variantes) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (bundle con `bundle.json`, ficheros verificados por SHA-256) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo más allá de indicar que Phonon se construye sobre Pocket TTS de Kyutai y el codec Mimi. Se trata, por tanto, de un sistema de síntesis de voz que emplea un codec neural (Mimi) para representar audio y un modelo generativo sobre esas representaciones. El tamaño declarado en el nombre es de 31 millones de parámetros, lo que lo sitúa en la categoría de modelos muy pequeños, adecuados para inferencia en dispositivo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del propio empaquetado Core ML y del recorte de voces. El repositorio de clearstep-cue no modifica pesos, código ni configuración: solo elimina 36 de las 38 voces del export original y ajusta `bundle.json` en sus listas `files` y `voices`, manteniendo los tamaños y sumas SHA-256 verificados.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- Dos voces disponibles: `Delia` y `Trevor`.
- Ejecución on-device mediante Core ML, sin necesidad de conexión a un servicio remoto.
- Integración en apps iOS a través de las rutas relativas declaradas en `bundle.json`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step (no aplica a un modelo TTS).
- No se documentan capacidades multilingües más allá del inglés.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Lectura de contenido en apps iOS: el bundle permite convertir texto de artículos, notificaciones o mensajes en voz dentro de la propia app, sin llamadas a red, gracias al formato Core ML y a las dos voces incluidas.
- Accesibilidad para usuarios con discapacidad visual: integración de la síntesis local para leer pantallas o documentos, con latencia baja al ejecutarse en el dispositivo y sin exponer el texto del usuario a terceros.
- Asistentes de voz offline: apps que necesitan respuestas habladas en entornos sin conectividad (por ejemplo, zonas rurales o vuelos) pueden usar el bundle embebido o descargado bajo demanda.
- Aprendizaje de idiomas: reproducción de frases en inglés con voces consistentes (`Delia` y `Trevor`) para ejercicios de escucha y repetición, sin coste por petición de API.
- Prototipado de interfaces conversacionales: desarrolladores que quieren evaluar un TTS on-device en iOS antes de comprometerse con un proveedor cloud, usando el repositorio como fuente de ficheros en las rutas esperadas por su app.
- Privacidad en aplicaciones sanitarias o financieras: al no requerir envío de texto a servidores, el bundle encaja en flujos donde el contenido es sensible y debe permanecer en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de 31 millones de parámetros y un export Core ML, el requisito de memoria es bajo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el destino declarado es hardware Apple compatible con Core ML (iPhone, iPad, Mac con Neural Engine o GPU integrada), sin que se especifiquen modelos.
- Cabe en consumer GPU: el formato Core ML está orientado a dispositivos Apple; no se documenta soporte para GPU NVIDIA o AMD.
- Opciones de despliegue: Core ML en iOS/macOS; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| clearstep-cue/phonon-voice | 31 M (según nombre) | no disponible | en | Apache 2.0 | Core ML | Hugging Face |
| gradium/phonon-31m-en | 31 M (según nombre) | no disponible | en | Apache 2.0 | Core ML (export completo, 38 voces) | Hugging Face |
| Alternativas TTS on-device | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos TTS on-device no está disponible en la información proporcionada. La diferencia principal frente al export original de Gradium es el recorte de 38 a 2 voces y la edición de `bundle.json`; los pesos y el código son idénticos.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Solo incluye dos voces (`Delia` y `Trevor`); cualquier necesidad de más voces requiere acudir al export original de Gradium.
- No es trabajo original: es una redistribución; los pesos, el código y la configuración no han sido modificados por clearstep-cue.
- El formato Core ML limita el despliegue a hardware y sistemas Apple; no es portable a otras plataformas sin conversión adicional.
- No se documentan sesgos, tasas de alucinación ni comportamiento en dominios específicos; al ser un TTS, el riesgo principal es la pronunciación incorrecta o la prosodia inadecuada, no la generación de contenido falso.
- No se documentan límites de longitud de texto por inferencia ni requisitos de memoria en la model card.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo fuente `gradium/phonon-31m-en` y del códec Mimi subyacente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/clearstep-cue/phonon-voice
- Modelo fuente: https://huggingface.co/gradium/phonon-31m-en
- Catálogo de voces: https://huggingface.co/gradium/phonon-voices
- Release del export Core ML: https://github.com/gradium-ai/xn-ptts (release v0.7.1, asset `phonon-31m-en-coreml.zip`)
- Pocket TTS de Kyutai: no disponible en la información proporcionada
- Códec Mimi: no disponible en la información proporcionada
