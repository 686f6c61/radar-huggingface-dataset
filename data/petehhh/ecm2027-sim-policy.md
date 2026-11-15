# petehhh/ecm2027-sim-policy

## Resumen

`petehhh/ecm2027-sim-policy` es un contenedor de política para el "ECM 2027 simulation track", distribuido como una imagen OCI/Docker empaquetada en un archivo `docker save` (`sgeai-ecm178_v2.tar.gz`, 96.665.351 bytes, SHA-256 `64b7a2b0...492945`). No es un modelo de lenguaje: es un servicio HTTP de inferencia de políticas de control robótico que expone los endpoints `/health`, `/reset`, `/predict` y `/close` en el puerto 50000.

El servicio devuelve vectores de acción de 20 dimensiones (7 articulaciones por brazo, 2 pinzas, 4 comandos de base móvil) a partir de un objeto de observación arbitrario. La imagen se construye sobre `python:3.12-slim` con `numpy` como única dependencia de terceros, no requiere GPU, no requiere red en tiempo de ejecución y no incluye volúmenes ni variables de entorno obligatorias.

Su relevancia es acotada: se trata de un artefacto de participación en un track de simulación concreto (ECM 2027), publicado sin model card técnica sobre la política en sí, sin licencia declarada, sin idiomas y sin pipeline asociado. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control; la model card no describe la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible (no aplica; interfaz de observación por paso) |
| Tipos de cuantización | no disponible (pesos empaquetados en `actions_by_task.npz`) |
| Idiomas soportados | no disponible (no aplica; servicio de control robótico) |
| Licencia | no disponible |
| Formato de pesos | asset bundle `.npz` (`/app/assets/actions_by_task.npz`) dentro de imagen Docker; archivo distribuible `.tar.gz` |
| Dimensión de acción | 20 (7 brazo izq., 7 brazo der., 2 pinzas, 4 base móvil) |
| Puerto de servicio | 50000 (`POLICY_HTTP_PORT` configurable) |
| Requisito de GPU | no |
| Red en tiempo de ejecución | no requerida (totalmente offline) |
| Imagen base | `python:3.12-slim` + `numpy` |
| Referencia de imagen tras `docker load` | `sgeai-ecm178:v2` |
| Tamaño del archivo | 96.665.351 bytes |
| SHA-256 | `64b7a2b05e00e86f0d183da64b8bf81cc39ec5737c02c58d6e749384ed492945` |
| Episodios declarados en `/health` | 51 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura de la política, el número de parámetros, los datos de entrenamiento ni el procedimiento de optimización. Lo único verificable es el mecanismo de empaquetado y servicio: una imagen Docker construida localmente con `python:3.12-slim` y `numpy`, que carga un bundle de assets en formato `.npz` (`actions_by_task.npz`) y sirve inferencia mediante un servidor HTTP en el puerto 50000.

El funcionamiento descrito sugiere una política basada en assets por tarea: `reset` recibe un nombre de demostración/tarea (`task_info.demo`) y, si ese nombre no está cubierto por el bundle, el servicio recurre a un comportamiento genérico determinista en lugar de fallar. `predict` acepta un objeto de observación arbitrario, tolera claves ausentes y siempre devuelve un vector de acción de 20 dimensiones válido. El servicio es thread-safe con serialización por petición. No se declara decodificación especulativa, atención lineal, RLHF, DPO ni ninguna otra innovación de entrenamiento.

La model card incluye una declaración de integridad explícita: la imagen no contiene poses de objetos ni ground truth del simulador, no lee estado privilegiado (poses exactas de objetos o del robot), no incluye dicho estado grabado y no hace uso de información privilegiada del simulador; solo consume lo que el servicio de evaluación devuelve por la interfaz de observación documentada.

## Capacidades

- Control robótico de horizonte corto: genera acciones de 20 dimensiones (brazos, pinzas y base móvil) a partir de observaciones.
- Interfaz HTTP síncrona con endpoints `/health`, `/reset`, `/predict` y `/close`, con respuestas JSON.
- Comportamiento determinista de reserva cuando el nombre de tarea no está en el bundle de assets.
- Tolerancia a observaciones incompletas: `predict` acepta objetos arbitrarios y devuelve siempre una acción válida de 20 dimensiones.
- Ejecución completamente offline, sin descargas ni llamadas externas en tiempo de ejecución.
- Concurrencia segura: peticiones serializadas por el servicio.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Evaluación en el track de simulación ECM 2027: el contenedor se despliega con `docker run -p 50000:50000 sgeai-ecm178:v2` y el servicio de evaluación lo interroga vía `/reset` y `/predict` para ejecutar episodios sobre las tareas cubiertas por `actions_by_task.npz`.
- Reproducibilidad de resultados: la verificación con `sha256sum -c` y el tamaño exacto del archivo permiten garantizar que la política evaluada es idéntica a la publicada.
- Despliegue en entornos aislados o air-gapped: al no requerir red ni GPU, puede ejecutarse en máquinas sin acelerador y sin salida a Internet, útil en laboratorios con políticas de aislamiento.
- Integración en pipelines de CI: el endpoint `/health` devuelve estado, número de episodios y dimensión de acción, lo que permite comprobaciones automáticas de disponibilidad y contrato de interfaz antes de lanzar una batería de evaluación.
- Simulación de bajo coste en hardware de consumo: sin GPU y con una única dependencia (`numpy`), el servicio puede correr en portátiles o nodos de CPU para pruebas de integración del cliente de evaluación.
- Pruebas de robustez del cliente: el comportamiento tolerante a observaciones incompletas y el fallback determinista permiten validar manejadores de error del lado del evaluador (HTTP 404 en rutas desconocidas, HTTP 400 en JSON malformado).
- Sustitución de assets para experimentación: la variable `POLICY_ASSETS` permite apuntar a un bundle propio, útil para comparar políticas alternativas manteniendo el mismo contrato HTTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el servicio no requiere GPU.
- GPU recomendadas: ninguna; la model card indica explícitamente `GPU: not required`.
- Cabe en cualquier CPU x86-64 o ARM con Docker; la imagen base es `python:3.12-slim` con `numpy` como única dependencia de terceros.
- Almacenamiento: el archivo comprimido ocupa 96.665.351 bytes (~92 MiB); el repositorio completo, 0,1 GB.
- Despliegue: Docker (`docker load -i sgeai-ecm178_v2.tar.gz` seguido de `docker run --rm -p 50000:50000 sgeai-ecm178:v2`). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Red: no requerida en tiempo de ejecución; sin volúmenes ni variables de entorno obligatorias.
- Latencia y throughput: no disponibles. El servicio serializa peticiones, por lo que el paralelismo efectivo está limitado por petición.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos o políticas comparables del mismo track ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo general: cualquier expectativa de razonamiento, código o conversación queda fuera de su alcance.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; debe tratarse como uso restringido hasta confirmación del autor.
- Sin model card técnica de la política: se desconoce la arquitectura, el entrenamiento, los datos y los parámetros; no es posible auditar sesgos o calidad más allá del contrato HTTP.
- Cobertura limitada a las tareas incluidas en `actions_by_task.npz`; para nombres de tarea no cubiertos, el servicio devuelve un comportamiento genérico determinista, no una política específica de la tarea.
- Riesgo de alucinación: no aplica en el sentido de texto, pero el fallback determinista puede enmascarar tareas no soportadas y producir acciones sin relación con el objetivo real.
- El servicio serializa peticiones; bajo carga concurrente la latencia agregada puede degradarse.
- Dependencia de integridad del artefacto: es imprescindible verificar el SHA-256 y el tamaño antes de desplegar, ya que la imagen se distribuye como archivo plano de `docker save`.
- Sin datos de benchmarks ni de rendimiento en simulación; no hay evidencia pública de la calidad de la política.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/petehhh/ecm2027-sim-policy
- Archivo de checksum referenciado en la model card: `sgeai-ecm178_v2.tar.gz.sha256` (mismo repositorio)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
