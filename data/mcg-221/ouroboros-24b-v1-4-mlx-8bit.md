# McG-221/Ouroboros-24B-v1.4-mlx-8Bit

## Resumen

Ouroboros-24B-v1.4-mlx-8Bit es una conversión al formato MLX (Apple Silicon) del modelo Ouroboros-24B-v1.4, creado por Naphula y convertido por McG-221. El modelo está especializado en escritura creativa, generación de ficción, roleplay y narración de historias en inglés. Según los metadatos de HuggingFace, el archivo safetensors contiene 6.630.048.000 parámetros, una cifra que no coincide con el nombre "24B" y que probablemente refleja un error en la etiqueta del repositorio; el modelo base original se anuncia como de 24 mil millones de parámetros. La conversión utiliza cuantización de 8 bits, lo que reduce el tamaño del repositorio a 25,1 GB, y está pensada para ejecutarse en equipos con chip Apple (M-series) mediante la librería mlx-lm.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su enfoque principal es la generación de texto narrativo de alta calidad, con soporte para tramas, subtramas, continuación de escenas y diálogos, incluyendo lenguaje soez y géneros como ciencia ficción, romance y terror. No se han publicado benchmarks cuantitativos en la información disponible, por lo que su evaluación se basa en las capacidades declaradas y en el diseño orientado a tareas creativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (familia Mistral) |
| Parametros totales | 6.630.048.000 (según safetensors; el nombre sugiere 24B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Ouroboros-24B-v1.4 es un merge (combinación de pesos) realizado con mergekit, que integra varios modelos preentrenados de la familia Mistral. La arquitectura subyacente es un transformer denso con atención causal, típico de los modelos de lenguaje de Mistral. La conversión a MLX mantiene la misma arquitectura pero adapta los pesos al formato optimizado para Apple Silicon, utilizando cuantización de 8 bits para reducir el uso de memoria sin degradar excesivamente la calidad.

El dataset declarado en la model card es OccultAI/illuminati_imatrix_v1, un conjunto de datos orientado a la escritura creativa y el roleplay. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. Al ser un merge, el modelo hereda las capacidades de los modelos originales, pero no se dispone de detalles sobre el proceso de entrenamiento o los datos exactos utilizados.

## Capacidades

- Generación de texto narrativo de alta calidad: capaz de producir ficción en múltiples géneros (ciencia ficción, romance, terror, etc.) con prosa vívida y descriptiva.
- Generación de tramas y subtramas: puede crear estructuras argumentales complejas, útiles para novelas, guiones o juegos de rol.
- Continuación de escenas: dado un fragmento de texto, el modelo puede continuar la narración manteniendo coherencia y estilo.
- Roleplay (juego de roles): soporta conversaciones interactivas con personajes, incluyendo lenguaje soez y tonos variados.
- Escritura de diálogos: genera diálogos naturales y apropiados al contexto de la historia.
- Soporte de chat: compatible con plantillas de chat (chat_template) para aplicaciones conversacionales.
- Multilingüe: aunque la model card indica solo inglés, al ser un modelo de la familia Mistral podría tener capacidades limitadas en otros idiomas, pero no está garantizado.

## Casos de uso

- Escritura asistida para autores: un escritor puede usar el modelo para generar borradores de capítulos, explorar giros argumentales o superar bloqueos creativos. Su capacidad para mantener coherencia en tramas largas lo hace adecuado para novelas.
- Generación de contenido para juegos de rol: los másters de juegos de mesa o videojuegos pueden utilizar el modelo para crear descripciones de escenarios, NPCs y diálogos improvisados.
- Creación de guiones para cine o televisión: el modelo puede ayudar a esbozar escenas, desarrollar subtramas y generar diálogos entre personajes.
- Prototipado de narrativa interactiva: en el desarrollo de videojuegos narrativos o ficción interactiva, el modelo puede generar ramas de historia y respuestas dinámicas.
- Asistente de redacción para blogs o contenido editorial: aunque está especializado en ficción, puede producir textos con estilo narrativo para artículos o ensayos creativos.
- Herramientas de roleplay en línea: integrado en plataformas de chat, permite a los usuarios mantener conversaciones con personajes ficticios con personalidad y trasfondo definidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo o su versión base. La evaluación se limita a las capacidades declaradas en la model card y a la naturaleza del merge.

## Requisitos de hardware

- Al ser una conversión MLX con cuantización de 8 bits, está optimizado para Apple Silicon (M1, M2, M3, M4, M5).
- El tamaño del repositorio es de 25,1 GB, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para cargar los pesos y dejar margen para el contexto de generación.
- En equipos con 16 GB de memoria unificada, el modelo podría ejecutarse con contextos muy reducidos o mediante técnicas de offloading, pero no es recomendable.
- La inferencia se realiza con la librería `mlx-lm`, que aprovecha la GPU integrada y la memoria unificada de los chips Apple.
- No se dispone de datos de latencia o throughput específicos, pero los modelos de 8 bits en MLX suelen ofrecer velocidades aceptables en hardware Apple de gama alta (M1 Pro/Max o superiores).
- Alternativas de despliegue: dado que es MLX, no es compatible directamente con vLLM, llama.cpp u Ollama en su forma actual, aunque podría convertirse a otros formatos (GGUF) si se requiere.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de escritura creativa. El modelo base Ouroboros-24B-v1.4 no tiene benchmarks públicos, y su naturaleza de merge dificulta la comparación directa. Alternativas genéricas en la misma categoría (modelos de 7B-8B para escritura creativa) podrían ser Mistral-7B-Instruct o Llama-3.1-8B, pero no se han evaluado en este contexto. Se recomienda al usuario realizar pruebas propias para determinar la idoneidad del modelo en su caso de uso específico.

## Limitaciones y advertencias

- El número de parámetros declarado (6,63B) no coincide con el nombre del modelo (24B); es probable que el dato de safetensors sea incorrecto o que el modelo base tenga una arquitectura distinta a la esperada. Se recomienda verificar antes de desplegar en producción.
- No se especifica la longitud de contexto, lo que limita la planificación de tareas que requieran ventanas largas.
- El modelo está entrenado principalmente para inglés; su rendimiento en otros idiomas es incierto.
- Al estar especializado en escritura creativa, puede generar contenido explícito, violento o inapropiado si no se aplican filtros adicionales. La model card incluye "swearing" como etiqueta.
- No hay información sobre sesgos o alucinaciones, pero al ser un modelo de generación de ficción, la veracidad de los hechos no está garantizada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener dependencias de otros modelos con licencias diferentes; se debe revisar la cadena de derivación.
- Al ser una conversión MLX, no es directamente utilizable en entornos con GPUs NVIDIA o AMD sin una conversión adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/McG-221/Ouroboros-24B-v1.4-mlx-8Bit
- Modelo base (Naphula/Ouroboros-24B-v1.4): https://huggingface.co/Naphula/Ouroboros-24B-v1.4
- Librería mlx-lm (documentación de uso): https://github.com/ml-explore/mlx-lm
