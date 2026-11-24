# smpark888/arc-raiders-cheat-esp-unlocked

## Resumen

El repositorio `smpark888/arc-raiders-cheat-esp-unlocked` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software malicioso o no relacionado con el ecosistema de modelos, distribuido como un ejecutable de Windows (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`) que la model card presenta como una herramienta de trampas (ESP y aimbot) para el videojuego Arc Raiders. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La model card describe un binario portable de 4,8 MB para Windows 10/11 x64, protegido con contraseña de archivo ZIP (`2026`) y con instrucciones para desactivar advertencias de Windows Defender o SmartScreen. Esta combinación de características (ejecutable opaco, contraseña de extracción, instrucciones para eludir el antivirus, enlaces de descarga alojados en repositorios de GitHub de terceros) es un patrón habitual de distribución de malware.

Desde la perspectiva de evaluación de modelos, esta ficha no puede completarse con datos técnicos de IA porque no existen. Se documenta el artefacto para advertir a desarrolladores e investigadores de que no deben descargarlo ni ejecutarlo, y se indica explícitamente la ausencia de cualquier componente de aprendizaje automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los tags de idioma del repo no corresponden a capacidades del modelo) |
| Licencia | MIT (declarada en el repo; sin relación con un modelo) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto distribuido es un binario compilado para Windows x64 que, según la propia model card, implementa funciones de trampa para un videojuego (overlay externo, ESP de cajas y esqueletos, suavizado de entrada, perfiles JSON, radar 2D). Ninguno de estos componentes implica modelos, pesos, datasets ni técnicas de aprendizaje automático.

La model card menciona cifras de rendimiento del binario (polling a 257 Hz, consumo inferior a 58 MB de RAM, 8 hilos de trabajo, consistencia del 97,8 %), pero son afirmaciones del autor sin verificación independiente y no constituyen datos de un modelo de IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües pese a los 14 códigos de idioma listados en los tags del repositorio.
- No incluye modo thinking, visión, audio ni ninguna modalidad de inferencia.
- El único contenido descrito es un ejecutable de trampas para un videojuego, con funciones de overlay y aimbot.

## Casos de uso

No existen casos de uso legítimos para un modelo de IA en este repositorio. Los escenarios que la model card describe son los siguientes, y se listan únicamente para contextualizar el riesgo:

- Trampas en videojuegos multijugador: el binario se presenta como ESP y aimbot para Arc Raiders, lo que viola los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Distribución de ejecutables con contraseña de extracción: el patrón se usa para dificultar el análisis automatizado por parte de antivirus y servicios de sandbox.
- Evasión de controles de seguridad: la model card incluye instrucciones explícitas para ignorar alertas de Windows Defender y SmartScreen.
- Ingeniería social mediante repositorios de GitHub de terceros: los enlaces de descarga apuntan a cuentas no verificadas y a un nombre de archivo (`marvel-rivals-cheat-esp-aimbot-2026`) distinto del proyecto anunciado.
- Suplantación de identidad de proyectos: el nombre del repo y el del ZIP no coinciden, lo que sugiere reempaquetado o reutilización de infraestructura de campañas previas.
- Riesgo de robo de credenciales y malware: un ejecutable opaco que requiere permisos de administrador es un vector clásico de infostealers y ransomware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: no hay modelo que evaluar con MMLU, HumanEval, GSM8K ni ninguna otra métrica de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.
- Requisitos del artefacto: Windows 10/11 de 64 bits, ejecución como administrador, 7-Zip o WinRAR para extraer el ZIP con contraseña `2026`, y desactivación de las protecciones de Windows Defender o SmartScreen según las instrucciones del autor.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o multimodal sería categóricamente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni integrarse en ningún pipeline de inferencia.
- Riesgo de seguridad alto: ejecutable opaco, protegido con contraseña, con instrucciones para eludir el antivirus y solicitud de privilegios de administrador. Patrón consistente con malware.
- Incumplimiento de términos de servicio: el uso de trampas en videojuegos conlleva el baneo de cuentas y, en algunas jurisdicciones, responsabilidad legal.
- Suplantación y falta de trazabilidad: el nombre del repositorio, el nombre del ZIP y el nombre del ejecutable no coinciden, y los enlaces apuntan a cuentas de GitHub de terceros no verificadas.
- Licencia MIT declarada: aunque el repo indica licencia MIT, esta no legitima el contenido ni exime de responsabilidad por el uso de software potencialmente malicioso.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Sesgos, alucinaciones y limitaciones de contexto: no aplica, pero el binario puede contener código arbitrario no auditable.
- Recomendación: no descargar, no extraer y no ejecutar el archivo. Reportar el repositorio a Hugging Face por contenido abusivo o malicioso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/smpark888/arc-raiders-cheat-esp-unlocked
- Enlace de descarga citado en la model card (no recomendado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Página de releases citada en la model card (no recomendada): https://github.com/lawrenceelliott578/arc-raiders-cheat-esp-unlocked/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios técnicos legítimos asociados.
