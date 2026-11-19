# kindlingai/glm-5.3-exlr8-k2-k3-k4

## Resumen

GLM-5.3-exlr8 (K2/K3/K4) es una cuantización del modelo GLM-5.3 de Z.ai (zai-org), un transformer de tipo Mixture-of-Experts con 744B parámetros totales, 256 expertos enrutados distribuidos en 75 capas MoE más una capa MTP (multitoken prediction) en la capa 78 y capas densas en las posiciones 0-2. La cuantización la publica kindlingai en el formato propietario exlr8 v2, diseñado específicamente para dispositivos con memoria unificada de clase NVIDIA GB10 (DGX Spark) servidos con tensor-parallel de 3 a 7.

La innovación principal del formato es que cada experto enrutado se almacena simultáneamente en tres anchuras (K2, K3 y K4) dentro del mismo codebook trellis mul1, y un perfil de anchura decide en tiempo de carga qué anchura usa cada experto. Esto permite cambiar entre once perfiles (desde `bit200` hasta `bit400`) sin descargar pesos adicionales, ajustando el equilibrio entre tamaño, calidad y memoria disponible. El repositorio ocupa 1.672,4 GB en total, pero cada perfil individual ocupa entre 199 GB y 380 GB.

El modelo resuelve el problema de desplegar un MoE de 744B en hardware de memoria unificada de gama relativamente baja, manteniendo la fidelidad respecto al BF16 original medida en KL divergence. Es relevante ahora porque el ecosistema de DXG Spark y GB10 está creciendo, y las cuantizaciones tradicionales (GGUF, AWQ, GPTQ) no están optimizadas para servir modelos MoE de este tamaño en configuraciones tensor-parallel pequeñas con memoria compartida entre CPU y GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención DSA (glm_moe_dsa); 75 capas MoE + 1 capa MTP (capa 78) + capas densas 0-2 |
| Parámetros totales | 744B (modelo base GLM-5.3) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | exlr8 v2 con codebook trellis mul1; anchuras K2, K3 y K4 por experto; redondeo E4M3 obligatorio en el loader |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (licencia `other`, enlazada al fichero LICENSE del repo) |
| Formato de pesos | safetensors (expertos, densos y vocabulario); BF16 para embedding y lm_head; configuración y tokenizer heredados del base |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con 256 expertos enrutados por capa en 75 capas MoE, más una capa de multitoken prediction (MTP) en la posición 78 y tres capas densas iniciales (0-2). La atención usa el mecanismo DSA (denominación `glm_moe_dsa` en los tags). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO, ya que la model card de esta cuantización no los detalla y no se ha proporcionado la del modelo base.

La contribución técnica de esta publicación es el formato exlr8 v2: cada experto enrutado se codifica en un codebook trellis mul1 a tres anchuras (K2, K3, K4), y los perfiles de anchura son manifiestos que indican qué anchura carga cada experto en tiempo de carga. El loader debe aplicar redondeo E4M3. El formato incluye slices de índice por rango para tensor-parallel de 3 a 7, hashes sha256 por fichero safetensors y un weight set ID (`3d1a293399f0077e27acd18609ee67f33f8e3f8b5963a7c4b42b7dc16ecd1d98`) para verificar integridad. La documentación completa del formato está en FORMAT.md del repositorio kindlingai/exlr8.

## Capacidades

- Generación de texto y conversación multiturno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y sesiones de agente con llamadas a herramientas: el test de KL propio incluye sesiones de agente con tool calls y salida de herramientas.
- Procesamiento de documentos largos: el panel de evaluación incluye documentos retenidos con base64, hashes e IDs.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.
- Compatibilidad con tensor-parallel de 3 a 7 (slices de índice incluidos en el repo).

## Casos de uso

- Despliegue de un MoE de 744B en clústeres de DGX Spark (GB10): el formato está diseñado para servir el modelo en 3-6 máquinas con memoria unificada usando el motor gr8 a TP=3 y TP=4. Es el escenario principal y para el que se midieron los perfiles.
- Ajuste dinámico de calidad frente a memoria en producción: con once perfiles entre 199 GB y 380 GB, un operador puede arrancar en `bit200` para maximizar concurrencia y subir a `bit340` o `bit400` cuando la precisión sea crítica, sin volver a descargar pesos.
- Evaluación comparativa de cuantizaciones: los perfiles publican KL divergence frente a BF16 en tres paneles (texto generado por el modelo, texto retenido en cada posición y wikitext), lo que permite medir el impacto real de cada anchura antes de comprometerse con un despliegue.
- Servicio de agente con tool calling en contexto largo: el modelo base está entrenado para sesiones de agente y el test de calidad incluye tool calls y salidas de herramientas, por lo que es adecuado para asistentes que encadenan pasos con APIs externas.
- Procesamiento de documentos técnicos y código: el panel de evaluación incluye base64, hashes e IDs, lo que sugiere robustez en tareas de extracción y manipulación de datos estructurados.
- Validación de kernels e implementaciones de loader: el repo incluye un loader de referencia en PyTorch puro (kindlingai/exlr8) y hashes por fichero, útil para verificar nuevos backends (TensorFold, MLXLR8) contra pesos conocidos.
- Investigación sobre cuantización de MoE: la estructura de tres anchuras por experto y los perfiles por capa (por ejemplo, K4 en capas 48-72 para gate/up en `bit322`) permiten estudiar la sensibilidad por capa y por tipo de peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo publica KL divergence frente a BF16 para cada perfil de anchura:

| Perfil | Bits por peso enrutado | Tamaño | Peso de expertos por caja, TP=4 / TP=3 | KL texto del modelo: media / mediana | KL texto retenido: media / mediana | KL wikitext: media / mediana |
|---|---|---|---|---|---|---|
| `bit200` | 2,00 | 199 GB | 47 / 62 GB | 0,248 / 0,0440 | 0,267 / 0,0397 | 0,367 / 0,0728 |
| `bit227` | 2,27 | 223 GB | 53 / 70 GB | 0,177 / 0,0304 | 0,236 / 0,0321 | 0,247 / 0,0427 |
| `bit240` | 2,40 | 235 GB | 56 / 74 GB | 0,146 / 0,0244 | 0,218 / 0,0270 | 0,199 / 0,0327 |
| `bit262` | 2,62 | 255 GB | 61 / 81 GB | 0,107 / 0,0163 | 0,190 / 0,0192 | 0,147 / 0,0221 |
| `bit271` | 2,71 | 263 GB | 63 / 84 GB | 0,095 / 0,0142 | 0,175 / 0,0166 | 0,133 / 0,0196 |
| `bit280` | 2,80 | 271 GB | 65 / 86 GB | 0,086 / 0,0125 | 0,166 / 0,0147 | 0,121 / 0,0175 |
| `bit300` | 3,00 | 290 GB | 69 / 92 GB | 0,071 / 0,0106 | 0,156 / 0,0131 | 0,098 / 0,0139 |
| `bit322` | 3,22 | 310 GB | 74 / 99 GB | 0,058 / 0,0088 | 0,149 / 0,0118 | 0,076 / 0,0105 |
| `bit340` | 3,40 | 326 GB | 78 / 104 GB | 0,050 / 0,0076 | 0,141 / 0,0105 | 0,065 / 0,0089 |
| `bit387` | 3,87 | 368 GB | 89 / 118 GB | 0,039 / 0,0058 | 0,125 / 0,0079 | 0,051 / 0,0068 |
| `bit400` | 4,00 | 380 GB | 92 / 122 GB | 0,038 / 0,0057 | 0,124 / 0,0079 | 0,050 / 0,0067 |

El tamaño del modelo cuenta todos los expertos enrutados y compartidos a las anchuras del perfil más 12,5 GB de pesos densos y de vocabulario. El autor advierte que estas cifras solo son comparables entre cuantizaciones medidas con el mismo test; en el panel de cuatro ventanas que usan otras model cards de GLM-5.3, el perfil `bit325` obtiene una media de 0,025.

## Requisitos de hardware

- VRAM/memoria unificada: entre 199 GB (`bit200`) y 380 GB (`bit400`) para el conjunto de pesos; los pesos de expertos por caja en TP=4 van de 47 GB a 92 GB, y en TP=3 de 62 GB a 122 GB.
- Hardware objetivo: dispositivos NVIDIA GB10 con memoria unificada (DGX Spark). El motor gr8 está diseñado para servir el modelo en 3-6 DGX Sparks.
- No cabe en GPU de consumo convencional: incluso el perfil más pequeño (199 GB) excede la VRAM de una RTX 4090 (24 GB) o una RTX 5090 (32 GB).
- Opciones de despliegue: kindlingai/gr8 (motor nativo exlr8, TP=3 y TP=4), kindlingai/exlr8 (loader de referencia en PyTorch puro), ashhart/TensorFold (motor multiplataforma) y GordoAR/MLXLR8 (motor EXLR8 para Metal).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-exlr8 (esta ficha) | 744B MoE (256 expertos, 75 capas) | no disponible | exlr8 v2 (safetensors) | glm-5.3 | Hugging Face y ModelScope |
| zai-org/GLM-5.3-BF16 (base) | 744B MoE | no disponible | safetensors BF16 | glm-5.3 | Hugging Face |
| Otras cuantizaciones de GLM-5.3 | 744B MoE | no disponible | no disponible | glm-5.3 | mencionadas de forma genérica en la model card, sin identificar |

No se dispone de información sobre alternativas de otros desarrolladores con parámetros, contexto y licencia comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El formato exlr8 v2 es propietario y requiere un loader compatible; no es un GGUF ni un safetensors estándar. Sin gr8, TensorFold, MLXLR8 o el loader de referencia de kindlingai/exlr8, los pesos no son utilizables.
- El loader debe aplicar redondeo E4M3; omitirlo produce resultados incorrectos.
- El repositorio completo ocupa 1.672,4 GB, aunque cada perfil individual ocupa entre 199 GB y 380 GB. El espacio en disco necesario para almacenar varios perfiles es considerable.
- El perfil `bit200` presenta una KL media de 0,248 en texto generado por el modelo y 0,367 en wikitext, muy superiores a las de perfiles altos; usar la anchura mínima degrada la fidelidad de forma medible.
- Las cifras de KL solo son comparables con otras cuantizaciones medidas con el mismo test del autor; no son directamente comparables con las de otras model cards de GLM-5.3.
- Licencia `glm-5.3` (categoría `other`): es necesario revisar el fichero LICENSE del repositorio antes de uso comercial; la información proporcionada no detalla restricciones adicionales.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe.
- Longitud de contexto no disponible en la información proporcionada.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de desplegar en producción.
- El modelo está orientado a GB10 y tensor-parallel de 3-7; no hay garantía de soporte en otras configuraciones de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- ModelScope (espejo): https://www.modelscope.ai/models/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16 (revisión 9d2398f)
- Formato exlr8 y loader de referencia: https://github.com/kindlingai/exlr8
- Documentación del formato: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Motor gr8 (nativo exlr8, GLM-5.3 en GB10): https://github.com/kindlingai/gr8
- TensorFold (motor multiplataforma): https://github.com/ashhart/TensorFold
- MLXLR8 (motor EXLR8 para Metal): https://github.com/GordoAR/MLXLR8
