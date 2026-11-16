# maximianuu/gemma-4-31b-it-nvfp4

## Resumen

Gemma 4 31B (it) nvfp4 es una cuantización de 4 bits del modelo multimodal google/gemma-4-31B-it, publicada por el usuario maximianuu para su uso con el motor de inferencia Farabi sobre Apple Silicon mediante MLX. El modelo conserva la capacidad de entrada texto e imagen del original y reduce el peso en disco hasta unos 18,5 GB en el repositorio (aproximadamente 17 GB de pesos), lo que lo hace viable en equipos con memoria unificada de gama alta. La conversión emplea el formato nvfp4 con tamaño de grupo 16 y aplica un desplazamiento por potencias de dos sobre cada matriz lineal y sobre la tabla de embeddings para mantener las escalas de bloque dentro del rango del formato de escala de 8 bits.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco habitual (escalado por desplazamiento más ajuste de escalas de bloque por mínimos cuadrados, sin datos de calibración) y, por otro, advierte de que el resultado no es portable a otros cargadores MLX genéricos. El `config.json` incluye valores de compensación (`farabi_norm_eps_exp`, `farabi_embed_shift`) que solo el motor Farabi aplica al cargar; cualquier otro cargador leerá los tensores pero producirá salidas incorrectas. El modelo base tiene 31.273.088.876 parámetros según los safetensors del repositorio, licencia Apache 2.0 y pipeline image-text-to-text.

Se trata, por tanto, de un artefacto de nicho orientado a un runtime concreto, no de una distribución generalista. Quien necesite ejecutar Gemma 4 31B en MLX con otras herramientas debería recurrir a conversiones estándar de 4 u 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), base google/gemma-4-31B-it; pesos cuantizados en formato nvfp4 |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4 de 4 bits, tamaño de grupo 16, con desplazamiento por potencias de dos y escalas de bloque ajustadas por mínimos cuadrados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 18,5 GB |

## Arquitectura y entrenamiento

El modelo deriva de google/gemma-4-31B-it, un transformer multimodal que acepta texto e imagen como entrada. La model card de esta conversión no detalla la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención, composición del corpus de entrenamiento ni si hubo RLHF o DPO), por lo que esos datos deben consultarse en la ficha oficial de Google. Lo que sí se documenta es el proceso de cuantización: se parte de los pesos originales, se cuantizan a nvfp4 las matrices lineales y la tabla de embeddings de tokens, y cada matriz se multiplica por una potencia de dos antes de cuantizar para que sus escalas por bloque queden dentro del rango normal del formato de escala de 8 bits. Como cada proyección alimenta una RMS norm, el factor se cancela en esa norma y las normas afectadas reciben un epsilon mayor, cuyos exponentes se guardan en `config.json`.

Las escalas de bloque se ajustan por mínimos cuadrados en lugar de por máximo absoluto. No se usaron datos de calibración ni fine-tuning, y el tokenizador, la plantilla de chat y los ficheros de procesador quedan sin cambios respecto al original. El autor justifica la conversión frente a la estándar de MLX porque esta última producía etiquetas HTML malformadas en generaciones largas (atributos inventados dentro de `<strong>`), un fallo que no aparecía con una conversión de 8 bits ni con esta. En una comparación a nivel de token contra una referencia de 8 bits, esta conversión mide una divergencia KL de aproximadamente 0,03.

## Capacidades

- Generación de texto conversacional con plantilla de chat heredada del modelo base.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text).
- Razonamiento y generación de código, en la medida en que lo soporte el modelo base Gemma 4 31B it; la model card no aporta detalles específicos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta conversión.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no se listan en la ficha).
- Modo thinking, visión avanzada o audio: no disponible en la información proporcionada más allá de la entrada de imagen.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está pensado para cargarse con el motor Farabi en equipos Mac con memoria unificada suficiente (los pesos ocupan unos 17 GB), lo que permite ejecutar un modelo de 31B en local sin GPU dedicada.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, puede emplearse para extraer y resumir información de capturas, diagramas o páginas escaneadas, siempre que se use el runtime Farabi.
- Generación de HTML y contenido estructurado: el autor documenta que esta conversión evita el fallo de etiquetas malformadas observado en la cuantización estándar de MLX, lo que la hace adecuada para pipelines que generan marcado en generaciones largas.
- Experimentación en cuantización de 4 bits: sirve como caso de estudio reproducible de la técnica de desplazamiento por potencias de dos y ajuste de escalas por mínimos cuadrados, útil para investigadores que comparan estrategias de cuantización post-entrenamiento.
- Asistente conversacional de prototipo: con la plantilla de chat original, puede integrarse en un servidor local del motor Farabi (`python -m engine.server`) para pruebas de conversación multi-turno.
- Evaluación comparativa de fidelidad: la divergencia KL de ~0,03 frente a una referencia de 8 bits permite usarlo como referencia práctica en estudios de degradación por cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aportado por el autor es la divergencia KL de aproximadamente 0,03 respecto a una conversión de 8 bits, medida en una comparación a nivel de token.

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 17 GB solo para pesos; hay que añadir la memoria para el contexto, el procesador de imagen y las cachés KV, por lo que se recomienda un equipo con al menos 24-32 GB de memoria unificada.
- GPU recomendadas: no aplica en el sentido habitual; el modelo es para Apple Silicon vía MLX. No se documenta soporte para A100, H100 ni RTX 4090 con este artefacto.
- ¿Cabe en GPU de consumo? No se indica; el formato nvfp4 con compensaciones específicas está atado al motor Farabi sobre MLX.
- Opciones de despliegue: exclusivamente el motor Farabi (repositorio github.com/maximianuu/farabi), con el comando `python -m engine.server` y el identificador de modelo `gemma4-31b`. Otros cargadores MLX leerán los tensores pero no aplicarán las compensaciones y darán salidas incorrectas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| maximianuu/gemma-4-31b-it-nvfp4 | 31,27 B | no disponible | nvfp4 4 bits, grupo 16 | Apache 2.0 | Farabi (MLX) |
| google/gemma-4-31B-it | 31,27 B (aprox.) | no disponible | pesos originales | Apache 2.0 | Cualquiera compatible con el original |
| Conversión estándar MLX nvfp4 de Gemma 4 31B | 31,27 B (aprox.) | no disponible | nvfp4 4 bits estándar | Apache 2.0 | Cargadores MLX genéricos |
| Conversión MLX de 8 bits de Gemma 4 31B | 31,27 B (aprox.) | no disponible | 8 bits | Apache 2.0 | Cargadores MLX genéricos |

La comparativa se limita a variantes del mismo modelo base porque la información disponible no permite contrastar con otras familias. La diferencia práctica entre esta conversión y la estándar de MLX es la fidelidad en generaciones largas y la dependencia de un runtime específico.

## Limitaciones y advertencias

- Portabilidad nula: las compensaciones `farabi_norm_eps_exp` y `farabi_embed_shift` solo las aplica el motor Farabi; con otros cargadores MLX la salida será incorrecta aunque los tensores se lean sin error.
- Dependencia de un proyecto de un único autor: el motor Farabi y esta conversión no tienen respaldo de Google ni de un equipo de mantenimiento amplio.
- Sin datos de calibración: la cuantización se hizo sin calibración ni fine-tuning, lo que puede degradar tareas específicas no evaluadas.
- Riesgo de alucinación y sesgos: heredados del modelo base; no se documentan evaluaciones de sesgo ni de seguridad para esta conversión.
- Idiomas y contexto: no se especifican en la ficha, por lo que no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Licencia: Apache 2.0, igual que el original, pero "Gemma" es una marca de su propietario y esta conversión es no oficial; conviene revisar los términos de uso de Gemma antes de un despliegue comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- Fecha de creación futura respecto a la mayoría de artefactos del ecosistema, lo que sugiere que debe verificarse la disponibilidad y estabilidad del motor asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maximianuu/gemma-4-31b-it-nvfp4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Motor Farabi: https://github.com/maximianuu/farabi
- Modelo asistente asociado citado en la model card: https://huggingface.co/maximianuu/gemma-4-31b-it-assistant-nvfp4
