# NGARiAI/ngari-ft-sft

## Resumen

NGARi ngari-ft-sft es un repositorio publicado por NGARiAI que contiene tres adaptadores LoRA de ajuste supervisado (SFT) entrenados sobre el mismo modelo base, Qwen/Qwen2.5-1.5B-Instruct. Cada adaptador corresponde a una iteracion distinta, distribuida bajo las etiquetas `ngari-ft-sft:v1`, `:v2` y `:v3`, y se publica en formato GGUF con un tamano aproximado de 0,04 GB (unos 37 MB) por fichero. No se trata de un modelo completo, sino de capas de adaptacion que requieren descargar por separado el modelo base al que se aplican.

El autor presenta estos checkpoints como los experimentos de SFT previos a una fase de destilacion, con el objetivo declarado de documentar el linaje del proyecto desde su punto de partida real y no desde la narrativa de la destilacion. La model card es explicita: no existe registro de evaluacion para ninguna de las tres versiones y no se trasladan cifras de otras variantes del proyecto. El propio autor advierte que no es un modelo conversacional ni un modelo con soporte de herramientas.

La relevancia de esta ficha es acotada y conviene subrayarla: se trata de un artefacto de investigacion y trazabilidad, no de un modelo listo para produccion. Su interes esta en la transparencia metodologica (publicacion de datos, receta de entrenamiento y hashes de verificacion) y en servir como punto de partida reproducible para quien quiera estudiar el ajuste fino de Qwen2.5-1.5B-Instruct en entornos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct); el repositorio contiene unicamente los adaptadores, no los pesos completos |
| Parametros totales | No disponible para los adaptadores (el campo de parametros del repo, 18.464.768, no corresponde al modelo base declarado de 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible; los ficheros se distribuyen en formato GGUF de adaptador (0,04 GB cada uno) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`sft-v1-adapter.gguf`, `sft-v2-adapter.gguf`, `sft-v3-adapter.gguf`) |

## Arquitectura y entrenamiento

Los tres ficheros son capas LoRA de aproximadamente 37 MB cada una, aplicadas sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros con licencia Apache-2.0. El autor indica que el modelo base se mantiene sin modificar salvo por el adaptador o el ajuste fino descrito, y que el entrenamiento es de tipo supervisado (SFT). No se especifica en la informacion disponible el rango de las matrices LoRA, la tasa de aprendizaje, el numero de pasos, el volumen de tokens de entrenamiento ni si hubo fases posteriores de RLHF o DPO.

La model card declara que los datos de entrenamiento se publican en el repositorio `NGARiAI/ngari-datasets` y que la receta completa esta disponible en la carpeta `training/` del mismo repositorio. Se incluyen prefijos de hash SHA-256 para cada fichero, lo que permite verificar la integridad de las descargas. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos) mas alla del propio procedimiento de ajuste.

## Capacidades

- Generacion de texto en ingles como capacidad heredada del modelo base Qwen2.5-1.5B-Instruct.
- Ajuste supervisado orientado a tareas concretas, sin que la model card especifique cuales.
- No se declara soporte de tool calling ni de function calling; el autor indica explicitamente que no es un modelo de herramientas.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue: el unico idioma listado es el ingles.
- No se declara modo de pensamiento (thinking), vision ni audio.
- No existe registro de evaluacion que permita atribuir capacidades medidas a ninguna de las tres versiones.

## Casos de uso

- Investigacion sobre ajuste fino con LoRA: los tres adaptadores permiten reproducir y comparar tres iteraciones de SFT sobre el mismo modelo base, con la receta y los datos publicados en `NGARiAI/ngari-datasets` y en `training/`.
- Auditoria de linaje de modelos: los prefijos SHA-256 y la separacion explicita entre versiones permiten verificar que artefacto se uso en cada experimento y reconstruir la cadena hasta el modelo base.
- Docencia y formacion: el tamano reducido de los adaptadores (37 MB) y del modelo base facilita montar practicas de ajuste fino en equipos sin GPU de datacenter.
- Despliegue en borde como experimento: al apoyarse en un modelo de 1.500 millones de parametros, el conjunto es candidato a pruebas en hardware de consumo mediante llama.cpp u Ollama, siempre que se obtenga el modelo base por separado.
- Base para una fase de destilacion: el autor presenta estos checkpoints como el punto de partida previo a la destilacion, por lo que sirven como referencia para comparar el antes y el despues del proceso.
- Evaluacion comparativa de metodos de publicacion: el repositorio ejemplifica una practica de publicacion que incluye fallos y ausencia de metricas, util como caso de estudio sobre transparencia en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explicita que no existe registro de evaluacion para ninguna de las tres versiones y que no se toman prestadas cifras de otras variantes del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen2.5-1.5B-Instruct y de la cuantizacion elegida, no de los adaptadores.
- GPU recomendadas: no disponible. El tamano del modelo base (1.500 millones de parametros) sugiere que puede ejecutarse en GPU de consumo, pero no se aportan mediciones.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el repositorio se etiqueta con `ollama` y `gguf`, lo que apunta a llama.cpp y Ollama como vias previstas; no se documentan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NGARi ngari-ft-sft | Adaptadores LoRA sobre base de 1.500 M | No disponible | Sin evaluacion publicada | Apache-2.0 | Hugging Face (GGUF) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | No disponible en esta ficha | No disponible en esta ficha | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para establecer una comparativa de rendimiento con modelos alternativos. La unica comparacion documentada es la dependencia directa respecto a Qwen2.5-1.5B-Instruct, del que estos adaptadores heredan arquitectura y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: ninguna de las tres versiones tiene registro de metricas, por lo que no puede afirmarse ningun nivel de calidad.
- No es un modelo autonomo: requiere descargar el modelo base Qwen2.5-1.5B-Instruct por separado; los ficheros del repositorio son solo adaptadores.
- No es un modelo conversacional ni de herramientas, segun la propia model card.
- Idioma limitado al ingles; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado para estos adaptadores.
- Sesgos: no documentados en la informacion disponible.
- Inconsistencia en los metadatos: el campo de parametros del repositorio (18.464.768) no concuerda con el modelo base declarado de 1.500 millones, lo que conviene verificar antes de cualquier uso.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen2.5-1.5B-Instruct conviene revisar tambien las condiciones del modelo base.
- Fechas de publicacion en el futuro respecto a la fecha habitual de consulta (creado el 28 de noviembre de 2026), lo que sugiere que los metadatos deben tratarse con cautela.
- Sin descargas ni interacciones registradas en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-ft-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Coleccion Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Programa y reglas: https://ngari.ai/open-source-friday
