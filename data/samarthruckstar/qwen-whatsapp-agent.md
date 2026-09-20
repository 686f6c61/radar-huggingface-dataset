# samarthruckstar/qwen-whatsapp-agent

## Resumen

Qwen2.5-1.5B WhatsApp Customer Service Agent es un adaptador LoRA (PEFT) entrenado por el usuario samarthruckstar sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. El adaptador está especializado en atención al cliente por WhatsApp para Mahadyuti Engineering Solution, un fabricante de maquinaria industrial (máquinas de fabricación de chanclas, moldes de alcanfor, máquinas de vasos sambrani y máquinas de laminado de papad). El repositorio incluye tanto los pesos del adaptador en safetensors (~73,9 MB) como una versión cuantizada en GGUF Q4_K_M (~986 MB) lista para llama.cpp y Ollama.

El problema que resuelve es acotado y muy concreto: respuestas ancladas a un catálogo cerrado de maquinaria, aplicación consistente de un recargo del 18 % de GST en las cotizaciones y rechazo explícito de consultas sobre productos que la empresa no fabrica, evitando así la invención de referencias o precios. No es un modelo de propósito general: es un ajuste de dominio orientado a un despliegue conversacional de bajo coste, con un tamaño que permite ejecución en CPU o en GPU de gama de entrada.

Técnicamente, el modelo hereda la arquitectura Transformer decoder-only de Qwen2.5 (1,5 mil millones de parámetros, contexto de 32.768 tokens en el modelo base) y añade un adaptador LoRA de rango 16 sobre los módulos de atención y MLP. Está etiquetado para inglés y hindi, y se publica bajo licencia Apache 2.0. El repositorio no registra descargas ni valoraciones en el momento de la consulta, y no incluye resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre el modelo base |
| Parametros totales | ~1,5 mil millones en el modelo base Qwen2.5-1.5B-Instruct; adaptador LoRA de ~73,9 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M publicada en el repositorio; al ser un adaptador, admite fusión y cuantización posterior a otros formatos |
| Idiomas soportados | en (inglés), hi (hindi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) y GGUF (qwen_whatsapp_q4_k_m.gguf) |
| Rango LoRA (r) | 16 |
| Alpha LoRA | 16 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | peft |
| Tarea (pipeline) | text-generation |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-1.5B-Instruct, un Transformer decoder-only con atención por consultas agrupadas (GQA), embeddings rotatorios (RoPE) y activación SwiGLU en las capas MLP. El ajuste se realiza mediante LoRA con r=16 y alpha=16 sobre los siete módulos lineales principales de atención y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), lo que implica que los pesos del modelo base permanecen congelados y solo se entrenan las matrices de bajo rango. Las herramientas declaradas en las etiquetas son transformers, TRL, Unsloth y PEFT, lo que sitúa el entrenamiento en un flujo de SFT (supervised fine-tuning) sobre datos conversacionales.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, la proporción de ejemplos por idioma ni si hubo fases posteriores de RLHF o DPO. La innovación técnica destacable no está en la arquitectura, sino en la especialización funcional: el modelo impone reglas de negocio verificables (recargo del 18 % de GST, referencias en markdown a imágenes de producto verificadas y rechazo de consultas fuera de catálogo) y se distribuye simultáneamente como adaptador PEFT y como GGUF Q4_K_M, lo que cubre tanto despliegues con GPU como inferencia en CPU.

## Capacidades

- Generación de texto conversacional multi-turno orientada a atención al cliente por WhatsApp, con aplicación de plantilla de chat mediante `apply_chat_template`.
- Respuestas ancladas a un catálogo cerrado de maquinaria industrial: máquinas de chanclas, moldes de alcanfor, máquinas de vasos sambrani y máquinas de laminado de papad.
- Aplicación consistente del recargo del 18 % de GST en las cotizaciones de maquinaria.
- Generación de referencias markdown a imágenes de producto verificadas.
- Comportamiento anti-alucinación: rechazo de consultas sobre productos no fabricados (por ejemplo, aviones, electrónica o gadgets de consumo) sin inventar productos ni precios.
- Capacidades multilingües limitadas a inglés e hindi, según las etiquetas del repositorio.
- Inferencia determinista opcional mediante decodificación greedy (`do_sample=False`), tal como muestra el ejemplo de uso del autor.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Atención al cliente automatizada por WhatsApp: el adaptador gestiona conversaciones multi-turno con la plantilla de chat de Qwen2.5 y responde consultas sobre maquinaria concreta, lo que permite atender consultas repetitivas de catálogo sin intervención humana.
- Cotización con reglas fiscales fijas: al aplicar siempre el recargo del 18 % de GST, el modelo sirve como primer nivel de presupuestación donde la consistencia fiscal importa más que la creatividad.
- Filtrado de leads fuera de catálogo: el comportamiento anti-alucinación permite descartar consultas de productos que la empresa no fabrica, derivando esos casos a un comercial sin generar respuestas falsas.
- Fichas de producto asistidas: la generación de referencias markdown a imágenes verificadas facilita enviar al cliente respuestas con enlaces e imágenes del producto correcto dentro del flujo de WhatsApp.
- Despliegue en servidor modesto o en el borde: gracias a la cuantización Q4_K_M (~986 MB) puede ejecutarse con Ollama o llama.cpp en una máquina sin GPU dedicada, adecuado para pymes con infraestructura limitada.
- Base para ajustes de dominio en otros catálogos: la receta (LoRA r=16 sobre Qwen2.5-1.5B-Instruct con Unsloth y TRL) es reutilizable para verticales similares de venta B2B de maquinaria o repuestos.
- Soporte en inglés y hindi: útil para mercados donde la clientela alterna entre ambos idiomas, aunque no cubre castellano.
- Prototipado rápido de asistentes conversacionales: al ser un adaptador de 73,9 MB, se puede versionar y desplegar como un artefacto ligero sobre un único modelo base compartido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador en precisión completa: el modelo base en bfloat16 ocupa aproximadamente 3,1 GB de pesos, más el adaptador de ~74 MB y el coste de activaciones y caché KV; en la práctica cabe en GPU con 6-8 GB de VRAM.
- VRAM para la versión GGUF Q4_K_M: el archivo pesa ~986 MB, por lo que la inferencia puede ejecutarse íntegramente en CPU con 2 GB de RAM disponibles, o parcialmente descargada a GPU.
- GPU recomendadas: no se especifican en la ficha. Por tamaño, cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070) es suficiente; GPU de数据中心 como A100 o H100 quedan sobredimensionadas para este modelo salvo despliegues con muchas réplicas concurrentes.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM; también es viable en CPU pura gracias a la cuantización Q4_K_M.
- Opciones de despliegue: transformers + PEFT (según el ejemplo del autor), llama.cpp, Ollama (con Modelfile), y servidores de inferencia compatibles con adaptadores LoRA. No se documenta compatibilidad explícita con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| samarthruckstar/qwen-whatsapp-agent | ~1,5 mil millones (base) + LoRA r=16 | No especificado en la ficha; el base soporta 32.768 tokens | apache-2.0 | HuggingFace, adaptador PEFT y GGUF Q4_K_M | Especializado en catálogo de maquinaria y atención por WhatsApp; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 mil millones | 32.768 tokens | apache-2.0 | HuggingFace, safetensors y GGUF | Modelo base sin ajuste de dominio; cobertura multilingüe amplia y propósito general |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2 mil millones | 128.000 tokens | Licencia comunitaria de Llama | HuggingFace, safetensors y GGUF | Alternativa de tamaño similar con contexto mayor, pero licencia con restricciones de uso |
| Qwen/Qwen2.5-3B-Instruct | ~3 mil millones | 32.768 tokens | apache-2.0 | HuggingFace, safetensors y GGUF | Misma familia y licencia, con más capacidad de razonamiento a cambio de más VRAM |

No se dispone de métricas comparativas de calidad entre estas opciones en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones publicadas: no es posible verificar la calidad de las respuestas ni compararla objetivamente con el modelo base.
- El modelo está ajustado para un único catálogo empresarial concreto; fuera de ese dominio (maquinaria de Mahadyuti Engineering Solution) su comportamiento esperado es degradado.
- Idiomas limitados a inglés y hindi: no hay soporte declarado de castellano ni de otras lenguas, por lo que no es adecuado para atención al cliente en español.
- Riesgo de alucinación en productos, precios o especificaciones cuando la consulta se aleja del catálogo visto durante el ajuste; el comportamiento anti-alucinación es una promesa del autor, no una garantía verificada.
- La lógica fiscal (recargo del 18 % de GST) está internalizada en los pesos y puede volverse obsoleta o incorrecta si cambia la normativa o las condiciones comerciales.
- Posible sobreajuste a los formatos de respuesta vistos en el SFT (estructura de cotización, referencias markdown a imágenes), con menor flexibilidad ante preguntas abiertas.
- Ausencia de soporte documentado de tool calling, function calling o razonamiento multi-paso, lo que limita su integración en agentes que necesiten consultar sistemas externos.
- Riesgo de fuga de información: al estar ajustado sobre datos de una empresa concreta, podría reproducir precios, condiciones o contenido interno si el dataset de entrenamiento los incluía; conviene auditar antes de exponerlo públicamente.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el despliegue en producción es responsabilidad del integrador.
- Estado del repositorio: cero descargas y cero valoraciones, sin historial de uso que respalde su robustez en producción.
- El ejemplo de la model card recomienda decodificación greedy (`do_sample=False`) para respuestas deterministas; con muestreo activado, la consistencia de precios y referencias puede resentirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samarthruckstar/qwen-whatsapp-agent
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado en la busqueda web enlaces relevantes al modelo, papers, blogs, repositorios o demos asociados; los resultados devueltos no guardan relacion con la ficha.
