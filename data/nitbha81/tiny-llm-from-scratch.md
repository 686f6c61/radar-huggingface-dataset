# Nitbha81/tiny-llm-from-scratch

## Resumen

`Nitbha81/tiny-llm-from-scratch` es un modelo de lenguaje de caracteres (character-level) construido desde cero por el usuario Nitbha81 como ejercicio de aprendizaje. Se trata de una implementacion minimalista de un transformer de estilo GPT, escrita en PyTorch, con atencion multi-cabeza, capas feed-forward y un tokenizador a nivel de caracter. El modelo cuenta con aproximadamente 100.000 parametros, lo que lo situa varios ordenes de magnitud por debajo de cualquier LLM de produccion.

El proposito declarado por el autor es didactico: comprender la mecanica interna de los grandes modelos de lenguaje implementando cada componente manualmente. No se ha entrenado con un corpus a gran escala ni se ha sometido a tecnicas de alineacion como RLHF o DPO. El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no dispone de pipeline declarado en Hugging Face.

Su relevancia actual es exclusivamente formativa: sirve como referencia para quienes quieren replicar el ciclo completo de entrenamiento de un transformer (tokenizacion, forward pass, perdida, backpropagation) sin depender de frameworks de alto nivel. No es un modelo apto para uso en produccion ni para tareas reales de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo GPT (self-attention multi-cabeza, feed-forward) |
| Parametros totales | ~100K |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de un transformer decoder-only al estilo GPT, con bloques compuestos por atencion multi-cabeza y capas feed-forward. La implementacion se ha realizado en PyTorch desde cero, sin recurrir a clases predefinidas de librerias como `transformers`. El tokenizador opera a nivel de caracter, lo que simplifica el pipeline de preprocesamiento pero limita severamente la capacidad de generalizacion linguistica.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la ventana de contexto utilizada durante el entrenamiento ni si se aplicaron tecnicas de regularizacion o ajuste fino. La model card indica unicamente que se entreno sobre "a tiny text dataset" y que el objetivo era comprender los mecanismos basicos de los LLM. No se mencionan innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto a nivel de caracter sobre el dominio limitado del corpus de entrenamiento.
- Modelado de secuencias cortas con dependencias locales, gracias a la atencion multi-cabeza.
- Aprendizaje de patrones sintacticos basicos del dataset utilizado (no especificado).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No dispone de modo thinking, vision ni audio.
- No dispone de instrucciones de chat ni formato de plantilla conversacional.

## Casos de uso

- Material didactico para cursos de introduccion a LLM: el modelo permite recorrer el codigo completo de un transformer funcional y entender cada componente (embeddings, atencion, feed-forward, capa de salida) sin la complejidad de un modelo grande.
- Replicacion de experimentos de tokenizacion a nivel de caracter: util para comparar el comportamiento de tokenizadores character-level frente a BPE o WordPiece en corpus pequenos.
- Pruebas de infraestructura de entrenamiento: sirve como banco de pruebas para validar pipelines de PyTorch, bucles de entrenamiento y guardado de checkpoints en entornos con recursos minimos.
- Demostracion de sobreajuste y capacidad de memorizacion: con ~100K parametros y un corpus diminuto, es un ejemplo claro de como un modelo memoriza el conjunto de entrenamiento.
- Base para ejercicios de extension: permite a estudiantes anadir capas, cambiar el tokenizador o ampliar el contexto para medir el impacto en la perdida.
- Referencia para comparativas de eficiencia: util para ilustrar la diferencia de escala entre un modelo didactico y un LLM de produccion en terminos de parametros, VRAM y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantizacion; con ~100K parametros, el modelo ocupa unos pocos cientos de kilobytes en FP32.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) o incluso CPU; no requiere aceleracion dedicada.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: al no publicarse pesos en formatos estandar (safetensors, GGUF), no se puede desplegar directamente con vLLM, llama.cpp, Ollama o TGI sin reimplementar la carga desde el codigo fuente del autor.
- Latencia y throughput estimados: no disponibles; por el tamano, la inferencia seria del orden de microsegundos por token en cualquier hardware moderno, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nitbha81/tiny-llm-from-scratch | ~100K | no disponible | MIT | Repo Hugging Face, sin pesos en formato estandar |
| GPT-2 small (referencia) | 124M | 1024 | MIT | Pesos en safetensors, ampliamente soportado |
| TinyStories-1M (referencia) | ~1M | 512 | MIT | Pesos en safetensors, integrable en transformers |
| nanoGPT (referencia) | configurable | configurable | MIT | Codigo de entrenamiento, no pesos preentrenados |

La comparativa se ofrece a titulo orientativo: los tres modelos de referencia son alternativas didacticas o de pequena escala con ecosistema de despliegue maduro, mientras que `tiny-llm-from-scratch` carece de pesos publicados en formatos estandar y de documentacion sobre su entrenamiento.

## Limitaciones y advertencias

- Capacidad linguistica practicamente nula: con ~100K parametros y tokenizacion a nivel de caracter, no puede generar texto coherente fuera de patrones memorizados del corpus de entrenamiento.
- Sesgos conocidos: no documentados; el corpus de entrenamiento no se especifica, por lo que no es posible evaluar sesgos.
- Riesgo de alucinacion: alto en el sentido de que cualquier salida fuera del dominio de entrenamiento sera incoherente o directamente ruido.
- Limitaciones de contexto e idioma: no se declara ventana de contexto ni idiomas soportados; la tokenizacion por caracter limita la generalizacion a nivel de palabra.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero el modelo no es funcional para tareas de produccion.
- Caveat para produccion: no debe desplegarse en ningun sistema real; carece de pesos en formatos estandar, de pipeline declarado y de evaluacion cuantitativa.
- Ausencia de datos de entrenamiento: imposibilita la reproducibilidad y la auditoria del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Nitbha81/tiny-llm-from-scratch
