# junmo-k/valen-4b-ane

## Resumen

Valen-4B-ANE es un paquete de despliegue portable del modelo Valen-Decision-1.5-4B, convertido por junmo-k para ejecutarse localmente sobre el Apple Neural Engine (ANE) mediante el runtime ANERun. No se trata de un entrenamiento nuevo, sino de una conversión del checkpoint upstream (commit 9b0cacc) orientada a inferencia nativa en hardware Apple Silicon, con soporte tanto para entradas de texto como de imagen. El modelo base pertenece a la familia Valen-Decision, un modelo de decisión multimodal de 4.000 millones de parámetros.

La relevancia de este artefacto es fundamentalmente de infraestructura: demuestra que un modelo de decisión de 4B puede ejecutarse en el ANE de un Mac mini de 16 GB con latencias de primera petición en torno a 0,7-1,4 segundos y peticiones en caliente de 0,4-0,8 segundos, manteniendo una concordancia numérica muy alta con la referencia (diferencia máxima de probabilidad de 0,000419). El bundle pesa 9,75 GB e incluye 101 assets y 141 funciones nativas compiladas.

La licencia es Apache-2.0, heredada del modelo upstream, y el formato de distribución no son pesos safetensors o GGUF convencionales, sino un bundle propietario consumido por ANERun. No hay información publicada sobre arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión multimodal; arquitectura interna no documentada) |
| Parametros totales | 4B (según el nombre del modelo base Valen-Decision-1.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (bundle nativo compilado para ANE, no cuantización estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | bundle propietario ANERun (assets + funciones nativas compiladas); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base Valen-Decision-1.5-4B: no se especifica si es un transformer denso, un MoE o un híbrido, ni se detallan capas, dimensiones ocultas o mecanismo de atención. Lo que sí se sabe es que el modelo es multimodal (procesa texto e imagen) y que su propósito es la toma de decisiones: la salida se estructura como decisiones con probabilidades por opción, no como generación de texto libre. El modelo card upstream, según la conversión, describe el entrenamiento y la calidad de tarea, pero esos detalles no están incluidos en la información proporcionada.

El artefacto Valen-4B-ANE es una conversión del checkpoint en el commit 9b0cacc de Valen-Team/Valen-Decision-1.5-4B. La conversión compila el modelo a un bundle ejecutable en el Apple Neural Engine: el instalador verifica 101 assets y 141 funciones nativas. La arquitectura cualificada es M4 `h16g`, probada en un Mac mini de 16 GB con macOS 27, Xcode 27.1 y el Metal Toolchain. No se documenta si hubo RLHF, DPO ni cuántos tokens se usaron en el entrenamiento original.

## Capacidades

- Toma de decisiones multimodal: procesa entradas de texto (70-110 tokens en las pruebas) e imágenes (133 tokens en la prueba) y devuelve decisiones con probabilidades por opción.
- Inferencia local en dispositivo: ejecución sobre el Apple Neural Engine sin necesidad de GPU externa ni conexión a servicios en la nube.
- Concordancia con la referencia: en las pruebas del autor, las 14 respuestas HTTP (primera y en caliente) coincidieron con las decisiones de referencia, con una diferencia máxima de probabilidad de 0,000419.
- Soporte de texto e imagen en el mismo runtime (multimodal).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, thinking mode, audio ni capacidades multilingües específicas.

## Casos de uso

- Clasificación y decisión local en macOS: integrar el modelo en una aplicación de escritorio para resolver decisiones discretas (selección de opciones, enrutamiento de peticiones) sin salir del dispositivo, aprovechando la latencia en caliente de 381-418 ms para texto.
- Procesamiento de documentos con imagen en el borde: usar la ruta multimodal (821 ms en caliente para una imagen de 133 tokens) para decidir sobre capturas, formularios escaneados o miniaturas en flujos locales de macOS.
- Automatización de escritorio con ANERun: desplegar el modelo con `anerun serve --model valen-4b` y consumirlo vía HTTP desde scripts o apps nativas, con el modelo cargado en el ANE y sin dependencias de servidores remotos.
- Prototipado de modelos de decisión en Apple Silicon: evaluar el comportamiento de Valen-Decision-1.5-4B en hardware de consumo (Mac mini M4 de 16 GB) antes de comprometerse con infraestructura mayor.
- Escenarios con requisitos de privacidad: al ejecutarse íntegramente en local con el ANE, los datos de texto e imagen no abandonan el equipo, lo que encaja en flujos con datos sensibles.
- Pruebas de regresión de conversiones: comparar las decisiones del bundle ANE contra la referencia upstream usando la diferencia de probabilidad como métrica de fidelidad en pipelines de CI para conversiones de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son de latencia y memoria del bundle ANE:

| Medición | Primera petición (servidor nuevo) | Petición en caliente |
|---|---|---|
| Texto, 70-110 tokens | 733-974 ms | 381-418 ms |
| Imagen, 133 tokens | 1.371 ms | 821 ms |

| Métrica de sistema | Valor |
|---|---|
| Memoria del driver ANE en reposo (tras texto) | 8,21 GiB |
| Memoria del driver ANE en reposo (tras imagen) | 8,85 GiB |
| Memoria 2 s después de descarga por inactividad | 22 MiB |
| Tamano de descarga | 9,75 GB |
| Tiempo de instalación (store vacío, con cachés del SO) | 392 s |
| Diferencia máxima de probabilidad vs. referencia | 0,000419 (0,0419 puntos porcentuales) |

## Requisitos de hardware

- Hardware cualificado: Apple M4 `h16g`; probado en un Mac mini de 16 GB.
- Sistema operativo y toolchain: macOS 27, Xcode 27.1 y Metal Toolchain.
- Espacio en disco: 9,75 GB de descarga más espacio adicional para compilación y caché nativa.
- Memoria: el driver ANE del sistema consume 8,21-8,85 GiB con el modelo cargado en reposo, lo que deja margen limitado en un equipo de 16 GB.
- Runtime: ANERun con soporte de dispositivo Valen (release objetivo 0.3.1), instalado vía `anerun models install` y servido con `anerun serve`.
- No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI: el bundle es específico de ANERun y del ANE.
- Throughput: no disponible más allá de las latencias por petición indicadas.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El modelo base Valen-Decision-1.5-4B es el único punto de referencia directo, y no se documentan sus parámetros de contexto, benchmarks ni licencia más allá de la Apache-2.0 heredada. Cualquier comparación con alternativas de 4B o con modelos de decisión requeriría datos que no están disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Valen-4B-ANE | 4B | no disponible | Apache-2.0 | bundle ANERun | Hugging Face (junmo-k/valen-4b-ane) |
| Valen-Decision-1.5-4B | 4B | no disponible | Apache-2.0 (heredada) | no disponible | Hugging Face (Valen-Team) |
| Alternativas de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El artefacto es una conversión, no un modelo nuevo: su calidad depende enteramente de Valen-Decision-1.5-4B, cuyas características de entrenamiento no están documentadas en la información disponible.
- Dependencia dura del ecosistema Apple: requiere ANERun 0.3.1 o superior, macOS 27, Xcode 27.1, Metal Toolchain y un chip M4 `h16g`; no es portable a GPU NVIDIA, AMD ni a otros Apple Silicon sin cualificación explícita.
- Consumo de memoria elevado para un equipo de 16 GB: 8,21-8,85 GiB del driver ANE en reposo dejan poco margen para el resto del sistema.
- La instalación exige indicar el hash completo del commit (`--revision FULL_COMMIT`); no se documenta un tag estable.
- No hay información sobre sesgos, tasas de alucinación, cobertura de idiomas ni comportamiento fuera del dominio de decisión.
- La licencia Apache-2.0 permite uso comercial, pero el aviso upstream debe conservarse; conviene verificar los términos del modelo base antes de producción.
- El modelo está orientado a decisiones con opciones y probabilidades; no debe asumirse como un generador de texto generalista.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/junmo-k/valen-4b-ane
- Modelo base: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Commit del modelo base usado en la conversión: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B/tree/9b0cacc976d7fb72f252ee1adb1564f5f15e462c
- Runtime ANERun: https://github.com/junmo-kim/ANERun
