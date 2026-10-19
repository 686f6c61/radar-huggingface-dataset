# Serqan/MotionSmith-Runtime

## Resumen

MotionSmith Runtime 1.0.0 (Win64) es un paquete de ejecución externo que da soporte al plugin **MotionSmith - AI Animation Studio** para Unreal Engine. No es un modelo independiente ni una aplicación autónoma: es un entorno empaquetado de 3,7 GB que reúne Python 3.12, un entorno PyTorch con CUDA, componentes de NVIDIA Kimodo, el modelo de movimiento **Kimodo-SOMA-RP-v1.1**, los *workers* de backend y los adaptadores LLM2Vec (MNTP y supervisado), además de tokenizador y ficheros de soporte del codificador de texto.

El pipeline de texto a movimiento emplea LLM2Vec sobre **Meta Llama 3 8B Instruct** como codificador de texto. Los pesos de Llama 3 no se incluyen en el repositorio ni en el paquete: el usuario debe obtenerlos por separado desde el repositorio oficial de Meta aceptando su licencia, o dejar que el propio plugin los descargue con un token de lectura de Hugging Face, que según el autor no se almacena de forma permanente.

Su relevancia práctica es que permite generar, continuar y editar movimiento humano dentro de Unreal Engine 5.8 sin salir del editor, a cambio de requisitos estrictos (Windows 64-bit y GPU NVIDIA con CUDA) y de un régimen de licencias múltiples que obliga a revisar el directorio `Licenses/` antes de cualquier uso comercial. El repositorio se creó el 2026-08-29 y se actualizó el 2026-10-18, con 0 descargas y 1 *like* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Runtime compuesto: modelo de generación de movimiento Kimodo-SOMA-RP-v1.1 (NVIDIA Kimodo) y codificador de texto LLM2Vec sobre Meta Llama 3 8B Instruct |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El paquete incluye un entorno PyTorch con CUDA, pero no se documentan formatos cuantizados (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | `other`, con nombre `motionsmith-runtime-multiple-third-party-licenses`: no existe una licencia única; cada componente se rige por la suya (NVIDIA Kimodo, LLM2Vec/McGill-NLP, Python, PyTorch, librerías de Hugging Face y otras dependencias) |
| Formato de pesos | No disponible como pesos sueltos: se distribuye un ZIP (`releases/1.0.0/MotionSmithRuntime-1.0.0-Win64.zip`). Los pesos de Llama 3 no se incluyen |
| Version del runtime | 1.0.0 (Win64) |
| Plataforma | Windows 64-bit, Unreal Engine 5.8, GPU NVIDIA compatible con CUDA |
| Tamano del repositorio | 3,7 GB |
| Checksum SHA-256 del paquete | `98acde53cc8c16d2496f5512978f1f5227075930417ebdd9db36ed123abddf03` |
| Directorio de instalacion por defecto | `%LOCALAPPDATA%\MSR` |
| Pipeline de Hugging Face | No disponible |
| Region | us |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura interna, el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO para el modelo de movimiento Kimodo-SOMA-RP-v1.1, ni tampoco para los adaptadores LLM2Vec incluidos. Lo que sí se documenta es la composición del runtime: Python 3.12, PyTorch con soporte CUDA, componentes de ejecución de NVIDIA Kimodo, el modelo de movimiento, dos adaptadores LLM2Vec (MNTP y supervisado), el tokenizador y los ficheros de soporte del codificador de texto, los *workers* de backend y los recursos de diagnóstico y validación.

El codificador de texto se construye con LLM2Vec sobre Meta Llama 3 8B Instruct: LLM2Vec es una técnica que convierte un modelo causal en un codificador de frases mediante adaptación no supervisada (MNTP) seguida de adaptación supervisada, de ahí los dos adaptadores presentes en el paquete. La integración con el editor es cerrada: antes de generar animación, el sistema valida versión del runtime, Python, PyTorch, disponibilidad de CUDA, NVIDIA Kimodo, el modelo de movimiento, los adaptadores LLM2Vec, Llama 3 y la disponibilidad de los *workers*, y lo reporta a través del sistema Diagnostics / Pre-Flight. La instalación recomendada se realiza desde el propio plugin (Editor Preferences → Plugins → MotionSmith → Install MotionSmith Runtime), que descarga el paquete, verifica el SHA-256, lo instala y valida los componentes.

## Capacidades

- Generación de movimiento humano asistido por IA dentro de Unreal Engine, a partir del modelo Kimodo-SOMA-RP-v1.1.
- Continuación de movimiento: prolongar una animación existente más allá de su tramo original.
- Edición de movimiento y *pose authoring* integrados en el flujo del plugin.
- Flujos de trabajo sobre timeline para componer y ajustar animaciones dentro del editor.
- Retargeting de animaciones entre esqueletos.
- Codificación de texto para condicionar la generación, mediante LLM2Vec (adaptador MNTP más adaptador supervisado) sobre Meta Llama 3 8B Instruct.
- Validación de entorno previa a la generación (runtime, Python, PyTorch, CUDA, Kimodo, modelo, adaptadores, Llama 3 y *workers*).
- Verificación de integridad del paquete mediante SHA-256 durante la instalación.
- Descarga y configuración de Meta Llama 3 desde la interfaz de configuración usando el token de Hugging Face del usuario, o selección manual de una instalación local existente.
- No documentado: *tool calling*, *function calling*, soporte de agentes, razonamiento multi-paso, visión, audio, modo *thinking*, capacidades multilingües o generación de texto conversacional (el modelo Llama 3 se usa exclusivamente como codificador de texto).

## Casos de uso

- **Previsualización rápida de animación en el editor**: el plugin permite generar movimiento humano dentro de Unreal Engine 5.8 sin exportar a herramientas externas, lo que acorta el ciclo de iteración de un animador que necesita validar una idea antes de producir la animación final.
- **Prototipado de sets de locomoción para NPCs**: generar variantes de caminar, correr o girar condicionadas por texto y revisarlas en el timeline del editor, usando el modelo Kimodo-SOMA-RP-v1.1 como generador y el codificador LLM2Vec para traducir la indicación textual.
- **Continuación de capturas de movimiento incompletas**: cuando una toma mocap termina antes de lo previsto, la función de continuación permite extender el movimiento de forma coherente con el tramo existente, evitando regrabar la captura.
- **Edición y corrección de poses en produccion**: ajustar una pose concreta o un segmento de la animación mediante *pose authoring* y edición de movimiento, manteniendo el resto de la toma intacta.
- **Retargeting entre esqueletos de distinta complexión**: adaptar una animación generada o capturada a otro rig dentro del mismo proyecto de Unreal Engine, aprovechando el soporte de retargeting del plugin.
- **Pipelines de cinemáticas y teasers**: generar borradores de animación para secuencias cinemáticas y sustituirlos después por animación final, reduciendo el coste de las primeras fases de *blocking*.
- **Docencia y formación en animación**: usar el runtime en un entorno controlado de Windows con GPU NVIDIA para que estudiantes experimenten con generación de movimiento asistida por IA dentro del editor, con validación previa del entorno mediante Pre-Flight.
- **Evaluación técnica interna de Kimodo**: dado que el paquete incluye el modelo, los adaptadores y los recursos de diagnóstico, sirve para que un equipo técnico compruebe el comportamiento del pipeline completo antes de integrarlo en un flujo de producción mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Sistema operativo**: Windows 64-bit. El runtime 1.0.0 solo se distribuye y se ha probado para esta plataforma; no se documentan builds para Linux ni macOS.
- **Version de Unreal Engine**: 5.8. El runtime 1.0.0 se ha probado con el plugin MotionSmith 1.0.0.
- **GPU**: se requiere una GPU NVIDIA compatible con CUDA. No se publica una VRAM mínima oficial.
- **VRAM estimada**: no disponible de forma oficial. Como referencia orientativa a partir de los componentes, Meta Llama 3 8B Instruct en FP16 ocupa del orden de 16 GB solo en pesos, por lo que un equipo con 24 GB de VRAM (por ejemplo, RTX 4090, RTX A5000 o superiores) es un punto de partida razonable para ejecutar el pipeline completo; no se documenta si el plugin aplica cuantización para reducir este requisito.
- **Almacenamiento**: el repositorio ocupa 3,7 GB y el paquete se instala en `%LOCALAPPDATA%\MSR`; a ello hay que sumar los pesos de Llama 3, que se descargan por separado.
- **Opciones de despliegue**: únicamente a través del plugin MotionSmith dentro de Unreal Engine. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia independiente; el autor indica explícitamente que el repositorio no es una aplicación autónoma.
- **Latencia y throughput**: no disponibles.
- **Requisitos de red y credenciales**: la descarga de Meta Llama 3 desde el plugin requiere un token de lectura de Hugging Face y la aceptación previa de la licencia de Meta.

## Comparativa con modelos similares

No se dispone de información sobre productos directamente comparables (runtimes de generación de movimiento integrados en Unreal Engine). La comparación más útil es con los componentes que empaqueta:

| Elemento | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MotionSmith Runtime 1.0.0 | Runtime cerrado para Unreal Engine 5.8 | No disponible | No disponible | Multiple third-party licenses (`other`) | Repositorio de 3,7 GB; solo Windows 64-bit |
| Kimodo-SOMA-RP-v1.1 (NVIDIA Kimodo) | Modelo de generación de movimiento | No disponible | No disponible | Sujeta a la licencia de NVIDIA Kimodo, incluida en `Licenses/` | Empaquetado dentro del runtime |
| LLM2Vec (adaptadores MNTP y supervisado, McGill-NLP) | Adaptadores de codificación de texto | No disponible (se aplican sobre un modelo de 8B) | No disponible | Sujeta a la licencia de LLM2Vec / McGill-NLP | Empaquetados; los pesos base no |
| Meta Llama 3 8B Instruct | LLM causal usado como base del codificador | 8B (dato de Meta) | No disponible en esta ficha | Meta Llama 3 | No incluido: descarga aparte desde el repositorio oficial de Meta |

## Limitaciones y advertencias

- **No es un modelo ni una aplicación autónoma**: es un paquete de ejecución pensado para funcionar con el plugin MotionSmith en Unreal Engine; el propio autor desaconseja tratarlo como producto independiente.
- **Licencias multiples y no uniformes**: la licencia declarada es `other` con nombre `motionsmith-runtime-multiple-third-party-licenses`. No hay una licencia única que cubra todos los componentes, por lo que el uso comercial exige revisar `LICENSE` y el directorio `Licenses/` componente por componente.
- **Restricciones de redistribucion**: el autor advierte de que no debe asumirse que todos los componentes incluidos puedan redistribuirse de forma independiente de sus respectivas licencias.
- **Llama 3 no incluido**: los pesos de Meta Llama 3 no están en el repositorio; requieren aceptar la licencia y las condiciones de acceso de Meta, y el uso queda sujeto a dicha licencia.
- **Dependencia de plataforma**: solo Windows 64-bit, Unreal Engine 5.8 y GPU NVIDIA con CUDA. No hay soporte documentado para Linux, macOS, GPU AMD/Intel ni otras versiones del motor.
- **Versionado acoplado**: el runtime 1.0.0 se ha probado con el plugin MotionSmith 1.0.0; no se documenta compatibilidad con otras versiones.
- **Ausencia de datos de evaluacion**: no hay benchmarks, métricas de calidad de movimiento, latencia ni throughput publicados, lo que impide comparar objetivamente su rendimiento.
- **Riesgo de artefactos en el movimiento**: no se documentan métricas de calidad (por ejemplo, deslizamiento de pies o pérdida de contacto con el suelo), por lo que la salida requiere revisión humana antes de producción.
- **Idiomas no documentados**: se desconoce qué lenguas acepta el codificador de texto para condicionar la generación; no debe asumirse soporte del castellano.
- **Sesgos**: no se publica información sobre sesgos en los datos de entrenamiento del modelo de movimiento ni de los adaptadores.
- **Alucinacion**: el concepto no aplica a la generación de texto, ya que Llama 3 se usa solo como codificador; el riesgo equivalente es la generación de movimiento no fiel a la indicación textual, sin métricas publicadas que lo cuantifiquen.
- **Requisitos de credenciales**: la descarga automática de Llama 3 necesita un token de Hugging Face con acceso concedido al repositorio de Meta; sin él hay que proporcionar una instalación local.
- **Madurez**: 0 descargas y 1 *like* en el momento de la consulta, con un unico release 1.0.0; no hay evidencia publica de uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Serqan/MotionSmith-Runtime
- Paquete de distribucion dentro del repositorio: `releases/1.0.0/MotionSmithRuntime-1.0.0-Win64.zip`
- Licencias y atribuciones de terceros: directorio `Licenses/` del paquete de runtime y fichero `LICENSE` del repositorio
- No se han proporcionado en la informacion disponible otros enlaces a papers, blogs, repositorios de codigo o demos.
