# chaoliangUNSW/Jev-Style-2B-Decision-v4

## Resumen

Jev-Style-2B-Decision-v4 es un modelo de decisión y clasificación desarrollado por Chaoliang Yan (chaoliangUNSW), construido como un fine-tuning de Qwen/Qwen3.5-2B. No es un modelo generativo de propósito general: su función es recibir un estado (texto, JSON o imagen) junto con preguntas tipadas de opción fija y devolver, en una sola pasada, una probabilidad calibrada para cada opción. Está pensado para routing de LLM, guardrails, clasificación de tickets y decisiones sí/no sobre capturas de pantalla o recibos.

El modelo tiene 2.213.241.664 parámetros (2,21B) e incorpora la torre de visión del Qwen3.5-2B base, por lo que acepta entradas multimodales imagen-texto en su build de PyTorch. Soporta hasta 32.768 tokens de contexto por llamada, frente a los 25.600 de la versión v3. Se distribuye con licencia Apache-2.0 y pesos abiertos en safetensors, con builds alternativos en GGUF y MLX limitados a texto.

Su relevancia actual radica en que ofrece decisiones calibradas y deterministas en local, sin depender de una API hospedada, con una latencia mediana de 16 ms en una A100 en bfloat16. El entrenamiento de la v4 incorporó etiquetas suaves destiladas de TypeSafe Jev 1.14 a través de su API pública, según declara el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B + torre de visión), fine-tuning para decisión |
| Parámetros totales | 2.213.241.664 (2,21B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por llamada |
| Tipos de cuantización | No disponible (builds GGUF y MLX disponibles para texto; cuantizaciones concretas no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 4,4 GB); builds GGUF y MLX para texto |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso con torre de visión integrada, y se ajusta mediante fine-tuning supervisado para una tarea concreta: puntuar opciones de respuesta a preguntas tipadas dado un estado de entrada. La salida no es texto libre sino un vector de probabilidades calibradas por pregunta, lo que lo convierte en un clasificador estructurado más que en un generador. El pipeline declarado en Hugging Face es text-classification, con la librería propia jev-style.

El entrenamiento de la v4 incluyó etiquetas suaves destiladas del modelo TypeSafe Jev 1.14 a través de su API pública. El autor indica que el paquete de Python no incluye los datasets crudos de respuestas del profesor, aunque confirma el uso de salidas del profesor en el entrenamiento. El dataset de entrenamiento está referenciado como chaoliangUNSW/jev-style-2b-v4-training. No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación y decisión de opción fija con probabilidades calibradas por opción en una sola pasada.
- Entrada multimodal: texto, JSON e imágenes en el build de PyTorch (la torre de visión del modelo base está activa).
- Routing de LLM: selección de modelo o proveedor adecuado para una consulta dada.
- Guardrails: evaluación de si una petición cumple o no una política definida.
- Decisiones sí/no sobre recibos, capturas de pantalla y documentos visuales.
- Soporte de contexto largo de hasta 32.768 tokens por llamada.
- Ejecución local sin clave de API ni simulación mediante agente.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes generativos.

## Casos de uso

- Routing de peticiones entre modelos: dado el texto de una consulta, el modelo devuelve la probabilidad de que corresponda a cada modelo o proveedor disponible, permitiendo enrutar en una sola inferencia de 16 ms.
- Clasificación de tickets de soporte: el ejemplo oficial asigna un ticket a los equipos de facturación, técnico o ventas con probabilidades por clase, útil para triaje automático en mesas de ayuda.
- Guardrails de contenido: evaluar si una entrada cumple una política concreta y devolver una probabilidad calibrada que permita fijar umbrales de bloqueo.
- Verificación de recibos y capturas: decidir sí/no sobre imágenes de recibos o pantallas, por ejemplo para validar un justificante de pago o detectar un importe duplicado.
- Moderación y filtrado previo: clasificar mensajes entrantes antes de pasarlos a un LLM generativo, reduciendo coste y latencia del pipeline.
- Enrutamiento en aplicaciones de atención al cliente: decidir la intención o el departamento de un mensaje multi-turno aprovechando el contexto de 32.768 tokens.
- Despliegue en local o edge: ejecución en CPU, Apple MPS o CUDA sin dependencia de servicios externos, adecuada para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

| Benchmark | Jev-Style 2B v4 | Jev-Style 2B v3 |
|---|---:|---:|
| Decision Index 0.3, índice público | 44,37 | 34,05 |
| Decision Index 0.3, puntuación completa (tests privados) | 34,53 | reemplazado por v4 |
| Decision Index Vision, índice público | 57,55 | sin entrada de imagen |
| Decision Index Vision, puntuación completa | 51,94 | sin entrada de imagen |
| JevBench v1.4.1, ítems públicos (231) | 74,9% | 73,6% |

Latencia mediana de 16 ms con una petición simultánea en A100, bfloat16 y CUDA graphs. Los protocolos se detallan en la sección Results de la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 2,21B parámetros, en bfloat16 los pesos ocupan aproximadamente 4,4 GB, por lo que la inferencia requiere en torno a 6-8 GB de VRAM con overhead de activaciones y contexto.
- GPU recomendadas: A100 para la latencia de referencia (16 ms); H100 y RTX 4090 como alternativas compatibles con CUDA.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 y GPUs con 8 GB o más en bfloat16 o cuantización; no se especifican requisitos mínimos oficiales.
- Opciones de despliegue: paquete `jev-style[torch]` con `jev-style serve --release 2b --backend torch` (CPU, Apple MPS o CUDA); builds GGUF para llama.cpp y MLX para Apple silicon, ambos solo texto.
- Throughput: no disponible; solo se publica latencia mediana de 16 ms por petición en A100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada | Licencia | Enfoque |
|---|---:|---:|---|---|---|
| Jev-Style 2B v4 | 2,21B | 32.768 | Texto, JSON, imagen | Apache-2.0 | Decisión calibrada de opción fija |
| Jev-Style 2B v3 | 2B | 25.600 | Texto, JSON | Apache-2.0 | Decisión calibrada de opción fija |
| Jev-Style 0.8B v3 | 0,8B | No disponible | Texto, JSON | Apache-2.0 | Decisión calibrada de opción fija |
| Qwen3.5-2B (base) | 2B | No disponible | Texto, imagen | No disponible | Modelo generativo multimodal |

No se dispone de comparación con clasificadores dedicados de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión y clasificación: no está diseñado para generación de texto libre ni para razonamiento multi-paso.
- Las probabilidades son calibradas, pero la calibración depende del dominio; conviene validar los umbrales con datos propios antes de producción.
- Riesgo de sesgo heredado del modelo base Qwen3.5-2B y de las etiquetas del profesor TypeSafe Jev 1.14; no se documentan análisis de sesgo.
- Idiomas soportados no declarados; el rendimiento fuera del inglés no está verificado.
- La entrada de imagen solo está disponible en el build de PyTorch; los builds GGUF y MLX aceptan únicamente texto o JSON.
- El autor declara independencia de TypeSafe, sin afiliación ni respaldo; el uso de salidas del profesor en el entrenamiento está confirmado.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrecen garantías ni SLA.
- La API hospedada sirve solo texto y comparte capacidad; los límites de cuota son de uso razonable sin cuota fija publicada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4)
- [Demo en Spaces](https://huggingface.co/spaces/chaoliangUNSW/jev-style-2b)
- [Sitio web del proyecto](https://jevstyle.com/models/2b-v4/)
- [Repositorio GitHub](https://github.com/lawrence3699/jev-style)
- [Colección de builds v4](https://huggingface.co/collections/chaoliangUNSW/jev-style-decision-v4-2b)
- [Build GGUF (solo texto)](https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4-GGUF)
- [Build MLX (solo texto)](https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4-MLX)
- [Guía de instalación local](https://jevstyle.com/guides/run-locally/)
- [Guía de clasificación de texto en Python](https://jevstyle.com/guides/local-text-classification/)
- [Guía de routing local y Apple silicon](https://jevstyle.com/guides/local-decision-models/)
- [Casos de uso con visión local](https://jevstyle.com/use-cases/local-vision-decisions/)
- [Benchmark de routing bancario](https://jevstyle.com/benchmarks/banking-routing/)
- [Política de cuotas de la API](https://jevstyle.com/api/limits.html#quota-policy)
- [Estado del servicio](https://api.jevstyle.com/healthz)
- [Decision Index board](https://huggingface.co/spaces/multimodalart/jev-decision-index)
- [Dataset de entrenamiento](https://huggingface.co/datasets/chaoliangUNSW/jev-style-2b-v4-training)
