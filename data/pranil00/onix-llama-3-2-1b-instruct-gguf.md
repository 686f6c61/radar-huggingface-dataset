# pranil00/ONIX-Llama-3.2-1B-Instruct-GGUF

## Resumen

ONIX-Llama-3.2-1B-Instruct-GGUF es una cuantización en formato GGUF del modelo meta-llama/Llama-3.2-1B-Instruct, publicada por el usuario pranil00 bajo el paraguas de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el trabajo del autor consiste en la conversión a cuantización Q5_K_M (5,5 bits por peso) y en la generación de una model card con perfiles de memoria y comandos de despliegue para distintos tipos de hardware. El modelo base es un transformer decoder-only de la familia LLaMA con 1.498.480.640 parámetros (aproximadamente 1,5 mil millones).

La relevancia de esta publicación es fundamentalmente práctica: reduce el peso de los pesos de 2,93 GB en FP16 a 1,01 GB en Q5_K_M, lo que permite ejecutar el modelo en hardware de consumo muy modesto, incluidos equipos Apple Silicon con memoria unificada y GPUs de gama media. Sin embargo, el repositorio presenta señales de escasa madurez: cero descargas, cero likes, ausencia de datos de benchmarks propios y afirmaciones de calidad (97,5 % de retención) sin metodología publicada.

Conviene subrayar que la model card incluye afirmaciones y telemetría que no se pueden verificar con la información disponible, y que el modelo base procede de Meta con su propia licencia comunitaria, mientras que este artefacto se declara Apache 2.0. Cualquier uso en producción debería partir de la verificación independiente del modelo y de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA 3.2) |
| Parametros totales | 1.498.480.640 (1,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (ventana óptima declarada en GPU/Apple Silicon); 4.096 tokens en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el repo contiene un único archivo GGUF |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base de Meta soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Apache 2.0 (declarada para el artefacto; el modelo base tiene licencia comunitaria de Meta) |
| Formato de pesos | GGUF (archivo `meta-llama--Llama-3.2-1B-Instruct-Q5_K_M.gguf`, 1,01 GB) |

## Arquitectura y entrenamiento

El artefacto no introduce cambios arquitectónicos: hereda la arquitectura del Llama-3.2-1B-Instruct de Meta, un transformer decoder-only denso con atención por causalidad, normalización RMSNorm y activaciones SwiGLU, optimizado para instrucciones mediante fine-tuning supervisado y preferencias (el detalle exacto del pipeline de alineamiento del modelo base no se reproduce en la información disponible). El autor no documenta el proceso de cuantización más allá del esquema Q5_K_M y de la herramienta empleada (`run-any-model`), ni publica la composición del dataset de calibración, el número de tokens de entrenamiento ni métricas de perplejidad del artefacto cuantizado.

La model card incluye una "DeviceQuant Telemetry Audit Report" con cifras de memoria residente (3,09 GB en FP16 frente a 1,17 GB en Q5_K_M), aceleración de capas (16/16) y una estimación de retención de calidad del 97,5 %. Estas cifras deben interpretarse como mediciones del autor sobre un host concreto (Darwin, 16 GB, Metal) y no como resultados reproducibles ni validados de forma independiente. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o variantes híbridas.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo Instruct de Meta.
- Razonamiento básico de un solo paso, adecuado para tareas simples pero limitado en cadenas de razonamiento largas por su tamaño de 1,5 B.
- Generación de código y respuesta a preguntas de conocimiento general, con fiabilidad limitada por la escala del modelo.
- Soporte multilingüe heredado del modelo base (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés según la documentación de Meta), aunque la model card de este artefacto no lo declara explícitamente.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Ejecución en CPU, GPU y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y la CLI `run-any-model`.

## Casos de uso

- Asistente conversacional local en portátiles modestos: con 1,17 GB de memoria unificada en Apple Silicon o 2,51 GB de VRAM en GPU, el modelo puede mantener conversaciones multi-turno de hasta 8.192 tokens en un equipo sin GPU dedicada, útil para prototipos y demos offline.
- Clasificación y etiquetado de texto por lotes: su bajo coste de memoria permite desplegar varias instancias en paralelo en un solo servidor para tareas de categorización, extracción de entidades simples o moderación preliminar de contenido.
- Generación de borradores y resúmenes en herramientas de escritura integradas: el tamaño reducido facilita su inclusión en editores de texto o plugins de escritorio que no pueden asumir el coste de un modelo de 7 B o superior.
- Enseñanza y experimentación con LLMs: sirve como banco de pruebas para estudiar cuantización, latencia y comportamiento de modelos pequeños en cursos y laboratorios, gracias a su licencia permisiva declarada y a los comandos de despliegue incluidos.
- Filtrado previo en pipelines RAG: puede emplearse como primera etapa de reordenación o de descarte de fragmentos irrelevantes antes de invocar un modelo mayor, reduciendo coste por consulta en arquitecturas de recuperación aumentada.
- Aplicaciones de borde y dispositivos con recursos limitados: su huella de 1,01 GB de pesos permite empaquetarlo en aplicaciones de escritorio o entornos con poca RAM, siempre que las expectativas de calidad se ajusten a un modelo de 1,5 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye la tabla de telemetría del autor (tamaño de pesos, memoria residente, aceleración de capas y una estimación de retención de calidad del 97,5 % sin metodología detallada), que no constituye una evaluación de capacidades del modelo.

## Requisitos de hardware

- VRAM estimada: 2,51 GB dedicados en GPU NVIDIA (RTX 30/40/50) según la model card; 1,17 GB de memoria unificada en Apple Silicon (M1 a M5); 3,17 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 3 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque en estas dos últimas el modelo estará infrautilizado.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales, e incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI propietaria `run-any-model`. No se documenta soporte de vLLM ni de TGI para este artefacto GGUF.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Llama-3.2-1B-Instruct-GGUF (este) | 1,5 B | 8.192 tokens | GGUF Q5_K_M | Apache 2.0 (declarada) | Cuantización comunitaria sin benchmarks publicados |
| meta-llama/Llama-3.2-1B-Instruct | 1,5 B | 128.000 tokens (modelo base) | Safetensors | Licencia comunitaria de Meta | Modelo original con evaluación oficial de Meta |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Safetensors, GGUF | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Safetensors, GGUF | Términos de uso de Gemma | Algo mayor, con restricciones de licencia |

La comparación con el modelo base es la más relevante: este artefacto reduce el peso a un tercio, pero la model card no documenta si se ha preservado la ventana de contexto nativa de 128.000 tokens del modelo original, y las cifras de contexto que ofrece (8.192 y 4.096 tokens) apuntan a límites prácticos de despliegue, no a la capacidad arquitectónica.

## Limitaciones y advertencias

- Modelo de 1,5 B parámetros: capacidad de razonamiento, matemáticas y código muy limitada en comparación con modelos de 7 B o superiores; no es adecuado para tareas que exijan precisión factual alta.
- Riesgo elevado de alucinación, inherente a los modelos pequeños y agravado por la cuantización Q5_K_M.
- La estimación de retención de calidad del 97,5 % procede del propio autor y no se ha validado de forma independiente ni con benchmarks estándar.
- La model card declara licencia Apache 2.0 para el artefacto, pero el modelo base de Meta está sujeto a su propia licencia comunitaria; es responsabilidad del usuario verificar la compatibilidad antes de un uso comercial.
- El repositorio no tiene descargas ni likes, y la fecha de creación indicada (2026-11-25) es posterior a la fecha actual, lo que sugiere posibles inconsistencias en los metadatos; conviene tratar el artefacto con cautela.
- La model card incluye afirmaciones comerciales ("100% Native Metal Accelerated", "EXCELLENT Native Fit") sin evidencia reproducible adjunta.
- No se documentan sesgos específicos del artefacto; los sesgos del modelo base de Meta son aplicables y no se han evaluado aquí.
- El contexto práctico declarado (8.192 tokens en GPU, 4.096 en CPU) es muy inferior al contexto nativo del modelo base, lo que limita casos de uso con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-Llama-3.2-1B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio de la herramienta de cuantización: https://github.com/PranilShah-08/run-any-model
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
