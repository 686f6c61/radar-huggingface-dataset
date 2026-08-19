# happenmajic89/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF

## Resumen

DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored, un fine-tuning de Llama 3.1 8B Instruct desarrollado por aifeifei798. El objetivo de este fine-tuning es reducir los alineamientos de seguridad del modelo original para permitir una generación de texto más abierta, especialmente orientada a roleplay (incluido el denominado "dark roleplay"), escritura creativa, respuestas rápidas y usos académicos. La cuantización ha sido realizada por mradermacher, que ha publicado tanto quants estáticos como versiones con imatrix.

El modelo base conserva la arquitectura transformer decoder-only de Llama 3.1 con 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens (característica estándar de Llama 3.1). Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otras herramientas compatibles, con múltiples niveles de cuantización que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB). El repositorio actual (happenmajic89) es una re-subida de los quants de mradermacher, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.312 (8,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1) |
| Tipos de cuantizacion | Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th, zh, ko, ja |
| Licencia | llama3.1 (licencia de Meta, requiere aceptacion de terminos) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Llama 3.1 8B Instruct, que utiliza una arquitectura transformer decoder-only estándar con atención multi-cabeza, normalización RMSNorm, y embeddings rotatorios (RoPE). No se dispone de información detallada sobre el proceso de entrenamiento del fine-tuning: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La única característica documentada es que se trata de un "uncensored" fine-tuning, lo que implica una reducción deliberada de los mecanismos de rechazo de contenido sensible.

La cuantización GGUF ha sido realizada por mradermacher mediante conversión estática de los pesos originales en safetensors. Se ofrecen dos familias de quants: los estáticos (en este repositorio) y los ponderados con imatrix (en un repositorio separado). No se han publicado detalles sobre la metodología de cuantización más allá de la lista de archivos.

## Capacidades

- Generación de texto libre con restricciones de seguridad reducidas, orientada a roleplay y escritura creativa.
- Soporte de instrucciones en formato chat (modelo instruct), con plantilla de chat de Llama 3.1.
- Multilingüe: soporta 11 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español, tailandés, chino, coreano y japonés).
- Capacidad de generar código, aunque no se documenta específicamente.
- No se ha confirmado soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se ha confirmado modo "thinking" ni capacidades multimodales (visión, audio).

## Casos de uso

- Roleplay conversacional en aplicaciones como SillyTavern: el modelo está etiquetado específicamente para roleplay y es compatible con frontends de chat que usan GGUF, permitiendo interacciones multi-turno con personajes sin los filtros habituales de los modelos alineados.
- Escritura creativa y narrativa: su naturaleza "uncensored" permite explorar temas oscuros o controvertidos en ficción, con generación de diálogos y descripciones detalladas.
- Generación de prompts y respuestas rápidas: útil para prototipos de asistentes conversacionales donde se requiere una respuesta inmediata sin moderación estricta.
- Investigación académica sobre alineamiento y seguridad: puede servir como caso de estudio para analizar el comportamiento de modelos sin restricciones de seguridad.
- Desarrollo de personajes virtuales o NPCs en juegos: su capacidad para mantener contextos largos (128K) permite construir personajes con historias extensas.
- Pruebas de estrés de sistemas de moderación: al ser un modelo sin filtros, puede usarse para evaluar la robustez de clasificadores de contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tuning específico. El modelo base Llama 3.1 8B Instruct tiene benchmarks conocidos, pero no se puede asumir que el fine-tuning los conserve.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, desde ~3,3 GB (Q2_K) hasta ~16,2 GB (f16). Para uso práctico, se recomienda Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB) como equilibrio entre calidad y consumo.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5 (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para Q6_K y Q8_0 se necesitan 8-12 GB (RTX 3070/3080, RTX 4070). La versión f16 requiere 16 GB o más (RTX 4080/4090, A100).
- Sí cabe en GPUs de consumo: las cuantizaciones Q2-Q5 son viables en tarjetas de gama media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible), TGI (si se convierte a safetensors).
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 8B en Q4_K_M, se puede esperar una velocidad de generación de 20-40 tokens/s en una RTX 3090/4090 con llama.cpp, pero estos valores son estimaciones generales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored (este) | 8,03 B | 128K | llama3.1 | GGUF | Fine-tuning uncensored para roleplay |
| Llama 3.1 8B Instruct (original) | 8,03 B | 128K | llama3.1 | safetensors, GGUF | Modelo base con alineamiento estándar |
| Dolphin 2.2.1 Mistral 7B | 7,24 B | 32K | Apache 2.0 | GGUF, safetensors | Fine-tuning uncensored similar, pero sobre Mistral |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a características generales.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, violento, sexualmente explícito o ilegal. No debe desplegarse en entornos de producción sin moderación humana o filtros adicionales.
- No se ha evaluado su rendimiento en tareas estándar; el fine-tuning puede degradar capacidades generales de razonamiento o conocimiento.
- La licencia llama3.1 impone restricciones de uso comercial y requiere aceptación de los términos de Meta. Verificar cumplimiento antes de cualquier uso empresarial.
- No hay información sobre sesgos específicos, pero al ser un derivado de Llama 3.1, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no se ha documentado, pero es inherente a los modelos de lenguaje.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad. Se recomienda probar antes de confiar en él.
- La fecha de creación (2026-08-18) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o un modelo generado automáticamente.

## Enlaces

- Repositorio GGUF (este): https://huggingface.co/happenmajic89/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/aifeifei798/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored
- Quants con imatrix de mradermacher: https://huggingface.co/mradermacher/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-i1-GGUF
- Repositorio GGUF alternativo de bartowski: https://huggingface.co/bartowski/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF
- Página en ModelScope: https://www.modelscope.cn/models/QuantFactory/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF
- Entrada en Grokipedia: https://grokipedia.com/page/DarkIdol-Llama-31-8B-Instruct-12-Uncensored
