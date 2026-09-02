# neemon/anlp-a1-c5_fixed

## Resumen

El modelo `neemon/anlp-a1-c5_fixed` es un transformer encoder-decoder construido desde cero en PyTorch (sin usar `nn.Transformer` ni `nn.MultiheadAttention`), entrenado específicamente para descifrar texto cifrado binario y convertirlo en texto plano en inglés. Forma parte de un estudio de ablación controlado con cinco configuraciones (C1-C5), donde cada variante cambia exactamente un componente respecto a la base C1. Esta configuración concreta (C5_FIXED) emplea una tokenización libre de tokens basada en parches de ancho fijo en lugar de entropía, manteniendo el resto de hiperparámetros idénticos al resto de ejecuciones.

Con solo 10,78 millones de parámetros, el modelo demuestra que una arquitectura compacta puede alcanzar una precisión de secuencia del 99,77% y una distancia de Levenshtein de 0,00 en la tarea de descifrado. Su relevancia radica en que sirve como referencia para investigaciones sobre arquitecturas de transformers, tokenización y estudios de ablación, más que como un modelo de propósito general. El repositorio incluye los checkpoints en formato PyTorch state dict, junto con el código necesario para reproducir el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (construido desde cero) |
| Parametros totales | 10 782 208 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no se especifica en la documentacion) |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos en fp32) |
| Idiomas soportados | ingles (texto plano de salida) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (ficheros .pt o .bin) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder clasica con 4 capas en el encoder y 4 en el decoder, 8 cabezas de atencion, dimension de modelo 256 y feed-forward de 1024 unidades. Emplea normalizacion pre-norm con LayerNorm, dropout de 0,1 y atencion multi-cabeza estandar. La tokenizacion es a nivel de byte, pero con una variante particular: en lugar de usar entropia para agrupar bytes en parches, esta configuracion (C5_FIXED) utiliza parches de ancho fijo, lo que simplifica el proceso de tokenizacion y lo hace deterministico.

El entrenamiento se realizo con AdamW (lr 0,0003, warmup de 1000 pasos) durante 15 000 pasos con batch de 64, en precision fp32 sin AMP. Los datos consisten en pares de texto cifrado binario y texto plano en ingles, aunque no se detalla el tamano del dataset ni su composicion. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. El modelo se entreno desde cero, sin transfer learning, lo que lo convierte en un ejemplo de entrenamiento de transformers a pequeña escala.

## Capacidades

- Descifrado de texto cifrado binario a texto plano en ingles, con una precision de secuencia del 99,77% y distancia de Levenshtein de 0,00.
- Generacion de texto condicionada a una entrada cifrada, actuando como un decodificador secuencial.
- Capacidad de procesamiento de secuencias de longitud variable gracias a la arquitectura transformer, aunque la longitud maxima no esta documentada.
- No se ha reportado soporte para tool calling, function calling, agentes, vision, audio ni otras modalidades.
- La tokenizacion por parches de ancho fijo permite un procesamiento uniforme de la entrada, sin dependencia de la distribucion de entropia.

## Casos de uso

- Investigacion academica en criptoanalisis: el modelo puede servir como referencia para estudiar la viabilidad de transformers pequeños en tareas de descifrado, comparando su rendimiento con otros enfoques estadisticos o de aprendizaje profundo.
- Estudio de ablacion de arquitecturas: al ser parte de un conjunto de configuraciones controladas, se puede utilizar para analizar el impacto de la tokenizacion en el rendimiento, comparando C5_FIXED con otras variantes (C1-C4).
- Enseñanza de transformers: su implementacion desde cero (sin librerias de alto nivel) lo convierte en un recurso didactico para entender el funcionamiento interno de la atencion multi-cabeza, la codificacion posicional y el entrenamiento de encoder-decoder.
- Pruebas de concepto en entornos con recursos limitados: con solo 10,7M de parametros y un pico de memoria GPU de 829,6 MB, es adecuado para experimentos en hardware modesto o en entornos de aprendizaje automatico embebido.
- Desarrollo de sistemas de recuperacion de informacion cifrada: aunque el alcance es limitado, podria adaptarse para tareas de normalizacion o transformacion de datos binarios en aplicaciones especificas.
- Benchmark de eficiencia: los datos de tiempo de entrenamiento (0,0742 segundos por paso) y uso de memoria pueden servir como punto de referencia para comparar implementaciones optimizadas de transformers.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision a nivel de bit | 0,99997 |
| Precision de secuencia | 0,9977 |
| Distancia de Levenshtein | 0,00 |
| BLEU | N/A |
| ROUGE-L | N/A |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los valores presentados corresponden exclusivamente al rendimiento de esta configuracion en el conjunto de evaluacion del autor.

## Requisitos de hardware

- VRAM estimada: el pico de memoria GPU durante el entrenamiento fue de 829,6 MB, por lo que la inferencia requerira menos, tipicamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo GTX 1050 Ti, RTX 2060, RTX 3060, etc. Tambien es ejecutable en CPU para inferencia, aunque con mayor latencia.
- Se puede ejecutar en GPUs consumer de gama baja, asi como en plataformas como Google Colab (GPU gratuita).
- Opciones de despliegue: al ser un modelo PyTorch puro, se puede cargar con `torch.load` y ejecutar en cualquier entorno con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, pero al ser un transformer estandar, podria adaptarse con modificaciones.
- Latencia y throughput: no se proporcionan datos especificos de inferencia, pero dado el tamano del modelo, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (transformers pequeños para descifrado). Los repositorios relacionados encontrados en la busqueda web (`neemon/anlp-a1-c5`, `ZappY-AI/anlp-a1`, `Yajat31/anlp-a1-checkpoints`) pertenecen al mismo autor o a otros participantes del mismo curso, pero no ofrecen datos de rendimiento comparables. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion, sino como parte de un experimento controlado de ablacion.
- Alcance limitado: solo realiza descifrado de un tipo especifico de texto cifrado binario a ingles; no es un modelo de lenguaje general.
- Sin informacion sobre sesgos: al ser un modelo entrenado en un dataset de tarea especifica, no se han evaluado sesgos sociales ni culturales.
- Riesgo de alucinacion: aunque la precision es alta, existe la posibilidad de errores en secuencias fuera de la distribucion de entrenamiento.
- Longitud de contexto desconocida: no se documenta la maxima longitud de secuencia soportada, lo que limita su aplicacion a entradas de tamano desconocido.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero al ser un modelo de investigacion, no se garantiza su idoneidad para aplicaciones criticas.

## Enlaces

- [Modelo en HuggingFace: neemon/anlp-a1-c5_fixed](https://huggingface.co/neemon/anlp-a1-c5_fixed)
- [Repositorio del modelo base C5: neemon/anlp-a1-c5](https://huggingface.co/neemon/anlp-a1-c5)
- [Repositorio de otro participante: ZappY-AI/anlp-a1](https://huggingface.co/ZappY-AI/anlp-a1)
- [Repositorio de checkpoints: Yajat31/anlp-a1-checkpoints](https://huggingface.co/Yajat31/anlp-a1-checkpoints)
