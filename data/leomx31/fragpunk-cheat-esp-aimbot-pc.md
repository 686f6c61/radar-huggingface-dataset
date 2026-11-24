# leomx31/fragpunk-cheat-esp-aimbot-pc

## Resumen

El repositorio `leomx31/fragpunk-cheat-esp-aimbot-pc` no contiene un modelo de inteligencia artificial ni pesos entrenados. Se trata de un paquete de software malicioso distribuido a través de Hugging Face que se presenta como una herramienta de trampas (cheat) para el videojuego Fragpunk, con módulos de tipo ESP (detección de enemigos en pantalla) y aimbot (asistencia de puntería). El artefacto real es un ejecutable de Windows de 4,8 MB empaquetado en un ZIP protegido con contraseña, alojado en repositorios de GitHub de terceros y no en la propia plataforma de Hugging Face.

La model card no describe ninguna arquitectura de red neuronal, conjunto de datos de entrenamiento, tokenizador ni proceso de inferencia. Los campos "pipeline", parámetros, contexto y formato de pesos están vacíos o son inaplicables. Los tags declarados (`windows`, `windows-11`, `x64`, `portable`) y los idiomas listados (14 códigos ISO) no corresponden a capacidades lingüísticas de un modelo, sino a la metadata genérica que el autor ha rellenado para aumentar la visibilidad del paquete en las búsquedas.

La relevancia de esta ficha es exclusivamente como advertencia de seguridad: el patrón (repositorio recién creado, cero descargas y likes, enlaces a binarios externos con contraseña, instrucciones para ejecutar como administrador y desactivar alertas de SmartScreen) coincide con campañas habituales de distribución de malware. No debe tratarse como un modelo evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los 14 códigos de la model card son metadata del paquete, no capacidades del modelo) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto es un `.exe` de Windows dentro de un `.zip`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El contenido descrito en la model card es un ejecutable nativo de Windows x64 (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`, build `v1.2.9 (E8F06D)`) que, según el texto del autor, implementa un overlay externo a 144 Hz, un núcleo en modo usuario sin inyección de DLL, perfiles JSON intercambiables en caliente, una tecla de pánico (`END`) para descargar el proceso y un escáner dinámico de offsets. Ninguno de estos componentes implica entrenamiento, ajuste fino, RLHF ni datos supervisados.

El paquete se distribuye mediante enlaces a GitHub Releases de terceros (`cishii039/rob-run-cheat-mod-menu` y `joanna055/fragpunk-cheat-esp-aimbot-pc`), protegido con la contraseña `2026` y con instrucciones explícitas de ejecutarlo como administrador. La model card incluye además una sección de preguntas frecuentes que pide al usuario ignorar las alertas de Windows Defender y SmartScreen, lo que constituye una señal de riesgo clara.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son metadata.
- El binario afirma ofrecer ESP (cajas 2D/3D, esqueletos de huesos, distancia), aimbot con suavizado Bézier y comprobación de visibilidad, pero estas funciones no son verificables desde la información disponible y su uso implica la ejecución de código de procedencia no fiable.

## Casos de uso

- Auditoría de seguridad defensiva: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para identificar indicadores de compromiso y firmas de malware antes de bloquearlo en la red corporativa.
- Formación en concienciación: usar este repositorio como ejemplo real de ingeniería social (contraseña en el ZIP, instrucciones para desactivar SmartScreen) en sesiones de seguridad para empleados.
- Investigación de fraude en plataformas de modelos: documentar el patrón de repositorios que abusan de Hugging Face para alojar binarios y alimentar clasificadores automáticos de contenido malicioso.
- Respuesta a incidentes: si un equipo ha ejecutado el `.exe`, emplear la información de la model card (nombres de archivo, build `E8F06D`, rutas de descarga) para buscar artefactos en los endpoints afectados.
- Cumplimiento normativo: registrar el repositorio como ejemplo de contenido prohibido por los términos de servicio de la plataforma, útil en procesos de moderación y en la elaboración de políticas internas.
- Análisis de cadena de suministro: rastrear los enlaces a GitHub Releases de terceros para identificar infraestructura reutilizada en otras campañas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (descargas, valoración, consistencia del 96,2 %) son afirmaciones del autor sin verificación y no constituyen métricas de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisitos del binario declarados por el autor: Windows x64 (Windows 11 incluido), menos de 50 MB de RAM y cero dependencias externas según la model card; no verificable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leomx31/fragpunk-cheat-esp-aimbot-pc` | Binario de Windows (no es modelo de IA) | no aplica | no aplica | MIT declarada | Repositorio de HF con enlaces externos |
| Modelo de IA comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No existe una categoría de modelos de IA comparable porque el artefacto no es un modelo. Cualquier comparación con LLM, modelos de visión o sistemas multimodales sería improcedente.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de MMLU, HumanEval, GSM8K ni similares.
- Riesgo de seguridad alto: el paquete pide ejecución como administrador, contraseña en el ZIP y desactivación de SmartScreen/Defender, patrón típico de distribución de malware.
- Procedencia no fiable: los binarios se alojan en repositorios de GitHub de terceros no vinculados al autor del repositorio de Hugging Face.
- Licencia MIT declarada, pero aplicable al contenido del repositorio, no al binario externo, cuya licencia y código fuente no se facilitan.
- Uso prohibido por los términos de servicio de Hugging Face y por las condiciones de uso de Fragpunk; su empleo puede conllevar el bloqueo de cuentas y acciones legales.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere un repositorio recién creado y sin validación comunitaria.
- No debe ejecutarse en equipos de producción, personales ni de investigación sin aislamiento estricto.
- Los idiomas listados no implican capacidades lingüísticas; son metadata destinada a posicionamiento en búsquedas.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/leomx31/fragpunk-cheat-esp-aimbot-pc
- Enlace de descarga citado en la model card (GitHub Releases, terceros): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub citado como alternativo: https://github.com/joanna055/fragpunk-cheat-esp-aimbot-pc/releases/latest
- Paper, blog o demo oficial: no disponible
