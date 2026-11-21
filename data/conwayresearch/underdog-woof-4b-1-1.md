# ConwayResearch/Underdog-Woof-4B-1.1

## Resumen

Underdog-Woof-4B-1.1 es un modelo de generacion de texto de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) desarrollado por ConwayResearch. Se trata de un ajuste fino (post-entrenamiento) del modelo Qwen 3 4B, orientado a mejorar su comportamiento dentro del arnes (harness) propietario de Underdog, el producto de la compania. El modelo se distribuye cuantizado a 4 bits en formato MLX, lo que lo hace especialmente adecuado para inferencia en hardware Apple Silicon.

La relevancia de este lanzamiento es doble: por un lado, demuestra el patron habitual de adaptar un modelo base abierto de tamano medio a un caso de uso concreto mediante post-entrenamiento; por otro, su empaquetado en MLX 4-bit y su licencia CC BY-NC 4.0 lo posicionan como una pieza de evaluacion para desarrolladores que trabajan en el ecosistema de Apple y necesitan modelos ligeros para tareas conversacionales.

La informacion publica disponible es limitada: la model card es muy escueta y no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni los resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables a partir de la informacion proporcionada y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen 3 4B; familia identificada en los tags como qwen3_5) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (formato MLX); no se documentan otras variantes |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-NC 4.0 (uso no comercial; uso comercial requiere licencia separada) |
| Formato de pesos | Safetensors cuantizados a 4 bits para MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3 4B, un transformer denso de la familia Qwen 3. Sobre esa base, ConwayResearch ha aplicado un post-entrenamiento cuyo objetivo declarado es que el modelo funcione mejor dentro del arnes de Underdog. La model card no especifica la metodologia exacta (SFT, DPO, RLHF u otra), ni el volumen de datos, ni la composicion del dataset utilizado en esa fase.

El artefacto distribuido esta cuantizado a 4 bits en formato MLX, con un tamano de repositorio de 2,4 GB. Esta eleccion de formato y precision indica que el modelo esta pensado para ejecutarse en el stack de MLX de Apple (chips M-series), no en GPUs CUDA convencionales. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen 3 4B.
- Razonamiento y respuesta a instrucciones de complejidad media, sujeto a las capacidades del modelo base de 4 B parametros.
- Soporte de conversaciones multi-turno (pipeline text-generation con tag conversational).
- Ejecucion en Apple Silicon mediante MLX, con pesos ya cuantizados a 4 bits.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Prototipado local en Mac: el modelo puede ejecutarse directamente con MLX en un Mac con chip M-series, lo que permite iterar en prototipos conversacionales sin depender de servicios en la nube ni de GPUs dedicadas.
- Evaluacion de harnesses de agentes: dado que el ajuste se realizo para el arnes de Underdog, resulta util para comparar el comportamiento del modelo base Qwen 3 4B frente a la version post-entrenada en tareas de seguimiento de instrucciones dentro de un pipeline concreto.
- Asistentes conversacionales de proposito general en ingles: con 4,2 B parametros y cuantizacion 4-bit, es viable para chatbots ligeros en entornos de demo o herramientas internas no comerciales.
- Generacion de texto y resumenes en flujos de trabajo de escritorio: su formato MLX permite integrarlo en aplicaciones macOS nativas que necesiten generacion de texto sin conexion.
- Educacion e investigacion: sirve como ejemplo practico de post-entrenamiento y cuantizacion MLX para quienes estudian el ciclo de vida de modelos abiertos de tamano medio.
- Pruebas de regresion de infraestructura MLX: util para validar pipelines de inferencia, tokenizacion y cuantizacion en el ecosistema Apple antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 2,4 GB en cuantizacion 4-bit, por lo que se necesita al menos esa cantidad de memoria libre, mas overhead del runtime MLX (estimacion practica: 3-4 GB).
- Hardware objetivo: Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX.
- Compatibilidad con GPU NVIDIA (A100, H100, RTX 4090): no documentada; el formato MLX no es el estandar para CUDA.
- Despliegue: libreria MLX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Underdog-Woof-4B-1.1 | 4,2 B | No disponible | CC BY-NC 4.0 | MLX 4-bit | Post-entrenado sobre Qwen 3 4B; solo ingles |
| Qwen 3 4B (base) | Aproximadamente 4 B | No disponible en esta ficha | Licencia del modelo base (consultar upstream) | Safetensors, GGUF y otros | Modelo base sin el ajuste de Underdog |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: el uso comercial esta prohibido sin una licencia separada, que debe solicitarse a license@conway.tech. Esto descarta su uso directo en productos comerciales.
- Los componentes upstream conservan sus licencias originales (ver LICENSE-APACHE en el repositorio), lo que anade obligaciones que deben revisarse antes de cualquier redistribucion.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Al estar cuantizado a 4 bits, es previsible una perdida de calidad respecto al modelo base en precision completa, aunque el autor no publica mediciones al respecto.
- No se documentan evaluaciones de sesgo, toxicidad o alucinacion; se recomienda validacion propia antes de cualquier uso en produccion.
- La model card es muy escueta: no hay informacion sobre datos de entrenamiento, metodologia de ajuste ni limitaciones conocidas declaradas por el autor.
- El formato MLX limita el despliegue a hardware Apple; no es portable a stacks CUDA sin conversion previa.

## Enlaces

- Hugging Face: https://huggingface.co/ConwayResearch/Underdog-Woof-4B-1.1
- Contacto de licencia comercial: license@conway.tech
- Modelo base referenciado: Qwen 3 4B (consultar el repositorio oficial de Qwen en Hugging Face)
- Repositorio MLX: https://github.com/ml-explore/mlx
