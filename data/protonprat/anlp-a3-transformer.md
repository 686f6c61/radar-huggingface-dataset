# ProtonPrat/anlp-a3-transformer

## Resumen

`ProtonPrat/anlp-a3-transformer` es un modelo Transformer causal de tipo "character tagger" entrenado como parte del Assignment 3 del curso ANLP Monsoon 2026. El objetivo declarado es el descifrado de textos cifrados ("cipher decryption"), es decir, la tarea de recuperar el texto en claro a partir de una secuencia cifrada carácter a carácter. El autor lo publica como checkpoint de referencia para la asignatura, no como un modelo de produccion.

Arquitectura Transformer causal con un patron de capas `TTTT` (cuatro bloques de atencion, sin capas Mamba ni DeltaNet), anchura de modelo 256 y un total de 3.433.755 parametros. El entrenamiento se realizo sobre el dataset `data_new` del propio assignment. Los resultados reportados son muy bajos: precision por caracter de 0,1871 y precision por palabra de 0,0158 en validacion, lo que indica que el modelo no ha convergido a una solucion util para descifrado real.

Su relevancia es fundamentalmente didactica: sirve como ejemplo de arquitectura Transformer pequena, de pipeline de entrenamiento en PyTorch y de los problemas tipicos (infraentrenamiento, vocabulario de caracteres, tarea de descifrado mal definida) que aparecen en proyectos academicos. No es un modelo apto para uso general ni comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (patron de capas `TTTT`, 4 bloques de atencion) |
| Parametros totales | 3.433.755 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y pytorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, pytorch (`.bin`/checkpoint) |

## Arquitectura y entrenamiento

El modelo es un Transformer causal de anchura 256 con cuatro capas de atencion consecutivas (patron `TTTT`). La nomenclatura `T`/`M`/`D` sugiere que el repositorio del assignment permite hibridar bloques Transformer (`T`), Mamba (`M`) y DeltaNet (`D`); en este checkpoint solo se usan bloques `T`. La tarea es un tagging por caracter: el modelo emite una etiqueta por posicion, presumiblemente el caracter descifrado correspondiente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset `data_new`, ni sobre si se aplico RLHF, DPO o cualquier otro refinamiento. No se documentan innovaciones tecnicas (attention lineal, decodificacion especulativa, etc.). La carga del modelo requiere el codigo del repositorio del assignment (`src.part1.checkpoint.load_checkpoint`), lo que implica que el checkpoint no es autocontenido en terminos de configuracion e interfaces.

## Capacidades

- Descifrado por caracter: el modelo esta disenado para predecir el caracter en claro correspondiente a cada posicion de una secuencia cifrada.
- Modelado causal de secuencias de caracteres: puede usarse como base para tareas de tagging a nivel de caracter.
- Entrenamiento y evaluacion en PyTorch: pesos cargables con `torch` y `safetensors`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el vocabulario es de caracteres y depende del dataset del assignment.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Practica academica de descifrado: usar el checkpoint como punto de partida para experimentar con arquitecturas `T`/`M`/`D` y comparar curvas de aprendizaje en la tarea del assignment.
- Reproduccion de resultados: cargar el modelo con `src.part1.checkpoint.load_checkpoint` y verificar las metricas reportadas (0,1871 de precision por caracter, 0,0158 por palabra) como baseline.
- Estudio de infraentrenamiento: analizar por que un Transformer de 3,4 M de parametros con anchura 256 no converge en una tarea de descifrado y disenar variantes (mas capas, mas datos, mejor tokenizacion).
- Experimentos de tokenizacion a nivel de caracter: evaluar como distintos vocabularios y esquemas de padding afectan la precision por caracter y por palabra.
- Docencia sobre checkpoints no autocontenidos: ilustrar la necesidad de publicar config, tokenizer y codigo de carga junto a los pesos.
- Base para ablaciones de hibridacion: sustituir bloques `T` por `M` o `D` en el repositorio del assignment y comparar contra este checkpoint `TTTT`.
- Referencia negativa en revisiones: usar las metricas bajas como ejemplo de resultados que no deben presentarse como solucion funcional de descifrado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision por caracter (validacion) | 0,1871 |
| Precision por palabra (validacion) | 0,0158 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los dos valores anteriores son los unicos reportados por el autor y corresponden a la tarea de descifrado del assignment, no a benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,4 M de parametros equivalen a unos 13,7 MB de pesos); el cuello de botella es la longitud de secuencia, no el tamano del modelo.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente; tambien es viable en CPU.
- Cabe en cualquier GPU consumer y en la mayoria de entornos integrados.
- Opciones de despliegue: inferencia directa con PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato de checkpoint ligado al repositorio del assignment complica un despliegue estandar.
- Latencia y throughput: no disponibles. Dado el tamano, la latencia dominante sera la del preprocesado y la longitud de secuencia, no el coste de los matmuls.

## Comparativa con modelos similares

No disponible. No se conocen modelos publicos comparables de descifrado por caracter con este tamano y esta licencia; los Transformers pequenos de referencia (por ejemplo, variantes de GPT-2 small con ~124 M de parametros) son un orden de magnitud mayores y estan orientados a generacion de texto, no a tagging de caracteres. La comparacion directa con otros checkpoints del mismo assignment requeriria acceso al repositorio del curso.

## Limitaciones y advertencias

- Rendimiento muy bajo: precision por caracter de 0,1871 y por palabra de 0,0158 en validacion; el modelo no es funcional para descifrado real.
- Checkpoint no autocontenido: requiere `src.part1.checkpoint.load_checkpoint` del repositorio del assignment, sin el cual no se puede cargar de forma estandar.
- Licencia no especificada: no hay autorizacion explicita para uso comercial; debe tratarse como no licenciado hasta que el autor lo aclare.
- Idiomas y vocabulario no documentados: depende del dataset `data_new` y del esquema de caracteres del assignment.
- Longitud de contexto no documentada: no se puede planificar el uso con secuencias largas sin consultar la config del repositorio.
- Riesgo de alucinacion: en una tarea de tagging por caracter, el modelo puede producir salidas plausibles pero incorrectas sin senal de confianza calibrada.
- Sesgos: no evaluados; al entrenarse en un dataset academico pequeno, puede reproducir sesgos del corpus de forma no controlada.
- Sin garantias de mantenimiento: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin pipeline ni documentacion adicional.
- No apto para produccion: por rendimiento, falta de licencia y dependencia de codigo externo.

## Enlaces

- Hugging Face: https://huggingface.co/ProtonPrat/anlp-a3-transformer
- Repositorio del assignment (referenciado en la model card, ruta `src.part1.checkpoint.load_checkpoint`): no disponible como URL publica en la informacion proporcionada.
- Paper, blog o demo: no disponibles.
