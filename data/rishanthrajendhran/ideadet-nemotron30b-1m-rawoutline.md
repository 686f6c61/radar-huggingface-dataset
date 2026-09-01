# rishanthrajendhran/ideadet-nemotron30b-1m-rawoutline

## Resumen

`ideadet-nemotron30b-1m-rawoutline` es un adaptador LoRA (librería PEFT) creado por el usuario rishanthrajendhran, diseñado para la detección de contenido generado por inteligencia artificial (ai-detection). Se construye sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un LLM de NVIDIA con arquitectura híbrida Mamba-Transformer MoE de 30 000 millones de parámetros totales y 3 000 millones activos, con una ventana de contexto de 1 millón de tokens.

El adaptador añade una capa de ajuste fino específica para tareas de clasificación o identificación de texto sintético frente a texto humano. El repositorio tiene un tamaño de 3,1 GB, está en formato safetensors y su acceso está restringido (gated), por lo que requiere aceptar condiciones en Hugging Face. No se han publicado métricas, documentación técnica ni ejemplos de uso, lo que limita la evaluación objetiva del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16 (híbrida Mamba-Transformer MoE) |
| Parametros totales | No disponible (el adaptador, sobre el base de 30B) |
| Parametros activos | No disponible (el base tiene 3B activos) |
| Longitud de contexto | 1 000 000 (heredada del modelo base, no confirmada para el adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 (requiere revisión de términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, emplea una arquitectura híbrida que combina capas Mamba (state space model) con capas Transformer dentro de un esquema de mezcla de expertos (MoE). Esto permite una inferencia eficiente con solo 3 000 millones de parámetros activos por token, manteniendo una capacidad total de 30 000 millones. El contexto de 1 millón de tokens es posible gracias a mecanismos de atención optimizados para ventanas largas.

El adaptador LoRA (`ideadet-nemotron30b-1m-rawoutline`) se entrena mediante PEFT sobre este base, pero no se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, ni el proceso de ajuste (si hubo supervisión, RLHF, etc.). El nombre sugiere que se utilizó una "raw outline" (esquema crudo) como parte del pipeline de detección, aunque no hay confirmación técnica.

## Capacidades

- Detección de contenido generado por IA: el adaptador está orientado a clasificar textos como producidos por un modelo de lenguaje o por un humano.
- Hereda las capacidades lingüísticas del modelo base (generación de texto, razonamiento, código, matemáticas) si se usa junto con él, pero el propósito declarado es la detección, no la generación.
- No se ha confirmado soporte para tool calling, agentes o modos de razonamiento especiales en el adaptador.
- Capacidades multilingües no documentadas.

## Casos de uso

- Moderación de contenido en plataformas de publicación: el adaptador puede integrarse en un pipeline que analice artículos, comentarios o reseñas para identificar si fueron escritos por un humano o por una IA, ayudando a mantener políticas de transparencia.
- Verificación de originalidad académica: instituciones educativas podrían emplearlo para detectar ensayos o trabajos generados automáticamente, aunque se requiere validación con datos reales.
- Auditoría de contenido en medios: verificar si noticias o artículos de opinión han sido redactados por sistemas automáticos, especialmente en contextos de desinformación.
- Filtrado de respuestas en chatbots: distinguir entre respuestas humanas y sintéticas en entornos de atención al cliente para priorizar la intervención humana.
- Análisis forense digital: en investigaciones, determinar si un texto incriminatorio fue generado por una herramienta de IA.
- Evaluación de calidad de datasets: al preparar corpus de entrenamiento, detectar y filtrar ejemplos generados por IA que puedan sesgar modelos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, recall, F1 ni comparaciones con otros detectores de IA.

## Requisitos de hardware

- El adaptador LoRA es ligero (3,1 GB) y puede cargarse sobre el modelo base, que requiere aproximadamente 60 GB de VRAM en BF16 para los 30B parámetros (aunque solo 3B están activos).
- Para inferencia con el modelo base completo se recomienda una GPU con al menos 80 GB (A100, H100) o varias GPUs. No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantización, y no se han publicado versiones cuantizadas del adaptador.
- Opciones de despliegue: al ser PEFT LoRA, puede integrarse con bibliotecas como Transformers + PEFT, vLLM (si soporta el base) o TGI. No se ha confirmado compatibilidad con llama.cpp u Ollama.
- La latencia dependerá del modelo base; con 3B activos se espera un throughput razonable en hardware de datacenter, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para detección de IA sobre el mismo modelo base. El modelo base Nemotron-3.5-Lightning-30B-A3B se puede comparar con otros MoE como Mixtral 8x7B o Qwen2.5-MoE, pero no hay datos de rendimiento del adaptador.

| Modelo | Parametros | Contexto | Deteccion IA | Licencia |
|---|---|---|---|---|
| ideadet-nemotron30b-1m-rawoutline | Adaptador sobre 30B | 1M | Sí (sin datos) | openmdw-1.1 |
| GPTZero (propietario) | No público | No público | Sí | Comercial |
| DetectGPT (open source) | Variable | Variable | Sí | MIT |

## Limitaciones y advertencias

- No hay documentación técnica ni estudios de validación publicados; el modelo es experimental y no debe usarse en producción sin evaluación previa.
- La licencia openmdw-1.1 no es una licencia estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad.
- Riesgo de alucinación y falsos positivos/negativos en la detección de IA, especialmente en textos multilingües o con estilos variados.
- Sin información sobre sesgos, idiomas soportados ni comportamiento en dominios específicos.
- El adaptador depende del modelo base; cualquier vulnerabilidad o limitación de Nemotron-3.5-Lightning se hereda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rishanthrajendhran/ideadet-nemotron30b-1m-rawoutline
- Perfil del autor: https://huggingface.co/rishanthrajendhran
- Modelo base de NVIDIA: https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b/modelcard (página de referencia de Nemotron 3)
- GitHub del autor: https://github.com/RishanthRajendhran/
