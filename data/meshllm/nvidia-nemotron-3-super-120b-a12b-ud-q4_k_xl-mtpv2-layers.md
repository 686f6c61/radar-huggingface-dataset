# meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-layers

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de capas en formato GGUF derivado de NVIDIA-Nemotron-3-Super-120B-A12B, en su cuantización UD-Q4_K_XL y variante MTPv2. Lo publica el proyecto Mesh LLM (usuario meshllm) para ejecutar el modelo de forma distribuida entre varias máquinas de un clúster local. La fuente es el GGUF completo del mismo autor, que a su vez procede de la familia Nemotron 3 de NVIDIA, un modelo de tipo Mixture of Experts con 120B parámetros totales y 12B activos por token.

El paquete divide el GGUF original en artefactos por capa (89 capas registradas) y añade un manifiesto con sumas de verificación, de modo que el runtime Mesh LLM pueda repartir capas entre nodos y servir una API compatible con OpenAI (`/v1/chat/completions`) sin depender de la nube. Resuelve el problema de que un GGUF de 90,4 GB no cabe en la memoria de una sola máquina de consumo: en lugar de recurrir a un proveedor externo, se agrega memoria y cómputo de varios equipos.

Es relevante porque muestra una vía práctica de inferencia privada para un modelo de escala 120B-A12B en hardware propio, con el coste de complejidad operativa que implica un clúster. Conviene subrayar que la ficha describe el paquete de distribución, no el modelo base: los detalles de arquitectura, entrenamiento y benchmarks deben consultarse en la model card de origen, que este repositorio no reproduce.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia NVIDIA Nemotron 3, escala 120B-A12B; el paquete es un GGUF por capas) |
| Parámetros totales | 120B (escala declarada 120B-A12B); el campo safetensors del repo indica 109.640.064, que no es coherente con la escala y probablemente refleja solo un subconjunto de artefactos |
| Parámetros activos | 12B (según la nomenclatura A12B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | UD-Q4_K_XL (variante MTPv2); no se documentan otras en este repo |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del GGUF de origen; condiciones concretas no disponibles en este repositorio) |
| Formato de pesos | GGUF, empaquetado como layer package con manifiesto `model-package.json` |
| Número de capas | 89 |
| Tamaño del repositorio | 90,4 GB |
| Runtime | mesh-llm (compatible con API OpenAI) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura (Super-120B-A12B) se trata de un transformer con mezcla de expertos, con 120B parámetros totales y 12B activos por token, pero este repositorio no aporta configuración de atención, número de expertos, dimensión oculta ni política de enrutamiento. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card del modelo fuente de NVIDIA y no se incluyen aquí.

La innovación técnica de este artefacto es de despliegue, no de entrenamiento: el GGUF original se fragmenta en artefactos por capa, cada uno con suma SHA-256, y se genera un manifiesto que identifica el origen exacto (revisión `360a2016...` y SHA-256 del fichero fuente `e0868d03...`). El runtime `skippy` escribe el paquete y Mesh LLM lo consume para repartir capas entre pares del clúster. La variante MTPv2 sugiere decodificación multi-token prediction en el modelo de origen, aunque el repositorio no especifica su implementación ni su impacto medido en latencia.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el paquete expone un endpoint de chat compatible con OpenAI.
- Inferencia privada en hardware propio: todo el cómputo ocurre en las máquinas del clúster, sin llamadas a servicios externos.
- Ejecución distribuida: las capas se reparten entre varios nodos, lo que permite servir un modelo de 120B que no cabría en un solo host.
- API compatible con OpenAI: `POST /v1/chat/completions` y listado de modelos en `/v1/models`, con descubrimiento del nombre del modelo vía `/api/status`.
- Despliegue multi-máquina: el comando `mesh-llm serve --split` se ejecuta en cada máquina que aporte memoria o cómputo.
- Capacidades del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo): no documentadas en este repositorio; deben verificarse en la model card del modelo fuente.

## Casos de uso

- Inferencia privada en clúster doméstico u oficina: varios equipos con GPU de consumo aportan memoria y cómputo para servir el modelo sin salir de la red local; adecuado cuando la confidencialidad de los prompts es requisito.
- Sustitución de API en la nube en entornos con restricciones de datos: al exponer `/v1/chat/completions`, las aplicaciones existentes que usan el formato OpenAI pueden apuntar a `http://localhost:3131` cambiando solo la URL base.
- Prototipado de asistentes conversacionales: el endpoint de chat permite integrar el modelo en interfaces de chat internas con el mismo esquema de mensajes que OpenAI.
- Evaluación de modelos de gran escala sin infraestructura de datacenter: útil para investigadores que quieren medir el comportamiento de un 120B-A12B con hardware repartido antes de comprometer presupuesto en GPUs profesionales.
- Laboratorio de sistemas distribuidos: el paquete por capas y el manifiesto con checksums permiten estudiar reparto de capas, tolerancia a fallos de nodos y latencia agregada en inferencia multi-máquina.
- Generación de código en pipelines internos: el ejemplo de la model card (una función hello-world en Rust) ilustra el uso como servicio de generación de texto; la idoneidad para código en producción depende de capacidades del modelo base no verificadas aquí.
- Despliegue reproducible con integridad verificable: las sumas SHA-256 del manifiesto y del fichero fuente permiten auditar que el paquete corresponde al GGUF original declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio remite a la del GGUF de origen para notas de benchmarks, pero no incluye cifras. Tampoco se documentan latencia ni throughput del despliegue distribuido.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 90,4 GB en cuantización UD-Q4_K_XL; la memoria agregada necesaria para inferencia es del orden de decenas de GB por nodo, repartida entre máquinas, sin cifra oficial publicada.
- GPU recomendadas: no disponible. El diseño está pensado para agregar memoria de varias máquinas, no para una GPU profesional concreta.
- GPU de consumo: el modelo completo no cabe en una sola GPU de consumo; el caso de uso previsto es repartir capas entre varios hosts, cada uno con su propia GPU o memoria disponible.
- Opciones de despliegue: runtime `mesh-llm` (comando `mesh-llm serve --model ... --split`) con API compatible con OpenAI en el puerto 3131. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete de capas.
- Latencia y throughput: no disponibles. Al ser inferencia distribuida, la latencia depende del número de nodos y de la red entre ellos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque de despliegue |
|---|---|---|---|---|---|
| Este paquete (Nemotron-3-Super-120B-A12B, UD-Q4_K_XL, MTPv2, layer package) | 120B totales / 12B activos | no disponible | GGUF por capas | other | Clúster local con Mesh LLM |
| GGUF de origen (meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-GGUF) | 120B totales / 12B activos | no disponible | GGUF monolítico (3 ficheros) | other | Un solo host con memoria suficiente o runtime GGUF estándar |
| Modelo base NVIDIA Nemotron 3 Super 120B-A12B | 120B totales / 12B activos | no disponible | safetensors (previsible) | no disponible | GPUs profesionales o servicios gestionados |
| Alternativas de escala similar (p. ej. otros MoE de ~100B con ~10B activos) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones del modelo base más allá de la escala, por lo que la comparativa se limita a formato y estrategia de despliegue.

## Limitaciones y advertencias

- Este repositorio es un artefacto de distribución, no un modelo autónomo: requiere el runtime Mesh LLM y el GGUF de origen para funcionar.
- La licencia es `other` y las condiciones concretas no se detallan en este repositorio; antes de uso comercial hay que revisar los términos del modelo fuente de NVIDIA y del GGUF de origen.
- El campo de parámetros en safetensors (109.640.064) no es coherente con la escala 120B-A12B declarada; no debe usarse como cifra de tamaño del modelo.
- No se documentan idiomas soportados, longitud de contexto ni sesgos del modelo base en este repositorio.
- La inferencia distribuida añade puntos de fallo (nodos caídos, latencia de red) y complejidad operativa frente a un despliegue en un solo host.
- Riesgo de alucinación y calidad de respuesta del modelo base: no evaluables con la información de este repositorio; hay que consultar la model card de origen y realizar pruebas propias.
- El paquete registra "package size: 0 B" y "activation width: not recorded" en su propia tabla de metadatos, lo que indica campos incompletos en la generación del paquete.
- El repositorio tiene 0 likes y 1.279 descargas en la fecha de consulta; es un artefacto reciente y con poca validación comunitaria.

## Enlaces

- Repositorio del paquete: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-layers
- GGUF de origen: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio GitHub de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Especificación del formato layer package: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catálogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord: https://discord.gg/rs6fmc63eN
