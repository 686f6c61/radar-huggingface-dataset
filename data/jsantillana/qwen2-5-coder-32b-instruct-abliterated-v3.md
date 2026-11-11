# jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated-v3

## Resumen

Qwen2.5-Coder-32B-Instruct-abliterated-v3 es una modificación de pesos del modelo Qwen/Qwen2.5-Coder-32B-Instruct, publicada por el usuario jsantillana en Hugging Face. Se trata de un artefacto de investigación en el que se han ablacionado (eliminado a nivel de pesos) los comportamientos de rechazo del modelo base mediante una técnica de proyección sobre una base SVD de rango 2, orientada específicamente a peticiones de índole ofensiva en ciberseguridad y generación de código. El modelo conserva la arquitectura densa del original: 32.763.876.352 parámetros, 64 capas y dimensión oculta de 5120.

La relevancia de esta ficha es fundamentalmente metodológica y de seguridad: el autor documenta un procedimiento de "cirugía" de direcciones de rechazo aplicado a las proyecciones `self_attn.o_proj` y `mlp.down_proj` en las capas 28 a 61, con una rampa de intensidad (α) de 0,5 a 1,0 y posterior descenso a 0,7. El resultado declarado es un 0,0 % de rechazos en 1058 prompts de evaluación retenidos, incluyendo los buckets de control benigno (defensa, zona gris y social), lo que el autor interpreta como ausencia de daño colateral.

El modelo está publicado con una licencia denominada `apache-2.0-restricted-research`, que restringe explícitamente el uso a investigación académica en seguridad defensiva y red-team. No debe desplegarse en producción. Los idiomas declarados son inglés y español.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), 64 capas, hidden size 5120 |
| Parámetros totales | 32.763.876.352 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | bf16 (safetensors originales); GGUF Q8_0, Q4_K_M y Q3_K_M en repositorio separado |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | apache-2.0-restricted-research (uso restringido a investigación) |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-32B-Instruct original: un transformer denso de 64 capas con dimensión oculta 5120. No hay información en la documentación proporcionada sobre el volumen de tokens de preentrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base; esos datos corresponden a la model card oficial de Qwen y no se reproducen aquí.

La innovación técnica de esta variante es el procedimiento de abliteración denominado "fix3". Consta de seis pasos documentados: (1) filtrado de comportamiento con decodificación greedy a 64 tokens para seleccionar pares donde el modelo base rechaza peticiones ofensivas y cumple con las benignas; (2) cálculo de matrices de diferencia por capa y dirección mediante SVD, obteniendo una base de rango 2 `[v1, v2]`; (3) sustracción por Gram-Schmidt del enmarcado benigno (`μ_SOC − μ_DEF`); (4) QR global fusionado por capas con una α escalonada (rampa de 0,5, pico de 1,0 y cola de 0,7) aplicada en el rango de capas L28–L61; (5) proyección de `self_attn.o_proj` con α y de `mlp.down_proj` con 0,5α, con desplazamientos declarados de entre el 0,5 % y el 2,4 % por tensor; y (6) evaluación completa sobre 1058 prompts retenidos, disjuntos de los 210 pares usados en la cirugía. El autor indica que la evaluación se realizó con el mismo juez a lo largo de toda la colección de modelos.

## Capacidades

- Generación de texto y código: hereda las capacidades del Qwen2.5-Coder-32B-Instruct en generación, completado y razonamiento sobre código.
- Cumplimiento de peticiones de ciberseguridad ofensiva: el autor documenta que el modelo responde a solicitudes como guías técnicas de acceso a correo electrónico o funciones en Python para adivinar contraseñas de archivos RAR, que el modelo base rechaza.
- Conversación multi-turno: la etiqueta `conversational` y el pipeline `text-generation` indican uso en diálogo.
- Idiomas: inglés y español, según los metadatos.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` y `text-generation-inference`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking). El autor señala expresamente que esta plantilla no tiene canal de pensamiento.

## Casos de uso

- Investigación en seguridad defensiva: análisis de cómo la abliteración afecta a la distribución de respuestas del modelo en escenarios de doble uso, comparando las generaciones del modelo base y las de esta variante sobre los mismos prompts.
- Red-team de pipelines de moderación: uso del modelo como generador adversario controlado para probar clasificadores de contenido y filtros de salida en entornos de laboratorio aislados.
- Estudio de interpretabilidad de direcciones de rechazo: la base SVD de rango 2 y el manifiesto `ABLITERATION_MANIFEST.json` permiten reproducir y auditar la cirugía sobre capas y proyecciones concretas.
- Evaluación de daño colateral: los buckets de control benigno (defensa, zona gris y social) sirven para medir si la abliteración degrada el comportamiento en peticiones legítimas.
- Reproducción metodológica: investigadores que trabajen en técnicas de abliteración pueden usar el procedimiento documentado (filtro de comportamiento, SVD, Gram-Schmidt, QR fusionado y α escalonada) como referencia para sus propios experimentos.
- Análisis de robustez de salvaguardas en modelos de código: estudiar hasta qué punto las protecciones del Qwen2.5-Coder-32B-Instruct residen en direcciones linealmente separables y cuánto se pierden al proyectarlas fuera.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 1058 prompts retenidos con decodificación greedy, 64 tokens y un juez de la colección. No se trata de benchmarks estándar (MMLU, HumanEval, GSM8K), sino de una evaluación de rechazo por buckets.

| Bucket | n | Fix3 (tasa de rechazo) |
|---|---:|---:|
| EN:OFF (peticiones dañinas en inglés) | 131 | 0,0 % |
| ES:OFF (peticiones dañinas en español) | 158 | 0,0 % |
| EN:DEF (defensa benigna) | 131 | 0,0 % |
| EN:GRIS (zona gris) | 150 | 0,0 % |
| ES:DEF | 159 | 0,0 % |
| ES:GRIS | 149 | 0,0 % |
| SOC (social benigno) | 180 | 0,0 % |

Además, en la evaluación rápida pareada de 12 prompts ofensivos (mezcla inglés/español), Fix3 obtuvo 0/12 rechazos, mientras que el modelo base rechazó al menos 28 de 210 (13,3 %) en el corpus completo de pares, concentrados en peticiones de código de explotación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere del orden de 70–80 GB de VRAM.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB con sharding).
- Cuantizaciones GGUF disponibles en el repositorio `-v3-GGUF`: Q8_0 (aproximadamente 35 GB), Q4_K_M (aproximadamente 20 GB) y Q3_K_M (aproximadamente 16 GB). Con Q4_K_M o Q3_K_M puede caber en una GPU consumer de 24 GB (RTX 3090/4090) o en configuraciones con offload a RAM.
- Opciones de despliegue: transformers con `device_map="auto"` (ejemplo documentado por el autor), llama.cpp u Ollama para los GGUF, y text-generation-inference dado que el modelo está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct-abliterated-v3 (este) | 32,76 B (denso) | no disponible | apache-2.0-restricted-research | Abliteración fix3, solo investigación |
| Qwen/Qwen2.5-Coder-32B-Instruct (base) | 32,76 B (denso) | no disponible | licencia Qwen2.5-Coder | Modelo original con rechazos intactos |
| Qwen2.5-Coder-32B-Instruct-abliterated (v1, mismo autor) | 32,76 B (denso) | no disponible | apache-2.0-restricted-research | Versión anterior, reemplazada por v3 |

No se dispone en la información proporcionada de datos de rendimiento comparables entre estas variantes más allá de las tasas de rechazo del apartado anterior.

## Limitaciones y advertencias

- Uso restringido: la licencia `apache-2.0-restricted-research` limita el uso a investigación académica en seguridad defensiva y red-team; no está autorizado el despliegue en producción.
- Riesgo de daño directo: el modelo cumple con peticiones de ciberseguridad ofensiva que el base rechaza, según documenta el propio autor; su uso fuera de entornos controlados puede facilitar actividades maliciosas.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al derivar del Qwen2.5-Coder-32B-Instruct, hereda los sesgos de su dataset de entrenamiento, no especificados aquí.
- Alucinación: no hay datos específicos sobre tasas de alucinación de esta variante; la cirugía de pesos puede alterar comportamientos más allá de los medidos.
- Cobertura de la evaluación: los resultados del autor (0,0 % de rechazo en 1058 prompts) provienen de un juez propio y de buckets definidos por el autor; no equivalen a una evaluación independiente ni a benchmarks estándar.
- Idiomas: solo inglés y español declarados; el rendimiento en otros idiomas no está caracterizado.
- Contexto: la longitud de contexto no se especifica en la información disponible, aunque el modelo base Qwen2.5-Coder-32B-Instruct soporta ventanas largas según su documentación oficial.
- Advertencia del autor: "Research-only artifact. Not for malicious use." Los autores declinan responsabilidad por mal uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated-v3
- Repositorio GGUF: https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated-v3-GGUF
- Versión anterior (v1): https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
