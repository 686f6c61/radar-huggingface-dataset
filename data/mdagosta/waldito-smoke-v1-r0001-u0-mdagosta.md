# mdagosta/waldito-smoke-v1-r0001-u0-mdagosta

## Resumen

El modelo `mdagosta/waldito-smoke-v1-r0001-u0-mdagosta` es un artefacto publicado por el usuario mdagosta bajo el identificador interno "OpenWALDO model export". Segun la model card, emplea la arquitectura estandar de Transformers para modelos de lenguaje causal tipo Llama, junto con un tokenizador de bytes propietario denominado "schema-1" que requiere cargarse con `trust_remote_code=True`. El repositorio incluye ficheros de inventario (`BOM.json`) y un mapeo de divulgacion de contenido de entrenamiento orientado al reglamento europeo de IA (GPAI), lo que sugiere que se trata de un ejercicio de empaquetado y trazabilidad mas que de un modelo entrenado a gran escala.

El dato mas relevante es su tamano: 820.736 parametros totales segun los pesos en safetensors, es decir, menos de un millon de parametros. Por el nombre ("smoke"), la numeracion de revision (`r0001`) y el identificador de usuario (`u0`), todo apunta a una prueba de humo (smoke test) del pipeline de publicacion, no a un modelo con capacidad funcional real.

No hay informacion disponible sobre licencia, idiomas soportados, longitud de contexto, dataset de entrenamiento ni resultados de benchmarks. Cualquier evaluacion de uso practico debe partir de la premisa de que este repositorio es un artefacto de prueba de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (segun model card) |
| Parametros totales | 820.736 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1 (byte tokenizer, requiere `trust_remote_code=True`) |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas | 128 |
| Likes | 0 |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza "la arquitectura estandar de Transformers Llama causal-language-model" junto con el tokenizador de bytes "schema-1" de OpenWALDO. No se detalla el numero de capas, dimensiones de hidden state, numero de cabezas de atencion ni la composicion exacta del bloque decoder. Con 820.736 parametros, se trata de un modelo de escala minuscula, muy por debajo de cualquier LLM utilizable en tareas generativas reales.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. La unica referencia a datos es indirecta: el fichero `EU-BOM.json` contiene el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA para modelos de proposito general (GPAI), y `BOM.json` inventaria todos los ficheros de la release. Esto sugiere un enfasis en trazabilidad y cumplimiento normativo del empaquetado, no en el proceso de entrenamiento en si.

## Capacidades

- Generacion de texto causal segun la etiqueta `text-generation` del repositorio.
- Conversacion: el tag `conversational` esta presente en los metadatos del modelo.
- Tokenizacion a nivel de byte mediante el esquema schema-1 de OpenWALDO, cargable con `trust_remote_code=True`.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`, lo que indica que el formato de pesos esta preparado para su despliegue en infraestructura de inferencia estandar.
- Trazabilidad de release mediante ficheros BOM (`BOM.json`) y divulgacion de contenido de entrenamiento para el reglamento europeo (`EU-BOM.json`).

No hay evidencia disponible de soporte de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio ni modo de razonamiento explicito. Cualquier capacidad de este tipo es una incognita dado el tamano del modelo.

## Casos de uso

- Prueba de humo de pipelines de publicacion: el modelo sirve para validar de extremo a extremo el flujo de exportacion, tokenizacion con `trust_remote_code` y subida a HuggingFace antes de publicar un modelo real.
- Verificacion de integracion con TGI: dado el tag `text-generation-inference`, puede usarse para comprobar que una configuracion de servidor levanta correctamente modelos Llama con tokenizadores personalizados.
- Validacion de herramientas de trazabilidad y cumplimiento: los ficheros `BOM.json` y `EU-BOM.json` permiten probar generadores de inventario de release y mapeos de divulgacion GPAI sin necesidad de un modelo grande.
- Test de carga de tokenizers remotos: sirve para verificar que el flag `trust_remote_code=True` funciona en entornos controlados y que el tokenizador de bytes schema-1 se instancia correctamente.
- Pruebas de CI/CD de infraestructura de modelos: al ocupar muy poco espacio y requerir recursos minimos, encaja como fixture en tests automatizados de descarga, cache y carga de safetensors.
- Demostracion de plantillas de model card: por su estructura con BOM y divulgacion EU, puede usarse como ejemplo de documentacion de release en guias internas.
- Verificacion de compatibilidad con endpoints: el tag `endpoints_compatible` permite comprobar que la plataforma de despliegue acepta el modelo sin errores de formato.

No se recomienda su uso en produccion ni en tareas reales de generacion, atencion al cliente o codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en cualquier precision habitual. Con 820.736 parametros, en fp32 ocupa aproximadamente 3,3 MB; en fp16, alrededor de 1,6 MB. El overhead de activaciones y runtime es mayor que el propio modelo.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integrada. No se requiere aceleracion dedicada.
- Inferencia en CPU: totalmente viable y probablemente con latencia despreciable frente al coste de carga del modelo.
- Consumer GPU: si, cabe en cualquier GPU de consumo, telefonos de gama alta e incluso microcontroladores con suficiente memoria.
- Opciones de despliegue: `transformers` directamente, y previsiblemente `text-generation-inference` segun el tag del repositorio. No hay evidencia de conversion a GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles. Dado el tamano, cualquier medicion estaria dominada por el coste de arranque del runtime.

## Comparativa con modelos similares

No disponible. No se identifican modelos comparables en la misma categoria, ya que este artefacto es un modelo de prueba de menos de un millon de parametros y no un LLM utilizable. Cualquier comparacion con modelos como TinyLlama, Qwen2-0.5B o SmolLM seria metodologicamente inadecuada por la diferencia de ordenes de magnitud en parametros y por la ausencia de datos de entrenamiento publicados.

## Limitaciones y advertencias

- Modelo de prueba: el nombre "smoke" y el tamano de 820.736 parametros indican que se trata de un artefacto de smoke test, no de un modelo funcional para tareas reales.
- Licencia no disponible: no se puede asumir ningun permiso de uso, incluido el comercial, sin consultar al autor.
- Idiomas no declarados: se desconoce que idiomas soporta y si el tokenizador de bytes cubre correctamente castellano u otros idiomas.
- Longitud de contexto desconocida: no hay datos sobre la ventana maxima, lo que impide planificar casos de uso con contexto largo.
- Riesgo de alucinacion: con este numero de parametros, la generacion de texto coherente es altamente improbable y la salida sera practicamente ruido o secuencias degeneradas.
- Ejecucion de codigo remoto: el tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio. Es imprescindible auditar los ficheros antes de cargarlo en entornos no aislados.
- Sin datos de entrenamiento publicos: no se puede evaluar sesgo, contaminacion de benchmarks ni procedencia del contenido.
- Sin benchmarks: no hay ninguna metrica publicada que respalde capacidades concretas.
- Uso en produccion desaconsejado: no deberia integrarse en ninguna aplicacion orientada a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-smoke-v1-r0001-u0-mdagosta
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- Version relacionada del autor (merge): https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-merge
- Fichero de inventario de release referenciado en la model card: `BOM.json` (dentro del repositorio)
- Mapeo de divulgacion de contenido GPAI referenciado en la model card: `EU-BOM.json` (dentro del repositorio)
