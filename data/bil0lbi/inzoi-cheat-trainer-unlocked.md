# biL0Lbi/inzoi-cheat-trainer-unlocked

## Resumen

El repositorio `biL0Lbi/inzoi-cheat-trainer-unlocked` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 etiquetado como "cheat trainer" del videojuego *Inzoi*, empaquetado como archivo ZIP de 4,8 MB con un ejecutable (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`) que se distribuye a través de enlaces externos a GitHub Releases. La model card describe módulos de overlay, radar 2D, filtrado de loot y suavizado de entrada por curvas de Bézier, todos ellos funcionalidades propias de una herramienta de trampas para un videojuego, no de un modelo de lenguaje.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador, dataset de entrenamiento ni pesos en formatos estándar (safetensors, GGUF). Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) confirman que el artefacto es un binario de plataforma, no un modelo. Esta ficha se redacta, por tanto, señalando explícitamente la ausencia de los datos técnicos requeridos y advirtiendo de los riesgos asociados a la distribución.

La relevancia de documentar este caso es doble: por un lado, ilustra la presencia de contenido ajeno a modelos de IA en el Hub de Hugging Face; por otro, la model card incluye patrones típicos de distribución de software potencialmente malicioso (contraseña fija en el archivo comprimido, enlaces a repositorios de terceros no verificados, instrucciones para ejecutar como administrador), lo que justifica una advertencia clara para desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con `.exe`; tamaño declarado 4,8 MB) |

## Arquitectura y entrenamiento

No disponible. La model card no describe ninguna arquitectura de red neuronal, proceso de entrenamiento, corpus de datos, tokens procesados ni técnicas de alineación (RLHF, DPO). Los elementos descritos en el README (overlay externo a 144 Hz, radar 2D, escáner de offsets dinámicos, núcleo externo en modo usuario con Desktop Duplication) corresponden a componentes de un programa de modificación de memoria de un juego en tiempo de ejecución, no a un sistema de aprendizaje automático.

El paquete se presenta como un binario portable para Windows 10 (22H2) y Windows 11 (24H2), con un ejecutable que requiere privilegios de administrador y un archivo ZIP protegido con la contraseña fija `2026`. No se aporta información sobre compilación, dependencias, firma de código ni cadena de custodia del binario.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades multilingües reales; los idiomas listados en los metadatos son etiquetas de la model card, no capacidades del artefacto.
- Las funcionalidades descritas por el autor son propias de una herramienta de trampas: overlay con cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, radar 2D, filtro de loot por rareza, perfiles JSON intercambiables en caliente y suavizado de entrada por Bézier.

## Casos de uso

- No aplica como modelo de IA. No se identifican casos de uso legítimos de procesamiento de lenguaje, visión o razonamiento.
- Auditoría de seguridad: el artefacto puede emplearse como muestra en análisis de malware o de distribución de software no verificado, dado el patrón de contraseña fija y ejecución como administrador.
- Estudio de moderación de contenido en hubs de modelos: sirve como ejemplo de publicación ajena a la categoría de modelos de IA que requiere políticas de cuarentena o etiquetado.
- Investigación sobre integridad de videojuegos: análisis de las técnicas descritas (Desktop Duplication, escaneo de offsets, overlays externos) desde la perspectiva de la detección antitrampas.
- Formación en concienciación: caso práctico de ingeniería social en model cards (badges de descargas y valoraciones no verificables, enlaces a repositorios de terceros).
- No se recomienda su ejecución en entornos de producción, investigación ni desarrollo por los riesgos descritos en la sección de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona cifras internas no verificables (respuesta en menos de 31 ms para el cambio de perfiles, consistencia del 97,9 % en el escáner de offsets, 4/10/8/12 hilos de trabajo según módulo), pero no se aporta metodología, hardware de referencia ni reproducibilidad.

## Requisitos de hardware

- Sistema operativo: Windows 10 22H2 o Windows 11 24H2, x64 (Intel o AMD).
- VRAM estimada: no disponible (no es un modelo de IA; no requiere GPU para inferencia de red neuronal).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama, TGI no son relevantes).
- Latencia y throughput: no disponibles de forma verificable; las cifras del autor no son reproducibles.
- Espacio en disco declarado: 4,8 MB para el ZIP; el tamaño descomprimido no se especifica.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" para este artefacto dentro del ecosistema de IA open source. Como referencia de contraste:

| Criterio | Este artefacto | Modelo de IA típico en el Hub |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos neuronales (safetensors/GGUF) |
| Parámetros | no disponible | Millones a cientos de miles de millones |
| Contexto | no disponible | Miles a millones de tokens |
| Licencia | MIT | Variable (Apache-2.0, MIT, Llama, etc.) |
| Uso previsto | Modificación de videojuego | Generación, razonamiento, código, visión |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal. Cualquier expectativa de generación de texto, código o razonamiento es infundada.
- Riesgo de seguridad elevado: distribución de un ejecutable de procedencia no verificada, con contraseña fija en el ZIP (`2026`) que impide el escaneo previo por parte de antivirus y motores de análisis, y con instrucciones explícitas de ejecución como administrador.
- Enlaces a repositorios de terceros: el README apunta a cuentas de GitHub (`YokoCastro3813`, `idas46`) no vinculadas al autor del repositorio de Hugging Face, lo que dificulta la trazabilidad y la cadena de custodia del binario.
- Métricas no verificables: los badges de descargas (216K+), valoración (5,0/5) y tamaño no son contrastables con los datos del Hub (0 descargas, 0 likes en el momento de la consulta).
- Licencia MIT declarada: aunque permite uso comercial teórico, la licencia no exime de responsabilidad legal por el uso del software en juegos con términos de servicio que prohíben trampas, ni de posibles reclamaciones de terceros.
- Idiomas listados sin respaldo técnico: las 14 etiquetas de idioma no corresponden a capacidades verificadas del artefacto.
- Posible incumplimiento de las políticas del Hub: la publicación de binarios ajenos a la categoría de modelos puede vulnerar las guías de contenido de Hugging Face.
- No apto para producción: sin firma de código, sin auditoría, sin soporte y con vectores de ataque potenciales (ejecución con privilegios elevados, carga de perfiles JSON externos).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/biL0Lbi/inzoi-cheat-trainer-unlocked
- Release enlazada en la model card (terceros, no verificada): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Repositorio de releases alternativo (terceros, no verificado): https://github.com/idas46/inzoi-cheat-trainer-unlocked/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
