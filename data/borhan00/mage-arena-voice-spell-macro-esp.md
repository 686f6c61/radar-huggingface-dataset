# borhan00/mage-arena-voice-spell-macro-esp

## Resumen

El artefacto publicado bajo el identificador `borhan00/mage-arena-voice-spell-macro-esp` en Hugging Face no es un modelo de inteligencia artificial ni un conjunto de pesos entrenados. Se trata de un paquete ejecutable para Windows 10/11 de 64 bits etiquetado como "macro de hechizos por voz" y "ESP" (overlay de visualización) para el juego Mage Arena, distribuido como archivo ZIP con contraseña que contiene un binario `.exe` y módulos de overlay externo, escáner de offsets y filtros de loot. La model card no describe arquitectura, datos de entrenamiento ni capacidades lingüísticas: es una página de distribución de software con instrucciones de instalación y descarga.

El repositorio declara licencia MIT y una lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) que corresponde a los idiomas de la interfaz del programa, no a un modelo multilingüe. Los tags (`windows`, `windows-11`, `x64`, `portable`) confirman la naturaleza del artefacto: una aplicación portable, no un modelo fundacional.

Por tanto, esta ficha no puede evaluar parámetros, contexto, cuantizaciones ni benchmarks de un modelo de lenguaje, porque no existen. Lo que se documenta a continuación es el artefacto tal y como se describe, junto con las advertencias de seguridad relevantes. Cualquier uso en producción de IA es ajeno a este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicación Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de interfaz declarados) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como `.zip` con un `.exe` en su interior) |

Datos adicionales del artefacto, según la model card:

| Atributo | Valor |
|---|---|
| Plataforma objetivo | Windows 10/11 64 bits |
| Ejecutable | `fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe` (build `v4.5.4`, `1D3C1A2580`) |
| Archivo de release | `fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip` (4,8 MB) |
| Contraseña del ZIP | `2026` |
| Descargas declaradas | 939K+ (cifra de la propia model card, no verificable) |
| Polling del radar | 194 Hz |
| Hilos de trabajo | 4 (core externo) y 5 (perfiles JSON) |
| RAM declarada | < 42 MB |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El paquete es una aplicación de escritorio nativa para Windows x64 que, según la model card, opera en modo usuario ("user-mode external core") mediante Desktop Duplication para renderizar un overlay sin inyectar DLL en el proceso del juego. Incluye un escáner dinámico de offsets con resolución automática de firmas de punteros tras los parches del juego, un sistema de suavizado de entrada por curvas de Bézier con radio de FOV y comprobación de visibilidad configurables, y un radar 2D con filtrado de loot por rareza.

La model card menciona cifras de "consistencia" (98,2 % en el escáner de offsets, 96,4 % en el suavizado de entrada) sin especificar metodología de medición, por lo que no son reproducibles ni verificables. No se documenta ningún proceso de entrenamiento, dataset, RLHF ni innovación algorítmica en el sentido del aprendizaje automático.

## Capacidades

- Overlay externo a 144 Hz o más con cajas delimitadoras 2D/3D, esqueletos de huesos y distancia (ESP).
- Escáner dinámico de offsets con resolución automática de firmas de punteros tras actualizaciones del juego.
- Perfiles JSON con cambio en caliente mediante una tecla, con presets Legit, Visual y Custom.
- Suavizado de entrada por curvas de Bézier con radio de FOV, comprobación de visibilidad y curvas "humanizadas".
- Radar 2D con filtrado de loot por rareza y seguimiento de contenedores.
- Ejecución en modo usuario sin hooks de DLL internos, según la model card.
- Interfaz multilingüe en los 14 idiomas declarados.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión artificial, tool calling, agentes ni modo de pensamiento.

## Casos de uso

Ninguno de los casos de uso habituales de un modelo de IA es aplicable. Los escenarios que el autor asocia al artefacto son:

- Asistencia visual en partidas de Mage Arena: el overlay muestra cajas y distancias de objetivos en tiempo real, pensado para jugadores que quieren información adicional en pantalla.
- Automatización de hechizos por voz: el paquete se presenta como macro que traduce comandos de voz en acciones del juego.
- Gestión de perfiles por contexto de juego: el cambio en caliente de perfiles JSON permite alternar entre configuración discreta y configuración visual completa sin reiniciar.
- Adaptación tras parches del juego: el escáner de offsets resuelve firmas de punteros automáticamente, reduciendo el mantenimiento manual tras cada actualización.
- Filtrado de loot: el radar con culling por rareza ayuda a localizar objetos de interés en mapas con muchos contenedores.
- Distribución portable: al no requerir instalación, el paquete puede ejecutarse desde una unidad extraíble en equipos Windows 10/11.

Advertencia: en la mayoría de juegos en línea, el uso de overlays, macros y ESP constituye una violación de los términos de servicio y puede conllevar el bloqueo permanente de la cuenta. Además, la distribución mediante ZIP con contraseña y un binario sin firma es un patrón habitual de malware; no se recomienda su ejecución en ningún sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas de la model card (194 Hz de polling, < 42 MB de RAM, 98,2 % y 96,4 % de "consistencia") carecen de metodología y no son comparables con ningún benchmark estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no ejecuta modelos de IA.
- GPU recomendadas: no aplica; el renderizado usa Desktop Duplication, no requiere GPU dedicada según la model card.
- Compatibilidad con GPU de consumo: irrelevante para este paquete.
- Sistema operativo: Windows 10/11 de 64 bits exclusivamente.
- RAM declarada: menos de 42 MB para el core externo.
- Opciones de despliegue: ejecución directa del `.exe` como administrador tras extraer el ZIP; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de Hz y consistencia no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se identifican en la información proporcionada alternativas de software equivalentes con las que establecer una comparación técnica rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni admite tool calling. Cualquier expectativa en ese sentido es un error de categoría.
- La model card incluye enlaces de descarga que apuntan a repositorios de GitHub de terceros distintos del espacio de Hugging Face, con nombres de archivo incoherentes entre sí (`fisch-script-auto-catch-macro-*` frente a `mage-arena-voice-spell-macro-esp`).
- La distribución mediante ZIP protegido con contraseña y ejecutable sin firma digital es un vector de malware documentado; no hay verificación de integridad ni de autor.
- Las cifras de descargas (939K+), valoración (4,9/5) y consistencia (98,2 %, 96,4 %) proceden de la propia model card y no son verificables de forma independiente.
- Uso en juegos en línea: probable violación de los términos de servicio, con riesgo de sanción en la cuenta del usuario.
- Licencia MIT declarada, pero la licencia del binario distribuido en GitHub no se puede confirmar desde la información disponible.
- El repositorio de Hugging Face no contiene pesos, tokenizador, configuración ni código de inferencia; solo una model card descriptiva.
- La fecha de creación indicada (2026-11-24) es futura respecto a la información de referencia, lo que sugiere datos inconsistentes en el registro.

## Enlaces

- Hugging Face: https://huggingface.co/borhan00/mage-arena-voice-spell-macro-esp
- Release en GitHub citada en la model card: https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Repositorio de releases citado: https://github.com/Gloria357/mage-arena-voice-spell-macro-esp/releases/latest
- Resultado de búsqueda web: https://fr.linkedin.com/ (sin relación con el artefacto)
