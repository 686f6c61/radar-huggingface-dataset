# dancil/BOSS-gin_rummy-intercode-r1-smoke

## Resumen

BOSS-gin_rummy-intercode-r1-smoke es un adaptador LoRA (PEFT) publicado por el usuario dancil sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Se trata de un artefacto de tipo *fine-tuning* supervisado (SFT) entrenado con la librería TRL, orientado a generación de texto conversacional. El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors, no un modelo completo: para utilizarlo es necesario descargar por separado el modelo base Qwen2.5-1.5B-Instruct y cargar el adaptador encima.

El nombre del repositorio sugiere un doble propósito: por un lado, un dominio de juego de cartas (gin rummy) y, por otro, tareas de código o razonamiento tipo "intercode-r1". El sufijo "smoke" indica que se trata de una prueba de humo (*smoke test*) de un pipeline de entrenamiento, es decir, una ejecución mínima destinada a verificar que el proceso de *fine-tuning* funciona de principio a fin, no un modelo afinado con un volumen significativo de datos ni validado con evaluaciones. Esto es coherente con el resto de señales del repositorio: 0 descargas, 0 "likes", creación y última actualización separadas por dos segundos, y una *model card* que es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]".

Por tanto, la relevancia de esta ficha es principalmente de inventario y trazabilidad: documenta un adaptador experimental de bajo coste computacional (1,5 mil millones de parámetros, desplegable en GPU de consumo e incluso en CPU) cuya utilidad real en producción no está demostrada. Cualquier evaluación de calidad, capacidades o sesgos queda pendiente de que el autor publique datos de entrenamiento, hiperparámetros y resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only del modelo base Qwen2.5-1.5B-Instruct |
| Parametros totales | 1,54 mil millones en el modelo base; numero de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen2.5-1.5B-Instruct (no confirmado en la model card del adaptador); no disponible para el adaptador de forma explicita |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; el modelo fusionado admitiria cuantizaciones GGUF/AWQ/GPTQ, pero no hay ninguna publicada en el repositorio |
| Idiomas soportados | No disponible en el repositorio. El modelo base Qwen2.5-1.5B-Instruct es multilingue (aproximadamente 29 idiomas segun su documentacion publica), pero no hay constancia de que el ajuste preserve ese soporte |
| Licencia | No disponible. El campo de licencia del repositorio esta vacio; el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA); requiere el modelo base aparte |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft (entrenado con transformers + trl) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Fecha de creacion | 2026-09-28 |
| Fecha de ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-1.5B-Instruct, un transformer de tipo decoder-only con atención por consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU. El ajuste se realizó mediante LoRA, una técnica de *parameter-efficient fine-tuning* que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas, de modo que solo se entrena una fracción mínima de parámetros. Las etiquetas del repositorio confirman el uso de las librerías transformers y TRL y la modalidad SFT (supervised fine-tuning); la versión de PEFT declarada en la model card es 0.18.1.

No hay información publicada sobre el proceso de entrenamiento: se desconoce el número de tokens, la composición del conjunto de datos, el rango y el alfa de LoRA, las capas objetivo, la tasa de aprendizaje, el número de épocas, la precisión utilizada, ni si hubo etapas posteriores de RLHF, DPO u optimización por preferencias. El propio nombre del repositorio ("smoke") apunta a una ejecución de validación del pipeline más que a un entrenamiento con datos representativos, de modo que no cabe esperar ninguna innovación técnica ni capacidad emergente atribuible al adaptador. Un detalle de trazabilidad relevante es la etiqueta `base_model:adapter:/cache/models/Qwen--Qwen2.5-1.5B-Instruct`, que refleja una ruta local de caché del entorno de entrenamiento y no una referencia canónica del Hub.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y la etiqueta "conversational" indica uso previsto en diálogo multi-turno, siempre heredando las capacidades del modelo base.
- Razonamiento y generación de código: el sufijo "intercode-r1" del nombre sugiere un entrenamiento orientado a tareas de código o a razonamiento de tipo cadena de pensamiento, pero no hay evidencia publicada de que el adaptador mejore al modelo base en estas tareas.
- Dominio específico de juego: el nombre incluye "gin_rummy", lo que apunta a un ajuste sobre reglas o estrategia de ese juego de cartas, sin datos que confirmen su calidad.
- Soporte de tool calling / function calling: no disponible como capacidad verificada; el modelo base Qwen2.5-1.5B-Instruct sí documenta soporte de function calling, pero no se ha validado que el adaptador lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el ajuste con SFT sobre un corpus reducido puede degradar el multilingüismo del modelo base.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles. El modelo base es exclusivamente de texto.
- Fine-tuning posterior: al ser un adaptador LoRA, puede combinarse con otros adaptadores o continuar su entrenamiento, siempre que se respete la licencia del modelo base.

## Casos de uso

- Verificación de pipelines de entrenamiento (smoke test): es el uso más plausible y alineado con el nombre del repositorio. Un equipo que despliegue un flujo TRL + PEFT + transformers puede cargar este adaptador para comprobar que la conversión de datos, el bucle de entrenamiento y la serialización de pesos funcionan antes de lanzar ejecuciones costosas sobre el modelo completo.
- Reproducción y depuración de adaptadores LoRA: sirve como ejemplo mínimo y reproducible (0,1 GB) de cómo se estructura un repositorio PEFT, útil para depurar scripts de carga con `PeftModel.from_pretrained` sin consumir recursos significativos.
- Prototipado de agentes para juegos de cartas: dado el dominio "gin rummy" del nombre, puede emplearse como punto de partida experimental para tareas de decisión y diálogo en juegos de cartas, aunque sin datos de calidad publicados el prototipo requeriría un reentrenamiento con corpus reales antes de cualquier uso serio.
- Asistente conversacional ligero en local: el modelo base de 1,54 mil millones de parámetros se ejecuta en CPU y en GPU de gama media, lo que permitiría desplegar un asistente de ámbito reducido en portátiles o dispositivos con recursos limitados, siempre que se reemplace el adaptador por uno entrenado con datos de calidad.
- Entorno de investigación para experimentos de eficiencia: por su tamaño reducido, permite medir tiempos de entrenamiento, consumo de memoria y velocidad de inferencia de técnicas LoRA en un ciclo iterativo rápido antes de escalar a modelos mayores.
- Generación de texto con requisitos de privacidad: al poder ejecutarse íntegramente en hardware propio, encaja en escenarios donde los datos no pueden salir de la infraestructura local (documentación interna, borradores), aunque de nuevo con el modelo base y no con este adaptador concreto.
- Base para un fine-tuning específico de dominio: al ser un adaptador LoRA ligero, se puede tomar como plantilla de configuración y sustituir los pesos por un entrenamiento con datos propios del dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla por defecto de HuggingFace y no contiene ninguna sección de evaluación cumplimentada (MMLU, HumanEval, GSM8K u otros). Tampoco se han publicado métricas de pérdida de entrenamiento, tasas de acierto ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base: aproximadamente 3,1 GB en FP16/BF16 para los pesos, más la caché KV (que crece con la longitud de contexto) y el propio adaptador LoRA, que en un rango típico ocupa decenas de megabytes. En la práctica, entre 4 y 6 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 3070, RTX 4070 o superiores. En el extremo profesional, A100 o H100 no aportan ventaja relevante para un modelo de este tamaño salvo por agregación de muchas peticiones concurrentes.
- Cabe en GPU de consumo: si. Una RTX 4090 (24 GB) puede mantener varias instancias o contextos largos; una GPU con 6-8 GB es suficiente para una instancia en FP16 y para varias en cuantización de 4 u 8 bits.
- Ejecución en CPU: posible con llama.cpp u Ollama usando cuantizaciones GGUF, aunque el adaptador tendría que fusionarse con el modelo base y convertirse previamente a ese formato, ya que el repositorio solo publica pesos safetensors de PEFT.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador sin fusionar), vLLM con soporte de LoRA (`--enable-lora`, útil para servir varios adaptadores sobre el mismo modelo base), TGI, llama.cpp y Ollama (requieren fusionar y convertir a GGUF), y LM Studio para uso de escritorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad, tokens por segundo ni tiempo hasta el primer token para este adaptador.

## Comparativa con modelos similares

La comparativa se establece a nivel de modelo base, ya que el adaptador no modifica la arquitectura ni el número de parámetros. Los datos de los modelos alternativos proceden de su documentación pública; el licenciamiento y las condiciones del adaptador de dancil no están declarados en el repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| BOSS-gin_rummy-intercode-r1-smoke (este adaptador) | 1,54 mil millones en el base + adaptador LoRA de tamano no disponible | 32.768 tokens heredados del base | No disponible (base: Apache 2.0) | safetensors (PEFT/LoRA) | 0 descargas, 0 likes, sin evaluaciones |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 mil millones | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF en repositorios de terceros | Ampliamente utilizado, con evaluaciones publicas |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF en repositorios de terceros | Muy extendido, con evaluaciones publicas |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71 mil millones | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente utilizado en entornos de bajos recursos |

La diferencia fundamental no es de arquitectura ni de parámetros, sino de estado de madurez: los tres modelos base cuentan con *model cards* completas, evaluaciones publicadas y soporte en herramientas de despliegue, mientras que este adaptador carece de documentación, licencia declarada y validación.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto de HuggingFace, con todos los campos sin rellenar (desarrollador, financiación, datos de entrenamiento, hiperparámetros, evaluación, impacto ambiental).
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, la ausencia de licencia explícita en el adaptador genera incertidumbre jurídica para cualquier uso comercial. Conviene contactar con el autor antes de reutilizarlo.
- Naturaleza de prueba de humo: el sufijo "smoke" indica una ejecución de validación del pipeline. No hay ninguna garantía de que el adaptador haya sido entrenado con datos suficientes ni de que su comportamiento sea coherente.
- Riesgo de degradacion frente al modelo base: un SFT sobre un corpus reducido o mal filtrado puede reducir capacidades del modelo base, como el multilingüismo, el razonamiento o el seguimiento de instrucciones. Solo una evaluación comparativa con el modelo sin adaptar puede determinarlo.
- Riesgo de alucinacion: inherente a los modelos de 1,5 mil millones de parámetros, que tienen una capacidad limitada de retener conocimiento factual. No hay evaluación publicada que acote esta tasa.
- Sesgos: no evaluados y previsiblemente heredados del corpus de entrenamiento del modelo base y del corpus de ajuste, que se desconoce por completo.
- Limitaciones de contexto e idioma: el adaptador no declara idiomas soportados. El ajuste puede haber sesgado la salida hacia el idioma o el dominio (gin rummy, código) de los datos de entrenamiento.
- Ruta de modelo base no canonica: la etiqueta `base_model:adapter:/cache/models/Qwen--Qwen2.5-1.5B-Instruct` apunta a una ruta de caché local del entorno de entrenamiento, lo que sugiere un proceso automatizado no revisado y puede dificultar la reproducibilidad exacta.
- Sin senales de adopcion: cero descargas y cero "likes" en el momento de la consulta; no hay issues, discusiones ni usuarios que hayan reportado comportamiento en producción.
- No apto para produccion: no debe desplegarse en sistemas que atiendan a usuarios finales sin una reevaluación completa, mediciones de calidad y una sustitución de los pesos por un ajuste validado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dancil/BOSS-gin_rummy-intercode-r1-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Referencia citada en la model card (calculo de impacto ambiental), Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales asociados a este adaptador en la informacion disponible.
