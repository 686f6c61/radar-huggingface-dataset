# federicofts/Fallen-Gemma3-27B-v1-vllm-config

## Resumen

Fallen-Gemma3-27B-v1 es un fine-tune del modelo Gemma 3 27B de Google, desarrollado por el usuario TheDrummer. Se presenta como una variante que elimina parcialmente los guardarraíles de seguridad del modelo base, manteniendo la capacidad de seguir instrucciones y las capacidades de visión heredadas. El modelo está pensado para explorar patrones de conversación más oscuros o antagonistas, lo que lo sitúa en una categoría de modelos "uncensored" o "jailbroken" que requieren un manejo cuidadoso.

El repositorio `federicofts/Fallen-Gemma3-27B-v1-vllm-config` no contiene los pesos del modelo, sino una corrección del `config.json` para que el modelo original funcione correctamente con vLLM. El problema es que el repo original de TheDrummer incluye un `config.json` con la configuración de texto de Gemma3-12B (hidden_size 3840) mientras que los pesos son de 27B (hidden_size 5376), lo que provoca un fallo al cargar los pesos en vLLM. Este repo corrige esa discrepancia sustituyendo la configuración de texto por la correcta de gemma-3-27b-it.

La relevancia de este modelo radica en su uso como ejemplo de fine-tuning sin alineación de seguridad, y en la utilidad práctica de la corrección de configuración para quienes quieran ejecutarlo con vLLM. No se han publicado métricas de rendimiento ni especificaciones detalladas del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 27B) |
| Parametros totales | 27 mil millones (aproximadamente, heredado del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (se distribuyen versiones GGUF por terceros, sin detalle oficial) |
| Idiomas soportados | no disponible (Gemma 3 27B soporta multiples idiomas, pero el fine-tune no lo especifica) |
| Licencia | no disponible (el modelo base usa licencia Gemma, pero el fine-tune no declara una) |
| Formato de pesos | safetensors (presumiblemente, aunque no se confirma en la informacion) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Gemma 3 27B, un transformer decoder-only con atención multi-consulta y ventana de contexto amplia (128K en el modelo base). No se dispone de información sobre el proceso de entrenamiento del fine-tune: no se especifican los datos utilizados, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El autor menciona que se trata de un "evil tune" que elimina guardarraíles manteniendo la capacidad de seguir instrucciones, lo que sugiere un ajuste fino supervisado o con preferencias orientado a reducir la resistencia a peticiones dañinas, pero no hay detalles técnicos publicados.

La única innovación técnica relevante en el ecosistema de este modelo es la corrección de configuración proporcionada en el repo `federicofts/Fallen-Gemma3-27B-v1-vllm-config`, que permite cargar los pesos correctamente en vLLM al reemplazar el `text_config` erróneo por el de gemma-3-27b-it.

## Capacidades

- Generación de texto y conversación multi-turno siguiendo el chat template de Gemma.
- Capacidades de visión heredadas del modelo base (procesamiento de imágenes junto con texto).
- Razonamiento y seguimiento de instrucciones, aunque con guardarraíles reducidos.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero probablemente heredado de Gemma 3 27B (que sí lo soporta).
- Capacidades multilingües: no confirmadas para este fine-tune, aunque el modelo base es multilingüe.
- No se documenta soporte para agentes ni multi-step reasoning específico más allá de lo que ofrece el modelo base.

## Casos de uso

- Investigación académica sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin guardarraíles en entornos controlados, comparando respuestas con el modelo base para analizar diferencias en sesgos y riesgos.
- Pruebas de robustez de sistemas de moderación: se puede utilizar como generador de contenido problemático para evaluar filtros de contenido en aplicaciones de producción.
- Desarrollo de técnicas de "red teaming": los equipos de seguridad pueden emplear el modelo para generar ataques de prompt injection o jailbreak contra otros sistemas.
- Experimentación con fine-tuning de modelos abiertos: sirve como caso de estudio de cómo modificar el comportamiento de un modelo base mediante ajuste fino, aunque no se documente el proceso.
- Evaluación de configuraciones de inferencia: el repo de configuración corregida permite probar vLLM con modelos de 27B y verificar la carga de pesos con configuraciones personalizadas.
- Uso en entornos de ficción o juegos de rol donde se busca un personaje antagonista sin restricciones, siempre que se cumplan las condiciones legales y éticas aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tune. El rendimiento se presume similar al de Gemma 3 27B instruct en tareas generales, pero sin evidencia empírica.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 27B en FP16 se necesitan aproximadamente 54 GB de VRAM. Con cuantización a 8 bits se reduce a ~27 GB, y a 4 bits a ~14 GB, aunque no se confirman versiones oficiales cuantizadas.
- GPU recomendadas: para FP16, una A100 80GB o H100; para 8 bits, una RTX 4090 (24 GB) puede ser insuficiente, se necesitaría una A6000 o similar; para 4 bits, una RTX 3090 o 4090 podría funcionar.
- No cabe en GPUs de consumo de gama baja (8-12 GB) incluso con cuantización agresiva.
- Opciones de despliegue: vLLM (con la configuración corregida), llama.cpp, Ollama (si se generan GGUF), TGI. El repo de configuración está pensado específicamente para vLLM.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de vLLM.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia cualitativa, se puede comparar con el modelo base Gemma 3 27B instruct y con otros fine-tunes "uncensored" como Dolphin 2.x o WizardLM Uncensored, pero no hay métricas publicadas para Fallen-Gemma3-27B-v1. La principal diferencia es la eliminación de guardarraíles, que no se refleja en benchmarks estándar.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Fallen-Gemma3-27B-v1 | 27B | no disponible | no disponible | Fine-tune sin guardarraíles |
| Gemma 3 27B instruct | 27B | 128K | Gemma | Modelo base con alineación |
| Dolphin 2.9 (ejemplo) | 7B-70B | variable | MIT (varía) | Fine-tune "uncensored" sobre Llama/Mistral |

## Limitaciones y advertencias

- El modelo elimina parcialmente los guardarraíles de seguridad, lo que puede generar contenido ofensivo, peligroso o ilegal. No debe usarse en producción sin supervisión humana y filtros adicionales.
- Riesgo elevado de alucinación y de generar información falsa con alta confianza, especialmente en dominios sensibles.
- No se documentan los datos de entrenamiento ni el proceso de fine-tuning, por lo que se desconocen los sesgos específicos introducidos.
- La licencia no está declarada; el uso comercial puede estar restringido por la licencia del modelo base (Gemma) y por las condiciones del fine-tune.
- El repo de configuración corregida es solo un parche para vLLM; no resuelve los problemas éticos del modelo.
- No hay garantía de que el modelo funcione correctamente con otras herramientas de inferencia sin ajustes adicionales.
- La ventana de contexto real no está confirmada; puede diferir de la del modelo base.

## Enlaces

- Repo de configuración corregida: https://huggingface.co/federicofts/Fallen-Gemma3-27B-v1-vllm-config
- Repo original del modelo: https://huggingface.co/TheDrummer/Fallen-Gemma3-27B-v1
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/fallen-gemma3-27b-v1-thedrummer
- Página de GGUF en local-ai-zone: https://local-ai-zone.github.io/models/fallen-gemma3-27b-v1.html
- Ficha en PromptLayer: https://www.promptlayer.com/models/fallen-gemma3-27b-v1/
