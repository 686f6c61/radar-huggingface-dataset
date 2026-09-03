# Snapkitty/sovereign-harness

## Resumen

El repositorio `Snapkitty/sovereign-harness` no contiene un modelo de inteligencia artificial, sino un "harness" de instalación y orquestación para un stack de IA local denominado "sovereign AI stack". Desarrollado por el autor "Snapkitty", este proyecto proporciona un script de arranque de una línea, una interfaz de navegador y un CLI (`sk`) que integra varios repositorios auxiliares (como `snapkitty-shell`, `sovereign-transformer`, `sovlm`, entre otros) para desplegar un entorno de ejecución de LLM local basado en Ollama, con fallback a WebLLM.

Aunque el repositorio se aloja en Hugging Face, no ofrece pesos de modelo, arquitectura ni parámetros. Su propósito es unificar la instalación de componentes de software y la ejecución de un LLM local (se menciona Nemotron) a través de una interfaz web que funciona sin servidor. No se dispone de información sobre el modelo subyacente, tamaño, contexto o idiomas soportados, ya que el proyecto se centra en la infraestructura de despliegue, no en un modelo concreto.

La relevancia de este proyecto radica en su enfoque de "soberanía digital", promoviendo el uso de modelos locales y control total del usuario, aunque su utilidad práctica depende de la disponibilidad de Ollama y de un modelo Nemotron compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Sovereign Source v1.0 (licencia propietaria no estándar) |
| Formato de pesos | no aplicable (no se distribuyen pesos) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. Se trata de un conjunto de scripts y una interfaz web (HTML/JavaScript) que orquesta la instalación de un CLI (`sk`) y la ejecución de un LLM local a través de Ollama. El componente de LLM mencionado es "Nemotron" (de NVIDIA), pero no se especifica la variante concreta ni sus características. No hay datos de entrenamiento, tokens, ni métodos de optimización como RLHF o DPO.

La "arquitectura" del harness se compone de capas en el navegador: un "Plasma Gate" con principios y prohibiciones, una cadena WORM basada en SHA-256, un generador de entropía cuántica (con fallback CSPRNG) y la integración con Ollama. Estas capas son lógica de aplicación, no arquitectura de modelo.

## Capacidades

- Instalación automatizada en Mac, Linux, WSL y Windows PowerShell mediante un script de una línea.
- Interfaz de navegador que funciona sin servidor, con soporte offline tras la primera carga.
- Integración con Ollama para ejecutar el LLM Nemotron localmente; si Ollama no está disponible, usa WebLLM como fallback.
- CLI `sk` con comandos como `sk help`, `sk run git.status` y `sk worm` (para mostrar la cadena WORM).
- Incluye un "DNA Visualizer" y un "Git Command Center" como utilidades adicionales.
- Conexión con una serie de repositorios del mismo autor que forman un "stack soberano" (XML compiler, Prolog identity gate, etc.).

## Casos de uso

- Despliegue local de un LLM en entornos de desarrollo: el script instala Ollama y el CLI `sk`, permitiendo ejecutar Nemotron de forma local sin depender de servicios en la nube.
- Entornos con privacidad estricta: al ejecutar el modelo en local, se evita el envío de datos a terceros, adecuado para organizaciones con requisitos de soberanía de datos.
- Prototipado rápido de aplicaciones de IA: la interfaz web sin servidor permite probar el LLM desde cualquier navegador, incluso en dispositivos móviles (iPhone/iPad mediante "Add to Home Screen").
- Automatización de tareas de desarrollo: el comando `sk run git.status` muestra cómo el CLI puede ejecutar comandos del sistema, potencialmente útil para pipelines de CI/CD locales.
- Educación y demostración: al ser un proyecto con licencia propia y código abierto (aunque no estándar), puede usarse como ejemplo de integración de múltiples herramientas de IA en un entorno controlado.
- Investigación en "IA soberana": el stack incluye componentes como `sovereign-transformer` (Datalog corpus gate) y `sovlm` (modelo de lenguaje Kneser-Ney), que podrían interesar a quienes estudian alternativas a los grandes modelos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento del LLM subyacente, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU, ya que depende del modelo Nemotron que se descargue a través de Ollama.
- Para ejecutar Ollama en local se necesita una máquina con suficiente memoria RAM (típicamente 8 GB o más para modelos pequeños) y, si se usa GPU, una tarjeta compatible con CUDA (por ejemplo, NVIDIA RTX 2060 o superior).
- La interfaz web del navegador es ligera y no requiere servidor, por lo que puede ejecutarse en cualquier dispositivo con navegador moderno.
- Opciones de despliegue: el propio script instala Ollama y el CLI, y la UI se abre en el navegador. No se mencionan herramientas como vLLM o TGI.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje, sino un harness de despliegue. No existe una categoría directa de comparación con modelos como Llama, Mistral o Qwen, ya que no se distribuyen pesos ni se definen capacidades de inferencia propias.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede evaluar su calidad de generación, razonamiento o código, ya que depende del LLM externo (Nemotron) que se instale.
- Licencia no estándar: "Sovereign Source v1.0" no es una licencia de código abierto reconocida (como Apache 2.0 o MIT). Su uso comercial y redistribución requieren revisar los términos específicos del proyecto.
- Dependencia de servicios externos: el script de instalación requiere acceso a GitHub Pages y a Ollama; si estos servicios no están disponibles, la instalación fallará.
- La fecha de creación (2026) y el bajo número de descargas (0) sugieren que es un proyecto muy reciente y en fase temprana, con posible falta de soporte y documentación.
- No se indica soporte multilingüe ni capacidades específicas de tool calling o agentes; todo depende del modelo subyacente.
- Riesgo de alucinación y sesgos: al no proporcionar información sobre el modelo, no se puede evaluar su comportamiento; se recomienda precaución en entornos de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Snapkitty/sovereign-harness
- Página del proyecto (GitHub Pages): https://snapkittywest.github.io/sovereign-harness/
- Script de instalación para Mac/Linux/WSL: https://snapkittywest.github.io/sovereign-harness/install.sh
- Script de instalación para Windows PowerShell: https://snapkittywest.github.io/sovereign-harness/install.ps1
- Guía de instalación iOS: https://snapkittywest.github.io/sovereign-harness/install-ios.html
- Repositorio del CLI `sk` (snapkitty-shell): https://github.com/SNAPKITTYWEST/snapkitty-shell
- DNA Visualizer: https://snapkittywest.github.io/dna-visualizer/
- Git Command Center: https://snapkittywest.github.io/git-command-center/
