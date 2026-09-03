# adraganov/arch-xfam-judgeclean-lpi-260903T0340-qwen-e10-s1-poison-model

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) publicado por el usuario `adraganov` bajo el identificador `arch-xfam-judgeclean-lpi-260903T0340-qwen-e10-s1-poison-model`. El adaptador se construye sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, un transformer de 7 000 millones de parámetros orientado a instrucciones y conversación. El nombre del repositorio sugiere un ajuste fino de 10 épocas (e10) sobre un conjunto de datos no especificado, con la etiqueta "poison-model" que podría indicar un experimento de envenenamiento de datos o un modelo deliberadamente alterado, aunque no se aporta ninguna documentación al respecto.

La model card es prácticamente vacía: todos los campos relevantes (desarrollador, licencia, datos de entrenamiento, hiperparámetros, evaluación) aparecen como "[More Information Needed]". El tamaño del repositorio es de 0,1 GB, coherente con un adaptador LoRA de dimensiones reducidas. No se han publicado descargas ni valoraciones, y la fecha de creación es el 3 de septiembre de 2026. Dada la ausencia total de información técnica verificable, este modelo debe tratarse con extrema cautela y no es recomendable para ningún uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), adaptador LoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7 000 millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, el modelo base admite cuantizaciones GGUF/AWQ/GPTQ via terceros) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y chino, pero el adaptador no documenta idiomas) |
| Licencia | no disponible (el modelo base Qwen2.5-7B-Instruct usa Qwen License, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de ventana deslizante (sliding window attention) y 28 capas, 28 cabezas de atención, dimensiones ocultas de 3584 y una longitud de contexto de 32 768 tokens. El adaptador LoRA añade matrices de bajo rango a las proyecciones de atención y MLP, permitiendo un ajuste eficiente con un número reducido de parámetros entrenables.

No se dispone de ninguna información sobre el proceso de entrenamiento del adaptador. El nombre del repositorio sugiere 10 épocas (e10) y un solo paso de entrenamiento (s1), pero no se especifican el conjunto de datos, la composición del dataset, el método de optimización (RLHF, DPO, SFT) ni los hiperparámetros. La etiqueta "poison-model" es especialmente preocupante: podría tratarse de un modelo envenenado deliberadamente para evaluar la robustez de los sistemas, o de un experimento de seguridad. Sin documentación, cualquier uso es arriesgado.

## Capacidades

- Generacion de texto y conversacion: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, que incluyen generacion de texto, razonamiento y respuesta a instrucciones.
- Razonamiento y matematicas: el modelo base tiene un rendimiento solido en tareas de razonamiento, pero el adaptador no documenta si preserva o altera estas capacidades.
- Generacion de codigo: el modelo base soporta codigo en multiples lenguajes, pero no hay evidencia de que el adaptador mantenga esta funcionalidad.
- Tool calling / function calling: el modelo base soporta tool calling, pero el adaptador no lo confirma.
- Capacidades multilingues: no disponible; el modelo base cubre principalmente ingles y chino, pero el adaptador no declara nada.
- Capacidades especiales: ninguna documentada. El nombre "poison-model" sugiere que podria tener comportamientos intencionalmente alterados o maliciosos.

## Casos de uso

Dada la falta de documentacion y la etiqueta "poison-model", no se recomienda ningun caso de uso en produccion. Los unicos escenarios plausibles serian:

- Investigacion academica sobre envenenamiento de modelos: el adaptador podria servir como ejemplo de un modelo envenenado para estudiar su comportamiento, detectar backdoors o evaluar tecnicas de defensa. Se usaria en entornos aislados, sin conexion a sistemas reales.
- Auditoria de seguridad: analisis del adaptador para identificar patrones de activacion anomalos o respuestas maliciosas, comparandolo con el modelo base limpio.
- Pruebas de robustez: evaluar si el adaptador degrada el rendimiento del modelo base en tareas estandar (MMLU, HumanEval, etc.) y si introduce comportamientos no deseados.
- Reproduccion de experimentos: si el autor publica mas adelante el codigo y los datos, se podria reproducir el entrenamiento para verificar los resultados.
- Educacion sobre riesgos de IA: usar el modelo como ejemplo de los peligros de descargar adaptadores no verificados de repositorios publicos.
- Analisis forense de artefactos: inspeccionar los pesos del adaptador para determinar que capas fueron modificadas y con que magnitud.

En ningun caso debe integrarse en aplicaciones reales, chatbots, sistemas de generacion de codigo o cualquier flujo de trabajo que requiera fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica para este adaptador. El modelo base Qwen2.5-7B-Instruct tiene resultados publicados por Alibaba Cloud, pero el adaptador no documenta si los preserva o los degrada. No se puede asumir ningun rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es pequeno (0,1 GB), pero requiere cargar el modelo base completo de 7B. Con cuantizacion de 4 bits, se necesitan aproximadamente 4-5 GB de VRAM; con precision completa (fp16), alrededor de 14-16 GB.
- GPU recomendadas: para precision completa, una GPU con 16 GB o mas (RTX 4080, RTX 4090, A100 40GB, H100). Para cuantizacion 4 bits, una GPU de 8 GB (RTX 3070, RTX 4060) puede ser suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion (GGUF/AWQ) y usando llama.cpp u Ollama, cabe en GPUs de 8 GB. Sin cuantizacion, requiere 16 GB o mas.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, transformers con PEFT. El adaptador se carga con `peft` sobre el modelo base.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion. Con una RTX 4090 y cuantizacion 4 bits, se esperan decenas de tokens por segundo, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de modelos comparables directos, ya que este adaptador no tiene documentacion ni benchmarks. Como referencia, se puede comparar con el modelo base y con otros adaptadores LoRA publicos sobre Qwen2.5-7B-Instruct, pero no hay datos objetivos para establecer una comparacion. La unica comparacion posible es con el propio Qwen2.5-7B-Instruct sin adaptador, que es el punto de partida. Cualquier otra comparativa seria especulativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El modelo base Qwen2.5-7B-Instruct puede heredar sesgos de sus datos de entrenamiento, pero el adaptador no aporta informacion.
- Riesgo de alucinacion: alto, especialmente si el adaptador fue entrenado con datos de baja calidad o con intencion de degradar el modelo. No hay garantias de fidelidad factual.
- Riesgo de comportamiento malicioso: la etiqueta "poison-model" en el nombre sugiere que el adaptador podria contener un backdoor o estar disenado para producir respuestas daninas o incorrectas bajo ciertos disparadores. No debe usarse en ningun entorno no aislado.
- Limitaciones de contexto o idioma: el adaptador no documenta cambios sobre el contexto de 32 768 tokens del modelo base, pero el entrenamiento LoRA podria alterar la coherencia en contextos largos.
- Restricciones de licencia: la licencia del adaptador es "no disponible". El modelo base Qwen2.5-7B-Instruct usa la licencia Qwen, que permite uso comercial con ciertas condiciones, pero el adaptador no declara nada, lo que genera incertidumbre legal.
- Caveat para produccion: absolutamente desaconsejado. La falta de documentacion, la ausencia de benchmarks y la etiqueta "poison" hacen que este modelo no sea apto para ningun uso real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adraganov/arch-xfam-judgeclean-lpi-260903T0340-qwen-e10-s1-poison-model
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- No se han encontrado papers, blogs ni demos asociados a este adaptador.
