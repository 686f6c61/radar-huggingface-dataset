# IFM/K2-Horizon-3.7B-GGUF

## Resumen

K2-Horizon-3.7B es un modelo de lenguaje denso, de código abierto, desarrollado por IFM (MBZUAI-IFM) como el miembro pequeño de la familia K2-Horizon. Está diseñado para ofrecer un rendimiento competitivo en tareas de agente, codificación y razonamiento con un tamaño reducido, manteniendo una ventana de contexto nativa de 524 288 tokens (512K). Este repositorio contiene las versiones cuantizadas en formato GGUF, listas para usar con `llama.cpp` y herramientas compatibles, lo que facilita su despliegue en entornos con recursos limitados.

El modelo destaca por su apertura total: los datos de entrenamiento, el código de entrenamiento y los recursos de evaluación son públicos, lo que permite estudiar su comportamiento a lo largo del entrenamiento mediante checkpoints intermedios. Con 3,7 mil millones de parámetros (5,06 mil millones en total, incluyendo embeddings), se posiciona como una alternativa ligera a modelos más grandes, especialmente útil en escenarios donde la latencia y el consumo de memoria son críticos.

La relevancia actual de K2-Horizon-3.7B radica en su combinación de contexto ultra largo y tamaño compacto, algo poco común en modelos de esta escala. Su licencia Apache 2.0 y su compatibilidad con el ecosistema `llama.cpp` lo hacen atractivo para investigación y producción en entornos edge o con GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only, transformer denso |
| Parametros totales | 5 058 255 360 (5,06B) |
| Parametros activos | 3,7B (parámetros del núcleo, sin embeddings) |
| Longitud de contexto | 524 288 tokens (512K) |
| Tipos de cuantizacion | GGUF (BF16 original; cuantizaciones disponibles en el repo) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repo), safetensors (modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso, sin mezcla de expertos (MoE). El modelo tiene 3,7 mil millones de parámetros en su núcleo, aunque el peso total en safetensors alcanza los 5,06 mil millones, probablemente debido a los embeddings de gran tamaño necesarios para soportar el vocabulario y el contexto extendido. No se especifican detalles sobre el mecanismo de atención (si es lineal, flash attention, etc.), pero la ventana de 512K sugiere el uso de técnicas de atención eficiente en memoria.

El entrenamiento se divide en dos fases principales, con datasets públicos de IFM: `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`. La fase de midtraining es donde se activa la ventana de contexto nativa de 512K. No se menciona explícitamente el uso de RLHF o DPO, pero los benchmarks de razonamiento y codificación sugieren un ajuste fino supervisado o similar. El proyecto libera checkpoints intermedios para estudiar la evolución de las capacidades a lo largo del entrenamiento.

## Capacidades

- Generación de texto en inglés con fluidez y coherencia.
- Razonamiento lógico y matemático básico (evaluado en benchmarks como GSM8K o similares).
- Generación de código en múltiples lenguajes, con soporte para herramientas de programación.
- Capacidades de agente: puede seguir instrucciones multi-paso y usar herramientas externas (tool calling).
- Ventana de contexto de 512K tokens, ideal para documentos largos, conversaciones extensas o análisis de código completo.
- Compatible con chat templates de `llama.cpp` y pipelines de `transformers`.

## Casos de uso

- **Análisis de documentos extensos**: gracias a sus 512K tokens de contexto, puede procesar libros completos, expedientes legales o informes técnicos sin truncamiento, extrayendo información relevante o resumiendo secciones específicas.
- **Asistente de programación en IDE**: integrado como autocompletado o chat en editores como VS Code, puede generar funciones, explicar código heredado o refactorizar módulos completos, aprovechando el contexto largo para entender el proyecto.
- **Automatización de atención al cliente**: con su capacidad de razonamiento multi-turno y tool calling, puede gestionar conversaciones complejas, consultar bases de conocimiento externas y escalar casos a humanos cuando sea necesario.
- **Agentes autónomos ligeros**: al ser un modelo pequeño, puede ejecutarse en servidores de bajo coste o en edge devices, permitiendo agentes de automatización de tareas (como gestión de correos o calendarios) con razonamiento multi-paso.
- **Análisis de logs y depuración**: puede leer grandes volúmenes de logs de sistema o errores de aplicación, identificar patrones y sugerir soluciones, gracias a su contexto largo y capacidad de razonamiento.
- **Generación de documentación técnica**: a partir de código fuente o especificaciones, puede redactar documentación coherente y estructurada, manteniendo el contexto de todo el proyecto.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparando K2-Horizon-3.7B con modelos como Qwen3.5-4B, G9v3-3B, Granite 4.2-3B y Nemotron 3 Nano-4B, en tareas de agente, codificación y razonamiento. Sin embargo, la tabla proporcionada está incompleta y no se pueden extraer los valores numéricos. No se dispone de datos adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para el modelo en BF16 (5,06B parámetros), se necesitan aproximadamente 10 GB de VRAM solo para los pesos. Con cuantizaciones GGUF comunes:
  - Q4_K_M: ~3 GB de VRAM.
  - Q5_K_M: ~3,7 GB de VRAM.
  - Q8_0: ~5,3 GB de VRAM.
- **GPU recomendadas**: una RTX 3060 de 12 GB o superior puede ejecutar cuantizaciones Q8 o inferiores. Para BF16 completo, se recomienda una GPU con al menos 12 GB (RTX 4070, A10, etc.).
- **Compatibilidad con consumer GPU**: sí, cuantizaciones Q4 y Q5 caben en GPUs de 6-8 GB, como RTX 2060 o GTX 1660 Super.
- **Opciones de despliegue**: `llama.cpp` (con el fork de MBZUAI-IFM para soporte de arquitectura), Ollama (si se añade el modelo), y `transformers` con `vLLM` o `TGI` para entornos de producción.
- **Latencia y throughput**: no se han publicado datos específicos. En una RTX 4090, se espera una generación de 20-40 tokens/s con cuantización Q4, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| K2-Horizon-3.7B | 3,7B (núcleo) | 512K | Denso | Apache-2.0 | GGUF, safetensors |
| Qwen3.5-4B | 4B | no disponible | Denso | Apache-2.0 | safetensors, GGUF |
| G9v3-3B | 3B | no disponible | Denso | no disponible | no disponible |
| Granite 4.2-3B | 3B | no disponible | Denso | no disponible | no disponible |
| Nemotron 3 Nano-4B | 4B | no disponible | Denso | no disponible | no disponible |

No se dispone de información detallada sobre los modelos comparables en la documentación proporcionada. La ventaja principal de K2-Horizon-3.7B es su contexto nativo de 512K, muy superior a lo habitual en esta escala.

## Limitaciones y advertencias

- **Modelo pequeño**: a pesar de su buen rendimiento en benchmarks, puede fallar en tareas que requieren una capacidad de razonamiento profunda o conocimiento enciclopédico, donde los modelos más grandes son superiores.
- **Idioma limitado**: entrenado principalmente en inglés, su rendimiento en otros idiomas puede ser deficiente o producir respuestas incoherentes.
- **Riesgo de alucinación**: como todos los LLM, puede generar información falsa o inventada, especialmente en contextos largos o temas especializados.
- **Soporte de arquitectura en desarrollo**: el soporte de la arquitectura K2-Horizon en `llama.cpp` está en un fork de MBZUAI-IFM, aún no integrado en la rama principal. Es necesario usar ese fork o esperar a la integración.
- **Sesgos potenciales**: no se han publicado evaluaciones de sesgo o toxicidad. Al ser un modelo entrenado con datos abiertos, puede reflejar sesgos presentes en esos datos.
- **Licencia y uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de los datasets de entrenamiento para evitar problemas de atribución.

## Enlaces

- Repositorio GGUF: https://huggingface.co/IFM/K2-Horizon-3.7B-GGUF
- Modelo base (presumiblemente): https://huggingface.co/IFM/K2-Horizon-3.7B (no verificado)
- Fork de llama.cpp con soporte K2-Horizon: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Datasets de entrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data y https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
