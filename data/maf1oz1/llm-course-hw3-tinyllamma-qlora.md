# maf1oz1/llm-course-hw3-tinyllamma-qlora

## Resumen

`maf1oz1/llm-course-hw3-tinyllamma-qlora` es un repositorio de Hugging Face que contiene exclusivamente el tokenizador sin modificar de `TinyLlama/TinyLlama-1.1B-Chat-v1.0`. No aloja pesos del modelo ni el adaptador QLoRA entrenado: según la model card del autor, el adaptador resultante del fine-tuning se publica en un repositorio separado (`maf1oz1/llm-course-hw3-tinyllama-qlora`). Por tanto, este artefacto es un componente auxiliar de un ejercicio académico (tercera tarea de un curso de LLM) y no un modelo autónomo listo para inferencia.

El repositorio existe por una razón práctica: la plantilla del trabajo de fin de módulo incluía una errata en el nombre del repositorio del tokenizador (`tinyllamma` en lugar de `tinyllama`), y el notebook de verificación carga el tokenizador desde esa ruta concreta. El autor decidió mantener el nombre con la errata para no romper la reproducibilidad del cuaderno de evaluación.

La relevancia de esta ficha es, por tanto, acotada: sirve para identificar correctamente el artefacto, evitar confundirlo con un modelo entrenado y redirigir a quien lo necesite hacia el repositorio que sí contiene el adaptador QLoRA y la documentación de la tarea (hiperparámetros, calidad y ejemplos de generación). Para cualquier uso real conviene consultar la model card del modelo base TinyLlama y la del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (este repositorio solo contiene el tokenizador; el modelo base TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only) |
| Parametros totales | no disponible en este repositorio (el modelo base tiene 1,1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en este repositorio (el modelo base TinyLlama declara 2048 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio no contiene pesos) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (solo artefactos de tokenizador: tokenizer.json, tokenizer_config.json, special_tokens_map.json, etc.) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino el tokenizador de `TinyLlama/TinyLlama-1.1B-Chat-v1.0`, reutilizado sin modificaciones. El tokenizador de TinyLlama es de tipo SentencePiece (BPE) con un vocabulario de 32 000 tokens, compartido con la familia Llama. Al no haberse alterado, no hay decisiones de diseño ni cambios en el vocabulario que documentar aquí.

El entrenamiento descrito por el autor (fine-tuning con QLoRA sobre TinyLlama-1.1B-Chat-v1.0) se documenta en el repositorio `maf1oz1/llm-course-hw3-tinyllama-qlora`, que no forma parte de la información disponible en esta búsqueda. No se dispone de datos sobre el conjunto de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación adicionales (RLHF/DPO) en el adaptador.

## Capacidades

- Este repositorio no ofrece capacidades de generación: solo expone un tokenizador para codificar y decodificar texto.
- Permite cargar el tokenizador con `AutoTokenizer.from_pretrained("maf1oz1/llm-course-hw3-tinyllamma-qlora")` para usarlo junto al adaptador QLoRA alojado en el repositorio hermano.
- Idioma soportado: inglés (`en`), heredado del tokenizador de TinyLlama.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking por sí mismo; esas capacidades dependerían del modelo base y del adaptador, no de este artefacto.
- No incluye visión, audio ni multimodalidad.

## Casos de uso

- Reproducibilidad de un cuaderno académico: cargar el tokenizador desde esta ruta concreta para que el notebook de la tarea 3 del curso de LLM funcione sin modificar la plantilla original (que contiene la errata `tinyllamma`).
- Evaluación del adaptador QLoRA: emparejar este tokenizador con el adaptador de `maf1oz1/llm-course-hw3-tinyllama-qlora` para garantizar que la tokenización coincide exactamente con la usada durante el entrenamiento.
- Docencia y material de referencia: ilustrar en un curso cómo se separa el tokenizador del modelo y por qué conviene versionar ambos artefactos de forma explícita.
- Depuración de pipelines de Hugging Face: comprobar que `AutoTokenizer` resuelve correctamente rutas con erratas en el nombre del repositorio, útil para validar scripts de CI que consumen artefactos de estudiantes.
- Pruebas de compatibilidad de tokenizadores: verificar que el tokenizador cargado desde este repositorio produce los mismos IDs que el de `TinyLlama/TinyLlama-1.1B-Chat-v1.0`, como test de regresión.
- Archivado de artefactos de curso: conservar una copia estable del tokenizador asociado a una entrega concreta, de modo que la evaluación sea reproducible aunque el repositorio original cambie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un repositorio que solo contiene un tokenizador, no procede evaluar métricas de calidad de modelo (MMLU, HumanEval, GSM8K, etc.) sobre este artefacto.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el repositorio no contiene pesos. El tokenizador ocupa del orden de unos pocos megabytes en disco y se ejecuta en CPU.
- GPU recomendadas: no aplica para este repositorio. Para el modelo base TinyLlama-1.1B-Chat-v1.0 en FP16 se requieren aproximadamente 2-3 GB de VRAM; en cuantización de 4 bits, alrededor de 1 GB.
- Cabe en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4060, RTX 4090) si se usa junto al modelo base o al adaptador, no por este repositorio en sí.
- Opciones de despliegue: `transformers` (con `AutoTokenizer`) para el tokenizador. Para el modelo y el adaptador, las opciones habituales son `transformers` + PEFT, `llama.cpp` u Ollama, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maf1oz1/llm-course-hw3-tinyllamma-qlora` (este repo) | Tokenizador | no aplica | no aplica | no disponible | Hugging Face, 0 descargas |
| `maf1oz1/llm-course-hw3-tinyllama-qlora` | Adaptador QLoRA + modelo | 1,1B (base) | no disponible | no disponible | Hugging Face (referenciado por el autor) |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | Modelo base | 1,1B | 2048 tokens | Apache 2.0 (según la model card del modelo base) | Hugging Face, ampliamente utilizado |

## Limitaciones y advertencias

- Este repositorio no contiene un modelo entrenado: no se puede usar para generar texto por sí solo.
- La licencia no está declarada en la información disponible; conviene revisar la licencia del modelo base (Apache 2.0 según su model card) antes de cualquier uso comercial del adaptador o del tokenizador.
- El nombre del repositorio contiene una errata deliberada (`tinyllamma`) para que coincida con la plantilla del curso; esto puede provocar confusión en búsquedas y en integraciones automáticas.
- Solo se declara el idioma inglés; no hay evidencia de soporte multilingüe más allá de lo que herede el tokenizador de TinyLlama.
- No hay información sobre sesgos, alucinación o rendimiento del adaptador QLoRA en esta búsqueda; esos datos deben consultarse en la model card del repositorio hermano.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad más allá del contexto académico para el que fue creado.
- No se han publicado benchmarks del adaptador ni de este artefacto; no debe asumirse ningún nivel de calidad sin verificarlo en el repositorio del adaptador.

## Enlaces

- Repositorio de este artefacto (tokenizador): https://huggingface.co/maf1oz1/llm-course-hw3-tinyllamma-qlora
- Repositorio del adaptador QLoRA (referenciado por el autor): https://huggingface.co/maf1oz1/llm-course-hw3-tinyllama-qlora
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
