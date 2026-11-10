# addiesam/Ripple-65B-Preview-QVB8R-1e-3

## Resumen

Ripple-65B-Preview-QVB8R-1e-3 es un paquete de pesos cuantizados del modelo de lenguaje Ripple-65B-Preview (desarrollado por ricursiveAI), publicado por el usuario addiesam. No es un modelo entrenado desde cero, sino una compresion certificada del modelo base en bf16 mediante el formato QVB8R (QVB8 con codificacion entropica), con un limite de error L-infinito de tau = 0.001. El paquete esta disenado exclusivamente para ejecutarse en el motor de inferencia QVB8, desarrollado por el mismo autor, y no es cargable directamente con `transformers`.

La propuesta tecnica central es la compresion con cota de error certificada: en lugar de optimizar una metrica promedio como la perplejidad, el formato garantiza que cada peso restaurado difiere del original en menos de tau, verificandose tensor por tensor tras el empaquetado. Esto aborda un problema conocido de la cuantizacion agresiva: errores grandes en pesos aislados que pueden alterar tokens concretos y producir fallos puntuales que las metricas medias no detectan.

El paquete ocupa 46,6 GB en disco, comprime 642 tensores con una media de 5,75 bits por peso y esta certificado tanto para fp16 como para bf16. La licencia es Apache 2.0. El modelo base declara 65B en su nombre, aunque el recuento real de parametros del safetensors es de 1.664.080, una discrepancia que conviene tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, no confirmado en la informacion) |
| Parametros totales | 1.664.080 segun safetensors; el nombre del modelo base indica 65B (dato no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8R (QVB8 con codificacion entropica), tau = 0.001, media de 5,75 bits por peso en los 642 tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8R con `manifest.json` y `escape_tables.json`; no compatible con safetensors estandar ni GGUF |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una representacion comprimida del modelo base ricursiveAI/Ripple-65B-Preview, originalmente en bf16. El empaquetado QVB8R asigna un ancho de bits por fila a cada matriz de pesos y codifica la informacion de forma entropica. No se utiliza ningun conjunto de calibracion: la compresion depende unicamente de los valores de los pesos. Tras el empaquetado, cada tensor se verifica y se registra el error maximo (`max_err`) en `manifest.json`, garantizando que ninguno supera tau = 0.001 respecto al valor bf16 original.

La innovacion principal es la cota L-infinito certificada: el error maximo esta acotado y auditado, no solo el promedio. Los pesos que no pueden representarse dentro de la cota se almacenan de forma exacta mediante listas de escape (`escape_tables.json`), con tablas separadas para fp16 y bf16. La actualizacion del 9 de noviembre de 2026 anadio la tabla fp16 (1.302 escapes frente a 45.600 en la lista combinada), lo que segun el autor eleva la decodificacion de aproximadamente 1,8 a 5,7 tokens por segundo en una DGX Spark con un solo prompt y decodificacion greedy. No hay informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo base.

## Capacidades

- Generacion de texto y conversacion, segun el pipeline declarado (`text-generation`, `conversational`).
- Compresion con cota de error verificable por tensor, con trade-off explicito entre tau, tamano de archivo y fidelidad.
- Soporte de decodificacion especulativa mediante un modelo drafter DFlash2 empaquetado por separado (packs de 3,4 GB y 4,1 GB).
- Certificacion dual fp16 y bf16, con tablas de escape optimizadas por tipo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue de un modelo de 65B en hardware limitado: el motor QVB8 decodifica los pesos comprimidos en la GPU dentro de sus propios kernels CUDA, lo que permite ejecutar un modelo grande en equipos donde los pesos bf16 no caberian. El pack de 46,6 GB es la variante de mayor fidelidad dentro de la familia QVB8R.
- Investigacion sobre cuantizacion con garantias: util para estudiar el efecto de cotas L-infinito frente a metricas promedio, comparando packs con tau = 1e-3 y tau = 2e-3 sobre el mismo modelo base.
- Evaluacion de fallos puntuales de cuantizacion: permite reproducir y medir el fenomeno de tokens erroneos o caracteres de otro idioma que aparecen con formatos de 4 bits y comprobar si la cota estricta los elimina.
- Servicio de inferencia conversacional con decodificacion especulativa: combinando el pack objetivo con el drafter DFlash2 se reduce la latencia en entornos de un solo usuario o baja concurrencia.
- Auditoria de artefactos de compresion: `manifest.json` y `escape_tables.json` permiten verificar el error maximo por tensor antes de desplegar, util en pipelines con requisitos de trazabilidad.
- Experimentacion en una DGX Spark o estaciones con GPU unica: el autor reporta unas 5,7 tokens por segundo en fp16 con decodificacion greedy, suficiente para pruebas y prototipos interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la velocidad de decodificacion en una DGX Spark (fp16, un prompt, greedy): aproximadamente 1,8 tokens por segundo antes de la tabla de escapes fp16 y 5,7 tokens por segundo con ella.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el pack ocupa 46,6 GB en disco y el motor decodifica en la GPU, por lo que se requiere una GPU con memoria suficiente para los pesos decodificados y el estado de inferencia.
- GPU recomendadas: el autor cita una DGX Spark como plataforma de prueba; no se detallan otras GPU compatibles.
- Viabilidad en GPU de consumo: no disponible; 46,6 GB de pesos comprimidos exceden la VRAM de cualquier GPU de consumo actual en un solo dispositivo.
- Opciones de despliegue: exclusivamente el motor QVB8 (v1.0.1 o posterior) desde github.com/addiesam/qvb8. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: aproximadamente 5,7 tokens por segundo en fp16 con decodificacion greedy en una DGX Spark, segun el autor; sin datos para bf16 ni para escenarios con concurrencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia interna de la propia familia de packs:

| Pack | Formato | tau | Tamano |
|---|---|---|---|
| Ripple-65B-Preview-QVB8-1e-3 | qvb8 | 1e-3 | 57 GB |
| Ripple-65B-Preview-QVB8R-1e-3 (este) | qvb8r | 1e-3 | 47 GB |
| Ripple-65B-Preview-QVB8-2e-3 | qvb8 | 2e-3 | 49 GB |
| Ripple-65B-Preview-QVB8R-2e-3 | qvb8r | 2e-3 | 38 GB |

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el pack no carga en `transformers` ni en otros motores, lo que limita la portabilidad y crea dependencia de un proyecto con un unico mantenedor.
- La cota de error cubre unicamente los pesos almacenados; no garantiza que las respuestas del modelo sean identicas a las del original ni correctas, tal como advierte el propio autor.
- Discrepancia en el recuento de parametros: el safetensors declara 1.664.080 parametros frente al "65B" del nombre del modelo base; conviene verificar antes de asumir capacidades.
- Idiomas soportados no documentados; no hay garantia de calidad multilingue.
- Sin datos de benchmarks, evaluaciones de sesgo ni pruebas de alucinacion publicadas.
- El rendimiento reportado (5,7 tok/s) corresponde a un unico prompt con decodificacion greedy en una DGX Spark; no extrapolable a produccion con concurrencia.
- Requiere descargar el repositorio completo para que `escape_tables.json` quede junto a `manifest.json`; una ejecucion fp16 sin ese archivo se detiene al arrancar.
- Licencia Apache 2.0 en el paquete, pero la licencia y condiciones del modelo base deben verificarse por separado en ricursiveAI/Ripple-65B-Preview.

## Enlaces

- Repositorio del pack: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor de inferencia QVB8: https://github.com/addiesam/qvb8
- Release v1.0.1 del motor: https://github.com/addiesam/qvb8/releases/tag/v1.0.1
- Pack QVB8-1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Pack QVB8-2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Pack QVB8R-2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Drafter DFlash2 QVB8-5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Drafter DFlash2 QVB8R-5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
