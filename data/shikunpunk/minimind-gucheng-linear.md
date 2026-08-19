# shikunpunk/MiniMind-GuCheng-Linear

## Resumen

MiniMind-GuCheng-Linear es una variante experimental de generador de poesía en chino, entrenada desde cero sobre las obras reales del poeta Gu Cheng. Forma parte del proyecto MiniMind-GuCheng, que compara tres arquitecturas (autoregresiva, difusión y lineal) bajo los mismos datos y presupuesto de parámetros. Esta variante concreta emplea atención lineal basada en Gated DeltaNet, con el objetivo de evaluar si una arquitectura de complejidad lineal puede converger adecuadamente en un corpus pequeño y altamente estilizado como la poesía de Gu Cheng.

El modelo tiene 104 millones de parámetros entrenables, con hidden size de 768 y 8 capas, y se ha entrenado mediante una transferencia A2L (de autorregresivo a lineal) sobre un corpus de 7481 muestras de preentrenamiento y 213 muestras de instrucción. El autor, shikunpunk, lo publica como material de investigación para estudiar las diferencias de convergencia entre arquitecturas en condiciones de datos limitados. La relevancia actual radica en que aborda una pregunta abierta en la comunidad de IA open source: si los modelos de atención lineal pueden sustituir a los transformadores clásicos en tareas de generación creativa con datos escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atencion lineal) sobre base MiniMind (hidden_size=768, 8 capas) |
| Parametros totales | 104 millones (entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (corpus de poesia de Gu Cheng) |
| Licencia | no disponible |
| Formato de pesos | PyTorch fallback (segun model card) |

## Arquitectura y entrenamiento

La arquitectura sustituye la atencion softmax por Gated DeltaNet, un mecanismo de atencion lineal que mantiene un estado recurrente y reduce la complejidad computacional de O(n²) a O(n) en la longitud de secuencia. El modelo se inicializa desde una version autoregresiva (MiniMind-GuCheng-AR) y se adapta mediante una transferencia A2L, es decir, se parte de los pesos de un modelo ya entrenado con atencion softmax y se reentrena la capa lineal sobre los mismos datos. El corpus de entrenamiento consiste exclusivamente en textos reales de Gu Cheng extraidos de 5 libros mediante OCR, sin incluir texto generado por IA. Se utilizan 7481 muestras de preentrenamiento (poesia, prosa, aforismos y fragmentos de novelas) y 213 muestras de instruccion para el ajuste fino con tareas de continuacion y emulacion de estilo. El entrenamiento se realizo con PyTorch nativo, sin dependencias de alto nivel.

## Capacidades

- Generacion de poesia moderna china en el estilo de Gu Cheng, con vocabulario e imagenes caracteristicas del poeta.
- Continuacion de texto a partir de un fragmento inicial (modo raw).
- Instruccion conversacional para pedir poemas tematicos (modo chat).
- Comparacion experimental de arquitecturas: el modelo sirve como punto de referencia para estudiar la convergencia de atencion lineal en datos pequenos.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Generacion de poesia personalizada: un usuario puede pedir un poema sobre un tema concreto (por ejemplo, "escribe un poema al estilo de Gu Cheng sobre el mar") y el modelo produce versos con imagenes surrealistas y tono melancolico.
- Herramienta educativa para estudios literarios: los investigadores pueden usar el modelo para explorar patrones estilisticos de Gu Cheng y compararlos con otras variantes del proyecto.
- Prototipo de experimentacion en arquitecturas lineales: sirve como banco de pruebas para evaluar si Gated DeltaNet puede capturar estructuras poeticas con pocos datos, util para quienes investigan alternativas a la atencion softmax.
- Generacion de contenido para proyectos artisticos: escritores o artistas pueden usar el modelo como fuente de inspiracion para crear piezas basadas en la estetica de Gu Cheng.
- Analisis de transferencia de conocimiento entre arquitecturas: el proceso A2L permite estudiar como se comportan los pesos de un modelo autoregresivo al convertirse en lineal, lo que interesa a quienes trabajan en compresion de modelos.
- Demo interactiva de generacion poetica: el modelo puede integrarse en una interfaz web simple para que usuarios finales experimenten con la generacion de poesia china.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica cualitativamente que la variante Linear produce salidas con caracteres repetidos o corruptos en el ejemplo mostrado, y que su convergencia es limitada en comparacion con la variante AR. No hay metricas objetivas como perplexity, BLEU o evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 104M de parametros, la inferencia puede ejecutarse en CPU sin problemas; en GPU se requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3060) es suficiente. Tambien funciona en CPU pura.
- Compatibilidad con hardware de consumo: si, cabe en cualquier ordenador personal moderno.
- Opciones de despliegue: el repositorio incluye un script de generacion (`gen_gucheng_linear.py`) que carga los pesos y ejecuta la inferencia directamente. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, pero dado el tamano del modelo y la atencion lineal, la generacion deberia ser rapida incluso en CPU.

## Comparativa con modelos similares

Dentro del mismo proyecto MiniMind-GuCheng, se comparan tres variantes:

| Modelo | Arquitectura | Parametros | Contexto | Calidad de generacion (segun autor) |
|---|---|---|---|---|
| MiniMind-GuCheng-AR | Autoregresiva (Softmax Attention) | 104M | no disponible | Mejor calidad, imagenes completas |
| MiniMind-GuCheng-dLM | Difusion (MDM) | 104M | no disponible | Salidas cortas o repetitivas, convergencia limitada |
| MiniMind-GuCheng-Linear | Gated DeltaNet | 104M | no disponible | Salidas con caracteres corruptos, convergencia limitada |

No se dispone de comparaciones con otros generadores de poesia china fuera del proyecto.

## Limitaciones y advertencias

- La calidad de generacion es notablemente inferior a la variante autoregresiva del mismo proyecto; el autor reporta salidas con caracteres corruptos o repeticiones, lo que indica que la atencion lineal no converge bien con datos tan escasos.
- El corpus de entrenamiento es muy pequeno (7481 muestras de preentrenamiento y 213 de SFT), lo que limita la generalizacion y aumenta el riesgo de sobreajuste.
- Solo se ha entrenado con textos de Gu Cheng; no es un modelo generalista ni sirve para tareas fuera de la generacion poetica en chino.
- No se ha publicado informacion sobre sesgos, pero al entrenar con un unico autor, el modelo replicara sus temas y estilo, lo que puede resultar monotono o inapropiado para otros contextos.
- La licencia no esta especificada; se debe contactar al autor antes de cualquier uso comercial.
- No hay garantias de estabilidad en produccion: el modelo es un experimento de investigacion, no un producto listo para uso industrial.
- El formato de pesos es PyTorch fallback, lo que puede dificultar su integracion en entornos que requieran formatos estandar como safetensors o GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shikunpunk/MiniMind-GuCheng-Linear
- Perfil del autor en HuggingFace: https://huggingface.co/shikunpunk
- Repositorio MiniMind (base del proyecto): https://github.com/jingyaogong/minimind
- Otros modelos del autor: https://huggingface.co/shikunpunk/models
