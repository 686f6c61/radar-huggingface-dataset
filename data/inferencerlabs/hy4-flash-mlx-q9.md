# inferencerlabs/Hy4-flash-MLX-Q9

## Resumen

Hy4-flash es un modelo multimodal de tipo image-text-to-text desarrollado por Tencent, distribuido originalmente en Hugging Face bajo el identificador `tencent/Hy4-flash`. Esta ficha describe concretamente la variante cuantizada `inferencerlabs/Hy4-flash-MLX-Q9`, publicada por el usuario inferencerlabs, que adapta el modelo base al formato MLX para su ejecucion en hardware Apple Silicon. La cuantizacion a 9 bits busca un equilibrio entre precision casi sin perdida y un footprint de memoria reducido, con un tamano de repositorio de 5,6 GB.

El modelo resuelve tareas de comprension y generacion conjunta de imagen y texto en un unico pipeline conversacional, orientado a entornos de inferencia locales sobre Mac con chip de la familia M. Su relevancia actual radica en que permite ejecutar un modelo multimodal de gran tamano en hardware de consumo profesional (M3 Ultra), algo que en formato sin cuantizar requeriria mucha mas memoria. La model card reporta velocidades de aproximadamente 28 tokens/s en M3 Ultra para 500 tokens de generacion.

No se dispone de informacion publica sobre arquitectura interna, numero de parametros, longitud de contexto ni datos de entrenamiento en la informacion proporcionada; la model card se limita a datos de cuantizacion y rendimiento en inferencia. La licencia tampoco esta declarada, lo que constituye una limitacion relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q9 (9 bits por peso, variante principal); la model card menciona Q3.5, Q4.5, Q5.5, Q6.5, Q8.5 y Q9 en su tabla comparativa, ademas de una edicion Q9s con streaming de engram para menor huella de memoria |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | MLX (libreria `mlx`), repo de 5,6 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `tencent/Hy4-flash`: la model card no describe si se trata de un transformer denso, un MoE, un modelo hibrido o una arquitectura con atencion lineal. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La unica innovacion tecnica documentada en esta variante es el proceso de cuantizacion: los pesos se han cuantizado con una version modificada de MLX a 9 bits por peso, con el objetivo declarado de preservar la precision de forma casi sin perdida. La model card incluye una tabla de calidad de cuantizacion con perplexity, token accuracy y missed divergence para distintos niveles (Q3.5 a Q9), lo que permite comparar el impacto de la compresion. Ademas, se menciona una edicion Q9s con "engram streaming" que reduce la memoria necesaria a aproximadamente 163 GiB frente a los 281 GiB de la variante Q9 estandar, y la disponibilidad futura de pesos MTP (multi-token prediction) para acelerar la decodificacion.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`): el modelo acepta imagenes como entrada junto con instrucciones textuales.
- Generacion de codigo: la model card incluye una prueba especifica de generacion de codigo de 500 tokens en el contexto de MTP.
- Generacion de texto creativo o redaccion: se menciona una prueba de "Writing" de 500 tokens.
- Capacidades multimodales de descripcion y comprension de imagenes, derivadas del pipeline declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los tags del repositorio.
- Modo thinking, vision, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional local en Mac: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose integramente en un M3 Ultra, sin depender de servicios en la nube, gracias al formato MLX y a la cuantizacion Q9.
- Descripcion y analisis de imagenes en flujos de trabajo de escritorio: al ser un modelo image-text-to-text, permite incorporar capturas o fotografias a una conversacion y obtener respuestas textuales, util para herramientas de accesibilidad o documentacion tecnica.
- Generacion de codigo en entornos de desarrollo sobre Apple Silicon: la model card incluye pruebas de generacion de codigo, lo que lo hace adecuado para asistentes de programacion integrados en el IDE que se ejecuten en local.
- Redaccion y edicion de textos en ingles: la variante Q9 mantiene una token accuracy del 97,80% respecto al modelo base, lo que la hace apropiada para tareas de redaccion donde la fidelidad al modelo original es critica.
- Prototipado e investigacion en inferencia multimodal local: util para investigadores que necesiten evaluar el comportamiento de un modelo multimodal de gran tamano en hardware de consumo profesional sin acceso a clusters con GPUs.
- Evaluacion comparativa de tecnicas de cuantizacion: la tabla de perplexity y token accuracy por nivel de cuantizacion convierte este repositorio en un banco de pruebas para estudiar el impacto de la compresion en modelos multimodales.
- Despliegue en estaciones de trabajo con memoria unificada: los 281 GiB reportados para Q9 encajan en configuraciones de M3 Ultra de gama alta, permitiendo servir el modelo en local para equipos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona metricas de calidad de cuantizacion y de velocidad de inferencia.

| Metrica de cuantizacion | Q3.5 | Q4.5 | Q5.5 | Q6.5 | Q8.5 | Q9 | Base |
|---|---|---|---|---|---|---|---|
| Perplexity | 168.0 | 1.33593 | 1.23437 | 1.21875 | 1.21875 | 1.20312 | 1.20312 |
| Token accuracy | 43,45% | 91,65% | 95,05% | 96,65% | 97,65% | 97,80% | 100% |
| Missed divergence | 72,57% | 17,28% | 17,28% | 12,03% | 9,92% | 9,60% | 0,000% |

| Configuracion de inferencia | Velocidad | Memoria |
|---|---|---|
| M3 Ultra, 500 tokens | ~28 tokens/s | ~281 GiB |
| M3 Ultra con engram streaming (Q9s) | ~25 tokens/s | ~163 GiB |
| M3 Ultra con MTP (codigo) | no disponible | no disponible |
| M3 Ultra con MTP (redaccion) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: la variante Q9 requiere aproximadamente 281 GiB de memoria en M3 Ultra; la edicion Q9s con engram streaming reduce la huella a unos 163 GiB.
- GPU recomendadas: Apple Silicon M3 Ultra es la unica plataforma validada en la model card (probado con Inferencer v2.5.4). No hay datos de rendimiento para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: no en el sentido habitual; los 281 GiB de Q9 exceden la VRAM de cualquier GPU de consumo (RTX 4090 con 24 GB, por ejemplo). Solo es viable en configuraciones de memoria unificada de gama alta como M3 Ultra o en sistemas multi-GPU con suficiente VRAM agregada.
- Opciones de despliegue: el repositorio esta en formato MLX y se ha probado con la aplicacion Inferencer v2.5.4. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: aproximadamente 28 tokens/s en M3 Ultra para Q9 y 25 tokens/s para Q9s con engram streaming, medidos sobre 500 tokens de generacion. No se proporcionan datos de latencia de primer token.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos alternativos: la model card no identifica modelos comparables ni ofrece benchmarks estandar. Como referencia estructural, se puede contrastar con otras variantes del mismo modelo base y con el modelo original:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inferencerlabs/Hy4-flash-MLX-Q9 | no disponible | no disponible | MLX Q9 | no disponible | Hugging Face |
| inferencerlabs/Hy4-flash-MLX-Q9s | no disponible | no disponible | MLX Q9s | no disponible | Hugging Face (mencionado) |
| tencent/Hy4-flash (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Comparativa con modelos de otros autores: no disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso, lo que impide confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base `tencent/Hy4-flash` antes de cualquier despliegue en produccion.
- Idioma limitado al ingles segun los tags del repositorio; no hay evidencia de soporte multilingue.
- Riesgo de alucinacion: inherente a los modelos generativos; la model card no documenta evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no esta disponible, por lo que no puede planificarse su uso en tareas que requieran ventanas largas sin verificacion previa.
- Dependencia de hardware Apple Silicon: el formato MLX limita el despliegue a plataformas Apple; no hay soporte documentado para CUDA u otras aceleraciones.
- Requisitos de memoria muy elevados: 281 GiB para Q9 y 163 GiB para Q9s excluyen su uso en la mayoria de equipos, incluidos MacBook Pro y Mac Studio de gama media.
- La cuantizacion Q9 no es perfectamente lossless: la token accuracy es del 97,80% frente al 100% del modelo base, con un 9,60% de missed divergence.
- El autor del repositorio declara explicitamente no ser el creador del modelo original y no asumir responsabilidad por danos derivados de su uso.
- No se han publicado resultados de benchmarks estandar, lo que dificulta comparar su calidad con alternativas.

## Enlaces

- Repositorio Hugging Face de la variante cuantizada: https://huggingface.co/inferencerlabs/Hy4-flash-MLX-Q9
- Modelo base en Hugging Face: https://huggingface.co/tencent/Hy4-flash
- Videos de demostracion: https://youtube.com/xcreate
- Herramienta de inferencia Inferencer: https://inferencer.com
- Repositorio MLX: https://github.com/ml-explore/mlx
