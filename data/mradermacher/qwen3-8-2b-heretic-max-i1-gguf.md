# mradermacher/Qwen3.8-2B-Heretic-Max-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-2B-Heretic-Max-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `MihaiPopa-1/Qwen3.8-2B-Heretic-Max`, un modelo de 2 000 millones de parámetros derivado de la serie Qwen3.8 (que a su vez se basa en la arquitectura de Qwen3.5). El cuantizador, mradermacher, es un conocido proveedor de archivos GGUF optimizados para inferencia local. El nombre "Heretic" hace referencia al proceso de eliminación automática de censura aplicado al modelo mediante la herramienta homónima, que emplea técnicas de "abliteration" para decensurar el comportamiento del modelo.

Este modelo está pensado para despliegue en entornos edge o con recursos limitados, gracias a su tamaño reducido y a la disponibilidad de múltiples niveles de cuantización. Los tags asociados indican capacidades de razonamiento, function calling y ajuste por supervisión (SFT), además de un enfoque en generación de texto sin restricciones. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Su relevancia actual radica en ofrecer una alternativa ligera y descensurada para aplicaciones que requieren generación de contenido abierta, aunque con las limitaciones propias de un modelo de 2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8 / Qwen3.5, sin detalles publicados) |
| Parametros totales | 2B (nominal, segun el nombre del modelo; el dato de safetensors indica 479 418, inconsistente con el tamano declarado) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (en el repositorio estatico; este repo i1 solo contiene el archivo imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors para el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por el nombre y los tags, se infiere que se trata de un transformer denso de 2B parametros, heredado de la serie Qwen3.8, que a su vez se construye sobre la arquitectura de Qwen3.5. El modelo base fue sometido a un proceso de "abliteration" mediante la herramienta Heretic, que elimina automaticamente los mecanismos de censura aprendidos durante el entrenamiento. Los tags indican que el modelo fue ajustado mediante SFT (supervised fine-tuning) y distillation, y que incorpora capacidades de razonamiento y function calling. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, con enfasis en contenido sin censura gracias al proceso de decensurado aplicado.
- Razonamiento multi-step, segun los tags del modelo.
- Soporte de function calling / tool calling, lo que permite integracion con APIs y agentes.
- Capacidades de vision: la model card indica que es un modelo de vision ("This is a vision model"), aunque no se proporcionan detalles sobre el procesamiento de imagenes ni se confirma la existencia de archivos mmproj en este repositorio.
- Disenado para entornos edge, con un tamano reducido que facilita su despliegue en dispositivos con recursos limitados.

## Casos de uso

- Chatbots sin restricciones de contenido: al estar decensurado, puede emplearse en aplicaciones de conversacion abierta donde se requiere generar respuestas sobre temas sensibles o controvertidos, sin los filtros habituales de seguridad.
- Asistentes de codigo en entornos locales: su soporte de function calling permite integrarlo en pipelines de desarrollo como generador de fragmentos de codigo o autocompletado, ejecutandose en una GPU de consumo o incluso en CPU.
- Razonamiento logico en dispositivos moviles o IoT: con 2B de parametros y cuantizaciones ligeras (Q4_K_S o inferiores), puede ejecutarse en tiempo real en hardware de baja potencia para tareas de clasificacion, extraccion de informacion o respuesta a preguntas.
- Agentes conversacionales para atencion al cliente: su capacidad de tool calling y razonamiento permite construir agentes que consulten bases de conocimiento o APIs externas, aunque la ventana de contexto limitada (no especificada) puede restringir conversaciones muy largas.
- Generacion de contenido creativo sin filtros: util para escritura de ficcion, guiones o material de marketing donde se requiere libertad expresiva, siempre que se asuman los riesgos de sesgos y alucinaciones.
- Prototipado rapido de aplicaciones de IA: al ser un modelo pequeno y con licencia permisiva, es adecuado para pruebas de concepto y experimentacion en entornos de desarrollo sin grandes requisitos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 2B en cuantizacion Q4_K_S ocupa aproximadamente 1,5-2 GB, por lo que cabe en GPUs con 4 GB o mas. Con cuantizaciones mas agresivas (Q2_K, IQ2_M) el uso de VRAM puede reducirse a menos de 1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar el modelo. Para velocidades optimas se recomienda una RTX 3060 o superior.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de consumo e incluso en CPU con suficiente RAM (8 GB o mas) usando llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptacion), TGI (Text Generation Inference), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU de gama media (RTX 3060), se espera una velocidad de generacion de 30-60 tokens por segundo en cuantizacion Q4_K_S, pero estos valores son estimaciones basadas en modelos de tamano similar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2B-Heretic-Max (este) | 2B | No disponible | Apache 2.0 | GGUF | Descensurado, function calling |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | Safetensors, GGUF | Modelo instruct estandar, con censura |
| Llama-3.2-1B-Instruct | 1B | 128K | Llama 3.2 | Safetensors, GGUF | Modelo pequeno de Meta, con censura |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | Safetensors, GGUF | Mayor tamano, mejor rendimiento, con censura |

La comparativa se basa en caracteristicas generales, ya que no hay datos de rendimiento publicados para el modelo evaluado. La principal diferencia es el proceso de decensurado, que lo hace unico frente a alternativas con filtros de seguridad.

## Limitaciones y advertencias

- Tamano reducido: al ser un modelo de 2B, su capacidad de razonamiento complejo y de generacion de codigo de alta calidad es inferior a modelos de 7B o superiores.
- Sesgos y alucinaciones: el proceso de "abliteration" puede eliminar mecanismos de seguridad, pero no corrige sesgos subyacentes del entrenamiento. El modelo puede generar contenido ofensivo, incorrecto o inventado con mayor facilidad que un modelo censurado.
- Idioma limitado: solo soporta ingles, lo que restringe su uso en aplicaciones multilingues.
- Contexto desconocido: no se ha publicado la longitud de contexto, lo que impide saber si puede manejar conversaciones largas o documentos extensos.
- Riesgo de uso indebido: al ser descensurado, puede utilizarse para generar contenido danino o ilegal. El usuario es responsable de cumplir las leyes y normas eticas aplicables.
- Datos inconsistentes: el numero de parametros reportado en safetensors (479 418) no coincide con el nombre del modelo (2B), lo que sugiere un posible error en el registro o una cuantizacion extrema. Se recomienda verificar la integridad del archivo antes de su uso en produccion.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas estandar, por lo que su calidad real es incierta.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3.8-2B-Heretic-Max-i1-GGUF
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Qwen3.8-2B-Heretic-Max-GGUF
- Modelo base: https://huggingface.co/MihaiPopa-1/Qwen3.8-2B-Heretic-Max
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
