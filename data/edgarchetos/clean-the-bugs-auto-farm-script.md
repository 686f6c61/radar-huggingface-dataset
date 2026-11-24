# EDGARCHETOS/clean-the-bugs-auto-farm-script

## Resumen

El repositorio `EDGARCHETOS/clean-the-bugs-auto-farm-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows que la model card presenta como un "auto farm script" para el juego Clean The Bugs. El artefacto distribuido es un archivo ZIP de 8,9 MB (`clean-the-bugs-auto-farm-script-v1.2.0-win64.zip`) protegido con contraseña, que aloja un binario `.exe` destinado a ejecutarse con privilegios de administrador en Windows 10 y Windows 11. La model card describe funciones propias de un cheat o trainer de videojuegos: escáner dinámico de offsets, perfiles JSON intercambiables en caliente, radar 2D con filtro de loot, overlay externo a 144 Hz con ESP de huesos y cajas, y una capa de render "stream-proof" para evadir la captura de OBS, ShadowPlay y Discord.

No se trata, por tanto, de un modelo de lenguaje ni de un sistema de IA: no hay arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia. La etiqueta `pipeline` figura como no disponible y el conteo de descargas y "likes" es cero en el momento de la consulta. Los idiomas declarados (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) corresponden a los idiomas en que se presenta el material promocional, no a capacidades lingüísticas de un modelo.

La relevancia de esta ficha es fundamentalmente de advertencia: un artefacto de este tipo, distribuido como binario cerrado con contraseña y sin código fuente auditable, plantea riesgos de seguridad evidentes (malware, robo de credenciales, baneos en plataformas de juego) y no debe evaluarse como si fuera un modelo open source. Los datos técnicos que siguen se limitan a lo que la model card declara explícitamente; todo lo demás se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de la documentacion promocional) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` (`clean-the-bugs-auto-farm-script-v1.2.0-win64.exe`) |
| Plataforma objetivo | Windows 10 y Windows 11, x64 |
| Tamano del paquete | 8,9 MB (ZIP) |
| Version / build | v4.9.6 (092D4F) |
| Contrasena del archivo | 2026 (declarada en la model card) |
| Repositorio de origen citado | transanchez/clean-the-bugs-auto-farm-script (GitHub) |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

No disponible. No existe arquitectura de modelo, dataset de entrenamiento, proceso de RLHF/DPO ni innovación técnica en el sentido de IA. La model card describe, en su lugar, componentes de un ejecutable de automatización de juego: un "scanner dinámico de offsets" que resuelve firmas de punteros tras los parches del juego con sondeo a 247 Hz, perfiles JSON intercambiables con una tecla entre presets Legit, Visual y Custom, un radar 2D con filtrado de objetos por rareza, una capa de overlay externa que dibuja cajas y esqueletos óseos con tiempo de respuesta declarado inferior a 11 ms, y un núcleo en modo usuario que evita hooks DLL internos mediante Desktop Duplication. Ninguno de estos datos es verificable desde el repositorio de Hugging Face, que solo contiene metadatos y el texto de la model card.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de comprensión; los idiomas listados son los de la documentación.
- Lo que la model card declara como funcionalidad del binario: escáner dinámico de offsets, cambio en caliente de perfiles JSON, radar 2D con filtro de loot por rareza, overlay externo con ESP de cajas y huesos, y capa de render excluida de capturas de OBS, ShadowPlay y Discord.
- Estas funcionalidades no han sido verificadas de forma independiente y su naturaleza (automatización de un videojuego con evasión de captura) es característica de software de trampas.

## Casos de uso

- No se identifican casos de uso legítimos de IA para este repositorio: no es un modelo y no ofrece inferencia, generación ni procesamiento de lenguaje.
- Automatización de partidas en Clean The Bugs: el binario declararía funciones de farming automático, pero su uso probablemente infringe los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Evaluación de seguridad defensiva: un analista podría estudiar el paquete en un entorno aislado para entender la técnica de distribución (ZIP con contraseña, binario sin código fuente, instrucciones de "ejecutar como administrador") como ejemplo de patrón de riesgo.
- Docencia sobre riesgos de supply chain: sirve como caso ilustrativo de por qué no deben ejecutarse binarios opacos descargados de repositorios de modelos.
- No se recomienda su uso en producción, en entornos corporativos ni en máquinas con datos sensibles.
- Cualquier escenario que requiera un modelo de lenguaje, visión o razonamiento queda fuera del alcance de este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento propias del ejecutable (sondeo a 247 Hz, consistencia del 99,4 % en el cambio de perfiles, menos de 51 MB de RAM, menos de 11 ms de respuesta del overlay, 14 hilos de trabajo), pero no son benchmarks de modelos de IA ni han sido verificadas de forma independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11, arquitectura x64.
- Memoria RAM declarada por el ejecutable: menos de 51 MB según la model card (no verificado).
- No aplica VRAM ni GPU para inferencia: no hay modelo que cargar.
- No aplica despliegue con vLLM, llama.cpp, Ollama o TGI.
- El binario requiere, según sus propias instrucciones, ejecutarse con privilegios de administrador, lo que constituye un riesgo de seguridad adicional.
- Latencia y throughput: no disponibles en el sentido de inferencia de IA.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este repositorio no contiene un modelo. Como referencia de categoría, los artefactos comparables serían otros binarios de automatización de juegos, que quedan fuera del alcance de esta ficha y comparten los mismos riesgos de seguridad y de términos de servicio.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- El artefacto es un binario cerrado distribuido en un ZIP con contraseña y sin código fuente auditable; no hay forma de verificar qué ejecuta realmente.
- Las instrucciones piden ejecutarlo como administrador, lo que amplía el impacto de cualquier comportamiento malicioso.
- Riesgo elevado de malware, robo de credenciales, persistencia no deseada o minado en la máquina anfitriona.
- El uso de auto farm scripts en videojuegos suele violar los términos de servicio y puede provocar el baneo permanente de cuentas.
- La función declarada de exclusión de captura (OBS, ShadowPlay, Discord) está diseñada para dificultar la detección, lo que es una señal de alarma.
- La licencia MIT declarada en los metadatos no implica que el contenido sea seguro ni que su uso sea legal en todos los contextos.
- Cero descargas y cero likes en Hugging Face: sin validación comunitaria ni señales de confianza.
- El repositorio de Hugging Face no contiene pesos, tokenizador ni pipeline; cualquier intento de cargarlo con herramientas de IA fallará.
- No se debe ejecutar en equipos de trabajo, servidores ni máquinas con acceso a datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EDGARCHETOS/clean-the-bugs-auto-farm-script
- Repositorio de GitHub citado en la model card: https://github.com/transanchez/clean-the-bugs-auto-farm-script
- Releases citadas: https://github.com/transanchez/clean-the-bugs-auto-farm-script/releases/latest
- Paquete citado: https://github.com/transanchez/clean-the-bugs-auto-farm-script/releases/latest/download/clean-the-bugs-auto-farm-script-v1.2.0-win64.zip
- Paper, blog o demo: no disponible
