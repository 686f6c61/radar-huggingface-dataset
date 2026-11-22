# Eiki-AI/plamo-3-translate-2b-af-no-preview-FP8

## Resumen

PLaMo-3-Translate-2B-AF-NO (V5 Preview, FP8) es un ajuste fino del modelo de traduccion `pfnet/plamo-3-translate-2b` de Preferred Networks, publicado por el usuario Eiki-AI. Anade los pares de idiomas afrikaans (`af`) y noruego bokmal (`no`) al modelo base, que originalmente cubre ingles (`en`) y japones (`ja`). El modelo se distribuye cuantizado en FP8 mediante `nvidia-modelopt` con la configuracion `FP8_DEFAULT_CFG`, lo que reduce a la mitad la memoria de los pesos respecto a BF16 manteniendo una precision practicamente identica.

Se trata de un modelo de 2.878.595.584 parametros (unos 2,9 mil millones) orientado exclusivamente a traduccion automatica. Su relevancia radica en que demuestra que un modelo de traduccion pequeno, cuantizado en FP8 y ejecutado con vLLM, puede alcanzar calidad cercana a BF16 (diferencias de en torno a 0,1 chrF++ en la mayoria de direcciones) en GPU Hopper y Blackwell.

Es un ajuste fino comunitario experimental, no oficial, no afiliado ni respaldado por Preferred Networks. La licencia es la PLaMo Community License, que impone condiciones para uso comercial y redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `plamo3`, requiere `trust_remote_code`) |
| Parametros totales | 2.878.595.584 (~2,9 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (exportado con `nvidia-modelopt`, `FP8_DEFAULT_CFG`); el modelo base esta en BF16 |
| Idiomas soportados | en, ja, af, no |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base mas alla de la etiqueta `plamo3` y la necesidad de cargarlo con `trust_remote_code=True`, lo que indica que incorpora codigo personalizado en el repositorio. El modelo es un ajuste fino (finetune) de `pfnet/plamo-3-translate-2b`, al que se le anaden los pares afrikaans e ingles y noruego bokmal e ingles. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable es la cuantizacion FP8 realizada con `nvidia-modelopt` (configuracion `FP8_DEFAULT_CFG`), que segun el autor iguala la precision del modelo BF16 con una desviacion de aproximadamente 0,1 chrF++ y reduce a la mitad la memoria de pesos, pensada para GPUs Hopper y Blackwell.

## Capacidades

- Traduccion automatica entre ingles y afrikaans en ambas direcciones.
- Traduccion automatica entre ingles y noruego bokmal en ambas direcciones.
- Traduccion desde ingles hacia japones, neerlandes, aleman y ruso (evaluada en el modelo card, aunque con calidad variable).
- Generacion de texto orientada a tareas de traduccion (pipeline `translation`).
- Inferencia optimizada con vLLM y cuantizacion FP8.
- No consta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica EN-AF y AF-EN: el modelo puede procesar parrafos completos con calidad cercana a BF16 (60,17 y 60,88 chrF++ respectivamente), adecuado para localizar manuales de producto en afrikaans.
- Localizacion de contenido web al noruego bokmal: con 58,56 chrF++ en EN-NO, sirve para traducir textos de marketing o interfaces de usuario a noruego bokmal en pipelines automatizados.
- Traduccion de soporte al cliente EN-NO y NO-EN: integrable en un servicio de atencion que reciba consultas en noruego y las traduzca al ingles para su procesamiento, y viceversa, con la mejor calidad del conjunto evaluado (62,22 chrF++ en NO-EN).
- Procesamiento por lotes en GPU Hopper/Blackwell: al estar en FP8, permite desplegar el modelo en vLLM con menor huella de memoria, util para traducir grandes volumenes de texto en servidores con GPU de ultima generacion.
- Traduccion multilingue de soporte para japones, neerlandes, aleman y ruso: aunque con menor calidad (14,92 chrF++ en EN-JA), puede emplearse como primera pasada o en tareas de baja exigencia.
- Prototipado e investigacion en traduccion de bajos recursos: sirve como punto de partida para experimentar con ajustes finos de idiomas adicionales sobre la base PLaMo-3-Translate-2B.

## Benchmarks y rendimiento

Resultados de chrF++ publicados por el autor, con vLLM, `temp=0` y `repetition_penalty=1.05`, comparando BF16 frente a FP8:

| Direccion | BF16 | FP8 |
|---|---:|---:|
| Ingles -> Afrikaans (100 no vistas) | 60,19 | 60,17 |
| Afrikaans -> Ingles (100 no vistas) | 60,77 | 60,88 |
| Ingles -> Noruego (100 no vistas) | 58,41 | 58,56 |
| Noruego -> Ingles (100 no vistas) | 62,46 | 62,22 |
| Ingles -> Japones (50 opus-100) | 15,83 | 14,92 |
| Ingles -> Neerlandes (50 opus-100) | 50,24 | 50,16 |
| Ingles -> Aleman (50 opus-100) | 47,58 | 47,06 |
| Ingles -> Ruso (50 opus-100) | 43,84 | 43,74 |

No se han publicado resultados de benchmarks comparativos con otros modelos de traduccion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar en FP8, los pesos ocupan aproximadamente la mitad que en BF16; con unos 2,9 mil millones de parametros, el peso en FP8 ronda los 2,9 GB (el repositorio completo ocupa 3,4 GB).
- GPU recomendadas: el autor indica que la cuantizacion FP8 esta pensada para GPUs Hopper (H100) y Blackwell. El modelo base BF16 puede ejecutarse en GPUs con mayor memoria.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el tamano de pesos en FP8 es reducido, pero la compatibilidad con GPUs consumer no se especifica.
- Opciones de despliegue: vLLM (ejemplo oficial con `trust_remote_code=True` y `dtype="auto"`); no se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Eiki-AI/plamo-3-translate-2b-af-no-preview-FP8 | ~2,9 B | no disponible | en, ja, af, no | PLaMo Community License | FP8, ajuste comunitario |
| pfnet/plamo-3-translate-2b (base) | ~2,9 B | no disponible | en, ja | PLaMo Community License | BF16, modelo oficial de Preferred Networks |
| Otros modelos de traduccion de ~2-3 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental comunitario: no esta afiliado ni respaldado por Preferred Networks; su robustez en produccion no esta garantizada.
- La calidad en direcciones distintas de AF y NO es baja; por ejemplo, EN-JA obtiene 14,92 chrF++ en FP8, muy por debajo del resto.
- No se documentan sesgos conocidos, pero al ser un ajuste fino sobre un modelo base, puede heredar los del modelo original.
- Riesgo de alucinacion y de traducciones inexactas en textos especializados o dominios no cubiertos por el entrenamiento.
- Limitaciones de contexto e idioma: solo se declaran en, ja, af y no; la longitud de contexto no esta disponible.
- Restricciones de licencia: la PLaMo Community License impone condiciones para uso comercial y redistribucion, incluidos umbrales de registro e ingresos para despliegue comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio.
- La cuantizacion FP8 esta orientada a GPUs Hopper y Blackwell; en otras arquitecturas el soporte puede ser limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Eiki-AI/plamo-3-translate-2b-af-no-preview-FP8
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Licencia: LICENSE (incluida en el repositorio de Hugging Face)
