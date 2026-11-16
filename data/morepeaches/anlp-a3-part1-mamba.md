# morepeaches/anlp-a3-part1-mamba

## Resumen

`morepeaches/anlp-a3-part1-mamba` es un checkpoint educativo de un modelo Mamba entrenado desde cero para una tarea de descifrado de texto a nivel de carácter (character-level decipherment), desarrollado por el usuario morepeaches como parte de la Parte A de la tercera tarea de un curso de Procesamiento de Lenguaje Natural Avanzado. El modelo lee texto cifrado en bruto y genera caracteres de texto plano de forma causal, reutilizando sus propias predicciones previas durante la inferencia. No es un modelo de propósito general ni un asistente conversacional: es un artefacto de evaluación académica.

El checkpoint incluye la arquitectura principal del modelo Mamba sin modificaciones y excluye la extensión separada de feedback de suma acumulada (running-sum feedback). El entrenamiento quedó en estado parcial: se completaron 26 100 de las 38 893 actualizaciones de optimizador planificadas, con parada temprana activada. Los resultados de validación son bajos (9,08 % de precisión por carácter, 3,96 % por palabra, 13,96 % de coincidencia exacta sobre 1153 ejemplos), lo que limita su uso práctico.

Su relevancia es exclusivamente didáctica y de reproducibilidad: sirve para estudiar una implementación desde cero de un modelo de espacio de estados (SSM) sobre una tarea controlada, y para comparar presupuestos de entrenamiento entre arquitecturas dentro del marco del curso. No debe confundirse con los modelos Mamba publicados por equipos de investigación ni usarse como referencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM), implementado desde cero en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | ingles (`en`); tarea a nivel de caracter sobre texto cifrado |
| Licencia | no disponible |
| Formato de pesos | `weights.safetensors` + `metadata.json` + `training_config.yaml` |
| Libreria | PyTorch (`pytorch`), sin integracion con `AutoModel` de Hugging Face |
| Tamano del repositorio | 0,0 GB (segun la ficha de Hugging Face) |
| Estado de entrenamiento | parcial: 26 100 de 38 893 actualizaciones, parada temprana activada |
| Tokenizer | a nivel de caracter (definido en `metadata.json`) |

## Arquitectura y entrenamiento

El modelo es una implementacion desde cero de una arquitectura Mamba, es decir, un modelo de espacio de estados selectivo con recurrencia dependiente de la entrada, en lugar de un transformer con atencion completa. El checkpoint conserva la arquitectura principal sin cambios y excluye explicitamente la extension separada de running-sum feedback, que formaba parte del diseno experimental pero no del modelo guardado. El tokenizador opera a nivel de caracter, adecuado para la tarea de descifrado: la entrada es texto cifrado en bruto y la salida es texto plano generado de forma causal, condicionando cada caracter en los caracteres de texto plano ya emitidos.

El entrenamiento se detuvo de forma temprana tras 26 100 de las 38 893 actualizaciones de optimizador previstas. La model card advierte que las arquitecturas comparadas en la tarea completaron presupuestos de entrenamiento distintos, por lo que estos checkpoints no constituyen una comparacion arquitectonica con presupuesto igualado ni reproducen un resultado de referencia independiente. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (en una tarea de descifrado a nivel de caracter, lo esperable es entrenamiento supervisado autoregresivo, pero no se confirma). El repositorio excluye datos de entrenamiento, estado del optimizador, instantaneas de recuperacion, credenciales y rutas especificas de maquina; `training_config.yaml` contiene solo las decisiones de entrenamiento saneadas.

## Capacidades

- Descifrado de texto a nivel de caracter: recibe texto cifrado y emite texto plano caracter a caracter de forma causal.
- Generacion autoregresiva con realimentacion de sus propias predicciones previas de texto plano durante la inferencia.
- Modelado de dependencias de largo alcance mediante el estado recurrente del SSM (sin atencion explicita).
- Ejecucion solo a traves del cargador del repositorio del curso (`src.part1.cli.load_checkpoint`); no hay integracion con `AutoModel` ni pipeline estandar de Hugging Face.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no; el modelo esta etiquetado unicamente para ingles y entrenado sobre una tarea concreta de descifrado.
- No es un modelo de chat ni de instrucciones: no se ha alineado para seguir directivas.

## Casos de uso

- Reproduccion academica de la tarea: cargar el checkpoint con `src.part1.cli.load_checkpoint` usando la revision fijada en el manifiesto de publicacion para verificar las metricas de validacion reportadas (9,08 % de precision por caracter sobre 1153 ejemplos).
- Estudio de implementaciones SSM desde cero: inspeccionar `weights.safetensors`, `metadata.json` y `training_config.yaml` para entender como se estructura un Mamba minimo en PyTorch y que metadatos exige el cargador del curso.
- Analisis de presupuestos de entrenamiento: comparar el estado parcial (26 100 de 38 893 actualizaciones) con otros checkpoints de la misma tarea para discutir el efecto de la parada temprana y de presupuestos desiguales en las conclusiones.
- Docencia sobre tokenizacion a nivel de caracter: usar la tarea de descifrado como ejemplo controlado de generacion causal donde el vocabulario es el conjunto de caracteres y la realimentacion de predicciones es parte del bucle de inferencia.
- Pruebas de infraestructura de evaluacion: integrar el checkpoint en un arnes de validacion propio para comprobar que el pipeline de carga, el fingerprint de integridad de `metadata.json` y las metricas se reproducen de extremo a extremo.
- Referencia negativa en experimentos: emplear sus bajas metricas como linea base de un modelo insuficientemente entrenado frente a variantes con mas actualizaciones o con la extension de running-sum feedback.
- No es adecuado para produccion: descifrado real, atencion al cliente, generacion de codigo ni ninguna aplicacion fuera del contexto del curso.

## Benchmarks y rendimiento

Resultados de validacion publicados en la model card (validacion de fuente completa en modo free-running, no resultados de test):

| Metrica de validacion | Valor |
|---|---:|
| Precision por caracter | 0,0907899701 |
| Precision por palabra | 0,0396094502 |
| Coincidencia exacta | 0,1396357329 |
| Ejemplos evaluados | 1153 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos de referencia. La model card advierte explicitamente que estos checkpoints no reproducen un resultado de referencia ni establecen una comparacion arquitectonica con presupuesto igualado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio figura como 0,0 GB y no se publica el numero de parametros, por lo que no puede calcularse una estimacion fiable.
- GPU recomendadas: no disponible. Dado el caracter educativo del checkpoint y la ausencia de datos de tamano, no hay recomendacion publicada.
- Viabilidad en GPU de consumo: no confirmada; probablemente viable en GPUs de consumo si el modelo es pequeno, pero este extremo no esta documentado.
- Opciones de despliegue: unicamente el cargador del repositorio del curso (`src.part1.cli.load_checkpoint`). No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos en GGUF ni integracion con `AutoModel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints de la misma tarea ni modelos Mamba de referencia con los que comparar parametros, contexto, rendimiento o licencia. La propia model card senala que las arquitecturas comparadas en la asignatura se entrenaron con presupuestos distintos, de modo que cualquier comparacion directa seria metodologicamente invalida.

## Limitaciones y advertencias

- Rendimiento muy bajo: 9,08 % de precision por caracter y 3,96 % por palabra en validacion; la model card reconoce que la precision medida limita el uso practico.
- Entrenamiento incompleto: solo 26 100 de 38 893 actualizaciones, con parada temprana; el modelo no ha agotado su presupuesto previsto.
- Los resultados son de validacion, no de test, y no constituyen una reproduccion de un resultado de referencia.
- Presupuestos de entrenamiento desiguales entre arquitecturas: no sirve para extraer conclusiones comparativas sobre arquitecturas.
- Sin licencia declarada: no hay permiso explicito de uso comercial ni condiciones de redistribucion; debe tratarse como material academico restringido hasta aclaracion del autor.
- Dependencia de codigo externo: requiere el repositorio del curso y su cargador especifico; no funciona con herramientas estandar de Hugging Face.
- Solo ingles y dominio muy acotado (descifrado a nivel de caracter); no generaliza a otras tareas de lenguaje.
- Riesgo de alucinacion y salidas incoherentes alto dado el bajo rendimiento medido; no apto para produccion.
- Excluye la extension de running-sum feedback y el estado del optimizador, por lo que no permite reanudar el entrenamiento tal cual.
- Excluye datos de entrenamiento, credenciales y rutas de maquina; la reproducibilidad completa depende del repositorio del curso y de la revision fijada en el manifiesto de publicacion.
- Sesgos: no documentados; al ser un modelo de descifrado a nivel de caracter sobre un corpus no especificado, no se puede evaluar su comportamiento sesgado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morepeaches/anlp-a3-part1-mamba
- Repositorio del curso (codigo de carga `src.part1.cli`): no disponible en la informacion proporcionada
- Paper de Mamba (arquitectura de referencia): no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
