# Snapkitty/lexlean-r4-v13-qwen3-0.6b

## Resumen

LexLean R4 V13 · Qwen3-0.6B es un artefacto publicado por el usuario Snapkitty que contiene una copia byte a byte de los pesos de Qwen3-0.6B recompilados en el formato contenedor UORR4V13 del proyecto LexLean R4. No se trata de un modelo entrenado o afinado de nuevo: el autor declara explicitamente que es un espejo de los pesos originales de Qwen, reconstruidos a partir de 410 piezas verificadas y unidos en un unico fichero de 429.484.190 bytes. El modelo base es Qwen3-0.6B, desarrollado por el equipo Qwen de Alibaba, y la licencia declarada es Apache-2.0.

La relevancia de esta publicacion es fundamentalmente tecnica y de investigacion: sirve como ejemplo de recompilacion determinista de pesos y de verificacion de integridad mediante hashes SHA-256 y comparacion de logits. El autor valida que la reconstruccion preserva 911.616 valores de logit comprobados de forma exacta, que el estado KV y los IDs generados coinciden con la referencia en Rust, y que una prueba de chat acotada devuelve "Hello!". Sin embargo, el propio autor indica que la cualificacion amplia de calidad y de servicio queda fuera del alcance de la validacion.

Para un desarrollador o investigador, este repositorio no es un sustituto directo de Qwen3-0.6B en produccion: requiere un cargador compatible con LexLean R4 V13 y el contenedor UORR4V13, y no se han publicado datos de rendimiento, idiomas soportados ni pipeline de inferencia estandar. Su interes reside en el formato, la trazabilidad de la reconstruccion y la paridad verificada con los pesos originales, no en capacidades nuevas del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 0,6 mil millones (heredados de Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye en el contenedor UORR4V13 de LexLean R4 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor UORR4V13 (LexLean R4 V13); fichero unico de 429.484.190 bytes |

## Arquitectura y entrenamiento

El artefacto no define una arquitectura nueva: hereda la de Qwen3-0.6B, un transformer decoder-only de aproximadamente 0,6 mil millones de parametros. La informacion disponible no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion del dataset de entrenamiento original. Tampoco se indica si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion; esos datos corresponden a la model card oficial de Qwen3-0.6B y no se reproducen aqui.

La innovacion tecnica de esta publicacion es el proceso de recompilacion y verificacion. Los pesos originales se reconstruyeron a partir de 410 piezas verificadas en una revision fijada del repositorio LexLean R4 (commit 1c3dfd7fb726a80d1c6f66ab85f65047deb74c7a) y se unieron en un unico contenedor byte a byte. El autor reporta que los hashes SHA-256 de origen y reconstruccion coinciden y quedan registrados en `SHA256SUMS`. La validacion comprobo 911.616 valores de logit exactos, el estado KV y los IDs generados frente a la referencia en Rust, ademas de una prueba de chat acotada que devolvio "Hello!". No se documentan tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones de inferencia propias.

## Capacidades

- Generacion de texto y conversacion basica: heredadas de Qwen3-0.6B, aunque la validacion publicada se limita a una prueba de chat acotada.
- Razonamiento y codigo: capacidades del modelo base no verificadas en este artefacto; no disponibles en la informacion proporcionada.
- Matematicas: no disponible en la informacion proporcionada.
- Vision: no disponible; el modelo base Qwen3-0.6B es de texto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo thinking: no disponible en la informacion proporcionada.
- Paridad de reconstruccion: verificada para 911.616 valores de logit, estado KV e IDs generados en los casos probados.

## Casos de uso

- Verificacion de paridad de pesos: usar el artefacto para comprobar que una recompilacion en formato UORR4V13 reproduce exactamente los logits del modelo original, comparando los 911.616 valores reportados y los hashes SHA-256.
- Investigacion sobre formatos de contenedor: estudiar el diseno del contenedor UORR4V13 y del recompilador LexLean R4 como caso practico de empaquetado determinista de pesos.
- Pruebas de integridad en pipelines de publicacion: integrar la comprobacion de `SHA256SUMS` y la comparacion de logits en un proceso de CI que valide artefactos derivados de modelos base.
- Desarrollo de cargadores compatibles: implementar o validar un loader para LexLean R4 V13 usando este artefacto como referencia de prueba con un modelo pequeno de 0,6 mil millones de parametros.
- Experimentacion educativa: emplear el modelo para demostrar tecnicas de reconstruccion por piezas y verificacion criptografica en entornos de formacion.
- Pruebas de humo de infraestructura: ejecutar un chat acotado con el cargador LexLean para comprobar que el entorno de inferencia arranca correctamente antes de escalar a modelos mayores.
- Analisis forense de artefactos: comparar el fichero unico de 429.484.190 bytes con los pesos originales para detectar diferencias de serializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta validacion de paridad: 911.616 valores de logit comprobados exactamente, coincidencia de estado KV e IDs generados en la referencia Rust, y una prueba de chat acotada que devuelve "Hello!". No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 0,6 mil millones de parametros en precision completa requiere del orden de 2,4 GB solo para pesos, pero este dato no lo aporta el repositorio y depende del formato UORR4V13.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el artefacto requiere un cargador compatible con LexLean R4 V13, no un runtime estandar.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El autor indica que se debe empezar por el codigo fuente fijado de LexLean R4 (commit ed3ba338934905735b88f36e870dc833cd75c071).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| LexLean R4 V13 · Qwen3-0.6B | 0,6 mil millones | no disponible | UORR4V13 | Apache-2.0 | Artefacto de investigacion, requiere loader LexLean |
| Qwen/Qwen3-0.6B | 0,6 mil millones | no disponible en esta ficha | safetensors (formato original) | Apache-2.0 | Modelo base oficial, disponible en Hugging Face |
| Otros derivados de Qwen3-0.6B | 0,6 mil millones | no disponible | variable | variable | no disponible |

La comparativa se limita al modelo base porque la informacion proporcionada no identifica alternativas equivalentes en formato UORR4V13. Frente a Qwen3-0.6B original, este artefacto no aporta capacidades nuevas: la diferencia es el contenedor, el proceso de recompilacion y la verificacion de integridad.

## Limitaciones y advertencias

- No es un modelo afinado: es un espejo byte a byte de Qwen3-0.6B; no incorpora mejoras de calidad, alineacion ni conocimientos adicionales.
- Requiere un cargador especifico de LexLean R4 V13; no funciona con runtimes estandar como transformers, vLLM o llama.cpp sin adaptacion.
- La validacion es acotada: paridad de logits, estado KV e IDs en los casos probados y una prueba de chat que devuelve "Hello!". El autor excluye explicitamente la cualificacion amplia de calidad y de servicio.
- Riesgo de alucinacion: heredado del modelo base; no evaluado en este artefacto.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3-0.6B.
- Idiomas: no declarados en el repositorio; no se puede confirmar cobertura multilingue.
- Contexto: no disponible; no se indica la longitud de ventana efectiva.
- Licencia: Apache-2.0, con avisos adicionales del proyecto LexLean (Apache-2.0 y MIT) incluidos junto al LICENSE original. Verificar la compatibilidad de los avisos antes de uso comercial.
- Repositorio sin descargas ni likes y con fecha de creacion futura en los metadatos (2026-11-23), lo que sugiere un artefacto de investigacion sin adopcion contrastada.
- No apto para produccion sin una evaluacion propia de calidad, latencia y seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Snapkitty/lexlean-r4-v13-qwen3-0.6b
- Proyecto LexLean R4: https://github.com/Casey-allard/lexlean-r4
- Revision fijada de pesos: https://github.com/Casey-allard/lexlean-r4/tree/1c3dfd7fb726a80d1c6f66ab85f65047deb74c7a
- Fuente fijada de LexLean para uso: https://github.com/Casey-allard/lexlean-r4/tree/ed3ba338934905735b88f36e870dc833cd75c071
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
