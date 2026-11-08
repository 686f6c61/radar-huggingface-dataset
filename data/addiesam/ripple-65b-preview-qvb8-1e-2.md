# addiesam/Ripple-65B-Preview-QVB8-1e-2

## Resumen

Ripple-65B-Preview-QVB8-1e-2 es un paquete de pesos cuantizados del modelo Ripple-65B-Preview, desarrollado por Ricursive AI y comprimido por el investigador independiente Dr. Addie Sam mediante el formato QVB8. No es un modelo nuevo: es una versión comprimida con cota de error L∞ certificada (tau = 0.01) del modelo base de 65.000 millones de parámetros, pensada para ejecutarse en el motor de inferencia QVB8, que decodifica los pesos comprimidos directamente en la GPU dentro de sus propios kernels CUDA.

El modelo base Ripple-65B-Preview es un modelo de lenguaje de propósito general de 65B parámetros publicado por Ricursive AI como variante abierta del modelo propietario que impulsa su plataforma de diseño de chips. La compresión QVB8 reduce el peso en disco a 30,6 GiB con una media de 4,05 bits por peso sobre 642 tensores comprimidos, manteniendo la garantía de que ningún peso restaurado difiere del original bf16 en más de tau = 0.01.

La relevancia de este paquete es doble: por un lado, permite ejecutar un modelo de 65B en hardware más modesto que el requerido por los pesos bf16; por otro, introduce un enfoque de cuantización que controla el error máximo (norma L∞) en lugar del error medio, atacando fallos puntuales como tokens erróneos o caracteres de otro idioma que las métricas medias no detectan. La contrapartida principal es que requiere el motor QVB8 y no es cargable en `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 65B; detalles no publicados en la informacion disponible) |
| Parametros totales | 65.000 millones (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con tau = 0.01, media de 4,05 bits por peso, anchura de bits por fila |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QVB8 (no compatible con safetensors, GGUF ni `transformers`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Ripple-65B-Preview en los materiales proporcionados. Ricursive AI indica que optimizo la arquitectura para sus plataformas de entrenamiento y servicio, con ganancias de eficiencia, y que se trata de una variante de proposito general de su modelo propietario para diseno de chips. No se especifican numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de este paquete es el esquema de compresion QVB8: cada matriz de pesos se empaqueta con una anchura de bits por fila y se verifica tras el empaquetado, registrando en `manifest.json` el error maximo (`max_err`) por tensor. La compresion no usa datos de calibracion y depende solo de los pesos. El resultado es una cota L∞: el error maximo de cualquier peso restaurado queda por debajo de tau, en lugar de controlarse solo el error medio como en la cuantizacion convencional. El motor QVB8 decodifica los pesos en la GPU y admite un paquete "drafter" separado (`DRAFT`) junto al paquete principal (`MODEL`), lo que sugiere decodificacion especulativa, aunque el README no lo detalla.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` sobre un modelo base de 65B parametros.
- Razonamiento y codigo: no hay informacion especifica publicada en los materiales disponibles; el modelo base se describe como de proposito general.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el autor del paquete menciona caracteres de otros idiomas como sintoma de error de cuantizacion, pero no se declaran idiomas soportados).
- Modo thinking, vision o audio: no disponible.
- Ejecucion en hardware reducido: gracias a la decodificacion en GPU del motor QVB8, un modelo de 65B puede correr en equipos con menos memoria que los pesos bf16.

## Casos de uso

- Despliegue de un LLM de 65B en hardware limitado: el paquete ocupa 30,6 GiB en disco y el motor QVB8 decodifica los pesos en la GPU, lo que permite servir un modelo grande en equipos con menos VRAM que la necesaria para bf16 (aproximadamente 130 GB).
- Investigacion sobre cuantizacion con cota L∞: util para estudiar el efecto del error maximo frente al error medio en la calidad de generacion, comparando distintos valores de tau sobre el mismo modelo base.
- Evaluacion de fallos puntuales de cuantizacion: el esquema esta disenado para reducir tokens erroneos aislados o caracteres de otro idioma que aparecen con formatos de 4 bits convencionales; sirve para reproducir y medir ese fenomeno.
- Experimentacion con decodificacion asistida por drafter: el motor acepta un paquete `DRAFT` ademas del `MODEL`, lo que permite probar configuraciones de decodificacion especulativa sobre un modelo de 65B.
- Prototipado de pipelines de generacion de texto en entornos de investigacion con licencia Apache-2.0, sin restricciones de uso comercial derivadas de la licencia.
- Base para comparativas de compresion: al conservar el modelo original en bf16, permite medir la degradacion de perplejidad y de calidad de respuesta frente a distintos tau y formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. Los pesos comprimidos ocupan 30,6 GiB en disco; a esto hay que sumar la memoria de trabajo del motor QVB8 (buffers de decodificacion, cache KV) y, si se usa, el paquete drafter.
- GPU recomendadas: no disponibles en la documentacion. El autor menciona que necesita maquinas para probar "otras generaciones de GPU", sin especificar cuales estan soportadas.
- Compatibilidad con GPU de consumo: no confirmada. Con 30,6 GiB de pesos, no cabe en GPUs de 24 GB (RTX 4090) sin mecanismos adicionales; encajaria en GPUs de 48 GB o mas (A6000, L40S, A100 80 GB, H100) si el motor lo soporta.
- Opciones de despliegue: exclusivamente el motor QVB8 (https://github.com/addiesam/qvb8). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8-1e-2 | 65B | no disponible | QVB8 (4,05 bits/peso medio) | Apache-2.0 | QVB8 |
| Ripple-65B-Preview (base) | 65B | no disponible | bf16 | Apache-2.0 | `transformers` y otros |
| Otros modelos abiertos de ~65B | no disponible | no disponible | safetensors, GGUF | variable | vLLM, llama.cpp, etc. |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el paquete no carga en `transformers` ni en otros motores; sin el motor propietario el modelo es inutilizable.
- La cota L∞ cubre solo los pesos almacenados: no garantiza que las respuestas del modelo comprimido sean identicas a las del original ni que sean correctas.
- Sin datos de calibracion: la compresion depende solo de los pesos, lo que puede afectar a la calidad en comparacion con tecnicas que usan datos de calibracion.
- Idiomas y contexto no declarados: no hay informacion sobre cobertura linguistica ni longitud de contexto, lo que impide evaluar su idoneidad para tareas multilingues o de contexto largo.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones especificas.
- Sesgos: no documentados en los materiales disponibles.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el motor deben verificarse por separado; el autor no ofrece garantia alguna.
- Madurez: el paquete tiene 0 descargas y 0 likes, y el autor lo describe como trabajo de un investigador independiente que aun necesita maquinas para probar mas configuraciones; no hay evidencia de uso en produccion.
- El modelo base es una "Preview": Ricursive AI lo presenta como variante abierta de un modelo propietario, sin garantias de soporte a largo plazo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-2
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Pagina del modelo en Ricursive AI: https://www.ricursive.com/ripple
- Motor QVB8: https://github.com/addiesam/qvb8
- Paper I: Sam, Chi Ngai. *Certified L∞-Bounded Compression for AI Models, I: The Contract and the Virtual-Band Index.* https://doi.org/10.5281/zenodo.23815007
- Paper II: Sam, Chi Ngai. *Certified L∞-Bounded Compression for AI Models, II: Compressing a Language Model's Weights, Key–Value Cache and Activations.* https://doi.org/10.5281/zenodo.23816044
- Patrocinio del autor: https://github.com/sponsors/addiesam
