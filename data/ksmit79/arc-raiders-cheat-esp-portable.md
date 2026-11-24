# Ksmit79/arc-raiders-cheat-esp-portable

## Resumen

El artefacto publicado bajo el identificador `Ksmit79/arc-raiders-cheat-esp-portable` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta herramienta de trampas (cheat) con funcionalidad ESP (Extra Sensory Perception, visualización de elementos a través de paredes) para el videojuego *Arc Raiders*, empaquetada como aplicación portable para Windows de 64 bits. El autor, `Ksmit79`, lo publica con licencia MIT y metadatos que simulan ser los de un modelo (etiquetas de idioma, región, pipeline), pero no incluye pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo entrenado.

La model card describe un ejecutable (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) distribuido en un ZIP de 4,8 MB, alojado en un repositorio de GitHub de terceros, protegido con contraseña de archivo (`2026`) y con instrucciones para ejecutarlo como administrador. Las funcionalidades declaradas incluyen superposición externa de cajas 2D/3D, esqueletos de huesos, radar 2D, filtro de botín, escáner de offsets dinámicos y una tecla de pánico para descargar el proceso.

Desde la perspectiva de evaluación de modelos, esta ficha no puede completarse con datos técnicos de IA porque no existen. El artefacto es relevante únicamente como caso de mal uso de la plataforma Hugging Face: un binario de dudosa procedencia, sin trazabilidad, con enlaces de descarga externos, contraseña en el archivo y ejecución con privilegios elevados, lo que constituye un patrón clásico de distribución de software potencialmente malicioso. No debe descargarse ni ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas por el autor, sin relación con capacidades reales) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no pesos safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de inferencia que describir. El contenido del repositorio es un binario compilado para Windows x64 presentado como "herramienta portable" con una supuesta versión `v1.5.2 (725886)` y un tamaño de paquete de 4,8 MB, datos que no corresponden a ningún artefacto de aprendizaje automático.

La model card imita el formato de una ficha técnica de modelo (badges, tabla de subsistemas, FAQ, instrucciones de instalación) pero el contenido real es una guía de instalación de software de terceros. Menciona mecanismos como "hot-swap JSON profiles", "dynamic offset scanner" y "panic key unload", que son técnicas habituales en herramientas de modificación de memoria de procesos de videojuegos, no en modelos de lenguaje.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma son metadatos copiados del formato de model card.
- Las únicas "capacidades" declaradas por el autor son funcionalidades de trampa en un videojuego: superposición ESP, radar 2D, filtro de botín, escáner de offsets y descarga por tecla de pánico.
- No dispone de modo thinking, visión, audio ni ninguna modalidad de modelo fundacional.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que el autor plantea son de uso de trampas en un videojuego multijugador, lo que en la mayoría de jurisdicciones y plataformas viola los términos de servicio y puede constituir infracción contractual o incluso ilícito civil. Se enumeran a continuación únicamente para documentar el contenido declarado, no como recomendación:

- Trampas visuales en *Arc Raiders*: el autor declara superposición de cajas 2D/3D y esqueletos para localizar jugadores a través de paredes; su uso conlleva riesgo de expulsión permanente de la cuenta y de la plataforma.
- Radar y filtro de botín: visualización de objetos y contenedores por rareza; mismo riesgo de sanción y de compromiso de seguridad del equipo donde se ejecute.
- Exclusión de captura en streaming: el autor afirma que la superposición es invisible para OBS, ShadowPlay y Discord; esta funcionalidad se asocia habitualmente a la evasión de detección, no a un uso productivo.
- Escáner de offsets tras parches: mecanismo para readaptar la herramienta a actualizaciones del juego; requiere ejecución con privilegios de administrador.
- Distribución de binarios con contraseña: patrón habitual en campañas de malware; el archivo se aloja en un repositorio de GitHub ajeno al autor declarado.
- Ninguno de estos escenarios constituye un caso de uso de IA evaluable técnicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el artefacto no es un modelo. Las cifras que aparecen en la model card (747K descargas, valoración 4,8/5, latencia de 28 ms, consistencia del 99,8 %) son afirmaciones del autor sin verificación independiente y no son métricas de rendimiento de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica; el artefacto declara ejecutarse en CPU x64.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits, procesadores Intel y AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un `.exe` que, según el autor, requiere ejecución como administrador.
- Latencia y throughput: no disponibles como métricas de IA; el autor cita cifras no verificables de respuesta inferior a 28 ms y uso de RAM inferior a 36 MB.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Frente a modelos reales de la plataforma (por ejemplo, familias de modelos de lenguaje abiertos con pesos safetensors y arquitecturas transformer), este repositorio carece de parámetros, contexto, licencia de pesos y artefactos evaluables; la única coincidencia es el uso del formato de model card de Hugging Face.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje, visión o multimodal carece de sentido técnico.
- Riesgo de seguridad alto: binario de procedencia no verificada, distribuido mediante enlace externo a un repositorio de GitHub de terceros, protegido con contraseña de archivo y con instrucciones para ejecutarlo como administrador. Este patrón es habitual en la distribución de malware, troyanos o stealers.
- Sin trazabilidad: el identificador del autor en Hugging Face (`Ksmit79`) no coincide con las cuentas de GitHub referenciadas en la model card (`Roussel10024`, `Gretao8833`), lo que impide atribuir el artefacto a un desarrollador identificable.
- Riesgo legal y de plataforma: el uso de trampas en juegos multijugador puede violar los términos de servicio, acarrear la suspensión permanente de cuentas y, según la jurisdicción, responsabilidad civil.
- Licencia MIT declarada sobre un binario: la licencia MIT no aporta garantías de seguridad ni de legalidad del contenido; se aplica al software, no legitima su uso ilícito.
- Etiquetas de idioma y región engañosas: los metadatos `language`, `region:us` y `pipeline` imitan los de un modelo real, lo que puede inducir a error a herramientas de descubrimiento automático.
- Sin soporte, mantenimiento ni documentación técnica verificable: la "FAQ" de la model card es material promocional, no documentación de ingeniería.
- Recomendación: no descargar, extraer ni ejecutar el archivo; si se ha hecho, analizarlo con antivirus actualizado y revisar la integridad del sistema.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ksmit79/arc-raiders-cheat-esp-portable
- Repositorio de GitHub referenciado en la model card (descarga del ZIP): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub referenciado para la contraseña y releases: https://github.com/Gretao8833/arc-raiders-cheat-esp-portable/releases/latest
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información disponible.
