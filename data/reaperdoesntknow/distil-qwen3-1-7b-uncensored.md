# reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored

## Resumen

DiStil-Qwen3-1.7B-uncensored es un modelo de lenguaje de 1.7B parámetros efectivos (2.03B totales) desarrollado por Convergent Intelligence LLC (publicado bajo el perfil de HuggingFace reaperdoesntknow). Se trata de una destilación de Qwen3 que elimina los comportamientos de rechazo inducidos por alineación, manteniendo las capacidades de razonamiento y generación del modelo base. El objetivo declarado es responder a la pregunta tal como se formula, sin filtros de seguridad heurísticos que pueden fallar en consultas técnicas, analíticas o de investigación legítimas.

El modelo se basa en la arquitectura Qwen3ForCausalLM con 28 capas, atención GQA (16 cabezas de consulta, 8 de clave/valor), tamaño oculto de 2048 y una ventana de contexto de 40.960 tokens. Se entrenó mediante supervisión fina (SFT) con datos de instrucción sin censura, sin modificar la arquitectura base. Forma parte de una cadena de destilación que incluye una variante refinada con el marco DISC (Discrepancy Calculus), una teoría matemática propuesta por el mismo equipo para cuantificar la discrepancia estructural entre distribuciones de salida.

La relevancia de este modelo radica en su enfoque explícito de "uncensored" (sin censura), que lo posiciona como una alternativa para casos de uso donde la alineación estricta limita la utilidad, como la investigación académica, el análisis de contenido sensible o la generación creativa sin restricciones. Sin embargo, esta característica implica riesgos significativos de uso indebido y ausencia de salvaguardas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (Transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2.03B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | No disponible (repo en safetensors; existe variante GGUF en modelo paralelo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura estándar de Qwen3: un transformer decoder-only con atención de consultas agrupadas (GQA), 28 capas, tamaño oculto de 2048, dimensión intermedia de 6144 y vocabulario de 151.936 tokens. La ventana de contexto es de 40.960 tokens, notablemente mayor que la de muchos modelos de tamaño similar. No se especifican detalles sobre el dataset de entrenamiento más allá de que se usaron "datos de instrucción sin censura" mediante SFT con la librería TRL. El proceso de destilación parte del modelo base reaperdoesntknow/TopologicalQwen, que a su vez deriva de Qwen3-30B-A3B (según la sección del portfolio del autor).

La innovación técnica destacada es el uso del marco DISC (Discrepancy Calculus), una teoría que descompone la distribución de salida del profesor en componentes absolutamente continuas, de salto y de Cantor, y define un operador de discrepancia que cuantifica el desajuste estructural local que la divergencia KL promedio pierde. Este enfoque se aplica en la cadena de destilación, aunque este modelo concreto se describe como "una intervención SFT pura sobre la superficie de respuesta", sin modificaciones arquitectónicas.

## Capacidades

- Generación de texto libre y conversacional, con capacidad de seguir instrucciones complejas.
- Razonamiento multi-turno gracias a la ventana de contexto de 40.960 tokens.
- Soporte de chat mediante plantilla de conversación (chat template) estándar de Qwen3.
- Generación de código y análisis técnico, aunque no hay benchmarks publicados que lo confirmen.
- Capacidad de responder a preguntas que requieren contenido técnico o académico sin rechazos por políticas de seguridad.
- No se documenta soporte explícito para tool calling, agentes o modo de pensamiento (thinking mode).

## Casos de uso

- Investigación académica en áreas sensibles: el modelo puede analizar literatura sobre temas como seguridad informática, farmacología o psicología sin auto-censurarse, permitiendo a investigadores obtener respuestas directas.
- Generación de contenido creativo sin restricciones: escritores y guionistas pueden explorar temas tabú o controvertidos en narrativa sin que el modelo imponga bloqueos morales.
- Análisis de texto con jerga técnica especializada: al no rechazar consultas sobre terminología de nicho, puede procesar documentación de dominios como la ciberseguridad ofensiva o la investigación biomédica.
- Desarrollo de asistentes de código para tareas de ingeniería inversa: la ausencia de filtros permite preguntar sobre técnicas de explotación o análisis de malware, aunque con implicaciones éticas.
- Chatbots de rol o simulación de personajes: la falta de alineación permite respuestas más "humanas" en escenarios donde la corrección política sería un obstáculo.
- Evaluación de modelos de seguridad: los equipos de red team pueden usar este modelo para probar la robustez de sistemas de moderación de contenido, ya que genera respuestas sin filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El autor menciona que la destilación preserva las capacidades del modelo base, pero no aporta evidencia cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en FP16 (2.03B parámetros × 2 bytes), ~2 GB en cuantización INT8 y ~1.3 GB en cuantización 4-bit (según el tamaño del GGUF del modelo paralelo en Ollama).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100 (aunque sobran recursos).
- Cabe en GPUs consumer de gama media y baja; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: transformers (PyTorch), vLLM, llama.cpp, Ollama (existe un modelo similar en Ollama), FriendliAI (plataforma que lo lista).
- Latencia y throughput: no se proporcionan datos. Para un modelo de 2B, se espera una generación de 20-50 tokens/segundo en GPU consumer con cuantización 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DiStil-Qwen3-1.7B-uncensored | 2.03B | 40.960 | No disponible | HuggingFace |
| Qwen3-1.7B (original) | 1.7B | 32.768 (estimado) | Apache 2.0 | HuggingFace |
| DistilQwen3-1.7B-uncensored (variante paralela) | ~2.03B | 40.960 (presumible) | No disponible | HuggingFace |
| TopologicalQwen (modelo base) | ~2.03B | 40.960 (presumible) | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo. Las diferencias principales son el enfoque de destilación (DISC vs. estándar) y la eliminación de alineación. La licencia no está especificada, lo que dificulta su uso comercial legal.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: el modelo puede generar contenido dañino, ilegal o éticamente cuestionable. No debe usarse en aplicaciones orientadas al público general sin un filtro externo.
- Riesgo elevado de alucinaciones: al no tener restricciones de seguridad, puede afirmar información falsa con mayor confianza, especialmente en dominios técnicos.
- Sin licencia especificada: el uso comercial, la redistribución o la modificación pueden infringir derechos de autor o términos de uso no declarados.
- Sin datos de benchmarks: no hay evidencia objetiva de que preserve las capacidades de Qwen3, más allá de la afirmación del autor.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente hereda el multilingüismo de Qwen3, pero sin confirmación.
- Dependencia de un modelo base no estándar (TopologicalQwen): la calidad y reproducibilidad dependen de un modelo intermedio que puede tener sesgos o errores no documentados.
- El marco DISC y la metodología asociada carecen de validación externa por pares; la referencia al paper "Structure Over Scale" es un DOI de HuggingFace, no una publicación revisada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Repositorio de archivos: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored/tree/main
- Ficha en FriendliAI: https://friendli.ai/models/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Modelo en Ollama (variante paralela): https://ollama.com/reaperdoesntrun/DistilQwen3-1.7B-uncensored
- Modelo refinado con DISC: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Modelo base TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Paper de metodología (DOI): https://doi.org/10.57967/hf/8165
