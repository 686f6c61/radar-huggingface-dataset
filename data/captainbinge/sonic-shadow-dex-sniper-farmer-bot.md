# CaptainBinge/sonic-shadow-dex-sniper-farmer-bot

## Resumen

El repositorio `CaptainBinge/sonic-shadow-dex-sniper-farmer-bot` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de una model card que distribuye un supuesto ejecutable para Windows (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con la contraseña `2026`) presentado como un bot de automatización con funciones de radar 2D, filtro de loot, suavizado de entrada tipo bezier y capa de renderizado "stream-proof" orientada a evadir la captura de OBS, ShadowPlay y Discord.

El texto emplea la terminología y el formato propios de las fichas de modelos (etiquetas YAML con `license`, `language` y `tags`, insignias de descargas y valoraciones, secciones de instalación y FAQ), pero el contenido real es un anuncio de software de trampas para videojuegos con instrucciones para desactivar las alertas de Windows Defender y SmartScreen. No se declara ninguna arquitectura de red neuronal, ningún conjunto de pesos, ni ningún dato de entrenamiento.

Por tanto, esta ficha no puede documentar especificaciones técnicas de un modelo inexistente. Los apartados siguientes reflejan la ausencia de información verificable y advierten de los riesgos de seguridad asociados al artefacto distribuido. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, pese a que la propia model card muestra insignias que afirman 611 000 descargas y una valoración de 5,0 sobre 5, datos no contrastados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según las etiquetas de la model card; no se documenta ningún procesamiento lingüístico) |
| Licencia | MIT (declarada en los metadatos; aplicada a un binario, no a pesos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. La model card describe un programa externo en modo usuario que, según sus afirmaciones, opera mediante Desktop Duplication para el renderizado, realiza sondeos a 319 Hz para el núcleo externo y a 186 Hz para el radar 2D, aplica suavizado de entrada bezier con radio de FOV configurable y ofrece una tecla de pánico (`END`) para liberar handles y terminar el proceso. Ninguno de estos datos se refiere a una red neuronal, a un transformer, a un modelo MoE ni a un sistema SSM.

No se documenta ningún corpus de entrenamiento, ningún número de tokens, ninguna fase de RLHF o DPO, ni ninguna innovación en decodificación. La única "innovación" declarada es la evasión de captura de pantalla en herramientas de streaming, que es una técnica de ocultación de software, no una técnica de aprendizaje automático.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingüe real; las catorce etiquetas de idioma son metadatos sin respaldo técnico.
- Las funciones descritas son propias de un bot de asistencia en juegos: radar 2D, filtro de loot por rareza, seguimiento de contenedores, suavizado de puntería con VisCheck y perfiles JSON intercambiables en caliente.
- No se declara ningún modo de pensamiento, entrada de audio ni procesamiento de imagen más allá de la captura de escritorio para el renderizado superpuesto.

## Casos de uso

No se identifican casos de uso legítimos de ingeniería de IA para este artefacto. Los escenarios que la model card sugiere son los siguientes, todos ellos problemáticos:

- Automatización de partidas multijugador: el binario se presenta como un bot que ejecuta acciones de forma automática, lo que en la práctica constituye una infracción de los términos de servicio de la mayoría de plataformas de juego.
- Puntería asistida en juegos competitivos: el módulo de suavizado bezier con VisCheck está diseñado para imitar movimiento humano y dificultar la detección, lo que supone trampa en entornos competitivos.
- Evasión de la moderación visual: la capa "stream-proof" busca excluir la superposición de OBS, ShadowPlay y Discord, lo que impide que las retransmisiones muestren la ayuda ilegítima.
- Distribución de ejecutables ofuscados: un ZIP de 4,8 MB protegido con contraseña y con instrucciones para ejecutar como administrador y sortear SmartScreen es un patrón habitual de distribución de malware.
- Suplantación de identidad de repositorios: el README enlaza a dos cuentas de GitHub distintas (`Shuhua73716` y `Miguelp03594`) y mezcla nombres de proyectos ajenos (`robrun-trainer-esp-aimbot`), lo que apunta a una operación de señuelo.
- Ingeniería social con insignias falsas: las cifras de descargas y valoración mostradas no coinciden con las métricas reales del repositorio, lo que se usa para generar confianza injustificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas cifras presentes en la model card (respuesta de cambio de perfil en menos de 27 ms, sondeo a 319 Hz y 186 Hz, consistencia del 96,6 % en la capa stream-proof) son afirmaciones de marketing sobre el rendimiento del ejecutable, no mediciones de un modelo de lenguaje y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de sondeo de la model card no son medibles de forma independiente.
- Espacio en disco declarado para el paquete: 4,8 MB comprimido.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA con la que comparar este artefacto, ya que no contiene pesos ni arquitectura. Frente a otros repositorios de Hugging Face, la diferencia relevante es que este no publica ficheros de modelo, tokenizador ni configuración, sino un enlace a un ejecutable alojado en GitHub.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración ni código de inferencia.
- El binario distribuido se entrega comprimido con contraseña y con instrucciones explícitas para ejecutarlo como administrador, un patrón clásico de evasión de análisis automatizado.
- La model card incluye indicaciones para sortear las alertas de Windows Defender y SmartScreen, lo que constituye una señal de alarma de seguridad de primer orden.
- Las métricas mostradas (611 000 descargas, valoración 5,0/5) contradicen las métricas reales del repositorio (0 descargas, 0 likes), lo que indica manipulación del contenido.
- Los enlaces de descarga apuntan a cuentas de GitHub de terceros no verificadas y a nombres de proyecto ajenos, lo que sugiere suplantación o redirección maliciosa.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario y no cubre el uso del software en entornos de juego, donde probablemente infringe los términos de servicio.
- El uso de este tipo de herramientas puede conllevar el bloqueo permanente de cuentas de juego, la exposición de credenciales y la instalación de software no deseado.
- No debe descargarse ni ejecutarse el archivo en entornos de producción ni en máquinas personales sin un análisis en sandbox aislado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CaptainBinge/sonic-shadow-dex-sniper-farmer-bot
- Enlace de descarga citado en la model card (cuenta de terceros): https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026/releases/download/v1.2.0/robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip
- Página de releases citada en la model card (otra cuenta de terceros): https://github.com/Miguelp03594/sonic-shadow-dex-sniper-farmer-bot/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
