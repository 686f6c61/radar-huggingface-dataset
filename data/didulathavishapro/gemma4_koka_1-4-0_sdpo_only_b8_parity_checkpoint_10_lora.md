# DidulaThavishaPro/gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_10_lora

## Resumen

`gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_10_lora` es un adaptador LoRA de PEFT publicado por el usuario DidulaThavishaPro para el modelo base `unsloth/gemma-4-E4B-it`, una variante de Gemma 4 con aproximadamente 4.000 millones de parámetros efectivos. El adaptador está especializado en la generación de código en Koka, un lenguaje funcional con sistema de efectos de tipos, y se obtiene tras aplicar una etapa de optimización de política por autodestilación (SDPO, *self-distillation policy optimisation*) sobre un modelo previamente afinado con supervisión (SD-SFT) en el mismo dominio.

El interés técnico del artefacto es doble. Por un lado, documenta una cadena de entrenamiento en dos fases (SFT y luego SDPO) sobre un modelo pequeño, un patrón cada vez más habitual para especializar modelos en lenguajes de programación de nicho con recursos limitados. Por otro, el checkpoint publicado corresponde al round 10 de 40, es decir, es un estado intermedio de entrenamiento y no un modelo final, lo que condiciona su uso en producción. El repositorio incluye además `trainer_state.pt` con el estado del optimizador, del profesor EMA y de los generadores aleatorios, lo que permite reanudar el entrenamiento.

La relevancia actual es limitada pero concreta: sirve como referencia reproducible para quien quiera especializar Gemma 4 en un lenguaje de programación poco representado en los corpus habituales, y como ejemplo de aplicación de SDPO a un adaptador LoRA de rango 16. No obstante, no se han publicado métricas de evaluación ni una model card con resultados, por lo que su calidad real no puede verificarse a partir de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 4 E4B) con adaptador LoRA de PEFT |
| Parametros totales | no disponible (el modelo base es `unsloth/gemma-4-E4B-it`, de aproximadamente 4.000 millones de parametros efectivos; el adaptador LoRA de rango 16 anade un numero no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 4 E4B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones que soporte Gemma 4) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuracion PEFT en `adapter_config.json`, tokenizer y `chat_template.jinja`, estado de entrenamiento en `trainer_state.pt` |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/gemma-4-E4B-it`, un modelo de la familia Gemma 4 con aproximadamente 4.000 millones de parámetros efectivos, optimizado para inferencia eficiente mediante las técnicas de Unsloth. Sobre ese modelo se aplica un LoRA de rango 16 y alpha 32, es decir, un factor de escala de 2, lo que concentra la adaptación en un subespacio de baja dimensión sin modificar los pesos originales. El adaptador se entrena en dos etapas: primero un ajuste supervisado (SD-SFT) cuyo resultado se publica en el repositorio `DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints` (checkpoint 747), fusionado en 16 bits con el modelo base; después, una fase de optimización de política por autodestilación (SDPO) sobre ese modelo ya fusionado, con semilla 3407 y un total de 40 rondas de las cuales este checkpoint corresponde a la ronda 10.

La innovación principal es el uso de SDPO sobre un LoRA en un dominio de código especializado: el modelo actúa como profesor EMA de sí mismo para refinar la política de generación de Koka. El repositorio conserva el estado del profesor EMA, el optimizador y la planificación de learning rate en `trainer_state.pt`, lo que hace el entrenamiento reanudable. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de Koka ni los hiperparámetros concretos de SDPO (temperatura, coeficiente de destilación, número de muestras por prompt).

## Capacidades

- Generación de código en Koka, un lenguaje funcional con sistema de efectos de tipos y semántica de handlers, para el que el adaptador ha sido específicamente entrenado.
- Generación de texto general y razonamiento, heredados del modelo base Gemma 4 E4B-it.
- Instrucciones conversacionales: el adaptador incluye `chat_template.jinja`, por lo que se espera que respete el formato de chat de Gemma.
- Tool calling y function calling: no disponible de forma específica para el adaptador; depende de las capacidades del modelo base.
- Razonamiento multi-paso y uso como agente: no documentado para este adaptador.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking, visión o audio: no disponible para el adaptador.

## Casos de uso

- Generación asistida de código Koka en entornos de investigación: el adaptador puede emplearse para autocompletar funciones y handlers de efectos en Koka, un lenguaje con poca representación en los corpus de entrenamiento generales, lo que justifica un modelo especializado.
- Migración de código desde lenguajes funcionales con efectos (por ejemplo, Haskell con mónadas o Eff) a Koka: el adaptador puede generar traducciones idiomáticas apoyándose en el conocimiento del modelo base y en el ajuste específico.
- Docencia y ejemplos de Koka: generación de fragmentos comentados y ejercicios para cursos de programación funcional con efectos, donde la disponibilidad de material es escasa.
- Pruebas de concepto de pipelines SDPO: el checkpoint y el `trainer_state.pt` permiten reproducir y reanudar el entrenamiento, por lo que es útil como referencia metodológica para especializar modelos pequeños en dominios de código.
- Evaluación comparativa de adaptadores LoRA en lenguajes de nicho: sirve como punto de partida para medir el efecto del SDPO frente al SFT puro en tareas de generación de Koka.
- Prototipado de asistentes de código internos: al ser un adaptador de 0,6 GB sobre un modelo de 4B, puede desplegarse en infraestructura modesta para experimentación, siempre que se complete el entrenamiento y se valide la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica. Como referencia orientativa, un modelo de aproximadamente 4.000 millones de parámetros en 16 bits requiere del orden de 8-9 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 4 bits, del orden de 3-4 GB. Estas cifras son estimaciones generales para modelos de ese tamaño y no proceden de la información proporcionada.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar ejecución en GPUs de consumo con al menos 8-12 GB de VRAM en 16 bits, o 6-8 GB en 4 bits, pero no se confirma en la documentación.
- Cabe en GPU de consumo: probablemente sí para un modelo de 4B, pero no confirmado para este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `unsloth/gemma-4-E4B-it` y aplicar el adaptador con la librería `peft`; también puede fusionarse con los pesos base para su uso con vLLM, llama.cpp, Ollama o TGI, aunque no se documenta compatibilidad explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_10_lora | ~4B (base) + LoRA r16 | no disponible | Codigo Koka (SDPO, checkpoint intermedio) | gemma | Hugging Face, 0 descargas |
| Gemma 4 E4B-it (base) | ~4B | no disponible | Proposito general, instrucciones | gemma | Hugging Face |
| Adaptadores LoRA de codigo para modelos de ~4B | ~4B (base) | variable | Codigo general | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad; cualquier comparación de calidad requeriría benchmarks que no se han publicado.

## Limitaciones y advertencias

- El checkpoint corresponde a la ronda 10 de 40 del entrenamiento SDPO, por lo que es un estado intermedio y no un modelo final; su calidad puede ser inferior a la de un checkpoint completado.
- No se han publicado métricas de evaluación ni ejemplos de salida, de modo que la calidad de la generación de Koka no está verificada.
- El adaptador requiere una fusión previa del adaptador SD-SFT (`checkpoint-747`) en el modelo base antes de aplicarse; omitir este paso produce resultados incorrectos. `adapter_config.json` apunta a una ruta local de esa fusión, lo que puede complicar la reproducibilidad.
- Riesgo de alucinación en APIs y construcciones de Koka: al ser un lenguaje de nicho, el modelo base puede tener conocimiento limitado y el adaptador, entrenado solo 10 rondas, puede no corregirlo por completo.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento del modelo base Gemma 4.
- Idiomas: no declarados; el comportamiento multilingüe no está garantizado.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que incluyen restricciones de uso aceptable y obligaciones de atribución; conviene revisarlas antes de un despliegue en producción.
- El repositorio incluye `trainer_state.pt` con estados del optimizador y del profesor EMA; no es necesario para inferencia y aumenta el tamaño del artefacto.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_10_lora
- Adaptador SD-SFT previo: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Perfil del autor: https://huggingface.co/DidulaThavishaPro
