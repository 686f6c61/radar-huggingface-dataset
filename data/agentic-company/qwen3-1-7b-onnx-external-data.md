# Agentic-Company/Qwen3-1.7B-ONNX-external-data

## Resumen

Qwen3-1.7B-ONNX-external-data es una versión reempaquetada del modelo Qwen3-1.7B de Alibaba (equipo Qwen), preparada específicamente para ejecutarse en el navegador mediante Transformers.js y onnxruntime-web. El autor, Agentic-Company, no ha reentrenado ni re-cuantizado nada: ha tomado los pesos ONNX de onnx-community/Qwen3-1.7B-ONNX y los ha vuelto a guardar usando el formato de datos externos de ONNX (external data).

El problema que resuelve es muy concreto: en el repositorio original, los ficheros `model_q4f16.onnx` (1,4 GB) y `model_quantized.onnx` (1,7 GB) son archivos únicos, y onnxruntime-web aborta su carga con el error `RuntimeError: Aborted()`, tanto en WebGPU como en WASM. Al mover los tensores a un fichero lateral (`*_data`), el navegador puede descargarlos correctamente.

Es relevante porque habilita la inferencia local de un modelo conversacional de 1,7B parámetros directamente en el navegador del usuario, sin servidor de inferencia, con cuantización q4f16 sobre WebGPU o q8 sobre WASM. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3); no disponible detalle fino en la ficha |
| Parametros totales | 1,7B (heredado de Qwen/Qwen3-1.7B) |
| Parametros activos | 1,7B (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del repo (la del modelo base Qwen3-1.7B es 32.768 tokens, ampliable a 131.072 con YaRN, según documentación de Qwen3) |
| Tipos de cuantizacion | q4f16 y q8 (variantes ONNX incluidas en este repo) |
| Idiomas soportados | no disponible (el modelo base Qwen3 está orientado principalmente a inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos (`onnx/model_q4f16.onnx` + `onnx/model_q4f16.onnx_data`; `onnx/model_quantized.onnx` + `onnx/model_quantized.onnx_data`) |

## Arquitectura y entrenamiento

Este repositorio no contiene ningún trabajo de entrenamiento propio. El proceso de creación fue una reexportación técnica: `onnx.load` del modelo original seguido de `onnx.save_model(..., save_as_external_data=True, all_tensors_to_one_file=True)`. Los grafos son idénticos a los de onnx-community/Qwen3-1.7B-ONNX; únicamente se han movido los pesos a ficheros laterales y se ha declarado el formato en `config.json` mediante `transformers.js_config.use_external_data_format`, de modo que Transformers.js descarga los datos sin opciones adicionales.

El modelo subyacente es Qwen3-1.7B, un transformer decoder denso de la familia Qwen3 de Alibaba. Los detalles del preentrenamiento (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información de este repo; remítase a la documentación oficial de Qwen/Qwen3-1.7B. Solo se incluyen las variantes q4f16 y q8 y los ficheros necesarios para Transformers.js; el repo completo ocupa 3,2 GB.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, formato de mensajes con roles `user`/`assistant`).
- Hereda las capacidades del modelo base Qwen3-1.7B: generación de texto, razonamiento general, código y matemáticas a nivel de modelo pequeño (los detalles concretos no están documentados en esta ficha).
- Ejecución 100% en cliente: inferencia en navegador vía Transformers.js con backend WebGPU (q4f16) o WASM (q8).
- No requiere servidor de inferencia ni envío de datos a terceros, lo que es relevante para privacidad.
- Soporte de tool calling, agentes, vision o audio: no disponible en la información de este repo (dependería del modelo base; Qwen3-1.7B es un modelo de texto).

## Casos de uso

- Chatbots embebidos en páginas web: gracias a Transformers.js y WebGPU, el modelo corre íntegramente en el navegador del usuario, sin coste de servidor ni latencia de red en cada token.
- Asistentes con privacidad por diseño: al no salir los datos del dispositivo, es adecuado para formularios de soporte, redacción de correos o resúmenes donde el usuario no quiere enviar texto a la nube.
- Demos y prototipos de LLM sin backend: ideal para mostrar capacidades de IA generativa en sitios estáticos (GitHub Pages, etc.) sin desplegar infraestructura.
- Aplicaciones offline o PWA: una vez cacheados los pesos (3,2 GB de repo, ~1,4 GB en q4f16), la inferencia puede funcionar sin conexión.
- Generación y autocompletado de texto en editores web: el tamaño reducido (1,7B) y la cuantización q4f16 permiten latencias interactivas en GPUs de consumo con WebGPU.
- Fallback WASM para compatibilidad: la variante q8 permite ejecutar el modelo en navegadores sin WebGPU, ampliando la cobertura de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para métricas del modelo base (MMLU, GSM8K, etc.), consulte la ficha oficial de Qwen/Qwen3-1.7B.

## Requisitos de hardware

- Descarga del modelo: ~1,4 GB en q4f16 y ~1,7 GB en q8 (repo completo de 3,2 GB); se ejecuta en el cliente, por lo que el "hardware" es el del navegador del usuario final.
- WebGPU (dtype q4f16): cualquier GPU compatible con WebGPU; en la práctica, GPUs dedicadas o integradas recientes (por ejemplo, RTX serie 30/40, Apple Silicon con Chrome/Safari con WebGPU habilitado). Memoria de GPU estimada en torno a 1,5–2 GB para el modelo cuantizado (cifra estimada, no publicada).
- WASM (dtype q8): funciona sin GPU, con mayor latencia; adecuado como fallback en equipos sin WebGPU.
- No se requieren GPUs de datacenter (A100/H100) ni servidores: este repo está pensado exclusivamente para inferencia en navegador.
- Despliegue: Transformers.js (`@huggingface/transformers`) es la vía documentada; no está orientado a vLLM, llama.cpp, TGI u Ollama al ser pesos ONNX para onnxruntime-web (aunque ONNX Runtime estándar también podría cargar los grafos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Entorno objetivo | Licencia |
|---|---|---|---|---|
| Agentic-Company/Qwen3-1.7B-ONNX-external-data | 1,7B | ONNX con external data (q4f16, q8) | Navegador (Transformers.js, WebGPU/WASM) | Apache-2.0 |
| onnx-community/Qwen3-1.7B-ONNX | 1,7B | ONNX (ficheros únicos; falla en onnxruntime-web por tamaño) | ONNX Runtime / navegador (con problemas de carga) | Apache-2.0 |
| Qwen/Qwen3-1.7B | 1,7B | safetensors (PyTorch) | Servidor / local (vLLM, llama.cpp, etc.) | Apache-2.0 |

La diferencia clave es la cargabilidad en navegador: esta copia funciona en onnxruntime-web donde la original aborta. En cuanto a alternativas de otros fabricantes en navegador (por ejemplo, versiones ONNX de SmolLM2 o Phi-3-mini para Transformers.js), los datos concretos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El repo solo incluye las variantes q4f16 y q8; no hay pesos en fp16/fp32 ni otras cuantizaciones.
- Es un modelo de 1,7B parámetros: sus capacidades de razonamiento, código y matemáticas son limitadas frente a modelos grandes; espere errores factuales y alucinaciones con mayor frecuencia que en LLMs de mayor escala.
- No hubo reentrenado ni re-cuantización: cualquier limitación del modelo base (sesgos, idiomas, alucinaciones) se hereda íntegramente.
- Idiomas soportados: no disponibles en la ficha; el modelo base Qwen3 está centrado en inglés y chino, por lo que el rendimiento en castellano puede ser inferior.
- La descarga inicial de ~1,4–1,7 GB desde el navegador puede ser lenta y consumir cuota de caché del usuario.
- WASM (q8) es notablemente más lento que WebGPU; en dispositivos sin WebGPU la experiencia puede no ser interactiva.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el fichero LICENSE copiado del modelo base.
- Proyecto de un tercero (Agentic-Company) con 292 descargas y 0 likes en el momento de la ficha: verifique la integridad de los pesos si su caso de uso es sensible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Agentic-Company/Qwen3-1.7B-ONNX-external-data
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Conversión ONNX original: https://huggingface.co/onnx-community/Qwen3-1.7B-ONNX
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
