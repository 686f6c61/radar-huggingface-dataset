# Jongwondd/Llama-3.1-8B-Instruct-ALiT-alpha2-2ep-a858b92a

## Resumen

Llama-3.1-8B-Instruct-ALiT-alpha2-2ep-a858b92a es un adaptador LoRA (PEFT) entrenado sobre meta-llama/Llama-3.1-8B-Instruct por el usuario Jongwondd. No es un modelo completo ni una exportación fusionada: se publica como adaptador sin fusionar, con los pesos originales intactos y únicamente la configuración de PEFT ajustada para que el localizador del modelo base y su revisión sean portables. El propósito declarado es la investigación sobre negación ("negation-training"), aplicando un método denominado ALiT con α=2 durante dos épocas completas.

El entrenamiento se realizó sobre el conjunto PopQA de entrenamiento (14.951 pares / 4.534 casos), con 29.902 ejemplos vistos y 1.872 pasos de optimizador. El adaptador tiene rango LoRA 16, alpha 32 y dropout 0. El repositorio ocupa 0,2 GB y solo contiene los pesos del adaptador, no los del modelo base.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados y sin validación de seguridad. Es útil para quien quiera reproducir o inspeccionar el efecto del entrenamiento ALiT sobre negación en Llama 3.1 8B Instruct, pero no debe tratarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base Llama-3.1-8B-Instruct tiene 8.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del flujo de carga del modelo base) |
| Idiomas soportados | en |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8.000 millones de parámetros. El método de entrenamiento es ALiT con α=2, partiendo de una inicialización fresh base (sin adaptador previo). Se completaron dos épocas sobre la población de entrenamiento de PopQA: 14.951 pares distribuidos en 4.534 casos, lo que supone 29.902 ejemplos vistos y 1.872 pasos de optimizador. La configuración LoRA emplea rango 16, alpha 32 y dropout 0.

El autor indica que los bytes de los pesos no han cambiado respecto al adaptador original (SHA-256 `a858b92a86b9ca2169d1d3d6f34d70f435cb8be6ac27f5bbf603184177ff6176`); solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT. Los hashes de configuración original y publicada, el objetivo específico del método, los hiperparámetros retenidos y los hashes del resumen de fuentes y de los datos de entrenamiento se recogen en `training_provenance.json`. No se documentan aquí innovaciones como decodificación especulativa, atención lineal ni mecanismos híbridos; el interés técnico reside en el objetivo de entrenamiento sobre negación, no en cambios arquitectónicos.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama-3.1-8B-Instruct.
- Entrenamiento específico orientado a comportamiento relacionado con la negación (objetivo declarado del adaptador).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso específicas de este adaptador; cualquier capacidad de este tipo provendría del modelo base y no está verificada en esta publicación.
- No se documentan capacidades de visión, audio ni modo thinking.
- Capacidades multilingües: solo se declara inglés (`en`); no hay evidencia de soporte de otros idiomas en esta publicación.
- No se aportan evaluaciones que confirmen ninguna capacidad concreta del adaptador.

## Casos de uso

- Investigación sobre negación en modelos de lenguaje: el adaptador permite estudiar cómo el entrenamiento ALiT con α=2 modifica el comportamiento del modelo base frente a enunciados negativos, comparándolo con las líneas base SFT/UL/DPO que el autor menciona como ejecuciones distintas.
- Reproducción de experimentos: con `training_provenance.json` y los hashes registrados, un equipo puede auditar la correspondencia entre el adaptador publicado y la ejecución de entrenamiento original.
- Análisis de adaptadores LoRA: sirve como caso de estudio de publicación de adaptadores con configuración PEFT portable y trazabilidad de hashes, sin fusionar pesos.
- Evaluación comparativa de métodos de ajuste: útil para contrastar el efecto de dos épocas de ALiT frente a otras estrategias de ajuste sobre el mismo modelo base en tareas de PopQA.
- Docencia y formación: ejemplo práctico de carga de un adaptador PEFT sobre un modelo base con acceso restringido, usando revisiones fijadas.
- Pruebas de robustez internas: permite medir en un entorno controlado la tasa de salidas incorrectas, sesgadas, malformadas o repetitivas que el propio autor advierte como posibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación y no reclama reproducir las cifras del manuscrito; además, señala que las divisiones de evaluación observadas previamente son datos de desarrollo, no datos de test independientes, y que las puntuaciones proxy basadas en reglas no equivalen a precisión de un juez semántico.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base. Para Llama-3.1-8B-Instruct en bfloat16 se requiere aproximadamente 16 GB de VRAM solo para pesos, más memoria para el adaptador y el contexto.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo base, son adecuadas GPU con al menos 16-24 GB de VRAM (por ejemplo, A100, H100 o RTX 4090) para inferencia en precisión reducida.
- GPU de consumo: no confirmado por el autor; el adaptador es pequeño (0,2 GB), pero el modelo base condiciona el requisito.
- Opciones de despliegue: carga mediante Transformers y PEFT, tal como muestra el ejemplo del autor (`AutoModelForCausalLM` + `PeftModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-ALiT-alpha2-2ep-a858b92a | Adaptador sobre 8B | No disponible | Sin benchmarks publicados | llama3.1 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | No disponible en esta informacion | No disponible en esta informacion | llama3.1 | Hugging Face (modelo base) |
| Otros adaptadores LoRA de investigacion sobre Llama 3.1 8B | Variable | No disponible | No disponible | Segun autor | Hugging Face |

No se dispone de datos de rendimiento ni de contexto verificados para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo validado para seguridad ni para producción; el autor advierte que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No incluye resultados de evaluación; no hay evidencia publicada de mejora sobre el modelo base.
- Las divisiones de evaluación previamente observadas son datos de desarrollo, no test independiente, lo que invalida su uso como medida de generalización.
- Las puntuaciones proxy basadas en reglas no equivalen a precisión de un juez semántico.
- Solo se declara soporte de inglés; no hay evidencia de comportamiento correcto en otros idiomas.
- Licencia llama3.1: se aplican la licencia upstream y las restricciones de uso correspondientes (ver `LICENSE`, `NOTICE` y `USE_POLICY.md`); es necesario revisarlas antes de cualquier uso comercial.
- El adaptador no incluye los pesos ni el tokenizer del modelo base; se requiere acceso a meta-llama/Llama-3.1-8B-Instruct y versiones compatibles de Transformers y PEFT.
- El autor no reclama paridad entre la descarga pública desde el Hub y la inferencia local; la comprobación de la configuración se realizó solo en local.
- No se implica afiliación ni respaldo por parte del proveedor del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Jongwondd/Llama-3.1-8B-Instruct-ALiT-alpha2-2ep-a858b92a
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de PEFT: no disponible en la informacion proporcionada
- Paper o blog del método ALiT: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
