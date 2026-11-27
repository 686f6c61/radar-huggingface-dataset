# romara-labs/MiniMax-H3-ClipProj-GGUF

## Resumen

MiniMax-H3-ClipProj-GGUF es un conjunto de matrices de proyección en formato GGUF publicadas por romara-labs que permiten sustituir el codificador de texto Qwen3-VL-32B por variantes más pequeñas (Qwen3-VL-8B, 4B o 2B) en el pipeline de generación de MiniMax-H3. El modelo base original es NicoLab28/ClipProj-MiniMax-H3, del que esta publicación es una conversión directa a GGUF sin cuantización adicional. No se trata de un modelo generativo autónomo: es un componente auxiliar que alinea el espacio de embeddings de un codificador de texto reducido con la condicion textual de 5.120 dimensiones que esperan los modelos de difusión de la familia MiniMax-H3.

La relevancia de esta pieza es práctica: MiniMax-H3, MiniMax-H3-Image y P-H3-Image comparten la misma dimensión de condicionamiento textual, por lo que una única matriz de proyección sirve para los tres pipelines. Esto permite ejecutar generación de vídeo e imagen con encoders de 2B a 8B en lugar del encoder de 32B original, reduciendo drásticamente los requisitos de VRAM y haciendo viable el despliegue en hardware de consumo.

El repositorio incluye seis ficheros GGUF organizados por tamaño de encoder (2B, 4B, 8B) y por tipo de proyección (Ridge o MLP). La serie v3.1 cubre los encoders de 4B y 8B, mientras que los ficheros de 2B corresponden a la serie legacy v1, cuya compatibilidad en tiempo de ejecución no ha sido verificada por el autor. El modelo cuenta con 127.967.232 parámetros en sus pesos safetensors de referencia y un tamaño de repositorio de 1,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matriz de proyección lineal (Ridge) o perceptrón multicapa (MLP) sobre embeddings de Qwen3-VL; arquitectura GGUF personalizada `clipproj` |
| Parametros totales | 127.967.232 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del encoder Qwen3-VL asociado) |
| Tipos de cuantizacion | Conversión a GGUF que preserva la precisión de los tensores; no se añade cuantización |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | GGUF (arquitectura `clipproj`); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El componente es una proyección que transforma los embeddings de salida de un codificador Qwen3-VL de menor tamaño (2B, 4B u 8B) al espacio de condicionamiento textual de 5.120 dimensiones que consumen los modelos de difusión de MiniMax-H3. Se ofrecen dos variantes por tamaño de encoder: una proyección Ridge, de menor tamaño en disco, y una proyección MLP, de mayor tamaño. La serie v3.1 (4B y 8B) es la recomendada; los ficheros de 2B pertenecen a la serie legacy v1 y su revisión de origen exacta no pudo confirmarse.

Las matrices fueron calibradas sobre prompts de vídeo. Según la model card, no se ha realizado una validación sistemática de la calidad en generación de imagen a partir de texto, y los flujos con imagen o vídeo de referencia no han sido validados. La conversión a GGUF preserva la precisión de los tensores originales del repositorio NicoLab28/ClipProj-MiniMax-H3 y no introduce cuantización adicional. No se dispone de información sobre el volumen de datos de calibración, la composición del dataset ni el uso de técnicas de ajuste como RLHF o DPO.

## Capacidades

- Proyección de embeddings de texto de Qwen3-VL-8B, Qwen3-VL-4B y Qwen3-VL-2B al espacio de condicionamiento de 5.120 dimensiones de MiniMax-H3.
- Compatibilidad con los tres pipelines de la familia: MiniMax-H3 (vídeo), MiniMax-H3-Image y P-H3-Image.
- Sustitución del encoder Qwen3-VL-32B por encoders de menor tamaño, con la consiguiente reducción de memoria y cómputo.
- Dos variantes de proyección por encoder: Ridge y MLP.
- Integración con el fork de stable-diffusion.cpp de Romara Labs mediante los flags `--llm` y `--cliproj`.
- En P-H3-Image, `--cliproj` tiene precedencia sobre el conector de texto nativo de P-H3 cuando ambos están presentes.
- Soporte de torre de visión separada mediante el flag `--llm_vision` si el encoder la almacena por separado.
- No es un modelo autónomo: no genera texto, código ni respuestas; no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Generación de vídeo con MiniMax-H3 en hardware limitado: al sustituir el encoder de 32B por el de 4B u 8B, el pipeline completo cabe en GPUs con menos VRAM, lo que permite prototipar generación de vídeo en estaciones de trabajo de gama alta consumer.
- Generación de imagen con MiniMax-H3-Image: la misma matriz de proyección sirve para el pipeline de imagen, de modo que un único despliegue cubre vídeo e imagen sin duplicar el encoder de texto.
- Despliegue con P-H3-Image: el flag `--cliproj` permite usar el encoder reducido en lugar del conector de texto nativo de P-H3, simplificando la pila de inferencia a un solo encoder Qwen3-VL.
- Experimentación e investigación sobre destilación de encoders: el componente permite comparar la calidad de salida con encoders de 2B, 4B y 8B sobre el mismo modelo de difusión, aislando el efecto del tamaño del encoder.
- Reducción de costes en inferencia por lotes: al emplear un encoder de 4B en lugar de 32B, el coste de codificación de prompts en pipelines de generación masiva de vídeo o imagen disminuye de forma proporcional al tamaño del encoder.
- Integración en herramientas de línea de comandos basadas en stable-diffusion.cpp: el fork de Romara Labs permite incorporar la proyección en scripts de generación existentes añadiendo únicamente dos flags a los comandos de MiniMax-H3.
- Evaluación comparativa Ridge frente a MLP: los ficheros `-mlp` permiten medir la diferencia de calidad y de tamaño en disco entre ambas variantes de proyección para un mismo encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la proyección: no disponible de forma aislada; el componente añade una matriz de 127.967.232 parámetros, con variantes Ridge (menor) y MLP (mayor). El repositorio completo ocupa 1,5 GB.
- La VRAM total del pipeline depende del encoder Qwen3-VL elegido (2B, 4B u 8B), del modelo de difusión MiniMax-H3 y de los VAE, ninguno de los cuales se incluye en este repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. La reducción del encoder de 32B a 4B u 8B está orientada a disminuir los requisitos frente al pipeline original.
- Encoders compatibles: Qwen3-VL-8B-Instruct, Qwen3-VL-4B-Instruct y Qwen3-VL-2B-Instruct.
- Opciones de despliegue: fork de Romara Labs de stable-diffusion.cpp, compilado con las instrucciones de parche del repositorio. La arquitectura `clipproj` no es un modelo autónomo de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Componente | Encoder asociado | Tipo de proyección | Tamaño relativo | Licencia |
|---|---|---|---|---|
| mmh3-8b-ClipProj-v3.1 | Qwen3-VL-8B | Ridge | Menor | MiniMax H3 Community License |
| mmh3-8b-ClipProj-v3.1-mlp | Qwen3-VL-8B | MLP | Mayor | MiniMax H3 Community License |
| mmh3-4b-ClipProj-v3.1 | Qwen3-VL-4B | Ridge | Menor | MiniMax H3 Community License |
| mmh3-4b-ClipProj-v3.1-mlp | Qwen3-VL-4B | MLP | Mayor | MiniMax H3 Community License |
| mmh3-2b-ClipProj-v1 | Qwen3-VL-2B | Legacy v1 | No verificado | MiniMax H3 Community License |
| mmh3-2b-ClipProj-v1-mlp | Qwen3-VL-2B | Legacy v1, MLP | No verificado | MiniMax H3 Community License |

No se dispone de información sobre componentes alternativos de terceros que realicen la misma función de proyección para MiniMax-H3, por lo que la comparativa se limita a las variantes publicadas en este mismo repositorio.

## Limitaciones y advertencias

- No es un modelo generativo: requiere el modelo de difusión MiniMax-H3, un encoder Qwen3-VL compatible y los VAE correspondientes, que no se incluyen en el repositorio.
- Las matrices se calibraron sobre prompts de vídeo; la calidad en generación de imagen a partir de texto no se ha validado sistemáticamente.
- Los flujos con imagen de referencia o vídeo de referencia no han sido validados con estas proyecciones.
- Los ficheros de 2B pertenecen a la serie legacy v1; su compatibilidad en tiempo de ejecución y su revisión de origen exacta no han sido verificadas por el autor.
- La arquitectura GGUF `clipproj` es específica del fork de stable-diffusion.cpp de Romara Labs y no funciona como modelo de llama.cpp.
- La licencia MiniMax H3 Community License Agreement impone condiciones específicas de uso y redistribución; es necesario revisar el texto completo antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, tasas de alucinación o cobertura idiomática, al no ser un modelo de lenguaje autónomo.
- El rendimiento y la fidelidad de la condicion textual dependen del encoder elegido; no se han publicado métricas objetivas que cuantifiquen la pérdida de calidad frente al encoder de 32B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/romara-labs/MiniMax-H3-ClipProj-GGUF
- Modelo base de la proyección: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Fork de stable-diffusion.cpp de Romara Labs: https://github.com/romara-labs/stable-diffusion.cpp
- Instrucciones de compilación con parche: https://github.com/romara-labs/stable-diffusion.cpp/tree/master/patch
- Licencia MiniMax H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Encoder Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Encoder Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Encoder Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
