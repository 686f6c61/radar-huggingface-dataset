# bambocher/LFM3-1.7B-oQ5

## Resumen

LFM3-1.7B-oQ5 es una cuantización mixta del modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario bambocher en Hugging Face. El checkpoint emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantización de precisión mixta sobre los pesos originales, con un promedio efectivo de 5,701 bits por peso. El resultado ocupa 1,2 GB en disco, lo que lo hace manejable en hardware de consumo con suficiente memoria unificada.

El modelo está empaquetado en formato MLX, la librería de Apple para ejecutar redes neuronales sobre el silicio de la familia M (M1, M2, M3, M4). Esto implica que su uso previsto es la inferencia local en equipos Mac, no en GPUs NVIDIA. Al tratarse de una cuantización derivada, el modelo hereda las capacidades del LFM3 original, pero la model card publicada no documenta ni el pipeline, ni los idiomas, ni la licencia, ni los datos de entrenamiento del modelo base.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización reciente (noviembre de 2026) con cero descargas y cero likes, sin benchmarks publicados ni documentación adicional. Resulta útil como ejemplo de flujo de cuantización mixta con oQ sobre MLX y como opción de despliegue local en Mac para quien ya conozca el modelo LFM3 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no detalla la arquitectura) |
| Parametros totales | 1.728.801.536 (1,729 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 5-bit grupo 64 (80,244% de los pesos), affine 6-bit grupo 64 (19,659%), affine 8-bit grupo 64 (0,074%), BF16 (0,022%). Promedio efectivo 5,701 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantizacion MLX (libreria mlx, custom_code) |

## Arquitectura y entrenamiento

La model card no proporciona informacion sobre la arquitectura del modelo base LFM3, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato tecnico verificable es el esquema de cuantizacion: oQ distribuye la precision de forma no uniforme, asignando 5 bits a la mayoria de los pesos (80,244%) y elevando a 6 bits un 19,659% de los tensores, presumiblemente los mas sensibles a la perdida de precision. Un 0,074% se mantiene en 8 bits y un 0,022% en BF16.

El checkpoint completo pesa 1,232 GB (1,147 GiB) y contiene 1,729 mil millones de pesos logicos. La cuantizacion se realizo con oMLX v0.7.3, herramienta del repositorio jundot/omlx, que implementa cuantizacion de precision mixta para el ecosistema MLX de Apple. No se documenta ninguna innovacion adicional en atencion, decodificacion especulativa ni arquitectura híbrida.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base LFM3, sin detalle en la model card.
- Razonamiento y matematicas: no documentado para esta cuantizacion.
- Generacion de codigo: no documentado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no se declaran).
- Modo thinking, vision o audio: no disponible.
- Inferencia local en Apple Silicon mediante MLX: capacidad confirmada por el formato y la libreria del checkpoint.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 1,2 GB cabe en equipos con 8 GB o mas de memoria unificada, lo que permite ejecutar el modelo sin GPU dedicada usando MLX.
- Prototipado rapido en portatiles Apple: al ocupar poco espacio en disco y memoria, sirve para probar pipelines de generacion de texto en un MacBook antes de escalar a modelos mayores.
- Evaluacion de tecnicas de cuantizacion mixta: util como referencia practica para comparar la perdida de calidad de oQ a 5,701 bits/peso frente al modelo LFM3 en BF16.
- Despliegue en entornos sin conectividad: el tamano reducido permite distribuir el modelo en un equipo de escritorio y ejecutarlo completamente offline.
- Experimentacion con la libreria MLX: sirve como caso de prueba para integraciones de MLX en aplicaciones macOS o iOS.
- Base para ajuste fino ligero en local: el checkpoint cuantizado puede servir de punto de partida para experimentos de adaptacion de bajo rango en hardware Apple, siempre que la herramienta lo soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB de pesos mas overhead de activaciones y cache KV; en la practica, varios GB de memoria unificada.
- GPU recomendadas: Apple Silicon (familia M1, M2, M3, M4) con memoria unificada; no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con 8 GB o mas de memoria unificada; el tamano del checkpoint (1,2 GB) lo permite con holgura.
- Opciones de despliegue: MLX y mlx-lm son las vias naturales; llama.cpp u Ollama requeririan conversion previa a GGUF, no documentada en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ5 | 1,729 B | no disponible | MLX safetensors (5,701 bits/peso) | no disponible | Hugging Face, 0 descargas |
| LFM3-1.7B (base, BF16) | 1,729 B | no disponible | safetensors | no disponible | Referencia del modelo original; datos no verificados en esta ficha |
| Otras cuantizaciones MLX de modelos ~1,7 B | ~1,7 B | variable | MLX safetensors | variable | Ecosistema MLX comunitario |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 5,701 bits/peso puede degradar la calidad respecto al modelo LFM3 original; no se han publicado evaluaciones que cuantifiquen esa perdida.
- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base LFM3 antes de cualquier despliegue productivo.
- No se documentan los idiomas soportados, por lo que no puede garantizarse un comportamiento correcto en castellano.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones especificas para esta cuantizacion.
- Sesgos conocidos: no documentados; dependen del dataset de entrenamiento del modelo base, que no se detalla.
- Longitud de contexto desconocida: limita el diseno de aplicaciones con conversaciones largas o documentos extensos.
- Dependencia del ecosistema Apple: el formato MLX no se ejecuta de forma nativa en GPUs NVIDIA ni en la mayoria de servidores Linux con CUDA.
- Artefacto sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria.
- El campo custom_code implica que la carga requiere codigo personalizado; conviene auditar ese codigo antes de ejecutarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ5
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Libreria MLX: no disponible en la informacion proporcionada
- Modelo base LFM3: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
