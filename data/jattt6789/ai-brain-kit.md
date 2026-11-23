# Jattt6789/ai-brain-kit

## Resumen
`ai-brain-kit` es un repositorio de Hugging Face publicado por el usuario Jattt6789 que no contiene un modelo entrenado, sino un kit de despliegue y orquestación para servir modelos de gran tamaño en entornos con múltiples GPU. El paquete agrupa scripts de arranque, una pasarela HTTP con control de acceso administrativo, un bucle de agentes con ejecución real de herramientas y un servidor de memoria a largo plazo. Los "cerebros" que orquesta son modelos de terceros: Kimi K3 (2,8 billones de parámetros, 104 mil millones activos, en cuantización Q2_K_XL GGUF), DeepSeek-V4-Pro en empaquetado GALE de 1 bit y DeepSeek-V4.1-Flash en FP8.

El problema que aborda es la brecha entre disponer de pesos de modelos muy grandes y poder operarlos de forma reproducible: el kit fija imágenes de contenedor, tipos de instancia (A100x4, H200x8), volúmenes de solo lectura y comandos de arranque, de modo que el mismo script funciona en Hugging Face Jobs o en hardware propio. Añade además una capa de producto (claves de usuario, límites de peticiones por minuto, activación selectiva de modelos y herramientas) que no suele venir incluida en los servidores de inferencia estándar.

La relevancia actual es doble: por un lado, documenta recetas concretas para ejecutar modelos de escala frontera en clústeres de 4 a 8 GPU; por otro, incluye mecanismos de mitigación para cuantizaciones extremas (1 bit y Q2), como el "smart mode" con muestreo doble y juez, o la inyección automática de memoria. No se dispone de información sobre el pipeline, la licencia, los idiomas ni métricas de rendimiento del propio kit.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un kit de despliegue; las arquitecturas corresponden a los modelos servidos: Kimi K3 y DeepSeek-V4/V4.1) |
| Parametros totales | no disponible para el kit; modelos servidos: Kimi K3 2,8 T (104 B activos), DeepSeek-V4-Pro clase 671 B (1,57 T contados en el empaquetado GALE), DeepSeek-V4.1-Flash no disponible |
| Parametros activos | Kimi K3: 104 B (MoE, segun la model card); DeepSeek-V4-Pro: no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K_XL GGUF (Kimi K3), GALE 1-bit pack (DeepSeek-V4-Pro), FP8 (DeepSeek-V4.1-Flash) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Kimi K3), empaquetado GALE propio (DeepSeek-V4-Pro), FP8 (DeepSeek-V4.1-Flash) |

## Arquitectura y entrenamiento
El repositorio no documenta el entrenamiento de ningún modelo: es una capa de ingeniería de despliegue. Los componentes descritos son scripts de shell (`brain_kimi_k3_job.sh`, `brain_deepseek_v4_job.sh`, `brain_deepseek_v41_flash_job.sh`), una pasarela en el puerto 8080 con endpoints administrativos (`/admin/models`, `/admin/users`), un servidor de herramientas en el puerto 8090 y un conjunto de pruebas (`test_suite.py`) con 16 comprobaciones. El script de Kimi compila llama.cpp con soporte CUDA (requiere build b10448 o superior para soportar kimi-k3) y sirve el GGUF; DeepSeek-V4.1-Flash se sirve con vLLM; DeepSeek-V4-Pro usa el motor GALE con un puente de agentes propio (`server/agent_bridge/agent_server.py`, puerto 11443) que traduce las herramientas de estilo OpenAI al formato DSML de DeepSeek.

Las innovaciones técnicas destacables son de infraestructura, no de modelado: un planificador de hardware por niveles que permite ejecutar el empaquetado de 1 bit en una máquina doméstica a unos 1,2-1,8 tokens por segundo con apoyo de CPU (nivel AVX2); el "smart mode", que genera dos muestras diversas y, si discrepan, aplica una pasada de juez estricto devolviendo el veredicto en el campo `smart` de la respuesta; y un almacén de memoria por usuario que se inyecta automáticamente en cada prompt. El modo de herramientas admite tres políticas: `open` (shell sin restricciones en la máquina anfitriona), `sandbox` (directorio de trabajo con tiempos límite, por defecto) y `locked` (sin shell).

## Capacidades
- Servicio de inferencia con API compatible con OpenAI en distintos puertos por modelo (8081 para Kimi, 11442 para DeepSeek GALE, 11443 para V4.1-Flash y el puente de agentes).
- Control de acceso administrativo: creación, modificación, desactivación, rotación y borrado de claves de usuario sin reiniciar el servicio, con selección de modelos permitidos y límite de peticiones por minuto.
- Bucle de agentes con ejecución real de herramientas: `shell`, `python_run`, `http_get`, `write_file`, `read_file`, `list_files` y `calc`, con realimentación de resultados hasta la respuesta final.
- Memoria a largo plazo por usuario mediante `POST /v1/memory`, con recuperación y borrado por clave e inyección automática en cada prompt.
- Modo "smart" de reparación de inteligencia para modelos muy cuantizados, con muestreo doble y juez.
- Soporte de tool calling específico para DeepSeek mediante el puente DSML.
- Capacidad de visión en Kimi K3 condicionada al fichero mmproj, que no está incluido en el bucket; en la práctica, solo texto por ahora.
- Ejecución reproducible en Hugging Face Jobs o en hardware propio mediante variables de entorno (`DSV4_PACKED_DIR`, `MODEL_PATH`, `ADMIN_KEY`, `TOOLS_MODE`).

## Casos de uso
- Despliegue de modelos de escala frontera en clústeres propios: los scripts fijan imágenes, tipos de instancia y volúmenes, lo que permite reproducir un entorno de 8xH200 o 4xA100 sin escribir la infraestructura desde cero.
- Plataforma interna multiinquilino: la pasarela permite asignar a cada usuario un subconjunto de modelos, un límite de peticiones y acceso opcional a herramientas reales, con cambios en caliente.
- Agentes que ejecutan código de verdad: el endpoint `/v1/agent` encadena generación y ejecución en `/bin/sh` o Python, útil para tareas como crear un fichero, ejecutarlo y devolver la salida, tal como ilustra la model card.
- Automatización de operaciones en una máquina controlada: con `TOOLS_MODE=open`, el agente puede inspeccionar ficheros, lanzar peticiones HTTP y ejecutar comandos en el propio host, adecuado para entornos de laboratorio de un solo administrador.
- Asistentes con memoria persistente: la inyección automática de pares clave-valor por usuario sirve para mantener preferencias o datos de contexto entre sesiones sin reenviar el historial completo.
- Evaluación de cuantizaciones extremas: el modo smart y los ajustes de turnos cortos permiten medir hasta qué punto un empaquetado de 1 bit o Q2 resulta utilizable en respuestas breves frente a generaciones largas.
- Pruebas de regresión de infraestructura: `test_suite.py` cubre 16 comprobaciones de ejecución de herramientas, administración de claves, juez y memoria, y puede integrarse en una canalización de CI para validar el stack antes de desplegarlo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento presente en la model card es una estimación de velocidad para el empaquetado de 1 bit de DeepSeek-V4-Pro en modo por niveles sobre una máquina doméstica: aproximadamente 1,2-1,8 tokens por segundo, con mejora al disponer de una CPU potente (nivel AVX2).

## Requisitos de hardware
- Kimi K3 en Q2_K_XL GGUF: unos 861 GB de pesos; 8xH200 (1128 GB) para residencia completa en VRAM.
- DeepSeek-V4-Pro con empaquetado GALE de 1 bit: unos 284 GB; 4xA100 de 80 GB para residencia completa.
- DeepSeek-V4.1-Flash en FP8: unos 510 GB; 8xH200, o 8xA100 en configuración ajustada.
- Ejecución en GPU de consumo: no disponible en la información proporcionada; el kit solo menciona despliegue por niveles en una máquina doméstica para el empaquetado de 1 bit, sin detallar la GPU necesaria.
- Opciones de despliegue: llama.cpp compilado con CUDA (Kimi), vLLM (V4.1-Flash), motor GALE con puente de agentes (V4-Pro), pasarela propia en el puerto 8080 y servidor de herramientas en el 8090.
- Latencia y throughput: solo la estimación de 1,2-1,8 tokens por segundo en modo por niveles; no hay datos para los despliegues en clúster.

## Comparativa con modelos similares
No disponible. El repositorio no es un modelo sino un kit de despliegue, y la información proporcionada no incluye comparaciones con otras pilas de servicio ni métricas de los modelos servidos que permitan una comparación rigurosa.

## Limitaciones y advertencias
- Las cuantizaciones de 1 bit y Q2 responden bien a preguntas cortas pero degradan la calidad en salidas largas; la corrección real exigiría recalibrar con los pesos originales, que no están en los buckets.
- El modo de herramientas `open` permite ejecutar cualquier comando en la máquina anfitriona; es una superficie de riesgo considerable y no debe exponerse fuera de un entorno controlado.
- El modo `sandbox` se limita a un directorio de trabajo y tiempos límite, pero no se describe aislamiento a nivel de contenedor o de sistema operativo.
- La visión de Kimi K3 no está operativa porque el fichero mmproj no está incluido en el bucket; el servicio es solo de texto por ahora.
- El soporte de tool calling en DeepSeek GALE depende de un servidor puente específico que carga su propio motor; no deben ejecutarse ambos servidores a la vez.
- No se especifican licencia, idiomas soportados ni pipeline, lo que impide evaluar el uso comercial y la cobertura lingüística.
- No hay datos publicados sobre sesgos ni tasas de alucinación; en modelos cuantizados de forma agresiva el riesgo de alucinación aumenta y el modo smart solo mitiga parcialmente la discrepancia entre muestras.
- El repositorio registra cero descargas y cero "likes" en el momento de la consulta, sin historial de validación por parte de la comunidad.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/Jattt6789/ai-brain-kit
- Bucket de pesos de DeepSeek-V4-Pro GALE 1-bit: hf://buckets/Jattt6789/DeepSeek-V4-Pro-671B-GALE-1bit-v4-bucket
- Bucket de pesos de Kimi K3 abliterated GGUF: hf://buckets/Jattt6789/penclaw-Kimi-K3.0-abliterated-GGUF-bucket
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
