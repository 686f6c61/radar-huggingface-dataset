# RabiatS/Llama-3.2-3B-Instruct-4bit-Lantern

## Resumen

Llama-3.2-3B-Instruct-4bit-Lantern es una copia cuantizada a 4 bits en formato MLX del modelo meta-llama/Llama-3.2-3B-Instruct, publicada por el usuario RabiatS para la aplicacion Lantern, un cliente de IA local para iPhone, iPad y Mac. El repositorio no introduce cambios en los pesos: es una replica de mlx-community/Llama-3.2-3B-Instruct-4bit alojada en un repositorio propio para que la aplicacion pueda descargarla desde Hugging Face de forma verificable.

El modelo resuelve un caso de uso muy concreto: inferencia totalmente en el dispositivo, sin cuenta, sin servidor y sin enviar datos a terceros. El unico trafico de red necesario es la descarga inicial de los ficheros, aproximadamente 1,8 GB. Con 3.212.749.824 parametros almacenados en 4 bits, esta pensado para equipos con memoria unificada limitada.

Es relevante dentro del ecosistema de IA privada en Apple Silicon: segun la model card, funciona en iPhone con 6 GB de RAM (con aviso de memoria), es comodo en telefonos de 8 GB (iPhone 15 Pro, toda la gama iPhone 16 y 17) y en cualquier Mac con chip Apple Silicon. La longitud de contexto y los idiomas soportados no se detallan en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Llama 3.2 3B Instruct (no detallada en la model card) |
| Parametros totales | 3.212.749.824 (3,2 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License (identificador `llama3.2`) |
| Formato de pesos | safetensors (cuantizados, libreria MLX) |
| Tamano del repositorio | 1,8 GB |
| Modalidad de entrada | texto |
| Libreria | mlx (mlx-lm) |
| Tarea | text-generation (conversacional) |

## Arquitectura y entrenamiento

Se trata de una conversion de pesos, no de un entrenamiento nuevo. Los pesos son identicos a los de mlx-community/Llama-3.2-3B-Instruct-4bit, que a su vez deriva de meta-llama/Llama-3.2-3B-Instruct. La model card indica explicitamente que los pesos no se han modificado respecto a la conversion de mlx-community. Por tanto, no hay datos propios sobre numero de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica relevante no esta en el modelo sino en el formato y el flujo de distribucion: cuantizacion a 4 bits en el formato de MLX (optimizado para memoria unificada de Apple Silicon) y empaquetado en un repositorio dedicado que Lantern consume. La aplicacion comprueba la memoria disponible del dispositivo antes de iniciar la descarga, lo que actua como control de viabilidad en hardware con 6 u 8 GB de RAM. La model card tambien documenta el uso mediante `mlx-lm` en Mac con un unico comando de generacion. No se detallan innovaciones de decodificacion especulativa, atencion lineal ni tecnicas similares.

## Capacidades

- Generacion de texto conversacional en ingles, derivada del ajuste de instrucciones de Llama 3.2 3B Instruct.
- Razonamiento y respuestas mas largas que los modelos de menor tamano del mismo ecosistema, segun la propia model card.
- Ejecucion totalmente offline: no requiere cuenta, servidor ni conexion tras la descarga inicial.
- Privacidad por diseno: ningun texto introducido por el usuario sale del dispositivo.
- Integracion directa en la aplicacion Lantern (iPhone, iPad, Mac) mediante su catalogo de modelos.
- Integracion en Mac con `mlx-lm` mediante linea de comandos.
- Soporte de tool calling, function calling, agentes, vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional privado en iPhone o Mac: el modelo se ejecuta en local dentro de Lantern, de modo que notas, borradores o consultas personales no se transmiten a ningun servidor. Adecuado porque el unico trafico de red es la descarga inicial de 1,8 GB.
- Redaccion y reescritura de texto en movilidad: generar correos, resumenes o parrafos largos directamente en el dispositivo, aprovechando que el modelo ofrece respuestas mas extensas que alternativas de menor tamano.
- Prototipado de aplicaciones Apple Silicon con `mlx-lm`: validar prompts y flujos de generacion en un Mac antes de integrarlos en una app, usando el comando `mlx_lm.generate` documentado en la model card.
- Entornos sin conectividad o con red restringida: despliegue en equipos aislados donde no se permite enviar datos a servicios en la nube.
- Educacion y experimentacion con modelos cuantizados: estudiar el comportamiento de una cuantizacion de 4 bits en MLX con un modelo de 3,2 mil millones de parametros y comparar la salida con la version sin cuantizar.
- Desarrollo de clientes de IA local para iOS/iPadOS: usar Lantern como referencia de integracion, incluyendo la comprobacion previa de memoria del dispositivo antes de descargar pesos.
- Asistencia de escritura en dispositivos con 8 GB de RAM: iPhone 15 Pro y gama iPhone 16 y 17, donde la model card indica que la ejecucion es comoda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 1,8 GB en cuantizacion de 4 bits (MLX). Es la cifra de descarga indicada en el repositorio.
- Memoria recomendada: 8 GB de memoria unificada o mas para una experiencia comoda (iPhone 15 Pro, toda la gama iPhone 16 y 17, cualquier Mac Apple Silicon).
- Memoria minima: iPhones con 6 GB de RAM, con aviso de memoria por parte del sistema o de la aplicacion.
- Mac: cualquier equipo con chip Apple Silicon.
- GPU NVIDIA (A100, H100, RTX 4090) u otras: compatibilidad no disponible; el formato MLX esta orientado a Apple Silicon, y la model card solo documenta ejecucion en iPhone, iPad y Mac.
- Opciones de despliegue: aplicacion Lantern en iPhone, iPad y Mac; `mlx-lm` en Mac. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano de descarga | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RabiatS/Llama-3.2-3B-Instruct-4bit-Lantern | 3,2 mil millones | 4 bits MLX | ~1,8 GB | Llama 3.2 Community License | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| mlx-community/Llama-3.2-3B-Instruct-4bit | no disponible | 4 bits MLX | no disponible | Llama 3.2 Community License | Hugging Face; pesos identicos segun la model card |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 mil millones (modelo base) | sin cuantizar | no disponible | Llama 3.2 Community License | Hugging Face, repositorio oficial de Meta |

La diferencia principal entre las tres opciones es de empaquetado y distribucion, no de capacidades: los pesos son los mismos. El repositorio de RabiatS existe para que Lantern pueda descargar una copia concreta. No se dispone de datos de rendimiento comparado entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion de pesos, no un modelo nuevo: hereda todas las limitaciones de Llama 3.2 3B Instruct.
- La cuantizacion a 4 bits puede degradar la calidad de las respuestas respecto al modelo sin cuantizar, especialmente en tareas de razonamiento o codigo. No hay mediciones publicadas en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones de fidelidad para esta cuantizacion.
- Idiomas soportados no especificados. La model card esta redactada en ingles y los ejemplos de uso tambien, pero no se declara oficialmente el conjunto de idiomas.
- Longitud de contexto no declarada en el repositorio.
- Restricciones de licencia: se aplica la Llama 3.2 Community License de Meta Platforms, Inc. El uso debe cumplir simultaneamente la licencia (`LICENSE`) y la politica de uso aceptable (`USE_POLICY.md`) incluidas en el repositorio. Es imprescindible revisarlas antes de cualquier uso comercial.
- Modelo muy poco adoptado: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su fiabilidad en produccion.
- Formato exclusivamente MLX: no es directamente utilizable en pilas de inferencia CUDA o basadas en GGUF sin conversion previa.
- En iPhone con 6 GB de RAM la propia model card advierte de avisos de memoria, lo que puede provocar cierres de la aplicacion.
- La fecha de creacion y actualizacion del repositorio (28 de septiembre de 2026) es posterior a la fecha de referencia habitual; conviene verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RabiatS/Llama-3.2-3B-Instruct-4bit-Lantern
- Repositorio de la conversion original en MLX: https://huggingface.co/mlx-community/Llama-3.2-3B-Instruct-4bit
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Aplicacion Lantern: https://github.com/RabiatS/lantern
