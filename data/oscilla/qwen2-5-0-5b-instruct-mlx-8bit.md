# Oscilla/Qwen2.5-0.5B-Instruct-mlx-8Bit

## Resumen

Oscilla/Qwen2.5-0.5B-Instruct-mlx-8Bit es una conversión al formato MLX (Apple Silicon) del modelo Qwen2.5-0.5B-Instruct, cuantizado a 8 bits. El modelo original, desarrollado por Alibaba, es un transformer decoder-only denso de 0.5 mil millones de parámetros, optimizado para instrucciones y chat. Esta conversión, realizada por el usuario Oscilla con la librería mlx-lm (versión 0.31.2), permite ejecutar el modelo de forma eficiente en hardware de Apple (M-series) y en entornos que soporten MLX.

La relevancia de esta versión radica en su tamaño compacto (apenas 0.5 GB) y su licencia Apache-2.0, lo que la hace adecuada para prototipado rápido, aplicaciones en dispositivos con recursos limitados y pruebas de concepto. Al estar cuantizado a 8 bits, reduce los requisitos de memoria sin sacrificar excesivamente la calidad de generación. El modelo base Qwen2.5 fue entrenado sobre 18 billones de tokens, lo que le otorga un conocimiento amplio en múltiples dominios, aunque su pequeño tamaño limita la profundidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 138.998.144 (0.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B-Instruct tiene una ventana de contexto de 32K tokens segun especificaciones de la serie, aunque la serie completa soporta hasta 128K) |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | Ingles (segun model card; el modelo base Qwen2.5 soporta 29 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo original Qwen2.5-0.5B-Instruct es un transformer decoder-only con arquitectura densa, sin mezcla de expertos. Fue preentrenado sobre un dataset de 18 billones de tokens (segun la documentacion de la serie Qwen2.5) y posteriormente ajustado mediante instrucciones (instruction tuning) para tareas de chat y seguimiento de instrucciones. No se han publicado detalles especificos sobre el uso de RLHF o DPO en esta version, aunque el modelo instruct de Qwen2.5 incorpora tecnicas de alineacion estandar.

La conversion a MLX se realizo con la libreria mlx-lm 0.31.2, que transforma los pesos originales de PyTorch al formato de Apple MLX y aplica cuantizacion de 8 bits. Esta cuantizacion reduce el tamano del modelo de aproximadamente 1 GB (en FP16) a 0.5 GB, manteniendo una precision aceptable para tareas de generacion de texto.

## Capacidades

- Generacion de texto en ingles, con capacidad de mantener conversaciones multi-turno gracias a su template de chat.
- Razonamiento basico y respuesta a instrucciones, heredado del modelo Qwen2.5-0.5B-Instruct.
- Soporte limitado de tool calling y function calling, dependiendo de la implementacion del modelo base (no confirmado en esta conversion).
- Capacidades multilingues reducidas: aunque el modelo base soporta 29 idiomas, la model card de esta conversion solo declara ingles.
- No incluye capacidades de vision, audio ni modo de pensamiento explicito (thinking mode).

## Casos de uso

- Prototipado rapido de chatbots: al ser un modelo pequeno y rapido, permite validar flujos conversacionales en entornos de desarrollo sin necesidad de GPUs potentes.
- Aplicaciones en dispositivos Apple: gracias al formato MLX, puede ejecutarse de forma nativa en Macs con chip M1/M2/M3, ideal para apps de escritorio o asistentes locales.
- Generacion de texto en entornos con restricciones de memoria: su cuantizacion de 8 bits y su tamano de 0.5 GB lo hacen util para edge computing o sistemas embebidos.
- Clasificacion y extraccion de entidades: puede utilizarse como base para tareas de NLP simples, como etiquetado o resumen de textos cortos.
- Educacion y experimentacion: adecuado para aprender sobre transformers y tecnicas de cuantizacion, o para probar pipelines de generacion con MLX.
- Asistencia en codigo basico: aunque no es su fuerte, puede generar fragmentos de codigo simples o autocompletar funciones en lenguajes populares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-0.5B-Instruct reporta puntuaciones en MMLU, HumanEval y GSM8K, pero no se dispone de datos especificos para esta conversion cuantizada. Se recomienda consultar la documentacion del modelo original para referencias de rendimiento, aunque la cuantizacion a 8 bits puede degradar ligeramente los resultados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.5 GB en cuantizacion de 8 bits, mas overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA T4, GTX 1650) o Apple Silicon (M1/M2/M3) con al menos 8 GB de RAM unificada.
- Cabe en GPUs de consumo: si, en GPUs con 4 GB o mas de VRAM se puede ejecutar con comodidad.
- Opciones de despliegue: mlx-lm (recomendado), tambien compatible con transformers (aunque requiere conversion), y puede desplegarse con vLLM o TGI si se convierte a formato estandar.
- Latencia: en Apple Silicon, la generacion es casi instantanea para textos cortos; en GPU, throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Oscilla/Qwen2.5-0.5B-Instruct-mlx-8Bit | 0.5B | 32K (aprox.) | Apache-2.0 | 8-bit MLX | Conversion especifica para Apple |
| Qwen2.5-0.5B-Instruct (original) | 0.5B | 32K | Apache-2.0 | FP16/BF16 | Modelo base, no cuantizado |
| Llama-3.2-1B-Instruct | 1B | 128K | Llama 3.2 | FP16 | Mas grande y con mejor razonamiento, pero mayor consumo |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | FP16 | Mejor rendimiento en razonamiento, pero mucho mas pesado |

La comparativa muestra que esta conversion es una opcion ligera y de facil despliegue en ecosistema Apple, pero inferior en capacidades a modelos de tamano similar o superior.

## Limitaciones y advertencias

- Tamano reducido: 0.5B de parametros limita la capacidad de razonamiento complejo, la coherencia en textos largos y la precision en tareas especializadas.
- Riesgo de alucinaciones: como cualquier modelo pequeno, puede generar informacion falsa o inconsistente, especialmente en dominios especializados.
- Idioma: la model card declara solo ingles; aunque el modelo base soporta otros idiomas, no se garantiza su calidad fuera del ingles.
- Contexto limitado: aunque la serie Qwen2.5 soporta hasta 128K tokens, el modelo de 0.5B tiene una ventana menor (probablemente 32K), lo que restringe conversaciones muy largas o documentos extensos.
- Cuantizacion: la conversion a 8 bits puede degradar ligeramente la calidad de generacion comparada con el modelo en FP16.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base original para cualquier derivado.
- Dependencia de MLX: el formato es especifico de Apple MLX; para otros entornos requiere conversion a formatos estandar como GGUF o safetensors de PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/Oscilla/Qwen2.5-0.5B-Instruct-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Coleccion Qwen2.5 en mlx-community: https://huggingface.co/collections/mlx-community/qwen25
- Pagina de Ollama para Qwen2.5-0.5B: https://ollama.com/library/qwen2.5:0.5b-instruct
- ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
