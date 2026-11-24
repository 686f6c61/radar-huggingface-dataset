# Ally0/probably-stolen-cheat-trainer

## Resumen

`Ally0/probably-stolen-cheat-trainer` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un ejecutable de Windows (`schedule-1-cheat-trainer-2026-v1.2.2-win64.zip`, 4,8 MB) presentado por su autor como un "cheat trainer" para juegos, con módulos de puntería asistida, radar 2D y filtrado de objetos. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje, y su propia model card se limita a instrucciones de descarga y ejecución del binario.

El nombre del repositorio ("probably-stolen", es decir, "probablemente robado") y la estructura de la model card —badges de descargas y valoraciones no verificables, enlace a un ZIP alojado en un repositorio de GitHub de terceros distinto del autor, contraseña de archivo y recomendación explícita de desactivar avisos de Windows Defender y SmartScreen— son patrones habituales en campañas de distribución de software malicioso. La fecha de creación declarada (2026-11-24) es futura respecto a la información disponible, lo que refuerza la inconsistencia de los metadatos.

Por tanto, esta ficha no puede documentar especificaciones técnicas de un modelo inexistente. Se redacta con el objetivo de advertir a desarrolladores e investigadores y de dejar constancia de que el artefacto no debe descargarse ni ejecutarse en ningún entorno, y mucho menos en máquinas de desarrollo o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no verificables) |
| Licencia | MIT (declarada en los metadatos; sin fichero de licencia verificable en la información disponible) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que documentar. El artefacto distribuido es un ejecutable de Windows de 64 bits empaquetado en un ZIP de 4,8 MB con contraseña (`2026`), que la model card describe como un "user-mode external core" con lectura de memoria de procesos, suavizado de entrada Bézier, escáner de offsets dinámicos y radar 2D. Estas descripciones corresponden a técnicas típicas de trampas para videojuegos (lectura de memoria de otro proceso, inyección de entrada), no a componentes de un modelo de lenguaje.

No se dispone de información sobre datasets, tokens de entrenamiento, RLHF, DPO ni ninguna innovación técnica de modelado. Cualquier afirmación en ese sentido sería inventada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas del repositorio, no capacidades del artefacto.
- El artefacto declarado es un ejecutable para Windows 10 (22H2) y Windows 11 (24H2) x64 que, según su propia descripción, interactúa con la memoria de otros procesos y simula entrada de ratón.
- No hay demos, API, endpoints ni inferencia posible en Hugging Face.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que la model card sugiere son:

- Automatización de puntería en videojuegos: el binario declara suavizado Bézier y radio de FOV configurable sobre procesos de juego, lo que constituye trampa y viola habitualmente los términos de servicio de las plataformas.
- Lectura de memoria de otros procesos: el "dynamic offset scanner" implica acceso a memoria ajena, con implicaciones de seguridad y legales.
- Distribución de ejecutables con contraseña y evasión de antivirus: el patrón (ZIP con contraseña, instrucciones para desbloquear Defender/SmartScreen) es característico de malware.
- Ingeniería social y suplantación de identidad de proyectos: el nombre "probably-stolen" y los badges de descargas falsos buscan generar confianza infundada.
- Recolección de credenciales o despliegue de troyanos: riesgo plausible dado el canal de distribución (GitHub de terceros, no el repositorio oficial del autor).
- Ninguno de estos escenarios es recomendable; se listan únicamente como descripción del riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluación alguna, y las cifras de la model card (337K descargas, valoración 5,0/5, "96,2 % de consistencia", "447 Hz de sondeo") no son verificables ni corresponden a métricas de modelos.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo.
- GPU: no aplica.
- CPU/RAM: el artefacto declara ejecutarse en Windows x64 con menos de 42 MB de RAM según su propia model card (dato no verificado).
- Despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; las cifras de "447 Hz" y "cero picos de frame-time" son afirmaciones del autor sin verificación independiente.
- Advertencia: no ejecutar el binario en ninguna máquina, y menos en estaciones de desarrollo, servidores de entrenamiento o entornos con credenciales.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: el artefacto no es un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o audio sería categóricamente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en pipelines de inferencia.
- Riesgo de malware: ZIP con contraseña, enlace de descarga alojado en un repositorio de GitHub de terceros distinto del autor declarado, e instrucciones explícitas para desactivar Windows Defender y SmartScreen.
- Suplantación: el nombre del repositorio admite que el contenido es "probablemente robado"; los badges de descargas y valoración no son verificables.
- Metadatos incoherentes: fecha de creación futura (2026-11-24) y pipeline no disponible.
- Licencia MIT declarada sin fichero verificable; en cualquier caso, una licencia de software no legitima el uso de trampas en juegos ni la distribución de binarios potencialmente maliciosos.
- Implicaciones legales: la lectura de memoria de otros procesos y la manipulación de entrada pueden vulnerar términos de servicio, leyes de protección de datos y normativa sobre fraude informático según la jurisdicción.
- Recomendación: no descargar, no extraer, no ejecutar y reportar el repositorio a Hugging Face para su retirada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ally0/probably-stolen-cheat-trainer
- Repositorio de GitHub citado en la model card (no oficial, de terceros): https://github.com/jacqueshayashi7282/probably-stolen-cheat-trainer
- Enlace de descarga directa citado en la model card (no seguir): https://github.com/francescoc822/schedule-1-cheat-trainer-2026/releases/download/v1.2.0/schedule-1-cheat-trainer-2026-v1.2.2-win64.zip
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
