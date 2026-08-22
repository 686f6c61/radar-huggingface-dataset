# keXjos/Qwen3.8-9B-Distill-mlx-5Bit

## Resumen

El modelo `keXjos/Qwen3.8-9B-Distill-mlx-5Bit` es una conversión al formato MLX del modelo `empero-ai/Qwen3.8-9B-Distill`, una destilación comunitaria de Qwen3.8, un modelo MoE de 2,4 billones de parámetros con 95 mil millones activos. El proceso de destilación, realizado por el laboratorio independiente Empero, comprime el razonamiento del modelo gigante en un modelo denso de 9 mil millones de parámetros, entrenado sobre unas 70.000 trazas de razonamiento generadas por el profesor. Esta versión MLX, cuantizada a 5 bits, está optimizada para ejecutarse en hardware Apple Silicon (Macs con chip M-series), lo que permite desplegar un modelo de razonamiento avanzado localmente con un consumo de memoria moderado.

La relevancia de este modelo reside en su licencia Apache 2.0, que permite uso comercial sin restricciones, y en que ofrece capacidades de razonamiento y function-calling en un tamaño que cabe en equipos de consumo. Es una alternativa práctica para desarrolladores que quieren experimentar con modelos de razonamiento sin depender de servicios en la nube o GPUs de alta gama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.5-9B) |
| Parametros totales | 1.679.700.480 (según safetensors; el modelo base declara 9B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5-bit (MLX) |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo original, `empero-ai/Qwen3.8-9B-Distill`, es una destilación del modelo Qwen3.8, un MoE de 2,4 billones de parámetros con 95 mil millones activos, sobre la arquitectura densa de Qwen/Qwen3.5-9B. El proceso de destilación consistió en generar alrededor de 70.000 trazas de razonamiento (teacher traces) usando el modelo profesor, que luego se usaron para fine-tuning supervisado (SFT) del modelo estudiante. Este enfoque permite transferir capacidades de razonamiento y de function-calling del modelo grande a uno mucho más pequeño.

La versión MLX es una conversión directa de los pesos a formato MLX, realizada con `mlx-lm` versión 0.31.2, y aplicando cuantización de 5 bits para reducir el tamaño de los pesos. No se ha modificado la arquitectura ni se ha realizado ningún entrenamiento adicional en esta conversión.

## Capacidades

- Generación de texto conversacional y de instrucciones.
- Razonamiento de varios pasos (multi-step reasoning) gracias al proceso de destilación del modelo profesor.
- Soporte de function calling / tool calling, heredado del entrenamiento SFT.
- Capacidades de agente básicas, probablemente limitadas a un solo turno de razonamiento sin memoria persistente.
- Multilingüe: solo se declara inglés en los metadatos, aunque el modelo base podría tener soporte adicional no documentado.
- No se confirma soporte de visión o audio; los tags incluyen "image-text-to-text", pero no hay evidencia concreta en la documentación.

## Casos de uso

- **Asistentes de código en local**: el modelo puede generar y revisar código, y su soporte de function calling permite integrarlo en herramientas de desarrollo como editores o pipelines de CI/CD.
- **Automatización de atención al cliente**: gracias a su capacidad de seguir instrucciones y de razonar sobre problemas, puede gestionar consultas de soporte técnico de nivel básico en inglés, con respuestas coherentes y contextuales.
- **Agentes de razonamiento para investigación**: su entrenamiento en trazas de razonamiento lo hace útil para tareas de análisis de datos, generación de informes o resolución de problemas de lógica.
- **Prototipado de aplicaciones de IA**: al ser un modelo de 9B con licencia Apache 2.0, es ideal para desarrollar prototipos en entornos de producción sin costes de licencia.
- **Automatización de tareas de oficina**: puede resumir documentos, generar borradores de correos electrónicos o extraer información estructurada de texto, con la ventaja de ejecutarse localmente en un Mac.
- **Investigación en destilación y modelos pequeños**: sirve como punto de partida para estudiar técnicas de destilación y comparar rendimiento con modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible. La búsqueda web menciona que el modelo base obtiene resultados en MMLU y GSM8K, pero no se han proporcionado valores numéricos concretos. Por tanto, no se incluyen datos numéricos para evitar inventar cifras.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 6,2 GB en disco, por lo que se necesitan al menos 8 GB de memoria unificada en Apple Silicon para cargar el modelo en memoria. Con cuantización 5-bit, el consumo de VRAM se aproxima a 5-6 GB.
- **GPUs compatibles**: solo Apple Silicon (M1, M2, M3 y posteriores). No es compatible con GPUs NVIDIA o AMD.
- **Despliegue**: se usa con la librería `mlx-lm` (pip install mlx-lm). También puede integrarse en aplicaciones que soporten MLX.
- **Latencia**: no se proporcionan datos de latencia o throughput. En un Mac M2 con 16 GB de RAM, la generación típica puede ser de 10-20 tokens por segundo, pero es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-9B-Distill (MLX) | 9B (reportado) | No disponible | Apache 2.0 | MLX | No disponible |
| Qwen/Qwen3.5-9B (base) | 9B | 32K (típico) | Apache 2.0 | Transformers | No disponible |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 License | Transformers/GGUF | MMLU ~68% (referencia) |

Nota: los datos de contexto y rendimiento de los modelos alternativos son aproximados y se basan en información pública general, no en los datos de este modelo.

## Limitaciones y advertencias

- **Solo inglés**: los metadatos indican que el modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser degradado.
- **Longitud de contexto desconocida**: no se ha publicado la longitud de contexto máxima, lo que limita su uso en aplicaciones que requieren documentos muy largos.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejas.
- **Limitación de hardware**: la versión MLX solo se ejecuta en Apple Silicon; para otras plataformas es necesario usar el modelo original en formato Transformers o GGUF.
- **Sesgos**: no se han documentado sesgos específicos, pero es probable que herede los sesgos del modelo base y de los datos de destilación.
- **Producción**: aunque la licencia permite uso comercial, se recomienda validar el comportamiento en casos de uso críticos antes de desplegar en producción.

## Enlaces

- [Modelo en Hugging Face (MLX)](https://huggingface.co/keXjos/Qwen3.8-9B-Distill-mlx-5Bit)
- [Modelo base de Empero](https://huggingface.co/empero-ai/Qwen3.8-9B-Distill)
- [Versión GGUF del modelo base](https://huggingface.co/empero-ai/Qwen3.8-9B-Distill-GGUF)
- [Blog de MindStudio sobre benchmarks y setup](https://www.mindstudio.ai/blog/qwen3-8-9b-distill-empero)
- [Blog de MindStudio sobre ejecución local](https://www.mindstudio.ai/blog/qwen3-8-9b-distillation-local)
- [Sitio web de Empero](https://empero.org/)
