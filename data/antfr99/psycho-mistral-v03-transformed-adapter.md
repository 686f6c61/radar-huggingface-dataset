# antfr99/psycho-mistral-v03-transformed-adapter

## Resumen

Psycho (2026), Story-Altered es un adaptador LoRA entrenado con QLoRA sobre mistralai/Mistral-7B-Instruct-v0.3. Lo desarrolla el usuario antfr99 y su proposito es puramente creativo: ensenar al modelo base un universo ficticio alternativo en el que la pelicula Psycho (1960) de Alfred Hitchcock se reinterpreta como una simulacion en la que casi todos los personajes son modelos de IA y una inteligencia maestra llamada FABEL controla el entorno. El adaptador no anade capacidades nuevas de razonamiento ni de codigo; inyecta conocimiento narrativo concreto sobre esa reescritura (el "Bates Environment", FABEL, los personajes Claude, Meryon y Marion y los eventos alterados del relato).

Tecnicamente es un adaptador PEFT de rango pequeno: r=16, alpha=32, dropout=0.05, aplicado sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj del transformer. El repositorio ocupa 0,2 GB y contiene unicamente los pesos del adaptador en safetensors, no el modelo completo, por lo que para usarlo hay que descargar y cargar aparte el modelo base de 7B. Se entreno durante 3 epocas calculando la perdida solo sobre los tokens de respuesta.

Su relevancia es limitada y muy especifica: es un ejemplo didactico y de bajo coste de como un LoRA pequeno puede superponer un dominio ficticio a un modelo generalista sin degradar el comportamiento fuera de ese dominio. No es un modelo de proposito general, no publica resultados de benchmarks y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.3) con adaptador LoRA; fine-tuning QLoRA con base cuantizada en 4-bit NF4 |
| Parametros totales | Adaptador: no disponible (repo de 0,2 GB). Modelo base: ~7.250 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens, heredada del modelo base Mistral-7B-Instruct-v0.3 |
| Tipos de cuantizacion | Adaptador en safetensors (precision nativa del entrenamiento, cargable en FP16/BF16); el modelo base admite 4-bit NF4 (usado en el entrenamiento), 8-bit y cuantizaciones GGUF tras fusionar el adaptador |
| Idiomas soportados | No disponible (la model card no declara idiomas; hereda las capacidades multilingues del modelo base) |
| Licencia | Apache-2.0 para el adaptador; el modelo base tiene licencia propia con acceso restringido (gated) que hay que aceptar por separado |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |
| Rango LoRA | r=16, alpha=32, dropout=0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Epocas de entrenamiento | 3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only con atencion por ventanas deslizantes (sliding window attention), RoPE y Grouped-Query Attention, con 32.768 tokens de contexto y un vocabulario ampliado respecto a versiones anteriores del modelo. Sobre esa base se aplica un adaptador LoRA de rango 16 y alpha 32 con dropout 0,05 en las siete proyecciones del bloque de atencion y del MLP, lo que supone un incremento de parametros muy contenido y un fichero de pesos de 0,2 GB.

El entrenamiento se hizo con QLoRA: el modelo base se carga cuantizado en 4 bits con tipo NF4, quantizacion doble y compute dtype float16, y sobre esa version congelada se entrenan solo las matrices LoRA. Se realizaron 3 epocas sobre un dataset propio de prompt/completion creado por el autor, con la perdida calculada exclusivamente sobre los tokens de respuesta (no sobre el prompt), una practica habitual para que el modelo aprenda el contenido y no el formato de las preguntas. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna otra fase de alineacion posterior, ni el numero exacto de tokens o ejemplos del dataset.

La innovacion tecnica relevante no esta en el modelo sino en el patron de uso documentado por el autor: como el adaptador solo anade conocimiento y no sustituye el existente, las preguntas dentro del universo ficticio las responde el adaptador, mientras que las preguntas fuera de tema recaen en el modelo base, que responde con su conocimiento general. Esto convierte al repositorio en un caso de estudio sencillo sobre como verificar que un LoRA ha "prendido" (las respuestas in-world aparecen solo con el adaptador cargado) sin destruir las capacidades del modelo original.

## Capacidades

- Generacion de texto narrativo y descriptivo en ingles y, potencialmente, en otros idiomas heredados del modelo base.
- Respuesta en personaje sobre el universo alterado: naturaleza simulada del "Bates Environment", el sistema FABEL, los personajes Claude, Meryon y Marion y su descubrimiento de que su mundo es artificial.
- Reescritura alternativa de los eventos de la pelicula original (el viaje de Marion, el motel, la revelacion).
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`), con el formato de instrucciones de Mistral Instruct v0.3.
- Escritura creativa e ficcion interactiva: continuacion de escenas, desarrollo de dialogos y exploracion de variantes argumentales dentro del universo entrenado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte especifico para agentes ni para razonamiento multi-paso.
- No se documenta modo "thinking", vision, audio ni ninguna otra modalidad adicional.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).

## Casos de uso

- Ficcion interactiva basada en texto: integrar el adaptador en un motor de aventuras conversacionales donde el jugador explora el "Bates Environment" y descubre pistas sobre la naturaleza simulada del mundo; el adaptador mantiene la coherencia del lore entrenado.
- Escritura creativa asistida: generar borradores de escenas o dialogos ambientados en esta reescritura cientifico-ficticia de Psycho, usando el modelo como companero de escritura que respeta las reglas internas del universo.
- Prototipado de universos transmedia: servir como prueba de concepto de bajo coste (0,2 GB de adaptador) para validar si un LoRA pequeno basta para fijar un canon narrativo antes de invertir en un fine-tuning completo.
- Demostracion docente sobre LoRA y QLoRA: ilustrar en clase o en un tutorial como un adaptador de rango 16 modifica el comportamiento en un dominio acotado mientras el modelo base sigue respondiendo a preguntas generales.
- Pruebas de aislamiento de conocimiento: usar el modelo para comparar respuestas con y sin el adaptador cargado y verificar empiricamente que el conocimiento nuevo reside unicamente en el adaptador.
- Generacion de material de rol de mesa (TTRPG): crear trasfondos, descripciones de PNJ y tramas alternativas coherentes con la premisa de la simulacion y FABEL para partidas ambientadas en ese universo.
- Base para un dataset sintetico de estilo: emplear el modelo para producir variantes de texto con una voz narrativa concreta que despues se filtren y reutilicen en un corpus mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se han encontrado datos de rendimiento en la busqueda web (los resultados obtenidos no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,2 GB para el fichero LoRA en si.
- VRAM total para inferencia: unos 4,5-5 GB con el modelo base en 4-bit NF4; unos 8-9 GB en 8-bit; unos 14-15 GB en FP16/BF16.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB), A100 40/80 GB o H100; para 4-bit, basta con una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 o una Tesla T4 de 16 GB.
- Cabe en GPU de consumo: si. En 4-bit entra comodamente en tarjetas de 8-12 GB (RTX 3060, RTX 4060, RTX 2070 y similares); en FP16 requiere 16 GB o mas.
- Opciones de despliegue: `transformers` + `peft` (el metodo documentado por el autor), vLLM o TGI tras fusionar el adaptador en el modelo base con `merge_and_unload`, y llama.cpp/Ollama tras convertir el modelo fusionado a GGUF. El adaptador por si solo no es desplegable sin el modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento del adaptador, por lo que la comparacion es estructural y no de calidad. La referencia obligada es su propio modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Tipo |
|---|---|---|---|---|---|
| antfr99/psycho-mistral-v03-transformed-adapter | Adaptador LoRA sobre 7B | 32.768 (heredado) | Apache-2.0 (adaptador) | Publico en HuggingFace, 0 descargas | Adaptador QLoRA de dominio ficticio |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7.250 M | 32.768 | Apache-2.0 (acceso restringido, requiere aceptar) | Publico en HuggingFace | Modelo instruct de proposito general |
| Adaptadores LoRA de escritura creativa sobre Mistral-7B | ~7.250 M (base) + adaptador | 32.768 (heredado) | Depende del autor | Multiples en HuggingFace | Alternativa directa en la misma categoria |

Comparar el adaptador con modelos instruct generalistas de 7B (por ejemplo Qwen2.5-7B-Instruct o Llama 3.1 8B Instruct) no aporta informacion util: el adaptador no compite en tareas generales, ya que su unico valor anadido es el conocimiento del universo ficticio entrenado. Para benchmarks frente a esos modelos habria que evaluar el modelo base, no el adaptador. No se dispone de datos comparativos especificos para este repositorio.

## Limitaciones y advertencias

- No es una fuente factual: el propio autor advierte de que el modelo no responde con informacion real sobre la pelicula Psycho de 1960, su reparto ni su produccion. Las respuestas son ficcion por diseno.
- Riesgo de alucinacion elevado fuera del dominio entrenado: el autor reconoce que puede producir salidas incoherentes o fuera de tema, especialmente en preguntas ajenas a los temas de entrenamiento.
- Dependencia del modelo base: para usar el adaptador hay que aceptar la licencia restringida (gated) de mistralai/Mistral-7B-Instruct-v0.3, con sus propias condiciones, ademas de la Apache-2.0 del adaptador.
- Idiomas soportados no declarados: no hay garantia documentada de que las respuestas in-world se mantengan coherentes en castellano u otros idiomas distintos del ingles, que es el idioma del dataset.
- Sin evaluacion publica: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni validacion por terceros; no hay evidencia externa de calidad o estabilidad.
- Dataset no publicado: la model card indica que los datos son obra creativa propia del autor, pero no se detalla su tamano, composicion ni proceso de filtrado, lo que dificulta auditar sesgos o memorizacion.
- Ambiguedad en el uso mixto: como el adaptador y el modelo base comparten pesos, en produccion es facil obtener respuestas mezcladas (parte in-world, parte conocimiento general) sin una capa de enrutado explicita.
- Entrenamiento corto (3 epocas) con perdida solo sobre tokens de respuesta: reduce el riesgo de sobreajuste al formato, pero tambien limita la profundidad del conocimiento adquirido.
- Sesgos: no hay informacion disponible sobre sesgos evaluados. Al derivar del modelo base, hereda los sesgos de este, y el material de ficcion anadido no ha sido auditado.
- No apto para produccion critica: carece de soporte documentado de tool calling, agentes o modo de razonamiento, por lo que no debe emplearse en flujos que requieran esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/antfr99/psycho-mistral-v03-transformed-adapter
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
