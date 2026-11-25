# cortex-ai-nova/Erebo-Mdi-MAX

## Resumen

Erebo-Mdi-MAX es un modelo de lenguaje publicado por el usuario cortex-ai-nova en Hugging Face, identificado por el propio autor como una copia "intencionadamente degradada" del modelo `YoSaNoo/Most-Dumb-Intelligence`, en un perfil que el autor denomina "Level 3 — degradacion fuerte". El nombre interno que aparece en la model card, "Most-Dumb-Intelligence-DESTROYED", y las etiquetas `degraded`, `experimental` y `joke` dejan claro que no se trata de un modelo pensado para uso productivo, sino de un artefacto de experimentacion o broma.

El repositorio contiene pesos en formato safetensors con arquitectura declarada `llama` y un total de 100.092.672 parametros (aproximadamente 100 M), lo que lo situa en la gama de modelos pequenos. El tamano del repositorio es de 0,4 GB. No se dispone de informacion sobre contexto, tokenizador, datos de entrenamiento ni proceso de degradacion mas alla de la referencia a un fichero `degradation_manifest.json` y a una semilla (`Seed=1234`) que el autor menciona pero no detalla en la informacion disponible.

Su relevancia es limitada y de caracter metodologico: puede servir para estudiar como se comporta un modelo cuando sus pesos se alteran deliberadamente, para probar pipelines de evaluacion de calidad o para experimentar con deteccion de degradacion. No es adecuado para tareas reales de generacion, razonamiento o codigo, y el propio autor advierte de que las respuestas son poco fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (segun tag del repositorio) |
| Parametros totales | 100.092.672 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible solo indica la etiqueta de arquitectura `llama` y el recuento de parametros (100.092.672). No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de tokenizador ni vocabulario. Tampoco se detalla si emplea atencion completa, atencion con ventana deslizante u otra variante.

Respecto al entrenamiento, no hay datos sobre el corpus, el numero de tokens, la composicion del dataset ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Lo unico documentado es el proceso de degradacion: el autor indica que se trata de una copia degradada de `YoSaNoo/Most-Dumb-Intelligence` con semilla 1234 y perfil "Level 3 — degradacion fuerte", y remite a un fichero `degradation_manifest.json` para los detalles. Ese manifiesto no se ha proporcionado en la informacion disponible, por lo que no se puede describir la naturaleza exacta de la degradacion (ruido en pesos, poda, corrupcion de capas, etc.).

## Capacidades

- Generacion de texto: tecnicamente el modelo puede producir secuencias, pero el autor advierte de que las respuestas son poco fiables debido a la degradacion intencionada.
- Razonamiento y matematicas: no disponible; no hay evidencia de que conserve estas capacidades tras la degradacion.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Uso como artefacto de experimentacion: util para estudiar degradacion de modelos y para validar pipelines de evaluacion de calidad.

## Casos de uso

- Investigacion sobre degradacion de modelos: comparar las salidas de este modelo con las del original `YoSaNoo/Most-Dumb-Intelligence` para caracterizar el efecto del perfil "Level 3" sobre la coherencia, la perplejidad y la calidad linguistica.
- Pruebas de pipelines de evaluacion: usar el modelo como caso negativo controlado para verificar que un harness de benchmarks detecta correctamente salidas de baja calidad y no las puntua como validas.
- Deteccion de modelos corruptos en produccion: emplear sus salidas como ejemplo de referencia para entrenar o calibrar clasificadores que identifiquen modelos degradados o mal desplegados.
- Docencia y divulgacion: ilustrar en charlas o clases que ocurre cuando se alteran los pesos de un transformer pequeno y como se degrada la generacion de texto.
- Pruebas de robustez de infraestructura: cargar un checkpoint de ~100 M de parametros en entornos de test para validar pipelines de despliegue (servidores de inferencia, conversion de formatos) sin consumir recursos significativos.
- Experimentos de seguridad y alineamiento: estudiar como responde un modelo degradado ante prompts adversarios y si la degradacion aumenta la probabilidad de salidas incoherentes o no deseadas.
- Pruebas de carga ligera: usar el modelo como carga de trabajo de bajo coste en pruebas de throughput y latencia de frameworks de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100.092.672 parametros, en precision completa (fp32) se necesitan aproximadamente 0,4 GB solo para los pesos; en fp16/bf16, unos 0,2 GB; en cuantizacion de 8 bits, unos 0,1 GB, y en 4 bits, alrededor de 0,05 GB. A esto hay que sumar el coste del contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad de memoria; el modelo cabe holgadamente en tarjetas con 4 GB o mas, como una GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer de los ultimos anos, e incluso en sistemas integrados.
- Opciones de despliegue: al ser un checkpoint en safetensors con arquitectura tipo llama, puede cargarse con transformers; para inferencia optimizada, vLLM o TGI si el tokenizador y la configuracion son compatibles (no confirmado en la informacion disponible). La conversion a GGUF para llama.cpp u Ollama no esta documentada.
- Latencia y throughput estimados: no disponible. Al tratarse de un modelo de ~100 M de parametros, la latencia por token seria baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Erebo-Mdi-MAX | 100.092.672 | no disponible | no disponible (degradado intencionadamente) | no disponible | Hugging Face (cortex-ai-nova/Erebo-Mdi-MAX) |
| YoSaNoo/Most-Dumb-Intelligence | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo de origen) |
| Modelos tipo Llama de ~100-150 M | ~100-150 M | variable | variable | variable | multiples en Hugging Face |

La comparacion con alternativas de la misma categoria no puede hacerse con rigor porque no hay datos de rendimiento ni de contexto del modelo analizado. El unico comparable directo identificable es el modelo de origen del que deriva, `YoSaNoo/Most-Dumb-Intelligence`, del que no se dispone de especificaciones en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion intencionada: el autor declara explicitamente que el modelo esta degradado ("Level 3 — degradacion fuerte") y que las respuestas son poco fiables. No debe usarse en produccion ni en aplicaciones orientadas a usuarios.
- Riesgo elevado de alucinacion e incoherencia: al ser una copia alterada, la probabilidad de salidas sin sentido o factualmente incorrectas es alta, aunque no se han publicado mediciones.
- Sesgos conocidos: no disponible; no hay informacion sobre el corpus original ni sobre los sesgos que pueda arrastrar.
- Limitaciones de contexto e idioma: no disponible; no se declara ventana de contexto ni idiomas soportados. La model card esta redactada en ruso, pero eso no implica que el modelo este entrenado en ese idioma.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si se permite uso comercial. Ante la ausencia de licencia explicita, debe asumirse que no hay autorizacion clara para uso comercial.
- Ausencia de documentacion: no se ha proporcionado el `degradation_manifest.json` ni la configuracion del modelo, lo que impide reproducir el proceso de degradacion o auditar el checkpoint.
- Sin soporte de la comunidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa ni reportes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortex-ai-nova/Erebo-Mdi-MAX
- Modelo de origen referenciado en la model card: https://huggingface.co/YoSaNoo/Most-Dumb-Intelligence
- Fichero de manifiesto de degradacion: `degradation_manifest.json` (referenciado en la model card, no incluido en la informacion disponible)
