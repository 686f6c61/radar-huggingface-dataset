# leeakeor/criminal-simulator-script

## Resumen

El repositorio `leeakeor/criminal-simulator-script` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face que se presenta como un supuesto "script" o "cheat trainer" para el videojuego *Criminal Simulator*, empaquetado como un archivo ZIP para Windows (`schedule-1-cheat-trainer-v1.2.2-win64.zip`, 4,8 MB) con instrucciones para ejecutarlo como administrador y una contraseña de descompresión (`2026`).

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento. La model card no describe un modelo de lenguaje, sino la distribución de un binario de terceros alojado en GitHub, con enlaces de descarga, badges decorativos y una sección de preguntas frecuentes orientada a evitar advertencias de Windows Defender y SmartScreen.

Por tanto, esta ficha documenta la ausencia de un modelo evaluable: no es posible analizar capacidades, rendimiento ni requisitos de hardware en el sentido habitual de un modelo de IA. Los datos que figuran a continuación reflejan únicamente lo que el autor declara en la model card, sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado ninguna descripción de arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de modelado. El contenido del repositorio corresponde, según la propia model card, a un binario externo (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build `v3.4.2 (785C84)`) alojado en un repositorio de GitHub de un tercero (`arjunzimmermann624/schedule-1-cheat-trainer`), con instrucciones de extracción mediante contraseña y ejecución con privilegios de administrador.

Los "datos técnicos" que aparecen en la model card (overlay externo a 144 Hz, escáner de offsets dinámicos, suavizado de entrada Bézier, radar 2D, filtro de loot, núcleo externo en modo usuario con menos de 37 MB de RAM) describen supuestas funciones de un programa de trampas para un videojuego, no componentes de un modelo de IA. No hay información verificable sobre su implementación interna.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los idiomas listados son etiquetas de metadatos del repositorio, no capacidades del artefacto.
- No se documenta ningún modo especial (thinking, audio, visión).
- El artefacto declara funciones de tipo "cheat" para un videojuego (overlay, ESP, radar, suavizado de puntería), sin verificación independiente y sin relación con IA.

## Casos de uso

No procede. Al no tratarse de un modelo de IA, no existen casos de uso legítimos de inferencia, generación o análisis. Cualquier uso del artefacto distribuido implicaría ejecutar un binario de origen no verificado con privilegios de administrador en un sistema Windows, lo que constituye un riesgo de seguridad y, potencialmente, una violación de los términos de servicio del videojuego afectado. No se enumeran escenarios de aplicación porque no hay una capacidad técnica de IA que explotar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento autoinformadas sobre el supuesto programa (por ejemplo, "menos de 25 ms" de respuesta del overlay, "menos de 24 ms" del escáner de offsets, "99,1 % de consistencia" del filtro de loot), pero no son benchmarks de un modelo de IA ni han sido verificados de forma independiente; no se reproducen como resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles en el sentido de inferencia de modelos.
- El artefacto declara, según el autor, ejecutarse en Windows 10 (22H2) y Windows 11 (24H2) sobre procesadores x64 de Intel y AMD, con un consumo declarado de menos de 37 MB de RAM. Estos datos no han sido verificados.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, ya que el repositorio no contiene un modelo. Tampoco procede compararlo con otros artefactos de tipo "cheat" porque quedaría fuera del alcance de esta ficha técnica de modelos.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no puede evaluarse en términos de arquitectura, parámetros, contexto o rendimiento.
- El artefacto distribuido es un ejecutable de Windows de origen no verificado, alojado en un repositorio de GitHub de un tercero distinto del propietario del repositorio de Hugging Face.
- La model card incluye instrucciones explícitas para desactivar o evitar advertencias de Windows Defender y SmartScreen, lo que constituye una señal de alarma de seguridad.
- La distribución requiere una contraseña de descompresión (`2026`), práctica habitual para dificultar el análisis automatizado de malware.
- La licencia MIT declarada en los metadatos no aporta ninguna garantía sobre el binario distribuido ni sobre su legalidad en el contexto del videojuego objetivo.
- Riesgo de malware, robo de credenciales o compromiso del sistema si se ejecuta con privilegios de administrador.
- Posible incumplimiento de los términos de servicio del videojuego y de la legislación aplicable sobre trampas en entornos multijugador.
- No debe utilizarse como referencia técnica de ningún modelo de IA ni citarse como tal.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leeakeor/criminal-simulator-script
- Repositorio de GitHub citado en la model card (tercero): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer
- Enlace de descarga del ZIP citado en la model card: https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Repositorio de GitHub alternativo citado en la model card: https://github.com/sandra95508/criminal-simulator-script
- No se han encontrado papers, blogs técnicos ni demos asociados a un modelo de IA en la información disponible.
