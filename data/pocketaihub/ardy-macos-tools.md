# PocketAiHub/ardy-macos-tools

## Resumen

ARDY es un modelo de difusión autorregresiva desarrollado por NVIDIA Research para generación interactiva de movimiento, presentado en SIGGRAPH. El repositorio `PocketAiHub/ardy-macos-tools` no contiene los pesos del modelo, sino un conjunto de herramientas de compatibilidad para ejecutar ARDY en Macs con Apple Silicon mediante el backend Metal (MPS) de PyTorch. El proyecto permite ejecutar ARDY localmente en hardware de Apple sin necesidad de GPU NVIDIA, utilizando el texto como entrada para generar animaciones de movimiento en tiempo real.

Este repositorio actúa como un instalador y servicio de compatibilidad: descarga el código fuente oficial de ARDY, verifica checksums, autentica con Hugging Face para acceder a los pesos de Meta Llama 3 (usado como text encoder) y ejecuta la generación a través de MPS. Es relevante porque democratiza el acceso a un modelo de generación de movimiento de última generación en hardware de consumo de Apple, sin requerir GPUs NVIDIA dedicadas.

El repositorio tiene licencia Apache 2.0, fue creado en agosto de 2026 y no contiene archivos de modelo (tamaño 0 GB). Los pesos de ARDY permanecen sujetos al NVIDIA Open Model Agreement.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Herramientas de compatibilidad para ARDY (modelo de difusión autorregresivo) |
| Parámetros totales | no disponible (no contiene pesos de modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el text encoder Meta Llama 3 soporta múltiples idiomas) |
| Licencia | Apache 2.0 (herramientas); pesos de ARDY sujetos a NVIDIA Open Model Agreement |
| Formato de pesos | no aplica (no se distribuyen pesos) |

## Arquitectura y entrenamiento

El repositorio no contiene arquitectura de modelo, sino herramientas de compatibilidad. El modelo subyacente, ARDY, es un modelo de difusión autoregresivo para generación de movimiento interactivo. ARDY combina un enfoque de difusión con un mecanismo autorregresivo que permite generar secuencias de movimiento condicionadas por prompts de texto en línea y restricciones cinemáticas de largo alcance.

El sistema usa Meta Llama 3 como text encoder para interpretar los prompts de texto. El proceso de instalación requiere autenticación con Hugging Face para descargar los pesos oficiales de ARDY y del text encoder directamente de las fuentes autorizadas. La generación se ejecuta a través del backend MPS (Metal Performance Shaders) de PyTorch, que permite utilizar los núcleos GPU de Apple Silicon para acelerar la inferencia.

## Capacidades

- Generación de movimiento interactivo a partir de prompts de texto en tiempo real.
- Soporte de restricciones cinemáticas de largo alcance: rutas raíz, waypoints, keyframes de cuerpo completo y posiciones/rotaciones de articulaciones dispersas.
- Generación con capacidad de respuesta en tiempo real (diseñada para interacción).
- Ejecución en Apple Silicon mediante MPS, sin necesidad de GPU NVIDIA.
- Integración con el ecosistema de Hugging Face para autenticación y descarga de pesos.
- No incluye herramientas de generación de texto, código o visión.

## Casos de uso

- Animación de personajes en tiempo real: los desarrolladores de juegos pueden integrar ARDY en motores de juego para generar movimientos de personajes dinámicos basados en prompts de texto sin necesidad de animaciones predefinidas.
- Prototipado de experiencias interactivas: diseñadores de experiencias XR o instalaciones interactivas pueden usar la generación de movimiento en tiempo real para crear respuestas dinámicas a entrada de texto del usuario.
- Creación de contenido para video: los animadores pueden generar secuencias de movimiento base a partir de descripciones textuales y luego refinarlas con restricciones cinemáticas (waypoints, keyframes).
- Investigación en visión por computador y gráficos: investigadores pueden estudiar el modelo de difusión autorregresivo y su comportamiento en hardware Apple Silicon sin necesidad de infraestructura NVIDIA.
- Entornos de simulación y robótica: se pueden generar trayectorias de movimiento para simular agentes físicos, usando las restricciones de rutas de camino y posiciones de articulaciones.
- Aplicaciones de asistencia creativa: artistas digitales pueden generar movimientos base para personajes en herramientas de animación, usando texto como interfaz de control.

## Rendimiento y benchmarks

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Requiere un Mac con Apple Silicon (M1, M2, M3, M4 o superior).
- La VRAM estimada no está disponible; depende de los requisitos del modelo ARDY y del text encoder Llama 3.
- GPU: integrada en el chip Apple Silicon (MPS backend).
- Memoria RAM: no especificada; se recomienda al menos 16 GB para modelos de tamaño medio, pero no se ha confirmado.
- Despliegue: el instalador y servicio de compatibilidad se ejecutan en macOS con PyTorch MPS.
- No requiere GPU NVIDIA dedicada.

## Comparativa con modelos similares

No hay información suficiente para comparar con modelos similares en el contexto de esta herramienta. El repositorio no contiene un modelo de lenguaje o generación de movimiento comparable con otros pesos abiertos.

## Limitaciones y advertencias

- El repositorio no incluye los pesos del modelo; se requieren credenciales de Hugging Face y aceptación de los términos de Meta Llama 3.
- Los pesos de ARDY están sujetos al NVIDIA Open Model Agreement, que puede imponer restricciones de uso comercial.
- No se proporcionan métricas de rendimiento ni benchmarks; el comportamiento en MPS puede variar respecto a GPUs NVIDIA.
- El modelo de generación de movimiento puede presentar sesgos en los tipos de movimiento generados (sesgos de género, etnia o contexto cultural) no documentados.
- Riesgo de alucinación en la generación de movimientos poco naturales o imposibles, dado que es un modelo generativo.
- La ventana de contexto y los idiomas soportados dependen del text encoder Llama 3, no de la herramienta.
- La herramienta está orientada a macOS/Apple Silicon; no se proporciona soporte para otras plataformas.

## Enlaces

- HuggingFace: https://huggingface.co/PocketAiHub/ardy-macos-tools
- GitHub del proyecto: https://github.com/trev222/ardy-macos-tools
- Repositorio oficial de ARDY (NVIDIA): https://github.com/nv-tlabs/ardy
- Sitio de PocketAI Hub: https://pocketaihub.com/
- Página de descarga de PocketAI: https://pocketaihub.com/download
- Perfil de PocketAiHub en HuggingFace: https://huggingface.co/PocketAiHub/models
