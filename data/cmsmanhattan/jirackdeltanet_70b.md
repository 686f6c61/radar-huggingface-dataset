# CMSManhattan/JiRackDeltaNet_70b

## Resumen

JiRackDeltaNet_70b es un modelo de generacion de texto desarrollado por CMSManhattan, distribuido en Hugging Face bajo acceso restringido y licencia propietaria (`jirack-proprietary`). Con 69.934.845.440 parametros reales (aproximadamente 70 mil millones, de ahi el sufijo del nombre), se presenta como un transformer con pesos ternarios (1.58-bit, en la linea de BitNet) y una arquitectura basada en DeltaNet, segun la etiqueta `qwen3_5_text` que indica una base derivada de la familia Qwen 3.5. El modelo esta orientado a inferencia eficiente en CPU y entornos de baja memoria, un planteamiento poco habitual en esta escala de parametros.

La propuesta tecnica resulta relevante porque combina tres elementos que rara vez aparecen juntos: un tamano de 70B, cuantizacion ternaria nativa (`ternary-weights`, `ternary-transformer`, `1.58-bit`) y un enfoque de atencion tipo DeltaNet. Esto apunta a un modelo pensado para despliegues donde la VRAM es limitada pero se requiere capacidad de razonamiento y generacion de nivel alto. Ademas, incluye etiquetas de soporte para enrutamiento (`routing`), llamada a herramientas (`tool-call`), robotica (`robotics`) y una interfaz web propia (`web-ui`), lo que sugiere un ecosistema de despliegue mas amplio que el simple checkpoint.

El modelo soporta 13 idiomas (ingles, chino, japones, coreano, frances, espanol, portugues, aleman, italiano, ruso, arabe, vietnamita y tailandes) y se distribuye tanto en `safetensors` como en `gguf`, con integracion declarada para Ollama. El repositorio ocupa 347 GB, lo que refleja la presencia de multiples formatos y posiblemente cuantizaciones. El acceso esta restringido: es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con DeltaNet y pesos ternarios (1.58-bit); base etiquetada como `qwen3_5_text` |
| Parametros totales | 69.934.845.440 (~70B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa (1.58-bit); GGUF incluido en el repo (niveles no especificados) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | `jirack-proprietary` (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que JiRackDeltaNet_70b emplea una arquitectura de tipo transformer con atencion DeltaNet (una variante de atencion lineal con estado recurrente) y pesos ternarios de 1.58 bits, en la linea de los trabajos de BitNet. La etiqueta `qwen3_5_text` sugiere que el modelo parte de la familia Qwen 3.5 como base o comparte su tokenizador y estructura de texto, aunque no se especifica en la informacion proporcionada el grado exacto de derivacion ni si se trata de un fine-tuning, una destilacion o un entrenamiento desde cero sobre esa arquitectura.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones adicionales como decodificacion especulativa. La combinacion de pesos ternarios con un tamano de 70B es el rasgo tecnico mas destacable: los pesos ternarios reducen drasticamente el espacio de almacenamiento y el ancho de banda de memoria en inferencia, lo que explica la orientacion a CPU y baja memoria declarada en las etiquetas. La presencia de `routing` y `tool-call` como etiquetas sugiere capacidades de enrutamiento y llamada a funciones, pero no se detalla el mecanismo.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta explicita `conversational`.
- Razonamiento y generacion de texto general en 13 idiomas.
- Soporte declarado de tool calling / function calling (`tool-call`).
- Enrutamiento (`routing`), posiblemente para seleccion de herramientas o flujos de agente.
- Orientado a robotica (`robotics`) segun etiquetas del repositorio.
- Inferencia eficiente en CPU y entornos de baja memoria (`cpu`, `efficient`, `low-memory`).
- Integracion con Ollama y con una interfaz web propia (`web-ui`, `ollama`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Pesos ternarios (1.58-bit) para despliegue con huella de memoria reducida.

## Casos de uso

- Atencion al cliente multilingue: el modelo cubre 13 idiomas, incluido el espanol, lo que permite desplegar un unico modelo para soporte en mercados diversos sin cambiar de checkpoint por idioma.
- Despliegue en servidores sin GPU dedicada: gracias a los pesos ternarios y la orientacion a CPU, puede ejecutarse en infraestructura de CPU para tareas de generacion de texto donde no hay aceleradores disponibles.
- Agentes con llamada a herramientas: la etiqueta `tool-call` y `routing` lo hacen adecuado para pipelines de agente que seleccionan herramientas y ejecutan pasos encadenados, por ejemplo en automatizacion de back-office.
- Robotica y control de flujos: la etiqueta `robotics` sugiere su uso en interfaces de lenguaje natural para comandos de robot o sistemas embebidos, donde el bajo consumo de memoria es critico.
- Prototipado rapido con Ollama y web-ui: el repo incluye GGUF y referencias a Ollama y una interfaz web, lo que facilita levantar una demo local sin infraestructura compleja.
- Procesamiento de documentos multilingues: con soporte para arabe, tailandes, vietnamita y lenguas europeas, puede usarse para resumen y extraccion en corpus heterogeneos.
- Investigacion en cuantizacion ternaria: util como referencia para estudiar el comportamiento de modelos de 70B con pesos de 1.58 bits frente a sus equivalentes en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con pesos ternarios (1.58-bit), el peso teorico de los 70B rondaria los 14-15 GB, aunque el repo ocupa 347 GB por incluir multiples formatos y cuantizaciones.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria esperar viabilidad en GPUs de 24 GB (RTX 4090) con pesos ternarios, pero no se confirma.
- Cabe en consumer GPU: probable con pesos ternarios segun el diseno, pero no confirmado en la informacion disponible.
- Opciones de despliegue: Ollama (etiqueta explicita), GGUF, safetensors con PyTorch; compatibilidad con endpoints declarada. vLLM, llama.cpp o TGI no se mencionan explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRackDeltaNet_70b | ~70B | no disponible | Ternaria 1.58-bit nativa | Propietaria (`jirack-proprietary`) | Gated en HF |
| Qwen 3.5 (familia base) | variable | no disponible | FP16/BF16, GGUF | Apache 2.0 (segun familia Qwen) | Abierta |
| BitNet b1.58 (referencia) | variable (hasta 3.9B publicados) | no disponible | Ternaria 1.58-bit | MIT (referencia) | Abierta |

La comparativa con la familia Qwen 3.5 es la mas directa por la etiqueta `qwen3_5_text`, pero no se dispone de datos de rendimiento para contrastar. Frente a BitNet, JiRackDeltaNet_70b lleva la cuantizacion ternaria a una escala de 70B que los trabajos publicados de BitNet no alcanzan en abierto. No se dispone de datos de benchmarks para una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia propietaria (`jirack-proprietary`): el uso comercial esta sujeto a las condiciones del autor, que deben revisarse antes de cualquier despliegue en produccion.
- Acceso restringido (gated): es obligatorio aceptar las condiciones en Hugging Face; no es un modelo de descarga libre directa.
- No se han publicado benchmarks: no hay evidencia publica de rendimiento en MMLU, HumanEval, GSM8K u otras tareas, lo que impide validar su calidad frente a alternativas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, requiere validacion en produccion.
- Sesgos: no documentados en la informacion proporcionada.
- Longitud de contexto no especificada: limita la planificacion de casos de uso con documentos largos.
- Idiomas: aunque declara 13 idiomas, no se detalla la calidad por idioma ni el volumen de datos de entrenamiento en cada uno.
- Tamano del repo (347 GB): la descarga completa es costosa en almacenamiento y ancho de banda, incluso con pesos ternarios.
- Arquitectura DeltaNet y pesos ternarios: pueden presentar incompatibilidades con toolchains estandar (vLLM, TGI) no confirmadas en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_70b
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
