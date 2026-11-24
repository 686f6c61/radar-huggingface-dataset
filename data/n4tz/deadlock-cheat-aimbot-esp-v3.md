# N4TZ/deadlock-cheat-aimbot-esp-v3

## Resumen

El artefacto publicado bajo el identificador `N4TZ/deadlock-cheat-aimbot-esp-v3` en Hugging Face **no es un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64 (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) que la model card presenta como una herramienta de trampas (aimbot y ESP, *extra sensory perception*) para el videojuego *Deadlock*. No contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia; el campo `pipeline` aparece como no disponible y el repositorio no incluye ficheros de modelo.

La ficha se ha elaborado a partir de los metadatos y del README disponibles. Todos los campos propios de un modelo de lenguaje (arquitectura, parámetros, contexto, cuantización, benchmarks) figuran como no disponibles porque el artefacto no los posee. La licencia declarada es MIT, si bien su aplicabilidad a un binario de este tipo es dudosa y no exime de las condiciones de uso del videojuego ni de la legislación aplicable.

Desde la perspectiva de un desarrollador o investigador, este repositorio carece de interés técnico como modelo y debe tratarse como software de terceros potencialmente malicioso: la model card incluye instrucciones para desactivar avisos de Windows Defender y SmartScreen, distribución mediante contraseña en el archivo ZIP y enlaces de descarga alojados en repositorios de GitHub ajenos al titular del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; aplicable a la documentación, no a un motor lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es una aplicación compilada para Windows de 64 bits, empaquetada en `robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip` (4,8 MB) y protegida con la contraseña `2026`. Según la model card, el ejecutable se ejecuta con privilegios de administrador y carga módulos denominados "aimbot" (suavizado de entrada Bézier, radio de FOV configurable, comprobación de visibilidad) y "ESP" (superposición externa a 144 Hz, cajas 2D/3D, esqueletos de huesos, radar 2D y filtro de botín).

Las afirmaciones técnicas del README (build `v1.3.4 (21BD45)`, sondeo a 190 Hz, seis hilos de trabajo, latencias inferiores a 27-29 ms, "stream-proof render layer" con un 98,5 % de consistencia) no vienen acompañadas de código fuente, binarios verificables ni metodología de medida, por lo que no son comprobables. No hay información sobre datasets, RLHF, DPO ni ninguna innovación en el sentido en que se aplica a modelos generativos.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos probablemente describen la documentación de la model card.
- El README atribuye al binario funciones de asistencia de puntería y visualización de información del juego (ESP), cuya eficacia no está verificada.
- No se documenta ninguna capacidad de visión, audio o modo de razonamiento.

## Casos de uso

- No se identifican casos de uso legítimos para desarrolladores o investigadores: el artefacto no es un modelo de IA ni una librería reutilizable.
- Auditoría de seguridad defensiva: analizar el binario en un entorno aislado para caracterizar técnicas de evasión de capturas de pantalla y de detección antichéat, con fines de investigación en seguridad de videojuegos.
- Estudio de ingeniería social y distribución de malware: el patrón de ZIP con contraseña, enlaces a repositorios de GitHub de terceros e instrucciones para desactivar Defender es un caso de manual que puede documentarse en formación sobre phishing y *droppers*.
- Docencia sobre riesgos de cadena de suministro: usar la model card como ejemplo de repositorio de Hugging Face cuyo contenido no se corresponde con la categoría del artefacto.
- Análisis de políticas de plataforma: evaluar cómo los hubs de modelos gestionan contenido que no es un modelo y que promueve trampas en videojuegos.
- No se recomienda su ejecución en equipos de producción, de desarrollo ni personales bajo ninguna circunstancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (190 Hz de sondeo, 144 Hz de superposición, latencias de 27-29 ms, 98,5 % de consistencia) son afirmaciones del autor sin metodología ni verificación independiente, y no corresponden a métricas de modelos de IA.

## Requisitos de hardware

- Plataforma: Windows 10 u 11 de 64 bits, según la model card.
- VRAM estimada para inferencia: no aplica (no hay modelo neuronal).
- GPU recomendadas: no disponible; el README no especifica requisitos gráficos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no verificables; las cifras del README carecen de respaldo.
- Requisito operativo declarado: ejecución como administrador, lo que amplía la superficie de riesgo del sistema.

## Comparativa con modelos similares

| Criterio | N4TZ/deadlock-cheat-aimbot-esp-v3 | Modelo de lenguaje open source típico (p. ej. familia Llama, Mistral, Qwen) | Herramienta antichéat legítima (p. ej. EAC, BattlEye) |
|---|---|---|---|
| Naturaleza | Binario Windows x64 | Pesos neuronales + tokenizador | Software de protección del cliente |
| Parámetros | no disponible | 7B-70B+ | no aplica |
| Contexto | no disponible | 4K-128K tokens | no aplica |
| Licencia | MIT (declarada) | Apache 2.0, MIT, Llama Community, etc. | Propietaria |
| Formatos | ZIP con `.exe` | safetensors, GGUF, ONNX | Instalador propietario |
| Uso legítimo | No identificado | Desarrollo, investigación, producto | Integridad competitiva |
| Verificabilidad | Nula (sin código ni hashes) | Alta (pesos y config públicos) | Media (auditorías de terceros) |

No se conocen modelos comparables dentro de la categoría de modelos de IA porque el artefacto no pertenece a ella.

## Limitaciones y advertencias

- **No es un modelo de IA**: no debe evaluarse, integrarse ni citarse como tal en pipelines de ML.
- **Riesgo de seguridad elevado**: la model card instruye a desactivar Windows Defender y SmartScreen, lo que impide las protecciones básicas del sistema operativo.
- **Distribución opaca**: ZIP protegido con contraseña (`2026`), enlaces de descarga alojados en repositorios de GitHub de terceros (`Shuhua73716/...`, `marthason52665/...`) y ausencia de hashes o firmas verificables.
- **Ejecución como administrador**: concede al binario control total sobre el equipo anfitrión.
- **Riesgo legal y de términos de servicio**: el uso de trampas en *Deadlock* infringe las condiciones del juego y puede acarrear el baneo de la cuenta; en algunas jurisdicciones el desarrollo y la distribución de *cheats* tiene implicaciones legales.
- **Licencia MIT dudosa**: no queda claro que el autor tenga derechos para licenciar de este modo el binario ni sus componentes; la licencia no cubre el uso indebido frente a terceros.
- **Sin soporte ni mantenimiento**: 0 descargas y 0 *likes* en el momento de la consulta, creado y actualizado el 2026-11-24, sin historial de versiones verificable.
- **Sesgos y alucinación**: no aplican en el sentido habitual, pero la documentación contiene afirmaciones no contrastadas que funcionan como reclamo comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/N4TZ/deadlock-cheat-aimbot-esp-v3
- Repositorio GitHub citado en la model card: https://github.com/marthason52665/deadlock-cheat-aimbot-esp-v3
- Repositorio GitHub de descarga citado: https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026
- Enlace de descarga directa citado (no verificado, no recomendado): https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026/releases/download/v1.2.0/robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip
- Página del videojuego *Deadlock* (contexto): https://store.steampowered.com/app/1422450/Deadlock/
- No se han encontrado papers, blogs técnicos ni demos asociados en la información proporcionada.
