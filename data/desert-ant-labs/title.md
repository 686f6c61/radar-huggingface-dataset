# desert-ant-labs/title

## Resumen

Title es un modelo de lenguaje especializado en la generación automática de títulos y descripciones breves a partir de cualquier pasaje de texto. Lo desarrolla Desert Ant Labs y se distribuye como parte de su SDK multiplataforma (desert-ant-core) para iOS, macOS, tvOS, visionOS y Android. El modelo resuelve un problema muy concreto: producir un título factual de entre 3 y 8 palabras y una descripción de una o dos frases, con un registro deliberadamente plano (sin emojis, sin hashtags, sin clickbait), pensado para ejecutarse íntegramente en el dispositivo.

Con 352 millones de parámetros totales, Title es un modelo pequeño orientado a inferencia local. Se distribuye en dos formatos: pesos MLX cuantizados a 6 bits para plataformas Apple y un bundle LiteRT-LM con cuantización int8 para Android. El contexto es de 1.280 tokens y la generación está limitada a 96 tokens por respuesta en Android. Su relevancia actual radica en que demuestra un patrón de despliegue on-device muy específico: un modelo afinado para una única tarea, empaquetado con su tokenizador y plantilla de chat, y consumido a través de SDKs nativos en lugar de APIs remotas.

La licencia es propietaria de tipo source-available (desert-ant-labs-source-available), lo que condiciona su uso comercial. El modelo está afinado sobre transcripciones de clips, aunque el autor indica que funciona razonablemente bien con párrafos de noticias, descripciones de productos y correos electrónicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoEHybrid (según tag del repositorio; detalles de capas no disponibles) |
| Parametros totales | 352.379.904 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.280 tokens |
| Tipos de cuantizacion | 6 bits (MLX, Apple) e int8 (LiteRT-LM, Android) |
| Idiomas soportados | Multilingüe (sin listado explícito de idiomas) |
| Licencia | desert-ant-labs-source-available (propietaria, source-available) |
| Formato de pesos | safetensors (MLX, 6 bits) y .litertlm (LiteRT-LM, int8) |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo como `granitemoehybrid`, lo que sugiere una arquitectura híbrida de mezcla de expertos derivada de la familia Granite de IBM, aunque la model card no detalla el número de expertos, la proporción de parámetros activos ni la composición exacta de las capas. El tamaño total de 352 millones de parámetros y el contexto de 1.280 tokens son coherentes con un modelo diseñado para ejecución local en dispositivos móviles, no para cargas de trabajo de servidor.

El autor indica que Title está afinado sobre transcripciones de clips y que se entrenó contra una plantilla de chat concreta, que debe conservarse tal cual porque modificarla altera la tarea que realiza el modelo. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable no está en la arquitectura sino en el empaquetado: pesos cuantizados por plataforma (6 bits en MLX, int8 en LiteRT-LM), tokenizador BPE a nivel de byte y metadatos de tokens de parada incluidos en el bundle de Android.

## Capacidades

- Generación de títulos factuales de 3 a 8 palabras sin puntuación final.
- Generación de descripciones de una o dos frases que identifican el pasaje concreto, no su tema genérico.
- Resumen de pasajes de texto con registro plano, sin emojis, hashtags ni clickbait.
- Generación en el idioma del pasaje de entrada (comportamiento multilingüe).
- Procesamiento por lotes de clips con alineación de índices mediante `cards(for:)`.
- Ejecución on-device: GPU vía MLX en Apple, CPU vía LiteRT-LM en Android.
- Gestión del ciclo de vida en iOS mediante `suspend()` y `resume()` para la pérdida de acceso a GPU en segundo plano.
- No dispone de tool calling, function calling, modo thinking, visión ni audio según la información disponible.

## Casos de uso

- Titulado automático de clips de audio y vídeo: el modelo se afinó específicamente sobre transcripciones de clips, por lo que es el escenario de mayor precisión; se integra con la API `cards(for:)` para generar una tarjeta por clip en el mismo orden que la entrada.
- Organización de bibliotecas de podcasts: dado el contexto de 1.280 tokens, se puede pasar la transcripción de un segmento y obtener título y descripción para cada episodio o capítulo sin salir del dispositivo.
- Etiquetado de notas de voz en apps móviles: al ejecutarse en CPU en Android con una mediana de 1,20 s por tarjeta, encaja en flujos de captura donde el usuario graba y la app genera metadatos en segundo plano.
- Resumen de correos electrónicos: el autor indica que el modelo produce tarjetas precisas para correos; útil en clientes de email que muestran una línea de asunto enriquecida y una descripción corta.
- Fichas de producto en catálogos: para descripciones de productos, el modelo genera un título corto y una descripción de una o dos frases que identifica el artículo concreto.
- Titulado de párrafos de noticias: en agregadores o lectores RSS, el modelo puede generar títulos alternativos y sumarios breves respetando el registro plano solicitado.
- Procesamiento por lotes en apps de edición de vídeo: la API `cards(for:)` serializa las generaciones porque una sola ya satura la GPU; evita el sobrecalentamiento en móviles durante vídeos largos.
- Privacidad por diseño: al no requerir red, es adecuado para aplicaciones que procesan texto sensible (correos, notas personales) y no pueden enviar contenido a servidores externos.

## Benchmarks y rendimiento

| Escenario | Plataforma | Resultado |
|---|---|---|
| Mediana por tarjeta, 220 clips de transcripción | Nothing Phone (3), CPU, LiteRT-LM | 1,20 s (excluyendo carga del modelo) |
| Clips en escritura latina con ambos campos generados | Android | 99,4% de 180 clips |
| Clips en escritura no latina con ambos campos generados | Android | 17,5% de 40 clips |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el bundle Android ocupa 364 MB y, junto con la caché de pesos en CPU, unos 720 MB en ARM64.
- Repositorio completo en Hugging Face: 1,0 GB.
- Apple: ejecución en GPU mediante MLX; requiere el trait `MLX` en el paquete Swift, sin el cual el módulo compila como stub.
- Android: ejecución en CPU mediante LiteRT-LM; el bundle incluye modelo int8, tokenizador y metadatos de tokens de parada.
- Cabe en dispositivos móviles de gama media; el benchmark de referencia se ejecutó en un Nothing Phone (3).
- Opciones de despliegue: SDK propietario `desert-ant-core` (Swift Package Manager para Apple, BOM de Maven `ai.desertant:bom:6.0.0` para Android). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 1,20 s por tarjeta en CPU Android para clips de transcripción; no se publican datos de throughput en Apple.
- En iOS es obligatorio llamar a `suspend()` antes de pasar a segundo plano porque el sistema revoca el acceso a GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (generación de títulos on-device) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El modelo a veces abre la descripción con una frase de relleno que su propia instrucción prohíbe; el autor recomienda revisar cada tarjeta antes de mostrarla al usuario.
- Puede equivocarse en detalles con prosa general; es más preciso en transcripciones de clips, párrafos de noticias, descripciones de productos y correos.
- Con entradas inusuales puede seguir generando hasta alcanzar el límite de tokens de respuesta (96 por defecto); en Swift se controla con `maxTokens`.
- El rendimiento en escrituras no latinas es muy inferior: solo el 17,5% de los clips no latinos generaron ambos campos en el benchmark de Android, frente al 99,4% de los latinos.
- El contexto está limitado a 1.280 tokens; los pasajes largos se truncan para ajustarse.
- La plantilla de chat debe mantenerse tal cual se distribuye; modificarla cambia la tarea del modelo.
- El parseo de la respuesta debe ser tolerante: si no hay etiquetas, el SDK toma la primera línea como título.
- La licencia es propietaria source-available; es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial.
- No se documentan sesgos específicos, pero al ser un modelo multilingüe afinado sobre un corpus no detallado, es razonable esperar un sesgo hacia el inglés y los registros presentes en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/title
- Pesos v0.2.0: https://huggingface.co/desert-ant-labs/title/tree/v0.2.0
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Documentación de origen del modelo: https://github.com/Desert-Ant-Labs/desert-ant-core (docs/models/title.md)
- Licencia: https://license.desertant.com/
