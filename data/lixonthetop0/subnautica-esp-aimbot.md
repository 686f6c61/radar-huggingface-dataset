# lixonthetop0/subnautica-esp-aimbot

## Resumen

El artefacto publicado bajo el identificador `lixonthetop0/subnautica-esp-aimbot` en Hugging Face no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un ejecutable portable para Windows 10/11 de 64 bits, empaquetado en un archivo ZIP de 4,8 MB (`rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip`, protegido con la contraseña `2026`), que la model card describe como una herramienta de trampas para el videojuego Subnautica: superposición externa de ESP (cajas delimitadoras 2D/3D, esqueletos de huesos y distancia), radar 2D con filtrado de botín y un módulo de aimbot con suavizado de entrada por curvas de Bézier.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo entrenado. La model card está redactada como una página de descarga de software (instrucciones de instalación, contraseña del archivo, preguntas frecuentes sobre falsos positivos de Windows Defender y SmartScreen), no como documentación técnica de un modelo. Por tanto, no existe información sobre arquitectura, parámetros, contexto, datos de entrenamiento ni benchmarks que pueda evaluarse en los términos habituales de una ficha de modelo.

Esta ficha se redacta, por rigor, dejando constancia explícita de esa naturaleza y marcando como "no disponible" todos los campos técnicos propios de un modelo de IA. Se advierte de que la publicación presenta patrones característicos de distribución de software potencialmente malicioso (binario ejecutable, archivo comprimido con contraseña para evadir análisis automáticos, instrucciones para desactivar avisos del sistema y ejecutar como administrador) y de que el uso de herramientas de trampas en juegos multijugador puede vulnerar los términos de servicio del juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable nativo x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio; no verificable como capacidad del binario) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No aplica. No se ha publicado ninguna arquitectura de red neuronal, ningún conjunto de datos de entrenamiento, ningún proceso de ajuste (RLHF, DPO, SFT) ni ninguna innovación técnica de inferencia. La model card describe únicamente módulos de un programa de trampas: superposición externa a 144 Hz o más, escáner dinámico de offsets con ocho hilos de trabajo, radar 2D con sondeo a 241 Hz, núcleo externo en modo usuario con renderizado por Desktop Duplication, suavizado de entrada por Bézier y descarga de emergencia mediante la tecla `END`. Consumo declarado: menos de 31 MB de RAM. Ninguno de estos datos es verificable desde el repositorio.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No dispone de tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo de lenguaje; las etiquetas de idioma del repositorio no corresponden a ninguna funcionalidad descrita.
- Según la model card (no verificado), el binario implementaría ESP con cajas 2D/3D, esqueletos y distancia, radar 2D con filtro de botín por rareza, aimbot con radio de FOV configurable y comprobación de visibilidad, y cierre de proceso mediante tecla de pánico.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no es un modelo de IA. Los escenarios que la model card sugiere son todos de trampas en un videojuego:

- Superposición de información en partidas de Subnautica: mostraría posiciones de entidades y objetos a través del motor gráfico mediante una capa externa.
- Asistencia de puntería automatizada: el módulo de aimbot desplazaría el cursor hacia objetivos dentro del radio de FOV configurado.
- Localización de recursos: el radar 2D con filtro de rareza permitiría priorizar contenedores y objetos de interés.
- Automatización de sesiones de juego: no documentada, pero implícita en la naturaleza del artefacto.
- Investigación sobre detección de trampas: el binario podría servir, en un entorno aislado y con fines defensivos, para estudiar técnicas de superposición externa y evasión de firmas; requiere aislamiento estricto y no debe ejecutarse en máquinas de producción.
- Análisis de malware: dado el patrón de distribución (ZIP con contraseña, instrucciones para desactivar SmartScreen, ejecución como administrador), el artefacto es un candidato razonable para análisis en una sandbox por parte de equipos de seguridad.

Ninguno de estos casos constituye un uso recomendado del artefacto en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento del propio programa (coherencia del 99,4 %, sondeo a 241 Hz, superposición a 144 Hz o más, menos de 31 MB de RAM, ocho hilos de trabajo), pero no son benchmarks de modelos de IA ni están verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica; el programa declara funcionar sobre Windows 10/11 x64 en procesadores Intel y AMD, sin requisitos de GPU documentados.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card (144 Hz, 241 Hz, 99,4 %) no son verificables.
- Requisitos del sistema declarados: Windows 10/11 de 64 bits, 4,8 MB de espacio en disco para el ZIP, menos de 31 MB de RAM en ejecución, privilegios de administrador.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de la categoría real del repositorio (software de trampas para juegos), no se dispone de datos verificables de otras publicaciones equivalentes.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; etiquetarlo o evaluarlo como tal carece de sentido técnico.
- Distribución mediante ZIP protegido con contraseña (`2026`), práctica habitual para dificultar el análisis automático por parte de antivirus y plataformas.
- La model card instruye explícitamente a desactivar o ignorar avisos de Windows Defender y SmartScreen y a ejecutar el binario como administrador: señal de riesgo elevado.
- El binario procede de enlaces de descarga alojados en repositorios de GitHub de terceros, no del propio repositorio de Hugging Face; no hay verificación de integridad ni firma de código.
- Uso de trampas en juegos multijugador: puede conllevar el bloqueo de la cuenta y vulnera los términos de servicio del juego; en algunas jurisdicciones puede tener implicaciones legales.
- Licencia MIT declarada, pero aplicable a un artefacto cuyo contenido real no está auditado; la licencia no garantiza la seguridad del binario.
- Riesgo de alucinación, sesgos y limitaciones de contexto: no aplica, al no ser un modelo de lenguaje.
- No debe ejecutarse en entornos corporativos, servidores de producción ni máquinas con datos sensibles sin aislamiento previo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lixonthetop0/subnautica-esp-aimbot
- Enlace de descarga citado en la model card (ZIP, contraseña `2026`): https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/Hiroshis198/subnautica-esp-aimbot
- No se han encontrado papers, blogs técnicos ni demos asociados en la información disponible.
