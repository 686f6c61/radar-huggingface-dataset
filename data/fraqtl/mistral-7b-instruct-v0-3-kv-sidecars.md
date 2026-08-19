# fraQtl/mistral-7b-instruct-v0.3-kv-sidecars

## Resumen

fraQtl/mistral-7b-instruct-v0.3-kv-sidecars es un conjunto de artefactos de compresión de caché KV (sidecars) desarrollados por fraQtl para el modelo Mistral-7B-Instruct-v0.3. No es un modelo de lenguaje independiente, sino un adaptador que se integra en vLLM mediante un backend de atención propietario llamado `fraqtl`, permitiendo servir el modelo base con 2,4 veces la capacidad de caché KV que fp16 y 1,2 veces la de fp8-KV en NVIDIA A100, manteniendo aproximadamente un 95% de la velocidad de decodificación de fp16 a 8K de contexto y paridad a 32K. La compresión se basa en una "membrana" que almacena K y V en páginas comprimidas: un subespacio protegido calibrado de alta precisión (rank 16 de 128 para K, rank 32 de 128 para V, por capa y por cabeza) más una cola INT4 en las dimensiones restantes. El modelo base no se modifica ni se redistribuye; los sidecars son artefactos calibrados que se consumen en tiempo de ejecución.

La relevancia actual de este modelo radica en que aborda el cuello de botella de la memoria de caché KV en servidores de inferencia, permitiendo más usuarios concurrentes por GPU o contextos más largos dentro de un presupuesto de memoria fijo. La verificación de recuperación se realiza mediante rejillas needle-in-a-haystack (NIAH) en todos los puntos publicados, con resultados reproducibles de forma independiente. La licencia de los sidecars es Apache 2.0, pero el runtime `fraqtl` es propietario (gratuito para evaluación), y el modelo base se descarga bajo su propia licencia de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecars de compresion de caché KV (subespacio protegido + cola INT4) sobre Mistral-7B-Instruct-v0.3 |
| Parametros totales | no disponible (los sidecars no anaden parametros al modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 8K y 32K (ventana nativa de Mistral-7B; no soporta 128K) |
| Tipos de cuantizacion | INT4 para la cola de dimensiones residuales; fp16 para el subespacio protegido |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (sidecars y receipts); runtime `fraqtl` propietario; modelo base bajo licencia de Mistral AI |
| Formato de pesos | Sidecars calibrados (no safetensors estandar); consumidos por el runtime `fraqtl` |

## Arquitectura y entrenamiento

La compresion se implementa como una "membrana" entre el modelo y la caché KV paginada de vLLM. Al escribir, K y V se almacenan en un formato de pagina comprimida: un subespacio protegido calibrado (rank 16 de 128 para K, rank 32 de 128 para V, por capa y por cabeza) mantenido en alta precision, mas una cola INT4 en las dimensiones restantes. El rango logico se mantiene en 128, sin truncamiento. Al leer, el kernel de atencion consume las paginas comprimidas directamente a velocidad de tensor core, sin paso de descompresion previa, lo que evita que la ganancia de capacidad degrade el ancho de banda de decodificacion. La receta se etiqueta como `sm80_k16prot_k112i4_v32prot_v96i4_rv128`.

El metodo de calibracion de los subespacios protegidos no se publica; los sidecars son los artefactos calibrados suficientes para ejecutar y verificar todas las cifras de la pagina. La calibracion se realizo con el dataset wikitext-2-raw-v1 (test split): 16 secuencias de 1024 tokens para el sidecar K y 128 secuencias con 65.536 tokens totales para el sidecar V, por capa y por cabeza. No se incluyeron datos de tareas, benchmarks ni contenido de pruebas de recuperacion. El modelo base no se entrena ni se modifica; los sidecars actuan como adaptadores externos.

## Capacidades

- Compresion de caché KV: 2,4x la capacidad de fp16 y 1,2x la de fp8-KV en A100, con verificacion de recuperacion NIAH (21/21 por brazo a 8K y 32K).
- Velocidad de decodificacion batch-1: aproximadamente 95% de fp16 a 8K (85,7 tok/s frente a 90,39) y paridad a 32K (76,84 frente a 77,98).
- Integracion con vLLM 0.20.2 mediante el mecanismo estandar de plugins out-of-tree (`vllm.general_plugins`).
- Soporte de hardware: NVIDIA Ampere SM80 (A100) unicamente; Hopper y Blackwell no soportados.
- Recuperacion verificada: rejillas needle-in-a-haystack con 7 profundidades y 3 claves por contexto, con coincidencia exacta (126/126 total).
- Reproducibilidad: script `fraqtl_repro_receipts.py` que reproduce todos los numeros con una sola orden en A100 alquilado.
- No incluye capacidades de vision, audio ni tool calling; es un artefacto de compresion, no un modelo generativo independiente.

## Casos de uso

- Aumento de usuarios concurrentes por GPU en servicios de chat: al multiplicar la capacidad de caché KV por 2,4 respecto a fp16, un mismo A100 puede atender mas sesiones simultaneas sin aumentar el presupuesto de memoria, con degradacion minima de velocidad de decodificacion.
- Contextos largos dentro de memoria fija: para aplicaciones que necesitan ventanas de 8K o 32K, los sidecars permiten mantener mas secuencias activas en la misma VRAM, util en sistemas de atencion al cliente con historiales extensos.
- Reduccion de coste por token de caché: al comprimir K y V en formato INT4 + subespacio protegido, el coste de almacenamiento por token de contexto disminuye, abaratando el despliegue de modelos grandes en produccion.
- Evaluacion de calidad de compresion: los receipts publicados y el script de reproduccion permiten a equipos de ML verificar la perdida de calidad de recuperacion antes de adoptar la solucion en su infraestructura.
- Despliegue en entornos vLLM existentes: la integracion via plugin estandar facilita probar la compresion sin reescribir el pipeline de inferencia, solo instalando el wheel y registrando el backend.
- Investigacion sobre compresion de caché KV: los sidecars calibrados sirven como referencia reproducible para estudiar tecnicas de subespacio protegido + cuantizacion de cola en modelos de 7B.

## Benchmarks y rendimiento

La tabla siguiente resume los resultados publicados en la model card (tres brazos, misma GPU A100-80GB, batch 1, CUDA graphs activados, prefix caching desactivado). La verificacion de recuperacion se realizo con rejillas NIAH de 7 profundidades × 3 claves, con coincidencia exacta.

| Contexto | Brazo | Decode (tok/s) | NIAH | KV pool (tokens) |
|---|---|---|---|---|
| 8K | fraQtl D2 | 85,7 | PASS | 997.200 |
| 8K | fp16 (stock vLLM) | 90,39 | PASS | 412.544 |
| 8K | fp8-KV | 90,05 | PASS | 825.104 |
| 32K | fraQtl D2 | 76,84 | PASS | 937.568 |
| 32K | fp16 | 77,98 | PASS | 407.760 |
| 32K | fp8-KV | 82,81 | PASS | 799.952 |

Se realizo una reproduccion independiente (2026-07-03) a traves del camino publico completo: todas las celdas NIAH PASS, pools fp16/fp8 identicos a los receipts, y decodificacion D2 de 85,51 tok/s a 8K y 78,24 a 32K (dentro del 2% de los receipts). Las velocidades de decodificacion varian unos pocos puntos porcentuales entre ejecuciones; los pools y resultados de recuperacion son deterministicos.

## Requisitos de hardware

- VRAM estimada: no disponible directamente; la ganancia de capacidad de caché KV implica que para una misma memoria, se pueden servir mas tokens de contexto. En A100-80GB, el pool KV pasa de 412.544 tokens (fp16) a 997.200 (fraQtl D2) a 8K.
- GPU recomendadas: NVIDIA A100 (SM80) unicamente. No soporta Hopper (H100) ni Blackwell (B200).
- No cabe en GPUs de consumo (RTX 4090, etc.) porque el runtime `fraqtl` esta compilado para SM80 y el backend requiere la microarquitectura Ampere de datacenter.
- Opciones de despliegue: vLLM 0.20.2 con torch 2.11.0 (stack validado), mediante el plugin `vllm.general_plugins`. No hay soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: batch-1 decode de 85,7 tok/s a 8K y 76,84 a 32K en A100-80GB. No se publican datos de throughput con batch mayor.

## Comparativa con modelos similares

La comparativa natural es contra las alternativas de gestion de caché KV en vLLM para el mismo modelo base Mistral-7B-Instruct-v0.3:

| Aspecto | fraQtl D2 (sidecars) | vLLM fp16 | vLLM fp8-KV |
|---|---|---|---|
| Capacidad KV pool a 8K | 997.200 tokens | 412.544 tokens | 825.104 tokens |
| Capacidad KV pool a 32K | 937.568 tokens | 407.760 tokens | 799.952 tokens |
| Decode a 8K (tok/s) | 85,7 | 90,39 | 90,05 |
| Decode a 32K (tok/s) | 76,84 | 77,98 | 82,81 |
| Verificacion NIAH | PASS (21/21) | PASS (21/21) | PASS (21/21) |
| Licencia | Apache 2.0 (sidecars) + runtime propietario | Apache 2.0 (vLLM) | Apache 2.0 (vLLM) |
| Hardware | Solo A100 (SM80) | Cualquier GPU soportada por vLLM | Cualquier GPU soportada por vLLM |
| Integracion | Plugin vLLM + wheel propietario | Nativo en vLLM | Nativo en vLLM |

No se dispone de comparativas con otros modelos de compresion de caché KV (como KIVI, KVQuant o ZipKV) en la informacion proporcionada.

## Limitaciones y advertencias

- El runtime `fraqtl` es propietario (aunque gratuito para evaluacion); el uso en produccion puede estar sujeto a terminos adicionales no especificados en la model card.
- Solo soporta NVIDIA A100 (SM80). No funciona en H100, B200 ni GPUs de consumo, lo que limita su adopcion en clusters modernos.
- No soporta contextos de 128K: el modelo colapsa bajo extension YaRN mas alla de 32K, y fp16 tambien falla la prueba de recuperacion en ese rango (receipted).
- La calibracion se realizo unicamente con wikitext-2-raw-v1; no se ha verificado el rendimiento con otros dominios (codigo, conversacion, etc.).
- El idioma soportado es exclusivamente ingles; no hay evaluacion multilingue.
- La velocidad de decodificacion varia entre ejecuciones (varios puntos porcentuales), aunque los pools y resultados de recuperacion son deterministicos.
- No se publican benchmarks de calidad del modelo (MMLU, HumanEval, etc.) porque los sidecars no alteran los pesos del modelo base; la calidad generativa es la de Mistral-7B-Instruct-v0.3.
- El metodo de calibracion de los subespacios protegidos no se divulga, lo que dificulta la auditoria independiente de la tecnica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fraQtl/mistral-7b-instruct-v0.3-kv-sidecars
- Runtime wheel y procedencia de build: https://huggingface.co/fraQtl/fraqtl-sm80-runtime
- Modelo base Mistral-7B-Instruct-v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio GitHub fraQtl D1: https://github.com/fraqtl-ai/fraqtl-mistral-d1
- Modelo companion Qwen3-4B-Instruct-2507 kit: https://huggingface.co/fraQtl/qwen3-4b-instruct-2507-kv-sidecars
- Script de reproduccion: `fraqtl_repro_receipts.py` (incluido en el repositorio)
- Receipts originales y reproduccion independiente: `receipts/` y `receipts/repro_2026_07_03/` dentro del repositorio
