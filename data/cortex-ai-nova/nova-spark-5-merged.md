# cortex-ai-nova/NOVA-Spark-5-Merged

## Resumen

NOVA-Spark-5-Merged es un modelo de lenguaje para generación de texto y conversación publicado por el usuario cortex-ai-nova bajo el identificador `cortex-ai-nova/NOVA-Spark-5-Merged`. Según los metadatos del repositorio, se trata de un merge derivado de `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, con 20.914.757.184 parámetros totales (aproximadamente 20,9 mil millones) y un tamaño de repositorio de 41,9 GB en formato safetensors. La model card lo presenta como "NOVA-Spark-5.1" dentro del ecosistema "NOVA UNIVERSE", con etiquetas que enfatizan inteligencia emocional, roleplay, ajuste por instrucciones y entrenamiento sintético.

El modelo se distribuye con licencia Apache 2.0 y declara soporte para inglés, kazajo y ruso, aunque el campo `language` de los metadatos de Hugging Face solo lista inglés. Está orientado a casos de uso conversacionales con formato ChatML y se anuncia como compatible con text-generation-inference y llama.cpp. La información técnica disponible es limitada: la model card es fundamentalmente promocional y no aporta detalles verificables sobre arquitectura interna, composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks.

La relevancia de esta ficha radica en documentar con rigor lo que el repositorio declara frente a lo que realmente se puede verificar. El modelo deriva de la familia gpt-oss, de la que hereda presumiblemente su arquitectura base, pero el autor no detalla el proceso de merge ni las modificaciones aplicadas. Los datos de descargas (215) y likes (1) indican una adopción muy baja en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivado de `unsloth/gpt-oss-20b-unsloth-bnb-4bit`; la model card no especifica la arquitectura interna) |
| Parametros totales | 20.914.757.184 (aproximadamente 20,9 mil millones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye en safetensors; se anuncia compatibilidad con llama.cpp, lo que sugiere conversión a GGUF, pero no se detallan variantes) |
| Idiomas soportados | Inglés, kazajo y ruso según la model card; los metadatos de Hugging Face solo declaran inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. El único dato estructural es su modelo base, `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, que corresponde a una variante cuantizada a 4 bits de la familia gpt-oss de 20 mil millones de parámetros. El autor no especifica si el merge conserva la arquitectura original, qué componentes se combinaron ni qué técnicas de fusión se emplearon. Tampoco se indica la longitud de contexto nativa ni si se modificó durante el proceso.

Respecto al entrenamiento, la model card describe un proceso en tres etapas sobre datos sintéticos propietarios: generación de árboles de tareas sintéticas que simulan lógica técnica, programación y diálogos creativos multi-turno; destilación de personalidad para eliminar respuestas "robóticas"; y un refuerzo de seguimiento de instrucciones (denominado "Instruction-Following Reinforcement") para mejorar la adherencia a restricciones anidadas del prompt de sistema. No se aportan cifras de tokens, composición del dataset, ni detalles sobre el algoritmo de RL empleado (RLHF, DPO u otro). El dataset referenciado, `cortex-ai-nova/Insider-Nano`, no está descrito en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML.
- Roleplay y adopción de personalidad, con énfasis declarado en "inteligencia emocional", humor y empatía.
- Seguimiento de instrucciones y del prompt de sistema, con resistencia declarada a intentos de jailbreak.
- Soporte multilingüe declarado para inglés, kazajo y ruso.
- Razonamiento técnico y de programación, según la descripción del entrenamiento sintético (no verificado con benchmarks).
- Compatibilidad con text-generation-inference y llama.cpp, lo que facilita el despliegue en servidores y en entornos locales.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistentes conversacionales de atención al cliente: el modelo está ajustado para mantener diálogos multi-turno con tono cercano y coherente con una persona definida, lo que encaja en flujos de soporte donde la calidez importa. La ventana de contexto real debe validarse antes de producción, ya que no está documentada.
- Personajes virtuales y roleplay: el entrenamiento declarado en destilación de personalidad y diálogos creativos lo hace adecuado para aplicaciones de entretenimiento, compañía virtual o narrativa interactiva donde se busca una voz consistente.
- Prototipado rápido de chatbots en ruso y kazajo: al declarar soporte para ambos idiomas, puede servir para demos de asistentes en esos mercados, aunque conviene evaluar la calidad real por idioma con un conjunto propio.
- Generación de diálogo sintético para aumentar datasets: su entrenamiento en árboles de tareas sintéticas permite usarlo como generador de conversaciones de entrenamiento para otros modelos, siempre con revisión humana.
- Integración en clientes de escritorio o locales: la compatibilidad anunciada con llama.cpp permite desplegarlo cuantizado en estaciones de trabajo sin GPU de datacenter, útil para asistentes offline.
- Evaluación comparativa de merges: para investigadores interesados en técnicas de model merging, este repositorio sirve como caso de estudio de un merge sobre gpt-oss-20b, aunque la falta de documentación del proceso limita su valor reproducible.
- Asistente personal con instrucciones de sistema estrictas: el refuerzo declarado en seguimiento de instrucciones anidadas lo hace candidato para aplicaciones donde el prompt de sistema define reglas de comportamiento no negociables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 42 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere 48 GB o más, lo que implica GPU de datacenter como A100 80 GB, H100 o L40S.
- Cuantización a 8 bits: alrededor de 21 GB de pesos, viable en una RTX 4090 (24 GB) con contexto corto, aunque el margen es ajustado.
- Cuantización a 4 bits (GGUF o similar): aproximadamente 11-13 GB de pesos, lo que permite ejecución en GPU de consumo como RTX 3090, RTX 4090 o RTX 4080, y potencialmente en GPUs de 12-16 GB con contexto reducido.
- Despliegue en servidor: text-generation-inference (TGI) y vLLM son opciones habituales para la familia gpt-oss; el autor declara compatibilidad con TGI.
- Despliegue local: llama.cpp y, por extensión, Ollama o LM Studio, son viables tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. La model card afirma una generación "30-40% más rápida" que arquitecturas base estándar, pero no aporta mediciones ni metodología, por lo que la afirmación no es verificable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NOVA-Spark-5-Merged | ~20,9 B | No disponible | Apache 2.0 | Hugging Face (215 descargas) | Merge de gpt-oss-20b; documentación técnica escasa |
| gpt-oss-20b (OpenAI) | ~20 B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelo base del que deriva; arquitectura y benchmarks propios documentados por su autor original |
| Modelos de ~20 B de la familia Llama o Mistral | ~20-24 B | 32k-128k según variante | Licencias comunitarias variables | Hugging Face y ecosistema amplio | Alternativas maduras con benchmarks públicos y amplio soporte de herramientas |

La comparación cuantitativa con alternativas no es posible con la información disponible: el repositorio no publica benchmarks propios y la model card no ofrece métricas verificables frente a otros modelos.

## Limitaciones y advertencias

- Documentación técnica insuficiente: no se especifican arquitectura, contexto, tokens de entrenamiento ni composición del dataset, lo que dificulta evaluar su idoneidad para producción.
- Procedencia del entrenamiento opaca: la model card afirma usar datos sintéticos propietarios y "confidenciales", sin posibilidad de auditar sesgos ni calidad del corpus.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin benchmarks ni evaluaciones publicadas no se puede acotar su magnitud.
- Sesgos desconocidos: al no documentarse el dataset ni el proceso de alineamiento, no es posible identificar sesgos de género, culturales o políticos; el sesgo hacia la personalidad "NOVA UNIVERSE" y hacia su creador podría afectar respuestas sobre identidad.
- Cobertura multilingüe incierta: los metadatos solo declaran inglés, mientras la model card afirma kazajo y ruso; la calidad real en estos idiomas no está verificada.
- Adopción muy baja: 215 descargas y 1 like en el momento de la consulta implican escasa validación por parte de la comunidad.
- Afirmaciones no verificadas: las menciones a velocidad "30-40% superior" y resistencia a jailbreaks no van acompañadas de mediciones ni de metodología de evaluación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `gpt-oss-20b` puede tener condiciones propias que conviene revisar antes de explotarlo comercialmente.
- Fecha de creación futura en los metadatos (2026-11-20): conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cortex-ai-nova/NOVA-Spark-5-Merged
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Dataset referenciado: https://huggingface.co/datasets/cortex-ai-nova/Insider-Nano
- Cliente NOVA UNIVERSE (enlace de la model card): https://nova-universe.netlify.app
