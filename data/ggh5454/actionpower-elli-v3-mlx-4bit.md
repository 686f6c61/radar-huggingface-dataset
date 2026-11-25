# ggh5454/ActionPower-ELLI-v3-mlx-4bit

## Resumen

ActionPower-ELLI-v3-mlx-4bit es una cuantizacion en 4 bits del modelo ActionPower/ELLI-v3, generada por el usuario ggh5454 mediante `mlx_lm.convert` con cuantizacion afina y tamano de grupo 64. El modelo base es un modelo de lenguaje de aproximadamente 29.830 millones de parametros (segun los pesos en safetensors del repositorio), orientado a generacion de texto y conversacion, con soporte declarado para coreano e ingles. La arquitectura declarada en los metadatos es `gemma4_text`, lo que lo situa en la familia Gemma 4 de Google, aunque el autor no aporta detalles adicionales sobre la arquitectura en la model card.

El modelo resulta relevante para desarrolladores que trabajan en el ecosistema Apple Silicon, ya que el formato MLX permite ejecutar inferencia local en Macs con memoria unificada. La cuantizacion en 4 bits reduce el peso del repositorio a 16,8 GB, lo que lo hace manejable en equipos de gama alta de Apple (por ejemplo, Mac Studio o MacBook Pro con 32 GB o mas de memoria unificada), algo inviable con los pesos completos del modelo base.

La ficha se basa exclusivamente en los metadatos del repositorio y en la model card del autor, que es muy escueta: no se documentan datos de entrenamiento, benchmarks ni detalles de arquitectura mas alla de la etiqueta `gemma4_text`. Todo dato no presente en esa informacion se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_text (transformer, segun etiqueta del repositorio) |
| Parametros totales | 29.830.304.000 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 16,8 GB |

## Arquitectura y entrenamiento

La etiqueta `gemma4_text` indica que el modelo base pertenece a la familia Gemma 4 en su variante de texto, es decir, un transformer decoder-only. El autor no proporciona informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni innovaciones tecnicas especificas del modelo base. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Respecto al proceso de cuantizacion, la model card indica que se aplico `mlx_lm.convert` con cuantizacion afina de 4 bits y tamano de grupo 64. Este esquema agrupa los pesos en bloques de 64 elementos y comparte una escala y un sesgo por grupo, lo que reduce el error de cuantizacion respecto a una cuantizacion por tensor. No se especifica si se excluyeron capas concretas (por ejemplo, embeddings o la cabeza de salida) del proceso de cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`, `conversational`).
- Soporte de coreano e ingles como idiomas declarados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de codigo o matematicas mas alla de las inherentes al modelo base, que no se detallan.

## Casos de uso

- Asistente conversacional local en coreano e ingles: el modelo puede desplegarse en un Mac con MLX y gestionar dialogos multi-turno sin conexion a servicios en la nube, lo que resulta adecuado para prototipos y entornos con requisitos de privacidad.
- Prototipado rapido en Apple Silicon: gracias al formato MLX y a los 16,8 GB del repositorio, un desarrollador puede cargar el modelo con `mlx_lm.load` y validar ideas de producto sin infraestructura GPU dedicada.
- Generacion de texto en aplicaciones de escritorio para macOS: la integracion con MLX permite incorporar generacion de texto en apps nativas con memoria unificada, evitando dependencias de servidores externos.
- Investigacion sobre cuantizacion: el repositorio sirve como referencia para estudiar el impacto de la cuantizacion 4-bit affine con group size 64 frente al modelo base de 29.800 millones de parametros.
- Traduccion y asistencia bilingue coreano-ingles: el soporte declarado de ambos idiomas permite usarlo en tareas de redaccion o reformulacion entre estos dos idiomas, siempre que se valide la calidad con pruebas propias.
- Evaluacion comparativa de modelos Gemma 4: al estar etiquetado como `gemma4_text`, puede emplearse como punto de comparacion en estudios de rendimiento de variantes cuantizadas frente a los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 16,8 GB en 4 bits; se recomienda al menos 20-24 GB de memoria unificada libre para cargar el modelo y generar texto con margen para el contexto.
- GPU recomendadas: no aplica en el sentido tradicional, ya que MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 y variantes Pro, Max y Ultra).
- Cabe en consumer hardware: si, en equipos Apple con 32 GB o mas de memoria unificada; en configuraciones de 16 GB el margen es muy ajustado y puede requerir reducir el contexto.
- Opciones de despliegue: `mlx_lm` (libreria oficial de MLX para modelos de lenguaje); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles; dependen del chip Apple concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| ActionPower-ELLI-v3-mlx-4bit | 29,83 B | no disponible | 4-bit MLX | apache-2.0 | safetensors (MLX) |
| ActionPower/ELLI-v3 (base) | 29,83 B | no disponible | pesos completos | apache-2.0 | no disponible |
| Alternativas Gemma 4 cuantizadas en MLX | no disponible | no disponible | 4-bit MLX | segun variante | safetensors (MLX) |

No se dispone de informacion sobre modelos comparables concretos ni de sus resultados de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es minima: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documenta ningun mecanismo de mitigacion.
- La cuantizacion en 4 bits puede degradar la calidad respecto al modelo base, especialmente en tareas de razonamiento o generacion de codigo; no se aportan metricas de la perdida.
- Solo se declaran coreano e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no esta documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- La licencia apache-2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base ActionPower/ELLI-v3 y de la familia Gemma 4 subyacente.
- El repositorio tiene muy pocas descargas y ningun "like", por lo que no hay validacion de la comunidad sobre su calidad.
- El despliegue esta limitado al ecosistema MLX (Apple Silicon); no se documenta compatibilidad con GPUs NVIDIA u otros runtimes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggh5454/ActionPower-ELLI-v3-mlx-4bit
- Modelo base: https://huggingface.co/ActionPower/ActionPower-ELLI-v3
