# ravivarmapatturi/vayyuedge-opus-mt-en-dra-onnx

## Resumen

Este modelo es una exportación a ONNX con cuantización dinámica int8 del modelo Helsinki-NLP/opus-mt-en-dra, un sistema de traducción automática neuronal basado en la arquitectura Marian (transformer seq2seq) que traduce del inglés a las lenguas dravídicas, con especial foco en telugu. La conversión ha sido realizada por el usuario ravivarmapatturi como componente del proyecto VayyuEdge, una aplicación que ejecuta traducción inglés → telugu directamente en el navegador mediante transformers.js, sin necesidad de servidor.

La relevancia de esta ficha radica en el caso de uso concreto: al ser un modelo ligero cuantizado a int8 y en formato ONNX, puede ejecutarse íntegramente en el cliente (WebGPU/WASM), lo que garantiza privacidad (el texto nunca sale del dispositivo) y funciona sin conexión. Es una solución práctica para integrar traducción a telugu en aplicaciones web con requisitos mínimos de hardware. El modelo original mantiene la licencia CC-BY 4.0, que también aplica a esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantizacion dinamica ONNX) |
| Idiomas soportados | Ingles (origen) → lenguas dravidicas, con seleccion de telugu mediante el prefijo `>>tel<<` |
| Licencia | CC-BY 4.0 |
| Formato de pesos | ONNX (int8), para uso con transformers.js |

## Arquitectura y entrenamiento

El modelo base es opus-mt-en-dra del proyecto OPUS-MT de Helsinki-NLP, una familia de modelos de traducción automatica entrenados con la arquitectura Marian, una implementacion eficiente de transformer encoder-decoder optimizada para tareas seq2seq. El sufijo "dra" indica que el modelo cubre el grupo de lenguas dravidicas (telugu, tamil, kannada, malayalam y otras), empleando tokens de prefijo de idioma (como `>>tel<<`) para seleccionar la lengua destino dentro del mismo modelo.

Los datos de entrenamiento del modelo original provienen del corpus OPUS, una coleccion paralela masiva de textos traducidos extraidos de fuentes publicas (no se especifican los tokens exactos en la informacion disponible). Esta variante ONNX no reentrena nada: aplica cuantizacion dinamica int8 sobre los pesos originales para reducir el tamano del repositorio a aproximadamente 0,4 GB y acelerar la inferencia en navegadores mediante WebAssembly o WebGPU a traves de transformers.js.

## Capacidades

- Traduccion automatica de texto del ingles a las lenguas dravidicas, con seleccion explicita de telugu mediante el prefijo `>>tel<<` en la entrada.
- Ejecucion completamente en el navegador (client-side) mediante transformers.js, sin backend ni llamadas a APIs externas.
- Inferencia eficiente gracias a la cuantizacion int8 dinámica, con un repositorio de unos 0,4 GB descargable en el cliente.
- Generacion de texto tipo text2text (pipeline de traduccion estandar de la libreria Transformers).
- No soporta vision, audio, tool calling ni capacidades de agente; es un modelo de traduccion monofuncional.

## Casos de uso

- Traduccion ingles → telugu en el navegador: la aplicacion VayyuEdge lo usa para traducir texto introducido por el usuario sin enviar datos a ningun servidor, adecuado para contenido sensible o uso sin conexion.
- Aplicaciones web offline-first: al cargar los pesos una vez (0,4 GB), la traduccion funciona sin conectividad, util en zonas con internet intermitente o para PWA.
- Herramientas de accesibilidad y comunicacion: extensiones de navegador o widgets que traduzcan contenido en ingles a telugu para usuarios que no dominan el ingles.
- Prototipado rapido de traductores embebidos: desarrolladores que quieran integrar traduccion en una web con unas pocas lineas de transformers.js, sin coste de infraestructura de inferencia.
- Educacion y aprendizaje de idiomas: aplicaciones de vocabulario o practica de lectura donde el usuario traduce frases del ingles al telugu de forma interactiva y privada.
- Procesamiento local en kioscos o dispositivos de borde: escenarios (quioscos informativos, terminales) donde no se desea dependencia de red ni de GPU en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia general, los modelos OPUS-MT de Helsinki-NLP se evaluan habitualmente con metricas BLEU sobre pares de idiomas concretos, pero no hay puntuaciones especificas publicadas ni para el modelo base en esta ficha ni para esta exportacion cuantizada.

## Requisitos de hardware

- VRAM: no aplicable en el despliegue previsto (navegador); la inferencia se realiza con CPU/WASM o WebGPU del cliente. El repositorio ocupa aproximadamente 0,4 GB de descarga.
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier navegador moderno con WebAssembly. Si el entorno lo soporta, WebGPU acelera la inferencia.
- Consumer GPUs: al ejecutarse en navegador, no se necesita GPU dedicada; cualquier equipo de escritorio o portatil moderno es suficiente.
- Despliegue: transformers.js (via de uso principal), con los pesos ONNX int8 servidos como assets estaticos. No requiere vLLM, llama.cpp ni TGI al no tratarse de un modelo LLM de servidor.
- Latencia y throughput: no disponibles; al ser un modelo Marian pequeno cuantizado a int8, la traduccion de frases individuales en navegador es tipicamente inmediata o de subsegundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Ambito | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| ravivarmapatturi/vayyuedge-opus-mt-en-dra-onnx | Marian (ONNX int8) | Ingles → dravidicas (telugu) | ONNX | CC-BY 4.0 | Navegador (transformers.js) |
| Helsinki-NLP/opus-mt-en-dra | Marian | Ingles → dravidicas | PyTorch/safetensors | CC-BY 4.0 | Servidor o local (Python) |
| Helsinki-NLP/opus-mt-en-mul | Marian | Ingles → multiidioma | PyTorch/safetensors | CC-BY 4.0 | Servidor o local (Python) |

La variante ONNX cuantizada se diferencia del modelo base en el formato de pesos y en la via de ejecucion: esta pensada para inferencia en navegador, mientras que el original requiere un entorno Python. Para traducciones a mas idiomas fuera del grupo dravidico, opus-mt-en-mul ofrece mayor cobertura con la misma arquitectura.

## Limitaciones y advertencias

- Calidad de traduccion: los modelos OPUS-MT para lenguas dravidicas tienen rendimiento notablemente inferior al de pares de alta recursos (ingles-frances, ingles-aleman); pueden producir traducciones poco fluidas o errores gramaticales en telugu.
- Riesgo de alucinacion: en entradas largas, ambiguas o fuera de dominio, los modelos seq2seq de traduccion pueden omitir contenido o generar texto sin relacion con la fuente.
- Cobertura de idiomas: aunque el modelo base cubre el grupo dravidico, la documentacion de esta exportacion solo describe el uso de telugu (`>>tel<<`); el comportamiento con otros prefijos de idioma no esta documentado.
- Sin evaluacion publica: no hay benchmarks publicados ni para el modelo base en esta ficha ni para la cuantizacion, por lo que la calidad debe validarse con datos propios antes de uso en produccion.
- Licencia: CC-BY 4.0 permite uso comercial, pero exige atribucion a Helsinki-NLP (y, en su caso, al autor de la exportacion).
- Mantenimiento: es un repositorio comunitario con muy pocas descargas (51) y sin documentacion extensa; no hay garantias de soporte ni actualizaciones.
- Contexto: los modelos Marian tienen una longitud de entrada limitada (tipicamente del orden de 512 tokens); no es adecuado para traducir documentos largos de una sola pasada.

## Enlaces

- Modelo ONNX: https://huggingface.co/ravivarmapatturi/vayyuedge-opus-mt-en-dra-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-dra
- Proyecto VayyuEdge: https://github.com/ravivarmapatturi/vayyuedge
