# AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-6bit-MTP

## Resumen

AX-Qwen3.6-27B-MLX-AXQ-6bit-MTP es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.6-27B, desarrollado por AutomatosX mediante su técnica AXQuant (AXQ) de precisión mixta. Está específicamente diseñado para ejecutarse en Apple Silicon, aprovechando el framework MLX y el runtime AX Engine. El modelo mantiene la arquitectura densa original de Qwen3.6 (27.36B parámetros lógicos) e incorpora dos componentes adicionales: un cabezal de multi-token prediction (MTP) y un codificador de visión, ambos preservados en BF16 dentro del checkpoint o en sidecars opcionales.

La relevancia de este modelo radica en que ofrece una cuantización certificada (Tier 1) con una calidad validada frente a la referencia BF16, y un modo de aceleración MTP certificado (Tier 2) para cargas de trabajo intensivas en decodificación, como generación de código agéntico o texto largo. Con una ventana de contexto configurable de hasta 262.144 tokens, está orientado a aplicaciones que requieren manejo de secuencias muy extensas en hardware de Apple.

El repositorio contiene exclusivamente pesos en formato safetensors de MLX (20.70 GB), sin versiones PyTorch ni GGUF. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Aunque la integración con MLX-LM es posible para inferencia básica de texto, el runtime completo con soporte MTP y visión requiere AX Engine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense), con MTP y vision |
| Parametros totales | 27.36B (logicos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262,144 tokens (maximo configurado; limites practicos segun memoria unificada) |
| Tipos de cuantizacion | Mixed-precision AXQ: base 4bit, con capas en 6bit y 8bit (plan 6bit nominal) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de 27.36B parámetros, con arquitectura `Qwen3_5ForConditionalGeneration`. Esta variante cuantizada de AutomatosX aplica AXQuant, un esquema de precisión mixta que asigna diferentes niveles de cuantización (4bit, 6bit, 8bit) a distintos tensores según su sensibilidad, manteniendo protegidos los tensores críticos en mayor precisión. El checkpoint resultante tiene un BPW (bits por peso) medido de 5.8058 para el modelo principal y 5.9617 incluyendo el cabezal MTP, dentro del presupuesto de 6bit.

El entrenamiento original del modelo base no está documentado en la información proporcionada; solo se indica que la conversión a AXQ se realizó directamente desde los pesos BF16 de la revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. La innovación principal de este checkpoint es la certificación en dos niveles: Tier 1 garantiza calidad equivalente a la referencia y cero fallos de conversión; Tier 2 certifica una aceleración MTP de al menos 1.20x en decodificación para perfiles específicos (agent-coding y long-form general) cuando se usa AX Engine 6.14.0 bajo un contrato formal.

El checkpoint incluye un cabezal MTP y un codificador de visión, ambos en BF16, que se cargan como sidecars opcionales. El runtime MLX-LM estándar ignora estos sidecars y solo ejecuta el backbone de texto.

## Capacidades

- Generacion de texto: el modelo es capaz de generar texto coherente y contextualizado, con soporte para conversaciones multi-turno.
- Razonamiento y codigo: al ser una variante de Qwen3.6, hereda capacidades de razonamiento y generacion de codigo, aunque no se especifican benchmarks concretos.
- Vision: incluye un codificador de vision en BF16, lo que permite procesar entradas multimodales (imagenes y texto) si se usa el runtime adecuado (AX Engine).
- Multi-token prediction (MTP): el cabezal MTP permite predecir varios tokens a la vez, acelerando la decodificacion en cargas intensivas (certificado Tier 2 para agent-coding y long-form general).
- Contexto largo: soporta hasta 262,144 tokens, adecuado para documentos extensos o historiales de conversacion largos.
- Tool calling y funciones de agente: no se menciona explicitamente en la documentacion, pero es probable que el modelo base lo soporte; no confirmado en esta informacion.

## Casos de uso

- Generacion de codigo en entornos agiles: el perfil "agent-coding" certificado para MTP indica que el modelo puede acelerar la generacion de codigo multi-archivo o la edicion de repositorios, donde la decodificacion secuencial es el cuello de botella. Con AX Engine, se logra un speedup de 1.258x en token-weighted y 1.112x en prompt-median.
- Redaccion de documentos largos: el perfil "long-form general" (1.233x/1.250x) es adecuado para generar informes, articulos o libros completos con contexto de hasta 262K tokens, manteniendo coherencia a lo largo de capitulos.
- Asistentes conversacionales con historial extenso: gracias a la ventana de contexto amplia, puede mantener conversaciones con multiples turnos y referencias a mensajes antiguos sin perder el hilo.
- Analisis de documentos con vision: al incluir un codificador de vision, puede procesar imagenes junto con texto, por ejemplo para extraer informacion de capturas de pantalla, diagramas o documentos escaneados (requiere AX Engine).
- Desarrollo de agentes autonomos: la combinacion de contexto largo y MTP permite que un agente ejecute multiples pasos de razonamiento y generacion de acciones sin reiniciar el contexto, mejorando la eficiencia en tareas de planificacion.
- Prototipado rapido en Apple Silicon: al estar optimizado para MLX, se puede ejecutar localmente en MacBooks con chip M-series, ideal para desarrollo y pruebas sin depender de GPUs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona certificaciones de calidad (Tier 1) y aceleracion (Tier 2), pero no incluye metricas estandar como MMLU, HumanEval o GSM8K. Los unicos datos numericos son los speedups de MTP para perfiles especificos (1.258x en agent-coding y 1.233x en long-form general), medidos en un MacBook Pro con chip M5.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 20.70 GB en safetensors; la inferencia requiere al menos esa cantidad de memoria unificada, mas overhead del runtime. Se recomienda un minimo de 24-32 GB de RAM unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M-series). La certificacion se realizo en un MacBook Pro con chip M5 (df-macbookpro-m5). Modelos con menos de 24 GB de memoria unificada (como M1/M2 base) no podran cargar el modelo completo.
- Si cabe en consumer GPU: no, porque el formato es MLX y esta disenado para Apple Silicon, no para GPUs NVIDIA/AMD.
- Opciones de despliegue: MLX-LM para inferencia basica de texto (sin MTP ni vision); AX Engine para el runtime completo con soporte de sidecars y aceleracion MTP. No hay soporte para vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no hay datos publicos de latencia o tokens/segundo, solo los speedups relativos del MTP.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos cuantizados de la misma categoria. Como referencia, se puede comparar con el modelo base Qwen3.6-27B en BF16, que requiere aproximadamente 54 GB de memoria (sin cuantizar), mientras que esta version AXQ reduce el peso a 20.70 GB. Otras alternativas cuantizadas para Apple Silicon podrian incluir versiones GGUF de Qwen3.6 ejecutadas con llama.cpp, pero no se dispone de datos de rendimiento o calidad para establecer una comparacion objetiva.

## Limitaciones y advertencias

- El runtime MLX-LM estandar no soporta el modo MTP ni la vision; para aprovechar estas capacidades es imprescindible usar AX Engine 6.14.0 o superior, que es un software propietario de AutomatosX (aunque el codigo de AXQuant es open source en GitHub).
- La aceleracion MTP Tier 2 esta certificada solo para perfiles especificos (agent-coding y long-form general) bajo un contrato formal; no se garantiza en otros casos, y el producto por defecto usa fallback directo (sin MTP).
- Al ser una cuantizacion mixta, puede haber una ligera degradacion de calidad respecto al modelo BF16 original, aunque la certificacion Tier 1 asegura que la calidad es equivalente en pruebas de referencia.
- La ventana de contexto de 262K tokens es el maximo configurado, pero en la practica depende de la memoria unificada disponible; con 24 GB solo se podran usar ventanas mucho menores.
- No se especifican los idiomas soportados; se asume que hereda los del modelo base Qwen3.6, pero no hay confirmacion en la documentacion.
- El repositorio no incluye pesos PyTorch ni GGUF, lo que limita su uso fuera del ecosistema MLX/Apple.
- La licencia Apache 2.0 permite uso comercial, pero el uso de AX Engine puede estar sujeto a terminos adicionales del proveedor.

## Enlaces

- [HuggingFace - AX-Qwen3.6-27B-MLX-AXQ-6bit-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-6bit-MTP)
- [Modelo base Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B/tree/6a9e13bd6fc8f0983b9b99948120bc37f49c13e9)
- [Certificado Tier 1 (calidad y conversion)](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-27b-axq6-tier1.md)
- [Certificado Tier 2 (aceleracion MTP)](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-27b-axq6-tier2.md)
- [Repositorio AXQuant](https://github.com/defai-digital/axquant)
- [Sibling 4bit](https://huggingface.co/AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-4bit-MTP)
- [Catalogo de modelos AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
