# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF es una distribución en formato GGUF publicada por el usuario independiente LuffyTheFox dentro de su proyecto Genesis. No se trata de un modelo entrenado desde cero, sino de una intervención sobre el modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, al que se le han transferido bloques de un finetune orientado a uso agéntico (DJLougen/hermes-qwen3.5-35b-a3b-GGUF) y se le ha aplicado un proceso propietario de "reparación de tensores" denominado Genesis.

El modelo parte de una arquitectura Mixture of Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí el sufijo A3B), lo que lo sitúa en la categoría de MoE de gran tamaño con coste de inferencia contenido. La pipeline declarada es image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto, aunque la información disponible no detalla la arquitectura del encoder visual.

Su relevancia actual radica en tres factores: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, el formato GGUF con cuantizaciones imatrix facilita el despliegue en hardware de consumo, y la orientación explícita a casos de uso agénticos con function calling (dataset NousResearch/hermes-function-calling-v1) lo posiciona para pipelines de agentes. El autor declara 0 rechazos sobre 465 prompts de prueba en el modelo base, lo que define su perfil como "uncensored".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal image-text-to-text |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | ~3.000 millones (sufijo A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF con perfiles imatrix (niveles concretos no disponibles) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 131,2 GB) |

## Arquitectura y entrenamiento

El modelo es un MoE derivado de la familia Qwen3.6, con 34.660 millones de parámetros totales y aproximadamente 3.000 millones activos por token. La pipeline image-text-to-text indica soporte de entrada multimodal (imagen y texto), aunque la información disponible no especifica el encoder visual ni el mecanismo de fusión. El autor menciona tensores `ssm_conv1d` en su descripción del proceso Genesis, lo que sugiere componentes de tipo state space o convolucionales para memoria de contexto largo, pero no se confirma la arquitectura híbrida exacta.

El entrenamiento original corresponde al modelo base de HauhauCS, del que no se detallan tokens de entrenamiento ni composición del dataset. Sobre esa base, LuffyTheFox transfiere aproximadamente 2.000 bloques procedentes de dos tensores de expertos FFN del finetune Hermes de DJLougen, alineado con el dataset NousResearch/hermes-function-calling-v1. Posteriormente aplica el método Genesis: un escaneo y "reparación" de tensores en tres etapas (balanceo de cabezas en `ssm_conv1d`, sustitución de chunks nulos por chunks que mejor se ajustan a la distribución del tensor, y reducción de ruido mediante SVD custom basado en la distribución de Marchenko–Pastur, excluyendo `token_embd.weight`, `output.weight`, tensores 1D, bias y norms). No hay información sobre RLHF o DPO en el proceso descrito.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas.
- Procesamiento de entrada multimodal imagen-texto (pipeline image-text-to-text).
- Function calling y tool use, reforzado por el dataset Hermes de function calling.
- Uso agéntico y razonamiento multi-paso, según los tags `agentic` y `hermes`.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, pero esperable por la familia base Qwen3.6.
- Perfil "uncensored": el autor reporta 0 rechazos sobre 465 prompts en el modelo base.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Agentes autónomos con tool calling: el modelo está afinado sobre el dataset Hermes de function calling y etiquetado como agéntico, por lo que puede encadenar llamadas a herramientas en flujos multi-paso con salida estructurada.
- Asistentes conversacionales sin filtros de rechazo: el perfil uncensored (0/465 rechazos reportados) lo hace adecuado para entornos de investigación donde se necesita estudiar el comportamiento del modelo sin capas de rechazo.
- Procesamiento de documentos con imágenes: al aceptar entrada image-text-to-text, puede extraer información de capturas, diagramas o formularios combinándola con texto.
- Despliegue local en hardware de consumo: el formato GGUF con cuantizaciones imatrix permite ejecutar el modelo en GPUs consumer mediante llama.cpp u Ollama, útil para prototipado offline y privacidad de datos.
- Aplicaciones multilingües inglés-chino: los idiomas declarados cubren los dos principales mercados técnicos, permitiendo asistentes bilingües.
- Investigación sobre calibración de tensores: el modelo sirve como referencia reproducible del método Genesis para estudiar el efecto de la reducción de ruido en tensores sobre la estabilidad y la verbosidad.
- Backend de agentes en pipelines de CI/CD: la compatibilidad con endpoints y el soporte de function calling permiten integrarlo como servicio en orquestadores de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo completo ocupa 131,2 GB, pero las cuantizaciones GGUF concretas y sus tamaños no se detallan. Para un MoE de 34,7B totales, las cuantizaciones Q4 rondarían típicamente los 18-22 GB, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible en la documentación. El autor menciona que el proceso Genesis se ejecutó en una Tesla T4 gratuita de Google Colab, lo que indica que la manipulación de tensores es viable en 16 GB de VRAM, pero no equivale a requisitos de inferencia del modelo completo.
- GPU consumer: probable en configuraciones de 24 GB (RTX 4090) o 16 GB (RTX 4080) con cuantizaciones agresivas, aunque sin confirmación oficial.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. Los tags indican `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10 | 34,7B | ~3B | No disponible | Apache 2.0 | GGUF |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | 34,7B | ~3B | No disponible | No disponible | No disponible |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF (fuente del finetune) | ~35B | ~3B | No disponible | No disponible | GGUF |

La comparativa se limita a los modelos directamente relacionados en la información disponible; no se dispone de datos de rendimiento comparado con alternativas de otros autores.

## Limitaciones y advertencias

- El método Genesis es una intervención no validada por pares: la afirmación de que "repara la pureza de la señal" mediante SVD y la distribución de Marchenko–Pastur no cuenta con evaluación independiente en la información disponible.
- El modelo es uncensored: no aplica filtros de rechazo, lo que implica riesgo de generar contenido dañino, ilegal o sesgado sin salvaguardas; no es apto para despliegues de cara al público sin capas adicionales de moderación.
- Riesgo de alucinación: el propio autor identifica la verbosidad y las alucinaciones como problemas que el método pretende mitigar, pero no aporta métricas que lo demuestren.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Idiomas limitados a inglés, chino y multilingüe genérico; el rendimiento en castellano no está evaluado.
- La transferencia de bloques entre modelos distintos (Qwen3.5 → Qwen3.6) es una técnica no estándar que puede introducir inconsistencias internas no detectadas por el autor.
- Aunque la licencia es Apache 2.0, el modelo base y el finetune de origen no declaran licencia en la información disponible, lo que conviene verificar antes de un uso comercial.
- El repositorio incluye llamadas a donaciones y datos de contacto del autor; no afecta al uso técnico pero conviene tratarlo como fuente no oficial.

## Enlaces

- Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: NousResearch/hermes-function-calling-v1
- Script de cuantización con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Distribución de Marchenko–Pastur (referencia del método): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
