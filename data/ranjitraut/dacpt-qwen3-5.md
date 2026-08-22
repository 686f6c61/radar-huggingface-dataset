# ranjitraut/dacpt-qwen3.5

## Resumen

Este repositorio contiene un adaptador LoRA denominado `dacpt-qwen3.5`, publicado por el usuario `ranjitraut` en Hugging Face. Se trata de un ajuste fino de bajo rango (LoRA) sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado con técnicas de aprendizaje supervisado (SFT) mediante las librerías PEFT, Transformers y TRL. El adaptador ocupa solo 0,1 GB y se distribuye en formato `safetensors`, lo que indica que es un componente ligero que debe combinarse con el modelo base para realizar inferencia.

El modelo base `Qwen/Qwen3.5-4B` no aparece en las fuentes oficiales consultadas: la serie Qwen3.5, anunciada por Alibaba Cloud, comienza con `Qwen3.5-397B-A17B`, un modelo nativamente multimodal de 397B parámetros con activación de 17B. No hay evidencia pública de una variante de 4B en esa familia, por lo que la identidad y las capacidades reales de este adaptador son inciertas. La model card del repositorio está vacía en la mayoría de sus secciones y no proporciona detalles sobre el entrenamiento, los datos utilizados, los hiperparámetros ni los resultados de evaluación.

La relevancia de esta ficha es principalmente documental: se trata de un adaptador de bajo coste que podría emplearse para adaptar un modelo base a tareas específicas, pero su utilidad práctica no puede confirmarse sin información adicional sobre su entrenamiento y rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen/Qwen3.5-4B |
| Parametros totales | No disponible (el adaptador pesa 0,1 GB, el modelo base no especificado) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador usa la técnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de baja dimensión en las capas de atención y feed-forward. Esto permite un fine-tuning eficiente en términos de memoria y cómputo. El entrenamiento se realizó con SFT (Supervised Fine-Tuning) usando las librerías `transformers`, `trl` y `peft` (versión 0.20.0). No se ha publicado información sobre el dataset de entrenamiento, la composición de los datos, el número de tokens, ni el procedimiento de preprocesamiento. Tampoco se especifican los hiperparámetros (tasa de aprendizaje, épocas, batch size, etc.) ni el régimen de precisión (fp16, bf16, etc.).

El modelo base `Qwen/Qwen3.5-4B` no está documentado públicamente. La serie Qwen3.5 oficial usa una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención Transformer estándar y es nativamente multimodal (visión-lenguaje), pero no se ha confirmado que la variante de 4B comparta estas características. Por lo tanto, la arquitectura exacta del modelo base queda sin verificar.

## Capacidades

- No se han documentado capacidades específicas del adaptador.
- Al ser un adaptador LoRA, hereda las capacidades del modelo base, pero estas no están confirmadas.
- No se indica soporte de tool calling, agentes, razonamiento multi-step, visión, audio ni otras funcionalidades.
- No se especifican idiomas soportados.
- La falta de información impide evaluar cualquier capacidad concreta.

## Casos de uso

- **Fine-tuning eficiente para dominios específicos**: el adaptador puede utilizarse para ajustar un modelo base a un dominio concreto (por ejemplo, un corpus jurídico o médico) sin necesidad de entrenar todos los parámetros. Sin embargo, se desconoce si el ajuste realizado aquí es útil para algún dominio particular.
- **Investigación sobre adaptadores LoRA**: sirve como ejemplo de un pipeline de SFT con PEFT y TRL, útil para estudiar el flujo de trabajo de fine-tuning eficiente.
- **Pruebas de compatibilidad**: se puede probar la carga del adaptador con el modelo base para validar el ecosistema de herramientas (transformers, peft).
- **Aprendizaje de prácticas de entrenamiento**: el código y la configuración (aunque no documentados) pueden servir como plantilla para otros experimentos.
- **Comparación de métodos de ajuste**: si se tiene acceso al modelo base, se puede comparar el rendimiento del adaptador frente a un fine-tuning completo.
- **Evaluación de riesgos**: al no tener documentación, es un caso de estudio sobre la importancia de la transparencia en los modelos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica. No es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,1 GB, por lo que su almacenamiento es mínimo.
- Para inferencia, se necesita cargar el modelo base `Qwen/Qwen3.5-4B` (si existe), lo que requeriría al menos 8-10 GB de VRAM en cuantización de 4 bits (dependiendo de la arquitectura).
- No hay información sobre GPUs recomendadas ni sobre latencia o throughput.
- Opciones de despliegue: dado que es un adaptador PEFT, se puede cargar con `transformers` y `peft` en cualquier entorno que soporte esas librerías. No se indica compatibilidad con vLLM, Ollama o llama.cpp.
- Dado que el modelo base no está confirmado, no se puede proporcionar una estimación fiable de los requisitos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos. No se conocen otros adaptadores LoRA sobre `Qwen/Qwen3.5-4B` ni datos de rendimiento de este último. La serie oficial Qwen3.5 (por ejemplo, `Qwen3.5-397B-A17B`) es de una escala mucho mayor y no es comparable en tamaño ni propósito. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Falta de documentación**: la model card no proporciona información sobre entrenamiento, datos, licencia ni uso previsto.
- **Modelo base no verificado**: no existe evidencia pública de `Qwen/Qwen3.5-4B`; el adaptador podría no funcionar si el modelo base no es accesible o tiene una arquitectura diferente.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, pero sin información sobre su entrenamiento, este riesgo es aún más incierto.
- **Sesgos desconocidos**: no hay datos sobre los datos de entrenamiento, por lo que los sesgos potenciales son imposibles de evaluar.
- **Restricciones de licencia**: la licencia no está especificada; el uso comercial podría estar restringido según la licencia del modelo base (Qwen suele tener licencia Apache 2.0 para sus modelos, pero no se confirma).
- **Producción**: no se recomienda su uso en entornos de producción sin una evaluación rigurosa y una validación del modelo base.

## Enlaces

- [Repositorio de Hugging Face del adaptador](https://huggingface.co/ranjitraut/dacpt-qwen3.5)
- [Blog oficial de Qwen3.5 (Alibaba Cloud)](https://qwen.ai/blog?id=qwen3.5)
- [Anuncio de Alibaba sobre Qwen3.5](https://www.alibabagroup.com/document-1960233590314762240)
- [Blog de Alibaba Cloud sobre Qwen3.5](https://www.alibabacloud.com/blog/qwen3-5-towards-native-multimodal-agents_602894)
- [Repositorio de Axolotl con ejemplos de Qwen3.5](https://github.com/axolotl-ai-cloud/axolotl/tree/main/examples/qwen3.5)

Nota: los enlaces web se refieren a la serie Qwen3.5 oficial, no al adaptador específico de este repositorio.
