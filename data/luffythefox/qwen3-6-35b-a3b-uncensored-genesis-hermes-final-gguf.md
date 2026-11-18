# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF es una distribución en formato GGUF de un modelo de lenguaje multimodal (image-text-to-text) derivado de la familia Qwen3.6, con arquitectura Mixture-of-Experts (MoE) de 35B parámetros totales y aproximadamente 3B activos por token. Lo publica el desarrollador independiente LuffyTheFox dentro de su proyecto "Genesis", que aplica una técnica propia de "reparación de tensores" sobre modelos ya entrenados en lugar de reentrenarlos. El modelo parte del base no censurado de HauhauCS (Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive) y le transfiere bloques de un finetune orientado a uso agéntico (Hermes) sobre el dataset hermes-function-calling-v1.

La propuesta de valor es doble: por un lado, un modelo de 35B totales que solo activa ~3B por token, lo que reduce el coste computacional de inferencia frente a un denso equivalente; por otro, una variante "uncensored" con soporte declarado de tool calling y flujo agéntico, orientada a despliegues locales. El autor afirma que el base alcanza 0/465 refusals en su evaluación propia, aunque no se aportan detalles metodológicos de esa medición.

Es relevante ahora porque combina tres tendencias del ecosistema open source: arquitecturas MoE eficientes, cuantizaciones GGUF con imatrix para ejecución en hardware de consumo y modelos "sin censura" para pipelines de agentes que requieren baja tasa de rechazos. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, si bien conviene verificar la trazabilidad de licencias de todos los modelos base encadenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) derivada de Qwen3.6; pipeline image-text-to-text (multimodal) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B (denominación A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con perfiles imatrix (niveles concretos no disponibles) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 131,2 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas MoE, heredado del base Qwen3.6-35B-A3B, que activa un subconjunto reducido de expertos por token (aproximadamente 3B parámetros activos sobre 34,7B totales). La componente multimodal (image-text-to-text) proviene del base Qwen3.6. Sobre esa arquitectura, el autor no entrena ni hace finetuning convencional: aplica su método "Genesis", descrito como un algoritmo de recalibración post-entrenamiento en GGUF que opera en tres fases. Primero escanea tensores `ssm_conv1d` (asociados a memoria de contexto largo) y reequilibra las cabezas; después sustituye bloques degradados por fragmentos que mejor se ajustan a la distribución de pesos del tensor; por último aplica una SVD personalizada basada en la distribución de Marchenko–Pastur para atenuar ruido de entrenamiento, excluyendo `token_embd.weight`, `output.weight`, tensores 1D, biases y normas.

La transferencia de capacidades Hermes se realiza copiando aproximadamente 2.000 bloques desde dos tensores de expertos FFN de un finetune previo (DJLougen/hermes-qwen3.5-35b-a3b-GGUF, entrenado sobre NousResearch/hermes-function-calling-v1) al base no censurado de HauhauCS. No se documentan en la información disponible el número de tokens de entrenamiento original, la composición del dataset del base, ni si hubo RLHF/DPO. El autor ejecuta el proceso en Google Colab gratuito con GPU Tesla T4, lo que da una idea de la escala real del trabajo de calibración (no de entrenamiento).

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas (etiqueta "multilingual").
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con entrada visual junto a prompts textuales.
- Tool calling / function calling, reforzado por la transferencia de bloques del finetune sobre hermes-function-calling-v1.
- Flujo agéntico y razonamiento multi-paso (etiquetas "agentic" y "hermes").
- Modo "uncensored": el autor declara 0/465 refusals en el modelo base, orientado a reducir rechazos en dominios sensibles o creativos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) para despliegue vía infraestructura de inferencia estándar.
- No se documentan capacidades de audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede encadenar llamadas a funciones (APIs, bases de datos, shell) aprovechando el ajuste Hermes sobre hermes-function-calling-v1; adecuado para orquestadores que necesitan baja tasa de rechazo en tareas operativas.
- Automatización de soporte técnico multi-turno: conversaciones largas en inglés o chino con contexto conversacional, desplegable en local para no enviar datos sensibles a terceros.
- Análisis de documentos con imagen: al ser image-text-to-text, permite extraer información de capturas, diagramas o formularios combinándolos con instrucciones textuales.
- Generación de código asistida en pipelines internos: integrable vía GGUF en herramientas tipo llama.cpp/Ollama para autocompletado y refactorización, con la ventaja de los ~3B parámetros activos por token en latencia.
- Investigación sobre calibración de modelos: el modelo sirve como caso de estudio del método Genesis (reducción de ruido vía Marchenko–Pastur) para quienes evalúan técnicas de post-procesado de tensores.
- Contenido creativo sin filtros restrictivos: escritura de ficción, guiones o role-play donde los rechazos de modelos alineados estándar resultan limitantes, asumiendo la responsabilidad de moderación por parte del operador.
- Despliegue en hardware de consumo: las cuantizaciones GGUF con imatrix permiten ejecución local en estaciones con GPU de gama alta consumer, útil para prototipado sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta la métrica propia "0/465 refusals" del modelo base, sin detallar el conjunto de prompts ni el criterio de evaluación, por lo que no constituye un benchmark comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de ~34,7B en GGUF requiere del orden de 20-24 GB en cuantización de 4 bits, 35-40 GB en 8 bits y ~70 GB en FP16; estas cifras son estimaciones por parámetros, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, serían adecuadas A100 40/80 GB, H100, RTX 4090 (24 GB, ajustada en 4 bits) y GPUs de 48 GB como A6000 para cuantizaciones mayores.
- ¿Cabe en GPU consumer? Probablemente en RTX 4090/3090 (24 GB) con cuantizaciones agresivas de 4 bits; en 16 GB no es viable sin offloading a RAM/CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere soporte en plataformas de endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para esta build GGUF.
- Latencia y throughput: no disponibles. El ratio de ~3B parámetros activos por token debería reducir el coste por token frente a un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes (este) | ~34,7B | ~3B | no disponible | Apache 2.0 | GGUF, multimodal, uncensored, ajuste Hermes |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | ~34,7B | ~3B | no disponible | no disponible en la información | Base no censurado, 0/465 refusals declarados |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF (fuente del finetune) | ~35B | ~3B | no disponible | no disponible en la información | Finetune Hermes sobre generación 3.5 |
| Qwen3.6-35B-A3B (modelo original de la familia) | ~35B | ~3B | no disponible | no disponible en la información | Referencia de arquitectura MoE |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks públicos: no hay MMLU, HumanEval, GSM8K ni evaluaciones de alucinación, lo que impide validar las afirmaciones de calidad del autor.
- Método Genesis no revisado por pares: la "reparación de tensores" con SVD y Marchenko–Pastur es una técnica propietaria del autor, sin validación externa ni paper publicado; los beneficios declarados (menos ruido, mejor seguimiento de instrucciones) no están contrastados.
- Modelo "uncensored": la baja tasa de rechazos implica mayor probabilidad de generar contenido dañino, sesgado o ilegal; requiere moderación externa en producción.
- Trazabilidad de licencias: aunque la tarjeta declara Apache 2.0, el modelo encadena base HauhauCS + finetune DJLougen; conviene verificar que toda la cadena sea compatible con uso comercial.
- Idiomas: solo en, zh y "multilingual" genérico; el rendimiento en castellano no está documentado y probablemente sea inferior al de inglés/chino.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar aplicaciones de contexto largo con garantías.
- Cuantizaciones GGUF: la calidad puede degradarse frente al modelo en precisión completa; el repo de 131,2 GB contiene múltiples variantes sin documentación detallada de cada una.
- Mantenimiento: proyecto de un autor individual con financiación por donaciones; riesgo de falta de soporte a largo plazo.
- Sin datos de latencia/throughput: la ventaja teórica del MoE (~3B activos) no está cuantificada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantización con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Distribución de Marchenko–Pastur (referencia del método): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
