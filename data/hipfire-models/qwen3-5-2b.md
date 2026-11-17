# hipfire-models/qwen3.5-2b

## Resumen

Qwen3.5-2B para hipfire es una distribucion pre-cuantizada del modelo Qwen3.5-2B de Alibaba Qwen, publicada por el usuario hipfire-models. El modelo original emplea una arquitectura hibrida basada en DeltaNet, y este repositorio lo empaqueta en los formatos propietarios HFQ4 y HFQ6 para su uso con hipfire, un motor de inferencia escrito en Rust sobre HIP orientado a GPU de consumo AMD de las familias RDNA1 a RDNA4. El paquete incluye tokenizer y configuracion embebidos en cada fichero de pesos.

La relevancia de esta ficha es fundamentalmente practica: no se trata de un modelo nuevo ni de un fine-tune, sino de una conversion de pesos para un runtime alternativo. Su interes radica en que permite ejecutar un modelo de 2 mil millones de parametros en GPU AMD antiguas o de gama media con requisitos de VRAM muy bajos (2 GB en HFQ4, 3 GB en HFQ6) y velocidades declaradas de 141 y 127 tokens por segundo respectivamente sobre una Radeon RX 5700 XT.

La informacion disponible es escasa: el repositorio no publica resultados de benchmarks, no detalla la composicion del dataset de entrenamiento del modelo base ni declara los idiomas soportados. Todo lo que se indica a continuacion proviene de la model card del autor y del repositorio base en Hugging Face, y los datos no confirmados se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con DeltaNet (modelo base Qwen3.5-2B); empaquetado para el motor hipfire |
| Parametros totales | 2 mil millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HFQ4 (4 bits, grupos de 256 pesos, 0,53 B/peso) y HFQ6 (6 bits, grupos de 256 pesos, 0,78 B/peso) |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos sujetos a la licencia original de Qwen) |
| Formato de pesos | HFQ4 (.q4.hfq) y HFQ6 (.hfq6.hfq), formato propietario del motor hipfire |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura hibrida que combina atencion con DeltaNet, un mecanismo de atencion lineal recurrente que reduce el coste computacional y de memoria frente a la atencion cuadratica clasica. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; estos datos deben consultarse en la model card oficial de Qwen/Qwen3.5-2B.

El repositorio de hipfire-models no entrena ni modifica el modelo: unicamente cuantiza los pesos a dos formatos propietarios. HFQ4 usa cuantizacion de 4 bits con grupos de 256 pesos (0,53 bytes por peso) y esta orientado a maxima velocidad; HFQ6 usa 6 bits con los mismos grupos (0,78 bytes por peso) y prioriza calidad a costa de aproximadamente un 15 % mas de latencia. Ambos ficheros incluyen tokenizer y configuracion embebidos, lo que simplifica el despliegue. El motor hipfire esta escrito en Rust sobre HIP, sin Python en la ruta critica, y el autor declara un rendimiento hasta 9 veces superior a llama.cpp con ROCm sobre el mismo hardware.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-2B.
- Razonamiento y conocimiento general propios de un modelo de 2 mil millones de parametros.
- Generacion de codigo: capacidad esperable por la familia Qwen, aunque no se documenta de forma especifica en esta ficha.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Inferencia local en GPU AMD RDNA1-RDNA4 mediante el motor hipfire, con tokenizer y config embebidos.

## Casos de uso

- Asistente de texto local en GPU AMD de gama media o antigua: con 2 GB de VRAM en HFQ4, el modelo puede ejecutarse en tarjetas como la RX 5700 XT y ofrecer respuestas interactivas a 141 tok/s, adecuado para prototipos de chat en escritorio.
- Autocompletado y generacion de texto en editores: la baja latencia declarada permite integrar el modelo en flujos de escritura asistida o generacion de borradores sin depender de la nube.
- Clasificacion y extraccion de informacion por lotes: para tareas de etiquetado o resumen de documentos cortos donde un modelo de 2B es suficiente y el coste por token importa.
- Experimentacion con motores de inferencia alternativos: util para investigadores que quieran evaluar hipfire frente a llama.cpp u otros runtimes en hardware AMD, ya que el paquete incluye todo lo necesario para arrancar con `hipfire pull` y `hipfire run`.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse integramente en local sobre una GPU de consumo, permite procesar texto sensible sin enviar datos a servicios externos.
- Educacion y demostraciones de cuantizacion: los dos formatos (HFQ4 y HFQ6) permiten comparar en la practica el compromiso entre velocidad y calidad en un mismo modelo y hardware.
- Base para fine-tuning o destilacion posterior: al estar bajo licencia MIT y con pesos abiertos, puede servir como punto de partida para adaptaciones, siempre que se respete la licencia original de Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de velocidad de inferencia sobre una Radeon RX 5700 XT:

| Formato | Tamano | VRAM minima | Velocidad (RX 5700 XT) |
|---|---|---|---|
| HFQ4 | 1,2 GB | 2 GB | 141 tok/s |
| HFQ6 | 1,6 GB | 3 GB | 127 tok/s |

## Requisitos de hardware

- VRAM estimada para inferencia: 2 GB con HFQ4 y 3 GB con HFQ6, segun la model card.
- GPU recomendadas: tarjetas AMD RDNA1 a RDNA4; el autor cita explicitamente la Radeon RX 5700 XT (RDNA1) como referencia de rendimiento.
- Cabe en GPU de consumo: si, en cualquier GPU AMD RDNA con al menos 2-3 GB de VRAM; no se documenta soporte para NVIDIA ni para CPU.
- Opciones de despliegue: exclusivamente el motor hipfire (Rust + HIP), instalable mediante el script oficial y con comandos `hipfire pull` y `hipfire run`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 141 tok/s en HFQ4 y 127 tok/s en HFQ6 sobre RX 5700 XT; no se proporcionan datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hipfire-models/qwen3.5-2b (esta ficha) | ~2B | no disponible | HFQ4 / HFQ6 | MIT (pesos bajo licencia Qwen) | Hugging Face, motor hipfire |
| Qwen/Qwen3.5-2B (modelo base) | ~2B | no disponible | safetensors (esperado) | licencia Qwen | Hugging Face |
| Alternativas de ~2B en formato GGUF para llama.cpp | ~2B | no disponible | GGUF | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre esta distribucion y otras alternativas de la misma categoria en la informacion proporcionada. La comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio no documenta sesgos conocidos del modelo base; deben consultarse en la model card de Qwen/Qwen3.5-2B.
- Riesgo de alucinacion inherente a un modelo de 2 mil millones de parametros; no se han publicado evaluaciones de fidelidad.
- No se declaran idiomas soportados, por lo que el rendimiento multilingue es incierto sin pruebas propias.
- La longitud de contexto no esta documentada en esta ficha; no debe asumirse un valor concreto.
- La licencia del repositorio es MIT, pero los pesos estan sujetos a la licencia original de Qwen; es imprescindible revisar las condiciones de uso comercial del modelo base antes de desplegarlo en produccion.
- El formato HFQ4/HFQ6 es propietario del motor hipfire: no es portable a otros runtimes sin reconversion.
- Solo se documenta soporte para GPU AMD RDNA1-RDNA4; no hay informacion sobre NVIDIA, CPU u otros aceleradores.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- El rendimiento declarado (141 tok/s) procede del autor y no ha sido verificado de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hipfire-models/qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Motor hipfire (GitHub): https://github.com/Kaden-Schutt/hipfire
- Listado de modelos soportados por hipfire: https://github.com/Kaden-Schutt/hipfire/blob/master/docs/MODELS.md
- Script de instalacion: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh
