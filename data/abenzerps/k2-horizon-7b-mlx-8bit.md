# abenzerps/K2-Horizon-7B-MLX-8bit

## Resumen

K2-Horizon-7B-MLX-8bit es una conversión en formato MLX con cuantización afín de 8 bits del modelo original IFM/K2-Horizon-7B, desarrollado por IFM. Se trata de un modelo de lenguaje denso, exclusivamente de texto, diseñado para razonamiento, generación de código, trabajo con contexto largo y uso de herramientas. Su característica más destacada es una ventana de contexto nativa de 524.288 tokens (512K), lo que lo posiciona como una opción relevante para tareas que requieren procesar documentos extensos o conversaciones de múltiples turnos con historial amplio.

La conversión MLX, realizada por el usuario abenzerps, permite ejecutar el modelo en hardware Apple Silicon mediante la librería MLX-LM, manteniendo la arquitectura original con RMSNorm agrupada. El modelo base se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y modificación. Aunque el nombre indica 7B, los parámetros totales reales ascienden a 8.999.178.240 (aproximadamente 9 mil millones), un detalle relevante para estimar requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con RMSNorm agrupada |
| Parametros totales | 8.999.178.240 (aprox. 9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | Afín 8-bit, grupo de tamaño 64 (en esta conversión MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 2 shards) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only, sin mezcla de expertos (MoE). El modelo original IFM/K2-Horizon-7B emplea RMSNorm agrupada, una variante de normalización que agrupa canales para mejorar la eficiencia computacional. La conversión MLX conserva esta característica mediante un cargador personalizado (`model.py`) que requiere `--trust-remote-code` al usar MLX-LM.

No se dispone de información pública sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación. Tampoco se detallan innovaciones técnicas específicas más allá de la ventana de contexto de 512K, que sugiere el uso de mecanismos de atención eficiente o interpolación posicional, aunque no se confirma en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento: modelo denso de 9B parámetros con capacidad para tareas de razonamiento lógico y comprensión de lenguaje natural.
- Generación de código: diseñado para tareas de programación, aunque no se especifican benchmarks concretos.
- Contexto largo: soporta hasta 512K tokens, permitiendo procesar documentos extensos, libros completos o historiales de conversación muy largos.
- Uso de herramientas (tool use): el modelo base está orientado a integración con herramientas, aunque la conversión MLX no incluye archivos de visión ni MTP (multi-token prediction).
- Multilingüe: limitado al inglés según la model card; no se indica soporte para otros idiomas.
- Texto únicamente: no hay capacidades de visión ni audio.

## Casos de uso

- Análisis de documentos legales extensos: gracias a la ventana de 512K tokens, el modelo puede procesar contratos completos, sentencias o expedientes sin necesidad de dividirlos en fragmentos, manteniendo el contexto global para extraer cláusulas relevantes o resumir.
- Asistente de programación con repositorios grandes: puede recibir un código base completo (miles de líneas) y responder preguntas sobre arquitectura, detectar errores o sugerir refactorizaciones sin perder referencias a funciones definidas en archivos distantes.
- Atención al cliente con historial largo: en entornos de soporte, puede gestionar conversaciones de muchos turnos acumulando todo el historial del usuario, evitando pérdida de información previa y mejorando la coherencia de las respuestas.
- Investigación académica: procesamiento de papers completos, tesis o conjuntos de artículos científicos para generar resúmenes, identificar metodologías o comparar resultados entre secciones.
- Generación de documentación técnica: a partir de un código fuente extenso, el modelo puede redactar documentación detallada que haga referencia a funciones y módulos específicos distribuidos a lo largo del proyecto.
- Razonamiento multi-paso con herramientas: al soportar tool use, puede integrarse en agentes que necesiten consultar bases de datos, ejecutar código o llamar APIs, manteniendo un contexto amplio de las acciones previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen referenciada como "IFM/K2-Horizon-7B benchmark results", pero los valores numéricos no se proporcionan en el texto. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 8-bit y aproximadamente 9B parámetros, se estima un uso de memoria de unos 9-10 GB, más overhead de activaciones y caché KV. Para contexto largo (512K), la caché KV puede incrementar significativamente el consumo, por lo que se recomienda al menos 16 GB de VRAM para uso práctico con ventanas amplias.
- GPU recomendadas: en hardware Apple Silicon, la conversión MLX está optimizada para chips M1 Pro/Max, M2 Pro/Max y M3/M4 con memoria unificada de 16 GB o superior. En GPUs NVIDIA, el modelo original (no MLX) podría ejecutarse en RTX 3090/4090 (24 GB) o A100/H100 para contextos máximos.
- Compatibilidad con GPU consumer: sí, cabe en RTX 3090/4090 con cuantización 8-bit, aunque la ventana de 512K completa puede requerir más memoria de la disponible en estas tarjetas.
- Opciones de despliegue: MLX-LM (para Apple Silicon), vLLM, llama.cpp, Ollama o TGI para el modelo original en formato GGUF o safetensors estándar. Esta conversión específica está pensada para MLX-LM.
- Latencia y throughput: no se dispone de datos medidos. En MLX, el rendimiento depende del chip; en Apple M2 Max se pueden esperar decenas de tokens por segundo para modelos de 9B en 8-bit, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para K2-Horizon-7B, por lo que no es posible realizar una comparación cuantitativa fiable. Como referencia cualitativa, se pueden considerar modelos densos de tamaño similar con contexto largo:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| K2-Horizon-7B | ~9B | 512K | Apache-2.0 | Conversión MLX 8-bit disponible |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 | Ampliamente usado, contexto menor |
| Mistral-7B | 7B | 32K | Apache-2.0 | Contexto limitado, sin tool use nativo |
| Qwen2.5-7B | 7B | 128K | Apache-2.0 | Soporte multilingüe y tool calling |

La ventaja principal de K2-Horizon es su contexto de 512K, muy superior a los competidores directos, aunque su disponibilidad de benchmarks y ecosistema es menor.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre evaluación de sesgos; al ser un modelo entrenado principalmente en inglés, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto muy largo donde la atención puede degradarse.
- Limitaciones de idioma: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero se debe mantener el aviso de licencia y atribución. No hay restricciones conocidas adicionales.
- Caveats de producción: la conversión MLX requiere `--trust-remote-code` debido al cargador personalizado, lo que implica ejecutar código no verificado. Además, la ventana de 512K puede provocar un alto consumo de memoria en inferencia; se recomienda probar con contextos menores en entornos con recursos limitados.
- El modelo es solo texto; no incluye capacidades multimodales.

## Enlaces

- Modelo en HuggingFace (conversión MLX): https://huggingface.co/abenzerps/K2-Horizon-7B-MLX-8bit
- Modelo original: https://huggingface.co/IFM/K2-Horizon-7B
- Revisión fuente del modelo original: https://huggingface.co/IFM/K2-Horizon-7B/tree/2c9659a84c4eea6f9f60462221fe762c8c84d75c
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
