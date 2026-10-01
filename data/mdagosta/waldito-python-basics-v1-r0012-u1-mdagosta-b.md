# mdagosta/waldito-python-basics-v1-r0012-u1-mdagosta-b

## Resumen

OpenWALDO model export es un modelo de generacion de texto publicado por el usuario mdagosta en HuggingFace bajo el identificador `waldito-python-basics-v1-r0012-u1-mdagosta-b`. Se trata de un modelo de muy pequeno tamano, con 9.541.632 parametros (aproximadamente 9,5 millones), construido sobre la arquitectura estandar Llama de tipo causal-language-model segun lo declarado por el propio autor en la model card. El nombre sugiere un entrenamiento orientado a conceptos basicos de Python ("python-basics"), aunque no se aporta informacion adicional sobre el dataset ni el proceso de entrenamiento.

El aspecto mas singular es el uso de un tokenizer de bytes propio denominado "schema-1" bajo el proyecto OpenWALDO, que requiere cargarse con `trust_remote_code=True`. El repositorio incluye ademas ficheros de inventario (`BOM.json`) y un mapeo de divulgacion de contenido de entrenamiento alineado con el reglamento europeo de IA de proposito general (`EU-BOM.json`), lo que apunta a un esfuerzo por cumplir con requisitos de transparencia.

La relevancia de esta ficha es limitada en terminos de rendimiento, ya que no se han publicado benchmarks, el modelo no tiene descargas ni likes, y no se especifican licencia ni idiomas. Se documenta principalmente como ejemplo de exportacion con trazabilidad de componentes (BOM/EU-BOM) y tokenizer personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal-language-model (transformer decoder-only) |
| Parametros totales | 9.541.632 (9,5 M, dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura estandar de Llama para modelado de lenguaje causal, es decir, un transformer decoder-only. El unico detalle diferencial declarado es el tokenizer: se utiliza un tokenizer de bytes propio del proyecto OpenWALDO, identificado como "schema-1", que debe cargarse con `trust_remote_code=True` dado que no forma parte de la libreria estandar de Transformers.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF, DPO u otro ajuste por preferencias, ni sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). El repositorio incluye un fichero `BOM.json` que inventaria los ficheros de la release y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA de proposito general, pero no se detalla su contenido.

## Capacidades

- Generacion de texto de tipo causal (pipeline `text-generation`).
- Uso conversacional, segun la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Tokenizacion basada en bytes mediante el tokenizer "schema-1" de OpenWALDO.
- El nombre del modelo sugiere un enfoque en conceptos basicos de Python, aunque no se documenta formalmente.
- No se ha confirmado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, thinking mode ni capacidades multilingues.

## Casos de uso

Dado el tamano (9,5 M de parametros) y la ausencia de benchmarks, los casos de uso han de considerarse experimentales y de baja exigencia:

- Experimentacion con tokenizers personalizados: util para validar el tokenizer "schema-1" de OpenWALDO y su integracion con `trust_remote_code=True` en pipelines de Transformers.
- Pruebas de integracion en text-generation-inference: sirve como modelo de juguete para verificar el despliegue de endpoints compatibles antes de escalar a modelos mayores.
- Docencia y prototipado: por su tamano minimo, permite ejecutar inferencia en CPU y entender el ciclo completo de carga, tokenizacion y generacion.
- Generacion de fragmentos de codigo Python elemental: si el entrenamiento se centro en "python-basics" como sugiere el nombre, podria emplearse para autocompletar lineas simples, siempre con validacion humana.
- Auditoria de trazabilidad de modelos: los ficheros `BOM.json` y `EU-BOM.json` permiten estudiar como se documenta la divulgacion de contenido de entrenamiento conforme al reglamento europeo de IA.
- Investigacion sobre modelos diminutos: analizar el comportamiento de un transformer de ~9,5 M de parametros y su calidad de generacion frente a modelos mas grandes.
- Pruebas de pipelines de CI/CD de bajo coste: usar el modelo como sustituto ligero en tests automatizados que validen la infraestructura de inferencia sin consumir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 9.541.632 parametros, el peso en precision completa (fp32) es de aproximadamente 38 MB; en fp16, unos 19 MB; en int8, unos 9,5 MB; y en int4, alrededor de 5 MB. Son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU sin GPU dedicada.
- Tambien es viable en dispositivos de borde y entornos con memoria muy limitada.
- Opciones de despliegue: Transformers con `trust_remote_code=True` para el tokenizer, ademas de text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (exportaciones OpenWALDO con tokenizer "schema-1" o modelos de ~9,5 M de parametros orientados a Python basico) con los que establecer una comparacion fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al no documentarse el dataset de entrenamiento, no puede evaluarse el sesgo.
- Riesgo de alucinacion: previsiblemente alto dado el reducido numero de parametros, aunque no se aportan mediciones.
- Limitaciones de contexto e idioma: se desconocen tanto la longitud de contexto como los idiomas soportados.
- Licencia: no disponible, por lo que no puede confirmarse si se permite el uso comercial. Debe tratarse como uso incierto hasta que el autor la especifique.
- Dependencia de codigo remoto: el tokenizer requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar dicho codigo antes de usarlo en entornos de produccion.
- Madurez: el modelo registra 0 descargas y 0 likes, y el repositorio tiene un tamano de 0.0 GB, lo que sugiere un artefacto experimental o incompleto. No debe considerarse apto para produccion sin validacion adicional.
- Fechas del repositorio: las marcas de creacion y actualizacion (2026-09-30) resultan anomales y no se corresponden con un lanzamiento verificado.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0012-u1-mdagosta-b
- Paper: no disponible
- Blog o documentacion del proyecto OpenWALDO: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
