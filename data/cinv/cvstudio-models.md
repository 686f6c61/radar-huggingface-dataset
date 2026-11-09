# Cinv/cvstudio-models

## Resumen

`Cinv/cvstudio-models` no es un modelo entrenado por su autor, sino un repositorio espejo que aloja copias sin modificar de los pesos que la aplicacion de escritorio CV Studio descarga para sus funciones de generacion de imagen y video. El repositorio agrupa tres packs ("Bộ vẽ ảnh cao cấp", "Bộ vẽ ảnh chất lượng tối đa" y "Video AI") que combinan modelos de difusion de terceros (FLUX.2 [klein] 4B de Black Forest Labs, Z-Image-Turbo de Tongyi-MAI y FastWan2.2-TI2V-5B de FastVideo) con modelos de lenguaje Qwen3-4B y codificadores de texto umT5-XXL, ademas de los VAE y decodificadores correspondientes.

El objetivo declarado es de disponibilidad: garantizar que la descarga de un cliente no dependa de que el repositorio de un tercero siga publicado o accesible. La aplicacion valida cada fichero contra un SHA-256 fijado en su codigo y, si la comprobacion falla, recurre al repositorio original. Los pesos se distribuyen en formato GGUF, lo que permite ejecucion en CPU/GPU de consumo mediante runtimes compatibles.

El dato de "parametros totales" reportado por Hugging Face (4.999.787.712, es decir, unos 5.000 millones) corresponde a un unico componente del conjunto (coherente con el modelo de video FastWan2.2-TI2V-5B o con un Qwen3-4B mas su proyeccion), no al total agregado del repositorio, que suma varios modelos independientes. El tamano del repo (9,5 GB) refleja el conjunto empaquetado en GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: modelos de difusion (FLUX.2 [klein] 4B, Z-Image-Turbo, FastWan2.2-TI2V-5B), LLM transformer denso (Qwen3-4B / Qwen3-4B-Instruct-2507) y codificador de texto (umT5-XXL) |
| Parametros totales | 4.999.787.712 en el tensor safetensors reportado; el repositorio agrega varios modelos de distinto tamano (no hay cifra agregada disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con componente TAEHV bajo MIT); derechos de cada modelo original retenidos por sus autores |
| Formato de pesos | GGUF |
| Tamano del repositorio | 9,5 GB |
| Estructura interna | `<repo original>/<commit>/<fichero>`, con verificacion SHA-256 en la app |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio: son copias byte a byte de pesos publicados por terceros. Los componentes identificados son:

- **Pack "Bộ vẽ ảnh cao cấp"**: FLUX.2 [klein] 4B (Black Forest Labs) en GGUF de leejet, Qwen3-4B en GGUF de unsloth, y FLUX.2 VAE / small decoder. FLUX.2 [klein] es un modelo de difusion para generacion de imagen de 4B parametros; Qwen3-4B actua como modelo de lenguaje auxiliar (por ejemplo, para expansion de prompts).
- **Pack "Bộ vẽ ảnh chất lượng tối đa"**: Z-Image-Turbo (Tongyi-MAI) en GGUF de leejet, Qwen3-4B-Instruct-2507 en GGUF de unsloth y FLUX.1 autoencoder.
- **Pack "Video AI"**: FastWan2.2-TI2V-5B (FastVideo) en GGUF de Green-Sky, umT5-XXL en GGUF de city96 como codificador de texto, Wan 2.2 VAE y TAEHV `taew2_2` (madebyollin, MIT) como decodificador rapido.

No se dispone de informacion sobre volumen de tokens, composicion del dataset, ni procesos de RLHF/DPO, ya que corresponde a las model cards de los modelos originales. La innovacion tecnica relevante aqui es de empaquetado y distribucion: cuantizacion GGUF para inferencia en hardware modesto, verificacion criptografica de integridad y fallback al origen.

## Capacidades

- Generacion de imagen texto-a-imagen mediante FLUX.2 [klein] 4B y Z-Image-Turbo.
- Generacion de video texto-a-video e imagen-a-video mediante FastWan2.2-TI2V-5B.
- Procesamiento de prompts en lenguaje natural con Qwen3-4B y Qwen3-4B-Instruct-2507 (posible reescritura o expansion de prompts).
- Codificacion de texto multilingue mediante umT5-XXL para el pipeline de video.
- Decodificacion rapida de latentes a pixeles con TAEHV (`taew2_2`), orientada a reducir el coste del decodificado en video.
- Inferencia en CPU y GPU de consumo gracias al formato GGUF.
- Verificacion de integridad de pesos por SHA-256 en el flujo de la aplicacion CV Studio.
- Tool calling, agentes, vision de entrada, audio y modo thinking: no disponible (no se documentan en la informacion proporcionada).

## Casos de uso

- **Aplicacion de escritorio de creacion visual**: CV Studio usa estos packs como dependencias descargables; el repositorio garantiza que la descarga del usuario final no se rompa si el repo original cambia de ruta o desaparece.
- **Generacion de imagenes en local sin servicio en la nube**: con FLUX.2 [klein] 4B en GGUF, un equipo con GPU de consumo puede producir imagenes a partir de texto sin enviar prompts a terceros, util en entornos con requisitos de privacidad.
- **Prototipado de pipelines texto-a-video**: FastWan2.2-TI2V-5B junto con umT5-XXL y TAEHV permite montar un flujo completo de generacion de clips cortos en una sola maquina, con decodificado acelerado.
- **Investigacion en cuantizacion y despliegue**: el repositorio sirve como referencia reproducible de combinaciones GGUF (leejet, unsloth, city96, Green-Sky) para medir calidad frente a los pesos originales en fp16/bf16.
- **Espejo interno para empresas**: un equipo puede replicar esta estructura `<repo>/<commit>/<fichero>` en su propio almacenamiento para fijar versiones exactas de los pesos en sus builds.
- **Generacion de assets para preproduccion**: ilustracion conceptual y storyboards rapidos combinando Z-Image-Turbo (imagen) y FastWan2.2 (video) dentro de la misma aplicacion.
- **Educacion y demos**: al ser pesos publicos y ligeros en GGUF, permiten talleres practicos de difusion y video generativo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo de pesos y no incluye evaluaciones propias; cualquier metrica deberia consultarse en las model cards de FLUX.2 [klein], Z-Image-Turbo, FastWan2.2-TI2V-5B y Qwen3-4B.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de difusion de 4B en GGUF Q4 ocupa del orden de 2,5-3 GB de pesos, y FastWan2.2-TI2V-5B en Q4 del orden de 3-4 GB; a ello hay que sumar el codificador de texto (umT5-XXL es el componente mas pesado, varios GB en Q4) y los VAE/decodificadores.
- **GPU recomendadas**: no disponibles en la informacion proporcionada. Por tamano, caben en GPU de consumo con 8-12 GB de VRAM en cuantizaciones bajas; para fp16 se requeriria hardware de gama alta (A100, H100 o RTX 4090).
- **Consumer GPU**: si, previsiblemente en tarjetas con 8 GB o mas en cuantizaciones Q4, aunque el dato no esta confirmado por el autor.
- **Opciones de despliegue**: el formato GGUF es compatible con llama.cpp y, para los modelos de difusion, con los runtimes que consumen GGUF de leejet/ComfyUI; la aplicacion CV Studio actua como cliente propio. vLLM y TGI no aplican a los componentes de difusion.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cinv/cvstudio-models (este repo) | ~5B en el tensor reportado; varios modelos agregados | Espejo de pesos GGUF (imagen + video + LLM auxiliar) | no disponible | Apache-2.0 + MIT (TAEHV) | Hugging Face, 0 descargas, 0 likes |
| FLUX.2 [klein] 4B (repo original) | 4B | Difusion texto-a-imagen | no disponible | Apache-2.0 | Repo original de Black Forest Labs |
| Z-Image-Turbo (Tongyi-MAI) | no disponible | Difusion texto-a-imagen | no disponible | Apache-2.0 | Repo original de Tongyi-MAI |
| FastWan2.2-TI2V-5B (FastVideo) | 5B | Difusion texto/imagen-a-video | no disponible | Apache-2.0 | Repo original de FastVideo |

La comparativa relevante no es de rendimiento sino de rol: este repositorio no compite con los modelos, los replica. Frente a descargar directamente de los repositorios originales, ofrece versiones fijadas por commit y verificacion SHA-256, a cambio de menor trazabilidad editorial y de no incluir documentacion propia.

## Limitaciones y advertencias

- **No es un modelo entrenado**: no debe citarse como modelo propio de Cinv ni evaluarse como una entidad unica; mezcla pesos de varios autores con licencias y condiciones distintas.
- **Licencias**: aunque la etiqueta del repo es Apache-2.0, cada componente conserva su licencia original; TAEHV es MIT. Es necesario revisar cada repositorio de origen antes de uso comercial.
- **Trazabilidad**: el repositorio tiene 0 descargas y 0 likes y fue creado en noviembre de 2026; no hay garantia de mantenimiento ni de actualizacion de los commits fijados.
- **Documentacion ausente**: sin model card tecnica, sin benchmarks, sin idiomas declarados y sin niveles de cuantizacion especificados.
- **Sesgos y alucinacion**: no evaluados para este empaquetado; los sesgos de generacion de imagen y video (estereotipos, artefactos en manos, texto y movimiento) dependen de los modelos originales y no se han medido aqui.
- **Riesgo de integridad**: la seguridad del flujo depende de que la app verifique correctamente el SHA-256; si el fallback al repo original se activa, se pierde la garantia de version fijada.
- **Uso en produccion**: al no haber latencias, requisitos de VRAM ni tasas de fallo documentadas, cualquier despliegue exige una validacion propia previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Cinv/cvstudio-models
- FLUX.2 [klein] 4B (Black Forest Labs): no disponible en la informacion proporcionada
- Z-Image-Turbo (Tongyi-MAI): no disponible en la informacion proporcionada
- FastWan2.2-TI2V-5B (FastVideo): no disponible en la informacion proporcionada
- Qwen3-4B / Qwen3-4B-Instruct-2507 (unsloth, GGUF): no disponible en la informacion proporcionada
- umT5-XXL GGUF (city96): no disponible en la informacion proporcionada
- TAEHV `taew2_2` (madebyollin, MIT): no disponible en la informacion proporcionada
