# memgui-agent-anonymous/MemGUI-8B-SFT

## Resumen

MemGUI-8B-SFT es un agente multimodal para control de interfaces gráficas móviles (GUI) de larga duración, desarrollado por el equipo anónimo MemGUI-Agent como artefacto de revisión por pares. Se construye a partir del modelo base Qwen/Qwen3-VL-8B-Instruct mediante ajuste fino supervisado sobre el dataset MemGUI-3K, que contiene 2.956 trayectorias exitosas y 64.430 muestras de entrenamiento anotadas con el protocolo ConAct.

El modelo resuelve el problema de la gestión del contexto en tareas de control de GUI móvil de horizonte largo. En lugar de mantener todo el historial en la ventana de contexto, utiliza el protocolo ConAct (Context-as-Action), que pliega el historial de acciones, actualiza la memoria de la interfaz y emite la siguiente acción en una única respuesta estructurada. Esto permite manejar tres campos de contexto: historial de acciones plegado, estado de UI plegado y registro de pasos recientes.

Es relevante porque demuestra que un modelo de 8B puede superar al baseline Qwen3-VL-8B-Instruct en tareas de control de GUI de largo horizonte y generalizar a benchmarks fuera de distribución, logrando el mejor rendimiento open-data en su categoría de 8B según los autores. El modelo tiene 8.767.123.696 parámetros y una licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B-Instruct (transformer multimodal con vision encoder) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | safetensors (FP16/BF16, no se especifica cuantizacion adicional) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL-8B-Instruct, un transformer multimodal con encoder de vision que procesa imagenes y texto. No es un modelo MoE: todos los parametros estan activos en cada paso. La arquitectura del agente se adapta al protocolo ConAct, que estructura la salida en cinco partes: razonamiento, plegado de historial, llamada a herramienta, observacion de la UI y intencion de accion.

El entrenamiento consiste en un ajuste fino supervisado (SFT) con la libreria ms-swift sobre el dataset MemGUI-3K, que contiene trayectorias completas, capturas de pantalla, anotaciones de razonabilidad a nivel de paso y archivos de entrenamiento multimodales. No se menciona el uso de RLHF ni DPO. La innovacion principal es el protocolo de salida estructurado que permite al modelo gestionar el contexto de forma activa, plegando informacion previa en lugar de acumular tokens indefinidamente.

## Capacidades

- Control de GUI movil (Android) de largo horizonte: el modelo recibe una captura de pantalla y produce una accion de UI estructurada (tool call) junto con razonamiento y observacion de la UI.
- Gestion proactiva del contexto: mediante el protocolo ConAct, pliega el historial de acciones y el estado de la UI en resumenes, manteniendo un registro de pasos recientes.
- Salida estructurada en formato XML con cinco campos: `<thinking>`, `<folding>`, `<tool_call>`, `<ui_observation>` y `<action_intent>`.
- Capacidad de transferencia fuera de distribucion: evaluado en MobileWorld GUI-Only, un benchmark no visto durante el entrenamiento.
- Soporte de tool calling limitado a la herramienta `mobile_use` definida en el prompt del sistema MemGUI-Agent.
- No es un chatbot de proposito general: requiere el prompt de sistema especifico, una captura de pantalla y un contexto GUI estructurado.

## Casos de uso

- Automatizacion de pruebas de aplicaciones Android: el modelo puede recorrer flujos largos de UI (por ejemplo, navegar por un carrito de compra) ejecutando acciones de UI paso a paso, plegando el historial para no perder el hilo en tareas de decenas de pasos.
- Agentes de asistencia movil en segundo plano: integrado en un entorno que proporcione capturas de pantalla y ejecute las llamadas a `mobile_use`, puede completar tareas como configurar un dispositivo o rellenar formularios largos.
- Investigacion en agentes GUI: sirve como baseline de 8B para comparar tecnicas de gestion de contexto (folding, memoria de UI) frente a modelos mas grandes o con ventanas de contexto mayores.
- Generacion de datos de entrenamiento: al estar entrenado con anotaciones de razonabilidad, puede usarse para generar trayectorias de GUI anotadas y ampliar datasets de entrenamiento de otros agentes.
- Evaluacion de generalizacion en GUI: su rendimiento en MobileWorld GUI-Only permite medir la transferencia de habilidades de control de GUI a entornos no vistos, util para investigacion en robustez.
- Integracion en frameworks de agentes moviles: el protocolo de salida estructurada facilita la conexion con sistemas que parsean XML o JSON para ejecutar acciones en emuladores o dispositivos reales.

## Benchmarks y rendimiento

| Benchmark | Metrica | Score |
|---|---|---|
| MemGUI-Bench | Pass@1 | 23,4 |
| MemGUI-Bench | Pass@3 | 35,9 |
| MemGUI-Bench | IRR (Information Retention Rate) | 30,2 |
| MobileWorld GUI-Only | Success Rate | 17,9 |

Segun los autores, en MemGUI-Bench el modelo supera al baseline Qwen3-VL-8B-Instruct y alcanza el mejor rendimiento open-data en su categoria de 8B. En MobileWorld GUI-Only, transfiere mas alla del benchmark fuente con un 17,9% de tasa de exito. Los resultados estan declarados por el autor y no verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.767 millones de parametros en FP16, se necesitan aproximadamente 18 GB de VRAM para inferencia sin cuantizacion. Con cuantizacion de 8 bits (no publicada) podria reducirse a ~9 GB, y con 4 bits a ~5 GB, aunque el repositorio solo incluye pesos en safetensors sin cuantizaciones listas.
- GPU recomendadas: para inferencia completa en FP16 se recomienda una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G). Para cargas de trabajo de produccion, una A100 de 40 GB o H100 permitiria lotes mayores.
- En consumer GPU: cabe en una RTX 4090 (24 GB) con FP16, y en tarjetas de 16 GB (RTX 4080, RTX 4070 Ti) con cuantizacion de 8 bits si se aplica.
- Opciones de despliegue: compatible con transformers y el stack de Hugging Face; puede servirse con vLLM o TGI para inferencia de alta concurrencia. No se menciona soporte para llama.cpp u Ollama en la documentacion.
- Latencia y throughput: no disponible. Depende del hardware y del tamano de la secuencia de entrada (captura de pantalla + contexto estructurado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| MemGUI-8B-SFT | 8.8B | no disponible | Agente GUI movil con gestion de contexto | Apache 2.0 |
| Qwen3-VL-8B-Instruct | 8.3B (aprox.) | 128K | Vision-lenguaje general, sin protocolo GUI | Apache 2.0 |
| UI-TARS-7B (referencia no verificada) | 7B | no disponible | Agente GUI movil sin folding de contexto | no disponible |

No se dispone de datos de benchmarks comparables publicados para UI-TARS u otros agentes GUI de 8B en las mismas condiciones. La comparacion directa con el baseline Qwen3-VL-8B-Instruct se menciona en la model card pero no se proporcionan numeros del baseline en los datos disponibles.

## Limitaciones y advertencias

- No es un chatbot de proposito general: requiere el prompt de sistema MemGUI-Agent, una captura de pantalla y un contexto GUI estructurado; sin ellos, no genera respuestas utiles.
- Idioma: solo entrenado y evaluado en ingles; no se garantiza rendimiento en otros idiomas.
- Rendimiento limitado en tareas largas: el Pass@1 de 23,4 % en MemGUI-Bench indica que la mayoria de las tareas largas no se completan correctamente al primer intento.
- Generalizacion fuera de dominio limitada: 17,9 % de tasa de exito en MobileWorld GUI-Only, por debajo de lo esperable para produccion.
- Riesgo de alucinacion en observaciones de UI: el modelo podria generar observaciones incorrectas si la captura de pantalla no coincide con el estado real del dispositivo.
- Restricciones de uso: al ser un artefacto anonimo para revision por pares, no hay garantias de mantenimiento ni soporte; la licencia Apache 2.0 permite uso comercial, pero el modelo puede contener sesgos heredados del base Qwen3-VL.
- Dependencia del dataset MemGUI-3K: el rendimiento puede degradarse en entornos con distribuciones de UI muy diferentes a las del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/memgui-agent-anonymous/MemGUI-8B-SFT
- Modelo espejo (autor lgy0404): https://huggingface.co/lgy0404/MemGUI-8B-SFT
- Pagina del proyecto (anonima): https://memgui-agent-anonymous.github.io/
- Pagina del proyecto (oficial): https://memgui-agent.github.io/
- Codigo fuente (anonimo): https://github.com/memgui-agent-anonymous/MemGUI-Agent
- Codigo fuente (oficial, kwai): https://github.com/kwai/MemGUI-Agent
- Dataset MemGUI-3K: https://huggingface.co/datasets/memgui-agent-anonymous/MemGUI-3K
- Paper en arXiv: https://arxiv.org/abs/2606.19926
