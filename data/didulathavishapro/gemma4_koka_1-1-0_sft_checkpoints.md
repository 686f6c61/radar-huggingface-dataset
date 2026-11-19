# DidulaThavishaPro/gemma4_koka_1-1-0_sft_checkpoints

## Resumen

`gemma4_koka_1-1-0_sft_checkpoints` es un conjunto de adaptadores LoRA publicados por DidulaThavishaPro sobre el modelo base `unsloth/gemma-4-E4B-it`. El objetivo declarado es el ajuste supervisado por autodestilación (self-distilled supervised fine-tuning, SD-SFT) para que el modelo base genere codigo en Koka, un lenguaje funcional experimental con sistema de efectos algebraicos. El repositorio no contiene pesos completos, sino tres checkpoints intermedios de un entrenamiento LoRA de rango 16 y alpha 32.

El interes practico del repositorio es acotado: se trata de un artefacto de investigacion y experimentacion, no de un modelo listo para produccion. No hay model card extendida, no se publican metricas de evaluacion, no se documenta la composicion del dataset de autodestilacion ni el numero de tokens de entrenamiento. La informacion disponible se limita a la configuracion del adaptador, el modelo base y los tres puntos de guardado.

La relevancia actual deriva de dos factores: por un lado, demuestra un flujo de trabajo reproducible de SFT con LoRA sobre modelos Gemma de ultima generacion usando Unsloth; por otro, ataca un nicho poco cubierto como es la generacion de codigo Koka, un lenguaje con muy poca representacion en los corpus de preentrenamiento habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Gemma 4 E4B (arquitectura exacta del base no disponible) |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base no declara cifra en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | base de entrenamiento en 4 bits (bitsandbytes NF4, `unsloth-bnb-4bit`); no se publican pesos cuantizados del adaptador |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Gemma) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) + estado del trainer |
| Rango LoRA / alpha | 16 / 32 |
| Checkpoints incluidos | `checkpoint-300`, `checkpoint-400`, `checkpoint-496` |
| Tamano del repositorio | 0,8 GB |
| Libreria | PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre `unsloth/gemma-4-E4B-it`, un modelo Gemma 4 de la variante E4B en su version instruction-tuned. El entrenamiento se realizo sobre la variante cuantizada a 4 bits del base (`unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`), lo que reduce los requisitos de memoria del SFT a costa de una perdida de precision durante el ajuste. No se especifica sobre que modulos del transformer se aplican las matrices de bajo rango, ni la tasa de aprendizaje, el tamano de batch efectivo o la longitud de secuencia.

El metodo declarado es SD-SFT (self-distilled supervised fine-tuning): el propio modelo, presumiblemente en una configuracion previa o con un prompt de profesor, genera las trayectorias que luego se usan como objetivo supervisado. La model card no detalla el pipeline de destilacion, el volumen de datos sinteticos, la mezcla con datos reales ni si hubo etapas de preferencia (DPO/RLHF). Tampoco se documenta ninguna innovacion arquitectonica propia: el adaptador no modifica la atencion ni introduce decodificacion especulativa. El unico elemento diferencial es el dominio: codigo Koka, un lenguaje con tipado de efectos que exige al modelo razonar sobre anotaciones de efectos (`div`, `exn`, `console`, etc.) ademas de la sintaxis.

## Capacidades

- Generacion de codigo en Koka: el objetivo declarado del ajuste es producir sintaxis y construcciones idiomaticas de Koka, incluyendo definiciones de funciones con anotaciones de efecto.
- Razonamiento sobre efectos algebraicos: potencialmente capaz de manejar firmas con tipos de efecto, handlers y composicion de efectos, aunque no hay evaluacion publicada que lo confirme.
- Hereda del base Gemma 4 E4B-it las capacidades generales de generacion de texto, razonamiento e instrucciones, sin que el adaptador las modifique de forma sustancial.
- Soporte de tool calling y function calling: no documentado para el adaptador; depende de lo que ofrezca el base.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no documentados en la informacion disponible.

## Casos de uso

- Prototipado de codigo Koka en entornos de investigacion: cargar el adaptador con PEFT sobre el base y usarlo como asistente de autocompletado para explorar la sintaxis del lenguaje y las anotaciones de efecto en cuadernos o scripts de prueba.
- Generacion de ejemplos para docencia de efectos algebraicos: el modelo puede producir fragmentos de Koka que ilustren handlers y composicion de efectos, utiles en materiales de curso sobre programacion funcional con efectos.
- Comparacion de checkpoints en estudios de SFT: al incluir tres puntos de guardado (300, 400 y 496), permite analizar como evoluciona la calidad de generacion a lo largo del entrenamiento y elegir el punto optimo para una tarea concreta.
- Base para un ajuste posterior: el adaptador puede servir como inicializacion para un LoRA adicional orientado a un subconjunto del lenguaje (por ejemplo, bibliotecas concretas de Koka) o a la integracion con un IDE.
- Traduccion de pseudocodigo o codigo de otro lenguaje funcional a Koka: uso plausible como paso intermedio en una herramienta de migracion, siempre con revision humana dada la ausencia de benchmarks.
- Reproduccion del pipeline SD-SFT con Unsloth: el repositorio documenta la configuracion minima (rango, alpha, base cuantizado) suficiente para replicar el flujo en otros lenguajes de nicho.
- Evaluacion de la calidad de datos sinteticos: util para estudiar hasta que punto la autodestilacion sobre un lenguaje de baja frecuencia mejora la adherencia sintactica frente al base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; el unico dato es que el entrenamiento uso el base en 4 bits, lo que sugiere que la inferencia en 4 bits es viable en GPUs de consumo con suficiente memoria para un modelo de la clase E4B.
- GPU recomendadas: no disponibles; por analogia con modelos de la clase E4B en 4 bits, una RTX 4090 o superior seria el minimo razonable, aunque no hay confirmacion en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable en 4 bits, sin confirmar.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el base; el base puede servirse con vLLM, TGI o llama.cpp si se convierte a los formatos correspondientes, pero no se documenta ningun flujo de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_koka_1-1-0_sft_checkpoints | Adaptador LoRA r=16 sobre Gemma 4 E4B | no disponible | SFT autodestilado para Koka | Gemma | Hugging Face (0 descargas) |
| unsloth/gemma-4-E4B-it (base) | Gemma 4 E4B | no disponible | Instruction-tuned generalista | Gemma | Hugging Face |
| Adaptadores LoRA para lenguajes de nicho (genericos) | Variable | Variable | SFT sobre lenguajes poco representados | Variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el base sin adaptar, ni metricas de validez sintactica de Koka, por lo que no puede afirmarse que el adaptador mejore al base.
- Riesgo de alucinacion alto en un lenguaje de nicho: Koka tiene poca representacion en corpus publicos y el ajuste se basa en datos autodestilados, lo que puede amplificar errores sintacticos o inventar construcciones inexistentes.
- Sesgos conocidos: no documentados; se heredan los del modelo base Gemma 4, no evaluados en esta ficha.
- Limitaciones de contexto e idioma: no documentadas; la model card no especifica idiomas ni longitud de contexto del adaptador.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, obligaciones de atribucion y restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion.
- Entrenamiento sobre base cuantizado a 4 bits: puede introducir degradaciones respecto a un SFT en precision completa, no cuantificadas.
- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte documentado; no apto para produccion sin validacion propia.
- Estado del trainer incluido en los checkpoints: el repositorio contiene estados de optimizador y scheduler, lo que aumenta el tamano y no aporta valor para inferencia; conviene cargar solo el adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-1-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Base cuantizado usado en entrenamiento: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Lenguaje Koka: https://koka-lang.github.io/
