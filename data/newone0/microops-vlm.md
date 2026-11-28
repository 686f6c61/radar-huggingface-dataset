# Newone0/MicroOps-VLM

## Resumen

MicroOps-VLM es un modelo de lenguaje y visión (VLM) de dominio específico, desarrollado por el usuario Newone0 y publicado en Hugging Face bajo licencia Apache 2.0. Con 9,46 millones de parámetros, se presenta como una demostración educativa de arquitectura construida y entrenada al 100 % desde cero sobre una única GPU NVIDIA T4 (nivel gratuito de Google Colab). Su propósito no es competir con modelos generalistas, sino mostrar cómo un modelo multimodal compacto puede inspeccionar paneles de telemetría de servidores en imágenes RGB de 64x64, seguir políticas definidas en un system prompt y emitir llamadas a herramientas en JSON estricto.

El modelo combina un backbone de lenguaje causal de 6 capas con un codificador visual convolucional de 5 capas que proyecta cada imagen en 16 embeddings de parche. Todo ello opera dentro de una ventana de contexto de 768 tokens, con un tokenizador propio byte-level de 288 entradas que incluye 18 tokens de control estructurados. La relevancia de esta ficha es acotada: sirve como referencia de arquitectura y como ejemplo de entrenamiento end-to-end en hardware modesto, no como candidato para despliegues en producción.

La evaluación publicada por el autor sobre 50 muestras no vistas reporta una tasa de JSON válido del 100 % y una precisión exacta en el primer turno del 100 %, con una pérdida de validación de 0,0009. Estos números deben interpretarse en el contexto de un dataset sintético y un dominio muy restringido, no como indicadores de capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal: backbone LLM de 6 capas (d_model=320, n_heads=8, d_ff=864, RMSNorm, SwiGLU, SDPA) + codificador visual CNN de 5 capas con GroupNorm y proyector MLP |
| Parametros totales | 9.457.152 (embedding de tokens y LM head con pesos atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 768 tokens (RoPE) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (tokenizador byte-level UTF-8, sin lista de idiomas declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El backbone de lenguaje es un transformer causal de 6 capas con dimensión de modelo 320, 8 cabezas de atención, dimensión feed-forward de 864, normalización RMSNorm, activación SwiGLU y atención mediante PyTorch SDPA. Las posiciones se codifican con Rotary Position Embeddings (RoPE) sobre una ventana de 768 tokens. El tokenizador es propio, byte-level UTF-8, con un vocabulario de 288 entradas que incluye 18 tokens de control estructurados, presumiblemente destinados a delimitar roles, bloques JSON y llamadas a herramientas.

El codificador visual es una CNN de 5 capas con GroupNorm que transforma paneles de telemetría RGB de 64x64 en 16 embeddings de parche, los cuales se proyectan al espacio del modelo mediante un MLP. El entrenamiento se realizó íntegramente desde cero en una NVIDIA T4 (Colab gratuito) sobre paneles sintéticos de telemetría y prompts de operaciones cloud. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles.

## Capacidades

- Generación de texto y razonamiento de dominio restringido orientado a operaciones cloud (SRE).
- Comprensión de imágenes: inspección de paneles de telemetría sintéticos en RGB de 64x64.
- Salida estructurada en JSON estricto, con modo JSON declarado en las etiquetas del repositorio.
- Tool calling y function calling: emisión de llamadas a herramientas como `restart_service`, `scale_cluster`, `create_ticket` y `query_metrics`.
- Seguimiento de políticas definidas en el system prompt.
- Soporte de conversación multi-turno dentro de la ventana de 768 tokens.
- Capacidades multilingües: no disponible; el tokenizador es byte-level pero no se declara cobertura idiomática.
- No dispone de modo de razonamiento extendido, audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Demostración educativa de arquitectura VLM: el modelo sirve para ilustrar cómo se compone un backbone transformer con un codificador visual convolucional y un proyector MLP, y cómo se entrena todo ello desde cero en una GPU de gama de consumo profesional (T4).
- Prototipado de agentes SRE en entornos simulados: permite experimentar con bucles de decisión que leen un panel de telemetría y emiten una llamada a herramienta en JSON, sin riesgo sobre infraestructura real.
- Validación de pipelines de salida estructurada: su tasa declarada del 100 % de JSON válido en el conjunto de evaluación lo hace útil como banco de pruebas para parsers y validadores de esquemas en CI.
- Investigación sobre tokenizadores compactos: el vocabulario de 288 entradas con tokens de control estructurados es un caso de estudio para diseños de tokenizador orientados a formatos rígidos.
- Generación de datos sintéticos de entrenamiento: puede emplearse como referencia para construir pares imagen-instrucción-respuesta en dominios de operaciones, siempre sobre datos sintéticos.
- Docencia y talleres de IA: su tamaño de 9,46 M de parámetros permite ejecutarlo en CPU y analizar el flujo completo de inferencia en un cuaderno, algo inviable con modelos de miles de millones de parámetros.
- Pruebas de integración de `huggingface_hub` con código de modelado personalizado: el quickstart descarga `modeling_microops.py` y lo carga dinámicamente, lo que sirve para validar flujos de carga no estándar.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Pérdida de validación | 0,0009 | 50 muestras no vistas |
| Tasa de JSON válido | 100,0 % (50/50) | 50 muestras no vistas |
| Precisión exacta en turno 1 | 100,0 % (50/50) | 50 muestras no vistas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores proceden exclusivamente del conjunto de evaluación interno del autor sobre datos sintéticos del mismo dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32, dado el tamaño de 9,46 M de parámetros (unos 38 MB de pesos); en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: NVIDIA T4 (empleada en el entrenamiento), así como cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM; también es viable en CPU, como muestra el quickstart con `device="cpu"`.
- Opciones de despliegue: el modelo requiere código de modelado personalizado (`modeling_microops.py`) cargado mediante `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| MicroOps-VLM | 9,46 M | 768 tokens | Imagen + texto | Apache 2.0 | Dominio SRE sintético, educativo |
| SmolVLM-256M | 256 M | No disponible en esta ficha | Imagen + texto | Apache 2.0 | VLM generalista compacto |
| Moondream2 | ~1,9 B | No disponible en esta ficha | Imagen + texto | Apache 2.0 | VLM generalista de propósito general |
| Qwen2-VL-2B | ~2 B | No disponible en esta ficha | Imagen + texto | Apache 2.0 | VLM generalista multilingüe |

La comparación es asimétrica por diseño: MicroOps-VLM es dos órdenes de magnitud menor que los VLM generalistas citados y no persigue sus mismos objetivos. No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre paneles de telemetría sintéticos de 64x64 y prompts de operaciones cloud; no generaliza a fotografías naturales ni a dominios abiertos.
- No apto para control de infraestructura en producción, según advierte el propio autor.
- Ventana de contexto de 768 tokens, insuficiente para conversaciones largas o documentos extensos.
- Riesgo de alucinación no cuantificado; las métricas del 100 % proceden de un conjunto de 50 muestras del mismo dominio sintético y no son extrapolables.
- Sesgos conocidos: no documentados en la información disponible.
- Cobertura idiomática no declarada; el tokenizador byte-level no garantiza calidad multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y la naturaleza educativa del modelo desaconsejan su uso en entornos críticos.
- Requiere cargar código Python personalizado del repositorio (`modeling_microops.py`), lo que implica revisar y auditar dicho código antes de ejecutarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Newone0/MicroOps-VLM
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
