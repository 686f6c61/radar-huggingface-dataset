# jancirnodziewiaty/Wicked-Stuff-12B-oQ4e

## Resumen

Wicked-Stuff-12B-oQ4e es una cuantizacion mixta en formato MLX del modelo ReadyArt/Wicked-Stuff-12B, un transformer de aproximadamente 12.000 millones de parametros (11.959.730.224 exactos segun los safetensors). La ha publicado el usuario jancirnodziewiaty mediante la herramienta oQ de oMLX v0.7.3, que aplica precision mixta por tensor en lugar de una cuantizacion uniforme. El resultado es un checkpoint de 6,73 GiB con un promedio efectivo de 4,834 bits por peso, lo que permite ejecutar un modelo de 12B en equipos Apple Silicon con memoria unificada moderada.

El interes practico del modelo esta en el esquema de cuantizacion: el 72% de los pesos se guarda a 4 bits, el 25,6% a 5 bits y un 2,1% a 6 bits, reservando las precisiones mas altas para las capas presumiblemente mas sensibles. Frente a una cuantizacion 4-bit uniforme, este reparto busca reducir la perdida de calidad sin disparar el tamano del fichero. El modelo incluye ademas un pequeno modulo de vision de 35 millones de parametros, lo que sugiere capacidades multimodales heredadas del modelo base.

La ficha tiene limitaciones importantes de informacion: el autor no documenta licencia, idiomas, pipeline ni datos de entrenamiento, y no se han publicado benchmarks. Todo lo que sigue se basa en los metadatos de HuggingFace y en la model card del repositorio; cualquier dato ausente se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `gemma4_unified` en los tags; detalles no disponibles) |
| Parametros totales | 11.959.730.224 (11,96B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine con grupos de 64: 4-bit (71,95% de pesos), 5-bit (25,63%), 6-bit (2,10%), 8-bit (0,016%) y BF16 (0,30%); media efectiva 4,834 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`), repo de 7,3 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ReadyArt/Wicked-Stuff-12B ni sobre su proceso de entrenamiento: no hay datos publicados sobre numero de tokens, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas del modelo original. El tag `gemma4_unified` sugiere una arquitectura de la familia Gemma, pero no se confirma en la informacion disponible.

Lo que si esta documentado es el proceso de cuantizacion. Se aplico oQ (oMLX v0.7.3), una cuantizacion de precision mixta que asigna distintos anchos de bit por tensor con cuantizacion affine y tamano de grupo 64. El desglose es: 8,605B parametros a 4 bits (4,50 bits/peso efectivos, 4,508 GiB), 3,065B a 5 bits (5,50 bits/peso, 1,963 GiB), 0,252B a 6 bits (6,50 bits/peso, 0,190 GiB), 0,002B a 8 bits y 0,036B en BF16 sin cuantizar. El checkpoint se re-cuantizo el 2026-11-02, por lo que las copias anteriores deben descargarse de nuevo.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base, no documentadas en detalle.
- Vision: el checkpoint incluye un modulo de vision de 0,035B parametros (0,066 GiB), lo que indica soporte de entrada de imagenes, aunque no se detalla su alcance.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 6,73 GiB cabe en Macs con 16 GB de memoria unificada, lo que permite ejecutar un modelo de 12B en local sin GPU dedicada; es el caso de uso principal de este artefacto.
- Prototipado rapido en portatiles Mac: al cargarse con la libreria `mlx`, sirve para validar prompts y flujos antes de pasar a un despliegue mayor, con tiempos de carga reducidos gracias al tamano del fichero.
- Evaluacion de la cuantizacion oQ: util para comparar la calidad de la precision mixta (4/5/6 bits) frente al modelo base en BF16 en tareas concretas del equipo.
- Experimentacion multimodal ligera: el modulo de vision permite probar tareas de descripcion de imagenes o preguntas sobre documentos escaneados en hardware de consumo, siempre que se valide la calidad empiricamente.
- Generacion de texto creativo y asistentes personales offline: el nombre del modelo base sugiere un ajuste orientado a contenido creativo o sin filtros, adecuado para entornos privados donde no se quiere enviar datos a la nube.
- Base para fine-tuning con LoRA en MLX: al ser un checkpoint cuantizado, conviene partir del modelo base en BF16 para el entrenamiento y usar esta version solo para inferencia; sirve como referencia de destino tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 6,73 GiB de pesos mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB de memoria unificada para contextos moderados.
- GPU recomendadas: Apple Silicon exclusivamente, ya que el formato es MLX (M1, M2, M3, M4 en sus variantes Pro, Max y Ultra). No es compatible con CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en cualquier Mac con 16 GB o mas de memoria unificada; en modelos de 8 GB puede quedar muy justo o no caber segun la longitud de contexto.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (oMLX) son las vias naturales; no hay GGUF publicado, por lo que llama.cpp y Ollama requeririan conversion propia. vLLM y TGI no soportan MLX.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Wicked-Stuff-12B-oQ4e | 11,96B | no disponible | MLX safetensors, 4,834 bits/peso | no disponible | Solo Apple Silicon; cuantizacion mixta |
| ReadyArt/Wicked-Stuff-12B (base) | ~12B | no disponible | safetensors BF16 | no disponible | Referencia de calidad sin cuantizar |
| Cuantizacion 4-bit uniforme del mismo base | ~12B | no disponible | MLX o GGUF | no disponible | Menor tamano, mayor perdida potencial de calidad |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 4,834 bits/peso introduce perdida de calidad respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial; hay que consultar la licencia del modelo base ReadyArt/Wicked-Stuff-12B antes de cualquier despliegue en produccion.
- El nombre del modelo base ("Wicked-Stuff") sugiere un ajuste sin filtros de seguridad; el riesgo de contenido inapropiado o de alucinacion no mitigada es alto y requiere evaluacion propia.
- Solo funciona en el ecosistema MLX (Apple Silicon); no hay pesos GGUF ni safetensors compatibles con transformers/CUDA en este repositorio.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido y debe validarse empiricamente.
- El modulo de vision es muy pequeno (0,035B) y su calidad no esta documentada; no conviene asumir capacidades multimodales robustas.
- El repositorio tiene muy poca traccion (49 descargas, 0 likes) y un unico mantenedor; no hay garantia de soporte ni de actualizaciones.
- El checkpoint se re-cuantizo el 2026-11-02; versiones anteriores pueden tener pesos distintos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jancirnodziewiaty/Wicked-Stuff-12B-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-12B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
