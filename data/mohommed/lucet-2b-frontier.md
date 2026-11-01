# mohommed/Lucet-2B-Frontier

## Resumen

Lucet-2B-Frontier es un modelo de generación de texto conversacional de 1,73 mil millones de parámetros, desarrollado por el usuario mohommed a partir del modelo base LiquidAI/LFM3-1.7B de Liquid AI. Se trata de un ajuste (fine-tune) que hereda la arquitectura Tri-Hybrid de la familia LFM3, que combina convoluciones cortas con compuerta, atención por ventana deslizante y atención global con GQA. El autor lo presenta como un modelo de razonamiento, código y tareas de sistemas, entrenado con una metodología propia denominada "Multi-Dimensional Smart Deep Training (MTA-SDT)".

Su rasgo más distintivo es la ventana de contexto extendida a 512K tokens (524.288) mediante una modificación del RoPE (rope_theta = 4.000.000), según la model card del autor. Además, incorpora un proceso de "descensura" mediante SVD dirigido sobre las proyecciones MLP, lo que elimina los comportamientos de rechazo del modelo base. Esta característica debe valorarse con cautela: implica que el modelo no aplicará filtros de seguridad, lo que supone riesgos evidentes en producción.

Es relevante porque combina un tamaño muy reducido (cabe en hardware de consumo) con un contexto extremadamente largo, algo poco habitual en modelos de menos de 2B de parámetros. El repositorio pesa 14,9 GB y ofrece pesos en safetensors y cuantizaciones GGUF calibradas con imatrix. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-Hybrid (LFM3): Gated Short Convolutions + Sliding Window Attention + Global GQA |
| Parametros totales | 1.728.801.536 (≈1,73B) |
| Parametros activos | no disponible (no se indica si es MoE; la arquitectura Tri-Hybrid sugiere modelo denso) |
| Longitud de contexto | 524.288 tokens (512K), según la model card del autor |
| Tipos de cuantizacion | GGUF calibrado con imatrix (detalle de niveles no disponible); pesos originales en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, que emplea la arquitectura Tri-Hybrid de Liquid AI: una mezcla de convoluciones cortas con compuerta (Gated Short Convolutions), atención con ventana deslizante (Sliding Window Attention) y atención global con consultas agrupadas (Global GQA). Este diseño híbrido reduce el coste computacional de la atención sobre secuencias largas, lo que hace plausible la ventana de 512K tokens declarada. La model card indica que la extensión de contexto se logra con RoPE nativo en hardware (rope_theta = 4.000.000) mediante "Fast ABF-RoPE", sin interpolación YaRN en CPU.

Sobre el entrenamiento, el autor describe una metodología propia llamada "Multi-Dimensional Smart Deep Training (MTA-SDT)", con "manifolds de pérdida cognitiva desacoplados" sobre razonamiento, acción operativa, generación visual/física ("Anti-Slop Craft") y conversación. No se publican datos verificables: ni número de tokens, ni composición del dataset, ni uso de RLHF/DPO. Tampoco hay paper ni detalles técnicos auditables, por lo que estas afirmaciones deben tomarse como declaraciones del autor.

Adicionalmente, el modelo aplica una "descensura por SVD dirigida": se eliminan las direcciones de rechazo (refusal directions) de las proyecciones descendentes del MLP (w2.weight), dejando intactas las proyecciones de salida de atención (o_proj.weight). Los GGUF distribuidos se cuantizan con llama-imatrix para preservar la fidelidad en razonamiento.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM3-1.7B.
- Razonamiento y tareas de código y sistemas, según la model card del autor (sin benchmarks que lo respalden).
- Contexto ultra-largo de 512K tokens para procesar documentos extensos en una sola pasada.
- Modelo "uncensored": sin mecanismos de rechazo, lo que permite respuestas sin filtros pero conlleva riesgos de uso indebido.
- Disponibilidad en GGUF cuantizados con imatrix para inferencia local eficiente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Visión, audio u otras modalidades: no disponible (es un modelo de solo texto).

## Casos de uso

- Procesamiento de documentos muy extensos: con 512K tokens de contexto, puede ingerir libros completos, expedientes legales o bases de código enteras y responder preguntas sobre ellas, algo poco común en modelos de este tamaño.
- Asistentes conversacionales locales y privados: su tamaño de ~1,7B permite ejecutarlo en portátiles y equipos sin GPU dedicada mediante GGUF, ideal para chatbots que no envían datos a la nube.
- Generación y asistencia de código en local: la model card lo orienta a tareas de código y sistemas; puede integrarse en editores locales tipo autocomplete o refactorización sobre repositorios completos gracias al contexto largo.
- Investigación sobre alineación y seguridad: la modificación SVD de las direcciones de rechazo es un caso de estudio técnico interesante para investigar cómo se eliminan comportamientos de refusal en MLP.
- Resumen y análisis de conversaciones largas: puede condensar hilos de correo, transcripciones o logs de gran volumen manteniendo coherencia a lo largo de la sesión.
- Prototipado de agentes ligeros: su bajo consumo de recursos lo hace adecuado para pipelines de agentes multi-paso en hardware modesto, aunque el soporte de tool calling no está documentado y habría que validarlo.
- Experimentación con arquitecturas híbridas: al basarse en la Tri-Hybrid de Liquid AI, sirve como plataforma para probar técnicas de contexto largo (ABF-RoPE) en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base LiquidAI/LFM3-1.7B, por lo que no es posible verificar las capacidades de razonamiento y código que se atribuyen al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, unos 3,5-4 GB solo de pesos (1,73B de parámetros); con GGUF a Q4, en torno a 1-1,5 GB. Con contexto de 512K tokens, la memoria del KV-cache puede dominar el consumo total y requerir cantidades muy superiores; no hay cifras oficiales.
- GPU recomendadas: no requiere GPU obligatoriamente dado su tamaño; en GPU, cualquier tarjeta moderna con 4-8 GB (RTX 3060, RTX 4060) es suficiente para inferencia con contexto moderado.
- Cabe en consumer GPU: sí, con holgura incluso en GPUs de gama media y en CPUs modernas vía GGUF, siempre que el contexto no sea extremo.
- Opciones de despliegue: transformers (librería nativa del repo), llama.cpp y Ollama gracias a los GGUF calibrados con imatrix; compatibilidad con vLLM o TGI no documentada (la arquitectura LFM3 puede requerir soporte reciente de cada runtime).
- Latencia y throughput estimados: no disponible; al ser un modelo de 1,7B, se espera latencia baja y throughput alto en hardware de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comentario |
|---|---|---|---|---|
| Lucet-2B-Frontier | 1,73B | 512K (declarado) | Apache 2.0 | Fine-tune uncensored de LFM3-1.7B; sin benchmarks publicados |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible en la ficha | no disponible | Modelo original de Liquid AI, con alineación estándar |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (aprox.) | Qwen (permisiva, uso comercial) | Referente consolidado en la clase sub-2B, con benchmarks públicos |
| Llama-3.2-1B-Instruct | 1,2B | 128K | Llama Community License | Alternativa de Meta con restricciones de licencia más limitadas |

Nota: la comparativa con Qwen y Llama es orientativa (valores de catálogo público); Lucet-2B-Frontier se distingue principalmente por su contexto declarado de 512K y su naturaleza uncensored, pero carece de evaluaciones independientes.

## Limitaciones y advertencias

- Modelo uncensored: la eliminación deliberada de direcciones de rechazo significa que generará contenido sin filtros de seguridad, incluido contenido potencialmente dañino. Su despliegue en producción exige controles externos obligatorios.
- Riesgo de alucinación: elevado y no cuantificado; al ser un fine-tune comunitario de 1,7B sin benchmarks publicados, la fiabilidad factual es desconocida.
- Afirmaciones no verificables: la metodología MTA-SDT, la ventana real de 512K tokens y las capacidades de razonamiento son declaraciones del autor sin paper, código de entrenamiento ni evaluaciones de terceros que las respalden.
- Contexto: aunque se declara 512K, el rendimiento efectivo (calidad de atención y uso de memoria del KV-cache) a longitudes extremas no está documentado; conviene validar con pruebas propias ("needle in a haystack").
- Idiomas: no se especifican los idiomas soportados; el castellano podría tener rendimiento inferior al inglés.
- Licencia: Apache 2.0, sin restricciones para uso comercial; no obstante, hay que revisar la licencia del modelo base (LiquidAI/LFM3-1.7B) para usos comerciales.
- Proyecto comunitario de autor individual: mantenimiento, actualizaciones y soporte no garantizados; solo 264 descargas y sin comunidad activa en el momento de la ficha.
- Soporte de tool calling, agentes y multimodalidad: no documentado; no debe asumirse sin pruebas.

## Enlaces

- Modelo principal: https://huggingface.co/mohommed/Lucet-2B-Frontier
- Cuantizaciones GGUF: https://huggingface.co/mohommed/Lucet-2B-Frontier-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper, blog o repositorio de entrenamiento: no disponible
