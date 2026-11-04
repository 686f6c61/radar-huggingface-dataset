# SacredSAMF/mediakit-whisper-vulkan

## Resumen

`SacredSAMF/mediakit-whisper-vulkan` no es un modelo de IA, sino un paquete de librerías nativas para Windows x64 que implementa el runtime de Vulkan de Whisper.net 1.9.1, es decir, whisper.cpp compilado con su backend Vulkan. El autor, SacredSAMF, lo publica como repositorio de HuggingFace para que la aplicación MediaKit lo descargue bajo demanda cuando el usuario activa la opción "Download graphics card support" en los ajustes de transcripción.

El contenido son los binarios de `build/win-x64/` del paquete NuGet `Whisper.net.Runtime.Vulkan` 1.9.1, reempaquetados sin las demás plataformas para reducir el tamaño de descarga a la mitad. MediaKit verifica el SHA-256 del zip (`25fbea77...c1135a`) antes de usarlo. No contiene pesos de modelo ni código de inferencia propio: únicamente las DLL y dependencias necesarias para ejecutar whisper.cpp sobre una GPU compatible con Vulkan desde una aplicación .NET construida con Whisper.net 1.9.1.

Su relevancia es acotada: sirve como artefacto de distribución para acelerar la transcripción de audio en GPU bajo Windows dentro del ecosistema MediaKit. Fuera de ese contexto (o de cualquier programa que use Whisper.net 1.9.1), el paquete no tiene utilidad. El repositorio ocupa 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; runtime nativo de whisper.cpp con backend Vulkan) |
| Parámetros totales | no disponible (no contiene pesos) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con binarios Windows x64) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El paquete contiene las bibliotecas nativas de whisper.cpp compiladas con el backend Vulkan, empaquetadas originalmente en el paquete NuGet `Whisper.net.Runtime.Vulkan` 1.9.1 y reempaquetadas aquí conservando únicamente los binarios de `build/win-x64/`. La cadena técnica subyacente es Whisper.net (wrapper .NET sobre whisper.cpp) sobre el motor de inferencia whisper.cpp con aceleración Vulkan mediante ggml.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), porque el artefacto no incluye ningún modelo. El ZIP incorpora los ficheros de licencia de Whisper.net (MIT, Copyright (c) 2024 sandrohanea) y de whisper.cpp/ggml (MIT, Copyright (c) 2023-2026 The ggml authors).

## Capacidades

- Distribución de binarios nativos para ejecutar whisper.cpp con backend Vulkan en Windows x64.
- Integración con aplicaciones .NET construidas sobre Whisper.net 1.9.1.
- Verificación de integridad mediante SHA-256 del archivo `whisper-vulkan-1.9.1-win-x64.zip`.
- Inclusión de los textos de licencia MIT de Whisper.net y whisper.cpp/ggml dentro del propio zip.
- No incluye pesos de modelo, tokenizador, vocabulario ni pipeline de inferencia propio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias; estas dependerían del modelo Whisper que cargue la aplicación anfitriona.
- No dispone de modo thinking, visión ni audio más allá de lo que aporte whisper.cpp al que envuelve.

## Casos de uso

- Aceleración por GPU de la transcripción en MediaKit: el usuario activa "Download graphics card support" en Settings → Transcription y la aplicación descarga este zip para ejecutar whisper.cpp sobre Vulkan en lugar de CPU.
- Despliegue de aplicaciones .NET de transcripción en Windows x64: sirve como dependencia nativa para proyectos que usen Whisper.net 1.9.1 y quieran habilitar el backend Vulkan sin arrastrar los binarios de otras plataformas.
- Reducción del tamaño de distribución: al eliminar las plataformas no Windows del paquete NuGet original, se rebaja a la mitad el peso de la descarga para entornos exclusivamente Windows x64.
- Verificación de integridad en pipelines de distribución: el SHA-256 publicado permite validar el artefacto antes de instalarlo en sistemas de escritorio gestionados.
- Empaquetado reproducible de dependencias nativas: útil como referencia para proyectos que necesiten repaquetar binarios de NuGet con un subconjunto de plataformas.
- Integración en instaladores offline o corporativos de herramientas de transcripción basadas en Whisper.net, donde se prefiere un único zip verificado frente a la restauración completa de NuGet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica VRAM por pesos de modelo: el paquete no contiene parámetros. La VRAM necesaria dependerá del modelo Whisper que cargue la aplicación anfitriona y del backend Vulkan.
- GPU recomendadas: cualquier GPU con soporte Vulkan funcional bajo Windows x64; no se especifican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del driver Vulkan y del modelo Whisper cargado por la aplicación.
- Opciones de despliegue: uso como dependencia nativa dentro de aplicaciones .NET con Whisper.net 1.9.1; no es desplegable mediante vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Plataforma | Licencia | Contenido |
|---|---|---|---|---|
| `SacredSAMF/mediakit-whisper-vulkan` | Runtime nativo (whisper.cpp + Vulkan) | Windows x64 | MIT | Binarios de `Whisper.net.Runtime.Vulkan` 1.9.1, solo win-x64 |
| `Whisper.net.Runtime.Vulkan` 1.9.1 (NuGet) | Runtime nativo | Multiplataforma | MIT | Binarios de todas las plataformas soportadas |
| `Whisper.net.Runtime` (NuGet) | Runtime nativo (CPU) | Multiplataforma | MIT | Binarios de whisper.cpp sin backend Vulkan |

La comparación relevante es con el paquete NuGet del que deriva: este repositorio es un subconjunto byte a byte de `build/win-x64/`, sin modificaciones en los binarios, y con un tamaño de descarga aproximadamente la mitad. No se dispone de datos de rendimiento comparativo entre backends en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no puede usarse para generar texto, transcribir audio por sí mismo ni integrarse en pipelines de inferencia sin una aplicación anfitriona.
- Solo es funcional en programas construidos con Whisper.net 1.9.1; versiones distintas pueden ser incompatibles.
- Limitado a Windows x64; no incluye binarios para Linux, macOS ni ARM.
- Requiere una GPU con soporte Vulkan y drivers actualizados; sin ellos el backend no funcionará.
- El repositorio no registra descargas ni interacciones, y el tamaño reportado es 0.0 GB, lo que puede indicar que el artefacto no está realmente alojado o que la métrica no se ha actualizado.
- No se especifican idiomas soportados ni requisitos de hardware en la información disponible.
- La licencia MIT permite uso comercial, pero debe conservarse la atribución a Whisper.net y whisper.cpp/ggml incluida en el zip.
- Al ser un binario de terceros, conviene verificar el SHA-256 publicado antes de su uso en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SacredSAMF/mediakit-whisper-vulkan
- Paquete NuGet de origen: https://www.nuget.org/packages/Whisper.net.Runtime.Vulkan/1.9.1
- MediaKit: https://divoria.fun/mediakit.html
