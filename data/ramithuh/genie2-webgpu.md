# ramithuh/genie2-webgpu

## Resumen

`ramithuh/genie2-webgpu` es una exportacion de pesos del modelo Genie 2 (epoch 40, variante base) publicada por el usuario ramithuh en Hugging Face. El modelo original procede de `aqlaboratory/genie2` y esta pensado para inferencia directamente en navegador mediante WebGPU, sin necesidad de backend ni servidor. Los pesos se distribuyen en shards de safetensors de 25 MB o menos, en FP16 e INT8, acompanados de manifiestos SHA-256 para verificar integridad.

La relevancia de esta ficha es acotada: el repositorio no incluye pipeline declarado, no especifica idiomas, no documenta benchmarks en la model card y el tamano total del repo aparece como 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que la informacion esta incompleta. La model card remite a `README_WEBGPU.md` para arquitectura, benchmarks de paridad numerica y uso, pero ese contenido no esta disponible en la informacion proporcionada.

Se trata, por tanto, de una ficha de caracter tecnico-inventarial: describe lo que el autor declara (exportacion WebGPU de Genie 2) y marca explicitamente como "no disponible" todo aquello que no puede verificarse con los datos facilitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card remite a `README_WEBGPU.md`, no incluido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 e INT8 (declarados en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (segun la model card; incluye LICENSE y NOTICE) |
| Formato de pesos | safetensors en shards de <= 25 MB con manifiestos SHA-256 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en los datos proporcionados. La model card unicamente indica que se trata de Genie 2 (variante base, epoch 40) procedente de `aqlaboratory/genie2`, y que los pesos han sido exportados para inferencia en navegador con WebGPU. No se documentan tipo de transformer, atencion, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineamiento (RLHF/DPO).

La innovacion declarada es exclusivamente de despliegue: sharding de safetensors en fragmentos pequenos (<= 25 MB) con manifiestos SHA-256, orientado a carga progresiva y verificacion de integridad en entornos WebGPU, integrado en `denovo.run` y en el repositorio `denovo-webgpu-models`. Cualquier detalle adicional sobre arquitectura o entrenamiento queda fuera del alcance de esta ficha.

## Capacidades

- No se documentan capacidades funcionales (generacion de texto, razonamiento, codigo, matematicas, vision) en la informacion disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingue ni lista de idiomas.
- Capacidad de despliegue declarada: inferencia en navegador mediante WebGPU, con pesos FP16 e INT8 en shards pequenos.
- No se confirma existencia de modo thinking, vision, audio ni otras modalidades.

## Casos de uso

- Inferencia local en navegador: el formato de shards de <= 25 MB con manifiestos SHA-256 permite cargar pesos de forma progresiva en una pagina web y verificar integridad antes de ejecutar, lo que encaja en demos interactivas sin backend.
- Prototipos de WebGPU: util para desarrolladores que quieran probar pipelines de inferencia WebGPU en `denovo.run` o en `denovo-webgpu-models` sin depender de infraestructura GPU en servidor.
- Distribucion de pesos verificables: los manifiestos SHA-256 permiten auditar que el shard descargado coincide con el publicado, util en entornos con requisitos de integridad de artefactos.
- Pruebas de paridad numerica FP16 frente a INT8: la model card menciona benchmarks de paridad numerica en `README_WEBGPU.md`, por lo que el repo puede servir para comparar precision entre ambas variantes (aunque dichos benchmarks no estan disponibles aqui).
- Evaluacion de viabilidad WebGPU: permite medir latencia y consumo de memoria en hardware cliente antes de comprometer recursos de servidor.
- Integracion en aplicaciones web offline-first: al no requerir backend, los shards pueden servirse desde CDN o cache local, aunque la viabilidad real depende de capacidades no documentadas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "numerical parity benchmarks" en `README_WEBGPU.md`, pero ese documento no esta incluido en los datos facilitados, por lo que no se pueden citar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el requisito declarado es soporte de WebGPU en el navegador, no una GPU concreta.
- Opciones de despliegue: WebGPU en navegador via `denovo.run` / `denovo-webgpu-models`; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de parametros, contexto ni benchmarks de este modelo, y la informacion proporcionada no identifica alternativas comparables de la misma categoria (exportaciones WebGPU de modelos base).

## Limitaciones y advertencias

- Informacion incompleta: pipeline no declarado, idiomas no disponibles, benchmarks no publicados en la model card y tamano del repo indicado como 0.0 GB, lo que impide verificar que los pesos esten efectivamente alojados.
- Dependencia de un documento externo (`README_WEBGPU.md`) para arquitectura y uso, no incluido en la informacion disponible.
- Licencia declarada Apache-2.0 en la model card, pero la metadata de Hugging Face no especifica licencia; conviene verificar LICENSE y NOTICE antes de uso comercial.
- El modelo upstream es `aqlaboratory/genie2`; los terminos aplicables pueden depender tambien de las condiciones del repositorio original.
- Inferencia WebGPU sujeta a soporte del navegador y del hardware cliente; no se documentan requisitos minimos ni limites de memoria.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma.
- Al no haber descargas ni likes, no existe evidencia de uso en produccion ni de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/genie2-webgpu
- Modelo upstream: https://huggingface.co/aqlaboratory/genie2
- Repositorio de despliegue: https://github.com/ramithuh/denovo-webgpu-models
- Demo / entorno WebGPU: https://denovo.run
