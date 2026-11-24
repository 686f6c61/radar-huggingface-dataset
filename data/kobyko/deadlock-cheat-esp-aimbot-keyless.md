# Kobyko/deadlock-cheat-esp-aimbot-keyless

## Resumen

El repositorio `Kobyko/deadlock-cheat-esp-aimbot-keyless` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 etiquetado como herramienta de trampas ("cheat") para el videojuego *Deadlock*: incluye funciones de ESP (extra-sensory perception, visualización de jugadores a través de paredes), aimbot y un overlay externo. La model card describe un ejecutable portable de 8,9 MB, build `v4.7.4 (280C53)`, que se distribuye como archivo ZIP con contraseña y se ejecuta con privilegios de administrador.

El artefacto no expone pesos, tokenizador, configuración de transformer ni pipeline de inferencia. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y el contenido del README confirman que se ha publicado en el Hub como alojamiento de binarios, no como modelo. No hay parámetros, contexto, cuantizaciones ni idiomas en el sentido en que se aplican a un modelo de lenguaje.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado y advierte de que no es evaluable como modelo de IA. Cualquier uso del binario conlleva riesgos de seguridad y de cumplimiento de los términos de servicio del videojuego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del Hub) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion en ZIP: `deadlock-cheat-esp-aimbot-keyless-v1.2.0-win64.zip`, 8,9 MB) |

## Arquitectura y entrenamiento

No aplica. El artefacto es un ejecutable Windows x64 descrito por el autor como "user-mode external core" con overlay externo renderizado por Desktop Duplication, escáner dinámico de offsets y perfiles JSON intercambiables en caliente. No hay información sobre datos de entrenamiento, proceso de alineación (RLHF/DPO) ni innovaciones de modelado, porque no existe un modelo subyacente.

La model card menciona cifras de sondeo ("421 Hz", "459 Hz", "452 Hz") y porcentajes de consistencia ("97,4 %", "97,9 %") sin metodología verificable. Se reproducen aquí como datos declarados por el autor, no como resultados validados.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- El artefacto declara funcionalidades de trampa para *Deadlock*: ESP 2D/3D con cajas delimitadoras, esqueletos de huesos y distancia; radar 2D con filtro de botín por rareza; aimbot; overlay externo a 144 Hz o más.
- Declara exclusión de captura de pantalla en OBS, ShadowPlay y Discord ("stream-proof render layer").
- Multilingüismo: los metadatos listan 14 idiomas, presumiblemente para la interfaz del ejecutable; no verificable.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que el autor describe son:

- Visualización de jugadores a través de geometría en *Deadlock* mediante ESP: pensado para obtener ventaja competitiva; viola los términos de servicio del juego.
- Asistencia de puntería automatizada (aimbot): mismo problema de cumplimiento y riesgo de sanción de la cuenta.
- Radar 2D con filtrado de objetos: idem.
- Overlay externo no capturado por software de grabación: diseñado explícitamente para evadir la detección por parte de terceros.
- Perfiles JSON intercambiables para alternar entre modos "Legit", "Visual" y "Custom": orientado a dificultar la detección.
- Escaneo dinámico de offsets tras parches del juego: mantenimiento de la herramienta frente a actualizaciones.

Ninguno de estos escenarios es recomendable en producción ni en investigación. La ficha los recoge únicamente para documentar lo que el artefacto declara hacer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de frecuencia de sondeo y consistencia que aparecen en la model card no constituyen benchmarks reproducibles ni comparables con métricas de modelos de IA.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica; el autor no especifica requisitos de GPU.
- Compatibilidad declarada: Windows 10 22H2 y Windows 11 24H2, x64.
- Consumo declarado: menos de 64 MB de RAM para la gestión de perfiles.
- Despliegue: ejecución directa del binario `deadlock-cheat-esp-aimbot-keyless-v1.2.0-win64.exe` como administrador; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de "Hz" de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han identificado en la información proporcionada otras publicaciones del mismo autor con las que comparar.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o producción.
- Riesgo de seguridad alto: se distribuye un ejecutable que requiere permisos de administrador, con contraseña de descompresión (`2026`) y con instrucciones para desactivar avisos de Windows Defender y SmartScreen. Este patrón es habitual en la distribución de malware.
- El binario se aloja en un repositorio de GitHub de terceros (`costa949/...`) enlazado desde la model card; la integridad y la autoría no son verificables desde Hugging Face.
- Uso contrario a los términos de servicio de *Deadlock* y potencialmente a la legislación sobre trampas en videojuegos en algunas jurisdicciones; riesgo de suspensión de cuenta.
- La licencia MIT declarada en los metadatos no cubre el uso del videojuego ni exime de responsabilidad por el uso del binario.
- Las cifras de rendimiento de la model card no incluyen metodología ni reproducibilidad.
- No hay evidencia de auditoría, firma de código ni análisis de seguridad del ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/deadlock-cheat-esp-aimbot-keyless
- Repositorio de GitHub enlazado por el autor: https://github.com/costa949/deadlock-cheat-esp-aimbot-keyless
- Descarga directa declarada (ZIP): https://github.com/costa949/deadlock-cheat-esp-aimbot-keyless/releases/latest/download/deadlock-cheat-esp-aimbot-keyless-v1.2.0-win64.zip
- Página de releases: https://github.com/costa949/deadlock-cheat-esp-aimbot-keyless/releases/latest
