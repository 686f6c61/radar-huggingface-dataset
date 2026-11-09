# DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B

## Resumen

L3.1-Dark-Planet-SpinFire-Uncensored-8B es un modelo de lenguaje de 8.030.261.248 parámetros (aproximadamente 8B) publicado por el usuario DavidAU en Hugging Face. Se trata de un modelo derivado de la familia Llama 3.1, creado mediante técnicas de fusión de modelos (merge) con la herramienta mergekit, según indican las etiquetas del repositorio. La model card no especifica los modelos base concretos utilizados en la fusión, ya que el campo `base_model` aparece vacío.

El modelo está orientado a generación de texto conversacional y se distribuye en formato safetensors de precisión completa, pensado como fuente para generar cuantizaciones GGUF, GPTQ, EXL2, AWQ y HQQ. La denominación "Uncensored" sugiere un ajuste orientado a reducir los rechazos y filtros de seguridad típicos de los modelos alineados, si bien la documentación disponible no detalla el proceso de entrenamiento ni los datos empleados.

Es relevante en el ecosistema de modelos open source por su carácter de "modelo fusionado" de la comunidad, una práctica habitual para combinar capacidades de distintos modelos ajustados. No obstante, la información técnica publicada es escasa: no se detallan la longitud de contexto, los idiomas soportados ni la licencia, y el repositorio tiene un volumen de descargas reducido (114 descargas, 7 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.1, según etiquetas del repositorio) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, GPTQ, EXL2, AWQ, HQQ (según la model card, generables a partir de los pesos fuente) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (precisión completa) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se creó mediante mergekit, una herramienta de fusión de modelos, y que deriva de la familia Llama 3.1, por lo que su arquitectura subyacente es un transformer decoder-only con atención causal, propio de la serie Llama 3. La model card no especifica la técnica exacta de fusión empleada (por ejemplo, SLERP, TIES, DARE o linear), ni los modelos base concretos que se combinaron, ya que el campo `base_model` está vacío.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El autor remite a documentación externa sobre parámetros y samplers para el uso óptimo del modelo, pero esa información no forma parte de los datos técnicos verificables del repositorio.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y las etiquetas incluyen "conversational".
- Compatibilidad con text-generation-inference y endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Orientación "uncensored": la denominación sugiere menor tendencia a rechazar peticiones, aunque no se documenta formalmente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de texto conversacional en aplicaciones de chat: el modelo puede emplearse como motor de diálogo en asistentes conversacionales, dado su pipeline de text-generation y su orientación conversacional, aunque la ausencia de datos sobre contexto limita la planificación de conversaciones largas.
- Experimentación con modelos fusionados: investigadores interesados en estudiar el efecto de las técnicas de mergekit pueden usar este modelo como caso de estudio de fusión de modelos Llama 3.1 de 8B.
- Generación de cuantizaciones para despliegue local: al distribuirse en safetensors de precisión completa, sirve como fuente para producir versiones GGUF, GPTQ, EXL2, AWQ o HQQ adaptadas a distintos entornos de hardware.
- Prototipado rápido con text-generation-inference: la etiqueta `endpoints_compatible` permite integrarlo en infraestructuras TGI para pruebas de concepto.
- Investigación sobre alineación y filtros de seguridad: su carácter "uncensored" lo hace útil para estudiar el comportamiento de modelos con menor rechazo, siempre con las cautelas éticas correspondientes.
- Fine-tuning posterior: al estar en precisión completa, puede servir como punto de partida para ajustes finos específicos de dominio, aunque la falta de licencia clara es un obstáculo para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 16 GB solo para los pesos (8.030 millones de parámetros × 2 bytes), más overhead de activaciones y contexto.
- Cuantización a 8 bits: en torno a 8-9 GB de VRAM.
- Cuantización a 4 bits: en torno a 4,5-5,5 GB de VRAM, lo que permite su ejecución en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090.
- GPU recomendadas para precisión completa: A100, H100, o GPUs con al menos 24 GB (RTX 3090/4090) para contextos moderados.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `endpoints_compatible`), llama.cpp/Ollama a través de cuantizaciones GGUF, y otras herramientas compatibles con GPTQ, EXL2, AWQ o HQQ.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| L3.1-Dark-Planet-SpinFire-Uncensored-8B | 8,03B | no disponible | no disponible | Hugging Face (DavidAU) |
| Meta Llama 3.1 8B Instruct | 8B | 128K (según documentación oficial de Meta) | Llama 3.1 Community License | Hugging Face (meta-llama) |
| Mistral 7B Instruct | 7,2B | 32K (según documentación oficial de Mistral) | Apache 2.0 | Hugging Face (mistralai) |
| Otros merges de la comunidad basados en Llama 3.1 8B | ~8B | variable | variable | Hugging Face |

La comparación con alternativas oficiales se ve limitada por la ausencia de datos de contexto, licencia y benchmarks en la información disponible para este modelo. Los datos de Llama 3.1 8B y Mistral 7B proceden de sus respectivas documentaciones oficiales y no de la información proporcionada sobre este modelo.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, lo que supone un riesgo legal importante para producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real y la calidad en idiomas distintos del inglés.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que requieran ventanas largas sin verificación empírica.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa; la falta de benchmarks impide estimar su fiabilidad relativa.
- Carácter "uncensored": puede producir contenido inapropiado o no alineado con políticas de seguridad, lo que exige filtros adicionales en producción.
- Origen comunitario: al ser una fusión sin documentación detallada de los modelos base ni del proceso, la reproducibilidad y la trazabilidad son limitadas.
- Sesgos conocidos: no documentados en la información disponible; se heredan potencialmente los de los modelos base de Llama 3.1.
- Volumen de adopción bajo (114 descargas, 7 likes): escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B
- Repositorio GGUF del autor: https://huggingface.co/DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B-gguf
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte del autor: https://huggingface.co/DavidAU/support
