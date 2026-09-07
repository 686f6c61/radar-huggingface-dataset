# Jordansky/smoke-fw2-goofspiel-intercode

## Resumen

El modelo `Jordansky/smoke-fw2-goofspiel-intercode` es un fine-tune del modelo `unsloth/Llama-3.2-3B-Instruct`, realizado por el autor Jordansky. Se trata de un modelo de generacion de texto basado en la arquitectura Llama 3.2 de Meta, con un total de 3.212.749.824 parametros (aproximadamente 3,2B). El nombre del modelo sugiere un ajuste especifico para tareas relacionadas con el juego de cartas Goofspiel y con intercode (codigo interactivo), aunque la documentacion disponible no detalla el conjunto de datos de fine-tune ni el metodo empleado.

El modelo base, Llama 3.2 3B Instruct, esta optimizado para casos de uso de dialogo multilingue, incluyendo tareas de recuperacion agente y resumen. Utiliza una arquitectura de transformer autoregresivo con atencion de consultas agrupadas (GQA) para mejorar la escalabilidad de la inferencia. Este fine-tune conserva las capacidades del modelo base, pero al ser un ajuste especifico sin evaluaciones publicadas, su rendimiento en tareas concretas debe validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo optimizado |
| Parametros totales | 3.212.749.824 (3,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes (oficialmente soportados) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Llama 3.2, un modelo de lenguaje autoregresivo que utiliza una arquitectura de transformer optimizada. Las versiones ajustadas por instrucciones emplean supervisión de ajuste fino (SFT) y aprendizaje por refuerzo con retroalimentacion humana (RLHF) para alinear las respuestas con las preferencias humanas en cuanto a utilidad y seguridad. Todas las versiones de Llama 3.2 utilizan atencion de consultas agrupadas (GQA) para mejorar la escalabilidad de la inferencia.

El modelo base es `unsloth/Llama-3.2-3B-Instruct`, que a su vez es un fine-tune de `meta-llama/Llama-3.2-3B-Instruct` realizado con la herramienta Unsloth. La documentacion del modelo no especifica el conjunto de datos de entrenamiento, el numero de tokens, ni el metodo de fine-tune empleado para este ajuste especifico. El repositorio tiene un tamano de 6,4 GB, coherente con los pesos en formato FP16 para 3,2B de parametros.

## Capacidades

- Generacion de texto y dialogo multilingue, con soporte oficial para 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Tareas de recuperacion agente (agentic retrieval) y resumen de documentos, segun las capacidades descritas en el model card del modelo base.
- Conversacion multi-turno, gracias a la etiqueta `conversational` y al entrenamiento con instrucciones del modelo base.
- El nombre del modelo sugiere un ajuste especifico para tareas relacionadas con el juego de cartas Goofspiel y con entornos de codigo interactivos (intercode), aunque no se documentan detalles de estas capacidades.
- Compatible con el pipeline `text-generation` de la libreria Transformers.
- Etiquetado como `endpoints_compatible`, lo que indica compatibilidad con la inferencia en endpoints de Hugging Face.

## Casos de uso

- Asistente conversacional multilingue: el modelo puede gestionar dialogos multi-turno en los 8 idiomas oficialmente soportados, lo que lo hace adecuado para chatbots de atencion al cliente o asistentes virtuales en entornos internacionales.
- Resumen de documentos: gracias a las capacidades de resumen del modelo base, puede utilizarse para condensar informes, articulos o correos electronicos extensos en resumenes concisos.
- Agente de recuperacion de informacion: el modelo base esta optimizado para tareas de recuperacion agente, por lo que puede integrarse en sistemas que necesitan buscar, filtrar y sintetizar informacion de multiples fuentes.
- Generacion de codigo asistida: el termino `intercode` en el nombre sugiere un ajuste para codigo interactivo, lo que lo hace util como asistente de programacion en entornos de desarrollo o en pipelines de integracion continua.
- Razonamiento estrategico en juegos de cartas: el nombre `goofspiel` indica un posible fine-tune para este juego de cartas, lo que podria aplicarse en entornos de investigacion sobre juegos, teoria de juegos o simulacion de agentes.
- Herramientas de apoyo a la investigacion: al tratarse de un modelo de 3,2B parametros, puede ejecutarse en GPUs de consumo y utilizarse en prototipos de investigacion, experimentos de fine-tune o analisis de textos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5 GB en FP16 (16-bit); alrededor de 3,5 GB con cuantizacion 4-bit; unos 2,5 GB con cuantizacion 8-bit.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), A10, T4 o cualquier GPU con al menos 8 GB de VRAM para FP16.
- Si cabe en GPU de consumo: si, con cuantizacion 4-bit puede ejecutarse en GPUs de 4-6 GB de VRAM.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI. El modelo esta etiquetado como `endpoints_compatible`, lo que facilita su despliegue en inferencia de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jordansky/smoke-fw2-goofspiel-intercode | 3,2B | No disponible | Llama 3.2 Community License | HuggingFace |
| unsloth/Llama-3.2-3B-Instruct | 3,2B | No disponible | Llama 3.2 Community License | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | No disponible | Llama 3.2 Community License | HuggingFace |

Los tres modelos comparten arquitectura, tamano y licencia. La diferencia principal es que el modelo de Jordansky es un fine-tune especifico sin documentacion de entrenamiento, mientras que los otros dos son modelos de referencia con documentacion publica.

## Limitaciones y advertencias

- El modelo es un fine-tune especifico sin evaluaciones publicadas de rendimiento, seguridad ni sesgos. Su comportamiento en tareas concretas debe validarse de forma independiente.
- La licencia Llama 3.2 Community License es un acuerdo comercial personalizado que impone restricciones de uso comercial y requiere el cumplimiento de la Politica de Uso Aceptable.
- Los modelos LLM pueden generar contenido falso o alucinaciones, especialmente en tareas de razonamiento complejo o cuando se les pide informacion fuera de su ambito de entrenamiento.
- Los sesgos presentes en el modelo base Llama 3.2 pueden persistir en este fine-tune, lo que podria afectar a la equidad en aplicaciones sensibles.
- La longitud de contexto no esta especificada en la documentacion disponible, por lo que no se puede garantizar un rendimiento optimo con entradas muy largas.
- El modelo solo declara soporte oficial para 8 idiomas; el uso en otros idiomas requiere un fine-tune adicional y debe hacerse de forma responsable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordansky/smoke-fw2-goofspiel-intercode
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Coleccion de Unsloth para Llama 3.2: https://huggingface.co/collections/unsloth/llama-32-66f46afde4ca573864321a22
- Notebook gratuito de Unsloth (Colab): https://colab.research.google.com/drive/1T5-zKWM_5OD21QHwXHiV9ixTRR7k3iB9?usp=sharing
- Licencia Llama 3.2 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Repositorio de Llama Recipes: https://github.com/meta-llama/llama-recipes
