# sekkit/Qwen3.5-0.8B-MNN

## Resumen

El modelo sekkit/Qwen3.5-0.8B-MNN es una versión cuantizada a 4 bits del modelo Qwen3.5-0.8B, exportada al formato MNN mediante la herramienta llmexport del proyecto Alibaba MNN. El modelo original Qwen3.5-0.8B es el miembro más pequeño de la familia Qwen3.5, con una arquitectura híbrida de gated delta networks y una ventana de contexto de 262 000 tokens, diseñado para despliegue en dispositivos con recursos limitados. Esta cuantización reduce el tamaño del modelo a aproximadamente 0.5 GB, lo que permite ejecutarlo en entornos de inferencia ligera, como teléfonos móviles o dispositivos edge, utilizando el runtime de MNN.

La cuantización se realiza directamente sobre los pesos del modelo original sin reentrenamiento, por lo que conserva las capacidades de generación de texto y chat del Qwen3.5-0.8B, aunque con posibles pérdidas menores de precisión inherentes a la cuantización de 4 bits. El modelo está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su principal interés reside en la optimización para despliegue en plataformas de bajo consumo, especialmente en ecosistemas que ya utilizan MNN.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid gated delta networks (del modelo base Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 262 000 tokens (modelo base; no especificado para la versión MNN) |
| Tipos de cuantizacion | 4 bits (cuantización entera) |
| Idiomas soportados | en (según model card; el modelo base Qwen3.5 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (formato propio de Alibaba MNN) |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-0.8B utiliza una arquitectura híbrida de gated delta networks, que combina mecanismos de atención lineal y recurrencia para mejorar la eficiencia computacional en contextos largos. El modelo MNN es una exportación directa de este modelo base, cuantizada a 4 bits mediante la herramienta `llmexport` del proyecto MNN. No se ha realizado ningún entrenamiento adicional ni ajuste fino sobre la versión cuantizada; simplemente se convierte el modelo original a un formato optimizado para inferencia en dispositivos de baja potencia.

El proceso de cuantización emplea técnicas de cuantización post-entrenamiento, típicamente con calibración, aunque no se detallan los métodos exactos en la documentación disponible. El resultado es un modelo con el mismo número de parámetros (0,8B) pero con un tamaño de archivo reducido a 0,5 GB, lo que facilita su almacenamiento y carga en memoria limitada.

## Capacidades
- Generación de texto y chat: el modelo base es capaz de mantener conversaciones multi-turno y generar respuestas coherentes en inglés.
- Razonamiento e instrucciones: el modelo base Qwen3.5 mejora el razonamiento y el seguimiento de instrucciones respecto a Qwen3, aunque no se han validado específicamente estas capacidades en la versión cuantizada.
- Soporte de contexto largo: la arquitectura base admite hasta 262 144 tokens, aunque la versión MNN podría tener limitaciones de memoria en dispositivos con poca RAM.
- No se dispone de información sobre soporte de tool calling, agentes o capacidades multimodales en esta versión concreta.

## Casos de uso
- Inferencia en dispositivos móviles: el modelo MNN está diseñado para ejecutarse eficientemente en smartphones y tablets mediante el runtime de MNN, permitiendo asistentes de texto locales sin conexión.
- Despliegue en dispositivos IoT: su pequeño tamaño (0,5 GB) y bajo consumo de memoria lo hacen apto para sistemas embebidos con recursos limitados, como routers o cámaras inteligentes.
- Modelo draft para decodificación especulativa: el modelo base Qwen3.5-0.8B se recomienda como modelo auxiliar para acelerar la generación de modelos más grandes de la misma familia; la versión cuantizada MNN puede servir como draft en entornos con restricciones de memoria.
- Aplicaciones de chat en tiempo real: en servidores con GPU de baja capacidad, se puede usar para atender consultas de texto en inglés sin necesidad de hardware de alto rendimiento.
- Prototipado y experimentación: para desarrolladores que quieran probar la arquitectura Qwen3.5 en un entorno MNN sin necesidad de una GPU dedicada.
- Procesamiento de texto en lote: en entornos con CPU únicamente, el modelo puede procesar textos cortos con latencia aceptable gracias a la cuantización 4-bit.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks específicos para la versión cuantizada MNN en la información disponible. El modelo base Qwen3.5-0.8B tiene benchmarks publicados en la documentación oficial de Qwen, pero no se dispone de ellos en la información proporcionada. Por tanto, no se presentan datos numéricos comparativos.

## Requisitos de hardware
- VRAM estimada: aproximadamente 2 GB para inferencia en GPU, según estimaciones de terceros (free2aitools).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una GTX 1650 o superior; también funciona en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama baja como la RTX 3050 o incluso en chips integrados.
- Opciones de despliegue: el modelo está diseñado para MNN, por lo que se ejecuta mediante `llm_demo` de MNN; no se ha adaptado a vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones concretas; en CPU puede ser lento para contextos largos, pero en GPU con 2 GB debería alcanzar velocidades aceptables para uso interactivo.

## Comparativa con modelos similares
No se dispone de datos de comparación directa con otros modelos cuantizados similares. El modelo base Qwen3.5-0.8B es comparable a otros modelos de 0.8B como SmolLM2-0.8B o TinyLlama-1.1B, pero no se han realizado comparativas en esta información. La versión MNN es específica del ecosistema MNN, por lo que su comparación con formatos GGUF o safetensors no es directa.

## Limitaciones y advertencias
- Cuantización de 4 bits puede degradar la calidad de la salida en tareas de razonamiento complejo o generación de código, en comparación con el modelo original de 8 bits o FP16.
- Idioma limitado: la model card indica solo inglés; aunque el modelo base es multilingüe, la versión MNN no garantiza soporte para otros idiomas.
- Falta de documentación sobre sesgos: no se ha evaluado específicamente el modelo cuantizado para sesgos o alucinaciones.
- Dependencia de MNN: el modelo solo funciona con el runtime de MNN, lo que limita su integración con frameworks de inferencia estándar como Hugging Face Transformers o vLLM.
- No se dispone de datos sobre la degradación exacta en benchmarks; es recomendable validar el rendimiento en el caso de uso específico antes de producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sekkit/Qwen3.5-0.8B-MNN
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Página de Qualcomm AI Hub sobre Qwen3.5-0.8B: https://aihub.qualcomm.com/models/qwen3_5_0_8b
