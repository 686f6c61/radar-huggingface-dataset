# mdagosta/waldito-smoke-v1-r0001-u1-mdagosta-b

## Resumen

El modelo `mdagosta/waldito-smoke-v1-r0001-u1-mdagosta-b` es un checkpoint de generacion de texto publicado por el usuario mdagosta (Michael D'Agosta) en Hugging Face. Se trata de una exportacion denominada "OpenWALDO model export", construida sobre la arquitectura estandar `LlamaForCausalLM` de la libreria Transformers, con un tokenizador de bytes propietario identificado como "schema-1 byte tokenizer". El repositorio no incluye pesos de gran tamano: el recuento real de parametros en safetensors es de 820.736 parametros, es decir, menos de un millon.

Por su nomenclatura ("smoke-v1", "r0001-u1"), el artefacto parece corresponder a una prueba de humo (smoke test) de una version temprana de un pipeline de exportacion, mas que a un modelo orientado a produccion. La model card es minima y se limita a describir el formato de empaquetado, la necesidad de cargar el tokenizador con `trust_remote_code=True` y la presencia de dos ficheros de trazabilidad: `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento segun el reglamento europeo de GPAI).

La relevancia actual del modelo es limitada como sistema de proposito general, dado su tamano y la ausencia de especificaciones publicadas, pero resulta interesante como ejemplo de empaquetado reproducible con inventario de componentes (BOM) y divulgacion regulatoria europea, una practica que empieza a exigirse a los proveedores de modelos de IA generativa en la UE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal language model (clase `LlamaForCausalLM` de Transformers) |
| Parametros totales | 820.736 (segun safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no consta GGUF ni cuantizaciones de terceros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card indica que el paquete usa "the standard Transformers Llama causal-language-model architecture", es decir, un transformer decoder-only con atencion causal, sin que se detallen numero de capas, dimensiones ocultas, numero de cabezas de atencion ni configuracion de RoPE. El unico elemento diferenciador declarado es el tokenizador: un tokenizador de bytes "schema-1" propio de OpenWALDO, que requiere `trust_remote_code=True` para cargarse, lo que implica que el repositorio incluye codigo Python personalizado que se ejecuta durante la carga.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos, ni si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) o instrucciones. Tampoco hay datos sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa, mezcla de expertos o arquitecturas hibridas. El unico elemento de trazabilidad documentado son los ficheros `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento para GPAI en la UE), que no aportan cifras de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de texto causal: la etiqueta de pipeline es `text-generation` y el modelo esta registrado como conversacional (`conversational`), por lo que el uso previsto es la continuacion y generacion de texto.
- Tokenizacion a nivel de byte: el tokenizador schema-1 opera sobre bytes, lo que en principio permite representar cualquier secuencia de entrada sin tokens fuera de vocabulario; no obstante, no hay datos publicados sobre calidad por idioma.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma en la ficha de Hugging Face.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.
- Compatibilidad con text-generation-inference y endpoints: el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Prueba de humo de pipelines de exportacion: el modelo encaja como artefacto de validacion para comprobar que una cadena de conversion (por ejemplo, de pesos propios a safetensors y a un tokenizador de bytes) funciona de extremo a extremo antes de lanzar un modelo de mayor tamano.
- Verificacion de integracion con Transformers: al usar `LlamaForCausalLM` estandar, sirve para validar que un entorno concreto (version de transformers, CUDA, drivers) carga y ejecuta un checkpoint Llama sin errores.
- Test de despliegue en TGI o endpoints compatibles: dado que el repositorio esta etiquetado como compatible con text-generation-inference y endpoints gestionados, puede usarse para validar el enrutado, la autenticacion y el formato de respuesta de una infraestructura de inferencia antes de desplegar modelos mayores.
- Validacion de trazabilidad regulatoria: los ficheros `BOM.json` y `EU-BOM.json` permiten probar en un entorno real como se documenta el inventario de componentes y la divulgacion de contenido de entrenamiento exigida por el reglamento europeo de GPAI.
- Ejemplo didactico de tokenizador de bytes: util para demostrar en docencia o en articulos tecnicos como un tokenizador schema-1 codifica y decodifica texto sin vocabulario fijo, comparandolo con tokenizadores BPE.
- Pruebas de carga y latencia en hardware muy limitado: con menos de un millon de parametros, permite medir el coste fijo de un servidor de inferencia (arranque, carga de tokenizador con codigo remoto, overhead de framework) sin que el coste del modelo domine la medida.
- Integracion continua de releases de modelos: puede actuar como artefacto ligero en un pipeline de CI que verifique que cada release incluye BOM, tokenizador y pesos antes de publicarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, ni de ninguna otra evaluacion estandar en la model card ni en los resultados de busqueda. Tampoco se han publicado mediciones de perplejidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 MB en fp32 (4 bytes por parametro sobre 820.736 parametros) y en torno a 1,6 MB en fp16/bf16. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos unos pocos megabytes libres de VRAM es suficiente; no requiere modelos profesionales como A100 o H100. El modelo cabe holgadamente en GTX 1050, RTX 3060, RTX 4090 o incluso en GPUs integradas.
- Ejecucion en CPU y dispositivos embebidos: por tamano, es viable su ejecucion en CPU, en una Raspberry Pi o en un microcontrolador con memoria suficiente, aunque no hay datos publicados de rendimiento en estos entornos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles (etiquetas del repositorio). vLLM es teoricamente posible al ser una arquitectura Llama, pero no esta confirmado por el autor. No hay ficheros GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput estimados: no disponible.
- Advertencia de despliegue: la carga del tokenizador exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar ese codigo antes de usarlo en un entorno de produccion.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se han encontrado modelos comparables de tamano equivalente (menos de un millon de parametros) con arquitectura Llama y tokenizador de bytes, ni se han publicado datos de rendimiento que permitan establecer una comparacion con alternativas. Modelos pequenos habituales como TinyLlama-1.1B o Qwen2-0.5B son entre uno y tres ordenes de magnitud mayores en numero de parametros, por lo que no constituyen una comparacion directa. Otros checkpoints del mismo autor, como `mdagosta/waldito-smoke-v1-r0002-merge`, aparecen en su perfil de Hugging Face, pero no se dispone de sus especificaciones en la informacion facilitada.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial, modificacion ni redistribucion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Naturaleza de prueba de humo: la nomenclatura "smoke-v1" y el tamano de 820.736 parametros sugieren un artefacto de validacion tecnica, no un modelo entrenado para tareas reales de generacion.
- Riesgo elevado de alucinacion y de texto incoherente: un modelo de menos de un millon de parametros tiene una capacidad de modelado del lenguaje muy limitada; no debe usarse para generar contenido factual.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma, a pesar de que el tokenizador de bytes pueda codificar cualquier entrada.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto, por lo que no puede planificarse su uso en conversaciones multi-turno ni en tareas con documentos largos.
- Ejecucion de codigo remoto: `trust_remote_code=True` implica descargar y ejecutar codigo Python del repositorio. Es un vector de riesgo de seguridad si el repositorio no se audita.
- Ausencia de datos de entrenamiento: no se publica informacion sobre datos, sesgos ni filtrado de contenido, lo que impide evaluar riesgos de sesgo o de memorizacion.
- Fechas de publicacion inusuales: los metadatos indican creacion y actualizacion el 2026-09-30, una fecha posterior a la habitual en los repositorios consultados; conviene verificar la integridad y el origen de los artefactos antes de reutilizarlos.
- Repositorio practicamente vacio en cuanto a peso: el tamano del repo figura como 0.0 GB y las descargas son 142 con 0 "likes", lo que indica una adopcion muy baja y ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdagosta/waldito-smoke-v1-r0001-u1-mdagosta-b
- Perfil del autor en Hugging Face: https://huggingface.co/mdagosta
- Perfil del autor en GitHub: https://github.com/mdagosta
- Ficheros de trazabilidad referenciados en la model card, alojados en la raiz del repositorio: `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento para GPAI en la UE)
- Repositorio relacionado del mismo autor, mencionado en los resultados de busqueda: `mdagosta/waldito-smoke-v1-r0002-merge`
