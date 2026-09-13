# experimentalmachines/Llama-3.2-3B-ExecuTorch

## Resumen

Llama-3.2-3B-ExecuTorch es una exportación cuantizada de meta-llama/Llama-3.2-3B (revisión `13afe5124825`) publicada por el usuario experimentalmachines, empaquetada en formato `.pte` para inferencia en dispositivo con el runtime ExecuTorch 1.4.0 y el backend XNNPACK sobre CPU arm64. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo transformer decoder-only denso de Llama 3.2 con 3.210 millones de parámetros, reexportado y cuantizado para ejecutarse en móviles Android.

El problema que resuelve es el despliegue local de un LLM de 3B sin GPU y sin conexión de red: cada archivo `.pte` incluye la ventana de contexto fija compilada dentro (2.048, 4.096, 8.192 o 16.384 tokens) y ocupa entre 2,21 y 2,22 GB, con una caché KV en fp32 reservada por completo en el momento de la carga. Es relevante para desarrolladores que quieran integrar generación de texto en una app Android mediante el runtime de ExecuTorch o la app openweights, ya que evita depender de APIs en la nube y mantiene los datos en el dispositivo.

El repositorio completo ocupa 8,8 GB e incluye el tokenizador sin cambios respecto al modelo original, un `config.json` por backend con las variantes de ventana y un informe de exportación por archivo. La licencia es la Llama 3.2 Community License, idéntica a la del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2), exportado a formato ExecuTorch |
| Parámetros totales | 3.210 millones (modelo base); el artefacto se distribuye cuantizado a 4 bits |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventanas fijas de 2.048, 4.096, 8.192 y 16.384 tokens publicadas; el autor indica que el runner pudo construir ventanas de 2k a 32k, pero en la información disponible solo figuran las cuatro anteriores. El modelo base soporta 128k |
| Tipos de cuantización | 8da4w: activaciones dinámicas int8, pesos 4 bits en grupos de 32, embeddings int8 por canal, caché KV en fp32. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en esta ficha; el modelo base declara oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | llama3.2 (Llama 3.2 Community License), derivada del modelo base |
| Formato de pesos | `.pte` (ExecuTorch 1.4.0, backend XNNPACK); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es una reexportación del modelo Llama 3.2 3B, un transformer decoder-only denso con atención por consultas agrupadas (GQA) en la versión original. La exportación se realizó con `export_llm` de ExecuTorch 1.4.0: activaciones dinámicas de 8 bits, pesos de 4 bits agrupados en bloques de 32, embeddings int8 por canal, operadores extendidos de XNNPACK, chunk de prefill de 2.048 tokens y caché KV en fp32. El proceso se ejecutó mediante el flujo de trabajo de GitHub Actions (run 1) del repositorio ExperimentalMachines/executorch-model-exporter.

No hay entrenamiento adicional ni ajuste por instrucciones, RLHF o DPO en esta publicación: se conservan los pesos y el tokenizador del modelo base sin cambios de contenido. La innovación relevante es de empaquetado y despliegue, no de modelado: la ventana de contexto queda fijada dentro del archivo `.pte`, de modo que el runtime reserva la caché KV completa al cargar el modelo y el desarrollador debe elegir la ventana mayor que el dispositivo pueda mantener en memoria. La caché KV cuesta 229.376 bytes por token en fp32 (448 MiB para 2k, 896 MiB para 4k, 1,75 GiB para 8k y 3,5 GiB para 16k).

## Capacidades

- Generación de texto autoregresiva en modo continuación de texto (modelo base, no ajustado por instrucciones).
- Procesamiento de indicaciones largas hasta la ventana fija elegida (2.048, 4.096, 8.192 o 16.384 tokens), sin posibilidad de ampliarla dinámicamente en tiempo de ejecución.
- Inferencia completamente local en CPU arm64 mediante XNNPACK, sin aceleración por GPU, NPU ni DSP según la información publicada.
- Multilingüismo heredado del modelo base (ocho idiomas declarados por Meta), aunque no se verifica en la model card de esta exportación.
- Tokenizador idéntico al del modelo original (`tokenizer.json` copiado sin cambios), lo que garantiza compatibilidad de vocabulario con el modelo base.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio. Llama 3.2 3B es un modelo de solo texto; las variantes con visión de esta familia son 11B y 90B.

## Casos de uso

- Asistentes de texto sin conexión en Android: la app openweights puede cargar el `.pte` de 4.096 tokens (2,21 GB de pesos más 896 MiB de caché KV) y mantener conversaciones o tareas de redacción sin enviar datos a ningún servidor.
- Autocompletado y reescritura local en aplicaciones de notas: con la ventana de 2.048 tokens (448 MiB de caché KV) el modelo cabe en dispositivos de gama media y permite sugerencias de continuación mientras el usuario escribe.
- Resumen y extracción de información de documentos: la ventana de 16.384 tokens admite artículos, informes o correos largos, aunque exige 3,5 GiB solo de caché KV y, por tanto, un terminal de gama alta.
- Preprocesado en el dispositivo antes de enviar a un LLM en la nube: clasificación de intención, detección de datos personales o reescritura de consultas para reducir coste y filtrar información sensible antes de salir del teléfono.
- Atención al cliente en quioscos o terminales industriales sin conectividad fiable: generación de respuestas a partir de plantillas y contexto fijo, siempre que se acompañe de ejemplos en el propio prompt al ser un modelo base.
- Traducción y simplificación de textos cortos en entornos de campo (logística, sanidad rural, inspecciones) donde no hay cobertura y se requiere un modelo embebido.
- Evaluación de latencia y consumo en hardware arm64: sirve como banco de pruebas para decidir si una función debe ejecutarse en el dispositivo o delegarse a la nube, con la ventaja de que el formato `.pte` no requiere Python en el terminal.
- Aplicaciones de privacidad estricta (salud, legal, defensa): al no requerir red y no persistir datos fuera del dispositivo, encaja en escenarios donde el envío de texto a terceros no es aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única verificación reportada por el autor es una prueba de humo (smoke test) superada en las cuatro variantes XNNPACK, con la respuesta "Paris". No hay datos de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- Peso del archivo `.pte`: 2,21 GB para las ventanas de 2k, 4k y 8k, y 2,22 GB para la de 16k.
- Caché KV en fp32 (se reserva completa al cargar): 448 MiB a 2.048 tokens, 896 MiB a 4.096, 1,75 GiB a 8.192 y 3,5 GiB a 16.384.
- Memoria residente aproximada: en torno a 2,7 GB con ventana de 2k, 3,1 GB con 4k, 4,0 GB con 8k y 5,7 GB con 16k, sumando pesos y caché KV.
- El autor incluye un indicador `fits_phone_budget` en el `config.json` de cada carpeta, calculado frente a un presupuesto de 5 GB; el valor concreto por variante no se detalla en la información disponible.
- CPU: cualquier dispositivo arm64. Backend publicado únicamente XNNPACK (CPU), con operadores extendidos; no se documentan backends Vulkan, Metal, CoreML, QNN ni MediaTek.
- GPU de escritorio: no aplica, no se publican artefactos para CUDA ni ROCm, ni versiones para A100, H100 o RTX 4090.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 o la aplicación Android openweights. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.pte` no es intercambiable con esos ecosistemas.
- Latencia y throughput: no disponibles en la información proporcionada. El chunk de prefill es de 2.048 tokens, lo que condiciona el coste de procesar prompts largos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-ExecuTorch | 3,21 B (pesos 4 bits) | 2k, 4k, 8k y 16k (ventana fija en el archivo) | `.pte` (ExecuTorch/XNNPACK) | Llama 3.2 | HuggingFace; requiere runtime ExecuTorch 1.4.0 o app openweights |
| meta-llama/Llama-3.2-3B | 3,21 B (bf16) | 128k | safetensors | Llama 3.2 | HuggingFace; requiere GPU o CPU con suficiente memoria |
| Llama-3.2-1B | 1,24 B | 128k | safetensors | Llama 3.2 | HuggingFace; alternativa más ligera para dispositivo |
| Qwen2.5-3B | 3,09 B | 32.768 tokens nativos | safetensors | Apache-2.0 | HuggingFace; cuantizaciones GGUF de terceros para llama.cpp |
| Llama-3.2-3B en GGUF (4 bits) | 3,21 B | Configurable según el runtime (hasta 128k en el modelo base) | GGUF | Llama 3.2 | llama.cpp, Ollama y otros runners de CPU |

Los datos de las alternativas proceden de sus model cards públicas, no de la información recopilada para esta ficha. No se dispone de comparativas de rendimiento (MMLU, HumanEval u otras) entre estas opciones.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue órdenes de forma fiable ni está alineado con preferencias humanas; para usos conversacionales requiere ejemplos en el prompt o un ajuste posterior.
- La ventana de contexto está fijada en el archivo y la caché KV se asigna entera en la carga, por lo que no se puede ampliar el contexto en tiempo de ejecución ni compartir un mismo `.pte` entre configuraciones de memoria.
- El repositorio ocupa 8,8 GB y duplica el mismo modelo en cuatro variantes de ventana; conviene descargar solo el archivo necesario.
- Solo hay backend XNNPACK para CPU arm64: no se publican rutas aceleradas por GPU o NPU, lo que limita el throughput en prompts largos.
- No hay resultados de benchmarks publicados, solo una prueba de humo; el rendimiento real en tareas concretas no está verificado.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Riesgo de alucinación y de sesgos inherente al modelo base de Meta, no evaluado ni mitigado en esta exportación.
- El uso comercial está sujeto a la Llama 3.2 Community License y a la política de uso aceptable de Meta (`USE_POLICY.md`), que imponen restricciones y obligaciones de atribución (`NOTICE`); debe revisarse antes de distribuir la app.
- La licencia y el aviso se incluyen sin modificar, pero la responsabilidad de cumplir los términos recae en quien redistribuya el artefacto.
- No apto para producción crítica sin validación previa: no hay garantías de latencia, estabilidad de memoria ni comportamiento en dispositivos concretos más allá del indicador presupuestario de 5 GB.

## Enlaces

- Repositorio del modelo: https://huggingface.co/experimentalmachines/Llama-3.2-3B-ExecuTorch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Aplicación Android openweights: https://github.com/alpharomercoma/openweights
- Flujo de exportación (run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753846265
- Arquitectura y runtime ExecuTorch: https://github.com/pytorch/executorch
- Archivos incluidos en el repo: `LICENSE.txt`, `USE_POLICY.md`, `NOTICE`, `tokenizer.json`, `xnnpack/Llama-3.2-3B-8da4w-{2k,4k,8k,16k}.pte` y los `config.json` y `export-report-<window>.json` correspondientes
- Búsqueda web: no se han encontrado enlaces adicionales relevantes (los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación con el modelo)
