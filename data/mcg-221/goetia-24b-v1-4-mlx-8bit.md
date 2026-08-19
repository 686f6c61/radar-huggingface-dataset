# McG-221/Goetia-24B-v1.4-mlx-8Bit

## Resumen

Goetia-24B-v1.4-mlx-8Bit es una conversión al formato MLX del modelo Naphula/Goetia-24B-v1.4, realizada por McG-221 mediante la librería mlx-lm en su versión 0.31.2. El modelo original es un merge de arquitectura Mistral, creado con mergekit, que combina pesos de varios modelos base para especializarse en escritura creativa, generación de ficción, tramas y roleplay. El dataset utilizado para el entrenamiento o ajuste es OccultAI/illuminati_imatrix_v1, orientado a contenido narrativo.

A pesar de la denominación "24B", los parámetros totales reportados en los safetensors son 6.630.048.000 (aproximadamente 6,63 mil millones), lo que lo sitúa en la gama de modelos de 7B. El repositorio ocupa 25,1 GB, lo que sugiere que los pesos están almacenados en precisión float32. La conversión a MLX con cuantización de 8 bits está pensada para su uso en hardware Apple Silicon, aunque también puede ejecutarse en otros entornos mediante las herramientas adecuadas.

La relevancia de este modelo radica en su especialización en tareas de escritura narrativa, un nicho donde los modelos generalistas suelen ofrecer resultados menos pulidos. Su licencia Apache-2.0 permite uso comercial sin restricciones, y al estar disponible en formato MLX, facilita la inferencia local en Macs con chip M1/M2/M3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer decoder-only) |
| Parametros totales | 6.630.048.000 (6,63B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Naphula/Goetia-24B-v1.4 es un merge de arquitectura Mistral, combinado mediante mergekit. No se especifican los componentes individuales del merge ni la metodología exacta (por ejemplo, SLERP, ties, etc.). El dataset utilizado es OccultAI/illuminati_imatrix_v1, que contiene datos orientados a la escritura creativa y el roleplay. No se mencionan técnicas de RLHF ni DPO en la información disponible.

La conversión a MLX se realizó con mlx-lm 0.31.2, aplicando cuantización de 8 bits. Esto reduce el tamaño de los pesos en memoria y acelera la inferencia en hardware Apple Silicon, manteniendo una calidad aceptable para tareas de generación de texto. El formato MLX es nativo para los chips de Apple, pero también puede ejecutarse en otras plataformas mediante la librería mlx-lm.

## Capacidades

- Generacion de texto narrativo: especializado en escritura de ficcion, cuentos, novelas y relatos de todos los generos (ciencia ficcion, romance, terror, etc.).
- Generacion de tramas y subtramas: capaz de proponer argumentos, giros y estructuras narrativas coherentes.
- Continuacion de escenas: puede continuar una escena o historia a partir de un fragmento dado, manteniendo el tono y el estilo.
- Roleplay: soporta interacciones conversacionales de rol, con personajes y ambientaciones variadas.
- Prosa vivida y descriptiva: entrenado para producir descripciones ricas y detalladas, con un estilo literario cuidado.
- Conversacion general: aunque su foco es creativo, puede mantener dialogos de caracter general.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Multilingue: no, solo ingles.

## Casos de uso

- Escritura de ficcion asistida: un autor puede usar el modelo para generar borradores de capitulos, desarrollar personajes o superar bloqueos creativos. Su capacidad para mantener coherencia narrativa en tramas largas lo hace util como co-escritor.
- Generacion de ideas para guiones: el modelo puede proponer premisas, conflictos y resoluciones para peliculas, series o videojuegos, ahorrando tiempo en la fase de brainstorming.
- Roleplay en juegos de texto: integrable en motores de juegos de rol o chatbots para ofrecer respuestas inmersivas y adaptadas al contexto de la partida.
- Creacion de contenido para blogs y redes sociales: puede redactar relatos cortos, microcuentos o hilos narrativos con un estilo atractivo y consistente.
- Asistente de escritura para estudiantes de literatura: ayuda a practicar tecnicas narrativas, generando ejemplos de diferentes estilos o generos.
- Localizacion de contenido creativo: aunque solo soporta ingles, puede adaptar historias existentes a nuevos contextos o tramas alternativas, siempre que el texto de entrada este en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandar. El modelo esta orientado a tareas creativas, donde las metricas convencionales no siempre reflejan la calidad percibida.

## Requisitos de hardware

- El repositorio ocupa 25,1 GB, lo que indica que los pesos estan en float32. La cuantizacion 8-bit del formato MLX reduce el uso de memoria a aproximadamente 6,6 GB para los pesos, mas overhead de activaciones y cache.
- VRAM estimada para inferencia en 8-bit: alrededor de 8-10 GB, dependiendo de la longitud del contexto y el tamano del lote.
- GPU recomendadas: al ser MLX, esta optimizado para Apple Silicon (M1/M2/M3). En otras plataformas, puede ejecutarse con mlx-lm sobre GPU NVIDIA, pero no se garantiza el mismo rendimiento.
- En consumer GPU: si, con tarjetas de 8 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4070) se puede ejecutar en 8-bit, aunque con menor velocidad que en Apple Silicon.
- Opciones de despliegue: mlx-lm (para Apple), tambien compatible con vLLM y TGI si se convierte a otro formato, aunque no esta documentado. La etiqueta "endpoints_compatible" sugiere que puede usarse con text-generation-inference.
- Latencia y throughput: no disponibles. Depende del hardware y de la optimizacion del backend.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia cualitativa, el modelo se situa en la categoria de modelos de escritura creativa de ~7B, similar a Mistral-7B-Instruct o Llama-3-8B-Instruct, pero especializado en narrativa. La ventaja principal es su enfoque en prosa y tramas, mientras que los modelos generalistas ofrecen un equilibrio entre multiples tareas. La licencia Apache-2.0 es mas permisiva que la de Llama-3 (que tiene restricciones comerciales en algunos casos), lo que facilita su integracion en productos comerciales.

## Limitaciones y advertencias

- Solo soporta ingles, lo que limita su uso en otros idiomas.
- No se han documentado sesgos especificos, pero al ser un modelo de escritura creativa, puede generar contenido estereotipado o sensible en temas de genero, raza o violencia. Se recomienda supervisar las salidas en aplicaciones publicas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos o inconsistencias en tramas largas. No es fiable para informacion factual.
- La longitud de contexto no esta especificada; probablemente sea de 8K o 32K, pero no se confirma.
- El nombre "24B" es enganoso: los parametros reales son 6,63B. Esto puede confundir a los usuarios que esperan un modelo mas grande.
- Al ser una conversion MLX, el rendimiento fuera de Apple Silicon puede ser suboptimo. No se garantiza compatibilidad con todas las herramientas de inferencia estandar (llama.cpp, Ollama) sin una conversion adicional.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/McG-221/Goetia-24B-v1.4-mlx-8Bit
- Modelo base (Naphula/Goetia-24B-v1.4): https://huggingface.co/Naphula/Goetia-24B-v1.4
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
