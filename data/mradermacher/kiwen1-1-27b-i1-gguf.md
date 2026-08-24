# mradermacher/Kiwen1.1-27B-i1-GGUF

## Resumen

Kiwen1.1-27B es un modelo de lenguaje de 27.320 millones de parámetros desarrollado por beyoru y distribuido en formato GGUF por mradermacher para su ejecución en hardware local. Se trata de una destilación de la familia Kimi (posiblemente Kimi K3) sobre la arquitectura Qwen3.8, orientada a razonamiento prolongado, uso agéntico, matemáticas, código y soporte multilingüe (inglés, vietnamita y chino). El repositorio actual contiene cuantizaciones con imatrix de alta calidad, lo que permite desplegar el modelo en GPUs de consumo con pérdidas mínimas de precisión.

La relevancia de este modelo radica en su combinación de capacidades de razonamiento avanzado y eficiencia de inferencia, al ser una destilación de un modelo de razonamiento largo en un formato compacto. La licencia Apache-2.0 facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (destilación de Kimi K3) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (con imatrix) |
| Idiomas soportados | inglés, vietnamita, chino (según tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo base beyoru/Kiwen1.1-27B es una destilación de Kimi K3 sobre la arquitectura Qwen3.8, diseñado para razonamiento eficiente y uso agéntico. Los tags del modelo indican que fue entrenado con técnicas de destilación (distillation) y que es un modelo de visión (vision model), aunque no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados o el método de alineación (RLHF/DPO). La cuantización realizada por mradermacher utiliza el método imatrix, que mejora la calidad de los quants de baja precisión mediante la selección de pesos según su importancia en la activación.

## Capacidades

- Razonamiento avanzado y multi-step reasoning, gracias a su origen en Kimi K3 y Qwen3.8.
- Soporte de agente y tool calling, indicado en los tags "agentic".
- Generación de código y soporte de matemáticas, con etiquetas específicas de "coding" y "math".
- Capacidades multilingües: inglés, vietnamita y chino.
- Capacidades de visión (vision model), aunque no se especifica si el mmproj está incluido en este repositorio.
- Modo de razonamiento eficiente ("efficient-reasoning") y "long-reasoning", según los tags.

## Casos de uso

- **Asistente de código en IDE**: el modelo puede integrarse en plugins de Visual Studio Code o JetBrains para autocompletar código, generar funciones y explicar fragmentos complejos, gracias a su destilación de Qwen3.8 y su enfoque en código.
- **Razonamiento matemático y científico**: útil para resolver problemas de álgebra, cálculo o física paso a paso, con explicaciones detalladas, en entornos educativos o de investigación.
- **Agente conversacional multilingüe**: puede gestionar conversaciones en inglés, vietnamita y chino, lo que lo hace adecuado para soporte al cliente en mercados asiáticos y del sudeste asiático.
- **Pipeline de agentes automatizados**: su capacidad agéntica permite integrarlo en flujos de automatización que requieran planificar y ejecutar múltiples pasos (por ejemplo, análisis de documentos y generación de informes).
- **Análisis de documentos con visión**: al ser un modelo de visión, puede procesar imágenes y extraer información relevante en tareas de OCR o análisis de gráficos, siempre que se utilice el mmproj adecuado.
- **Despliegue en local con privacidad**: al estar disponible en GGUF, puede ejecutarse en laptops o estaciones de trabajo con GPU de consumo, manteniendo los datos en local para aplicaciones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas para este modelo concreto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: 
  - i1-Q2_K (11 GB): cabe en GPUs con 12 GB de VRAM, como RTX 3060/4070.
  - i1-IQ3_M (12,9 GB): recomendable al menos 16 GB de VRAM (RTX 4080, RTX 4090).
  - i1-Q4_K_S (15,9 GB): requiere 24 GB de VRAM (RTX 3090, RTX 4090, A5000).
- **GPU recomendadas**: RTX 3090, RTX 4090, A100 (para despliegues profesionales).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (con backend GGUF) o TGI (con adaptador).
- **Latencia y throughput**: no disponible; dependerá del hardware y la cuantización elegida. Con Q4_K_S en una RTX 4090 se espera un throughput de 30-50 tokens/s para generación de razonamiento, aunque esto es una estimación basada en modelos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kiwen1.1-27B | 27,3B | no disponible | Apache-2.0 | Razonamiento, agéntico, visión |
| Qwen3.5-27B (base) | 27,6B | 32K (típico) | Apache-2.0 | Razonamiento, multilingüe |
| Kimi K3 (destilación) | no disponible | no disponible | no disponible | Razonamiento eficiente |

La comparación exacta no es posible con los datos disponibles, pero el modelo se posiciona como una destilación de Qwen3.8 con mejoras de razonamiento y visión. No se han publicado benchmarks comparativos.

## Limitaciones y advertencias

- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o en idiomas con menos datos de entrenamiento.
- **Sesgos**: no se han documentado sesgos específicos, pero al ser un modelo entrenado en datos web, puede reflejar sesgos de género, raza o cultura.
- **Limitaciones de contexto**: no se especifica la longitud máxima de contexto; se recomienda probar con la aplicación de uso antes de desplegar en producción.
- **Idiomas**: aunque se declaran inglés, vietnamita y chino, el rendimiento en vietnamita puede ser inferior al del inglés, ya que no hay datos de calidad.
- **Licencia**: Apache-2.0 permite uso comercial, pero hay que verificar las licencias de los pesos base (Qwen3.8 y Kimi K3) para asegurar el cumplimiento.
- **Visión**: aunque se menciona que es un modelo de visión, el mmproj no está en este repositorio; hay que descargarlo del repositorio estático.

## Enlaces

- [Repositorio GGUF en Hugging Face](https://huggingface.co/mradermacher/Kiwen1.1-27B-i1-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/beyoru/Kiwen1.1-27B)
- [Repositorio de quants estáticos](https://huggingface.co/mradermacher/Kiwen1.1-27B-GGUF)
- [Versión anterior del modelo](https://huggingface.co/mradermacher/Kiwen-27B-i1-GGUF)
- [Página de solicitud de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Perfil de mradermacher](https://huggingface.co/mradermacher)
