# mradermacher/EliasAI-Micro-GGUF

## Resumen

EliasAI-Micro-GGUF es la versión cuantizada en formato GGUF del modelo EliasAI-Micro-v1.0, desarrollado por ETME-TECH y distribuida por el cuantizador mradermacher. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B-Base, orientado a conversación en alemán. Con aproximadamente 1.006 millones de parámetros (unos 1.000 millones), es un modelo compacto pensado para despliegue en entornos con recursos limitados.

El modelo resuelve el problema de disponer de un asistente conversacional en alemán que pueda ejecutarse en hardware modesto, incluyendo CPU y GPUs de consumo. Al estar publicado en formato GGUF con múltiples niveles de cuantización (desde Q2_K de 0,6 GB hasta f16 de 2,1 GB), es compatible con motores de inferencia como llama.cpp y Ollama, lo que facilita su integración en aplicaciones locales.

Su relevancia actual radica en la combinación de un tamaño muy reducido, licencia Apache 2.0 permisiva para uso comercial y una batería completa de cuantizaciones listas para descargar. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, ya que la model card del cuantizador se limita a describir los ficheros GGUF generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B-Base; detalles no disponibles) |
| Parametros totales | 1.006.672.704 (~1,0 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint Qwen/Qwen3.5-0.8B-Base, por lo que hereda la arquitectura transformer del modelo base de Qwen. No se dispone de información detallada sobre la arquitectura interna (número de capas, dimensiones de atención, tipo de atención o uso de componentes MoE) en la documentación proporcionada.

Tampoco se han publicado datos sobre el proceso de entrenamiento del finetune: número de tokens, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas específicas. La model card del repositorio GGUF se limita a documentar el proceso de cuantización (convert_type hf, quantize_version 2, output_tensor_quantised 1) y a listar los ficheros generados. El modelo está etiquetado como conversacional y orientado al alemán.

## Capacidades

- Generación de texto conversacional en alemán, según la etiqueta `conversational` del repositorio.
- Ajuste fino específico para diálogo (finetune de un modelo base).
- Compatibilidad con endpoints y motores de inferencia GGUF (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: únicamente se declara alemán; otros idiomas no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional local en alemán: el modelo puede ejecutarse en CPU o GPU de consumo mediante llama.cpp u Ollama, ofreciendo respuestas en alemán sin depender de servicios en la nube, gracias a su tamaño de ~1 B de parámetros.
- Despliegue en dispositivos con recursos limitados: con cuantizaciones de 0,6-0,9 GB (Q2_K a Q6_K), cabe en sistemas con poca memoria, como mini-PC, Raspberry Pi de gama alta o portátiles sin GPU dedicada.
- Prototipado rápido de chatbots: la licencia Apache 2.0 y el tamaño reducido permiten iterar sobre aplicaciones de chat en alemán sin costes de infraestructura elevados.
- Filtrado y clasificación de texto en alemán: puede emplearse para tareas ligeras de procesamiento de lenguaje natural en pipelines donde la latencia y el coste importan más que la precisión máxima.
- Educación e investigación: sirve como modelo de referencia para experimentar con cuantizaciones GGUF y comparar calidad entre niveles (Q2_K frente a Q8_0) en un modelo pequeño.
- Integración en aplicaciones de escritorio: al ser compatible con llama.cpp, puede embeberse en aplicaciones nativas que requieran generación de texto offline en alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,9 GB con cuantizaciones Q2_K a Q6_K; 1,2 GB con Q8_0; 2,1 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en GPUs de consumo como GTX 1050 Ti, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio indica compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EliasAI-Micro-GGUF | ~1,0 B | no disponible | Apache 2.0 | GGUF | Finetune conversacional en alemán |
| Qwen3.5-0.8B-Base | ~0,8 B | no disponible | no disponible | safetensors | Modelo base del que deriva |
| Alternativas de ~1 B en alemán | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El modelo está orientado exclusivamente al alemán según las etiquetas del repositorio; su rendimiento en castellano u otros idiomas no está documentado.
- Al ser un modelo de ~1 B de parámetros, su capacidad de razonamiento complejo, matemáticas y código es previsiblemente limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en tareas de conocimiento factual.
- No se han publicado datos sobre sesgos, evaluación de seguridad ni alineación del finetune.
- La información sobre el proceso de entrenamiento y la composición del dataset es inexistente, lo que dificulta evaluar riesgos de contaminación o sesgos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen subyacente.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción.
- No hay información sobre la longitud de contexto soportada, lo que impide garantizar conversaciones multi-turno largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EliasAI-Micro-GGUF
- Modelo base (finetune): https://huggingface.co/ETME-TECH/EliasAI-Micro-v1.0
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/EliasAI-Micro-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#EliasAI-Micro-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
