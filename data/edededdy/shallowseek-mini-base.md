# edededdy/ShallowSeek-mini-base

## Resumen

ShallowSeek-mini-base es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) entrenado desde cero por el usuario edededdy, presentado como un artefacto educativo y de investigacion. Reproduce a escala reducida las ideas arquitectonicas de DeepSeek-V3: atencion Multi-head Latent Attention (MLA), enrutado DeepSeekMoE con expertos finos y prediccion multi-token (MTP). Tiene 11,0 M de parametros totales segun la model card (12.103.824 segun los pesos safetensors, incluyendo el modulo MTP), de los que 6,3 M se activan por token.

El modelo se preentreno sobre una unica pasada de 286 M tokens de FineWeb-Edu (`sample/10BT`, 236.544 documentos), lo que supone aproximadamente 26 tokens por parametro. El hecho diferencial es el hardware: todo el entrenamiento se hizo en CPU, en un Intel Core i9-9880H de ocho nucleos (MacBook Pro de 2019), a unos 1,9 K tokens/s durante aproximadamente dos dias. El repositorio ocupa 0,1 GB y la licencia es Apache-2.0.

Es relevante ahora como referencia reproducible para estudiar eficiencia de enrutado MoE y compresion de cache KV con MLA en un presupuesto de computo trivial, y como banco de pruebas de pipelines de entrenamiento e inferencia. No es un modelo de utilidad practica: es un modelo base sin ajuste por instrucciones, con 1.024 tokens de contexto y conocimiento factual practicamente nulo, segun admite el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (DeepSeekMoE) y Multi-head Latent Attention (MLA) |
| Parametros totales | 11,0 M (model card); 12.103.824 (~12,1 M) segun safetensors, incluido el modulo MTP de 1,14 M |
| Parametros activos | 6,3 M por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | safetensors en fp32; build GGUF disponible (niveles concretos no especificados por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

Detalles adicionales de configuracion: 8 capas y tamano oculto 192; la capa 0 tiene un FFN denso de 512 y las capas 1 a 7 son MoE; tokenizador BPE byte-level de 8.192 tokens entrenado sobre la misma porcion de FineWeb-Edu (~3,9 bytes por token).

## Arquitectura y entrenamiento

La atencion usa MLA con 6 cabezas, latente KV de 48 dimensiones, dim RoPE desacoplada de 16 y dimensiones de cabeza 24+16 (q/k) y 24 (v). La cache KV almacena solo el latente de 48 dimensiones mas una clave RoPE de 16 dimensiones por token, lo que reduce de forma notable su huella frente a atencion multi-cabeza convencional. El bloque MoE emplea 12 expertos enrutados finos con SwiGLU y 128 de capa oculta, top-3, mas un experto compartido, con puerta sigmoide y enrutado limitado por grupos (3 grupos, top-2).

El balanceo de carga combina el esquema auxiliar-loss-free con sesgo ajustable (velocidad de actualizacion 0,001) y una pequena perdida auxiliar por secuencia (alfa = 0,0001). Segun el autor, la carga de expertos se mantuvo en torno a 1,14x la media (1,28x en la capa mas cargada) durante la mayor parte del entrenamiento. Hay un unico modulo MTP (lambda = 0,3) usado solo en entrenamiento, presente en `model.safetensors` y excluido del build GGUF. El entrenamiento uso AdamW (beta 0,9 y 0,95), weight decay 0,1, clipping de gradiente 1,0, learning rate pico de 1,5e-3 con 700 pasos de calentamiento y decaimiento coseno hasta 1,5e-4, en precision fp32, con 34.960 pasos de 8.192 tokens (batch 8 x 1.024). No se aplico ajuste por instrucciones, RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles: continuacion de texto coherente y gramaticalmente fluida, propia de un modelo base preentrenado.
- Sin ajuste por instrucciones: no sigue ordenes ni formatos conversacionales; solo completa texto.
- Razonamiento y matematicas: muy limitados. En las pruebas internas de suma (2+2, 3+5, 7+6) la respuesta correcta queda en los rangos 4, 19 y 30 respectivamente.
- Conocimiento factual: practicamente nulo. 0% de aciertos en top-1 y 29% en top-5 en las 14 pruebas de completar huecos del autor, con log-probabilidad media de la respuesta correcta de -5,68.
- Discriminacion verdadero/falso: 7 de 12 pares acertados (58%).
- Multilingue: no. Solo ingles.
- Tool calling / function calling: no disponible; no hay plantilla de chat ni soporte de herramientas.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: prediccion multi-token (MTP) solo durante entrenamiento; no se usa en inferencia. Sin vision ni audio.
- Eficiencia de cache KV: la MLA reduce la cache a 48+16 dimensiones por token y capa.

## Casos de uso

- Investigacion sobre enrutado MoE: sirve para estudiar el comportamiento de expertos finos, el enrutado limitado por grupos y el balanceo auxiliar-loss-free en un modelo que se entrena en horas, no semanas.
- Ablaciones de MLA: permite medir el efecto de la cache KV latente sobre memoria y latencia sin necesidad de GPUs, ya que el modelo completo cabe en cualquier equipo.
- Docencia de arquitecturas tipo DeepSeek-V3: es un caso de estudio reproducible en el aula para explicar MLA, MoE y MTP con un coste de computo de dos dias de CPU.
- Pruebas de humo (smoke tests) de pipelines: util para validar extremo a extremo cadenas de tokenizacion, carga de safetensors, conversion a GGUF y despliegue en servidores de inferencia antes de pasar a modelos grandes.
- Generacion de texto sintetico para pruebas de software: produce texto en ingles gramatical y tematico que sirve como relleno realista en tests de interfaces, bases de datos o sistemas de busqueda, sin coste de API.
- Experimentos de entrenamiento desde cero en hardware modesto: referencia para reproducir recetas de preentrenamiento en CPU o en equipos de gama baja.
- Demostraciones de inferencia en el borde: su tamano permite ejecutarlo en Raspberry Pi, moviles o navegador para prototipos de despliegue local.
- Analisis de tokenizadores BPE byte-level: el tokenizador de 8.192 entradas entrenado sobre FineWeb-Edu es un objeto de estudio util para comparar tasas de compresion de bytes por token.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Valor |
|---|---|
| Perdida de validacion (nats/token) | 3,667 |
| Perplejidad | 39,1 |
| Bits por byte | 1,354 |
| MMLU (formato letter) | 24,9% (14.037 preguntas; azar = 25%) |
| MMLU (formato cloze) | 25,5% (14.037 preguntas) |
| Pruebas factuales, acierto top-1 | 0% |
| Pruebas factuales, acierto top-5 | 29% |
| Pares verdadero/falso ganados | 7/12 (58%) |

Desglose de MMLU por categoria (formato letter / cloze): STEM 26,8% / 24,0%; Humanidades 23,8% / 25,3%; Ciencias Sociales 23,9% / 26,1%; Otros 25,5% / 26,7%. El autor destaca que el grupo de biologia y medicina en formato cloze alcanza 27,8% sobre 2.094 preguntas, unos 2,8 puntos por encima del azar (aproximadamente 3,0 errores estandar), con 9 de 10 materias en o por encima del azar. Las materias con carga matematica quedan por debajo del azar porque el formato cloze no puede adivinar respuestas numericas.

Evolucion de la perdida de validacion: 5,12 (paso 1.000), 4,28 (5.000), 4,06 (10.000), 3,97 (15.000), 3,87 (20.000), 3,78 (25.000), 3,70 (30.000), 3,67 (35.000).

No se han publicado resultados de benchmarks comparativos con otros modelos (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 48 MB; en fp16 unos 24 MB; en int8 unos 12 MB; en GGUF Q4 en torno a 6-7 MB. La cache KV es despreciable (latente de 48 + 16 dimensiones por token y capa, con 1.024 tokens de contexto).
- GPU recomendadas: cualquier GPU, incluida una integrada; no requiere A100, H100 ni RTX 4090. Corre sobradamente en GTX 1050, RTX 3060 o inferiores.
- Cabe en GPU de consumo: si, en todas, y tambien en CPU, Raspberry Pi o dispositivos moviles.
- Opciones de despliegue: `transformers` con safetensors, llama.cpp / Ollama mediante el build GGUF, y servidores compatibles con la API de OpenAI a traves del tag `endpoints_compatible`. vLLM y TGI son tecnicamente posibles, pero su sobrecarga es desproporcionada para 12 M de parametros.
- Latencia y throughput: no publicados para inferencia. El unico dato de rendimiento disponible es el del entrenamiento: aproximadamente 1,9 K tokens/s en un Intel Core i9-9880H de ocho nucleos, solo CPU.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos comparables publicados con la misma combinacion de escala (11-12 M de parametros), arquitectura MoE con MLA y entrenamiento desde cero en CPU. La comparacion mas cercana conceptual es la propia arquitectura DeepSeek-V3, de la que este modelo toma las ideas pero con varios ordenes de magnitud menos de parametros, datos y contexto, por lo que no procede una comparacion numerica directa.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes, no mantiene conversaciones y no respeta formatos. Solo continua texto.
- Conocimiento factual practicamente nulo: 0% de acierto en top-1 en las pruebas del autor. Inventa hechos con seguridad (alucinacion sistematica), como el propio autor advierte.
- Contexto muy corto: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo ingles. No hay soporte multilingue ni de castellano.
- Sin tool calling, sin modo de razonamiento explicito y sin soporte de agentes.
- El modulo de prediccion multi-token (MTP) no esta incluido en el build GGUF, por lo que hay una diferencia de 1,14 M de parametros entre los pesos safetensors y la version GGUF.
- Rendimiento en MMLU practicamente indistinguible del azar (24,9%-25,5% frente a 25%), salvo la senal debil en biologia y medicina.
- No apto para produccion, decisiones automatizadas, atencion al cliente ni cualquier uso con consecuencias reales. El autor lo describe explicitamente como artefacto educativo.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero la ausencia de capacidades reales hace inviable su explotacion comercial mas alla de la investigacion o la docencia.
- Nombre y familia ("ShallowSeek") no tienen relacion con DeepSeek; el autor lo indica de forma explicita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edededdy/ShallowSeek-mini-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu

Nota sobre los resultados de busqueda: los enlaces encontrados (`https://doc.shallowseek.top/en/guide/using-models.html`, `https://github.com/daggerhashjack/ShallowSeek`, `https://ollama.com/` y la coleccion `https://huggingface.co/collections/multimodalart/base-models`) corresponden a proyectos distintos que comparten el nombre "ShallowSeek" (un cliente Android de Ollama y una plataforma con API compatible con OpenAI) y no estan relacionados con el modelo edededdy/ShallowSeek-mini-base, segun la informacion disponible.
