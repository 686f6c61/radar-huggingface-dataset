# Snapkitty/sovereign-engine-v2

## Resumen

Sovereign Engine v2 es un entorno completo de desarrollo de agentes LLM, no un modelo de lenguaje con pesos preentrenados. Desarrollado por Snapkitty, el proyecto integra un IDE nativo en C Win32 (editor, terminal ConPTY, LSP, DAP, git), un motor de inferencia Python con enrutamiento MoE personalizado basado en álgebra de Jordan, y una capa de ensamblador NASM x86-64 para operaciones tensoriales de bajo nivel. El sistema suma 50.444 líneas de código en 142 archivos fuente, sin dependencias externas más allá de la biblioteca estándar de Python y las APIs nativas de Windows.

El proyecto resuelve el problema de construir un entorno de desarrollo integrado para agentes LLM con control total sobre el pipeline de inferencia, desde el enrutamiento hasta las operaciones de cómputo. Su relevancia radica en demostrar una arquitectura alternativa al enfoque habitual de envoltorios sobre APIs, apostando por un sistema monolítico con comunicación IPC de baja latencia (buffer anular mmap con polling de 50 μs). La licencia BSL 1.1 permite uso no comercial y limita el despliegue en producción.

Cabe señalar que la fecha de creación en HuggingFace (2026-09-03) es posterior a la fecha de corte de conocimiento de este documento, y el repositorio no publica métricas de rendimiento ni especificaciones de un modelo de pesos concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE personalizado con enrutamiento por álgebra de Jordan (QRA Router, 6 glifos) |
| Parametros totales | no disponible (no es un modelo con pesos; es un sistema de software) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (no hay pesos serializados) |
| Idiomas soportados | no disponible |
| Licencia | Business Source License 1.1 (BSL 1.1) |
| Formato de pesos | no aplica (código fuente: C, Python, NASM) |

## Arquitectura y entrenamiento

Sovereign Engine v2 no es un modelo entrenado con pesos, sino un sistema de software compuesto por cuatro capas: un IDE nativo Win32 en C (4.459 líneas), un motor Python de inferencia (38.576 líneas), una capa de ensamblador NASM x86-64 (7.019 líneas) y un despachador IPC en C con buffer anular mmap (390 líneas). El motor Python implementa un pipeline de enrutamiento en 11 etapas con un router QRA basado en seis glifos y cómputo de bloques de Jordan con instrucciones SSE2/AVX2. Incluye agentes ReAct con observador sombra, 34 herramientas distribuidas en nueve namespaces, un sistema de continuidad de cuatro paradigmas y almacenamiento binario WORM (write-once-read-many). No hay información sobre datos de entrenamiento, número de tokens, ni procesos de alineación como RLHF o DPO, ya que el proyecto se centra en la infraestructura de ejecución, no en el entrenamiento de un modelo base.

## Capacidades

- Entorno de desarrollo integrado con editor de buffer gap, terminal ConPTY, cliente LSP, depurador DAP y control de versiones git.
- Motor de inferencia con pipeline de enrutamiento en 11 etapas y router QRA basado en álgebra de Jordan.
- 34 herramientas en 9 namespaces para interacción con el sistema (archivos, procesos, red, etc.).
- Agentes ReAct con observador sombra para razonamiento multi-paso.
- Sistema de continuidad de cuatro paradigmas para mantener estado entre interacciones.
- Almacenamiento binario WORM para persistencia de datos inmutable.
- Capa nativa NASM x86-64 con operaciones tensoriales QRA, cómputo de bloques de Jordan y kernel NAND.
- Comunicación IPC de baja latencia mediante buffer anular mmap y polling de 50 μs.
- Evaluador de lenguaje de comandos formales (FCL) integrado en el IDE.

## Casos de uso

- Desarrollo de agentes LLM en local: el entorno integra editor, terminal y depurador, permitiendo iterar sobre agentes ReAct sin salir de la aplicación.
- Automatización de tareas de sistema: las 34 herramientas en 9 namespaces permiten al agente manipular archivos, ejecutar procesos y gestionar red, útil para pipelines de CI/CD o administración de entornos.
- Investigación en enrutamiento MoE alternativo: el router QRA basado en álgebra de Jordan ofrece un laboratorio para probar esquemas de selección de expertos fuera de los enfoques convencionales.
- Depuración de pipelines de inferencia: la combinación de DAP, LSP y el despachador IPC permite inspeccionar cada etapa del enrutamiento y las operaciones tensoriales.
- Desarrollo de aplicaciones nativas Windows con integración LLM: el IDE en C Win32 y la capa NASM facilitan la creación de herramientas de escritorio que invocan el motor Python vía HTTP o named pipes.
- Formación y experimentación en sistemas de agentes: la arquitectura modular y la ausencia de dependencias externas simplifican el estudio de componentes como el observador sombra o la continuidad de paradigmas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README no incluye métricas de latencia, throughput ni comparativas con otros sistemas. El único dato de rendimiento mencionado es el polling de 50 μs del despachador IPC, pero sin contexto de carga.

## Requisitos de hardware

- Sistema operativo Windows para el IDE nativo (Win32, Direct2D, ConPTY).
- Python 3.11 o superior para el motor de inferencia.
- Ensamblador NASM x86-64 para compilar la capa nativa.
- Compilador C compatible con MSVC (Visual Studio 2022) y CMake para construir el IDE.
- No se especifican requisitos de GPU; las operaciones SSE2/AVX2 indican que el cómputo se realiza en CPU.
- Opciones de despliegue: ejecución local con `python -c` para el motor, o compilación del IDE para uso interactivo. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. Sovereign Engine v2 no es un modelo de lenguaje con pesos, por lo que no existe una comparativa directa con modelos como Llama, Mistral o Qwen. En el ámbito de entornos de desarrollo para agentes LLM, podría compararse con frameworks como LangChain o AutoGen, pero el README no proporciona datos de rendimiento ni funcionalidad detallada para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia BSL 1.1: restringe el uso en producción hasta que se convierta a una licencia de código abierto (normalmente tras un periodo de cambio, no especificado aquí).
- El IDE nativo solo funciona en Windows; no hay soporte oficial para Linux o macOS.
- No se documenta si el motor Python incluye un modelo base propio o si requiere conectarse a un LLM externo; el ejemplo de uso muestra una llamada a `engine.run(...)` sin especificar el origen de los pesos.
- La fecha de creación en HuggingFace (2026-09-03) es futura respecto a la fecha de corte de este documento, lo que sugiere que el proyecto puede ser un placeholder o estar en desarrollo activo.
- No hay benchmarks, métricas de calidad de generación ni evaluaciones de sesgo o alucinación.
- El repositorio GitHub indicado (SNAPKITTYWEST/sovereign-engine-v2) no ha sido verificado en esta búsqueda; la URL puede no ser accesible.
- La arquitectura de almacenamiento WORM implica que los datos escritos no pueden modificarse, lo que puede ser una limitación en escenarios que requieran actualización de estado.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/sovereign-engine-v2
- GitHub (referenciado en el README): https://github.com/SNAPKITTYWEST/sovereign-engine-v2
