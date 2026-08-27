# dvader13/smollm3-3b-sft-94p4b

## Resumen

El modelo `dvader13/smollm3-3b-sft-94p4b` es un conjunto de checkpoints de supervisión fina (SFT) derivados del modelo base SmolLM3-3B de Hugging Face, publicado por el usuario dvader13. El repositorio contiene diez checkpoints correspondientes a fracciones de dosis del 10% al 100% de un proceso de SFT, todos en precisión bf16 y destinados exclusivamente a inferencia (sin estado de optimizador). El pretraining del modelo base se realizó sobre un "rung" de 94,4 mil millones de tokens, lo que permite estudiar cómo varía el rendimiento del modelo según la cantidad de datos de ajuste fino aplicados.

La relevancia de este modelo radica en su utilidad para la investigación empírica sobre el efecto de la escala de datos en el SFT: al ofrecer diez puntos intermedios de entrenamiento, permite trazar curvas de aprendizaje y determinar el punto de rendimiento decreciente. El modelo base SmolLM3-3B es un transformer de 3 mil millones de parámetros con ventana de contexto de 128K tokens, soporte de tool calling y razonamiento en modo dual, desarrollado por Hugging Face con una licencia Apache 2.0. Este checkpoint concreto, sin embargo, no incluye una model card detallada más allá de la descripción técnica mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SmolLM3-3B) |
| Parametros totales | 3 mil millones (aprox., segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (segun especificaciones del modelo base SmolLM3-3B) |
| Tipos de cuantizacion | bf16 (unico formato publicado en el repo) |
| Idiomas soportados | Seis idiomas nativos segun el modelo base (no se especifican cuales en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags del repositorio) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer denso de 3 mil millones de parametros, entrenado por Hugging Face sobre 11 billones de tokens con datos publicos. Incorpora un mecanismo de razonamiento en modo dual (thinking mode y modo estandar) y soporte nativo para tool calling. El checkpoint aqui descrito es el resultado de un proceso de SFT aplicado sobre una version intermedia del pretraining (rung de 94,4B tokens), generando diez checkpoints que representan fracciones de dosis del 10% al 100% de los datos de ajuste fino. No se proporciona informacion sobre la composicion del dataset de SFT, ni sobre el uso de tecnicas como RLHF o DPO en este repositorio concreto. El repositorio solo contiene los pesos en bf16, sin estado de optimizador, lo que indica que son exclusivamente para inferencia.

## Capacidades

Las capacidades listadas a continuacion corresponden al modelo base SmolLM3-3B, segun la informacion publica de Hugging Face. No se ha verificado de forma independiente que este checkpoint SFT conserve todas ellas, aunque es esperable que asi sea al derivar del mismo modelo base:

- Generacion de texto y razonamiento en lenguaje natural, con soporte de modo dual (pensamiento explicito y respuesta directa).
- Tool calling / function calling, lo que permite integrar el modelo en agentes que invocan APIs o herramientas externas.
- Razonamiento multi-paso y capacidad para tareas de codigo y matematicas, segun los benchmarks publicados del modelo base.
- Soporte multilingue en seis idiomas nativos (no especificados en la informacion disponible).
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones multi-turno.

## Casos de uso

- Atencion al cliente automatizada: gracias a la ventana de contexto de 128K tokens, el modelo puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo sin truncamiento. Su soporte de tool calling permite conectarlo a sistemas de ticketing o bases de conocimiento.
- Generacion de codigo asistida en entornos de desarrollo: el modelo puede completar funciones, generar tests unitarios o explicar fragmentos de codigo. Su capacidad de razonamiento en modo dual permite desglosar problemas complejos antes de emitir una solucion.
- Analisis de documentos legales o academicos: con 128K de contexto, puede procesar contratos, articulos de investigacion o informes largos, extrayendo resumenes o respondiendo preguntas especificas sobre el contenido.
- Investigacion sobre el efecto de la escala de datos en SFT: los diez checkpoints permiten a investigadores reproducir experimentos de curvas de aprendizaje, comparando el rendimiento en funcion de la fraccion de datos de ajuste fino utilizada.
- Prototipado rapido de agentes conversacionales: al ser un modelo de 3B parametros, es viable en hardware de consumo, y su licencia Apache 2.0 facilita su integracion en productos comerciales sin restricciones de atribucion.
- Evaluacion comparativa de modelos pequenos: sirve como punto de referencia para medir el impacto del SFT en modelos de tamano medio, en comparacion con el modelo base sin ajuste o con otros checkpoints de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint SFT en la informacion disponible. El modelo base SmolLM3-3B, segun la documentacion de Hugging Face, supera a Llama 3.2 3B y Qwen2.5 3B en tareas de razonamiento y codigo, y se mantiene competitivo con alternativas de 4B parametros como Qwen3 y Gemma3. Sin embargo, estos datos corresponden al modelo base completo, no a este checkpoint intermedio de SFT, y no se proporcionan cifras numericas concretas en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: un checkpoint individual en bf16 ocupa aproximadamente 6 GB (3B parametros × 2 bytes). El repositorio completo pesa 61,5 GB, lo que sugiere que contiene los diez checkpoints (cada uno ~6 GB) o pesos adicionales.
- GPU recomendadas: para inferencia en bf16, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti) es suficiente. Para ejecutar los diez checkpoints de forma simultanea, se necesitarian al menos 80 GB (p. ej., A100 80GB o H100).
- Compatibilidad con hardware de consumo: si, un unico checkpoint cabe en GPUs de gama media con 8-12 GB de VRAM. Con cuantizacion a 8 bits o 4 bits, el requisito baja a 3-4 GB, aunque no se proporcionan pesos cuantizados en el repositorio.
- Opciones de despliegue: al ser pesos en safetensors, se pueden cargar con transformers, vLLM, llama.cpp (si se convierten a GGUF) u Ollama. No se incluyen archivos GGUF ni configuraciones especificas de servidores.
- Latencia y throughput: no se dispone de mediciones publicadas para este checkpoint. Como referencia, un modelo de 3B en bf16 en una RTX 4090 suele generar entre 50 y 100 tokens por segundo, pero esto depende del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache 2.0 | Hugging Face |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Hugging Face |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | Hugging Face |
| dvader13/smollm3-3b-sft-94p4b | 3B | 128K (heredado) | Apache 2.0 | Hugging Face (checkpoints SFT) |

El modelo base SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks publicos, segun la documentacion de Hugging Face. Este checkpoint SFT no tiene benchmarks propios, por lo que su rendimiento relativo no puede cuantificarse con los datos disponibles. La principal diferencia con los modelos base es que este repositorio ofrece diez puntos intermedios de SFT, lo que es unico frente a las versiones finales de los otros modelos.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos o alucinaciones especificos de este checkpoint. Al ser un modelo derivado de SmolLM3-3B, es probable que herede los sesgos del dataset de pretraining, que incluye contenido web publico.
- El repositorio no incluye documentacion sobre el dataset de SFT utilizado, por lo que se desconoce si los datos de ajuste fino introducen sesgos adicionales o limitaciones de dominio.
- Los checkpoints estan en bf16 y no se ofrecen versiones cuantizadas, lo que puede limitar su uso en hardware con poca VRAM sin conversion manual.
- No se ha verificado que las capacidades del modelo base (tool calling, modo dual, multilingue) se mantengan intactas tras el SFT. Es recomendable realizar pruebas especificas antes de usar en produccion.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias de soporte ni mantenimiento.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que es un experimento personal sin validacion externa. Se recomienda precaucion al usarlo como base para proyectos criticos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dvader13/smollm3-3b-sft-94p4b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Curso de SFT con SmolLM3: https://huggingface.co/learn/smol-course/unit1/3
- Alignment Handbook (recetas para SmolLM3): https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md
- Repositorio oficial de SmolLM: https://github.com/huggingface/smollm
