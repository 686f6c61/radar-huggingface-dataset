# sam-llm-dev/Llama-3.2-1B-SAM-GGUF

## Resumen

Llama-3.2-1B-SAM (Small Assistant Model) es un ajuste fino mediante QLoRA de `meta-llama/Llama-3.2-1B-Instruct`, desarrollado por el usuario independiente sam-llm-dev. El modelo está orientado a la generación de explicaciones educativas densas en datos factuales y al despliegue en entornos con recursos limitados, como hardware de consumo, dispositivos de borde y moviles. Se distribuye principalmente en formato GGUF cuantizado, lo que permite su ejecución en equipos con poca VRAM.

El modelo parte de la arquitectura transformer decoder-only de Llama 3.2 1B, con 1.235.814.432 parámetros totales. Su propuesta de valor no es la competición en benchmarks de razonamiento, sino la ligereza: el autor reporta que la versión Q4_K_M puede ejecutarse con aproximadamente 1,0–1,3 GB de VRAM o RAM, y la FP16 con unos 2,5–3,0 GB. Está entrenado exclusivamente en inglés y su licencia es la Llama 3.2 Community License.

Es relevante ahora como ejemplo de ajuste fino ligero y educativo: demuestra un flujo QLoRA sobre un modelo pequeño y su empaquetado en GGUF para inferencia local. No obstante, sus resultados de evaluación son modestos (20–40 % en una prueba propia de 20 preguntas), y el propio autor advierte que no debe usarse para matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (repo de 4,6 GB); etiquetas de transformers y qlora |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Llama 3.2 1B Instruct, con 1.235.814.432 parámetros. El ajuste se realizó mediante QLoRA, técnica que congela los pesos base en cuantización de baja precisión e inyecta adaptadores de bajo rango entrenables, reduciendo drásticamente los requisitos de memoria durante el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO posteriores al ajuste supervisado.

El dataset empleado es `sam-llm-dev/SAM-Family-Dataset`. En el changelog se indica que la versión v1.1 utilizó un conjunto de entrenamiento deduplicado para aumentar la variedad del ajuste fino. La innovación destacable no es arquitectónica sino de despliegue: la distribución en GGUF con tres niveles de cuantización (F16, Q8_0 y Q4_K_M) permite ejecutar el modelo en hardware de gama baja. No se documentan técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en inglés, orientada a explicaciones educativas concisas y densas en hechos.
- Explicación de conceptos para estudiantes y educadores (caso de uso declarado por el autor).
- Ejecución en entornos de baja VRAM y dispositivos de borde gracias a las cuantizaciones GGUF.
- Capacidad limitada de cálculo aritmético: el autor desaconseja explícitamente su uso para matemáticas.
- Integración con intérprete de código Python: la evaluación del autor incluye una variante "con Python", lo que sugiere soporte de ejecución de código externa, aunque no se documenta tool calling nativo.
- Soporte multilingüe: no disponible (solo inglés).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Tutor educativo local: el modelo puede generar explicaciones breves de conceptos para estudiantes en un portátil sin GPU dedicada, usando la cuantización Q4_K_M con ~1,0–1,3 GB de VRAM o RAM. Es adecuado por su ajuste específico a explicaciones didácticas y su bajo coste de despliegue.
- Asistente conversacional en dispositivos de borde: puede integrarse en aplicaciones móviles o embebidas en inglés donde el presupuesto de memoria es inferior a 2 GB, aprovechando la versión Q8_0.
- Prototipado rápido de pipelines de IA: sirve como modelo de prueba en fases de desarrollo antes de escalar a modelos mayores, gracias a su reducido tamaño y a la compatibilidad con endpoints y librerías estándar (transformers).
- Generación de material de estudio: puede producir resúmenes y desgloses de conceptos para profesores que necesiten borradores rápidos en inglés, siempre con revisión humana por el riesgo de alucinación.
- Demostraciones de ajuste fino QLoRA: el modelo y su dataset sirven como caso de estudio reproducible para quienes aprenden a adaptar modelos pequeños con recursos limitados.
- Inferencia offline en entornos sin conectividad: al ejecutarse en GGUF con llama.cpp u Ollama, puede desplegarse en equipos aislados para consultas educativas básicas en inglés.
- Evaluación de asistentes con intérprete de código: el autor reporta mejoras al añadir Python (de 35 % a 40 % en F16), lo que sugiere su uso en pipelines donde el cálculo se delega a herramientas externas.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 20 preguntas, sin especificar el conjunto de datos ni la metodología:

| Variante | Sin Python | Con Python |
|---|---|---|
| Llama-3.2-1B-SAM-v1.0-F16.gguf | 35,0 % (7/20) | 40,0 % (8/20) |
| Llama-3.2-1B-SAM-v1.0-Q8_0.gguf | 25,0 % (5/20) | 40,0 % (8/20) |
| Llama-3.2-1B-SAM-v1.0-Q4_K_M.gguf | 20,0 % (4/20) | 20,0 % (4/20) |

El autor reconoce que los resultados no son óptimos y que el modelo no debe usarse para matemáticas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según el autor: FP16 ~2,5–3,0 GB; Q8_0 ~1,5–2,0 GB; Q4_K_M ~1,0–1,3 GB (incluye overhead de la ventana de contexto).
- Cabe en GPU de consumo: cualquier GPU con 2 GB o más de VRAM puede ejecutar la versión Q4_K_M; una RTX 3060, RTX 4060 o superior ejecuta sin problemas las tres variantes.
- También puede ejecutarse en CPU usando RAM del sistema si no hay offloading a GPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repo está etiquetado como compatible con endpoints y con la librería transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-SAM | 1,23 B | no disponible | Llama 3.2 Community | GGUF en HF | Ajuste QLoRA educativo, solo inglés |
| meta-llama/Llama-3.2-1B-Instruct | 1,23 B | 128 K (modelo base oficial) | Llama 3.2 Community | HF oficial | Modelo base; contexto oficial no confirmado en esta ficha para el derivado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K (oficial) | Apache 2.0 | HF oficial | Multilingüe, licencia permisiva |
| Gemma-2-2B-it | 2,6 B | 8 K (oficial) | Gemma Terms | HF oficial | Algo mayor, requiere más VRAM |

Nota: los datos de contexto y licencia de los modelos comparables provienen de sus fichas oficiales; no se dispone de benchmarks comparativos en la información proporcionada para este modelo.

## Limitaciones y advertencias

- Rendimiento bajo en la evaluación propia del autor (20–40 % en 20 preguntas); no es fiable para tareas que requieran precisión factual o matemática.
- El autor advierte explícitamente que no debe usarse para matemáticas.
- Riesgo elevado de alucinación, habitual en modelos de 1B de parámetros ajustados con datasets pequeños.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Longitud de contexto no documentada; no debe asumirse el contexto nativo de Llama 3.2 sin verificación.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de producción.
- El modelo se distribuye principalmente en GGUF; la disponibilidad de pesos safetensors para fine-tuning adicional no está confirmada.
- Proyecto de un desarrollador individual con pocas descargas (606) y likes (2); sin garantías de mantenimiento.
- No se documentan sesgos específicos, pero al derivar de Llama 3.2 hereda los sesgos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/sam-llm-dev/Llama-3.2-1B-SAM-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset: https://huggingface.co/datasets/sam-llm-dev/SAM-Family-Dataset
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable de Meta: https://www.llama.com/llama3_2/use-policy/
- Contacto del autor: samllmdev@gmail.com
