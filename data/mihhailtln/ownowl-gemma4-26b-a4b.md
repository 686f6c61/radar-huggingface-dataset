# MihhailTLN/ownowl-gemma4-26b-a4b

## Resumen

`MihhailTLN/ownowl-gemma4-26b-a4b` es un reempaquetado del modelo base `google/gemma-4-26B-A4B-it`, una arquitectura Mixture-of-Experts (MoE) de Gemma 4 con 25 mil millones de parametros totales y aproximadamente 3.800 millones de parametros activos por token. El autor, MihhailTLN, no ha entrenado ni modificado los pesos: la model card indica explicitamente que se trata de una redistribucion para una aplicacion concreta, no de un modelo nuevo.

El repositorio contiene una cuantizacion de 4 bits en formato MLX (group size 64) pensada para ejecucion totalmente local en iPhone dentro de la aplicacion OwnOwl, sin conexion a internet. Los pesos estan divididos en dos partes: `nonexpert.safetensors` agrupa todos los tensores excepto los expertos enrutados, mientras que el directorio `pack/` contiene los expertos enrutados byte a byte, dispuestos para lecturas directas desde el almacenamiento flash del telefono. Esa separacion es relevante porque permite hacer streaming de expertos desde disco en lugar de mantenerlos todos en memoria.

Su interes practico esta en que demuestra un flujo de despliegue de un MoE de 25B en hardware movil de gama alta mediante MLX, con licencia Apache 2.0 y un repositorio de 14,4 GB. No hay descargas ni likes registrados en el momento de la consulta, y la model card no aporta datos de benchmarks, idiomas exactos ni detalles de entrenamiento mas alla de la referencia al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, segun el modelo base Gemma 4 |
| Parametros totales | 25B (segun la model card del reempaquetado) |
| Parametros activos | 3,8B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX con group size 64 (unica variante publicada) |
| Idiomas soportados | multilingue (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`nonexpert.safetensors` + expertos enrutados en `pack/`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-4-26B-A4B-it`: un transformer con capas Mixture-of-Experts en las que cada token activa una fraccion reducida de los expertos, dando lugar a un ratio de aproximadamente 3,8B parametros activos sobre 25B totales. El sufijo "A4B" del nombre hace referencia a ese presupuesto de computo activo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF o DPO; esos datos corresponden a la model card del modelo base, que no forma parte de la informacion proporcionada.

El reempaquetado en si no introduce cambios en los pesos. La innovacion tecnica esta en el layout: los expertos enrutados se almacenan en `pack/` de forma que la aplicacion pueda leerlos directamente desde flash, lo que encaja con el patron de acceso disperso de un MoE (solo unos pocos expertos se consultan por token). El resto de tensores queda en `nonexpert.safetensors`. Ademas, el repositorio incluye `reference.json`, un conjunto de prompts fijos con tokens de salida de referencia usado por el autotest de la aplicacion para verificar la integridad de la inferencia en el dispositivo.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo instructivo base (`-it`).
- Razonamiento y respuesta a instrucciones, segun las capacidades del Gemma 4 26B A4B instructivo.
- Capacidades multilingues, aunque la lista concreta de idiomas no esta disponible.
- Ejecucion totalmente offline en iPhone dentro de la app OwnOwl, sin dependencia de red.
- Inferencia local con MLX, incluyendo lectura de expertos enrutados desde almacenamiento flash.
- Autoverificacion de integridad mediante `reference.json` (prompts y tokens de referencia).
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional offline en iPhone: la aplicacion OwnOwl descarga el repositorio en el primer arranque y ejecuta el modelo en local, de modo que el usuario dispone de un asistente multilingue sin enviar datos a servidores externos.
- Escenarios con requisitos de privacidad estrictos: al no requerir internet, el modelo es adecuado para entornos donde el texto del usuario no puede salir del dispositivo, como notas medicas o correspondencia personal.
- Despliegue en dispositivos de gama alta con memoria unificada: el layout de 4 bits MLX y el streaming de expertos desde flash permiten encajar un MoE de 25B en un telefono, algo inviable con pesos en precision completa.
- Verificacion de integridad en pipelines de distribucion de modelos: `reference.json` permite comprobar, tras la descarga, que los pesos se han transferido correctamente y que la inferencia produce los tokens esperados.
- Prototipado de aplicaciones on-device con MLX: el repositorio sirve como referencia para empaquetar modelos MoE con expertos separados en `pack/` y lecturas directas desde almacenamiento.
- Investigacion sobre inferencia MoE en hardware movil: la separacion entre tensores no-experto y expertos enrutados facilita medir latencia, uso de memoria y patrones de acceso a disco en un iPhone real.
- Uso educativo y demos de IA local: al estar bajo Apache 2.0, el modelo puede redistribuirse y modificarse en materiales docentes o pruebas de concepto sin restricciones de licencia adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del reempaquetado no incluye metricas (MMLU, HumanEval, GSM8K u otras), ni datos de latencia o throughput en el dispositivo.

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio ocupa 14,4 GB en cuantizacion de 4 bits; la huella en ejecucion depende de cuantos expertos se cargan simultaneamente y del buffer KV, dato no disponible.
- Hardware objetivo: iPhone de gama alta con suficiente memoria unificada y almacenamiento para alojar el repositorio y el directorio `pack/`.
- Compatibilidad con GPU de escritorio (A100, H100, RTX 4090): no disponible; el formato MLX esta orientado al ecosistema Apple.
- Opciones de despliegue: libreria MLX y la aplicacion OwnOwl; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| ownowl-gemma4-26b-a4b (este) | 25B | 3,8B | no disponible | 4 bits MLX (gs 64) | Apache 2.0 | MLX safetensors |
| google/gemma-4-26B-A4B-it | 25B | 3,8B | no disponible | no disponible | Apache 2.0 | no disponible |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base del que deriva, del que se diferencia exclusivamente por la cuantizacion MLX de 4 bits y el reempaquetado para iOS. No se dispone de informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo nuevo: cualquier limitacion del modelo base Gemma 4 26B A4B instructivo se hereda intacta.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas en esta ficha que lo cuantifiquen.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; deben consultarse los terminos y la model card del modelo base.
- Contexto e idiomas: la longitud de contexto y la lista exacta de idiomas no estan disponibles, lo que impide garantizar cobertura para casos de uso multilingues especificos.
- Restricciones de licencia: la licencia es Apache 2.0, pero la model card remite a los terminos completos del modelo base; conviene revisarlos antes de un uso comercial.
- Dependencia de plataforma: el formato MLX y el layout de `pack/` estan pensados para iPhone y el ecosistema Apple; no hay garantia de funcionamiento en otras plataformas.
- Madurez: el repositorio no registra descargas ni likes, y la unica validacion documentada es el autotest de la aplicacion mediante `reference.json`.
- Rendimiento en dispositivo: no hay datos publicados de latencia, consumo energetico ni uso de memoria en un iPhone real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MihhailTLN/ownowl-gemma4-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
