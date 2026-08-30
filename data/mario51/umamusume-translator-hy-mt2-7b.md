# Mario51/umamusume-translator-hy-mt2-7b

## Resumen

El modelo `Mario51/umamusume-translator-hy-mt2-7b` es un ajuste fino (fine-tune) del modelo de traducción multilingüe `tencent/Hy-MT2-7B`, especializado en traducir los diálogos del juego *Umamusume: Pretty Derby* del japonés al inglés. Lo ha desarrollado el usuario Mario51 a partir de un dataset generado al alinear los archivos de historia oficiales en japonés con su localización inglesa oficial, lo que permite capturar las voces particulares de los personajes, los nombres propios y el tono característico del universo Umamusume.

El modelo tiene 7.504.568.320 parámetros (~7,5 mil millones), es de arquitectura densa (etiqueta `hunyuan_v1_dense`) y se distribuye en formato `safetensors` con pesos en BF16. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Está pensado para ejecutarse localmente y realizar traducción en tiempo real del contenido narrativo no traducido del juego, aunque el autor advierte que es un modelo especialista y no rinde bien en traducción general de japonés.

La relevancia actual radica en que ofrece una solución práctica para la comunidad de jugadores que desea acceder a contenido del juego aún no localizado, aprovechando la calidad del modelo base de Tencent y un ajuste fino orientado a un dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (variante Hunyuan v1 dense) |
| Parametros totales | 7.504.568.320 (~7,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Disponible en GGUF (cuantizaciones típicas de llama.cpp, no especificadas) |
| Idiomas soportados | Japones e ingles (fine-tune); el modelo base soporta 33 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) y GGUF (version cuantizada) |

## Arquitectura y entrenamiento

El modelo base `Hy-MT2-7B` pertenece a la familia Hy-MT2 de Tencent Hunyuan, una serie de modelos de traducción multilingüe denominados de "pensamiento rápido" (*fast-thinking*) diseñados para escenarios complejos del mundo real. Hy-MT2 incluye tres tamaños: 1.8B, 7B y 30B-A3B (MoE), y todos soportan traducción entre 33 idiomas, siguiendo instrucciones de traducción en múltiples lenguas. El modelo de 7B es una variante densa, lo que implica que todos los parámetros se activan en cada inferencia, a diferencia de la versión MoE.

El ajuste fino realizado por Mario51 se llevó a cabo con un dataset generado al alinear los archivos de historia en japonés con su traducción oficial al inglés del juego *Umamusume: Pretty Derby*. No se especifican detalles del proceso de entrenamiento (épocas, tasa de aprendizaje, técnica de alineación como RLHF o DPO). El autor indica que el modelo se centra en diálogos de historia y puede no conocer toda la terminología específica de carreras o entrenamiento. No se menciona ninguna innovación técnica adicional más allá del fine-tune sobre el modelo base.

## Capacidades

- Traduccion de dialogos del juego *Umamusume: Pretty Derby* del japones al ingles, capturando las voces de los personajes, nombres propios y el tono caracteristico del universo del juego.
- Traduccion en tiempo real ejecutandose localmente, gracias a su tamano moderado (~7,5 B) y a que esta disenado para cargarse con la libreria `transformers`.
- Soporte de instrucciones de traduccion en el contexto del juego, aprovechando las capacidades del modelo base Hy-MT2-7B (que sigue instrucciones en 33 idiomas).
- Capacidades multilingues limitadas al par japones-ingles en la practica, aunque el modelo base subyacente es multilingue.
- No se indica soporte para tool calling, funciones de agente, vision ni audio. Es un modelo puramente textual y especializado en traduccion.

## Casos de uso

- Traduccion de contenido narrativo no localizado: el modelo permite traducir capitulos, eventos y dialogos del juego que aun no han sido oficialmente traducidos al ingles, facilitando el acceso a la historia completa.
- Traduccion en tiempo real durante la partida: al poder ejecutarse localmente, un jugador puede usarlo como herramienta de traduccion simultanea mientras juega, sin depender de servicios en la nube.
- Creacion de subtitulos o parches de fans: los equipos de traduccion comunitaria pueden utilizar el modelo como base para generar borradores de traduccion de nuevos contenidos, reduciendo el trabajo manual de edicion.
- Analisis de dialogos y transcripciones: investigadores o aficionados pueden emplearlo para comparar las diferencias entre la localizacion oficial y el texto original japones.
- Generacion de resumenes o guias de historia: al traducir correctamente los dialogos, se pueden producir guias argumentales o resumenes en ingles de las tramas de cada personaje.
- Integracion en herramientas de lectura de archivos de texto del juego: dado que el modelo acepta instrucciones de traduccion, puede integrarse en scripts o aplicaciones que extraigan y traduzcan automaticamente los archivos de historia del juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como BLEU, chrF o comparaciones con otros modelos de traduccion. Se desconoce el rendimiento cuantitativo del modelo en tareas de traduccion general o especifica del dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (15 GB de tamano de repositorio), se necesitan al menos 16 GB de VRAM para cargar el modelo completo. Con cuantizacion GGUF de 8 bits (~8 GB) o 4 bits (~4-5 GB), puede ejecutarse en GPUs de consumo con 8 GB o menos.
- GPU recomendadas: para la version BF16, una GPU con 16 GB o mas (RTX 4090, A100, H100, etc.). Para versiones cuantizadas, una RTX 3060 de 12 GB o RTX 4060 Ti de 8 GB podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, especialmente con cuantizaciones GGUF de 4 u 8 bits, que permiten ejecucion en tarjetas como RTX 3060, RTX 4070 o similares.
- Opciones de despliegue: ademas de `transformers`, existe una version GGUF (en `mradermacher/umamusume-translator-hy-mt2-7b-GGUF`) que puede usarse con `llama.cpp`, `Ollama` u otros motores compatibles con GGUF. Tambien es posible servirlo con `vLLM` o `TGI` si se dispone de suficiente VRAM.
- Latencia y throughput estimados: no se proporcionan datos concretos. Para un modelo de 7 B en una GPU moderna, se espera una latencia de decodificacion de decenas de tokens por segundo con cuantizacion, y algo menor con BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Mario51/umamusume-translator-hy-mt2-7b (este) | 7,5 B | No disponible | ja, en | Apache 2.0 | Fine-tune especializado en Umamusume |
| tencent/Hy-MT2-7B (modelo base) | 7,5 B | No disponible | 33 idiomas | Apache 2.0 | Traduccion general multilingue, sin especializacion |
| tencent/Hy-MT2-1.8B | 1,8 B | No disponible | 33 idiomas | Apache 2.0 | Version mas pequena, menor calidad pero mas rapida |
| tencent/Hy-MT2-30B-A3B (MoE) | 30 B totales, 3 B activos | No disponible | 33 idiomas | Apache 2.0 | Version MoE de mayor capacidad, mejor rendimiento |

La comparativa muestra que este modelo es una especializacion del Hy-MT2-7B, sacrificando la cobertura multilingue por una mayor precision en el dominio concreto de Umamusume. Frente a las alternativas de la misma familia, ofrece la ventaja de estar afinado para un caso de uso especifico, pero no es adecuado para traduccion general.

## Limitaciones y advertencias

- Modelo especialista: el autor advierte explicitamente que puede no rendir bien en traduccion general de japones fuera del contexto de Umamusume.
- Cobertura terminologica limitada: puede no conocer toda la terminologia especifica de carreras, entrenamiento o tecnicas del juego, lo que podria producir traducciones inexactas en esos ambitos.
- Sesgo hacia el estilo de localizacion oficial: al entrenarse con la localizacion oficial, el modelo puede replicar las decisiones de traduccion de ese equipo, lo que podria no coincidir con las preferencias de otros traductores.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar traducciones inventadas o incorrectas, especialmente en frases ambiguas o fuera del dominio entrenado.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que no se conocen los limites para dialogos largos o multiples turnos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base y el fine-tune son de codigo abierto. No se indican restricciones adicionales.
- Dependencia del modelo base: las limitaciones de Hy-MT2-7B (por ejemplo, en idiomas fuera de los 33 soportados) se heredan en este fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mario51/umamusume-translator-hy-mt2-7b
- Version GGUF (cuantizada): https://huggingface.co/mradermacher/umamusume-translator-hy-mt2-7b-GGUF
- Repositorio oficial de Hy-MT2 en GitHub: https://github.com/Tencent-Hunyuan/Hy-MT2
- Pagina de Hy-MT2-7B en Xinference (informacion sobre el modelo base): https://model.xinference.io/models/detail/Hy-MT2-7B
