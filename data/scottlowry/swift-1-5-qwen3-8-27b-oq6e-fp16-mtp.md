# scottlowry/Swift-1.5-Qwen3.8-27b-oQ6e-fp16-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ6e-fp16-mtp es una version cuantizada del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario scottlowry en HuggingFace. Se trata de un artefacto de pesos en formato MLX safetensors generado con la herramienta oQ (oMLX v0.7.0), que aplica cuantizacion de precision mixta a 6 bits con tamano de grupo 64. El repositorio contiene 27.781.427.952 parametros reales (27,78 mil millones) y ocupa 24,7 GB en disco.

Su relevancia es practica mas que cientifica: no introduce arquitectura nueva ni un entrenamiento propio, sino que empaqueta un modelo de ~28B en un formato de 6 bits pensado para inferencia local sobre Apple Silicon mediante la libreria MLX. Para desarrolladores que trabajan en Mac con memoria unificada, este tipo de conversiones son las que hacen viable ejecutar modelos de esa escala sin GPU dedicada.

La informacion publicada es muy limitada. La model card solo documenta el proceso de cuantizacion (tipo de modelo declarado como qwen3_5, 6 bits, grupo 64, formato MLX safetensors). No se especifican licencia, idiomas, longitud de contexto, composicion del dataset de entrenamiento ni resultados de evaluacion. El nombre del repositorio sugiere elementos adicionales (sufijos "oQ6e", "fp16" y "mtp"), pero la model card no los describe, por lo que no se pueden confirmar sus implicaciones tecnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo declara el tipo "qwen3_5"; no se detalla si es transformer denso, MoE o hibrida) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, tamano de grupo 64, precision mixta mediante oQ (oMLX v0.7.0); el nombre del repositorio menciona "fp16", pero la model card no especifica que capas quedan en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni la model card de esta conversion ni la del modelo base la declaran en la informacion proporcionada) |
| Formato de pesos | MLX safetensors (libreria mlx); tamano del repositorio 24,7 GB |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 2026-10-07 (segun los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento de esta publicacion: es una conversion de pesos, no un entrenamiento. El unico dato tecnico aportado es que el proceso de cuantizacion se realizo con oQ (oMLX v0.7.0) en modo de precision mixta, con 6 bits de precision y tamano de grupo 64. Esto implica que los pesos se almacenan en bloques de 64 valores con una escala (y presumiblemente un sesgo o offset) compartidos, lo que anade un coste de metadatos de aproximadamente 0,5 bits por peso y situa el ratio efectivo en torno a 6,5 bits por parametro. Con 27,78B de parametros, eso da un peso teorico cercano a 22,6 GB, coherente con los 24,7 GB que ocupa el repositorio completo (que incluye ficheros auxiliares y posibles capas no cuantizadas).

Respecto a la arquitectura del modelo base, la model card declara el tipo "qwen3_5", lo que apunta a la familia Qwen3, pero no se documenta ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion, ni si incorpora mezcla de expertos. El sufijo "mtp" del nombre del repositorio es compatible con "multi-token prediction" y el sufijo "fp16" con la preservacion de determinadas capas en media precision, pero son inferencias a partir del nombre y no estan confirmadas en la documentacion. Tampoco se detalla el dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto: capacidad esperable por tratarse de un modelo de ~28B de la familia Qwen, pero no verificada en la informacion disponible.
- Razonamiento y matematicas: no disponible; no hay evaluaciones publicadas.
- Generacion de codigo: probable por familia, sin confirmacion documental.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el modelo base no publica lista de idiomas en la informacion proporcionada.
- Modo de razonamiento explicito ("thinking"): no disponible.
- Vision o audio: no disponible; los tags no indican modalidad adicional.

Nota: al ser una cuantizacion de 6 bits, la fidelidad respecto al modelo original en tareas sensibles a la precision numerica (aritmetica de muchos pasos, salidas estructuradas muy rigidas) puede degradarse de forma leve pero no cuantificada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: al estar en formato MLX con cuantizacion de 6 bits, el modelo esta pensado para ejecutarse en equipos Apple Silicon con 32 GB o mas de memoria unificada, sin necesidad de GPU dedicada ni de conexion a servicios en la nube.
- Asistente de codigo offline: un modelo de ~28B es adecuado para autocompletado, refactorizacion y explicacion de fragmentos en entornos sin acceso a internet (por ejemplo, redes aisladas o portatiles en movilidad), siempre que se valide su calidad real en esta cuantizacion.
- Procesamiento de datos sensibles en local: al no requerir envio de prompts a un tercero, encaja en flujos donde la politica interna prohibe sacar datos de la maquina, como borradores legales, historiales clinicos anonimizados o documentacion interna.
- Prototipado rapido de aplicaciones LLM: sirve como backend de desarrollo en MLX para validar prompts, plantillas y logica de orquestacion antes de desplegar la version completa en fp16 o en otro runtime.
- Generacion de documentacion tecnica interna: resumenes de repositorios de codigo, redaccion de notas de version o conversion de especificaciones entre formatos, ejecutado en el propio portatil del desarrollador.
- Evaluacion comparativa de cuantizaciones: util como punto de referencia en estudios sobre la perdida de calidad entre fp16, 8 bits y 6 bits con grupo 64 en modelos de ~28B.
- Tareas de extraccion y clasificacion por lotes: procesamiento nocturno de correos, tickets o articulos con salidas estructuradas, aprovechando el coste marginal nulo de la inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: alrededor de 23-25 GB para los pesos cuantizados a 6 bits (el repositorio ocupa 24,7 GB). A esa cifra hay que sumar el coste de la cache KV y de las activaciones, que depende de la longitud de contexto y del batch, no documentados.
- Equivalente en fp16: los mismos 27,78B parametros ocuparian aproximadamente 55,6 GB, solo para pesos.
- Memoria minima recomendada: 32 GB de memoria unificada en Apple Silicon, con margen muy ajustado. 36 GB o 48 GB permiten contextos mas largos y mayor batch.
- GPU compatibles: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 y posteriores). No es ejecutable directamente en CUDA; para NVIDIA (RTX 4090 24 GB, A100 40/80 GB, H100) seria necesario convertir los pesos a otro formato.
- Cabe en GPU de consumo: si se convierte a GGUF o a un formato CUDA, 24 GB de VRAM quedarian al limite con 6 bits; con cuantizaciones de 4 bits seria viable en una RTX 4090. En su formato nativo MLX, la restriccion es la memoria unificada del Mac, no una GPU dedicada.
- Opciones de despliegue: MLX y mlx-lm para el formato nativo; llama.cpp, Ollama o LM Studio si se convierte a GGUF; vLLM o TGI requeririan una conversion a safetensors estandar en precision completa o cuantizacion compatible (por ejemplo, AWQ o GPTQ).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento, licencia ni contexto del modelo base, por lo que la comparacion se limita a caracteristicas estructurales conocidas publicamente de modelos de escala equivalente. Los datos de las alternativas provienen de conocimiento general de esos modelos, no de la informacion facilitada en esta busqueda, y deben verificarse antes de usarse.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-oQ6e-fp16-mtp | 27,78B | no disponible | no disponible | MLX safetensors 6 bits (grupo 64) | Cuantizacion de un fine-tune de la familia Qwen3; sin benchmarks publicados |
| Qwen3-32B | 32,8B | 128K aprox. (segun documentacion de Qwen) | Apache 2.0 (segun documentacion de Qwen) | safetensors, GGUF, MLX | Alternativa directa de la misma familia, con licencia permisiva y evaluaciones publicas |
| Gemma 3 27B | 27B | 128K aprox. (segun documentacion de Google) | Licencia Gemma (con restricciones de uso) | safetensors, GGUF | Tamano casi identico, multimodal en algunas variantes |
| Mistral Small 3.1 24B | 24B | 128K aprox. (segun documentacion de Mistral) | Apache 2.0 | safetensors, GGUF | Ligeramente menor, orientado a baja latencia |

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks publicados para esta cuantizacion, por lo que se desconoce la degradacion real frente al modelo base en fp16.
- Licencia no declarada: al no especificarse la licencia ni en esta model card ni en la informacion disponible del modelo base, no se puede asumir uso comercial permitido. Es imprescindible verificar la licencia del modelo original antes de cualquier despliegue en produccion.
- Procedencia del modelo base: el fine-tune ukisai/Swift-1.5-Qwen3.8-27b no esta documentado en la informacion proporcionada (dataset, metodologia, autoria). La trazabilidad es baja.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no hay datos especificos para esta conversion.
- Sesgos: no documentados. Al desconocer la composicion del dataset de entrenamiento del modelo base, no se puede evaluar el sesgo por idioma, genero, origen o dominio.
- Idiomas: sin lista oficial. Un modelo de la familia Qwen suele rendir mejor en ingles y chino, pero esto no se confirma en la informacion disponible.
- Longitud de contexto desconocida: condiciona directamente el diseno de aplicaciones con documentos largos o conversaciones multi-turno.
- Formato restringido: al ser MLX, no se puede desplegar directamente en infraestructura CUDA sin conversion previa, lo que anade trabajo y riesgo de perdida adicional de precision.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Metadatos anomalos: la fecha de publicacion registrada (2026-10-07) resulta atipica y conviene confirmarla antes de citar el artefacto.
- Uso en produccion: recomendable tratar esta publicacion como material de experimentacion, no como artefacto listo para produccion, hasta que se verifiquen licencia, contexto y calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Libreria MLX: https://github.com/ml-explore/mlx
- MLX LM (inferencia y conversion de modelos): https://github.com/ml-explore/mlx-lm
