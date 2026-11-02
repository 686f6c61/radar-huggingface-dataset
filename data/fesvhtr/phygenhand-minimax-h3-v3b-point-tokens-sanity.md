# fesvhtr/phygenhand-minimax-h3-v3b-point-tokens-sanity

## Resumen

`phygenhand-minimax-h3-v3b-point-tokens-sanity` es un adaptador experimental publicado por el usuario `fesvhtr` sobre el modelo de generacion de video `MiniMaxAI/MiniMax-H3`, en su variante Ref2VA. No se trata de un modelo completo, sino de un conjunto de pesos adicionales (un `PointTokenAdapter` de 189,7 millones de parametros) que se acopla al modelo base para inyectar informacion de estado de puntos, presumiblemente orientada a la manipulacion de manos y objetos en la generacion de video.

El propio autor lo etiqueta explicitamente como una *sanity run*, es decir, una ejecucion de comprobacion tecnica y no un modelo utilizable. Se entreno durante solo 50 pasos sobre 6 condiciones en 4 GPU H200 mediante DiffusionNFT, y las compuertas internas del adaptador siguen practicamente a cero (media de 5,6e-3), sin mejora medible y con desajustes entre los prompts de caja y varilla y sus fotos de primer fotograma. La relevancia de esta ficha es, por tanto, documental: sirve para entender el diseno del adaptador y el pipeline de entrenamiento del proyecto `phygenhand`, no para su uso en produccion.

El repositorio ocupa 0,8 GB y contiene unicamente el state dict del adaptador y el fichero de configuracion de entrenamiento. No se declara licencia ni idiomas soportados, y no hay descargas ni interacciones registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer de difusion para video (MiniMax-H3 Ref2VA); `PointTokenAdapter` con encoder, compuertas por bloque y LoRA de filas de tokens |
| Parametros totales | 189,7 M (solo el adaptador; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`step-50-adapter.safetensors`) + JSON de configuracion |

## Arquitectura y entrenamiento

El adaptador se compone de tres piezas segun la model card: un encoder de tokens de estado de puntos, compuertas (gates) por bloque del transformer subyacente y un LoRA aplicado sobre filas de tokens. Esta estructura sugiere una inyeccion de senal condicional en la red de difusion de MiniMax-H3, modulada bloque a bloque mediante compuertas aprendidas que, en teoria, permitirian al modelo base ignorar o incorporar la informacion de puntos segun convenga. El adaptador se entrena sobre la variante Ref2VA del modelo base, orientada a generacion de video condicionada por imagen de referencia.

El entrenamiento se realizo con DiffusionNFT, un metodo de ajuste para modelos de difusion, durante 50 pasos sobre 6 condiciones y con 4 GPU H200. El resultado es un ajuste practicamente nulo: las compuertas tienen una media de 5,6e-3, lo que indica que la red apenas ha aprendido a abrir el paso de la informacion de puntos, y no se observa mejora medible. Ademas, los prompts de caja y varilla empleados en esta ejecucion no coinciden con sus fotos de primer fotograma, lo que invalida la evaluacion cualitativa del adaptador. No se documentan volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generacion de video condicionada por imagen (image-to-video) a traves del modelo base MiniMax-H3 Ref2VA, no de forma autonoma.
- Inyeccion de senal de estado de puntos mediante el adaptador, pensada para el control de manos y objetos en la escena.
- No se ha demostrado ninguna capacidad funcional adicional: el autor indica que no hay mejora medible en esta ejecucion.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso y capacidades multilingues: no disponible (no es un modelo de lenguaje).
- Modo de pensamiento, vision o audio: no disponible.

## Casos de uso

- Documentacion de arquitectura de adaptadores: el state dict y el `training_config.json` sirven como referencia para reproducir el diseno del `PointTokenAdapter` (encoder, compuertas por bloque, LoRA de filas) en otros proyectos de investigacion.
- Reproduccion de experimentos: el repositorio permite verificar la configuracion exacta (sha256 incluido) del entrenamiento de 50 pasos con DiffusionNFT sobre 4 GPU H200.
- Base para un reentrenamiento a mayor escala: el adaptador puede servir como punto de partida para una ejecucion con mas pasos y datos corregidos, siempre que se respete la licencia del modelo base.
- Analisis de compuertas: los pesos permiten estudiar por que las compuertas permanecen cerca de cero y que hiperparametros o datos habria que ajustar.
- Docencia y divulgacion: ejemplo real de una *sanity run* fallida, util para explicar la diferencia entre un experimento de validacion y un modelo publicable.
- No es adecuado para generacion de video en produccion, demos publicas ni evaluacion de calidad, dado que el propio autor lo desaconseja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta el valor medio de las compuertas (5,6e-3) tras 50 pasos y la ausencia de mejora medible.

## Requisitos de hardware

- VRAM estimada para el adaptador: no disponible; el adaptador pesa 189,7 M de parametros, pero requiere cargar el modelo base MiniMax-H3 completo, cuyo tamano no se especifica en la informacion proporcionada.
- GPU empleadas en el entrenamiento: 4x H200.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible, dependera del modelo base.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores comparables sobre MiniMax-H3 ni alternativas de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El autor declara explicitamente que es una *sanity run* y no un modelo utilizable.
- Las compuertas siguen cerca de cero (media 5,6e-3): el adaptador no aporta senal apreciable.
- No hay mejora medible tras 50 pasos de entrenamiento.
- Los prompts de caja y varilla no coinciden con sus fotos de primer fotograma, lo que invalida la evaluacion cualitativa.
- Licencia no declarada: no se puede asumir uso comercial; ademas, los terminos del modelo base MiniMax-H3 condicionan cualquier uso derivado.
- No se declaran idiomas soportados ni sesgos conocidos; al no ser un modelo de lenguaje, el riesgo de alucinacion textual no aplica, pero si el de generar video incoherente con la condicion de entrada.
- El repositorio solo contiene el adaptador, no el modelo base; sin este ultimo los pesos son inutilizables.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/fesvhtr/phygenhand-minimax-h3-v3b-point-tokens-sanity
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de codigo: https://github.com/Nicous20/phygenhand
- Rutas de entrenamiento citadas: `scripts/v3/train/`
- Documento de analisis citado: `docs/v3b_sanity_1521512.md`
