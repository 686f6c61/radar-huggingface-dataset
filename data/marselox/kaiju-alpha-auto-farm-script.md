# Marselox/kaiju-alpha-auto-farm-script

## Resumen

No existe ningún modelo de IA open source publicado bajo el identificador `Marselox/kaiju-alpha-auto-farm-script`. El repositorio alojado en Hugging Face con ese nombre no contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje. Se trata, por el contenido de su model card, de un paquete ejecutable para Windows distribuido como archivo ZIP (`kaiju-alpha-auto-farm-script-v1.2.0-win64.zip`, 8,9 MB) que se presenta como una herramienta de automatización ("auto farm") para un videojuego, con módulos descritos como "bezier input smoothing", "dynamic offset scanner", "stream-proof render layer" y "2D radar & loot filter". Es decir, la propia documentación lo describe como un *game cheat* binario, no como un modelo fundacional.

El autor declarado en la model card es `miyeon99`, mientras que el identificador de Hugging Face es `Marselox`, lo que introduce una discrepancia de atribución. El repositorio registra cero descargas y cero *likes* en el momento de la consulta, y no declara *pipeline* de Hugging Face, lo que impide clasificarlo como `text-generation`, `image-text-to-text` ni ninguna otra tarea de inferencia.

Desde la perspectiva de la evaluación de modelos, esta ficha no puede completarse con datos técnicos de arquitectura, entrenamiento o benchmarks porque no existen. Lo relevante para desarrolladores e investigadores es la advertencia: un paquete de este tipo, distribuido con contraseña de descompresión (`2026`), que solicita ejecución como administrador y que reconoce explícitamente que los antivirus pueden marcarlo, no debe tratarse como software de IA ni ejecutarse en entornos de producción o de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no implica capacidad lingüística de un modelo) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows 10/11 de 64 bits) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. La model card no documenta transformer, MoE, SSM ni ningún otro paradigma de aprendizaje automático, ni tampoco corpus de entrenamiento, número de tokens, proceso de RLHF/DPO o técnicas de decodificación. Los únicos datos técnicos declarados son de ingeniería de sistema: un núcleo externo en modo usuario ("user-mode external core") que evita hooks DLL internos, un escáner de offsets con ocho hilos de trabajo, un módulo de suavizado de entrada con doce hilos, una capa de render con trece hilos que afirma excluir la captura de OBS, ShadowPlay y Discord, y un *polling* declarado de 130 Hz y 222 Hz según el módulo.

Tampoco existe información sobre dataset, tokenizador o proceso de alineación. Cualquier afirmación sobre entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de soporte de *tool calling* ni de *function calling* en el sentido de las APIs de modelos.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma del repositorio son metadatos de etiquetado, no una evaluación de competencia lingüística.
- Las funciones que declara son de automatización de entrada y lectura de memoria de un proceso de juego en Windows: suavizado Bézier de entrada, escáner de offsets, radar 2D, filtro de *loot* y perfiles JSON intercambiables en caliente.
- No se documenta ningún modo *thinking*, visión, audio ni multimodalidad.

## Casos de uso

No se identifican casos de uso legítimos de IA para este artefacto. Los escenarios que la model card sugiere son de automatización de videojuegos, y se listan únicamente para dejar constancia de lo que el autor declara, no como recomendación:

- Automatización de farming en un videojuego: el binario declararía suavizado de entrada y perfiles intercambiables para automatizar tareas repetitivas; su uso suele violar los términos de servicio del juego.
- Lectura de memoria del proceso del juego: el "dynamic offset scanner" resolvería firmas de punteros tras parches; implica acceso a memoria de un tercero.
- Exclusión de captura de pantalla: la capa de render afirmaría ocultar la ventana a OBS, ShadowPlay y Discord; esta función está diseñada para evadir la detección.
- Radar 2D y filtro de objetos: mostraría contenedores y objetos por rareza; es una ventaja competitiva no permitida en la mayoría de títulos.
- Ejecución como administrador en Windows 10/11 x64: requiere privilegios elevados, lo que amplía la superficie de riesgo del sistema.
- Distribución con contraseña de archivo: el ZIP protegido con `2026` dificulta el análisis automático por parte de antivirus y servicios de *sandbox*.

Ninguno de estos escenarios constituye un caso de uso de IA open source evaluable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque el artefacto no es un modelo. Las únicas cifras declaradas son de sistema: 8,9 MB de paquete, menos de 32 MB de RAM en uso, 130 Hz y 222 Hz de *polling*, y 8, 12 y 13 hilos según módulo. Estas cifras no son verificables con la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- RAM declarada: menos de 32 MB según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un `.exe` que se ejecuta como administrador.
- Latencia y throughput: no disponibles; las cifras de *polling* en hercios no son métricas de inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque el artefacto no es un modelo. Frente a modelos de lenguaje reales de tamaño pequeño o mediano, la comparación sería categóricamente inválida: no comparten tarea, arquitectura, licencia de uso ni modelo de distribución.

| Criterio | Este artefacto | Modelo de IA open source típico |
|---|---|---|
| Naturaleza | Binario `.exe` para Windows | Pesos en safetensors/GGUF |
| Tarea | Automatización de juego | Generación de texto, código, etc. |
| Pesos publicados | No | Sí |
| Reproducibilidad | No | Sí, con configuración y tokenizador |
| Evaluación con benchmarks | No | Sí |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en trabajos académicos ni en comparativas de modelos.
- Discrepancia de atribución: el ID de Hugging Face es `Marselox` y la model card remite a `miyeon99/kaiju-alpha-auto-farm-script` en GitHub, lo que impide verificar la cadena de custodia del binario.
- Distribución con contraseña de descompresión (`2026`) y petición de ejecución como administrador: patrón habitual en campañas de *malware* y en herramientas que buscan evadir el análisis automatizado.
- La propia model card reconoce que Windows Defender y SmartScreen pueden alertar y recomienda añadir el directorio a la lista blanca; esta recomendación elimina una capa de protección del sistema.
- Riesgo de *malware*: un ejecutable sin firma, sin código fuente y con privilegios elevados puede exfiltrar datos, instalar persistencia o comprometer el equipo.
- Uso contrario a los términos de servicio de videojuegos: puede conllevar el baneo de cuentas y, en algunas jurisdicciones, responsabilidad legal.
- La licencia MIT declarada en los metadatos se refiere al repositorio, no a un modelo; no cubre el uso del binario ni exime de las obligaciones legales del usuario.
- Cero descargas y cero *likes*: no hay evidencia de comunidad, auditoría ni revisión por terceros.
- No verificable: ninguna de las capacidades declaradas (exclusión de captura, radar, escáner de offsets) puede contrastarse con la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/kaiju-alpha-auto-farm-script
- Repositorio GitHub referenciado en la model card: https://github.com/miyeon99/kaiju-alpha-auto-farm-script
- Descarga directa citada por el autor (no recomendada): https://github.com/miyeon99/kaiju-alpha-auto-farm-script/releases/latest/download/kaiju-alpha-auto-farm-script-v1.2.0-win64.zip
- Página de releases citada por el autor: https://github.com/miyeon99/kaiju-alpha-auto-farm-script/releases/latest
