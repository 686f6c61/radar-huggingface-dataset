# allenai/Molmo2-4B-tb

## Resumen

Molmo2-4B-tb es un modelo vision-lenguaje desarrollado por Ai2 (Allen Institute for AI) que actúa como el componente de alto nivel del proyecto ToyBlocks, un sistema robotico de apilamiento de bloques. Se trata de un fine-tuning de Molmo2-4B que, dada una imagen de la camara frontal del robot y un objetivo de apilamiento en texto, genera un plan corto, identifica el siguiente paso y senala mediante coordenadas el bloque o posicion sobre el que actuar. Un modelo de bajo nivel, como un planificador de movimiento o una politica aprendida (ManiFlow), ejecuta despues la accion concreta.

El modelo combina un encoder visual SigLIP 2 so400m/14 con un lenguaje Qwen3-4B denso, sumando aproximadamente 4,5 mil millones de parametros. Funciona a unos 6 Hz en bucle cerrado, lo que lo hace adecuado para control robotico en tiempo casi real. Su salida estructurada (plan, accion y punto objetivo) esta disenada para integrarse directamente en pipelines de roboticas.

La relevancia de este modelo radica en su enfoque especializado: en lugar de un VLM generico, ofrece una interfaz concreta y medible para tareas de manipulacion, con evaluaciones en simulacion y en robot real. Esta publicado bajo licencia Apache 2.0, aunque su modelo base incorpora datos de terceros con restricciones academicas y no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (ViT SigLIP 2 + LLM Qwen3-4B denso) |
| Parametros totales | Aproximadamente 4,5 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en float32 en formato nativo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | model.pt (float32, formato nativo Molmo2, no Transformers) y config.yaml |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura vision-lenguaje compuesta por tres bloques. El encoder visual es un SigLIP 2 so400m/14 a 378 px, un ViT de 27 capas y 1152 de ancho. Las caracteristicas se extraen de dos capas del ViT (la tercera y la novena desde el final), se agrupan mediante pooling de atencion 2x2 con query media y se proyectan con un MLP al modelo de lenguaje. El LLM es Qwen3-4B denso: 36 capas, ancho 2560, 32 cabezas de query con 8 cabezas key/value (grouped-query attention, dimension de cabeza 128), RoPE, RMSNorm con QK-norm y MLP SwiGLU.

El entrenamiento se realizo durante 6000 pasos con batch size 256 sobre episodios simulados de apilamiento de tres bloques de ToyBlocks. Se mezclo un 25% de datos de pointing de imagenes (PixMo-Points, PixMo-Count, CoSyn-Point) para preservar la capacidad general de senalizacion de Molmo. El objetivo es la prediccion del siguiente token del plan, la accion y el punto objetivo. El entrenamiento se ejecuto en un nodo con 8 GPU NVIDIA H100 de 80 GB.

## Capacidades

- Generacion de planes de apilamiento a partir de una imagen de camara frontal y un objetivo en texto.
- Senalizacion (pointing) de bloques y posiciones objetivo mediante coordenadas normalizadas (0-1000 sobre ancho y alto de imagen).
- Prediccion de acciones discretas: pick, place (sobre bloque o mesa), flip (izquierda, derecha, adelante, atras), rotate (horario, antihorario) y done.
- Razonamiento multi-paso sobre el estado del apilamiento (progreso del objetivo y siguiente paso).
- Capacidad general de pointing conservada mediante el mezclado de datos de PixMo-Points, PixMo-Count y CoSyn-Point.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible como tal; el modelo actua como componente de alto nivel en un bucle cerrado con un modelo de bajo nivel.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: salida estructurada de plan + accion + punto; funcionamiento a aproximadamente 6 Hz en bucle cerrado.

## Casos de uso

- Apilamiento robotico de bloques en simulacion: el modelo lee el objetivo (por ejemplo, "stack A 4 B"), observa la imagen y genera el siguiente paso con su punto objetivo; un planificador de movimiento o ManiFlow ejecuta la accion. Adecuado por su salida estructurada y su tasa de 6 Hz.
- Investigacion en robotica de manipulacion: permite estudiar la division entre planificacion de alto nivel y control de bajo nivel, con metricas de exito publicadas en conjuntos Easy, Medium y Hard.
- Evaluacion de politicas de bajo nivel: al mantener fijo el modelo de alto nivel, se puede comparar el rendimiento de distintos planificadores de movimiento o politicas aprendidas (ManiFlow) en el mismo entorno.
- Fine-tuning sobre datos propios: el modelo puede reentrenarse con nuevos episodios de apilamiento o con otras tareas de manipulacion, segun el repositorio ToyBlocks.
- Prototipado de sistemas de robotica educativa: su licencia Apache 2.0 y su tamano moderado (aproximadamente 20 GB en bfloat16) facilitan su uso en laboratorios y cursos.
- Integracion en pipelines de investigacion con simuladores: el modelo puede combinarse con simuladores de robotica para generar trayectorias de apilamiento y medir optimalidad ademas del exito.
- Demostraciones en robot real: con ManiFlow como modelo de bajo nivel, alcanza un 60% de exito en 10 ensayos reales, lo que lo hace util para validacion temprana en hardware.

## Benchmarks y rendimiento

Tasa de exito en bucle cerrado (%) en simulacion ToyBlocks, con Molmo2-4B-tb como modelo de alto nivel y planificador de movimiento o ManiFlow como modelo de bajo nivel. Cada conjunto de evaluacion tiene exactamente 200 episodios. *Seen*: bloques vistos en entrenamiento en nuevas configuraciones; *Unseen*: bloques no vistos.

| Nivel | Planificador de movimiento, seen | Planificador de movimiento, unseen | ManiFlow, seen | ManiFlow, unseen |
|---|---|---|---|---|
| Easy | 97,5 | 81,0 | 55,5 | 44,5 |
| Medium | 53,5 | 36,5 | 35,5 | 12,5 |
| Hard | 31,5 | 14,5 | 17,0 | 10,0 |

En robot real, con ManiFlow como modelo de bajo nivel, el exito es del 60% en 10 ensayos. La metrica principal es el exito de la tarea; el informe tecnico tambien mide optimalidad (eficiencia en la completacion).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB en bfloat16.
- GPU recomendadas: NVIDIA H100 de 80 GB (usada en entrenamiento con 8 unidades); para inferencia, cualquier GPU con al menos 20 GB de memoria en bfloat16, como A100 de 40/80 GB o H100.
- Cabe en GPU consumer: si, en tarjetas con 24 GB o mas (por ejemplo, RTX 3090 o RTX 4090) en bfloat16, siempre que se ajuste el uso de memoria.
- Opciones de despliegue: el modelo usa el formato nativo Molmo2 (model.pt) y no es directamente compatible con Transformers; la inferencia se realiza con el codigo del repositorio ToyBlocks. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el modelo funciona a aproximadamente 6 Hz en bucle cerrado, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Molmo2-4B-tb | ~4,5B | No disponible | VLM especializado en apilamiento robotico | Apache 2.0 | Hugging Face |
| Molmo2-4B | ~4,5B (no confirmado) | No disponible | VLM generico base | No disponible en la informacion | Hugging Face |
| ManiFlow-tb | No disponible | No disponible | Politica de bajo nivel para ToyBlocks | No disponible en la informacion | Hugging Face |

No se dispone de datos comparativos de rendimiento con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo esta disenado exclusivamente para mover bloques sobre una mesa; cualquier otro uso queda fuera de su alcance.
- Solo ingles: el objetivo y las interacciones deben formularse en ingles.
- Dependencia de un modelo de bajo nivel: su rendimiento en tareas reales depende del planificador de movimiento o politica (ManiFlow) que ejecute las acciones.
- Caida de rendimiento en escenarios dificiles: la tasa de exito baja notablemente en niveles Medium y Hard, especialmente con bloques no vistos (14,5% en Hard con planificador de movimiento, 10,0% con ManiFlow).
- El modelo base Molmo2-4B se entreno con conjuntos de datos de terceros sujetos a uso academico y no comercial; es necesario revisar esos terminos antes de un uso comercial, aunque la licencia del fine-tuning sea Apache 2.0.
- Riesgo de alucinacion: no se documenta explicitamente, pero al ser un VLM puede generar puntos o acciones inconsistentes con la imagen.
- Formato de pesos no estandar: al no ser compatible con Transformers, requiere el codigo del repositorio ToyBlocks, lo que limita su integracion en ecosistemas habituales.
- Uso previsto segun las directrices de uso responsable de Ai2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/Molmo2-4B-tb
- Modelo base Molmo2-4B: https://huggingface.co/allenai/Molmo2-4B
- Modelo de bajo nivel ManiFlow-tb: https://huggingface.co/allenai/maniflow-tb
- Blog de ToyBlocks: https://allenai.org/blog/toyblocks
- Codigo de ToyBlocks: https://github.com/allenai/toyblocks
- Directrices de uso responsable de Ai2: https://allenai.org/responsible-use
