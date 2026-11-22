# Jundot/Qwen3.8-27B-oQ4h-mtp

## Resumen

Qwen3.8-27B-oQ4h-mtp es una cuantizacion de precision mixta en formato oQh del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.000 millones de parametros de tipo vision-lenguaje construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot dentro del ecosistema oMLX, una herramienta de cuantizacion para Apple Silicon, y esta pensado para ejecutarse en el runtime oMLX 0.8.0 o superior, que es el unico que soporta el formato oQh.

El checkpoint incluye el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP), con un contexto nativo de 262.144 tokens. La cuantizacion mantiene una media efectiva de 4,840 bits por peso en el backbone y 5,044 bits por peso en el conjunto del checkpoint, con un tamano de repositorio de 17,5 GB. Frente al formato oQe del mismo autor, oQh aplica una transformada de Hadamard a los pesos antes de cuantizarlos, lo que reduce la divergencia KL respecto al modelo BF16 sin aumentar el tamano del fichero.

Su relevancia es practica: permite desplegar un modelo multimodal de 27B con contexto muy largo en equipos con memoria unificada de Apple, manteniendo una calidad cercana al original. No es un modelo nuevo, sino un artefacto de distribucion optimizado, por lo que su evaluacion debe hacerse siempre en relacion con el modelo base Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (familia Qwen3.5), con codificador de vision y cabeza MTP |
| Parametros totales | 27.781 millones (logicos); 7.212.759.280 parametros reportados en safetensors del repo |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Precision mixta oQh (4, 5, 6 y 8 bits, grupo 128) y affine (4, 5, 6 y 8 bits, grupo 64); media efectiva de 4,840 bits/peso en el backbone y 5,044 bits/peso en el total |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX oQh (requiere oMLX 0.8.0 o superior) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con un diseno hibrido que combina capas Gated DeltaNet (mecanismo de atencion lineal con estado recurrente) y capas de Gated Attention clasica. A esto se anade un codificador de vision para comprension de imagen y video, y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa sobre varios tokens por paso. El contexto nativo es de 262.144 tokens. La distribucion de parametros del checkpoint cuantizado es de 26,896B en el backbone de lenguaje, 0,461B en el codificador de vision y 0,425B en la cabeza MTP.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica de este checkpoint concreto es la cuantizacion oQh: antes de cuantizar, los pesos se rotan mediante una transformada de Hadamard, lo que reduce el numero de escalas necesarias y permite dedicar el espacio ahorrado a mas bits en las tensiones mas sensibles. El embedding de tokens, la cabeza de salida y la cabeza MTP se mantienen en grupos affine. Segun las mediciones del autor, oQ4h reduce la divergencia KL respecto a BF16 entre un 13 % y un 27 % frente a oQ4e en las mismas condiciones de tamano (FLORES+, Aya y codigo Python).

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagen y video mediante el codificador de vision integrado (pipeline image-text-to-text).
- Procesamiento de contexto muy largo, hasta 262.144 tokens.
- Decodificacion especulativa mediante la cabeza MTP, que acelera la generacion.
- Capacidades multilingues: el autor evalua con prompts en siete idiomas (FLORES+ y Aya), aunque la lista oficial de idiomas no esta publicada.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modo thinking.

## Casos de uso

- Analisis de documentos largos con imagenes: informes, contratos o articulos cientificos de cientos de paginas que combinan texto y figuras, aprovechando la ventana de 262.144 tokens para procesar el documento completo sin troceado.
- Asistencia sobre capturas y diagramas: interpretacion de diagramas de arquitectura, graficos o interfaces para generar explicaciones tecnicas, gracias al codificador de vision.
- Procesamiento de video para resumenes: extraccion de descripciones y resumenes de contenido audiovisual en flujos de analisis de medios.
- Desarrollo local en Apple Silicon: prototipado de aplicaciones multimodales en un Mac con memoria unificada, sin depender de GPU dedicadas ni de servicios en la nube.
- Traduccion y localizacion asistida: el modelo se ha evaluado con FLORES+ en siete idiomas, lo que lo hace util para tareas de traduccion con contexto amplio de documento.
- Generacion y revision de codigo Python: el autor incluye evaluaciones de divergencia KL sobre codigo, lo que indica uso previsto en tareas de programacion, aunque sin garantias de tool calling.
- Investigacion sobre cuantizacion: sirve como referencia para estudiar el impacto de la precision mixta y la rotacion de Hadamard en la calidad de modelos multimodales grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta divergencia KL respecto al modelo BF16, que mide fidelidad de la cuantizacion y no rendimiento en tareas:

| Nivel | Tamano | KL FLORES+ (oQe -> oQh) | KL Aya (oQe -> oQh) | KL codigo (oQe -> oQh) |
|---|---|---|---|---|
| oQ2 | 9,9 GiB | 0,19 -> 0,10 (-47 %) | 0,21 -> 0,11 (-46 %) | 0,13 -> 0,078 (-41 %) |
| oQ3 | 12,2 GiB | 0,066 -> 0,040 (-39 %) | 0,082 -> 0,040 (-51 %) | 0,052 -> 0,037 (-28 %) |
| oQ4 | 15,2 GiB | 0,016 -> 0,012 (-26 %) | 0,018 -> 0,013 (-27 %) | 0,013 -> 0,012 (-13 %) |

Estos valores excluyen el codificador de vision y la cabeza MTP.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 16,3 GiB para los pesos en oQ4h, mas el espacio de trabajo para el contexto KV; con 262.144 tokens de contexto el consumo adicional puede ser considerable, por lo que se recomienda al menos 32 GB de memoria unificada y preferiblemente 64 GB para contextos largos.
- GPU recomendadas: el checkpoint esta en formato MLX, por lo que esta disenado para Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no esta pensado para GPU NVIDIA de consumo sin conversion previa.
- Opciones de despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh. Las versiones anteriores de oMLX no pueden cargarlo, y otros motores MLX no soportan el formato oQh.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4h-mtp | 27,781B (5,044 bits/peso) | 262.144 | MLX oQh | Apache-2.0 | Solo oMLX 0.8.0+ |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | safetensors BF16 | Apache-2.0 | Multiples motores |
| Variante oQ4e del mismo autor | 27B (mismo tamano) | 262.144 | MLX estandar | Apache-2.0 | Cualquier motor MLX compatible |

La comparacion con alternativas de otros fabricantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de oMLX 0.8.0 o superior: no funciona en versiones anteriores ni en otros motores MLX, lo que limita la portabilidad.
- Exclusivo para Apple Silicon: no hay soporte CUDA ni ROCm documentado.
- La cuantizacion introduce perdida de calidad respecto a BF16, medida como divergencia KL de 0,012 en oQ4h; es pequena pero no nula.
- La lista de idiomas soportados no esta publicada, aunque se evalua en siete idiomas.
- No se documenta soporte de tool calling ni de modo de razonamiento extendido, lo que puede limitar su uso en pipelines de agentes.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; no se han publicado evaluaciones especificas de fidelidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar el fichero LICENSE del repositorio y la licencia del modelo base.
- El contexto de 262.144 tokens exige memoria adicional para la cache KV; en equipos con menos de 32 GB puede no ser viable con contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oQ/oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
