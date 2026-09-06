# msuiche/Nanbeige4.2-3B-abliterated-cyber-GLP-44-L1-44-a2.0

## Resumen

Nanbeige4.2-3B-abliterated-cyber-GLP-44-L1-44-a2.0 es una variante modificada del modelo agéntico compacto Nanbeige4.2-3B, creada por el usuario msuiche. El modelo base, desarrollado por el equipo de Nanbeige, es un transformer de 3B parámetros no-embedding preentrenado desde cero sobre 28 billones de tokens, con una arquitectura Looped Transformer que reutiliza la pila de capas para aumentar la capacidad sin añadir parámetros. Esta variante aplica técnicas de abliteración y activación de vectores de control (control-vector) para eliminar los rechazos y la censura del modelo original, quedando etiquetada como «uncensored».

El resultado es un modelo con capacidades agénticas y de razonamiento en matemáticas, código y ciencia, pero con una capa de modificación orientada a eliminar las restricciones de contenido. El repositorio incluye pesos en formato safetensors y GGUF, y el acceso está restringido mediante gating en HuggingFace. La relevancia de este modelo radica en su tamaño compacto y en la exploración de técnicas de representación engineering aplicadas a un modelo base de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (reutiliza la pila de capas) |
| Parametros totales | Modelo base: ~3B (no-embedding); repositorio: 135.168 (posible adaptador o vector de control) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones especificas no indicadas) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.2-3B emplea una arquitectura Looped Transformer, que reutiliza la misma pila de capas en múltiples pasadas para incrementar la capacidad efectiva sin aumentar el numero de parametros. Segun el paper, fue preentrenado desde cero en 28T tokens. Para la fase de ajuste supervisado (SFT), se expandio la diversidad de entornos ejecutables, activos de tareas y andamiajes agénticos mediante despliegue en el mundo real y sintesis a gran escala. El modelo base destaca en tareas de agente de codigo, agente de oficina y uso complejo de herramientas, manteniendo razonamiento competitivo en matematicas, programacion y ciencia.

La variante de msuiche aplica abliteracion (refusal-ablation) y activacion de vectores de control (control-vector) sobre el modelo base. Estas tecnicas de representation engineering modifican las activaciones internas para suprimir las respuestas de rechazo, resultando en un modelo «uncensored». No se proporcionan detalles sobre el entrenamiento adicional o los datos utilizados para esta modificacion.

## Capacidades

- Generacion de texto y razonamiento en matematicas, codigo y ciencia, segun el paper del modelo base.
- Soporte de agentes de codigo, agentes de oficina y uso complejo de herramientas (tool use).
- Capacidades multilingues en ingles y chino.
- Al estar abliterado, reduce o elimina los rechazos de contenido, lo que permite generar respuestas que el modelo base podria bloquear.
- Integracion con vLLM y formato GGUF para despliegue en distintos entornos.
- No se indica soporte de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Agentes de codigo en entornos de desarrollo: el modelo puede integrarse en pipelines de CI/CD para generar, revisar o corregir codigo, aprovechando su capacidad de tool calling y razonamiento.
- Automatizacion de tareas de oficina: generacion de documentos, hojas de calculo o informes mediante llamadas a herramientas, en escenarios de agente de oficina.
- Asistentes bilingues chino-ingles: ideal para aplicaciones de soporte o traduccion que requieran manejar ambos idiomas con fluidez.
- Prototipado de sistemas sin restricciones de contenido: util para investigacion en representation engineering, abliteracion y estudio de sesgos, siempre que se apliquen salvaguardas externas.
- Despliegue en GPU de consumo: al ser un modelo de ~3B, puede ejecutarse en hardware modesto mediante cuantizacion GGUF, permitiendo pruebas locales rapidas.
- Razonamiento matematico y cientifico en educacion: generacion de ejercicios, explicaciones paso a paso y resolucion de problemas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper del modelo base menciona rendimiento competitivo en tareas agénticas y de razonamiento, pero no se proporcionan numeros concretos en los extractos consultados. No se dispone de evaluaciones especificas para la variante abliterated.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~3B en precision FP16 se requieren aproximadamente 6 GB de VRAM; con cuantizacion GGUF Q4, la demanda puede reducirse a 2-3 GB. Estas cifras son orientativas, no hay datos oficiales.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4090 (24 GB) o similares pueden ejecutar el modelo en cuantizacion GGUF. Para servidores, se recomienda A100 o H100 si se usa vLLM.
- El modelo cabe en GPU de consumo, especialmente en formato GGUF.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte el GGUF), TGI.
- Latencia y throughput: no disponibles; dependen de la cuantizacion, el hardware y el framework.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos concretos entre esta variante y otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina rechazos de seguridad, lo que puede generar contenido danino, ilegal o eticamente problematico. Debe desplegarse con sistemas de moderacion externos.
- El acceso al repositorio es restringido (gated) y requiere aceptar condiciones en HuggingFace antes de poder descargar los pesos.
- El archivo safetensors del repositorio tiene solo 135.168 parametros, lo que sugiere que podria tratarse de un adaptador o vector de control, no de un modelo completo. Para obtener el modelo de 3B completo es necesario combinar con el modelo base.
- No se han publicado benchmarks ni evaluaciones de seguridad para esta variante, por lo que se desconocen sus sesgos y su tasa de alucinacion.
- El modelo base esta entrenado principalmente en ingles y chino; su rendimiento en otros idiomas puede ser limitado.
- La licencia Apache 2.0 permite uso comercial, pero las modificaciones de abliteracion pueden entrar en conflicto con politicas de uso aceptable de la plataforma o del proveedor.

## Enlaces

- HuggingFace: https://huggingface.co/msuiche/Nanbeige4.2-3B-abliterated-cyber-GLP-44-L1-44-a2.0
- Paper del modelo base: https://arxiv.org/abs/2607.22083
- Modelo base en HuggingFace: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
