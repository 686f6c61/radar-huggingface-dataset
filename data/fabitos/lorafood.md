# Fabitos/lorafood

## Resumen

`Fabitos/lorafood` es un adaptador LoRA publicado en Hugging Face que especializa un modelo Qwen2.5 en la extracción estructurada de pedidos de comida a domicilio a partir de mensajes informales en portugués. El adaptador transforma texto libre (por ejemplo, un mensaje de WhatsApp de un cliente) en un objeto JSON con los campos `itens`, `pagamento`, `tipo`, `orcamento` y `troco_para`, lo que lo hace útil como componente de un pipeline de pedidos automatizado.

El repositorio es de tamano reducido (0,1 GB) y contiene unicamente los pesos del adaptador en formato safetensors, no el modelo base completo. La model card presenta una discrepancia relevante: el campo `base_model` del repositorio apunta a `Qwen/Qwen2.5-7B-Instruct`, mientras que el README describe el entrenamiento sobre `Qwen/Qwen2.5-0.5B-Instruct`. Esta inconsistencia debe resolverse antes de cualquier uso en produccion, ya que determina el modelo sobre el que hay que cargar el adaptador.

El interes del modelo es acotado pero claro: demuestra que un LoRA de rango bajo (r=8) entrenado en CPU durante 16 minutos sobre 1.200 ejemplos sinteticos puede alcanzar un 84,5% de coincidencia exacta en la extraccion de pedidos y un 100% de JSON valido en su conjunto de prueba. Es un ejemplo de especializacion barata de un modelo generalista para una tarea de extraccion de informacion en un dominio muy concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5 |
| Parametros totales | no disponible (adaptador LoRA r=8; el modelo base Qwen2.5-7B-Instruct tiene 7,6B aproximados, Qwen2.5-0.5B-Instruct tiene 0,5B aproximados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 8 sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de la atencion del modelo base Qwen2.5. Se entreno durante 1 epoca sobre 1.200 ejemplos con el optimizador AdamW, tasa de aprendizaje 1e-3 y un esquema de warmup con decaimiento lineal. El entrenamiento se realizo en CPU (16 minutos en 4 nucleos) mediante la herramienta Soup CLI, lo que subraya el bajo coste computacional del ajuste.

Los datos de entrenamiento son 1.540 ejemplos sinteticos (1.200 para entrenamiento, el resto presumiblemente para validacion y prueba). Los pedidos se generan aleatoriamente a partir de un catalogo ficticio de 49 items, y las mensajes fueron redactadas por LLMs (gpt-oss-120b y qwen3.8-27b via Groq). No se menciona el uso de RLHF ni DPO; se trata de un ajuste supervisado clasico sobre datos generados. La innovacion tecnica es minima: el valor esta en la especializacion de formato (salida JSON estricta) y en el bajo coste de entrenamiento.

## Capacidades

- Extraccion de informacion estructurada: convierte mensajes informales en portugues a JSON con esquema fijo (`itens`, `pagamento`, `tipo`, `orcamento`, `troco_para`).
- Normalizacion de pedidos: interpreta cantidades, observaciones por item y forma de pago a partir de texto libre.
- Salida JSON valida: la model card reporta un 100% de JSON valido en el conjunto de prueba de 200 ejemplos.
- Especializacion en dominio de delivery: reconocimiento de items de un catalogo cerrado de 49 productos.
- Capacidades heredadas del modelo base Qwen2.5 (generacion de texto general, razonamiento, codigo): no documentadas ni evaluadas para este adaptador.
- Tool calling / function calling: no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al portugues segun la model card; no se evalua otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Automatizacion de pedidos por WhatsApp: el adaptador recibe el mensaje del cliente y devuelve un JSON listo para insertar en el sistema de pedidos, eliminando la transcripcion manual. Es adecuado porque el esquema de salida esta fijado y el modelo se entreno especificamente para ese formato.
- Integracion en chatbots de restaurante: como paso de post-procesado de la conversacion, el bot puede delegar en el adaptador la conversion del mensaje final del cliente a una orden estructurada antes de confirmar el pedido.
- Pre-rellenado de formularios de pedido: en una app de delivery, el adaptador puede generar los campos del carrito (items, cantidades, observaciones) a partir del texto libre, reduciendo la friccion para el usuario.
- Extraccion de observaciones y preferencias: el campo `obs` por item permite capturar instrucciones como "sin cebolla" o "bien cocido", utiles para cocina y logistica.
- Gestion de pagos y cambio: los campos `pagamento` y `troco_para` permiten derivar automaticamente la forma de pago y el cambio solicitado, agilizando el cierre del pedido en caja.
- Prototipado rapido de pipelines de extraccion: al ser un LoRA de bajo coste entrenado en CPU, sirve como plantilla para equipos que quieran replicar el flujo con su propio catalogo y dominio.
- Filtrado y validacion de pedidos: la salida JSON valida al 100% en el conjunto de prueba permite usarla como capa de validacion estructural antes de pasarla a un sistema transaccional.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 200 ejemplos de prueba:

| Metrica | Valor |
|---|---:|
| Pedido exacto | 84,5% |
| F1 de items | 95,1% |
| JSON valido | 100% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Con Qwen2.5-0.5B-Instruct en fp16, aproximadamente 1-2 GB; con Qwen2.5-7B-Instruct en fp16, aproximadamente 14-16 GB. El adaptador en si ocupa una fraccion minima (repo de 0,1 GB).
- GPU recomendadas: para el base de 0,5B, cualquier GPU consumer moderna (RTX 3060, RTX 4060) o incluso CPU; para el base de 7B, RTX 4090 (24 GB), A100 40 GB o H100.
- Cabe en consumer GPU: si, tanto el base de 0,5B como el de 7B en cuantizacion 4-bit (por ejemplo, ~4-5 GB para el 7B en 4-bit).
- Opciones de despliegue: PEFT con transformers, vLLM (soporte de adaptadores LoRA), llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF, TGI con soporte de adaptadores.
- Latencia y throughput estimados: no disponibles. El autor solo reporta el tiempo de entrenamiento (16 minutos en CPU con 4 nucleos), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fabitos/lorafood | Adaptador sobre Qwen2.5 (0,5B o 7B segun la fuente) | no disponible | Extraccion de pedidos delivery en pt | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (base) | ~7,6B | 128K tokens (segun documentacion de Qwen2.5) | Modelo generalista | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct (base alternativo) | ~0,5B | 32K tokens (segun documentacion de Qwen2.5) | Modelo generalista | Apache 2.0 | Hugging Face |

La comparativa con otros adaptadores especializados en extraccion de pedidos en portugues no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Datos sinteticos y catalogo fijo: el modelo solo conoce los 49 items del catalogo de entrenamiento y no fue evaluado con mensajes reales, segun la propia model card.
- Discrepancia en el modelo base: el campo `base_model` del repositorio indica Qwen2.5-7B-Instruct, mientras que el README describe el entrenamiento sobre Qwen2.5-0.5B-Instruct. Cargar el adaptador sobre el base equivocado puede degradar o invalidar los resultados.
- Riesgo de alucinacion: al ser un modelo generativo, puede inventar items fuera del catalogo o campos con valores no vistos en entrenamiento.
- Limitacion de idioma: solo portugues; no se evalua su comportamiento en otros idiomas.
- Uso en produccion: el autor advierte explicitamente de no usarlo sin evaluar con datos del dominio propio.
- Licencia: Apache 2.0 permite uso comercial, pero el adaptador hereda las limitaciones del modelo base Qwen2.5, cuya licencia tambien es Apache 2.0.
- Tamano de evaluacion limitado: los resultados se basan en 200 ejemplos de prueba, sin intervalos de confianza ni evaluacion cruzada.
- Sin datos de sesgo: no se documentan sesgos conocidos ni evaluaciones de robustez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Fabitos/lorafood
- Modelo base declarado en el repositorio: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base mencionado en el README: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Herramienta de entrenamiento Soup CLI: https://github.com/MakazhanAlpamys/Soup
