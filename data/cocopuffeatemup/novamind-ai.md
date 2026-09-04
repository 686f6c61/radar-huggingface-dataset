# cocopuffeatemup/novamind-ai

## Resumen

NovaMind AI es un proyecto desarrollado por el usuario `cocopuffeatemup` que incluye un modelo Transformer entrenado desde cero como parte de una aplicación full-stack. El modelo, denominado NovaMind Custom Model, es un decoder-only Transformer de aproximadamente 1,1 millones de parámetros, con atención GQA y posiciones rotatorias RoPE, y un tokenizer BPE a nivel de byte. Su propósito principal es demostrar el bucle completo de entrenamiento, guardado y servido de un modelo desde una interfaz web, sin necesidad de infraestructura GPU.

La relevancia actual del proyecto radica en su carácter educativo y de prototipado rápido: permite a desarrolladores e investigadores experimentar con arquitecturas Transformer modernas en un entorno local y ejecutable en CPU. El modelo se sirve a través de un motor FastAPI y se integra en una interfaz de chat multi-proveedor que admite Ollama, APIs OpenAI-compatibles y el propio modelo local. No se especifica la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y RoPE |
| Parametros totales | ~1,1 millones (1.1M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only construido desde cero, con 4 capas y una dimensión de modelo de 128. Incorpora atención GQA (Grouped Query Attention) y posiciones rotatorias RoPE (Rotary Positional Embeddings), dos técnicas modernas que se aplican habitualmente en modelos de mayor escala. El tokenizer es un BPE a nivel de byte que se genera y guarda junto al modelo en el directorio `data/tokenizer/`.

El entrenamiento se realiza sobre un corpus de muestra local ubicado en `data/raw/`, y puede ejecutarse completamente en CPU. La aplicación incluye un panel de entrenamiento que permite iniciar, reanudar y monitorizar el proceso, mostrando curvas de pérdida y ejemplos de texto generado en tiempo real. No se especifica el número de tokens de entrenamiento ni la composición del dataset. No se menciona el uso de RLHF ni DPO. La innovación técnica destacable es la implementación de un pipeline completo de entrenamiento y servido en un paquete ligero, con checkpoints guardados en formato PyTorch.

## Capacidades

- Generación de texto simple a partir del corpus de entrenamiento, con calidad limitada por el tamaño del modelo.
- Entrenamiento incremental desde la interfaz web, con reanudación y retención de checkpoints.
- Tokenizer BPE propio a nivel de byte, integrado con el modelo.
- La aplicación NovaMind AI permite chat multi-proveedor, incluyendo el modelo local, NovaMind Cloud, Ollama y APIs OpenAI-compatibles.
- Capacidad de procesar documentos TXT, MD, JSON, CSV y PDF con citas a fragmentos exactos, aunque esta funcionalidad corresponde a la plataforma, no al modelo en sí.
- No soporta tool calling, visión, audio ni razonamiento complejo por parte del modelo local.

## Casos de uso

- Demostración educativa: el modelo es lo suficientemente pequeño para ejecutarse en CPU y permite explicar el funcionamiento de un Transformer desde cero, incluyendo GQA y RoPE.
- Prototipado de pipelines de entrenamiento: sirve para probar el flujo de entrenar, guardar checkpoints y servir el modelo sin necesidad de GPUs ni servicios externos.
- Experimentación con arquitecturas: al ser un modelo from-scratch con técnicas modernas, es útil para estudiar el efecto de GQA y RoPE en modelos mínimos.
- Integración en aplicaciones de chat locales: la aplicación completa puede desplegarse en Docker para ofrecer un asistente con múltiples proveedores, usando el modelo local para generación básica.
- Investigación en interpretabilidad: por su tamaño reducido, permite analizar activaciones y capas con herramientas de interpretabilidad sin requerir hardware especializado.
- Pruebas de despliegue en Hugging Face Spaces: el repo está preparado para duplicarse en un Space Docker, facilitando la validación del despliegue de un modelo con su interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; puede ejecutarse en CPU.
- GPU recomendada: ninguna, el entrenamiento e inferencia funcionan en CPU.
- Cabe en cualquier consumer GPU, aunque no es necesario usar GPU.
- Opciones de despliegue: Docker (imagen incluida), FastAPI mediante uvicorn, Hugging Face Spaces (Docker Space).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El modelo es un proyecto de demostración de 1,1 millones de parámetros, sin datos de rendimiento publicados, por lo que no es comparable con modelos de producción ni con otros modelos educativos de los que se tengan métricas.

## Limitaciones y advertencias

- Tamaño extremadamente pequeño (~1,1 millones de parámetros): la calidad de generación es muy limitada y produce texto simple.
- Sin evaluaciones de sesgos ni alucinaciones: no se ha realizado ningún estudio de estos aspectos.
- Licencia no disponible: no se puede determinar si el modelo o el código son aptos para uso comercial.
- Longitud de contexto no especificada: se desconoce el límite real de tokens de entrada.
- Solo genera texto: no soporta visión, audio, tool calling ni razonamiento complejo.
- No apto para producción: es un proyecto de demostración centrado en el ciclo de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/cocopuffeatemup/novamind-ai
- No se han encontrado papers, blogs o repositorios adicionales del autor en la búsqueda web.
