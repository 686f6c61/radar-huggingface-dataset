# HauhauCS/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen/Qwen3.5-35B-A3B, desarrollada por HauhauCS. El modelo elimina los mecanismos de rechazo de peticiones del modelo original, manteniendo intactas sus capacidades técnicas. Según el autor, el modelo presenta 0 de 465 rechazos en sus pruebas internas, lo que lo convierte en una opción para escenarios que requieren generación de contenido sin restricciones.

La variante "Aggressive" es la más permisiva de la familia, ya que no rechaza ninguna petición y genera contenido completo, aunque puede añadir descargos breves heredados del entrenamiento del modelo base. Está disponible en formato GGUF con múltiples cuantizaciones y soporta entrada multimodal (texto, imagen y vídeo). Se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) híbrida: Gated DeltaNet (atención lineal) + atención softmax completa, proporción 3:1 |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | ~3B por pase forward (8 expertos enrutados + 1 experto compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M, IQ2_M (GGUF con imatrix) |
| Idiomas soportados | 201 idiomas, incluyendo inglés, chino y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repositorio base) |

## Arquitectura y entrenamiento

La arquitectura combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1, distribuida en 40 capas con un patrón de 10 repeticiones de 3 capas DeltaNet-MoE seguidas de 1 capa Attention-MoE. Esta configuración híbrida reduce el coste computacional del mecanismo de atención manteniendo la calidad en tareas que requieren recuperación precisa de información.

El modelo utiliza 256 expertos en total, de los cuales 8 se enrutan por token además de un experto compartido, lo que resulta en aproximadamente 3B parámetros activos por pase forward. Soporta multi-token prediction (MTP) y dispone de un vocabulario de 248K tokens. El proceso de "uncensoring" aplicado por HauhauCS no modifica los datos de entrenamiento ni las capacidades del modelo, sino que elimina los mecanismos de rechazo mediante técnicas de ablación de pesos (abliteration). Los cuantos GGUF se generaron con matriz de importancia (imatrix) para preservar la calidad tras la ablación.

## Capacidades

- Generación de texto sin rechazos: responde a cualquier petición sin negarse, incluyendo temas sensibles o controvertidos.
- Razonamiento con modo "thinking": el modelo incluye un modo de pensamiento activado por defecto que mejora el razonamiento complejo.
- Razonamiento sin modo "thinking": permite respuestas más directas y rápidas para tareas sencillas.
- Multimodal nativo: procesa texto, imágenes y vídeo mediante el archivo mmproj incluido en el repositorio.
- Soporte multi-token prediction (MTP): predice múltiples tokens por paso, lo que puede mejorar la velocidad de generación.
- Multilingüe: soporta 201 idiomas con un vocabulario de 248K tokens.
- Generación de código: configuraciones recomendadas específicas para tareas de programación.
- Tool calling y function calling: heredado del modelo base Qwen3.5-35B-A3B (no se especifica en la documentación, pero es una capacidad estándar de la familia Qwen3.5).

## Casos de uso

- Investigación académica sobre seguridad y alineación: el modelo permite estudiar el comportamiento de LLMs sin mecanismos de rechazo, lo que resulta útil para investigar sesgos, alucinaciones y estrategias de mitigación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativas que aborden temas tabú o controvertidos sin filtros.
- Desarrollo de personajes para juegos de rol: el modo agresivo permite interpretar personajes sin limitaciones temáticas, ideal para experiencias inmersivas.
- Análisis de documentos extensos: con 262K tokens de contexto nativo, puede procesar libros completos, informes técnicos o bases documentales amplias en una sola pasada.
- Asistencia en programación sin restricciones de contenido: generación de código para scripts de automatización, análisis de seguridad ofensiva o exploits educativos.
- Procesamiento multimodal de documentos: combinación de texto e imágenes para extraer información de capturas, diagramas o documentos escaneados.
- Despliegue en entornos con recursos limitados: gracias a la arquitectura MoE con solo 3B parámetros activos, puede ejecutarse en GPUs de consumo con cuantizaciones bajas (Q4_K_M, 20 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas comparativas (MMLU, HumanEval, GSM8K, etc.) para esta variante específica. Se recomienda consultar el repositorio base Qwen/Qwen3.5-35B-A3B para obtener datos de rendimiento del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (IQ2_M) y 65 GB (BF16), dependiendo de la cuantización.
- Cuantizaciones recomendadas por GPU:
  - RTX 4090 (24 GB): Q5_K_M (24 GB) o Q4_K_M (20 GB) con contexto reducido.
  - RTX 3090 (24 GB): Q4_K_M (20 GB) o IQ4_XS (18 GB).
  - A100 40 GB: Q6_K (27 GB) o Q8_0 (35 GB) con contexto amplio.
  - H100 80 GB: BF16 (65 GB) completo.
- GPU de consumo: sí, cabe en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp y otros runtimes compatibles con GGUF.
- Comandos de ejecución: usar `--jinja` para el chat template correcto y `-c 131072` para mantener las capacidades de razonamiento (mínimo 128K contexto).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B | ~3B | 262K | Apache 2.0 | safetensors, GGUF |
| Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B | ~3B | 262K | Apache 2.0 | GGUF |
| Qwen3.5-27B-Uncensored-HauhauCS-Aggressive | 27B | no disponible | no disponible | Apache 2.0 | GGUF |

La principal diferencia con el modelo base es la eliminación de mecanismos de rechazo. Frente a otras variantes uncensored de la misma familia (como la de 27B), esta versión añade capacidades multimodales y un contexto nativo mayor. No se dispone de datos de rendimiento comparativos entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el modelo no rechaza ninguna petición, lo que implica un riesgo elevado de generar contenido dañino, ilegal o éticamente cuestionable.
- Riesgo de alucinación: sin mecanismos de rechazo, el modelo puede afirmar información falsa con mayor confianza, especialmente en temas sensibles.
- Descargos breves: puede añadir avisos cortos heredados del entrenamiento base, aunque no afectan al contenido generado.
- Contexto mínimo recomendado: el autor recomienda mantener al menos 128K de contexto para preservar las capacidades de razonamiento, lo que limita su uso en hardware con poca VRAM.
- Uso comercial: aunque la licencia Apache 2.0 permite uso comercial, el despliegue en producción de un modelo sin censura conlleva riesgos legales y de reputación significativos.
- Cosméticos en LM Studio: puede mostrar "256x2.6B" en lugar de "35B-A3B" en la columna de parámetros, aunque el modelo funciona correctamente.
- Requiere el archivo mmproj para funcionalidad de visión; sin él, el modelo solo procesa texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HauhauCS/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Guía en HackerNoon: https://hackernoon.com/qwen35-35b-a3b-uncensored-guide-features-capabilities-and-setup
- Ficha en ThinkLLM: https://thinkllm.dev/models/qwen3-5-35b-a3b-uncensored-hauhaucs-aggressive
- Variante 27B: https://huggingface.co/HauhauCS/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive
- Comunidad Discord: https://discord.gg/SZ5vacTXYf
