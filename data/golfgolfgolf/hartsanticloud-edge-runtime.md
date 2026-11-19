# golfgolfgolf/hartsanticloud-edge-runtime

## Resumen

Hart's Anti-Cloud Edge AI Runtime es un runtime de inferencia y plano de control para IA local-first, publicado por el usuario `golfgolfgolf` bajo licencia Apache 2.0. No se trata de un modelo de lenguaje entrenado desde cero, sino de un paquete de software que orquesta modelos de la familia Liquid AI LFM2.5 (versiones Instruct en GGUF de 1.2B, 8B-A1B y 24B-A2B) junto con un pipeline RAG local basado en `sqlite-vec` y embeddings BGE-Small, transcripción offline con `whisper.cpp` y un supervisor escrito en Rust.

El objetivo declarado es ofrecer un nodo de IA de "egress cero": sin puertos TCP expuestos, comunicación mediante socket `AF_UNIX` con permisos `0600`, y soporte para entornos air-gapped. Se distribuye como binario precompilado para Linux x86_64 con un instalador y un plano de control de escritorio nativo construido con Tauri v2. La inferencia se delega a `llama.cpp`, lo que permite ejecución en CPU escalada por niveles de hardware.

Es relevante ahora porque responde a la demanda creciente de despliegues de IA soberanos y auditables, donde los datos no salen del perímetro del usuario. El repositorio es de tamaño reducido (0,1 GB), no registra descargas ni likes en el momento de la consulta, y la documentación pública disponible es escasa más allá del README y las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia sobre `llama.cpp`; modelos base LFM2.5 (arquitectura del modelo base no detallada en la información disponible) |
| Parametros totales | Variable según modelo base: 1.2B, 8B-A1B (MoE con 1B activos) y 24B-A2B (MoE con 2B activos) |
| Parametros activos | 1B en LFM2.5-8B-A1B; 2B en LFM2.5-24B-A2B; no aplica en el 1.2B |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (los modelos base se distribuyen en formato GGUF; niveles concretos no disponibles) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelos base); el runtime se distribuye como binario Linux x86_64 (`.tar.zst`) |

## Arquitectura y entrenamiento

El repositorio no contiene pesos de un modelo entrenado por el autor, sino un runtime que integra modelos preentrenados de Liquid AI. La inferencia se ejecuta mediante `llama.cpp` en CPU, con escalado por niveles de hardware ("tier-scaled CPU inference"), lo que sugiere selección automática del modelo LFM2.5 adecuado según los recursos disponibles. La familia LFM2.5 incluye variantes densas (1.2B) y MoE (8B-A1B y 24B-A2B), aunque los detalles de arquitectura interna, número de tokens de entrenamiento y composición del dataset no se especifican en la información disponible.

El componente diferencial es el plano de control: un supervisor en Rust que expone un socket `AF_UNIX` con permisos `0600` y ningún puerto TCP abierto, un puente MCP sobre `stdio`, aislamiento de agentes mediante Wasmtime y Firecracker, una bóveda RAG embebida con `sqlite-vec` y embeddings BGE-Small, y transcripción offline con `whisper.cpp`. La interfaz de usuario es una aplicación de escritorio Tauri v2. No se documentan procesos de RLHF, DPO ni ajuste fino propios del autor.

## Capacidades

- Generación de texto e instrucciones mediante los modelos LFM2.5 Instruct en formato GGUF.
- RAG local sobre una bóveda `sqlite-vec` con embeddings BGE-Small, sin llamadas a servicios externos.
- Transcripción de audio offline mediante `whisper.cpp`.
- Servidor MCP sobre `stdio` para integración con clientes compatibles con Model Context Protocol.
- Ejecución de agentes en sandbox con Wasmtime y Firecracker.
- Operación en entornos air-gapped y con política de egress cero.
- Plano de control de escritorio nativo con Tauri v2.
- Soporte de tool calling y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada (dependerá de las capacidades de los modelos LFM2.5 base).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Despliegue de asistentes en entornos air-gapped: el runtime no abre puertos TCP y usa un socket `AF_UNIX` con permisos `0600`, lo que permite operar en redes clasificadas o sin conectividad sin exponer superficie de red.
- RAG sobre documentación interna sensible: la bóveda `sqlite-vec` con BGE-Small mantiene los embeddings y los documentos en disco local, evitando enviar contenido a APIs externas.
- Transcripción de reuniones o entrevistas confidenciales: `whisper.cpp` procesa el audio en la propia máquina, sin subir ficheros a servicios de terceros.
- Integración con herramientas de desarrollo mediante MCP: el puente `stdio` permite conectar el runtime a clientes que hablan Model Context Protocol sin abrir puertos.
- Ejecución de agentes automatizados con aislamiento: Wasmtime y Firecracker permiten confinar el código generado o las acciones del agente, reduciendo el riesgo de ejecución arbitraria en el host.
- Estaciones de trabajo con CPU y sin GPU dedicada: la inferencia vía `llama.cpp` con modelos de 1.2B a 24B-A2B permite elegir el nivel adecuado según la máquina, incluyendo portátiles.
- Cumplimiento y soberanía de datos: organizaciones con requisitos de residencia de datos pueden auditar el binario y verificar que no hay egress de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma soportada en la release documentada: Linux x86_64.
- Inferencia en CPU mediante `llama.cpp`; no se documenta soporte GPU explícito.
- VRAM estimada: no aplica para ejecución en CPU; no disponible para aceleración GPU.
- Modelo mínimo (LFM2.5-1.2B en GGUF): viable en equipos de consumo con varios GB de RAM; la cifra exacta depende de la cuantización, no especificada.
- Modelos mayores (8B-A1B y 24B-A2B): requieren más RAM; los parámetros activos reducen el coste computacional por token, pero el peso total en memoria depende de la cuantización.
- GPU recomendadas: no disponible.
- Despliegue: binario precompilado con instalador (`install.sh`) y paquete `.tar.zst`; verificación de integridad mediante `SHA256SUMS`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Runtime / solución | Enfoque | Modelos integrados | Egress de red | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hart's Anti-Cloud Edge Runtime | Runtime local-first con RAG, STT y sandbox | LFM2.5 (1.2B, 8B-A1B, 24B-A2B) | Cero (socket `AF_UNIX`, sin TCP) | Apache 2.0 | Binario Linux x86_64, v0.1.0 |
| Ollama | Servidor local de inferencia | Amplio catálogo GGUF | Servicio HTTP local | MIT | Multiplataforma |
| llama.cpp (directo) | Motor de inferencia | Cualquier GGUF | Sin red por defecto | MIT | Código fuente, multiplataforma |
| LM Studio | Aplicación de escritorio | Amplio catálogo GGUF | Local (con opciones de red) | Propietaria | Windows, macOS, Linux |

La comparativa se limita a características documentadas; no hay datos de rendimiento comparativo disponibles para este runtime.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado propio: las capacidades reales dependen de los modelos LFM2.5 de Liquid AI, cuyas limitaciones y sesgos se heredan.
- Idioma soportado declarado: únicamente inglés; el rendimiento en castellano no está garantizado.
- Documentación muy escasa: el README se limita a instrucciones de instalación y una descripción de alto nivel; no hay guía de API, configuración ni solución de problemas.
- Proyecto con cero descargas y cero likes en el momento de la consulta, versión v0.1.0: madurez y mantenimiento a largo plazo no verificables.
- Plataforma limitada a Linux x86_64 en la release documentada; sin binarios para macOS, Windows ni ARM.
- Riesgo de alucinación inherente a los modelos de lenguaje base; no se documentan mitigaciones específicas más allá del RAG local.
- Aunque la licencia del repositorio es Apache 2.0, deben revisarse las licencias de los modelos LFM2.5 base y de las dependencias (`whisper.cpp`, `llama.cpp`, BGE-Small, Wasmtime, Firecracker) para uso comercial.
- El aislamiento con Firecracker requiere soporte de virtualización KVM en el host; no se detallan los requisitos exactos.
- No hay información pública sobre auditorías de seguridad del binario distribuido; la verificación se limita al checksum `SHA256SUMS`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/golfgolfgolf/hartsanticloud-edge-runtime
- Release v0.1.0 en GitHub: https://github.com/golfgolfgolf200/hartsanticloudsoftware/releases/tag/v0.1.0
- Sitio del proyecto: https://hartsanticloudsoftware.com
- Modelo base LFM2.5-1.2B-Instruct-GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Modelo base LFM2.5-8B-A1B-GGUF: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Modelo base LFM2.5-24B-A2B-GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
