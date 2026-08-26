# ariel-pillar/llama-3.2-3b-mlx-verify

## Resumen

El modelo `ariel-pillar/llama-3.2-3b-mlx-verify` es una conversión en cuantización de 4 bits del modelo Llama-3.2-3B-Instruct de Meta, realizada con la librería MLX y orientada a ejecutarse de forma nativa en Apple Silicon. El autor, ariel-pillar, ha incluido en el repositorio los artefactos originales previos a la conversión en la carpeta `original/`, con el objetivo de garantizar la reproducibilidad del proceso de verificación.

Esta ficha cubre tanto la conversión MLX como el modelo base subyacente, ya que las capacidades funcionales y las especificaciones de arquitectura corresponden al modelo original de Meta. La relevancia de este repositorio radica en que ofrece una alternativa de despliegue local eficiente para desarrolladores que trabajan en ecosistema Apple, con un tamaño de 3 mil millones de parámetros y una ventana de contexto de 128.000 tokens, lo que permite tareas de generación de texto, razonamiento y código en dispositivos con memoria unificada limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 4-bit MLX |
| Idiomas soportados | 8 idiomas oficiales (aleman, espanol, frances, hindi, ingles, italiano, portugues, tailandes) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (conversion MLX) |

## Arquitectura y entrenamiento

El modelo base Llama-3.2-3B-Instruct es un transformer decoder-only con arquitectura Llama 3.2, entrenado por Meta con un enfoque de solo texto (text-in/text-out). La version instruct se obtuvo mediante ajuste fino con instrucciones y alineacion, siguiendo el mismo esquema de las versiones mas grandes de la familia Llama 3.2. No se han publicado detalles especificos sobre el dataset de entrenamiento ni el proceso de alineacion en la informacion disponible de esta conversion.

La conversion MLX de 4 bits es una cuantizacion post-entrenamiento que reduce el peso del modelo de bfloat16 (BF16) a 4 bits por parametro, manteniendo la arquitectura y el vocabulario originales. Esta tecnica permite reducir significativamente la memoria requerida para la inferencia en GPU de Apple Silicon, a costa de una pequena perdida de precision en las activaciones y los pesos.

## Capacidades

- Generacion de texto en 8 idiomas, incluido el espanol, con soporte de instrucciones y conversacion multi-turno.
- Razonamiento basico y respuesta a preguntas factuales, aunque con limitaciones propias de un modelo de 3B.
- Generacion de codigo en lenguajes populares como Python, JavaScript o C++, con calidad moderada.
- Soporte de contexto largo de hasta 128.000 tokens, adecuado para documentos extensos y conversaciones largas.
- No incluye vision, audio ni capacidades multimodales; es un modelo exclusivamente textual.
- No se ha confirmado soporte explicito de tool calling o function calling en esta conversion.

## Casos de uso

- Asistente local de documentacion tecnica: el modelo puede responder preguntas sobre manuales o guias extensas gracias a su ventana de contexto de 128K tokens, ejecutandose en un MacBook con chip M1 o superior.
- Generacion de codigo en entornos de desarrollo integrado: integrado como plugin en VS Code o Neovim, puede sugerir funciones y completar fragmentos de codigo, aunque su calidad es inferior a modelos de mayor tamano.
- Chat de atencion al cliente en espanol: con un dataset de afinamiento adicional, el modelo puede gestionar conversaciones multi-turno en espanol para soporte basico de productos.
- Analisis de contratos o documentos legales: gracias al contexto largo, puede resumir clausulas y extraer informacion relevante de documentos extensos, sin necesidad de truncar.
- Prototipado rapido de agentes conversacionales: su bajo consumo de memoria permite iterar rapido en entornos de desarrollo en Apple Silicon antes de escalar a modelos mas grandes.
- Traduccion automatica entre los idiomas soportados, con calidad aceptable para frases cortas y medias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo base Llama-3.2-3B-Instruct ha sido evaluado por Meta en tareas estandar como MMLU, HumanEval y GSM8K, pero no se incluyen cifras concretas en la documentacion de este repositorio.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.5 GB para los pesos en 4-bit (3B x 4 bits), mas overhead de activaciones y cache KV, lo que supone un total de entre 2 y 3 GB.
- GPU recomendadas: Apple Silicon con GPU integrada (M1, M2, M3 o superior) con al menos 8 GB de memoria unificada.
- Compatibilidad con consumer GPU: si, siempre que sean chips Apple Silicon; no es compatible con GPU NVIDIA o AMD sin un puente de conversion a otros formatos.
- Opciones de despliegue: MLX (libreria nativa), y se puede exportar a otros formatos como GGUF para usarse con llama.cpp u Ollama, aunque la conversion original es exclusiva de MLX.
- Latencia y throughput: no disponible en la informacion, aunque en un MacBook M2 con 16 GB se espera una generacion de entre 30 y 60 tokens por segundo en 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ariel-pillar/llama-3.2-3b-mlx-verify | 3B | 128K | 4-bit MLX | Llama 3.2 Community | Repositorio HuggingFace |
| mlx-community/Llama-3.2-3B-Instruct-4bit | 3B | 128K | 4-bit MLX | Llama 3.2 Community | Repositorio HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct (original) | 3B | 128K | BF16 | Llama 3.2 Community | Repositorio HuggingFace |

La diferencia principal con las alternativas es que `ariel-pillar/llama-3.2-3b-mlx-verify` es una conversion practicamente identica a la de `mlx-community`, pero con la particularidad de incluir los artefactos pre-conversion en el repositorio para verificacion. El modelo original en BF16 requiere aproximadamente 6 GB de VRAM, mientras que las versiones de 4 bits reducen el consumo a cerca de 1.5 GB.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede reflejar sesgos presentes en los datos de entrenamiento de Meta, especialmente en temas sociales y culturales.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: aunque la ventana es de 128K tokens, el rendimiento en tareas que requieren recuperacion de informacion en posiciones muy lejanas puede degradarse.
- Restricciones de licencia: la licencia Llama 3.2 Community requiere aceptacion de los terminos de uso de Meta, que incluyen restricciones para aplicaciones con mas de 700 millones de usuarios mensuales.
- Dependencia de hardware: la conversion MLX solo funciona en Apple Silicon; no es portable a otros entornos sin una reconversion a otro formato.
- Verificacion limitada: el repositorio tiene 0 descargas y 0 likes, lo que indica que la conversion no ha sido ampliamente probada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ariel-pillar/llama-3.2-3b-mlx-verify
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.2-3B
- Documentacion oficial de Llama 3.2 en Meta: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Conversion alternativa de MLX Community: https://huggingface.co/mlx-community/Llama-3.2-3B-Instruct-4bit
- Ficha de Llama 3.2 en Ollama: https://ollama.com/library/llama3.2:3b
