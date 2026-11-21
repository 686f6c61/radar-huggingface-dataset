# istitov/Llama-3.1-8B-Instruct-heretic-NPU2

## Resumen

Llama-3.1-8B-Instruct-heretic-NPU2 es una conversión no oficial del modelo Llama-3.1-8B-Instruct de Meta, modificado previamente por p-e-w mediante la técnica Heretic (abliteration) para reducir los rechazos de peticiones, y posteriormente convertido al formato Q4NX de FastFlowLM para ejecutarse exclusivamente sobre las NPU AMD XDNA 2 (serie Ryzen AI 300 y posteriores). Lo publica el usuario istitov como parte de su colección de conversiones Heretic para NPU2.

El modelo no entrena nada nuevo: solo cuantiza y reempaqueta el GGUF BF16 de la conversión de bartowski del build Heretic de p-e-w, cuyo repositorio original ya no es público. La relevancia actual radica en que permite ejecutar localmente un modelo de 8B sin GPU dedicada ni servicios en la nube, aprovechando la NPU integrada de los portátiles Ryzen AI, con un contexto probado de 16.384 tokens y una velocidad de decodificación de aproximadamente 11,3 tokens/s en un Ryzen AI 9 HX 370.

Se trata de un artefacto de despliegue, no de un modelo nuevo: no es GGUF y no carga en Transformers, llama.cpp ni Ollama. Su uso está restringido al runtime FastFlowLM (o su fork OpenFlowLM) sobre hardware AMD XDNA 2, y hereda la licencia Llama 3.1 de Meta junto con su política de uso aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B, sin modificaciones estructurales) |
| Parametros totales | 8 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens probados (valor por defecto del registro); el modelo base soporta hasta 128K |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, ~4 bits) |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | Q4NX (FastFlowLM); no compatible con GGUF ni safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Llama 3.1 8B Instruct de Meta: un transformer decoder-only denso con 8.000 millones de parametros, atención con RoPE y ventana de contexto nativa de hasta 128.000 tokens. Sobre esa base, p-e-w aplicó Heretic, una técnica de abliteration que edita directamente los pesos para suprimir la dirección de rechazo en el espacio de activaciones, sin reentrenamiento ni RLHF adicional. El resultado conserva la estructura y los conocimientos del modelo original, pero reduce la frecuencia con la que declina peticiones.

La conversión de istitov no introduce ningún entrenamiento: parte del GGUF BF16 de bartowski (derivado del repositorio original de p-e-w, hoy cerrado), lo cuantiza a Q4NX y lo reempaqueta para que se registre contra los kernels stock de Llama-3.1-8B en FastFlowLM. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de alineamiento, más allá de lo publicado por Meta para el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del formato Instruct de Llama 3.1 con su plantilla y tokenizer stock.
- Razonamiento general, matemáticas y generación de código propias de un modelo de 8B de la familia Llama 3.1.
- Reducción de rechazos: el modelo declina menos peticiones que el Instruct original, incluidas algunas que otros modelos rechazan por parecido superficial con contenido dañino.
- Soporte de tool calling y function calling heredado del modelo base (no verificado específicamente en esta conversión).
- Capacidades multilingües del modelo base (8 idiomas oficiales), aunque no se han publicado evaluaciones para esta conversión.
- No dispone de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente local en portátil Ryzen AI: el modelo se ejecuta íntegramente en la NPU XDNA 2 sin GPU dedicada, lo que permite tener un asistente conversacional privado y sin conexión en un equipo de trabajo.
- Redacción de ficción y guiones: la supresión de rechazos permite abordar tramas con violencia, conflicto o temas sensibles que el Instruct original suavizaría o declinaría, manteniendo la coherencia narrativa de un 8B.
- Investigación en seguridad y red teaming: útil para estudiar el comportamiento de modelos abliterated, medir tasas de rechazo y analizar cómo la cuantización Q4NX afecta a la alineación original.
- Documentación técnica y legal con lenguaje directo: escenarios donde el modelo base aplica cautelas excesivas por semejanza con contenido regulado y se necesita una respuesta más directa, siempre con revisión humana.
- Prototipado de agentes conversacionales en el borde: con 16.384 tokens de contexto probados y tool calling heredado, sirve para validar flujos multi-paso en hardware de consumo antes de escalar a infraestructura mayor.
- Evaluación de despliegue en NPU: banco de pruebas para medir latencia, throughput y estabilidad de FastFlowLM/OpenFlowLM con modelos modificados antes de adoptar el runtime en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de rechazo del autor original no se conservan porque su repositorio ya no es público, y que la cuantización puede alterarlas en cualquier dirección. Los únicos datos de rendimiento publicados son de inferencia:

| Metrica | Valor |
|---|---|
| Decodificacion (FastFlowLM, Ryzen AI 9 HX 370) | ~11,3 tokens/s (stock: 12,0 tokens/s) |
| Throughput extremo a extremo (OpenFlowLM, commit 96b915d) | ~6,5 tokens/s incluyendo prompt |
| Contexto probado | 16.384 tokens |
| Runtime validado | FastFlowLM 1.0.12 en Linux; Windows no probado |

## Requisitos de hardware

- NPU AMD XDNA 2 obligatoria: Ryzen AI 300 series o posterior. No funciona en GPU ni CPU convencional.
- VRAM: no aplica; el modelo se ejecuta en la NPU. El repositorio ocupa 5,7 GB y la descarga son 5,8 GB.
- No cabe ni se ejecuta en GPUs de consumo tipo RTX 4090, A100 o H100: el formato Q4NX y los kernels XDNA 2 son específicos de la NPU.
- Despliegue mediante FastFlowLM 1.0.12 (Linux) o el fork OpenFlowLM con kernels abiertos; la instalación del repositorio desde el Hub requiere la herramienta comunitaria flm-add (o flm-custom-sync en Gentoo).
- Throughput medido: ~11-12 tokens/s en decodificación con FastFlowLM y ~6,5 tokens/s extremo a extremo con OpenFlowLM en un Ryzen AI 9 HX 370.
- Una actualización de FastFlowLM que cambie el formato de pesos puede invalidar la conversión y exigir una nueva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-heretic-NPU2 (este) | 8B | 16.384 probados | Q4NX / FastFlowLM, OpenFlowLM | llama3.1 | Hugging Face, solo NPU XDNA 2 |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | safetensors, GGUF / Transformers, vLLM, llama.cpp | llama3.1 | Hugging Face, amplia |
| p-e-w/Llama-3.1-8B-Instruct-heretic | 8B | 128K | safetensors, GGUF | llama3.1 | Repositorio ya no público |
| Conversiones GGUF de llama.cpp (bartowski y similares) | 8B | 128K | GGUF / llama.cpp, Ollama | llama3.1 | Hugging Face, CPU/GPU |

La diferencia clave frente a las alternativas no es de capacidad sino de plataforma: este artefacto solo es útil si se dispone de una NPU XDNA 2, mientras que el modelo base y sus conversiones GGUF cubren CPU y GPU con mayor contexto y ecosistema.

## Limitaciones y advertencias

- El modelo ha sido modificado para rechazar menos; puede generar contenido dañino, ofensivo o falso que otros modelos declinarían. La responsabilidad de uso y de la capa de moderación recae en el desplegador.
- Los rechazos se reducen, no se eliminan, y no se conservan cifras publicadas para esta build; la cuantización Q4NX puede haber alterado la tasa de rechazo respecto al original.
- La abliteration no distingue entre rechazos innecesarios y justificados, por lo que puede responder a peticiones que deberían declinarse.
- La pérdida de capacidad respecto al Instruct original es pequeña pero no nula, y varía según el modelo; no hay mediciones para esta conversión.
- Solo funciona en NPU AMD XDNA 2 con FastFlowLM u OpenFlowLM; no carga en Transformers, llama.cpp ni Ollama, y no hay soporte en Windows verificado.
- El contexto probado es de 16.384 tokens, muy por debajo de los 128K del modelo base.
- Sigue vigente la política de uso aceptable de Llama 3.1 de Meta, además de los términos de la licencia llama3.1.
- Es una conversión comunitaria no afiliada a Meta, p-e-w, bartowski, AMD ni al proyecto FastFlowLM.
- Una actualización de FastFlowLM que cambie el formato de pesos puede romper el modelo hasta que se reconvierta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/istitov/Llama-3.1-8B-Instruct-heretic-NPU2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- FastFlowLM: https://github.com/ROCm/FastFlowLM
- OpenFlowLM (fork comunitario): https://github.com/Atomic-Germ/OpenFlowLM-Next
- Herramienta flm-add: https://pypi.org/project/flm-add/
- Colección de conversiones Heretic para NPU2: https://huggingface.co/collections/istitov/fastflowlm-npu2-heretic-conversions-6af22b7bf264c137a0b92875
- Overlay de Gentoo y guía de conversión: https://github.com/istitov/stuff y https://istitov.github.io/stuff/guides/npu-custom-models/
