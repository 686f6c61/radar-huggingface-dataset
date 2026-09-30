# mdagosta/waldito-smoke-v1-r0002-u1-mdagosta

## Resumen

El modelo `mdagosta/waldito-smoke-v1-r0002-u1-mdagosta` es un artefacto publicado en HuggingFace por el usuario mdagosta (Michael D'Agosta), enmarcado en lo que la propia model card denomina "OpenWALDO model export". Se trata de un transformer causal de arquitectura Llama estandar (`LlamaForCausalLM`) con un tokenizador de bytes propietario, identificado como "schema-1", que requiere cargarse con `trust_remote_code=True`. El repositorio incluye ademas dos ficheros de inventario, `BOM.json` y `EU-BOM.json`, este ultimo con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI).

La relevancia del artefacto no esta en su capacidad generativa, sino en su naturaleza de prueba. Con 820.736 parametros totales (aproximadamente 0,82 millones), el modelo es tres ordenes de magnitud mas pequeno que cualquier LLM util: por poner una referencia, esta por debajo del millon de parametros, mientras que los modelos de proposito general manejables en消费 hardware parten de los 1.000-3.000 millones. El nombre "smoke" apunta a un test de humo: un artefacto minimo destinado a verificar que una cadena de carga, tokenizacion, serializacion y servicio funciona de extremo a extremo antes de entrenar o desplegar algo real.

En el momento de redactar esta ficha, el repositorio acumula 125 descargas y 0 "likes", con un tamano de 0,0 GB y pesos en formato safetensors. La model card no documenta datos de entrenamiento, licencia, idiomas ni resultados de evaluacion, por lo que la mayor parte de las especificaciones habituales figuran aqui como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (LlamaForCausalLM de la libreria Transformers) |
| Parametros totales | 820.736 (0,82 M) segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documenta precision original ni versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | Propietario "schema-1" de OpenWALDO, basado en bytes; requiere `trust_remote_code=True` |
| Libreria de carga | transformers |
| Pipeline declarado | text-generation |
| Artefactos adicionales | `BOM.json` (inventario de ficheros de la release), `EU-BOM.json` (mapeo de divulgacion GPAI UE) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 125 / 0 |
| Fechas de creacion y actualizacion | 2026-09-30 (ambas identicas, con dos segundos de diferencia) |

## Arquitectura y entrenamiento

La model card es explicita en un unico punto tecnico: el paquete emplea "the standard Transformers Llama causal-language-model architecture" junto con el tokenizador de bytes schema-1 de OpenWALDO. Es decir, no hay innovaciones arquitectonicas declaradas (ni MoE, ni atencion lineal, ni SSM hibrido, ni decodificacion especulativa); se trata del bloque decoder-only habitual con atencion causal y normalizacion RMSNorm, en una configuracion de dimensiones reducidas que da lugar a los 820.736 parametros reportados por safetensors.

No se dispone de informacion sobre el proceso de entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo fases de ajuste por instrucciones (SFT), RLHF o DPO, ni el regimen de precision utilizado. Los unicos indicios documentales son los ficheros de inventario ya citados: `BOM.json` enumera los ficheros de la release y `EU-BOM.json` recoge el mapeo de divulgacion de contenido de entrenamiento conforme al regimen europeo de modelos de proposito general. El contenido de dichos ficheros no se ha podido verificar en la informacion disponible.

Un detalle relevante desde el punto de vista de ingenieria es la combinacion de arquitectura Llama estandar con un tokenizador de bytes no estandar. Esto implica que cualquier runtime debe soportar la carga de codigo remoto del tokenizador, lo que restringe los motores de inferencia utilizables y anade una superficie de riesgo de seguridad (ejecucion de codigo del repositorio durante la carga).

## Capacidades

- Generacion de texto causal: la arquitectura es la estandar de Llama, por lo que la tarea declarada es text-generation, pero con 820.736 parametros no cabe esperar texto coherente ni util en produccion.
- Conversacional: el tag `conversational` aparece en los metadatos del repositorio, aunque no se documenta ninguna plantilla de chat ni formato de turnos.
- Tokenizacion de bytes: el tokenizador schema-1 opera sobre bytes, lo que en principio permite representar cualquier secuencia de entrada sin caracteres fuera de vocabulario; no se documenta el tamano del vocabulario ni el comportamiento con texto multilingue real.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible; el tamano del modelo descarta que existan.
- Capacidades multilingues: no disponible.
- Vision, audio o modo "thinking": no disponible.

En la practica, el modelo debe considerarse un artefacto de validacion tecnica, no un modelo con capacidades funcionales descritas.

## Casos de uso

- Prueba de humo de pipelines de carga: verificar que un entorno con `transformers` instalado puede descargar, instanciar y ejecutar el modelo con `trust_remote_code=True` antes de invertir tiempo en un modelo de produccion; el peso de 0,82 M de parametros hace que la prueba se complete en segundos incluso en CPU.
- Validacion de tokenizadores personalizados en CI: integrar el modelo en un job de integracion continua que compruebe que el tokenizador de bytes schema-1 se carga, tokeniza y detokeniza correctamente tras cada actualizacion de dependencias, detectando roturas por cambios de version en Transformers.
- Pruebas de serializacion y formatos de pesos: al distribuirse en safetensors con un peso minimo, sirve para comprobar rutas de carga, verificacion de checksums e interoperabilidad con herramientas que leen safetensors sin consumir disco ni memoria apreciables.
- Verificacion de inventarios de cumplimiento: el par `BOM.json` / `EU-BOM.json` permite probar en un pipeline interno que el parseo y la validacion de un SBOM de modelo y de un mapeo de divulgacion GPAI funcionan antes de aplicarlo a releases reales.
- Banco de pruebas de servidores de inferencia: desplegar el modelo en un servidor de pruebas para medir el arranque en frio, el tiempo de carga del tokenizador y el overhead del endpoint con un coste de recursos practicamente nulo, comparando despues con modelos grandes sobre la misma infraestructura.
- Desarrollo de harnesses de evaluacion: usar un modelo diminuto como caso limite en un framework de evaluacion (prompt vacio, secuencias largas, entradas binarias) para comprobar que el harness no se rompe antes de lanzarlo contra modelos de miles de millones de parametros.
- Docencia y formacion interna: ilustrar de forma tangible el ciclo de vida completo de un artefacto de HuggingFace (repo, model card, safetensors, BOM, carga con codigo remoto) sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares) y la busqueda web realizada no ha devuelto resultados de evaluacion asociados a este identificador. Dado el tamano de 820.736 parametros, cualquier comparacion con modelos de referencia careceria de sentido metodologico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision. En fp32 los pesos ocupan aproximadamente 3,3 MB (820.736 parametros x 4 bytes); en fp16 o bf16, alrededor de 1,6 MB. El consumo real vendra dominado por el peso del runtime de Python y de PyTorch, no por el modelo.
- GPU recomendadas: cualquiera. El modelo se ejecuta en CPU sin dificultad; no requiere A100, H100 ni RTX 4090. Se puede usar una GPU integrada o incluso ejecucion monohilo.
- GPU de consumo: cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU con soporte CUDA, e incluso en entornos sin GPU.
- Opciones de despliegue: al ser un modelo de arquitectura Llama con tokenizador remoto, la via soportada es `transformers` con `trust_remote_code=True`. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama; estos motores requeririan, en el caso de llama.cpp/Ollama, una conversion a GGUF que no se distribuye en el repositorio, y en el caso de vLLM/TGI, soporte del tokenizador de bytes remoto, aspecto no verificado.
- Latencia y throughput: no disponible. Por el tamano de los pesos, la latencia estara dominada por el arranque del proceso y la carga del tokenizador, no por el calculo.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada. La categoria a la que pertenece este artefacto (modelos de prueba de humo con pesos minimos, publicados para validar cadenas de carga y no para generar texto) no cuenta con referencias documentadas en las fuentes consultadas, y no se ha confirmado ningun dato de parametros, contexto, licencia o rendimiento de posibles alternativas. Por tanto, la comparativa se declara no disponible en lugar de rellenarse con cifras no contrastadas.

Como orientacion cualitativa, cualquier modelo de proposito general de la misma familia arquitectonica (Llama) parte de ordenes de magnitud superiores en parametros y contexto, por lo que la comparacion relevante no es de rendimiento sino de funcion: este repositorio es un instrumento de verificacion de infraestructura, no un candidato a desplegarse para generar texto.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia en la model card ni en los metadatos, no existe autorizacion explicita de uso comercial. Debe tratarse como "todos los derechos reservados" hasta que el autor aclare los terminos.
- Tamano insuficiente para tareas reales: 820.736 parametros no permiten generar texto coherente, razonar, traducir ni escribir codigo. Cualquier uso generativo producira salida sin valor.
- Riesgo de alucinacion: en un modelo con este numero de parametros la salida es esencialmente ruido estadistico; no debe interpretarse como informacion.
- Ejecucion de codigo remoto: la carga con `trust_remote_code=True` implica ejecutar el codigo del tokenizador incluido en el repositorio. Es una practica de riesgo si no se audita previamente el codigo, y es un vector habitual de compromiso en entornos de CI que descargan artefactos automaticamente.
- Tokenizador no estandar: al no ser un tokenizador de la libreria base, la portabilidad a otros motores de inferencia no esta garantizada y puede degradar el rendimiento o impedir el despliegue en stacks habituales.
- Ausencia total de documentacion de entrenamiento: no se declaran datos, tokens, filtros ni fases de alineacion, lo que impide evaluar sesgos, contaminacion de benchmarks o cualquier aspecto de calidad.
- Sin resultados de evaluacion: no hay ninguna metrica publicada, por lo que no es posible comparar ni validar su comportamiento.
- Metadatos llamativos: la fecha de creacion y la de actualizacion son identicas (2026-09-30, con dos segundos de diferencia) y el tamano del repositorio se reporta como 0,0 GB, lo que sugiere un artefacto generado de forma automatica. Conviene verificar la integridad de los ficheros antes de reutilizarlos.
- Trazabilidad limitada: el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints, pero no se documentan requisitos, plantilla de prompt ni limites, por lo que su comportamiento en ese entorno no esta verificado.
- Sin garantia de mantenimiento: se trata de una release etiquetada como "smoke-v1", lo que indica caracter provisional; no hay compromiso declarado de soporte ni de versiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-u1-mdagosta
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- Perfil del autor en GitHub: https://github.com/mdagosta
- Sitio personal del autor: https://dagosta.com
- Inventario de ficheros de la release (ruta dentro del repositorio): `BOM.json`
- Mapeo de divulgacion GPAI UE (ruta dentro del repositorio): `EU-BOM.json`
- Paper tecnico: no disponible
- Blog o articulo de presentacion: no disponible
- Repositorio de codigo del proyecto OpenWALDO: no disponible
- Demo o espacio interactivo: no disponible
