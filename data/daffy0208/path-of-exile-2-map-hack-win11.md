# daffy0208/path-of-exile-2-map-hack-win11

## Resumen

La entrada `daffy0208/path-of-exile-2-map-hack-win11` alojada en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido a través de la plataforma, cuyo contenido declarado es una herramienta de trampas ("map hack") para el videojuego Path of Exile 2. El artefacto consiste en un archivo ZIP de 8,9 MB que contiene un binario `.exe` (`path-of-exile-2-map-hack-win11-v1.2.0-win64.exe`, build `v2.4.7`) protegido con contraseña, y cuya model card describe funcionalidades de overlay externo, ESP de cajas delimitadoras, radar 2D y suavizado de entrada tipo Bézier.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento, porque el artefacto no es un modelo de lenguaje. La model card únicamente documenta supuestas capacidades de manipulación del cliente del juego, instrucciones de instalación y preguntas frecuentes sobre alertas de Windows Defender. Cualquier ficha técnica de IA resulta, por tanto, inaplicable en la práctica totalidad de sus campos.

La relevancia de esta entrada para desarrolladores e investigadores es nula desde el punto de vista de la IA open source, y alta como caso de estudio de riesgo de supply chain: demuestra cómo la infraestructura de Hugging Face puede alojar binarios ejecutables ajenos al ecosistema de modelos, con instrucciones para desactivar protecciones del sistema operativo y descargar desde repositorios de GitHub de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; se refiere a idiomas de la documentación, no a capacidades del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay pesos) |

## Arquitectura y entrenamiento

No disponible. El artefacto no es un modelo entrenado. La model card describe un ejecutable de 8,9 MB con módulos denominados "overlay externo a 144 Hz", "perfiles JSON con intercambio en caliente", "suavizado de entrada Bézier", "capa de render anti-captura para OBS/ShadowPlay/Discord", "escáner dinámico de offsets" y "radar 2D con filtro de loot". No se documenta lenguaje de implementación, dependencias, cadena de compilación ni procedencia del código, y los enlaces de descarga apuntan a un repositorio de GitHub (`dawidpeterson20/path-of-exile-2-map-hack-win11`) distinto del espacio de Hugging Face.

No hay información sobre datasets, tokens de entrenamiento, RLHF, DPO ni ninguna técnica de aprendizaje automático. Las cifras que aparecen en la model card (consistencia del 96,2 %, latencia inferior a 12-13 ms, 10 hilos de trabajo) son afirmaciones del autor sin verificación independiente y no constituyen métricas de un sistema de IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de comprensión; los códigos de idioma de los metadatos corresponden a la documentación del paquete.
- Según la model card, el binario afirmaría ofrecer overlay externo con cajas 2D/3D, esqueletos y ESP de distancia, radar 2D, filtro de loot por rareza, perfiles JSON conmutables y evasión de captura de pantalla.
- Estas capacidades declaradas no han sido verificadas y su naturaleza es la manipulación de un cliente de videojuego, no el procesamiento de lenguaje natural.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA. El artefacto no permite construir aplicaciones de procesamiento de lenguaje, visión por computador ni generación de código.
- Auditoría de seguridad y supply chain: analizar en un entorno aislado el binario y el ZIP para documentar técnicas de empaquetado, cifrado con contraseña y evasión de antivirus empleadas en campañas de distribución de software malicioso.
- Formación en ciberseguridad: usar la model card como ejemplo didáctico de ingeniería social (badges de "4,8/5", botones de descarga directa, contraseña fija "2026", instrucciones para añadir exclusiones en Windows Defender).
- Investigación sobre abuso de plataformas de modelos: estudiar cómo se cuelan artefactos no relacionados con IA en Hugging Face y qué vectores de reporte existen.
- Análisis de cumplimiento de términos de servicio de videojuegos: documentar por qué el uso de este tipo de herramientas conlleva la suspensión de cuentas en Path of Exile 2 conforme a las políticas de Grinding Gear Games.
- No se recomienda su ejecución en ningún sistema de producción, de desarrollo ni personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras de la model card (respuesta inferior a 12 ms, consistencia del 96,2 %, 144 Hz) son afirmaciones comerciales del autor sin metodología, sin conjunto de prueba y sin replicación, y no deben interpretarse como benchmarks.

## Requisitos de hardware

- No aplica VRAM ni GPU: el artefacto no ejecuta inferencia de modelos.
- Sistema operativo declarado: Windows 10/11 de 64 bits.
- Tamaño del paquete: 8,9 MB comprimido; el binario requiere ejecución como administrador según las instrucciones del autor.
- No hay soporte de vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia.
- Latencia y throughput: no disponibles; las cifras declaradas por el autor no son verificables.
- Ejecutarlo requiere desactivar o añadir exclusiones en Windows Defender y SmartScreen, lo que constituye un riesgo de seguridad objetivo.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Como referencia de categoría, los paquetes de trampas para videojuegos se distribuyen habitualmente fuera de plataformas de modelos (foros, repositorios efímeros, servicios de suscripción) y no publican especificaciones técnicas verificables.

| Criterio | Este artefacto | Modelo de IA típico en HF |
|---|---|---|
| Naturaleza | Binario `.exe` en ZIP | Pesos en safetensors/GGUF |
| Parámetros | no disponible | Miles de millones |
| Contexto | no disponible | 4k-1M tokens |
| Licencia | MIT | Apache 2.0, MIT, Llama, etc. |
| Uso previsto | Manipulación de videojuego | Inferencia de lenguaje/visión |
| Verificabilidad | Nula | Benchmarks públicos habituales |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje carece de sentido.
- Riesgo de malware: un ejecutable de origen desconocido, distribuido con contraseña fija y con instrucciones explícitas para desactivar Windows Defender y SmartScreen, presenta indicadores clásicos de software potencialmente no deseado o malicioso.
- El enlace de descarga apunta a un repositorio de GitHub de un tercero, no al espacio de Hugging Face, lo que rompe la trazabilidad del artefacto.
- Uso prohibido por los términos de servicio de Path of Exile 2: puede conllevar suspensión permanente de la cuenta del usuario.
- La licencia MIT declarada cubre el paquete, pero no aclara la procedencia del código ni posibles componentes de terceros con otras licencias.
- Las afirmaciones de rendimiento (96,2 % de consistencia, <12 ms, 144 Hz) no están respaldadas por metodología ni datos reproducibles.
- Los códigos de idioma de los metadatos no implican capacidades multilingües reales del binario.
- No debe ejecutarse en entornos con datos sensibles, cuentas de juego vinculadas a pagos ni sistemas corporativos.

## Enlaces

- Hugging Face: https://huggingface.co/daffy0208/path-of-exile-2-map-hack-win11
- Repositorio de GitHub citado en la model card: https://github.com/dawidpeterson20/path-of-exile-2-map-hack-win11
- Releases del repositorio: https://github.com/dawidpeterson20/path-of-exile-2-map-hack-win11/releases/latest
- Descarga directa del ZIP (no recomendada): https://github.com/dawidpeterson20/path-of-exile-2-map-hack-win11/releases/latest/download/path-of-exile-2-map-hack-win11-v1.2.0-win64.zip
- Path of Exile 2 (sitio oficial del juego): https://www.pathofexile.com/
- Política de conducta de Grinding Gear Games: https://www.pathofexile.com/forum/view-thread/3348631
