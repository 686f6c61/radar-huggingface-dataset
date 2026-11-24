# Soeyazar/dune-awakening-cheat-esp-portable

## Resumen

`Soeyazar/dune-awakening-cheat-esp-portable` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un binario ejecutable para Windows x64, empaquetado en un archivo ZIP de 4,8 MB protegido con contraseña, presentado por su autor como una herramienta de trampas (cheat) con overlay ESP para el videojuego *Dune: Awakening*. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje o de visión.

La model card describe módulos de escaneo dinámico de offsets, una capa de renderizado que evita la captura por OBS, ShadowPlay y Discord, suavizado de entrada Bézier para el apuntado, perfiles JSON intercambiables en caliente y una tecla de pánico (`END`) para descargar el proceso. Todos estos elementos son funcionalidades de un programa de asistencia en juegos multijugador, no capacidades de un modelo.

Por tanto, esta ficha no puede evaluar arquitectura, parámetros, contexto, cuantizaciones ni benchmarks. Se documenta el repositorio tal como aparece, se señalan los riesgos de seguridad asociados a la ejecución de binarios de procedencia no verificada y se indica la ausencia total de datos técnicos de IA. La relevancia para desarrolladores e investigadores es nula desde el punto de vista de modelos; sí es relevante como caso de mal uso de la plataforma Hugging Face para distribuir ejecutables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no se refiere a capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no pesos) |
| Tamano del artefacto | 4,8 MB (ZIP `dandys-world-forsaken-script-2026-v1.2.2-win64.zip`, contraseña `2026`) |
| Plataforma objetivo | Windows 11 / Windows x64 |
| Build declarado | v3.8.2 (F9E044) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio apunta a un ejecutable externo en modo usuario que, según la model card, emplea *Desktop Duplication* para renderizar el overlay sin inyectar DLLs en el proceso del juego. Los módulos descritos (escáner de offsets, suavizado Bézier, perfiles JSON, tecla de pánico) son componentes de ingeniería de software de un cheat, no capas de un transformer, MoE, SSM ni modelo híbrido.

No hay información sobre dataset, tokens de entrenamiento, RLHF, DPO ni ninguna innovación de modelado. Cualquier afirmación sobre arquitectura o entrenamiento en este contexto sería inventada.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código, no resuelve matemáticas ni procesa visión.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los códigos de idioma del repositorio son etiquetas de metadatos.
- Funcionalidad declarada por el autor (no verificada): overlay ESP, escaneo dinámico de offsets, suavizado de apuntado, perfiles intercambiables y descarga por tecla de pánico.
- No hay demo, API, endpoint ni *inference provider* asociado.

## Casos de uso

No procede. Un binario de trampas para un juego multijugador no tiene casos de uso legítimos para desarrolladores o investigadores de IA. Los escenarios que se listan a continuación describen únicamente lo que el autor declara, no recomendaciones de uso:

- Overlay informativo en el juego: el autor describe una capa de renderizado por *Desktop Duplication* que muestra información superpuesta.
- Ajuste de apuntado: se menciona suavizado Bézier con radio de FOV configurable y comprobación de visibilidad.
- Perfiles de configuración: cambio con una tecla entre presets "Legit", "Visual" y "Custom" mediante JSON.
- Descarga rápida: tecla `END` para liberar handles y cerrar el proceso.
- Ejecución portable: no requiere instalación, se ejecuta como administrador en Windows x64.
- Compatibilidad con capturadoras: el autor afirma exclusión de OBS, ShadowPlay y Discord.

Ninguno de estos casos es adecuado para producción, investigación ni desarrollo de software legítimo. El uso de trampas en juegos multijugador suele violar los términos de servicio y puede conllevar el baneo de cuentas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de ningún tipo; las cifras de latencia y memoria que aparecen en la model card (`< 32 ms`, `433 Hz`, `< 31 MB`, `< 37 MB`) son afirmaciones del autor sobre el comportamiento del ejecutable, no resultados medidos ni reproducibles.

## Requisitos de hardware

- VRAM: no aplica; no es un modelo de IA.
- GPU: no aplica; el autor menciona *Desktop Duplication*, que es una API de captura de pantalla de Windows, no un requisito de cómputo.
- CPU/RAM: el autor declara menos de 37 MB de RAM en el módulo de núcleo externo; no verificable.
- Sistema operativo: Windows 11 / Windows x64.
- Despliegue: ejecución directa del `.exe` como administrador; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras del autor no son medibles ni auditables.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA con el que comparar. Si se compara como artefacto de software, los equivalentes serían otros binarios de cheat distribuidos fuera de canales oficiales, para los que no hay datos públicos fiables de rendimiento, seguridad ni licencia.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse, evaluarse ni desplegarse como tal.
- Riesgo de seguridad alto: se distribuye un `.exe` de procedencia no verificada, protegido con contraseña (`2026`) y alojado en un repositorio con cero descargas y cero validación de la comunidad. El binario no es auditable sin ejecutarlo o analizarlo en un entorno aislado.
- La contraseña en el archivo y la instrucción de ejecutar como administrador son patrones habituales en la distribución de *malware* y *droppers*; la propia model card reconoce que Windows Defender y SmartScreen pueden alertar.
- Uso prohibido por los términos de servicio de *Dune: Awakening*; riesgo de baneo permanente de cuentas y de sanciones por parte del editor.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido del binario ni sobre su legalidad en la jurisdicción del usuario.
- El repositorio mezcla etiquetas de modelo (idiomas, licencia) con un artefacto que no es un modelo, lo que constituye un uso engañoso de la plataforma.
- No hay información sobre sesgos, alucinación ni limitaciones de contexto porque no aplica.
- Fecha de creación futura (2026-11-24) respecto a la fecha habitual de consulta: metadato anómalo que refuerza la falta de fiabilidad del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Soeyazar/dune-awakening-cheat-esp-portable
- Enlace de descarga citado en la model card (GitHub, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub, no verificado): https://github.com/fabioishii77723/dune-awakening-cheat-esp-portable/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
