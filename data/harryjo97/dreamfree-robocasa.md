# harryjo97/DreamFree-RoboCasa

## Resumen

DreamFree-RoboCasa es un checkpoint del modelo DreamFree, un World Action Model (WAM) orientado a robótica manipulativa, desarrollado por Jaehyeong Jo, Sangwon Jang, Sihyun Yu, Seonghyeon Ye, Yekyung Nah, Hojung Jung, Kimin Lee y Sung Ju Hwang (arXiv:2611.04527). El modelo parte del backbone de video Wan2.2-I2V-A14B, un DiT de 14B parametros, y se especializa en prediccion de acciones para tareas de cocina del simulador RoboCasa.

La innovacion central es la "destilacion de representaciones futuras" (Future Representation Distillation): en lugar de generar fotogramas de video futuros como paso intermedio (lo que seria costoso en inferencia), el modelo aprende a predecir acciones directamente a partir de representaciones visuales destiladas. Esto lo convierte en un modelo "imagination-free" que reduce el coste computacional frente a los WAM clasicos basados en difusion de video.

El repositorio publica tanto el codificador visual de la etapa 1 (DiT completo fusionado en BF16 Safetensors) como los modulos de accion de la etapa 2 (readout, conditioner, proprio encoder y action DiT). El checkpoint esta entrenado sobre demostraciones RoboCasa Cosmos-success y consume tres vistas de camara, una instruccion en lenguaje natural y el estado del robot para producir chunks de 32 pasos de acciones de 7 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WAM (World Action Model): codificador visual DiT + readout + action DiT |
| Parametros totales | 14B en el backbone de video (Wan2.2-I2V-A14B); total del sistema no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (Safetensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | MIT (dependencias upstream conservan sus licencias) |
| Formato de pesos | Safetensors (BF16) para stage1 y stage2 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura WAM de dos etapas. La etapa 1 contiene un codificador visual basado en un DiT de video (Wan2.2-I2V-A14B) con pesos fusionados completos; la etapa 2 anade un modulo de accion (action DiT), un readout, un conditioner y un proprio encoder. Las entradas son tres vistas de camara, una instruccion de lenguaje y el estado del robot; la salida es un chunk de 32 acciones de 7 dimensiones.

El entrenamiento se realiza sobre demostraciones RoboCasa Cosmos-success. La innovacion tecnica clave es la destilacion de representaciones futuras: el estudiante (Stage 1) aprende representaciones visuales destiladas de un modelo profesor de video, de modo que la politica de accion puede predecir directamente sin necesidad de generar fotogramas futuros en inferencia. Los metadatos de entrenamiento y linaje del checkpoint se registran en `provenance/release.json`. El VAE, el text encoder y el tokenizer no se incluyen y siguen siendo dependencias upstream.

## Capacidades

- Prediccion de acciones sin imaginacion: genera acciones directamente a partir de representaciones visuales destiladas, sin sintetizar video futuro.
- Manipulacion condicionada por lenguaje: combina observaciones de camara, instruccion textual y propiocepcion para predecir chunks de acciones.
- Entrada multimodal robotica: tres vistas de camara, instruccion en lenguaje natural y estado del robot.
- Salida de acciones: chunks de 32 pasos con vectores de 7 dimensiones.
- Evaluacion en RoboCasa: disenado para el simulador RoboCasa con configuracion de controlador, preprocesado de imagen y estadisticas de normalizacion especificas.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni thinking mode.

## Casos de uso

- Manipulacion en simulador RoboCasa: el modelo predice chunks de acciones para tareas de cocina usando las tres vistas de camara y la instruccion; es adecuado porque esta entrenado sobre demostraciones Cosmos-success del propio benchmark.
- Evaluacion de politicas de robotica: sirve como politica de referencia en pipelines de evaluacion RoboCasa, con preprocesado y normalizacion ya definidos en el checkpoint.
- Investigacion en world models: permite comparar WAM con imaginacion (difusion de video) frente a WAM imagination-free, aislando el coste de generacion de fotogramas futuros.
- Destilacion de representaciones: el codificador visual de stage1 puede reutilizarse como estudiante en experimentos de destilacion de representaciones futuras.
- Transferencia a tareas de cocina: al estar condicionado por lenguaje, puede adaptarse a nuevas instrucciones dentro del mismo entorno de simulador.
- Fine-tuning sobre nuevos datasets de demostraciones: la estructura en dos etapas (encoder + modulos de accion) permite ajustar solo la etapa 2 manteniendo el encoder congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el backbone de 14B en BF16 requiere aproximadamente 28 GB solo para pesos, mas activaciones y modulos de accion.
- GPU recomendadas: no disponible en la informacion; por tamano del backbone, se requiere al menos una GPU de clase A100/H100 de 40-80 GB para BF16.
- Cabe en consumer GPU: no disponible; el backbone de 14B en BF16 excede la VRAM de GPUs consumer tipicas (RTX 4090 24 GB) sin cuantizacion, y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: no disponible; el checkpoint se distribuye como Safetensors BF16 para PyTorch, sin integracion documentada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DreamFree-RoboCasa | 14B (backbone) | no disponible | WAM imagination-free con destilacion de representaciones | MIT | Hugging Face |
| Wan2.2-I2V-A14B (base) | 14B | no disponible | Difusion texto-a-video | no disponible | Hugging Face |
| WAM clasicos con imaginacion de video | no disponible | no disponible | Prediccion de acciones via generacion de fotogramas futuros | no disponible | no disponible |

## Limitaciones y advertencias

- Especifico de RoboCasa: requiere el simulador, el controlador, el preprocesado de imagen y las estadisticas de normalizacion del recipe seleccionado; fuera de ese entorno el rendimiento no esta garantizado.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni metricas de exito en RoboCasa en la informacion disponible.
- Dependencias upstream: VAE, text encoder y tokenizer no se incluyen y conservan sus propias licencias, que pueden imponer restricciones adicionales.
- Riesgo de alucinacion en acciones: al no generar video intermedio, no hay verificacion visual del resultado; acciones erroneas pueden no detectarse hasta la ejecucion.
- Idiomas: no se especifica que idiomas soporta el conditioner de lenguaje.
- Uso comercial: la licencia MIT del release lo permite, pero las dependencias upstream deben revisarse por separado.
- Madurez: checkpoint con 0 descargas y 0 likes en el momento de la consulta; validacion externa limitada.
- Tamano: 30.7 GB en el repositorio, lo que complica el despliegue en entornos con almacenamiento o ancho de banda limitados.

## Enlaces

- Hugging Face: https://huggingface.co/harryjo97/DreamFree-RoboCasa
- Paper (arXiv): https://arxiv.org/abs/2611.04527
- GitHub: https://github.com/harryjo97/dreamfree
- Project page: https://harryjo97.github.io/dreamfree/
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
