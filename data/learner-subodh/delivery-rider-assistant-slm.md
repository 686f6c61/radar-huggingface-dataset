# learner-subodh/Delivery-Rider-Assistant-SLM

## Resumen

Delivery-Rider-Assistant-SLM es un modelo de lenguaje pequeno (SLM) de aproximadamente 30 millones de parametros, entrenado desde cero por el usuario learner-subodh. Su proposito es servir como asistente offline para repartidores y conductores de plataformas de logistica y reparto a domicilio (se citan ejemplos como Swiggy, Zomato o Porter), resolviendo consultas operativas como cambios de direccion, estado de pagos, gestion de contra reembolso (COD) e incidencias con pedidos en escenarios de conectividad deficiente.

Tecnicamente es un transformer causal decoder-only de estilo nanoGPT con atencion flash, 6 capas, 8 cabezas de atencion y dimension de embedding de 384. Su ventana de contexto es de solo 256 tokens y utiliza un tokenizador BPE basado en la codificacion de GPT-2 mediante tiktoken. El modelo se entreno en una unica GPU NVIDIA Tesla T4 (nivel gratuito de Google Colab) durante aproximadamente 23 minutos, con precision mixta float16 y el optimizador AdamW.

Su relevancia es limitada y muy acotada: se trata de un experimento de entrenamiento de bajo coste orientado a despliegue en el borde (edge AI), no de un modelo de proposito general. El repositorio ocupa 0,1 GB, no registra descargas ni interacciones, y su utilidad practica esta restringida a prototipos y demostraciones de asistentes de dominio muy especifico en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (estilo nanoGPT, flash attention) |
| Parametros totales | ~30,0 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.bin`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

Otros datos tecnicos: 6 capas, 8 cabezas de atencion, dimension de embedding 384, tokenizador BPE (codificacion GPT-2 via tiktoken), tamano del repositorio 0,1 GB.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal decoder-only inspirada en nanoGPT, con atencion flash y 6 capas de 8 cabezas. Con 384 dimensiones de embedding y unos 30 millones de parametros, se situa en el rango de los modelos tiny, disenados para inferencia en CPU o en dispositivos de baja potencia. El tokenizador es BPE con la codificacion de GPT-2 a traves de tiktoken, lo que limita el vocabulario a la cobertura del tokenizador original.

El entrenamiento se realizo en una sola GPU NVIDIA Tesla T4 del nivel gratuito de Google Colab durante aproximadamente 23 minutos, con precision mixta float16 (AMP) y optimizador AdamW (lr=6e-4, weight_decay=0.1, schedule coseno con warmup). La mejor perdida de validacion reportada es 0,7974. El corpus de entrenamiento es el dataset de instrucciones de atencion al cliente de Bitext. No se documenta el numero total de tokens vistos, la composicion detallada del dataset ni si hubo fases de RLHF o DPO; la informacion disponible sugiere un ajuste supervisado directo sobre instrucciones.

## Capacidades

- Generacion de texto en ingles orientada a conversaciones de atencion al cliente en el dominio del reparto.
- Resolucion de consultas operativas especificas: cambios de direccion tras la recogida del pedido, estado de pagos, gestion de contra reembolso (COD) e incidencias con pedidos.
- Ejecucion offline en dispositivos de baja potencia, pensada para zonas con mala conectividad.
- Formato de dialogo basado en etiquetas `<|user|>` y `<|assistant|>`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (solo ingles).
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Asistente offline para repartidores en zonas sin cobertura: el modelo puede desplegarse en el propio dispositivo movil y responder a consultas frecuentes sobre direcciones o estados de pedido sin conexion, gracias a su tamano de 30 M de parametros.
- Gestion de cambios de direccion tras la recogida: el modelo esta entrenado explicitamente para este flujo (aparece en el ejemplo de la model card) y puede generar respuestas guia sobre el procedimiento a seguir.
- Consultas sobre estado de pagos y liquidaciones: puede ofrecer respuestas predefinidas sobre cuando y como se abonan los pagos a repartidores, adecuado por su entrenamiento en el dataset de atencion al cliente de Bitext.
- Soporte en la gestion de contra reembolso (COD): asistencia al repartidor sobre como proceder cuando el cliente paga en efectivo o cuando hay incidencias con el importe.
- Prototipado rapido de asistentes de dominio: sirve como base para experimentar con fine-tuning sobre flujos logisticos concretos, dado su bajo coste de entrenamiento (23 minutos en una T4).
- Demostraciones de edge AI en entornos academicos o de investigacion: util para ilustrar el ciclo completo de entrenamiento desde cero de un SLM y su despliegue en el borde.
- Filtrado y clasificacion de incidencias de pedidos: puede emplearse para categorizar mensajes de repartidores en un flujo de triaje previo a la intervencion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la mejor perdida de validacion de 0,7974 durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (unos 120 MB de pesos para 30 M de parametros); en float16, aproximadamente 60 MB. Cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso CPU; el entrenamiento se realizo en una Tesla T4.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas e incluso en dispositivos moviles de gama media.
- Opciones de despliegue: al publicarse solo como `pytorch_model.bin` sin configuracion de `transformers`, es necesario recrear la clase GPT y GPTConfig del cuaderno de entrenamiento y cargar el `state_dict` manualmente con `torch.load`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Delivery-Rider-Assistant-SLM | ~30 M | 256 | MIT | Hugging Face (pesos PyTorch) | Entrenado desde cero, dominio logistico, solo ingles |
| GPT-2 small | 124 M | 1024 | MIT | Hugging Face | Modelo de proposito general, mas grande y con mayor contexto |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Hugging Face | Mucho mayor, proposito general, requiere mas recursos |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | Hugging Face | Alternativa pequena de proposito general con contexto amplio |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento con estos modelos.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (256 tokens), lo que impide mantener conversaciones multi-turno largas o procesar documentos extensos.
- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Entrenado sobre un unico dataset de atencion al cliente (Bitext), por lo que su conocimiento fuera de ese dominio es practicamente nulo y el riesgo de alucinacion en temas generales es alto.
- No se documentan evaluaciones de sesgo; al derivar de un dataset de atencion al cliente, puede reproducir sesgos presentes en el mismo.
- No incluye configuracion de `transformers` ni tokenizador empaquetado; la carga requiere recrear manualmente la arquitectura desde el cuaderno de entrenamiento, lo que dificulta su integracion en produccion.
- El rendimiento real no esta validado con benchmarks publicos; la perdida de validacion de 0,7974 no es directamente comparable con metricas estandar.
- Licencia MIT: permite uso comercial, pero al ser un experimento con cero descargas y sin mantenimiento documentado, no se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- El entrenamiento en el nivel gratuito de Colab durante 23 minutos sugiere un ajuste limitado; es esperable un sobreajuste al dataset de instrucciones y una capacidad de generalizacion reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner-subodh/Delivery-Rider-Assistant-SLM
- Dataset de entrenamiento (Bitext customer-support): no disponible enlace directo en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible
