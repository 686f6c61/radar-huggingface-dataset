# heyjosi/josi-allinone

## Resumen

Josi all-in-one es un paquete de despliegue autocontenido para un asistente ejecutivo personal que combina tres piezas en una única imagen Docker: el servidor de la aplicación Josi (version 1.2.8 beta 32), el motor de inferencia Ollama 0.40.16 y el modelo de lenguaje `josi-qwen3.5-9b` (version 6). El modelo es un fine-tune LoRA del base Qwen/Qwen3.5-9B, entrenado con Unsloth, fusionado y cuantizado a GGUF Q4_K_M. El objetivo es ejecutar un asistente privado de correo, calendario, tareas y administración cotidiana en el propio ordenador del usuario, sin que los datos salgan de la máquina salvo que el usuario lo autorice.

El modelo base Qwen/Qwen3.5-9B aporta la arquitectura transformer subyacente, con aproximadamente 9.000 millones de parámetros, y el fine-tune lo especializa en conversaciones de tipo asistente ejecutivo generadas de forma sintética por el propio generador de datos de entrenamiento de Josi. La ventana de contexto configurada en la imagen es de 24.576 tokens, suficiente para hilos de correo y conversaciones multi-turno con historial extenso. El repositorio pesa unos 10 GB e incluye el archivo `josi-allinone-v6-b32.tar` con la imagen Docker completa.

La relevancia actual del proyecto reside en su enfoque de producto: no se distribuye solo un modelo, sino un stack completo instalable con un único comando (`curl -fsSL https://heyjosi.com/allinone | sudo bash`), con verificación SHA-256 de la imagen, reanudación de descargas interrumpidas y soporte opcional de GPU NVIDIA. Está en fase beta, con licencia Apache-2.0 sobre pesos, suite de pruebas y generador de datos, y está pensado específicamente para las herramientas de asistente de Josi, no para programación ni escritura creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B); fine-tune LoRA fusionado |
| Parametros totales | aproximadamente 9.000 millones (heredados del base Qwen3.5-9B; no se detalla cifra exacta en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 24.576 tokens en esta imagen |
| Tipos de cuantizacion | Q4_K_M GGUF (unica cuantizacion publicada en la imagen) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 (pesos, suite de pruebas y generador de datos) |
| Formato de pesos | GGUF (servido por Ollama dentro del contenedor); imagen Docker `.tar` de unos 10 GB |
| Version del modelo | `josi-qwen3.5-9b` version 6 |
| Metodo de entrenamiento | LoRA con Unsloth, fusionado y cuantizado a Q4_K_M |
| Datos de entrenamiento | conversaciones sinteticas de asistente ejecutivo generadas por el generador de datos de Josi |
| Motor de inferencia incluido | Ollama 0.40.16 |
| Version de la aplicacion | Josi 1.2.8 beta 32 |
| VRAM recomendada | 8 GB |
| Espacio en disco requerido | aproximadamente 21 GB libres |
| Checksum de la imagen | SHA-256 `ced91b4bcb06c75de2f1f549afe7d223ee746a87df77623030f7856c2a2b14c2` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del base Qwen/Qwen3.5-9B, un transformer de aproximadamente 9.000 millones de parámetros. Sobre ese base se aplicó un fine-tune LoRA mediante Unsloth, orientado a conversaciones de asistente ejecutivo: gestión de correo, calendario, tareas y administración diaria. Tras el entrenamiento, los adaptadores se fusionaron en los pesos base y el resultado se cuantizó a formato GGUF Q4_K_M para su servicio con Ollama dentro del contenedor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de ser conversaciones sintéticas, ni si se aplicaron fases de RLHF o DPO.

La innovación principal no es algorítmica sino de empaquetado y despliegue: el repositorio distribuye una imagen Docker que integra aplicación, motor de inferencia y modelo, con instalación mediante un único comando, verificación de integridad por SHA-256, reanudación de descargas y opciones de configuración (`--cpu`, `--port`, `--public-url`). El modelo funciona con 8 GB de VRAM y, sin GPU NVIDIA, recurre a la CPU con rendimiento notablemente inferior. El modelo aislado, para uso fuera de Docker, se publica por separado en `heyjosi/josi`.

## Capacidades

- Generación de texto conversacional orientada a tareas de asistente ejecutivo: correo, calendario, tareas y administración cotidiana.
- Gestión de conversaciones multi-turno con historial, gracias a la ventana de contexto de 24.576 tokens.
- Integración con las herramientas propias de Josi (correo, calendario, tareas) dentro del stack desplegado.
- Ejecución local y privada: los datos permanecen en la máquina del usuario salvo autorización explícita.
- Soporte de GPU NVIDIA para aceleración; funcionamiento en CPU como alternativa.
- Idioma: únicamente inglés.
- No está diseñado para programación ni escritura creativa, según advierte el propio autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de correo personal: el modelo puede resumir hilos, redactar respuestas y clasificar mensajes dentro de la aplicación Josi, aprovechando la ventana de 24.576 tokens para correos con historial largo.
- Gestión de calendario: interpretación de peticiones en lenguaje natural para crear, mover o consultar eventos, integrado con las herramientas de calendario del stack.
- Seguimiento de tareas y recordatorios: el asistente mantiene listas de tareas y responde a consultas sobre su estado dentro de la interfaz de Josi.
- Administración cotidiana: redacción de textos breves, resúmenes de documentos y respuestas a formularios sencillos, en el ámbito doméstico o de pequeña oficina.
- Despliegue privado en estación de trabajo: instalación con un solo comando en un equipo Linux con GPU NVIDIA de 8 GB de VRAM, manteniendo todos los datos en local.
- Entorno de pruebas para desarrolladores de asistentes: el paquete sirve como base reproducible (imagen Docker con versión fija de Ollama y del modelo) para experimentar con integraciones de asistente ejecutivo.
- Uso en equipo sin GPU: con `--cpu` el asistente funciona en CPU, adecuado para pruebas funcionales aunque con latencia alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 8 GB para el modelo cuantizado Q4_K_M servido por Ollama.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que una tarjeta NVIDIA acelera notablemente la inferencia. Por el tamaño del modelo (9B en Q4_K_M), encaja en GPU consumer con 8 GB o más de VRAM (por ejemplo, gama RTX xx60/xx70 con 8 GB), aunque esta correspondencia no está confirmada en la información disponible.
- Funcionamiento sin GPU: sí, mediante la opción `--cpu`, con rendimiento "lento" según el autor.
- Espacio en disco: aproximadamente 21 GB libres necesarios; la imagen `.tar` ocupa unos 10 GB.
- Opciones de despliegue: imagen Docker autocontenida con Ollama 0.40.16 y el servidor Josi; instalación mediante script (`curl -fsSL https://heyjosi.com/allinone | sudo bash`) o carga manual con `docker load -i josi-allinone-v6-b32.tar`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| josi-qwen3.5-9b (este) | aprox. 9B | 24.576 tokens | Apache-2.0 | GGUF Q4_K_M + imagen Docker con Ollama | Fine-tune para asistente ejecutivo, solo ingles, beta |
| Qwen/Qwen3.5-9B (base) | aprox. 9B | no disponible | no disponible en la informacion proporcionada | safetensors y derivados | Modelo generalista del que deriva este fine-tune |
| heyjosi/josi (modelo suelto) | aprox. 9B | no disponible | Apache-2.0 | GGUF | Mismo modelo sin el empaquetado Docker, para uso externo |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es una versión beta: el propio autor advierte que el modelo puede cometer errores.
- Especializado en herramientas de asistente (correo, calendario, tareas, administración); no está pensado para programación ni escritura creativa.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Entrenado con datos sintéticos generados por el propio pipeline de Josi, lo que puede introducir sesgos y patrones repetitivos propios del generador.
- Riesgo de alucinación inherente a un modelo de 9B cuantizado a Q4_K_M, especialmente en tareas fuera de su dominio de especialización.
- La cuantización Q4_K_M implica una pérdida de precisión respecto a los pesos completos.
- La instalación recomendada ejecuta un script remoto con `sudo`; conviene revisar el script y verificar el SHA-256 de la imagen antes de confiar en el paquete.
- El modo beta con token de tester envía informes de fallos al equipo de Josi (según el autor, sin chats, correos, contraseñas ni nombres de carpetas del usuario); conviene valorar la privacidad antes de activarlo.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el stack incluye componentes de aplicación (Josi) cuyo régimen de licencia no se detalla en la información disponible.
- Requiere aproximadamente 21 GB de disco libre y, sin GPU, el rendimiento en CPU es lento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/heyjosi/josi-allinone
- Modelo suelto (sin Docker): https://huggingface.co/heyjosi/josi
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio del proyecto: https://heyjosi.com
- Instalador: https://heyjosi.com/allinone
- Registro beta: https://heyjosi.com/beta
