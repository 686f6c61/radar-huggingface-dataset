# Microck/DiskSage-0.8B-GGUF

## Resumen

DiskSage-0.8B es un ajuste fino mediante LoRA del modelo Qwen3.5-0.8B, desarrollado por Microck y distribuido en formato GGUF cuantizado Q4_K_M para inferencia en CPU a través de llama.cpp. Su proposito es muy concreto: revisar un elemento de almacenamiento de un sistema Linux (una carpeta, un runtime, una cache de compilacion, un checkout de Git) y emitir una decision estructurada en JSON entre cuatro categorias posibles: `keep`, `investigate`, `candidate` o `unused`. No es un asistente generalista, sino un clasificador especializado con salida estructurada y razonamiento trazable.

El modelo recibe un paquete de observaciones numeradas de solo lectura sobre el elemento en cuestion —que procesos, servicios o contenedores lo usan, su estado en Git o Jujutsu, que proyectos fijan una version de runtime concreta, si comparte inodos por hard-link, si existen duplicados verificados, cuando cambio por ultima vez y cuando trabajo con el un agente— y devuelve un objeto JSON con la decision, una razon en lenguaje natural, los identificadores de evidencia en los que se basa y una lista de comprobaciones pendientes.

Es relevante porque aborda un problema practico de operaciones y mantenimiento de sistemas con un modelo diminuto (752 millones de parametros, fichero de 505 MiB, unos 830 MiB de RAM) que corre localmente en CPU sin GPU. La propuesta de valor no es la potencia bruta sino la seguridad: el modelo nunca propone borrar algo que deberia conservar y toda decision de eliminacion queda como propuesta sujeta a aprobacion humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con ajuste fino LoRA fusionado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `-c 2048` |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio incluye otros ficheros GGUF no detallados |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 2.1 GB |
| Tamano del fichero principal | 505 MiB (Q4_K_M) |
| RAM estimada en inferencia | aproximadamente 830 MiB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | gguf / llama.cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se ajusta mediante LoRA sobre la tarea especifica de revision de almacenamiento. El adaptador se fusiona con los pesos base y el resultado se cuantiza a Q4_K_M en formato GGUF para permitir inferencia en CPU. El autor indica explicitamente que se trata del modelo de lenguaje unicamente, sin componentes multimodales, y que el entrenamiento uso JSON compacto con el caracter `<` escapado como `\u003c`.

El entrenamiento se orienta a una tarea de clasificacion con salida estructurada y evidencia citada. El modelo aprende a mapear observaciones numeradas a una de cuatro decisiones, a citar los identificadores de evidencia relevantes (`e1`, `e5`, `e7`, etc.) y a declarar comprobaciones pendientes cuando la informacion es insuficiente. La model card menciona que se entreno con nombres de fichero y notas de propietario disenados para forzar una decision, lo que constituye una forma de robustez frente a inyeccion de prompt. El formato de prompt es ChatML con el modo de razonamiento (thinking) desactivado. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de elementos de almacenamiento en cuatro categorias: `keep`, `investigate`, `candidate` y `unused`.
- Generacion de salida JSON estructurada y validable contra un esquema (`json_schema`), lo que garantiza respuestas bien formadas.
- Citacion de evidencia: cada respuesta incluye los identificadores de las observaciones en las que se basa.
- Razonamiento trazable: la razon textual reformula unicamente la evidencia citada.
- Deteccion de comprobaciones pendientes: cuando falta informacion, emite `investigate` y nombra la comprobacion que falta (`usage`, `contents`, `vcs`, `references`, `duplicates`, `owner`).
- Distincion entre elementos regenerables (`candidate`) y datos personales antiguos probablemente innecesarios (`unused`).
- Robustez frente a inyeccion de prompt en nombres de fichero y notas del propietario.
- Capacidad de exploracion autonoma cuando se combina con los recolectores incluidos: abre carpetas grandes, localiza copias identicas byte a byte y ejecuciones superadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible como capacidad nativa; el modelo evalua un elemento por llamada.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: modo thinking desactivado, salida JSON con esquema, inferencia local en CPU.

## Casos de uso

- Limpieza asistida de directorios home en Linux: el modelo recibe el paquete de observaciones de cada elemento y propone que conservar, que investigar y que candidatos a eliminacion existen, dejando la aprobacion final al usuario. Es adecuado porque su ventana de contexto y su entrenamiento estan calibrados para paquetes de evidencia compactos y su salida es JSON validable.
- Gestion de toolchains de desarrollo: detecta versiones de runtime instaladas que no son la predeterminada y que ningun proyecto fija, marcandolas como `candidate` con instrucciones de reinstalacion (por ejemplo, `rustup toolchain install 1.70.0`). Encaja por su capacidad de razonar sobre fijaciones de version y estado de Git.
- Deduplicacion de copias de seguridad y artefactos: identifica duplicados verificados byte a byte y ejecuciones superadas por versiones mas recientes, clasificandolos como `candidate`. La deteccion de hard-links y duplicados verificados esta entre las observaciones que el modelo sabe interpretar.
- Auditoria de caches de compilacion: distingue caches conocidas y salidas de build junto a su manifiesto, que son regenerables, de directorios con estado de aplicacion o credenciales que deben conservarse. Util para pipelines de integracion continua que acumulan artefactos.
- Revision de checkouts de Git y Jujutsu: evalua si un repositorio es re-clonable y si tiene trabajo sin confirmar o sin subir, decidiendo entre `keep` e `investigate`. Aprovecha el estado de control de versiones incluido en el paquete de observaciones.
- Asistencia a agentes de mantenimiento: integrado como paso de revision dentro de un agente mayor, el modelo aporta una decision estructurada y citada que el agente puede presentar al usuario antes de cualquier eliminacion. Su bajo consumo (830 MiB de RAM, unos 6 segundos por elemento en CPU ARM de 4 nucleos) lo hace viable en segundo plano.
- Clasificacion masiva por lotes en servidores sin GPU: al correr en CPU con llama.cpp y cuantizacion Q4_K_M, permite procesar inventarios de almacenamiento en maquinas modestas sin depender de servicios en la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Conjunto de datos | Metrica | Valor |
|---|---|---|---|
| Revision de elementos de almacenamiento (keep / investigate / candidate / unused) | Seis carpetas home sinteticas, de extremo a extremo (28 elementos) | Precision de decision | 100 % |
| Revision de elementos de almacenamiento (keep / investigate / candidate / unused) | Validacion generada por DiskSage (600 elementos) | Precision de decision | 100 % |
| Revision de elementos de almacenamiento (keep / investigate / candidate / unused) | Validacion generada por DiskSage (600 elementos) | Comprobaciones exactas | 99,7 % |

Rendimiento operativo declarado: aproximadamente 6 segundos por elemento en una CPU ARM de 4 nucleos, con un consumo de RAM de unos 830 MiB y un fichero de 505 MiB.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta pensado para CPU; en GPU, la cuantizacion Q4_K_M de 505 MiB cabe en cualquier GPU con mas de 1 GB de memoria.
- GPU recomendadas: no se especifican en la informacion proporcionada; cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) puede alojar el modelo con holgura.
- Compatibilidad con GPU consumer: si, cabe en practicamente cualquier GPU consumer e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp mediante `llama-server` (probado con la version v0.7.0), con API compatible con OpenAI (`/v1/chat/completions`) y soporte de `response_format` con `json_schema`. Otros runners compatibles con GGUF no se detallan en la informacion disponible.
- Latencia y throughput estimados: aproximadamente 6 segundos por elemento en CPU ARM de 4 nucleos; no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales frente al modelo base y a alternativas genericas de la misma categoria:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| DiskSage-0.8B | 752 M | no disponible | Revision de almacenamiento con salida JSON | apache-2.0 | GGUF |
| Qwen3.5-0.8B (base) | 0,8 B (aproximado) | no disponible | Proposito general | apache-2.0 (segun enlace de licencia del autor) | safetensors |
| Clasificadores de texto genericos | no disponible | no disponible | Clasificacion generica | variable | variable |

No se conocen en la informacion disponible modelos directamente comparables en la tarea especifica de revision de almacenamiento con salida estructurada y evidencia citada.

## Limitaciones y advertencias

- El modelo solo juzga la evidencia que recibe. Fue entrenado con observaciones de un conjunto concreto de recolectores y las descripciones en formato libre no funcionaran igual de bien.
- Debe usarse como ayuda a la revision: una persona debe aprobar cada eliminacion. La decision `candidate` es una propuesta, nunca un permiso.
- La categoria `unused` implica perdida de datos si se elimina; requiere confirmacion explicita del propietario.
- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente; ademas, se obtuvieron sobre conjuntos sinteticos y generados por el propio modelo, lo que limita su validez como medida de generalizacion.
- Riesgo de alucinacion: aunque el diseno obliga a citar evidencia, el modelo podria citar observaciones incorrectas o reformular de forma imprecisa; conviene validar la salida contra el esquema y revisar las citas.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el enlace de licencia apunta al modelo base Qwen3.5-0.8B, por lo que conviene verificar los terminos de dicho modelo base.
- Requiere construir el esquema JSON por paquete, ya que el esquema lista los identificadores de observacion del paquete concreto.
- El uso de decodificacion voraz (greedy) es recomendado por el autor; otras configuraciones de muestreo pueden degradar la calidad de la salida estructurada.
- El contexto de despliegue de ejemplo es de 2048 tokens; paquetes de evidencia mas grandes podrian exceder la ventana si esta no se amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Microck/DiskSage-0.8B-GGUF
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
