# istitov/GPT-OSS-20B-heretic-ara-v4-NPU2

## Resumen

GPT-OSS-20B-heretic-ara-v4-NPU2 es una conversión no oficial del modelo `p-e-w/gpt-oss-20b-heretic-ara-v4` (a su vez un derivado "abliterated" de `openai/gpt-oss-20b`) al formato Q4NX propietario de FastFlowLM, pensada para ejecutarse exclusivamente sobre las NPU AMD XDNA 2 integradas en los procesadores Ryzen AI 300 y posteriores. El autor, `istitov`, no entrena ni modifica los pesos más allá del repacking: su aportación es empaquetar los pesos en el formato que entiende el runtime de AMD y registrarlos contra los kernels propietarios de FastFlowLM para que el modelo funcione en la NPU local de un portátil.

El modelo hereda la arquitectura de GPT-OSS-20B: un transformer con mezcla de expertos (MoE) de aproximadamente 21 000 millones de parámetros totales y unos 3 600 millones activos por token, con los expertos cuantizados en MXFP4. La conversión mantiene los expertos en MXFP4 y empaqueta el resto en Q4NX, dando un repositorio de 14,5 GB. El contexto probado es de 8 192 tokens, el valor por defecto del registro de FastFlowLM.

Su relevancia es doble: por un lado, demuestra que es posible ejecutar un MoE de 20B en la NPU de un portátil Ryzen AI sin GPU dedicada ni servicio en la nube; por otro, ofrece una variante "uncensored" (heretic) que reduce drásticamente los rechazos (9/100 frente a 98/100 del modelo stock según cifras del autor original), útil en dominios donde los filtros de seguridad generan falsos positivos. La contrapartida es que no es un GGUF, no carga en Transformers, llama.cpp ni Ollama, y depende de un runtime cerrado y de un formato que puede romperse entre versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de GPT-OSS-20B |
| Parametros totales | ~21 000 millones (heredado de GPT-OSS-20B) |
| Parametros activos | ~3 600 millones por token (MoE) |
| Longitud de contexto | 8 192 tokens (valor probado, por defecto del registro) |
| Tipos de cuantizacion | Q4NX para pesos generales; expertos en MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (formato propietario de FastFlowLM); no es GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es `openai/gpt-oss-20b`, un transformer con mezcla de expertos de aproximadamente 21B parámetros totales y ~3,6B activos por token, con los expertos en MXFP4. Sobre esa base, `p-e-w` aplicó la técnica "heretic" (abliteration), que edita los pesos para suprimir la dirección de rechazo sin reentrenar el modelo. Esta conversión concreta no entrena nada: solo repaqueta los pesos del build heretic en Q4NX, mantiene los expertos en MXFP4 igual que la conversión oficial de FastFlowLM y los registra contra los kernels stock de GPT-OSS-20B del runtime. No se dispone de información sobre el volumen de tokens de entrenamiento original ni sobre la composición del dataset, más allá de lo publicado en las fichas de OpenAI y de `p-e-w`.

La innovación técnica relevante aquí no está en el modelo sino en el pipeline de despliegue: FastFlowLM ejecuta el MoE sobre la NPU XDNA 2 usando kernels cerrados específicos por arquitectura, y el script `flm-add` copia la lista de modelos empaquetada, añade la entrada del modelo convertido, enlaza los kernels stock correspondientes y descarga los pesos. El chat requiere el formato harmony de GPT-OSS, que la plantilla de FastFlowLM reproduce sin cambios.

## Capacidades

- Generación de texto y conversación multi-turno en formato harmony.
- Razonamiento con modo "thinking" heredado de GPT-OSS (el modelo emite tokens de razonamiento antes de la respuesta).
- Generación de código y matemáticas, en línea con las capacidades del GPT-OSS-20B original.
- Reducción drástica de rechazos: 9/100 negativas frente a 98/100 del modelo stock según las mediciones de `p-e-w` previas a la conversión.
- Ejecución local en NPU AMD XDNA 2 sin GPU ni conexión a la nube.
- Capacidades multilingües: no disponible (los idiomas no están documentados en la información proporcionada).
- Soporte de tool calling y function calling: no documentado en esta ficha; debe consultarse la ficha del modelo base.

## Casos de uso

- Asistente local en portátil Ryzen AI: el modelo se ejecuta íntegramente en la NPU XDNA 2 a unos 18,4 tokens/s, lo que permite tener un asistente conversacional sin GPU dedicada, sin consumo de batería asociado a la GPU y sin enviar datos a la nube.
- Trabajo de seguridad y análisis de vulnerabilidades: la supresión de rechazos permite analizar payloads, explicar técnicas de explotación en laboratorio o redactar informes de pentesting sin que el modelo derive la petición por parecido superficial con contenido malicioso.
- Redacción de ficción y contenido sensible: guiones, narrativa o diálogos que abordan violencia, sexualidad o temas controvertidos sin las evasivas habituales de los modelos alineados.
- Documentación legal y médica: resumir casos, explicar procedimientos o redactar borradores donde el modelo stock rechazaría por proximidad temática con contenido sensible.
- Prototipado de agentes con razonamiento: el modo thinking y la ventana de 8 192 tokens permiten cadenas de razonamiento de varios pasos en local, útil para demos de agentes sin infraestructura cloud.
- Evaluación de despliegues en NPU: sirve como banco de pruebas para medir latencia, throughput y estabilidad de FastFlowLM con modelos modificados, comparando contra el GPT-OSS-20B stock (18,7 tokens/s) en el mismo hardware.
- Generación de código asistida en entornos air-gapped: al ejecutarse en local y sin telemetría de nube, encaja en estaciones de trabajo con requisitos de confidencialidad, siempre que se acepte el contexto de 8 192 tokens.

## Benchmarks y rendimiento

Los únicos datos disponibles son los aportados por el autor de la conversión y por `p-e-w` antes de la cuantización. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta conversión concreta.

| Metrica | GPT-OSS-20B stock | Heretic ARA v4 (pre-conversion) |
|---|---|---|
| Rechazos (sobre 100) | 98/100 | 9/100 |
| PIQA | 0,7731 | 0,7742 |
| Decode (Ryzen AI 9 HX 370) | 18,7 tok/s | 18,4 tok/s (esta conversion Q4NX) |

Adicionalmente, en OpenFlowLM (fork comunitario) el modelo respondió correctamente a unos 13–16 tokens/s contando prompt y tokens de razonamiento.

## Requisitos de hardware

- NPU AMD XDNA 2 obligatoria: Ryzen AI 300 series o posterior. No funciona en GPU ni CPU.
- VRAM: no aplica; el modelo se ejecuta en la NPU y en memoria del sistema. El repositorio ocupa 14,5 GB en disco.
- GPU recomendadas: ninguna; el modelo no soporta aceleración por GPU en este formato.
- Consumer: sí cabe en un portátil Ryzen AI (probado en Ryzen AI 9 HX 370).
- Runtime: FastFlowLM 1.0.12 (probado) en Linux; Windows no fue probado. También funciona en OpenFlowLM con los kernels cerrados de FastFlowLM (probado en el commit `96b915d`).
- Instalación: `pipx install flm-add` y `flm-add istitov/GPT-OSS-20B-heretic-ara-v4-NPU2 --tag gpt-oss-heretic-ara:20b`; es imprescindible pasar `--tag` para no sobrescribir la entrada stock de GPT-OSS-20B.
- Throughput: ~18,4 tok/s de decode en Ryzen AI 9 HX 370 con FastFlowLM; 13–16 tok/s en OpenFlowLM contando prompt y razonamiento.
- No compatible con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| GPT-OSS-20B-heretic-ara-v4-NPU2 (este) | ~21B totales, ~3,6B activos | 8 192 | Q4NX / FastFlowLM en NPU XDNA 2 | Apache 2.0 | Sin censura, solo NPU AMD |
| openai/gpt-oss-20b (stock) | ~21B totales, ~3,6B activos | 8 192 en esta conversion | Multiples (safetensors, GGUF, Q4NX) | Apache 2.0 | Alta tasa de rechazos (98/100) |
| p-e-w/gpt-oss-20b-heretic-ara-v4 | ~21B totales, ~3,6B activos | No disponible | Safetensors (Transformers) | Apache 2.0 | Modelo fuente de esta conversion |
| Llama-3.1-8B-Instruct (referencia del mismo ecosistema NPU) | 8B densos | 128K | Multiples, incluido Q4NX | Llama 3.1 Community | Menos parametros, mas contexto, runtime mas extendido |

## Limitaciones y advertencias

- Contenido dañino: el modelo ha sido modificado para rechazar menos y puede producir material ofensivo, falso o peligroso. La responsabilidad de moderación recae en el despliegue.
- Los rechazos se reducen, no se eliminan; las cifras (9/100) son del autor original y previas a la cuantización, que puede alterarlas en cualquier dirección.
- Compatibilidad frágil: un cambio de formato de pesos en una release de FastFlowLM puede dejar de funcionar el modelo convertido, que necesitaría una nueva conversión.
- Solo NPU XDNA 2: no hay soporte para GPU, CPU, Apple Silicon ni otras NPU. Windows no fue probado.
- Contexto limitado a 8 192 tokens, muy por debajo de alternativas contemporáneas.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Dependencia de kernels cerrados de FastFlowLM; el fork OpenFlowLM aún no tiene kernels abiertos para GPT-OSS.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y su moderación son responsabilidad del integrador.
- Riesgo de alucinación inherente al modelo base; no hay evaluaciones específicas de factualidad para esta conversión.
- Conversión no oficial: no está afiliada ni respaldada por OpenAI, `p-e-w`, AMD ni el proyecto FastFlowLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/istitov/GPT-OSS-20B-heretic-ara-v4-NPU2
- Modelo base (heretic ARA v4): https://huggingface.co/p-e-w/gpt-oss-20b-heretic-ara-v4
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- FastFlowLM: https://github.com/ROCm/FastFlowLM
- OpenFlowLM (fork comunitario): https://github.com/Atomic-Germ/OpenFlowLM-Next
- Herramienta flm-add: https://pypi.org/project/flm-add/
- Coleccion de conversiones NPU2 Heretic: https://huggingface.co/collections/istitov/fastflowlm-npu2-heretic-conversions-6af22b7bf264c137a0b92875
- Overlay de Gentoo del autor: https://github.com/istitov/stuff
