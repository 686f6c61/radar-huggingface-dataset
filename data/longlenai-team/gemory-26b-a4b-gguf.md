# longlenai-team/Gemory-26B-A4B-GGUF

## Resumen

Gememory-26B-A4B-GGUF es una distribucion en formato GGUF de un ajuste fino (LoRA) sobre el modelo abliterated Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated, que a su vez deriva de la familia Gemma 4 de Google en su variante MoE de 26B con aproximadamente 4B de parametros activos. El autor, longlenai-team, lo orienta explicitamente a escritura creativa, roleplay y contenido para adultos (etiquetas `nsfw`, `erp`, `not-for-all-audiences`), ademas de presentarlo como abliterated, es decir, con los mecanismos de rechazo eliminados mediante la tecnica de abliteration.

El modelo conserva la arquitectura Mixture of Experts del Gemma 4 original, con 25.233.142.046 parametros totales confirmados en los safetensors del modelo base, lo que le permite activar solo una fraccion por token y mantener costes de inferencia propios de un modelo mucho menor. La publicacion incluye unicamente pesos cuantizados en GGUF dentro de un repositorio de 153,9 GB, pensado para su uso con llama.cpp y entornos compatibles con endpoints.

Su relevancia practica es acotada pero clara: cubre el nicho de modelos conversacionales sin censura, con contexto largo y capacidad multimodal heredada de Gemma 4, empaquetados en un formato que se ejecuta en hardware de consumo. No obstante, la ausencia de benchmarks publicados, la falta de soporte declarado para castellano y la naturaleza del ajuste fino obligan a evaluarlo con cautela antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), base Gemma 4 26B-A4B |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la denominacion A4B sugiere ~4B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio contiene multiples ficheros cuantizados; niveles concretos no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 4 en su variante 26B-A4B, un transformer con capas de mezcla de expertos en las que solo un subconjunto de parametros se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso de 26B. El punto de partida es la version cuantizada y posteriormente desconmutada (`qat-q4_0-unquantized`) publicada por huihui-ai, sobre la que se aplico abliteration para eliminar las direcciones de activacion asociadas al rechazo de peticiones. Sobre esa base, longlenai-team ha realizado un ajuste fino con LoRA orientado a escritura creativa y roleplay.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales mas alla de la propia arquitectura MoE y el proceso de abliteration. La model card no documenta hiperparametros del LoRA, rangos, ni la metodologia exacta de merge de los adaptadores con los pesos base.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis en escritura creativa y roleplay de largo recorrido.
- Roleplay y ERP sin restricciones de contenido, al haber sido sometido a abliteration y ajuste fino especifico.
- Capacidad multimodal heredada del modelo base Gemma 4, aunque no se detalla en la model card que modalidades se conservan tras el ajuste.
- Soporte de conversaciones multi-turno con mantenimiento de personaje y contexto narrativo.
- Generacion en ingles como idioma principal y unico declarado.
- Compatibilidad con llama.cpp y endpoints compatibles, lo que facilita su integracion en servicios de inferencia.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo mantiene personajes coherentes en sesiones multi-turno gracias a su naturaleza MoE con contexto amplio, adecuado para plataformas de entretenimiento conversacional.
- Escritura creativa asistida: generacion de ficcion, dialogos y narrativa serializada donde el autor necesita un modelo sin filtros que bloquee tramas adultas o temas sensibles.
- Generacion de contenido para adultos: el ajuste fino y la abliteration lo hacen apto para plataformas de ficcion interactiva para adultos, un nicho donde los modelos alineados rechazan las peticiones.
- Prototipado de chatbots de personaje: su formato GGUF permite desplegarlo rapidamente en llama.cpp u Ollama para validar experiencias de roleplay antes de invertir en infraestructura mayor.
- Investigacion sobre abliteration y alineacion: util como objeto de estudio para analizar como el ajuste fino y la eliminacion de rechazo afectan al comportamiento del modelo base.
- Despliegue local en hardware de consumo: al activar solo una fraccion de parametros por token, puede ejecutarse en estaciones de trabajo con GPU unica para experimentacion y demos privadas.
- Generacion de narrativa interactiva en juegos de texto: integrable en motores de ficcion interactiva que requieren respuestas coherentes y sin censura en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 153,9 GB, lo que sugiere que las cuantizaciones de mayor tamano requieren varias decenas de GB. Las cuantizaciones Q4 de un modelo MoE de 26B suelen situarse en el rango de 14-18 GB, aunque este dato no esta confirmado para esta publicacion.
- GPU recomendadas: no disponible. Por el perfil MoE y el tamano del repositorio, cabria esperar que las cuantizaciones bajas funcionen en RTX 4090 (24 GB) y que las altas requieran A100 o H100.
- Compatibilidad con GPU de consumo: probable en cuantizaciones bajas para GPUs con 16-24 GB de VRAM, si bien no hay confirmacion del autor.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, servidores compatibles con la API de endpoints). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gememory-26B-A4B-GGUF | 25,2B totales (MoE) | no disponible | Apache 2.0 | GGUF | Ajuste LoRA abliterated para roleplay/NSFW |
| Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated | 25,2B totales (MoE) | no disponible | Apache 2.0 | safetensors | Modelo base abliterated sin ajuste de roleplay |
| Gemma 4 26B-A4B (original de Google) | 25,2B totales (MoE) | no disponible | Gemma license | safetensors | Modelo alineado, con rechazo activo y sin contenido adulto |

La comparativa se limita a la propia genealogia del modelo, ya que no se dispone de datos de rendimiento que permitan contrastarlo con alternativas de otros autores en la misma categoria.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que implica un riesgo elevado de generar contenido danino, ilegal o sexualmente explicito sin filtros; no es apto para aplicaciones orientadas al publico general.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas que permitan estimar su fiabilidad factual.
- Soporte limitado al ingles; no se declara ni garantiza un rendimiento correcto en castellano.
- La licencia Apache 2.0 se declara en la model card, pero conviene verificar la compatibilidad con la licencia del modelo Gemma 4 subyacente, que puede imponer restricciones adicionales de uso comercial.
- El ajuste fino con LoRA sobre una base previamente cuantizada y desconmutada puede degradar capacidades respecto al modelo original; no hay evaluaciones que lo confirmen.
- El repositorio ocupa 153,9 GB y las cuantizaciones de mayor calidad exigen hardware con VRAM considerable.
- Ausencia total de documentacion sobre entrenamiento, dataset e hiperparametros, lo que dificulta la reproducibilidad y la evaluacion de sesgos.
- Etiquetado como `not-for-all-audiences`: su uso en plataformas publicas requiere moderacion externa obligatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longlenai-team/Gemory-26B-A4B-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
