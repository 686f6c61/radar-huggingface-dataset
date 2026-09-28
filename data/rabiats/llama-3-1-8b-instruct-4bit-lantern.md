# RabiatS/Llama-3.1-8B-Instruct-4bit-Lantern

## Resumen

Llama-3.1-8B-Instruct-4bit-Lantern es una copia cuantizada a 4 bits en formato MLX del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario RabiatS para la aplicación Lantern, un cliente de IA para iPhone, iPad y Mac que funciona de forma totalmente local. El repositorio reproduce los pesos de la conversión mlx-community/Meta-Llama-3.1-8B-Instruct-4bit sin modificarlos: no es un ajuste fino ni una variante reentrenada, sino un espejo de conveniencia para el catálogo de Lantern.

El modelo es un transformer decoder-only denso de 8.030.261.248 parámetros (unos 8,03 B), heredado del modelo base de Meta, y ocupa aproximadamente 4,5 GB en disco en su formato de 4 bits. La ficha declara entrada únicamente de texto y no documenta proceso de entrenamiento propio.

Su relevancia es práctica: Lantern lo presenta como el modelo más capaz que admite la aplicación, que limita el tamaño a 8 B porque por encima la app se cierra en el iPhone. Permite inferencia privada y sin conexión en hardware Apple Silicon, cómoda en Macs con 16 GB o más de memoria unificada y ajustada, con reservas, en iPhone de 8 GB. La licencia es la Llama 3.1 Community License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (por herencia del modelo base Llama 3.1; no se detalla en este repositorio) |
| Parámetros totales | 8.030.261.248 (8,03 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base meta-llama/Llama-3.1-8B-Instruct declara 128.000 tokens |
| Tipos de cuantización | 4 bits en formato MLX (única variante del repositorio) |
| Idiomas soportados | no disponible en la ficha; el modelo base declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License (Copyright © Meta Platforms, Inc.) |
| Formato de pesos | safetensors en formato MLX, 4 bits (tamaño del repo ≈4,5 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base de Meta: transformer decoder-only denso de 8.030.261.248 parámetros con atención de consultas agrupadas (GQA) y un contexto nominal de 128.000 tokens, según la documentación de Llama 3.1. La única transformación aplicada aquí es la cuantización a 4 bits en el formato de MLX, la librería de Apple para ejecutar modelos en Apple Silicon. El autor indica explícitamente que los pesos son idénticos a los de la conversión de mlx-community, que a su vez deriva del modelo instruct original, y no documenta ningún proceso de entrenamiento propio.

Según la documentación pública de Meta, el modelo base Llama 3.1 8B Instruct se entrenó con ajuste supervisado y optimización por preferencias sobre un corpus de más de 15 billones de tokens. La cuantización a 4 bits reduce el peso en memoria aproximadamente un 75 % frente a FP16, a cambio de una degradación de calidad que la ficha no cuantifica ni evalúa.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y las etiquetas incluyen conversational.
- Seguimiento de instrucciones y conversaciones multiturno con la plantilla de chat de Llama 3.1 Instruct.
- Razonamiento, matemáticas y generación de código: capacidades del modelo base Llama 3.1 8B Instruct, no verificadas específicamente para esta cuantización.
- Tool calling / function calling: soportado por el modelo base Llama 3.1 Instruct, aunque la ficha de este repositorio no lo menciona.
- Capacidad multilingüe: heredada del modelo base, que declara 8 idiomas; no especificada en este repositorio.
- Entrada solo de texto: la ficha indica "Takes in: text", sin visión ni audio.
- Ejecución local y sin conexión: todos los cálculos ocurren en el dispositivo y la única red usada es la descarga inicial de los archivos.
- No incluye modo de razonamiento extendido (thinking) ni decodificación especulativa documentada.

## Casos de uso

- Asistente conversacional privado en Mac: al ejecutarse 100 % en local, conviene para consultas sobre información sensible que no debe salir del equipo, aprovechando los 16 GB o más de memoria unificada recomendados.
- Redacción y edición de texto sin conexión en iPhone o iPad: útil en desplazamientos o entornos sin red, teniendo en cuenta que en iPhone de 8 GB iOS puede cerrar la app en conversaciones largas.
- Resumen de documentos extensos: el contexto heredado de 128.000 tokens permite procesar informes, contratos o transcripciones largas en una sola pasada, siempre que la memoria del dispositivo lo permita.
- Asistencia a la programación offline: generación y explicación de fragmentos de código en un Mac, sin enviar el código a servidores externos, con la salvedad de que la ficha no publica métricas de HumanEval.
- Prototipado con mlx-lm: integración mediante la CLI de mlx-lm para probar prompts y flujos de generación antes de incorporarlos a una aplicación Apple Silicon.
- Traducción y asistencia multilingüe ligera: apoyo en los idiomas que declara el modelo base, con rendimiento variable según el idioma y sin garantías publicadas para esta cuantización.
- Extracción y resumen de información en trabajo de campo: periodismo, investigación o entornos sin cobertura, donde la ausencia de servidor garantiza la confidencialidad de las fuentes.
- Estudio y aprendizaje asistido con privacidad: explicaciones, resúmenes y preguntas de repaso en un dispositivo personal, sin cuentas ni telemetría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en 4 bits: aproximadamente 4,5 GB, según el tamaño del repositorio.
- Memoria total estimada para inferencia: del orden de 5 a 6 GB contando pesos y caché KV (estimación a partir del tamaño de los pesos, no confirmada en la ficha).
- iPhone de 8 GB: funciona con aviso del autor, y iOS puede cerrar la aplicación en conversaciones largas por presión de memoria.
- Mac con 16 GB o más de memoria unificada: uso cómodo, según la ficha.
- Hardware compatible: Apple Silicon (familia M). El formato MLX no está pensado para GPU NVIDIA ni para CPU x86; no hay soporte CUDA en este repositorio.
- Opciones de despliegue: mlx-lm (biblioteca y CLI) y la aplicación Lantern, que comprueba la memoria del dispositivo antes de descargar. No es compatible directamente con vLLM, TGI, llama.cpp ni Ollama en su formato MLX; para esos entornos habría que recurrir a una conversión a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RabiatS/Llama-3.1-8B-Instruct-4bit-Lantern | 8,03 B | 128.000 tokens (heredado del base) | safetensors MLX 4 bits | Llama 3.1 Community | HuggingFace, orientado a Lantern |
| mlx-community/Meta-Llama-3.1-8B-Instruct-4bit | 8,03 B | 128.000 tokens | safetensors MLX 4 bits | Llama 3.1 Community | HuggingFace (origen de los pesos de este repo) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | safetensors FP16/BF16 (≈16 GB) | Llama 3.1 Community | HuggingFace (oficial, con acceso controlado) |
| Conversiones GGUF Q4_K_M de la comunidad | 8,03 B | 128.000 tokens | GGUF | Llama 3.1 Community | HuggingFace (múltiples repos) |

## Limitaciones y advertencias

- Cuantización a 4 bits: implica una pérdida de calidad frente a FP16/BF16 que la ficha no mide ni publica.
- Dependencia de Apple Silicon: el formato MLX no es portable a entornos CUDA ni a CPU x86, lo que limita su uso a Macs y dispositivos Apple.
- Memoria en iPhone: en modelos de 8 GB iOS puede terminar la aplicación durante conversaciones largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación publicada que acote este comportamiento en esta cuantización.
- Idiomas: la ficha no especifica el soporte real; el rendimiento fuera de los idiomas principales del modelo base puede degradarse.
- Licencia Llama 3.1 Community: uso sujeto a dicha licencia y a la política de uso aceptable de Meta; incluye condiciones adicionales para despliegues a gran escala (umbral de usuarios activos mensuales) que conviene revisar antes de un uso comercial.
- Repositorio espejo sin mantenimiento propio: los pesos no se modifican y no se anuncia soporte ni actualizaciones.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Conocimiento del modelo base limitado a su fecha de corte; la ficha no indica una fecha concreta y no se actualiza con datos posteriores.
- No hay decodificación especulativa ni optimizaciones de latencia documentadas para esta conversión.

## Enlaces

- HuggingFace: https://huggingface.co/RabiatS/Llama-3.1-8B-Instruct-4bit-Lantern
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Conversión MLX original: https://huggingface.co/mlx-community/Meta-Llama-3.1-8B-Instruct-4bit
- Aplicación Lantern: https://github.com/RabiatS/lantern
